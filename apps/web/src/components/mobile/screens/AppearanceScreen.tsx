"use client";

import { Check } from "lucide-react";
import { useTheme } from "@hidden-hiqmah/ui/context/ThemeContext";
import type { ThemeDef } from "@hidden-hiqmah/ui/lib/themes";

function Swatch({
  t,
  active,
  onSelect,
}: {
  t: ThemeDef;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="text-left rounded-2xl p-3 border transition-colors touch-manipulation"
      style={{
        background: "var(--color-card)",
        borderColor: active ? t.accent : "var(--color-border)",
        boxShadow: active ? `0 0 0 1px ${t.accent}` : "none",
      }}
      aria-pressed={active}
    >
      <div
        className="h-12 rounded-xl relative overflow-hidden mb-2.5"
        style={{ background: t.bg, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05)" }}
      >
        <div className="absolute bottom-2 left-2.5 flex gap-1.5">
          {[t.surface, t.accent, t.accent2].map((c, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ background: c, boxShadow: "0 0 0 1px rgba(0,0,0,.25)" }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-themed">{t.name}</span>
        <Check
          size={16}
          strokeWidth={3}
          style={{ color: t.accent, opacity: active ? 1 : 0 }}
        />
      </div>
    </button>
  );
}

function Group({ label, list }: { label: string; list: ThemeDef[] }) {
  const { themeId, setTheme } = useTheme();
  if (!list.length) return null;
  return (
    <div className="space-y-2.5">
      <p className="text-xs uppercase tracking-wider text-themed-muted font-semibold px-1">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {list.map((t) => (
          <Swatch key={t.id} t={t} active={t.id === themeId} onSelect={() => setTheme(t.id)} />
        ))}
      </div>
    </div>
  );
}

export default function AppearanceScreen() {
  const { themes } = useTheme();
  const dark = themes.filter((t) => t.mode === "dark");
  const light = themes.filter((t) => t.mode === "light");

  return (
    <div className="space-y-5 pb-6">
      <div className="text-center pt-1">
        <h1 className="text-2xl font-bold text-themed">Appearance</h1>
        <p className="text-sm text-themed-muted mt-1 max-w-xs mx-auto leading-relaxed">
          Pick a palette — it restyles the whole app, including Ask Hiqmah. Saved on
          this device.
        </p>
      </div>
      <Group label="Dark" list={dark} />
      <Group label="Light" list={light} />
    </div>
  );
}
