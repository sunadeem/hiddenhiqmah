"use client";

import MobileTopBar from "./MobileTopBar";
import MobileTabBar from "./MobileTabBar";
import MobilePlayer from "./MobilePlayer";

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-[100dvh] bg-themed overflow-hidden">
      <MobileTopBar />
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-3 py-4">{children}</div>
      </main>
      <MobilePlayer />
      <MobileTabBar />
    </div>
  );
}
