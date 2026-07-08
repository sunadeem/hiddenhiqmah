"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sun,
  Moon,
  Repeat,
  Sparkles,
  GraduationCap,
  Users,
  Compass,
  Heart,
  Check,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import {
  NextPrayerCard,
  ContinueReadingCard,
  QuickActions,
} from "../MobileHomeDashboard";
import QiblahSheet from "../QiblahSheet";
import { getProgress, type TunedFor } from "@hidden-hiqmah/ui/lib/storage";
import { todayLocalDate } from "@hidden-hiqmah/ui/lib/daily/types";
import { useDailyAdapter } from "@/lib/daily/useDailyAdapter";
import { useAuth } from "@/context/AuthContext";
import TodayStrip from "./TodayStrip";
import chapters from "@hidden-hiqmah/content/quran/chapters.json";

type Step = {
  key: string;
  icon: typeof BookOpen;
  title: string;
  subtitle: string;
  href: string;
  // Maps to a daily-checklist item (sourceKey) so the step can show live
  // completion. Steps without one stay as plain suggestions.
  itemKey?: string;
};

const TUNED_LABEL: Record<TunedFor, string> = {
  prayer: "Prayer",
  hifz: "Hifz",
  "new-muslim": "New Muslim",
  family: "Family",
  exploring: "Exploring",
};

function hijriToday(): string {
  try {
    return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  } catch {
    return "";
  }
}

function buildSteps(tunedFor: TunedFor, hour: number): Step[] {
  const adhkar: Step =
    hour < 14
      ? { key: "adhkar", icon: Sun, title: "Morning adhkar", subtitle: "Start the day in remembrance", href: "/muslim-daily?tab=worship", itemKey: "morning_adhkar" }
      : { key: "adhkar", icon: Moon, title: "Evening adhkar", subtitle: "Protection for the evening", href: "/muslim-daily?tab=worship", itemKey: "evening_adhkar" };
  const read: Step = { key: "read", icon: BookOpen, title: "Read Qur'an", subtitle: "Continue where you left off", href: "/quran", itemKey: "quran_page" };
  const reflect: Step = { key: "reflect", icon: Sparkles, title: "Today's reflection", subtitle: "A verse to ponder", href: "/muslim-daily?tab=reminders" };
  const hifz: Step = { key: "hifz", icon: Repeat, title: "Hifz review", subtitle: "Strengthen what you've memorised", href: "/hifz" };
  const duas: Step = { key: "duas", icon: Heart, title: "Du'as for your day", subtitle: "Supplications for every moment", href: "/duas" };
  const learn: Step = { key: "learn", icon: GraduationCap, title: "Learn the basics", subtitle: "Five pillars & how to pray", href: "/pillars" };
  const family: Step = { key: "family", icon: Users, title: "Family time", subtitle: "Teach & learn together", href: "/family" };
  const kids: Step = { key: "kids", icon: GraduationCap, title: "Kids learning", subtitle: "Stories, lessons & quizzes", href: "/kids" };
  const explore: Step = { key: "explore", icon: Compass, title: "Explore", subtitle: "Browse every topic", href: "/more" };

  switch (tunedFor) {
    case "hifz":
      return [hifz, read, adhkar, reflect];
    case "prayer":
      return [adhkar, duas, read, reflect];
    case "new-muslim":
      return [learn, adhkar, read, reflect];
    case "family":
      return [family, kids, adhkar, read];
    case "exploring":
    default:
      return [read, adhkar, reflect, explore];
  }
}

