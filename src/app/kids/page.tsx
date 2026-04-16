"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import TabBar from "@/components/TabBar";
import ContentCard from "@/components/ContentCard";
import namesOfAllah from "@/data/names-of-allah";
import { prophetStories } from "@/data/prophet-stories";
import {
  type AgeGroup,
  type KidsProgress,
  getKidsProgress,
  updateKidsProgress,
  addKidsStars,
  markKidsLessonComplete,
  addKidsBadge,
  updateKidsStreak,
  toggleKidsChecklist,
} from "@/lib/storage";
import {
  Star,
  Flame,
  Award,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  ChevronDown,
  Heart,
  Sparkles,
  Trophy,
  Lightbulb,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   STARBURST CELEBRATION
   ═══════════════════════════════════════════════════════════════════ */

function StarBurst({ show, onDone }: { show: boolean; onDone: () => void }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onDone, 1500);
      return () => clearTimeout(t);
    }
  }, [show, onDone]);

  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-gold"
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1.5, 0],
            x: Math.cos((i * Math.PI) / 4) * 100,
            y: Math.sin((i * Math.PI) / 4) * 100,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Star size={24} fill="currentColor" />
        </motion.div>
      ))}
      <motion.div
        className="text-gold"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 2, 1.5] }}
        transition={{ duration: 0.6 }}
      >
        <Star size={48} fill="currentColor" />
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CONFETTI
   ═══════════════════════════════════════════════════════════════════ */

const CONFETTI_COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#F7DC6F", "#BB8FCE", "#85C1E9", "#F1948A"];

function ConfettiStar({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function Confetti({ show, onDone }: { show: boolean; onDone: () => void }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 3 + Math.random() * 2.5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotation: Math.random() * 360,
        size: 10 + Math.random() * 10,
        drift: (Math.random() - 0.5) * 80,
      })),
    []
  );

  useEffect(() => {
    if (show) {
      const t = setTimeout(onDone, 6000);
      return () => clearTimeout(t);
    }
  }, [show, onDone]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: -30 }}
          initial={{ y: -30, opacity: 1, rotate: 0, x: 0 }}
          animate={{
            y: typeof window !== "undefined" ? window.innerHeight + 40 : 900,
            opacity: [1, 1, 1, 0.8, 0],
            rotate: p.rotation + 540,
            x: [0, p.drift * 0.3, p.drift, p.drift * 0.7],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "linear",
          }}
        >
          <ConfettiStar color={p.color} size={p.size} />
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════════ */

