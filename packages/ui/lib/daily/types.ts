// Daily checklist / streaks / dhikr — shared port (no Supabase/Capacitor imports).
//
// This is the contract every screen + component depends on. Two implementations:
//   * createSupabaseDailyAdapter(client, userId)  — apps/web (signed-in, synced)
//   * createLocalDailyAdapter()                    — here   (signed-out / website)
//
// Rule: the HOST computes the device-local date (todayLocalDate) and passes it
// into every call. The adapter NEVER derives the date (keeps the UTC bug out).

export type ItemKind = "prayer" | "dhikr" | "task";
export type DayStatus = "none" | "partial" | "full";

export interface UserItem {
  id: string;
  sourceKey: string | null; // default key it came from; null = user-created
  label: string;
  kind: ItemKind;
  goalCount: number | null; // count target (e.g. 100); null = simple check
  dhikrKey: string | null; // shared dhikr identity (Worship + lifetime)
  sortOrder: number;
  isActive: boolean;
}

// A new item the user adds (id/sortOrder assigned by the adapter).
export interface NewItemInput {
  label: string;
  kind: ItemKind;
  goalCount?: number | null;
  dhikrKey?: string | null;
}

export interface ItemPatch {
  label?: string;
  goalCount?: number | null;
}

// A frozen per-day snapshot row (today's list + calendar-detail).
export interface DayItem {
  userItemId: string | null;
  label: string;
  kind: ItemKind;
  goalCount: number | null;
  dhikrKey: string | null;
  sortOrder: number;
  countDone: number; // non-dhikr count items; keyed dhikr derive from getDhikr()
  done: boolean;
  isPrayer: boolean;
}

export interface DayRollup {
  localDate: string;
  totalItems: number;
  doneItems: number;
  prayersTotal: number;
  prayersDone: number;
  status: DayStatus;
}

export interface Streaks {
  overallCurrent: number;
  overallBest: number;
  prayerCurrent: number;
  prayerBest: number;
}

// ── Humane streaks ──────────────────────────────────────────────────────────
// A pause (travel / illness / menstruation) makes those days transparent to the
// streak walk — they never count as a "miss" (the streak bridges over them).
export type PauseReason = "travel" | "unwell" | "menses";

export interface StreakPause {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // null = ongoing (active up to today)
  reason: PauseReason;
}

export interface DhikrState {
  daily: number;
  lifetime: number;
}

/** One (dhikrKey, date) count — used to compute day/week/month dhikr stats. */
export interface DhikrDayCount {
  dhikrKey: string;
  localDate: string;
  count: number;
}

export interface DailyAdapter {
  /** Whether this adapter persists to an account (true) or device-only (false). */
  readonly synced: boolean;

  /** Seed the per-user list from defaults if empty. Idempotent. */
  ensureSeeded(): Promise<void>;

  // ── List management (edits apply going forward; never rewrite past days) ──
  getUserItems(): Promise<UserItem[]>;
  addItem(input: NewItemInput): Promise<void>;
  editItem(id: string, patch: ItemPatch): Promise<void>;
  removeItem(id: string): Promise<void>; // soft-delete
  reorderItems(orderedIds: string[]): Promise<void>;

  // ── Today (materializes the frozen snapshot on first call of a date) ──
  getDay(localDate: string): Promise<{ rollup: DayRollup; items: DayItem[] }>;
  setDone(localDate: string, userItemId: string, done: boolean): Promise<void>;
  setCount(localDate: string, userItemId: string, count: number): Promise<void>;

  // ── Dhikr (shared by Worship + checklist via dhikrKey) ──
  getDhikr(dhikrKey: string, localDate: string): Promise<DhikrState>;
  incrementDhikr(dhikrKey: string, localDate: string, delta?: number): Promise<DhikrState>;
  setDhikrCount(dhikrKey: string, localDate: string, count: number): Promise<DhikrState>;
  /** Reset TODAY's count to 0 WITHOUT reducing the lifetime tally. (setDhikrCount
   *  uses delta math that would subtract today from lifetime — required for
   *  checklist check/uncheck toggles, so reset needs its own path.) */
  resetDhikrDay(dhikrKey: string, localDate: string): Promise<DhikrState>;
  /** Raw per-(dhikr, date) counts within [fromDate, toDate] inclusive — for stats. */
  getDhikrRange(fromDate: string, toDate: string): Promise<DhikrDayCount[]>;

