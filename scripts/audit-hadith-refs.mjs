#!/usr/bin/env node
/**
 * Audit all hadith references in content pages against our actual hadith data.
 *
 * For each reference found in TSX files, looks up the hadith in our data
 * and prints the english text so we can verify relevance.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/data/hadith');
const APP_DIR = path.join(ROOT, 'src/app');

// Map display names to folder names
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

// Cache loaded hadith data
const hadithCache = {};

function loadBook(collection, bookId) {
  const key = `${collection}/${bookId}`;
  if (hadithCache[key]) return hadithCache[key];

  const filePath = path.join(DATA_DIR, collection, `${bookId}.json`);
  if (!fs.existsSync(filePath)) {
    hadithCache[key] = null;
    return null;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  hadithCache[key] = data;
  return data;
}

function lookupHadith(collection, book, hadithNum) {
  const data = loadBook(collection, book);
  if (!data) return { found: false, error: `Book file not found: ${collection}/${book}.json` };

  const hadiths = data.hadiths || data;
  const hadith = Array.isArray(hadiths)
    ? hadiths.find(h => {
        // reference field is "book:hadith" format
        if (h.reference) {
          const [, hNum] = h.reference.split(':');
          return parseInt(hNum) === hadithNum;
        }
        return h.id === hadithNum;
      })
    : null;

  if (!hadith) return { found: false, error: `Hadith ${hadithNum} not found in ${collection} book ${book}` };

  return {
    found: true,
    english: (hadith.english || '').substring(0, 200),
    arabic: (hadith.arabic || '').substring(0, 100),
    reference: hadith.reference,
  };
}

// Find all TSX files in app dir (content pages)
function findTsxFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx') && entry.name === 'page.tsx') {
      files.push(fullPath);
    }
  }
  return files;
}

// Extract hadith references from a file
// Patterns: "Bukhari 30:32", "Muslim 4:257", "Abu Dawud 12:3", etc.
function extractRefs(content, filePath) {
  const refs = [];
  const lines = content.split('\n');

  // Pattern: CollectionName Book:Hadith
  const refPattern = /\b(Bukhari|Muslim|Tirmidhi|Nasai|Abu Dawud|Ibn Majah|Ahmad)\s+(\d+):(\d+)\b/gi;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    refPattern.lastIndex = 0;

    while ((match = refPattern.exec(line)) !== null) {
      const collName = match[1].toLowerCase();
      const collection = COLLECTION_MAP[collName];
      if (!collection) continue;

      refs.push({
        file: path.relative(ROOT, filePath),
        line: i + 1,
        raw: match[0],
        collection,
        collectionDisplay: match[1],
        book: parseInt(match[2]),
        hadith: parseInt(match[3]),
        context: line.trim().substring(0, 150),
      });
    }
  }

  return refs;
}

// Main
const files = findTsxFiles(APP_DIR);
let allRefs = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const refs = extractRefs(content, file);
  allRefs.push(...refs);
}

console.log(`Found ${allRefs.length} hadith references across ${files.length} page files.\n`);

let mismatches = 0;
let notFound = 0;
let verified = 0;

for (const ref of allRefs) {
  const result = lookupHadith(ref.collection, ref.book, ref.hadith);

  if (!result.found) {
    notFound++;
    console.log(`NOT FOUND | ${ref.file}:${ref.line}`);
    console.log(`  Ref: ${ref.raw}`);
    console.log(`  Error: ${result.error}`);
    console.log(`  Context: ${ref.context}`);
    console.log();
  } else {
    // Print all refs with their content for manual verification
    console.log(`FOUND | ${ref.file}:${ref.line}`);
    console.log(`  Ref: ${ref.raw}`);
    console.log(`  Hadith: ${result.english}`);
    console.log(`  Context: ${ref.context}`);
    console.log();
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total references: ${allRefs.length}`);
console.log(`Found in data: ${allRefs.length - notFound}`);
console.log(`Not found: ${notFound}`);
