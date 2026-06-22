"use client";

import {
  Shield,
  Check,
  Heart,
  Plus,
  Activity,
  ChevronRight,
} from "lucide-react";

/**
 * Circles — private, non-ranked accountability circles (shared khatmah / hifz
 * goals + a hifz buddy). This screen is a working UI PREVIEW with local sample
 * data; real-time syncing across members needs the Supabase backend (event-log
 * sync) and lands in a later phase. No data here is live yet.
 */

type Member = { initial: string; name: string; detail: string; done?: boolean; reading?: boolean; you?: boolean };

const familyMembers: Member[] = [
  { initial: "D", name: "Dad", detail: "Juz 5 · completed", done: true },
  { initial: "A", name: "Aisha", detail: "Juz 12 · reading now", reading: true },
  { initial: "Y", name: "You", detail: "Juz 9 · in progress", you: true },
];

export default function CirclesScreen() {
  return (
    <div className="space-y-4 pb-4">
      {/* Preview banner */}
      <div className="rounded-xl border border-[var(--color-gold)]/25 bg-[var(--color-gold)]/5 px-4 py-3">
        <p className="text-xs text-themed-muted leading-relaxed">
          <span className="font-semibold text-gold">Preview.</span> Circles is a
          design preview with sample data — syncing with your real family &amp;
          friends is coming soon.
        </p>
      </div>

      {/* Private note */}
      <div className="flex items-center gap-2 text-[11px] text-themed-muted">
        <Shield size={13} className="text-gold shrink-0" />
        Private circles · no public leaderboards · encouragement only
      </div>

      {/* ── Family Khatmah ── */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-2 px-1">
          Your circle
        </p>
        <div className="card-bg rounded-2xl border sidebar-border p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/8 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
              <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
              <circle
                cx="36"
                cy="36"
                r="28"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="105 176"
                transform="rotate(-90 36 36)"
              />
              <text x="36" y="34" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="800">18</text>
              <text x="36" y="48" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontWeight="600">/ 30 juz</text>
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-themed font-bold text-lg leading-tight">Family Khatmah</p>
              <p className="text-themed-muted text-sm mt-0.5">12 juz to go this month · on pace</p>
            </div>
          </div>

          <div className="h-px bg-white/10 my-4" />

          <div className="space-y-1">
            {familyMembers.map((m, i) => (
              <div
                key={m.name}
                className={`flex items-center gap-3 py-2.5 ${
                  i < familyMembers.length - 1 ? "border-b border-white/[0.07]" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    m.you
                      ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                      : "bg-[var(--color-gold)]/16 text-gold"
                  }`}
                >
                  {m.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-themed font-semibold text-sm leading-tight">{m.name}</p>
                  <p className={`text-xs mt-0.5 ${m.reading ? "text-gold" : "text-themed-muted"}`}>{m.detail}</p>
                </div>
                {m.done && <Check size={18} className="text-gold shrink-0" />}
                {m.reading && <Activity size={16} className="text-gold shrink-0" />}
                {m.you && (
                  <span className="text-xs font-bold text-gold shrink-0">Continue →</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hifz buddy ── */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-2 px-1">
          Hifz buddy
        </p>
        <div className="card-bg rounded-2xl border sidebar-border p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/8 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <div className="flex -space-x-2.5 shrink-0">
              <div className="w-9 h-9 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center font-bold text-sm border-2 border-[var(--color-card)]">Y</div>
              <div className="w-9 h-9 rounded-full bg-[var(--color-gold)]/16 text-gold flex items-center justify-center font-bold text-sm border-2 border-[var(--color-card)]">B</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-themed font-bold text-base leading-tight">You &amp; Bilal</p>
              <p className="text-themed-muted text-xs mt-0.5">Daily review pair · Surah Al-Mulk</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-[#5fc88c]/16 text-[#5fc88c] shrink-0">
              <Check size={12} /> Both done
            </span>
          </div>
          <p className="relative font-arabic text-gold text-right text-lg leading-loose mt-4" dir="rtl">
            تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ
          </p>
          <div className="h-px bg-white/10 my-3" />
          <div className="relative flex items-center gap-2">
            <p className="flex-1 text-themed-muted text-xs">Bilal reviewed 2 hours ago</p>
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold rounded-full border border-[var(--color-gold)]/30 px-3 py-1.5">
              <Heart size={13} /> Send du'a
            </button>
          </div>
        </div>
      </div>

      {/* ── Another circle ── */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-2 px-1">
          More circles
        </p>
        <div className="card-bg rounded-2xl border sidebar-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/15 text-gold flex items-center justify-center font-bold shrink-0">
            9
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-themed font-semibold text-sm leading-tight">Qur'an Club</p>
            <p className="text-themed-muted text-xs mt-0.5 truncate">9 members · Surah Al-Kahf every Jumu'ah</p>
          </div>
          <ChevronRight size={18} className="text-themed-muted shrink-0" />
        </div>
      </div>

      {/* Create / join (coming soon) */}
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed sidebar-border py-4 text-sm font-semibold text-themed-muted opacity-70"
      >
        <Plus size={17} /> Create or join a circle
        <span className="text-[10px] uppercase tracking-wider text-gold/70 ml-1">Soon</span>
      </button>
    </div>
  );
}
