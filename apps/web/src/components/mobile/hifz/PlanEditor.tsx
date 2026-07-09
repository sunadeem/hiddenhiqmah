"use client";

// PlanEditor — change the plan you set at onboarding: your pace (the size of new
// portions) and how many new portions to learn per day. Portions you already
// carry keep their size; only newly-added portions follow a changed pace.

import { useState } from "react";
import { X, Check, Minus, Plus } from "lucide-react";
import type { HifzPath } from "@/lib/hifz/useHifzPath";
import type { Pace, HifzStation } from "@hidden-hiqmah/ui/lib/hifz/types";
import { paceNewPerDay, paceStationAyahs } from "@hidden-hiqmah/ui/lib/hifz/srs";
import { journeySurahs, type Journey } from "@/lib/hifz/quran";
import { hapticSelection } from "@/lib/mobile/haptics";

const PACES: { key: Pace; title: string; desc: string }[] = [
  { key: "gentle", title: "Gentle", desc: "~3 āyāt per portion" },
  { key: "steady", title: "Steady", desc: "~5 āyāt per portion" },
  { key: "devoted", title: "Devoted", desc: "~7 āyāt per portion" },
];

const JOURNEYS: { key: Journey; title: string; desc: string }[] = [
  { key: "shortest", title: "Shortest sūrahs first", desc: "Build momentum on the short ones" },
  { key: "juz-amma", title: "Juzʼ ʿAmma", desc: "The 30th juzʼ (An-Nabaʼ → An-Nās)" },
  { key: "front-to-back", title: "Front to back", desc: "Al-Fātiḥah onward, in order" },
];

