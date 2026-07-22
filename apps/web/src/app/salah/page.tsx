"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import { motion, AnimatePresence } from "framer-motion";
import { useIsNative } from "@/lib/mobile/platform";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import SubTabLayout from "@hidden-hiqmah/ui/components/SubTabLayout";
import TopicInfoCard, { type Topic } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import Accordion from "@hidden-hiqmah/ui/components/Accordion";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import PrayerFigure, { type Position } from "@hidden-hiqmah/ui/components/PrayerFigure";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  User,
  Volume2,
  Play,
  StopCircle,
  Compass,
} from "lucide-react";
import { useAdhanAudio } from "@hidden-hiqmah/ui/context/AdhanAudioContext";

/* ───────────────────────── prayer step data ───────────────────────── */

type PrayerStep = {
  position: Position;
  label: string;
  arabic: string;
  transliteration: string;
  translation: string;
  instruction: string;
  maleNote?: string;
  femaleNote?: string;
};

const prayerSteps: PrayerStep[] = [
  {
    position: "standing",
    label: "Niyyah (Intention)",
    arabic: "",
    transliteration: "",
    translation: "",
    instruction:
      "Stand facing the qiblah (direction of the Ka'bah). Make the intention in your heart for the specific prayer you are about to perform. The intention does not need to be spoken aloud.",
  },
  {
    position: "hands-raised",
    label: "Takbiratul Ihram",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    instruction:
      "Raise both hands up to the level of the ears (men) or shoulders (women), with palms facing the qiblah, and say 'Allahu Akbar'. This opens the prayer.",
    maleNote: "Raise hands to the earlobes",
    femaleNote: "Raise hands to the shoulders",
  },
  {
    position: "hands-folded",
    label: "Opening Supplication (Du'a al-Istiftah)",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ",
    transliteration:
      "Subhanaka Allahumma wa bihamdika, wa tabaraka-smuka, wa ta'ala jadduka, wa la ilaha ghayruk",
    translation:
      "Glory be to You, O Allah, and praise be to You. Blessed is Your name and exalted is Your majesty. There is no god but You.",
    instruction:
      "Place the right hand over the left on the chest. Recite the opening supplication silently. Then say: 'A'udhu billahi min ash-shaytanir rajim' (I seek refuge in Allah from the accursed Shaytan), then 'Bismillahir Rahmanir Rahim' (In the name of Allah, the Most Gracious, the Most Merciful).",
    maleNote: "Place right hand over left on the chest",
    femaleNote: "Place right hand over left on the chest (some scholars say higher for women)",
  },
  {
    position: "hands-folded",
    label: "Recite Al-Fatihah",
    arabic:
      "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ﴿١﴾ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ ﴿٢﴾ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ﴿٣﴾ مَـٰلِكِ يَوْمِ ٱلدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ ﴿٦﴾ صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ ﴿٧﴾",
    transliteration:
      "Bismillahir Rahmanir Rahim. Al-hamdu lillahi Rabbil 'alamin. Ar-Rahmanir Rahim. Maliki yawmid-din. Iyyaka na'budu wa iyyaka nasta'in. Ihdinas-siratal mustaqim. Siratal-ladhina an'amta 'alayhim, ghayril maghdubi 'alayhim wa lad-dallin.",
    translation:
      "In the name of Allah, the Most Gracious, the Most Merciful. All praise is for Allah, Lord of all worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgement. You alone we worship, and You alone we ask for help. Guide us along the Straight Path — the path of those You have blessed, not those who earned Your anger, nor those who went astray.",
    instruction:
      "Recite Surah Al-Fatihah. This is an obligatory part of every rak'ah. After finishing, say 'Ameen' (O Allah, accept). In the first and second rak'ah, follow it with any short surah or verses from the Quran.",
  },
  {
    position: "bowing",
    label: "Ruku' (Bowing)",
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    transliteration: "Subhana Rabbiyal 'Adheem",
    translation: "Glory be to my Lord, the Magnificent",
    instruction:
      "Say 'Allahu Akbar' and bow down. Place your hands on your knees with fingers spread. Keep your back straight and level. Say 'Subhana Rabbiyal Adheem' three times (the sunnah; once is the minimum).",
    maleNote: "Keep the back straight and level, arms away from the body",
    femaleNote: "Bow less deeply, keep arms closer to the body",
  },
  {
    position: "standing-from-bow",
    label: "Rising from Ruku'",
    arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ ، رَبَّنَا وَلَكَ الْحَمْدُ",
    transliteration:
      "Sami'Allahu liman hamidah. Rabbana wa lakal hamd.",
    translation:
      "Allah hears whoever praises Him. Our Lord, to You belongs all praise.",
    instruction:
      "Rise from bowing while saying 'Sami'Allahu liman hamidah'. Stand upright and say 'Rabbana wa lakal hamd'. Stand completely straight before proceeding.",
  },
  {
    position: "prostrating",
    label: "First Sujud (Prostration)",
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    transliteration: "Subhana Rabbiyal A'la",
    translation: "Glory be to my Lord, the Most High",
    instruction:
      "Say 'Allahu Akbar' and go down into prostration. Seven body parts must touch the ground: the forehead and nose, both palms, both knees, and the toes of both feet. Say 'Subhana Rabbiyal A'la' three times (the sunnah; once is the minimum). This is the closest a servant is to Allah (Muslim 4:262).",
    maleNote: "Keep the arms away from the sides, abdomen away from the thighs",
    femaleNote: "Keep the body more compact, arms closer to the sides",
  },
  {
    position: "sitting",
    label: "Sitting Between Prostrations",
    arabic: "رَبِّ اغْفِرْ لِي رَبِّ اغْفِرْ لِي",
    transliteration: "Rabbighfir li, Rabbighfir li",
    translation: "My Lord, forgive me. My Lord, forgive me.",
    instruction:
      "Say 'Allahu Akbar' and sit up. Sit on the left foot with the right foot upright (iftirash). Say 'Rabbighfir li' (My Lord, forgive me) between the two prostrations.",
  },
  {
    position: "prostrating",
    label: "Second Sujud",
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    transliteration: "Subhana Rabbiyal A'la",
    translation: "Glory be to my Lord, the Most High",
    instruction:
      "Say 'Allahu Akbar' and prostrate again. Say 'Subhana Rabbiyal A'la' three times, then say 'Allahu Akbar' and rise for the next rak'ah (or sit for tashahhud if this is the 2nd or final rak'ah).",
  },
  {
    position: "sitting",
    label: "Tashahhud (Testimony of Faith)",
    arabic:
      "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration:
      "At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu 'alayka ayyuhan-Nabiyyu wa rahmatullahi wa barakatuh. As-salamu 'alayna wa 'ala 'ibadillahis-salihin. Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh.",
    translation:
      "All greetings, prayers, and pure words are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger.",
    instruction:
      "Sit after the 2nd rak'ah (and the final rak'ah). Point the right index finger while reciting 'Ash-hadu an la ilaha illallah'. In the final tashahhud, add the Salawat on the Prophet (Ibrahimiyyah) after this.",
  },
  {
    position: "sitting",
    label: "Salawat al-Ibrahimiyyah",
    arabic:
      "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration:
      "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammadin kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidun Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammadin kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidun Majid.",
    translation:
      "O Allah, send Your grace upon Muhammad and the family of Muhammad, as You sent Your grace upon Ibrahim and the family of Ibrahim. Truly, You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. Truly, You are Praiseworthy, Glorious.",
    instruction:
      "Recite this in the final sitting (last rak'ah) after the tashahhud. Then you may make any personal du'a before the taslim. The Prophet (peace be upon him) said: 'Then let him choose whatever supplication he wishes' (Bukhari 10:228).",
  },
  {
    position: "taslim-right",
    label: "Taslim — Right",
    arabic: "السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
    transliteration: "As-salamu 'alaykum wa rahmatullah",
    translation: "Peace be upon you and the mercy of Allah",
    instruction:
      "Turn your head to the right and say 'As-salamu alaykum wa rahmatullah'. You are greeting the angel on your right shoulder.",
  },
  {
    position: "taslim-left",
    label: "Taslim — Left",
    arabic: "السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
    transliteration: "As-salamu 'alaykum wa rahmatullah",
    translation: "Peace be upon you and the mercy of Allah",
    instruction:
      "Turn your head to the left and say 'As-salamu alaykum wa rahmatullah'. You are greeting the angel on your left shoulder. The prayer is now complete.",
  },
  {
    position: "sitting",
    label: "After the Taslim — Adhkar",
    arabic: "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ",
    transliteration:
      "Astaghfirullah, Astaghfirullah, Astaghfirullah. Allahumma Antas-Salam wa minkas-salam, tabarakta ya Dhal-jalali wal-ikram.",
    translation:
      "I seek Allah's forgiveness (three times). O Allah, You are As-Salam and from You is all peace. Blessed are You, O Possessor of majesty and honour.",
    instruction:
      "The prayer ends, but the sunnah continues. Remain seated: the Prophet ﷺ, when he finished his prayer, would beg forgiveness three times (Astaghfirullah) and then say 'Allahumma Antas-Salam...' (Muslim 5:171; Ibn Majah 5:126). Then glorify Allah: say SubhanAllah 33 times, Alhamdulillah 33 times, and Allahu Akbar 33 times (Muslim 5:184), completing one hundred with 'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir' — whoever does so, 'his sins will be forgiven even if these are as abundant as the foam of the sea' (Muslim 5:188). The Prophet ﷺ also commanded reciting the mu'awwidhat — the protective surahs at the end of the Quran — after every prayer (Abu Dawud 8:108; Nasai 13:158), and scholars also recommend Ayat al-Kursi (Quran 2:255) after each prayer. See Duas → After Completing Prayer for the full set.",
  },
];

/* ───────────────────────── prayer info data ───────────────────────── */

type Prayer = {
  id: string;
  name: string;
  nameAr: string;
  time: string;
  fardRakaat: number;
  sunnahBefore: number;
  sunnahAfter: number;
  additionalNote: string;
  description: string;
  verse?: { arabic: string; text: string; ref: string };
  hadith?: { text: string; ref: string };
};

const prayers: Prayer[] = [
  {
    id: "fajr",
    name: "Fajr",
    nameAr: "الفجر",
    time: "From true dawn until sunrise",
    fardRakaat: 2,
    sunnahBefore: 2,
    sunnahAfter: 0,
    additionalNote:
      "The 2 sunnah rak'at before Fajr are the most emphasized voluntary prayer. The Prophet (peace be upon him) said: 'The two rak'at of Fajr are better than the world and everything in it' (Muslim 6:118). Recitation in the fard is done aloud.",
    description:
      "The dawn prayer — the first prayer of the day, prayed between the break of true dawn (when the white light spreads horizontally across the horizon) and sunrise.",
    verse: {
      arabic: "أَقِمِ ٱلصَّلَوٰةَ لِدُلُوكِ ٱلشَّمْسِ إِلَىٰ غَسَقِ ٱلَّيْلِ وَقُرْءَانَ ٱلْفَجْرِ ۖ إِنَّ قُرْءَانَ ٱلْفَجْرِ كَانَ مَشْهُودًۭا",
      text: "Establish prayer at the decline of the sun until the darkness of the night, and the Quran at dawn. Indeed, the recitation of dawn is ever witnessed.",
      ref: "Quran 17:78",
    },
    hadith: {
      text: "Whoever prays the two cool prayers (Fajr and Asr) will enter Paradise.",
      ref: "Bukhari 9:50",
    },
  },
  {
    id: "dhuhr",
    name: "Dhuhr",
    nameAr: "الظهر",
    time: "After the sun passes its zenith until the shadow of an object equals its height",
    fardRakaat: 4,
    sunnahBefore: 4,
    sunnahAfter: 2,
    additionalNote:
      "On Friday, Dhuhr is replaced by the Jumu'ah (Friday) prayer for men, which is 2 rak'at preceded by a khutbah (sermon) — see the Jumu'ah section in this list. The Prophet (peace be upon him) warned about neglecting Jumu'ah (Nasai 14:6). Recitation in Dhuhr is silent.",
    description:
      "The noon prayer — prayed after the sun has passed its highest point (zenith) and begins to decline. It is the prayer at the middle of the day.",
    hadith: {
      text: "Whoever consistently prays four rak'at before Dhuhr and four after it, Allah will forbid the Hellfire for him. (Note: this refers to additional voluntary prayers beyond the regular 2 sunnah after Dhuhr.)",
      ref: "Tirmidhi 2:281",
    },
  },
  {
    id: "asr",
    name: "Asr",
    nameAr: "العصر",
    time: "When the shadow of an object equals its height until sunset",
    fardRakaat: 4,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "There are no confirmed regular sunnah prayers for Asr, though voluntary prayers before it are praiseworthy. The Prophet (peace be upon him) warned strongly about missing Asr: 'Whoever misses the Asr prayer, it is as if he lost his family and property' (Bukhari 9:29). Recitation is silent.",
    description:
      "The afternoon prayer — prayed when the shadow of an object is equal to its actual length (after Dhuhr time ends) until sunset. It is specifically emphasized in the Quran as the 'middle prayer'.",
    verse: {
      arabic: "حَـٰفِظُوا عَلَى ٱلصَّلَوَٰتِ وَٱلصَّلَوٰةِ ٱلْوُسْطَىٰ",
      text: "Maintain the prayers and [especially] the middle prayer.",
      ref: "Quran 2:238",
    },
    hadith: {
      text: "Whoever misses the Asr prayer, it is as if he lost his family and property.",
      ref: "Bukhari 9:29",
    },
  },
  {
    id: "maghrib",
    name: "Maghrib",
    nameAr: "المغرب",
    time: "From sunset until the red twilight disappears",
    fardRakaat: 3,
    sunnahBefore: 0,
    sunnahAfter: 2,
    additionalNote:
      "Maghrib has a narrow window — it should be prayed soon after sunset. The 3 fard rak'at are unique: the first 2 have audible recitation, and the 3rd is silent with only Al-Fatihah. The 2 sunnah rak'at after Maghrib are part of the 12 confirmed rawatib sunnah (Muslim 6:124).",
    description:
      "The sunset prayer — prayed immediately after the sun has fully set below the horizon. Its time ends when the red twilight (shafaq) disappears from the sky.",
    hadith: {
      text: "The time for Maghrib prayer is when the sun sets, as long as the twilight has not disappeared.",
      ref: "Muslim 5:223",
    },
  },
  {
    id: "isha",
    name: "Isha",
    nameAr: "العشاء",
    time: "After the red twilight disappears until the middle of the night",
    fardRakaat: 4,
    sunnahBefore: 0,
    sunnahAfter: 2,
    additionalNote:
      "After the 2 sunnah, the Witr prayer is highly recommended — the Prophet (peace be upon him) never left it, even while traveling. Witr is an odd number of rak'at (most commonly 1 or 3). He said: 'Make the last of your night prayer Witr' (Bukhari 14:9). The first 2 rak'at of Isha fard are recited aloud, the last 2 silently.",
    description:
      "The night prayer — prayed after the disappearance of the red/white twilight. Its preferred time extends until the middle of the night, though it remains valid until Fajr.",
    hadith: {
      text: "If the people knew what reward is in the Fajr and Isha prayers, they would come to them even if they had to crawl.",
      ref: "Bukhari 10:51",
    },
  },
];

/* ───────────────────────── types of prayer ───────────────────────── */

const prayerTypes = [
  {
    id: "fard",
    name: "Fard (Obligatory)",
    nameAr: "فرض",
    detail:
      "The five daily prayers are fard 'ayn — an individual obligation upon every sane, adult Muslim. Missing them intentionally is a major sin. The Prophet (peace be upon him) said: 'Between a man and shirk (polytheism) and kufr (disbelief) is the abandoning of prayer.'",
    examples: "Fajr (2), Dhuhr (4), Asr (4), Maghrib (3), Isha (4) — plus Jumu'ah (2) on Fridays for men",
    ruling: "Obligatory — sinful to miss without valid excuse",
    ref: "Muslim 1:147; Nasai 5:18",
  },
  {
    id: "sunnah-muakkadah",
    name: "Sunnah Mu'akkadah (Confirmed Sunnah)",
    nameAr: "سنة مؤكدة",
    detail:
      "These are prayers the Prophet (peace be upon him) prayed consistently and rarely missed. They are strongly recommended — not sinful to miss occasionally, but consistently abandoning them is blameworthy. They are also called the rawatib (regular sunnah prayers).",
    examples: "2 before Fajr, 4 before Dhuhr, 2 after Dhuhr, 2 after Maghrib, 2 after Isha — 12 total",
    ruling: "Strongly recommended — the Prophet rarely left them",
    ref: "Muslim 6:124; Tirmidhi 2:283",
  },
  {
    id: "sunnah-ghair",
    name: "Sunnah Ghair Mu'akkadah (Non-Confirmed Sunnah)",
    nameAr: "سنة غير مؤكدة",
    detail:
      "Voluntary prayers the Prophet (peace be upon him) prayed sometimes but not consistently. They carry reward but there is no blame for leaving them. These include extra prayers before Asr or Isha, and additional rak'at beyond the rawatib.",
    examples: "4 before Asr, 2 before Maghrib, 2 before Isha, additional rak'at of Duha",
    ruling: "Recommended — rewarded for praying, no blame for leaving",
    ref: "Tirmidhi 2:282; Abu Dawud 5:2",
  },
  {
    id: "witr",
    name: "Witr",
    nameAr: "وتر",
    detail:
      "The Witr prayer is prayed after Isha and is an odd number of rak'at — most commonly 1 or 3, though up to 11 is narrated. The Prophet (peace be upon him) never left it, even while traveling. According to the Hanafi school, Witr is wajib (necessary); the other schools consider it a confirmed sunnah. It includes the Qunut supplication in the last rak'ah.",
    examples: "1 rak'ah, or 3 (with 2 + salam + 1, or 3 continuous), up to 11",
    ruling: "Wajib according to Hanafis; Sunnah Mu'akkadah for others",
    ref: "Bukhari 14:9; Muslim 6:153",
  },
  {
    id: "nafl",
    name: "Nafl (Voluntary)",
    nameAr: "نفل",
    detail:
      "Any voluntary prayer beyond the fard and sunnah prayers. These are prayed to draw closer to Allah and earn extra reward. They include Tahajjud, Duha, Tawbah, Istikhara, and any general voluntary rak'at. Allah says in a hadith qudsi: 'My servant continues to draw near to Me with voluntary acts of worship until I love him.'",
    examples: "Tahajjud, Duha, Salat at-Tawbah, Istikhara, Salat al-Haajah",
    ruling: "Voluntary — rewarded for praying, no blame for leaving",
    ref: "Bukhari 81:38",
  },
  {
    id: "fard-kifayah",
    name: "Fard Kifayah (Communal Obligation)",
    nameAr: "فرض كفاية",
    detail:
      "A communal obligation — if a sufficient number of Muslims perform it, the obligation is lifted from the rest. If no one performs it, all are sinful. The main example is the Janazah (funeral) prayer. It is not an individual duty like the five daily prayers, but a community responsibility.",
    examples: "Janazah (funeral prayer)",
    ruling: "Obligatory on the community — if some perform it, others are excused",
    ref: "Bukhari 23:81; Muslim 11:67",
  },
];

/* ───────────────────────── voluntary / special prayers ───────────────────────── */

