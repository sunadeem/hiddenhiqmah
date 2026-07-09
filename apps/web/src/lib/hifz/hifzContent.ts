// Hifz content resolver — turns a HifzCard (an ayah range OR a range of the 99
// Names) into the fully-loaded material every Learn/Review/Practice screen needs.
//
// Qur'an cards resolve to their āyāt with Arabic + translation and, when the
// bundled data exists, per-word gloss + per-word audio timestamps (for word-sync
// highlighting in AudioAssistedPlayer). The 99-Names cards store Name indices
// (1–99) in startAyah/endAyah (surah fields are 0), so they resolve to a slice of
// the names list instead. Both are loaded lazily so the screen only pulls the
// surah JSON it actually shows.

import type { HifzCard } from "@hidden-hiqmah/ui/lib/hifz/types";
import namesOfAllah, { type NameOfAllah } from "@hidden-hiqmah/content/names-of-allah";
import { ayahsInCard } from "@/lib/hifz/quran";

/** One word of an āyah — matches the bundled words/{surah}.json entries. */
export interface AyahWord {
  t: string; // Arabic token
  tr: string; // transliteration
  m: string; // meaning
}

/** A single resolved āyah with everything the player + reader need. */
export interface ResolvedAyah {
  /** Global āyah id (1–6236) — drives the per-āyah mp3 URL. */
  id: number;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
  transliteration: string;
  /** Per-word gloss, when bundled for this surah. */
  words?: AyahWord[];
  /** Per-word [startMs, endMs] audio segments, when bundled. */
  timestamps?: number[][];
}

export type ResolvedContent =
  | { kind: "quran"; label: string; ayahs: ResolvedAyah[] }
  | { kind: "asma"; label: string; names: NameOfAllah[] };

interface VerseRec {
  id: number;
  number: number;
  key: string;
  textAr: string;
  textEn: string;
  textTranslit: string;
}
type WordMap = Record<string, AyahWord[]>;
type TimestampMap = Record<string, number[][]>;

interface SurahData {
  verses: VerseRec[];
  words: WordMap | null;
  timestamps: TimestampMap | null;
}

/** Load a surah's verses + (optional) words + timestamps once, in parallel. */
async function loadSurah(surah: number): Promise<SurahData> {
  const [vmod, wmod, tmod] = await Promise.all([
    import(`@hidden-hiqmah/content/quran/verses/${surah}.json`),
    import(`@hidden-hiqmah/content/quran/words/${surah}.json`).catch(() => null),
    import(`@hidden-hiqmah/content/quran/timestamps/${surah}.json`).catch(() => null),
  ]);
  return {
    verses: (vmod.default ?? vmod) as VerseRec[],
    words: (wmod?.default ?? wmod ?? null) as WordMap | null,
    timestamps: (tmod?.default ?? tmod ?? null) as TimestampMap | null,
  };
}

/** Resolve a Qur'an card's ayah range → its āyāt with text + word/timestamp data. */
async function resolveQuran(card: HifzCard): Promise<ResolvedAyah[]> {
  const refs = ayahsInCard(card);
  const surahs = [...new Set(refs.map((r) => r.surah))];
  const loaded = new Map<number, SurahData>();
  await Promise.all(
    surahs.map(async (s) => {
      loaded.set(s, await loadSurah(s));
    })
  );
  const out: ResolvedAyah[] = [];
  for (const { surah, ayah } of refs) {
    const data = loaded.get(surah);
    const verse = data?.verses.find((v) => v.number === ayah);
    if (!verse) continue;
    out.push({
      id: verse.id,
      surah,
      ayah,
      arabic: verse.textAr,
      translation: verse.textEn,
      transliteration: verse.textTranslit,
      words: data?.words?.[String(ayah)],
      timestamps: data?.timestamps?.[String(ayah)],
    });
  }
  return out;
}

/**
 * Resolve any HifzCard to its display content. Qur'an cards → āyāt (async load);
 * "asma" cards → the slice of the 99 Names their index range [startAyah, endAyah]
 * covers. Indices are 1-based (Name 1 = "Allah"), clamped to 1–99.
 */
export async function resolveCardContent(card: HifzCard): Promise<ResolvedContent> {
  if (card.contentKind === "asma") {
    const lo = Math.max(1, Math.min(namesOfAllah.length, card.startAyah));
    const hi = Math.max(lo, Math.min(namesOfAllah.length, card.endAyah));
    return {
      kind: "asma",
      label: card.label,
      names: namesOfAllah.slice(lo - 1, hi),
    };
  }
  return { kind: "quran", label: card.label, ayahs: await resolveQuran(card) };
}
