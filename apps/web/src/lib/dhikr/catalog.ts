// Catalog of common adhkār a user can add as a dhikr card. The `key` is the
// shared dhikrKey the counters write through — so counting a catalog dhikr in
// the Worship tab, the /dhikr page, or anywhere else all roll up to the same
// total (and into Dhikr Stats). Keys here intentionally match the ones already
// used by the Worship tab + /dhikr page so nothing double-counts.
//
// SCOPE: intentionally SHORT (one-line arabic) adhkār only, so every dhikr card
// stays a consistent size. Longer multi-line supplications don't render well as
// uniform counter cards, so they're deliberately excluded.
//
// `english` and `reference` power the /dhikr cards (translation + source line).
// A `reference` is only set when it was verified against the app's local Quran
// (packages/content/quran/verses) or hadith (packages/content/hadith) data —
// never guessed.

export interface DhikrCatalogEntry {
  key: string;
  label: string;
  arabic: string;
  translit: string;
  english: string;
  reference?: string;
  defaultGoal: number;
}

export const DHIKR_CATALOG: DhikrCatalogEntry[] = [
  {
    key: "subhanallah",
    label: "SubhanAllah",
    arabic: "سُبْحَانَ اللَّٰه",
    translit: "SubhanAllah",
    english: "Glory be to Allah",
    reference: "Muslim 5:184",
    defaultGoal: 33,
  },
  {
    key: "alhamdulillah",
    label: "Alhamdulillah",
    arabic: "الْحَمْدُ لِلَّٰه",
    translit: "Alhamdulillah",
    english: "Praise be to Allah",
    reference: "Muslim 5:184",
    defaultGoal: 33,
  },
  {
    key: "takbir",
    label: "Allahu Akbar",
    arabic: "اللَّٰهُ أَكْبَر",
    translit: "Allahu Akbar",
    english: "Allah is the Greatest",
    reference: "Muslim 5:184",
    defaultGoal: 34,
  },
  {
    key: "tahlil",
    label: "La ilaha illallah",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّٰه",
    translit: "La ilaha illallah",
    english: "There is no god but Allah",
    reference: "Bukhari 80:98",
    defaultGoal: 100,
  },
  {
    key: "istighfar",
    label: "Astaghfirullah",
    arabic: "أَسْتَغْفِرُ اللَّٰه",
    translit: "Astaghfirullah",
    english: "I seek forgiveness from Allah",
    reference: "Bukhari 80:4",
    defaultGoal: 100,
  },
  {
    key: "istighfar_atub",
    label: "Astaghfirullah wa atubu ilayh",
    arabic: "أَسْتَغْفِرُ اللَّٰهَ وَأَتُوبُ إِلَيْه",
    translit: "Astaghfirullah wa atubu ilayh",
    english: "I seek Allah's forgiveness and turn to Him in repentance",
    reference: "Bukhari 80:4",
    defaultGoal: 100,
  },
  {
    key: "salawat",
    label: "Salawat on the Prophet ﷺ",
    arabic: "اللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّد",
    translit: "Allahumma salli ala Muhammad",
    english: "O Allah, send blessings upon Muhammad",
    reference: "Muslim 4:74",
    defaultGoal: 10,
  },
  {
    key: "subhanallah_hamd",
    label: "SubhanAllah wa bihamdihi",
    arabic: "سُبْحَانَ اللَّٰهِ وَبِحَمْدِه",
    translit: "SubhanAllahi wa bihamdihi",
    english: "Glory and praise be to Allah",
    reference: "Bukhari 80:100",
    defaultGoal: 100,
  },
  {
    key: "subhanallah_azim",
    label: "SubhanAllah al-'Azim",
    arabic: "سُبْحَانَ اللَّٰهِ الْعَظِيم",
    translit: "SubhanAllahil-'Azim",
    english: "Glory be to Allah, the Magnificent",
    reference: "Bukhari 83:59",
    defaultGoal: 100,
  },
  {
    key: "hawqala",
    label: "La hawla wa la quwwata illa billah",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّٰه",
    translit: "La hawla wa la quwwata illa billah",
    english: "There is no power except with Allah",
    reference: "Bukhari 80:79",
    defaultGoal: 100,
  },
  {
    key: "tasbih_fatimah_hamd",
    label: "Alhamdulillah (Tasbih Fatimah)",
    arabic: "الْحَمْدُ لِلَّٰه",
    translit: "Alhamdulillah",
    english: "Praise be to Allah — the Tasbih of Fatimah",
    reference: "Bukhari 80:15",
    defaultGoal: 33,
  },
  {
    key: "hasbunallah",
    label: "Hasbunallah wa ni'mal wakeel",
    arabic: "حَسْبُنَا اللَّٰهُ وَنِعْمَ الْوَكِيل",
    translit: "Hasbunallahu wa ni'mal wakeel",
    english: "Allah is sufficient for us, and He is the best Disposer of affairs",
    reference: "Quran 3:173",
    defaultGoal: 100,
  },
  {
    key: "hasbiyallah",
    label: "Hasbiyallahu la ilaha illa huwa",
    arabic: "حَسْبِيَ اللَّٰهُ لَا إِلَٰهَ إِلَّا هُو",
    translit: "Hasbiyallahu la ilaha illa huwa",
    english: "Allah is sufficient for me; there is no god but Him",
    reference: "Quran 9:129",
    defaultGoal: 7,
  },
  {
    key: "rabbi_zidni_ilma",
    label: "Rabbi zidni 'ilma",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    translit: "Rabbi zidni 'ilma",
    english: "My Lord, increase me in knowledge",
    reference: "Quran 20:114",
    defaultGoal: 3,
  },
];

export const DHIKR_CATALOG_BY_KEY: Record<string, DhikrCatalogEntry> = Object.fromEntries(
  DHIKR_CATALOG.map((d) => [d.key, d])
);

// The Worship tab's built-in cards (always present, not deletable). Goals match
// what shipped before this feature so existing users see no change.
export const DEFAULT_WORSHIP_DHIKR: { key: string; goal: number }[] = [
  { key: "takbir", goal: 33 },
  { key: "subhanallah", goal: 33 },
  { key: "alhamdulillah", goal: 33 },
  { key: "istighfar", goal: 100 },
  { key: "salawat", goal: 10 },
];
