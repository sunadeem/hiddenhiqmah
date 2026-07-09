"use client";

// TodayView — the Hifz home. Straight to content (no salam / greeting eyebrow):
// a compact StationMap peek strip up top, ONE gold hero that chains the day's
// work (due reviews first → then today's new āyāt → else a complete state), a
// Review / Learn split, and quiet links to Practice + My Path. When the adaptive
// guardrail is holding back new learning (review debt is high) it surfaces a
// calm reassurance instead of pushing new āyāt.
//
// Reads only from useHifzPath; navigates via nav() and never imports a sibling
// screen. Matches the approved prototype's Today screen for layout + copy.

import { useMemo } from "react";
import type { HifzPath } from "@/lib/hifz/useHifzPath";
import type { HifzStation } from "@hidden-hiqmah/ui/lib/hifz/types";
import { newLearningPaused } from "@hidden-hiqmah/ui/lib/hifz/srs";
import { todayLocalDate } from "@hidden-hiqmah/ui/lib/daily/types";
import StationMap from "./StationMap";
import { hapticMedium, hapticLight } from "@/lib/mobile/haptics";

/** The Hifz view router keys (HifzScreen owns the state; screens only nav). */
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

/** A station spans one contiguous portion — count its units (āyāt or Names). */
function stationUnitCount(station: HifzStation): number {
  if (station.startSurah === station.endSurah) {
    return Math.max(1, station.endAyah - station.startAyah + 1);
  }
  return Math.max(1, station.cardIds.length);
}

/** The 99 Names live on surah 0 (Name indices in the ayah fields). */
function isAsmaStation(station: HifzStation): boolean {
  return station.startSurah === 0;
}

