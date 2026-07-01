"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type GateOptions = { title?: string; message?: string };

type AuthGateValue = {
  /**
   * Call before a stateful (save-progress) action. Returns true if the user is
   * signed in (proceed). If signed out, opens a "create an account" prompt and
   * returns false (the caller should abort; the user retries after signing up).
   */
  requireAuth: (options?: GateOptions) => boolean;
};

const AuthGateContext = createContext<AuthGateValue>({
  requireAuth: () => true,
});

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [options, setOptions] = useState<GateOptions | null>(null);

  const requireAuth = useCallback(
    (opts?: GateOptions) => {
      if (user) return true;
      setOptions(opts ?? {});
      return false;
    },
    [user]
  );

  // Expose to shared components that can't import this context (e.g. the UI
  // package's BookmarkButton) — mirrors the existing window.__openHiqmah hook.
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__requireAuth = requireAuth;
    return () => {
      delete (window as unknown as Record<string, unknown>).__requireAuth;
    };
  }, [requireAuth]);

  return (
    <AuthGateContext.Provider value={{ requireAuth }}>
      {children}
      {options && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOptions(null)}
        >
          <div
            className="card-bg border sidebar-border rounded-2xl max-w-sm w-full p-6 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOptions(null)}
              aria-label="Close"
              className="absolute top-3 right-3 p-1.5 rounded-lg text-themed-muted hover:text-themed transition-colors"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold text-themed text-center mb-2 mt-2">
              {options.title ?? "Create a free account"}
            </h2>
            <p className="text-themed-muted text-sm text-center leading-relaxed mb-6">
              {options.message ??
                "Sign up to save your progress and keep it across your devices. It's free."}
            </p>
            <Link
              href={`/signin?next=${encodeURIComponent(pathname)}`}
              onClick={() => setOptions(null)}
              className="flex items-center justify-center gap-2 w-full bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 rounded-xl py-3 font-semibold hover:bg-[var(--color-gold)]/30 transition-colors"
            >
              <LogIn size={16} /> Create account or sign in
            </Link>
            <button
              onClick={() => setOptions(null)}
              className="w-full text-xs text-themed-muted hover:text-themed mt-3 py-1 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  return useContext(AuthGateContext);
}
