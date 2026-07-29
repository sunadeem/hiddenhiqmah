import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { tryGetSupabaseServer } from "@/lib/supabase-server";
import { MIN_BM25_SCORE, type PhraseEvidence, type SearchTier } from "@/lib/search/bm25";
import { searchHadiths } from "@/lib/search/hadith";
import { getQuranVerse, searchQuran } from "@/lib/search/quran";

// Give the streamed Opus answer room to finish before the platform function
// timeout. Native buffers the whole SSE response, so a mid-answer timeout there
// otherwise surfaces as a total failure with zero content.
export const maxDuration = 60;

// maxRetries bumped from the SDK default of 2 → 4 so brief Anthropic 529
// (overloaded) spikes are absorbed with exponential backoff instead of
// surfacing as a user-facing failure.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_SECRET,
  maxRetries: 4,
});

// Hybrid model routing. The search rounds (pick keywords, run the tools, judge
// relevance) are mechanical + latency-heavy → run them on the fast/cheap model.
// The user-facing answer is credibility-critical → write it on the top model.
// Both verified live on the Anthropic Models API; undated aliases track the
// latest snapshot. Flip either constant to re-tier without touching the loop.
const SEARCH_MODEL = "claude-haiku-4-5";
const ANSWER_MODEL = "claude-opus-4-8";

// Search refinement is ADAPTIVE, not a fixed count. Every extra round is another
// blocking model round-trip the user waits through before a single answer token
// streams, so we only pay for one when the first wave genuinely came up short:
//
//   strong first wave → 0 refinement rounds (the fast path)
//   weak/empty wave   → 1 refinement round, so the model retries with different
//                       keywords BY ITSELF — the user never has to ask it to.
//
// "Strong" is judged from the retrieval layer's own signals (tier + BM25 score),
// not from the model's opinion of its own results — see isStrongHit().
const MAX_REFINEMENT_ROUNDS = 1;

// BM25 score at which a wave is solid enough to stop searching.
//
// MEASURED against the real corpus, and the ranges OVERLAP HEAVILY — this
// threshold is not a separator and must not be described as one. On the two
// independent gold sets (whose answers are known to be in the corpus) the top
// hadith cleared 12 on 27 of 28 and 22 of 24. On 20 queries the corpus cannot
// answer — absent topics, invented narrations, gibberish, contentless filler —
// it still cleared 12 on 8, topping out at 18.24 on an invented narration ("the
// prophet said the earth orbits the sun once every seven days"), which is
// higher than 3 of the 52 genuinely answerable questions scored.
//
// So state what 12 buys, and nothing more: it RARELY costs an answerable
// question its fast path (27/28 and 22/24), while the flatly-empty queries fall
// far below it — gibberish and contentless one-liners 0.00, "hello there how
// are you" 3.51, "tell me something" 5.70. It does NOT keep noise
// out. The three answerable questions that DO escalate are near-misses rather
// than failures: 11.53 on "…ordered to fight people until they say…" (whose
// gold hadith is at rank 1), and 9.55 / 9.06 on two one-or-two-term queries.
//
// It is a floor on lexical evidence, not a verdict on relevance: only the model
// can tell whether the top hit answers the question, which is why the escalated
// round hands it the results and lets it search again itself. bm25.ts's own
// floor of 3 is far too low to be useful here — noise clears it easily.
//
// Note the collection-authority prior (hadith.ts) scales every hadith score by
// up to 1.05, so it nudges this gate looser: on the same noise set, queries
// clearing 12 went 6/20 → 8/20. The answerable side did not change (27/28,
// 22/24 both before and after), so the gate was left at 12.
const STRONG_HIT_SCORE = 12;

// The same bar for the Quran, which needs its own number because BM25 scores
// are corpus-relative and these two corpora are not the same size. 6,236 verses
// vs 35,089 hadiths caps idf at 8.3 instead of 10.06, and verses are shorter, so
// the whole Quran score distribution sits lower. MEASURED: on 30 questions both
// tools were asked, the hadith side cleared 12 on 24 and the Quran side on 4 —
// and on 20 "what does the Quran say about X" questions the top verse scored
// 0.00–9.95, so NOT ONE was judged strong. A Quran-only wave therefore escalated
// every single time: a guaranteed extra model round-trip, which is exactly the
// latency this rewrite exists to buy back.
//
// Calibrated at 8 on the same two samples: 19/30 of the answerable shared
// questions now take the fast path (vs 4/30 at 12), while the absent-topic set
// tops out at 10.84 and still escalates on 13/20. Same caveat as above — the
// ranges overlap; this only stops the guaranteed-wasted round.
const STRONG_QURAN_SCORE = 8;

// A verified quoted phrase is only decisive when the quote was SUBSTANTIVE.
// Both the tool descriptions and the system prompt now tell the search model to
// quote the user's wording, so filler quotes are a designed-for case: MEASURED,
// "one of you" (score 2.60), "the best of you" (7.05) and "the people" (3.48)
// all verified as exact phrases and all counted as strong, permanently
// suppressing the one refinement round.
//
// Two gates, both drawn from the same measurement. On 8 genuine quotes the
// phrase contributed 2–5 non-stop terms and its term-intersection covered 1–24
// documents; on 12 filler quotes it contributed 1–2 terms over 151–8,634
// documents. Requiring ≥2 terms AND ≤100 candidate documents separates the two
// sets completely, with the genuine side's worst case (24) four times inside
// the bar.
const MIN_PHRASE_TERMS = 2;
const MAX_PHRASE_CANDIDATES = 100;

// Retrieval lives in @/lib/search — BM25 over a prebuilt inverted index
// (scripts/build-hadith-index.mjs), so a tool call touches one index file plus
// the handful of book files that won, instead of re-parsing all 51MB of hadith
// on every call the way the old keyword scan did.

// How many candidates each search tool returns. Deliberately generous: the
// answer pass is instructed to discard irrelevant hits, so recall at this
// layer matters more than precision, and a real match pushed off a 5-row list
// is a match the model can never cite.
const DEFAULT_SEARCH_RESULTS = 12;
const MAX_SEARCH_RESULTS = 15;

// ── CORS helpers (mobile app at hiqmah://, capacitor:// hits this from a
// different origin) ──────────────────────────────────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Anon-Id",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

type QuotaState = {
  used: number;
  limit: number;
  resetAt: string | null;
  hasBonus: boolean;
};

function getRequestIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

// ── Citation type ─────────────────────────────────────────────────────────

