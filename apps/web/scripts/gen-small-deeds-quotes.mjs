#!/usr/bin/env node
/**
 * Generates src/data/small-deeds-quotes.generated.ts from
 * scripts/verified-small-deeds.json.
 *
 * WHY THIS EXISTS. /small-deeds quotes ~45 narrations. The house rule is that no
 * English hadith text, no reference and no character of Arabic is ever typed by
 * hand — hand-typed Arabic fails byte-identity because combining marks order
 * differently, and hand-typed English quietly drifts from what the corpus
 * actually stores. So every string the page renders as a quotation is COPIED
 * here by machine out of the verifier's output, which itself was matched against
 * packages/content/hadith and packages/content/quran.
 *
 * ── TRANSFORM 1: `matn` ────────────────────────────────────────────────────
 * A stored `arabic` field is the whole entry — isnad, matn, and (in the Sunan)
 * Abu Isa's grading commentary, all in one string. We slice out the segments the
 * corpus itself puts between ASCII double quotes, which is where it stores
 * reported speech. Purely structural: split on '"', keep odd indexes, trim
 * whitespace and bidi/format marks off the ends. No Arabic is matched, typed or
 * reordered, so each segment is a byte-exact substring of the corpus field.
 *
 *   ⚠️ PARITY GUARD. Odd-index-keeping is only meaningful when the quote marks
 *   pair up. A handful of entries carry a stray unmatched '"' (Tirmidhi 45:25
 *   has a closing quote with no opener), and on those, "index 1" is everything
 *   from the stray quote to the end of the entry — which is Abu Isa's GRADING
 *   NOTE, i.e. exactly the thing this transform exists to remove. When the quote
 *   count is odd we emit NO segments at all rather than a plausible-looking
 *   wrong one. A SAY slice pointing into such an entry is a hard failure.
 *
 * ── TRANSFORM 2: `SAY` ─────────────────────────────────────────────────────
 * A matn segment is *the narration*, not *the words to say*. "Whoever says
 * SubhanAllah wa bihamdihi a hundred times a day, his sins are forgiven..." is a
 * third-person report; rendering all of it under a heading that reads "Say"
 * tells a reader who cannot read Arabic to recite the reward clause. So a "Say"
 * block never renders a whole segment by default: SAY_SLICES below names a
 * WORD RANGE inside one segment, and the generator cuts it.
 *
 *   The cut is only ever made at whitespace, so it can never split a letter from
 *   its combining marks, and the result is asserted to be a byte-exact substring
 *   of the stored `arabic`. If a formula is not physically present inside the
 *   narration (Muslim 4:74 promises a reward for salawat but never quotes the
 *   salawat), NO slice can produce it — that deed gets its Say block spliced
 *   from a different narration that does quote it, or gets no Say block at all.
 *   The table is deliberately explicit and reviewable: every entry says which
 *   words, out of how many, and the generator prints the result.
 *
 * Run:  node apps/web/scripts/gen-small-deeds-quotes.mjs
 * Re-run it after any change to verified-small-deeds.json. Never edit the
 * generated file by hand.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const IN = path.join(here, "verified-small-deeds.json");
const OUT = path.join(here, "..", "src", "data", "small-deeds-quotes.generated.ts");

/** Whitespace + Unicode bidi/joiner marks + the corpus' quote-scaffold punctuation.
 *  Built from code points rather than pasted literals: every character in this
 *  class is invisible in an editor, so a literal would be unreviewable. */
const EDGE_CLASS = [
  "\\s",
  "\\u200B-\\u200F", // ZWSP, ZWNJ, ZWJ, LRM, RLM — the corpus pads quotes with these
  "\\u202A-\\u202E", // bidi embedding / override
  "\\u2066-\\u2069", // bidi isolates
  "\\u061C", // Arabic letter mark
  "\\.", // the corpus' end-of-quote full stop
  "\\u060C", // Arabic comma
].join("");
const EDGE = new RegExp(`^[${EDGE_CLASS}]+|[${EDGE_CLASS}]+$`, "g");

/** Byte-exact substrings of `arabic` that the corpus wrapped in double quotes.
 *  Returns [] when the quote marks do not pair up — see the parity guard above. */
function matnSegments(arabic) {
  const parts = arabic.split('"');
  if (parts.length % 2 === 0) return null; // odd number of quote marks
  const out = [];
  for (let i = 1; i < parts.length; i += 2) {
    const seg = parts[i].replace(EDGE, "");
    if (seg) out.push(seg);
  }
  return out;
}

