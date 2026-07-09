"use client";

// ReviewLoop — the daily "keeping strong" review session. Runs path.todayReview as
// a one-card-at-a-time sequence: a RECALL prompt (sūrah + first-word cue, optional
// "hear the opening") → REVEAL the āyāt → four honest grades, each showing its own
// consequence ("returns in ~N days", previewed with applyGrade) → path.actions.grade.
// "Slipped away" opens a gentle rescue mini-ladder before the lapse is recorded.
// On finish it hands off to Learn (if new āyāt remain), a Milestone (if a sūrah just
// completed), or back to Today — always via nav(), never importing a sibling screen.
//
// On-brand: deep navy ground, gold accent, large RTL Arabic, calm + reverent. No salam.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Grade, HifzCard } from "@hidden-hiqmah/ui/lib/hifz/types";
import { applyGrade } from "@hidden-hiqmah/ui/lib/hifz/srs";
import { todayLocalDate } from "@hidden-hiqmah/ui/lib/daily/types";
import type { HifzPath } from "@/lib/hifz/useHifzPath";
import {
  resolveCardContent,
  type ResolvedContent,
} from "@/lib/hifz/hifzContent";
import { verseCount } from "@/lib/hifz/quran";
import { hapticLight, hapticMedium, hapticSuccess } from "@/lib/mobile/haptics";
import AudioAssistedPlayer from "./AudioAssistedPlayer";

/** The Hifz view router keys (owned by HifzScreen; kept here so screens agree). */
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

type Phase = "prompt" | "reveal" | "rescue" | "done";

const GRADES: { grade: Grade; title: string; danger?: boolean }[] = [
  { grade: "again", title: "Slipped away", danger: true },
  { grade: "hard", title: "Shaky" },
  { grade: "good", title: "Strong" },
  { grade: "easy", title: "Effortless" },
];

/** Human phrase for a previewed next-review interval (days). */
function returnsText(days: number): string {
  if (days <= 0) return "we rebuild it right now";
  if (days === 1) return "returns tomorrow";
  return `returns in ~${days} days`;
}

/** First 1–2 words of the portion, as a bare recall cue (Arabic, RTL). */
function firstCue(content: ResolvedContent | null): string {
  if (!content) return "";
  if (content.kind === "quran") {
    const first = content.ayahs[0]?.arabic ?? "";
    return first.split(/\s+/).slice(0, 2).join(" ");
  }
  return content.names[0]?.nameAr ?? "";
}

