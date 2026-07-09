"use client";

// Milestone — the sūrah-completion ceremony. When the final āyah of a sūrah is
// sealed, the session lands here: the sūrah's name in calligraphy, a faḍīlah
// (its narrated virtue), and the date it entered the user's keeping — kept as a
// milestone on the path. One calm "Continue" returns to Today. Purely
// celebratory: it reads the plan for context but never mutates the schedule.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { HifzPath } from "@/lib/hifz/useHifzPath";
import { chapter } from "@/lib/hifz/quran";
import { hapticSuccess } from "@/lib/mobile/haptics";
import { useAuth } from "@/context/AuthContext";
import { getMyCirclesWithDetail, setMyProgress, type CircleDetail } from "@/lib/circles";

export type HifzView =
  | "onboarding"
  | "today"
  | "review"
  | "learn"
  | "practice"
  | "path"
  | "milestone";

export interface MilestoneParams {
  /** Completed sūrah id (1–114). Drives the name + faḍīlah. */
  surah?: number;
  /** Override the English label (defaults to "Sūrat {name}"). */
  label?: string;
  /** Override the narrated virtue line. */
  fadila?: string;
  /** Attribution for the faḍīlah. */
  attribution?: string;
  /** ISO date the sūrah was completed (defaults to today). */
  date?: string;
}

export interface MilestoneProps {
  path: HifzPath;
  nav: (view: HifzView, params?: unknown) => void;
  params?: MilestoneParams;
}

// A few narrated virtues, keyed by sūrah id. Anything unmapped gets a gentle,
// always-true default.
const FADILA: Record<number, { line: string; by: string }> = {
  1: { line: "The greatest sūrah in the Qurʼān — recited in every prayer.", by: "Ṣaḥīḥ al-Bukhārī" },
  2: { line: "Recite Al-Baqarah — the household it is read in, Shayṭān flees.", by: "Ṣaḥīḥ Muslim" },
  18: { line: "Whoever memorises its first ten āyāt is protected from the Dajjāl.", by: "Ṣaḥīḥ Muslim" },
  36: { line: "The heart of the Qurʼān.", by: "Sunan al-Tirmidhī" },
  67: { line: "A sūrah of thirty āyāt that intercedes for its companion until forgiven.", by: "Sunan Abī Dāwūd" },
  112: { line: "It is equal to a third of the Qurʼān.", by: "Ṣaḥīḥ al-Bukhārī" },
  113: { line: "The best two sūrahs sought as refuge — none like them.", by: "Ṣaḥīḥ Muslim" },
  114: { line: "The best two sūrahs sought as refuge — none like them.", by: "Ṣaḥīḥ Muslim" },
};

const DEFAULT_FADILA = {
  line: "A treasure of the Qurʼān, now kept in your heart.",
  by: "",
};

