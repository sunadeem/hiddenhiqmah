#!/usr/bin/env node
/**
 * Asserts that /small-deeds' dhikr transliterations still say what their sources
 * say — that each one covers its block's Arabic exactly, AND that it matches the
 * vowels that Arabic actually carries.
 *
 *   node apps/web/scripts/verify-small-deeds-translit.mjs
 *
 * WHY THIS EXISTS. The Arabic on that page is machine-cut from the hadith corpus
 * and proved by verify-page-citations.mjs. The Latin beside it is pronunciation
 * guidance for worship, and until it existed nothing checked it at all — a hand
 * edit to duas.json, to the SAY table, to the dhikr counter or to
 * small-deeds-translit.ts could put them out of step and no build would notice.
 * A wrong line here teaches someone to say dhikr wrongly, and they do not find
 * out.
 *
 * WHAT IT PROVES
 *   1. Every SAY block has a transliteration and a provenance note, and there
 *      are no orphans of either.
 *   2. Every line claiming a source RE-DERIVES from packages/content/duas.json,
 *      byte for byte, by the edit its own `edit` field describes. A "verbatim"
 *      line must equal the dua; a cut must be the dua with exactly the declared
 *      slice or splice and nothing else.
 *   3. Span correspondence: Arabic word count and Latin word count reconcile
 *      through the scheme's documented merges and splits, so no word on screen
 *      goes unvoiced and no word is voiced that is not on screen. THIS is the
 *      check that catches a dua being pasted over a shorter or longer cut.
 *   4. VOWEL correspondence for وَهْوَ / وَهُوَ — the one place on this page where
 *      two narrations of one formula are pointed differently and the Latin has
 *      to follow each. Checked on the codepoints, not on a count.
 *   5. The Latin stays inside duas.json's own character inventory — ASCII, the
 *      straight apostrophe, no smart quotes smuggled in by an editor.
 *   6. The dhikr counter (apps/web/src/lib/dhikr/catalog.ts) — the app's THIRD
 *      transliteration source of record, linked to from this page — spells
 *      byte-identical Arabic the same way this page does.
 *   7. No Qur'an key leaks into the dhikr table: those come from the app's
 *      Qur'an reader via AYAH[k].textTranslit and must keep coming from there.
 *   8. The provenance notes stay OUT of the client bundle: nothing under src/
 *      imports small-deeds-translit.provenance.ts.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(HERE, "..");
const REPO = path.resolve(WEB, "../..");

const A = "'"; // the straight apostrophe the corpus uses, kept out of the literals below

/* ── Arabic, by codepoint ────────────────────────────────────────────────────
 *
 * ⛔ NO VOWELLED ARABIC LITERAL IS TYPED ANYWHERE IN THIS FILE. The corpus writes
 * اللَّهِ as lam+SHADDA+FATHA; the same glyph typed by hand comes out
 * lam+FATHA+SHADDA. They render identically and compare unequal, so a hand-typed
 * literal silently matches nothing and every assertion built on it "passes"
 * while proving nothing. Bare skeletons (no marks) are safe and are used for the
 * merge/split tables; anything that depends on a MARK is written as an escape.
 */
const WAW = "و"; //  و
const HA = "ه"; //  ه
const LAM = "ل"; //  ل
const KAF = "ك"; //  ك
const SUKUN = "ْ";
const DAMMA = "ُ";
const FATHA = "َ";
/** Any Arabic combining mark, as a character class body. */
const MARKS = "\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640";

/** Drop every mark, fold the alef/ya variants, drop the corpus' punctuation. */
const strip = (s) =>
  s
    .replace(new RegExp(`[${MARKS}]`, "g"), "")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[،.,;]/g, "");

/* ── load ───────────────────────────────────────────────────────────────── */

const duas = Object.fromEntries(
  JSON.parse(fs.readFileSync(path.join(REPO, "packages/content/duas.json"), "utf8")).duas.map(
    (d) => [d.id, d]
  )
);

const generated = fs.readFileSync(
  path.join(WEB, "src/data/small-deeds-quotes.generated.ts"),
  "utf8"
);

/** Pull a `export const NAME: T = { …json… };` table out of the generated file.
 *  It is machine-written as strict JSON, so this is safe. */
function table(name) {
  const at = generated.indexOf(`export const ${name}`);
  if (at < 0) throw new Error(`no ${name} in small-deeds-quotes.generated.ts`);
  return JSON.parse(generated.slice(generated.indexOf("= {", at) + 2, generated.indexOf("\n};", at) + 2));
}

