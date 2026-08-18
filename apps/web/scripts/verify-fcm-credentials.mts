/**
 * Prove the FCM server credentials actually work — without pushing to anyone.
 *
 *   npm run verify:fcm-creds                     # credentials only
 *   npm run verify:fcm-creds -- --token <FCM>    # + is this device reachable?
 *   npm run verify:fcm-creds -- --token <FCM> --send   # actually deliver one
 *
 * Reads FCM_PROJECT_ID / FCM_CLIENT_EMAIL / FCM_PRIVATE_KEY from the environment,
 * falling back to apps/web/.env.local (`vercel env pull` writes that file).
 *
 * WHY IT EXISTS
 *
 * A wrong service-account key does not fail loudly. Google answers the token
 * exchange with `invalid_grant`, our sender reports ok:false, and the route
 * still returns HTTP 200 with a cheerful summary — so a mistyped env var looks
 * exactly like "nobody happened to be due a push". The only symptom is silence,
 * which is also what correct-but-idle looks like.
 *
 * The trick that makes this safe: FCM HTTP v1 accepts `validate_only: true`,
 * which runs the ENTIRE request — auth, project resolution, payload validation,
 * token lookup — and then discards it instead of delivering. So a probe against
 * a deliberately fake token still proves the credentials, because the ERROR WE
 * GET BACK tells us how far the request got:
 *
 *   401 / 403                 -> credentials rejected. The key is wrong.
 *   400 blaming message.token -> auth SUCCEEDED; only our fake token was bad.
 *   404 UNREGISTERED          -> auth SUCCEEDED; token well-formed but unknown.
 *
 * Reaching a token-level complaint is therefore a PASS: you cannot be told your
 * token is bad by a project you failed to authenticate against.
 */

import { readFileSync } from "node:fs";
import { createPrivateKey, sign } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Minimal .env parser — avoids a dependency for a script run by hand. */
function loadEnvLocal(): void {
  for (const name of [".env.local", ".env"]) {
    let raw: string;
    try {
      raw = readFileSync(resolve(HERE, "..", name), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split("\n")) {
      const m = /^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!m) continue;
      const [, key, rawValue] = m;
      if (process.env[key] !== undefined) continue; // real env wins
      let value = rawValue.trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const argv = process.argv.slice(2);
const tokenArg = argv.includes("--token") ? argv[argv.indexOf("--token") + 1] : undefined;
const reallySend = argv.includes("--send");

const projectId = process.env.FCM_PROJECT_ID;
const clientEmail = process.env.FCM_CLIENT_EMAIL;
const rawKey = process.env.FCM_PRIVATE_KEY;

function die(msg: string): never {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

console.log("\nFCM credential check");
console.log("────────────────────");
for (const [label, value] of [
  ["FCM_PROJECT_ID", projectId],
  ["FCM_CLIENT_EMAIL", clientEmail],
  ["FCM_PRIVATE_KEY", rawKey && `${rawKey.slice(0, 28).replace(/\n/g, "")}… (${rawKey.length} chars)`],
] as const) {
  console.log(`  ${value ? "✓" : "✗"} ${label}${value ? `  ${label === "FCM_PRIVATE_KEY" ? value : value}` : "  MISSING"}`);
}
if (!projectId || !clientEmail || !rawKey) {
  die("Set all three (or run `vercel env pull` in apps/web to fetch them).");
}

// ── 1. Token exchange — this is what a wrong key fails ──────────────────────
const OAUTH = "https://oauth2.googleapis.com/token";
const now = Math.floor(Date.now() / 1000);
const b64 = (i: string) =>
  Buffer.from(i).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const head = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
const claims = b64(
  JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: OAUTH,
    iat: now,
    exp: now + 3600,
  })
);
// Accept both forms the key can arrive in: literal \n escapes (copied straight
// out of the JSON) and real newlines. Same tolerance as lib/push/fcm.ts.
const pem = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;
let assertion: string;
try {
  // base64url of the RAW signature bytes. Note this signs to a Buffer and
  // base64s it directly — round-tripping through a binary string first would
  // corrupt it, and Google would reject the result as invalid_grant with no
  // hint that the signature, rather than the key, was at fault.
  const sig = sign("sha256", Buffer.from(`${head}.${claims}`), createPrivateKey(pem));
  assertion = `${head}.${claims}.${sig
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")}`;
} catch (e) {
  die(
    `FCM_PRIVATE_KEY is not a readable PEM (${e instanceof Error ? e.message : e}).\n` +
      `  Copy the whole private_key value, including the BEGIN/END lines.`
  );
}

console.log("\n[1] Exchanging the service-account key for an access token…");
const authRes = await fetch(OAUTH, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  }),
});
const authJson = (await authRes.json().catch(() => null)) as {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
} | null;

