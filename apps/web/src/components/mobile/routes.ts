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
  "/death-rites": "Death & Janazah",
  "/inheritance": "Inheritance",
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

// Routes whose vertical position is owned by the screen itself. Scroll
// restoration neither captures nor restores these, so they never even enter the
// store — a pathname-keyed restore would race their own positioning.
export const RESTORE_EXEMPT_PATTERNS: RegExp[] = [
  /^\/ask$/, // <main> is overflow-hidden; the real scroller is inside the page
  /^\/quran\/[^/]+/, // the reader restores its own verse position (fonts.ready + rAF)
  /^\/signin$/,
  /^\/auth\//,
];

// Query keys that mean "open this page scrolled to a specific thing". Traversing
// back to such a URL re-runs the page's own scrollIntoView, so restoring first
// would show a visible travel from the restored offset to the target.
// ▶ This list is the ONLY thing standing between a position-carrying URL and a
// restore that the page then visibly undoes. Every key here has a matching
// scrollIntoView: d → duas/page.tsx:134, h → hadith/[collection]/[book]/
// PageClient.tsx:142, item → dhikr/page.tsx:686, name → tawhid/page.tsx:453,
// v → quran/[id] (also covered by the pathname pattern), section →
// useScrollToSection. Omitting `h` cost a measured 9,061px yank: a back into
// /hadith/muslim/6?h=319 painted the restored 77918 for ~300ms at full opacity,
// then the page's own 500ms timer dragged it to 86980.
const DEEP_LINK_PARAMS = ["d", "section", "v", "item", "h", "name"];

/** True when scroll position for this location must be left entirely alone. */
export function isRestoreExempt(pathname: string, search = "", hash = ""): boolean {
  if (RESTORE_EXEMPT_PATTERNS.some((re) => re.test(pathname))) return true;
  if (hash.length > 1) return true; // #anchor — the browser/page owns the position
  if (search.length > 1) {
    const params = new URLSearchParams(search);
    if (DEEP_LINK_PARAMS.some((k) => params.has(k))) return true;
  }
  return false;
}

export function getActiveTab(pathname: string): string | null {
  if (pathname === "/") return "/";
  for (const root of TAB_ROOTS) {
    if (root !== "/" && pathname.startsWith(root)) return root;
  }
  return null;
}
