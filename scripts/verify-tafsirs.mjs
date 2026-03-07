import fs from "fs";
import path from "path";

const chapters = JSON.parse(
  fs.readFileSync("src/data/quran/chapters.json", "utf-8")
);

const TAFSIRS = ["ibn-kathir", "maarif"];
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Phase 1: Completeness check
console.log("=== PHASE 1: COMPLETENESS CHECK ===\n");

let totalIssues = 0;
for (const tafsir of TAFSIRS) {
  let totalVerses = 0;
  let missingVerses = 0;
  let emptyVerses = 0;
  const missingDetails = [];

  for (const ch of chapters) {
    const filePath = path.join("src/data/quran/tafsirs", tafsir, `${ch.id}.json`);
    if (!fs.existsSync(filePath)) {
      missingDetails.push(`  Surah ${ch.id} (${ch.name}): FILE MISSING`);
      totalIssues++;
      continue;
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const keys = Object.keys(data);

    for (let v = 1; v <= ch.verses; v++) {
      totalVerses++;
      if (!data[String(v)]) {
        missingVerses++;
        missingDetails.push(`  Surah ${ch.id}:${v} — missing`);
      } else if (data[String(v)].trim().length === 0) {
        emptyVerses++;
        missingDetails.push(`  Surah ${ch.id}:${v} — empty`);
      }
    }
  }

  console.log(`${tafsir}:`);
  console.log(`  Total verses expected: ${totalVerses}`);
  console.log(`  Missing: ${missingVerses}`);
  console.log(`  Empty: ${emptyVerses}`);
  if (missingDetails.length > 0 && missingDetails.length <= 20) {
    console.log("  Details:");
    missingDetails.forEach((d) => console.log(d));
  } else if (missingDetails.length > 20) {
    console.log(`  (${missingDetails.length} issues — showing first 20)`);
    missingDetails.slice(0, 20).forEach((d) => console.log(d));
  }
  totalIssues += missingVerses + emptyVerses;
  console.log("");
}

// Phase 2: Spot-check well-known verses against live API
console.log("=== PHASE 2: SPOT-CHECK WELL-KNOWN VERSES ===\n");

const WELL_KNOWN = [
  { key: "1:1", desc: "Al-Fatihah opening" },
  { key: "2:255", desc: "Ayat al-Kursi" },
  { key: "2:286", desc: "Last verse of Al-Baqarah" },
  { key: "36:1", desc: "Ya-Sin opening" },
  { key: "55:13", desc: "Ar-Rahman refrain" },
  { key: "112:1", desc: "Al-Ikhlas opening" },
  { key: "114:6", desc: "An-Nas last verse" },
  { key: "3:185", desc: "Every soul shall taste death" },
  { key: "24:35", desc: "Light verse (An-Nur)" },
  { key: "18:10", desc: "People of the Cave" },
];

async function fetchLiveTafsir(tafsirId, verseKey) {
  const res = await fetch(
    `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}?locale=en`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const text = (data.tafsir?.text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

for (const verse of WELL_KNOWN) {
  const [ch, v] = verse.key.split(":");

  for (const tafsir of TAFSIRS) {
    const tafsirId = tafsir === "ibn-kathir" ? 169 : 168;
    const localData = JSON.parse(
      fs.readFileSync(
        path.join("src/data/quran/tafsirs", tafsir, `${ch}.json`),
        "utf-8"
      )
    );
    const localText = localData[v] || "";
    const liveText = await fetchLiveTafsir(tafsirId, verse.key);
    await delay(150);

    if (!liveText) {
      console.log(`${verse.key} (${tafsir}): COULD NOT FETCH LIVE`);
      continue;
    }

    // Compare first 200 chars
    const localStart = localText.substring(0, 200);
    const liveStart = liveText.substring(0, 200);

    if (localStart === liveStart) {
      console.log(`${verse.key} (${tafsir}): MATCH ✓`);
    } else {
      console.log(`${verse.key} (${tafsir}): MISMATCH ✗`);
      console.log(`  Local: ${localStart.substring(0, 100)}...`);
      console.log(`  Live:  ${liveStart.substring(0, 100)}...`);
      totalIssues++;
    }
  }
}

// Phase 3: 50 random verse checks
console.log("\n=== PHASE 3: 50 RANDOM VERSE CHECKS ===\n");

const allVerseKeys = [];
for (const ch of chapters) {
  for (let v = 1; v <= ch.verses; v++) {
    allVerseKeys.push(`${ch.id}:${v}`);
  }
}

// Deterministic random selection spread across the Quran
const step = Math.floor(allVerseKeys.length / 50);
const randomVerses = [];
for (let i = 0; i < 50; i++) {
  randomVerses.push(allVerseKeys[i * step]);
}

let matches = 0;
let mismatches = 0;

for (const verseKey of randomVerses) {
  const [ch, v] = verseKey.split(":");
  // Alternate between tafsirs
  const tafsir = matches % 2 === 0 ? "ibn-kathir" : "maarif";
  const tafsirId = tafsir === "ibn-kathir" ? 169 : 168;

  const localData = JSON.parse(
    fs.readFileSync(
      path.join("src/data/quran/tafsirs", tafsir, `${ch}.json`),
      "utf-8"
    )
  );
  const localText = localData[v] || "";
  const liveText = await fetchLiveTafsir(tafsirId, verseKey);
  await delay(150);

  if (!liveText) {
    console.log(`  ${verseKey} (${tafsir}): COULD NOT FETCH`);
    continue;
  }

  const localStart = localText.substring(0, 200);
  const liveStart = liveText.substring(0, 200);

  if (localStart === liveStart) {
    matches++;
    process.stdout.write(`  ${verseKey} (${tafsir}): ✓\n`);
  } else {
    mismatches++;
    console.log(`  ${verseKey} (${tafsir}): MISMATCH ✗`);
    console.log(`    Local: ${localStart.substring(0, 80)}...`);
    console.log(`    Live:  ${liveStart.substring(0, 80)}...`);
    totalIssues++;
  }
}

console.log(`\nRandom checks: ${matches} matched, ${mismatches} mismatched out of 50`);
console.log(`\n=== TOTAL ISSUES: ${totalIssues} ===`);
