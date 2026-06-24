// Qur'an-structure helpers for Hifz: build cards from a selection, enumerate the
// ayahs in a card, and map ayah ranges → mushaf pages (for the progress map).
// Imports the bundled chapters + the generated pages.json (604 page boundaries).

import chaptersRaw from "@hidden-hiqmah/content/quran/chapters.json";
import pagesRaw from "@hidden-hiqmah/content/quran/pages.json";
import type { NewCardInput, AyahRef } from "@hidden-hiqmah/ui/lib/hifz/types";

interface Chapter {
  id: number;
  name: string;
  nameAr: string;
  nameComplex: string;
  verses: number;
  pages: number[];
}
interface PageRec {
  p: number; // page number
  s: number; // start surah
  a: number; // start ayah
  es: number; // end surah
  ea: number; // end ayah
  j: number; // juz of page start
}

const CHAPTERS = chaptersRaw as Chapter[];
const PAGES = pagesRaw as PageRec[];

export const TOTAL_PAGES = PAGES.length; // 604
export const TOTAL_SURAHS = CHAPTERS.length; // 114
export const TOTAL_JUZ = 30;

export function chapter(id: number): Chapter | undefined {
  return CHAPTERS[id - 1];
}
export function surahName(id: number): string {
  const c = CHAPTERS[id - 1];
  return c?.nameComplex || c?.name || `Surah ${id}`;
}
export function verseCount(id: number): number {
  return CHAPTERS[id - 1]?.verses ?? 0;
}
export function pageRec(p: number): PageRec | undefined {
  return PAGES[p - 1];
}
export function juzOfPage(p: number): number {
  return PAGES[p - 1]?.j ?? 0;
}
export function allPages(): PageRec[] {
  return PAGES;
}

// Global ayah ordinal (cumulative across surahs) → lets us compare positions and
// locate the mushaf page for any ayah.
const CUM: number[] = (() => {
  const c = [0];
  for (let i = 0; i < CHAPTERS.length; i++) c.push(c[i] + CHAPTERS[i].verses);
  return c;
})();
function ord(s: number, a: number): number {
  return (CUM[s - 1] ?? 0) + a;
}

export function pageOfAyah(s: number, a: number): number {
  const o = ord(s, a);
  for (const p of PAGES) {
    if (o >= ord(p.s, p.a) && o <= ord(p.es, p.ea)) return p.p;
  }
  return 1;
}

// ── Card builders (each returns NewCardInput[] ready for adapter.addCards) ──

export function buildPageCards(fromPage: number, toPage: number): NewCardInput[] {
  const lo = Math.max(1, Math.min(fromPage, toPage));
  const hi = Math.min(TOTAL_PAGES, Math.max(fromPage, toPage));
  const out: NewCardInput[] = [];
  for (let p = lo; p <= hi; p++) {
    const r = PAGES[p - 1];
    if (!r) continue;
    out.push({
      unit: "page",
      label: `Page ${p}`,
      page: p,
      startSurah: r.s,
      startAyah: r.a,
      endSurah: r.es,
      endAyah: r.ea,
    });
  }
  return out;
}

export function buildAyahCards(surah: number, fromAyah: number, toAyah: number): NewCardInput[] {
  const vc = verseCount(surah);
  if (!vc) return [];
  const lo = Math.max(1, Math.min(fromAyah, toAyah));
  const hi = Math.min(vc, Math.max(fromAyah, toAyah));
  const out: NewCardInput[] = [];
  for (let a = lo; a <= hi; a++) {
    out.push({
      unit: "ayah",
      label: `${surahName(surah)} ${a}`,
      page: null,
      startSurah: surah,
      startAyah: a,
      endSurah: surah,
      endAyah: a,
    });
  }
  return out;
}

export function buildSurahCards(fromSurah: number, toSurah: number): NewCardInput[] {
  const lo = Math.max(1, Math.min(fromSurah, toSurah));
  const hi = Math.min(TOTAL_SURAHS, Math.max(fromSurah, toSurah));
  const out: NewCardInput[] = [];
  for (let s = lo; s <= hi; s++) {
    const vc = verseCount(s);
    if (!vc) continue;
    out.push({
      unit: "surah",
      label: surahName(s),
      page: null,
      startSurah: s,
      startAyah: 1,
      endSurah: s,
      endAyah: vc,
    });
  }
  return out;
}

/** One custom ayah range as a single card. */
export function buildRangeCard(
  startSurah: number,
  startAyah: number,
  endSurah: number,
  endAyah: number
): NewCardInput {
  // Clamp to valid bounds (like the other builders) + normalise so start ≤ end in
  // mushaf order — guards against a backwards range producing a huge bogus card.
  let ss = Math.max(1, Math.min(TOTAL_SURAHS, startSurah));
  let es = Math.max(1, Math.min(TOTAL_SURAHS, endSurah));
  let sa = Math.max(1, Math.min(verseCount(ss) || 1, startAyah));
  let ea = Math.max(1, Math.min(verseCount(es) || 1, endAyah));
  if (ord(es, ea) < ord(ss, sa)) {
    [ss, sa, es, ea] = [es, ea, ss, sa];
  }
  const label =
    ss === es
      ? `${surahName(ss)} ${sa}–${ea}`
      : `${surahName(ss)} ${sa} – ${surahName(es)} ${ea}`;
  return { unit: "range", label, page: null, startSurah: ss, startAyah: sa, endSurah: es, endAyah: ea };
}

/** Enumerate every ayah in a card's range (crosses surah boundaries). */
export function ayahsInCard(c: {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}): AyahRef[] {
  const out: AyahRef[] = [];
  let s = c.startSurah;
  let a = c.startAyah;
  let guard = 0;
  while (guard++ < 2000) {
    out.push({ surah: s, ayah: a });
    if (s === c.endSurah && a === c.endAyah) break;
    const vc = verseCount(s);
    if (a >= vc) {
      s += 1;
      a = 1;
      if (s > TOTAL_SURAHS) break;
    } else {
      a += 1;
    }
  }
  return out;
}

/** Mushaf page numbers a card overlaps (for the progress map). */
export function pagesForCard(c: {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}): number[] {
  const from = pageOfAyah(c.startSurah, c.startAyah);
  const to = pageOfAyah(c.endSurah, c.endAyah);
  const out: number[] = [];
  for (let p = Math.min(from, to); p <= Math.max(from, to); p++) out.push(p);
  return out;
}
