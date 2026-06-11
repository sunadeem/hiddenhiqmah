"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import MobileTopBar from "./MobileTopBar";
import MobileTabBar from "./MobileTabBar";
import MobilePlayer from "./MobilePlayer";
import AskSheet from "./AskSheet";
import WelcomeSheet from "./WelcomeSheet";
import { isTabRoot } from "./routes";
import { hapticLight } from "@/lib/mobile/haptics";
import { applyNativeSetup } from "@/lib/mobile/setup";

const FULLSCREEN_ROUTES = new Set(["/signin", "/auth/callback"]);

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [askOpen, setAskOpen] = useState(false);
  const edgeSwipe = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    applyNativeSetup();
  }, []);

  // Close the Ask sheet whenever the route changes (e.g. tapping a citation
  // or link inside Ask navigates the app — the sheet should dismiss).
  useEffect(() => {
    setAskOpen(false);
  }, [pathname]);

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
      className="flex flex-col h-[100dvh] bg-themed overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <MobileTopBar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        {/* Smooth fade/slide-in on every route change (keyed on pathname). */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="px-3 py-4"
        >
          {children}
        </motion.div>
      </main>
      {!hideBottomChrome && (
        <>
          <MobilePlayer />
          <MobileTabBar onAsk={() => setAskOpen(true)} />
        </>
      )}
      <AskSheet open={askOpen} onClose={() => setAskOpen(false)} />
      <WelcomeSheet />
    </div>
  );
}
