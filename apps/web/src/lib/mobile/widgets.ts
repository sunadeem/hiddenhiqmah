/**
 * Widget data bridge — hand the native home-screen / Lock Screen widgets a
 * precomputed month of prayer times.
 *
 * WidgetKit extensions run in their own process: no WKWebView, no JS, no
 * localStorage. They can't call computePrayerTimes, and they can't read the
 * app's cached location. So the app is the producer: every time it opens, comes
 * forward, or the inputs change (location / calculation method / Asr madhab), it
 * writes a self-contained JSON blob into the shared App Group
 * (group.com.hiddenhiqmah.app, UserDefaults key "widgetData") and the widget
 * timeline provider just reads it. ~30 days of coverage means a phone that never
 * opens the app for a month still renders correct times, and the widget keeps
 * working with the radio off.
 *
 * Everything here is best-effort and silent. The native WidgetBridge plugin only
 * exists in builds that ship it, so an older binary running this bundle (the web
 * and app share ONE static export) must degrade to a no-op rather than throwing
 * into a foreground handler. NO-OP ON WEB.
 */

import { Capacitor, registerPlugin } from "@capacitor/core";
import { getCachedLocation } from "@hidden-hiqmah/ui/lib/location-cache";
import { getPrayerSettings, getVisitStats } from "@hidden-hiqmah/ui/lib/storage";
import { computePrayerTimes } from "@/lib/prayer-times";

/**
 * Native side: writes `json` into UserDefaults(suiteName:"group.com.hiddenhiqmah.app")
 * under "widgetData" and calls WidgetCenter.reloadAllTimelines().
 */
type WidgetBridgePlugin = {
  setWidgetData(options: { json: string }): Promise<void>;
};

const WidgetBridge = registerPlugin<WidgetBridgePlugin>("WidgetBridge");

/**
 * Bump when the payload shape changes.
 *
 * The version is INFORMATIONAL, not a gate: neither side may refuse a blob over
 * it, because app and extension are updated together but a WIDGET can outlive
 * either. Compatibility is carried by the field-level contract instead, in both
 * directions:
 *
 *   - v2 blob → v1 reader (user updated the app but the installed widget binary
 *     is the old one, mid-update): the old decoder ignores unknown keys, so
 *     `lat`/`lng`/`streak` are silently dropped and prayers still render.
 *   - v1 blob → v2 reader (a widget added before the app was next opened, so the
 *     last write predates this version): SharedData.swift decodes the three new
 *     fields as OPTIONALS, so prayers still render and the qibla / streak
 *     widgets show their own placeholder rather than 0°/0-day garbage.
 *
 * Which is why v2 only ADDS fields and never renames or retypes one.
 */
const PAYLOAD_VERSION = 2;

/**
 * How far ahead to precompute. The widget must survive a user who doesn't open
 * the app for weeks (that's most of the point of a widget), and 30 days of
 * Adhan math is a few ms — cheap enough to redo on a foreground, small enough
 * that the blob stays a handful of KB in UserDefaults.
 */
const DAYS_AHEAD = 30;

/**
 * Don't rewrite on every single foreground. Prayer times for a fixed location +
 * method don't change, so the only reason to rewrite unprompted is to keep the
 * 30-day window rolling — twice a day is far more than that needs. Anything that
 * genuinely invalidates the data (moved city, changed method/madhab) passes
 * `force` and bypasses this entirely.
 */
const MIN_INTERVAL_MS = 6 * 60 * 60 * 1000;

