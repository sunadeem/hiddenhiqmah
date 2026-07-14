/**
 * Local notification scheduling for Hidden Hiqmah (iOS/Android via Capacitor).
 *
 * Prayer times are deterministic, so we schedule everything LOCALLY on the
 * device (no server / APNs). We compute the next ~10 days of prayer times from
 * the cached location + the user's calculation method, then schedule:
 *   - Adhan at each enabled prayer (custom adhan.caf sound)
 *   - Pre-prayer reminders (default sound, 15 min before)
 *   - Engagement nudges (verse / hadith / reflection / streak) staggered
 *     across the day — see the *_HOUR constants below
 *   - Jumu'ah reminder on Fridays
 *
 * iOS caps pending local notifications at 64, so we sort by fire time and keep
 * the soonest MAX_NOTIFICATIONS. scheduleAllNotifications() runs on every app
 * open (refilling the rolling window) and whenever the user changes a toggle.
 */

import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  getNotificationPrefs,
  getPrayerSettings,
} from "@hidden-hiqmah/ui/lib/storage";
import { getCachedLocation } from "@hidden-hiqmah/ui/lib/location-cache";
import { computePrayerTimes } from "@/lib/prayer-times";
import { dailyInspirations } from "@/data/home-content";
import { dailyIndex, type Reminder } from "@hidden-hiqmah/ui/lib/reminders";
import remindersData from "@hidden-hiqmah/content/reminders.json";

const REMINDERS = remindersData as unknown as Reminder[];

const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
type PrayerKey = (typeof PRAYER_KEYS)[number];

const ALADHAN_KEY: Record<PrayerKey, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};
const PRAYER_LABEL: Record<PrayerKey, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const ADHAN_SOUND = "adhan.caf";
// Per-prayer adhan body — a short, authentic reminder for each prayer. Fajr,
// Asr and Isha use prayer-specific hadith (verified against the local hadith
// corpus: Muslim 657, Bukhari 552, Muslim 656). Dhuhr and Maghrib quote their
// direct Qur'anic anchors from Sūrah Ar-Rūm VERBATIM from our shipped
// translation (verses/30.json) — the Mukhtaṣar (and Maʿārif) name Ẓuhr for
// "ḥīna tuẓhirūn" (30:18) and Maghrib for "ḥīna tumsūn" (30:17). Only change
// from the source text: sentence-case the first letter + terminal period.
const ADHAN_BODY: Record<PrayerKey, string> = {
  fajr: "Pray Fajr — you'll be under Allah's protection all day. (Muslim)",
  dhuhr:
    "And all praise is due to Him in the heavens and earth – and [glorify Him] in the afternoon and at noon. (Qur'an 30:18)",
  asr: "Don't miss Asr — the Prophet ﷺ said missing it is like losing your family and wealth. (Bukhari)",
  maghrib:
    "So glory be to Allah in the evening and in the morning. (Qur'an 30:17)",
  isha: "Pray Isha in congregation — it's as if you prayed half the night. (Muslim)",
};
/** Local 12-hour clock label for a prayer time, e.g. "7:12 PM". */
function fmtClock(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}
const PRE_PRAYER_MINUTES = 15;
// Engagement times are deliberately STAGGERED so no two kinds ever fire in the
// same minute (same-minute banners stack and get dismissed as one), and so the
// nudges shape a sensible day: a verse to start the morning, a hadith at the
// lunch break, the reflection at evening wind-down, and the streak nudge after
// it as a last call before sleep. Keep these distinct when adding new kinds.
const VERSE_HOUR = 8; // 8:00 AM local — today's verse (morning read)
const HADITH_HOUR = 13; // 1:30 PM local — today's hadith (lunch break)
const HADITH_MINUTE = 30;
const REMINDER_HOUR = 20; // 8:00 PM local — today's reflection (evening wind-down)
const STREAK_HOUR = 21; // 9:15 PM local — streak nudge (after the reflection, before sleep)
const STREAK_MINUTE = 15;
const JUMUAH_HOUR = 9; // 9:30 AM Friday — before most congregations
const JUMUAH_MINUTE = 30;
const LAST_ACTIVE_KEY = "hiqmah-daily-last-active"; // YYYY-MM-DD of last checklist activity
const DAYS_AHEAD = 10;
const MAX_NOTIFICATIONS = 60; // stay under iOS's 64 pending cap
// Engagement notifs (verse/hadith/reminder/streak) only cover a short window so
// they can never crowd out the adhan within the 64-pending cap.
const ENGAGEMENT_DAYS = 3;
// Per-tier slot budgets (sum <= MAX_NOTIFICATIONS). Adhan is protected first,
// then pre-prayer, then at most a few engagement nudges. Unused higher-tier
// budget is NOT borrowed down — adhan coverage is guaranteed.
const TIER_CAPS: Record<number, number> = { 1: 40, 2: 14, 3: 6 };

