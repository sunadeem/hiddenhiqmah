"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { DailyAdapter } from "../../lib/daily/types";

/**
 * Tap-to-count dhikr control (Worship). Shows the daily count (primary) and the
 * lifetime total (smaller). Increments are debounced into a single RPC. Shares
 * state with the checklist via dhikrKey.
 */
export function DhikrCounter({
  adapter,
  dhikrKey,
  today,
  goal,
  onHaptic,
}: {
  adapter: DailyAdapter;
  dhikrKey: string;
  today: string;
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
        /* keep optimistic value; will reconcile on next open */
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
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={tap}
        className={[
          "w-36 h-36 rounded-full flex flex-col items-center justify-center gap-1 touch-manipulation transition-transform active:scale-95 border-[3px]",
          reached
            ? "border-[var(--color-gold)] bg-[var(--color-gold)]/15"
            : "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/[0.06]",
        ].join(" ")}
        aria-label="Count dhikr"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-themed-muted">Tap</span>
        <span className="text-4xl font-bold text-gold leading-none">{daily}</span>
        {goal != null && <span className="text-xs text-themed-muted">of {goal}</span>}
      </button>
      <div className="flex items-center gap-3 text-xs text-themed-muted">
        <span>Lifetime {lifetime.toLocaleString()}</span>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 text-themed-muted hover:text-themed touch-manipulation"
          aria-label="Reset today's count"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>
    </div>
  );
}

export default DhikrCounter;
