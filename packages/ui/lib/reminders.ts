// Reflections / reminders — static content (shipped in the bundle, works offline
// + on web). Generated + verified against the local Quran/hadith data.

export type ReminderTone = "hope" | "accountability";
export type ReminderSourceKind = "quran" | "hadith";

export interface Reminder {
  id: string;
  theme: string;
  tone: ReminderTone;
  textEn: string;
  arabic: string | null;
  translit: string | null;
  sourceKind: ReminderSourceKind;
  sourceRef: string;
}

export const REMINDER_THEMES: { key: string; label: string }[] = [
  { key: "mercy", label: "Mercy" },
  { key: "hope", label: "Hope" },
  { key: "gratitude", label: "Gratitude" },
  { key: "tawakkul", label: "Trust" },
  { key: "allah_love", label: "Allah's Love" },
  { key: "paradise", label: "Paradise" },
  { key: "purpose", label: "Purpose" },
  { key: "dunya", label: "Dunya" },
  { key: "death", label: "Death" },
  { key: "judgement", label: "Judgement" },
  { key: "grave", label: "The Grave" },
];

const THEME_LABEL: Record<string, string> = Object.fromEntries(
  REMINDER_THEMES.map((t) => [t.key, t.label])
);

export function themeLabel(key: string): string {
  return THEME_LABEL[key] ?? key;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Deterministic "reflection of the day" — stable for a given local date. */
export function reflectionOfTheDay(list: Reminder[], dateStr: string): Reminder | null {
  if (!list.length) return null;
  return list[hashStr(dateStr) % list.length];
}

/**
 * Index of the day's reflection within a deck — advances by one each day
 * (sequential "next up"), wrapping around. Stable for a given local date.
 */
export function dailyIndex(dateStr: string, count: number): number {
  if (count <= 0) return 0;
  const d = new Date(dateStr + "T12:00:00").getTime();
  const epoch = new Date("2020-01-01T12:00:00").getTime();
  const days = Math.floor((d - epoch) / 86400000);
  return ((days % count) + count) % count;
}

/** Build a shareable plain-text version of a reminder. */
export function reminderShareText(r: Reminder): string {
  const parts = [r.textEn.trim()];
  const ref = r.sourceKind === "quran" ? `— Qur'an ${r.sourceRef}` : `— ${r.sourceRef}`;
  parts.push(ref);
  parts.push("\nvia Hidden Hiqmah");
  return parts.join("\n");
}
