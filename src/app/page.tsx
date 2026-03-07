"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  ScrollText,
  Sparkles,
  HandHeart,
  Landmark,
  Users,
  Shield,
  Star,
  ArrowRight,
} from "lucide-react";
import ContentCard from "@/components/ContentCard";

const sections = [
  {
    href: "/prophets",
    icon: Users,
    title: "The Prophets",
    titleAr: "الأنبياء",
    description: "Journey through the stories of all prophets, from Adam to Muhammad ﷺ, in chronological order.",
    count: "25+ Prophets",
  },
  {
    href: "/quran",
    icon: BookOpen,
    title: "The Quran",
    titleAr: "القرآن",
    description: "Read the Holy Quran in Arabic with English translation, transliteration, and audio recitation.",
    count: "114 Surahs",
  },
  {
    href: "/hadith",
    icon: ScrollText,
    title: "Hadith",
    titleAr: "الحديث",
    description: "Explore authentic hadiths organized by topic with references from major collections.",
    count: "By Topic",
  },
  {
    href: "/miracles",
    icon: Sparkles,
    title: "Miracles & Prophecies",
    titleAr: "المعجزات",
    description: "Discover Quranic miracles, scientific insights, and fulfilled prophecies with evidence.",
    count: "Referenced",
  },
  {
    href: "/duas",
    icon: HandHeart,
    title: "Duas",
    titleAr: "الدعاء",
    description: "A collection of daily duas with Arabic text, transliteration, and meaning.",
    count: "Categorized",
  },
  {
    href: "/tawhid",
    icon: Shield,
    title: "Tawheed",
    titleAr: "التوحيد",
    description: "Understand the Oneness of Allah — the foundation of Islamic monotheism in all its categories.",
    count: "3 Categories",
  },
  {
    href: "/articles-of-faith",
    icon: Star,
    title: "Articles of Faith",
    titleAr: "أركان الإيمان",
    description: "The six pillars of Iman — the core beliefs that define what it means to be a Muslim.",
    count: "6 Articles",
  },
  {
    href: "/pillars",
    icon: Landmark,
    title: "Pillars of Islam",
    titleAr: "الأركان",
    description: "Learn about the five pillars — Shahada, Salah, Zakat, Sawm, and Hajj.",
    count: "5 Pillars",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-themed mb-1">
          Welcome
        </h1>
        <p className="text-lg text-themed-muted mb-1">
          Explore Islam through authentic sources
        </p>
        <p className="text-2xl font-arabic text-gold">
          ٱلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللَّٰهِ وَبَرَكَاتُهُ
        </p>
        <div className="mt-4 h-[2px] w-20 rounded-full bg-gradient-to-r from-[var(--color-gold)] to-transparent" />
      </motion.div>

      {/* Section grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <ContentCard key={section.href} delay={i * 0.08}>
              <Link href={section.href} className="block group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-[var(--color-gold)]/15">
                    <Icon size={24} className="text-gold" />
                  </div>
                  <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                    {section.count}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-themed group-hover:text-gold transition-colors">
                    {section.title}
                  </h2>
                  <span className="text-sm font-arabic text-gold opacity-70">
                    {section.titleAr}
                  </span>
                </div>
                <p className="text-themed-muted text-sm leading-relaxed mb-4">
                  {section.description}
                </p>
                <div className="flex items-center gap-1 text-accent text-sm font-medium group-hover:gap-2 transition-all">
                  Explore <ArrowRight size={14} />
                </div>
              </Link>
            </ContentCard>
          );
        })}
      </div>
    </div>
  );
}
