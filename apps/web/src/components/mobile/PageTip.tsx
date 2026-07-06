"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsNative } from "@/lib/mobile/platform";
import { hapticLight } from "@/lib/mobile/haptics";

type Anchor = "top-left" | "top-right" | "top-center" | "bottom-center";

const KEY_PREFIX = "hiqmah-tip-";

// Fixed placement per anchor. Top offsets clear the iOS status bar + top bar;
// the bottom offset clears the floating tab bar.
const POS: Record<Anchor, string> = {
  "top-left": "left-3 top-[calc(env(safe-area-inset-top)+56px)]",
  "top-right": "right-3 top-[calc(env(safe-area-inset-top)+56px)]",
  "top-center":
    "left-1/2 -translate-x-1/2 top-[calc(env(safe-area-inset-top)+56px)]",
  "bottom-center":
    "left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+104px)]",
};

// A rotated square whose two visible edges carry the gold border, so it reads
// as a small arrow pointing toward the feature being highlighted.
const ARROW: Record<Anchor, string> = {
  "top-left": "-top-1.5 left-7 border-t border-l",
  "top-right": "-top-1.5 right-7 border-t border-l",
  "top-center": "-top-1.5 left-1/2 -translate-x-1/2 border-t border-l",
  "bottom-center": "-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r",
};

/**
 * First-time page coach-mark. Renders ONCE per `tipKey` (persisted as
 * `hiqmah-tip-<key>` in localStorage), then never again on any device that has
 * seen it. Native-app only, and only after the welcome walkthrough is done
 * (`hiqmah-onboarded`), so it never fights WelcomeSheet. Mount it inside a
 * feature page; it floats over the page (position: fixed) and points at that
 * page's key feature via `anchor`. No tour library.
 */
export default function PageTip({
  tipKey,
  title,
  body,
  anchor = "bottom-center",
  delayMs = 700,
}: {
  tipKey: string;
  title: string;
  body: string;
  anchor?: Anchor;
  delayMs?: number;
}) {
  const native = useIsNative();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!native) return;
    let skip = true;
    try {
      // Wait until onboarding is finished, and only fire once per key.
      const onboarded = !!localStorage.getItem("hiqmah-onboarded");
      skip = !onboarded || !!localStorage.getItem(KEY_PREFIX + tipKey);
    } catch {
      skip = true;
    }
    if (skip) return;
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [native, tipKey, delayMs]);

  const dismiss = () => {
    hapticLight();
    try {
      localStorage.setItem(KEY_PREFIX + tipKey, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!native) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          className={`fixed z-[76] w-[min(20rem,calc(100vw-1.5rem))] ${POS[anchor]}`}
          initial={{
            opacity: 0,
            y: anchor === "bottom-center" ? 10 : -10,
            scale: 0.97,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
        >
          <div className="relative rounded-2xl border border-[var(--color-gold)]/40 bg-[var(--color-sidebar)]/95 backdrop-blur-xl shadow-xl shadow-black/40 p-4">
            <span
              className={`absolute w-3 h-3 rotate-45 bg-[var(--color-sidebar)]/95 border-[var(--color-gold)]/40 ${ARROW[anchor]}`}
            />
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-[var(--color-gold)]/15 text-gold flex items-center justify-center">
                <Sparkles size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-themed leading-tight">
                  {title}
                </p>
                <p className="text-[13px] text-themed-muted mt-1 leading-relaxed">
                  {body}
                </p>
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-3 text-xs font-semibold text-gold active:opacity-70 touch-manipulation"
                >
                  Got it
                </button>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss tip"
                className="shrink-0 -mr-1 -mt-1 p-1 text-themed-muted active:text-themed touch-manipulation"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