/**
 * THE SAY TABLE — what a "Say" / "Recite" block on /small-deeds actually renders.
 *
 * `words: [from, to]` is a half-open range over the whitespace-separated tokens
 * of segment `seg`, `to: null` meaning "to the end". The comment on each line is
 * what the range is cutting AWAY, because that is the part a reviewer has to
 * agree with. A deed with no entry here renders no Arabic Say block.
 */
const SAY_SLICES = {
  // Bukhari 80:3 — drops "The chief of istighfar is that you say:" (4 words).
  "sayyid-al-istighfar": { hadith: "sayyid-istighfar-bukhari", seg: 0, words: [4, null] },
  // Bukhari 80:100 — drops "Whoever says" and the whole reward clause.
  "subhanallah-100": { hadith: "subhanallah-100", seg: 0, words: [2, 5] },
  // Bukhari 80:101 — drops "Two words, light on the tongue, heavy in the balance...".
  "two-words": { hadith: "two-words-bukhari", seg: 0, words: [10, 16] },
  // Bukhari 80:98 — drops "Whoever says" and the reward accounting.
  "tahlil-100": { hadith: "tahlil-100-bukhari", seg: 0, words: [2, 19] },
  // Tirmidhi 48:184 — drops "Whoever says ten times" and the reward clause.
  "tahlil-ten": { hadith: "tahlil-ten", seg: 0, words: [4, 23] },
  // Tirmidhi 48:95 — drops "Whoever says" and "a date palm is planted for him".
  "date-palm": { hadith: "date-palm-planted", seg: 0, words: [2, 6] },
  // Ibn Majah 33:151 — drops the imperative "Say" and "a tree is planted for you".
  "four-words": { hadith: "four-words-tree", seg: 2, words: [1, 11] },
  // Bukhari 10:236 — the whole quoted segment IS the formula he said after prayer.
  "tahlil-after-prayer": { hadith: "tahlil-after-prayer-bukhari", seg: 0, words: [0, null] },
  // Muslim 5:188 — the hundredth ONLY. The 33/33/33 are named in that narration as
  // verbs (sabbaha / hamida / kabbara), never quoted as formulas, so they cannot be
  // spliced from it; the card states them in words instead.
  "tasbih-hundredth": { hadith: "tasbih-33-33-33-tahlil", seg: 0, words: [23, 40] },
  // Bukhari 65:319 — drops the plural imperative "Say". This is the salawat itself;
  // Muslim 4:74 (the ten-fold promise) never quotes it, so it is spliced from here.
  salawat: { hadith: "salawat-formula-bukhari", seg: 0, words: [1, null] },
};

/** Cut [from, to) whitespace-separated words out of `s`, at whitespace only. */
function wordSlice(s, from, to) {
  const words = [...s.matchAll(/\S+/gu)];
  if (from < 0 || from >= words.length) throw new Error(`word ${from} out of range (${words.length})`);
  const last = (to === null ? words.length : to) - 1;
  if (last < from || last >= words.length) throw new Error(`word ${to} out of range (${words.length})`);
  const a = words[from].index;
  const b = words[last].index + words[last][0].length;
  return s.slice(a, b).replace(EDGE, "");
}

const src = JSON.parse(fs.readFileSync(IN, "utf8"));
if (src.summary.failed !== 0) {
  console.error(`refusing to generate: ${src.summary.failed} citation(s) failed verification`);
  process.exit(1);
}

/** The collector's own apparatus (grading, chain notes, chapter cross-references)
 *  sits inside this entry's `arabic`, after the matn. Reported on the card. */
const ARABIC_WARNING = (w) => w.field === "arabic";

const hadith = {};
const ayah = {};
const raw = {};
const parityFailures = [];

for (const v of src.verified) {
  if (v.kind === "hadith") {
    const segs = matnSegments(v.arabic);
    if (segs === null) parityFailures.push(`${v.key} (${v.citation})`);
    raw[v.key] = v;
    hadith[v.key] = {
      practice: v.practice,
      citation: v.citation,
      english: v.english,
      matn: segs ?? [],
      /** The collector's own notes on the report follow the text in this entry. */
      collectorNotes: (v.warnings ?? []).some(ARABIC_WARNING),
    };
  } else if (v.kind === "quran") {
    ayah[v.key] = {
      practice: v.practice,
      citation: v.citation,
      textAr: v.textAr,
      textEn: v.textEn,
      textTranslit: v.textTranslit,
    };
  }
}

