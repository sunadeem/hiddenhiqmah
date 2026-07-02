import { supabase } from "@/lib/supabase";

// Client data layer for Circles (migration 007). All writes go through the
// SECURITY DEFINER RPCs; reads are RLS-scoped to the caller's circles.

export type Circle = {
  id: string;
  name: string;
  owner_id: string;
  goal_type: string;
  goal_unit: string;
  goal_target: number;
  created_at: string;
};

export type CircleMember = {
  user_id: string;
  role: "owner" | "member";
  display_name: string;
  avatar: string | null;
  value: number;
  isMe: boolean;
};

export type CircleDetail = {
  circle: Circle;
  members: CircleMember[];
  total: number;
  myValue: number;
  myId: string | null;
};

export async function getMyCircles(): Promise<Circle[]> {
  const { data, error } = await supabase
    .from("circles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Circle[];
}

export async function getCircleDetail(circleId: string): Promise<CircleDetail> {
  const [{ data: circleRows, error: cErr }, { data: memberRows }, { data: progressRows }, { data: auth }] =
    await Promise.all([
      supabase.from("circles").select("*").eq("id", circleId).limit(1),
      supabase.from("circle_members").select("user_id, role").eq("circle_id", circleId),
      supabase.from("circle_member_progress").select("user_id, value").eq("circle_id", circleId),
      supabase.auth.getUser(),
    ]);
  if (cErr) throw cErr;
  const circle = (circleRows ?? [])[0] as Circle;
  const myId = auth?.user?.id ?? null;

  const members = (memberRows ?? []) as { user_id: string; role: "owner" | "member" }[];
  const ids = members.map((m) => m.user_id);

  const profById = new Map<string, { display_name: string; avatar: string | null }>();
  if (ids.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, display_name, avatar")
      .in("id", ids);
    for (const p of profs ?? []) profById.set(p.id, { display_name: p.display_name, avatar: p.avatar });
  }
  const progById = new Map<string, number>();
  for (const p of (progressRows ?? []) as { user_id: string; value: number }[]) {
    progById.set(p.user_id, p.value);
  }

  const merged: CircleMember[] = members.map((m) => ({
    user_id: m.user_id,
    role: m.role,
    display_name: profById.get(m.user_id)?.display_name ?? "Member",
    avatar: profById.get(m.user_id)?.avatar ?? null,
    value: progById.get(m.user_id) ?? 0,
    isMe: m.user_id === myId,
  }));
  // Owner first, then "you", then the rest by contribution.
  merged.sort((a, b) => {
    if (a.role !== b.role) return a.role === "owner" ? -1 : 1;
    if (a.isMe !== b.isMe) return a.isMe ? -1 : 1;
    return b.value - a.value;
  });

  const total = merged.reduce((s, m) => s + m.value, 0);
  const myValue = myId ? progById.get(myId) ?? 0 : 0;
  return { circle, members: merged, total, myValue, myId };
}

export async function getMyCirclesWithDetail(): Promise<CircleDetail[]> {
  const circles = await getMyCircles();
  return Promise.all(circles.map((c) => getCircleDetail(c.id)));
}

export async function createCircle(
  name: string,
  goalTarget = 30,
  goalType = "khatmah",
  goalUnit = "juz"
): Promise<string> {
  const { data, error } = await supabase.rpc("create_circle", {
    p_name: name,
    p_goal_type: goalType,
    p_goal_unit: goalUnit,
    p_goal_target: goalTarget,
  });
  if (error) throw error;
  return data as string;
}

export async function joinCircle(code: string): Promise<string> {
  const { data, error } = await supabase.rpc("join_circle_by_code", { p_code: code });
  if (error) throw error;
  return data as string;
}

export async function generateInvite(circleId: string): Promise<string> {
  // Pass p_ttl_hours explicitly — PostgREST can fail to resolve a function call
  // (PGRST202) when a defaulted arg is omitted.
  const { data, error } = await supabase.rpc("generate_circle_invite", {
    p_circle: circleId,
    p_ttl_hours: 168,
  });
  if (error) throw error;
  return data as string;
}

export async function setMyProgress(circleId: string, value: number): Promise<void> {
  const { error } = await supabase.rpc("set_my_circle_progress", {
    p_circle: circleId,
    p_value: Math.max(0, Math.round(value)),
  });
  if (error) throw error;
}

export async function sendDua(circleId: string, toUser: string): Promise<void> {
  const { error } = await supabase.rpc("send_circle_dua", { p_circle: circleId, p_to_user: toUser });
  if (error) throw error;
}

export async function leaveCircle(circleId: string): Promise<void> {
  const { error } = await supabase.rpc("leave_circle", { p_circle: circleId });
  if (error) throw error;
}

// ── Enhancements (migration 013): chat, activity feed, moderation, notifs ──
// All writes go through SECURITY DEFINER RPCs; reads are RLS-scoped. Until 013
// is applied these calls fail — callers should degrade to empty/error states.

export type CircleMessage = {
  id: string;
  circle_id: string;
  user_id: string;
  body: string;
  created_at: string;
  deleted_at: string | null;
  sender_name: string;
  sender_avatar: string | null;
  isMine: boolean;
};

export type CircleActivity = {
  id: string;
  circle_id: string;
  actor_id: string | null;
  kind:
    | "joined"
    | "left"
    | "progress"
    | "goal_reached"
    | "message"
    | "dua"
    | "renamed"
    | "goal_updated"
    | "removed";
  meta: Record<string, unknown>;
  created_at: string;
  actor_name: string;
};

export type CircleNotification = {
  id: string;
  user_id: string;
  circle_id: string | null;
  actor_id: string | null;
  kind: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

async function resolveNames(ids: string[]): Promise<Map<string, { display_name: string; avatar: string | null }>> {
  const map = new Map<string, { display_name: string; avatar: string | null }>();
  const uniq = Array.from(new Set(ids)).filter(Boolean);
  if (!uniq.length) return map;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar")
    .in("id", uniq);
  for (const p of data ?? []) map.set(p.id, { display_name: p.display_name, avatar: p.avatar });
  return map;
}

export async function getCircleMessages(circleId: string, limit = 200): Promise<CircleMessage[]> {
  const [{ data, error }, { data: auth }] = await Promise.all([
    // Fetch the most recent `limit`, then flip to chronological for display.
    supabase
      .from("circle_messages")
      .select("id, circle_id, user_id, body, created_at, deleted_at")
      .eq("circle_id", circleId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase.auth.getUser(),
  ]);
  if (error) throw error;
  const rows = ((data ?? []) as Omit<CircleMessage, "sender_name" | "sender_avatar" | "isMine">[]).reverse();
  const myId = auth?.user?.id ?? null;
  const names = await resolveNames(rows.map((r) => r.user_id));
  return rows.map((r) => ({
    ...r,
    sender_name: names.get(r.user_id)?.display_name ?? "Member",
    sender_avatar: names.get(r.user_id)?.avatar ?? null,
    isMine: r.user_id === myId,
  }));
}

export async function sendCircleMessage(circleId: string, body: string): Promise<void> {
  const { error } = await supabase.rpc("send_circle_message", {
    p_circle: circleId,
    p_body: body,
  });
  if (error) throw error;
}

export async function deleteCircleMessage(messageId: string): Promise<void> {
  const { error } = await supabase.rpc("delete_circle_message", { p_message: messageId });
  if (error) throw error;
}

/**
 * Subscribe to live changes on a circle's messages via Supabase Realtime.
 * `onChange` fires on any insert/update/delete; callers should refetch to pick
 * up sender names + soft-deletes consistently. Returns an unsubscribe fn.
 */
export function subscribeCircleMessages(circleId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel("circle:" + circleId)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "circle_messages", filter: "circle_id=eq." + circleId },
      () => onChange()
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function getCircleActivity(circleId: string, limit = 100): Promise<CircleActivity[]> {
  const { data, error } = await supabase
    .from("circle_activity")
    .select("id, circle_id, actor_id, kind, meta, created_at")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = (data ?? []) as Omit<CircleActivity, "actor_name">[];
  const names = await resolveNames(rows.map((r) => r.actor_id ?? "").filter(Boolean));
  return rows.map((r) => ({
    ...r,
    meta: (r.meta ?? {}) as Record<string, unknown>,
    actor_name: (r.actor_id && names.get(r.actor_id)?.display_name) || "Someone",
  }));
}

export async function renameCircle(circleId: string, name: string): Promise<void> {
  const { error } = await supabase.rpc("rename_circle", { p_circle: circleId, p_name: name });
  if (error) throw error;
}

export async function updateCircleGoal(
  circleId: string,
  goalType: string,
  goalUnit: string,
  goalTarget: number
): Promise<void> {
  const { error } = await supabase.rpc("update_circle_goal", {
    p_circle: circleId,
    p_goal_type: goalType,
    p_goal_unit: goalUnit,
    p_goal_target: Math.max(1, Math.round(goalTarget)),
  });
  if (error) throw error;
}

export async function removeCircleMember(circleId: string, userId: string): Promise<void> {
  const { error } = await supabase.rpc("remove_circle_member", {
    p_circle: circleId,
    p_user: userId,
  });
  if (error) throw error;
}

export async function getMyNotifications(limit = 50): Promise<CircleNotification[]> {
  const { data, error } = await supabase
    .from("circle_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as CircleNotification[];
}

export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from("circle_notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);
  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationsRead(ids?: string[]): Promise<void> {
  // Pass p_ids explicitly (null = mark all) — PostgREST can fail to resolve a
  // defaulted-arg call (PGRST202), same caveat as generate_circle_invite.
  const { error } = await supabase.rpc("mark_circle_notifications_read", {
    p_ids: ids && ids.length ? ids : null,
  });
  if (error) throw error;
}

/** Short relative timestamp ("now", "3m", "2h", "4d", or a date). */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 45) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h";
  const d = Math.floor(h / 24);
  if (d < 7) return d + "d";
  return new Date(then).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
