"use client";

// Practice — grade-less free drill. Pick any portion you already carry (any
// non-locked station), loop the reciter (AudioAssistedPlayer), and fade the
// words down through Full → Letters → Anchors with a hold-to-peek reveal. This
// screen NEVER calls path.actions.grade and has NO grade buttons, so nothing
// here can touch the SRS schedule — the pinned banner makes that promise
// literal. Grades live only inside Review.

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { HifzPath } from "@/lib/hifz/useHifzPath";
import type { HifzCard } from "@hidden-hiqmah/ui/lib/hifz/types";
import { resolveCardContent, type ResolvedContent } from "@/lib/hifz/hifzContent";
import AudioAssistedPlayer from "./AudioAssistedPlayer";
import { hapticLight, hapticSelection } from "@/lib/mobile/haptics";

export type HifzView =
  | "onboarding"
  | "today"
  | "review"
  | "learn"
  | "practice"
  | "path"
  | "milestone";

export interface HifzScreenProps {
  path: HifzPath;
  nav: (view: HifzView, params?: unknown) => void;
}

// Fade rungs — a visual drill applied as a soft blur over the recited text. The
// reciter keeps playing at every stage; hold-to-peek clears the blur while held.
const STAGES = [
  { key: "full", label: "Full", blur: 0, opacity: 1, hint: "Read and recite along" },
  { key: "letters", label: "Letters", blur: 3.5, opacity: 0.82, hint: "Softened — lean on memory" },
  { key: "anchors", label: "Anchors", blur: 8, opacity: 0.55, hint: "Only the shape remains" },
] as const;

