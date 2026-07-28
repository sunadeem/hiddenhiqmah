import * as fs from "fs";
import * as path from "path";
import { CONTENT_ROOT } from "./content-root";
import { normalizeText, tokenize } from "./tokenize.mjs";
import {
  type Corpus,
  type PhraseEvidence,
  type Postings,
  type SearchTier,
  tieredSearch,
} from "./bm25";

const QURAN_DIR = path.join(CONTENT_ROOT, "quran");
const SURAH_COUNT = 114;

interface QuranVerse {
  id: number;
  number: number;
  key: string;
  textAr: string;
  textEn: string;
  textTranslit?: string;
  juz: number;
  page: number;
  hizb: number;
}

interface ChapterInfo {
  id: number;
  name: string;
  nameAr: string;
  meaning: string;
  verses: number;
}

export interface QuranSearchResult {
  surah: string;
  surahId: number;
  verse: number;
  key: string;
  arabic: string;
  english: string;
  score: number;
  tier: SearchTier;
  /** Set when `tier` is "phrase" — how much the quoted phrase really proved. */
  phrase?: PhraseEvidence;
}

export interface QuranVerseLookup {
  surah: string;
  surahId: number;
  verse: number;
  key: string;
  arabic: string;
  english: string;
  transliteration?: string;
}

let chaptersCache: ChapterInfo[] | null = null;
function getChapters(): ChapterInfo[] {
  if (chaptersCache) return chaptersCache;
  try {
    const raw = fs.readFileSync(path.join(QURAN_DIR, "chapters.json"), "utf-8");
    chaptersCache = JSON.parse(raw) as ChapterInfo[];
    return chaptersCache;
  } catch {
    return [];
  }
}

const surahCache = new Map<number, QuranVerse[]>();
function getSurahVerses(surahId: number): QuranVerse[] {
  const cached = surahCache.get(surahId);
  if (cached) return cached;
  try {
    const raw = fs.readFileSync(path.join(QURAN_DIR, "verses", `${surahId}.json`), "utf-8");
    const verses = JSON.parse(raw) as QuranVerse[];
    surahCache.set(surahId, verses);
    return verses;
  } catch {
    surahCache.set(surahId, []);
    return [];
  }
}

function surahName(surahId: number): string {
  const chapter = getChapters().find((c) => c.id === surahId);
  return chapter ? `${chapter.name} (${chapter.meaning})` : `Surah ${surahId}`;
}

// ── In-memory index ───────────────────────────────────────────────────────
//
// The Quran is small enough (6,236 verses, ~900KB of English) to index on
// first use, so there is no committed artifact to keep in sync. It is built
// from verses/*.json rather than the existing quran/search-index.json because
// that file predates the Rowwad translation swap: its text no longer matches
// what the reader displays, so searching it would surface verses whose quoted
// wording the user can never find in the app.

interface QuranIndex {
  surahOf: Int32Array;
  verseOf: Int32Array;
  lengths: Int32Array;
  postings: Map<string, Postings>;
  docCount: number;
  avgDocLength: number;
}

let quranIndex: QuranIndex | null = null;

function getQuranIndex(): QuranIndex {
  if (quranIndex) return quranIndex;

  const surahOf: number[] = [];
  const verseOf: number[] = [];
  const lengths: number[] = [];
  const building = new Map<string, { docs: number[]; freqs: number[] }>();
  let totalLength = 0;

  for (let surahId = 1; surahId <= SURAH_COUNT; surahId++) {
    // Read directly instead of via getSurahVerses: caching all 114 surahs here
    // would pin the whole Quran in memory when only the winners are ever read.
    let verses: QuranVerse[];
    try {
      const raw = fs.readFileSync(path.join(QURAN_DIR, "verses", `${surahId}.json`), "utf-8");
      verses = JSON.parse(raw) as QuranVerse[];
    } catch {
      continue;
    }

    for (const verse of verses) {
      const doc = surahOf.length;
      const tokens = tokenize(verse.textEn);
      surahOf.push(surahId);
      verseOf.push(verse.number);
      lengths.push(tokens.length);
      totalLength += tokens.length;

      const termFreqs = new Map<string, number>();
      for (const token of tokens) termFreqs.set(token, (termFreqs.get(token) ?? 0) + 1);
      for (const [token, freq] of termFreqs) {
        let list = building.get(token);
        if (!list) {
          list = { docs: [], freqs: [] };
          building.set(token, list);
        }
        list.docs.push(doc);
        list.freqs.push(freq);
      }
    }
  }

  const postings = new Map<string, Postings>();
  for (const [token, list] of building) {
    postings.set(token, { docs: Int32Array.from(list.docs), freqs: Int32Array.from(list.freqs) });
  }

  quranIndex = {
    surahOf: Int32Array.from(surahOf),
    verseOf: Int32Array.from(verseOf),
    lengths: Int32Array.from(lengths),
    postings,
    docCount: surahOf.length,
    avgDocLength: surahOf.length > 0 ? totalLength / surahOf.length : 1,
  };
  return quranIndex;
}

function getVerse(index: QuranIndex, doc: number): QuranVerse | null {
  const verses = getSurahVerses(index.surahOf[doc]);
  const number = index.verseOf[doc];
  return verses.find((v) => v.number === number) ?? null;
}

/**
 * Search the English translation of all 114 surahs. Same BM25 + tiered
 * fallback as the hadith search — the old 2/3-keyword gate had the identical
 * recall problem over these 6,236 verses.
 */
export function searchQuran(
  query: string,
  surahId?: number,
  maxResults = 12
): QuranSearchResult[] {
  const index = getQuranIndex();
  if (index.docCount === 0) return [];

  const restrictTo = surahId && surahId >= 1 && surahId <= SURAH_COUNT ? surahId : 0;

  const corpus: Corpus = {
    docCount: index.docCount,
    avgDocLength: index.avgDocLength,
    docLength: (doc) => index.lengths[doc],
    postings: (term) => index.postings.get(term) ?? null,
    allows: (doc) => restrictTo === 0 || index.surahOf[doc] === restrictTo,
  };

  const { tier, hits, phrase } = tieredSearch(corpus, query, maxResults, (doc, needle) => {
    const verse = getVerse(index, doc);
    return verse ? normalizeText(verse.textEn).includes(needle) : false;
  });

  const results: QuranSearchResult[] = [];
  for (const hit of hits) {
    const verse = getVerse(index, hit.doc);
    if (!verse) continue;
    const sid = index.surahOf[hit.doc];
    results.push({
      surah: surahName(sid),
      surahId: sid,
      verse: verse.number,
      key: verse.key,
      arabic: verse.textAr,
      english: verse.textEn,
      score: hit.score,
      tier,
      phrase,
    });
  }
  return results;
}

export function getQuranVerse(surahId: number, ayah: number): QuranVerseLookup | null {
  const verse = getSurahVerses(surahId).find((v) => v.number === ayah);
  if (!verse) return null;
  return {
    surah: surahName(surahId),
    surahId,
    verse: verse.number,
    key: verse.key,
    arabic: verse.textAr,
    english: verse.textEn,
    transliteration: verse.textTranslit,
  };
}
