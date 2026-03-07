import fs from "fs";
import path from "path";

const searches = [
  // Bukhari #1 - intentions
  { term: "intention", col: "bukhari", maxId: 10 },
  // Bukhari #13 - love for brother
  { term: "loves for his brother", col: "bukhari", maxId: 50 },
  // Strong man
  { term: "wrestle", col: "bukhari" },
  { term: "strong is not", col: "bukhari" },
  // Speak good or remain silent
  { term: "speak good", col: "bukhari" },
  { term: "remain silent", col: "bukhari" },
  // Stranger/traveler (found: 6416)
  // Best to learn Quran
  { term: "learn the Qur", col: "bukhari" },
  { term: "taught the Qur", col: "bukhari" },
  // Allah looks at hearts
  { term: "look at your", col: "muslim" },
  { term: "hearts and your deeds", col: "muslim" },
  // Tongue and hand safe
  { term: "tongue and hand", col: "bukhari" },
  { term: "tongue and his hand", col: "bukhari" },
  // World is prison
  { term: "prison for the believer", col: "muslim" },
  { term: "prison of the believer", col: "muslim" },
  // Best to wife
  { term: "best to his wife", col: "tirmidhi" },
  { term: "best to his family", col: "tirmidhi" },
  // Cleanliness (found: 534)
  // Mercy
  { term: "merciful will be shown mercy", col: "abudawud" },
  { term: "show mercy", col: "bukhari" },
  // Hadith #1 specifically
  { term: "by intentions", col: "bukhari", maxId: 5 },
  { term: "by their intentions", col: "bukhari", maxId: 10 },
  { term: "niyyah", col: "bukhari" },
];

for (const s of searches) {
  const dir = "src/data/hadith/" + s.col;
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "metadata.json"), "utf-8"));
  let found = false;
  for (const book of meta.books) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, `${book.id}.json`), "utf-8"));
    for (const h of data) {
      if (s.maxId && h.id > s.maxId) continue;
      if (h.english && h.english.toLowerCase().includes(s.term.toLowerCase())) {
        console.log(`${s.col} | book=${book.id} | id=${h.id} | ${h.english.substring(0, 180)}`);
        found = true;
        break;
      }
    }
    if (found) break;
  }
  if (!found) console.log("NOT FOUND: " + s.term + " (" + s.col + ")");
}
