import * as fs from "fs";
import * as path from "path";
import { CONTENT_ROOT } from "./content-root";
import { INDEX_VERSION, normalizeText } from "./tokenize.mjs";
import {
  type Corpus,
  type PhraseEvidence,
  type Postings,
  type SearchTier,
  tieredSearch,
} from "./bm25";

const HADITH_DIR = path.join(CONTENT_ROOT, "hadith");
const INDEX_FILE = path.join(HADITH_DIR, "search-index.json");

/** Longest English text we hand back per hit — enough to judge relevance without flooding the answer prompt. */
const MAX_RESULT_CHARS = 500;

// ── Collection-authority prior ────────────────────────────────────────────
//
// BM25 ranks on lexical evidence alone, so two narrations of the same wording
// tie regardless of how rigorously each was authenticated. This is a small,
// relevance-independent multiplier that breaks those ties toward the Sahihayn —
// both a retrieval improvement and the right default for a hadith app.
//
// It is a TIE-BREAKER, NOT A FILTER, and the size is what keeps it one. At
// AUTHORITY_BOOST = 0.05 a Bukhari/Muslim hit overtakes a Musnad Ahmad one only
// when it is within 5% of its score (2.5% against the four sunan, which sit at
// half the boost); anything more relevant than that still wins outright.
//
// CALIBRATED, not guessed — swept 0.00→0.50 over two independent gold sets
// (28-query and 24-query; accept-sets computed from the raw corpus, so the
// prior cannot define its own ground truth). Measured on the 28-query set:
//
//   boost   0.00  0.02  0.03–0.07  0.09–0.12  0.15–0.25  0.30+
//   hit@1     14    14      15         14         13        13
//   hit@5     22    22      22         23         23        22
//
// The 24-query set is FLAT at hit@1 15 / hit@5 20 for EVERY boost through 0.30
// (it only moves at 0.40+, to 14/21), so it neither supports nor contradicts the
// choice — it only confirms nothing regresses. Applying the stated rule
// (maximise hit@1 without reducing hit@5)
// selects the 0.03–0.07 plateau, and 0.05 is its middle, so the value is not
// balanced on an edge. Bigger boosts trade that hit@1 back for a hit@5, which is
// a worse deal for a chat answer that leads with the top result.
//
// BE PRECISE ABOUT THE SIZE OF THE WIN — it is ONE query, and it is not even a
// Sahihayn one. On "…ordered to fight people until they say there is no god but
// allah", tirmidhi 40:1 trailed Musnad Ahmad 117 by 1.4% on raw BM25 (11.25 vs
// 11.41) and the half-boost lifts it past (11.53 vs 11.41). So what the gold set
// actually demonstrates is the SUNAN-over-Ahmad step, not the Sahihayn one; the
// Sahihayn tier is justified by the same reasoning but is not what moved the
// number. Everything else on both sets is unchanged.
//
// WHAT IT DOES NOT FIX — the motivating case, and it does not fix it AT ALL.
// "hadith about intention" is a ONE-term query after stop-words, so BM25 rightly
// prefers a short hadith repeating "intention" (bukhari 25:44, 8.63) over
// bukhari 1:1 with tf=1 in a 23-token document (5.80). Closing that needs ~1.49x
// — a prior that large is a collection filter, not a tie-breaker, so it was
// deliberately not applied. And because BOTH hits are Bukhari, the prior scales
// them together and moves nothing: MEASURED, bukhari 1:1 sits at rank 46 of 173
// before AND after (5.80 → 6.09, top 8.63 → 9.06). That case is recovered where
// it should be, at the wave level, by the multi-angle search: the angle "the
// reward of deeds depends upon the intentions" returns bukhari 1:1 at rank 1.
//
// Guardrails are asserted in scripts/verify-search-prior.mjs.
const AUTHORITY_BOOST = 0.05;

// Exported so scripts/verify-search-prior.mjs can assert the SPREAD stays
// inside the tie-break band. Aggregate hit@1/hit@5 numbers cannot catch a prior
// that has quietly grown into a collection filter; the ratio can.
export const COLLECTION_AUTHORITY: Record<string, number> = {
  // The two Sahih collections — the strictest authentication criteria.
  bukhari: 1 + AUTHORITY_BOOST,
  muslim: 1 + AUTHORITY_BOOST,
  // The four Sunan — canonical, but mixed grades within each book, so half.
  abudawud: 1 + AUTHORITY_BOOST / 2,
  tirmidhi: 1 + AUTHORITY_BOOST / 2,
  nasai: 1 + AUTHORITY_BOOST / 2,
  ibnmajah: 1 + AUTHORITY_BOOST / 2,
  // Musnad Ahmad — a musnad, not a sifted sunan, and the widest grade spread of
  // the seven. It is the baseline the others are measured against, so 1.
  ahmad: 1,
};

