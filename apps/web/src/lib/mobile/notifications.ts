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
import { buildIslamicEventNotifications } from "@/lib/mobile/islamic-events";

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

// One constant serves both platforms. iOS loads `adhan.caf` from the app
// bundle; Android resolves a sound by RESOURCE BASE NAME — AssetUtil strips the
// extension — so the same string finds `res/raw/adhan.m4a`. That file is the
// iOS 25s clip transcoded to AAC (298KB), so the two platforms sound identical
// and the full 3-minute adhan.mp3 is not shipped twice.
const ADHAN_SOUND = "adhan.caf";

// ── Android notification channels ─────────────────────────────────────────
//
// From Android 8 the CHANNEL owns importance, sound and vibration — a
// notification cannot override them, and a per-notification `sound` is ignored
// entirely. Scheduling without a channelId (which is what this file did) drops
// everything onto Capacitor's implicit "default" channel at IMPORTANCE_DEFAULT:
// a sound, but NO heads-up banner and NO vibration. That asymmetry is why an
// FCM push was noticed on a real device (its channel is importance 4) while
// every prayer notification would have arrived silently in the shade.
//
// ⚠️ A channel is IMMUTABLE once created. createChannel on an existing id is
// silently ignored, so importance/sound CANNOT be raised in place — hence the
// _v1 suffix. To change one of these, bump the suffix to mint a new channel;
// editing the values alone would be a no-op on every device that already ran
// the app, which is the failure mode this comment exists to prevent.
//
// Splitting by kind is also what lets someone mute the daily verse without
// muting the adhan — impossible while everything shared one channel.
const CH_ADHAN = "hiqmah_adhan_v1";
const CH_PRAYER = "hiqmah_prayer_v1";
const CH_DAILY = "hiqmah_daily_v1";
const CH_EVENTS = "hiqmah_events_v1";

let channelsReady = false;

/** Create the Android channels. No-op on iOS, and after the first success. */
async function ensureChannels(): Promise<void> {
  if (channelsReady) return;
  if (Capacitor.getPlatform() !== "android") {
    channelsReady = true;
    return;
  }
  // NOTE: CH_ADHAN is deliberately absent. It is created natively in
  // AdhanChannel.java from MainActivity.onCreate, because the plugin's
  // createChannel() hard-codes USAGE_NOTIFICATION audio attributes, which Do Not
  // Disturb and the silent-ringer both suppress — the adhan needs USAGE_ALARM to
  // survive Bedtime mode at Fajr. Creating it here too would be harmless (a
  // channel that exists is not recreated) but would be a trap: if the native
  // call ever regressed, this would silently register the id with the wrong
  // attributes and freeze them, since a channel is immutable once created.
  const channels = [
    {
      id: CH_PRAYER,
      name: "Prayer times",
      description: "Prayer times and the 15-minute heads-up before each",
      importance: 4 as const,
      vibration: true,
    },
    {
      id: CH_DAILY,
      name: "Daily reminders",
      description: "Today's verse, hadith, reflection and the streak nudge",
      importance: 4 as const,
      vibration: true,
    },
    {
      id: CH_EVENTS,
      name: "Islamic dates",
      description: "Jumu'ah, Ramadan, Eid, the white days and other occasions",
      importance: 4 as const,
      vibration: true,
    },
  ];
  for (const c of channels) {
    try {
      await LocalNotifications.createChannel({ visibility: 1, ...c });
    } catch (e) {
      // Keep going: a channel that fails to create falls back to "default",
      // which is degraded but still delivers. Silence here would hide it.
      console.error("[notifications] createChannel failed", c.id, e);
    }
  }
  channelsReady = true;
}
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

