"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import { ArrowRight, ScrollText, Search, Star, X } from "lucide-react";
import { parseHadithRef } from "@/lib/search";
import {
  SincerityIllustration,
  SafeFromHarmIllustration,
  PurificationIllustration,
  SpeechIllustration,
  SelfControlIllustration,
  StrangerIllustration,
  QuranIllustration,
  MercyIllustration,
  FamilyIllustration,
  BestCharacterIllustration,
} from "@/components/FeaturedIllustrations";

type BookMeta = {
  id: number;
  name: string;
  count: number;
  startHadith: number;
  endHadith: number;
};

type CollectionMeta = {
  collection: string;
  name: string;
  nameAr: string;
  author: string;
  description?: string;
  totalHadiths: number;
  books: BookMeta[];
};

type HadithEntry = {
  id: number;
  arabic: string;
  english: string;
  reference: string;
};

type SearchResult = {
  hadithId: number;
  snippet: string;
  bookId: number;
  collection: string;
  collectionName: string;
};

const collections = [
  { slug: "bukhari", name: "Sahih al-Bukhari", shortName: "Bukhari", nameAr: "صحيح البخاري", grade: "Sahih", description: "The most authentic collection of hadith, considered the primary source after the Quran." },
  { slug: "muslim", name: "Sahih Muslim", shortName: "Muslim", nameAr: "صحيح مسلم", grade: "Sahih", description: "The second most authentic collection, known for its rigorous methodology and thematic organization." },
  { slug: "abudawud", name: "Sunan Abu Dawud", shortName: "Abu Dawud", nameAr: "سنن أبي داود", grade: "Mixed", description: "Focuses primarily on hadiths related to Islamic jurisprudence and legal rulings." },
  { slug: "tirmidhi", name: "Jami at-Tirmidhi", shortName: "Tirmidhi", nameAr: "جامع الترمذي", grade: "Mixed", description: "Notable for including grading of hadiths and commentary on different scholarly opinions." },
  { slug: "nasai", name: "Sunan an-Nasai", shortName: "Nasai", nameAr: "سنن النسائي", grade: "Mixed", description: "Known for its strict criteria in hadith selection, considered among the most reliable Sunan collections." },
  { slug: "ibnmajah", name: "Sunan Ibn Majah", shortName: "Ibn Majah", nameAr: "سنن ابن ماجه", grade: "Mixed", description: "Completes the six major collections, containing unique hadiths not found in the other five. Note: some scholars considered the Muwatta of Imam Malik as the sixth book instead, and some of Ibn Majah's unique hadiths are weaker in grading." },
];

const featuredHadiths = [
  {
    title: "Deeds Are By Intentions",
    text: "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.",
    narrator: "Narrated 'Umar bin Al-Khattab",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 1,
    hadithId: 1,
    theme: "Sincerity",
    illustration: SincerityIllustration,
  },
  {
    title: "A Muslim Is Safe From Harm",
    text: "A Muslim is the one who avoids harming Muslims with his tongue and hands. And a Muhajir (emigrant) is the one who gives up (abandons) all what Allah has forbidden.",
    narrator: "Narrated 'Abdullah bin 'Amr",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 2,
    hadithId: 10,
    theme: "Character",
    illustration: SafeFromHarmIllustration,
  },
  {
    title: "Cleanliness Is Half of Faith",
    text: "Cleanliness is half of faith and al-Hamdu Lillah (all praise and gratitude is for Allah alone) fills the scale, and Subhan Allah and al-Hamdu Lillah fill up what is between the heavens and the earth.",
    narrator: "Abu Malik at-Ash'ari",
    collection: "muslim",
    collectionName: "Muslim",
    bookId: 2,
    hadithId: 534,
    theme: "Purification",
    illustration: PurificationIllustration,
  },
  {
    title: "Speak Good or Remain Silent",
    text: "Whoever believes in Allah and the Last Day, should not hurt his neighbor and whoever believes in Allah and the Last Day, should serve his guest generously and whoever believes in Allah and the Last Day, should speak what is good or keep silent.",
    narrator: "Narrated Abu Huraira",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 78,
    hadithId: 6136,
    theme: "Speech",
    illustration: SpeechIllustration,
  },
  {
    title: "True Strength Is Self-Control",
    text: "The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger.",
    narrator: "Narrated Abu Huraira",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 78,
    hadithId: 6114,
    theme: "Character",
    illustration: SelfControlIllustration,
  },
  {
    title: "Be a Stranger in This World",
    text: "Be in this world as if you were a stranger or a traveler.",
    narrator: "Narrated 'Abdullah bin 'Umar",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 81,
    hadithId: 6416,
    theme: "Worldly Life",
    illustration: StrangerIllustration,
  },
  {
    title: "Best of You Learn and Teach Quran",
    text: "The best among you (Muslims) are those who learn the Qur'an and teach it.",
    narrator: "Narrated 'Uthman",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 66,
    hadithId: 5027,
    theme: "Quran",
    illustration: QuranIllustration,
  },
  {
    title: "Make Things Easy",
    text: "Make things easy for the people, and do not make it difficult for them, and make them calm (with glad tidings) and do not repulse (them).",
    narrator: "Narrated Anas bin Malik",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 4,
    hadithId: 220,
    theme: "Mercy",
    illustration: MercyIllustration,
  },
  {
    title: "Best of You to Your Wives",
    text: "The most complete of the believers in faith, is the one with the best character among them. And the best of you are those who are best to your women.",
    narrator: "Abu Hurairah",
    collection: "tirmidhi",
    collectionName: "Tirmidhi",
    bookId: 12,
    hadithId: 1162,
    theme: "Family",
    illustration: FamilyIllustration,
  },
  {
    title: "Best Character",
    text: "The most beloved to me amongst you is the one who has the best character and manners.",
    narrator: "Narrated 'Abdullah bin 'Amr",
    collection: "bukhari",
    collectionName: "Bukhari",
    bookId: 62,
    hadithId: 3759,
    theme: "Character",
    illustration: BestCharacterIllustration,
  },
];

