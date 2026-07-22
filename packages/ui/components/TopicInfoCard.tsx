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

/** Derive a per-selection SourcesCard list from a single topic: its verse ref
 *  plus each point's note refs. House rule: the References card below a rail
 *  shows only the ACTIVE topic's sources, never the whole tab's. */
export function topicSourceRefs(topic: Topic): { ref: string; desc: string }[] {
  const rows: { ref: string; desc: string }[] = [];
  const seen = new Set<string>();
  if (topic.content.verse?.ref) {
    rows.push({ ref: topic.content.verse.ref, desc: `${topic.name} — the cited verse` });
    seen.add(topic.content.verse.ref);
  }
  for (const p of topic.content.points) {
    if (p.note && !seen.has(p.note)) {
      rows.push({ ref: p.note, desc: p.title });
      seen.add(p.note);
    }
  }
  return rows;
}

export default function TopicInfoCard({
  topic,
  showSource = true,
}: {
  topic: Topic;
  /** Hide the aggregated source footer when every point already carries its
   *  own ref (it would just duplicate them). */
  showSource?: boolean;
}) {
  const verse = topic.content.verse;
  return (
    <ContentCard>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-themed">{topic.name}</h2>
      </div>

      <p className="text-themed-muted text-sm leading-relaxed mb-5">
        <HadithRefText text={topic.content.intro} />
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
            <p className="text-themed-muted text-sm leading-relaxed">
              <HadithRefText text={point.detail} />
            </p>
            {point.note && (
              <p className="text-xs text-gold/60 mt-2">
                <HadithRefText text={point.note} />
              </p>
            )}
          </div>
        ))}
      </div>

      {showSource && topic.content.source && (
        <p className="text-xs text-themed-muted mt-5">
          <HadithRefText text={topic.content.source} />
        </p>
      )}
    </ContentCard>
  );
}
