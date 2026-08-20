import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { tryGetSupabaseServer } from "@/lib/supabase-server";

// Nothing here calls a model; this is one INSERT. Keep the ceiling low so a
// wedged Supabase can't hold a function open for the Ask route's 60s.
export const maxDuration = 10;

// Same CORS shape as /api/search — the native app posts cross-origin to
// www.hiddenhiqmah.com, so the preflight has to allow the identity headers.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Anon-Id",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// Allowlist, not a length cap: `reason` is a fixed set of UI choices, so
// anything else is either a client bug or someone poking the endpoint.
const REASONS = new Set(["offensive", "incorrect", "source", "other"]);
const SURFACES = new Set(["ask", "ask-float"]);

// Mirrors /api/search — the pooler hides the real client address from Postgres,
// so the only place a usable IP exists is here at the edge.
function getRequestIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

/** Clamp to `max` UTF-16 units WITHOUT leaving a lone surrogate behind.
 *
 *  A plain slice() can cut an emoji in half. The result is a lone high
 *  surrogate, JSON.stringify puts it on the wire verbatim, and Postgres refuses
 *  the body outright ("Unicode low surrogate must follow a high surrogate").
 *  That error is neither a duplicate nor a missing table, so it falls to the
 *  500 branch — meaning one specific answer becomes permanently unreportable,
 *  identically on every retry, purely because of where the 8000th character
 *  landed. Answers this long are routine: /api/search runs max_tokens 4096. */
function clampText(s: string, max: number): string {
  let out = s.slice(0, max);
  const last = out.charCodeAt(out.length - 1);
  if (last >= 0xd800 && last <= 0xdbff) out = out.slice(0, -1);
  return out;
}

/** "Table isn't there yet" — migration 032 not applied.
 *
 *  MUST match PGRST205, not just 42P01: we reach Postgres through PostgREST,
 *  which resolves the table against its schema cache and reports a miss as
 *  PGRST205 ("Could not find the table ... in the schema cache"). The raw
 *  42P01 only ever surfaces on a direct SQL connection. Checking 42P01 alone
 *  looks right and never fires, which would turn every report into a 500 and a
 *  failure pill for exactly as long as the migration sits un-run — the one
 *  window where a Play reviewer is most likely to try the button. */
function isMissingTable(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === "42P01" || code === "PGRST205";
}

/** Raised by ask_reports_rate_limit() in migration 032 when this reporter (or,
 *  far higher up, this IP) has filed too many reports in 24h. Custom SQLSTATE
 *  so it can never be confused with a genuine insert failure. */
const RATE_CAPPED = "HQ429";

type SupaServer = NonNullable<ReturnType<typeof tryGetSupabaseServer>>;

/** Fold a repeat report of the SAME answer by the SAME identity into the row
 *  that already exists.
 *
 *  Strictly additive — a reason is only filled in when there wasn't one, and
 *  notes are appended rather than overwritten — so no amount of re-reporting
 *  can erase what an earlier report said. Best-effort: the row is already
 *  stored and the user has already been told it will be reviewed, so a failure
 *  here must not turn into an error they cannot act on. */
