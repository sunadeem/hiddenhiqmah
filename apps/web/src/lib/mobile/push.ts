"use client";

/**
 * Remote push (APNs) registration for Hidden Hiqmah.
 *
 * Separate from notifications.ts (local scheduling): remote push does not consume
 * the local 64-pending budget and never touches the adhan/prayer scheduler. We:
 *   1. once notification permission is granted, register with APNs,
 *   2. persist the returned device token — plus this device's IANA timezone — to
 *      Supabase (upsert_device_token RPC),
 *   3. route a tapped push to its deep link (same extra.url contract as local).
 *
 * The timezone is what lets the weekly duʿā arrive at ~10am local instead of a
 * fixed UTC hour (migration 031). It re-uploads on EVERY foreground, because
 * MobileShell calls registerPush() from its appStateChange listener and iOS
 * re-emits the `registration` event on each register() — so a user who flies to
 * another zone (or edits their device clock) is corrected the next time they open
 * the app, with no extra plumbing.
 *
 * Mobile is browsable without an account (soft gate) and the RPC needs auth.uid(),
 * so when signed out we cache the token and re-persist on the next foreground /
 * after sign-in (register() re-fires on every foreground).
 *
 * The token's declared `environment` (production by default; sandbox for dev
 * builds via .env) is a best-effort guess — the SERVER (apns.ts) tries both
 * environments and self-corrects device_tokens.environment, so a mislabel just
 * costs one retry on the first send.
 */

import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "@/lib/supabase";
import { getNotificationPrefs } from "@hidden-hiqmah/ui/lib/storage";

const TOKEN_CACHE_KEY = "hiqmah-apns-token-pending";
const PREFS_DIRTY_KEY = "hiqmah-push-prefs-dirty";

/** Flag the remote-push preferences as not yet mirrored to the server. Set by the
 *  Notifications screen when an RPC fails (signed out, offline); cleared once
 *  syncPushPrefs lands them. Exported so the settings UI can mark it. */
export function markPushPrefsDirty(): void {
  try {
    localStorage.setItem(PREFS_DIRTY_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Re-assert the remote-push preferences (profiles.dua_push /
 * reengagement_push / circle_push) from this device's saved prefs.
 *
 * The send routes read those COLUMNS, so a toggle whose RPC failed — the common
 * case being a user who changed it while signed out, since the settings screen
 * isn't auth-gated — would otherwise leave the server sending a push the user
 * explicitly declined, with nothing to correct it. The RPCs are idempotent, so
 * we simply re-state the local truth whenever we have a session.
 */
async function syncPushPrefs(): Promise<void> {
  try {
    if (!localStorage.getItem(PREFS_DIRTY_KEY)) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return; // still signed out — stay dirty, retry next foreground
    const prefs = getNotificationPrefs();
    const results = await Promise.all([
      supabase.rpc("set_my_dua_push", { p_enabled: prefs.duaPush !== false }),
      supabase.rpc("set_my_reengagement_push", {
        p_enabled: prefs.reengagementPush !== false,
      }),
      supabase.rpc("set_my_circle_push", { p_enabled: prefs.circleChat === true }),
    ]);
    // Only clear the flag once every write actually landed (rpc resolves errors
    // rather than throwing, so check each one).
    if (results.every((r) => !r.error)) localStorage.removeItem(PREFS_DIRTY_KEY);
  } catch {
    /* leave the flag set; we retry on the next foreground */
  }
}

const APNS_ENV: "production" | "sandbox" =
  process.env.NEXT_PUBLIC_APNS_ENVIRONMENT === "sandbox" ? "sandbox" : "production";

/**
 * This device's IANA timezone name (e.g. "America/Toronto"), or null.
 *
 * Stored on device_tokens (migration 031) so the weekly duʿā push can be sent at
 * ~10:00 on Wednesday in the user's OWN local time instead of a fixed 14:00 UTC.
 * It must be the zone NAME, never an offset: an offset is only correct for half
 * the year, and the server re-derives the offset from the name on every send so
 * DST needs no migration.
 *
 * Wrapped in try/catch and 64-char-bounded (the column's check constraint):
 * registration is how a device becomes reachable at all, and must never fail
 * over a timezone lookup. null simply means "unknown", which the server reads as
 * "leave whatever zone is on file" and, if there is none, "keep this device on
 * the legacy 14:00 UTC send".
 */
function deviceTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof tz !== "string") return null;
    const trimmed = tz.trim();
    return trimmed && trimmed.length <= 64 ? trimmed : null;
  } catch {
    return null;
  }
}

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
    // p_timezone is a DEFAULTED argument on a single (non-overloaded)
    // upsert_device_token — migration 031 deliberately dropped the old 3-arg
    // signature rather than adding an overload, because two candidates matching
    // the same argument names is how PostgREST ends up answering PGRST203 and
    // token registration stops working for older builds. Sending the key
    // explicitly (even as null) is therefore safe and unambiguous; null means
    // "keep whatever zone is already on file".
    const { error } = await supabase.rpc("upsert_device_token", {
      p_token: token,
      p_platform: "ios",
      p_environment: APNS_ENV,
      p_timezone: deviceTimezone(),
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

async function ensureListeners(): Promise<void> {
  if (listenersReady) return;
  listenersReady = true;
  // Await the attaches BEFORE register() so a fast token event can't slip through
  // before a listener exists.
  await PushNotifications.addListener("registration", (t) => {
    void persistToken(t.value);
  });
  await PushNotifications.addListener("registrationError", () => {
    /* token unavailable; nothing to persist */
  });
  await PushNotifications.addListener("pushNotificationActionPerformed", (a) => {
    const url = (a?.notification?.data as { url?: string } | undefined)?.url;
    if (!url) return;
    if (navigateFn) navigateFn(url);
    // Also broadcast the tap. A same-route navigation (e.g. tapping a circle push
    // while already on /circles) does NOT remount the target screen, so its
    // deep-link effect never re-runs. Screens that resolve their own params
    // (CirclesScreen ?chat=) listen for this and react even without a remount.
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hiqmah:push-nav", { detail: { url } }));
      }
    } catch {
      /* ignore */
    }
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
  if (!Capacitor.isNativePlatform()) return;
  if (navigate) navigateFn = navigate;
  try {
    await ensureListeners();
    const perm = await PushNotifications.checkPermissions();
    if (perm.receive === "granted") {
      await PushNotifications.register();
    }
  } catch {
    /* ignore — no-op on web / plugin unavailable */
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
  // Same trigger points (foreground + post-sign-in) are exactly when a
  // previously-failed preference write can finally land.
  await syncPushPrefs();
}
