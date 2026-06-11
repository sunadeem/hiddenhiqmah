"use client";

import { Capacitor } from "@capacitor/core";
import { scheduleAllNotifications } from "./notifications";

/**
 * Run once on app start to apply native-only configuration.
 * Safe to call on web — guards each call with isNativePlatform().
 */
export async function applyNativeSetup() {
  if (!Capacitor.isNativePlatform()) return;

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
