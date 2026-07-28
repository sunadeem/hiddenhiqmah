// BM25 ranking + the tiered fallback ladder, shared by the hadith and Quran
// searches.
//
// WHY BM25 rather than "count how many keywords appear": the old scorer gave a
// match on "day" the same weight as a match on "ruqyah" and then threw away
// anything that didn't hit 2/3 of the keywords. That AND-gate is what made the
// single most famous hadith in the corpus unreachable from its most common
// paraphrase — "Actions are judged by intentions" scores 1 against "the reward
// of deeds depends upon the intentions". BM25 keeps every partial match, and
// weights each term by how rare it is, so signal outranks noise instead of
// being filtered out.

import { normalizeText, tokenize } from "./tokenize.mjs";

// Standard BM25 constants. k1 damps runaway term frequency, b controls how
// hard short documents are favoured over long ones.
const K1 = 1.2;
const B = 0.75;

// A top hit weaker than this matched almost nothing worth having. Measured
// against the corpus: a single match on a term appearing in ~1% of hadiths
// already scores ~5, so this floor only catches near-empty results.
// Exported because the route applies the same floor to the phrase tier — see
// the note on PHRASE_VERIFY_CAP.
export const MIN_BM25_SCORE = 3;

// A term is "rare" for the retry tier if its idf is at least this fraction of
// the query's rarest term.
const RARE_TERM_IDF_RATIO = 0.6;
const MAX_RARE_TERMS = 3;

// Ceiling on how many docs an exact-phrase pass will pull text for — an I/O
// budget, nothing more.
//
// It used to be applied by slicing the raw intersection, which is ordered by
// DOCUMENT ID, and doc ids are handed out collection by collection with Bukhari
// first. So whenever the intersection overflowed, the survivors were always the
// earliest Bukhari hadith and the phrase tier silently failed on everything
// else. MEASURED: 11 of 15 realistic quotes overflow it — "one of you"
// intersects 8,634 docs of which 834 really contain the phrase, but only 27
// were inside the first 300 by id. "Normally a handful" was simply wrong.
//
// Now the intersection is BM25-ranked FIRST and verification walks down the
// ranked list, so the budget spends itself on the most relevant candidates and
// an overflowing phrase degrades gracefully instead of snapping to Bukhari.
// Intersections at or under the budget are still verified exhaustively.
const PHRASE_VERIFY_CAP = 300;

// Second, tighter budget: stop verifying once this many multiples of `limit`
// have been CONFIRMED to contain the phrase.
//
// Needed because ranking the window changed what a walk costs. The document
// count is the same as the old doc-id slice, but documents are not the unit of
// work — BOOK FILES are, and the old slice was doc-id contiguous so its 300
// documents clustered into ~24 files, while a BM25-ranked window is scattered
// across the corpus. MEASURED cold, one query per process: 'a hadith saying
// "one of you"' read 135 distinct book files in 178ms at 182MB RSS, and 'a
// hadith that says "the people"' 118 files in 178ms — against 24 files/40ms and
// 22 files/40ms for the old contiguous slice. That is ~5.5x the file reads and
// ~4.4x the cold latency, and it was bought deliberately: the cheap slice
// answered those two with a top 5 of bukhari 4:78/9:33/10:264/10:25/24:14 and
// bukhari 10:111/10:73/22:13/22:12/23:119 — it snapped to early Bukhari on
// every overflowing quote, which is the bug ranking exists to fix.
//
// This bound recovers part of that without giving up the ranking. `ordered` is
// already BM25-ranked on the phrase's own terms, so the first confirmations are
// the most relevant ones; 3x limit leaves the final full-query rerank a pool
// several times larger than it will return.
//
// BE CLEAR ABOUT ITS REACH — it only bites when the ranked window is DENSE in
// the phrase, and it often is not. Counting how many of the top-300 window
// literally contain the phrase: "the people" 237 and "the son of adam" 87, so
// the 36-confirmation budget lands at window positions 40 and 51 and the walk
// stops early. But "one of you" yields only 18 and "the best of you" 35 — both
// UNDER the budget, so those walks still read the whole window and their cost
// is unchanged. "a man came" reaches 36 only at position 268 of 300, which
// saves almost nothing. MEASURED cold, before → after: "the people" 118
// files/178ms/181MB → 24/76ms/145MB, the son-of-adam question 74/109ms/161MB →
// 33/70ms/147MB, "a man came" 134 → 130 files, "one of you" and "the best of
// you" unchanged at 135 and 115. So this is a real win on two of five probed
// quotes and a no-op on the rest — worth keeping, but it is NOT a general fix
// for the phrase tier's cold cost. PHRASE_VERIFY_CAP is the only hard bound.
//
// Genuine quotes are unaffected: they confirm in single figures and never reach
// the bound (20/20 verbatim quotes return a byte-identical top 5 against the
// unbounded walk). The one quality cost is that when a phrase DOES exceed the
// budget the final rerank chooses from a truncated pool, which can reorder
// ranks 4+ — measured on the son-of-adam question, where ranks 1-3 held and
// ranks 4/5 swapped.
const PHRASE_VERIFY_MULTIPLE = 3;

