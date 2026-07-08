"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Loader2, MessageCircleQuestion, Trash2 } from "lucide-react";
import {
  STORAGE_KEY,
  loadMessages,
  saveMessages,
  streamChat,
  streamChatErrorMessage,
  renderMarkdown,
  CitationCard,
  CopyButton,
} from "@hidden-hiqmah/ui/components/AskHiqmah";
import type { Message } from "@hidden-hiqmah/ui/components/AskHiqmah";
import { useAuth } from "@/context/AuthContext";

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

// Rendered as the first assistant bubble in the thread. Kept OUT of the
// `messages` state so it is never persisted, never sent to the API, and never
// counted as a real turn — it is purely a welcome message. Built at runtime so
// it can greet the signed-in user by name (falls back to the plain greeting).
function buildGreeting(firstName?: string): string {
  const salaam = firstName
    ? `**Assalāmu ʿalaykum, ${firstName} 👋**`
    : "**Assalāmu ʿalaykum 👋**";
  return `${salaam}\n\nAsk me anything about Islam — the Qur'an, hadith, the Prophets, fiqh, and more.\n\nAnswers draw on authentic sources, but I'm a study aid — not a substitute for a qualified scholar.`;
}

export default function AskPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("Thinking...");
  const [hydrated, setHydrated] = useState(false);
  const [autoSend, setAutoSend] = useState<string | null>(null);
  const autoSentRef = useRef(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const meta = (user?.user_metadata ?? {}) as {
    first_name?: string;
    full_name?: string;
    name?: string;
  };
  const firstName = (
    meta.first_name ||
    (meta.full_name || meta.name || "").split(" ")[0] ||
    ""
  ).trim();
  const greeting = buildGreeting(firstName);

  useEffect(() => {
    setMessages(loadMessages());
    setHydrated(true);
    // Prefill from ?q= (e.g. the Qur'an "ask the tutor about this word" deep-link);
    // when the deep-link adds &submit=1, auto-send it instead of only prefilling.
    let q = "";
    let submit = false;
    try {
      const sp = new URLSearchParams(window.location.search);
      q = sp.get("q") || "";
      submit = sp.get("submit") === "1";
    } catch {
      /* ignore */
    }
    if (q && submit) setAutoSend(q);
    else if (q) setQuery(q);
    else inputRef.current?.focus();
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
          setMessages([...newMessages, {
            role: "assistant",
            content: streamChatErrorMessage(reason),
          }]);
          setLoading(false);
        },
      );
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: streamChatErrorMessage(),
      }]);
      setLoading(false);
    }
  }, []);

  // Fire the deep-link's auto-submit exactly once, after localStorage messages
  // have hydrated (the ref guard also blocks React 18 StrictMode double-invoke).
  useEffect(() => {
    if (!hydrated || !autoSend || autoSentRef.current) return;
    autoSentRef.current = true;
    setAutoSend(null);
    sendMessage(autoSend, messages);
  }, [hydrated, autoSend, messages, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    const q = query.trim();
    setQuery("");
    sendMessage(q, messages);
  };

  const handleLinkClick = (href: string) => {
    const isNative =
      typeof window !== "undefined" && !!window.Capacitor?.isNativePlatform?.();
    if (isNative) {
      // In the mobile app, navigate the in-app router. MobileShell closes the
      // Ask sheet automatically on route change.
      router.push(href);
      return;
    }
    // Web popup (/ask opened as a window): drive the opener if present.
    if (window.opener && !window.opener.closed) {
      window.opener.location.href = href;
      window.opener.focus();
    } else {
      router.push(href);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b sidebar-border shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion size={16} className="text-[#3b82f6]" />
          <span className="text-base font-semibold text-[#3b82f6] tracking-wide">
            Ask Hiqmah
          </span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setQuery(""); }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-themed-muted/50 hover:text-themed-muted transition-colors"
              title="Clear chat"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-4 min-h-0">
        {/* Greeting rendered as the first assistant bubble. It lives outside
            `messages`, so it is never saved, sent to the API, or counted as a turn. */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex justify-start"
        >
          <div className="max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed bg-[var(--color-gold)]/10 text-themed border border-[var(--color-gold)]/20">
            <div className="whitespace-pre-wrap break-words overflow-hidden">
              {renderMarkdown(greeting)}
            </div>
          </div>
        </motion.div>
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
                    <div key={j} onClick={() => handleLinkClick(c.href)} className="cursor-pointer">
                      <CitationCard citation={c} />
                    </div>
                  ))}
                </div>
              )}

              {/* Links */}
              {msg.links && msg.links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.links.map((link, j) => (
                    <button
                      key={j}
                      onClick={() => handleLinkClick(link.href)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 border border-gold/30 text-gold text-xs font-medium hover:bg-gold/25 transition-colors cursor-pointer"
                    >
                      {link.label} →
                    </button>
                  ))}
                </div>
              )}

              {/* Copy button */}
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
      <form
        onSubmit={handleSubmit}
        className="ask-composer border-t sidebar-border p-4 shrink-0"
      >
        <div className="flex items-center gap-3 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholderText || "Ask anything about Islam..."}
            className="flex-1 min-w-0 bg-[var(--color-card)] rounded-lg px-4 py-3 text-themed text-base outline-none border sidebar-border focus:border-[#3b82f6]/40 transition-colors placeholder:text-themed-muted/50"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="p-3 rounded-lg bg-[#2563eb]/20 text-[#3b82f6] hover:bg-[#2563eb]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
