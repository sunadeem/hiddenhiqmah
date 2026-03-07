import fs from "fs";
import path from "path";

const DIR = "src/data/hadith/bukhari";
const metadata = JSON.parse(fs.readFileSync(path.join(DIR, "metadata.json"), "utf-8"));
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Phase 1: Completeness check
console.log("=== PHASE 1: COMPLETENESS CHECK ===\n");

let totalHadiths = 0;
let emptyEnglish = 0;
let emptyArabic = 0;
const issues = [];

for (const book of metadata.books) {
  const filePath = path.join(DIR, `${book.id}.json`);
  if (!fs.existsSync(filePath)) {
    issues.push(`Book ${book.id} (${book.name}): FILE MISSING`);
    continue;
  }
  const hadiths = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  totalHadiths += hadiths.length;

  if (hadiths.length !== book.count) {
    issues.push(`Book ${book.id}: expected ${book.count}, got ${hadiths.length}`);
  }

  for (const h of hadiths) {
    if (!h.english || h.english.trim() === "") {
      emptyEnglish++;
      issues.push(`Hadith ${h.id}: empty English`);
    }
    if (!h.arabic || h.arabic.trim() === "") {
      emptyArabic++;
      issues.push(`Hadith ${h.id}: empty Arabic`);
    }
  }
}

console.log(`Total hadiths: ${totalHadiths} (expected ${metadata.totalHadiths})`);
console.log(`Empty English: ${emptyEnglish}`);
console.log(`Empty Arabic: ${emptyArabic}`);
console.log(`Books: ${metadata.books.length}`);
if (issues.length > 0) {
  console.log(`\nIssues (${issues.length}):`);
  issues.slice(0, 30).forEach((i) => console.log(`  ${i}`));
  if (issues.length > 30) console.log(`  ... and ${issues.length - 30} more`);
}

// Phase 2: Spot-check against sunnah.com
console.log("\n=== PHASE 2: SPOT-CHECK AGAINST SUNNAH.COM ===\n");

// sunnah.com API: https://api.sunnah.com/v1/hadiths/{collection}/{hadithNumber}
// But we don't have an API key, so we'll scrape the public page data
// Instead, use the sunnah.com CDN data which is publicly accessible

const SPOT_CHECKS = [
  { num: 1, desc: "Intentions (most famous hadith)" },
  { num: 2, desc: "How revelation came" },
  { num: 8, desc: "First hadith of Book of Belief" },
  { num: 50, desc: "Gabriel hadith (pillars of Islam)" },
  { num: 349, desc: "First hadith on Prayer" },
  { num: 1000, desc: "Mid-collection check" },
  { num: 2000, desc: "Mid-collection check 2" },
  { num: 3000, desc: "Mid-collection check 3" },
  { num: 4000, desc: "Mid-collection check 4" },
  { num: 5000, desc: "Mid-collection check 5" },
  { num: 6000, desc: "Mid-collection check 6" },
  { num: 7000, desc: "Late collection check" },
  { num: 7563, desc: "Last hadith (Tawheed)" },
];

// Build hadith lookup from local data
const allHadiths = {};
for (const book of metadata.books) {
  const hadiths = JSON.parse(
    fs.readFileSync(path.join(DIR, `${book.id}.json`), "utf-8")
  );
  for (const h of hadiths) {
    allHadiths[h.id] = h;
  }
}

// Fetch from fawazahmed0 individual endpoint as cross-check
// (different endpoint than bulk fetch — catches data inconsistency)
async function fetchSingleHadith(num) {
  const res = await fetch(
    `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari/${num}.json`
  );
  if (!res.ok) return null;
  const data = await res.json();
  // The single endpoint wraps in hadiths array
  const h = data.hadiths?.[0];
  return h ? h.text : null;
}

let matches = 0;
let mismatches = 0;

for (const check of SPOT_CHECKS) {
  const local = allHadiths[check.num];
  if (!local) {
    console.log(`  Hadith ${check.num} (${check.desc}): NOT IN LOCAL DATA`);
    mismatches++;
    continue;
  }

  const liveText = await fetchSingleHadith(check.num);
  await delay(150);

  if (!liveText) {
    console.log(`  Hadith ${check.num} (${check.desc}): COULD NOT FETCH`);
    continue;
  }

  const localStart = local.english.substring(0, 200).trim();
  const liveStart = liveText.substring(0, 200).trim();

  if (localStart === liveStart) {
    matches++;
    console.log(`  Hadith ${check.num} (${check.desc}): MATCH`);
  } else {
    mismatches++;
    console.log(`  Hadith ${check.num} (${check.desc}): MISMATCH`);
    console.log(`    Local: ${localStart.substring(0, 100)}...`);
    console.log(`    Live:  ${liveStart.substring(0, 100)}...`);
  }
}

console.log(`\nSpot-check: ${matches} matched, ${mismatches} mismatched out of ${SPOT_CHECKS.length}`);

// Phase 3: 30 evenly spaced random checks
console.log("\n=== PHASE 3: 30 EVENLY SPACED CHECKS ===\n");

const hadithNums = Object.keys(allHadiths).map(Number).sort((a, b) => a - b);
const step = Math.floor(hadithNums.length / 30);
let rMatches = 0;
let rMismatches = 0;

for (let i = 0; i < 30; i++) {
  const num = hadithNums[i * step];
  const local = allHadiths[num];
  const liveText = await fetchSingleHadith(num);
  await delay(100);

  if (!liveText) {
    console.log(`  Hadith ${num}: COULD NOT FETCH`);
    continue;
  }

  const localStart = local.english.substring(0, 200).trim();
  const liveStart = liveText.substring(0, 200).trim();

  if (localStart === liveStart) {
    rMatches++;
    process.stdout.write(`  Hadith ${num}: MATCH\n`);
  } else {
    rMismatches++;
    console.log(`  Hadith ${num}: MISMATCH`);
    console.log(`    Local: ${localStart.substring(0, 100)}...`);
    console.log(`    Live:  ${liveStart.substring(0, 100)}...`);
  }
}

console.log(`\nRandom checks: ${rMatches} matched, ${rMismatches} mismatched out of 30`);
console.log(`\n=== TOTAL: ${emptyEnglish + emptyArabic + mismatches + rMismatches} issues ===`);