const voluntaryPrayers: Prayer[] = [
  {
    id: "tahajjud",
    name: "Tahajjud",
    nameAr: "التهجد",
    time: "After Isha until before Fajr (best in the last third of the night)",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "Tahajjud is not obligatory but is the most virtuous voluntary prayer. It is prayed in sets of 2 rak'at, typically 2 to 12 rak'at, followed by Witr. The Prophet (peace be upon him) would regularly pray 11 rak'at at night (Bukhari 9:50). Recitation is done aloud or quietly — both are permissible. The last third of the night is when Allah descends to the lowest heaven and says: 'Who is calling upon Me, that I may answer him?' (Bukhari 19:26, Muslim 6:201).",
    description:
      "The voluntary night prayer — prayed after sleeping and waking in the latter part of the night. It is a deeply personal act of devotion, praised extensively in the Quran and Sunnah. Allah described the people of Tahajjud as those whose 'sides forsake their beds' in worship.",
    verse: {
      arabic: "وَمِنَ ٱلَّيْلِ فَتَهَجَّدْ بِهِۦ نَافِلَةًۭ لَّكَ عَسَىٰٓ أَن يَبْعَثَكَ رَبُّكَ مَقَامًۭا مَّحْمُودًۭا",
      text: "And in a part of the night, pray Tahajjud as an additional prayer for you. It may be that your Lord will raise you to a praised station.",
      ref: "Quran 17:79",
    },
    hadith: {
      text: "The best prayer after the obligatory prayers is the night prayer (Tahajjud).",
      ref: "Muslim 13:261",
    },
  },
  {
    id: "witr",
    name: "Witr",
    nameAr: "الوتر",
    time: "After Isha until Fajr — prayed as the last prayer of the night",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "Witr is an odd number of rak'at — 1 at minimum, most commonly 3 (prayed as 2 rak'at + taslim + 1, or as 3 continuous — scholars describe both formats), and more for those who lengthen the night prayer: Aisha (may Allah be pleased with her) reported that the Prophet (peace be upon him) used to pray thirteen rak'ahs during the night, observing the witr prayer with nine (Abu Dawud 5:101). In the final rak'ah the Qunut supplication is recited — the Prophet (peace be upon him) taught its words to his grandson al-Hasan ibn Ali (Nasai 20:148; Abu Dawud 8:10; Tirmidhi 3:12): 'Allahumma ihdini fiman hadayta, wa 'afini fiman 'afayta, wa tawallani fiman tawallayta, wa barik li fima a'tayta, wa qini sharra ma qadayta, fa innaka taqdi wa la yuqda 'alayk, wa innahu la yadhillu man walayta, tabarakta Rabbana wa ta'alayt.' Ubayy ibn Ka'b, leading the companions in prayer during Ramadan, would recite the Qunut during the second half of the month (Abu Dawud 8:13); scholars describe both Ramadan-only and year-round practice.",
    description:
      "The odd-numbered prayer that seals the night, prayed after Isha — on its own, or as the conclusion of Tahajjud or Tarawih. According to the Hanafi school Witr is wajib (necessary); the other schools consider it an emphasized sunnah.",
    verse: {
      arabic: "‏ اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِي فِيمَنْ عَافَيْتَ وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ وَبَارِكْ لِي فِيمَا أَعْطَيْتَ وَقِنِي شَرَّ مَا قَضَيْتَ إِنَّكَ تَقْضِي وَلاَ يُقْضَى عَلَيْكَ وَإِنَّهُ لاَ يَذِلُّ مَنْ وَالَيْتَ تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ ‏",
      text: "O Allah, guide me among those whom You have guided, pardon me among those You have pardoned, turn to me in friendship among those on whom You have turned in friendship, and bless me in what You have bestowed, and save me from the evil of what You have decreed. For verily You decree and none can influence You; and he is not humiliated whom You have befriended. Blessed are You, O Lord, and Exalted.",
      ref: "Nasai 20:148 — the Qunut of Witr; also Abu Dawud 8:10; Tirmidhi 3:12",
    },
    hadith: {
      text: "Make witr as your last prayer at night.",
      ref: "Bukhari 14:9",
    },
  },
  {
    id: "duha",
    name: "Duha",
    nameAr: "الضحى",
    time: "From 15–20 minutes after sunrise until before the sun reaches its zenith",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "Duha can be prayed as few as 2 rak'at and up to 12. The most common is 2–4. When prayed shortly after sunrise, it is also called Ishraq. The Prophet (peace be upon him) said: 'In the morning, charity is due on every joint of the body. Every tasbeeh is charity, every tahmeed is charity, every tahleel is charity... and two rak'at of Duha suffice for all of that' (Muslim 6:101).",
    description:
      "The forenoon prayer — a highly recommended voluntary prayer prayed in the morning hours. When prayed shortly after sunrise, it is also known as Salat al-Ishraq.",
    verse: {
      arabic: "وَٱلضُّحَىٰ",
      text: "By the morning brightness.",
      ref: "Quran 93:1",
    },
    hadith: {
      text: "Whoever prays the Fajr prayer in congregation, then sits remembering Allah until the sun rises, then prays two rak'at, will have a reward like that of Hajj and Umrah — complete, complete, complete.",
      ref: "Tirmidhi 6:43 (graded da'if by some scholars; widely practiced)",
    },
  },
  {
    id: "tawbah",
    name: "Tawbah",
    nameAr: "التوبة",
    time: "Any time — prayed when seeking repentance from a sin",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "Salat at-Tawbah is 2 rak'at prayed after making wudu with the sincere intention of repenting to Allah. After completing the prayer, one should make istighfar (seek forgiveness) and sincerely resolve not to return to the sin. The conditions of tawbah are: stopping the sin, regretting it, and resolving not to repeat it. If the sin involved another person's rights, those must also be restored.",
    description:
      "The prayer of repentance — prayed when a Muslim commits a sin and wishes to turn back to Allah in sincere repentance. It is a beautiful act that combines physical worship with spiritual cleansing.",
    hadith: {
      text: "There is no servant who commits a sin, then performs wudu well, then stands and prays two rak'at, then asks Allah for forgiveness, except that Allah forgives him.",
      ref: "Abu Dawud 8:106; Tirmidhi 2:259",
    },
  },
  {
    id: "istikhara",
    name: "Istikhara",
    nameAr: "الاستخارة",
    time: "Any time — prayed when facing a decision and seeking Allah's guidance",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "Istikhara is 2 rak'at of voluntary prayer, followed by the specific du'a of Istikhara in which you ask Allah to guide you toward what is best. It is not about seeing a dream or a sign — rather, it is entrusting the decision to Allah and proceeding with what feels right. The Prophet (peace be upon him) taught this for all matters, saying: 'If any of you is concerned about a decision, let him pray two rak'at of non-obligatory prayer...' (Bukhari 19:45). The du'a includes: 'O Allah, if You know this matter to be good for me... then decree it for me.'",
    description:
      "The prayer of seeking guidance — prayed before making any important decision. The word 'istikhara' means seeking the best outcome from Allah. It is one of the most practical sunnah prayers, applicable to marriage, career, travel, and any significant choice.",
    hadith: {
      text: "If any of you is concerned about a decision he has to make, let him pray two rak'at of non-obligatory prayer, then say: 'O Allah, I seek Your guidance by virtue of Your knowledge...'",
      ref: "Bukhari 14:9",
    },
  },
  {
    id: "tahiyyat",
    name: "Tahiyyat al-Masjid",
    nameAr: "تحية المسجد",
    time: "Upon entering the mosque, any time of day, before sitting down",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "The Prophet (peace be upon him) kept this greeting of the mosque even on arrival from travel: whenever he returned from a journey in the forenoon, he would enter the mosque and offer two rak'at before sitting (Bukhari 56:292). Scholars state that any prayer performed upon entering — the Fajr sunnah, or a fard prayer — takes its place, since the aim is that the mosque is greeted with prayer before one sits down.",
    description:
      "The 'greeting of the mosque' — two voluntary rak'at prayed on entering any mosque, before sitting down. A simple sunnah that turns every arrival at the mosque into worship.",
    hadith: {
      text: "When any one of you enters the mosque, he should pray two rakahs before sitting down.",
      ref: "Abu Dawud 2:77",
    },
  },
  {
    id: "tarawih",
    name: "Tarawih",
    nameAr: "التراويح",
    time: "After Isha prayer, during the month of Ramadan only",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "Tarawih is prayed in sets of 2 rak'at. The number varies — 8 rak'at (the practice of Aisha's narration, Bukhari 31:6) or 20 rak'at (the practice established by Umar ibn al-Khattab in congregation). Both are valid. The entire Quran is typically recited over the course of Ramadan in Tarawih at the masjid. It is concluded with Witr prayer.",
    description:
      "The Ramadan night prayer — a special congregational prayer prayed every night during the month of Ramadan. The word 'tarawih' means 'rest,' as worshippers would rest between every 4 rak'at due to its length.",
    hadith: {
      text: "Whoever stands in prayer during Ramadan out of sincere faith and seeking reward, his previous sins will be forgiven.",
      ref: "Bukhari 2:30; Muslim 6:207",
    },
  },
  {
    id: "kusuf",
    name: "Eclipse (Kusuf)",
    nameAr: "الكسوف",
    time: "When a solar or lunar eclipse occurs — prayed until the eclipse clears",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "The eclipse prayer has a form found in no other prayer: two rak'at with two bowings and two long recitations in each rak'ah — four bowings and four prostrations in all — recited aloud (Bukhari 16:11; Bukhari 16:24). The sun eclipsed on the day the Prophet's son Ibrahim died, and people said the eclipse was for his death; the Prophet (peace be upon him) immediately corrected this (Bukhari 16:4). He prayed until the eclipse had cleared, and instructed the believers to pray and invoke Allah whenever they see one (Bukhari 16:1).",
    description:
      "Salat al-Kusuf — the congregational prayer at a solar or lunar eclipse. The eclipse is one of the signs of Allah, not an omen tied to anyone's birth or death.",
    hadith: {
      text: "The sun and the moon do not eclipse because of the death or life (i.e. birth) of someone. When you see the eclipse pray and invoke Allah.",
      ref: "Bukhari 16:4",
    },
  },
  {
    id: "istisqa",
    name: "Rain (Istisqa)",
    nameAr: "الاستسقاء",
    time: "When rain is withheld — prayed in an open area outside the town",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "Abbad bin Tamim's uncle described it: the Prophet (peace be upon him) went out to invoke Allah for rain, faced the qiblah, turned his cloak inside out, and led two rak'at reciting the Quran aloud (Bukhari 15:19; Bukhari 15:20). It is prayed without adhan or iqamah (Bukhari 15:17). Rain may also simply be asked for in du'a: when a man stood up during the Friday khutbah saying the livestock were dying and the roads were cut off, the Prophet (peace be upon him) prayed for rain — and it rained from that Friday to the next (Bukhari 15:14).",
    description:
      "Salat al-Istisqa — the prayer for rain in drought. The community goes out humbly to an open place, and the imam turns his cloak inside out as the Prophet (peace be upon him) did (Bukhari 15:1; Bukhari 15:6).",
    hadith: {
      text: "The Prophet (peace be upon him) went towards the Musalla and invoked Allah for rain. He faced the Qibla and wore his cloak inside out, and offered two rak'at.",
      ref: "Bukhari 15:7",
    },
  },
  {
    id: "eid",
    name: "Eid",
    nameAr: "العيد",
    time: "After sunrise on Eid al-Fitr (1st Shawwal) and Eid al-Adha (10th Dhul Hijjah)",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "Eid prayer is 2 rak'at with additional takbirat: 7 extra in the first rak'ah and 5 in the second (Shafi'i/Hanbali/Maliki view), or 3 extra in each rak'ah (Hanafi view). There is no adhan or iqamah. It is followed by a khutbah (sermon). Most scholars consider it wajib (obligatory) or a strongly emphasized sunnah. It is prayed in an open area (musalla) when possible, as was the Prophet's practice. Eid-day sunnahs: on Eid al-Fitr the Prophet (peace be upon him) never proceeded to the prayer unless he had eaten some dates — an odd number of them (Bukhari 13:5) — while on Eid al-Adha he would not eat until he had prayed (Tirmidhi 5:13). He used to come to the Eid prayer walking, and return home by a different route than the one he came by (Ibn Majah 5:498; Ibn Majah 5:496).",
    description:
      "The prayer of the two Eids — Eid al-Fitr (celebrating the end of Ramadan) and Eid al-Adha (the Festival of Sacrifice during Hajj). It is a joyous communal prayer that unites the Muslim community in gratitude to Allah.",
    hadith: {
      text: "The Prophet (peace be upon him) would go out on the day of Eid al-Fitr and Eid al-Adha to the musalla, and the first thing he would do was pray.",
      ref: "Bukhari 13:8",
    },
  },
  {
    id: "janazah",
    name: "Janazah",
    nameAr: "الجنازة",
    time: "Any time — prayed upon the death of a Muslim, before burial",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "Janazah prayer has a unique structure: 4 takbirat with no ruku' or sujud. After the 1st takbir: recite Al-Fatihah. After the 2nd: recite the Salawat al-Ibrahimiyyah. After the 3rd: make du'a for the deceased. After the 4th: make a brief du'a, then give one taslim to the right. It is a fard kifayah — a communal obligation (if some perform it, the obligation is lifted from the rest). The Prophet (peace be upon him) said: 'Whoever attends the funeral procession till he offers the funeral prayer for it, will get a reward equal to one Qirat' (Bukhari 23:81). For the du'a after the third takbir, Abu Hurairah reported the Prophet's (peace be upon him) words — given below (Ibn Majah 6:66; shorter versions in Tirmidhi 10:60 and Nasai 21:169).",
    verse: {
      arabic: "‏ اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَصَغِيرِنَا وَكَبِيرِنَا وَذَكَرِنَا وَأُنْثَانَا اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الإِسْلاَمِ وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الإِيمَانِ اللَّهُمَّ لاَ تَحْرِمْنَا أَجْرَهُ وَلاَ تُضِلَّنَا بَعْدَهُ ‏",
      text: "O Allah, forgive our living and our dead, those who are present and those who are absent, our young and our old, our males and our females. O Allah, whomever of us You cause to live, let him live in Islam, and whomever of us You cause to die, let him die in (a state of) faith. O Allah, do not deprive us of his reward, and do not let us go astray after him.",
      ref: "Ibn Majah 6:66 — the du'a for the deceased after the third takbir",
    },
    description:
      "The funeral prayer — a unique prayer performed for a deceased Muslim. It is a communal obligation (fard kifayah) and differs from all other prayers in that it has no bowing or prostration, only four standing takbirat with specific recitations between them.",
    hadith: {
      text: "Whoever attends the funeral until the prayer is offered will have one qirat of reward, and whoever stays until the burial will have two qirat. It was asked: 'What are the two qirat?' He said: 'Like two great mountains.'",
      ref: "Bukhari 23:81; Muslim 11:67",
    },
  },
];

