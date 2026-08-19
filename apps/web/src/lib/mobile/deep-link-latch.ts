/**
 * A one-slot mailbox for a deep link that arrived before anything was listening.
 *
 * `registerDeepLinkHandler` runs from MobileShell's own effect, but the screens
 * that consume a link mount three state-flips later — the native shell chunk
 * loads, `useIsNative()` flips, then the home style resolves. Measured on a cold
 * start from the qibla widget: the route was broadcast at 832ms and the listener
 * attached at 1147ms. A DOM event has no replay, so the tap was dropped on the
 * floor; instrumented cold starts lost it ~80% of the time.
 *
 * So the route is parked here as well as broadcast, and a consumer that mounts
 * late drains it instead of missing it. Consumers MUST also drain on the event
 * path — a link taken live that stays parked would re-fire the next time that
 * screen mounts.
 *
 * Deliberately its own module rather than living in deeplinks.ts: consumers can
 * import it without dragging @capacitor/app into the website's bundle.
 */

/**
 * A parked route older than this is stale — it belongs to a boot the user has
 * long since moved on from, and replaying it would reopen the compass minutes
 * later on an unrelated navigation.
 */
const PENDING_TTL_MS = 15_000;

let parked: { route: string; at: number } | null = null;

/** Park a route for a consumer that may not exist yet. Last one wins. */
export function parkDeepLink(route: string): void {
  parked = { route, at: Date.now() };
}

/** Read and clear the parked route. Returns null if empty or stale. */
export function takeParkedDeepLink(): string | null {
  const held = parked;
  parked = null;
  if (!held) return null;
  return Date.now() - held.at > PENDING_TTL_MS ? null : held.route;
}
