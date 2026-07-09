"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  Brain,
  MessageCircleQuestion,
  Menu,
} from "lucide-react";
import { hapticSelection } from "@/lib/mobile/haptics";
import { useCircleUnread } from "@/lib/mobile/useCircleUnread";

type Tab = {
  label: string;
  icon: typeof Home;
  href?: string;
  matcher?: (p: string) => boolean;
};

const TABS: Tab[] = [
  { href: "/", label: "Home", icon: Home, matcher: (p) => p === "/" },
  {
    href: "/hifz",
    label: "Hifz",
    icon: Brain,
    matcher: (p) => p.startsWith("/hifz"),
  },
  {
    href: "/ask",
    label: "Ask",
    icon: MessageCircleQuestion,
    matcher: (p) => p.startsWith("/ask"),
  },
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

export default function MobileTabBar({ hidden = false }: { hidden?: boolean }) {
  const pathname = usePathname();
  // Circles lives under More now — surface its unread nudges as a badge there.
  const moreUnread = useCircleUnread();

  return (
    <motion.nav
      data-mobile-tabbar
      className="shrink-0 px-3 pt-1"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
      animate={{ y: hidden ? 120 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Floating rounded pill bar */}
      <div className="flex items-stretch gap-0.5 rounded-full bg-[var(--color-sidebar)]/90 backdrop-blur-xl border sidebar-border shadow-xl shadow-black/30 px-2 py-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.matcher ? tab.matcher(pathname) : false;
          const badge = tab.href === "/more" && moreUnread > 0;

          const inner = (
            <span
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full transition-colors ${
                isActive
                  ? "text-gold bg-[var(--color-gold)]/10"
                  : "text-themed-muted"
              }`}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.4 : 1.9} />
                {badge && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-[var(--color-gold)] text-[9px] font-bold leading-none flex items-center justify-center"
                    style={{ color: "#181305" }}
                  >
                    {moreUnread > 9 ? "9+" : moreUnread}
                  </span>
                )}
              </span>
              <span className="text-[9px] font-medium tracking-wide">
                {tab.label}
              </span>
            </span>
          );

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
    </motion.nav>
  );
}
