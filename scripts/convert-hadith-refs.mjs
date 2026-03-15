import fs from "fs";
import path from "path";

// Build global-ID → book:hadith mapping from our data
const COLLECTIONS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "ahmad"];
const DATA_DIR = "src/data/hadith";

const refMap = {}; // { bukhari: { 3818: "63:43" }, ... }

for (const col of COLLECTIONS) {
  const metaPath = path.join(DATA_DIR, col, "metadata.json");
  if (!fs.existsSync(metaPath)) continue;

  const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  refMap[col] = {};

  for (const book of meta.books) {
    const bookPath = path.join(DATA_DIR, col, `${book.id}.json`);
    if (!fs.existsSync(bookPath)) continue;

    const hadiths = JSON.parse(fs.readFileSync(bookPath, "utf-8"));
    for (const h of hadiths) {
      refMap[col][h.id] = h.reference; // e.g., "63:43"
    }
  }

  console.log(`${col}: ${Object.keys(refMap[col]).length} entries mapped`);
}

// Save mapping for reference
fs.writeFileSync("scripts/hadith-ref-map.json", JSON.stringify(refMap));
console.log("\nMapping saved to scripts/hadith-ref-map.json");

// Name variants → { short display name, slug for our data }
const NAME_VARIANTS = [
  // Order matters: longer patterns first to avoid partial matches
  { patterns: ["Sahih al-Bukhari"], short: "Bukhari", slug: "bukhari" },
  { patterns: ["Sahih Muslim"], short: "Muslim", slug: "muslim" },
  { patterns: ["Sunan Abu Dawud"], short: "Abu Dawud", slug: "abudawud" },
  { patterns: ["Sunan at-Tirmidhi", "Jami at-Tirmidhi", "Jami' at-Tirmidhi", "Jami\\u2019 at-Tirmidhi"], short: "Tirmidhi", slug: "tirmidhi" },
  { patterns: ["Sunan an-Nasa\u2019i", "Sunan an-Nasa'i", "Sunan an-Nasai"], short: "Nasai", slug: "nasai" },
  { patterns: ["Sunan Ibn Majah"], short: "Ibn Majah", slug: "ibnmajah" },
  { patterns: ["Musnad Ahmad"], short: "Ahmad", slug: "ahmad" },
  // Short forms (must come after long forms)
  { patterns: ["Bukhari"], short: "Bukhari", slug: "bukhari" },
  { patterns: ["Muslim"], short: "Muslim", slug: "muslim" },
  { patterns: ["Abu Dawud"], short: "Abu Dawud", slug: "abudawud" },
  { patterns: ["Tirmidhi"], short: "Tirmidhi", slug: "tirmidhi" },
  { patterns: ["Nasa'i", "Nasai"], short: "Nasai", slug: "nasai" },
  { patterns: ["Ibn Majah"], short: "Ibn Majah", slug: "ibnmajah" },
  { patterns: ["Ahmad"], short: "Ahmad", slug: "ahmad" },
];

// Files to convert
const SOURCE_FILES = [
  "src/data/prophets.ts",
  "src/data/prophet-family-tree.ts",
  "src/data/prophet-stories.ts",
  "src/app/barzakh/page.tsx",
  "src/app/day-of-judgement/page.tsx",
  "src/app/jannah/page.tsx",
  "src/app/articles-of-faith/page.tsx",
  "src/app/pillars/page.tsx",
  "src/app/tawhid/page.tsx",
  "src/app/dhikr/page.tsx",
  "src/app/duas/page.tsx",
  "src/app/why-islam/page.tsx",
  "src/app/prophet-muhammad/page.tsx",
  "src/app/ramadan/page.tsx",
  "src/app/salah/page.tsx",
  "src/app/sects/page.tsx",
  "src/app/miracles/page.tsx",
  "src/app/islamic-calendar/page.tsx",
];

function convertNumber(slug, globalNum) {
  const colMap = refMap[slug];
  if (!colMap) return null;
  return colMap[globalNum] || null;
}

let totalReplacements = 0;
let notFound = [];

for (const filePath of SOURCE_FILES) {
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, "utf-8");
  let fileReplacements = 0;

  // Build a single regex that matches all collection name variants followed by a number
  // Process each variant
  for (const variant of NAME_VARIANTS) {
    for (const pattern of variant.patterns) {
      // Escape special regex characters in the pattern
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Match: CollectionName <space> number (possibly followed by more comma-separated numbers or a range)
      // We handle: "Sahih al-Bukhari 3818", "Sahih al-Bukhari 3655-3671", "Sahih al-Bukhari 50, 2928, 3120"
      // IMPORTANT: Skip already-converted refs (number followed by colon) to prevent re-conversion
      const regex = new RegExp(
        `${escaped}\\s+(\\d+)(?!\\d*:)(?:-(\\d+))?(?:(,\\s*\\d+)*)`,
        'g'
      );

      content = content.replace(regex, (match, firstNum, rangeEnd, commaTail) => {
        // Handle range: "3655-3671"
        if (rangeEnd) {
          const ref1 = convertNumber(variant.slug, parseInt(firstNum));
          const ref2 = convertNumber(variant.slug, parseInt(rangeEnd));
          if (ref1 && ref2) {
            fileReplacements++;
            totalReplacements++;
            return `${variant.short} ${ref1}-${ref2}`;
          } else {
            // Can't convert range, try just the start
            if (ref1) {
              fileReplacements++;
              totalReplacements++;
              notFound.push(`${variant.slug}:${rangeEnd} (range end)`);
              return `${variant.short} ${ref1}-${rangeEnd}`;
            }
            notFound.push(`${variant.slug}:${firstNum}-${rangeEnd}`);
            return `${variant.short} ${firstNum}-${rangeEnd}`;
          }
        }

        // Handle comma-separated: "50, 2928, 3120"
        if (commaTail && commaTail.trim()) {
          const allNums = [firstNum, ...commaTail.match(/\d+/g)];
          const converted = allNums.map(n => {
            const ref = convertNumber(variant.slug, parseInt(n));
            if (ref) {
              fileReplacements++;
              totalReplacements++;
              return ref;
            } else {
              notFound.push(`${variant.slug}:${n}`);
              return n;
            }
          });
          return `${variant.short} ${converted.join(", ")}`;
        }

        // Single number
        const ref = convertNumber(variant.slug, parseInt(firstNum));
        if (ref) {
          fileReplacements++;
          totalReplacements++;
          return `${variant.short} ${ref}`;
        } else {
          notFound.push(`${variant.slug}:${firstNum}`);
          // Still shorten the name even if we can't convert the number
          return `${variant.short} ${firstNum}`;
        }
      });
    }
  }

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`${filePath}: ${fileReplacements} replacements`);
  } else {
    console.log(`${filePath}: no replacements needed`);
  }
}

console.log(`\nTotal replacements: ${totalReplacements}`);
if (notFound.length > 0) {
  // Deduplicate
  const unique = [...new Set(notFound)];
  console.log(`\nNot found in our data (${unique.length} unique):`);
  for (const nf of unique) {
    console.log(`  ${nf}`);
  }
}
