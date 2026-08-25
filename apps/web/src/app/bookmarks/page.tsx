"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, X, BookOpen, ScrollText, FileText, HandHeart, Repeat, Star, Lightbulb, Heart } from "lucide-react";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import { getBookmarks, removeBookmark, type Bookmark as BookmarkData } from "@hidden-hiqmah/ui/lib/storage";
import { useReminderSaves } from "@/lib/daily/useReminderSaves";
import remindersData from "@hidden-hiqmah/content/reminders.json";
import type { Reminder } from "@hidden-hiqmah/ui/lib/reminders";

const ALL_REMINDERS = remindersData as unknown as Reminder[];

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

function getBookmarkHref(bookmark: BookmarkData): string {
  // Use stored href if available
  if (bookmark.href) return bookmark.href;

  switch (bookmark.type) {
    case "verse": {
      const [surah, verse] = bookmark.id.split(":");
      return `/quran/${surah}?v=${verse}`;
    }
    case "hadith":
      return "/hadith";
    case "dua":
      return "/duas";
    case "dhikr":
      return "/dhikr";
    case "name":
      return "/tawhid?tab=names";
    case "topic":
      return "/";
    case "page":
      return bookmark.id;
    default:
      return "/";
  }
}

const typeConfig: Record<string, { label: string; pluralLabel: string; icon: typeof BookOpen; color: string }> = {
  verse: { label: "Verse", pluralLabel: "Verses", icon: BookOpen, color: "text-emerald-400" },
  hadith: { label: "Hadith", pluralLabel: "Hadiths", icon: ScrollText, color: "text-amber-400" },
  dua: { label: "Dua", pluralLabel: "Duas", icon: HandHeart, color: "text-purple-400" },
  dhikr: { label: "Dhikr", pluralLabel: "Dhikr", icon: Repeat, color: "text-teal-400" },
  name: { label: "Name of Allah", pluralLabel: "Names of Allah", icon: Star, color: "text-gold" },
  topic: { label: "Topic", pluralLabel: "Topics", icon: Lightbulb, color: "text-sky-400" },
  page: { label: "Page", pluralLabel: "Pages", icon: FileText, color: "text-blue-400" },
  reflection: { label: "Reflection", pluralLabel: "Reflections", icon: Heart, color: "text-rose-400" },
};

