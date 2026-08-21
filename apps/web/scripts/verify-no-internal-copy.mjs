#!/usr/bin/env node
/**
 * Fail the build if internal vocabulary reaches a user-facing string.
 *
 * WHY THIS EXISTS. Two notes shipped to production reading "— flagged for
 * founder review." A reader has no idea who the founder is or what a review
 * queue is; to them it is a sentence that stops making sense halfway through,
 * inside religious content where confidence matters most. The underlying point
 * was worth telling them — that a claim is a scholarly summary rather than an
 * established narration — but the routing note was for us, not for them.
 *
 * It happened because content authored for internal triage and content authored
 * for readers live in the same string. There is no reviewer step that reliably
 * catches it, so this is a check rather than a convention.
 *
 * WHAT IT MATCHES. Whole phrases that can only be internal, never single words.
 * "Founder" alone is legitimate — Imam Ahmad founded the Hanbali school, Wasil
 * ibn Ata founded the Mu'tazilah — and a checker that cried wolf on those would
 * be switched off within a week, which is worse than not having one.
 *
 * WHERE IT LOOKS. JSX text nodes and quoted strings in apps/web/src, minus
 * /admin/ (staff-only by construction) and /api/ (never rendered). Code comments
 * are skipped: "today's review queue" in the Hifz code is a real domain term and
 * has nothing to do with this.
 *
 *   node scripts/verify-no-internal-copy.mjs
 */

import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

/** Phrases that cannot be anything but internal. Keep this list precise. */
const FORBIDDEN = [
  /flagged for (the )?founder/i,
  /founder(?:'s)? review/i,
  /for founder review/i,
  /review queue/i,
  /content-review-queue/i,
  /\bTODO\b|\bFIXME\b|\bXXX\b/,
  /lorem ipsum/i,
  /placeholder text/i,
  /\bagent\b (?:will|should|must)/i,
  /needs? (?:scholar )?verification before ship/i,
];

/** Rendered by a staff-only surface, or never rendered at all. */
const SKIP_DIR = ["/admin/", "/api/"];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(p)) out.push(p);
  }
  return out;
}

let failures = 0;

for (const file of walk(SRC)) {
  const rel = relative(SRC, file);
  if (SKIP_DIR.some((d) => `/${rel}`.includes(d))) continue;

  const lines = readFileSync(file, "utf8").split("\n");
  let inBlockComment = false;

  lines.forEach((line, i) => {
    const t = line.trim();
    // Comments are ours to write however we like — the point is what RENDERS.
    if (inBlockComment) {
      if (t.includes("*/")) inBlockComment = false;
      return;
    }
    if (t.startsWith("/*")) {
      if (!t.includes("*/")) inBlockComment = true;
      return;
    }
    if (t.startsWith("//") || t.startsWith("*")) return;

    // Candidate user-visible text: JSX text nodes and quoted strings long
    // enough to be prose rather than a class name or an identifier.
    const candidates = [
      ...(line.match(/>([^<>{}]{8,})</g) || []),
      ...(line.match(/"([^"]{12,})"/g) || []),
      ...(line.match(/`([^`]{12,})`/g) || []),
    ];

    for (const frag of candidates) {
      for (const re of FORBIDDEN) {
        if (re.test(frag)) {
          failures++;
          console.error(`✗ ${rel}:${i + 1}`);
          console.error(`    ${frag.trim().slice(0, 120)}`);
          console.error(`    matched: ${re}`);
          break;
        }
      }
    }
  });
}

if (failures) {
  console.error(
    `\n${failures} user-facing string(s) contain internal vocabulary.\n` +
      `Rewrite for a reader, or move the note to docs/ where it belongs.`
  );
  process.exit(1);
}
console.log("✓ no internal vocabulary in user-facing copy");
