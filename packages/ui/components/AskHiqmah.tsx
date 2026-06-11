"use client";

import { useState, useEffect, useRef, useCallback, Fragment, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, Send, Loader2, X, MessageCircleQuestion, Trash2, ExternalLink, Copy, Check, BookOpen, BookMarked } from "lucide-react";
import { getOrCreateAnonId, getStoredAuthToken } from "../lib/anon-id";

declare global {
  interface Window {
    Capacitor?: { isNativePlatform?: () => boolean };
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

// ── SSE stream consumer ───────────────────────────────────────────────────

export type QuotaInfo = {
  used: number;
  limit: number;
  resetAt: string | null;
  hasBonus: boolean;
};

export type StreamChatErrorReason =
  | { type: "quota_exceeded"; quota: QuotaInfo }
  | { type: "generic" };

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

function getApiBaseUrl(): string {
  const isNative =
    typeof window !== "undefined" &&
    !!window.Capacitor?.isNativePlatform?.();
  if (isNative) {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "https://hiddenhiqmah.com";
  }
  return ""; // relative on web
}

export async function streamChat(
  messages: { role: string; content: string }[],
  onStatus: (text: string) => void,
  onAnswer: (data: { content: string; links: { label: string; href: string }[]; citations: Citation[] }) => void,
  onError: (reason?: StreamChatErrorReason) => void,
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

  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/search`, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages }),
    });
  } catch {
    onError({ type: "generic" });
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
    onError({ type: "generic" });
    return;
  }

  if (!res.ok || !res.body) {
    onError({ type: "generic" });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      if (!part.trim()) continue;
      const eventMatch = part.match(/^event:\s*(.+)$/m);
      const dataMatch = part.match(/^data:\s*(.+)$/m);
      if (!eventMatch || !dataMatch) continue;

      const event = eventMatch[1].trim();
      try {
        const data = JSON.parse(dataMatch[1]);
        switch (event) {
          case "status":
            onStatus(data.text);
            break;
          case "answer":
            onAnswer(data);
            break;
          case "error":
            onError({ type: "generic" });
            break;
        }
      } catch {
        // Skip malformed events
      }
    }
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

export default function AskHiqmahFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const sendMessage = useCallback(async (userMessage: string, prevMessages: Message[]) => {
    const newMessages: Message[] = [...prevMessages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);
    setStatusText("Thinking...");

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
        },
        (reason) => {
          let content = "I apologize, I was unable to process your question. Please try again.";
          if (reason?.type === "quota_exceeded") {
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
        },
      );
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "I apologize, I was unable to process your question. Please try again.",
      }]);
      setLoading(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    const q = query.trim();
    setQuery("");
    sendMessage(q, messages);
  };

  const handleClose = () => setIsOpen(false);
  const handleClear = () => { setMessages([]); setQuery(""); };

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
                      className="p-1.5 rounded-lg hover:bg-white/10 text-themed-muted/50 hover:text-themed-muted transition-colors"
                      title="Clear chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={handlePopOut}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-themed-muted/50 hover:text-themed-muted transition-colors hidden lg:block"
                    title="Open in new window"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-themed-muted hover:text-themed transition-colors"
                    title="Minimize"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 min-h-0">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircleQuestion size={24} className="text-[#3b82f6]/30 mx-auto mb-3" />
                    <p className="text-themed-muted text-sm">
                      Ask any question about Islam
                    </p>
                    <p className="text-themed-muted/50 text-xs mt-1">
                      Powered by authentic sources
                    </p>
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

                      {/* Copy button for assistant messages */}
                      {msg.role === "assistant" && (
                        <div className="mt-2 flex justify-end">
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
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholderText || "Ask anything about Islam..."}
                    className="flex-1 min-w-0 bg-[var(--color-card)] rounded-lg px-3 py-2.5 text-themed text-base outline-none border sidebar-border focus:border-[#3b82f6]/40 transition-colors placeholder:text-themed-muted/50"
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
