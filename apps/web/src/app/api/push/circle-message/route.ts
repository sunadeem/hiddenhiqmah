import { NextRequest, NextResponse } from "next/server";
import { tryGetSupabaseServer } from "@/lib/supabase-server";
import { friendlyName } from "@/lib/friendly-name";
import {
  sendToMany,
  isApnsConfigured,
  type ApnsTarget,
  type PushEnvironment,
} from "@/lib/push/apns";

export const runtime = "nodejs";

// CORS (harmless for the server-to-server pg_net caller; present so OPTIONS is a
// clean preflight and this route never needs a GET handler — which the mobile
// output:export build forbids).
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-cron-secret",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// Invoked by the circle_messages after-insert trigger (migration 027) via
// pg_net, carrying the shared CRON_SECRET in x-cron-secret.
function cronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("x-cron-secret") === secret;
}

type MessageBody = {
  message_id?: string;
  circle_id?: string;
  sender_id?: string;
  body?: string;
};

type TokenRow = { token: string; platform: string; environment: string };

// Keep the push preview short — a full 2000-char message would be truncated by
// APNs anyway, and a tidy preview reads better on the lock screen.
const PREVIEW_MAX = 140;

async function handle(req: NextRequest) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: MessageBody;
  try {
    payload = (await req.json()) as MessageBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const circleId = (payload.circle_id ?? "").trim();
  const senderId = (payload.sender_id ?? "").trim();
  const messageBody = (payload.body ?? "").trim();
  if (!circleId || !senderId) {
    return NextResponse.json({ error: "circle_id and sender_id are required" }, { status: 400 });
  }

  if (!isApnsConfigured()) {
    return NextResponse.json({ error: "Push is not configured on the server." }, { status: 500 });
  }
  const supa = tryGetSupabaseServer();
  if (!supa) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 });
  }

  // Circle name (title) + sender's display name (title) — best effort.
  const [{ data: circleRow }, { data: senderRow }] = await Promise.all([
    supa.from("circles").select("name").eq("id", circleId).maybeSingle(),
    supa.from("profiles").select("display_name").eq("id", senderId).maybeSingle(),
  ]);
  const circleName = ((circleRow as { name?: string } | null)?.name ?? "your circle").trim() || "your circle";
  // Friendly first name — magic-link/OTP signups have no name metadata, so
  // display_name is the email local part ("subhan.s.nadeem"). Clean it the same
  // way the in-app activity feed does, so the lock-screen push reads "Subhan in
  // Family", not a username. (A real name like "Subhan Nadeem" renders "Subhan".)
  const senderName = friendlyName(
    (senderRow as { display_name?: string } | null)?.display_name,
    "Someone"
  );

  // Recipients = every OTHER member of the circle who has opted in (circle_push).
  const { data: memberRows, error: memberErr } = await supa
    .from("circle_members")
    .select("user_id")
    .eq("circle_id", circleId)
    .neq("user_id", senderId);
  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }
  const memberIds = ((memberRows ?? []) as { user_id: string }[]).map((r) => r.user_id);
  if (!memberIds.length) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, recipients: 0 });
  }

  const { data: optedRows, error: optedErr } = await supa
    .from("profiles")
    .select("id")
    .in("id", memberIds)
    .eq("circle_push", true);
  if (optedErr) {
    return NextResponse.json({ error: optedErr.message }, { status: 500 });
  }
  const optedInIds = ((optedRows ?? []) as { id: string }[]).map((r) => r.id);
  if (!optedInIds.length) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, recipients: 0 });
  }

  const { data: tokenRows, error: tokenErr } = await supa
    .from("device_tokens")
    .select("token, platform, environment")
    .in("user_id", optedInIds);
  if (tokenErr) {
    return NextResponse.json({ error: tokenErr.message }, { status: 500 });
  }
  const targets: ApnsTarget[] = ((tokenRows ?? []) as TokenRow[])
    .filter((r) => r.platform === "ios")
    .map((r) => ({ token: r.token, environment: r.environment as PushEnvironment }));
  if (!targets.length) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, recipients: optedInIds.length });
  }

  const preview =
    messageBody.length > PREVIEW_MAX ? messageBody.slice(0, PREVIEW_MAX).trimEnd() + "…" : messageBody;

  const result = await sendToMany(targets, {
    title: `${senderName} in ${circleName}`,
    body: preview || "New message",
    // Tapping routes here (push.ts → router.push(url)); CirclesScreen reads
    // ?chat=<id> and opens that circle's chat.
    url: `/circles?chat=${encodeURIComponent(circleId)}`,
    data: { audience: "circle", circleId },
  });

  await Promise.all(
    result.corrected.map((c) =>
      supa.from("device_tokens").update({ environment: c.environment }).eq("token", c.token)
    )
  );
  if (result.staleTokens.length) {
    await supa.from("device_tokens").delete().in("token", result.staleTokens);
  }

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    failed: result.failed,
    corrected: result.corrected.length,
    removed: result.staleTokens.length,
    recipients: optedInIds.length,
  });
}

// POST-only (a GET route handler can't live in the mobile output:export build,
// see /api/push/daily). Invoked by the circle_messages trigger via pg_net with
// an x-cron-secret header; no browser calls this.
export async function POST(req: NextRequest) {
  return handle(req);
}
