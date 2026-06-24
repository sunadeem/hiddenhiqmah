import type { SupabaseClient } from "@supabase/supabase-js";
import { consecRun } from "@hidden-hiqmah/ui/lib/daily/types";
import type {
  HifzAdapter,
  HifzCard,
  HifzStats,
  NewCardInput,
  Grade,
} from "@hidden-hiqmah/ui/lib/hifz/types";
import { applyGrade, newCard, rangeKey, selectQueue } from "@hidden-hiqmah/ui/lib/hifz/srs";

/**
 * Synced Hifz adapter. The SRS scheduling + streak logic are the SAME pure
 * functions the local adapter uses (srs.ts / consecRun) — this layer is just
 * CRUD against Supabase (RLS-scoped to the user), so the two adapters can't drift.
 * Requires migration 010_hifz.sql.
 */
export function createSupabaseHifzAdapter(
  client: SupabaseClient,
  userId: string
): HifzAdapter {
  function uuid(): string {
    try {
      return crypto.randomUUID();
    } catch {
      return `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    }
  }
  function todayLocal(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function rowToCard(r: any): HifzCard {
    return {
      id: r.id,
      unit: r.unit,
      label: r.label,
      page: r.page ?? null,
      startSurah: r.start_surah,
      startAyah: r.start_ayah,
      endSurah: r.end_surah,
      endAyah: r.end_ayah,
      status: r.status,
      ease: Number(r.ease),
      interval: r.interval_days,
      reps: r.reps,
      lapses: r.lapses,
      step: r.step,
      due: r.due,
      lastReviewed: r.last_reviewed ?? null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
  function cardToRow(c: HifzCard) {
    return {
      id: c.id,
      user_id: userId,
      range_key: rangeKey(c),
      unit: c.unit,
      label: c.label,
      page: c.page,
      start_surah: c.startSurah,
      start_ayah: c.startAyah,
      end_surah: c.endSurah,
      end_ayah: c.endAyah,
      status: c.status,
      ease: c.ease,
      interval_days: c.interval,
      reps: c.reps,
      lapses: c.lapses,
      step: c.step,
      due: c.due,
      last_reviewed: c.lastReviewed,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    };
  }

  async function fetchCards(): Promise<HifzCard[]> {
    const { data, error } = await client
      .from("hifz_cards")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToCard);
  }
  async function reviewDatesDesc(): Promise<string[]> {
    const { data, error } = await client
      .from("hifz_reviews")
      .select("local_date")
      .order("local_date", { ascending: false });
    if (error) throw error;
    return [...new Set((data ?? []).map((r) => r.local_date as string))];
  }
  function bestRun(datesDesc: string[]): number {
    // longest consecutive-day run anywhere in the history
    const asc = [...datesDesc].sort();
    let best = 0;
    let run = 0;
    let prev: string | null = null;
    for (const d of asc) {
      if (prev) {
        const next = new Date(prev + "T12:00:00");
        next.setDate(next.getDate() + 1);
        const nextStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(
          next.getDate()
        ).padStart(2, "0")}`;
        run = d === nextStr ? run + 1 : 1;
      } else {
        run = 1;
      }
      if (run > best) best = run;
      prev = d;
    }
    return best;
  }

  return {
    synced: true,

    async getCards(): Promise<HifzCard[]> {
      return fetchCards();
    },

    async addCards(inputs: NewCardInput[]): Promise<void> {
      if (!inputs.length) return;
      const t = todayLocal();
      const now = new Date().toISOString();
      const rows = inputs.map((inp) => cardToRow(newCard(inp, t, now, uuid())));
      const { error } = await client
        .from("hifz_cards")
        .upsert(rows, { onConflict: "user_id,range_key", ignoreDuplicates: true });
      if (error) throw error;
    },

    async removeCard(id: string): Promise<void> {
      const { error } = await client.from("hifz_cards").delete().eq("id", id);
      if (error) throw error;
    },

    async getQueue(today: string): Promise<HifzCard[]> {
      return selectQueue(await fetchCards(), today);
    },

    async grade(id: string, grade: Grade, today: string): Promise<void> {
      const cards = await fetchCards();
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      const u = applyGrade(card, grade, today, new Date().toISOString());
      const { error } = await client
        .from("hifz_cards")
        .update({
          status: u.status,
          ease: u.ease,
          interval_days: u.interval,
          reps: u.reps,
          lapses: u.lapses,
          step: u.step,
          due: u.due,
          last_reviewed: u.lastReviewed,
          updated_at: u.updatedAt,
        })
        .eq("id", id);
      if (error) throw error;
      await client
        .from("hifz_reviews")
        .insert({ user_id: userId, card_id: id, grade, local_date: today });
    },

    async getStats(today: string): Promise<HifzStats> {
      const [cards, dates] = await Promise.all([fetchCards(), reviewDatesDesc()]);
      const cur = consecRun(dates, today);
      return {
        total: cards.length,
        memorized: cards.filter((c) => c.status === "memorized").length,
        review: cards.filter((c) => c.status === "review").length,
        learning: cards.filter((c) => c.status === "learning").length,
        fresh: cards.filter((c) => c.status === "new").length,
        dueToday: selectQueue(cards, today).length,
        streakCurrent: cur,
        streakBest: Math.max(cur, bestRun(dates)),
      };
    },

    async recomputeStreak(): Promise<void> {
      /* streak is computed on read from the review log */
    },
  };
}
