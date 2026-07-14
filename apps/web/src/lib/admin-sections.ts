import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchAll,
  headCount,
  listAllUsers,
  makeLabeler,
  ymd,
  startOfUtcDay,
  isoDaysAgo,
  DAY_MS,
  type AuthUserLite,
} from "./admin-data";

// ── Pricing (see stats route history: tokens summed across Haiku+Opus per
//    message, priced at Opus 4.8 tiers — an upper-bound estimate). ──
const RATE = { input: 5.0, output: 25.0, cacheRead: 0.5, cacheWrite: 6.25 };
const ANON_QUOTA = 5;
// Mirrors get_quota_for_today (migration 024) — temporary pre-launch bump from 15.
const SIGNED_QUOTA = 100;
const CHAT_WINDOW_DAYS = 90; // the only table windowed (the scale risk)

type Tokens = { input: number; output: number; cacheRead: number; cacheWrite: number };
const zeroTok = (): Tokens => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
function costOf(t: Tokens): number {
  return (
    (t.input * RATE.input + t.output * RATE.output + t.cacheRead * RATE.cacheRead + t.cacheWrite * RATE.cacheWrite) /
    1_000_000
  );
}

type ChatRow = {
  user_id: string | null;
  anon_id: string | null;
  used_at: string;
  input_tokens: number | null;
  output_tokens: number | null;
  cache_read_tokens: number | null;
  cache_creation_tokens: number | null;
};
type DhikrRow = { user_id: string; local_date: string; count: number; dhikr_key?: string | null };
type HifzRow = { user_id: string; status: string };
type HifzReviewRow = { user_id: string; local_date: string; grade: string | null };
type ProfileRow = { id: string; display_name: string | null };
type MemberRow = { user_id: string; circle_id: string; role?: string | null };
type StreakRow = { user_id: string; overall_current: number | null; overall_best: number | null; prayer_current: number | null };
type ModRow = { user_id: string; strike_count: number | null; suspended: boolean | null };
type MsgRow = { user_id: string; circle_id: string; created_at: string; deleted_at: string | null };
type ChecklistRow = { user_id: string; local_date: string };

// Build userId → Set<dayString> activity from mixed UTC + device-local sources.
type Activity = Map<string, Set<string>>;
function addDay(m: Activity, uid: string | null, day: string) {
  if (!uid) return;
  let s = m.get(uid);
  if (!s) m.set(uid, (s = new Set()));
  s.add(day);
}

async function fetchNameEmail(supa: SupabaseClient, users: AuthUserLite[]) {
  const profiles = await fetchAll<ProfileRow>(supa, "profiles", "id, display_name");
  const emailById = new Map<string, string | null>();
  const nameById = new Map<string, string | null>();
  for (const u of users) emailById.set(u.id, u.email);
  for (const p of profiles) nameById.set(p.id, p.display_name);
  // Fall back to auth metadata name if there's no profile display_name.
  for (const u of users) {
    if (!nameById.get(u.id)) {
      const nm = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
      if (nm) nameById.set(u.id, nm);
    }
  }
  return { nameById, emailById, label: makeLabeler(nameById, emailById) };
}

