"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full bg-white/5 border sidebar-border rounded-xl px-4 py-3 text-themed text-base focus:outline-none focus:border-[var(--color-gold)]/40";
const primaryBtn =
  "w-full bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 rounded-xl py-3.5 font-semibold active:bg-[var(--color-gold)]/30 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  // "checking" while we wait for the recovery session from the email link,
  // "ready" once we have it, "invalid" if it never arrives.
  const [state, setState] = useState<"checking" | "ready" | "invalid">(
    "checking"
  );
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // The Supabase client (detectSessionInUrl) processes the recovery token in
    // the URL on init and establishes a recovery session.
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) setState("ready");
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || session) setState("ready");
    });

    // If no recovery session lands, the link was bad/expired.
    const failsafe = setTimeout(() => {
      if (!cancelled) setState((s) => (s === "ready" ? s : "invalid"));
    }, 4000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(failsafe);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    setDone(true);
    setTimeout(() => router.replace("/"), 1200);
  };

  return (
    <div className="max-w-md mx-auto pt-10 pb-12 px-4">
      <div className="text-center mb-8">
        <p className="text-gold/70 font-arabic text-2xl mb-3 leading-relaxed">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <div className="mx-auto h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
      </div>

      {state === "checking" && (
        <div className="flex flex-col items-center justify-center min-h-[30vh]">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--color-gold)]/30 border-t-gold animate-spin mb-4" />
          <p className="text-themed-muted text-sm">Verifying your reset link...</p>
        </div>
      )}

      {state === "invalid" && (
        <>
          <h1 className="text-2xl font-bold text-themed mb-2 text-center">
            Link expired
          </h1>
          <p className="text-themed-muted text-sm text-center mb-8">
            This password-reset link is invalid or has expired. Request a new one
            from the sign-in screen.
          </p>
          <button
            onClick={() => router.replace("/signin")}
            className={primaryBtn}
          >
            Back to sign in
          </button>
        </>
      )}

      {state === "ready" && !done && (
        <>
          <h1 className="text-2xl font-bold text-themed mb-2 text-center">
            Set a new password
          </h1>
          <p className="text-themed-muted text-sm text-center mb-8">
            Choose a new password for your account.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-themed-muted mb-1.5 block">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                autoFocus
                className={inputClass}
                required
              />
            </div>
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <button type="submit" disabled={busy} className={primaryBtn}>
              {busy ? "Saving..." : "Save new password"}
            </button>
          </form>
        </>
      )}

      {done && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-themed mb-2">
            Password updated
          </h1>
          <p className="text-themed-muted text-sm">Signing you in...</p>
        </div>
      )}
    </div>
  );
}