const SAY = table("SAY");

/** The rendered table — `Record<SayId, string>`, one string literal per key. */
const translitSrc = fs.readFileSync(path.join(WEB, "src/data/small-deeds-translit.ts"), "utf8");
const TRANSLIT = {};
{
  const body = translitSrc.slice(translitSrc.indexOf("export const SAY_TRANSLIT"));
  for (const m of body.matchAll(/^ {2}"?([a-z0-9-]+)"?:\s*\n?\s*("(?:[^"\\]|\\.)*"),$/gm))
    TRANSLIT[m[1]] = JSON.parse(m[2]);
}

/** The provenance table, which lives in its own module precisely so it does not
 *  ship. Only its keys and `provenance` values are checked here. */
const provSrc = fs.readFileSync(
  path.join(WEB, "src/data/small-deeds-translit.provenance.ts"),
  "utf8"
);
const PROV = {};
{
  const body = provSrc.slice(provSrc.indexOf("export const SAY_TRANSLIT_PROVENANCE"));
  for (const m of body.matchAll(/^ {2}"?([a-z0-9-]+)"?:\s*\{$/gm)) {
    const block = body.slice(m.index, body.indexOf("\n  },", m.index));
    const f = block.match(/provenance:\s*("(?:[^"\\]|\\.)*")/);
    PROV[m[1]] = f ? JSON.parse(f[1]) : undefined;
  }
}

/** The dhikr counter — the app's third transliteration source of record. */
const catalogSrc = fs.readFileSync(path.join(WEB, "src/lib/dhikr/catalog.ts"), "utf8");
const CATALOG = {};
for (const m of catalogSrc.matchAll(
  /key:\s*"([a-z_0-9]+)",[\s\S]*?arabic:\s*("(?:[^"\\]|\\.)*"),[\s\S]*?translit:\s*\n?\s*("(?:[^"\\]|\\.)*"),/g
))
  CATALOG[m[1]] = { arabic: JSON.parse(m[2]), translit: JSON.parse(m[3]) };

/* ── checks ─────────────────────────────────────────────────────────────── */

const results = [];
const ok = (cond, msg) => results.push([Boolean(cond), msg]);

// 1 — coverage, both directions, across BOTH modules.
const sayIds = Object.keys(SAY);
ok(
  sayIds.every((id) => TRANSLIT[id]),
  `all ${sayIds.length} SAY blocks have a transliteration`
);
ok(Object.keys(TRANSLIT).every((id) => SAY[id]), "no transliteration without a SAY block (no orphans)");
ok(
  sayIds.every((id) => PROV[id]) && Object.keys(PROV).every((id) => SAY[id]),
  "provenance notes cover exactly the same keys — no unexplained line, no orphan note"
);
ok(
  Object.values(PROV).every((p) => ["duas-local", "duas-local-cut", "authored"].includes(p)),
  "every block declares a provenance from the allowed set"
);

// 8 — the notes must not reach a user. `SAY_TRANSLIT` is indexed dynamically, so
// a bundler cannot prune sibling fields; the ONLY thing keeping ~5KB of review
// prose out of the iOS/Android bundle is that no module imports it.
const importers = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".provenance.ts")) {
      if (/from\s+["'][^"']*small-deeds-translit\.provenance["']/.test(fs.readFileSync(p, "utf8")))
        importers.push(path.relative(WEB, p));
    }
  }
};
walk(path.join(WEB, "src"));
ok(
  importers.length === 0,
  `nothing under src/ imports the provenance module${importers.length ? ` — found ${importers.join(", ")}` : ""}`
);

// 7 — Qur'an must not be re-authored here.
const AYAH = table("AYAH");
ok(
  Object.keys(TRANSLIT).every((id) => !AYAH[id]),
  "no Qur'an key in the dhikr table (ayat come from AYAH[k].textTranslit)"
);
ok(
  Object.values(AYAH).every((a) => typeof a.textTranslit === "string" && a.textTranslit.length > 0),
  `all ${Object.keys(AYAH).length} ayah slots still carry the reader's own textTranslit`
);
// …and it must be a corpus copy, not a fork. Byte-compare against the reader's
// own file, so a hand edit to either side fails here rather than on a device.
{
  let drift = 0;
  for (const a of Object.values(AYAH)) {
    const [s, n] = a.citation.replace("Quran ", "").split(":").map(Number);
    const v = JSON.parse(
      fs.readFileSync(path.join(REPO, `packages/content/quran/verses/${s}.json`), "utf8")
    ).find((x) => x.number === n);
    if (!v || v.textTranslit !== a.textTranslit || v.textAr !== a.textAr) drift++;
  }
  ok(drift === 0, "every ayah's textAr + textTranslit is byte-identical to the Qur'an reader's corpus");
}

