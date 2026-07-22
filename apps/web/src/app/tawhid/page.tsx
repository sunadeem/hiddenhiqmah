"use client";

import { Fragment, useState, useRef, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import BookmarkButton from "@hidden-hiqmah/ui/components/BookmarkButton";
import SourcesCard, { type SourceRef } from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import {
  Shield,
  Heart,
  Star,
  AlertTriangle,
  BookOpen,
  X,
} from "lucide-react";
import namesOfAllahData from "@hidden-hiqmah/content/names-of-allah";

/* ───────────────────────── data ───────────────────────── */

const whyItMatters = [
  {
    point: "It is the purpose of creation",
    detail:
      "Allah says: \"I did not create the jinn and mankind except to worship Me.\" Tawheed is the very reason we exist.",
    reference: "Quran 51:56",
  },
  {
    point: "It is the message of every prophet",
    detail:
      "Every prophet — from Adam to Muhammad (peace be upon them all) — was sent with the same core message: worship Allah alone and reject all false gods.",
    reference: "Quran 21:25",
  },
  {
    point: "It is the condition for entering Paradise",
    detail:
      "The Prophet (peace be upon him) said: \"Whoever dies knowing that there is no god worthy of worship except Allah shall enter Paradise.\"",
    reference: "Muslim 1:178",
  },
  {
    point: "Shirk is the only unforgivable sin if one dies upon it",
    detail:
      "Allah says: \"Indeed, Allah does not forgive association with Him, but He forgives what is less than that for whom He wills.\"",
    reference: "Quran 4:48",
  },
  {
    point: "It is the greatest right of Allah upon His servants",
    detail:
      "The Prophet (peace be upon him) told Mu'adh ibn Jabal: \"The right of Allah upon His servants is that they worship Him alone and do not associate anything with Him.\"",
    reference: "Bukhari 56:72",
  },
];

/* ── Shirk: major / minor / hidden, with the narrations that define each ── */

type ShirkType = {
  id: string;
  title: string;
  titleAr: string;
  severity: string;
  description: string;
  verses?: { ref: string; arabic?: string; text: string }[];
  hadith?: { ref: string; text: string }[];
  examples: string[];
};

const shirkTypes: ShirkType[] = [
  {
    id: "major",
    title: "Major Shirk",
    titleAr: "الشرك الأكبر",
    severity: "Takes a person out of Islam",
    description:
      "Directing any act of worship — supplication, sacrifice, vows, ultimate love, fear, or hope — to other than Allah, or believing that another shares in what belongs to Allah alone. This is the shirk that nullifies all of a person's deeds, and if one dies upon it without repenting, it is never forgiven.",
    verses: [
      {
        ref: "Quran 39:65",
        arabic:
          "وَلَقَدْ أُوحِىَ إِلَيْكَ وَإِلَى ٱلَّذِينَ مِن قَبْلِكَ لَئِنْ أَشْرَكْتَ لَيَحْبَطَنَّ عَمَلُكَ وَلَتَكُونَنَّ مِنَ ٱلْخَـٰسِرِينَ",
        text: "It has already been revealed to you and to those who came before you that if you associate others with Allah, your deeds will surely become worthless, and you will certainly be among the losers.",
      },
    ],
    examples: [
      "Praying to, or seeking rescue from, the dead, saints, or those in graves",
      "Sacrificing an animal, or making a vow, for anyone besides Allah",
      "Believing any created being independently controls benefit, harm, life, or death",
    ],
  },
  {
    id: "minor",
    title: "Minor Shirk",
    titleAr: "الشرك الأصغر",
    severity: "A grave sin, but does not by itself expel from Islam",
    description:
      "Words and deeds the texts label shirk which do not on their own take a person out of Islam — yet they are more serious than any major sin and are a doorway to major shirk. The two most-mentioned forms are showing off in worship (riya) and swearing by other than Allah.",
    hadith: [
      {
        ref: "Tirmidhi 20:13",
        text: "Ibn 'Umar heard a man saying: \"No by the Ka'bah\" so Ibn 'Umar said: \"Nothing is sworn by other than Allah, for I heard the Messenger of Allah (ﷺ) say: 'Whoever swears by other than Allah, he has committed disbelief or shirk'\"",
      },
    ],
    examples: [
      "Swearing an oath by the Prophet, one's honour, one's parents, or one's life — swear only by Allah",
      "Showing off (riya): performing an act of worship so that people will see and praise it",
      "Saying \"had it not been for Allah and you\" — say instead \"had it not been for Allah, then you\"",
    ],
  },
  {
    id: "hidden",
    title: "Hidden Shirk",
    titleAr: "الشرك الخفي",
    severity: "Subtle — it hides in the intention",
    description:
      "Shirk of the heart: performing outwardly correct worship for the sake of being seen, praised, or thanked rather than for Allah. The Prophet warned that this quiet showing off was the thing he feared most for his righteous followers, precisely because it is so easy to miss in oneself. It overlaps with minor shirk (riya) and, when a deed is done wholly for other than Allah, can become major.",
    examples: [
      "Praying longer or giving more generously only because others are watching",
      "Seeking reputation, status, or a good name through acts of worship",
      "Correcting the intention repeatedly, and asking Allah for sincerity (ikhlas), is the cure",
    ],
  },
];

/* ── Common practices today that fall under shirk or lead to it ── */
const modernShirkPractices: { title: string; text: string; ref: string }[] = [
  {
    title: "Amulets, charms & \"lucky\" objects",
    text:
      "Wearing a taweez, a blue eye-bead, a horseshoe, or a red thread believing it wards off harm or brings fortune. The Prophet warned that whoever \"practices magic, he has committed Shirk; and whoever hangs up something (as an amulet) will be entrusted to it.\" Zainab, the wife of Ibn Mas'ud, reported the Prophet saying that \"amulets and Tiwalah (charms) are polytheism.\"",
    ref: "Nasai 37:114; Ibn Majah 31:95",
  },
  {
    title: "Fortune-tellers, horoscopes & \"knowing\" the future",
    text:
      "Consulting a psychic, palm-reader, or star-sign column to learn the unseen. The Prophet said: \"He who visits a diviner ('Arraf) and asks him about anything, his prayers extending to forty nights will not be accepted.\" Believing such a person actually knows the future is graver still, for knowledge of the unseen belongs to Allah alone.",
    ref: "Muslim 39:173",
  },
  {
    title: "Swearing by other than Allah",
    text:
      "Everyday oaths \"by my life,\" \"by the Prophet,\" or \"by my mother's grave\" are a form of minor shirk. Reverence expressed through an oath is due to Allah alone; if you must swear, swear by Allah.",
    ref: "Tirmidhi 20:13",
  },
];

/* ── Tawassul: seeking nearness — what is allowed, what crosses into shirk ── */
const tawassulPermissible: string[] = [
  "By Allah's own names and attributes — e.g. \"O Most Merciful, have mercy on me\" (Quran 7:180)",
  "By a righteous deed you yourself have done — as the three men trapped by the rock each begged Allah by their sincerest deed until it rolled away (Bukhari 78:5)",
  "By asking a living, present, righteous person to make du'a for you — as the companions asked the Prophet",
];
const tawassulImpermissible: string[] = [
  "Calling upon the dead — a prophet or saint in his grave — to fulfil a need or remove harm",
  "Believing anyone must be an intermediary between you and Allah, when Allah says \"Call upon Me; I will respond to you\" (Quran 40:60)",
];

type Category = {
  id: string;
  title: string;
  titleAr: string;
  meaning: string;
  icon: typeof Shield;
  description: string;
  detailedExplanation: string;
  keyVerses: { ref: string; arabic?: string; text: string }[];
  hadith: { ref: string; text: string }[];
  points: string[];
  violations: { title: string; explanation: string }[];
  sources: string[];
};

function parseSources(sources: string[]): SourceRef[] {
  return sources.map((s) => {
    const idx = s.indexOf(" — ");
    return idx === -1 ? { ref: s, desc: "" } : { ref: s.slice(0, idx), desc: s.slice(idx + 3) };
  });
}

const categories: Category[] = [
  {
    id: "rububiyyah",
    title: "Tawhid ar-Rububiyyah",
    titleAr: "توحيد الربوبية",
    meaning: "Oneness of Lordship",
    icon: Shield,
    description:
      "The belief that Allah alone is the Creator, Sustainer, Provider, and Manager of all affairs in the universe. He gives life and causes death, and no one shares in His dominion or control.",
    detailedExplanation:
      "This category deals with Allah's actions — what He does. He alone creates, provides, gives life, causes death, controls the universe, and manages all affairs. Interestingly, even the pagan Arabs at the time of the Prophet (peace be upon him) accepted this category. They acknowledged that Allah was the Creator and Sustainer, yet this alone was not sufficient to make them Muslim. This shows that simply believing in a Creator is not enough — one must also direct all worship to Him alone (Tawhid al-Uluhiyyah).",
    keyVerses: [
      {
        ref: "Quran 39:62",
        arabic: "ٱللَّهُ خَـٰلِقُ كُلِّ شَىْءٍۢ ۖ وَهُوَ عَلَىٰ كُلِّ شَىْءٍۢ وَكِيلٌۭ",
        text: "Allah is the Creator of all things, and He is, over all things, Disposer of affairs.",
      },
      {
        ref: "Quran 35:3",
        arabic: "هَلْ مِنْ خَـٰلِقٍ غَيْرُ ٱللَّهِ يَرْزُقُكُم مِّنَ ٱلسَّمَآءِ وَٱلْأَرْضِ ۚ لَآ إِلَـٰهَ إِلَّا هُوَ ۖ فَأَنَّىٰ تُؤْفَكُونَ",
        text: "Is there any creator other than Allah who provides for you from the heaven and earth? There is no deity except Him, so how are you deluded?",
      },
      {
        ref: "Quran 10:31",
        arabic: "قُلْ مَن يَرْزُقُكُم مِّنَ ٱلسَّمَآءِ وَٱلْأَرْضِ أَمَّن يَمْلِكُ ٱلسَّمْعَ وَٱلْأَبْصَـٰرَ وَمَن يُخْرِجُ ٱلْحَىَّ مِنَ ٱلْمَيِّتِ وَيُخْرِجُ ٱلْمَيِّتَ مِنَ ٱلْحَىِّ وَمَن يُدَبِّرُ ٱلْأَمْرَ ۚ فَسَيَقُولُونَ ٱللَّهُ ۚ فَقُلْ أَفَلَا تَتَّقُونَ",
        text: "Say: Who provides for you from the heaven and the earth? Or who controls hearing and sight? And who brings the living out of the dead and brings the dead out of the living? And who arranges every matter? They will say: Allah. So say: Then will you not fear Him?",
      },
    ],
    hadith: [
      {
        ref: "Muslim 46:11",
        text: "Allah determined the measures of creation fifty thousand years before He created the heavens and the earth.",
      },
    ],
    points: [
      "Allah alone creates from nothing — no one else can create even a fly",
      "He sustains and provides for all creation, from the smallest ant to the largest whale",
      "He alone controls life, death, and destiny",
      "He has no partner, helper, or rival in His lordship",
      "Even the polytheists of Quraysh affirmed this, yet it did not make them Muslim",
      "Acknowledging a Creator without worshipping Him alone is insufficient",
    ],
    violations: [
      {
        title: "Believing the universe created itself",
        explanation:
          "Denying that Allah is the Creator and attributing creation to chance or nature contradicts this category.",
      },
      {
        title: "Attributing Allah's powers to others",
        explanation:
          "Believing that anyone besides Allah can truly control the universe, give life, cause death, or manage affairs independently.",
      },
    ],
    sources: [
      "Kitab at-Tawhid, Muhammad ibn Abd al-Wahhab — Chapter 1: The Virtue of Tawheed and What It Expiates of Sins",
      "Al-Qawa'id al-Muthla, Ibn Uthaymeen — Introduction on the categories of Tawheed",
      "Sharh al-Aqidah al-Wasitiyyah, Ibn Uthaymeen",
      "Tafsir Ibn Kathir — Commentary on Quran 39:62; Quran 35:3; Quran 10:31",
    ],
  },
  {
    id: "uluhiyyah",
    title: "Tawhid al-Uluhiyyah",
    titleAr: "توحيد الألوهية",
    meaning: "Oneness of Worship",
    icon: Heart,
    description:
      "The belief that Allah alone deserves all forms of worship — prayer, supplication, sacrifice, vows, fear, hope, love, reliance, and every act of devotion. This is the core message of every prophet and the essence of La ilaha illallah.",
    detailedExplanation:
      "This is the most important category and the one that most people fall into error regarding. It deals with our actions — what we do. While Tawhid ar-Rububiyyah is about recognizing Allah as Lord, Tawhid al-Uluhiyyah is about acting on that recognition by directing all worship to Him alone. This is the meaning of \"La ilaha illallah\" — there is no god worthy of worship except Allah. Every prophet was sent primarily to call people to this. The Arabs at the time of the Prophet (peace be upon him) believed in Allah as Creator, but they directed worship to idols as intermediaries. Islam came to correct this — no intermediaries, no partners, all worship to Allah directly.",
    keyVerses: [
      {
        ref: "Quran 21:25",
        arabic: "وَمَآ أَرْسَلْنَا مِن قَبْلِكَ مِن رَّسُولٍ إِلَّا نُوحِىٓ إِلَيْهِ أَنَّهُۥ لَآ إِلَـٰهَ إِلَّآ أَنَا۠ فَٱعْبُدُونِ",
        text: "We sent no messenger before you except that We revealed to him: There is no deity except Me, so worship Me.",
      },
      {
        ref: "Quran 1:5",
        arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        text: "You alone we worship, and You alone we ask for help.",
      },
      {
        ref: "Quran 6:162-163",
        arabic: "قُلْ إِنَّ صَلَاتِى وَنُسُكِى وَمَحْيَاىَ وَمَمَاتِى لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ ۝ لَا شَرِيكَ لَهُۥ",
        text: "Say: Indeed, my prayer, my rites of sacrifice, my living and my dying are for Allah, Lord of the worlds. No partner has He. And this I have been commanded, and I am the first of the Muslims.",
      },
      {
        ref: "Quran 72:18",
        arabic: "وَأَنَّ ٱلْمَسَـٰجِدَ لِلَّهِ فَلَا تَدْعُوا مَعَ ٱللَّهِ أَحَدًۭا",
        text: "The mosques are for Allah alone, so do not invoke anyone along with Allah.",
      },
      {
        ref: "Quran 2:165",
        arabic:
          "وَمِنَ ٱلنَّاسِ مَن يَتَّخِذُ مِن دُونِ ٱللَّهِ أَندَادًا يُحِبُّونَهُمْ كَحُبِّ ٱللَّهِ ۖ وَٱلَّذِينَ ءَامَنُوٓا۟ أَشَدُّ حُبًّا لِّلَّهِ ۗ وَلَوْ يَرَى ٱلَّذِينَ ظَلَمُوٓا۟ إِذْ يَرَوْنَ ٱلْعَذَابَ أَنَّ ٱلْقُوَّةَ لِلَّهِ جَمِيعًا وَأَنَّ ٱللَّهَ شَدِيدُ ٱلْعَذَابِ",
        text: "And among people, there are some who take others as equals to Allah: they love them as they should love Allah. But those who believe are stronger in their love for Allah. If only the wrongdoers could see the punishment, they would surely realize that all power belongs to Allah and that Allah is severe in punishment.",
      },
      {
        ref: "Quran 65:3",
        arabic:
          "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ ۚ إِنَّ ٱللَّهَ بَـٰلِغُ أَمْرِهِۦ ۚ قَدْ جَعَلَ ٱللَّهُ لِكُلِّ شَىْءٍ قَدْرًا",
        text: "and He will provide for him from where he does not expect. Whoever puts his trust in Allah, He is sufficient for him. Indeed, Allah will surely accomplish His purpose, for Allah has set a destiny for everything.",
      },
    ],
    hadith: [
      {
        ref: "Bukhari 56:72",
        text: "The right of Allah upon His servants is that they worship Him and do not associate anything with Him. And the right of the servants upon Allah is that He does not punish whoever does not associate anything with Him.",
      },
      {
        ref: "Muslim 1:1",
        text: "Whoever meets Allah without associating anything with Him will enter Paradise, and whoever meets Him associating something with Him will enter the Fire.",
      },
    ],
    points: [
      "This is the meaning of La ilaha illallah — no one deserves worship except Allah",
      "All acts of worship must be directed to Allah alone: prayer, dua, sacrifice, vowing, seeking help in matters only Allah can provide",
      "This was the primary call of every prophet from Adam to Muhammad (peace be upon them)",
      "The Quraysh believed in Allah as Creator but worshipped idols as intermediaries — Islam rejected this",
      "Worship is not only outward acts — the acts of the heart are its core: love, fear, hope, and reliance (tawakkul) must all rest in Allah alone",
      "Love: the believer loves Allah above all else; loving anything the way one should love Allah is a form of shirk (Quran 2:165)",
      "Fear and hope: one fears Allah's punishment and hopes in His mercy directly, not through any created being",
      "Reliance (tawakkul): the heart depends on Allah for every outcome — \"Whoever puts his trust in Allah, He is sufficient for him\" (Quran 65:3)",
      "Violating this category is shirk — the greatest sin",
    ],
    violations: [
      {
        title: "Directing any act of worship to other than Allah",
        explanation:
          "Praying to, prostrating before, or making sacrifice for anything other than Allah — whether a person, grave, idol, or saint.",
      },
      {
        title: "Making dua (supplication) to the dead",
        explanation:
          "Calling upon deceased people to fulfil needs or remove harm. Dua is worship, and worship is only for Allah.",
      },
      {
        title: "Using intermediaries in worship",
        explanation:
          "Believing one must go through a saint, imam, or holy person to reach Allah. Allah says: \"Call upon Me; I will respond to you.\" (Quran 40:60)",
      },
    ],
    sources: [
      "Kitab at-Tawhid, Muhammad ibn Abd al-Wahhab — Chapters on the meaning of La ilaha illallah, types of shirk, and intercession",
      "Al-Qawa'id al-Muthla, Ibn Uthaymeen — Section on Tawhid al-Uluhiyyah",
      "Majmu al-Fatawa, Ibn Taymiyyah — Vol. 1, on the distinction between Rububiyyah and Uluhiyyah",
      "Tafsir Ibn Kathir — Commentary on Quran 21:25; Quran 1:5; Quran 6:162-163; Quran 2:165; Quran 65:3 (on love and reliance as worship of the heart)",
    ],
  },
  {
    id: "asma-wa-sifat",
    title: "Tawhid al-Asma was-Sifat",
    titleAr: "توحيد الأسماء والصفات",
    meaning: "Oneness of Names & Attributes",
    icon: Star,
    description:
      "The belief that Allah has beautiful names and perfect attributes as described in the Quran and Sunnah. We affirm them as they are, without distorting their meaning, denying them, asking how they are, or likening them to creation.",
    detailedExplanation:
      "This category deals with who Allah is — His names and attributes. Allah has described Himself with certain names and attributes in the Quran, and the Prophet (peace be upon him) has described Him in the Sunnah. Our approach is to affirm them as they come, in a manner that befits His majesty, without falling into two extremes: (1) denying or distorting their meanings (ta'til), or (2) likening them to human attributes (tashbih). For example, Allah says He has a Hand, He hears, He sees, He is above His Throne. We affirm all of these in a way that befits Him — His Hand is not like our hands, His hearing is not like our hearing. The principle is summarized in Quran 42:11: \"There is nothing like unto Him, and He is the All-Hearing, the All-Seeing.\"",
    keyVerses: [
      {
        ref: "Quran 42:11",
        arabic: "لَيْسَ كَمِثْلِهِۦ شَىْءٌۭ ۖ وَهُوَ ٱلسَّمِيعُ ٱلْبَصِيرُ",
        text: "There is nothing like unto Him, and He is the All-Hearing, the All-Seeing.",
      },
      {
        ref: "Quran 7:180",
        arabic: "وَلِلَّهِ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ فَٱدْعُوهُ بِهَا",
        text: "And to Allah belong the most beautiful names, so invoke Him by them.",
      },
      {
        ref: "Quran 59:24",
        arabic: "هُوَ ٱللَّهُ ٱلْخَـٰلِقُ ٱلْبَارِئُ ٱلْمُصَوِّرُ ۖ لَهُ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ ۚ يُسَبِّحُ لَهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ ۖ وَهُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ",
        text: "He is Allah, the Creator, the Originator, the Fashioner. To Him belong the most beautiful names. Whatever is in the heavens and earth is exalting Him. And He is the Exalted in Might, the Wise.",
      },
      {
        ref: "Quran 20:5",
        arabic: "ٱلرَّحْمَـٰنُ عَلَى ٱلْعَرْشِ ٱسْتَوَىٰ",
        text: "The Most Merciful rose over the Throne (in a manner that befits His majesty).",
      },
    ],
    hadith: [
      {
        ref: "Bukhari 97:21",
        text: "Allah has ninety-nine names — one hundred minus one. Whoever enumerates them (learns, understands, and acts upon them) will enter Paradise.",
      },
    ],
    points: [
      "Allah's names and attributes are unique to Him — nothing in creation resembles them",
      "We affirm what Allah and His Messenger affirmed, without distortion (tahrif)",
      "We do not deny any attribute (ta'til) or ask about their nature (takyif)",
      "We do not liken Allah's attributes to creation (tashbih/tamthil)",
      "The 99 names (Al-Asma al-Husna) each reflect an aspect of His perfection",
      "The golden rule: Quran 42:11 — affirm without likening, negate without denying",
    ],
    violations: [
      {
        title: "Denying Allah's attributes",
        explanation:
          "Saying Allah does not truly hear, see, or have a Hand — stripping away what He has affirmed for Himself.",
      },
      {
        title: "Likening Allah to creation",
        explanation:
          "Saying Allah's Hand is like a human hand, or His hearing is like ours. His attributes are real but uniquely His.",
      },
      {
        title: "Giving Allah's unique attributes to creation",
        explanation:
          "Attributing knowledge of the unseen, absolute power, or other divine attributes to any created being.",
      },
    ],
    sources: [
      "Al-Qawa'id al-Muthla fi Sifat Allahi wa Asma'ihi al-Husna, Ibn Uthaymeen — The foundational text for this category's methodology",
      "Kitab at-Tawhid, Muhammad ibn Abd al-Wahhab — Chapters on names and attributes",
      "Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah — Detailed creed on Allah's names and attributes",
      "Tafsir Ibn Kathir — Commentary on Quran 42:11; Quran 7:180; Quran 59:24",
    ],
  },
];

const namesOfAllah = namesOfAllahData;

const sections = [
  { key: "intro", label: "What is Tawheed?" },
  { key: "importance", label: "Why It Matters" },
  { key: "categories", label: "Three Categories" },
  { key: "shirk", label: "Shirk" },
  { key: "names", label: "99 Names of Allah" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── components ───────────────────────── */

// Jump-index ranges (1–20, 21–40, ...) over the canonical order
const NAME_RANGES: { label: string; start: number }[] = (() => {
  const ranges: { label: string; start: number }[] = [];
  for (let i = 0; i < namesOfAllah.length; i += 20) {
    ranges.push({ label: `${i + 1}–${Math.min(i + 20, namesOfAllah.length)}`, start: i });
  }
  return ranges;
})();

function NamesGrid({ search, initialNameKey }: { search: string; initialNameKey: string | null }) {
  // Selection is keyed by the name itself (unique + stable), not a filtered-array index
  const [selectedName, setSelectedName] = useState<string | null>(initialNameKey);
  const detailRef = useRef<HTMLDivElement>(null);
  const gridItemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hasScrolledToInitial = useRef(false);

  const selectedIndex = selectedName !== null ? namesOfAllah.findIndex((n) => n.name === selectedName) : -1;
  const selected = selectedIndex >= 0 ? namesOfAllah[selectedIndex] : null;

  const filteredNames = namesOfAllah
    .map((name, i) => ({ ...name, originalIndex: i }))
    .filter((name) => textMatch(search, name.name, name.meaning, name.explanation));
  const searching = search.trim().length >= 2;

  // Auto-scroll to the initial name from URL param
  useEffect(() => {
    if (initialNameKey !== null && !hasScrolledToInitial.current) {
      hasScrolledToInitial.current = true;
      const idx = namesOfAllah.findIndex((n) => n.name === initialNameKey);
      if (idx < 0) return;
      setTimeout(() => {
        gridItemRefs.current.get(idx)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [initialNameKey]);

  const selectName = useCallback((key: string | null) => {
    setSelectedName(key);
    if (key !== null) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 60);
    }
  }, []);

  const jumpTo = useCallback((start: number) => {
    gridItemRefs.current.get(start)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Prev/next moves within the currently visible (filtered) list
  const filteredPos = selectedName !== null ? filteredNames.findIndex((n) => n.name === selectedName) : -1;
  const prevName = filteredPos >= 0 ? filteredNames[(filteredPos - 1 + filteredNames.length) % filteredNames.length] : null;
  const nextName = filteredPos >= 0 ? filteredNames[(filteredPos + 1) % filteredNames.length] : null;

  return (
    <div className="mt-4">
      {/* Jump index */}
      {!searching && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {NAME_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => jumpTo(r.start)}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-themed-muted hover:text-gold border sidebar-border card-bg transition-colors"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filteredNames.length === 0 && search.length >= 2 && (
        <p className="text-center text-themed-muted text-sm py-8">No names match your search.</p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        {filteredNames.map((name) => (
          <Fragment key={name.name}>
            <div
              ref={(el) => { if (el) gridItemRefs.current.set(name.originalIndex, el); }}
              className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(16.666%-10px)] scroll-mt-24"
            >
              <div
                className={`card-bg rounded-xl border p-5 md:p-6 cursor-pointer transition-colors duration-200 ${
                  selectedName === name.name
                    ? "border-gold/50 bg-gold/5"
                    : "sidebar-border card-hover"
                }`}
                onClick={() => selectName(selectedName === name.name ? null : name.name)}
              >
                <div className="text-center py-3">
                  <p className="text-3xl font-arabic text-gold mb-2">{name.nameAr}</p>
                  <p className="text-themed font-medium text-base">{name.name}</p>
                  <p className="text-themed-muted text-sm mt-1">{name.meaning}</p>
                  <p className="text-[10px] text-themed-muted/30 mt-2">{name.originalIndex + 1}</p>
                </div>
              </div>
            </div>

            {/* Inline detail — expands in place, right after the tapped card */}
            {selected && selectedName === name.name && (
              <motion.div
                ref={detailRef}
                key={`detail-${name.name}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="w-full"
              >
                <div className="card-bg rounded-xl border border-gold/30 p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center shrink-0">
                        <p className="text-4xl font-arabic text-gold">{selected.nameAr}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-themed">{selected.name}</h3>
                        <p className="text-gold text-sm">{selected.meaning}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      <BookmarkButton
                        type="name"
                        id={`name-${selectedIndex + 1}`}
                        title={selected.name}
                        subtitle={selected.nameAr}
                        href={`/tawhid?tab=names&name=${selectedIndex}`}
                      />
                      <button
                        onClick={() => selectName(null)}
                        className="text-themed-muted hover:text-themed transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <p className="text-themed-muted text-sm leading-relaxed mt-4">
                    {selected.explanation}
                  </p>

                  {selected.verse && (
                    <div
                      className="rounded-lg p-4 mt-4"
                      style={{ backgroundColor: "var(--color-bg)" }}
                    >
                      <p className="text-base font-arabic text-gold leading-loose mb-2 text-right">
                        {selected.verse.arabic}
                      </p>
                      <p className="text-themed text-sm italic">
                        &ldquo;{selected.verse.text}&rdquo;
                      </p>
                      <p className="text-xs text-themed-muted mt-2">
                        <HadithRefText text={selected.verse.ref} />
                      </p>
                    </div>
                  )}

                  {/* Prev / Next (hidden when a filter leaves a single match —
                      both would self-reference the open name) */}
                  {filteredNames.length > 1 && prevName && nextName && (
                    <div className="flex justify-between mt-4 pt-3 border-t sidebar-border">
                      <button
                        onClick={() => selectName(prevName.name)}
                        className="text-xs text-themed-muted hover:text-gold transition-colors"
                      >
                        &larr; {prevName.name}
                      </button>
                      <span className="text-[10px] text-themed-muted/40">{selectedIndex + 1} / {namesOfAllah.length}</span>
                      <button
                        onClick={() => selectName(nextName.name)}
                        className="text-xs text-themed-muted hover:text-gold transition-colors"
                      >
                        {nextName.name} &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  return (
    <ContentCard delay={index * 0.1}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-themed">{cat.title}</h2>
          <span className="text-lg font-arabic text-gold">{cat.titleAr}</span>
        </div>
        <p className="text-sm text-gold/80 font-medium mt-0.5">{cat.meaning}</p>
      </div>

      {/* Description */}
      <p className="text-themed-muted text-sm leading-relaxed mb-4">
        {cat.description}
      </p>

      {/* Detailed explanation */}
      <div className="mb-4 p-4 rounded-lg border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
        <h4 className="text-sm font-semibold text-themed mb-2 flex items-center gap-2">
          <BookOpen size={14} className="text-gold" /> Understanding in Depth
        </h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          {cat.detailedExplanation}
        </p>
      </div>

      {/* Key points */}
      <ul className="space-y-2 mb-4">
        {cat.points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm text-themed">
            <span className="text-gold mt-0.5">&#9670;</span>
            {point}
          </li>
        ))}
      </ul>

      {/* All verses */}
      <div className="space-y-3 mb-4">
        {cat.keyVerses.map((verse) => (
          <div
            key={verse.ref}
            className="rounded-lg p-4"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            {verse.arabic && (
              <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                {verse.arabic}
              </p>
            )}
            <p className="text-themed text-sm italic">
              &ldquo;{verse.text}&rdquo;
            </p>
            <p className="text-xs text-themed-muted mt-2"><HadithRefText text={verse.ref} /></p>
          </div>
        ))}
      </div>

      {/* Hadith */}
      {cat.hadith.length > 0 && (
        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-semibold text-themed">From the Sunnah</h4>
          {cat.hadith.map((h) => (
            <div
              key={h.ref}
              className="rounded-lg p-4 border-l-2 border-gold/30"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              <p className="text-themed text-sm italic">
                &ldquo;{h.text}&rdquo;
              </p>
              <p className="text-xs text-themed-muted mt-2"><HadithRefText text={h.ref} /></p>
            </div>
          ))}
        </div>
      )}

      {/* Violations */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-themed flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400" />
          What Violates This Category
        </h4>
        {cat.violations.map((v) => (
          <div
            key={v.title}
            className="rounded-lg p-4 border border-red-500/10"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <p className="text-themed text-sm font-medium mb-1">{v.title}</p>
            <p className="text-themed-muted text-sm">{v.explanation}</p>
          </div>
        ))}
      </div>

    </ContentCard>
  );
}

/* ───────────────────────── page ───────────────────────── */

function TawhidContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useScrollToSection();
  // ?name= accepts the legacy numeric index (stable — canonical order is fixed) or a name string
  const nameParam = searchParams.get("name");
  let initialNameKey: string | null = null;
  if (nameParam !== null) {
    const n = Number(nameParam);
    if (Number.isInteger(n) && n >= 0 && n < namesOfAllah.length) {
      initialNameKey = namesOfAllah[n].name;
    } else {
      const match = namesOfAllah.find((x) => x.name.toLowerCase() === nameParam.toLowerCase());
      if (match) initialNameKey = match.name;
    }
  }
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "intro");
  // Deep-link support: ?sub=<category id> (old ?section= accepted as a mount-time alias)
  const subParam = searchParams.get("sub") ?? searchParams.get("section");
  const [activeCategory, setActiveCategory] = useState(
    subParam && categories.some((c) => c.id === subParam) ? subParam : "rububiyyah"
  );
  const [search, setSearch] = useState("");

  // auto-select the first visible category when the active one is filtered out
  useEffect(() => {
    const visible = categories.filter((cat) => textMatch(search, cat.title, cat.meaning, cat.description, ...cat.points));
    if (visible.length && !visible.some((c) => c.id === activeCategory)) setActiveCategory(visible[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Keep ?tab= / ?sub= in sync so the current view is shareable
  const syncUrl = (tab: SectionKey, sub?: string) => {
    router.replace(sub ? `${pathname}?tab=${tab}&sub=${sub}` : `${pathname}?tab=${tab}`, { scroll: false });
  };

  return (
    <div>
      <PageHeader
        title="Tawheed"
        titleAr="التوحيد"
        subtitle="The foundation of Islam — understanding the Oneness of Allah in all aspects"
      />

      <VerseHero
        arabic="قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ"
        text="Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent."
        reference="Surah Al-Ikhlas 112:1-4"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search names, categories, concepts..." className="mb-6" />

      {/* Section navigation (shared TabBar) */}
      <TabBar
        tabs={sections.map((s) => ({ key: s.key, label: s.label }))}
        activeTab={activeSection}
        onTabChange={(k) => {
          setActiveSection(k as SectionKey);
          syncUrl(k as SectionKey);
        }}
        className="mb-6"
      />

      <AnimatePresence mode="wait">
        {/* ─── What is Tawheed ─── */}
        {activeSection === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Definition */}
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">What is Tawheed?</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">Tawheed</span> (توحيد) comes from the Arabic root <span className="font-arabic text-gold">وَحَّدَ</span> meaning &ldquo;to make one&rdquo; or &ldquo;to unify.&rdquo; In Islamic theology, it means to single out Allah alone in everything that is specific to Him — in His lordship, in worship, and in His names and attributes.
                </p>
                <p>
                  It is not simply believing that God exists. Many people throughout history believed in a creator or higher power. Tawheed goes further — it is the complete, undivided devotion to Allah alone in belief, worship, and understanding of who He is.
                </p>
                <p>
                  Tawheed is the single most important concept in Islam. It is the first thing a person declares when entering Islam (<span className="text-themed font-medium">La ilaha illallah</span> — there is no god worthy of worship except Allah), and it should be the last thing on a person&apos;s tongue before death.
                </p>
                <p>
                  Saying the words is only the beginning: scholars derived <Link href="/pillars?tab=pillars&sub=shahada" className="text-gold hover:underline">seven conditions of the shahada</Link> — such as knowledge, certainty, and sincerity — that give the testimony its meaning and make it truly benefit the one who says it.
                </p>
                <p>
                  The Prophet (peace be upon him) said: <span className="text-themed italic">&ldquo;Whoever&apos;s last words are La ilaha illallah will enter Paradise.&rdquo;</span> <span className="text-xs text-gold/60">(Abu Dawud 21:28, graded Sahih)</span>
                </p>
              </div>
            </ContentCard>

            {/* The virtue of La ilaha illallah */}
            <ContentCard delay={0.15}>
              <h2 className="text-xl font-semibold text-themed mb-4">The Virtue of La ilaha illallah</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  No words are weightier on the Day of Judgement than a sincere testimony of Allah&apos;s oneness. The Prophet (peace be upon him) described a man whose record of sin filled ninety-nine scrolls, each as far as the eye can see — yet one small card outweighed them all:
                </p>
                <div className="rounded-lg p-4 border-l-2 border-gold/30" style={{ backgroundColor: "var(--color-bg)" }}>
                  <p className="text-themed text-sm italic">
                    &ldquo;Then He will bring out a card (Bitaqah); on it will be: &lsquo;I testify to La Ilaha Illallah, and I testify that Muhammad is His servant and Messenger.&rsquo; … The scrolls will be put on a pan (of the scale), and the card on (the other) pan: the scrolls will be light, and the card will be heavy, nothing is heavier than the Name of Allah.&rdquo;
                  </p>
                  <p className="text-xs text-themed-muted mt-2"><HadithRefText text="Tirmidhi 40:34" />; <HadithRefText text="Ibn Majah 37:201" /></p>
                </div>
                <p>
                  And its reward is offered every single day. The Prophet (peace be upon him) said:
                </p>
                <div className="rounded-lg p-4 border-l-2 border-gold/30" style={{ backgroundColor: "var(--color-bg)" }}>
                  <p className="text-themed text-sm italic">
                    &ldquo;Whoever says: &lsquo;There is none worthy of worship except Allah, Alone, without partner, to Him belongs all that exists and to Him belongs the praise, He gives life and causes death, and He is Powerful over all things&rsquo; … a hundred times in a day, it will be for him the equivalent of freeing ten slaves, and there shall be written for him a hundred good deeds, and a hundred bad deeds shall be wiped out for him, and it will be a protection for him from Shaitan on that day, until he reaches the evening.&rdquo;
                  </p>
                  <p className="text-xs text-themed-muted mt-2"><HadithRefText text="Tirmidhi 48:99" />; <HadithRefText text="Ibn Majah 33:142" /></p>
                </div>
              </div>
            </ContentCard>

            {/* The opposite of Tawheed */}
            <ContentCard delay={0.2}>
              <h2 className="text-xl font-semibold text-themed mb-4">The Opposite: Shirk</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  The opposite of Tawheed is <span className="text-themed font-medium">Shirk</span> (شرك) — associating partners with Allah in any aspect that is uniquely His. Shirk is the greatest sin in Islam and the only sin that Allah has said He will not forgive if a person dies upon it without repenting.
                </p>
                <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg)" }}>
                  <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                    إِنَّ ٱللَّهَ لَا يَغْفِرُ أَن يُشْرَكَ بِهِۦ وَيَغْفِرُ مَا دُونَ ذَٰلِكَ لِمَن يَشَآءُ
                  </p>
                  <p className="text-themed text-sm italic text-center">
                    &ldquo;Indeed, Allah does not forgive association with Him, but He forgives what is less than that for whom He wills.&rdquo;
                  </p>
                  <p className="text-xs text-themed-muted mt-2 text-center">Quran 4:48</p>
                </div>
                <p>
                  However, shirk can be repented from during one&apos;s lifetime. Allah&apos;s mercy encompasses everything, and He accepts the repentance of those who sincerely turn back to Him. Many of the greatest companions of the Prophet (peace be upon him) were once polytheists who accepted Tawheed.
                </p>
                <button
                  onClick={() => { setActiveSection("shirk"); syncUrl("shirk"); }}
                  className="text-gold text-sm font-medium hover:underline"
                >
                  What counts as shirk today? See the Shirk tab &rarr;
                </button>
              </div>
            </ContentCard>

            {/* Three categories overview */}
            <ContentCard delay={0.3}>
              <h2 className="text-xl font-semibold text-themed mb-4">The Three Categories</h2>
              <p className="text-themed-muted text-sm leading-relaxed mb-4">
                Scholars have organized Tawheed into three interconnected categories based on the Quran and Sunnah. Each one complements the others — a person&apos;s Tawheed is incomplete without all three:
              </p>
              <div className="space-y-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setActiveSection("categories");
                        syncUrl("categories", cat.id);
                      }}
                      className="w-full text-left rounded-lg p-4 border sidebar-border hover:border-gold/30 transition-colors"
                      style={{ backgroundColor: "var(--color-bg)" }}
                    >
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-semibold text-themed text-sm">{cat.title}</h3>
                          <span className="text-xs font-arabic text-gold/70">{cat.titleAr}</span>
                        </div>
                        <p className="text-xs text-themed-muted mt-0.5">{cat.meaning}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ContentCard>

            {/* Teaching Tawhid to a child — the Prophet's advice to Ibn Abbas */}
            <ContentCard delay={0.32}>
              <h2 className="text-xl font-semibold text-themed mb-4">Teaching Tawhid to a Child</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  The most quoted lesson in tawhid was taught by the Prophet (peace be upon him) to a young Ibn Abbas, riding behind him — a text every parent and teacher can pass on:
                </p>
                <div className="rounded-lg p-4 border-l-2 border-gold/30" style={{ backgroundColor: "var(--color-bg)" }}>
                  <p className="text-themed text-sm italic">
                    &ldquo;O boy! I will teach you a statement: Be mindful of Allah and He will protect you. Be mindful of Allah and you will find Him before you. When you ask, ask Allah, and when you seek aid, seek Allah&apos;s aid…&rdquo;
                  </p>
                  <p className="text-xs text-themed-muted mt-2"><HadithRefText text="Tirmidhi 37:102" /></p>
                </div>
                <p>
                  He went on to teach that if the whole of creation gathered to benefit the boy, they could not benefit him with anything Allah had not already written for him; and were they to gather to harm him, they could not — for &ldquo;The pens are lifted and the pages are dried.&rdquo; The lesson roots a child&apos;s hope, fear, and asking in Allah alone. See also the Prophet&apos;s way of teaching on <Link href="/prophet-muhammad?tab=character" className="text-gold hover:underline">his character</Link>.
                </p>
              </div>
            </ContentCard>

            {/* Sources for intro */}
            <SourcesCard delay={0.35} sources={[
              { ref: "Kitab at-Tawhid, Muhammad ibn Abd al-Wahhab", desc: "Chapter 1: On the virtue and necessity of Tawheed" },
              { ref: "Sharh Kitab at-Tawhid, Shaykh Ibn Uthaymeen", desc: "Explanation of the opening chapters" },
              { ref: "Al-Qawa'id al-Muthla, Ibn Uthaymeen", desc: "Introduction defining Tawheed and its categories" },
              { ref: "Tafsir Ibn Kathir", desc: "Commentary on Surah Al-Ikhlas (112:1-4) and Quran 4:48" },
              { ref: "Abu Dawud 21:28", desc: "Hadith on the virtue of La ilaha illallah as last words" },
              { ref: "Tirmidhi 40:34", desc: "The card (bitaqah) that outweighs ninety-nine scrolls of sins" },
              { ref: "Ibn Majah 37:201", desc: "Parallel narration of the bitaqah on the Scale" },
              { ref: "Tirmidhi 48:99", desc: "Saying La ilaha illallah 100x — the reward of freeing ten slaves" },
              { ref: "Ibn Majah 33:142", desc: "Parallel narration of the daily hundredfold tahleel" },
              { ref: "Tirmidhi 37:102", desc: "The Prophet's advice to Ibn Abbas: Be mindful of Allah" },
            ]} />
          </motion.div>
        )}

        {/* ─── Why It Matters ─── */}
        {activeSection === "importance" && (
          <motion.div
            key="importance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {whyItMatters.filter((item) => textMatch(search, item.point, item.detail, item.reference)).map((item, i) => (
              <ContentCard key={i} delay={0.05 + i * 0.05}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold font-semibold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-themed mb-1">{item.point}</h3>
                    <p className="text-themed-muted text-sm leading-relaxed">{item.detail}</p>
                    <p className="text-xs text-gold/60 mt-2"><HadithRefText text={item.reference} /></p>
                  </div>
                </div>
              </ContentCard>
            ))}

            <SourcesCard delay={0.35} sources={[
              { ref: "Kitab at-Tawhid, Muhammad ibn Abd al-Wahhab", desc: "Chapters on the purpose of creation and the danger of shirk" },
              { ref: "Muslim 1:178", desc: "Hadith on the condition for entering Paradise" },
              { ref: "Bukhari 56:72", desc: "Hadith of Mu'adh ibn Jabal on the right of Allah" },
              { ref: "Tafsir Ibn Kathir", desc: "Commentary on Quran 51:56; Quran 21:25; Quran 4:48" },
            ]} />
          </motion.div>
        )}

        {/* ─── Three Categories ─── */}
        {activeSection === "categories" && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Category subtabs */}
            <div className="flex justify-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
              {categories.filter((cat) => textMatch(search, cat.title, cat.meaning, cat.description, ...cat.points)).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      syncUrl("categories", cat.id);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeCategory === cat.id
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    {cat.meaning}
                  </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {categories.filter((cat) => textMatch(search, cat.title, cat.meaning, cat.description, ...cat.points)).map(
                (cat, i) =>
                  activeCategory === cat.id && (
                    <motion.div
                      key={cat.id}
                      id={`section-${cat.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <CategoryCard cat={cat} index={0} />

                      {/* Sources */}
                      {cat.sources.length > 0 && (
                        <div className="mt-4">
                          <SourcesCard delay={0.15} sources={parseSources(cat.sources)} />
                        </div>
                      )}
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── Shirk ─── */}
        {activeSection === "shirk" && (
          <motion.div
            key="shirk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Framing */}
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">What Counts as Shirk?</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">Shirk</span> (شرك) is the opposite of Tawheed: giving to someone or something other than Allah what belongs to Allah alone. Because it is named the one sin never forgiven if a person dies upon it (Quran 4:48), it is worth knowing exactly what it looks like — not as an abstraction, but in the choices and habits of everyday life. Scholars describe it in three degrees.
                </p>
              </div>
            </ContentCard>

            {/* The three degrees */}
            {shirkTypes.map((st, i) => (
              <ContentCard key={st.id} delay={0.15 + i * 0.05}>
                <div className="mb-3">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-themed">{st.title}</h3>
                    <span className="text-base font-arabic text-gold">{st.titleAr}</span>
                  </div>
                  <p className="text-xs text-gold/80 font-medium mt-1">{st.severity}</p>
                </div>
                <p className="text-themed-muted text-sm leading-relaxed mb-4">{st.description}</p>

                {st.verses?.map((v) => (
                  <div key={v.ref} className="rounded-lg p-4 mb-4" style={{ backgroundColor: "var(--color-bg)" }}>
                    {v.arabic && (
                      <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">{v.arabic}</p>
                    )}
                    <p className="text-themed text-sm italic">&ldquo;{v.text}&rdquo;</p>
                    <p className="text-xs text-themed-muted mt-2"><HadithRefText text={v.ref} /></p>
                  </div>
                ))}

                {st.hadith?.map((h) => (
                  <div key={h.ref} className="rounded-lg p-4 mb-4 border-l-2 border-gold/30" style={{ backgroundColor: "var(--color-bg)" }}>
                    <p className="text-themed text-sm italic">&ldquo;{h.text}&rdquo;</p>
                    <p className="text-xs text-themed-muted mt-2"><HadithRefText text={h.ref} /></p>
                  </div>
                ))}

                <ul className="space-y-2">
                  {st.examples.map((ex) => (
                    <li key={ex} className="flex items-start gap-2 text-sm text-themed-muted">
                      <span className="text-gold mt-0.5">&#9670;</span>
                      {ex}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            ))}

            {/* Common practices today */}
            <ContentCard delay={0.35}>
              <h3 className="text-lg font-semibold text-themed mb-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                Common Practices Today
              </h3>
              <p className="text-themed-muted text-sm leading-relaxed mb-4">
                Much of what people treat as harmless custom is, in the texts, shirk or a doorway to it — the questions parents most often face about charms, horoscopes, and casual oaths:
              </p>
              <div className="space-y-3">
                {modernShirkPractices.map((p) => (
                  <div key={p.title} className="rounded-lg p-4 border border-red-500/10" style={{ backgroundColor: "var(--color-bg)" }}>
                    <p className="text-themed text-sm font-medium mb-1">{p.title}</p>
                    <p className="text-themed-muted text-sm leading-relaxed">{p.text}</p>
                    <p className="text-xs text-themed-muted mt-2"><HadithRefText text={p.ref} /></p>
                  </div>
                ))}
              </div>
            </ContentCard>

            {/* Tawassul */}
            <ContentCard delay={0.4}>
              <h3 className="text-lg font-semibold text-themed mb-2">Seeking Nearness (Tawassul): Permissible vs. Shirk</h3>
              <p className="text-themed-muted text-sm leading-relaxed mb-4">
                Islam forbids taking intermediaries in worship, but it does not forbid every way of seeking to draw near to Allah. The distinction is crucial — and often blurred:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg p-4 border border-gold/20" style={{ backgroundColor: "var(--color-bg)" }}>
                  <p className="text-sm font-semibold text-themed mb-2">Permissible tawassul</p>
                  <ul className="space-y-2">
                    {tawassulPermissible.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-themed-muted">
                        <span className="text-gold mt-0.5">&#9670;</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg p-4 border border-red-500/10" style={{ backgroundColor: "var(--color-bg)" }}>
                  <p className="text-sm font-semibold text-themed mb-2 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" /> Crosses into shirk
                  </p>
                  <ul className="space-y-2">
                    {tawassulImpermissible.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-themed-muted">
                        <span className="text-red-400/70 mt-0.5">&#9670;</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-themed-muted text-xs leading-relaxed mt-3">
                The permissible forms are established in the Sunnah — Bukhari 78:5 (the three men and the rock) and Quran 7:180. Where a practice sits close to the line, the rulings are detailed; consult a knowledgeable scholar rather than judging by feeling.
              </p>
            </ContentCard>

            {/* Hope / repentance */}
            <ContentCard delay={0.45}>
              <h3 className="text-lg font-semibold text-themed mb-2">The Door of Repentance Is Open</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Naming these dangers is not meant to crush hope. Shirk — even the major kind — is forgiven the moment a person sincerely turns back to Allah in this life; the companions themselves were once idol-worshippers. What is unforgivable is only dying upon it without repentance. Learn it, leave it, and ask Allah for a heart devoted to Him alone.
              </p>
            </ContentCard>

            <SourcesCard delay={0.5} sources={[
              { ref: "Kitab at-Tawhid, Muhammad ibn Abd al-Wahhab", desc: "Chapters on the types of shirk, amulets, diviners, and oaths" },
              { ref: "Nasai 37:114", desc: "Tying and blowing on knots, and hanging amulets, is magic and shirk" },
              { ref: "Ibn Majah 31:95", desc: "Ibn Mas'ud: amulets, incantations and charms are shirk" },
              { ref: "Muslim 39:173", desc: "Visiting a diviner: prayers not accepted for forty nights" },
              { ref: "Tirmidhi 20:13", desc: "Swearing by other than Allah is disbelief or shirk" },
              { ref: "Bukhari 78:5", desc: "The three men and the rock — tawassul by one's righteous deeds" },
              { ref: "Musnad Ahmad (Mahmud ibn Labid)", desc: "Minor shirk / riya — graded sahih by al-Albani (Musnad Ahmad 23630); not in this app's local collection" },
              { ref: "Al-Qawa'id al-Muthla, Ibn Uthaymeen; Majmu al-Fatawa, Ibn Taymiyyah", desc: "On the categories of shirk and permissible vs. forbidden tawassul" },
            ]} />
          </motion.div>
        )}

        {/* ─── 99 Names ─── */}
        {activeSection === "names" && (
          <motion.div
            key="names"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ContentCard>
              <div className="text-center py-4 mb-4">
                <p className="text-lg font-arabic text-gold leading-loose mb-3">
                  وَلِلَّهِ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ فَٱدْعُوهُ بِهَا
                </p>
                <p className="text-themed-muted italic">
                  &ldquo;And to Allah belong the most beautiful names, so invoke Him by them.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 7:180</p>
              </div>

              <div className="rounded-lg p-4 mb-2 text-center" style={{ backgroundColor: "var(--color-bg)" }}>
                <p className="text-themed-muted text-sm leading-relaxed">
                  The Prophet (peace be upon him) said: <span className="text-themed italic">&ldquo;Allah has ninety-nine names — one hundred minus one. Whoever enumerates them (learns them, understands their meanings, and acts upon them) will enter Paradise.&rdquo;</span>
                </p>
                <p className="text-xs text-gold/60 mt-2">Bukhari 97:21</p>
              </div>
            </ContentCard>

            <ContentCard delay={0.08} className="mt-4">
              <h3 className="text-base font-semibold text-themed mb-3">What does &ldquo;enumerating&rdquo; them mean?</h3>
              <p className="text-themed-muted text-sm leading-relaxed mb-3">
                Scholars explain that to enumerate (ihsa) the names is more than counting them. It has three levels, each deeper than the last:
              </p>
              <ul className="space-y-2 mb-4">
                {[
                  "Memorise them — hold the ninety-nine on the tongue and in memory.",
                  "Understand their meanings — know what each name says about Allah, so it shapes how you see Him.",
                  "Act upon them — call on Allah by the name that fits your need (\"O Provider, provide for me\"; \"O Forgiver, forgive me\"), and let each name mould your character: knowing He is the All-Seeing breeds watchfulness, knowing He is the Most Merciful breeds hope.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-themed">
                    <span className="text-gold mt-0.5">&#9670;</span>
                    <span className="text-themed-muted">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-lg p-4 border-l-2 border-gold/30" style={{ backgroundColor: "var(--color-bg)" }}>
                <p className="text-themed-muted text-sm leading-relaxed">
                  A note on the list itself: the hadith fixes the <span className="text-themed">count</span> at ninety-nine, but it does not itself list the names. The familiar enumerated list is a later scholarly compilation (most famously the one narrated by Tirmidhi), and scholars differ slightly on which names it contains. What is agreed upon is the count and the promise attached to truly living by them.
                </p>
              </div>
            </ContentCard>

            <NamesGrid search={search} initialNameKey={initialNameKey} />

            <SourcesCard className="mt-8" sources={[
              { ref: "Quran 7:180", desc: "And to Allah belong the most beautiful names, so invoke Him by them" },
              { ref: "Bukhari 97:21", desc: "Allah has ninety-nine names; whoever enumerates them will enter Paradise" },
            ]} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TawhidPage() {
  return <Suspense><TawhidContent /></Suspense>;
}
