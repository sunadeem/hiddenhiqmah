"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import namesOfAllah from "@hidden-hiqmah/content/names-of-allah";
import { prophetStories } from "@hidden-hiqmah/content/prophet-stories";
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
} from "@hidden-hiqmah/ui/lib/storage";
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
  ArrowLeft,
  Landmark,
  MessageCircle,
  ScrollText,
  BookOpen,
  ListChecks,
  ShieldCheck,
  PersonStanding,
  Hand,
  Smile,
  Users,
  Moon,
  Languages,
  type LucideIcon,
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
   LESSONS (card-grid landing)
   Keys are stable — old ?tab= deep links depend on them; never rename.
   ═══════════════════════════════════════════════════════════════════ */

type TabKey =
  | "who-is-allah"
  | "iman-pillars"
  | "five-pillars"
  | "lets-pray"
  | "my-duas"
  | "daily-words"
  | "good-manners"
  | "prophet-stories"
  | "heroes"
  | "quran-corner"
  | "good-deeds"
  | "special-days"
  | "arabic-alphabet"
  | "challenges";

type LessonDef = {
  key: TabKey;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Full literal Tailwind classes — never assemble these dynamically (JIT scan). */
  chipClass: string;
  /** Cheap progress hint shown on the landing card; null = no hint. */
  hint: (p: KidsProgress, age: AgeGroup) => string | null;
};

const lessons: LessonDef[] = [
  {
    key: "who-is-allah",
    label: "Who is Allah?",
    description: "Flip the cards to learn Allah's beautiful names",
    icon: Sparkles,
    chipClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    hint: (_p, age) => `${getNamesByAge(age).length} names to explore`,
  },
  {
    key: "iman-pillars",
    label: "What We Believe",
    description: "The six things a Muslim believes in — the pillars of iman",
    icon: ShieldCheck,
    chipClass: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    hint: (p) => {
      const done = imanData.filter((a) => p.completedLessons.includes(`iman-${a.id}`)).length;
      return `${done} of ${imanData.length} complete`;
    },
  },
  {
    key: "five-pillars",
    label: "The 5 Pillars",
    description: "Discover the five pillars of Islam, then take the quiz",
    icon: Landmark,
    chipClass: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    hint: (p) => {
      const done = pillarsData.filter((pl) => p.completedLessons.includes(`pillar-${pl.id}`)).length;
      return `${done} of ${pillarsData.length} complete`;
    },
  },
  {
    key: "lets-pray",
    label: "Let's Pray!",
    description: "Learn wudu and how to pray, step by step",
    icon: PersonStanding,
    chipClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    hint: () => null,
  },
  {
    key: "my-duas",
    label: "My First Duas",
    description: "Little duas for eating, sleeping, and every day",
    icon: Hand,
    chipClass: "bg-lime-500/15 text-lime-500 border-lime-500/30",
    hint: (_p, age) => `${getDuasByAge(age).length} duas to learn`,
  },
  {
    key: "daily-words",
    label: "Daily Words",
    description: "Everyday Islamic words and phrases to practice",
    icon: MessageCircle,
    chipClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    hint: (p) => {
      const mastered = Object.values(p.flashcardBuckets).filter((b) => b === 2).length;
      return `${mastered} mastered`;
    },
  },
  {
    key: "good-manners",
    label: "Good Manners",
    description: "Be like the Prophet ﷺ — kindness, honesty, and mercy",
    icon: Smile,
    chipClass: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    hint: (p) => {
      const done = mannersData.filter((m) => p.completedLessons.includes(`manner-${m.id}`)).length;
      return `${done} of ${mannersData.length} learned`;
    },
  },
  {
    key: "prophet-stories",
    label: "Prophet Stories",
    description: "Read the amazing stories of the prophets",
    icon: ScrollText,
    chipClass: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    hint: (p, age) => {
      const total = getProphetsByAge(age).length;
      const done = Math.min(total, p.completedLessons.filter((l) => l.startsWith("story-")).length);
      return `${done} of ${total} stories`;
    },
  },
  {
    key: "heroes",
    label: "Heroes of Islam",
    description: "Amazing companions and family of the Prophet ﷺ",
    icon: Users,
    chipClass: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    hint: (p) => {
      const done = heroStories.filter((h) => p.completedLessons.includes(`hero-${h.slug}`)).length;
      return `${done} of ${heroStories.length} heroes`;
    },
  },
  {
    key: "quran-corner",
    label: "Quran Corner",
    description: "Memorize short surahs, verse by verse",
    icon: BookOpen,
    chipClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    hint: (p) => `${p.memorizedSurahs.length} of ${miniSurahs.length} memorized`,
  },
  {
    key: "arabic-alphabet",
    label: "Arabic Letters",
    description: "Meet the 28 letters that make up the Quran",
    icon: Languages,
    chipClass: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
    hint: () => `${arabicLetters.length} letters`,
  },
  {
    key: "good-deeds",
    label: "Good Deeds",
    description: "Check off your good deeds and grow your streak",
    icon: ListChecks,
    chipClass: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    hint: (p) => {
      const today = new Date().toISOString().split("T")[0];
      const doneToday = Object.entries(p.dailyChecklist).filter(
        ([k, v]) => v && k.startsWith(`${today}:`)
      ).length;
      return doneToday > 0 ? `${doneToday} deeds today` : `${p.streak} day streak`;
    },
  },
  {
    key: "special-days",
    label: "Special Days",
    description: "Ramadan, the two Eids, and the Islamic calendar",
    icon: Moon,
    chipClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    hint: () => null,
  },
  {
    key: "challenges",
    label: "Challenges",
    description: "Test your knowledge — perfect scores earn bonus stars",
    icon: Trophy,
    chipClass: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
    hint: () => null,
  },
];

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
    <div className="flex">
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

type ModuleTopic = {
  id: string;
  name: string;
  nameAr?: string;
  icon: string;
  /** Optional source ref line (e.g. "Bukhari 78:121") shown under the lesson. */
  source?: string;
  descriptions: { little: string; explorer: string; scholar: string };
  /** Heading above the numbered list; defaults to "Steps to follow". */
  stepsLabel?: string;
  steps: { little: string[]; explorer: string[]; scholar: string[] };
  quiz: { q: string; options: string[]; answer: number; explanation: string }[];
};

// The 5 Pillars keep this concrete alias so existing references read clearly.
type PillarData = ModuleTopic & { nameAr: string };

/* ───────── The Six Pillars of Iman (What We Believe) ─────────
   Anchor: the hadith of Jibril — "That you affirm your faith in Allah, in His
   angels, in His Books, in His Apostles, in the Day of Judgment, and you affirm
   your faith in the Divine Decree about good and evil" (Muslim 1:1). */
const imanData: ModuleTopic[] = [
  {
    id: "allah",
    name: "Believe in Allah",
    nameAr: "الإيمان بالله",
    icon: "🌟",
    stepsLabel: "Good to know",
    source: "Muslim 1:1; Bukhari 54:23",
    descriptions: {
      little: "We believe in one God, Allah. He made everything and loves us.",
      explorer: "The first thing a Muslim believes is that Allah is One. He has no partner, He made everything, and nothing is like Him.",
      scholar: "Believing in Allah means believing He alone is the Creator, that He alone deserves worship (Tawheed), and in His beautiful names and perfect attributes. The Prophet ﷺ said Allah has ninety-nine names, and whoever learns them will enter Paradise.",
    },
    steps: {
      little: ["Allah is One", "Allah made everything", "We love and worship only Allah"],
      explorer: ["Allah is One, with no partner", "Nothing is like Allah", "Allah has beautiful names, like Ar-Rahman (the Most Merciful)"],
      scholar: ["Allah alone created and sustains everything", "Worship belongs to Allah alone (Tawheed)", "Allah has ninety-nine beautiful names", "Nothing is comparable to Him"],
    },
    quiz: [
      { q: "How many gods do Muslims believe in?", options: ["One", "Two", "Three", "Many"], answer: 0, explanation: "A Muslim believes in only one God — Allah, with no partner." },
      { q: "How many beautiful names does Allah have?", options: ["10", "50", "99", "100"], answer: 2, explanation: "The Prophet ﷺ said Allah has ninety-nine names (Bukhari 54:23)." },
    ],
  },
  {
    id: "angels",
    name: "Believe in the Angels",
    nameAr: "الإيمان بالملائكة",
    icon: "😇",
    stepsLabel: "Good to know",
    source: "Muslim 1:1; Muslim 55:78",
    descriptions: {
      little: "Allah made angels from light. They always obey Allah.",
      explorer: "We believe Allah created angels from light. They never disobey Allah and each has a special job, like Jibril who brought Allah's words to the prophets.",
      scholar: "Angels are a creation of Allah made from light who never tire of worshipping Him and always do exactly what He commands. Among them are Jibril, who brought revelation, and the angels who record our good and bad deeds.",
    },
    steps: {
      little: ["Angels are made of light", "Angels always obey Allah", "Angel Jibril brought Allah's words"],
      explorer: ["Angels were created from light", "They never disobey Allah", "Jibril brought revelation to the prophets", "Two angels write down our deeds"],
      scholar: ["Angels are made of light and never tire of worship", "They obey Allah's commands perfectly", "Jibril is the angel of revelation", "The recording angels write our good and bad deeds"],
    },
    quiz: [
      { q: "What did Allah create the angels from?", options: ["Fire", "Clay", "Light", "Water"], answer: 2, explanation: "The Prophet ﷺ said the angels were created from light (Muslim 55:78)." },
      { q: "Which angel brought Allah's words to the prophets?", options: ["Jibril", "Adam", "Bilal", "Nuh"], answer: 0, explanation: "The angel Jibril (Gabriel) brought revelation to the prophets." },
    ],
  },
  {
    id: "books",
    name: "Believe in the Books",
    nameAr: "الإيمان بالكتب",
    icon: "📖",
    stepsLabel: "Good to know",
    source: "Muslim 1:1",
    descriptions: {
      little: "Allah sent holy books to teach people. The Quran is the last one.",
      explorer: "Allah sent holy books to His messengers to guide people. The Quran, given to Prophet Muhammad ﷺ, is the final book, and Allah has promised to protect it.",
      scholar: "We believe Allah revealed books to His messengers — including the Tawrah to Musa, the Injil to Isa, and the Zabur to Dawud. The Quran is the final revelation to Muhammad ﷺ, and Allah has guaranteed to preserve it unchanged.",
    },
    steps: {
      little: ["Allah sent holy books", "The Quran is Allah's last book", "We read and respect the Quran"],
      explorer: ["Allah gave books to His messengers", "The Quran was given to Prophet Muhammad ﷺ", "The Quran is the final book", "Allah protects the Quran forever"],
      scholar: ["Allah revealed books such as the Tawrah, Injil and Zabur", "The Quran is the final revelation", "The Quran confirms and completes the earlier messages", "Allah has promised to preserve the Quran"],
    },
    quiz: [
      { q: "Which is the final book Allah revealed?", options: ["The Zabur", "The Injil", "The Quran", "The Tawrah"], answer: 2, explanation: "The Quran, given to Prophet Muhammad ﷺ, is the final book from Allah." },
    ],
  },
  {
    id: "messengers",
    name: "Believe in the Messengers",
    nameAr: "الإيمان بالرسل",
    icon: "🕌",
    stepsLabel: "Good to know",
    source: "Muslim 1:1",
    descriptions: {
      little: "Allah sent prophets to teach us about Him. Muhammad ﷺ is the last one.",
      explorer: "We believe Allah sent many prophets and messengers — like Adam, Nuh, Ibrahim, Musa, and Isa — to guide people. Muhammad ﷺ is the final messenger for everyone.",
      scholar: "Belief in the messengers means believing Allah sent prophets to every people to call them to worship Him alone. We love and follow them all, and we believe Muhammad ﷺ is the last of them, sent to all of humankind.",
    },
    steps: {
      little: ["Allah sent prophets to teach us", "We love all the prophets", "Muhammad ﷺ is the last prophet"],
      explorer: ["Allah sent many prophets to guide people", "We believe in all of them", "Muhammad ﷺ is the final messenger", "We follow the Prophet's example"],
      scholar: ["Allah sent messengers to every nation", "They all called to worship Allah alone", "We believe in and love every prophet", "Muhammad ﷺ is the final messenger to all people"],
    },
    quiz: [
      { q: "Who is the final messenger of Allah?", options: ["Ibrahim", "Isa", "Muhammad ﷺ", "Musa"], answer: 2, explanation: "Prophet Muhammad ﷺ is the last messenger, sent to all people." },
    ],
  },
  {
    id: "last-day",
    name: "Believe in the Last Day",
    nameAr: "الإيمان باليوم الآخر",
    icon: "⏳",
    stepsLabel: "Good to know",
    source: "Muslim 1:1",
    descriptions: {
      little: "One day this world will end and Allah will bring everyone back to life.",
      explorer: "We believe in the Last Day — a day when this world will end, everyone will be raised again, and Allah will reward the good and be just with everyone.",
      scholar: "Belief in the Last Day includes believing in resurrection after death, the Day of Judgment when our deeds are weighed, and the reality of Paradise (Jannah) and the Fire. It reminds us that every good and bad deed matters.",
    },
    steps: {
      little: ["This world will end one day", "Allah will bring everyone back to life", "Good deeds bring us to Paradise"],
      explorer: ["One day the world will end", "Everyone will be raised again", "Our deeds will be weighed", "Allah rewards good with Paradise"],
      scholar: ["We will be resurrected after death", "Our deeds are weighed on the Day of Judgment", "Paradise and the Fire are real", "Every deed, big or small, counts"],
    },
    quiz: [
      { q: "What happens on the Last Day?", options: ["Nothing", "Everyone is raised again and judged", "The sun gets bigger", "People go to sleep"], answer: 1, explanation: "On the Last Day everyone is raised again and Allah judges all our deeds." },
    ],
  },
  {
    id: "qadar",
    name: "Believe in Qadar",
    nameAr: "الإيمان بالقدر",
    icon: "🤲",
    stepsLabel: "Good to know",
    source: "Muslim 1:1",
    descriptions: {
      little: "Allah knows everything and everything happens because Allah allows it.",
      explorer: "Qadar means Allah's decree. We believe Allah knows everything that will happen, and nothing happens except by His knowledge and permission — so we trust Allah and still try our best.",
      scholar: "Belief in Qadar is to believe that Allah knows all things, wrote them down, and that nothing happens except by His will. It teaches us to try our best, trust Allah with the outcome, be patient in hardship, and grateful in ease.",
    },
    steps: {
      little: ["Allah knows everything", "Everything happens by Allah's plan", "We trust Allah always"],
      explorer: ["Allah knows all that will happen", "Nothing happens without Allah allowing it", "We do our best and trust Allah", "We stay patient when things are hard"],
      scholar: ["Allah knows and has written all things", "Nothing occurs except by His will", "We take action and trust the result to Allah", "Patience in hardship, gratitude in ease"],
    },
    quiz: [
      { q: "What does believing in Qadar teach us?", options: ["To give up", "To try our best and trust Allah", "That deeds don't matter", "To worry a lot"], answer: 1, explanation: "Believing in Qadar means we do our best and trust Allah with the result." },
    ],
  },
];

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

