#!/usr/bin/env node
/**
 * Audit hadith references for RELEVANCE — does the hadith content
 * match what the page claims it's about?
 *
 * Outputs a CSV-like format: file, line, ref, page_context, hadith_snippet
 * for manual review, flagging suspicious mismatches.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/data/hadith');
const APP_DIR = path.join(ROOT, 'src/app');

const COLLECTION_MAP = {
  'bukhari': 'bukhari',
  'muslim': 'muslim',
  'tirmidhi': 'tirmidhi',
  'nasai': 'nasai',
  'abu dawud': 'abudawud',
  'abudawud': 'abudawud',
  'ibn majah': 'ibnmajah',
  'ibnmajah': 'ibnmajah',
  'ahmad': 'ahmad',
};

const hadithCache = {};

function loadBook(collection, bookId) {
  const key = `${collection}/${bookId}`;
  if (hadithCache[key]) return hadithCache[key];
  const filePath = path.join(DATA_DIR, collection, `${bookId}.json`);
  if (!fs.existsSync(filePath)) { hadithCache[key] = null; return null; }
  hadithCache[key] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return hadithCache[key];
}

function lookupHadith(collection, book, hadithNum) {
  const data = loadBook(collection, book);
  if (!data) return null;
  const hadiths = data.hadiths || data;
  if (!Array.isArray(hadiths)) return null;
  return hadiths.find(h => {
    if (h.reference) {
      const [, hNum] = h.reference.split(':');
      return parseInt(hNum) === hadithNum;
    }
    return h.id === hadithNum;
  });
}

function findTsxFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...findTsxFiles(fullPath));
    else if (entry.name === 'page.tsx') files.push(fullPath);
  }
  return files;
}

// Extract context around a reference — the surrounding object/JSX content
function getContext(lines, lineIdx, maxLines = 15) {
  const start = Math.max(0, lineIdx - maxLines);
  const end = Math.min(lines.length, lineIdx + maxLines);
  return lines.slice(start, end).join(' ')
    .replace(/[{}()<>\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, 500);
}

// Main output: TSV file for easy analysis
const files = findTsxFiles(APP_DIR);
const output = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const refPattern = /\b(Bukhari|Muslim|Tirmidhi|Nasai|Abu Dawud|Ibn Majah|Ahmad)\s+(\d+):(\d+)\b/gi;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    refPattern.lastIndex = 0;

    while ((match = refPattern.exec(line)) !== null) {
      const collName = match[1].toLowerCase();
      const collection = COLLECTION_MAP[collName];
      if (!collection) continue;

      const book = parseInt(match[2]);
      const hadithNum = parseInt(match[3]);
      const hadith = lookupHadith(collection, book, hadithNum);
      const relFile = path.relative(ROOT, file);
      const pageContext = getContext(lines, i);

      if (!hadith) {
        output.push({
          file: relFile,
          line: i + 1,
          ref: match[0],
          hadithSnippet: 'NOT FOUND',
          pageContext,
        });
      } else {
        const eng = (hadith.english || '').substring(0, 300);
        output.push({
          file: relFile,
          line: i + 1,
          ref: match[0],
          hadithSnippet: eng,
          pageContext,
        });
      }
    }
  }
}

// Write to JSON for further analysis
const outPath = path.join(ROOT, 'scripts/audit-results.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Wrote ${output.length} references to ${outPath}`);

// Now let's group by page and print a compact report
const byPage = {};
for (const item of output) {
  const page = item.file.replace('src/app/', '').replace('/page.tsx', '');
  if (!byPage[page]) byPage[page] = [];
  byPage[page].push(item);
}

for (const [page, refs] of Object.entries(byPage)) {
  console.log(`\n=== ${page} (${refs.length} refs) ===`);
}
