"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Reads ?section= from URL, scrolls to the matching element,
 * and adds a brief highlight glow animation.
 *
 * Elements should have id="section-{key}" attributes.
 */
export function useScrollToSection() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  useEffect(() => {
    if (!section) return;

    // Small delay to let AnimatePresence / tab content render
    const timer = setTimeout(() => {
      const el = document.getElementById(`section-${section}`);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add highlight glow
      el.classList.add("section-highlight");
      const cleanup = setTimeout(() => {
        el.classList.remove("section-highlight");
      }, 2000);

      return () => clearTimeout(cleanup);
    }, 400);

    return () => clearTimeout(timer);
  }, [section]);

  return section;
}
