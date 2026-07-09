"use client";

// useHifzPath — the ONE shared data layer every Hifz screen consumes. Wraps
// useHifzAdapter (local-or-synced, profile-aware), loads the plan + cards, and
// derives everything the screens read: the station path, today's review queue,
// today's learn station, live stats + the 7-day review forecast. Screens never
// touch the adapter directly — they read this hook's fields and call its actions,
// each of which persists via the adapter then broadcasts "hiqmah:hifz-changed"
// so every mounted instance (Today + Path + a sheet, say) re-reads in lock-step.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useHifzAdapter } from "./useHifzAdapter";
import {
  deriveStations,
  selectQueue,
  reviewForecast,
  paceNewPerDay,
} from "@hidden-hiqmah/ui/lib/hifz/srs";
import { todayLocalDate } from "@hidden-hiqmah/ui/lib/daily/types";
import type {
  Grade,
  HifzCard,
  HifzPlan,
  HifzStation,
  HifzStats,
  NewCardInput,
  SeedCardInput,
} from "@hidden-hiqmah/ui/lib/hifz/types";

/** Window event every action fires so all live instances re-read together. */
export const HIFZ_CHANGED_EVENT = "hiqmah:hifz-changed";

export interface HifzPathActions {
  /** Persist the singleton plan (onboarding + edits). */
  savePlan(plan: HifzPlan): Promise<void>;
  /** Add new-learning cards (Qur'an stations or the 99 Names). Idempotent by range. */
  addToPath(inputs: NewCardInput[]): Promise<void>;
  /** Seed already-memorized portions as staggered review cards. */
  seedAlready(inputs: SeedCardInput[]): Promise<void>;
  /** Grade a card at Seal / in Review — reschedules it (SM-2). */
  grade(cardId: string, grade: Grade): Promise<void>;
  /** Record a Fade peek (informs the Seal grade; no schedule change). */
  bumpPeek(cardId: string): Promise<void>;
  /** Force a re-read (rarely needed — actions already broadcast). */
  reload(): void;
}

export interface HifzPath {
  loading: boolean;
  /** True once the onboarding plan exists (HifzScreen gates onboarding on this). */
  hasPlan: boolean;
  plan: HifzPlan | null;
  cards: HifzCard[];
  stations: HifzStation[];
  /** The gold "you are here" station (null once everything is memorized). */
  currentStation: HifzStation | null;
  /** Cards due for review today (oldest first) — excludes brand-new cards. */
  todayReview: HifzCard[];
  /** The station to learn today (= currentStation when there's learning left). */
  todayLearn: HifzStation | null;
  stats: HifzStats | null;
  /** Reviews landing on each of the next 7 days (index 0 = today). */
  forecast: number[];
  signedIn: boolean;
  actions: HifzPathActions;
}

const EMPTY_FORECAST = [0, 0, 0, 0, 0, 0, 0];

export function useHifzPath(): HifzPath {
  const { adapter, signedIn, authLoading } = useHifzAdapter();

  // SSR-safe: today is computed only after mount (no Date on the server render).
  const [today, setToday] = useState<string | null>(null);
  const [cards, setCards] = useState<HifzCard[]>([]);
  const [plan, setPlan] = useState<HifzPlan | null>(null);
  const [stats, setStats] = useState<HifzStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    setToday(todayLocalDate());
  }, []);

  // Re-read whenever any instance broadcasts a change.
  useEffect(() => {
    const onChange = () => reload();
    window.addEventListener(HIFZ_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(HIFZ_CHANGED_EVENT, onChange);
  }, [reload]);

  // Load cards + plan + stats on mount, adapter swap, day change, or reload.
  useEffect(() => {
    if (!today) return;
    let alive = true;
    setLoading(true);
    (async () => {
      const [nextCards, nextPlan, nextStats] = await Promise.all([
        adapter.getCards(),
        adapter.getPlan ? adapter.getPlan() : Promise.resolve(null),
        adapter.getStats(today),
      ]);
      if (!alive) return;
      setCards(nextCards);
      setPlan(nextPlan);
      setStats(nextStats);
      setLoading(false);
    })().catch(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [adapter, today, reloadKey]);

  const { stations, currentKey } = useMemo(
    () => (today ? deriveStations(cards, today) : { stations: [], currentKey: null }),
    [cards, today]
  );

  const currentStation = useMemo(
    () => stations.find((s) => s.key === currentKey) ?? null,
    [stations, currentKey]
  );

  // Today's queue → split into reviews (non-new due cards) and new learning. The
  // new-per-day cap is plan-driven when a plan exists; the guardrail (in selectQueue)
  // pauses new learning entirely when review debt is high.
  const todayReview = useMemo(() => {
    if (!today) return [];
    const queue = selectQueue(cards, today, {
      newPerDay: plan ? paceNewPerDay(plan.pace) : undefined,
    });
    return queue.filter((c) => c.status !== "new");
  }, [cards, today, plan]);

  // The gold station is where the user learns next; null once all memorized.
  const todayLearn = currentStation;

  const forecast = useMemo(
    () => (today ? reviewForecast(cards, today, 7) : EMPTY_FORECAST),
    [cards, today]
  );

  const actions = useMemo<HifzPathActions>(() => {
    const broadcast = () => window.dispatchEvent(new Event(HIFZ_CHANGED_EVENT));
    const day = () => today ?? todayLocalDate();
    return {
      async savePlan(next) {
        await adapter.savePlan?.(next);
        broadcast();
      },
      async addToPath(inputs) {
        if (inputs.length) await adapter.addCards(inputs);
        broadcast();
      },
      async seedAlready(inputs) {
        if (inputs.length) await adapter.seedCards?.(inputs);
        broadcast();
      },
      async grade(cardId, grade) {
        await adapter.grade(cardId, grade, day());
        broadcast();
      },
      async bumpPeek(cardId) {
        await adapter.bumpPeek?.(cardId);
        broadcast();
      },
      reload,
    };
  }, [adapter, today, reload]);

  return {
    loading: authLoading || loading || today === null,
    hasPlan: plan !== null,
    plan,
    cards,
    stations,
    currentStation,
    todayReview,
    todayLearn,
    stats,
    forecast,
    signedIn,
    actions,
  };
}
