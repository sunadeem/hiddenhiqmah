import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { tryGetSupabaseServer } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";

// ── CORS (mirrors /api/search) ──────────────────────────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ── Estimated AI pricing (USD per 1,000,000 tokens) ─────────────────────────
// IMPORTANT: chat_usage token columns are summed across BOTH models per
// message — Haiku 4.5 for the search rounds ($1 in / $5 out) and Opus 4.8 for
// the answer ($5 in / $25 out). There is no per-model split stored, so this is
// an ESTIMATE: we price all input + cache at the Opus 4.8 input tier (an upper
// bound — the Haiku share is cheaper) and all output at the Opus 4.8 output
// tier (the answer, which dominates output, is Opus). Cache reads bill ~0.1x
// input; cache creation ~1.25x input. Flip these to re-tier the estimate.
const RATE_INPUT_PER_M = 5.0;
const RATE_OUTPUT_PER_M = 25.0;
const RATE_CACHE_READ_PER_M = 0.5;
const RATE_CACHE_WRITE_PER_M = 6.25;

// Signed-in daily quota (see migration 011): 15 messages / rolling 24h.
const DAILY_QUOTA = 15;

// ── Constant-time credential comparison ─────────────────────────────────────
// Hash both sides to a fixed 32-byte digest first: this keeps the comparison
// constant-time AND avoids leaking length (timingSafeEqual throws on unequal
// buffer lengths, which would itself be an oracle).
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function verifyCreds(email: string, password1: string, password2: string): boolean {
  const eEmail = process.env.ADMIN_EMAIL;
  const eP1 = process.env.ADMIN_PASSWORD_1;
  const eP2 = process.env.ADMIN_PASSWORD_2;
  if (!eEmail || !eP1 || !eP2) return false; // not configured → deny
  // Evaluate all three (no short-circuit) so timing doesn't reveal which failed.
  const ok1 = safeEqual(email.trim().toLowerCase(), eEmail.trim().toLowerCase());
  const ok2 = safeEqual(password1, eP1);
  const ok3 = safeEqual(password2, eP2);
  return ok1 && ok2 && ok3;
}

// ── Date helpers (UTC) ──────────────────────────────────────────────────────
const DAY_MS = 24 * 60 * 60 * 1000;
function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}
function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

