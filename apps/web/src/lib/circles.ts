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
  const { data, error } = await supabase.rpc("generate_circle_invite", { p_circle: circleId });
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
