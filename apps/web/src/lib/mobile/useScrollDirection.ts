"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Tracks the vertical scroll direction of a scroll container. Returns "down"
 * while scrolling down (used to hide the bottom tab bar) and "up" while scrolling
 * up or near the top (tab bar visible). Small thresholds avoid flicker.
 */
export function useScrollDirection(
  ref: RefObject<HTMLElement | null>
): "up" | "down" {
  const [dir, setDir] = useState<"up" | "down">("up");
  const lastY = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    lastY.current = el.scrollTop;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = el.scrollTop;
        const delta = y - lastY.current;
        if (y < 28) setDir("up"); // always show near the top
        else if (delta > 6) setDir("down");
        else if (delta < -6) setDir("up");
        lastY.current = y;
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);

  return dir;
}
