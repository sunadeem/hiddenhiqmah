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
    let attached: HTMLElement | null = null;
    let scrollRaf = 0;
    let attachRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const el = attached;
        if (!el) return;
        const y = el.scrollTop;
        const delta = y - lastY.current;
        if (y < 28) setDir("up"); // always show near the top
        else if (delta > 6) setDir("down");
        else if (delta < -6) setDir("up");
        lastY.current = y;
      });
    };
    // The scroll container (MobileShell's <main>) may not exist the instant this
    // effect first runs (e.g. auth still resolving swaps the tree), and the effect
    // won't re-run since `ref` is stable — so if we bailed on a null ref the
    // listener would NEVER attach and the bars would never hide. Retry until it's
    // there, then attach once.
    const attach = () => {
      const el = ref.current;
      if (!el) {
        attachRaf = requestAnimationFrame(attach);
        return;
      }
      attached = el;
      lastY.current = el.scrollTop;
      el.addEventListener("scroll", onScroll, { passive: true });
    };
    attach();
    return () => {
      if (attachRaf) cancelAnimationFrame(attachRaf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      attached?.removeEventListener("scroll", onScroll);
    };
  }, [ref]);

  return dir;
}
