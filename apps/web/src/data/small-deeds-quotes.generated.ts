// GENERATED FILE — DO NOT EDIT.
// Source: apps/web/scripts/verified-small-deeds.json (100/100 citations verified)
// Regenerate: node apps/web/scripts/gen-small-deeds-quotes.mjs
//
// Every string below was copied by machine out of packages/content/hadith and
// packages/content/quran. `english` is the stored field verbatim — including the
// places where the corpus ends a quotation without a closing quote or full stop.
// Do not "fix" those; they are the bytes the app's own hadith reader shows.
//
// `matn`  = the double-quoted segments sliced out of the stored `arabic`, i.e.
//           reported speech with the isnad and the collector's notes removed. A
//           matn segment is still THE NARRATION ("whoever says X gets Y"), not
//           the words to say — it is used for the page's opening quote only.
// `SAY`   = the words to say. A word-range cut out of one matn segment, asserted
//           at generation time to be a byte-exact substring of the stored Arabic.
//           Cuts fall on whitespace only, so no combining mark is ever split.

/** One narration, as stored. */
export type HadithQuote = {
  /** Short label for a Sources & References line. Descriptive, not a quotation. */
  practice: string;
  citation: string;
  english: string;
  matn: string[];
  /** The collector's own notes on this report follow the text inside the entry. */
  collectorNotes: boolean;
};

/** One ayah, byte-identical to what the app's Qur'an reader renders. */
export type AyahQuote = {
  practice: string;
  citation: string;
  textAr: string;
  textEn: string;
  textTranslit: string;
};

/** The words to say — never a whole narration. */
export type SayLine = {
  arabic: string;
  /** The narration the words were cut out of. Shown with the block. */
  citation: string;
  hadith: string;
};

/** Keys of SAY, as a union, so a deed cannot reference a Say block that is gone. */
export type SayId =
  | "sayyid-al-istighfar"
  | "subhanallah-100"
  | "two-words"
  | "tahlil-100"
  | "tahlil-ten"
  | "date-palm"
  | "four-words"
  | "tahlil-after-prayer"
  | "tasbih-hundredth"
  | "salawat";

