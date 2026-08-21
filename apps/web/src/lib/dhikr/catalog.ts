// Catalog of common adhkār a user can add as a dhikr card. The `key` is the
// shared dhikrKey the counters write through — so counting a catalog dhikr in
// the Worship tab, the /dhikr page, or anywhere else all roll up to the same
// total (and into Dhikr Stats). Keys here intentionally match the ones already
// used by the Worship tab + /dhikr page so nothing double-counts.
//
// SCOPE: single-sentence adhkār only, so every dhikr card stays a consistent
// size. A few (the full tahlil, the post-Fajr tahlil) wrap to two lines, which
// the cards handle; longer multi-line supplications are still excluded — those
// belong on the Du'as page, not on a counter card.
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
    key: "tahlil_full",
    label: "La ilaha illallah (full tahlil)",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    translit:
      "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    english:
      "None has the right to be worshipped except Allah alone, without any partner. To Him belongs the dominion and to Him belongs all praise, and He is over all things capable",
    reference: "Bukhari 80:98, Muslim 5:188",
    defaultGoal: 100,
  },
  {
    key: "tahlil_fajr",
    label: "Tahlil after Fajr",
    arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    // ⛔ MUST STAY === SAY_TRANSLIT["tahlil-ten"] on /small-deeds. This entry's
    // `arabic` is byte-identical (===) to that block's, two rows of that page
    // link here, and it shipped four divergent tokens for the one string of
    // Arabic (sharika/shareeka, hamd/hamdu, yumit/yumeetu, qadir/qadeer). This
    // is the duas.json spelling, which #tahlil_full above already carries.
    // Asserted by apps/web/scripts/verify-small-deeds-translit.mjs.
    translit:
      "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu yuhyi wa yumeetu wa huwa 'ala kulli shay'in qadeer",
    english:
      "There is no god but Allah alone, with no partner; His is the dominion and His is the praise; He gives life and causes death, and He is over all things capable — ten times after Fajr, before speaking",
    reference: "Tirmidhi 48:105",
    defaultGoal: 10,
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
  {
    key: "dua_yunus",
    label: "La ilaha illa anta (Du'a of Yunus)",
    arabic: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    translit: "La ilaha illa anta, subhanaka inni kuntu minaz-zalimeen",
    english: "There is no god but You, glory be to You. Indeed, I have been of the wrongdoers",
    reference: "Quran 21:87, Tirmidhi 48:136",
    defaultGoal: 3,
  },
  {
    key: "raditu_billah",
    label: "Raditu billahi Rabban",
    arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالإِسْلاَمِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا",
    translit: "Raditu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin nabiyya",
    english:
      "I am pleased with Allah as my Lord, Islam as my religion, and Muhammad ﷺ as my Prophet — said morning and evening",
    reference: "Tirmidhi 48:20, Abu Dawud 43:300",
    defaultGoal: 3,
  },
  {
    key: "bismillah_la_yadurru",
    label: "Bismillahil-ladhi la yadurru",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    translit:
      "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim",
    english:
      "In the name of Allah, with whose name nothing on earth or in heaven can cause harm — three times, morning and evening",
    reference: "Abu Dawud 43:316, Tirmidhi 48:19",
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
