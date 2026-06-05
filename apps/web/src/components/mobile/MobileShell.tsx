"use client";

import { useEffect, useState } from "react";
import MobileTopBar from "./MobileTopBar";
import MobileTabBar from "./MobileTabBar";
import MobilePlayer from "./MobilePlayer";
import AskSheet from "./AskSheet";
import { applyNativeSetup } from "@/lib/mobile/setup";

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    applyNativeSetup();
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-themed overflow-hidden">
      <MobileTopBar />
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-3 py-4">{children}</div>
      </main>
      <MobilePlayer />
      <MobileTabBar onAsk={() => setAskOpen(true)} />
      <AskSheet open={askOpen} onClose={() => setAskOpen(false)} />
    </div>
  );
}
