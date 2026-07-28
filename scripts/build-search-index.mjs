// Builds the flat verse index that the surah list (/quran) substring-searches
// in the browser.
//
// WHY this exists: searching by meaning needs the English of all 6,236 āyahs,
// but verses/*.json also carries Arabic, transliteration, juz/page/hizb — ~9MB
// the search box has no use for. This strips it to {id, v:[{n,t}]} with the
// text pre-lowercased, so the page ships one small lazily-imported file and the
// match is a plain `includes()` with no per-keystroke work. It is loaded
// client-side on purpose: Quran search has to keep working OFFLINE in the app.
//
// Run from anywhere:  node scripts/build-search-index.mjs  (or `pnpm build:quran-index`)
//
// RUN THIS BY HAND WHENEVER packages/content/quran/verses/*.json CHANGES, and
// commit the result — the index is a committed artifact, like
// packages/content/hadith/search-index.json (built by build-hadith-index.mjs,
// which confusingly owns the `pnpm build:search-index` name; this one is
// `pnpm build:quran-index`). Forgetting is not hypothetical: this script still
// read the pre-monorepo src/data/quran/verses path, so it was un-runnable
// through the Rowwad translation swap and the committed index sat on Sahih
// International text for months — the search box matched wording the reader
// could never display, and missed the wording it does.
//
// ⚠️ Do NOT wire this into apps/web's `build` script. Doing that broke the
// Vercel deploy once: Vercel builds the monorepo through Turborepo, whose build
// context contains only workspace packages, so this repo-root scripts/ file
// does not exist there (MODULE_NOT_FOUND on /vercel/path0/scripts/...). The
// artifact is already committed, so there is nothing to regenerate at deploy
// time anyway.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QURAN_DIR = path.join(ROOT, "packages/content/quran");
const VERSES_DIR = path.join(QURAN_DIR, "verses");
const OUT_FILE = path.join(QURAN_DIR, "search-index.json");

const SURAH_COUNT = 114;

const startedAt = Date.now();

const index = [];
let verseCount = 0;

for (let id = 1; id <= SURAH_COUNT; id++) {
  const verses = JSON.parse(fs.readFileSync(path.join(VERSES_DIR, `${id}.json`), "utf-8"));

  // Lowercased at build time so the runtime never has to: the query is
  // lowercased once per search and compared against this directly.
  const v = verses.map((verse) => ({
    n: verse.number,
    t: verse.textEn.toLowerCase(),
  }));

  verseCount += v.length;
  index.push({ id, v });
}

// The output is a pure function of verses/*.json (no timestamp), so unchanged
// content reproduces the file byte for byte. Skipping the write in that case
// keeps the committed ~1MB artifact out of `git status` on a no-op run.
const json = JSON.stringify(index);
let existing = null;
try {
  existing = fs.readFileSync(OUT_FILE, "utf-8");
} catch {
  // no index yet — first build
}
const changed = existing !== json;
if (changed) fs.writeFileSync(OUT_FILE, json);

const size = fs.statSync(OUT_FILE).size;
console.log(
  `Quran search index ${changed ? "built" : "up to date"}: ` +
    `${index.length} sūrahs, ${verseCount} āyahs, ` +
    `${Math.round(size / 1024)}KB, ` +
    `${((Date.now() - startedAt) / 1000).toFixed(1)}s`
);