// ── Pending-notification budgets ──────────────────────────────────────────
//
// iOS enforces a hard 64-pending limit per app. Android's is ~500. This file
// applied the iOS number to BOTH, which starved the Android schedule badly:
// with 63 slots split {1:35, 2:14, 3:6, 4:8}, the six tier-3 slots were taken
// by whichever engagement nudges came soonest, so Jumu'ah — also tier 3 — never
// got a slot at all, and the nudges themselves ran out after ~1.3 days.
//
// Resolved per-platform at CALL time, not module load: this module is imported
// during the static export, where Capacitor reports "web".
const IOS_MAX = 63; // 64-pending cap, one slot of margin
const ANDROID_MAX = 400; // comfortably inside Android's ~500
// Filled in tier order, so a lower-priority nudge can never displace the adhan.
// Unused budget is NOT borrowed down — adhan coverage stays guaranteed.
const IOS_TIER_CAPS: Record<number, number> = { 1: 35, 2: 14, 3: 6, 4: 8 };
const ANDROID_TIER_CAPS: Record<number, number> = { 1: 120, 2: 120, 3: 100, 4: 60 };
// How far ahead the engagement nudges (verse/hadith/reflection/streak) run. On
// iOS this stays short so they cannot crowd the adhan out of 64 slots; Android
// has the headroom to match the prayer horizon, which matters because NOTHING
// re-arms the schedule until the app is next opened.
const IOS_ENGAGEMENT_DAYS = 3;

const isAndroid = () => Capacitor.getPlatform() === "android";

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

// Deep-link target for a daily inspiration: the notification banner truncates
// the body, so the tap must land on the actual verse/hadith. Reuses the same
// reader deep links HadithRefText produces (/quran/S?v=A scrolls the reader;
// /hadith/{collection}/{book}?h=N highlights the entry).
const HADITH_COLLECTION_SLUGS: [prefix: string, slug: string][] = [
  ["Sahih al-Bukhari", "bukhari"],
  ["Sahih Muslim", "muslim"],
  ["Sunan Abi Dawud", "abudawud"],
  ["Jami at-Tirmidhi", "tirmidhi"],
  ["Musnad Ahmad", "ahmad"],
];

function urlForInspiration(insp: { type: string; reference: string }): string {
  if (insp.type === "Quran") {
    // "Quran 13:28" → /quran/13?v=28
    const m = insp.reference.match(/(\d+):(\d+)/);
    return m ? `/quran/${m[1]}?v=${m[2]}` : "/quran";
  }
  for (const [prefix, slug] of HADITH_COLLECTION_SLUGS) {
    if (insp.reference.startsWith(prefix)) {
      // "Sahih Muslim 48:104" → /hadith/muslim/48?h=104; a bare number
      // (e.g. "Musnad Ahmad 205") lands on the collection page.
      const m = insp.reference.slice(prefix.length).match(/(\d+):(\d+)/);
      return m ? `/hadith/${slug}/${m[1]}?h=${m[2]}` : `/hadith/${slug}`;
    }
  }
  return "/";
}

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
 * ANDROID ONLY — whether the OS will let us schedule EXACT alarms.
 *
 * This is the difference between the adhan sounding at the prayer time and
 * sounding "sometime around" it. Android 12+ downgrades alarms to inexact
 * without this permission and they drift by minutes, silently — for this app
 * that is the whole product failing without any error to point at.
 *
 * We declare SCHEDULE_EXACT_ALARM (see android/app/src/main/AndroidManifest.xml
 * for why not USE_EXACT_ALARM), which Android 13+ denies by default, so it has
 * to be asked for. iOS has no equivalent concept and always reports true.
 */
export async function canScheduleExactAlarms(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (Capacitor.getPlatform() !== "android") return true;
  try {
    const res = await LocalNotifications.checkExactNotificationSetting();
    return res.exact_alarm === "granted";
  } catch {
    // Older plugin/OS combinations simply do not gate exact alarms; treating a
    // failure as "denied" would nag users we cannot actually help.
    return true;
  }
}

/**
 * ANDROID ONLY — send the user to the system "Alarms & reminders" screen.
 *
 * There is no in-app grant for this one; the OS only accepts the change from
 * its own settings page, so this navigates away and the answer arrives when the
 * user comes back. Call `canScheduleExactAlarms()` again on resume.
 */
