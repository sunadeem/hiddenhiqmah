/**
 * Firebase Cloud Messaging (FCM) provider — HTTP v1 API with service-account
 * (RS256 JWT → OAuth2 access token) auth. The Android counterpart to apns.ts,
 * and deliberately shaped to the same contract so send.ts can treat the two
 * transports interchangeably.
 *
 * Runs ONLY on the Vercel web deploy (Node runtime); the mobile static export
 * never imports this.
 *
 * Env vars: FCM_PROJECT_ID, FCM_CLIENT_EMAIL, FCM_PRIVATE_KEY (the PEM from the
 * Firebase service-account JSON — literal "\n" escapes are tolerated, exactly
 * like APNS_AUTH_KEY).
 *
 * ── Four ways FCM is NOT APNs, all of which shaped this file ───────────────
 *
 * 1. NO ENVIRONMENT SPLIT. There is no sandbox vs production host; one endpoint
 *    serves debug and release builds alike. So this transport never reports a
 *    `corrected` environment, and callers must never "self-correct" an Android
 *    row the way they do an APNs one — see send.ts.
 *
 * 2. NO MULTICAST. HTTP v1 sends to exactly one token per request (the old
 *    batch endpoint was retired with the legacy API), so a fan-out is N HTTP
 *    calls, bounded by MAX_CONCURRENCY. Unlike APNs there is no HTTP/2 session
 *    to reuse — plain fetch is correct here.
 *
 * 3. A 400 IS AMBIGUOUS, AND THE AMBIGUITY IS DANGEROUS. FCM answers 400
 *    INVALID_ARGUMENT both for "this registration token is malformed" and for
 *    "your message is malformed". The body we send is byte-identical for every
 *    token in a fan-out — only `token` varies — so reading a payload fault as a
 *    token fault marks the WHOLE Android fleet dead at once, and callers delete
 *    what they are told is dead. classify() therefore only stales a 400 when the
 *    response explicitly blames `message.token`, and sendToManyFcm adds a
 *    batch-wide guard on top. The APNs path never needed this: an oversized
 *    payload there comes back 413, which apns.ts already treats as transient.
 *
 * 4. `data` MUST BE FLAT STRINGS. FCM rejects nested objects and non-string
 *    values outright (400 INVALID_ARGUMENT), which would look identical to a
 *    dead token if we weren't careful — hence flattenData() below and the very
 *    deliberate stale-classification in classify().
 */

import { createPrivateKey, sign } from "node:crypto";
import type { PushPayload, SendResult, SendManyResult } from "./apns";

/** A single FCM destination. No `environment` — see note 1 in the header. */
export type FcmTarget = { token: string };

/** Notification channel our pushes post on. Created client-side by push.ts and
 *  named in AndroidManifest.xml, so both the foreground and background display
 *  paths agree. Changing this string means changing all three. */
export const PUSH_CHANNEL_ID = "hiqmah_push";

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const REQUEST_TIMEOUT_MS = 10_000;
/** Bounded so a large fan-out doesn't open thousands of sockets at once. */
const MAX_CONCURRENCY = 20;
/** Google access tokens live 1h; refresh a little early to avoid an edge miss. */
const TOKEN_SKEW_SEC = 5 * 60;

/** Whether the FCM service-account credentials are present in the environment. */
export function isFcmConfigured(): boolean {
  return Boolean(
    process.env.FCM_PROJECT_ID &&
      process.env.FCM_CLIENT_EMAIL &&
      process.env.FCM_PRIVATE_KEY
  );
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

let cachedAccess: { token: string; expiresAt: number } | null = null;

/**
 * Mint (or reuse) a Google OAuth2 access token from the service-account key.
 *
 * Cached module-scoped like the APNs provider JWT. Note the two different
 * signature encodings across this codebase: APNs is ES256 and needs the raw
 * r||s form (`dsaEncoding: "ieee-p1363"`), whereas Google service accounts are
 * RS256, where the DER-ish default is already correct. Copying the APNs call
 * shape here verbatim would produce a signature Google silently rejects as
 * `invalid_grant`.
 */
async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.FCM_CLIENT_EMAIL;
  const rawKey = process.env.FCM_PRIVATE_KEY;
  if (!clientEmail || !rawKey) {
    throw new Error(
      "FCM is not configured (need FCM_PROJECT_ID, FCM_CLIENT_EMAIL, FCM_PRIVATE_KEY)."
    );
  }
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccess && cachedAccess.expiresAt - TOKEN_SKEW_SEC > now) {
    return cachedAccess.token;
  }

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: FCM_SCOPE,
      aud: OAUTH_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signingInput = `${header}.${claims}`;
  // Env vars commonly store the PEM with literal "\n" instead of real newlines.
  const pem = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;
  const assertion = `${signingInput}.${base64url(
    sign("sha256", Buffer.from(signingInput), createPrivateKey(pem))
  )}`;

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const json = (await res.json().catch(() => null)) as
    | { access_token?: string; expires_in?: number; error_description?: string; error?: string }
    | null;
  if (!res.ok || !json?.access_token) {
    const detail = json?.error_description || json?.error || `HTTP ${res.status}`;
    throw new Error(`FCM auth failed: ${detail}`);
  }
  cachedAccess = {
    token: json.access_token,
    expiresAt: now + (json.expires_in ?? 3600),
  };
  return cachedAccess.token;
}

