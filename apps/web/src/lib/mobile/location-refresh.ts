/**
 * Keep prayer times (and the adhan/prayer notifications built from them) on the
 * user's CURRENT location.
 *
 * The rest of the app only ever CONSUMES the shared location cache: the home
 * card and /prayer-times short-circuit on a <24h cached fix, and the notifica-
 * tion scheduler reads the cache without ever asking for one. That meant a user
 * who travelled kept the old city's prayer times — and the old city's adhan
 * times — for up to a day. This module is the one place that re-checks the
 * device's position and, when it has genuinely moved, rewrites the cache and
 * rebuilds the schedule.
 *
 * Foreground-triggered only (MobileShell's launch pass + appStateChange, or the
 * user tapping Auto-locate) — no watchPosition, no polling: a background GPS
 * watch would be the app's biggest battery cost for a value that changes a few
 * times a year.
 */

import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import {
  getCachedLocation,
  setCachedLocation,
  touchCachedLocation,
  setLocationState,
  isCacheStale,
  markLocationAttempt,
  attemptedRecently,
  attemptWindowMs,
  recordLocationFailure,
  clearLocationFailures,
  distanceKm,
  REFRESH_MS,
  LOCATION_CHANGED_EVENT,
} from "@hidden-hiqmah/ui/lib/location-cache";
import { formatLocation, reverseGeocode } from "@hidden-hiqmah/ui/lib/location";
import { scheduleAllNotifications } from "@/lib/mobile/notifications";
import { syncWidgetData } from "@/lib/mobile/widgets";

// The event name lives in the leaf cache module so web-only surfaces can listen
// without importing this (native) module; re-exported for existing importers.
export { LOCATION_CHANGED_EVENT };

/**
 * How far the user must be from the cached fix before we treat it as a new
 * place. Prayer times shift by roughly a minute per ~20 km of east/west travel
 * (and Fajr/Isha more than that north/south), so 25 km is the point where the
 * printed times actually start to disagree — while staying well above a normal
 * commute, a day out, or plain GPS jitter, so an ordinary week never churns the
 * schedule.
 */
const MOVED_KM = 25;
/** A silent refresh must never hang app-open — give up and keep the old fix. */
const FIX_TIMEOUT_MS = 12_000;
/** A fix from the last few minutes is plenty for a city-scale question. */
const FIX_MAX_AGE_MS = 5 * 60 * 1000;
/**
 * reverseGeocode is a bare fetch to Nominatim with no timeout of its own, so it
 * inherits WKWebView's ~60s default — and a captive portal / roaming SIM on the
 * day you land is exactly where it hangs. The label is cosmetic; bound it.
 */
const GEO_TIMEOUT_MS = 5_000;
/**
 * Hard ceiling on one refresh's slot in the queue. A forced refresh blocks on
 * Geolocation.requestPermissions until the user answers the OS dialog — if they
 * background the app instead, everything queued behind it (including the shell's
 * notification refill) would wait forever. Generous: 12s fix + 5s geocode + the
 * scheduler, so it only ever fires on a genuinely stuck call.
 */
const SLOT_TIMEOUT_MS = 25_000;

/* ═══════════════════════════ THE PLATFORM GATE ═══════════════════════════ */