interface Citation {
  type: "hadith" | "quran";
  source: string;
  reference: string;
  arabic?: string;
  english: string;
  href: string;
}

// ── Tool definitions ──────────────────────────────────────────────────────

const TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: "search_hadith",
    description:
      "Search the hadith collections on this website (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Ahmad). Natural language works — the search is rarity-weighted and stems words, so you do not have to guess exact wording.\n\nWHEN HUNTING A SPECIFIC NARRATION (the user quotes it, paraphrases it from memory, or asks \"is there a hadith about X\"), CALL THIS TOOL SEVERAL TIMES IN THE SAME TURN with genuinely different angles instead of making one guess. Parallel calls all run at once, so three searches cost the same wait as one. Good angles: (a) the distinctive/rare content words that would appear in the text itself, (b) a reworded paraphrase in the vocabulary an English translation actually uses, (c) the user's quoted text in \"double quotes\" for an exact-phrase match. Vary them — three near-identical queries are one search, not three.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "What you're looking for, in the user's own words or as distinctive keywords — both work. The search is rarity-weighted and stems words, so 'the person dragged to hellfire who seeks repentance' and 'hellfire repentance' both find it, and 'intention' matches 'intentions'. Wrap text in \"double quotes\" to require an exact phrase. Prefer words that would appear in the hadith itself over words describing your question.",
        },
        collection: {
          type: "string",
          enum: ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "ahmad"],
          description: "Optional: limit search to a specific collection.",
        },
        max_results: {
          type: "number",
          description: "Maximum results (default 12, max 15).",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "search_quran",
    description:
      "Search all 114 surahs of the Quran by the English translation. Natural language works. As with search_hadith, when hunting a specific verse issue SEVERAL calls in the SAME turn from different angles (distinctive words, a reworded paraphrase, the quoted text in \"double quotes\") rather than one guess — they run in parallel, so the extra angles are free.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "What you're looking for, in the user's own words or as distinctive keywords — both work. Matching is rarity-weighted and stems words, so partial matches still rank. Wrap text in \"double quotes\" to require an exact phrase from the translation.",
        },
        surah_id: {
          type: "number",
          description: "Optional: limit to a specific surah (1-114).",
        },
        max_results: {
          type: "number",
          description: "Maximum results (default 12, max 15).",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_quran_verse",
    description:
      "Look up a specific Quran verse by surah and ayah number. Returns Arabic, English, and transliteration.",
    input_schema: {
      type: "object" as const,
      properties: {
        surah_id: { type: "number", description: "Surah number (1-114)." },
        ayah: { type: "number", description: "Ayah/verse number." },
      },
      required: ["surah_id", "ayah"],
    },
  },
];

// ── System prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are "Hiqmah", the AI assistant for Hidden Hiqmah — an Islamic educational app. You help people learn about Islam from authentic sources. You follow mainstream Sunni scholarship; your sources are the Quran, the major Sunni hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Ahmad), and classical tafsir. You are warm, respectful, and honest.

GROUNDING — your most important rule:
- Base every specific claim about what the Quran or a hadith says on a VERIFIED source. Use the search tools to find and confirm the text before you quote or reference it.
- NEVER invent, guess, or approximate a hadith number, a surah:ayah reference, or a quotation. If you cannot verify a specific narration or verse with the tools, do not present one — say plainly that you couldn't verify a specific text on this, then give general, clearly-framed guidance. But searching harder comes FIRST: "I couldn't find it" is only honest after you have actually searched from several different angles, never after one guess.
- You may explain and teach conversationally, but keep a clear line: quoted scripture and specific rulings must be backed by a cited source; broader educational context should be presented as general understanding, not dressed up as a citation.

FAITHFUL INTERPRETATION — never cherry-pick or mislead:
- When you explain or interpret a verse or hadith, convey its meaning in its FULL context — the surrounding passage, the occasion of revelation (asbāb al-nuzūl) when known, and the mainstream scholarly understanding. Do not let a quotation stand alone if its plain reading would mislead without that context.
- Do NOT pull a fragment out of context to support a conclusion the full text does not support, and do NOT present a fringe or out-of-context reading as the plain meaning. If a text is commonly misunderstood, briefly give the correct contextual understanding.
- If the meaning is genuinely disputed among scholars, say so and present the main positions rather than asserting one as definitive.

RULINGS (fiqh) — answer with sources, flag the gray areas:
- You may answer practical/ruling questions ("is X permissible?") with the authentic, sourced position.
- When the matter is contested, differs across the madhhabs, is a gray area, or depends on the person's specific circumstances: say so explicitly, present the main view(s), and recommend consulting a qualified local scholar for their situation. Never flatten a real difference of opinion into a single over-confident ruling.
- You are an educational aid, not a mufti — for personal, complex, or sensitive matters, point the user to a qualified scholar.

SEARCH TOOLS:
You have access to the app's Quran and hadith databases. Use these tools to verify and cite content — they are how you ground your answers.

search_hadith — Search the hadith collections. Natural language works; so do distinctive keywords.
search_quran — Search all 114 surahs by the English translation.
get_quran_verse — Look up a specific verse by surah:ayah.

FINDING A SPECIFIC NARRATION — SEARCH WIDE ON THE FIRST TURN:
When someone is hunting a particular hadith or verse — they quote it, paraphrase it from memory, or ask "is there a hadith about X" — do NOT make one keyword guess. Issue SEVERAL search calls IN THE SAME TURN, each from a genuinely different angle. Parallel calls all run at once, so three searches cost the same wait as one, and one round of three angles beats three rounds of one.
1. DISTINCTIVE WORDS — the rare, specific words that would appear in the text itself ("hellfire repentance", "ruqyah evil eye"), not the common ones ("man", "day", "good").
2. A REWORDED PARAPHRASE in the vocabulary an English translation actually uses. The user's wording is rarely the translator's: "actions are judged by intentions" is narrated as "the reward of deeds depends upon the intentions". Search both.
3. THE QUOTE ITSELF, if they gave one — in "double quotes" for an exact-phrase match, plus an unquoted version in case their memory is off by a word.
Add a search_quran call too whenever the idea could be Quranic. Make the angles genuinely different — three near-identical queries are one search, not three.

