/**
 * Local notification scheduling for Hidden Hiqmah (iOS/Android via Capacitor).
 *
 * Prayer times are deterministic, so we schedule everything LOCALLY on the
 * device (no server / APNs). We compute the next ~10 days of prayer times from
 * the cached location + the user's calculation method, then schedule:
 *   - Adhan at each enabled prayer (custom adhan.caf sound)
 *   - Pre-prayer reminders (default sound, 15 min before)
 *   - Daily verse/hadith at a fixed morning time
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
const PRE_PRAYER_MINUTES = 15;
const DAILY_HOUR = 8; // 8:00 AM local — daily verse/hadith
const REMINDER_HOUR = 20; // 8:00 PM local — today's reflection (evening wind-down)
const STREAK_HOUR = 21; // 9:00 PM local — streak-protection nudge
const JUMUAH_HOUR = 10; // 10:00 AM Friday
const LAST_ACTIVE_KEY = "hiqmah-daily-last-active"; // YYYY-MM-DD of last checklist activity
const DAYS_AHEAD = 10;
const MAX_NOTIFICATIONS = 60; // stay under iOS's 64 pending cap

type Timings = Record<string, string>;

function cleanTime(raw: string): string {
  return raw.replace(/\s*\(.*\)/, "").trim();
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Today's-style inspiration for an arbitrary date (day-of-year rotation). */
function inspirationForDate(d: Date, type?: "Quran" | "Hadith") {
  const pool = type
    ? dailyInspirations.filter((x) => x.type === type)
    : dailyInspirations;
  if (!pool.length) return null;
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86_400_000);
  return pool[dayOfYear % pool.length];
}

/** Fetch prayer-time calendar(s) covering the next DAYS_AHEAD days. */
async function fetchPrayerTimes(
  lat: number,
  lng: number,
  method: number,
  school: number
): Promise<Map<string, Timings>> {
  const map = new Map<string, Timings>();
  const now = new Date();
  const months = new Set<string>();
  for (let i = 0; i <= DAYS_AHEAD; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    months.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
  }
  for (const ym of months) {
    const [year, month] = ym.split("-");
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`
      );
      if (!res.ok) continue;
      const json = await res.json();
      for (const day of json.data || []) {
        const greg: string | undefined = day?.date?.gregorian?.date; // DD-MM-YYYY
        if (!greg) continue;
        const [dd, mm, yyyy] = greg.split("-");
        map.set(`${yyyy}-${mm}-${dd}`, day.timings);
      }
    } catch {
      // skip this month
    }
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
  const wantDaily = prefs.todaysVerse || prefs.todaysHadith;
  const wantReminder = prefs.todaysReminder && REMINDERS.length > 0;
  if (
    !anyAdhan &&
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
  };
  const notifs: Notif[] = [];
  let id = 1000;

  // ── Prayer-based (adhan + pre-prayer) — needs a location ──
  if ((anyAdhan || prefs.prePrayer) && loc) {
    const school = settings.asrMethod === "hanafi" ? 1 : 0;
    const times = await fetchPrayerTimes(
      loc.lat,
      loc.lng,
      settings.calcMethod,
      school
    );
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

        if (anyAdhan && prefs.adhanPerPrayer[pk]) {
          notifs.push({
            id: id++,
            title: `${PRAYER_LABEL[pk]}${loc.city ? ` · ${loc.city}` : ""}`,
            body: `It's time for ${PRAYER_LABEL[pk]} prayer.`,
            schedule: { at },
            sound: ADHAN_SOUND,
            url: "/salah",
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
            });
          }
        }
      }
    }
  }

  // ── Daily verse / hadith ──
  if (wantDaily) {
    const type =
      prefs.todaysVerse && prefs.todaysHadith
        ? undefined
        : prefs.todaysVerse
        ? "Quran"
        : "Hadith";
    for (let i = 0; i <= DAYS_AHEAD; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      const at = new Date(day);
      at.setHours(DAILY_HOUR, 0, 0, 0);
      if (at <= now) continue;
      const insp = inspirationForDate(at, type);
      if (!insp) continue;
      notifs.push({
        id: id++,
        title: insp.type === "Quran" ? "Today's Verse" : "Today's Hadith",
        body: `${insp.english} — ${insp.reference}`,
        schedule: { at },
        url: "/",
      });
    }
  }

  // ── Today's Reminder (the day's reflection — matches the Reminders tab) ──
  if (wantReminder) {
    for (let i = 0; i <= DAYS_AHEAD; i++) {
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
      at.setHours(JUMUAH_HOUR, 0, 0, 0);
      if (at <= now) continue;
      notifs.push({
        id: id++,
        title: "Jumu'ah Mubarak",
        body: "Read Surah Al-Kahf and prepare for Jumu'ah prayer.",
        schedule: { at },
        url: "/quran/18",
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
    for (let i = 0; i <= DAYS_AHEAD; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      const at = new Date(day);
      at.setHours(STREAK_HOUR, 0, 0, 0);
      if (at <= now) continue;
      if (i === 0 && doneToday) continue; // already kept the streak today
      notifs.push({
        id: id++,
        title: "Keep your streak going",
        body: "You haven't completed today's checklist yet — a little before the day ends keeps your streak alive.",
        schedule: { at },
        url: "/muslim-daily",
      });
    }
  }

  // iOS 64-pending cap: keep the soonest MAX_NOTIFICATIONS.
  notifs.sort((a, b) => a.schedule.at.getTime() - b.schedule.at.getTime());
  const toSchedule = notifs.slice(0, MAX_NOTIFICATIONS);

  // First-time confirmation: fire the adhan immediately so the user hears it
  // works, instead of waiting for the next prayer.
  if (newlyGranted) {
    toSchedule.push({
      id: 999,
      title: "Notifications enabled",
      body: "You'll hear the adhan at prayer times, in shā' Allah.",
      schedule: { at: new Date(now.getTime() + 4000) },
      sound: ADHAN_SOUND,
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
