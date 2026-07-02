// Supabase-backed DailyAdapter (signed-in users). All mutations go through the
// SECURITY DEFINER RPCs from migration 002 so the invariants (frozen denominator,
// atomic dhikr counter, real streak walk) are enforced server-side and cannot be
// forged. Reads are direct selects, RLS-scoped to the user.

import type { SupabaseClient } from "@supabase/supabase-js";
import { buildPreviewDay } from "@hidden-hiqmah/ui/lib/daily/types";
import type {
  DailyAdapter,
  DayItem,
  DayRollup,
  DhikrState,
  DhikrDayCount,
  ItemPatch,
  NewItemInput,
  PauseReason,
  StreakPause,
  Streaks,
  UserItem,
} from "@hidden-hiqmah/ui/lib/daily/types";

type Row = Record<string, unknown>;

function mapUserItem(r: Row): UserItem {
  return {
    id: r.id as string,
    sourceKey: (r.source_key as string) ?? null,
    label: r.label as string,
    kind: r.kind as UserItem["kind"],
    goalCount: (r.goal_count as number) ?? null,
    dhikrKey: (r.dhikr_key as string) ?? null,
    sortOrder: r.sort_order as number,
    isActive: r.is_active as boolean,
  };
}

function mapDayItem(r: Row): DayItem {
  return {
    userItemId: (r.user_item_id as string) ?? null,
    label: r.label_snapshot as string,
    kind: r.kind as DayItem["kind"],
    goalCount: (r.goal_count as number) ?? null,
    dhikrKey: (r.dhikr_key as string) ?? null,
    sortOrder: r.sort_order_snapshot as number,
    countDone: (r.count_done as number) ?? 0,
    done: r.done as boolean,
    isPrayer: r.is_prayer as boolean,
  };
}

function mapRollup(r: Row): DayRollup {
  return {
    localDate: r.local_date as string,
    totalItems: (r.total_items as number) ?? 0,
    doneItems: (r.done_items as number) ?? 0,
    prayersTotal: (r.prayers_total as number) ?? 0,
    prayersDone: (r.prayers_done as number) ?? 0,
    status: (r.status as DayRollup["status"]) ?? "none",
  };
}

