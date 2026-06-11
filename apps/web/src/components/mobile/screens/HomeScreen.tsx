"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import {
  NextPrayerCard,
  ContinueReadingCard,
  QuickActions,
} from "../MobileHomeDashboard";
import QiblahSheet from "../QiblahSheet";
import PullToRefresh from "../PullToRefresh";
import LongPressActions, { type LongPressItem } from "../LongPressActions";
import { pickTodaysInspiration } from "@/data/home-content";
import {
  getVisitStats,
  recordVisit,
  type VisitStats,
} from "@hidden-hiqmah/ui/lib/storage";

export default function HomeScreen() {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [inspiration, setInspiration] = useState(() => pickTodaysInspiration());
  const [qiblahOpen, setQiblahOpen] = useState(false);
  const [prayerKey, setPrayerKey] = useState(0);

  useEffect(() => {
    setStats(recordVisit());
  }, []);

  const handleRefresh = async () => {
    // Refresh everything on the dashboard:
    setStats(getVisitStats()); // streak
    setInspiration(pickTodaysInspiration()); // today's verse/hadith
    setPrayerKey((k) => k + 1); // remount NextPrayerCard → re-fetch prayer times + location
    // Give the prayer-time fetch a beat so the spinner reflects real work.
    await new Promise((r) => setTimeout(r, 900));
  };

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-3 pb-4">
          <TodaysVerseCard inspiration={inspiration} />

          <NextPrayerCard key={prayerKey} />

          <div className="grid grid-cols-2 gap-3">
            <StreakCard stats={stats} />
            <ContinueReadingCard />
          </div>

          <QuickActions onQiblahClick={() => setQiblahOpen(true)} />
        </div>
      </PullToRefresh>
      <QiblahSheet open={qiblahOpen} onClose={() => setQiblahOpen(false)} />
    </>
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
  const isVerse = inspiration.type === "Quran";
  let href: string | undefined;
  if (isVerse) {
    const m = inspiration.reference.match(/(\d+):(\d+)/);
    if (m) href = `/quran/${m[1]}?v=${m[2]}`;
  }
  const item: LongPressItem = {
    bookmarkType: isVerse ? "verse" : "hadith",
    bookmarkId: inspiration.reference,
    title: `Today's ${inspiration.type}`,
    arabic: inspiration.arabic,
    english: inspiration.english,
    reference: inspiration.reference,
    href,
  };

  return (
    <LongPressActions item={item}>
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
    </LongPressActions>
  );
}
