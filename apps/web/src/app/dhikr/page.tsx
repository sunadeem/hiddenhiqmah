"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import { useDailyAdapter } from "@/lib/daily/useDailyAdapter";
import { todayLocalDate } from "@hidden-hiqmah/ui/lib/daily/types";
import { RotateCcw, Pencil, Check, Plus } from "lucide-react";
import BookmarkButton from "@hidden-hiqmah/ui/components/BookmarkButton";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import { DHIKR_CATALOG_BY_KEY } from "@/lib/dhikr/catalog";
import { hapticSelection } from "@/lib/mobile/haptics";
import PageTip from "@/components/mobile/PageTip";
import {
  getWorshipDhikr,
  addWorshipDhikr,
  removeWorshipDhikr,
  setWorshipGoal,
  subscribeWorshipDhikr,
  useWorshipDhikrSync,
} from "@/lib/dhikr/worshipDhikr";
import {
  AddDhikrDialog,
  ManageRow,
  type ManageCard,
} from "@/components/dhikr/DhikrEditing";

type DhikrItem = {
  id: string;
  /** Shared count key — the same key the Worship-tab dhikr uses, so counting
      here and there stays in unison and feeds Dhikr Stats. */
  dhikrKey: string;
  arabic: string;
  transliteration: string;
  english: string;
  target: number | null; // null = free (unlimited)
  hadith?: string;
};

// The page's base cards. The user's *custom* cards (added via the Worship tab
// or the "Add dhikr" affordance below) are merged in on top of these, and any
// per-card rep-goal overrides are applied — so this page and the Worship tab
// show the same custom dhikr, goals, and counts.
const BASE_DHIKR: DhikrItem[] = [
  {
    id: "subhanallah",
    dhikrKey: "subhanallah",
    arabic: "سبحان الله",
    transliteration: "SubhanAllah",
    english: "Glory be to Allah",
    target: 33,
    hadith: "Muslim 5:184",
  },
  {
    id: "alhamdulillah",
    dhikrKey: "alhamdulillah",
    arabic: "الحمد لله",
    transliteration: "Alhamdulillah",
    english: "Praise be to Allah",
    target: 33,
    hadith: "Muslim 5:184",
  },
  {
    id: "allahu-akbar",
    dhikrKey: "takbir",
    arabic: "الله أكبر",
    transliteration: "Allahu Akbar",
    english: "Allah is the Greatest",
    target: 34,
    hadith: "Muslim 5:184",
  },
  {
    id: "la-ilaha-illallah",
    dhikrKey: "tahlil",
    arabic: "لا إله إلا الله",
    transliteration: "La ilaha illallah",
    english: "There is no god but Allah",
    target: 100,
    hadith: "Bukhari 80:98",
  },
  {
    id: "subhanallahi-wa-bihamdihi",
    dhikrKey: "subhanallah_hamd",
    arabic: "سبحان الله وبحمده",
    transliteration: "SubhanAllahi wa bihamdihi",
    english: "Glory and praise be to Allah",
    target: 100,
    hadith: "Bukhari 80:100",
  },
  {
    id: "astaghfirullah",
    dhikrKey: "istighfar",
    arabic: "أستغفر الله",
    transliteration: "Astaghfirullah",
    english: "I seek forgiveness from Allah",
    target: 100,
    hadith: "Bukhari 80:4",
  },
  {
    id: "la-hawla",
    dhikrKey: "hawqala",
    arabic: "لا حول ولا قوة إلا بالله",
    transliteration: "La hawla wa la quwwata illa billah",
    english: "There is no power except with Allah",
    target: null,
    hadith: "Bukhari 80:79",
  },
  {
    id: "salawat",
    dhikrKey: "salawat",
    arabic: "اللهم صل على محمد",
    transliteration: "Salawat on the Prophet",
    english: "O Allah, send blessings upon Muhammad",
    target: 100,
    hadith: "Muslim 4:74",
  },
];

const BASE_KEYS = new Set(BASE_DHIKR.map((d) => d.dhikrKey));

