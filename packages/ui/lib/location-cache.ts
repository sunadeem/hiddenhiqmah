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
 * Consecutive-failure record for the position fix. A THIRD key on purpose:
 * `cachedAt` must keep meaning "the last time a fix actually succeeded" and
 * ATTEMPT_KEY must keep meaning "the last time we asked". The gap between those
 * two is the only diagnostic this subsystem has — it is what proved the
 * 156-minute staleness bug — so nothing may start writing either one on failure.
 */
const FAIL_KEY = "hiqmah-location-fail";

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

/**
 * Broadcast when how much we TRUST the cached fix has changed — the place itself
 * may be identical. Separate from LOCATION_CHANGED_EVENT because the surfaces
 * that care are different: a screen re-reads the cache on "changed", but the
 * staleness qualifier has to appear and disappear on nothing but a run of failed
 * fixes. Lives here, in the leaf module, for the same reason as the event above.
 */
export const LOCATION_CONFIDENCE_EVENT = "hiqmah:location-confidence";

export type CachedLocation = {
  lat: number;
  lng: number;
  city: string;
  country: string;
  display: string;
  cachedAt: number;
  /**
   * IANA zone the device reported when this fix was stored. Optional: only the
   * Android refresher writes it (see ANDROID_TUNING in
   * apps/web/src/lib/mobile/location-refresh.ts), and the other cache writers
   * never have. Absent means "no zone signal" — never "same zone".
   */
  tz?: string;
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
  broadcastConfidenceChange(() => {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ...loc, cachedAt: Date.now() })
      );
    } catch {
      // ignore
    }
  });
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
 *
 * @param patch fields to refresh alongside the timestamp. Only `tz` — a fix that
 *   lands near the anchor CONFIRMS the anchor, so the zone recorded against it
 *   has to move to the device's current one. Without that, a user who crossed a
 *   zone boundary a few km away (or re-set the clock by hand) would trip the
 *   zone warning and then have no way to clear it: their "Update location" tap
 *   succeeds, lands here, and re-writes the stale zone forever.
 */
