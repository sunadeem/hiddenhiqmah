import fs from "fs";
import path from "path";

const chapters = JSON.parse(
  fs.readFileSync("src/data/quran/chapters.json", "utf-8")
);

const TAFSIRS = [
  { id: 169, slug: "ibn-kathir" },
  { id: 168, slug: "maarif" },
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchByAyah(tafsirId, verseKey) {
  const res = await fetch(
    `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}?locale=en`
  );
  if (!res.ok) return "";
  const data = await res.json();
  return (data.tafsir?.text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  for (const tafsir of TAFSIRS) {
    console.log(`\nFixing ${tafsir.slug}...`);
    let fixed = 0;
    let total = 0;

    for (const ch of chapters) {
      const filePath = path.join("src/data/quran/tafsirs", tafsir.slug, `${ch.id}.json`);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      let changed = false;

      for (let v = 1; v <= ch.verses; v++) {
        const key = String(v);
        if (!data[key] || data[key].trim() === "") {
          total++;
          const text = await fetchByAyah(tafsir.id, `${ch.id}:${v}`);
          await delay(100);
          if (text) {
            data[key] = text;
            changed = true;
            fixed++;
          }
          process.stdout.write(`  ${tafsir.slug}: ch ${ch.id} — fixed ${fixed}/${total} empty\r`);
        }
      }

      if (changed) {
        fs.writeFileSync(filePath, JSON.stringify(data));
      }
    }
    console.log(`\n  ${tafsir.slug}: filled ${fixed} of ${total} empty entries`);
  }
}

main();
