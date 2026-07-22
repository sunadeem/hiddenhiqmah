"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import SubTabLayout from "@hidden-hiqmah/ui/components/SubTabLayout";
import TopicInfoCard, { topicSourceRefs, type Topic } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import Accordion from "@hidden-hiqmah/ui/components/Accordion";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import {
  ArrowRight,
  ScrollText,
  Star,
  BookOpen,
  Info,
  GraduationCap,
  Users,
  Sparkles,
  Layers,
} from "lucide-react";
import { parseHadithRef } from "@hidden-hiqmah/ui/lib/search";
import {
  SincerityIllustration,
  SafeFromHarmIllustration,
  PurificationIllustration,
  SpeechIllustration,
  SelfControlIllustration,
  StrangerIllustration,
  QuranIllustration,
  MercyIllustration,
  FamilyIllustration,
  BestCharacterIllustration,
} from "@hidden-hiqmah/ui/components/FeaturedIllustrations";

type BookMeta = {
  id: number;
  name: string;
  count: number;
  startHadith: number;
  endHadith: number;
};

type CollectionMeta = {
  collection: string;
  name: string;
  nameAr: string;
  author: string;
  description?: string;
  totalHadiths: number;
  books: BookMeta[];
};

type HadithEntry = {
  id: number;
  arabic: string;
  english: string;
  reference: string;
};

type SearchResult = {
  hadithId: number;
  snippet: string;
  bookId: number;
  collection: string;
  collectionName: string;
};

const collections = [
  { slug: "bukhari", name: "Sahih al-Bukhari", shortName: "Bukhari", nameAr: "صحيح البخاري", grade: "Sahih", description: "The most authentic collection of hadith, considered the primary source after the Quran." },
  { slug: "muslim", name: "Sahih Muslim", shortName: "Muslim", nameAr: "صحيح مسلم", grade: "Sahih", description: "The second most authentic collection, known for its rigorous methodology and thematic organization." },
  { slug: "abudawud", name: "Sunan Abu Dawud", shortName: "Abu Dawud", nameAr: "سنن أبي داود", grade: "Mixed", description: "Focuses primarily on hadiths related to Islamic jurisprudence and legal rulings." },
  { slug: "tirmidhi", name: "Jami at-Tirmidhi", shortName: "Tirmidhi", nameAr: "جامع الترمذي", grade: "Mixed", description: "Notable for including grading of hadiths and commentary on different scholarly opinions." },
  { slug: "nasai", name: "Sunan an-Nasai", shortName: "Nasai", nameAr: "سنن النسائي", grade: "Mixed", description: "Known for its strict criteria in hadith selection, considered among the most reliable Sunan collections." },
  { slug: "ibnmajah", name: "Sunan Ibn Majah", shortName: "Ibn Majah", nameAr: "سنن ابن ماجه", grade: "Mixed", description: "Completes the six major collections, containing unique hadiths not found in the other five. Note: some scholars considered the Muwatta of Imam Malik as the sixth book instead, and some of Ibn Majah's unique hadiths are weaker in grading." },
  { slug: "ahmad", name: "Musnad Ahmad", shortName: "Ahmad", nameAr: "مسند أحمد", grade: "Mixed", description: "One of the largest and most important collections of hadith, compiled by Imam Ahmad ibn Hanbal. Organized by the companion who narrated each hadith (musnad style), containing approximately 28,199 hadiths." },
];

const featuredHadiths = [
  {
    title: "Deeds Are By Intentions",
    text: "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.",
    narrator: "Narrated 'Umar bin Al-Khattab",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 1,
    hadithId: 1,
    theme: "Sincerity",
    illustration: SincerityIllustration,
  },
  {
    title: "A Muslim Is Safe From Harm",
    text: "A Muslim is the one who avoids harming Muslims with his tongue and hands. And a Muhajir (emigrant) is the one who gives up (abandons) all what Allah has forbidden.",
    narrator: "Narrated 'Abdullah bin 'Amr",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 2,
    hadithId: 10,
    theme: "Character",
    illustration: SafeFromHarmIllustration,
  },
  {
    title: "Cleanliness Is Half of Faith",
    text: "Cleanliness is half of faith and al-Hamdu Lillah (all praise and gratitude is for Allah alone) fills the scale, and Subhan Allah and al-Hamdu Lillah fill up what is between the heavens and the earth.",
    narrator: "Abu Malik at-Ash'ari",
    collection: "muslim",
    collectionName: "Muslim",
    bookId: 2,
    hadithId: 534,
    theme: "Purification",
    illustration: PurificationIllustration,
  },
  {
    title: "Speak Good or Remain Silent",
    text: "Whoever believes in Allah and the Last Day, should not hurt his neighbor and whoever believes in Allah and the Last Day, should serve his guest generously and whoever believes in Allah and the Last Day, should speak what is good or keep silent.",
    narrator: "Narrated Abu Huraira",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 78,
    hadithId: 6136,
    theme: "Speech",
    illustration: SpeechIllustration,
  },
  {
    title: "True Strength Is Self-Control",
    text: "The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger.",
    narrator: "Narrated Abu Huraira",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 78,
    hadithId: 6114,
    theme: "Character",
    illustration: SelfControlIllustration,
  },
  {
    title: "Be a Stranger in This World",
    text: "Be in this world as if you were a stranger or a traveler.",
    narrator: "Narrated 'Abdullah bin 'Umar",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 81,
    hadithId: 6416,
    theme: "Worldly Life",
    illustration: StrangerIllustration,
  },
  {
    title: "Best of You Learn and Teach Quran",
    text: "The best among you (Muslims) are those who learn the Qur'an and teach it.",
    narrator: "Narrated 'Uthman",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 66,
    hadithId: 5027,
    theme: "Quran",
    illustration: QuranIllustration,
  },
  {
    title: "Make Things Easy",
    text: "Make things easy for the people, and do not make it difficult for them, and make them calm (with glad tidings) and do not repulse (them).",
    narrator: "Narrated Anas bin Malik",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 4,
    hadithId: 220,
    theme: "Mercy",
    illustration: MercyIllustration,
  },
  {
    title: "Best of You to Your Wives",
    text: "The most complete of the believers in faith, is the one with the best character among them. And the best of you are those who are best to your women.",
    narrator: "Abu Hurairah",
    collection: "tirmidhi",
    collectionName: "Tirmidhi",
    bookId: 12,
    hadithId: 1162,
    theme: "Family",
    illustration: FamilyIllustration,
  },
  {
    title: "Best Character",
    text: "The most beloved to me amongst you is the one who has the best character and manners.",
    narrator: "Narrated 'Abdullah bin 'Amr",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 62,
    hadithId: 3759,
    theme: "Character",
    illustration: BestCharacterIllustration,
  },
  {
    title: "Islam, Iman, and Ihsan",
    text: "That you worship Allah as if you are seeing Him, for though you don't see Him, He, verily, sees you.",
    narrator: "Narrated 'Umar ibn al-Khattab",
    collection: "muslim",
    collectionName: "Muslim",
    bookId: 1,
    hadithId: 1,
    theme: "Faith",
    illustration: QuranIllustration,
  },
  {
    title: "Love for Your Brother",
    text: "None of you will have faith till he wishes for his (Muslim) brother what he likes for himself.",
    narrator: "Narrated Anas",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 2,
    hadithId: 6,
    theme: "Brotherhood",
    illustration: MercyIllustration,
  },
  {
    title: "The Seven Under Allah's Shade",
    text: "Seven people will be shaded by Allah under His shade on the day when there will be no shade except His.",
    narrator: "Narrated Abu Huraira",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 24,
    hadithId: 27,
    theme: "Devotion",
    illustration: PurificationIllustration,
  },
  {
    title: "Fear Allah Wherever You Are",
    text: "Have Taqwa of Allah wherever you are, and follow an evil deed with a good one to wipe it out, and treat the people with good behavior.",
    narrator: "Abu Dharr",
    collection: "tirmidhi",
    collectionName: "Tirmidhi",
    bookId: 27,
    hadithId: 93,
    theme: "Taqwa",
    illustration: SelfControlIllustration,
  },
  {
    title: "Religion Is Sincerity",
    text: "The Religion is sincerity.",
    narrator: "Tamim ad-Dari",
    collection: "muslim",
    collectionName: "Muslim",
    bookId: 1,
    hadithId: 103,
    theme: "Sincerity",
    illustration: SincerityIllustration,
  },
];

