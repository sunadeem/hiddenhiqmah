// Hifz SRS engine — SM-2-style spaced repetition. Pure functions, fully testable.
// The "card" is an ayah range regardless of granularity, so scheduling is uniform.

import type { HifzCard, Grade, NewCardInput } from "./types";

export const NEW_PER_DAY = 5; // cap on brand-new cards introduced per day
export const QUEUE_CAP = 80; // safety cap on a single session
export const MEMORIZED_INTERVAL = 21; // days — a review card at/after this is "memorized"
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

function addDays(date: string, n: number): string {
  const d = new Date(date + "T12:00:00"); // midday anchor → DST-safe
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
function roundInt(n: number): number {
  return Math.max(1, Math.round(n));
}
function clampEase(e: number): number {
  return Math.max(MIN_EASE, Number(e.toFixed(2)));
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
    due: today,
    lastReviewed: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

/**
 * SM-2 scheduling. Returns a NEW card object (never mutates).
 * - new/learning: "again" → stays today (relearn); hard/good → graduate (1d);
 *   easy → graduate (3d, +ease).
 * - review/memorized: "again" → lapse back to learning (today, −ease); else grow
 *   the interval by ease (hard ×1.2 −ease; good ×ease; easy ×ease×1.3 +ease).
 *   A review whose interval reaches MEMORIZED_INTERVAL is flagged "memorized"
 *   (still scheduled for future reviews).
 */
export function applyGrade(
  card: HifzCard,
  grade: Grade,
  today: string,
  nowIso: string
): HifzCard {
  let { status, ease, interval, reps, lapses } = card;

  if (status === "new" || status === "learning") {
    if (grade === "again") {
      return {
        ...card,
        status: "learning",
        interval: 0,
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
      due: today,
      lastReviewed: today,
      updatedAt: nowIso,
    };
  }
  if (grade === "hard") {
    ease = clampEase(ease - 0.15);
    interval = roundInt(interval * 1.2);
  } else if (grade === "good") {
    interval = roundInt(interval * ease);
    reps += 1;
  } else {
    // easy
    ease = clampEase(ease + 0.15);
    interval = roundInt(interval * ease * 1.3);
    reps += 1;
  }
  return {
    ...card,
    status: interval >= MEMORIZED_INTERVAL ? "memorized" : "review",
    ease,
    interval,
    reps,
    due: addDays(today, interval),
    lastReviewed: today,
    updatedAt: nowIso,
  };
}

/**
 * Today's queue: all non-new cards due on/before today (oldest due first), then
 * up to NEW_PER_DAY brand-new cards (learn after reviewing). Capped for safety.
 */
export function selectQueue(cards: HifzCard[], today: string): HifzCard[] {
  const due = cards
    .filter((c) => c.status !== "new" && c.due <= today)
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
  const fresh = cards.filter((c) => c.status === "new").slice(0, NEW_PER_DAY);
  return [...due, ...fresh].slice(0, QUEUE_CAP);
}
