import fs from "fs";
import path from "path";

const DIR = "src/data/hadith/bukhari";
const metadata = JSON.parse(fs.readFileSync(path.join(DIR, "metadata.json"), "utf-8"));
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Build full local lookup
const allLocal = {};
for (const book of metadata.books) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, `${book.id}.json`), "utf-8"));
  for (const h of data) {
    allLocal[h.id] = h;
  }
}

async function fetchFromAPI(num) {
  const res = await fetch(
    `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari/${num}.json`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.hadiths?.[0]?.text || null;
}

async function fetchFromSunnah(num) {
  try {
    const res = await fetch(`https://sunnah.com/bukhari:${num}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Extract English hadith text from the page
    // sunnah.com puts it in <div class="text_details"> or similar
    const match = html.match(/<div[^>]*class="[^"]*english_hadith_full[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (match) {
      return match[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#x27;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  // PHASE 1: Check 200 evenly spaced hadiths against API for length match
  console.log("=== PHASE 1: COMPARE 200 HADITHS AGAINST API ===\n");

  const ids = Object.keys(allLocal).map(Number).sort((a, b) => a - b);
  const step = Math.floor(ids.length / 200);
  let apiMatches = 0;
  let apiShorter = 0;
  let apiLonger = 0;
  const shorterExamples = [];

  for (let i = 0; i < 200; i++) {
    const num = ids[i * step];
    const local = allLocal[num];
    if (!local) continue;

    const apiText = await fetchFromAPI(num);
    await delay(50);

    if (!apiText) continue;

    const localLen = local.english.length;
    const apiLen = apiText.length;

    if (localLen === apiLen) {
      apiMatches++;
    } else if (localLen < apiLen) {
      apiShorter++;
      const diff = apiLen - localLen;
      if (diff > 5) {
        shorterExamples.push({ id: num, localLen, apiLen, diff, localEnd: local.english.slice(-40), apiEnd: apiText.slice(-40) });
      }
    } else {
      apiLonger++;
    }

    if ((i + 1) % 50 === 0) {
      process.stdout.write(`  Checked ${i + 1}/200...\n`);
    }
  }

  console.log(`\nAPI comparison (200 hadiths):`);
  console.log(`  Exact match: ${apiMatches}`);
  console.log(`  Our text shorter: ${apiShorter}`);
  console.log(`  Our text longer: ${apiLonger}`);

  if (shorterExamples.length > 0) {
    console.log(`\n  Significantly shorter (${shorterExamples.length}):`);
    for (const e of shorterExamples.slice(0, 10)) {
      console.log(`    #${e.id}: local=${e.localLen}, api=${e.apiLen} (diff ${e.diff})`);
      console.log(`      Local ends: ...${e.localEnd}`);
      console.log(`      API ends:   ...${e.apiEnd}`);
    }
  }

  // PHASE 2: Check the suspicious truncated ones against sunnah.com
  console.log("\n=== PHASE 2: CHECK SUSPICIOUS HADITHS AGAINST SUNNAH.COM ===\n");

  // Pick 20 hadiths that look most truncated (end with prepositions, very short endings)
  const suspicious = [5605, 5606, 5609, 5594, 5618, 930, 931, 448, 873, 677,
                      694, 771, 1076, 1083, 1164, 1342, 1558, 3575, 4100, 6500];

  let sunnahMatches = 0;
  let sunnahDiffers = 0;

  for (const num of suspicious) {
    const local = allLocal[num];
    if (!local) { console.log(`  #${num}: not in local data`); continue; }

    // Compare against API
    const apiText = await fetchFromAPI(num);
    await delay(100);

    if (!apiText) {
      console.log(`  #${num}: could not fetch`);
      continue;
    }

    const localTrimmed = local.english.trim();
    const apiTrimmed = apiText.trim();

    if (localTrimmed === apiTrimmed) {
      sunnahMatches++;
      console.log(`  #${num}: MATCHES API (${localTrimmed.length} chars) ends: ...${localTrimmed.slice(-40)}`);
    } else {
      sunnahDiffers++;
      console.log(`  #${num}: DIFFERS FROM API`);
      console.log(`    Local (${localTrimmed.length}): ...${localTrimmed.slice(-50)}`);
      console.log(`    API   (${apiTrimmed.length}): ...${apiTrimmed.slice(-50)}`);
    }
  }

  console.log(`\nSuspicious check: ${sunnahMatches} match API, ${sunnahDiffers} differ`);

  // PHASE 3: Check if source data itself is truncated by comparing against sunnah.com HTML
  console.log("\n=== PHASE 3: SPOT-CHECK 10 HADITHS AGAINST SUNNAH.COM WEBSITE ===\n");

  const spotCheck = [5605, 5606, 930, 448, 1076, 5596, 5575, 1, 50, 7563];

  for (const num of spotCheck) {
    const local = allLocal[num];
    if (!local) continue;

    const sunnahText = await fetchFromSunnah(num);
    await delay(200);

    if (!sunnahText) {
      console.log(`  #${num}: could not fetch from sunnah.com`);
      continue;
    }

    // Compare first 200 chars
    const localStart = local.english.substring(0, 150);
    const sunnahStart = sunnahText.substring(0, 150);

    // Compare lengths
    const localLen = local.english.length;
    const sunnahLen = sunnahText.length;
    const lenDiff = Math.abs(localLen - sunnahLen);
    const similar = lenDiff < 20;

    console.log(`  #${num}: local=${localLen} chars, sunnah=${sunnahLen} chars (diff=${lenDiff}) ${similar ? "SIMILAR" : "DIFFERS"}`);
    if (!similar) {
      console.log(`    Local ends:  ...${local.english.slice(-60)}`);
      console.log(`    Sunnah ends: ...${sunnahText.slice(-60)}`);
    }
  }
}

main().catch(console.error);