/* ───────────────────── "About Hadith" educational content ───────────────────── */

const aboutSubs = [
  { key: "what", label: "What Is Hadith", icon: <Info size={14} /> },
  { key: "reached", label: "How It Reached Us", icon: <Layers size={14} /> },
  { key: "grading", label: "Grading Explained", icon: <GraduationCap size={14} /> },
  { key: "narrators", label: "The Narrators", icon: <Users size={14} /> },
  { key: "guide", label: "Reader's Guide", icon: <BookOpen size={14} /> },
  { key: "faq", label: "Common Questions", icon: <Info size={14} /> },
] as const;

type AboutSub = (typeof aboutSubs)[number]["key"];

const aboutTopics: Record<Exclude<AboutSub, "faq">, Topic> = {
  what: {
    id: "what-is-hadith",
    name: "What Is a Hadith?",
    content: {
      intro:
        "A hadith is a report of what the Prophet Muhammad ﷺ said, did, or approved of. Together these reports make up the Sunnah — his living example, and the second source of Islam after the Qur'an. Every hadith has two parts: the isnad (the chain of narrators who passed it on — 'A heard it from B, who heard it from the Prophet ﷺ') and the matn (the actual text of the report). The isnad is what allows scholars to judge whether a report is reliable — a science of verification that no other tradition developed to the same degree.",
      verse: {
        arabic:
          "مَّن يُطِعِ ٱلرَّسُولَ فَقَدْ أَطَاعَ ٱللَّهَ ۖ وَمَن تَوَلَّىٰ فَمَآ أَرْسَلْنَـٰكَ عَلَيْهِمْ حَفِيظًا",
        text: "Whoever obeys the Messenger has indeed obeyed Allah. But anyone who turns away, We have not sent you [O Prophet] as a keeper over them.",
        ref: "Quran 4:80",
      },
      points: [
        {
          title: "Why the Sunnah is authoritative",
          detail:
            "Throughout the Qur'an, Allah commands obedience to His Messenger and holds him up as the example believers are to follow. Obeying the Prophet ﷺ is obeying Allah — so his guidance carries binding authority, distinct from but alongside the Qur'an.",
          note: "Quran 4:80; Quran 33:21",
        },
        {
          title: "The Qur'an points beyond itself",
          detail:
            "The Qur'an commands 'establish the prayer' but never states that Fajr is two rak'ahs or how to perform sujud. Allah says He sent the Prophet ﷺ to explain the revelation to the people: 'Whatever the Messenger gives you, accept it, and whatever he forbids you, refrain from it…' The how of the religion comes through the Sunnah.",
          note: "Quran 16:44; Quran 59:7",
        },
        {
          title: "Not his own desire",
          detail:
            "Allah testifies of the Prophet ﷺ: 'Nor does he speak out of his own desire. It is but a revelation sent down [to him].' His teaching is a guided revelation, which is why the Sunnah is preserved and followed like the Qur'an — though the two remain distinct in nature.",
          note: "Quran 53:3-4",
        },
        {
          title: "The 'Qur'an-alone' objection",
          detail:
            "Some argue that only the Qur'an should be followed. But the Qur'an itself repeatedly commands obedience to the Messenger, and cannot be practised without his explanation — the number and form of the prayers, the rates of zakat, and the rites of hajj are all known only through the Sunnah. To reject the Sunnah is to reject the Qur'an's own instructions.",
          note: "Quran 59:7",
        },
      ],
    },
  },
  reached: {
    id: "how-it-reached-us",
    name: "How the Hadith Reached Us",
    content: {
      intro:
        "How do we know these are really his words? The answer is the isnad system and a culture of exact preservation that began in the Prophet's ﷺ own lifetime and matured over the following two centuries.",
      points: [
        {
          title: "Memorised and written from the start",
          detail:
            "The Companions preserved his words by memory and by pen. Abu Huraira said that none of the Companions narrated more hadith than him except 'Abdullah bin 'Amr, 'who used to write them and I never did the same.' Written collections (sahifas) already existed within the first generation.",
          note: "Bukhari 3:55",
        },
        {
          title: "Urgency as the Companions passed",
          detail:
            "The Prophet ﷺ warned that religious knowledge would be taken away through the death of scholars. As the generation who had met him began to pass, scholars worked to gather and record what they had preserved before it could be lost or distorted.",
          note: "Bukhari 3:27",
        },
        {
          title: "The official directive",
          detail:
            "About a century after the Hijrah, the caliph 'Umar ibn 'Abd al-'Aziz ordered the hadith to be formally compiled across the lands, fearing the loss of knowledge. This launched the great age of systematic collection.",
        },
        {
          title: "The era of the Six Books",
          detail:
            "By the third century after the Hijrah, master compilers — al-Bukhari, Muslim, Abu Dawud, at-Tirmidhi, an-Nasa'i, and Ibn Majah — sifted hundreds of thousands of narrations through the isnad science to produce the canonical collections Muslims rely on today, alongside the great Musnad of Imam Ahmad.",
        },
      ],
    },
  },
  grading: {
    id: "grading-explained",
    name: "Hadith Grading Explained",
    content: {
      intro:
        "Not every report attributed to the Prophet ﷺ is equally reliable. Hadith scholars developed a precise science (mustalah al-hadith) to grade each narration by the strength of its chain and the soundness of its text. This is why the collection badges on this page read 'All Sahih' or 'Mixed.'",
      points: [
        {
          title: "Sahih (authentic)",
          detail:
            "A sahih hadith has an unbroken chain of upright, precise narrators from beginning to end, free of hidden defects and irregularity. Sahih al-Bukhari and Sahih Muslim contain only narrations their authors judged to meet this rigorous standard — which is why they are the most trusted books after the Qur'an.",
        },
        {
          title: "Hasan (good)",
          detail:
            "A hasan hadith meets the same conditions, but the precision of one of its narrators is slightly less. It is still accepted as evidence. Both sahih and hasan hadiths are acted upon in practice.",
        },
        {
          title: "Da'if (weak)",
          detail:
            "A da'if hadith carries a flaw — a break in the chain or a criticised narrator. Scholars did not discard weak hadiths outright, but treated them with caution: the majority hold they are not used to establish law or creed, at most only in general encouragement toward good already established elsewhere, and never against an authentic text.",
        },
        {
          title: "Mawdu' (fabricated)",
          detail:
            "A mawdu' report is an outright forgery falsely attributed to the Prophet ﷺ. He warned against this in the gravest terms: 'Do not tell a lie against me for whoever tells a lie against me (intentionally) then he will surely enter the Hell-fire.' The whole isnad science exists precisely to expose such forgeries.",
          note: "Bukhari 3:48; Bukhari 3:49",
        },
        {
          title: "Mutawatir and ahad",
          detail:
            "A mutawatir report is narrated by so many independent chains that agreement upon a lie is impossible — its authenticity is certain. An ahad report comes through fewer chains; a sound ahad hadith is authoritative and acted upon, even though it does not reach the same level of mass transmission.",
        },
        {
          title: "What 'Mixed' means here",
          detail:
            "Bukhari and Muslim pre-screened for authenticity, so they are badged 'All Sahih.' The Sunan collections (Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah) and the Musnad of Ahmad deliberately include sahih, hasan, and some weak narrations together — so a hadith found there should be checked against scholarly grading before it is relied upon for a ruling.",
        },
      ],
    },
  },
  narrators: {
    id: "the-narrators",
    name: "The Companions Who Carried the Sunnah",
    content: {
      intro:
        "Almost every hadith opens with 'Narrated Abu Huraira' or 'A'isha said…'. These are the Companions who carried the Sunnah to the next generation — and a few of them narrated a great deal.",
      verse: {
        arabic:
          "لَّقَدْ كَانَ لَكُمْ فِى رَسُولِ ٱللَّهِ أُسْوَةٌ حَسَنَةٌ لِّمَن كَانَ يَرْجُوا۟ ٱللَّهَ وَٱلْيَوْمَ ٱلْـَٔاخِرَ وَذَكَرَ ٱللَّهَ كَثِيرًا",
        text: "Indeed, in the Messenger of Allah you have an excellent example for those who look forward to Allah and the Last Day, and remember Allah much.",
        ref: "Quran 33:21",
      },
      points: [
        {
          title: "Abu Huraira",
          detail:
            "The single most prolific narrator. He spent barely four years in the Prophet's ﷺ company but devoted them entirely to memorising his words. He himself explained that none of the Companions narrated more than him except 'Abdullah bin 'Amr, who used to write his down.",
          note: "Bukhari 3:55",
        },
        {
          title: "A'isha bint Abi Bakr",
          detail:
            "The Prophet's ﷺ wife and one of the greatest scholars among the Companions — a primary authority on his private conduct, worship, and the rulings of family life, consulted by the senior Companions themselves.",
        },
        {
          title: "'Abdullah ibn 'Umar",
          detail:
            "Son of the second caliph, famed for his scrupulous care to follow the Prophet's ﷺ example exactly. A major narrator of his practice and Sunnah.",
        },
        {
          title: "'Abdullah ibn 'Abbas",
          detail:
            "Cousin of the Prophet ﷺ, for whom he supplicated that he be given deep understanding of the religion. He became the foremost authority on Qur'anic commentary and jurisprudence — 'the scholar of this Ummah.'",
        },
        {
          title: "Anas ibn Malik",
          detail:
            "Served the Prophet ﷺ as a young boy for ten years in Madinah, giving him close, daily knowledge of his manners and habits — and making him one of the most-quoted narrators.",
        },
        {
          title: "Jabir ibn 'Abdullah",
          detail:
            "A young Companion of Madinah who lived long and taught widely, transmitting a large body of hadith on worship, dealings, and the events of the Prophet's ﷺ life.",
        },
      ],
    },
  },
  guide: {
    id: "readers-guide",
    name: "A Reader's Guide",
    content: {
      intro:
        "A few pointers for finding your way around forty thousand narrations without getting lost.",
      points: [
        {
          title: "Reading a reference like 'Bukhari 2:6'",
          detail:
            "The first number is the book (chapter) within the collection; the second is the hadith's number inside that book. Tap any highlighted reference on this site to jump straight to it in the reader. Our numbering follows sunnah.com, so you can cross-check anywhere.",
        },
        {
          title: "Where a beginner should start",
          detail:
            "Begin with the Forty Hadith of Imam an-Nawawi and the Featured selection on this page — short, authentic, and foundational. Sahih al-Bukhari and Sahih Muslim are the safest ground of all: everything in them was graded authentic before inclusion.",
        },
        {
          title: "Why the same hadith repeats across collections",
          detail:
            "One event was often heard by several Companions and passed down through many chains, so you will meet a hadith worded slightly differently in Bukhari, Muslim, and the Sunan. The overlap is a strength — multiple independent chains reinforce a report's authenticity.",
        },
        {
          title: "Read with scholarship, not in isolation",
          detail:
            "A single narration can be qualified or explained by others, or tied to a specific context. This is why scholars write sharh (commentary). Reading one hadith alone and deriving a ruling from it is the most common way newcomers go wrong — when in doubt, consult a qualified scholar.",
        },
      ],
    },
  },
};