export type WidgetDay = {
  /** Local calendar day, "YYYY-MM-DD". */
  date: string;
  /** 24h local wall-clock, "HH:mm". */
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export type WidgetPayload = {
  version: number;
  /** ISO timestamp of this write. */
  updatedAt: string;
  /** Label to caption the widget with; "" when we never resolved a name. */
  city: string;
  /**
   * The coordinates the times were computed for. The Qibla widget re-derives the
   * bearing to the Kaaba from these NATIVELY (QiblaWidget.swift mirrors
   * QiblahSection.tsx's great-circle math) rather than us shipping a precomputed
   * degree figure — one number to keep honest instead of two, and the extension
   * can then also show the distance.
   */
  lat: number;
  lng: number;
  /**
   * Consecutive-day visit streak at the time of this write. Only as fresh as the
   * last app open by construction: the extension can't run the visit bookkeeping,
   * and localStorage lives on the far side of the WKWebView. A stale streak is
   * the accepted cost of showing one at all.
   */
  streak: number;
  days: WidgetDay[];
};

/** Last SUCCESSFUL write (module-level: resets on reload, which is fine — a
 *  fresh launch should re-publish anyway). */
let lastWrittenAt = 0;
/** Streak carried by the last successful write — see the guard in `run()`. */
let lastWrittenStreak = -1;
/**
 * Serialize writes. Foreground events arrive in bursts and a settings change can
 * land while a silent pass is mid-flight; queued calls are cheap because the
 * 6-hour check below runs when the call RUNS, not when it's made — so a burst
 * collapses to one real write. Chaining (rather than returning the in-flight
 * promise) is what makes a forced call correct: it re-reads settings after the
 * pass ahead of it finishes, instead of inheriting its already-built payload.
 */
let queue: Promise<void> = Promise.resolve();

/** computePrayerTimes returns bare "HH:mm", but the aladhan-shaped Timings map
 *  is also fed from the network path as "HH:MM (TZ)" — strip defensively, same
 *  as notifications.ts, so a formatted value can never reach the widget. */
function cleanTime(raw: string): string {
  return raw.replace(/\s*\(.*\)/, "").trim();
}

/**
 * Current visit streak, or 0 for anything unexpected. Deliberately total: the
 * streak is a garnish on a payload whose real job is prayer times, so a corrupt
 * or absent visit record must degrade to "no streak" and never abort the write.
 */
function currentStreak(): number {
  try {
    const n = getVisitStats().currentStreak;
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Build the payload from the cached location + prayer settings, or null when
 * there's nothing to publish (no location fix yet — the widget shows its own
 * "open Hiqmah" placeholder rather than us inventing a city).
 */
function buildPayload(): WidgetPayload | null {
  const loc = getCachedLocation();
  if (!loc) return null;

  const settings = getPrayerSettings();
  const asrHanafi = settings.asrMethod === "hanafi";

  const now = new Date();
  const days: WidgetDay[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    // Local midnight of each day, via the date constructor so month/year and DST
    // boundaries roll over correctly (adding 86.4e6 ms does not).
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const t = computePrayerTimes(loc.lat, loc.lng, {
      method: settings.calcMethod,
      asrHanafi,
      date: day,
    });
    days.push({
      date: dayKey(day),
      fajr: cleanTime(t.Fajr),
      dhuhr: cleanTime(t.Dhuhr),
      asr: cleanTime(t.Asr),
      maghrib: cleanTime(t.Maghrib),
      isha: cleanTime(t.Isha),
    });
  }

  return {
    version: PAYLOAD_VERSION,
    updatedAt: now.toISOString(),
    // Prefer the short city name; fall back to whatever label we have (which may
    // be coarse coordinates when the reverse-geocode hasn't succeeded yet).
    city: loc.city || loc.display || "",
    lat: loc.lat,
    lng: loc.lng,
    streak: currentStreak(),
    days,
  };
}

/**
 * Publish ~30 days of prayer times to the App Group for the native widgets.
 *
 * Fire-and-forget: never throws, never rejects, never logs loudly. Safe to call
 * on web (no-op) and on a binary without the WidgetBridge plugin (no-op).
 *
 * @param opts.force ignore the 6-hour write window — pass this when the DATA
 *   changed (new location, new calculation method / Asr madhab), not merely when
 *   the app came forward.
 */
export function syncWidgetData(opts?: { force?: boolean }): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  const force = opts?.force === true;

  const run = async () => {
    try {
      // Checked here, not at call time, so a burst of foregrounds queued behind
      // one real write all short-circuit on the stamp it just set.
      //
      // The streak escape hatch: prayer times for a fixed location don't change,
      // but the streak does — and it changes at MIDNIGHT, which a 6-hour window
      // would happily sit through, leaving the streak widget a day behind on the
      // one day the number was worth looking at. Reading the visit record is a
      // localStorage hit, cheap next to the 30 days of Adhan math it gates.
      if (
        !force &&
        lastWrittenAt &&
        Date.now() - lastWrittenAt < MIN_INTERVAL_MS &&
        currentStreak() === lastWrittenStreak
      ) {
        return;
      }
      const payload = buildPayload();
      if (!payload) return; // no location fix yet — nothing to publish
      await WidgetBridge.setWidgetData({ json: JSON.stringify(payload) });
      lastWrittenAt = Date.now();
      lastWrittenStreak = payload.streak;
    } catch {
      // Plugin missing (older binary), App Group unavailable, storage full —
      // the widget just keeps its last-published timeline. Never surface this:
      // callers are app-open / foreground / settings handlers.
    }
  };

  queue = queue.then(run, run);
  return queue;
}