/**
 * Every behavioural change from the 2026-08 location-refresh fix is gated here.
 * iOS and the website keep the pre-fix behaviour verbatim (coarse 12s fix,
 * 5-minute maximumAge, one flat 30-minute back-off, no confidence signal),
 * because iOS demonstrably picks up travel today and there is no iPhone to
 * verify a change on before launch — an unverifiable change to a working
 * platform is not worth the risk.
 *
 * TO UN-GATE FOR iOS: change the right-hand side of the line below to `true`.
 * That is the ONLY line that needs to change — nothing else in the codebase
 * branches on platform for this feature. The UI surfaces carry no platform check
 * at all; they are dark on iOS because the DATA they key off (the failure record
 * and the cache's `tz` field) is only ever written inside this flag.
 *
 * BEFORE YOU FLIP IT, know that one of the tuning constants below does not mean
 * on iOS what it means on Android: `maximumAge` DOES NOT EXIST in the iOS
 * plugin. GeolocationPlugin.swift forwards only enableHighAccuracy and timeout,
 * so ANDROID_FIX_MAX_AGE_MS is silently dropped there and the entire battery
 * argument for it — Play Services answering from its own cache without powering
 * the radio — has no iOS equivalent. Un-gated as written, every qualifying iOS
 * foreground would be a live best-accuracy CoreLocation request with no cache
 * short-circuit at all. Budget that first, on a device, before turning this on.
 */
const ANDROID_TUNING = Capacitor.getPlatform() === "android";

/**
 * ANDROID ONLY. Measured on the founder's Galaxy A17 (Android 16), indoors:
 * a BALANCED_POWER request with no usable cache does not converge — 12 068 ms,
 * hard failure, repeatably. HIGH_ACCURACY returns in 2952 ms at 14 m accuracy.
 * The old coarse setting was therefore never the cheap option; it was the option
 * that spent twelve seconds of network positioning and then failed.
 */
const ANDROID_FIX_TIMEOUT_MS = 15_000; // 5× the measured 2952ms fix
/** A watched spinner can afford a cold GNSS start; past ~25s it reads as a hang. */
const ANDROID_FIX_TIMEOUT_FORCED_MS = 25_000;
/**
 * Must stay meaningfully SHORTER than REFRESH_MS, or two consecutive refreshes
 * could be served the same cached fix and the staleness bug returns in a new
 * costume. Ten minutes of travel is ~15 km even at highway speed — comfortably
 * inside MOVED_KM, so a cache hit can never by itself fabricate or mask a move.
 *
 * Do NOT read this as "most refreshes cost no radio". The gate only opens once
 * OUR cache is 30+ minutes old, so on a phone where Hiqmah is the only location
 * consumer the fused fix is at least that old too and this window always misses:
 * the common case is a real acquisition, measured at 2.5-6s. The cheap path
 * (85-95ms, no radio) only exists when some OTHER app has kept the fused cache
 * warm. Both are bounded at 48 attempts/day, and both beat what this replaced —
 * 12s of network positioning that then failed.
 */
const ANDROID_FIX_MAX_AGE_MS = 10 * 60 * 1000;
/**
 * A user tapping Update location believes the stored place is wrong; handing
 * them a nine-minute-old fix would look like the button did nothing. Still wide
 * enough that a double-tap cannot chain two GNSS burns.
 */
const ANDROID_FIX_MAX_AGE_FORCED_MS = 60_000;
/**
 * Forced refreshes need a bigger slot than the silent ones: 25s fix + 5s geocode
 * + the scheduler does not fit under SLOT_TIMEOUT_MS. The SILENT budget is
 * deliberately unchanged — 15s fix + 5s geocode = 20s under a 25s deadline — so
 * the slot deadline can never fire while getCurrentPosition is still in flight
 * and quietly break the serialization guarantee.
 */
const ANDROID_SLOT_TIMEOUT_FORCED_MS = 40_000;

/**
 * Plugin error codes that more attempts cannot fix: the user has switched
 * something off, or Play Services is unavailable. These get the flat 30-minute
 * window and the "location is off" wording, not the retry ladder.
 *
 * Codes and names taken from the plugin's own table — GeolocationErrors.kt in
 * @capacitor/geolocation@8.2.0 — not from prose. An earlier version of this set
 * mislabelled 0015 and omitted 0016 entirely, which left the settings error
 * classified only by an accidental substring match on its message.
 */
