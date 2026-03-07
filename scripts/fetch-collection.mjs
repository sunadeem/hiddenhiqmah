import fs from "fs";
import path from "path";

const COLLECTIONS = {
  muslim: {
    slug: "muslim",
    engEdition: "eng-muslim",
    araEdition: "ara-muslim",
    name: "Sahih Muslim",
    nameAr: "صحيح مسلم",
    author: "Imam Muslim ibn al-Hajjaj",
    description: "Sahih Muslim is the second most authentic collection of hadith, compiled by Imam Muslim ibn al-Hajjaj. It is organized thematically and contains hadiths covering faith, worship, transactions, and all aspects of Islamic life.",
  },
  abudawud: {
    slug: "abudawud",
    engEdition: "eng-abudawud",
    araEdition: "ara-abudawud",
    name: "Sunan Abu Dawud",
    nameAr: "سنن أبي داود",
    author: "Imam Abu Dawud",
    description: "Sunan Abu Dawud is one of the six major hadith collections, compiled by Imam Abu Dawud. It focuses primarily on hadiths related to Islamic jurisprudence (fiqh).",
  },
  tirmidhi: {
    slug: "tirmidhi",
    engEdition: "eng-tirmidhi",
    araEdition: "ara-tirmidhi",
    name: "Jami at-Tirmidhi",
    nameAr: "جامع الترمذي",
    author: "Imam at-Tirmidhi",
    description: "Jami at-Tirmidhi is one of the six major hadith collections, compiled by Imam at-Tirmidhi. It is notable for including grading of hadiths and commentary on legal opinions.",
  },
  nasai: {
    slug: "nasai",
    engEdition: "eng-nasai",
    araEdition: "ara-nasai",
    name: "Sunan an-Nasai",
    nameAr: "سنن النسائي",
    author: "Imam an-Nasai",
    description: "Sunan an-Nasai is one of the six major hadith collections, compiled by Imam an-Nasai. It is known for its strict criteria in selecting hadiths.",
  },
  ibnmajah: {
    slug: "ibnmajah",
    engEdition: "eng-ibnmajah",
    araEdition: "ara-ibnmajah",
    name: "Sunan Ibn Majah",
    nameAr: "سنن ابن ماجه",
    author: "Imam Ibn Majah",
    description: "Sunan Ibn Majah is one of the six major hadith collections, compiled by Imam Ibn Majah. It contains hadiths on a wide range of Islamic jurisprudence topics.",
  },
};

const collectionKey = process.argv[2];
if (!collectionKey || !COLLECTIONS[collectionKey]) {
  console.log("Usage: node fetch-collection.mjs <collection>");
  console.log("Available:", Object.keys(COLLECTIONS).join(", "));
  process.exit(1);
}

const config = COLLECTIONS[collectionKey];
const OUT_DIR = `src/data/hadith/${config.slug}`;

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  console.log(`Fetching ${config.name} from fawazahmed0 API...\n`);

  const [engData, araData] = await Promise.all([
    fetchJSON(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${config.engEdition}.json`),
    fetchJSON(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${config.araEdition}.min.json`),
  ]);

  console.log(`English hadiths: ${engData.hadiths.length}`);
  console.log(`Arabic hadiths: ${araData.hadiths.length}`);

  const sections = engData.metadata?.sections || {};
  console.log(`Sections: ${Object.keys(sections).length}\n`);

  // Build Arabic lookup
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

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Handle Book 0: reassign to correct books by hadith number range
  if (books[0] && books[0].length > 0) {
    console.log(`Book 0 has ${books[0].length} hadiths — reassigning to correct books...`);

    // Build ranges from real books
    const ranges = Object.entries(books)
      .filter(([k]) => k !== "0")
      .map(([k, v]) => ({
        id: parseInt(k),
        start: Math.min(...v.map((h) => h.id)),
        end: Math.max(...v.map((h) => h.id)),
      }))
      .sort((a, b) => a.start - b.start);

    let assigned = 0;
    for (const h of books[0]) {
      let bestBook = null;
      let bestDist = Infinity;
      // Try exact range match first
      for (const r of ranges) {
        if (h.id >= r.start && h.id <= r.end) {
          bestBook = r.id;
          break;
        }
      }
      // Fallback to nearest
      if (!bestBook) {
        for (const r of ranges) {
          const dist = Math.min(Math.abs(h.id - r.start), Math.abs(h.id - r.end));
          if (dist < bestDist) {
            bestDist = dist;
            bestBook = r.id;
          }
        }
      }
      if (bestBook) {
        h.reference = `${bestBook}:${h.id}`;
        if (!books[bestBook]) books[bestBook] = [];
        books[bestBook].push(h);
        assigned++;
      }
    }
    delete books[0];
    console.log(`  Reassigned ${assigned} hadiths from Book 0\n`);
  }

  // Sort hadiths within each book
  for (const bookNum of Object.keys(books)) {
    books[bookNum].sort((a, b) => a.id - b.id);
  }

  // Build metadata
  const bookList = Object.entries(books)
    .map(([num, hadiths]) => ({
      id: parseInt(num),
      name: sections[num] || `Book ${num}`,
      count: hadiths.length,
      startHadith: hadiths[0].id,
      endHadith: hadiths[hadiths.length - 1].id,
    }))
    .sort((a, b) => a.id - b.id);

  const totalHadiths = bookList.reduce((sum, b) => sum + b.count, 0);

  const metadata = {
    collection: config.slug,
    name: config.name,
    nameAr: config.nameAr,
    author: config.author,
    description: config.description,
    totalHadiths,
    books: bookList,
  };

  fs.writeFileSync(path.join(OUT_DIR, "metadata.json"), JSON.stringify(metadata));
  console.log(`Saved metadata: ${bookList.length} books, ${totalHadiths} hadiths`);

  // Save per-book files
  for (const [bookNum, hadiths] of Object.entries(books)) {
    fs.writeFileSync(path.join(OUT_DIR, `${bookNum}.json`), JSON.stringify(hadiths));
  }

  // Size report
  let totalSize = 0;
  const files = fs.readdirSync(OUT_DIR);
  for (const f of files) {
    totalSize += fs.statSync(path.join(OUT_DIR, f)).size;
  }
  console.log(`Total size: ${Math.round(totalSize / 1024)}KB (${Math.round(totalSize / (1024 * 1024))}MB)`);

  // Sanity check
  let missingArabic = 0;
  let emptyEnglish = 0;
  for (const hadiths of Object.values(books)) {
    for (const h of hadiths) {
      if (!h.arabic || h.arabic.trim() === "") missingArabic++;
      if (!h.english || h.english.trim() === "") emptyEnglish++;
    }
  }
  console.log(`\nSanity check:`);
  console.log(`  Missing Arabic: ${missingArabic}`);
  console.log(`  Empty English: ${emptyEnglish}`);
}

main().catch(console.error);
