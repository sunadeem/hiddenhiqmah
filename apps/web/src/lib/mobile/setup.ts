"use client";

import { Capacitor } from "@capacitor/core";
import { scheduleAllNotifications } from "./notifications";

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

  // Refresh the rolling window of prayer/daily notifications on every app open.
  // Silent — only schedules if the user has already granted permission.
  void scheduleAllNotifications(false);
}