type DhikrCardModel = {
  id: string;
  dhikrKey: string;
  arabic: string;
  transliteration: string;
  english: string;
  target: number | null; // counting ring (null = free)
  manageGoal: number; // goal-stepper value (always a number)
  hadith?: string;
  isCustom: boolean;
};

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
  dhikr: DhikrCardModel;
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
    <ContentCard id={dhikr.id} delay={delay} className="relative overflow-hidden h-full">
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
            {dhikr.english && (
              <p className="text-xs text-themed-muted mt-0.5">{dhikr.english}</p>
            )}
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
          subtitle={dhikr.english || dhikr.transliteration}
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
  const { adapter } = useDailyAdapter();
  useWorshipDhikrSync();
  const [today] = useState(() => todayLocalDate());
  const [store, setStore] = useState(() => getWorshipDhikr());
  const [counts, setCounts] = useState<Record<string, number>>({}); // keyed by dhikrKey
  const [mounted, setMounted] = useState(false);
  const [manage, setManage] = useState(false);
  const [adding, setAdding] = useState(false);
  const pending = useRef<Record<string, number>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => subscribeWorshipDhikr(() => setStore(getWorshipDhikr())), []);

  // Base cards (with any rep-goal overrides applied) + the user's custom cards.
  const cards: DhikrCardModel[] = useMemo(() => {
    const base = BASE_DHIKR.map((d): DhikrCardModel => {
      const override = store.goals[d.dhikrKey];
      const fallback =
        d.target ?? DHIKR_CATALOG_BY_KEY[d.dhikrKey]?.defaultGoal ?? 33;
      return {
        id: d.id,
        dhikrKey: d.dhikrKey,
        arabic: d.arabic,
        transliteration: d.transliteration,
        english: d.english,
        target: override ?? d.target,
        manageGoal: override ?? fallback,
        hadith: d.hadith,
        isCustom: false,
      };
    });
    const customs = store.added.flatMap((k): DhikrCardModel[] => {
      if (BASE_KEYS.has(k)) return [];
      const e = DHIKR_CATALOG_BY_KEY[k];
      if (!e) return [];
      const goal = store.goals[k] ?? e.defaultGoal;
      return [
        {
          id: k,
          dhikrKey: k,
          arabic: e.arabic,
          transliteration: e.translit,
          english: e.english,
          target: goal,
          manageGoal: goal,
          hadith: e.reference,
          isCustom: true,
        },
      ];
    });
    return [...base, ...customs];
  }, [store]);

  const keysSig = useMemo(() => cards.map((c) => c.dhikrKey).join(","), [cards]);
  const presentKeys = useMemo(() => new Set(cards.map((c) => c.dhikrKey)), [cards]);

  // Load today's counts for each card from the shared date-keyed adapter, so
  // this page and the Worship tab stay in unison. Re-runs when the card set
  // changes (custom card added/removed) or the adapter swaps (sign-in/out).
  useEffect(() => {
    let alive = true;
    const keys = keysSig ? keysSig.split(",") : [];
    Promise.all(
      keys.map((key) =>
        adapter.getDhikr(key, today).then((s) => [key, s.daily] as const)
      )
    )
      .then((entries) => {
        if (alive) {
          setCounts(Object.fromEntries(entries));
          setMounted(true);
        }
      })
      .catch(() => {
        if (alive) setMounted(true);
      });
    return () => {
      alive = false;
    };
  }, [adapter, today, keysSig]);

  useEffect(() => {
    if (!scrollToItem) return;
    const t = setTimeout(() => {
      const el = document.getElementById(scrollToItem);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("section-highlight");
        setTimeout(() => el.classList.remove("section-highlight"), 2000);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [scrollToItem]);

  const flush = useCallback(() => {
    const p = pending.current;
    pending.current = {};
    for (const [key, delta] of Object.entries(p)) {
      if (delta > 0)
        void adapter
          .incrementDhikr(key, today, delta)
          .then((s) => setCounts((c) => ({ ...c, [key]: s.daily })))
          .catch(() => {});
    }
  }, [adapter, today]);

  const increment = useCallback(
    (key: string) => {
      hapticSelection();
      setCounts((c) => ({ ...c, [key]: (c[key] || 0) + 1 }));
      pending.current[key] = (pending.current[key] || 0) + 1;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 600);
    },
    [flush]
  );

  const reset = useCallback(
    async (key: string) => {
      if (timer.current) clearTimeout(timer.current);
      pending.current[key] = 0;
      const s = await adapter.resetDhikrDay(key, today);
      setCounts((c) => ({ ...c, [key]: s.daily }));
    },
    [adapter, today]
  );

  const resetAll = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    pending.current = {};
    const keys = keysSig ? keysSig.split(",") : [];
    await Promise.all(keys.map((key) => adapter.resetDhikrDay(key, today)));
    setCounts(Object.fromEntries(keys.map((key) => [key, 0])));
  }, [adapter, today, keysSig]);

  // Flush any pending taps on unmount.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      flush();
    },
    [flush]
  );

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const manageCards: ManageCard[] = useMemo(
    () =>
      cards.map((c) => ({
        key: c.dhikrKey,
        label: DHIKR_CATALOG_BY_KEY[c.dhikrKey]?.label ?? c.transliteration,
        goal: c.manageGoal,
        isCustom: c.isCustom,
      })),
    [cards]
  );

  if (!mounted) return null;

  return (
    <div>
      <PageTip
        tips={[
          {
            key: "dhikr-tap-v2",
            title: "Tap to count",
            body: "Tap any dhikr card to count your recitation — the ring fills as you go, and today's progress saves automatically.",
          },
        ]}
      />
      <PageHeader
        title="Dhikr"
        titleAr="الذكر"
        subtitle="Tasbeeh counter for daily remembrance of Allah."
        action={
          <div className="flex items-center gap-2">
            {!manage && totalCount > 0 && (
              <button
                onClick={resetAll}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-themed-muted hover:text-themed hover:bg-white/10 transition-colors border sidebar-border"
              >
                <RotateCcw size={14} />
                Reset All
              </button>
            )}
            <button
              onClick={() => setManage((m) => !m)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors border sidebar-border ${
                manage
                  ? "text-gold"
                  : "text-themed-muted hover:text-themed hover:bg-white/10"
              }`}
            >
              {manage ? <Check size={14} /> : <Pencil size={14} />}
              {manage ? "Done" : "Edit"}
            </button>
          </div>
        }
      />

      <ContentCard className="mb-6">
        <div className="text-center py-4">
          <p className="text-2xl font-arabic text-gold leading-loose mb-3">
            أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ
          </p>
          <p className="text-themed-muted italic">&ldquo;Verily, in the remembrance of Allah do hearts find rest.&rdquo;</p>
          <p className="text-xs text-themed-muted mt-1">Quran 13:28</p>
        </div>
      </ContentCard>

      <div className="max-w-5xl mx-auto">
        {manage ? (
          <div className="max-w-2xl mx-auto space-y-2">
            {manageCards.map((c) => (
              <ManageRow
                key={c.key}
                card={c}
                onGoal={(g) => setWorshipGoal(c.key, g)}
                onDelete={() => removeWorshipDhikr(c.key)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:auto-rows-fr">
            {cards.map((dhikr, i) => (
              <DhikrCard
                key={dhikr.dhikrKey}
                dhikr={dhikr}
                count={counts[dhikr.dhikrKey] || 0}
                onIncrement={() => increment(dhikr.dhikrKey)}
                onReset={() => reset(dhikr.dhikrKey)}
                delay={0.05 + i * 0.05}
              />
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto mt-4">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed sidebar-border text-themed-muted hover:text-gold py-3 text-sm font-medium touch-manipulation active:scale-[0.99] transition"
          >
            <Plus size={16} /> Add dhikr
          </button>
        </div>
      </div>

      {adding && (
        <AddDhikrDialog
          presentKeys={presentKeys}
          onClose={() => setAdding(false)}
          onAdd={(key, goal) => {
            addWorshipDhikr(key, goal);
            setAdding(false);
          }}
        />
      )}
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
