import fs from "fs";
import path from "path";

const OUT_DIR = "src/data/hadith/bukhari";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  console.log("Fetching Sahih al-Bukhari from fawazahmed0 API...\n");

  // Fetch full English (with metadata) and minified Arabic
  const [engData, araData] = await Promise.all([
    fetchJSON("https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari.json"),
    fetchJSON("https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari.min.json"),
  ]);

  console.log(`English hadiths: ${engData.hadiths.length}`);
  console.log(`Arabic hadiths: ${araData.hadiths.length}`);

  const sections = engData.metadata?.sections || {};
  const sectionDetails = engData.metadata?.section_details || {};
  console.log(`Sections: ${Object.keys(sections).length}\n`);

  // Build Arabic lookup by hadith number
  const araMap = {};
  for (const h of araData.hadiths) {
    araMap[h.hadithnumber] = h.text;
  }

  // Group hadiths by book
  const books = {};
  for (const h of engData.hadiths) {
    const bookNum = h.reference.book;
    if (!books[bookNum]) books[bookNum] = [];

    books[bookNum].push({
      id: h.hadithnumber,
      arabic: araMap[h.hadithnumber] || "",
      english: h.text,
      reference: `${h.reference.book}:${h.reference.hadith}`,
    });
  }

  // Create output directory
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Save metadata
  const bookList = Object.entries(books).map(([num, hadiths]) => ({
    id: parseInt(num),
    name: sections[num] || `Book ${num}`,
    count: hadiths.length,
    startHadith: hadiths[0].id,
    endHadith: hadiths[hadiths.length - 1].id,
  }));
  bookList.sort((a, b) => a.id - b.id);

  const metadata = {
    collection: "bukhari",
    name: "Sahih al-Bukhari",
    nameAr: "صحيح البخاري",
    author: "Imam Muhammad al-Bukhari",
    description: "Sahih al-Bukhari is considered the most authentic collection of hadith, compiled by Imam Muhammad al-Bukhari. It contains 7,563 hadiths organized into 97 books covering all aspects of Islamic life and jurisprudence.",
    totalHadiths: engData.hadiths.length,
    books: bookList,
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "metadata.json"),
    JSON.stringify(metadata)
  );
  console.log(`Saved metadata: ${bookList.length} books, ${metadata.totalHadiths} hadiths`);

  // Save per-book files
  let totalSaved = 0;
  for (const [bookNum, hadiths] of Object.entries(books)) {
    fs.writeFileSync(
      path.join(OUT_DIR, `${bookNum}.json`),
      JSON.stringify(hadiths)
    );
    totalSaved += hadiths.length;
    process.stdout.write(`  Book ${bookNum} — ${hadiths.length} hadiths\r`);
  }

  console.log(`\nSaved ${totalSaved} hadiths across ${Object.keys(books).length} book files`);

  // Size report
  let totalSize = 0;
  const files = fs.readdirSync(OUT_DIR);
  for (const f of files) {
    totalSize += fs.statSync(path.join(OUT_DIR, f)).size;
  }
  console.log(`Total size: ${Math.round(totalSize / 1024)}KB (${Math.round(totalSize / (1024 * 1024))}MB)`);

  // Quick sanity check
  let missingArabic = 0;
  let emptyEnglish = 0;
  for (const h of engData.hadiths) {
    if (!araMap[h.hadithnumber]) missingArabic++;
    if (!h.text || h.text.trim() === "") emptyEnglish++;
  }
  console.log(`\nSanity check:`);
  console.log(`  Missing Arabic: ${missingArabic}`);
  console.log(`  Empty English: ${emptyEnglish}`);
}

main().catch(console.error);
