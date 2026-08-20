#!/usr/bin/env node
/**
 * Fail a build that would ship the DEV backend to real users.
 *
 * WHY THIS EXISTS. `pnpm build:mobile` reads .env.local, which is the DEV
 * Supabase project; only `build:mobile:prod` sources .env.prod. Nothing in the
 * chain — next build, cap sync, gradlew bundleRelease, xcodebuild archive —
 * objects if the wrong one ends up in a release artifact, and the app looks
 * completely healthy when it happens: it launches, it signs in, it writes data.
 * It just writes it to the wrong database, and every account a user creates
 * lands somewhere that will never be promoted.
 *
 * That is exactly what a signed release AAB on this machine contained on
 * 2026-08-19 while being described as ready to upload. The only reason it was
 * caught is that a test build pointed at dev could not see a prod account, and
 * the "missing" account was chased down. Silence is the defect this closes.
 *
 * Usage:
 *   node scripts/verify-bundle-env.mjs <path> [...more paths]
 *
 * <path> may be a directory (scanned recursively) or a .aab/.apk/.ipa/.zip
 * (extracted to a temp dir with `unzip` first, so the check covers the artifact
 * that actually ships rather than the inputs someone hopes went into it).
 *
 * Exit 0 only when EVERY Supabase project reference found is the production one
 * AND at least one was found. Finding none is a FAILURE, not a pass: a bundle
 * with no backend URL means the scan looked in the wrong place, and a guard
 * that green-lights an empty scan is worse than no guard at all.
 */

import { readFileSync, readdirSync, statSync, mkdtempSync, rmSync } from "node:fs";
import { join, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = resolve(HERE, "..");

/** Any Supabase project ref, so an unknown third project is caught too. */
const SUPABASE_RE = /https:\/\/([a-z0-9]{15,})\.supabase\.co/g;

/** Text-ish files worth scanning. Anything else in a web bundle is an asset. */
const SCANNABLE = new Set([".js", ".mjs", ".cjs", ".html", ".json", ".txt", ".map", ".css"]);

function readEnvUrl(file) {
  try {
    const raw = readFileSync(join(WEB_ROOT, file), "utf8");
    const m = raw.match(/^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?(\S+?)["']?\s*$/m);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue; // broken symlink — nothing to scan
    }
    if (st.isDirectory()) walk(p, out);
    else if (SCANNABLE.has(extname(p))) out.push(p);
  }
  return out;
}

/** Archives are scanned by extracting them: the JS inside is deflated, so a raw
 *  byte search over the .aab would miss the URL entirely and "pass". */
function materialise(target) {
  const st = statSync(target);
  if (st.isDirectory()) return { dir: target, cleanup: () => {} };
  const tmp = mkdtempSync(join(tmpdir(), "bundle-env-"));
  execFileSync("unzip", ["-qq", "-o", target, "-d", tmp], { stdio: "pipe" });
  return { dir: tmp, cleanup: () => rmSync(tmp, { recursive: true, force: true }) };
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("verify-bundle-env: no path given");
  process.exit(2);
}

const PROD = readEnvUrl(".env.prod");
const DEV = readEnvUrl(".env.local");
if (!PROD) {
  // Fail closed. Without .env.prod there is no definition of "correct", and
  // guessing one would defeat the point of the check.
  console.error("verify-bundle-env: cannot read NEXT_PUBLIC_SUPABASE_URL from apps/web/.env.prod");
  process.exit(2);
}
const prodRef = PROD.match(SUPABASE_RE.source)?.[1] ?? PROD;

let failed = false;

for (const target of targets) {
  let mat;
  try {
    mat = materialise(target);
  } catch (err) {
    console.error(`verify-bundle-env: cannot read ${target} — ${err.message}`);
    process.exit(2);
  }

  const found = new Map(); // url -> example file
  for (const file of walk(mat.dir)) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(SUPABASE_RE)) {
      if (!found.has(m[0])) found.set(m[0], file.replace(mat.dir, "").replace(/^\//, ""));
    }
  }
  mat.cleanup();

  const label = target.replace(WEB_ROOT + "/", "");
  if (found.size === 0) {
    console.error(`✗ ${label}\n    no Supabase URL found at all — the scan almost certainly looked in the wrong place.`);
    failed = true;
    continue;
  }
  const wrong = [...found.entries()].filter(([url]) => url !== PROD);
  if (wrong.length > 0) {
    console.error(`✗ ${label}`);
    for (const [url, where] of wrong) {
      const which = DEV && url === DEV ? " ← THIS IS THE DEV PROJECT" : "";
      console.error(`    ${url}${which}\n      first seen in: ${where}`);
    }
    console.error(`    expected only: ${PROD}`);
    console.error(`    Rebuild with:  pnpm mobile:build:prod && npx cap sync`);
    failed = true;
  } else {
    console.log(`✓ ${label} — production backend (${prodRef})`);
  }
}

process.exit(failed ? 1 : 0);
