/**
 * Deterministic "content of the day" picker — shared by the server-side push
 * sender (Vercel API route) so the daily notification lands on the exact same
 * ayah / hadith / dua the app surfaces for that date.
 *
 * Selection is a pure function of the date: dailyIndex() counts days since
 * 2020-01-01 and takes it modulo each pool's length, so a given `dateStr`
 * ("YYYY-MM-DD") always maps to the same three items on every device/server.
 *
 * Deep-link URLs mirror urlForInspiration() in lib/mobile/notifications.ts so a
 * tap opens the same reader screen the local notifications use.
 */
import { dailyIndex, themeLabel, type Reminder } from "@hidden-hiqmah/ui/lib/reminders";
import remindersData from "@hidden-hiqmah/content/reminders.json";
import duasData from "@hidden-hiqmah/content/duas.json";

export type DailyItem = {
  title: string;
  arabic: string;
  english: string;
  reference: string;
  url: string;
};

type Dua = {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  source: string;
};

const REMINDERS = remindersData as unknown as Reminder[];
const DUAS = duasData.duas as unknown as Dua[];

// Split the reminder deck once at module load: ayahs from Qur'an-sourced
// reminders, hadith from hadith-sourced ones.
const AYAH_POOL = REMINDERS.filter((r) => r.sourceKind === "quran");
const HADITH_POOL = REMINDERS.filter((r) => r.sourceKind === "hadith");

// Hadith collection → reader slug (mirrors notifications.ts).
const HADITH_COLLECTION_SLUGS: [prefix: string, slug: string][] = [
  ["Sahih al-Bukhari", "bukhari"],
  ["Sahih Muslim", "muslim"],
  ["Sunan Abi Dawud", "abudawud"],
  ["Jami at-Tirmidhi", "tirmidhi"],
  ["Sunan an-Nasa'i", "nasai"],
  ["Sunan Ibn Majah", "ibnmajah"],
  ["Musnad Ahmad", "ahmad"],
];

/** "S:A" → /quran/S?v=A (falls back to the surah/reader root). */
function quranUrl(sourceRef: string): string {
  const m = sourceRef.match(/(\d+):(\d+)/);
  return m ? `/quran/${m[1]}?v=${m[2]}` : "/quran";
}

/** "<Collection> book:num" → /hadith/{slug}/{book}?h={num}. A bare number
 *  (e.g. "Musnad Ahmad 205") lands on the collection page. */
function hadithUrl(reference: string): string {
  for (const [prefix, slug] of HADITH_COLLECTION_SLUGS) {
    if (reference.startsWith(prefix)) {
      const m = reference.slice(prefix.length).match(/(\d+):(\d+)/);
      return m ? `/hadith/${slug}/${m[1]}?h=${m[2]}` : `/hadith/${slug}`;
    }
  }
  return "/hadith";
}

function ayahItem(r: Reminder): DailyItem {
  return {
    title: themeLabel(r.theme),
    arabic: r.arabic ?? "",
    english: r.textEn,
    reference: `Qur'an ${r.sourceRef}`,
    url: quranUrl(r.sourceRef),
  };
}

function hadithItem(r: Reminder): DailyItem {
  return {
    title: themeLabel(r.theme),
    arabic: r.arabic ?? "",
    english: r.textEn,
    reference: r.sourceRef,
    url: hadithUrl(r.sourceRef),
  };
}

function duaItem(d: Dua): DailyItem {
  return {
    title: d.title,
    arabic: d.arabic,
    english: d.translation,
    reference: d.source,
    url: `/duas?d=${d.id}`,
  };
}

/**
 * Pick the day's ayah, hadith, and dua for `dateStr` ("YYYY-MM-DD").
 * Deterministic: same date → same three items everywhere.
 */
export function pickDailyContent(dateStr: string): {
  ayah: DailyItem;
  hadith: DailyItem;
  dua: DailyItem;
} {
  const ayah = AYAH_POOL[dailyIndex(dateStr, AYAH_POOL.length)];
  const hadith = HADITH_POOL[dailyIndex(dateStr, HADITH_POOL.length)];
  const dua = DUAS[dailyIndex(dateStr, DUAS.length)];
  return {
    ayah: ayahItem(ayah),
    hadith: hadithItem(hadith),
    dua: duaItem(dua),
  };
}
