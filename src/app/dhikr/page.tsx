"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import { getDhikrCounts, setDhikrCount } from "@/lib/storage";
import { RotateCcw } from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";
import HadithRefText from "@/components/HadithRefText";

type DhikrItem = {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  target: number | null; // null = free (unlimited)
  hadith?: string;
};

const dhikrList: DhikrItem[] = [
  {
    id: "subhanallah",
    arabic: "سبحان الله",
    transliteration: "SubhanAllah",
    english: "Glory be to Allah",
    target: 33,
    hadith: "Muslim 4:147",
  },
  {
    id: "alhamdulillah",
    arabic: "الحمد لله",
    transliteration: "Alhamdulillah",
    english: "Praise be to Allah",
    target: 33,
    hadith: "Muslim 4:147",
  },
  {
    id: "allahu-akbar",
    arabic: "الله أكبر",
    transliteration: "Allahu Akbar",
    english: "Allah is the Greatest",
    target: 34,
    hadith: "Muslim 4:147",
  },
  {
    id: "la-ilaha-illallah",
    arabic: "لا إله إلا الله",
    transliteration: "La ilaha illallah",
    english: "There is no god but Allah",
    target: 100,
    hadith: "Bukhari 80:98",
  },
  {
    id: "subhanallahi-wa-bihamdihi",
    arabic: "سبحان الله وبحمده",
    transliteration: "SubhanAllahi wa bihamdihi",
    english: "Glory and praise be to Allah",
    target: 100,
    hadith: "Bukhari 80:100",
  },
  {
    id: "astaghfirullah",
    arabic: "أستغفر الله",
    transliteration: "Astaghfirullah",
    english: "I seek forgiveness from Allah",
    target: 100,
    hadith: "Bukhari 80:4",
  },
  {
    id: "la-hawla",
    arabic: "لا حول ولا قوة إلا بالله",
    transliteration: "La hawla wa la quwwata illa billah",
    english: "There is no power except with Allah",
    target: null,
    hadith: "Bukhari 64:245",
  },
  {
    id: "salawat",
    arabic: "اللهم صل على محمد",
    transliteration: "Salawat on the Prophet",
    english: "O Allah, send blessings upon Muhammad",
    target: 100,
    hadith: "Muslim 4:66",
  },
];

const CIRCLE_RADIUS = 36;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

function ProgressRing({
  count,
  target,
}: {
  count: number;
  target: number | null;
}) {
  const progress = target ? Math.min(count / target, 1) : 0;
  const offset = CIRCLE_CIRCUMFERENCE - progress * CIRCLE_CIRCUMFERENCE;
  const isComplete = target !== null && count >= target;

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="48"
          cy="48"
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="var(--color-sidebar-border, rgba(255,255,255,0.1))"
          strokeWidth="4"
        />
        {/* Progress arc */}
        {target !== null && (
          <motion.circle
            cx="48"
            cy="48"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCLE_CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </svg>
      {/* Count text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-lg font-bold ${
            isComplete ? "text-gold" : "text-themed"
          }`}
        >
          {count}
        </span>
        {target !== null ? (
          <span className="text-[10px] text-themed-muted">/ {target}</span>
        ) : (
          <span className="text-[10px] text-themed-muted">free</span>
        )}
      </div>
    </div>
  );
}

function DhikrCard({
  dhikr,
  count,
  onIncrement,
  onReset,
  delay,
}: {
  dhikr: DhikrItem;
  count: number;
  onIncrement: () => void;
  onReset: () => void;
  delay: number;
}) {
  const isComplete = dhikr.target !== null && count >= dhikr.target;
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (isComplete) {
      setShowComplete(true);
      const timer = setTimeout(() => setShowComplete(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  return (
    <ContentCard id={dhikr.id} delay={delay} className="relative overflow-hidden">
      {/* Completion glow overlay */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-[var(--color-gold)]/5 pointer-events-none rounded-xl"
          />
        )}
      </AnimatePresence>

      {/* Tap area */}
      <button
        onClick={onIncrement}
        className="w-full text-left cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-4">
          <ProgressRing count={count} target={dhikr.target} />
          <div className="flex-1 min-w-0">
            <p className="text-xl font-arabic text-gold leading-relaxed">
              {dhikr.arabic}
            </p>
            <p className="text-sm font-semibold text-themed mt-1">
              {dhikr.transliteration}
            </p>
            <p className="text-xs text-themed-muted mt-0.5">{dhikr.english}</p>
            {dhikr.hadith && (
              <p className="text-[10px] text-themed-muted/60 mt-1.5 italic">
                <HadithRefText text={dhikr.hadith} />
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Top-right actions */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {count > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-themed-muted hover:text-themed transition-colors"
            title="Reset count"
          >
            <RotateCcw size={14} />
          </motion.button>
        )}
        <BookmarkButton
          type="dhikr"
          id={dhikr.id}
          title={dhikr.transliteration}
          subtitle={dhikr.english}
          href={`/dhikr?item=${dhikr.id}`}
        />
      </div>

      {/* Completion badge */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center"
          >
            <span className="text-[10px] font-semibold text-gold uppercase tracking-widest">
              Complete
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </ContentCard>
  );
}

function DhikrPageInner() {
  const searchParams = useSearchParams();
  const scrollToItem = searchParams.get("item");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCounts(getDhikrCounts());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!scrollToItem) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(scrollToItem);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("section-highlight");
        setTimeout(() => el.classList.remove("section-highlight"), 2000);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [scrollToItem]);

  const increment = useCallback((id: string) => {
    setCounts((prev) => {
      const newCount = (prev[id] || 0) + 1;
      setDhikrCount(id, newCount);
      return { ...prev, [id]: newCount };
    });
  }, []);

  const reset = useCallback((id: string) => {
    setCounts((prev) => {
      setDhikrCount(id, 0);
      return { ...prev, [id]: 0 };
    });
  }, []);

  const resetAll = useCallback(() => {
    setCounts((prev) => {
      const cleared: Record<string, number> = {};
      for (const key of Object.keys(prev)) {
        cleared[key] = 0;
        setDhikrCount(key, 0);
      }
      return cleared;
    });
  }, []);

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Dhikr"
        titleAr="الذكر"
        subtitle="Tasbeeh counter for daily remembrance of Allah."
        action={
          totalCount > 0 ? (
            <button
              onClick={resetAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-themed-muted hover:text-themed hover:bg-white/10 transition-colors border sidebar-border"
            >
              <RotateCcw size={14} />
              Reset All
            </button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dhikrList.map((dhikr, i) => (
          <DhikrCard
            key={dhikr.id}
            dhikr={dhikr}
            count={counts[dhikr.id] || 0}
            onIncrement={() => increment(dhikr.id)}
            onReset={() => reset(dhikr.id)}
            delay={0.05 + i * 0.05}
          />
        ))}
      </div>
    </div>
  );
}

export default function DhikrPage() {
  return (
    <Suspense>
      <DhikrPageInner />
    </Suspense>
  );
}
