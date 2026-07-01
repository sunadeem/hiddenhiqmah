// Imperative wrapper around AuthGateProvider's window.__requireAuth global, for
// use inside event handlers (where a React hook isn't convenient). Returns true
// if the user is signed in (proceed); otherwise opens the sign-up modal and
// returns false. If the provider isn't mounted yet, it does not block.
export function requireAccount(opts?: {
  title?: string;
  message?: string;
}): boolean {
  if (typeof window === "undefined") return true;
  const fn = (window as unknown as Record<string, unknown>).__requireAuth as
    | ((o?: { title?: string; message?: string }) => boolean)
    | undefined;
  return fn ? fn(opts) : true;
}
