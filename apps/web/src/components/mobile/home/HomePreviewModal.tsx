"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check } from "lucide-react";
import HomePreview from "./HomePreview";
import type { HomeStyle, TunedFor } from "@hidden-hiqmah/ui/lib/storage";

const STYLES: { value: HomeStyle; label: string }[] = [
  { value: "daily-path", label: "Daily Path" },
  { value: "classic", label: "Classic" },
  { value: "focus", label: "Focus" },
];

/**
 * Full-screen "tap to expand" preview of a Home style. Lets the user flip
 * between styles at full size and commit with a button — so they see what each
 * home looks like before choosing. Portaled to <body> so it overlays the tab bar
 * regardless of ancestor stacking contexts.
 */
export default function HomePreviewModal({
  open,
  initialStyle,
  currentStyle,
  tunedFor,
  onClose,
  onSelect,
}: {
  open: boolean;
  initialStyle: HomeStyle;
  currentStyle: HomeStyle;
  tunedFor: TunedFor;
  onClose: () => void;
  onSelect: (s: HomeStyle) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<HomeStyle>(initialStyle);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) setStyle(initialStyle);
  }, [open, initialStyle]);

  if (!mounted) return null;

  const isCurrent = style === currentStyle;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[70] flex flex-col"
          style={{ background: "var(--color-bg)" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 pb-3 border-b sidebar-border shrink-0"
            style={{ paddingTop: "max(env(safe-area-inset-top), 60px)" }}
          >
            <button
              onClick={onClose}
              aria-label="Close preview"
              className="w-9 h-9 rounded-full flex items-center justify-center text-themed bg-white/5 active:bg-white/10"
            >
              <X size={18} />
            </button>
            <p className="font-semibold text-themed flex-1 text-center">Preview</p>
            <div className="w-9 shrink-0" />
          </div>

          {/* Style switcher */}
          <div className="px-4 py-3 shrink-0">
            <div className="flex bg-white/[0.06] rounded-xl p-1 gap-1">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${
                    style === s.value
                      ? "bg-[var(--color-gold)]/18 text-gold"
                      : "text-themed-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live body — non-interactive: it's a visual preview, so taps inside
              (links, cards) don't navigate. The scroll container still scrolls
              (touches fall through to it), and the switcher/commit below stay live. */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="pointer-events-none">
              <HomePreview key={style} style={style} tunedFor={tunedFor} />
            </div>
          </div>

          {/* Commit */}
          <div
            className="px-4 pt-3 border-t sidebar-border shrink-0"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
          >
            <button
              onClick={() => onSelect(style)}
              className="w-full rounded-xl bg-gold text-[#0a1628] font-bold py-3.5 flex items-center justify-center gap-2 active:opacity-90"
            >
              {isCurrent ? (
                <>
                  <Check size={18} /> Keep this home
                </>
              ) : (
                "Use this home"
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
