"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/**
 * Tracks the vertical scroll direction of a scroll container. Returns "down"
 * while scrolling down (used to hide the bottom tab bar) and "up" while scrolling
 * up or near the top (tab bar visible). Small thresholds avoid flicker.
 *
 * Also returns `resync`, which must be called in the same tick as ANY programmatic
 * scroll write (see useScrollRestoration): a restore is a single +N-hundred-px
 * delta, which this hook would otherwise read as a fast downward flick and use to
 * slide the tab bar and mini-player off screen on every back navigation. A delta
 * threshold cannot separate the two — real momentum flicks exceed any threshold
 * worth picking — so the write site re-baselines instead.
 */
export function useScrollDirection(ref: RefObject<HTMLElement | null>): {
  dir: "up" | "down";
  resync: () => void;
} {
  const [dir, setDir] = useState<"up" | "down">("up");
  const lastY = useRef(0);
  const attachedRef = useRef<HTMLElement | null>(null);

  const resync = useCallback(() => {
    const el = attachedRef.current;
    if (!el) return;
    // Measure the next real gesture from where we just put the scroller, and show
    // the chrome: arriving on a page always shows it today, because Next's forward
    // reset drives scrollTop under the y < 28 always-show rule.
    lastY.current = el.scrollTop;
    setDir("up");
  }, []);

  useEffect(() => {
    let scrollRaf = 0;
    let attachRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const el = attachedRef.current;
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
      attachedRef.current = el;
      lastY.current = el.scrollTop;
      el.addEventListener("scroll", onScroll, { passive: true });
    };
    attach();
    return () => {
      if (attachRaf) cancelAnimationFrame(attachRaf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      attachedRef.current?.removeEventListener("scroll", onScroll);
    };
  }, [ref]);

  return { dir, resync };
}
