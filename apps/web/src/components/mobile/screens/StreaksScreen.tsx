"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Flame,
  Plane,
  Thermometer,
  Droplet,
  Check,
  RotateCcw,
  Loader2,
  Shield,
  HeartHandshake,
} from "lucide-react";
import { useDailyAdapter } from "@/lib/daily/useDailyAdapter";
import {
  todayLocalDate,
  shiftDate,
  expandPausedDates,
  type StreakPause,
  type PauseReason,
  type Streaks,
} from "@hidden-hiqmah/ui/lib/daily/types";

const REASONS: { value: PauseReason; label: string; icon: typeof Plane }[] = [
  { value: "travel", label: "Travelling", icon: Plane },
  { value: "unwell", label: "Unwell", icon: Thermometer },
  { value: "menses", label: "Menstruation", icon: Droplet },
];
const REASON_LABEL: Record<PauseReason, string> = {
  travel: "Travelling",
  unwell: "Unwell",
  menses: "Menstruation",
};

function prettyDate(d: string): string {
  try {
    return new Date(d + "T12:00:00").toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export default function StreaksScreen() {
  const { adapter } = useDailyAdapter();
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [pause, setPause] = useState<StreakPause | null>(null);
  const [missed, setMissed] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const today = todayLocalDate();
    try {
      await adapter.ensureSeeded();
      await adapter.recomputeStreaks(today);
    } catch {
      /* ignore */
    }
    try {
      const [s, p, startDate, pauses] = await Promise.all([
        adapter.getStreaks(),
        adapter.getActivePause(),
        adapter.getStartDate(),
        adapter.getPauses(),
      ]);
      setStreaks(s);
      setPause(p);

      // Recent missed days (last 14, excluding paused + today) for qada catch-up.
      // Only for users who've started (else pre-start days would look "missed").
      if (!startDate) {
        setMissed([]);
        return;
      }
      const from = shiftDate(today, -14);
      const yesterday = shiftDate(today, -1);
      const rollups = await adapter.getDayRollups(from, yesterday);
      const byDate = new Map(rollups.map((r) => [r.localDate, r]));
      const pausedSet = expandPausedDates(pauses, today);

      const days: string[] = [];
      let d = yesterday;
      let i = 0;
      while (i++ < 14) {
        if (startDate && d < startDate) break;
        days.push(d);
        d = shiftDate(d, -1);
      }
      const m = days.filter((day) => {
        if (pausedSet.has(day)) return false;
        const r = byDate.get(day);
        if (!r) return true; // never opened → missed
        return r.prayersTotal > 0 ? r.prayersDone < r.prayersTotal : r.status !== "full";
      });
      setMissed(m.slice(0, 5));
    } catch {
      setStreaks((prev) => prev ?? { overallCurrent: 0, overallBest: 0, prayerCurrent: 0, prayerBest: 0 });
    }
  }, [adapter]);

  useEffect(() => {
    reload();
  }, [reload]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await reload();
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  const makeUp = (date: string) =>
    run(async () => {
      const day = await adapter.getDay(date);
      for (const it of day.items) {
        if (it.isPrayer && it.userItemId && !it.done) {
          await adapter.setDone(date, it.userItemId, true);
        }
      }
    });

  if (!streaks) {
    return (
      <div className="pb-4 flex items-center justify-center py-16 text-themed-muted">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Streak hero */}
      <div className="card-bg rounded-2xl border sidebar-border p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
            <Flame size={30} className="text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-3xl font-bold text-themed leading-none">
              {streaks.overallCurrent}{" "}
              <span className="text-base font-normal text-themed-muted">
                day{streaks.overallCurrent === 1 ? "" : "s"}
              </span>
            </p>
            <p className="text-themed-muted text-sm mt-1">
              {pause
                ? "Held while you're on a break"
                : streaks.overallBest > streaks.overallCurrent
                ? `Best: ${streaks.overallBest} days · may Allah accept it`
                : "May Allah accept it"}
            </p>
            {streaks.prayerCurrent > 0 && (
              <p className="text-gold text-xs mt-1">{streaks.prayerCurrent}-day prayer streak</p>
            )}
          </div>
        </div>
      </div>

      {/* Pause */}
      {pause ? (
        <div className="card-bg rounded-2xl border border-[var(--color-gold)]/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/15 text-gold flex items-center justify-center shrink-0">
              {(() => {
                const Icon = REASONS.find((r) => r.value === pause.reason)?.icon ?? Plane;
                return <Icon size={19} />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-themed font-semibold text-sm leading-tight">
                Paused · {REASON_LABEL[pause.reason]}
              </p>
              <p className="text-themed-muted text-xs mt-0.5">
                Since {prettyDate(pause.startDate)} · your streak is held, not broken
              </p>
            </div>
            <button
              disabled={busy}
              onClick={() => run(() => adapter.endPause(todayLocalDate()))}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold rounded-full border border-[var(--color-gold)]/30 px-3 py-2 shrink-0"
            >
              <RotateCcw size={13} /> Resume
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-2 px-1">
            Taking a break?
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {REASONS.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.value}
                  disabled={busy}
                  onClick={() => run(() => adapter.startPause(r.value, todayLocalDate()))}
                  className="card-bg rounded-2xl border sidebar-border p-3 flex flex-col items-center gap-1.5 touch-manipulation active:bg-white/5 disabled:opacity-60"
                >
                  <Icon size={20} className="text-gold" />
                  <span className="text-[11px] font-medium text-themed text-center leading-tight">{r.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-themed-muted mt-2 px-1 leading-relaxed">
            A pause holds your streak — it doesn&apos;t break it. Resume any time.
          </p>
        </div>
      )}

      {/* Mercy */}
      <div className="card-bg rounded-2xl border sidebar-border p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/15 text-gold flex items-center justify-center shrink-0">
          <HeartHandshake size={19} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-themed font-semibold text-sm leading-tight">Mercy day</p>
          <p className="text-themed-muted text-xs mt-0.5 leading-snug">
            A missed day won&apos;t reset your streak — pick back up where you left off.
          </p>
        </div>
      </div>

      {/* Qada catch-up */}
      {missed.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold mb-2 px-1">
            Make up a missed day (qaḍāʾ)
          </p>
          <div className="card-bg rounded-2xl border sidebar-border overflow-hidden divide-y divide-white/5">
            {missed.map((day) => (
              <div key={day} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-themed text-sm font-medium">{prettyDate(day)}</p>
                  <p className="text-themed-muted text-xs mt-0.5">Prayers not completed</p>
                </div>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (confirm(`Mark ${prettyDate(day)}'s prayers as made up?`)) makeUp(day);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold rounded-full border border-[var(--color-gold)]/30 px-3 py-1.5 shrink-0"
                >
                  <Check size={13} /> Made up
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-themed-muted mt-2 px-1 leading-relaxed">
            Made up a missed prayer? Mark it here and your streak heals.
          </p>
        </div>
      )}

      {/* Privacy + intention */}
      <div className="card-bg rounded-2xl border sidebar-border p-4">
        <p className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
          <Shield size={14} className="text-gold shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold text-gold">Private.</span> Your streak is
            just between you and Allah — no leaderboards, no comparison. It&apos;s a
            gentle nudge, not a scoreboard.
          </span>
        </p>
        <p className="font-arabic text-gold text-right text-lg leading-loose mt-3" dir="rtl">
          لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا
        </p>
        <p className="text-themed-muted text-xs italic text-center mt-1">
          &ldquo;Allah does not burden a soul beyond that it can bear.&rdquo; — Qur&apos;an 2:286
        </p>
      </div>
    </div>
  );
}
