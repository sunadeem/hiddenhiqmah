// Hifz (Qur'an memorization) — data types + adapter port.
// Pure: no platform / content imports, so it's shared across web + native and
// mirrors the daily-checklist adapter architecture.

export type Granularity = "page" | "ayah" | "surah" | "range";
export type CardStatus = "new" | "learning" | "review" | "memorized";
export type Grade = "again" | "hard" | "good" | "easy";
/** Memorization content: Qur'an āyāt (default) or the 99 Names of Allah. */
export type ContentKind = "quran" | "asma";

// ── "Your Hifz Path" redesign — plan, pace, stations ──
//
// A station is a small Qur'an portion (~3–7 āyāt, sized by pace) that the user
// learns as one gold "you are here" unit. Underneath, a station is nothing more
// than an ordered set of existing HifzCards sharing a `stationKey`; the SM-2
// engine is untouched. The Station OBJECT is always DERIVED from cards + plan
// (see srs.deriveStations) — never persisted — so there's one source of truth.

/** What the user is here to do. Drives seeding vs new-learning emphasis. */
export type Intention = "start" | "maintain" | "both";
/** Pace preset → NEW_PER_DAY + station size (see srs.PACE). */
export type Pace = "gentle" | "steady" | "devoted";
/** Where a card came from: normal new-learning vs an already-memorized seed. */
export type CardSource = "learned" | "seeded";
/** How well the user already carries a seeded portion (drives staggered due). */
export type SeedStrength = "strong" | "refreshing";

/** Anywhere the user can begin — a sūrah, a juz, or a mushaf page. */
export interface HifzStartPoint {
  kind: "surah" | "juz" | "page";
  surah?: number;
  juz?: number;
  page?: number;
}

/**
 * The user's memorization plan. Exactly ONE per user (a singleton), stored
 * device-side in the local store and account-side in `hifz_plan` (one row per
 * user). Station boundaries + the new-card cap are derived from `pace`.
 */
