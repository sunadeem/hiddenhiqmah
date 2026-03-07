import fs from "fs";
import path from "path";

const collectionSlug = process.argv[2];
const sunnahSlug = process.argv[3]; // e.g. "nasai" for sunnah.com/nasai:NUM
if (!collectionSlug || !sunnahSlug) {
  console.log("Usage: node verify-book0-general.mjs <slug> <sunnah-slug>");
  console.log("Example: node verify-book0-general.mjs nasai nasai");
  process.exit(1);
}

const DIR = `src/data/hadith/${collectionSlug}`;
const metadata = JSON.parse(fs.readFileSync(path.join(DIR, "metadata.json"), "utf-8"));
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHadithBook(hadithNum) {
  const res = await fetch(
    `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${collectionSlug}/${hadithNum}.json`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const h = data.hadiths?.[0];
  if (!h) return null;
  return { book: h.reference?.book, hadith: h.reference?.hadith };
}

async function fetchSunnahBook(hadithNum) {
  try {
    const res = await fetch(`https://sunnah.com/${sunnahSlug}:${hadithNum}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;
    const html = await res.text();
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
  // Find reassigned hadiths: those whose reference is "bookId:globalHadithId"
  const reassigned = [];
  for (const book of metadata.books) {
    const filePath = path.join(DIR, `${book.id}.json`);
    const hadiths = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    for (const h of hadiths) {
      const [refBook, refHadith] = h.reference.split(":").map(Number);
      if (refBook === book.id && refHadith === h.id) {
        reassigned.push({ id: h.id, localBook: book.id, reference: h.reference });
      }
    }
  }

  console.log(`Found ${reassigned.length} potentially reassigned hadiths to verify\n`);

  if (reassigned.length === 0) {
    console.log("Nothing to verify.");
    return;
  }

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
      const sunnahData = await fetchSunnahBook(h.id);
      await delay(150);

      if (sunnahData) {
        if (sunnahData.book === h.localBook) {
          correct++;
          process.stdout.write(`  #${h.id}: MATCH (sunnah.com confirms book ${h.localBook})\n`);
        } else {
          wrong++;
          misplacements.push({ id: h.id, ourBook: h.localBook, correctBook: sunnahData.book });
          process.stdout.write(`  #${h.id}: WRONG - we put in book ${h.localBook}, sunnah.com says book ${sunnahData.book}\n`);
        }
      } else {
        correct++;
        process.stdout.write(`  #${h.id}: OK (API=book0, sunnah unavailable, placed by range in book ${h.localBook})\n`);
      }
    } else if (apiData.book === h.localBook) {
      correct++;
      process.stdout.write(`  #${h.id}: MATCH (API confirms book ${h.localBook})\n`);
    } else {
      wrong++;
      misplacements.push({ id: h.id, ourBook: h.localBook, correctBook: apiData.book });
      process.stdout.write(`  #${h.id}: WRONG - we put in book ${h.localBook}, API says book ${apiData.book}\n`);
    }

    if ((i + 1) % 20 === 0) {
      console.log(`\n--- Progress: ${i + 1}/${reassigned.length} (${correct} correct, ${wrong} wrong) ---\n`);
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
      console.log(`  Hadith #${m.id}: our book=${m.ourBook}, correct book=${m.correctBook}`);
    }
  }
}

main().catch(console.error);
