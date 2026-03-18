"use client";

import { useState, useEffect } from "react";
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
  Clock,
  Moon,
  Flame,
  Scale,
  CalendarDays,
  BookMarked,
  Crown,
  WandSparkles,
  Repeat,
} from "lucide-react";
import ContentCard from "@/components/ContentCard";
import { AskHiqmahInline } from "@/components/AskHiqmah";

/* ─── Daily inspiration pool ─── */

const dailyInspirations = [
  {
    type: "Quran",
    arabic: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    english: "Indeed, with hardship comes ease.",
    reference: "Quran 94:6",
  },
  {
    type: "Quran",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ",
    english: "And whoever puts their trust in Allah, then He is sufficient for them.",
    reference: "Quran 65:3",
  },
  {
    type: "Quran",
    arabic: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ",
    english: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    reference: "Quran 2:152",
  },
  {
    type: "Quran",
    arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰٓ",
    english: "And your Lord is going to give you, and you will be satisfied.",
    reference: "Quran 93:5",
  },
  {
    type: "Hadith",
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    english: "Actions are judged by intentions, and every person will get what they intended.",
    reference: "Sahih al-Bukhari 1",
  },
  {
    type: "Hadith",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    english: "Whoever takes a path seeking knowledge, Allah will make easy for him a path to Paradise.",
    reference: "Sahih Muslim 2699",
  },
  {
    type: "Hadith",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    english: "The best of you are those who learn the Quran and teach it.",
    reference: "Sahih al-Bukhari 5027",
  },
];

/* ─── Navigation sections (matching sidebar) ─── */

type NavItem = {
  href: string;
  icon: typeof Users;
  title: string;
  titleAr: string;
  description: string;
};

const navSections: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Foundations",
    items: [
      {
        href: "/tawhid",
        icon: Shield,
        title: "Tawheed",
        titleAr: "التوحيد",
        description: "The Oneness of Allah — the foundation of Islamic monotheism.",
      },
      {
        href: "/pillars",
        icon: Landmark,
        title: "Pillars of Islam",
        titleAr: "الأركان",
        description: "Shahada, Salah, Zakat, Sawm, and Hajj.",
      },
      {
        href: "/articles-of-faith",
        icon: Star,
        title: "Articles of Faith",
        titleAr: "أركان الإيمان",
        description: "The six pillars of Iman — the core beliefs of a Muslim.",
      },
    ],
  },
  {
    heading: "Scripture",
    items: [
      {
        href: "/quran",
        icon: BookOpen,
        title: "The Quran",
        titleAr: "القرآن",
        description: "Read in Arabic with English translation and audio recitation.",
      },
      {
        href: "/hadith",
        icon: ScrollText,
        title: "Hadith",
        titleAr: "الحديث",
        description: "Authentic hadiths from the six major collections.",
      },
      {
        href: "/miracles",
        icon: WandSparkles,
        title: "Miracles",
        titleAr: "المعجزات",
        description: "Quranic miracles, scientific insights, and fulfilled prophecies.",
      },
    ],
  },
  {
    heading: "The Prophets",
    items: [
      {
        href: "/prophets",
        icon: Users,
        title: "Prophets",
        titleAr: "الأنبياء",
        description: "Stories from Adam to Isa — 25 prophets in chronological order.",
      },
      {
        href: "/prophet-muhammad",
        icon: Crown,
        title: "Prophet Muhammad ﷺ",
        titleAr: "النبي محمد",
        description: "His life, character, appearance, worship, and prophecies.",
      },
    ],
  },
  {
    heading: "Practice",
    items: [
      {
        href: "/salah",
        icon: Clock,
        title: "Salah",
        titleAr: "الصلاة",
        description: "Learn the five daily prayers with step-by-step guidance.",
      },
      {
        href: "/salah?tab=times",
        icon: Clock,
        title: "Prayer Times",
        titleAr: "أوقات الصلاة",
        description: "Today's prayer times based on your location.",
      },
      {
        href: "/duas",
        icon: HandHeart,
        title: "Duas",
        titleAr: "الدعاء",
        description: "Daily supplications with Arabic, transliteration, and meaning.",
      },
      {
        href: "/dhikr",
        icon: Repeat,
        title: "Dhikr",
        titleAr: "الذكر",
        description: "Tasbeeh counter for daily remembrance of Allah.",
      },
      {
        href: "/ramadan",
        icon: Moon,
        title: "Ramadan",
        titleAr: "رمضان",
        description: "Fasting, Tarawih, Laylatul Qadr, and the spirit of Ramadan.",
      },
    ],
  },
  {
    heading: "The Hereafter",
    items: [
      {
        href: "/barzakh",
        icon: Flame,
        title: "Barzakh",
        titleAr: "البرزخ",
        description: "The life of the grave — what happens between death and resurrection.",
      },
      {
        href: "/day-of-judgement",
        icon: Scale,
        title: "Day of Judgement",
        titleAr: "يوم القيامة",
        description: "The major and minor signs, the reckoning, and the scales.",
      },
      {
        href: "/jannah",
        icon: Sparkles,
        title: "Jannah",
        titleAr: "الجنة",
        description: "The eternal paradise — its descriptions, levels, and how to earn it.",
      },
    ],
  },
  {
    heading: "Reference",
    items: [
      {
        href: "/islamic-calendar",
        icon: CalendarDays,
        title: "Islamic Calendar",
        titleAr: "التقويم الهجري",
        description: "The Hijri months, their significance, and important dates.",
      },
      {
        href: "/resources",
        icon: BookMarked,
        title: "Resources",
        titleAr: "المصادر",
        description: "Recommended books, scholars, and learning resources.",
      },
    ],
  },
];

