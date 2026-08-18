/**
 * Platform-routing push dispatcher — the ONE entry point every send route uses.
 *
 * Before this existed each route read device_tokens, filtered `platform === "ios"`,
 * and called the APNs sender directly. That filter was correct while iOS was the
 * only client; with Android shipping it silently means "never notify an Android
 * user", and the failure is invisible — the route still returns ok:true with a
 * cheerful sent count, just one that excludes every Android device.
 *
 * So routes now hand over ALL their tokens and this module decides the wire:
 * iOS → APNs (HTTP/2, ES256), Android → FCM (HTTP v1, RS256 service account).
 *
 * ── The two invariants worth stating out loud ──────────────────────────────
 *
 * A. NEVER MARK A TOKEN STALE BECAUSE A TRANSPORT IS UNCONFIGURED. Callers
 *    delete staleTokens from the database. If FCM credentials are missing (or
 *    expired, or the founder rotates a key), every Android token would be
 *    reported dead and deleted — and since a token is only re-registered when
 *    the app next opens, that quietly unsubscribes the entire Android fleet with
 *    no way to notice. Unconfigured therefore yields ok:false + a reason, and an
 *    EMPTY staleTokens list.
 *
 * B. `corrected` IS APNs-ONLY. It exists because a client can't tell a sandbox
 *    token from a production one, so the sender retries the other host and
 *    reports which one worked. FCM has no such split; an Android token must
 *    never appear in `corrected`, or the route would write a meaningless
 *    `environment` back onto its row.
 */

import {
  sendToMany as sendToManyApns,
  isApnsConfigured,
  type ApnsTarget,
  type PushEnvironment,
  type PushPayload,
  type SendResult,
  type SendManyResult,
} from "./apns";
import { sendToManyFcm, isFcmConfigured } from "./fcm";

export type { PushPayload, SendResult, SendManyResult, PushEnvironment };

/** A destination as it comes out of device_tokens. */
export type PushTarget = {
  token: string;
  /** 'ios' | 'android'. Anything else is treated as iOS — see coerce() below. */
  platform?: string | null;
  /** APNs only; ignored for Android. */
  environment?: PushEnvironment | string | null;
};

/** True when AT LEAST ONE transport can send. Routes gate on this instead of
 *  isApnsConfigured(), so a missing FCM key can't 500 the iOS send (and vice
 *  versa) — each platform group reports its own configuration failure below. */
export function isPushConfigured(): boolean {
  return isApnsConfigured() || isFcmConfigured();
}

/** Which transports are live, for diagnostics in route responses. */
export function pushTransports(): { apns: boolean; fcm: boolean } {
  return { apns: isApnsConfigured(), fcm: isFcmConfigured() };
}

/**
 * Rows predate the Android client, and `platform` is a free-text column
 * (constrained to 'ios'|'android', but historically defaulted to 'ios' and the
 * old client hardcoded it). Treat only an explicit 'android' as Android: an
 * unrecognised value on an iPhone-era row must keep going to APNs, whereas
 * mistakenly routing an APNs token to FCM would return INVALID_ARGUMENT and —
 * without this — get it deleted as stale.
 */
function isAndroid(platform: string | null | undefined): boolean {
  return (platform ?? "").trim().toLowerCase() === "android";
}

function unconfigured(tokens: string[], reason: string): SendManyResult {
  const results: SendResult[] = tokens.map((token) => ({
    token,
    ok: false,
    status: 0,
    reason,
  }));
  // Invariant A: no staleTokens. These devices are fine; we are not.
  return { sent: 0, failed: results.length, staleTokens: [], corrected: [], results };
}

/**
 * Send one push to a mixed fleet. Merges both transports into a single
 * SendManyResult, so existing route code (`result.sent`, `result.staleTokens`,
 * `result.corrected`) keeps working unchanged.
 */
export async function sendPush(
  targets: PushTarget[],
  payload: PushPayload
): Promise<SendManyResult> {
  if (!targets.length) {
    return { sent: 0, failed: 0, staleTokens: [], corrected: [], results: [] };
  }

  const apnsTargets: ApnsTarget[] = [];
  const fcmTokens: string[] = [];
  for (const t of targets) {
    if (isAndroid(t.platform)) {
      fcmTokens.push(t.token);
    } else {
      apnsTargets.push({
        token: t.token,
        environment: t.environment === "sandbox" ? "sandbox" : "production",
      });
    }
  }

  const [apnsRes, fcmRes] = await Promise.all([
    apnsTargets.length
      ? isApnsConfigured()
        ? sendToManyApns(apnsTargets, payload)
        : Promise.resolve(unconfigured(apnsTargets.map((t) => t.token), "APNs not configured"))
      : Promise.resolve(null),
    fcmTokens.length
      ? isFcmConfigured()
        ? sendToManyFcm(
            fcmTokens.map((token) => ({ token })),
            payload
          )
        : Promise.resolve(unconfigured(fcmTokens, "FCM not configured"))
      : Promise.resolve(null),
  ]);

  const parts = [apnsRes, fcmRes].filter((r): r is SendManyResult => r !== null);
  return {
    sent: parts.reduce((n, r) => n + r.sent, 0),
    failed: parts.reduce((n, r) => n + r.failed, 0),
    staleTokens: parts.flatMap((r) => r.staleTokens),
    // Invariant B: only APNs contributes here (sendToManyFcm always returns []).
    corrected: parts.flatMap((r) => r.corrected),
    results: parts.flatMap((r) => r.results),
  };
}