export default function DailyPathHome({ tunedFor }: { tunedFor: TunedFor }) {
  const { adapter } = useDailyAdapter();
  const { user } = useAuth();
  const [qiblahOpen, setQiblahOpen] = useState(false);
  const [hour, setHour] = useState(8);
  const [hijri, setHijri] = useState("");
  const [readHref, setReadHref] = useState("/quran");
  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHour(new Date().getHours());
    setHijri(hijriToday());
    // Resume the Read step at the last position (mirrors ContinueReadingCard).
    try {
      const p = getProgress();
      if (p?.lastSurah) {
        const ch = chapters.find((c) => c.id === p.lastSurah);
        if (ch) {
          const v = p.lastVerse && p.lastVerse <= ch.verses ? p.lastVerse : undefined;
          setReadHref(v ? `/quran/${ch.id}?v=${v}` : `/quran/${ch.id}`);
        }
      }
    } catch {
      /* keep default */
    }
  }, []);

  // Read today's completion (read-only — never materialize/freeze from a view).
  useEffect(() => {
    let alive = true;
    const today = todayLocalDate();
    (async () => {
      try {
        await adapter.ensureSeeded();
        const rollups = await adapter.getDayRollups(today, today);
        if (!alive || rollups.length === 0) return; // day not started → nothing done yet
        const [items, detail] = await Promise.all([
          adapter.getUserItems(),
          adapter.getDayDetail(today),
        ]);
        if (!alive) return;
        const idToSource = new Map(items.map((i) => [i.id, i.sourceKey]));
        const keys = new Set<string>();
        for (const d of detail) {
          if (d.done && d.userItemId) {
            const src = idToSource.get(d.userItemId);
            if (src) keys.add(src);
          }
        }
        setDoneKeys(keys);
      } catch {
        /* leave empty */
      }
    })();
    return () => {
      alive = false;
    };
  }, [adapter]);

  const steps = buildSteps(tunedFor, hour).map((s) =>
    s.key === "read" ? { ...s, href: readHref } : s
  );
  const isDone = (s: Step) => !!s.itemKey && doneKeys.has(s.itemKey);
  // Advance the highlight to the first not-done step AFTER the last completed one,
  // so an untracked suggestion (reflect/hifz/learn/family/…) can't permanently pin
  // it to item 0 — completing any tracked item (adhkar/read) moves it forward.
  const lastDone = steps.reduce((acc, s, i) => (isDone(s) ? i : acc), -1);
  const firstIncomplete = steps.findIndex((s, i) => i > lastDone && !isDone(s));
  const tracked = steps.filter((s) => s.itemKey);
  const allTrackedDone =
    tracked.length > 0 && tracked.every((s) => doneKeys.has(s.itemKey as string));
  const firstName = (
    (user?.user_metadata as { first_name?: string } | undefined)?.first_name || ""
  ).trim();

  return (
    <>
      {/* Greeting */}
      <div className="px-1">
        <h1 className="text-2xl font-bold text-themed leading-tight">
          Assalāmu ʿalaykum{firstName ? `, ${firstName}` : ""}
        </h1>
        {hijri && <p className="text-themed-muted text-sm mt-1">{hijri}</p>}
      </div>

      {/* Tuned-for chip → deep-links Settings to the Tuned-for section */}
      <Link
        href="/settings?section=tuned-for"
        className="inline-flex items-center gap-2 self-start rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 px-3 py-1.5 text-xs font-semibold text-gold touch-manipulation active:scale-[0.98] transition-transform"
      >
        <SlidersHorizontal size={13} />
        Tuned for: {TUNED_LABEL[tunedFor]}
      </Link>

      {/* Next prayer — the time-anchored hero */}
      <NextPrayerCard />

      {/* Daily checklist (shallow entry) — under the prayer card, above the path */}
      <TodayStrip />

      {/* The path */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold">
            Your path today
          </p>
          {allTrackedDone && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gold">
              <Check size={12} strokeWidth={3} /> On track
            </span>
          )}
        </div>
        <div className="relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = isDone(s);
            const emphasized = i === firstIncomplete && !done;
            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.3) }}
                className="relative flex gap-3 pb-2.5 last:pb-0"
              >
                {/* rail */}
                <div className="flex flex-col items-center pt-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      done || emphasized ? "bg-gold" : "bg-[var(--overlay-strong)]"
                    }`}
                  />
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-[var(--overlay-medium)] mt-1" />
                  )}
                </div>
                {/* node */}
                <Link
                  href={s.href}
                  className={`flex-1 flex items-center gap-3 rounded-2xl border p-3.5 touch-manipulation active:scale-[0.99] transition-transform ${
                    emphasized
                      ? "bg-[var(--color-gold)]/10 border-[var(--color-gold)]/40"
                      : "card-bg sidebar-border"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      done
                        ? "bg-[var(--color-gold)]/15 text-gold"
                        : emphasized
                        ? "bg-[var(--color-gold)]/20 text-gold"
                        : "bg-[var(--overlay-subtle)] text-themed-muted"
                    }`}
                  >
                    {done ? <Check size={19} strokeWidth={2.5} /> : <Icon size={19} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold leading-tight ${
                        done ? "text-themed-muted line-through" : "text-themed"
                      }`}
                    >
                      {s.title}
                    </p>
                    <p className="text-xs text-themed-muted mt-0.5 truncate">
                      {done ? "Done today" : s.subtitle}
                    </p>
                  </div>
                  {emphasized ? (
                    <span className="text-xs font-bold text-gold shrink-0">Begin →</span>
                  ) : done ? (
                    <Check size={16} className="text-gold shrink-0" />
                  ) : (
                    <ChevronRight size={18} className="text-themed-muted shrink-0" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Continue reading — only when the path above doesn't already include a
          "Read Qur'an" step, so we don't show two reading cards. */}
      {!steps.some((s) => s.key === "read") && <ContinueReadingCard />}
      <QuickActions onQiblahClick={() => setQiblahOpen(true)} />

      <QiblahSheet open={qiblahOpen} onClose={() => setQiblahOpen(false)} />
    </>
  );
}
