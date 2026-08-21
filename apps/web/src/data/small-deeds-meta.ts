/**
 * /small-deeds — title, slug and nav strings ONLY.
 *
 * ⛔ THIS FILE MUST STAY A LEAF. home-content.ts imports it for the nav entry,
 * and home-content.ts feeds Sidebar, which is in the root layout — so whatever
 * this module pulls in ships in the chunk that EVERY page of the site and the
 * app loads. It used to live in ./small-deeds, which cost every page ~16 kB of
 * serialised deed text (apps/web has no `"sideEffects": false`, so Turbopack
 * does not elide the unused half of the module). Import nothing here.
 *
 * THE ONE STRING. PAGE_TITLE is rendered by the page header and by the nav
 * entry — change it here and both move. The founder's phrase for this page was
 * "Islamic Cheat Codes"; the proposed alternative, in the Prophet's own image
 * for exactly this category of deed, is "Heavy on the Scale" — "two expressions
 * which are very easy for the tongue to say, but they are very heavy in the
 * balance" (Bukhari 80:101, the page's opening quote). Shipping with the working
 * title until the founder decides.
 */
export const PAGE_TITLE = "Small Deeds, Great Reward";
export const PAGE_TITLE_AR = "الأعمال الصغيرة";
export const PAGE_SUBTITLE =
  "Little acts the Prophet ﷺ tied to enormous reward — what each one asks of you, what is promised, and where it is narrated.";
export const PAGE_NAV_DESCRIPTION = "Little effort, enormous reward";
/** Bookmarks and ?section= links persist this — never rename it. */
export const PAGE_SLUG = "/small-deeds";
