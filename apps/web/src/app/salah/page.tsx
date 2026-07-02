"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import { motion, AnimatePresence } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { Motion } from "@capacitor/motion";
import { useIsNative } from "@/lib/mobile/platform";
import { computePrayerTimes } from "@/lib/prayer-times";
import { getPrayerSettings, setPrayerSettings, type PrayerCalcMethod } from "@hidden-hiqmah/ui/lib/storage";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import PrayerFigure, { type Position } from "@hidden-hiqmah/ui/components/PrayerFigure";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import {
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  User,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Search,
  MapPin,
  LocateFixed,
  Volume2,
  Play,
  StopCircle,
  Compass,
  Navigation,
  Settings2,
} from "lucide-react";
import { useAdhanAudio } from "@hidden-hiqmah/ui/context/AdhanAudioContext";
import { formatLocation, reverseGeocode } from "@hidden-hiqmah/ui/lib/location";
import {
  getFreshCachedLocation,
  setCachedLocation,
  getLocationState,
  setLocationState,
} from "@hidden-hiqmah/ui/lib/location-cache";

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
      "On Friday, Dhuhr is replaced by the Jumu'ah (Friday) prayer for men, which is 2 rak'at preceded by a khutbah (sermon). The Prophet (peace be upon him) said: 'Whoever leaves three Jumu'ah prayers out of negligence, Allah will seal his heart' (Nasai 14:6). Recitation in Dhuhr is silent.",
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
    id: "eid",
    name: "Eid",
    nameAr: "العيد",
    time: "After sunrise on Eid al-Fitr (1st Shawwal) and Eid al-Adha (10th Dhul Hijjah)",
    fardRakaat: 0,
    sunnahBefore: 0,
    sunnahAfter: 0,
    additionalNote:
      "Eid prayer is 2 rak'at with additional takbirat: 7 extra in the first rak'ah and 5 in the second (Shafi'i/Hanbali/Maliki view), or 3 extra in each rak'ah (Hanafi view). There is no adhan or iqamah. It is followed by a khutbah (sermon). Most scholars consider it wajib (obligatory) or a strongly emphasized sunnah. It is prayed in an open area (musalla) when possible, as was the Prophet's practice.",
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
      "Janazah prayer has a unique structure: 4 takbirat with no ruku' or sujud. After the 1st takbir: recite Al-Fatihah. After the 2nd: recite the Salawat al-Ibrahimiyyah. After the 3rd: make du'a for the deceased. After the 4th: make a brief du'a, then give one taslim to the right. It is a fard kifayah — a communal obligation (if some perform it, the obligation is lifted from the rest). The Prophet (peace be upon him) said: 'Whoever attends the funeral until the prayer is offered will have one qirat of reward' (Bukhari 23:81).",
    description:
      "The funeral prayer — a unique prayer performed for a deceased Muslim. It is a communal obligation (fard kifayah) and differs from all other prayers in that it has no bowing or prostration, only four standing takbirat with specific recitations between them.",
    hadith: {
      text: "Whoever attends the funeral until the prayer is offered will have one qirat of reward, and whoever stays until the burial will have two qirat. It was asked: 'What are the two qirat?' He said: 'Like two great mountains.'",
      ref: "Bukhari 23:81; Muslim 11:67",
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
];

/* ───────────────────────── prayer times data ───────────────────────── */

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface HijriDate {
  day: string;
  month: { en: string; ar: string };
  year: string;
  designation: { abbreviated: string };
}

// Local Hijri date (Umm al-Qura) for the on-device path — no network.
function localHijriDate(date: Date): HijriDate {
  const get = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  try {
    const en = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(date);
    const ar = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      month: "long",
    }).formatToParts(date);
    return {
      day: get(en, "day"),
      month: { en: get(en, "month"), ar: get(ar, "month") },
      year: get(en, "year"),
      designation: { abbreviated: "AH" },
    };
  } catch {
    return { day: "", month: { en: "", ar: "" }, year: "", designation: { abbreviated: "AH" } };
  }
}

interface AladhanResponse {
  data: {
    timings: PrayerTimings;
    date: {
      hijri: HijriDate;
    };
    meta?: {
      timezone?: string;
    };
  };
}

const PRAYER_TIME_LIST = [
  { key: "Fajr", english: "Fajr", arabic: "الفجر", icon: Sunrise, isPrayer: true },
  { key: "Sunrise", english: "Sunrise", arabic: "الشروق", icon: Sun, isPrayer: false },
  { key: "Dhuhr", english: "Dhuhr", arabic: "الظهر", icon: CloudSun, isPrayer: true },
  { key: "Asr", english: "Asr", arabic: "العصر", icon: CloudSun, isPrayer: true },
  { key: "Maghrib", english: "Maghrib", arabic: "المغرب", icon: Sunset, isPrayer: true },
  { key: "Isha", english: "Isha", arabic: "العشاء", icon: Moon, isPrayer: true },
] as const;

// Values MUST match the shared PrayerCalcMethod codes (packages/ui storage) and
// the Settings screen's CALC_METHODS, so the Salah tab, Home card, and scheduled
// adhan all resolve to the SAME method. (Gulf/Dubai is code 8 — code 16 has no
// mapping in prayer-times.ts and would silently fall back to Muslim World League.)
const CALCULATION_METHODS = [
  { value: 2, label: "ISNA" },
  { value: 3, label: "Muslim World League" },
  { value: 4, label: "Umm Al-Qura, Makkah" },
  { value: 5, label: "Egyptian General Authority" },
  { value: 1, label: "Karachi" },
  { value: 7, label: "Tehran" },
  { value: 8, label: "Gulf Region" },
  { value: 9, label: "Kuwait" },
  { value: 10, label: "Qatar" },
  { value: 11, label: "Singapore" },
  { value: 13, label: "Diyanet (Turkey)" },
  { value: 15, label: "Moonsighting Committee" },
];

function parseTime(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Get the current time (hours/minutes/seconds + total seconds since midnight) in a specific timezone.
// If timezone is undefined, uses the browser's local timezone.
function getNowParts(timezone?: string): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  const date = new Date();
  if (!timezone) {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    return { hours: h, minutes: m, seconds: s, totalSeconds: h * 3600 + m * 60 + s };
  }
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const parts = fmt.formatToParts(date);
    let h = 0;
    let m = 0;
    let s = 0;
    for (const p of parts) {
      if (p.type === "hour") h = parseInt(p.value, 10) % 24;
      else if (p.type === "minute") m = parseInt(p.value, 10);
      else if (p.type === "second") s = parseInt(p.value, 10);
    }
    return { hours: h, minutes: m, seconds: s, totalSeconds: h * 3600 + m * 60 + s };
  } catch {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    return { hours: h, minutes: m, seconds: s, totalSeconds: h * 3600 + m * 60 + s };
  }
}

function getNextPrayerInfo(timings: PrayerTimings, timezone?: string): { key: string; timeUntil: number } | null {
  const nowSec = getNowParts(timezone).totalSeconds;
  const prayerKeys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
  for (const key of prayerKeys) {
    const raw = timings[key];
    if (!raw) continue;
    const clean = raw.replace(/\s*\(.*\)/, "");
    const [h, m] = clean.split(":").map(Number);
    const prayerSec = h * 3600 + m * 60;
    if (prayerSec > nowSec) {
      return { key, timeUntil: (prayerSec - nowSec) * 1000 };
    }
  }
  // Wrap to next day's Fajr
  const fajrRaw = timings.Fajr;
  if (!fajrRaw) return null;
  const clean = fajrRaw.replace(/\s*\(.*\)/, "");
  const [h, m] = clean.split(":").map(Number);
  const fajrSec = h * 3600 + m * 60;
  return { key: "Fajr", timeUntil: ((24 * 3600 - nowSec) + fajrSec) * 1000 };
}

