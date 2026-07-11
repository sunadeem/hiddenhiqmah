import { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin, adminJson, corsPreflight } from "@/lib/admin-auth";
import { fetchAll, listAllUsers, makeLabeler, DAY_MS, isoDaysAgo } from "@/lib/admin-data";

export async function OPTIONS() {
  return corsPreflight();
}

type ReportRow = {
  id: string;
  message_id: string;
  circle_id: string;
  reporter: string;
  reason: string | null;
  created_at: string;
  status?: string | null;
  resolved_at?: string | null;
  resolution_note?: string | null;
};
type MsgRow = { id: string; circle_id: string; user_id: string; body: string; created_at: string; deleted_at: string | null };
type ModRow = { user_id: string; strike_count: number | null; suspended: boolean | null; last_reason: string | null; last_strike_at: string | null; admin_note?: string | null };
type CircleRow = { id: string; name: string | null };

// Fetch reports (open-only unless `all`), paginated past the 1000-row cap, and
// tolerating a pre-023 schema (no status column → treat all as open).
async function fetchReports(supa: SupabaseClient, openOnly: boolean): Promise<ReportRow[]> {
  // Detect the pre-023 schema once.
  let legacy = false;
  const probe = await supa.from("circle_message_reports").select("status").limit(1);
  if (probe.error) legacy = true;
  const cols = legacy
    ? "id, message_id, circle_id, reporter, reason, created_at"
    : "id, message_id, circle_id, reporter, reason, created_at, status, resolved_at, resolution_note";

  const pageSize = 1000;
  const out: ReportRow[] = [];
  for (let from = 0; from < 200_000; from += pageSize) {
    let q = supa.from("circle_message_reports").select(cols).order("created_at", { ascending: false }).range(from, from + pageSize - 1);
    if (openOnly && !legacy) q = q.eq("status", "open");
    const { data, error } = await q;
    if (error) break;
    const rows = (data ?? []) as unknown as ReportRow[];
    out.push(...rows.map((r) => (legacy ? { ...r, status: "open" } : r)));
    if (rows.length < pageSize) break;
  }
  return out;
}

async function messagesById(supa: SupabaseClient, ids: string[]): Promise<Map<string, MsgRow>> {
  const map = new Map<string, MsgRow>();
  if (!ids.length) return map;
  const { data } = await supa
    .from("circle_messages")
    .select("id, circle_id, user_id, body, created_at, deleted_at")
    .in("id", Array.from(new Set(ids)));
  for (const m of (data ?? []) as MsgRow[]) map.set(m.id, m);
  return map;
}

