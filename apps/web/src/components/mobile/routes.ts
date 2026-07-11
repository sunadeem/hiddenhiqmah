// Primary bottom-tab destinations that behave as roots: no global back button and
// no edge-swipe-back (you switch away via the tab bar). /hifz owns its header and
// drives its own in-screen sub-view back, so it belongs here. NOTE: /ask is a visual
// tab but intentionally NOT listed — it has no in-header back control, so it relies
// on edge-swipe-back to return to a deep-link origin (e.g. the Qur'an word-tutor →
// the exact āyah). Listing it would strand that flow. (Circles moved off the tab bar
// — it's now a normal sub-page reached from the Home card + the More menu.)
export const TAB_ROOTS = ["/", "/hifz", "/quran", "/more"];

const SECTION_TITLES: Record<string, string> = {
  "/": "Hidden Hiqmah",
  "/quran": "Quran",
  "/hadith": "Hadith",
  "/salah": "Salah",
  "/muslim-daily": "Daily",
  "/streaks": "Streak",
  "/circles": "Circles",
  "/hifz": "Your Path",
  "/family": "Family",
  "/household": "Family Profiles",
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
  "/qiblah": "Qiblah",
  "/protection": "Protection & Ruqyah",
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
