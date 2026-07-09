// Hifz SRS engine — SM-2-style spaced repetition. Pure functions, fully testable.
// The "card" is an ayah range regardless of granularity, so scheduling is uniform.

import { consecRun } from "../daily/types";
import type {
  HifzCard,
  Grade,
  NewCardInput,
  Granularity,
  Pace,
  SeedCardInput,
  SeedStrength,
  HifzStation,
  StationStatus,
  CardSource,
} from "./types";

// Per-granularity cap on brand-new cards introduced per day. Pages + surah-chunks
// (surah selection is split into page-sized cards) pace slowly; single ayahs pace
// faster. Keeps the compounding review load sustainable. NOTE: when a plan exists,
// selectQueue is driven by PACE (paceNewPerDay) instead — this map is the fallback
// for plan-less / legacy usage.
export const NEW_PER_DAY: Record<Granularity, number> = {
  page: 2,
  ayah: 10,
  surah: 2,
  range: 2,
};
export const QUEUE_CAP = 80; // safety cap on a single session
export const MEMORIZED_INTERVAL = 21; // days — a review card at/after this is "memorized"
// Adaptive guardrail: when at least this many reviews are already due, pause
// introducing NEW cards so the user clears their debt before taking on more.
export const REVIEW_DEBT_LIMIT = 25;
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

/**
 * Pace preset → the two knobs it controls: how many brand-new cards enter per day
 * and how many āyāt a station spans. Everything else about the schedule is SM-2.
 */
export const PACE: Record<Pace, { newPerDay: number; stationAyahs: number }> = {
  gentle: { newPerDay: 1, stationAyahs: 3 },
  steady: { newPerDay: 2, stationAyahs: 5 },
  devoted: { newPerDay: 3, stationAyahs: 7 },
};
export function paceNewPerDay(pace: Pace): number {
  return PACE[pace].newPerDay;
}
export function paceStationAyahs(pace: Pace): number {
  return PACE[pace].stationAyahs;
}

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

/**
 * DRIFT FIX. When a card is reviewed EARLY (before its due date), the next due
 * must be measured from the later of {today, current due} — not blindly from
 * today. Anchoring on today would drag every future review earlier each time the
 * user studies ahead, collapsing hard-won long intervals. Overdue cards (due <
 * today) correctly anchor on today so they don't jump further into the past.
 */
function scheduleFrom(today: string, due: string, interval: number): string {
  const anchor = due > today ? due : today;
  return addDays(anchor, interval);
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
    stationKey: input.stationKey ?? rangeKey(input),
    peekCount: 0,
    source: input.source ?? "learned",
    contentKind: input.contentKind,
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
      due: scheduleFrom(today, card.due, interval),
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
    due: scheduleFrom(today, card.due, interval),
    lastReviewed: today,
    updatedAt: nowIso,
  };
}

/**
 * LEARN-LADDER SEAL grade. The ladder (Meet→Absorb→Fade→Recite→Seal) is UI-only;
 * the ONLY graded moment is Seal, which resolves to exactly one applyGrade call
 * per card. This maps the user's self-rating at Seal to an SM-2 grade, informed
 * by how many times they peeked during Fade — a peeked recall can't count as a
 * clean "easy". Heavy peeking (≥ one per āyah) downgrades two notches, any
 * peeking one notch, never below "hard" (a wrong recall is graded "again"
 * directly by the caller and passed through untouched).
 */
export function sealGrade(base: Grade, peekCount: number, stationAyahs: number): Grade {
  const ORDER: Grade[] = ["again", "hard", "good", "easy"];
  if (base === "again" || peekCount <= 0) return base;
  const heavy = stationAyahs > 0 && peekCount >= stationAyahs;
  const idx = ORDER.indexOf(base) - (heavy ? 2 : 1);
  return ORDER[Math.max(1, idx)]; // floor at "hard"
}

// ── Already-memorized seeding (staggered so there's never a day-one wall) ──

/**
 * Evenly spreads N items across [lo, hi] inclusive. index 0 → lo, index N-1 → hi.
 * A single item lands at the window midpoint. Used to fan out seed intervals so
 * the first reviews trickle in over days instead of all at once.
 */
function spread(index: number, total: number, lo: number, hi: number): number {
  if (total <= 1) return Math.round((lo + hi) / 2);
  return Math.round(lo + ((hi - lo) * index) / (total - 1));
}

/** Stagger windows per strength: [lo, hi] days for the first review interval. */
const SEED_WINDOW: Record<SeedStrength, [number, number]> = {
  // Strong ≈ 3 weeks (14–28, mean 21) → confirmed later, spread thin.
  strong: [14, 28],
  // Needs-refreshing ≈ 1 week (3–7) → revisited soon, spread across the week.
  refreshing: [3, 7],
};

