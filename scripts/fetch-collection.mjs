import fs from "fs";
import path from "path";

const COLLECTIONS = {
  bukhari: {
    slug: "bukhari",
    engEdition: "eng-bukhari",
    araEdition: "ara-bukhari",
    name: "Sahih al-Bukhari",
    nameAr: "صحيح البخاري",
    author: "Imam al-Bukhari",
    description: "Sahih al-Bukhari is the most authentic collection of hadith, compiled by Imam Muhammad ibn Ismail al-Bukhari. It contains hadiths covering all aspects of Islamic life and is universally regarded as the most reliable source after the Quran.",
  },
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
  ahmad: {
    slug: "ahmad",
    engEdition: "eng-ahmad",
    araEdition: "ara-ahmad",
    name: "Musnad Ahmad",
    nameAr: "مسند أحمد",
    author: "Imam Ahmad ibn Hanbal",
    description: "Musnad Ahmad is one of the largest hadith collections, compiled by Imam Ahmad ibn Hanbal. It is organized by narrator rather than topic and contains over 28,000 hadiths.",
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
  console.log(`Sections: ${Object.keys(sections).length}`);

  // Build Arabic lookup by global hadith number
  const araMap = {};
  for (const h of araData.hadiths) {
    araMap[h.hadithnumber] = h.text;
  }

  // Determine Book 0 handling per collection
  // Muslim & Ibn Majah have clean sequential intros (IDs before Book 1's start)
  // Bukhari & Nasai Book 0 entries have IDs scattered/overlapping with other books — skip those
  const book0Hadiths = engData.hadiths.filter((h) => h.reference.book === 0);
  const nonBook0Hadiths = engData.hadiths.filter((h) => h.reference.book !== 0);

  // Find the first non-zero book's starting ID to detect clean intros
  const firstNonZeroId = nonBook0Hadiths.length > 0
    ? Math.min(...nonBook0Hadiths.map((h) => h.hadithnumber))
    : Infinity;

  // Book 0 entries with IDs below the first real book are clean intro hadiths
  const cleanIntroEntries = book0Hadiths.filter((h) => h.hadithnumber < firstNonZeroId);
  const overlappingEntries = book0Hadiths.filter((h) => h.hadithnumber >= firstNonZeroId);

  if (book0Hadiths.length > 0) {
    console.log(`\nBook 0: ${book0Hadiths.length} total entries`);
    if (cleanIntroEntries.length > 0) {
      console.log(`  Including ${cleanIntroEntries.length} intro entries (IDs 1-${firstNonZeroId - 1})`);
    }
    if (overlappingEntries.length > 0) {
      console.log(`  Skipping ${overlappingEntries.length} overlapping entries (IDs overlap with other books)`);
    }
  }

  // Group hadiths by book
  // id = global hadith number (what people cite: "Bukhari 3818")
  // reference = book:hadith (for display and book navigation)
  const books = {};

  // Add clean Book 0 intro entries
  if (cleanIntroEntries.length > 0) {
    books[0] = cleanIntroEntries.map((h) => ({
      id: h.hadithnumber,
      arabic: araMap[h.hadithnumber] || "",
      english: h.text,
      reference: `0:${h.reference.hadith}`,
    }));
  }

  // Add all non-Book-0 entries
  for (const h of nonBook0Hadiths) {
    const bookNum = h.reference.book;
    if (!books[bookNum]) books[bookNum] = [];
    books[bookNum].push({
      id: h.hadithnumber,
      arabic: araMap[h.hadithnumber] || "",
      english: h.text,
      reference: `${bookNum}:${h.reference.hadith}`,
    });
  }

  // Clean output directory
  if (fs.existsSync(OUT_DIR)) {
    const oldFiles = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json"));
    for (const f of oldFiles) {
      fs.unlinkSync(path.join(OUT_DIR, f));
    }
    console.log(`Cleaned ${oldFiles.length} old files from ${OUT_DIR}`);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Sort hadiths within each book by their per-book ID
  for (const bookNum of Object.keys(books)) {
    books[bookNum].sort((a, b) => a.id - b.id);
  }

  // Build metadata
  const bookList = Object.entries(books)
    .map(([num, hadiths]) => ({
      id: parseInt(num),
      name: parseInt(num) === 0 ? "Introduction" : (sections[num] || `Book ${num}`),
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
  console.log(`\nSaved metadata: ${bookList.length} books, ${totalHadiths} hadiths`);

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
  let duplicateIds = 0;
  for (const [bookNum, hadiths] of Object.entries(books)) {
    const ids = new Set();
    for (const h of hadiths) {
      if (!h.arabic || h.arabic.trim() === "") missingArabic++;
      if (!h.english || h.english.trim() === "") emptyEnglish++;
      if (ids.has(h.id)) duplicateIds++;
      ids.add(h.id);
    }
  }
  console.log(`\nSanity check:`);
  console.log(`  Missing Arabic: ${missingArabic}`);
  console.log(`  Empty English: ${emptyEnglish}`);
  console.log(`  Duplicate IDs within books: ${duplicateIds}`);

  if (duplicateIds > 0) {
    console.log(`\n⚠ WARNING: Found duplicate hadith IDs within books. Review the data.`);
  }
  if (missingArabic === 0 && emptyEnglish === 0 && duplicateIds === 0) {
    console.log(`\n✓ All clean — no issues found.`);
  }
}

main().catch(console.error);
