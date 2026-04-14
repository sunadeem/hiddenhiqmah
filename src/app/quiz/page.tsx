"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import chapters from "@/data/quran/chapters.json";
import namesOfAllah from "@/data/names-of-allah";
import {
  Trophy,
  RotateCcw,
  ChevronRight,
  Check,
  X,
  Star,
  Zap,
  Award,
  ChevronDown,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type Difficulty = "easy" | "medium" | "hard";
type Category = "quran" | "prophets" | "names" | "pillars" | "worship" | "seerah" | "afterlife" | "general";

type Question = {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answer: number; // index into options
  explanation: string;
  source?: string;
};

type QuizResult = {
  category: Category;
  difficulty: Difficulty;
  score: number;
  total: number;
  date: number;
};

/* ═══════════════════════════════════════════════════════════════════
   STORAGE
   ═══════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "hiqmah-quiz-results";

function getResults(): QuizResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveResult(result: QuizResult) {
  if (typeof window === "undefined") return;
  try {
    const results = getResults();
    results.unshift(result);
    // Keep last 100 results
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results.slice(0, 100)));
  } catch {
    // storage full
  }
}

/* ═══════════════════════════════════════════════════════════════════
   QUESTION BANK — STATIC QUESTIONS
   ═══════════════════════════════════════════════════════════════════ */

const staticQuestions: Question[] = [
  // ─── QURAN ───
  {
    id: "q-quran-1",
    category: "quran",
    difficulty: "easy",
    question: "How many surahs are in the Quran?",
    options: ["110", "112", "114", "120"],
    answer: 2,
    explanation: "The Quran contains 114 surahs (chapters).",
  },
  {
    id: "q-quran-2",
    category: "quran",
    difficulty: "easy",
    question: "What is the first surah of the Quran?",
    options: ["Al-Baqarah", "Al-Fatihah", "Al-Ikhlas", "An-Nas"],
    answer: 1,
    explanation: "Al-Fatihah (The Opener) is the first surah, recited in every unit of prayer.",
  },
  {
    id: "q-quran-3",
    category: "quran",
    difficulty: "easy",
    question: "Which surah is known as 'The Heart of the Quran'?",
    options: ["Al-Kahf", "Ya-Sin", "Ar-Rahman", "Al-Mulk"],
    answer: 1,
    explanation: "Ya-Sin is referred to as the Heart of the Quran in a hadith narrated by Imam Ahmad.",
  },
  {
    id: "q-quran-4",
    category: "quran",
    difficulty: "medium",
    question: "Which is the longest surah in the Quran?",
    options: ["Al-Imran", "An-Nisa", "Al-Baqarah", "Al-Ma'idah"],
    answer: 2,
    explanation: "Al-Baqarah (The Cow) is the longest surah with 286 verses.",
  },
  {
    id: "q-quran-5",
    category: "quran",
    difficulty: "medium",
    question: "In which city was the majority of the Quran revealed?",
    options: ["Madinah", "Makkah", "Jerusalem", "Ta'if"],
    answer: 1,
    explanation: "86 of the 114 surahs were revealed in Makkah, with 28 in Madinah.",
  },
  {
    id: "q-quran-6",
    category: "quran",
    difficulty: "medium",
    question: "What does 'Surah Al-Ikhlas' mean?",
    options: ["The Light", "The Sincerity", "The Mercy", "The Opening"],
    answer: 1,
    explanation: "Al-Ikhlas means 'The Sincerity' or 'The Purity of Faith'. It declares the oneness of Allah.",
  },
  {
    id: "q-quran-7",
    category: "quran",
    difficulty: "hard",
    question: "How many times is the word 'Allah' mentioned in the Quran?",
    options: ["Over 1,000", "Over 2,000", "Over 2,500", "Over 3,000"],
    answer: 2,
    explanation: "The word 'Allah' appears approximately 2,699 times in the Quran.",
  },
  {
    id: "q-quran-8",
    category: "quran",
    difficulty: "hard",
    question: "Which surah does not begin with 'Bismillah ir-Rahman ir-Rahim'?",
    options: ["Al-Anfal", "At-Tawbah", "Al-Kahf", "Al-Mulk"],
    answer: 1,
    explanation: "Surah At-Tawbah (Chapter 9) is the only surah that does not begin with the Bismillah.",
  },
  {
    id: "q-quran-9",
    category: "quran",
    difficulty: "hard",
    question: "Which surah is equivalent to one-third of the Quran in reward?",
    options: ["Al-Fatihah", "Al-Mulk", "Al-Ikhlas", "Ya-Sin"],
    answer: 2,
    explanation: "The Prophet ﷺ said that Surah Al-Ikhlas is equivalent to one-third of the Quran (Sahih al-Bukhari 5015).",
    source: "Sahih al-Bukhari 5015",
  },
  {
    id: "q-quran-10",
    category: "quran",
    difficulty: "easy",
    question: "Where was the Quran first revealed?",
    options: ["Masjid al-Haram", "Cave of Hira", "Masjid an-Nabawi", "Mount Sinai"],
    answer: 1,
    explanation: "The first verses of the Quran were revealed to Prophet Muhammad ﷺ in the Cave of Hira during the month of Ramadan.",
  },

  // ─── PROPHETS ───
  {
    id: "q-prophet-1",
    category: "prophets",
    difficulty: "easy",
    question: "Who is the first prophet in Islam?",
    options: ["Nuh", "Ibrahim", "Adam", "Muhammad ﷺ"],
    answer: 2,
    explanation: "Adam (peace be upon him) is the first prophet and the first human created by Allah.",
  },
  {
    id: "q-prophet-2",
    category: "prophets",
    difficulty: "easy",
    question: "Who is the final prophet in Islam?",
    options: ["Isa", "Musa", "Ibrahim", "Muhammad ﷺ"],
    answer: 3,
    explanation: "Prophet Muhammad ﷺ is the Seal of the Prophets (Khatam an-Nabiyyin), the last messenger sent by Allah.",
    source: "Quran 33:40",
  },
  {
    id: "q-prophet-3",
    category: "prophets",
    difficulty: "easy",
    question: "Which prophet built the Ark?",
    options: ["Hud", "Salih", "Nuh", "Lut"],
    answer: 2,
    explanation: "Prophet Nuh (Noah) built the Ark on Allah's command to save the believers from the great flood.",
  },
  {
    id: "q-prophet-4",
    category: "prophets",
    difficulty: "medium",
    question: "Which prophet is mentioned most in the Quran?",
    options: ["Muhammad ﷺ", "Ibrahim", "Musa", "Isa"],
    answer: 2,
    explanation: "Prophet Musa (Moses) is mentioned by name approximately 136 times in the Quran, more than any other prophet.",
  },
  {
    id: "q-prophet-5",
    category: "prophets",
    difficulty: "medium",
    question: "Which prophet was thrown into a fire but was unharmed?",
    options: ["Musa", "Isa", "Ibrahim", "Yusuf"],
    answer: 2,
    explanation: "Prophet Ibrahim was thrown into a fire by his people, but Allah commanded the fire to be cool and peaceful for him (Quran 21:68-69).",
    source: "Quran 21:68-69",
  },
  {
    id: "q-prophet-6",
    category: "prophets",
    difficulty: "medium",
    question: "Which prophet was swallowed by a whale?",
    options: ["Ayyub", "Yunus", "Ilyas", "Dhul-Kifl"],
    answer: 1,
    explanation: "Prophet Yunus (Jonah) was swallowed by a great fish after leaving his people without Allah's permission (Quran 21:87).",
    source: "Quran 21:87",
  },
  {
    id: "q-prophet-7",
    category: "prophets",
    difficulty: "hard",
    question: "How many prophets are mentioned by name in the Quran?",
    options: ["20", "25", "30", "33"],
    answer: 1,
    explanation: "25 prophets are mentioned by name in the Quran, though many more were sent (Quran 40:78).",
    source: "Quran 40:78",
  },
  {
    id: "q-prophet-8",
    category: "prophets",
    difficulty: "hard",
    question: "Which prophet is known as 'Khalilullah' (Friend of Allah)?",
    options: ["Musa", "Isa", "Ibrahim", "Muhammad ﷺ"],
    answer: 2,
    explanation: "Prophet Ibrahim is known as Khalilullah — the intimate friend of Allah (Quran 4:125).",
    source: "Quran 4:125",
  },
  {
    id: "q-prophet-9",
    category: "prophets",
    difficulty: "hard",
    question: "Which prophet was given the Zabur (Psalms)?",
    options: ["Musa", "Isa", "Dawud", "Sulayman"],
    answer: 2,
    explanation: "Prophet Dawud (David) was given the Zabur (Psalms) as mentioned in the Quran (Quran 4:163).",
    source: "Quran 4:163",
  },
  {
    id: "q-prophet-10",
    category: "prophets",
    difficulty: "easy",
    question: "Which prophet is also known as 'Kalimullah' (One who spoke to Allah)?",
    options: ["Ibrahim", "Adam", "Musa", "Nuh"],
    answer: 2,
    explanation: "Prophet Musa (Moses) is known as Kalimullah because Allah spoke to him directly (Quran 4:164).",
    source: "Quran 4:164",
  },

  // ─── NAMES OF ALLAH ───
  {
    id: "q-names-1",
    category: "names",
    difficulty: "easy",
    question: "What does 'Ar-Rahman' mean?",
    options: ["The Most Merciful", "The Most Gracious", "The All-Knowing", "The Protector"],
    answer: 1,
    explanation: "Ar-Rahman means 'The Most Gracious' — the One whose mercy encompasses all of creation.",
  },
  {
    id: "q-names-2",
    category: "names",
    difficulty: "easy",
    question: "How many names of Allah are commonly known?",
    options: ["66", "77", "88", "99"],
    answer: 3,
    explanation: "99 names of Allah are commonly known, based on the hadith: 'Allah has ninety-nine names. Whoever memorizes them will enter Paradise.' (Sahih al-Bukhari 7392)",
    source: "Sahih al-Bukhari 7392",
  },
  {
    id: "q-names-3",
    category: "names",
    difficulty: "medium",
    question: "What does 'Al-Malik' mean?",
    options: ["The Creator", "The King/Sovereign", "The Judge", "The Provider"],
    answer: 1,
    explanation: "Al-Malik means 'The King' or 'The Sovereign' — the absolute ruler and owner of all creation.",
  },
  {
    id: "q-names-4",
    category: "names",
    difficulty: "medium",
    question: "What does 'Al-Ghaffar' mean?",
    options: ["The Sustainer", "The Avenger", "The Repeatedly Forgiving", "The Compeller"],
    answer: 2,
    explanation: "Al-Ghaffar means 'The Repeatedly Forgiving' — the One who forgives sins again and again.",
  },
  {
    id: "q-names-5",
    category: "names",
    difficulty: "hard",
    question: "What does 'Al-Wadud' mean?",
    options: ["The Witness", "The Loving", "The Wise", "The Patient"],
    answer: 1,
    explanation: "Al-Wadud means 'The Loving' — the One whose love for His servants is expressed through His mercy and blessings.",
  },
  {
    id: "q-names-6",
    category: "names",
    difficulty: "hard",
    question: "What does 'As-Samad' mean?",
    options: ["The First", "The Last", "The Eternal Refuge", "The Hidden"],
    answer: 2,
    explanation: "As-Samad means 'The Eternal Refuge' — the One upon whom all creation depends, yet He depends on nothing (Quran 112:2).",
    source: "Quran 112:2",
  },
  {
    id: "q-names-7",
    category: "names",
    difficulty: "easy",
    question: "What does 'Al-Khaliq' mean?",
    options: ["The Provider", "The Creator", "The Healer", "The Guide"],
    answer: 1,
    explanation: "Al-Khaliq means 'The Creator' — the One who brings everything into existence from nothing.",
  },

  // ─── PILLARS ───
  {
    id: "q-pillar-1",
    category: "pillars",
    difficulty: "easy",
    question: "How many pillars of Islam are there?",
    options: ["3", "4", "5", "6"],
    answer: 2,
    explanation: "There are 5 pillars of Islam: Shahada, Salah, Zakat, Sawm, and Hajj.",
  },
  {
    id: "q-pillar-2",
    category: "pillars",
    difficulty: "easy",
    question: "How many daily prayers (Salah) are obligatory?",
    options: ["3", "4", "5", "7"],
    answer: 2,
    explanation: "Muslims pray 5 obligatory prayers daily: Fajr, Dhuhr, Asr, Maghrib, and Isha.",
  },
  {
    id: "q-pillar-3",
    category: "pillars",
    difficulty: "easy",
    question: "During which month do Muslims fast?",
    options: ["Shawwal", "Rajab", "Ramadan", "Dhul Hijjah"],
    answer: 2,
    explanation: "Muslims fast during the month of Ramadan, the 9th month of the Islamic calendar.",
  },
  {
    id: "q-pillar-4",
    category: "pillars",
    difficulty: "medium",
    question: "What percentage of wealth is given as Zakat?",
    options: ["1%", "2.5%", "5%", "10%"],
    answer: 1,
    explanation: "Zakat is 2.5% of accumulated wealth above the nisab (minimum threshold) given annually.",
  },
  {
    id: "q-pillar-5",
    category: "pillars",
    difficulty: "medium",
    question: "What is the Shahada?",
    options: [
      "The pilgrimage to Makkah",
      "The testimony of faith",
      "The giving of charity",
      "The fasting in Ramadan",
    ],
    answer: 1,
    explanation: "The Shahada is the testimony of faith: 'There is no god but Allah, and Muhammad is the Messenger of Allah.'",
  },
  {
    id: "q-pillar-6",
    category: "pillars",
    difficulty: "medium",
    question: "Where is Hajj performed?",
    options: ["Madinah", "Jerusalem", "Makkah", "Cairo"],
    answer: 2,
    explanation: "Hajj is performed in Makkah and its surrounding areas, including Mina, Arafat, and Muzdalifah.",
  },
  {
    id: "q-pillar-7",
    category: "pillars",
    difficulty: "hard",
    question: "How many articles of faith (Iman) are there in Islam?",
    options: ["4", "5", "6", "7"],
    answer: 2,
    explanation: "There are 6 articles of faith: belief in Allah, His Angels, His Books, His Messengers, the Last Day, and Divine Decree (Qadr).",
  },
  {
    id: "q-pillar-8",
    category: "pillars",
    difficulty: "hard",
    question: "Which pillar of Islam is obligatory only once in a lifetime (if able)?",
    options: ["Salah", "Zakat", "Sawm", "Hajj"],
    answer: 3,
    explanation: "Hajj is obligatory once in a lifetime for those who are physically and financially able.",
  },

  // ─── GENERAL ───
  {
    id: "q-gen-1",
    category: "general",
    difficulty: "easy",
    question: "What is the holy book of Islam?",
    options: ["Torah", "Bible", "Quran", "Zabur"],
    answer: 2,
    explanation: "The Quran is the holy book of Islam, revealed to Prophet Muhammad ﷺ over 23 years.",
  },
  {
    id: "q-gen-2",
    category: "general",
    difficulty: "easy",
    question: "What direction do Muslims face when praying?",
    options: ["East", "Towards the Ka'bah", "North", "Towards Jerusalem"],
    answer: 1,
    explanation: "Muslims face the Ka'bah in Makkah (the Qibla) when performing prayer.",
  },
  {
    id: "q-gen-3",
    category: "general",
    difficulty: "easy",
    question: "What does 'Islam' mean?",
    options: ["Peace", "Submission to God", "Love", "Faith"],
    answer: 1,
    explanation: "Islam means 'submission to the will of God'. It comes from the Arabic root 's-l-m' which also relates to peace (salam).",
  },
  {
    id: "q-gen-4",
    category: "general",
    difficulty: "medium",
    question: "What is the Night Journey (Isra and Mi'raj)?",
    options: [
      "The migration to Madinah",
      "The night the Quran was first revealed",
      "The Prophet's ﷺ journey to Jerusalem and ascension to the heavens",
      "The conquest of Makkah",
    ],
    answer: 2,
    explanation: "The Isra and Mi'raj was the miraculous night journey of Prophet Muhammad ﷺ from Makkah to Jerusalem, and then his ascension through the heavens (Quran 17:1).",
    source: "Quran 17:1",
  },
  {
    id: "q-gen-5",
    category: "general",
    difficulty: "medium",
    question: "What event does the Islamic calendar begin from?",
    options: [
      "The birth of Prophet Muhammad ﷺ",
      "The revelation of the Quran",
      "The Hijra (migration to Madinah)",
      "The conquest of Makkah",
    ],
    answer: 2,
    explanation: "The Islamic (Hijri) calendar begins from the Hijra — the migration of Prophet Muhammad ﷺ and his companions from Makkah to Madinah in 622 CE.",
  },
  {
    id: "q-gen-6",
    category: "general",
    difficulty: "medium",
    question: "What is Jannah?",
    options: ["The Day of Judgement", "Paradise", "The Bridge over Hell", "The Gathering"],
    answer: 1,
    explanation: "Jannah is the Islamic concept of Paradise — the eternal abode of bliss promised to the righteous.",
  },
  {
    id: "q-gen-7",
    category: "general",
    difficulty: "hard",
    question: "What is the Sunnah?",
    options: [
      "The Quran's commentary",
      "The practices and sayings of Prophet Muhammad ﷺ",
      "The Islamic legal code",
      "The five daily prayers",
    ],
    answer: 1,
    explanation: "The Sunnah refers to the practices, sayings, and approvals of Prophet Muhammad ﷺ, serving as the second source of Islamic guidance after the Quran.",
  },
  {
    id: "q-gen-8",
    category: "general",
    difficulty: "hard",
    question: "What is the significance of Laylat al-Qadr?",
    options: [
      "The night of the Prophet's ﷺ birth",
      "The night the Quran was first revealed",
      "The night of the Hijra",
      "The night before Eid",
    ],
    answer: 1,
    explanation: "Laylat al-Qadr (the Night of Decree) is the night the Quran was first revealed. It is better than a thousand months (Quran 97:3).",
    source: "Quran 97:1-5",
  },
  {
    id: "q-gen-9",
    category: "general",
    difficulty: "hard",
    question: "What are the four revealed books mentioned in the Quran?",
    options: [
      "Quran, Torah, Zabur, Injil",
      "Quran, Torah, Bible, Suhuf",
      "Quran, Zabur, Injil, Suhuf",
      "Quran, Torah, Zabur, Scrolls of Abraham",
    ],
    answer: 0,
    explanation: "The four major revealed books mentioned in the Quran are: the Torah (given to Musa), the Zabur/Psalms (given to Dawud), the Injil/Gospel (given to Isa), and the Quran (given to Muhammad ﷺ).",
  },
  {
    id: "q-gen-10",
    category: "general",
    difficulty: "easy",
    question: "What greeting do Muslims use?",
    options: ["Shalom", "Namaste", "Assalamu Alaikum", "Marhaba"],
    answer: 2,
    explanation: "Muslims greet each other with 'Assalamu Alaikum' meaning 'Peace be upon you'.",
  },

  // ─── WORSHIP & PRACTICE ───
  {
    id: "q-worship-1",
    category: "worship",
    difficulty: "easy",
    question: "What must a Muslim do before praying?",
    options: ["Eat a meal", "Perform Wudu (ablution)", "Read a book", "Sleep"],
    answer: 1,
    explanation: "Wudu (ablution) is a ritual washing that must be performed before prayer to achieve a state of purity.",
  },
  {
    id: "q-worship-2",
    category: "worship",
    difficulty: "easy",
    question: "How many units (rak'ahs) are in Fajr prayer?",
    options: ["2", "3", "4", "1"],
    answer: 0,
    explanation: "Fajr (dawn) prayer consists of 2 obligatory rak'ahs.",
  },
  {
    id: "q-worship-3",
    category: "worship",
    difficulty: "easy",
    question: "What phrase do Muslims say before eating?",
    options: ["Alhamdulillah", "SubhanAllah", "Bismillah", "Allahu Akbar"],
    answer: 2,
    explanation: "'Bismillah' (In the name of Allah) is said before eating, and 'Alhamdulillah' (Praise be to Allah) is said after.",
  },
  {
    id: "q-worship-4",
    category: "worship",
    difficulty: "medium",
    question: "What breaks a Muslim's Wudu (ablution)?",
    options: ["Eating food", "Sleeping deeply", "Drinking water", "Talking"],
    answer: 1,
    explanation: "Deep sleep breaks Wudu because one loses awareness. Other things that break Wudu include using the restroom and passing gas.",
  },
  {
    id: "q-worship-5",
    category: "worship",
    difficulty: "medium",
    question: "What is the Sujud in prayer?",
    options: ["Standing upright", "Bowing at the waist", "Prostrating with forehead on the ground", "Sitting between prostrations"],
    answer: 2,
    explanation: "Sujud (prostration) is placing the forehead, nose, hands, knees, and toes on the ground. The Prophet ﷺ said a servant is closest to Allah during Sujud.",
    source: "Sahih Muslim 482",
  },
  {
    id: "q-worship-6",
    category: "worship",
    difficulty: "medium",
    question: "What is Dhikr?",
    options: ["A type of fasting", "Remembrance of Allah through phrases and supplications", "A charity donation", "A pilgrimage ritual"],
    answer: 1,
    explanation: "Dhikr means remembrance of Allah — repeating phrases like SubhanAllah, Alhamdulillah, and Allahu Akbar.",
  },
  {
    id: "q-worship-7",
    category: "worship",
    difficulty: "medium",
    question: "How many rak'ahs are in the Dhuhr prayer?",
    options: ["2", "3", "4", "5"],
    answer: 2,
    explanation: "Dhuhr (noon) prayer consists of 4 obligatory rak'ahs.",
  },
  {
    id: "q-worship-8",
    category: "worship",
    difficulty: "hard",
    question: "What is Tayammum?",
    options: [
      "Washing with Zamzam water",
      "Dry ablution using clean earth when water is unavailable",
      "A special prayer for rain",
      "Fasting on Mondays and Thursdays",
    ],
    answer: 1,
    explanation: "Tayammum is dry ablution using clean earth or sand, permitted when water is unavailable or harmful to use (Quran 4:43).",
    source: "Quran 4:43",
  },
  {
    id: "q-worship-9",
    category: "worship",
    difficulty: "hard",
    question: "What is the Witr prayer?",
    options: [
      "A prayer performed during an eclipse",
      "An odd-numbered voluntary night prayer",
      "The prayer before Eid",
      "A prayer performed while traveling",
    ],
    answer: 1,
    explanation: "Witr is a voluntary night prayer prayed in odd numbers (1, 3, 5, etc.). The Prophet ﷺ said: 'Make Witr the last of your night prayer.' (Sahih al-Bukhari 998)",
    source: "Sahih al-Bukhari 998",
  },
  {
    id: "q-worship-10",
    category: "worship",
    difficulty: "hard",
    question: "What are the seven body parts that must touch the ground during Sujud?",
    options: [
      "Forehead, nose, both hands, both knees, both feet",
      "Forehead, both hands, both knees, both feet",
      "Forehead, nose, both hands, both knees, toes of both feet",
      "Forehead, chin, both hands, both knees, both feet",
    ],
    answer: 2,
    explanation: "The Prophet ﷺ said: 'I have been ordered to prostrate on seven bones: the forehead (and he pointed to his nose), both hands, both knees, and the toes of both feet.' (Sahih al-Bukhari 812)",
    source: "Sahih al-Bukhari 812",
  },

  // ─── SEERAH (Life of Prophet Muhammad ﷺ) ───
  {
    id: "q-seerah-1",
    category: "seerah",
    difficulty: "easy",
    question: "In which city was Prophet Muhammad ﷺ born?",
    options: ["Madinah", "Makkah", "Ta'if", "Jerusalem"],
    answer: 1,
    explanation: "Prophet Muhammad ﷺ was born in Makkah in the Year of the Elephant (approximately 570 CE).",
  },
  {
    id: "q-seerah-2",
    category: "seerah",
    difficulty: "easy",
    question: "What was the name of Prophet Muhammad's ﷺ first wife?",
    options: ["Aisha", "Hafsa", "Khadijah", "Fatimah"],
    answer: 2,
    explanation: "Khadijah bint Khuwaylid was the first wife of Prophet Muhammad ﷺ. She was the first person to accept Islam.",
  },
  {
    id: "q-seerah-3",
    category: "seerah",
    difficulty: "easy",
    question: "What was Prophet Muhammad's ﷺ profession before prophethood?",
    options: ["Farmer", "Blacksmith", "Merchant/Trader", "Carpenter"],
    answer: 2,
    explanation: "Prophet Muhammad ﷺ was a merchant and trader, known for his honesty and trustworthiness (Al-Amin, As-Sadiq).",
  },
  {
    id: "q-seerah-4",
    category: "seerah",
    difficulty: "medium",
    question: "At what age did Prophet Muhammad ﷺ receive the first revelation?",
    options: ["25", "30", "35", "40"],
    answer: 3,
    explanation: "Prophet Muhammad ﷺ received the first revelation at the age of 40 in the Cave of Hira during the month of Ramadan.",
  },
  {
    id: "q-seerah-5",
    category: "seerah",
    difficulty: "medium",
    question: "What was the Hijra?",
    options: [
      "The conquest of Makkah",
      "The migration from Makkah to Madinah",
      "The first battle of Islam",
      "The farewell pilgrimage",
    ],
    answer: 1,
    explanation: "The Hijra was the migration of Prophet Muhammad ﷺ and his followers from Makkah to Madinah in 622 CE, marking the start of the Islamic calendar.",
  },
  {
    id: "q-seerah-6",
    category: "seerah",
    difficulty: "medium",
    question: "What was the first major battle in Islamic history?",
    options: ["Battle of Uhud", "Battle of Badr", "Battle of the Trench", "Conquest of Makkah"],
    answer: 1,
    explanation: "The Battle of Badr (624 CE) was the first major battle, where 313 Muslims defeated a Quraysh army of over 1,000.",
  },
  {
    id: "q-seerah-7",
    category: "seerah",
    difficulty: "medium",
    question: "Who was Prophet Muhammad's ﷺ closest companion and the first Caliph?",
    options: ["Umar ibn al-Khattab", "Uthman ibn Affan", "Ali ibn Abi Talib", "Abu Bakr as-Siddiq"],
    answer: 3,
    explanation: "Abu Bakr as-Siddiq was the Prophet's ﷺ closest companion and became the first Caliph after the Prophet's ﷺ passing.",
  },
  {
    id: "q-seerah-8",
    category: "seerah",
    difficulty: "hard",
    question: "What was the Treaty of Hudaybiyyah?",
    options: [
      "A trade agreement with Persia",
      "A peace treaty between the Muslims and the Quraysh",
      "An alliance between Madinah and Abyssinia",
      "A treaty dividing Madinah between tribes",
    ],
    answer: 1,
    explanation: "The Treaty of Hudaybiyyah (628 CE) was a peace agreement between the Muslims and the Quraysh. The Quran called it a 'clear victory' (Quran 48:1).",
    source: "Quran 48:1",
  },
  {
    id: "q-seerah-9",
    category: "seerah",
    difficulty: "hard",
    question: "In which year did the Conquest of Makkah take place?",
    options: ["6 AH", "8 AH", "10 AH", "12 AH"],
    answer: 1,
    explanation: "The Conquest of Makkah took place in 8 AH (630 CE). The Prophet ﷺ entered Makkah peacefully and forgave the Quraysh.",
  },
  {
    id: "q-seerah-10",
    category: "seerah",
    difficulty: "hard",
    question: "What did the Prophet ﷺ say during his Farewell Sermon at Arafat?",
    options: [
      "\"Build mosques in every city\"",
      "\"All mankind is from Adam and Eve — an Arab has no superiority over a non-Arab\"",
      "\"Conquer the lands to the east and west\"",
      "\"Fast every day of your life\"",
    ],
    answer: 1,
    explanation: "In his Farewell Sermon, the Prophet ﷺ emphasized equality, the sanctity of life and property, and the rights of women. He reminded that all humans are equal before Allah.",
  },
  {
    id: "q-seerah-11",
    category: "seerah",
    difficulty: "easy",
    question: "What was the name of Prophet Muhammad's ﷺ daughter who married Ali ibn Abi Talib?",
    options: ["Zainab", "Ruqayyah", "Umm Kulthum", "Fatimah"],
    answer: 3,
    explanation: "Fatimah (may Allah be pleased with her) married Ali ibn Abi Talib and was the mother of Hasan and Husayn.",
  },

  // ─── AFTERLIFE ───
  {
    id: "q-after-1",
    category: "afterlife",
    difficulty: "easy",
    question: "What is the Day of Judgement called in Arabic?",
    options: ["Yawm al-Jumu'ah", "Yawm al-Qiyamah", "Yawm al-'Eid", "Yawm al-'Arafah"],
    answer: 1,
    explanation: "Yawm al-Qiyamah means 'the Day of Resurrection' — the day when all of creation will be raised and judged by Allah.",
  },
  {
    id: "q-after-2",
    category: "afterlife",
    difficulty: "easy",
    question: "What is Jannah?",
    options: ["The grave", "Paradise", "The bridge over Hell", "Purgatory"],
    answer: 1,
    explanation: "Jannah is Paradise — the eternal abode of bliss and reward for the righteous in the Hereafter.",
  },
  {
    id: "q-after-3",
    category: "afterlife",
    difficulty: "easy",
    question: "What is Jahannam?",
    options: ["A mountain", "A river in Paradise", "Hellfire", "The Day of Judgement"],
    answer: 2,
    explanation: "Jahannam is Hellfire — the place of punishment in the Hereafter for those who rejected faith and did evil.",
  },
  {
    id: "q-after-4",
    category: "afterlife",
    difficulty: "medium",
    question: "What is the Barzakh?",
    options: [
      "The bridge over Hellfire",
      "The barrier/realm between death and resurrection",
      "The gates of Paradise",
      "The angel of death",
    ],
    answer: 1,
    explanation: "Barzakh is the intermediate realm between death and the Day of Resurrection, where souls await judgement (Quran 23:100).",
    source: "Quran 23:100",
  },
  {
    id: "q-after-5",
    category: "afterlife",
    difficulty: "medium",
    question: "What is the Sirat?",
    options: [
      "A river in Paradise",
      "A bridge over Hellfire that everyone must cross",
      "The scale that weighs deeds",
      "The trumpet blown on the Last Day",
    ],
    answer: 1,
    explanation: "The Sirat is a bridge set over Hellfire that all people must cross. The righteous will cross swiftly, while others may fall.",
  },
  {
    id: "q-after-6",
    category: "afterlife",
    difficulty: "medium",
    question: "What are the questions asked in the grave?",
    options: [
      "What is your name? Where are you from? When did you die?",
      "Who is your Lord? What is your religion? Who is your Prophet?",
      "How much wealth did you have? How many children did you have?",
      "What surahs did you memorize? How many prayers did you offer?",
    ],
    answer: 1,
    explanation: "The angels Munkar and Nakir ask three questions: 'Who is your Lord?' 'What is your religion?' 'Who is your Prophet?'",
    source: "Sunan Abu Dawud 4753",
  },
  {
    id: "q-after-7",
    category: "afterlife",
    difficulty: "hard",
    question: "Who will blow the trumpet (Sur) to signal the Day of Judgement?",
    options: ["Jibril", "Mika'il", "Israfil", "Azra'il"],
    answer: 2,
    explanation: "The angel Israfil is tasked with blowing the trumpet. The first blow will destroy all creation, and the second will resurrect everyone.",
  },
  {
    id: "q-after-8",
    category: "afterlife",
    difficulty: "hard",
    question: "What is Al-Mizan?",
    options: [
      "The record of deeds",
      "The divine scale that weighs good and bad deeds",
      "The pool of the Prophet ﷺ",
      "The throne of Allah",
    ],
    answer: 1,
    explanation: "Al-Mizan is the divine scale on the Day of Judgement where deeds will be weighed. Those whose good deeds are heavier will enter Paradise (Quran 7:8-9).",
    source: "Quran 7:8-9",
  },
  {
    id: "q-after-9",
    category: "afterlife",
    difficulty: "hard",
    question: "What is Al-Hawd (the Pool) of the Prophet ﷺ?",
    options: [
      "A river in Jannah",
      "A pool from which the Prophet's ﷺ followers will drink on the Day of Judgement",
      "The well of Zamzam",
      "A spring in Madinah",
    ],
    answer: 1,
    explanation: "Al-Hawd is a pool granted to the Prophet ﷺ on the Day of Judgement. Its water is whiter than milk and sweeter than honey, and whoever drinks from it will never be thirsty again.",
    source: "Sahih al-Bukhari 6579",
  },
  {
    id: "q-after-10",
    category: "afterlife",
    difficulty: "medium",
    question: "What are the major signs before the Day of Judgement?",
    options: [
      "Earthquakes, eclipses, and rainfall",
      "The appearance of the Dajjal, descent of Isa, and the rising of the sun from the west",
      "Famine, plague, and war",
      "Construction of tall buildings and spread of trade",
    ],
    answer: 1,
    explanation: "Major signs include the Dajjal (Antichrist), the descent of Prophet Isa, Gog and Magog, and the sun rising from the west, among others.",
    source: "Sahih Muslim 2901",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   DYNAMICALLY GENERATED QUESTIONS
   ═══════════════════════════════════════════════════════════════════ */

function generateDynamicQuestions(): Question[] {
  const dynamic: Question[] = [];

  // Generate "Which surah means X?" questions from chapters data
  const chaptersWithMeanings = chapters.filter((c) => c.meaning);
  const shuffled = [...chaptersWithMeanings].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(5, shuffled.length); i++) {
    const correct = shuffled[i];
    const wrongs = chaptersWithMeanings
      .filter((c) => c.id !== correct.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const opts = [correct, ...wrongs].sort(() => Math.random() - 0.5);
    const answerIdx = opts.findIndex((o) => o.id === correct.id);

    dynamic.push({
      id: `dyn-surah-meaning-${correct.id}`,
      category: "quran",
      difficulty: "medium",
      question: `Which surah means "${correct.meaning}"?`,
      options: opts.map((o) => o.name),
      answer: answerIdx,
      explanation: `Surah ${correct.name} (Chapter ${correct.id}) means "${correct.meaning}".`,
    });
  }

  // Generate "What does [Name of Allah] mean?" questions
  const namePool = namesOfAllah.filter((n) => n.name !== "Allah").sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(5, namePool.length); i++) {
    const correct = namePool[i];
    const wrongs = namesOfAllah
      .filter((n) => n.name !== correct.name && n.name !== "Allah")
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const opts = [correct.meaning, ...wrongs.map((w) => w.meaning)].sort(() => Math.random() - 0.5);
    const answerIdx = opts.indexOf(correct.meaning);

    dynamic.push({
      id: `dyn-name-${correct.name}`,
      category: "names",
      difficulty: "medium",
      question: `What does "${correct.name}" (${correct.nameAr}) mean?`,
      options: opts,
      answer: answerIdx,
      explanation: `${correct.name} means "${correct.meaning}".`,
    });
  }

  // Generate "How many verses does Surah X have?" questions
  const verseSurahs = chapters.sort(() => Math.random() - 0.5).slice(0, 3);
  for (const s of verseSurahs) {
    const wrongCounts = chapters
      .filter((c) => c.id !== s.id && Math.abs(c.verses - s.verses) > 5)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((c) => c.verses.toString());
    const opts = [s.verses.toString(), ...wrongCounts].sort(() => Math.random() - 0.5);
    const answerIdx = opts.indexOf(s.verses.toString());

    dynamic.push({
      id: `dyn-verses-${s.id}`,
      category: "quran",
      difficulty: "hard",
      question: `How many verses does Surah ${s.name} have?`,
      options: opts,
      answer: answerIdx,
      explanation: `Surah ${s.name} (Chapter ${s.id}) has ${s.verses} verses.`,
    });
  }

  // Generate "Was Surah X revealed in Makkah or Madinah?" true/false style
  const revSurahs = chapters.sort(() => Math.random() - 0.5).slice(0, 3);
  for (const s of revSurahs) {
    const isMakki = s.revelationPlace === "makkah";
    dynamic.push({
      id: `dyn-rev-${s.id}`,
      category: "quran",
      difficulty: "hard",
      question: `Where was Surah ${s.name} revealed?`,
      options: ["Makkah", "Madinah"],
      answer: isMakki ? 0 : 1,
      explanation: `Surah ${s.name} was revealed in ${isMakki ? "Makkah" : "Madinah"}.`,
    });
  }

  return dynamic;
}

/* ═══════════════════════════════════════════════════════════════════
   CATEGORIES & TABS
   ═══════════════════════════════════════════════════════════════════ */

const categories: { key: Category; label: string; labelAr: string; desc: string; color: string }[] = [
  { key: "quran", label: "Quran", labelAr: "القرآن", desc: "Surahs, verses, and revelation", color: "from-emerald-500/20 to-emerald-500/5" },
  { key: "prophets", label: "Prophets", labelAr: "الأنبياء", desc: "Stories and facts about the messengers", color: "from-blue-500/20 to-blue-500/5" },
  { key: "seerah", label: "Life of the Prophet ﷺ", labelAr: "السيرة النبوية", desc: "The biography and events of Prophet Muhammad's life", color: "from-cyan-500/20 to-cyan-500/5" },
  { key: "names", label: "Names of Allah", labelAr: "أسماء الله", desc: "The 99 beautiful names and meanings", color: "from-purple-500/20 to-purple-500/5" },
  { key: "pillars", label: "Pillars & Faith", labelAr: "الأركان", desc: "The foundations of Islam and Iman", color: "from-amber-500/20 to-amber-500/5" },
  { key: "worship", label: "Worship & Practice", labelAr: "العبادات", desc: "Salah, Wudu, Dhikr, and daily practice", color: "from-teal-500/20 to-teal-500/5" },
  { key: "afterlife", label: "The Afterlife", labelAr: "الآخرة", desc: "Day of Judgement, Jannah, Jahannam, and the unseen", color: "from-indigo-500/20 to-indigo-500/5" },
  { key: "general", label: "General", labelAr: "عام", desc: "History, culture, and Islamic knowledge", color: "from-rose-500/20 to-rose-500/5" },
];

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

/* ═══════════════════════════════════════════════════════════════════
   QUIZ COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

function Quiz({
  questions,
  category,
  difficulty,
  onFinish,
  onBack,
}: {
  questions: Question[];
  category: Category;
  difficulty: Difficulty;
  onFinish: (score: number, total: number) => void;
  onBack: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (selected !== null) return; // already answered
    setSelected(idx);
    const correct = idx === q.answer;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, idx]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      const finalScore = score;
      setFinished(true);
      onFinish(finalScore, questions.length);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const perfect = pct === 100;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className={`text-6xl mb-4 ${perfect ? "text-gold" : "text-themed"}`}>
          {perfect ? <Trophy size={64} className="mx-auto text-gold" /> : <Award size={64} className="mx-auto" />}
        </div>
        <h2 className="text-2xl font-bold text-themed mb-2">
          {perfect ? "Perfect Score!" : pct >= 70 ? "Great Job!" : pct >= 50 ? "Good Effort!" : "Keep Learning!"}
        </h2>
        <p className="text-themed-muted mb-1">
          You scored <span className="text-gold font-bold">{score}/{questions.length}</span> ({pct}%)
        </p>
        <p className="text-xs text-themed-muted mb-6">
          {categories.find((c) => c.key === category)?.label} · {difficultyLabels[difficulty]}
        </p>

        {/* Review answers */}
        <div className="max-w-lg mx-auto text-left mb-6 space-y-3">
          {questions.map((qq, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === qq.answer;
            return (
              <div key={qq.id} className={`p-3 rounded-lg border ${isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                <div className="flex items-start gap-2">
                  {isCorrect ? <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" /> : <X size={16} className="text-red-400 mt-0.5 shrink-0" />}
                  <div>
                    <p className="text-sm text-themed">{qq.question}</p>
                    {!isCorrect && (
                      <p className="text-xs text-emerald-400 mt-1">
                        Correct: {qq.options[qq.answer]}
                      </p>
                    )}
                    <p className="text-xs text-themed-muted mt-1">{qq.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg card-bg border sidebar-border text-themed-muted text-sm hover:text-themed transition-colors"
          >
            Back to Categories
          </button>
          <button
            onClick={() => {
              setCurrent(0);
              setSelected(null);
              setScore(0);
              setFinished(false);
              setAnswers([]);
            }}
            className="px-4 py-2 rounded-lg bg-gold/20 text-gold text-sm font-medium hover:bg-gold/30 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-themed-muted hover:text-themed text-sm transition-colors">
          ← Back
        </button>
        <div className="flex-1 h-2 rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gold"
            initial={{ width: 0 }}
            animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs text-themed-muted">
          {current + 1}/{questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-themed mb-6">{q.question}</h3>

          <div className="space-y-3 mb-6">
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.answer;
              const showResult = selected !== null;

              let cls = "card-bg border sidebar-border text-themed hover:border-gold/40";
              if (showResult && isCorrect) cls = "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400";
              else if (showResult && isSelected && !isCorrect) cls = "bg-red-500/15 border border-red-500/40 text-red-400";
              else if (showResult) cls = "card-bg border sidebar-border text-themed-muted opacity-60";

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${cls}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                    showResult && isCorrect
                      ? "bg-emerald-500/30 text-emerald-400"
                      : showResult && isSelected
                      ? "bg-red-500/30 text-red-400"
                      : "bg-white/10 text-themed-muted"
                  }`}>
                    {showResult && isCorrect ? <Check size={14} /> : showResult && isSelected ? <X size={14} /> : String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation after answering */}
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-gold/5 border border-gold/20"
            >
              <p className="text-sm text-themed">{q.explanation}</p>
              {q.source && (
                <p className="text-xs text-gold mt-1">{q.source}</p>
              )}
            </motion.div>
          )}

          {selected !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gold text-black font-medium text-sm flex items-center gap-1.5 hover:bg-gold/90 transition-colors"
              >
                {current + 1 >= questions.length ? "See Results" : "Next"} <ChevronRight size={16} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

type QuizState =
  | { phase: "select" }
  | { phase: "quiz"; category: Category; difficulty: Difficulty; questions: Question[] };

const difficultyConfig: { key: Difficulty; label: string; color: string; icon: typeof Zap }[] = [
  { key: "easy", label: "Easy", color: "text-emerald-400", icon: Star },
  { key: "medium", label: "Medium", color: "text-amber-400", icon: Zap },
  { key: "hard", label: "Hard", color: "text-red-400", icon: Trophy },
];

export default function QuizPage() {
  const [state, setState] = useState<QuizState>({ phase: "select" });
  const [results, setResults] = useState<QuizResult[]>([]);
  const [dynamicQs, setDynamicQs] = useState<Question[]>([]);
  const [expandedCat, setExpandedCat] = useState<Category | null>(null);

  useEffect(() => {
    setResults(getResults());
    setDynamicQs(generateDynamicQuestions());
  }, []);

  const allQuestions = useMemo(() => [...staticQuestions, ...dynamicQs], [dynamicQs]);

  const startQuiz = (category: Category, difficulty: Difficulty) => {
    const pool = allQuestions.filter(
      (q) => q.category === category && q.difficulty === difficulty
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    if (shuffled.length === 0) return;
    setState({ phase: "quiz", category, difficulty, questions: shuffled });
  };

  const startMixed = (category?: Category) => {
    const pool = category
      ? allQuestions.filter((q) => q.category === category)
      : allQuestions;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    if (shuffled.length > 0) {
      setState({ phase: "quiz", category: category || "general", difficulty: "medium", questions: shuffled });
    }
  };

  const handleFinish = (score: number, total: number) => {
    if (state.phase !== "quiz") return;
    const result: QuizResult = {
      category: state.category,
      difficulty: state.difficulty,
      score,
      total,
      date: Date.now(),
    };
    saveResult(result);
    setResults(getResults());
  };

  const goBack = () => {
    setState({ phase: "select" });
    setExpandedCat(null);
    setDynamicQs(generateDynamicQuestions());
  };

  const getTotalQuizzesTaken = () => results.length;
  const getAvgScore = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((acc, r) => acc + (r.score / r.total) * 100, 0);
    return Math.round(total / results.length);
  };
  const getPerfectScores = () => results.filter((r) => r.score === r.total).length;

  const getBestForCat = (cat: Category) => {
    const catResults = results.filter((r) => r.category === cat);
    if (catResults.length === 0) return null;
    return Math.max(...catResults.map((r) => Math.round((r.score / r.total) * 100)));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24">
      <PageHeader
        title="Quizzes & Challenges"
        titleAr="اختبارات وتحديات"
        subtitle="Test your knowledge of Islam"
      />

      {state.phase === "select" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Quick start banner */}
          <button
            onClick={() => startMixed()}
            className="w-full mb-6 p-5 rounded-2xl bg-gradient-to-r from-gold/20 via-gold/10 to-transparent border border-gold/20 hover:border-gold/40 transition-all group text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={18} className="text-gold" />
                  <span className="font-semibold text-gold text-sm">Quick Challenge</span>
                </div>
                <p className="text-xs text-themed-muted">10 random questions from all categories</p>
              </div>
              <ChevronRight size={20} className="text-gold/50 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>

          {/* Stats bar */}
          {results.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-xl card-bg border sidebar-border text-center">
                <p className="text-lg font-bold text-gold">{getTotalQuizzesTaken()}</p>
                <p className="text-[10px] text-themed-muted uppercase tracking-wider">Quizzes</p>
              </div>
              <div className="p-3 rounded-xl card-bg border sidebar-border text-center">
                <p className="text-lg font-bold text-emerald-400">{getAvgScore()}%</p>
                <p className="text-[10px] text-themed-muted uppercase tracking-wider">Avg Score</p>
              </div>
              <div className="p-3 rounded-xl card-bg border sidebar-border text-center">
                <p className="text-lg font-bold text-purple-400">{getPerfectScores()}</p>
                <p className="text-[10px] text-themed-muted uppercase tracking-wider">Perfect</p>
              </div>
            </div>
          )}

          {/* Category cards */}
          <div className="space-y-3">
            {categories.map((cat, idx) => {
              const isExpanded = expandedCat === cat.key;
              const bestPct = getBestForCat(cat.key);
              const catCount = allQuestions.filter((q) => q.category === cat.key).length;

              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <button
                    onClick={() => setExpandedCat(isExpanded ? null : cat.key)}
                    className={`w-full text-left rounded-2xl border transition-all overflow-hidden ${
                      isExpanded ? "border-gold/30" : "sidebar-border hover:border-gold/20"
                    }`}
                  >
                    <div className={`p-5 bg-gradient-to-r ${cat.color}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-base font-semibold text-themed">{cat.label}</h3>
                            <span className="text-xs text-themed-muted font-arabic">{cat.labelAr}</span>
                          </div>
                          <p className="text-xs text-themed-muted mt-0.5">{cat.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {bestPct !== null && (
                            <span className="text-xs text-gold font-medium bg-gold/10 px-2 py-0.5 rounded-full">
                              Best: {bestPct}%
                            </span>
                          )}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={18} className="text-themed-muted" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded difficulty options */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 pt-2 space-y-2 card-bg border border-t-0 sidebar-border rounded-b-2xl -mt-px">
                          {difficultyConfig.map((diff) => {
                            const count = allQuestions.filter(
                              (q) => q.category === cat.key && q.difficulty === diff.key
                            ).length;
                            const best = results
                              .filter((r) => r.category === cat.key && r.difficulty === diff.key)
                              .sort((a, b) => b.score / b.total - a.score / a.total)[0];
                            const DIcon = diff.icon;

                            return (
                              <button
                                key={diff.key}
                                onClick={() => count > 0 && startQuiz(cat.key, diff.key)}
                                disabled={count === 0}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                  count > 0
                                    ? "hover:bg-white/5 active:scale-[0.98]"
                                    : "opacity-30 cursor-not-allowed"
                                }`}
                              >
                                <DIcon size={16} className={diff.color} />
                                <span className="text-sm font-medium text-themed flex-1 text-left">{diff.label}</span>
                                <span className="text-xs text-themed-muted">{count} Questions</span>
                                {best && (
                                  <span className="text-xs text-gold ml-1">
                                    {Math.round((best.score / best.total) * 100)}%
                                  </span>
                                )}
                                <ChevronRight size={14} className="text-themed-muted" />
                              </button>
                            );
                          })}
                          <button
                            onClick={() => startMixed(cat.key)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gold/5 transition-all active:scale-[0.98]"
                          >
                            <Zap size={16} className="text-gold" />
                            <span className="text-sm font-medium text-gold flex-1 text-left">Mixed — All Levels</span>
                            <span className="text-xs text-themed-muted">{catCount} Questions</span>
                            <ChevronRight size={14} className="text-gold/50" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {state.phase === "quiz" && (
        <Quiz
          questions={state.questions}
          category={state.category}
          difficulty={state.difficulty}
          onFinish={handleFinish}
          onBack={goBack}
        />
      )}
    </div>
  );
}
