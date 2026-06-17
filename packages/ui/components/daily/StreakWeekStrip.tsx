"use client";

import { Heart, Slash } from "lucide-react";
import { mondayOf, shiftDate, type DayRollup, type DayStatus } from "../../lib/daily/types";

const LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

/** Mon–Sun completion dots for the current week. Tap any → open calendar. */
export function StreakWeekStrip({
  rollups,
  today,
  onOpen,
}: {
  rollups: DayRollup[];
  today: string;
  onOpen?: () => void;
}) {
  const monday = mondayOf(today);
  const statusByDate: Record<string, DayStatus> = {};
  for (const r of rollups) statusByDate[r.localDate] = r.status;

  const days = Array.from({ length: 7 }, (_, i) => shiftDate(monday, i));

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full card-bg rounded-2xl border sidebar-border px-3 py-3 flex justify-between touch-manipulation"
      aria-label="Open streak calendar"
    >
      {days.map((date, i) => {
        const future = date > today;
        const isToday = date === today;
        const status = statusByDate[date] ?? "none";
        return (
          <div key={date} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-themed-muted">{LETTERS[i]}</span>
            <span
              className={[
                "w-7 h-7 rounded-full flex items-center justify-center",
                isToday ? "ring-1 ring-[var(--color-gold)]" : "",
                future
                  ? "bg-white/[0.04] opacity-40"
                  : status === "full"
                  ? "bg-[var(--color-gold)] text-[var(--color-bg)]"
                  : status === "partial"
                  ? "border border-[var(--color-gold)]/60 text-gold"
                  : "bg-white/[0.06] text-themed-muted",
              ].join(" ")}
            >
              {!future && status === "full" && <Heart size={13} fill="currentColor" />}
              {!future && status === "partial" && <Slash size={12} strokeWidth={2.5} />}
            </span>
          </div>
        );
      })}
    </button>
  );
}

export default StreakWeekStrip;
