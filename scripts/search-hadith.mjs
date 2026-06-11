#!/usr/bin/env node
/**
 * Search hadith data by keywords.
 * Usage: node scripts/search-hadith.mjs <collection> "<keywords>"
 * Or:    node scripts/search-hadith.mjs all "<keywords>"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src/data/hadith');

const collection = process.argv[2];
const keywords = process.argv[3]?.toLowerCase().split(/\s+/) || [];

if (!collection || keywords.length === 0) {
  console.log('Usage: node search-hadith.mjs <collection|all> "<keywords>"');
  process.exit(1);
}

const collections = collection === 'all'
  ? fs.readdirSync(DATA_DIR).filter(d => !d.endsWith('.json'))
  : [collection];

const results = [];

for (const coll of collections) {
  const collDir = path.join(DATA_DIR, coll);
  if (!fs.existsSync(collDir)) continue;

  const files = fs.readdirSync(collDir).filter(f => f.endsWith('.json') && f !== 'metadata.json');

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(collDir, file), 'utf-8'));
    const hadiths = data.hadiths || data;
    if (!Array.isArray(hadiths)) continue;

    for (const h of hadiths) {
      const text = (h.english || '').toLowerCase();
      const matchCount = keywords.filter(k => text.includes(k)).length;
      if (matchCount >= Math.max(1, Math.ceil(keywords.length * 0.5))) {
        results.push({
          collection: coll,
          reference: h.reference,
          matchCount,
          snippet: (h.english || '').substring(0, 250),
        });
      }
    }
  }
}

results.sort((a, b) => b.matchCount - a.matchCount);

for (const r of results.slice(0, 20)) {
  console.log(`${r.collection} ${r.reference} (${r.matchCount}/${keywords.length} keywords)`);
  console.log(`  ${r.snippet}`);
  console.log();
}

if (results.length === 0) {
  console.log('No matches found.');
} else if (results.length > 20) {
  console.log(`... and ${results.length - 20} more results`);
}