const aboutFaq: { id: string; title: string; body: string }[] = [
  {
    id: "conflict",
    title: "What if two hadiths seem to conflict?",
    body:
      "Scholars reconcile apparent conflicts by combining both meanings, or through context, specification, or (rarely) by knowing which report came later. Genuine contradiction between authentic texts is virtually unknown — an apparent clash almost always dissolves with fuller knowledge, which is the trained scholar's work, not the lay reader's.",
  },
  {
    id: "weak",
    title: "Can I act on a weak (da'if) hadith?",
    body:
      "Weak hadiths are not used to establish law or creed. Many scholars permitted mentioning them only for general encouragement in good deeds already established by authentic evidence, and under strict conditions; others avoid them entirely. Never build a practice on a weak report alone — and never against an authentic one.",
  },
  {
    id: "repeat",
    title: "Why do collections repeat the same hadith?",
    body:
      "Because a report reached the compiler through several different chains of narrators, and preserving each chain is part of the science. Al-Bukhari even repeats a hadith across different chapters to draw out a different ruling from it each time.",
  },
  {
    id: "numbering",
    title: "Why does the numbering differ between books and apps?",
    body:
      "Print editions and websites number hadiths differently — some by book, some continuously through the whole collection. Our references follow sunnah.com's per-book numbering. The same hadith may carry a different number elsewhere; its wording and chain are what truly identify it.",
  },
];

