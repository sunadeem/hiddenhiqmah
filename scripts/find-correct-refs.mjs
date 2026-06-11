#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src/data/hadith');

function search(coll, keywords, minRatio = 0.6) {
  const dir = path.join(DATA_DIR, coll);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'metadata.json');
  const found = [];
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
    const hadiths = data.hadiths || data;
    if (!Array.isArray(hadiths)) continue;
    for (const h of hadiths) {
      const text = (h.english || '').toLowerCase();
      const matchCount = keywords.filter(k => text.includes(k.toLowerCase())).length;
      if (matchCount >= Math.ceil(keywords.length * minRatio)) {
        found.push({ ref: h.reference, match: matchCount, text: (h.english || '').substring(0, 180) });
      }
    }
  }
  found.sort((a, b) => b.match - a.match);
  return found.slice(0, 5);
}

const searches = [
  { desc: 'Gates paradise opened ramadan (Bukhari)', coll: 'bukhari', kw: ['gates', 'paradise', 'opened', 'ramadan'] },
  { desc: 'Fasting is a shield (Bukhari)', coll: 'bukhari', kw: ['fasting', 'shield'] },
  { desc: 'Fasting is a shield (Muslim)', coll: 'muslim', kw: ['fasting', 'shield'] },
  { desc: 'Previous sins forgiven ramadan (Muslim)', coll: 'muslim', kw: ['ramadan', 'forgiven', 'faith'] },
  { desc: 'Suhoor blessing (Bukhari)', coll: 'bukhari', kw: ['suhur', 'blessing'] },
  { desc: 'Suhoor blessing alt (Bukhari)', coll: 'bukhari', kw: ['sahur', 'blessing'] },
  { desc: 'Suhoor blessing (Muslim)', coll: 'muslim', kw: ['meal', 'dawn', 'blessing'] },
  { desc: 'Reward fasting Allah alone (Bukhari)', coll: 'bukhari', kw: ['fasting', 'except fasting', 'reward'] },
  { desc: 'Reward fasting (Muslim)', coll: 'muslim', kw: ['except fasting', 'reward'] },
  { desc: 'Jibreel Quran ramadan (Bukhari)', coll: 'bukhari', kw: ['gabriel', 'quran', 'ramadan'] },
  { desc: 'Jibreel Quran ramadan alt (Bukhari)', coll: 'bukhari', kw: ['jibril', 'quran', 'ramadan'] },
  { desc: 'Jibreel generous (Bukhari)', coll: 'bukhari', kw: ['generous', 'wind', 'ramadan'] },
  { desc: 'Forgets eats fasting (Bukhari)', coll: 'bukhari', kw: ['forgets', 'eats', 'fast', 'complete'] },
  { desc: 'Laylatul Qadr prayer forgiven (Bukhari)', coll: 'bukhari', kw: ['qadr', 'prayer', 'forgiven'] },
  { desc: 'Laylatul Qadr night (Bukhari)', coll: 'bukhari', kw: ['night', 'qadr', 'forgiven'] },
  { desc: 'Laylatul Qadr signs (Muslim)', coll: 'muslim', kw: ['qadr', 'sun', 'morning'] },
  { desc: 'Laylatul Qadr calm (Muslim)', coll: 'muslim', kw: ['qadr', 'night', 'calm'] },
  { desc: 'Intimacy kaffarah (Bukhari)', coll: 'bukhari', kw: ['intercourse', 'ramadan'] },
  { desc: 'Intimacy kaffarah (Muslim)', coll: 'muslim', kw: ['intercourse', 'ramadan', 'sixty'] },
  { desc: 'Cupping fasting (Bukhari)', coll: 'bukhari', kw: ['cupped', 'fasting'] },
  { desc: 'Menstruation make up fasts (Bukhari)', coll: 'bukhari', kw: ['make up', 'fasts', 'prayers'] },
  { desc: 'Menstruation make up fasts (Muslim)', coll: 'muslim', kw: ['make up', 'fasts', 'prayers'] },
  { desc: 'Aisha shaban fasts (Muslim)', coll: 'muslim', kw: ['aisha', 'sha\'ban'] },
  { desc: 'Travelers fast journey (Muslim)', coll: 'muslim', kw: ['journey', 'fast', 'traveler'] },
  { desc: 'Travelers fasting concession (Muslim)', coll: 'muslim', kw: ['journey', 'fast', 'break'] },
  { desc: 'Kaffarah sixty days (Bukhari)', coll: 'bukhari', kw: ['sixty', 'days', 'fast'] },
  { desc: 'Kaffarah (Muslim)', coll: 'muslim', kw: ['sixty', 'days', 'fast'] },
  { desc: 'Itikaf last ten (Bukhari)', coll: 'bukhari', kw: ['observe', 'itikaf'] },
  { desc: 'Itikaf last ten alt (Bukhari)', coll: 'bukhari', kw: ['seclusion', 'last ten'] },
  { desc: 'Itikaf (Muslim)', coll: 'muslim', kw: ['i\'tikaf', 'last ten'] },
  { desc: 'Itikaf alt (Muslim)', coll: 'muslim', kw: ['itikaf', 'ten'] },
  { desc: 'Forbade fasting eid (Bukhari)', coll: 'bukhari', kw: ['forbade', 'fasting', 'eid'] },
  { desc: 'Forbade fast two days (Bukhari)', coll: 'bukhari', kw: ['fasting', 'two days', 'fitr'] },
  { desc: 'Forbade fasting eid (Muslim)', coll: 'muslim', kw: ['forbade', 'fasting', 'fitr'] },
  { desc: 'Forbade fast eid alt (Muslim)', coll: 'muslim', kw: ['fasting', 'two days'] },
  { desc: 'Eid different route (Bukhari)', coll: 'bukhari', kw: ['eid', 'different', 'route'] },
  { desc: 'Eid different way (Bukhari)', coll: 'bukhari', kw: ['eid', 'different', 'way'] },
  { desc: 'Miswak (Bukhari)', coll: 'bukhari', kw: ['siwak'] },
  { desc: 'Miswak alt (Bukhari)', coll: 'bukhari', kw: ['miswak'] },
  { desc: 'Zakat fitr (Bukhari)', coll: 'bukhari', kw: ['fitr', 'dates', 'barley'] },
  { desc: 'Zakat fitr (Muslim)', coll: 'muslim', kw: ['fitr', 'dates', 'barley'] },
  { desc: 'Zakat fitr (Muslim) alt', coll: 'muslim', kw: ['zakat', 'fitr'] },
  { desc: 'Hasten break fast (Bukhari)', coll: 'bukhari', kw: ['hasten', 'breaking', 'fast'] },
  { desc: 'Hasten iftar (Bukhari)', coll: 'bukhari', kw: ['hasten', 'iftar'] },
  { desc: 'Children fast ashura (Bukhari)', coll: 'bukhari', kw: ['children', 'fast'] },
  { desc: 'Died ought fast (Bukhari)', coll: 'bukhari', kw: ['died', 'fast', 'behalf'] },
  { desc: 'Eid celebration (Bukhari)', coll: 'bukhari', kw: ['celebration', 'eid'] },
  { desc: 'Eid festival (Bukhari)', coll: 'bukhari', kw: ['festival', 'every nation'] },
  { desc: 'Ghusl Eid eat (Bukhari)', coll: 'bukhari', kw: ['eid', 'eat', 'dates', 'before'] },
  { desc: 'Combing hair itikaf (Muslim)', coll: 'muslim', kw: ['comb', 'hair', 'itikaf'] },
  { desc: 'Combing hair itikaf (Bukhari)', coll: 'bukhari', kw: ['comb', 'hair'] },
  { desc: 'Itikaf wives (Bukhari)', coll: 'bukhari', kw: ['wives', 'itikaf'] },
  { desc: 'Aisha comb head (Bukhari)', coll: 'bukhari', kw: ['aisha', 'head', 'mosque'] },
];

for (const s of searches) {
  const results = search(s.coll, s.kw);
  console.log(`--- ${s.desc} ---`);
  if (results.length) {
    for (const r of results.slice(0, 3)) {
      console.log(`  ${s.coll} ${r.ref} (${r.match}/${s.kw.length}): ${r.text}`);
    }
  } else {
    console.log('  NO MATCH');
  }
  console.log();
}
