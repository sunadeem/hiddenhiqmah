"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * The house master-detail rail (Level 2 of the content pattern): a vertical
 * pill list on desktop that becomes a horizontal scroll strip on mobile, with
 * the active topic's card(s) on the right. Promoted from the identical inline
 * copies that lived in /family and /marriage — import this instead of copying.
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
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-52 w-full shrink-0">
        {subs.map((sub) => (
          <button
            key={sub.key}
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
