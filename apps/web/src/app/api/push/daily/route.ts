/**
 * WEEKLY DUʿĀ push — delivered at ~10:00 on Wednesday IN EACH DEVICE'S OWN LOCAL
 * TIME (cron 'push-dua-hourly', '0 * * * *' — migration 031).
 *
 * The path stays /api/push/daily for continuity (the cron, docs and manual smoke
 * tests all point at it), but this is no longer a daily send and no longer
 * rotates ayah → hadith → duʿā: the on-device scheduler already delivers a verse,
 * a hadith and a reminder every day, so remote only adds the duʿā. Recipients are
 * filtered by profiles.dua_push (opt-out, default true).
 *
 * WHAT CHANGED IN 031: the cron used to be '0 14 * * 3' and this route sent to
 * everyone it found. 14:00 UTC is mid-morning in the Americas but afternoon in
 * Europe and night in South-East Asia, and it slid an hour at every DST change.
 * Now the CRON only ticks hourly and THIS ROUTE decides, per device, whether it
 * is currently Wednesday 10:00 where that device is. Two invariants make that
 * safe to run 168× a week instead of once:
 *
 *   1. device_tokens.timezone holds an IANA NAME, never a UTC offset, and the
 *      comparison re-derives the offset from `now` on every run — so a zone is
 *      correct on both sides of a DST transition without any migration.
 *   2. device_tokens.last_dua_push_at dedupes. A DST transition can repeat a
 *      local hour (02:00→01:00 in the autumn can make 10:00 happen twice in some
 *      zones' shift schemes), and a device that changes zone mid-Wednesday could
 *      otherwise match twice. We skip anything sent in the last ~5 days (the
 *      window is derived in DEDUPE_MS) and stamp only on APNs success. A failed
 *      send is retried on the next tick because the eligibility window spans
 *      RETRY_HOURS beyond the target hour, not just the target hour itself.
 */
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
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

/** Local weekday/hour we aim for. 3 = Wednesday (same numbering as pg_cron and
 *  Date#getUTCDay: 0 = Sunday). */
const TARGET_WEEKDAY = 3;
const TARGET_LOCAL_HOUR = 10;
// Extra hourly ticks after the target hour during which a device is still
// eligible. This is what makes "a failed send is retried" true: only a
// SUCCESSFUL send stamps last_dua_push_at, so an APNs failure at the target
// hour is picked up on the next tick instead of waiting a week. Kept small so
// the push still reads as "Wednesday morning" wherever it lands.
const RETRY_HOURS = 2;
/** Where a device has NO timezone on file, we keep the pre-031 behaviour exactly:
 *  fire at 14:00 UTC on Wednesday. See LEGACY note in pickDueTokens. */
const LEGACY_UTC_HOUR = 14;
/**
 * Don't send twice inside this window. The bounds are derivable, so pick a value
 * provably inside them rather than "about a week":
 *
 *   LOWER — the longest SPURIOUS repeat. Two Wednesday-10:00 matches inside one
 *     Wednesday can only happen if the device's zone moves under it (travel, or a
 *     DST boundary that replays the hour). Zones span UTC-12…UTC+14, so the most
 *     the local clock can be dragged backwards is 26h. Window must exceed 26h.
 *   UPPER — the shortest LEGITIMATE gap between consecutive weekly sends, which
 *     is 7 days minus that same 26h of zone movement = 5d 22h. Window must stay
 *     under that, or a user who flies east loses a week's duʿā entirely.
 *
 * Five days sits in the middle of (26h, 5d22h) with ~4 days of margin below and
 * ~22h above. Seven days breaks the upper bound outright; even six days overshoots
 * it by 2h, which silently costs a week to anyone making a >24h eastward jump
 * (Samoa → Kiritimati). Do not raise this without redoing the arithmetic.
 */
const DEDUPE_MS = 5 * 86_400_000;
/** PostgREST caps a response at db-max-rows (1000 by default) and the service
 *  role does NOT exempt it, so device_tokens must be read a page at a time —
 *  see fetchOptedOut for the same reasoning. It matters more here than it used
 *  to: stamping last_dua_push_at rewrites rows, which reshuffles an unordered
 *  scan, so an unpaged read would serve a different arbitrary 1000 devices each
 *  hour and some devices would never come up. Hence the explicit .order(). */
