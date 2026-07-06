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
// Per-prayer adhan body — a short, authentic reminder for each prayer, verified
// against the local hadith corpus (Fajr=Muslim 657, Dhuhr=Tirmidhi 478,
// Asr=Bukhari 552, Maghrib=Bukhari 528 [general 5-prayers virtue],
// Isha=Muslim 656).
const ADHAN_BODY: Record<PrayerKey, string> = {
  fajr: "Pray Fajr — you'll be under Allah's protection all day. (Muslim)",
  dhuhr: "Dhuhr falls when the gates of heaven open — send a good deed up with it. (Tirmidhi)",
  asr: "Don't miss Asr — the Prophet ﷺ said missing it is like losing your family and wealth. (Bukhari)",
  maghrib: "The five daily prayers wash away sins like a river you bathe in five times a day. (Bukhari)",
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
const DAILY_HOUR = 8; // 8:00 AM local — daily verse/hadith
const REMINDER_HOUR = 20; // 8:00 PM local — today's reflection (evening wind-down)
const STREAK_HOUR = 21; // 9:00 PM local — streak-protection nudge
const JUMUAH_HOUR = 10; // 10:00 AM Friday
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
    tier: 1 | 2 | 3; // 1=adhan (protected), 2=pre-prayer, 3=engagement
  };
  const notifs: Notif[] = [];
  let id = 1000;

  // ── Prayer-based (adhan + pre-prayer) — needs a location ──
  if ((anyAdhan || prefs.prePrayer) && loc) {
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

        if (anyAdhan && prefs.adhanPerPrayer[pk]) {
          const title = [PRAYER_LABEL[pk], loc.city, fmtClock(at)]
            .filter(Boolean)
            .join(" · "); // e.g. "Maghrib · Toronto · 7:12 PM"
          notifs.push({
            id: id++,
            title,
            body: ADHAN_BODY[pk],
            schedule: { at },
            sound: ADHAN_SOUND,
            url: "/salah",
            tier: 1,
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
  if (wantDaily) {
    for (let i = 0; i <= ENGAGEMENT_DAYS; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      const at = new Date(day);
      at.setHours(DAILY_HOUR, 0, 0, 0);
      if (at <= now) continue;
      if (prefs.todaysVerse) {
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
      if (prefs.todaysHadith) {
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
      at.setHours(JUMUAH_HOUR, 0, 0, 0);
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
      at.setHours(STREAK_HOUR, 0, 0, 0);
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

// ── Notification test harness (Settings → Notification tests) ─────────────
// Fire ONE notification of a given kind ~4s out, using the SAME title / body /
// sound / deep-link the scheduler emits — so a test truly exercises delivery
// and tap-routing (registerNotificationTapHandler reads the same extra.url).
export type TestNotificationKind =
  | "adhan"
  | "prePrayer"
  | "dailyVerse"
  | "dailyHadith"
  | "todaysReminder"
  | "jumuah"
  | "streak"
  | "enabledConfirmation";

/**
 * Every distinct notification the scheduler can emit, in a stable order. Drives
 * the Settings test panel and each test's notification id (TEST_ID_BASE + index).
 */
export const TEST_NOTIFICATION_KINDS: { kind: TestNotificationKind; label: string }[] = [
  { kind: "adhan", label: "Adhan (prayer time)" },
  { kind: "prePrayer", label: "Pre-prayer reminder" },
  { kind: "dailyVerse", label: "Today's verse" },
  { kind: "dailyHadith", label: "Today's hadith" },
  { kind: "todaysReminder", label: "Today's reminder" },
  { kind: "jumuah", label: "Jumu'ah reminder" },
  { kind: "streak", label: "Streak nudge" },
  { kind: "enabledConfirmation", label: "Enabled confirmation" },
];

/** Build the exact payload the scheduler would emit for `kind`, with live content. */
function buildTestNotification(kind: TestNotificationKind): {
  title: string;
  body: string;
  sound?: string;
  url?: string;
} {
  const now = new Date();
  const samplePrayer: PrayerKey = "dhuhr"; // representative prayer for adhan/pre-prayer
  switch (kind) {
    case "adhan": {
      const loc = getCachedLocation();
      return {
        title: [PRAYER_LABEL[samplePrayer], loc?.city, fmtClock(now)]
          .filter(Boolean)
          .join(" · "),
        body: ADHAN_BODY[samplePrayer],
        sound: ADHAN_SOUND,
        url: "/salah",
      };
    }
    case "prePrayer":
      return {
        title: `${PRAYER_LABEL[samplePrayer]} in ${PRE_PRAYER_MINUTES} min`,
        body: `Get ready for ${PRAYER_LABEL[samplePrayer]} prayer.`,
        url: "/salah",
      };
    case "dailyVerse": {
      const insp = inspirationForDate(now, "Quran");
      return {
        title: "Today's Verse",
        body: insp ? `${insp.english} — ${insp.reference}` : "Today's verse.",
        url: "/",
      };
    }
    case "dailyHadith": {
      const insp = inspirationForDate(now, "Hadith");
      return {
        title: "Today's Hadith",
        body: insp ? `${insp.english} — ${insp.reference}` : "Today's hadith.",
        url: "/",
      };
    }
    case "todaysReminder": {
      const r = REMINDERS[dailyIndex(dayKey(now), REMINDERS.length)];
      const ref = r
        ? r.sourceKind === "quran"
          ? `Qur'an ${r.sourceRef}`
          : r.sourceRef
        : "";
      return {
        title: "Today's Reminder",
        body: r ? `${r.textEn} — ${ref}` : "Today's reflection.",
        url: "/muslim-daily?tab=reminders",
      };
    }
    case "jumuah":
      return {
        title: "Jumu'ah Mubarak",
        body: "Read Surah Al-Kahf and prepare for Jumu'ah prayer.",
        url: "/quran/18",
      };
    case "streak":
      return {
        title: "Keep your streak going",
        body: "You haven't completed today's checklist yet — a little before the day ends keeps your streak alive.",
        url: "/muslim-daily",
      };
    case "enabledConfirmation":
      return {
        title: "Notifications on",
        body: "You're all set — you'll get the reminders you've turned on, in shā' Allah.",
      };
  }
}

const TEST_ID_BASE = 90000;

/**
 * Fire a single test notification of `kind` ~4s from now, mirroring the real
 * scheduled version (title/body/sound/deep-link). Prompts for OS permission if
 * needed. Returns whether it was scheduled. Native-only; no-op on web.
 */
export async function sendTestNotification(
  kind: TestNotificationKind
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  const granted = await ensureNotificationPermission();
  if (!granted) return false;
  const n = buildTestNotification(kind);
  const idx = TEST_NOTIFICATION_KINDS.findIndex((k) => k.kind === kind);
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: TEST_ID_BASE + (idx >= 0 ? idx : 0),
          title: n.title,
          body: n.body,
          schedule: { at: new Date(Date.now() + 4000) },
          ...(n.sound ? { sound: n.sound } : {}),
          ...(n.url ? { extra: { url: n.url } } : {}),
        },
      ],
    });
    return true;
  } catch (e) {
    console.error("[notifications] test schedule failed", e);
    return false;
  }
}
