/**
 * /small-deeds — pronunciation for the ten dhikr "Say" blocks.
 *
 * ⛔ THIS IS WORSHIP GUIDANCE, NOT DECORATION. A wrong line here teaches someone
 * to say dhikr wrongly and they will never find out. Treat an edit to this file
 * the way you would treat an edit to a citation.
 *
 * ⛔ THIS FILE SHIPS TO EVERY USER — KEEP IT TO WHAT RENDERS. It is one string
 * per block and nothing else. The provenance record for these lines (where each
 * came from, what was edited, and which judgement calls are re-openable) lives
 * in ./small-deeds-translit.provenance.ts, which NOTHING imports at runtime.
 * That is deliberate: `SAY_TRANSLIT` is indexed dynamically by the page, so no
 * bundler can prune sibling fields off it, and an earlier shape that carried the
 * notes inline put 5.1 KB of internal review prose into the client chunk — 4×
 * the weight of the transliterations themselves — inside a static export that is
 * also the iOS and Android app bundle. Do not move the notes back in here.
 *
 * ⛔ THE QUR'AN BLOCKS ARE NOT HERE, AND MUST NOT BE ADDED HERE. The six
 * "Recite" blocks take their transliteration from AYAH[k].textTranslit in
 * small-deeds-quotes.generated.ts, which is machine-copied out of
 * packages/content/quran/verses/{surah}.json. That is deliberate: a reader who
 * meets Ayat al-Kursi on this page and again in the app's Qur'an reader must not
 * be shown two spellings. Adding a Qur'an line to this file would create exactly
 * that fork. When a Qur'an line is WRONG, it is fixed in the corpus — see the
 * "corpus corrections" note in the provenance file.
 *
 * ⛔ TWO SCHEMES, ON PURPOSE — DO NOT "HARMONISE" THEM.
 *      Qur'an blocks (from the reader):  "Allahu laaa ilaaha illaa Huwal Haiyul"
 *      dhikr blocks (from duas.json):    "La ilaha illallahu wahdahu la shareeka"
 * The Qur'an scheme doubles and triples long vowels; the dua scheme does not.
 * Each matches the page a reader would look that text up on, which is worth more
 * than internal consistency across one page. The How-to-read-this tab says so in
 * as many words — see card 4, which exists because the All view puts both
 * schemes on screen at once.
 *
 * ⛔ EVERY LINE MUST COVER ITS BLOCK'S ARABIC EXACTLY — NO MORE, NO LESS, AND IT
 * MUST MATCH THE VOWELS ACTUALLY WRITTEN. A "Say" block is a word-range CUT out
 * of a hadith matn (see SAY in small-deeds-quotes.generated.ts). A dua in
 * packages/content/duas.json is a whole dua. Where the two spans differ, the
 * dua's transliteration DOES NOT CORRESPOND and pasting it whole is wrong in
 * both directions. And where the two texts carry the SAME words under DIFFERENT
 * vowels, the line follows the vowels on this page's own screen — which is why
 * وَهْوَ is `wahwa` on two rows and وَهُوَ is `wa huwa` on two others.
 *
 * All of that is asserted mechanically by
 * `node scripts/verify-small-deeds-translit.mjs`, which re-derives every sourced
 * line from duas.json and fails if a byte drifts. Run it after touching this
 * file, the provenance file, duas.json, or the SAY table.
 */

import type { SayId } from "./small-deeds-quotes.generated";

/** Record<SayId, string> on purpose: adding a Say block without a
 *  transliteration is then a type error rather than a silently unvoiced line of
 *  Arabic. Every entry is justified in ./small-deeds-translit.provenance.ts. */
export const SAY_TRANSLIT: Record<SayId, string> = {
  "sayyid-al-istighfar":
    "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bi ni'matika 'alayya, wa abu'u laka bi dhanbi, faghfir li fa innahu la yaghfirudh-dhunuba illa anta",

  "subhanallah-100": "SubhanAllahi wa bihamdihi",

  "two-words": "SubhanAllahil-'azeem, SubhanAllahi wa bihamdihi",

  "tahlil-100":
    "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wahwa 'ala kulli shay'in qadeer",

  "tahlil-ten":
    "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu yuhyi wa yumeetu wa huwa 'ala kulli shay'in qadeer",

  "date-palm": "SubhanAllahil-'azeemi wa bihamdihi",

  "four-words": "SubhanAllahi walhamdu lillahi wa la ilaha illallahu wallahu Akbar",

  "tahlil-after-prayer":
    "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wahwa 'ala kulli shay'in qadeer, Allahumma la mani'a lima a'tayt, wa la mu'tiya lima mana't, wa la yanfa'u dhal-jaddi minkal-jadd",

  "tasbih-hundredth":
    "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",

  salawat:
    "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala ali Ibrahim, innaka Hamidun Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala ali Ibrahim, innaka Hamidun Majid",
};