interface HadithEntry {
  id: number;
  arabic: string;
  english: string;
  reference: string;
}

interface CollectionMeta {
  collection: string;
  name: string;
  books: { id: number; name: string; count: number }[];
}

/** Shape emitted by scripts/build-hadith-index.mjs. */
interface HadithIndex {
  version: number;
  collections: string[];
  docCount: number;
  avgDocLength: number;
  docs: {
    collection: number[];
    book: number[];
    /** Index of the entry inside its book file — how we fetch text without scanning. */
    pos: number[];
    length: number[];
  };
  /** token → flat [docDelta, termFreq, ...]; doc ids are delta-encoded. */
  postings: Record<string, number[]>;
}

export interface HadithSearchResult {
  collection: string;
  collectionName: string;
  book: string;
  /** Human-readable citation. Its SHAPE VARIES BY COLLECTION — see bookId. */
  reference: string;
  /**
   * Structured link targets, kept separate from `reference` on purpose.
   *
   * `reference` is a display string and six of the seven collections spell it
   * "<book>:<n>" while Musnad Ahmad spells it "Musnad Ahmad <n>". Callers that
   * re-derived a URL by splitting that string produced
   * /hadith/ahmad/Musnad?h=undefined for all 1,285 Ahmad entries — a hard 404
   * in the static export, since generateStaticParams only emits numeric book
   * ids. These two fields come straight from the index and the entry, so no
   * caller has to parse anything. See anchorId() for how hadithId is chosen.
   */
  bookId: number;
  hadithId: number;
  english: string;
  score: number;
  tier: SearchTier;
  /** Set when `tier` is "phrase" — how much the quoted phrase really proved. */
  phrase?: PhraseEvidence;
}

// ── Caches (module scope, so a warm function pays each cost once) ──────────

let indexCache: HadithIndex | null = null;
let indexMissing = false;
const postingsCache = new Map<string, Postings>();
const metaCache = new Map<string, CollectionMeta>();
const bookCache = new Map<string, HadithEntry[]>();

function getIndex(): HadithIndex | null {
  if (indexCache) return indexCache;
  if (indexMissing) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8")) as HadithIndex;
    // The index is only meaningful to the tokeniser that produced it. Every
    // posting list is keyed by a stem, so a tokeniser change that isn't
    // followed by a rebuild leaves terms the query can no longer produce — an
    // index that is present, parses fine, and matches almost nothing. That
    // failure is invisible from the outside (it looks exactly like "the corpus
    // has no answer"), so it takes the same loud path as a missing file rather
    // than being served.
    if (parsed.version !== INDEX_VERSION) {
      throw new Error(
        `index version ${parsed.version} was built by a different tokeniser (runtime expects ${INDEX_VERSION})`
      );
    }
    indexCache = parsed;
    return indexCache;
  } catch (e) {
    // Without a usable index there is no search. Loudly, once — silently
    // returning nothing would look identical to "the corpus has no match".
    indexMissing = true;
    console.error(
      "[Ask Hiqmah] Hadith search index unusable. Run `pnpm build:search-index`.",
      e
    );
    return null;
  }
}

export function getMeta(collection: string): CollectionMeta | null {
  const cached = metaCache.get(collection);
  if (cached) return cached;
  try {
    const raw = fs.readFileSync(path.join(HADITH_DIR, collection, "metadata.json"), "utf-8");
    const meta = JSON.parse(raw) as CollectionMeta;
    metaCache.set(collection, meta);
    return meta;
  } catch {
    return null;
  }
}

function getBook(collection: string, bookId: number): HadithEntry[] {
  const key = `${collection}/${bookId}`;
  const cached = bookCache.get(key);
  if (cached) return cached;
  try {
    const raw = fs.readFileSync(path.join(HADITH_DIR, collection, `${bookId}.json`), "utf-8");
    const entries = JSON.parse(raw) as HadithEntry[];
    bookCache.set(key, entries);
    return entries;
  } catch {
    bookCache.set(key, []);
    return [];
  }
}