export interface HifzPlan {
  intention: Intention;
  pace: Pace;
  startPoint: HifzStartPoint;
  /** Ordering scope for the journey (mirrors quran.Journey string union). */
  journey: string | null;
  /** Preferred daily practice time "HH:MM" (local) for the reminder; null = none. */
  quietTime: string | null;
  /** New portions to learn per day. Null ⇒ derive from pace (gentle 1 / steady 2
   *  / devoted 3). Set via the plan editor; the cutoff + "N of M today" use it. */
  dailyPortions?: number | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface AyahRef {
  surah: number;
  ayah: number;
}

/**
 * The unit of memorization + review. A page, an ayah, or a surah all collapse to
 * the same primitive — a card pointing at an ayah RANGE — so the SRS scheduler
 * treats every granularity identically.
 */
export interface HifzCard {
  id: string;
  unit: Granularity; // how it was created (display only)
  label: string; // e.g. "Page 3", "An-Naba 1–5", "Al-Ikhlās"
  page: number | null; // mushaf page if unit === "page" (for the progress map)
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  // ── SRS state (SM-2) ──
  status: CardStatus;
  ease: number; // ease factor (default 2.5, min 1.3)
  interval: number; // days until next review
  reps: number; // successful reviews
  lapses: number; // times forgotten
  step: number; // learning-step index (while new/learning)
  introducedDate: string | null; // day this card first left "new" (per-day new cap)
  due: string; // YYYY-MM-DD — next review date
  lastReviewed: string | null; // YYYY-MM-DD
  createdAt: string; // ISO
  updatedAt: string; // ISO
  // ── "Your Hifz Path" additions (all optional → old rows/stores stay valid) ──
  /**
   * Stable grouping tag: cards sharing a stationKey form one station. Assigned
   * once at build time from the plan's pace (so the grouping never shifts if the
   * user later changes pace). Absent on legacy cards → srs.stationKeyOf() falls
   * back to the card's own range, so every card still maps to exactly one station.
   */
  stationKey?: string;
  /** Learn-ladder "Fade" peeks on this card since introduction (informs the Seal grade). */
  peekCount?: number;
  /** "learned" = normal new-learning; "seeded" = an already-memorized seed (staggered). */
  source?: CardSource;
  /**
   * Content type — Qur'an āyāt (default/absent) or the 99 Names of Allah. For
   * "asma", startAyah/endAyah are Name indices (1–99) and the surah fields are 0,
   * so rangeKey/stationKey stay unique and the SRS engine treats them identically.
   */
  contentKind?: ContentKind;
  /** Explicit path position (float). Absent ⇒ derived from muṣḥaf order. Set when a
   *  portion is inserted out of reading order ("start next" / "after current sūrah"). */
  order?: number | null;
}

export interface NewCardInput {
  unit: Granularity;
  label: string;
  page: number | null;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  /** Station grouping tag (see HifzCard.stationKey). Omit → derived from range. */
  stationKey?: string;
  /** Defaults to "learned"; the seeding path passes "seeded". */
  source?: CardSource;
  /** Defaults to "quran"; the 99-Names path passes "asma". */
  contentKind?: ContentKind;
  /** Explicit path position (see HifzCard.order). Omit ⇒ natural muṣḥaf order. */
  order?: number | null;
}

/**
 * An already-memorized portion the user "already carries". Seeds as a REVIEW
 * card (not new) with a staggered due date so it never lands a day-one wall of
 * reviews. `strength` picks the stagger window (see srs.seedCard).
 */
export interface SeedCardInput extends NewCardInput {
  strength: SeedStrength;
}

/** A station = an ordered set of cards, DERIVED (never stored). */
export type StationStatus = "locked" | "learning" | "due" | "memorized";

export interface HifzStation {
  key: string; // the shared stationKey
  index: number; // 0-based position along the path
  label: string; // first member card's label (UI may relabel from range)
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  page: number | null;
  cardIds: string[]; // member cards, mushaf order
  status: StationStatus; // green=memorized · amber=due · gold=learning · grey=locked
  due: string | null; // earliest due among non-new members (null if none scheduled)
  source: CardSource; // "seeded" if all members are seeds, else "learned"
}

export interface HifzReview {
  id: string;
  cardId: string;
  grade: Grade;
  localDate: string; // YYYY-MM-DD
  at: string; // ISO
}

export interface HifzStats {
  total: number;
  memorized: number;
  review: number;
  learning: number;
  fresh: number; // status "new"
  dueToday: number; // reviews due + new to introduce today
  streakCurrent: number;
  streakBest: number;
}

/** The port. Local (device) + Supabase (synced) both implement this. */
export interface HifzAdapter {
  /** true = persists to an account (synced); false = device-only. */
  readonly synced: boolean;
  getCards(): Promise<HifzCard[]>;
  /** Add cards; skips any whose ayah-range already exists (idempotent). */
  addCards(inputs: NewCardInput[]): Promise<void>;
  /**
   * Seed already-memorized portions as REVIEW cards with staggered due dates
   * (Strong ≈ 3-week spread, Refreshing ≈ 1-week). Idempotent by range like
   * addCards. Never introduces a day-one review wall. See srs.seedCards.
   */
  seedCards?(inputs: SeedCardInput[]): Promise<void>;
  removeCard(id: string): Promise<void>;
  /** The singleton plan (null until onboarding completes). */
  getPlan?(): Promise<HifzPlan | null>;
  savePlan?(plan: HifzPlan): Promise<void>;
  /**
   * Record a peek from the Learn-ladder "Fade" rung (informs the Seal grade).
   * Pure counter bump — does NOT touch the SRS schedule.
   */
  bumpPeek?(id: string): Promise<void>;
  /** Update the path order (card_order) of existing cards — used to re-sort the
   *  upcoming path by a new journey. Optional (older adapters omit it). */
  reorderCards?(updates: { id: string; order: number }[]): Promise<void>;
  /** Today's review session: due reviews (oldest first) + up to NEW_PER_DAY new cards. */
  getQueue(today: string): Promise<HifzCard[]>;
  /** Grade a card; reschedules it (SM-2) and logs the review. */
  grade(id: string, grade: Grade, today: string): Promise<void>;
  getStats(today: string): Promise<HifzStats>;
  /** Recompute the streak cache against the real today. */
  recomputeStreak(today: string): Promise<void>;
}