const metadataImports: Record<string, () => Promise<{ default: CollectionMeta }>> = {
  bukhari: () => import("@/data/hadith/bukhari/metadata.json"),
  muslim: () => import("@/data/hadith/muslim/metadata.json"),
  abudawud: () => import("@/data/hadith/abudawud/metadata.json"),
  tirmidhi: () => import("@/data/hadith/tirmidhi/metadata.json"),
  nasai: () => import("@/data/hadith/nasai/metadata.json"),
  ibnmajah: () => import("@/data/hadith/ibnmajah/metadata.json"),
};

function loadBookData(collection: string, bookId: number): Promise<HadithEntry[]> {
  switch (collection) {
    case "bukhari":
      return import(`@/data/hadith/bukhari/${bookId}.json`).then((m) => m.default);
    case "muslim":
      return import(`@/data/hadith/muslim/${bookId}.json`).then((m) => m.default);
    case "abudawud":
      return import(`@/data/hadith/abudawud/${bookId}.json`).then((m) => m.default);
    case "tirmidhi":
      return import(`@/data/hadith/tirmidhi/${bookId}.json`).then((m) => m.default);
    case "nasai":
      return import(`@/data/hadith/nasai/${bookId}.json`).then((m) => m.default);
    case "ibnmajah":
      return import(`@/data/hadith/ibnmajah/${bookId}.json`).then((m) => m.default);
    default:
      return Promise.resolve([]);
  }
}

function buildSnippet(text: string, query: string): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 120) + "...";
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, idx + query.length + 70);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