const prayerSituationTopics: Topic[] = [
  {
    id: "congregation",
    name: "In Congregation",
    content: {
      intro:
        "Praying together in congregation (jama'ah) is the default form of the five daily prayers for men and the heart of the mosque's life. When a group of young companions stayed with the Prophet ﷺ, he sent them home with the words: 'Pray as you have seen me praying and when it is the time for the prayer one of you should pronounce the Adhan and the oldest of you should lead the prayer' (Bukhari 10:28). This guide covers the reward of the congregation, how to follow the imam, and what to do on your first visit to the mosque.",
      points: [
        {
          title: "Twenty-seven times the reward",
          detail:
            "The Prophet ﷺ said: 'The prayer in congregation is twenty seven times superior to the prayer offered by a person alone.' Scholars state that for men, praying the obligatory prayers with the congregation is an emphasized duty that should not be neglected without a valid excuse — some hold it to be obligatory.",
          note: "Bukhari 10:42; Bukhari 10:46",
        },
        {
          title: "Follow the imam — never move before him",
          detail:
            "The Prophet ﷺ said: 'The Imam is appointed to be followed. So recite takbir when he recites it, and bow down when he bows down.' Every movement comes after the imam's: bow when he bows, rise when he rises, and when he says 'Sami'Allahu liman hamidah' respond with 'Rabbana wa lakal hamd'. When the Prophet ﷺ was injured falling from a horse, he led the prayer sitting and taught the same principle.",
          note: "Muslim 4:97; Bukhari 10:116; Bukhari 10:83",
        },
        {
          title: "Straighten the rows",
          detail:
            "The Prophet ﷺ said: 'Straighten your rows as the straightening of rows is essential for a perfect and correct prayer,' and: 'Straighten your rows, for I see you from behind my back.' Stand shoulder to shoulder, close together, filling the row without gaps.",
          note: "Bukhari 10:117; Bukhari 10:113; Bukhari 10:114",
        },
        {
          title: "Joining late — catching a rak'ah",
          detail:
            "Never run for the prayer. The Prophet ﷺ said: 'When you hear the Iqama, proceed to offer the prayer with calmness and solemnity and do not make haste. And pray whatever you are able to pray and complete whatever you have missed.' Join the imam in whatever position he is in with the opening takbir; after his taslim, stand and complete the rak'at you missed. The majority of scholars state that you have caught a rak'ah if you join before the imam rises from its ruku'.",
          note: "Bukhari 10:33",
        },
        {
          title: "Women and the mosque",
          detail:
            "The Prophet ﷺ said: 'Do not prevent the maid-servants of Allah from going to the mosque.' Women are welcome in the houses of Allah — the narration of Abu Dawud adds that they should come without wearing perfume.",
          note: "Muslim 4:152; Abu Dawud 2:175",
        },
        {
          title: "Keep some prayer at home",
          detail:
            "The congregation is for the fard; voluntary prayer is best offered at home. The Prophet ﷺ said: 'Offer some of your prayers in your houses and do not make them graves,' and: 'the best prayer of a person is that which he prays in his house except the compulsory prayers.'",
          note: "Bukhari 19:63; Bukhari 10:125",
        },
      ],
      source:
        "Sources: Bukhari 10:28, 10:33, 10:42, 10:46, 10:83, 10:113, 10:114, 10:116, 10:117, 10:125, 19:63; Muslim 4:97, 4:152; Abu Dawud 2:175.",
    },
  },
  {
    id: "sujud-sahw",
    name: "Mistakes & Sujud al-Sahw",
    content: {
      intro:
        "Everyone loses count of rak'at or forgets a sitting sooner or later — the Prophet ﷺ himself did, and he showed exactly what to do. The remedy is sujud al-sahw, the prostration of forgetfulness: two extra prostrations that repair the prayer, so an honest mistake never means starting over.",
      points: [
        {
          title: "You forgot the middle sitting",
          detail:
            "The Prophet ﷺ once stood up after the second rak'ah of Zuhr without sitting for the first tashahhud. He did not go back — he simply continued, and at the end of the prayer performed two prostrations before the taslim. If you realize mid-prayer that you skipped the middle sitting, carry on and prostrate twice at the end.",
          note: "Bukhari 22:2",
        },
        {
          title: "You prayed too many rak'at",
          detail:
            "The Prophet ﷺ once offered five rak'at in Zuhr. When asked about it afterwards, he performed two prostrations of sahw after the taslim. An accidental addition does not invalidate the prayer — prostrate twice when you learn of it.",
          note: "Bukhari 22:3",
        },
        {
          title: "You said the taslim too early",
          detail:
            "In the famous incident of Dhul-Yadain, the Prophet ﷺ ended the prayer after two rak'at of a four-rak'ah prayer. When his companions confirmed it, he stood, offered the two remaining rak'at, and then performed the two prostrations. If you end the prayer early by mistake, complete what remains and prostrate.",
          note: "Bukhari 22:4",
        },
        {
          title: "You are not sure how many you prayed",
          detail:
            "The Prophet ﷺ taught that when any one of you doubts how much he has prayed — three rak'at or four — 'he should cast aside his doubt and base his prayer on what he is sure of' — build on the smaller number, then prostrate twice before the taslim. He also taught that this doubt comes from Satan, and that its cure is 'two prostrations of Sahu while sitting'.",
          note: "Muslim 5:110; Bukhari 22:10",
        },
        {
          title: "How to perform it",
          detail:
            "Sujud al-sahw is simply two prostrations like the prostrations of your prayer, made while sitting at its end — in the narrations they were offered both just before the taslim and just after it, and scholars state that both timings are valid, following the situation in each narration. Nothing else is repeated and the prayer counts.",
          note: "Bukhari 22:2; Bukhari 22:3; Muslim 5:110",
        },
      ],
      source:
        "Sources: Bukhari 22:2, 22:3, 22:4, 22:10; Muslim 5:110.",
    },
  },
  {
    id: "missed",
    name: "Missed Prayers",
    content: {
      intro:
        "Slept through Fajr? Realized at night that Asr never happened? The sunnah gives a clear and merciful answer for the one who misses a prayer without meaning to — and for the one returning after years away, the door is wide open.",
      points: [
        {
          title: "Pray it as soon as you remember",
          detail:
            "The Prophet ﷺ said: 'Whoever forgets a prayer, let him pray it when he remembers it.' In another narration he added Allah's words: 'and perform the Salah for My remembrance' (Ta-Ha 20:14). There is no other penalty and no extra ritual — the make-up (qada) is simply the prayer itself, prayed as soon as you are able.",
          note: "Nasai 6:120; Nasai 6:126",
        },
        {
          title: "Sleeping through is not negligence",
          detail:
            "When companions slept through a prayer on a journey, the Prophet ﷺ said: 'There is no negligence when one sleeps, rather negligence is when one is awake. If any one of you forgets a prayer or sleeps and misses it, let him pray it when he remembers it.' Take the practical means — set the alarm, sleep on time — but if sleep genuinely overtakes you, pray on waking without guilt.",
          note: "Nasai 6:122",
        },
        {
          title: "Keep the order when you can",
          detail:
            "Scholars advise that when a missed prayer and the current prayer are both due, you pray the missed one first and then the one whose time it is, keeping the prayers in their order — unless the current prayer's time is about to run out.",
        },
        {
          title: "Years of missed prayers",
          detail:
            "For someone returning to salah after a long lapse, scholars state the essentials are sincere repentance and guarding the five prayers from today onward. The majority advise then making up the missed years gradually — for example one make-up prayer alongside each daily prayer — while others hold that sincere repentance together with abundant voluntary prayer suffices. Whichever position you follow, never let the size of the backlog delay today's prayer.",
        },
        {
          title: "Deliberate abandonment is different",
          detail:
            "Missing prayers knowingly and habitually is not a technicality but a breach of the covenant — the Prophet ﷺ said: 'The covenant between us and them is the Salat, so whoever abandons it he has committed disbelief.' The answer is the same door: repent, and begin again today.",
          note: "Tirmidhi 40:16",
        },
      ],
      source:
        "Sources: Nasai 6:120, 6:122, 6:126; Tirmidhi 40:16; general guidance on qada as stated by the scholars.",
    },
  },
  {
    id: "traveling",
    name: "When Traveling",
    content: {
      intro:
        "Travel unsettles every routine, so Allah lightened the prayer itself for the traveler — a concession the Prophet ﷺ called an act of charity from Allah. Two rulings cover it: shortening the prayer (qasr) and combining two prayers in one time (jam').",
      verse: {
        arabic: "وَإِذَا ضَرَبْتُمْ فِى ٱلْأَرْضِ فَلَيْسَ عَلَيْكُمْ جُنَاحٌ أَن تَقْصُرُوا۟ مِنَ ٱلصَّلَوٰةِ إِنْ خِفْتُمْ أَن يَفْتِنَكُمُ ٱلَّذِينَ كَفَرُوٓا۟ ۚ إِنَّ ٱلْكَـٰفِرِينَ كَانُوا۟ لَكُمْ عَدُوًّا مُّبِينًا",
        text: "When you are traveling through the land, there is no blame on you to shorten the prayer, if you fear that the disbelievers may harm you. Indeed, the disbelievers are your open enemy.",
        ref: "Quran 4:101",
      },
      points: [
        {
          title: "Shorten the four-rak'ah prayers to two (qasr)",
          detail:
            "Anas (may Allah be pleased with him) said: 'I offered four rak'at of Zuhr prayer with the Prophet ﷺ at Medina and two rak'at at Dhul-Hulaifa' — the very first stop of the journey. On the road, Dhuhr, Asr, and Isha are prayed as two rak'at each. Scholars state that qasr applies only to the four-rak'ah prayers: Fajr remains two and Maghrib remains three.",
          note: "Bukhari 18:10",
        },
        {
          title: "Accept the concession — even when safe",
          detail:
            "The verse mentions fear, so Umar (may Allah be pleased with him) asked the Prophet ﷺ why people still shorten the prayer in safety. He replied: 'It is an act of charity which Allah has done to you, so accept His charity.' Shortening is not a lesser prayer — it is the sunnah of the traveler.",
          note: "Muslim 6:4",
        },
        {
          title: "Combine Zuhr with Asr, and Maghrib with Isha (jam')",
          detail:
            "On the expedition to Tabuk, the Prophet ﷺ combined the noon prayer with the afternoon prayer and the sunset prayer with the Isha prayer. Asked why, Ibn Abbas said: 'He wanted that his Ummah should not be put to (unnecessary) hardship.' On a journey you may pray the two prayers together in the time of either one. Scholars state that Fajr is never combined with another prayer.",
          note: "Muslim 6:61",
        },
        {
          title: "How far, and for how long?",
          detail:
            "The Prophet ﷺ once stayed nineteen days shortening the prayer, so Ibn Abbas would shorten for up to nineteen days of a stopover and pray in full beyond that. The minimum distance that counts as travel and the maximum stay are matters of scholarly difference — a commonly taught position is roughly 80 km and a stay of up to four days, but follow a reliable scholar's guidance for your school.",
          note: "Bukhari 18:1",
        },
        {
          title: "On the plane, train, or road",
          detail:
            "Scholars state that a prayer whose time will fully pass during a flight is prayed on board: standing and facing the qiblah if there is space, otherwise seated in your seat, gesturing for ruku' and sujud with the bow for sujud deeper — the same concession chain as the prayer of the ill. Combining (jam') often removes the difficulty entirely by letting you pray before takeoff or after landing.",
        },
      ],
      source:
        "Sources: Quran 4:101; Bukhari 18:1, 18:10; Muslim 6:4, 6:61; distance and duration limits as stated by the scholars.",
    },
  },
  {
    id: "illness",
    name: "When Ill or Seated",
    content: {
      intro:
        "Illness never cancels salah — instead, salah bends around the illness. The Prophet ﷺ laid out a chain of concessions that keeps the prayer within reach of every believer: standing, then sitting, then lying down — each fully valid for the one who cannot do more.",
      points: [
        {
          title: "The concession chain",
          detail:
            "Imran bin Husain (may Allah be pleased with him) suffered from piles and asked the Prophet ﷺ about the prayer. He said: 'Pray while standing and if you can't, pray while sitting and if you cannot do even that, then pray Lying on your side.' Do what you can, and the obligation is met.",
          note: "Bukhari 18:37",
        },
        {
          title: "The Prophet ﷺ himself prayed sitting",
          detail:
            "When he was injured falling from a horse, the Prophet ﷺ led one of the prayers sitting down, and the companions prayed seated behind him. Praying seated because of genuine inability is not a lesser prayer — it is the sunnah for that situation.",
          note: "Bukhari 10:83",
        },
        {
          title: "Full reward when you are excused",
          detail:
            "The Prophet ﷺ said: 'When a slave falls ill or travels, then he will get reward similar to that he gets for good deeds practiced at home when in good health.' Whoever normally stands in prayer and now cannot loses nothing of the reward.",
          note: "Bukhari 56:205; Abu Dawud 21:3",
        },
        {
          title: "Half reward — only for sitting by choice",
          detail:
            "The Prophet ﷺ said that the prayer of a man sitting is half the prayer, and in Abu Dawud's narration, lying down is half of sitting. Scholars explain that this applies to voluntary prayer offered sitting without an excuse — which is permitted — while the one who sits out of genuine inability receives the complete reward, as in the point above.",
          note: "Muslim 6:145; Abu Dawud 2:562",
        },
        {
          title: "Praying on a chair",
          detail:
            "Scholars state: stand for whichever parts you can and sit for the rest; if ruku' and sujud are impossible, gesture by bending forward, making the bow for sujud lower than the bow for ruku'. And if using water for wudu would harm you, purification is eased too — see Purification, Tayammum.",
        },
      ],
      source:
        "Sources: Bukhari 10:83, 18:37, 56:205; Muslim 6:145; Abu Dawud 2:562, 21:3; chair guidance as stated by the scholars.",
    },
  },
  {
    id: "invalidators",
    name: "What Breaks the Prayer",
    content: {
      intro:
        "The Purification section lists what breaks wudu — this is its counterpart for the prayer itself: the things that invalidate salah, and the common mistakes that quietly strip it of its reward.",
      points: [
        {
          title: "Rushing without stillness — the most common mistake",
          detail:
            "A man prayed in the mosque, then greeted the Prophet ﷺ, who told him three times: 'Go back and pray again for you have not prayed.' Then he taught him: 'bow with calmness till you feel at ease, then rise from bowing till you stand straight. Afterwards prostrate calmly till you feel at ease... and do the same in the whole of your prayer.' Tranquility (tuma'ninah) in every position is an essential of the prayer, not a decoration — a prayer pecked like a bird must be repeated.",
          note: "Bukhari 10:188; Bukhari 10:151",
        },
        {
          title: "Ordinary speech breaks the prayer",
          detail:
            "When Mu'awiyah bin al-Hakam spoke to a sneezing man during the congregational prayer, the Prophet ﷺ gently taught him: 'This prayer of ours is not the place for ordinary human speech, rather it is glorification and magnification of Allah (SWT), and reciting Qur'an.' Deliberate human conversation invalidates the prayer.",
          note: "Nasai 13:40",
        },
        {
          title: "Losing wudu ends the prayer",
          detail:
            "The Prophet ﷺ said: 'The prayer of a person who does Hadath (passes urine, stool or wind) is not accepted till he performs the ablution.' If your wudu breaks mid-prayer, leave the prayer and renew your wudu; scholars state that the safest course — and the majority position — is to pray again from the beginning.",
          note: "Bukhari 4:1",
        },
        {
          title: "Looking around",
          detail:
            "Aisha (may Allah be pleased with her) asked the Prophet ﷺ about glancing here and there during prayer. He said: 'It is what Satan steals from the prayer of any one of you.' Glancing does not invalidate the prayer, but it robs it — and scholars state that turning the whole body away from the qiblah does invalidate it.",
          note: "Bukhari 59:100",
        },
        {
          title: "Other invalidators the scholars list",
          detail:
            "Scholars also count among the invalidators: deliberately eating or drinking, laughing aloud, continuous unnecessary movement, uncovering the awrah, and abandoning any pillar of the prayer intentionally. Small necessary movements — steadying a child, killing a harmful insect — do not harm the prayer.",
        },
        {
          title: "The sutrah — and passing in front of someone praying",
          detail:
            "The Prophet ﷺ would have a spear planted in front of him as a sutrah (barrier) and pray toward it, even in the open. And he said that if the one who passes in front of a praying person knew the magnitude of his sin, 'he would prefer to wait for 40 (days, months or years) rather than to pass in front of him.' Pray toward a wall, pillar, or object when you can — and walk around, never through, the space in front of a worshipper.",
          note: "Bukhari 13:21; Bukhari 13:22; Bukhari 8:157; Muslim 4:294",
        },
      ],
      source:
        "Sources: Bukhari 4:1, 8:157, 10:151, 10:188, 13:21, 13:22, 59:100; Muslim 4:294; Nasai 13:40; the fuller list of invalidators as stated by the scholars.",
    },
  },
  {
    id: "after-prayer",
    name: "After the Taslim",
    content: {
      intro:
        "The prayer ends with the taslim — the worship does not. The Prophet ﷺ kept a short, fixed routine of remembrance after every salah that takes only minutes. Learn it once and it becomes the seal of all five daily prayers. The full texts with Arabic are on the Duas and Dhikr pages.",
      points: [
        {
          title: "Istighfar three times, then Allahumma Antas-Salam",
          detail:
            "Thawban (may Allah be pleased with him) reported that when the Messenger of Allah ﷺ finished his prayer, he begged forgiveness three times and said: 'O Allah! Thou art Peace, and peace comes from Thee; Blessed art Thou, O Possessor of Glory and Honour.' In transliteration: Astaghfirullah (three times), then Allahumma Antas-Salam wa minkas-salam, tabarakta ya Dhal-jalali wal-ikram.",
          note: "Muslim 5:171; Ibn Majah 5:126",
        },
        {
          title: "The tasbih: 33 + 33 + 33 + 1",
          detail:
            "The Prophet ﷺ taught the poor emigrants — who feared the wealthy had outstripped them — to extol Allah, praise Him, and declare His greatness thirty-three times after every prayer. In the fuller narration: whoever says SubhanAllah 33 times, Alhamdulillah 33 times, and Allahu Akbar 33 times, then completes the hundred with 'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir' — his sins are forgiven even if they are as abundant as the foam of the sea.",
          note: "Muslim 5:184; Muslim 5:188",
        },
        {
          title: "The mu'awwidhat",
          detail:
            "The Prophet ﷺ commanded Uqbah bin Amir (may Allah be pleased with him) to recite the mu'awwidhat — the surahs of seeking refuge, al-Falaq (113) and an-Nas (114) — following every prayer. Many scholars include Surah al-Ikhlas (112) with them, reciting all three.",
          note: "Abu Dawud 8:108; Nasai 13:158",
        },
        {
          title: "Ayat al-Kursi",
          detail:
            "Scholars widely teach reciting Ayat al-Kursi (Quran 2:255) after every obligatory prayer, on the basis of a narration they grade as authentic, with the promise that nothing then stands between the worshipper and Paradise except death.",
        },
        {
          title: "Then your personal du'a",
          detail:
            "With the adhkar complete, raise your needs to Allah in any language. See the Duas page (After Completing Prayer) for the fuller collection of post-salah supplications with Arabic text, and the Dhikr counter to keep count of the tasbih.",
        },
      ],
      source:
        "Sources: Muslim 5:171, 5:184, 5:188; Ibn Majah 5:126; Abu Dawud 8:108; Nasai 13:158; Ayat al-Kursi as stated by the scholars.",
    },
  },
];

const whyItMatters = [
  {
    point: "It is the first thing a person will be judged for",
    detail:
      "The Prophet (peace be upon him) said: 'The first thing a person will be held accountable for on the Day of Judgement is the prayer. If it is sound, then the rest of his deeds will be sound. And if it is deficient, then the rest of his deeds will be deficient.'",
    reference: "Nasai 5:18; also Abu Dawud 2:474, Tirmidhi 2:266",
  },
  {
    point: "It is a direct connection to Allah",
    detail:
      "When you recite Al-Fatihah, Allah responds to every verse. The Prophet (peace be upon him) said: 'Allah the Exalted says: I have divided the prayer between Myself and My servant into two halves, and My servant shall have what he asks for.'",
    reference: "Muslim 4:41",
  },
  {
    point: "It prevents immorality and wrongdoing",
    detail:
      "Allah says in the Quran that prayer restrains from shameful and evil deeds. A person who prays sincerely will find that prayer naturally steers them away from sin.",
    reference: "Quran 29:45",
  },
  {
    point: "It erases sins between prayers",
    detail:
      "The Prophet (peace be upon him) compared the five daily prayers to a river at one's door in which he bathes five times a day — would any filth remain? The companions said no. He said: 'That is the likeness of the five prayers — Allah erases sins by them.'",
    reference: "Bukhari 9:7, Muslim 5:356",
  },
  {
    point: "Abandoning it is the line between faith and disbelief",
    detail:
      "The Prophet (peace be upon him) said: 'The covenant between us and them is the prayer; whoever abandons it has disbelieved.' This shows the gravity of salah in Islam — it is not optional.",
    reference: "Tirmidhi 40:16 (from Buraydah); see also Muslim 1:12 with similar meaning",
  },
  {
    point: "Its success is measured by khushu' — presence of heart",
    detail:
      "Allah opens Surah al-Mu'minun with it: 'The believers have attained true success: those who humble themselves in their prayers' (Quran 23:1-2). Khushu' — humility, presence of heart, and stillness before Allah — is what turns the prayer from movements into a meeting. Allah also says of prayer: 'It is strenuous except for the humble' (Quran 2:45) — the more present the heart, the lighter the prayer becomes.",
    reference: "Quran 23:1-2; Quran 2:45",
  },
  {
    point: "A heedless, absent-minded prayer is condemned",
    detail:
      "Allah warns: 'So woe to those who pray, but are heedless of their prayer' (Quran 107:4-5). Even wandering eyes diminish it — when Aisha asked the Prophet (peace be upon him) about looking here and there during the prayer, he replied: 'It is what Satan steals from the prayer of any one of you.' Guarding the eyes and the mind is part of guarding the prayer itself.",
    reference: "Quran 107:4-5; Bukhari 59:100",
  },
  {
    point: "It is taught from the age of seven",
    detail:
      "Prayer is a family inheritance, passed down before adolescence. The Prophet (peace be upon him) said: 'Command your children to pray when they become seven years old' — and to treat it with full seriousness from ten (Abu Dawud 2:105; Tirmidhi 2:260). By the time prayer becomes obligatory at puberty, it should already be a habit of years.",
    reference: "Abu Dawud 2:105; Tirmidhi 2:260",
  },
];

/* ───────────────────────── purification (taharah) data ───────────────────────── */

