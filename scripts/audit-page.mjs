#!/usr/bin/env node
/**
 * Audit a single page's hadith references.
 * Usage: node scripts/audit-page.mjs <page-name>
 * e.g.:  node scripts/audit-page.mjs ramadan
 *
 * Outputs each reference with its surrounding context and the actual hadith text.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/data/hadith');

const COLLECTION_MAP = {
  'bukhari': 'bukhari',
  'muslim': 'muslim',
  'tirmidhi': 'tirmidhi',
  'nasai': 'nasai',
  'abu dawud': 'abudawud',
  'ibn majah': 'ibnmajah',
  'ahmad': 'ahmad',
};

const hadithCache = {};
function loadBook(collection, bookId) {
  const key = `${collection}/${bookId}`;
  if (hadithCache[key] !== undefined) return hadithCache[key];
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

// Load metadata for book names
function loadMetadata(collection) {
  const metaPath = path.join(DATA_DIR, collection, 'metadata.json');
  if (!fs.existsSync(metaPath)) return {};
  return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
}

const pageName = process.argv[2];
if (!pageName) {
  console.log('Usage: node scripts/audit-page.mjs <page-name>');
  process.exit(1);
}

// Find the page file
let pageFile;
const candidates = [
  path.join(ROOT, 'src/app', pageName, 'page.tsx'),
  ...fs.readdirSync(path.join(ROOT, 'src/app'), { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(ROOT, 'src/app', d.name, pageName, 'page.tsx'))
];

for (const c of candidates) {
  if (fs.existsSync(c)) { pageFile = c; break; }
}

if (!pageFile) {
  console.error(`Page not found: ${pageName}`);
  process.exit(1);
}

const content = fs.readFileSync(pageFile, 'utf-8');
const lines = content.split('\n');

// Extract structured context around each ref
const refPattern = /\b(Bukhari|Muslim|Tirmidhi|Nasai|Abu Dawud|Ibn Majah|Ahmad)\s+(\d+):(\d+)\b/gi;

let refNum = 0;
const seen = new Set();

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
    const refKey = `${collection}:${book}:${hadithNum}:${i}`;
    if (seen.has(refKey)) continue;
    seen.add(refKey);

    refNum++;
    const hadith = lookupHadith(collection, book, hadithNum);
    const meta = loadMetadata(collection);
    const bookInfo = meta.books?.find(b => b.id === book);
    const bookName = bookInfo ? bookInfo.name : '???';

    // Get surrounding context (look for title/description/content nearby)
    const contextStart = Math.max(0, i - 8);
    const contextEnd = Math.min(lines.length, i + 3);
    const context = lines.slice(contextStart, contextEnd)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//') && !l.startsWith('import'))
      .join(' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/className="[^"]*"/g, '')
      .replace(/\{|\}|\(|\)/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 300);

    console.log(`#${refNum} | Line ${i+1} | ${match[1]} ${book}:${hadithNum} (Book: ${bookName})`);
    if (hadith) {
      console.log(`  HADITH: ${(hadith.english || '').substring(0, 250)}`);
    } else {
      console.log(`  HADITH: NOT FOUND`);
    }
    console.log(`  CONTEXT: ${context}`);
    console.log();
  }
}

console.log(`Total: ${refNum} references in ${pageName}`);
