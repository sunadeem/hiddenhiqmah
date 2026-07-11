"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * The house accordion for point-dense content inside a card/tab — lets a leaf
 * stay thorough without one uninterrupted scroll (IA audit "house pattern v2").
 * Single-expand by default (expanding one collapses the other), matching the
 * one pre-existing hand-rolled accordion (islamic-calendar months).
 */
export default function Accordion({
  items,
  defaultOpenId = null,
  allowMultiple = false,
}: {
  items: { id: string; title: string; subtitle?: string; children: ReactNode }[];
  defaultOpenId?: string | null;
  allowMultiple?: boolean;
}) {
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(defaultOpenId ? [defaultOpenId] : [])
  );

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = open.has(item.id);
        return (
          <div
            key={item.id}
            className="card-bg rounded-xl border sidebar-border overflow-hidden"
          >
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              aria-expanded={isOpen}
            >
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-semibold ${isOpen ? "text-gold" : "text-themed"}`}
                >
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="block text-xs text-themed-muted mt-0.5">
                    {item.subtitle}
                  </span>
                )}
              </div>
              <ChevronDown
                size={16}
                className={`shrink-0 text-gold transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 pb-4 pt-1">{item.children}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
