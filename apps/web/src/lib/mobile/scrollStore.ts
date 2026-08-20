/**
 * Per-route scroll offsets for back-navigation restoration.
 *
 * In-memory only, deliberately NOT mirrored to sessionStorage: a WebView process
 * restart destroys the SPA history too (the app cold-starts to its launch route),
 * so a persisted offset could only ever be applied to a FRESH FORWARD navigation
 * — which must start at the top. Persisting would manufacture the exact bug the
 * restore is meant to avoid, and it keeps the memory bound trivial: this Map is
 * the only retaining structure and it is capped.
 */

// ~40 fixed routes exist in SECTION_TITLES; the only open-ended keys are
// /quran/{1..114} and /hadith/{collection}/{book}. 50 entries is a few KB.
const MAX = 50;

const map = new Map<string, number>();

export function set(key: string, y: number): void {
  map.delete(key); // re-insert so Map iteration order stays LRU-by-recency
  map.set(key, y);
  if (map.size > MAX) {
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }
}

export function get(key: string): number | undefined {
  return map.get(key);
}

/** Test-only (scripts/verify-scroll-store.mts). */
export function __size(): number {
  return map.size;
}

/** Test-only (scripts/verify-scroll-store.mts). */
export function __clear(): void {
  map.clear();
}

/**
 * pathname + search. `usePathname()` alone would collide /duas with
 * /duas?tab=guidance, and /muslim-daily with /muslim-daily?tab=checklist — a
 * separate More-menu entry that users reach and leave independently.
 */
export function keyOf(l: Location | URL): string {
  return l.pathname + l.search;
}