const PAGE = 1000;
/** Cap on tokens per `.in(...)` filter, which lands in the query string. */
const IN_CHUNK = 200;

// Cron-invoked. Accepts the contract's `x-cron-secret` header, and also the
// `Authorization: Bearer <secret>` form Vercel Cron sends automatically.
function cronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get("x-cron-secret") === secret) return true;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return false;
}

type TokenRow = {
  token: string;
  platform: string;
  environment: string;
  user_id: string;
  timezone?: string | null;
  last_dua_push_at?: string | null;
};

/** What the wall clock reads in some zone right now. */
type LocalClock = { weekday: number; hour: number; date: string };

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// One formatter per zone, reused across devices in the same zone (and across
// invocations — the module is warm between cron ticks). Caching the FORMATTER is
// safe; caching a computed offset would not be. A DateTimeFormat bound to an
// IANA zone recomputes the offset for whatever instant you hand it, which is
// precisely why we must never store or derive a fixed offset.
const formatterCache = new Map<string, Intl.DateTimeFormat | null>();

function formatterFor(timeZone: string): Intl.DateTimeFormat | null {
  const cached = formatterCache.get(timeZone);
  if (cached !== undefined) return cached;
  let fmt: Intl.DateTimeFormat | null = null;
  try {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      // h23 (not hour12:false): en-US with hour12:false can render midnight as
      // "24" on some ICU builds, which would make hour 0 unmatchable.
      hourCycle: "h23",
    });
  } catch {
    fmt = null; // unknown/garbage zone → caller falls back to the legacy path
  }
  formatterCache.set(timeZone, fmt);
  return fmt;
}

/** `now` as seen in `timeZone`. Null if the zone name isn't one ICU knows. */
function localClock(now: Date, timeZone: string): LocalClock | null {
  const fmt = formatterFor(timeZone);
  if (!fmt) return null;
  const parts = fmt.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value;
  const weekday = WEEKDAY_INDEX[get("weekday") ?? ""];
  const hour = Number(get("hour"));
  const year = get("year");
  const month = get("month");
  const day = get("day");
  if (weekday === undefined || !Number.isFinite(hour) || !year || !month || !day) {
    return null;
  }
  return { weekday, hour: hour % 24, date: `${year}-${month}-${day}` };
}

/** `now` in UTC — the clock used for tokens with no zone on file. */
function utcClock(now: Date): LocalClock {
  return {
    weekday: now.getUTCDay(),
    hour: now.getUTCHours(),
    date: now.toISOString().slice(0, 10),
  };
}

/**
 * Read every device token, a page at a time.
 *
 * Falls back to the pre-031 column list if `timezone` / `last_dua_push_at` don't
 * exist yet, so the route can be deployed BEFORE migration 031 is applied
 * without the weekly send going dark. In that degraded mode every device is
 * treated as legacy (14:00 UTC) and nothing is stamped.
 */
async function fetchTokens(
  supa: SupabaseClient,
  now: Date
): Promise<{ rows: TokenRow[]; schemaReady: boolean } | { error: string }> {
  const NEW_COLS = "token, platform, environment, user_id, timezone, last_dua_push_at";
  const OLD_COLS = "token, platform, environment, user_id";
  let cols = NEW_COLS;
  let schemaReady = true;
  const rows: TokenRow[] = [];
  // Apply the dedupe cutoff in the QUERY, not just in pickDueTokens. This runs
  // 168x a week; without it every tick drags the entire device_tokens table
  // across the wire to discard almost all of it, and the index on
  // last_dua_push_at (migration 031) would never be read. Devices never sent
  // have a NULL stamp, so they must be included explicitly.
  const cutoff = new Date(now.getTime() - DEDUPE_MS).toISOString();

  for (let from = 0; ; from += PAGE) {
    let q = supa.from("device_tokens").select(cols);
    if (schemaReady) {
      q = q.or(`last_dua_push_at.is.null,last_dua_push_at.lt.${cutoff}`);
    }
    const { data, error } = await q
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) {
      // 42703 = undefined_column. Only worth retrying on the FIRST page, and
      // only for the columns 031 adds — anything else is a real failure.
      const missingColumn =
        from === 0 &&
        schemaReady &&
        (error.code === "42703" || /timezone|last_dua_push_at/.test(error.message ?? ""));
      if (!missingColumn) return { error: error.message };
      cols = OLD_COLS;
      schemaReady = false;
      from -= PAGE; // redo page 0 with the legacy column list
      continue;
    }
    const page = (data ?? []) as unknown as TokenRow[];
    rows.push(...page);
    if (page.length < PAGE) return { rows, schemaReady };
  }
}

