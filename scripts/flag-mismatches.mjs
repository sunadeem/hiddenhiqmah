#!/usr/bin/env node
/**
 * Flag hadith references that are likely mismatched —
 * where the hadith content doesn't seem related to the page context.
 *
 * Uses keyword overlap as a heuristic.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const auditData = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/audit-results.json'), 'utf-8'));

// Common stop words to ignore
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'not', 'no', 'nor', 'so',
  'as', 'if', 'then', 'than', 'that', 'this', 'these', 'those', 'it',
  'its', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their',
  'we', 'us', 'our', 'you', 'your', 'who', 'whom', 'which', 'what',
  'when', 'where', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'up', 'out', 'about', 'into',
  'said', 'prophet', 'allah', 'messenger', 'narrated', 'reported',
  'upon', 'him', 'peace', 'blessings', 'pbuh', 'ibn', 'abu',
  // JSX/code noise
  'classname', 'div', 'span', 'text', 'true', 'false', 'null', 'return',
  'const', 'let', 'var', 'function', 'className', 'title', 'description',
  'reference', 'ref', 'content', 'source', 'data', 'name', 'type', 'id',
  'flex', 'items', 'center', 'gap', 'font', 'bold', 'medium', 'rounded',
  'px', 'py', 'mb', 'mt', 'ml', 'mr', 'bg', 'text', 'lg', 'xl', 'sm',
  'md', 'hover', 'transition', 'opacity', 'amber', 'emerald', 'slate',
  'gray', 'white', 'black', 'p', 'h1', 'h2', 'h3', 'map', 'key',
  'index', 'item', 'list', 'string', 'number', 'boolean', 'object',
  'hadith', 'bukhari', 'muslim', 'tirmidhi', 'nasai', 'dawud', 'majah',
  'ahmad', 'sahih', 'quran', 'one', 'also', 'day', 'book', 'like',
  'just', 'only', 'very', 'much', 'many', 'get', 'make', 'made',
  'after', 'before', 'over', 'between', 'back', 'through', 'during',
  'without', 'against', 'being', 'having', 'doing', 'going', 'come',
  'came', 'went', 'people', 'man', 'men', 'woman', 'women', 'time',
  'place', 'way', 'thing', 'things', 'know', 'see', 'take', 'give',
  'tell', 'say', 'asked', 'told', 'answered', 'heard', 'came',
]);

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
}

function keywordOverlap(contextWords, hadithWords) {
  const hadithSet = new Set(hadithWords);
  const matches = contextWords.filter(w => hadithSet.has(w));
  return matches;
}

// Topic keywords — what keywords should appear in hadiths for common topics
const TOPIC_KEYWORDS = {
  'suhoor': ['suhur', 'suhoor', 'sahur', 'meal', 'eat', 'dawn', 'fasting', 'blessing', 'fast', 'predawn'],
  'iftar': ['iftar', 'break', 'fast', 'fasting', 'sunset', 'dates', 'eating'],
  'fasting': ['fast', 'fasting', 'fasted', 'abstain', 'eat', 'drink', 'dawn', 'sunset'],
  'prayer': ['prayer', 'salat', 'salah', 'pray', 'prayed', 'praying', 'prostrat', 'bowing', 'ruku', 'sujud'],
  'zakat': ['zakat', 'charity', 'alms', 'sadaqah', 'poor', 'needy', 'wealth'],
  'hajj': ['hajj', 'pilgrim', 'kaaba', 'makkah', 'mecca', 'arafat', 'tawaf'],
  'funeral': ['funeral', 'death', 'dead', 'burial', 'shroud', 'janazah', 'grave', 'corpse'],
};

const flagged = [];

for (const item of auditData) {
  if (item.hadithSnippet === 'NOT FOUND') {
    flagged.push({ ...item, reason: 'NOT FOUND in data' });
    continue;
  }

  const contextWords = extractKeywords(item.pageContext);
  const hadithWords = extractKeywords(item.hadithSnippet);

  // Calculate overlap
  const overlap = keywordOverlap(contextWords, hadithWords);
  const overlapRatio = contextWords.length > 0 ? overlap.length / Math.min(contextWords.length, 10) : 0;

  // Flag if very low overlap (less than 10% of context keywords found in hadith)
  if (overlapRatio < 0.05 && contextWords.length > 5) {
    flagged.push({
      ...item,
      reason: `Low keyword overlap (${overlap.length}/${contextWords.length})`,
      overlap,
      contextKeywords: [...new Set(contextWords)].slice(0, 15),
      hadithKeywords: [...new Set(hadithWords)].slice(0, 15),
    });
  }
}

console.log(`\n=== FLAGGED REFERENCES (${flagged.length} / ${auditData.length}) ===\n`);

// Group by page
const byPage = {};
for (const item of flagged) {
  const page = item.file.replace('src/app/', '').replace('/page.tsx', '');
  if (!byPage[page]) byPage[page] = [];
  byPage[page].push(item);
}

for (const [page, refs] of Object.entries(byPage).sort()) {
  console.log(`\n--- ${page} (${refs.length} flagged) ---`);
  for (const ref of refs) {
    console.log(`  Line ${ref.line}: ${ref.ref}`);
    console.log(`    Reason: ${ref.reason}`);
    console.log(`    Hadith: ${ref.hadithSnippet.substring(0, 150)}...`);
    if (ref.contextKeywords) {
      console.log(`    Page keywords: ${ref.contextKeywords.join(', ')}`);
      console.log(`    Hadith keywords: ${ref.hadithKeywords.join(', ')}`);
    }
    console.log();
  }
}

// Write flagged to file
fs.writeFileSync(
  path.join(ROOT, 'scripts/flagged-refs.json'),
  JSON.stringify(flagged, null, 2)
);
console.log(`\nWrote ${flagged.length} flagged references to scripts/flagged-refs.json`);
