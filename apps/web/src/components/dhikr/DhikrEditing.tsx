"use client";

// Shared dhikr add/edit controls, reused by the Worship tab (WorshipDhikrSection)
// and the standalone /dhikr page so both surfaces manage the same custom-dhikr
// store with an identical UX. Purely presentational — parents wire the store +
// haptics.

import { useMemo, useState } from "react";
import { Plus, Trash2, X, Check, Minus } from "lucide-react";
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
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const available = useMemo(
    () => DHIKR_CATALOG.filter((d) => !presentKeys.has(d.key)),
    [presentKeys]
  );

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addSelected = () => {
    // Add each checked dhikr with its catalog default goal (adjustable later in
    // the Edit view). The module cache updates synchronously, so calling the
    // parent's single-add onAdd per key never drops a write.
    for (const d of available) {
      if (selected.has(d.key)) onAdd(d.key, d.defaultGoal);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full sm:max-w-lg bg-themed border-t sm:border sidebar-border sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sidebar-border">
          <h3 className="text-base font-semibold text-themed">Add dhikr</h3>
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
            <p className="px-4 pt-3 pb-1 text-xs text-themed-muted">
              {available.length} adhkār — scroll for more
            </p>

            <div className="flex-1 overflow-y-auto p-2">
              {available.map((d) => {
                const isSelected = selected.has(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggle(d.key)}
                    aria-pressed={isSelected}
                    className={`w-full flex items-start gap-3 rounded-xl px-3.5 py-3 text-left touch-manipulation transition ${
                      isSelected
                        ? "bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/40"
                        : "active:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        isSelected
                          ? "bg-[var(--color-gold)]/80 border-[var(--color-gold)] text-black"
                          : "border-white/25 text-transparent"
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-themed leading-snug">
                        {d.label}
                      </span>
                      <span
                        className="block font-arabic text-gold/75 text-lg leading-relaxed line-clamp-2 mt-1.5 text-right"
                        dir="rtl"
                      >
                        {d.arabic}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t sidebar-border">
              <button
                type="button"
                disabled={selected.size === 0}
                onClick={addSelected}
                className="w-full rounded-xl py-3 font-semibold touch-manipulation transition disabled:opacity-40 bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 active:bg-[var(--color-gold)]/30"
              >
                {selected.size === 0 ? "Select dhikr to add" : `Add ${selected.size}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
