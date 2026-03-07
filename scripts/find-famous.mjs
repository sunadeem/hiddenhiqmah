import fs from "fs";
import path from "path";

const searches = [
  { term: "actions are judged by intentions", col: "bukhari" },
  { term: "None of you truly believes until he loves for his brother", col: "bukhari" },
  { term: "strong man is not the one who wrestles", col: "bukhari" },
  { term: "believes in Allah and the Last Day, let him speak good or remain silent", col: "bukhari" },
  { term: "stranger or a traveler", col: "bukhari" },
  { term: "Make things easy", col: "bukhari" },
  { term: "best of you are those who learn the Quran", col: "bukhari" },
  { term: "does not look at your bodies", col: "muslim" },
  { term: "from whose tongue and hand", col: "bukhari" },
  { term: "Cleanliness is half of faith", col: "muslim" },
  { term: "the world is a prison for the believer", col: "muslim" },
  { term: "best among you is the one who is best to his wife", col: "tirmidhi" },
];

for (const s of searches) {
  const dir = "src/data/hadith/" + s.col;
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "metadata.json"), "utf-8"));
  let found = false;
  for (const book of meta.books) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, `${book.id}.json`), "utf-8"));
    for (const h of data) {
      if (h.english && h.english.toLowerCase().includes(s.term.toLowerCase())) {
        console.log(`${s.col} | book=${book.id} | id=${h.id} | ${h.english.substring(0, 150)}`);
        found = true;
        break;
      }
    }
    if (found) break;
  }
  if (!found) console.log("NOT FOUND: " + s.term);
}
