"use client";

import { BookOpen } from "lucide-react";
import ContentCard from "@/components/ContentCard";
import HadithRefText from "@/components/HadithRefText";

export type SourceRef = {
  ref: string;
  desc: string;
};

export default function SourcesCard({
  sources,
  delay = 0.3,
  className = "",
}: {
  sources: SourceRef[];
  delay?: number;
  className?: string;
}) {
  if (sources.length === 0) return null;

  return (
    <ContentCard delay={delay} className={className}>
      <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
        <BookOpen size={14} className="text-gold" />
        Sources &amp; References
      </h4>
      <ul className="space-y-1.5">
        {sources.map((source, i) => (
          <li
            key={i}
            className="text-xs text-themed-muted leading-relaxed flex items-start gap-2"
          >
            <span className="text-gold/40 mt-0.5">&#8226;</span>
            <span>
              <HadithRefText text={source.ref} />{source.desc ? ` — ${source.desc}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </ContentCard>
  );
}