const HARD_FIX_ERROR_CODES = new Set([
  "OS-PLUG-GLOC-0007", // LOCATION_DISABLED — location services are off
  // LOCATION_ENABLE_REQUEST_DENIED. getCurrentPosition can put the system
  // "turn on location" sheet in front of the user all by itself: the plugin
  // hard-wires resolve=true into its location-settings check, so a SILENT
  // refresh can raise that dialog, and declining it produces this code. It must
  // be HARD. Classified soft it earned the 2-minute rung, which means the next
  // foreground re-raises the very dialog the user just dismissed, then again at
  // +7 and +22 minutes — nagging built out of a back-off meant to help.
  "OS-PLUG-GLOC-0009",
  "OS-PLUG-GLOC-0014", // GOOGLE_SERVICES_RESOLVABLE — needs the user, not a retry
  "OS-PLUG-GLOC-0015", // GOOGLE_SERVICES_ERROR — Play Services unavailable
  "OS-PLUG-GLOC-0016", // LOCATION_SETTINGS_ERROR
  "OS-PLUG-GLOC-0017", // NETWORK_LOCATION_DISABLED_ERROR — network AND location off
]);
/** Codes that mean "ask again later": the sky was not visible in time. */
const SOFT_FIX_ERROR_CODES = new Set([
  "OS-PLUG-GLOC-0002", // position unavailable
  "OS-PLUG-GLOC-0010", // could not obtain location in time (the measured failure)
  "2",
  "10", // iOS surfaces bare numeric codes
]);

/**
 * Which kind of failure the OS just handed us. Every other call inside the try
 * is self-guarded, so a throw there means exactly one thing: we did not get a
 * position. Unrecognised errors are classed SOFT on purpose — retrying is cheap
 * and bounded by the ladder, whereas being silently stuck for half an hour is
 * the bug being fixed.
 */
function classifyFixError(e: unknown): "soft" | "hard" {
  const err = e as { code?: unknown; message?: unknown } | null;
  const code = typeof err?.code === "string" ? err.code : String(err?.code ?? "");
  if (HARD_FIX_ERROR_CODES.has(code)) return "hard";
  if (SOFT_FIX_ERROR_CODES.has(code)) return "soft";
  const msg = typeof err?.message === "string" ? err.message.toLowerCase() : "";
  if (
    msg.includes("location services") ||
    msg.includes("location disabled") ||
    msg.includes("location is disabled") ||
    msg.includes("play services") ||
    msg.includes("settings")
  ) {
    return "hard";
  }
  return "soft";
}

/**
 * The options handed to getCurrentPosition. Pure and exported so the iOS/web
 * non-regression check is an assertion rather than a code read: with
 * `android:false` it must return the pre-fix object byte for byte.
 */
export function buildFixOptions(opts: {
  android: boolean;
  force: boolean;
  /** ACCESS_FINE_LOCATION granted. See the permission trap in requestFix below. */
  fine: boolean;
}): { enableHighAccuracy: boolean; timeout: number; maximumAge: number } {
  if (!opts.android) {
    return {
      enableHighAccuracy: false,
      timeout: FIX_TIMEOUT_MS,
      maximumAge: FIX_MAX_AGE_MS,
    };
  }
  return {
    enableHighAccuracy: opts.fine,
    timeout: opts.force ? ANDROID_FIX_TIMEOUT_FORCED_MS : ANDROID_FIX_TIMEOUT_MS,
    maximumAge: opts.force ? ANDROID_FIX_MAX_AGE_FORCED_MS : ANDROID_FIX_MAX_AGE_MS,
  };
}

/**
 * The device's current IANA zone, stamped onto Android cache writes only.
 * It costs nothing, needs no permission and cannot fail — the OS sets it from
 * the cell network — so it is the one location signal still alive when GNSS is
 * dead, which is exactly the failure mode this change exists for.
 */
function tzStamp(): { tz?: string } {
  if (!ANDROID_TUNING) return {};
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz ? { tz } : {};
  } catch {
    return {};
  }
}

