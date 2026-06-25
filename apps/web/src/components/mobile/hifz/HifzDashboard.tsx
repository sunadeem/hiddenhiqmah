"use client";

import { Flame, Play, Plus, Map, BookMarked, CheckCircle2, ChevronRight } from "lucide-react";
import type { HifzStats } from "@hidden-hiqmah/ui/lib/hifz/types";

export default function HifzDashboard({
  stats,
  hasCards,
  onStart,
  onSetup,
  onMap,
}: {
  stats: HifzStats | null;
  hasCards: boolean;
  onStart: () => void;
  onSetup: () => void;
  onMap: () => void;
}) {
  const due = stats?.dueToday ?? 0;

  return (
    <div className="space-y-3">
      {/* Streak hero */}
      <div className="card-bg rounded-2xl border border-[var(--color-gold)]/30 p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/12 to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/18 text-gold flex items-center justify-center shrink-0">
            <Flame size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-themed-muted text-xs uppercase tracking-wider">Hifz streak</p>
            <p className="text-3xl font-extrabold text-themed leading-none mt-0.5">
              {stats?.streakCurrent ?? 0}
              <span className="text-base font-semibold text-themed-muted"> days</span>
            </p>
            {(stats?.streakBest ?? 0) > 0 && (
              <p className="text-themed-muted text-xs mt-1">Best {stats?.streakBest} days</p>
            )}
          </div>
        </div>
      </div>

      {/* Today */}
      {hasCards ? (
        <button
          onClick={onStart}
          disabled={due === 0}
          className={`w-full rounded-2xl p-5 text-left touch-manipulation transition-transform active:scale-[0.99] ${
            due > 0
              ? "bg-gold text-[#0a1628]"
              : "card-bg border sidebar-border text-themed"
          }`}
        >
          <div className="flex items-center gap-3">
            {due > 0 ? (
              <Play size={22} className="shrink-0" />
            ) : (
              <CheckCircle2 size={22} className="text-gold shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight">
                {due > 0 ? "Start review" : "All caught up"}
              </p>
              <p className={`text-sm mt-0.5 ${due > 0 ? "text-[#0a1628]/70" : "text-themed-muted"}`}>
                {due > 0 ? `${due} due today` : "Nothing due — come back tomorrow"}
              </p>
            </div>
            {due > 0 && <ChevronRight size={20} className="shrink-0" />}
          </div>
        </button>
      ) : (
        <button
          onClick={onSetup}
          className="w-full card-bg rounded-2xl border border-[var(--color-gold)]/30 p-5 text-left touch-manipulation active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <BookMarked size={22} className="text-gold shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-themed leading-tight">Start memorizing</p>
              <p className="text-themed-muted text-sm mt-0.5">
                Pick a page, surah, or ayahs to begin
              </p>
            </div>
            <ChevronRight size={20} className="text-themed-muted shrink-0" />
          </div>
        </button>
      )}

      {/* Stats grid */}
      {hasCards && (
        <div className="grid grid-cols-4 gap-2">
          <Stat label="Memorized" value={stats?.memorized ?? 0} accent />
          <Stat label="Review" value={stats?.review ?? 0} />
          <Stat label="Learning" value={stats?.learning ?? 0} />
          <Stat label="New" value={stats?.fresh ?? 0} />
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onSetup}
          className="card-bg rounded-2xl border sidebar-border p-4 flex flex-col items-start gap-2 touch-manipulation active:scale-[0.99] transition-transform"
        >
          <Plus size={20} className="text-gold" />
          <span className="text-themed font-semibold text-sm">Add to plan</span>
        </button>
        <button
          onClick={onMap}
          disabled={!hasCards}
          className="card-bg rounded-2xl border sidebar-border p-4 flex flex-col items-start gap-2 touch-manipulation active:scale-[0.99] transition-transform disabled:opacity-40"
        >
          <Map size={20} className="text-gold" />
          <span className="text-themed font-semibold text-sm">Progress map</span>
        </button>
      </div>

      <p className="text-themed-muted/70 text-xs text-center px-4 pt-1 leading-relaxed">
        Each review gives you a few new portions plus anything due. Grading them moves cards
        New → Learning → Review → Memorized automatically — you don&apos;t sort them yourself.
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="card-bg rounded-xl border sidebar-border py-3 px-1 text-center">
      <p className={`text-xl font-extrabold ${accent ? "text-gold" : "text-themed"}`}>{value}</p>
      <p className="text-themed-muted text-[10px] mt-0.5">{label}</p>
    </div>
  );
}
