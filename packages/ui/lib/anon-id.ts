/**
 * Device-scoped UUID used to identify anonymous AI Chat callers for quota
 * enforcement. Stored in localStorage; survives page reloads but not
 * "Clear local data". A user resetting this just gets a fresh quota
 * window — acceptable trade-off for now.
 */
const ANON_ID_KEY = "hiqmah-anon-id";

export function getOrCreateAnonId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(ANON_ID_KEY);
    if (existing) return existing;
    const newId = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, newId);
    return newId;
  } catch {
    // localStorage unavailable (private mode, etc.) — return ephemeral UUID
    return crypto.randomUUID();
  }
}

/**
 * Reads the current Supabase session JWT from localStorage if present.
 * Avoids a hard dependency on the supabase-js client from packages/ui.
 * Returns undefined if not signed in or token expired.
 */
export function getStoredAuthToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const token = parsed?.access_token;
      const expiresAt = parsed?.expires_at;
      if (token && expiresAt && expiresAt > Math.floor(Date.now() / 1000)) {
        return token;
      }
    }
  } catch {
    // ignore
  }
  return undefined;
}
