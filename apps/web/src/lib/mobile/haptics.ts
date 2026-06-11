"use client";

import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Lightweight haptic helpers. No-op on web; fire only on the native app.
 * Errors are swallowed (haptics are best-effort, never block interaction).
 */
function isNative(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

/** Subtle tap — for taps, toggles, selecting items. */
export function hapticLight(): void {
  if (!isNative()) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

/** Firmer tap — for confirming an action / primary buttons. */
export function hapticMedium(): void {
  if (!isNative()) return;
  Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
}

/** Selection tick — for switching between options (tabs, pickers). */
export function hapticSelection(): void {
  if (!isNative()) return;
  Haptics.selectionChanged().catch(() => {});
}

/** Success buzz — for a completed action (bookmark added, signed in). */
export function hapticSuccess(): void {
  if (!isNative()) return;
  Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}