/* ───────────────────── The Forty Hadith of Imam an-Nawawi ───────────────────── */

type NawawiEntry = {
  n: number;
  title: string;
  narrator: string;
  /** Fully-qualified corpus reference (auto-linked), or null when the hadith
   *  lies outside the local six-book corpus (see `attribution`). */
  ref: string | null;
  lesson: string;
  attribution?: string;
};

const nawawiHadiths: NawawiEntry[] = [
  { n: 1, title: "Deeds are by intentions", narrator: "'Umar ibn al-Khattab", ref: "Bukhari 1:1", lesson: "Every deed is judged by the intention behind it; sincerity is the foundation of all worship." },
  { n: 2, title: "Islam, Iman, and Ihsan (the Hadith of Jibril)", narrator: "'Umar ibn al-Khattab", ref: "Muslim 1:1", lesson: "The angel Jibril lays out the three levels of the religion: submission, faith, and excellence." },
  { n: 3, title: "The pillars of Islam", narrator: "Ibn 'Umar", ref: "Bukhari 2:1", lesson: "Islam is built upon five: the testimony of faith, prayer, zakat, hajj, and the fast of Ramadan." },
  { n: 4, title: "The stages of creation and the decree", narrator: "Ibn Mas'ud", ref: "Muslim 46:1", lesson: "Our provision, deeds, lifespan, and final end are written while we are still in the womb." },
  { n: 5, title: "Rejecting innovation in religion", narrator: "A'isha", ref: "Muslim 30:23", lesson: "Whoever introduces into our religion something not from it, it is rejected." },
  { n: 6, title: "The lawful and the unlawful are clear", narrator: "an-Nu'man ibn Bashir", ref: "Muslim 22:133", lesson: "Avoid the doubtful to protect your faith and honour; the heart is the piece of flesh that governs the whole body." },
  { n: 7, title: "Religion is sincere counsel", narrator: "Tamim ad-Dari", ref: "Muslim 1:103", lesson: "The whole of the religion is naṣiḥa — to Allah, His Book, His Messenger, and the Muslims." },
  { n: 8, title: "The sanctity of a Muslim's life and wealth", narrator: "Ibn 'Umar", ref: "Bukhari 2:18", lesson: "Whoever testifies to faith and establishes prayer has his life and property protected." },
  { n: 9, title: "Do what you can, avoid what is forbidden", narrator: "Abu Huraira", ref: "Muslim 43:171", lesson: "Leave what is forbidden entirely; carry out what is commanded to the best of your ability." },
  { n: 10, title: "Allah is good and accepts only the good", narrator: "Abu Huraira", ref: "Muslim 12:83", lesson: "Pure earnings and pure food are a condition for supplication being answered." },
  { n: 11, title: "Leave what makes you doubt", narrator: "al-Hasan ibn 'Ali", ref: "Nasai 51:173", lesson: "Turn from what unsettles you to what brings certainty; truth is tranquillity, falsehood is doubt." },
  { n: 12, title: "Leaving what does not concern you", narrator: "Abu Huraira", ref: "Tirmidhi 36:14", lesson: "Part of the excellence of a person's Islam is that he abandons what is of no benefit to him." },
  { n: 13, title: "Love for your brother", narrator: "Anas", ref: "Bukhari 2:6", lesson: "None of you truly believes until he loves for his brother what he loves for himself." },
  { n: 14, title: "The sanctity of Muslim blood", narrator: "Ibn Mas'ud", ref: "Bukhari 87:17", lesson: "A believer's blood may not be shed except in three specified cases — a matter of law reserved to due authority." },
  { n: 15, title: "Honour the neighbour and guest, and speak good", narrator: "Abu Huraira", ref: "Bukhari 78:49", lesson: "Faith shows itself in how you treat your neighbour and guest, and in guarding your tongue." },
  { n: 16, title: "Do not become angry", narrator: "Abu Huraira", ref: "Bukhari 78:143", lesson: "The Prophet ﷺ repeated one piece of advice: do not become angry — and much evil is avoided." },
  { n: 17, title: "Excellence (ihsan) in all things", narrator: "Shaddad ibn Aws", ref: "Muslim 34:84", lesson: "Allah has prescribed doing everything well — even the way an animal is slaughtered." },
  { n: 18, title: "Fear Allah wherever you are", narrator: "Abu Dharr", ref: "Tirmidhi 27:93", lesson: "Follow a bad deed with a good one to wipe it out, and treat people with good character." },
  { n: 19, title: "Be mindful of Allah", narrator: "Ibn 'Abbas", ref: "Tirmidhi 37:102", lesson: "Guard Allah's commands and He will guard you; ask Him alone; the pens have dried on what will be." },
  { n: 20, title: "Modesty (haya)", narrator: "Abu Mas'ud", ref: "Bukhari 78:147", lesson: "'If you feel no shame, do as you wish' — modesty is what restrains a person from wrong." },
  { n: 21, title: "Say 'I believe in Allah,' then be steadfast", narrator: "Sufyan ibn 'Abdullah", ref: "Muslim 1:66", lesson: "A complete religion in a single sentence: true faith, then constancy upon it." },
  { n: 22, title: "The road to Paradise", narrator: "Jabir", ref: "Muslim 1:18", lesson: "Fulfil the obligations and shun the forbidden, and you will enter Paradise." },
  { n: 23, title: "Purification, prayer, charity, patience", narrator: "Abu Malik al-Ash'ari", ref: "Muslim 2:1", lesson: "Purification is half of faith, and every good deed a person does is a light for him." },
  { n: 24, title: "Allah has forbidden oppression (qudsi)", narrator: "Abu Dharr", ref: "Muslim 45:70", lesson: "Allah has forbidden injustice to Himself; He alone guides, feeds, clothes, and forgives — so turn to Him." },
  { n: 25, title: "Every act of good is a charity", narrator: "Abu Huraira", ref: "Muslim 5:184", lesson: "The wealthy hold no monopoly on reward — glorifying Allah after the prayer is a charity open to everyone." },
  { n: 26, title: "Every joint owes a daily charity", narrator: "A'isha", ref: "Muslim 12:67", lesson: "Reconciling people, a good word, and removing harm from the path are each a charity for every joint of the body." },
  { n: 27, title: "Righteousness is good character", narrator: "an-Nawwas ibn Sam'an", ref: "Muslim 45:16", lesson: "Virtue is a beautiful disposition; sin is what unsettles the heart and you would hate others to discover." },
  { n: 28, title: "Hold fast to the Sunnah", narrator: "al-'Irbad ibn Sariyah", ref: "Abu Dawud 42:12", lesson: "In times of confusion, cling to the Prophet's ﷺ way and that of the rightly-guided caliphs; beware invented practices." },
  { n: 29, title: "A deed that leads to Paradise", narrator: "Mu'adh ibn Jabal", ref: "Tirmidhi 40:11", lesson: "Worship, prayer, zakat, and fasting are the path — and the tongue is what most often casts people into the Fire." },
  { n: 30, title: "The limits Allah has set", narrator: "Abu Tha'labah al-Khushani", ref: null, lesson: "Allah set obligations, drew limits, and left some matters unmentioned as a mercy — so do not transgress or pry.", attribution: "Recorded by ad-Daraqutni and others; graded hasan by an-Nawawi. Not held in the local six-book collections." },
  { n: 31, title: "Be indifferent to the world", narrator: "Sahl ibn Sa'd", ref: "Ibn Majah 37:3", lesson: "Renounce the world and Allah will love you; renounce what people hold and the people will love you." },
  { n: 32, title: "No harming and no reciprocating harm", narrator: "Ibn 'Abbas", ref: "Ibn Majah 13:34", lesson: "'There is to be no harm and no reciprocating harm' — a foundational maxim of Islamic law." },
  { n: 33, title: "The burden of proof", narrator: "Ibn 'Abbas", ref: null, lesson: "Proof lies upon the claimant, and the oath upon the one who denies — the basis of Islamic procedure.", attribution: "The wording an-Nawawi cites is recorded by al-Bayhaqi; its meaning is agreed upon (parts appear in Bukhari and Muslim). Not indexed in the local collections." },
  { n: 34, title: "Changing what is wrong", narrator: "Abu Sa'id al-Khudri", ref: "Muslim 1:84", lesson: "Change a wrong with your hand, then your tongue, then your heart — the last being the weakest of faith; how and when to act depends on ability and context." },
  { n: 35, title: "Muslim brotherhood", narrator: "Anas", ref: "Bukhari 78:95", lesson: "Do not envy, hate, or shun one another; be brothers, as Allah's servants." },
  { n: 36, title: "Relieving the distress of others", narrator: "Abu Huraira", ref: "Muslim 48:48", lesson: "Relieve a believer's hardship and Allah relieves yours; Allah aids the servant as long as he aids his brother." },
  { n: 37, title: "Allah's generosity in reward", narrator: "Ibn 'Abbas", ref: "Bukhari 81:80", lesson: "A good deed merely intended is recorded; a bad deed left for Allah's sake is recorded as a good deed." },
  { n: 38, title: "The friends (awliya') of Allah", narrator: "Abu Huraira", ref: "Bukhari 81:91", lesson: "Nearness to Allah comes first through the obligations, then the voluntary acts, until He loves the servant." },
  { n: 39, title: "Pardon for mistakes and forgetfulness", narrator: "Abu Dharr", ref: "Ibn Majah 10:28", lesson: "Allah has pardoned this Ummah for genuine mistakes, forgetfulness, and what they are forced to do." },
  { n: 40, title: "Be a stranger in this world", narrator: "Ibn 'Umar", ref: "Bukhari 81:5", lesson: "Live as a stranger or a passing traveller; take from your health and life before they end." },
  { n: 41, title: "Following what the Prophet ﷺ brought", narrator: "'Abdullah ibn 'Amr", ref: null, lesson: "Complete faith is that one's desires come to follow what the Prophet ﷺ brought.", attribution: "Recorded in Kitab al-Hujjah; its chain is graded weak (da'if) by hadith scholars, though its meaning is sound. Not held in the local six-book collections." },
  { n: 42, title: "Allah's vast forgiveness (qudsi)", narrator: "Anas", ref: "Tirmidhi 48:171", lesson: "However great your sins, Allah's forgiveness is greater — call upon Him, hope in Him, and repent." },
];