export function touchCachedLocation(patch?: Pick<Partial<CachedLocation>, "tz">): void {
  const cached = getCachedLocation();
  if (!cached) return;
  setCachedLocation({ ...cached, ...patch });
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

/* ─────────────────── failure record + back-off ladder ─────────────────── */

export type LocationFailure = {
  /** Consecutive SOFT failures (timeout / position unavailable). */
  n: number;
  /** When the last failure of either kind was recorded. */
  at: number;
  /** The last failure was one more attempts cannot fix (location services off). */
  hard: boolean;
};

const NO_FAILURE: LocationFailure = { n: 0, at: 0, hard: false };

export function getLocationFailure(): LocationFailure {
  if (typeof window === "undefined") return NO_FAILURE;
  try {
    const raw = localStorage.getItem(FAIL_KEY);
    if (!raw) return NO_FAILURE;
    const f = JSON.parse(raw) as Partial<LocationFailure>;
    return {
      n: typeof f.n === "number" && f.n > 0 ? f.n : 0,
      at: typeof f.at === "number" ? f.at : 0,
      hard: f.hard === true,
    };
  } catch {
    return NO_FAILURE;
  }
}

/**
 * @param opts.advanceLadder whether this failure counts towards the SILENT
 *   back-off. False for a user-initiated retry, and that distinction matters:
 *   `n` indexes how long to stay quiet before the app next asks by itself, and a
 *   user's taps are a different budget from that. Without this, two users stuck
 *   in the same basement diverge — the one who taps "Update location" three
 *   times pushes `n` from 2 to 5 and buys himself the full 30-minute silence,
 *   while the one who does nothing stays on the 5-minute rung. Both walk outside
 *   at t+10min and the user who actively tried to fix it is the one still
 *   showing the wrong city. `at`/`hard` ARE still refreshed, because those two
 *   describe the CURRENT state of the world and the on-screen warning reads them.
 */
export function recordLocationFailure(
  kind: "soft" | "hard",
  opts?: { advanceLadder?: boolean }
): void {
  if (typeof window === "undefined") return;
  const advanceLadder = opts?.advanceLadder !== false;
  broadcastConfidenceChange(() => {
    const prev = getLocationFailure();
    // A HARD failure does not advance the soft ladder either: retrying sooner
    // cannot help a phone whose location services are switched off, so it stays
    // at the flat 30-minute window and only flips the flag that names the remedy.
    const next: LocationFailure = {
      n: kind === "hard" || !advanceLadder ? prev.n : prev.n + 1,
      at: Date.now(),
      hard: kind === "hard",
    };
    try {
      localStorage.setItem(FAIL_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  });
}

export function clearLocationFailures(): void {
  if (typeof window === "undefined") return;
  broadcastConfidenceChange(() => {
    try {
      localStorage.removeItem(FAIL_KEY);
    } catch {
      // ignore
    }
  });
}

/**
 * How long to wait before the next SILENT attempt, indexed by consecutive soft
 * failures. A failed attempt must not buy the same 30 minutes of silence a
 * successful one does — on hardware where the fix routinely times out, one
 * failure used to leave the app showing the wrong city for hours.
 *
 * It climbs back to REFRESH_MS within the hour, so a phone that genuinely cannot
 * see the sky costs four extra attempts per episode and then nothing.
 */
export const FAILURE_BACKOFF_MS = [2 * 60_000, 5 * 60_000, 15 * 60_000, REFRESH_MS];

export function attemptWindowMs(f: LocationFailure = getLocationFailure()): number {
  if (f.hard) return REFRESH_MS; // nothing more frequent attempts can fix
  if (f.n <= 0) return REFRESH_MS; // last outcome was a success
  return FAILURE_BACKOFF_MS[Math.min(f.n, FAILURE_BACKOFF_MS.length) - 1];
}

/* ───────────────────────── confidence / warning ───────────────────────── */

export type LocationWarning =
  | { kind: "none" }
  /** The device's time zone no longer matches the one the fix was taken in. */
  | { kind: "zone"; display: string; since: number }
  /** Old fix + a live run of failures: we do not know where the user is. */
  | { kind: "unconfirmed"; display: string; since: number }
  /** Location services are off — the remedy is in the OS, not in this app. */
  | { kind: "disabled"; display: string; since: number };

/**
 * How old a fix must be before an unconfirmed cache is worth warning about.
 * Long enough that it cannot fire on a healthy phone (twelve consecutive
 * 30-minute refresh windows producing nothing is a broken acquisition path, not
 * a quiet afternoon), short enough to beat FRESH_MS — so the user is told the
 * location is unconfirmed BEFORE the cache silently expires and the app falls
 * back to Makkah / "Set your location" with no explanation.
 */
export const UNCONFIRMED_WARN_MS = 6 * 60 * 60 * 1000;
/** One transient miss is not a story. Two is a pattern. */
export const UNCONFIRMED_WARN_FAILURES = 2;

/**
 * How long a recorded failure keeps describing the present.
 *
 * Must be strictly LONGER than the widest attempt window (REFRESH_MS, which is
 * where both the top of the ladder and every hard failure sit), or the warning
 * races the thing that refreshes it: attempts are only made when the app comes
 * to the foreground, so an app left open for 40 minutes with location switched
 * off has a 40-minute-old failure record and no opportunity to renew it — and at
 * exactly REFRESH_MS the warning would drop, handing the user back the confident
 * wrong city this whole change exists to stop showing them.
 *
 * Still far short of the multi-hour gap that a cold open after an overnight
 * close produces, which is the case the recency test was added for.
 */
export const FAILURE_CURRENT_MS = 2 * REFRESH_MS;

function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

/**
 * Whether the cached fix should be qualified on screen, and how.
 *
 * Deliberately NOT triggered by staleness alone. The 27 km of travel that
 * exposed this bug moves Fajr by one minute and the Qiblah bearing by 0.026° —
 * a warning that fired on that would be noise every day, and noise is exactly
 * what guarantees it gets ignored on the day the same mechanism strands someone
 * a continent away. Each trigger below is a case where the output is wrong by
 * hours or by degrees.
 */
export function getLocationWarning(): LocationWarning {
  if (typeof window === "undefined") return { kind: "none" };
  const cached = getCachedLocation();
  if (!cached) return { kind: "none" };
  const fail = getLocationFailure();
  const now = Date.now();

  // A — CERTAINTY, so it outranks the rest. The OS sets the zone from the cell
  // network, which means this signal keeps working precisely when GNSS does not.
  // It is also the silent killer: computePrayerTimes derives UTC instants from
  // the coordinates and formats them in the DEVICE's zone, so one zone of travel
  // yields times that are wrong by exactly an hour and look entirely plausible.
  if (cached.tz) {
    const now_tz = deviceTimeZone();
    if (now_tz && now_tz !== cached.tz) {
      return { kind: "zone", display: cached.display, since: cached.cachedAt };
    }
  }

  // C — the remedy is a system toggle, not "go near a window". Telling someone
  // to stand by a window when their location switch is off is the same class of
  // lie as a compass reporting high accuracy while pointing 63° wrong.
  if (fail.hard && now - fail.at <= FAILURE_CURRENT_MS) {
    return { kind: "disabled", display: cached.display, since: cached.cachedAt };
  }

  // B — PROBABILITY. All three clauses are load-bearing; the last one is what
  // stops a cold-open flash: no attempt is ever stamped while the app is closed,
  // so without it, opening the app on a nine-hour-old cache carrying last
  // night's failures would show the banner instantly and then rip it away three
  // seconds later when the morning fix succeeds.
  if (
    now - cached.cachedAt >= UNCONFIRMED_WARN_MS &&
    fail.n >= UNCONFIRMED_WARN_FAILURES &&
    now - fail.at <= FAILURE_CURRENT_MS
  ) {
    return { kind: "unconfirmed", display: cached.display, since: cached.cachedAt };
  }

  return { kind: "none" };
}

/**
 * Run a mutation and tell the app if it changed what the user should be told.
 * Every warning surface listens for this: the cached PLACE often does not move
 * when confidence in it does, so LOCATION_CHANGED_EVENT never fires for it.
 */
function broadcastConfidenceChange(mutate: () => void): void {
  const before = getLocationWarning().kind;
  mutate();
  if (typeof window === "undefined") return;
  if (getLocationWarning().kind !== before) {
    window.dispatchEvent(new Event(LOCATION_CONFIDENCE_EVENT));
  }
}

/**
 * Human timestamp for "last confirmed". cachedAt can be arbitrarily old —
 * nothing caps it and getCachedLocation keeps serving it past FRESH_MS — so a
 * bare clock time would read as today's.
 */
export function formatConfirmedAt(ts: number): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const today = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return time;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameDay(d, yesterday)) return `yesterday ${time}`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
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
