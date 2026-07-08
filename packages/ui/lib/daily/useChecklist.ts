"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DAILY_CHANGED_EVENT,
  gradeStatus,
  type DailyAdapter,
  type DayItem,
  type DayRollup,
  type ItemKind,
  type NewItemInput,
  type Streaks,
} from "./types";

// A checklist row = the frozen day item + (for keyed dhikr) its live daily count.
export interface ChecklistRow extends DayItem {
  dhikrDaily?: number; // present for keyed dhikr items; the displayed progress
}

function rowKindOf(r: DayItem): "check" | "count" | "dhikr" {
  if (r.goalCount == null) return "check"; // simple checkbox (prayers, sections, tasks)
  return r.dhikrKey ? "dhikr" : "count";
}

function emitDailyChanged() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent(DAILY_CHANGED_EVENT));
}

const EMPTY_STREAKS: Streaks = {
  overallCurrent: 0,
  overallBest: 0,
  prayerCurrent: 0,
  prayerBest: 0,
};

export interface UseChecklist {
  loading: boolean;
  rows: ChecklistRow[];
  rollup: DayRollup | null;
  streaks: Streaks;
  reload: () => Promise<void>;
  /** Checkbox tap: toggle / manual-complete / reset, by row type. */
  check: (row: ChecklistRow) => void;
  /** +1 for count / dhikr rows (debounced flush for dhikr). */
  bump: (row: ChecklistRow) => void;
}

export function useChecklist(adapter: DailyAdapter, today: string): UseChecklist {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ChecklistRow[]>([]);
  const [rollup, setRollup] = useState<DayRollup | null>(null);
  const [streaks, setStreaks] = useState<Streaks>(EMPTY_STREAKS);

  // Pending debounced dhikr deltas, keyed by dhikrKey.
  const pending = useRef<Record<string, number>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const recomputeRollup = useCallback(
    (next: ChecklistRow[]): DayRollup => {
      const total = next.length;
      const done = next.filter((r) => r.done).length;
      const prayersTotal = next.filter((r) => r.isPrayer).length;
      const prayersDone = next.filter((r) => r.isPrayer && r.done).length;
      return {
        localDate: today,
        totalItems: total,
        doneItems: done,
        prayersTotal,
        prayersDone,
        status: gradeStatus(total, done),
      };
    },
    [today]
  );

  const reload = useCallback(async () => {
    await adapter.ensureSeeded();
    const { rollup: r, items } = await adapter.getDay(today);
    // Fetch live daily counts for keyed dhikr rows.
    const keyed = items.filter((i) => i.dhikrKey && i.goalCount != null);
    const counts = await Promise.all(
      keyed.map((i) => adapter.getDhikr(i.dhikrKey as string, today))
    );
    const dailyByKey: Record<string, number> = {};
    keyed.forEach((i, idx) => {
      dailyByKey[i.dhikrKey as string] = counts[idx].daily;
    });
    const next: ChecklistRow[] = items.map((i) => ({
      ...i,
      dhikrDaily: i.dhikrKey && i.goalCount != null ? dailyByKey[i.dhikrKey] ?? 0 : undefined,
    }));
    setRows(next);
    setRollup(r);
    setStreaks(await adapter.getStreaks());
    setLoading(false);
  }, [adapter, today]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    reload().catch(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [reload]);

  const refreshStreaks = useCallback(async () => {
    try {
      setStreaks(await adapter.getStreaks());
    } catch {
      /* ignore */
    }
  }, [adapter]);

  const check = useCallback(
    (row: ChecklistRow) => {
      const kind = rowKindOf(row);
      const nextDone = !row.done;
      // Optimistic UI.
      setRows((prev) => {
        const next = prev.map((r) =>
          r.userItemId === row.userItemId
            ? {
                ...r,
                done: nextDone,
                dhikrDaily:
                  kind === "dhikr"
                    ? nextDone
                      ? row.goalCount ?? 0
                      : 0
                    : r.dhikrDaily,
                countDone: kind === "count" ? (nextDone ? row.goalCount ?? 0 : 0) : r.countDone,
              }
            : r
        );
        setRollup(recomputeRollup(next));
        return next;
      });
      // Persist.
      const id = row.userItemId as string;
      const run = async () => {
        if (kind === "dhikr") {
          await adapter.setDhikrCount(row.dhikrKey as string, today, nextDone ? row.goalCount ?? 0 : 0);
        } else if (kind === "count") {
          await adapter.setCount(today, id, nextDone ? row.goalCount ?? 0 : 0);
        } else {
          await adapter.setDone(today, id, nextDone);
        }
        await refreshStreaks();
        emitDailyChanged();
      };
      run().catch(() => reload());
    },
    [adapter, today, recomputeRollup, refreshStreaks, reload]
  );

  const flushDhikr = useCallback(
    (dhikrKey: string, goalCount: number | null) => {
      const delta = pending.current[dhikrKey] ?? 0;
      pending.current[dhikrKey] = 0;
      if (delta <= 0) return;
      adapter
        .incrementDhikr(dhikrKey, today, delta)
        .then((state) => {
          // Reconcile to the authoritative daily count.
          setRows((prev) =>
            prev.map((r) =>
              r.dhikrKey === dhikrKey
                ? {
                    ...r,
                    dhikrDaily: state.daily,
                    done: goalCount != null ? state.daily >= goalCount : r.done,
                  }
                : r
            )
          );
          return refreshStreaks();
        })
        .then(emitDailyChanged)
        .catch(() => reload());
    },
    [adapter, today, refreshStreaks, reload]
  );

  const bump = useCallback(
    (row: ChecklistRow) => {
      const kind = rowKindOf(row);
      if (kind === "count") {
        const nextCount = (row.countDone ?? 0) + 1;
        const done = row.goalCount != null && nextCount >= row.goalCount;
        setRows((prev) => {
          const next = prev.map((r) =>
            r.userItemId === row.userItemId ? { ...r, countDone: nextCount, done } : r
          );
          setRollup(recomputeRollup(next));
          return next;
        });
        adapter
          .setCount(today, row.userItemId as string, nextCount)
          .then(refreshStreaks)
          .then(emitDailyChanged)
          .catch(() => reload());
        return;
      }
      if (kind === "dhikr") {
        const key = row.dhikrKey as string;
        const nextDaily = (row.dhikrDaily ?? 0) + 1;
        const done = row.goalCount != null && nextDaily >= row.goalCount;
        setRows((prev) => {
          const next = prev.map((r) =>
            r.dhikrKey === key ? { ...r, dhikrDaily: nextDaily, done } : r
          );
          setRollup(recomputeRollup(next));
          return next;
        });
        // Debounce the network increment.
        pending.current[key] = (pending.current[key] ?? 0) + 1;
        if (timers.current[key]) clearTimeout(timers.current[key]);
        timers.current[key] = setTimeout(() => flushDhikr(key, row.goalCount), 600);
      }
    },
    [adapter, today, recomputeRollup, refreshStreaks, reload, flushDhikr]
  );

  // Flush any pending dhikr on unmount.
  useEffect(() => {
    const t = timers.current;
    const p = pending.current;
    return () => {
      Object.keys(p).forEach((key) => {
        if (t[key]) clearTimeout(t[key]);
        const delta = p[key] ?? 0;
        if (delta > 0) void adapter.incrementDhikr(key, today, delta);
      });
    };
  }, [adapter, today]);

  return { loading, rows, rollup, streaks, reload, check, bump };
}

export { rowKindOf };
export type { ItemKind, NewItemInput };
