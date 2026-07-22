"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import { useDailyAdapter } from "@/lib/daily/useDailyAdapter";
import { todayLocalDate } from "@hidden-hiqmah/ui/lib/daily/types";
import { RotateCcw, Pencil, Check, Plus, Play, X } from "lucide-react";
import BookmarkButton from "@hidden-hiqmah/ui/components/BookmarkButton";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import { DHIKR_CATALOG_BY_KEY } from "@/lib/dhikr/catalog";
import { hapticLight } from "@/lib/mobile/haptics";
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
  /** One-line "why this dhikr" reward narration; refs inside are linkified. */
  virtue?: string;
};

// The page's base cards. The user's *custom* cards (added via the Worship tab
// or the "Add dhikr" affordance below) are merged in on top of these, and any
// per-card rep-goal overrides are applied — so this page and the Worship tab
// show the same custom dhikr, goals, and counts.
const BASE_DHIKR = [
  {
    id: "subhanallah",
    dhikrKey: "subhanallah",
    arabic: "سبحان الله",
    transliteration: "SubhanAllah",
    english: "Glory be to Allah",
    target: 33,
    hadith: "Muslim 5:184",
    virtue: "With Alhamdulillah it fills what is between the heavens and the earth (Muslim 2:1).",
  },
  {
    id: "alhamdulillah",
    dhikrKey: "alhamdulillah",
    arabic: "الحمد لله",
    transliteration: "Alhamdulillah",
    english: "Praise be to Allah",
    target: 33,
    hadith: "Muslim 5:184",
    virtue: "It fills the Scale of good deeds, and is the best supplication (Muslim 2:1; Tirmidhi 48:14).",
  },
  {
    id: "allahu-akbar",
    dhikrKey: "takbir",
    arabic: "الله أكبر",
    transliteration: "Allahu Akbar",
    english: "Allah is the Greatest",
    target: 34,
    hadith: "Muslim 5:184",
    virtue: "Said 34 times after every prescribed prayer, its reciter is never left disappointed (Muslim 5:186).",
  },
  {
    id: "la-ilaha-illallah",
    dhikrKey: "tahlil",
    arabic: "لا إله إلا الله",
    transliteration: "La ilaha illallah",
    english: "There is no god but Allah",
    target: 100,
    hadith: "Bukhari 80:98",
    virtue: "The best remembrance (Tirmidhi 48:14). Said in its full form — La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer — 100 times a day, it equals freeing ten slaves and guards you from Shaytan until nightfall (Bukhari 80:98).",
  },
  {
    id: "subhanallahi-wa-bihamdihi",
    dhikrKey: "subhanallah_hamd",
    arabic: "سبحان الله وبحمده",
    transliteration: "SubhanAllahi wa bihamdihi",
    english: "Glory and praise be to Allah",
    target: 100,
    hadith: "Bukhari 80:100",
    virtue: "Two words light on the tongue, heavy on the Scale, beloved to the Most Merciful; said 100 times a day, sins are forgiven though they be like the foam of the sea (Bukhari 80:101; Bukhari 80:100).",
  },
  {
    id: "astaghfirullah",
    dhikrKey: "istighfar",
    arabic: "أستغفر الله",
    transliteration: "Astaghfirullah",
    english: "I seek forgiveness from Allah",
    target: 100,
    hadith: "Bukhari 80:4",
    virtue: "The Prophet ﷺ would be counted seeking forgiveness a hundred times in a single sitting (Tirmidhi 48:65).",
  },
  {
    id: "la-hawla",
    dhikrKey: "hawqala",
    arabic: "لا حول ولا قوة إلا بالله",
    transliteration: "La hawla wa la quwwata illa billah",
    english: "There is no power except with Allah",
    target: null,
    hadith: "Bukhari 80:79",
    virtue: "It is a treasure from the treasures of Paradise (Bukhari 80:79).",
  },
  {
    id: "salawat",
    dhikrKey: "salawat",
    arabic: "اللهم صل على محمد",
    transliteration: "Salawat on the Prophet",
    english: "O Allah, send blessings upon Muhammad",
    target: 100,
    hadith: "Muslim 4:74",
    virtue: "Whoever sends blessings upon the Prophet ﷺ once, Allah sends ten blessings upon him (Muslim 4:74).",
  },
] as const satisfies DhikrItem[];