export function createSupabaseDailyAdapter(
  client: SupabaseClient,
  userId: string,
  startDate?: string | null
): DailyAdapter {
  return {
    synced: true,

    async ensureSeeded() {
      await client.rpc("seed_user_checklist");
    },

    async getUserItems() {
      const { data, error } = await client
        .from("checklist_user_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapUserItem);
    },

    async addItem(input: NewItemInput) {
      // Place new items at the end of the active list.
      const { data: maxRow } = await client
        .from("checklist_user_items")
        .select("sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextOrder = ((maxRow?.sort_order as number) ?? 0) + 1;
      const { error } = await client.from("checklist_user_items").insert({
        user_id: userId,
        source_key: null,
        label: input.label,
        kind: input.kind,
        goal_count: input.goalCount ?? null,
        dhikr_key: input.dhikrKey ?? null,
        sort_order: nextOrder,
        is_active: true,
      });
      if (error) throw error;
    },

    async editItem(id: string, patch: ItemPatch) {
      const update: Row = {};
      if (patch.label !== undefined) update.label = patch.label;
      if (patch.goalCount !== undefined) update.goal_count = patch.goalCount;
      const { error } = await client
        .from("checklist_user_items")
        .update(update)
        .eq("id", id);
      if (error) throw error;
    },

    async removeItem(id: string) {
      const { error } = await client
        .from("checklist_user_items")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },

    async reorderItems(orderedIds: string[]) {
      // Assign sort_order = index for each id. RLS scopes to the user.
      await Promise.all(
        orderedIds.map((id, i) =>
          client.from("checklist_user_items").update({ sort_order: i }).eq("id", id)
        )
      );
    },

    async getDay(localDate: string) {
      // Lazy: do NOT materialize on open. Refresh the streak cache (today-aware),
      // return the frozen snapshot if the day was already started, else a preview
      // from the current list (so pre-first-check edits apply today).
      await client.rpc("recompute_streaks", { p_today: localDate });
      const { data: rollupRow } = await client
        .from("checklist_day")
        .select("*")
        .eq("local_date", localDate)
        .maybeSingle();
      if (rollupRow) {
        const { data: itemRows } = await client
          .from("checklist_day_items")
          .select("*")
          .eq("local_date", localDate)
          .order("sort_order_snapshot", { ascending: true });
        return { rollup: mapRollup(rollupRow), items: (itemRows ?? []).map(mapDayItem) };
      }
      const items = await this.getUserItems();
      return buildPreviewDay(localDate, items);
    },

    async setDone(localDate: string, userItemId: string, done: boolean) {
      const { error } = await client.rpc("set_checklist_item_done", {
        p_local_date: localDate,
        p_user_item_id: userItemId,
        p_done: done,
      });
      if (error) throw error;
    },

    async setCount(localDate: string, userItemId: string, count: number) {
      const { error } = await client.rpc("set_checklist_count", {
        p_local_date: localDate,
        p_user_item_id: userItemId,
        p_count: count,
      });
      if (error) throw error;
    },

    async getDhikr(dhikrKey: string, localDate: string): Promise<DhikrState> {
      const [{ data: dailyRow }, { data: lifeRow }] = await Promise.all([
        client
          .from("dhikr_daily")
          .select("count")
          .eq("dhikr_key", dhikrKey)
          .eq("local_date", localDate)
          .maybeSingle(),
        client
          .from("dhikr_lifetime")
          .select("count")
          .eq("dhikr_key", dhikrKey)
          .maybeSingle(),
      ]);
      return {
        daily: (dailyRow?.count as number) ?? 0,
        lifetime: (lifeRow?.count as number) ?? 0,
      };
    },

    async incrementDhikr(dhikrKey: string, localDate: string, delta = 1): Promise<DhikrState> {
      const { data, error } = await client.rpc("increment_dhikr", {
        p_dhikr_key: dhikrKey,
        p_local_date: localDate,
        p_delta: delta,
      });
      if (error) throw error;
      return { daily: data?.daily ?? 0, lifetime: data?.lifetime ?? 0 };
    },

    async setDhikrCount(dhikrKey: string, localDate: string, count: number): Promise<DhikrState> {
      const { data, error } = await client.rpc("set_dhikr_count", {
        p_dhikr_key: dhikrKey,
        p_local_date: localDate,
        p_count: count,
      });
      if (error) throw error;
      return { daily: data?.daily ?? 0, lifetime: data?.lifetime ?? 0 };
    },

    async resetDhikrDay(dhikrKey: string, localDate: string): Promise<DhikrState> {
      const { data, error } = await client.rpc("reset_dhikr_day", {
        p_dhikr_key: dhikrKey,
        p_local_date: localDate,
      });
      if (error) throw error;
      return { daily: data?.daily ?? 0, lifetime: data?.lifetime ?? 0 };
    },

    async getDhikrRange(fromDate: string, toDate: string): Promise<DhikrDayCount[]> {
      const { data, error } = await client
        .from("dhikr_daily")
        .select("dhikr_key, local_date, count")
        .gte("local_date", fromDate)
        .lte("local_date", toDate);
      if (error) throw error;
      return (data ?? []).map((r) => ({
        dhikrKey: r.dhikr_key as string,
        localDate: r.local_date as string,
        count: r.count as number,
      }));
    },

    async getDayRollups(fromDate: string, toDate: string) {
      const { data, error } = await client
        .from("checklist_day")
        .select("*")
        .gte("local_date", fromDate)
        .lte("local_date", toDate);
      if (error) throw error;
      return (data ?? []).map(mapRollup);
    },

    async getDayDetail(localDate: string) {
      const { data, error } = await client
        .from("checklist_day_items")
        .select("*")
        .eq("local_date", localDate)
        .order("sort_order_snapshot", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapDayItem);
    },

    async getStreaks(): Promise<Streaks> {
      const { data } = await client
        .from("user_streaks")
        .select("*")
        .maybeSingle();
      return {
        overallCurrent: (data?.overall_current as number) ?? 0,
        overallBest: (data?.overall_best as number) ?? 0,
        prayerCurrent: (data?.prayer_current as number) ?? 0,
        prayerBest: (data?.prayer_best as number) ?? 0,
      };
    },

    async getStartDate(): Promise<string | null> {
      return startDate ?? null;
    },

    async recomputeStreaks(today: string) {
      await client.rpc("recompute_streaks", { p_today: today });
    },

    async getPauses(): Promise<StreakPause[]> {
      const { data } = await client
        .from("streak_pauses")
        .select("*")
        .order("start_date", { ascending: false });
      return (data ?? []).map((r) => ({
        id: r.id as string,
        startDate: r.start_date as string,
        endDate: (r.end_date as string | null) ?? null,
        reason: r.reason as PauseReason,
      }));
    },

    async getActivePause(): Promise<StreakPause | null> {
      const { data } = await client
        .from("streak_pauses")
        .select("*")
        .is("end_date", null)
        .maybeSingle();
      if (!data) return null;
      return {
        id: data.id as string,
        startDate: data.start_date as string,
        endDate: null,
        reason: data.reason as PauseReason,
      };
    },

    async startPause(reason: PauseReason, today: string) {
      const { error } = await client.rpc("start_streak_pause", {
        p_reason: reason,
        p_today: today,
      });
      if (error) throw error;
    },

    async endPause(today: string) {
      const { error } = await client.rpc("end_streak_pause", { p_today: today });
      if (error) throw error;
    },
  };
}
