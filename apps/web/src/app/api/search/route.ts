import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";
import { tryGetSupabaseServer } from "@/lib/supabase-server";

// maxRetries bumped from the SDK default of 2 → 4 so brief Anthropic 529
// (overloaded) spikes are absorbed with exponential backoff instead of
// surfacing as a user-facing failure.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_SECRET,
  maxRetries: 4,
});

// Current Sonnet model. Was claude-sonnet-4-20250514 (Sonnet 4.0), which is
// deprecated and retires 2026-06-15 — would 404 after that date.
const CHAT_MODEL = "claude-sonnet-4-6";

// Find the @hidden-hiqmah/content workspace package at runtime. Layouts:
//   - dev (pnpm dev from apps/web)    → cwd = apps/web → ../../packages/content
//   - Vercel (Root Directory=apps/web,
//     outputFileTracingRoot=monorepo) → cwd = /var/task → packages/content
//
// Probe both; use whichever has the hadith/ subdirectory we need.
const CONTENT_ROOT: string = (() => {
  const candidates = [
    path.join(process.cwd(), "packages/content"),       // Vercel
    path.join(process.cwd(), "../../packages/content"), // dev
    path.join(process.cwd(), "../packages/content"),    // safety net
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(path.join(candidate, "hadith"))) {
        return candidate;
      }
    } catch {
      // ignore
    }
  }
  // Fallback — let the per-file fs.readFileSync calls surface the real error
  console.error("[Ask Hiqmah] Could not locate @hidden-hiqmah/content. Tried:", candidates);
  return candidates[0];
})();

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

// ── Hadith search infrastructure ──────────────────────────────────────────

const HADITH_DIR = path.join(CONTENT_ROOT, "hadith");
const COLLECTIONS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "ahmad"];

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

const metaCache = new Map<string, CollectionMeta>();
function getMeta(collection: string): CollectionMeta | null {
  if (metaCache.has(collection)) return metaCache.get(collection)!;
  try {
    const raw = fs.readFileSync(path.join(HADITH_DIR, collection, "metadata.json"), "utf-8");
    const meta = JSON.parse(raw) as CollectionMeta;
    metaCache.set(collection, meta);
    return meta;
  } catch {
    return null;
  }
}

// Stop words to filter out from search queries — these match too many hadiths
const STOP_WORDS = new Set([
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
  "just", "also", "still", "already", "even",
  "said", "says", "told", "asked", "went", "came", "made", "got",
  "prophet", "allah", "messenger", "narrated", "god",
]);

