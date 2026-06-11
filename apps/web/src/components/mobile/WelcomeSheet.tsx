"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const SEEN_WELCOME_KEY = "hiqmah-seen-welcome";

export default function WelcomeSheet() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(true);

  // Re-sync from localStorage every time the route changes. Catches the
  // case where the user taps "Sign in" (which writes the flag but skips
  // the React state update to avoid a home-page flash) and then returns
  // to `/` after signing in.
  useEffect(() => {
    try {
      setHidden(!!localStorage.getItem(SEEN_WELCOME_KEY));
    } catch {
      setHidden(true);
    }
  }, [pathname]);

  if (hidden || pathname !== "/") return null;

  const markSeen = () => {
    try {
      localStorage.setItem(SEEN_WELCOME_KEY, "1");
    } catch {
      // ignore
    }
    // Notify components that gate on the user finishing onboarding
    // (e.g. NextPrayerCard waits for this before asking for location).
    try {
      window.dispatchEvent(new CustomEvent("hiqmah:welcome-dismissed"));
    } catch {
      // ignore — non-browser env
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-themed flex flex-col">
      <div
        className="flex-1 overflow-y-auto px-6 flex flex-col justify-center"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 40px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
        }}
      >
        <div className="text-center mb-10">
          <p className="text-gold/70 font-arabic text-2xl mb-3 leading-relaxed">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <h1 className="text-4xl font-bold text-themed font-display tracking-wide mb-2 mt-4">
            Hidden Hiqmah
          </h1>
          <p className="text-sm text-themed-muted font-cursive italic">
            Hidden Wisdom
          </p>
          <div className="mt-4 mx-auto h-[2px] w-20 rounded-full bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
        </div>

        <p className="text-themed-muted text-center text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Explore Islam through authentic sources — the Quran, Sunnah, and
          scholarly tradition. Free to use as a guest, or sign in for a few
          extras.
        </p>

        <div className="space-y-3 max-w-sm mx-auto w-full">
          {/* Sign in does NOT mark Welcome seen — that happens on successful
              verification in SignInScreen. So backing out of /signin returns
              the user to this Welcome screen, not the home page. */}
          <Link
            href="/signin"
            className="block text-center bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 rounded-xl py-3.5 font-semibold active:bg-[var(--color-gold)]/30 touch-manipulation"
          >
            Sign in
          </Link>

          <button
            type="button"
            onClick={() => {
              markSeen();
              setHidden(true);
            }}
            className="w-full text-themed-muted py-3 text-sm active:text-themed touch-manipulation"
          >
            Continue as guest
          </button>
        </div>

        <p className="text-[10px] text-themed-muted/60 text-center mt-8 max-w-xs mx-auto leading-relaxed">
          You can sign in any time from Settings.
          <br />
          See our{" "}
          <Link href="/privacy" className="text-gold/70 underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
