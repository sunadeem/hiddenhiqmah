"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  ListChecks,
  MessageCircleQuestion,
  Menu,
} from "lucide-react";
import { hapticSelection, hapticLight } from "@/lib/mobile/haptics";

type Tab = {
  label: string;
  icon: typeof Home;
  href?: string;
  matcher?: (p: string) => boolean;
  ask?: boolean;
};

const TABS: Tab[] = [
  { href: "/", label: "Home", icon: Home, matcher: (p) => p === "/" },
  {
    href: "/muslim-daily",
    label: "Daily",
    icon: ListChecks,
    matcher: (p) => p.startsWith("/muslim-daily"),
  },
  { label: "Ask", icon: MessageCircleQuestion, ask: true },
  {
    href: "/quran",
    label: "Quran",
    icon: BookOpen,
    matcher: (p) => p.startsWith("/quran"),
  },
  {
    href: "/more",
    label: "More",
    icon: Menu,
    matcher: (p) => p.startsWith("/more"),
  },
];

export default function MobileTabBar({ onAsk }: { onAsk: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      data-mobile-tabbar
      className="shrink-0 px-3 pt-1"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
    >
      {/* Floating rounded pill bar */}
      <div className="flex items-stretch gap-0.5 rounded-full bg-[var(--color-sidebar)]/90 backdrop-blur-xl border sidebar-border shadow-xl shadow-black/30 px-2 py-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.matcher ? tab.matcher(pathname) : false;

          const inner = (
            <span
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full transition-colors ${
                isActive
                  ? "text-gold bg-[var(--color-gold)]/10"
                  : "text-themed-muted"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.9} />
              <span className="text-[9px] font-medium tracking-wide">
                {tab.label}
              </span>
            </span>
          );

          if (tab.ask) {
            return (
              <button
                key="ask"
                type="button"
                onClick={() => {
                  hapticLight();
                  onAsk();
                }}
                aria-label="Ask Hiqmah"
                className="flex-1 touch-manipulation"
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href!}
              onClick={() => hapticSelection()}
              className="flex-1 touch-manipulation"
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