// 2 — re-derive every sourced line from duas.json.
const T = (id) => TRANSLIT[id];

ok(T("subhanallah-100") === duas["subhanallah-wa-bihamdihi"].transliteration,
  "subhanallah-100 === duas#subhanallah-wa-bihamdihi, verbatim");
ok(T("tasbih-hundredth") === duas["tahleel"].transliteration,
  "tasbih-hundredth === duas#tahleel, verbatim");

// 4 — VOWEL CORRESPONDENCE. وَهْوَ (hāʾ + SUKŪN) is /wahwa/; وَهُوَ (hāʾ + ḌAMMA)
// is /wahuwa/ — one syllable more. Four rows carry this word and the corpus
// points it BOTH ways, so a single spelling cannot be right for all four.
//
// ⛔ Detected by CODEPOINT, never by a hand-typed vowelled literal. Typing وَهْوَ
// into this file is the mark-order trap the header of the data file warns about:
// it renders identically and compares unequal. U+0647 U+0652 is unambiguous
// because a sukūn is the only mark on that letter.
const HA_SUKUN = new RegExp(HA + SUKUN); // هْ — the contracted reading, /hw/
const HA_DAMMA = new RegExp(HA + DAMMA); // هُ — the full reading, /hu/
const WA_HUWA_SKELETON = WAW + HA + WAW; // وهو, unpointed
const contracted = [];
const full = [];
for (const id of sayIds) {
  for (const w of SAY[id].arabic.split(/\s+/)) {
    if (strip(w) !== WA_HUWA_SKELETON) continue;
    if (!HA_SUKUN.test(w) && !HA_DAMMA.test(w))
      throw new Error(`${id}: ${WA_HUWA_SKELETON} is pointed neither sukūn nor ḍamma — unhandled`);
    (HA_SUKUN.test(w) ? contracted : full).push(id);
  }
}
ok(contracted.length === 2 && full.length === 2,
  `the corpus points this word both ways — ${contracted.length} row(s) وَهْوَ, ${full.length} row(s) وَهُوَ`);
ok(
  contracted.every((id) => / wahwa /.test(T(id))) && contracted.every((id) => !/ wa huwa /.test(T(id))),
  `rows written with a sukūn (${contracted.join(", ")}) render 'wahwa', never 'wa huwa'`
);
ok(
  full.every((id) => / wa huwa /.test(T(id))) && full.every((id) => !/wahwa/.test(T(id))),
  `rows written with a ḍamma (${full.join(", ")}) render 'wa huwa', never 'wahwa'`
);
// The head of tahlil-100 is duas#tahleel with that ONE substitution and nothing else.
ok(
  T("tahlil-100") === duas["tahleel"].transliteration.replace(" wa huwa ", " wahwa "),
  "tahlil-100 === duas#tahleel + ONLY the وَهْوَ re-vowelling"
);
// The two rows differ ONLY there — their Arabic differs only in marks.
{
  const bare = (s) => strip(s).replace(/\s+/g, " ").trim();
  ok(
    bare(SAY["tahlil-100"].arabic) === bare(SAY["tasbih-hundredth"].arabic),
    "tahlil-100 and tasbih-hundredth are the same 17 words — they differ only in pointing"
  );
  ok(
    T("tahlil-100").replace("wahwa", "wa huwa") === T("tasbih-hundredth"),
    "…and their Latin differs at that one word and nowhere else"
  );
}

// the single-word splice, and nothing else
const withLaka = duas["sayyid-al-istighfar"].transliteration.replace(
  `wa abu${A}u bi dhanbi`,
  `wa abu${A}u laka bi dhanbi`
);
ok(T("sayyid-al-istighfar") === withLaka,
  "sayyid-al-istighfar === duas#sayyid-al-istighfar + ONLY the 'laka' splice");
ok(duas["sayyid-al-istighfar"].transliteration.includes(`abu${A}u laka bi ni${A}matika`),
  "…and 'laka' is copied from this same source line, not authored");