/**
 * The `?h=` value that /hadith/[collection]/[book] can actually resolve.
 *
 * That page looks for `[data-ref="<book>:<h>"]` first and falls back to
 * `#hadith-<h>` (the entry's global id), and the two are NOT interchangeable —
 * for 1,269 entries a global id collides with a different hadith's in-book
 * number, which would scroll to the wrong narration. So each collection gets
 * the anchor its own reference format supports:
 *
 *   - 33,804 entries spell the reference "<book>:<n>" (the head always equals
 *     the book id, verified across the corpus) → hand back <n>, which the
 *     data-ref lookup matches exactly.
 *   - the 1,285 Musnad Ahmad entries spell it "Musnad Ahmad <n>" with no colon,
 *     so no data-ref can ever match → hand back the entry id, which the
 *     `#hadith-<id>` fallback resolves. For Ahmad the id IS the hadith number.
 *
 * Kept here, next to the data, so no caller has to know any of this — callers
 * that re-derived it by splitting the display string are what produced
 * /hadith/ahmad/Musnad?h=undefined.
 */
function anchorId(entry: HadithEntry): number {
  const colon = entry.reference.indexOf(":");
  if (colon === -1) return entry.id;
  const inBook = Number(entry.reference.slice(colon + 1));
  return Number.isFinite(inBook) ? inBook : entry.id;
}

function getEntry(index: HadithIndex, doc: number): HadithEntry | null {
  const collection = index.collections[index.docs.collection[doc]];
  const entries = getBook(collection, index.docs.book[doc]);
  return entries[index.docs.pos[doc]] ?? null;
}

/** Expand one term's delta-encoded posting list, once, on first use. */
function getPostings(index: HadithIndex, term: string): Postings | null {
  const cached = postingsCache.get(term);
  if (cached) return cached;

  const flat = index.postings[term];
  if (!flat) return null;

  const df = flat.length / 2;
  const docs = new Int32Array(df);
  const freqs = new Int32Array(df);
  let doc = 0;
  for (let i = 0, j = 0; j < df; i += 2, j++) {
    doc += flat[i];
    docs[j] = doc;
    freqs[j] = flat[i + 1];
  }

  const postings: Postings = { docs, freqs };
  postingsCache.set(term, postings);
  return postings;
}

/**
 * Search every hadith collection. Ranked by BM25 with a tiered fallback — see
 * bm25.ts for why there is no keyword AND-gate. Results carry `score` and
 * `tier` on top of the fields the caller already builds citations from.
 */
export function searchHadiths(
  query: string,
  collection?: string,
  maxResults = 12
): HadithSearchResult[] {
  const index = getIndex();
  if (!index) return [];

  // An unknown collection name means "no usable filter" rather than "no
  // results" — better to answer from the whole corpus than to answer nothing.
  const restrictTo = collection ? index.collections.indexOf(collection) : -1;
  const filtered = restrictTo !== -1;

  // Resolve the authority map to the index's own collection ORDER once per
  // search, so the hot loop indexes an array instead of hashing a string.
  const authorityByCollection = index.collections.map(
    (name) => COLLECTION_AUTHORITY[name] ?? 1
  );

  const corpus: Corpus = {
    docCount: index.docCount,
    avgDocLength: index.avgDocLength,
    docLength: (doc) => index.docs.length[doc],
    postings: (term) => getPostings(index, term),
    allows: (doc) => !filtered || index.docs.collection[doc] === restrictTo,
    authority: (doc) => authorityByCollection[index.docs.collection[doc]],
  };

  const { tier, hits, phrase } = tieredSearch(corpus, query, maxResults, (doc, needle) => {
    const entry = getEntry(index, doc);
    return entry ? normalizeText(entry.english).includes(needle) : false;
  });

  const results: HadithSearchResult[] = [];
  for (const hit of hits) {
    const collectionId = index.collections[index.docs.collection[hit.doc]];
    const meta = getMeta(collectionId);
    const entry = getEntry(index, hit.doc);
    if (!meta || !entry) continue;
    const bookId = index.docs.book[hit.doc];
    results.push({
      collection: collectionId,
      collectionName: meta.name,
      book: meta.books.find((b) => b.id === bookId)?.name ?? `Book ${bookId}`,
      reference: `${collectionId} ${entry.reference}`,
      bookId,
      hadithId: anchorId(entry),
      english:
        entry.english.length > MAX_RESULT_CHARS
          ? entry.english.slice(0, MAX_RESULT_CHARS) + "…"
          : entry.english,
      score: hit.score,
      tier,
      phrase,
    });
  }
  return results;
}
