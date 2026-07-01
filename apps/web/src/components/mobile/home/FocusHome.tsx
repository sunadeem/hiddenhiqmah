"use client";

import Link from "next/link";
import {
  BookOpen,
  Repeat,
  GraduationCap,
  Users,
  Sparkles,
} from "lucide-react";
import { NextPrayerCard } from "../MobileHomeDashboard";
import type { TunedFor } from "@hidden-hiqmah/ui/lib/storage";

type Act = { icon: typeof BookOpen; title: string; subtitle: string; href: string };

const ACT: Record<TunedFor, Act> = {
  hifz: { icon: Repeat, title: "Hifz review", subtitle: "Strengthen what you've memorised", href: "/hifz" },
  prayer: { icon: Sparkles, title: "Du'as for your day", subtitle: "Supplications for every moment", href: "/duas" },
  "new-muslim": { icon: GraduationCap, title: "Learn the basics", subtitle: "Five pillars & how to pray", href: "/pillars" },
  family: { icon: Users, title: "Family time", subtitle: "Teach & learn together", href: "/family" },
  exploring: { icon: BookOpen, title: "Read Qur'an", subtitle: "Continue where you left off", href: "/quran" },
};

/**
 * Focus — the minimal Home style: just the next-prayer countdown and one
 * suggested act (chosen from the "tuned for" preference). The invariant
 * TodayStrip is rendered above this by MobileHome.
 */
export default function FocusHome({ tunedFor }: { tunedFor: TunedFor }) {
  const act = ACT[tunedFor] ?? ACT.exploring;
  const Icon = act.icon;

  return (
    <>
      <NextPrayerCard />

      <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-0.5 px-1 mt-1">
        One thing
      </p>
      <Link
        href={act.href}
        className="flex items-center gap-3 rounded-2xl border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 p-4 touch-manipulation active:scale-[0.99] transition-transform"
      >
        <div className="w-11 h-11 rounded-xl bg-[var(--color-gold)]/20 text-gold flex items-center justify-center shrink-0">
          <Icon size={21} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-themed leading-tight">{act.title}</p>
          <p className="text-xs text-themed-muted mt-0.5 truncate">{act.subtitle}</p>
        </div>
        <span className="text-xs font-bold text-gold shrink-0">Begin →</span>
      </Link>
    </>
  );
}
