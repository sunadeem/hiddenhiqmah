"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import {
  NextPrayerCard,
  ContinueReadingCard,
  QuickActions,
} from "../MobileHomeDashboard";
import { pickTodaysInspiration } from "@/data/home-content";
import {
  getVisitStats,
  recordVisit,
  type VisitStats,
} from "@hidden-hiqmah/ui/lib/storage";

export default function HomeScreen() {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [inspiration] = useState(() => pickTodaysInspiration());

  useEffect(() => {
    setStats(recordVisit());
  }, []);

  return (
    <div className="space-y-3 pb-4">
      <TodaysVerseCard inspiration={inspiration} />

      <NextPrayerCard />

      <div className="grid grid-cols-2 gap-3">
        <StreakCard stats={stats} />
        <ContinueReadingCard />
      </div>

      <QuickActions />
    </div>
  );
}

function StreakCard({ stats }: { stats: VisitStats | null }) {
  const streak = stats?.currentStreak ?? 0;
  const best = stats?.longestStreak ?? 0;
  return (
    <div className="card-bg rounded-2xl border sidebar-border p-4 flex flex-col justify-center">
      <div className="flex items-center gap-2 text-themed-muted text-xs uppercase tracking-wider mb-1">
        <Flame size={14} className="text-gold" />
        <span>Streak</span>
      </div>
      <p className="text-2xl font-bold text-themed leading-none">
        {streak}{" "}
        <span className="text-base font-normal text-themed-muted">days</span>
      </p>
      <p className="text-xs text-themed-muted mt-1">
        {best > streak ? `Best ${best} days` : "Keep it going"}
      </p>
    </div>
  );
}

type Inspiration = ReturnType<typeof pickTodaysInspiration>;

function TodaysVerseCard({ inspiration }: { inspiration: Inspiration }) {
  return (
    <div className="card-bg rounded-2xl border sidebar-border p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/8 to-transparent pointer-events-none" />
      <div className="relative">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gold/70 mb-2">
          Today's {inspiration.type}
        </p>
        <p className="text-2xl font-arabic text-gold leading-loose text-center mb-3">
          {inspiration.arabic}
        </p>
        <p className="text-themed text-sm italic text-center leading-relaxed">
          &ldquo;{inspiration.english}&rdquo;
        </p>
        <p className="text-themed-muted text-[11px] mt-3 text-center">
          — {inspiration.reference}
        </p>
      </div>
    </div>
  );
}