  // ── History (frozen) + streaks ──
  /** Frozen rollups for a date range, inclusive (calendar grid). */
  getDayRollups(fromDate: string, toDate: string): Promise<DayRollup[]>;
  /** Frozen items for one past/current day, ordered chronologically (calendar detail). */
  getDayDetail(localDate: string): Promise<DayItem[]>;
  getStreaks(): Promise<Streaks>;

  /** The day the user started (account creation, or first local use). Days before
      this render as empty in the calendar, not "missed". */
  getStartDate(): Promise<string | null>;
  /** Recompute streak caches against the real today (e.g. after editing a past day). */
  recomputeStreaks(today: string): Promise<void>;

  // ── Humane streaks: pauses ──
  /** All pauses (most recent first), for display. */
  getPauses(): Promise<StreakPause[]>;
  /** The currently-active (ongoing, endDate=null) pause, if any. */
  getActivePause(): Promise<StreakPause | null>;
  /** Start an ongoing pause from `today` (no-op if one is already active). */
  startPause(reason: PauseReason, today: string): Promise<void>;
  /** End the active pause at `today` (inclusive). */
  endPause(today: string): Promise<void>;
}

// ── Date helpers (device-local, from components — never toISOString/UTC) ──

export function todayLocalDate(): string {
  return toLocalDateString(new Date());
}

export function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Shift a YYYY-MM-DD string by n days (DST-safe; midday anchor). */
export function shiftDate(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toLocalDateString(d);
}

/** Monday-of-week for a given date (Mon–Sun strip). */
export function mondayOf(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  return shiftDate(dateStr, -dow);
}

