// Shared tokeniser for the Ask Hiqmah retrieval layer (hadith + Quran).
//
// WHY this is a plain .mjs and not a .ts: the index builder
// (scripts/build-hadith-index.mjs) runs under bare Node, while the search
// runtime runs inside Next. BM25 only works if index-time and query-time
// tokenisation agree EXACTLY — a word that stems one way when indexed and
// another way when queried is a term that can never be matched — so both sides
// import this single file rather than keeping two copies in sync.
// tokenize.d.mts declares the types for the TypeScript side.

/**
 * Bumped whenever ANY change here alters the tokens this file produces —
 * stop words, stem rules, variant rules, MIN_TOKEN_LENGTH.
 *
 * The builder stamps this into search-index.json and hadith.ts refuses an index
 * that doesn't match. Tokenise-drift is silent and total (every posting list is
 * keyed by a term the query can no longer produce), so it must fail loudly
 * instead of degrading into "the corpus has no match".
 *
 * CHANGING THIS FILE MEANS RE-RUNNING `node scripts/build-hadith-index.mjs`.
 */
export const INDEX_VERSION = 2;

/** Tokens shorter than this are noise ("of", "ye", "70"). */
export const MIN_TOKEN_LENGTH = 3;

// ── Spelling-variant normalisation ────────────────────────────────────────
//
// MEASURED problem: the seven collections come from different translators, and
// the British/American split runs along translator lines, so a variant pair is
// two DISJOINT sets of hadith rather than one. Before this map, "neighbour"
// (45 hadith) and "neighbor" (121) were separate index terms — searching
// "rights of a neighbour" returned 12 British-spelling hadith and 0 American,
// searching "neighbor" returned the exact opposite, and the two result sets
// overlapped in zero documents. One question could only ever reach part of the
// corpus.
//
// Every rule below was checked against the real corpus vocabulary; the df
// counts in the comments are documents containing that stem today.
//
// The rules run BEFORE the suffix stripper, so they are written against the raw
// word and cover the inflections for free (honour/honoured/honouring/
// honourable all start "honour"). Applied to queries and documents alike, so
// the two sides always agree.
const VARIANT_RULES = [
  // -our → -or. Anchored on an explicit stem list: a bare /our$/ would eat
  // "our", "four", "hour", "pour", "flour", "devour".
  // Corpus splits fixed: honour 86/honor 135, favour 65/favor 133,
  // neighbour 45/neighbor 121, colour 45/color 92, odour 28/odor 8,
  // behaviour 12/behavior 25, labour 7/labor 13, armour 6/armor 31.
  [/^(neighb|hon|fav|behavi|lab|col|endeav|rum|val|arm|harb|vap|od|splend|clam|flav|parl|glam|hum)our/, "$1or"],

  // -ise → -ize, again on an explicit stem list: a bare /ise$/ would wreck
  // "wise", "rise", "praise", "promise", "exercise", "advertise" (which are
  // spelled -ise on BOTH sides of the Atlantic).
  // The [eia] lookahead keeps the -ise VERB while leaving the -is NOUN alone:
  // "criticise/criticising/criticisation" convert, "criticism" does not.
  // Corpus splits fixed: recognise 59/recognize 130, realise 23/realize 81,
  // memorise 14/memorize 64, criticise 5/criticize 49, apologise 4/apologize 9,
  // emphasise 3/emphasize 1.
  [/^(apolog|critic|emphas|memor|organ|real|recogn|summar|special|author|civil|legal|minim|maxim|normal|penal|priorit|public|rational|standard|symbol|sympath|util|visual)is(?=[eia])/, "$1iz"],

  // practise/practised/practising → practice… (practis 41 / practic 184)
  [/^practis(?=[eia])/, "practic"],

  // -ence → -ense (offenc 18/offens 7, defenc 8/defens 2, licenc 3/licens 6)
  [/^(off|def|lic|pret)ence/, "$1ense"],

  // judgement/judgements/judgemental → judgment… (129 / 235)
  [/^judgement/, "judgment"],

  // Remaining one-off translator splits, all measured in the corpus.
  [/^traveller/, "traveler"],   // 33 / 58
  [/^enquir/, "inquir"],        // 8 / 70
  [/^grey/, "gray"],            // 18 / 30
  [/^amongst$/, "among"],       // 915 / 2105
  [/^whilst$/, "while"],        // 47 / 0 — "while" is a stop word, so this
                                // demotes an archaism that was carrying idf it
                                // never earned.
];

