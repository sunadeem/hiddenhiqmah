"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import {
  Shield,
  Heart,
  Star,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

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
    reference: "Sahih Muslim 26",
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
    reference: "Sahih al-Bukhari 2856",
  },
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
        ref: "Sahih Muslim 2653",
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
      "Tafsir Ibn Kathir — Commentary on Quran 39:62, 35:3, 10:31",
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
    ],
    hadith: [
      {
        ref: "Sahih al-Bukhari 2856",
        text: "The right of Allah upon His servants is that they worship Him and do not associate anything with Him. And the right of the servants upon Allah is that He does not punish whoever does not associate anything with Him.",
      },
      {
        ref: "Sahih Muslim 93",
        text: "Whoever meets Allah without associating anything with Him will enter Paradise, and whoever meets Him associating something with Him will enter the Fire.",
      },
    ],
    points: [
      "This is the meaning of La ilaha illallah — no one deserves worship except Allah",
      "All acts of worship must be directed to Allah alone: prayer, dua, sacrifice, vowing, seeking help in matters only Allah can provide",
      "This was the primary call of every prophet from Adam to Muhammad (peace be upon them)",
      "The Quraysh believed in Allah as Creator but worshipped idols as intermediaries — Islam rejected this",
      "Love, fear, and hope in worship must be directed to Allah alone",
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
      "Tafsir Ibn Kathir — Commentary on Quran 21:25, 1:5, 6:162-163",
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
        ref: "Sahih al-Bukhari 7392",
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
      "Tafsir Ibn Kathir — Commentary on Quran 42:11, 7:180, 59:24",
    ],
  },
];