/* ───────────────────────── Hadith Qudsi (sacred hadith) ───────────────────────── */

type QudsiEntry = {
  title: string;
  quote: string;
  narrator: string;
  ref: string;
};

// Every `quote` below is a byte-verified substring of the local corpus entry
// at `ref` (see scratchpad qcheck).
const qudsiHadiths: QudsiEntry[] = [
  { title: "As My Servant Expects of Me", quote: "I am with him if He remembers Me. If he remembers Me in himself, I too, remember him in Myself", narrator: "Abu Huraira", ref: "Bukhari 97:34" },
  { title: "I Have Forbidden Oppression", quote: "O My servants, I have forbidden oppression for Myself and have made it forbidden amongst you, so do not oppress one another", narrator: "Abu Dharr", ref: "Muslim 45:70" },
  { title: "What No Eye Has Seen", quote: "I have prepared for My Pious slaves things which have never been seen by an eye, or heard by an ear, or imagined by a human being", narrator: "Abu Huraira", ref: "Bukhari 59:55" },
  { title: "Allah Accepts Only the Good", quote: "Allah is Good and He therefore, accepts only that which is good", narrator: "Abu Huraira", ref: "Muslim 12:83" },
  { title: "Reward Beyond the Deed", quote: "if he refrains from doing it for My Sake, then write it as a good deed", narrator: "Abu Huraira", ref: "Bukhari 97:126" },
  { title: "The Friends of Allah", quote: "I will declare war against him who shows hostility to a pious worshipper of Mine", narrator: "Abu Huraira", ref: "Bukhari 81:91" },
  { title: "Fasting Is for Me", quote: "The Fast is for Me and I will give the reward for it", narrator: "Abu Huraira", ref: "Bukhari 97:118" },
  { title: "I Was Sick, and You Did Not Visit Me", quote: "O son of Adam, I was sick but you did not visit Me", narrator: "Abu Huraira", ref: "Muslim 45:54" },
  { title: "As Long as You Call upon Me", quote: "O son of Adam! Verily as long as you called upon Me and hoped in Me, I forgave you", narrator: "Anas", ref: "Tirmidhi 48:171" },
];

/* ─────────────────── Compiler biographies (per collection tab) ─────────────────── */

