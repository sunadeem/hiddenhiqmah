#!/usr/bin/env node
/**
 * Find references where the hadith book topic clearly doesn't match the page topic.
 * This catches systematic numbering errors (e.g., Book 23 Funerals showing up in fasting context).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/data/hadith');

const COLLECTION_MAP = {
  'bukhari': 'bukhari', 'muslim': 'muslim', 'tirmidhi': 'tirmidhi',
  'nasai': 'nasai', 'abu dawud': 'abudawud', 'ibn majah': 'ibnmajah', 'ahmad': 'ahmad',
};

const metaCache = {};
function loadMeta(collection) {
  if (metaCache[collection]) return metaCache[collection];
  const metaPath = path.join(DATA_DIR, collection, 'metadata.json');
  if (!fs.existsSync(metaPath)) { metaCache[collection] = {}; return {}; }
  metaCache[collection] = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  return metaCache[collection];
}

function getBookName(collection, bookId) {
  const meta = loadMeta(collection);
  const book = meta.books?.find(b => b.id === bookId);
  return book ? book.name : '???';
}

// Page topics and what book topics would be WRONG for them
// If a reference points to an obviously unrelated book, it's likely a numbering error
const PAGE_EXPECTED_TOPICS = {
  'salah': ['prayer', 'salat', 'worship', 'call', 'adhan', 'mosque', 'night', 'prostrat', 'witr', 'tahajjud', 'eclipse', 'fear', 'friday', 'shorten', 'virtue', 'action', 'forget', 'recit', 'qur'],
  'pillars': ['faith', 'prayer', 'zakat', 'fasting', 'hajj', 'pilgrim', 'charity', 'belief', 'islam', 'shahadah'],
  'prophet-muhammad': [], // broad topic - many books could be relevant
  'day-of-judgement': ['judgement', 'resurrection', 'afterlife', 'fire', 'paradise', 'reckoning', 'afflict', 'end', 'world', 'heart', 'soft'],
  'jannah': ['paradise', 'garden', 'reward', 'afterlife', 'heart', 'soft', 'zuhd'],
  'barzakh': ['grave', 'funeral', 'death', 'dead', 'afterlife', 'soul', 'afflict'],
  'duas': ['invocation', 'supplication', 'prayer', 'remembrance'],
  'dhikr': ['remembrance', 'invocation', 'supplication', 'prayer', 'heart'],
  'articles-of-faith': ['faith', 'belief', 'angel', 'qadr', 'decree', 'prophet', 'book', 'resurrection'],
  'islamic-calendar': [], // broad
  'miracles': [], // broad
  'tawhid': ['oneness', 'faith', 'belief', 'monotheism', 'tawheed', 'uniqueness'],
  'sects': [], // broad
  'why-islam': [], // broad
};

function findTsxFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...findTsxFiles(fullPath));
    else if (entry.name === 'page.tsx') files.push(fullPath);
  }
  return files;
}

const skipPages = new Set(['ramadan']);
const refPattern = /\b(Bukhari|Muslim|Tirmidhi|Nasai|Abu Dawud|Ibn Majah|Ahmad)\s+(\d+):(\d+)\b/gi;
const files = findTsxFiles(path.join(ROOT, 'src/app'));

const results = {};

for (const file of files) {
  const rel = path.relative(path.join(ROOT, 'src/app'), file);
  const topic = rel.split('/')[0];
  if (skipPages.has(topic)) continue;

  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
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
      const key = `${topic}:${i}:${collection}:${book}:${hadithNum}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const bookName = getBookName(collection, book).toLowerCase();

      // Get surrounding context (look for the content/topic description)
      const contextStart = Math.max(0, i - 8);
      const contextEnd = Math.min(lines.length, i + 3);
      const context = lines.slice(contextStart, contextEnd).join(' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/className="[^"]*"/g, '')
        .replace(/[{}()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 300);

      if (!results[topic]) results[topic] = [];
      results[topic].push({
        line: i + 1,
        ref: `${match[1]} ${book}:${hadithNum}`,
        collection,
        book,
        hadithNum,
        bookName: getBookName(collection, book),
        context: context.substring(0, 150),
      });
    }
  }
}

// Output grouped by page with book names
for (const [page, refs] of Object.entries(results).sort()) {
  console.log(`\n=== ${page} (${refs.length} refs) ===`);
  for (const r of refs) {
    console.log(`  L${r.line}: ${r.ref} [${r.bookName}]`);
  }
}
