// Guardrail test for the collection-authority prior (COLLECTION_AUTHORITY in
// apps/web/src/lib/search/hadith.ts).
//
// WHAT IT PROTECTS: the prior is a TIE-BREAKER, not a filter. It exists so that
// two comparably-relevant narrations resolve toward the more rigorously
// authenticated collection — and it must NEVER promote a marginal Bukhari or
// Muslim hadith over a topically-correct one from the sunan. That property is
// invisible in aggregate hit@1/hit@5 numbers (a prior ten times too large still
// scores well on a gold set whose answers happen to be in the Sahihayn), so it
// gets its own assertions here.
//
// Run:  node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/verify-search-prior.mjs
// (the flag only silences Node's notice that apps/web is not "type": "module";
// the script runs fine without it). Exits non-zero on the first failed
// assertion.
//
// WHY THE RESOLVE HOOK BELOW: the search layer is TypeScript that Next compiles,
// so its relative imports are extensionless ("./bm25"). Node strips types fine
// but will not guess the extension, so a ~20-line stdlib resolve hook is all it
// takes to run the SHIPPED files unmodified. The alternative — copying them
// somewhere and rewriting the specifiers — would test a copy, not the code.

import assert from "node:assert/strict";
import { register } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEARCH_DIR = path.join(ROOT, "apps/web/src/lib/search");

// CONTENT_ROOT probes relative to cwd — pin it to the repo root so this script
// works from anywhere.
process.chdir(ROOT);

register(
  "data:text/javascript," +
    encodeURIComponent(`
      import { existsSync } from "node:fs";
      import { fileURLToPath } from "node:url";
      export async function resolve(specifier, context, next) {
        if (specifier.startsWith(".") && !/\\.[a-z]+$/.test(specifier)) {
          const url = new URL(specifier + ".ts", context.parentURL);
          if (existsSync(fileURLToPath(url))) return { url: url.href, shortCircuit: true };
        }
        return next(specifier, context);
      }
    `),
  import.meta.url
);

const { searchHadiths, COLLECTION_AUTHORITY } = await import(
  pathToFileURL(path.join(SEARCH_DIR, "hadith.ts")).href
);

if (!existsSync(path.join(ROOT, "packages/content/hadith/search-index.json"))) {
  console.error("search-index.json is missing — run `pnpm build:search-index` first.");
  process.exit(1);
}

const SAHIHAYN = new Set(["bukhari", "muslim"]);
const pct = (a, b) => ((a - b) / b) * 100;
let checks = 0;
const ok = (label, extra = "") => {
  checks++;
  console.log(`  ok  ${label}${extra ? "  — " + extra : ""}`);
};

console.log("\nCollection-authority prior — guardrails\n");

// ── 1. A clearly-more-relevant sunan hadith still wins outright ────────────
// The wiping-over-khuff narrations live in the sunan; the nearest Bukhari hit
// is a different topic that merely shares vocabulary. The prior must not move
// it, and the sunan must not lose a single one of the top five slots.
{
  const results = searchHadiths(
    "can i wipe over my leather socks instead of washing my feet during wudu",
    undefined,
    20
  );
  const top5 = results.slice(0, 5);
  assert.ok(top5.length === 5, "expected 5 results");
  assert.ok(
    top5.every((r) => !SAHIHAYN.has(r.collection)),
    `a Sahihayn hadith took a top-5 slot: ${top5.map((r) => r.reference).join(", ")}`
  );
  const firstSahih = results.find((r) => SAHIHAYN.has(r.collection));
  assert.ok(firstSahih, "expected a Sahihayn hit somewhere in the top 20");
  const lead = pct(results[0].score, firstSahih.score);
  assert.ok(lead > 25, `sunan lead collapsed to ${lead.toFixed(1)}%`);
  ok(
    "topically-correct sunan keeps all 5 top slots",
    `${results[0].reference} ${results[0].score.toFixed(2)} leads ${firstSahih.reference} by ${lead.toFixed(1)}%`
  );
}

