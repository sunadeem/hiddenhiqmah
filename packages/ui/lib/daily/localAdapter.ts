// localStorage-backed DailyAdapter for signed-out users (and the website).
// Mirrors the server semantics from migration 002 EXACTLY: frozen per-day
// snapshots, the same _consec_run streak walk, dhikr daily + lifetime, and
// today-never-breaks. On sign-in, this local data is migrated up to Supabase.

import {
  buildPreviewDay,
  DEFAULT_CHECKLIST,
  expandPausedDates,
  gradeStatus,
  humaneRun,
  HUMANE_MERCY,
  type DailyAdapter,
  type DayItem,
  type DayRollup,
  type DhikrState,
  type DhikrDayCount,
  type ItemPatch,
  type NewItemInput,
  type PauseReason,
  type StreakPause,
  type Streaks,
  type UserItem,
} from "./types";

const STORE_KEY = "hiqmah-daily-v2";

interface LocalStore {
  userItems: UserItem[];
  dayItems: Record<string, DayItem[]>; // localDate -> frozen items
  dayRollup: Record<string, DayRollup>; // localDate -> rollup
  dhikrDaily: Record<string, Record<string, number>>; // dhikrKey -> { localDate -> count }
  dhikrLifetime: Record<string, number>; // dhikrKey -> count
  streaks: Streaks;
  startDate: string | null; // first day the user used the app (calendar boundary)
  pauses: StreakPause[]; // humane streaks: travel/illness/menstruation breaks
}

function emptyStore(): LocalStore {
  return {
    userItems: [],
    dayItems: {},
    dayRollup: {},
    dhikrDaily: {},
    dhikrLifetime: {},
    streaks: { overallCurrent: 0, overallBest: 0, prayerCurrent: 0, prayerBest: 0 },
    startDate: null,
    pauses: [],
  };
}

function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
}