type Timings = Record<string, string>;

function cleanTime(raw: string): string {
  return raw.replace(/\s*\(.*\)/, "").trim();
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// dailyInspirations ships Qur'an-only (no type:"Hadith" entries), so a "Hadith"
// filter yielded an empty pool → null → a blank daily-hadith body. Draw the
// daily hadith from the hadith-sourced reminders instead, in the same shape.
const HADITH_POOL: { type: "Hadith"; english: string; reference: string }[] =
  REMINDERS.filter((r) => r.sourceKind === "hadith").map((r) => ({
    type: "Hadith",
    english: r.textEn,
    reference: r.sourceRef,
  }));

/** Today's-style inspiration for an arbitrary date (day-of-year rotation). */
function inspirationForDate(d: Date, type?: "Quran" | "Hadith") {
  const pool =
    type === "Hadith"
      ? HADITH_POOL
      : type === "Quran"
      ? dailyInspirations.filter((x) => x.type === "Quran")
      : dailyInspirations;
  if (!pool.length) return null;
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86_400_000);
  return pool[dayOfYear % pool.length];
}

/**
 * Compute prayer times ON-DEVICE for the next DAYS_AHEAD days (batoulapps/Adhan).
 * No network: the device's coordinates never leave the phone, and scheduling
 * works fully offline. `school` follows aladhan's convention (1 = Hanafi Asr).
 */
function buildPrayerCalendar(
  lat: number,
  lng: number,
  method: number,
  school: number
): Map<string, Timings> {
  const map = new Map<string, Timings>();
  const now = new Date();
  for (let i = 0; i <= DAYS_AHEAD; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    map.set(
      dayKey(d),
      computePrayerTimes(lat, lng, { method, asrHanafi: school === 1, date: d })
    );
  }
  return map;
}

async function isGranted(): Promise<boolean> {
  try {
    const perm = await LocalNotifications.checkPermissions();
    return perm.display === "granted";
  } catch {
    return false;
  }
}

/** Prompt for permission if undetermined; returns whether granted. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const L = LocalNotifications;
    let perm = await L.checkPermissions();
    if (
      perm.display === "prompt" ||
      perm.display === "prompt-with-rationale"
    ) {
      perm = await L.requestPermissions();
    }
    return perm.display === "granted";
  } catch {
    return false;
  }
}

/**
 * (Re)schedule all enabled notifications. Cancels existing ones first.
 * @param promptIfNeeded request OS permission if not yet determined (use when
 *   the user explicitly turns a toggle on; false on silent app-open runs).
 */