// …and the splice is REQUIRED, not tidying: /small-deeds and /duas quote
// DIFFERENT NARRATIONS of this dua and their Arabic differs by this word.
// Counted on the unpointed skeleton (LAM+KAF) so no vowelled literal is typed.
// Deleting the insertion to make the two pages "agree" would leave a word on
// this screen unvoiced — hence the assertion.
{
  const LAKA = LAM + KAF;
  const countAr = (s) => strip(s).split(/\s+/).filter((w) => w === LAKA).length;
  const countLat = (s) => s.split(/\s+/).filter((w) => w.replace(/[,.]/g, "") === "laka").length;
  const here = countAr(SAY["sayyid-al-istighfar"].arabic);
  const there = countAr(duas["sayyid-al-istighfar"].arabic);
  ok(
    here === 2 && there === 1,
    `the two narrations differ: this row's Arabic carries ${here} laka, duas.json's ${there}`
  );
  ok(
    countLat(T("sayyid-al-istighfar")) === here &&
      countLat(duas["sayyid-al-istighfar"].transliteration) === there,
    "…and each page's Latin voices exactly as many as its own Arabic carries"
  );
}

// the two-word splice, and nothing else
ok(
  T("tahlil-ten") ===
    duas["tahleel"].transliteration.replace("wa lahul-hamdu ", "wa lahul-hamdu yuhyi wa yumeetu "),
  "tahlil-ten === duas#tahleel + ONLY the 'yuhyi wa yumeetu' splice"
);

// 6 — the dhikr counter, for Arabic that is byte-identical to a Say block.
{
  const pairs = [];
  for (const [sid, s] of Object.entries(SAY))
    for (const [cid, c] of Object.entries(CATALOG)) if (c.arabic === s.arabic) pairs.push([sid, cid]);
  ok(pairs.length > 0, `found ${pairs.length} Say block(s) whose Arabic is === a dhikr-counter entry`);
  for (const [sid, cid] of pairs)
    ok(
      CATALOG[cid].translit === T(sid),
      `catalog.ts#${cid} spells its Arabic exactly as SAY_TRANSLIT["${sid}"] does (same bytes in, same bytes out)`
    );
}

// four-words takes 'walhamdu' from the corpus rather than from a rule.
ok(
  Object.values(duas).some((d) => / walhamdu lillah/.test(d.transliteration)) &&
    T("four-words").includes("walhamdu lillahi"),
  "four-words' 'walhamdu' is duas.json's own spelling of وَالْحَمْدُ لِلَّهِ, not an invented hyphenation"
);

// the cut, and nothing else
const CUT = `Ibrahima wa ${A}ala `;
const src = duas["salawat-in-prayer"].transliteration;
ok(src.split(CUT).length - 1 === 2, "the salawat cut matches its source exactly twice");
ok(T("salawat") === src.split(CUT).join(""),
  "salawat === duas#salawat-in-prayer minus 2x the cut, nothing added");
ok(!T("salawat").includes("Ibrahima"),
  "…and no 'Ibrahima' survives — that word is not on screen");

// the half-sourced line
ok(
  T("tahlil-after-prayer").startsWith(duas["tahleel"].transliteration.replace(" wa huwa ", " wahwa ")),
  "tahlil-after-prayer's head === duas#tahleel with the same وَهْوَ re-vowelling"
);
ok(duas["qunut-al-witr"].transliteration.includes(`a${A}tayt`),
  `…and its tail's 'a${A}tayt' is corpus-verbatim from duas#qunut-al-witr`);

// 3 — span correspondence.
//
// Arabic and Latin word counts are NOT expected to match: the scheme glues some
// pairs into one word (Subhana + Allahi -> SubhanAllahi) and splits some words
// into two (wa+ana -> "wa ana"). What must hold is that the difference is FULLY
// explained by the two lists below — an unexplained surplus means a word is
// being voiced that is not on screen, and an unexplained deficit means a word on
// screen is going unvoiced. Both are the span-correspondence bug this file
// exists to catch.
//
// ⛔ COMPARE ON THE STRIPPED SKELETON, NEVER ON VOWELLED BYTES. The corpus
// writes اللَّهِ as lam+SHADDA+FATHA; the same glyph typed by hand comes out
// lam+FATHA+SHADDA. They render identically and are not equal, so a vowelled
// literal here silently matches nothing and every count "reconciles" against a
// rule that never fired. strip() removes all marks and folds the alef/ya
// variants, and it is applied to the PATTERNS TOO so a hand-typed أ vs ا cannot
// reintroduce the same class of bug.
//
// ⛔ AND THAT IS EXACTLY WHY THE وَهْوَ CHECK ABOVE IS SEPARATE: strip() folds
// وَهْوَ and وَهُوَ onto one skeleton, so a count can never see the difference. Any
// rule whose correctness depends on a VOWEL belongs up there, on codepoints.
// strip() itself is defined at the top of this file, beside the codepoint
// constants, because the وهو check above needs it too.

