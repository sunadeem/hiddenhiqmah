/**
 * /small-deeds — practices whose promised reward is out of all proportion to
 * what they cost.
 *
 * ⛔ NOTHING IN THIS FILE IS A QUOTATION. Every narration, every reference and
 * every character of Arabic lives in small-deeds-quotes.generated.ts, copied by
 * machine out of packages/content. What is authored here is only: the imperative
 * line telling you what to do, the one-line summary of what is promised, the
 * honest cost estimate, the caveats, and which verified key to render. If you
 * need a new narration on this page, add it to
 * scripts/verify-page-citations.small-deeds.input.json, re-run the verifier and
 * the generator, and reference the key — never paste text in here.
 *
 * ⛔ `effect` IS AUTHORED, NOT QUOTED. It is a one-line paraphrase of what the
 * narration promises, written so its plain reading cannot claim more than the
 * narration does. Where a one-liner cannot hold the qualification, the item
 * carries `caveatVisible` and the qualification is printed ON the row rather
 * than behind the expander. Never write an `effect` that needs a caveat the
 * reader has to tap for.
 *
 * ⛔ AND NOTHING HERE MAY PUT ARABIC UNDER A "SAY" HEADING BY ITSELF. A Say block
 * renders SAY[id] from the generated module: a word-range cut out of a narration
 * and asserted at build time to be the corpus' own bytes. If a formula is not
 * physically inside any narration on the row, the row gets NO Say block — it
 * does not get the narration's promise clause dressed up as dhikr. See the
 * SAY_SLICES table in scripts/gen-small-deeds-quotes.mjs.
 *
 * ⛔ IDS ARE FROZEN. ?section=<id> deep links and the row's DOM id depend on
 * them, and ?section= is in DEEP_LINK_PARAMS (components/mobile/routes.ts) so
 * scroll restoration already defers to those URLs. Regroup freely; never rename.
 *
 * Title, slug and nav strings are NOT here — they live in ./small-deeds-meta,
 * which is a leaf module because home-content.ts (→ Sidebar → root layout)
 * imports them and would otherwise ship this whole file to every page.
 */

import type { SayId } from "./small-deeds-quotes.generated";

/* ───────────────────────── tabs ─────────────────────────
 *
 * Level 1 is two tabs and only two, because the old row mixed four content
 * categories with "How to Read This" — one pill row holding two different kinds
 * of thing. The categories moved down a level onto the rail below.
 */

export const tabs = [
  { key: "deeds", label: "The deeds" },
  { key: "how", label: "How to read this" },
] as const;

export type TabKey = (typeof tabs)[number]["key"];

/* ───────────────────────── sections ─────────────────────────
 *
 * Level 2. These replace the old cost-based tabs (Seconds / In Your Day / When
 * It Happens / On the Calendar), which classified by something invisible until
 * you had already read the item — so the label told you nothing. These classify
 * by WHAT THE ACTION IS, and each carries a one-line descriptor rendered under
 * the rail so the label never has to carry the whole explanation alone.
 *
 * Cost is not lost: `cost` is still authored per item and still on every row.
 * It stopped being the classifier, not the information.
 */

export const sections = [
  { key: "all", label: "All", blurb: "Everything, in one list." },
  {
    key: "words",
    label: "Words you say",
    blurb: "Dhikr with nothing attached — no wudu, no time of day, no direction.",
  },
  {
    key: "prayers",
    label: "Around your prayers",
    blurb: "What you say and pray before, during and after the five.",
  },
  {
    key: "quran",
    label: "Qur'an to read",
    blurb: "Surahs and ayat with a promise attached, and when to read them.",
  },
  {
    key: "people",
    label: "Kindness & giving",
    blurb: "Things you do for other people.",
  },
  {
    key: "fasting",
    label: "Fasting & sacred days",
    blurb: "Days to fast, and the days of the year worth marking.",
  },
] as const;

export type SectionKey = (typeof sections)[number]["key"];
/** Every section a deed can actually live in — "all" is a view, not a home. */
export type DeedSection = Exclude<SectionKey, "all">;

/** Headings inside a section — two headings beat two taps.
 *
 *  Only "prayers" and "quran" use them; the other three sections are short
 *  enough to read as one list. Keys are namespaced by section so a heading
 *  cannot be borrowed into a section where its wording would be false.
 *
 *  ⛔ THE STRINGS CAVEATS DEPEND ON ARE SECTION LABELS, NOT GROUP HEADINGS.
 *  "Words you say" (sections[1].label) is quoted BY NAME inside answer-the-adhan
 *  and tasbih-after-prayer. Rename it and both go stale, silently — it compiles
 *  and the citation verifier passes.
 *
 *  ⛔ NO CAVEAT MAY QUOTE A HEADING IN THIS TABLE. Headings are suppressed in the
 *  All view, which is the default and where every ?section= deep link lands, so
 *  a caveat naming one is incoherent exactly where most readers meet it. Nor may
 *  a caveat lean on bare adjacency: search filters the list, so "the row above"
 *  can be a row that is not on screen. Where a caveat points at a neighbour it
 *  names it — "the two cool prayers row", "the 33/33/34 row", "the bedtime row",
 *  "the four-words row" — wording that identifies the row wherever it is.
 *
 *  `satisfies` rather than an annotation, so `keyof typeof groups` on SmallDeed
 *  is the seven literal keys — with Record<string,string> a typo'd key type-
 *  checked and rendered an empty <h3>. */
