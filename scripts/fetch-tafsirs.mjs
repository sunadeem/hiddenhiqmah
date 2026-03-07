import fs from "fs";
import path from "path";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const TAFSIRS = [
  { id: 169, slug: "ibn-kathir", name: "Ibn Kathir" },
  { id: 168, slug: "maarif", name: "Ma'arif al-Qur'an" },
];

const outDir = path.join("src/data/quran/tafsirs");

async function fetchTafsirChapter(tafsirId, chapterId) {
  const allEntries = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetch(
      `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_chapter/${chapterId}?locale=en&page=${page}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    totalPages = data.pagination?.total_pages || 1;

    for (const t of data.tafsirs || []) {
      const num = parseInt(t.verse_key.split(":")[1]);
      const text = (t.text || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      allEntries.push([num, text]);
    }

    page++;
    if (page <= totalPages) await delay(100);
  }

  // Build map
  const verseMap = {};
  for (const [num, text] of allEntries) {
    verseMap[num] = text;
  }
  return verseMap;
}

async function main() {
  for (const tafsir of TAFSIRS) {
    const dir = path.join(outDir, tafsir.slug);
    fs.mkdirSync(dir, { recursive: true });

    console.log(`\nFetching ${tafsir.name}...`);

    for (let ch = 1; ch <= 114; ch++) {
      try {
        const verseMap = await fetchTafsirChapter(tafsir.id, ch);
        fs.writeFileSync(
          path.join(dir, `${ch}.json`),
          JSON.stringify(verseMap)
        );
        const count = Object.keys(verseMap).length;
        process.stdout.write(`  ${tafsir.slug} ${ch}/114 (${count} verses)\r`);
      } catch (err) {
        console.error(`\n  Error ${tafsir.slug} ch ${ch}: ${err.message}`);
      }
      await delay(150);
    }
    console.log(`\n  ${tafsir.slug} done!`);
  }

  // Calculate sizes and verify
  let totalVerses = 0;
  for (const tafsir of TAFSIRS) {
    const dir = path.join(outDir, tafsir.slug);
    let totalSize = 0;
    let verseCount = 0;
    for (let i = 1; i <= 114; i++) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, `${i}.json`), "utf-8"));
      totalSize += fs.statSync(path.join(dir, `${i}.json`)).size;
      verseCount += Object.keys(data).length;
    }
    console.log(`${tafsir.name}: ${verseCount} verses, ${Math.round(totalSize / 1024)}KB`);
    totalVerses = verseCount;
  }
}

main();
