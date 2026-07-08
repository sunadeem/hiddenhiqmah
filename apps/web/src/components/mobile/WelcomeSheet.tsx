"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Repeat,
  GraduationCap,
  Users,
  Compass,
  BookOpen,
  Sparkles,
  CalendarCheck,
  ChevronLeft,
} from "lucide-react";
import { setHomePrefs, type TunedFor } from "@hidden-hiqmah/ui/lib/storage";
import { useAuth } from "@/context/AuthContext";

// Onboarding is complete once the walkthrough's tune step finishes. Kept
// separate from "hiqmah-seen-welcome" (which SignInScreen sets on every auth to
// unblock location prompts) so the walkthrough shows once, after sign-up.
const ONBOARDED_KEY = "hiqmah-onboarded";

const TUNE_OPTIONS: { value: TunedFor; icon: typeof Clock; label: string; desc: string }[] = [
  { value: "prayer", icon: Clock, label: "Building my prayers", desc: "Adhkār, du'ās & prayer prep lead your day." },
  { value: "hifz", icon: Repeat, label: "Memorising Qur'an", desc: "Hifz review & reading come first." },
  { value: "new-muslim", icon: GraduationCap, label: "New to Islam", desc: "Start with the essentials — pillars & how to pray." },
  { value: "family", icon: Users, label: "Teaching my family", desc: "Family time & kids' learning up top." },
  { value: "exploring", icon: Compass, label: "Just exploring", desc: "A balanced mix to discover." },
];

type Slide =
  | { kind: "welcome" }
  | { kind: "feature"; icon: typeof BookOpen; title: string; body: string };

const SLIDES: Slide[] = [
  { kind: "welcome" },
  {
    kind: "feature",
    icon: CalendarCheck,
    title: "Your daily path",
    body: "Prayer times, morning and evening adhkār, Qur'an reading and dhikr — woven into one gentle daily rhythm, with streaks that forgive an off day.",
  },
  {
    kind: "feature",
    icon: BookOpen,
    title: "The Qur'an, deeply",
    body: "Read every ayah with translation and trusted tafsir, study it word-by-word, and listen to beautiful recitation — on the page or on the go.",
  },
  {
    kind: "feature",
    icon: GraduationCap,
    title: "Learn with confidence",
    body: "Tawḥīd, the five pillars, the articles of faith, the Prophets, and the life of the Prophet ﷺ — explained clearly, always from authentic sources.",
  },
  {
    kind: "feature",
    icon: Sparkles,
    title: "Ask Hiqmah",
    body: "Ask anything about Islam and get a thoughtful, grounded answer — drawn from the Qur'an and authentic Sunnah, with its sources, never guesswork.",
  },
  {
    kind: "feature",
    icon: Users,
    title: "Grow together",
    body: "Memorize with Hifz, keep each other going with Circles, and nurture your household with Family profiles — the journey is better shared.",
  },
];

export default function WelcomeSheet() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [hidden, setHidden] = useState(true);
  const [phase, setPhase] = useState<"slides" | "tune">("slides");
  const [idx, setIdx] = useState(0);

  // Re-check on route / auth change: the walkthrough runs once per device, right
  // after the user lands on Home signed-in but not yet onboarded.
  useEffect(() => {
    try {
      setHidden(!!localStorage.getItem(ONBOARDED_KEY));
    } catch {
      setHidden(true);
    }
  }, [pathname, user?.id]);

  if (hidden || pathname !== "/" || !user) return null;

  const firstName = (
    (user.user_metadata as { first_name?: string } | undefined)?.first_name || ""
  ).trim();

  const finish = (tunedFor?: TunedFor) => {
    if (tunedFor) {
      try {
        setHomePrefs({ tunedFor });
      } catch {
        // ignore
      }
    }
    try {
      localStorage.setItem(ONBOARDED_KEY, "1");
    } catch {
      // ignore
    }
    // NextPrayerCard waits for this before asking for location.
    try {
      window.dispatchEvent(new CustomEvent("hiqmah:welcome-dismissed"));
    } catch {
      // ignore — non-browser env
    }
    setHidden(true);
  };

  const next = () =>
    idx < SLIDES.length - 1 ? setIdx(idx + 1) : setPhase("tune");

  const slide = SLIDES[idx];

  return (
    <div className="fixed inset-0 z-[80] bg-themed flex flex-col">
      <div
        className="flex-1 overflow-y-auto px-6 flex flex-col"
        style={{
          paddingTop: "max(calc(env(safe-area-inset-top) + 32px), 60px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
        }}
      >
        {phase === "slides" ? (
          <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
            {/* Back / Skip */}
            <div className="flex items-center justify-between h-6 mb-2">
              {idx > 0 ? (
                <button
                  type="button"
                  onClick={() => setIdx(idx - 1)}
                  className="flex items-center gap-1 text-themed-muted text-sm active:text-themed touch-manipulation"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setPhase("tune")}
                className="text-themed-muted text-sm active:text-themed touch-manipulation"
              >
                Skip
              </button>
            </div>

            {/* Slide body */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              {slide.kind === "welcome" ? (
                <>
                  <p className="text-gold/70 font-arabic text-2xl mb-3 leading-relaxed">
                    بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                  <h1 className="text-4xl font-bold text-themed font-display tracking-wide mb-2 mt-3">
                    Hidden Hiqmah
                  </h1>
                  <p className="text-sm text-themed-muted font-cursive italic">
                    Hidden Wisdom
                  </p>
                  <div className="mt-4 mb-6 mx-auto h-[2px] w-20 rounded-full bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
                  <h2 className="text-xl font-semibold text-themed mb-2">
                    Assalāmu ʿalaykum{firstName ? `, ${firstName}` : ""}
                  </h2>
                  <p className="text-themed-muted text-sm leading-relaxed max-w-xs mx-auto">
                    Welcome — your companion for a consistent, meaningful practice.
                    Here&apos;s a quick look at what&apos;s inside.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-3xl bg-[var(--color-gold)]/15 text-gold flex items-center justify-center mb-6">
                    <slide.icon size={36} />
                  </div>
                  <h2 className="text-2xl font-bold text-themed mb-3">
                    {slide.title}
                  </h2>
                  <p className="text-themed-muted text-sm leading-relaxed max-w-xs mx-auto">
                    {slide.body}
                  </p>
                </>
              )}
            </div>

            {/* Dots + Continue */}
            <div className="max-w-sm mx-auto w-full">
              <div className="flex items-center justify-center gap-2 mb-5">
                {SLIDES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === idx ? "w-5 bg-[var(--color-gold)]" : "w-1.5 bg-[var(--overlay-strong)]"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={next}
                className="block w-full text-center bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 rounded-xl py-3.5 font-semibold active:bg-[var(--color-gold)]/30 touch-manipulation"
              >
                {idx < SLIDES.length - 1 ? "Continue" : "Get started"}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-sm mx-auto w-full my-auto">
            <button
              type="button"
              onClick={() => setPhase("slides")}
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

            <p className="text-[10px] text-themed-muted/60 text-center mt-4 max-w-xs mx-auto leading-relaxed">
              See our{" "}
              <Link href="/privacy" className="text-gold/70 underline">
                privacy policy
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
