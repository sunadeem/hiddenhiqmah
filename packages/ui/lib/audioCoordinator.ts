// Coordinates the independent audio channels (Quran recitation + Adhan) so that
// only one ever plays at a time. The two live in separate React contexts and the
// provider nesting means neither can cleanly reach the other, so they rendezvous
// here: each registers a stop() callback, and whoever starts playback claims focus,
// stopping every other channel. Stop callbacks must NOT re-claim, so there's no loop.

type Stopper = () => void;

const channels = new Map<string, Stopper>();

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
}
