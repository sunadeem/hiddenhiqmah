// Catalog of common adhkār a user can add as a dhikr card. The `key` is the
// shared dhikrKey the counters write through — so counting a catalog dhikr in
// the Worship tab, the /dhikr page, or anywhere else all roll up to the same
// total (and into Dhikr Stats). Keys here intentionally match the ones already
// used by the Worship tab + /dhikr page so nothing double-counts.
//
// `english` and `reference` power the /dhikr cards (translation + source line).
// A `reference` is only set when it was verified against the app's local Quran
// (packages/content/quran/verses) or hadith (packages/content/hadith) data —
// never guessed. Entries without a confidently-sourced reference intentionally
// omit it: a card with a translation but no reference is fine; a wrong one isn't.

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
    label: "La ilaha illallahu wahdahu…",
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِير",
    translit:
      "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir",
    english:
      "There is no god but Allah alone, without partner; His is the dominion and His is the praise, and He has power over all things",
    reference: "Bukhari 59:102",
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
    key: "salawat_ibrahimiyya",
    label: "Salawat Ibrahimiyya",
    arabic:
      "اللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيد",
    translit:
      "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahim…",
    english:
      "O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Abraham and the family of Abraham; indeed You are Praiseworthy, Glorious",
    reference: "Bukhari 60:44",
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
    key: "subhanallah_khalqihi",
    label: "SubhanAllah wa bihamdihi 'adada khalqih…",
    arabic:
      "سُبْحَانَ اللَّٰهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِه",
    translit:
      "SubhanAllahi wa bihamdihi, 'adada khalqih, wa rida nafsih, wa zinata 'arshih, wa midada kalimatih",
    english:
      "Glory and praise be to Allah, as many as the number of His creation, as much as pleases Him, as much as the weight of His Throne, and as much as the ink of His words",
    reference: "Muslim 48:106",
    defaultGoal: 3,
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
    key: "sayyidul_istighfar",
    label: "Sayyidul Istighfar",
    arabic:
      "اللَّٰهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْت",
    translit:
      "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't…",
    english:
      "O Allah, You are my Lord; there is no god but You. You created me and I am Your servant. I seek refuge in You from the evil I have done. Forgive me, for none forgives sins but You",
    reference: "Bukhari 80:3",
    defaultGoal: 1,
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
    key: "dua_yunus",
    label: "Du'a of Yunus",
    arabic: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِين",
    translit: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    english:
      "There is no god but You; glory be to You. Indeed, I have been among the wrongdoers",
    reference: "Quran 21:87",
    defaultGoal: 3,
  },
  {
    key: "rabbana_atina",
    label: "Rabbana atina fid-dunya hasanah",
    arabic:
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّار",
    translit:
      "Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina 'adhaban-nar",
    english:
      "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire",
    reference: "Quran 2:201",
    defaultGoal: 3,
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
    key: "bismillah_protect",
    label: "Bismillahilladhi la yadurru…",
    arabic:
      "بِسْمِ اللَّٰهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيم",
    translit:
      "Bismillahilladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim",
    english:
      "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing",
    reference: "Abu Dawud 43:316",
    defaultGoal: 3,
  },
  {
    key: "audhu_kalimat",
    label: "A'udhu bikalimatillahit-tammat",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّٰهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَق",
    translit: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    english:
      "I seek refuge in the perfect words of Allah from the evil of what He created",
    reference: "Tirmidhi 48:236",
    defaultGoal: 3,
  },
  {
    key: "radeetu",
    label: "Radeetu billahi Rabban",
    arabic:
      "رَضِيتُ بِاللَّٰهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ رَسُولًا",
    translit: "Radeetu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin ﷺ rasula",
    english:
      "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Messenger",
    reference: "Abu Dawud 8:114",
    defaultGoal: 3,
  },
  {
    key: "salam_dhikr",
    label: "Allahumma antas-Salam",
    arabic:
      "اللَّٰهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَام",
    translit: "Allahumma antas-Salamu wa minkas-salam, tabarakta ya Dhal-jalali wal-ikram",
    english:
      "O Allah, You are Peace and from You is peace. Blessed are You, O Owner of Majesty and Honour",
    reference: "Ibn Majah 5:126",
    defaultGoal: 1,
  },
  {
    key: "ainni_dhikrika",
    label: "Rabbi a'inni 'ala dhikrik",
    arabic: "رَبِّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِك",
    translit: "Rabbi a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
    english:
      "My Lord, help me to remember You, to give thanks to You, and to worship You well",
    reference: "Nasai 13:125",
    defaultGoal: 1,
  },
  {
    key: "hammi_hazan",
    label: "Allahumma inni a'udhu bika minal-hamm",
    arabic:
      "اللَّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْبُخْلِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَال",
    translit:
      "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-jubni wal-bukhl, wa dala'id-dayni wa ghalabatir-rijal",
    english:
      "O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from cowardice and miserliness, from being heavily in debt and from being overpowered by men",
    reference: "Bukhari 80:66",
    defaultGoal: 1,
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