const purificationTopics: Topic[] = [
  {
    id: "overview",
    name: "What is Wudu?",
    content: {
      intro:
        "Wudu (الوُضُوء) is the Islamic act of ritual purification using water. It is a prerequisite for salah — prayer is not valid without it. Wudu purifies the believer both physically and spiritually, preparing the heart and body to stand before Allah. The Prophet ﷺ said: 'Cleanliness is half of faith.' (Muslim 2:1)",
      verse: {
        arabic:
          "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا إِذَا قُمْتُمْ إِلَى ٱلصَّلَوٰةِ فَٱغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى ٱلْمَرَافِقِ وَٱمْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى ٱلْكَعْبَيْنِ",
        text: "O you who believe, when you rise to pray, wash your faces and your hands up to the elbows, wipe over your heads, and wash your feet up to the ankles.",
        ref: "Quran 5:6",
      },
      points: [
        {
          title: "When is wudu required?",
          detail:
            "Wudu is required before performing salah, making tawaf around the Ka'bah, and touching the mushaf (physical copy of the Quran). The Prophet ﷺ said: 'Allah does not accept the prayer of any one of you if he breaks his wudu, until he performs wudu again.'",
          note: "Bukhari 4:1",
        },
        {
          title: "The obligation of wudu",
          detail:
            "Wudu has four obligatory (fard) acts, established directly in Quran 5:6: 1) washing the face, 2) washing the arms up to the elbows, 3) wiping the head, and 4) washing the feet up to the ankles. To these the majority of scholars add the intention (niyyah) — wudu is invalid without them. Everything else in the familiar sequence — Bismillah, washing the hands to the wrists, rinsing the mouth and nose, wiping the ears, washing three times, starting with the right — is sunnah according to the majority (the Hanbali school also counts rinsing the mouth and nose as fard). The schools likewise differ on whether keeping the Quranic order (tartib) and washing without long gaps (muwalat) are obligatory or sunnah; performing wudu in order and without interruption, as the Prophet ﷺ did, satisfies all positions.",
          note: "Quran 5:6",
        },
        {
          title: "Spiritual virtues",
          detail:
            "Wudu is not only physical purification. The Prophet ﷺ said: 'When a Muslim servant performs wudu and washes his face, every sin that he committed with his eyes is washed away with the water, or with the last drop of water. When he washes his hands, every sin his hands committed is washed away. When he washes his feet, every sin towards which his feet walked is washed away, until he emerges purified of sin.'",
          note: "Muslim 2:44",
        },
        {
          title: "The mark of the believers",
          detail:
            "The Prophet ﷺ said that on the Day of Judgement he will recognize his ummah by the traces of wudu — their faces, hands, and feet will shine with light (ghurr and muhajjalin). He encouraged the believers to extend the washing of the face and limbs beyond the minimum to increase this light.",
          note: "Muslim 2:46",
        },
      ],
    },
  },
  {
    id: "steps",
    name: "Steps of Wudu",
    content: {
      intro:
        "The Prophet ﷺ taught wudu in a specific order as narrated by Uthman ibn Affan (may Allah be pleased with him), who demonstrated the Prophet's wudu step by step (Bukhari 4:25). Each step below is tagged: Fard steps are the pillars of wudu — the four acts named in Quran 5:6 plus the intention (niyyah) per the majority of scholars — and leaving any of them out invalidates the wudu. Sunnah steps are from the Prophet's ﷺ consistent practice: they perfect the wudu and carry reward, but the wudu remains valid without them (the Hanbali school also counts rinsing the mouth and nose as fard, so it is best never to skip them).",
      points: [
        {
          title: "1. Intention (Niyyah) — Fard",
          detail:
            "Make the intention in your heart to perform wudu for the sake of Allah. The intention does not need to be spoken aloud — it is an act of the heart. The Prophet ﷺ said: 'Actions are judged by intentions.'",
          note: "Bukhari 1:1",
        },
        {
          title: "2. Say Bismillah — Sunnah",
          detail:
            "Begin by saying 'Bismillah' (In the name of Allah). This is a sunnah of the Prophet ﷺ before starting wudu.",
          note: "Abu Dawud 1:101",
        },
        {
          title: "3. Wash the Hands — Sunnah",
          detail:
            "Wash both hands up to the wrists three times, starting with the right hand. Make sure water reaches between the fingers.",
          note: "Bukhari 4:25",
        },
        {
          title: "4. Rinse the Mouth — Sunnah",
          detail:
            "Take water into the mouth with the right hand and rinse it thoroughly three times. Swirl the water around to clean the entire mouth. Sunnah per the majority of scholars; the Hanbali school counts rinsing the mouth as fard.",
          note: "Bukhari 4:25",
        },
        {
          title: "5. Rinse the Nose — Sunnah",
          detail:
            "Inhale water into the nostrils with the right hand and blow it out with the left hand, three times. Sniff the water gently — do not inhale too deeply. Sunnah per the majority of scholars; the Hanbali school counts rinsing the nose as fard.",
          note: "Bukhari 4:25",
        },
        {
          title: "6. Wash the Face — Fard",
          detail:
            "Wash the entire face three times — from the hairline to the chin, and from ear to ear. Ensure water reaches every part of the face, including the eyebrows and any facial hair.",
          note: "Quran 5:6; Bukhari 4:25",
        },
        {
          title: "7. Wash the Arms to the Elbows — Fard",
          detail:
            "Wash the right arm from the fingertips to and including the elbow, three times. Then wash the left arm in the same manner. Ensure water flows over the entire arm.",
          note: "Quran 5:6; Bukhari 4:25",
        },
        {
          title: "8. Wipe the Head — Fard",
          detail:
            "Wet your hands and wipe over the entire head once — starting from the forehead to the back of the head, then bring the hands back to the front.",
          note: "Quran 5:6; Bukhari 4:25",
        },
        {
          title: "9. Wipe the Ears — Sunnah",
          detail:
            "Using the same moisture, wipe the inside of the ears with the index fingers and the outside with the thumbs, once. The Prophet ﷺ said: 'The ears are part of the head.'",
          note: "Abu Dawud 1:134; Tirmidhi 1:37",
        },
        {
          title: "10. Wash the Feet to the Ankles — Fard",
          detail:
            "Wash the right foot up to and including the ankle, three times. Then the left foot. Use the little finger of the left hand to wash between the toes. The Prophet ﷺ warned: 'Woe to the heels from the Fire!' for those who leave parts of the feet unwashed.",
          note: "Quran 5:6; Bukhari 4:31; Muslim 1:148",
        },
      ],
    },
  },
  {
    id: "duas",
    name: "Duas of Wudu",
    content: {
      intro:
        "The Prophet ﷺ taught specific supplications before and after wudu. Saying the dua after wudu carries a tremendous reward — the eight gates of Paradise are opened for the one who says it.",
      verse: {
        arabic:
          "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
        text: "I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad is His servant and Messenger. O Allah, make me among those who repent and make me among those who purify themselves.",
        ref: "Muslim 2:20; Tirmidhi 1:55",
      },
      points: [
        {
          title: "Before Wudu: Bismillah",
          detail:
            "Say 'Bismillah' (In the name of Allah) before beginning wudu. This is a sunnah that the Prophet ﷺ practiced consistently.",
          note: "Abu Dawud 1:101",
        },
        {
          title: "After Wudu: The Shahada",
          detail:
            "The Prophet ﷺ said: 'There is no one among you who performs wudu and does it well, then says: Ash-hadu an la ilaha illallahu wahdahu la sharika lah, wa ash-hadu anna Muhammadan abduhu wa rasuluh — except that the eight gates of Paradise will be opened for him, and he may enter through whichever one he wishes.'",
          note: "Muslim 2:20",
        },
        {
          title: "The addition of at-Tirmidhi",
          detail:
            "In the narration of at-Tirmidhi, the dua includes the addition: 'Allahumma-j'alni minat-tawwabina waj'alni minal-mutatahhirin' — 'O Allah, make me among those who repent and make me among those who purify themselves.'",
          note: "Tirmidhi 1:55",
        },
        {
          title: "Praying two rak'at after wudu",
          detail:
            "The Prophet ﷺ said: 'Whoever performs wudu like this wudu of mine, then prays two rak'at in which he does not let his mind wander, his previous sins will be forgiven.' It is a highly recommended sunnah to pray two voluntary rak'at after making wudu.",
          note: "Bukhari 4:25; Muslim 2:20",
        },
      ],
    },
  },
  {
    id: "sunnah",
    name: "Sunnah Acts",
    content: {
      intro:
        "Beyond the obligatory steps, the Prophet ﷺ practiced many recommended (sunnah) acts during wudu that earn additional reward. These are established from multiple authentic narrations.",
      points: [
        {
          title: "Saying Bismillah before beginning",
          detail:
            "Beginning with the name of Allah is a sunnah before all acts of worship. Some scholars consider it obligatory for wudu based on the hadith: 'There is no wudu for the one who does not mention the name of Allah upon it.'",
          note: "Abu Dawud 1:101; Ibn Majah 1:133",
        },
        {
          title: "Using miswak (tooth stick)",
          detail:
            "The Prophet ﷺ said: 'Were it not that I would impose hardship on my ummah, I would have commanded them to use the miswak with every wudu.' Cleaning the teeth before rinsing the mouth is a highly recommended sunnah.",
          note: "Bukhari 11:12; Muslim 2:59",
        },
        {
          title: "Washing each part three times",
          detail:
            "The minimum is once for each limb, but the sunnah is three times. The Prophet ﷺ sometimes washed each part once, sometimes twice, and sometimes three times. He never exceeded three.",
          note: "Bukhari 4:25; Abu Dawud 1:135",
        },
        {
          title: "Starting with the right side",
          detail:
            "The Prophet ﷺ loved to start with the right side in all matters of purification and in wearing his shoes, combing his hair, and all his affairs.",
          note: "Bukhari 4:34; Muslim 2:83",
        },
        {
          title: "Running fingers through the beard",
          detail:
            "The Prophet ﷺ used to run water through his beard with his fingers during wudu (takhlil al-lihyah), ensuring water reached the skin beneath.",
          note: "Tirmidhi 1:31",
        },
        {
          title: "Washing between the fingers and toes",
          detail:
            "The Prophet ﷺ said: 'When you perform wudu, interlace your fingers.' This ensures water reaches between them for complete purification.",
          note: "Tirmidhi 1:38; Abu Dawud 1:142",
        },
        {
          title: "Being moderate with water",
          detail:
            "The Prophet ﷺ used to perform wudu with one mudd of water (approximately 750ml). He prohibited extravagance in using water, even at a flowing river.",
          note: "Bukhari 4:67; Ibn Majah 1:159",
        },
        {
          title: "Maintaining the correct order (tartib) without long pauses",
          detail:
            "Performing the acts in the order mentioned in Quran 5:6 is obligatory according to the Shafi'i and Hanbali schools, and sunnah according to the Hanafi school. Avoiding long pauses between washing each limb (muwalat) ensures the previous limb does not dry before the next is washed.",
          note: "Quran 5:6",
        },
      ],
    },
  },
  {
    id: "nullifiers",
    name: "Nullifiers",
    content: {
      intro:
        "Certain actions or occurrences break the state of wudu, requiring a person to perform it again before praying. The scholars derived these nullifiers from the Quran and Sunnah. Note that everything listed here requires only a fresh wudu — for the things that require a full bath (ghusl) instead, see the Ghusl section.",
      points: [
        {
          title: "Anything that exits from the two passages",
          detail:
            "Urine, stool, or any discharge from the front or back passage nullifies wudu. This is established by scholarly consensus (ijma').",
          note: "Bukhari 4:1",
        },
        {
          title: "Passing wind",
          detail:
            "The Prophet ﷺ said: 'Allah does not accept the prayer of one who has broken his wudu until he makes wudu again.' A man from Hadhramaut asked: 'What breaks wudu?' He said: 'Passing wind silently or audibly.' In another hadith, one should not leave prayer unless he hears a sound or notices a smell.",
          note: "Bukhari 4:3; Abu Dawud 1:60",
        },
        {
          title: "Deep sleep",
          detail:
            "Deep sleep in which one loses awareness of his surroundings nullifies wudu. Light dozing while sitting upright, where one would be aware if something exited, does not. The companion Anas (may Allah be pleased with him) reported that the companions of the Prophet ﷺ would doze off while waiting for Isha prayer, then pray without renewing wudu.",
          note: "Abu Dawud 1:200",
        },
        {
          title: "Loss of consciousness",
          detail:
            "Fainting, being under anesthesia, intoxication, or insanity — anything that causes complete loss of consciousness nullifies wudu, as it is more severe than deep sleep.",
          note: "Scholarly consensus (ijma'); analogous to deep sleep",
        },
        {
          title: "Touching the private parts directly",
          detail:
            "The Prophet ﷺ said: 'Whoever touches his private part, let him perform wudu.' This refers to touching directly with the palm or inner fingers without a barrier. This is the position of the Shafi'i, Maliki, and Hanbali schools.",
          note: "Tirmidhi 1:82 (hadith of Busrah bint Safwan)",
        },
        {
          title: "Eating camel meat",
          detail:
            "The Prophet ﷺ was asked: 'Should we perform wudu after eating camel meat?' He said: 'Yes.' He was asked: 'Should we perform wudu after eating mutton?' He said: 'If you wish.' This is the position of the Hanbali school; other schools consider it recommended but not obligatory.",
          note: "Muslim 3:123",
        },
      ],
    },
  },
  {
    id: "khuff",
    name: "Wiping over Footwear",
    content: {
      intro:
        "Al-mash 'ala al-khuffayn — wiping over the khuffs (leather socks) — is a concession the Prophet ﷺ practiced constantly: if you put on your footwear while in a state of wudu, you may simply wipe over them with wet hands when renewing wudu instead of taking them off to wash your feet. It is a mercy for travelers, workers, and anyone in cold climates, and it is established by many companions — so many that when Jarir (may Allah be pleased with him) wiped over his socks, he explained he had seen the Messenger of Allah ﷺ do it, and the scholars valued his report because Jarir embraced Islam after Surat al-Ma'ida (which contains the wudu verse) was revealed (Muslim 2:89).",
      points: [
        {
          title: "A confirmed sunnah of the Prophet ﷺ",
          detail:
            "Al-Mughirah ibn Shu'bah (may Allah be pleased with him) said: 'Once I was in the company of the Prophet ﷺ on a journey and I dashed to take off his Khuffs. He ordered me to leave them as he had put them after performing ablution. So he passed wet hands over them.' Jarir likewise urinated, performed wudu, and wiped over his socks, saying: 'I saw that the Messenger of Allah ﷺ urinated, then performed ablution and then wiped over his shoes.'",
          note: "Bukhari 4:72; Muslim 2:89",
        },
        {
          title: "The condition: put them on while in wudu",
          detail:
            "The concession applies only when the footwear was put on in a state of purity — that is the very reason the Prophet ﷺ gave for not removing his khuffs: 'he had put them after performing ablution' (Bukhari 4:72). So: make full wudu (washing the feet), put on the khuffs or socks, and from then on you may wipe over them when you renew wudu within the time limit.",
          note: "Bukhari 4:72",
        },
        {
          title: "The time limits",
          detail:
            "Ali (may Allah be pleased with him) said: 'The Messenger of Allah ﷺ stipulated (the upper limit) of three days and three nights for a traveller and one day and one night for the resident' (Muslim 2:105). Khuzaimah ibn Thabit reported the same: 'Three (days) for the traveler, and one day for the resident' (Tirmidhi 1:95). Scholars generally count the period from the first wipe after breaking wudu, though the schools differ on the exact starting point.",
          note: "Muslim 2:105; Tirmidhi 1:95",
        },
        {
          title: "How to wipe: the top, not the sole",
          detail:
            "With wet fingers, wipe once over the upper surface of each foot, from the toes toward the shin. Ali (may Allah be pleased with him) said: 'If the religion were based on opinion, it would be more important to wipe the under part of the shoe than the upper, but I have seen the Messenger of Allah ﷺ wiping over the upper part of his shoes.'",
          note: "Abu Dawud 1:162",
        },
        {
          title: "What about ordinary socks?",
          detail:
            "The khuff of the hadith was a thick leather sock. Many scholars — notably the Hanbali school, drawing on the practice of a large number of companions — extend the concession to ordinary thick socks (jawrab) that stay up on their own and can be walked in, while others restrict it to leather or leather-like footwear. If you follow the broader view, the same conditions and time limits apply.",
        },
        {
          title: "What ends the concession",
          detail:
            "Wiping covers minor impurity only. Safwan ibn 'Assal (may Allah be pleased with him) said: 'The Messenger of Allah ﷺ used to tell us, when we were travelling, to wipe over our Khuffs and not take them off for three nights in the event of defecating, urinating or sleeping; only in the case of Janabah' (Nasai 1:128) — so anything requiring ghusl means the footwear comes off and the whole body, feet included, is washed. Scholars likewise state that the concession ends when the time limit expires or when the footwear is removed — most then require a fresh wudu with the feet washed, while the schools differ on the details.",
          note: "Nasai 1:128",
        },
      ],
    },
  },
  {
    id: "ghusl",
    name: "Ghusl",
    content: {
      intro:
        "Ghusl (الغُسْل) is the full ritual bath — washing the entire body with water to remove major ritual impurity (janabah). While the nullifiers of wudu only require a fresh wudu, the states below require ghusl: prayer, tawaf, and touching the mushaf are not valid while in janabah until ghusl is performed.",
      verse: {
        arabic: "وَإِن كُنتُمْ جُنُبًا فَٱطَّهَّرُوا۟",
        text: "If you are in a state of major impurity, cleanse yourselves [by taking a bath].",
        ref: "Quran 5:6",
      },
      points: [
        {
          title: "When ghusl is obligatory",
          detail:
            "1) Sexual intercourse — even without emission. The Prophet ﷺ said: 'When a man sits in between the four parts of a woman and did the sexual intercourse with her, bath becomes compulsory' (Bukhari 5:43). 2) Any emission of semen with desire, whether awake or asleep. When Umm Sulaym asked about a woman who sees in a dream what a man sees, the Prophet ﷺ said: 'In case a woman sees that, she must take a bath' (Muslim 3:32). 3) The end of menstruation or post-natal bleeding (nifas). The Prophet ﷺ said: 'Give up the prayer when your menses begin and when it has finished, wash the blood off your body (take a bath) and start praying' (Bukhari 6:35).",
          note: "Bukhari 5:43; Bukhari 6:35; Muslim 3:32",
        },
        {
          title: "The deceased are also washed",
          detail:
            "Mainstream scholarship holds that washing the deceased Muslim is a communal obligation (fard kifayah) on the living, not a duty of the deceased. When the Prophet's ﷺ daughter passed away, he told the women washing her: 'Wash her three times, five times or more, if you think it necessary, with water and Sidr (lote leaves), and last of all put camphor.'",
          note: "Bukhari 23:22",
        },
        {
          title: "Ghusl before Jumu'ah",
          detail:
            "The Prophet ﷺ said: 'The taking of a bath on Friday is compulsory for every male Muslim who has attained the age of puberty' (Bukhari 11:5). Because of this emphatic wording, some scholars held it to be obligatory; the majority hold it is an emphasized sunnah — but all agree it should not be neglected. It is part of preparing for the best day of the week: ghusl, clean clothes, and perfume before heading to the Friday prayer.",
          note: "Bukhari 11:5",
        },
        {
          title: "The obligatory acts of ghusl",
          detail:
            "The essence of ghusl is: 1) the intention (niyyah) to remove major impurity, and 2) water reaching the entire body — every part of the skin and the roots of the hair. The Hanafi school additionally counts rinsing the mouth and the nostrils as obligatory parts of ghusl (they are emphasized sunnah in the Shafi'i and Maliki schools) — since the Prophet ﷺ consistently included them, everyone should simply do them. If these essentials are fulfilled, the ghusl is valid even without the full sunnah sequence.",
          note: "Quran 5:6; Bukhari 5:26",
        },
        {
          title: "The Prophet's ﷺ method — step by step",
          detail:
            "From the narrations of Aisha and Maymunah (may Allah be pleased with them): 1) Wash both hands. 2) Wash the private parts with the left hand. 3) Perform wudu as for prayer. 4) Put your fingers in water and run them through the roots of the hair. 5) Pour water over the head three times. 6) Pour water over the entire body, right side then left. 7) Finally, step aside and wash the feet. Aisha narrated: 'Whenever the Prophet ﷺ took a bath after Janaba he started by washing his hands and then performed ablution like that for the prayer. After that he would put his fingers in water and move the roots of his hair with them, and then pour three handfuls of water over his head and then pour water all over his body.'",
          note: "Bukhari 5:1 (Aisha), 5:26 (Maymunah)",
        },
        {
          title: "What does NOT require ghusl",
          detail:
            "Madhy (pre-seminal fluid released without climax) does not require ghusl — Ali (may Allah be pleased with him) asked through al-Miqdad, and the Prophet ﷺ said: 'He should wash his male organ and perform ablution' (Muslim 3:17). Likewise urine, stool, passing wind, deep sleep, and vomiting only break wudu, not the state of purity from janabah. Ordinary contact between spouses without intercourse does not require ghusl.",
          note: "Muslim 3:17",
        },
        {
          title: "Common mistakes",
          detail:
            "1) Leaving dry spots — behind the ears, under rings or nail polish, the armpits, between the toes, or the roots of thick hair; water must reach the whole body. 2) Thinking a separate wudu is required afterwards — a complete ghusl with the intention of purification suffices for prayer. 3) Delaying ghusl until a prayer window passes — janabah does not excuse missing a prayer. 4) Wastefulness with water — the Prophet ﷺ bathed with modest amounts, and moderation is the sunnah.",
          note: "Bukhari 5:1; Bukhari 5:26",
        },
      ],
    },
  },
  {
    id: "tayammum",
    name: "Tayammum",
    content: {
      intro:
        "Tayammum (التيمم) is the dry ablution — purification with clean earth when water cannot be used. It is a mercy from Allah so that no Muslim is ever left unable to pray: when there is no water, or water would cause harm, striking the palms on clean earth and wiping the face and hands takes the place of wudu — and of ghusl. The concession was revealed on a journey when Aisha's necklace was lost and the people had no water for prayer (Bukhari 7:1).",
      verse: {
        arabic:
          "وَإِن كُنتُم مَّرْضَىٰٓ أَوْ عَلَىٰ سَفَرٍ أَوْ جَآءَ أَحَدٌ مِّنكُم مِّنَ ٱلْغَآئِطِ أَوْ لَـٰمَسْتُمُ ٱلنِّسَآءَ فَلَمْ تَجِدُوا۟ مَآءً فَتَيَمَّمُوا۟ صَعِيدًا طَيِّبًا فَٱمْسَحُوا۟ بِوُجُوهِكُمْ وَأَيْدِيكُم مِّنْهُ",
        text: "But if you are ill, on a journey, or have relieved yourselves, or had sexual contact with women and find no water, then purify yourselves with clean earth, and wipe your faces and hands therewith.",
        ref: "Quran 5:6",
      },
      points: [
        {
          title: "When tayammum is permitted",
          detail:
            "Quran 5:6 names the cases: 1) No water — after genuinely seeking it, as commonly happens in travel. 2) Illness, or harm from using water — when washing would worsen a sickness, a wound, or endanger you (as with severe cold with no means of heating). Amr ibn al-As, fearing for his life on a freezing night, performed tayammum instead of ghusl and the Prophet ﷺ did not object (Abu Dawud 1:334). The concession lasts as long as the excuse lasts — the Prophet ﷺ said: 'Pure clean earth is a purifier for the Muslim; even if he did not find water for ten years.' (Tirmidhi 1:124)",
          note: "Quran 5:6; Abu Dawud 1:334; Tirmidhi 1:124",
        },
        {
          title: "How to perform it — the hadith of Ammar",
          detail:
            "Ammar ibn Yasir (may Allah be pleased with him) became junub on a journey with no water, so he rolled on the ground and prayed. When he told the Prophet ﷺ, he said: 'It would have been sufficient for you to do like this.' The Prophet then stroked lightly the earth with his hands and then blew off the dust and passed his hands over his face and hands (Bukhari 7:5). So: make the intention, say Bismillah, strike the palms once on clean earth (dust, sand, or a natural rock/earth surface), blow off the excess dust, then wipe the face and wipe the hands. Most scholars hold that wiping the hands means to the wrists, as in the Bukhari narrations; other positions in the schools extend it to the elbows — both trace back to the narrations.",
          note: "Bukhari 7:5; Bukhari 7:10",
        },
        {
          title: "What it replaces",
          detail:
            "Valid tayammum stands in place of both wudu and ghusl — Ammar's own case was janabah, which normally requires ghusl. Once performed, you pray exactly as if you had purified with water: salah, touching the mushaf, and tawaf are all valid, with nothing to make up later for prayers prayed with it.",
          note: "Quran 5:6; Bukhari 7:5",
        },
        {
          title: "What breaks tayammum",
          detail:
            "Everything that breaks wudu breaks tayammum — and additionally, finding water (or the excuse ending, such as recovering from the illness). The Prophet ﷺ said: 'Then if he finds water, then let him use it (for purification) on his skin.' (Tirmidhi 1:124). Prayers already prayed with valid tayammum remain valid: when two travelers prayed with tayammum and then found water within the prayer time, the Prophet ﷺ told the one who did not repeat his prayer: 'You followed the sunnah (model behavior of the Prophet) and your (first) prayer was enough for you' (Abu Dawud 1:338). If the tayammum was for janabah, finding water means ghusl is due; otherwise a fresh wudu.",
          note: "Tirmidhi 1:124; Abu Dawud 1:338",
        },
      ],
    },
  },
  {
    id: "najasah",
    name: "Cleaning Impurities",
    content: {
      intro:
        "Wudu and ghusl purify your state; but salah also requires that your body, clothes, and the spot you pray on are free of najasah — physical impurity such as urine or excrement. Unlike wudu, removing najasah has no ritual to it: no intention or sequence is required, you simply remove the impurity itself, and water is the default cleanser. The Prophet ﷺ showed remarkable ease in this — a stain does not ruin a garment, and a mistake does not require scrubbing the whole house.",
      verse: {
        arabic: "وَثِيَابَكَ فَطَهِّرْ",
        text: "and purify your garments,",
        ref: "Quran 74:4",
      },
      points: [
        {
          title: "What counts as najasah",
          detail:
            "Scholars state that the impurities include human urine and excrement, blood that flows out, vomit, the urine and droppings of animals whose meat is not eaten, and the saliva of dogs and pigs — while the schools differ over some details (such as small amounts of blood, or the body of the dog itself). Things like sweat, tears, saliva, and breast milk are pure, and ordinary dirt or mud is not najasah at all.",
        },
        {
          title: "Water poured over it — the bedouin in the mosque",
          detail:
            "A bedouin urinated in the mosque and the people ran to stop him. The Prophet ﷺ said: 'Do not interrupt his urination (i.e. let him finish).' Then he asked for a tumbler of water and poured the water over the place of urine (Bukhari 78:56; Muslim 2:125). The lesson is twofold: impure ground is purified simply by pouring water over it, and the Prophet ﷺ corrected with gentleness, not panic.",
          note: "Bukhari 78:56; Muslim 2:125",
        },
        {
          title: "Blood on clothing",
          detail:
            "A woman asked what to do when menstrual blood gets on a garment. The Prophet ﷺ said: 'She should scrape it, then rub it with water, then pour water over it and then offer prayer in it' (Muslim 2:141; Bukhari 6:12). So: scratch off what is dried, rub the spot with water, rinse — and the garment is pure enough to pray in. It does not need to be discarded — and when a woman asked what to do if the mark of the blood remains, the Prophet ﷺ said: 'It is enough for you to wash the blood, its mark will not do any harm to you' (Abu Dawud 1:365).",
          note: "Bukhari 6:12; Muslim 2:141; Abu Dawud 1:365",
        },
        {
          title: "A baby's urine",
          detail:
            "The sunnah distinguishes by age and by sex for nursing infants: 'The urine of a female child should be washed (thoroughly) and the urine of a male child should be sprinkled over' (Abu Dawud 1:375) — 'until the age of eating' (Abu Dawud 1:377). When a baby boy urinated on the Prophet ﷺ, he simply asked for water and sprinkled it over the place of urine (Bukhari 76:15; Muslim 2:129). Once a child eats solid food, the urine of both is washed.",
          note: "Abu Dawud 1:375; Abu Dawud 1:377; Bukhari 76:15; Muslim 2:129",
        },
        {
          title: "A vessel a dog has licked",
          detail:
            "The Prophet ﷺ said: 'If a dog drinks from the utensil of anyone of you it is essential to wash it seven times' (Bukhari 4:38), and in Muslim's narration: 'The purification of the utensil belonging to any one of you, after it is licked by a dog, lies in washing it seven times, using sand for the first time' (Muslim 2:117). Today soap or cleaning agents can stand in for the sand/earth according to many scholars, though following the letter of the hadith is safest.",
          note: "Bukhari 4:38; Muslim 2:117",
        },
        {
          title: "Shoes: the earth purifies them",
          detail:
            "The Prophet ﷺ said: 'When any of you treads with his shoes upon something unclean, they will be purified with the earth' (Abu Dawud 1:386) — walking on clean ground removes the filth. And when Jibril informed him during prayer that there was filth on his sandals, he took them off, then taught: 'When any of you comes to the mosque, he should see; if he finds filth on his sandals, he should wipe it off and pray in them' (Abu Dawud 2:260).",
          note: "Abu Dawud 1:386; Abu Dawud 2:260",
        },
        {
          title: "If you are not sure",
          detail:
            "Scholars state a foundational principle here: certainty is not removed by doubt. Things are assumed pure — your clothes, your carpet, a wet patch you cannot identify — unless you actually know an impurity touched them. You are not required to investigate, smell, or wash things 'just in case', and doing so feeds waswas (whispering doubts) rather than piety.",
        },
      ],
    },
  },
];