export default function ReviewLoop({ path, nav }: HifzScreenProps) {
  const today = useMemo(() => todayLocalDate(), []);

  // Snapshot today's review queue ONCE — grading re-reads path (the graded card
  // leaves the due set), which would otherwise reshuffle the list mid-session.
  const [queue, setQueue] = useState<HifzCard[] | null>(null);
  useEffect(() => {
    if (queue === null && !path.loading) setQueue(path.todayReview);
  }, [queue, path.loading, path.todayReview]);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("prompt");
  const [showCue, setShowCue] = useState(false);
  const [hearOpening, setHearOpening] = useState(false);
  const [assisted, setAssisted] = useState(false);

  const [content, setContent] = useState<ResolvedContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Milestone: a sūrah completed by a grade during this session (shown on finish).
  const milestoneRef = useRef<number | null>(null);
  const keptRef = useRef(0);

  const card = queue?.[idx] ?? null;

  // Resolve the current card's material; reset per-card recall UI.
  useEffect(() => {
    setShowCue(false);
    setHearOpening(false);
    setAssisted(false);
    if (!card) {
      setContent(null);
      return;
    }
    let alive = true;
    setContentLoading(true);
    resolveCardContent(card)
      .then((c) => {
        if (alive) {
          setContent(c);
          setContentLoading(false);
        }
      })
      .catch(() => {
        if (alive) setContentLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [card]);

  /** Would grading this card complete its sūrah? Returns the sūrah number or null. */
  const completesSurah = useCallback(
    (c: HifzCard, grade: Grade): number | null => {
      if (c.contentKind === "asma") return null;
      const updated = applyGrade(c, grade, today, new Date().toISOString());
      if (updated.status !== "memorized") return null;
      const surah = c.endSurah;
      // Must end the sūrah, and every other card touching it must already be settled.
      if (c.endAyah !== verseCount(surah)) return null;
      const settled = (x: HifzCard) => x.status === "review" || x.status === "memorized";
      const others = path.cards.filter(
        (x) =>
          x.id !== c.id &&
          x.contentKind !== "asma" &&
          (x.startSurah === surah || x.endSurah === surah)
      );
      return others.every(settled) ? surah : null;
    },
    [path.cards, today]
  );

  const advance = useCallback(() => {
    if (!queue) return;
    keptRef.current += 1;
    if (idx + 1 >= queue.length) {
      setPhase("done");
    } else {
      setIdx((i) => i + 1);
      setPhase("prompt");
    }
  }, [queue, idx]);

  const commitGrade = useCallback(
    async (grade: Grade) => {
      if (!card) return;
      const surah = completesSurah(card, grade);
      if (surah != null) milestoneRef.current = surah;
      await path.actions.grade(card.id, grade);
      advance();
    },
    [card, completesSurah, path.actions, advance]
  );

  const onGrade = useCallback(
    (grade: Grade) => {
      if (grade === "again") {
        hapticMedium();
        setPhase("rescue");
        return;
      }
      hapticSuccess();
      void commitGrade(grade);
    },
    [commitGrade]
  );

  /** Leave the session: milestone > learn > today. */
  const finish = useCallback(() => {
    hapticLight();
    if (milestoneRef.current != null) {
      nav("milestone", { surah: milestoneRef.current });
    } else if (path.todayLearn) {
      nav("learn");
    } else {
      nav("today");
    }
  }, [nav, path.todayLearn]);

  const total = queue?.length ?? 0;
  const previewFor = (grade: Grade): number =>
    card ? applyGrade(card, grade, today, new Date().toISOString()).interval : 0;

  // ── Loading / empty ──
  if (path.loading || queue === null) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <span className="text-themed-muted text-sm">Gathering today’s review…</span>
      </div>
    );
  }
  if (total === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <FlowHeader idx={0} total={0} nav={nav} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <div className="text-gold text-2xl tracking-[0.4em]">﴾ ✦ ﴿</div>
          <p className="text-themed text-lg" style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}>
            Nothing due right now.
          </p>
          <p className="text-themed-muted text-sm max-w-xs">
            What you carry is steady today — reviews return only when they’re needed.
          </p>
          <button
            type="button"
            onClick={finish}
            className="mt-2 rounded-xl bg-[var(--color-gold)] text-black font-semibold px-6 py-3 touch-manipulation active:opacity-90"
          >
            {path.todayLearn ? "Learn today’s āyāt ›" : "Back to Today"}
          </button>
        </div>
      </div>
    );
  }

  const meta = card ? cardMeta(card, content) : "";
  const cue = firstCue(content);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <FlowHeader idx={phase === "done" ? total : idx} total={total} nav={nav} />

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* ── DONE ── */}
        {phase === "done" && (
          <div className="pt-6">
            <div className="rounded-3xl card-bg sidebar-border border p-7 text-center">
              <div className="text-gold/60 text-lg tracking-[0.4em]">✦ ✦ ✦</div>
              <div
                className="text-themed text-2xl mt-2"
                style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
              >
                {total} kept strong
              </div>
              <p className="text-themed-muted text-sm mt-2">
                All steady — reviews settle before new learning, and that is what
                protects what you have built.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={finish}
                className="w-full rounded-2xl bg-[var(--color-gold)] text-black font-semibold py-4 touch-manipulation active:opacity-90"
              >
                {milestoneRef.current != null
                  ? "A sūrah is complete ›"
                  : path.todayLearn
                    ? "Continue to today’s new āyāt ›"
                    : "Back to Today"}
              </button>
              {path.todayLearn && milestoneRef.current == null && (
                <button
                  type="button"
                  onClick={() => nav("today")}
                  className="w-full text-themed-muted text-sm py-2 touch-manipulation active:opacity-70"
                >
                  Pause here — Today
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── PROMPT ── */}
        {phase === "prompt" && card && (
          <div className="pt-4">
            <div className="rounded-3xl card-bg sidebar-border border p-6 text-center">
              <div className="text-gold/50 text-base tracking-[0.4em]">﴾ ﴿</div>
              <div
                className="text-themed text-2xl mt-2"
                style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
              >
                {content?.label ?? card.label}
              </div>
              <div className="text-themed-muted text-xs mt-1.5">{meta}</div>

              {showCue && cue && (
                <p
                  dir="rtl"
                  className="font-arabic text-gold mt-5 leading-[2] text-3xl"
                  style={{ color: "var(--color-gold)" }}
                >
                  {cue}
                  <span className="text-themed-muted"> …</span>
                </p>
              )}

              <p className="text-themed-muted text-sm mt-5 leading-relaxed">
                Recite it from memory, then check yourself.
              </p>

              <div className="flex flex-wrap gap-2 justify-center mt-5">
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setShowCue(true);
                  }}
                  className={`rounded-full border px-4 py-2 text-sm touch-manipulation ${
                    showCue
                      ? "border-[var(--color-gold)] text-gold bg-[var(--color-gold)]/10"
                      : "sidebar-border text-themed"
                  }`}
                >
                  First words
                </button>
                {content?.kind === "quran" && (
                  <button
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setHearOpening(true);
                      setAssisted(true);
                    }}
                    className={`rounded-full border px-4 py-2 text-sm touch-manipulation ${
                      hearOpening
                        ? "border-[var(--color-gold)] text-gold bg-[var(--color-gold)]/10"
                        : "sidebar-border text-themed"
                    }`}
                  >
                    Hear the opening
                  </button>
                )}
              </div>

              {hearOpening && content?.kind === "quran" && content.ayahs[0] && (
                <div className="mt-5 text-left">
                  <AudioAssistedPlayer ayahs={[content.ayahs[0]]} showTranslation={false} />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                hapticLight();
                setPhase("reveal");
              }}
              className="w-full mt-6 rounded-2xl bg-[var(--color-gold)] text-black font-semibold py-4 touch-manipulation active:opacity-90"
            >
              Show the āyāt
            </button>
          </div>
        )}

        {/* ── REVEAL + GRADE ── */}
        {phase === "reveal" && card && (
          <div className="pt-4">
            <div className="rounded-3xl card-bg sidebar-border border p-6">
              <div className="text-themed text-lg text-center mb-4" style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}>
                {content?.label ?? card.label}
              </div>
              {contentLoading || !content ? (
                <p className="text-themed-muted text-sm text-center py-6">Loading…</p>
              ) : content.kind === "quran" ? (
                <AudioAssistedPlayer ayahs={content.ayahs} />
              ) : (
                <AsmaReveal content={content} />
              )}
            </div>

            {assisted && (
              <p className="text-[var(--color-amber,#d99a3d)] text-xs mt-4 text-center">
                You heard the opening — “Shaky” may be the honest grade.
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2.5">
              {GRADES.map(({ grade, title, danger }) => {
                const suggest = grade === "good" && !assisted;
                const days = previewFor(grade);
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => onGrade(grade)}
                    className={`w-full text-left rounded-2xl border px-4 py-3.5 flex items-center justify-between gap-3 touch-manipulation active:opacity-90 ${
                      suggest
                        ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10"
                        : "sidebar-border card-bg"
                    }`}
                  >
                    <span
                      className={`text-[15px] font-semibold ${
                        suggest
                          ? "text-gold"
                          : danger
                            ? "text-[var(--color-rec,#c96a5c)]"
                            : "text-themed"
                      }`}
                    >
                      {title}
                    </span>
                    <span className="text-themed-muted text-[11px] text-right leading-tight">
                      {returnsText(days)}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-themed-muted text-[11px] text-center mt-3">
              Each grade shows its consequence — the schedule is never a mystery.
            </p>
          </div>
        )}

        {/* ── RESCUE (on "Slipped away") ── */}
        {phase === "rescue" && card && (
          <div className="pt-4">
            <div className="rounded-3xl card-bg sidebar-border border p-6">
              <div className="text-themed text-lg text-center mb-3" style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}>
                {content?.label ?? card.label}
              </div>
              <div
                className="rounded-2xl border p-4 text-left"
                style={{
                  borderColor: "var(--color-amber,#d99a3d)",
                  background: "var(--color-amber-dim, rgba(217,154,61,0.14))",
                }}
              >
                <div className="text-[var(--color-amber,#d99a3d)] font-semibold text-sm">
                  It happens to every ḥāfiẓ.
                </div>
                <div className="text-themed-muted text-xs mt-1 leading-relaxed">
                  Let’s rebuild it right now — read it once with the words in front of
                  you, then once from memory. Two quiet minutes.
                </div>
              </div>
              <div className="mt-4">
                {contentLoading || !content ? (
                  <p className="text-themed-muted text-sm text-center py-6">Loading…</p>
                ) : content.kind === "quran" ? (
                  <AudioAssistedPlayer ayahs={content.ayahs} defaultLoop />
                ) : (
                  <AsmaReveal content={content} />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                hapticSuccess();
                void commitGrade("again");
              }}
              className="w-full mt-6 rounded-2xl bg-[var(--color-gold)] text-black font-semibold py-4 touch-manipulation active:opacity-90"
            >
              It’s coming back — continue ›
            </button>
            <p className="text-themed-muted text-[11px] text-center mt-3">
              We’ll hold this one close — it returns again very soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Sequence header: back to Today + "Keeping strong · N of M" + a progress rail. */
function FlowHeader({
  idx,
  total,
  nav,
}: {
  idx: number;
  total: number;
  nav: (view: HifzView, params?: unknown) => void;
}) {
  const pct = total > 0 ? Math.min(100, (idx / total) * 100) : 0;
  return (
    <div className="px-5 pt-2 pb-3">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => {
            hapticLight();
            nav("today");
          }}
          className="text-themed-muted text-sm py-1.5 pr-3 touch-manipulation active:opacity-70"
        >
          ‹ Today
        </button>
        <div className="text-xs tracking-[0.16em] uppercase text-themed-muted">
          Keeping strong ·{" "}
          <b className="text-gold font-semibold">
            {total === 0 ? "none" : `${Math.min(idx + 1, total)} of ${total}`}
          </b>
        </div>
        <span className="w-10" aria-hidden />
      </div>
      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "var(--overlay-soft, rgba(255,255,255,0.08))" }}>
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: "var(--color-gold)" }}
        />
      </div>
    </div>
  );
}

