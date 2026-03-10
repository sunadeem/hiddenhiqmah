"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import PageSearch from "@/components/PageSearch";
import { textMatch } from "@/lib/search";
import { ArrowRight, GitBranch } from "lucide-react";
import { prophets } from "@/data/prophets";

function getYearsAgo(date: string): string | null {
  // Extract the first year from the date string (handles ~2000–1800 BCE, ~9th century BCE, 570–632 CE, etc.)
  const currentYear = new Date().getFullYear();

  // Match "Xth century BCE/CE"
  const centuryMatch = date.match(/~?(\d+)(?:st|nd|rd|th)\s+century\s+(BCE|CE)/i);
  if (centuryMatch) {
    const century = parseInt(centuryMatch[1]);
    const isBCE = centuryMatch[2].toUpperCase() === "BCE";
    // Middle of the century
    const midYear = (century - 1) * 100 + 50;
    const yearsAgo = isBCE ? currentYear + midYear : currentYear - midYear;
    return `~${(yearsAgo / 1000).toFixed(1)}k yrs ago`;
  }

  // Match "~YYYY" or "YYYY" (first number in the string), with BCE/CE
  const yearMatch = date.match(/~?(\d{3,4})/);
  if (!yearMatch) return null;

  const year = parseInt(yearMatch[1]);
  const isBCE = date.includes("BCE");
  const isCE = date.includes("CE");

  if (!isBCE && !isCE) return null;

  const yearsAgo = isBCE ? currentYear + year : currentYear - year;

  if (yearsAgo >= 1000) {
    return `~${(yearsAgo / 1000).toFixed(1)}k yrs ago`;
  }
  return `~${yearsAgo} yrs ago`;
}

export default function ProphetsPage() {
  const [search, setSearch] = useState("");
  const filtered = prophets.filter((p) =>
    textMatch(search, p.name, p.nameAr, p.date, p.era, p.summary, p.surahs)
  );

  return (
    <div>
      <PageHeader
        title="The Prophets"
        titleAr="الأنبياء"
        subtitle="Stories of the prophets in chronological order, from Adam to Muhammad ﷺ"
        action={
          <Link
            href="/prophets/family-tree"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 hover:border-[var(--color-gold)]/60 transition-colors group"
            style={{ animation: "glow-pulse 3s ease-in-out infinite" }}
          >
            <GitBranch size={16} className="text-gold" />
            <span className="text-sm font-medium text-gold whitespace-nowrap">Family Tree</span>
            <ArrowRight size={14} className="text-gold/60 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        }
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search prophets by name, era, story..." className="mb-6" />

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[88px] md:left-[140px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--color-gold)] via-[var(--color-border)] to-transparent" />

        <div className="space-y-4">
          {filtered.map((prophet, i) => {
            const dateLabel = prophet.date === "Unknown" ? "Time Unknown" : prophet.date;
            const yearsAgo = getYearsAgo(prophet.date);
            return (
            <div key={prophet.slug} className="relative pl-[108px] md:pl-[168px]">
              {/* Date label (left of line) */}
              <div
                className="absolute left-0 top-4 w-[78px] md:w-[130px] text-right pr-3"
                title={prophet.dateNote}
              >
                <span className="text-[9px] md:text-[10px] leading-tight text-themed-muted block">
                  {dateLabel}
                </span>
                {yearsAgo && (
                  <span className="text-[8px] md:text-[9px] leading-tight text-gold/60 block mt-0.5">
                    ({yearsAgo})
                  </span>
                )}
              </div>
              {/* Timeline dot */}
              <div className="absolute left-[83px] md:left-[135px] top-6 w-3 h-3 rounded-full bg-gold border-2 border-[var(--color-card)]" />

              <ContentCard delay={i * 0.06}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-xl font-semibold text-themed">
                        Prophet {prophet.name}
                      </h2>
                      <span className="text-lg font-arabic text-gold">
                        {prophet.nameAr}
                      </span>
                    </div>
                    {prophet.name === "Muhammad" ? (
                      <span className="text-xs text-themed-muted">
                        صلى الله عليه وسلم
                      </span>
                    ) : (
                      <span className="text-xs text-themed-muted">
                        عليه السلام
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                      {prophet.era}
                    </span>
                    {prophet.source !== "quran" && (
                      <span className="text-xs text-gold border border-gold/30 rounded-full px-3 py-1">
                        {prophet.source === "hadith" ? "Hadith" : "Scholarly"}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-themed-muted text-sm leading-relaxed mb-3">
                  {prophet.summary}
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-themed-muted mb-3">
                  {prophet.mentions > 0 && (
                    <span>
                      Mentioned:{" "}
                      <strong className="text-themed">
                        {prophet.mentions}x
                      </strong>{" "}
                      in Quran
                    </span>
                  )}
                  {prophet.surahs && (
                    <span>
                      Key Surahs:{" "}
                      <strong className="text-themed">{prophet.surahs}</strong>
                    </span>
                  )}
                </div>

                <Link
                  href={`/prophets/${prophet.slug}`}
                  className="flex items-center gap-1 text-accent text-sm font-medium hover:gap-2 transition-all"
                >
                  Read Full Story <ArrowRight size={14} />
                </Link>
              </ContentCard>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
