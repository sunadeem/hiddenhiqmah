"use client";

// PlanEditor — change the plan you set at onboarding: your pace (the size of new
// portions) and how many new portions to learn per day. Portions you already
// carry keep their size; only newly-added portions follow a changed pace.

import { useState } from "react";
import { X, Check, Minus, Plus } from "lucide-react";
import type { HifzPath } from "@/lib/hifz/useHifzPath";
import type { Pace } from "@hidden-hiqmah/ui/lib/hifz/types";
import { paceNewPerDay, paceStationAyahs } from "@hidden-hiqmah/ui/lib/hifz/srs";
import { hapticSelection } from "@/lib/mobile/haptics";

const PACES: { key: Pace; title: string; desc: string }[] = [
  { key: "gentle", title: "Gentle", desc: "~3 āyāt per portion" },
  { key: "steady", title: "Steady", desc: "~5 āyāt per portion" },
  { key: "devoted", title: "Devoted", desc: "~7 āyāt per portion" },
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
  const [busy, setBusy] = useState(false);

  if (!open || !plan) return null;

  const save = async () => {
    setBusy(true);
    try {
      await path.actions.savePlan({ ...plan, pace, dailyPortions: portions });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center"
      onClick={onClose}
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
            onClick={onClose}
            className="p-1 text-themed-muted hover:text-themed touch-manipulation"
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
        </div>

        <div className="p-4 border-t sidebar-border">
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="w-full rounded-xl bg-gold text-[#0a1628] font-bold py-3 disabled:opacity-60 touch-manipulation"
          >
            Save plan
          </button>
        </div>
      </div>
    </div>
  );
}