// Fetch every row of a table (paginated past the 1000-row PostgREST cap).
async function fetchAll<T>(
  supa: SupabaseClient,
  table: string,
  columns: string
): Promise<T[]> {
  const pageSize = 1000;
  let from = 0;
  const out: T[] = [];
  // Hard cap so a runaway table can't hang the request.
  for (let guard = 0; guard < 500; guard++) {
    const { data, error } = await supa
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

// Row-count only (head request — pulls no rows).
async function headCount(supa: SupabaseClient, table: string): Promise<number> {
  const { count, error } = await supa.from(table).select("*", { count: "exact", head: true });
  if (error) throw new Error(`${table} count: ${error.message}`);
  return count ?? 0;
}

// Count of user_streaks with an active (> 0) overall streak.
async function activeStreakCount(supa: SupabaseClient): Promise<number> {
  const { count, error } = await supa
    .from("user_streaks")
    .select("*", { count: "exact", head: true })
    .gt("overall_current", 0);
  if (error) throw new Error(`user_streaks count: ${error.message}`);
  return count ?? 0;
}

// List every auth user (paginated admin API).
type AuthUserLite = { id: string; email: string | null; created_at: string };
async function listAllUsers(supa: SupabaseClient): Promise<AuthUserLite[]> {
  const perPage = 1000;
  const out: AuthUserLite[] = [];
  for (let page = 1; page <= 500; page++) {
    const { data, error } = await supa.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const users = data?.users ?? [];
    for (const u of users) {
      out.push({ id: u.id, email: u.email ?? null, created_at: u.created_at });
    }
    if (users.length < perPage) break;
  }
  return out;
}

// ── Types for the rows we pull ──────────────────────────────────────────────
type ChatRow = {
  user_id: string | null;
  anon_id: string | null;
  used_at: string;
  input_tokens: number | null;
  output_tokens: number | null;
  cache_read_tokens: number | null;
  cache_creation_tokens: number | null;
};
type DhikrRow = { user_id: string; local_date: string; count: number };
type HifzRow = { user_id: string; status: string };
type ProfileRow = { id: string; display_name: string | null };
type CircleMemberRow = { user_id: string };
type StreakRow = { user_id: string; overall_current: number | null };
type ModRow = { user_id: string; strike_count: number | null; suspended: boolean | null };

export async function POST(req: NextRequest) {
  // ── Parse + authenticate ──────────────────────────────────────────────
  let email = "", password1 = "", password2 = "";
  try {
    const body = await req.json();
    email = String(body.email ?? "");
    password1 = String(body.password1 ?? "");
    password2 = String(body.password2 ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: CORS_HEADERS });
  }

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_1 || !process.env.ADMIN_PASSWORD_2) {
    return NextResponse.json(
      { error: "Admin dashboard is not configured on the server." },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  if (!verifyCreds(email, password1, password2)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401, headers: CORS_HEADERS });
  }

  const supa = tryGetSupabaseServer();
  if (!supa) {
    return NextResponse.json(
      { error: "Database is not configured on the server (missing SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  // ── Gather data (service role bypasses RLS) ───────────────────────────
  try {
    const now = Date.now();
    const todayStart = startOfUtcDay(new Date(now));
    const d7 = now - 7 * DAY_MS;
    const d30 = now - 30 * DAY_MS;
    const d24h = now - DAY_MS;

    const [
      users, chat, dhikr, hifz, profiles, circlesCount, membersCount, streaksActive,
      memberRows, streakRows,
    ] = await Promise.all([
        listAllUsers(supa),
        fetchAll<ChatRow>(
          supa,
          "chat_usage",
          "user_id, anon_id, used_at, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens"
        ),
        fetchAll<DhikrRow>(supa, "dhikr_daily", "user_id, local_date, count"),
        fetchAll<HifzRow>(supa, "hifz_cards", "user_id, status"),
        fetchAll<ProfileRow>(supa, "profiles", "id, display_name"),
        headCount(supa, "circles"),
        headCount(supa, "circle_members"),
        activeStreakCount(supa),
        fetchAll<CircleMemberRow>(supa, "circle_members", "user_id"),
        fetchAll<StreakRow>(supa, "user_streaks", "user_id, overall_current"),
      ]);

    // Moderation is from migration 021 — tolerate it not being applied yet so
    // the dashboard still loads (just without strike/suspension columns).
    let modRows: ModRow[] = [];
    try {
      modRows = await fetchAll<ModRow>(supa, "user_moderation", "user_id, strike_count, suspended");
    } catch {
      modRows = [];
    }

    // Maintenance banner config (migration 022) — tolerate not-yet-applied.
    let banner = { enabled: false, level: "info", message: "" };
    try {
      const { data } = await supa.from("app_config").select("value").eq("key", "banner").maybeSingle();
      const v = ((data?.value ?? {}) as { enabled?: boolean; level?: string; message?: string });
      banner = { enabled: !!v.enabled, level: v.level ?? "info", message: v.message ?? "" };
    } catch {
      /* table may not exist yet */
    }

    // Lookups: user_id → email, user_id → display name.
    const emailById = new Map<string, string | null>();
    for (const u of users) emailById.set(u.id, u.email);
    const nameById = new Map<string, string | null>();
    for (const p of profiles) nameById.set(p.id, p.display_name);
    const labelFor = (userId: string): string => {
      const name = nameById.get(userId);
      const em = emailById.get(userId);
      if (name && em) return `${name} · ${em}`;
      if (name) return name;
      if (em) return em;
      return userId.slice(0, 8) + "…";
    };

    // ── 1. Users ──────────────────────────────────────────────────────
    let signupsToday = 0, signups7d = 0, signups30d = 0;
    const signupBuckets = new Map<string, number>();
    for (const u of users) {
      const t = Date.parse(u.created_at);
      if (Number.isNaN(t)) continue;
      if (t >= todayStart) signupsToday++;
      if (t >= d7) signups7d++;
      if (t >= d30) signups30d++;
      if (t >= d30) {
        const key = ymd(new Date(t));
        signupBuckets.set(key, (signupBuckets.get(key) ?? 0) + 1);
      }
    }

    // ── 2 + 3. Ask Hiqmah messages + AI cost ──────────────────────────
    let msgToday = 0, msg7d = 0, msg30d = 0;
    const msgUniqueUsers = new Set<string>();
    const msgBuckets = new Map<string, number>();
    const tokTotals = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    const tok30d = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    const tok7d = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    const tokToday = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    const byUserAllTime = new Map<string, number>(); // identity → message count
    const byUser24h = new Map<string, number>();

    for (const r of chat) {
      const t = Date.parse(r.used_at);
      if (Number.isNaN(t)) continue;
      const inp = r.input_tokens ?? 0;
      const out = r.output_tokens ?? 0;
      const cr = r.cache_read_tokens ?? 0;
      const cw = r.cache_creation_tokens ?? 0;

      tokTotals.input += inp; tokTotals.output += out; tokTotals.cacheRead += cr; tokTotals.cacheWrite += cw;
      if (t >= d30) { tok30d.input += inp; tok30d.output += out; tok30d.cacheRead += cr; tok30d.cacheWrite += cw; }
      if (t >= d7) { tok7d.input += inp; tok7d.output += out; tok7d.cacheRead += cr; tok7d.cacheWrite += cw; }
      if (t >= todayStart) { tokToday.input += inp; tokToday.output += out; tokToday.cacheRead += cr; tokToday.cacheWrite += cw; }

      if (t >= todayStart) msgToday++;
      if (t >= d7) msg7d++;
      if (t >= d30) { msg30d++; const k = ymd(new Date(t)); msgBuckets.set(k, (msgBuckets.get(k) ?? 0) + 1); }

      const identity = r.user_id ?? (r.anon_id ? `anon:${r.anon_id}` : null);
      if (r.user_id) msgUniqueUsers.add(r.user_id);
      if (identity) {
        byUserAllTime.set(identity, (byUserAllTime.get(identity) ?? 0) + 1);
        if (t >= d24h) byUser24h.set(identity, (byUser24h.get(identity) ?? 0) + 1);
      }
    }

    const costOf = (tk: { input: number; output: number; cacheRead: number; cacheWrite: number }) =>
      (tk.input * RATE_INPUT_PER_M +
        tk.output * RATE_OUTPUT_PER_M +
        tk.cacheRead * RATE_CACHE_READ_PER_M +
        tk.cacheWrite * RATE_CACHE_WRITE_PER_M) /
      1_000_000;

    // Top users by message count (signed-in shown by name/email; anon labelled).
    const topUsers = [...byUserAllTime.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([identity, count]) => {
        const label = identity.startsWith("anon:") ? "Anonymous (device)" : labelFor(identity);
        return { label, count };
      });

    // Users at/over the daily quota in the last 24h (quota-exceeded situations).
    const quotaExceeded = [...byUser24h.values()].filter((c) => c >= DAILY_QUOTA).length;

    // ── 4. Engagement ─────────────────────────────────────────────────
    let dhikrTotal = 0;
    const dhikrUsersAll = new Set<string>();
    const dhikrUsers30d = new Set<string>();
    for (const r of dhikr) {
      dhikrTotal += r.count ?? 0;
      dhikrUsersAll.add(r.user_id);
      // local_date is a device-local calendar date (YYYY-MM-DD); compare as string.
      if (r.local_date >= ymd(new Date(d30))) dhikrUsers30d.add(r.user_id);
    }

    const hifzUsers = new Set<string>();
    let hifzMemorized = 0;
    for (const c of hifz) {
      hifzUsers.add(c.user_id);
      if (c.status === "memorized") hifzMemorized++;
    }

    // ── 5. Recent activity feeds ──────────────────────────────────────
    const recentSignups = [...users]
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, 15)
      .map((u) => ({
        label: (nameById.get(u.id) || u.email || u.id.slice(0, 8) + "…") as string,
        email: u.email,
        at: u.created_at,
      }));

    const recentMessages = [...chat]
      .sort((a, b) => Date.parse(b.used_at) - Date.parse(a.used_at))
      .slice(0, 15)
      .map((r) => ({
        label: r.user_id
          ? (nameById.get(r.user_id) || emailById.get(r.user_id) || r.user_id.slice(0, 8) + "…")
          : "Anonymous",
        at: r.used_at,
      }));

    // ── 6. Per-user table + guest count ───────────────────────────────
    // Guests = distinct anon device ids that have used Ask with no account.
    const askByUser = new Map<string, number>();
    const askLastByUser = new Map<string, number>();
    const guestSet = new Set<string>();
    for (const r of chat) {
      if (r.user_id) {
        askByUser.set(r.user_id, (askByUser.get(r.user_id) ?? 0) + 1);
        const t = Date.parse(r.used_at);
        if (!Number.isNaN(t)) {
          askLastByUser.set(r.user_id, Math.max(askLastByUser.get(r.user_id) ?? 0, t));
        }
      } else if (r.anon_id) {
        guestSet.add(r.anon_id);
      }
    }
    const dhikrByUser = new Map<string, number>();
    for (const r of dhikr) dhikrByUser.set(r.user_id, (dhikrByUser.get(r.user_id) ?? 0) + (r.count ?? 0));
    const hifzByUser = new Map<string, number>();
    for (const c of hifz) hifzByUser.set(c.user_id, (hifzByUser.get(c.user_id) ?? 0) + 1);
    const circleByUser = new Map<string, number>();
    for (const m of memberRows) circleByUser.set(m.user_id, (circleByUser.get(m.user_id) ?? 0) + 1);
    const streakByUser = new Map<string, number>();
    for (const s of streakRows) streakByUser.set(s.user_id, s.overall_current ?? 0);
    const modByUser = new Map<string, { strikes: number; suspended: boolean }>();
    for (const m of modRows) modByUser.set(m.user_id, { strikes: m.strike_count ?? 0, suspended: !!m.suspended });

    const userTable = users
      .map((u) => {
        const mod = modByUser.get(u.id);
        const last = askLastByUser.get(u.id);
        return {
          id: u.id,
          name: nameById.get(u.id) || null,
          email: u.email,
          joinedAt: u.created_at,
          lastActiveAt: last ? new Date(last).toISOString() : null,
          ask: askByUser.get(u.id) ?? 0,
          hifz: hifzByUser.get(u.id) ?? 0,
          dhikr: dhikrByUser.get(u.id) ?? 0,
          circles: circleByUser.get(u.id) ?? 0,
          streak: streakByUser.get(u.id) ?? 0,
          strikes: mod?.strikes ?? 0,
          suspended: mod?.suspended ?? false,
        };
      })
      .sort((a, b) => Date.parse(b.joinedAt) - Date.parse(a.joinedAt));

    // Build the 30-day daily series (oldest → newest) for both charts.
    const signupSeries: { label: string; date: string; count: number }[] = [];
    const messageSeries: { label: string; date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * DAY_MS);
      const key = ymd(d);
      const label = String(d.getUTCDate());
      signupSeries.push({ label, date: key, count: signupBuckets.get(key) ?? 0 });
      messageSeries.push({ label, date: key, count: msgBuckets.get(key) ?? 0 });
    }

    return NextResponse.json(
      {
        generatedAt: new Date(now).toISOString(),
        users: {
          total: users.length,
          signedUp: users.length,
          guests: guestSet.size,
          today: signupsToday,
          last7d: signups7d,
          last30d: signups30d,
          series: signupSeries,
        },
        userTable,
        ask: {
          total: chat.length,
          today: msgToday,
          last7d: msg7d,
          last30d: msg30d,
          uniqueUsers: msgUniqueUsers.size,
          quotaExceeded24h: quotaExceeded,
          dailyQuota: DAILY_QUOTA,
          series: messageSeries,
          topUsers,
        },
        cost: {
          estimate: true,
          rates: {
            inputPerM: RATE_INPUT_PER_M,
            outputPerM: RATE_OUTPUT_PER_M,
            cacheReadPerM: RATE_CACHE_READ_PER_M,
            cacheWritePerM: RATE_CACHE_WRITE_PER_M,
          },
          tokens: {
            today: tokToday,
            last7d: tok7d,
            last30d: tok30d,
            allTime: tokTotals,
          },
          usd: {
            today: costOf(tokToday),
            last7d: costOf(tok7d),
            last30d: costOf(tok30d),
            allTime: costOf(tokTotals),
          },
        },
        engagement: {
          dhikrTotal,
          dhikrUsersAll: dhikrUsersAll.size,
          dhikrUsers30d: dhikrUsers30d.size,
          hifzCards: hifz.length,
          hifzMemorized,
          hifzUsers: hifzUsers.size,
          circles: circlesCount,
          circleMembers: membersCount,
          activeStreaks: streaksActive,
        },
        recent: {
          signups: recentSignups,
          messages: recentMessages,
        },
        config: { banner },
      },
      { headers: CORS_HEADERS }
    );
  } catch (e) {
    console.error("[Admin stats] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load stats" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
