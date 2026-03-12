// localStorage utility for bookmarks, reading progress, and user preferences

export type BookmarkType = "verse" | "hadith" | "dua" | "dhikr" | "name" | "topic" | "page";

export type Bookmark = {
  type: BookmarkType;
  id: string; // e.g., "1:5" for verse, "bukhari-1" for hadith, "dua-3" for dua
  title: string;
  subtitle?: string;
  href?: string; // optional deep link for navigation
  timestamp: number;
};

export type ReadingProgress = {
  surahsRead: number[]; // surah IDs the user has visited
  lastSurah?: number;
  lastVerse?: number;
};

const KEYS = {
  bookmarks: "hiqmah-bookmarks",
  progress: "hiqmah-reading-progress",
  fontSize: "hiqmah-font-size",
  dhikrCounts: "hiqmah-dhikr",
  autoPlayNextSurah: "hiqmah-autoplay-next",
} as const;

function get<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

// ─── Bookmarks ───

export function getBookmarks(): Bookmark[] {
  return get<Bookmark[]>(KEYS.bookmarks, []);
}

export function addBookmark(bookmark: Omit<Bookmark, "timestamp">) {
  const bookmarks = getBookmarks();
  // Don't duplicate
  if (bookmarks.some((b) => b.type === bookmark.type && b.id === bookmark.id)) return;
  bookmarks.unshift({ ...bookmark, timestamp: Date.now() });
  set(KEYS.bookmarks, bookmarks);
}

export function removeBookmark(type: string, id: string) {
  const bookmarks = getBookmarks().filter((b) => !(b.type === type && b.id === id));
  set(KEYS.bookmarks, bookmarks);
}

export function isBookmarked(type: string, id: string): boolean {
  return getBookmarks().some((b) => b.type === type && b.id === id);
}

// ─── Reading Progress ───

export function getProgress(): ReadingProgress {
  return get<ReadingProgress>(KEYS.progress, { surahsRead: [] });
}

export function markSurahRead(surahId: number) {
  const progress = getProgress();
  if (!progress.surahsRead.includes(surahId)) {
    progress.surahsRead.push(surahId);
  }
  progress.lastSurah = surahId;
  set(KEYS.progress, progress);
}

export function setLastPosition(surahId: number, verseNum: number) {
  const progress = getProgress();
  progress.lastSurah = surahId;
  progress.lastVerse = verseNum;
  set(KEYS.progress, progress);
}

// ─── Font Size ───

export function getFontSize(): number {
  return get<number>(KEYS.fontSize, 2); // 0=small, 1=medium, 2=large (default), 3=xl
}

export function setFontSize(size: number) {
  set(KEYS.fontSize, size);
}

// ─── Dhikr ───

export type DhikrCounts = Record<string, number>;

export function getDhikrCounts(): DhikrCounts {
  return get<DhikrCounts>(KEYS.dhikrCounts, {});
}

export function setDhikrCount(dhikrId: string, count: number) {
  const counts = getDhikrCounts();
  counts[dhikrId] = count;
  set(KEYS.dhikrCounts, counts);
}

// ─── Auto-play next surah ───

export function getAutoPlayNextSurah(): boolean {
  return get<boolean>(KEYS.autoPlayNextSurah, false);
}

export function setAutoPlayNextSurah(enabled: boolean) {
  set(KEYS.autoPlayNextSurah, enabled);
}
