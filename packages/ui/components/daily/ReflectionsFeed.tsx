"use client";

import { useMemo, useState } from "react";
import { Heart, Share2, Sparkles } from "lucide-react";
import {
  REMINDER_THEMES,
  reflectionOfTheDay,
  themeLabel,
  type Reminder,
} from "../../lib/reminders";

/** Inspirational Reflections feed — theme chips, a daily featured reflection, and
 *  a column of reminder cards. Presentational; saves/share are injected. */
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

  const featured = useMemo(() => reflectionOfTheDay(reminders, today), [reminders, today]);

  const chips = useMemo(() => {
    const present = new Set(reminders.map((r) => r.theme));
    return [{ key: "all", label: "All" }, ...REMINDER_THEMES.filter((t) => present.has(t.key))];
  }, [reminders]);

  const list = useMemo(() => {
    const base = theme === "all" ? reminders : reminders.filter((r) => r.theme === theme);
    // Featured is shown separately on "all"; avoid duplicating it at the top.
    return theme === "all" && featured ? base.filter((r) => r.id !== featured.id) : base;
  }, [reminders, theme, featured]);

  if (reminders.length === 0) {
    return (
      <div className="card-bg rounded-2xl border sidebar-border p-8 text-center">
        <Sparkles size={22} className="text-gold mx-auto mb-2" />
        <p className="text-themed font-semibold">Reflections coming soon</p>
        <p className="text-themed-muted text-sm mt-1">A verified set of reminders is on the way.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      {/* Reflection of the day (on "all") */}
      {theme === "all" && featured && (
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-themed-muted px-1 mb-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-gold" /> Reflection of the day
          </div>
          <ReflectionCard
            r={featured}
            featured
            saved={savedIds.has(featured.id)}
            onToggleSave={onToggleSave}
            onShare={onShare}
            onHaptic={onHaptic}
          />
        </div>
      )}

      <div className="space-y-3">
        {list.map((r) => (
          <ReflectionCard
            key={r.id}
            r={r}
            saved={savedIds.has(r.id)}
            onToggleSave={onToggleSave}
            onShare={onShare}
            onHaptic={onHaptic}
          />
        ))}
      </div>
    </div>
  );
}

function ReflectionCard({
  r,
  featured = false,
  saved,
  onToggleSave,
  onShare,
  onHaptic,
}: {
  r: Reminder;
  featured?: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onShare?: (r: Reminder) => void;
  onHaptic?: () => void;
}) {
  return (
    <div className="card-bg rounded-2xl border sidebar-border p-5 relative overflow-hidden">
      <div
        className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${
          featured
            ? "from-[var(--color-gold)]/14 to-transparent"
            : "from-[var(--color-gold)]/[0.06] to-transparent"
        }`}
      />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.2em] text-themed-muted mb-3">
          {themeLabel(r.theme)}
          {r.tone === "accountability" ? " · Reflect" : " · Hope"}
        </div>

        {r.arabic && (
          <p className="font-arabic text-gold text-2xl leading-loose text-right mb-3" dir="rtl">
            {r.arabic}
          </p>
        )}

        <p
          className={`text-themed leading-relaxed ${
            featured ? "text-lg font-medium" : "text-[15px]"
          } ${!r.arabic ? "italic" : ""}`}
        >
          {r.textEn}
        </p>

        {r.translit && (
          <p className="text-themed-muted text-xs leading-relaxed mt-2">{r.translit}</p>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t sidebar-border">
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
              className={`p-2 rounded-full touch-manipulation ${
                saved ? "text-gold" : "text-themed-muted"
              }`}
            >
              <Heart size={16} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReflectionsFeed;