export default function PlanEditor({
  path,
  open,
  onClose,
}: {
  path: HifzPath;
  open: boolean;
  onClose: () => void;
}) {
  const plan = path.plan;
  const [pace, setPace] = useState<Pace>(plan?.pace ?? "steady");
  const [portions, setPortions] = useState<number>(
    plan?.dailyPortions ?? paceNewPerDay(plan?.pace ?? "steady")
  );
  const [journey, setJourney] = useState<Journey>((plan?.journey as Journey) ?? "front-to-back");
  const [busy, setBusy] = useState(false);

  if (!open || !plan) return null;

  const cardOrderOf = (s: HifzStation): number => {
    const c = path.cards.find((x) => x.id === s.cardIds[0]);
    return c?.order ?? s.startSurah * 1000 + s.startAyah;
  };
  // Re-sort the NOT-STARTED (locked) portions by the chosen journey, placed after
  // your current position — your current sūrah stays first, memorized stays put.
  const resortUpdates = (j: Journey): { id: string; order: number }[] => {
    const cur = path.currentStation;
    if (!cur) return [];
    const js = journeySurahs(j);
    const rank = (surah: number) =>
      surah === cur.startSurah ? -1 : js.indexOf(surah) < 0 ? 9999 : js.indexOf(surah);
    const locked = path.quranStations.filter((s) => s.status === "locked");
    if (!locked.length) return [];
    const sorted = [...locked].sort(
      (a, b) =>
        rank(a.startSurah) - rank(b.startSurah) ||
        a.startSurah - b.startSurah ||
        a.startAyah - b.startAyah
    );
    const base = cardOrderOf(cur);
    // Right edge = the next NON-locked station after base, so re-sorted portions
    // stay strictly below any memorized/current station and can't collide with
    // one another across repeated re-sorts.
    let hi = Infinity;
    for (const s of path.quranStations) {
      if (s.status === "locked") continue;
      const o = cardOrderOf(s);
      if (o > base && o < hi) hi = o;
    }
    if (hi === Infinity) hi = base + 1;
    const n = sorted.length;
    const updates: { id: string; order: number }[] = [];
    sorted.forEach((st, i) => {
      const o = base + ((i + 1) / (n + 1)) * (hi - base);
      for (const id of st.cardIds) updates.push({ id, order: o });
    });
    return updates;
  };

  const save = async () => {
    setBusy(true);
    try {
      // Compare against the SAME default the selector shows, so an untouched order
      // (or a legacy null journey) never triggers a phantom re-sort.
      const prevJourney = (plan.journey as Journey) ?? "front-to-back";
      if (journey !== prevJourney) {
        const updates = resortUpdates(journey);
        if (updates.length) await path.actions.reorder(updates);
      }
      await path.actions.savePlan({ ...plan, pace, dailyPortions: portions, journey });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full sm:max-w-md bg-themed border-t sm:border sidebar-border sm:rounded-2xl rounded-t-2xl max-h-[88vh] flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sidebar-border">
          <h3 className="text-base font-semibold text-themed">Your plan</h3>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (!busy) onClose();
            }}
            className="p-1 text-themed-muted hover:text-themed touch-manipulation disabled:opacity-40"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Pace */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider text-themed-muted">
              Pace · portion size
            </label>
            <div className="space-y-2">
              {PACES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    hapticSelection();
                    setPace(p.key);
                    setPortions(paceNewPerDay(p.key));
                  }}
                  className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left touch-manipulation ${
                    pace === p.key
                      ? "border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10"
                      : "sidebar-border active:bg-[var(--overlay-subtle)]"
                  }`}
                >
                  <span className="min-w-0">
                    <span className={`block text-sm font-semibold ${pace === p.key ? "text-gold" : "text-themed"}`}>
                      {p.title}
                    </span>
                    <span className="block text-[11.5px] text-themed-muted">{p.desc}</span>
                  </span>
                  {pace === p.key && <Check size={16} className="text-gold shrink-0" />}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-themed-muted/70 leading-relaxed">
              Changing pace sizes the NEW portions you add next — portions you already
              carry keep their size.
            </p>
          </div>

          {/* Daily target */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider text-themed-muted">
              New portions per day
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={portions <= 1}
                onClick={() => {
                  hapticSelection();
                  setPortions((n) => Math.max(1, n - 1));
                }}
                className="w-9 h-9 rounded-full bg-[var(--overlay-subtle)] flex items-center justify-center text-themed disabled:opacity-40 touch-manipulation active:scale-95 transition-transform"
              >
                <Minus size={16} />
              </button>
              <span className="text-lg font-bold text-gold w-10 text-center tabular-nums">{portions}</span>
              <button
                type="button"
                disabled={portions >= 5}
                onClick={() => {
                  hapticSelection();
                  setPortions((n) => Math.min(5, n + 1));
                }}
                className="w-9 h-9 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center text-gold disabled:opacity-40 touch-manipulation active:scale-95 transition-transform"
              >
                <Plus size={16} />
              </button>
              <span className="text-[12px] text-themed-muted ml-1">
                ≈ {portions * paceStationAyahs(pace)} āyāt a day
              </span>
            </div>
            <p className="text-[11px] text-themed-muted/70 leading-relaxed">
              Today shows &ldquo;portion N of {portions}&rdquo; and stops once you finish
              them. Start early always lets you keep going.
            </p>
          </div>

          {/* Learning order */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider text-themed-muted">
              Learning order
            </label>
            <div className="space-y-2">
              {JOURNEYS.map((jj) => (
                <button
                  key={jj.key}
                  type="button"
                  onClick={() => {
                    hapticSelection();
                    setJourney(jj.key);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left touch-manipulation ${
                    journey === jj.key
                      ? "border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10"
                      : "sidebar-border active:bg-[var(--overlay-subtle)]"
                  }`}
                >
                  <span className="min-w-0">
                    <span className={`block text-sm font-semibold ${journey === jj.key ? "text-gold" : "text-themed"}`}>
                      {jj.title}
                    </span>
                    <span className="block text-[11.5px] text-themed-muted">{jj.desc}</span>
                  </span>
                  {journey === jj.key && <Check size={16} className="text-gold shrink-0" />}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-themed-muted/70 leading-relaxed">
              Re-sorts your upcoming portions — what you&rsquo;re on now and what you&rsquo;ve
              memorized stay put.
            </p>
          </div>
        </div>

        <div className="p-4 border-t sidebar-border">
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="w-full rounded-xl bg-gold text-[#0a1628] font-bold py-3 disabled:opacity-60 touch-manipulation"
          >
            {busy ? "Saving…" : "Save plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