export const HADITH: Record<string, HadithQuote> = {
  "white-days": {
    "practice": "White days 13/14/15 = perpetual fast",
    "citation": "Abu Dawud 14:137",
    "english": "Narrated Qatadah Ibn Malhan al-Qaysi: The Messenger of Allah (ﷺ) used to command us to fast the days of the white (nights): thirteenth, fourteenth and fifteenth of the month. He said: This is like keeping perpetual fast",
    "matn": [
      "هُنَّ كَهَيْئَةِ الدَّهْرِ"
    ],
    "collectorNotes": false
  },
  "white-days-tirmidhi": {
    "practice": "White days — the three named dates (Abu Dharr)",
    "citation": "Tirmidhi 8:80",
    "english": "Abu Dharr narrated that :the Messenger of Allah said: \"O Abu Dharr! When you fast three days out of a month, then fast the thirteenth, fourteenth, and fifteenth",
    "matn": [
      "يَا أَبَا ذَرٍّ إِذَا صُمْتَ مِنَ الشَّهْرِ ثَلاَثَةَ أَيَّامٍ فَصُمْ ثَلاَثَ عَشْرَةَ وَأَرْبَعَ عَشْرَةَ وَخَمْسَ عَشْرَةَ",
      "مَنْ صَامَ ثَلاَثَةَ أَيَّامٍ مِنْ كُلِّ شَهْرٍ كَانَ كَمَنْ صَامَ الدَّهْرَ"
    ],
    "collectorNotes": true
  },
  "six-shawwal": {
    "practice": "Ramadan + six of Shawwal",
    "citation": "Muslim 13:264",
    "english": "Abu Ayyub al-Ansari (Allah be pleased with him) reported Allah's Messenger (ﷺ) as saying:He who observed the fast of Ramadan and then followed it with six (fasts) of Shawwal. it would be as if he fasted perpetually",
    "matn": [
      "مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ سِتًّا مِنْ شَوَّالٍ كَانَ كَصِيَامِ الدَّهْرِ"
    ],
    "collectorNotes": false
  },
  "six-shawwal-abudawud": {
    "practice": "Six of Shawwal (Abu Dawud parallel)",
    "citation": "Abu Dawud 14:121",
    "english": "Narrated Abu Ayyub:The Prophet (ﷺ) as saying: If anyone fasts during Ramadan, then follows it with six days in Shawwal, it will be like a perpetual fast",
    "matn": [
      "مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ بِسِتٍّ مِنْ شَوَّالٍ فَكَأَنَّمَا صَامَ الدَّهْرَ"
    ],
    "collectorNotes": false
  },
  "six-shawwal-ibnmajah": {
    "practice": "Six of Shawwal (Ibn Majah parallel)",
    "citation": "Ibn Majah 7:79",
    "english": "It was narrated from Abu Ayyub that the Messenger of Allah (ﷺ) said:“Whoever fasts Ramadan then follows it with six days of Shawwal, it is as if he fasted for a lifetime.”",
    "matn": [
      "مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ بِسِتٍّ مِنْ شَوَّالٍ، كَانَ كَصَوْمِ الدَّهْرِ"
    ],
    "collectorNotes": false
  },
  "fast-one-day-70yrs": {
    "practice": "Fasting one day for Allah's sake -> Fire kept seventy years away",
    "citation": "Bukhari 56:56",
    "english": "Narrated Abu Sa`id:I heard the Prophet (ﷺ) saying, \"Indeed, anyone who fasts for one day for Allah's Pleasure, Allah will keep his face away from the (Hell) fire for (a distance covered by a journey of) seventy years",
    "matn": [
      "مَنْ صَامَ يَوْمًا فِي سَبِيلِ اللَّهِ بَعَّدَ اللَّهُ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفًا"
    ],
    "collectorNotes": false
  },
  "fast-one-day-muslim": {
    "practice": "Fasting one day (Muslim parallel)",
    "citation": "Muslim 13:217",
    "english": "Abu Sa'id al Khudri (Allah be pleased with him) reported Allah's Messenger (ﷺ) as saying:Every servant of Allah who observes fast for a day in the way of Allah, Allah would remove, because of this day, his face farther from the Fire (of Hell) to the extent of seventy years' distance",
    "matn": [
      "مَا مِنْ عَبْدٍ يَصُومُ يَوْمًا فِي سَبِيلِ اللَّهِ إِلاَّ بَاعَدَ اللَّهُ بِذَلِكَ الْيَوْمِ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفًا"
    ],
    "collectorNotes": false
  },
  "ashura": {
    "practice": "Fasting Ashura -> expiates the previous year",
    "citation": "Ibn Majah 7:101",
    "english": "It was narrated from Abu Qatadah that the Messenger of Allah (ﷺ) said:“Fasting the day of ‘Ashura’, I hope, will expiate for the sins of the previous year.”",
    "matn": [
      "صِيَامُ يَوْمِ عَاشُورَاءَ إِنِّي أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ"
    ],
    "collectorNotes": false
  },
  "dhul-hijjah-ten": {
    "practice": "First ten days of Dhul Hijjah",
    "citation": "Bukhari 13:18",
    "english": "Narrated Ibn `Abbas:The Prophet (ﷺ) said, \"No good deeds done on other days are superior to those done on these (first ten days of Dhul Hijja).\" Then some companions of the Prophet (ﷺ) said, \"Not even Jihad?\" He replied, \"Not even Jihad, except that of a man who does it by putting himself and his property in danger (for Allah's sake) and does not return with any of those things",
    "matn": [
      "مَا الْعَمَلُ فِي أَيَّامِ الْعَشْرِ أَفْضَلَ مِنَ الْعَمَلِ فِي هَذِهِ",
      "وَلاَ الْجِهَادُ، إِلاَّ رَجُلٌ خَرَجَ يُخَاطِرُ بِنَفْسِهِ وَمَالِهِ فَلَمْ يَرْجِعْ بِشَىْءٍ"
    ],
    "collectorNotes": false
  },
  "subhanallah-100": {
    "practice": "SubhanAllah wa bihamdihi x100 -> foam of the sea",
    "citation": "Bukhari 80:100",
    "english": "Narrated Abu Huraira:Allah's Messenger (ﷺ) said, \"Whoever says, 'Subhan Allah wa bihamdihi,' one hundred times a day, will be forgiven all his sins even if they were as much as the foam of the sea",
    "matn": [
      "مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ‏.‏ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ، وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ"
    ],
    "collectorNotes": false
  },
  "two-words-bukhari": {
    "practice": "Two words light on the tongue, heavy in the balance (Bukhari)",
    "citation": "Bukhari 80:101",
    "english": "Narrated Abu Huraira:The Prophet (ﷺ) said, \"There are two expressions which are very easy for the tongue to say, but they are very heavy in the balance and are very dear to The Beneficent (Allah), and they are, 'Subhan Allah Al- `Azim and 'Subhan Allah wa bihamdihi",
    "matn": [
      "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ، سُبْحَانَ اللَّهِ الْعَظِيمِ، سُبْحَانَ اللَّهِ وَبِحَمْدِهِ"
    ],
    "collectorNotes": false
  },
  "two-words-muslim": {
    "practice": "Two words (Muslim parallel)",
    "citation": "Muslim 48:41",
    "english": "Abu Huraira reported Allah's Messenger (ﷺ) as saying:Two are the expressions which are light on the tongue, but heavy in scale, dear to the Compassionate One:\" Hallowed be Allah and praise is due to Him\" ;\" Hallowed be Allah, the Great",
    "matn": [
      "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ"
    ],
    "collectorNotes": false
  },
  "two-words-tirmidhi": {
    "practice": "Two words (Tirmidhi parallel — 'heavy on the Scale')",
    "citation": "Tirmidhi 48:98",
    "english": "Abu Hurairah narrated that:The Messenger of Allah (ﷺ) said: “There are two statements that are light on the tongue, heavy on the Scale, and beloved to Ar-Raḥmān: “Glory is to Allah and the praise; Glory is to Allah, the Magnificent. (Subḥān Allāhi wa biḥamdih, Subḥān Allāhil-Aẓīm)”",
    "matn": [
      "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ"
    ],
    "collectorNotes": true
  },
  "two-words-ibnmajah": {
    "practice": "Two words (Ibn Majah parallel)",
    "citation": "Ibn Majah 33:150",
    "english": "It was narrated from Abu Hurairah that :the Messenger of Allah (ﷺ) said: 'Two words which are light on the tongue and heavy in the Balance, and beloved to the Most Merciful: Subhan-Allah wa bi hamdihi, Subhan-Allahil-'Azim (Glory and praise is to Allah, glory is to Allah the Almighty)",
    "matn": [
      "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ"
    ],
    "collectorNotes": false
  },
  "tahlil-100-bukhari": {
    "practice": "Tahlil x100 (Bukhari 80:98)",
    "citation": "Bukhari 80:98",
    "english": "Narrated Abu Huraira:Allah's Messenger (ﷺ) said,\" Whoever says: \"La ilaha illal-lah wahdahu la sharika lahu, lahu-l-mulk wa lahul- hamd wa huwa 'ala kulli shai'in qadir,\" one hundred times will get the same reward as given for manumitting ten slaves; and one hundred good deeds will be written in his accounts, and one hundred sins will be deducted from his accounts, and it (his saying) will be a shield for him from Satan on that day till night, and nobody will be able to do a better deed except the one who does more than he",
    "matn": [
      "مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ، وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهْوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ‏.‏ فِي يَوْمٍ مِائَةَ مَرَّةٍ، كَانَتْ لَهُ عَدْلَ عَشْرِ رِقَابٍ، وَكُتِبَ لَهُ مِائَةُ حَسَنَةٍ، وَمُحِيَتْ عَنْهُ مِائَةُ سَيِّئَةٍ، وَكَانَتْ لَهُ حِرْزًا مِنَ الشَّيْطَانِ يَوْمَهُ ذَلِكَ، حَتَّى يُمْسِيَ، وَلَمْ يَأْتِ أَحَدٌ بِأَفْضَلَ مِمَّا جَاءَ بِهِ إِلاَّ رَجُلٌ عَمِلَ أَكْثَرَ مِنْهُ"
    ],
    "collectorNotes": false
  },
  "tahlil-100-bukhari-59": {
    "practice": "Tahlil x100 (Bukhari 59:102)",
    "citation": "Bukhari 59:102",
    "english": "Narrated Abu Huraira:Allah's Messenger (ﷺ) said, \"If one says one-hundred times in one day: \"None has the right to be worshipped but Allah, the Alone Who has no partners, to Him belongs Dominion and to Him belong all the Praises, and He has power over all things (i.e. Omnipotent)\", one will get the reward of manumitting ten slaves, and one-hundred good deeds will be written in his account, and one-hundred bad deeds will be wiped off or erased from his account, and on that day he will be protected from the morning till evening from Satan, and nobody will be superior to him except one who has done more than that which he has done",
    "matn": [
      "مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ‏.‏ فِي يَوْمٍ مِائَةَ مَرَّةٍ، كَانَتْ لَهُ عَدْلَ عَشْرِ رِقَابٍ، وَكُتِبَتْ لَهُ مِائَةُ حَسَنَةٍ، وَمُحِيَتْ عَنْهُ مِائَةُ سَيِّئَةٍ، وَكَانَتْ لَهُ حِرْزًا مِنَ الشَّيْطَانِ يَوْمَهُ ذَلِكَ حَتَّى يُمْسِيَ، وَلَمْ يَأْتِ أَحَدٌ بِأَفْضَلَ مِمَّا جَاءَ بِهِ، إِلاَّ أَحَدٌ عَمِلَ أَكْثَرَ مِنْ ذَلِكَ"
    ],
    "collectorNotes": false
  },
  "tahlil-100-muslim": {
    "practice": "Tahlil x100 (Muslim parallel)",
    "citation": "Muslim 48:38",
    "english": "Abu Huraira reported Allah's Messenger (ﷺ) as saying:He who uttered these words:\" There is no god but Allah, the One, having no partner with Him. Sovereignty belongs to Him and all the praise is due to Him, and He is Potent over everything\" one hundred times every day there is a reward of emancipating ten slaves for him, and there are recorded hundred virtues to his credit, and hundred vices are blotted out from his scroll, and that is a safeguard for him against the Satan on that day till evening and no one brings anything more excellent than this, except one who has done more than this (who utters these words more than one hundred times and does more good acts) and he who utters:\" Hallowed be Allah, and all praise is due to Him,\" one hundred times a day, his sins are obliterated even if they are equal to the extent of the foam of the ocean",
    "matn": [
      "مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ ‏.‏ فِي يَوْمٍ مِائَةَ مَرَّةٍ ‏.‏ كَانَتْ لَهُ عَدْلَ عَشْرِ رِقَابٍ وَكُتِبَتْ لَهُ مِائَةُ حَسَنَةٍ وَمُحِيَتْ عَنْهُ مِائَةُ سَيِّئَةٍ وَكَانَتْ لَهُ حِرْزًا مِنَ الشَّيْطَانِ يَوْمَهُ ذَلِكَ حَتَّى يُمْسِيَ وَلَمْ يَأْتِ أَحَدٌ أَفْضَلَ مِمَّا جَاءَ بِهِ إِلاَّ أَحَدٌ عَمِلَ أَكْثَرَ مِنْ ذَلِكَ ‏.‏ وَمَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَلَوْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ"
    ],
    "collectorNotes": false
  },
  "tahlil-100-ibnmajah": {
    "practice": "Tahlil x100 (Ibn Majah parallel)",
    "citation": "Ibn Majah 33:142",
    "english": "It was narrated from Abu Hurairah that :the Messenger of Allah(ﷺ) said: \"Whoever says one hundered times each day: La ilaha illahu wahdahu la sharikalahu, wa lahul-mulku wa lahul hamduwa huwa ala kulli shayin qadeer (None has the right to be worshipped but Allah alone, with no partner or associate. His is the dominion, all praise is to Him, and He is able to do all things), it will be equivalent to him freeing ten slaves, and one hundered merits will be recorded for him, and one hundered bad deeds will be erased from (his record), and it will be a protection for him against Satan all day until night comes. No one can do anything better then him except one who says more",
    "matn": [
      "مَنْ قَالَ فِي يَوْمٍ مِائَةَ مَرَّةٍ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ كَانَ لَهُ عَدْلَ عَشْرِ رِقَابٍ وَكُتِبَتْ لَهُ مِائَةُ حَسَنَةٍ وَمُحِيَ عَنْهُ مِائَةُ سَيِّئَةٍ وَكُنَّ لَهُ حِرْزًا مِنَ الشَّيْطَانِ سَائِرَ يَوْمِهِ إِلَى اللَّيْلِ وَلَمْ يَأْتِ أَحَدٌ بِأَفْضَلَ مِمَّا أَتَى بِهِ إِلاَّ مَنْ قَالَ أَكْثَرَ"
    ],
    "collectorNotes": false
  },
  "tahlil-ten": {
    "practice": "Tahlil ten times = freeing four slaves",
    "citation": "Tirmidhi 48:184",
    "english": "Abu Ayyub Al-Ansari narrated that the Messenger of Allah (ﷺ) said:“Whoever says ten times: ‘None has the right to be worshipped by Allah, Alone, without partner, to Him belongs all that exists, and to Him belongs the praise, [He gives life and causes death,] and He has power over all things, (Lā ilāha illallāh, waḥdahu lā sharīka lahu, lahul-mulku wa lahul-ḥamdu, [yuḥyī wa yumītu,] wa huwa `alā kulli shai’in qadīr)’ it is for him equal to freeing four slaves among the offspring of Isma`il.”",
    "matn": [
      "مَنْ قَالَ عَشْرَ مَرَّاتٍ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ ‏.‏ كَانَتْ لَهُ عِدْلَ أَرْبَعِ رِقَابٍ مِنْ وَلَدِ إِسْمَاعِيلَ"
    ],
    "collectorNotes": true
  },
  "date-palm-planted": {
    "practice": "Subhan Allah al-Azim wa bihamdih -> a date-palm planted in Paradise",
    "citation": "Tirmidhi 48:95",
    "english": "Jabir narrated that:The Prophet (ﷺ) said: “Whoever says: ‘Glory is to Allah, the Magnificent, and with His Praise (Subḥān Allāhil-Aẓīm, wa biḥamdih)’ a date-palm tree is planted for him in Paradise.”",
    "matn": [
      "مَنْ قَالَ سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ ‏.‏ غُرِسَتْ لَهُ نَخْلَةٌ فِي الْجَنَّةِ"
    ],
    "collectorNotes": true
  },
  "four-words-tree": {
    "practice": "Four words -> a tree planted for you in Paradise",
    "citation": "Ibn Majah 33:151",
    "english": "It was narrated from Abu Hurairah that :the Messenger of Allah (ﷺ) passed by him when he was planting a plant, and said: \"O Abu Hurairah, what are you planting?\" I said: \"A plant for me.\" He said: \"Shall I not tell you of a plant that is better than this?\" He said: \"Of course, O Messenger of Allah.\" He said: \"Say: 'Subhan-Allah, wal-hamdu-lillah, wa la ilaha illallah, wa Allahu Akbar (Glory is to Allah, praise is to Allah, none has the right to be worshiped but Allah and Allah is the Most Great.)' For each one a tree will be planted for you in Paradise",
    "matn": [
      "يَا أَبَا هُرَيْرَةَ مَا الَّذِي تَغْرِسُ",
      "أَلاَ أَدُلُّكَ عَلَى غِرَاسٍ خَيْرٍ لَكَ مِنْ هَذَا",
      "قُلْ سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ يُغْرَسْ لَكَ بِكُلِّ وَاحِدَةٍ شَجَرَةٌ فِي الْجَنَّةِ"
    ],
    "collectorNotes": false
  },
  "umm-hani-100s": {
    "practice": "100 takbir + 100 tahmid + 100 tasbih (Umm Hani)",
    "citation": "Ibn Majah 33:154",
    "english": "It was narrated that Umm Hani' said:\"I came to the Messenger of Allah (ﷺ) and said: 'O Messenger of Allah, tell me of a (good) deed, for I have become old and weak and overweight.' He said: 'Proclaim the greatness of Allah (say Allahu Akbar) one hundred times, praise Allah (say Al-Hamdu Lillah) one hundred times, and glorify Allah (say Subhan-Allah) one hundred times. (That is) better than one hundred horses bridled and saddled for the sake of Allah, better than one hundred sacrificial camels, and better than (freeing) one hundred slaves",
    "matn": [
      "كَبِّرِي اللَّهَ مِائَةَ مَرَّةٍ وَاحْمَدِي اللَّهَ مِائَةَ مَرَّةٍ وَسَبِّحِي اللَّهَ مِائَةَ مَرَّةٍ خَيْرٌ مِنْ مِائَةِ فَرَسٍ مُلْجَمٍ مُسْرَجٍ فِي سَبِيلِ اللَّهِ وَخَيْرٌ مِنْ مِائَةِ بَدَنَةٍ وَخَيْرٌ مِنْ مِائَةِ رَقَبَةٍ"
    ],
    "collectorNotes": false
  },
  "salawat-ten-muslim": {
    "practice": "Salawat once -> ten (Muslim)",
    "citation": "Muslim 4:74",
    "english": "Abu Huraira reported:The Messenger of Allah (ﷺ) said: He who blesses me once, Allah would bless him ten times",
    "matn": [
      "مَنْ صَلَّى عَلَىَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا"
    ],
    "collectorNotes": false
  },
  "salawat-ten-tirmidhi": {
    "practice": "Salawat once -> ten (Tirmidhi)",
    "citation": "Tirmidhi 3:33",
    "english": "Abu Hurairah narrated that :Allah's Messenger said: \"Whoever sends Salat upon me, Allah sends Salat upon him ten times",
    "matn": [
      "مَنْ صَلَّى عَلَىَّ صَلاَةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا"
    ],
    "collectorNotes": true
  },
  "salawat-abudawud": {
    "practice": "Salawat once -> ten (Abu Dawud)",
    "citation": "Abu Dawud 8:115",
    "english": "Narrated AbuHurayrah: The Prophet (ﷺ) said: If anyone invokes blessings on me once, Allah will bless him ten times",
    "matn": [
      "مَنْ صَلَّى عَلَىَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا"
    ],
    "collectorNotes": false
  },
  "one-letter-ten": {
    "practice": "One letter of the Quran -> ten like it",
    "citation": "Tirmidhi 45:36",
    "english": "Narrated Muhammad bin Ka'b Al-Qurazi:\"I heard 'Abdullah bin Mas'ud saying: 'The Messenger of Allah (ﷺ) said: \"[Whoever recites a letter] from Allah's Book, then he receives the reward from it, and the reward of ten the like of it. I do not say that Alif Lam Mim is a letter, but Alif is a letter, Lam is a letter and Mim is a letter",
    "matn": [
      "مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا لاَ أَقُولُ الم حَرْفٌ وَلَكِنْ أَلِفٌ حَرْفٌ وَلاَمٌ حَرْفٌ وَمِيمٌ حَرْفٌ"
    ],
    "collectorNotes": true
  },
  "ikhlas-third-bukhari": {
    "practice": "Al-Ikhlas = one third of the Quran (Bukhari)",
    "citation": "Bukhari 66:37",
    "english": "Narrated Abu Sa`id Al-Khudri:The Prophet (ﷺ) said to his companions, \"Is it difficult for any of you to recite one third of the Qur'an in one night?\" This suggestion was difficult for them so they said, \"Who among us has the power to do so, O Allah's Messenger (ﷺ)?\" Allah's Apostle replied: \" Allah (the) One, the Self-Sufficient Master Whom all creatures need.' (Surat Al-Ikhlas 112.1--to the End) is equal to one third of the Qur'an",
    "matn": [
      "أَيَعْجِزُ أَحَدُكُمْ أَنْ يَقْرَأَ ثُلُثَ الْقُرْآنِ فِي لَيْلَةٍ",
      "اللَّهُ الْوَاحِدُ الصَّمَدُ ثُلُثُ الْقُرْآنِ"
    ],
    "collectorNotes": false
  },
  "ikhlas-third-tirmidhi": {
    "practice": "Al-Ikhlas = a third of the Quran (Tirmidhi)",
    "citation": "Tirmidhi 45:25",
    "english": "Narrated Abu Hurairah:that the Messenger of Allah (ﷺ) said: \"Qul Huwa Allahu Ahad is equal to a third of the Qur'an",
    "matn": [],
    "collectorNotes": true
  },
  "shall-i-not-tell-you": {
    "practice": "Shall I not tell you of the best of your deeds",
    "citation": "Ibn Majah 33:134",
    "english": "It was narrated from Abu Darda that the Prophet(ﷺ) said:\"Shall I not tell you of the best of your deeds, the most pleasing to your Sovereign, those that raise you most in status, that are better than your gold and silver, or meeting you enemy (in battle) and you strike their necks and they strike your necks?\" They said: \" WHat is that, O Messenger of Allah?\" He said: \"Remembering Allah(Dhikr)",
    "matn": [
      "أَلاَ أُنَبِّئُكُمْ بِخَيْرِ أَعْمَالِكُمْ وَأَرْضَاهَا عِنْدَ مَلِيكِكُمْ وَأَرْفَعِهَا فِي دَرَجَاتِكُمْ وَخَيْرٍ لَكُمْ مِنْ إِعْطَاءِ الذَّهَبِ وَالْوَرِقِ وَمِنْ أَنْ تَلْقَوْا عَدُوَّكُمْ فَتَضْرِبُوا أَعْنَاقَهُمْ وَيَضْرِبُوا أَعْنَاقَكُمْ",
      "ذِكْرُ اللَّهِ"
    ],
    "collectorNotes": false
  },
  "tasbih-33-34": {
    "practice": "33/33/34 after every prescribed prayer",
    "citation": "Muslim 5:186",
    "english": "Ka'b b. 'Ujra reported Allah's Messenger (ﷺ) as saying:There are certain ejaculations, the repeaters of which or the performers of which after every prescribed prayer will never be caused disappointment:\" Glory be to Allah\" thirty-three times.\" Praise be to Allah\" thirty-three times, and\" Allah is most Great\" thirty-four times",
    "matn": [
      "مُعَقِّبَاتٌ لاَ يَخِيبُ قَائِلُهُنَّ - أَوْ فَاعِلُهُنَّ - دُبُرَ كُلِّ صَلاَةٍ مَكْتُوبَةٍ ثَلاَثٌ وَثَلاَثُونَ تَسْبِيحَةً وَثَلاَثٌ وَثَلاَثُونَ تَحْمِيدَةً وَأَرْبَعٌ وَثَلاَثُونَ تَكْبِيرَةً"
    ],
    "collectorNotes": false
  },
  "tasbih-33-33-33-tahlil": {
    "practice": "33/33/33 + tahlil to complete 100 -> foam of the sea",
    "citation": "Muslim 5:188",
    "english": "Abu Huraira reported Allah's Messenger (ﷺ) as saying:If anyone extols Allah after every prayer thirty-three times, and praises Allah thirty-three times, and declares His Greatness thirty-three times, ninety-nine times in all, and says to complete a hundred:\" There is no god but Allah, having no partner with Him, to Him belongs sovereignty and to Him is praise due, and He is Potent over everything,\" his sins will be forgiven even If these are as abundant as the foam of the sea",
    "matn": [
      "مَنْ سَبَّحَ اللَّهَ فِي دُبُرِ كُلِّ صَلاَةٍ ثَلاَثًا وَثَلاَثِينَ وَحَمِدَ اللَّهَ ثَلاَثًا وَثَلاَثِينَ وَكَبَّرَ اللَّهَ ثَلاَثًا وَثَلاَثِينَ فَتِلْكَ تِسْعَةٌ وَتِسْعُونَ وَقَالَ تَمَامَ الْمِائَةِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ غُفِرَتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ"
    ],
    "collectorNotes": false
  },
  "tahlil-after-prayer-bukhari": {
    "practice": "Tahlil after every compulsory prayer (Bukhari)",
    "citation": "Bukhari 10:236",
    "english": "Narrated Warrad:(the clerk of Al-Mughira bin Shu`ba) Once Al-Mughira dictated to me in a letter addressed to Muawiya that the Prophet (ﷺ) used to say after every compulsory prayer, \"La ilaha illa l-lahu wahdahu la sharika lahu, lahu l-mulku wa lahu l-hamdu, wa huwa `ala kulli shay'in qadir. Allahumma la mani`a lima a`taita, wa la mu`tiya lima mana`ta, wa la yanfa`u dhal-jaddi minka l-jadd. [There is no Deity but Allah, Alone, no Partner to Him. His is the Kingdom and all praise, and Omnipotent is He. O Allah! Nobody can hold back what you gave, nobody can give what You held back, and no struggler's effort can benefit against You].\" And Al-Hasan said, \"Al-jadd' means prosperity [??]",
    "matn": [
      "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهْوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ، اللَّهُمَّ لاَ مَانِعَ لِمَا أَعْطَيْتَ، وَلاَ مُعْطِيَ لِمَا مَنَعْتَ، وَلاَ يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ"
    ],
    "collectorNotes": false
  },
  "ten-ten-ten": {
    "practice": "Ten/ten/ten after every prayer — easy, but few act on them",
    "citation": "Abu Dawud 43:293",
    "english": "Narrated Abdullah ibn Amr: The Prophet (ﷺ) said: There are two qualities or characteristics which will not be returned by any Muslim without his entering Paradise. While they are easy, those who act upon them are few. One should say: \"Glory be to Allah\" ten times after every prayer, \"Praise be to Allah\" ten times and \"Allah is Most Great\" ten times. That is a hundred and fifty on the tongue, but one thousand and five hundred on the scale. When he goes to bed, he should say: \"Allah is Most Great\" thirty-four times, \"Praise be to Allah\" thirty-three times, and Glory be to Allah thirty-three times, for that is a hundred on the tongue and a thousand on the scale. (He said:) I saw the Messenger of Allah (ﷺ) counting them on his hand. The people asked: Messenger of Allah! How is it that while they are easy, those who act upon them are few? He replied: The Devil comes to one of you when he goes to bed and he makes him sleep, before he utters them, and he comes to him while he is engaged in prayer and calls a need to his mind before he utters them",
    "matn": [
      "خَصْلَتَانِ أَوْ خَلَّتَانِ لاَ يُحَافِظُ عَلَيْهِمَا عَبْدٌ مُسْلِمٌ إِلاَّ دَخَلَ الْجَنَّةَ هُمَا يَسِيرٌ وَمَنْ يَعْمَلُ بِهِمَا قَلِيلٌ يُسَبِّحُ فِي دُبُرِ كُلِّ صَلاَةٍ عَشْرًا وَيَحْمَدُ عَشْرًا وَيُكَبِّرُ عَشْرًا فَذَلِكَ خَمْسُونَ وَمِائَةٌ بِاللِّسَانِ وَأَلْفٌ وَخَمْسُمِائَةٍ فِي الْمِيزَانِ وَيُكَبِّرُ أَرْبَعًا وَثَلاَثِينَ إِذَا أَخَذَ مَضْجَعَهُ وَيَحْمَدُ ثَلاَثًا وَثَلاَثِينَ وَيُسَبِّحُ ثَلاَثًا وَثَلاَثِينَ فَذَلِكَ مِائَةٌ بِاللِّسَانِ وَأَلْفٌ فِي الْمِيزَانِ",
      "يَأْتِي أَحَدَكُمْ - يَعْنِي الشَّيْطَانَ - فِي مَنَامِهِ فَيُنَوِّمُهُ قَبْلَ أَنْ يَقُولَهُ وَيَأْتِيهِ فِي صَلاَتِهِ فَيُذَكِّرُهُ حَاجَةً قَبْلَ أَنْ يَقُولَهَا"
    ],
    "collectorNotes": false
  },
  "fajr-sunnah-muslim": {
    "practice": "Two rakahs of Fajr — dearer than the whole world (Muslim)",
    "citation": "Muslim 6:119",
    "english": "A'isha reported that the Messenger of Allah (ﷺ) said about the two (supererogatory) rak'ahs of the dawn:They are dearer to me than the whole world",
    "matn": [
      "لَهُمَا أَحَبُّ إِلَىَّ مِنَ الدُّنْيَا جَمِيعًا"
    ],
    "collectorNotes": false
  },
  "fajr-sunnah-tirmidhi": {
    "practice": "Two rakahs of Fajr — better than the world and what is in it (Tirmidhi)",
    "citation": "Tirmidhi 2:269",
    "english": "Aishah narrated that :Allah's Messenger (S) said: \"The two Rak'ah of Fajr are better than the world and what is in it",
    "matn": [
      "رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا"
    ],
    "collectorNotes": true
  },
  "twelve-rakah-muslim": {
    "practice": "Twelve rakahs -> a house in Paradise (Muslim)",
    "citation": "Muslim 6:124",
    "english": "Umm Habiba (the wife of the Holy Prophet) reported Allah's Messenger (ﷺ) as saying:A house will be built in Paradise, for anyone who prays in a day and a night twelve rak'ahs; and she added: I have never abandoned (observing them) since I heard it from the Messenger of Allah (ﷺ). Some of the other narrators said the same words: I have never abandoned (observing them) since I heard (from so and so)",
    "matn": [
      "مَنْ صَلَّى اثْنَتَىْ عَشْرَةَ رَكْعَةً فِي يَوْمٍ وَلَيْلَةٍ بُنِيَ لَهُ بِهِنَّ بَيْتٌ فِي الْجَنَّةِ"
    ],
    "collectorNotes": false
  },
  "twelve-rakah-muslim-126": {
    "practice": "Twelve rakahs (Muslim 6:126)",
    "citation": "Muslim 6:126",
    "english": "Umm Habiba, the wife of the Messenger of Allah (ﷺ), reported Allah's Messenger (ﷺ) as saying:If any Muslim servant (of Allah) prays for the sake of Allah twelve rak'ahs (of Sunan) every day, over and above the obligatory ones, Allah will build for him a house in Paradise, or a house will be built for him in Paradise; and I have not abandoned observing them after (hearing it from the Messenger of Allah). (So said also 'Amr and Nu'man)",
    "matn": [
      "مَا مِنْ عَبْدٍ مُسْلِمٍ يُصَلِّي لِلَّهِ كُلَّ يَوْمٍ ثِنْتَىْ عَشْرَةَ رَكْعَةً تَطَوُّعًا غَيْرَ فَرِيضَةٍ إِلاَّ بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ أَوْ إِلاَّ بُنِيَ لَهُ بَيْتٌ فِي الْجَنَّةِ"
    ],
    "collectorNotes": false
  },
  "twelve-rakah-breakdown": {
    "practice": "Twelve rakahs — the 4+2+2+2+2 breakdown (Nasai)",
    "citation": "Nasai 20:198",
    "english": "It was narrated from Aishah that:The Messenger of Allah (ﷺ) said: \"Whoever persists in praying twelve rak'ahs each day and night, Allah, the Mighty and Sublime, will build for him a house in Paradise: Four before Zuhr and two after Zuhr, two rak'ahs after Maghrib, two rak'ahs after Isha' and two rak'ahs of Fajr",
    "matn": [
      "مَنْ ثَابَرَ عَلَى اثْنَتَىْ عَشْرَةَ رَكْعَةً بَنَى اللَّهُ عَزَّ وَجَلَّ لَهُ بَيْتًا فِي الْجَنَّةِ أَرْبَعًا قَبْلَ الظُّهْرِ وَرَكْعَتَيْنِ بَعْدَ الظُّهْرِ وَرَكْعَتَيْنِ بَعْدَ الْمَغْرِبِ وَرَكْعَتَيْنِ بَعْدَ الْعِشَاءِ وَرَكْعَتَيْنِ قَبْلَ الْفَجْرِ"
    ],
    "collectorNotes": false
  },
  "twelve-rakah-breakdown-tirmidhi": {
    "practice": "Twelve rakahs breakdown (Tirmidhi 2:267)",
    "citation": "Tirmidhi 2:267",
    "english": "Aishah narrated that Allah's Messenger (S) said:\"Whoever is regular with twelve Rak'ah of Sunnah (prayer), Allah will build a house for him in Paradise: Four Rak'ah before Zuhr, two Rak'ah after it, two Rak'ah after Maghrib, two Rak'ah after Isha, and two Rak'ah before Fajr",
    "matn": [
      "مَنْ ثَابَرَ عَلَى ثِنْتَىْ عَشْرَةَ رَكْعَةً مِنَ السُّنَّةِ بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ أَرْبَعِ رَكَعَاتٍ قَبْلَ الظُّهْرِ وَرَكْعَتَيْنِ بَعْدَهَا وَرَكْعَتَيْنِ بَعْدَ الْمَغْرِبِ وَرَكْعَتَيْنِ بَعْدَ الْعِشَاءِ وَرَكْعَتَيْنِ قَبْلَ الْفَجْرِ"
    ],
    "collectorNotes": true
  },
  "two-cool-bukhari": {
    "practice": "The two cool prayers -> Paradise (Bukhari)",
    "citation": "Bukhari 9:50",
    "english": "Narrated Abu Bakr bin Abi Musa:My father said, \"Allah's Messenger (ﷺ) said, 'Whoever prays the two cool prayers (`Asr and Fajr) will go to Paradise",
    "matn": [
      "مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ"
    ],
    "collectorNotes": false
  },
  "two-cool-muslim": {
    "practice": "The two cool prayers (Muslim)",
    "citation": "Muslim 5:271",
    "english": "Abu Bakr reported on the authority of his father that the Messenger of Allah (ﷺ) said:He who observed two prayers at two cool (hours) would enter Paradise",
    "matn": [
      "مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ"
    ],
    "collectorNotes": false
  },
  "before-sunrise-sunset-nasai": {
    "practice": "Prayer before sunrise and before sunset -> never enter the Fire (Nasai)",
    "citation": "Nasai 5:24",
    "english": "It was narrated from Abu Bakr bin 'Umarah bin Ruwaibah Ath-Thaqafi that his father said:\"I heard the Messenger of Allah (ﷺ) say: 'He will never enter the Fire, the one who prays before the sun rises and before it sets",
    "matn": [
      "لَنْ يَلِجَ النَّارَ مَنْ صَلَّى قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا"
    ],
    "collectorNotes": false
  },
  "before-sunrise-sunset-abudawud": {
    "practice": "Prayer before sunrise and before sunset (Abu Dawud)",
    "citation": "Abu Dawud 2:37",
    "english": "Narrated Umarah ibn Ruwaybah: A man from Basrah said: Tell me what you heard from the Messenger of Allah (ﷺ). He said: I heard the Messenger of Allah (ﷺ) say: No one will enter Hell who has prayed before the rising of the sun and before its setting (meaning the dawn and the afternoon prayers). He said three times: Have you heard it from him? He replied: Yes, each time saying: My ears heard it and my heart memorised it. The man then said: And I heard him (the Prophet) say that",
    "matn": [
      "لاَ يَلِجُ النَّارَ رَجُلٌ صَلَّى قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ أَنْ تَغْرُبَ"
    ],
    "collectorNotes": false
  },
  "isha-fajr-congregation": {
    "practice": "Isha + Fajr in congregation = praying the whole night",
    "citation": "Muslim 5:324",
    "english": "Abd al-Rahman b. Abd 'Amr reported:'Uthman b. 'Affan (narrated the mosque after evening prayer and sat alone. I also sat alone with him, so he said: 0, son of my brother, I heard the Messenger of Allah (ﷺ) say: He who observed the 'Isha' prayer in congregation, it was as if he prayed up to midnight, and he who prayed the morning prayer in congregation, it was as if he prayed the whole night",
    "matn": [
      "مَنْ صَلَّى الْعِشَاءَ فِي جَمَاعَةٍ فَكَأَنَّمَا قَامَ نِصْفَ اللَّيْلِ وَمَنْ صَلَّى الصُّبْحَ فِي جَمَاعَةٍ فَكَأَنَّمَا صَلَّى اللَّيْلَ كُلَّهُ"
    ],
    "collectorNotes": false
  },
  "post-fajr-hajj-umrah": {
    "practice": "Fajr in jamaah + dhikr till sunrise + two rakahs -> Hajj and Umrah reward",
    "citation": "Tirmidhi 6:43",
    "english": "Anas bin Malik narrated that :the Messenger of Allah said: \"Whoever prays Fajr in congregation, then sits remembering Allah until the sun has risen, then he prays two Rak'ah, then for him is the reward like that of a Hajj and Umrah.\" He said: \"The Messenger of Allah said: 'Complete, complete, complete",
    "matn": [
      "مَنْ صَلَّى الْغَدَاةَ فِي جَمَاعَةٍ ثُمَّ قَعَدَ يَذْكُرُ اللَّهَ حَتَّى تَطْلُعَ الشَّمْسُ ثُمَّ صَلَّى رَكْعَتَيْنِ كَانَتْ لَهُ كَأَجْرِ حَجَّةٍ وَعُمْرَةٍ",
      "تَامَّةٍ تَامَّةٍ تَامَّةٍ"
    ],
    "collectorNotes": true
  },
  "wudu-two-rakah": {
    "practice": "Wudu + two rakahs without distraction -> past sins forgiven",
    "citation": "Bukhari 4:25",
    "english": "Narrated Humran: (the slave of 'Uthman) I saw 'Uthman bin 'Affan asking for a tumbler of water (and when it was brought) he poured water over his hands and washed them thrice and then put his right hand in the water container and rinsed his mouth, washed his nose by putting water in it and then blowing it out. then he washed his face and forearms up to the elbows thrice, passed his wet hands over his head and washed his feet up to the ankles thrice. Then he said, \"Allah's Messenger (ﷺ) said 'If anyone performs ablution like that of mine and offers a two-rak'at prayer during which he does not think of anything else (not related to the present prayer) then his past sins will be forgiven",
    "matn": [
      "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ، لاَ يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ"
    ],
    "collectorNotes": false
  },
  "wudu-shahadah": {
    "practice": "Wudu done well + the shahadah -> the eight gates",
    "citation": "Muslim 2:20",
    "english": "Uqba b. 'Amir reported:We were entrusted with the task of tending the camels. On my turn when I came back in the evening after grazing them in the pastures, I found Allah's Messenger (ﷺ) stand and address the people. I heard these words of his: If any Muslim performs ablution well, then stands and prays two rak'ahs setting about them with his heart as well as his face, Paradise would be guaranteed to him. I said: What a fine thing is this! And a narrator who was before me said: The first was better than even this. When I cast a glance, I saw that it was 'Umar who said: I see that you have just come and observed: If anyone amongst you performs the ablution, and then completes the ablution well and then says: I testify that there is no god but Allah and that Muhammad is the servant of Allah and His Messenger, the eight gates of Paradise would be opened for him and he may enter by whichever of them he wishes",
    "matn": [
      "مَا مِنْ مُسْلِمٍ يَتَوَضَّأُ فَيُحْسِنُ وُضُوءَهُ ثُمَّ يَقُومُ فَيُصَلِّي رَكْعَتَيْنِ مُقْبِلٌ عَلَيْهِمَا بِقَلْبِهِ وَوَجْهِهِ إِلاَّ وَجَبَتْ لَهُ الْجَنَّةُ",
      "مَا مِنْكُمْ مِنْ أَحَدٍ يَتَوَضَّأُ فَيُبْلِغُ - أَوْ فَيُسْبِغُ - الْوُضُوءَ ثُمَّ يَقُولُ أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا عَبْدُ اللَّهِ وَرَسُولُهُ إِلاَّ فُتِحَتْ لَهُ أَبْوَابُ الْجَنَّةِ الثَّمَانِيَةُ يَدْخُلُ مِنْ أَيِّهَا شَاءَ"
    ],
    "collectorNotes": false
  },
  "ayat-kursi-sleep-bukhari-66": {
    "practice": "Ayat al-Kursi before sleep (Bukhari 66:32)",
    "citation": "Bukhari 66:32",
    "english": "Narrated Abu Huraira:Allah's Messenger (ﷺ) ordered me to guard the Zakat revenue of Ramadan. Then somebody came to me and started stealing from the foodstuff. I caught him and said, \"I will take you to Allah's Messenger (ﷺ)!\" Then Abu Huraira described the whole narration and said: That person said (to me), \"(Please don't take me to Allah's Messenger (ﷺ) and I will tell you a few words by which Allah will benefit you.) When you go to your bed, recite Ayat-al-Kursi, (2.255) for then there will be a guard from Allah who will protect you all night long, and Satan will not be able to come near you till dawn.\" (When the Prophet (ﷺ) heard the story) he said (to me), \"He (who came to you at night) told you the truth although he is a liar; and it was Satan",
    "matn": [
      "صَدَقَكَ وَهْوَ كَذُوبٌ ذَاكَ شَيْطَانٌ"
    ],
    "collectorNotes": false
  },
  "ayat-kursi-sleep-bukhari-59": {
    "practice": "Ayat al-Kursi before sleep (Bukhari 59:84)",
    "citation": "Bukhari 59:84",
    "english": "Narrated Muhammad bin Sirin:Abu Huraira said, \"Allah's Messenger (ﷺ) put me in charge of the Zakat of Ramadan (i.e. Zakat-ul-Fitr). Someone came to me and started scooping some of the foodstuff of (Zakat) with both hands. I caught him and told him that I would take him to Allah's Messenger (ﷺ).\" Then Abu Huraira told the whole narration and added \"He (i.e. the thief) said, 'Whenever you go to your bed, recite the Verse of \"Al-Kursi\" (2.255) for then a guardian from Allah will be guarding you, and Satan will not approach you till dawn.' \" On that the Prophet (ﷺ) said, \"He told you the truth, though he is a liar, and he (the thief) himself was the Satan",
    "matn": [
      "صَدَقَكَ وَهْوَ كَذُوبٌ، ذَاكَ شَيْطَانٌ"
    ],
    "collectorNotes": false
  },
  "ayat-kursi-master": {
    "practice": "Ayat al-Kursi — master of the ayat",
    "citation": "Tirmidhi 45:4",
    "english": "Narrated Abu Hurairah:that the Messenger of Allah (ﷺ): \"For everything there is a hump (pinnacle) and the hump (pinnacle) of the Qur'an is Surat Al-Baqarah, in it there is an Ayah which is the master of the Ayat in the Qur'an; [it is] Ayat Al-Kursi",
    "matn": [
      "لِكُلِّ شَيْءٍ سَنَامٌ وَإِنَّ سَنَامَ الْقُرْآنِ سُورَةُ الْبَقَرَةِ وَفِيهَا آيَةٌ هِيَ سَيِّدَةُ آىِ الْقُرْآنِ هِيَ آيَةُ الْكُرْسِيِّ"
    ],
    "collectorNotes": true
  },
  "ayat-kursi-morning-evening": {
    "practice": "Ayat al-Kursi morning and evening -> protected",
    "citation": "Tirmidhi 45:5",
    "english": "Narrated Abu Hurairah:that the Messenger of Allah (ﷺ) said: \"Whoever recites Ha Mim Al-Mu'min - up to - To Him is the return (40:1-3) and Ayat Al-Kursi when he reaches (gets up in) the morning, he will be protected by them until the evening. And whoever recites them when he reaches the evening, he will be protected by them until the morning",
    "matn": [
      "مَنْ قَرَأَ حم الْمُؤْمِنَ إِلَى ‏:‏ ‏(‏إِلَيْهِ الْمَصِيرُ ‏)‏ وَآيَةَ الْكُرْسِيِّ حِينَ يُصْبِحُ حُفِظَ بِهِمَا حَتَّى يُمْسِيَ وَمَنْ قَرَأَهُمَا حِينَ يُمْسِيَ حُفِظَ بِهِمَا حَتَّى يُصْبِحَ"
    ],
    "collectorNotes": true
  },
  "baqarah-last-two-bukhari-66": {
    "practice": "Last two verses of al-Baqarah (Bukhari 66:31)",
    "citation": "Bukhari 66:31",
    "english": "Narrated Abu Mas'ud: The Prophet (ﷺ) said, \"If somebody recited the last two Verses of Surat Al-Baqara at night, that will be sufficient for him",
    "matn": [
      "مَنْ قَرَأَ بِالآيَتَيْنِ مِنْ آخِرِ سُورَةِ الْبَقَرَةِ فِي لَيْلَةٍ كَفَتَاهُ"
    ],
    "collectorNotes": false
  },
  "baqarah-last-two-bukhari-64": {
    "practice": "Last two verses of al-Baqarah (Bukhari 64:59)",
    "citation": "Bukhari 64:59",
    "english": "Narrated Abu Masud Al-Badri:Allah's Messenger (ﷺ) said, \"It is sufficient for one to recite the last two Verses of Surat-al-Baqara at night",
    "matn": [
      "الآيَتَانِ مِنْ آخِرِ سُورَةِ الْبَقَرَةِ مَنْ قَرَأَهُمَا فِي لَيْلَةٍ كَفَتَاهُ"
    ],
    "collectorNotes": false
  },
  "baqarah-last-two-muslim": {
    "practice": "Last two verses of al-Baqarah (Muslim)",
    "citation": "Muslim 6:306",
    "english": "Abd al-Rahman b. Yazid reported:I met Abu Mas'ud near the House (Ka'ba) and said to him: A hadith has been conveyed to me on your authority about the two (concluding verses of Surah al-Baqara. He said: Yes. The Messenger of Allah (ﷺ) (in fact) said: Anyone who recites the two verses at the end of Surah al-Baqara at night, they would suffice for him",
    "matn": [
      "الآيَتَانِ مِنْ آخِرِ سُورَةِ الْبَقَرَةِ مَنْ قَرَأَهُمَا فِي لَيْلَةٍ كَفَتَاهُ"
    ],
    "collectorNotes": false
  },
  "mulk-tirmidhi": {
    "practice": "Surah al-Mulk — thirty ayat that intercede (Tirmidhi)",
    "citation": "Tirmidhi 45:17",
    "english": "Narrated Abu Hurairah:that the Prophet (ﷺ) said: \"Indeed there is a Surah in the Qur'an of thirty Ayat, which intercedes for a man until he is forgiven. It is [Surah] Tabarak Alladhi Biyadihil-Mulk",
    "matn": [
      "إِنَّ سُورَةً مِنَ الْقُرْآنِ ثَلاَثُونَ آيَةً شَفَعَتْ لِرَجُلٍ حَتَّى غُفِرَ لَهُ وَهِيَ سُورَةُ تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ"
    ],
    "collectorNotes": true
  },
  "mulk-ibnmajah": {
    "practice": "Surah al-Mulk — thirty verses (Ibn Majah)",
    "citation": "Ibn Majah 33:130",
    "english": "It was narrated from Abu Hurairah that the Prophet (ﷺ) said:\"There is a surah in the Qur'an, with thirty verses, which will intercede for its companion (the one who recites it) until he is forgiven: Tabarakal-ladhi bi yadihil mulk (Blessed is He in Whose Hand is the Dominion)",
    "matn": [
      "إِنَّ سُورَةً فِي الْقُرْآنِ ثَلاَثُونَ آيَةً شَفَعَتْ لِصَاحِبِهَا حَتَّى غُفِرَ لَهُ ‏{تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ}"
    ],
    "collectorNotes": false
  },
  "kahf-ten-muslim": {
    "practice": "First ten verses of al-Kahf -> protected from the Dajjal (Muslim)",
    "citation": "Muslim 6:311",
    "english": "Abu Darda' reported Allah's Apostle (ﷺ) as saying:If anyone learns by heart the first ten verses of the Surah al-Kahf, he will be protected from the Dajjal",
    "matn": [
      "مَنْ حَفِظَ عَشْرَ آيَاتٍ مِنْ أَوَّلِ سُورَةِ الْكَهْفِ عُصِمَ مِنَ الدَّجَّالِ"
    ],
    "collectorNotes": false
  },
  "kahf-ten-abudawud": {
    "practice": "Ten verses of al-Kahf -> protected from the Dajjal (Abu Dawud)",
    "citation": "Abu Dawud 39:33",
    "english": "Abu al-Darda’ reported the prophet (ﷺ) as saying :If anyone memorizes ten verses from the beginning of surat al-Kahf, he will be protected from the trial of Dajjal (Antichrist). Abu Dawud said: In this way Hashim al-dastawa’I transmitted it from Qatadah, but he said : “If anyone memorizes the closing verses of surat al-Kahf.” Shu’bah narrated from Qatadah the words “from the end of al-Kahf",
    "matn": [
      "مَنْ حَفِظَ عَشْرَ آيَاتٍ مِنْ أَوَّلِ سُورَةِ الْكَهْفِ عُصِمَ مِنْ فِتْنَةِ الدَّجَّالِ",
      "مَنْ حَفِظَ مِنْ خَوَاتِيمِ سُورَةِ الْكَهْفِ",
      "مِنْ آخِرِ الْكَهْفِ"
    ],
    "collectorNotes": false
  },
  "istighfar-distress-abudawud": {
    "practice": "Istighfar -> a way out of every distress (Abu Dawud)",
    "citation": "Abu Dawud 8:103",
    "english": "Narrated Abdullah ibn Abbas: The Prophet (ﷺ) said: If anyone continually asks pardon, Allah will appoint for him a way out of every distress, and a relief from every anxiety, and will provide for him from where he did not reckon",
    "matn": [
      "مَنْ لَزِمَ الاِسْتِغْفَارَ جَعَلَ اللَّهُ لَهُ مِنْ كُلِّ ضِيقٍ مَخْرَجًا وَمِنْ كُلِّ هَمٍّ فَرَجًا وَرَزَقَهُ مِنْ حَيْثُ لاَ يَحْتَسِبُ"
    ],
    "collectorNotes": false
  },
  "istighfar-distress-ibnmajah": {
    "practice": "Istighfar -> relief from every worry (Ibn Majah)",
    "citation": "Ibn Majah 33:163",
    "english": "It was narrated from 'Abdullah bin 'Abbas that :the Messenger of Allah said: \"Whoever persists in asking for forgiveness, Allah will grant him relief from every worry, and a way out from every hardship, and will grant him provision from (sources) he could never imagine",
    "matn": [
      "مَنْ لَزِمَ الاِسْتِغْفَارَ جَعَلَ اللَّهُ لَهُ مِنْ كُلِّ هَمٍّ فَرَجًا وَمِنْ كُلِّ ضِيقٍ مَخْرَجًا وَرَزَقَهُ مِنْ حَيْثُ لاَ يَحْتَسِبُ"
    ],
    "collectorNotes": false
  },
  "sayyid-istighfar-bukhari": {
    "practice": "Sayyid al-Istighfar (Bukhari)",
    "citation": "Bukhari 80:3",
    "english": "Narrated Shaddad bin Aus:The Prophet (ﷺ) said \"The most superior way of asking for forgiveness from Allah is: 'Allahumma anta Rabbi la ilaha illa anta, Khalaqtani wa ana `Abduka, wa ana `ala `ahdika wa wa`dika mastata`tu, A`udhu bika min Sharri ma sana`tu, abu'u Laka bini`matika `alaiya, wa abu'u laka bidhanbi faghfir lee fa innahu la yaghfiru adhdhunuba illa anta.\" The Prophet (ﷺ) added. \"If somebody recites it during the day with firm faith in it, and dies on the same day before the evening, he will be from the people of Paradise; and if somebody recites it at night with firm faith in it, and dies before the morning, he will be from the people of Paradise",
    "matn": [
      "سَيِّدُ الاِسْتِغْفَارِ أَنْ تَقُولَ اللَّهُمَّ أَنْتَ رَبِّي، لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَىَّ وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
      "وَمَنْ قَالَهَا مِنَ النَّهَارِ مُوقِنًا بِهَا، فَمَاتَ مِنْ يَوْمِهِ قَبْلَ أَنْ يُمْسِيَ، فَهُوَ مِنْ أَهْلِ الْجَنَّةِ، وَمَنْ قَالَهَا مِنَ اللَّيْلِ وَهْوَ مُوقِنٌ بِهَا، فَمَاتَ قَبْلَ أَنْ يُصْبِحَ، فَهْوَ مِنْ أَهْلِ الْجَنَّةِ"
    ],
    "collectorNotes": false
  },
  "sayyid-istighfar-tirmidhi": {
    "practice": "Sayyid al-Istighfar — chief of supplications for forgiveness (Tirmidhi)",
    "citation": "Tirmidhi 48:24",
    "english": "Shaddad bin Aws narrated that:The Prophet (ﷺ) said to him: “Should I not direct you to the chief of supplications for forgiveness? ‘O Allah, You are my Lord, there is none worthy of worship except You, You created me and I am Your slave. I am adhering to Your covenant and Your promise as much as I am able to, I seek refuge in You from the evil of what I have done. I admit to You your blessings upon me, and I admit to my sins. So forgive me, for there is none who can forgive sins except You (Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa ana `abduka, wa ana `alā `ahdika wa wa`dika ma-staṭa`tu. A`ūdhu bika min sharri ma ṣana`tu, wa abū'u ilayka bini`matika `alayya wa a`tarifu bidhunūbī faghfirlī dhunūbī innahu lā yaghfirudh-dhunūba illā ant).’ None of you says it when he reaches the evening, and a decree comes upon him before he reaches morning, except that Paradise becomes obligatory upon him. And none says it when he reaches the morning, and a decree comes upon him before he reaches evening, except that Paradise becomes obligatory for him.”",
    "matn": [
      "أَلاَ أَدُلُّكَ عَلَى سَيِّدِ الاِسْتِغْفَارِ اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ وَأَبُوءُ إِلَيْكَ بِنِعْمَتِكَ عَلَىَّ وَأَعْتَرِفُ بِذُنُوبِي فَاغْفِرْ لِي ذُنُوبِي إِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ ‏.‏ لاَ يَقُولُهَا أَحَدُكُمْ حِينَ يُمْسِي فَيَأْتِي عَلَيْهِ قَدَرٌ قَبْلَ أَنْ يُصْبِحَ إِلاَّ وَجَبَتْ لَهُ الْجَنَّةُ وَلاَ يَقُولُهَا حِينَ يُصْبِحُ فَيَأْتِي عَلَيْهِ قَدَرٌ قَبْلَ أَنْ يُمْسِيَ إِلاَّ وَجَبَتْ لَهُ الْجَنَّةُ"
    ],
    "collectorNotes": true
  },
  "prophet-70x-bukhari": {
    "practice": "The Prophet's own istighfar — more than seventy times a day (Bukhari)",
    "citation": "Bukhari 80:4",
    "english": "Narrated Abu Huraira:I heard Allah's Messenger (ﷺ) saying.\" By Allah! I ask for forgiveness from Allah and turn to Him in repentance more than seventy times a day",
    "matn": [
      "وَاللَّهِ إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً"
    ],
    "collectorNotes": false
  },
  "prophet-70x-tirmidhi": {
    "practice": "The Prophet's own istighfar — seventy times a day (Tirmidhi)",
    "citation": "Tirmidhi 47:311",
    "english": "Narrated Az-Zuhri:from Abu Salamah, from Abu Hurairah [may Allah be pleased with him] (regarding): 'And seek forgiveness for your sins, and also for the believing men and women (47:19).' That the Messenger of Allah (ﷺ) said: \"Indeed I ask Allah for forgiveness seventy times a day",
    "matn": [
      "إِنِّي لأَسْتَغْفِرُ اللَّهَ فِي الْيَوْمِ سَبْعِينَ مَرَّةً",
      "إِنِّي لأَسْتَغْفِرُ اللَّهَ فِي الْيَوْمِ مِائَةَ مَرَّةٍ",
      "إِنِّي لأَسْتَغْفِرُ اللَّهَ فِي الْيَوْمِ مِائَةَ مَرَّةٍ"
    ],
    "collectorNotes": true
  },
  "not-confirmed-sinner": {
    "practice": "He who asks pardon is not a confirmed sinner",
    "citation": "Abu Dawud 8:99",
    "english": "Narrated AbuBakr as-Siddiq: The Prophet (ﷺ) said: He who asks pardon is not a confirmed sinner, even if he returns to his sin seventy times a day",
    "matn": [
      "مَا أَصَرَّ مَنِ اسْتَغْفَرَ وَإِنْ عَادَ فِي الْيَوْمِ سَبْعِينَ مَرَّةً"
    ],
    "collectorNotes": false
  },
  "charity-every-joint-56-198": {
    "practice": "Charity on every joint — good word, every step, removing harm (Bukhari 56:198)",
    "citation": "Bukhari 56:198",
    "english": "Narrated Abu Huraira:Allah's Messenger (ﷺ) said, \"There is a (compulsory) Sadaqa (charity) to be given for every joint of the human body (as a sign of gratitude to Allah) everyday the sun rises. To judge justly between two persons is regarded as Sadaqa, and to help a man concerning his riding animal by helping him to ride it or by lifting his luggage on to it, is also regarded as Sadaqa, and (saying) a good word is also Sadaqa, and every step taken on one's way to offer the compulsory prayer (in the mosque) is also Sadaqa and to remove a harmful thing from the way is also Sadaqa",
    "matn": [
      "كُلُّ سُلاَمَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ، يَعْدِلُ بَيْنَ الاِثْنَيْنِ صَدَقَةٌ، وَيُعِينُ الرَّجُلَ عَلَى دَابَّتِهِ، فَيَحْمِلُ عَلَيْهَا، أَوْ يَرْفَعُ عَلَيْهَا مَتَاعَهُ صَدَقَةٌ، وَالْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ، وَكُلُّ خَطْوَةٍ يَخْطُوهَا إِلَى الصَّلاَةِ صَدَقَةٌ، وَيُمِيطُ الأَذَى عَنِ الطَّرِيقِ صَدَقَةٌ"
    ],
    "collectorNotes": false
  },
  "charity-every-joint-56-106": {
    "practice": "Charity obligatory every day on every joint (Bukhari 56:106)",
    "citation": "Bukhari 56:106",
    "english": "Narrated Abu Huraira:The Prophet (ﷺ) said, \"Charity is obligatory everyday on every joint of a human being. If one helps a person in matters concerning his riding animal by helping him to ride it or by lifting his luggage on to it, all this will be regarded as charity. A good word, and every step one takes to offer the compulsory Congregational prayer, is regarded as charity; and guiding somebody on the road is regarded as charity",
    "matn": [
      "كُلُّ سُلاَمَى عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ، يُعِينُ الرَّجُلَ فِي دَابَّتِهِ يُحَامِلُهُ عَلَيْهَا أَوْ يَرْفَعُ عَلَيْهَا مَتَاعَهُ صَدَقَةٌ، وَالْكَلِمَةُ الطَّيِّبَةُ، وَكُلُّ خَطْوَةٍ يَمْشِيهَا إِلَى الصَّلاَةِ صَدَقَةٌ، وَدَلُّ الطَّرِيقِ صَدَقَةٌ"
    ],
    "collectorNotes": false
  },
  "charity-every-joint-53-17": {
    "practice": "Charity for every joint, every day the sun rises (Bukhari 53:17)",
    "citation": "Bukhari 53:17",
    "english": "Narrated Abu Huraira:Allah's Messenger (ﷺ) said, \"There is a Sadaqa to be given for every joint of the human body; and for every day on which the sun rises there is a reward of a Sadaqa (i.e. charitable gift) for the one who establishes justice among people",
    "matn": [
      "كُلُّ سُلاَمَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ، كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ يَعْدِلُ بَيْنَ النَّاسِ صَدَقَةٌ"
    ],
    "collectorNotes": false
  },
  "smile-charity": {
    "practice": "Your smiling in the face of your brother is charity",
    "citation": "Tirmidhi 27:62",
    "english": "Abu Dharr narrated that the Messenger of Allah said :\"Your smiling in the face of your brother is charity, commanding good and forbidding evil is charity, your giving directions to a man lost in the land is charity for you. Your seeing for a man with bad sight is a charity for you, your removal of a rock, a thorn or a bone from the road is charity for you. Your pouring what remains from your bucket into the bucket of your brother is charity for you",
    "matn": [
      "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ وَأَمْرُكَ بِالْمَعْرُوفِ وَنَهْيُكَ عَنِ الْمُنْكَرِ صَدَقَةٌ وَإِرْشَادُكَ الرَّجُلَ فِي أَرْضِ الضَّلاَلِ لَكَ صَدَقَةٌ وَبَصَرُكَ لِلرَّجُلِ الرَّدِيءِ الْبَصَرِ لَكَ صَدَقَةٌ وَإِمَاطَتُكَ الْحَجَرَ وَالشَّوْكَةَ وَالْعَظْمَ عَنِ الطَّرِيقِ لَكَ صَدَقَةٌ وَإِفْرَاغُكَ مِنْ دَلْوِكَ فِي دَلْوِ أَخِيكَ لَكَ صَدَقَةٌ"
    ],
    "collectorNotes": true
  },
  "belittle-good": {
    "practice": "Don't consider anything insignificant — a cheerful countenance",
    "citation": "Muslim 45:187",
    "english": "Abu Dharr reported:Allah's Apostle (ﷺ) said to me: Don't consider anything insignificant out of good things even if it is that you meet your brother with a cheerful countenance",
    "matn": [
      "لاَ تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلْقٍ"
    ],
    "collectorNotes": false
  },
  "bone-from-road-abudawud": {
    "practice": "Removal of a bone from the road — the humblest branch of faith",
    "citation": "Abu Dawud 42:81",
    "english": "Abu Hurairah reported the Messenger of Allah (May peace be upon him) as saying :Faith has over seventy branches, the most excellent of which is the declaration that there is no god but Allah, and the humblest of which is the removal of a bone from the road. And modesty is a branch of faith",
    "matn": [
      "الإِيمَانُ بِضْعٌ وَسَبْعُونَ أَفْضَلُهَا قَوْلُ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَدْنَاهَا إِمَاطَةُ الْعَظْمِ عَنِ الطَّرِيقِ وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ"
    ],
    "collectorNotes": false
  },
  "harm-from-road-muslim": {
    "practice": "Removal of something objectionable from the road (Muslim)",
    "citation": "Muslim 5:71",
    "english": "Abu Dharr reported:The Apostle of Allah (ﷺ) said: The deeds of my people, good and bad, were presented before me, and I found the removal of something objectionable from the road among their good deeds, and the sputum mucus left unburied in the mosque among their evil deeds",
    "matn": [
      "عُرِضَتْ عَلَىَّ أَعْمَالُ أُمَّتِي حَسَنُهَا وَسَيِّئُهَا فَوَجَدْتُ فِي مَحَاسِنِ أَعْمَالِهَا الأَذَى يُمَاطُ عَنِ الطَّرِيقِ وَوَجَدْتُ فِي مَسَاوِي أَعْمَالِهَا النُّخَاعَةَ تَكُونُ فِي الْمَسْجِدِ لاَ تُدْفَنُ"
    ],
    "collectorNotes": false
  },
  "answer-muadhdhin": {
    "practice": "Answer the muadhdhin, then salawat, then ask al-Wasila",
    "citation": "Muslim 4:13",
    "english": "Abdullah b. Amr b. al-As reported Allah's Messenger (ﷺ) as saying:When you hear the Mu'adhdhin, repeat what he says, then invoke a blessing on me, for everyone who invokes a blessing on me will receive ten blessings from Allah; then beg from Allah al-Wasila for me, which is a rank in Paradise fitting for only one of Allah's servants, and I hope that I may be that one. If anyone who asks that I be given the Wasila, he will be assured of my intercession",
    "matn": [
      "إِذَا سَمِعْتُمُ الْمُؤَذِّنَ فَقُولُوا مِثْلَ مَا يَقُولُ ثُمَّ صَلُّوا عَلَىَّ فَإِنَّهُ مَنْ صَلَّى عَلَىَّ صَلاَةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا ثُمَّ سَلُوا اللَّهَ لِيَ الْوَسِيلَةَ فَإِنَّهَا مَنْزِلَةٌ فِي الْجَنَّةِ لاَ تَنْبَغِي إِلاَّ لِعَبْدٍ مِنْ عِبَادِ اللَّهِ وَأَرْجُو أَنْ أَكُونَ أَنَا هُوَ فَمَنْ سَأَلَ لِيَ الْوَسِيلَةَ حَلَّتْ لَهُ الشَّفَاعَةُ"
    ],
    "collectorNotes": false
  },
  "visit-sick-tirmidhi": {
    "practice": "Visiting the sick -> seventy thousand angels",
    "citation": "Tirmidhi 10:5",
    "english": "Thuwair [and he is Ibn Abi Fakhitah] narrated that :His father said: \"Ali took me by the hand and said: 'Come with us to pay a visit to Al-Hasan.' So we found that Abu Musa was with him.' Ali - peace be upon him - said: 'O Abu Musa! Did you come to visit (the sick) or merely (stop by to) visit?' He said: 'No, to visit (the sick).' So Ali said: 'I heard the Messenger of Allah saying: \"No Muslim visits (the sick) Muslims in the morning, except that sevety-thousand angels, sent Salat upon him until the evening, and he does not visit at night except that seventy thousand angels sent Salat upon him until the morning, and there will be a garden for him in Paradise",
    "matn": [
      "مَا مِنْ مُسْلِمٍ يَعُودُ مُسْلِمًا غُدْوَةً إِلاَّ صَلَّى عَلَيْهِ سَبْعُونَ أَلْفَ مَلَكٍ حَتَّى يُمْسِيَ وَإِنْ عَادَهُ عَشِيَّةً إِلاَّ صَلَّى عَلَيْهِ سَبْعُونَ أَلْفَ مَلَكٍ حَتَّى يُصْبِحَ وَكَانَ لَهُ خَرِيفٌ فِي الْجَنَّةِ"
    ],
    "collectorNotes": true
  },
  "visit-sick-abudawud": {
    "practice": "Visiting the sick (Abu Dawud 21:10 — the reference the editor flagged)",
    "citation": "Abu Dawud 21:10",
    "english": "Narrated 'Ali:If a man visits a patient in the evening, seventy thousand angels come along with him seeking forgiveness from Allah for him till the morning, and he will have a garden in the Paradise",
    "matn": [],
    "collectorNotes": false
  },
  "janazah-qirat-bukhari": {
    "practice": "Janazah -> one qirat / two qirats (Bukhari 23:81)",
    "citation": "Bukhari 23:81",
    "english": "Narrated Abu Huraira:that Allah's Messenger (ﷺ) said, \"Whoever attends the funeral procession till he offers the funeral prayer for it, will get a reward equal to one Qirat, and whoever accompanies it till burial, will get a reward equal to two Qirats.\" It was asked, \"What are two Qirats?\" He replied, \"Like two huge mountains",
    "matn": [
      "مَنْ شَهِدَ الْجَنَازَةَ حَتَّى يُصَلِّيَ عَلَيْهَا فَلَهُ قِيرَاطٌ، وَمَنْ شَهِدَ حَتَّى تُدْفَنَ كَانَ لَهُ قِيرَاطَانِ",
      "مِثْلُ الْجَبَلَيْنِ الْعَظِيمَيْنِ"
    ],
    "collectorNotes": false
  },
  "janazah-uhud": {
    "practice": "Each qirat like Mount Uhud (Bukhari 2:40)",
    "citation": "Bukhari 2:40",
    "english": "Narrated Abu Huraira: Allah's Messenger (ﷺ) said, \"(A believer) who accompanies the funeral procession of a Muslim out of sincere faith and hoping to attain Allah's reward and remains with it till the funeral prayer is offered and the burial ceremonies are over, he will return with a reward of two Qirats. Each Qirat is like the size of the (Mount) Uhud. He who offers the funeral prayer only and returns before the burial, will return with the reward of one Qirat only",
    "matn": [
      "مَنِ اتَّبَعَ جَنَازَةَ مُسْلِمٍ إِيمَانًا وَاحْتِسَابًا، وَكَانَ مَعَهُ حَتَّى يُصَلَّى عَلَيْهَا، وَيَفْرُغَ مِنْ دَفْنِهَا، فَإِنَّهُ يَرْجِعُ مِنَ الأَجْرِ بِقِيرَاطَيْنِ، كُلُّ قِيرَاطٍ مِثْلُ أُحُدٍ، وَمَنْ صَلَّى عَلَيْهَا ثُمَّ رَجَعَ قَبْلَ أَنْ تُدْفَنَ فَإِنَّهُ يَرْجِعُ بِقِيرَاطٍ"
    ],
    "collectorNotes": false
  },
  "janazah-muslim": {
    "practice": "Janazah qirats (Muslim)",
    "citation": "Muslim 11:70",
    "english": "Abu Huraira reported Allah's Apostle (ﷺ) as saying:He who offered prayer over the dead, but did not follow the bier, for him is the reward of one qirat, and he who followed it, for him is the reward of two qirats. It was asked what the qirats were. He said: The smaller amongst the two is equivalent to Uhud",
    "matn": [
      "مَنْ صَلَّى عَلَى جَنَازَةٍ وَلَمْ يَتْبَعْهَا فَلَهُ قِيرَاطٌ فَإِنْ تَبِعَهَا فَلَهُ قِيرَاطَانِ",
      "أَصْغَرُهُمَا مِثْلُ أُحُدٍ"
    ],
    "collectorNotes": false
  },
  "build-masjid": {
    "practice": "Building a masjid -> a house in Paradise",
    "citation": "Muslim 5:29",
    "english": "Ubaidullah al-Khaulini reported:'Uthman b. 'Affan listened to the opinion of the people (which was not favourable) when he rebuilt the mosque of the Messenger of Allah (ﷺ). Thereupon he said: You have not been fair to me for I have heard from the Messenger of Allah (ﷺ) saying: He who built a mosque for Allah, the Exalted, Allah would build for him a house in Paradise. Bukair said: I think he (the Holy Prophet) said: While he seeks the pleasure of Allah (by building the mosque). And in the narration of Ibn 'Isa (the words are):\" (a house) like that (mosque) in Paradise",
    "matn": [
      "مَنْ بَنَى مَسْجِدًا لِلَّهِ تَعَالَى - قَالَ بُكَيْرٌ حَسِبْتُ أَنَّهُ قَالَ - يَبْتَغِي بِهِ وَجْهَ اللَّهِ - بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ",
      "مِثْلَهُ فِي الْجَنَّةِ"
    ],
    "collectorNotes": false
  },
  "most-regular-deeds": {
    "practice": "The most beloved deeds are the most constant, though few",
    "citation": "Bukhari 81:54",
    "english": "Narrated `Aisha:The Prophet (ﷺ) was asked, \"What deeds are loved most by Allah?\" He said, \"The most regular constant deeds even though they may be few.\" He added, 'Don't take upon yourselves, except the deeds which are within your ability",
    "matn": [
      "أَدْوَمُهَا وَإِنْ قَلَّ",
      "اكْلَفُوا مِنَ الأَعْمَالِ مَا تُطِيقُونَ"
    ],
    "collectorNotes": false
  },
  "salawat-formula-bukhari": {
    "practice": "The salawat itself — 'how do we invoke blessings on you?'",
    "citation": "Bukhari 65:319",
    "english": "Narrated Ka`b bin Ujra:It was said, \"O Allah's Messenger (ﷺ)! We know how to greet you, but how to invoke Allah for you?\" The Prophet said, \"Say: Allahumma salli ala Muhammadin wa'ala `Ali Muhammaddin, kama sallaita 'ala all Ibrahim, innaka Hamidun Majid",
    "matn": [
      "قُولُوا اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ"
    ],
    "collectorNotes": false
  },
  "salawat-formula-ibnmajah": {
    "practice": "The salawat itself (Ka'b b. 'Ujrah)",
    "citation": "Ibn Majah 5:102",
    "english": "It was narrated that Hakam said:“I heard Ibn Abi Laila say: ‘Ka’b bin ‘Ujrah met me and said: “Shall I not give you a gift? The Messenger of Allah (ﷺ) came out to us and we said: ‘We know what it means to send greetings on you, but what does it mean to send peace and blessings upon you?’ He said: ‘Say: Allahumma salli ‘ala Muhammadin wa ‘ala ali Muhammadin, kama sallayta ‘ala Ibrahima, innaka Hamidun Majid; Allahumma barik ‘ala Muhammadin wa ‘ala ali Muhammadin, kama barakta ‘ala Ibrahima, innaka Hamidun Majid (O Allah, send your grace, honour and mercy upon Muhammad and upon the family of Muhammad, as You sent Your grace, honour and mercy upon Ibrahim, You are indeed Praiseworthy, Most Glorious. O Allah, send Your blessings upon Muhammad and the family of Muhammad, as You sent Your blessings upon Ibrahim, You are indeed Praiseworthy, Most Glorious).’”",
    "matn": [
      "قُولُوا اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى، إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ. اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ"
    ],
    "collectorNotes": false
  },
  "mulk-bedtime-tirmidhi": {
    "practice": "The Prophet's own bedtime recitation: as-Sajdah and al-Mulk",
    "citation": "Tirmidhi 48:35",
    "english": "Jabir said:“The Prophet would not sleep until he reached Tanzil as-Sajdah and Tabarak.”",
    "matn": [],
    "collectorNotes": true
  },
  "istighfar-100-muslim": {
    "practice": "The Prophet's istighfar — a hundred times a day",
    "citation": "Muslim 48:52",
    "english": "Al-Agharr al-Muzani, who was one amongst the Companions (of the Holy Prophet) reported that Allah's Messenger (ﷺ) said:There is (at times) some sort of shade upon my heart, and I seek forgiveness from Allah a hundred times a day",
    "matn": [
      "إِنَّهُ لَيُغَانُ عَلَى قَلْبِي وَإِنِّي لأَسْتَغْفِرُ اللَّهَ فِي الْيَوْمِ مِائَةَ مَرَّةٍ"
    ],
    "collectorNotes": false
  },
  "istighfar-100-ibnmajah": {
    "practice": "The Prophet's istighfar — a hundred times a day",
    "citation": "Ibn Majah 33:159",
    "english": "It was narrated from Abu Hurairah that :the Messenger of Allah (saas) said: 'I seek the forgiveness of Allah and repent to Him one hundred times each day",
    "matn": [
      "إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ مِائَةَ مَرَّةٍ"
    ],
    "collectorNotes": false
  },
  "three-days-lifetime-nasai": {
    "practice": "Three days of each month = fasting a lifetime",
    "citation": "Nasai 22:320",
    "english": "It was narrated that Abu Dharr said:\"The Messenger of Allah said: 'Whoever fasts for three days of each month, he has fasted for a whole lifetime.' Then he said: Allah has spoken the truth in His book: Whoever brings a good deed shall have ten times the like thereof to his credit",
    "matn": [
      "مَنْ صَامَ ثَلاَثَةَ أَيَّامٍ مِنَ الشَّهْرِ فَقَدْ صَامَ الدَّهْرَ كُلَّهُ",
      "صَدَقَ اللَّهُ فِي كِتَابِهِ ‏{‏ مَنْ جَاءَ بِالْحَسَنَةِ فَلَهُ عَشْرُ أَمْثَالِهَا ‏}"
    ],
    "collectorNotes": false
  },
  "three-days-any-dates": {
    "practice": "'Aishah: he did not mind which days of the month he fasted",
    "citation": "Abu Dawud 14:141",
    "english": "Mu'adhah (al-'Adawiyyah) said:I asked 'Aishah: Would the Messenger of Allah (ﷺ) fast three days every month ? She replied: Yes. I asked: Which days in the month he used to fast ? She replied: He did not care which days of the month he fasted",
    "matn": [],
    "collectorNotes": false
  },
  "three-days-monday-thursday": {
    "practice": "Umm Salamah: three days beginning Monday or Thursday",
    "citation": "Abu Dawud 14:140",
    "english": "Narrated Umm Salamah, Ummul Mu'minin: Hunaydah al-Khuza'i reported on the authority of her mother who said: I entered upon Umm Salamah and asked her about fasting. She said: The Messenger of Allah (ﷺ) used to command me to fast three days every month beginning with Monday or Thursday",
    "matn": [],
    "collectorNotes": false
  }
};