export async function openExactAlarmSettings(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (Capacitor.getPlatform() !== "android") return true;
  try {
    const res = await LocalNotifications.changeExactNotificationSetting();
    return res.exact_alarm === "granted";
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
  // The whole body runs unguarded below, and it is long: prayer maths, calendar
  // building, localStorage reads, plugin calls. A throw anywhere past the cancel
  // leaves the user with an EMPTY schedule and no symptom whatsoever — the app
  // looks fine and simply never notifies again. Nothing surfaces that, so this
  // boundary exists to make the failure at least visible in a log.
  try {
    await scheduleAllNotificationsImpl(promptIfNeeded);
  } catch (e) {
    console.error(
      "[notifications] scheduleAllNotifications threw — the schedule may now be empty",
      e
    );
  }
}

async function scheduleAllNotificationsImpl(
  promptIfNeeded = false
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const L = LocalNotifications;

  // ── Permission FIRST. Only then touch the existing schedule. ────────────
  //
  // ⭐ This ORDER is load-bearing; it is not stylistic.
  //
  // This function used to cancel every pending notification at the top, before
  // resolving permission. Because the permission check below returns early, an
  // app open while notifications were denied EMPTIED the schedule and refilled
  // nothing. Worse, the plugin rejects the whole schedule() call when
  // notifications are disabled (LocalNotificationManager.java: areNotificationsEnabled),
  // so there was no path that could repair it.
  //
  // That turned a completely ordinary sequence into permanent silence:
  //
  //     deny at onboarding  ->  later enable notifications in Android Settings
  //     (which runs NONE of our code)  ->  never notified again, because only a
  //     foreground app open re-arms the schedule.
  //
  // It is exactly what happened on the founder's device: notifications were off
  // from install on 08-18 until 08-21 23:59:44, were granted from the Settings
  // app, and not one local notification had ever been delivered — verified
  // against the alarm delivery history, which held only WIDGET_REFRESH entries.
  //
  // Resolving permission first makes a denied run a NO-OP instead of a
  // destructive one, so an existing good schedule survives.
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

  // Channels must exist before anything is scheduled onto them: a notification
  // naming a channel that does not exist falls back to "default" and loses its
  // sound and importance.
  await ensureChannels();

  // ── Capture what is scheduled. Do NOT cancel it yet. ────────────────────
  //
  // Moving the permission gate above the cancel fixed one failure mode. It did
  // not fix the shape: anything that goes wrong in the ~290 lines between here
  // and the schedule() call still leaves the device with ZERO notifications and
  // no symptom — the same defect as the original bug, one layer down.
  //
  // And it is reachable. schedule() rejects the ENTIRE call when
  // areNotificationsEnabled() is false (LocalNotificationManager.java:132-138),
  // which is a DIFFERENT check from the POST_NOTIFICATIONS grant gated on above
  // and can disagree with it. One rejection would destroy a full schedule and
  // replace it with nothing, on every app open, forever.
  //
  // So: schedule first, then retire only what the new schedule did not reuse.
  // Safe because schedule() dismisses and re-arms each id in place
  // (LocalNotificationManager.java:148-150), so reusing an id overwrites rather
  // than duplicating.
  let previouslyPending: number[] = [];
  try {
    previouslyPending = (await L.getPending()).notifications.map((n) => n.id);
  } catch (e) {
    console.error("[notifications] getPending failed", e);
  }
  const cancelIds = async (ids: number[]) => {
    if (!ids.length) return;
    try {
      await L.cancel({ notifications: ids.map((id) => ({ id })) });
    } catch (e) {
      console.error("[notifications] cancel failed", e);
    }
  };

  const prefs = getNotificationPrefs();
  const settings = getPrayerSettings();
  const loc = getCachedLocation();

  // Per-platform budgets (see the constants above for why these differ).
  const android = isAndroid();
  // Reserve a slot for the newly-granted confirmation ping, which is appended
  // AFTER the tier loop. Without this, a first-grant run on iOS hands the system
  // 64 requests — exactly Apple's cap — and the "one slot of margin" documented
  // on IOS_MAX is silently spent.
  const maxNotifications =
    (android ? ANDROID_MAX : IOS_MAX) - (newlyGranted ? 1 : 0);
  const tierCaps = android ? ANDROID_TIER_CAPS : IOS_TIER_CAPS;
  const engagementDays = android ? DAYS_AHEAD : IOS_ENGAGEMENT_DAYS;

  const anyAdhan =
    prefs.adhanEnabled && PRAYER_KEYS.some((k) => prefs.adhanPerPrayer[k]);
  // A plain prayer-time notification, default on (undefined = on for older prefs).
  const wantPrayerNotif = prefs.prayerNotif !== false;
  const wantDaily = prefs.todaysVerse || prefs.todaysHadith;
  const wantReminder = prefs.todaysReminder && REMINDERS.length > 0;
  // Islamic-event notices are location-independent (they're purely calendar-based),
  // so they keep scheduling even when every prayer/engagement toggle is off.
  const wantEvents = prefs.islamicEvents !== false || prefs.whiteDays !== false;
  if (
    !anyAdhan &&
    !wantPrayerNotif &&
    !prefs.prePrayer &&
    !wantDaily &&
    !wantReminder &&
    !prefs.jumuah &&
    !prefs.streak &&
    !wantEvents
  ) {
    // Every category is off, so an empty schedule is the CORRECT end state —
    // one of only two places a bare cancel is right.
    await cancelIds(previouslyPending);
    return;
  }

  const now = new Date();
  type Notif = {
    id: number;
    title: string;
    body: string;
    schedule: { at: Date; allowWhileIdle?: boolean };
    sound?: string; // iOS only — on Android 8+ the CHANNEL owns the sound
    channelId?: string; // Android only — ignored by iOS
    url?: string; // deep-link target on tap
    tier: 1 | 2 | 3 | 4; // 1=adhan (protected), 2=pre-prayer, 3=engagement, 4=Islamic events
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
            channelId: adhanForThis ? CH_ADHAN : CH_PRAYER,
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
              channelId: CH_PRAYER,
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
    for (let i = 0; i <= engagementDays; i++) {
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
              channelId: CH_DAILY,
              url: urlForInspiration(insp),
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
              channelId: CH_DAILY,
              url: urlForInspiration(insp),
              tier: 3,
            });
        }
      }
    }
  }

  // ── Today's Reminder (the day's reflection — matches the Reminders tab) ──
  if (wantReminder) {
    for (let i = 0; i <= engagementDays; i++) {
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
        channelId: CH_DAILY,
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
        channelId: CH_EVENTS,
        // Tier 4, not 3. As a tier-3 item it competed with the daily nudges for
        // six iOS slots and lost on time-ordering EVERY week — Jumu'ah simply
        // never scheduled. It belongs with the other calendar-driven notices,
        // which are sparse enough that it always gets a slot there.
        tier: 4,
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
    for (let i = 0; i <= engagementDays; i++) {
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
        channelId: CH_DAILY,
        url: "/muslim-daily",
        tier: 3,
      });
    }
  }

  // ── Islamic events & occasions (calendar-based, no location needed) ──
  // New Year, ʿĀshūrāʾ, Ramadan, the last 10 nights, Eid, the first 10 days of
  // Dhul-Ḥijjah + Arafah, and (separately gated) the monthly White Days. Computed
  // on-device from the Hijri calendar for the next ~60 days. See islamic-events.ts.
  if (wantEvents) {
    const events = buildIslamicEventNotifications(now, {
      islamicEvents: prefs.islamicEvents !== false,
      whiteDays: prefs.whiteDays !== false,
    });
    for (const ev of events) {
      notifs.push({
        id: id++,
        title: ev.title,
        body: ev.body,
        schedule: { at: ev.at },
        channelId: CH_EVENTS,
        url: ev.url,
        tier: 4,
      });
    }
  }

  // iOS 64-pending cap. Fill by priority tier (adhan first, then pre-prayer, then
  // engagement, then Islamic events) so lower-priority nudges can never push out
  // the adhan. Soonest-first within each tier; per-tier budgets guarantee adhan
  // coverage.
  notifs.sort((a, b) => a.schedule.at.getTime() - b.schedule.at.getTime());
  const toSchedule: Notif[] = [];
  const candidates: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const scheduled: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const tier of [1, 2, 3, 4] as const) {
    let taken = 0;
    for (const n of notifs) {
      if (n.tier !== tier) continue;
      candidates[tier]++;
      if (toSchedule.length >= maxNotifications || taken >= tierCaps[tier]) {
        continue;
      }
      toSchedule.push(n);
      taken++;
    }
    scheduled[tier] = taken;
  }
  // A TRIMMED tier is by design — on iOS the caps always bind, so warning on
  // every trim would fire on every launch and drown the signal it exists to
  // carry. A tier that gets ZERO despite having candidates is STARVATION, which
  // is precisely how Jumu'ah went missing every single week without a symptom.
  const starved = ([1, 2, 3, 4] as const).filter(
    (t) => scheduled[t] === 0 && candidates[t] > 0
  );
  if (starved.length) {
    console.warn(
      "[notifications] TIER STARVED — 0 scheduled despite candidates:",
      starved.map((t) => `tier${t}=0/${candidates[t]}`).join(" ")
    );
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
      channelId: CH_PRAYER, // not CH_ADHAN — this must not play the 25s adhan
      tier: 1,
    });
  }

  if (!toSchedule.length) {
    // Nothing to schedule (e.g. every candidate time is in the past) — the
    // second and last place an unconditional cancel is correct.
    await cancelIds(previouslyPending);
    return;
  }

  try {
    await L.schedule({
      notifications: toSchedule.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        // ⭐ allowWhileIdle is what makes an alarm survive Doze on Android, and
        // it is applied HERE, at the single choke point every notification
        // passes through, so a future call site cannot forget it.
        //
        // MEASURED on a Galaxy A17 in forced deep idle: without it, Capacitor
        // schedules setExact(RTC) — exact, but NON-WAKING and Doze-deferrable —
        // and dumpsys reported our prayer alarm pushed back by device_idle to
        // +37m53s. It simply did not fire at the prayer time. With it, the
        // plugin takes the setExactAndAllowWhileIdle(RTC_WAKEUP) branch, which
        // wakes the device.
        //
        // For this app that is not a nicety: an adhan that arrives 38 minutes
        // late, because the phone was asleep in a pocket, is the product
        // failing at the one thing it promises. Android permits a handful of
        // such wakeups per app per hour — far more than five prayers a day.
        schedule: { ...n.schedule, allowWhileIdle: true },
        ...(n.sound ? { sound: n.sound } : {}),
        // Android 8+ takes importance, sound and vibration from the CHANNEL and
        // ignores the per-notification `sound` above; iOS ignores channelId.
        // Both are sent so each platform picks up the one it honours.
        ...(n.channelId ? { channelId: n.channelId } : {}),
        ...(n.interruptionLevel ? { interruptionLevel: n.interruptionLevel } : {}),
        ...(n.url ? { extra: { url: n.url } } : {}),
      })),
    });
    // Only now retire the leftovers: ids the new schedule did not reuse. If
    // schedule() threw, we never get here and the OLD schedule stays live —
    // degraded (stale prayer times) but never silent, which is the whole point.
    const fresh = new Set(toSchedule.map((n) => n.id));
    await cancelIds(previouslyPending.filter((id) => !fresh.has(id)));
  } catch (e) {
    console.error(
      "[notifications] schedule failed — previous schedule left intact",
      e
    );
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
