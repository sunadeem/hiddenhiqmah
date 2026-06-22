"use client";

import { Check } from "lucide-react";
import type { HomeStyle } from "@hidden-hiqmah/ui/lib/storage";

/**
 * Visual picker for the Home style — schematic thumbnails of each layout so the
 * user sees what they're choosing (not just a dropdown). Thumbnails are
 * lightweight wireframes, not live renders.
 */

const OPTIONS: { value: HomeStyle; label: string; desc: string }[] = [
  { value: "daily-path", label: "Daily Path", desc: "Your day as one adaptive ribbon, tuned to your focus." },
  { value: "classic", label: "Classic", desc: "The original dashboard — verse, prayer, streak & tiles." },
  { value: "focus", label: "Focus", desc: "Minimal — next prayer and a single suggested act." },
];

function ThumbFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="aspect-[3/4] rounded-lg border sidebar-border bg-[var(--color-bg)] p-1.5 flex flex-col gap-1 overflow-hidden">
      {children}
    </div>
  );
}

function DailyPathThumb() {
  return (
    <ThumbFrame>
      <div className="h-2 rounded-sm bg-[var(--color-gold)]/45" />
      <div className="h-5 rounded bg-white/[0.07]" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className="w-1 h-1 rounded-full shrink-0"
            style={{ background: i === 0 ? "var(--color-gold)" : "rgba(255,255,255,.25)" }}
          />
          <div
            className="flex-1 h-2.5 rounded-sm"
            style={{ background: i === 0 ? "rgba(212,168,67,.28)" : "rgba(255,255,255,.07)" }}
          />
        </div>
      ))}
    </ThumbFrame>
  );
}

function ClassicThumb() {
  return (
    <ThumbFrame>
      <div className="h-7 rounded bg-white/[0.07] flex flex-col items-center justify-center gap-1">
        <div className="h-1 w-3/5 rounded-sm bg-[var(--color-gold)]/45" />
        <div className="h-1 w-4/5 rounded-sm bg-white/15" />
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="h-3.5 rounded bg-white/[0.07]" />
        <div className="h-3.5 rounded bg-white/[0.07]" />
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-2.5 rounded bg-white/[0.07]" />
        ))}
      </div>
    </ThumbFrame>
  );
}

function FocusThumb() {
  return (
    <ThumbFrame>
      <div className="h-2 rounded-sm bg-[var(--color-gold)]/45" />
      <div className="h-7 rounded bg-white/[0.07]" />
      <div className="h-4 rounded bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/25" />
      <div className="flex-1" />
    </ThumbFrame>
  );
}

const THUMBS: Record<HomeStyle, () => React.ReactElement> = {
  "daily-path": DailyPathThumb,
  classic: ClassicThumb,
  focus: FocusThumb,
};

export default function HomeStylePicker({
  value,
  onChange,
}: {
  value: HomeStyle;
  onChange: (v: HomeStyle) => void;
}) {
  const selected = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5">
        {OPTIONS.map((o) => {
          const Thumb = THUMBS[o.value];
          const isSel = o.value === value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`relative rounded-xl border p-1.5 text-left touch-manipulation active:scale-[0.98] transition-transform ${
                isSel
                  ? "border-[var(--color-gold)] bg-[var(--color-gold)]/8"
                  : "sidebar-border card-bg"
              }`}
            >
              <div className="relative">
                <Thumb />
                {isSel && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold flex items-center justify-center shadow">
                    <Check size={11} strokeWidth={3} className="text-[#0a1628]" />
                  </div>
                )}
              </div>
              <p
                className={`text-[11px] font-semibold text-center mt-1.5 leading-tight ${
                  isSel ? "text-gold" : "text-themed"
                }`}
              >
                {o.label}
              </p>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-themed-muted mt-2.5 px-1 leading-relaxed">{selected.desc}</p>
    </div>
  );
}
