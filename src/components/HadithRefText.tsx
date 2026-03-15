"use client";

import Link from "next/link";
import { Fragment } from "react";

// Maps display names to URL slugs
const COLLECTION_SLUGS: Record<string, string> = {
  Bukhari: "bukhari",
  Muslim: "muslim",
  "Abu Dawud": "abudawud",
  Tirmidhi: "tirmidhi",
  Nasai: "nasai",
  "Ibn Majah": "ibnmajah",
  Ahmad: "ahmad",
};

// Matches: "Bukhari 63:43", "Muslim 15:106", "Tirmidhi 1:1:1:1:33:82",
// "Bukhari 3818", "Quran 2:185", "Quran 2:185-190", "Bukhari 63:43-45"
// Captures the full number chain (digits and colons) plus optional dash-range
const REF_PATTERN =
  /\b(Bukhari|Muslim|Abu Dawud|Tirmidhi|Nasai|Ibn Majah|Ahmad|Quran)\s+(\d+(?::\d+)*)(?:-(\d+))?\b/g;

type RefSegment =
  | { type: "text"; value: string }
  | { type: "hadith-link"; slug: string; book: string; hadith: string; display: string }
  | { type: "quran-link"; surah: string; ayah?: string; ayahEnd?: string; display: string }
  | { type: "hadith-plain"; display: string };

function parseRefs(text: string): RefSegment[] {
  const segments: RefSegment[] = [];
  let lastIndex = 0;

  REF_PATTERN.lastIndex = 0;

  let match;
  while ((match = REF_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    const name = match[1];
    const numberChain = match[2]; // e.g. "63:43" or "0:15:106" or "3818"
    const rangeEnd = match[3]; // e.g. "45" from "63:43-45"
    const parts = numberChain.split(":");

    if (name === "Quran") {
      segments.push({
        type: "quran-link",
        surah: parts[0],
        ayah: parts[1],
        ayahEnd: rangeEnd,
        display: `Quran ${parts[0]}${parts[1] ? ":" + parts[1] : ""}${rangeEnd ? "-" + rangeEnd : ""}`,
      });
    } else {
      const slug = COLLECTION_SLUGS[name];
      if (slug && parts.length >= 2) {
        // Use last two parts as book:hadith (handles "0:15:106" → book=15, hadith=106)
        const book = parts[parts.length - 2];
        const hadith = parts[parts.length - 1];
        const displayRef = `${book}:${hadith}${rangeEnd ? "-" + rangeEnd : ""}`;
        segments.push({
          type: "hadith-link",
          slug,
          book,
          hadith,
          display: `${name} ${displayRef}`,
        });
      } else {
        // Single number (unconverted): render as plain text
        segments.push({ type: "hadith-plain", display: match[0] });
      }
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

export default function HadithRefText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const segments = parseRefs(text);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        switch (seg.type) {
          case "text":
            return <Fragment key={i}>{seg.value}</Fragment>;
          case "hadith-link":
            return (
              <Link
                key={i}
                href={`/hadith/${seg.slug}/${seg.book}?h=${seg.hadith}`}
                className="text-gold hover:text-gold/80 underline underline-offset-2 decoration-gold/30 hover:decoration-gold/60 transition-colors"
              >
                {seg.display}
              </Link>
            );
          case "quran-link":
            return (
              <Link
                key={i}
                href={`/quran/${seg.surah}`}
                className="text-gold hover:text-gold/80 underline underline-offset-2 decoration-gold/30 hover:decoration-gold/60 transition-colors"
              >
                {seg.display}
              </Link>
            );
          case "hadith-plain":
            return <Fragment key={i}>{seg.display}</Fragment>;
          default:
            return null;
        }
      })}
    </span>
  );
}