export const AYAH: Record<string, AyahQuote> = {
  "ayat-al-kursi": {
    "practice": "Ayat al-Kursi",
    "citation": "Quran 2:255",
    "textAr": "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
    "textEn": "Allah: none has the right to be worshiped except Him, the Ever-Living, All-Sustaining. Neither drowsiness overtakes Him nor sleep. To Him belongs all that is in the heavens and all that is on earth. Who is there that can intercede with Him except with His permission? He knows what was before them and what will be after them, while they encompass nothing of His knowledge, except what He wills. His Kursī [i.e., footstool] extends over the heavens and earth, and safeguarding of both does not weary Him, for He is the Most High, the Most Great.",
    "textTranslit": "Allahu laaa ilaaha illaa Huwal Haiyul Qaiyoom; laa taakhuzuhoo sinatunw wa laa nawm; lahoo maa fissamaawaati wa maa fil ard; man zal lazee yashfa'u indahooo illaa bi-iznih; ya'lamu maa baina aydeehim wa mww khalfahum wa laa yuheetoona bishai'im min 'ilmihee illaa bimaa shaaa'; wasi'a Kursiyyuhus samaawaati wal arda wa laa ya'ooduho hifzuhumaa; wa Huwal Aliyyul 'Azeem"
  },
  "baqarah-285": {
    "practice": "Al-Baqarah 285",
    "citation": "Quran 2:285",
    "textAr": "ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ ۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَـٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِۦ ۚ وَقَالُوا۟ سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ ٱلْمَصِيرُ",
    "textEn": "The Messenger believes in what has been sent down to him from his Lord, as do the believers. All of them believe in Allah, His angels, His Books, and His messengers, [saying], “We make no distinction between any of His messengers.” And they say, “We hear and obey. Grant us Your forgiveness, our Lord, and to You is the [final] destination.”",
    "textTranslit": "Aamanar-Rasoolu bimaaa unzila ilaihi mir-Rabbihee walmu'minoon; kullun aamana billaahi wa Malaaa'ikathihee wa Kutubhihee wa Rusulih laa nufarriqu baina ahadim-mir-Rusulihee wa qaaloo sami'naa wa ata'naa ghufraanaka Rabbanaa wa ilaikal-maseer"
  },
  "baqarah-286": {
    "practice": "Al-Baqarah 286",
    "citation": "Quran 2:286",
    "textAr": "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ",
    "textEn": "Allah does not burden any soul greater than it can bear. For it is what it has earned, and against it is what it has incurred. “Our Lord, do not hold us accountable if we forget or fall into error. Our Lord, do not place on us such a burden as You have placed on those before us. Our Lord, do not burden us with that which we cannot bear. Pardon us, forgive us, and have mercy on us. You are our Protector, so give us victory over the disbelieving people.”",
    "textTranslit": "Laa yukalliful-laahu nafsan illaa wus'ahaa; lahaa maa kasabat wa 'alaihaa maktasabat; Rabbanaa la tu'aakhiznaa in naseenaaa aw akhtaanaa; Rabbanaa wa laa tahmil-'alainaaa isran kamaa hamaltahoo 'alal-lazeena min qablinaa; Rabbanaa wa laa tuhammilnaa maa laa taaqata lanaa bih wa'fu 'annaa waghfir lanaa warhamnaa; Anta mawlaanaa fansurnaa 'alal qawmil kaafireen"
  },
  "ikhlas-1": {
    "practice": "Al-Ikhlas 1",
    "citation": "Quran 112:1",
    "textAr": "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
    "textEn": "Say: “He is Allah, the One;",
    "textTranslit": "Qul huwal laahu ahad"
  },
  "ikhlas-2": {
    "practice": "Al-Ikhlas 2",
    "citation": "Quran 112:2",
    "textAr": "ٱللَّهُ ٱلصَّمَدُ",
    "textEn": "Allah, the Eternal Refuge.",
    "textTranslit": "Allah hus-samad"
  },
  "ikhlas-3": {
    "practice": "Al-Ikhlas 3",
    "citation": "Quran 112:3",
    "textAr": "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    "textEn": "He neither begets nor is He begotten,",
    "textTranslit": "Lam yalid wa lam yoolad"
  },
  "ikhlas-4": {
    "practice": "Al-Ikhlas 4",
    "citation": "Quran 112:4",
    "textAr": "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
    "textEn": "and there is none comparable to Him.”",
    "textTranslit": "Wa lam yakul-lahu kufuwan ahad"
  },
  "kahf-1": {
    "practice": "Al-Kahf 1",
    "citation": "Quran 18:1",
    "textAr": "ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَنزَلَ عَلَىٰ عَبْدِهِ ٱلْكِتَـٰبَ وَلَمْ يَجْعَل لَّهُۥ عِوَجَا ۜ",
    "textEn": "All praise be to Allah Who has sent down upon His slave the Book, and has not allowed any crookedness therein,",
    "textTranslit": "Alhamdu lillaahil lazeee anzala 'alaa 'abdihil kitaaba wa lam yaj'al lahoo 'iwajaa"
  },
  "mulk-1": {
    "practice": "Al-Mulk 1",
    "citation": "Quran 67:1",
    "textAr": "تَبَـٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
    "textEn": "Blessed is He in Whose Hand is the dominion, and He is Most Capable of all things.",
    "textTranslit": "Tabaarakal lazee biyadihil mulku wa huwa 'alaa kulli shai-in qadeer"
  },
  "ghafir-1": {
    "practice": "Ghafir 40:1",
    "citation": "Quran 40:1",
    "textAr": "حمٓ",
    "textEn": "Hā Mīm.",
    "textTranslit": "Haa-Meeem"
  },
  "ghafir-2": {
    "practice": "Ghafir 40:2",
    "citation": "Quran 40:2",
    "textAr": "تَنزِيلُ ٱلْكِتَـٰبِ مِنَ ٱللَّهِ ٱلْعَزِيزِ ٱلْعَلِيمِ",
    "textEn": "The revelation of this Book is from Allah, the All-Mighty, the All-Knowing,",
    "textTranslit": "Tanzeelul Kitaabi minal laahil Azeezil 'Aleem"
  },
  "ghafir-3": {
    "practice": "Ghafir 40:3",
    "citation": "Quran 40:3",
    "textAr": "غَافِرِ ٱلذَّنۢبِ وَقَابِلِ ٱلتَّوْبِ شَدِيدِ ٱلْعِقَابِ ذِى ٱلطَّوْلِ ۖ لَآ إِلَـٰهَ إِلَّا هُوَ ۖ إِلَيْهِ ٱلْمَصِيرُ",
    "textEn": "the Forgiver of sin and Accepter of repentance, the Severe in punishment and Infinite in bounty. None has the right to be worshiped except Him. To Him is the final return.",
    "textTranslit": "Ghaafiriz zambi wa qaabilit tawbi shadeedil 'iqaabi zit tawli laaa ilaaha illaa Huwa ilaihil maseer"
  }
};

