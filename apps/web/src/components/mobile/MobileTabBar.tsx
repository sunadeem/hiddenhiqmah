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

const LINK_TABS = [
  { href: "/", label: "Home", icon: Home, matcher: (p: string) => p === "/" },
  {
    href: "/muslim-daily",
    label: "Daily",
    icon: ListChecks,
    matcher: (p: string) => p.startsWith("/muslim-daily"),
  },
  {
    href: "/quran",
    label: "Quran",
    icon: BookOpen,
    matcher: (p: string) => p.startsWith("/quran"),
  },
];

const TRAILING_TABS = [
  {
    href: "/more",
    label: "More",
    icon: Menu,
    matcher: (p: string) => p.startsWith("/more"),
  },
];

export default function MobileTabBar({ onAsk }: { onAsk: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="shrink-0 sidebar-bg border-t sidebar-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        {LINK_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.matcher(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => hapticSelection()}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 touch-manipulation transition-colors ${
                isActive ? "text-gold" : "text-themed-muted"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="text-[10px] font-medium tracking-wide">
                {tab.label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => {
            hapticLight();
            onAsk();
          }}
          aria-label="Ask Hiqmah"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 touch-manipulation text-themed-muted"
        >
          <MessageCircleQuestion size={22} strokeWidth={1.8} />
          <span className="text-[10px] font-medium tracking-wide">Ask</span>
        </button>
        {TRAILING_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.matcher(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => hapticSelection()}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 touch-manipulation transition-colors ${
                isActive ? "text-gold" : "text-themed-muted"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="text-[10px] font-medium tracking-wide">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
