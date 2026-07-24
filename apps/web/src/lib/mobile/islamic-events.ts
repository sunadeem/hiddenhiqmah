/**
 * Islamic events & occasions — local notification builder.
 *
 * Hijri dates are deterministic (Umm al-Qurā), so — exactly like prayer times —
 * we compute the upcoming occasions ON-DEVICE and schedule them as local
 * notifications. No server, no cron, works offline, zero maintenance.
 *
 * We iterate the next ~60 Gregorian days, read each day's Hijri date via
 * `Intl.DateTimeFormat('en-u-ca-islamic-umalqura')` (the same converter the app
 * already uses in packages/ui/lib/storage.ts → getCurrentHijriMonthDay), and emit
 * notifications per the matrix in docs/islamic-events-notifications.md:
 *
 *   - Single-day occasion  → 3 days before + day-of                 (10:00 AM)
 *   - Ramadan (prep-heavy)  → 1 week before + day-of                (10:00 AM)
 *   - Multi-day (first 10 of Dhul-Ḥijjah)  → eve + each day 1–10    (10:00 AM)
 *   - Last 10 nights of Ramadan  → eve + each odd night             (8:30 PM)
 *   - White Days (recurring monthly)  → eve of the 13th             (10:00 AM)
 *
 * The three DEBATED occasions (Mawlid, Isrāʾ & Miʿrāj, Mid-Shaʿbān) are included
 * as INFORMATIONAL-only day-of notices (no claim of special worship), mirroring
 * the neutral framing the /islamic-calendar page already uses.
 *
 * Titles/bodies are VERBATIM from docs/islamic-events-notifications.md. Deep-link
 * `url`s point at real app routes (verified against src/app). This module returns
 * plain descriptors; the scheduler (notifications.ts) assigns ids + a dedicated
 * low-priority tier so events can never crowd out the adhan within iOS's cap.
 */

export type IslamicEventNotif = {
  title: string;
  body: string;
  /** Local fire time (already in the future — past ones are filtered out). */
  at: Date;
  /** Deep-link target on tap (a real /app route). */
  url: string;
};

// Fire times (see docs §"FIRE TIMES"): a calm 10 AM morning nudge for
// advance/day-of notices; a 8:30 PM evening nudge for the Laylat al-Qadr cluster.
const DAY_HOUR = 10; // 10:00 AM local — advance & day-of notices
const NIGHT_HOUR = 20; // 8:30 PM local — Laylat al-Qadr night nudges
const NIGHT_MINUTE = 30;

const HORIZON_DAYS = 60; // rolling window refilled on every app open
const ADVANCE_DAYS = 3; // single-occasion advance notice
const RAMADAN_PREP_DAYS = 7; // Ramadan "1 week before" prep notice

// Hijri month numbers (1-indexed).
const MUHARRAM = 1;
const RABI_AWWAL = 3;
const RAJAB = 7;
const SHABAN = 8;
const RAMADAN = 9;
const SHAWWAL = 10;
const DHUL_HIJJAH = 12;


// Deep-link targets — all verified to exist in src/app (routes + ?tab=/?sub=).
const URL_NEW_YEAR = "/islamic-calendar?tab=dates";
const URL_ASHURA = "/islamic-calendar?tab=months"; // Muharram detail (Ashura fast)
const URL_RAMADAN = "/ramadan";
const URL_LAST_TEN = "/ramadan?tab=last-ten";
const URL_QADR = "/ramadan?tab=last-ten&sub=laylatul-qadr";
const URL_EID_FITR = "/ramadan?tab=last-ten"; // "Last 10 Nights & Eid" section
const URL_DHUL_HIJJAH = "/hajj";
const URL_ARAFAH = "/hajj?tab=days";
const URL_EID_ADHA = "/hajj?tab=days";
const URL_WHITE_DAYS = "/islamic-calendar?tab=dates";
const URL_MAWLID = "/prophet-muhammad";
const URL_ISRA = "/salah"; // the five daily prayers were ordained on this night
const URL_MID_SHABAN = "/islamic-calendar?tab=months";