/** Arabic word sequences the scheme writes as ONE Latin word. Longest first:
 *  "Subhana Allahi al-'azeem" must win over "Subhana Allahi". */
const MERGES = [
  ["سبحان الله العظيم", "SubhanAllahil-'azeem"],
  ["سبحان الله", "SubhanAllahi"],
  ["الا الله", "illallahu"],
  ["له الملك", "lahul-mulku"],
  ["ما استطعت", "mastata't"],
  ["يغفر الذنوب", "yaghfirudh-dhunuba"],
  ["ذا الجد", "dhal-jaddi"],
  ["منك الجد", "minkal-jadd"],
].map(([ar, gloss]) => [strip(ar).split(/\s+/).filter(Boolean), gloss]);

/** Single Arabic words the scheme writes as TWO Latin words — a proclitic
 *  particle (wa-, bi-, fa-) set off from its host. NOTE وهو is NOT here: it is
 *  two words only when the hāʾ carries a ḍamma, so it is resolved per-token
 *  below against the unstripped text. */
const SPLITS = [
  ["وانا", "wa ana"], ["ووعدك", "wa wa'dika"], ["بنعمتك", "bi ni'matika"],
  ["وابوء", "wa abu'u"], ["بذنبي", "bi dhanbi"], ["فانه", "fa innahu"],
  ["وبحمده", "wa bihamdihi"], ["ولا", "wa la"],
  ["وعلي", "wa 'ala"], ["ويميت", "wa yumeetu"],
].map(([ar, gloss]) => [strip(ar), gloss]);

// A pattern that never fires anywhere is a dead rule — almost always the
// mark-order bug above. Fail loudly rather than quietly counting nothing.
const fired = new Map();

for (const id of sayIds) {
  // Keep the vowelled token beside its skeleton: the وهو rule needs the marks.
  const pairs = SAY[id].arabic
    .split(/\s+/)
    .map((raw) => [raw, strip(raw)])
    .filter(([, s]) => s);
  const toks = pairs.map((p) => p[1]);
  let delta = 0;

  for (let i = 0; i < toks.length; ) {
    const hit = MERGES.find((m) => m[0].every((w, k) => toks[i + k] === w));
    if (hit) {
      delta -= hit[0].length - 1;
      fired.set(hit[1], (fired.get(hit[1]) ?? 0) + 1);
      i += hit[0].length;
      continue;
    }
    if (toks[i] === "وهو") {
      // وَهُوَ -> "wa huwa" (two tokens); وَهْوَ -> "wahwa" (one).
      const isFull = HA_DAMMA.test(pairs[i][0]);
      if (isFull) delta += 1;
      fired.set(isFull ? "wa huwa" : "wahwa", (fired.get(isFull ? "wa huwa" : "wahwa") ?? 0) + 1);
      i++;
      continue;
    }
    const sp = SPLITS.find((s) => s[0] === toks[i]);
    if (sp) {
      delta += 1;
      fired.set(sp[1], (fired.get(sp[1]) ?? 0) + 1);
    }
    i++;
  }

  const arWords = toks.length;
  const latWords = T(id).split(/\s+/).filter(Boolean).length;
  ok(
    arWords + delta === latWords,
    `${id}: ${arWords} Arabic words reconcile to ${latWords} Latin ` +
      `(expected ${arWords + delta}) — every word on screen voiced, none added`
  );
}

for (const [, gloss] of [...MERGES, ...SPLITS, [null, "wa huwa"], [null, "wahwa"]]) {
  ok(fired.has(gloss), `rule "${gloss}" matched real corpus text (not a dead pattern)`);
}

