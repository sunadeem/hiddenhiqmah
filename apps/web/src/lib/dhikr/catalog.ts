// Catalog of common adhkār a user can add as a dhikr card. The `key` is the
// shared dhikrKey the counters write through — so counting a catalog dhikr in
// the Worship tab, the /dhikr page, or anywhere else all roll up to the same
// total (and into Dhikr Stats). Keys here intentionally match the ones already
// used by the Worship tab + /dhikr page so nothing double-counts.

export interface DhikrCatalogEntry {
  key: string;
  label: string;
  arabic: string;
  translit: string;
  defaultGoal: number;
}

export const DHIKR_CATALOG: DhikrCatalogEntry[] = [
  { key: "subhanallah", label: "SubhanAllah", arabic: "سُبْحَانَ اللَّٰه", translit: "SubhanAllah", defaultGoal: 33 },
  { key: "alhamdulillah", label: "Alhamdulillah", arabic: "الْحَمْدُ لِلَّٰه", translit: "Alhamdulillah", defaultGoal: 33 },
  { key: "takbir", label: "Allahu Akbar", arabic: "اللَّٰهُ أَكْبَر", translit: "Allahu Akbar", defaultGoal: 34 },
  { key: "tahlil", label: "La ilaha illallah", arabic: "لَا إِلَٰهَ إِلَّا اللَّٰه", translit: "La ilaha illallah", defaultGoal: 100 },
  { key: "istighfar", label: "Astaghfirullah", arabic: "أَسْتَغْفِرُ اللَّٰه", translit: "Astaghfirullah", defaultGoal: 100 },
  { key: "istighfar_atub", label: "Astaghfirullah wa atubu ilayh", arabic: "أَسْتَغْفِرُ اللَّٰهَ وَأَتُوبُ إِلَيْه", translit: "Astaghfirullah wa atubu ilayh", defaultGoal: 100 },
  { key: "salawat", label: "Salawat on the Prophet ﷺ", arabic: "اللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّد", translit: "Allahumma salli ala Muhammad", defaultGoal: 10 },
  { key: "subhanallah_hamd", label: "SubhanAllah wa bihamdihi", arabic: "سُبْحَانَ اللَّٰهِ وَبِحَمْدِه", translit: "SubhanAllahi wa bihamdihi", defaultGoal: 100 },
  { key: "subhanallah_azim", label: "SubhanAllah al-'Azim", arabic: "سُبْحَانَ اللَّٰهِ الْعَظِيم", translit: "SubhanAllahil-'Azim", defaultGoal: 100 },
  { key: "hawqala", label: "La hawla wa la quwwata illa billah", arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّٰه", translit: "La hawla wa la quwwata illa billah", defaultGoal: 100 },
  { key: "hasbunallah", label: "Hasbunallah wa ni'mal wakeel", arabic: "حَسْبُنَا اللَّٰهُ وَنِعْمَ الْوَكِيل", translit: "Hasbunallahu wa ni'mal wakeel", defaultGoal: 100 },
  { key: "hasbiyallah", label: "Hasbiyallahu la ilaha illa huwa", arabic: "حَسْبِيَ اللَّٰهُ لَا إِلَٰهَ إِلَّا هُو", translit: "Hasbiyallahu la ilaha illa huwa", defaultGoal: 7 },
  { key: "tasbih_fatimah_hamd", label: "Alhamdulillah (Tasbih Fatimah)", arabic: "الْحَمْدُ لِلَّٰه", translit: "Alhamdulillah", defaultGoal: 33 },
  { key: "sayyidul_istighfar", label: "Sayyidul Istighfar", arabic: "اللَّٰهُمَّ أَنْتَ رَبِّي", translit: "Allahumma anta Rabbi…", defaultGoal: 1 },
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