RULES FOR TOOL RESULTS:
1. Critically evaluate every search result. Does this hadith/verse ACTUALLY discuss what the user is asking about? Keyword matches are not relevance.
2. DISCARD results that are not semantically relevant. If a user asks about "the person dragged to hellfire who seeks repentance" and the search returns a hadith about travel — that is NOT relevant; do not cite it.
3. When you DO find a relevant result, reference it using this exact format in your text: [[cite:N]] where N is the 1-based index of the result from the tool call. For example: "The Prophet ﷺ said... [[cite:1]]". Only results you mark with [[cite:N]] are shown as source cards.
4. If a wave of searches misses, SEARCH AGAIN YOURSELF, immediately — new angles, new vocabulary, different distinctive words. Never narrate that you are searching, never ask permission to search again, and never end a turn with an offer to look ("Do you want me to search again?", "Shall I look further?", "Let me know if you'd like me to check"). You have the tools; trying harder is your job, not a decision to hand back to the user.
5. Do not tell the user to go and verify a narration themselves while you still have angles left to try. Only once you have genuinely searched from several different angles and still found nothing may you say you couldn't verify a specific text in our collections — then give general guidance framed as such, without quoting a verse/hadith or citing a reference you haven't verified.

Always aim to be genuinely helpful — a grounded, honest answer that says "I couldn't verify a specific narration" is far better than a confident answer built on a fabricated or out-of-context source. But it is only the right answer after a real, multi-angle search.

LENGTH & TONE — short and conversational:
Answer like a knowledgeable friend in a chat, not an essay. Lead with the direct answer in your first sentence or two, in warm plain language. Keep it SHORT — usually 1–3 short paragraphs. No preamble, no restating the question, no filler.
When a topic has real depth you couldn't fully cover (different scholarly views, a longer story, extra detail, the specific narrations), DON'T dump it all — give the essential answer, then end with ONE brief, natural follow-up offer inviting the user to go deeper, tailored to what you held back — e.g. "Want me to go into the different scholarly views?", "Would you like the full story?", or "I can share the specific hadith if that helps." If the question is simple and fully answered, just answer and stop — no forced follow-up.
A short, grounded, conversational answer that invites a follow-up beats a long one. Stay accurate and never mislead by omission — but trust the follow-up to carry the depth.

FORMATTING:
Write plain text. You may use **bold** for emphasis and line breaks for structure. No headers, lists, or code blocks.

At the END of your response, include relevant page links using this format (one per line):
[[link:Label Text|/path/to/page]]

WEBSITE DEEP LINKING:
HADITH: /hadith/{collection}/{bookId}?h={hadithId}
  Take BOTH numbers straight off the result line, never from memory. A result reads "[Result 3] bukhari 15:33 (book 15)" or "[Result 7] ahmad Musnad Ahmad 991 (book 5)": {collection} is the first word, {bookId} is the number in "(book N)", and {hadithId} is the number the reference ENDS with. So those two become /hadith/bukhari/15?h=33 and /hadith/ahmad/5?h=991. Musnad Ahmad references carry no book in the reference text itself — the "(book N)" is the only place it appears, so a link built by splitting the reference alone will 404.