const BASE_KEYS: Set<string> = new Set(BASE_DHIKR.map((d) => d.dhikrKey));
const BASE_BY_KEY: Record<string, DhikrItem> = Object.fromEntries(
  BASE_DHIKR.map((d) => [d.dhikrKey, d])
);

/** Union of the base dhikr keys, derived from BASE_DHIKR itself — a preset
    step with a typo'd or stale key now fails tsc instead of silently no-op'ing. */
type BaseDhikrKey = (typeof BASE_DHIKR)[number]["dhikrKey"];

// ---------- Guided sequences (presets) ----------
// Each step chains an EXISTING shared dhikrKey, so every tap in a sequence
// writes through the same counter as the card below — nothing double-counts,
// and Dhikr Stats / the Worship tab stay in unison.

/** The full tahlil said once to complete the hundred (Muslim 5:188). */
const FULL_TAHLIL_ARABIC = "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ";

type PresetStep = {
  dhikrKey: BaseDhikrKey;
  reps: number;
  /** Display overrides (e.g. the full tahlil wording for the completion step);
      falls back to the base card's wording. */
  arabic?: string;
  transliteration?: string;
  english?: string;
  note?: string;
};

type DhikrPreset = {
  id: string;
  title: string;
  subtitle: string;
  refs: string;
  steps: PresetStep[];
};

const PRESETS: DhikrPreset[] = [
  {
    id: "after-prayer",
    title: "After every prayer",
    subtitle:
      "Istighfar ×3, then SubhanAllah, Alhamdulillah, and Allahu Akbar ×33 each — sealed with the tahlil to complete 100.",
    refs: "Muslim 5:171; Muslim 5:188",
    steps: [
      {
        dhikrKey: "istighfar",
        reps: 3,
        note: "The Prophet ﷺ sought forgiveness three times when he finished the prayer (Muslim 5:171).",
      },
      { dhikrKey: "subhanallah", reps: 33 },
      { dhikrKey: "alhamdulillah", reps: 33 },
      {
        dhikrKey: "takbir",
        reps: 33,
        note: "Muslim 5:186 also records thirty-four takbirs after every prescribed prayer.",
      },
      {
        dhikrKey: "tahlil",
        reps: 1,
        arabic: FULL_TAHLIL_ARABIC,
        transliteration:
          "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
        english:
          "None has the right to be worshipped except Allah alone, without any partner. To Him belongs the dominion and to Him belongs all praise, and He is over all things capable.",
        note: "Said once to complete the hundred — sins forgiven even if like the foam of the sea (Muslim 5:188).",
      },
    ],
  },
  {
    id: "before-sleep",
    title: "Before sleep",
    subtitle:
      "The Tasbih of Fatimah at bedtime — Allahu Akbar ×34, SubhanAllah ×33, Alhamdulillah ×33.",
    refs: "Bukhari 80:15; Muslim 48:108",
    steps: [
      {
        dhikrKey: "takbir",
        reps: 34,
        note: "“Better for you than a servant” — the Prophet ﷺ to Ali and Fatimah (Bukhari 80:15); the 34/33/33 count follows Muslim 48:108.",
      },
      { dhikrKey: "subhanallah", reps: 33 },
      { dhikrKey: "alhamdulillah", reps: 33 },
    ],
  },
];

