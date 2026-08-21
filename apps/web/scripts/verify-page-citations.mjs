#!/usr/bin/env node
/**
 * verify-page-citations.mjs — deterministic citation verifier.
 *
 * WHY THIS EXISTS
 * ---------------
 * A previous content pass produced authentic-SOUNDING hadith with wrong
 * references, including impossible ones ("Bukhari 9733"). LLM-authored
 * citations are worthless. This script is the only thing that may promote a
 * quotation to "citable" on a page: it proves the English string is a genuine
 * substring of a real entry in the cited collection, and then hands back that
 * entry's CANONICAL `reference` and `arabic` so the page builder never retypes
 * either one.
 *
 * USAGE
 *   node apps/web/scripts/verify-page-citations.mjs <input.json> [--out verified.json] [--quiet]
 *
 * INPUT  (input.json)
 *   {
 *     "hadith": [
 *       {
 *         "key":       "istighfar-distress",        // stable id for the builder
 *         "practice":  "Istighfar — a way out",     // human label for the report
 *         "collection": "abudawud",                 // bukhari|muslim|abudawud|tirmidhi|nasai|ibnmajah|ahmad
 *         "english":   "If anyone continually asks pardon",   // MUST be verbatim
 *         "reference": "8:103"                      // the CLAIMED reference (optional but expected)
 *       }
 *     ],
 *     "quran": [ { "key": "ayat-al-kursi", "ref": "2:255" } ]
 *   }
 *
 * MATCHING POLICY (deliberately strict — do not loosen)
 *   1. Raw substring of the entry's `english`.               -> normalization: "none"
 *   2. If that fails: both sides whitespace-collapsed         -> normalization: "whitespace"
 *      (runs of any Unicode whitespace, incl. NBSP, -> one space; trimmed).
 *      Whitespace is safe because it carries no meaning and JSON/editor
 *      round-trips mangle it. NOTHING ELSE is normalised: no case folding, no
 *      quote/apostrophe substitution, no punctuation stripping, no diacritic
 *      folding, no word changes. If a quotation only matches after changing a
 *      WORD, it is not that hadith's wording and it FAILS.
 *   3. No match anywhere in the collection -> HARD FAIL. The item is DROPPED.
 *      (--scan-all then reports whether it exists in a DIFFERENT collection,
 *      purely so the report can say where it really lives. That is a
 *      diagnostic, never a pass.)
 *
 * FAILURE CODES
 *   NO_MATCH            english is nowhere in the cited collection      -> DROP
 *   REFERENCE_MISMATCH  english is real, but the claimed reference      -> FIX ref, do not drop
 *                       points at a different entry
 *   AMBIGUOUS           english matches >1 entry and no claimed         -> needs a longer needle
 *                       reference disambiguates
 *   UNLINKABLE_REF      canonical reference is not "book:hadith", so    -> HadithRefText renders
 *                       HadithRefText will not link it                     it as dead plain text
 *   NO_SUCH_COLLECTION / NO_SUCH_VERSE / BAD_ITEM
 *
 * EXIT CODE: 0 if every item PASSED, 1 otherwise.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");
const HADITH_DIR = join(REPO, "packages/content/hadith");
const QURAN_DIR = join(REPO, "packages/content/quran/verses");

/** Display names MUST match HadithRefText's COLLECTION_SLUGS keys exactly,
 *  or the citation renders as inert plain text with no link. */
const DISPLAY_NAME = {
  bukhari: "Bukhari",
  muslim: "Muslim",
  abudawud: "Abu Dawud",
  tirmidhi: "Tirmidhi",
  nasai: "Nasai",
  ibnmajah: "Ibn Majah",
  ahmad: "Ahmad",
};
const COLLECTIONS = Object.keys(DISPLAY_NAME);

/** HadithRefText's own pattern — a reference that fails this does not link.
 *  NOTE: Ahmad's stored references are "Musnad Ahmad 975" (no book:hadith), so
 *  NOTHING from the ahmad collection can be rendered as a working citation. */
const LINKABLE = /^\d+(?::\d+)+$/;

const ws = (s) => String(s).replace(/\s+/gu, " ").trim();