/** Hijri (Umm al-Qurā) month + day for a given date — same converter as storage.ts. */
function hijri(date: Date): { month: number; day: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
    }).formatToParts(date);
    const month = Number(parts.find((p) => p.type === "month")?.value ?? 0);
    const day = Number(parts.find((p) => p.type === "day")?.value ?? 0);
    return { month, day };
  } catch {
    return { month: 0, day: 0 };
  }
}

/**
 * Build the upcoming Islamic-event notifications for the next ~60 days.
 * @param now  reference "now" (fire times before this are dropped).
 * @param opts feature flags — `islamicEvents` gates the whole set; `whiteDays`
 *   independently gates only the monthly White Days reminder.
 */
export function buildIslamicEventNotifications(
  now: Date,
  opts: { islamicEvents: boolean; whiteDays: boolean }
): IslamicEventNotif[] {
  const out: IslamicEventNotif[] = [];
  if (!opts.islamicEvents && !opts.whiteDays) return out;

  const push = (
    on: Date,
    hour: number,
    minute: number,
    title: string,
    body: string,
    url: string
  ) => {
    const at = new Date(on);
    at.setHours(hour, minute, 0, 0);
    if (at > now) out.push({ title, body, at, url });
  };

  for (let i = 0; i <= HORIZON_DAYS; i++) {
    // Anchor each day at local noon so the Hijri conversion (which rolls at local
    // midnight) is unambiguous and immune to DST edges.
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    d.setHours(12, 0, 0, 0);

    const hijriDaysAhead = (n: number) => {
      const c = new Date(d);
      c.setDate(d.getDate() + n);
      return hijri(c);
    };

    const today = hijri(d);
    const tomorrow = hijriDaysAhead(1); // for "eve of …" detection
    const advance = hijriDaysAhead(ADVANCE_DAYS); // 3-days-before
    const week = hijriDaysAhead(RAMADAN_PREP_DAYS); // Ramadan 1-week-before

    if (opts.islamicEvents) {
      // ── Muharram ─────────────────────────────────────────────────────────
      // Islamic New Year (1 Muḥarram): 3 days before + day-of
      if (advance.month === MUHARRAM && advance.day === 1)
        push(d, DAY_HOUR, 0, "Islamic New Year approaches", "The new Hijri year begins in 3 days, on 1 Muḥarram.", URL_NEW_YEAR);
      if (today.month === MUHARRAM && today.day === 1)
        push(d, DAY_HOUR, 0, "Happy New Hijri Year", "Today begins a new Islamic year. A moment to renew your intentions.", URL_NEW_YEAR);

      // ʿĀshūrāʾ (10 Muḥarram): 3 days before + day-of (fired on both the 9th & 10th)
      if (advance.month === MUHARRAM && advance.day === 10)
        push(d, DAY_HOUR, 0, "ʿĀshūrāʾ is in 3 days", "Fasting the 10th of Muḥarram expiates the sins of the past year. Consider fasting the 9th & 10th.", URL_ASHURA);
      if (today.month === MUHARRAM && (today.day === 9 || today.day === 10))
        push(d, DAY_HOUR, 0, "Fast of ʿĀshūrāʾ", "Today is ʿĀshūrāʾ — a blessed day to fast.", URL_ASHURA);

      // ── Ramadan ──────────────────────────────────────────────────────────
      // 1 Ramadan: 1 week before + day-of
      if (week.month === RAMADAN && week.day === 1)
        push(d, DAY_HOUR, 0, "Ramadan is a week away", "Ramadan begins in about a week. Make up any missed fasts and plan your worship.", URL_RAMADAN);
      if (today.month === RAMADAN && today.day === 1)
        push(d, DAY_HOUR, 0, "Ramadan Mubarak", "The blessed month begins today. May Allah accept your fasting and prayer.", URL_RAMADAN);

      // Last 10 nights: eve of 21 Ramadan (night nudge) + each odd night
      if (tomorrow.month === RAMADAN && tomorrow.day === 21)
        push(d, NIGHT_HOUR, NIGHT_MINUTE, "The last 10 nights begin", "Seek Laylat al-Qadr — a night better than a thousand months. Increase in prayer and duʿāʾ.", URL_LAST_TEN);
      // Eve-based like the "begin" notice above (a night belongs to the day it
      // ushers in). Night 21 is covered by that "begin" notice, so 23–29 here.
      if (tomorrow.month === RAMADAN && [23, 25, 27, 29].includes(tomorrow.day))
        push(d, NIGHT_HOUR, NIGHT_MINUTE, "An odd night of the last 10", "Tonight could be Laylat al-Qadr. Say: Allāhumma innaka ʿafuwwun tuḥibbu-l-ʿafwa faʿfu ʿannī.", URL_QADR);

      // ── Shawwāl ──────────────────────────────────────────────────────────
      // Eid al-Fiṭr (1 Shawwāl): 3 days before + day-of
      if (advance.month === SHAWWAL && advance.day === 1)
        push(d, DAY_HOUR, 0, "Eid al-Fiṭr is in 3 days", "Eid al-Fiṭr is near. Remember your Zakāt al-Fiṭr before the Eid prayer.", URL_EID_FITR);
      if (today.month === SHAWWAL && today.day === 1)
        push(d, DAY_HOUR, 0, "Eid Mubarak", "Eid al-Fiṭr is today. Takbīr, the Eid prayer, and joy with family.", URL_EID_FITR);

      // ── Dhul-Ḥijjah (multi-day) ──────────────────────────────────────────
      // Eve of 1 Dhul-Ḥijjah + each of days 1–8 + Arafah (9) + Eid al-Aḍḥā (10)
      if (tomorrow.month === DHUL_HIJJAH && tomorrow.day === 1)
        push(d, DAY_HOUR, 0, "The best 10 days begin tomorrow", "The first 10 days of Dhul-Ḥijjah — the most beloved days for good deeds — begin tomorrow.", URL_DHUL_HIJJAH);
      if (today.month === DHUL_HIJJAH && today.day >= 1 && today.day <= 8)
        push(d, DAY_HOUR, 0, `Day ${today.day} of Dhul-Ḥijjah`, "These are the best days of the year — increase in dhikr, fasting, and charity.", URL_DHUL_HIJJAH);
      if (today.month === DHUL_HIJJAH && today.day === 9)
        push(d, DAY_HOUR, 0, "Day of ʿArafah", "The best day to fast — it expiates two years of sins. Make much duʿāʾ today.", URL_ARAFAH);
      if (today.month === DHUL_HIJJAH && today.day === 10)
        push(d, DAY_HOUR, 0, "Eid al-Aḍḥā Mubarak", "Eid al-Aḍḥā is today — the Eid prayer, takbīr, and the udḥiyah (sacrifice).", URL_EID_ADHA);

      // ── Debated occasions — INFORMATIONAL only (no claim of special worship) ──
      if (today.month === RABI_AWWAL && today.day === 12)
        push(d, DAY_HOUR, 0, "12 Rabīʿ al-Awwal", "Many note the birth of the Prophet ﷺ around this date. Send abundant blessings (ṣalawāt) upon him and reflect on his life.", URL_MAWLID);
      if (today.month === RAJAB && today.day === 27)
        push(d, DAY_HOUR, 0, "Isrāʾ & Miʿrāj (27 Rajab)", "The traditional date of the Night Journey and Ascension, when the five daily prayers were ordained (the exact date isn't confirmed in the Sunnah).", URL_ISRA);
      if (today.month === SHABAN && today.day === 15)
        push(d, DAY_HOUR, 0, "Mid-Shaʿbān (15 Shaʿbān)", "Some scholars note a virtue in this night; there are no specific authenticated acts of worship singled out for it.", URL_MID_SHABAN);
    }

    // ── White Days (recurring, monthly) — gated on its own flag ──────────────
    // Eve of the 13th of every Hijri month.
    if (opts.whiteDays && tomorrow.day === 13)
      push(d, DAY_HOUR, 0, "White Days fasting", "The White Days (13th–15th) begin tomorrow — the Prophet ﷺ encouraged fasting these three days each month.", URL_WHITE_DAYS);
  }

  return out;
}
