"use client";

import { useState, useEffect, useRef, useCallback, Fragment, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Search, Send, Loader2, X, MessageCircleQuestion, Trash2, ExternalLink, Copy, Check, Flag, BookOpen, BookMarked } from "lucide-react";
import { getOrCreateAnonId, getStoredAuthToken } from "../lib/anon-id";

declare global {
  interface Window {
    Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string };
  }
}

// ── Shared types ──────────────────────────────────────────────────────────

export type Citation = {
  type: "hadith" | "quran";
  source: string;
  reference: string;
  arabic?: string;
  english: string;
  href: string;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  links?: { label: string; href: string }[];
  citations?: Citation[];
};

// ── Persistence ───────────────────────────────────────────────────────────

export const STORAGE_KEY = "hiqmah-chat";

export function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveMessages(msgs: Message[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch {}
}

// ── Markdown renderer ─────────────────────────────────────────────────────

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIdx = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>);
    }
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }
  return parts;
}

export function renderMarkdown(text: string): ReactNode {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    const lines = para.split("\n");
    return (
      <p key={i} className={i > 0 ? "mt-3" : ""}>
        {lines.map((line, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {renderInline(line)}
          </Fragment>
        ))}
      </p>
    );
  });
}

// ── Citation card ─────────────────────────────────────────────────────────

