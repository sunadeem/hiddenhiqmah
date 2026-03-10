"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Sparkles, Trash2 } from "lucide-react";
import {
  STORAGE_KEY,
  loadMessages,
  saveMessages,
} from "@/components/AskHiqmah";

type Message = {
  role: "user" | "assistant";
  content: string;
  links?: { label: string; href: string }[];
};

const placeholderQuestions = [
  "What is Islam?",
  "What dua do I make when breaking my fast?",
  "Who was Prophet Musa?",
  "How do I pray Salah?",
  "What are the pillars of Islam?",
  "Tell me about Jannah",
  "What happens in the grave?",
];

export default function AskPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    setMessages(loadMessages());
    setHydrated(true);
    inputRef.current?.focus();
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (hydrated) saveMessages(messages);
  }, [messages, hydrated]);

  // Sync across windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setMessages(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Animated placeholder
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

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      if (!res.ok) throw new Error("Failed");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    const q = query.trim();
    setQuery("");
    sendMessage(q, messages);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b sidebar-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#3b82f6]" />
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
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <Sparkles size={32} className="text-[#3b82f6]/20 mx-auto mb-4" />
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
                    <button
                      key={j}
                      onClick={() => {
                        if (window.opener && !window.opener.closed) {
                          window.opener.location.href = link.href;
                          window.opener.focus();
                        } else {
                          window.open(link.href, "_blank");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 border border-gold/30 text-gold text-xs font-medium hover:bg-gold/25 transition-colors cursor-pointer"
                    >
                      {link.label} →
                    </button>
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
      <form onSubmit={handleSubmit} className="border-t sidebar-border p-4 shrink-0">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholderText || "Ask anything about Islam..."}
            className="flex-1 bg-[var(--color-card)] rounded-lg px-4 py-3 text-themed text-sm outline-none border sidebar-border focus:border-[#3b82f6]/40 transition-colors placeholder:text-themed-muted/50"
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
