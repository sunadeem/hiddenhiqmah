"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Heart, Check, Slash } from "lucide-react";
import {
  buildPreviewDay,
  toLocalDateString,
  type DailyAdapter,
  type DayItem,
  type DayRollup,
  type UserItem,
} from "../../lib/daily/types";
import { rowKindOf } from "../../lib/daily/useChecklist";

type CellState = "full" | "partial" | "missed" | "none" | "before" | "future" | "today";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function firstOfMonth(dateStr: string): Date {
  const [y, m] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/** History calendar modal. Full-screen overlay; days are checkable (retro-complete). */
export function StreakCalendar({
  adapter,
  today,
  onClose,
}: {
  adapter: DailyAdapter;
  today: string;
  onClose: () => void;
}) {
  const [view, setView] = useState<Date>(() => firstOfMonth(today));
  const [selected, setSelected] = useState<string>(today);
  const [byDate, setByDate] = useState<Record<string, DayRollup>>({});
  const [boundary, setBoundary] = useState<string | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [detail, setDetail] = useState<DayItem[] | null>(null);

  // Lock the page behind the modal.
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  // All history + the start boundary + the current list (for retro-complete previews).
  useEffect(() => {
    adapter.getDayRollups("2000-01-01", today).then((rs) => {
      const map: Record<string, DayRollup> = {};
      let min: string | null = null;
      for (const r of rs) {
        map[r.localDate] = r;
        if (!min || r.localDate < min) min = r.localDate;
      }
      setByDate(map);
      adapter.getStartDate().then((sd) => setBoundary(sd ?? min));
    });
    adapter.getUserItems().then(setUserItems);
  }, [adapter, today]);

  useEffect(() => {
    let alive = true;
    setDetail(null);
    adapter.getDayDetail(selected).then((d) => alive && setDetail(d));
    return () => {
      alive = false;
    };
  }, [adapter, selected]);

  const editable = useCallback(
    (date: string) => !!boundary && date >= boundary && date <= today,
    [boundary, today]
  );

  const cells = useMemo(() => {
    const year = view.getFullYear();
    const monthIdx = view.getMonth();
    const lead = (new Date(year, monthIdx, 1).getDay() + 6) % 7; // Mon-first offset
    const days = new Date(year, monthIdx + 1, 0).getDate();
    const out: ({ date: string; state: CellState; day: number } | null)[] = [];
    for (let i = 0; i < lead; i++) out.push(null);
    for (let d = 1; d <= days; d++) {
      const date = toLocalDateString(new Date(year, monthIdx, d));
      let state: CellState;
      if (date > today) {
        state = "future";
      } else if (date === today) {
        const r = byDate[date];
        state = r && r.status !== "none" ? r.status : "today"; // today never shows a frown
      } else {
        const r = byDate[date];
        if (r) state = r.status === "none" ? "missed" : r.status;
        else if (boundary && date >= boundary) state = "missed";
        else state = "before"; // before sign-up, or boundary unknown → empty (not sad)
      }
      out.push({ date, state, day: d });
    }
    return out;
  }, [view, byDate, boundary, today]);

  const canNext =
    view.getFullYear() < firstOfMonth(today).getFullYear() ||
    (view.getFullYear() === firstOfMonth(today).getFullYear() &&
      view.getMonth() < firstOfMonth(today).getMonth());

  const shiftMonth = (n: number) =>
    setView((v) => new Date(v.getFullYear(), v.getMonth() + n, 1));

  // Items shown for the selected day: frozen snapshot, or the current list as an
  // uncompleted preview for an in-range day that hasn't been started.
  const displayItems: DayItem[] =
    detail && detail.length > 0
      ? detail
      : editable(selected)
      ? buildPreviewDay(selected, userItems).items
      : [];

  const toggle = useCallback(
    async (item: DayItem) => {
      if (!editable(selected) || !item.userItemId) return;
      const kind = rowKindOf(item);
      const nextDone = !item.done;
      // Optimistic.
      setDetail((prev) => {
        const base = prev && prev.length > 0 ? prev : buildPreviewDay(selected, userItems).items;
        return base.map((it) =>
          it.userItemId === item.userItemId ? { ...it, done: nextDone } : it
        );
      });
      // Persist for the selected (possibly past) day.
      if (kind === "dhikr") {
        await adapter.setDhikrCount(item.dhikrKey as string, selected, nextDone ? item.goalCount ?? 0 : 0);
      } else if (kind === "count") {
        await adapter.setCount(selected, item.userItemId, nextDone ? item.goalCount ?? 0 : 0);
      } else {
        await adapter.setDone(selected, item.userItemId, nextDone);
      }
      // Fix the streak cache against the REAL today, then refresh this day.
      await adapter.recomputeStreaks(today);
      const [d, rolls] = await Promise.all([
        adapter.getDayDetail(selected),
        adapter.getDayRollups(selected, selected),
      ]);
      setDetail(d);
      setByDate((prev) => (rolls[0] ? { ...prev, [selected]: rolls[0] } : prev));
    },
    [adapter, selected, today, userItems, editable]
  );

  const selDate = new Date(selected + "T12:00:00");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex flex-col bg-themed"
      style={{ overscrollBehavior: "contain" }}
    >
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ paddingTop: "max(env(safe-area-inset-top), 60px)", paddingBottom: 12 }}
      >
        <h2 className="text-lg font-bold text-themed">History</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 -mr-2 rounded-full text-themed-muted touch-manipulation"
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10" style={{ overscrollBehavior: "contain" }}>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="p-2 rounded-full text-themed touch-manipulation"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-semibold text-themed">{monthLabel(view)}</span>
          <button
            type="button"
            onClick={() => canNext && shiftMonth(1)}
            disabled={!canNext}
            className={`p-2 rounded-full touch-manipulation ${
              canNext ? "text-themed" : "text-themed-muted opacity-30"
            }`}
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday header — gold tint so it doesn't blend with day numbers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div
              key={i}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--color-gold)]/70"
            >
              {w}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) =>
            c === null ? (
              <div key={`b${i}`} />
            ) : (
              <button
                key={c.date}
                type="button"
                disabled={c.state === "future"}
                onClick={() => setSelected(c.date)}
                className={[
                  "aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 touch-manipulation",
                  c.date === selected ? "ring-1 ring-[var(--color-gold)]" : "",
                  c.state === "future" ? "opacity-25" : "",
                  c.state === "full" ? "bg-[var(--color-gold)]/15" : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-[13px] leading-none",
                    c.date === today ? "text-gold font-bold" : "text-themed",
                    c.state === "before" || c.state === "future" ? "text-themed-muted" : "",
                  ].join(" ")}
                >
                  {c.day}
                </span>
                {c.state === "full" && <Heart size={11} className="text-gold" fill="currentColor" />}
                {c.state === "partial" && <Slash size={10} className="text-gold" strokeWidth={2.5} />}
                {(c.state === "missed" ||
                  c.state === "none" ||
                  c.state === "before" ||
                  c.state === "future" ||
                  c.state === "today") && <span className="h-[11px]" />}
              </button>
            )
          )}
        </div>

        {/* Detail for the selected day — checkable */}
        <div className="mt-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-themed-muted mb-2">
            {selDate.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          {detail === null ? (
            <div className="text-sm text-themed-muted">Loading…</div>
          ) : displayItems.length === 0 ? (
            <div className="text-sm text-themed-muted">
              {boundary && selected < boundary
                ? "Before you started tracking."
                : "Nothing to track this day."}
            </div>
          ) : (
            <div className="card-bg rounded-2xl border sidebar-border overflow-hidden">
              {displayItems.map((it, i) => {
                const canEdit = editable(selected) && !!it.userItemId;
                return (
                  <div
                    key={it.userItemId ?? i}
                    className={`flex items-center gap-3 px-4 ${i > 0 ? "border-t sidebar-border" : ""}`}
                    style={{ minHeight: 52 }}
                  >
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => void toggle(it)}
                      aria-label={it.done ? "Mark not done" : "Mark done"}
                      className={[
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 touch-manipulation",
                        it.done
                          ? "bg-[var(--color-gold)] text-[var(--color-bg)]"
                          : "border-2 sidebar-border",
                        canEdit ? "" : "opacity-60",
                      ].join(" ")}
                    >
                      {it.done && <Check size={13} strokeWidth={3} />}
                    </button>
                    <span className={`flex-1 py-3 text-sm ${it.done ? "text-themed-muted line-through" : "text-themed"}`}>
                      {it.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-3 flex items-center gap-4 text-[11px] text-themed-muted">
            <span className="inline-flex items-center gap-1">
              <Heart size={11} className="text-gold" fill="currentColor" /> Complete
            </span>
            <span className="inline-flex items-center gap-1">
              <Slash size={11} className="text-gold" /> Partial
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default StreakCalendar;