/** Which fallback tier produced the results — surfaced so the route can say it went deeper. */
export type SearchTier = "phrase" | "bm25" | "rare-terms" | "none";

/**
 * How much the quoted phrase actually proved, for callers deciding whether a
 * phrase hit is decisive enough to stop searching.
 *
 * Needed because "the user quoted something and we found it" is not by itself
 * evidence of anything: the search model is now *told* to quote the user's
 * wording, so quotes made of filler words are a designed-for case, not an edge
 * case. MEASURED before this existed: "one of you", "the best of you" and "the
 * people" all verified as exact phrases and all counted as strong matches,
 * permanently suppressing the refinement round.
 */
export interface PhraseEvidence {
  /** Distinct non-stop terms the quoted phrase contributed. One means it was filler. */
  terms: number;
  /**
   * Documents containing ALL of those terms. A cheap exact upper bound on how
   * many contain the phrase: a genuine quote lands in single figures, filler in
   * the hundreds or thousands.
   */
  candidates: number;
}

export interface Postings {
  /** Ascending document ids. */
  docs: ArrayLike<number>;
  /** Term frequency per entry, parallel to `docs`. */
  freqs: ArrayLike<number>;
}

/** Everything the ranker needs, so hadith (on-disk index) and Quran (in-memory) share one implementation. */
export interface Corpus {
  docCount: number;
  avgDocLength: number;
  docLength(doc: number): number;
  postings(term: string): Postings | null;
  /** Collection / surah filter. Return true when the doc is in scope. */
  allows(doc: number): boolean;
  /**
   * OPTIONAL relevance-independent prior, multiplied into the final score.
   *
   * BM25 only knows lexical overlap; it cannot know that two documents saying
   * the same thing are not equally authenticated. The hadith corpus supplies a
   * per-collection weight here so that, at comparable relevance, a Sahihayn
   * narration outranks a sunan one — see COLLECTION_AUTHORITY in hadith.ts for
   * the map and the calibration. The Quran omits it (6,236 verses of one text
   * have nothing to rank by), which is why it is optional and defaults to 1.
   *
   * Deliberately applied HERE rather than in either caller, so the bm25 tier,
   * the rare-terms tier and the phrase tier's two internal rerank passes all
   * get it from one place.
   */
  authority?(doc: number): number;
}

export interface Hit {
  doc: number;
  score: number;
}

export interface TieredSearchResult {
  tier: SearchTier;
  hits: Hit[];
  /** Present only on tier "phrase". */
  phrase?: PhraseEvidence;
}

/** Inverse document frequency, BM25+ variant (always positive, so a term can never subtract). */
function idf(df: number, docCount: number): number {
  return Math.log(1 + (docCount - df + 0.5) / (df + 0.5));
}

function termScore(
  freq: number,
  docLength: number,
  avgDocLength: number,
  termIdf: number
): number {
  const norm = K1 * (1 - B + (B * docLength) / avgDocLength);
  return (termIdf * (freq * (K1 + 1))) / (freq + norm);
}

function uniqueTerms(text: string): string[] {
  return [...new Set(tokenize(text))];
}

/**
 * Score every document matching AT LEAST ONE term and return the best `limit`.
 * There is deliberately no AND-gate: recall matters more than precision here
 * because the answer pass is instructed to discard irrelevant results.
 */
