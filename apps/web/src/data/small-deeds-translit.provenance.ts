/**
 * WHERE EACH /small-deeds TRANSLITERATION CAME FROM.
 *
 * ⛔ NOTHING IMPORTS THIS FILE AT RUNTIME, AND NOTHING SHOULD. The strings that
 * render live in ./small-deeds-translit.ts; this is the review record beside
 * them. It is a .ts and not a .md so that `Record<SayId, TranslitNote>` makes a
 * missing or orphaned note a type error, and so `tsc --noEmit` keeps the two key
 * sets in step — but because no module imports it, not one of these bytes
 * reaches a user. Import it from a component and you put ~5 KB of internal prose
 * into the iOS and Android bundles. `scripts/verify-small-deeds-translit.mjs`
 * asserts both halves of that: same keys, and no page importing this module.
 *
 * A future reader has to be able to tell, without re-deriving anything, which
 * lines came from a source of record and which were authored here:
 *
 *   duas-local      byte-verbatim from packages/content/duas.json
 *   duas-local-cut  from duas.json, then sliced or spliced on WORD BOUNDARIES
 *                   ONLY, so the span and the vowels match the Arabic actually
 *                   on screen
 *   authored        written here, because the repo has no source for this span
 *
 * ── SOURCES OF RECORD, AND THE ONE THAT WAS MISSED ────────────────────────────
 * There are THREE transliteration corpora in this app, not two:
 *   1. packages/content/quran/verses/*.json  `textTranslit`  → the Qur'an reader
 *   2. packages/content/duas.json            `transliteration` → /duas
 *   3. apps/web/src/lib/dhikr/catalog.ts     `translit`      → /dhikr
 * The third is reachable from this very page (two rows link to /dhikr) and was
 * missed on the first pass, which shipped `yumeetu`/`qadeer` against the
 * counter's `yumit`/`qadir` for BYTE-IDENTICAL Arabic. Check all three before
 * authoring anything.
 *
 * ── CORPUS CORRECTIONS MADE ALONGSIDE THIS WORK ───────────────────────────────
 * Three tokens in packages/content/quran/verses/2.json `textTranslit` were
 * corrupt and were shipping as pronunciation guidance on this page AND in the
 * Qur'an reader. Each was a hapax legomenon across all 6,236 verses, and each is
 * rendered correctly by the corpus itself elsewhere, so the correction is
 * sourced rather than authored:
 *   2:255  "wa mww khalfahum"  → "wa maa khalfahum"   (وَمَا خَلْفَهُمْ)
 *          `mww` is not a syllable in any scheme. The corpus renders this exact
 *          phrase "wa maa khalfahum" at 22:76 and 34:9, and "wa maa" 371 times.
 *   2:285  "Malaaa'ikathihee"  → "Malaaa'ikatihee"    (وَمَلَـٰٓئِكَتِهِۦ)
 *          `th` is ث in this scheme; the letter is ت. 20 other spellings of this
 *          word use `t`.
 *   2:285  "Kutubhihee"        → "Kutubihee"          (وَكُتُبِهِۦ)
 *          inserted a consonant the Arabic does not have.
 * 4:136 carries the identical phrase — "wa Malaaa'ikatihee wa Kutubihee wa
 * Rusulihee" — and is the witness for both of the 2:285 fixes.
 * ⚠️ Fixing the corpus means re-running verify-page-citations.mjs and then
 * gen-small-deeds-quotes.mjs, because AYAH[k].textTranslit is a machine copy.
 * Never hand-edit the generated file to match.
 *
 * ── KNOWN, DELIBERATELY UNFIXED (Qur'an-data queue, not this page's to author) ─
 *   112:2 renders ٱللَّهُ ٱلصَّمَدُ as "Allah hus-samad" — a segmentation slip that
 *   moves Allāh's own /h/ onto the next word. It is a hapax too, but unlike the
 *   three above the corpus has no parallel rendering of this phrase (112:2 is
 *   the Qur'an's only "Allāhu + sun-letter article"), so a fix would be AUTHORED
 *   Qur'an transliteration. That is the one thing this page must never do. Its
 *   80 near-parallels all point at "Allaahus Samad"; the call belongs with the
 *   Qur'an data, not here.
 *
 *   The corpus marks ع inconsistently after an assimilated article ('Azeem but
 *   Aliyyul, 'Aleem but Azeezil). That is systematic across the whole corpus,
 *   not a defect of these verses, and is not this page's to unilaterally change.
 *
 *   Neither scheme distinguishes ع from ء — both are the straight apostrophe, so
 *   `abu'u` (ء) and `'abduka` (ع) sit five words apart under one character. That
 *   bar cannot be met without forking both corpora.
 */

