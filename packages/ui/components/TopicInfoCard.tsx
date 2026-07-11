"use client";

import ContentCard from "./ContentCard";
import HadithRefText from "./HadithRefText";

/**
 * The house "aqidah topic" detail card (intro → optional verse block → point
 * cards → optional source line). Extracted from the four identical inline
 * copies in /barzakh, /day-of-judgement, /story-of-creation, and /why-islam —
 * import this instead of copying.
 */
export type Topic = {
  id: string;
  name: string;
  content: {
    intro: string;
    verse?: { arabic: string; text: string; ref: string } | null;
    points: { title: string; detail: string; note?: string }[];
    source?: string;
  };
};

export default function TopicInfoCard({ topic }: { topic: Topic }) {
  const verse = topic.content.verse;
  return (
    <ContentCard>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-themed">{topic.name}</h2>
      </div>

      <p className="text-themed-muted text-sm leading-relaxed mb-5">
        {topic.content.intro}
      </p>

      {verse && (
        <div
          className="rounded-lg p-4 mb-5"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
            {verse.arabic}
          </p>
          <p className="text-themed text-sm italic">&ldquo;{verse.text}&rdquo;</p>
          <p className="text-xs text-themed-muted mt-2">
            <HadithRefText text={verse.ref} />
          </p>
        </div>
      )}

      <div className="space-y-4">
        {topic.content.points.map((point) => (
          <div
            key={point.title}
            className="rounded-lg p-4 border sidebar-border"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <h4 className="text-sm font-semibold text-themed mb-2">{point.title}</h4>
            <p className="text-themed-muted text-sm leading-relaxed">{point.detail}</p>
            {point.note && (
              <p className="text-xs text-gold/60 mt-2">
                <HadithRefText text={point.note} />
              </p>
            )}
          </div>
        ))}
      </div>

      {topic.content.source && (
        <p className="text-xs text-themed-muted mt-5">
          <HadithRefText text={topic.content.source} />
        </p>
      )}
    </ContentCard>
  );
}
