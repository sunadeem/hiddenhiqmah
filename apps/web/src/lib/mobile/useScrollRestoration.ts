"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { get as getStored, set as setStored, keyOf } from "./scrollStore";
import { isRestoreExempt } from "@/components/mobile/routes";

// ~10x the observed popstate → route-commit latency, and short enough that a
// popstate with no navigation behind it cannot leave a latch that survives to a
// later push. Only the deferred path (§ commit still pending) ever uses it.
const LATCH_TTL_MS = 1500;
// Worst measured route settle is ~163ms; this is ~2.5x. It is also <= the 400ms
// useScrollToSection timer and < the 500ms ?d= timer, so the window is guaranteed
// closed before any deep-link scroll could begin. Wall clock, not an iteration count.
const CONVERGE_MS = 400;
// Only ever applies on the clamped branch. 1.5x the worst settle, and under the
// ~300ms at which a page transition starts to read as sluggish.
const HOLD_MS = 250;

const ABORT_EVENTS = ["touchstart", "pointerdown", "wheel", "keydown"] as const;

/**
 * Restores the shell scroller's per-route offset on BACKWARD navigation.
 *
 * The shell scrolls a <div>, not the window, so neither the browser's native
 * scroll restoration nor Next's App Router scroll handling saves anything — and
 * because <main> never remounts, a back navigation inherits the OUTGOING route's
 * offset verbatim (measured: back from a page at 790 landed on /more at 790,
 * neither 0 nor the 1200 it was left at). Doing nothing is not neutral, it is
 * arbitrary — hence save + restore, with an explicit fallback of 0.
 *
 * Nothing here runs on a forward navigation: Next already resets those to the top
 * (layout-router's scrollIntoView finds this same <main> as the nearest scrollable
 * ancestor), so any forward code would be a double-apply.
 *
 * Returns whether the incoming page must stay invisible for a moment — true only
 * when the first restore write clamped because the content is not tall enough yet.
 */
