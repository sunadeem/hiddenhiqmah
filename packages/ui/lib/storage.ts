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
  quranView: "hiqmah-quran-view",
  quranDisplay: "hiqmah-quran-display",
  kidsProgress: "hiqmah-kids-progress",
  visits: "hiqmah-visits",
  notifications: "hiqmah-notifications",
  prayerSettings: "hiqmah-prayer-settings",
  homePrefs: "hiqmah-home-prefs",
} as const;

export type VisitStats = {
  lastVisit?: string;
  currentStreak: number;
  longestStreak: number;
};

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayBefore(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getVisitStats(): VisitStats {
  return get<VisitStats>(KEYS.visits, { currentStreak: 0, longestStreak: 0 });
}

// ─── Notifications ─────────────────────────────────────────────

export type NotificationPrefs = {
  adhanEnabled: boolean;
  adhanPerPrayer: { fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean };
  /** A plain notification at each prayer time (default on). Independent of the
   *  adhan SOUND: adhan on ⇒ that notification plays the adhan; adhan off but this
   *  on ⇒ a standard prayer notification; both off ⇒ nothing at prayer time. */
  prayerNotif: boolean;
  prePrayer: boolean;
  iqamah: boolean;
  todaysVerse: boolean;
  todaysHadith: boolean;
  todaysReminder: boolean;
  morningAdhkar: boolean;
  eveningAdhkar: boolean;
  streak: boolean;
  dhikrReminders: boolean;
  dhikrIntervalHours: number;
  jumuah: boolean;
  ramadan: boolean;
  laylatulQadr: boolean;
  aiChatResponses: boolean;
  continueReading: boolean;
};

const defaultNotificationPrefs: NotificationPrefs = {
  // Everything ON by default EXCEPT the adhan SOUND — a plain prayer-time
  // notification fires by default (prayerNotif); turning adhan on upgrades that
  // notification to play the long adhan sound. All other reminders default on.
  adhanEnabled: false,
  adhanPerPrayer: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  prayerNotif: true,
  prePrayer: true,
  iqamah: true,
  todaysVerse: true,
  todaysHadith: true,
  todaysReminder: true,
  morningAdhkar: true,
  eveningAdhkar: true,
  streak: true,
  dhikrReminders: true,
  dhikrIntervalHours: 4,
  jumuah: true,
  ramadan: true,
  laylatulQadr: true,
  aiChatResponses: true,
  continueReading: true,
};

export function getNotificationPrefs(): NotificationPrefs {
  const stored = get<Partial<NotificationPrefs>>(KEYS.notifications, {});
  return { ...defaultNotificationPrefs, ...stored };
}

export function setNotificationPrefs(prefs: Partial<NotificationPrefs>) {
  const current = getNotificationPrefs();
  set(KEYS.notifications, { ...current, ...prefs });
}

// ─── Hijri date helpers (auto-detect Ramadan / Laylatul Qadr) ──

export function getCurrentHijriMonthDay(): { month: number; day: number; year: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(new Date());
    const month = Number(parts.find((p) => p.type === "month")?.value ?? 0);
    const day = Number(parts.find((p) => p.type === "day")?.value ?? 0);
    const year = Number((parts.find((p) => p.type === "year")?.value ?? "0").replace(/\D/g, "")) || 0;
    return { month, day, year };
  } catch {
    return { month: 0, day: 0, year: 0 };
  }
}

/** True when current Hijri date is in the month of Ramadan (9th month). */
export function isRamadanActive(): boolean {
  return getCurrentHijriMonthDay().month === 9;
}

/** True when in the last 10 nights of Ramadan (day >= 20). */
export function isLaylatulQadrSeason(): boolean {
  const { month, day } = getCurrentHijriMonthDay();
  return month === 9 && day >= 20;
}

// ─── Prayer settings ───────────────────────────────────────────

export type PrayerCalcMethod =
  | 1 // University of Islamic Sciences, Karachi
  | 2 // Islamic Society of North America (ISNA)
  | 3 // Muslim World League (MWL)
  | 4 // Umm Al-Qura, Makkah
  | 5 // Egyptian General Authority
  | 7 // Institute of Geophysics, Tehran
  | 8 // Gulf Region
  | 9 // Kuwait
  | 10 // Qatar
  | 11 // Majlis Ugama Islam Singapura
  | 12 // Union Organization Islamic de France
  | 13 // Diyanet (Turkey)
  | 14 // Spiritual Administration of Muslims (Russia)
  | 15; // Moonsighting Committee Worldwide

export type AsrMethod = "standard" | "hanafi"; // standard = shafi/maliki/hanbali, hanafi = later

export type PrayerSettings = {
  calcMethod: PrayerCalcMethod;
  asrMethod: AsrMethod;
  locationMode: "auto" | "manual";
  manualCity?: string;
  manualCountry?: string;
};

const defaultPrayerSettings: PrayerSettings = {
  calcMethod: 2,
  asrMethod: "standard",
  locationMode: "auto",
};

export function getPrayerSettings(): PrayerSettings {
  const stored = get<Partial<PrayerSettings>>(KEYS.prayerSettings, {});
  return { ...defaultPrayerSettings, ...stored };
}

export function setPrayerSettings(s: Partial<PrayerSettings>) {
  const current = getPrayerSettings();
  set(KEYS.prayerSettings, { ...current, ...s });
}

// ─── Home preferences (style + onboarding "tuned for") ─────────────