const compilerBios: Record<string, { years: string; body: string }> = {
  bukhari: {
    years: "194–256 AH",
    body: "Imam Muhammad al-Bukhari travelled for some sixteen years across the Muslim world gathering narrations, memorising a reported 600,000 of them, yet admitting into his Sahih only around 7,275 (with repetitions) that met his exacting conditions — an unbroken chain of trustworthy narrators who could realistically have met one another. His Sahih is regarded as the most authentic book after the Qur'an.",
  },
  muslim: {
    years: "206–261 AH",
    body: "Imam Muslim ibn al-Hajjaj of Nishapur was a student of al-Bukhari. He arranged his Sahih thematically, gathering all the chains of a single hadith together in one place, and is especially prized for the precision of his wording and the care of his methodology. Together with al-Bukhari's work it forms the 'Sahihayn,' the two most authentic collections.",
  },
  abudawud: {
    years: "202–275 AH",
    body: "Imam Abu Dawud as-Sijistani focused on the hadiths of law (ahkam), sifting a reported 500,000 narrations down to about 4,800. He often noted when a hadith was weak, and his Sunan became a primary reference for jurists across the schools.",
  },
  tirmidhi: {
    years: "209–279 AH",
    body: "Imam Abu 'Isa at-Tirmidhi, another student of al-Bukhari, pioneered in-text grading — labelling hadiths sahih, hasan, or da'if — and recorded the differing opinions of the jurists on each issue. This made his Jami' as much a teaching text as a collection.",
  },
  nasai: {
    years: "215–303 AH",
    body: "Imam Ahmad an-Nasa'i was known for the strictness of his criteria, among the most rigorous of the Sunan compilers. The selection included among the six books is his 'Sunan as-Sughra' (al-Mujtaba), the abridged and more carefully screened of his two works.",
  },
  ibnmajah: {
    years: "209–273 AH",
    body: "Imam Ibn Majah al-Qazwini completed the canonical six books. His Sunan is valued for its clear legal arrangement and for unique narrations not found in the other five — though scholars note that some of those unique reports are weaker in grading.",
  },
  ahmad: {
    years: "164–241 AH",
    body: "Imam Ahmad ibn Hanbal, the great jurist and traditionist of Baghdad and founder of the Hanbali school, arranged his vast Musnad by the Companion who narrated each hadith. He is remembered above all for enduring the mihna (inquisition) — imprisoned and flogged for refusing to affirm that the Qur'an was created — which made him a lasting symbol of steadfastness, the 'Imam of Ahl as-Sunnah.'",
  },
};

const metadataImports: Record<string, () => Promise<{ default: CollectionMeta }>> = {
  bukhari: () => import("@hidden-hiqmah/content/hadith/bukhari/metadata.json"),
  muslim: () => import("@hidden-hiqmah/content/hadith/muslim/metadata.json"),
  abudawud: () => import("@hidden-hiqmah/content/hadith/abudawud/metadata.json"),
  tirmidhi: () => import("@hidden-hiqmah/content/hadith/tirmidhi/metadata.json"),
  nasai: () => import("@hidden-hiqmah/content/hadith/nasai/metadata.json"),
  ibnmajah: () => import("@hidden-hiqmah/content/hadith/ibnmajah/metadata.json"),
  ahmad: () => import("@hidden-hiqmah/content/hadith/ahmad/metadata.json"),
};

function loadBookData(collection: string, bookId: number): Promise<HadithEntry[]> {
  switch (collection) {
    case "bukhari":
      return import(`@hidden-hiqmah/content/hadith/bukhari/${bookId}.json`).then((m) => m.default);
    case "muslim":
      return import(`@hidden-hiqmah/content/hadith/muslim/${bookId}.json`).then((m) => m.default);
    case "abudawud":
      return import(`@hidden-hiqmah/content/hadith/abudawud/${bookId}.json`).then((m) => m.default);
    case "tirmidhi":
      return import(`@hidden-hiqmah/content/hadith/tirmidhi/${bookId}.json`).then((m) => m.default);
    case "nasai":
      return import(`@hidden-hiqmah/content/hadith/nasai/${bookId}.json`).then((m) => m.default);
    case "ibnmajah":
      return import(`@hidden-hiqmah/content/hadith/ibnmajah/${bookId}.json`).then((m) => m.default);
    case "ahmad":
      return import(`@hidden-hiqmah/content/hadith/ahmad/${bookId}.json`).then((m) => m.default);
    default:
      return Promise.resolve([]);
  }
}

function buildSnippet(text: string, query: string): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 120) + "...";
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, idx + query.length + 70);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