export const SAY: Record<SayId, SayLine> = {
  "sayyid-al-istighfar": {
    "arabic": "اللَّهُمَّ أَنْتَ رَبِّي، لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَىَّ وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
    "citation": "Bukhari 80:3",
    "hadith": "sayyid-istighfar-bukhari"
  },
  "subhanallah-100": {
    "arabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    "citation": "Bukhari 80:100",
    "hadith": "subhanallah-100"
  },
  "two-words": {
    "arabic": "سُبْحَانَ اللَّهِ الْعَظِيمِ، سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    "citation": "Bukhari 80:101",
    "hadith": "two-words-bukhari"
  },
  "tahlil-100": {
    "arabic": "لاَ إِلَهَ إِلاَّ اللَّهُ، وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهْوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ",
    "citation": "Bukhari 80:98",
    "hadith": "tahlil-100-bukhari"
  },
  "tahlil-ten": {
    "arabic": "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    "citation": "Tirmidhi 48:184",
    "hadith": "tahlil-ten"
  },
  "date-palm": {
    "arabic": "سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ",
    "citation": "Tirmidhi 48:95",
    "hadith": "date-palm-planted"
  },
  "four-words": {
    "arabic": "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ",
    "citation": "Ibn Majah 33:151",
    "hadith": "four-words-tree"
  },
  "tahlil-after-prayer": {
    "arabic": "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهْوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ، اللَّهُمَّ لاَ مَانِعَ لِمَا أَعْطَيْتَ، وَلاَ مُعْطِيَ لِمَا مَنَعْتَ، وَلاَ يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ",
    "citation": "Bukhari 10:236",
    "hadith": "tahlil-after-prayer-bukhari"
  },
  "tasbih-hundredth": {
    "arabic": "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ",
    "citation": "Muslim 5:188",
    "hadith": "tasbih-33-33-33-tahlil"
  },
  "salawat": {
    "arabic": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    "citation": "Bukhari 65:319",
    "hadith": "salawat-formula-bukhari"
  }
};
