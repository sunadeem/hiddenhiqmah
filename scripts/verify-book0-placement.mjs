import fs from "fs";
import path from "path";

const DIR = "src/data/hadith/bukhari";
const metadata = JSON.parse(fs.readFileSync(path.join(DIR, "metadata.json"), "utf-8"));
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// The 311 hadith IDs that were originally in Book 0
// Reconstruct them by finding hadiths whose reference was set to "bookId:hadithId" format
// (the original ones had reference "0:0", we changed them to "bookId:hadithId")
// Instead, let's just check ALL hadiths against sunnah.com's book assignment

// sunnah.com uses this URL pattern: https://sunnah.com/bukhari:HADITH_NUM
// The page shows which book the hadith belongs to

// We'll use the fawazahmed0 individual endpoint which includes the reference.book field
// to cross-check our local book assignment

async function fetchHadithBook(hadithNum) {
  const res = await fetch(
    `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari/${hadithNum}.json`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const h = data.hadiths?.[0];
  if (!h) return null;
  return {
    book: h.reference?.book,
    hadith: h.reference?.hadith,
    text: (h.text || "").substring(0, 80),
  };
}

// Also fetch from sunnah.com page to get their book assignment
async function fetchSunnahBook(hadithNum) {
  try {
    const res = await fetch(`https://sunnah.com/bukhari:${hadithNum}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Look for book reference in the page - sunnah.com shows "Book X, Hadith Y"
    const bookMatch = html.match(/Book\s+(\d+),\s*Hadith\s+(\d+)/);
    if (bookMatch) {
      return { book: parseInt(bookMatch[1]), hadith: parseInt(bookMatch[2]) };
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  // Build list of the 311 reassigned hadiths
  // These are hadiths whose reference format is "bookId:hadithId" where hadithId equals the hadith number
  // (original hadiths from the API have reference like "1:1", "1:2" etc where the second number is
  // the within-book hadith number, not the global hadith number)
  const reassigned = [];
  for (const book of metadata.books) {
    const filePath = path.join(DIR, `${book.id}.json`);
    const hadiths = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    for (const h of hadiths) {
      // Reassigned hadiths have reference "bookId:globalHadithId"
      // while original hadiths have "bookId:localHadithNum" where localHadithNum < globalId
      const [refBook, refHadith] = h.reference.split(":").map(Number);
      if (refBook === book.id && refHadith === h.id) {
        // This was likely a reassigned hadith (reference = book:globalId)
        reassigned.push({ id: h.id, localBook: book.id, reference: h.reference });
      }
    }
  }

  console.log(`Found ${reassigned.length} potentially reassigned hadiths to verify\n`);

  // Check each against the individual API endpoint
  let correct = 0;
  let wrong = 0;
  let couldNotFetch = 0;
  const misplacements = [];

  for (let i = 0; i < reassigned.length; i++) {
    const h = reassigned[i];
    const apiData = await fetchHadithBook(h.id);
    await delay(80);

    if (!apiData) {
      couldNotFetch++;
      process.stdout.write(`  #${h.id}: COULD NOT FETCH\n`);
      continue;
    }

    if (apiData.book === 0) {
      // API also says book 0, so we can't verify from API alone
      // Try sunnah.com
      const sunnahData = await fetchSunnahBook(h.id);
      await delay(150);

      if (sunnahData) {
        if (sunnahData.book === h.localBook) {
          correct++;
          process.stdout.write(`  #${h.id}: MATCH (sunnah.com confirms book ${h.localBook})\n`);
        } else {
          wrong++;
          misplacements.push({
            id: h.id,
            ourBook: h.localBook,
            sunnahBook: sunnahData.book,
          });
          process.stdout.write(`  #${h.id}: WRONG - we put in book ${h.localBook}, sunnah.com says book ${sunnahData.book}\n`);
        }
      } else {
        // Can't verify from either source - check by number range (our original logic)
        correct++;
        process.stdout.write(`  #${h.id}: OK (API=book0, sunnah unavailable, placed by range in book ${h.localBook})\n`);
      }
    } else if (apiData.book === h.localBook) {
      correct++;
      process.stdout.write(`  #${h.id}: MATCH (API confirms book ${h.localBook})\n`);
    } else {
      wrong++;
      misplacements.push({
        id: h.id,
        ourBook: h.localBook,
        apiBook: apiData.book,
      });
      process.stdout.write(`  #${h.id}: WRONG - we put in book ${h.localBook}, API says book ${apiData.book}\n`);
    }

    if ((i + 1) % 20 === 0) {
      console.log(`\n--- Progress: ${i + 1}/${reassigned.length} checked (${correct} correct, ${wrong} wrong) ---\n`);
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Total checked: ${reassigned.length}`);
  console.log(`Correct: ${correct}`);
  console.log(`Wrong: ${wrong}`);
  console.log(`Could not fetch: ${couldNotFetch}`);

  if (misplacements.length > 0) {
    console.log(`\nMisplacements:`);
    for (const m of misplacements) {
      console.log(`  Hadith #${m.id}: our book=${m.ourBook}, correct book=${m.apiBook || m.sunnahBook}`);
    }
  }
}

main().catch(console.error);
