/**
 * Fetches Quran data from quran.com API v4 and saves it locally.
 * - All 114 chapter metadata → src/data/quran/chapters.json
 * - Verses per chapter (Arabic Uthmani + Saheeh International) → src/data/quran/verses/{id}.json
 */

import fs from "fs";
import path from "path";

const API_BASE = "https://api.quran.com/api/v4";
const DATA_DIR = path.resolve("src/data/quran");
const VERSES_DIR = path.join(DATA_DIR, "verses");
const TRANSLATION_ID = 20; // Saheeh International

// Rate limit: small delay between requests to be respectful
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function fetchChapters() {
  console.log("Fetching chapters...");
  const data = await fetchJSON(`${API_BASE}/chapters?language=en`);
  const chapters = data.chapters.map((ch) => ({
    id: ch.id,
    name: ch.name_simple,
    nameAr: ch.name_arabic,
    nameComplex: ch.name_complex,
    meaning: ch.translated_name.name,
    verses: ch.verses_count,
    revelationPlace: ch.revelation_place,
    revelationOrder: ch.revelation_order,
    pages: ch.pages,
    bismillahPre: ch.bismillah_pre,
  }));

  fs.writeFileSync(
    path.join(DATA_DIR, "chapters.json"),
    JSON.stringify(chapters, null, 2)
  );
  console.log(`Saved ${chapters.length} chapters.`);
  return chapters;
}

async function fetchVersesForChapter(chapterId, totalVerses) {
  const allVerses = [];
  let page = 1;
  const perPage = 50;

  while (true) {
    const url = `${API_BASE}/verses/by_chapter/${chapterId}?language=en&fields=text_uthmani&translations=${TRANSLATION_ID}&per_page=${perPage}&page=${page}`;
    const data = await fetchJSON(url);

    for (const v of data.verses) {
      const translation = v.translations?.[0]?.text || "";
      allVerses.push({
        id: v.id,
        number: v.verse_number,
        key: v.verse_key,
        textAr: v.text_uthmani,
        textEn: translation.replace(/<[^>]*>/g, ""), // strip HTML tags
        juz: v.juz_number,
        page: v.page_number,
        hizb: v.hizb_number,
      });
    }

    if (!data.pagination.next_page) break;
    page++;
  }

  fs.writeFileSync(
    path.join(VERSES_DIR, `${chapterId}.json`),
    JSON.stringify(allVerses, null, 2)
  );

  return allVerses.length;
}

async function main() {
  fs.mkdirSync(VERSES_DIR, { recursive: true });

  const chapters = await fetchChapters();

  console.log("\nFetching verses for all 114 surahs...");
  let totalVerses = 0;

  for (const ch of chapters) {
    const count = await fetchVersesForChapter(ch.id, ch.verses);
    totalVerses += count;
    process.stdout.write(`  ${ch.id}. ${ch.name} — ${count} verses\n`);
    await delay(200); // be respectful to the API
  }

  console.log(`\nDone! Fetched ${totalVerses} total verses across ${chapters.length} surahs.`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