const namesOfAllah = [
  { name: "Allah", nameAr: "الله", meaning: "The Greatest Name" },
  { name: "Ar-Rahman", nameAr: "الرحمن", meaning: "The Most Gracious" },
  { name: "Ar-Raheem", nameAr: "الرحيم", meaning: "The Most Merciful" },
  { name: "Al-Malik", nameAr: "الملك", meaning: "The King" },
  { name: "Al-Quddus", nameAr: "القدوس", meaning: "The Most Holy" },
  { name: "As-Salam", nameAr: "السلام", meaning: "The Source of Peace" },
  { name: "Al-Mu'min", nameAr: "المؤمن", meaning: "The Granter of Security" },
  { name: "Al-Muhaymin", nameAr: "المهيمن", meaning: "The Guardian" },
  { name: "Al-Aziz", nameAr: "العزيز", meaning: "The Almighty" },
  { name: "Al-Jabbar", nameAr: "الجبار", meaning: "The Compeller" },
  { name: "Al-Mutakabbir", nameAr: "المتكبر", meaning: "The Supreme" },
  { name: "Al-Khaliq", nameAr: "الخالق", meaning: "The Creator" },
  { name: "Al-Bari", nameAr: "البارئ", meaning: "The Originator" },
  { name: "Al-Musawwir", nameAr: "المصور", meaning: "The Fashioner" },
  { name: "Al-Ghaffar", nameAr: "الغفار", meaning: "The Ever-Forgiving" },
  { name: "Al-Qahhar", nameAr: "القهار", meaning: "The Subduer" },
  { name: "Al-Wahhab", nameAr: "الوهاب", meaning: "The Bestower" },
  { name: "Ar-Razzaq", nameAr: "الرزاق", meaning: "The Provider" },
  { name: "Al-Fattah", nameAr: "الفتاح", meaning: "The Opener" },
  { name: "Al-Aleem", nameAr: "العليم", meaning: "The All-Knowing" },
  { name: "Al-Qabid", nameAr: "القابض", meaning: "The Withholder" },
  { name: "Al-Basit", nameAr: "الباسط", meaning: "The Extender" },
  { name: "Al-Khafid", nameAr: "الخافض", meaning: "The Humbler" },
  { name: "Ar-Rafi", nameAr: "الرافع", meaning: "The Exalter" },
  { name: "Al-Mu'izz", nameAr: "المعز", meaning: "The Honourer" },
  { name: "Al-Mudhill", nameAr: "المذل", meaning: "The Humiliator" },
  { name: "As-Sami", nameAr: "السميع", meaning: "The All-Hearing" },
  { name: "Al-Basir", nameAr: "البصير", meaning: "The All-Seeing" },
  { name: "Al-Hakam", nameAr: "الحكم", meaning: "The Judge" },
  { name: "Al-Adl", nameAr: "العدل", meaning: "The Just" },
  { name: "Al-Latif", nameAr: "اللطيف", meaning: "The Subtle" },
  { name: "Al-Khabir", nameAr: "الخبير", meaning: "The All-Aware" },
  { name: "Al-Halim", nameAr: "الحليم", meaning: "The Forbearing" },
  { name: "Al-Azim", nameAr: "العظيم", meaning: "The Magnificent" },
  { name: "Al-Ghafur", nameAr: "الغفور", meaning: "The All-Forgiving" },
  { name: "Ash-Shakur", nameAr: "الشكور", meaning: "The Appreciative" },
  { name: "Al-Aliyy", nameAr: "العلي", meaning: "The Most High" },
  { name: "Al-Kabir", nameAr: "الكبير", meaning: "The Greatest" },
  { name: "Al-Hafiz", nameAr: "الحفيظ", meaning: "The Preserver" },
  { name: "Al-Muqit", nameAr: "المقيت", meaning: "The Sustainer" },
  { name: "Al-Hasib", nameAr: "الحسيب", meaning: "The Reckoner" },
  { name: "Al-Jalil", nameAr: "الجليل", meaning: "The Majestic" },
  { name: "Al-Karim", nameAr: "الكريم", meaning: "The Generous" },
  { name: "Ar-Raqib", nameAr: "الرقيب", meaning: "The Watchful" },
  { name: "Al-Mujib", nameAr: "المجيب", meaning: "The Responsive" },
  { name: "Al-Wasi", nameAr: "الواسع", meaning: "The All-Encompassing" },
  { name: "Al-Hakim", nameAr: "الحكيم", meaning: "The All-Wise" },
  { name: "Al-Wadud", nameAr: "الودود", meaning: "The Most Loving" },
  { name: "Al-Majid", nameAr: "المجيد", meaning: "The Glorious" },
  { name: "Al-Ba'ith", nameAr: "الباعث", meaning: "The Resurrector" },
  { name: "Ash-Shahid", nameAr: "الشهيد", meaning: "The Witness" },
  { name: "Al-Haqq", nameAr: "الحق", meaning: "The Truth" },
  { name: "Al-Wakil", nameAr: "الوكيل", meaning: "The Trustee" },
  { name: "Al-Qawiyy", nameAr: "القوي", meaning: "The Most Strong" },
  { name: "Al-Matin", nameAr: "المتين", meaning: "The Firm" },
  { name: "Al-Waliyy", nameAr: "الولي", meaning: "The Protecting Friend" },
  { name: "Al-Hamid", nameAr: "الحميد", meaning: "The Praiseworthy" },
  { name: "Al-Muhsi", nameAr: "المحصي", meaning: "The Accounter" },
  { name: "Al-Mubdi", nameAr: "المبدئ", meaning: "The Originator" },
  { name: "Al-Mu'id", nameAr: "المعيد", meaning: "The Restorer" },
  { name: "Al-Muhyi", nameAr: "المحيي", meaning: "The Giver of Life" },
  { name: "Al-Mumit", nameAr: "المميت", meaning: "The Bringer of Death" },
  { name: "Al-Hayy", nameAr: "الحي", meaning: "The Ever-Living" },
  { name: "Al-Qayyum", nameAr: "القيوم", meaning: "The Self-Sustaining" },
  { name: "Al-Wajid", nameAr: "الواجد", meaning: "The Finder" },
  { name: "Al-Majid", nameAr: "الماجد", meaning: "The Noble" },
  { name: "Al-Wahid", nameAr: "الواحد", meaning: "The One" },
  { name: "As-Samad", nameAr: "الصمد", meaning: "The Eternal Refuge" },
  { name: "Al-Qadir", nameAr: "القادر", meaning: "The Able" },
  { name: "Al-Muqtadir", nameAr: "المقتدر", meaning: "The Powerful" },
  { name: "Al-Muqaddim", nameAr: "المقدم", meaning: "The Expediter" },
  { name: "Al-Mu'akhkhir", nameAr: "المؤخر", meaning: "The Delayer" },
  { name: "Al-Awwal", nameAr: "الأول", meaning: "The First" },
  { name: "Al-Akhir", nameAr: "الآخر", meaning: "The Last" },
  { name: "Az-Zahir", nameAr: "الظاهر", meaning: "The Manifest" },
  { name: "Al-Batin", nameAr: "الباطن", meaning: "The Hidden" },
  { name: "Al-Wali", nameAr: "الوالي", meaning: "The Governing Lord" },
  { name: "Al-Muta'ali", nameAr: "المتعالي", meaning: "The Most Exalted" },
  { name: "Al-Barr", nameAr: "البر", meaning: "The Source of Goodness" },
  { name: "At-Tawwab", nameAr: "التواب", meaning: "The Ever-Accepting of Repentance" },
  { name: "Al-Muntaqim", nameAr: "المنتقم", meaning: "The Avenger" },
  { name: "Al-Afuww", nameAr: "العفو", meaning: "The Pardoner" },
  { name: "Ar-Ra'uf", nameAr: "الرؤوف", meaning: "The Most Kind" },
  { name: "Malik al-Mulk", nameAr: "مالك الملك", meaning: "Owner of Sovereignty" },
  { name: "Dhul-Jalali wal-Ikram", nameAr: "ذو الجلال والإكرام", meaning: "Lord of Majesty and Generosity" },
  { name: "Al-Muqsit", nameAr: "المقسط", meaning: "The Equitable" },
  { name: "Al-Jami", nameAr: "الجامع", meaning: "The Gatherer" },
  { name: "Al-Ghaniyy", nameAr: "الغني", meaning: "The Self-Sufficient" },
  { name: "Al-Mughni", nameAr: "المغني", meaning: "The Enricher" },
  { name: "Al-Mani", nameAr: "المانع", meaning: "The Withholder" },
  { name: "Ad-Darr", nameAr: "الضار", meaning: "The Distresser" },
  { name: "An-Nafi", nameAr: "النافع", meaning: "The Propitious" },
  { name: "An-Nur", nameAr: "النور", meaning: "The Light" },
  { name: "Al-Hadi", nameAr: "الهادي", meaning: "The Guide" },
  { name: "Al-Badi", nameAr: "البديع", meaning: "The Incomparable" },
  { name: "Al-Baqi", nameAr: "الباقي", meaning: "The Everlasting" },
  { name: "Al-Warith", nameAr: "الوارث", meaning: "The Inheritor" },
  { name: "Ar-Rashid", nameAr: "الرشيد", meaning: "The Guide to the Right Path" },
  { name: "As-Sabur", nameAr: "الصبور", meaning: "The Patient" },
];

