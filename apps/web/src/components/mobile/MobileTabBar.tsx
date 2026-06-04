"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ScrollText, HandHeart, Sparkles } from "lucide-react";
import { getActiveTab } from "./routes";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quran", label: "Quran", icon: BookOpen },
  { href: "/hadith", label: "Hadith", icon: ScrollText },
  { href: "/salah", label: "Salah", icon: HandHeart },
  { href: "/muslim-daily", label: "Daily", icon: Sparkles },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  return (
    <nav
      className="shrink-0 sidebar-bg border-t sidebar-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
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
