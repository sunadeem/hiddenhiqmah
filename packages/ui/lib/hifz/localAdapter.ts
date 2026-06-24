// Device-only Hifz adapter — persists to localStorage. Mirrors the daily
// localAdapter shape. The Supabase adapter (synced) implements the same port.

import { consecRun } from "../daily/types";
import type {
  HifzAdapter,
  HifzCard,
  HifzReview,
  HifzStats,
  NewCardInput,
  Grade,
} from "./types";
import { applyGrade, newCard, rangeKey, selectQueue } from "./srs";

const STORE_KEY = "hiqmah-hifz-v1";

interface LocalStore {
  cards: HifzCard[];
  reviews: HifzReview[];
  streakBest: number;
}
function empty(): LocalStore {
  return { cards: [], reviews: [], streakBest: 0 };
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
function currentStreak(reviews: HifzReview[], today: string): number {
  const dates = [...new Set(reviews.map((r) => r.localDate))].sort().reverse();
  return consecRun(dates, today);
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

    async removeCard(id: string): Promise<void> {
      const s = load();
      s.cards = s.cards.filter((c) => c.id !== id);
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
      const cur = currentStreak(s.reviews, today);
      if (cur > s.streakBest) s.streakBest = cur;
      save(s);
    },

    async getStats(today: string): Promise<HifzStats> {
      const s = load();
      const cards = s.cards;
      const cur = currentStreak(s.reviews, today);
      return {
        total: cards.length,
        memorized: cards.filter((c) => c.status === "memorized").length,
        review: cards.filter((c) => c.status === "review").length,
        learning: cards.filter((c) => c.status === "learning").length,
        fresh: cards.filter((c) => c.status === "new").length,
        dueToday: selectQueue(cards, today).length,
        streakCurrent: cur,
        streakBest: Math.max(s.streakBest, cur),
      };
    },

    async recomputeStreak(today: string): Promise<void> {
      const s = load();
      const cur = currentStreak(s.reviews, today);
      if (cur > s.streakBest) {
        s.streakBest = cur;
        save(s);
      }
    },
  };
}
