"use client";

/**
 * `?qiblah=1` on Home → open the Qiblah sheet.
 *
 * The qibla widget deep-links to "/?qiblah=1" (WIDGET_ROUTES in deeplinks.ts)
 * rather than the /qiblah article, so a tap lands on the live compass without
 * leaving Home. Home is a swappable *style* (daily-path / classic / focus / …),
 * each style owning its own QiblahSheet, so the param plumbing lives here — one
 * implementation every style calls — instead of being re-derived per file.
 *
 * Three arrival paths, and ALL are needed:
 *   1. The URL. A cross-route or cold-start deep link mounts (or remounts) Home
 *      with the param already in `window.location.search`.
 *   2. The `hiqmah:deep-link-nav` / `hiqmah:push-nav` events. Tapping the widget
 *      while the app is already foregrounded on Home is a SAME-ROUTE navigation,
 *      which doesn't remount Home — so the mount effect never re-runs and the URL
 *      path alone would silently do nothing. Mirrors CirclesScreen's ?chat=.
 *   3. The deep-link latch. On a cold start the link is routed ~300ms before Home
 *      exists, so the event in (2) is broadcast to nobody. deeplinks.ts parks it;
 *      we drain it on mount. Draining on the (2) path too is what stops a link
 *      taken live from re-firing here on a later remount.
 */

import { useEffect, useRef } from "react";

import { takeParkedDeepLink } from "./deep-link-latch";

export const QIBLAH_PARAM = "qiblah";

/** Navigation events that can carry the param without a remount. */
const NAV_EVENTS = ["hiqmah:deep-link-nav", "hiqmah:push-nav"] as const;

/** Does this route (a path, possibly with a query) ask for the compass? */
function routeWantsQiblah(route: string | null): boolean {
  if (!route) return false;
  const q = route.indexOf("?");
  return q >= 0 && hasQiblahParam(route.slice(q));
}

/** Does this query string ask for the compass? Any value but "0" counts. */
function hasQiblahParam(search: string): boolean {
  try {
    const v = new URLSearchParams(search).get(QIBLAH_PARAM);
    return v !== null && v !== "0";
  } catch {
    return false;
  }
}

/**
 * Read (and clear) the flag from the current URL. Stripping it means a pull to
 * refresh, or a later back-navigation to Home, doesn't reopen the sheet the user
 * just closed.
 */
export function consumeQiblahParam(): boolean {
  if (typeof window === "undefined") return false;
  if (!hasQiblahParam(window.location.search)) return false;
  try {
    window.history.replaceState(null, "", window.location.pathname);
  } catch {
    /* history unavailable — worst case the param sticks for this view */
  }
  return true;
}

/**
 * Open the Qiblah sheet when Home is reached with `?qiblah=1`.
 *
 * @param openQiblah opens the caller's own sheet. May be a fresh closure every
 *   render — it's held in a ref, so listeners attach exactly once.
 */
export function useQiblahParam(openQiblah: () => void): void {
  // Held in a ref so the listeners below attach exactly once no matter how often
  // the caller re-renders. Kept current in its own effect (declared FIRST, so it
  // has run before the listener effect fires).
  const openRef = useRef(openQiblah);
  useEffect(() => {
    openRef.current = openQiblah;
  }, [openQiblah]);

  useEffect(() => {
    // Both reads run — the latch is drained even when the URL already carried the
    // flag, so a link delivered twice can't leave a copy parked for a remount.
    const fromUrl = consumeQiblahParam();
    const fromLatch = routeWantsQiblah(takeParkedDeepLink());
    if (fromUrl || fromLatch) openRef.current();

    const timers: number[] = [];
    const onNav = (e: Event) => {
      const url = (e as CustomEvent<{ url?: string }>).detail?.url ?? "";
      if (!routeWantsQiblah(url)) return;
      takeParkedDeepLink(); // taking delivery live; don't leave it parked as well
      openRef.current();
      // The strip can't happen inline: a `hiqmah:push-nav` is dispatched around
      // the same tick as its router.push, so replaceState now would race the push
      // and lose. Re-check shortly after and only strip what's actually landed in
      // the URL.
      timers.push(window.setTimeout(consumeQiblahParam, 400));
    };

    for (const name of NAV_EVENTS) window.addEventListener(name, onNav);
    return () => {
      for (const name of NAV_EVENTS) window.removeEventListener(name, onNav);
      for (const t of timers) window.clearTimeout(t);
    };
  }, []);
}
