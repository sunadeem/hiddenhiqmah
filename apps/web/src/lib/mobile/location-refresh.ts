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
  distanceKm,
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

export type LocationRefreshResult = {
  /** The cache now points at a different place (and the schedule was rebuilt). */
  changed: boolean;
  /** Distance from the previous cached fix, km. Absent when nothing was cached. */
  moved?: number;
};

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
  try {
    const cached = getCachedLocation();

    // Nothing to do if we checked recently — this is what keeps a burst of
    // foregrounds (or app-switching) from costing a GPS fix each time. Both
    // halves matter: the cache is only stamped when a fix SUCCEEDS, so without
    // attemptedRecently a phone that can't get one (indoors, subway, airplane
    // mode) would re-arm the GPS radio on every single foreground.
    if (!force && (!isCacheStale() || attemptedRecently())) return { changed: false };

    // Permissions: a silent refresh must NEVER pop the OS dialog — that would
    // ambush the user on app open, and re-ask someone who already said no. Only
    // an explicit tap (force) may request. checkPermissions throws when system
    // location services are off, which the outer catch handles.
    let perm = await Geolocation.checkPermissions();
    if (perm.location !== "granted" && perm.coarseLocation !== "granted") {
      if (!force) return null;
      perm = await Geolocation.requestPermissions({ permissions: ["location"] });
      if (perm.location !== "granted" && perm.coarseLocation !== "granted") {
        setLocationState("denied");
        return null;
      }
    }
    setLocationState("granted");

    // Stamp the ATTEMPT before asking, so the back-off applies whether the fix
    // resolves or throws (see attemptedRecently above).
    markLocationAttempt();
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false, // city-scale question — a coarse fix is enough
      timeout: FIX_TIMEOUT_MS,
      maximumAge: FIX_MAX_AGE_MS,
    });
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
          });
          // Titles bake in the city, so the pending notifications need rebuilding.
          await scheduleAllNotifications(false);
          publishLocationChange();
          return { changed: false, moved };
        }
      }
      touchCachedLocation();
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
      });
      await scheduleAllNotifications(false);
      publishLocationChange();
    }
    return { changed: true, ...(moved !== undefined ? { moved } : {}) };
  } catch {
    // A failed refresh must never break app open — keep the old fix.
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
 */
export function refreshLocation(opts?: {
  force?: boolean;
}): Promise<LocationRefreshResult | null> {
  // Web keeps its own navigator.geolocation flow (see /prayer-times).
  if (!Capacitor.isNativePlatform()) return Promise.resolve(null);
  const force = opts?.force === true;
  // Every slot gets a deadline so it always frees. MobileShell only refills the
  // rolling notification window once this promise settles, and a forced refresh
  // sits on the OS permission dialog indefinitely if the user backgrounds the app
  // instead of answering — without the bound, every later foreground would queue
  // behind it and the adhan window would never be refilled that session. The
  // bound lives here rather than at the call site so refreshes stay on the one
  // chain: a late refresh can't interleave its cancel-then-rebuild with another.
  const withDeadline = () =>
    Promise.race([
      runRefresh(force),
      new Promise<LocationRefreshResult | null>((r) =>
        setTimeout(() => r(null), SLOT_TIMEOUT_MS)
      ),
    ]);
  const run = queue.then(withDeadline, withDeadline);
  queue = run.catch(() => undefined);
  return run;
}