export const groups = {
  "prayers-before": "Before you pray",
  "prayers-during": "The prayers themselves",
  "prayers-after": "After you pray",
  "quran-any": "Any amount",
  "quran-sleep": "Before you sleep",
  "quran-morning": "Morning & evening",
  "quran-memorise": "Learn by heart",
} satisfies Record<string, string>;

/* ───────────────────────── items ───────────────────────── */

/** Words to say, spliced verbatim — never authored. */
export type SayBlock =
  /** The formula itself, cut out of a narration by the generator. */
  | { kind: "matn"; id: SayId; label?: string }
  /** Ayat, byte-identical to the app's own Qur'an reader. */
  | { kind: "ayat"; keys: string[]; label?: string; note?: string };

export type SmallDeed = {
  /** Stable — ?section=<id> deep links and the row's DOM id depend on it. */
  id: string;
  section: DeedSection;
  group?: keyof typeof groups;
  /** An imperative you can obey without opening the row. Always starts with a verb. */
  action: string;
  /** One line: what is promised. Authored, never quoted — see the file header. */
  effect: string;
  /** The cost of entry, stated literally. The only number on the row we author. */
  cost: string;
  /** Keys into HADITH — the row prints their CITATIONS, never their text. */
  quotes: string[];
  say?: SayBlock;
  /** Further narrations of the same practice — citation only, inside the row. */
  also?: string[];
  /** Said plainly wherever the promise is easy to over-read, or the chain needs stating. */
  caveat?: string;
  /** True where the qualification will not fit inside `effect`: the row must not
   *  be readable as an unqualified promise even by someone who never expands it. */
  caveatVisible?: true;
  /** The précis shown at rest on those rows. Keep it under ~130 characters. */
  caveatLead?: string;
  /** This page is an index of disproportion, not a replacement for the real page. */
  link?: { href: string; label: string };
};

