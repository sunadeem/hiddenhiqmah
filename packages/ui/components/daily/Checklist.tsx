"use client";

import { Check } from "lucide-react";
import { rowKindOf, type ChecklistRow } from "../../lib/daily/useChecklist";

/** Today's checklist — a grouped inset list. Checkboxes + count/dhikr counters. */
export function Checklist({
  rows,
  onCheck,
  onBump,
  onHaptic,
}: {
  rows: ChecklistRow[];
  onCheck: (row: ChecklistRow) => void;
  onBump: (row: ChecklistRow) => void;
  onHaptic?: () => void;
}) {
  return (
    <div className="card-bg rounded-2xl border sidebar-border overflow-hidden">
      {rows.map((row, i) => {
        const kind = rowKindOf(row);
        const current = kind === "dhikr" ? row.dhikrDaily ?? 0 : row.countDone ?? 0;
        return (
          <div
            key={row.userItemId ?? i}
            className={`flex items-center gap-3 px-4 ${
              i > 0 ? "border-t sidebar-border" : ""
            }`}
            style={{ minHeight: 56 }}
          >
            <button
              type="button"
              onClick={() => {
                onHaptic?.();
                onCheck(row);
              }}
              aria-label={row.done ? "Mark not done" : "Mark done"}
              className={[
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors touch-manipulation",
                row.done
                  ? "bg-[var(--color-gold)] text-[var(--color-bg)]"
                  : "border-2 sidebar-border",
              ].join(" ")}
            >
              {row.done && <Check size={16} strokeWidth={3} />}
            </button>

            <span
              className={`flex-1 py-3 text-[15px] ${
                row.done ? "text-themed-muted line-through" : "text-themed"
              }`}
            >
              {row.label}
            </span>

            {kind !== "check" && (
              <button
                type="button"
                onClick={() => {
                  onHaptic?.();
                  onBump(row);
                }}
                aria-label="Increment"
                className="shrink-0 inline-flex items-center gap-1 rounded-full border sidebar-border px-3 py-1.5 text-xs font-semibold text-themed tabular-nums touch-manipulation active:scale-95 transition-transform"
              >
                {current}
                <span className="text-themed-muted">/ {row.goalCount}</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Checklist;