export type HomeStyle = "daily-path" | "classic" | "focus";
export type TunedFor = "prayer" | "hifz" | "new-muslim" | "family" | "exploring";

export type HomePrefs = {
  homeStyle: HomeStyle;
  tunedFor: TunedFor;
  ramadanAuto: boolean; // auto-switch Home to Ramadan mode during Ramadan
};

const defaultHomePrefs: HomePrefs = {
  homeStyle: "daily-path",
  tunedFor: "exploring",
  // Auto-activate the Ramadan home during Ramadan (Hijri month 9).
  ramadanAuto: true,
};

export function getHomePrefs(): HomePrefs {
  const stored = get<Partial<HomePrefs>>(KEYS.homePrefs, {});
  return { ...defaultHomePrefs, ...stored };
}

export function setHomePrefs(p: Partial<HomePrefs>) {
  const current = getHomePrefs();
  set(KEYS.homePrefs, { ...current, ...p });
  // Let the mounted Home re-read prefs immediately (e.g. the onboarding tune
  // step, or the Settings home-style/tuned-for pickers) instead of waiting for
  // a remount.
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("hiqmah:home-prefs"));
    } catch {
      // ignore — non-browser env
    }
  }
}

export function clearAllLocalData() {
  if (typeof window === "undefined") return;
  for (const k of Object.values(KEYS)) {
    try {
      localStorage.removeItem(k);
    } catch {
      // ignore
    }
  }
}

export function exportBookmarksJSON(): string {
  const bookmarks = getBookmarks();
  return JSON.stringify(bookmarks, null, 2);
}

export function recordVisit(): VisitStats {
  const today = todayKey();
  const stats = getVisitStats();
  if (stats.lastVisit === today) return stats;
  let newStreak = 1;
  if (stats.lastVisit && stats.lastVisit === dayBefore(today)) {
    newStreak = stats.currentStreak + 1;
  }
  const next: VisitStats = {
    lastVisit: today,
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, stats.longestStreak),
  };
  set(KEYS.visits, next);
  return next;
}

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
  // Switching surahs: drop the old verse so lastSurah/lastVerse never disagree.
  if (progress.lastSurah !== surahId) progress.lastVerse = undefined;
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

// ─── Quran reader (native) view + display prefs ───

export type QuranView = "mushaf" | "focus";
export type QuranDisplay = { arabic: boolean; translation: boolean; translit: boolean };

export function getQuranView(): QuranView {
  return get<QuranView>(KEYS.quranView, "mushaf");
}
export function setQuranView(v: QuranView) {
  set(KEYS.quranView, v);
}
export function getQuranDisplay(): QuranDisplay {
  return get<QuranDisplay>(KEYS.quranDisplay, { arabic: true, translation: true, translit: false });
}
export function setQuranDisplay(d: QuranDisplay) {
  set(KEYS.quranDisplay, d);
}

// ─── Kids Learning ───

export type AgeGroup = "little" | "explorer" | "scholar";

export type KidsProgress = {
  ageGroup: AgeGroup;
  stars: number;
  streak: number;
  lastActiveDate: string; // ISO date YYYY-MM-DD
  completedLessons: string[];
  memorizedSurahs: number[];
  flashcardBuckets: Record<string, number>; // cardId -> bucket (0=new, 1=learning, 2=mastered)
  flashcardNextReview: Record<string, string>; // cardId -> ISO date
  dailyChecklist: Record<string, boolean>; // "YYYY-MM-DD:itemId" -> true
  badges: string[];
  quizScores: Record<string, number>; // quizId -> best score percentage
};

const defaultKidsProgress: KidsProgress = {
  ageGroup: "explorer",
  stars: 0,
  streak: 0,
  lastActiveDate: "",
  completedLessons: [],
  memorizedSurahs: [],
  flashcardBuckets: {},
  flashcardNextReview: {},
  dailyChecklist: {},
  badges: [],
  quizScores: {},
};

export function getKidsProgress(): KidsProgress {
  return { ...defaultKidsProgress, ...get<Partial<KidsProgress>>(KEYS.kidsProgress, {}) };
}

export function updateKidsProgress(updates: Partial<KidsProgress>) {
  const current = getKidsProgress();
  set(KEYS.kidsProgress, { ...current, ...updates });
}

export function addKidsStars(count: number = 1) {
  const p = getKidsProgress();
  updateKidsProgress({ stars: p.stars + count });
}

export function markKidsLessonComplete(lessonId: string) {
  const p = getKidsProgress();
  if (!p.completedLessons.includes(lessonId)) {
    updateKidsProgress({ completedLessons: [...p.completedLessons, lessonId] });
  }
}

export function addKidsBadge(badgeId: string) {
  const p = getKidsProgress();
  if (!p.badges.includes(badgeId)) {
    updateKidsProgress({ badges: [...p.badges, badgeId] });
  }
}

export function updateKidsStreak() {
  const p = getKidsProgress();
  const today = new Date().toISOString().split("T")[0];
  if (p.lastActiveDate === today) return; // already updated today

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newStreak = p.lastActiveDate === yesterday ? p.streak + 1 : 1;
  updateKidsProgress({ streak: newStreak, lastActiveDate: today });
}

export function toggleKidsChecklist(itemId: string, date: string) {
  const p = getKidsProgress();
  const key = `${date}:${itemId}`;
  const updated = { ...p.dailyChecklist };
  if (updated[key]) {
    delete updated[key];
  } else {
    updated[key] = true;
  }
  updateKidsProgress({ dailyChecklist: updated });
}