function formatDisplayTime(raw: string) {
  const clean = raw.replace(/\s*\(.*\)/, "");
  const [h, m] = clean.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Minutes since midnight for a "HH:MM" or "HH:MM (TZ)" string
function timeStringToMinutes(raw: string): number {
  const clean = raw.replace(/\s*\(.*\)/, "");
  const [h, m] = clean.split(":").map(Number);
  return h * 60 + m;
}

interface WindowProgress {
  prevKey: string;
  prevTime: string;
  nextKey: string;
  nextTime: string;
  progress: number; // 0..1, current position within the [prev, next] window
}

// Determine the current "window" — the prayer just past and the prayer coming up —
// and what fraction of that window has elapsed. Timezone-aware.
function getWindowProgress(timings: PrayerTimings, nextKey: string, timezone?: string): WindowProgress | null {
  const order: (keyof PrayerTimings)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const idx = order.indexOf(nextKey as keyof PrayerTimings);
  if (idx === -1) return null;

  const nowParts = getNowParts(timezone);
  const nowMin = nowParts.hours * 60 + nowParts.minutes + nowParts.seconds / 60;

  let prevKey: string;
  let prevMin: number;

  if (idx === 0) {
    // Before Fajr — previous "window start" is yesterday's Isha (approximated as Isha - 24h)
    const ishaRaw = timings.Isha;
    if (!ishaRaw) return null;
    prevKey = "Isha";
    prevMin = timeStringToMinutes(ishaRaw) - 24 * 60;
  } else {
    const prevKeyTyped = order[idx - 1];
    const prevRaw = timings[prevKeyTyped];
    if (!prevRaw) return null;
    prevKey = prevKeyTyped;
    prevMin = timeStringToMinutes(prevRaw);
  }

  const nextRaw = timings[nextKey as keyof PrayerTimings];
  if (!nextRaw) return null;
  let nextMin = timeStringToMinutes(nextRaw);

  // If next prayer time has already passed today (only happens for Fajr-next-day),
  // shift it forward by 24h
  if (nextMin < nowMin && idx === 0) nextMin += 24 * 60;

  const total = nextMin - prevMin;
  const elapsed = nowMin - prevMin;
  const progress = total > 0 ? Math.max(0, Math.min(1, elapsed / total)) : 0;

  return {
    prevKey,
    prevTime: formatDisplayTime(timings[prevKey as keyof PrayerTimings] || ""),
    nextKey,
    nextTime: formatDisplayTime(nextRaw),
    progress,
  };
}

/* ───────────────────────── wudu data ───────────────────────── */

type WuduTopic = {
  id: string;
  name: string;
  content: {
    intro: string;
    verse?: { arabic: string; text: string; ref: string };
    points: { title: string; detail: string; note?: string }[];
    source?: string;
  };
};

const wuduTopics: WuduTopic[] = [
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
            "The obligatory (fard) acts are established directly in Quran 5:6: washing the face, washing the arms to the elbows, wiping the head, and washing the feet to the ankles. These four acts plus the intention (niyyah) are the pillars without which wudu is invalid.",
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
      source: "Quran 5:6; Bukhari 4:1; Muslim 2:1, 2:46",
    },
  },
  {
    id: "steps",
    name: "Steps of Wudu",
    content: {
      intro:
        "The Prophet ﷺ taught wudu in a specific order as narrated by Uthman ibn Affan (may Allah be pleased with him), who demonstrated the Prophet's wudu step by step (Bukhari 4:25). Steps marked 'Fard' are obligatory from Quran 5:6; the rest are sunnah (recommended) from the Prophet's ﷺ practice.",
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
            "Take water into the mouth with the right hand and rinse it thoroughly three times. Swirl the water around to clean the entire mouth.",
          note: "Bukhari 4:25",
        },
        {
          title: "5. Rinse the Nose — Sunnah",
          detail:
            "Inhale water into the nostrils with the right hand and blow it out with the left hand, three times. Sniff the water gently — do not inhale too deeply.",
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
      source: "Quran 5:6; Bukhari 1:1, 4:31; Muslim 1:148; Abu Dawud 1:101, 1:134",
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
      source: "Bukhari 4:25; Muslim 2:20; Abu Dawud 1:101; Tirmidhi 1:55",
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
      source: "Bukhari 4:25, 4:34, 4:67, 11:12; Muslim 2:59, 2:83; Abu Dawud 1:101, 1:135, 1:142; Tirmidhi 1:31, 1:38; Ibn Majah 1:133, 1:159",
    },
  },
  {
    id: "nullifiers",
    name: "Nullifiers",
    content: {
      intro:
        "Certain actions or occurrences break the state of wudu, requiring a person to perform it again before praying. The scholars derived these nullifiers from the Quran and Sunnah.",
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
      source: "Bukhari 4:1, 4:3; Muslim 3:123; Abu Dawud 1:60, 1:200; Tirmidhi 1:82",
    },
  },
];

/* ───────────────────────── sections ───────────────────────── */