const groupOrder = ["verse", "hadith", "dua", "dhikr", "name", "topic", "page", "reflection"];

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [mounted, setMounted] = useState(false);

  // Saved reflections live in their OWN store — reminder_saves in Supabase when
  // signed in, localStorage when not — entirely separate from the bookmark list
  // above. Until now nothing rendered them anywhere, so hearting a reflection
  // wrote a row, filled the heart and vanished: the save had no destination, and
  // people reasonably reported it as "the heart doesn't save".
  //
  // They are merged in here rather than being copied into the bookmark list,
  // deliberately: two writers to one store would mean two sources of truth for
  // the same save, and the heart on the Reflections deck would drift out of sync
  // with this page the moment either side changed.
  const { saved, toggle } = useReminderSaves();

  useEffect(() => {
    setBookmarks(getBookmarks());
    setMounted(true);
  }, []);

  const handleRemove = (type: string, id: string) => {
    // Reflections are not bookmarks — unsaving one has to go back through the
    // hook that owns them, or the row survives and it reappears on reload.
    if (type === "reflection") {
      toggle(id);
      return;
    }
    removeBookmark(type, id);
    setBookmarks(getBookmarks());
  };

  const handleClearAll = () => {
    if (!confirm("Remove all bookmarks?")) return;
    bookmarks.forEach((b) => removeBookmark(b.type, b.id));
    setBookmarks([]);
    // Saved reflections are cleared too — they are shown here, so leaving them
    // behind after "remove all" would look like the clear silently failed.
    saved.forEach((id) => toggle(id));
  };

  // Saved reflections, shaped as bookmarks so they group and render like the rest.
  const savedReflections: BookmarkData[] = [...saved]
    .map((id) => ALL_REMINDERS.find((r) => r.id === id))
    .filter((r): r is Reminder => Boolean(r))
    .map((r) => ({
      type: "reflection",
      id: r.id,
      title: r.textEn,
      subtitle: r.sourceKind === "quran" ? `Qur'an ${r.sourceRef}` : r.sourceRef,
      href: "/muslim-daily?tab=reminders",
      // reminder_saves records no saved-at time, so there is nothing honest to
      // show. 0 renders as the epoch, which would be a visible lie — the card
      // omits the timestamp for reflections instead (see below).
      timestamp: 0,
    }));

  // Everything shown on this page, from BOTH stores. The count and the empty
  // state below must read this rather than `bookmarks`, or a user whose only
  // saves are reflections is told they have none while the page lists them.
  const allItems = [...bookmarks, ...savedReflections];

  // Group by type
  const grouped = allItems.reduce<Record<string, BookmarkData[]>>((acc, b) => {
    if (!acc[b.type]) acc[b.type] = [];
    acc[b.type].push(b);
    return acc;
  }, {});

  const sortedGroups = groupOrder.filter((t) => grouped[t]?.length);

  return (
    <main className="min-h-screen max-w-4xl mx-auto">
      <PageHeader
        title="Bookmarks"
        titleAr="المحفوظات"
        subtitle="Your saved verses, hadiths, duas, and more"
      />

      {mounted && allItems.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-themed-muted">
            {allItems.length} saved item{allItems.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 border border-red-400/20 hover:border-red-400/40 transition-colors"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        </div>
      )}

      {mounted && allItems.length === 0 && (
        <ContentCard delay={0.1}>
          <div className="text-center py-12">
            <Bookmark size={48} className="mx-auto text-themed-muted/30 mb-4" />
            <h3 className="text-lg font-semibold text-themed mb-2">Nothing saved yet</h3>
            <p className="text-themed-muted text-sm max-w-md mx-auto">
              Bookmark verses, hadiths and du&apos;ās, or tap the heart on a reflection —
              everything you save lands here.
            </p>
          </div>
        </ContentCard>
      )}

      <AnimatePresence mode="popLayout">
        {sortedGroups.map((type) => {
          const config = typeConfig[type] || typeConfig.page;
          const Icon = config.icon;
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Icon size={16} className={config.color} />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-themed-muted">
                  {config.pluralLabel}
                </h2>
                <span className="text-xs text-themed-muted/50">({grouped[type].length})</span>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {grouped[type].map((bookmark) => (
                    <motion.div
                      key={`${bookmark.type}-${bookmark.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="card-bg rounded-xl border sidebar-border p-4 hover:border-[var(--color-gold)]/30 transition-colors group">
                        <div className="flex items-start gap-3">
                          <Link
                            href={getBookmarkHref(bookmark)}
                            className="flex-1 min-w-0"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${config.color} border-current/20 bg-current/5`}>
                                {config.label}
                              </span>
                              {/* reminder_saves stores no saved-at time, so a
                                  reflection has nothing honest to show here —
                                  rendering timestamp 0 would claim 1970. Omit it
                                  rather than invent one. */}
                              {bookmark.timestamp > 0 && (
                                <span className="text-[10px] text-themed-muted/50">
                                  {formatRelativeTime(bookmark.timestamp)}
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-medium text-themed group-hover:text-gold transition-colors truncate">
                              {bookmark.title}
                            </h3>
                            {bookmark.subtitle && (
                              <p className="text-xs text-themed-muted mt-0.5 truncate">
                                {bookmark.subtitle}
                              </p>
                            )}
                          </Link>
                          <button
                            onClick={() => handleRemove(bookmark.type, bookmark.id)}
                            className="p-1.5 rounded-lg text-themed-muted/40 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                            title="Remove bookmark"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </main>
  );
}