// Per-circle idempotency for hifz surah auto-logging (a sūrah is credited once).
const SURAH_LOG_KEY = "hiqmah-circle-surah-logged";
function surahLoggedFor(circleId: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    return (JSON.parse(localStorage.getItem(SURAH_LOG_KEY) || "{}")[circleId] as number[]) || [];
  } catch {
    return [];
  }
}
function markSurahLogged(circleId: string, surah: number): void {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(SURAH_LOG_KEY) || "{}") as Record<string, number[]>;
    const arr = all[circleId] || [];
    if (!arr.includes(surah)) arr.push(surah);
    all[circleId] = arr;
    localStorage.setItem(SURAH_LOG_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

/** Prefer the Islamic (Umm al-Qurā) date; fall back to Gregorian day + month. */
function formatDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  if (isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("en-TN-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat("en", { day: "numeric", month: "long" }).format(d);
  }
}

export default function Milestone({ nav, params }: MilestoneProps) {
  const surahId = params?.surah;
  const ch = surahId ? chapter(surahId) : undefined;

  const englishName =
    params?.label ?? (ch ? `Sūrat ${ch.nameComplex}` : "This sūrah");
  const arabicName = ch ? `سُورَةُ ${ch.nameAr}` : "";

  const fadila = useMemo(() => {
    if (params?.fadila) return { line: params.fadila, by: params?.attribution ?? "" };
    return (surahId && FADILA[surahId]) || DEFAULT_FADILA;
  }, [params?.fadila, params?.attribution, surahId]);

  const dateLine = useMemo(() => formatDate(params?.date), [params?.date]);

  // Optional: offer to credit this completed sūrah toward a hifz circle.
  const { user } = useAuth();
  const [hifzCircles, setHifzCircles] = useState<CircleDetail[] | null>(null);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (!user || !surahId) return;
    let alive = true;
    getMyCirclesWithDetail()
      .then((all) => {
        if (!alive) return;
        const hifz = all.filter((d) => d.circle.goal_type === "hifz");
        const pending = hifz.some((d) => !surahLoggedFor(d.circle.id).includes(surahId));
        setHifzCircles(pending ? hifz : []);
      })
      .catch(() => {
        if (alive) setHifzCircles([]);
      });
    return () => {
      alive = false;
    };
  }, [user, surahId]);

  const addToHifzCircles = async () => {
    if (!surahId || !hifzCircles) return;
    setLogged(true);
    hapticSuccess();
    for (const d of hifzCircles) {
      if (surahLoggedFor(d.circle.id).includes(surahId)) continue;
      try {
        await setMyProgress(d.circle.id, d.myValue + 1);
        markSurahLogged(d.circle.id, surahId);
      } catch {
        /* ignore — the manual stepper still works */
      }
    }
  };

  // A single success buzz as the ceremony blooms in.
  useEffect(() => {
    hapticSuccess();
  }, []);

  return (
    <div className="flex flex-col min-h-full text-center px-6 pt-4 pb-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div
            className="text-gold text-lg tracking-[0.5em] mb-6"
            style={{ opacity: 0.55 }}
            aria-hidden
          >
            ﴾ ✦ ﴿
          </div>

          {arabicName && (
            <p
              dir="rtl"
              className="font-arabic text-gold leading-[1.4]"
              style={{
                fontSize: "clamp(38px, 12vw, 52px)",
                textShadow: "0 0 42px rgba(201,168,76,0.35)",
              }}
            >
              {arabicName}
            </p>
          )}

          <div
            className="my-7 h-px w-14"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
            }}
            aria-hidden
          />

          <p className="text-themed text-xl leading-snug font-serif text-balance">
            {englishName} — completed,
            <br />
            and now in your care.
          </p>

          <p className="text-themed-muted text-sm mt-5 leading-relaxed max-w-xs">
            {fadila.line ? `“${fadila.line}”` : ""}
            {fadila.by && (
              <>
                <br />
                <span className="text-[11px] text-themed-muted">— {fadila.by}</span>
              </>
            )}
          </p>

          {dateLine && (
            <p className="text-gold text-[11px] mt-6 tracking-wide">
              {dateLine} · kept as a milestone on your path
            </p>
          )}
        </motion.div>
      </div>

      {hifzCircles && hifzCircles.length > 0 && !logged && (
        <button
          onClick={addToHifzCircles}
          className="w-full rounded-2xl border border-[var(--color-gold)]/30 py-3.5 mb-2.5 text-gold font-semibold text-sm active:opacity-80 touch-manipulation"
        >
          Add to your Hifz circle
        </button>
      )}
      {logged && (
        <p className="text-themed-muted text-[12px] mb-2.5">Added to your Hifz circle ✓</p>
      )}
      <button
        onClick={() => {
          hapticSuccess();
          nav("today");
        }}
        className="w-full rounded-2xl py-4 font-semibold text-[#181305] touch-manipulation active:scale-[0.98] transition-transform"
        style={{
          background:
            "linear-gradient(170deg, var(--color-gold-hi, #e2c476), var(--color-gold) 55%, #ab8b3c)",
          boxShadow: "0 6px 22px rgba(201,168,76,0.22)",
        }}
      >
        Continue
      </button>
    </div>
  );
}
