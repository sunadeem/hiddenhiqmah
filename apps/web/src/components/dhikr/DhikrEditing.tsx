"use client";

// Shared dhikr add/edit controls, reused by the Worship tab (WorshipDhikrSection)
// and the standalone /dhikr page so both surfaces manage the same custom-dhikr
// store with an identical UX. Purely presentational — parents wire the store +
// haptics.

import { useMemo, useState } from "react";
import { Plus, Trash2, X, Search, Minus } from "lucide-react";
import { DHIKR_CATALOG } from "@/lib/dhikr/catalog";

export interface ManageCard {
  key: string;
  label: string;
  goal: number;
  isCustom: boolean;
}

export function GoalStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-7 h-7 rounded-lg bg-white/5 text-themed-muted flex items-center justify-center touch-manipulation active:scale-95"
        aria-label="Decrease"
      >
        <Minus size={13} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(Math.max(1, n));
        }}
        className="w-12 text-center bg-transparent text-sm font-semibold text-themed tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-lg bg-white/5 text-themed-muted flex items-center justify-center touch-manipulation active:scale-95"
        aria-label="Increase"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

export function ManageRow({
  card,
  onGoal,
  onDelete,
}: {
  card: ManageCard;
  onGoal: (g: number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 card-bg rounded-2xl border sidebar-border p-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-themed truncate">{card.label}</p>
        {!card.isCustom && (
          <p className="text-[10px] text-themed-muted mt-0.5">Built-in</p>
        )}
      </div>
      <GoalStepper value={card.goal} onChange={onGoal} />
      {card.isCustom ? (
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 p-2 rounded-lg text-themed-muted hover:text-red-400 touch-manipulation"
          title="Remove"
        >
          <Trash2 size={15} />
        </button>
      ) : (
        <span className="w-[31px] shrink-0" aria-hidden />
      )}
    </div>
  );
}

export function AddDhikrDialog({
  presentKeys,
  onClose,
  onAdd,
}: {
  presentKeys: Set<string>;
  onClose: () => void;
  onAdd: (key: string, goal: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [reps, setReps] = useState<number>(33);

  const available = useMemo(
    () => DHIKR_CATALOG.filter((d) => !presentKeys.has(d.key)),
    [presentKeys]
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (d) =>
        d.label.toLowerCase().includes(q) ||
        d.translit.toLowerCase().includes(q) ||
        d.arabic.includes(query.trim())
    );
  }, [available, query]);

  const pick = (key: string, defaultGoal: number) => {
    setSelected(key);
    setReps(defaultGoal);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full sm:max-w-md bg-themed border-t sm:border sidebar-border sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sidebar-border">
          <h3 className="text-base font-semibold text-themed">Add a dhikr</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-themed-muted hover:text-themed touch-manipulation"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {available.length === 0 ? (
          <p className="text-sm text-themed-muted text-center p-8">
            You&apos;ve added every dhikr in the catalog.
          </p>
        ) : (
          <>
            <div className="p-3 border-b sidebar-border">
              <div className="flex items-center gap-2 card-bg rounded-xl border sidebar-border px-3 py-2">
                <Search size={15} className="text-themed-muted shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search dhikr…"
                  className="flex-1 bg-transparent text-sm text-themed outline-none placeholder:text-themed-muted"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-themed-muted text-center py-8">No matches.</p>
              ) : (
                filtered.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => pick(d.key, d.defaultGoal)}
                    className={`w-full flex items-center gap-3 rounded-xl p-3 text-left touch-manipulation transition ${
                      selected === d.key
                        ? "bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/40"
                        : "active:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-themed truncate">{d.label}</p>
                      <p className="text-xs text-themed-muted truncate">{d.translit}</p>
                    </div>
                    <span className="font-arabic text-gold/70 text-base shrink-0">{d.arabic}</span>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t sidebar-border space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-themed-muted">Repetitions</label>
                <GoalStepper value={reps} onChange={setReps} />
              </div>
              <button
                type="button"
                disabled={!selected}
                onClick={() => selected && onAdd(selected, reps)}
                className="w-full rounded-xl py-3 font-semibold touch-manipulation transition disabled:opacity-40 bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 active:bg-[var(--color-gold)]/30"
              >
                Add dhikr
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
