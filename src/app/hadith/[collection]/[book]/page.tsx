"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import BookmarkButton from "@/components/BookmarkButton";
import { ArrowLeft, ChevronDown, ChevronUp, Search } from "lucide-react";

type HadithEntry = {
  id: number;
  arabic: string;
  english: string;
  reference: string;
};

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
  totalHadiths: number;
  books: BookMeta[];
};

const metadataImports: Record<
  string,
  () => Promise<{ default: CollectionMeta }>
> = {
  bukhari: () => import("@/data/hadith/bukhari/metadata.json"),
  muslim: () => import("@/data/hadith/muslim/metadata.json"),
  abudawud: () => import("@/data/hadith/abudawud/metadata.json"),
  tirmidhi: () => import("@/data/hadith/tirmidhi/metadata.json"),
  nasai: () => import("@/data/hadith/nasai/metadata.json"),
  ibnmajah: () => import("@/data/hadith/ibnmajah/metadata.json"),
  ahmad: () => import("@/data/hadith/ahmad/metadata.json"),
};

// We need static import paths for webpack — build a lookup per collection
// Using a function that returns the right import based on collection + book
function loadBookData(
  collection: string,
  bookId: number
): Promise<HadithEntry[]> {
  // Dynamic imports must have static string prefixes for webpack
  switch (collection) {
    case "bukhari":
      return import(`@/data/hadith/bukhari/${bookId}.json`).then(
        (m) => m.default
      );
    case "muslim":
      return import(`@/data/hadith/muslim/${bookId}.json`).then(
        (m) => m.default
      );
    case "abudawud":
      return import(`@/data/hadith/abudawud/${bookId}.json`).then(
        (m) => m.default
      );
    case "tirmidhi":
      return import(`@/data/hadith/tirmidhi/${bookId}.json`).then(
        (m) => m.default
      );
    case "nasai":
      return import(`@/data/hadith/nasai/${bookId}.json`).then(
        (m) => m.default
      );
    case "ibnmajah":
      return import(`@/data/hadith/ibnmajah/${bookId}.json`).then(
        (m) => m.default
      );
    case "ahmad":
      return import(`@/data/hadith/ahmad/${bookId}.json`).then(
        (m) => m.default
      );
    default:
      return Promise.resolve([]);
  }
}

function BookPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const collection = params.collection as string;
  const bookId = Number(params.book);
  const highlightId = searchParams.get("h")
    ? Number(searchParams.get("h"))
    : null;

  const [metadata, setMetadata] = useState<CollectionMeta | null>(null);
  const [hadiths, setHadiths] = useState<HadithEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedArabic, setExpandedArabic] = useState<Set<number>>(
    new Set()
  );
  const [showAllArabic, setShowAllArabic] = useState(false);

  useEffect(() => {
    const metaLoader = metadataImports[collection];
    if (metaLoader) {
      metaLoader().then((mod) => setMetadata(mod.default));
    }
  }, [collection]);

  useEffect(() => {
    setLoading(true);
    setHadiths([]);
    setSearch("");
    setExpandedArabic(new Set());
    setShowAllArabic(false);

    loadBookData(collection, bookId)
      .then((data) => {
        setHadiths(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [collection, bookId]);

  // Scroll to highlighted hadith
  useEffect(() => {
    if (highlightId && !loading) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`hadith-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("section-highlight");
          setTimeout(() => el.classList.remove("section-highlight"), 2000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [highlightId, loading]);

  const toggleArabic = (id: number) => {
    setExpandedArabic((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllArabic = () => {
    if (showAllArabic) {
      setExpandedArabic(new Set());
    } else {
      setExpandedArabic(new Set(hadiths.map((h) => h.id)));
    }
    setShowAllArabic(!showAllArabic);
  };

  const filtered = useMemo(() => {
    if (!search || search.length < 2) return hadiths;
    const q = search.toLowerCase();
    return hadiths.filter(
      (h) =>
        h.english.toLowerCase().includes(q) ||
        h.id.toString() === search.trim()
    );
  }, [hadiths, search]);

  const bookMeta = metadata?.books.find((b) => b.id === bookId);
  const allBooks = metadata?.books || [];
  const currentIdx = allBooks.findIndex((b) => b.id === bookId);
  const prevBook = currentIdx > 0 ? allBooks[currentIdx - 1] : null;
  const nextBook =
    currentIdx < allBooks.length - 1 ? allBooks[currentIdx + 1] : null;

  if (metadata && !bookMeta) {
    return (
      <div className="text-center py-12 text-themed-muted">
        <p>Book not found.</p>
        <Link
          href={`/hadith/${collection}`}
          className="text-accent mt-4 inline-block"
        >
          Back to {metadata.name}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/hadith/${collection}`}
        className="inline-flex items-center gap-2 text-sm text-themed-muted hover:text-themed transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to {metadata?.name || "Collection"}
      </Link>

      <PageHeader
        title={bookMeta ? `Book ${bookId}: ${bookMeta.name}` : "Loading..."}
        titleAr={metadata?.nameAr || ""}
        subtitle={
          bookMeta
            ? `${bookMeta.count} hadiths · #${bookMeta.startHadith}–${bookMeta.endHadith}`
            : ""
        }
        action={
          <button
            onClick={toggleAllArabic}
            className="px-4 py-2 rounded-lg text-sm card-bg border sidebar-border text-themed-muted hover:text-themed transition-colors"
          >
            {showAllArabic ? "Hide" : "Show"} Arabic
          </button>
        }
      />

      {/* Search within book */}
      {bookMeta && bookMeta.count > 10 && (
        <div className="relative max-w-md mb-6">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-muted"
          />
          <input
            type="text"
            placeholder="Search within this book..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl card-bg border sidebar-border text-themed placeholder:text-themed-muted focus:outline-none focus:border-[var(--color-gold)] transition-colors"
          />
        </div>
      )}

      {search && (
        <p className="text-sm text-themed-muted mb-4">
          Showing <strong className="text-themed">{filtered.length}</strong> of{" "}
          {hadiths.length} hadiths
        </p>
      )}

      {loading ? (
        <div className="text-center py-12 text-themed-muted">
          Loading hadiths...
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((hadith, i) => {
            const isHighlighted = hadith.id === highlightId;
            const showArabic = expandedArabic.has(hadith.id);

            return (
              <motion.div
                key={hadith.id}
                id={`hadith-${hadith.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(i * 0.02, 0.3),
                }}
                className={`card-bg rounded-xl border p-5 md:p-6 transition-colors ${
                  isHighlighted
                    ? "border-[var(--color-gold)]/50 bg-[var(--color-gold)]/5"
                    : "sidebar-border"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gold">
                      Hadith #{hadith.id}
                    </span>
                    <span className="text-xs text-themed-muted">
                      Ref: {hadith.reference}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {collection === "bukhari" || collection === "muslim" ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[11px]">
                        Sahih
                      </span>
                    ) : null}
                    <BookmarkButton
                      type="hadith"
                      id={`${collection}-${hadith.id}`}
                      title={hadith.english?.slice(0, 80) || hadith.reference || "Hadith"}
                      subtitle={hadith.reference}
                      href={`/hadith/${collection}/${bookId}?h=${hadith.id}`}
                    />
                  </div>
                </div>

                <p className="text-themed leading-relaxed text-[15px] mb-3">
                  {hadith.english}
                </p>

                {hadith.arabic && (
                  <>
                    <button
                      onClick={() => toggleArabic(hadith.id)}
                      className="flex items-center gap-1.5 text-xs text-themed-muted hover:text-gold transition-colors"
                    >
                      {showArabic ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                      Arabic Text
                    </button>
                    <AnimatePresence>
                      {showArabic && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p
                            className="mt-3 text-right text-xl leading-[2.2] font-arabic text-themed"
                            dir="rtl"
                          >
                            {hadith.arabic}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Book navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t sidebar-border">
        {prevBook ? (
          <Link
            href={`/hadith/${collection}/${prevBook.id}`}
            className="flex items-center gap-2 text-sm text-themed-muted hover:text-gold transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{prevBook.name}</span>
            <span className="sm:hidden">Previous</span>
          </Link>
        ) : (
          <div />
        )}
        {nextBook ? (
          <Link
            href={`/hadith/${collection}/${nextBook.id}`}
            className="flex items-center gap-2 text-sm text-themed-muted hover:text-gold transition-colors"
          >
            <span className="hidden sm:inline">{nextBook.name}</span>
            <span className="sm:hidden">Next</span>
            <ArrowLeft size={16} className="rotate-180" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12 text-themed-muted">Loading...</div>
      }
    >
      <BookPageContent />
    </Suspense>
  );
}