export function useScrollRestoration(
  ref: RefObject<HTMLElement | null>,
  resync: () => void
): boolean {
  const pathname = usePathname();
  const [holding, setHolding] = useState(false);
  // Suppresses capture while a restore settles, so a clamped intermediate offset
  // cannot overwrite the stored target and poison the NEXT back to this key.
  const frozen = useRef(false);
  const latch = useRef<{ key: string; at: number } | null>(null);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrivalRaf = useRef(0);
  const committedPath = useRef<string | null>(null);
  const cancel = useRef<(() => void) | null>(null);
  const resyncRef = useRef(resync);
  resyncRef.current = resync;

  const beginRestore = useCallback(
    (key: string) => {
      cancel.current?.(); // never two restores in flight
      const el = ref.current;
      const l = window.location;
      if (!el) {
        frozen.current = false;
        return;
      }
      if (isRestoreExempt(l.pathname, l.search, l.hash)) {
        // Exempt means "the page owns its position" — and every one of these pages
        // owns it starting FROM THE TOP, because that is where a fresh forward
        // arrival leaves them (Next's reset) before their own scrollIntoView runs.
        // Returning without writing is not neutral: <main> never remounts, so the
        // OUTGOING route's offset stays. Measured — a back onto /duas?d=ayatul-kursi
        // painted the du'ā page parked at scrollTop 5000, the offset of the Qur'ān
        // list it came from, fully opaque for ~330ms before the 500ms deep-link
        // timer dragged it away. One write makes it indistinguishable from a tap on
        // the same link.
        el.scrollTop = 0;
        resyncRef.current();
        frozen.current = false;
        return;
      }

      // ?? 0 is load-bearing: a back to a route we never captured must land at the
      // top, not at whatever offset the outgoing route happened to leave behind.
      const target = getStored(key) ?? 0;

      let lastApplied = -1;
      let ro: ResizeObserver | null = null;
      let capTimer: ReturnType<typeof setTimeout> | null = null;
      let holdTimer: ReturnType<typeof setTimeout> | null = null;
      let done = false;

      const apply = () => {
        // Absolute, never a delta: idempotent, and it cannot compound with
        // Chromium's scroll anchoring. resync() in the same tick keeps the tab bar
        // and player still — without it a restore reads as one huge downward flick
        // and slides both off screen on every back navigation.
        el.scrollTop = target;
        lastApplied = el.scrollTop;
        resyncRef.current();
      };

      const onScroll = () => {
        // Fights ONLY momentum — a fling still decelerating when the traversal
        // happened. <main> is one node for the life of the process, so a fling
        // started on the outgoing page keeps scrolling the incoming one; measured on
        // Android, an ordinary 300px/120ms flick then Back carried a correctly
        // restored /more 372px past its offset over 50 fully-visible frames and slid
        // the tab bar away with it. It cannot fight a real user scroll: every input
        // that could start one aborts first, and touchstart is dispatched before any
        // scroll it causes.
        if (done || el.scrollTop === lastApplied) return;
        apply();
        // Momentum outlives one correction on some engines (iOS rubber-band in
        // particular), so keep the guard alive a further window each time it has to
        // act — bounded, because only momentum can trigger this and momentum decays.
        if (capTimer) clearTimeout(capTimer);
        capTimer = setTimeout(finish, CONVERGE_MS);
      };

      const finish = () => {
        if (done) return;
        done = true;
        ro?.disconnect();
        el.removeEventListener("scroll", onScroll);
        for (const t of ABORT_EVENTS) window.removeEventListener(t, finish, true);
        if (capTimer) clearTimeout(capTimer);
        if (holdTimer) clearTimeout(holdTimer);
        el.style.overflowAnchor = "";
        setHolding(false);
        frozen.current = false;
        if (cancel.current === finish) cancel.current = null;
      };
      cancel.current = finish;

      el.style.overflowAnchor = "none";
      // Armed BEFORE the first write and kept armed for the whole window, whether or
      // not that write lands: the fast path (content already tall enough) is the one
      // that always runs in practice, so tearing the guard down there — as this did
      // — left every real back navigation with no momentum guard at all and left
      // capture unfrozen, which then wrote the drifted offset back to the store and
      // sent the NEXT back somewhere the user never chose.
      el.addEventListener("scroll", onScroll, { passive: true });
      // Never move the scroller after the user has touched it.
      for (const t of ABORT_EVENTS) window.addEventListener(t, finish, true);
      capTimer = setTimeout(finish, CONVERGE_MS);
      frozen.current = true;

      apply();

      if (el.scrollTop === target) return; // laid out already: nothing to converge on

      // Clamped: the page is still growing. Hold it invisible rather than paint a
      // wrong offset, and correct on every growth until it converges.
      setHolding(true);
      const wrapper = el.firstElementChild;
      if (wrapper) {
        ro = new ResizeObserver(() => {
          if (done) return;
          if (el.scrollTop !== target) apply();
          // RO callbacks are delivered after layout and before paint in the same
          // frame, so each correction is painted atomically with the growth that
          // caused it — no frame shows the pre-correction offset. Reaching the
          // target only ends the HOLD; teardown stays with the cap timer, so a page
          // that converges early keeps the momentum guard for the same window as
          // every other restore, and later growth is still corrected.
          if (el.scrollTop === target) setHolding(false);
        });
        ro.observe(wrapper);
      }
      holdTimer = setTimeout(() => setHolding(false), HOLD_MS);
    },
    [ref]
  );

  // ---- backward detection -------------------------------------------------
  // All three back entry points funnel into popstate and no forward path does:
  // Android hardware/gesture back is handled by the backButton listener in
  // MobileShell, which calls router.back() — it deliberately does NOT touch
  // history directly, precisely so this funnel keeps holding; the edge-swipe in
  // MobileShell calls router.back(), and MobileTopBar's chevron calls
  // router.back().
  useEffect(() => {
    const onPop = () => {
      const l = window.location;
      const key = keyOf(l);
      frozen.current = true;

      // MEASURED, and the whole reason this is not a plain latch: Next's App Router
      // registers its popstate listener when the root mounts, before this one (the
      // shell is dynamically imported), and it commits the route SYNCHRONOUSLY
      // inside that handler. A later-registered listener already sees the incoming
      // route's DOM (scrollHeight 3156 = /more) — so the route-commit layout effect
      // has ALREADY run by the time we get here, and a latch left for it would
      // never be consumed. When the commit is already done we restore right here:
      // still inside the popstate task, so still before the browser paints.
      if (committedPath.current === l.pathname) {
        latch.current = null;
        if (watchdog.current) {
          clearTimeout(watchdog.current);
          watchdog.current = null;
        }
        beginRestore(key);
        return;
      }

      // Commit still pending (a traversal React defers): hand it to the layout
      // effect instead. Kept because the synchronous behaviour above is Next's
      // current scheduling choice, not a contract.
      latch.current = { key, at: Date.now() };
      if (watchdog.current) clearTimeout(watchdog.current);
      watchdog.current = setTimeout(() => {
        // A popstate with no route commit behind it would otherwise leave capture
        // frozen for the rest of the session.
        latch.current = null;
        frozen.current = false;
      }, LATCH_TTL_MS);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (watchdog.current) clearTimeout(watchdog.current);
    };
  }, [beginRestore]);

  // ---- capture ------------------------------------------------------------
  useEffect(() => {
    let attached: HTMLElement | null = null;
    let scrollRaf = 0;
    let attachRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        // Checked here, not at event time: a sample queued BEFORE a popstate would
        // otherwise run after it and stamp the outgoing offset with the incoming URL.
        if (frozen.current) return;
        const el = attached;
        if (!el) return;
        const l = window.location;
        // Read live from location, never from useSearchParams: it makes attribution
        // self-correcting (Next's forward reset to 0 is stamped with the incoming
        // route, where 0 is the right answer — measured), and useSearchParams in the
        // root shell risks a CSR bailout in a static export.
        if (isRestoreExempt(l.pathname, l.search, l.hash)) return;
        setStored(keyOf(l), el.scrollTop);
      });
    };
    // Same retry-until-present idiom as useScrollDirection; <main> is one node for
    // the life of the process, so this attaches exactly once.
    const attach = () => {
      const el = ref.current;
      if (!el) {
        attachRaf = requestAnimationFrame(attach);
        return;
      }
      attached = el;
      el.addEventListener("scroll", onScroll, { passive: true });
    };
    attach();
    return () => {
      if (attachRaf) cancelAnimationFrame(attachRaf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      attached?.removeEventListener("scroll", onScroll);
    };
  }, [ref]);

  // ---- route commit -------------------------------------------------------
  // Keyed on pathname — the same boundary as MobileShell's key={pathname} remount.
  // Records what is now on screen (which is how the popstate handler above knows
  // whether the commit has already happened) and consumes a deferred latch.
  useLayoutEffect(() => {
    committedPath.current = window.location.pathname;

    const lat = latch.current;
    latch.current = null;
    if (watchdog.current) {
      clearTimeout(watchdog.current);
      watchdog.current = null;
    }
    const key = keyOf(window.location);
    const usable =
      lat &&
      // Neutralises a popstate that changed no URL: it leaves a latch but no commit
      // follows, so the next real navigation drops it here.
      lat.key === key &&
      Date.now() - lat.at <= LATCH_TTL_MS;

    if (usable) {
      beginRestore(key);
    } else {
      frozen.current = false;
      // Record where this route ACTUALLY arrived, one frame later.
      //
      // Nothing else ever writes an arrival: the capture listener only fires on a
      // scroll event, and a forward navigation that lands at 0 from a page already
      // at 0 produces none. So an offset stored on an earlier visit survived
      // untouched and the next back applied it — measured, /more snapped to 2333
      // having sat at the top for that entire visit. `getStored(key) ?? 0` cannot
      // help: the key IS present, just stale.
      //
      // The rAF is not a hedge, it is the mechanism. On a back traversal Next
      // commits the route synchronously inside its OWN popstate listener, which is
      // registered before ours, so this body runs while <main> still holds the
      // OUTGOING offset and before anything has told us a traversal is under way.
      // Writing inline would stamp that arbitrary offset onto the incoming key and
      // destroy the very value the restore is about to read. One frame later our
      // popstate handler has run and frozen capture, so the write is skipped in
      // exactly the case where it would be wrong.
      arrivalRaf.current = requestAnimationFrame(() => {
        arrivalRaf.current = 0;
        if (frozen.current) return;
        const el = ref.current;
        const loc = window.location;
        if (!el || isRestoreExempt(loc.pathname, loc.search, loc.hash)) return;
        setStored(keyOf(loc), el.scrollTop);
      });
    }

    // A route change (or unmount) tears down any convergence still running,
    // including a pending arrival write, which would otherwise land after the next
    // route has already committed and stamp its offset onto the key we just left.
    // releases the hold and unfreezes capture. This MUST be the layout effect's own
    // cleanup, not a passive one: React runs it immediately before the next route's
    // layout effect body, whereas a passive cleanup would run after that body and
    // kill a restore it had just started. finish() is idempotent, so whichever of
    // cap / abort / convergence / route-change arrives first is the only owner, and
    // there is no path on which the content can stay invisible.
    return () => {
      if (arrivalRaf.current) cancelAnimationFrame(arrivalRaf.current);
      arrivalRaf.current = 0;
      cancel.current?.();
    };
  }, [pathname, beginRestore, ref]);

  return holding;
}
