// Hifz (Qur'an memorization) — data types + adapter port.
// Pure: no platform / content imports, so it's shared across web + native and
// mirrors the daily-checklist adapter architecture.

export type Granularity = "page" | "ayah" | "surah" | "range";
export type CardStatus = "new" | "learning" | "review" | "memorized";
export type Grade = "again" | "hard" | "good" | "easy";

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
  due: string; // YYYY-MM-DD — next review date
  lastReviewed: string | null; // YYYY-MM-DD
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface NewCardInput {
  unit: Granularity;
  label: string;
  page: number | null;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
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
  removeCard(id: string): Promise<void>;
  /** Today's review session: due reviews (oldest first) + up to NEW_PER_DAY new cards. */
  getQueue(today: string): Promise<HifzCard[]>;
  /** Grade a card; reschedules it (SM-2) and logs the review. */
  grade(id: string, grade: Grade, today: string): Promise<void>;
  getStats(today: string): Promise<HifzStats>;
  /** Recompute the streak cache against the real today. */
  recomputeStreak(today: string): Promise<void>;
}