/* Steps of Wudu renderer — same layout as TopicInfoCard, but the "— Fard" /
   "— Sunnah" suffix on each step title is lifted out into a small ruling chip
   so the obligation level of every step is visible at a glance. */
const STEP_RULING_PATTERN = /^(.*) — (Fard|Sunnah)$/;

function RulingChip({ ruling }: { ruling: "Fard" | "Sunnah" }) {
  return (
    <span
      className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-wider ${
        ruling === "Fard"
          ? "bg-gold/15 border-gold/30 text-gold"
          : "sidebar-border text-themed-muted"
      }`}
    >
      {ruling}
    </span>
  );
}

function WuduStepsCard({ topic }: { topic: Topic }) {
  return (
    <ContentCard>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-themed">{topic.name}</h2>
      </div>

      <p className="text-themed-muted text-sm leading-relaxed mb-5">
        <HadithRefText text={topic.content.intro} />
      </p>

      <div className="space-y-4">
        {topic.content.points.map((point) => {
          const m = point.title.match(STEP_RULING_PATTERN);
          const title = m ? m[1] : point.title;
          const ruling = m ? (m[2] as "Fard" | "Sunnah") : null;
          return (
            <div
              key={point.title}
              className="rounded-lg p-4 border sidebar-border"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-semibold text-themed">{title}</h4>
                {ruling && <RulingChip ruling={ruling} />}
              </div>
              <p className="text-themed-muted text-sm leading-relaxed">
                <HadithRefText text={point.detail} />
              </p>
              {point.note && (
                <p className="text-xs text-gold/60 mt-2">
                  <HadithRefText text={point.note} />
                </p>
              )}
            </div>
          );
        })}
      </div>
    </ContentCard>
  );
}

/* ───────────────────────── jumu'ah (friday prayer) data ───────────────────────── */

const jumuahAccordion = [
  {
    id: "who",
    title: "Who must attend",
    subtitle: "Obligatory for men; others may attend",
    body: (
      <div className="space-y-3 text-sm text-themed-muted leading-relaxed">
        <p>
          Jumu&apos;ah is an individual obligation upon every adult male Muslim who is resident and able to attend. The Prophet ﷺ said:
        </p>
        <div className="rounded-lg p-3 border-l-2 border-gold/30" style={{ backgroundColor: "var(--color-bg)" }}>
          <p className="italic text-themed">
            &ldquo;The Friday prayer in congregation is a necessary duty for every Muslim, with four exceptions; a slave, a woman, a boy, and a sick person.&rdquo;
          </p>
          <p className="text-xs text-gold/60 mt-2"><HadithRefText text="Abu Dawud 2:678" /></p>
        </div>
        <p>
          Scholars likewise exempt the traveler, based on the Prophet&apos;s ﷺ practice. Those who are exempt — women, children, travelers, and the ill — are welcome to attend, and if they pray Jumu&apos;ah it counts in place of Dhuhr. If they do not attend, they simply pray Dhuhr as normal.
        </p>
      </div>
    ),
  },
  {
    id: "when",
    title: "When it is prayed",
    subtitle: "Zawāl and the window of Jumu'ah",
    body: (
      <div className="space-y-3 text-sm text-themed-muted leading-relaxed">
        <p>
          The reference point is <span className="text-gold">zawāl</span> — the moment the sun passes its zenith (its highest point in the sky) and begins to decline westward. This is the same moment at which the time of Dhuhr begins.
        </p>
        <p>
          <span className="text-gold font-medium">The majority position (attributed to the Hanafi, Maliki, and Shafi&apos;i schools).</span> Jumu&apos;ah&apos;s window is Dhuhr&apos;s window — from zawāl until &apos;Asr begins — since Jumu&apos;ah stands in Dhuhr&apos;s place. This is the Prophet&apos;s ﷺ own recorded practice:
        </p>
        <div className="rounded-lg p-3 border-l-2 border-gold/30" style={{ backgroundColor: "var(--color-bg)" }}>
          <p className="italic text-themed">
            &ldquo;The Prophet ﷺ used to offer the Jumua prayer immediately after midday.&rdquo; — Anas bin Malik
          </p>
          <p className="text-xs text-gold/60 mt-2"><HadithRefText text="Bukhari 11:28" /></p>
        </div>
        <p>
          Jabir likewise reported: &ldquo;We used to observe (Jumu&apos;a) prayer with the Messenger of Allah ﷺ and then we returned and gave rest to our camels used for carrying water&rdquo; — and when a narrator asked what time that was, the reply came: &ldquo;It is the time when the sun passes the meridian&rdquo; (<HadithRefText text="Muslim 7:39" className="inline" />).
        </p>
        <p>
          <span className="text-gold font-medium">The position attributed to the Hanbali school.</span> Jumu&apos;ah may also be held before zawāl, from earlier in the morning, based on the narrations of early Jumu&apos;ah: Anas said, &ldquo;We used to offer the Jumua prayer early and then have an afternoon nap&rdquo; (<HadithRefText text="Bukhari 11:29" className="inline" />), and Sahl said, &ldquo;We never had an afternoon nap nor meals except after offering the Jumua prayer&rdquo; (<HadithRefText text="Bukhari 11:63; Muslim 7:41" className="inline" />).
        </p>
        <p>
          <span className="text-gold font-medium">In practice.</span> This is why congregations schedule Jumu&apos;ah anywhere from late morning to mid-afternoon — all of it within a legitimately held window. The khutbah and the 2 rak&apos;ah simply take place at your masjid&apos;s announced time, and once prayed, the Jumu&apos;ah is valid.
        </p>
      </div>
    ),
  },
  {
    id: "how",
    title: "How it is prayed",
    subtitle: "Khutbah etiquette + 2 rak'ah in congregation",
    body: (
      <div className="space-y-3 text-sm text-themed-muted leading-relaxed">
        <p>
          Jumu&apos;ah replaces Dhuhr and is only prayed in congregation. It has two parts: the <span className="text-gold">khutbah</span> (two sermons with a brief sitting between them), then <span className="text-gold">2 rak&apos;ah</span> prayed aloud behind the imam. Umar (may Allah be pleased with him) said: &ldquo;The prayer while traveling is two Rak&apos;ah, and Friday is two Rak&apos;ah, and &apos;Eid is two Rak&apos;ah. They are complete and are not shortened, as told by Muhammad ﷺ&rdquo; (<HadithRefText text="Ibn Majah 5:261" className="inline" />).
        </p>
        <p>
          Listening to the khutbah is part of the worship — total silence is required, to the point that even shushing someone else counts as idle talk:
        </p>
        <div className="rounded-lg p-3 border-l-2 border-gold/30" style={{ backgroundColor: "var(--color-bg)" }}>
          <p className="italic text-themed">
            &ldquo;If you (even) ask your companion to be quiet on Friday while the Imam is delivering the sermon, you have in fact talked irrelevance.&rdquo;
          </p>
          <p className="text-xs text-gold/60 mt-2"><HadithRefText text="Muslim 7:15; Bukhari 11:58" /></p>
        </div>
        <p>
          If you arrive while the imam is already delivering the khutbah, pray two brief rak&apos;ah before sitting — the Prophet ﷺ said: &ldquo;When any one of you comes on Friday, while the Imam delivers the sermon, he should observe two rak&apos;ahs and should make them short&rdquo; (<HadithRefText text="Muslim 7:74" className="inline" />). After Jumu&apos;ah, it is sunnah to pray voluntary rak&apos;ah — Ibn Umar related that the Prophet ﷺ used to pray two rak&apos;ah in his house after Friday prayer (<HadithRefText text="Ibn Majah 5:328" className="inline" />).
        </p>
      </div>
    ),
  },
  {
    id: "sunnahs",
    title: "The Friday sunnahs",
    subtitle: "Ghusl, early arrival, al-Kahf, salawat, the hour of du'a",
    body: (
      <div className="space-y-3 text-sm text-themed-muted leading-relaxed">
        <p>
          <span className="text-gold font-medium">Ghusl, best clothes, and perfume.</span> The Prophet ﷺ said: &ldquo;The taking of a bath on Friday is compulsory for every male Muslim who has attained the age of puberty&rdquo; (<HadithRefText text="Bukhari 11:5" className="inline" />). Bathing, wearing your best clothes, wearing perfume, and not stepping over people at the masjid together atone for the sins of the week (<HadithRefText text="Abu Dawud 1:343" className="inline" />). See the ghusl guide under Purification.
        </p>
        <p>
          <span className="text-gold font-medium">Going early.</span> &ldquo;He who takes a bath on Friday, the bath which is obligatory after the sexual discharge and then goes (to the mosque), he is like one who offers a she-camel as a sacrifice, and he who comes at the second hour would be like one who offers a cow, and he who comes at the third hour is like one who offers a ram with horns…&rdquo; (<HadithRefText text="Muslim 7:14" className="inline" />).
        </p>
        <p>
          <span className="text-gold font-medium">Surah al-Kahf.</span> Reciting Surah al-Kahf on Friday is a widely practiced sunnah reported in narrations that many scholars graded authentic. Related and authentically established: whoever memorizes ten verses from the beginning of Surah al-Kahf will be protected from the trial of the Dajjal (<HadithRefText text="Abu Dawud 39:33" className="inline" />).
        </p>
        <p>
          <span className="text-gold font-medium">Abundant salawat.</span> The Prophet ﷺ said: &ldquo;Among the most excellent of your days is Friday; on it Adam was created, on it he died, on it the last trumpet will be blown… so invoke more blessings on me that day, for your blessings will be submitted to me&rdquo; (<HadithRefText text="Abu Dawud 2:658" className="inline" />).
        </p>
        <p>
          <span className="text-gold font-medium">The hour of accepted du&apos;a.</span> &ldquo;There is an hour (opportune time) on Friday and if a Muslim gets it while praying and asks something from Allah, then Allah will definitely meet his demand&rdquo; (<HadithRefText text="Bukhari 11:59" className="inline" />). Many scholars considered the last hour before Maghrib the most likely time — make du&apos;a generously throughout the day.
        </p>
      </div>
    ),
  },
  {
    id: "missed",
    title: "If you miss it or cannot attend",
    subtitle: "Praying Dhuhr instead + the latecomer rule",
    body: (
      <div className="space-y-3 text-sm text-themed-muted leading-relaxed">
        <p>
          <span className="text-gold font-medium">Jumu&apos;ah cannot be prayed alone.</span> It is only valid in congregation. If you miss it — or you are exempt (traveling, ill, a woman who chooses not to attend) — you pray <span className="text-gold">Dhuhr, 4 rak&apos;ah</span>, as on any other day. This is the mainstream position of all the schools of fiqh. Missing Jumu&apos;ah without excuse is a serious matter: the Prophet ﷺ warned, &ldquo;People should stop neglecting Jumu&apos;ah or Allah will place a seal on their hearts and they will be deemed as being among the negligent&rdquo; (<HadithRefText text="Nasai 14:6" className="inline" />).
        </p>
        <p>
          <span className="text-gold font-medium">The latecomer rule.</span> The Prophet ﷺ said: &ldquo;Whoever catches one Rak&apos;ah of Friday prayer or other than it, then he has caught the prayer&rdquo; (<HadithRefText text="Ibn Majah 5:321" className="inline" />). So if you join the imam before he rises from the ruku&apos; of the second rak&apos;ah, you have caught Jumu&apos;ah — stand after his taslim and complete the remaining rak&apos;ah. If you join after that, the majority of scholars hold you should complete the prayer as Dhuhr (4 rak&apos;ah).
        </p>
      </div>
    ),
  },
];

function JumuahSection({
  onOpenGhusl,
}: {
  onOpenGhusl: () => void;
}) {
  return (
    <div className="space-y-4">
      <ContentCard>
        <div className="mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-xl font-semibold text-themed">Jumu&apos;ah</h2>
            <span className="text-lg font-arabic text-gold">الجمعة</span>
          </div>
        </div>

        <p className="text-themed-muted text-sm leading-relaxed mb-4">
          The Friday prayer — the weekly congregational prayer that replaces Dhuhr on Friday. It is 2 rak&apos;ah preceded by a khutbah (sermon), and Friday itself is the best day of the week: the day Adam was created and the day carrying an hour in which du&apos;a is answered. Allah commands the believers to leave their trade and gather for it:
        </p>

        {/* Verse */}
        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "var(--color-bg)" }}>
          <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
            يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا نُودِىَ لِلصَّلَوٰةِ مِن يَوْمِ ٱلْجُمُعَةِ فَٱسْعَوْا۟ إِلَىٰ ذِكْرِ ٱللَّهِ وَذَرُوا۟ ٱلْبَيْعَ ۚ ذَٰلِكُمْ خَيْرٌ لَّكُمْ إِن كُنتُمْ تَعْلَمُونَ
          </p>
          <p className="text-themed text-sm italic">
            &ldquo;O you who believe, when the call for prayer is made on Friday, then hasten to the remembrance of Allah and leave off trading. That is better for you, if only you knew.&rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-2"><HadithRefText text="Quran 62:9" /></p>
        </div>

        {/* Time and rak'at info */}
        <div className="rounded-lg p-3 sm:p-4 mb-4 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs text-themed-muted uppercase tracking-wider mb-1">Time</p>
              <p className="text-sm text-themed">Friday, in the time of Dhuhr (which it replaces)</p>
            </div>
            <div>
              <p className="text-xs text-themed-muted uppercase tracking-wider mb-1">Fard Rak&apos;at</p>
              <p className="text-sm text-themed font-semibold">2 (after the khutbah, in congregation)</p>
            </div>
          </div>
        </div>
      </ContentCard>

      <Accordion
        items={jumuahAccordion.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          children: item.body,
        }))}
        defaultOpenId="who"
      />

      {/* Cross-link: ghusl guide lives under Purification */}
      <button
        onClick={onOpenGhusl}
        className="w-full text-left rounded-xl p-4 card-bg border sidebar-border hover:border-gold/40 transition-colors flex items-center justify-between gap-3"
      >
        <div>
          <p className="text-sm font-medium text-themed">How to perform ghusl for Jumu&apos;ah</p>
          <p className="text-xs text-themed-muted mt-0.5">Step-by-step guide under Purification → Ghusl</p>
        </div>
        <ChevronRight size={16} className="text-gold shrink-0" />
      </button>
    </div>
  );
}

/* ───────────────────────── sections ───────────────────────── */

// Keys 'adhan' and 'voluntary' are deep-linked from Settings + the Ramadan home
// (?sub=tarawih) — do not rename them. The old 'times'/'qiblah' tabs redirect to
// the standalone /prayer-times and /qiblah pages (handled on mount below).
const sections = [
  { key: "intro", label: "Salah" },
  { key: "importance", label: "Why It Matters" },
  { key: "wudu", label: "Purification" },
  { key: "adhan", label: "Adhan & Iqamah" },
  { key: "prayers", label: "The Prayers" },
  { key: "voluntary", label: "Voluntary & Special" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── interactive guide ───────────────────────── */

function PrayerGuide({
  prayer,
  onBack,
}: {
  prayer: Prayer;
  onBack: () => void;
}) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<"male" | "female">("male");
  const current = prayerSteps[step];
  const total = prayerSteps.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <ContentCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-themed-muted hover:text-gold transition-colors"
          >
            <ArrowLeft size={16} />
            Back to {prayer.name}
          </button>

          {/* Gender toggle */}
          <div className="flex items-center gap-1 p-1 rounded-full border sidebar-border">
            <button
              onClick={() => setGender("male")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                gender === "male"
                  ? "bg-gold/20 text-gold"
                  : "text-themed-muted hover:text-themed"
              }`}
            >
              <User size={12} />
              Male
            </button>
            <button
              onClick={() => setGender("female")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                gender === "female"
                  ? "bg-gold/20 text-gold"
                  : "text-themed-muted hover:text-themed"
              }`}
            >
              <User size={12} />
              Female
            </button>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-themed text-center mb-1">
          How to Pray {prayer.name}
        </h2>
        <p className="text-xs text-themed-muted text-center mb-2">
          {prayer.fardRakaat > 0
            ? `${prayer.fardRakaat} rak'at ${prayer.sunnahBefore > 0 ? `(+ ${prayer.sunnahBefore} sunnah before)` : ""} ${prayer.sunnahAfter > 0 ? `(+ ${prayer.sunnahAfter} sunnah after)` : ""}`
            : (prayer.id === "tawbah" || prayer.id === "istikhara") ? "2 rak'at"
            : "Voluntary — pray in sets of 2 rak'at"
          }
        </p>

        {/* Progress bar */}
        <div className="flex gap-1 mb-6">
          {prayerSteps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                i <= step ? "bg-gold" : "bg-gold/15"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex flex-col items-center">
          {/* Figure */}
          <div className="mb-4">
            <AnimatePresence mode="wait">
              <PrayerFigure
                key={`${current.position}-${step}`}
                position={current.position}
                gender={gender}
              />
            </AnimatePresence>
          </div>

          {/* Position label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <div className="text-center mb-4">
                <span className="text-xs text-gold/60 uppercase tracking-wider">
                  Step {step + 1} of {total}
                </span>
                <h3 className="text-lg font-semibold text-gold mt-1">
                  {current.label}
                </h3>
              </div>

              {/* Arabic recitation */}
              {current.arabic && (
                <div
                  className="rounded-lg p-4 mb-4"
                  style={{ backgroundColor: "var(--color-bg)" }}
                >
                  <p className="text-xl md:text-2xl font-arabic text-gold text-center leading-loose mb-3">
                    {current.arabic}
                  </p>
                  <p className="text-themed text-sm text-center italic mb-1">
                    {current.transliteration}
                  </p>
                  <p className="text-themed-muted text-xs text-center">
                    {current.translation}
                  </p>
                </div>
              )}

              {/* Instruction */}
              <p className="text-themed-muted text-sm leading-relaxed text-center mb-3">
                {current.instruction}
              </p>

              {/* Gender-specific note */}
              {gender === "male" && current.maleNote && (
                <p className="text-xs text-gold/70 text-center italic">
                  {current.maleNote}
                </p>
              )}
              {gender === "female" && current.femaleNote && (
                <p className="text-xs text-gold/70 text-center italic">
                  {current.femaleNote}
                </p>
              )}
              {((gender === "male" && current.maleNote) || (gender === "female" && current.femaleNote)) && (
                <p className="text-[10px] text-themed-muted/50 text-center mt-1">
                  Note: Gender-specific differences are based on the Hanafi school. Many scholars hold that prayer positions are the same for men and women.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t sidebar-border">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              step === 0
                ? "text-themed-muted/30 cursor-not-allowed"
                : "text-themed-muted hover:text-gold hover:bg-gold/10"
            }`}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="text-xs text-themed-muted">
            {step + 1} / {total}
          </span>
          <button
            onClick={() => setStep(Math.min(total - 1, step + 1))}
            disabled={step === total - 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              step === total - 1
                ? "text-themed-muted/30 cursor-not-allowed"
                : "text-gold hover:bg-gold/10"
            }`}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </ContentCard>

      {/* Rak'ah structure note */}
      <div className="mt-4">
        <ContentCard delay={0.1}>
          <h4 className="text-sm font-semibold text-themed mb-3">
            Rak&apos;ah Structure for {prayer.name}
          </h4>
          <div className="space-y-2 text-sm text-themed-muted">
            {prayer.fardRakaat === 2 && (
              <>
                <p><span className="text-gold font-medium">Rak&apos;ah 1:</span> Steps 1-9 (Fatihah + surah, ruku&apos;, 2 sujud)</p>
                <p><span className="text-gold font-medium">Rak&apos;ah 2:</span> Repeat steps 4-9 (Fatihah + surah, ruku&apos;, 2 sujud)</p>
                <p><span className="text-gold font-medium">Final:</span> Tashahhud + Salawat + Taslim (steps 10-13)</p>
              </>
            )}
            {prayer.fardRakaat === 3 && (
              <>
                <p><span className="text-gold font-medium">Rak&apos;ah 1:</span> Steps 1-9 (Fatihah + surah, ruku&apos;, 2 sujud)</p>
                <p><span className="text-gold font-medium">Rak&apos;ah 2:</span> Repeat steps 4-9 then sit for Tashahhud only (step 10)</p>
                <p><span className="text-gold font-medium">Rak&apos;ah 3:</span> Rise, recite Fatihah only (no surah), ruku&apos;, 2 sujud</p>
                <p><span className="text-gold font-medium">Final:</span> Tashahhud + Salawat + Taslim (steps 10-13)</p>
              </>
            )}
            {prayer.fardRakaat === 4 && (
              <>
                <p><span className="text-gold font-medium">Rak&apos;ah 1:</span> Steps 1-9 (Fatihah + surah, ruku&apos;, 2 sujud)</p>
                <p><span className="text-gold font-medium">Rak&apos;ah 2:</span> Repeat steps 4-9 then sit for Tashahhud only (step 10)</p>
                <p><span className="text-gold font-medium">Rak&apos;ah 3:</span> Rise, recite Fatihah only (no surah), ruku&apos;, 2 sujud</p>
                <p><span className="text-gold font-medium">Rak&apos;ah 4:</span> Fatihah only, ruku&apos;, 2 sujud</p>
                <p><span className="text-gold font-medium">Final:</span> Tashahhud + Salawat + Taslim (steps 10-13)</p>
              </>
            )}
            {prayer.fardRakaat === 0 && ["tawbah", "istikhara", "tahiyyat", "istisqa"].includes(prayer.id) && (
              <>
                <p><span className="text-gold font-medium">Rak&apos;ah 1:</span> Steps 1-9 (Fatihah + surah, ruku&apos;, 2 sujud)</p>
                <p><span className="text-gold font-medium">Rak&apos;ah 2:</span> Repeat steps 4-9 (Fatihah + surah, ruku&apos;, 2 sujud)</p>
                <p><span className="text-gold font-medium">Final:</span> Tashahhud + Salawat + Taslim (steps 10-13)</p>
                {prayer.id === "istikhara" && (
                  <p className="text-xs text-themed-muted/60 mt-1 italic">After the taslim, recite the du&apos;a of Istikhara</p>
                )}
                {prayer.id === "tawbah" && (
                  <p className="text-xs text-themed-muted/60 mt-1 italic">After the taslim, make sincere istighfar and du&apos;a for forgiveness</p>
                )}
              </>
            )}
            {prayer.fardRakaat === 0 && prayer.id === "witr" && (
              <>
                <p><span className="text-gold font-medium">Format:</span> Pray 2 rak&apos;at + taslim, then 1 rak&apos;ah alone — or 3 rak&apos;at continuously</p>
                <p><span className="text-gold font-medium">Final rak&apos;ah:</span> Recite the Qunut supplication</p>
                <p className="text-xs text-themed-muted/60 mt-1 italic">Make witr your last prayer of the night (Bukhari 14:9)</p>
              </>
            )}
            {prayer.fardRakaat === 0 && !["tawbah", "istikhara", "janazah", "eid", "tahiyyat", "istisqa", "witr", "kusuf"].includes(prayer.id) && (
              <>
                <p><span className="text-gold font-medium">Each set:</span> Pray 2 rak&apos;at at a time — Fatihah + surah, ruku&apos;, 2 sujud, then Tashahhud + Taslim</p>
                <p><span className="text-gold font-medium">Repeat:</span> Pray as many sets of 2 as you wish</p>
                {(prayer.id === "tahajjud") && (
                  <p><span className="text-gold font-medium">End with Witr:</span> Conclude with an odd number (1 or 3 rak&apos;at) for Witr prayer</p>
                )}
                {(prayer.id === "tahajjud") && (
                  <p className="text-xs text-themed-muted/60 mt-1 italic">The Prophet (peace be upon him) said: &ldquo;The night prayer is two by two&rdquo; (Bukhari 14:9)</p>
                )}
              </>
            )}
          </div>
        </ContentCard>
      </div>

      {/* Sources */}
      <div className="mt-4">
        <SourcesCard delay={0.15} sources={[
          { ref: "Sifat Salat an-Nabi, al-Albani", desc: "Comprehensive description of the Prophet's prayer" },
          { ref: "Bukhari 10:150", desc: "On the obligation of Al-Fatihah in every rak'ah" },
          { ref: "Muslim 4:41", desc: "Allah's response to each verse of Al-Fatihah" },
          { ref: "Muslim 4:245", desc: "The closest a servant is to Allah is in sujud" },
          { ref: "Bukhari 21:6", desc: "Tashahhud and Salawat narrated by Ibn Mas'ud" },
        ]} />
      </div>
    </motion.div>
  );
}