/**
 * Build ONE already-memorized card as a REVIEW card. `index`/`total` scope the
 * stagger WITHIN this card's strength group (the caller groups by strength and
 * numbers each group 0..n-1). due = today + interval, so the schedule is
 * self-consistent and the stagger IS the interval spread — no day-one pile-up.
 */
export function seedCard(
  input: SeedCardInput,
  index: number,
  total: number,
  today: string,
  nowIso: string,
  id: string
): HifzCard {
  const [lo, hi] = SEED_WINDOW[input.strength];
  const interval = spread(index, total, lo, hi);
  const base = newCard(input, today, nowIso, id);
  return {
    ...base,
    source: "seeded",
    status: interval >= MEMORIZED_INTERVAL ? "memorized" : "review",
    interval,
    reps: input.strength === "strong" ? 2 : 1,
    due: addDays(today, interval),
  };
}

/**
 * Turn a batch of already-carried portions into staggered seed cards. Groups by
 * strength first so each group is spread across its own window independently
 * (all Strong fanned over ~3 weeks, all Refreshing over ~1 week).
 */
export function seedCards(
  inputs: SeedCardInput[],
  today: string,
  nowIso: string,
  makeId: () => string
): HifzCard[] {
  const out: HifzCard[] = [];
  for (const strength of ["refreshing", "strong"] as SeedStrength[]) {
    const group = inputs.filter((i) => i.strength === strength);
    group.forEach((inp, i) => {
      out.push(seedCard(inp, i, group.length, today, nowIso, makeId()));
    });
  }
  return out;
}

export interface QueueOpts {
  /**
   * Plan-driven cap on brand-new cards per day, counted ACROSS all units. When
   * given (from the plan's pace), it overrides the per-granularity NEW_PER_DAY
   * map. Omit → legacy per-unit behavior.
   */
  newPerDay?: number;
  /**
   * Guardrail: if at least this many reviews are already due, introduce NO new
   * cards today. Defaults to REVIEW_DEBT_LIMIT; pass Infinity to disable.
   */
  pauseNewIfDueOver?: number;
}

/** Reviews due on/before today (drives the guardrail + the "Review" tile count). */
export function reviewDebt(cards: HifzCard[], today: string): number {
  return cards.filter((c) => c.status !== "new" && c.due <= today).length;
}

/** True when the adaptive guardrail is holding back new learning today. */
export function newLearningPaused(
  cards: HifzCard[],
  today: string,
  limit = REVIEW_DEBT_LIMIT
): boolean {
  return reviewDebt(cards, today) >= limit;
}

/**
 * Today's queue: all non-new cards due on/before today (oldest due first), then
 * brand-new cards up to the remaining daily allowance (minus any already
 * introduced today). With a plan the allowance is a single pace-driven cap
 * across all units; without one it falls back to the per-granularity map. The
 * adaptive guardrail suppresses new cards entirely when review debt is high.
 * Capped for safety.
 */
export function selectQueue(
  cards: HifzCard[],
  today: string,
  opts: QueueOpts = {}
): HifzCard[] {
  const due = cards
    .filter((c) => c.status !== "new" && c.due <= today)
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));

  const limit = opts.pauseNewIfDueOver ?? REVIEW_DEBT_LIMIT;
  if (due.length >= limit) return due.slice(0, QUEUE_CAP); // guardrail: no new today

  const fresh: HifzCard[] = [];
  if (typeof opts.newPerDay === "number") {
    // Plan-driven: ONE cap across all units.
    const introducedToday = cards.filter((c) => c.introducedDate === today).length;
    let taken = 0;
    for (const c of cards) {
      if (c.status !== "new") continue;
      if (introducedToday + taken >= opts.newPerDay) break;
      fresh.push(c);
      taken += 1;
    }
  } else {
    // Legacy: per-unit allowance, each granularity paces independently.
    const introduced: Record<string, number> = {};
    for (const c of cards) {
      if (c.introducedDate === today) introduced[c.unit] = (introduced[c.unit] ?? 0) + 1;
    }
    const taken: Record<string, number> = {};
    for (const c of cards) {
      if (c.status !== "new") continue;
      const cap = NEW_PER_DAY[c.unit] ?? 2;
      if ((introduced[c.unit] ?? 0) + (taken[c.unit] ?? 0) < cap) {
        fresh.push(c);
        taken[c.unit] = (taken[c.unit] ?? 0) + 1;
      }
    }
  }
  return [...due, ...fresh].slice(0, QUEUE_CAP);
}

// ── Stations (DERIVED — never stored) ──

/** A card's station grouping tag: explicit stationKey, else its own range. */
export function stationKeyOf(c: HifzCard): string {
  return c.stationKey ?? rangeKey(c);
}

