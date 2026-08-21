"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * The house master-detail rail (Level 2 of the content pattern): a vertical
 * pill list on desktop that becomes a horizontal scroll strip on mobile, with
 * the active topic's card(s) on the right. Promoted from the identical inline
 * copies that lived in /family and /marriage — import this instead of copying.
 *
 * The strip keeps the active pill in view. On a 390px phone a six-entry rail is
 * wider than the screen, so arriving with a sub preselected — a ?sub= deep link,
 * or Back from a detail page — used to land with scrollLeft at 0 and the lit
 * pill off the right-hand edge: the control read as "nothing is selected".
 * Horizontal only, and only when the strip actually overflows, so the desktop
 * column (md:flex-col, no overflow) and the page's own vertical scroll are never
 * touched.
 */
export default function SubTabLayout<T extends string>({
  subs,
  activeSub,
  setActiveSub,
  children,
}: {
  subs: { key: T; label: string; icon?: React.ReactNode }[];
  activeSub: T;
  setActiveSub: (s: T) => void;
  children: React.ReactNode;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    // No overflow ⇒ vertical/desktop layout, or everything already fits.
    if (rail.scrollWidth <= rail.clientWidth + 1) return;
    // Scanned off the DOM rather than looked up with a selector: sub keys are
    // caller-supplied strings and this must not require them to be
    // selector-safe, nor make `subs` an effect dependency.
    const pill = Array.from(rail.children).find(
      (c) => (c as HTMLElement).dataset.subKey === activeSub
    ) as HTMLElement | undefined;
    if (!pill) return;
    const left = pill.offsetLeft - (rail.clientWidth - pill.offsetWidth) / 2;
    rail.scrollTo({
      left: Math.max(0, left),
      // Instant on arrival — an animated strip on first paint reads as a glitch.
      behavior: mountedRef.current ? "smooth" : "auto",
    });
    mountedRef.current = true;
  }, [activeSub]);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div
        ref={railRef}
        className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-52 w-full shrink-0"
      >
        {subs.map((sub) => (
          <button
            key={sub.key}
            data-sub-key={sub.key}
            onClick={() => setActiveSub(sub.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left flex items-center gap-2 ${
              activeSub === sub.key
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-themed-muted hover:text-themed border sidebar-border"
            }`}
          >
            {sub.icon}
            {sub.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSub}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
