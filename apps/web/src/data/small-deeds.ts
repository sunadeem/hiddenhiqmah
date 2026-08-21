/**
 * /small-deeds — practices whose promised reward is out of all proportion to
 * what they cost.
 *
 * ⛔ NOTHING IN THIS FILE IS A QUOTATION. Every narration, every reference and
 * every character of Arabic lives in small-deeds-quotes.generated.ts, copied by
 * machine out of packages/content. What is authored here is only: the imperative
 * line telling you what to do, the honest cost estimate, the caveats, and which
 * verified key to render. If you need a new narration on this page, add it to
 * scripts/verify-page-citations.small-deeds.input.json, re-run the verifier and
 * the generator, and reference the key — never paste text in here.
 *
 * ⛔ AND NOTHING HERE MAY PUT ARABIC UNDER A "SAY" HEADING BY ITSELF. A Say block
 * renders SAY[id] from the generated module: a word-range cut out of a narration
 * and asserted at build time to be the corpus' own bytes. If a formula is not
 * physically inside any narration on the card, the card gets NO Say block — it
 * does not get the narration's promise clause dressed up as dhikr. See the
 * SAY_SLICES table in scripts/gen-small-deeds-quotes.mjs.
 *
 * Title, slug and nav strings are NOT here — they live in ./small-deeds-meta,
 * which is a leaf module because home-content.ts (→ Sidebar → root layout)
 * imports them and would otherwise ship this whole file to every page.
 */

import type { SayId } from "./small-deeds-quotes.generated";

/* ───────────────────────── tabs ───────────────────────── */

export const tabs = [
  { key: "seconds", label: "Seconds" },
  { key: "day", label: "In Your Day" },
  { key: "moments", label: "When It Happens" },
  { key: "calendar", label: "On the Calendar" },
  { key: "how", label: "How to Read This" },
] as const;

export type TabKey = (typeof tabs)[number]["key"];

/** Section headings inside the "In Your Day" tab — two headings beat two taps. */
export const groups: Record<string, string> = {
  prayers: "Around the five prayers",
  sleep: "Before you sleep",
};

/* ───────────────────────── items ───────────────────────── */

/** Words to say, spliced verbatim — never authored. */
export type SayBlock =
  /** The formula itself, cut out of a narration by the generator. */
  | { kind: "matn"; id: SayId; label?: string }
  /** Ayat, byte-identical to the app's own Qur'an reader. */
  | { kind: "ayat"; keys: string[]; label?: string; note?: string };

export type SmallDeed = {
  /** Stable — ?section=<id> deep links and the card's DOM id depend on it. */
  id: string;
  tab: Exclude<TabKey, "how">;
  group?: keyof typeof groups;
  /** An imperative you can obey without reading anything else on the card. */
  action: string;
  /** The cost of entry, stated literally. The only number on the card we author. */
  cost: string;
  /** Keys into HADITH — rendered verbatim, in order, each with its own citation. */
  quotes: string[];
  say?: SayBlock;
  /** Further narrations of the same practice — citation only, no quote. */
  also?: string[];
  /** Said plainly wherever the promise is easy to over-read, or the chain needs stating. */
  caveat?: string;
  /** This page is an index of disproportion, not a replacement for the real page. */
  link?: { href: string; label: string };
};