/**
 * FCM's `data` map is `map<string, string>` — nested objects and numbers are
 * rejected with 400 INVALID_ARGUMENT, which classify() would otherwise have to
 * treat as a dead token. Objects are JSON-encoded so nothing is silently lost;
 * null/undefined are dropped, since the string "null" would read as real data
 * to the client.
 */
function flattenData(data: Record<string, unknown> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!data) return out;
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) continue;
    out[k] = typeof v === "string" ? v : typeof v === "object" ? JSON.stringify(v) : String(v);
  }
  return out;
}

/** Build the FCM HTTP v1 request body for one token. */
export function buildFcmMessage(
  token: string,
  payload: PushPayload
): Record<string, unknown> {
  const { title, body, url, data, collapseId } = payload;
  // `url` rides inside `data`, NOT at the top level as it does for APNs. On
  // Android the Capacitor plugin surfaces only the FCM data map as
  // notification.data, which is what push.ts reads to deep-link on tap; a
  // top-level url would simply never reach the client.
  const dataMap = flattenData({ ...(data ?? {}), ...(url ? { url } : {}) });

  return {
    message: {
      token,
      notification: { title, body },
      ...(Object.keys(dataMap).length ? { data: dataMap } : {}),
      android: {
        // Wakes a dozing device — these are time-sensitive (a prayer duʿā, a
        // circle message), not background sync.
        priority: "high",
        // Match the one-hour APNs expiry (apns.ts sets apns-expiration to
        // now+3600). FCM's DEFAULT is four weeks, so without this a phone that
        // is off overnight — or off for a fortnight — would light up with a
        // Wednesday duʿā or a long-dead circle message as if it were new. Must
        // be a duration STRING ("3600s"); AndroidConfig.ttl is a
        // google.protobuf.Duration and a bare number is rejected.
        ttl: "3600s",
        ...(collapseId ? { collapse_key: collapseId } : {}),
        notification: {
          // Android 8+ takes sound, vibration and importance from the CHANNEL,
          // not from the payload. Naming it here (and in the manifest, for the
          // background path) is what keeps our pushes out of the SDK's own
          // fallback channel, which is labelled "Miscellaneous" in the user's
          // notification settings and is only IMPORTANCE_DEFAULT — so
          // priority:"high" above would never actually produce a heads-up
          // banner. The channel is created client-side; see push.ts.
          channel_id: PUSH_CHANNEL_ID,
          // Honoured on API 24–25 only, which is the floor this app supports.
          sound: "default",
          // The real analogue of apns-collapse-id. collapse_key only dedupes
          // messages still QUEUED for an offline device; `tag` is what makes a
          // new notification REPLACE an already-displayed one, which is the
          // property the callers actually rely on to guarantee "a device with
          // two live tokens can never show the same push twice".
          ...(collapseId ? { tag: collapseId } : {}),
        },
      },
    },
  };
}

type FcmError = {
  status?: string;
  errorCode?: string;
  message?: string;
  /** Fields Google blamed, e.g. "message.token" or "message.notification.body". */
  badFields?: string[];
};

/**
 * Map an FCM response to our SendResult vocabulary.
 *
 * Being conservative here is load-bearing: a token classified stale is DELETED
 * by the caller, so anything that could be a server-side or configuration fault
 * must fall through to "failed but keep". Only the two codes that specifically
 * mean "this registration token is no longer valid" mark a token stale.
 */