import type { SayId } from "./small-deeds-quotes.generated";

export type TranslitProvenance = "duas-local" | "duas-local-cut" | "authored";

export type TranslitNote = {
  provenance: TranslitProvenance;
  /** Which source of record, and why it does or does not cover this span. */
  basis: string;
  /** Exactly what was changed against `basis`. "None." where nothing was. */
  edit: string;
  /** A judgement call a later reader should be able to re-open. */
  flag?: string;
};

export const SAY_TRANSLIT_PROVENANCE: Record<SayId, TranslitNote> = {
  "sayyid-al-istighfar": {
    provenance: "duas-local-cut",
    basis:
      "duas.json#sayyid-al-istighfar — the same hadith under the same citation, Bukhari 80:3. Tokens 0-26 align exactly.",
    edit:
      "ONE WORD TAKEN IN, nothing else. The source reads 'wa abu'u bi dhanbi'; the Arabic on screen has وَأَبُوءُ لَكَ بِذَنْبِي. So 'laka' is inserted -> 'wa abu'u laka bi dhanbi'. That token is not authored either: it is copied from five tokens earlier in this same source line, where it renders the identical Arabic word لَكَ (abu'u laka bi ni'matika).",
    flag:
      "⚠️ THE INSERTION MAKES THIS ROW AND /duas DISAGREE BY ONE WORD, ON PURPOSE — DO NOT 'FIX' IT. The two pages quote DIFFERENT NARRATIONS of this dua: duas.json's Arabic is وَأَبُوءُ بِذَنْبِي, the Bukhari 80:3 matn cut for this row is وَأَبُوءُ لَكَ بِذَنْبِي. Each transliteration voices the Arabic on its own screen, which is the rule that matters, so /small-deeds shows 'laka' twice and /duas shows it once. That divergence predates this file and is in the ARABIC; a maintainer who deletes 'laka' to make the two pages match will leave a word on this screen unvoiced. (An earlier version of this note claimed the opposite — that the insertion made them agree. It did not.) Separately: the source's comma after 'alayya has no counterpart on screen (the Arabic runs عَلَىَّ وَأَبُوءُ unbroken). Kept — it is inside a sourced span, falls between two parallel clauses, and changes no letter.",
  },

  "subhanallah-100": {
    provenance: "duas-local",
    basis: "duas.json#subhanallah-wa-bihamdihi. Same three words, same span.",
    edit: "None. Byte-verbatim. Also byte-identical to catalog.ts#subhanallah_hamd.",
  },

  "two-words": {
    provenance: "authored",
    basis:
      "The second half is duas.json#subhanallah-wa-bihamdihi verbatim. The first half, سُبْحَانَ اللَّهِ الْعَظِيمِ, has no source anywhere in the repo.",
    edit:
      "Authored, and it could not have been a cut: the missing half MUTATES the sourced half's first token, because the article of الْعَظِيمِ absorbs the preceding genitive (SubhanAllahi -> SubhanAllahil-). No slice can produce that. The second half is left byte-identical to the source so that this row, subhanallah-100 and date-palm agree with each other.",
    flag:
      "'azeem here against 'azeemi on date-palm is the PAUSE RULE, not an inconsistency: this row's Arabic puts a comma after الْعَظِيمِ and date-palm's runs straight on into وَبِحَمْدِهِ. duas.json does the same thing for the same reason — it writes لَهُ as 'lah,' at a comma and 'lahu' mid-phrase, in one line of #tahleel. How-to-read-this card 4 now states this rule to the reader, because two rows of one section showing one formula two ways reads as a slip unless it is explained. (Card 4 used to claim instead that a formula is 'spelt identically on each row'. That was false as shipped.) Widen past this page and the same three Arabic words have four spellings in the app: 'azeem / 'azeemi here, catalog.ts#subhanallah_azim's 'Azim, and 'Azeem on /day-of-judgement and /jannah. Unifying those is a dhikr-scheme job, not this page's.",
  },

  "tahlil-100": {
    provenance: "duas-local-cut",
    basis:
      "duas.json#tahleel, whose own source line cites Bukhari 80:98 — this block's citation. 16 of 17 words are byte-verbatim.",
    edit:
      "ONE WORD RE-VOWELLED. duas.json writes وَهُوَ and renders it 'wa huwa'; the Arabic on THIS screen is وَهْوَ — hāʾ with a SUKŪN, which is one syllable shorter, /wahwa/ against /wahuwa/. So the token becomes 'wahwa'. It is one Latin word, not 'wa hwa': the sukūn closes the first syllable onto the wāw (wah-wa), and there is no /hw/ onset to split off.",
    flag:
      "This is why this line is NO LONGER byte-identical to tasbih-hundredth, and the change is the point. The two rows carry the same formula from two collectors, and their Arabic differs at exactly this word — Bukhari 80:98 writes وَهْوَ, Muslim 5:188 writes وَهُوَ. Both readings are canonical; the page shows the vowels each narration actually carries, so the Latin has to follow. An earlier version of this file kept 'wa huwa' on all four tahlil rows and justified it as 'one word in a Bukhari orthography, with no consequence for pronunciation' — that was wrong on its face, since the sukūn IS the difference and it is a whole syllable. Card 4 explains the split to the reader. Do not re-flatten it for tidiness.",
  },

  "tahlil-ten": {
    provenance: "duas-local-cut",
    basis:
      "duas.json#tahleel covers 17 of these 19 words verbatim, including وَهُوَ -> 'wa huwa' (this narration writes the ḍamma, unlike tahlil-100).",
    edit:
      "TWO WORDS TAKEN IN mid-line — يُحْيِي وَيُمِيتُ — which is precisely what this row's own caveat says this narration adds. duas.json has no يحيي anywhere. Everything either side of them is untouched.",
    flag:
      "⚠️ THIS BLOCK'S ARABIC IS BYTE-IDENTICAL (===) TO catalog.ts#tahlil_fajr, the dhikr counter — and two rows of this page link to /dhikr. The counter shipped 'la sharika … lahul-hamd, yuhyi wa yumit … qadir' against this line's 'la shareeka … lahul-hamdu yuhyi wa yumeetu … qadeer': four divergent tokens for one string of Arabic, inside one app. The counter has been aligned to this line, which is the duas.json spelling and already what its own sibling entry #tahlil_full carries. The verifier now asserts the equality, so the two cannot drift again. ('yumeetu' not 'yumit' is the corpus's own habit for a medial long ī with the mood vowel kept mid-phrase — cf. 'astagheethu' for أَسْتَغِيثُ; 'yuhyi' keeps a plain 'i' because the ī is word-final — cf. 'taqdi' for تَقْضِي.)",
  },

  "date-palm": {
    provenance: "authored",
    basis: "two-words in miniature: الْعَظِيمِ is unsourced, and it mutates the token before it.",
    edit:
      "Authored. The case vowel differs from two-words ON PURPOSE — see the pause-rule flag there. Here الْعَظِيمِ runs straight on into وَبِحَمْدِهِ with no pause, so the genitive -i is written; on two-words a comma follows it, so it is dropped. The corpus does the same thing within single lines (e.g. 'minal-khubuthi wal-khaba'ith', and 'lah,' vs 'lahu' inside #tahleel).",
  },

  "four-words": {
    provenance: "authored",
    basis:
      "duas.json#tasbeeh-after-prayer is NOT this text over this span — it carries (٣٣) count markers, puts the takbir BEFORE the tahlil, drops the وَ conjunctions, and then runs on into the full 16-word tahlil. Reusing it here would mislead. But two of its four phrases ARE spelt elsewhere in the corpus and were taken from there.",
    edit:
      "Authored in full, then two junctions corrected against the corpus. 'walhamdu' (وَالْحَمْدُ) is now duas.json's own spelling of the identical phrase, which it renders 'walhamdu lillah' in BOTH #morning-remembrance and #evening-remembrance — the first pass wrote 'wal-hamdu' from a rule instead of from the corpus that already answered it. The final vowel stays 'lillahi', not the corpus's pausal 'lillah', because there the phrase is followed by a comma and here it runs straight on into وَلاَ إِلَهَ — the same pause rule as two-words / date-palm.",
    flag:
      "'wallahu' (وَاللَّهُ) IS corpus-precedented — an earlier version of this note claimed it was 'the one junction in this set with no precedent anywhere in duas.json' and escalated it to the founder on that basis. The premise was false; it came from searching for the literal strings 'wa Allah' and 'wallah' rather than for the pattern. duas.json glues and lowercases the divine name after a vowel-final word five times: Hasbunallahu (حَسْبُنَا اللَّهُ), Barakallahu (بَارَكَ اللَّهُ), Rabbukallah (وَرَبُّكَ اللَّهُ), Yarhamukallah (يَرْحَمُكَ اللَّهُ), Yahdikumullahu (يَهْدِيكُمُ اللَّهُ). It is also phonetically exact: وَاللَّهُ is /wal'laa.hu/ with no glottal restart, which is what a naively-read 'wa Allahu' invites. The corpus is not unanimous — #the-three-quls renders هُوَ اللَّهُ as 'huwa Allahu', unglued — so 'wa Allahu Akbar' remains a legible alternative anyone may prefer; it is simply not the unprecedented option it was described as.",
  },

  "tahlil-after-prayer": {
    provenance: "authored",
    basis:
      "The first 17 words are duas.json#tahleel with the same single re-vowelling as tahlil-100 (this narration, Bukhari 10:236, also writes وَهْوَ). The 15-word tail has no source — neither مانع nor الجد occurs anywhere in duas.json.",
    edit:
      "Marked authored because roughly half of it is. The sourced head carries 'wahwa' for وَهْوَ, exactly as on tahlil-100 and for the same reason. The authored tail butts onto it at the Arabic's own comma after قَدِيرٌ. One tail word is NOT authored: 'a'tayt' is corpus-verbatim from duas.json#qunut-al-witr, where it renders the same أَعْطَيْتَ, also before a comma.",
  },

  "tasbih-hundredth": {
    provenance: "duas-local",
    basis: "duas.json#tahleel. A different narration from tahlil-100 (Muslim 5:188), the same 17-word span.",
    edit:
      "None. Byte-verbatim — including 'wa huwa', because THIS narration's Arabic really does write وَهُوَ with the ḍamma. See the tahlil-100 flag for why the two rows are no longer identical.",
  },

  salawat: {
    provenance: "duas-local-cut",
    basis:
      "duas.json#salawat-in-prayer (Bukhari 60:44) — a DIFFERENT narration of the same salawat, 34 words against this block's 30. It says 'ala Ibrahima wa 'ala ali Ibrahim; the screen says only 'ala ali Ibrahim.",
    edit:
      "A TRUE WORD-BOUNDARY CUT, nothing added. Deleted the three Latin tokens \"Ibrahima wa 'ala\" after the first 'ala at BOTH sites — three and not two because the source renders وَعَلَى as two tokens. 34 - 4 Arabic words = the 2x2 gap, and the cut string occurs in the source exactly twice. Pasting the source whole would have voiced 'Ibrahima wa' — words that are not on screen — twice over.",
    flag:
      "The sourced full stop between the two halves sits where the screen's Arabic has a comma. Kept: it is inside a sourced span, and these genuinely are two sentences — two distinct duas, the salat and the barakah.",
  },
};
