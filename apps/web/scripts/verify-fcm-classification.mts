/**
 * Regression guard for the one FCM bug that cannot be noticed in production.
 *
 *   pnpm --filter web verify:fcm      (or: npx tsx scripts/verify-fcm-classification.mts)
 *
 * WHY THIS EXISTS
 *
 * Callers DELETE every token that sendToManyFcm reports in `staleTokens`, and a
 * device only re-registers when its owner next cold-opens the app. So a token
 * wrongly classified as dead is an unrecoverable, silent unsubscribe — the route
 * still answers ok:true, the logs still look ordinary, and the only symptom is
 * that some people quietly stop hearing from us.
 *
 * FCM makes that easy to get wrong, because a 400 INVALID_ARGUMENT means BOTH
 * "this registration token is malformed" AND "your message is malformed", and
 * the two are distinguishable only by which `details[]` entry Google attaches.
 * Since the request body is byte-identical for every token in a fan-out — only
 * `token` varies — misreading the second as the first condemns the entire
 * Android fleet in a single call.
 *
 * These cases pin that boundary. Case 1 and case 7 both failed before the
 * classification was corrected (5 of 5 tokens deleted, and 1 of 1); the rest
 * guard the surrounding behaviour so a future "simplification" of classify()
 * can't quietly re-open it.
 *
 * There is no test framework in this repo, deliberately — this is a standalone
 * script, not a suite. It lives outside src/ so it is never part of the route
 * tree or the static export.
 */

import { generateKeyPairSync } from "node:crypto";
import { sendToManyFcm, buildFcmMessage } from "../src/lib/push/fcm";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const GOOD_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

process.env.FCM_PROJECT_ID = "hiqmah-test";
process.env.FCM_CLIENT_EMAIL = "test@hiqmah-test.iam.gserviceaccount.com";
process.env.FCM_PRIVATE_KEY = GOOD_KEY;

// ── The real response shapes, straight from the FCM HTTP v1 error contract ──

/** OUR fault. Note: no `errorCode` anywhere — only a BadRequest fieldViolation,
 *  and it blames a message field. Identical for every token in the batch. */
const PAYLOAD_400 = {
  error: {
    code: 400,
    status: "INVALID_ARGUMENT",
    message: "Invalid JSON payload",
    details: [
      {
        "@type": "type.googleapis.com/google.rpc.BadRequest",
        fieldViolations: [{ field: "message.notification.body", description: "too long" }],
      },
    ],
  },
};

/** THEIR fault: this one token is malformed. Same status, same code — the only
 *  difference is that the field violation names message.token. */
const BAD_TOKEN_400 = {
  error: {
    code: 400,
    status: "INVALID_ARGUMENT",
    message: "The registration token is not a valid FCM registration token",
    details: [
      {
        "@type": "type.googleapis.com/google.rpc.BadRequest",
        fieldViolations: [{ field: "message.token", description: "invalid" }],
      },
    ],
  },
};

/** App uninstalled / token rotated — the unambiguous dead-device answer. */
const UNREGISTERED_404 = {
  error: {
    code: 404,
    status: "NOT_FOUND",
    message: "Requested entity was not found.",
    details: [
      { "@type": "type.googleapis.com/google.firebase.fcm.v1.FcmError", errorCode: "UNREGISTERED" },
    ],
  },
};

const QUOTA_429 = {
  error: {
    code: 429,
    status: "RESOURCE_EXHAUSTED",
    message: "Quota exceeded",
    details: [
      {
        "@type": "type.googleapis.com/google.firebase.fcm.v1.FcmError",
        errorCode: "QUOTA_EXCEEDED",
      },
    ],
  },
};

type Reply = { status: number; body: unknown };

/** Stub the OAuth exchange and answer each send per the given rule. */
function mockFetch(per: (token: string) => Reply): void {
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    if (String(url).includes("oauth2.googleapis.com")) {
      return new Response(JSON.stringify({ access_token: "stub", expires_in: 3600 }), {
        status: 200,
      });
    }
    const sent = JSON.parse(String(init?.body)) as { message: { token: string } };
    const { status, body } = per(sent.message.token);
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
}

const tokens = (n: number) => Array.from({ length: n }, (_, i) => ({ token: `tok-${i}` }));
const PAYLOAD = { title: "Test", body: "Body", url: "/duas", collapseId: "x-1" };

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail = ""): void {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? `  → ${detail}` : ""}`);
  }
}

console.log("\n[1] Payload-level 400 across a 5-device fleet — THE fleet-wipe case");
mockFetch(() => ({ status: 400, body: PAYLOAD_400 }));
let r = await sendToManyFcm(tokens(5), PAYLOAD);
check("no tokens deleted", r.staleTokens.length === 0, `${r.staleTokens.length} deleted`);
check("but all reported failed", r.failed === 5 && r.sent === 0);

console.log("\n[2] One genuinely dead token among four live ones");
mockFetch((t) => (t === "tok-2" ? { status: 404, body: UNREGISTERED_404 } : { status: 200, body: {} }));
r = await sendToManyFcm(tokens(5), PAYLOAD);
check(
  "exactly the dead one is stale",
  r.staleTokens.length === 1 && r.staleTokens[0] === "tok-2",
  JSON.stringify(r.staleTokens)
);
check("the other four sent", r.sent === 4);

console.log("\n[3] A single malformed token (400 blaming message.token)");
mockFetch(() => ({ status: 400, body: BAD_TOKEN_400 }));
r = await sendToManyFcm(tokens(1), PAYLOAD);
check("that token IS stale", r.staleTokens.length === 1);

console.log("\n[4] Quota exhaustion across the fleet — transient, never stale");
mockFetch(() => ({ status: 429, body: QUOTA_429 }));
r = await sendToManyFcm(tokens(4), PAYLOAD);
check("no tokens deleted", r.staleTokens.length === 0, JSON.stringify(r.staleTokens));

console.log("\n[5] Unusable credentials — must not condemn the fleet");
process.env.FCM_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nnot-a-key\n-----END PRIVATE KEY-----";
r = await sendToManyFcm(tokens(3), PAYLOAD);
check("no tokens deleted", r.staleTokens.length === 0);
check("all failed, with a reason", r.failed === 3 && Boolean(r.results[0].reason));
process.env.FCM_PRIVATE_KEY = GOOD_KEY;

console.log("\n[6] Message shape");
const m = buildFcmMessage("tok", PAYLOAD) as {
  message: {
    url?: string;
    data: Record<string, unknown>;
    android: { ttl: string; notification: { channel_id: string; tag?: string } };
  };
};
check("ttl mirrors the APNs 1h expiry", m.message.android.ttl === "3600s", m.message.android.ttl);
check("posts on our own channel, not Firebase's fallback", m.message.android.notification.channel_id === "hiqmah_push");
check(
  "url rides INSIDE data (Android never sees a top-level url)",
  m.message.data.url === "/duas" && m.message.url === undefined
);
check("collapse id becomes the tag that replaces a shown banner", m.message.android.notification.tag === "x-1");
check("every data value is a string", Object.values(m.message.data).every((v) => typeof v === "string"));

console.log("\n[7] Payload-level 400 to a SINGLE device — no batch to guard it");
mockFetch(() => ({ status: 400, body: PAYLOAD_400 }));
r = await sendToManyFcm(tokens(1), PAYLOAD);
check("token NOT deleted", r.staleTokens.length === 0, JSON.stringify(r.staleTokens));

console.log(
  `\n${failed === 0 ? "ALL PASS" : "FAILURES"} — ${passed} passed, ${failed} failed\n`
);
process.exit(failed === 0 ? 0 : 1);