export function CitationCard({ citation, onNavigate }: { citation: Citation; onNavigate?: () => void }) {
  const isQuran = citation.type === "quran";
  return (
    <Link
      href={citation.href}
      onClick={onNavigate}
      className={`block rounded-lg border p-3 text-xs transition-colors hover:bg-white/5 ${
        isQuran
          ? "border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5"
          : "border-emerald-500/30 bg-emerald-500/5"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        {isQuran ? (
          <BookOpen size={11} className="text-[var(--color-gold)] shrink-0" />
        ) : (
          <BookMarked size={11} className="text-emerald-400 shrink-0" />
        )}
        <span className={`font-semibold ${isQuran ? "text-[var(--color-gold)]" : "text-emerald-400"}`}>
          {citation.source}
        </span>
        <span className="text-themed-muted/60 ml-auto">{citation.reference}</span>
      </div>
      {citation.arabic && (
        <p className="text-right text-sm leading-loose text-themed/80 font-arabic mb-1.5" dir="rtl">
          {citation.arabic}
        </p>
      )}
      <p className="text-themed-muted leading-relaxed line-clamp-3">{citation.english}</p>
    </Link>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-white/10 text-themed-muted/40 hover:text-themed-muted transition-colors"
      title="Copy message"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
    </button>
  );
}

// ── Report button + sheet ─────────────────────────────────────────────────
//
// Google Play requires apps that generate content with AI to offer an in-app
// way to flag offensive output. This is that mechanism, deliberately built to
// the same visual weight as CopyButton above: Play mandates the ABILITY to
// flag, never its prominence, so nothing here appears unprompted, animates on
// render, or shifts layout.

const REPORT_REASONS: { code: string; label: string }[] = [
  { code: "offensive", label: "Offensive or inappropriate" },
  { code: "incorrect", label: "Incorrect or misleading" },
  { code: "source", label: "Wrong or missing source" },
  { code: "other", label: "Something else" },
];

/** What the user saw when they tapped the flag. Frozen at OPEN time because
 *  onAnswer() replaces the whole assistant message object mid-stream — reading
 *  the live prop at send time can report text the user never saw.
 *
 *  `token` is frozen for a different reason: the sheet TELLS the user whether
 *  the report carries their account, and that sentence is the app's consent
 *  disclosure. If the disclosure read the token at render time and send() read
 *  it again later, a session expiring in between would make the sentence false
 *  in the one direction that matters. Captured once, shown and sent. */
type ReportSnapshot = { answer: string; question?: string; partial: boolean; token?: string };

function currentPlatform(): string {
  if (typeof window === "undefined") return "web";
  return window.Capacitor?.isNativePlatform?.() ? window.Capacitor?.getPlatform?.() || "native" : "web";
}

export function ReportButton({
  answer,
  question,
  partial,
  accountLabel,
  surface = "ask",
  onOpenHaptic,
  onSendHaptic,
}: {
  answer: string;
  question?: string;
  partial?: boolean;
  /** Signed-in email, shown verbatim in the disclosure. packages/ui can't
   *  import the app's AuthContext, so the caller passes it. Optional, and the
   *  disclosure stays truthful without it — whether the report is attributed
   *  is decided by the stored token, never by whether this prop was passed. */
  accountLabel?: string;
  surface?: "ask" | "ask-float";
  // Haptics live behind an apps/web alias that packages/ui cannot import.
  onOpenHaptic?: () => void;
  onSendHaptic?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState("");
  const [snap, setSnap] = useState<ReportSnapshot | null>(null);

  const showNotice = (m: string) => {
    setNotice(m);
    // Stale-timer guard: a second notice must not be wiped by the first one's
    // timeout (CircleChatSheet idiom).
    setTimeout(() => setNotice((n) => (n === m ? "" : n)), 2600);
  };

  const send = async (reason: string | null, note: string) => {
    const s = snap;
    setOpen(false);
    setSnap(null);
    if (!s) return;
    onSendHaptic?.();
    // The route's own ceiling is 10s. Without a client-side abort a request the
    // network never answers leaves NO pill at all — the sheet is already shut,
    // so the user is given no confirmation and no error, ever. Fail loudly.
    const ctl = new AbortController();
    const killer = setTimeout(() => ctl.abort(), 12000);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      // s.token, not a fresh read: this is the exact credential the disclosure
      // the user just agreed to describes.
      if (s.token) headers["Authorization"] = `Bearer ${s.token}`;
      headers["X-Anon-Id"] = getOrCreateAnonId();
      const res = await fetch(`${getApiBaseUrl()}/api/ask-report`, {
        method: "POST",
        headers,
        signal: ctl.signal,
        body: JSON.stringify({
          answer: s.answer,
          question: s.question,
          reason,
          note: note.trim() || undefined,
          partial: s.partial,
          surface,
          platform: currentPlatform(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      showNotice("Reported — we'll review it.");
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    } catch {
      showNotice("Couldn't send that report.");
    } finally {
      clearTimeout(killer);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setSnap({ answer, question, partial: !!partial, token: getStoredAuthToken() });
          setOpen(true);
          onOpenHaptic?.();
        }}
        className="p-1 rounded hover:bg-white/10 text-themed-muted/40 hover:text-themed-muted transition-colors"
        title="Report this answer"
        aria-label="Report this answer"
      >
        {sent ? <Check size={12} className="text-emerald-400" /> : <Flag size={12} />}
      </button>
      {open && snap && (
        <ReportSheet
          accountLabel={accountLabel}
          attributed={!!snap.token}
          onSend={send}
          onClose={() => {
            setOpen(false);
            setSnap(null);
          }}
        />
      )}
      {notice &&
        createPortal(
          <div className="ask-report-notice fixed left-1/2 -translate-x-1/2 z-[96] rounded-full card-bg border sidebar-border px-4 py-2 text-[12px] text-themed shadow-lg">
            {notice}
          </div>,
          document.body
        )}
    </>
  );
}

function ReportSheet({
  accountLabel,
  attributed,
  onSend,
  onClose,
}: {
  accountLabel?: string;
  /** True when the request will actually carry a Bearer token. Decided by the
   *  snapshot, not by `accountLabel`, so a caller that forgets to pass a label
   *  under-discloses (says "account", omits which) instead of flatly denying
   *  that an account is attached. */
  attributed: boolean;
  onSend: (reason: string | null, note: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  // Tracks whether OUR history entry is still on the stack, so closing by tap
  // pops exactly one entry and closing by Android Back pops none.
  const pushed = useRef(false);
  // onClose is an inline arrow in the parent, so it is a new function on every
  // render. Held in a ref and read at call time so the effect below can depend
  // on NOTHING: keyed on onClose it would re-run on each parent re-render and
  // push another history entry — and the parent re-renders on every streamed
  // token, so a sheet opened mid-answer would need dozens of Back presses.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Android Back must dismiss the sheet, not navigate away from the answer.
  useEffect(() => {
    const onPop = () => {
      pushed.current = false;
      closeRef.current();
    };
    pushed.current = true;
    window.history.pushState({ hiqmahAskReport: true }, "");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const dismiss = (fn: () => void) => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    }
    fn();
  };

  const row = "w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm border-t sidebar-border active:bg-[var(--overlay-subtle)] touch-manipulation";

  return createPortal(
    <div
      className="ask-report-sheet fixed inset-0 z-[95] flex items-end justify-center"
      onClick={() => dismiss(onClose)}
    >
      <div className="absolute inset-0 bg-black/50" />
      {/* Two regions, not one scroller. The reason list scrolls; the disclosure
          and the two actions are PINNED. With everything in one scrolling card
          (max-h-[80dvh]), one step up in Android's Display size — or a 1.3 font
          scale, which every Android offers — pushed Send and Cancel past the
          card's bottom edge with nothing on screen hinting the card scrolled:
          the Play-mandated submit action simply read as missing. Pinning also
          guarantees the consent text is on screen whenever Send is. */}
      <div
        className="relative w-full max-w-md m-3 rounded-2xl card-bg border sidebar-border overflow-hidden max-h-[88dvh] flex flex-col"
        style={{ marginBottom: "max(env(safe-area-inset-bottom), 12px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 overflow-y-auto">
          <div className="px-4 pt-4 pb-1 text-[15px] font-semibold text-themed">Report this answer</div>
          <p className="px-4 pb-3 text-[13px] text-themed-muted">
            Ask Hiqmah&apos;s answers are AI-generated and can be wrong.
          </p>

          {REPORT_REASONS.map((r) => (
            <button key={r.code} type="button" onClick={() => setReason(r.code)} className={row}>
              <span
                className={`w-[17px] h-[17px] rounded-full border shrink-0 flex items-center justify-center ${
                  reason === r.code
                    ? "border-[var(--color-accent2)] bg-[var(--color-accent2)]/20"
                    : "border-[var(--overlay-medium)]"
                }`}
              >
                {reason === r.code && <span className="w-[7px] h-[7px] rounded-full bg-[var(--color-accent2)]" />}
              </span>
              <span className="text-themed">{r.label}</span>
            </button>
          ))}

          <div className="px-4 py-3 border-t sidebar-border">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Add a note (optional)"
              className="w-full resize-none bg-[var(--color-card)] rounded-xl px-3 py-2 text-themed text-base outline-none border sidebar-border focus:border-[var(--color-accent2)]/45 transition-colors placeholder:text-themed-muted/50"
            />
          </div>
        </div>

        {/* The disclosure sits above Send, on the same screen, with no tap to
            reveal it: this is the only place the app ever stores Ask content,
            so the user has to be told before they confirm — not after, and not
            behind a link. */}
        <div className="shrink-0 px-4 py-3 border-t sidebar-border">
          <div className="text-[12px] font-semibold text-themed-muted mb-1">What gets sent</div>
          <p className="text-[12px] text-themed-muted/80 leading-relaxed">
            This answer, the question that produced it, your reason and your note. Nothing else from your
            conversation.
            <br />
            {attributed
              ? accountLabel
                ? `Sent from your account (${accountLabel}).`
                : "Sent from your account."
              : "Sent without an account, from a random ID on this device."}
            <br />
            {/* "up to" is load-bearing. Until migration 032 is applied the
                report is recoverable from server logs rather than stored for a
                full 90 days, and an exact figure would be a promise the app
                cannot keep in that window. */}
            We keep reports for up to 90 days to review them.
          </p>
        </div>

        <button
          type="button"
          onClick={() => dismiss(() => onSend(reason, note))}
          className="shrink-0 w-full px-4 py-3.5 text-center text-sm font-semibold text-[var(--color-accent2)] border-t sidebar-border active:bg-[var(--overlay-subtle)] touch-manipulation"
        >
          Send report
        </button>
        <button
          type="button"
          onClick={() => dismiss(onClose)}
          className="shrink-0 w-full px-4 py-3.5 text-center text-sm text-themed-muted border-t sidebar-border active:bg-[var(--overlay-subtle)] touch-manipulation"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── SSE stream consumer ───────────────────────────────────────────────────

export type QuotaInfo = {
  used: number;
  limit: number;
  resetAt: string | null;
  hasBonus: boolean;
};

export type StreamChatErrorReason =
  | { type: "quota_exceeded"; quota: QuotaInfo }
  | { type: "offline" }
  | { type: "generic"; detail?: string };

function formatQuotaReset(resetAt: string | null): string {
  if (!resetAt) return "soon";
  const diff = new Date(resetAt).getTime() - Date.now();
  if (diff <= 0) return "soon";
  const totalMin = Math.ceil(diff / 60_000);
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Maps a streamChat error reason to a user-facing message — shared by the web
 *  AskHiqmah panel and the mobile /ask page so the two can't drift (offline and
 *  quota were both collapsing into one generic "try again" on mobile). */
export function streamChatErrorMessage(reason?: StreamChatErrorReason): string {
  if (reason?.type === "offline") {
    return "You appear to be offline. Ask Hiqmah needs a connection — please reconnect and try again.";
  }
  if (reason?.type === "quota_exceeded") {
    return `You've reached today's limit for Ask Hiqmah. Please try again in ${formatQuotaReset(reason.quota.resetAt)}.`;
  }
  return "I apologize, I was unable to process your question. Please try again.";
}

function getApiBaseUrl(): string {
  const isNative =
    typeof window !== "undefined" &&
    !!window.Capacitor?.isNativePlatform?.();
  if (isNative) {
    // MUST be the canonical www host. The apex (hiddenhiqmah.com) 307-redirects
    // to www, and a CORS-preflighted POST can't follow a cross-origin redirect
    // → WKWebView throws "Load failed". Hit www directly to avoid the redirect.
    return process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.hiddenhiqmah.com";
  }
  return ""; // relative on web
}

/**
 * Native (WKWebView) SSE reader — XMLHttpRequest instead of fetch.
 *
 * WKWebView won't hand us a readable stream from `fetch` (res.body is null or
 * never yields until completion), which meant the whole answer had to finish
 * generating before ANY of it appeared in the app — the single biggest reason
 * Ask felt slow on device. XHR's `progress` event, however, DOES fire
 * incrementally with the bytes received so far, so we parse SSE out of
 * `responseText` as it grows and emit deltas live.
 *
 * Resolves true if it handled the response; false to fall back to fetch.
 */
function streamChatNative(
  url: string,
  headers: Record<string, string>,
  body: string,
  handlePart: (part: string) => string | null,
  onError: (reason?: StreamChatErrorReason) => void,
): Promise<boolean> {
  return new Promise((resolve) => {
    let xhr: XMLHttpRequest;
    try {
      xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      // The server caps itself at maxDuration=60s; give it headroom, but never
      // hang forever — without this the promise could never settle and the UI
      // would spin indefinitely with no way to recover.
      xhr.timeout = 90_000;
      for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    } catch {
      resolve(false); // XHR unavailable — let the caller use fetch
      return;
    }

    let consumed = 0; // chars of responseText already parsed
    let answered = false;
    let emitted = false; // did we dispatch ANY event to the UI?
    let settled = false;
    const finish = (v: boolean) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };

    // Parse whatever complete "\n\n"-terminated event blocks have arrived.
    const drain = (final: boolean) => {
      const text = xhr.responseText || "";
      if (text.length <= consumed && !final) return;
      const fresh = text.slice(consumed);
      const parts = fresh.split("\n\n");
      // The last chunk may be a partial event — keep it buffered unless we're
      // done (when final, `parts` already holds every remaining block).
      const tail = final ? "" : parts.pop() ?? "";
      for (const part of parts) {
        const dispatched = handlePart(part);
        if (dispatched) emitted = true;
        if (dispatched === "answer") answered = true;
      }
      consumed = text.length - tail.length;
    };

    xhr.onprogress = () => drain(false);
    xhr.onload = () => {
      if (xhr.status === 429) {
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed?.error === "quota_exceeded" && parsed?.quota) {
            onError({ type: "quota_exceeded", quota: parsed.quota });
            finish(true);
            return;
          }
        } catch {
          /* fall through */
        }
        onError({ type: "generic", detail: "HTTP 429 (rate/quota)" });
        finish(true);
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        onError({ type: "generic", detail: `HTTP ${xhr.status} from ${url}` });
        finish(true);
        return;
      }
      drain(true);
      if (!answered) {
        onError({
          type: "generic",
          detail: `no answer event. bodyLen=${(xhr.responseText || "").length}`,
        });
      }
      finish(true);
    };
    // Network-level failure. If NOTHING was emitted yet, treat it as "XHR didn't
    // work here" and let the caller retry via fetch. But once we've already
    // streamed events to the UI, falling back would re-POST the whole question —
    // burning a second quota slot + LLM call, and appending a duplicate answer on
    // top of the partial one. So mid-stream drops surface as an error instead.
    const failed = (detail: string) => {
      if (emitted) {
        onError({ type: "generic", detail });
        finish(true);
      } else {
        finish(false);
      }
    };
    xhr.onerror = () => failed("stream interrupted");
    xhr.ontimeout = () => failed("stream timed out");
    xhr.onabort = () => failed("stream aborted");

    try {
      xhr.send(body);
    } catch {
      finish(false);
    }
  });
}

export async function streamChat(
  messages: { role: string; content: string }[],
  onStatus: (text: string) => void,
  onAnswer: (data: { content: string; links: { label: string; href: string }[]; citations: Citation[] }) => void,
  onError: (reason?: StreamChatErrorReason) => void,
  onDelta?: (text: string) => void,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authToken = getStoredAuthToken();
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  } else if (typeof window !== "undefined") {
    headers["x-anon-id"] = getOrCreateAnonId();
  }

  // Ask Hiqmah is an online, server-backed feature — fail clearly when offline
  // instead of throwing a generic "something went wrong".
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    onError({ type: "offline" });
    return;
  }

  const url = `${getApiBaseUrl()}/api/search`;
  const payload = JSON.stringify({ messages });

  // Parse one SSE "event:/data:" block and fire the matching callback. Returns
  // the event name it ACTUALLY dispatched (null if none) — callers use that to
  // decide whether a real answer arrived. Deliberately not a regex test on the
  // caller's side: a stream cut mid-`answer` still has a complete "event: answer"
  // line, but its JSON won't parse, so a regex would report success for an answer
  // that was never delivered.
  const handlePart = (part: string): string | null => {
    if (!part.trim()) return null;
    const eventMatch = part.match(/^event:\s*(.+)$/m);
    const dataMatch = part.match(/^data:\s*(.+)$/m);
    if (!eventMatch || !dataMatch) return null;
    const event = eventMatch[1].trim();
    try {
      const data = JSON.parse(dataMatch[1]);
      if (event === "status") onStatus(data.text);
      else if (event === "delta") onDelta?.(data.text);
      else if (event === "answer") onAnswer(data);
      else if (event === "error") onError({ type: "generic" });
      else return null;
      return event;
    } catch {
      // Malformed / truncated event — not dispatched.
      return null;
    }
  };

  const isNative =
    typeof window !== "undefined" && !!window.Capacitor?.isNativePlatform?.();

  // Native: stream via XHR (WKWebView delivers responseText incrementally).
  // Returns false only if XHR itself failed — then we fall through to fetch.
  if (isNative) {
    const handled = await streamChatNative(url, headers, payload, handlePart, onError);
    if (handled) return;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: payload,
    });
  } catch (e) {
    onError({
      type: "generic",
      detail: `fetch threw → ${url} :: ${e instanceof Error ? e.message : String(e)}`,
    });
    return;
  }

  if (res.status === 429) {
    try {
      const body = await res.json();
      if (body?.error === "quota_exceeded" && body?.quota) {
        onError({ type: "quota_exceeded", quota: body.quota });
        return;
      }
    } catch {
      // fall through to generic
    }
    onError({ type: "generic", detail: "HTTP 429 (rate/quota)" });
    return;
  }

  if (!res.ok) {
    onError({ type: "generic", detail: `HTTP ${res.status} from ${url}` });
    return;
  }

  // iOS/Android WKWebView can't reliably read a streaming fetch body for SSE
  // (res.body is often null or never delivers incrementally), so `fetch` there
  // used to mean waiting for the ENTIRE answer before anything appeared. This
  // path is now only the fallback — native streams via XHR above (see
  // streamChatNative), which does deliver incrementally in WKWebView.
  if (!res.body) {
    let text = "";
    try {
      text = await res.text();
    } catch (e) {
      onError({
        type: "generic",
        detail: `res.text() threw :: ${e instanceof Error ? e.message : String(e)}`,
      });
      return;
    }
    // Derive `answered` from what was actually DISPATCHED, not from a regex on
    // the raw text: a body cut mid-`answer` still contains a complete
    // "event: answer" line whose JSON won't parse.
    let answered = false;
    for (const part of text.split("\n\n")) {
      if (handlePart(part) === "answer") answered = true;
    }
    if (!answered) {
      onError({
        type: "generic",
        detail: `no answer event. bodyLen=${text.length} body="${text.slice(0, 220)}"`,
      });
    }
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answered = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    for (const part of parts) {
      if (handlePart(part) === "answer") answered = true;
    }
  }
  // Flush any trailing buffered event
  if (buffer.trim() && handlePart(buffer) === "answer") answered = true;
  // A stream that ended without delivering an answer must surface an error —
  // otherwise the caller's spinner never clears.
  if (!answered) {
    onError({ type: "generic", detail: "stream ended without an answer event" });
  }
}

// ── Placeholder questions ─────────────────────────────────────────────────

const placeholderQuestions = [
  "What is Islam?",
  "What dua do I make when breaking my fast?",
  "When does Ramadan start?",
  "Who was Prophet Musa?",
  "How do I pray Salah?",
  "What are the pillars of Islam?",
  "Tell me about Jannah",
  "What is Tawheed?",
  "What are the signs of the Day of Judgement?",
  "What happens in the grave?",
  "How did Prophet Muhammad ﷺ pray at night?",
  "What is the Quran about?",
  "What are the 99 Names of Allah?",
  "How do I make wudu?",
  "What is the story of Prophet Ibrahim?",
  "What does the Quran say about patience?",
  "What is Laylatul Qadr?",
  "How do I increase my iman?",
  "What are the rights of parents in Islam?",
  "What is the punishment of the grave?",
  "Who are the angels in Islam?",
  "What is Surah Al-Kahf about?",
  "What dua do I say before sleeping?",
  "What are the Sunnahs of eating?",
  "How do I perform Hajj?",
];

/* ─── Inline search bar (for home page) ─── */

export function AskHiqmahInline({ onOpen }: { onOpen: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    if (query) return;

    const question = placeholderQuestions[placeholderIdx];
    let charIdx = 0;
    let isDeleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const type = () => {
      if (!isDeleting) {
        if (charIdx <= question.length) {
          setPlaceholderText(question.slice(0, charIdx));
          charIdx++;
          timer = setTimeout(type, 40 + Math.random() * 30);
        } else {
          timer = setTimeout(() => { isDeleting = true; type(); }, 2000);
        }
      } else {
        if (charIdx > 0) {
          charIdx--;
          setPlaceholderText(question.slice(0, charIdx));
          timer = setTimeout(type, 20);
        } else {
          setPlaceholderIdx((prev) => (prev + 1) % placeholderQuestions.length);
        }
      }
    };

    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [placeholderIdx, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onOpen(query.trim());
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="card-bg rounded-xl border sidebar-border flex items-center gap-3 px-4 py-3 focus-within:border-[var(--color-gold)]/40 transition-colors">
        <Search size={18} className="text-themed-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholderText || "Ask anything about Islam..."}
          className="flex-1 bg-transparent text-themed text-sm outline-none placeholder:text-themed-muted/50"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="p-1.5 rounded-lg bg-gold/20 text-gold hover:bg-gold/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </form>
  );
}

/* ─── Floating chat panel (global, in AppShell) ─── */

export default function AskHiqmahFloat({ accountLabel }: { accountLabel?: string } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  // Separate from `loading`, which onDelta clears the moment the first token
  // lands. A report filed between that moment and the final answer event
  // carries truncated text, and the moderator has to be told so — otherwise
  // they judge the model on a sentence it never finished writing.
  const [streaming, setStreaming] = useState(false);
  const [statusText, setStatusText] = useState("Thinking...");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMessages(loadMessages());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveMessages(messages);
  }, [messages, hydrated]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setMessages(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Inline-confirm arming for Clear chat (CirclesScreen leave/remove idiom):
  // first tap arms the button ("Clear?"), the second executes; auto-disarms.
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (query || !isOpen) return;

    const question = placeholderQuestions[placeholderIdx];
    let charIdx = 0;
    let isDeleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const type = () => {
      if (!isDeleting) {
        if (charIdx <= question.length) {
          setPlaceholderText(question.slice(0, charIdx));
          charIdx++;
          timer = setTimeout(type, 40 + Math.random() * 30);
        } else {
          timer = setTimeout(() => { isDeleting = true; type(); }, 2000);
        }
      } else {
        if (charIdx > 0) {
          charIdx--;
          setPlaceholderText(question.slice(0, charIdx));
          timer = setTimeout(type, 20);
        } else {
          setPlaceholderIdx((prev) => (prev + 1) % placeholderQuestions.length);
        }
      }
    };

    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [placeholderIdx, query, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setTimeout(() => messagesEndRef.current?.scrollIntoView(), 50);
    }
  }, [isOpen]);

  // Disarm the Clear confirm if the second tap never comes.
  useEffect(() => {
    if (!confirmClear) return;
    const t = setTimeout(() => setConfirmClear(false), 3000);
    return () => clearTimeout(t);
  }, [confirmClear]);

  // Auto-grow the composer with its content, up to ~5 lines, then scroll
  // internally (CircleChatSheet composer idiom).
  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [query, autoResize]);

  const sendMessage = useCallback(async (userMessage: string, prevMessages: Message[]) => {
    const newMessages: Message[] = [...prevMessages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);
    setStreaming(false);
    setStatusText("Thinking...");

    let streamed = "";
    try {
      await streamChat(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        (status) => setStatusText(status),
        (data) => {
          setMessages([...newMessages, {
            role: "assistant",
            content: data.content,
            links: data.links,
            citations: data.citations,
          }]);
          setLoading(false);
          setStreaming(false);
        },
        (reason) => {
          let content = "I apologize, I was unable to process your question. Please try again.";
          if (reason?.type === "offline") {
            content = "You're offline. Ask Hiqmah needs an internet connection to answer — reading the Quran, hadith, and the rest of the app still works offline.";
          } else if (reason?.type === "quota_exceeded") {
            const q = reason.quota;
            const resetTxt = formatQuotaReset(q.resetAt);
            const signedIn = !!getStoredAuthToken();
            const upgradeNote = signedIn
              ? "Upgrade to Hiqmah Plus for unlimited (coming soon)."
              : "[Sign in](/signin) for +5 bonus questions today.";
            content = `You've used your ${q.limit} free questions for the day. Next slot opens in ${resetTxt}.\n\n${upgradeNote}`;
          }
          setMessages([...newMessages, { role: "assistant", content }]);
          setLoading(false);
          setStreaming(false);
        },
        // onDelta — live token streaming (web). The final `answer` event then
        // replaces this with the cleaned content + citations/links.
        (deltaText) => {
          streamed += deltaText;
          setLoading(false);
          setStreaming(true);
          setMessages([...newMessages, { role: "assistant", content: streamed }]);
        },
      );
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "I apologize, I was unable to process your question. Please try again.",
      }]);
      setLoading(false);
      setStreaming(false);
    }
  }, []);

  const openWithQuery = useCallback((q: string) => {
    setIsOpen(true);
    sendMessage(q, messages);
  }, [messages, sendMessage]);

  const openPanel = useCallback(() => { setIsOpen(true); }, []);
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__askHiqmah = openWithQuery;
    w.__openHiqmah = openPanel;
    return () => { delete w.__askHiqmah; delete w.__openHiqmah; };
  }, [openWithQuery, openPanel]);

  const submitQuery = () => {
    if (!query.trim() || loading) return;
    const q = query.trim();
    setQuery("");
    sendMessage(q, messages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery();
  };

  const handleClose = () => setIsOpen(false);
  // Inline confirm (no window.confirm): first tap arms the button ("Clear?"),
  // the second executes.
  const handleClear = () => {
    if (confirmClear) {
      setConfirmClear(false);
      setMessages([]);
      setQuery("");
    } else {
      setConfirmClear(true);
    }
  };

  const handlePopOut = () => {
    window.open("/ask", "hiqmah-chat", "width=440,height=650,menubar=no,toolbar=no,location=no,status=no");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-4 z-50 lg:hidden p-3.5 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/40 text-[#3b82f6] hover:bg-[#2563eb]/30 transition-colors shadow-lg shadow-black/20"
            title="Ask Hiqmah"
          >
            <MessageCircleQuestion size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-0 left-0 right-0 lg:bottom-6 lg:right-6 lg:left-auto lg:w-[420px] z-50 flex flex-col max-h-[85vh] lg:max-h-[600px] lg:rounded-xl rounded-t-xl overflow-hidden border sidebar-border shadow-2xl shadow-black/30 max-w-[100vw]"
              style={{ background: "var(--color-sidebar)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b sidebar-border shrink-0">
                <div className="flex items-center gap-2">
                  <MessageCircleQuestion size={14} className="text-[#3b82f6]" />
                  <span className="text-sm font-semibold text-[#3b82f6] tracking-wide">
                    Ask Hiqmah
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      onClick={handleClear}
                      aria-label={confirmClear ? "Confirm clear chat" : "Clear chat"}
                      title={confirmClear ? "Confirm clear chat" : "Clear chat"}
                      className={
                        confirmClear
                          ? "px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-300 bg-red-500/15 border border-red-400/30 transition-colors"
                          : "p-1.5 rounded-lg hover:bg-[var(--overlay-medium)] text-themed-muted/50 hover:text-themed-muted transition-colors"
                      }
                    >
                      {confirmClear ? "Clear?" : <Trash2 size={14} />}
                    </button>
                  )}
                  <button
                    onClick={handlePopOut}
                    className="p-1.5 rounded-lg hover:bg-[var(--overlay-medium)] text-themed-muted/50 hover:text-themed-muted transition-colors hidden lg:block"
                    title="Open in new window"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg hover:bg-[var(--overlay-medium)] text-themed-muted hover:text-themed transition-colors"
                    title="Minimize"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 min-h-0">
                {messages.length === 0 && (
                  <div className="py-6">
                    <div className="bg-[var(--color-gold)]/10 text-themed border border-[var(--color-gold)]/20 rounded-xl px-4 py-3 text-sm leading-relaxed max-w-[90%]">
                      <p className="font-medium">Assalāmu ʿalaykum 👋</p>
                      <p className="mt-1 text-themed">
                        I&apos;m Hiqmah. Ask me anything about Islam — the Qur&apos;an, hadith, the Prophets, prayer, and more. I&apos;ll explain it in context and point you to authentic sources.
                      </p>
                      <p className="mt-2 text-themed-muted text-xs">
                        I&apos;m a study aid, not a mufti — for personal rulings, please consult a qualified scholar.
                      </p>
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[var(--color-accent)]/20 text-themed border border-[var(--color-accent)]/30"
                          : "bg-[var(--color-gold)]/10 text-themed border border-[var(--color-gold)]/20"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words overflow-hidden">{renderMarkdown(msg.content)}</div>

                      {/* Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.citations.map((c, j) => (
                            <CitationCard key={j} citation={c} onNavigate={handleClose} />
                          ))}
                        </div>
                      )}

                      {/* Links */}
                      {msg.links && msg.links.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.links.map((link, j) => (
                            <Link
                              key={j}
                              href={link.href}
                              onClick={handleClose}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 border border-gold/30 text-gold text-xs font-medium hover:bg-gold/25 transition-colors"
                            >
                              {link.label} →
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Copy + report. Report is LEFT of Copy so Copy stays
                          pinned to the bubble's right edge exactly where it has
                          always been — moving it would break muscle memory for a
                          control everyone uses, to make room for one almost
                          nobody will. */}
                      {msg.role === "assistant" && (
                        <div className="mt-2 flex justify-end gap-1">
                          <ReportButton
                            answer={msg.content}
                            question={messages[i - 1]?.role === "user" ? messages[i - 1].content : undefined}
                            partial={streaming && i === messages.length - 1}
                            accountLabel={accountLabel}
                            surface="ask-float"
                          />
                          <CopyButton text={msg.content} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 rounded-xl px-4 py-3 text-sm text-themed-muted flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-[#3b82f6]" />
                      {statusText}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="border-t sidebar-border p-3 shrink-0 safe-area-bottom">
                <div className="flex items-end gap-2 min-w-0">
                  <textarea
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      // Enter sends, Shift+Enter inserts a newline (CircleChatSheet idiom).
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitQuery();
                      }
                    }}
                    rows={1}
                    placeholder={placeholderText || "Ask anything about Islam..."}
                    className="flex-1 min-w-0 resize-none max-h-[140px] overflow-y-auto bg-[var(--color-card)] rounded-lg px-3 py-2.5 text-themed text-base outline-none border sidebar-border focus:border-[#3b82f6]/40 transition-colors placeholder:text-themed-muted/50"
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || loading}
                    className="p-2.5 rounded-lg bg-[#2563eb]/20 text-[#3b82f6] hover:bg-[#2563eb]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
