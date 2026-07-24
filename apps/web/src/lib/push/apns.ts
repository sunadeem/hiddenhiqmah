/**
 * Apple Push Notification service (APNs) provider — token-based (ES256 JWT) auth
 * over HTTP/2. Runs ONLY on the Vercel web deploy (Node runtime); the mobile
 * static export never imports this.
 *
 * Why node:http2 (not fetch): APNs requires HTTP/2 and Node's built-in fetch
 * (undici) speaks HTTP/1.1, which api.push.apple.com rejects. We open a single
 * HTTP/2 session per host and multiplex all device sends over it.
 *
 * Env vars (see returned list): APNS_KEY_ID, APNS_TEAM_ID, APNS_AUTH_KEY (the
 * .p8 PEM contents — literal "\n" escapes are tolerated), APNS_TOPIC.
 */

import http2 from "node:http2";
import { createPrivateKey, sign } from "node:crypto";

export type PushEnvironment = "production" | "sandbox";

/** A single push destination. `environment` routes to prod vs sandbox APNs. */
export type ApnsTarget = { token: string; environment?: PushEnvironment | null };

/** The user-facing content of a push. `data` is merged into the top-level JSON
 *  alongside `url` (the client reads `url` to deep-link on tap). */
export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  data?: Record<string, unknown>;
};

export type SendResult = {
  token: string;
  ok: boolean;
  status?: number;
  reason?: string;
};

export type SendManyResult = {
  sent: number;
  failed: number;
  /** Tokens dead on BOTH APNs environments (410 / Unregistered / bad on both) —
   *  callers should delete these from device_tokens. */
  staleTokens: string[];
  /** Tokens that only succeeded on the OTHER environment than declared — callers
   *  should update device_tokens.environment to this value (self-correction). */
  corrected: Array<{ token: string; environment: PushEnvironment }>;
  results: SendResult[];
};

const PROD_HOST = "https://api.push.apple.com";
const SANDBOX_HOST = "https://api.sandbox.push.apple.com";
const DEFAULT_TOPIC = "com.hiddenhiqmah.app";
// APNs provider tokens are valid up to 1h and must not be refreshed more than
// once per 20 min. Re-sign at most every ~50 min (module-scoped cache).
const TOKEN_TTL_SEC = 50 * 60;
const REQUEST_TIMEOUT_MS = 10_000;
// HTTP/2 multiplexes, but keep concurrency bounded so a large fan-out doesn't
// open thousands of simultaneous streams.
const MAX_CONCURRENCY = 20;

/** Whether the APNs signing credentials are present in the environment. */
export function isApnsConfigured(): boolean {
  return Boolean(
    process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID && process.env.APNS_AUTH_KEY
  );
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

let cachedToken: { jwt: string; iat: number } | null = null;

/** Sign (or reuse a cached) ES256 provider JWT for APNs. Throws if unconfigured. */
function getProviderToken(): string {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const authKey = process.env.APNS_AUTH_KEY;
  if (!keyId || !teamId || !authKey) {
    throw new Error(
      "APNs is not configured (need APNS_KEY_ID, APNS_TEAM_ID, APNS_AUTH_KEY)."
    );
  }
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now - cachedToken.iat < TOKEN_TTL_SEC) return cachedToken.jwt;

  const header = base64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const payload = base64url(JSON.stringify({ iss: teamId, iat: now }));
  const signingInput = `${header}.${payload}`;
  // Env vars often store the PEM with literal "\n" instead of real newlines.
  const pem = authKey.includes("\\n") ? authKey.replace(/\\n/g, "\n") : authKey;
  const privateKey = createPrivateKey(pem);
  // ES256 (JWS) needs the raw r||s signature, not DER — dsaEncoding: ieee-p1363.
  const signature = sign("sha256", Buffer.from(signingInput), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  });
  const jwt = `${signingInput}.${base64url(signature)}`;
  cachedToken = { jwt, iat: now };
  return jwt;
}

function hostFor(env?: PushEnvironment | null): string {
  return env === "sandbox" ? SANDBOX_HOST : PROD_HOST;
}

/** Build the APNs request JSON: aps envelope + top-level url + custom data. */
export function buildApnsBody(payload: PushPayload): Record<string, unknown> {
  const { title, body, url, data } = payload;
  return {
    aps: { alert: { title, body }, sound: "default" },
    ...(url ? { url } : {}),
    ...(data ?? {}),
  };
}

function otherEnv(env: PushEnvironment): PushEnvironment {
  return env === "sandbox" ? "production" : "sandbox";
}

function pushToMap<K, V>(m: Map<K, V[]>, k: K, v: V): void {
  const arr = m.get(k);
  if (arr) arr.push(v);
  else m.set(k, [v]);
}

function connect(host: string): Promise<http2.ClientHttp2Session> {
  return new Promise((resolve, reject) => {
    const session = http2.connect(host);
    const onConnect = () => {
      session.removeListener("error", onError);
      resolve(session);
    };
    const onError = (err: Error) => {
      session.removeListener("connect", onConnect);
      reject(err);
    };
    session.once("connect", onConnect);
    session.once("error", onError);
  });
}

