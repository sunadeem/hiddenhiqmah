import chapters from "@/data/quran/chapters.json";

/* ------------------------------------------------------------------ */
/*  Normalisation helpers                                              */
/* ------------------------------------------------------------------ */

/** Strip diacritics, hyphens, apostrophes, backticks; collapse whitespace; lowercase */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics (ā→a, etc.)
    .replace(/[-''`ʿʾ]/g, "")       // strip hyphens & apostrophes
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/* ------------------------------------------------------------------ */
/*  Quran reference parsing                                            */
/* ------------------------------------------------------------------ */

export type QuranRef = {
  surahId: number;
  verse?: number;
};

const surahLookup: { norm: string; id: number }[] = chapters.map((ch) => ({
  norm: norm(ch.name),
  id: ch.id,
}));

// Also add meaning-based lookup (e.g. "the cow" → 2)
const meaningLookup: { norm: string; id: number }[] = chapters.map((ch) => ({
  norm: norm(ch.meaning),
  id: ch.id,
}));

/**
 * Try to parse a Quran reference from user input.
 * Supported formats:
 *   3:14         → surah 3, verse 14
 *   3:14-20      → surah 3, verse 14 (start of range)
 *   surah 3      → surah 3
 *   chapter 3    → surah 3
 *   al imran     → surah 3  (fuzzy name match)
 *   al-imran     → surah 3
 *   ali imran    → surah 3
 *   baqarah      → surah 2
 *   baqarah 14   → surah 2, verse 14
 *   the cow 14   → surah 2, verse 14
 *   imran 14     → surah 3, verse 14
 */
export function parseQuranRef(query: string): QuranRef | null {
  const q = query.trim();
  if (!q) return null;

  // Pattern 1: "X:Y" or "X:Y-Z" — numeric reference
  const colonMatch = q.match(/^(\d{1,3})\s*:\s*(\d{1,3})(?:\s*-\s*\d{1,3})?$/);
  if (colonMatch) {
    const surahId = parseInt(colonMatch[1], 10);
    const verse = parseInt(colonMatch[2], 10);
    if (surahId >= 1 && surahId <= 114) {
      return { surahId, verse };
    }
  }

  // Pattern 2: "surah X" / "chapter X" with optional verse
  const surahNumMatch = q.match(/^(?:surah|chapter|sura)\s+(\d{1,3})(?:\s*[,:]\s*(\d{1,3}))?$/i);
  if (surahNumMatch) {
    const surahId = parseInt(surahNumMatch[1], 10);
    const verse = surahNumMatch[2] ? parseInt(surahNumMatch[2], 10) : undefined;
    if (surahId >= 1 && surahId <= 114) {
      return { surahId, verse };
    }
  }

  // Pattern 3: name-based lookup
  // Try to split into "name" + optional trailing number (verse)
  const nameVerseMatch = q.match(/^(.+?)\s+(\d{1,3})$/);
  const namePart = nameVerseMatch ? nameVerseMatch[1] : q;
  const versePart = nameVerseMatch ? parseInt(nameVerseMatch[2], 10) : undefined;

  const normalised = norm(namePart);
  // Strip leading "al " or "surah " for matching
  const stripped = normalised.replace(/^(?:al|surah|sura|chapter)\s+/, "");

  // Exact match first, then startsWith, then includes
  const match =
    surahLookup.find((s) => s.norm === normalised || s.norm === stripped) ||
    surahLookup.find((s) => {
      const sStripped = s.norm.replace(/^al\s*/, "");
      return sStripped === stripped || sStripped === normalised;
    }) ||
    meaningLookup.find((s) => s.norm === normalised || s.norm === stripped) ||
    surahLookup.find((s) => s.norm.includes(stripped) && stripped.length >= 3) ||
    meaningLookup.find((s) => s.norm.includes(stripped) && stripped.length >= 3);

  if (match) {
    return { surahId: match.id, verse: versePart };
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Hadith reference parsing                                           */
/* ------------------------------------------------------------------ */

export type HadithRef = {
  collection: string; // slug e.g. "bukhari"
  hadithId: number;
};

const collectionAliases: Record<string, string> = {
  bukhari: "bukhari",
  "sahih bukhari": "bukhari",
  "sahih al bukhari": "bukhari",
  muslim: "muslim",
  "sahih muslim": "muslim",
  "abu dawud": "abudawud",
  abudawud: "abudawud",
  "abu dawood": "abudawud",
  tirmidhi: "tirmidhi",
  "jami tirmidhi": "tirmidhi",
  "jami at tirmidhi": "tirmidhi",
  nasai: "nasai",
  "sunan nasai": "nasai",
  "sunan an nasai": "nasai",
  "ibn majah": "ibnmajah",
  ibnmajah: "ibnmajah",
  "sunan ibn majah": "ibnmajah",
};

/**
 * Try to parse a hadith reference from user input.
 * Supported formats:
 *   bukhari 50       → Sahih al-Bukhari #50
 *   bukhari:50       → same
 *   sahih bukhari 50 → same
 *   muslim 2912      → Sahih Muslim #2912
 *   tirmidhi:586     → Jami at-Tirmidhi #586
 */
export function parseHadithRef(query: string): HadithRef | null {
  const q = query.trim();
  if (!q) return null;

  // Try to match "collection_name number" or "collection_name:number"
  const match = q.match(/^(.+?)\s*[:#]\s*(\d+)$/);
  if (!match) {
    // Also try "collection_name number" without separator
    const spaceMatch = q.match(/^(.+?)\s+(\d+)$/);
    if (!spaceMatch) return null;
    const name = norm(spaceMatch[1]);
    const id = parseInt(spaceMatch[2], 10);
    const slug = collectionAliases[name];
    if (slug && id > 0) return { collection: slug, hadithId: id };
    return null;
  }

  const name = norm(match[1]);
  const id = parseInt(match[2], 10);
  const slug = collectionAliases[name];
  if (slug && id > 0) return { collection: slug, hadithId: id };
  return null;
}

/* ------------------------------------------------------------------ */
/*  Generic page-level text search                                     */
/* ------------------------------------------------------------------ */

/**
 * Check if any of the given strings contain the query (case-insensitive).
 * Returns true if at least one field matches.
 * Ignores undefined/null values.
 */
export function textMatch(query: string, ...fields: (string | undefined | null)[]): boolean {
  if (!query || query.length < 2) return true;
  const q = query.toLowerCase();
  return fields.some((f) => f && f.toLowerCase().includes(q));
}
