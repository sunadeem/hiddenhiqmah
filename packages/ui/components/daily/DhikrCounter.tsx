"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Check, RotateCcw } from "lucide-react";
import type { DailyAdapter } from "../../lib/daily/types";

/**
 * Compact tap-to-count dhikr card (Worship). The pill is an obvious button
 * (+ icon, border, press feedback; turns to a check at the goal). Counts are
 * debounced into one RPC and share state with the checklist via dhikrKey.
 */
export function DhikrCounter({
  adapter,
  dhikrKey,
  today,
  label,
  goal,
  onHaptic,
}: {
  adapter: DailyAdapter;
  dhikrKey: string;
  today: string;
  label: string;
  goal?: number | null;
  onHaptic?: () => void;
}) {
  const [daily, setDaily] = useState(0);
  const [lifetime, setLifetime] = useState(0);
  const pending = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    adapter.getDhikr(dhikrKey, today).then((s) => {
      if (alive) {
        setDaily(s.daily);
        setLifetime(s.lifetime);
      }
    });
    return () => {
      alive = false;
    };
  }, [adapter, dhikrKey, today]);

  const flush = useCallback(() => {
    const delta = pending.current;
    pending.current = 0;
    if (delta <= 0) return;
    adapter
      .incrementDhikr(dhikrKey, today, delta)
      .then((s) => {
        setDaily(s.daily);
        setLifetime(s.lifetime);
      })
      .catch(() => {
        /* keep optimistic value; reconciles on next open */
      });
  }, [adapter, dhikrKey, today]);

  const tap = useCallback(() => {
    onHaptic?.();
    setDaily((d) => d + 1);
    setLifetime((l) => l + 1);
    pending.current += 1;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 600);
  }, [flush, onHaptic]);

  const reset = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    pending.current = 0;
    const s = await adapter.setDhikrCount(dhikrKey, today, 0);
    setDaily(s.daily);
    setLifetime(s.lifetime);
  }, [adapter, dhikrKey, today]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (pending.current > 0) void adapter.incrementDhikr(dhikrKey, today, pending.current);
    };
  }, [adapter, dhikrKey, today]);

  const reached = goal != null && daily >= goal;

  return (
    <div className="card-bg rounded-2xl border sidebar-border px-4 py-2.5 flex items-center gap-2.5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/8 to-transparent pointer-events-none" />
      <div className="relative flex-1 min-w-0">
        <div className="text-[15px] font-medium text-themed truncate leading-tight">{label}</div>
        <div className="text-[11px] text-themed-muted leading-tight mt-0.5">
          Lifetime {lifetime.toLocaleString()}
          {goal != null ? ` · ${goal}×` : ""}
        </div>
      </div>

      {daily > 0 && (
        <button
          type="button"
          onClick={reset}
          className="relative p-1.5 text-themed-muted touch-manipulation"
          aria-label="Reset today's count"
        >
          <RotateCcw size={13} />
        </button>
      )}

      <button
        type="button"
        onClick={tap}
        aria-label={`Count ${label}`}
        className={[
          "relative shrink-0 h-9 pl-2.5 pr-3 rounded-full flex items-center gap-1.5 font-bold tabular-nums",
          "touch-manipulation active:scale-95 transition-transform border shadow-sm",
          reached
            ? "bg-[var(--color-gold)] text-[var(--color-bg)] border-[var(--color-gold)]"
            : "bg-[var(--color-gold)]/15 text-gold border-[var(--color-gold)]/40",
        ].join(" ")}
      >
        {reached ? <Check size={15} strokeWidth={3} /> : <Plus size={15} strokeWidth={2.5} />}
        <span className="text-sm">
          {daily}
          {goal != null && (
            <span className={reached ? "opacity-70" : "text-gold/60"}>/{goal}</span>
          )}
        </span>
      </button>
    </div>
  );
}

export default DhikrCounter;