/**
 * How many distinct NEW portions the user first began TODAY — counted by unique
 * stationKey among cards whose introducedDate === today. Seeded (already-carried)
 * cards never leave "new", so their introducedDate stays null and they are never
 * counted: this measures only genuine new learning. It is the SPEND against the
 * per-day new-learning budget (paceNewPerDay is the allowance). Pass a filter to
 * scope to one track (e.g. Qur'ān only, `c => c.startSurah !== 0`).
 */
export function portionsStartedToday(
  cards: HifzCard[],
  today: string,
  filter?: (card: HifzCard) => boolean
): number {
  const keys = new Set<string>();
  for (const card of cards) {
    if (card.introducedDate !== today) continue;
    if (filter && !filter(card)) continue;
    keys.add(stationKeyOf(card));
  }
  return keys.size;
}

/** Mushaf-order comparator by (surah, ayah) — no cumulative ordinal needed. */
function byMushaf(a: HifzCard, b: HifzCard): number {
  return a.startSurah - b.startSurah || a.startAyah - b.startAyah;
}

/**
 * Group cards into the journey's stations and compute each station's status.
 * The station OBJECT is fully derived from cards (no second source of truth):
 *   green  "memorized" — every member is review/memorized and none due today
 *   amber  "due"       — every member scheduled, but ≥1 is due today
 *   gold   "learning"  — the FIRST not-yet-complete station in EACH track (you are here)
 *   grey   "locked"    — a not-complete station after its track's gold one
 * One gold station exists PER track (see trackOf) whenever that track still has
 * learning left — so parallel tracks (the Qur'ān mushaf and the 99 Names) each keep
 * their own "you are here" instead of the first-sorting track stealing the only slot
 * and rendering the other track's current portion as a grey lock. `currentKey` is the
 * first learning station overall (null once everything is memorized).
 */
export function deriveStations(
  cards: HifzCard[],
  today: string,
  /** Groups stations into independent tracks, each with its own gold "you are here".
   *  Defaults to a single track (legacy linear journey). */
  trackOf: (card: HifzCard) => string = () => "single"
): { stations: HifzStation[]; currentKey: string | null } {
  const groups = new Map<string, HifzCard[]>();
  for (const c of cards) {
    const k = stationKeyOf(c);
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(c);
  }
  const raw = [...groups.entries()].map(([key, members]) => {
    members.sort(byMushaf);
    return { key, members };
  });
  raw.sort((a, b) => byMushaf(a.members[0], b.members[0]));

  let currentKey: string | null = null;
  const learningTracks = new Set<string>();
  const stations: HifzStation[] = raw.map(({ key, members }, index) => {
    const first = members[0];
    const last = members[members.length - 1];
    const allDone = members.every((m) => m.status === "review" || m.status === "memorized");
    const scheduled = members.filter((m) => m.status !== "new");
    const dueDates = scheduled.map((m) => m.due).sort();
    const anyDue = scheduled.some((m) => m.due <= today);

    let status: StationStatus;
    if (allDone) {
      status = anyDue ? "due" : "memorized";
    } else if (!learningTracks.has(trackOf(first))) {
      // First not-complete station in its track → that track's gold "you are here".
      status = "learning";
      learningTracks.add(trackOf(first));
      if (currentKey === null) currentKey = key;
    } else {
      status = "locked";
    }
    const source: CardSource = members.every((m) => m.source === "seeded")
      ? "seeded"
      : "learned";
    return {
      key,
      index,
      label: first.label,
      startSurah: first.startSurah,
      startAyah: first.startAyah,
      endSurah: last.endSurah,
      endAyah: last.endAyah,
      page: first.page,
      cardIds: members.map((m) => m.id),
      status,
      due: dueDates[0] ?? null,
      source,
    };
  });
  return { stations, currentKey };
}

/**
 * Count of reviews landing on each of the next `days` days starting today (index
 * 0 = today). Powers the PATH view's review forecast. Only counts cards already
 * scheduled (non-new); new cards enter via the daily cap, not a fixed date.
 */
export function reviewForecast(cards: HifzCard[], today: string, days = 7): number[] {
  const out = new Array(days).fill(0);
  const horizon = addDays(today, days - 1);
  for (const c of cards) {
    if (c.status === "new") continue;
    if (c.due < today) {
      out[0] += 1; // overdue collapses onto today
    } else if (c.due <= horizon) {
      out[diffDays(today, c.due)] += 1;
    }
  }
  return out;
}

/** Whole-day difference from `a` to `b` (both YYYY-MM-DD), assuming b ≥ a. */
function diffDays(a: string, b: string): number {
  const da = new Date(a + "T12:00:00").getTime();
  const db = new Date(b + "T12:00:00").getTime();
  return Math.round((db - da) / 86400000);
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