const sections = [
  { key: "times", label: "Prayer Times" },
  { key: "qiblah", label: "Qiblah" },
  { key: "intro", label: "Salah" },
  { key: "importance", label: "Why It Matters" },
  { key: "wudu", label: "Wudu" },
  { key: "adhan", label: "Adhan & Iqamah" },
  { key: "prayers", label: "The Five Prayers" },
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
            {prayer.fardRakaat === 0 && (prayer.id === "tawbah" || prayer.id === "istikhara") && (
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
            {prayer.fardRakaat === 0 && !["tawbah", "istikhara", "janazah", "eid"].includes(prayer.id) && (
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
        {!["janazah", "eid"].includes(prayer.id) && (
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

/* ───────────────────────── Qiblah section ───────────────────────── */

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calcQiblahBearing(lat: number, lng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);
  const lat2 = toRad(KAABA_LAT);
  const lng2 = toRad(KAABA_LNG);
  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  return bearing;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function compassDirection(degrees: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(degrees / 22.5) % 16];
}

type QiblahState = {
  lat: number;
  lng: number;
  city: string;
};

interface DeviceOrientationEventWithPermission {
  requestPermission?: () => Promise<"granted" | "denied">;
}

export function QiblahSection({ compact = false }: { compact?: boolean } = {}) {
  const [loc, setLoc] = useState<QiblahState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  // Continuous rotation value that never wraps (e.g. can be 720°), so CSS rotation
  // always takes the shortest path and doesn't spin backwards when 359° → 1°.
  const [displayHeading, setDisplayHeading] = useState<number | null>(null);
  const continuousHeadingRef = useRef<number | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);

  const applyHeading = useCallback((newHeading: number) => {
    setHeading(newHeading);
    if (continuousHeadingRef.current === null) {
      continuousHeadingRef.current = newHeading;
      setDisplayHeading(newHeading);
      return;
    }
    const current = continuousHeadingRef.current;
    const wrappedCurrent = ((current % 360) + 360) % 360;
    let delta = newHeading - wrappedCurrent;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const next = current + delta;
    continuousHeadingRef.current = next;
    setDisplayHeading(next);
  }, []);

  const fetchLocation = useCallback(() => {
    // Prefer a recently-cached location set by NextPrayerCard or a prior visit.
    const fresh = getFreshCachedLocation();
    if (fresh) {
      setLoc({ lat: fresh.lat, lng: fresh.lng, city: fresh.display });
      setLoading(false);
      setError(null);
      return;
    }

    // Honor a previous "denied" — don't auto-trigger another prompt.
    if (getLocationState() === "denied") {
      setError("Location access is off. Enable it in Settings to use the compass.");
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation.");
      setLoading(false);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let city = "Your location";
        const geo = await reverseGeocode(latitude, longitude);
        if (geo) city = formatLocation(geo) || "Unknown";
        setLoc({ lat: latitude, lng: longitude, city });
        setLoading(false);
        setError(null);
        setLocationState("granted");
        setCachedLocation({
          lat: latitude,
          lng: longitude,
          city: geo?.city || "Your location",
          country: geo?.countryName || "",
          display: city,
        });
      },
      () => {
        setError("Couldn't get your location. Allow location access and try again.");
        setLoading(false);
        setLocationState("denied");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Device orientation (compass) — sets up listener and handles iOS permission
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    const DeviceOrientationEventCls = (window as unknown as { DeviceOrientationEvent?: DeviceOrientationEventWithPermission })
      .DeviceOrientationEvent;

    const handler = (e: DeviceOrientationEvent) => {
      const webkitHeading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof webkitHeading === "number") {
        applyHeading(webkitHeading);
      } else if (typeof e.alpha === "number") {
        applyHeading((360 - e.alpha) % 360);
      }
    };

    const attach = () => {
      window.addEventListener("deviceorientationabsolute", handler as EventListener);
      window.addEventListener("deviceorientation", handler);
    };

    // ── Native app: auto-start the compass, no permission button ──
    if (isNative) {
      let motionRemove: (() => void) | undefined;
      (async () => {
        // In the WKWebView the Safari-style requestPermission gesture isn't
        // required; attach the orientation listener directly (delivers
        // webkitCompassHeading on iOS). Also start @capacitor/motion as a
        // native fallback source.
        try {
          if (typeof DeviceOrientationEventCls?.requestPermission === "function") {
            await DeviceOrientationEventCls.requestPermission().catch(() => {});
          }
        } catch {
          /* ignore */
        }
        attach();
        try {
          const l = await Motion.addListener("orientation", (e) => {
            const wk = (e as { webkitCompassHeading?: number }).webkitCompassHeading;
            if (typeof wk === "number") applyHeading(wk);
            else if (typeof e.alpha === "number") applyHeading((360 - e.alpha) % 360);
          });
          motionRemove = () => l.remove();
        } catch {
          /* motion unavailable */
        }
      })();
      return () => {
        window.removeEventListener("deviceorientationabsolute", handler as EventListener);
        window.removeEventListener("deviceorientation", handler);
        motionRemove?.();
      };
    }

    // ── Web ──
    if (!DeviceOrientationEventCls) return;
    if (typeof DeviceOrientationEventCls.requestPermission === "function") {
      // iOS Safari requires a user gesture → show the enable button.
      setNeedsPermission(true);
      return;
    }
    attach();
    return () => {
      window.removeEventListener("deviceorientationabsolute", handler as EventListener);
      window.removeEventListener("deviceorientation", handler);
    };
  }, [applyHeading]);

  const requestCompassPermission = async () => {
    const DeviceOrientationEventCls = (window as unknown as { DeviceOrientationEvent?: DeviceOrientationEventWithPermission })
      .DeviceOrientationEvent;
    if (!DeviceOrientationEventCls?.requestPermission) return;
    const res = await DeviceOrientationEventCls.requestPermission();
    if (res === "granted") {
      setNeedsPermission(false);
      const handler = (e: DeviceOrientationEvent) => {
        const webkitHeading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
        if (typeof webkitHeading === "number") {
          applyHeading(webkitHeading);
        } else if (typeof e.alpha === "number") {
          applyHeading((360 - e.alpha) % 360);
        }
      };
      window.addEventListener("deviceorientation", handler);
    }
  };

  const qiblahBearing = loc ? calcQiblahBearing(loc.lat, loc.lng) : null;
  const distanceKm = loc ? haversineKm(loc.lat, loc.lng, KAABA_LAT, KAABA_LNG) : null;
  // If we have a live device heading, the arrow rotates relative to it

  return (
    <div className="space-y-6">
      {/* Intro */}
      {!compact && <ContentCard delay={0.05}>
        <h3 className="text-gold font-semibold text-lg mb-3">What is the Qiblah?</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          The <span className="text-gold">qiblah</span> is the direction Muslims face during salah — toward the <span className="text-gold">Ka&apos;bah</span> in Makkah. It unites the entire ummah: at any moment of day or night, somewhere on earth a Muslim is praying, and they are all facing the same point.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          For the first 16-17 months in Madinah, the Prophet ﷺ and the believers faced <span className="text-gold">Jerusalem</span> during prayer. Then Allah revealed:
        </p>
        <div className="my-3">
          <p className="font-arabic text-gold text-lg leading-loose mb-1">
            فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ۚ وَحَيْثُ مَا كُنتُمْ فَوَلُّوا وُجُوهَكُمْ شَطْرَهُ
          </p>
          <p className="text-themed text-sm leading-relaxed mb-1">Fawalli wajhaka shatra al-masjidi al-haram, wa haythu ma kuntum fawallu wujuhakum shatrah</p>
          <p className="text-themed-muted text-sm leading-relaxed italic">&ldquo;Turn your face toward al-Masjid al-Haram. And wherever you are, turn your faces toward it.&rdquo;</p>
          <p className="text-xs text-gold/80 mt-1">Quran 2:144</p>
        </div>
        <p className="text-themed-muted text-sm leading-relaxed">
          From that moment, every Muslim has faced Makkah in prayer.
        </p>
      </ContentCard>}

      {/* Compass */}
      <ContentCard delay={0.08}>
        <h3 className="text-gold font-semibold text-lg mb-3 flex items-center gap-2">
          <Compass size={18} /> Qiblah Direction From Your Location
        </h3>

        {loading && <p className="text-themed-muted text-sm">Detecting your location…</p>}

        {error && (
          <div>
            <p className="text-themed-muted text-sm mb-3">{error}</p>
            <button
              onClick={fetchLocation}
              className="px-4 py-2 rounded-lg card-bg border sidebar-border text-themed hover:border-gold/40 hover:text-gold transition-colors text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {loc && qiblahBearing !== null && (
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Compass visual — dial is fixed (N stays at top, Ka'bah stays at qibla bearing);
                only the "you are facing" arrow rotates with device heading. */}
            <div className="relative w-56 h-56 shrink-0">
              {/* Rotating dial — the arrow stays fixed pointing up; N/E/S/W cardinals and the
                  Ka'bah marker rotate to match the real-world bearing relative to where you're
                  facing. When the Ka'bah marker arrives at the top, you're facing the qiblah. */}
              <div className="absolute inset-0 rounded-full border-2 border-gold/30 bg-gold/[0.03]">
                {/* Cardinal markers — positioned at (cardinal - displayHeading) */}
                {[
                  { label: "N", deg: 0, color: "text-gold" },
                  { label: "E", deg: 90 },
                  { label: "S", deg: 180 },
                  { label: "W", deg: 270 },
                ].map(({ label, deg, color }) => {
                  const screenAngle = deg - (displayHeading ?? 0);
                  return (
                    <div
                      key={label}
                      className="absolute inset-0 flex items-start justify-center"
                      style={{
                        transform: `rotate(${screenAngle}deg)`,
                        transition: "transform 80ms linear",
                      }}
                    >
                      <span
                        className={`text-xs font-semibold mt-1 ${color ?? "text-themed-muted"}`}
                        style={{
                          transform: `rotate(${-screenAngle}deg)`,
                          transition: "transform 80ms linear",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}

                {/* Tick marks — rotate with the dial */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const screenAngle = i * 15 - (displayHeading ?? 0);
                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 top-0 h-2 w-px bg-themed-muted/30"
                      style={{
                        transform: `translateX(-50%) rotate(${screenAngle}deg)`,
                        transformOrigin: "bottom center",
                        top: 6,
                        transition: "transform 80ms linear",
                      }}
                    />
                  );
                })}

                {/* Ka'bah marker — positioned at (qiblahBearing - displayHeading) */}
                {(() => {
                  const screenAngle = qiblahBearing - (displayHeading ?? 0);
                  return (
                    <div
                      className="absolute inset-0 flex items-start justify-center"
                      style={{
                        transform: `rotate(${screenAngle}deg)`,
                        transition: "transform 80ms linear",
                      }}
                    >
                      <div
                        className="flex flex-col items-center"
                        style={{
                          marginTop: "12px",
                          transform: `rotate(${-screenAngle}deg)`,
                          transition: "transform 80ms linear",
                        }}
                      >
                        <div className="w-5 h-5 rounded-sm bg-gold border border-gold/60 shadow-[0_0_10px_rgba(212,168,67,0.6)]" />
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-gold mt-1">Ka&apos;bah</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Fixed user-facing arrow — only shown when a device compass is available.
                  Centered inside the dial, always points straight up. When the Ka'bah marker
                  rotates so it sits at the top, the user is facing the qiblah. */}
              {heading !== null && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 24 24"
                    className={
                      Math.abs(((heading - qiblahBearing + 540) % 360) - 180) < 5
                        ? "text-gold drop-shadow-[0_0_12px_rgba(212,168,67,0.9)]"
                        : "text-themed drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]"
                    }
                    fill="currentColor"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1"
                  >
                    {/* Dart/arrow pointing straight up: tip at top-center, notch at bottom-center */}
                    <path d="M12 2 L20 21 L12 17 L4 21 Z" />
                  </svg>
                </div>
              )}

              {/* Center bearing label — only shown when the arrow isn't (desktop / no sensor) */}
              {heading === null && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gold font-mono">{Math.round(qiblahBearing)}°</p>
                    <p className="text-[10px] uppercase tracking-wider text-themed-muted">
                      {compassDirection(qiblahBearing)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 space-y-2 text-sm">
              <p className="text-themed-muted">From <span className="text-themed">{loc.city}</span></p>
              <p className="text-themed-muted">
                Bearing: <span className="text-gold font-mono">{qiblahBearing.toFixed(1)}°</span> from true North ({compassDirection(qiblahBearing)})
              </p>
              {distanceKm && (
                <p className="text-themed-muted">
                  Distance to Ka&apos;bah: <span className="text-themed font-mono">{Math.round(distanceKm).toLocaleString()} km</span> <span className="text-themed-muted">/</span> <span className="text-themed font-mono">{Math.round(distanceKm * 0.621371).toLocaleString()} mi</span>
                </p>
              )}
              {needsPermission && (
                <button
                  onClick={requestCompassPermission}
                  className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 transition-colors text-sm font-medium"
                >
                  <Compass size={16} /> Enable live compass
                </button>
              )}
              {heading === null && !needsPermission && (
                <>
                  <p className="text-xs text-themed-muted mt-3">
                    Hold a compass (or use a compass app) and align it so the needle points to <span className="text-gold font-mono">{Math.round(qiblahBearing)}°</span>. That direction is the qiblah from where you are standing.
                  </p>
                  <p className="text-xs text-gold/80 mt-2">
                    Tip: Visit this page on your phone for a live qiblah direction using its built-in compass.
                  </p>
                </>
              )}
              {heading !== null && (
                <p className="text-xs text-themed-muted mt-3">
                  The dial rotates as you turn — keep turning until the Ka&apos;bah marker arrives at the top, right under the arrow. That direction is the qiblah. Hold your phone flat for the most accurate reading.
                </p>
              )}
            </div>
          </div>
        )}
      </ContentCard>

      {/* If you're not sure */}
      {!compact && <ContentCard delay={0.11}>
        <h3 className="text-gold font-semibold text-lg mb-3">What if I&apos;m not sure which way to face?</h3>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          Do your best. If you genuinely tried to determine the qiblah and prayed in good faith, your prayer is valid even if you later discover you were facing the wrong direction. The Prophet ﷺ said:
        </p>
        <div className="my-3">
          <p className="text-themed-muted text-sm leading-relaxed italic">
            &ldquo;What is between the east and the west is qiblah.&rdquo;
          </p>
          <p className="text-xs text-gold/80 mt-1">
            <HadithRefText text="Tirmidhi 2:194" className="inline" />
          </p>
        </div>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          This was the Prophet&apos;s ﷺ guidance for the people of Madinah (north of Makkah), meaning the entire southern arc was acceptable when precise direction was unknown. The principle generalizes: when in doubt, face the most likely direction with sincerity. If you can use a compass or compass app, do so. If not, ask a Muslim local or use the sun.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          For travelers on planes, trains, or in cars where exact direction is impossible, face whatever direction you can and pray — Allah does not burden a soul beyond its capacity (Quran 2:286).
        </p>
      </ContentCard>}

      {!compact && <SourcesCard className="mt-6" sources={[
        { ref: "Quran 2:142-145", desc: "The change of qiblah from Jerusalem to the Ka'bah" },
        { ref: "Quran 2:144", desc: "Turn your face toward al-Masjid al-Haram" },
        { ref: "Tirmidhi 2:194", desc: "What is between east and west is qiblah" },
        { ref: "Quran 2:286", desc: "Allah does not burden a soul beyond its capacity" },
      ]} />}
    </div>
  );
}

/* ───────────────────────── Adhan & Iqamah section ───────────────────────── */

function AdhanSection() {
  const { settings, updateSettings, playing, startManual, stop } = useAdhanAudio();
  const isNative = useIsNative();

  return (
    <div className="space-y-6">
      {/* Intro */}
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The <span className="text-gold">adhan</span> is the call to prayer that announces the time has come. The <span className="text-gold">iqamah</span> is a second, shorter call made by someone in the congregation just before the prayer begins, signaling everyone to stand and align in rows. Below you can read both{isNative ? "." : ", and optionally turn on automatic adhan playback at prayer times."}
        </p>
        {!isNative && (
          <p className="text-themed-muted text-xs leading-relaxed mt-2">
            <span className="text-gold/80 font-medium">Note:</span> Automatic adhan playback only works while this site is open in a browser tab. Phones and laptops cannot run background audio when the site is closed.
          </p>
        )}
      </ContentCard>

      {/* Adhan settings panel — on the native app this lives in Settings instead,
          and quick playback is on the Home screen. */}
      {!isNative && (
      <ContentCard delay={0.08}>
        <h3 className="text-gold font-semibold text-lg mb-4 flex items-center gap-2">
          <Volume2 size={18} />
          Auto-Play Adhan
        </h3>

        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <div>
            <p className="text-themed text-sm font-medium">Play Adhan at prayer times</p>
            <p className="text-themed-muted text-xs">Plays automatically at each calculated prayer time while this tab is open</p>
          </div>
          <input
            type="checkbox"
            checked={settings.adhanEnabled}
            onChange={(e) => updateSettings({ adhanEnabled: e.target.checked })}
            className="w-5 h-5 accent-gold cursor-pointer"
          />
        </label>

        <div className="mt-5 pt-5 border-t sidebar-border flex flex-wrap gap-2">
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Abu Dawud 2:109", desc: "Origin of the adhan — the dream of 'Abdullah ibn Zayd" },
        { ref: "Bukhari 10:2", desc: "The origin of the adhan as a public call to congregational prayer" },
        { ref: "Bukhari 10:3", desc: "The iqamah — phrases said once except takbir and 'qad qamati-s-salah'" },
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
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "times");
  const [activePrayer, setActivePrayer] = useState("types");
  const [activeVoluntary, setActiveVoluntary] = useState(() => {
    // Deep-link support: ?sub=<id> (e.g. /salah?tab=voluntary&sub=tarawih).
    // Validate against real prayer ids — currentPrayer uses .find(...)! below.
    const sub = searchParams.get("sub");
    return sub && voluntaryPrayers.some((p) => p.id === sub) ? sub : "tahajjud";
  });
  const [activeWudu, setActiveWudu] = useState("overview");
  const [showGuide, setShowGuide] = useState(false);
  const [search, setSearch] = useState("");

  /* ── Adhan audio context ── */
  const adhan = useAdhanAudio();

  /* ── Prayer Times state ── */
  const [ptTimings, setPtTimings] = useState<PrayerTimings | null>(null);
  const [ptTimezone, setPtTimezone] = useState<string | undefined>(undefined);
  const [ptHijri, setPtHijri] = useState<HijriDate | null>(null);
  const [ptCity, setPtCity] = useState("");
  const [ptCountry, setPtCountry] = useState("");
  const [ptDisplayLocation, setPtDisplayLocation] = useState("");
  const [ptMethod, setPtMethod] = useState<number>(() => getPrayerSettings().calcMethod);
  // The coordinates currently driving the displayed times (device GPS or a
  // picked city). `onDevice` = compute locally (offline-capable). Used so a
  // calc-method change re-computes from the same location instead of falling
  // back to a network city lookup that drops the Asr madhab and exact coords.
  const [ptCoords, setPtCoords] = useState<{ lat: number; lng: number; onDevice: boolean } | null>(null);
  const [ptLoading, setPtLoading] = useState(true);
  const [ptError, setPtError] = useState("");
  const [ptCountdown, setPtCountdown] = useState("");
  const [ptNextPrayerKey, setPtNextPrayerKey] = useState("");
  const [ptSearchQuery, setPtSearchQuery] = useState("");
  const [ptSuggestions, setPtSuggestions] = useState<Array<{ display: string; lat: number; lon: number }>>([]);
  const [ptShowSuggestions, setPtShowSuggestions] = useState(false);
  const [ptSearching, setPtSearching] = useState(false);
  const [ptShowManualInput, setPtShowManualInput] = useState(false);
  const [ptShowMethodMenu, setPtShowMethodMenu] = useState(false);
  const [ptLocating, setPtLocating] = useState(false);
  const ptIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ptFetched = useRef(false);
  const ptDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ptInputRef = useRef<HTMLInputElement>(null);

  const ptFetchTimesByCity = useCallback(
    async (c: string, co: string, m: number) => {
      setPtLoading(true);
      setPtError("");
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(c)}&country=${encodeURIComponent(co)}&method=${m}&school=${getPrayerSettings().asrMethod === "hanafi" ? 1 : 0}`
        );
        if (!res.ok) throw new Error("Failed to fetch prayer times");
        const data: AladhanResponse = await res.json();
        setPtTimings(data.data.timings);
        setPtHijri(data.data.date.hijri);
        setPtTimezone(data.data.meta?.timezone);
        setPtCity(c);
        setPtCountry(co);
        setPtDisplayLocation(`${c}, ${co}`);
      } catch {
        setPtError("Could not load prayer times. Please try a different city.");
      } finally {
        setPtLoading(false);
      }
    },
    []
  );

  const ptFetchTimesByCoords = useCallback(
    // `onDevice` = these are the user's OWN device coordinates → compute locally
    // (device tz === location tz) so the GPS location never leaves the phone and
    // it works offline. Remote city-suggestion coords keep using aladhan (it
    // returns that city's timezone, which on-device computation can't know).
    async (lat: number, lng: number, m: number, onDevice = false) => {
      setPtLoading(true);
      setPtError("");
      setPtCoords({ lat, lng, onDevice });
      if (onDevice) {
        try {
          const timings = computePrayerTimes(lat, lng, {
            method: m,
            asrHanafi: getPrayerSettings().asrMethod === "hanafi",
          });
          setPtTimings(timings);
          setPtHijri(localHijriDate(new Date()));
          setPtTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        } catch {
          setPtError("Could not compute prayer times.");
        } finally {
          setPtLoading(false);
        }
        return;
      }
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${m}&school=${getPrayerSettings().asrMethod === "hanafi" ? 1 : 0}`
        );
        if (!res.ok) throw new Error("Failed to fetch prayer times");
        const data: AladhanResponse = await res.json();
        setPtTimings(data.data.timings);
        setPtHijri(data.data.date.hijri);
        setPtTimezone(data.data.meta?.timezone);
      } catch {
        setPtError("Could not load prayer times.");
      } finally {
        setPtLoading(false);
      }
    },
    []
  );

  const ptAutoLocate = useCallback(async () => {
    // Prefer cached location — no prompt, instant
    const fresh = getFreshCachedLocation();
    if (fresh) {
      setPtCity(fresh.city);
      setPtCountry(fresh.country);
      setPtDisplayLocation(fresh.display);
      ptFetchTimesByCoords(fresh.lat, fresh.lng, ptMethod, true); // device location → on-device
      return;
    }

    // Honor prior denial — fall back to Makkah without prompting
    if (getLocationState() === "denied") {
      setPtCity("Makkah");
      setPtCountry("Saudi Arabia");
      setPtDisplayLocation("Makkah, Saudi Arabia");
      setPtShowManualInput(true);
      ptFetchTimesByCity("Makkah", "Saudi Arabia", ptMethod);
      return;
    }

    if (!navigator.geolocation) return;
    setPtLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Device GPS → compute on-device (location never leaves the phone).
        ptFetchTimesByCoords(latitude, longitude, ptMethod, true);
        setLocationState("granted");
        // Resolve display name in parallel
        const geo = await reverseGeocode(latitude, longitude);
        if (geo) {
          const city = geo.city || geo.principalSubdivision || "";
          const country = geo.countryName || "";
          const display = formatLocation(geo);
          if (display) {
            setPtCity(city);
            setPtCountry(country);
            setPtDisplayLocation(display);
            setCachedLocation({ lat: latitude, lng: longitude, city, country, display });
          } else {
            setPtDisplayLocation(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
          }
        } else {
          setPtDisplayLocation(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
        }
        setPtLocating(false);
      },
      () => {
        setPtCity("Makkah");
        setPtCountry("Saudi Arabia");
        setPtDisplayLocation("Makkah, Saudi Arabia");
        setPtShowManualInput(true);
        ptFetchTimesByCity("Makkah", "Saudi Arabia", ptMethod);
        setPtLocating(false);
        setLocationState("denied");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ptFetchTimesByCoords, ptFetchTimesByCity]);

  useEffect(() => {
    if (ptFetched.current) return;
    ptFetched.current = true;
    if (!navigator.geolocation) {
      setPtCity("Makkah");
      setPtCountry("Saudi Arabia");
      setPtDisplayLocation("Makkah, Saudi Arabia");
      setPtShowManualInput(true);
      ptFetchTimesByCity("Makkah", "Saudi Arabia", ptMethod);
      return;
    }
    ptAutoLocate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ptTimings) return;
    function tick() {
      if (!ptTimings) return;
      const next = getNextPrayerInfo(ptTimings, ptTimezone);
      if (next) {
        setPtNextPrayerKey(next.key);
        setPtCountdown(formatCountdown(next.timeUntil));
      }
    }
    tick();
    ptIntervalRef.current = setInterval(tick, 1000);
    return () => {
      if (ptIntervalRef.current) clearInterval(ptIntervalRef.current);
    };
  }, [ptTimings, ptTimezone]);

  // Push prayer timings into the adhan audio context (which handles scheduling globally)
  useEffect(() => {
    if (ptTimings) adhan.setTimings(ptTimings);
  }, [ptTimings, adhan]);

  const ptHandleMethodChange = (newMethod: number) => {
    setPtMethod(newMethod);
    // Persist so the Home card + scheduled adhan use the same method.
    setPrayerSettings({ calcMethod: newMethod as PrayerCalcMethod });
    // Re-fetch from the active coordinates when we have them: preserves the
    // Hanafi Asr madhab + exact location and keeps working offline (on-device
    // path). Only the manual-city fallback (no coords) uses the network API.
    if (ptCoords) {
      ptFetchTimesByCoords(ptCoords.lat, ptCoords.lng, newMethod, ptCoords.onDevice);
    } else if (ptCity && ptCountry) {
      ptFetchTimesByCity(ptCity, ptCountry, newMethod);
    }
  };

  const ptSearchLocation = useCallback(async (query: string) => {
    if (query.length < 2) { setPtSuggestions([]); return; }
    setPtSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setPtSuggestions(
        data.map((r: { display_name: string; lat: string; lon: string; address?: { city?: string; town?: string; village?: string; state?: string; country?: string } }) => {
          const addr = r.address || {};
          const city = addr.city || addr.town || addr.village || "";
          const parts = [city, addr.state, addr.country].filter(Boolean);
          return {
            display: parts.length > 0 ? parts.join(", ") : r.display_name.split(",").slice(0, 3).join(","),
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
          };
        })
      );
      setPtShowSuggestions(true);
    } catch {
      setPtSuggestions([]);
    } finally {
      setPtSearching(false);
    }
  }, []);

  const ptHandleQueryChange = (value: string) => {
    setPtSearchQuery(value);
    if (ptDebounceRef.current) clearTimeout(ptDebounceRef.current);
    ptDebounceRef.current = setTimeout(() => ptSearchLocation(value), 300);
  };

  const ptSelectSuggestion = (s: { display: string; lat: number; lon: number }) => {
    setPtSearchQuery(s.display);
    setPtShowSuggestions(false);
    setPtSuggestions([]);
    setPtDisplayLocation(s.display);
    const parts = s.display.split(", ");
    setPtCity(parts[0] || "");
    setPtCountry(parts[parts.length - 1] || "");
    ptFetchTimesByCoords(s.lat, s.lon, ptMethod);
    setPtShowManualInput(false);
  };

  const ptHandleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptSearchQuery.trim()) return;
    // If there are suggestions, pick the first one
    if (ptSuggestions.length > 0) {
      ptSelectSuggestion(ptSuggestions[0]);
    } else {
      // Fallback: try city-based fetch
      const q = ptSearchQuery.trim();
      ptFetchTimesByCity(q, "auto", ptMethod);
      setPtShowManualInput(false);
    }
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
  const showTypesTab = !search || filteredPrayerTypes.length > 0;
  const filteredMatters = whyItMatters.filter(mattersMatches);

  const wuduTopicMatches = (t: WuduTopic) => {
    if (!search) return true;
    return textMatch(
      search,
      t.name,
      t.content.intro,
      ...t.content.points.map((p) => p.title),
      ...t.content.points.map((p) => p.detail),
    );
  };

  const currentPrayer = activeSection === "voluntary"
    ? voluntaryPrayers.find((p) => p.id === activeVoluntary)!
    : prayers.find((p) => p.id === activePrayer) || prayers[0];

  return (
    <div>
      <PageHeader
        title="Salah"
        titleAr="الصلاة"
        subtitle="The five daily prayers — the direct connection between the servant and Allah"
      />

      <ContentCard className="mb-6">
        <div className="text-center py-4">
          <p className="text-2xl font-arabic text-gold leading-loose mb-3">
            إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ ۗ وَلَذِكْرُ ٱللَّهِ أَكْبَرُ
          </p>
          <p className="text-themed-muted italic">&ldquo;Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.&rdquo;</p>
          <p className="text-xs text-themed-muted mt-1">Quran 29:45</p>
        </div>
      </ContentCard>

      <PageSearch value={search} onChange={setSearch} placeholder="Search prayers, steps, duas..." className="mb-6" />

      {/* Section navigation (shared TabBar — picker on mobile when >6 tabs) */}
      <TabBar
        tabs={sections.map((s) => ({ key: s.key, label: s.label }))}
        activeTab={activeSection}
        onTabChange={(k) => {
          setActiveSection(k as SectionKey);
          setShowGuide(false);
        }}
        className="mb-6"
      />

      <AnimatePresence mode="wait">
        {/* ─── Prayer Times ─── */}
        {activeSection === "times" && (
          <motion.div
            key="times"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            {/* Location & Hijri Date */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div>
                {ptDisplayLocation && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gold" />
                    <p className="text-themed text-sm font-medium">{ptDisplayLocation}</p>
                  </div>
                )}
                {ptHijri && (
                  <p className="text-themed-muted text-xs mt-1">
                    {ptHijri.day} {ptHijri.month.en} {ptHijri.year} {ptHijri.designation.abbreviated}
                    <span className="font-arabic ml-2 text-gold/60">
                      {ptHijri.month.ar}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    ptAutoLocate();
                    setPtShowManualInput(false);
                  }}
                  disabled={ptLocating}
                  className="flex items-center gap-1.5 text-xs text-themed-muted hover:text-gold transition-colors disabled:opacity-50"
                  title="Auto-detect location"
                >
                  <LocateFixed size={14} className={ptLocating ? "animate-spin" : ""} />
                  Auto-locate
                </button>
                <button
                  onClick={() => setPtShowManualInput((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-themed-muted hover:text-gold transition-colors"
                >
                  <Search size={14} />
                  Change Location
                </button>
                <div className="relative">
                  <button
                    onClick={() => setPtShowMethodMenu((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-themed-muted hover:text-gold transition-colors"
                    title="Calculation method"
                  >
                    <Settings2 size={14} />
                    <span className="hidden sm:inline">{CALCULATION_METHODS.find((m) => m.value === ptMethod)?.label}</span>
                  </button>
                  {ptShowMethodMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setPtShowMethodMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 z-50 rounded-lg border sidebar-border card-bg shadow-lg overflow-hidden min-w-[200px]">
                        <p className="text-[10px] text-themed-muted uppercase tracking-wider px-3 pt-2.5 pb-1">Calculation method</p>
                        {CALCULATION_METHODS.map((m) => (
                          <button
                            key={m.value}
                            onClick={() => {
                              ptHandleMethodChange(m.value);
                              setPtShowMethodMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                              ptMethod === m.value
                                ? "text-gold bg-gold/10"
                                : "text-themed hover:bg-gold/5"
                            }`}
                          >
                            <span>{m.label}</span>
                            {ptMethod === m.value && <span className="text-gold text-xs">✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Location Search */}
            {ptShowManualInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={ptHandleSearch} className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1 min-w-0">
                      <input
                        ref={ptInputRef}
                        type="text"
                        placeholder="Search city, state, or country..."
                        value={ptSearchQuery}
                        onChange={(e) => ptHandleQueryChange(e.target.value)}
                        onFocus={() => ptSuggestions.length > 0 && setPtShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setPtShowSuggestions(false), 200)}
                        autoComplete="off"
                        className="w-full px-3 py-2 rounded-lg text-sm card-bg border sidebar-border text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/50"
                      />
                      {ptSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-[var(--color-gold)]/30 border-t-[var(--color-gold)] rounded-full animate-spin" />
                        </div>
                      )}
                      {ptShowSuggestions && ptSuggestions.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border sidebar-border card-bg shadow-lg overflow-hidden">
                          {ptSuggestions.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => ptSelectSuggestion(s)}
                              className="w-full text-left px-3 py-2.5 text-sm text-themed hover:bg-[var(--color-gold)]/10 transition-colors flex items-center gap-2 border-b sidebar-border last:border-b-0"
                            >
                              <MapPin size={12} className="text-gold/60 shrink-0" />
                              <span className="truncate">{s.display}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/30 transition-colors shrink-0"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Next Prayer — Hero Countdown */}
            {ptTimings && ptNextPrayerKey && !ptLoading && (() => {
              const win = getWindowProgress(ptTimings, ptNextPrayerKey, ptTimezone);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <div className="card-bg rounded-2xl border sidebar-border p-6 sm:p-8 relative overflow-hidden">
                    {/* Atmospheric gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.08] via-gold/[0.02] to-transparent pointer-events-none" />
                    <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gold/[0.04] blur-3xl pointer-events-none" />

                    <div className="relative">
                      <div className="text-center">
                        <p className="text-[11px] text-themed-muted uppercase tracking-[0.2em] mb-3">Up Next</p>
                        <div className="flex items-baseline justify-center gap-3 mb-1">
                          <p className="text-gold text-3xl sm:text-4xl font-semibold">{ptNextPrayerKey}</p>
                          <p className="text-themed-muted text-sm">at {win ? win.nextTime : ""}</p>
                        </div>
                        <p className="font-mono text-4xl sm:text-5xl md:text-6xl text-themed tracking-wider mt-4 mb-6 sm:mb-8 tabular-nums">
                          {ptCountdown}
                        </p>
                      </div>

                      {win && (
                        <div>
                          <div className="h-1.5 rounded-full bg-gold/10 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-gold/50 to-gold rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${win.progress * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-themed-muted mt-2 uppercase tracking-wider">
                            <span>{win.prevKey} <span className="font-mono normal-case tracking-normal text-themed-muted/70">{win.prevTime}</span></span>
                            <span>{win.nextKey} <span className="font-mono normal-case tracking-normal text-themed-muted/70">{win.nextTime}</span></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Day Timeline Strip */}
            {ptTimings && !ptLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="card-bg rounded-xl border sidebar-border p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] text-themed-muted uppercase tracking-[0.2em]">Today</p>
                  </div>
                  {(() => {
                    const nowParts = getNowParts(ptTimezone);
                    const nowMin = nowParts.hours * 60 + nowParts.minutes + nowParts.seconds / 60;
                    const nowPos = nowMin / (24 * 60);
                    // Only the 5 daily prayers on the timeline (Sunrise stays in the detail grid below)
                    const stops = PRAYER_TIME_LIST.filter((p) => p.isPrayer)
                      .map((p) => {
                        const raw = ptTimings[p.key as keyof PrayerTimings];
                        if (!raw) return null;
                        const min = timeStringToMinutes(raw);
                        return { ...p, pos: min / (24 * 60), time: formatDisplayTime(raw) };
                      })
                      .filter((v): v is NonNullable<typeof v> => v !== null);
                    const nowTimeStr = ptTimezone
                      ? new Intl.DateTimeFormat("en-US", {
                          timeZone: ptTimezone,
                          hour: "numeric",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        }).format(new Date())
                      : new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });

                    // Vertical layout reference (px from container top):
                    //   0–18  : time pill at the current position
                    //   22–44 : prayer name labels
                    //   54    : horizontal day line
                    //   48–60 : tick marks at each prayer's position (cross the line)
                    //   66+   : 12 AM end labels
                    return (
                      <div className="relative h-24 mx-2">
                        {/* Prayer name labels */}
                        {stops.map((s) => {
                          const isNext = s.key === ptNextPrayerKey;
                          return (
                            <div
                              key={s.key}
                              className="absolute -translate-x-1/2 top-[26px] text-center whitespace-nowrap"
                              style={{ left: `${s.pos * 100}%` }}
                            >
                              <p
                                className={`text-[10px] uppercase tracking-wider ${
                                  isNext ? "text-gold font-semibold" : "text-themed-muted"
                                }`}
                              >
                                {s.english}
                              </p>
                            </div>
                          );
                        })}

                        {/* Horizontal day line (below names) */}
                        <div
                          className="absolute left-0 right-0 top-[54px] rounded-full"
                          style={{ height: "2px", background: "rgba(212, 168, 67, 0.55)" }}
                        />
                        {/* End caps */}
                        <div
                          className="absolute left-0 top-[48px] rounded-full"
                          style={{ width: "2px", height: "14px", background: "rgba(212, 168, 67, 0.7)" }}
                        />
                        <div
                          className="absolute right-0 top-[48px] rounded-full"
                          style={{ width: "2px", height: "14px", background: "rgba(212, 168, 67, 0.7)" }}
                        />
                        {/* Tick marks at each prayer's position */}
                        {stops.map((s) => (
                          <div
                            key={`tick-${s.key}`}
                            className="absolute top-[49px]"
                            style={{
                              left: `${s.pos * 100}%`,
                              transform: "translateX(-50%)",
                              width: "2px",
                              height: "12px",
                              background: "rgba(212, 168, 67, 0.7)",
                            }}
                          />
                        ))}
                        {/* 12 AM end labels */}
                        <p className="absolute left-0 top-[66px] text-[9px] font-mono text-themed-muted/40">12 AM</p>
                        <p className="absolute right-0 top-[66px] text-[9px] font-mono text-themed-muted/40 text-right">12 AM</p>

                        {/* Now marker — time pill at top, vertical line, dot sitting on the day line */}
                        <div
                          className="absolute top-0 bottom-0 pointer-events-none"
                          style={{ left: `${nowPos * 100}%` }}
                        >
                          <div className="absolute -translate-x-1/2 top-0 px-2 py-0.5 rounded-md bg-gold/15 border border-gold/30 whitespace-nowrap">
                            <p className="text-[10px] font-mono text-gold tabular-nums">{nowTimeStr}</p>
                          </div>
                          <div className="absolute top-[20px] w-px bg-gold" style={{ height: "35px" }} />
                          <div className="absolute top-[55px] -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(212,168,67,0.7)]" />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {/* Loading / Error */}
            {ptLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-[var(--color-gold)]/30 border-t-[var(--color-gold)] rounded-full animate-spin" />
                <p className="text-themed-muted text-sm mt-3">Loading prayer times...</p>
              </div>
            )}
            {ptError && (
              <div className="text-center py-8">
                <p className="text-red-400 text-sm">{ptError}</p>
              </div>
            )}

            {/* Prayer Time Cards */}
            {ptTimings && !ptLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRAYER_TIME_LIST.map((prayer, i) => {
                  const raw = ptTimings[prayer.key as keyof PrayerTimings];
                  if (!raw) return null;
                  const isNext = prayer.isPrayer && prayer.key === ptNextPrayerKey;
                  const Icon = prayer.icon;
                  return (
                    <ContentCard
                      key={prayer.key}
                      delay={0.25 + i * 0.06}
                      className={
                        isNext
                          ? "!border-[var(--color-gold)]/60 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                          : !prayer.isPrayer
                          ? "opacity-60"
                          : ""
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2.5 rounded-lg shrink-0 ${
                            isNext
                              ? "bg-[var(--color-gold)]/20"
                              : "bg-[var(--color-gold)]/10"
                          }`}
                        >
                          <Icon
                            size={22}
                            className={isNext ? "text-gold" : "text-gold/70"}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <h3
                              className={`font-semibold text-sm ${
                                isNext ? "text-gold" : "text-themed"
                              }`}
                            >
                              {prayer.english}
                            </h3>
                            <span className="text-xs font-arabic text-gold/50">
                              {prayer.arabic}
                            </span>
                          </div>
                          {!prayer.isPrayer && (
                            <span className="text-[10px] text-themed-muted uppercase tracking-wide">
                              Not a prayer
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-lg font-mono font-semibold shrink-0 ${
                            isNext ? "text-gold" : "text-themed"
                          }`}
                        >
                          {formatDisplayTime(raw)}
                        </p>
                      </div>
                      {isNext && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          className="mt-3 h-[2px] rounded-full bg-gradient-to-r from-[var(--color-gold)] to-transparent origin-left"
                        />
                      )}
                    </ContentCard>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

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

            {/* Sources */}
            <SourcesCard delay={0.35} sources={[
              { ref: "Bukhari 63:112, Muslim 1:321", desc: "The prescription of prayer during al-Isra wal-Mi'raj" },
              { ref: "Muslim 4:41", desc: "Allah's response to Al-Fatihah" },
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

            {/* Sources */}
            <SourcesCard delay={0.4} sources={[
              { ref: "Nasai 5:18", desc: "Prayer is the first deed judged" },
              { ref: "Muslim 4:41", desc: "Allah responds to Al-Fatihah" },
              { ref: "Tirmidhi 40:16; Muslim 1:12", desc: "The covenant between us and them is prayer" },
              { ref: "Bukhari 9:7, Muslim 5:356", desc: "The likeness of the five prayers" },
              { ref: "Tafsir Ibn Kathir", desc: "Commentary on Quran 29:45, 20:132" },
            ]} />
          </motion.div>
        )}

        {/* ─── Wudu ─── */}
        {activeSection === "wudu" && (
          <motion.div
            key="wudu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — topic pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
                {wuduTopics.filter(wuduTopicMatches).map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setActiveWudu(topic.id)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-left flex items-center gap-2 ${
                      activeWudu === topic.id
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>

              {/* Right side — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {wuduTopics.map(
                    (topic) =>
                      activeWudu === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <ContentCard>
                            <div className="mb-4">
                              <h2 className="text-xl font-semibold text-themed">{topic.name}</h2>
                            </div>

                            <p className="text-themed-muted text-sm leading-relaxed mb-5">
                              {topic.content.intro}
                            </p>

                            {topic.content.verse && (
                              <div
                                className="rounded-lg p-4 mb-5"
                                style={{ backgroundColor: "var(--color-bg)" }}
                              >
                                <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                                  {topic.content.verse.arabic}
                                </p>
                                <p className="text-themed text-sm italic">
                                  &ldquo;{topic.content.verse.text}&rdquo;
                                </p>
                                <p className="text-xs text-themed-muted mt-2">
                                  <HadithRefText text={topic.content.verse.ref} />
                                </p>
                              </div>
                            )}

                            <div className="space-y-4">
                              {topic.content.points.map((point) => (
                                <div
                                  key={point.title}
                                  className="rounded-lg p-4 border sidebar-border"
                                  style={{ backgroundColor: "var(--color-bg)" }}
                                >
                                  <h4 className="text-sm font-semibold text-themed mb-2">
                                    {point.title}
                                  </h4>
                                  <p className="text-themed-muted text-sm leading-relaxed">
                                    {point.detail}
                                  </p>
                                  {point.note && (
                                    <p className="text-xs text-gold/60 mt-2"><HadithRefText text={point.note} /></p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ContentCard>
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sources */}
            <SourcesCard delay={0.3} className="mt-8" sources={[
              { ref: "Quran 5:6", desc: "The verse of wudu, detailing the obligatory acts of purification" },
              { ref: "Bukhari 1:1, 4:1, 4:25, 11:12", desc: "Niyyah, nullifiers, the Prophet's ﷺ wudu, right-side preference, miswak" },
              { ref: "Muslim 2:1, 2:20, 2:44, 2:46, 3:123", desc: "Cleanliness, two rak'at after wudu, dua, sins washed away, ghurr and muhajjalin, camel meat" },
              { ref: "Abu Dawud 1:60, 1:101, 1:200", desc: "Passing wind, Bismillah, ears, washing three times, interlacing fingers, deep sleep" },
              { ref: "Tirmidhi 1:31, 1:82", desc: "Beard, ears are part of head, interlacing toes, dua after wudu, touching private parts" },
              { ref: "Ibn Majah 1:133, 1:159", desc: "Bismillah obligation discussion, moderation with water" },
            ]} />
          </motion.div>
        )}

        {/* ─── Qiblah ─── */}
        {activeSection === "qiblah" && (
          <motion.div
            key="qiblah"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <QiblahSection />
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

        {/* ─── The Five Prayers ─── */}
        {activeSection === "prayers" && (
          <motion.div
            key="prayers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {!showGuide && (
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Left side — prayer pills (horizontal scroll on mobile, vertical on md+) */}
                <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  {showTypesTab && (
                    <button
                      onClick={() => {
                        setActivePrayer("types");
                        setShowGuide(false);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-left flex items-center justify-between gap-3 ${
                        activePrayer === "types"
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "text-themed-muted hover:text-themed border sidebar-border"
                      }`}
                    >
                      <span>Types</span>
                      <span className={`text-[10px] font-arabic ${
                        activePrayer === "types" ? "text-gold/60" : "text-themed-muted/50"
                      }`}>أنواع</span>
                    </button>
                  )}
                  {filteredPrayers.map((prayer) => (
                    <button
                      key={prayer.id}
                      onClick={() => {
                        setActivePrayer(prayer.id);
                        setShowGuide(false);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-left flex items-center justify-between gap-3 ${
                        activePrayer === prayer.id
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "text-themed-muted hover:text-themed border sidebar-border"
                      }`}
                    >
                      <span>{prayer.name}</span>
                      <span className={`text-[10px] font-arabic ${
                        activePrayer === prayer.id ? "text-gold/60" : "text-themed-muted/50"
                      }`}>{prayer.nameAr}</span>
                    </button>
                  ))}
                </div>

                {/* Right side — prayer content */}
                <div className="flex-1 min-w-0 w-full">
                  <AnimatePresence mode="wait">
                    {activePrayer === "types" && (
                      <motion.div
                        key="types"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ContentCard>
                          <h3 className="text-lg font-semibold text-themed mb-1">Types of Prayer</h3>
                          <p className="text-sm text-themed-muted mb-5">
                            Islamic prayers are categorized by their obligation level — from the five
                            compulsory daily prayers to voluntary acts of devotion.
                          </p>
                          <div className="space-y-4">
                            {filteredPrayerTypes.map((type) => (
                              <div
                                key={type.id}
                                className="rounded-lg p-4 border sidebar-border"
                                style={{ backgroundColor: "var(--color-bg)" }}
                              >
                                <div className="flex items-baseline gap-2 mb-2">
                                  <h4 className="text-sm font-semibold text-themed">{type.name}</h4>
                                  <span className="text-xs font-arabic text-gold/60">{type.nameAr}</span>
                                </div>
                                <p className="text-sm text-themed-muted leading-relaxed mb-3">{type.detail}</p>
                                <div className="flex flex-col sm:flex-row gap-3 text-xs">
                                  <div className="flex-1 rounded-md p-2.5 border sidebar-border" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                                    <span className="text-themed-muted uppercase tracking-wider text-[10px]">Examples</span>
                                    <p className="text-themed mt-1">{type.examples}</p>
                                  </div>
                                  <div className="sm:w-48 rounded-md p-2.5 border sidebar-border" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                                    <span className="text-themed-muted uppercase tracking-wider text-[10px]">Ruling</span>
                                    <p className="text-themed mt-1">{type.ruling}</p>
                                  </div>
                                </div>
                                <p className="text-xs text-gold/60 mt-2">
                                  <HadithRefText text={type.ref} />
                                </p>
                              </div>
                            ))}
                          </div>
                        </ContentCard>
                      </motion.div>
                    )}
                    {filteredPrayers.map(
                      (prayer) =>
                        activePrayer === prayer.id && (
                          <motion.div
                            key={prayer.id}
                            id={`section-${prayer.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                          >
                            <PrayerInfoCard
                              prayer={prayer}
                              onHowToPray={() => setShowGuide(true)}
                            />
                          </motion.div>
                        )
                    )}
                  </AnimatePresence>
                </div>
              </div>
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

            {/* Sources & References for Five Prayers */}
            {!showGuide && (
              <SourcesCard delay={0.3} className="mt-8" sources={[
                { ref: "Bukhari 9:50", desc: "Fajr & Asr: whoever prays the two cool prayers will enter Paradise" },
                { ref: "Muslim 6:118", desc: "Fajr sunnah: better than the world and everything in it" },
                { ref: "Tirmidhi 2:281", desc: "Dhuhr: reward for praying four rak'at before and after" },
                { ref: "Nasai 14:6", desc: "Jumu'ah: warning about missing three consecutive Friday prayers" },
                { ref: "Bukhari 9:29", desc: "Asr: missing it is like losing family and property" },
                { ref: "Muslim 5:223", desc: "Maghrib: timing of the sunset prayer" },
                { ref: "Muslim 6:124", desc: "Rawatib sunnah: the 12 confirmed sunnah prayers" },
                { ref: "Bukhari 10:51", desc: "Isha & Fajr: reward for attending them in congregation" },
                { ref: "Bukhari 14:9", desc: "Witr: make the last of your night prayer Witr" },
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
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Left side — prayer pills (horizontal scroll on mobile, vertical on md+) */}
                <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  {filteredVoluntary.map((prayer) => (
                    <button
                      key={prayer.id}
                      onClick={() => {
                        setActiveVoluntary(prayer.id);
                        setShowGuide(false);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-left flex items-center justify-between gap-3 ${
                        activeVoluntary === prayer.id
                          ? "bg-sky-500/20 text-sky-400 border border-sky-400/40"
                          : "text-sky-400/60 hover:text-sky-400 border border-sky-400/20"
                      }`}
                    >
                      <span>{prayer.name}</span>
                      <span className={`text-[10px] font-arabic ${
                        activeVoluntary === prayer.id ? "text-sky-400/60" : "text-sky-400/30"
                      }`}>{prayer.nameAr}</span>
                    </button>
                  ))}
                </div>

                {/* Right side — prayer content */}
                <div className="flex-1 min-w-0 w-full">
                  <AnimatePresence mode="wait">
                    {filteredVoluntary.map(
                      (prayer) =>
                        activeVoluntary === prayer.id && (
                          <motion.div
                            key={prayer.id}
                            id={`section-${prayer.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                          >
                            <PrayerInfoCard
                              prayer={prayer}
                              onHowToPray={() => setShowGuide(true)}
                            />
                          </motion.div>
                        )
                    )}
                  </AnimatePresence>
                </div>
              </div>
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
                { ref: "Bukhari 19:26, 19:28", desc: "Tahajjud: Allah descends to the lowest heaven; the Prophet's night prayer practice" },
                { ref: "Muslim 13:261", desc: "Tahajjud: night prayer is the best prayer after the obligatory ones" },
                { ref: "Muslim 6:101", desc: "Duha: two rak'at of Duha suffice as charity for every joint" },
                { ref: "Tirmidhi 6:43", desc: "Duha/Ishraq: reward like Hajj and Umrah for praying after sunrise (graded da'if by some; widely practiced)" },
                { ref: "Abu Dawud 8:106; Tirmidhi 2:259", desc: "Tawbah: forgiveness for praying 2 rak'at after sinning" },
                { ref: "Bukhari 19:45", desc: "Istikhara: the du'a and method taught by the Prophet (peace be upon him)" },
                { ref: "Bukhari 31:6", desc: "Tarawih: Aisha's narration of the Prophet's night prayer in Ramadan" },
                { ref: "Bukhari 2:30; Muslim 6:207", desc: "Tarawih: forgiveness for standing in prayer during Ramadan" },
                { ref: "Bukhari 13:8", desc: "Eid: the Prophet's practice of praying in the musalla" },
                { ref: "Bukhari 23:81; Muslim 11:67", desc: "Janazah: reward for attending the funeral prayer" },
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