export type LocationRefreshResult = {
  /** The cache now points at a different place (and the schedule was rebuilt). */
  changed: boolean;
  /** Distance from the previous cached fix, km. Absent when nothing was cached. */
  moved?: number;
  /**
   * The forced retry was REFUSED because one just ran — no radio was used, and
   * nothing was learned. Distinct from `null`, which means "we tried and got
   * nothing": a caller that conflated the two would tell the user "still no fix"
   * about a fix that was never attempted.
   */
  throttled?: boolean;
};

/**
 * ANDROID ONLY. Minimum spacing between USER-initiated fixes, across every
 * surface that offers one.
 *
 * Per-screen cooldowns are not enough, and that is the whole reason this lives
 * in the module rather than in component state: a cooldown held in a React
 * component dies when the screen unmounts, and there is more than one button.
 * Someone stuck in a dead spot can tap the /prayer-times banner, walk to
 * Settings and tap the Location row, come back, and pay a full GNSS acquisition
 * every time — roughly a 78% duty cycle for as long as their patience lasts.
 * The floor has to be shared and it has to outlive the screens.
 */
export const FORCED_RETRY_COOLDOWN_MS = 30_000;
/** In flight, or finished less than the cooldown ago. Module-scope on purpose. */
let forcedInFlight = false;
let forcedEndedAt = 0;

function forcedRetryBlocked(): boolean {
  if (!ANDROID_TUNING) return false; // iOS/web keep HEAD: no throttle at all
  return forcedInFlight || Date.now() - forcedEndedAt < FORCED_RETRY_COOLDOWN_MS;
}

/** Reverse-geocode with a hard ceiling — a hung Nominatim lookup must never hold
 *  this refresh's queue slot (or the notification refill chained behind it). */
async function withGeoTimeout(lat: number, lng: number) {
  return Promise.race([
    reverseGeocode(lat, lng),
    new Promise<null>((r) => setTimeout(() => r(null), GEO_TIMEOUT_MS)),
  ]);
}

/**
 * The cached fix just changed — tell everything that renders from it.
 *
 * Two audiences: mounted screens (via the DOM event) and the native widgets,
 * which live in a separate process and can only see what we've written into the
 * App Group. Forced, because the widget's whole input set (coordinates, and the
 * city it's captioned with) is exactly what just changed — its normal 6-hour
 * write window would otherwise leave the home screen showing the old city's
 * prayer times for the rest of the day you landed. Fire-and-forget: publishing
 * must never delay (or fail) a location refresh.
 */
function publishLocationChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LOCATION_CHANGED_EVENT));
  }
  void syncWidgetData({ force: true });
}

