"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import { Search, ArrowRight, BookOpen, Check } from "lucide-react";
import chapters from "@hidden-hiqmah/content/quran/chapters.json";
import { parseQuranRef } from "@hidden-hiqmah/ui/lib/search";
import { getProgress } from "@hidden-hiqmah/ui/lib/storage";
import { useQuranAudio } from "@hidden-hiqmah/ui/context/QuranAudioContext";
import { useIsNative } from "@/lib/mobile/platform";

type VerseEntry = { n: number; t: string };
type SearchIndex = { id: number; v: VerseEntry[] }[];
type VerseMatch = { verseNum: number; snippet: string };

function buildSnippet(text: string, query: string): string {
  const idx = text.indexOf(query);
  if (idx === -1) return text.slice(0, 80) + "...";
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + query.length + 50);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

export default function QuranPage() {
  const isNative = useIsNative();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "makkah" | "madinah">("all");
  const [verseMatches, setVerseMatches] = useState<Map<number, VerseMatch>>(new Map());
  const [searchingVerses, setSearchingVerses] = useState(false);
  const searchIndexRef = useRef<SearchIndex | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [surahsRead, setSurahsRead] = useState<Set<number>>(new Set());
  const [lastPos, setLastPos] = useState<{ surah: number; verse?: number } | null>(null);

  useEffect(() => {
    const progress = getProgress();
    setSurahsRead(new Set(progress.surahsRead));
    if (progress.lastSurah) setLastPos({ surah: progress.lastSurah, verse: progress.lastVerse });
  }, []);

  const searchVerses = useCallback(async (query: string) => {
    if (query.length < 3) {
      setVerseMatches(new Map());
      setSearchingVerses(false);
      return;
    }

    setSearchingVerses(true);

    if (!searchIndexRef.current) {
      const mod = await import("@hidden-hiqmah/content/quran/search-index.json");
      searchIndexRef.current = mod.default as SearchIndex;
    }

    const q = query.toLowerCase();
    const matches = new Map<number, VerseMatch>();
    for (const entry of searchIndexRef.current) {
      for (const verse of entry.v) {
        if (verse.t.includes(q)) {
          matches.set(entry.id, {
            verseNum: verse.n,
            snippet: buildSnippet(verse.t, q),
          });
          break; // first match per surah
        }
      }
    }
    setVerseMatches(matches);
    setSearchingVerses(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchVerses(search), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, searchVerses]);

  // Check for structured reference (e.g. "3:14", "al imran", "baqarah 5")
  const quranRef = parseQuranRef(search);

  const filtered = chapters.filter((ch) => {
    const q = search.toLowerCase();

    const matchesSearch =
      !search ||
      ch.name.toLowerCase().includes(q) ||
      ch.meaning.toLowerCase().includes(q) ||
      ch.nameAr.includes(search) ||
      ch.id.toString() === search.trim() ||
      verseMatches.has(ch.id) ||
      (quranRef && ch.id === quranRef.surahId);
    const matchesFilter = filter === "all" || ch.revelationPlace === filter;
    return matchesSearch && matchesFilter;
  });

  const getVerseMatch = (id: number): VerseMatch | null => {
    if (!search || search.length < 3) return null;
    return verseMatches.get(id) ?? null;
  };

  const buildHref = (chId: number) => {
    // If a verse was specified in the reference, link directly to it
    if (quranRef?.verse && chId === quranRef.surahId) {
      return `/quran/${chId}?v=${quranRef.verse}`;
    }
    const match = getVerseMatch(chId);
    if (match) {
      return `/quran/${chId}?q=${encodeURIComponent(search)}&v=${match.verseNum}`;
    }
    return `/quran/${chId}`;
  };

  function highlightSnippet(snippet: string, query: string) {
    const q = query.toLowerCase();
    const idx = snippet.toLowerCase().indexOf(q);
    if (idx === -1) return snippet;
    return (
      <>
        {snippet.slice(0, idx)}
        <span className="text-gold font-medium">{snippet.slice(idx, idx + q.length)}</span>
        {snippet.slice(idx + q.length)}
      </>
    );
  }

  // Native app: compact list — sticky search, continue-reading hero, native rows (no Meccan/Medinan filters).
  if (isNative) {
    return (
      <div className="pb-2">
        <div className="flex items-baseline justify-between px-1 mb-3">
          <h1 className="text-2xl font-extrabold text-themed">Quran</h1>
          <span className="text-lg font-arabic text-gold">القرآن الكريم</span>
        </div>

        {/* Sticky search */}
        <div className="sticky top-0 z-20 -mx-3 px-3 py-2 bg-[var(--color-bg)]/85 backdrop-blur-xl">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-muted" />
            <input
              type="text"
              inputMode="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search surahs or verses…"
              className="w-full pl-9 pr-3 h-11 rounded-xl card-bg border sidebar-border text-themed placeholder:text-themed-muted text-[15px] outline-none focus:border-[var(--color-gold)]/50"
            />
          </div>
        </div>

        {/* Continue reading (or resume the verse that's playing) */}
        {!search && <ContinueHero lastPos={lastPos} readCount={surahsRead.size} />}

        {/* Native rows */}
        <div className={`rounded-2xl border sidebar-border overflow-hidden ${search ? "mt-3" : ""}`}>
          {filtered.map((ch, i) => {
            const match = getVerseMatch(ch.id);
            return (
              <Link
                key={ch.id}
                href={buildHref(ch.id)}
                className={`flex items-center gap-3 px-4 py-3 active:bg-[var(--color-gold)]/5 ${i > 0 ? "border-t sidebar-border" : ""}`}
              >
                <div className="relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-gold)]/15">
                  <span className="text-gold font-semibold text-xs">{ch.id}</span>
                  {surahsRead.has(ch.id) && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={9} className="text-white" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-themed truncate text-[15px]">{ch.name}</h3>
                    <span className="font-arabic text-gold text-base shrink-0">{ch.nameAr}</span>
                  </div>
                  {match ? (
                    <div className="text-xs leading-snug truncate">
                      <span className="text-gold font-medium">Verse {match.verseNum}</span>
                      <span className="text-themed-muted italic"> — {highlightSnippet(match.snippet, search)}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-themed-muted truncate">
                      {ch.meaning} · {ch.verses} verses · {ch.revelationPlace === "makkah" ? "Meccan" : "Medinan"}
                    </p>
                  )}
                </div>
                <ArrowRight size={15} className="text-themed-muted shrink-0" />
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-themed-muted text-sm">No surahs found for “{search}”.</div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="The Quran"
        titleAr="القرآن الكريم"
        subtitle="The Holy Quran — 114 Surahs, 6,236 Verses"
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Only the search bar sticks on native; the filter pills scroll away. */}
        <div
          className={`flex-1 sm:max-w-md ${
            isNative
              ? "sticky top-0 z-20 -mx-3 px-3 py-2 bg-[var(--color-bg)]/90 backdrop-blur-xl"
              : ""
          }`}
        >
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-muted" />
            <input
              type="text"
              placeholder={
                isNative
                  ? "Search surahs or verses..."
                  : "Search surahs, verses, or references (e.g. 3:14, al imran)..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl card-bg border sidebar-border text-themed placeholder:text-themed-muted focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            />
          </div>
        </div>
        <div className="quran-filterpills flex gap-2">
          {(["all", "makkah", "madinah"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[var(--color-gold)] text-[var(--color-bg)]"
                  : "card-bg border sidebar-border text-themed-muted hover:text-themed"
              }`}
            >
              {f === "all" ? "All" : f === "makkah" ? "Meccan" : "Medinan"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar + reading progress */}
      <div className={`flex flex-col sm:flex-row sm:items-center gap-3 ${isNative ? "mb-3" : "mb-6"}`}>
        <span className="text-sm text-themed-muted">
          {quranRef ? (
            <>
              Surah {quranRef.surahId}
              {quranRef.verse ? `, Verse ${quranRef.verse}` : ""}
              {" — "}
              <span className="text-[var(--color-gold)]">
                {chapters.find((c) => c.id === quranRef.surahId)?.name}
              </span>
            </>
          ) : (
            <>
              Showing <strong className="text-themed">{filtered.length}</strong> of 114 surahs
              {searchingVerses && " — searching verses..."}
            </>
          )}
        </span>
        {surahsRead.size > 0 && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-xs text-themed-muted">{surahsRead.size}/114 read</span>
            <div className="w-24 h-1.5 rounded-full bg-[var(--color-gold)]/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-gold)] transition-all duration-500"
                style={{ width: `${(surahsRead.size / 114) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Surah list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((ch, i) => {
          const match = getVerseMatch(ch.id);
          return (
            <Link
              key={ch.id}
              href={buildHref(ch.id)}
              className={`flex ${isNative ? "active:scale-[0.98] transition-transform" : ""}`}
            >
              <ContentCard delay={Math.min(i * 0.03, 0.5)} className="flex-1 flex flex-col">
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-gold)]/15">
                    <span className="text-gold font-semibold text-sm">{ch.id}</span>
                    {surahsRead.has(ch.id) && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-semibold text-themed truncate">{ch.name}</h3>
                      <span className="text-lg font-arabic text-gold ml-2 shrink-0">{ch.nameAr}</span>
                    </div>
                    <p className="text-xs text-themed-muted mb-2">
                      {ch.meaning} · {ch.verses} verses · {ch.revelationPlace === "makkah" ? "Meccan" : "Medinan"}
                    </p>
                    {match ? (
                      <div className="text-xs leading-relaxed mb-1">
                        <span className="text-gold font-medium">Verse {match.verseNum}</span>
                        <span className="text-themed-muted"> — </span>
                        <span className="text-themed-muted italic">
                          {highlightSnippet(match.snippet, search)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-themed-muted leading-relaxed line-clamp-3">
                        {(ch as Record<string, unknown>).overview as string}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-accent text-xs font-medium mt-2">
                      <BookOpen size={12} />
                      <span>Read Surah</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </ContentCard>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-themed-muted">
          <p>No surahs found matching your search.</p>
        </div>
      )}
    </div>
  );
}

// Continue-reading hero. Kept as its own component (consuming the audio context)
// so the 114-row list never re-renders on audio progress ticks.
function ContinueHero({
  lastPos,
  readCount,
}: {
  lastPos: { surah: number; verse?: number } | null;
  readCount: number;
}) {
  const audio = useQuranAudio();
  // Resume target: the playing verse if something is playing, else last position.
  const playing = audio.playingVerse != null && audio.surahId != null;
  const surah = playing ? audio.surahId : lastPos?.surah ?? null;
  const rawVerse = playing ? audio.playingVerse : lastPos?.verse;
  const ch = surah != null ? chapters.find((c) => c.id === surah) : null;
  if (!ch) return null;
  // Guard against a stale verse that doesn't exist in the resolved surah.
  const verse = rawVerse && rawVerse <= ch.verses ? rawVerse : undefined;
  return (
    <Link
      href={verse ? `/quran/${ch.id}?v=${verse}` : `/quran/${ch.id}`}
      className="relative block mt-3 mb-4 rounded-2xl overflow-hidden border sidebar-border p-4 active:scale-[0.99] transition-transform"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/20 to-transparent" />
      <div className="relative">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold mb-1">
          <BookOpen size={12} /> {playing ? "Now playing" : "Continue reading"}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold text-themed truncate">
            {ch.name}
            {verse ? <span className="text-themed-muted font-normal text-sm"> · Verse {verse}</span> : null}
          </span>
          <span className="font-arabic text-gold text-lg shrink-0">{ch.nameAr}</span>
        </div>
        <div className="text-xs text-themed-muted mt-0.5">
          {ch.meaning} · {readCount} of 114 read
        </div>
      </div>
    </Link>
  );
}
