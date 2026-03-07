import fs from "fs";
import path from "path";

const index = [];

for (let i = 1; i <= 114; i++) {
  const verses = JSON.parse(
    fs.readFileSync(path.join("src/data/quran/verses", `${i}.json`), "utf-8")
  );
  const v = verses.map((verse) => ({
    n: verse.number,
    t: verse.textEn.toLowerCase(),
  }));
  index.push({ id: i, v });
}

fs.writeFileSync(
  path.join("src/data/quran/search-index.json"),
  JSON.stringify(index)
);

const size = fs.statSync("src/data/quran/search-index.json").size;
console.log(`Search index built: ${Math.round(size / 1024)}KB`);
