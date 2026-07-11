import type { SupabaseClient } from "@supabase/supabase-js";

// Shared server-side data helpers for the admin routes (service role).

export const DAY_MS = 86_400_000;

export function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

export function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function isoDaysAgo(days: number, now = Date.now()): string {
  return new Date(now - days * DAY_MS).toISOString();
}

/** Fetch every row of a table (paginated past PostgREST's 1000-row cap), with an
 *  optional `used_at >= isoWindow`-style lower bound to avoid full-table scans. */
export async function fetchAll<T>(
  supa: SupabaseClient,
  table: string,
  columns: string,
  opts?: { gteCol?: string; gteVal?: string }
): Promise<T[]> {
  const pageSize = 1000;
  let from = 0;
  const out: T[] = [];
  for (let guard = 0; guard < 500; guard++) {
    let q = supa.from(table).select(columns);
    if (opts?.gteCol && opts.gteVal !== undefined) q = q.gte(opts.gteCol, opts.gteVal);
    const { data, error } = await q.range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

/** Row-count only (head request — pulls no rows). Tolerant: returns 0 if the
 *  table doesn't exist yet (a migration may be unapplied). */
export async function headCount(supa: SupabaseClient, table: string): Promise<number> {
  try {
    const { count, error } = await supa.from(table).select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export type AuthUserLite = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  first_name: string | null;
  last_name: string | null;
};

/** Every auth user (paginated admin API), keeping last-sign-in + name metadata. */
export async function listAllUsers(supa: SupabaseClient): Promise<AuthUserLite[]> {
  const perPage = 1000;
  const out: AuthUserLite[] = [];
  for (let page = 1; page <= 500; page++) {
    const { data, error } = await supa.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const users = data?.users ?? [];
    for (const u of users) {
      const meta = (u.user_metadata ?? {}) as { first_name?: string; last_name?: string };
      out.push({
        id: u.id,
        email: u.email ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        first_name: meta.first_name ?? null,
        last_name: meta.last_name ?? null,
      });
    }
    if (users.length < perPage) break;
  }
  return out;
}

/** Build a userId → "Name · email" labeler from name + email lookup maps. */
export function makeLabeler(
  nameById: Map<string, string | null>,
  emailById: Map<string, string | null>
) {
  return (userId: string | null | undefined): string => {
    if (!userId) return "Someone";
    const name = nameById.get(userId);
    const em = emailById.get(userId);
    if (name && em) return `${name} · ${em}`;
    return name || em || userId.slice(0, 8) + "…";
  };
}