/* ── Non-fatal warnings: things that are TRUE but will render badly ──
 * Tirmidhi/Nasai entries routinely append Abu Isa's grading and chain
 * commentary INSIDE the same `arabic` field as the matn, and Nasai appends
 * "(Sahih)"/"(Da'if)" to the `english`. A builder splicing the field verbatim
 * would print grading apparatus in the page's Arabic block. Detect it. */
const ARABIC_COMMENTARY = [
  ["قَالَ أَبُو عِيسَى", "Abu Isa's grading comment follows the matn"],
  ["هَذَا حَدِيثٌ", "a grading verdict (hadha hadithun ...) follows the matn"],
  ["وَفِي الْبَابِ", "a 'and in the chapter' cross-reference follows the matn"],
  ["وَقَدْ رُوِيَ", "a variant-narration note follows the matn"],
  ["وَرَوَاهُ", "a variant-narration note follows the matn"],
  ["مَنْ وَقَفَهُ وَلَمْ يَرْفَعْهُ", "the collector himself records that some narrators reported this MAWQUF (a Companion's own words), not marfu' to the Prophet"],
  ["مَوْقُوفًا", "the collector himself records a MAWQUF (non-prophetic) route for this report"],
];
const ENGLISH_GRADING = /\((Sahih|Hasan|Da'if|Daif|Sahih Mawquf)\)\s*$/;

function analyseEntry(entry) {
  const warnings = [];
  for (const [marker, why] of ARABIC_COMMENTARY) {
    if (entry.arabic.includes(marker)) warnings.push({ field: "arabic", marker, why });
  }
  const g = ENGLISH_GRADING.exec(entry.english);
  if (g) {
    warnings.push({
      field: "english",
      marker: g[0].trim(),
      why: `the stored english ends with the grading tag "${g[0].trim()}" — it is part of the byte string, decide deliberately whether it appears on the page`,
    });
  }
  return warnings;
}

/* ───────────────────────── corpus ───────────────────────── */

const corpus = new Map(); // collection -> entries[]

function loadCollection(collection) {
  if (corpus.has(collection)) return corpus.get(collection);
  const dir = join(HADITH_DIR, collection);
  if (!existsSync(dir)) return null;
  const entries = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json") || file === "metadata.json") continue;
    const book = file.replace(/\.json$/, "");
    const raw = JSON.parse(readFileSync(join(dir, file), "utf8"));
    if (!Array.isArray(raw)) continue;
    for (const e of raw) {
      entries.push({
        collection,
        file: `packages/content/hadith/${collection}/${file}`,
        book,
        id: e.id, // NOTE: ids are not always ints (bukhari/66.json has "5051.2")
        reference: e.reference,
        english: typeof e.english === "string" ? e.english : "",
        arabic: typeof e.arabic === "string" ? e.arabic : "",
      });
    }
  }
  // Precompute the whitespace-collapsed haystack once.
  for (const e of entries) e._wsEnglish = ws(e.english);
  corpus.set(collection, entries);
  return entries;
}

function findEntryByReference(collection, reference) {
  const entries = loadCollection(collection);
  if (!entries) return null;
  return entries.filter((e) => e.reference === reference);
}

/* ───────────────────────── hadith check ───────────────────────── */

function checkHadith(item, opts) {
  const out = {
    key: item.key ?? null,
    practice: item.practice ?? null,
    kind: "hadith",
    claimed: { collection: item.collection, reference: item.reference ?? null },
    status: "FAIL",
    code: null,
    normalization: null,
    why: null,
  };

  if (!item.collection || typeof item.english !== "string" || !item.english.trim()) {
    out.code = "BAD_ITEM";
    out.why = "item needs a `collection` and a non-empty `english` string";
    return out;
  }
  const entries = loadCollection(item.collection);
  if (!entries) {
    out.code = "NO_SUCH_COLLECTION";
    out.why = `no directory packages/content/hadith/${item.collection}; valid: ${COLLECTIONS.join(", ")}`;
    return out;
  }

  const needle = item.english;
  let matches = entries.filter((e) => e.english.includes(needle));
  let normalization = "none";

  if (matches.length === 0) {
    const n = ws(needle);
    matches = entries.filter((e) => e._wsEnglish.includes(n));
    if (matches.length > 0) normalization = "whitespace";
  }

  if (matches.length === 0) {
    out.code = "NO_MATCH";
    out.why =
      `the english string is not a substring of any of the ${entries.length} entries in ` +
      `${item.collection}, raw or whitespace-collapsed. DROP IT.`;
    if (opts.scanAll) {
      const elsewhere = [];
      const n = ws(needle);
      for (const c of COLLECTIONS) {
        if (c === item.collection) continue;
        const es = loadCollection(c) ?? [];
        for (const e of es) {
          if (e.english.includes(needle) || e._wsEnglish.includes(n)) {
            elsewhere.push(`${DISPLAY_NAME[c]} ${e.reference}`);
          }
        }
      }
      out.foundInOtherCollections = elsewhere;
      if (elsewhere.length) {
        out.why += ` DIAGNOSTIC ONLY: this wording does exist at ${elsewhere.join(", ")} — ` +
          `that is a different citation, not a pass for the one claimed.`;
      }
    }
    return out;
  }

  out.normalization = normalization;

  // Disambiguate with the claimed reference when the needle is not unique.
  let match = matches[0];
  if (matches.length > 1) {
    const byRef = item.reference ? matches.find((m) => m.reference === item.reference) : null;
    if (byRef) {
      match = byRef;
      out.alsoMatched = matches
        .filter((m) => m !== byRef)
        .map((m) => `${DISPLAY_NAME[item.collection]} ${m.reference}`);
    } else {
      out.code = "AMBIGUOUS";
      out.why =
        `english matches ${matches.length} entries (` +
        matches.map((m) => `${DISPLAY_NAME[item.collection]} ${m.reference}`).join(", ") +
        `) and the claimed reference is not one of them. Lengthen the needle.`;
      return out;
    }
  }

  const canonicalRef = match.reference;
  const citation = `${DISPLAY_NAME[item.collection]} ${canonicalRef}`;

  out.canonical = {
    collection: item.collection,
    displayName: DISPLAY_NAME[item.collection],
    reference: canonicalRef,
    citation,
    id: match.id,
    file: match.file,
    english: match.english, // verbatim, for the builder to copy
    arabic: match.arabic, // verbatim, never retyped
  };

  if (!LINKABLE.test(canonicalRef)) {
    out.code = "UNLINKABLE_REF";
    out.why =
      `canonical reference "${canonicalRef}" is not book:hadith, so HadithRefText ` +
      `renders "${citation}" as unlinked plain text.`;
    return out;
  }

  if (item.reference && item.reference !== canonicalRef) {
    out.code = "REFERENCE_MISMATCH";
    out.why =
      `the english IS genuine, but it lives at ${citation}, not at the claimed ` +
      `${DISPLAY_NAME[item.collection]} ${item.reference}.`;
    const claimedEntries = findEntryByReference(item.collection, item.reference);
    out.claimedRefActuallyIs = claimedEntries?.length
      ? claimedEntries[0].english.slice(0, 180)
      : "(no entry with that reference exists in this collection)";
    return out;
  }

  out.status = "PASS";
  out.code = null;
  out.warnings = analyseEntry(match);
  out.why = item.reference
    ? "english verified verbatim; claimed reference matches the canonical reference"
    : "english verified verbatim; canonical reference pulled from the matched entry";
  return out;
}

/* ───────────────────────── quran check ───────────────────────── */

function checkQuran(item) {
  const out = {
    key: item.key ?? null,
    practice: item.practice ?? null,
    kind: "quran",
    claimed: { reference: item.ref ?? null },
    status: "FAIL",
    code: null,
    why: null,
  };
  const m = /^(\d+):(\d+)$/.exec(String(item.ref ?? ""));
  if (!m) {
    out.code = "BAD_ITEM";
    out.why = "quran items need `ref` in the form S:V";
    return out;
  }
  const [, surah] = m;
  const file = join(QURAN_DIR, `${surah}.json`);
  if (!existsSync(file)) {
    out.code = "NO_SUCH_VERSE";
    out.why = `no ${file}`;
    return out;
  }
  const verses = JSON.parse(readFileSync(file, "utf8"));
  const v = verses.find((x) => x.key === item.ref);
  if (!v) {
    out.code = "NO_SUCH_VERSE";
    out.why = `surah ${surah} has no key "${item.ref}"`;
    return out;
  }
  out.status = "PASS";
  out.canonical = {
    reference: v.key,
    citation: `Quran ${v.key}`,
    file: `packages/content/quran/verses/${surah}.json`,
    textAr: v.textAr,
    textEn: v.textEn,
    textTranslit: v.textTranslit,
  };
  out.why = "verse spliced verbatim from the app's own Quran data";
  return out;
}

/* ───────────────────────── main ───────────────────────── */

const argv = process.argv.slice(2);
const inputPath = argv.find((a) => !a.startsWith("--"));
const outPath = (() => {
  const i = argv.indexOf("--out");
  return i >= 0 ? argv[i + 1] : null;
})();
const opts = { scanAll: !argv.includes("--no-scan-all"), quiet: argv.includes("--quiet") };

if (!inputPath) {
  console.error("usage: node verify-page-citations.mjs <input.json> [--out verified.json] [--quiet]");
  process.exit(2);
}

const input = JSON.parse(readFileSync(resolve(inputPath), "utf8"));
const hadithItems = input.hadith ?? (Array.isArray(input) ? input : []);
const quranItems = input.quran ?? [];

const results = [
  ...hadithItems.map((i) => checkHadith(i, opts)),
  ...quranItems.map((i) => checkQuran(i)),
];

const passed = results.filter((r) => r.status === "PASS");
const failed = results.filter((r) => r.status !== "PASS");

if (!opts.quiet) {
  for (const r of results) {
    const label = r.practice || r.key || "(unnamed)";
    if (r.status === "PASS") {
      const c = r.canonical;
      const norm = r.normalization && r.normalization !== "none" ? ` [normalised: ${r.normalization}]` : "";
      console.log(`PASS  ${label}\n      -> ${c.citation}   (id ${c.id ?? "-"}, ${c.file ?? ""})${norm}`);
      if (r.alsoMatched?.length) console.log(`      note: same wording also at ${r.alsoMatched.join(", ")}`);
      for (const w of r.warnings ?? []) console.log(`      WARN [${w.field}] ${w.why}`);
    } else {
      console.log(`FAIL  ${label}  [${r.code}]\n      ${r.why}`);
      if (r.claimedRefActuallyIs) console.log(`      claimed ref actually reads: ${r.claimedRefActuallyIs}`);
      if (r.foundInOtherCollections?.length) console.log(`      exists elsewhere: ${r.foundInOtherCollections.join(", ")}`);
    }
  }
  console.log(`\n${passed.length} PASS / ${failed.length} FAIL of ${results.length}`);
}

if (outPath) {
  const payload = {
    generatedBy: "apps/web/scripts/verify-page-citations.mjs",
    generatedAt: new Date().toISOString(),
    summary: { total: results.length, passed: passed.length, failed: failed.length },
    // Everything the builder may put on a page. Nothing outside `verified` may be cited.
    verified: passed.map((r) => ({
      key: r.key,
      practice: r.practice,
      kind: r.kind,
      ...(r.kind === "hadith"
        ? {
            citation: r.canonical.citation,
            collection: r.canonical.collection,
            reference: r.canonical.reference,
            english: r.canonical.english,
            arabic: r.canonical.arabic,
            id: r.canonical.id,
            source: r.canonical.file,
            normalization: r.normalization,
            warnings: r.warnings ?? [],
          }
        : {
            citation: r.canonical.citation,
            reference: r.canonical.reference,
            textAr: r.canonical.textAr,
            textEn: r.canonical.textEn,
            textTranslit: r.canonical.textTranslit,
            source: r.canonical.file,
          }),
    })),
    dropped: failed.map((r) => ({
      key: r.key,
      practice: r.practice,
      claimed: r.claimed,
      code: r.code,
      why: r.why,
      ...(r.claimedRefActuallyIs ? { claimedRefActuallyIs: r.claimedRefActuallyIs } : {}),
      ...(r.foundInOtherCollections ? { foundInOtherCollections: r.foundInOtherCollections } : {}),
      ...(r.canonical ? { canonicalIfKept: { citation: r.canonical.citation, english: r.canonical.english, arabic: r.canonical.arabic } } : {}),
    })),
  };
  writeFileSync(resolve(outPath), JSON.stringify(payload, null, 2));
  if (!opts.quiet) console.log(`\nwrote ${outPath}`);
}

process.exit(failed.length ? 1 : 0);
