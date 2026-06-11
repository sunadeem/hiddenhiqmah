#!/usr/bin/env node
/**
 * Deep audit: for each hadith reference in content pages, shows the book name
 * and hadith snippet so we can verify relevance. Focuses on flagging clear mismatches.
 *
 * Suspicious = the book topic doesn't match the page topic at all.
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
const metaCache = {};

function loadBook(collection, bookId) {
  const key = `${collection}/${bookId}`;
  if (hadithCache[key] !== undefined) return hadithCache[key];
  const filePath = path.join(DATA_DIR, collection, `${bookId}.json`);
  if (!fs.existsSync(filePath)) { hadithCache[key] = null; return null; }
  hadithCache[key] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return hadithCache[key];
}

function loadMeta(collection) {
  if (metaCache[collection]) return metaCache[collection];
  const metaPath = path.join(DATA_DIR, collection, 'metadata.json');
  if (!fs.existsSync(metaPath)) { metaCache[collection] = {}; return {}; }
  metaCache[collection] = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  return metaCache[collection];
}

function lookupHadith(collection, book, hadithNum) {
  const data = loadBook(collection, book);
  if (!data) return null;
  const hadiths = Array.isArray(data) ? data : data.hadiths || [];
  if (!Array.isArray(hadiths)) return null;
  return hadiths.find(h => {
    if (h.reference) {
      const [, hNum] = h.reference.split(':');
      return parseInt(hNum) === hadithNum;
    }
    return h.id === hadithNum;
  });
}

function getBookName(collection, bookId) {
  const meta = loadMeta(collection);
  const book = meta.books?.find(b => b.id === bookId);
  return book ? book.name : '???';
}

// Get page topic from the directory name
function getPageTopic(pagePath) {
  const rel = path.relative(path.join(ROOT, 'src/app'), pagePath);
  return rel.split('/')[0];
}

// Get the surrounding lines as context
function getContext(lines, lineIdx) {
  const start = Math.max(0, lineIdx - 10);
  const end = Math.min(lines.length, lineIdx + 5);
  return lines.slice(start, end).join(' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/className="[^"]*"/g, '')
    .replace(/[{}()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 300);
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

// Skip pages we've already fixed
const skipPages = new Set(['ramadan']);
const pageName = process.argv[2]; // Optional: audit only one page

const files = findTsxFiles(path.join(ROOT, 'src/app'));
const refPattern = /\b(Bukhari|Muslim|Tirmidhi|Nasai|Abu Dawud|Ibn Majah|Ahmad)\s+(\d+):(\d+)\b/gi;

let totalRefs = 0;
let flagged = 0;

for (const file of files) {
  const topic = getPageTopic(file);
  if (skipPages.has(topic)) continue;
  if (pageName && topic !== pageName) continue;

  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const seen = new Set();
  let pageRefs = 0;
  let pageFlagged = 0;

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

      totalRefs++;
      pageRefs++;

      const hadith = lookupHadith(collection, book, hadithNum);
      const bookName = getBookName(collection, book);
      const context = getContext(lines, i);
      const snippet = hadith ? (hadith.english || '').substring(0, 200) : 'NOT FOUND';

      // Check if the hadith content is relevant to the context
      const contextLower = context.toLowerCase();
      const snippetLower = snippet.toLowerCase();

      // Flag if the hadith text seems completely unrelated
      // We check for some keyword overlap
      const contextWords = contextLower.split(/\s+/).filter(w => w.length > 4);
      const snippetWords = snippetLower.split(/\s+/).filter(w => w.length > 4);
      const snippetSet = new Set(snippetWords);
      const overlap = contextWords.filter(w => snippetSet.has(w));

      // Flag if zero overlap and snippet is not a short chain reference
      const isShortChain = snippet.length < 80;
      const hasOverlap = overlap.length > 0;

      if (!hasOverlap && !isShortChain) {
        flagged++;
        pageFlagged++;
        console.log(`FLAG | ${topic} L${i+1} | ${match[1]} ${book}:${hadithNum} (${bookName})`);
        console.log(`  HADITH: ${snippet}`);
        console.log(`  CONTEXT: ${context.substring(0, 200)}`);
        console.log();
      }
    }
  }

  if (pageRefs > 0 && pageFlagged > 0) {
    console.log(`--- ${topic}: ${pageFlagged}/${pageRefs} flagged ---\n`);
  }
}

console.log(`\n=== TOTAL: ${flagged}/${totalRefs} flagged across all pages ===`);
