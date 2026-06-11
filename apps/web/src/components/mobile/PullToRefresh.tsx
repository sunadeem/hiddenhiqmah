"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { hapticLight } from "@/lib/mobile/haptics";

const THRESHOLD = 70; // px pulled before a release triggers refresh
const MAX_PULL = 110; // visual cap

/**
 * Pull-to-refresh wrapper. Detects a downward drag while the nearest scroll
 * ancestor is at the top, shows a spinner, and runs onRefresh on release.
 * Works inside the MobileShell scroll container.
 */
export default function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const scroller = useRef<HTMLElement | null>(null);

  const findScroller = (el: HTMLElement | null): HTMLElement | null => {
    let node: HTMLElement | null = el;
    while (node) {
      const oy = getComputedStyle(node).overflowY;
      if ((oy === "auto" || oy === "scroll") && node.scrollHeight > node.clientHeight) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (refreshing) return;
    const s = findScroller(e.currentTarget as HTMLElement);
    scroller.current = s;
    startY.current = s && s.scrollTop <= 0 ? e.touches[0].clientY : null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && scroller.current && scroller.current.scrollTop <= 0) {
      setPull(Math.min(MAX_PULL, dy * 0.5));
    } else {
      setPull(0);
    }
  };

  const onTouchEnd = async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD);
      hapticLight();
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-150"
        style={{ height: pull }}
      >
        <Loader2
          size={20}
          className={`text-gold ${refreshing ? "animate-spin" : ""}`}
          style={{
            opacity: Math.min(1, pull / THRESHOLD),
            transform: `rotate(${refreshing ? 0 : pull * 3}deg)`,
          }}
        />
      </div>
      {children}
    </div>
  );
}