function sendOnSession(
  session: http2.ClientHttp2Session,
  token: string,
  bodyBuf: Buffer,
  jwt: string,
  topic: string
): Promise<{ status: number; reason?: string }> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (r: { status: number; reason?: string }) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };

    let req: http2.ClientHttp2Stream;
    try {
      req = session.request({
        ":method": "POST",
        ":path": `/3/device/${token}`,
        authorization: `bearer ${jwt}`,
        "apns-topic": topic,
        "apns-push-type": "alert",
        "apns-priority": "10",
        "apns-expiration": String(Math.floor(Date.now() / 1000) + 3600),
        "content-type": "application/json",
        "content-length": bodyBuf.length,
      });
    } catch (err) {
      done({ status: 0, reason: err instanceof Error ? err.message : "request failed" });
      return;
    }

    let status = 0;
    let raw = "";
    req.setEncoding("utf8");
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.close();
      done({ status: 0, reason: "timeout" });
    });
    req.on("response", (headers) => {
      status = Number(headers[":status"]) || 0;
    });
    req.on("data", (chunk: string) => {
      raw += chunk;
    });
    req.on("end", () => {
      let reason: string | undefined;
      if (raw) {
        try {
          reason = (JSON.parse(raw) as { reason?: string }).reason;
        } catch {
          /* non-JSON body (e.g. success) */
        }
      }
      done({ status, reason });
    });
    req.on("error", (err) => {
      done({ status: 0, reason: err instanceof Error ? err.message : "stream error" });
    });
    req.end(bodyBuf);
  });
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

/** Send a batch of raw tokens to ONE host; returns per-token status. */
async function sendGroupToHost(
  host: string,
  tokens: string[],
  bodyBuf: Buffer,
  jwt: string,
  topic: string
): Promise<Map<string, { status: number; reason?: string }>> {
  const out = new Map<string, { status: number; reason?: string }>();
  if (!tokens.length) return out;
  let session: http2.ClientHttp2Session;
  try {
    session = await connect(host);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "connect failed";
    for (const t of tokens) out.set(t, { status: 0, reason });
    return out;
  }
  // Swallow post-connect session errors so one bad stream can't crash the run.
  session.on("error", () => {});
  try {
    await runWithConcurrency(tokens, MAX_CONCURRENCY, async (t) => {
      out.set(t, await sendOnSession(session, t, bodyBuf, jwt, topic));
    });
  } finally {
    session.close();
  }
  return out;
}

/**
 * Send one push to many tokens. Sends each token to its declared APNs env, then
 * — because a client can't reliably tell a sandbox (TestFlight/dev) token from a
 * production one — RETRIES any `BadDeviceToken` on the OTHER env. Tokens that
 * then succeed are reported in `corrected` (caller fixes device_tokens.environment);
 * tokens dead on both envs (or 410/Unregistered) are `staleTokens` (caller deletes).
 */
export async function sendToMany(
  targets: ApnsTarget[],
  payload: PushPayload
): Promise<SendManyResult> {
  const results: SendResult[] = [];
  const staleTokens: string[] = [];
  const corrected: Array<{ token: string; environment: PushEnvironment }> = [];
  if (!targets.length) return { sent: 0, failed: 0, staleTokens, corrected, results };

  const jwt = getProviderToken();
  const topic = process.env.APNS_TOPIC || DEFAULT_TOPIC;
  const bodyBuf = Buffer.from(JSON.stringify(buildApnsBody(payload)));

  const envOf = new Map<string, PushEnvironment>();
  for (const t of targets) {
    envOf.set(t.token, t.environment === "sandbox" ? "sandbox" : "production");
  }

  // ── Pass 1: each token to its declared env's host ──
  const byHost = new Map<string, string[]>();
  for (const [token, env] of envOf) pushToMap(byHost, hostFor(env), token);
  const retry: string[] = []; // BadDeviceToken → maybe just the wrong env
  for (const [host, tokens] of byHost) {
    const res = await sendGroupToHost(host, tokens, bodyBuf, jwt, topic);
    for (const [token, r] of res) {
      if (r.status === 200) {
        results.push({ token, ok: true, status: 200 });
      } else if (r.status === 410 || r.reason === "Unregistered") {
        results.push({ token, ok: false, status: r.status, reason: r.reason });
        staleTokens.push(token);
      } else if (r.reason === "BadDeviceToken") {
        retry.push(token);
      } else {
        // transient/auth/network failure — not a dead token
        results.push({ token, ok: false, status: r.status, reason: r.reason });
      }
    }
  }

  // ── Pass 2: retry BadDeviceToken tokens on the OTHER env ──
  if (retry.length) {
    const byOther = new Map<string, string[]>();
    for (const token of retry) {
      pushToMap(byOther, hostFor(otherEnv(envOf.get(token)!)), token);
    }
    for (const [host, tokens] of byOther) {
      const res = await sendGroupToHost(host, tokens, bodyBuf, jwt, topic);
      for (const [token, r] of res) {
        if (r.status === 200) {
          results.push({ token, ok: true, status: 200 });
          corrected.push({ token, environment: otherEnv(envOf.get(token)!) });
        } else {
          // bad on both envs → truly dead
          results.push({ token, ok: false, status: r.status, reason: r.reason });
          staleTokens.push(token);
        }
      }
    }
  }

  const sent = results.filter((r) => r.ok).length;
  return { sent, failed: results.length - sent, staleTokens, corrected, results };
}

/** Send one push to a single token. */
export async function sendToOne(
  target: ApnsTarget,
  payload: PushPayload
): Promise<SendResult> {
  const res = await sendToMany([target], payload);
  return res.results[0] ?? { token: target.token, ok: false, reason: "no result" };
}
