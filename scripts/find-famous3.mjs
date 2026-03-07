import fs from "fs";
import path from "path";

const searches = [
  // Love for brother - try different wording
  { term: "loves for his brother", col: "bukhari" },
  { term: "wish for his brother", col: "bukhari" },
  { term: "likes for his brother", col: "bukhari" },
  { term: "love for his brother", col: "muslim" },
  // Speak good or remain silent
  { term: "speak good or keep silent", col: "bukhari" },
  { term: "good or keep silent", col: "bukhari" },
  { term: "good or remain silent", col: "muslim" },
  // Best to family - tirmidhi
  { term: "best to his family", col: "ibnmajah" },
  { term: "best among you is the one who is best to his", col: "ibnmajah" },
  { term: "best of you is the best to his", col: "tirmidhi" },
  { term: "best of you are those who are best to", col: "tirmidhi" },
  // Hearts and deeds
  { term: "looks at your hearts", col: "muslim" },
  { term: "look at your appearance", col: "muslim" },
  { term: "look at your figure", col: "muslim" },
  // Show mercy
  { term: "not show mercy", col: "bukhari" },
  { term: "not mercy", col: "bukhari" },
  { term: "merciful", col: "bukhari" },
  // Prison for believer
  { term: "prison", col: "muslim" },
  // Quran best
  { term: "best among you", col: "bukhari", bookFilter: 66 },
];

for (const s of searches) {
  const dir = "src/data/hadith/" + s.col;
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "metadata.json"), "utf-8"));
  let found = false;
  for (const book of meta.books) {
    if (s.bookFilter && book.id !== s.bookFilter) continue;
    const data = JSON.parse(fs.readFileSync(path.join(dir, `${book.id}.json`), "utf-8"));
    for (const h of data) {
      if (h.english && h.english.toLowerCase().includes(s.term.toLowerCase())) {
        console.log(`${s.col} | book=${book.id} | id=${h.id} | ${h.english.substring(0, 200)}`);
        found = true;
        break;
      }
    }
    if (found) break;
  }
  if (!found) console.log("NOT FOUND: " + s.term + " (" + s.col + ")");
}
