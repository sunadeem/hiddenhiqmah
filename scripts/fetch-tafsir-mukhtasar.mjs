// Fetch the English "Al-Mukhtaṣar fī al-Tafsīr" (QuranEnc english_mokhtasar) into
// packages/content/quran/tafsirs/mukhtasar/{1-114}.json — same {ayah: text} shape
// as the existing ibn-kathir/maarif (which are left untouched). Run:
// node scripts/fetch-tafsir-mukhtasar.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("packages/content/quran");
const outDir = path.join(ROOT, "tafsirs", "mukhtasar");
const chapters = JSON.parse(fs.readFileSync(path.join(ROOT, "chapters.json"), "utf8"));
const KEY = "english_mokhtasar";

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

function clean(translation, footnotes) {
  // Drop the leading ayah/range number prefix ("1. " / "1-5. ") and inline [n] markers.
  let txt = String(translation || "")
    .replace(/^\s*[\d\-–]+\.\s*/, "")
    .replace(/\[\d+\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const fn = String(footnotes || "").replace(/\[\d+\]/g, "").trim();
  if (fn) txt += "\n\n" + fn;
  return txt;
}

fs.mkdirSync(outDir, { recursive: true });
const errors = [];
let total = 0;
for (let s = 1; s <= 114; s++) {
  const arr = await fetchSura(s);
  const expected = chapters[s - 1].verses;
  const obj = {};
  for (const row of arr) {
    const t = clean(row.translation, row.footnotes);
    if (!t) errors.push(`empty tafsir ${s}:${row.aya}`);
    obj[String(row.aya)] = t;
  }
  const have = Object.keys(obj).length;
  if (have !== expected) errors.push(`surah ${s}: ${have} entries != ${expected} ayahs`);
  fs.writeFileSync(path.join(outDir, `${s}.json`), JSON.stringify(obj));
  total += have;
  process.stdout.write(`\r  fetching ${s}/114`);
}
console.log();

const s1 = JSON.parse(fs.readFileSync(path.join(outDir, "1.json"), "utf8"));
console.log("sample 1:1 →", s1["1"].slice(0, 120) + "…");
if (errors.length) {
  console.error("\nVERIFY FAILED:\n" + errors.slice(0, 25).join("\n"));
  process.exit(1);
}
console.log(`\n✓ Al-Mukhtaṣar tafsir written: ${total} entries across 114 surahs, 0 gaps.`);