/**
 * Generic "pick a topic → read a description + steps → take the quiz" lesson.
 * Powers the 5 Pillars, the 6 Pillars of Iman, and Good Manners so the pattern
 * (and the perfect-score star logic) lives in one place.
 */
function ModuleLessonTab({
  age,
  progress,
  onStar,
  onLessonComplete,
  topics,
  prefix,
  intro,
  backLabel,
  learnTogether,
  showIconRow = true,
}: {
  age: AgeGroup;
  progress: KidsProgress;
  onStar: () => void;
  onLessonComplete: (id: string) => void;
  topics: ModuleTopic[];
  /** completedLessons id prefix, e.g. "pillar" → "pillar-salah". */
  prefix: string;
  intro: string;
  backLabel: string;
  learnTogether: string;
  showIconRow?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const topic = topics.find((t) => t.id === selectedId);

  const handleStartQuiz = () => {
    setQuizMode(true);
    setQuizIdx(0);
    setQuizAnswer(null);
    setQuizScore(0);
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(optionIdx);
    if (topic && optionIdx === topic.quiz[quizIdx].answer) {
      setQuizScore((s) => s + 1);
    }
  };

  const handleQuizNext = () => {
    if (!topic) return;
    if (quizIdx + 1 < topic.quiz.length) {
      setQuizIdx((i) => i + 1);
      setQuizAnswer(null);
    } else {
      const perfect = quizScore + (quizAnswer === topic.quiz[quizIdx].answer ? 1 : 0) === topic.quiz.length;
      if (perfect) onStar();
      onLessonComplete(`${prefix}-${topic.id}`);
      setQuizMode(false);
      setSelectedId(null);
    }
  };

  if (!selectedId) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-themed-muted text-sm mb-4">{intro}</p>

        {showIconRow && (
          <div className="flex justify-center flex-wrap gap-3 mb-6">
            {topics.map((t) => {
              const done = progress.completedLessons.includes(`${prefix}-${t.id}`);
              return (
                <div key={t.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      done ? "bg-gold text-black" : "card-bg sidebar-border"
                    }`}
                  >
                    {done ? <Check size={16} /> : t.icon}
                  </div>
                  <span className="text-[10px] text-themed-muted mt-1">{t.name}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          {topics.map((t, i) => {
            const done = progress.completedLessons.includes(`${prefix}-${t.id}`);
            return (
              <ContentCard key={t.id} delay={0.05 + i * 0.05}>
                <button
                  onClick={() => setSelectedId(t.id)}
                  className="w-full text-left flex items-start gap-3 p-1"
                >
                  <span className="text-2xl">{t.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-themed">{t.name}</h3>
                      {t.nameAr && (
                        <span className="text-xs font-arabic text-themed-muted">{t.nameAr}</span>
                      )}
                      {done && (
                        <span className="ml-auto text-gold text-xs flex items-center gap-1">
                          <Check size={12} /> Done
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-themed-muted mt-1">{t.descriptions[age]}</p>
                  </div>
                </button>
              </ContentCard>
            );
          })}
        </div>
      </div>
    );
  }

  if (!topic) return null;

  if (quizMode) {
    const q = topic.quiz[quizIdx];
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => { setQuizMode(false); setSelectedId(null); }}
          className="flex items-center gap-1 text-sm text-themed-muted hover:text-themed mb-4"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h3 className="font-semibold text-themed text-center mb-1">
          {topic.icon} {topic.name} Quiz
        </h3>
        <p className="text-xs text-themed-muted text-center mb-4">
          Question {quizIdx + 1} of {topic.quiz.length}
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
                {quizIdx + 1 < topic.quiz.length ? "Next Question" : "Finish Quiz"}
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
        onClick={() => setSelectedId(null)}
        className="flex items-center gap-1 text-sm text-themed-muted hover:text-themed mb-4"
      >
        <ChevronLeft size={16} /> {backLabel}
      </button>

      <h3 className="text-xl font-semibold text-themed text-center mb-1">
        {topic.icon} {topic.name}
      </h3>
      {topic.nameAr && (
        <p className="text-xs font-arabic text-themed-muted text-center mb-4">{topic.nameAr}</p>
      )}

      <ContentCard>
        <p className="text-sm text-themed leading-relaxed mb-4">{topic.descriptions[age]}</p>
        <h4 className="text-sm font-semibold text-gold mb-2">{topic.stepsLabel ?? "Steps to follow"}:</h4>
        <ol className="space-y-2">
          {topic.steps[age].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-themed">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center font-medium">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        {topic.source && (
          <p className="text-[11px] text-themed-muted mt-3 italic">Source: {topic.source}</p>
        )}
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
          <strong>Learn Together:</strong> {learnTogether}
        </span>
      </div>
    </div>
  );
}

function FivePillarsTab(props: {
  age: AgeGroup;
  progress: KidsProgress;
  onStar: () => void;
  onLessonComplete: (id: string) => void;
}) {
  return (
    <ModuleLessonTab
      {...props}
      topics={pillarsData}
      prefix="pillar"
      intro="Islam is built on five pillars. Learn about each one!"
      backLabel="All Pillars"
      learnTogether="Ask your child to explain this pillar in their own words!"
    />
  );
}

function ImanPillarsTab(props: {
  age: AgeGroup;
  progress: KidsProgress;
  onStar: () => void;
  onLessonComplete: (id: string) => void;
}) {
  return (
    <ModuleLessonTab
      {...props}
      topics={imanData}
      prefix="iman"
      intro="A Muslim believes in six things. These are the pillars of iman (faith)."
      backLabel="All Beliefs"
      learnTogether="Count the six beliefs together on your fingers before bed!"
    />
  );
}

/* ───────── Good Manners (Akhlaq) ─────────
   Each virtue is anchored to a kid-friendly authentic narration. */
const mannersData: ModuleTopic[] = [
  {
    id: "honesty",
    name: "Always Be Truthful",
    icon: "🗣️",
    stepsLabel: "How to practice it",
    source: "Bukhari 78:121",
    descriptions: {
      little: "Always tell the truth. Allah loves people who are honest.",
      explorer: "The Prophet ﷺ taught that truthfulness leads to goodness, and goodness leads to Paradise. Telling the truth — even when it is hard — is a beautiful habit Allah loves.",
      scholar: "The Prophet ﷺ said, \"Truthfulness leads to righteousness, and righteousness leads to Paradise.\" A person who keeps telling the truth is written with Allah as truthful (siddiq). Honesty is a sign of real faith.",
    },
    steps: {
      little: ["Tell the truth", "Never tell a lie", "Say sorry if you make a mistake"],
      explorer: ["Tell the truth even when it is hard", "Keep your promises", "Don't cheat or trick people", "Say sorry honestly when you are wrong"],
      scholar: ["Be truthful in words and actions", "Keep promises and trusts", "Avoid lying even as a joke", "Honesty leads to Paradise"],
    },
    quiz: [
      { q: "Where does truthfulness lead a person?", options: ["To trouble", "To Paradise", "Nowhere", "To sleep"], answer: 1, explanation: "The Prophet ﷺ said truthfulness leads to righteousness, and righteousness leads to Paradise (Bukhari 78:121)." },
    ],
  },
  {
    id: "kindness",
    name: "Be Kind and Gentle",
    icon: "💛",
    stepsLabel: "How to practice it",
    source: "Muslim 45:99",
    descriptions: {
      little: "Allah is kind and loves kindness. Be gentle with everyone.",
      explorer: "The Prophet ﷺ said, \"Allah is kind and He loves kindness…\" Being gentle and soft with people makes them happy and earns Allah's love.",
      scholar: "The Prophet ﷺ taught that Allah is Gentle (Rafiq) and loves gentleness, and gives for gentleness what He does not give for harshness. Choosing kind words and gentle actions is a way to earn Allah's love.",
    },
    steps: {
      little: ["Use gentle words", "Share and help", "Be kind to everyone"],
      explorer: ["Speak gently, not harshly", "Help those who need help", "Forgive people who upset you", "Be kind even to those younger than you"],
      scholar: ["Choose gentle words and actions", "Respond to harshness with kindness", "Kindness earns what harshness cannot", "Be gentle with family, friends, and strangers"],
    },
    quiz: [
      { q: "What does Allah love?", options: ["Harshness", "Kindness", "Shouting", "Anger"], answer: 1, explanation: "The Prophet ﷺ said Allah is kind and loves kindness (Muslim 45:99)." },
    ],
  },
  {
    id: "brotherhood",
    name: "Love for Others",
    icon: "🤝",
    stepsLabel: "How to practice it",
    source: "Bukhari 2:6",
    descriptions: {
      little: "Want good things for your friends, just like you want them for yourself.",
      explorer: "The Prophet ﷺ said none of us truly believes until we love for our brother what we love for ourselves. Wishing good for others is part of faith.",
      scholar: "The Prophet ﷺ said, \"None of you will have faith till he wishes for his (Muslim) brother what he likes for himself.\" A believer is happy when others are happy and shares good things instead of being jealous.",
    },
    steps: {
      little: ["Share with your friends", "Be happy for others", "Don't be jealous"],
      explorer: ["Wish good things for others", "Be happy when your friends succeed", "Share what you have", "Don't be jealous of what others have"],
      scholar: ["Love for others what you love for yourself", "Rejoice at others' blessings", "Reject jealousy and greed", "Care for your brothers and sisters in faith"],
    },
    quiz: [
      { q: "A believer wishes for their brother...", options: ["Nothing", "What they wish for themselves", "Bad things", "Less than themselves"], answer: 1, explanation: "The Prophet ﷺ said to wish for your brother what you like for yourself (Bukhari 2:6)." },
    ],
  },
  {
    id: "mercy-animals",
    name: "Mercy to Animals",
    icon: "🐾",
    stepsLabel: "How to practice it",
    source: "Bukhari 4:39; Bukhari 78:44",
    descriptions: {
      little: "Be kind to animals. Allah loves people who are merciful.",
      explorer: "The Prophet ﷺ told of a man whose sins were forgiven because he gave water to a thirsty dog. Being merciful to animals is loved by Allah.",
      scholar: "The Prophet ﷺ said, \"He who is not merciful to others, will not be treated mercifully\", and he told of a man forgiven by Allah for giving water to a thirsty dog. Islam teaches mercy to every living creature.",
    },
    steps: {
      little: ["Be gentle with animals", "Give animals food and water", "Never hurt an animal"],
      explorer: ["Feed and give water to animals", "Never harm or tease animals", "Be gentle with pets and creatures", "Remember Allah rewards mercy"],
      scholar: ["Show mercy to every creature", "Provide food and water to animals", "Never cause an animal pain", "Mercy to others earns Allah's mercy"],
    },
    quiz: [
      { q: "What happened to the man who gave water to a thirsty dog?", options: ["Nothing", "Allah forgave him and he entered Paradise", "He was punished", "He got tired"], answer: 1, explanation: "Allah forgave the man and admitted him to Paradise (Bukhari 4:39)." },
    ],
  },
  {
    id: "anger",
    name: "Control Your Anger",
    icon: "😤",
    stepsLabel: "How to practice it",
    source: "Bukhari 78:141",
    descriptions: {
      little: "Being strong means staying calm when you feel angry.",
      explorer: "The Prophet ﷺ said the strong person is not the one who wins fights, but the one who controls himself when he is angry. Staying calm is real strength.",
      scholar: "The Prophet ﷺ said, \"The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger.\" Calming down instead of lashing out is true strength.",
    },
    steps: {
      little: ["Take a deep breath", "Stay calm", "Say a kind word instead"],
      explorer: ["Stop and take a breath when angry", "Do not shout or hit", "Say A'udhu billahi min ash-Shaytan", "Forgive instead of getting even"],
      scholar: ["Recognise anger and pause", "Seek refuge in Allah from Shaytan", "Sit down or make wudu to calm down", "True strength is self-control"],
    },
    quiz: [
      { q: "Who is truly strong?", options: ["The one who wins fights", "The one who controls his anger", "The loudest person", "The fastest runner"], answer: 1, explanation: "The Prophet ﷺ said the strong one controls himself when angry (Bukhari 78:141)." },
    ],
  },
  {
    id: "smiling",
    name: "Smile and Spread Joy",
    icon: "😊",
    stepsLabel: "How to practice it",
    source: "Tirmidhi 27:62",
    descriptions: {
      little: "Smiling at people is a good deed. It makes everyone happy!",
      explorer: "The Prophet ﷺ said that smiling at your brother is charity. A simple smile is a good deed that spreads happiness and earns reward.",
      scholar: "The Prophet ﷺ said, \"Your smiling in the face of your brother is charity.\" Even helping someone find their way or removing a stone from the road is charity. Small kind acts add up.",
    },
    steps: {
      little: ["Smile at people", "Say kind words", "Help someone today"],
      explorer: ["Greet people with a smile", "Help someone who is lost or stuck", "Remove harmful things from the path", "Every kind act is charity"],
      scholar: ["A smile is charity", "Guide and help those in need", "Clear harm from the road", "Small good deeds are rewarded"],
    },
    quiz: [
      { q: "Smiling at your brother is...", options: ["A waste", "Charity", "Rude", "Only for adults"], answer: 1, explanation: "The Prophet ﷺ said your smile in your brother's face is charity (Tirmidhi 27:62)." },
    ],
  },
  {
    id: "greeting",
    name: "Give the Salam",
    icon: "👋",
    stepsLabel: "How to practice it",
    source: "Bukhari 79:5",
    descriptions: {
      little: "Say 'Assalamu Alaikum' — it means 'peace be upon you'.",
      explorer: "The Prophet ﷺ taught us to spread salam. He said the younger should greet the older, and greeting others with peace makes us love one another.",
      scholar: "The Prophet ﷺ taught that the young should greet the old, the passer-by should greet the one sitting, and the smaller group should greet the larger — and spreading salam spreads love between Muslims.",
    },
    steps: {
      little: ["Say Assalamu Alaikum", "Reply Wa Alaikum Assalam", "Greet with a smile"],
      explorer: ["Greet others with salam", "The younger greets the older first", "Always reply to a greeting", "Salam spreads peace and love"],
      scholar: ["Spread salam to those you know and don't know", "The young greet the old, the passer-by the sitter", "Reply to every greeting kindly", "Greeting spreads love among believers"],
    },
    quiz: [
      { q: "What does 'Assalamu Alaikum' mean?", options: ["Goodbye", "Peace be upon you", "Thank you", "Well done"], answer: 1, explanation: "Assalamu Alaikum means 'peace be upon you' — the Muslim greeting (Bukhari 79:5)." },
    ],
  },
  {
    id: "parents",
    name: "Honour Your Parents",
    icon: "🫶",
    stepsLabel: "How to practice it",
    source: "Bukhari 78:2",
    descriptions: {
      little: "Be kind to your mum and dad and obey them. Allah loves that.",
      explorer: "When a man asked who deserves his best treatment, the Prophet ﷺ said \"Your mother\" three times, then \"Your father.\" Being good to parents is one of the greatest deeds.",
      scholar: "A man asked the Prophet ﷺ who most deserves his good company. He said \"Your mother\" three times, then \"Your father.\" Obeying and honouring parents — especially our mothers — is beloved to Allah.",
    },
    steps: {
      little: ["Listen to mum and dad", "Say please and thank you", "Help them at home"],
      explorer: ["Obey your parents in good things", "Speak to them gently", "Help them without being asked", "Make dua for them"],
      scholar: ["Honour and obey your parents", "Never say a harsh word to them", "Serve them, especially your mother", "Make dua for their mercy and health"],
    },
    quiz: [
      { q: "Who did the Prophet ﷺ say deserves our best treatment first?", options: ["Our friends", "Our mother", "Our teacher", "Our neighbour"], answer: 1, explanation: "The Prophet ﷺ said \"Your mother\" three times, then \"Your father\" (Bukhari 78:2)." },
    ],
  },
];

function GoodMannersTab(props: {
  age: AgeGroup;
  progress: KidsProgress;
  onStar: () => void;
  onLessonComplete: (id: string) => void;
}) {
  return (
    <ModuleLessonTab
      {...props}
      topics={mannersData}
      prefix="manner"
      intro="Be like the Prophet ﷺ! Learn a good manner, then take the quiz."
      backLabel="All Manners"
      learnTogether="Pick one manner to practice together all week!"
      showIconRow={false}
    />
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
  { id: "ameen", arabic: "آمين", transliteration: "Ameen", english: "O Allah, accept it", when: "After a dua or after Al-Fatiha in prayer", category: "dhikr" },
  { id: "barakallahu-feek", arabic: "بارك الله فيك", transliteration: "BarakAllahu feek", english: "May Allah bless you", when: "To thank someone or wish them well", category: "greetings" },
  { id: "yahdikumullah", arabic: "يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ", transliteration: "Yahdikumullah wa yuslihu balakum", english: "May Allah guide you and set your affairs right", when: "When someone replies to your sneeze with Yarhamukallah", category: "greetings" },
  { id: "taqabbalallah", arabic: "تقبل الله منا ومنك", transliteration: "Taqabbal Allahu minna wa minkum", english: "May Allah accept it from us and from you", when: "A greeting on Eid and after worship", category: "celebrations" },
  { id: "eid-mubarak", arabic: "عيد مبارك", transliteration: "Eid Mubarak", english: "Blessed Eid", when: "To greet others on Eid day", category: "celebrations" },
  { id: "ramadan-mubarak", arabic: "رمضان مبارك", transliteration: "Ramadan Mubarak", english: "Blessed Ramadan", when: "To greet others when Ramadan begins", category: "celebrations" },
  { id: "subhanahu-wa-taala", arabic: "سبحانه وتعالى", transliteration: "Subhanahu wa Ta'ala", english: "Glorified and Exalted is He", when: "After saying the name of Allah", category: "honorifics" },
  { id: "alayhis-salam", arabic: "عليه السلام", transliteration: "Alayhis-salam", english: "Peace be upon him", when: "After the name of a prophet or angel", category: "honorifics" },
  { id: "radiyallahu-anhu", arabic: "رضي الله عنه", transliteration: "Radiyallahu Anhu", english: "May Allah be pleased with him", when: "After the name of a companion of the Prophet ﷺ", category: "honorifics" },
  { id: "fi-amanillah", arabic: "في أمان الله", transliteration: "Fi Amanillah", english: "In the protection of Allah", when: "When saying goodbye to someone", category: "greetings" },
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

// Chronological order, matching packages/content/prophet-stories.ts
const prophetList: { slug: string; name: string; emoji: string }[] = [
  { slug: "adam", name: "Adam", emoji: "🌿" },
  { slug: "shith", name: "Shith (Seth)", emoji: "📜" },
  { slug: "idris", name: "Idris (Enoch)", emoji: "✍️" },
  { slug: "nuh", name: "Nuh (Noah)", emoji: "🚢" },
  { slug: "hud", name: "Hud", emoji: "🌬️" },
  { slug: "salih", name: "Salih", emoji: "🐪" },
  { slug: "ibrahim", name: "Ibrahim (Abraham)", emoji: "⭐" },
  { slug: "lut", name: "Lut (Lot)", emoji: "🌆" },
  { slug: "ismail", name: "Ismail", emoji: "🐑" },
  { slug: "ishaq", name: "Ishaq (Isaac)", emoji: "🎁" },
  { slug: "yaqub", name: "Yaqub (Jacob)", emoji: "🕊️" },
  { slug: "yusuf", name: "Yusuf (Joseph)", emoji: "🌙" },
  { slug: "ayyub", name: "Ayyub (Job)", emoji: "💧" },
  { slug: "shuayb", name: "Shuayb", emoji: "⚖️" },
  { slug: "musa", name: "Musa (Moses)", emoji: "🌊" },
  { slug: "harun", name: "Harun (Aaron)", emoji: "🗣️" },
  { slug: "yusha", name: "Yusha (Joshua)", emoji: "☀️" },
  { slug: "dawud", name: "Dawud (David)", emoji: "🛡️" },
  { slug: "sulayman", name: "Sulayman (Solomon)", emoji: "👑" },
  { slug: "ilyas", name: "Ilyas (Elijah)", emoji: "🌧️" },
  { slug: "yunus", name: "Yunus (Jonah)", emoji: "🐋" },
  { slug: "zakariyya", name: "Zakariyya (Zechariah)", emoji: "🤲" },
  { slug: "yahya", name: "Yahya (John)", emoji: "📖" },
  { slug: "isa", name: "Isa (Jesus)", emoji: "✨" },
  { slug: "muhammad", name: "Muhammad ﷺ", emoji: "🕌" },
];

// Gentle, iconic stories for the youngest readers
const littleSlugs = ["adam", "nuh", "ibrahim", "musa", "muhammad"];
// Adds the classic, kid-friendly stories (patience, miracles, family)
const explorerSlugs = [
  ...littleSlugs,
  "salih",
  "ismail",
  "yaqub",
  "yusuf",
  "ayyub",
  "harun",
  "dawud",
  "sulayman",
  "yunus",
  "yahya",
  "isa",
];

function getProphetsByAge(age: AgeGroup) {
  if (age === "little") return prophetList.filter((p) => littleSlugs.includes(p.slug));
  if (age === "explorer") return prophetList.filter((p) => explorerSlugs.includes(p.slug));
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
  {
    id: 103,
    name: "Al-Asr",
    nameAr: "العصر",
    globalStart: 6177,
    verses: [
      { arabic: "وَٱلْعَصْرِ", transliteration: "Wal' asr", meaning: "By the time," },
      { arabic: "إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ", transliteration: "Innal insaana lafee khusr", meaning: "man is in utter loss," },
      { arabic: "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ", transliteration: "Il lal lazeena aamanu wa 'amilus saali haati wa tawa saw bil haqqi wa tawa saw bis sabr", meaning: "except those who believe and do righteous deeds, and exhort one another to the truth and exhort one another to patience." },
    ],
  },
  {
    id: 105,
    name: "Al-Fil",
    nameAr: "الفيل",
    globalStart: 6189,
    verses: [
      { arabic: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَـٰبِ ٱلْفِيلِ", transliteration: "Alam tara kaifa fa'ala rabbuka bi ashaabil feel", meaning: "Have you not seen how your Lord dealt with the people of the Elephant?" },
      { arabic: "أَلَمْ يَجْعَلْ كَيْدَهُمْ فِى تَضْلِيلٍ", transliteration: "Alam yaj'al kai dahum fee tad leel", meaning: "Did He not turn their scheme into a total loss?" },
      { arabic: "وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ", transliteration: "Wa arsala 'alaihim tairan abaabeel", meaning: "He sent against them swarms of birds," },
      { arabic: "تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ", transliteration: "Tar meehim bi hi jaaratim min sij jeel", meaning: "pelting them with stones of baked clay," },
      { arabic: "فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍۭ", transliteration: "Faja 'alahum ka'asfim m'akool", meaning: "leaving them like chewed-up chaff." },
    ],
  },
  {
    id: 106,
    name: "Quraysh",
    nameAr: "قريش",
    globalStart: 6194,
    verses: [
      { arabic: "لِإِيلَـٰفِ قُرَيْشٍ", transliteration: "Li-ilaafi quraish", meaning: "For the accustomed security of the Quraysh," },
      { arabic: "إِۦلَـٰفِهِمْ رِحْلَةَ ٱلشِّتَآءِ وَٱلصَّيْفِ", transliteration: "Elaafihim rihlatash shitaa-i wass saif", meaning: "secure in their winter and summer journeys." },
      { arabic: "فَلْيَعْبُدُوا۟ رَبَّ هَـٰذَا ٱلْبَيْتِ", transliteration: "Fal y'abudu rabba haazal-bait", meaning: "Let them worship the Lord of this [Sacred] House," },
      { arabic: "ٱلَّذِىٓ أَطْعَمَهُم مِّن جُوعٍ وَءَامَنَهُم مِّنْ خَوْفٍۭ", transliteration: "Allazi at'amahum min ju'inw-wa-aamana hum min khawf", meaning: "Who fed them against hunger and made them secure against fear." },
    ],
  },
  {
    id: 107,
    name: "Al-Ma'un",
    nameAr: "الماعون",
    globalStart: 6198,
    verses: [
      { arabic: "أَرَءَيْتَ ٱلَّذِى يُكَذِّبُ بِٱلدِّينِ", transliteration: "Ara-aital lazee yu kazzibu bid deen", meaning: "Have you seen the one who denies the Recompense?" },
      { arabic: "فَذَٰلِكَ ٱلَّذِى يَدُعُّ ٱلْيَتِيمَ", transliteration: "Fa zaalikal lazi yadu'ul-yateem", meaning: "Such is the one who repulses the orphan harshly," },
      { arabic: "وَلَا يَحُضُّ عَلَىٰ طَعَامِ ٱلْمِسْكِينِ", transliteration: "Wa la ya huddu 'alaa ta'amil miskeen", meaning: "and does not urge others to feed the needy." },
      { arabic: "فَوَيْلٌ لِّلْمُصَلِّينَ", transliteration: "Fa wai lul-lil mu salleen", meaning: "So woe to those who pray," },
      { arabic: "ٱلَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ", transliteration: "Al lazeena hum 'an salaatihim sahoon", meaning: "but are heedless of their prayer;" },
      { arabic: "ٱلَّذِينَ هُمْ يُرَآءُونَ", transliteration: "Al lazeena hum yuraa-oon", meaning: "those who only show off," },
      { arabic: "وَيَمْنَعُونَ ٱلْمَاعُونَ", transliteration: "Wa yamna'oonal ma'oon", meaning: "and withhold even the small kindnesses." },
    ],
  },
  {
    id: 109,
    name: "Al-Kafirun",
    nameAr: "الكافرون",
    globalStart: 6208,
    verses: [
      { arabic: "قُلْ يَـٰٓأَيُّهَا ٱلْكَـٰفِرُونَ", transliteration: "Qul yaa-ai yuhal kaafiroon", meaning: "Say, “O disbelievers," },
      { arabic: "لَآ أَعْبُدُ مَا تَعْبُدُونَ", transliteration: "Laa a'budu ma t'abudoon", meaning: "I do not worship what you worship," },
      { arabic: "وَلَآ أَنتُمْ عَـٰبِدُونَ مَآ أَعْبُدُ", transliteration: "Wa laa antum 'aabidoona maa a'bud", meaning: "nor do you worship what I worship." },
      { arabic: "وَلَآ أَنَا۠ عَابِدٌ مَّا عَبَدتُّمْ", transliteration: "Wa laa ana 'abidum maa 'abattum", meaning: "Never will I worship what you worship," },
      { arabic: "وَلَآ أَنتُمْ عَـٰبِدُونَ مَآ أَعْبُدُ", transliteration: "Wa laa antum 'aabidoona ma a'bud", meaning: "nor will you ever worship what I worship." },
      { arabic: "لَكُمْ دِينُكُمْ وَلِىَ دِينِ", transliteration: "Lakum deenukum wa liya deen.", meaning: "You have your religion and I have my religion.\"" },
    ],
  },
  {
    id: 111,
    name: "Al-Masad",
    nameAr: "المسد",
    globalStart: 6217,
    verses: [
      { arabic: "تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ", transliteration: "Tab bat yadaa abee Lahabinw-wa tabb", meaning: "May the hands of Abu Lahab perish, and may he perish!" },
      { arabic: "مَآ أَغْنَىٰ عَنْهُ مَالُهُۥ وَمَا كَسَبَ", transliteration: "Maa aghna 'anhu maaluhu wa ma kasab", meaning: "Neither his wealth nor his worldly gains will avail him." },
      { arabic: "سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ", transliteration: "Sa yas laa naran zaata lahab", meaning: "He will burn in a Flaming Fire," },
      { arabic: "وَٱمْرَأَتُهُۥ حَمَّالَةَ ٱلْحَطَبِ", transliteration: "Wam ra-atuh hamma latal-hatab", meaning: "and so will his wife, the carrier of firewood," },
      { arabic: "فِى جِيدِهَا حَبْلٌ مِّن مَّسَدٍۭ", transliteration: "Fee jeediha hab lum mim-masad", meaning: "around her neck will be a rope of palm fiber." },
    ],
  },
  {
    id: 2,
    name: "Ayat al-Kursi",
    nameAr: "آية الكرسي",
    globalStart: 262,
    verses: [
      { arabic: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ", transliteration: "Allahu laaa ilaaha illaa Huwal Haiyul Qaiyoom; laa taakhuzuhoo sinatunw wa laa nawm; lahoo maa fissamaawaati wa maa fil ard; man zal lazee yashfa'u indahooo illaa bi-iznih; ya'lamu maa baina aydeehim wa mww khalfahum wa laa yuheetoona bishai'im min 'ilmihee illaa bimaa shaaa'; wasi'a Kursiyyuhus samaawaati wal arda wa laa ya'ooduho hifzuhumaa; wa Huwal Aliyyul 'Azeem", meaning: "Allah: none has the right to be worshiped except Him, the Ever-Living, All-Sustaining. Neither drowsiness overtakes Him nor sleep. To Him belongs all that is in the heavens and all that is on earth. Who is there that can intercede with Him except with His permission? He knows what was before them and what will be after them, while they encompass nothing of His knowledge, except what He wills. His Kursī [i.e., footstool] extends over the heavens and earth, and safeguarding of both does not weary Him, for He is the Most High, the Most Great." },
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
        <div className="mb-4 p-3 rounded-xl bg-gold/5 border border-gold/20">
          <p className="text-xs text-themed">
            <Sparkles size={12} className="inline text-gold mr-1" />
            The Prophet ﷺ taught that the best of us are the ones who learn the Quran and teach it.
            Ayat al-Kursi is special too — reciting it at bedtime keeps a guard over you all night.
          </p>
          <p className="text-[11px] text-themed-muted mt-1.5 italic">Source: Bukhari 66:49; Bukhari 66:32</p>
        </div>
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
  { id: "parents", label: "Helped or obeyed my parents", emoji: "🫶", ageMin: "little" },
  { id: "clean", label: "Brushed my teeth and kept clean", emoji: "🪥", ageMin: "little" },
  { id: "animal", label: "Was kind to an animal", emoji: "🐾", ageMin: "little" },
  { id: "salam", label: "Greeted someone with Salam", emoji: "👋", ageMin: "explorer" },
  { id: "dua", label: "Made a special dua", emoji: "🌟", ageMin: "explorer" },
  { id: "helped", label: "Helped someone in need", emoji: "🤝", ageMin: "explorer" },
  { id: "sorry", label: "Said sorry or forgave someone", emoji: "🤗", ageMin: "explorer" },
  { id: "dhikr", label: "Did dhikr (remembrance of Allah)", emoji: "📿", ageMin: "scholar" },
  { id: "learned", label: "Learned something new about Islam", emoji: "📚", ageMin: "scholar" },
  { id: "sunnah", label: "Followed a Sunnah of the Prophet ﷺ", emoji: "☀️", ageMin: "scholar" },
  { id: "charity", label: "Gave charity or shared something", emoji: "🎁", ageMin: "scholar" },
  { id: "prayed-alone", label: "Prayed a prayer on time by myself", emoji: "🕌", ageMin: "scholar" },
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

  // ── Beliefs (pillars of iman) ──
  { id: "c16", type: "multiple-choice", category: "beliefs", difficulty: "little", question: "What did Allah make the angels from?", options: ["Clay", "Light", "Fire", "Water"], answer: 1, explanation: "The angels were created from light." },
  { id: "c17", type: "multiple-choice", category: "beliefs", difficulty: "explorer", question: "How many pillars of iman (beliefs) are there?", options: ["Three", "Five", "Six", "Ten"], answer: 2, explanation: "There are six pillars of iman: Allah, angels, books, messengers, the Last Day, and qadar." },
  { id: "c18", type: "true-false", category: "beliefs", difficulty: "explorer", question: "The Quran is the last book Allah revealed.", options: ["True", "False"], answer: 0, explanation: "The Quran, given to Prophet Muhammad ﷺ, is the final book from Allah." },
  { id: "c19", type: "multiple-choice", category: "beliefs", difficulty: "scholar", question: "Belief in qadar means believing that...", options: ["We control everything", "Allah knows and decrees all things", "The future is random", "Deeds don't matter"], answer: 1, explanation: "Qadar is Allah's decree — He knows and allows all that happens, so we try our best and trust Him." },
  { id: "c20", type: "multiple-choice", category: "beliefs", difficulty: "scholar", question: "How many beautiful names does Allah have?", options: ["40", "70", "99", "100"], answer: 2, explanation: "The Prophet ﷺ said Allah has ninety-nine names." },

  // ── Manners (akhlaq) ──
  { id: "c21", type: "multiple-choice", category: "manners", difficulty: "little", question: "What do we say when we meet a Muslim?", options: ["Goodbye", "Assalamu Alaikum", "Nothing", "Hurry up"], answer: 1, explanation: "We greet with 'Assalamu Alaikum' — peace be upon you." },
  { id: "c22", type: "multiple-choice", category: "manners", difficulty: "little", question: "Who did the Prophet ﷺ say deserves our best treatment first?", options: ["Our friends", "Our mother", "Our toys", "Strangers"], answer: 1, explanation: "The Prophet ﷺ said 'Your mother' three times, then 'Your father.'" },
  { id: "c23", type: "true-false", category: "manners", difficulty: "explorer", question: "Smiling at someone can be a good deed.", options: ["True", "False"], answer: 0, explanation: "The Prophet ﷺ said smiling in your brother's face is charity." },
  { id: "c24", type: "multiple-choice", category: "manners", difficulty: "explorer", question: "Who is truly strong?", options: ["The one who wins fights", "The one who controls his anger", "The tallest person", "The loudest person"], answer: 1, explanation: "The Prophet ﷺ said the strong one controls himself when he is angry." },
  { id: "c25", type: "multiple-choice", category: "manners", difficulty: "scholar", question: "The Prophet ﷺ said truthfulness leads to...", options: ["Trouble", "Righteousness and Paradise", "Nowhere", "Wealth"], answer: 1, explanation: "Truthfulness leads to righteousness, and righteousness leads to Paradise." },
  { id: "c26", type: "true-false", category: "manners", difficulty: "scholar", question: "A believer wishes for others what they wish for themselves.", options: ["True", "False"], answer: 0, explanation: "The Prophet ﷺ said none of us truly believes until we love for our brother what we love for ourselves." },

  // ── Prophets ──
  { id: "c27", type: "multiple-choice", category: "prophets", difficulty: "little", question: "Which prophet built a big boat (ark)?", options: ["Nuh", "Musa", "Yusuf", "Adam"], answer: 0, explanation: "Prophet Nuh built the ark on Allah's command." },
  { id: "c28", type: "multiple-choice", category: "prophets", difficulty: "explorer", question: "Which prophet was given the miracle of splitting the sea?", options: ["Isa", "Musa", "Dawud", "Yunus"], answer: 1, explanation: "Prophet Musa split the sea by Allah's power to save his people." },
  { id: "c29", type: "true-false", category: "prophets", difficulty: "explorer", question: "Prophet Ibrahim is called the friend of Allah.", options: ["True", "False"], answer: 0, explanation: "Prophet Ibrahim (Abraham) is honoured as Khalilullah, the friend of Allah." },
  { id: "c30", type: "multiple-choice", category: "prophets", difficulty: "scholar", question: "Which prophet could understand the speech of animals and had a mighty kingdom?", options: ["Sulayman", "Harun", "Ilyas", "Shuayb"], answer: 0, explanation: "Prophet Sulayman was given a great kingdom and understood the speech of animals." },

  // ── Quran ──
  { id: "c31", type: "multiple-choice", category: "quran", difficulty: "little", question: "What is the holy book of the Muslims?", options: ["The Quran", "A storybook", "The dictionary", "A magazine"], answer: 0, explanation: "The Quran is the word of Allah." },
  { id: "c32", type: "multiple-choice", category: "quran", difficulty: "explorer", question: "Which surah talks about the people of the Elephant?", options: ["Al-Ikhlas", "Al-Fil", "An-Nas", "Al-Kawthar"], answer: 1, explanation: "Surah Al-Fil tells how Allah protected the Kaaba from the army with the elephant." },
  { id: "c33", type: "true-false", category: "quran", difficulty: "explorer", question: "Surah Al-Ikhlas is about the oneness of Allah.", options: ["True", "False"], answer: 0, explanation: "Al-Ikhlas describes Allah as One, with none comparable to Him." },
  { id: "c34", type: "multiple-choice", category: "quran", difficulty: "scholar", question: "Which special verse is a guard for you at night when recited?", options: ["Ayat al-Kursi", "Al-Kawthar", "Quraysh", "Al-Asr"], answer: 0, explanation: "The Prophet ﷺ said reciting Ayat al-Kursi at bedtime keeps a guard over you all night." },

  // ── Seerah / Heroes ──
  { id: "c35", type: "multiple-choice", category: "seerah", difficulty: "explorer", question: "Who was the Prophet's loyal best friend who travelled with him to Madinah?", options: ["Umar", "Bilal", "Abu Bakr", "Anas"], answer: 2, explanation: "Abu Bakr as-Siddiq was the Prophet's closest friend and companion on the journey to Madinah." },
  { id: "c36", type: "multiple-choice", category: "seerah", difficulty: "explorer", question: "Who was the first person to call the adhan?", options: ["Bilal", "Abu Bakr", "Umar", "Anas"], answer: 0, explanation: "Bilal ibn Rabah, with his beautiful voice, was the first muezzin." },
  { id: "c37", type: "multiple-choice", category: "seerah", difficulty: "scholar", question: "Who was the first person to believe in the Prophet's message?", options: ["Umar", "Khadijah", "Abu Bakr", "Bilal"], answer: 1, explanation: "Khadijah, the Prophet's wife, was the first to believe in and support him." },
  { id: "c38", type: "true-false", category: "seerah", difficulty: "scholar", question: "Anas served the Prophet ﷺ for about ten years and was never scolded harshly.", options: ["True", "False"], answer: 0, explanation: "Anas said the Prophet ﷺ never once said 'uff' to him in ten years of service." },

  // ── Pillars & practice ──
  { id: "c39", type: "multiple-choice", category: "pillars", difficulty: "little", question: "How many times do Muslims pray each day?", options: ["Three", "Five", "Seven", "Ten"], answer: 1, explanation: "Muslims pray five times a day." },
  { id: "c40", type: "multiple-choice", category: "pillars", difficulty: "little", question: "What do we do to get clean before prayer?", options: ["Wudu", "Sleep", "Eat", "Run"], answer: 0, explanation: "We make wudu (washing) before we pray." },
  { id: "c41", type: "true-false", category: "pillars", difficulty: "explorer", question: "During Ramadan, Muslims fast from dawn until sunset.", options: ["True", "False"], answer: 0, explanation: "Fasting in Ramadan is from Fajr (dawn) to Maghrib (sunset)." },
  { id: "c42", type: "multiple-choice", category: "pillars", difficulty: "explorer", question: "What is the Eid after the month of fasting called?", options: ["Eid al-Adha", "Eid al-Fitr", "Jumu'ah", "Ashura"], answer: 1, explanation: "Eid al-Fitr is the celebration after Ramadan." },

  // ── Daily words & duas ──
  { id: "c43", type: "multiple-choice", category: "daily", difficulty: "little", question: "What do we say before we sleep?", options: ["Bismika Allahumma amutu wa ahya", "Goodnight only", "Nothing", "Allahu Akbar"], answer: 0, explanation: "We say 'Allahumma bismika amutu wa ahya' — O Allah, in Your name I die and live." },
  { id: "c44", type: "multiple-choice", category: "daily", difficulty: "explorer", question: "When someone sneezes and says Alhamdulillah, what do we reply?", options: ["Bismillah", "Yarhamukallah", "InshAllah", "Ameen"], answer: 1, explanation: "We reply 'Yarhamukallah' — may Allah have mercy on you." },
  { id: "c45", type: "true-false", category: "daily", difficulty: "explorer", question: "'MashAllah' is said when we admire something good.", options: ["True", "False"], answer: 0, explanation: "MashAllah means 'what Allah has willed' — said when admiring a blessing." },
  { id: "c46", type: "multiple-choice", category: "daily", difficulty: "scholar", question: "What does 'JazakAllahu Khairan' mean?", options: ["Goodbye", "May Allah reward you with good", "In the name of Allah", "See you soon"], answer: 1, explanation: "It means 'May Allah reward you with good' — a beautiful way to say thank you." },
];

// Themed quiz packs — `key` matches ChallengeQuestion.category ("all" = everything).
const challengePacks: { key: string; label: string; emoji: string }[] = [
  { key: "all", label: "Mixed", emoji: "🎲" },
  { key: "beliefs", label: "Beliefs", emoji: "🛡️" },
  { key: "pillars", label: "Pillars", emoji: "🕌" },
  { key: "prophets", label: "Prophets", emoji: "📜" },
  { key: "seerah", label: "Heroes", emoji: "🫂" },
  { key: "quran", label: "Quran", emoji: "📖" },
  { key: "manners", label: "Manners", emoji: "😊" },
  { key: "daily", label: "Words & Duas", emoji: "💬" },
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
  const [pack, setPack] = useState("all");
  const questions = useMemo(
    () =>
      challengeQuestions.filter(
        (q) => ageOrder.indexOf(q.difficulty) <= maxIdx && (pack === "all" || q.category === pack)
      ),
    [age, maxIdx, pack]
  );
  // Packs shown = those with at least one question for the current age.
  const availablePacks = useMemo(
    () =>
      challengePacks.filter(
        (pk) =>
          pk.key === "all" ||
          challengeQuestions.some(
            (q) => q.category === pk.key && ageOrder.indexOf(q.difficulty) <= maxIdx
          )
      ),
    [maxIdx]
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
            <p className="text-themed-muted text-sm mb-4">
              Test your Islamic knowledge with fun challenges!
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {availablePacks.map((pk) => (
                <button
                  key={pk.key}
                  onClick={() => setPack(pk.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    pack === pk.key
                      ? "bg-gold text-black border-gold"
                      : "card-bg sidebar-border text-themed-muted hover:bg-gold/10"
                  }`}
                >
                  {pk.emoji} {pk.label}
                </button>
              ))}
            </div>
            <ContentCard>
              <Sparkles size={48} className="mx-auto text-gold mb-3" />
              <h3 className="text-lg font-semibold text-themed mb-2">Ready for a Challenge?</h3>
              <p className="text-sm text-themed-muted mb-4">
                {quizLen}-question {challengePacks.find((p) => p.key === pack)?.label ?? "Mixed"} pack. Get a perfect score for bonus stars!
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
   MY FIRST DUAS (flashcard deck) — Arabic matn byte-spliced from the corpus
   ═══════════════════════════════════════════════════════════════════ */

type FirstDua = {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  when: string;
  source: string;
  ageMin: AgeGroup;
};

const myDuas: FirstDua[] = [
  { id: "before-eat", arabic: "بِسْمِ اللَّهِ", transliteration: "Bismillah", english: "In the name of Allah", when: "Say it before you eat or drink anything.", source: "Bukhari 70:4", ageMin: "little" },
  { id: "after-eat", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا الطَّعَامَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ", transliteration: "Alhamdu lillahil-ladhi at'amani hadhat-ta'ama wa razaqanihi min ghayri hawlin minni wa la quwwah", english: "All praise is to Allah who fed me this food and provided it for me without any might or power on my part", when: "Say it when you finish your meal to thank Allah.", source: "Abu Dawud 34:4", ageMin: "explorer" },
  { id: "sleep", arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا", transliteration: "Allahumma bismika amutu wa ahya", english: "O Allah, in Your name I die and I live", when: "Say it as you lie down to sleep.", source: "Bukhari 80:9; Bukhari 80:11", ageMin: "little" },
  { id: "wake", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur", english: "All praise is to Allah who gave us life after He caused us to die, and to Him is the return", when: "Say it the moment you wake up.", source: "Bukhari 80:9; Bukhari 80:11", ageMin: "explorer" },
  { id: "bathroom", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ", transliteration: "Allahumma inni a'udhu bika minal-khubthi wal-khaba'ith", english: "O Allah, I seek refuge in You from evil and evil-doers", when: "Say it before you step into the bathroom.", source: "Bukhari 4:8", ageMin: "little" },
  { id: "leave-home", arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ", transliteration: "Bismillahi tawakkaltu 'alallah, la hawla wa la quwwata illa billah", english: "In the name of Allah, I trust in Allah; there is no might and no power except with Allah", when: "Say it as you leave your home.", source: "Abu Dawud 43:323", ageMin: "explorer" },
  { id: "protection", arabic: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَىْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim", english: "In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing", when: "Say it three times each morning and evening to stay safe.", source: "Abu Dawud 43:316", ageMin: "scholar" },
];

function getDuasByAge(age: AgeGroup): FirstDua[] {
  const order: AgeGroup[] = ["little", "explorer", "scholar"];
  const maxIdx = order.indexOf(age);
  return myDuas.filter((d) => order.indexOf(d.ageMin) <= maxIdx);
}

function MyDuasTab({
  age,
  onStar,
}: {
  age: AgeGroup;
  progress: KidsProgress;
  onStar: () => void;
}) {
  const duas = useMemo(() => getDuasByAge(age), [age]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const dua = duas[idx];
  if (!dua) return null;

  const next = () => {
    const r = reviewed + 1;
    if (r >= 3) { onStar(); setReviewed(0); } else { setReviewed(r); }
    setIdx((i) => (i + 1) % duas.length);
    setFlipped(false);
  };
  const prev = () => {
    setIdx((i) => (i - 1 + duas.length) % duas.length);
    setFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-center text-themed-muted text-sm mb-4">
        Little duas to say every day. Tap the card to see what it means!
      </p>
      <div className="text-center text-xs text-themed-muted mb-3">
        {idx + 1} of {duas.length} &middot; {reviewed}/3 towards next{" "}
        <Star size={10} className="inline text-gold" fill="currentColor" />
      </div>

      <div className="perspective-1000 cursor-pointer mb-4" onClick={() => setFlipped(!flipped)}>
        <motion.div
          className="relative w-full h-64 rounded-2xl"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 card-bg sidebar-border rounded-2xl flex flex-col items-center justify-center p-6 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-[11px] uppercase tracking-widest text-themed-muted mb-2">{dua.when.replace(/^Say it /, "").replace(/\.$/, "")}</p>
            <p className="text-2xl font-arabic leading-loose mb-3">{dua.arabic}</p>
            <p className="text-sm text-gold">{dua.transliteration}</p>
            <p className="text-xs text-themed-muted mt-4 opacity-50">Tap to see meaning</p>
          </div>
          <div
            className="absolute inset-0 card-bg sidebar-border rounded-2xl flex flex-col items-center justify-center p-6 text-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-base font-semibold text-themed mb-2">{dua.english}</p>
            <p className="text-sm text-themed-muted">{dua.when}</p>
            <p className="text-[11px] text-themed-muted mt-3 italic">Source: {dua.source}</p>
            <p className="text-xs text-themed-muted mt-3 opacity-50">Tap to flip back</p>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={prev} className="p-2 rounded-full card-bg sidebar-border hover:bg-gold/10 transition">
          <ChevronLeft size={20} />
        </button>
        <button onClick={next} className="px-4 py-2 rounded-full bg-gold text-black font-medium text-sm hover:bg-gold/90 transition">
          Next Dua
        </button>
        <button onClick={next} className="p-2 rounded-full card-bg sidebar-border hover:bg-gold/10 transition">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mt-6 p-3 rounded-xl bg-gold/5 border border-gold/20 text-center">
        <Lightbulb size={14} className="inline text-gold mr-1" />
        <span className="text-xs text-themed-muted">
          <strong>Learn Together:</strong> Say &ldquo;{dua.transliteration}&rdquo; together at the right moment today!
        </span>
      </div>
      <div className="mt-3 text-center">
        <a href="/duas" className="text-xs text-gold hover:underline">See all duas for the family &rarr;</a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LET'S PRAY! (wudu + salah walkthrough)
   ═══════════════════════════════════════════════════════════════════ */

const wuduSteps: { emoji: string; title: string; detail: string }[] = [
  { emoji: "🤲", title: "Make your intention", detail: "In your heart, plan to make wudu to get clean for Allah, then say Bismillah." },
  { emoji: "✋", title: "Wash your hands", detail: "Wash both hands up to the wrists, three times." },
  { emoji: "💧", title: "Rinse your mouth and nose", detail: "Rinse your mouth three times, then sniff a little water into your nose and blow it out, three times." },
  { emoji: "😊", title: "Wash your face", detail: "Wash your whole face three times, from the top of your forehead to your chin." },
  { emoji: "💪", title: "Wash your arms", detail: "Wash your right arm up to the elbow three times, then your left arm three times." },
  { emoji: "🧑", title: "Wipe your head and ears", detail: "Wipe your wet hands over your head once, then wipe inside and behind your ears." },
  { emoji: "🦶", title: "Wash your feet", detail: "Wash your right foot up to the ankle three times, then your left foot three times." },
];

const salahSteps: { emoji: string; title: string; say: string; detail: string }[] = [
  { emoji: "🧭", title: "Stand and face the Qibla", say: "Allahu Akbar", detail: "Stand facing the Kaaba in Makkah, raise your hands and say Allahu Akbar to begin." },
  { emoji: "📖", title: "Recite standing (Qiyam)", say: "Al-Fatiha", detail: "With your right hand over your left, recite Surah Al-Fatiha and a short surah." },
  { emoji: "🙇", title: "Bow down (Ruku)", say: "Subhana rabbiyal-Azim", detail: "Bow with your back straight and hands on your knees, glorifying Allah." },
  { emoji: "🧍", title: "Stand up straight", say: "Sami'Allahu liman hamidah", detail: "Rise from bowing and stand up straight again." },
  { emoji: "🕋", title: "Prostrate (Sujud)", say: "Subhana rabbiyal-A'la", detail: "Put your forehead, nose, hands, knees and toes on the ground — the closest you are to Allah." },
  { emoji: "🪑", title: "Sit, then prostrate again", say: "Allahu Akbar", detail: "Sit up calmly, then go down into a second prostration." },
  { emoji: "🤝", title: "Finish with the Tashahhud & Salam", say: "Assalamu Alaikum wa rahmatullah", detail: "After the last unit, sit for the Tashahhud, then turn your face right and left giving salam to end." },
];

function LetsPrayTab() {
  const [tab, setTab] = useState<"wudu" | "salah">("wudu");
  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-center text-themed-muted text-sm mb-4">
        Prayer is how we talk to Allah five times a day. Let&apos;s learn how!
      </p>

      <div className="flex justify-center gap-2 mb-5">
        <button
          onClick={() => setTab("wudu")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${tab === "wudu" ? "bg-gold text-black border-gold" : "card-bg sidebar-border text-themed-muted hover:bg-gold/10"}`}
        >
          1. Wudu
        </button>
        <button
          onClick={() => setTab("salah")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${tab === "salah" ? "bg-gold text-black border-gold" : "card-bg sidebar-border text-themed-muted hover:bg-gold/10"}`}
        >
          2. Salah
        </button>
      </div>

      {tab === "wudu" ? (
        <div className="space-y-3">
          {wuduSteps.map((s, i) => (
            <ContentCard key={i} delay={0.04 + i * 0.04}>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/20 text-gold text-sm flex items-center justify-center font-semibold">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-themed">{s.emoji} {s.title}</p>
                  <p className="text-sm text-themed-muted mt-0.5">{s.detail}</p>
                </div>
              </div>
            </ContentCard>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {salahSteps.map((s, i) => (
            <ContentCard key={i} delay={0.04 + i * 0.04}>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/20 text-gold text-sm flex items-center justify-center font-semibold">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-themed">{s.emoji} {s.title}</p>
                  <p className="text-xs text-gold mt-0.5">Say: {s.say}</p>
                  <p className="text-sm text-themed-muted mt-0.5">{s.detail}</p>
                </div>
              </div>
            </ContentCard>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 rounded-xl bg-gold/5 border border-gold/20">
        <p className="text-xs text-themed">
          <Lightbulb size={12} className="inline text-gold mr-1" />
          The Prophet ﷺ taught families to start teaching children to pray at the age of seven, gently and with love.
        </p>
        <p className="text-[11px] text-themed-muted mt-1.5 italic">Source: Abu Dawud 2:105</p>
      </div>
      <div className="mt-3 text-center">
        <a href="/salah" className="text-xs text-gold hover:underline">Full step-by-step prayer guide for grown-ups &rarr;</a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HEROES OF ISLAM (companion & family stories)
   Anchor narrations are cited; fuller biographies are generically framed.
   ═══════════════════════════════════════════════════════════════════ */

type HeroStory = {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  sections: { title: string; content: string }[];
  source?: string;
  lesson: string;
};

const heroStories: HeroStory[] = [
  {
    slug: "abu-bakr",
    name: "Abu Bakr as-Siddiq",
    emoji: "🫂",
    tagline: "The Prophet's loyal best friend",
    sections: [
      { title: "The true friend", content: "Abu Bakr was the Prophet Muhammad's closest friend. When the Prophet ﷺ told him about the message from Allah, Abu Bakr believed straight away, without any doubt. That is why he was given the name as-Siddiq, which means 'the one who always tells and accepts the truth.'" },
      { title: "The journey to Madinah", content: "When it became dangerous in Makkah, Abu Bakr travelled with the Prophet ﷺ to Madinah. They hid in a cave together, and Abu Bakr was worried for the Prophet's safety, but the Prophet ﷺ comforted him and told him not to be sad, because Allah was with them." },
      { title: "A generous leader", content: "Abu Bakr was known for being gentle, generous, and brave. He freed slaves who were being hurt for believing in Allah, and he gave away his wealth to help others. After the Prophet ﷺ passed away, Abu Bakr became the first leader (Caliph) of the Muslims." },
    ],
    lesson: "A real friend supports you in doing what is right and believes in the truth.",
  },
  {
    slug: "umar",
    name: "Umar ibn al-Khattab",
    emoji: "⚖️",
    tagline: "The strong and just leader",
    sections: [
      { title: "From tough to tender", content: "Umar was a strong, brave man who at first was against Islam. But when he heard the Quran being recited, his heart softened and he became a Muslim. His strength then became a strength for the Muslims." },
      { title: "Famous for justice", content: "As a leader, Umar was known for being fair to everyone, rich or poor. The stories say he would walk the streets at night to check that no one was hungry or in need, and he felt responsible even for a lost animal by the road." },
      { title: "Simple and humble", content: "Even as the leader of a huge land, Umar lived simply and was careful with the people's trust. He listened to people's problems and was known for his honesty and care." },
    ],
    lesson: "True strength is used to protect others and to be fair to everyone.",
  },
  {
    slug: "bilal",
    name: "Bilal ibn Rabah",
    emoji: "📢",
    tagline: "The first caller to prayer",
    sections: [
      { title: "Patient through hardship", content: "Bilal was a slave who believed in one God, Allah. He was hurt badly to make him give up his faith, but he stayed patient and kept saying 'Ahad, Ahad' — meaning 'Allah is One.' Abu Bakr then freed him." },
      { title: "The beautiful voice", content: "Bilal had a beautiful, strong voice. The Prophet ﷺ chose him to call the adhan — the call to prayer. Bilal became the very first muezzin, calling the Muslims to pray five times a day." },
      { title: "Loved and honoured", content: "Even though some people had looked down on Bilal because he was a slave, in Islam he became one of the most loved and respected companions. Islam teaches that people are judged by their faith and character, not their skin or their status." },
    ],
    lesson: "Allah judges us by our faith and good character, not by our looks or wealth.",
  },
  {
    slug: "khadijah",
    name: "Khadijah bint Khuwaylid",
    emoji: "🌷",
    tagline: "The Prophet's beloved wife",
    sections: [
      { title: "A trusted businesswoman", content: "Khadijah was a wise and successful businesswoman in Makkah, known for her honesty and good character. She married the Prophet Muhammad ﷺ, who was known even before prophethood as al-Amin, 'the trustworthy.'" },
      { title: "The first to believe", content: "When the Prophet ﷺ first received revelation and was afraid, Khadijah comforted him and was the very first person to believe in his message. She supported him with her kindness and her wealth." },
      { title: "A pillar of support", content: "Khadijah stood by the Prophet ﷺ through the hardest years in Makkah. He loved and remembered her all his life. She is one of the greatest women in Islam." },
    ],
    lesson: "Comforting and standing by others in hard times is a beautiful act of love.",
  },
  {
    slug: "fatimah",
    name: "Fatimah bint Muhammad",
    emoji: "🌸",
    tagline: "The Prophet's dear daughter",
    sections: [
      { title: "The Prophet's daughter", content: "Fatimah was the beloved daughter of the Prophet Muhammad ﷺ. She was known for being kind, patient, and close to her father. The Prophet ﷺ loved her deeply and honoured her greatly." },
      { title: "A loving mother", content: "Fatimah's sons were al-Hasan and al-Husayn, the Prophet's grandsons. The Prophet ﷺ once kissed al-Hasan in front of a man who said he had ten children and had never kissed any of them. The Prophet ﷺ replied that whoever is not merciful will not be shown mercy." },
      { title: "Simple and content", content: "Fatimah lived a simple life and was patient and grateful. She is honoured as one of the best women ever to live." },
    ],
    source: "Bukhari 78:28",
    lesson: "Showing love and gentleness to children is part of being a good Muslim.",
  },
  {
    slug: "anas",
    name: "Anas ibn Malik",
    emoji: "🧒",
    tagline: "The boy who served the Prophet ﷺ",
    sections: [
      { title: "A young helper", content: "When Anas was still a young boy, his mother brought him to serve the Prophet Muhammad ﷺ. Anas stayed close to the Prophet ﷺ and helped him for about ten years." },
      { title: "Never a harsh word", content: "Anas said that in all those ten years, the Prophet ﷺ never once said 'uff' to him (a small word of annoyance), and never scolded him by asking why he did something or why he didn't. The Prophet ﷺ was always gentle and patient with him." },
      { title: "A great teacher", content: "Because he spent so much time with the Prophet ﷺ, Anas remembered many of his sayings and taught them to others when he grew up. He became one of the companions who passed on the Prophet's teachings." },
    ],
    source: "Bukhari 78:68; Muslim 43:70",
    lesson: "Kind and patient people, like the Prophet ﷺ, never need to be harsh to be respected.",
  },
];

function HeroesTab({
  progress,
  onStar,
  onLessonComplete,
}: {
  age: AgeGroup;
  progress: KidsProgress;
  onStar: () => void;
  onLessonComplete: (id: string) => void;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const [sectionIdx, setSectionIdx] = useState(0);
  const hero = heroStories.find((h) => h.slug === slug);

  if (!slug || !hero) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-themed-muted text-sm mb-4">
          After the prophets, meet the amazing companions and family of the Prophet ﷺ!
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {heroStories.map((h, i) => {
            const done = progress.completedLessons.includes(`hero-${h.slug}`);
            return (
              <ContentCard key={h.slug} delay={0.05 + i * 0.03}>
                <button onClick={() => { setSlug(h.slug); setSectionIdx(0); }} className="w-full text-center p-2">
                  <span className="text-3xl block mb-1">{h.emoji}</span>
                  <p className="text-sm font-medium text-themed leading-tight">{h.name}</p>
                  <p className="text-[10px] text-themed-muted mt-1">{h.tagline}</p>
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

  const section = hero.sections[sectionIdx];
  const isLast = sectionIdx === hero.sections.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => setSlug(null)} className="flex items-center gap-1 text-sm text-themed-muted hover:text-themed mb-4">
        <ChevronLeft size={16} /> All Heroes
      </button>
      <h3 className="text-lg font-semibold text-themed text-center mb-1">{hero.emoji} {hero.name}</h3>
      <p className="text-xs text-themed-muted text-center mb-4">Part {sectionIdx + 1} of {hero.sections.length}: {section.title}</p>

      <ContentCard>
        <h4 className="font-medium text-gold mb-2">{section.title}</h4>
        <p className="text-sm text-themed leading-relaxed">{section.content}</p>
        {isLast && (
          <>
            <div className="mt-3 p-3 rounded-xl bg-gold/5 border border-gold/20">
              <div className="flex items-start gap-2">
                <Heart size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <p className="text-sm text-themed">{hero.lesson}</p>
              </div>
            </div>
            {hero.source && (
              <p className="text-[11px] text-themed-muted mt-2 italic">Source: {hero.source}</p>
            )}
          </>
        )}
      </ContentCard>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setSectionIdx((i) => i - 1)}
          disabled={sectionIdx === 0}
          className="px-4 py-2 rounded-full text-sm card-bg sidebar-border disabled:opacity-30 hover:bg-gold/10 transition"
        >
          <ChevronLeft size={16} className="inline" /> Back
        </button>
        {!isLast ? (
          <button
            onClick={() => setSectionIdx((i) => i + 1)}
            className="px-4 py-2 rounded-full text-sm bg-gold text-black font-medium hover:bg-gold/90 transition"
          >
            Next <ChevronRight size={16} className="inline" />
          </button>
        ) : (
          <button
            onClick={() => { onLessonComplete(`hero-${hero.slug}`); onStar(); setSlug(null); }}
            className="px-4 py-2 rounded-full text-sm bg-gold text-black font-medium hover:bg-gold/90 transition"
          >
            Finish <Star size={14} className="inline ml-1" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SPECIAL DAYS (Ramadan, the two Eids, the Islamic calendar)
   ═══════════════════════════════════════════════════════════════════ */

type SpecialTopic = { id: string; emoji: string; title: string; body: string; source?: string };

const specialDays: SpecialTopic[] = [
  {
    id: "ramadan",
    emoji: "🌙",
    title: "Ramadan — the month of fasting",
    body: "Ramadan is a very special month when grown-up Muslims fast from dawn until sunset — no food or drink while the sun is up. Families wake up early for suhoor, break their fast at sunset with dates and water, and pray extra prayers at night. It is a happy, cosy time of sharing, kindness, and reading lots of Quran. The Prophet ﷺ said that when Ramadan begins, the gates of Paradise are opened!",
    source: "Bukhari 30:8",
  },
  {
    id: "eid-fitr",
    emoji: "🎉",
    title: "Eid al-Fitr — the sweet Eid",
    body: "After a whole month of fasting in Ramadan comes Eid al-Fitr, the 'festival of breaking the fast.' In the morning, families wear their best clothes, pray a special Eid prayer together, give charity to the poor, and enjoy yummy food and sweets. Children often get gifts and money, and everyone says 'Eid Mubarak!'",
  },
  {
    id: "eid-adha",
    emoji: "🐑",
    title: "Eid al-Adha — the greater Eid",
    body: "Eid al-Adha happens later in the year, during the time of Hajj. It remembers how Prophet Ibrahim was ready to obey Allah in everything. Families pray the Eid prayer, and those who are able share meat from a sacrifice with family, friends, and people in need — so everyone can join the celebration.",
  },
  {
    id: "calendar",
    emoji: "📅",
    title: "The Islamic calendar",
    body: "Muslims follow a calendar that goes by the moon, so it has twelve months, starting with Muharram and including the special month of Ramadan and Dhul Hijjah (the month of Hajj). Because it follows the moon, Ramadan and the Eids move a little earlier each year — sometimes in summer, sometimes in winter!",
  },
];

function SpecialDaysTab() {
  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-center text-themed-muted text-sm mb-4">
        The most exciting days in a Muslim child&apos;s year!
      </p>
      <div className="space-y-3">
        {specialDays.map((t, i) => (
          <ContentCard key={t.id} delay={0.05 + i * 0.04}>
            <h3 className="font-semibold text-themed">{t.emoji} {t.title}</h3>
            <p className="text-sm text-themed-muted mt-1.5 leading-relaxed">{t.body}</p>
            {t.source && (
              <p className="text-[11px] text-themed-muted mt-2 italic">Source: {t.source}</p>
            )}
          </ContentCard>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-xl bg-gold/5 border border-gold/20 text-center">
        <Lightbulb size={14} className="inline text-gold mr-1" />
        <span className="text-xs text-themed-muted">
          <strong>Learn Together:</strong> Count down to the next Eid together and plan how to help someone in need!
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ARABIC LETTERS (Little Learners)
   ═══════════════════════════════════════════════════════════════════ */

type ArabicLetter = { order: number; letter: string; name: string; sound: string };

const arabicLetters: ArabicLetter[] = [
  { order: 1, letter: "ا", name: "Alif", sound: "a / long aa" },
  { order: 2, letter: "ب", name: "Ba", sound: "b" },
  { order: 3, letter: "ت", name: "Ta", sound: "t" },
  { order: 4, letter: "ث", name: "Tha", sound: "th (think)" },
  { order: 5, letter: "ج", name: "Jim", sound: "j" },
  { order: 6, letter: "ح", name: "Ha", sound: "h (deep)" },
  { order: 7, letter: "خ", name: "Kha", sound: "kh" },
  { order: 8, letter: "د", name: "Dal", sound: "d" },
  { order: 9, letter: "ذ", name: "Dhal", sound: "dh (this)" },
  { order: 10, letter: "ر", name: "Ra", sound: "r" },
  { order: 11, letter: "ز", name: "Zay", sound: "z" },
  { order: 12, letter: "س", name: "Sin", sound: "s" },
  { order: 13, letter: "ش", name: "Shin", sound: "sh" },
  { order: 14, letter: "ص", name: "Sad", sound: "s (heavy)" },
  { order: 15, letter: "ض", name: "Dad", sound: "d (heavy)" },
  { order: 16, letter: "ط", name: "Ta", sound: "t (heavy)" },
  { order: 17, letter: "ظ", name: "Za", sound: "dh (heavy)" },
  { order: 18, letter: "ع", name: "Ayn", sound: "a deep sound" },
  { order: 19, letter: "غ", name: "Ghayn", sound: "gh" },
  { order: 20, letter: "ف", name: "Fa", sound: "f" },
  { order: 21, letter: "ق", name: "Qaf", sound: "q" },
  { order: 22, letter: "ك", name: "Kaf", sound: "k" },
  { order: 23, letter: "ل", name: "Lam", sound: "l" },
  { order: 24, letter: "م", name: "Mim", sound: "m" },
  { order: 25, letter: "ن", name: "Nun", sound: "n" },
  { order: 26, letter: "ه", name: "Ha", sound: "h" },
  { order: 27, letter: "و", name: "Waw", sound: "w / long oo" },
  { order: 28, letter: "ي", name: "Ya", sound: "y / long ee" },
];

function ArabicAlphabetTab() {
  const [idx, setIdx] = useState<number | null>(null);
  const active = idx !== null ? arabicLetters[idx] : null;

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-center text-themed-muted text-sm mb-4">
        Arabic has 28 letters. Tap a letter to hear its name and sound!
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
        {arabicLetters.map((l, i) => (
          <button
            key={l.order}
            onClick={() => setIdx(i)}
            className={`aspect-square rounded-xl border flex items-center justify-center text-2xl font-arabic transition ${idx === i ? "bg-gold text-black border-gold" : "card-bg sidebar-border hover:bg-gold/10"}`}
          >
            {l.letter}
          </button>
        ))}
      </div>

      {active && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <ContentCard>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-arabic text-gold">{active.letter}</span>
              <div>
                <p className="font-semibold text-themed">Letter {active.order}: {active.name}</p>
                <p className="text-sm text-themed-muted mt-0.5">Sound: {active.sound}</p>
              </div>
            </div>
          </ContentCard>
        </motion.div>
      )}

      <div className="mt-4 p-3 rounded-xl bg-gold/5 border border-gold/20 text-center">
        <Lightbulb size={14} className="inline text-gold mr-1" />
        <span className="text-xs text-themed-muted">
          <strong>Learn Together:</strong> Point to a letter and take turns saying its name — knowing the letters is the first step to reading the Quran!
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PARENTS' GUIDE (collapsible orientation card)
   ═══════════════════════════════════════════════════════════════════ */

function ParentsGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 rounded-2xl border sidebar-border card-bg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 p-3 text-left"
      >
        <Lightbulb size={16} className="text-gold shrink-0" />
        <span className="text-sm font-semibold text-themed flex-1">For Parents &amp; Teachers</span>
        <ChevronDown size={16} className={`text-themed-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4 space-y-3 text-sm text-themed-muted">
              <p>
                <strong className="text-themed">Pick an age level</strong> at the top of the page. <em>Little Learner (4–6)</em> keeps lessons short and gentle, <em>Explorer (7–9)</em> adds more detail and stories, and <em>Scholar (10–12)</em> unlocks the full content and quizzes.
              </p>
              <p>
                <strong className="text-themed">A suggested weekly rhythm:</strong> one belief or manner to talk about, a few daily words or a dua to practice, one prophet or hero story to read together, and a short Quran surah to work on. End the day with the Good Deeds checklist.
              </p>
              <p>
                <strong className="text-themed">Learn together.</strong> Every lesson ends with a &ldquo;Learn Together&rdquo; tip — a small question or activity to do side by side. Children remember most what they do and say with you, not just what they tap.
              </p>
              <p>
                <strong className="text-themed">Celebrate progress.</strong> Stars, streaks, and badges are there to encourage, not to pressure. Praise effort and consistency over perfect scores.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

function KidsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // null = lesson-card landing grid; ?tab= deep links open that lesson directly.
  const [activeLesson, setActiveLesson] = useState<TabKey | null>(() => {
    const tab = searchParams.get("tab");
    return tab && lessons.some((l) => l.key === tab) ? (tab as TabKey) : null;
  });
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

  const selectLesson = useCallback(
    (key: TabKey | null) => {
      setActiveLesson(key);
      router.replace(key ? `${pathname}?tab=${key}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  if (!progress) return null;

  const lesson = activeLesson ? lessons.find((l) => l.key === activeLesson) : undefined;

  return (
    <div className="pb-24">
      <PageHeader
        title="Kids Learning"
        titleAr="تعليم الأطفال"
        subtitle="A fun way for parents and children to learn Islam together"
      />

      {!lesson && (
        <VerseHero
          arabic="رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعْيُنٍۢ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا"
          text="Our Lord, grant us from our spouses and offspring comfort to our eyes, and make us a leader for the righteous."
          reference="Quran 25:74"
        />
      )}

      <div className="max-w-5xl mx-auto px-4">

      <AnimatePresence mode="wait">
        {lesson ? (
          /* ── Lesson full-view ── */
          <motion.div
            key={lesson.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <button
                onClick={() => selectLesson(null)}
                className="flex items-center gap-1.5 text-sm text-themed-muted hover:text-gold transition-colors"
              >
                <ArrowLeft size={15} />
                All lessons
              </button>
              <AgeGroupSelector value={progress.ageGroup} onChange={handleAgeChange} />
            </div>

            <div className="flex items-center gap-2.5 mb-5">
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${lesson.chipClass}`}>
                <lesson.icon size={16} />
              </span>
              <h2 className="text-lg font-semibold text-themed">{lesson.label}</h2>
            </div>

            {lesson.key === "who-is-allah" && (
              <WhoIsAllahTab age={progress.ageGroup} progress={progress} onStar={handleStar} />
            )}
            {lesson.key === "iman-pillars" && (
              <ImanPillarsTab age={progress.ageGroup} progress={progress} onStar={handleStar} onLessonComplete={handleLessonComplete} />
            )}
            {lesson.key === "five-pillars" && (
              <FivePillarsTab age={progress.ageGroup} progress={progress} onStar={handleStar} onLessonComplete={handleLessonComplete} />
            )}
            {lesson.key === "lets-pray" && (
              <LetsPrayTab />
            )}
            {lesson.key === "my-duas" && (
              <MyDuasTab age={progress.ageGroup} progress={progress} onStar={handleStar} />
            )}
            {lesson.key === "daily-words" && (
              <DailyWordsTab age={progress.ageGroup} progress={progress} onStar={handleStar} />
            )}
            {lesson.key === "good-manners" && (
              <GoodMannersTab age={progress.ageGroup} progress={progress} onStar={handleStar} onLessonComplete={handleLessonComplete} />
            )}
            {lesson.key === "prophet-stories" && (
              <ProphetStoriesTab age={progress.ageGroup} progress={progress} onStar={handleStar} onLessonComplete={handleLessonComplete} />
            )}
            {lesson.key === "heroes" && (
              <HeroesTab age={progress.ageGroup} progress={progress} onStar={handleStar} onLessonComplete={handleLessonComplete} />
            )}
            {lesson.key === "quran-corner" && (
              <QuranCornerTab progress={progress} onStar={handleStar} />
            )}
            {lesson.key === "arabic-alphabet" && (
              <ArabicAlphabetTab />
            )}
            {lesson.key === "good-deeds" && (
              <GoodDeedsTab age={progress.ageGroup} progress={progress} />
            )}
            {lesson.key === "special-days" && (
              <SpecialDaysTab />
            )}
            {lesson.key === "challenges" && (
              <ChallengesTab age={progress.ageGroup} progress={progress} onStar={handleStar} />
            )}
          </motion.div>
        ) : (
          /* ── Lesson-card landing grid ── */
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4">
              <AgeGroupSelector value={progress.ageGroup} onChange={handleAgeChange} />
            </div>
            <ProgressDashboard progress={progress} />

            <ParentsGuide />

            <div className="grid gap-3 sm:grid-cols-2">
              {lessons.map((l, i) => {
                const hint = l.hint(progress, progress.ageGroup);
                return (
                  <motion.button
                    key={l.key}
                    onClick={() => selectLesson(l.key)}
                    className="card-bg border sidebar-border rounded-2xl p-4 w-full text-left flex items-center gap-4 transition-colors hover:border-[var(--color-gold)]/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${l.chipClass}`}>
                      <l.icon size={24} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-themed">{l.label}</span>
                      <span className="block text-xs text-themed-muted mt-0.5 leading-relaxed">{l.description}</span>
                      {hint && (
                        <span className="flex items-center gap-1 text-[11px] text-gold mt-1.5">
                          <Star size={10} fill="currentColor" /> {hint}
                        </span>
                      )}
                    </span>
                    <ChevronRight size={18} className="text-themed-muted shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default function KidsLearningPage() {
  return (
    <Suspense>
      <KidsContent />
    </Suspense>
  );
}
