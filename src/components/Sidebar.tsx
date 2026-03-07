"use client";

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
  BookMarked,
  Flame,
  Scale,
  WandSparkles,
  History,
  Crown,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { ThemeName, themes } from "@/lib/themes";

const navItems = [
  { href: "/prophets", label: "Prophets", labelAr: "الأنبياء", icon: Users },
  { href: "/prophet-muhammad", label: "Prophet Muhammad", labelAr: "النبي محمد ﷺ", icon: Crown },
  { href: "/quran", label: "Quran", labelAr: "القرآن", icon: BookOpen },
  { href: "/hadith", label: "Hadith", labelAr: "الحديث", icon: ScrollText },
  { href: "/miracles", label: "Miracles", labelAr: "المعجزات", icon: WandSparkles },
  { href: "/duas", label: "Duas", labelAr: "الدعاء", icon: HandHeart },
  { href: "/tawhid", label: "Tawheed", labelAr: "التوحيد", icon: Shield },
  { href: "/articles-of-faith", label: "Articles of Faith", labelAr: "أركان الإيمان", icon: Star },
  { href: "/pillars", label: "Pillars", labelAr: "الأركان", icon: Landmark },
  { href: "/salah", label: "Salah", labelAr: "الصلاة", icon: Clock },
  { href: "/ramadan", label: "Ramadan", labelAr: "رمضان", icon: Moon },
  { href: "/jannah", label: "Jannah", labelAr: "الجنة", icon: Sparkles },
  { href: "/the-grave", label: "The Grave", labelAr: "القبر", icon: Flame },
  { href: "/day-of-judgement", label: "Day of Judgement", labelAr: "يوم القيامة", icon: Scale },
  { href: "/history", label: "History", labelAr: "التاريخ", icon: History },
  { href: "/islamic-calendar", label: "Islamic Calendar", labelAr: "التقويم الهجري", icon: CalendarDays },
  { href: "/resources", label: "Resources", labelAr: "المصادر", icon: BookMarked },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { themeName, isDark, setThemeName, toggleDarkMode } = useTheme();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-40 sidebar-bg border-r sidebar-border">
        <SidebarContent
          pathname={pathname}
          themeName={themeName}
          isDark={isDark}
          setThemeName={setThemeName}
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
                themeName={themeName}
                isDark={isDark}
                setThemeName={setThemeName}
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
  themeName,
  isDark,
  setThemeName,
  toggleDarkMode,
  onNavigate,
}: {
  pathname: string;
  themeName: ThemeName;
  isDark: boolean;
  setThemeName: (name: ThemeName) => void;
  toggleDarkMode: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-4 py-6">
      {/* Brand header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gold tracking-wide">
          Hidden Hiqmah
        </h1>
        <p className="text-xs text-themed-muted mt-1">Hidden Wisdom</p>
        <p className="text-sm text-gold/70 font-arabic mt-2">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
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
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative ${
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
                <Icon size={20} />
                <span className="flex-1 font-medium">{item.label}</span>
                <span className="text-xs font-arabic opacity-60">
                  {item.labelAr}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Theme switcher */}
      <div className="border-t sidebar-border pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-themed-muted uppercase tracking-wider">Theme</span>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-white/10 text-themed-muted hover:text-gold transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <div className="flex gap-2">
          {(Object.keys(themes) as ThemeName[]).map((key) => (
            <button
              key={key}
              onClick={() => setThemeName(key)}
              className={`flex-1 text-xs py-2 px-2 rounded-lg transition-all ${
                themeName === key
                  ? "bg-gold/20 text-gold border border-gold/40"
                  : "text-themed-muted hover:text-themed border sidebar-border"
              }`}
            >
              {themes[key].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
