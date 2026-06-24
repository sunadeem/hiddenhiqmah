// Fetch + transform the Quranic Arabic Corpus morphology (root / lemma / POS)
// into ADDITIVE bundled JSON for the Understanding (tap-a-word) layer.
//
// Source: the Kais Dukes Quranic Arabic Corpus (corpus.quran.com), via the clean
// community mirror github.com/mustafa0x/quran-morphology. This is the SAME data
// QUL (qul.tarteel.ai) repackages — root/lemma are already in Arabic unicode here.
// License: GPL — attribution to corpus.quran.com / Kais Dukes is required, and the
// data must not be modified. We only re-key it; we don't alter the linguistic data.
//
// Writes (does NOT touch the existing words/{n}.json t/tr/m files):
//   packages/content/quran/morphology/{1..114}.json
//        = { "<ayah>": [ { root, lemma, pos } , ... ] }  (one entry per word, in order)
//   packages/content/quran/roots.json
//        = { "<root>": { count, occ: ["s:a:w", ...] } }  (for "appears N×" + jump)
//
// Run: node scripts/fetch-morphology.mjs

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT_DIR, "packages/content/quran");
const OUT_MORPH = join(CONTENT, "morphology");
const OUT_ROOTS = join(CONTENT, "roots.json");
const SRC =
  "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt";

function readablePos(tag, feats) {
  const f = new Set(feats);
  if (f.has("PN")) return "proper noun";
  if (f.has("ADJ")) return "adjective";
  if (f.has("ACT_PCPL")) return "active participle";
  if (f.has("PASS_PCPL")) return "passive participle";
  if (f.has("PRON") || f.has("DEM") || f.has("REL")) return "pronoun";
  if (tag === "N") return "noun";
  if (tag === "V") return "verb";
  if (tag === "P") {
    if (f.has("CONJ")) return "conjunction";
    if (f.has("DET")) return "determiner";
    if (f.has("NEG")) return "negation";
    if (f.has("P")) return "preposition";
    return "particle";
  }
  return tag.toLowerCase();
}

async function main() {
  console.log("Fetching morphology…", SRC);
  const res = await fetch(SRC);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const text = await res.text();
  const lines = text.split("\n");

  // Group segments by word: key "s:a:w" → [{ tag, feats, root, lem }]
  const byWord = new Map();
  let parsed = 0;
  for (const line of lines) {
    if (!line || line[0] === "#") continue;
    const cols = line.split("\t");
    if (cols.length < 4) continue;
    const [loc, , tag, features] = cols;
    const m = loc.split(":");
    if (m.length < 4) continue;
    const [s, a, w] = m;
    const feats = features.split("|");
    const root = feats.find((x) => x.startsWith("ROOT:"))?.slice(5) ?? null;
    const lem = feats.find((x) => x.startsWith("LEM:"))?.slice(4) ?? null;
    const key = `${s}:${a}:${w}`;
    if (!byWord.has(key)) byWord.set(key, []);
    byWord.get(key).push({ tag, feats, root, lem });
    parsed++;
  }
  console.log(`Parsed ${parsed} segments → ${byWord.size} words`);

  // Per-surah morphology (keyed by ayah → array of words in order) + root index.
  const perSurah = new Map(); // surah → { ayah → Map(wordIdx → {root,lemma,pos}) }
  const roots = {}; // root → { count, occ:[] }

  for (const [key, segs] of byWord) {
    const [s, a, w] = key.split(":").map(Number);
    const stem = segs.find((x) => x.root) ?? segs[segs.length - 1];
    const root = stem.root ?? null;
    const lemma = stem.lem ?? segs.find((x) => x.lem)?.lem ?? null;
    const pos = readablePos(stem.tag, stem.feats);

    if (!perSurah.has(s)) perSurah.set(s, new Map());
    const ayahMap = perSurah.get(s);
    if (!ayahMap.has(a)) ayahMap.set(a, new Map());
    ayahMap.get(a).set(w, { root, lemma, pos });

    if (root) {
      (roots[root] ??= { count: 0, occ: [] }).occ.push(`${s}:${a}:${w}`);
      roots[root].count++;
    }
  }

  // Write per-surah files (one entry per word, ordered by word index).
  mkdirSync(OUT_MORPH, { recursive: true });
  let mismatches = 0;
  for (let s = 1; s <= 114; s++) {
    const ayahMap = perSurah.get(s);
    if (!ayahMap) continue;
    const obj = {};
    for (const [a, wordMap] of [...ayahMap.entries()].sort((x, y) => x[0] - y[0])) {
      const maxW = Math.max(...wordMap.keys());
      const arr = [];
      for (let w = 1; w <= maxW; w++) {
        arr.push(wordMap.get(w) ?? { root: null, lemma: null, pos: "" });
      }
      obj[a] = arr;
    }
    writeFileSync(join(OUT_MORPH, `${s}.json`), JSON.stringify(obj));

    // Alignment check vs existing words/{s}.json (same word counts per ayah?).
    const wordsPath = join(CONTENT, "words", `${s}.json`);
    if (existsSync(wordsPath)) {
      const words = JSON.parse(readFileSync(wordsPath, "utf8"));
      for (const a of Object.keys(obj)) {
        const have = words[a]?.length;
        const got = obj[a].length;
        if (have != null && have !== got) {
          mismatches++;
          if (mismatches <= 12) console.warn(`  ⚠ count mismatch ${s}:${a} words=${have} morph=${got}`);
        }
      }
    }
  }

  // Sort root occurrence lists for stable output.
  for (const r of Object.values(roots)) r.occ.sort();
  writeFileSync(OUT_ROOTS, JSON.stringify(roots));

  const rootCount = Object.keys(roots).length;
  const withRoot = Object.values(roots).reduce((n, r) => n + r.count, 0);
  console.log(`Wrote morphology/{surah}.json (114 surahs)`);
  console.log(`Wrote roots.json: ${rootCount} unique roots, ${withRoot} rooted words`);
  console.log(`Alignment mismatches vs words/*.json: ${mismatches}`);
  console.log("Done. (Additive — words/*.json untouched.)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
