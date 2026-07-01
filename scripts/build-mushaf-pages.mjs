// Build packages/content/quran/pages.json — the 604 Madani mushaf page → ayah
// boundaries — derived from the bundled verse data (each verse already carries
// its `page` and `juz`). No network needed. Run: node scripts/build-mushaf-pages.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("packages/content/quran");
const versesDir = path.join(ROOT, "verses");

/** page -> { p, s, a, es, ea, j } (start surah/ayah, end surah/ayah, juz of start) */
const pagesMap = new Map();

for (let surah = 1; surah <= 114; surah++) {
  const file = path.join(versesDir, `${surah}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const v of arr) {
    const [s, a] = String(v.key).split(":").map(Number);
    const pg = v.page;
    if (pg == null) throw new Error(`verse ${v.key} missing page`);
    if (!pagesMap.has(pg)) {
      pagesMap.set(pg, { p: pg, s, a, es: s, ea: a, j: v.juz });
    }
    const rec = pagesMap.get(pg);
    // Iteration is in mushaf order, so the last verse seen on a page is its end.
    rec.es = s;
    rec.ea = a;
  }
}

const pages = [...pagesMap.values()].sort((x, y) => x.p - y.p);

// ── Verify ──
const errors = [];
if (pages.length !== 604) errors.push(`expected 604 pages, got ${pages.length}`);
for (let i = 0; i < pages.length; i++) {
  if (pages[i].p !== i + 1) errors.push(`page ${i + 1} out of order (got ${pages[i].p})`);
}
const first = pages[0];
const last = pages[pages.length - 1];
if (!(first.p === 1 && first.s === 1 && first.a === 1 && first.es === 1 && first.ea === 7))
  errors.push(`page 1 should be 1:1–1:7, got ${JSON.stringify(first)}`);
if (!(last.es === 114 && last.ea === 6))
  errors.push(`last page should end 114:6, got ${JSON.stringify(last)}`);

if (errors.length) {
  console.error("VERIFY FAILED:\n" + errors.join("\n"));
  process.exit(1);
}

fs.writeFileSync(path.join(ROOT, "pages.json"), JSON.stringify(pages));
console.log(
  `✓ pages.json: ${pages.length} pages | page1 ${first.s}:${first.a}–${first.es}:${first.ea} (juz ${first.j}) | page604 ${last.s}:${last.a}–${last.es}:${last.ea} (juz ${last.j})`
);
