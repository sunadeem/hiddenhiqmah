"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { recordVisit } from "@hidden-hiqmah/ui/lib/storage";
import { todayLocalDate, type Streaks } from "@hidden-hiqmah/ui/lib/daily/types";
import { useDailyAdapter } from "@/lib/daily/useDailyAdapter";

const ZERO_STREAKS: Streaks = {
  overallCurrent: 0,
  overallBest: 0,
  prayerCurrent: 0,
  prayerBest: 0,
};

export default function HomeScreen() {
  const { adapter } = useDailyAdapter();
  const [streaks, setStreaks] = useState<Streaks>(ZERO_STREAKS);
  const [inspiration, setInspiration] = useState(() => pickTodaysInspiration());
  const [qiblahOpen, setQiblahOpen] = useState(false);
  const [prayerKey, setPrayerKey] = useState(0);

  useEffect(() => {
    recordVisit();
  }, []);

  // Load the live daily-checklist streak (recompute against today, then read).
  useEffect(() => {
    let alive = true;
    const today = todayLocalDate();
    adapter
      .recomputeStreaks(today)
      .then(() => adapter.getStreaks())
      .then((s) => alive && setStreaks(s))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [adapter]);

  const handleRefresh = async () => {
    setInspiration(pickTodaysInspiration());
    setPrayerKey((k) => k + 1); // remount NextPrayerCard → re-fetch prayer times + location
    adapter.getStreaks().then(setStreaks).catch(() => {});
    await new Promise((r) => setTimeout(r, 900));
  };

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-3 pb-4">
          <TodaysVerseCard inspiration={inspiration} />

          <NextPrayerCard key={prayerKey} />

          <div className="grid grid-cols-2 gap-3">
            <StreakCard streaks={streaks} />
            <ContinueReadingCard />
          </div>

          <QuickActions onQiblahClick={() => setQiblahOpen(true)} />
        </div>
      </PullToRefresh>
      <QiblahSheet open={qiblahOpen} onClose={() => setQiblahOpen(false)} />
    </>
  );
}

function StreakCard({ streaks }: { streaks: Streaks }) {
  const streak = streaks.overallCurrent;
  const sub =
    streaks.prayerCurrent > 0
      ? `${streaks.prayerCurrent}-day prayer streak`
      : streaks.overallBest > streak
      ? `Best ${streaks.overallBest} days`
      : "Keep it going";
  return (
    <Link
      href="/streaks"
      className="card-bg rounded-2xl border sidebar-border p-4 flex flex-col justify-center touch-manipulation active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-2 text-themed-muted text-xs uppercase tracking-wider mb-1">
        <Flame size={14} className="text-gold" />
        <span>Streak</span>
      </div>
      <p className="text-2xl font-bold text-themed leading-none">
        {streak} <span className="text-base font-normal text-themed-muted">days</span>
      </p>
      <p className="text-xs text-themed-muted mt-1">{sub}</p>
    </Link>
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
