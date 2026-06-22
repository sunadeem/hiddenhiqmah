"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Clock, Repeat, GraduationCap, Users, Compass, ChevronLeft } from "lucide-react";
import { setHomePrefs, type TunedFor } from "@hidden-hiqmah/ui/lib/storage";

const SEEN_WELCOME_KEY = "hiqmah-seen-welcome";

const TUNE_OPTIONS: { value: TunedFor; icon: typeof Clock; label: string; desc: string }[] = [
  { value: "prayer", icon: Clock, label: "Building my prayers", desc: "Adhkār, du'ās & prayer prep lead your day." },
  { value: "hifz", icon: Repeat, label: "Memorising Qur'an", desc: "Hifz review & reading come first." },
  { value: "new-muslim", icon: GraduationCap, label: "New to Islam", desc: "Start with the essentials — pillars & how to pray." },
  { value: "family", icon: Users, label: "Teaching my family", desc: "Family time & kids' learning up top." },
  { value: "exploring", icon: Compass, label: "Just exploring", desc: "A balanced mix to discover." },
];

export default function WelcomeSheet() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(true);
  const [step, setStep] = useState<"welcome" | "tune">("welcome");

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

  const finish = (tunedFor?: TunedFor) => {
    if (tunedFor) {
      try {
        setHomePrefs({ tunedFor });
      } catch {
        // ignore
      }
    }
    markSeen();
    setHidden(true);
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
        {step === "welcome" ? (
          <>
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
              <button
                type="button"
                onClick={() => setStep("tune")}
                className="block w-full text-center bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 rounded-xl py-3.5 font-semibold active:bg-[var(--color-gold)]/30 touch-manipulation"
              >
                Get started
              </button>

              {/* Sign in does NOT mark Welcome seen — that happens on successful
                  verification in SignInScreen. So backing out of /signin returns
                  the user to this Welcome screen, not the home page. */}
              <Link
                href="/signin"
                className="block text-center text-themed-muted py-3 text-sm active:text-themed touch-manipulation"
              >
                Sign in instead
              </Link>
            </div>

            <p className="text-[10px] text-themed-muted/60 text-center mt-8 max-w-xs mx-auto leading-relaxed">
              See our{" "}
              <Link href="/privacy" className="text-gold/70 underline">
                privacy policy
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <div className="max-w-sm mx-auto w-full">
              <button
                type="button"
                onClick={() => setStep("welcome")}
                className="flex items-center gap-1 text-themed-muted text-sm mb-5 active:text-themed touch-manipulation"
              >
                <ChevronLeft size={16} /> Back
              </button>

              <h2 className="text-2xl font-bold text-themed leading-tight">
                What brings you here?
              </h2>
              <p className="text-themed-muted text-sm mt-2 mb-6 leading-relaxed">
                We&apos;ll shape your home around it. You can change this any time in
                Settings.
              </p>

              <div className="space-y-2.5">
                {TUNE_OPTIONS.map((o) => {
                  const Icon = o.icon;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => finish(o.value)}
                      className="w-full flex items-center gap-3 card-bg rounded-2xl border sidebar-border p-3.5 text-left touch-manipulation active:scale-[0.99] transition-transform"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/15 text-gold flex items-center justify-center shrink-0">
                        <Icon size={19} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-themed leading-tight">{o.label}</p>
                        <p className="text-xs text-themed-muted mt-0.5 leading-snug">{o.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => finish()}
                className="w-full text-themed-muted py-4 mt-3 text-sm active:text-themed touch-manipulation"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