type DueToken = { row: TokenRow; localDate: string };

/**
 * The devices for which it is "now" the moment to send.
 *
 * Per device: convert `now` into that device's own zone and require local
 * Wednesday + local hour 10. Devices with a NULL (or unrecognised) timezone —
 * every token registered before 031 shipped, plus any client whose `Intl` lookup
 * failed — keep the LEGACY behaviour of 14:00 UTC on Wednesday, so nobody
 * silently stops receiving the duʿā while waiting for the app update. They
 * migrate to local time by themselves on the next foreground, since registration
 * re-fires every time the app becomes active.
 */
function pickDueTokens(rows: TokenRow[], now: Date, schemaReady: boolean): DueToken[] {
  const dedupeCutoff = now.getTime() - DEDUPE_MS;
  const due: DueToken[] = [];
  for (const row of rows) {
    if (row.platform !== "ios") continue;

    // Already served this week (a repeated local hour at a DST boundary, a
    // manual smoke test, a duplicated cron tick) → skip. Only successful sends
    // stamp this, which is what lets the retry below actually retry.
    const lastSent = row.last_dua_push_at ? Date.parse(row.last_dua_push_at) : NaN;
    const everSent = Number.isFinite(lastSent);
    if (everSent && lastSent > dedupeCutoff) continue;

    const zone = schemaReady ? (row.timezone ?? "").trim() : "";
    const clock = zone ? localClock(now, zone) : null;
    if (clock) {
      // A WINDOW, not a single instant. Matching exactly one hour meant a device
      // whose APNs send failed was NOT retried: the next tick already read local
      // hour 11 and skipped it, so one transient failure cost that user the
      // whole week. The extra ticks give it another chance, and the dedupe above
      // stops a success from being sent twice inside the window.
      if (
        clock.weekday !== TARGET_WEEKDAY ||
        clock.hour < TARGET_LOCAL_HOUR ||
        clock.hour > TARGET_LOCAL_HOUR + RETRY_HOURS
      )
        continue;
      due.push({ row, localDate: clock.date });
    } else {
      // LEGACY: no zone on file (a build predating the client change, or a zone
      // ICU doesn't recognise). Keep the exact pre-031 behaviour so these
      // devices never silently stop receiving the duʿā.
      //
      // KNOWN ONE-WEEK GAP, accepted rather than papered over: a device that
      // uploads its zone for the first time ON a Wednesday, after its own local
      // 10:00 but before 14:00 UTC, falls between the two schedules and misses
      // that single week — the local window has passed and it is no longer
      // legacy. Closing it would mean sending some users a duʿā at an arbitrary
      // local hour (possibly late at night), which is a worse trade than one
      // skipped week during a one-time migration.
      const utc = utcClock(now);
      if (
        utc.weekday !== TARGET_WEEKDAY ||
        utc.hour < LEGACY_UTC_HOUR ||
        utc.hour > LEGACY_UTC_HOUR + RETRY_HOURS
      )
        continue;
      due.push({ row, localDate: utc.date });
    }
  }
  return due;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

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

  const now = new Date();

  const fetched = await fetchTokens(supa, now);
  if ("error" in fetched) {
    return NextResponse.json({ error: fetched.error }, { status: 500 });
  }
  const due = pickDueTokens(fetched.rows, now, fetched.schemaReady);

  // The overwhelmingly common outcome: this hour is nobody's Wednesday morning.
  // Bail before touching profiles — 168 ticks a week shouldn't mean 168 full
  // opt-out scans.
  if (!due.length) {
    return NextResponse.json({
      ok: true,
      kind: "dua",
      due: 0,
      sent: 0,
      failed: 0,
      removed: 0,
      schemaReady: fetched.schemaReady,
    });
  }

  // Recipients = every due iOS device whose owner has NOT opted out. We fetch the
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
  const recipients = due.filter((d) => !optedOut.has(d.row.user_id));

  // Group by the device's LOCAL calendar date, which is also the content key.
  // Keying on the local date (rather than the server's UTC date) is what makes
  // everyone get the SAME duʿā in a given week: a Wednesday carries the same
  // YYYY-MM-DD in every zone, whereas the UTC date at the moment of a local-10am
  // send differs between Auckland and Honolulu, and they'd receive different
  // duʿās from the same week's rotation. In practice a single tick yields one
  // group, but grouping costs nothing and keeps that guarantee explicit.
  const byDate = new Map<string, ApnsTarget[]>();
  for (const { row, localDate } of recipients) {
    const target: ApnsTarget = {
      token: row.token,
      environment: row.environment as PushEnvironment,
    };
    const bucket = byDate.get(localDate);
    if (bucket) bucket.push(target);
    else byDate.set(localDate, [target]);
  }

  let sent = 0;
  let failed = 0;
  const corrected: Array<{ token: string; environment: PushEnvironment }> = [];
  const staleTokens: string[] = [];
  const delivered: string[] = [];

  for (const [dateStr, targets] of byDate) {
    // The duʿā ONLY. The on-device scheduler already sends Today's Verse (8am)
    // and Today's Hadith (1:30pm) EVERY day, so the old ayah/hadith/dua rotation
    // just re-sent local content two days in three; the duʿā is the one thing
    // remote adds. Still keyed to the calendar date, so it moves week to week.
    const item = pickDailyContent(dateStr).dua;
    const result = await sendToMany(targets, {
      title: item.title,
      body: item.reference ? `${item.english} — ${item.reference}` : item.english,
      url: item.url,
      // "daily" is the historical tag for this scheduled content push (kept, like
      // the route path, so nothing downstream has to change) — it now runs weekly.
      data: { audience: "daily" },
      // Second line of defence behind last_dua_push_at: iOS collapses same-id
      // notifications, so a device with a stale second token, or one matched by
      // two ticks before a stamp lands, still shows exactly one banner. Keyed by
      // the device's local send date, which is unique per weekly run.
      collapseId: `daily-${dateStr}`,
    });
    sent += result.sent;
    failed += result.failed;
    corrected.push(...result.corrected);
    staleTokens.push(...result.staleTokens);
    for (const r of result.results) if (r.ok) delivered.push(r.token);
  }

  await Promise.all(
    corrected.map((c) =>
      supa.from("device_tokens").update({ environment: c.environment }).eq("token", c.token)
    )
  );
  if (staleTokens.length) {
    await supa.from("device_tokens").delete().in("token", staleTokens);
  }
  // Stamp ONLY the tokens APNs accepted. A device that failed (timeout, APNs
  // 5xx) keeps a stale last_dua_push_at and is retried on the next hourly tick —
  // which, for a device whose local 10:00 has passed, means the following week.
  // Skipped entirely when running against a pre-031 schema (no such column).
  if (fetched.schemaReady && delivered.length) {
    const stampedAt = new Date().toISOString();
    for (const batch of chunk(delivered, IN_CHUNK)) {
      await supa
        .from("device_tokens")
        .update({ last_dua_push_at: stampedAt })
        .in("token", batch);
    }
  }

  return NextResponse.json({
    ok: true,
    kind: "dua",
    due: due.length,
    sent,
    failed,
    corrected: corrected.length,
    removed: staleTokens.length,
    optedOut: optedOut.size,
    schemaReady: fetched.schemaReady,
  });
}

// POST-only: a GET route handler can't live in the mobile output:export build
// (Next static-analyzes GET handlers; POST/OPTIONS pass through inert, like
// /api/search). Scheduled via Supabase pg_cron → push_post() — see migrations
// 026/029/031 — and triggerable manually with a POST + x-cron-secret header.
// NOTE: a manual trigger outside somebody's Wednesday 10:00 correctly returns
// sent: 0. To force yourself one, null out your row's last_dua_push_at and fire
// it during your local Wednesday hour.
export async function POST(req: NextRequest) {
  return handle(req);
}
