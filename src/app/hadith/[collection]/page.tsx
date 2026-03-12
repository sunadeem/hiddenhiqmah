"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import { Search, ArrowRight, ArrowLeft, ScrollText } from "lucide-react";

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
  description: string;
  totalHadiths: number;
  books: BookMeta[];
};

type HadithEntry = {
  id: number;
  arabic: string;
  english: string;
  reference: string;
};

type HadithMatch = {
  hadithId: number;
  snippet: string;
  bookId: number;
};

const metadataImports: Record<string, () => Promise<{ default: CollectionMeta }>> = {
  bukhari: () => import("@/data/hadith/bukhari/metadata.json"),
  muslim: () => import("@/data/hadith/muslim/metadata.json"),
  abudawud: () => import("@/data/hadith/abudawud/metadata.json"),
  tirmidhi: () => import("@/data/hadith/tirmidhi/metadata.json"),
  nasai: () => import("@/data/hadith/nasai/metadata.json"),
  ibnmajah: () => import("@/data/hadith/ibnmajah/metadata.json"),
  ahmad: () => import("@/data/hadith/ahmad/metadata.json"),
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
    case "ahmad":
      return import(`@/data/hadith/ahmad/${bookId}.json`).then((m) => m.default);
    default:
      return Promise.resolve([]);
  }
}

function buildSnippet(text: string, query: string): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 100) + "...";
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 60);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

export default function CollectionPage() {
  const params = useParams();
  const collection = params.collection as string;

  const [metadata, setMetadata] = useState<CollectionMeta | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<HadithMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const searchCacheRef = useRef<Map<string, HadithEntry[]>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const loader = metadataImports[collection];
    if (loader) {
      loader().then((mod) => setMetadata(mod.default));
    }
  }, [collection]);

  const searchHadiths = useCallback(
    async (query: string) => {
      if (query.length < 3 || !metadata) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      const q = query.toLowerCase();
      const results: HadithMatch[] = [];

      for (const book of metadata.books) {
        if (results.length >= 50) break;

        const cacheKey = `${collection}:${book.id}`;
        let hadiths = searchCacheRef.current.get(cacheKey);
        if (!hadiths) {
          try {
            hadiths = await loadBookData(collection, book.id);
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
            });
          }
        }
      }

      setSearchResults(results);
      setSearching(false);
    },
    [metadata, collection]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchHadiths(search), 300);
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

  if (!metadataImports[collection]) {
    return (
      <div className="text-center py-12 text-themed-muted">
        <p>Collection not found.</p>
        <Link href="/hadith" className="text-accent mt-4 inline-block">
          Back to Hadith Collections
        </Link>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="text-center py-12 text-themed-muted">Loading...</div>
    );
  }

  const books = metadata.books;
  const getBookName = (bookId: number) =>
    books.find((b) => b.id === bookId)?.name || `Book ${bookId}`;

  const isSearching = search.length >= 3;
  const filteredBooks = isSearching
    ? books.filter((b) => {
        const q = search.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.id.toString() === search.trim() ||
          searchResults.some((r) => r.bookId === b.id)
        );
      })
    : books;

  return (
    <div>
      <Link
        href="/hadith"
        className="inline-flex items-center gap-2 text-sm text-themed-muted hover:text-themed transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        All Collections
      </Link>

      <PageHeader
        title={metadata.name}
        titleAr={metadata.nameAr}
        subtitle={`${metadata.totalHadiths.toLocaleString()} hadiths across ${books.length} books — compiled by ${metadata.author}`}
      />

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-muted"
        />
        <input
          type="text"
          placeholder="Search hadiths by text, book name, or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl card-bg border sidebar-border text-themed placeholder:text-themed-muted focus:outline-none focus:border-[var(--color-gold)] transition-colors"
        />
      </div>

      {/* Search results */}
      {isSearching && searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-themed mb-3">
            Hadith Matches
            <span className="text-sm font-normal text-themed-muted ml-2">
              {searchResults.length}
              {searchResults.length >= 50 ? "+" : ""} results
              {searching && " — searching..."}
            </span>
          </h2>
          <div className="space-y-3">
            {searchResults.slice(0, 20).map((result) => (
              <Link
                key={result.hadithId}
                href={`/hadith/${collection}/${result.bookId}?h=${result.hadithId}`}
              >
                <ContentCard
                  delay={0}
                  className="hover:border-[var(--color-gold)]/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-gold)]/15">
                      <span className="text-gold font-semibold text-xs">
                        #{result.hadithId}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gold font-medium mb-1">
                        {getBookName(result.bookId)}
                      </p>
                      <p className="text-sm text-themed-muted italic leading-relaxed">
                        {highlightSnippet(result.snippet, search)}
                      </p>
                    </div>
                  </div>
                </ContentCard>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-6 mb-6 text-sm text-themed-muted">
        <span>
          {isSearching ? (
            <>
              Showing{" "}
              <strong className="text-themed">{filteredBooks.length}</strong> of{" "}
              {books.length} books
              {searching && " — searching..."}
            </>
          ) : (
            <>
              <strong className="text-themed">{books.length}</strong> books
            </>
          )}
        </span>
      </div>

      {/* Books grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredBooks.map((book, i) => (
          <Link
            key={book.id}
            href={`/hadith/${collection}/${book.id}`}
            className="flex"
          >
            <ContentCard
              delay={Math.min(i * 0.02, 0.5)}
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
                    {book.count} hadiths · #{book.startHadith}–{book.endHadith}
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

      {filteredBooks.length === 0 && (
        <div className="text-center py-12 text-themed-muted">
          <p>No books found matching your search.</p>
        </div>
      )}
    </div>
  );
}