function rankByBm25(corpus: Corpus, terms: string[], limit: number): Hit[] {
  const scores = new Map<number, number>();

  for (const term of terms) {
    const postings = corpus.postings(term);
    if (!postings) continue;
    const df = postings.docs.length;
    const termIdf = idf(df, corpus.docCount);

    for (let i = 0; i < df; i++) {
      const doc = postings.docs[i];
      if (!corpus.allows(doc)) continue;
      const score = termScore(
        postings.freqs[i],
        corpus.docLength(doc),
        corpus.avgDocLength,
        termIdf
      );
      scores.set(doc, (scores.get(doc) ?? 0) + score);
    }
  }

  // Apply the authority prior MULTIPLICATIVELY, and only once the whole query
  // has been accumulated.
  //
  // Multiplicative rather than additive because BM25 scores are not on a fixed
  // scale — they run ~2 to ~38 across this corpus — so any additive constant is
  // a different-sized thumb on the scale at each end. A flat +1 is a 33% lift
  // on a score of 3 and a 3% lift on a score of 30: it would barely touch the
  // confident queries it is meant to tie-break and would dominate exactly the
  // weak, near-noise ones where the ranking is least trustworthy. A factor
  // keeps the prior proportional, which is what makes the guardrail hold — a
  // sunan hadith more than AUTHORITY_BOOST more relevant than a Bukhari one
  // still wins, at every point on the scale.
  const hits: Hit[] = [];
  for (const [doc, score] of scores) {
    hits.push({ doc, score: corpus.authority ? score * corpus.authority(doc) : score });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}

/** The query's most distinctive terms — what a long, wordy question really hinges on. */
function rarestTerms(corpus: Corpus, terms: string[]): string[] {
  const scored = terms
    .map((term) => {
      const postings = corpus.postings(term);
      return { term, idf: postings ? idf(postings.docs.length, corpus.docCount) : 0 };
    })
    .filter((t) => t.idf > 0)
    .sort((a, b) => b.idf - a.idf);

  if (scored.length === 0) return [];
  const cutoff = scored[0].idf * RARE_TERM_IDF_RATIO;
  return scored
    .filter((t) => t.idf >= cutoff)
    .slice(0, MAX_RARE_TERMS)
    .map((t) => t.term);
}

/**
 * Documents whose postings contain every term — the candidate set for a phrase
 * check. Returns the WHOLE intersection: truncating here would discard by
 * document id, and the caller can only truncate meaningfully after ranking.
 */
function docsContainingAll(corpus: Corpus, terms: string[]): number[] {
  const lists: Postings[] = [];
  for (const term of terms) {
    const postings = corpus.postings(term);
    if (!postings) return []; // a term nobody has ⇒ no document has them all
    lists.push(postings);
  }
  if (lists.length === 0) return [];

  // Start from the rarest term so the working set is small from the first pass.
  lists.sort((a, b) => a.docs.length - b.docs.length);

  let candidates: number[] = [];
  for (let i = 0; i < lists[0].docs.length; i++) candidates.push(lists[0].docs[i]);

  for (let i = 1; i < lists.length && candidates.length > 0; i++) {
    const allowed = new Set<number>();
    for (let j = 0; j < lists[i].docs.length; j++) allowed.add(lists[i].docs[j]);
    candidates = candidates.filter((doc) => allowed.has(doc));
  }

  return candidates.filter((doc) => corpus.allows(doc));
}

/** Text the user explicitly quoted — a much stronger signal than the surrounding question. */
function extractQuotedPhrases(query: string): string[] {
  const phrases: string[] = [];
  const pattern = /"([^"]{4,})"|“([^”]{4,})”/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(query)) !== null) {
    phrases.push((match[1] ?? match[2]).trim());
  }
  return phrases;
}

/**
 * The tiered ladder that makes "zero results" nearly impossible when the
 * corpus actually contains a match:
 *   (i)   exact phrase, when the user quoted something;
 *   (ii)  full BM25 over every stemmed term;
 *   (iii) BM25 over only the rarest terms, when the whole query scored like
 *         filler. Rarely reached — see the note at the call site.
 * If tier (iii) has nothing either we still return tier (ii)'s weak hits: a
 * weak lead beats telling the user we found nothing.
 *
 * `containsPhrase` is supplied by the caller because only it knows how to load
 * the document text; the phrase argument arrives already normalised.
 */
