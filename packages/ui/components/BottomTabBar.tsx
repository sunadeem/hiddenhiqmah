"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  ScrollText,
  WandSparkles,
  HandHeart,
  Users,
} from "lucide-react";

const tabs = [
  { href: "/prophets", label: "Prophets", icon: Users },
  { href: "/quran", label: "Quran", icon: BookOpen },
  { href: "/hadith", label: "Hadith", icon: ScrollText },
  { href: "/miracles", label: "Miracles", icon: WandSparkles },
  { href: "/duas", label: "Duas", icon: HandHeart },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden sidebar-bg border-t sidebar-border">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 py-1 px-3 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-tab-active"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-gold"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <Icon
                size={20}
                className={isActive ? "text-gold" : "text-themed-muted"}
              />
              <span
                className={`text-[10px] ${
                  isActive ? "text-gold font-medium" : "text-themed-muted"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