export function createLocalDailyAdapter(storeKey: string = STORE_KEY): DailyAdapter {
  function load(): LocalStore {
    if (typeof window === "undefined") return emptyStore();
    try {
      const raw = window.localStorage.getItem(storeKey);
      if (!raw) return emptyStore();
      return { ...emptyStore(), ...(JSON.parse(raw) as LocalStore) };
    } catch {
      return emptyStore();
    }
  }

  function save(s: LocalStore) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storeKey, JSON.stringify(s));
    } catch {
      // quota / private mode — ignore
    }
  }

  // ── internal helpers (mirror the SQL) ──

  function materialize(s: LocalStore, date: string) {
    if (s.dayRollup[date]) return;
    const items: DayItem[] = s.userItems
      .filter((ui) => ui.isActive)
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
    // Reconcile keyed dhikr already at goal earlier today.
    for (const it of items) {
      if (it.dhikrKey && it.goalCount != null && !it.done) {
        const daily = s.dhikrDaily[it.dhikrKey]?.[date] ?? 0;
        if (daily >= it.goalCount) it.done = true;
      }
    }
    s.dayItems[date] = items;
    s.dayRollup[date] = {
      localDate: date,
      totalItems: items.length,
      doneItems: 0,
      prayersTotal: items.filter((i) => i.isPrayer).length,
      prayersDone: 0,
      status: "none",
    };
    refresh(s, date);
  }

  function refresh(s: LocalStore, date: string) {
    const items = s.dayItems[date] ?? [];
    const roll = s.dayRollup[date];
    if (!roll) return;
    const done = items.filter((i) => i.done);
    roll.doneItems = done.length;
    roll.prayersDone = done.filter((i) => i.isPrayer).length;
    roll.status = gradeStatus(roll.totalItems, roll.doneItems);
  }

  function recomputeStreaks(s: LocalStore, today: string) {
    const overallDates = Object.values(s.dayRollup)
      .filter((r) => r.localDate <= today && r.status !== "none")
      .map((r) => r.localDate)
      .sort()
      .reverse();
    const prayerDates = Object.values(s.dayRollup)
      .filter((r) => r.localDate <= today && r.prayersTotal > 0 && r.prayersDone === r.prayersTotal)
      .map((r) => r.localDate)
      .sort()
      .reverse();
    const paused = expandPausedDates(s.pauses ?? [], today);
    const overall = humaneRun(overallDates, paused, today, HUMANE_MERCY, s.startDate);
    const prayer = humaneRun(prayerDates, paused, today, HUMANE_MERCY, s.startDate);
    s.streaks = {
      overallCurrent: overall,
      overallBest: Math.max(s.streaks.overallBest, overall),
      prayerCurrent: prayer,
      prayerBest: Math.max(s.streaks.prayerBest, prayer),
    };
  }

  return {
    synced: false,

    async ensureSeeded() {
      const s = load();
      if (s.userItems.length > 0) return;
      s.userItems = DEFAULT_CHECKLIST.map((d, i) => ({
        id: uid(),
        sourceKey: d.key,
        label: d.label,
        kind: d.kind,
        goalCount: d.goalCount,
        dhikrKey: d.dhikrKey,
        sortOrder: i + 1,
        isActive: true,
      }));
      save(s);
    },

    async getUserItems() {
      return load()
        .userItems.filter((i) => i.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },

    async addItem(input: NewItemInput) {
      const s = load();
      const maxOrder = s.userItems
        .filter((i) => i.isActive)
        .reduce((m, i) => Math.max(m, i.sortOrder), 0);
      s.userItems.push({
        id: uid(),
        sourceKey: null,
        label: input.label,
        kind: input.kind,
        goalCount: input.goalCount ?? null,
        dhikrKey: input.dhikrKey ?? null,
        sortOrder: maxOrder + 1,
        isActive: true,
      });
      save(s);
    },

    async editItem(id: string, patch: ItemPatch) {
      const s = load();
      const it = s.userItems.find((i) => i.id === id);
      if (it) {
        if (patch.label !== undefined) it.label = patch.label;
        if (patch.goalCount !== undefined) it.goalCount = patch.goalCount;
        save(s);
      }
    },

    async removeItem(id: string) {
      const s = load();
      const it = s.userItems.find((i) => i.id === id);
      if (it) {
        it.isActive = false;
        save(s);
      }
    },

    async reorderItems(orderedIds: string[]) {
      const s = load();
      orderedIds.forEach((id, i) => {
        const it = s.userItems.find((u) => u.id === id);
        if (it) it.sortOrder = i;
      });
      save(s);
    },

    async getDay(localDate: string) {
      // Lazy: don't materialize on open. Refresh streaks, return the frozen day if
      // started, else a preview from the current list (pre-first-check edits apply).
      const s = load();
      if (!s.startDate) s.startDate = localDate; // first ever open = start day
      recomputeStreaks(s, localDate);
      save(s);
      if (s.dayRollup[localDate]) {
        return { rollup: s.dayRollup[localDate], items: s.dayItems[localDate] ?? [] };
      }
      return buildPreviewDay(localDate, s.userItems);
    },

    async setDone(localDate: string, userItemId: string, done: boolean) {
      const s = load();
      materialize(s, localDate);
      const it = (s.dayItems[localDate] ?? []).find((i) => i.userItemId === userItemId);
      if (it) it.done = done;
      refresh(s, localDate);
      recomputeStreaks(s, localDate);
      save(s);
    },

    async setCount(localDate: string, userItemId: string, count: number) {
      const s = load();
      materialize(s, localDate);
      const it = (s.dayItems[localDate] ?? []).find((i) => i.userItemId === userItemId);
      if (it && it.dhikrKey == null && it.goalCount != null) {
        it.countDone = Math.max(count, 0);
        it.done = it.countDone >= it.goalCount;
      }
      refresh(s, localDate);
      recomputeStreaks(s, localDate);
      save(s);
    },

    async getDhikr(dhikrKey: string, localDate: string): Promise<DhikrState> {
      const s = load();
      return {
        daily: s.dhikrDaily[dhikrKey]?.[localDate] ?? 0,
        lifetime: s.dhikrLifetime[dhikrKey] ?? 0,
      };
    },

    async incrementDhikr(dhikrKey: string, localDate: string, delta = 1): Promise<DhikrState> {
      const s = load();
      const d = Math.max(delta, 0);
      s.dhikrDaily[dhikrKey] = s.dhikrDaily[dhikrKey] ?? {};
      const daily = (s.dhikrDaily[dhikrKey][localDate] ?? 0) + d;
      s.dhikrDaily[dhikrKey][localDate] = daily;
      const lifetime = (s.dhikrLifetime[dhikrKey] ?? 0) + d;
      s.dhikrLifetime[dhikrKey] = lifetime;
      if (s.dayRollup[localDate]) {
        for (const it of s.dayItems[localDate] ?? []) {
          if (it.dhikrKey === dhikrKey && it.goalCount != null && !it.done && daily >= it.goalCount) {
            it.done = true;
          }
        }
        refresh(s, localDate);
        recomputeStreaks(s, localDate);
      }
      save(s);
      return { daily, lifetime };
    },

    async setDhikrCount(dhikrKey: string, localDate: string, count: number): Promise<DhikrState> {
      const s = load();
      const next = Math.max(count, 0);
      s.dhikrDaily[dhikrKey] = s.dhikrDaily[dhikrKey] ?? {};
      const old = s.dhikrDaily[dhikrKey][localDate] ?? 0;
      s.dhikrDaily[dhikrKey][localDate] = next;
      const lifetime = Math.max((s.dhikrLifetime[dhikrKey] ?? 0) + (next - old), 0);
      s.dhikrLifetime[dhikrKey] = lifetime;
      if (s.dayRollup[localDate]) {
        for (const it of s.dayItems[localDate] ?? []) {
          if (it.dhikrKey === dhikrKey && it.goalCount != null) {
            it.done = next >= it.goalCount;
          }
        }
        refresh(s, localDate);
        recomputeStreaks(s, localDate);
      }
      save(s);
      return { daily: next, lifetime };
    },

    async getDhikrRange(fromDate: string, toDate: string): Promise<DhikrDayCount[]> {
      const s = load();
      const out: DhikrDayCount[] = [];
      for (const [dhikrKey, byDate] of Object.entries(s.dhikrDaily)) {
        for (const [localDate, count] of Object.entries(byDate)) {
          if (localDate >= fromDate && localDate <= toDate && count > 0) {
            out.push({ dhikrKey, localDate, count });
          }
        }
      }
      return out;
    },

    async getDayRollups(fromDate: string, toDate: string) {
      return Object.values(load().dayRollup)
        .filter((r) => r.localDate >= fromDate && r.localDate <= toDate)
        .sort((a, b) => (a.localDate < b.localDate ? -1 : 1));
    },

    async getDayDetail(localDate: string) {
      return (load().dayItems[localDate] ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },

    async getStreaks(): Promise<Streaks> {
      return load().streaks;
    },

    async getStartDate(): Promise<string | null> {
      return load().startDate;
    },

    async recomputeStreaks(today: string) {
      const s = load();
      recomputeStreaks(s, today);
      save(s);
    },

    async getPauses(): Promise<StreakPause[]> {
      return (load().pauses ?? [])
        .slice()
        .sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
    },

    async getActivePause(): Promise<StreakPause | null> {
      return (load().pauses ?? []).find((p) => p.endDate === null) ?? null;
    },

    async startPause(reason: PauseReason, today: string) {
      const s = load();
      s.pauses = s.pauses ?? [];
      if (s.pauses.some((p) => p.endDate === null)) return; // already paused
      s.pauses.push({ id: uid(), startDate: today, endDate: null, reason });
      recomputeStreaks(s, today);
      save(s);
    },

    async endPause(today: string) {
      const s = load();
      const active = (s.pauses ?? []).find((p) => p.endDate === null);
      if (active) {
        active.endDate = today;
        recomputeStreaks(s, today);
      }
      save(s);
    },
  };
}