async function runRefresh(force: boolean): Promise<LocationRefreshResult | null> {
  // Whether the attempt was already stamped, and whether a position actually
  // arrived — both read by the catch to decide what it is looking at.
  let attempted = false;
  let gotFix = false;
  try {
    const cached = getCachedLocation();

    // Nothing to do if we checked recently — this is what keeps a burst of
    // foregrounds (or app-switching) from costing a GPS fix each time. Both
    // halves matter: the cache is only stamped when a fix SUCCEEDS, so without
    // attemptedRecently a phone that can't get one (indoors, subway, airplane
    // mode) would re-arm the GPS radio on every single foreground.
    //
    // What changed (Android only) is the LENGTH of that window after a FAILURE.
    // One timeout used to buy the full 30 minutes a success buys, and on
    // hardware where the timeout is the common case that left the app showing
    // the wrong city for hours — measured: a 156-minute gap between the last
    // attempt and the last successful fix. The anti-radio-burn protection is
    // untouched; there is still a hard 2-minute floor between attempts, and the
    // window is back to 30 minutes within the hour.
    const attemptWindow = ANDROID_TUNING ? attemptWindowMs() : REFRESH_MS;
    if (!force && (!isCacheStale() || attemptedRecently(attemptWindow))) {
      return { changed: false };
    }

    // Permissions: a silent refresh must NEVER pop the OS dialog — that would
    // ambush the user on app open, and re-ask someone who already said no. Only
    // an explicit tap (force) may request. checkPermissions throws when system
    // location services are off, which the outer catch handles.
    let perm = await Geolocation.checkPermissions();
    let asked = false;
    if (perm.location !== "granted" && perm.coarseLocation !== "granted") {
      if (!force) return null;
      perm = await Geolocation.requestPermissions({ permissions: ["location"] });
      asked = true;
      if (perm.location !== "granted" && perm.coarseLocation !== "granted") {
        setLocationState("denied");
        return null;
      }
    }
    // ANDROID: a user who chose "Approximate" cannot get a fix on hardware where
    // network positioning never converges — and enableHighAccuracy is FINE-gated
    // below, so we can never escalate for them silently. An explicit tap is the
    // one moment we are allowed to ask, and it is the only route they have to a
    // working location. Placed AFTER the block above so the "denied" semantics
    // (set only when NEITHER permission is granted) are untouched: if they
    // decline this we still hold COARSE, so they must not be marked denied.
    //
    // `!asked` is what stops one tap producing TWO dialogs back to back. Android
    // returns from the grant sheet with {coarseLocation:"granted",
    // location:"prompt"} when the user picks Approximate, which satisfies the
    // block above and then immediately satisfies this condition — so the user
    // answers, and the same sheet reappears on top of the answer. One tap gets
    // one dialog; if they chose Approximate, the upgrade is offered on their NEXT
    // deliberate tap, by which point the warning has told them why it matters.
    if (ANDROID_TUNING && force && !asked && perm.location !== "granted") {
      perm = await Geolocation.requestPermissions({ permissions: ["location"] });
    }
    setLocationState("granted");

    // Stamp the ATTEMPT before asking, so the back-off applies whether the fix
    // resolves or throws (see attemptedRecently above).
    markLocationAttempt();
    attempted = true;

    // ANDROID: one call, cache-first-then-GNSS — not two legs.
    //
    // maximumAge is not a "how stale may this be" preference on Android; it is
    // the switch that decides whether any hardware runs. Play Services serves a
    // fix younger than maximumAge out of its own cache in ~10-100ms without
    // powering the radio, and only engages GNSS on a miss — independently of
    // priority. So high accuracy here does NOT mean "burn GPS every foreground";
    // it means "burn GPS only when nobody on this device has had a fix in the
    // last ten minutes". A separate coarse leg would only duplicate the cache
    // check that is already inside the request, and pay its full timeout on
    // every genuine miss.
    //
    // enableHighAccuracy is conditioned on FINE being granted, and that is not
    // an optimisation — it is the hard constraint. On Android 12+ the plugin
    // maps enableHighAccuracy:true to the [COARSE, FINE] permission alias, an
    // alias counts as granted only if ALL of its permissions are, and
    // getCurrentPosition REQUESTS any alias that is not granted. Passing true
    // unconditionally would therefore pop the OS permission dialog out of a
    // silent background refresh for every "Approximate" user.
    // BOTH, not just location: the alias enableHighAccuracy:true selects is
    // [COARSE, FINE], and Bridge counts an alias as granted only when every
    // permission in it is. Checking only FINE would leave a hole that requests —
    // and therefore prompts — in the one configuration we must never prompt in.
    const fine = perm.location === "granted" && perm.coarseLocation === "granted";
    const pos = await Geolocation.getCurrentPosition(
      buildFixOptions({ android: ANDROID_TUNING, force, fine })
    );
    gotFix = true;
    // The OS gave us a position: whatever run of failures preceded it is over,
    // so the ladder resets and every staleness warning keyed off it goes dark.
    if (ANDROID_TUNING) clearLocationFailures();
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const moved = cached ? distanceKm(cached, { lat, lng }) : undefined;

    // Same place: mark the cache as checked so we don't re-poll on every
    // foreground, but leave the coordinates (and the schedule) alone.
    if (!force && moved !== undefined && moved < MOVED_KM) {
      // …unless we never managed to resolve a NAME for this spot. The move
      // branch below commits coordinates before geocoding, so a geocode that
      // failed (offline / captive portal — the normal state right after
      // landing) leaves a coarse "43.65°, -79.38°" label behind. Without this,
      // every later refresh lands here, re-stamps the cache fresh, and the
      // coordinates read as the city forever — including in notification
      // titles ("Maghrib · 7:12 PM"). Retry the label only; the coordinates
      // are unchanged, so this is still not a location "change".
      if (cached && !cached.city) {
        const geo = await withGeoTimeout(lat, lng);
        const resolved = geo ? formatLocation(geo) : "";
        if (geo && resolved) {
          setCachedLocation({
            lat,
            lng,
            city: geo.city || geo.principalSubdivision || "",
            country: geo.countryName || "",
            display: resolved,
            ...tzStamp(),
          });
          // Titles bake in the city, so the pending notifications need rebuilding.
          await scheduleAllNotifications(false);
          publishLocationChange();
          return { changed: false, moved };
        }
      }
      // Re-stamp the zone as well as the time: a fix landing near the anchor
      // CONFIRMS the anchor, so a zone warning raised against it has to clear.
      // No-op off Android (tzStamp returns {}).
      touchCachedLocation(tzStamp());
      return { changed: false, moved };
    }

    // COORDINATES FIRST. Prayer times and the whole adhan schedule are built
    // from lat/lng; the city label is only printed in notification titles. The
    // reverse-geocode below is a network call on precisely the network you get
    // when you land (roaming, captive portal), so making it a prerequisite would
    // leave the user on the OLD city's adhan for as long as it hangs — or
    // forever, if iOS suspends the WebView first. Commit the fix, reschedule,
    // then refine the label.
    const nearby = moved !== undefined && moved < MOVED_KM;
    // Provisional label: keep the last known one rather than downgrading a real
    // city name to raw coordinates — but only when the new fix is still near the
    // cached one, otherwise the label would be a lie.
    const coarse = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
    const display = nearby && cached ? cached.display : coarse;
    setCachedLocation({
      lat,
      lng,
      city: nearby && cached ? cached.city : "",
      country: nearby && cached ? cached.country : "",
      display,
      ...tzStamp(),
    });

    // Rebuild the adhan / prayer window for where the user actually is. Silent
    // (never prompts) — this can run while the app is merely coming forward.
    await scheduleAllNotifications(false);
    // Broadcast now, not after the geocode: mounted screens are showing the old
    // city's TIMES, which matter more than the label they're captioned with.
    publishLocationChange();

    // Now the cosmetic part. Bounded, because a hung lookup must not hold this
    // refresh's queue slot: notification titles print loc.city ("Maghrib ·
    // Toronto · 7:12 PM"), so a resolved name is worth one more write + a
    // reschedule — but only when it actually differs from what we just stored.
    const geo = await withGeoTimeout(lat, lng);
    const resolved = geo ? formatLocation(geo) : "";
    if (geo && resolved && resolved !== display) {
      setCachedLocation({
        lat,
        lng,
        city: geo.city || geo.principalSubdivision || "",
        country: geo.countryName || "",
        display: resolved,
        ...tzStamp(),
      });
      await scheduleAllNotifications(false);
      publishLocationChange();
    }
    return { changed: true, ...(moved !== undefined ? { moved } : {}) };
  } catch (e) {
    // A failed refresh must never break app open — keep the old fix.
    //
    // But it must no longer be SILENT. Record what kind of failure it was, so
    // the back-off can retry sooner than 30 minutes and, once it has failed
    // repeatedly against an old fix, so the UI can stop presenting a stale city
    // as fact. On iOS/web nothing below runs and the failure key is never
    // created — which is what keeps every warning surface dark there.
    if (ANDROID_TUNING && !gotFix) {
      const kind = classifyFixError(e);
      // The HARD errors are thrown by checkPermissions, i.e. BEFORE the stamp
      // above. Stamp here too, or a phone with location switched off repeats
      // that (cheap but pointless) IPC on every single foreground.
      if (!attempted) markLocationAttempt();
      // A user's own retry does not spend the SILENT ladder — see advanceLadder
      // in location-cache. It still records `at`/`hard`, so the on-screen
      // warning stays accurate about what just happened.
      recordLocationFailure(kind, { advanceLadder: !force });
    }
    return null;
  }
}

