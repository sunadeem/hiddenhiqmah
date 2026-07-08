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
import PageTip from "@/components/mobile/PageTip";

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
  // "Ahead" must exclude cards already handled today — otherwise the cards just
  // cleared in today's session (now the soonest-due non-new cards) sort straight
  // back to the top, so "review ahead" would just replay today's queue instead of
  // pulling the next scheduled items.
  const startExtraSession = useCallback(async () => {
    const all = await adapter.getCards();
    const q = all
      .filter((c) => c.status !== "new" && c.lastReviewed !== today)
      .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))
      .slice(0, 20);
    if (q.length === 0) return;
    setQueue(q);
    setView("session");
  }, [adapter, today]);

  const back = () => {
    if (view === "dashboard") router.back();
    else setView("dashboard");
  };

  return (
    <div className="pb-4">
      <PageTip
        tips={[
          {
            key: "hifz-plan-v2",
            title: "Built to make it stick",
            body: "Add sūrahs to your plan and Hifz schedules daily reviews at just the right moment — so what you memorise stays memorised.",
          },
        ]}
      />
      {/* Header */}
      <div className="flex items-center gap-2 px-1 pt-1 pb-3">
        <button
          onClick={back}
          aria-label="Back"
          className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-themed active:bg-[var(--overlay-subtle)] touch-manipulation"
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
