"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Share2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { REMINDER_THEMES, dailyIndex, themeLabel, type Reminder } from "../../lib/reminders";

/**
 * Reflections deck — one card at a time, swipe left/right (horizontal scroll-snap,
 * which is robust in the WKWebView). Opens on the day's reflection and advances
 * one card per day; the user can browse back/forward freely. Theme chips filter
 * the deck. Save + share per card.
 */
export function ReflectionsFeed({
  reminders,
  today,
  savedIds,
  onToggleSave,
  onShare,
  onHaptic,
}: {
  reminders: Reminder[];
  today: string;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onShare?: (r: Reminder) => void;
  onHaptic?: () => void;
}) {
  const [theme, setTheme] = useState<string>("all");
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const chips = useMemo(() => {
    const present = new Set(reminders.map((r) => r.theme));
    return [{ key: "all", label: "All" }, ...REMINDER_THEMES.filter((t) => present.has(t.key))];
  }, [reminders]);

  const list = useMemo(
    () => (theme === "all" ? reminders : reminders.filter((r) => r.theme === theme)),
    [reminders, theme]
  );

  // The day's starting card (advances daily) on "All"; first card on a theme.
  const startIndex = useMemo(
    () => (theme === "all" ? dailyIndex(today, list.length) : 0),
    [theme, today, list.length]
  );

  const scrollToIndex = (i: number, smooth: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  };

  // Jump to the start card whenever the deck (theme) changes.
  useEffect(() => {
    setIndex(startIndex);
    requestAnimationFrame(() => scrollToIndex(startIndex, false));
  }, [theme, startIndex]);

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

  if (reminders.length === 0) {
    return (
      <div className="card-bg rounded-2xl border sidebar-border p-8 text-center">
        <Sparkles size={22} className="text-gold mx-auto mb-2" />
        <p className="text-themed font-semibold">Reflections coming soon</p>
        <p className="text-themed-muted text-sm mt-1">A verified set of reminders is on the way.</p>
      </div>
    );
  }

  const onDailyCard = theme === "all" && index === startIndex;

  return (
    <div className="space-y-3">
      {/* Theme chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => {
              onHaptic?.();
              setTheme(c.key);
            }}
            className={`shrink-0 whitespace-nowrap text-[13px] font-semibold px-4 py-2 rounded-full touch-manipulation transition-colors ${
              theme === c.key
                ? "bg-[var(--color-gold)] text-[var(--color-bg)]"
                : "card-bg border sidebar-border text-themed-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
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
              isToday={theme === "all" && i === startIndex}
              saved={savedIds.has(r.id)}
              onToggleSave={onToggleSave}
              onShare={onShare}
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
          {index + 1} / {list.length}
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
  onHaptic,
}: {
  r: Reminder;
  isToday: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onShare?: (r: Reminder) => void;
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

      <div className="relative flex items-center justify-between mt-4 pt-3 border-t sidebar-border">
        <span className="text-xs text-themed-muted">
          {r.sourceKind === "quran" ? `Qur'an ${r.sourceRef}` : r.sourceRef}
        </span>
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
