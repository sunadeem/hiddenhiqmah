"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, Send, Loader2, X, Sparkles, Trash2, ExternalLink } from "lucide-react";

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
];

type Message = {
  role: "user" | "assistant";
  content: string;
  links?: { label: string; href: string }[];
};

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

export default function AskHiqmahFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    setMessages(loadMessages());
    setHydrated(true);
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (hydrated) saveMessages(messages);
  }, [messages, hydrated]);

  // Sync across windows via storage event
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

  // Animated placeholder
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

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = useCallback(async (userMessage: string, prevMessages: Message[]) => {
    const newMessages: Message[] = [...prevMessages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages([...newMessages, {
        role: "assistant",
        content: data.content,
        links: data.links,
      }]);
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "I apologize, I was unable to process your question. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Allow opening with a pre-filled query (from home page inline search)
  const openWithQuery = useCallback((q: string) => {
    setIsOpen(true);
    sendMessage(q, messages);
  }, [messages, sendMessage]);

  // Expose functions globally
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

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClear = () => {
    setMessages([]);
    setQuery("");
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
            className="fixed bottom-24 right-4 z-50 lg:hidden p-3.5 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/40 text-[#3b82f6] hover:bg-[#2563eb]/30 transition-colors shadow-lg shadow-black/20"
            title="Ask Hiqmah"
          >
            <Sparkles size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
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
              className="fixed bottom-0 left-0 right-0 lg:bottom-6 lg:right-6 lg:left-auto lg:w-[420px] z-50 flex flex-col max-h-[85vh] lg:max-h-[600px] lg:rounded-xl rounded-t-xl overflow-hidden border sidebar-border shadow-2xl shadow-black/30"
              style={{ background: "var(--color-sidebar)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b sidebar-border shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#3b82f6]" />
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles size={24} className="text-[#3b82f6]/30 mx-auto mb-3" />
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
                      <p className="whitespace-pre-wrap">{msg.content}</p>
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
                      Thinking...
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="border-t sidebar-border p-3 shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholderText || "Ask anything about Islam..."}
                    className="flex-1 bg-[var(--color-card)] rounded-lg px-3 py-2.5 text-themed text-sm outline-none border sidebar-border focus:border-[#3b82f6]/40 transition-colors placeholder:text-themed-muted/50"
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