/* ───────────────────────── prayer info card ───────────────────────── */

function PrayerInfoCard({
  prayer,
  onHowToPray,
}: {
  prayer: Prayer;
  onHowToPray: () => void;
}) {
  return (
    <>
      <ContentCard>
        <div className="mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-xl font-semibold text-themed">{prayer.name}</h2>
            <span className="text-lg font-arabic text-gold">{prayer.nameAr}</span>
          </div>
        </div>

        <p className="text-themed-muted text-sm leading-relaxed mb-4">
          {prayer.description}
        </p>

        {/* Time and rak'at info */}
        <div className="rounded-lg p-3 sm:p-4 mb-4 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs text-themed-muted uppercase tracking-wider mb-1">Time</p>
              <p className="text-sm text-themed">{prayer.time}</p>
            </div>
            <div>
              <p className="text-xs text-themed-muted uppercase tracking-wider mb-1">{prayer.fardRakaat > 0 ? "Fard" : "Voluntary"} Rak&apos;at</p>
              <p className="text-sm text-themed font-semibold">{
                prayer.fardRakaat > 0 ? prayer.fardRakaat
                : prayer.id === "janazah" ? "4 takbirat (no ruku'/sujud)"
                : prayer.id === "eid" ? "2 (with extra takbirat)"
                : prayer.id === "tawbah" || prayer.id === "istikhara" ? "2"
                : prayer.id === "witr" ? "1, 3, 5… (odd number)"
                : prayer.id === "tahiyyat" ? "2"
                : prayer.id === "kusuf" ? "2 (two bowings per rak'ah)"
                : prayer.id === "istisqa" ? "2"
                : prayer.id === "tarawih" ? "8–20 (in sets of 2)"
                : prayer.id === "duha" ? "2–12 (in sets of 2)"
                : "2–12 (in sets of 2)"
              }</p>
            </div>
            {prayer.sunnahBefore > 0 && (
              <div>
                <p className="text-xs text-themed-muted uppercase tracking-wider mb-1">Sunnah Before</p>
                <p className="text-sm text-themed">{prayer.sunnahBefore} rak&apos;at</p>
              </div>
            )}
            {prayer.sunnahAfter > 0 && (
              <div>
                <p className="text-xs text-themed-muted uppercase tracking-wider mb-1">Sunnah After</p>
                <p className="text-sm text-themed">{prayer.sunnahAfter} rak&apos;at</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional note */}
        <p className="text-themed-muted text-sm leading-relaxed mb-4">
          {prayer.additionalNote}
        </p>

        {/* Verse */}
        {prayer.verse && (
          <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "var(--color-bg)" }}>
            <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
              {prayer.verse.arabic}
            </p>
            <p className="text-themed text-sm italic">
              &ldquo;{prayer.verse.text}&rdquo;
            </p>
            <p className="text-xs text-themed-muted mt-2"><HadithRefText text={prayer.verse.ref} /></p>
          </div>
        )}

        {/* Hadith */}
        {prayer.hadith && (
          <div
            className="rounded-lg p-4 mb-4 border-l-2 border-gold/30"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <p className="text-themed text-sm italic">
              &ldquo;{prayer.hadith.text}&rdquo;
            </p>
            <p className="text-xs text-themed-muted mt-2"><HadithRefText text={prayer.hadith.ref} /></p>
          </div>
        )}

        {/* How to Pray button — hidden for prayers with non-standard format */}
        {!["janazah", "eid", "kusuf"].includes(prayer.id) && (
          <button
            onClick={onHowToPray}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-gold/15 border border-gold/30 text-gold font-medium text-sm hover:bg-gold/25 transition-all flex items-center justify-center gap-2"
          >
            <Clock size={16} />
            How to Pray {prayer.name} — Step by Step
          </button>
        )}
      </ContentCard>
    </>
  );
}

/* ───────────────────────── Adhan & Iqamah section ───────────────────────── */

