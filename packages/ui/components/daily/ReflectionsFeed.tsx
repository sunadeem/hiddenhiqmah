"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Share2, Sparkles, ChevronLeft, ChevronRight, ChevronDown, Check, ArrowRight } from "lucide-react";
import { REMINDER_THEMES, dailyIndex, themeLabel, type Reminder } from "../../lib/reminders";

/**
 * Reflections deck — one card at a time, swipe left/right (horizontal scroll-snap,
 * robust in the WKWebView). Opens on the day's reflection and advances one card
 * per day; the user can browse back/forward. A multiselect theme dropdown filters
 * the deck (union of chosen themes; "All themes" when none selected).
 */
export function ReflectionsFeed({
  reminders,
  today,
  savedIds,
  onToggleSave,
  onShare,
  onOpen,
  onHaptic,
}: {
  reminders: Reminder[];
  today: string;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onShare?: (r: Reminder) => void;
  onOpen?: (r: Reminder) => void;
  onHaptic?: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const themes = useMemo(() => {
    const present = new Set(reminders.map((r) => r.theme));
    return REMINDER_THEMES.filter((t) => present.has(t.key));
  }, [reminders]);

  const list = useMemo(
    () => (selected.size === 0 ? reminders : reminders.filter((r) => selected.has(r.theme))),
    [reminders, selected]
  );

  const isAll = selected.size === 0;
  const startIndex = useMemo(
    () => (isAll ? dailyIndex(today, list.length) : 0),
    [isAll, today, list.length]
  );
  const selectionKey = useMemo(() => [...selected].sort().join("|"), [selected]);

  const scrollToIndex = (i: number, smooth: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    setIndex(startIndex);
    requestAnimationFrame(() => scrollToIndex(startIndex, false));
  }, [selectionKey, startIndex]);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const go = (delta: number) => {
    const next = Math.min(Math.max(index + delta, 0), list.length - 1);
    onHaptic?.();
    scrollToIndex(next, true);
    setIndex(next);
  };

  const toggleTheme = (key: string) => {
    onHaptic?.();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const label =
    selected.size === 0
      ? "All themes"
      : REMINDER_THEMES.filter((t) => selected.has(t.key))
          .map((t) => t.label)
          .join(", ");

  if (reminders.length === 0) {
    return (
      <div className="card-bg rounded-2xl border sidebar-border p-8 text-center">
        <Sparkles size={22} className="text-gold mx-auto mb-2" />
        <p className="text-themed font-semibold">Reflections coming soon</p>
        <p className="text-themed-muted text-sm mt-1">A verified set of reminders is on the way.</p>
      </div>
    );
  }

  const onDailyCard = isAll && index === startIndex;

  return (
    <div className="space-y-3">
      {/* Theme filter — multiselect dropdown */}
      <div className="relative z-50">
        <button
          type="button"
          onClick={() => {
            onHaptic?.();
            setOpen((o) => !o);
          }}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl card-bg border sidebar-border text-sm font-medium text-themed touch-manipulation"
        >
          <span className="flex-1 min-w-0 truncate text-left mr-2">{label}</span>
          <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
            <div className="absolute z-50 mt-1 w-full rounded-xl card-bg border sidebar-border shadow-xl p-2">
              <button
                type="button"
                onClick={() => {
                  onHaptic?.();
                  setSelected(new Set());
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 mb-1 rounded-lg text-sm text-left touch-manipulation ${
                  selected.size === 0 ? "bg-[var(--color-gold)]/10 text-gold font-medium" : "text-themed"
                }`}
              >
                All themes
                {selected.size === 0 && <Check size={15} className="text-gold" />}
              </button>
              {/* 2-column grid so every theme is visible at once (no hidden scroll) */}
              <div className="grid grid-cols-2 gap-1">
                {themes.map((t) => {
                  const on = selected.has(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => toggleTheme(t.key)}
                      className={`flex items-center justify-between gap-1.5 px-3 py-2.5 rounded-lg text-sm text-left touch-manipulation ${
                        on ? "bg-[var(--color-gold)]/10 text-gold font-medium" : "text-themed"
                      }`}
                    >
                      <span className="truncate">{t.label}</span>
                      {on && <Check size={14} className="text-gold shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Swipe deck */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory -mx-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain"
        style={{ scrollbarWidth: "none" }}
      >
        {list.map((r, i) => (
          <div key={r.id} className="snap-center shrink-0 w-full px-1">
            <ReflectionCard
              r={r}
              isToday={isAll && i === startIndex}
              saved={savedIds.has(r.id)}
              onToggleSave={onToggleSave}
              onShare={onShare}
              onOpen={onOpen}
              onHaptic={onHaptic}
            />
          </div>
        ))}
      </div>

      {/* Position + nav */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index <= 0}
          className={`p-2 rounded-full touch-manipulation ${index <= 0 ? "text-themed-muted opacity-30" : "text-themed"}`}
          aria-label="Previous reflection"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-xs text-themed-muted tabular-nums">
          {onDailyCard ? "Today · " : ""}
          {Math.min(index + 1, list.length)} / {list.length}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={index >= list.length - 1}
          className={`p-2 rounded-full touch-manipulation ${index >= list.length - 1 ? "text-themed-muted opacity-30" : "text-themed"}`}
          aria-label="Next reflection"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function ReflectionCard({
  r,
  isToday,
  saved,
  onToggleSave,
  onShare,
  onOpen,
  onHaptic,
}: {
  r: Reminder;
  isToday: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onShare?: (r: Reminder) => void;
  onOpen?: (r: Reminder) => void;
  onHaptic?: () => void;
}) {
  return (
    <div className="card-bg rounded-2xl border sidebar-border p-5 relative overflow-hidden min-h-[58vh] flex flex-col">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[var(--color-gold)]/[0.08] to-transparent" />
      <div className="relative flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.2em] text-themed-muted">
          {themeLabel(r.theme)}
        </span>
        {isToday && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-gold">
            <Sparkles size={11} /> Today
          </span>
        )}
      </div>

      <div className="relative flex-1 flex flex-col justify-center">
        {r.arabic && (
          <p className="font-arabic text-gold text-[26px] leading-loose text-right mb-4" dir="rtl">
            {r.arabic}
          </p>
        )}
        <p className={`text-themed leading-relaxed ${r.arabic ? "text-base" : "text-lg font-medium italic"}`}>
          {r.textEn}
        </p>
        {r.translit && (
          <p className="text-themed-muted text-xs leading-relaxed mt-3">{r.translit}</p>
        )}
      </div>

      {/* Horizontal swipe affordance */}
      <div className="relative flex items-center justify-center gap-2 text-themed-muted/25 mt-3 pointer-events-none select-none">
        <ChevronLeft size={14} />
        <ChevronRight size={14} />
      </div>

      <div className="relative flex items-center justify-between mt-4 pt-3 border-t sidebar-border">
        {r.sourceKind === "quran" && onOpen ? (
          <button
            type="button"
            onClick={() => onOpen(r)}
            className="inline-flex items-center gap-1 text-xs text-gold touch-manipulation"
            aria-label={`Open Qur'an ${r.sourceRef}`}
          >
            Qur'an {r.sourceRef}
            <ArrowRight size={12} />
          </button>
        ) : (
          <span className="text-xs text-themed-muted">
            {r.sourceKind === "quran" ? `Qur'an ${r.sourceRef}` : r.sourceRef}
          </span>
        )}
        <div className="flex items-center gap-1">
          {onShare && (
            <button
              type="button"
              onClick={() => onShare(r)}
              aria-label="Share reflection"
              className="p-2 rounded-full text-themed-muted touch-manipulation"
            >
              <Share2 size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onHaptic?.();
              onToggleSave(r.id);
            }}
            aria-label={saved ? "Remove from saved" : "Save reflection"}
            className={`p-2 rounded-full touch-manipulation ${saved ? "text-gold" : "text-themed-muted"}`}
          >
            <Heart size={16} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReflectionsFeed;