// ── 2. A big relevance gap is never closed by the prior ────────────────────
{
  const results = searchHadiths(
    "is it permissible to recite ruqyah for the evil eye",
    undefined,
    20
  );
  const firstSahih = results.find((r) => SAHIHAYN.has(r.collection));
  assert.ok(!SAHIHAYN.has(results[0].collection), "top hit should be a sunan narration");
  assert.ok(firstSahih, "expected a Sahihayn hit in the top 20");
  const lead = pct(results[0].score, firstSahih.score);
  assert.ok(lead > 50, `sunan lead collapsed to ${lead.toFixed(1)}%`);
  ok(
    "a large relevance gap survives the prior",
    `${results[0].reference} leads ${firstSahih.reference} by ${lead.toFixed(1)}%`
  );
}

// ── 3. The prior DOES break a genuine near-tie ─────────────────────────────
// This is the one gold-set query the prior improves: Tirmidhi trailed Musnad
// Ahmad by 1.4% on raw BM25, which is inside the tie-break band.
{
  const results = searchHadiths(
    "the prophet said he was ordered to fight people until they say there is no god but allah",
    undefined,
    5
  );
  assert.equal(
    results[0].collection,
    "tirmidhi",
    `expected the Tirmidhi narration on top, got ${results[0].reference}`
  );
  ok("a near-tie resolves toward the stronger collection", `${results[0].reference} now rank 1`);
}

// ── 4. The prior stays inside its band ─────────────────────────────────────
// The spread between the strongest and weakest weight IS the maximum relevance
// gap the prior can overturn. Assertions 1-3 are behavioural and only sample a
// few queries; this one bounds the mechanism itself, so a prior that grows into
// a collection filter fails here rather than silently reordering the corpus.
{
  const weights = Object.values(COLLECTION_AUTHORITY);
  assert.ok(weights.length === 7, `expected 7 collections, got ${weights.length}`);
  const spread = Math.max(...weights) / Math.min(...weights);
  assert.ok(spread <= 1.05, `authority spread ${spread.toFixed(3)}x exceeds the tie-break band`);
  assert.equal(COLLECTION_AUTHORITY.ahmad, 1, "Musnad Ahmad must stay the 1.0 baseline");
  assert.ok(
    COLLECTION_AUTHORITY.bukhari === COLLECTION_AUTHORITY.muslim &&
      COLLECTION_AUTHORITY.bukhari > COLLECTION_AUTHORITY.tirmidhi &&
      COLLECTION_AUTHORITY.tirmidhi > COLLECTION_AUTHORITY.ahmad,
    "expected three tiers: Sahihayn > the four Sunan > Musnad Ahmad"
  );
  ok(
    "prior stays a tie-break, not a filter",
    `max relevance gap it can overturn = ${((spread - 1) * 100).toFixed(1)}%`
  );
}

// ── 5. HONEST NEGATIVE — what the prior does NOT fix ───────────────────────
// "hadith about intention" is one term after stop-words, so BM25 rightly
// prefers a short hadith that repeats it over bukhari 1:1 (tf=1 in 23 tokens).
// Closing that needs ~1.49x, far outside a tie-break. This asserts the CURRENT,
// honest behaviour: if a future change claims to fix it, this must be updated
// deliberately rather than the claim quietly drifting.
{
  const results = searchHadiths("hadith about intention", undefined, 200);
  const rank = results.findIndex((r) => r.reference === "bukhari 1:1") + 1;
  assert.ok(rank > 5, `bukhari 1:1 unexpectedly reached rank ${rank} — update this test`);
  // The multi-angle search is what actually recovers it.
  const rescue = searchHadiths(
    "the reward of deeds depends upon the intentions",
    undefined,
    5
  );
  assert.equal(rescue[0].reference, "bukhari 1:1");
  ok(
    "documented limit: the prior does NOT rescue bukhari 1:1 from a one-term query",
    `rank ${rank}/${results.length}; the paraphrase angle returns it at rank 1`
  );
}

console.log(`\n${checks} checks passed\n`);
