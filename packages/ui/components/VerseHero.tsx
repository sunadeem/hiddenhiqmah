"use client";

import ContentCard from "./ContentCard";
import HadithRefText from "./HadithRefText";

/**
 * THE page-level opening quote card — rendered exactly once per content page,
 * between PageHeader and PageSearch (never inside a tab panel, so it doesn't
 * shift as tabs change). Fixed structure + min-height keep the card the same
 * size across the whole app.
 */
export default function VerseHero({
  arabic,
  text,
  reference,
  label = "The Quran",
  className = "",
}: {
  arabic?: string;
  text: string;
  reference: string;
  /** Small uppercase kicker, e.g. "The Quran" or "The Prophet ﷺ said". */
  label?: string;
  className?: string;
}) {
  return (
    <ContentCard className={`mb-6 ${className}`}>
      <div className="text-center py-6 min-h-[170px] flex flex-col items-center justify-center">
        <p className="text-xs text-themed-muted mb-3 uppercase tracking-wider">{label}</p>
        {arabic && (
          <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose mb-4">
            {arabic}
          </p>
        )}
        <p className="text-themed-muted italic mb-2 max-w-2xl mx-auto">
          &ldquo;{text}&rdquo;
        </p>
        <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
          <HadithRefText text={reference} />
        </span>
      </div>
    </ContentCard>
  );
}