/* ── resolve the SAY table, asserting every slice back against the corpus ── */
const say = {};
for (const [id, spec] of Object.entries(SAY_SLICES)) {
  const entry = raw[spec.hadith];
  if (!entry) throw new Error(`SAY "${id}" points at unknown hadith key "${spec.hadith}"`);
  const segs = hadith[spec.hadith].matn;
  if (segs.length === 0) {
    throw new Error(
      `SAY "${id}" points into ${entry.citation}, whose quote marks do not pair up — ` +
        `no segment from that entry can be trusted. Splice from another narration.`
    );
  }
  const seg = segs[spec.seg];
  if (seg === undefined) throw new Error(`SAY "${id}": ${entry.citation} has no segment ${spec.seg}`);
  const arabic = wordSlice(seg, spec.words[0], spec.words[1]);
  if (!arabic) throw new Error(`SAY "${id}" resolved to an empty string`);
  // The load-bearing assertion: whatever we cut is still the corpus' own bytes.
  if (!entry.arabic.includes(arabic)) {
    throw new Error(`SAY "${id}" is NOT a byte-exact substring of ${entry.citation}`);
  }
  say[id] = { arabic, citation: entry.citation, hadith: spec.hadith };
}

if (parityFailures.length) {
  console.warn(
    `note: ${parityFailures.length} entr${parityFailures.length === 1 ? "y" : "ies"} had unpaired ` +
      `quote marks and emitted NO matn segments (citation-only is still fine): ` +
      parityFailures.join(", ")
  );
}
for (const [id, s] of Object.entries(say)) {
  console.log(`  say/${id}  ${s.citation}  ${[...s.arabic.matchAll(/\S+/gu)].length} words`);
}

const sayIds = Object.keys(say);
const banner = `// GENERATED FILE — DO NOT EDIT.
// Source: apps/web/scripts/verified-small-deeds.json (${src.summary.passed}/${src.summary.total} citations verified)
// Regenerate: node apps/web/scripts/gen-small-deeds-quotes.mjs
//
// Every string below was copied by machine out of packages/content/hadith and
// packages/content/quran. \`english\` is the stored field verbatim — including the
// places where the corpus ends a quotation without a closing quote or full stop.
// Do not "fix" those; they are the bytes the app's own hadith reader shows.
//
// \`matn\`  = the double-quoted segments sliced out of the stored \`arabic\`, i.e.
//           reported speech with the isnad and the collector's notes removed. A
//           matn segment is still THE NARRATION ("whoever says X gets Y"), not
//           the words to say — it is used for the page's opening quote only.
// \`SAY\`   = the words to say. A word-range cut out of one matn segment, asserted
//           at generation time to be a byte-exact substring of the stored Arabic.
//           Cuts fall on whitespace only, so no combining mark is ever split.

/** One narration, as stored. */
export type HadithQuote = {
  /** Short label for a Sources & References line. Descriptive, not a quotation. */
  practice: string;
  citation: string;
  english: string;
  matn: string[];
  /** The collector's own notes on this report follow the text inside the entry. */
  collectorNotes: boolean;
};

/** One ayah, byte-identical to what the app's Qur'an reader renders. */
export type AyahQuote = {
  practice: string;
  citation: string;
  textAr: string;
  textEn: string;
  textTranslit: string;
};

/** The words to say — never a whole narration. */
export type SayLine = {
  arabic: string;
  /** The narration the words were cut out of. Shown with the block. */
  citation: string;
  hadith: string;
};

/** Keys of SAY, as a union, so a deed cannot reference a Say block that is gone. */
export type SayId =
${sayIds.map((k) => `  | ${JSON.stringify(k)}`).join("\n")};
`;

const body =
  `\nexport const HADITH: Record<string, HadithQuote> = ${JSON.stringify(hadith, null, 2)};\n` +
  `\nexport const AYAH: Record<string, AyahQuote> = ${JSON.stringify(ayah, null, 2)};\n` +
  `\nexport const SAY: Record<SayId, SayLine> = ${JSON.stringify(say, null, 2)};\n`;

fs.writeFileSync(OUT, banner + body, "utf8");
console.log(
  `wrote ${path.relative(process.cwd(), OUT)} — ${Object.keys(hadith).length} hadith, ${Object.keys(ayah).length} ayat, ${sayIds.length} say blocks`
);
