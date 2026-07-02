"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import MobileTopBar from "./MobileTopBar";
import MobileTabBar from "./MobileTabBar";
import MobilePlayer from "./MobilePlayer";
import WelcomeSheet from "./WelcomeSheet";
import { isTabRoot } from "./routes";
import { hapticLight } from "@/lib/mobile/haptics";
import { applyNativeSetup } from "@/lib/mobile/setup";
import { registerNotificationTapHandler, scheduleAllNotifications } from "@/lib/mobile/notifications";
import { App as CapApp } from "@capacitor/app";
import { useLegacyImport } from "@/lib/daily/useLegacyImport";
import { useQuranAudio } from "@hidden-hiqmah/ui/context/QuranAudioContext";
import { useAdhanAudio } from "@hidden-hiqmah/ui/context/AdhanAudioContext";
import { useOnline } from "@/lib/mobile/useOnline";
import { WifiOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SignInScreen from "./screens/SignInScreen";
import { useScrollDirection } from "@/lib/mobile/useScrollDirection";

const FULLSCREEN_ROUTES = new Set(["/signin", "/auth/callback"]);

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const edgeSwipe = useRef<{ x: number; y: number } | null>(null);
  // Ask is now a full-screen chat page (not a slide-up sheet): it owns the whole
  // viewport — no padded scroll wrapper, no bottom tab bar/player.
  const isFullChat = pathname === "/ask";
  // When the floating player is up, the bottom content must clear it too (not just
  // the tab bar) — otherwise the last items scroll behind the player. The surah
  // reader is excluded: it manages its own bottom spacing (Mushaf list + Focus).
  const { playingVerse } = useQuranAudio();
  const { playing: adhanPlaying } = useAdhanAudio();
  const isSurahReader = /^\/quran\/[^/]+/.test(pathname);
  const playerVisible = (playingVerse !== null || adhanPlaying) && !isSurahReader;
  const online = useOnline();
  const { user, loading: authLoading } = useAuth();
  const mainRef = useRef<HTMLElement>(null);
  const scrollDir = useScrollDirection(mainRef);

  useEffect(() => {
    applyNativeSetup();
  }, []);

  // Route notification taps to their relevant screen.
  useEffect(() => {
    return registerNotificationTapHandler((url) => router.push(url));
  }, [router]);

  // Refresh the rolling adhan/notification window each time the app returns to
  // the foreground — otherwise the scheduled window silently drains over days of
  // use. No-op on web / without notification permission.
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    CapApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) void scheduleAllNotifications(false);
    }).then((handle) => {
      cleanup = () => void handle.remove();
    });
    return () => cleanup?.();
  }, []);

  // On sign-in, migrate signed-out local Daily data into Supabase (once).
  useLegacyImport();

  // Mobile = mandatory account: until signed in, the entire app IS the sign-in
  // screen (except the auth routes themselves). All hooks above always run, so
  // this conditional return is safe.
  if (!authLoading && !user && !FULLSCREEN_ROUTES.has(pathname)) {
    return (
      <div className="relative flex flex-col h-[100dvh] bg-themed overflow-hidden">
        <main
          className="flex-1 overflow-y-auto px-3"
          style={{ paddingTop: "max(env(safe-area-inset-top), 60px)" }}
        >
          <Suspense fallback={null}>
            <SignInScreen />
          </Suspense>
        </main>
      </div>
    );
  }

  // Ask keeps the bottom tab bar (it's a normal destination you can navigate
  // away from) — only its scroll layout is full-height (isFullChat below).
  const hideBottomChrome = FULLSCREEN_ROUTES.has(pathname);

  // Edge-swipe-back: a left-edge → right drag navigates back (iOS-style),
  // since the WKWebView SPA has no native back gesture. Only on non-tab-roots.
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    edgeSwipe.current =
      !isTabRoot(pathname) && t.clientX <= 24
        ? { x: t.clientX, y: t.clientY }
        : null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!edgeSwipe.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - edgeSwipe.current.x;
    const dy = Math.abs(t.clientY - edgeSwipe.current.y);
    edgeSwipe.current = null;
    if (dx > 70 && dy < 55) {
      hapticLight();
      router.back();
    }
  };

  return (
    <div
      className="relative flex flex-col h-[100dvh] bg-themed overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <MobileTopBar />
      {!online && (
        <div className="shrink-0 flex items-center justify-center gap-2 bg-[var(--color-gold)]/15 border-y border-[var(--color-gold)]/25 px-3 py-1.5 text-[12px] text-gold">
          <WifiOff size={13} />
          <span>Offline — reading works; audio &amp; prayer updates need a connection</span>
        </div>
      )}
      <main
        ref={mainRef}
        className={`flex-1 overflow-x-hidden overscroll-contain ${
          isFullChat ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        {isFullChat ? (
          // Ask owns the full viewport (header + scrollable messages + pinned input).
          <div className="h-full">{children}</div>
        ) : (
          /* Smooth fade-in on every route change (keyed on pathname).
             Opacity-only on purpose: any transform here becomes an ancestor
             transform that un-pins `position: sticky` descendants in the iOS
             WKWebView (sticky headers on Daily/Quran). Extra bottom padding
             clears the floating tab bar so the last content can scroll above it. */
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="px-3 pt-4"
            style={{
              paddingBottom: hideBottomChrome
                ? 16
                : `calc(env(safe-area-inset-bottom) + ${playerVisible ? 168 : 96}px)`,
            }}
          >
            {children}
          </motion.div>
        )}
      </main>
      {!hideBottomChrome && (
        // Floating bottom chrome: overlaid on top of the scrolling content so
        // the page shows through around the pill (truly floating, no shelf).
        // pointer-events-none lets taps fall through the transparent gaps;
        // the player + tab bar re-enable pointer events on themselves.
        <div className="mobile-bottom-chrome pointer-events-none absolute inset-x-0 bottom-0 z-30">
          <div className="pointer-events-auto">
            <MobilePlayer />
          </div>
          <div className="pointer-events-auto">
            <MobileTabBar hidden={scrollDir === "down"} />
          </div>
        </div>
      )}
      <WelcomeSheet />
    </div>
  );
}