const sections = [
  { key: "intro", label: "What is Tawheed?" },
  { key: "importance", label: "Why It Matters" },
  { key: "categories", label: "Three Categories" },
  { key: "names", label: "99 Names of Allah" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── components ───────────────────────── */

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
            <p className="text-xs text-themed-muted mt-2">{verse.ref}</p>
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
              <p className="text-xs text-themed-muted mt-2">{h.ref}</p>
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

export default function TawhidPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("intro");
  const [activeCategory, setActiveCategory] = useState("rububiyyah");

  return (
    <div>
      <PageHeader
        title="Tawheed"
        titleAr="التوحيد"
        subtitle="The foundation of Islam — understanding the Oneness of Allah in all aspects"
      />

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
            {/* Hero verse */}
            <ContentCard>
              <div className="text-center py-6">
                <p className="text-3xl md:text-4xl font-arabic text-gold leading-loose mb-4">
                  قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ
                </p>
                <p className="text-themed-muted italic mb-2">
                  &ldquo;Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.&rdquo;
                </p>
                <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Surah Al-Ikhlas 112:1-4
                </span>
              </div>
            </ContentCard>

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
                  The Prophet (peace be upon him) said: <span className="text-themed italic">&ldquo;Whoever&apos;s last words are La ilaha illallah will enter Paradise.&rdquo;</span> <span className="text-xs text-gold/60">(Abu Dawud 3116, graded Sahih)</span>
                </p>
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
                      onClick={() => setActiveSection("categories")}
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

            {/* Sources for intro */}
            <ContentCard delay={0.35}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Kitab at-Tawhid, Muhammad ibn Abd al-Wahhab — Chapter 1: On the virtue and necessity of Tawheed",
                  "Sharh Kitab at-Tawhid, Shaykh Ibn Uthaymeen — Explanation of the opening chapters",
                  "Al-Qawa'id al-Muthla, Ibn Uthaymeen — Introduction defining Tawheed and its categories",
                  "Tafsir Ibn Kathir — Commentary on Surah Al-Ikhlas (112:1-4) and Quran 4:48",
                  "Sunan Abu Dawud 3116 — Hadith on the virtue of La ilaha illallah as last words",
                ].map((source) => (
                  <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    {source}
                  </li>
                ))}
              </ul>
            </ContentCard>
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
            <ContentCard>
              <div className="text-center py-4">
                <p className="text-lg font-arabic text-gold leading-loose mb-3">
                  وَمَا خَلَقْتُ ٱلْجِنَّ وَٱلْإِنسَ إِلَّا لِيَعْبُدُونِ
                </p>
                <p className="text-themed-muted italic">
                  &ldquo;I did not create the jinn and mankind except to worship Me.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 51:56</p>
              </div>
            </ContentCard>

            {whyItMatters.map((item, i) => (
              <ContentCard key={i} delay={0.05 + i * 0.05}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold font-semibold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-themed mb-1">{item.point}</h3>
                    <p className="text-themed-muted text-sm leading-relaxed">{item.detail}</p>
                    <p className="text-xs text-gold/60 mt-2">{item.reference}</p>
                  </div>
                </div>
              </ContentCard>
            ))}

            <ContentCard delay={0.35}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Kitab at-Tawhid, Muhammad ibn Abd al-Wahhab — Chapters on the purpose of creation and the danger of shirk",
                  "Sahih Muslim 26 — Hadith on the condition for entering Paradise",
                  "Sahih al-Bukhari 2856 — Hadith of Mu'adh ibn Jabal on the right of Allah",
                  "Tafsir Ibn Kathir — Commentary on Quran 51:56, 21:25, 4:48",
                ].map((source) => (
                  <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    {source}
                  </li>
                ))}
              </ul>
            </ContentCard>
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
              {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
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
              {categories.map(
                (cat, i) =>
                  activeCategory === cat.id && (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <CategoryCard cat={cat} index={0} />

                      {/* Sources */}
                      {cat.sources.length > 0 && (
                        <div className="mt-4">
                          <ContentCard delay={0.15}>
                            <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                              <BookOpen size={14} className="text-gold" />
                              Sources &amp; References
                            </h4>
                            <ul className="space-y-1.5">
                              {cat.sources.map((source) => (
                                <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                                  <span className="text-gold/40 mt-0.5">&#8226;</span>
                                  {source}
                                </li>
                              ))}
                            </ul>
                          </ContentCard>
                        </div>
                      )}
                    </motion.div>
                  )
              )}
            </AnimatePresence>
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
                <p className="text-xs text-gold/60 mt-2">Sahih al-Bukhari 7392</p>
              </div>
            </ContentCard>

            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {namesOfAllah.map((name, i) => (
                <div key={name.name + i} className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(16.666%-10px)]">
                  <ContentCard delay={Math.min(i * 0.02, 0.4)}>
                    <div className="text-center py-3">
                      <p className="text-3xl font-arabic text-gold mb-2">{name.nameAr}</p>
                      <p className="text-themed font-medium text-base">{name.name}</p>
                      <p className="text-themed-muted text-sm mt-1">{name.meaning}</p>
                      <p className="text-[10px] text-themed-muted/30 mt-2">{i + 1}</p>
                    </div>
                  </ContentCard>
                </div>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
