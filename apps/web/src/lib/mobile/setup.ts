"use client";

import { Capacitor } from "@capacitor/core";
import { scheduleAllNotifications } from "./notifications";

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
  document
    .querySelector('meta[name="viewport"]')
    ?.setAttribute(
      "content",
      "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no"
    );

  try {
    const { Keyboard } = await import("@capacitor/keyboard");
    // Hide the iOS "previous/next/done" accessory toolbar above the keyboard.
    await Keyboard.setAccessoryBarVisible({ isVisible: false });
  } catch {
    // plugin unavailable; ignore
  }

  // Refresh the rolling window of prayer/daily notifications on every app open.
  // Silent — only schedules if the user has already granted permission.
  void scheduleAllNotifications(false);
}