function AdhanSection() {
  const { playing, startManual, stop } = useAdhanAudio();
  const isNative = useIsNative();

  return (
    <div className="space-y-6">
      {/* Intro */}
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The <span className="text-gold">adhan</span> is the call to prayer that announces the time has come. The <span className="text-gold">iqamah</span> is a second, shorter call made by someone in the congregation just before the prayer begins, signaling everyone to stand and align in rows. Below you can read both.
        </p>
      </ContentCard>

      {/* Adhan playback panel — on the native app quick playback is on the
          Home screen instead. */}
      {!isNative && (
      <ContentCard delay={0.08}>
        <h3 className="text-gold font-semibold text-lg mb-4 flex items-center gap-2">
          <Volume2 size={18} />
          Listen to the Adhan
        </h3>

        <div className="flex flex-wrap gap-2">
          {playing ? (
            <button
              onClick={stop}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 transition-colors text-sm font-medium"
            >
              <StopCircle size={16} /> Stop Adhan
            </button>
          ) : (
            <button
              onClick={startManual}
              className="flex items-center gap-2 px-4 py-2 rounded-lg card-bg border sidebar-border text-themed hover:border-gold/40 hover:text-gold transition-colors text-sm font-medium"
            >
              <Play size={16} /> Play Adhan
            </button>
          )}
        </div>
        <p className="text-xs text-themed-muted mt-3">
          Adhan recitation by Omar Hisham Al Arabi.
        </p>
      </ContentCard>
      )}

      {/* Adhan text */}
      <ContentCard delay={0.11}>
        <h3 className="text-gold font-semibold text-lg mb-3">The Adhan</h3>
        <div className="space-y-3 text-sm">
          <AdhanLine
            arabic="اللَّهُ أَكْبَر، اللَّهُ أَكْبَر، اللَّهُ أَكْبَر، اللَّهُ أَكْبَر"
            transliteration="Allahu Akbar, Allahu Akbar, Allahu Akbar, Allahu Akbar"
            english="Allah is the Greatest (×4)"
          />
          <AdhanLine
            arabic="أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّه، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّه"
            transliteration="Ash-hadu an la ilaha illa Allah (×2)"
            english="I bear witness that there is no god but Allah (×2)"
          />
          <AdhanLine
            arabic="أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّه، أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّه"
            transliteration="Ash-hadu anna Muhammadan Rasulullah (×2)"
            english="I bear witness that Muhammad is the Messenger of Allah (×2)"
          />
          <AdhanLine
            arabic="حَيَّ عَلَى الصَّلَاة، حَيَّ عَلَى الصَّلَاة"
            transliteration="Hayya 'ala-s-Salah (×2)"
            english="Come to prayer (×2)"
          />
          <AdhanLine
            arabic="حَيَّ عَلَى الْفَلَاح، حَيَّ عَلَى الْفَلَاح"
            transliteration="Hayya 'ala-l-Falah (×2)"
            english="Come to success (×2)"
          />
          <AdhanLine
            arabic="اللَّهُ أَكْبَر، اللَّهُ أَكْبَر"
            transliteration="Allahu Akbar, Allahu Akbar"
            english="Allah is the Greatest (×2)"
          />
          <AdhanLine
            arabic="لَا إِلَٰهَ إِلَّا اللَّه"
            transliteration="La ilaha illa Allah"
            english="There is no god but Allah"
          />
        </div>
        <div className="mt-4 pt-4 border-t sidebar-border">
          <p className="text-themed text-sm font-medium mb-2">For Fajr only, after &ldquo;Hayya &apos;ala-l-Falah&rdquo;:</p>
          <AdhanLine
            arabic="الصَّلَاةُ خَيْرٌ مِنَ النَّوْم، الصَّلَاةُ خَيْرٌ مِنَ النَّوْم"
            transliteration="As-salatu khayrun min an-nawm (×2)"
            english="Prayer is better than sleep (×2)"
          />
        </div>
        <p className="text-xs text-themed-muted mt-4">
          The adhan was given to the Muslims through a dream of &apos;Abdullah ibn Zayd, confirmed by &apos;Umar ibn al-Khattab&apos;s dream, and approved by the Prophet ﷺ — narrated in <HadithRefText text="Abu Dawud 2:109" className="inline text-gold/80" />.
        </p>
      </ContentCard>

      {/* Iqamah text */}
      <ContentCard delay={0.14}>
        <h3 className="text-gold font-semibold text-lg mb-3">The Iqamah</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-2">
          The iqamah is the second call to prayer. It is given <span className="text-gold">just before</span> the congregational prayer starts, after people have already gathered. It signals everyone to stand and align in rows behind the imam.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          Its wording is almost identical to the adhan but <span className="text-gold">shorter</span> — most phrases are said only once instead of twice, and it adds the line <span className="font-arabic text-gold">قَدْ قَامَتِ الصَّلَاة</span> (&ldquo;the prayer has begun&rdquo;). The iqamah is typically called by a member of the congregation when the imam is ready. The timing depends on local masjid practice — usually 10-25 minutes after the adhan to give people time to arrive.
        </p>
        <div className="space-y-3 text-sm">
          <AdhanLine
            arabic="اللَّهُ أَكْبَر، اللَّهُ أَكْبَر"
            transliteration="Allahu Akbar, Allahu Akbar"
            english="Allah is the Greatest (×2)"
          />
          <AdhanLine
            arabic="أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّه"
            transliteration="Ash-hadu an la ilaha illa Allah"
            english="I bear witness that there is no god but Allah"
          />
          <AdhanLine
            arabic="أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّه"
            transliteration="Ash-hadu anna Muhammadan Rasulullah"
            english="I bear witness that Muhammad is the Messenger of Allah"
          />
          <AdhanLine
            arabic="حَيَّ عَلَى الصَّلَاة"
            transliteration="Hayya 'ala-s-Salah"
            english="Come to prayer"
          />
          <AdhanLine
            arabic="حَيَّ عَلَى الْفَلَاح"
            transliteration="Hayya 'ala-l-Falah"
            english="Come to success"
          />
          <AdhanLine
            arabic="قَدْ قَامَتِ الصَّلَاة، قَدْ قَامَتِ الصَّلَاة"
            transliteration="Qad qamati-s-Salah (×2)"
            english="The prayer has begun (×2)"
          />
          <AdhanLine
            arabic="اللَّهُ أَكْبَر، اللَّهُ أَكْبَر"
            transliteration="Allahu Akbar, Allahu Akbar"
            english="Allah is the Greatest (×2)"
          />
          <AdhanLine
            arabic="لَا إِلَٰهَ إِلَّا اللَّه"
            transliteration="La ilaha illa Allah"
            english="There is no god but Allah"
          />
        </div>
      </ContentCard>

      {/* Answering the adhan */}
      <ContentCard delay={0.17}>
        <h3 className="text-gold font-semibold text-lg mb-3">Answering the Adhan</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          The adhan is not only to be heard — it is answered. The Prophet ﷺ said:
          &ldquo;Whenever you hear the Adhan, say what the Mu&apos;adh-dhin is saying&rdquo;
          (<HadithRefText text="Bukhari 10:9" className="inline" />;{" "}
          <HadithRefText text="Muslim 4:12" className="inline" />). Repeat each line
          quietly after the caller — with one exception: when he says{" "}
          <span className="text-gold">Hayya &apos;ala-s-Salah</span> and{" "}
          <span className="text-gold">Hayya &apos;ala-l-Falah</span>, respond instead with:
        </p>
        <AdhanLine
          arabic="لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ"
          transliteration="La hawla wa la quwwata illa billah"
          english="There is no might and no power except with Allah"
        />
        <p className="text-themed-muted text-sm leading-relaxed mt-3 mb-3">
          The Prophet ﷺ taught this line-by-line response in the hadith of &apos;Umar ibn
          al-Khattab, and ended it with a promise: whoever answers the final{" "}
          <span className="text-gold">La ilaha illa Allah</span>{" "}
          <span className="text-gold">from his heart</span> &ldquo;will enter Paradise&rdquo;
          (<HadithRefText text="Muslim 4:14" className="inline" />). And whoever says, on
          hearing the mu&apos;adhdhin&apos;s testimony:
        </p>
        <AdhanLine
          arabic="أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ وَأَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ رَضِيتُ بِاللَّهِ رَبًّا وَبِمُحَمَّدٍ رَسُولاً وَبِالإِسْلاَمِ دِينًا"
          transliteration="Ash-hadu an la ilaha illallahu wahdahu la sharika lah, wa anna Muhammadan 'abduhu wa rasuluh; raditu billahi Rabban, wa bi-Muhammadin rasulan, wa bil-Islami dina"
          english="I testify that there is no god but Allah alone, Who has no partner, and that Muhammad is His servant and His Messenger; I am satisfied with Allah as my Lord, with Muhammad as Messenger, and with Islam as din (way of life)"
        />
        <p className="text-themed-muted text-sm leading-relaxed mt-3">
          — &ldquo;his sins would be forgiven&rdquo;{" "}
          (<HadithRefText text="Muslim 4:15" className="inline" />).
        </p>
      </ContentCard>

      {/* The du'a after the adhan */}
      <ContentCard delay={0.2}>
        <h3 className="text-gold font-semibold text-lg mb-3">The Du&apos;a after the Adhan</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          When the adhan ends, the Prophet ﷺ taught a two-part sunnah: first send
          salawat upon him — &ldquo;then invoke a blessing on me, for everyone who invokes
          a blessing on me will receive ten blessings from Allah; then beg from Allah
          al-Wasila for me&rdquo; (<HadithRefText text="Muslim 4:13" className="inline" />) —
          then make this du&apos;a:
        </p>
        <AdhanLine
          arabic="اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلاَةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ"
          transliteration="Allahumma Rabba hadhihi-d-da'wati-t-tammah, was-salatil-qa'imah, ati Muhammadan al-wasilata wal-fadilah, wab'ath-hu maqaman mahmudan-illadhi wa'adtah"
          english="O Allah! Lord of this perfect call and of the regular prayer which is going to be established! Give Muhammad the right of intercession and illustriousness, and resurrect him to the best and the highest place in Paradise that You promised him"
        />
        <p className="text-themed-muted text-sm leading-relaxed mt-3">
          The reward is immense — the Prophet ﷺ said that for whoever says it,
          &ldquo;my intercession for him will be allowed on the Day of Resurrection&rdquo;
          (<HadithRefText text="Bukhari 10:12" className="inline" />;{" "}
          <HadithRefText text="Abu Dawud 2:139" className="inline" />).
        </p>
      </ContentCard>

      {/* Between adhan and iqamah */}
      <ContentCard delay={0.23}>
        <h3 className="text-gold font-semibold text-lg mb-3">Between the Adhan and the Iqamah</h3>
        <p className="text-themed-muted text-sm leading-relaxed">
          The minutes between the adhan and the iqamah are a golden window for personal
          du&apos;a. The Prophet ﷺ said: &ldquo;The supplication made between the adhan and
          the iqamah is not rejected&rdquo;{" "}
          (<HadithRefText text="Abu Dawud 2:131" className="inline" />). Instead of
          scrolling while you wait for the congregation, ask Allah for whatever you
          need — in any language.
        </p>
      </ContentCard>

      <SourcesCard className="mt-6" sources={[
        { ref: "Abu Dawud 2:109", desc: "Origin of the adhan — the dream of 'Abdullah ibn Zayd" },
        { ref: "Bukhari 10:2", desc: "The origin of the adhan as a public call to congregational prayer" },
        { ref: "Bukhari 10:3", desc: "The iqamah — phrases said once except takbir and 'qad qamati-s-salah'" },
        { ref: "Bukhari 10:9", desc: "Say what the mu'adhdhin is saying" },
        { ref: "Muslim 4:14", desc: "Line-by-line response to the adhan; answering from the heart" },
        { ref: "Muslim 4:15", desc: "The testimony said on hearing the mu'adhdhin — sins forgiven" },
        { ref: "Muslim 4:13", desc: "Salawat after the adhan, then asking for al-Wasilah" },
        { ref: "Bukhari 10:12", desc: "The du'a after the adhan — the Prophet's ﷺ intercession" },
        { ref: "Abu Dawud 2:131", desc: "Du'a between the adhan and iqamah is not rejected" },
      ]} />
    </div>
  );
}

