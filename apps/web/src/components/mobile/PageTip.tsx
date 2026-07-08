"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsNative } from "@/lib/mobile/platform";
import { hapticLight } from "@/lib/mobile/haptics";

const KEY_PREFIX = "hiqmah-tip-";

export type Tip = { key: string; title: string; body: string };

/** Clear every first-time tip flag so all PageTips show again (QA/testing). */
export function resetPageTips() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(KEY_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/**
 * First-time page coach-marks. Renders any tips not yet seen (each tracked by
 * `hiqmah-tip-<key>` in localStorage), ONE AT A TIME, centered on screen over a
 * light scrim. When a page passes more than one tip, a "1/2" counter shows and
 * "Next" steps through them; the last one says "Got it". Native-only, and only
 * after the welcome walkthrough (`hiqmah-onboarded`) so it never fights
 * WelcomeSheet. No tour library.
 */
export default function PageTip({
  tips,
  delayMs = 700,
}: {
  tips: Tip[];
  delayMs?: number;
}) {
  const native = useIsNative();
  const [queue, setQueue] = useState<Tip[]>([]);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!native) return;
    let pending: Tip[] = [];
    try {
      if (!localStorage.getItem("hiqmah-onboarded")) return;
      pending = tips.filter((t) => !localStorage.getItem(KEY_PREFIX + t.key));
    } catch {
      return;
    }
    if (!pending.length) return;
    setQueue(pending);
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
    // tips is a stable literal per page; keying on native/delay is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native, delayMs]);

  const flag = (key: string) => {
    try {
      localStorage.setItem(KEY_PREFIX + key, "1");
    } catch {
      /* ignore */
    }
  };

  // "Next" / "Got it": mark the current tip seen and advance (or finish).
  const advance = () => {
    hapticLight();
    const cur = queue[idx];
    if (cur) flag(cur.key);
    if (idx + 1 < queue.length) setIdx(idx + 1);
    else setShow(false);
  };

  // X / scrim tap: mark all remaining tips seen and close the whole sequence.
  const dismissAll = () => {
    hapticLight();
    queue.slice(idx).forEach((t) => flag(t.key));
    setShow(false);
  };

  if (!native || !queue.length) return null;
  const cur = queue[idx];
  const total = queue.length;

  return (
    <AnimatePresence>
      {show && cur && (
        <>
          <motion.div
            className="fixed inset-0 z-[75] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissAll}
          />
          <motion.div
            key={cur.key}
            role="status"
            className="fixed z-[76] left-1/2 top-1/2 w-[min(20rem,calc(100vw-2.5rem))] -translate-x-1/2"
            initial={{ opacity: 0, scale: 0.96, y: "-46%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.96, y: "-50%" }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
          >
            <div className="relative rounded-2xl border border-[var(--color-gold)]/40 bg-[var(--color-sidebar)]/95 backdrop-blur-xl shadow-xl shadow-black/40 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-[var(--color-gold)]/15 text-gold flex items-center justify-center">
                  <Sparkles size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-themed leading-tight">
                    {cur.title}
                  </p>
                  <p className="text-[13px] text-themed-muted mt-1 leading-relaxed">
                    {cur.body}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={advance}
                      className="text-xs font-semibold text-gold active:opacity-70 touch-manipulation"
                    >
                      {idx + 1 < total ? "Next" : "Got it"}
                    </button>
                    {total > 1 && (
                      <span className="text-[11px] text-themed-muted tabular-nums">
                        {idx + 1}/{total}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={dismissAll}
                  aria-label="Dismiss tips"
                  className="shrink-0 -mr-1 -mt-1 p-1 text-themed-muted active:text-themed touch-manipulation"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
