"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  BookOpen,
  ScrollText,
  Sparkles,
  HandHeart,
  Landmark,
  Shield,
  Star,
  X,
  Users,
  Clock,
  CalendarDays,
  Bookmark,
  BookMarked,
  Flame,
  Scale,
  WandSparkles,
  Crown,
  ChevronDown,
  Home,
  HelpCircle,
  Languages,
  GitBranch,
  Repeat,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type NavItem = { href: string; label: string; labelAr: string; icon: typeof Users };
type NavSection = { title: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    title: "Foundations",
    items: [
      { href: "/tawhid", label: "Tawheed", labelAr: "التوحيد", icon: Shield },
      { href: "/articles-of-faith", label: "Articles of Faith", labelAr: "أركان الإيمان", icon: Star },
      { href: "/pillars", label: "Pillars", labelAr: "الأركان", icon: Landmark },
    ],
  },
  {
    title: "Scripture",
    items: [
      { href: "/quran", label: "Quran", labelAr: "القرآن", icon: BookOpen },
      { href: "/hadith", label: "Hadith", labelAr: "الحديث", icon: ScrollText },
      { href: "/miracles", label: "Miracles", labelAr: "المعجزات", icon: WandSparkles },
    ],
  },
  {
    title: "The Prophets",
    items: [
      { href: "/prophets", label: "Prophets", labelAr: "الأنبياء", icon: Users },
      { href: "/prophet-muhammad", label: "Prophet Muhammad", labelAr: "النبي محمد ﷺ", icon: Crown },
    ],
  },
  {
    title: "Practice",
    items: [
      { href: "/salah", label: "Salah", labelAr: "الصلاة", icon: Clock },
      { href: "/duas", label: "Duas", labelAr: "الدعاء", icon: HandHeart },
      { href: "/dhikr", label: "Dhikr", labelAr: "الذكر", icon: Repeat },
      { href: "/ramadan", label: "Ramadan", labelAr: "رمضان", icon: Moon },
    ],
  },
  {
    title: "The Hereafter",
    items: [
      { href: "/barzakh", label: "Barzakh", labelAr: "البرزخ", icon: Flame },
      { href: "/day-of-judgement", label: "Day of Judgement", labelAr: "يوم القيامة", icon: Scale },
      { href: "/jannah", label: "Jannah", labelAr: "الجنة", icon: Sparkles },
    ],
  },
  {
    title: "Explore",
    items: [
      { href: "/why-islam", label: "Why Islam?", labelAr: "لماذا الإسلام؟", icon: HelpCircle },
      { href: "/learn-arabic", label: "Learn Arabic", labelAr: "تعلم العربية", icon: Languages },
      { href: "/sects", label: "Islamic Sects", labelAr: "الفرق الإسلامية", icon: GitBranch },
      { href: "/islamic-calendar", label: "Islamic Calendar", labelAr: "التقويم الهجري", icon: CalendarDays },
      { href: "/resources", label: "Resources", labelAr: "المصادر", icon: BookMarked },
    ],
  },
  {
    title: "My Path in Islam",
    items: [
      { href: "/bookmarks", label: "Bookmarks", labelAr: "المحفوظات", icon: Bookmark },
    ],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-40 sidebar-bg border-r sidebar-border">
        <SidebarContent
          pathname={pathname}
          isDark={isDark}
          toggleDarkMode={toggleDarkMode}
        />
      </aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden sidebar-bg border-r sidebar-border"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-themed"
              >
                <X size={20} />
              </button>
              <SidebarContent
                pathname={pathname}
                isDark={isDark}
                toggleDarkMode={toggleDarkMode}
                onNavigate={onClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  pathname,
  isDark,
  toggleDarkMode,
  onNavigate,
}: {
  pathname: string;
  isDark: boolean;
  toggleDarkMode: () => void;
  onNavigate?: () => void;
}) {
  // Auto-expand sections that contain the active page
  const activeSections = navSections
    .filter((s) => s.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/")))
    .map((s) => s.title);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="flex flex-col h-full px-4 py-6">
      {/* Brand header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gold tracking-wide font-display">
          Hidden Hiqmah
        </h1>
        <p className="text-base text-themed-muted mt-1 font-cursive">Hidden Wisdom</p>
        <p className="text-sm text-gold/70 font-arabic mt-2">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto min-h-0 space-y-2">
        {/* Home — standalone */}
        <Link href="/" onClick={onNavigate} className="relative block">
          <motion.div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative ${
              pathname === "/"
                ? "text-gold"
                : "text-themed-muted hover:text-themed"
            }`}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {pathname === "/" && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gold"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <Home size={18} />
            <span className="flex-1 font-medium text-sm">Home</span>
            <span className="text-xs font-arabic opacity-60">الرئيسية</span>
          </motion.div>
        </Link>

        {navSections.map((section) => {
          const isCollapsed = collapsed[section.title];
          const hasActive = section.items.some(
            (item) => pathname === item.href || pathname.startsWith(item.href + "/")
          );

          return (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center w-full px-3 py-1.5 group cursor-pointer"
              >
                <span
                  className={`flex-1 text-left text-[10px] font-semibold uppercase tracking-widest border-b pb-1 transition-colors ${
                    hasActive
                      ? "text-gold/70 border-gold/30"
                      : "text-themed-muted/50 border-themed-muted/20 group-hover:text-themed-muted group-hover:border-themed-muted/40"
                  }`}
                >
                  {section.title}
                </span>
                <motion.div
                  animate={{ rotate: isCollapsed ? -90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`ml-2 ${hasActive ? "text-gold/50" : "text-themed-muted/30"}`}
                >
                  <ChevronDown size={12} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5 mt-1">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className="relative block"
                          >
                            <motion.div
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative ${
                                isActive
                                  ? "text-gold"
                                  : "text-themed-muted hover:text-themed"
                              }`}
                              whileHover={{ x: 4 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="sidebar-active"
                                  className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gold"
                                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                              )}
                              <Icon size={18} />
                              <span className="flex-1 font-medium text-sm">{item.label}</span>
                              <span className="text-xs font-arabic opacity-60">
                                {item.labelAr}
                              </span>
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t sidebar-border pt-4 space-y-1">
        <button
          onClick={() => {
            const fn = (window as unknown as Record<string, unknown>).__openHiqmah;
            if (typeof fn === "function") (fn as () => void)();
            if (onNavigate) onNavigate();
          }}
          className="group flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-[#2563eb]/10 border border-[#2563eb]/25 hover:bg-[#2563eb]/20 hover:border-[#2563eb]/40 transition-all relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2563eb]/10 to-transparent animate-shimmer" />
          <Sparkles size={16} className="text-[#3b82f6] relative z-10" />
          <span className="text-xs font-semibold text-[#3b82f6] relative z-10">Ask Hiqmah</span>
          <span className="ml-auto text-[10px] text-[#3b82f6]/50 relative z-10 font-medium">AI</span>
        </button>
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/10 text-themed-muted hover:text-gold transition-colors"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span className="text-xs font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </div>
  );
}