export function tieredSearch(
  corpus: Corpus,
  query: string,
  limit: number,
  containsPhrase: (doc: number, normalizedPhrase: string) => boolean
): TieredSearchResult {
  const terms = uniqueTerms(query);
  if (terms.length === 0) return { tier: "none", hits: [] };

  for (const phrase of extractQuotedPhrases(query)) {
    const phraseTerms = uniqueTerms(phrase);
    if (phraseTerms.length === 0) continue;

    const candidates = docsContainingAll(corpus, phraseTerms);
    if (candidates.length === 0) continue;

    // Rank the candidates on the phrase's own terms BEFORE spending the
    // verification budget, so an overflowing intersection loses its least
    // relevant members rather than everything past the lowest doc ids.
    const candidateSet = new Set(candidates);
    const ordered = rankByBm25(
      { ...corpus, allows: (doc) => candidateSet.has(doc) },
      phraseTerms,
      PHRASE_VERIFY_CAP
    );

    // Walk the ranked window until enough documents are CONFIRMED to contain
    // the phrase — see PHRASE_VERIFY_MULTIPLE for why a confirmation count, and
    // not the window itself, is the right budget.
    //
    // Ranking the window did NOT keep the walk's cost the same. It kept the
    // DOCUMENT count the same (both spend at most PHRASE_VERIFY_CAP reads), but
    // documents are not the unit of work — book files are. MEASURED cold, one
    // query per process: the doc-id slice read 24 files in 40ms for 'a hadith
    // saying "one of you"' and 22 in 40ms for '"the people"', while the ranked
    // window scattered across 135 files/178ms and 118/178ms — ~5.5x the file
    // reads and ~4.4x the cold latency. That was bought deliberately: the cheap
    // slice returned a top 5 of nothing but early Bukhari on both, which is the
    // bug ranking exists to fix. Stopping at the first `limit` confirmations
    // would be cheaper still but would hand the final ranking to the quoted
    // fragment alone.
    const normalized = normalizeText(phrase);
    const verifyBudget = limit * PHRASE_VERIFY_MULTIPLE;
    const verified: number[] = [];
    for (const candidate of ordered) {
      if (!containsPhrase(candidate.doc, normalized)) continue;
      verified.push(candidate.doc);
      if (verified.length >= verifyBudget) break;
    }
    if (verified.length === 0) continue;

    // Final ordering uses the FULL query, not just the quoted fragment: among
    // documents that all contain the phrase, the rest of the question decides.
    const allowed = new Set(verified);
    const ranked = rankByBm25(
      { ...corpus, allows: (doc) => allowed.has(doc) },
      terms,
      limit
    );
    if (ranked.length > 0) {
      return {
        tier: "phrase",
        hits: ranked,
        phrase: { terms: phraseTerms.length, candidates: candidates.length },
      };
    }
  }

  const full = rankByBm25(corpus, terms, limit);
  if (full.length > 0 && full[0].score >= MIN_BM25_SCORE) {
    return { tier: "bm25", hits: full };
  }

  // Last resort: the whole query scored like filler. Re-rank on its rarest
  // terms alone rather than return near-nothing.
  //
  // Measured, not assumed: this stays gated behind the score floor because
  // firing it whenever the top hit misses the rarest term made results WORSE —
  // on "the person dragged to hellfire who seeks repentance", plain BM25 puts
  // the right hadith (muslim 48:55) at rank 4, and re-ranking on
  // "hellfire"/"dragged" alone pushed it out of the top 5 entirely. idf
  // weighting already does the job this tier was meant to do.
  const rare = rarestTerms(corpus, terms);
  if (rare.length > 0 && rare.length < terms.length) {
    const retry = rankByBm25(corpus, rare, limit);
    if (retry.length > 0) return { tier: "rare-terms", hits: retry };
  }

  return full.length > 0 ? { tier: "bm25", hits: full } : { tier: "none", hits: [] };
}