// Serialize refreshes: foreground events arrive in bursts and /prayer-times can
// force one while a silent one is mid-fix. Queued calls are cheap — by the time
// they run the cache has just been stamped, so they short-circuit immediately.
let queue: Promise<unknown> = Promise.resolve();

/**
 * Re-check the device's location and, if it has meaningfully moved, update the
 * cache + reschedule notifications + broadcast LOCATION_CHANGED_EVENT.
 *
 * @param opts.force user explicitly asked (Auto-locate): ignore the refresh
 *   window and may request permission.
 * @returns null on web, or when no usable fix was obtained (permission not
 *   granted, GPS off/timed out) — callers should treat null as "nothing changed".
 *   `{throttled:true}` when a forced retry was refused for coming too soon after
 *   the last one; that is NOT a failed fix and must not be reported as one.
 */
export function refreshLocation(opts?: {
  force?: boolean;
}): Promise<LocationRefreshResult | null> {
  // Web keeps its own navigator.geolocation flow (see /prayer-times).
  if (!Capacitor.isNativePlatform()) return Promise.resolve(null);
  const force = opts?.force === true;
  // ANDROID: the shared floor under every "Update location" button. Enforced
  // here rather than trusted to each screen, so a surface that forgets its own
  // cooldown (or is simply unmounted and remounted) still cannot chain GNSS
  // acquisitions. Checked BEFORE the queue: a refused retry must cost nothing at
  // all, not a slot behind whatever is already running.
  if (force && forcedRetryBlocked()) {
    return Promise.resolve({ changed: false, throttled: true });
  }
  if (ANDROID_TUNING && force) forcedInFlight = true;
  // Every slot gets a deadline so it always frees. MobileShell only refills the
  // rolling notification window once this promise settles, and a forced refresh
  // sits on the OS permission dialog indefinitely if the user backgrounds the app
  // instead of answering — without the bound, every later foreground would queue
  // behind it and the adhan window would never be refilled that session. The
  // bound lives here rather than at the call site so refreshes stay on the one
  // chain: a late refresh can't interleave its cancel-then-rebuild with another.
  //
  // ANDROID + forced only: the deadline has to clear the work it is bounding, or
  // it guillotines a fix that was about to arrive. A forced Android fix may take
  // 25s, plus the 5s geocode and the scheduler. The SILENT budget is unchanged
  // (15s fix + 5s geocode = 20s under 25s), and so is every iOS/web path.
  const slot =
    ANDROID_TUNING && force ? ANDROID_SLOT_TIMEOUT_FORCED_MS : SLOT_TIMEOUT_MS;
  const withDeadline = () =>
    Promise.race([
      runRefresh(force),
      new Promise<LocationRefreshResult | null>((r) => setTimeout(() => r(null), slot)),
    ]);
  const run = queue.then(withDeadline, withDeadline);
  queue = run.catch(() => undefined);
  // iOS/web return the HEAD promise untouched — they have no throttle to arm.
  if (!ANDROID_TUNING || !force) return run;
  // Start the cooldown when the retry SETTLES, not when it was requested: a
  // forced fix may spend 25s on the radio, and beginning the 30s then would let
  // the next tap land 5s after the result.
  return run.finally(() => {
    forcedInFlight = false;
    forcedEndedAt = Date.now();
  });
}
