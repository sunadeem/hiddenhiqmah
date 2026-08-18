import { Capacitor, registerPlugin } from "@capacitor/core";
import {
  setPlaybackServiceHook,
  type TransportAction,
} from "@hidden-hiqmah/ui/lib/audioCoordinator";

/**
 * Background audibility + the system media controls. ANDROID ONLY.
 *
 * Two jobs, both native-only, both measured on a real device rather than assumed:
 *
 * 1. BACKGROUND AUDIO. `adb shell dumpsys audio` on a backgrounded app with no
 *    foreground service of an audio type reported
 *
 *        AudioHardening background playback would be muted for
 *        com.hiddenhiqmah.app, level: partial
 *
 *    The adhan sounds at the prayer time — by definition a moment nobody is
 *    looking at the screen — so this is the difference between the app doing its
 *    one job and failing silently.
 *
 * 2. THE LOCK-SCREEN / SHADE PLAYER. `QuranAudioContext` already sets
 *    `navigator.mediaSession` metadata, and iOS WKWebView forwards that to the
 *    system. **The Android WebView does not.** Measured: `dumpsys media_session`
 *    reported "Sessions Stack - have 0 sessions" mid-playback, so there was no
 *    lock-screen player, no notification-shade media card, and no title over
 *    Bluetooth. The session has to be published natively — PlaybackService does
 *    it, and this is the bridge.
 *
 * The service plays nothing. The WebView keeps playing audio exactly as on web
 * and iOS; native only supplies permission and a remote control, so transport
 * commands arrive here as EVENTS and the existing JS decides what they mean.
 *
 * Lives here rather than in packages/ui because that package is deliberately
 * Capacitor-free (it serves the website too) — it exposes a hook, this installs
 * the implementation.
 */

type PlaybackBridgePlugin = {
  start(options: {
    title: string;
    subtitle?: string;
    album?: string;
    durationMs?: number;
    positionMs?: number;
    playing?: boolean;
  }): Promise<void>;
  setState(options: {
    playing: boolean;
    positionMs?: number;
    durationMs?: number;
  }): Promise<void>;
  stop(): Promise<void>;
  addListener(
    event: "transport",
    cb: (e: { action: TransportAction; positionMs?: number }) => void
  ): Promise<{ remove: () => Promise<void> }>;
};

const PlaybackBridge = registerPlugin<PlaybackBridgePlugin>("PlaybackBridge");

/**
 * iOS needs none of this — UIBackgroundModes:audio plus the AVAudioSession in
 * AppDelegate cover background audio, and WKWebView publishes Now Playing by
 * itself — so the hook is installed on Android only and the coordinator's
 * optional calls do nothing everywhere else.
 */
export function installPlaybackService(): void {
  if (!Capacitor.isNativePlatform()) return;
  if (Capacitor.getPlatform() !== "android") return;

  setPlaybackServiceHook({
    // Fire and forget throughout: audio must never wait on, or be blocked by,
    // the service. A failure here costs background audibility or a lock-screen
    // control, not playback itself.
    begin(title, meta) {
      void PlaybackBridge.start({
        title,
        ...(meta?.subtitle ? { subtitle: meta.subtitle } : {}),
        ...(meta?.album ? { album: meta.album } : {}),
        ...(typeof meta?.durationMs === "number" ? { durationMs: meta.durationMs } : {}),
        ...(typeof meta?.positionMs === "number" ? { positionMs: meta.positionMs } : {}),
        playing: true,
      }).catch(() => {});
    },
    setState(playing, positionMs, durationMs) {
      void PlaybackBridge.setState({
        playing,
        ...(typeof positionMs === "number" ? { positionMs } : {}),
        ...(typeof durationMs === "number" ? { durationMs } : {}),
      }).catch(() => {});
    },
    end() {
      void PlaybackBridge.stop().catch(() => {});
    },
    onTransport(handler) {
      void PlaybackBridge.addListener("transport", (e) => {
        handler(e.action, e.positionMs);
      }).catch(() => {});
    },
  });
}
