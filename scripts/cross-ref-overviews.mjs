import fs from "fs";
import path from "path";

const chapters = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "src/data/quran/chapters.json"),
    "utf-8"
  )
);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchChapterInfo(id) {
  const res = await fetch(
    `https://api.quran.com/api/v4/chapters/${id}/info?language=en`
  );
  if (!res.ok) throw new Error(`Failed to fetch chapter ${id}: ${res.status}`);
  const data = await res.json();
  return data.chapter_info;
}

async function main() {
  const results = [];

  for (let i = 1; i <= 114; i++) {
    const ch = chapters.find((c) => c.id === i);
    try {
      const info = await fetchChapterInfo(i);
      // Strip HTML tags from the description
      const desc = info.short_text || "";
      const fullText = (info.text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      results.push({
        id: i,
        name: ch.name,
        ourOverview: ch.overview,
        quranComShort: desc,
        quranComFull: fullText.substring(0, 2000), // truncate for readability
      });
      process.stdout.write(`Fetched ${i}/114\r`);
    } catch (err) {
      console.error(`Error fetching ${i}: ${err.message}`);
      results.push({ id: i, name: ch.name, error: err.message });
    }
    await delay(150);
  }

  fs.writeFileSync(
    path.join(process.cwd(), "scripts/quran-com-descriptions.json"),
    JSON.stringify(results, null, 2)
  );
  console.log("\nDone! Saved to scripts/quran-com-descriptions.json");
}

main();
