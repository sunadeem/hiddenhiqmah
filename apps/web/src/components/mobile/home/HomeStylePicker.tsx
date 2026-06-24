"use client";

import { useState } from "react";
import { Check, Maximize2 } from "lucide-react";
import HomePreviewModal from "./HomePreviewModal";
import { type PreviewStyle } from "./HomePreview";
import type { HomeStyle, TunedFor } from "@hidden-hiqmah/ui/lib/storage";

/**
 * Visual picker for the Home style — schematic thumbnails of each layout so the
 * user sees what they're choosing (not just a dropdown). Tapping a thumbnail
 * opens a full-size live preview (HomePreviewModal) where the choice is
 * committed. Thumbnails are lightweight wireframes, not live renders.
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

function RamadanThumb() {
  return (
    <ThumbFrame>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]/60" />
        <div className="h-1.5 flex-1 rounded-sm bg-[var(--color-gold)]/40" />
      </div>
      <div className="h-6 rounded bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/25" />
      <div className="h-2 rounded-sm bg-white/[0.07]" />
      <div className="h-2 w-2/3 rounded-sm bg-[var(--color-gold)]/40" />
      <div className="h-4 rounded bg-white/[0.07]" />
    </ThumbFrame>
  );
}

const THUMBS: Record<HomeStyle, () => React.ReactElement> = {
  "daily-path": DailyPathThumb,
  classic: ClassicThumb,
  focus: FocusThumb,
};

type Tile = { key: PreviewStyle; label: string; Thumb: () => React.ReactElement; selected: boolean };

export default function HomeStylePicker({
  value,
  tunedFor,
  ramadanAuto,
  onChange,
  onToggleRamadan,
}: {
  value: HomeStyle;
  tunedFor: TunedFor;
  ramadanAuto: boolean;
  onChange: (v: HomeStyle) => void;
  onToggleRamadan: (on: boolean) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewStyle, setPreviewStyle] = useState<PreviewStyle>(value);

  const openPreview = (s: PreviewStyle) => {
    setPreviewStyle(s);
    setPreviewOpen(true);
  };

  const selected = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  const tiles: Tile[] = [
    ...OPTIONS.map((o) => ({ key: o.value, label: o.label, Thumb: THUMBS[o.value], selected: o.value === value })),
    { key: "ramadan", label: "Ramadan", Thumb: RamadanThumb, selected: ramadanAuto },
  ];

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {tiles.map((t) => (
          <button
            key={t.key}
            onClick={() => openPreview(t.key)}
            className={`relative rounded-xl border p-1.5 text-left touch-manipulation active:scale-[0.98] transition-transform ${
              t.selected
                ? "border-[var(--color-gold)] bg-[var(--color-gold)]/8"
                : "sidebar-border card-bg"
            }`}
          >
            <div className="relative">
              <t.Thumb />
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-md bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <Maximize2 size={9} className="text-white/80" />
              </div>
              {t.selected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold flex items-center justify-center shadow">
                  <Check size={11} strokeWidth={3} className="text-[#0a1628]" />
                </div>
              )}
            </div>
            <p
              className={`text-[11px] font-semibold text-center mt-1.5 leading-tight ${
                t.selected ? "text-gold" : "text-themed"
              }`}
            >
              {t.label}
              {t.key === "ramadan" && (
                <span className="block text-[9px] font-normal text-themed-muted/70">seasonal</span>
              )}
            </p>
          </button>
        ))}
      </div>
      <p className="text-xs text-themed-muted mt-2.5 px-1 leading-relaxed">
        {selected.desc}{" "}
        <span className="text-themed-muted/70">
          Tap a layout to preview it. Ramadan home auto-activates during Ramadan.
        </span>
      </p>

      <HomePreviewModal
        open={previewOpen}
        initialStyle={previewStyle}
        currentStyle={value}
        tunedFor={tunedFor}
        ramadanAuto={ramadanAuto}
        onClose={() => setPreviewOpen(false)}
        onSelect={(s) => {
          onChange(s);
          setPreviewOpen(false);
        }}
        onUseRamadan={() => onToggleRamadan(true)}
      />
    </div>
  );
}
