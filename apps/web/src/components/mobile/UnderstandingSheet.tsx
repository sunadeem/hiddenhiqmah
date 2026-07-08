"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircleQuestion, ChevronRight } from "lucide-react";

type Word = { t: string; tr: string; m: string };
type Morph = { root: string | null; lemma: string | null; pos: string };
type RootInfo = { count: number; occ: string[] };
type Depth = "new" | "student" | "scholar";

const DEPTH_KEY = "hiqmah-understand-depth";
const DEPTHS: { value: Depth; label: string }[] = [
  { value: "new", label: "New" },
  { value: "student", label: "Student" },
  { value: "scholar", label: "Scholar" },
];

export default function UnderstandingSheet({
  open,
  onClose,
  surah,
  verseNumber,
  wordIdx,
  word,
}: {
  open: boolean;
  onClose: () => void;
  surah: number;
  verseNumber: number;
  wordIdx: number;
  word: Word | null;
}) {
  const router = useRouter();
  const [morph, setMorph] = useState<Morph | null>(null);
  const [rootInfo, setRootInfo] = useState<RootInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState<Depth>("new");

  useEffect(() => {
    try {
      const d = localStorage.getItem(DEPTH_KEY) as Depth | null;
      if (d) setDepth(d);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open || word == null) return;
    let alive = true;
    setMorph(null);
    setRootInfo(null);
    setLoading(true);
    (async () => {
      try {
        const m = (
          await import(`@hidden-hiqmah/content/quran/morphology/${surah}.json`)
        ).default as Record<string, Morph[]>;
        if (!alive) return;
        const mw = m[String(verseNumber)]?.[wordIdx] ?? null;
        setMorph(mw);
        if (mw?.root) {
          const roots = (await import("@hidden-hiqmah/content/quran/roots.json"))
            .default as Record<string, RootInfo>;
          if (!alive) return;
          setRootInfo(roots[mw.root] ?? null);
        }
      } catch {
        /* leave nulls */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, surah, verseNumber, wordIdx, word]);

  const pickDepth = (d: Depth) => {
    setDepth(d);
    try {
      localStorage.setItem(DEPTH_KEY, d);
    } catch {
      /* ignore */
    }
  };

  const askTutor = () => {
    if (!word) return;
    const q = `What does the word "${word.t}" (${word.tr}) mean in Surah ${surah}, ayah ${verseNumber}? Explain its root and how it's used here.`;
    onClose();
    // submit=1 tells /ask to auto-send the question, not just prefill the input.
    router.push(`/ask?q=${encodeURIComponent(q)}&submit=1`);
  };

  const showStudent = depth === "student" || depth === "scholar";
  const showScholar = depth === "scholar";

  return (
    <AnimatePresence>
      {open && word && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50" />
          <motion.div
            className="relative card-bg border-t sidebar-border rounded-t-3xl max-h-[85%] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mt-2.5 mb-1 h-1 w-10 rounded-full bg-[var(--overlay-strong)]" />

            {/* Word header */}
            <div className="flex items-start gap-3 px-5 pt-3 pb-4">
              <div className="flex-1 min-w-0">
                <p dir="rtl" className="font-arabic text-gold text-3xl leading-tight">
                  {word.t}
                </p>
                <p className="text-themed-muted text-sm mt-1">{word.tr}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center text-themed-muted bg-[var(--overlay-subtle)] shrink-0"
              >
                <X size={17} />
              </button>
            </div>

            <div className="px-5 space-y-4">
              {/* Meaning */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-1">
                  Meaning
                </p>
                <p className="text-themed text-base leading-relaxed">{word.m || "—"}</p>
              </div>

              {/* Root + occurrences */}
              {morph?.root ? (
                <div className="rounded-2xl border sidebar-border bg-[var(--overlay-subtle)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-1">
                        Root
                      </p>
                      <p dir="rtl" className="font-arabic text-gold text-2xl tracking-[0.15em]">
                        {morph.root.split("").join(" ")}
                      </p>
                    </div>
                    {rootInfo && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-themed leading-none">
                          {rootInfo.count}
                        </p>
                        <p className="text-[11px] text-themed-muted mt-0.5">times in the Qur&apos;an</p>
                      </div>
                    )}
                  </div>

                  {/* Occurrences (Scholar) */}
                  {showScholar && rootInfo && rootInfo.occ.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--overlay-medium)]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-2">
                        Some occurrences
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {rootInfo.occ.slice(0, 10).map((loc) => {
                          const [s, a] = loc.split(":");
                          return (
                            <button
                              key={loc}
                              onClick={() => {
                                router.push(`/quran/${s}?v=${a}`);
                                onClose();
                              }}
                              className="text-xs font-medium text-gold rounded-full border border-[var(--color-gold)]/30 px-2.5 py-1"
                            >
                              {s}:{a}
                            </button>
                          );
                        })}
                        {rootInfo.occ.length > 10 && (
                          <span className="text-xs text-themed-muted px-1 py-1">
                            +{rootInfo.occ.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                !loading && (
                  <p className="text-themed-muted text-sm">
                    This is a particle (no root) — {morph?.pos || "grammatical word"}.
                  </p>
                )
              )}

              {/* Grammar (Student+) */}
              {showStudent && morph && (morph.lemma || morph.pos) && (
                <div className="grid grid-cols-2 gap-3">
                  {morph.pos && (
                    <div className="rounded-xl border sidebar-border bg-[var(--overlay-subtle)] p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-1">
                        Part of speech
                      </p>
                      <p className="text-themed text-sm capitalize">{morph.pos}</p>
                    </div>
                  )}
                  {morph.lemma && (
                    <div className="rounded-xl border sidebar-border bg-[var(--overlay-subtle)] p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-1">
                        Lemma
                      </p>
                      <p dir="rtl" className="font-arabic text-gold text-lg">{morph.lemma}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Ask the tutor */}
              <button
                onClick={askTutor}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2563eb]/15 border border-[#3b82f6]/30 text-[#3b82f6] font-semibold py-3 touch-manipulation active:bg-[#2563eb]/25"
              >
                <MessageCircleQuestion size={17} /> Ask the tutor about this word
                <ChevronRight size={15} />
              </button>

              {/* Depth toggle */}
              <div className="pt-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-2 text-center">
                  Explain like I&apos;m
                </p>
                <div className="flex bg-[var(--overlay-medium)] rounded-xl p-1 gap-1">
                  {DEPTHS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => pickDepth(d.value)}
                      className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${
                        depth === d.value ? "bg-[var(--color-gold)]/18 text-gold" : "text-themed-muted"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-2" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
