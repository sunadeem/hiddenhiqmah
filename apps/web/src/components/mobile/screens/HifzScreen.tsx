"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useHifzAdapter } from "@/lib/hifz/useHifzAdapter";
import { todayLocalDate } from "@hidden-hiqmah/ui/lib/daily/types";
import type { HifzCard, HifzStats } from "@hidden-hiqmah/ui/lib/hifz/types";
import HifzDashboard from "../hifz/HifzDashboard";
import HifzPlanSetup from "../hifz/HifzPlanSetup";
import HifzSession from "../hifz/HifzSession";
import HifzProgressMap from "../hifz/HifzProgressMap";

type View = "dashboard" | "setup" | "session" | "map";

const TITLES: Record<View, string> = {
  dashboard: "Hifz",
  setup: "Add to plan",
  session: "Review",
  map: "Progress",
};

export default function HifzScreen() {
  const router = useRouter();
  const { adapter } = useHifzAdapter();
  const [view, setView] = useState<View>("dashboard");
  const [stats, setStats] = useState<HifzStats | null>(null);
  const [cards, setCards] = useState<HifzCard[]>([]);
  const [queue, setQueue] = useState<HifzCard[]>([]);
  const today = todayLocalDate();

  const reload = useCallback(async () => {
    try {
      await adapter.recomputeStreak(today);
      const [s, c] = await Promise.all([adapter.getStats(today), adapter.getCards()]);
      setStats(s);
      setCards(c);
    } catch {
      /* leave as-is */
    }
  }, [adapter, today]);

  useEffect(() => {
    reload();
  }, [reload]);

  const startSession = useCallback(async () => {
    const q = await adapter.getQueue(today);
    if (q.length === 0) return;
    setQueue(q);
    setView("session");
  }, [adapter, today]);

  // Extra practice when nothing is due today: review the soonest-scheduled cards
  // ahead (gentle, capped). Gated behind a confirm in the dashboard. (HIFZ-3)
  const startExtraSession = useCallback(async () => {
    const all = await adapter.getCards();
    const q = all
      .filter((c) => c.status !== "new")
      .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))
      .slice(0, 20);
    if (q.length === 0) return;
    setQueue(q);
    setView("session");
  }, [adapter]);

  const back = () => {
    if (view === "dashboard") router.back();
    else setView("dashboard");
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 pt-1 pb-3">
        <button
          onClick={back}
          aria-label="Back"
          className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-themed active:bg-white/5 touch-manipulation"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-themed">{TITLES[view]}</h1>
      </div>

      {view === "dashboard" && (
        <HifzDashboard
          stats={stats}
          hasCards={cards.length > 0}
          onStart={startSession}
          onReviewMore={startExtraSession}
          onSetup={() => setView("setup")}
          onMap={() => setView("map")}
        />
      )}
      {view === "setup" && (
        <HifzPlanSetup
          adapter={adapter}
          onDone={async () => {
            await reload();
            setView("dashboard");
          }}
        />
      )}
      {view === "session" && (
        <HifzSession
          adapter={adapter}
          queue={queue}
          today={today}
          onDone={async () => {
            await reload();
            setView("dashboard");
          }}
        />
      )}
      {view === "map" && <HifzProgressMap cards={cards} />}
    </div>
  );
}