const tabs = [
  { key: "who-is-allah", label: "Who is Allah?" },
  { key: "five-pillars", label: "The 5 Pillars" },
  { key: "daily-words", label: "Daily Words" },
  { key: "prophet-stories", label: "Prophet Stories" },
  { key: "quran-corner", label: "Quran Corner" },
  { key: "good-deeds", label: "Good Deeds" },
  { key: "challenges", label: "Challenges" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* ═══════════════════════════════════════════════════════════════════
   AGE GROUP SELECTOR
   ═══════════════════════════════════════════════════════════════════ */

const ageGroups: { key: AgeGroup; label: string; ages: string }[] = [
  { key: "little", label: "Little Learner", ages: "4-6" },
  { key: "explorer", label: "Explorer", ages: "7-9" },
  { key: "scholar", label: "Scholar", ages: "10-12" },
];

function AgeGroupSelector({
  value,
  onChange,
}: {
  value: AgeGroup;
  onChange: (g: AgeGroup) => void;
}) {
  return (
    <div className="flex mb-4">
      <div className="relative inline-block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as AgeGroup)}
          className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium card-bg border sidebar-border text-themed cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold/40"
        >
          {ageGroups.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label} ({g.ages})
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROGRESS DASHBOARD
   ═══════════════════════════════════════════════════════════════════ */

function ProgressDashboard({ progress }: { progress: KidsProgress }) {
  return (
    <div className="flex items-center gap-6 mb-6">
      <div className="flex items-center gap-1.5 text-gold">
        <Star size={18} fill="currentColor" />
        <span className="font-semibold text-sm">{progress.stars}</span>
        <span className="text-xs text-themed-muted">stars</span>
      </div>
      <div className="flex items-center gap-1.5 text-orange-400">
        <Flame size={18} fill={progress.streak > 0 ? "currentColor" : "none"} />
        <span className="font-semibold text-sm">{progress.streak}</span>
        <span className="text-xs text-themed-muted">day streak</span>
      </div>
      <div className="flex items-center gap-1.5 text-purple-400">
        <Award size={18} />
        <span className="font-semibold text-sm">{progress.badges.length}</span>
        <span className="text-xs text-themed-muted">badges</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BADGE DEFINITIONS
   ═══════════════════════════════════════════════════════════════════ */

type Badge = { id: string; name: string; desc: string };

const badgeDefs: Badge[] = [
  { id: "first-steps", name: "First Steps", desc: "Complete your first lesson" },
  { id: "quran-reader", name: "Quran Reader", desc: "Memorize 3 surahs" },
  { id: "word-master", name: "Word Master", desc: "Master 20 flashcards" },
  { id: "streak-7", name: "Streak Champion", desc: "7-day streak" },
  { id: "pillar-pro", name: "Pillar Pro", desc: "Complete all 5 pillars" },
  { id: "story-explorer", name: "Story Explorer", desc: "Read 5 prophet stories" },
];

/* ═══════════════════════════════════════════════════════════════════
   TAB 1: WHO IS ALLAH? (Flashcard Deck)
   ═══════════════════════════════════════════════════════════════════ */

function getNamesByAge(age: AgeGroup) {
  const all = namesOfAllah;
  if (age === "little") return all.slice(0, 10);
  if (age === "explorer") return all.slice(0, 33);
  return all;
}

function WhoIsAllahTab({
  age,
  progress,
  onStar,
}: {
  age: AgeGroup;
  progress: KidsProgress;
  onStar: () => void;
}) {
  const names = useMemo(() => getNamesByAge(age), [age]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedInSet, setReviewedInSet] = useState(0);

  const current = names[idx];
  if (!current) return null;

  const simplify = (text: string) => {
    if (age === "little") {
      // Take first sentence only
      const first = text.split(/\.\s/)[0];
      return first.length > 100 ? first.slice(0, 100) + "..." : first + ".";
    }
    if (age === "explorer") {
      const sentences = text.split(/\.\s/);
      return sentences.slice(0, 2).join(". ") + ".";
    }
    return text;
  };

  const handleFlip = () => setFlipped(!flipped);
  const handleNext = () => {
    const newReviewed = reviewedInSet + 1;
    if (newReviewed >= 5) {
      onStar();
      setReviewedInSet(0);
    } else {
      setReviewedInSet(newReviewed);
    }
    setIdx((i) => (i + 1) % names.length);
    setFlipped(false);
  };
  const handlePrev = () => {
    setIdx((i) => (i - 1 + names.length) % names.length);
    setFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-center text-themed-muted text-sm mb-4">
        Tap the card to flip it and learn about Allah&apos;s beautiful names!
      </p>

      {/* Progress */}
      <div className="text-center text-xs text-themed-muted mb-3">
        {idx + 1} of {names.length} &middot; {reviewedInSet}/5 towards next{" "}
        <Star size={10} className="inline text-gold" fill="currentColor" />
      </div>

      {/* Card */}
      <div className="perspective-1000 cursor-pointer mb-4" onClick={handleFlip}>
        <motion.div
          className="relative w-full h-64 rounded-2xl"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 card-bg sidebar-border rounded-2xl flex flex-col items-center justify-center p-6 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-4xl font-arabic mb-3">{current.nameAr}</p>
            <p className="text-lg font-semibold text-gold">{current.name}</p>
            <p className="text-sm text-themed-muted mt-1">{current.meaning}</p>
            <p className="text-xs text-themed-muted mt-4 opacity-50">Tap to flip</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 card-bg sidebar-border rounded-2xl flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-sm text-themed leading-relaxed text-center">
              {simplify(current.explanation)}
            </p>
            {current.verse && age !== "little" && (
              <div className="mt-3 text-xs text-themed-muted text-center">
                <p className="font-arabic text-base mb-1">{current.verse.arabic}</p>
                <p className="italic">{current.verse.text}</p>
                <p className="text-gold mt-1">{current.verse.ref}</p>
              </div>
            )}
            <p className="text-xs text-themed-muted mt-4 opacity-50">Tap to flip back</p>
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handlePrev}
          className="p-2 rounded-full card-bg sidebar-border hover:bg-gold/10 transition"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 rounded-full bg-gold text-black font-medium text-sm hover:bg-gold/90 transition"
        >
          Next Name
        </button>
        <button
          onClick={handleNext}
          className="p-2 rounded-full card-bg sidebar-border hover:bg-gold/10 transition"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Learn Together hint */}
      <div className="mt-6 p-3 rounded-xl bg-gold/5 border border-gold/20 text-center">
        <Lightbulb size={14} className="inline text-gold mr-1" />
        <span className="text-xs text-themed-muted">
          <strong>Learn Together:</strong> Ask your child &ldquo;What does {current.name} mean?&rdquo;
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 2: THE 5 PILLARS
   ═══════════════════════════════════════════════════════════════════ */

type PillarData = {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  descriptions: { little: string; explorer: string; scholar: string };
  steps: { little: string[]; explorer: string[]; scholar: string[] };
  quiz: { q: string; options: string[]; answer: number; explanation: string }[];
};

const pillarsData: PillarData[] = [
  {
    id: "shahada",
    name: "Shahada",
    nameAr: "الشهادة",
    icon: "☝️",
    descriptions: {
      little: "We say there is only one God, Allah, and Muhammad is His messenger!",
      explorer: "The Shahada is the declaration of faith: 'There is no god but Allah, and Muhammad is the Messenger of Allah.' It is the first and most important pillar.",
      scholar: "The Shahada (testimony of faith) is: 'Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan rasulullah.' It means testifying with conviction that none deserves worship except Allah, and that Muhammad (peace be upon him) is His final messenger. This is the foundation of Islam.",
    },
    steps: {
      little: ["Believe in Allah", "Love Prophet Muhammad ﷺ", "Say the Shahada with your heart"],
      explorer: ["Believe there is only one God (Allah)", "Believe Muhammad ﷺ is Allah's last messenger", "Say the Shahada sincerely", "Try to follow what Allah and His messenger taught"],
      scholar: ["Understand Tawheed (oneness of Allah)", "Accept Muhammad ﷺ as the final prophet", "Pronounce the Shahada with sincerity and understanding", "Act upon its requirements in daily life", "Reject all forms of shirk (associating partners with Allah)"],
    },
    quiz: [
      { q: "How many gods do Muslims believe in?", options: ["One", "Two", "Three", "Many"], answer: 0, explanation: "Muslims believe in only one God — Allah." },
      { q: "Who is the last prophet in Islam?", options: ["Ibrahim", "Musa", "Isa", "Muhammad ﷺ"], answer: 3, explanation: "Prophet Muhammad ﷺ is the final messenger of Allah." },
      { q: "What is the Shahada?", options: ["A prayer", "The declaration of faith", "A holiday", "A book"], answer: 1, explanation: "The Shahada is the testimony of faith — the first pillar of Islam." },
    ],
  },
  {
    id: "salah",
    name: "Salah",
    nameAr: "الصلاة",
    icon: "🕌",
    descriptions: {
      little: "We pray to Allah five times every day to talk to Him and thank Him!",
      explorer: "Salah (prayer) is performed five times daily: Fajr (dawn), Dhuhr (noon), Asr (afternoon), Maghrib (sunset), and Isha (night). It connects us directly to Allah.",
      scholar: "Salah is the second pillar of Islam and the most important act of worship after the Shahada. The Prophet ﷺ said, 'The first thing a person will be asked about on the Day of Judgment is their prayer.' It is obligatory five times daily and includes specific physical postures (standing, bowing, prostrating) with Quranic recitation.",
    },
    steps: {
      little: ["Pray Fajr (morning)", "Pray Dhuhr (afternoon)", "Pray Asr (later afternoon)", "Pray Maghrib (sunset)", "Pray Isha (night)"],
      explorer: ["Make wudu (wash up for prayer)", "Face the Qibla (toward Makkah)", "Stand, bow, and prostrate to Allah", "Recite Al-Fatiha and other surahs", "Pray all five daily prayers"],
      scholar: ["Perform proper wudu with all its conditions", "Know the exact times for each prayer", "Fulfill all pillars (arkan) of prayer", "Pray with khushu (focus and humility)", "Make up missed prayers and learn sunnah prayers"],
    },
    quiz: [
      { q: "How many times do Muslims pray each day?", options: ["Three", "Five", "Seven", "Two"], answer: 1, explanation: "Muslims pray five times daily: Fajr, Dhuhr, Asr, Maghrib, and Isha." },
      { q: "What do you do before praying?", options: ["Eat food", "Make wudu", "Go to sleep", "Read a book"], answer: 1, explanation: "We perform wudu (ablution) to cleanse ourselves before prayer." },
      { q: "Which direction do Muslims face when praying?", options: ["East", "West", "Toward Makkah", "Any direction"], answer: 2, explanation: "Muslims face the Kaaba in Makkah when praying." },
    ],
  },
  {
    id: "zakat",
    name: "Zakat",
    nameAr: "الزكاة",
    icon: "🤲",
    descriptions: {
      little: "We share our money with people who need it because Allah told us to be kind and generous!",
      explorer: "Zakat means giving a portion of your wealth (2.5%) to those in need. It purifies your wealth and helps the community. It's one of the five pillars of Islam.",
      scholar: "Zakat is an obligatory form of charity — 2.5% of accumulated wealth above a minimum threshold (nisab) given annually. It purifies wealth, reduces inequality, and strengthens community bonds. The Quran pairs zakat with salah about 30 times, showing its importance.",
    },
    steps: {
      little: ["Share with those who have less", "Be kind and generous", "Give your extra things to others"],
      explorer: ["Understand that some of our wealth belongs to those in need", "Give 2.5% of savings to charity", "Help the poor and needy", "Give with a happy heart, not for showing off"],
      scholar: ["Learn about nisab (minimum threshold)", "Calculate 2.5% of eligible wealth", "Know the eight categories of zakat recipients", "Give zakat annually with sincerity", "Understand the difference between zakat and sadaqah"],
    },
    quiz: [
      { q: "What does Zakat mean?", options: ["Fasting", "Giving to those in need", "Praying", "Reading Quran"], answer: 1, explanation: "Zakat is giving a portion of your wealth to help those who need it." },
      { q: "Why do Muslims give Zakat?", options: ["To show off", "Because Allah commanded it and it helps others", "To become poor", "For fun"], answer: 1, explanation: "Allah commanded Zakat to purify our wealth and help those in need." },
    ],
  },
  {
    id: "sawm",
    name: "Sawm",
    nameAr: "الصيام",
    icon: "🌙",
    descriptions: {
      little: "During Ramadan, Muslims don't eat or drink from sunrise to sunset to get closer to Allah!",
      explorer: "Sawm (fasting) during Ramadan means no food or drink from dawn (Fajr) to sunset (Maghrib). It teaches patience, gratitude, and empathy for those who are hungry.",
      scholar: "Fasting in Ramadan is obligatory for every able Muslim. Beyond abstaining from food and drink, true fasting includes guarding the tongue, eyes, and heart. The Prophet ﷺ said, 'Whoever fasts Ramadan with faith and seeking reward, his past sins will be forgiven.'",
    },
    steps: {
      little: ["No eating or drinking when the sun is up", "Eat suhoor (early breakfast) before dawn", "Break your fast at sunset with dates", "Be extra kind during Ramadan"],
      explorer: ["Wake up for suhoor before Fajr", "Fast from Fajr to Maghrib", "Break fast with dates and water (iftar)", "Pray extra prayers (Tarawih) at night", "Read more Quran during Ramadan"],
      scholar: ["Understand the conditions and exemptions of fasting", "Fast with proper intention (niyyah)", "Guard all senses during the fast", "Increase Quran recitation and dhikr", "Seek Laylatul Qadr in the last 10 nights"],
    },
    quiz: [
      { q: "In which month do Muslims fast?", options: ["Shawwal", "Dhul Hijjah", "Ramadan", "Rajab"], answer: 2, explanation: "Muslims fast during the holy month of Ramadan." },
      { q: "When do you break your fast?", options: ["At noon", "At sunset", "At midnight", "Whenever you want"], answer: 1, explanation: "Muslims break their fast at sunset (Maghrib time)." },
    ],
  },
  {
    id: "hajj",
    name: "Hajj",
    nameAr: "الحج",
    icon: "🕋",
    descriptions: {
      little: "Once in their life, Muslims travel to a special place called Makkah to worship Allah together!",
      explorer: "Hajj is the pilgrimage to Makkah that every able Muslim must do at least once. Millions gather wearing simple white clothes, showing that everyone is equal before Allah.",
      scholar: "Hajj is the fifth pillar of Islam — an annual pilgrimage to Makkah obligatory once in a lifetime for those physically and financially able. It commemorates the actions of Prophet Ibrahim and his family. The rites include Tawaf (circling the Kaaba), Sa'i (walking between Safa and Marwa), and standing at Arafat.",
    },
    steps: {
      little: ["Travel to the holy city of Makkah", "Walk around the Kaaba", "Pray to Allah with millions of other Muslims"],
      explorer: ["Enter ihram (state of purity, simple white clothes)", "Perform Tawaf (walk around the Kaaba 7 times)", "Walk between Safa and Marwa (Sa'i)", "Stand at Arafat and make dua", "Throw pebbles at the Jamarat"],
      scholar: ["Enter ihram with proper intention and restrictions", "Perform all pillars: ihram, Tawaf, Sa'i, Arafat, and more", "Understand the history of Ibrahim and Ismail", "Complete the rites over the Days of Tashreeq", "Return spiritually renewed, as if born anew"],
    },
    quiz: [
      { q: "Where do Muslims go for Hajj?", options: ["Madinah", "Jerusalem", "Makkah", "Cairo"], answer: 2, explanation: "Hajj is the pilgrimage to Makkah, where the Kaaba is located." },
      { q: "How many times must a Muslim do Hajj?", options: ["Every year", "At least once", "Five times", "Never"], answer: 1, explanation: "Hajj is required at least once in a lifetime for those who are able." },
    ],
  },
];

function FivePillarsTab({
  age,
  progress,
  onStar,
  onLessonComplete,
}: {
  age: AgeGroup;
  progress: KidsProgress;
  onStar: () => void;
  onLessonComplete: (id: string) => void;
}) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const pillar = pillarsData.find((p) => p.id === selectedPillar);

  const handleStartQuiz = () => {
    setQuizMode(true);
    setQuizIdx(0);
    setQuizAnswer(null);
    setQuizScore(0);
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(optionIdx);
    if (pillar && optionIdx === pillar.quiz[quizIdx].answer) {
      setQuizScore((s) => s + 1);
    }
  };

  const handleQuizNext = () => {
    if (!pillar) return;
    if (quizIdx + 1 < pillar.quiz.length) {
      setQuizIdx((i) => i + 1);
      setQuizAnswer(null);
    } else {
      // Quiz complete
      const perfect = quizScore + (quizAnswer === pillar.quiz[quizIdx].answer ? 1 : 0) === pillar.quiz.length;
      if (perfect) onStar();
      onLessonComplete(`pillar-${pillar.id}`);
      setQuizMode(false);
      setSelectedPillar(null);
    }
  };

  if (!selectedPillar) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-themed-muted text-sm mb-4">
          Islam is built on five pillars. Learn about each one!
        </p>

        {/* Pillar icons row */}
        <div className="flex justify-center gap-3 mb-6">
          {pillarsData.map((p) => {
            const done = progress.completedLessons.includes(`pillar-${p.id}`);
            return (
              <div key={p.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    done ? "bg-gold text-black" : "card-bg sidebar-border"
                  }`}
                >
                  {done ? <Check size={16} /> : p.icon}
                </div>
                <span className="text-[10px] text-themed-muted mt-1">{p.name}</span>
              </div>
            );
          })}
        </div>

        {/* Pillar cards */}
        <div className="space-y-3">
          {pillarsData.map((p, i) => {
            const done = progress.completedLessons.includes(`pillar-${p.id}`);
            return (
              <ContentCard key={p.id} delay={0.05 + i * 0.05}>
                <button
                  onClick={() => setSelectedPillar(p.id)}
                  className="w-full text-left flex items-start gap-3 p-1"
                >
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-themed">{p.name}</h3>
                      <span className="text-xs font-arabic text-themed-muted">{p.nameAr}</span>
                      {done && (
                        <span className="ml-auto text-gold text-xs flex items-center gap-1">
                          <Check size={12} /> Done
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-themed-muted mt-1">{p.descriptions[age]}</p>
                  </div>
                </button>
              </ContentCard>
            );
          })}
        </div>
      </div>
    );
  }

  // Pillar detail view
  if (!pillar) return null;

  if (quizMode) {
    const q = pillar.quiz[quizIdx];
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => { setQuizMode(false); setSelectedPillar(null); }}
          className="flex items-center gap-1 text-sm text-themed-muted hover:text-themed mb-4"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h3 className="font-semibold text-themed text-center mb-1">
          {pillar.icon} {pillar.name} Quiz
        </h3>
        <p className="text-xs text-themed-muted text-center mb-4">
          Question {quizIdx + 1} of {pillar.quiz.length}
        </p>

        <ContentCard>
          <p className="font-medium text-themed mb-4">{q.q}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              let cls = "card-bg sidebar-border hover:bg-gold/10";
              if (quizAnswer !== null) {
                if (oi === q.answer) cls = "bg-green-500/20 border-green-500/50";
                else if (oi === quizAnswer && oi !== q.answer) cls = "bg-red-500/20 border-red-500/50";
              }
              return (
                <button
                  key={oi}
                  onClick={() => handleQuizAnswer(oi)}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {quizAnswer !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <p className={`text-sm ${quizAnswer === q.answer ? "text-green-400" : "text-red-400"}`}>
                {quizAnswer === q.answer ? "Correct!" : "Not quite!"}
              </p>
              <p className="text-xs text-themed-muted mt-1">{q.explanation}</p>
              <button
                onClick={handleQuizNext}
                className="mt-3 px-4 py-2 rounded-full bg-gold text-black text-sm font-medium"
              >
                {quizIdx + 1 < pillar.quiz.length ? "Next Question" : "Finish Quiz"}
              </button>
            </motion.div>
          )}
        </ContentCard>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => setSelectedPillar(null)}
        className="flex items-center gap-1 text-sm text-themed-muted hover:text-themed mb-4"
      >
        <ChevronLeft size={16} /> All Pillars
      </button>

      <h3 className="text-xl font-semibold text-themed text-center mb-1">
        {pillar.icon} {pillar.name}
      </h3>
      <p className="text-xs font-arabic text-themed-muted text-center mb-4">{pillar.nameAr}</p>

      <ContentCard>
        <p className="text-sm text-themed leading-relaxed mb-4">{pillar.descriptions[age]}</p>
        <h4 className="text-sm font-semibold text-gold mb-2">Steps to follow:</h4>
        <ol className="space-y-2">
          {pillar.steps[age].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-themed">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center font-medium">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </ContentCard>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleStartQuiz}
          className="px-6 py-2.5 rounded-full bg-gold text-black font-medium text-sm hover:bg-gold/90 transition"
        >
          Take the Quiz!
        </button>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-gold/5 border border-gold/20 text-center">
        <Lightbulb size={14} className="inline text-gold mr-1" />
        <span className="text-xs text-themed-muted">
          <strong>Learn Together:</strong> Ask your child to explain this pillar in their own words!
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 3: DAILY WORDS (Spaced Repetition Flashcards)
   ═══════════════════════════════════════════════════════════════════ */

type DailyWord = {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  when: string;
  category: string;
};

const dailyWords: DailyWord[] = [
  { id: "bismillah", arabic: "بسم الله", transliteration: "Bismillah", english: "In the name of Allah", when: "Before eating, drinking, or starting anything", category: "essential" },
  { id: "alhamdulillah", arabic: "الحمد لله", transliteration: "Alhamdulillah", english: "Praise be to Allah", when: "After eating, when grateful, after sneezing", category: "essential" },
  { id: "subhanallah", arabic: "سبحان الله", transliteration: "SubhanAllah", english: "Glory be to Allah", when: "When amazed or to praise Allah", category: "essential" },
  { id: "allahu-akbar", arabic: "الله أكبر", transliteration: "Allahu Akbar", english: "Allah is the Greatest", when: "In prayer and to glorify Allah", category: "essential" },
  { id: "assalamu-alaikum", arabic: "السلام عليكم", transliteration: "Assalamu Alaikum", english: "Peace be upon you", when: "When greeting another Muslim", category: "greetings" },
  { id: "wa-alaikum-assalam", arabic: "وعليكم السلام", transliteration: "Wa Alaikum Assalam", english: "And peace be upon you too", when: "When replying to a greeting", category: "greetings" },
  { id: "jazakallah", arabic: "جزاك الله خيراً", transliteration: "JazakAllahu Khairan", english: "May Allah reward you with good", when: "When thanking someone", category: "greetings" },
  { id: "inshallah", arabic: "إن شاء الله", transliteration: "InshAllah", english: "If Allah wills", when: "When talking about future plans", category: "daily" },
  { id: "mashallah", arabic: "ما شاء الله", transliteration: "MashAllah", english: "What Allah has willed", when: "When admiring something good", category: "daily" },
  { id: "astaghfirullah", arabic: "أستغفر الله", transliteration: "Astaghfirullah", english: "I seek forgiveness from Allah", when: "When making a mistake or seeking forgiveness", category: "daily" },
  { id: "la-hawla", arabic: "لا حول ولا قوة إلا بالله", transliteration: "La hawla wa la quwwata illa billah", english: "There is no power except with Allah", when: "When facing difficulty", category: "dhikr" },
  { id: "yarhamukallah", arabic: "يرحمك الله", transliteration: "Yarhamukallah", english: "May Allah have mercy on you", when: "When someone sneezes and says Alhamdulillah", category: "greetings" },
  { id: "tabarakallah", arabic: "تبارك الله", transliteration: "TabarakAllah", english: "Blessed is Allah", when: "When praising something beautiful", category: "daily" },
  { id: "la-ilaha-illallah", arabic: "لا إله إلا الله", transliteration: "La ilaha illallah", english: "There is no god but Allah", when: "The greatest word of remembrance", category: "dhikr" },
  { id: "salallahu-alaihi", arabic: "صلى الله عليه وسلم", transliteration: "Sallallahu Alaihi Wasallam", english: "Peace and blessings be upon him", when: "When mentioning Prophet Muhammad", category: "daily" },
];

function DailyWordsTab({
  age,
  progress,
  onStar,
}: {
  age: AgeGroup;
  progress: KidsProgress;
  onStar: () => void;
}) {
  const words = age === "little" ? dailyWords.slice(0, 8) : dailyWords;
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  const word = words[idx];
  if (!word) return null;

  const bucket = progress.flashcardBuckets[word.id] ?? 0;
  const bucketLabel = ["New", "Learning", "Mastered"][bucket] ?? "New";

  const handleRate = (quality: number) => {
    // quality: 0=hard, 1=good, 2=easy
    const newBucket = Math.min(2, bucket + (quality >= 1 ? 1 : 0));
    const p = getKidsProgress();
    const buckets = { ...p.flashcardBuckets, [word.id]: newBucket };

    // Calculate next review date
    const days = [1, 3, 7][newBucket] ?? 1;
    const nextDate = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
    const reviews = { ...p.flashcardNextReview, [word.id]: nextDate };

    updateKidsProgress({ flashcardBuckets: buckets, flashcardNextReview: reviews });

    if (newBucket === 2 && bucket < 2) {
      const newMastered = masteredCount + 1;
      setMasteredCount(newMastered);
      if (newMastered % 5 === 0) onStar();
    }

    // Next card
    setIdx((i) => (i + 1) % words.length);
    setFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-center text-themed-muted text-sm mb-4">
        Learn important Islamic words and phrases! Tap the card to see the meaning.
      </p>

      <div className="text-center text-xs text-themed-muted mb-3">
        {idx + 1} of {words.length} &middot;{" "}
        <span className={bucket === 2 ? "text-green-400" : bucket === 1 ? "text-gold" : "text-themed-muted"}>
          {bucketLabel}
        </span>
      </div>

      {/* Card */}
      <div className="perspective-1000 cursor-pointer mb-4" onClick={() => setFlipped(!flipped)}>
        <motion.div
          className="relative w-full h-56 rounded-2xl"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front - Arabic */}
          <div
            className="absolute inset-0 card-bg sidebar-border rounded-2xl flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-3xl font-arabic mb-2">{word.arabic}</p>
            <p className="text-sm text-gold">{word.transliteration}</p>
            <p className="text-xs text-themed-muted mt-4 opacity-50">Tap to see meaning</p>
          </div>
          {/* Back - English */}
          <div
            className="absolute inset-0 card-bg sidebar-border rounded-2xl flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-lg font-semibold text-themed mb-2">{word.english}</p>
            <p className="text-sm text-themed-muted text-center">{word.when}</p>
            <p className="text-xs text-themed-muted mt-4 opacity-50">Tap to flip back</p>
          </div>
        </motion.div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-3 mb-4"
        >
          <button
            onClick={() => handleRate(0)}
            className="px-4 py-2 rounded-full text-sm card-bg sidebar-border text-red-400 hover:bg-red-500/10"
          >
            Hard
          </button>
          <button
            onClick={() => handleRate(1)}
            className="px-4 py-2 rounded-full text-sm card-bg sidebar-border text-gold hover:bg-gold/10"
          >
            Good
          </button>
          <button
            onClick={() => handleRate(2)}
            className="px-4 py-2 rounded-full text-sm card-bg sidebar-border text-green-400 hover:bg-green-500/10"
          >
            Easy
          </button>
        </motion.div>
      )}

      <div className="mt-4 p-3 rounded-xl bg-gold/5 border border-gold/20 text-center">
        <Lightbulb size={14} className="inline text-gold mr-1" />
        <span className="text-xs text-themed-muted">
          <strong>Learn Together:</strong> Practice saying &ldquo;{word.transliteration}&rdquo; together throughout the day!
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 4: PROPHET STORIES (Paginated Reader)
   ═══════════════════════════════════════════════════════════════════ */

const prophetList: { slug: string; name: string; emoji: string }[] = [
  { slug: "adam", name: "Adam", emoji: "🌿" },
  { slug: "nuh", name: "Nuh (Noah)", emoji: "🚢" },
  { slug: "ibrahim", name: "Ibrahim (Abraham)", emoji: "⭐" },
  { slug: "ismail", name: "Ismail", emoji: "🐑" },
  { slug: "yusuf", name: "Yusuf (Joseph)", emoji: "🌙" },
  { slug: "musa", name: "Musa (Moses)", emoji: "🌊" },
  { slug: "dawud", name: "Dawud (David)", emoji: "🛡️" },
  { slug: "sulayman", name: "Sulayman (Solomon)", emoji: "👑" },
  { slug: "yunus", name: "Yunus (Jonah)", emoji: "🐋" },
  { slug: "isa", name: "Isa (Jesus)", emoji: "✨" },
  { slug: "muhammad", name: "Muhammad ﷺ", emoji: "🕌" },
];

function getProphetsByAge(age: AgeGroup) {
  if (age === "little") return prophetList.filter((p) => ["adam", "nuh", "ibrahim", "musa", "muhammad"].includes(p.slug));
  if (age === "explorer") return prophetList.slice(0, 9);
  return prophetList;
}

function ProphetStoriesTab({
  age,
  progress,
  onStar,
  onLessonComplete,
}: {
  age: AgeGroup;
  progress: KidsProgress;
  onStar: () => void;
  onLessonComplete: (id: string) => void;
}) {
  const prophets = useMemo(() => getProphetsByAge(age), [age]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [showLessons, setShowLessons] = useState(false);

  const story = selectedSlug ? prophetStories[selectedSlug] : null;

  if (!selectedSlug || !story) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-themed-muted text-sm mb-4">
          Discover the amazing stories of the prophets sent by Allah!
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {prophets.map((p, i) => {
            const done = progress.completedLessons.includes(`story-${p.slug}`);
            return (
              <ContentCard key={p.slug} delay={0.05 + i * 0.03}>
                <button
                  onClick={() => {
                    setSelectedSlug(p.slug);
                    setSectionIdx(0);
                    setShowLessons(false);
                  }}
                  className="w-full text-center p-2"
                >
                  <span className="text-3xl block mb-1">{p.emoji}</span>
                  <p className="text-sm font-medium text-themed">{p.name}</p>
                  {done && (
                    <span className="text-[10px] text-gold flex items-center justify-center gap-1 mt-1">
                      <Check size={10} /> Complete
                    </span>
                  )}
                </button>
              </ContentCard>
            );
          })}
        </div>
      </div>
    );
  }

  // Story detail
  const sections = story.sections;
  const section = sections[sectionIdx];

  const simplifyContent = (text: string) => {
    if (age === "little") {
      const sentences = text.split(/\.\s+/);
      return sentences.slice(0, 2).join(". ") + ".";
    }
    if (age === "explorer") {
      const sentences = text.split(/\.\s+/);
      return sentences.slice(0, 3).join(". ") + ".";
    }
    return text;
  };

  if (showLessons) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setShowLessons(false)}
          className="flex items-center gap-1 text-sm text-themed-muted hover:text-themed mb-4"
        >
          <ChevronLeft size={16} /> Back to story
        </button>
        <h3 className="text-lg font-semibold text-themed text-center mb-4">
          What did you learn? {story.title.split("—")[0]}
        </h3>
        <div className="space-y-3">
          {story.lessons.map((lesson, i) => (
            <ContentCard key={i} delay={0.05 + i * 0.05}>
              <div className="flex items-start gap-2">
                <Heart size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <p className="text-sm text-themed">{lesson}</p>
              </div>
            </ContentCard>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              onLessonComplete(`story-${selectedSlug}`);
              onStar();
              setSelectedSlug(null);
            }}
            className="px-6 py-2.5 rounded-full bg-gold text-black font-medium text-sm"
          >
            Finish Story <Star size={14} className="inline ml-1" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => setSelectedSlug(null)}
        className="flex items-center gap-1 text-sm text-themed-muted hover:text-themed mb-4"
      >
        <ChevronLeft size={16} /> All Prophets
      </button>

      <h3 className="text-lg font-semibold text-themed text-center mb-1">{story.title}</h3>
      <p className="text-xs text-themed-muted text-center mb-4">
        Part {sectionIdx + 1} of {sections.length}: {section.title}
      </p>

      <ContentCard>
        <h4 className="font-medium text-gold mb-2">{section.title}</h4>
        <p className="text-sm text-themed leading-relaxed mb-3">{simplifyContent(section.content)}</p>

        {section.verses && age !== "little" && section.verses.slice(0, 1).map((v, i) => (
          <div key={i} className="mt-3 p-3 rounded-xl bg-gold/5 border border-gold/20">
            <p className="font-arabic text-base text-right mb-1 leading-loose">{v.arabic}</p>
            <p className="text-xs text-themed-muted italic">{v.translation}</p>
            <p className="text-xs text-gold mt-1">{v.reference}</p>
          </div>
        ))}

      </ContentCard>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setSectionIdx((i) => i - 1)}
          disabled={sectionIdx === 0}
          className="px-4 py-2 rounded-full text-sm card-bg sidebar-border disabled:opacity-30 hover:bg-gold/10 transition"
        >
          <ChevronLeft size={16} className="inline" /> Back
        </button>
        {sectionIdx < sections.length - 1 ? (
          <button
            onClick={() => setSectionIdx((i) => i + 1)}
            className="px-4 py-2 rounded-full text-sm bg-gold text-black font-medium hover:bg-gold/90 transition"
          >
            Next <ChevronRight size={16} className="inline" />
          </button>
        ) : (
          <button
            onClick={() => setShowLessons(true)}
            className="px-4 py-2 rounded-full text-sm bg-gold text-black font-medium hover:bg-gold/90 transition"
          >
            What I Learned
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   VERSE PLAY BUTTON (real reciter audio from CDN)
   ═══════════════════════════════════════════════════════════════════ */

function VersePlayButton({ globalVerseId }: { globalVerseId: number }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = useCallback(() => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }
    const audio = new Audio(
      `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalVerseId}.mp3`
    );
    audioRef.current = audio;
    audio.onplay = () => setPlaying(true);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    audio.play();
  }, [globalVerseId, playing]);

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center justify-center rounded-full p-1.5 transition-all flex-shrink-0 ${
        playing ? "text-gold bg-gold/20" : "text-themed-muted hover:text-gold hover:bg-gold/10"
      }`}
      title="Listen to recitation"
    >
      <Volume2 size={14} />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 5: QURAN CORNER (Memorization Tracker)
   ═══════════════════════════════════════════════════════════════════ */

type MiniSurah = {
  id: number;
  name: string;
  nameAr: string;
  globalStart: number; // global verse ID of first verse (for CDN audio)
  verses: { arabic: string; transliteration: string; meaning: string }[];
};

const miniSurahs: MiniSurah[] = [
  {
    id: 1,
    name: "Al-Fatiha",
    nameAr: "الفاتحة",
    globalStart: 1,
    verses: [
      { arabic: "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ", transliteration: "Bismillahir Rahmanir Raheem", meaning: "In the name of Allah, the Most Gracious, the Most Merciful" },
      { arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", transliteration: "Alhamdu lillahi Rabbil aalameen", meaning: "Praise be to Allah, Lord of all the worlds" },
      { arabic: "الرَّحْمَـٰنِ الرَّحِيمِ", transliteration: "Ar-Rahmanir Raheem", meaning: "The Most Gracious, the Most Merciful" },
      { arabic: "مَالِكِ يَوْمِ الدِّينِ", transliteration: "Maliki yawmid-deen", meaning: "Master of the Day of Judgment" },
      { arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", transliteration: "Iyyaka na'budu wa iyyaka nasta'een", meaning: "You alone we worship, and You alone we ask for help" },
      { arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", transliteration: "Ihdinas siratal mustaqeem", meaning: "Guide us to the straight path" },
      { arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", transliteration: "Siratal ladhina an'amta alayhim, ghayril maghdubi alayhim wa lad-dalleen", meaning: "The path of those You have blessed, not those who earned anger, nor those who went astray" },
    ],
  },
  {
    id: 112,
    name: "Al-Ikhlas",
    nameAr: "الإخلاص",
    globalStart: 6222,
    verses: [
      { arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", transliteration: "Qul huwa Allahu ahad", meaning: "Say: He is Allah, the One" },
      { arabic: "اللَّهُ الصَّمَدُ", transliteration: "Allahus samad", meaning: "Allah, the Eternal Refuge" },
      { arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", transliteration: "Lam yalid wa lam yulad", meaning: "He neither begets nor is born" },
      { arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", transliteration: "Wa lam yakun lahu kufuwan ahad", meaning: "And there is none comparable to Him" },
    ],
  },
  {
    id: 113,
    name: "Al-Falaq",
    nameAr: "الفلق",
    globalStart: 6226,
    verses: [
      { arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", transliteration: "Qul a'udhu bi rabbil falaq", meaning: "Say: I seek refuge in the Lord of daybreak" },
      { arabic: "مِن شَرِّ مَا خَلَقَ", transliteration: "Min sharri ma khalaq", meaning: "From the evil of what He created" },
      { arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", transliteration: "Wa min sharri ghasiqin idha waqab", meaning: "And from the evil of darkness when it settles" },
      { arabic: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", transliteration: "Wa min sharrin naffathati fil uqad", meaning: "And from the evil of the blowers in knots" },
      { arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", transliteration: "Wa min sharri hasidin idha hasad", meaning: "And from the evil of an envier when he envies" },
    ],
  },
  {
    id: 114,
    name: "An-Nas",
    nameAr: "الناس",
    globalStart: 6231,
    verses: [
      { arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", transliteration: "Qul a'udhu bi rabbin nas", meaning: "Say: I seek refuge in the Lord of mankind" },
      { arabic: "مَلِكِ النَّاسِ", transliteration: "Malikin nas", meaning: "The King of mankind" },
      { arabic: "إِلَـٰهِ النَّاسِ", transliteration: "Ilahin nas", meaning: "The God of mankind" },
      { arabic: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", transliteration: "Min sharril waswasil khannas", meaning: "From the evil of the whisperer who withdraws" },
      { arabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", transliteration: "Alladhi yuwaswisu fi sudurin nas", meaning: "Who whispers in the hearts of mankind" },
      { arabic: "مِنَ الْجِنَّةِ وَالنَّاسِ", transliteration: "Minal jinnati wan nas", meaning: "From among jinn and mankind" },
    ],
  },
  {
    id: 108,
    name: "Al-Kawthar",
    nameAr: "الكوثر",
    globalStart: 6205,
    verses: [
      { arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", transliteration: "Inna a'taynakal kawthar", meaning: "Indeed, We have granted you Al-Kawthar" },
      { arabic: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", transliteration: "Fasalli li rabbika wanhar", meaning: "So pray to your Lord and sacrifice" },
      { arabic: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", transliteration: "Inna shani-aka huwal abtar", meaning: "Indeed, your enemy is the one cut off" },
    ],
  },
  {
    id: 110,
    name: "An-Nasr",
    nameAr: "النصر",
    globalStart: 6214,
    verses: [
      { arabic: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", transliteration: "Idha ja-a nasrullahi wal fath", meaning: "When the victory of Allah has come and the conquest" },
      { arabic: "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا", transliteration: "Wa ra-aytan nasa yadkhuluna fi dinillahi afwaja", meaning: "And you see the people entering the religion of Allah in multitudes" },
      { arabic: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا", transliteration: "Fasabbih bihamdi rabbika wastaghfirh, innahu kana tawwaba", meaning: "Then glorify the praises of your Lord and seek His forgiveness. Indeed, He is ever Accepting of repentance" },
    ],
  },
];

function QuranCornerTab({
  progress,
  onStar,
}: {
  progress: KidsProgress;
  onStar: () => void;
}) {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const surah = miniSurahs.find((s) => s.id === selectedSurah);

  if (!selectedSurah || !surah) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-themed-muted text-sm mb-4">
          Memorize short surahs from the Quran! Start with the ones you hear in prayer.
        </p>
        <div className="space-y-3">
          {miniSurahs.map((s, i) => {
            const memorized = progress.memorizedSurahs.includes(s.id);
            return (
              <ContentCard key={s.id} delay={0.05 + i * 0.03}>
                <button
                  onClick={() => setSelectedSurah(s.id)}
                  className="w-full flex items-center gap-3 p-1 text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      memorized ? "bg-gold text-black" : "card-bg sidebar-border text-themed-muted"
                    }`}
                  >
                    {memorized ? <Check size={16} /> : s.id}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-themed">{s.name}</span>
                      <span className="text-sm font-arabic text-themed-muted">{s.nameAr}</span>
                    </div>
                    <p className="text-xs text-themed-muted">{s.verses.length} verses</p>
                  </div>
                  {memorized && (
                    <Star size={16} className="text-gold" fill="currentColor" />
                  )}
                </button>
              </ContentCard>
            );
          })}
        </div>
      </div>
    );
  }

  const handleMemorized = () => {
    const p = getKidsProgress();
    if (!p.memorizedSurahs.includes(surah.id)) {
      updateKidsProgress({ memorizedSurahs: [...p.memorizedSurahs, surah.id] });
      onStar();
      onStar();
      onStar(); // 3 stars for memorizing a surah
    }
    setSelectedSurah(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => setSelectedSurah(null)}
        className="flex items-center gap-1 text-sm text-themed-muted hover:text-themed mb-4"
      >
        <ChevronLeft size={16} /> All Surahs
      </button>

      <h3 className="text-lg font-semibold text-themed text-center mb-1">{surah.name}</h3>
      <p className="text-sm font-arabic text-themed-muted text-center mb-4">{surah.nameAr}</p>

      <div className="space-y-3">
        {surah.verses.map((v, i) => (
          <ContentCard key={i} delay={0.05 + i * 0.03}>
            <div className="text-right mb-2">
              <p className="font-arabic text-xl leading-loose">{v.arabic}</p>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm text-gold">{v.transliteration}</p>
                <p className="text-xs text-themed-muted mt-1">{v.meaning}</p>
              </div>
              <VersePlayButton globalVerseId={surah.globalStart + i} />
            </div>
          </ContentCard>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleMemorized}
          className={`px-6 py-2.5 rounded-full font-medium text-sm transition ${
            progress.memorizedSurahs.includes(surah.id)
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-gold text-black hover:bg-gold/90"
          }`}
        >
          {progress.memorizedSurahs.includes(surah.id) ? (
            <>
              <Check size={14} className="inline mr-1" /> Memorized!
            </>
          ) : (
            <>
              I Memorized This! <Star size={14} className="inline ml-1" />
            </>
          )}
        </button>
      </div>

      {/* Link to full Quran reader */}
      <div className="mt-3 text-center">
        <a href={`/quran/${surah.id}`} className="text-xs text-gold hover:underline">
          <Volume2 size={12} className="inline mr-1" /> Listen with audio in Quran reader
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 6: GOOD DEEDS (Daily Checklist + Streaks)
   ═══════════════════════════════════════════════════════════════════ */

type ChecklistItem = { id: string; label: string; emoji: string; ageMin: AgeGroup };

const checklistItems: ChecklistItem[] = [
  { id: "bismillah", label: "Said Bismillah before eating", emoji: "🍽️", ageMin: "little" },
  { id: "alhamdulillah", label: "Said Alhamdulillah after eating", emoji: "🤲", ageMin: "little" },
  { id: "kind", label: "Was kind to someone", emoji: "💛", ageMin: "little" },
  { id: "prayed", label: "Prayed with family", emoji: "🕌", ageMin: "little" },
  { id: "quran", label: "Read or listened to Quran", emoji: "📖", ageMin: "little" },
  { id: "salam", label: "Greeted someone with Salam", emoji: "👋", ageMin: "explorer" },
  { id: "dua", label: "Made a special dua", emoji: "🌟", ageMin: "explorer" },
  { id: "helped", label: "Helped someone in need", emoji: "🤝", ageMin: "explorer" },
  { id: "dhikr", label: "Did dhikr (remembrance of Allah)", emoji: "📿", ageMin: "scholar" },
  { id: "learned", label: "Learned something new about Islam", emoji: "📚", ageMin: "scholar" },
  { id: "sunnah", label: "Followed a Sunnah of the Prophet ﷺ", emoji: "☀️", ageMin: "scholar" },
  { id: "charity", label: "Gave charity or shared something", emoji: "🎁", ageMin: "scholar" },
];

function getChecklistByAge(age: AgeGroup) {
  const ageOrder: AgeGroup[] = ["little", "explorer", "scholar"];
  const maxIdx = ageOrder.indexOf(age);
  return checklistItems.filter((item) => ageOrder.indexOf(item.ageMin) <= maxIdx);
}

function GoodDeedsTab({
  age,
  progress,
}: {
  age: AgeGroup;
  progress: KidsProgress;
}) {
  const today = new Date().toISOString().split("T")[0];
  const items = useMemo(() => getChecklistByAge(age), [age]);
  const [localChecklist, setLocalChecklist] = useState(progress.dailyChecklist);

  const checkedCount = items.filter((item) => localChecklist[`${today}:${item.id}`]).length;
  const total = items.length;

  const handleToggle = (itemId: string) => {
    toggleKidsChecklist(itemId, today);
    const updated = getKidsProgress().dailyChecklist;
    setLocalChecklist(updated);
    updateKidsStreak();
  };

  // Calculate this week's deeds
  const weekDeeds = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      count += items.filter((item) => localChecklist[`${d}:${item.id}`]).length;
    }
    return count;
  }, [localChecklist, items]);

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-center text-themed-muted text-sm mb-2">
        Check off the good deeds you do each day!
      </p>

      {/* Stats banner */}
      <div className="flex items-center justify-center gap-6 mb-4 p-3 rounded-xl card-bg sidebar-border">
        <div className="text-center">
          <p className="text-lg font-semibold text-gold">{checkedCount}/{total}</p>
          <p className="text-[10px] text-themed-muted">Today</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-orange-400 flex items-center justify-center gap-1">
            <Flame size={16} fill="currentColor" />
            {progress.streak}
          </p>
          <p className="text-[10px] text-themed-muted">Day streak</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-themed">{weekDeeds}</p>
          <p className="text-[10px] text-themed-muted">This week</p>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {items.map((item, i) => {
          const checked = !!localChecklist[`${today}:${item.id}`];
          return (
            <motion.button
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                checked
                  ? "bg-gold/10 border-gold/30"
                  : "card-bg sidebar-border hover:bg-gold/5"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  checked ? "border-gold bg-gold" : "border-themed-muted"
                }`}
                animate={checked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {checked && <Check size={14} className="text-black" />}
              </motion.div>
              <span className="text-lg">{item.emoji}</span>
              <span className={`text-sm flex-1 ${checked ? "text-gold" : "text-themed"}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-gold/5 border border-gold/20 text-center">
        <Lightbulb size={14} className="inline text-gold mr-1" />
        <span className="text-xs text-themed-muted">
          <strong>Learn Together:</strong> Go through the checklist with your child at bedtime and celebrate their good deeds!
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 7: CHALLENGES (Quizzes + Matching Games)
   ═══════════════════════════════════════════════════════════════════ */

type ChallengeQuestion = {
  id: string;
  type: "multiple-choice" | "true-false" | "matching";
  category: string;
  difficulty: AgeGroup;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const challengeQuestions: ChallengeQuestion[] = [
  // Little (4-6)
  { id: "c1", type: "multiple-choice", category: "basics", difficulty: "little", question: "Who created everything?", options: ["People", "Allah", "Animals", "The sun"], answer: 1, explanation: "Allah created everything — the heavens, the earth, and all living things." },
  { id: "c2", type: "true-false", category: "basics", difficulty: "little", question: "Muslims pray 3 times a day.", options: ["True", "False"], answer: 1, explanation: "Muslims pray 5 times a day, not 3!" },
  { id: "c3", type: "multiple-choice", category: "prophets", difficulty: "little", question: "Who was the first human?", options: ["Nuh", "Musa", "Adam", "Ibrahim"], answer: 2, explanation: "Prophet Adam was the first human created by Allah." },
  { id: "c4", type: "multiple-choice", category: "daily", difficulty: "little", question: "What do we say before eating?", options: ["Alhamdulillah", "SubhanAllah", "Bismillah", "MashAllah"], answer: 2, explanation: "We say 'Bismillah' (In the name of Allah) before eating." },
  { id: "c5", type: "true-false", category: "basics", difficulty: "little", question: "The Quran is the holy book of Muslims.", options: ["True", "False"], answer: 0, explanation: "Yes! The Quran is the word of Allah, revealed to Prophet Muhammad ﷺ." },

  // Explorer (7-9)
  { id: "c6", type: "multiple-choice", category: "pillars", difficulty: "explorer", question: "Which is NOT a pillar of Islam?", options: ["Salah", "Zakat", "Reading books", "Hajj"], answer: 2, explanation: "The five pillars are: Shahada, Salah, Zakat, Sawm (fasting), and Hajj." },
  { id: "c7", type: "multiple-choice", category: "quran", difficulty: "explorer", question: "How many surahs are in the Quran?", options: ["100", "114", "120", "99"], answer: 1, explanation: "There are 114 surahs (chapters) in the Quran." },
  { id: "c8", type: "true-false", category: "prophets", difficulty: "explorer", question: "Prophet Ibrahim built the Kaaba with his son Ismail.", options: ["True", "False"], answer: 0, explanation: "Yes! Allah commanded Ibrahim and Ismail to build the Kaaba in Makkah." },
  { id: "c9", type: "multiple-choice", category: "daily", difficulty: "explorer", question: "What does 'Astaghfirullah' mean?", options: ["Thank you", "I seek forgiveness from Allah", "Goodbye", "Good morning"], answer: 1, explanation: "Astaghfirullah means 'I seek forgiveness from Allah.' We say it when we make mistakes." },
  { id: "c10", type: "multiple-choice", category: "quran", difficulty: "explorer", question: "Which surah is recited in every prayer?", options: ["Al-Ikhlas", "An-Nas", "Al-Fatiha", "Al-Baqarah"], answer: 2, explanation: "Surah Al-Fatiha is recited in every unit (raka'ah) of prayer." },

  // Scholar (10-12)
  { id: "c11", type: "multiple-choice", category: "pillars", difficulty: "scholar", question: "What is the minimum amount of wealth (nisab) for Zakat calculated on?", options: ["Gold and silver", "Only cash", "Only land", "Food only"], answer: 0, explanation: "Nisab is traditionally calculated based on the value of gold (85g) or silver (595g)." },
  { id: "c12", type: "true-false", category: "quran", difficulty: "scholar", question: "The Quran was revealed over a period of 23 years.", options: ["True", "False"], answer: 0, explanation: "The Quran was revealed to Prophet Muhammad ﷺ over approximately 23 years." },
  { id: "c13", type: "multiple-choice", category: "prophets", difficulty: "scholar", question: "Which prophet was swallowed by a whale?", options: ["Dawud", "Yunus", "Sulayman", "Ilyas"], answer: 1, explanation: "Prophet Yunus (Jonah) was swallowed by a whale after leaving his people." },
  { id: "c14", type: "multiple-choice", category: "pillars", difficulty: "scholar", question: "On which day of Hajj do pilgrims stand at Arafat?", options: ["8th Dhul Hijjah", "9th Dhul Hijjah", "10th Dhul Hijjah", "12th Dhul Hijjah"], answer: 1, explanation: "Standing at Arafat on the 9th of Dhul Hijjah is the most important pillar of Hajj." },
  { id: "c15", type: "true-false", category: "basics", difficulty: "scholar", question: "Tawheed means the oneness of Allah.", options: ["True", "False"], answer: 0, explanation: "Tawheed is the fundamental Islamic concept of monotheism — the absolute oneness of Allah." },
];

function ChallengesTab({
  age,
  progress,
  onStar,
}: {
  age: AgeGroup;
  progress: KidsProgress;
  onStar: () => void;
}) {
  const ageOrder: AgeGroup[] = ["little", "explorer", "scholar"];
  const maxIdx = ageOrder.indexOf(age);
  const questions = useMemo(
    () => challengeQuestions.filter((q) => ageOrder.indexOf(q.difficulty) <= maxIdx),
    [age, maxIdx]
  );

  const [started, setStarted] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Shuffle questions
  const [shuffled, setShuffled] = useState<ChallengeQuestion[]>([]);
  const quizLen = Math.min(10, questions.length);

  const startQuiz = () => {
    const s = [...questions].sort(() => Math.random() - 0.5).slice(0, quizLen);
    setShuffled(s);
    setStarted(true);
    setQIdx(0);
    setAnswer(null);
    setScore(0);
    setFinished(false);
  };

  const handleAnswer = (idx: number) => {
    if (answer !== null) return;
    setAnswer(idx);
    if (idx === shuffled[qIdx].answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (qIdx + 1 < shuffled.length) {
      setQIdx((i) => i + 1);
      setAnswer(null);
    } else {
      setFinished(true);
      const finalScore = score + (answer === shuffled[qIdx].answer ? 1 : 0);
      if (finalScore === shuffled.length) {
        onStar();
        onStar(); // 2 stars for perfect score
      }
    }
  };

  if (!started || finished) {
    const pct = finished ? Math.round(((score + (answer === shuffled[qIdx]?.answer ? 1 : 0)) / shuffled.length) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto text-center">
        {finished ? (
          <ContentCard>
            <Trophy size={48} className="mx-auto text-gold mb-3" />
            <h3 className="text-xl font-semibold text-themed mb-2">Challenge Complete!</h3>
            <p className="text-3xl font-bold text-gold mb-1">{pct}%</p>
            <p className="text-sm text-themed-muted mb-4">
              You got {score + (answer === shuffled[qIdx]?.answer ? 1 : 0)} out of {shuffled.length} correct!
            </p>
            {pct === 100 && (
              <p className="text-sm text-gold mb-3">
                <Star size={14} className="inline mr-1" fill="currentColor" />
                Perfect score! +2 stars
              </p>
            )}
            <button
              onClick={startQuiz}
              className="px-6 py-2.5 rounded-full bg-gold text-black font-medium text-sm"
            >
              <RotateCcw size={14} className="inline mr-1" /> Try Again
            </button>
          </ContentCard>
        ) : (
          <>
            <p className="text-themed-muted text-sm mb-6">
              Test your Islamic knowledge with fun challenges!
            </p>
            <ContentCard>
              <Sparkles size={48} className="mx-auto text-gold mb-3" />
              <h3 className="text-lg font-semibold text-themed mb-2">Ready for a Challenge?</h3>
              <p className="text-sm text-themed-muted mb-4">
                {quizLen} questions about Islam. Get a perfect score for bonus stars!
              </p>
              <button
                onClick={startQuiz}
                className="px-6 py-2.5 rounded-full bg-gold text-black font-medium text-sm"
              >
                Start Challenge!
              </button>
            </ContentCard>
          </>
        )}
      </div>
    );
  }

  const q = shuffled[qIdx];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-themed-muted">
          Question {qIdx + 1} of {shuffled.length}
        </span>
        <span className="text-sm text-gold font-medium">{score} correct</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-themed-muted/20 mb-4">
        <motion.div
          className="h-full rounded-full bg-gold"
          initial={{ width: 0 }}
          animate={{ width: `${((qIdx + 1) / shuffled.length) * 100}%` }}
        />
      </div>

      <ContentCard>
        <p className="font-medium text-themed mb-4">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, oi) => {
            let cls = "card-bg sidebar-border hover:bg-gold/10";
            if (answer !== null) {
              if (oi === q.answer) cls = "bg-green-500/20 border-green-500/50";
              else if (oi === answer && oi !== q.answer) cls = "bg-red-500/20 border-red-500/50";
            }
            return (
              <button
                key={oi}
                onClick={() => handleAnswer(oi)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {answer !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3"
          >
            <p className={`text-sm font-medium ${answer === q.answer ? "text-green-400" : "text-red-400"}`}>
              {answer === q.answer ? "Correct!" : "Not quite!"}
            </p>
            <p className="text-xs text-themed-muted mt-1">{q.explanation}</p>
            <button
              onClick={handleNext}
              className="mt-3 px-4 py-2 rounded-full bg-gold text-black text-sm font-medium"
            >
              {qIdx + 1 < shuffled.length ? "Next Question" : "See Results"}
            </button>
          </motion.div>
        )}
      </ContentCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BADGE CHECKER
   ═══════════════════════════════════════════════════════════════════ */

function checkBadges(p: KidsProgress): string[] {
  const newBadges: string[] = [];
  if (p.completedLessons.length >= 1 && !p.badges.includes("first-steps")) newBadges.push("first-steps");
  if (p.memorizedSurahs.length >= 3 && !p.badges.includes("quran-reader")) newBadges.push("quran-reader");
  if (Object.values(p.flashcardBuckets).filter((b) => b === 2).length >= 20 && !p.badges.includes("word-master")) newBadges.push("word-master");
  if (p.streak >= 7 && !p.badges.includes("streak-7")) newBadges.push("streak-7");
  if (pillarsData.every((pl) => p.completedLessons.includes(`pillar-${pl.id}`)) && !p.badges.includes("pillar-pro")) newBadges.push("pillar-pro");
  if (p.completedLessons.filter((l) => l.startsWith("story-")).length >= 5 && !p.badges.includes("story-explorer")) newBadges.push("story-explorer");
  return newBadges;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function KidsLearningPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("who-is-allah");
  const [progress, setProgress] = useState<KidsProgress | null>(null);
  const [showStarBurst, setShowStarBurst] = useState(false);
  const [showBadgePopup, setShowBadgePopup] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load progress on mount
  useEffect(() => {
    setProgress(getKidsProgress());
  }, []);

  const refreshProgress = useCallback(() => {
    setProgress(getKidsProgress());
  }, []);

  const handleStar = useCallback(() => {
    addKidsStars(1);
    updateKidsStreak();
    setShowStarBurst(true);
    refreshProgress();
    // Check badges
    const p = getKidsProgress();
    const newBadges = checkBadges(p);
    newBadges.forEach((b) => addKidsBadge(b));
    if (newBadges.length > 0) {
      refreshProgress();
      setTimeout(() => {
        setShowBadgePopup(newBadges[0]);
        setShowConfetti(true);
      }, 1600);
    }
  }, [refreshProgress]);

  const handleLessonComplete = useCallback(
    (id: string) => {
      markKidsLessonComplete(id);
      updateKidsStreak();
      refreshProgress();
    },
    [refreshProgress]
  );

  const handleAgeChange = useCallback(
    (age: AgeGroup) => {
      updateKidsProgress({ ageGroup: age });
      refreshProgress();
    },
    [refreshProgress]
  );

  if (!progress) return null;

  return (
    <div className="pb-24">
      <PageHeader
        title="Kids Learning"
        titleAr="تعليم الأطفال"
        subtitle="A fun way for parents and children to learn Islam together"
      />

      <div className="max-w-5xl mx-auto px-4">

      <AgeGroupSelector value={progress.ageGroup} onChange={handleAgeChange} />
      <ProgressDashboard progress={progress} />

      <TabBar
        tabs={tabs.map((t) => ({ key: t.key, label: t.label }))}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as TabKey)}
        mobileThreshold={5}
      />

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "who-is-allah" && (
              <WhoIsAllahTab age={progress.ageGroup} progress={progress} onStar={handleStar} />
            )}
            {activeTab === "five-pillars" && (
              <FivePillarsTab age={progress.ageGroup} progress={progress} onStar={handleStar} onLessonComplete={handleLessonComplete} />
            )}
            {activeTab === "daily-words" && (
              <DailyWordsTab age={progress.ageGroup} progress={progress} onStar={handleStar} />
            )}
            {activeTab === "prophet-stories" && (
              <ProphetStoriesTab age={progress.ageGroup} progress={progress} onStar={handleStar} onLessonComplete={handleLessonComplete} />
            )}
            {activeTab === "quran-corner" && (
              <QuranCornerTab progress={progress} onStar={handleStar} />
            )}
            {activeTab === "good-deeds" && (
              <GoodDeedsTab age={progress.ageGroup} progress={progress} />
            )}
            {activeTab === "challenges" && (
              <ChallengesTab age={progress.ageGroup} progress={progress} onStar={handleStar} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* StarBurst celebration overlay */}
      <AnimatePresence>
        <StarBurst show={showStarBurst} onDone={() => setShowStarBurst(false)} />
      </AnimatePresence>

      {/* Confetti on badge unlock */}
      <Confetti show={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Badge unlock popup */}
      <AnimatePresence>
        {showBadgePopup && (
          <motion.div
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-gold text-black font-medium text-sm shadow-lg flex items-center gap-2"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <Award size={18} />
            Badge unlocked: {badgeDefs.find((b) => b.id === showBadgePopup)?.name}!
            <button onClick={() => setShowBadgePopup(null)} className="ml-2">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
