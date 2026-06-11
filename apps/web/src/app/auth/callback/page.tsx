"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const TIMEOUT_MS = 5_000;
    let cancelled = false;

    const tryGetSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        router.replace("/?welcome=signed-in");
      } else {
        router.replace("/signin?error=callback_failed");
      }
    };

    // The Supabase client (detectSessionInUrl: true) processes the URL on init.
    // Give it a small window to land, then check.
    const t = setTimeout(tryGetSession, 600);

    // Hard timeout fallback
    const failsafe = setTimeout(() => {
      if (!cancelled) router.replace("/signin?error=callback_failed");
    }, TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(t);
      clearTimeout(failsafe);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="w-10 h-10 rounded-full border-2 border-[var(--color-gold)]/30 border-t-gold animate-spin mb-4" />
      <p className="text-themed-muted text-sm">Signing you in...</p>
    </div>
  );
}
