"use client";

import { Capacitor } from "@capacitor/core";
import { syncWidgetData } from "@/lib/mobile/widgets";

// Module-scoped so the viewport observer survives (and is not duplicated by)
// remounts of the component that calls applyNativeSetup.
let viewportObserverAttached = false;

/**
 * Run once on app start to apply native-only configuration.
 * Safe to call on web — guards each call with isNativePlatform().
 */
export async function applyNativeSetup() {
  if (!Capacitor.isNativePlatform()) return;

  // Mark the document so globals.css can scope native-only styling.
  // The website's <html> never gets this class, so .native rules are
  // inert on the web build (same static export, different runtime).
  document.documentElement.classList.add("native");

  // Platform class too. The two differ in ways CSS has to know about — most
  // immediately the top inset: iOS needs a 60px floor to clear the Dynamic
  // Island (and because WKWebView reports env(safe-area-inset-top)
  // unreliably), whereas an Android status bar is ~24px and that same floor is
  // ~36px of dead space pushing every screen down.
  document.documentElement.classList.add(Capacitor.getPlatform());

  // Stop the WKWebView from auto-zooming when a text field is focused (and
  // pinch-zoom, for a native feel). Native-only: the website's <meta viewport>
  // in layout.tsx is left untouched, so web pinch-zoom / accessibility stays.
  //
  // Re-asserted via a MutationObserver because React owns <head>: a re-render
  // can rewrite (or replace) the viewport tag with layout.tsx's unlocked value,
  // which silently re-enabled zoom on screens reached by navigation.
  const LOCKED_VIEWPORT =
    "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no";
  const lockViewport = () => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta && meta.getAttribute("content") !== LOCKED_VIEWPORT) {
      meta.setAttribute("content", LOCKED_VIEWPORT);
    }
  };
  lockViewport();
  // Attach the observer at most once per page load — applyNativeSetup runs from
  // a mount effect, so a remount (or StrictMode's double-invoke in dev) would
  // otherwise leak a second observer watching the same node.
  if (!viewportObserverAttached) {
    try {
      // Watch for both an attribute rewrite and a wholesale node swap.
      new MutationObserver(lockViewport).observe(document.head, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["content"],
      });
      viewportObserverAttached = true;
    } catch {
      // MutationObserver unavailable — the one-shot lock above still applies.
    }
  }

  try {
    const { Keyboard } = await import("@capacitor/keyboard");
    // Hide the iOS "previous/next/done" accessory toolbar above the keyboard.
    await Keyboard.setAccessoryBarVisible({ isVisible: false });
    // Whenever the keyboard is open, hide the floating tab bar + mini-player (on
    // every screen) so they don't ride up over it or cover a text input. Toggle
    // a class on <html>; CSS does the hiding. Listen to will + did for both show
    // and hide so it's reliable across iOS versions.
    const showKb = () => document.documentElement.classList.add("keyboard-open");
    const hideKb = () => document.documentElement.classList.remove("keyboard-open");
    Keyboard.addListener("keyboardWillShow", showKb);
    Keyboard.addListener("keyboardDidShow", showKb);
    Keyboard.addListener("keyboardWillHide", hideKb);
    Keyboard.addListener("keyboardDidHide", hideKb);
  } catch {
    // plugin unavailable; ignore
  }

  // Republish prayer times to the App Group so the home-screen / Lock Screen
  // widgets render without running JS. Fire-and-forget and self-throttling (see
  // widgets.ts): the widget extension can't compute anything itself, so "the app
  // was opened" is the main event that refreshes it. Unlike the scheduler below
  // this is idempotent — no cancel-then-rebuild window — so running it here AND
  // from MobileShell's foreground pass is harmless; the second call short-
  // circuits on the write stamp, or fills in the gap when the first one ran
  // before any location fix existed.
  void syncWidgetData();

  // NOTE: the launch-time (re)schedule deliberately lives in MobileShell, not
  // here. scheduleAllNotifications cancels everything before rebuilding, so two
  // overlapping passes open a window where ZERO notifications are pending — and
  // MobileShell's pass is location-aware (it refreshes the fix first, so a user
  // who travelled is scheduled for the city they're actually in). One scheduler
  // per launch; see the foreground effect in MobileShell.tsx.
}