export const deeds: SmallDeed[] = [
  /* ─────────────── Words you say (11) ───────────────
   *
   * Decision rule: the narration attaches no moment, place or state. The six
   * post-prayer dhikr items are words you say AND prayer-cycle acts; they live
   * under "Around your prayers" because the fixed moment wins over the verb —
   * which is what leaves this section a meaning a reader can hold.
   */
  {
    id: "istighfar",
    section: "words",
    action: "Ask Allah's forgiveness — and keep asking.",
    effect:
      "For whoever keeps at it: a way out of every distress, and provision he never reckoned on.",
    cost: "About 3 seconds, in any state.",
    quotes: ["istighfar-distress-abudawud"],
    also: ["istighfar-distress-ibnmajah"],
    caveat:
      "No narration in these collections fixes a daily total for istighfar. The only counts reported are his own habit — seventy in one report, a hundred in another. A round target like ten thousand a day is a contemporary practice — you may find it useful, but nothing is promised for the number itself.",
    link: { href: "/tawbah", label: "Tawbah — the door that never closes" },
  },
  {
    id: "prophet-istighfar",
    section: "words",
    action: "Take his ﷺ own rate as the model, not a number you set.",
    effect:
      "Seventy a day in one report, a hundred in another — described, never prescribed. A third says the door does not close on someone who keeps coming back.",
    cost: "Seventy to a hundred times a day.",
    quotes: ["prophet-70x-bukhari", "istighfar-100-muslim", "not-confirmed-sinner"],
    also: ["prophet-70x-tirmidhi", "istighfar-100-ibnmajah"],
    caveatVisible: true,
    caveatLead:
      "The third reference is about forgiveness outlasting relapse — not permission to plan one.",
    caveat:
      "Two things on this row. The counts are descriptions of his practice, offered as a model — not a tariff with a payout attached to the number, and notice that the reported counts are not even the same: seventy in one narration, a hundred in another. That is what a description looks like, and it is a reason not to treat any figure as the target. The third reference, Abu Dawud 8:99, says something different again and is the easiest on this page to misread: that the one who asks pardon is not a confirmed sinner even if he returns to the sin seventy times a day. That is a statement about how far Allah's forgiveness reaches, not a licence to go back to it — the asking has to be real asking each time, or it is not what is being described.",
  },
  {
    id: "sayyid-al-istighfar",
    section: "words",
    action: "Say sayyid al-istighfar, morning and before sleep.",
    effect: "Said with conviction, whoever dies that day or night is of the people of Paradise.",
    cost: "About 25 seconds, twice a day.",
    quotes: ["sayyid-istighfar-bukhari"],
    say: { kind: "matn", id: "sayyid-al-istighfar" },
    also: ["sayyid-istighfar-tirmidhi"],
    caveat:
      "The promise in the narration is tied to saying it with conviction — muqinan biha — not to the words alone.",
    link: { href: "/duas", label: "The full text with transliteration" },
  },
  {
    id: "subhanallah-100",
    section: "words",
    action: "Say SubhanAllah wa bihamdihi a hundred times a day.",
    effect: "His sins are wiped away — even if they were like the foam of the sea.",
    cost: "About 2 minutes, walking.",
    quotes: ["subhanallah-100"],
    say: { kind: "matn", id: "subhanallah-100" },
    caveatVisible: true,
    caveatLead:
      "Read as narrated, not as an eraser: scholars take promises of this kind to cover minor sins.",
    caveat:
      "Read as narrated, not as an eraser. Scholars generally understand promises of this kind to cover minor sins; major sins call for tawbah, and wrongs done to people also need putting right with them. That qualification is how scholars have read it — it is not part of the narration, and this page states it as a reading rather than as a ruling of its own.",
    link: { href: "/dhikr", label: "Count it on the dhikr counter" },
  },
  {
    id: "two-words",
    section: "words",
    action: "Say Subhan Allah al-'Azim, Subhan Allah wa bihamdihi.",
    effect: "Two words light on the tongue, heavy in the Balance, beloved to the Most Merciful.",
    cost: "A few seconds — the lightest thing on the page.",
    quotes: ["two-words-bukhari"],
    say: { kind: "matn", id: "two-words" },
    also: ["two-words-muslim", "two-words-tirmidhi", "two-words-ibnmajah"],
  },
  {
    id: "tahlil-100",
    section: "words",
    action: "Say the tahlil (La ilaha illa Allah, wahdahu la sharika lah…) a hundred times a day.",
    effect: "Like freeing ten slaves; a hundred deeds written, a hundred erased; a shield till evening.",
    cost: "About 8 minutes — the longest here.",
    quotes: ["tahlil-100-bukhari"],
    say: { kind: "matn", id: "tahlil-100" },
    also: ["tahlil-100-bukhari-59", "tahlil-100-muslim", "tahlil-100-ibnmajah"],
  },
  {
    id: "tahlil-ten",
    section: "words",
    action: "Say the same tahlil ten times — with yuhyi wa yumit added.",
    effect: "Reckoned equal to freeing four slaves.",
    cost: "About 1 minute.",
    quotes: ["tahlil-ten"],
    say: { kind: "matn", id: "tahlil-ten" },
    caveatVisible: true,
    caveatLead:
      "Tirmidhi records inside this entry that it is also reported as Abu Ayyub's own words, not the Prophet's ﷺ.",
    caveat:
      "Two things. The wording here is not identical to the hundred-times version: it adds yuhyi wa yumit — He gives life and causes death. And Tirmidhi records inside this same entry that the report has also been narrated from Abu Ayyub as his own words rather than the Prophet's ﷺ. The promise is what carries that qualification.",
  },
  {
    id: "date-palm",
    section: "words",
    action: "Say Subhan Allah al-'Azim wa bihamdih.",
    effect: "A date-palm is planted for him in Paradise.",
    cost: "About 3 seconds.",
    quotes: ["date-palm-planted"],
    say: { kind: "matn", id: "date-palm" },
  },
  {
    id: "four-words",
    section: "words",
    action:
      "Say the four: Subhan Allah, wal-hamdu lillah, wa la ilaha illa Allah, wa Allahu akbar.",
    effect: "For each one, a tree planted for you in Paradise.",
    cost: "About 5 seconds.",
    quotes: ["four-words-tree"],
    say: { kind: "matn", id: "four-words" },
  },
  {
    id: "hundred-each",
    section: "words",
    action: "When age or illness limits you: a hundred takbir, a hundred tahmid, a hundred tasbih.",
    effect:
      "Better than a hundred horses sent out for Allah, a hundred camels, a hundred slaves freed.",
    cost: "About 5 minutes, sitting down.",
    quotes: ["umm-hani-100s"],
    caveatVisible: true,
    caveatLead:
      "The comparison is to voluntary acts of great cost — not a substitute for anything obligatory.",
    caveat:
      "This was the answer given to a woman who said she had grown old and weak and heavy — which is exactly who it is for. What it is measured against is telling: horses sent out in the way of Allah, sacrificial camels, slaves set free. It is compared to voluntary acts of enormous cost, not offered in place of what is obligatory. There is no Arabic block on this row because the words the narration uses are instructions addressed to her — say takbir, say tahmid, say tasbih — and not a formula to repeat. The four words themselves are on the four-words row.",
  },
  {
    id: "salawat",
    section: "words",
    action: "Send salawat on the Prophet ﷺ.",
    effect: "Whoever blesses him once, Allah blesses him ten times.",
    cost: "Two seconds.",
    quotes: ["salawat-ten-muslim", "salawat-formula-bukhari"],
    say: { kind: "matn", id: "salawat" },
    also: ["salawat-ten-tirmidhi", "salawat-abudawud", "salawat-formula-ibnmajah"],
    caveat:
      "The narration promising ten does not itself quote the salawat, so the Arabic above is spliced from the narration where the Companions asked him how to do it — the second narration referenced on this row. There is more than one wording; this is Bukhari's.",
  },

  /* ─────────────── Around your prayers (13) · Before you pray ─────────────── */
  {
    id: "wudu-shahadah",
    section: "prayers",
    group: "prayers-before",
    action: "Finish your wudu well, then say the shahadah.",
    effect: "The eight gates of Paradise are opened for him, to enter by whichever he wishes.",
    cost: "One sentence.",
    quotes: ["wudu-shahadah"],
    link: { href: "/salah?tab=wudu", label: "How to make wudu" },
  },
  {
    id: "wudu-two-rakah",
    section: "prayers",
    group: "prayers-before",
    action: "After wudu, pray two rak'ahs without letting your mind wander.",
    effect: "Past sins forgiven — for two rak'ahs in which he thinks of nothing else.",
    cost: "About 3 minutes, when you have wudu anyway.",
    quotes: ["wudu-two-rakah"],
    caveat:
      "The condition inside the narration is the hard part, not the two rak'ahs: not thinking of anything else while you pray them.",
  },
  {
    id: "answer-the-adhan",
    section: "prayers",
    group: "prayers-before",
    action: "Repeat after the mu'adhdhin, send salawat, then ask Allah for al-Wasilah for him ﷺ.",
    effect: "Whoever asks al-Wasilah for him is assured of his ﷺ intercession.",
    cost: "About a minute, five times a day.",
    quotes: ["answer-muadhdhin"],
    caveat:
      "The narration gives the instruction, not a script — what you repeat is whatever the mu'adhdhin has just said. The salawat that comes next is under Words you say, in Arabic.",
    link: { href: "/prayer-times", label: "Today's adhan times" },
  },

  /* ─────────────── Around your prayers · The prayers themselves ─────────────── */
  {
    id: "fajr-sunnah",
    section: "prayers",
    group: "prayers-during",
    action: "Pray the two rak'ahs before Fajr.",
    effect: "He ﷺ held them dearer than the whole world and everything in it.",
    cost: "About 3 minutes, before Fajr.",
    quotes: ["fajr-sunnah-muslim", "fajr-sunnah-tirmidhi"],
  },
  {
    id: "twelve-rakah",
    section: "prayers",
    group: "prayers-during",
    action:
      "Keep twelve voluntary rak'ahs a day: 4 before Zuhr, 2 after, 2 after Maghrib, 2 after Isha, 2 before Fajr.",
    effect: "A house built for him in Paradise.",
    cost: "About 20 minutes, split into five pieces.",
    quotes: ["twelve-rakah-muslim", "twelve-rakah-breakdown"],
    also: ["twelve-rakah-muslim-126", "twelve-rakah-breakdown-tirmidhi"],
    caveat:
      "The promise is a house built for you in Paradise — a gift promised, not an entitlement bought. And it is worth noticing that the woman who narrated it never left them off again after hearing it.",
    link: { href: "/salah", label: "Salah, step by step" },
  },
  {
    id: "two-cool-prayers",
    section: "prayers",
    group: "prayers-during",
    action: "Guard the two cool prayers — Fajr and Asr.",
    effect: "Whoever prays them enters Paradise.",
    cost: "Two prayers you already owe.",
    quotes: ["two-cool-bukhari"],
    also: ["two-cool-muslim"],
    caveatVisible: true,
    caveatLead:
      "Singled out for how hard they are to keep — not a substitute for the other three.",
    caveat:
      "Read as narrated: it singles these two out for how hard they are to keep — it is not a claim that they stand in for the other three.",
  },
  {
    id: "before-sunrise-sunset",
    section: "prayers",
    group: "prayers-during",
    action: "Guard the same two — the prayer before sunrise and the prayer before sunset.",
    effect: "Never entering the Fire, for whoever keeps these two prayers.",
    cost: "Nothing beyond what you already owe.",
    quotes: ["before-sunrise-sunset-nasai"],
    also: ["before-sunrise-sunset-abudawud"],
    caveatVisible: true,
    caveatLead:
      "Fajr and Asr again, promised the other way round — and no more a substitute for the other three.",
    caveat:
      "This is the same pair as the two cool prayers row — Fajr and Asr — named here by the times they fall between rather than by name, in a second narration that puts the promise the other way round: not entering the Fire, rather than entering Paradise. It is one teaching reported twice — not two separate promises to collect — and it carries the same limit as that row: these two are singled out for how hard they are to keep, and nothing in either narration says the other three may be left. Abu Dawud's version carries a gloss inside the entry identifying the two as the dawn and the afternoon prayers.",
  },
  {
    id: "isha-fajr-congregation",
    section: "prayers",
    group: "prayers-during",
    action: "Pray Isha and Fajr in congregation.",
    effect: "Isha in congregation is as if he prayed half the night; Fajr, as if the whole night.",
    cost: "Two walks to the masjid.",
    quotes: ["isha-fajr-congregation"],
  },
  {
    id: "after-fajr-until-sunrise",
    section: "prayers",
    group: "prayers-during",
    action: "Pray Fajr in congregation, sit remembering Allah till sunrise, then pray two rak'ahs.",
    effect: "The reward of a Hajj and an Umrah — “complete, complete, complete”.",
    cost: "Roughly 40–60 minutes, once a day.",
    quotes: ["post-fajr-hajj-umrah"],
    caveatVisible: true,
    caveatLead:
      "The REWARD of a Hajj and Umrah — the obligation of Hajj still stands. And it rests on a single Sunan narration.",
    caveat:
      "Two things to say plainly. This is the REWARD of a Hajj and an Umrah — it does not discharge the obligation of Hajj, which stands. And it is the largest promise on this page while resting on a single Sunan narration, which is worth knowing before you repeat it to anyone.",
  },

  /* ─────────────── Around your prayers · After you pray ─────────────── */
  {
    id: "tasbih-after-prayer",
    section: "prayers",
    group: "prayers-after",
    action: "After every obligatory prayer: 33 tasbih, 33 tahmid, 34 takbir.",
    effect: "Whoever says them after every prescribed prayer will never be disappointed.",
    cost: "About 90 seconds, five times a day.",
    quotes: ["tasbih-33-34"],
    caveat:
      "The narration gives the counts and names the three by name — tasbih, tahmid, takbir — but it does not spell the words out, so there is no Arabic block on this row. The words are Subhan Allah, al-hamdu lillah and Allahu akbar; the four-words row, under Words you say, carries them in Arabic, and the dhikr page has the full adhkar.",
    link: { href: "/dhikr", label: "The counter, with the full adhkar" },
  },
  {
    id: "tasbih-hundred",
    section: "prayers",
    group: "prayers-after",
    action: "Or 33, 33, 33 — then complete the hundred with the tahlil.",
    effect: "Sins forgiven, even if they were like the foam of the sea.",
    cost: "About 90 seconds, five times a day.",
    quotes: ["tasbih-33-33-33-tahlil"],
    say: { kind: "matn", id: "tasbih-hundredth", label: "The hundredth" },
    caveatVisible: true,
    caveatLead:
      "A different narration and count from the 33/33/34 row — and, like every foam-of-the-sea promise here, read of minor sins.",
    caveat:
      "This is a different narration from the 33/33/34 row, with a different count and a different promise. Both are in Sahih Muslim. Neither cancels the other, and neither is the 'correct' version of the other. The forgiveness here carries the same qualification as every promise of its kind on this page: scholars generally understand it of minor sins, while major sins call for tawbah and wrongs done to people also need putting right with them — that is how scholars have read it, not part of the narration, and the page states it as a reading rather than as a ruling of its own. Only the hundredth is quoted in Arabic here, because it is the only one of the four this narration spells out.",
  },
  {
    id: "tahlil-after-prayer",
    section: "prayers",
    group: "prayers-after",
    action: "Say what he ﷺ said after every obligatory prayer.",
    effect: "No reward is named here — this is simply his own practice.",
    cost: "About 15 seconds, five times a day.",
    quotes: ["tahlil-after-prayer-bukhari"],
    say: { kind: "matn", id: "tahlil-after-prayer" },
  },
  {
    id: "ten-ten-ten",
    section: "prayers",
    group: "prayers-after",
    action: "Ten, ten, ten after each prayer — and 34, 33, 33 as you get into bed.",
    effect: "Paradise is promised for guarding BOTH habits — the narration says few do.",
    cost: "30 seconds after each prayer, 30 more at bedtime.",
    quotes: ["ten-ten-ten"],
    caveat:
      "Two qualities, and the promise is for guarding BOTH. The post-prayer ten is only half of it — the bedtime count is the other half, and taking one without the other is not what is described. The narration also notices the problem this whole page is about: they are easy, and almost nobody does them. It even names why. No Arabic block here, because the narration describes the acts in the third person rather than quoting any formula.",
  },

  /* ─────────────── Qur'an to read (7) · Any amount ─────────────── */
  {
    id: "one-letter",
    section: "quran",
    group: "quran-any",
    action: "Read any amount of the Qur'an — a line will do.",
    effect: "One letter is one good deed, and each good deed is ten like it.",
    cost: "One line. Genuinely.",
    quotes: ["one-letter-ten"],
    link: { href: "/quran", label: "Open the Qur'an" },
  },
  {
    id: "ikhlas",
    section: "quran",
    group: "quran-any",
    action: "Recite Surah al-Ikhlas.",
    effect: "Called equal to a third of the Qur'an — what the equivalence means, scholars differ.",
    cost: "About 10 seconds — four short ayat.",
    quotes: ["ikhlas-third-bukhari"],
    say: { kind: "ayat", keys: ["ikhlas-1", "ikhlas-2", "ikhlas-3", "ikhlas-4"] },
    also: ["ikhlas-third-tirmidhi"],
    caveat:
      "Scholars differ over what the equivalence means — some read it as the reward of a third, others that the surah carries a third of the Qur'an's meanings. The narration itself does not settle it, so neither will this page. What it plainly is not: a substitute for reciting the Qur'an, or for what recitation salah requires. And reciting it three times does not make a completed Qur'an — that is a popular inference, not a narration.",
    link: { href: "/quran/112", label: "Surah al-Ikhlas" },
  },

  /* ─────────────── Qur'an to read · Before you sleep ─────────────── */
  {
    id: "ayat-al-kursi-sleep",
    section: "quran",
    group: "quran-sleep",
    action: "Recite Ayat al-Kursi when you get into bed.",
    effect: "A guard from Allah stays with him, and Satan cannot come near, till dawn.",
    cost: "About 30 seconds, lying down.",
    quotes: ["ayat-kursi-sleep-bukhari-59"],
    say: { kind: "ayat", keys: ["ayat-al-kursi"] },
    also: ["ayat-kursi-sleep-bukhari-66", "ayat-kursi-master"],
    caveat:
      "The famous narration about reciting Ayat al-Kursi after every obligatory prayer is not in any of the seven collections this app carries, so it is not cited here. What this row cites is the bedtime narration, in Sahih al-Bukhari.",
    link: { href: "/protection", label: "Protection & ruqyah" },
  },
  {
    id: "last-two-baqarah",
    section: "quran",
    group: "quran-sleep",
    action: "Recite the last two verses of Surah al-Baqarah at night.",
    effect: "Recited at night, “they suffice him” — what that means, scholars differ.",
    cost: "About a minute.",
    quotes: ["baqarah-last-two-bukhari-66"],
    say: { kind: "ayat", keys: ["baqarah-285", "baqarah-286"] },
    also: ["baqarah-last-two-bukhari-64", "baqarah-last-two-muslim"],
    caveat:
      "Scholars differ over what “sufficient for him” means here — protection through the night, or standing in place of the night prayer, among other readings. The narration does not specify, so take no more from it than it says.",
    link: { href: "/quran/2?v=285", label: "Read them in the Qur'an" },
  },
  {
    id: "surah-al-mulk",
    section: "quran",
    group: "quran-sleep",
    action: "Recite Surah al-Mulk.",
    effect: "Thirty ayat that intercede for the one who recites it until he is forgiven.",
    cost: "About 4 minutes — thirty ayat.",
    quotes: ["mulk-tirmidhi", "mulk-bedtime-tirmidhi"],
    say: {
      kind: "ayat",
      keys: ["mulk-1"],
      label: "The opening ayah",
      note: "The first of thirty — this is where the surah starts, not the whole of it. Open the reader for the rest.",
    },
    also: ["mulk-ibnmajah"],
    caveatVisible: true,
    caveatLead:
      "The intercession narration fixes no time of day. Bedtime comes from a second report — and that one pairs al-Mulk with as-Sajdah.",
    caveat:
      "The intercession narration, Tirmidhi 45:17, names no time of day at all. What puts al-Mulk at bedtime is the second reference on this row, Tirmidhi 48:35, describing his own habit — and note what that one actually says: he would not sleep until he had recited as-Sajdah (32) AND al-Mulk. If it is his practice you want, that is the pair, not al-Mulk alone. Tirmidhi's notes on that second report also record Abu az-Zubair saying he did not hear it from Jabir directly.",
    link: { href: "/quran/67", label: "Surah al-Mulk" },
  },

  /* ─────────────── Qur'an to read · Morning & evening ───────────────
   *
   * Its own heading on purpose: this sat under "Before you sleep" on the old
   * page, which was simply a mis-file — it is a morning AND evening practice. */
  {
    id: "ayat-al-kursi-morning-evening",
    section: "quran",
    group: "quran-morning",
    action: "Morning and evening, recite Ghafir 1–3 and Ayat al-Kursi together.",
    effect: "Protected BY THE TWO of them until evening — and till morning if said at evening.",
    cost: "About two minutes, twice a day.",
    quotes: ["ayat-kursi-morning-evening"],
    say: { kind: "ayat", keys: ["ghafir-1", "ghafir-2", "ghafir-3", "ayat-al-kursi"] },
    caveat:
      "The protection described is by the two of them — the narration says protected BY THEM, the two together. Ayat al-Kursi on its own is a different practice with a different narration — the bedtime row — and this promise is not attached to it. Tirmidhi's own remarks on this report, including a criticism of one narrator's memory, follow the text inside the entry.",
    link: { href: "/muslim-daily", label: "Morning & evening adhkar" },
  },

  /* ─────────────── Qur'an to read · Learn by heart ─────────────── */
  {
    id: "first-ten-kahf",
    section: "quran",
    group: "quran-memorise",
    action: "Memorise the first ten verses of Surah al-Kahf.",
    effect: "Whoever has them by heart is protected from the Dajjal.",
    cost: "Ten verses, learnt once.",
    quotes: ["kahf-ten-muslim"],
    say: {
      kind: "ayat",
      keys: ["kahf-1"],
      label: "The first of the ten",
      note: "Only verse 1 is printed here. The narration is about ten — open the reader and take them together.",
    },
    also: ["kahf-ten-abudawud"],
    caveat:
      "What is narrated here is the first ten verses and protection from the Dajjal. The widely practised Friday recitation of the whole surah is reported outside the seven collections this app carries, so no reference for it is given here — see the Jumu'ah page.",
    link: { href: "/salah?tab=prayers&sub=jumuah", label: "Jumu'ah" },
  },

  /* ─────────────── Kindness & giving (6) ───────────────
   *
   * "& giving" rather than "to people" because build-a-masjid is money, not
   * kindness to a person, and a reader would not look for it under the shorter
   * label. janazah is literally a prayer but is not part of the daily five, so
   * it belongs to the person it is owed to rather than to the prayer cycle. */
  {
    id: "smile",
    section: "people",
    action: "Smile at your brother.",
    effect: "Your smiling in your brother's face is charity.",
    cost: "Free — you were going to see him anyway.",
    quotes: ["smile-charity"],
    also: ["belittle-good"],
    caveat:
      "This wording is narrated by Tirmidhi and, among the seven collections this app carries, only by him — there is no Bukhari or Muslim version of this sentence to fall back on. The same principle in Sahih Muslim is cited beside it: do not write off any good, even meeting your brother with a cheerful face.",
  },
  {
    id: "remove-harm",
    section: "people",
    action: "Take the harmful thing out of the road.",
    effect: "The humblest branch of faith — and he ﷺ saw it among his people's good deeds.",
    cost: "One bend of the back.",
    quotes: ["bone-from-road-abudawud"],
    also: ["harm-from-road-muslim"],
  },
  {
    id: "every-joint",
    section: "people",
    action: "Judge fairly, lift someone's load, say a good word, walk to prayer, clear the road.",
    effect: "Each one counts as the charity owed by every joint, every day the sun rises.",
    cost: "Free — things you pass every single day.",
    quotes: [
      "charity-every-joint-56-198",
      "charity-every-joint-56-106",
      "charity-every-joint-53-17",
    ],
    caveat:
      "These are three separate narrations from Abu Hurayrah, not one hadith with three references — each lists the acts a little differently. All three are referenced here so you can compare them yourself.",
  },
  {
    id: "visit-the-sick",
    section: "people",
    action: "Visit someone who is ill.",
    effect: "Seventy thousand angels send salat on him till evening, and a garden in Paradise.",
    cost: "One visit.",
    quotes: ["visit-sick-tirmidhi"],
    also: ["visit-sick-abudawud"],
    caveatVisible: true,
    caveatLead:
      "Some narrators report this as Ali's own words, not the Prophet's ﷺ; Abu Dawud's version is his statement outright.",
    caveat:
      "Read the attribution carefully on this one. Tirmidhi records within this same entry that some narrators reported it as Ali's own words rather than the Prophet's, and Abu Dawud's version is worded as Ali's statement outright. The reward described is what carries that qualification.",
  },
  {
    id: "janazah",
    section: "people",
    action: "Pray the janazah — and stay until the burial if you can.",
    effect: "One qirat for the prayer, two for staying — each qirat like Mount Uhud.",
    cost: "An hour or two, unscheduled.",
    quotes: ["janazah-qirat-bukhari", "janazah-uhud"],
    also: ["janazah-muslim"],
    link: { href: "/death-rites", label: "Death & janazah" },
  },
  {
    id: "build-a-masjid",
    section: "people",
    action: "Give toward building a masjid when the chance comes.",
    effect: "Whoever built a masjid for Allah — Allah builds him a house in Paradise.",
    cost: "The narration names no amount.",
    quotes: ["build-masjid"],
    caveatVisible: true,
    caveatLead:
      "The narration says whoever BUILT one. Whether a share in one earns the same is for scholars; this page does not answer it.",
    caveat:
      "Two honest limits. The narration says whoever BUILT a mosque for Allah; whether a share in one earns the same promise is a question for scholars, and this page does not answer it — so read “give toward” as encouragement, not as a claim that any sum buys the house. And the clause about seeking Allah's pleasure by it is attributed inside the entry to the sub-narrator's own recollection — Bukair said: I think he said — which is exactly the sort of thing worth noticing before repeating.",
    link: { href: "/zakat", label: "Zakat & giving" },
  },

  /* ─────────────── Fasting & sacred days (6) ───────────────
   *
   * Not "Days to fast": first-ten-dhul-hijjah is not a fast — Bukhari 13:18 is
   * about good deeds generally — so the shorter label would lie about its own
   * contents, and writing "fast" into that row's action would assert something
   * the narration does not say. */
  {
    id: "white-days",
    section: "fasting",
    action: "Fast the white days — the 13th, 14th and 15th of each Hijri month.",
    effect: "He commanded them, and said this is like keeping a perpetual fast.",
    cost: "Three days a month.",
    quotes: ["white-days"],
    also: ["white-days-tirmidhi"],
    link: { href: "/islamic-calendar", label: "This month's Hijri dates" },
  },
  {
    id: "three-days-a-month",
    section: "fasting",
    action: "Or any three days of the month — the dates are not the condition.",
    effect: "Three days of each month is called fasting a lifetime.",
    cost: "Three days a month, any three.",
    quotes: ["three-days-lifetime-nasai", "three-days-any-dates"],
    also: ["three-days-monday-thursday"],
    caveatVisible: true,
    caveatLead:
      "This narration ties that to the three days alone; another ties it to Ramadan PLUS the three. The page does not merge them.",
    caveat:
      "The claim in the action line above is the narration's, not this page's: 'Aishah was asked precisely which days he fasted and answered that he did not mind which. The white days are the three he named, not the only three that count. Note also that this narration attaches the lifetime equivalence to the three days by themselves — another narration attaches it to Ramadan plus the three, which is a different statement, and the page does not merge them.",
  },
  {
    id: "six-of-shawwal",
    section: "fasting",
    action: "Fast six days of Shawwal, after Ramadan.",
    effect: "Ramadan then the six — like fasting a lifetime.",
    cost: "Six days, in the month after.",
    quotes: ["six-shawwal"],
    also: ["six-shawwal-abudawud", "six-shawwal-ibnmajah"],
    caveat:
      "A likeness, not an accounting equivalence — and note the order in the narration: Ramadan first, then the six.",
    link: { href: "/ramadan", label: "Ramadan" },
  },
  {
    id: "one-day-for-allah",
    section: "fasting",
    action: "Fast a single day fi sabil Allah — in the way of Allah.",
    effect: "Allah keeps his face from the Fire the distance of a seventy-year journey.",
    cost: "One day.",
    quotes: ["fast-one-day-70yrs"],
    also: ["fast-one-day-muslim"],
    caveatVisible: true,
    caveatLead:
      "Scholars read fi sabil Allah here two ways — any day given to Him, or a day out on campaign. The page takes no side.",
    caveat:
      "Look at how the two collections render the same phrase: Bukhari has 'for Allah's Pleasure', Muslim has 'in the way of Allah'. It is one Arabic expression, fi sabil Allah, and scholars have read it both ways — some restricting it to fasting while out on campaign, others taking it generally. The page takes no side, which means the general reading is not being asserted here either.",
  },
  {
    id: "ashura",
    section: "fasting",
    action: "Fast the day of 'Ashura — the 10th of Muharram.",
    effect: "He said: I hope it will expiate the year before it.",
    cost: "One day a year.",
    quotes: ["ashura"],
    caveat:
      "Note the wording the Prophet ﷺ used: I hope. He states it as hope, not as a guarantee, and the page will not upgrade it.",
    link: { href: "/islamic-calendar", label: "Muharram in the calendar" },
  },
  {
    id: "first-ten-dhul-hijjah",
    section: "fasting",
    action: "In the first ten days of Dhul Hijjah, do more of whatever good you already do.",
    effect: "No deeds are better than those done in these ten days — not even jihad, with one exception.",
    cost: "Ten days a year.",
    quotes: ["dhul-hijjah-ten"],
    link: { href: "/hajj", label: "Hajj & Umrah" },
  },
];

/** The opening quote — the Prophet's own image for this whole category of deed. */
export const HERO_QUOTE = "two-words-bukhari";
/** The lead-in over "Words you say". In this narration the answer is dhikr.
 *  Renders nowhere else, so deleting that lead deletes a verified citation. */
export const WORDS_LEAD = "shall-i-not-tell-you";
/** The last word on a page like this one. Renders ONCE, on the How tab. */
export const CLOSING_QUOTE = "most-regular-deeds";