export default function TodayView({ path, nav }: HifzScreenProps) {
  const {
    loading,
    cards,
    stations,
    currentStation,
    currentNames,
    todayReview,
    todayLearn,
    newLearningDoneToday,
    newPortionsToday,
    dailyNewBudget,
    stats,
  } = path;

  const today = useMemo(() => todayLocalDate(), []);
  const paused = useMemo(() => newLearningPaused(cards, today), [cards, today]);

  const reviewCount = todayReview.length;
  const hasReviews = reviewCount > 0;
  // The actual next portion on each parallel track (Qur'ān + a Name of Allah),
  // held back only by the review-debt guardrail. These stay reachable for "start
  // early" even after today's budget is spent.
  const nextLearn = paused ? null : todayLearn;
  const nextNames = paused ? null : currentNames;
  // Once today's new-learning budget is spent we STOP pushing new material — the
  // pushed stations go null, so the hero + tiles read "done for today" instead of
  // handing out the next portion. The next portion is still one tap away below.
  const learnStation = newLearningDoneToday ? null : nextLearn;
  const namesStation = newLearningDoneToday ? null : nextNames;
  const canLearn = learnStation !== null;
  const canLearnNames = namesStation !== null;
  // What "start early" opens (Qur'ān first, else a Name) when the budget is spent.
  const startEarlyStation = nextLearn ?? nextNames;
  const dailyDone = newLearningDoneToday && startEarlyStation !== null;

  const learnCount = learnStation ? stationUnitCount(learnStation) : 0;
  const learnUnitWord = learnCount === 1 ? "āyah" : "āyāt";
  const namesCount = namesStation ? stationUnitCount(namesStation) : 0;
  const namesUnitWord = namesCount === 1 ? "Name" : "Names";

  // The gold hero chains today's work: reviews → Qur'ān → (else) a Name → complete.
  // It never reads "complete" while either track still has something to carry.
  const heroLearn = learnStation ?? namesStation;
  const heroCount = heroLearn ? stationUnitCount(heroLearn) : 0;
  const heroUnitWord = heroLearn && isAsmaStation(heroLearn)
    ? heroCount === 1 ? "Name" : "Names"
    : heroCount === 1 ? "āyah" : "āyāt";

  // ── Streak beads (7-dot ring + running day count). ──
  const streak = stats?.streakCurrent ?? 0;
  const litBeads = streak === 0 ? 0 : streak % 7 || 7;

  if (loading) {
    return (
      <div className="flex flex-col gap-4 px-6 pt-2 pb-24">
        <div className="h-4 w-32 rounded card-bg opacity-40" />
        <div className="h-20 w-full rounded-2xl card-bg opacity-40" />
        <div className="h-40 w-full rounded-2xl card-bg opacity-40" />
      </div>
    );
  }

  return (
    <div className="flex flex-col px-6 pt-2 pb-24 overflow-y-auto">
      {/* Streak row — content-first, no salam. */}
      <div className="flex items-center justify-between pb-1">
        <span
          className="text-[19px] text-themed"
          style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
        >
          Today
        </span>
        <div className="flex items-center gap-1 text-[11px] text-themed-muted">
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: 5,
                height: 5,
                background:
                  i < litBeads ? "var(--color-gold)" : "var(--overlay-soft, rgba(255,255,255,0.12))",
              }}
            />
          ))}
          <span className="ml-1.5">Day {streak}</span>
        </div>
      </div>

      {/* Peek strip — tap opens the full path. */}
      {stations.length > 0 && (
        <button
          type="button"
          onClick={() => {
            hapticLight();
            nav("path");
          }}
          aria-label="Open your full path"
          className="mt-3 w-full rounded-2xl px-3 py-4 card-bg sidebar-border border touch-manipulation active:opacity-90 flex justify-center overflow-x-auto"
        >
          <StationMap
            stations={stations}
            currentKey={currentStation?.key ?? null}
            variant="peek"
            peekWindow={5}
            onTap={() => {
              hapticLight();
              nav("path");
            }}
          />
        </button>
      )}

      {/* ── The one gold hero — chains today's work across both tracks. ── */}
      <Hero
        hasReviews={hasReviews}
        reviewCount={reviewCount}
        learnStation={heroLearn}
        learnCount={heroCount}
        learnUnitWord={heroUnitWord}
        dailyDone={dailyDone}
        startEarlyStation={startEarlyStation}
        newPortionsToday={newPortionsToday}
        dailyNewBudget={dailyNewBudget}
        streak={streak}
        nav={nav}
      />

      {/* Adaptive guardrail — calm, never a scolding wall. */}
      {paused && (
        <div
          className="mt-3 rounded-xl px-4 py-3 text-[12.5px] leading-relaxed text-themed-muted"
          style={{
            border: "1px dashed var(--color-gold-line, rgba(201,168,76,0.28))",
            background: "var(--color-gold-dim, rgba(201,168,76,0.06))",
          }}
        >
          New āyāt are resting today while your reviews catch up — they return the
          moment your path is steady again. Consistency over quantity.
        </div>
      )}

      {/* Review / Learn (Qur'ān) split tiles. */}
      <div className="flex gap-2.5 mt-3">
        <SplitTile
          label="Review"
          done={!hasReviews}
          value={
            hasReviews
              ? `${reviewCount} due · keep strong`
              : "All kept strong"
          }
          onTap={() => {
            hapticLight();
            nav("review");
          }}
        />
        <SplitTile
          label="Learn Qur'ān"
          done={!canLearn && !paused}
          value={
            paused
              ? "Resting today"
              : canLearn && learnStation
              ? `${learnStation.label} · ${learnCount} new ${learnUnitWord}`
              : dailyDone
              ? "Done for today"
              : "Sealed for now"
          }
          onTap={() => {
            hapticLight();
            if (canLearn && learnStation) nav("learn", { stationKey: learnStation.key });
            else if (dailyDone && startEarlyStation)
              nav("learn", { stationKey: startEarlyStation.key });
            else nav("path");
          }}
        />
      </div>

      {/* Names of Allah — a distinct parallel track, surfaced alongside the Qur'ān. */}
      {canLearnNames && namesStation && (
        <button
          type="button"
          onClick={() => {
            hapticLight();
            nav("learn", { stationKey: namesStation.key });
          }}
          className="mt-2.5 w-full text-left rounded-[15px] px-4 py-3.5 card-bg border active:opacity-90 transition-opacity flex items-center justify-between gap-3"
          style={{ borderColor: "var(--color-gold-line, rgba(201,168,76,0.28))" }}
        >
          <span className="min-w-0">
            <span
              className="block text-[10px] tracking-[0.18em] uppercase text-gold"
            >
              Learn a Name of Allah
            </span>
            <span className="block text-[13px] font-semibold text-themed mt-1 leading-snug truncate">
              {namesStation.label} · {namesCount} new {namesUnitWord}
            </span>
          </span>
          <span aria-hidden className="text-gold text-[18px] shrink-0">
            ›
          </span>
        </button>
      )}

      {/* Free Practice + My Path — real buttons. */}
      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={() => {
            hapticLight();
            nav("practice");
          }}
          className="flex-1 rounded-xl border sidebar-border py-2.5 text-[13px] font-semibold text-themed active:opacity-80 touch-manipulation"
        >
          Free Practice
        </button>
        <button
          type="button"
          onClick={() => {
            hapticLight();
            nav("path");
          }}
          className="flex-1 rounded-xl border sidebar-border py-2.5 text-[13px] font-semibold text-themed active:opacity-80 touch-manipulation"
        >
          My Path
        </button>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────

interface HeroProps {
  hasReviews: boolean;
  reviewCount: number;
  learnStation: HifzStation | null;
  learnCount: number;
  learnUnitWord: string;
  dailyDone: boolean;
  startEarlyStation: HifzStation | null;
  newPortionsToday: number;
  dailyNewBudget: number;
  streak: number;
  nav: (view: HifzView, params?: unknown) => void;
}