function AdhanLine({
  arabic,
  transliteration,
  english,
}: {
  arabic: string;
  transliteration: string;
  english: string;
}) {
  return (
    <div className="space-y-1">
      <p className="font-arabic text-gold text-lg leading-loose">{arabic}</p>
      <p className="text-themed text-sm leading-relaxed">{transliteration}</p>
      <p className="text-themed-muted text-sm leading-relaxed italic">{english}</p>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

function SalahContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeSection, setActiveSection] = useState<SectionKey>(() => {
    // 'purification' is an alias for the wudu tab (its visible label) so links
    // written against the label keep working.
    const raw = searchParams.get("tab");
    const tab = raw === "purification" ? "wudu" : raw;
    return tab && sections.some((s) => s.key === tab) ? (tab as SectionKey) : "intro";
  });
  const [activePrayer, setActivePrayer] = useState(() => {
    // Deep-link support: ?tab=prayers&sub=<id> — 'jumuah' is a valid rail pill too.
    const sub = searchParams.get("sub");
    return sub && (sub === "jumuah" || prayers.some((p) => p.id === sub) || prayerSituationTopics.some((t) => t.id === sub)) ? sub : "fajr";
  });
  const [activeVoluntary, setActiveVoluntary] = useState(() => {
    // Deep-link support: ?sub=<id> (e.g. /salah?tab=voluntary&sub=tarawih).
    // Validate against real prayer ids — currentPrayer uses .find(...)! below.
    const sub = searchParams.get("sub");
    return sub && voluntaryPrayers.some((p) => p.id === sub) ? sub : "tahajjud";
  });
  const [activeWudu, setActiveWudu] = useState(() => {
    // Deep-link support: ?tab=wudu&sub=<id> (e.g. /salah?tab=wudu&sub=ghusl).
    const sub = searchParams.get("sub");
    return sub && purificationTopics.some((t) => t.id === sub) ? sub : "overview";
  });
  const [showGuide, setShowGuide] = useState(false);
  const [search, setSearch] = useState("");

  // Legacy deep links: the Prayer Times widget and Qiblah compass now live on
  // their own pages. Old links (Home cards, notifications) must keep working.
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "times") router.replace("/prayer-times");
    else if (tab === "qiblah") router.replace("/qiblah");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write ?tab= (and ?sub= for rail selections) so every view is deep-linkable.
  const syncUrl = useCallback(
    (tab: SectionKey, sub?: string) => {
      router.replace(`${pathname}?tab=${tab}${sub ? `&sub=${sub}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  const selectSection = (k: SectionKey) => {
    setActiveSection(k);
    setShowGuide(false);
    if (k === "wudu") syncUrl(k, activeWudu);
    else if (k === "prayers") syncUrl(k, activePrayer);
    else if (k === "voluntary") syncUrl(k, activeVoluntary);
    else syncUrl(k);
  };

  /* ── search matchers ── */
  const mattersMatches = (item: { point: string; detail: string; reference: string }) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, item.point, item.detail, item.reference);
  };

  const prayerMatches = (p: Prayer) => {
    if (!search || search.length < 2) return true;
    return textMatch(
      search,
      p.name,
      p.nameAr,
      p.time,
      p.description,
      p.additionalNote,
      p.verse?.text,
      p.verse?.ref,
      p.hadith?.text,
      p.hadith?.ref,
    );
  };

  const filteredPrayers = prayers.filter(prayerMatches);
  const filteredVoluntary = voluntaryPrayers.filter(prayerMatches);
  const filteredPrayerTypes = prayerTypes.filter((t) => {
    if (!search) return true;
    return textMatch(search, t.name, t.nameAr, t.detail, t.examples, t.ruling, t.ref);
  });
  const showTypes = !search || filteredPrayerTypes.length > 0;
  const filteredMatters = whyItMatters.filter(mattersMatches);

  const jumuahMatches =
    !search ||
    search.length < 2 ||
    textMatch(
      search,
      "Jumu'ah",
      "الجمعة",
      "Friday prayer",
      "khutbah",
      "sermon",
      "zawal",
      "congregation",
      "ghusl",
      "Surah al-Kahf",
      "salawat",
      "hour of du'a",
    );

  const wuduTopicMatches = (t: Topic) => {
    if (!search) return true;
    return textMatch(
      search,
      t.name,
      t.content.intro,
      ...t.content.points.map((p) => p.title),
      ...t.content.points.map((p) => p.detail),
    );
  };
  const filteredPurification = purificationTopics.filter(wuduTopicMatches);
  const activePurificationTopic =
    purificationTopics.find((t) => t.id === activeWudu) || purificationTopics[0];

  const currentPrayer = activeSection === "voluntary"
    ? voluntaryPrayers.find((p) => p.id === activeVoluntary)!
    : prayers.find((p) => p.id === activePrayer) || prayers[0];

  const situationMatches = (t: Topic) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, t.name, t.content.intro, t.content.source,
      ...t.content.points.map((p) => p.title),
      ...t.content.points.map((p) => p.detail));
  };
  const filteredSituations = prayerSituationTopics.filter(situationMatches);
  /* ── rail pills (shared SubTabLayout) ── */
  const prayerSubs = [
    ...filteredPrayers.map((p) => ({ key: p.id, label: p.name })),
    ...(jumuahMatches ? [{ key: "jumuah", label: "Jumu'ah" }] : []),
    ...filteredSituations.map((t) => ({ key: t.id, label: t.name })),
  ];
  const voluntarySubs = filteredVoluntary.map((p) => ({ key: p.id, label: p.name }));
  const purificationSubs = filteredPurification.map((t) => ({ key: t.id, label: t.name }));

  /* auto-select the first visible rail item when search filters out the active one */
  useEffect(() => {
    if (!search || search.length < 2) return;
    const visiblePrayers = [
      ...prayers.filter(prayerMatches).map((p) => p.id),
      ...(jumuahMatches ? ["jumuah"] : []),
      ...prayerSituationTopics.filter(situationMatches).map((t) => t.id),
    ];
    if (visiblePrayers.length && !visiblePrayers.includes(activePrayer))
      setActivePrayer(visiblePrayers[0]);
    const visibleVoluntary = voluntaryPrayers.filter(prayerMatches).map((p) => p.id);
    if (visibleVoluntary.length && !visibleVoluntary.includes(activeVoluntary))
      setActiveVoluntary(visibleVoluntary[0]);
    const visibleWudu = purificationTopics.filter(wuduTopicMatches).map((t) => t.id);
    if (visibleWudu.length && !visibleWudu.includes(activeWudu))
      setActiveWudu(visibleWudu[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activePrayer, activeVoluntary, activeWudu]);

  const openGhusl = () => {
    setActiveSection("wudu");
    setActiveWudu("ghusl");
    setShowGuide(false);
    syncUrl("wudu", "ghusl");
  };

  const openJumuah = () => {
    setActiveSection("prayers");
    setActivePrayer("jumuah");
    setShowGuide(false);
    syncUrl("prayers", "jumuah");
  };

  return (
    <div>
      <PageHeader
        title="Salah"
        titleAr="الصلاة"
        subtitle="The five daily prayers — the direct connection between the servant and Allah"
      />

      <VerseHero
        arabic="إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ ۗ وَلَذِكْرُ ٱللَّهِ أَكْبَرُ"
        text="Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater."
        reference="Quran 29:45"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search prayers, steps, duas..." className="mb-6" />

      {/* Section navigation (shared TabBar — 6 tabs, so pills stay visible on mobile) */}
      <TabBar
        tabs={sections.map((s) => ({ key: s.key, label: s.label }))}
        activeTab={activeSection}
        onTabChange={(k) => selectSection(k as SectionKey)}
        className="mb-6"
      />

      <AnimatePresence mode="wait">
        {/* ─── What is Salah? ─── */}
        {activeSection === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Utility links — the live widgets now live on their own pages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/prayer-times"
                className="rounded-xl p-4 card-bg border sidebar-border hover:border-gold/40 transition-colors flex items-center gap-3"
              >
                <div className="p-2.5 rounded-lg bg-gold/10 shrink-0">
                  <Clock size={20} className="text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-themed">Prayer times</p>
                  <p className="text-xs text-themed-muted mt-0.5">Today&apos;s times + live countdown</p>
                </div>
                <ChevronRight size={16} className="text-gold shrink-0" />
              </Link>
              <Link
                href="/qiblah"
                className="rounded-xl p-4 card-bg border sidebar-border hover:border-gold/40 transition-colors flex items-center gap-3"
              >
                <div className="p-2.5 rounded-lg bg-gold/10 shrink-0">
                  <Compass size={20} className="text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-themed">Qiblah</p>
                  <p className="text-xs text-themed-muted mt-0.5">Live compass toward the Ka&apos;bah</p>
                </div>
                <ChevronRight size={16} className="text-gold shrink-0" />
              </Link>
            </div>

            <ContentCard>
              <h2 className="text-xl font-semibold text-themed mb-4">What is Salah?</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">Salah</span> (الصلاة) is the second pillar of Islam and the most important act of worship after the shahada. It is the direct, personal connection between the servant and Allah — prescribed five times daily at specific times from dawn to night.
                </p>
                <p>
                  Salah was prescribed during the Night Journey (al-Isra wal-Mi&apos;raj), when the Prophet Muhammad (peace be upon him) was taken up through the heavens. Originally fifty prayers were prescribed, then reduced to five in number but fifty in reward (Bukhari 63:112, Muslim 1:321).
                </p>
                <p>
                  The prayer involves a sequence of positions — standing, bowing, prostrating, and sitting — each accompanied by specific recitations from the Quran and supplications. It begins with &apos;Allahu Akbar&apos; (takbiratul ihram) and ends with the taslim (saying &apos;As-salamu alaykum wa rahmatullah&apos; to each side).
                </p>
                <p>
                  Salah requires ritual purity (wudu), facing the qiblah (direction of the Ka&apos;bah in Makkah), covering the awrah, and praying within the appointed time. It is not merely a ritual — the Prophet (peace be upon him) said it is a conversation with Allah. When you recite Al-Fatihah, Allah responds to each verse (Muslim 4:41).
                </p>
              </div>
            </ContentCard>

            <ContentCard delay={0.2}>
              <h2 className="text-xl font-semibold text-themed mb-4">Prerequisites for Prayer</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <ul className="space-y-2">
                  {[
                    "Ritual purity (wudu) — washing the face, arms, wiping the head, and washing the feet (Quran 5:6)",
                    "Clean body, clothes, and place of prayer",
                    "Covering the awrah — for men: from navel to knees; for women: the entire body except face and hands",
                    "Facing the qiblah — the direction of the Ka'bah in Makkah",
                    "Praying at the appointed time — each prayer has a specific window",
                    "Intention (niyyah) in the heart for the specific prayer",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-gold mt-0.5">&#9670;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ContentCard>

            {/* Overview */}
            <ContentCard delay={0.3}>
              <h2 className="text-xl font-semibold text-themed mb-4">The Five Daily Prayers</h2>
              <div className="space-y-3">
                {filteredPrayers.map((prayer) => (
                  <button
                    key={prayer.id}
                    onClick={() => {
                      setActivePrayer(prayer.id);
                      setActiveSection("prayers");
                      setShowGuide(false);
                      syncUrl("prayers", prayer.id);
                    }}
                    className="w-full text-left rounded-lg p-4 border sidebar-border hover:border-gold/30 transition-colors"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-semibold text-themed text-sm">{prayer.name}</h3>
                          <span className="text-xs font-arabic text-gold/70">{prayer.nameAr}</span>
                        </div>
                        <p className="text-xs text-themed-muted mt-0.5">{prayer.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gold">{prayer.fardRakaat > 0 ? prayer.fardRakaat : "Nafl"}</p>
                        <p className="text-xs text-themed-muted">{prayer.fardRakaat > 0 ? "rak'at" : "voluntary"}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ContentCard>

            {/* Types of Prayer (folded in from the old "Types" pseudo-pill) */}
            {showTypes && (
              <div>
                <h2 className="text-xl font-semibold text-themed mb-1">Types of Prayer</h2>
                <p className="text-sm text-themed-muted mb-4">
                  Islamic prayers are categorized by their obligation level — from the five
                  compulsory daily prayers to voluntary acts of devotion.
                </p>
                <Accordion
                  items={filteredPrayerTypes.map((type) => ({
                    id: type.id,
                    title: type.name,
                    subtitle: type.ruling,
                    children: (
                      <div>
                        <p className="text-xs font-arabic text-gold/60 mb-2">{type.nameAr}</p>
                        <p className="text-sm text-themed-muted leading-relaxed mb-3">{type.detail}</p>
                        <div className="flex flex-col sm:flex-row gap-3 text-xs">
                          <div className="flex-1 rounded-md p-2.5 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
                            <span className="text-themed-muted uppercase tracking-wider text-[10px]">Examples</span>
                            <p className="text-themed mt-1">{type.examples}</p>
                          </div>
                          <div className="sm:w-48 rounded-md p-2.5 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
                            <span className="text-themed-muted uppercase tracking-wider text-[10px]">Ruling</span>
                            <p className="text-themed mt-1">{type.ruling}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gold/60 mt-2">
                          <HadithRefText text={type.ref} />
                        </p>
                      </div>
                    ),
                  }))}
                />
              </div>
            )}

            {/* Sources */}
            <SourcesCard delay={0.35} sources={[
              { ref: "Bukhari 63:112, Muslim 1:321", desc: "The prescription of prayer during al-Isra wal-Mi'raj" },
              { ref: "Muslim 4:41", desc: "Allah's response to Al-Fatihah" },
              { ref: "Muslim 6:124; Tirmidhi 2:283", desc: "The rawatib (confirmed sunnah) prayers" },
              { ref: "Sifat Salat an-Nabi, al-Albani", desc: "The Prophet's prayer described" },
              { ref: "Sharh Umdatul Ahkam, Ibn Uthaymeen", desc: "Rulings on prayer" },
            ]} />
          </motion.div>
        )}

        {/* ─── Why It Matters ─── */}
        {activeSection === "importance" && (
          <motion.div
            key="importance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {filteredMatters.map((item, i) => (
              <ContentCard key={i} delay={0.05 + i * 0.05}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold font-semibold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-themed mb-1">{item.point}</h3>
                    <p className="text-themed-muted text-sm leading-relaxed">{item.detail}</p>
                    <p className="text-xs text-gold/60 mt-2"><HadithRefText text={item.reference} /></p>
                  </div>
                </div>
              </ContentCard>
            ))}

            <ContentCard delay={0.35}>
              <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg)" }}>
                <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                  وَأْمُرْ أَهْلَكَ بِٱلصَّلَوٰةِ وَٱصْطَبِرْ عَلَيْهَا ۖ لَا نَسْـَٔلُكَ رِزْقًۭا ۖ نَّحْنُ نَرْزُقُكَ ۗ وَٱلْعَـٰقِبَةُ لِلتَّقْوَىٰ
                </p>
                <p className="text-themed text-sm italic">
                  &ldquo;And enjoin prayer upon your family and be steadfast therein. We ask you not for provision; We provide for you, and the [best] outcome is for [those of] righteousness.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 20:132</p>
              </div>
            </ContentCard>

            <ContentCard delay={0.4}>
              <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg)" }}>
                <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                  قَدْ أَفْلَحَ ٱلْمُؤْمِنُونَ ٱلَّذِينَ هُمْ فِى صَلَاتِهِمْ خَـٰشِعُونَ
                </p>
                <p className="text-themed text-sm italic">
                  &ldquo;The believers have attained true success: those who humble themselves in their prayers.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 23:1-2</p>
              </div>
            </ContentCard>

            <Link
              href="/kids"
              className="w-full text-left rounded-xl p-4 card-bg border sidebar-border hover:border-gold/40 transition-colors flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-medium text-themed">Teaching your children to pray</p>
                <p className="text-xs text-themed-muted mt-0.5">Kid-friendly prayer guides and activities — the Kids page</p>
              </div>
              <ChevronRight size={16} className="text-gold shrink-0" />
            </Link>

            {/* Sources */}
            <SourcesCard delay={0.4} sources={[
              { ref: "Nasai 5:18", desc: "Prayer is the first deed judged" },
              { ref: "Muslim 4:41", desc: "Allah responds to Al-Fatihah" },
              { ref: "Tirmidhi 40:16; Muslim 1:12", desc: "The covenant between us and them is prayer" },
              { ref: "Bukhari 9:7, Muslim 5:356", desc: "The likeness of the five prayers" },
              { ref: "Tafsir Ibn Kathir", desc: "Commentary on Quran 29:45; Quran 20:132" },
              { ref: "Quran 23:1-2; Quran 2:45; Quran 107:4-5", desc: "Khushu': success for the humble in prayer; woe to the heedless" },
              { ref: "Bukhari 59:100", desc: "Looking around in prayer is what Satan steals from it" },
              { ref: "Abu Dawud 2:105; Tirmidhi 2:260", desc: "Teaching children to pray from the age of seven" },
            ]} />
          </motion.div>
        )}

        {/* ─── Purification (Taharah): wudu + ghusl ─── */}
        {activeSection === "wudu" && (
          <motion.div
            key="wudu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <SubTabLayout
              subs={purificationSubs}
              activeSub={activeWudu}
              setActiveSub={(k) => {
                setActiveWudu(k);
                syncUrl("wudu", k);
              }}
            >
              <div className="space-y-4">
                {activePurificationTopic.id === "steps" ? (
                  <WuduStepsCard topic={activePurificationTopic} />
                ) : (
                  <TopicInfoCard topic={activePurificationTopic} />
                )}

                {/* Ghusl cross-links */}
                {activePurificationTopic.id === "ghusl" && (
                  <>
                    <button
                      onClick={openJumuah}
                      className="w-full text-left rounded-xl p-4 card-bg border sidebar-border hover:border-gold/40 transition-colors flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-themed">The Friday sunnahs — Jumu&apos;ah</p>
                        <p className="text-xs text-themed-muted mt-0.5">Ghusl is the first of the Friday preparations — see The Prayers → Jumu&apos;ah</p>
                      </div>
                      <ChevronRight size={16} className="text-gold shrink-0" />
                    </button>
                    <Link
                      href="/marriage?tab=married-life"
                      className="w-full text-left rounded-xl p-4 card-bg border sidebar-border hover:border-gold/40 transition-colors flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-themed">Intimacy and purity for spouses</p>
                        <p className="text-xs text-themed-muted mt-0.5">Related rulings in Marriage → Married Life</p>
                      </div>
                      <ChevronRight size={16} className="text-gold shrink-0" />
                    </Link>
                  </>
                )}

                {/* Nullifiers → ghusl cross-link ("what requires ghusl vs wudu") */}
                {activePurificationTopic.id === "nullifiers" && (
                  <button
                    onClick={() => {
                      setActiveWudu("ghusl");
                      syncUrl("wudu", "ghusl");
                    }}
                    className="w-full text-left rounded-xl p-4 card-bg border sidebar-border hover:border-gold/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-themed">What requires ghusl instead of wudu?</p>
                      <p className="text-xs text-themed-muted mt-0.5">Janabah, the end of menstruation, and more — see the Ghusl guide</p>
                    </div>
                    <ChevronRight size={16} className="text-gold shrink-0" />
                  </button>
                )}
              </div>
            </SubTabLayout>

            {/* Sources — the Tayammum pill carries its own source set */}
            {activePurificationTopic.id === "tayammum" ? (
              <SourcesCard delay={0.3} className="mt-8" sources={[
                { ref: "Quran 5:6", desc: "The tayammum clause — clean earth when ill, traveling, or without water" },
                { ref: "Bukhari 7:1", desc: "The revelation of tayammum — Aisha's lost necklace on a journey" },
                { ref: "Bukhari 7:5; Bukhari 7:10", desc: "The hadith of Ammar ibn Yasir — strike the earth, blow off the dust, wipe the face and hands" },
                { ref: "Abu Dawud 1:334", desc: "Amr ibn al-As — tayammum instead of ghusl when water would cause harm" },
                { ref: "Tirmidhi 1:124", desc: "Clean earth is a purifier even for ten years; use water once it is found" },
                { ref: "Abu Dawud 1:338", desc: "Prayers prayed with valid tayammum need not be repeated when water is found" },
              ]} />
            ) : (
            <SourcesCard delay={0.3} className="mt-8" sources={[
              { ref: "Quran 5:6", desc: "The verse of purification — wudu, ghusl for janabah, and tayammum" },
              { ref: "Bukhari 1:1; Bukhari 4:1; Bukhari 4:25; Bukhari 11:12", desc: "Niyyah, nullifiers, the Prophet's ﷺ wudu, right-side preference, miswak" },
              { ref: "Bukhari 5:1; Bukhari 5:26; Bukhari 5:43; Bukhari 6:35; Bukhari 11:5; Bukhari 23:22", desc: "The Prophet's ﷺ ghusl (Aisha and Maymunah), when ghusl is obligatory, ghusl for Jumu'ah, washing the deceased" },
              { ref: "Muslim 2:1; Muslim 2:20; Muslim 2:44; Muslim 2:46; Muslim 3:17; Muslim 3:32; Muslim 3:123", desc: "Cleanliness, dua after wudu, sins washed away, madhy requires only wudu, emission requires ghusl, camel meat" },
              { ref: "Abu Dawud 1:60; Abu Dawud 1:101; Abu Dawud 1:200", desc: "Passing wind, Bismillah, ears, washing three times, interlacing fingers, deep sleep" },
              { ref: "Tirmidhi 1:31; Tirmidhi 1:82", desc: "Beard, ears are part of head, interlacing toes, dua after wudu, touching private parts" },
              { ref: "Ibn Majah 1:133; Ibn Majah 1:159", desc: "Bismillah obligation discussion, moderation with water" },
            ]} />
            )}
          </motion.div>
        )}

        {/* ─── Adhan & Iqamah ─── */}
        {activeSection === "adhan" && (
          <motion.div
            key="adhan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <AdhanSection />
          </motion.div>
        )}

        {/* ─── The Prayers (five daily + Jumu'ah) ─── */}
        {activeSection === "prayers" && (
          <motion.div
            key="prayers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {!showGuide && (
              <SubTabLayout
                subs={prayerSubs}
                activeSub={activePrayer}
                setActiveSub={(k) => {
                  setActivePrayer(k);
                  setShowGuide(false);
                  syncUrl("prayers", k);
                }}
              >
                {activePrayer === "jumuah" ? (
                  <JumuahSection onOpenGhusl={openGhusl} />
                ) : prayerSituationTopics.some((t) => t.id === activePrayer) ? (
                  <TopicInfoCard topic={prayerSituationTopics.find((t) => t.id === activePrayer)!} />
                ) : (
                  <PrayerInfoCard
                    prayer={prayers.find((p) => p.id === activePrayer) || prayers[0]}
                    onHowToPray={() => setShowGuide(true)}
                  />
                )}
              </SubTabLayout>
            )}

            {showGuide && (
              <AnimatePresence mode="wait">
                <PrayerGuide
                  key={`guide-${activePrayer}`}
                  prayer={currentPrayer}
                  onBack={() => setShowGuide(false)}
                />
              </AnimatePresence>
            )}

            {/* Sources & References for the Prayers */}
            {!showGuide && (
              <SourcesCard delay={0.3} className="mt-8" sources={[
                { ref: "Bukhari 9:50", desc: "Fajr & Asr: whoever prays the two cool prayers will enter Paradise" },
                { ref: "Muslim 6:118", desc: "Fajr sunnah: better than the world and everything in it" },
                { ref: "Tirmidhi 2:281", desc: "Dhuhr: reward for praying four rak'at before and after" },
                { ref: "Bukhari 9:29", desc: "Asr: missing it is like losing family and property" },
                { ref: "Muslim 5:223", desc: "Maghrib: timing of the sunset prayer" },
                { ref: "Muslim 6:124", desc: "Rawatib sunnah: the 12 confirmed sunnah prayers" },
                { ref: "Bukhari 10:51", desc: "Isha & Fajr: reward for attending them in congregation" },
                { ref: "Bukhari 14:9", desc: "Witr: make the last of your night prayer Witr" },
                { ref: "Quran 62:9", desc: "Jumu'ah: hasten to the remembrance of Allah and leave off trading" },
                { ref: "Abu Dawud 2:678", desc: "Jumu'ah: a duty upon every Muslim in congregation, with four exceptions" },
                { ref: "Bukhari 11:28; Muslim 7:39", desc: "Jumu'ah time: prayed immediately after midday, when the sun passes the meridian" },
                { ref: "Bukhari 11:29; Bukhari 11:63; Muslim 7:41", desc: "Jumu'ah time: praying early; the nap and meal only after Jumu'ah" },
                { ref: "Muslim 7:14; Muslim 7:15", desc: "Jumu'ah: reward of going early; silence during the khutbah" },
                { ref: "Bukhari 11:5; Bukhari 11:59", desc: "Jumu'ah: the Friday ghusl; the hour of accepted du'a" },
                { ref: "Abu Dawud 2:658", desc: "Jumu'ah: invoke abundant blessings on the Prophet ﷺ on Friday" },
                { ref: "Ibn Majah 5:261; Ibn Majah 5:321", desc: "Jumu'ah: two rak'ah complete not shortened; catching a rak'ah" },
                { ref: "Nasai 14:6", desc: "Jumu'ah: warning about neglecting the Friday prayer" },
                { ref: "Quran 17:78", desc: "Establish prayer from the decline of the sun until the darkness of night" },
                { ref: "Quran 2:238", desc: "Guard the prayers, especially the middle prayer (Asr)" },
                { ref: "Sifat Salat an-Nabi by Shaykh al-Albani", desc: "Description of the Prophet's prayer" },
              ]} />
            )}
          </motion.div>
        )}

        {/* ─── Voluntary & Special Prayers ─── */}
        {activeSection === "voluntary" && (
          <motion.div
            key="voluntary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {!showGuide && (
              <SubTabLayout
                subs={voluntarySubs}
                activeSub={activeVoluntary}
                setActiveSub={(k) => {
                  setActiveVoluntary(k);
                  setShowGuide(false);
                  syncUrl("voluntary", k);
                }}
              >
                {(() => {
                  const prayer = voluntaryPrayers.find((p) => p.id === activeVoluntary);
                  return prayer ? (
                    <PrayerInfoCard
                      prayer={prayer}
                      onHowToPray={() => setShowGuide(true)}
                    />
                  ) : null;
                })()}
                {activeVoluntary === "janazah" && (
                  <Link
                    href="/death-rites"
                    className="w-full mt-4 text-left rounded-xl p-4 card-bg border sidebar-border hover:border-gold/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-themed">When a Muslim passes away</p>
                      <p className="text-xs text-themed-muted mt-0.5">Ghusl, shrouding, the janazah, and burial — the full guide on the Death &amp; the Hereafter page</p>
                    </div>
                    <ChevronRight size={16} className="text-gold shrink-0" />
                  </Link>
                )}
              </SubTabLayout>
            )}

            {!showGuide && (
              <ContentCard delay={0.25} className="mt-6">
                <h3 className="text-lg font-semibold text-themed mb-2">Times when voluntary prayer is not offered</h3>
                <p className="text-themed-muted text-sm leading-relaxed mb-3">
                  Voluntary prayers like Duha and Tahiyyat al-Masjid have three daily windows to avoid. Uqbah bin Amir said: &ldquo;There were three times at which Allah&apos;s Messenger (peace be upon him) forbade us to pray, or bury our dead: When the sun begins to rise till it is fully up, when the sun is at its height at midday till it passes over the meridian, and when the sun draws near to setting till it sets.&rdquo; (Muslim 6:357)
                </p>
                <ul className="space-y-2 text-sm text-themed-muted">
                  {[
                    "From sunrise beginning until the sun is fully up — Duha starts after this window",
                    "When the sun is at its zenith, until it passes the meridian — just before Dhuhr",
                    "When the sun draws near to setting, until it has set — just before Maghrib",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-gold mt-0.5">&#9670;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-themed-muted text-sm leading-relaxed mt-3">
                  In addition, after praying Fajr no voluntary prayer is offered until the sun has risen, and after praying Asr none until sunset: &ldquo;There is no prayer after the morning prayer till the sun rises, and there is no prayer after the Asr prayer till the sun sets.&rdquo; (Bukhari 9:61) Scholars state that prayers with a specific cause — making up a missed obligatory prayer, or the funeral prayer — are treated differently, with the schools differing on the details.
                </p>
              </ContentCard>
            )}

            {showGuide && (
              <AnimatePresence mode="wait">
                <PrayerGuide
                  key={`guide-${activeVoluntary}`}
                  prayer={currentPrayer}
                  onBack={() => setShowGuide(false)}
                />
              </AnimatePresence>
            )}

            {/* Sources & References for Voluntary Prayers */}
            {!showGuide && (
              <SourcesCard delay={0.3} className="mt-8" sources={[
                { ref: "Bukhari 19:26; Bukhari 19:28", desc: "Tahajjud: Allah descends to the lowest heaven; the Prophet's night prayer practice" },
                { ref: "Muslim 13:261", desc: "Tahajjud: night prayer is the best prayer after the obligatory ones" },
                { ref: "Muslim 6:101", desc: "Duha: two rak'at of Duha suffice as charity for every joint" },
                { ref: "Tirmidhi 6:43", desc: "Duha/Ishraq: reward like Hajj and Umrah for praying after sunrise (graded da'if by some; widely practiced)" },
                { ref: "Abu Dawud 8:106; Tirmidhi 2:259", desc: "Tawbah: forgiveness for praying 2 rak'at after sinning" },
                { ref: "Bukhari 19:45", desc: "Istikhara: the du'a and method taught by the Prophet (peace be upon him)" },
                { ref: "Bukhari 31:6", desc: "Tarawih: Aisha's narration of the Prophet's night prayer in Ramadan" },
                { ref: "Bukhari 2:30; Muslim 6:207", desc: "Tarawih: forgiveness for standing in prayer during Ramadan" },
                { ref: "Bukhari 13:8", desc: "Eid: the Prophet's practice of praying in the musalla" },
                { ref: "Bukhari 23:81; Muslim 11:67", desc: "Janazah: reward for attending the funeral prayer" },
                { ref: "Nasai 20:148; Abu Dawud 8:10; Tirmidhi 3:12", desc: "Witr: the Qunut supplication taught to al-Hasan ibn Ali" },
                { ref: "Bukhari 14:9; Abu Dawud 5:101", desc: "Witr: the last prayer of the night; Aisha's description of thirteen rak'at" },
                { ref: "Abu Dawud 2:77; Bukhari 56:292", desc: "Tahiyyat al-Masjid: two rak'at before sitting down" },
                { ref: "Bukhari 16:1; Bukhari 16:4; Bukhari 16:11; Bukhari 16:24", desc: "Eclipse prayer: not for anyone's death; two bowings per rak'ah, recited aloud" },
                { ref: "Bukhari 15:7; Bukhari 15:14; Bukhari 15:17; Bukhari 15:19; Bukhari 15:20", desc: "Istisqa: cloak inside out, two rak'at aloud, no adhan; rain asked during the khutbah" },
                { ref: "Muslim 6:357; Bukhari 9:61", desc: "The three forbidden times; no voluntary prayer after Fajr and Asr" },
                { ref: "Bukhari 13:5; Tirmidhi 5:13; Ibn Majah 5:496; Ibn Majah 5:498", desc: "Eid-day sunnahs: dates before Fitr prayer, eating after Adha prayer, walking, returning by a different route" },
                { ref: "Ibn Majah 6:66; Tirmidhi 10:60; Nasai 21:169", desc: "Janazah: the du'a for the deceased after the third takbir" },
                { ref: "Fiqh us-Sunnah by Sayyid Sabiq", desc: "General reference for voluntary prayer rulings" },
                { ref: "Sifat Salat an-Nabi by Shaykh al-Albani", desc: "Description of the Prophet's prayer" },
              ]} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SalahPage() {
  return <Suspense><SalahContent /></Suspense>;
}
