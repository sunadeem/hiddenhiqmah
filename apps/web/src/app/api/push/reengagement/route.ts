import { NextRequest, NextResponse } from "next/server";
import { tryGetSupabaseServer } from "@/lib/supabase-server";
import {
  sendToMany,
  isApnsConfigured,
  type ApnsTarget,
  type PushEnvironment,
} from "@/lib/push/apns";
import { fetchOptedOut } from "@/lib/push/optedOut";

export const runtime = "nodejs";

const INACTIVE_DAYS = 3;

// Cron-invoked. Accepts the contract's `x-cron-secret` header, and also the
// `Authorization: Bearer <secret>` form Vercel Cron sends automatically.
function cronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get("x-cron-secret") === secret) return true;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return false;
}

type TokenRow = { token: string; platform: string; environment: string; user_id: string };

async function handle(req: NextRequest) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isApnsConfigured()) {
    return NextResponse.json({ error: "Push is not configured on the server." }, { status: 500 });
  }
  const supa = tryGetSupabaseServer();
  if (!supa) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 });
  }

  // Skip anyone who turned this nudge off. Negative + paged — see fetchOptedOut
  // for why (unknown preference ⇒ still subscribed; PostgREST's 1000-row cap
  // would otherwise silently re-subscribe everyone past the first page).
  const optedOut = await fetchOptedOut(supa, "reengagement_push");
  if (!optedOut) {
    return NextResponse.json({ error: "Failed to read push preferences." }, { status: 500 });
  }

  // Target devices we haven't seen in over INACTIVE_DAYS days.
  const cutoff = new Date(Date.now() - INACTIVE_DAYS * 86_400_000).toISOString();
  const { data, error } = await supa
    .from("device_tokens")
    .select("token, platform, environment, user_id")
    .lt("last_seen_at", cutoff);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const targets: ApnsTarget[] = ((data ?? []) as TokenRow[])
    .filter((r) => r.platform === "ios" && !optedOut.has(r.user_id))
    .map((r) => ({ token: r.token, environment: r.environment as PushEnvironment }));

  if (!targets.length) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, removed: 0 });
  }

  const result = await sendToMany(targets, {
    title: "We've missed you",
    body: "Come back for today's verse, hadith, and du'a — a moment of reflection awaits.",
    url: "/",
    data: { audience: "reengagement" },
    // One nudge per device per run, even with a stale second token / double fire.
    collapseId: `reengage-${new Date().toISOString().slice(0, 10)}`,
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
    optedOut: optedOut.size,
  });
}

// POST-only (see daily/route.ts). Scheduled via Supabase pg_cron; triggerable
// manually with a POST + x-cron-secret header.
export async function POST(req: NextRequest) {
  return handle(req);
}