QURAN: /quran/{surah_number}
PROPHETS: /prophets/{slug} (also the righteous figures whose prophethood scholars debated: /prophets/maryam, /prophets/khidr, /prophets/dhul-qarnayn, /prophets/luqman; the landing section is /prophets?tab=about&sub=figures)
PROPHET MUHAMMAD: /prophet-muhammad?tab=timeline|character|his-person|family|prophecies|worship-sunnah (prophecies incl. his miracles → /miracles; family incl. household = ahl al-bayt + women-companions beyond the wives; worship-sunnah incl. sending salawat upon him)
TAWHID: /tawhid?tab=intro|importance|categories|shirk|names (intro incl. the virtue of La ilaha illallah = the bitaqah/card hadith + the daily 100x tahleel, and the Prophet's advice to Ibn Abbas; shirk = major/minor/hidden shirk with modern practices = amulets/charms, fortune-tellers/horoscopes, swearing by other than Allah, riya/showing off, plus permissible-vs-forbidden tawassul; categories = Rububiyyah/Uluhiyyah incl. worship of the heart = love/fear/hope/tawakkul/Asma-wa-Sifat; names = 99 Names of Allah + what 'enumerating' them means)
ARTICLES OF FAITH: /articles-of-faith?tab=intro|importance|articles|living (intro incl. Ihsan/muraqabah — the third level; articles = the six ?sub=allah|angels|books|messengers|last-day|qadr; belief-in-Allah incl. dealing with doubts/waswas → links /protection?tab=waswas; angels incl. scribes/guardians in daily life; qadr incl. does dua change the decree; living = iman rises & falls, branches & sweetness of faith, signs of hypocrisy)
PILLARS: /pillars?tab=pillars
SALAH: /salah?tab=prayers|voluntary|wudu (wudu = purification incl. ghusl: ?tab=wudu&sub=ghusl; jumu'ah: ?tab=prayers&sub=jumuah)
PRAYER TIMES: /prayer-times
QIBLAH: /qiblah (live compass to the Ka'bah; why we face the Ka'bah + do Muslims worship it, the day the qiblah changed = Bara's narration + Quba turning mid-prayer + Masjid al-Qiblatayn, mistakes & tolerances = jihat al-Ka'bah, praying in a car/plane/train/on a mount, finding the qiblah without a phone = sun/shadow/Pole Star/mosque, qiblah beyond salah = du'a/burial/toilet etiquette)
DUAS: /duas?tab={category}
RAMADAN: /ramadan?tab=fasting|worship|last-ten (fasting incl. when-it-begins moon sighting, common-questions FAQ, ramadan-with-kids; worship = tarawih/night prayer, quran habit, generosity/feeding, du'a; last-ten incl. after-ramadan = six of Shawwal)
BARZAKH: /barzakh?tab=what-happens|protection|helping-dead (what-happens incl. where-souls-go = martyrs as green birds + prophets alive in graves + 'Illiyyin/Sijjin, the Prophet's dream of the Barzakh, and Common Questions = cremation/unburied, body-or-soul, do the dead hear us, how the Barzakh ends; helping-dead = du'a + charity that reach the deceased)
DAY OF JUDGEMENT: /day-of-judgement?tab=signs|events|salvation|preparing (signs incl. dajjal/antichrist + protection; events incl. reckoning, settling-scores = qisas/huquq/bankrupt muflis, final-separation = death slaughtered; preparing = practical deeds, salawat, refuge du'a)
JANNAH: /jannah?tab=descriptions|how-to
PROTECTION & RUQYAH: /protection?tab=sihr|evil-eye|ruqyah|daily|waswas (sihr/magic, evil eye, self-ruqyah how-to, daily protection adhkar, waswas = intrusive whispers / doubts / distraction in prayer — reassurance that these are excused)
MARRIAGE: /marriage?tab=before|wedding|husband-rights|wife-rights|married-life|divorce (married-life = intimacy, menses, family planning)
FAMILY: /family?tab=children|parents|elders|kinship (kinship = silat al-rahim)
DEATH & JANAZAH: /death-rites?tab=preparing|dying|types-of-death|washing-janazah|burial|grief-visiting (types-of-death = martyrdom/shaheed categories, dying in childbirth/plague, husn al-khatimah)
INHERITANCE: /inheritance?tab=foundations|shares|heirs|wasiyyah-faqs
MIRACLES: /miracles?tab={category}
ISLAMIC CALENDAR: /islamic-calendar?tab=months|sacred|moon|dates|converter (moon = how a lunar month begins, hilal crescent sighting vs calculation, local vs global, why communities differ on Ramadan/Eid; dates incl. weekly/monthly recurring sunnah fasts = Monday/Thursday, white days ayyam al-bid, Friday jumu'ah, plus Dhul Hijjah for non-pilgrims = takbir, fasting nine days, no hair/nails for the one sacrificing; converter = Gregorian↔Hijri both directions + upcoming Ramadan/Eid dates)
WHY ISLAM: /why-islam?tab=start|proofs|worldviews|questions
SECTS: /sects?tab=sunni|shia|other|modern (sunni incl. aqeedah, four fiqh schools + 'do I have to follow a madhhab', hadith sciences, companions, sunnah-bidah = what innovation is, jamaah = holding to the main body; shia incl. origins, beliefs, practices, branches = Zaidi/Ismaili/Alawite/Druze, the sunni position; other = khawarij, ibadiyyah, qadariyyah-murjiah, mutazilah, sufism, asharis-maturidis, quranists = hadith rejection, ahmadiyyah, nation-of-islam; modern = salafiyyah/wahhabi label, deobandi-barelwi, tablighi, political-movements = ikhwan/hizb ut-tahrir, sufi-orders, warning-signs = cult checklist; importance tab covers takfir danger)
ZAKAT: /zakat?tab=overview|who-pays|assets|recipients|fitr|calculator (nisab, zakatable assets, eight recipients, zakat al-fitr, calculator tool)
HAJJ & UMRAH: /hajj?tab=overview|ihram|umrah|days|rulings (ihram/miqat/talbiyah, umrah step-by-step, days of hajj 8th-13th, types of hajj, proxy hajj)
TAWBAH: /tawbah?tab=door|conditions|istighfar|returning|fruits (repentance, Sayyid al-Istighfar, relapse, man who killed 99)
HALAL LIVING: /halal-living?tab=principles|food|money|dress|work (halal food, alcohol, riba/finance, modest dress, work & entertainment)
WOMEN IN ISLAM: /women?tab=status|worship|hijab|questions (women's status, menstruation/istihada fiqh, mosque access, hijab, common questions)
CHARACTER: /character?tab=why|virtues|diseases|purification (akhlaq, sincerity, patience, envy, backbiting, arrogance, purifying the heart)
OTHER: /hadith, /resources, /learn-arabic`;

// Cache the (large, static) system prompt + tools prefix. It's identical across
// the 2-4 calls in a single request AND across requests, so caching it cuts
// prefill latency and cost dramatically (cache reads ~0.1x). cache_control on
// the system block also covers the tools, which render before system.
const SYSTEM_BLOCKS: Anthropic.Messages.TextBlockParam[] = [
  { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
];

// ── Progress status ───────────────────────────────────────────────────────
//
// Every status we emit describes work that is ACTUALLY happening right now,
// named from the tool inputs. Deliberately no percentage: the slow part is the
// model call, where real progress is unknowable, and a fake bar that stalls at
// 80% erodes trust faster than an honest sentence.

// Short labels for status text — "Searching Bukhari & Muslim…" reads better than
// the full "Sahih al-Bukhari" names used on the source cards.
const COLLECTION_LABELS: Record<string, string> = {
  bukhari: "Bukhari",
  muslim: "Muslim",
  abudawud: "Abu Dawud",
  tirmidhi: "Tirmidhi",
  nasai: "Nasa'i",
  ibnmajah: "Ibn Majah",
  ahmad: "Ahmad",
};

// Shown while the fast model reads the question and decides which angles to
// search — the one stretch where nothing is being searched yet. Without it the
// client's own hardcoded "Thinking..." placeholder sits there for the whole
// first model call, which is both generic and the least informative moment.
const PLANNING_STATUS = "Working out what to search for…";

const ESCALATION_STATUS = "No strong match yet — searching more deeply…";

// Handed to the search model alongside the weak wave's results. Without it the
// escalation round is only an opportunity to search again — the model can just
// as easily read its own thin results and start writing. This states the
// retrieval verdict as fact (the model can't see BM25 scores) and spends the
// round we already paid for.
const ESCALATION_INSTRUCTION =
  "[RETRIEVAL] None of those results scored as a confident match, so this question is not answered yet. Do NOT write an answer in this turn and do NOT ask the user anything. Search again RIGHT NOW — several calls in this same turn, each from a genuinely different angle: different distinctive words that would appear in the text itself, a paraphrase in the vocabulary an English translation actually uses, and the user's quoted wording in \"double quotes\" if they gave one. Repeating the previous keywords is wasted effort; change them.";

// "&" reads tightly for a list of names ("Bukhari & Muslim"); "and" reads better
// when the items are phrases ("the hadith collections and the Quran").
function joinList(items: string[], conjunction = "&"): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items[items.length - 1]}`;
}

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/** Name what this wave of tool calls is actually about to search. */
function describeSearchWave(blocks: Anthropic.Messages.ToolUseBlock[]): string {
  const collections = new Set<string>();
  let wholeCorpus = false;
  let quran = false;
  const verseLookups: string[] = [];

  for (const block of blocks) {
    if (block.name === "search_hadith") {
      const { collection } = block.input as { collection?: string };
      const label = collection ? COLLECTION_LABELS[collection] : undefined;
      // No collection — or one searchHadiths won't recognise — means the whole
      // corpus is searched, so say that rather than name a filter that isn't
      // being applied.
      if (label) collections.add(label);
      else wholeCorpus = true;
    } else if (block.name === "search_quran") {
      quran = true;
    } else if (block.name === "get_quran_verse") {
      const { surah_id, ayah } = block.input as { surah_id?: number; ayah?: number };
      verseLookups.push(`${surah_id}:${ayah}`);
    }
  }

  const targets: string[] = [];
  if (wholeCorpus) targets.push("the hadith collections");
  else if (collections.size > 0) targets.push(joinList([...collections]));
  if (quran) targets.push("the Quran");

  if (targets.length > 0) return `Searching ${joinList(targets, "and")}…`;
  if (verseLookups.length > 0) return `Looking up Quran ${joinList(verseLookups)}…`;
  return "Searching…";
}

/** Report the real number of sources the answer pass is about to read. */
function describeSources(hadiths: number, verses: number): string {
  const parts: string[] = [];
  if (hadiths > 0) parts.push(pluralize(hadiths, "narration"));
  if (verses > 0) parts.push(pluralize(verses, "verse"));
  // Nothing was found — don't claim to be reading sources that don't exist.
  if (parts.length === 0) return "Writing your answer…";
  return `Reading ${joinList(parts, "and")}…`;
}

// ── Tool execution helper ─────────────────────────────────────────────────

/**
 * Is this result good enough to stop searching? Judged from the retrieval
 * layer's signals rather than the model's opinion of its own keywords:
 *
 *   - the "rare-terms" fallback tier never counts — reaching it means normal
 *     ranking already came up short;
 *   - a verified quoted phrase is a BONUS route to "strong": a substantive
 *     quote (see MIN_PHRASE_TERMS / MAX_PHRASE_CANDIDATES) that clears the
 *     ordinary floor counts even when its score sits under `threshold`,
 *     because "we found the exact words you quoted, in four documents" is
 *     evidence the score alone doesn't carry;
 *   - everything else — INCLUDING a phrase hit whose quote was filler — has to
 *     clear `threshold`, which is per-corpus.
 *
 * The phrase check must NOT be an exclusive override. It used to return the
 * phrase verdict and never fall through to the score, which inverted quoting:
 * MEASURED over 10 realistic questions containing ONE quoted distinctive term
 * ("is \"ruqyah\" allowed in islam" 17.39, "is \"witr\" prayer obligatory"
 * 17.63, "when is \"tayammum\" allowed instead of wudu" 15.18 …), 8 of 10 came
 * back WEAK while the byte-identical unquoted question at the SAME score came
 * back STRONG — so quoting, which the prompt explicitly asks the model to do,
 * bought a wasted escalation round. As a bonus instead of a replacement those
 * 8 inversions go to 0, the 8 genuine multi-term verbatim quotes stay 8/8
 * decisive, and the 6 filler quotes ("one of you" 2.60, "the people" 3.48,
 * "the best of you" 7.05) stay 0/6 — they fail both routes, as intended.
 */
function isStrongHit(
  top: { score: number; tier: SearchTier; phrase?: PhraseEvidence } | undefined,
  threshold: number
): boolean {
  if (!top) return false;
  if (top.tier === "rare-terms") return false;
  const { phrase } = top;
  const decisiveQuote =
    !!phrase &&
    phrase.terms >= MIN_PHRASE_TERMS &&
    phrase.candidates <= MAX_PHRASE_CANDIDATES &&
    top.score >= MIN_BM25_SCORE;
  return decisiveQuote || top.score >= threshold;
}

// Tell the model HOW the results were found. "rare-terms" means the ordinary
// ranking came up short and we fell back to matching only the query's most
// distinctive words, so the hits are looser and need harder filtering.
function tierNote(tier: SearchTier): string {
  if (tier === "phrase") return " matching your quoted phrase exactly";
  if (tier === "rare-terms") return " from a broadened search (matched on the most distinctive words only, so relevance varies)";
  return "";
}

/**
 * Run one tool call.
 *
 * `strong` reports whether the retrieval layer found something solid enough
 * that the search phase can stop — it is what decides between the fast path and
 * one automatic refinement round.
 *
 * `result` and `digest` exist because the two texts have DIFFERENT AUDIENCES,
 * and conflating them leaked search instructions into the answer. `result` goes
 * back as the tool_result, read only by the search model, so it can carry
 * imperatives ("search again yourself, right now"). `digest` is what gets
 * replayed to the ANSWER model under "Here are search results from the app's
 * database", where an instruction aimed at a model that has no tools is at best
 * confusing and at worst something it repeats to the user. They are the same
 * string whenever the tool actually found something.
 */
function executeTool(
  block: Anthropic.Messages.ToolUseBlock,
  counter: { value: number }
): { result: string; digest: string; citations: Citation[]; strong: boolean } {
  const citations: Citation[] = [];

  if (block.name === "search_hadith") {
    const input = block.input as { query: string; collection?: string; max_results?: number };
    const results = searchHadiths(
      input.query,
      input.collection,
      Math.min(input.max_results || DEFAULT_SEARCH_RESULTS, MAX_SEARCH_RESULTS)
    );
    if (results.length > 0) {
      // Number each result so Claude can reference them with [[cite:N]]
      const numbered = results.map((h) => {
        counter.value++;
        citations.push({
          type: "hadith",
          source: h.collectionName,
          reference: h.reference,
          english: h.english,
          // Built from the STRUCTURED fields, never by re-parsing `reference`.
          // Its shape is collection-dependent — Musnad Ahmad reads "Musnad
          // Ahmad 65" where the rest read "13:27" — so splitting it produced
          // /hadith/ahmad/Musnad?h=undefined for all 1,285 Ahmad entries, a
          // hard 404 in the static export and in the shipped iOS app.
          href: `/hadith/${h.collection}/${h.bookId}?h=${h.hadithId}`,
        });
        // "(book N)" is here for the LINKS THE MODEL WRITES IN PROSE, not for
        // the citation cards — those get `href` above, built from the
        // structured fields. The reference string alone is not enough to
        // construct /hadith/{collection}/{book}?h=…: six collections spell it
        // "<book>:<n>", but all 1,285 Musnad Ahmad entries read "Musnad Ahmad
        // 991" with the book (1–7) nowhere in the string, so the model was
        // guessing it. The trailing number IS the ?h= anchor for all 35,089
        // entries (verified against the corpus), so reference + this suffix are
        // together sufficient. See WEBSITE DEEP LINKING in the system prompt.
        return `[Result ${counter.value}] ${h.reference} (book ${h.bookId})\n${h.english}`;
      });
      const found = `Found ${results.length} results${tierNote(results[0].tier)}. IMPORTANT: Read each result carefully. Only cite results that are actually relevant to the user's question using [[cite:N]] format.\n\n${numbered.join("\n\n")}`;
      return {
        result: found,
        digest: found,
        citations,
        strong: isStrongHit(results[0], STRONG_HIT_SCORE),
      };
    }
    return {
      result:
        "No matching hadiths found. Search again yourself, right now, with different distinctive words, a reworded paraphrase, or a \"quoted phrase\" — several angles in one turn. Never ask the user for permission to search again.",
      digest: `No matching hadiths found for "${input.query}".`,
      citations,
      strong: false,
    };
  }

  if (block.name === "search_quran") {
    const input = block.input as { query: string; surah_id?: number; max_results?: number };
    const results = searchQuran(
      input.query,
      input.surah_id,
      Math.min(input.max_results || DEFAULT_SEARCH_RESULTS, MAX_SEARCH_RESULTS)
    );
    if (results.length > 0) {
      const numbered = results.map((v) => {
        counter.value++;
        citations.push({
          type: "quran",
          source: v.surah,
          reference: v.key,
          arabic: v.arabic,
          english: v.english,
          href: `/quran/${v.surahId}?v=${v.verse}`,
        });
        return `[Result ${counter.value}] ${v.key}\n${v.english}`;
      });
      const found = `Found ${results.length} verses${tierNote(results[0].tier)}. IMPORTANT: Only cite verses actually relevant to the question using [[cite:N]] format.\n\n${numbered.join("\n\n")}`;
      return {
        result: found,
        digest: found,
        citations,
        // The Quran's own bar — see STRONG_QURAN_SCORE.
        strong: isStrongHit(results[0], STRONG_QURAN_SCORE),
      };
    }
    return {
      result:
        "No matching verses found. Search again yourself, right now, with different distinctive words or a reworded paraphrase — several angles in one turn. Never ask the user for permission to search again.",
      digest: `No matching verses found for "${input.query}".`,
      citations,
      strong: false,
    };
  }

  if (block.name === "get_quran_verse") {
    const input = block.input as { surah_id: number; ayah: number };
    const result = getQuranVerse(input.surah_id, input.ayah);
    if (result) {
      counter.value++;
      citations.push({
        type: "quran",
        source: result.surah,
        reference: result.key,
        arabic: result.arabic,
        english: result.english,
        href: `/quran/${result.surahId}?v=${result.verse}`,
      });
      const found = `[Result ${counter.value}] ${result.key}\nArabic: ${result.arabic}\nEnglish: ${result.english}\nTransliteration: ${result.transliteration || "N/A"}`;
      return {
        result: found,
        digest: found,
        citations,
        // An exact reference lookup that resolved is as certain as retrieval gets.
        strong: true,
      };
    }
    const missing = `Verse ${input.surah_id}:${input.ayah} not found.`;
    return { result: missing, digest: missing, citations, strong: false };
  }

  return { result: "Unknown tool", digest: "Unknown tool", citations: [], strong: false };
}

// ── SSE streaming API handler ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let parsedMessages: { role: string; content: string }[];
  try {
    const body = await req.json();
    parsedMessages = body.messages;
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (!parsedMessages || !Array.isArray(parsedMessages) || parsedMessages.length === 0) {
    return NextResponse.json(
      { error: "Messages required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // ── Identify caller + enforce quota ──────────────────────────────────
  // Either authenticated (Bearer JWT) or anonymous (x-anon-id header).
  // If Supabase env vars aren't set, we silently skip the quota system
  // (graceful local-dev mode).
  const supabaseSrv = tryGetSupabaseServer();
  const authHeader = req.headers.get("authorization");
  const anonIdHeader = req.headers.get("x-anon-id");
  const ipHash = sha256(getRequestIp(req));

  let userId: string | null = null;
  let anonId: string | null = null;

  if (supabaseSrv) {
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data, error } = await supabaseSrv.auth.getUser(token);
      if (!error && data.user) {
        userId = data.user.id;
      }
    }

    if (!userId && anonIdHeader) {
      anonId = anonIdHeader.slice(0, 64); // sanity cap on length
    }

    // Enforce quota
    try {
      const { data: quotaData } = await supabaseSrv.rpc("get_quota_for_today", {
        p_user_id: userId,
        p_anon_id: anonId,
      });
      const quota = quotaData as QuotaState | null;
      if (quota && quota.used >= quota.limit) {
        return NextResponse.json(
          { error: "quota_exceeded", quota },
          { status: 429, headers: CORS_HEADERS }
        );
      }
    } catch (e) {
      // Quota check failures shouldn't break the chat — log and proceed.
      console.error("[Ask Hiqmah] Quota check failed:", e);
    }
  }

  const apiMessages = parsedMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Request-scoped citation counter
        const citationCounter = { value: 0 };

        // Request-scoped token accounting — summed across every model call in
        // this request so we can log real per-message cost to chat_usage.
        const usageTotals = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

        const allCitations: Citation[] = [];
        const allSearchResults: string[] = [];

        // ── Live token streaming ────────────────────────────────────────────
        // Stream the answer to the client token-by-token. We accumulate the raw
        // model text across calls, and emit only the marker-free incremental
        // text as `delta` events — holding back any in-progress [[cite:N]] /
        // [[link:..]] marker so the user never sees them. BOTH clients now read
        // these live: web via a streaming fetch body, native via XHR progress
        // events (see streamChatNative in packages/ui/components/AskHiqmah.tsx).
        let raw = "";
        let emittedLen = 0;
        const cleanForStream = (s: string): string => {
          let c = s.replace(/\[\[(?:cite:\d+|link:[^\]]*)\]\]/g, "");
          const open = c.lastIndexOf("[[");
          if (open !== -1 && c.indexOf("]]", open) === -1) c = c.slice(0, open);
          return c;
        };
        const flushDeltas = () => {
          const clean = cleanForStream(raw);
          if (clean.length > emittedLen) {
            send("delta", { text: clean.slice(emittedLen) });
            emittedLen = clean.length;
          }
        };
        // Non-streaming SEARCH pass on the fast/cheap model: it picks the search
        // angles and issues the tool calls. Any prose it produces is discarded.
        // On the fast path it never sees the tool RESULTS, so judging relevance
        // stays the answer model's job (the system prompt's "RULES FOR TOOL
        // RESULTS" is what enforces it). It only sees results when the first
        // wave came up weak and we call it a second time to refine.
        const gather = async (
          msgs: Anthropic.Messages.MessageParam[]
        ): Promise<Anthropic.Messages.Message> => {
          const r = await client.messages.create({
            model: SEARCH_MODEL,
            max_tokens: 1024,
            system: SYSTEM_BLOCKS,
            tools: TOOLS,
            messages: msgs,
          });
          const u = r.usage;
          if (u) {
            usageTotals.input += u.input_tokens ?? 0;
            usageTotals.output += u.output_tokens ?? 0;
            usageTotals.cacheRead += u.cache_read_input_tokens ?? 0;
            usageTotals.cacheWrite += u.cache_creation_input_tokens ?? 0;
          }
          return r;
        };

        // Streaming ANSWER pass on the quality model: writes the grounded,
        // user-facing answer from the sources gathered above.
        // max_tokens is a CEILING, not a target: the prompt makes answers short &
        // conversational, so a high cap adds NO latency (generation stops at the
        // model's own stop token) but guarantees the rare long, multi-citation
        // contested-ruling reply never truncates mid-sentence. (Previously 2048,
        // which risked cutoff — restored to 4096.)
        // effort "medium" (Opus default is "high") trims the model's
        // deliberation and verbosity for a faster, tighter reply. Thinking stays
        // OFF — adaptive thinking is not enabled on Opus 4.8 unless requested —
        // so this only dials the non-thinking token spend down a notch without
        // sacrificing the grounding/citation behavior enforced by the prompt.
        const answerStream = async (
          msgs: Anthropic.Messages.MessageParam[]
        ): Promise<void> => {
          const s = client.messages.stream({
            model: ANSWER_MODEL,
            max_tokens: 4096,
            output_config: { effort: "medium" },
            system: SYSTEM_BLOCKS,
            messages: msgs,
          });
          for await (const ev of s) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              raw += ev.delta.text;
              flushDeltas();
            }
          }
          const final = await s.finalMessage();
          // If the answer still hit the output cap, don't leave a silent
          // mid-sentence cut: drop any half-emitted [[cite/link]] marker, close
          // with a clean ellipsis, and log it so truncations are visible.
          if (final.stop_reason === "max_tokens") {
            const openMarker = raw.lastIndexOf("[[");
            if (openMarker !== -1 && raw.indexOf("]]", openMarker) === -1) {
              raw = raw.slice(0, openMarker);
            }
            raw = raw.trimEnd() + " …";
            flushDeltas();
            console.warn("[Ask Hiqmah] Answer truncated at max_tokens", {
              chars: raw.length,
              outputTokens: final.usage?.output_tokens,
            });
          }
          const u = final.usage;
          if (u) {
            usageTotals.input += u.input_tokens ?? 0;
            usageTotals.output += u.output_tokens ?? 0;
            usageTotals.cacheRead += u.cache_read_input_tokens ?? 0;
            usageTotals.cacheWrite += u.cache_creation_input_tokens ?? 0;
          }
        };

        // ── Search phase (fast model, adaptive rounds) ──────────────────────
        // One wave = every tool call the model requested in a single turn. The
        // model is prompted to fire several angles per wave, so one wave is
        // already a multi-angle search, not a single guess.
        //
        // Executes the wave, reports what is being searched, and returns the
        // tool_result blocks plus whether the retrieval layer found anything
        // solid enough to stop on.
        const runToolWave = (blocks: Anthropic.Messages.ToolUseBlock[]) => {
          send("status", { text: describeSearchWave(blocks) });
          // A wave is judged on its SEARCHES, not on everything it did. A
          // get_quran_verse lookup resolves by construction, so letting one
          // vouch for the wave would suppress escalation in exactly the case
          // the user reported: a hadith hunt that came up empty next to a verse
          // lookup that trivially succeeded. Lookups only decide the wave when
          // no search ran at all.
          let searchRan = false;
          let searchStrong = false;
          let lookupStrong = false;
          const toolResults: Anthropic.Messages.ToolResultBlockParam[] = blocks.map((block) => {
            const { result, digest, citations, strong: hit } = executeTool(block, citationCounter);
            allCitations.push(...citations);
            // `digest`, not `result`: allSearchResults is replayed to the ANSWER
            // model, which has no tools and must not be handed instructions
            // written for the search model.
            allSearchResults.push(digest);
            if (block.name === "search_hadith" || block.name === "search_quran") {
              searchRan = true;
              if (hit) searchStrong = true;
            } else if (hit) {
              lookupStrong = true;
            }
            return {
              type: "tool_result" as const,
              tool_use_id: block.id,
              content: result,
            };
          });
          return { toolResults, strong: searchRan ? searchStrong : lookupStrong };
        };

        send("status", { text: PLANNING_STATUS });
        let response = await gather(apiMessages);
        const messageChain: Anthropic.Messages.MessageParam[] = [...apiMessages];
        let refinements = 0;
        let foundStrongSource = false;

        while (response.stop_reason === "tool_use") {
          const toolBlocks = response.content.filter(
            (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
          );
          // Defensive: a "tool_use" stop_reason always carries at least one
          // tool_use block, but an empty wave would push an empty tool_result
          // array back to the API (a 400) and could never satisfy the loop's
          // exit condition on its own.
          if (toolBlocks.length === 0) break;
          const wave = runToolWave(toolBlocks);
          if (wave.strong) foundStrongSource = true;

          // Fast path: solid sources in hand, or we've already spent our one
          // refinement. Either way, stop paying for round-trips and answer.
          if (foundStrongSource || refinements >= MAX_REFINEMENT_ROUNDS) break;

          // Weak or empty wave — escalate ourselves rather than surfacing a
          // shrug. This is the round that used to be missing: the model gets to
          // see its own results and retry with different keywords, so the user
          // never has to say "I feel like you can find it".
          refinements++;
          send("status", { text: ESCALATION_STATUS });
          messageChain.push({ role: "assistant" as const, content: response.content });
          // tool_result blocks must lead the user turn; the instruction rides
          // after them as text in the same message.
          messageChain.push({
            role: "user" as const,
            content: [
              ...wave.toolResults,
              { type: "text" as const, text: ESCALATION_INSTRUCTION },
            ],
          });
          response = await gather(messageChain);
        }

        // ── Answer phase (quality model, streamed) ──────────────────────────
        // Count DISTINCT sources: the multi-angle waves deliberately overlap, so
        // the same hadith can arrive twice and claiming to read it twice would be
        // a lie. (allCitations keeps its duplicates — [[cite:N]] indexes into it.)
        const seenSources = new Set<string>();
        let hadithSources = 0;
        let quranSources = 0;
        for (const c of allCitations) {
          if (seenSources.has(c.reference)) continue;
          seenSources.add(c.reference);
          if (c.type === "hadith") hadithSources++;
          else quranSources++;
        }
        send("status", { text: describeSources(hadithSources, quranSources) });

        const searchSummary = allSearchResults.length > 0
          ? `Here are search results from the app's database. Evaluate each for relevance:\n\n${allSearchResults.join("\n\n---\n\n")}`
          : "No relevant sources were found in the app's database. Do NOT fabricate a verse, hadith, or reference — if the question needs a specific text, tell the user you couldn't verify one, then give general guidance framed as such.";

        // Tell the answer model how hard the search actually tried, so "I couldn't
        // verify a specific narration" is an informed statement rather than a
        // guess — and so it never offers to run a search it cannot run. Counted
        // from the tool calls that really executed, not from what the prompt asked
        // for: telling the model it searched five ways when it searched once would
        // license exactly the overconfidence the grounding rules exist to prevent.
        const searchCount = allSearchResults.length;
        const searchEffort =
          searchCount === 0
            ? "No database search was run for this question."
            : `${searchCount} database ${searchCount === 1 ? "search has" : "searches have"} already been run${refinements > 0 ? ", across two rounds with different angles," : ""} and the results above are everything they returned.`;

        await answerStream([
          ...apiMessages,
          { role: "user" as const, content: `[SEARCH RESULTS]\n${searchSummary}\n\n[SEARCH EFFORT] ${searchEffort} You have NO search tools in this turn, so never offer to search again, never ask permission to look further, and never end with "let me know if you'd like me to check" — the searching is done. If nothing relevant came back, say plainly that you couldn't verify a specific text in our collections and give general guidance instead.\n\n[REMINDER] Now answer the user's question above. Keep it SHORT and conversational — like a knowledgeable friend in a chat, not an essay: open with the direct answer, 1–3 short paragraphs, no preamble. Stay grounded: only quote or cite a verse/hadith that appears in the results above (with [[cite:N]]); never invent a reference. If there's real depth you held back (scholarly views, a longer story, the specific narrations), end with ONE brief, natural follow-up offer instead of dumping it all; if it's simple, just answer and stop. Include [[link:Label|/path]] at the end.` },
        ]);

        let text = raw;

        // Debug logging (remove in production)
        // try { fs.writeFileSync(path.join(process.cwd(), "ask-debug.log"), JSON.stringify({ stopReason: response.stop_reason, textLen: text.length, refinements }, null, 2)); } catch {}

        const links: { label: string; href: string }[] = [];

        // Try to unwrap JSON if Claude returned it (backward compat)
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.content && typeof parsed.content === "string" && parsed.content.length > 10) {
              text = parsed.content;
              if (Array.isArray(parsed.links)) {
                for (const l of parsed.links) {
                  if (l.label && l.href) links.push({ label: l.label, href: l.href });
                }
              }
            }
          }
        } catch {
          // Not JSON, use text as-is (this is the expected path)
        }

        // Extract [[link:Label|/path]] markers from text
        const linkRegex = /\[\[link:([^|]+)\|([^\]]+)\]\]/g;
        let linkMatch;
        while ((linkMatch = linkRegex.exec(text)) !== null) {
          links.push({ label: linkMatch[1].trim(), href: linkMatch[2].trim() });
        }
        text = text.replace(/\[\[link:[^\]]+\]\]/g, "").trim();

        // Extract [[cite:N]] markers to determine which citations Claude actually wants to include
        const citedIndices = new Set<number>();
        const citeRegex = /\[\[cite:(\d+)\]\]/g;
        let citeMatch;
        while ((citeMatch = citeRegex.exec(text)) !== null) {
          citedIndices.add(parseInt(citeMatch[1], 10));
        }
        text = text.replace(/\[\[cite:\d+\]\]/g, "").trim();

        // Only include citations that Claude explicitly referenced
        const filteredCitations: Citation[] = [];
        const seen = new Set<string>();
        allCitations.forEach((c, i) => {
          const idx = i + 1; // 1-based
          if (citedIndices.has(idx) && !seen.has(c.reference)) {
            seen.add(c.reference);
            filteredCitations.push(c);
          }
        });

        // SAFETY: if text ended up empty somehow, provide all citations as fallback
        if (!text || text.length < 5) {
          console.error("[Ask Hiqmah] Empty response! Raw was:", JSON.stringify(raw).slice(0, 500));
          text = text || "I apologize, I encountered an issue generating a response. Please try asking your question again.";
        }

        // `refinements`/`strongSource` are the tuning signals for STRONG_HIT_SCORE:
        // refinements firing on nearly every question means the floor is too high
        // (we're paying a round-trip we don't need), never firing means too low.
        console.log(
          "[Ask Hiqmah] Content length:", text.length,
          "links:", links.length,
          "citations:", filteredCitations.length,
          "sources:", seenSources.size,
          "refinements:", refinements,
          "strongSource:", foundStrongSource
        );
        send("answer", { content: text, links, citations: filteredCitations });

        // Log usage against quota (after successful answer)
        if (supabaseSrv && (userId || anonId)) {
          try {
            await supabaseSrv.from("chat_usage").insert({
              user_id: userId,
              anon_id: userId ? null : anonId,
              ip_hash: ipHash,
              input_tokens: usageTotals.input,
              output_tokens: usageTotals.output,
              cache_read_tokens: usageTotals.cacheRead,
              cache_creation_tokens: usageTotals.cacheWrite,
            });
          } catch (e) {
            console.error("[Ask Hiqmah] Failed to log chat_usage:", e);
          }
        }

        send("done", {});
      } catch (error) {
        console.error("Search API error:", error);
        // Distinguish transient Anthropic overload (529) / rate limit (429)
        // from real failures so the client can show a "try again" message.
        const status =
          error instanceof Anthropic.APIError ? error.status : undefined;
        if (status === 529 || status === 429) {
          send("error", {
            message:
              "Ask Hiqmah is experiencing high demand right now. Please try again in a moment.",
            retryable: true,
          });
        } else {
          send("error", { message: "Failed to process your question" });
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...CORS_HEADERS,
    },
  });
}
