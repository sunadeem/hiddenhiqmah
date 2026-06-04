export const TAB_ROOTS = ["/", "/quran", "/hadith", "/salah", "/muslim-daily"];

const SECTION_TITLES: Record<string, string> = {
  "/": "Hidden Hiqmah",
  "/quran": "Quran",
  "/hadith": "Hadith",
  "/salah": "Salah",
  "/muslim-daily": "Daily",
  "/family": "Family",
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

export function getActiveTab(pathname: string): string | null {
  if (pathname === "/") return "/";
  for (const root of TAB_ROOTS) {
    if (root !== "/" && pathname.startsWith(root)) return root;
  }
  return null;
}
