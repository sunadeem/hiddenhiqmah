// Supabase-backed JournalAdapter (signed-in primary profile). Journal entries are
// plain user-owned mutable rows (migration 028_journal_entries.sql), so — like the
// hifz adapter — this layer is just CRUD behind RLS (scoped to the user), with
// last-write-wins by updated_at. No SECURITY DEFINER RPCs are needed because there
// is no per-day snapshot or server-computed invariant to protect.

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  JournalAdapter,
  JournalEntry,
  JournalEntryPatch,
  NewJournalEntry,
} from "./types";

type Row = Record<string, unknown>;

function rowToEntry(r: Row): JournalEntry {
  return {
    id: r.id as string,
    body: r.body as string,
    linkedRef: (r.linked_ref as string | null) ?? null,
    linkedLabel: (r.linked_label as string | null) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export function createSupabaseJournalAdapter(
  client: SupabaseClient,
  userId: string
): JournalAdapter {
  return {
    synced: true,

    async list(): Promise<JournalEntry[]> {
      const { data, error } = await client
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToEntry);
    },

    async add(input: NewJournalEntry): Promise<JournalEntry> {
      const { data, error } = await client
        .from("journal_entries")
        .insert({
          user_id: userId,
          body: input.body,
          linked_ref: input.linkedRef ?? null,
          linked_label: input.linkedLabel ?? null,
        })
        .select("*")
        .single();
      if (error) throw error;
      return rowToEntry(data as Row);
    },

    async update(id: string, patch: JournalEntryPatch): Promise<void> {
      const update: Row = { updated_at: new Date().toISOString() };
      if (patch.body !== undefined) update.body = patch.body;
      if (patch.linkedRef !== undefined) update.linked_ref = patch.linkedRef;
      if (patch.linkedLabel !== undefined) update.linked_label = patch.linkedLabel;
      const { error } = await client.from("journal_entries").update(update).eq("id", id);
      if (error) throw error;
    },

    async remove(id: string): Promise<void> {
      const { error } = await client.from("journal_entries").delete().eq("id", id);
      if (error) throw error;
    },
  };
}
