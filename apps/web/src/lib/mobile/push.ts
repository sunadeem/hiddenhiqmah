"use client";

/**
 * Remote push (APNs) registration for Hidden Hiqmah.
 *
 * This is deliberately SEPARATE from notifications.ts (local scheduling): remote
 * push does not consume the local 64-pending budget and never touches the adhan/
 * prayer scheduler. All we do here is:
 *   1. once notification permission is granted, register with APNs,
 *   2. persist the returned device token to Supabase (keyed to the signed-in
 *      user via the upsert_device_token RPC), and
 *   3. route a tapped push to its deep link — the SAME extra.url contract the
 *      local tap handler uses.
 *
 * Mobile is browsable without an account (soft gate), and upsert_device_token
 * requires auth.uid(), so when signed out we cache the token and re-persist on
 * the next app open / after sign-in (register() re-fires on every foreground).
 */

import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "@/lib/supabase";

const TOKEN_CACHE_KEY = "hiqmah-apns-token-pending";

// A debug build (run from Xcode) gets a SANDBOX token; TestFlight + App Store
// builds get PRODUCTION tokens. The sender routes to the matching APNs host by
// this value. Overridable via .env (.env.local sets sandbox for dev builds);
// defaults to production, which is correct for TestFlight and the App Store.
const APNS_ENV: "production" | "sandbox" =
  process.env.NEXT_PUBLIC_APNS_ENVIRONMENT === "sandbox" ? "sandbox" : "production";

let navigateFn: ((url: string) => void) | null = null;
let listenersReady = false;

async function persistToken(token: string): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      // Signed out — stash it; re-persisted once a session exists.
      try {
        localStorage.setItem(TOKEN_CACHE_KEY, token);
      } catch {
        /* ignore */
      }
      return;
    }
    const { error } = await supabase.rpc("upsert_device_token", {
      p_token: token,
      p_platform: "ios",
      p_environment: APNS_ENV,
    });
    if (error) {
      try {
        localStorage.setItem(TOKEN_CACHE_KEY, token);
      } catch {
        /* ignore */
      }
    } else {
      try {
        localStorage.removeItem(TOKEN_CACHE_KEY);
      } catch {
        /* ignore */
      }
    }
  } catch {
    try {
      localStorage.setItem(TOKEN_CACHE_KEY, token);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Register for remote push. Safe to call repeatedly (e.g. on every foreground):
 * listeners are attached once, and register() re-fetches the token and re-asserts
 * it to the server. Pass `navigate` to (re)bind the tap router.
 */
export async function registerPush(
  navigate?: (url: string) => void
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (navigate) navigateFn = navigate;

  if (!listenersReady) {
    listenersReady = true;
    void PushNotifications.addListener("registration", (t) => {
      void persistToken(t.value);
    });
    void PushNotifications.addListener("registrationError", () => {
      /* token unavailable; nothing to persist */
    });
    void PushNotifications.addListener("pushNotificationActionPerformed", (a) => {
      const url = (a?.notification?.data as { url?: string } | undefined)?.url;
      if (url && navigateFn) navigateFn(url);
    });
  }

  try {
    const perm = await PushNotifications.checkPermissions();
    // Don't prompt here — notifications.ts owns the permission prompt (a single
    // iOS authorization covers both local + remote). Only register once granted.
    if (perm.receive === "granted") {
      await PushNotifications.register();
    }
  } catch {
    /* ignore — no-op on web / plugin unavailable */
  }
}

/** Re-persist a token cached while signed out. Call after sign-in. */
export async function flushPendingPushToken(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const pending = localStorage.getItem(TOKEN_CACHE_KEY);
    if (pending) await persistToken(pending);
  } catch {
    /* ignore */
  }
}
