import { NextRequest, NextResponse } from "next/server";
import { tryGetSupabaseServer } from "@/lib/supabase-server";
import {
  sendToMany,
  isApnsConfigured,
  type ApnsTarget,
  type PushEnvironment,
} from "@/lib/push/apns";
import { pickDailyContent } from "@/lib/dailyContent";
import { dailyIndex } from "@hidden-hiqmah/ui/lib/reminders";

export const runtime = "nodejs";

// Cron-invoked. Accepts the contract's `x-cron-secret` header, and also the
// `Authorization: Bearer <secret>` form Vercel Cron sends automatically.
function cronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get("x-cron-secret") === secret) return true;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return false;
}

/** UTC calendar date (YYYY-MM-DD) — the deterministic key for daily rotation. */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

type TokenRow = { token: string; platform: string; environment: string };

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

  // Rotate ayah -> hadith -> dua across days (deterministic, days since 2020-01-01).
  const dateStr = todayStr();
  const content = pickDailyContent(dateStr);
  const rotation = [content.ayah, content.hadith, content.dua] as const;
  const kinds = ["ayah", "hadith", "dua"] as const;
  const idx = dailyIndex(dateStr, rotation.length);
  const item = rotation[idx];

  const { data, error } = await supa
    .from("device_tokens")
    .select("token, platform, environment");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const targets: ApnsTarget[] = ((data ?? []) as TokenRow[])
    .filter((r) => r.platform === "ios")
    .map((r) => ({ token: r.token, environment: r.environment as PushEnvironment }));

  if (!targets.length) {
    return NextResponse.json({ ok: true, kind: kinds[idx], sent: 0, failed: 0, removed: 0 });
  }

  const result = await sendToMany(targets, {
    title: item.title,
    body: item.reference ? `${item.english} — ${item.reference}` : item.english,
    url: item.url,
    data: { audience: "daily" },
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
    kind: kinds[idx],
    sent: result.sent,
    failed: result.failed,
    corrected: result.corrected.length,
    removed: result.staleTokens.length,
  });
}

// POST-only: a GET route handler can't live in the mobile output:export build
// (Next static-analyzes GET handlers; POST/OPTIONS pass through inert, like
// /api/search). Scheduled via Supabase pg_cron (net.http_post) — see migration
// 026 — and triggerable manually with a POST + x-cron-secret header.
export async function POST(req: NextRequest) {
  return handle(req);
}