export default function HadithPage() {
  const [selected, setSelected] = useState<string>("bukhari");
  const [aboutSub, setAboutSub] = useState<AboutSub>("what");
  const [metadataMap, setMetadataMap] = useState<Record<string, CollectionMeta>>({});
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchCacheRef = useRef<Map<string, HadithEntry[]>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load metadata for all collections
  useEffect(() => {
    for (const col of collections) {
      metadataImports[col.slug]().then((mod) => {
        setMetadataMap((prev) => ({ ...prev, [col.slug]: mod.default }));
      });
    }
  }, []);

  const currentMeta = metadataMap[selected];

  const searchHadiths = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      const q = query.toLowerCase();
      const results: SearchResult[] = [];

      // Search across all collections
      for (const col of collections) {
        const meta = metadataMap[col.slug];
        if (!meta) continue;
        if (results.length >= 50) break;

        for (const book of meta.books) {
          if (results.length >= 50) break;

          const cacheKey = `${col.slug}:${book.id}`;
          let hadiths = searchCacheRef.current.get(cacheKey);
          if (!hadiths) {
            try {
              hadiths = await loadBookData(col.slug, book.id);
              searchCacheRef.current.set(cacheKey, hadiths);
            } catch {
              continue;
            }
          }

          for (const h of hadiths) {
            if (results.length >= 50) break;
            if (h.english && h.english.toLowerCase().includes(q)) {
              results.push({
                hadithId: h.id,
                snippet: buildSnippet(h.english, query),
                bookId: book.id,
                collection: col.slug,
                collectionName: col.shortName,
              });
            }
          }
        }
      }

      setSearchResults(results);
      setSearching(false);
    },
    [metadataMap]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchHadiths(search), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, searchHadiths]);

  function highlightSnippet(snippet: string, query: string) {
    const q = query.toLowerCase();
    const idx = snippet.toLowerCase().indexOf(q);
    if (idx === -1) return snippet;
    return (
      <>
        {snippet.slice(0, idx)}
        <span className="text-gold font-medium">
          {snippet.slice(idx, idx + q.length)}
        </span>
        {snippet.slice(idx + q.length)}
      </>
    );
  }

  // Check for structured hadith reference (e.g. "bukhari 50", "muslim:2912")
  const hadithRef = parseHadithRef(search);
  const hadithRefBook = (() => {
    if (!hadithRef) return null;
    const meta = metadataMap[hadithRef.collection];
    if (!meta) return null;
    const book = meta.books.find(
      (b) => hadithRef.hadithId >= b.startHadith && hadithRef.hadithId <= b.endHadith
    );
    return book ? { bookId: book.id, bookName: book.name } : null;
  })();
  const hadithRefCollection = hadithRef
    ? collections.find((c) => c.slug === hadithRef.collection)
    : null;

  const isSearching = search.length >= 3 || !!hadithRef;

  const isFeatured = selected === "featured";
  const isAbout = selected === "about";
  const isNawawi = selected === "nawawi";
  const isQudsi = selected === "qudsi";
  const selectedInfo = collections.find((c) => c.slug === selected);
  const subtitle = currentMeta
    ? `${currentMeta.totalHadiths.toLocaleString()} hadiths across ${currentMeta.books.length} books — compiled by ${currentMeta.author}`
    : "";

  return (
    <div>
      <PageHeader
        title="Hadith Collections"
        titleAr="الحديث النبوي"
        subtitle="The major collections of Prophet Muhammad's ﷺ sayings and traditions"
      />

      {/* Opening hadith — the first hadith of Sahih al-Bukhari (reuses the featured card's text) */}
      <VerseHero
        label="The Prophet ﷺ said"
        text={featuredHadiths[0].text}
        reference="Bukhari 1:1"
      />

      {/* Search bar */}
      <PageSearch
        value={search}
        onChange={setSearch}
        placeholder="Search hadiths or references (e.g. bukhari 50, muslim 2912)..."
        className="mb-6"
      />

      {/* Search results */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold text-themed">
                Search Results
              </h2>
              <span className="text-sm text-themed-muted">
                {searching
                  ? "Searching..."
                  : `${searchResults.length}${searchResults.length >= 50 ? "+" : ""} results`}
              </span>
            </div>

            {/* Direct reference match */}
            {hadithRef && hadithRefCollection && hadithRefBook && (
              <Link
                href={`/hadith/${hadithRef.collection}/${hadithRefBook.bookId}?h=${hadithRef.hadithId}`}
              >
                <div className="card-bg rounded-lg border border-[var(--color-gold)]/40 p-4 mb-3 hover:border-[var(--color-gold)] transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gold">
                      #{hadithRef.hadithId}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-gold)]/10 text-gold">
                      {hadithRefCollection.shortName}
                    </span>
                    <span className="text-[11px] text-themed-muted">
                      {hadithRefBook.bookName}
                    </span>
                  </div>
                  <p className="text-sm text-themed">
                    Go to {hadithRefCollection.name} — Hadith #{hadithRef.hadithId}
                  </p>
                </div>
              </Link>
            )}
            {hadithRef && hadithRefCollection && !hadithRefBook && (
              <p className="text-sm text-themed-muted py-2">
                Hadith #{hadithRef.hadithId} not found in {hadithRefCollection.name}
              </p>
            )}

            {searchResults.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {searchResults.map((result) => (
                  <Link
                    key={`${result.collection}-${result.hadithId}`}
                    href={`/hadith/${result.collection}/${result.bookId}?h=${result.hadithId}`}
                  >
                    <div className="card-bg rounded-lg border sidebar-border p-4 hover:border-[var(--color-gold)]/30 transition-colors">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-gold">
                          #{result.hadithId}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-gold)]/10 text-gold">
                          {result.collectionName}
                        </span>
                      </div>
                      <p className="text-sm text-themed-muted leading-relaxed">
                        {highlightSnippet(result.snippet, search)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              !searching && (
                <p className="text-sm text-themed-muted py-4">
                  No hadiths found matching &ldquo;{search}&rdquo;
                </p>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection pills (shared TabBar) */}
      <TabBar
        tabs={[
          {
            key: "featured",
            label: "Featured",
            icon: <Star size={14} />,
            highlight: true,
          },
          { key: "about", label: "About Hadith", icon: <Info size={14} /> },
          { key: "nawawi", label: "The Forty", icon: <ScrollText size={14} /> },
          { key: "qudsi", label: "Hadith Qudsi", icon: <Sparkles size={14} /> },
          ...collections.map((col) => ({
            key: col.slug,
            label: col.shortName,
            count: metadataMap[col.slug]?.books.length,
          })),
        ]}
        activeTab={selected}
        onTabChange={setSelected}
        className="mb-6"
      />


      {/* Content area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {isFeatured ? (
            <>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="text-xl font-semibold text-themed">
                  Featured Hadiths
                </h2>
              </div>
              <p className="text-sm text-themed-muted mb-4">
                Well-known and frequently referenced sayings of the Prophet ﷺ
              </p>

              <div className="space-y-16">
                  {featuredHadiths.map((hadith, i) => {
                    const Illustration = hadith.illustration;
                    const isEven = i % 2 === 0;
                    return (
                      <motion.div
                        key={`${hadith.collection}-${hadith.bookId}-${hadith.hadithId}`}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      >
                        <Link href={`/hadith/${hadith.collection}/${hadith.bookId}?h=${hadith.hadithId}`}>
                          <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-12 max-w-4xl mx-auto group`}>
                            {/* Illustration side */}
                            <div className="w-48 h-48 md:w-56 md:h-56 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                              <Illustration />
                            </div>
                            {/* Text side */}
                            <div className={`flex-1 ${isEven ? "md:text-left" : "md:text-right"} text-center`}>
                              <div className={`flex flex-wrap items-center gap-2 mb-3 justify-center ${isEven ? "md:justify-start" : "md:justify-end"}`}>
                                <span className="text-[11px] px-2.5 py-1 rounded-full bg-sky-400/15 text-sky-300">
                                  {hadith.theme}
                                </span>
                                <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-gold)]/10 text-gold">
                                  {hadith.collectionName} #{hadith.hadithId}
                                </span>
                              </div>
                              <h3 className="text-2xl font-semibold text-themed mb-4 group-hover:text-sky-300 transition-colors">
                                {hadith.title}
                              </h3>
                              <p className="text-themed text-lg leading-relaxed mb-4 italic opacity-90">
                                &ldquo;{hadith.text}&rdquo;
                              </p>
                              <p className="text-sm text-themed-muted">
                                — {hadith.narrator}
                              </p>
                            </div>
                          </div>
                        </Link>
                        {i < featuredHadiths.length - 1 && (
                          <div className="flex justify-center mt-16">
                            <div className="w-px h-12 bg-gradient-to-b from-sky-400/30 to-transparent" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
            </>
          ) : isAbout ? (
            <>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="text-xl font-semibold text-themed">About Hadith</h2>
              </div>
              <p className="text-sm text-themed-muted mb-5">
                What the Sunnah is, why it is authoritative, how narrations are graded, and how these
                collections reached us.
              </p>

              <SubTabLayout
                subs={aboutSubs.map((s) => ({ key: s.key, label: s.label, icon: s.icon }))}
                activeSub={aboutSub}
                setActiveSub={setAboutSub}
              >
                {aboutSub === "faq" ? (
                  <div>
                    <h3 className="text-lg font-semibold text-themed mb-3">Common Questions</h3>
                    <Accordion
                      items={aboutFaq.map((f) => ({
                        id: f.id,
                        title: f.title,
                        children: (
                          <p className="text-sm text-themed-muted leading-relaxed">{f.body}</p>
                        ),
                      }))}
                      defaultOpenId={aboutFaq[0]?.id}
                    />
                  </div>
                ) : (
                  <>
                    <TopicInfoCard topic={aboutTopics[aboutSub]} showSource={false} />
                    {topicSourceRefs(aboutTopics[aboutSub]).length > 0 && (
                      <SourcesCard
                        className="mt-4"
                        sources={topicSourceRefs(aboutTopics[aboutSub])}
                      />
                    )}
                  </>
                )}
              </SubTabLayout>
            </>
          ) : isNawawi ? (
            <>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="text-xl font-semibold text-themed">The Forty Hadith of an-Nawawi</h2>
                <span className="text-lg font-arabic text-gold opacity-70">الأربعون النووية</span>
              </div>
              <p className="text-sm text-themed-muted mb-5 max-w-3xl">
                Imam Yahya an-Nawawi (631–676 AH) gathered a set of foundational hadiths — famous as
                &ldquo;The Forty&rdquo; though he included forty-two — each a comprehensive principle
                around which much of the religion turns. For centuries it has been the first hadith
                text a student memorises. Nearly every narration below is held in the collections on
                this page; tap a reference to read it in full. Three of the set come from outside the
                six books or are graded weak, and are flagged as such.
              </p>

              <div className="space-y-3">
                {nawawiHadiths.map((h) => (
                  <div
                    key={h.n}
                    className="card-bg rounded-xl border sidebar-border p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-gold)]/15">
                        <span className="text-gold font-semibold text-sm">{h.n}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-themed leading-tight">{h.title}</h3>
                          {h.ref ? (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-gold)]/10">
                              <HadithRefText text={h.ref} />
                            </span>
                          ) : (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                              Outside the six books
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-themed-muted leading-relaxed">{h.lesson}</p>
                        <p className="text-xs text-themed-muted mt-1.5 opacity-70">— {h.narrator}</p>
                        {h.attribution && (
                          <p className="text-xs text-amber-400/70 mt-1.5">{h.attribution}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : isQudsi ? (
            <>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="text-xl font-semibold text-themed">Hadith Qudsi</h2>
                <span className="text-lg font-arabic text-gold opacity-70">الحديث القدسي</span>
              </div>
              <p className="text-sm text-themed-muted mb-5 max-w-3xl">
                A hadith qudsi (&ldquo;sacred hadith&rdquo;) is a narration in which the Prophet ﷺ
                reports words from Allah — yet, unlike the Qur'an, in the Prophet's ﷺ own phrasing.
                These are among the most beloved narrations in the tradition.
              </p>

              <ContentCard className="mb-5">
                <h4 className="text-sm font-semibold text-themed mb-3">
                  Qur'an, Hadith Qudsi, and ordinary hadith
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-lg p-3 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
                    <p className="text-xs font-semibold text-gold mb-1">The Qur'an</p>
                    <p className="text-xs text-themed-muted leading-relaxed">
                      Allah's exact words and wording, a standing miracle, recited in the prayer, and
                      transmitted by mass (mutawatir) transmission.
                    </p>
                  </div>
                  <div className="rounded-lg p-3 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
                    <p className="text-xs font-semibold text-gold mb-1">Hadith Qudsi</p>
                    <p className="text-xs text-themed-muted leading-relaxed">
                      The meaning is from Allah, the wording from the Prophet ﷺ. It is not recited in
                      the prayer and is graded like any other hadith (sahih, hasan, or weak).
                    </p>
                  </div>
                  <div className="rounded-lg p-3 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
                    <p className="text-xs font-semibold text-gold mb-1">Ordinary hadith</p>
                    <p className="text-xs text-themed-muted leading-relaxed">
                      The Prophet's ﷺ own words, actions, and approvals — his guidance, not framed as
                      direct speech from Allah.
                    </p>
                  </div>
                </div>
              </ContentCard>

              <div className="space-y-3">
                {qudsiHadiths.map((h) => (
                  <div key={h.ref} className="card-bg rounded-xl border sidebar-border p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-themed leading-tight">{h.title}</h3>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-gold)]/10">
                        <HadithRefText text={h.ref} />
                      </span>
                    </div>
                    <p className="text-themed text-sm leading-relaxed italic opacity-90">
                      &ldquo;{h.quote}&rdquo;
                    </p>
                    <p className="text-xs text-themed-muted mt-2 opacity-70">— {h.narrator}</p>
                  </div>
                ))}
              </div>
            </>
          ) : selectedInfo && currentMeta ? (
            <>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="text-xl font-semibold text-themed">
                  {selectedInfo.name}
                </h2>
                <span className="text-lg font-arabic text-gold opacity-70">
                  {selectedInfo.nameAr}
                </span>
                {selectedInfo.grade === "Sahih" ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                    All Sahih
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                    Mixed grades
                  </span>
                )}
                <button
                  onClick={() => {
                    setAboutSub("grading");
                    setSelected("about");
                  }}
                  className="text-[11px] inline-flex items-center gap-1 text-accent hover:text-gold transition-colors"
                >
                  <Info size={11} />
                  What does this mean?
                </button>
              </div>
              <p className="text-sm text-themed-muted mb-2">{selectedInfo.description}</p>
              <p className="text-xs text-themed-muted mb-4">{subtitle}</p>

              {/* About-the-compiler (replaces the old single line) */}
              {compilerBios[selected] && (
                <div className="mb-6">
                  <Accordion
                    items={[
                      {
                        id: "bio",
                        title: `About the compiler — ${currentMeta.author}`,
                        subtitle: compilerBios[selected].years,
                        children: (
                          <p className="text-sm text-themed-muted leading-relaxed">
                            {compilerBios[selected].body}
                          </p>
                        ),
                      },
                    ]}
                  />
                </div>
              )}

              {selected === "ahmad" && (
                <div className="mb-6 p-4 rounded-xl card-bg border sidebar-border">
                  <p className="text-sm text-themed-muted leading-relaxed">
                    Musnad Ahmad contains approximately <strong className="text-themed">28,199</strong> hadiths
                    in its complete Arabic edition. Currently, only{" "}
                    <strong className="text-themed">{currentMeta.totalHadiths.toLocaleString()}</strong> hadiths
                    are available in English translation across {currentMeta.books.length} books. Full English translations
                    exist only in print (Darussalam 6-volume edition).
                  </p>
                </div>
              )}

              {/* Books grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {currentMeta.books.map((book, i) => (
                  <Link
                    key={book.id}
                    href={`/hadith/${selected}/${book.id}`}
                    className="flex"
                  >
                    <ContentCard
                      delay={Math.min(i * 0.02, 0.4)}
                      className="flex-1 flex flex-col"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-gold)]/15">
                          <span className="text-gold font-semibold text-sm">
                            {book.id}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-themed mb-1 leading-tight">
                            {book.name}
                          </h3>
                          <p className="text-xs text-themed-muted mb-3">
                            {book.count} hadiths · #{book.startHadith}–
                            {book.endHadith}
                          </p>
                          <div className="flex items-center gap-1 text-accent text-xs font-medium">
                            <ScrollText size={12} />
                            <span>Browse</span>
                            <ArrowRight size={12} />
                          </div>
                        </div>
                      </div>
                    </ContentCard>
                  </Link>
                ))}
              </div>
            </>
          ) : selectedInfo ? (
            <div className="text-center py-12 text-themed-muted">
              Loading {selectedInfo.name}...
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