if (!authRes.ok || !authJson?.access_token) {
  const why = authJson?.error_description || authJson?.error || `HTTP ${authRes.status}`;
  die(
    `Google rejected the credentials: ${why}\n` +
      `  "invalid_grant" almost always means the private key is truncated or\n` +
      `  belongs to a different project than FCM_PROJECT_ID.`
  );
}
console.log(`  ✓ access token issued (expires in ${authJson.expires_in ?? "?"}s)`);

// ── 2. Probe the send endpoint. validate_only => nothing is delivered ───────
const FAKE = "cVerifyFakeToken:APA91bF_this_token_does_not_exist_and_is_never_delivered";
const target = tokenArg ?? FAKE;
const label = tokenArg ? "your device token" : "a deliberately fake token";
console.log(
  `\n[2] Probing messages:send against ${label}` +
    (reallySend && tokenArg ? " — REAL SEND" : " (validate_only: nothing is delivered)") +
    "…"
);

const body = {
  ...(reallySend && tokenArg ? {} : { validate_only: true }),
  message: {
    token: target,
    notification: { title: "Hiqmah", body: "Push is configured correctly." },
    data: { url: "/" },
    android: { priority: "high", ttl: "3600s", notification: { channel_id: "hiqmah_push", sound: "default" } },
  },
};

const sendRes = await fetch(
  `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/messages:send`,
  {
    method: "POST",
    headers: { authorization: `Bearer ${authJson.access_token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  }
);
const sendJson = (await sendRes.json().catch(() => null)) as {
  name?: string;
  error?: {
    status?: string;
    message?: string;
    details?: Array<{ errorCode?: string; fieldViolations?: Array<{ field?: string }> }>;
  };
} | null;

const errorCode = sendJson?.error?.details?.find((d) => d?.errorCode)?.errorCode;
const badFields = (sendJson?.error?.details ?? []).flatMap((d) => d?.fieldViolations ?? []).map((v) => v?.field);

if (sendRes.status === 200) {
  console.log(`  ✓ accepted${sendJson?.name ? ` (${sendJson.name})` : ""}`);
  console.log(
    reallySend && tokenArg
      ? "\n✅ DELIVERED — check the device.\n"
      : "\n✅ CREDENTIALS GOOD — project, key and payload all validate.\n"
  );
  process.exit(0);
}

if (sendRes.status === 401 || sendRes.status === 403) {
  die(
    `Authenticated with Google but FCM refused the project (HTTP ${sendRes.status}, ${errorCode ?? sendJson?.error?.status}).\n` +
      `  Usually: Firebase Cloud Messaging API disabled, or the service account\n` +
      `  lacks the Firebase Messaging Sender role.`
  );
}

// A complaint about the TOKEN means auth + project resolution both succeeded.
const tokenBlamed = errorCode === "UNREGISTERED" || badFields.includes("message.token");
if (tokenBlamed && !tokenArg) {
  console.log(`  ✓ FCM rejected only the fake token (${errorCode ?? "message.token"}) — as designed`);
  console.log("\n✅ CREDENTIALS GOOD — a project you failed to authenticate against");
  console.log("   could not have told you your token was bad.\n");
  process.exit(0);
}
if (tokenBlamed && tokenArg) {
  die(
    `Credentials are GOOD, but that device token is not valid (${errorCode ?? "message.token"}).\n` +
      `  Re-copy it from the device — tokens rotate on reinstall.`
  );
}

die(
  `Unexpected response (HTTP ${sendRes.status}): ${sendJson?.error?.status ?? ""} ${
    sendJson?.error?.message ?? ""
  }${badFields.length ? `\n  fields: ${badFields.join(", ")}` : ""}`
);
