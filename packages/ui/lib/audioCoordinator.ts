// Coordinates the independent audio channels (Quran recitation + Adhan) so that
// only one ever plays at a time. The two live in separate React contexts and the
// provider nesting means neither can cleanly reach the other, so they rendezvous
// here: each registers a stop() callback, and whoever starts playback claims focus,
// stopping every other channel. Stop callbacks must NOT re-claim, so there's no loop.

type Stopper = () => void;

/**
 * Android needs a foreground service running for audio to stay audible once the
 * app is backgrounded (see apps/web/src/lib/mobile/playbackService.ts for the
 * measurement). That needs Capacitor — which this package deliberately does not
 * depend on, because it also serves the website. So the native layer INJECTS the
 * implementation here at startup and everything else stays platform-free.
 */
export interface PlaybackServiceHook {
  begin(title: string, meta?: PlaybackMeta): void;
  end(): void;
  /** Update playing/paused + position (and duration, which is what makes a
   *  scrubber appear) without re-sending the rest of the metadata. */
  setState?(playing: boolean, positionMs?: number, durationMs?: number): void;
  /**
   * Register a sink for transport commands coming from OUTSIDE the app — the
   * lock-screen player, the notification-shade media card, a Bluetooth button.
   * Android only; on iOS WKWebView routes these to the audio element itself.
   */
  onTransport?(handler: (action: TransportAction, positionMs?: number) => void): void;
}

/**
 * What the lock screen / shade media card display.
 *
 * Mirrors the fields `navigator.mediaSession` already gets on iOS, so both
 * platforms show the same thing: which sūrah and āyah, the reciter, and a real
 * scrubber. Android only draws a scrubber when it knows the DURATION, which is
 * why that field is load-bearing rather than decorative.
 */
export type PlaybackMeta = {
  /** Overrides the generic channel title, e.g. "Al-Baqarah — Verse 1". */
  title?: string;
  /** The reciter. */
  subtitle?: string;
  /** Album line, e.g. "Surah Al-Baqarah (البقرة)". */
  album?: string;
  durationMs?: number;
  positionMs?: number;
};

export type TransportAction = "play" | "pause" | "stop" | "next" | "previous" | "seek";

/**
 * Optional remote controls a channel can expose, so a lock-screen or Bluetooth
 * button can drive it. A channel that registers none simply can't be controlled
 * from outside the app — which is the honest outcome, not a crash.
 */
export type ChannelControls = {
  play?: () => void;
  pause?: () => void;
  next?: () => void;
  previous?: () => void;
  seek?: (positionMs: number) => void;
};

let playback: PlaybackServiceHook | null = null;

/** Installed by native setup only; the web never calls this, so it stays null. */
export function setPlaybackServiceHook(hook: PlaybackServiceHook): void {
  playback = hook;
  hook.onTransport?.(handleTransport);
}

const channels = new Map<string, Stopper>();
const controls = new Map<string, ChannelControls>();

/**
 * Which channel currently holds focus, or null when nothing is playing.
 *
 * The coordinator is the one place every channel already passes through, so it
 * is also the right place to raise and drop Android's playback foreground
 * service — see playbackService.ts for why that service has to exist. Hooking
 * it here means both Quran recitation and the adhan get background audio with
 * no per-channel wiring, and any channel added later inherits it.
 */
let holder: string | null = null;

const CHANNEL_TITLES: Record<string, string> = {
  quran: "Quran recitation",
  adhan: "Adhan",
};

/** Register a channel's stop() handler, and optionally the remote controls that
 *  let a lock-screen / Bluetooth button drive it. Returns an unregister fn. */
export function registerAudioChannel(
  id: string,
  stop: Stopper,
  channelControls?: ChannelControls
): () => void {
  channels.set(id, stop);
  if (channelControls) controls.set(id, channelControls);
  return () => {
    if (channels.get(id) === stop) {
      channels.delete(id);
      controls.delete(id);
    }
  };
}

/**
 * Route a transport command to whichever channel currently holds focus.
 *
 * Installed once by the native layer. Commands are dropped when nothing holds
 * focus, which is correct: a stray Bluetooth press with no audio playing should
 * do nothing rather than resurrect the last thing that played.
 */
function handleTransport(action: TransportAction, positionMs?: number): void {
  if (!holder) return;
  const c = controls.get(holder);
  if (!c) return;
  switch (action) {
    case "play":
      c.play?.();
      break;
    case "pause":
      c.pause?.();
      break;
    case "stop":
      channels.get(holder)?.();
      break;
    case "next":
      c.next?.();
      break;
    case "previous":
      c.previous?.();
      break;
    case "seek":
      if (typeof positionMs === "number") c.seek?.(positionMs);
      break;
  }
}

/** Claim audio focus for `id`, stopping every other registered channel. */
export function claimAudioFocus(id: string, meta?: PlaybackMeta): void {
  channels.forEach((stop, key) => {
    if (key !== id) {
      try {
        stop();
      } catch {
        // a channel failing to stop must not block the one starting
      }
    }
  });
  holder = id;
  playback?.begin(meta?.title ?? CHANNEL_TITLES[id] ?? "Playing", meta);
}

/**
 * Tell the coordinator a channel has stopped, so the foreground service can be
 * dropped once nothing is playing.
 *
 * Guarded on `holder`: a channel stopping because someone ELSE claimed focus
 * must not tear down the service the new channel just raised. Only whoever
 * currently holds focus can release it.
 */
export function releaseAudioFocus(id: string): void {
  if (holder !== id) return;
  holder = null;
  playback?.end();
}

/**
 * Raise/drop ONLY the Android foreground service, without touching focus
 * ownership or stopping other channels.
 *
 * Needed because the service must track "is sound actually coming out", which
 * is not the same question as "who owns focus". Focus is claimed once when a
 * channel starts and released when it stops for good; but audio also ends by
 * itself, and resumes from a lock-screen or headphone button that never goes
 * through our toggle.
 *
 * FOUND ON A REAL DEVICE: every natural end leaked the service. Both channels
 * released focus only from an explicit stop() the user rarely presses, so when
 * recitation finished — or the adhan finished, backgrounded, at the prayer time
 * it exists for — the service stayed foreground with an ONGOING|NO_CLEAR
 * notification the user could not swipe away.
 *
 * Deliberately NOT routed through claimAudioFocus: that stops every other
 * channel, which is right when a user starts something and wrong when audio
 * merely resumes.
 */
export function noteAudioAudible(id: string, meta?: PlaybackMeta): void {
  if (holder !== id) return;
  playback?.begin(meta?.title ?? CHANNEL_TITLES[id] ?? "Playing", meta);
}

/** Push playing/paused + position to the lock screen without re-sending metadata. */
export function notePlaybackState(
  id: string,
  playing: boolean,
  positionMs?: number,
  durationMs?: number
): void {
  if (holder !== id) return;
  playback?.setState?.(playing, positionMs, durationMs);
}

/** Sound has stopped coming out, but `id` keeps focus so it can resume. */
export function noteAudioSilent(id: string): void {
  if (holder !== id) return;
  playback?.end();
}
