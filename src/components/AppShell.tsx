"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import AskHiqmahFloat from "./AskHiqmah";
import MiniPlayer from "./MiniPlayer";

const BARE_ROUTES = ["/ask"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Render without shell chrome for popup routes
  if (BARE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
      <div className="min-h-screen bg-themed">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Mobile top bar */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 sidebar-bg border-b sidebar-border safe-area-top">
          <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-themed"
            >
              <Menu size={22} />
            </button>
            <Link href="/" className="text-gold font-semibold text-lg tracking-wide">Hidden Hiqmah</Link>
            <div className="w-10" />
          </div>
        </header>

        {/* Main content */}
        <main className="lg:ml-64 pt-14 lg:pt-0 pb-0 min-h-screen">
          <div className="p-3 sm:p-5 md:p-6 lg:p-8">
            {children}
          </div>
        </main>

        <MiniPlayer />
        <AskHiqmahFloat />
      </div>
  );
}
