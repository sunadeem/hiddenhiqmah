import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The set of user ids who have turned OFF a given opt-out push preference
 * (profiles.dua_push / reengagement_push — migration 030).
 *
 * Why a NEGATIVE query, and why paged:
 *
 * 1. We fetch the opt-OUTs and subtract, rather than fetching the opt-INs the
 *    way /api/push/circle-message does. circle_push is opt-IN (default false),
 *    so a positive filter is right there. These flags are opt-OUT (not null,
 *    default true), and a positive `.in(user_id, optedIn)` filter would silently
 *    drop any device token whose owner has no profiles row at all (e.g. a signup
 *    whose handle_new_user insert never landed). An unknown preference should
 *    mean the column default — still subscribed — not "never push to them again".
 *
 * 2. It PAGES. PostgREST caps every response at Supabase's db-max-rows (1000 by
 *    default) and the service-role key does not exempt a request from it — that
 *    limit is PostgREST-level, not RLS. A truncated page returns error:null, so
 *    an unbounded select would silently forget every opt-out past the first 1000
 *    and start pushing to people who explicitly declined. This is the one query
 *    that must never under-fetch, so read it a page at a time until short.
 *
 * Returns null if any page errored — callers should fail the request rather than
 * send to a partially-known audience.
 */
const PAGE = 1000;

export async function fetchOptedOut(
  supa: SupabaseClient,
  column: "dua_push" | "reengagement_push"
): Promise<Set<string> | null> {
  const out = new Set<string>();
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supa
      .from("profiles")
      .select("id")
      .eq(column, false)
      .range(from, from + PAGE - 1);
    if (error) return null;
    const rows = (data ?? []) as { id: string }[];
    for (const r of rows) out.add(r.id);
    if (rows.length < PAGE) return out; // short page ⇒ that was the last one
  }
}