type DhikrCardModel = {
  id: string;
  dhikrKey: string;
  arabic: string;
  transliteration: string;
  english: string;
  target: number | null; // counting ring (null = free)
  manageGoal: number; // goal-stepper value (always a number)
  hadith?: string;
  virtue?: string;
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
            {dhikr.virtue && (
              <p className="text-[11px] text-themed-muted mt-1.5 leading-snug">
                <HadithRefText text={dhikr.virtue} />
              </p>
            )}
            {dhikr.hadith && !dhikr.virtue && (
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

function SequencePlayer({
  preset,
  onCount,
  onClose,
}: {
  preset: DhikrPreset;
  /** Routes through the page's shared increment — same counters as the cards. */
  onCount: (dhikrKey: string) => void;
  onClose: () => void;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [stepDone, setStepDone] = useState(0);
  const [finished, setFinished] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    []
  );

  const step = preset.steps[stepIdx];
  const base = BASE_BY_KEY[step.dhikrKey];
  const arabic = step.arabic ?? base.arabic;
  const transliteration = step.transliteration ?? base.transliteration;
  const english = step.english ?? base.english;
  const stepComplete = stepDone >= step.reps;

  const tap = () => {
    if (finished || stepComplete) return;
    onCount(step.dhikrKey);
    const next = stepDone + 1;
    setStepDone(next);
    if (next >= step.reps) {
      advanceTimer.current = setTimeout(() => {
        if (stepIdx + 1 < preset.steps.length) {
          setStepIdx((i) => i + 1);
          setStepDone(0);
        } else {
          setFinished(true);
        }
      }, 700);
    }
  };

  return (
    <ContentCard className="relative overflow-hidden mb-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gold">{preset.title}</p>
          <p className="text-[11px] text-themed-muted mt-0.5">
            {finished
              ? "Sequence complete"
              : `Step ${stepIdx + 1} of ${preset.steps.length}`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-themed-muted hover:text-themed transition-colors shrink-0"
          title="Exit sequence"
        >
          <X size={16} />
        </button>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-1.5 mt-3">
        {preset.steps.map((s, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all ${
              i < stepIdx || finished
                ? "bg-[var(--color-gold)] flex-1"
                : i === stepIdx
                  ? "bg-[var(--color-gold)]/50 flex-[2]"
                  : "bg-white/10 flex-1"
            }`}
          />
        ))}
      </div>

      {finished ? (
        <div className="text-center py-6">
          <Check size={28} className="mx-auto text-gold" />
          <p className="text-sm font-semibold text-themed mt-2">
            Sequence complete
          </p>
          <p className="text-[10px] text-themed-muted/60 mt-1.5 italic">
            <HadithRefText text={preset.refs} />
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-medium text-gold border sidebar-border hover:bg-white/10 transition-colors"
          >
            Done
          </button>
        </div>
      ) : (
        <>
          {/* Tap area for the current step */}
          <button
            onClick={tap}
            className="w-full text-left cursor-pointer active:scale-[0.98] transition-transform mt-3"
          >
            <div className="flex items-center gap-4">
              <ProgressRing count={stepDone} target={step.reps} />
              <div className="flex-1 min-w-0">
                <p className="text-xl font-arabic text-gold leading-relaxed">
                  {arabic}
                </p>
                <p className="text-sm font-semibold text-themed mt-1">
                  {transliteration}
                </p>
                <p className="text-xs text-themed-muted mt-0.5">{english}</p>
              </div>
            </div>
          </button>
          {step.note && (
            <p className="text-[10px] text-themed-muted/60 mt-3 italic">
              <HadithRefText text={step.note} />
            </p>
          )}
          <AnimatePresence>
            {stepComplete && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-center text-[10px] font-semibold text-gold uppercase tracking-widest"
              >
                {stepIdx + 1 < preset.steps.length ? "Next dhikr…" : "Complete"}
              </motion.p>
            )}
          </AnimatePresence>
        </>
      )}
    </ContentCard>
  );
}

/** Emotional framing under the hero: the most beloved dhikr narrations. */
function DhikrVirtuesIntro() {
  return (
    <ContentCard className="mb-5">
      <p className="text-sm text-themed leading-relaxed">
        The Prophet ﷺ said the <span className="text-gold font-medium">Mufarridun</span> have raced ahead —
        those who remember Allah abundantly, whose remembrance lays down their burdens so they come light
        on the Day of Judgment. He ﷺ also taught that the remembrance of Allah is better for you than
        spending gold and silver, and that those who remember Allah much are the highest of people in rank.
      </p>
      <p className="text-[10px] text-themed-muted/60 mt-2 italic">
        <HadithRefText text="Tirmidhi 48:227; Tirmidhi 48:8; Tirmidhi 48:7" />
      </p>
    </ContentCard>
  );
}

/** How the Prophet ﷺ counted and remembered Allah — a one-card teaching. */
function CountingEtiquetteCard() {
  const bullets = [
    "Count on your fingers and fingertips — the Prophet ﷺ told the women to count this way, for the fingers will be questioned and made to speak on the Day of Judgment (Abu Dawud 8:86; Tirmidhi 48:214).",
    "Remember Allah much, and glorify Him morning and evening (Quran 33:41-42).",
    "Remember your Lord within yourself, humbly and quietly, without raising your voice (Quran 7:205).",
    "Remember Allah standing, sitting, and lying on your side — in every state (Quran 3:191).",
  ];
  return (
    <ContentCard className="mt-6">
      <h3 className="text-sm font-semibold text-themed mb-2">How the Prophet ﷺ counted</h3>
      <ul className="space-y-2">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-themed-muted leading-snug">
            <span className="text-gold mt-0.5 shrink-0">•</span>
            <span><HadithRefText text={b} /></span>
          </li>
        ))}
      </ul>
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
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
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
        virtue: d.virtue,
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
      hapticLight();
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
              onClick={() =>
                setManage((m) => {
                  const next = !m;
                  // Entering manage mode while a guided sequence is running
                  // would otherwise silently discard its position — clear it
                  // explicitly so leaving manage mode returns to the preset
                  // picker instead of quietly resuming a reset sequence.
                  if (next) setActivePresetId(null);
                  return next;
                })
              }
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

      <VerseHero
        arabic="أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ"
        text="Verily, in the remembrance of Allah do hearts find rest."
        reference="Quran 13:28"
      />

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
          <>
            {/* Why we remember Allah — beloved dhikr narrations */}
            {!activePresetId && <DhikrVirtuesIntro />}

            {/* Guided sequences — chain the shared counters card-to-card */}
            {activePresetId ? (
              <SequencePlayer
                key={activePresetId}
                preset={PRESETS.find((p) => p.id === activePresetId)!}
                onCount={increment}
                onClose={() => setActivePresetId(null)}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePresetId(p.id)}
                    className="text-left rounded-2xl border sidebar-border p-4 hover:bg-white/5 active:scale-[0.99] transition touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                        <Play size={12} className="text-gold ml-0.5" />
                      </span>
                      <span className="text-sm font-semibold text-themed">
                        {p.title}
                      </span>
                    </div>
                    <p className="text-xs text-themed-muted mt-2">
                      {p.subtitle}
                    </p>
                    <p className="text-[10px] text-themed-muted/60 mt-1.5 italic">
                      <HadithRefText text={p.refs} />
                    </p>
                  </button>
                ))}
              </div>
            )}

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
          </>
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

        {/* How the Prophet ﷺ counted — etiquette teaching */}
        {!manage && <CountingEtiquetteCard />}

        {/* Sources */}
        <SourcesCard className="mt-6" sources={[
          { ref: "Muslim 5:184; Muslim 5:186", desc: "SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34) after every prayer" },
          { ref: "Muslim 5:171", desc: "The Prophet ﷺ sought forgiveness three times when he finished the prayer" },
          { ref: "Muslim 5:188", desc: "Tasbih, tahmid, and takbir 33 each after every prayer, completed to 100 with the tahlil — sins forgiven even if like the foam of the sea" },
          { ref: "Bukhari 80:15; Muslim 48:108", desc: "Tasbih Fatimah at bedtime — takbir 34, tasbih 33, tahmid 33 — “better for you than a servant”" },
          { ref: "Muslim 2:1", desc: "Alhamdulillah fills the Scale; SubhanAllah and Alhamdulillah fill what is between the heavens and the earth" },
          { ref: "Tirmidhi 48:14", desc: "The best remembrance is La ilaha illallah, and the best supplication is Alhamdulillah" },
          { ref: "Bukhari 80:98", desc: "The full tahlil (La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer) 100 times — the reward of freeing ten slaves and a shield from Shaytan till nightfall" },
          { ref: "Bukhari 80:100; Bukhari 80:101", desc: "SubhanAllahi wa bihamdihi 100 times forgives sins like the foam of the sea; two words light on the tongue, heavy on the Scale" },
          { ref: "Bukhari 80:4; Tirmidhi 48:65", desc: "Astaghfirullah — the Prophet ﷺ sought forgiveness a hundred times in a sitting" },
          { ref: "Bukhari 80:79", desc: "La hawla wa la quwwata illa billah — a treasure of Paradise" },
          { ref: "Muslim 4:74", desc: "Whoever sends blessings on the Prophet ﷺ once, Allah sends ten upon him" },
          { ref: "Tirmidhi 48:227; Tirmidhi 48:8; Tirmidhi 48:7", desc: "The Mufarridun race ahead; remembrance is better than gold and silver; those who remember Allah much are highest in rank" },
          { ref: "Abu Dawud 8:86; Tirmidhi 48:214", desc: "Count dhikr on the fingers, for they will be made to speak on the Day of Judgment" },
          { ref: "Quran 13:28", desc: "In the remembrance of Allah do hearts find rest" },
        ]} />
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
