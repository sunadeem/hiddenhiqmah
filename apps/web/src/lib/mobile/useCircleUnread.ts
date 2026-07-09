"use client";

import { useEffect, useState } from "react";
import { App as CapApp } from "@capacitor/app";
import { getUnreadCount } from "@/lib/circles";

/**
 * Live unread-count of the signed-in user's circle notifications — for the More
 * tab badge. Circles moved off the tab bar (Hifz took its slot), so its nudges
 * now surface on More. Refreshes on mount, on app resume / tab-visible, on a slow
 * tick, and whenever circle data changes in-session (mutations broadcast
 * "hiqmah:circles-changed", since SPA navigation never fires visibilitychange).
 * Returns 0 on any error, so the badge simply stays hidden rather than throwing.
 */
export function useCircleUnread(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const sync = () => {
      getUnreadCount()
        .then((n) => {
          if (alive) setCount(n);
        })
        .catch(() => {
          if (alive) setCount(0);
        });
    };
    sync();

    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    const onChanged = () => sync();
    window.addEventListener("hiqmah:circles-changed", onChanged);
    const timer = setInterval(sync, 90_000);
    let removeApp: (() => void) | undefined;
    CapApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) sync();
    }).then((handle) => {
      removeApp = () => void handle.remove();
    });

    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("hiqmah:circles-changed", onChanged);
      clearInterval(timer);
      removeApp?.();
    };
  }, []);

  return count;
}
