"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import ContentCard from "@/components/ContentCard";
import { textMatch } from "@/lib/search";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { BookOpen, Volume2 } from "lucide-react";

/* ───────────────────────── sections ───────────────────────── */

const sections = [
  { key: "alphabet", label: "The Alphabet" },
  { key: "vowels", label: "Vowels & Marks" },
  { key: "vocabulary", label: "Quranic Vocabulary" },
  { key: "grammar", label: "Basic Grammar" },
  { key: "phrases", label: "Essential Phrases" },
  { key: "numbers", label: "Numbers" },
  { key: "tips", label: "Learning Tips" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── alphabet data ───────────────────────── */

type Letter = {
  letter: string;
  name: string;
  transliteration: string;
  sound: string;
  position: { isolated: string; initial: string; medial: string; final: string };
  example: { word: string; meaning: string };
};

const alphabet: Letter[] = [
  { letter: "ا", name: "Alif", transliteration: "a / ā", sound: "A long 'aa' sound, like 'father'. Also serves as a seat for hamza (glottal stop).", position: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" }, example: { word: "أَسَد", meaning: "Lion" } },
  { letter: "ب", name: "Bā'", transliteration: "b", sound: "Like English 'b' in 'boy'.", position: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" }, example: { word: "بَيْت", meaning: "House" } },
  { letter: "ت", name: "Tā'", transliteration: "t", sound: "Like English 't' in 'top'.", position: { isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" }, example: { word: "تِين", meaning: "Fig" } },
  { letter: "ث", name: "Thā'", transliteration: "th", sound: "Like English 'th' in 'think'. Tongue between the teeth.", position: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" }, example: { word: "ثَلَاثَة", meaning: "Three" } },
  { letter: "ج", name: "Jīm", transliteration: "j", sound: "Like English 'j' in 'judge'.", position: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" }, example: { word: "جَنَّة", meaning: "Paradise" } },
  { letter: "ح", name: "Ḥā'", transliteration: "ḥ", sound: "A deep, breathy 'h' from the throat. No English equivalent. Like fogging a mirror but from deeper.", position: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" }, example: { word: "حَمْد", meaning: "Praise" } },
  { letter: "خ", name: "Khā'", transliteration: "kh", sound: "Like the 'ch' in Scottish 'loch' or German 'Bach'. A raspy sound from the back of the throat.", position: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" }, example: { word: "خَيْر", meaning: "Good / Goodness" } },
  { letter: "د", name: "Dāl", transliteration: "d", sound: "Like English 'd' in 'dog'.", position: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" }, example: { word: "دِين", meaning: "Religion" } },
  { letter: "ذ", name: "Dhāl", transliteration: "dh", sound: "Like English 'th' in 'this' or 'that'. Tongue between the teeth, but voiced.", position: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" }, example: { word: "ذِكْر", meaning: "Remembrance" } },
  { letter: "ر", name: "Rā'", transliteration: "r", sound: "A rolled/trilled 'r', like Spanish 'r'. Never like English 'r'.", position: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" }, example: { word: "رَبّ", meaning: "Lord" } },
  { letter: "ز", name: "Zāy", transliteration: "z", sound: "Like English 'z' in 'zoo'.", position: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" }, example: { word: "زَكَاة", meaning: "Charity (Zakah)" } },
  { letter: "س", name: "Sīn", transliteration: "s", sound: "Like English 's' in 'sun'. Always a clean 's', never 'z'.", position: { isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" }, example: { word: "سَلَام", meaning: "Peace" } },
  { letter: "ش", name: "Shīn", transliteration: "sh", sound: "Like English 'sh' in 'ship'.", position: { isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" }, example: { word: "شَمْس", meaning: "Sun" } },
  { letter: "ص", name: "Ṣād", transliteration: "ṣ", sound: "An emphatic 's' — pronounced with the tongue pressed against the roof of the mouth, creating a heavier, deeper sound than regular 's'.", position: { isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" }, example: { word: "صَلَاة", meaning: "Prayer" } },
  { letter: "ض", name: "Ḍād", transliteration: "ḍ", sound: "An emphatic 'd' — unique to Arabic. Arabic is called 'the language of Ḍād' because this sound exists in no other language. Tongue presses the side of the upper molars.", position: { isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" }, example: { word: "أَرْض", meaning: "Earth" } },
  { letter: "ط", name: "Ṭā'", transliteration: "ṭ", sound: "An emphatic 't' — heavier and deeper than regular 't'. Tongue presses flat against the roof of the mouth.", position: { isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" }, example: { word: "طَهَارَة", meaning: "Purity" } },
  { letter: "ظ", name: "Ẓā'", transliteration: "ẓ", sound: "An emphatic 'dh/th' — like ذ but heavier and deeper. Tongue between teeth with emphasis.", position: { isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" }, example: { word: "ظُلْم", meaning: "Oppression" } },
  { letter: "ع", name: "'Ayn", transliteration: "'a", sound: "A deep, guttural sound from the throat — no English equivalent. Like a constriction deep in the throat. One of the hardest Arabic sounds for non-natives.", position: { isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" }, example: { word: "عِلْم", meaning: "Knowledge" } },
  { letter: "غ", name: "Ghayn", transliteration: "gh", sound: "Like a gargling sound, or the French 'r' in 'Paris'. Produced at the back of the throat.", position: { isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" }, example: { word: "غَفُور", meaning: "Most Forgiving" } },
  { letter: "ف", name: "Fā'", transliteration: "f", sound: "Like English 'f' in 'fish'.", position: { isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" }, example: { word: "فَجْر", meaning: "Dawn (Fajr)" } },
  { letter: "ق", name: "Qāf", transliteration: "q", sound: "A deep 'k' sound from the very back of the throat, near the uvula. Heavier than English 'k'. Not the same as ك.", position: { isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" }, example: { word: "قُرْآن", meaning: "Quran" } },
  { letter: "ك", name: "Kāf", transliteration: "k", sound: "Like English 'k' in 'king'.", position: { isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" }, example: { word: "كِتَاب", meaning: "Book" } },
  { letter: "ل", name: "Lām", transliteration: "l", sound: "Like English 'l' in 'light'. In the name Allah, it becomes heavier (emphatic).", position: { isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" }, example: { word: "لَيْل", meaning: "Night" } },
  { letter: "م", name: "Mīm", transliteration: "m", sound: "Like English 'm' in 'moon'.", position: { isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" }, example: { word: "مَاء", meaning: "Water" } },
  { letter: "ن", name: "Nūn", transliteration: "n", sound: "Like English 'n' in 'noon'.", position: { isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" }, example: { word: "نُور", meaning: "Light" } },
  { letter: "ه", name: "Hā'", transliteration: "h", sound: "Like English 'h' in 'hat'. Lighter than ح.", position: { isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه" }, example: { word: "هُدًى", meaning: "Guidance" } },
  { letter: "و", name: "Wāw", transliteration: "w / ū", sound: "Like English 'w' in 'wow'. Also serves as a long 'oo' vowel.", position: { isolated: "و", initial: "و", medial: "ـو", final: "ـو" }, example: { word: "وَحْي", meaning: "Revelation" } },
  { letter: "ي", name: "Yā'", transliteration: "y / ī", sound: "Like English 'y' in 'yes'. Also serves as a long 'ee' vowel.", position: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" }, example: { word: "يَوْم", meaning: "Day" } },
];

/* ───────────────────────── vowels & diacritics ───────────────────────── */

type Diacritic = {
  mark: string;
  name: string;
  nameAr: string;
  transliteration: string;
  description: string;
  example: { word: string; transliteration: string; meaning: string };
};

const diacritics: Diacritic[] = [
  { mark: "بَ", name: "Fatḥah", nameAr: "فَتْحَة", transliteration: "a", description: "A short diagonal stroke above the letter. Produces a short 'a' sound like 'bat'. The most common vowel in Arabic.", example: { word: "كَتَبَ", transliteration: "kataba", meaning: "He wrote" } },
  { mark: "بِ", name: "Kasrah", nameAr: "كَسْرَة", transliteration: "i", description: "A short diagonal stroke below the letter. Produces a short 'i' sound like 'bit'.", example: { word: "بِسْمِ", transliteration: "bismi", meaning: "In the name of" } },
  { mark: "بُ", name: "Ḍammah", nameAr: "ضَمَّة", transliteration: "u", description: "A small و-shaped mark above the letter. Produces a short 'u' sound like 'put'.", example: { word: "كُتُب", transliteration: "kutub", meaning: "Books" } },
  { mark: "بْ", name: "Sukūn", nameAr: "سُكُون", transliteration: "(none)", description: "A small circle above the letter. Indicates no vowel follows — the consonant is 'silent' or stops. Like the 'b' in 'sub' (no vowel after it).", example: { word: "قُلْ", transliteration: "qul", meaning: "Say!" } },
  { mark: "بّ", name: "Shaddah", nameAr: "شَدَّة", transliteration: "(double)", description: "A small 'w'-shaped mark above the letter. Indicates the consonant is doubled/stressed — held longer. Very important for meaning.", example: { word: "رَبّ", transliteration: "rabb", meaning: "Lord" } },
  { mark: "بً", name: "Tanwīn Fatḥ", nameAr: "تنوين فتح", transliteration: "an", description: "Two fatḥah marks. Adds an 'an' sound at the end of a word. Part of Arabic's noun case system.", example: { word: "كِتَابًا", transliteration: "kitāban", meaning: "A book (accusative)" } },
  { mark: "بٌ", name: "Tanwīn Ḍamm", nameAr: "تنوين ضم", transliteration: "un", description: "Two ḍammah marks. Adds an 'un' sound at the end of a word.", example: { word: "كِتَابٌ", transliteration: "kitābun", meaning: "A book (nominative)" } },
  { mark: "بٍ", name: "Tanwīn Kasr", nameAr: "تنوين كسر", transliteration: "in", description: "Two kasrah marks. Adds an 'in' sound at the end of a word.", example: { word: "كِتَابٍ", transliteration: "kitābin", meaning: "A book (genitive)" } },
];

const longVowels = [
  { letters: "ـَا", name: "Alif after Fatḥah", sound: "ā", description: "Long 'aa' — like 'father'. Hold the 'a' sound twice as long.", example: { word: "كِتَاب", transliteration: "kitāb", meaning: "Book" } },
  { letters: "ـِي", name: "Yā' after Kasrah", sound: "ī", description: "Long 'ee' — like 'see'. Hold the 'i' sound twice as long.", example: { word: "كَرِيم", transliteration: "karīm", meaning: "Generous" } },
  { letters: "ـُو", name: "Wāw after Ḍammah", sound: "ū", description: "Long 'oo' — like 'moon'. Hold the 'u' sound twice as long.", example: { word: "نُور", transliteration: "nūr", meaning: "Light" } },
];

/* ───────────────────────── quranic vocabulary ───────────────────────── */

type VocabCategory = {
  id: string;
  name: string;
  words: { arabic: string; transliteration: string; meaning: string; notes?: string }[];
};

const vocabularyCategories: VocabCategory[] = [
  {
    id: "allah",
    name: "Names & Attributes of Allah",
    words: [
      { arabic: "اللَّه", transliteration: "Allāh", meaning: "God (The One True God)", notes: "Appears 2,699 times in the Quran" },
      { arabic: "رَبّ", transliteration: "Rabb", meaning: "Lord, Sustainer, Cherisher", notes: "Appears 900+ times" },
      { arabic: "رَحْمَن", transliteration: "Raḥmān", meaning: "The Most Gracious", notes: "Intensive form — all-encompassing mercy" },
      { arabic: "رَحِيم", transliteration: "Raḥīm", meaning: "The Most Merciful", notes: "Continuous, specific mercy" },
      { arabic: "مَلِك", transliteration: "Malik", meaning: "King, Sovereign" },
      { arabic: "قُدُّوس", transliteration: "Quddūs", meaning: "The Most Holy" },
      { arabic: "سَلَام", transliteration: "Salām", meaning: "The Source of Peace" },
      { arabic: "عَزِيز", transliteration: "'Azīz", meaning: "The Almighty" },
      { arabic: "حَكِيم", transliteration: "Ḥakīm", meaning: "The Most Wise" },
      { arabic: "عَلِيم", transliteration: "'Alīm", meaning: "The All-Knowing" },
      { arabic: "سَمِيع", transliteration: "Samī'", meaning: "The All-Hearing" },
      { arabic: "بَصِير", transliteration: "Baṣīr", meaning: "The All-Seeing" },
      { arabic: "غَفُور", transliteration: "Ghafūr", meaning: "The Most Forgiving" },
      { arabic: "تَوَّاب", transliteration: "Tawwāb", meaning: "The Acceptor of Repentance" },
    ],
  },
  {
    id: "worship",
    name: "Worship & Prayer",
    words: [
      { arabic: "صَلَاة", transliteration: "Ṣalāh", meaning: "Prayer (ritual)" },
      { arabic: "زَكَاة", transliteration: "Zakāh", meaning: "Obligatory charity" },
      { arabic: "صَوْم / صِيَام", transliteration: "Ṣawm / Ṣiyām", meaning: "Fasting" },
      { arabic: "حَجّ", transliteration: "Ḥajj", meaning: "Pilgrimage to Mecca" },
      { arabic: "دُعَاء", transliteration: "Du'ā'", meaning: "Supplication, calling upon Allah" },
      { arabic: "ذِكْر", transliteration: "Dhikr", meaning: "Remembrance of Allah" },
      { arabic: "تَوْبَة", transliteration: "Tawbah", meaning: "Repentance" },
      { arabic: "عِبَادَة", transliteration: "'Ibādah", meaning: "Worship, servitude" },
      { arabic: "سُجُود", transliteration: "Sujūd", meaning: "Prostration" },
      { arabic: "رُكُوع", transliteration: "Rukū'", meaning: "Bowing" },
      { arabic: "وُضُوء", transliteration: "Wuḍū'", meaning: "Ablution" },
      { arabic: "تَقْوَى", transliteration: "Taqwā", meaning: "God-consciousness, piety" },
    ],
  },
  {
    id: "faith",
    name: "Faith & Belief",
    words: [
      { arabic: "إِيمَان", transliteration: "Īmān", meaning: "Faith, belief" },
      { arabic: "إِسْلَام", transliteration: "Islām", meaning: "Submission to God" },
      { arabic: "تَوْحِيد", transliteration: "Tawḥīd", meaning: "Monotheism, oneness of God" },
      { arabic: "شِرْك", transliteration: "Shirk", meaning: "Associating partners with God" },
      { arabic: "كُفْر", transliteration: "Kufr", meaning: "Disbelief, denial" },
      { arabic: "نِفَاق", transliteration: "Nifāq", meaning: "Hypocrisy" },
      { arabic: "هِدَايَة", transliteration: "Hidāyah", meaning: "Guidance" },
      { arabic: "صِرَاط", transliteration: "Ṣirāṭ", meaning: "Path, way" },
      { arabic: "حَقّ", transliteration: "Ḥaqq", meaning: "Truth, right" },
      { arabic: "بَاطِل", transliteration: "Bāṭil", meaning: "Falsehood, void" },
      { arabic: "نُور", transliteration: "Nūr", meaning: "Light" },
      { arabic: "ظُلُمَات", transliteration: "Ẓulumāt", meaning: "Darkness(es)" },
    ],
  },
  {
    id: "hereafter",
    name: "The Hereafter",
    words: [
      { arabic: "آخِرَة", transliteration: "Ākhirah", meaning: "The Hereafter" },
      { arabic: "دُنْيَا", transliteration: "Dunyā", meaning: "This worldly life" },
      { arabic: "جَنَّة", transliteration: "Jannah", meaning: "Paradise, Garden" },
      { arabic: "نَار", transliteration: "Nār", meaning: "Fire, Hell" },
      { arabic: "يَوْمُ القِيَامَة", transliteration: "Yawm al-Qiyāmah", meaning: "Day of Resurrection" },
      { arabic: "حِسَاب", transliteration: "Ḥisāb", meaning: "Reckoning, account" },
      { arabic: "مِيزَان", transliteration: "Mīzān", meaning: "Scale (of deeds)" },
      { arabic: "بَعْث", transliteration: "Ba'th", meaning: "Resurrection (being raised)" },
      { arabic: "عَذَاب", transliteration: "'Adhāb", meaning: "Punishment, torment" },
      { arabic: "ثَوَاب", transliteration: "Thawāb", meaning: "Reward" },
      { arabic: "حَسَنَة", transliteration: "Ḥasanah", meaning: "Good deed" },
      { arabic: "سَيِّئَة", transliteration: "Sayyi'ah", meaning: "Bad deed, sin" },
    ],
  },
  {
    id: "quran",
    name: "Quranic Terms",
    words: [
      { arabic: "قُرْآن", transliteration: "Qur'ān", meaning: "The Recitation (Quran)" },
      { arabic: "سُورَة", transliteration: "Sūrah", meaning: "Chapter of the Quran" },
      { arabic: "آيَة", transliteration: "Āyah", meaning: "Verse / Sign" },
      { arabic: "وَحْي", transliteration: "Waḥy", meaning: "Revelation" },
      { arabic: "تَفْسِير", transliteration: "Tafsīr", meaning: "Exegesis, interpretation" },
      { arabic: "تِلَاوَة", transliteration: "Tilāwah", meaning: "Recitation" },
      { arabic: "تَجْوِيد", transliteration: "Tajwīd", meaning: "Proper pronunciation rules" },
      { arabic: "حِفْظ", transliteration: "Ḥifẓ", meaning: "Memorization" },
      { arabic: "حَافِظ", transliteration: "Ḥāfiẓ", meaning: "One who memorized the entire Quran" },
      { arabic: "بِسْمِ اللَّه", transliteration: "Bismillāh", meaning: "In the name of God" },
    ],
  },
  {
    id: "people",
    name: "People & Relationships",
    words: [
      { arabic: "نَبِيّ", transliteration: "Nabī", meaning: "Prophet" },
      { arabic: "رَسُول", transliteration: "Rasūl", meaning: "Messenger" },
      { arabic: "مُؤْمِن", transliteration: "Mu'min", meaning: "Believer" },
      { arabic: "مُسْلِم", transliteration: "Muslim", meaning: "One who submits (to God)" },
      { arabic: "أُمَّة", transliteration: "Ummah", meaning: "Community, nation" },
      { arabic: "إِنْسَان", transliteration: "Insān", meaning: "Human being" },
      { arabic: "عَبْد", transliteration: "'Abd", meaning: "Servant, slave (of God)" },
      { arabic: "وَالِد / وَالِدَة", transliteration: "Wālid / Wālidah", meaning: "Father / Mother" },
      { arabic: "أَخ / أُخْت", transliteration: "Akh / Ukht", meaning: "Brother / Sister" },
      { arabic: "قَوْم", transliteration: "Qawm", meaning: "People, nation, tribe" },
    ],
  },
  {
    id: "nature",
    name: "Nature & Creation",
    words: [
      { arabic: "سَمَاء", transliteration: "Samā'", meaning: "Sky, heaven" },
      { arabic: "أَرْض", transliteration: "Arḍ", meaning: "Earth, land" },
      { arabic: "شَمْس", transliteration: "Shams", meaning: "Sun" },
      { arabic: "قَمَر", transliteration: "Qamar", meaning: "Moon" },
      { arabic: "نَجْم", transliteration: "Najm", meaning: "Star" },
      { arabic: "مَاء", transliteration: "Mā'", meaning: "Water" },
      { arabic: "بَحْر", transliteration: "Baḥr", meaning: "Sea" },
      { arabic: "جَبَل", transliteration: "Jabal", meaning: "Mountain" },
      { arabic: "شَجَر", transliteration: "Shajar", meaning: "Tree(s)" },
      { arabic: "لَيْل", transliteration: "Layl", meaning: "Night" },
      { arabic: "نَهَار", transliteration: "Nahār", meaning: "Day (daytime)" },
      { arabic: "رِيح", transliteration: "Rīḥ", meaning: "Wind" },
    ],
  },
  {
    id: "actions",
    name: "Common Verbs",
    words: [
      { arabic: "قَالَ", transliteration: "Qāla", meaning: "He said", notes: "Most common verb in the Quran" },
      { arabic: "آمَنَ", transliteration: "Āmana", meaning: "He believed" },
      { arabic: "عَمِلَ", transliteration: "'Amila", meaning: "He did, worked" },
      { arabic: "عَلِمَ", transliteration: "'Alima", meaning: "He knew" },
      { arabic: "كَتَبَ", transliteration: "Kataba", meaning: "He wrote" },
      { arabic: "خَلَقَ", transliteration: "Khalaqa", meaning: "He created" },
      { arabic: "جَعَلَ", transliteration: "Ja'ala", meaning: "He made, placed" },
      { arabic: "أَنْزَلَ", transliteration: "Anzala", meaning: "He sent down, revealed" },
      { arabic: "دَخَلَ", transliteration: "Dakhala", meaning: "He entered" },
      { arabic: "سَمِعَ", transliteration: "Sami'a", meaning: "He heard" },
      { arabic: "رَأَى", transliteration: "Ra'ā", meaning: "He saw" },
      { arabic: "أَرْسَلَ", transliteration: "Arsala", meaning: "He sent" },
    ],
  },
];

/* ───────────────────────── grammar data ───────────────────────── */

type GrammarTopic = {
  id: string;
  title: string;
  content: string;
  examples: { arabic: string; transliteration: string; meaning: string; note?: string }[];
};

const grammarTopics: GrammarTopic[] = [
  {
    id: "direction",
    title: "Arabic Reads Right-to-Left",
    content: "Arabic is written and read from right to left. Letters connect to each other within a word (like cursive), and most letters change shape depending on their position (beginning, middle, end, or isolated). There are no capital letters. Sentences end with a period that looks the same as English.",
    examples: [
      { arabic: "بِسْمِ ٱللَّهِ", transliteration: "Bismillāh", meaning: "In the name of Allah", note: "Read from the ب on the right" },
    ],
  },
  {
    id: "gender",
    title: "Gender (Masculine & Feminine)",
    content: "Every Arabic noun is either masculine (مُذَكَّر) or feminine (مُؤَنَّث). Most feminine words end in tā' marbūṭah (ة). Adjectives must match the gender of the noun they describe. Verbs also change based on gender.",
    examples: [
      { arabic: "مُسْلِم", transliteration: "Muslim", meaning: "Muslim (male)" },
      { arabic: "مُسْلِمَة", transliteration: "Muslimah", meaning: "Muslim (female)", note: "The ة (tā' marbūṭah) marks feminine" },
      { arabic: "كِتَابٌ كَبِير", transliteration: "Kitābun kabīr", meaning: "A big book (masculine)" },
      { arabic: "مَدْرَسَةٌ كَبِيرَة", transliteration: "Madrasatun kabīrah", meaning: "A big school (feminine)" },
    ],
  },
  {
    id: "definite",
    title: "The Definite Article (ال — Al)",
    content: "Arabic uses the prefix 'ال' (al-) to make a noun definite (like 'the' in English). Without it, the noun is indefinite. When ال is followed by a 'sun letter' (ت ث د ذ ر ز س ش ص ض ط ظ ل ن), the ل assimilates — you pronounce the sun letter doubled instead of saying 'al'.",
    examples: [
      { arabic: "كِتَاب → الكِتَاب", transliteration: "kitāb → al-kitāb", meaning: "a book → the book" },
      { arabic: "شَمْس → الشَّمْس", transliteration: "shams → ash-shams", meaning: "a sun → the sun", note: "Sun letter: ل assimilates into ش" },
      { arabic: "قَمَر → القَمَر", transliteration: "qamar → al-qamar", meaning: "a moon → the moon", note: "Moon letter: ال pronounced normally" },
    ],
  },
  {
    id: "pronouns",
    title: "Personal Pronouns",
    content: "Arabic has pronouns for 1st, 2nd, and 3rd person, with distinctions for masculine/feminine and singular/dual/plural. The most essential ones for Quranic reading:",
    examples: [
      { arabic: "أَنَا", transliteration: "Anā", meaning: "I" },
      { arabic: "نَحْنُ", transliteration: "Naḥnu", meaning: "We" },
      { arabic: "أَنْتَ / أَنْتِ", transliteration: "Anta / Anti", meaning: "You (m.) / You (f.)" },
      { arabic: "أَنْتُمْ", transliteration: "Antum", meaning: "You (plural)" },
      { arabic: "هُوَ / هِيَ", transliteration: "Huwa / Hiya", meaning: "He / She" },
      { arabic: "هُمْ", transliteration: "Hum", meaning: "They" },
    ],
  },
  {
    id: "sentences",
    title: "Sentence Structure",
    content: "Arabic has two main sentence types. A nominal sentence (جُمْلَة اسْمِيَّة) starts with a noun and doesn't need a verb — 'Allah is great' is just two words. A verbal sentence (جُمْلَة فِعْلِيَّة) starts with a verb, followed by the subject, then object (VSO order, unlike English SVO).",
    examples: [
      { arabic: "اللَّهُ أَكْبَر", transliteration: "Allāhu Akbar", meaning: "Allah is greatest", note: "Nominal sentence — no verb needed" },
      { arabic: "اللَّهُ رَحِيم", transliteration: "Allāhu Raḥīm", meaning: "Allah is merciful", note: "Nominal sentence" },
      { arabic: "خَلَقَ اللَّهُ السَّمَاوَاتِ", transliteration: "Khalaqa Allāhu as-samāwāt", meaning: "Allah created the heavens", note: "Verbal sentence — Verb-Subject-Object" },
    ],
  },
  {
    id: "verb-past",
    title: "Past Tense Verb Pattern",
    content: "Arabic verbs are built on a 3-letter root system (usually). The basic past tense pattern is فَعَلَ (fa'ala). By changing the vowels and adding prefixes/suffixes, you change the meaning, tense, and subject. The root carries the core meaning.",
    examples: [
      { arabic: "كَتَبَ", transliteration: "Kataba", meaning: "He wrote", note: "Root: ك-ت-ب (writing)" },
      { arabic: "كَتَبَتْ", transliteration: "Katabat", meaning: "She wrote" },
      { arabic: "كَتَبُوا", transliteration: "Katabū", meaning: "They wrote" },
      { arabic: "كَتَبْتُ", transliteration: "Katabtu", meaning: "I wrote" },
      { arabic: "كِتَاب", transliteration: "Kitāb", meaning: "Book", note: "Same root, different pattern = different but related meaning" },
      { arabic: "مَكْتُوب", transliteration: "Maktūb", meaning: "Written / Destined", note: "Same root again" },
    ],
  },
  {
    id: "roots",
    title: "The Root System",
    content: "This is the most powerful concept in Arabic. Almost every word is derived from a 3-letter root. By recognizing the root, you can understand families of related words even if you've never seen a specific word before. For example, the root س-ل-م (s-l-m) relates to peace, safety, and submission:",
    examples: [
      { arabic: "سَلَام", transliteration: "Salām", meaning: "Peace", note: "Root: س-ل-م" },
      { arabic: "إِسْلَام", transliteration: "Islām", meaning: "Submission (to God)", note: "Same root" },
      { arabic: "مُسْلِم", transliteration: "Muslim", meaning: "One who submits", note: "Same root" },
      { arabic: "تَسْلِيم", transliteration: "Taslīm", meaning: "Greeting / Acceptance", note: "Same root" },
      { arabic: "سَلِيم", transliteration: "Salīm", meaning: "Sound, safe, whole", note: "Same root" },
    ],
  },
  {
    id: "attached-pronouns",
    title: "Attached Pronouns",
    content: "In Arabic, pronouns can attach to the end of nouns, verbs, and prepositions. This is extremely common in the Quran. Understanding these suffixes unlocks a huge portion of Quranic vocabulary.",
    examples: [
      { arabic: "كِتَابُهُ", transliteration: "Kitābuhu", meaning: "His book", note: "ـهُ = his" },
      { arabic: "كِتَابُهَا", transliteration: "Kitābuhā", meaning: "Her book", note: "ـهَا = her" },
      { arabic: "كِتَابُكَ", transliteration: "Kitābuka", meaning: "Your (m.) book", note: "ـكَ = your" },
      { arabic: "كِتَابِي", transliteration: "Kitābī", meaning: "My book", note: "ـي = my" },
      { arabic: "كِتَابُهُمْ", transliteration: "Kitābuhum", meaning: "Their book", note: "ـهُمْ = their" },
      { arabic: "كِتَابُنَا", transliteration: "Kitābunā", meaning: "Our book", note: "ـنَا = our" },
    ],
  },
];

/* ───────────────────────── phrases data ───────────────────────── */

type PhraseCategory = {
  id: string;
  name: string;
  phrases: { arabic: string; transliteration: string; meaning: string; usage: string }[];
};

const phraseCategories: PhraseCategory[] = [
  {
    id: "daily",
    name: "Daily Expressions",
    phrases: [
      { arabic: "بِسْمِ اللَّه", transliteration: "Bismillāh", meaning: "In the name of Allah", usage: "Said before starting any action — eating, drinking, entering a place, beginning work." },
      { arabic: "الحَمْدُ لِلَّه", transliteration: "Al-ḥamdu lillāh", meaning: "All praise is for Allah", usage: "Said to express gratitude — after eating, sneezing, receiving good news, or in any situation." },
      { arabic: "سُبْحَانَ اللَّه", transliteration: "Subḥān Allāh", meaning: "Glory be to Allah", usage: "Said in amazement, wonder, or to glorify Allah. Common in dhikr." },
      { arabic: "اللَّهُ أَكْبَر", transliteration: "Allāhu Akbar", meaning: "Allah is the Greatest", usage: "The opening of every prayer, said in adhan, and to express awe at Allah's greatness." },
      { arabic: "لَا إِلَٰهَ إِلَّا اللَّه", transliteration: "Lā ilāha illā Allāh", meaning: "There is no god but Allah", usage: "The declaration of faith (shahada, first part). The most important phrase in Islam." },
      { arabic: "إِنْ شَاءَ اللَّه", transliteration: "In shā' Allāh", meaning: "If Allah wills", usage: "Said when speaking about future plans. Acknowledges that all outcomes are in Allah's hands." },
      { arabic: "مَا شَاءَ اللَّه", transliteration: "Mā shā' Allāh", meaning: "What Allah has willed", usage: "Said to express appreciation and protect from the evil eye." },
      { arabic: "أَسْتَغْفِرُ اللَّه", transliteration: "Astaghfiru Allāh", meaning: "I seek forgiveness from Allah", usage: "Said to seek forgiveness for sins, mistakes, or even in general remembrance." },
      { arabic: "جَزَاكَ اللَّهُ خَيْرًا", transliteration: "Jazāk Allāhu khayran", meaning: "May Allah reward you with good", usage: "The Islamic way of saying 'thank you'." },
      { arabic: "بَارَكَ اللَّهُ فِيكَ", transliteration: "Bārak Allāhu fīk", meaning: "May Allah bless you", usage: "Said to bless someone or express gratitude." },
    ],
  },
  {
    id: "greetings",
    name: "Greetings & Social",
    phrases: [
      { arabic: "السَّلَامُ عَلَيْكُمْ", transliteration: "As-salāmu 'alaykum", meaning: "Peace be upon you", usage: "The Islamic greeting. Obligatory to respond." },
      { arabic: "وَعَلَيْكُمُ السَّلَام", transliteration: "Wa 'alaykum us-salām", meaning: "And upon you be peace", usage: "The response to the greeting. Can add 'wa raḥmatullāhi wa barakātuh'." },
      { arabic: "أَهْلًا وَسَهْلًا", transliteration: "Ahlan wa sahlan", meaning: "Welcome", usage: "A warm welcoming expression." },
      { arabic: "كَيْفَ حَالُكَ؟", transliteration: "Kayfa ḥāluk?", meaning: "How are you?", usage: "Common way to ask about someone's well-being." },
      { arabic: "الحَمْدُ لِلَّه بِخَيْر", transliteration: "Al-ḥamdu lillāh, bi-khayr", meaning: "Praise be to Allah, I'm well", usage: "Common response to 'how are you'." },
      { arabic: "مَعَ السَّلَامَة", transliteration: "Ma'a as-salāmah", meaning: "Go in peace / Goodbye", usage: "Said when parting." },
    ],
  },
  {
    id: "prayer",
    name: "In Prayer & Quran",
    phrases: [
      { arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ", transliteration: "A'ūdhu billāhi min ash-shayṭān ir-rajīm", meaning: "I seek refuge in Allah from the accursed Satan", usage: "Said before reciting Quran." },
      { arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", transliteration: "Bismillāh ir-Raḥmān ir-Raḥīm", meaning: "In the name of Allah, the Most Gracious, the Most Merciful", usage: "Opens every surah except At-Tawbah (9)." },
      { arabic: "آمِين", transliteration: "Āmīn", meaning: "O Allah, accept / answer", usage: "Said after reciting Al-Fatihah and after du'a." },
      { arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ", transliteration: "Sami'a Allāhu liman ḥamidah", meaning: "Allah hears whoever praises Him", usage: "Said when rising from ruku' (bowing) in prayer." },
      { arabic: "رَبَّنَا وَلَكَ الحَمْد", transliteration: "Rabbanā wa laka al-ḥamd", meaning: "Our Lord, to You belongs all praise", usage: "Said after standing from ruku'." },
      { arabic: "سُبْحَانَ رَبِّيَ الْعَظِيم", transliteration: "Subḥāna Rabbī al-'Aẓīm", meaning: "Glory be to my Lord, the Magnificent", usage: "Said in ruku' (bowing)." },
      { arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى", transliteration: "Subḥāna Rabbī al-A'lā", meaning: "Glory be to my Lord, the Most High", usage: "Said in sujud (prostration)." },
      { arabic: "صَدَقَ اللَّهُ الْعَظِيم", transliteration: "Ṣadaqa Allāh ul-'Aẓīm", meaning: "Allah the Magnificent has spoken the truth", usage: "Commonly said after completing Quran recitation." },
    ],
  },
  {
    id: "events",
    name: "Life Events",
    phrases: [
      { arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُون", transliteration: "Innā lillāhi wa innā ilayhi rāji'ūn", meaning: "Indeed, to Allah we belong and to Him we shall return", usage: "Said upon hearing of a death or any calamity. From Quran 2:156." },
      { arabic: "مُبَارَك", transliteration: "Mubārak", meaning: "Blessed", usage: "Said to congratulate — 'Mubārak 'alayk' means 'congratulations'." },
      { arabic: "تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُم", transliteration: "Taqabbal Allāhu minnā wa minkum", meaning: "May Allah accept from us and from you", usage: "Said on Eid and after completing acts of worship." },
      { arabic: "رَحِمَهُ اللَّه / رَحِمَهَا اللَّه", transliteration: "Raḥimahu Allāh / Raḥimahā Allāh", meaning: "May Allah have mercy on him / her", usage: "Said when mentioning someone who has passed away." },
      { arabic: "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّم", transliteration: "Ṣalla Allāhu 'alayhi wa sallam", meaning: "May Allah's peace and blessings be upon him", usage: "Said after mentioning Prophet Muhammad." },
    ],
  },
];

/* ───────────────────────── numbers data ───────────────────────── */

const numbers = [
  { arabic: "٠", numeral: "0", word: "صِفْر", transliteration: "Ṣifr" },
  { arabic: "١", numeral: "1", word: "وَاحِد", transliteration: "Wāḥid" },
  { arabic: "٢", numeral: "2", word: "اِثْنَان", transliteration: "Ithnān" },
  { arabic: "٣", numeral: "3", word: "ثَلَاثَة", transliteration: "Thalāthah" },
  { arabic: "٤", numeral: "4", word: "أَرْبَعَة", transliteration: "Arba'ah" },
  { arabic: "٥", numeral: "5", word: "خَمْسَة", transliteration: "Khamsah" },
  { arabic: "٦", numeral: "6", word: "سِتَّة", transliteration: "Sittah" },
  { arabic: "٧", numeral: "7", word: "سَبْعَة", transliteration: "Sab'ah" },
  { arabic: "٨", numeral: "8", word: "ثَمَانِيَة", transliteration: "Thamāniyah" },
  { arabic: "٩", numeral: "9", word: "تِسْعَة", transliteration: "Tis'ah" },
  { arabic: "١٠", numeral: "10", word: "عَشَرَة", transliteration: "'Asharah" },
  { arabic: "٢٠", numeral: "20", word: "عِشْرُون", transliteration: "'Ishrūn" },
  { arabic: "٣٠", numeral: "30", word: "ثَلَاثُون", transliteration: "Thalāthūn" },
  { arabic: "٤٠", numeral: "40", word: "أَرْبَعُون", transliteration: "Arba'ūn" },
  { arabic: "٥٠", numeral: "50", word: "خَمْسُون", transliteration: "Khamsūn" },
  { arabic: "١٠٠", numeral: "100", word: "مِائَة", transliteration: "Mi'ah" },
  { arabic: "١٠٠٠", numeral: "1,000", word: "أَلْف", transliteration: "Alf" },
];

/* ───────────────────────── component ───────────────────────── */

function LearnArabicContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionKey>(
    (searchParams.get("tab") as SectionKey) || "alphabet"
  );
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState(0);
  const [activeVocabCat, setActiveVocabCat] = useState("allah");
  const [activeGrammarTopic, setActiveGrammarTopic] = useState("direction");
  const [activePhraseCat, setActivePhraseCat] = useState("daily");

  /* search filtering */
  const filteredAlphabet = alphabet.filter((l) =>
    !search || search.length < 2 ? true : textMatch(search, l.letter, l.name, l.transliteration, l.sound, l.example.word, l.example.meaning)
  );
  const filteredVocabCats = vocabularyCategories.map((cat) => ({
    ...cat,
    words: cat.words.filter((w) =>
      !search || search.length < 2 ? true : textMatch(search, w.arabic, w.transliteration, w.meaning, w.notes)
    ),
  })).filter((cat) => cat.words.length > 0);
  const filteredGrammar = grammarTopics.filter((t) =>
    !search || search.length < 2 ? true : textMatch(search, t.title, t.content, ...t.examples.map((e) => e.arabic), ...t.examples.map((e) => e.meaning))
  );
  const filteredPhraseCats = phraseCategories.map((cat) => ({
    ...cat,
    phrases: cat.phrases.filter((p) =>
      !search || search.length < 2 ? true : textMatch(search, p.arabic, p.transliteration, p.meaning, p.usage)
    ),
  })).filter((cat) => cat.phrases.length > 0);

  const currentLetter = filteredAlphabet[selectedLetter] || filteredAlphabet[0];
  const currentVocabCat = filteredVocabCats.find((c) => c.id === activeVocabCat) || filteredVocabCats[0];
  const currentGrammar = filteredGrammar.find((t) => t.id === activeGrammarTopic) || filteredGrammar[0];
  const currentPhraseCat = filteredPhraseCats.find((c) => c.id === activePhraseCat) || filteredPhraseCats[0];

  return (
    <div>
      <PageHeader
        title="Learn Arabic"
        titleAr="تعلم العربية"
        subtitle="Learn the language of the Quran — the key to understanding Allah's words directly"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search letters, words, phrases..." className="mb-6" />

      {/* Section navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === section.key
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-themed-muted hover:text-themed border sidebar-border"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ═══════════════ ALPHABET ═══════════════ */}
        {activeSection === "alphabet" && (
          <motion.div key="alphabet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
            <ContentCard>
              <div className="text-center py-4">
                <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose mb-3">
                  ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ
                </p>
                <p className="text-themed-muted italic text-sm mb-2">
                  &ldquo;Read! In the name of your Lord who created.&rdquo;
                </p>
                <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Quran 96:1 — The first verse revealed
                </span>
              </div>
            </ContentCard>

            <ContentCard delay={0.1}>
              <h2 className="text-lg font-semibold text-themed mb-2">The Arabic Alphabet</h2>
              <p className="text-sm text-themed-muted mb-4">
                Arabic has 28 letters, all consonants. Vowels are indicated by marks (diacritics) above or below the letters. Arabic is written right-to-left, and most letters connect to each other. Tap any letter to see details.
              </p>

              {/* Letter grid */}
              <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 mb-6">
                {filteredAlphabet.map((l, i) => (
                  <button
                    key={l.name}
                    onClick={() => setSelectedLetter(i)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-center transition-all ${
                      selectedLetter === i
                        ? "bg-gold/20 border-gold/50 border text-gold ring-1 ring-gold/30"
                        : "card-bg border sidebar-border hover:border-gold/30 text-themed"
                    }`}
                  >
                    <span className="text-xl font-arabic leading-none">{l.letter}</span>
                    <span className="text-[9px] text-themed-muted mt-0.5">{l.name}</span>
                  </button>
                ))}
              </div>

              {/* Selected letter detail */}
              {currentLetter && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentLetter.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border sidebar-border p-5"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="text-center sm:text-left">
                        <p className="text-6xl font-arabic text-gold mb-2">{currentLetter.letter}</p>
                        <p className="text-lg font-semibold text-themed">{currentLetter.name}</p>
                        <p className="text-sm text-themed-muted">{currentLetter.transliteration}</p>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-xs text-themed-muted uppercase tracking-wider mb-1">Pronunciation</p>
                          <p className="text-sm text-themed leading-relaxed">{currentLetter.sound}</p>
                        </div>
                        <div>
                          <p className="text-xs text-themed-muted uppercase tracking-wider mb-1">Letter Forms</p>
                          <div className="flex gap-3">
                            {(["isolated", "initial", "medial", "final"] as const).map((pos) => (
                              <div key={pos} className="text-center">
                                <p className="text-2xl font-arabic text-themed">{currentLetter.position[pos]}</p>
                                <p className="text-[10px] text-themed-muted capitalize">{pos}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-themed-muted uppercase tracking-wider mb-1">Example</p>
                          <p className="text-xl font-arabic text-gold">{currentLetter.example.word}</p>
                          <p className="text-xs text-themed-muted">{currentLetter.example.meaning}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </ContentCard>
          </motion.div>
        )}

        {/* ═══════════════ VOWELS & MARKS ═══════════════ */}
        {activeSection === "vowels" && (
          <motion.div key="vowels" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
            <ContentCard>
              <h2 className="text-lg font-semibold text-themed mb-2">Short Vowels & Diacritical Marks</h2>
              <p className="text-sm text-themed-muted mb-4">
                Arabic script only writes consonants. The short vowels and other pronunciation marks are shown as small symbols above or below the letters. In the Quran, all marks are written to ensure perfect recitation. In everyday Arabic, they are often omitted.
              </p>
              <div className="space-y-3">
                {diacritics.map((d, i) => (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-lg border sidebar-border p-4 flex flex-col sm:flex-row gap-4"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <div className="text-center sm:w-20 shrink-0">
                      <p className="text-4xl font-arabic text-gold">{d.mark}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-themed">{d.name}</h3>
                        <span className="text-xs font-arabic text-gold/60">{d.nameAr}</span>
                        <span className="text-xs text-themed-muted">({d.transliteration})</span>
                      </div>
                      <p className="text-xs text-themed-muted leading-relaxed mb-2">{d.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-arabic text-gold text-base">{d.example.word}</span>
                        <span className="text-themed-muted">—</span>
                        <span className="text-themed italic">{d.example.transliteration}</span>
                        <span className="text-themed-muted">({d.example.meaning})</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ContentCard>

            <ContentCard delay={0.1}>
              <h2 className="text-lg font-semibold text-themed mb-2">Long Vowels</h2>
              <p className="text-sm text-themed-muted mb-4">
                Long vowels are formed by combining a short vowel with its corresponding letter. They are held for roughly twice the duration of short vowels — this distinction changes the meaning of words.
              </p>
              <div className="space-y-3">
                {longVowels.map((v, i) => (
                  <div key={v.name} className="rounded-lg border sidebar-border p-4 flex flex-col sm:flex-row gap-4" style={{ backgroundColor: "var(--color-bg)" }}>
                    <div className="text-center sm:w-20 shrink-0">
                      <p className="text-3xl font-arabic text-gold">{v.letters}</p>
                      <p className="text-xs text-themed-muted mt-1">{v.sound}</p>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-themed mb-1">{v.name}</h3>
                      <p className="text-xs text-themed-muted leading-relaxed mb-2">{v.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-arabic text-gold text-base">{v.example.word}</span>
                        <span className="text-themed-muted">—</span>
                        <span className="text-themed italic">{v.example.transliteration}</span>
                        <span className="text-themed-muted">({v.example.meaning})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </motion.div>
        )}

        {/* ═══════════════ VOCABULARY ═══════════════ */}
        {activeSection === "vocabulary" && (
          <motion.div key="vocabulary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Category pills */}
              <div className="md:w-48 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                {filteredVocabCats.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveVocabCat(cat.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap text-left transition-all ${
                      activeVocabCat === cat.id
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    {cat.name}
                    <span className="ml-1.5 text-themed-muted/50">({cat.words.length})</span>
                  </button>
                ))}
              </div>

              {/* Word list */}
              <div className="flex-1">
                {currentVocabCat && (
                  <ContentCard>
                    <h2 className="text-lg font-semibold text-themed mb-4">{currentVocabCat.name}</h2>
                    <div className="space-y-2">
                      {currentVocabCat.words.map((w, i) => (
                        <motion.div
                          key={w.arabic}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-4 py-2.5 px-3 rounded-lg border sidebar-border"
                          style={{ backgroundColor: "var(--color-bg)" }}
                        >
                          <span className="text-2xl font-arabic text-gold min-w-[80px] text-right">{w.arabic}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-themed font-medium">{w.meaning}</p>
                            <p className="text-xs text-themed-muted italic">{w.transliteration}</p>
                            {w.notes && <p className="text-[10px] text-gold/60 mt-0.5">{w.notes}</p>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ContentCard>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ GRAMMAR ═══════════════ */}
        {activeSection === "grammar" && (
          <motion.div key="grammar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Topic pills */}
              <div className="md:w-52 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                {filteredGrammar.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setActiveGrammarTopic(topic.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap text-left transition-all ${
                      activeGrammarTopic === topic.id
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    {topic.title}
                  </button>
                ))}
              </div>

              {/* Topic content */}
              <div className="flex-1">
                {currentGrammar && (
                  <AnimatePresence mode="wait">
                    <motion.div key={currentGrammar.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <ContentCard>
                        <h2 className="text-lg font-semibold text-themed mb-3">{currentGrammar.title}</h2>
                        <p className="text-sm text-themed-muted leading-relaxed mb-5">{currentGrammar.content}</p>
                        <div className="space-y-2.5">
                          {currentGrammar.examples.map((ex, i) => (
                            <div
                              key={i}
                              className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-3 px-4 rounded-lg border sidebar-border"
                              style={{ backgroundColor: "var(--color-bg)" }}
                            >
                              <span className="text-2xl font-arabic text-gold min-w-[120px] text-right">{ex.arabic}</span>
                              <div className="flex-1">
                                <p className="text-sm text-themed font-medium">{ex.meaning}</p>
                                <p className="text-xs text-themed-muted italic">{ex.transliteration}</p>
                                {ex.note && <p className="text-[10px] text-gold/60 mt-0.5">{ex.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ContentCard>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ PHRASES ═══════════════ */}
        {activeSection === "phrases" && (
          <motion.div key="phrases" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Category pills */}
              <div className="md:w-48 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                {filteredPhraseCats.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActivePhraseCat(cat.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap text-left transition-all ${
                      activePhraseCat === cat.id
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Phrases list */}
              <div className="flex-1">
                {currentPhraseCat && (
                  <ContentCard>
                    <h2 className="text-lg font-semibold text-themed mb-4">{currentPhraseCat.name}</h2>
                    <div className="space-y-3">
                      {currentPhraseCat.phrases.map((p, i) => (
                        <motion.div
                          key={p.arabic}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="rounded-lg border sidebar-border p-4"
                          style={{ backgroundColor: "var(--color-bg)" }}
                        >
                          <p className="text-2xl font-arabic text-gold mb-2 text-right leading-loose">{p.arabic}</p>
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                            <p className="text-sm text-themed font-semibold">{p.transliteration}</p>
                            <p className="text-sm text-themed-muted">{p.meaning}</p>
                          </div>
                          <p className="text-xs text-themed-muted/80 leading-relaxed">{p.usage}</p>
                        </motion.div>
                      ))}
                    </div>
                  </ContentCard>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ NUMBERS ═══════════════ */}
        {activeSection === "numbers" && (
          <motion.div key="numbers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
            <ContentCard>
              <h2 className="text-lg font-semibold text-themed mb-2">Arabic Numbers</h2>
              <p className="text-sm text-themed-muted mb-4">
                Arabic numerals (the ones used in the Arab world) are the ancestors of the Western numerals we use today. They read left-to-right, even though Arabic text reads right-to-left.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {numbers.map((n, i) => (
                  <motion.div
                    key={n.numeral}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-lg border sidebar-border p-3 text-center"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-1">
                      <span className="text-2xl font-arabic text-gold">{n.arabic}</span>
                      <span className="text-lg text-themed-muted">=</span>
                      <span className="text-lg text-themed font-mono">{n.numeral}</span>
                    </div>
                    <p className="text-base font-arabic text-themed">{n.word}</p>
                    <p className="text-[10px] text-themed-muted italic">{n.transliteration}</p>
                  </motion.div>
                ))}
              </div>
            </ContentCard>

            <ContentCard delay={0.1}>
              <h3 className="text-sm font-semibold text-themed mb-2">Fun Fact</h3>
              <p className="text-xs text-themed-muted leading-relaxed">
                The word &ldquo;zero&rdquo; in English comes from the Arabic &ldquo;صِفْر&rdquo; (ṣifr), meaning &ldquo;empty.&rdquo; Muslim mathematicians, including al-Khwarizmi (from whose name we get the word &ldquo;algorithm&rdquo;), were instrumental in developing the numeral system that the entire world uses today. The word &ldquo;algebra&rdquo; also comes from Arabic: &ldquo;الجَبْر&rdquo; (al-jabr), the title of al-Khwarizmi&apos;s famous mathematical treatise.
              </p>
            </ContentCard>
          </motion.div>
        )}

        {/* ═══════════════ LEARNING TIPS ═══════════════ */}
        {activeSection === "tips" && (
          <motion.div key="tips" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
            <ContentCard>
              <div className="text-center py-4">
                <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose mb-3">
                  وَلَقَدْ يَسَّرْنَا ٱلْقُرْءَانَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍۢ
                </p>
                <p className="text-themed-muted italic text-sm mb-2">
                  &ldquo;And We have certainly made the Quran easy to remember. So is there anyone who will be mindful?&rdquo;
                </p>
                <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Quran 54:17
                </span>
              </div>
            </ContentCard>

            {[
              {
                title: "1. Start with the Alphabet & Sounds",
                detail: "Master all 28 letters and their forms. Focus especially on the sounds that don't exist in English: ع ('ayn), غ (ghayn), ح (ḥā'), خ (khā'), ق (qāf), ص (ṣād), ض (ḍād), ط (ṭā'), ظ (ẓā'). Listen to a native reciter and imitate. The Quran was revealed as an oral text — sound is everything.",
              },
              {
                title: "2. Learn the Vowel Marks (Tashkīl)",
                detail: "The short vowels (fatḥah, kasrah, ḍammah) and other marks (sukūn, shaddah, tanwīn) are essential for reading the Quran correctly. In the muṣḥaf, every word is fully vowelized, so learning these marks means you can read any word in the Quran — even without knowing its meaning yet.",
              },
              {
                title: "3. Focus on the 300 Most Frequent Words",
                detail: "Approximately 300 words make up about 70-80% of the Quran's vocabulary. Learning these words first gives you the highest return on investment. The vocabulary section on this page covers many of them. Prioritize: Allah, Rabb, āmana, qāla, 'alima, kitāb, yawm, nafs, and other high-frequency words.",
              },
              {
                title: "4. Understand the Root System",
                detail: "This is the most powerful tool in Arabic. Almost every word comes from a 3-letter root. If you know the root, you can understand an entire family of related words. For example, knowing ك-ت-ب (k-t-b = writing) gives you: kitāb (book), kātib (writer), maktūb (written), maktabah (library), kataba (he wrote). Learn roots, not just individual words.",
              },
              {
                title: "5. Read Along with the Quran",
                detail: "Use the Quran reader on this site with transliteration turned on. Follow along with an audio reciter (Mishary Rashid Alafasy, Abdul Basit, or Al-Husary are recommended for learners). Start with short surahs you already know (Al-Fatihah, Al-Ikhlas, An-Nas, Al-Falaq). Try to identify letters and words you've learned.",
              },
              {
                title: "6. Study Tajwīd (Recitation Rules)",
                detail: "Tajwīd is the science of pronouncing every letter from its correct place of articulation, with its proper characteristics. Basic rules include: iẓhār (clear pronunciation), idghām (merging letters), ikhfā' (hiding nasalization), iqlab (converting), madd (elongation), and waqf (stopping). Find a teacher — tajwīd is best learned through oral instruction.",
              },
              {
                title: "7. Be Consistent — Even 10 Minutes Daily",
                detail: "The Prophet ﷺ said: 'The most beloved deeds to Allah are those done consistently, even if they are small' (Sahih al-Bukhari 6464). Consistency is more important than marathon study sessions. Even 10 minutes of daily Arabic study — reviewing letters, learning a few new words, reading a few verses — will compound over weeks and months into real proficiency.",
              },
              {
                title: "8. Make Du'a for Understanding",
                detail: "Ask Allah to make it easy for you. The Prophet Musa (Moses) made du'a: 'My Lord, expand for me my breast, ease for me my task, and untie the knot from my tongue, that they may understand my speech' (Quran 20:25-28). Sincerity and du'a are your greatest tools.",
              },
            ].map((tip, i) => (
              <ContentCard key={tip.title} delay={0.05 + i * 0.05}>
                <h3 className="text-sm font-semibold text-themed mb-2">{tip.title}</h3>
                <p className="text-xs text-themed-muted leading-relaxed">{tip.detail}</p>
              </ContentCard>
            ))}

            <ContentCard delay={0.5}>
              <h3 className="text-sm font-semibold text-themed mb-3">Recommended Resources</h3>
              <ul className="space-y-1.5">
                {[
                  "Madinah Arabic Reader (by Dr. V. Abdur Rahim) — The most respected textbook series for learning Quranic Arabic",
                  "80% of Quranic Words (by Dr. Abdulazeez Abdulraheem) — Focus on the highest-frequency vocabulary",
                  "Bayyinah TV / Arabic with Husna — Ustadh Nouman Ali Khan's accessible Arabic course",
                  "Aratools or Quranic Arabic Corpus — Online tools for word-by-word Quran analysis",
                  "Our Quran Reader — Use the word-by-word breakdown feature on any surah in this app",
                ].map((resource) => (
                  <li key={resource} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                    <span className="text-gold/50 mt-0.5">&#8226;</span>
                    {resource}
                  </li>
                ))}
              </ul>
            </ContentCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LearnArabicPage() {
  return <Suspense><LearnArabicContent /></Suspense>;
}
