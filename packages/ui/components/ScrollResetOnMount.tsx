"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { resolveScroller } from "../lib/scroller";

/**
 * Moves the scroller to a page-requested offset in the same commit that mounts
 * this element, then clears the request.
 *
 * Why a mount layout effect and not a plain `scrollTop = 0` in the click handler:
 * the handler runs while the OUTGOING branch is still mounted and mid-exit
 * (AnimatePresence `mode="wait"`, 200ms), so the user watches the old list snap
 * upward and only then crossfade. Here the write lands pre-paint inside the one
 * commit where the branches swap, so no frame is ever painted with the new
 * content at the wrong offset and the incoming opacity 0→1 covers the change.
 *
 * `target` must be a ref, never state: requesting a scroll must not cause a
 * render, and the request must die with the page so it cannot outlive the visit.
 * A null target is a no-op — a branch swap nobody asked for must never scroll,
 * which is what keeps this off the ?d= deep-link path.
 */
export default function ScrollResetOnMount({
  target,
}: {
  target: RefObject<number | null>;
}) {
  const anchor = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const to = target.current;
    target.current = null; // one-shot
    if (to === null) return;
    const el = resolveScroller(anchor.current);
    if (el) el.scrollTop = to;
    // Mount-only on purpose. Keyed on [activeCategory] instead it would also fire
    // on the FIRST mount, so every ?d= / ?tab= arrival would slam to the top and
    // race the deep link's 500ms scrollIntoView — passing on a fast device and
    // failing on a slow one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span ref={anchor} aria-hidden className="hidden" />;
}
