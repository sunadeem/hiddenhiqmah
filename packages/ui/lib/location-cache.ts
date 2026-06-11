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
