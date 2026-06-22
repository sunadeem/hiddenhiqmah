"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import {
  NextPrayerCard,
  ContinueReadingCard,
  QuickActions,
} from "../MobileHomeDashboard";
import QiblahSheet from "../QiblahSheet";
import type { TunedFor } from "@hidden-hiqmah/ui/lib/storage";

type Step = {
  key: string;
  icon: typeof BookOpen;
  title: string;
  subtitle: string;
  href: string;
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
      ? { key: "adhkar", icon: Sun, title: "Morning adhkar", subtitle: "Start the day in remembrance", href: "/muslim-daily" }
      : { key: "adhkar", icon: Moon, title: "Evening adhkar", subtitle: "Protection for the evening", href: "/muslim-daily" };
  const read: Step = { key: "read", icon: BookOpen, title: "Read Qur'an", subtitle: "Continue where you left off", href: "/quran" };
  const reflect: Step = { key: "reflect", icon: Sparkles, title: "Today's reflection", subtitle: "A verse to ponder", href: "/muslim-daily" };
  const hifz: Step = { key: "hifz", icon: Repeat, title: "Hifz review", subtitle: "Strengthen what you've memorised", href: "/quran" };
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
  const [qiblahOpen, setQiblahOpen] = useState(false);
  const [hour, setHour] = useState(8);
  const [hijri, setHijri] = useState("");

  useEffect(() => {
    setHour(new Date().getHours());
    setHijri(hijriToday());
  }, []);

  const steps = buildSteps(tunedFor, hour);

  return (
    <>
      {/* Greeting */}
      <div className="px-1">
        <h1 className="text-2xl font-bold text-themed leading-tight">
          Assalāmu ʿalaykum
        </h1>
        {hijri && <p className="text-themed-muted text-sm mt-1">{hijri}</p>}
      </div>

      {/* Tuned-for chip */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 self-start rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 px-3 py-1.5 text-xs font-semibold text-gold touch-manipulation active:scale-[0.98] transition-transform"
      >
        <SlidersHorizontal size={13} />
        Tuned for: {TUNED_LABEL[tunedFor]}
      </Link>

      {/* Next prayer — the time-anchored hero */}
      <NextPrayerCard />

      {/* The path */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-2 px-1">
          Your path today
        </p>
        <div className="relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const emphasized = i === 0;
            return (
              <div key={s.key} className="relative flex gap-3 pb-2.5 last:pb-0">
                {/* rail */}
                <div className="flex flex-col items-center pt-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      emphasized ? "bg-gold" : "bg-white/20"
                    }`}
                  />
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-white/10 mt-1" />
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
                      emphasized
                        ? "bg-[var(--color-gold)]/20 text-gold"
                        : "bg-white/5 text-themed-muted"
                    }`}
                  >
                    <Icon size={19} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-themed leading-tight">
                      {s.title}
                    </p>
                    <p className="text-xs text-themed-muted mt-0.5 truncate">
                      {s.subtitle}
                    </p>
                  </div>
                  {emphasized ? (
                    <span className="text-xs font-bold text-gold shrink-0">Begin →</span>
                  ) : (
                    <ChevronRight size={18} className="text-themed-muted shrink-0" />
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue reading + quick actions (reused) */}
      <ContinueReadingCard />
      <QuickActions onQiblahClick={() => setQiblahOpen(true)} />

      <QiblahSheet open={qiblahOpen} onClose={() => setQiblahOpen(false)} />
    </>
  );
}
