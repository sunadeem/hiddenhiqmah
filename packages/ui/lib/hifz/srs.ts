// Hifz SRS engine — SM-2-style spaced repetition. Pure functions, fully testable.
// The "card" is an ayah range regardless of granularity, so scheduling is uniform.

import { consecRun } from "../daily/types";
import type { HifzCard, Grade, NewCardInput, Granularity } from "./types";

// Per-granularity cap on brand-new cards introduced per day. Pages + surah-chunks
// (surah selection is split into page-sized cards) pace slowly; single ayahs pace
// faster. Keeps the compounding review load sustainable.
export const NEW_PER_DAY: Record<Granularity, number> = {
  page: 2,
  ayah: 10,
  surah: 2,
  range: 2,
};
export const QUEUE_CAP = 80; // safety cap on a single session
export const MEMORIZED_INTERVAL = 21; // days — a review card at/after this is "memorized"
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
function addDays(date: string, n: number): string {
  const d = new Date(date + "T12:00:00"); // midday anchor → DST-safe
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}
function roundInt(n: number): number {
  return Math.max(1, Math.round(n));
}
function clampEase(e: number): number {
  return Math.max(MIN_EASE, Number(e.toFixed(2)));
}
// Success intervals must STRICTLY increase, even when ease is at the floor — else
// a low-ease card with interval 1 multiplies back to 1 and is stuck due forever.
function grow(interval: number, factor: number): number {
  return Math.max(interval + 1, roundInt(interval * factor));
}

/** Stable identity for a card's ayah range — used to dedupe on add. */
export function rangeKey(c: {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}): string {
  return `${c.startSurah}:${c.startAyah}-${c.endSurah}:${c.endAyah}`;
}

export function newCard(
  input: NewCardInput,
  today: string,
  nowIso: string,
  id: string
): HifzCard {
  return {
    id,
    unit: input.unit,
    label: input.label,
    page: input.page,
    startSurah: input.startSurah,
    startAyah: input.startAyah,
    endSurah: input.endSurah,
    endAyah: input.endAyah,
    status: "new",
    ease: DEFAULT_EASE,
    interval: 0,
    reps: 0,
    lapses: 0,
    step: 0,
    introducedDate: null,
    due: today,
    lastReviewed: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

/**
 * SM-2 scheduling. Returns a NEW card object (never mutates).
 * - new/learning: "again" → stays today (relearn); hard/good → graduate (≥1d);
 *   easy → graduate (≥3d, +ease). First grade stamps introducedDate (per-day cap).
 * - review/memorized: "again" → lapse back to learning (today, −ease); else the
 *   interval STRICTLY grows (hard ×1.2 −ease; good ×ease; easy ×ease×1.3 +ease),
 *   never below interval+1. A review whose interval reaches MEMORIZED_INTERVAL is
 *   flagged "memorized" (still scheduled for future reviews).
 */
export function applyGrade(
  card: HifzCard,
  grade: Grade,
  today: string,
  nowIso: string
): HifzCard {
  let { status, ease, interval, reps, lapses } = card;
  // Stamp the day the card first leaves "new" (drives the per-day new cap).
  const introducedDate = card.status === "new" ? today : card.introducedDate;

  if (status === "new" || status === "learning") {
    if (grade === "again") {
      return {
        ...card,
        status: "learning",
        interval: 0,
        introducedDate,
        due: today, // see it again this session
        lastReviewed: today,
        updatedAt: nowIso,
      };
    }
    status = "review";
    interval = grade === "easy" ? 3 : 1;
    if (grade === "easy") ease = clampEase(ease + 0.15);
    reps += 1;
    return {
      ...card,
      status,
      ease,
      interval,
      reps,
      introducedDate,
      due: addDays(today, interval),
      lastReviewed: today,
      updatedAt: nowIso,
    };
  }

  // review / memorized
  if (grade === "again") {
    lapses += 1;
    ease = clampEase(ease - 0.2);
    return {
      ...card,
      status: "learning",
      ease,
      lapses,
      interval: 0,
      introducedDate,
      due: today,
      lastReviewed: today,
      updatedAt: nowIso,
    };
  }
  if (grade === "hard") {
    ease = clampEase(ease - 0.15);
    interval = grow(interval, 1.2);
    reps += 1;
  } else if (grade === "good") {
    interval = grow(interval, ease);
    reps += 1;
  } else {
    // easy
    ease = clampEase(ease + 0.15);
    interval = grow(interval, ease * 1.3);
    reps += 1;
  }
  return {
    ...card,
    status: interval >= MEMORIZED_INTERVAL ? "memorized" : "review",
    ease,
    interval,
    reps,
    introducedDate,
    due: addDays(today, interval),
    lastReviewed: today,
    updatedAt: nowIso,
  };
}

/**
 * Today's queue: all non-new cards due on/before today (oldest due first), then
 * brand-new cards — but only up to the remaining NEW_PER_DAY allowance after
 * subtracting how many were already introduced today. Capped for safety.
 */
export function selectQueue(cards: HifzCard[], today: string): HifzCard[] {
  const due = cards
    .filter((c) => c.status !== "new" && c.due <= today)
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
  // Per-unit daily allowance: already-introduced-today (by unit) counts against
  // that unit's cap, so each granularity paces independently.
  const introduced: Record<string, number> = {};
  for (const c of cards) {
    if (c.introducedDate === today) introduced[c.unit] = (introduced[c.unit] ?? 0) + 1;
  }
  const taken: Record<string, number> = {};
  const fresh: HifzCard[] = [];
  for (const c of cards) {
    if (c.status !== "new") continue;
    const cap = NEW_PER_DAY[c.unit] ?? 2;
    if ((introduced[c.unit] ?? 0) + (taken[c.unit] ?? 0) < cap) {
      fresh.push(c);
      taken[c.unit] = (taken[c.unit] ?? 0) + 1;
    }
  }
  return [...due, ...fresh].slice(0, QUEUE_CAP);
}

/**
 * Hifz streak from the review log. Current = consecutive days up to today;
 * best = longest consecutive run ever. Filters future-dated entries (device-clock
 * skew) so a stray future date can't zero the streak. Shared by both adapters.
 */
export function hifzStreak(
  reviewLocalDates: string[],
  today: string
): { current: number; best: number } {
  const valid = [...new Set(reviewLocalDates.filter((d) => d <= today))].sort(); // ascending
  const current = consecRun([...valid].reverse(), today);
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of valid) {
    if (prev) {
      const next = new Date(prev + "T12:00:00");
      next.setDate(next.getDate() + 1);
      run = fmtDate(next) === d ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = d;
  }
  return { current, best: Math.max(best, current) };
}