// Words that match too many hadiths to carry signal. Three groups:
//   1. English function words + narration boilerplate that appears in nearly
//      every hadith ("narrated", "messenger", "said").
//   2. QUERY-SHAPED noise — words users type when *asking about* a text rather
//      than quoting it ("the hadith about X", "I'm looking for the narration
//      where..."). These almost never appear in the source text, so before the
//      rewrite they only inflated the keyword count and starved recall.
//   3. Reflexive pronouns. MEASURED: idf("yourself") = 4.86 beats
//      idf("brother") = 3.75, so "wanting for your brother what you want for
//      yourself" ranked four topically-unrelated hadith that merely contained
//      "yourself" above the hadith it was quoting.
//
// These are tested BOTH before and after stemming — see STOP_WORDS below.
const STOP_WORD_SEEDS = [
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "must",
  "i", "me", "my", "we", "our", "you", "your", "he", "him", "his",
  "she", "her", "it", "its", "they", "them", "their", "who", "whom",
  "what", "which", "that", "this", "these", "those",
  "in", "on", "at", "to", "for", "of", "with", "by", "from", "about",
  "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "and", "but", "or", "nor", "not", "no", "so", "if", "because",
  "as", "until", "while", "when", "where", "how", "than", "too", "very",
  "just", "also", "still", "already",
  "said", "says", "told", "asked", "went", "came", "made", "got",
  "prophet", "allah", "messenger", "narrated", "god",
  // Query-shaped noise (see note 2 above)
  "hadith", "hadeeth", "narration", "narrations", "sunnah",
  "saying", "sayings", "reported", "report", "tell", "know",
  "find", "looking", "regarding", "concerning",
  // Reflexive pronouns (see note 3 above)
  "myself", "yourself", "yourselves", "himself", "herself", "itself",
  "ourselves", "themselves", "oneself",
];

// Stop words that are only tested against the RAW word, never against a stem.
//
// "even" is the whole reason this second set exists. As a plain post-stem stop
// word it made "evening" unsearchable: the word stems to "even", the post-stem
// check then deleted it, and tokenize("evening") returned []. That silently cut
// off 287 hadith and made the app's own morning/evening adhkar content
// impossible to tell apart. Filtering it pre-stem only drops the filler adverb
// while letting "evening"/"evenings" through as the term "even" — and BM25's
// idf already suppresses common adverbs on its own, which is the entire point
// of the rewrite.
const PRE_STEM_STOP_SEEDS = ["even"];

/**
 * Light, deterministic suffix stripper — no dependency, no irregular-word
 * dictionary. It only needs to be CONSISTENT, not linguistically correct:
 * "intentions"/"intention" and "judged"/"judge" must collapse to one term.
 * Order matters (spelling variant → plural → verb ending → doubled consonant →
 * silent e).
 * @param {string} word
 * @returns {string}
 */
export function stem(word) {
  let w = word;

  // Normalise British/American spelling first, so every rule below sees one
  // spelling and the two translator camps land on one term.
  for (const [pattern, replacement] of VARIANT_RULES) {
    const next = w.replace(pattern, replacement);
    if (next !== w) {
      w = next;
      break; // the rules are mutually exclusive by construction
    }
  }

  // Plurals: bodies → body, blesses → bless, prayers → prayer.
  // "ss"/"us"/"is" endings are not plural markers (bless, virus, this).
  if (w.length > 4 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.length > 4 && w.endsWith("sses")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);

  // Verb endings: fasting → fast, judged → judg.
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);

  // Undouble the consonant those strips expose: dragged → dragg → drag.
  //
  // Deliberately UNCONDITIONAL (it also fires on base words: fall → fal), so
  // that a base word and its inflections land on the same term. Gating it on
  // "the -ing/-ed strip actually fired" looks tidier but was measured against
  // the corpus vocabulary and is a net loss: it splits 49 base/inflected pairs
  // that agree today — kill/killed/killing (558/875/218 hadith),
  // call/called (705/1230), tell/telling, sell/selling, fulfill/fulfilled —
  // and repairs zero pairs that are split today. That is the same
  // disjoint-index-terms failure the variant rules above exist to kill, so we
  // keep the "wrong" stem that stays consistent over the "right" one that
  // splits the corpus.
  if (w.length > 3 && /([bdfgklmnprt])\1$/.test(w)) w = w.slice(0, -1);

  // Silent e, so "judge" meets "judged" and "smile" meets "smiling".
  if (w.length > 4 && w.endsWith("e")) w = w.slice(0, -1);

  return w;
}

// Stop words tested both before and after stemming, so the set holds the stem
// of every seed too ("reported" → "report", "themselves" → "themselv").
export const STOP_WORDS = new Set();
for (const seed of STOP_WORD_SEEDS) {
  STOP_WORDS.add(seed);
  STOP_WORDS.add(stem(seed));
}

/** Stop words tested against the raw word ONLY — see PRE_STEM_STOP_SEEDS. */
export const PRE_STEM_STOP_WORDS = new Set(PRE_STEM_STOP_SEEDS);

/**
 * Lowercase + strip combining diacritics ("Allāh" → "allah", "Ṣaḥīḥ" →
 * "sahih"). Also used for exact-phrase matching, so it deliberately keeps
 * punctuation and spacing intact.
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Full pipeline: normalise → split on non-alphanumerics → drop stop words →
 * stem → drop stop words again. Duplicates are KEPT: callers need the raw
 * token stream to compute term frequency and document length for BM25.
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  const tokens = [];
  const words = normalizeText(text).match(/[a-z0-9]+/g);
  if (!words) return tokens;
  for (const word of words) {
    if (word.length < MIN_TOKEN_LENGTH) continue;
    if (STOP_WORDS.has(word) || PRE_STEM_STOP_WORDS.has(word)) continue;
    const stemmed = stem(word);
    // Only STOP_WORDS here: a pre-stem-only stop must not delete a real word
    // that happens to stem onto it ("evening" → "even").
    if (stemmed.length < MIN_TOKEN_LENGTH || STOP_WORDS.has(stemmed)) continue;
    tokens.push(stemmed);
  }
  return tokens;
}
