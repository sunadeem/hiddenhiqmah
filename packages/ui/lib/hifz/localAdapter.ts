// Device-only Hifz adapter — persists to localStorage. Mirrors the daily
// localAdapter shape. The Supabase adapter (synced) implements the same port.

import type {
  HifzAdapter,
  HifzCard,
  HifzPlan,
  HifzReview,
  HifzStats,
  NewCardInput,
  SeedCardInput,
  Grade,
} from "./types";
import {
  applyGrade,
  hifzStreak,
  newCard,
  rangeKey,
  seedCards as seedCardsPure,
  selectQueue,
} from "./srs";

const STORE_KEY = "hiqmah-hifz-v1";

interface LocalStore {
  cards: HifzCard[];
  reviews: HifzReview[];
  streakBest: number;
  plan: HifzPlan | null;
}
function empty(): LocalStore {
  return { cards: [], reviews: [], streakBest: 0, plan: null };
}

function uuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  }
}
function nowIso(): string {
  return new Date().toISOString();
}
function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function createLocalHifzAdapter(storeKey = STORE_KEY): HifzAdapter {
  function load(): LocalStore {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) return { ...empty(), ...(JSON.parse(raw) as Partial<LocalStore>) };
    } catch {
      /* ignore */
    }
    return empty();
  }
  function save(s: LocalStore) {
    try {
      localStorage.setItem(storeKey, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }

  return {
    synced: false,

    async getCards(): Promise<HifzCard[]> {
      return load().cards;
    },

    async addCards(inputs: NewCardInput[]): Promise<void> {
      const s = load();
      const existing = new Set(s.cards.map(rangeKey));
      const t = todayLocal();
      for (const inp of inputs) {
        const k = rangeKey(inp);
        if (existing.has(k)) continue;
        existing.add(k);
        s.cards.push(newCard(inp, t, nowIso(), uuid()));
      }
      save(s);
    },

    async seedCards(inputs: SeedCardInput[]): Promise<void> {
      if (!inputs.length) return;
      const s = load();
      const existing = new Set(s.cards.map(rangeKey));
      // Only seed ranges we don't already carry (idempotent, like addCards) — a
      // re-seed must never duplicate or reset an existing card's SRS state.
      const fresh = inputs.filter((inp) => !existing.has(rangeKey(inp)));
      if (!fresh.length) return;
      const seeded = seedCardsPure(fresh, todayLocal(), nowIso(), uuid);
      s.cards.push(...seeded);
      save(s);
    },

    async removeCard(id: string): Promise<void> {
      const s = load();
      s.cards = s.cards.filter((c) => c.id !== id);
      save(s);
    },

    async getPlan(): Promise<HifzPlan | null> {
      return load().plan;
    },

    async savePlan(plan: HifzPlan): Promise<void> {
      const s = load();
      s.plan = plan;
      save(s);
    },

    async bumpPeek(id: string): Promise<void> {
      const s = load();
      const i = s.cards.findIndex((c) => c.id === id);
      if (i < 0) return;
      // Pure counter bump — the SRS schedule is untouched.
      s.cards[i] = { ...s.cards[i], peekCount: (s.cards[i].peekCount ?? 0) + 1 };
      save(s);
    },

    async getQueue(today: string): Promise<HifzCard[]> {
      return selectQueue(load().cards, today);
    },

    async grade(id: string, grade: Grade, today: string): Promise<void> {
      const s = load();
      const i = s.cards.findIndex((c) => c.id === id);
      if (i < 0) return;
      s.cards[i] = applyGrade(s.cards[i], grade, today, nowIso());
      s.reviews.push({ id: uuid(), cardId: id, grade, localDate: today, at: nowIso() });
      const { best } = hifzStreak(s.reviews.map((r) => r.localDate), today);
      if (best > s.streakBest) s.streakBest = best;
      save(s);
    },

    async getStats(today: string): Promise<HifzStats> {
      const s = load();
      const cards = s.cards;
      const { current, best } = hifzStreak(s.reviews.map((r) => r.localDate), today);
      return {
        total: cards.length,
        memorized: cards.filter((c) => c.status === "memorized").length,
        review: cards.filter((c) => c.status === "review").length,
        learning: cards.filter((c) => c.status === "learning").length,
        fresh: cards.filter((c) => c.status === "new").length,
        dueToday: selectQueue(cards, today).length,
        streakCurrent: current,
        streakBest: Math.max(s.streakBest, best),
      };
    },

    async recomputeStreak(today: string): Promise<void> {
      const s = load();
      const { best } = hifzStreak(s.reviews.map((r) => r.localDate), today);
      if (best > s.streakBest) {
        s.streakBest = best;
        save(s);
      }
    },
  };
}
