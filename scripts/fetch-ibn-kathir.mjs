import fs from "fs";
import path from "path";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch the first few verses' tafsir for each surah to get Ibn Kathir's introduction
async function fetchTafsir(chapterId) {
  // Get tafsir for the first verse of each surah - Ibn Kathir typically includes the surah intro there
  const res = await fetch(
    `https://api.quran.com/api/v4/tafsirs/169/by_chapter/${chapterId}?locale=en`
  );
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const data = await res.json();

  // Get the first few tafsir entries (intro is usually in the first verse's tafsir)
  const entries = (data.tafsirs || []).slice(0, 3);
  const combined = entries.map(t => {
    const text = (t.text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return { verse_key: t.verse_key, text: text.substring(0, 3000) };
  });

  return combined;
}

async function main() {
  const results = [];
  const chapters = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "src/data/quran/chapters.json"), "utf-8")
  );

  for (let i = 1; i <= 114; i++) {
    const ch = chapters.find(c => c.id === i);
    try {
      const tafsir = await fetchTafsir(i);
      results.push({
        id: i,
        name: ch.name,
        ourOverview: ch.overview,
        ibnKathir: tafsir,
      });
      process.stdout.write(`Fetched ${i}/114\r`);
    } catch (err) {
      console.error(`\nError fetching ${i}: ${err.message}`);
      results.push({ id: i, name: ch.name, error: err.message });
    }
    await delay(200);
  }

  fs.writeFileSync(
    path.join(process.cwd(), "scripts/ibn-kathir-tafsirs.json"),
    JSON.stringify(results, null, 2)
  );
  console.log("\nDone! Saved to scripts/ibn-kathir-tafsirs.json");
}

main();