function classify(
  status: number,
  err: FcmError | null
): { ok: boolean; stale: boolean; reason?: string } {
  if (status === 200) return { ok: true, stale: false };
  const code = err?.errorCode || err?.status;
  // UNREGISTERED (404): app uninstalled or the token was rotated/expired.
  // INVALID_ARGUMENT (400) on a send: a malformed registration token. We only
  // ever send well-formed payloads, so on this route the token is the variable
  // — but note it is genuinely ambiguous, which is why buildFcmMessage takes
  // pains to never emit a payload FCM could reject.
  if (status === 404 && code === "UNREGISTERED") {
    return { ok: false, stale: true, reason: code };
  }
  if (status === 400) {
    // ONLY when Google names message.token as the offending field. Every other
    // 400 — a body over the ~4KB limit, a reserved `data` key, any future
    // payload change — also arrives as INVALID_ARGUMENT but is OUR fault, and
    // is identical across every token in the batch. Reading those as dead
    // devices would delete the entire Android fleet in one call (each user then
    // silently unsubscribed until they next cold-open the app).
    //
    // Note the deliberate asymmetry of the two mistakes: keeping a genuinely
    // dead token costs one wasted request per send, and it self-heals the next
    // time the app is uninstalled and FCM answers 404 UNREGISTERED. Deleting a
    // live one is unrecoverable from the server side. So when the response does
    // not clearly blame the token, we keep it.
    const blamesToken = (err?.badFields ?? []).some((f) => f === "message.token");
    return { ok: false, stale: blamesToken, reason: code || `HTTP ${status}` };
  }
  // 401/403 = our credentials. 429 = quota. 5xx = Google. SENDER_ID_MISMATCH =
  // the token belongs to a DIFFERENT Firebase project (i.e. we're misconfigured,
  // or google-services.json changed) — emphatically not a dead device.
  return { ok: false, stale: false, reason: code || err?.message || `HTTP ${status}` };
}

/** A SendResult plus the classification the caller must not re-derive. */
type FcmOutcome = SendResult & { stale: boolean };

async function sendOne(
  projectId: string,
  accessToken: string,
  token: string,
  payload: PushPayload
): Promise<FcmOutcome> {
  try {
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/messages:send`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(buildFcmMessage(token, payload)),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );
    let err: FcmError | null = null;
    if (res.status !== 200) {
      const json = (await res.json().catch(() => null)) as {
        error?: {
          status?: string;
          message?: string;
          details?: Array<{
            errorCode?: string;
            fieldViolations?: Array<{ field?: string }>;
          }>;
        };
      } | null;
      const details = json?.error?.details ?? [];
      err = {
        status: json?.error?.status,
        message: json?.error?.message,
        // The FcmError detail carries errorCode; a google.rpc.BadRequest detail
        // instead carries fieldViolations. Which one is present is precisely
        // what distinguishes a dead token from a bad payload — see classify().
        errorCode: details.find((d) => d?.errorCode)?.errorCode,
        badFields: details
          .flatMap((d) => d?.fieldViolations ?? [])
          .map((v) => v?.field)
          .filter((f): f is string => typeof f === "string"),
      };
    }
    const verdict = classify(res.status, err);
    return {
      token,
      ok: verdict.ok,
      status: res.status,
      reason: verdict.reason,
      stale: verdict.stale,
    };
  } catch (e) {
    // Network error / timeout — transient by definition, never stale.
    return {
      token,
      ok: false,
      status: 0,
      reason: e instanceof Error ? e.message : "request failed",
      stale: false,
    };
  }
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

/**
 * Send one push to many Android tokens.
 *
 * Returns the same shape as the APNs sender so send.ts can merge the two
 * without special-casing. `corrected` is ALWAYS empty — FCM has no environment
 * to correct (header note 1).
 */
export async function sendToManyFcm(
  targets: FcmTarget[],
  payload: PushPayload
): Promise<SendManyResult> {
  const results: SendResult[] = [];
  const staleTokens: string[] = [];
  if (!targets.length) {
    return { sent: 0, failed: 0, staleTokens, corrected: [], results };
  }

  const projectId = process.env.FCM_PROJECT_ID;
  if (!projectId) throw new Error("FCM is not configured (need FCM_PROJECT_ID).");

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (e) {
    // Auth failed for every token at once. Report them all as failed-but-alive:
    // deleting the whole Android fleet because a service-account key expired
    // would be unrecoverable.
    const reason = e instanceof Error ? e.message : "auth failed";
    for (const t of targets) results.push({ token: t.token, ok: false, status: 0, reason });
    return { sent: 0, failed: results.length, staleTokens, corrected: [], results };
  }

  const outcomes: FcmOutcome[] = [];
  await runWithConcurrency(targets, MAX_CONCURRENCY, async (t) => {
    outcomes.push(await sendOne(projectId, accessToken, t.token, payload));
  });
  // Trust classify()'s verdict rather than re-deriving staleness from the
  // human-readable reason string. Re-deriving is how the careful rule above
  // gets quietly bypassed: `reason` is shared by both kinds of 400.
  for (const o of outcomes) {
    results.push({ token: o.token, ok: o.ok, status: o.status, reason: o.reason });
    if (o.stale) staleTokens.push(o.token);
  }

  // Belt and braces over classify(): if EVERY token in a multi-token batch came
  // back 400, that is one malformed message, not N simultaneously-dead devices
  // — real tokens don't all expire in the same millisecond. Keep them all.
  const allRejected =
    outcomes.length > 1 && outcomes.every((o) => !o.ok && o.status === 400);
  if (allRejected && staleTokens.length) {
    staleTokens.length = 0;
  }

  const sent = results.filter((r) => r.ok).length;
  return { sent, failed: results.length - sent, staleTokens, corrected: [], results };
}
