"use client";

import { Flame, BadgeCheck, ChevronRight } from "lucide-react";
import type { Streaks } from "../../lib/daily/types";

function plural(n: number) {
  return n === 1 ? "day" : "days";
}

/**
 * Daily streak (primary) + Prayer streak (beside it). Used in the Checklist
 * header and on the Home dashboard. Tapping opens the history calendar.
 */
export function StreakBadges({
  streaks,
  onOpen,
}: {
  streaks: Streaks;
  onOpen?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full flex items-stretch gap-3 text-left touch-manipulation"
      aria-label="Open streak history"
    >
      {/* Daily streak — primary */}
      <div className="flex-1 card-bg rounded-2xl border sidebar-border p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/12 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-themed-muted">
            <Flame size={13} className="text-gold" />
            Daily streak
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-themed leading-none">
              {streaks.overallCurrent}
            </span>
            <span className="text-sm text-themed-muted">{plural(streaks.overallCurrent)}</span>
          </div>
          {streaks.overallBest > 0 && (
            <div className="mt-1 text-[11px] text-themed-muted">Best {streaks.overallBest}</div>
          )}
        </div>
        {/* Subtle tap affordance — the whole badge opens the streak history */}
        <ChevronRight
          size={14}
          aria-hidden="true"
          className="absolute top-3 right-3 text-themed-muted"
        />
      </div>

      {/* Prayer streak — secondary */}
      <div className="w-[42%] card-bg rounded-2xl border sidebar-border p-4 relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-themed-muted">
            <BadgeCheck size={13} className="text-gold" />
            Prayers
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-themed leading-none">
              {streaks.prayerCurrent}
            </span>
            <span className="text-xs text-themed-muted">{plural(streaks.prayerCurrent)}</span>
          </div>
          {streaks.prayerBest > 0 && (
            <div className="mt-1 text-[11px] text-themed-muted">Best {streaks.prayerBest}</div>
          )}
        </div>
        {/* Subtle tap affordance — the whole badge opens the streak history */}
        <ChevronRight
          size={14}
          aria-hidden="true"
          className="absolute top-3 right-3 text-themed-muted"
        />
      </div>
    </button>
  );
}

export default StreakBadges;
