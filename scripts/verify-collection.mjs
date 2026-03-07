import fs from "fs";
import path from "path";

const collectionSlug = process.argv[2];
const editionSlug = process.argv[3]; // e.g. "eng-muslim"
if (!collectionSlug || !editionSlug) {
  console.log("Usage: node verify-collection.mjs <slug> <edition>");
  console.log("Example: node verify-collection.mjs muslim eng-muslim");
  process.exit(1);
}

const DIR = `src/data/hadith/${collectionSlug}`;
const metadata = JSON.parse(fs.readFileSync(path.join(DIR, "metadata.json"), "utf-8"));
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Phase 1: Completeness
console.log("=== PHASE 1: COMPLETENESS CHECK ===\n");

let totalHadiths = 0;
let emptyEnglish = 0;
let emptyArabic = 0;

for (const book of metadata.books) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, `${book.id}.json`), "utf-8"));
  totalHadiths += data.length;
  for (const h of data) {
    if (!h.english || h.english.trim() === "") emptyEnglish++;
    if (!h.arabic || h.arabic.trim() === "") emptyArabic++;
  }
}

console.log(`Total hadiths: ${totalHadiths} (expected ${metadata.totalHadiths})`);
console.log(`Empty English: ${emptyEnglish}`);
console.log(`Empty Arabic: ${emptyArabic}`);
console.log(`Books: ${metadata.books.length}`);

// Phase 2: Spot-check against individual API endpoint
console.log("\n=== PHASE 2: SPOT-CHECK 50 HADITHS AGAINST API ===\n");

const allLocal = {};
for (const book of metadata.books) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, `${book.id}.json`), "utf-8"));
  for (const h of data) allLocal[h.id] = h;
}

async function fetchSingle(num) {
  const res = await fetch(
    `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${editionSlug}/${num}.json`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.hadiths?.[0]?.text || null;
}

const ids = Object.keys(allLocal).map(Number).filter(id => {
  const h = allLocal[id];
  return h.english && h.english.trim() !== "";
}).sort((a, b) => a - b);

const step = Math.floor(ids.length / 50);
let matches = 0;
let mismatches = 0;

for (let i = 0; i < 50; i++) {
  const num = ids[i * step];
  const local = allLocal[num];
  const apiText = await fetchSingle(num);
  await delay(80);

  if (!apiText) {
    process.stdout.write(`  #${num}: COULD NOT FETCH\n`);
    continue;
  }

  const localStart = local.english.substring(0, 200).trim();
  const apiStart = apiText.substring(0, 200).trim();

  if (localStart === apiStart) {
    matches++;
    process.stdout.write(`  #${num}: MATCH\n`);
  } else {
    mismatches++;
    console.log(`  #${num}: MISMATCH`);
    console.log(`    Local: ${localStart.substring(0, 100)}...`);
    console.log(`    API:   ${apiStart.substring(0, 100)}...`);
  }
}

console.log(`\nResults: ${matches} matched, ${mismatches} mismatched out of 50`);
console.log(`\n=== TOTAL ISSUES: ${emptyEnglish + emptyArabic + mismatches} ===`);
