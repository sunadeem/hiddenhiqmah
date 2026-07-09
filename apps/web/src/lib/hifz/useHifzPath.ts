"use client";

// useHifzPath — the ONE shared data layer every Hifz screen consumes. Wraps
// useHifzAdapter (local-or-synced, profile-aware), loads the plan + cards, and
// derives everything the screens read: the station path, today's review queue,
// today's learn station, live stats + the 7-day review forecast. Screens never
// touch the adapter directly — they read this hook's fields and call its actions,
// each of which persists via the adapter then broadcasts "hiqmah:hifz-changed"
// so every mounted instance (Today + Path + a sheet, say) re-reads in lock-step.

import { useCallback, useEffect, useMemo, useState } from "react";
import { App as CapApp } from "@capacitor/app";
import { useHifzAdapter } from "./useHifzAdapter";
import {
  deriveStations,
  selectQueue,
  reviewForecast,
  paceNewPerDay,
  portionsStartedToday,
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
  /** Re-sort upcoming path portions by updating their card_order. */
  reorder(updates: { id: string; order: number }[]): Promise<void>;
  /** Force a re-read (rarely needed — actions already broadcast). */
  reload(): void;
}

export interface HifzPath {
  loading: boolean;
  /** True once the onboarding plan exists (HifzScreen gates onboarding on this). */
  hasPlan: boolean;
  plan: HifzPlan | null;
  cards: HifzCard[];
  /** Every derived station, both tracks, in mushaf order (Names sort first). */
  stations: HifzStation[];
  /** The Qur'ān track: stations whose startSurah !== 0, in mushaf order. */
  quranStations: HifzStation[];
  /** The 99-Names track: stations whose startSurah === 0. */
  nameStations: HifzStation[];
  /**
   * The gold "you are here" QUR'ĀN station — the first not-complete Qur'ān station
   * (asma excluded), so the Names block can never sit in front of the mushaf.
   * Null once every Qur'ān station is memorized (or none exist).
   */
  currentStation: HifzStation | null;
  /** The first not-complete NAME station (parallel track). Null when none remain. */
  currentNames: HifzStation | null;
  /** Cards due for review today (oldest first) — excludes brand-new cards. */
  todayReview: HifzCard[];
  /** The station to learn today (= currentStation, the Qur'ān track). */
  todayLearn: HifzStation | null;
  /** Per-day new-learning allowance (portions/day) from the plan's pace. */
  dailyNewBudget: number;
  /** New portions the user has already begun today (spend against the budget). */
  newPortionsToday: number;
  /** True once today's new-learning budget is spent — Today offers "start early". */
  newLearningDoneToday: boolean;
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

  // Keep `today` fresh across local-day rollover. It's captured at mount, but a
  // long-lived WKWebView session — backgrounded overnight, or simply left open past
  // midnight — would otherwise keep serving yesterday's date, staling every
  // day-keyed derivation (the new-learning cap, today's reviews, the 7-day
  // forecast, station due-status) until a full relaunch. Re-derive on resume /
  // tab-visible and on a slow tick, committing only when the value actually
  // changes (so no needless re-render, and the load effect below re-runs exactly
  // once per real day change).
  useEffect(() => {
    const sync = () => setToday((prev) => {
      const next = todayLocalDate();
      return prev !== next ? next : prev;
    });
    sync(); // catch a rollover that happened while unmounted / hidden
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(sync, 60_000);
    let removeApp: (() => void) | undefined;
    CapApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) sync();
    }).then((handle) => {
      removeApp = () => void handle.remove();
    });
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
      removeApp?.();
    };
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

  const { stations } = useMemo(
    () =>
      today
        ? // Two parallel tracks so each keeps its own gold "you are here": the 99
          // Names live on sūrah 0, the Qur'ān mushaf on sūrah ≥ 1.
          deriveStations(cards, today, (c) => (c.startSurah === 0 ? "names" : "quran"))
        : { stations: [], currentKey: null },
    [cards, today]
  );

  // Two PARALLEL tracks. asma stations (startSurah === 0) sort to the front of the
  // single derived trail, so we split them out rather than let them lead the mushaf.
  const { quranStations, nameStations } = useMemo(() => {
    const quran: HifzStation[] = [];
    const names: HifzStation[] = [];
    for (const s of stations) {
      (s.startSurah === 0 ? names : quran).push(s);
    }
    return { quranStations: quran, nameStations: names };
  }, [stations]);

  // A station is still "to learn" while any member is new → status learning/locked.
  // Each track advances independently: the current Qur'ān station excludes Names,
  // so finishing a batch of Names never blocks the mushaf (and vice-versa).
  // Prefer the track's gold "learning" station (which deriveStations points at the
  // one you've started), falling back to the first locked — so an added earlier
  // portion doesn't hijack "today".
  const currentStation = useMemo(
    () =>
      quranStations.find((s) => s.status === "learning") ??
      quranStations.find((s) => s.status === "locked") ??
      null,
    [quranStations]
  );
  const currentNames = useMemo(
    () =>
      nameStations.find((s) => s.status === "learning") ??
      nameStations.find((s) => s.status === "locked") ??
      null,
    [nameStations]
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

  // Today's Qur'ān learning is the current Qur'ān station; null once all memorized.
  // (The Names track is offered separately via currentNames.)
  const todayLearn = currentStation;

  // Per-day new-learning budget: the pace's newPerDay, counted in PORTIONS begun
  // today across both tracks. Once spent, Today stops PUSHING new material and
  // offers an opt-in "start early" instead — reviews stay open regardless. This is
  // what turns "endlessly hand out the next portion" into a real daily cadence.
  const dailyNewBudget = plan?.dailyPortions ?? (plan ? paceNewPerDay(plan.pace) : 1);
  const newPortionsToday = useMemo(
    () => (today ? portionsStartedToday(cards, today) : 0),
    [cards, today]
  );
  const newLearningDoneToday = dailyNewBudget > 0 && newPortionsToday >= dailyNewBudget;

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
      async reorder(updates) {
        if (updates.length) await adapter.reorderCards?.(updates);
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
    quranStations,
    nameStations,
    currentStation,
    currentNames,
    todayReview,
    todayLearn,
    dailyNewBudget,
    newPortionsToday,
    newLearningDoneToday,
    stats,
    forecast,
    signedIn,
    actions,
  };
}
