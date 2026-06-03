"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Quote } from "lucide-react";
import { getProphetBySlug } from "@/data/prophets";
import { getStoryBySlug } from "@/data/prophet-stories";
import ContentCard from "@/components/ContentCard";
import Link from "next/link";
import { prophets } from "@/data/prophets";
import HadithRefText from "@/components/HadithRefText";

export default function ProphetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const prophet = getProphetBySlug(slug);
  const story = getStoryBySlug(slug);

  if (!prophet) {
    notFound();
  }

  // Find prev/next prophets
  const currentIndex = prophets.findIndex((p) => p.slug === slug);
  const prevProphet = currentIndex > 0 ? prophets[currentIndex - 1] : null;
  const nextProphet =
    currentIndex < prophets.length - 1 ? prophets[currentIndex + 1] : null;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-baseline gap-4 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-themed">
            Prophet {prophet.name}
          </h1>
          <span className="text-2xl md:text-3xl font-arabic text-gold">
            {prophet.nameAr}
          </span>
        </div>
        {prophet.name !== "Muhammad" && (
          <p className="text-sm font-arabic text-gold/70 mb-2">عليه السلام</p>
        )}
        {prophet.name === "Muhammad" && (
          <p className="text-sm font-arabic text-gold/70 mb-2">
            صلى الله عليه وسلم
          </p>
        )}
        <p className="text-themed-muted">{prophet.summary}</p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
            {prophet.era}
          </span>
          {prophet.mentions > 0 && (
            <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
              Mentioned {prophet.mentions}x in Quran
            </span>
          )}
          {prophet.source !== "quran" && (
            <span className="text-xs text-gold border border-gold/30 rounded-full px-3 py-1">
              {prophet.source === "hadith"
                ? "Referenced in Hadith"
                : "Scholarly Sources"}
            </span>
          )}
          {prophet.surahs && (
            <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
              {prophet.surahs}
            </span>
          )}
        </div>
        {prophet.sourceNote && (
          <p className="text-xs text-themed-muted mt-3 italic">
            {prophet.sourceNote}
          </p>
        )}
        <div className="mt-4 h-[2px] w-20 rounded-full bg-gradient-to-r from-[var(--color-gold)] to-transparent" />
      </motion.div>

      {/* Story sections */}
      {story ? (
        <div className="space-y-6">
          {story.sections.map((section, i) => (
            <ContentCard key={i} delay={i * 0.08}>
              <h2 className="text-xl font-semibold text-themed mb-3">
                {section.title}
              </h2>
              <p className="text-themed-muted text-sm leading-relaxed mb-4">
                {section.content}
              </p>

              {/* Quranic verses */}
              {section.verses && section.verses.length > 0 && (
                <div className="space-y-3">
                  {section.verses.map((verse, vi) => (
                    <div
                      key={vi}
                      className="rounded-lg p-4"
                      style={{ backgroundColor: "var(--color-bg)" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={14} className="text-gold" />
                        <span className="text-xs text-gold font-medium">
                          <HadithRefText text={verse.reference} />
                        </span>
                      </div>
                      <p className="text-xl md:text-2xl font-arabic text-gold text-right leading-loose mb-3">
                        {verse.arabic}
                      </p>
                      <p className="text-themed text-sm italic">
                        &ldquo;{verse.translation}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Hadith references */}
              {section.hadith && section.hadith.length > 0 && (
                <div className="space-y-3 mt-3">
                  {section.hadith.map((h, hi) => (
                    <div
                      key={hi}
                      className="rounded-lg p-4 border sidebar-border"
                    >
                      <div className="flex items-start gap-2">
                        <Quote
                          size={14}
                          className="text-accent mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-themed text-sm italic mb-2">
                            {h.text}
                          </p>
                          <p className="text-xs text-themed-muted">
                            Source:{" "}
                            <strong className="text-themed"><HadithRefText text={h.source} /></strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ContentCard>
          ))}

          {/* Lessons */}
          {story.lessons.length > 0 && (
            <ContentCard delay={story.sections.length * 0.08}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                Key Lessons
              </h2>
              <ul className="space-y-2">
                {story.lessons.map((lesson, li) => (
                  <li
                    key={li}
                    className="flex items-start gap-2 text-sm text-themed"
                  >
                    <span className="text-gold mt-0.5">&#9670;</span>
                    {lesson}
                  </li>
                ))}
              </ul>
            </ContentCard>
          )}

          {/* References */}
          {story.references.length > 0 && (
            <ContentCard delay={(story.sections.length + 1) * 0.08}>
              <h2 className="text-lg font-semibold text-themed mb-3">
                References & Sources
              </h2>
              <ul className="space-y-1">
                {story.references.map((ref, ri) => (
                  <li key={ri} className="text-xs text-themed-muted">
                    <HadithRefText text={ref} />
                  </li>
                ))}
              </ul>
            </ContentCard>
          )}
        </div>
      ) : (
        <ContentCard>
          <p className="text-themed-muted text-center py-8">
            Detailed story content is being prepared. Check back soon.
          </p>
        </ContentCard>
      )}

      {/* Prev/Next navigation */}
      <div className="flex justify-between mt-8 gap-4">
        {prevProphet ? (
          <Link
            href={`/prophets/${prevProphet.slug}`}
            className="flex-1 card-bg border sidebar-border rounded-xl p-4 hover:border-[var(--color-gold)]/40 transition-colors group"
          >
            <p className="text-xs text-themed-muted mb-1">&larr; Previous</p>
            <p className="text-sm font-semibold text-themed group-hover:text-gold transition-colors">
              {prevProphet.name}
            </p>
            <p className="text-xs font-arabic text-gold/70">
              {prevProphet.nameAr}
            </p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {nextProphet ? (
          <Link
            href={`/prophets/${nextProphet.slug}`}
            className="flex-1 card-bg border sidebar-border rounded-xl p-4 hover:border-[var(--color-gold)]/40 transition-colors group text-right"
          >
            <p className="text-xs text-themed-muted mb-1">Next &rarr;</p>
            <p className="text-sm font-semibold text-themed group-hover:text-gold transition-colors">
              {nextProphet.name}
            </p>
            <p className="text-xs font-arabic text-gold/70">
              {nextProphet.nameAr}
            </p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