async function circleNames(supa: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!ids.length) return map;
  const { data } = await supa.from("circles").select("id, name").in("id", Array.from(new Set(ids)));
  for (const c of (data ?? []) as CircleRow[]) map.set(c.id, c.name || "Circle");
  return map;
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;
  const supa = auth.supa;
  const view = String(auth.body.view ?? "queue");

  try {
    const users = await listAllUsers(supa);
    const emailById = new Map<string, string | null>();
    const nameById = new Map<string, string | null>();
    for (const u of users) {
      emailById.set(u.id, u.email);
      const nm = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
      if (nm) nameById.set(u.id, nm);
    }
    const profiles = await fetchAll<{ id: string; display_name: string | null }>(supa, "profiles", "id, display_name");
    for (const p of profiles) if (p.display_name) nameById.set(p.id, p.display_name);
    const label = makeLabeler(nameById, emailById);

    // ── QUEUE ──────────────────────────────────────────────────────────
    if (view === "queue") {
      let modRows: ModRow[] = [];
      try { modRows = await fetchAll<ModRow>(supa, "user_moderation", "user_id, strike_count, suspended, last_reason, last_strike_at, admin_note"); }
      catch { try { modRows = await fetchAll<ModRow>(supa, "user_moderation", "user_id, strike_count, suspended, last_reason, last_strike_at"); } catch { modRows = []; } }

      const openReports = await fetchReports(supa, true);
      const msgMap = await messagesById(supa, openReports.map((r) => r.message_id));
      const circleMap = await circleNames(supa, openReports.map((r) => r.circle_id));

      // Reports grouped by the reported message's AUTHOR.
      const byAuthor = new Map<string, { count: number; latest: string }>();
      for (const r of openReports) {
        const author = msgMap.get(r.message_id)?.user_id;
        if (!author) continue;
        const cur = byAuthor.get(author) ?? { count: 0, latest: r.created_at };
        cur.count++;
        if (r.created_at > cur.latest) cur.latest = r.created_at;
        byAuthor.set(author, cur);
      }

      // Merge moderation + reported users into one queue.
      const ids = new Set<string>();
      for (const m of modRows) if ((m.strike_count ?? 0) > 0 || m.suspended) ids.add(m.user_id);
      for (const a of byAuthor.keys()) ids.add(a);
      const modByUser = new Map(modRows.map((m) => [m.user_id, m]));
      const queue = [...ids].map((uid) => {
        const m = modByUser.get(uid);
        const rep = byAuthor.get(uid);
        const suspended = !!m?.suspended;
        const strikes = m?.strike_count ?? 0;
        const state = suspended ? "suspended" : strikes > 0 ? "struck" : "reported";
        return { userId: uid, label: label(uid), email: emailById.get(uid) ?? null, state, strikes, suspended, lastReason: m?.last_reason ?? null, lastStrikeAt: m?.last_strike_at ?? null, openReports: rep?.count ?? 0, latestReportAt: rep?.latest ?? null };
      }).sort((a, b) => Number(b.suspended) - Number(a.suspended) || b.openReports - a.openReports || b.strikes - a.strikes);

      // Raw open-reports feed (with message bodies) for report-storm triage.
      const feed = openReports.slice(0, 100).map((r) => {
        const msg = msgMap.get(r.message_id);
        return {
          id: r.id, reason: r.reason, createdAt: r.created_at,
          circle: circleMap.get(r.circle_id) ?? "Circle",
          reporter: label(r.reporter),
          author: msg ? label(msg.user_id) : "—", authorId: msg?.user_id ?? null,
          body: msg?.body ?? "(message not found)", deleted: !!msg?.deleted_at,
          messageId: r.message_id,
        };
      });

      // KPIs.
      let struck = 0;
      for (const m of modRows) if ((m.strike_count ?? 0) > 0 && !m.suspended) struck++;
      const suspendedCount = modRows.filter((m) => m.suspended).length;
      const reports7d = openReports.filter((r) => Date.parse(r.created_at) >= Date.now() - 7 * DAY_MS).length;
      let strikes7d = 0;
      try {
        const { count } = await supa.from("moderation_events").select("*", { count: "exact", head: true }).eq("kind", "strike").gte("created_at", isoDaysAgo(7));
        strikes7d = count ?? 0;
      } catch { strikes7d = 0; }

      return adminJson({ generatedAt: new Date().toISOString(), kpis: { openReports: openReports.length, suspended: suspendedCount, struck, reports7d, strikes7d }, queue, feed });
    }

    // ── USER CASE FILE ─────────────────────────────────────────────────
    if (view === "user") {
      const userId = String(auth.body.userId ?? "");
      if (!userId) return adminJson({ error: "userId required" }, 400);

      let mod: ModRow | null = null;
      try {
        const { data } = await supa.from("user_moderation").select("user_id, strike_count, suspended, last_reason, last_strike_at, admin_note").eq("user_id", userId).maybeSingle();
        mod = (data as ModRow) ?? null;
      } catch {
        try { const { data } = await supa.from("user_moderation").select("user_id, strike_count, suspended, last_reason, last_strike_at").eq("user_id", userId).maybeSingle(); mod = (data as ModRow) ?? null; } catch { mod = null; }
      }

      // Their recent messages (incl. deleted).
      const { data: msgData } = await supa
        .from("circle_messages")
        .select("id, circle_id, user_id, body, created_at, deleted_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      const recentMessages = (msgData ?? []) as MsgRow[];
      const cMap = await circleNames(supa, recentMessages.map((m) => m.circle_id));

      // Reports against this user's messages (any status).
      const allReports = await fetchReports(supa, false);
      const myMsgIds = new Set(recentMessages.map((m) => m.id));
      // Also pull message bodies for reported messages not in the recent-50.
      const reportedMsgIds = allReports.map((r) => r.message_id);
      const reportedMsgMap = await messagesById(supa, reportedMsgIds);
      const reports = allReports
        .filter((r) => {
          const author = reportedMsgMap.get(r.message_id)?.user_id;
          return author === userId || myMsgIds.has(r.message_id);
        })
        .map((r) => {
          const m = reportedMsgMap.get(r.message_id);
          return { id: r.id, reason: r.reason, status: r.status ?? "open", createdAt: r.created_at, resolvedAt: r.resolved_at ?? null, reporter: label(r.reporter), messageId: r.message_id, body: m?.body ?? "(message not found)", deleted: !!m?.deleted_at, circle: cMap.get(r.circle_id) ?? "Circle" };
        });

      // History timeline (moderation_events, tolerant).
      let history: { kind: string; meta: Record<string, unknown>; at: string }[] = [];
      try {
        const { data } = await supa.from("moderation_events").select("kind, meta, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
        history = ((data ?? []) as { kind: string; meta: Record<string, unknown>; created_at: string }[]).map((e) => ({ kind: e.kind, meta: e.meta ?? {}, at: e.created_at }));
      } catch { history = []; }

      // Blocked-by count.
      let blockedBy = 0;
      try { const { count } = await supa.from("circle_user_blocks").select("*", { count: "exact", head: true }).eq("blocked", userId); blockedBy = count ?? 0; } catch { blockedBy = 0; }

      // Circles they're in.
      const { data: memData } = await supa.from("circle_members").select("circle_id, role").eq("user_id", userId);
      const memCircleIds = ((memData ?? []) as { circle_id: string; role: string | null }[]).map((m) => m.circle_id);
      const memNames = await circleNames(supa, memCircleIds);
      const circles = ((memData ?? []) as { circle_id: string; role: string | null }[]).map((m) => ({ name: memNames.get(m.circle_id) ?? "Circle", role: m.role ?? "member" }));

      const u = users.find((x) => x.id === userId);
      return adminJson({
        generatedAt: new Date().toISOString(),
        user: { id: userId, label: label(userId), email: emailById.get(userId) ?? null, joinedAt: u?.created_at ?? null, lastSignInAt: u?.last_sign_in_at ?? null },
        moderation: { strikes: mod?.strike_count ?? 0, suspended: !!mod?.suspended, lastReason: mod?.last_reason ?? null, lastStrikeAt: mod?.last_strike_at ?? null, note: mod?.admin_note ?? "" },
        blockedBy,
        circles,
        reports,
        recentMessages: recentMessages.map((m) => ({ id: m.id, body: m.body, at: m.created_at, deleted: !!m.deleted_at, circle: cMap.get(m.circle_id) ?? "Circle" })),
        history,
      });
    }

    return adminJson({ error: "Unknown view" }, 400);
  } catch (e) {
    console.error("[Admin moderation] error:", e);
    return adminJson({ error: e instanceof Error ? e.message : "Failed" }, 500);
  }
}
