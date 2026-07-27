/**
 * WEEKLY DUʿĀ push (cron 'push-weekly-dua', Wednesdays 14:00 UTC — migration 030).
 *
 * The path stays /api/push/daily for continuity (the cron, docs and manual smoke
 * tests all point at it), but this is no longer a daily send and no longer
 * rotates ayah → hadith → duʿā: the on-device scheduler already delivers a verse,
 * a hadith and a reminder every day, so remote only adds the duʿā. Recipients are
 * filtered by profiles.dua_push (opt-out, default true).
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetSupabaseServer } from "@/lib/supabase-server";
import {
  sendToMany,
  isApnsConfigured,
  type ApnsTarget,
  type PushEnvironment,
} from "@/lib/push/apns";
import { pickDailyContent } from "@/lib/dailyContent";
import { fetchOptedOut } from "@/lib/push/optedOut";

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

/** UTC calendar date (YYYY-MM-DD) — the deterministic key for content selection. */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
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

  // The duʿā ONLY. The on-device scheduler already sends Today's Verse (8am) and
  // Today's Hadith (1:30pm) EVERY day, so the old ayah/hadith/dua rotation just
  // re-sent local content two days in three; the duʿā is the one thing remote
  // adds. Still keyed to the calendar date, so the duʿā moves week to week.
  const dateStr = todayStr();
  const item = pickDailyContent(dateStr).dua;

  // Recipients = every iOS device whose owner has NOT opted out. We fetch the
  // opt-OUTs and subtract, rather than fetching the opt-INs the way
  // circle-message does: circle_push is opt-IN (default false) so a positive
  // filter is right there, but dua_push is opt-OUT (not null, default true).
  // A positive `.in(user_id, optedIn)` filter would silently drop any token
  // whose owner has no profiles row at all (e.g. a signup whose handle_new_user
  // insert never landed) — an unknown preference should mean the column default,
  // i.e. still opted in, not "never push to this person again".
  // PAGED: PostgREST caps a response at db-max-rows (1000 by default) and the
  // service-role key does NOT exempt it — a truncated page comes back with
  // error:null, so past 1000 opt-outs we'd silently start pushing to people who
  // turned it off. This query is the one that must never under-fetch.
  const optedOut = await fetchOptedOut(supa, "dua_push");
  if (!optedOut) {
    return NextResponse.json({ error: "Failed to read push preferences." }, { status: 500 });
  }

  const { data, error } = await supa
    .from("device_tokens")
    .select("token, platform, environment, user_id");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const targets: ApnsTarget[] = ((data ?? []) as TokenRow[])
    .filter((r) => r.platform === "ios" && !optedOut.has(r.user_id))
    .map((r) => ({ token: r.token, environment: r.environment as PushEnvironment }));

  if (!targets.length) {
    return NextResponse.json({ ok: true, kind: "dua", sent: 0, failed: 0, removed: 0 });
  }

  const result = await sendToMany(targets, {
    title: item.title,
    body: item.reference ? `${item.english} — ${item.reference}` : item.english,
    url: item.url,
    // "daily" is the historical tag for this scheduled content push (kept, like
    // the route path, so nothing downstream has to change) — it now runs weekly.
    data: { audience: "daily" },
    // One push per device per send, even if the device has a stale second token
    // or the cron double-fires — iOS collapses same-id notifications. Keyed by
    // send date, which is unique per weekly run.
    collapseId: `daily-${dateStr}`,
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
    kind: "dua",
    sent: result.sent,
    failed: result.failed,
    corrected: result.corrected.length,
    removed: result.staleTokens.length,
    optedOut: optedOut.size,
  });
}

// POST-only: a GET route handler can't live in the mobile output:export build
// (Next static-analyzes GET handlers; POST/OPTIONS pass through inert, like
// /api/search). Scheduled via Supabase pg_cron → push_post() — see migrations
// 026/029 — and triggerable manually with a POST + x-cron-secret header.
export async function POST(req: NextRequest) {
  return handle(req);
}