function filterKeywords(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function searchHadiths(
  query: string,
  collection?: string,
  maxResults = 5
): { collection: string; collectionName: string; book: string; reference: string; english: string }[] {
  const keywords = filterKeywords(query);
  if (keywords.length === 0) return [];

  const results: { collection: string; collectionName: string; book: string; reference: string; english: string; score: number }[] = [];
  const collectionsToSearch = collection ? [collection] : COLLECTIONS;

  for (const col of collectionsToSearch) {
    const meta = getMeta(col);
    if (!meta) continue;

    for (const book of meta.books) {
      let hadiths: HadithEntry[];
      try {
        const raw = fs.readFileSync(path.join(HADITH_DIR, col, `${book.id}.json`), "utf-8");
        hadiths = JSON.parse(raw) as HadithEntry[];
      } catch {
        continue;
      }

      for (const h of hadiths) {
        const text = h.english.toLowerCase();
        let score = 0;
        for (const kw of keywords) {
          if (text.includes(kw)) score++;
        }
        // Require at least 2/3 of meaningful keywords to match
        if (keywords.length > 0 && score >= Math.ceil(keywords.length * 2 / 3)) {
          results.push({
            collection: col,
            collectionName: meta.name,
            book: book.name,
            reference: `${col} ${h.reference}`,
            english: h.english.length > 500 ? h.english.slice(0, 500) + "…" : h.english,
            score,
          });
        }
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults).map(({ score: _, ...rest }) => rest);
}

// ── Quran search infrastructure ───────────────────────────────────────────

const QURAN_DIR = path.join(CONTENT_ROOT, "quran");

interface QuranVerse {
  id: number;
  number: number;
  key: string;
  textAr: string;
  textEn: string;
  textTranslit?: string;
  juz: number;
  page: number;
  hizb: number;
}

interface ChapterInfo {
  id: number;
  name: string;
  nameAr: string;
  meaning: string;
  verses: number;
}

let chaptersCache: ChapterInfo[] | null = null;
function getChapters(): ChapterInfo[] {
  if (chaptersCache) return chaptersCache;
  try {
    const raw = fs.readFileSync(path.join(QURAN_DIR, "chapters.json"), "utf-8");
    chaptersCache = JSON.parse(raw) as ChapterInfo[];
    return chaptersCache;
  } catch {
    return [];
  }
}

const surahCache = new Map<number, QuranVerse[]>();
function getSurahVerses(surahId: number): QuranVerse[] {
  if (surahCache.has(surahId)) return surahCache.get(surahId)!;
  try {
    const raw = fs.readFileSync(path.join(QURAN_DIR, "verses", `${surahId}.json`), "utf-8");
    const verses = JSON.parse(raw) as QuranVerse[];
    surahCache.set(surahId, verses);
    return verses;
  } catch {
    return [];
  }
}

function searchQuran(
  query: string,
  surahId?: number,
  maxResults = 5
): { surah: string; surahId: number; verse: number; key: string; arabic: string; english: string }[] {
  const keywords = filterKeywords(query);
  if (keywords.length === 0) return [];

  const chapters = getChapters();
  const results: { surah: string; surahId: number; verse: number; key: string; arabic: string; english: string; score: number }[] = [];
  const surahsToSearch = surahId ? [surahId] : Array.from({ length: 114 }, (_, i) => i + 1);

  for (const sid of surahsToSearch) {
    const verses = getSurahVerses(sid);
    const ch = chapters.find((c) => c.id === sid);
    const surahName = ch ? `${ch.name} (${ch.meaning})` : `Surah ${sid}`;

    for (const v of verses) {
      const text = v.textEn.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) score++;
      }
      if (keywords.length > 0 && score >= Math.ceil(keywords.length * 2 / 3)) {
        results.push({
          surah: surahName,
          surahId: sid,
          verse: v.number,
          key: v.key,
          arabic: v.textAr,
          english: v.textEn,
          score,
        });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults).map(({ score: _, ...rest }) => rest);
}

function getQuranVerse(surahId: number, ayah: number): { surah: string; surahId: number; verse: number; key: string; arabic: string; english: string; transliteration?: string } | null {
  const chapters = getChapters();
  const verses = getSurahVerses(surahId);
  const ch = chapters.find((c) => c.id === surahId);
  const v = verses.find((vr) => vr.number === ayah);
  if (!v) return null;
  return {
    surah: ch ? `${ch.name} (${ch.meaning})` : `Surah ${surahId}`,
    surahId,
    verse: v.number,
    key: v.key,
    arabic: v.textAr,
    english: v.textEn,
    transliteration: v.textTranslit,
  };
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
      "Search through the hadith collections available on this website (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Ahmad). Use this to find specific hadiths, verify references, or look up hadiths by topic/keyword.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "2-5 specific, meaningful keywords (no stop words). Examples: 'actions intentions', 'hellfire repentance dragged', 'mother paradise feet'. Use distinctive words that would appear in the hadith text.",
        },
        collection: {
          type: "string",
          enum: ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "ahmad"],
          description: "Optional: limit search to a specific collection.",
        },
        max_results: {
          type: "number",
          description: "Maximum results (default 5, max 10).",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "search_quran",
    description:
      "Search through all 114 surahs of the Quran by keywords in the English translation.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "2-5 specific, meaningful keywords (no stop words). Examples: 'mercy forgiveness', 'fasting prescribed believers', 'throne heavens earth'.",
        },
        surah_id: {
          type: "number",
          description: "Optional: limit to a specific surah (1-114).",
        },
        max_results: {
          type: "number",
          description: "Maximum results (default 5, max 10).",
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

const SYSTEM_PROMPT = `You are "Hiqmah", the AI assistant for Hidden Hiqmah — an Islamic educational website. You answer questions about Islam using authentic sources (Quran, Sahih Bukhari, Sahih Muslim, and other major hadith collections). You are knowledgeable, warm, respectful, and always cite your sources.

IMPORTANT RULES:
- Always base your answers on authentic Islamic sources (Quran, Sahih hadith collections)
- When citing hadith, mention the collection and reference (e.g. "Sahih al-Bukhari 1:2")
- When citing Quran, use surah:ayah format (e.g. "Quran 2:255")
- Be concise but thorough — aim for 2-4 paragraphs
- Use respectful Islamic conventions (ﷺ after Prophet Muhammad's name, عليه السلام after other prophets)
- If a question is outside Islamic topics, politely redirect
- Do NOT make up hadith numbers or references — if unsure, use the search_hadith tool to verify

SEARCH TOOLS:
You have access to the website's Quran and hadith databases. Use these tools to verify and cite content.

search_hadith — Search hadith collections by keywords.
search_quran — Search all 114 surahs by keywords in English translation.
get_quran_verse — Look up a specific verse by surah:ayah.

CRITICAL RULES FOR TOOL RESULTS:
1. You MUST critically evaluate every search result. Read each result carefully and determine: does this hadith/verse ACTUALLY discuss what the user is asking about? Just because keywords match does NOT mean it's relevant.
2. DISCARD search results that are not semantically relevant to the question. If a user asks about "the person dragged to hellfire who seeks repentance" and the search returns a hadith about travel — that is NOT relevant, do not cite it.
3. If NO search results are relevant, that's fine — use your own knowledge as an Islamic scholar. Say something like "While I couldn't find the exact hadith in our collections, based on authentic sources..." and provide your best answer.
4. When you DO find a relevant result, reference it using this exact format in your text: [[cite:N]] where N is the 1-based index of the result from the tool call. For example: "The Prophet ﷺ said... [[cite:1]]" — only the results you mark with [[cite:N]] will be shown as source cards.
5. Try MULTIPLE different keyword searches if the first one doesn't return relevant results. Think about what distinctive words would actually appear in the hadith text.

YOUR #1 PRIORITY: ALWAYS write a substantive, conversational text answer. The answer text is the primary response — citations are supplementary. NEVER return an empty or minimal answer. Even if search returns nothing useful, you MUST still answer the question using your knowledge.

FORMATTING:
Write plain text. You may use **bold** for emphasis and line breaks for structure. No headers, lists, or code blocks.

At the END of your response, include relevant page links using this format (one per line):
[[link:Label Text|/path/to/page]]

WEBSITE DEEP LINKING:
HADITH: /hadith/{collection}/{bookId}?highlight={hadithId}
QURAN: /quran/{surah_number}
PROPHETS: /prophets/{slug}
PROPHET MUHAMMAD: /prophet-muhammad?tab=timeline|character|appearance|family|prophecies|worship|daily-sunnah
TAWHID: /tawhid?tab=categories
ARTICLES OF FAITH: /articles-of-faith?tab=articles
PILLARS: /pillars?tab=pillars
SALAH: /salah?tab=prayers|voluntary
DUAS: /duas?tab={category}
RAMADAN: /ramadan?tab=fasting|last-ten
BARZAKH: /barzakh?tab=what-happens|protection
DAY OF JUDGEMENT: /day-of-judgement?tab=signs|events|salvation
JANNAH: /jannah?tab=descriptions|how-to
MIRACLES: /miracles?tab={category}
ISLAMIC CALENDAR: /islamic-calendar?tab=months|dates
WHY ISLAM: /why-islam?tab=proofs|christianity|judaism|hinduism|buddhism|sikhism|atheism|questions
SECTS: /sects?tab=sunni|shia|other
OTHER: /hadith, /resources, /learn-arabic`;

// ── Tool execution helper ─────────────────────────────────────────────────

const STATUS_MESSAGES: Record<string, string> = {
  search_hadith: "Searching hadith collections...",
  search_quran: "Searching the Quran...",
  get_quran_verse: "Looking up Quran verse...",
};

function executeTool(block: Anthropic.Messages.ToolUseBlock, counter: { value: number }): { result: string; citations: Citation[] } {
  const citations: Citation[] = [];

  if (block.name === "search_hadith") {
    const input = block.input as { query: string; collection?: string; max_results?: number };
    const results = searchHadiths(input.query, input.collection, Math.min(input.max_results || 5, 10));
    if (results.length > 0) {
      // Number each result so Claude can reference them with [[cite:N]]
      const numbered = results.map((h) => {
        counter.value++;
        const refParts = h.reference.split(" ");
        const col = refParts[0];
        const [bookId, hadithId] = (refParts[1] || "").split(":");
        citations.push({
          type: "hadith",
          source: h.collectionName,
          reference: h.reference,
          english: h.english,
          href: `/hadith/${col}/${bookId}?highlight=${hadithId}`,
        });
        return `[Result ${counter.value}] ${h.reference}\n${h.english}`;
      });
      return {
        result: `Found ${results.length} results. IMPORTANT: Read each result carefully. Only cite results that are actually relevant to the user's question using [[cite:N]] format.\n\n${numbered.join("\n\n")}`,
        citations,
      };
    }
    return {
      result: "No matching hadiths found. Try different keywords, or answer from your own knowledge.",
      citations,
    };
  }

  if (block.name === "search_quran") {
    const input = block.input as { query: string; surah_id?: number; max_results?: number };
    const results = searchQuran(input.query, input.surah_id, Math.min(input.max_results || 5, 10));
    if (results.length > 0) {
      const numbered = results.map((v) => {
        counter.value++;
        citations.push({
          type: "quran",
          source: v.surah,
          reference: v.key,
          arabic: v.arabic,
          english: v.english,
          href: `/quran/${v.surahId}`,
        });
        return `[Result ${counter.value}] ${v.key}\n${v.english}`;
      });
      return {
        result: `Found ${results.length} verses. IMPORTANT: Only cite verses actually relevant to the question using [[cite:N]] format.\n\n${numbered.join("\n\n")}`,
        citations,
      };
    }
    return {
      result: "No matching verses found. Try different keywords, or answer from your own knowledge.",
      citations,
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
        href: `/quran/${result.surahId}`,
      });
      return {
        result: `[Result ${counter.value}] ${result.key}\nArabic: ${result.arabic}\nEnglish: ${result.english}\nTransliteration: ${result.transliteration || "N/A"}`,
        citations,
      };
    }
    return {
      result: `Verse ${input.surah_id}:${input.ayah} not found.`,
      citations,
    };
  }

  return { result: "Unknown tool", citations: [] };
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
        // First sign-in-day bonus grant (idempotent — PK on user_id)
        try {
          await supabaseSrv
            .from("sign_in_bonuses")
            .insert({ user_id: userId })
            .select()
            .maybeSingle();
        } catch {
          // Likely duplicate (user has already received bonus before today's
          // window) — safe to ignore. The quota function checks granted_at.
        }
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

        const allCitations: Citation[] = [];
        const allSearchResults: string[] = [];

        // Step 1: First API call WITH tools — let Claude decide what to search
        let response = await client.messages.create({
          model: CHAT_MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          tools: TOOLS,
          messages: apiMessages,
        });

        // Step 2: Execute up to 2 rounds of tool use, accumulating full message chain
        const messageChain: Anthropic.Messages.MessageParam[] = [...apiMessages];
        let rounds = 0;

        while (response.stop_reason === "tool_use" && rounds < 2) {
          rounds++;
          const toolBlocks = response.content.filter(
            (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
          );

          for (const block of toolBlocks) {
            send("status", { text: STATUS_MESSAGES[block.name] || "Searching..." });
          }

          const toolResults: Anthropic.Messages.ToolResultBlockParam[] = toolBlocks.map((block) => {
            const { result, citations } = executeTool(block, citationCounter);
            allCitations.push(...citations);
            allSearchResults.push(result);
            return {
              type: "tool_result" as const,
              tool_use_id: block.id,
              content: result,
            };
          });

          // Append this round to the chain
          messageChain.push({ role: "assistant" as const, content: response.content });
          messageChain.push({ role: "user" as const, content: toolResults });

          response = await client.messages.create({
            model: CHAT_MODEL,
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            tools: TOOLS,
            messages: messageChain,
          });
        }

        // Step 3: If Claude still wants tools after 2 rounds, or if the response
        // has no text block, force a final text-only call with condensed context
        let textBlock = response.content.find(
          (b): b is Anthropic.Messages.TextBlock => b.type === "text"
        );

        if (!textBlock?.text) {
          // Execute any remaining tool calls
          if (response.stop_reason === "tool_use") {
            const toolBlocks = response.content.filter(
              (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
            );
            for (const block of toolBlocks) {
              const { result, citations } = executeTool(block, citationCounter);
              allCitations.push(...citations);
              allSearchResults.push(result);
            }
          }

          // Build a condensed final call: original user messages + search summary
          send("status", { text: "Preparing answer..." });
          const searchSummary = allSearchResults.length > 0
            ? `Here are search results from the website's database. Evaluate each for relevance:\n\n${allSearchResults.join("\n\n---\n\n")}`
            : "No search results were found in the website's database. Answer from your own knowledge.";

          response = await client.messages.create({
            model: CHAT_MODEL,
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [
              ...apiMessages,
              { role: "user" as const, content: `[SEARCH RESULTS]\n${searchSummary}\n\n[REMINDER] Now answer the user's question above. Write a full, conversational response. Reference relevant results with [[cite:N]] format. Include [[link:Label|/path]] at the end.` },
            ],
          });

          textBlock = response.content.find(
            (b): b is Anthropic.Messages.TextBlock => b.type === "text"
          );
        }

        let text = textBlock?.text || "";

        // Debug logging (remove in production)
        // try { fs.writeFileSync(path.join(process.cwd(), "ask-debug.log"), JSON.stringify({ stopReason: response.stop_reason, textLen: text.length, rounds }, null, 2)); } catch {}

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
          console.error("[Ask Hiqmah] Empty response! Raw was:", JSON.stringify(textBlock?.text || "").slice(0, 500));
          text = text || "I apologize, I encountered an issue generating a response. Please try asking your question again.";
        }

        console.log("[Ask Hiqmah] Content length:", text.length, "links:", links.length, "citations:", filteredCitations.length);
        send("answer", { content: text, links, citations: filteredCitations });

        // Log usage against quota (after successful answer)
        if (supabaseSrv && (userId || anonId)) {
          try {
            await supabaseSrv.from("chat_usage").insert({
              user_id: userId,
              anon_id: userId ? null : anonId,
              ip_hash: ipHash,
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