export async function scheduleAllNotifications(
  promptIfNeeded = false
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const L = LocalNotifications;

  // Always clear our previously-scheduled notifications first.
  try {
    const pending = await L.getPending();
    if (pending.notifications.length) {
      await L.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }
  } catch {
    // ignore
  }

  // Resolve permission, tracking whether the user JUST granted it (so we can
  // fire an immediate adhan confirmation as a "it works" preview).
  let granted = false;
  let newlyGranted = false;
  if (promptIfNeeded) {
    const before = await L.checkPermissions();
    if (before.display === "granted") {
      granted = true;
    } else if (
      before.display === "prompt" ||
      before.display === "prompt-with-rationale"
    ) {
      const after = await L.requestPermissions();
      granted = after.display === "granted";
      newlyGranted = granted;
    }
  } else {
    granted = await isGranted();
  }
  if (!granted) return;

  const prefs = getNotificationPrefs();
  const settings = getPrayerSettings();
  const loc = getCachedLocation();

  const anyAdhan =
    prefs.adhanEnabled && PRAYER_KEYS.some((k) => prefs.adhanPerPrayer[k]);
  // A plain prayer-time notification, default on (undefined = on for older prefs).
  const wantPrayerNotif = prefs.prayerNotif !== false;
  const wantDaily = prefs.todaysVerse || prefs.todaysHadith;
  const wantReminder = prefs.todaysReminder && REMINDERS.length > 0;
  if (
    !anyAdhan &&
    !wantPrayerNotif &&
    !prefs.prePrayer &&
    !wantDaily &&
    !wantReminder &&
    !prefs.jumuah &&
    !prefs.streak
  )
    return;

  const now = new Date();
  type Notif = {
    id: number;
    title: string;
    body: string;
    schedule: { at: Date };
    sound?: string;
    url?: string; // deep-link target on tap
    tier: 1 | 2 | 3; // 1=adhan (protected), 2=pre-prayer, 3=engagement
    // iOS delivery priority. Adhan is time-sensitive so Focus/Sleep/DND don't
    // silence it (Sleep Focus at Fajr is the common culprit). NOTE: this does NOT
    // bypass the hardware ring/silent switch — that needs a Critical Alert
    // (critical-alerts entitlement + UNNotificationSound.criticalSoundNamed).
    interruptionLevel?: "timeSensitive" | "critical";
  };
  const notifs: Notif[] = [];
  let id = 1000;

  // ── Prayer-based (adhan / prayer notif + pre-prayer) — needs a location ──
  if ((anyAdhan || wantPrayerNotif || prefs.prePrayer) && loc) {
    const school = settings.asrMethod === "hanafi" ? 1 : 0;
    const times = buildPrayerCalendar(loc.lat, loc.lng, settings.calcMethod, school);
    for (let i = 0; i <= DAYS_AHEAD; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      day.setHours(0, 0, 0, 0);
      const timings = times.get(dayKey(day));
      if (!timings) continue;
      for (const pk of PRAYER_KEYS) {
        const raw = timings[ALADHAN_KEY[pk]];
        if (!raw) continue;
        const [hh, mm] = cleanTime(raw).split(":").map(Number);
        if (Number.isNaN(hh)) continue;
        const at = new Date(day);
        at.setHours(hh, mm, 0, 0);
        if (at <= now) continue;

        // One prayer-time notification when EITHER the adhan (for this prayer) or
        // the plain prayer-notif is on. The adhan case carries the adhan sound +
        // time-sensitive delivery; the plain case is a standard notification.
        const adhanForThis = anyAdhan && prefs.adhanPerPrayer[pk];
        if (wantPrayerNotif || adhanForThis) {
          const title = [PRAYER_LABEL[pk], loc.city, fmtClock(at)]
            .filter(Boolean)
            .join(" · "); // e.g. "Maghrib · Toronto · 7:12 PM"
          notifs.push({
            id: id++,
            title,
            body: adhanForThis ? ADHAN_BODY[pk] : `It's time for ${PRAYER_LABEL[pk]} prayer.`,
            schedule: { at },
            sound: adhanForThis ? ADHAN_SOUND : undefined,
            url: "/salah",
            tier: 1,
            interruptionLevel: adhanForThis ? "timeSensitive" : undefined,
          });
        }
        if (prefs.prePrayer) {
          const pre = new Date(at.getTime() - PRE_PRAYER_MINUTES * 60_000);
          if (pre > now) {
            notifs.push({
              id: id++,
              title: `${PRAYER_LABEL[pk]} in ${PRE_PRAYER_MINUTES} min`,
              body: `Get ready for ${PRAYER_LABEL[pk]} prayer.`,
              schedule: { at: pre },
              url: "/salah",
              tier: 2,
            });
          }
        }
      }
    }
  }

  // ── Daily verse / hadith (independent — either or both can be enabled) ──
  // Verse in the morning, hadith at lunch — staggered so they never collide.
  if (wantDaily) {
    for (let i = 0; i <= ENGAGEMENT_DAYS; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      if (prefs.todaysVerse) {
        const at = new Date(day);
        at.setHours(VERSE_HOUR, 0, 0, 0);
        if (at > now) {
          const insp = inspirationForDate(at, "Quran");
          if (insp)
            notifs.push({
              id: id++,
              title: "Today's Verse",
              body: `${insp.english} — ${insp.reference}`,
              schedule: { at },
              url: "/",
              tier: 3,
            });
        }
      }
      if (prefs.todaysHadith) {
        const at = new Date(day);
        at.setHours(HADITH_HOUR, HADITH_MINUTE, 0, 0);
        if (at > now) {
          const insp = inspirationForDate(at, "Hadith");
          if (insp)
            notifs.push({
              id: id++,
              title: "Today's Hadith",
              body: `${insp.english} — ${insp.reference}`,
              schedule: { at },
              url: "/",
              tier: 3,
            });
        }
      }
    }
  }

  // ── Today's Reminder (the day's reflection — matches the Reminders tab) ──
  if (wantReminder) {
    for (let i = 0; i <= ENGAGEMENT_DAYS; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      const at = new Date(day);
      at.setHours(REMINDER_HOUR, 0, 0, 0);
      if (at <= now) continue;
      const r = REMINDERS[dailyIndex(dayKey(day), REMINDERS.length)];
      if (!r) continue;
      const ref = r.sourceKind === "quran" ? `Qur'an ${r.sourceRef}` : r.sourceRef;
      notifs.push({
        id: id++,
        title: "Today's Reminder",
        body: `${r.textEn} — ${ref}`,
        schedule: { at },
        url: "/muslim-daily?tab=reminders",
        tier: 3,
      });
    }
  }

  // ── Jumu'ah (Fridays) ──
  if (prefs.jumuah) {
    for (let i = 0; i <= DAYS_AHEAD; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      if (day.getDay() !== 5) continue; // Friday
      const at = new Date(day);
      at.setHours(JUMUAH_HOUR, JUMUAH_MINUTE, 0, 0);
      if (at <= now) continue;
      notifs.push({
        id: id++,
        title: "Jumu'ah Mubarak",
        body: "Read Surah Al-Kahf and prepare for Jumu'ah prayer.",
        schedule: { at },
        url: "/quran/18",
        tier: 3,
      });
    }
  }

  // ── Streak-protection nudge (evening; today only if not yet started) ──
  if (prefs.streak) {
    let doneToday = false;
    try {
      doneToday = localStorage.getItem(LAST_ACTIVE_KEY) === dayKey(now);
    } catch {
      // ignore
    }
    for (let i = 0; i <= ENGAGEMENT_DAYS; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      const at = new Date(day);
      at.setHours(STREAK_HOUR, STREAK_MINUTE, 0, 0);
      if (at <= now) continue;
      if (i === 0 && doneToday) continue; // already kept the streak today
      notifs.push({
        id: id++,
        title: "Keep your streak going",
        body: "You haven't completed today's checklist yet — a little before the day ends keeps your streak alive.",
        schedule: { at },
        url: "/muslim-daily",
        tier: 3,
      });
    }
  }

  // iOS 64-pending cap. Fill by priority tier (adhan first, then pre-prayer, then
  // engagement) so engagement nudges can never push out the adhan. Soonest-first
  // within each tier; per-tier budgets guarantee adhan coverage.
  notifs.sort((a, b) => a.schedule.at.getTime() - b.schedule.at.getTime());
  const toSchedule: Notif[] = [];
  for (const tier of [1, 2, 3] as const) {
    let taken = 0;
    for (const n of notifs) {
      if (n.tier !== tier) continue;
      if (toSchedule.length >= MAX_NOTIFICATIONS) break;
      if (taken >= TIER_CAPS[tier]) break;
      toSchedule.push(n);
      taken++;
    }
  }

  // First-time confirmation: a quick ping so the user knows notifications work,
  // instead of waiting for the next scheduled one. Kept generic (adhan is off by
  // default) and uses the default sound rather than the 25s adhan.
  if (newlyGranted) {
    toSchedule.push({
      id: 999,
      title: "Notifications on",
      body: "You're all set — you'll get the reminders you've turned on, in shā' Allah.",
      schedule: { at: new Date(now.getTime() + 4000) },
      tier: 1,
    });
  }

  if (!toSchedule.length) return;

  try {
    await L.schedule({
      notifications: toSchedule.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        schedule: n.schedule,
        ...(n.sound ? { sound: n.sound } : {}),
        ...(n.interruptionLevel ? { interruptionLevel: n.interruptionLevel } : {}),
        ...(n.url ? { extra: { url: n.url } } : {}),
      })),
    });
  } catch (e) {
    console.error("[notifications] schedule failed", e);
  }
}

/**
 * Route taps on notifications to their relevant screen. Call once on app start
 * with the app's navigate function (router.push). Returns a cleanup fn.
 */
export function registerNotificationTapHandler(
  navigate: (url: string) => void
): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};
  const handle = LocalNotifications.addListener(
    "localNotificationActionPerformed",
    (action) => {
      const url = (action?.notification?.extra as { url?: string } | undefined)?.url;
      if (url) navigate(url);
    }
  );
  return () => {
    void handle.then((h) => h.remove()).catch(() => {});
  };
}

/** Debounced reschedule — for rapid Settings toggles. */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
export function rescheduleNotificationsDebounced(promptIfNeeded = false) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void scheduleAllNotifications(promptIfNeeded);
  }, 600);
}
