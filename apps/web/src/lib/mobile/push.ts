"use client";

/**
 * Remote push (APNs) registration for Hidden Hiqmah.
 *
 * Separate from notifications.ts (local scheduling): remote push does not consume
 * the local 64-pending budget and never touches the adhan/prayer scheduler. We:
 *   1. once notification permission is granted, register with APNs,
 *   2. persist the returned device token to Supabase (upsert_device_token RPC),
 *   3. route a tapped push to its deep link (same extra.url contract as local).
 *
 * Mobile is browsable without an account (soft gate) and the RPC needs auth.uid(),
 * so when signed out we cache the token and re-persist on the next foreground /
 * after sign-in (register() re-fires on every foreground).
 *
 * NOTE: the `diag` / getPushDiag() / forceRegisterPush() below are a temporary
 * diagnostic surface (DebugPushCard) to trace registration on-device. Remove
 * once push delivery is verified.
 */

import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "@/lib/supabase";

const TOKEN_CACHE_KEY = "hiqmah-apns-token-pending";

const APNS_ENV: "production" | "sandbox" =
  process.env.NEXT_PUBLIC_APNS_ENVIRONMENT === "sandbox" ? "sandbox" : "production";

// ─── diagnostics (temporary) ───────────────────────────────────────────────
export type PushDiag = {
  native: boolean;
  apnsEnv: string;
  permission: string;
  registerCalled: boolean;
  token: string | null;
  registrationError: string | null;
  sessionPresent: boolean | null;
  lastPersist: string | null;
  updatedAt: number;
};
const diag: PushDiag = {
  native: false,
  apnsEnv: APNS_ENV,
  permission: "?",
  registerCalled: false,
  token: null,
  registrationError: null,
  sessionPresent: null,
  lastPersist: null,
  updatedAt: 0,
};
function record(patch: Partial<PushDiag>): void {
  Object.assign(diag, patch, { updatedAt: Date.now() });
}
export function getPushDiag(): PushDiag {
  return { ...diag };
}

let navigateFn: ((url: string) => void) | null = null;
let listenersReady = false;

async function persistToken(token: string): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    record({ sessionPresent: !!session });
    if (!session) {
      try {
        localStorage.setItem(TOKEN_CACHE_KEY, token);
      } catch {
        /* ignore */
      }
      record({ lastPersist: "cached (signed out)" });
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
      record({ lastPersist: "rpc error: " + error.message });
    } else {
      try {
        localStorage.removeItem(TOKEN_CACHE_KEY);
      } catch {
        /* ignore */
      }
      record({ lastPersist: "saved ✓" });
    }
  } catch (e) {
    try {
      localStorage.setItem(TOKEN_CACHE_KEY, token);
    } catch {
      /* ignore */
    }
    record({ lastPersist: "exception: " + String(e) });
  }
}

async function ensureListeners(): Promise<void> {
  if (listenersReady) return;
  listenersReady = true;
  // Await the attaches BEFORE register() so a fast token event can't slip through
  // before a listener exists.
  await PushNotifications.addListener("registration", (t) => {
    record({ token: t.value.slice(0, 16) + "…", registrationError: null });
    void persistToken(t.value);
  });
  await PushNotifications.addListener("registrationError", (err) => {
    record({ registrationError: JSON.stringify(err) });
  });
  await PushNotifications.addListener("pushNotificationActionPerformed", (a) => {
    const url = (a?.notification?.data as { url?: string } | undefined)?.url;
    if (url && navigateFn) navigateFn(url);
  });
}

/**
 * Register for remote push. Safe to call repeatedly (e.g. every foreground):
 * listeners attach once, register() re-fetches + re-asserts the token. Only
 * registers once permission is granted — the prompt is owned by notifications.ts.
 */
export async function registerPush(
  navigate?: (url: string) => void
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    record({ native: false });
    return;
  }
  record({ native: true });
  if (navigate) navigateFn = navigate;
  try {
    await ensureListeners();
    const perm = await PushNotifications.checkPermissions();
    record({ permission: perm.receive });
    if (perm.receive === "granted") {
      record({ registerCalled: true });
      await PushNotifications.register();
    }
  } catch (e) {
    record({ registrationError: "register threw: " + String(e) });
  }
}

/** Debug/force path: prompt for permission if needed, then register. */
export async function forceRegisterPush(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await ensureListeners();
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive !== "granted") {
      perm = await PushNotifications.requestPermissions();
    }
    record({ permission: perm.receive });
    if (perm.receive === "granted") {
      record({ registerCalled: true });
      await PushNotifications.register();
    }
  } catch (e) {
    record({ registrationError: "force threw: " + String(e) });
  }
}

/** Re-persist a token cached while signed out. Call after sign-in / on foreground. */
export async function flushPendingPushToken(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const pending = localStorage.getItem(TOKEN_CACHE_KEY);
    if (pending) await persistToken(pending);
  } catch {
    /* ignore */
  }
}
