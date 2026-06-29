"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import { AskHiqmahInline } from "@hidden-hiqmah/ui/components/AskHiqmah";
import { dailyInspirations, navSections } from "@/data/home-content";


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
      {/* Hero */}
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
      {navSections
        .map((s) => ({ ...s, items: s.items.filter((i) => !i.mobileOnly) }))
        .filter((s) => s.items.length > 0)
        .map((section, sectionIdx) => (
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
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <Link href="/credits" className="text-themed-muted hover:text-gold transition-colors">
            Credits &amp; Sources
          </Link>
          <Link href="/privacy" className="text-themed-muted hover:text-gold transition-colors">
            Privacy
          </Link>
          <a
            href="mailto:Subhan.Nadeem@HiddenHiqmah.com"
            className="text-themed-muted hover:text-gold transition-colors"
          >
            Contact
          </a>
        </div>
        <p className="text-themed-muted/40 text-xs mt-2">
          All content sourced from authentic Islamic references
        </p>
      </motion.div>
    </div>
  );
}

