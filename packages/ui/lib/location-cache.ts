/**
 * Cross-page location cache. Once the user grants location once (on the
 * home screen via Capacitor's plugin), every other surface that wants
 * prayer times / Qibla can read from this cache instead of triggering
 * its own permission dialog.
 *
 * Also tracks the last permission ANSWER so pages know not to re-prompt
 * users who already denied.
 */

const CACHE_KEY = "hiqmah-cached-location";
const STATE_KEY = "hiqmah-location-state";
const ATTEMPT_KEY = "hiqmah-location-attempt";

/**
 * Broadcast when the cached location has been replaced with a new place.
 *
 * Lives here — the leaf cache module — rather than next to the refresher that
 * dispatches it: every surface that reads the cache wants to listen, including
 * pages that ship to the WEBSITE (/prayer-times, Qiblah). Importing it from the
 * native refresher would drag that module's whole graph (the notification
 * scheduler + its reminder/inspiration JSON) into public web chunks.
 */
export const LOCATION_CHANGED_EVENT = "hiqmah:location-changed";

export type CachedLocation = {
  lat: number;
  lng: number;
  city: string;
  country: string;
  display: string;
  cachedAt: number;
};

export type LocationState = "granted" | "denied" | null;

const FRESH_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * How long a cached fix may go unchecked before a SILENT background refresh is
 * worth a GPS poll. Deliberately much shorter than FRESH_MS: FRESH_MS answers
 * "is this good enough to display without prompting", REFRESH_MS answers
 * "should we quietly re-check where the user actually is". Half an hour is long
 * enough that app-switching never costs a fix, short enough that a flight or a
 * long drive is picked up on the first foreground after arriving.
 */
export const REFRESH_MS = 30 * 60 * 1000; // 30 minutes

export function getCachedLocation(): CachedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedLocation;
  } catch {
    return null;
  }
}

export function getFreshCachedLocation(): CachedLocation | null {
  const cached = getCachedLocation();
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > FRESH_MS) return null;
  return cached;
}

export function setCachedLocation(loc: Omit<CachedLocation, "cachedAt">): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...loc, cachedAt: Date.now() })
    );
  } catch {
    // ignore
  }
}

/** Age of the cached fix in ms, or null when nothing is cached. */
export function getCacheAgeMs(): number | null {
  const cached = getCachedLocation();
  return cached ? Date.now() - cached.cachedAt : null;
}

/**
 * Whether it's worth re-checking the device's position. An absent cache counts
 * as stale — there is nothing to trust yet.
 */
export function isCacheStale(maxAgeMs: number = REFRESH_MS): boolean {
  const age = getCacheAgeMs();
  return age === null || age > maxAgeMs;
}

/**
 * Re-stamp the cached fix as checked-just-now WITHOUT moving its coordinates.
 * Used after a refresh that found the user hadn't meaningfully moved: it stops
 * us polling GPS on every foreground, while keeping the stored point as the
 * ANCHOR the prayer times / notifications were actually built for — so a slow
 * cumulative drift is still measured against that anchor and eventually trips
 * the "moved" threshold.
 */
export function touchCachedLocation(): void {
  const cached = getCachedLocation();
  if (!cached) return;
  setCachedLocation(cached);
}

/**
 * Record that we just ASKED the device where it is, regardless of whether the
 * fix arrives. Only a successful fix writes/re-stamps the cache, so without this
 * a phone that can't see the sky (basement, subway, plane, transient CoreLocation
 * error) leaves the cache stale and re-arms the GPS on *every* foreground — the
 * exact battery cost the refresh window exists to avoid.
 */
export function markLocationAttempt(): void {
  try {
    localStorage.setItem(ATTEMPT_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

/** Whether a position was requested (successfully or not) within `within` ms. */
export function attemptedRecently(within: number = REFRESH_MS): boolean {
  try {
    return Date.now() - Number(localStorage.getItem(ATTEMPT_KEY) || 0) < within;
  } catch {
    return false;
  }
}

/**
 * Great-circle (haversine) distance in km between two coordinates. Pure — used
 * to decide whether the user has moved far enough for prayer times to change.
 */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // mean Earth radius, km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function getLocationState(): LocationState {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STATE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setLocationState(state: Exclude<LocationState, null>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATE_KEY, state);
  } catch {
    // ignore
  }
}
