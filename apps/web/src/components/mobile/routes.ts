export const TAB_ROOTS = ["/", "/circles", "/quran", "/more"];

const SECTION_TITLES: Record<string, string> = {
  "/": "Hidden Hiqmah",
  "/quran": "Quran",
  "/hadith": "Hadith",
  "/salah": "Salah",
  "/muslim-daily": "Daily",
  "/streaks": "Streak",
  "/circles": "Circles",
  "/family": "Family",
  "/household": "Family",
  "/marriage": "Marriage",
  "/sects": "Sects",
  "/prophets": "Prophets",
  "/prophet-muhammad": "Muhammad",
  "/story-of-creation": "Story of Creation",
  "/ramadan": "Ramadan",
  "/jannah": "Jannah",
  "/day-of-judgement": "Judgement Day",
  "/barzakh": "Barzakh",
  "/dhikr": "Dhikr",
  "/duas": "Du'as",
  "/tawhid": "Tawhid",
  "/articles-of-faith": "Articles of Faith",
  "/pillars": "Five Pillars",
  "/kids": "Kids",
  "/learn-arabic": "Arabic",
  "/quiz": "Quizzes",
  "/miracles": "Miracles",
  "/why-islam": "Why Islam",
  "/resources": "Resources",
  "/islamic-calendar": "Calendar",
  "/bookmarks": "Bookmarks",
  "/ask": "Ask",
  "/more": "More",
  "/prayer-times": "Prayer Times",
};

export function getSectionTitle(pathname: string): string {
  if (SECTION_TITLES[pathname]) return SECTION_TITLES[pathname];
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const root = "/" + segments[0];
    if (SECTION_TITLES[root]) return SECTION_TITLES[root];
  }
  return "Hidden Hiqmah";
}

export function isTabRoot(pathname: string): boolean {
  return TAB_ROOTS.includes(pathname);
}

// Non-tab routes that intentionally hide the global back button — the user
// navigates back via Home instead. (e.g. the Daily checklist.)
const NO_BACK_ROUTES = ["/muslim-daily"];

export function suppressesBack(pathname: string): boolean {
  return NO_BACK_ROUTES.includes(pathname);
}

// Routes whose screen renders its OWN header (with a back button). The global
// MobileTopBar back button is suppressed for these to avoid a double back.
// ▶ When you add a screen that owns its top bar, add one pattern here.
export const OWN_HEADER_PATTERNS: RegExp[] = [
  /^\/quran\/[^/]+/, // surah reader — its own top bar (back + title + settings)
  /^\/ask$/, // full-screen Ask chat — own header + back
  /^\/hifz(?:\/|$)/, // Hifz coach — back also drives its in-screen sub-views
];

/** True when the screen at this path renders its own header/back bar. */
export function ownsHeader(pathname: string): boolean {
  return OWN_HEADER_PATTERNS.some((re) => re.test(pathname));
}

export function getActiveTab(pathname: string): string | null {
  if (pathname === "/") return "/";
  for (const root of TAB_ROOTS) {
    if (root !== "/" && pathname.startsWith(root)) return root;
  }
  return null;
}