export const deeds: SmallDeed[] = [
  /* ─── Seconds ─── */
  {
    id: "istighfar",
    tab: "seconds",
    action: "Ask Allah's forgiveness — and keep asking, not just after sin.",
    cost: "About 3 seconds, in any state.",
    quotes: ["istighfar-distress-abudawud"],
    also: ["istighfar-distress-ibnmajah"],
    caveat:
      "No narration in these collections fixes a daily total for istighfar. The only counts reported are the Prophet's own habit (next card). A round target like ten thousand a day is a contemporary practice — you may find it useful, but nothing is promised for the number itself.",
    link: { href: "/tawbah", label: "Tawbah — the door that never closes" },
  },
  {
    id: "prophet-istighfar",
    tab: "seconds",
    action: "Take the Prophet's ﷺ own rate as your model, not a target you invented.",
    cost: "Seventy to a hundred times a day.",
    quotes: ["prophet-70x-bukhari", "istighfar-100-muslim", "not-confirmed-sinner"],
    also: ["prophet-70x-tirmidhi", "istighfar-100-ibnmajah"],
    caveat:
      "These are descriptions of his practice, offered as a model — not a tariff with a payout attached to the number. Notice too that the reported counts are not the same: seventy in one narration, a hundred in another. That is what a description looks like, and it is a reason not to treat any figure as the target.",
  },
  {
    id: "sayyid-al-istighfar",
    tab: "seconds",
    action: "Say sayyid al-istighfar once in the morning and once before sleep.",
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
    tab: "seconds",
    action: "Say SubhanAllah wa bihamdihi one hundred times in a day.",
    cost: "About 2 minutes, walking.",
    quotes: ["subhanallah-100"],
    say: { kind: "matn", id: "subhanallah-100" },
    caveat:
      "Read as narrated, not as an eraser. Scholars generally understand promises of this kind to cover minor sins; major sins call for tawbah, and wrongs done to people also need putting right with them. That qualification is a scholarly reading, not part of the narration — it is on the founder's review queue for a scholar to word.",
    link: { href: "/dhikr", label: "Count it on the dhikr counter" },
  },
  {
    id: "two-words",
    tab: "seconds",
    action: "Say Subhan Allah al-'Azim, and Subhan Allah wa bihamdihi.",
    cost: "A few seconds — the lightest thing on the page.",
    quotes: ["two-words-bukhari"],
    say: { kind: "matn", id: "two-words" },
    also: ["two-words-muslim", "two-words-tirmidhi", "two-words-ibnmajah"],
  },
  {
    id: "tahlil-100",
    tab: "seconds",
    action:
      "Say La ilaha illa Allah, wahdahu la sharika lah, lahu-l-mulk wa lahu-l-hamd, wa huwa 'ala kulli shay'in qadir — one hundred times in a day.",
    cost: "About 8 minutes — the longest here.",
    quotes: ["tahlil-100-bukhari"],
    say: { kind: "matn", id: "tahlil-100" },
    also: ["tahlil-100-bukhari-59", "tahlil-100-muslim", "tahlil-100-ibnmajah"],
  },
  {
    id: "tahlil-ten",
    tab: "seconds",
    action: "Ten times is its own narration, with its own promise — and one extra phrase.",
    cost: "About 1 minute.",
    quotes: ["tahlil-ten"],
    say: { kind: "matn", id: "tahlil-ten" },
    caveat:
      "Two things. The wording here is not identical to the hundred-times version above: it adds yuhyi wa yumit — He gives life and causes death. And Tirmidhi records inside this same entry that the report has also been narrated from Abu Ayyub as his own words rather than the Prophet's ﷺ. The promise is what carries that qualification.",
  },
  {
    id: "date-palm",
    tab: "seconds",
    action: "Say Subhan Allah al-'Azim wa bihamdih.",
    cost: "About 3 seconds.",
    quotes: ["date-palm-planted"],
    say: { kind: "matn", id: "date-palm" },
  },
  {
    id: "four-words",
    tab: "seconds",
    action:
      "Say the four: Subhan Allah, wal-hamdu lillah, wa la ilaha illa Allah, wa Allahu akbar.",
    cost: "About 5 seconds.",
    quotes: ["four-words-tree"],
    say: { kind: "matn", id: "four-words" },
  },
  {
    id: "hundred-each",
    tab: "seconds",
    action:
      "If you are old, unwell or worn out and can no longer do much: one hundred takbir, one hundred tahmid, one hundred tasbih.",
    cost: "About 5 minutes, sitting down.",
    quotes: ["umm-hani-100s"],
    caveat:
      "This was the answer given to a woman who said she had grown old and weak and heavy — which is exactly who it is for. Read what it is being measured against: horses sent out in the way of Allah, sacrificial camels, slaves set free. It is compared to voluntary acts of enormous cost, not offered in place of what is obligatory. There is no Arabic block on this card because the words the narration uses are instructions addressed to her — say takbir, say tahmid, say tasbih — and not a formula to repeat. The four words themselves are two cards up.",
  },
  {
    id: "salawat",
    tab: "seconds",
    action: "Send salawat on the Prophet ﷺ once.",
    cost: "Two seconds.",
    quotes: ["salawat-ten-muslim", "salawat-formula-bukhari"],
    say: { kind: "matn", id: "salawat" },
    also: ["salawat-ten-tirmidhi", "salawat-abudawud", "salawat-formula-ibnmajah"],
    caveat:
      "The narration promising ten does not itself quote the salawat, so the Arabic above is spliced from the narration where the Companions asked him how to do it — the second one quoted here. There is more than one wording; this is Bukhari's.",
  },
  {
    id: "one-letter",
    tab: "seconds",
    action: "Read any amount of the Qur'an at all — the reward is counted by the letter.",
    cost: "One line. Genuinely.",
    quotes: ["one-letter-ten"],
    link: { href: "/quran", label: "Open the Qur'an" },
  },
  {
    id: "ikhlas",
    tab: "seconds",
    action: "Recite Surah al-Ikhlas.",
    cost: "About 10 seconds — four short ayat.",
    quotes: ["ikhlas-third-bukhari"],
    say: { kind: "ayat", keys: ["ikhlas-1", "ikhlas-2", "ikhlas-3", "ikhlas-4"] },
    also: ["ikhlas-third-tirmidhi"],
    caveat:
      "Scholars differ over what the equivalence means — some read it as the reward of a third, others that the surah carries a third of the Qur'an's meanings. The narration itself does not settle it, so neither will this page. What it plainly is not: a substitute for reciting the Qur'an, or for what recitation salah requires. And reciting it three times does not make a completed Qur'an — that is a popular inference, not a narration.",
    link: { href: "/quran/112", label: "Surah al-Ikhlas" },
  },

  /* ─── In Your Day · around the five prayers ─── */
  {
    id: "tasbih-after-prayer",
    tab: "day",
    group: "prayers",
    action: "After every obligatory prayer: thirty-three, thirty-three, thirty-four.",
    cost: "About 90 seconds, five times a day.",
    quotes: ["tasbih-33-34"],
    caveat:
      "The narration gives the counts and names the three by name — tasbih, tahmid, takbir — but it does not spell the words out, so there is no Arabic block on this card. The words are Subhan Allah, al-hamdu lillah and Allahu akbar; the four-words card carries them in Arabic, and the dhikr page has the full adhkar.",
    link: { href: "/dhikr", label: "The counter, with the full adhkar" },
  },
  {
    id: "tasbih-hundred",
    tab: "day",
    group: "prayers",
    action:
      "Or thirty-three, thirty-three, thirty-three — then complete the hundred with the tahlil.",
    cost: "About 90 seconds, five times a day.",
    quotes: ["tasbih-33-33-33-tahlil"],
    say: { kind: "matn", id: "tasbih-hundredth", label: "The hundredth" },
    caveat:
      "This is a different narration from the one above, with a different count and a different promise. Both are in Sahih Muslim. Neither cancels the other, and neither is the 'correct' version of the other. Only the hundredth is quoted in Arabic here, because it is the only one of the four this narration spells out.",
  },
  {
    id: "tahlil-after-prayer",
    tab: "day",
    group: "prayers",
    action: "Say what the Prophet ﷺ himself said after every obligatory prayer.",
    cost: "About 15 seconds, five times a day.",
    quotes: ["tahlil-after-prayer-bukhari"],
    say: { kind: "matn", id: "tahlil-after-prayer" },
  },
  {
    id: "ten-ten-ten",
    tab: "day",
    group: "prayers",
    action:
      "Ten, ten and ten after each prayer — and thirty-four, thirty-three, thirty-three when you get into bed.",
    cost: "30 seconds after each prayer, 30 more at bedtime.",
    quotes: ["ten-ten-ten"],
    caveat:
      "Read the first line again: two qualities, and the promise is for guarding BOTH. The post-prayer ten is only half of it — the bedtime count is the other half, and taking one without the other is not what is described. The narration also notices the problem this whole page is about: they are easy, and almost nobody does them. It even names why. No Arabic block here, because the narration describes the acts in the third person rather than quoting any formula.",
  },
  {
    id: "fajr-sunnah",
    tab: "day",
    group: "prayers",
    action: "Pray the two rak'ahs before Fajr.",
    cost: "About 3 minutes, before Fajr.",
    quotes: ["fajr-sunnah-muslim", "fajr-sunnah-tirmidhi"],
  },
  {
    id: "twelve-rakah",
    tab: "day",
    group: "prayers",
    action:
      "Keep twelve voluntary rak'ahs across the day: four before Zuhr, two after, two after Maghrib, two after Isha, two before Fajr.",
    cost: "About 20 minutes, split into five pieces.",
    quotes: ["twelve-rakah-muslim", "twelve-rakah-breakdown"],
    also: ["twelve-rakah-muslim-126", "twelve-rakah-breakdown-tirmidhi"],
    caveat:
      "The promise is a house built for you in Paradise — a gift promised, not an entitlement bought. And it is worth noticing that the woman who narrated it never left them off again after hearing it.",
    link: { href: "/salah", label: "Salah, step by step" },
  },
  {
    id: "two-cool-prayers",
    tab: "day",
    group: "prayers",
    action: "Guard Fajr and Asr in particular — the two prayers at the edges of sleep and work.",
    cost: "Two prayers you already owe.",
    quotes: ["two-cool-bukhari"],
    also: ["two-cool-muslim"],
    caveat:
      "Quoted as narrated. It singles these two out for how hard they are to keep — it is not a claim that they stand in for the other three.",
  },
  {
    id: "before-sunrise-sunset",
    tab: "day",
    group: "prayers",
    action: "Same two prayers, a second narration, a different promise.",
    cost: "Nothing beyond what you already owe.",
    quotes: ["before-sunrise-sunset-nasai"],
    also: ["before-sunrise-sunset-abudawud"],
  },
  {
    id: "isha-fajr-congregation",
    tab: "day",
    group: "prayers",
    action: "Pray Isha and Fajr in congregation.",
    cost: "Two walks to the masjid.",
    quotes: ["isha-fajr-congregation"],
  },
  {
    id: "after-fajr-until-sunrise",
    tab: "day",
    group: "prayers",
    action:
      "Pray Fajr in congregation, stay in your place remembering Allah until the sun is up, then pray two rak'ahs.",
    cost: "Roughly 40–60 minutes, once a day.",
    quotes: ["post-fajr-hajj-umrah"],
    caveat:
      "Two things to say plainly. This is the REWARD of a Hajj and an Umrah — it does not discharge the obligation of Hajj, which stands. And it is the largest promise on this page while resting on a single Sunan narration, which is worth knowing before you repeat it to anyone.",
  },
  {
    id: "wudu-two-rakah",
    tab: "day",
    group: "prayers",
    action: "After wudu, pray two rak'ahs and do not let your mind wander in them.",
    cost: "About 3 minutes, when you have wudu anyway.",
    quotes: ["wudu-two-rakah"],
    caveat:
      "The condition inside the narration is the hard part, not the two rak'ahs: not thinking of anything else while you pray them.",
  },
  {
    id: "wudu-shahadah",
    tab: "day",
    group: "prayers",
    action: "Finish your wudu, then say the shahadah.",
    cost: "One sentence.",
    quotes: ["wudu-shahadah"],
    link: { href: "/salah?tab=wudu", label: "How to make wudu" },
  },
  {
    id: "answer-the-adhan",
    tab: "day",
    group: "prayers",
    action:
      "When you hear the adhan, repeat what the mu'adhdhin says, then send salawat, then ask Allah for al-Wasilah for the Prophet ﷺ.",
    cost: "About a minute, five times a day.",
    quotes: ["answer-muadhdhin"],
    caveat:
      "The narration gives the instruction, not a script — what you repeat is whatever the mu'adhdhin has just said. The salawat that comes next is on the Seconds tab, in Arabic.",
    link: { href: "/prayer-times", label: "Today's adhan times" },
  },

  /* ─── In Your Day · before you sleep ─── */
  {
    id: "ayat-al-kursi-sleep",
    tab: "day",
    group: "sleep",
    action: "Recite Ayat al-Kursi when you get into bed.",
    cost: "About 30 seconds, lying down.",
    quotes: ["ayat-kursi-sleep-bukhari-59"],
    say: { kind: "ayat", keys: ["ayat-al-kursi"] },
    also: ["ayat-kursi-sleep-bukhari-66", "ayat-kursi-master"],
    caveat:
      "The famous narration about reciting Ayat al-Kursi after every obligatory prayer is not in any of the seven collections this app carries, so it is not quoted here. What is above is the bedtime narration, in Sahih al-Bukhari.",
    link: { href: "/protection", label: "Protection & ruqyah" },
  },
  {
    id: "ayat-al-kursi-morning-evening",
    tab: "day",
    group: "sleep",
    action:
      "Morning and evening, recite the opening of Surah Ghafir and Ayat al-Kursi — the narration names both together.",
    cost: "About two minutes, twice a day.",
    quotes: ["ayat-kursi-morning-evening"],
    say: { kind: "ayat", keys: ["ghafir-1", "ghafir-2", "ghafir-3", "ayat-al-kursi"] },
    caveat:
      "The protection described is by the two of them — read the wording: protected BY THEM until the evening. Ayat al-Kursi on its own is a different practice with a different narration (the card above), and this promise is not attached to it. Tirmidhi's own remarks on this report, including a criticism of one narrator's memory, follow the text inside the entry.",
    link: { href: "/muslim-daily", label: "Morning & evening adhkar" },
  },
  {
    id: "last-two-baqarah",
    tab: "day",
    group: "sleep",
    action: "Recite the last two verses of Surah al-Baqarah at night.",
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
    tab: "day",
    group: "sleep",
    action: "Recite Surah al-Mulk.",
    cost: "About 4 minutes — thirty ayat.",
    quotes: ["mulk-tirmidhi", "mulk-bedtime-tirmidhi"],
    say: {
      kind: "ayat",
      keys: ["mulk-1"],
      label: "The opening ayah",
      note: "The first of thirty — this is where the surah starts, not the whole of it. Open the reader for the rest.",
    },
    also: ["mulk-ibnmajah"],
    caveat:
      "The intercession narration names no time of day at all. What puts this card under “before you sleep” is the second narration — his own habit — and note what that one actually says: he would not sleep until he had recited as-Sajdah (32) AND al-Mulk. If you want his practice, that is the pair. Tirmidhi's notes on that second report also record Abu az-Zubair saying he did not hear it from Jabir directly.",
    link: { href: "/quran/67", label: "Surah al-Mulk" },
  },

  /* ─── When It Happens ─── */
  {
    id: "smile",
    tab: "moments",
    action: "Smile at your brother.",
    cost: "Free — you were going to see him anyway.",
    quotes: ["smile-charity"],
    also: ["belittle-good"],
    caveat:
      "This wording is narrated by Tirmidhi and, among the seven collections this app carries, only by him — there is no Bukhari or Muslim version of this sentence to fall back on. The same principle in Sahih Muslim is cited beside it: do not write off any good, even meeting your brother with a cheerful face.",
  },
  {
    id: "remove-harm",
    tab: "moments",
    action: "Move the thing in the road that would have hurt someone.",
    cost: "One bend of the back.",
    quotes: ["bone-from-road-abudawud"],
    also: ["harm-from-road-muslim"],
  },
  {
    id: "every-joint",
    tab: "moments",
    action:
      "Settle something fairly between two people, help someone with their load, say a good word, walk to the prayer, clear the path.",
    cost: "Free — things you pass every single day.",
    quotes: [
      "charity-every-joint-56-198",
      "charity-every-joint-56-106",
      "charity-every-joint-53-17",
    ],
    caveat:
      "These are three separate narrations from Abu Hurayrah, not one hadith with three references — each lists the acts a little differently. They are shown together so you can see that for yourself.",
  },
  {
    id: "visit-the-sick",
    tab: "moments",
    action: "Visit someone who is ill.",
    cost: "One visit.",
    quotes: ["visit-sick-tirmidhi"],
    also: ["visit-sick-abudawud"],
    caveat:
      "Read the attribution carefully on this one. Tirmidhi records within this same entry that some narrators reported it as Ali's own words rather than the Prophet's, and Abu Dawud's version is worded as Ali's statement outright. The reward described is what carries that qualification.",
  },
  {
    id: "janazah",
    tab: "moments",
    action: "When there is a janazah, pray it — and if you can, stay until the burial.",
    cost: "An hour or two, unscheduled.",
    quotes: ["janazah-qirat-bukhari", "janazah-uhud"],
    also: ["janazah-muslim"],
    link: { href: "/death-rites", label: "Death & janazah" },
  },
  {
    id: "first-ten-kahf",
    tab: "moments",
    action: "Memorise the first ten verses of Surah al-Kahf.",
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
  {
    id: "build-a-masjid",
    tab: "moments",
    action: "Give toward building a masjid, whenever the chance comes.",
    cost: "The narration names no amount.",
    quotes: ["build-masjid"],
    caveat:
      "Two honest limits. The narration says whoever BUILT a mosque for Allah; whether a share in one earns the same promise is a question for scholars, and this page does not answer it — so read “give toward” as encouragement, not as a claim that any sum buys the house. And the clause about seeking Allah's pleasure by it is attributed inside the entry to the sub-narrator's own recollection — Bukair said: I think he said — which is exactly the sort of thing worth noticing before repeating.",
    link: { href: "/zakat", label: "Zakat & giving" },
  },

  /* ─── On the Calendar ─── */
  {
    id: "white-days",
    tab: "calendar",
    action: "Fast the white days — the 13th, 14th and 15th of each Hijri month.",
    cost: "Three days a month.",
    quotes: ["white-days"],
    also: ["white-days-tirmidhi"],
    link: { href: "/islamic-calendar", label: "This month's Hijri dates" },
  },
  {
    id: "three-days-a-month",
    tab: "calendar",
    action: "Or any three days of the month — the dates are not the condition.",
    cost: "Three days a month, any three.",
    quotes: ["three-days-lifetime-nasai", "three-days-any-dates"],
    also: ["three-days-monday-thursday"],
    caveat:
      "The claim in the heading is the narration's, not this page's: 'Aishah was asked precisely which days he fasted and answered that he did not mind which. The white days are the three he named, not the only three that count. Note also that this narration attaches the lifetime equivalence to the three days by themselves — another narration attaches it to Ramadan plus the three, which is a different statement, and the page does not merge them.",
  },
  {
    id: "six-of-shawwal",
    tab: "calendar",
    action: "Fast six days of Shawwal after Ramadan.",
    cost: "Six days, in the month after.",
    quotes: ["six-shawwal"],
    also: ["six-shawwal-abudawud", "six-shawwal-ibnmajah"],
    caveat:
      "A likeness, not an accounting equivalence — and note the order in the narration: Ramadan first, then the six.",
    link: { href: "/ramadan", label: "Ramadan" },
  },
  {
    id: "one-day-for-allah",
    tab: "calendar",
    action: "Fast a single day for Allah's sake.",
    cost: "One day.",
    quotes: ["fast-one-day-70yrs"],
    also: ["fast-one-day-muslim"],
    caveat:
      "Look at how the two collections render the same phrase: Bukhari has 'for Allah's Pleasure', Muslim has 'in the way of Allah'. It is one Arabic expression, fi sabil Allah, and scholars have read it both ways — some restricting it to fasting while out on campaign, others taking it generally. The page takes no side, which means the general reading is not being asserted here either.",
  },
  {
    id: "ashura",
    tab: "calendar",
    action: "Fast the day of 'Ashura — the 10th of Muharram.",
    cost: "One day a year.",
    quotes: ["ashura"],
    caveat:
      "Note the wording the Prophet ﷺ used: I hope. He states it as hope, not as a guarantee, and the page will not upgrade it.",
    link: { href: "/islamic-calendar", label: "Muharram in the calendar" },
  },
  {
    id: "first-ten-dhul-hijjah",
    tab: "calendar",
    action:
      "In the first ten days of Dhul Hijjah, do whatever good you already know how to do — and do more of it.",
    cost: "Ten days a year.",
    quotes: ["dhul-hijjah-ten"],
    link: { href: "/hajj", label: "Hajj & Umrah" },
  },
];

/** The opening quote — the Prophet's own image for this whole category of deed. */
export const HERO_QUOTE = "two-words-bukhari";
/** The lead-in over the Seconds tab. In this narration the answer is dhikr. */
export const SECONDS_LEAD = "shall-i-not-tell-you";
/** The last word on a page like this one. */
export const CLOSING_QUOTE = "most-regular-deeds";
/** The Prophet's ﷺ own reported istighfar counts — quoted in the How-to-Read tab. */
export const ISTIGHFAR_COUNTS = ["prophet-70x-bukhari", "istighfar-100-muslim"];