export default function HadithPage() {
  const [selected, setSelected] = useState<string>("bukhari");
  const [metadataMap, setMetadataMap] = useState<Record<string, CollectionMeta>>({});
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchCacheRef = useRef<Map<string, HadithEntry[]>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load metadata for all collections
  useEffect(() => {
    for (const col of collections) {
      metadataImports[col.slug]().then((mod) => {
        setMetadataMap((prev) => ({ ...prev, [col.slug]: mod.default }));
      });
    }
  }, []);

  const currentMeta = metadataMap[selected];

  const searchHadiths = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      const q = query.toLowerCase();
      const results: SearchResult[] = [];

      // Search across all collections
      for (const col of collections) {
        const meta = metadataMap[col.slug];
        if (!meta) continue;
        if (results.length >= 50) break;

        for (const book of meta.books) {
          if (results.length >= 50) break;

          const cacheKey = `${col.slug}:${book.id}`;
          let hadiths = searchCacheRef.current.get(cacheKey);
          if (!hadiths) {
            try {
              hadiths = await loadBookData(col.slug, book.id);
              searchCacheRef.current.set(cacheKey, hadiths);
            } catch {
              continue;
            }
          }

          for (const h of hadiths) {
            if (results.length >= 50) break;
            if (h.english && h.english.toLowerCase().includes(q)) {
              results.push({
                hadithId: h.id,
                snippet: buildSnippet(h.english, query),
                bookId: book.id,
                collection: col.slug,
                collectionName: col.shortName,
              });
            }
          }
        }
      }

      setSearchResults(results);
      setSearching(false);
    },
    [metadataMap]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchHadiths(search), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, searchHadiths]);

  function highlightSnippet(snippet: string, query: string) {
    const q = query.toLowerCase();
    const idx = snippet.toLowerCase().indexOf(q);
    if (idx === -1) return snippet;
    return (
      <>
        {snippet.slice(0, idx)}
        <span className="text-gold font-medium">
          {snippet.slice(idx, idx + q.length)}
        </span>
        {snippet.slice(idx + q.length)}
      </>
    );
  }

  // Check for structured hadith reference (e.g. "bukhari 50", "muslim:2912")
  const hadithRef = parseHadithRef(search);
  const hadithRefBook = (() => {
    if (!hadithRef) return null;
    const meta = metadataMap[hadithRef.collection];
    if (!meta) return null;
    const book = meta.books.find(
      (b) => hadithRef.hadithId >= b.startHadith && hadithRef.hadithId <= b.endHadith
    );
    return book ? { bookId: book.id, bookName: book.name } : null;
  })();
  const hadithRefCollection = hadithRef
    ? collections.find((c) => c.slug === hadithRef.collection)
    : null;

  const isSearching = search.length >= 3 || !!hadithRef;

  const isFeatured = selected === "featured";
  const selectedInfo = collections.find((c) => c.slug === selected);
  const subtitle = currentMeta
    ? `${currentMeta.totalHadiths.toLocaleString()} hadiths across ${currentMeta.books.length} books — compiled by ${currentMeta.author}`
    : "";

  return (
    <div>
      <PageHeader
        title="Hadith Collections"
        titleAr="الحديث النبوي"
        subtitle="The six authentic collections of Prophet Muhammad's ﷺ sayings and traditions"
      />

      {/* Search bar */}
      <div className="relative max-w-xl mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-muted"
        />
        <input
          type="text"
          placeholder="Search hadiths or references (e.g. bukhari 50, muslim 2912)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl card-bg border sidebar-border text-themed placeholder:text-themed-muted focus:outline-none focus:border-[var(--color-gold)] transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search results */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold text-themed">
                Search Results
              </h2>
              <span className="text-sm text-themed-muted">
                {searching
                  ? "Searching..."
                  : `${searchResults.length}${searchResults.length >= 50 ? "+" : ""} results`}
              </span>
            </div>

            {/* Direct reference match */}
            {hadithRef && hadithRefCollection && hadithRefBook && (
              <Link
                href={`/hadith/${hadithRef.collection}/${hadithRefBook.bookId}?h=${hadithRef.hadithId}`}
              >
                <div className="card-bg rounded-lg border border-[var(--color-gold)]/40 p-4 mb-3 hover:border-[var(--color-gold)] transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gold">
                      #{hadithRef.hadithId}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-gold)]/10 text-gold">
                      {hadithRefCollection.shortName}
                    </span>
                    <span className="text-[11px] text-themed-muted">
                      {hadithRefBook.bookName}
                    </span>
                  </div>
                  <p className="text-sm text-themed">
                    Go to {hadithRefCollection.name} — Hadith #{hadithRef.hadithId}
                  </p>
                </div>
              </Link>
            )}
            {hadithRef && hadithRefCollection && !hadithRefBook && (
              <p className="text-sm text-themed-muted py-2">
                Hadith #{hadithRef.hadithId} not found in {hadithRefCollection.name}
              </p>
            )}

            {searchResults.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {searchResults.map((result) => (
                  <Link
                    key={`${result.collection}-${result.hadithId}`}
                    href={`/hadith/${result.collection}/${result.bookId}?h=${result.hadithId}`}
                  >
                    <div className="card-bg rounded-lg border sidebar-border p-4 hover:border-[var(--color-gold)]/30 transition-colors">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-gold">
                          #{result.hadithId}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-gold)]/10 text-gold">
                          {result.collectionName}
                        </span>
                      </div>
                      <p className="text-sm text-themed-muted leading-relaxed">
                        {highlightSnippet(result.snippet, search)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              !searching && (
                <p className="text-sm text-themed-muted py-4">
                  No hadiths found matching &ldquo;{search}&rdquo;
                </p>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Featured pill */}
        <button
          onClick={() => setSelected("featured")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
            selected === "featured"
              ? "bg-amber-500 text-[#1a1a2e] shadow-lg shadow-amber-500/20"
              : "border border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          }`}
        >
          <Star size={14} />
          Featured
        </button>

        {/* Separator */}
        <div className="w-px h-8 bg-[var(--color-gold)]/20 self-center mx-1" />

        {collections.map((col) => {
          const isActive = col.slug === selected;
          return (
            <button
              key={col.slug}
              onClick={() => setSelected(col.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-[var(--color-gold)] text-[#1a1a2e] shadow-lg shadow-[var(--color-gold)]/20"
                  : "card-bg border sidebar-border text-themed-muted hover:text-themed hover:border-[var(--color-gold)]/30"
              }`}
            >
              {col.shortName}
              {isActive && metadataMap[col.slug] && (
                <span className="ml-1.5 opacity-70">
                  · {metadataMap[col.slug].books.length} books
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {isFeatured ? (
            <>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="text-xl font-semibold text-themed">
                  Featured Hadiths
                </h2>
              </div>
              <p className="text-sm text-themed-muted mb-4">
                Well-known and frequently referenced sayings of the Prophet ﷺ
              </p>

              <div className="space-y-16">
                  {featuredHadiths.map((hadith, i) => {
                    const Illustration = hadith.illustration;
                    const isEven = i % 2 === 0;
                    return (
                      <motion.div
                        key={hadith.hadithId}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      >
                        <Link href={`/hadith/${hadith.collection}/${hadith.bookId}?h=${hadith.hadithId}`}>
                          <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-12 max-w-4xl mx-auto group`}>
                            {/* Illustration side */}
                            <div className="w-48 h-48 md:w-56 md:h-56 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                              <Illustration />
                            </div>
                            {/* Text side */}
                            <div className={`flex-1 ${isEven ? "md:text-left" : "md:text-right"} text-center`}>
                              <div className={`flex flex-wrap items-center gap-2 mb-3 justify-center ${isEven ? "md:justify-start" : "md:justify-end"}`}>
                                <span className="text-[11px] px-2.5 py-1 rounded-full bg-sky-400/15 text-sky-300">
                                  {hadith.theme}
                                </span>
                                <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-gold)]/10 text-gold">
                                  {hadith.collectionName} #{hadith.hadithId}
                                </span>
                              </div>
                              <h3 className="text-2xl font-semibold text-themed mb-4 group-hover:text-sky-300 transition-colors">
                                {hadith.title}
                              </h3>
                              <p className="text-themed text-lg leading-relaxed mb-4 italic opacity-90">
                                &ldquo;{hadith.text}&rdquo;
                              </p>
                              <p className="text-sm text-themed-muted">
                                — {hadith.narrator}
                              </p>
                            </div>
                          </div>
                        </Link>
                        {i < featuredHadiths.length - 1 && (
                          <div className="flex justify-center mt-16">
                            <div className="w-px h-12 bg-gradient-to-b from-sky-400/30 to-transparent" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
            </>
          ) : selectedInfo && currentMeta ? (
            <>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="text-xl font-semibold text-themed">
                  {selectedInfo.name}
                </h2>
                <span className="text-lg font-arabic text-gold opacity-70">
                  {selectedInfo.nameAr}
                </span>
                {selectedInfo.grade === "Sahih" && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                    All Sahih
                  </span>
                )}
              </div>
              <p className="text-sm text-themed-muted mb-2">{selectedInfo.description}</p>
              <p className="text-xs text-themed-muted mb-6">{subtitle}</p>

              {/* Books grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {currentMeta.books.map((book, i) => (
                  <Link
                    key={book.id}
                    href={`/hadith/${selected}/${book.id}`}
                    className="flex"
                  >
                    <ContentCard
                      delay={Math.min(i * 0.02, 0.4)}
                      className="flex-1 flex flex-col"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-gold)]/15">
                          <span className="text-gold font-semibold text-sm">
                            {book.id}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-themed mb-1 leading-tight">
                            {book.name}
                          </h3>
                          <p className="text-xs text-themed-muted mb-3">
                            {book.count} hadiths · #{book.startHadith}–
                            {book.endHadith}
                          </p>
                          <div className="flex items-center gap-1 text-accent text-xs font-medium">
                            <ScrollText size={12} />
                            <span>Browse</span>
                            <ArrowRight size={12} />
                          </div>
                        </div>
                      </div>
                    </ContentCard>
                  </Link>
                ))}
              </div>
            </>
          ) : selectedInfo ? (
            <div className="text-center py-12 text-themed-muted">
              Loading {selectedInfo.name}...
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
