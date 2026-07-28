// Builds the BM25 inverted index that Ask Hiqmah searches at request time.
//
// WHY this exists: the runtime used to fs.readFileSync + JSON.parse all 348
// hadith book files (~51MB) on EVERY search tool call. This precomputes the
// posting lists once so a query touches one index file plus the handful of
// book files that actually won.
//
// Run from anywhere:  node scripts/build-hadith-index.mjs  (or `pnpm build:search-index`)
//
// RUN THIS BY HAND WHENEVER YOU TOUCH tokenize.mjs, and commit the result — the
// index is a committed artifact, like packages/content/quran/search-index.json.
//
// ⚠️ Do NOT wire this into apps/web's `build` script. It was, and it broke the
// Vercel deploy: Vercel builds the monorepo through Turborepo, whose build
// context contains only workspace packages, so this repo-root scripts/ file
// does not exist there (MODULE_NOT_FOUND on /vercel/path0/scripts/...). The
// artifact is already committed, so there is nothing to regenerate at deploy
// time anyway.
//
// The tokeniser is imported from the SEARCH RUNTIME, not reimplemented here —
// BM25 only matches when index-time and query-time tokenisation are identical.
// It also supplies INDEX_VERSION, which is stamped into the output and checked
// at read time: if you forget to rebuild, hadith.ts refuses the stale index and
// logs loudly rather than silently returning wrong results.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { INDEX_VERSION, tokenize } from "../apps/web/src/lib/search/tokenize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HADITH_DIR = path.join(ROOT, "packages/content/hadith");
const OUT_FILE = path.join(HADITH_DIR, "search-index.json");

// Canonical order. It is written into the index, so the runtime reads it back
// rather than having to agree with this list.
const COLLECTIONS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "ahmad"];

const startedAt = Date.now();

// Per-document columns, kept as parallel arrays: 35k objects with four keys
// each would roughly triple the file for no gain. `pos` is the entry's index
// inside its book file — that's what lets the runtime pull the English text of
// a winning hit without scanning.
const docCollection = [];
const docBook = [];
const docPos = [];
const docLength = [];

// token -> flat [docDelta, termFreq, docDelta, termFreq, ...]. Doc ids are
// delta-encoded because they're ascending: a common term's gaps are 1-2 digits
// instead of 5, which roughly halves the file while still parsing natively.
const postings = new Map();
const lastDoc = new Map();

for (let collectionIndex = 0; collectionIndex < COLLECTIONS.length; collectionIndex++) {
  const collection = COLLECTIONS[collectionIndex];
  const meta = JSON.parse(
    fs.readFileSync(path.join(HADITH_DIR, collection, "metadata.json"), "utf-8")
  );

  for (const book of meta.books) {
    const bookFile = path.join(HADITH_DIR, collection, `${book.id}.json`);
    if (!fs.existsSync(bookFile)) continue; // metadata lists a few empty books
    const entries = JSON.parse(fs.readFileSync(bookFile, "utf-8"));

    for (let pos = 0; pos < entries.length; pos++) {
      const docId = docCollection.length;
      const tokens = tokenize(entries[pos].english || "");

      docCollection.push(collectionIndex);
      docBook.push(book.id);
      docPos.push(pos);
      docLength.push(tokens.length);

      const termFreqs = new Map();
      for (const token of tokens) termFreqs.set(token, (termFreqs.get(token) || 0) + 1);

      for (const [token, freq] of termFreqs) {
        let list = postings.get(token);
        if (!list) {
          list = [];
          postings.set(token, list);
          lastDoc.set(token, 0);
        }
        list.push(docId - lastDoc.get(token), freq);
        lastDoc.set(token, docId);
      }
    }
  }
}

const totalLength = docLength.reduce((sum, n) => sum + n, 0);

// Sorted keys make the output deterministic: rebuilding an unchanged corpus
// produces an identical file apart from `builtAt`, so a real diff means the
// content actually moved rather than the term map having been reshuffled.
const sortedPostings = {};
for (const token of [...postings.keys()].sort()) sortedPostings[token] = postings.get(token);

const index = {
  // Comes from the tokeniser, not a literal: the number that matters is "which
  // tokenisation produced these postings", and the runtime refuses an index
  // whose version doesn't match the tokeniser it is querying with.
  version: INDEX_VERSION,
  collections: COLLECTIONS,
  docCount: docCollection.length,
  // Document frequency is just postings[token].length / 2, so it is not stored.
  avgDocLength: totalLength / docCollection.length,
  docs: {
    collection: docCollection,
    book: docBook,
    pos: docPos,
    length: docLength,
  },
  postings: sortedPostings,
};

// The output is a pure function of the corpus + the tokeniser (no timestamp),
// so an unchanged corpus reproduces the file byte for byte. Skipping the write
// in that case keeps the committed 4MB artifact out of every `git status` now
// that `pnpm build` runs this on every build.
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
  `Hadith search index ${changed ? "built" : "up to date"} (v${index.version}): ` +
    `${index.docCount} hadiths, ${postings.size} terms, ` +
    `${(size / 1024 / 1024).toFixed(1)}MB, ` +
    `${((Date.now() - startedAt) / 1000).toFixed(1)}s`
);
