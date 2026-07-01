"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, ChevronRight, CheckCircle2 } from "lucide-react";
import { useDailyAdapter } from "@/lib/daily/useDailyAdapter";
import { todayLocalDate } from "@hidden-hiqmah/ui/lib/daily/types";

/**
 * The invariant "Today" strip — sits above every Home style. It surfaces the
 * daily checklist progress + streak and is the fixed, shallow entry point into
 * the full Daily page (/muslim-daily), so habit-critical bits are never buried
 * regardless of which Home style the user picks. Reads the SAME daily adapter as
 * the Muslim Daily page, so the numbers always match.
 */
export default function TodayStrip() {
  const { adapter } = useDailyAdapter();
  const [done, setDone] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let alive = true;
    const today = todayLocalDate();
    (async () => {
      // Read-only: never call getDay() here — it would freeze today's snapshot
      // just from viewing Home (changing the "edits apply tomorrow" rule). Use
      // the frozen rollup if the day was already materialized, else the active
      // list count (0 done) so opening Home mutates nothing.
      try {
        await adapter.ensureSeeded();
        const rollups = await adapter.getDayRollups(today, today);
        if (!alive) return;
        if (rollups.length > 0) {
          setDone(rollups[0].doneItems);
          setTotal(rollups[0].totalItems);
        } else {
          const items = await adapter.getUserItems();
          if (!alive) return;
          setDone(0);
          setTotal(items.filter((i) => i.isActive).length);
        }
      } catch {
        /* leave as not-ready */
      }
      try {
        await adapter.recomputeStreaks(today);
        const s = await adapter.getStreaks();
        if (alive) setStreak(s.overallCurrent);
      } catch {
        /* keep 0 */
      }
    })();
    return () => {
      alive = false;
    };
  }, [adapter]);

  const ready = done !== null && total !== null;
  const allDone = ready && (total as number) > 0 && (done as number) >= (total as number);

  return (
    <Link
      href="/muslim-daily"
      className="flex items-center gap-3 card-bg rounded-2xl border sidebar-border px-4 py-3 touch-manipulation active:scale-[0.99] transition-transform"
    >
      <div className="w-9 h-9 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
        {allDone ? (
          <CheckCircle2 size={18} className="text-gold" />
        ) : (
          <Flame size={18} className="text-gold" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-themed leading-tight">
          {ready
            ? allDone
              ? "Today complete — masha'Allah"
              : `Today ${done}/${total}`
            : "Today"}
        </p>
        <p className="text-xs text-themed-muted mt-0.5 truncate">
          {streak > 0
            ? `${streak}-day streak · your daily checklist`
            : "Your daily checklist"}
        </p>
      </div>
      <ChevronRight size={18} className="text-themed-muted shrink-0" />
    </Link>
  );
}
