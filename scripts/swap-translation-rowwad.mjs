// Swap the bundled Qur'an English translation Saheeh International → Rowwad
// (QuranEnc english_rwwad), preserving the original by archiving it first.
// Only the `textEn` field of each verse changes. Run: node scripts/swap-translation-rowwad.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("packages/content/quran");
const versesDir = path.join(ROOT, "verses");
const archiveDir = path.join(ROOT, "_archive", "verses-saheeh");
const chapters = JSON.parse(fs.readFileSync(path.join(ROOT, "chapters.json"), "utf8"));
const KEY = "english_rwwad";

async function fetchSura(s) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(`https://quranenc.com/api/v1/translation/sura/${KEY}/${s}`);
      if (!r.ok) throw new Error("status " + r.status);
      const j = await r.json();
      const arr = j.result || [];
      if (!arr.length) throw new Error("empty");
      return arr;
    } catch (e) {
      if (attempt === 3) throw new Error(`surah ${s}: ${e.message}`);
      await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
    }
  }
}

// 1. Archive the current (Saheeh) verses ONCE — never overwrite an existing backup.
if (fs.existsSync(path.join(archiveDir, "1.json"))) {
  console.log("archive already exists → preserving original Saheeh backup (no re-archive)");
} else {
  fs.mkdirSync(archiveDir, { recursive: true });
  for (let s = 1; s <= 114; s++) {
    fs.copyFileSync(path.join(versesDir, `${s}.json`), path.join(archiveDir, `${s}.json`));
  }
  console.log("✓ archived current Saheeh verses → packages/content/quran/_archive/verses-saheeh/");
}

// 2. Fetch Rowwad + overwrite textEn.
const errors = [];
let updated = 0;
for (let s = 1; s <= 114; s++) {
  const arr = await fetchSura(s);
  const expected = chapters[s - 1].verses;
  if (arr.length !== expected) errors.push(`surah ${s}: fetched ${arr.length} != expected ${expected}`);
  const map = {};
  // Strip inline footnote reference markers like [143] (we don't render footnotes) → clean translation.
  for (const row of arr)
    map[Number(row.aya)] = String(row.translation).replace(/\[\d+\]/g, "").replace(/\s{2,}/g, " ").trim();

  const file = path.join(versesDir, `${s}.json`);
  const verses = JSON.parse(fs.readFileSync(file, "utf8"));
  if (verses.length !== expected) errors.push(`surah ${s}: local ${verses.length} != expected ${expected}`);
  for (const v of verses) {
    const t = map[v.number];
    if (t == null || String(t).trim() === "") {
      errors.push(`missing translation ${s}:${v.number}`);
      continue;
    }
    v.textEn = t;
    updated++;
  }
  fs.writeFileSync(file, JSON.stringify(verses));
  process.stdout.write(`\r  fetching ${s}/114`);
}
console.log();

// 3. Verify.
if (updated !== 6236) errors.push(`updated ${updated} ayahs (expected 6236)`);
const v1 = JSON.parse(fs.readFileSync(path.join(versesDir, "1.json"), "utf8"));
const v2 = JSON.parse(fs.readFileSync(path.join(versesDir, "2.json"), "utf8"));
const v112 = JSON.parse(fs.readFileSync(path.join(versesDir, "112.json"), "utf8"));
console.log("landmark 1:1   →", v1[0].textEn);
console.log("landmark 2:255 →", (v2.find((v) => v.number === 255) || {}).textEn?.slice(0, 80) + "…");
console.log("landmark 112:1 →", v112[0].textEn);

if (errors.length) {
  console.error("\nVERIFY FAILED:\n" + errors.slice(0, 25).join("\n"));
  process.exit(1);
}
console.log(`\n✓ Translation → Rowwad: ${updated} ayahs updated, 0 mismatches.`);
