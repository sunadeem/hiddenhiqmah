"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MobileTopBar from "./MobileTopBar";
import MobileTabBar from "./MobileTabBar";
import MobilePlayer from "./MobilePlayer";
import AskSheet from "./AskSheet";
import WelcomeSheet from "./WelcomeSheet";
import { applyNativeSetup } from "@/lib/mobile/setup";

const FULLSCREEN_ROUTES = new Set(["/signin", "/auth/callback"]);

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    applyNativeSetup();
  }, []);

  const hideBottomChrome = FULLSCREEN_ROUTES.has(pathname);

  return (
    <div className="flex flex-col h-[100dvh] bg-themed overflow-hidden">
      <MobileTopBar />
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-3 py-4">{children}</div>
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