async function mergeIntoExisting(
  supa: SupaServer,
  { userId, anonId, turnHash, reason, note }: {
    userId: string | null; anonId: string | null; turnHash: string;
    reason: string | null; note: string | null;
  }
) {
  if (!reason && !note) return; // nothing new to say
  try {
    const base = supa.from("ask_reports").select("id, reason, note").eq("turn_hash", turnHash).limit(1);
    const { data, error } = await (userId
      ? base.eq("user_id", userId)
      : base.is("user_id", null).eq("anon_id", anonId));
    if (error || !data?.length) return;
    const row = data[0] as { id: string; reason: string | null; note: string | null };

    const patch: Record<string, unknown> = {};
    const extras: string[] = [];
    // Containment, not inequality. Comparing against the whole note means the
    // SAME report sent twice always looks new: it re-appends its own text and
    // reopens the row every time, so a user tapping Send twice churns the
    // moderation queue and grows the note until it hits the 500-char clamp.
    const had = row.note ?? "";
    if (reason && !row.reason) patch.reason = reason;
    else if (reason && reason !== row.reason && !had.includes(`also reported as: ${reason}`)) {
      extras.push(`also reported as: ${reason}`);
    }
    if (note && !had.includes(note)) extras.push(note);
    if (!extras.length && !("reason" in patch)) return;
    if (extras.length) patch.note = clampText([row.note, ...extras].filter(Boolean).join("\n—\n"), 500);

    // Re-reporting with information a moderator has not seen reopens a closed
    // report: the user is escalating something already looked at and closed,
    // and leaving it dismissed is how the escalation gets lost. Bounded by the
    // per-identity cap, and only reachable when the report says something new.
    patch.status = "open";
    patch.resolved_at = null;
    patch.resolution_note = null;
    await supa.from("ask_reports").update(patch).eq("id", row.id);
  } catch (e) {
    console.error("[ask-report] duplicate merge failed:", e);
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const str = (v: unknown, max: number): string | null => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t ? clampText(t, max) || null : null;
  };

  const answer = str(body.answer, 8000);
  if (!answer) return json({ error: "answer required" }, 400);

  const question = str(body.question, 2000);
  const note = str(body.note, 500);
  const rawReason = str(body.reason, 40);
  const reason = rawReason && REASONS.has(rawReason) ? rawReason : null;
  const rawSurface = str(body.surface, 40);
  const surface = rawSurface && SURFACES.has(rawSurface) ? rawSurface : null;
  const platform = str(body.platform, 40);
  const appVersion = str(body.appVersion, 40);
  const modelId = str(body.modelId, 40);
  const partial = body.partial === true;

  const supa = tryGetSupabaseServer();
  // No Supabase (local dev without env vars, or a missing service-role key in
  // prod) — behave like a success rather than showing a failure the user can do
  // nothing about. Log the WHOLE payload, exactly like the missing-table branch
  // below: the user has just been told "we'll review it", so the content has to
  // survive somewhere a human can still reach it. Logging only the fact of the
  // drop destroys the one copy of the report that existed.
  if (!supa) {
    console.error(
      "[ask-report:UNSTORED] no Supabase server client —",
      JSON.stringify({
        anon_id: req.headers.get("x-anon-id")?.slice(0, 64) || null,
        answer_text: answer,
        question_text: question,
        partial,
        reason,
        note,
        surface,
        platform,
        app_version: appVersion,
        model_id: modelId,
      })
    );
    return json({ ok: true, stored: false }, 200);
  }

  // ── Identity: Bearer JWT, else the device's anon id. Same order as
  //    /api/search so a signed-in user is never recorded as a guest. ──
  let userId: string | null = null;
  let anonId: string | null = null;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const { data, error } = await supa.auth.getUser(authHeader.slice(7));
      if (!error && data.user) userId = data.user.id;
    } catch {
      /* fall through to anon */
    }
  }
  if (!userId) {
    anonId = req.headers.get("x-anon-id")?.slice(0, 64) || null;
  }
  // Matches the table's ask_reports_identity_present constraint. A caller with
  // neither is not a user we can dedupe or rate-limit, so refuse it.
  if (!userId && !anonId) return json({ error: "identity required" }, 400);

  const ipHash = sha256(getRequestIp(req));
  const turnHash = sha256(answer);

  const payload = {
    user_id: userId,
    anon_id: anonId,
    ip_hash: ipHash,
    answer_text: answer,
    question_text: question,
    turn_hash: turnHash,
    partial,
    reason,
    note,
    surface,
    platform,
    app_version: appVersion,
    model_id: modelId,
  };

  try {
    // No rate-limit check here on purpose. A `select count()` followed by a
    // separate `insert` is two round-trips with no lock: every concurrent
    // request reads the same pre-insert count and every one of them commits
    // (measured: 200 simultaneous posts, cap of 20, 200 rows stored). Worse, a
    // transient failure on the count query left `count` null and switched the
    // cap off entirely. The limit now lives in a before-insert trigger holding
    // an advisory lock (032), where it cannot be raced and applies to every
    // holder of the service role rather than to this one code path.
    const { error } = await supa.from("ask_reports").insert(payload);
    if (error) {
      // Already reported by this identity. Merge instead of discarding: unlike
      // 020's near-empty circle report, this row carries the entire triage
      // signal, and the ordinary user path is "tap flag, send, realise I never
      // picked a reason, do it again". `on conflict do nothing` silently threw
      // the better of the two reports away and still said "we'll review it".
      if (error.code === "23505") {
        await mergeIntoExisting(supa, { userId, anonId, turnHash, reason, note });
        return json({ ok: true, stored: true }, 200);
      }
      if (error.code === RATE_CAPPED) {
        // Still a silent 200 — telling a spammer the cap exists teaches them to
        // route around it. But log the payload, same as every other branch that
        // fails to store: a shared IP or an over-eager but genuine reporter
        // must not have their report vanish with nothing to recover it from.
        console.error("[ask-report:UNSTORED] rate cap —", JSON.stringify(payload));
        return json({ ok: true, stored: false }, 200);
      }
      throw error;
    }
    return json({ ok: true, stored: true }, 200);
  } catch (e) {
    if (isMissingTable(e)) {
      // Migration 032 has not been applied yet. Refusing the report would make
      // a compliance-critical feature look broken to a user (and a reviewer)
      // because of an un-run SQL file. Log the whole payload at error level
      // instead: it is recoverable from Vercel logs, so "we'll review it"
      // stays true. Self-disabling — this branch stops firing the moment the
      // table exists.
      console.error("[ask-report:UNSTORED] apply migration 032 —", JSON.stringify(payload));
      return json({ ok: true, stored: false }, 200);
    }
    console.error("[ask-report] insert failed:", e);
    return json({ error: "Report failed" }, 500);
  }
}