/**
 * Answer "would a push actually go out right now?" without pushing to anyone.
 *
 * Needed because a bad credential is SILENT: the transport reports ok:false,
 * the route still returns HTTP 200 with a tidy summary, and the only symptom is
 * that nobody hears from us — indistinguishable from nobody being due a push.
 * It also cannot be checked from a laptop, because the credentials live in
 * Vercel and are marked Sensitive (write-only, so `vercel env pull` returns a
 * placeholder). This runs where they actually are.
 *
 * The trick: send to a token that provably cannot resolve to any device, and
 * read HOW FAR the request got from the error that comes back.
 *
 *   auth/config rejected     -> InvalidProviderToken, 401/403, "FCM auth failed"
 *   the TOKEN was rejected   -> BadDeviceToken, UNREGISTERED, INVALID_ARGUMENT
 *
 * The second outcome is the PASS: a provider that refused your credentials
 * never got far enough to have an opinion about your token. Nothing is
 * delivered either way — the tokens below are syntactically shaped but belong
 * to no device, and any staleness the senders report is discarded rather than
 * written back to the database.
 */
export type TransportProbe = {
  configured: boolean;
  ok: boolean;
  detail: string;
};

const PROBE_APNS_TOKEN = "0".repeat(64); // valid shape, registered to nothing
const PROBE_FCM_TOKEN =
  "cProbeNotARealToken:APA91bF-this-token-belongs-to-no-device-and-is-never-delivered";

/** Reasons that mean "we got through; only the token was wrong" = credentials OK. */
const TOKEN_LEVEL = new Set([
  "BadDeviceToken",
  "DeviceTokenNotForTopic",
  "Unregistered",
  "UNREGISTERED",
  "INVALID_ARGUMENT",
]);

export async function probeTransports(): Promise<{
  apns: TransportProbe;
  fcm: TransportProbe;
}> {
  const payload: PushPayload = {
    title: "Hiqmah",
    body: "Credential probe — never delivered.",
  };

  const read = (r: SendManyResult | null, configured: boolean): TransportProbe => {
    if (!configured) return { configured: false, ok: false, detail: "not configured" };
    if (!r) return { configured: true, ok: false, detail: "no result" };
    const first = r.results[0];
    if (first?.ok) return { configured: true, ok: true, detail: "accepted" };
    const reason = first?.reason ?? `HTTP ${first?.status ?? 0}`;
    return {
      configured: true,
      ok: TOKEN_LEVEL.has(reason),
      detail: reason,
    };
  };

  const apnsOn = isApnsConfigured();
  const fcmOn = isFcmConfigured();

  const [apnsRes, fcmRes] = await Promise.all([
    apnsOn
      ? sendToManyApns([{ token: PROBE_APNS_TOKEN, environment: "production" }], payload).catch(
          (e): SendManyResult => ({
            sent: 0,
            failed: 1,
            staleTokens: [],
            corrected: [],
            results: [
              { token: "", ok: false, reason: e instanceof Error ? e.message : "apns threw" },
            ],
          })
        )
      : Promise.resolve(null),
    fcmOn
      ? sendToManyFcm([{ token: PROBE_FCM_TOKEN }], payload).catch(
          (e): SendManyResult => ({
            sent: 0,
            failed: 1,
            staleTokens: [],
            corrected: [],
            results: [
              { token: "", ok: false, reason: e instanceof Error ? e.message : "fcm threw" },
            ],
          })
        )
      : Promise.resolve(null),
  ]);

  return { apns: read(apnsRes, apnsOn), fcm: read(fcmRes, fcmOn) };
}

/** Send one push to a single device. */
export async function sendPushToOne(
  target: PushTarget,
  payload: PushPayload
): Promise<SendResult> {
  const res = await sendPush([target], payload);
  return res.results[0] ?? { token: target.token, ok: false, reason: "no result" };
}
