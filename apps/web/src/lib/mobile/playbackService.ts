import { Capacitor, registerPlugin } from "@capacitor/core";
import { setPlaybackServiceHook } from "@hidden-hiqmah/ui/lib/audioCoordinator";

/**
 * Keeps audio audible once the app is backgrounded. ANDROID ONLY.
 *
 * Measured with `adb shell dumpsys audio`: backgrounded, with no foreground
 * service of an audio type, Android reports
 *
 *     AudioHardening background playback would be muted for
 *     com.hiddenhiqmah.app, level: partial
 *
 * — and duly mutes us. The adhan sounds at the prayer time, by definition a
 * moment nobody is looking at the screen, so this is the difference between the
 * app doing its one job and failing silently.
 *
 * The service plays nothing. The WebView keeps playing the audio exactly as on
 * web and iOS; the service exists so we are ALLOWED to keep making sound, and
 * carries the notification Android requires of any foreground service.
 *
 * Lives here rather than in packages/ui because that package is deliberately
 * Capacitor-free (it serves the website too) — it exposes a hook and this
 * installs the implementation.
 */

type PlaybackBridgePlugin = {
  start(options: { title: string }): Promise<void>;
  stop(): Promise<void>;
};

const PlaybackBridge = registerPlugin<PlaybackBridgePlugin>("PlaybackBridge");

/**
 * iOS needs none of this — UIBackgroundModes:audio plus the AVAudioSession in
 * AppDelegate already cover it — so the hook is installed on Android only and
 * the coordinator's optional call does nothing everywhere else.
 */
export function installPlaybackService(): void {
  if (!Capacitor.isNativePlatform()) return;
  if (Capacitor.getPlatform() !== "android") return;
  setPlaybackServiceHook({
    // Fire and forget: audio must never wait on, or be blocked by, the service.
    // A failure here costs background audibility, not playback itself.
    begin(title) {
      void PlaybackBridge.start({ title }).catch(() => {});
    },
    end() {
      void PlaybackBridge.stop().catch(() => {});
    },
  });
}