function dayKeys(n: number, now = Date.now()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(ymd(new Date(now - i * DAY_MS)));
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// OVERVIEW
// ────────────────────────────────────────────────────────────────────────────
export async function overviewSection(supa: SupabaseClient) {
  const now = Date.now();
  const todayStart = startOfUtcDay(new Date(now));
  const win = isoDaysAgo(30, now);

  const [users, chat, msgs, hifzRev, dhikr, checklist] = await Promise.all([
    listAllUsers(supa),
    fetchAll<ChatRow>(supa, "chat_usage", "user_id, anon_id, used_at, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens", { gteCol: "used_at", gteVal: win }),
    fetchAll<MsgRow>(supa, "circle_messages", "user_id, circle_id, created_at, deleted_at", { gteCol: "created_at", gteVal: win }),
    fetchAll<HifzReviewRow>(supa, "hifz_reviews", "user_id, local_date, grade", { gteCol: "local_date", gteVal: ymd(new Date(now - 30 * DAY_MS)) }),
    fetchAll<DhikrRow>(supa, "dhikr_daily", "user_id, local_date, count", { gteCol: "local_date", gteVal: ymd(new Date(now - 30 * DAY_MS)) }),
    fetchAll<ChecklistRow>(supa, "checklist_day", "user_id, local_date", { gteCol: "local_date", gteVal: ymd(new Date(now - 30 * DAY_MS)) }),
  ]);

  let openReports = 0;
  try {
    const { count } = await supa.from("circle_message_reports").select("*", { count: "exact", head: true }).eq("status", "open");
    openReports = count ?? 0;
  } catch {
    openReports = 0;
  }
  let suspended = 0;
  try {
    const { count } = await supa.from("user_moderation").select("*", { count: "exact", head: true }).eq("suspended", true);
    suspended = count ?? 0;
  } catch {
    suspended = 0;
  }
  const askTotal = await headCount(supa, "chat_usage");

  // Activity union.
  const act: Activity = new Map();
  for (const r of chat) addDay(act, r.user_id, ymd(new Date(r.used_at)));
  for (const r of msgs) if (!r.deleted_at) addDay(act, r.user_id, ymd(new Date(r.created_at)));
  for (const r of hifzRev) addDay(act, r.user_id, r.local_date);
  for (const r of dhikr) addDay(act, r.user_id, r.local_date);
  for (const r of checklist) addDay(act, r.user_id, r.local_date);

  const today = ymd(new Date(now));
  const days7 = new Set(dayKeys(7, now));
  const days30 = new Set(dayKeys(30, now));
  let dau = 0, wau = 0, mau = 0;
  for (const [, set] of act) {
    if (set.has(today)) dau++;
    if ([...set].some((d) => days7.has(d))) wau++;
    if ([...set].some((d) => days30.has(d))) mau++;
  }
  const stickiness = mau > 0 ? Math.round((dau / mau) * 100) : 0;

  // Active-users series (30d).
  const activeSeries = dayKeys(30, now).map((day) => {
    let c = 0;
    for (const [, set] of act) if (set.has(day)) c++;
    return { label: String(new Date(day + "T00:00:00Z").getUTCDate()), date: day, count: c };
  });

  // Signups.
  let signupsToday = 0, signups7d = 0;
  const signupBuckets = new Map<string, number>();
  for (const u of users) {
    const t = Date.parse(u.created_at);
    if (Number.isNaN(t)) continue;
    if (t >= todayStart) signupsToday++;
    if (t >= now - 7 * DAY_MS) signups7d++;
    if (t >= now - 30 * DAY_MS) signupBuckets.set(ymd(new Date(t)), (signupBuckets.get(ymd(new Date(t))) ?? 0) + 1);
  }
  const signupSeries = dayKeys(30, now).map((day) => ({ label: String(new Date(day + "T00:00:00Z").getUTCDate()), date: day, count: signupBuckets.get(day) ?? 0 }));

  // Ask + cost by day (30d).
  const tokByDay = new Map<string, Tokens>();
  let askToday = 0;
  const tokToday = zeroTok(), tok30 = zeroTok();
  for (const r of chat) {
    const t = Date.parse(r.used_at);
    const day = ymd(new Date(r.used_at));
    const cur = tokByDay.get(day) ?? zeroTok();
    cur.input += r.input_tokens ?? 0; cur.output += r.output_tokens ?? 0;
    cur.cacheRead += r.cache_read_tokens ?? 0; cur.cacheWrite += r.cache_creation_tokens ?? 0;
    tokByDay.set(day, cur);
    tok30.input += r.input_tokens ?? 0; tok30.output += r.output_tokens ?? 0;
    tok30.cacheRead += r.cache_read_tokens ?? 0; tok30.cacheWrite += r.cache_creation_tokens ?? 0;
    if (t >= todayStart) {
      askToday++;
      tokToday.input += r.input_tokens ?? 0; tokToday.output += r.output_tokens ?? 0;
      tokToday.cacheRead += r.cache_read_tokens ?? 0; tokToday.cacheWrite += r.cache_creation_tokens ?? 0;
    }
  }
  const costSeries = dayKeys(30, now).map((day) => ({ label: String(new Date(day + "T00:00:00Z").getUTCDate()), date: day, count: Math.round(costOf(tokByDay.get(day) ?? zeroTok()) * 100) / 100 }));
  const cost7Avg = costSeries.slice(-7).reduce((a, s) => a + s.count, 0) / 7;

  // Recent feeds.
  const { nameById, emailById } = await fetchNameEmail(supa, users);
  const recentSignups = [...users].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 12)
    .map((u) => ({ label: nameById.get(u.id) || u.email || u.id.slice(0, 8) + "…", email: u.email, at: u.created_at }));
  const recentMessages = [...chat].sort((a, b) => Date.parse(b.used_at) - Date.parse(a.used_at)).slice(0, 12)
    .map((r) => ({ label: r.user_id ? nameById.get(r.user_id) || emailById.get(r.user_id) || r.user_id.slice(0, 8) + "…" : "Guest", at: r.used_at }));

  return {
    generatedAt: new Date(now).toISOString(),
    kpis: { dau, wau, mau, stickiness, signupsToday, signups7d, askToday, askTotal, costToday: costOf(tokToday), cost30: costOf(tok30), openReports, suspended },
    activeSeries,
    signupSeries,
    costSeries,
    attention: {
      openReports,
      suspended,
      costSpike: cost7Avg > 0 && costOf(tokToday) > 2 * cost7Avg,
      costToday: costOf(tokToday),
      cost7Avg,
    },
    recent: { signups: recentSignups, messages: recentMessages },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// USERS
// ────────────────────────────────────────────────────────────────────────────
export async function usersSection(supa: SupabaseClient) {
  const now = Date.now();
  const todayStart = startOfUtcDay(new Date(now));

  const cohortWin = ymd(new Date(now - 63 * DAY_MS)); // 9 weeks for the cohort grid
  const [users, chat, dhikr, hifz, memberRows, streakRows, hifzRev, msgs, checklist] = await Promise.all([
    listAllUsers(supa),
    fetchAll<ChatRow>(supa, "chat_usage", "user_id, anon_id, used_at, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens", { gteCol: "used_at", gteVal: isoDaysAgo(CHAT_WINDOW_DAYS, now) }),
    fetchAll<DhikrRow>(supa, "dhikr_daily", "user_id, local_date, count"),
    fetchAll<HifzRow>(supa, "hifz_cards", "user_id, status"),
    fetchAll<MemberRow>(supa, "circle_members", "user_id, circle_id"),
    fetchAll<StreakRow>(supa, "user_streaks", "user_id, overall_current, overall_best, prayer_current"),
    fetchAll<HifzReviewRow>(supa, "hifz_reviews", "user_id, local_date, grade", { gteCol: "local_date", gteVal: cohortWin }),
    fetchAll<MsgRow>(supa, "circle_messages", "user_id, circle_id, created_at, deleted_at", { gteCol: "created_at", gteVal: isoDaysAgo(63, now) }),
    fetchAll<ChecklistRow>(supa, "checklist_day", "user_id, local_date", { gteCol: "local_date", gteVal: cohortWin }),
  ]);
  let modRows: ModRow[] = [];
  try { modRows = await fetchAll<ModRow>(supa, "user_moderation", "user_id, strike_count, suspended"); } catch { modRows = []; }

  const { nameById } = await fetchNameEmail(supa, users);

  // Per-user aggregates.
  const askByUser = new Map<string, number>();
  const askLast = new Map<string, number>();
  const costByUser = new Map<string, number>();
  const guestSet = new Set<string>();
  for (const r of chat) {
    if (r.user_id) {
      askByUser.set(r.user_id, (askByUser.get(r.user_id) ?? 0) + 1);
      const t = Date.parse(r.used_at);
      if (!Number.isNaN(t)) askLast.set(r.user_id, Math.max(askLast.get(r.user_id) ?? 0, t));
      costByUser.set(r.user_id, (costByUser.get(r.user_id) ?? 0) + costOf({ input: r.input_tokens ?? 0, output: r.output_tokens ?? 0, cacheRead: r.cache_read_tokens ?? 0, cacheWrite: r.cache_creation_tokens ?? 0 }));
    } else if (r.anon_id) guestSet.add(r.anon_id);
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

  // Last-active per user (max of last sign-in + last ask + recent dhikr day).
  const lastActive = new Map<string, number>();
  const bump = (uid: string, t: number) => { if (!Number.isNaN(t)) lastActive.set(uid, Math.max(lastActive.get(uid) ?? 0, t)); };
  for (const u of users) if (u.last_sign_in_at) bump(u.id, Date.parse(u.last_sign_in_at));
  for (const [uid, t] of askLast) bump(uid, t);
  for (const r of dhikr) bump(r.user_id, Date.parse(r.local_date + "T00:00:00Z"));

  const d30 = now - 30 * DAY_MS;
  let dormant = 0;
  const userTable = users.map((u) => {
    const mod = modByUser.get(u.id);
    const la = lastActive.get(u.id) ?? null;
    if (!la || la < d30) dormant++;
    return {
      id: u.id,
      name: nameById.get(u.id) || null,
      email: u.email,
      joinedAt: u.created_at,
      lastActiveAt: la ? new Date(la).toISOString() : null,
      ask: askByUser.get(u.id) ?? 0,
      askCost: Math.round((costByUser.get(u.id) ?? 0) * 10000) / 10000,
      hifz: hifzByUser.get(u.id) ?? 0,
      dhikr: dhikrByUser.get(u.id) ?? 0,
      circles: circleByUser.get(u.id) ?? 0,
      streak: streakByUser.get(u.id) ?? 0,
      strikes: mod?.strikes ?? 0,
      suspended: mod?.suspended ?? false,
    };
  }).sort((a, b) => Date.parse(b.joinedAt) - Date.parse(a.joinedAt));

  // Signup counts + cumulative + cohort retention (weekly).
  let today = 0, d7 = 0, d30c = 0;
  const signupBuckets = new Map<string, number>();
  for (const u of users) {
    const t = Date.parse(u.created_at);
    if (Number.isNaN(t)) continue;
    if (t >= todayStart) today++;
    if (t >= now - 7 * DAY_MS) d7++;
    if (t >= now - 30 * DAY_MS) d30c++;
    if (t >= now - 30 * DAY_MS) signupBuckets.set(ymd(new Date(t)), (signupBuckets.get(ymd(new Date(t))) ?? 0) + 1);
  }
  const signupSeries = dayKeys(30, now).map((day) => ({ label: String(new Date(day + "T00:00:00Z").getUTCDate()), date: day, count: signupBuckets.get(day) ?? 0 }));
  // Seed the running total with everyone created before the first charted day
  // (UTC-day boundary — matching the per-day buckets, so no boundary-day drop).
  const firstDayStart = startOfUtcDay(new Date(now - 29 * DAY_MS));
  let running = users.filter((u) => { const t = Date.parse(u.created_at); return !Number.isNaN(t) && t < firstDayStart; }).length;
  const cumulativeSeries = signupSeries.map((s) => { running += s.count; return { label: s.label, date: s.date, count: running }; });

  const guestsAllTime = guestSet.size;

  return {
    generatedAt: new Date(now).toISOString(),
    kpis: { signedUp: users.length, guests: guestsAllTime, today, last7d: d7, last30d: d30c, dormant },
    signupSeries,
    cumulativeSeries,
    cohort: buildCohort(users, chat, dhikr, hifzRev, msgs, checklist, now),
    funnel: { guestsAllTime, guestMessages: chat.filter((r) => !r.user_id).length, signups30d: d30c },
    userTable,
  };
}

// Weekly signup cohort retention (rows = signup week, cols = weeks-since-signup).
function buildCohort(users: AuthUserLite[], chat: ChatRow[], dhikr: DhikrRow[], hifzRev: HifzReviewRow[], msgs: MsgRow[], checklist: ChecklistRow[], now: number) {
  const WEEK = 7 * DAY_MS;
  const weeks = 8;
  const weekStart = (t: number) => { const d = new Date(t); const day = (d.getUTCDay() + 6) % 7; return startOfUtcDay(d) - day * DAY_MS; };
  const thisWeek = weekStart(now);
  // Same 5-source activity definition as DAU/MAU.
  const act: Activity = new Map();
  for (const r of chat) if (r.user_id) addDay(act, r.user_id, ymd(new Date(r.used_at)));
  for (const r of dhikr) addDay(act, r.user_id, r.local_date);
  for (const r of hifzRev) addDay(act, r.user_id, r.local_date);
  for (const r of msgs) if (!r.deleted_at) addDay(act, r.user_id, ymd(new Date(r.created_at)));
  for (const r of checklist) addDay(act, r.user_id, r.local_date);
  const activeWeeks = new Map<string, Set<number>>();
  for (const [uid, days] of act) {
    const s = new Set<number>();
    for (const d of days) s.add(weekStart(Date.parse(d + "T00:00:00Z")));
    activeWeeks.set(uid, s);
  }
  const cohorts: { week: string; size: number; retention: (number | null)[] }[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const cohortStart = thisWeek - w * WEEK;
    const cohortUsers = users.filter((u) => weekStart(Date.parse(u.created_at)) === cohortStart);
    const size = cohortUsers.length;
    const retention: (number | null)[] = [];
    for (let k = 0; k <= w; k++) {
      const targetWeek = cohortStart + k * WEEK;
      if (size === 0) { retention.push(null); continue; }
      const activeCount = cohortUsers.filter((u) => activeWeeks.get(u.id)?.has(targetWeek)).length;
      retention.push(Math.round((activeCount / size) * 100));
    }
    cohorts.push({ week: ymd(new Date(cohortStart)), size, retention });
  }
  return cohorts;
}

// ────────────────────────────────────────────────────────────────────────────
// ASK & COST
// ────────────────────────────────────────────────────────────────────────────
export async function askSection(supa: SupabaseClient) {
  const now = Date.now();
  const todayStart = startOfUtcDay(new Date(now));
  const [users, chat] = await Promise.all([
    listAllUsers(supa),
    fetchAll<ChatRow>(supa, "chat_usage", "user_id, anon_id, used_at, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens", { gteCol: "used_at", gteVal: isoDaysAgo(90, now) }),
  ]);
  const askTotal = await headCount(supa, "chat_usage");
  const { nameById, emailById } = await fetchNameEmail(supa, users);
  const label = (uid: string) => nameById.get(uid) || emailById.get(uid) || uid.slice(0, 8) + "…";

  const d24 = now - DAY_MS, d7 = now - 7 * DAY_MS, d30 = now - 30 * DAY_MS;
  let today = 0, w = 0, m = 0, anon30 = 0, msg30 = 0;
  const tok30 = zeroTok();
  const signedByDay = new Map<string, number>(), anonByDay = new Map<string, number>();
  const uniqByDay = new Map<string, Set<string>>();
  const tokByDay = new Map<string, Tokens>();
  const msgByUser = new Map<string, number>(), costByUser = new Map<string, number>();
  const by24 = new Map<string, number>();
  for (const r of chat) {
    const t = Date.parse(r.used_at); const day = ymd(new Date(r.used_at));
    const id = r.user_id ?? (r.anon_id ? `anon:${r.anon_id}` : null);
    if (t >= todayStart) today++;
    if (t >= d7) w++;
    if (t >= d30) { m++; msg30++; if (!r.user_id) anon30++; tok30.input += r.input_tokens ?? 0; tok30.output += r.output_tokens ?? 0; tok30.cacheRead += r.cache_read_tokens ?? 0; tok30.cacheWrite += r.cache_creation_tokens ?? 0; }
    (r.user_id ? signedByDay : anonByDay).set(day, ((r.user_id ? signedByDay : anonByDay).get(day) ?? 0) + 1);
    if (!uniqByDay.has(day)) uniqByDay.set(day, new Set());
    if (id) uniqByDay.get(day)!.add(id);
    const cur = tokByDay.get(day) ?? zeroTok();
    cur.input += r.input_tokens ?? 0; cur.output += r.output_tokens ?? 0; cur.cacheRead += r.cache_read_tokens ?? 0; cur.cacheWrite += r.cache_creation_tokens ?? 0;
    tokByDay.set(day, cur);
    if (r.user_id) { msgByUser.set(r.user_id, (msgByUser.get(r.user_id) ?? 0) + 1); costByUser.set(r.user_id, (costByUser.get(r.user_id) ?? 0) + costOf({ input: r.input_tokens ?? 0, output: r.output_tokens ?? 0, cacheRead: r.cache_read_tokens ?? 0, cacheWrite: r.cache_creation_tokens ?? 0 })); }
    if (t >= d24 && id) by24.set(id, (by24.get(id) ?? 0) + 1);
  }
  const days = dayKeys(30, now);
  const messagesStacked = days.map((day) => ({ label: String(new Date(day + "T00:00:00Z").getUTCDate()), date: day, a: signedByDay.get(day) ?? 0, b: anonByDay.get(day) ?? 0 }));
  const costSeries = days.map((day) => ({ label: String(new Date(day + "T00:00:00Z").getUTCDate()), date: day, count: Math.round(costOf(tokByDay.get(day) ?? zeroTok()) * 100) / 100 }));
  const uniqSeries = days.map((day) => ({ label: String(new Date(day + "T00:00:00Z").getUTCDate()), date: day, count: uniqByDay.get(day)?.size ?? 0 }));
  const topByCost = [...costByUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([uid, c]) => ({ label: label(uid), count: Math.round(c * 100) / 100 }));
  const topByMsgs = [...msgByUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([uid, c]) => ({ label: label(uid), count: c }));
  const quotaSigned = [...by24.entries()].filter(([id, c]) => !id.startsWith("anon:") && c >= SIGNED_QUOTA).length;
  const quotaAnon = [...by24.entries()].filter(([id, c]) => id.startsWith("anon:") && c >= ANON_QUOTA).length;
  const cacheRatio = tok30.input + tok30.cacheRead > 0 ? Math.round((tok30.cacheRead / (tok30.input + tok30.cacheRead)) * 100) : 0;

  return {
    generatedAt: new Date(now).toISOString(),
    kpis: { total: askTotal, today, last7d: w, last30d: m, anonShare30: msg30 > 0 ? Math.round((anon30 / msg30) * 100) : 0, avgCost30: m > 0 ? costOf(tok30) / m : 0, cacheRatio, quotaSigned, quotaAnon, signedQuota: SIGNED_QUOTA, anonQuota: ANON_QUOTA },
    tokenMix30: tok30,
    cost30: costOf(tok30),
    rates: RATE,
    messagesStacked,
    costSeries,
    uniqSeries,
    topByCost,
    topByMsgs,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// ENGAGEMENT
// ────────────────────────────────────────────────────────────────────────────
export async function engagementSection(supa: SupabaseClient) {
  const now = Date.now();
  const [users, dhikr, hifz, hifzRev, memberRows, streakRows, checklist] = await Promise.all([
    listAllUsers(supa),
    fetchAll<DhikrRow>(supa, "dhikr_daily", "user_id, local_date, count, dhikr_key"),
    fetchAll<HifzRow>(supa, "hifz_cards", "user_id, status"),
    fetchAll<HifzReviewRow>(supa, "hifz_reviews", "user_id, local_date, grade", { gteCol: "local_date", gteVal: ymd(new Date(now - 30 * DAY_MS)) }),
    fetchAll<MemberRow>(supa, "circle_members", "user_id, circle_id"),
    fetchAll<StreakRow>(supa, "user_streaks", "user_id, overall_current, overall_best, prayer_current"),
    fetchAll<ChecklistRow>(supa, "checklist_day", "user_id, local_date", { gteCol: "local_date", gteVal: ymd(new Date(now - 30 * DAY_MS)) }),
  ]);
  const { nameById, emailById } = await fetchNameEmail(supa, users);
  const label = (uid: string) => nameById.get(uid) || emailById.get(uid) || uid.slice(0, 8) + "…";
  const total = Math.max(1, users.length);

  const hifzUsers = new Set(hifz.map((c) => c.user_id));
  const dhikrUsers = new Set(dhikr.map((r) => r.user_id));
  const circleUsers = new Set(memberRows.map((m) => m.user_id));
  const checklistUsers30 = new Set(checklist.map((r) => r.user_id));

  // Dhikr by day + by key.
  const dhikrByDay = new Map<string, number>();
  const dhikrByKey = new Map<string, number>();
  let dhikrTotal = 0;
  const dhikrByUser = new Map<string, number>();
  for (const r of dhikr) {
    dhikrTotal += r.count ?? 0;
    if (r.local_date >= ymd(new Date(now - 30 * DAY_MS))) dhikrByDay.set(r.local_date, (dhikrByDay.get(r.local_date) ?? 0) + (r.count ?? 0));
    if (r.dhikr_key) dhikrByKey.set(r.dhikr_key, (dhikrByKey.get(r.dhikr_key) ?? 0) + (r.count ?? 0));
    dhikrByUser.set(r.user_id, (dhikrByUser.get(r.user_id) ?? 0) + (r.count ?? 0));
  }
  const dhikrSeries = dayKeys(30, now).map((day) => ({ label: String(new Date(day + "T00:00:00Z").getUTCDate()), date: day, count: dhikrByDay.get(day) ?? 0 }));
  const topAdhkar = [...dhikrByKey.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, c]) => ({ label: k, count: c }));

  // Hifz status mix + reviews/day + grade mix.
  const statusMix: Record<string, number> = {};
  for (const c of hifz) statusMix[c.status] = (statusMix[c.status] ?? 0) + 1;
  const revByDay = new Map<string, number>();
  const gradeMix: Record<string, number> = {};
  for (const r of hifzRev) { revByDay.set(r.local_date, (revByDay.get(r.local_date) ?? 0) + 1); if (r.grade) gradeMix[r.grade] = (gradeMix[r.grade] ?? 0) + 1; }
  const reviewSeries = dayKeys(30, now).map((day) => ({ label: String(new Date(day + "T00:00:00Z").getUTCDate()), date: day, count: revByDay.get(day) ?? 0 }));

  // Streak distribution + median.
  const currents = streakRows.map((s) => s.overall_current ?? 0).filter((n) => n > 0).sort((a, b) => a - b);
  const medianStreak = currents.length ? currents[Math.floor(currents.length / 2)] : 0;
  const buckets = [{ label: "1–6", count: 0 }, { label: "7–29", count: 0 }, { label: "30–99", count: 0 }, { label: "100+", count: 0 }];
  for (const n of currents) { if (n < 7) buckets[0].count++; else if (n < 30) buckets[1].count++; else if (n < 100) buckets[2].count++; else buckets[3].count++; }
  const activeStreaks = currents.length;

  // Leaderboards.
  const topDhikr = [...dhikrByUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([uid, c]) => ({ label: label(uid), count: c }));
  const topStreak = streakRows.filter((s) => (s.overall_current ?? 0) > 0).sort((a, b) => (b.overall_current ?? 0) - (a.overall_current ?? 0)).slice(0, 8).map((s) => ({ label: label(s.user_id), count: s.overall_current ?? 0 }));
  const hifzByUser = new Map<string, number>();
  for (const c of hifz) if (c.status === "memorized") hifzByUser.set(c.user_id, (hifzByUser.get(c.user_id) ?? 0) + 1);
  const topHifz = [...hifzByUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([uid, c]) => ({ label: label(uid), count: c }));

  return {
    generatedAt: new Date(now).toISOString(),
    kpis: {
      adoptHifz: Math.round((hifzUsers.size / total) * 100),
      adoptDhikr: Math.round((dhikrUsers.size / total) * 100),
      adoptCircles: Math.round((circleUsers.size / total) * 100),
      checklistUsers30: checklistUsers30.size,
      dhikrTotal, activeStreaks, medianStreak,
      hifzMemorized: statusMix["memorized"] ?? 0,
    },
    dhikrSeries, topAdhkar,
    statusMix, reviewSeries, gradeMix,
    streakBuckets: buckets,
    leaderboards: { topDhikr, topStreak, topHifz },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// CIRCLES
// ────────────────────────────────────────────────────────────────────────────
type CircleRow = { id: string; name: string | null; owner_id: string | null; goal_type: string | null; goal_unit: string | null; goal_target: number | null; ranking_enabled?: boolean | null; created_at: string };
export async function circlesSection(supa: SupabaseClient) {
  const now = Date.now();
  const [users, circles, memberRows, msgs] = await Promise.all([
    listAllUsers(supa),
    fetchAll<CircleRow>(supa, "circles", "id, name, owner_id, goal_type, goal_unit, goal_target, created_at"),
    fetchAll<MemberRow>(supa, "circle_members", "user_id, circle_id, role"),
    fetchAll<MsgRow>(supa, "circle_messages", "user_id, circle_id, created_at, deleted_at", { gteCol: "created_at", gteVal: isoDaysAgo(90, now) }),
  ]);
  const { nameById, emailById } = await fetchNameEmail(supa, users);
  const label = (uid: string | null) => (uid ? nameById.get(uid) || emailById.get(uid) || uid.slice(0, 8) + "…" : "—");

  const membersByCircle = new Map<string, number>();
  for (const m of memberRows) membersByCircle.set(m.circle_id, (membersByCircle.get(m.circle_id) ?? 0) + 1);
  const d7 = now - 7 * DAY_MS, d30 = now - 30 * DAY_MS;
  const msgByCircle = new Map<string, number>(), lastMsg = new Map<string, number>();
  const msgByDay = new Map<string, number>();
  let active7 = new Set<string>(), active30 = new Set<string>(), messages30 = 0;
  for (const r of msgs) {
    if (r.deleted_at) continue;
    const t = Date.parse(r.created_at);
    if (t >= d30) { msgByCircle.set(r.circle_id, (msgByCircle.get(r.circle_id) ?? 0) + 1); active30.add(r.circle_id); messages30++; msgByDay.set(ymd(new Date(r.created_at)), (msgByDay.get(ymd(new Date(r.created_at))) ?? 0) + 1); }
    if (t >= d7) active7.add(r.circle_id);
    lastMsg.set(r.circle_id, Math.max(lastMsg.get(r.circle_id) ?? 0, t));
  }
  const sizes = circles.map((c) => membersByCircle.get(c.id) ?? 0);
  const totalMembers = sizes.reduce((a, b) => a + b, 0);
  const sizeSorted = [...sizes].sort((a, b) => a - b);
  const medianSize = sizeSorted.length ? sizeSorted[Math.floor(sizeSorted.length / 2)] : 0;
  const dead = circles.filter((c) => !active30.has(c.id)).length;
  const msgSeries = dayKeys(30, now).map((day) => ({ label: String(new Date(day + "T00:00:00Z").getUTCDate()), date: day, count: msgByDay.get(day) ?? 0 }));
  const topCircles = [...msgByCircle.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, c]) => ({ label: circles.find((x) => x.id === id)?.name || "Circle", count: c }));
  const sizeBuckets = [{ label: "1", count: 0 }, { label: "2–4", count: 0 }, { label: "5–9", count: 0 }, { label: "10+", count: 0 }];
  for (const s of sizes) { if (s <= 1) sizeBuckets[0].count++; else if (s < 5) sizeBuckets[1].count++; else if (s < 10) sizeBuckets[2].count++; else sizeBuckets[3].count++; }

  const table = circles.map((c) => ({
    id: c.id, name: c.name || "Untitled", owner: label(c.owner_id),
    members: membersByCircle.get(c.id) ?? 0, messages30: msgByCircle.get(c.id) ?? 0,
    lastMsgAt: lastMsg.has(c.id) ? new Date(lastMsg.get(c.id)!).toISOString() : null,
    createdAt: c.created_at, goal: c.goal_type || "—",
  })).sort((a, b) => (Date.parse(b.lastMsgAt ?? "0") || 0) - (Date.parse(a.lastMsgAt ?? "0") || 0));

  return {
    generatedAt: new Date(now).toISOString(),
    kpis: { circles: circles.length, members: totalMembers, active7: active7.size, active30: active30.size, dead, avgMembers: circles.length ? Math.round((totalMembers / circles.length) * 10) / 10 : 0, medianSize, messages30 },
    msgSeries, topCircles, sizeBuckets, table,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// SYSTEM
// ────────────────────────────────────────────────────────────────────────────
export async function systemSection(supa: SupabaseClient) {
  const now = Date.now();
  const tables = ["chat_usage", "circle_messages", "dhikr_daily", "hifz_reviews", "circle_notifications", "circle_message_reports", "moderation_events"];
  const sizes: Record<string, number> = {};
  await Promise.all(tables.map(async (t) => { sizes[t] = await headCount(supa, t); }));

  let banner = { enabled: false, level: "info", message: "" };
  try {
    const { data } = await supa.from("app_config").select("value").eq("key", "banner").maybeSingle();
    const v = (data?.value ?? {}) as { enabled?: boolean; level?: string; message?: string };
    banner = { enabled: !!v.enabled, level: v.level ?? "info", message: v.message ?? "" };
  } catch { /* 022 unapplied */ }

  // supabase-js resolves (not rejects) on a PostgREST error, so inspect `error`
  // — a try/catch would report every table as present.
  const has = async (table: string) => { const { error } = await supa.from(table).select("*", { head: true, count: "exact" }).limit(1); return !error; };
  const migrations = {
    user_moderation: await has("user_moderation"),
    app_config: await has("app_config"),
    moderation_events: await has("moderation_events"),
  };

  return {
    generatedAt: new Date(now).toISOString(),
    banner,
    tableSizes: sizes,
    migrations,
    quotas: { anon: ANON_QUOTA, signedIn: SIGNED_QUOTA },
  };
}