export default function Practice({ path, nav }: HifzScreenProps) {
  // Everything you carry — anything not still locked is fair game to drill.
  const carried = useMemo(
    () => path.stations.filter((s) => s.status !== "locked"),
    [path.stations]
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Default to where you are now (if learnable), else the first carried portion.
  useEffect(() => {
    if (selectedKey && carried.some((s) => s.key === selectedKey)) return;
    const cur =
      path.currentStation && path.currentStation.status !== "locked"
        ? path.currentStation.key
        : null;
    setSelectedKey(cur ?? carried[0]?.key ?? null);
  }, [carried, path.currentStation, selectedKey]);

  const selected = useMemo(
    () => carried.find((s) => s.key === selectedKey) ?? null,
    [carried, selectedKey]
  );

  // Resolve the selected station's full range → āyāt (or Names) for display.
  const [content, setContent] = useState<ResolvedContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (!selected) {
      setContent(null);
      return;
    }
    const first = path.cards.find((c) => c.id === selected.cardIds[0]);
    if (!first) {
      setContent(null);
      return;
    }
    // Build a pseudo-card covering the whole station range, then resolve it — so a
    // multi-card station drills as one continuous portion.
    const pseudo: HifzCard = {
      ...first,
      label: selected.label,
      startSurah: selected.startSurah,
      startAyah: selected.startAyah,
      endSurah: selected.endSurah,
      endAyah: selected.endAyah,
    };
    let alive = true;
    setLoadingContent(true);
    resolveCardContent(pseudo)
      .then((c) => {
        if (alive) {
          setContent(c);
          setLoadingContent(false);
        }
      })
      .catch(() => {
        if (alive) {
          setContent(null);
          setLoadingContent(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [selected, path.cards]);

  // Fade + peek state — reset whenever the portion changes.
  const [stageIdx, setStageIdx] = useState(0);
  const [peeking, setPeeking] = useState(false);
  useEffect(() => {
    setStageIdx(0);
    setPeeking(false);
  }, [selectedKey]);

  const stage = STAGES[stageIdx];
  const activeBlur = peeking ? 0 : stage.blur;
  const activeOpacity = peeking ? 1 : stage.opacity;

  // Hold-to-peek — pointer + keyboard, so it works on device and with a11y.
  const peekOn = () => {
    if (!peeking) hapticLight();
    setPeeking(true);
  };
  const peekOff = () => setPeeking(false);
  const heldKey = useRef(false);

  return (
    <div className="flex flex-col min-h-full pb-4">
      {/* Header */}
      <div className="flex items-center px-1 pt-1 pb-3">
        <button
          onClick={() => {
            hapticLight();
            nav("today");
          }}
          aria-label="Back to Today"
          className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-themed-muted active:bg-[var(--overlay-subtle)] touch-manipulation"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="flex-1 text-center text-[11px] tracking-[0.16em] uppercase text-themed-muted">
          Free practice
        </span>
        <span className="w-9" aria-hidden />
      </div>

      {/* Pinned promise — nothing here can move your schedule. */}
      <div className="mx-1 mb-3 rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-4 py-2.5 text-center text-[12px] tracking-[0.02em] text-gold">
        This doesn&rsquo;t affect your schedule
      </div>

      <p className="px-1 text-themed-muted text-sm leading-relaxed">
        Open anything you carry and drill it freely — loop the reciter, fade the
        words, peek. Nothing here is graded.
      </p>

      {/* Portion picker */}
      {carried.length === 0 ? (
        <div className="mt-8 text-center px-6">
          <p className="text-themed-muted text-sm">
            Nothing to practise yet. Add āyāt to your path, then come back to drill
            them freely.
          </p>
          <button
            onClick={() => {
              hapticLight();
              nav("path");
            }}
            className="mt-4 rounded-xl border sidebar-border px-4 py-2.5 text-sm text-themed active:opacity-80 touch-manipulation"
          >
            Open your path
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mt-4 px-1">
            {carried.map((s) => {
              const on = s.key === selectedKey;
              return (
                <button
                  key={s.key}
                  onClick={() => {
                    hapticSelection();
                    setSelectedKey(s.key);
                  }}
                  className={`rounded-xl border px-3.5 py-2.5 text-[13px] touch-manipulation transition-colors ${
                    on
                      ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-gold"
                      : "sidebar-border text-themed-muted active:opacity-80"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Drill card */}
          <div className="mt-4 mx-1 rounded-2xl card-bg border sidebar-border p-5">
            <p className="text-[11px] tracking-[0.16em] uppercase text-gold mb-3">
              {selected?.label ?? "Portion"}
            </p>

            {/* Fade stage control */}
            <div className="flex rounded-xl border sidebar-border overflow-hidden mb-1">
              {STAGES.map((st, i) => {
                const on = i === stageIdx;
                return (
                  <button
                    key={st.key}
                    onClick={() => {
                      hapticSelection();
                      setStageIdx(i);
                      setPeeking(false);
                    }}
                    className={`flex-1 py-2.5 text-[10.5px] tracking-[0.08em] uppercase touch-manipulation transition-colors ${
                      i > 0 ? "border-l sidebar-border" : ""
                    } ${on ? "bg-[var(--color-gold)]/12 text-gold" : "text-themed-muted"}`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
            <p className="text-center text-[11px] text-themed-muted mt-2 mb-1">
              {peeking ? "Peeking — full text revealed" : stage.hint}
            </p>

            {/* Faded content */}
            <div className="relative mt-2">
              <div
                style={{
                  filter: activeBlur ? `blur(${activeBlur}px)` : undefined,
                  opacity: activeOpacity,
                  transition: "filter 0.18s ease, opacity 0.18s ease",
                }}
              >
                {loadingContent && (
                  <p className="text-center text-themed-muted text-sm py-8">
                    Loading…
                  </p>
                )}
                {!loadingContent && content?.kind === "quran" && (
                  <AudioAssistedPlayer
                    key={selected?.key}
                    ayahs={content.ayahs}
                    defaultLoop
                    showTranslation={false}
                  />
                )}
                {!loadingContent && content?.kind === "asma" && (
                  <div className="space-y-4 py-2">
                    {content.names.map((n, i) => (
                      <div key={i} className="text-center">
                        <p dir="rtl" className="font-arabic text-themed text-3xl leading-[2]">
                          {n.nameAr}
                        </p>
                        <p className="text-gold text-sm mt-1">{n.name}</p>
                        <p className="text-themed-muted text-xs mt-0.5">{n.meaning}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hold-to-peek — only when the text is faded (Letters / Anchors),
                since there's nothing to reveal on Full. */}
            {stageIdx > 0 && (
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  peekOn();
                }}
                onPointerUp={peekOff}
                onPointerLeave={peekOff}
                onPointerCancel={peekOff}
                onKeyDown={(e) => {
                  if ((e.key === " " || e.key === "Enter") && !heldKey.current) {
                    e.preventDefault();
                    heldKey.current = true;
                    peekOn();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    heldKey.current = false;
                    peekOff();
                  }
                }}
                className="block mx-auto mt-5 rounded-full border border-dashed border-[var(--color-gold)]/40 px-5 py-2 text-[11.5px] tracking-[0.1em] uppercase text-gold touch-manipulation select-none active:bg-[var(--color-gold)]/10"
                style={{ touchAction: "none" }}
              >
                hold to peek
              </button>
            )}
          </div>
        </>
      )}

      <p className="mt-auto pt-6 px-6 text-center text-[11px] leading-relaxed text-themed-muted">
        Grades live only inside Review — that&rsquo;s what keeps your schedule
        honest.
      </p>
    </div>
  );
}
