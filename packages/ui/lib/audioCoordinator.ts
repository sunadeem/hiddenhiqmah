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
  begin(title: string): void;
  end(): void;
}

let playback: PlaybackServiceHook | null = null;

/** Installed by native setup only; the web never calls this, so it stays null. */
export function setPlaybackServiceHook(hook: PlaybackServiceHook): void {
  playback = hook;
}

const channels = new Map<string, Stopper>();

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

/** Register a channel's stop() handler. Returns an unregister function. */
export function registerAudioChannel(id: string, stop: Stopper): () => void {
  channels.set(id, stop);
  return () => {
    if (channels.get(id) === stop) channels.delete(id);
  };
}

/** Claim audio focus for `id`, stopping every other registered channel. */
export function claimAudioFocus(id: string): void {
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
  playback?.begin(CHANNEL_TITLES[id] ?? "Playing");
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