function Hero({
  hasReviews,
  reviewCount,
  learnStation,
  learnCount,
  learnUnitWord,
  dailyDone,
  startEarlyStation,
  newPortionsToday,
  dailyNewBudget,
  streak,
  nav,
}: HeroProps) {
  const canLearn = learnStation !== null;
  const learnIsNames = learnStation !== null && isAsmaStation(learnStation);
  let eyebrow = "Today's step";
  let title: string;
  let est: string;
  let cta: string;
  let target: HifzView;
  // When the hero routes to Learn we hand the specific station forward so the
  // ladder opens the right track (Qur'ān or the 99 Names).
  let params: unknown = undefined;
  let complete = false;

  if (hasReviews) {
    title = "Begin today's session";
    const portions = `${reviewCount} ${reviewCount === 1 ? "portion" : "portions"} to keep strong`;
    est = canLearn && learnStation
      ? `${portions}, then ${learnCount} new ${learnUnitWord} of ${learnStation.label}`
      : portions;
    cta = "Begin — reviews first ›";
    target = "review";
  } else if (dailyDone && startEarlyStation) {
    // Today's new-learning budget is spent, but there's still more ahead. This is
    // a real daily "you're done" moment — new material rests until tomorrow, with
    // a quiet "start early" for anyone who wants to press on. Reviews are clear.
    complete = true;
    title = "Today's new learning is done.\nMāshāʼ Allāh.";
    est = `${newPortionsToday} new ${newPortionsToday === 1 ? "portion" : "portions"} carried today · rest, or press on`;
    cta = "Start early ›";
    target = "learn";
    params = { stationKey: startEarlyStation.key };
  } else if (canLearn && learnStation) {
    title = learnIsNames ? "Learn today's Name" : "Learn today's āyāt";
    // Show today's portion counter when the daily target is more than one.
    if (dailyNewBudget > 1) {
      eyebrow = `Portion ${Math.min(newPortionsToday + 1, dailyNewBudget)} of ${dailyNewBudget} today`;
    }
    est = `${learnStation.label} · ${learnCount} new ${learnUnitWord} to carry`;
    cta = `Learn ${learnStation.label} ›`;
    target = "learn";
    params = { stationKey: learnStation.key };
  } else {
    complete = true;
    eyebrow = "Today's step";
    title = "Today's step is complete.\nMāshāʼ Allāh.";
    est = `Kept in your care · consistency: day ${streak}`;
    cta = "Free Practice";
    target = "practice";
  }

  return (
    <div
      className="mt-4 rounded-2xl p-5 relative overflow-hidden"
      style={{
        border: "1px solid var(--color-gold-line, rgba(201,168,76,0.28))",
        background:
          "linear-gradient(165deg, var(--color-gold-dim, rgba(201,168,76,0.14)), rgba(201,168,76,0.03))",
        textAlign: complete ? "center" : "left",
      }}
    >
      <div
        className="text-[10.5px] tracking-[0.26em] uppercase text-gold mb-2"
      >
        {eyebrow}
      </div>
      <div
        className="text-[21px] leading-snug text-themed whitespace-pre-line"
        style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
      >
        {title}
      </div>
      <div className="text-[12.5px] text-themed-muted mt-2">{est}</div>
      <button
        type="button"
        onClick={() => {
          hapticMedium();
          nav(target, params);
        }}
        className={
          complete
            ? "mt-4 w-full rounded-[15px] px-4 py-3.5 text-[14px] font-semibold text-themed sidebar-border border active:scale-[0.98] transition-transform"
            : "mt-4 w-full rounded-[15px] px-4 py-4 text-[15.5px] font-bold active:scale-[0.98] transition-transform"
        }
        style={
          complete
            ? { background: "var(--overlay-soft, rgba(255,255,255,0.03))" }
            : {
                background:
                  "linear-gradient(170deg, var(--color-gold-hi, #e2c476), var(--color-gold) 55%, #ab8b3c)",
                color: "#181305",
                boxShadow: "0 6px 22px rgba(201,168,76,0.22)",
              }
        }
      >
        {cta}
      </button>
    </div>
  );
}

// ── Split tile ────────────────────────────────────────────────────────────

function SplitTile({
  label,
  value,
  done,
  onTap,
}: {
  label: string;
  value: string;
  done: boolean;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex-1 text-left rounded-[15px] px-3.5 py-3.5 card-bg sidebar-border border active:opacity-90 transition-opacity"
    >
      <div
        className="text-[10px] tracking-[0.18em] uppercase"
        style={{ color: done ? "#5ea77b" : "var(--color-text-muted, #808aa0)" }}
      >
        {label}
        {done ? " ✓" : ""}
      </div>
      <div
        className="text-[13px] font-semibold mt-1.5 leading-snug"
        style={{ color: done ? "#89b99a" : undefined }}
      >
        <span className={done ? "" : "text-themed"}>{value}</span>
      </div>
    </button>
  );
}