/** The 99-Names reveal — Arabic name, transliteration, meaning. */
function AsmaReveal({ content }: { content: Extract<ResolvedContent, { kind: "asma" }> }) {
  return (
    <div className="space-y-4">
      {content.names.map((n) => (
        <div key={n.name} className="text-center">
          <p dir="rtl" className="font-arabic text-themed text-3xl leading-[1.8]">
            {n.nameAr}
          </p>
          <p className="text-gold text-sm mt-1">{n.name}</p>
          <p className="text-themed-muted text-xs mt-1">{n.meaning}</p>
        </div>
      ))}
    </div>
  );
}

/** Short "6 āyāt · last recited N days ago" line under the sūrah name. */
function cardMeta(card: HifzCard, content: ResolvedContent | null): string {
  const parts: string[] = [];
  if (content?.kind === "asma") {
    const count = content.names.length;
    parts.push(`${count} name${count === 1 ? "" : "s"}`);
  } else if (content?.kind === "quran") {
    const count = content.ayahs.length;
    parts.push(`${count} āyah${count === 1 ? "" : "t"}`);
  }
  if (card.source === "seeded" && card.status !== "memorized") {
    parts.push("being restored — held close for now");
  } else if (card.lastReviewed) {
    parts.push(`last recited ${sinceLabel(card.lastReviewed)}`);
  } else {
    parts.push("first review");
  }
  return parts.join(" · ");
}

/** "today" / "yesterday" / "N days ago" from a YYYY-MM-DD date. */
function sinceLabel(date: string): string {
  const then = new Date(date + "T12:00:00").getTime();
  const now = new Date(todayLocalDate() + "T12:00:00").getTime();
  const days = Math.max(0, Math.round((now - then) / 86400000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