export function comparePrevailing(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

// ── Default checklist (mirrors migration 002 seed; used by the local adapter) ──

export interface DefaultItem {
  key: string;
  label: string;
  kind: ItemKind;
  goalCount: number | null;
  dhikrKey: string | null;
}

export const DEFAULT_CHECKLIST: DefaultItem[] = [
  { key: "fajr", label: "Fajr prayer", kind: "prayer", goalCount: null, dhikrKey: null },
  { key: "morning_adhkar", label: "Morning adhkar", kind: "dhikr", goalCount: null, dhikrKey: "morning_adhkar" },
  { key: "quran_page", label: "Read Quran — 1 page", kind: "task", goalCount: 1, dhikrKey: null },
  { key: "duha", label: "Duha prayer", kind: "task", goalCount: null, dhikrKey: null },
  { key: "dhuhr", label: "Dhuhr prayer", kind: "prayer", goalCount: null, dhikrKey: null },
  { key: "asr", label: "Asr prayer", kind: "prayer", goalCount: null, dhikrKey: null },
  { key: "salawat", label: "Salawat on the Prophet ﷺ", kind: "dhikr", goalCount: 10, dhikrKey: "salawat" },
  { key: "istighfar", label: "Istighfar", kind: "dhikr", goalCount: 100, dhikrKey: "istighfar" },
  { key: "sadaqah", label: "Give sadaqah", kind: "task", goalCount: null, dhikrKey: null },
  { key: "maghrib", label: "Maghrib prayer", kind: "prayer", goalCount: null, dhikrKey: null },
  { key: "evening_adhkar", label: "Evening adhkar", kind: "dhikr", goalCount: null, dhikrKey: "evening_adhkar" },
  { key: "isha", label: "Isha prayer", kind: "prayer", goalCount: null, dhikrKey: null },
  { key: "dua_parents", label: "Du'a for parents", kind: "task", goalCount: null, dhikrKey: null },
  { key: "witr", label: "Witr prayer", kind: "task", goalCount: null, dhikrKey: null },
  { key: "surah_mulk", label: "Surah al-Mulk before sleep", kind: "dhikr", goalCount: null, dhikrKey: "surah_mulk" },
];

/** Status grading — mirrors the SQL (0/0-guarded, never > full). */
export function gradeStatus(totalItems: number, doneItems: number): DayStatus {
  if (totalItems === 0 || doneItems === 0) return "none";
  if (doneItems >= totalItems) return "full";
  return "partial";
}

/**
 * Build an unsaved "preview" of a day from the current active list, for a day
 * that hasn't been materialized yet (i.e. before the first check today). The
 * day is frozen on the first real interaction, so edits made before then apply
 * today; edits after apply tomorrow.
 */
export function buildPreviewDay(
  localDate: string,
  userItems: UserItem[]
): { rollup: DayRollup; items: DayItem[] } {
  const items: DayItem[] = userItems
    .filter((i) => i.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((ui) => ({
      userItemId: ui.id,
      label: ui.label,
      kind: ui.kind,
      goalCount: ui.goalCount,
      dhikrKey: ui.dhikrKey,
      sortOrder: ui.sortOrder,
      countDone: 0,
      done: false,
      isPrayer: ui.kind === "prayer",
    }));
  return {
    rollup: {
      localDate,
      totalItems: items.length,
      doneItems: 0,
      prayersTotal: items.filter((i) => i.isPrayer).length,
      prayersDone: 0,
      status: "none",
    },
    items,
  };
}

/** Consecutive-run streak walk — mirrors the SQL _consec_run (today never breaks). */
export function consecRun(qualifyingDatesDesc: string[], today: string): number {
  let expected = today;
  let run = 0;
  for (const d of qualifyingDatesDesc) {
    if (d === expected) {
      run += 1;
      expected = shiftDate(expected, -1);
    } else if (d === shiftDate(expected, -1) && expected === today) {
      // today not yet qualifying; streak continues from yesterday
      run += 1;
      expected = shiftDate(d, -1);
    } else {
      break; // calendar gap → streak breaks
    }
  }
  return run;
}

// ── Humane streaks ──────────────────────────────────────────────────────────

/** Forgiven missed days before a streak breaks (a single slip won't reset you). */
export const HUMANE_MERCY = 1;

/** Expand pause ranges into the set of paused YYYY-MM-DD dates (ongoing → up to today). */
export function expandPausedDates(
  pauses: { startDate: string; endDate: string | null }[],
  today: string
): Set<string> {
  const set = new Set<string>();
  for (const p of pauses) {
    if (!p.startDate) continue;
    let d = p.startDate;
    const end = p.endDate ?? today; // ongoing pause runs up to today
    let guard = 0;
    while (d <= end && guard++ < 800) {
      set.add(d);
      d = shiftDate(d, 1);
    }
  }
  return set;
}

/**
 * Humane streak walk (mirrors the SQL _consec_run_humane). Walks back from today:
 *   - paused days are transparent (skipped, never break, don't count)
 *   - qualifying (done) days count
 *   - a missed day is forgiven while mercy remains; once spent, a miss breaks it
 *   - today is never a break (an incomplete today just starts the walk at yesterday)
 * Stops at `startDate` so days before the user began aren't treated as misses.
 */
export function humaneRun(
  qualifyingDatesDesc: string[],
  paused: Set<string>,
  today: string,
  mercy: number,
  startDate?: string | null
): number {
  const qual = new Set(qualifyingDatesDesc);
  let cursor = qual.has(today) ? today : shiftDate(today, -1);
  let run = 0;
  let mercyLeft = mercy;
  let guard = 0;
  while (guard++ < 3660) {
    if (startDate && cursor < startDate) break;
    if (paused.has(cursor)) {
      cursor = shiftDate(cursor, -1);
      continue;
    }
    if (qual.has(cursor)) {
      run += 1;
      cursor = shiftDate(cursor, -1);
      continue;
    }
    // missed day
    if (mercyLeft > 0) {
      mercyLeft -= 1;
      cursor = shiftDate(cursor, -1);
      continue;
    }
    break;
  }
  return run;
}