export default function HomePage() {
  const [inspiration, setInspiration] = useState(dailyInspirations[0]);

  useEffect(() => {
    // Pick a consistent daily inspiration based on date
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    setInspiration(dailyInspirations[dayOfYear % dailyInspirations.length]);
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* ─── Hero ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p className="text-gold/70 font-arabic text-lg mb-3">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-themed font-display tracking-wide mb-2">
          Hidden Hiqmah
        </h1>
        <p className="text-xl md:text-2xl text-themed-muted font-cursive">
          Hidden Wisdom
        </p>
        <div className="mt-5 mx-auto h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
        <p className="text-themed-muted mt-5 text-sm max-w-md mx-auto leading-relaxed">
          Explore Islam through authentic sources — the Quran, Sunnah, and scholarly tradition.
        </p>
      </motion.div>

      {/* ─── Daily Inspiration ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-12"
      >
        <div className="card-bg rounded-xl border sidebar-border p-6 md:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent pointer-events-none" />
          <div className="relative">
            <span className="text-xs text-gold/60 uppercase tracking-widest font-semibold">
              Daily Inspiration
            </span>
            <p className="text-2xl md:text-3xl font-arabic text-gold mt-4 leading-relaxed">
              {inspiration.arabic}
            </p>
            <p className="text-themed text-base md:text-lg mt-4 font-cursive">
              &ldquo;{inspiration.english}&rdquo;
            </p>
            <p className="text-themed-muted text-xs mt-3">
              — {inspiration.reference}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── Ask Hiqmah ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mb-12 max-w-2xl mx-auto"
      >
        <AskHiqmahInline onOpen={(q) => {
          const fn = (window as unknown as Record<string, unknown>).__askHiqmah;
          if (typeof fn === "function") (fn as (q: string) => void)(q);
        }} />
      </motion.div>

      {/* ─── Navigation Sections ─── */}
      {navSections.map((section, sectionIdx) => (
        <motion.div
          key={section.heading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 + sectionIdx * 0.08 }}
          className="mb-8"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-themed-muted/50 border-b sidebar-border pb-2 mb-4 px-1">
            {section.heading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <ContentCard key={item.href} delay={0.25 + sectionIdx * 0.08 + i * 0.05}>
                  <Link href={item.href} className="block group">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-[var(--color-gold)]/10 shrink-0">
                        <Icon size={20} className="text-gold" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-semibold text-themed group-hover:text-gold transition-colors text-sm">
                            {item.title}
                          </h3>
                          <span className="text-xs font-arabic text-gold/50">
                            {item.titleAr}
                          </span>
                        </div>
                        <p className="text-themed-muted text-xs leading-relaxed mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-accent text-xs font-medium group-hover:gap-2 transition-all pl-11">
                      Explore <ArrowRight size={12} />
                    </div>
                  </Link>
                </ContentCard>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* ─── Footer ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center py-8 border-t sidebar-border mt-4"
      >
        <p className="text-gold/50 font-arabic text-sm">
          ٱلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللَّٰهِ وَبَرَكَاتُهُ
        </p>
        <p className="text-themed-muted/40 text-xs mt-2">
          All content sourced from authentic Islamic references
        </p>
      </motion.div>
    </div>
  );
}