// 9 — THE "why the Latin is not always the same" CARD MAY ONLY QUOTE STRINGS
// THAT ACTUALLY RENDER. That card's entire job is to stop a reader concluding
// the page is careless, so a wrong example there does more damage than no card
// at all — and it shipped one: it quoted "la ilaha illa" as what "the tahlil
// rows" show, when all four of them show the fused "La ilaha illallahu" and the
// only row with the quoted form is sayyid al-istighfar. Nothing caught it
// because prose is not data. This makes it data: every <em> example in the card
// must be a substring of something the page really prints.
{
  const page = fs.readFileSync(path.join(WEB, "src/app/small-deeds/page.tsx"), "utf8");
  const at = page.indexOf("Why the Latin is not always the same");
  const card = at < 0 ? "" : page.slice(at, page.indexOf("</ContentCard>", at));
  ok(at >= 0, "the transliteration card is still on the How tab");

  const rendered = [
    ...Object.values(AYAH).map((a) => a.textTranslit),
    ...sayIds.map((id) => T(id)),
  ].join("  ~  ");

  const quotes = [...card.matchAll(/<em>([\s\S]*?)<\/em>/g)]
    .map((m) => m[1].replace(/\{"/g, "").replace(/"\}/g, "").replace(/\s+/g, " ").trim())
    // {" "} JSX spacers and pure-markup captures are not quotations.
    .filter((s) => s && !s.startsWith("{"));
  ok(quotes.length >= 4, `card quotes ${quotes.length} example spellings`);
  for (const q of quotes)
    ok(
      rendered.includes(q),
      `card 4's example "${q}" is a spelling this page actually prints`
    );

  // …AND that it renders WHERE THE CARD SAYS IT DOES. Existence alone is too
  // weak to have caught the bug that shipped: "la ilaha illa" really is printed
  // on this page — on sayyid al-istighfar — so a substring check would have
  // waved it through while the card pointed the reader at four tahlil rows that
  // do not contain it. Attribution is the part that was wrong, so attribution
  // is what has to be asserted.
  const TAHLIL = ["tahlil-100", "tahlil-ten", "tahlil-after-prayer", "tasbih-hundredth"];
  const kursi = AYAH["ayat-al-kursi"].textTranslit;
  for (const q of quotes) {
    if (card.includes(`<em>${q}</em> in Ayat al-Kursi`) || /Ayat al-Kursi/.test(card.slice(card.indexOf(q), card.indexOf(q) + 60)))
      ok(kursi.includes(q), `"${q}" is attributed to Ayat al-Kursi and is in its transliteration`);
    if (/tahlil rows/.test(card.slice(card.indexOf(q), card.indexOf(q) + 60)))
      ok(
        TAHLIL.every((id) => T(id).includes(q)),
        `"${q}" is attributed to "the tahlil rows" and appears on all ${TAHLIL.length} of them`
      );
  }
  // The specific pair the card leads with, pinned by row id so neither side can
  // drift silently.
  ok(kursi.includes("laaa ilaaha illaa"), "Ayat al-Kursi still spells it 'laaa ilaaha illaa'");
  ok(
    TAHLIL.every((id) => T(id).startsWith("La ilaha illallahu")),
    "all four tahlil rows still open 'La ilaha illallahu' (fused — never a standalone 'illa')"
  );
  ok(
    !TAHLIL.some((id) => /\bla ilaha illa\b/.test(T(id))),
    "…and none of them prints a standalone 'la ilaha illa', which the card must therefore not claim"
  );
}

// 5 — character inventory.
const inventory = new Set([...Object.values(duas).flatMap((d) => [...d.transliteration])]);
for (const id of sayIds) {
  const stray = [...T(id)].filter((c) => !inventory.has(c));
  ok(stray.length === 0, `${id}: no character outside duas.json's own inventory`);
}
ok(
  sayIds.every((id) => !/[‘’“”]/.test(T(id))),
  "no smart quotes — the glottal stop is the straight apostrophe everywhere"
);
ok(
  sayIds.every((id) => !T(id).endsWith(".")),
  "no line ends in a full stop (they are formulas, not sentences)"
);

/* ── report ─────────────────────────────────────────────────────────────── */

let pass = 0;
for (const [good, msg] of results) {
  console.log(`${good ? "PASS" : "FAIL"}  ${msg}`);
  if (good) pass++;
}
const total = results.length;
console.log(`\n${pass} PASS / ${total - pass} FAIL of ${total}`);
process.exit(pass === total ? 0 : 1);
