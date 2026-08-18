/**
 * Hijri (Umm al-Qura) date formatting.
 *
 * ⚠️ WHY THIS EXISTS — do not "simplify" it back to `Intl` with `month: "long"`.
 *
 * `Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { month: "long" })` returns a
 * GREGORIAN month name on Android. The arithmetic is fine — day and year come
 * back correct on every engine — but Chromium's ICU build on Android lacks the
 * localised Hijri month names and falls back by INDEX, so Rabi al-Awwal (3rd
 * Hijri month) renders as "March" (3rd Gregorian month). It is silent: nothing
 * throws, and the day and year beside it are right, which is what makes it easy
 * to miss.
 *
 * Caught on an Android emulator, where the home screen read "4 MARCH 1448 AH"
 * against iOS's "28 Safar 1448 AH" for the same week.
 *
 * The fix: take only NUMBERS from Intl, which are correct everywhere, and supply
 * the names ourselves. The list matches HijriCalendar in the iOS widget
 * (ios/App/HiqmahWidgets/HijriDateWidget.swift) so the widget and the app can
 * never disagree about what month it is.
 */

export const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhirah",
  "Rajab",
  "Shaban",
  "Ramadan",
  "Shawwal",
  "Dhul-Qadah",
  "Dhul-Hijjah",
] as const;

/** Shortened forms, for places a full name will not fit. */
export const HIJRI_MONTHS_SHORT = [
  "Muharram",
  "Safar",
  "Rabi I",
  "Rabi II",
  "Jumada I",
  "Jumada II",
  "Rajab",
  "Shaban",
  "Ramadan",
  "Shawwal",
  "Dhul-Qadah",
  "Dhul-Hijjah",
] as const;

/**
 * Arabic month names. Same index basis as HIJRI_MONTHS. Intl's Arabic path has
 * the same index-fallback problem on Android — it will happily hand back
 * "مارس" (March) for Rabi al-Awwal.
 */
export const HIJRI_MONTHS_AR = [
  "\u0645\u064f\u062d\u064e\u0631\u0651\u064e\u0645",
  "\u0635\u064e\u0641\u064e\u0631",
  "\u0631\u064e\u0628\u0650\u064a\u0639 \u0627\u0644\u0623\u064e\u0648\u0651\u064e\u0644",
  "\u0631\u064e\u0628\u0650\u064a\u0639 \u0627\u0644\u062b\u0651\u064e\u0627\u0646\u0650\u064a",
  "\u062c\u064f\u0645\u064e\u0627\u062f\u0649 \u0627\u0644\u0623\u064f\u0648\u0644\u0649",
  "\u062c\u064f\u0645\u064e\u0627\u062f\u0649 \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629",
  "\u0631\u064e\u062c\u064e\u0628",
  "\u0634\u064e\u0639\u0652\u0628\u064e\u0627\u0646",
  "\u0631\u064e\u0645\u064e\u0636\u064e\u0627\u0646",
  "\u0634\u064e\u0648\u0651\u064e\u0627\u0644",
  "\u0630\u0648 \u0627\u0644\u0642\u0650\u0639\u062f\u0629",
  "\u0630\u0648 \u0627\u0644\u062d\u0650\u062c\u0651\u0629",
] as const;

export function hijriMonthNameAr(month: number): string {
  if (!Number.isFinite(month) || month < 1 || month > HIJRI_MONTHS_AR.length) return "";
  return HIJRI_MONTHS_AR[month - 1];
}

export interface HijriParts {
  /** 1–30 */
  day: number;
  /** 1–12 */
  month: number;
  year: number;
}

/**
 * Numeric Hijri components. Only `numeric` fields are read from Intl, which is
 * the part every engine gets right. Returns null if the runtime has no Islamic
 * calendar at all, so callers can render nothing rather than something wrong.
 */
export function hijriParts(date: Date = new Date()): HijriParts | null {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(date);
    const num = (type: string): number => {
      const raw = parts.find((p) => p.type === type)?.value ?? "";
      // Some locales emit era-suffixed years ("1448 AH"); take leading digits.
      return parseInt(raw.replace(/[^0-9]/g, ""), 10);
    };
    const day = num("day");
    const month = num("month");
    const year = num("year");
    if (!day || !month || !year) return null;
    return { day, month, year };
  } catch {
    return null;
  }
}

export function hijriMonthName(month: number, short = false): string {
  const list = short ? HIJRI_MONTHS_SHORT : HIJRI_MONTHS;
  if (!Number.isFinite(month) || month < 1 || month > list.length) return "";
  return list[month - 1];
}

/**
 * "4 Rabi al-Awwal 1448 AH" — or "" when the runtime cannot do Hijri at all,
 * which callers already treat as "render nothing".
 */
export function formatHijri(
  date: Date = new Date(),
  opts: { era?: boolean; short?: boolean } = {}
): string {
  const parts = hijriParts(date);
  if (!parts) return "";
  const { era = true, short = false } = opts;
  const name = hijriMonthName(parts.month, short);
  return `${parts.day} ${name} ${parts.year}${era ? " AH" : ""}`;
}

/** "4 Rabi al-Awwal" — no year, for tight rows. */
export function formatHijriDayMonth(date: Date = new Date(), short = false): string {
  const parts = hijriParts(date);
  if (!parts) return "";
  return `${parts.day} ${hijriMonthName(parts.month, short)}`;
}
