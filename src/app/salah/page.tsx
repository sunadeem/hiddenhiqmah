"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import { textMatch } from "@/lib/search";
import ContentCard from "@/components/ContentCard";
import PrayerFigure, { type Position } from "@/components/PrayerFigure";
import {
  BookOpen,
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
} from "lucide-react";

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
      "Say 'Allahu Akbar' and go down into prostration. Seven body parts must touch the ground: the forehead and nose, both palms, both knees, and the toes of both feet. Say 'Subhana Rabbiyal A'la' three times (the sunnah; once is the minimum). This is the closest a servant is to Allah (Sahih Muslim 482).",
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
      "Recite this in the final sitting (last rak'ah) after the tashahhud. Then you may make any personal du'a before the taslim. The Prophet (peace be upon him) said: 'Then let him choose whatever supplication he wishes' (Sahih al-Bukhari 835).",
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
      "The 2 sunnah rak'at before Fajr are the most emphasized voluntary prayer. The Prophet (peace be upon him) said: 'The two rak'at of Fajr are better than the world and everything in it' (Sahih Muslim 725). Recitation in the fard is done aloud.",
    description:
      "The dawn prayer — the first prayer of the day, prayed between the break of true dawn (when the white light spreads horizontally across the horizon) and sunrise.",
    verse: {
      arabic: "أَقِمِ ٱلصَّلَوٰةَ لِدُلُوكِ ٱلشَّمْسِ إِلَىٰ غَسَقِ ٱلَّيْلِ وَقُرْءَانَ ٱلْفَجْرِ ۖ إِنَّ قُرْءَانَ ٱلْفَجْرِ كَانَ مَشْهُودًۭا",
      text: "Establish prayer at the decline of the sun until the darkness of the night, and the Quran at dawn. Indeed, the recitation of dawn is ever witnessed.",
      ref: "Quran 17:78",
    },
    hadith: {
      text: "Whoever prays the two cool prayers (Fajr and Asr) will enter Paradise.",
      ref: "Sahih al-Bukhari 574",
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
      "On Friday, Dhuhr is replaced by the Jumu'ah (Friday) prayer for men, which is 2 rak'at preceded by a khutbah (sermon). The Prophet (peace be upon him) said: 'Whoever leaves three Jumu'ah prayers out of negligence, Allah will seal his heart' (Sunan an-Nasa'i 1370). Recitation in Dhuhr is silent.",
    description:
      "The noon prayer — prayed after the sun has passed its highest point (zenith) and begins to decline. It is the prayer at the middle of the day.",
    hadith: {
      text: "Whoever consistently prays four rak'at before Dhuhr and four after it, Allah will forbid the Hellfire for him. (Note: this refers to additional voluntary prayers beyond the regular 2 sunnah after Dhuhr.)",
      ref: "Sunan at-Tirmidhi 428",
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
      "There are no confirmed regular sunnah prayers for Asr, though voluntary prayers before it are praiseworthy. The Prophet (peace be upon him) warned strongly about missing Asr: 'Whoever misses the Asr prayer, it is as if he lost his family and property' (Sahih al-Bukhari 552). Recitation is silent.",
    description:
      "The afternoon prayer — prayed when the shadow of an object is equal to its actual length (after Dhuhr time ends) until sunset. It is specifically emphasized in the Quran as the 'middle prayer'.",
    verse: {
      arabic: "حَـٰفِظُوا عَلَى ٱلصَّلَوَٰتِ وَٱلصَّلَوٰةِ ٱلْوُسْطَىٰ",
      text: "Maintain the prayers and [especially] the middle prayer.",
      ref: "Quran 2:238",
    },
    hadith: {
      text: "Whoever misses the Asr prayer, it is as if he lost his family and property.",
      ref: "Sahih al-Bukhari 552",
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
      "Maghrib has a narrow window — it should be prayed soon after sunset. The 3 fard rak'at are unique: the first 2 have audible recitation, and the 3rd is silent with only Al-Fatihah. The 2 sunnah rak'at after Maghrib are part of the 12 confirmed rawatib sunnah (Sahih Muslim 728).",
    description:
      "The sunset prayer — prayed immediately after the sun has fully set below the horizon. Its time ends when the red twilight (shafaq) disappears from the sky.",
    hadith: {
      text: "The time for Maghrib prayer is when the sun sets, as long as the twilight has not disappeared.",
      ref: "Sahih Muslim 612",
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
      "After the 2 sunnah, the Witr prayer is highly recommended — the Prophet (peace be upon him) never left it, even while traveling. Witr is an odd number of rak'at (most commonly 1 or 3). He said: 'Make the last of your night prayer Witr' (Sahih al-Bukhari 998). The first 2 rak'at of Isha fard are recited aloud, the last 2 silently.",
    description:
      "The night prayer — prayed after the disappearance of the red/white twilight. Its preferred time extends until the middle of the night, though it remains valid until Fajr.",
    hadith: {
      text: "If the people knew what reward is in the Fajr and Isha prayers, they would come to them even if they had to crawl.",
      ref: "Sahih al-Bukhari 615",
    },
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
      "Tahajjud is not obligatory but is the most virtuous voluntary prayer. It is prayed in sets of 2 rak'at, typically 2 to 12 rak'at, followed by Witr. The Prophet (peace be upon him) would regularly pray 11 rak'at at night (Sahih al-Bukhari 1147). Recitation is done aloud or quietly — both are permissible. The last third of the night is when Allah descends to the lowest heaven and says: 'Who is calling upon Me, that I may answer him?' (Sahih al-Bukhari 1145, Sahih Muslim 758).",
    description:
      "The voluntary night prayer — prayed after sleeping and waking in the latter part of the night. It is a deeply personal act of devotion, praised extensively in the Quran and Sunnah. Allah described the people of Tahajjud as those whose 'sides forsake their beds' in worship.",
    verse: {
      arabic: "وَمِنَ ٱلَّيْلِ فَتَهَجَّدْ بِهِۦ نَافِلَةًۭ لَّكَ عَسَىٰٓ أَن يَبْعَثَكَ رَبُّكَ مَقَامًۭا مَّحْمُودًۭا",
      text: "And in a part of the night, pray Tahajjud as an additional prayer for you. It may be that your Lord will raise you to a praised station.",
      ref: "Quran 17:79",
    },
    hadith: {
      text: "The best prayer after the obligatory prayers is the night prayer (Tahajjud).",
      ref: "Sahih Muslim 1163",
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
      "Duha can be prayed as few as 2 rak'at and up to 12. The most common is 2–4. When prayed shortly after sunrise, it is also called Ishraq. The Prophet (peace be upon him) said: 'In the morning, charity is due on every joint of the body. Every tasbeeh is charity, every tahmeed is charity, every tahleel is charity... and two rak'at of Duha suffice for all of that' (Sahih Muslim 720).",
    description:
      "The forenoon prayer — a highly recommended voluntary prayer prayed in the morning hours. When prayed shortly after sunrise, it is also known as Salat al-Ishraq.",
    verse: {
      arabic: "وَٱلضُّحَىٰ",
      text: "By the morning brightness.",
      ref: "Quran 93:1",
    },
    hadith: {
      text: "Whoever prays the Fajr prayer in congregation, then sits remembering Allah until the sun rises, then prays two rak'at, will have a reward like that of Hajj and Umrah — complete, complete, complete.",
      ref: "Sunan at-Tirmidhi 586 (graded da'if by some scholars; widely practiced)",
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
      ref: "Sunan Abu Dawud 1521; Sunan at-Tirmidhi 406",
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
      "Istikhara is 2 rak'at of voluntary prayer, followed by the specific du'a of Istikhara in which you ask Allah to guide you toward what is best. It is not about seeing a dream or a sign — rather, it is entrusting the decision to Allah and proceeding with what feels right. The Prophet (peace be upon him) taught this for all matters, saying: 'If any of you is concerned about a decision, let him pray two rak'at of non-obligatory prayer...' (Sahih al-Bukhari 1166). The du'a includes: 'O Allah, if You know this matter to be good for me... then decree it for me.'",
    description:
      "The prayer of seeking guidance — prayed before making any important decision. The word 'istikhara' means seeking the best outcome from Allah. It is one of the most practical sunnah prayers, applicable to marriage, career, travel, and any significant choice.",
    hadith: {
      text: "If any of you is concerned about a decision he has to make, let him pray two rak'at of non-obligatory prayer, then say: 'O Allah, I seek Your guidance by virtue of Your knowledge...'",
      ref: "Sahih al-Bukhari 1166",
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
      "Tarawih is prayed in sets of 2 rak'at. The number varies — 8 rak'at (the practice of Aisha's narration, Sahih al-Bukhari 2013) or 20 rak'at (the practice established by Umar ibn al-Khattab in congregation). Both are valid. The entire Quran is typically recited over the course of Ramadan in Tarawih at the masjid. It is concluded with Witr prayer.",
    description:
      "The Ramadan night prayer — a special congregational prayer prayed every night during the month of Ramadan. The word 'tarawih' means 'rest,' as worshippers would rest between every 4 rak'at due to its length.",
    hadith: {
      text: "Whoever stands in prayer during Ramadan out of sincere faith and seeking reward, his previous sins will be forgiven.",
      ref: "Sahih al-Bukhari 37; Sahih Muslim 759",
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
      ref: "Sahih al-Bukhari 956",
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
      "Janazah prayer has a unique structure: 4 takbirat with no ruku' or sujud. After the 1st takbir: recite Al-Fatihah. After the 2nd: recite the Salawat al-Ibrahimiyyah. After the 3rd: make du'a for the deceased. After the 4th: make a brief du'a, then give one taslim to the right. It is a fard kifayah — a communal obligation (if some perform it, the obligation is lifted from the rest). The Prophet (peace be upon him) said: 'Whoever attends the funeral until the prayer is offered will have one qirat of reward' (Sahih al-Bukhari 1325).",
    description:
      "The funeral prayer — a unique prayer performed for a deceased Muslim. It is a communal obligation (fard kifayah) and differs from all other prayers in that it has no bowing or prostration, only four standing takbirat with specific recitations between them.",
    hadith: {
      text: "Whoever attends the funeral until the prayer is offered will have one qirat of reward, and whoever stays until the burial will have two qirat. It was asked: 'What are the two qirat?' He said: 'Like two great mountains.'",
      ref: "Sahih al-Bukhari 1325; Sahih Muslim 945",
    },
  },
];

const whyItMatters = [
  {
    point: "It is the first thing a person will be judged for",
    detail:
      "The Prophet (peace be upon him) said: 'The first thing a person will be held accountable for on the Day of Judgement is the prayer. If it is sound, then the rest of his deeds will be sound. And if it is deficient, then the rest of his deeds will be deficient.'",
    reference: "Sunan an-Nasa'i 465; also Abu Dawud 864, Sunan at-Tirmidhi 413",
  },
  {
    point: "It is a direct connection to Allah",
    detail:
      "When you recite Al-Fatihah, Allah responds to every verse. The Prophet (peace be upon him) said: 'Allah the Exalted says: I have divided the prayer between Myself and My servant into two halves, and My servant shall have what he asks for.'",
    reference: "Sahih Muslim 395",
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
    reference: "Sahih al-Bukhari 528, Sahih Muslim 667",
  },
  {
    point: "Abandoning it is the line between faith and disbelief",
    detail:
      "The Prophet (peace be upon him) said: 'The covenant between us and them is the prayer; whoever abandons it has disbelieved.' This shows the gravity of salah in Islam — it is not optional.",
    reference: "Sunan at-Tirmidhi 2621 (from Buraydah); see also Sahih Muslim 82 with similar meaning",
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

interface AladhanResponse {
  data: {
    timings: PrayerTimings;
    date: {
      hijri: HijriDate;
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

const CALCULATION_METHODS = [
  { value: 2, label: "ISNA" },
  { value: 3, label: "Muslim World League" },
  { value: 4, label: "Umm Al-Qura" },
  { value: 5, label: "Egyptian General Authority" },
  { value: 9, label: "Kuwait" },
  { value: 10, label: "Qatar" },
  { value: 11, label: "Singapore" },
  { value: 16, label: "Dubai" },
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

function getNextPrayerInfo(timings: PrayerTimings): { key: string; timeUntil: number } | null {
  const now = new Date();
  const prayerKeys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
  for (const key of prayerKeys) {
    const raw = timings[key];
    if (!raw) continue;
    const clean = raw.replace(/\s*\(.*\)/, "");
    const prayerTime = parseTime(clean);
    if (prayerTime > now) {
      return { key, timeUntil: prayerTime.getTime() - now.getTime() };
    }
  }
  const fajrRaw = timings.Fajr;
  if (!fajrRaw) return null;
  const clean = fajrRaw.replace(/\s*\(.*\)/, "");
  const tomorrow = parseTime(clean);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { key: "Fajr", timeUntil: tomorrow.getTime() - now.getTime() };
}

function formatDisplayTime(raw: string) {
  const clean = raw.replace(/\s*\(.*\)/, "");
  const [h, m] = clean.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* ───────────────────────── sections ───────────────────────── */

const sections = [
  { key: "times", label: "Prayer Times" },
  { key: "intro", label: "What is Salah?" },
  { key: "importance", label: "Why It Matters" },
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
        <div className="flex items-center justify-between mb-4">
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
                  <p className="text-xs text-themed-muted/60 mt-1 italic">The Prophet (peace be upon him) said: &ldquo;The night prayer is two by two&rdquo; (Sahih al-Bukhari 990)</p>
                )}
              </>
            )}
          </div>
        </ContentCard>
      </div>

      {/* Sources */}
      <div className="mt-4">
        <ContentCard delay={0.15}>
          <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-gold" />
            Sources &amp; References
          </h4>
          <ul className="space-y-1.5">
            {[
              "Sifat Salat an-Nabi, al-Albani — Comprehensive description of the Prophet's prayer",
              "Sahih al-Bukhari 757 — On the obligation of Al-Fatihah in every rak'ah",
              "Sahih Muslim 395 — Allah's response to each verse of Al-Fatihah",
              "Sahih Muslim 482 — The closest a servant is to Allah is in sujud",
              "Sahih al-Bukhari 835 — Tashahhud and Salawat narrated by Ibn Mas'ud",
            ].map((source) => (
              <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                <span className="text-gold/40 mt-0.5">&#8226;</span>
                {source}
              </li>
            ))}
          </ul>
        </ContentCard>
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
        <div className="rounded-lg p-4 mb-4 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
          <div className="grid grid-cols-2 gap-4">
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
            <p className="text-xs text-themed-muted mt-2">{prayer.verse.ref}</p>
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
            <p className="text-xs text-themed-muted mt-2">{prayer.hadith.ref}</p>
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

/* ───────────────────────── page ───────────────────────── */

function SalahContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "times");
  const [activePrayer, setActivePrayer] = useState("fajr");
  const [activeVoluntary, setActiveVoluntary] = useState("tahajjud");
  const [showGuide, setShowGuide] = useState(false);
  const [search, setSearch] = useState("");

  /* ── Prayer Times state ── */
  const [ptTimings, setPtTimings] = useState<PrayerTimings | null>(null);
  const [ptHijri, setPtHijri] = useState<HijriDate | null>(null);
  const [ptCity, setPtCity] = useState("");
  const [ptCountry, setPtCountry] = useState("");
  const [ptDisplayLocation, setPtDisplayLocation] = useState("");
  const [ptMethod, setPtMethod] = useState(2);
  const [ptLoading, setPtLoading] = useState(true);
  const [ptError, setPtError] = useState("");
  const [ptCountdown, setPtCountdown] = useState("");
  const [ptNextPrayerKey, setPtNextPrayerKey] = useState("");
  const [ptSearchCity, setPtSearchCity] = useState("");
  const [ptSearchCountry, setPtSearchCountry] = useState("");
  const [ptShowManualInput, setPtShowManualInput] = useState(false);
  const [ptLocating, setPtLocating] = useState(false);
  const ptIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ptFetched = useRef(false);

  const ptFetchTimes = useCallback(
    async (c: string, co: string, m: number) => {
      setPtLoading(true);
      setPtError("");
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(c)}&country=${encodeURIComponent(co)}&method=${m}`
        );
        if (!res.ok) throw new Error("Failed to fetch prayer times");
        const data: AladhanResponse = await res.json();
        setPtTimings(data.data.timings);
        setPtHijri(data.data.date.hijri);
        setPtDisplayLocation(`${c}, ${co}`);
      } catch {
        setPtError("Could not load prayer times. Please try a different city.");
      } finally {
        setPtLoading(false);
      }
    },
    []
  );

  const ptAutoLocate = useCallback(async () => {
    if (!navigator.geolocation) return;
    setPtLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}`
          );
          const geo = await geoRes.json();
          const c = geo.city || geo.locality || "Makkah";
          const co = geo.countryName || "Saudi Arabia";
          setPtCity(c);
          setPtCountry(co);
          ptFetchTimes(c, co, ptMethod);
        } catch {
          setPtCity("Makkah");
          setPtCountry("Saudi Arabia");
          ptFetchTimes("Makkah", "Saudi Arabia", ptMethod);
        }
        setPtLocating(false);
      },
      () => {
        setPtCity("Makkah");
        setPtCountry("Saudi Arabia");
        setPtShowManualInput(true);
        ptFetchTimes("Makkah", "Saudi Arabia", ptMethod);
        setPtLocating(false);
      },
      { timeout: 5000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ptFetchTimes]);

  useEffect(() => {
    if (ptFetched.current) return;
    ptFetched.current = true;
    if (!navigator.geolocation) {
      setPtCity("Makkah");
      setPtCountry("Saudi Arabia");
      setPtShowManualInput(true);
      ptFetchTimes("Makkah", "Saudi Arabia", ptMethod);
      return;
    }
    ptAutoLocate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ptTimings) return;
    function tick() {
      if (!ptTimings) return;
      const next = getNextPrayerInfo(ptTimings);
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
  }, [ptTimings]);

  const ptHandleMethodChange = (newMethod: number) => {
    setPtMethod(newMethod);
    if (ptCity && ptCountry) {
      ptFetchTimes(ptCity, ptCountry, newMethod);
    }
  };

  const ptHandleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptSearchCity.trim()) return;
    const c = ptSearchCity.trim();
    const co = ptSearchCountry.trim() || "auto";
    setPtCity(c);
    setPtCountry(co);
    ptFetchTimes(c, co, ptMethod);
    setPtShowManualInput(false);
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
  const filteredMatters = whyItMatters.filter(mattersMatches);

  const currentPrayer = activeSection === "voluntary"
    ? voluntaryPrayers.find((p) => p.id === activeVoluntary)!
    : prayers.find((p) => p.id === activePrayer)!;

  return (
    <div>
      <PageHeader
        title="Salah"
        titleAr="الصلاة"
        subtitle="The five daily prayers — the direct connection between the servant and Allah"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search prayers, steps, duas..." className="mb-6" />

      {/* Section navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.key}
            onClick={() => {
              setActiveSection(section.key);
              setShowGuide(false);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === section.key
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-themed-muted hover:text-themed border sidebar-border"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Prayer Times ─── */}
        {activeSection === "times" && (
          <motion.div
            key="times"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 max-w-4xl"
          >
            {/* Location & Hijri Date */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-wrap items-center justify-between gap-4"
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
              </div>
            </motion.div>

            {/* Manual Input */}
            {ptShowManualInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={ptHandleSearch} className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="City (e.g. London)"
                    value={ptSearchCity}
                    onChange={(e) => setPtSearchCity(e.target.value)}
                    className="flex-1 min-w-[140px] px-3 py-2 rounded-lg text-sm card-bg border sidebar-border text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/50"
                  />
                  <input
                    type="text"
                    placeholder="Country (optional)"
                    value={ptSearchCountry}
                    onChange={(e) => setPtSearchCountry(e.target.value)}
                    className="flex-1 min-w-[140px] px-3 py-2 rounded-lg text-sm card-bg border sidebar-border text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/30 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </motion.div>
            )}

            {/* Calculation Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <label className="text-xs text-themed-muted block mb-1.5">
                Calculation Method
              </label>
              <select
                value={ptMethod}
                onChange={(e) => ptHandleMethodChange(Number(e.target.value))}
                className="px-3 py-2 rounded-lg text-sm card-bg border sidebar-border text-themed focus:outline-none focus:border-[var(--color-gold)]/50 cursor-pointer"
              >
                {CALCULATION_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Next Prayer Countdown */}
            {ptNextPrayerKey && !ptLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="card-bg rounded-xl border sidebar-border p-5 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent pointer-events-none" />
                  <div className="relative">
                    <p className="text-xs text-themed-muted uppercase tracking-widest mb-1">
                      Next Prayer
                    </p>
                    <p className="text-gold text-lg font-semibold">{ptNextPrayerKey}</p>
                    <p className="text-2xl md:text-3xl font-mono text-themed mt-2 tracking-wider">
                      {ptCountdown}
                    </p>
                  </div>
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
              <div className="text-center py-6">
                <p className="text-xs text-themed-muted mb-3 uppercase tracking-wider">
                  The Quran
                </p>
                <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose mb-4">
                  إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَـٰبًۭا مَّوْقُوتًۭا
                </p>
                <p className="text-themed-muted italic mb-2 max-w-2xl mx-auto">
                  &ldquo;Indeed, prayer has been decreed upon the believers at specified times.&rdquo;
                </p>
                <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Quran 4:103
                </span>
              </div>
            </ContentCard>

            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">What is Salah?</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">Salah</span> (الصلاة) is the second pillar of Islam and the most important act of worship after the shahada. It is the direct, personal connection between the servant and Allah — prescribed five times daily at specific times from dawn to night.
                </p>
                <p>
                  Salah was prescribed during the Night Journey (al-Isra wal-Mi&apos;raj), when the Prophet Muhammad (peace be upon him) was taken up through the heavens. Originally fifty prayers were prescribed, then reduced to five in number but fifty in reward (Sahih al-Bukhari 3207, Sahih Muslim 162).
                </p>
                <p>
                  The prayer involves a sequence of positions — standing, bowing, prostrating, and sitting — each accompanied by specific recitations from the Quran and supplications. It begins with &apos;Allahu Akbar&apos; (takbiratul ihram) and ends with the taslim (saying &apos;As-salamu alaykum wa rahmatullah&apos; to each side).
                </p>
                <p>
                  Salah requires ritual purity (wudu), facing the qiblah (direction of the Ka&apos;bah in Makkah), covering the awrah, and praying within the appointed time. It is not merely a ritual — the Prophet (peace be upon him) said it is a conversation with Allah. When you recite Al-Fatihah, Allah responds to each verse (Sahih Muslim 395).
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
            <ContentCard delay={0.35}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Sahih al-Bukhari 3207, Sahih Muslim 162 — The prescription of prayer during al-Isra wal-Mi'raj",
                  "Sahih Muslim 395 — Allah's response to Al-Fatihah",
                  "Sifat Salat an-Nabi, al-Albani — The Prophet's prayer described",
                  "Sharh Umdatul Ahkam, Ibn Uthaymeen — Rulings on prayer",
                ].map((source) => (
                  <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    {source}
                  </li>
                ))}
              </ul>
            </ContentCard>
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
            <ContentCard>
              <div className="text-center py-4">
                <p className="text-lg font-arabic text-gold leading-loose mb-3">
                  إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ ۗ وَلَذِكْرُ ٱللَّهِ أَكْبَرُ
                </p>
                <p className="text-themed-muted italic">
                  &ldquo;Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 29:45</p>
              </div>
            </ContentCard>

            {filteredMatters.map((item, i) => (
              <ContentCard key={i} delay={0.05 + i * 0.05}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold font-semibold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-themed mb-1">{item.point}</h3>
                    <p className="text-themed-muted text-sm leading-relaxed">{item.detail}</p>
                    <p className="text-xs text-gold/60 mt-2">{item.reference}</p>
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
            <ContentCard delay={0.4}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Sunan an-Nasa'i 465 — Prayer is the first deed judged",
                  "Sahih Muslim 395 — Allah responds to Al-Fatihah",
                  "Sunan at-Tirmidhi 2621 — The covenant between us and them is prayer; Sahih Muslim 82 — similar meaning",
                  "Sahih al-Bukhari 528, Sahih Muslim 667 — The likeness of the five prayers",
                  "Tafsir Ibn Kathir — Commentary on Quran 29:45, 20:132",
                ].map((source) => (
                  <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    {source}
                  </li>
                ))}
              </ul>
            </ContentCard>
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
              <div className="flex gap-4 items-start">
                {/* Left side — vertical prayer pills */}
                <div className="flex flex-col gap-2 shrink-0">
                  {filteredPrayers.map((prayer) => (
                    <button
                      key={prayer.id}
                      onClick={() => {
                        setActivePrayer(prayer.id);
                        setShowGuide(false);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left flex items-center justify-between gap-3 ${
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
                <div className="flex-1 min-w-0">
                  <AnimatePresence mode="wait">
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
              <ContentCard delay={0.3} className="mt-8">
                <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                  <BookOpen size={14} className="text-gold" />
                  Sources &amp; References
                </h4>
                <ul className="space-y-1.5">
                  {[
                    "Sahih al-Bukhari 574 — Fajr & Asr: whoever prays the two cool prayers will enter Paradise",
                    "Sahih Muslim 725 — Fajr sunnah: better than the world and everything in it",
                    "Sunan at-Tirmidhi 428 — Dhuhr: reward for praying four rak'at before and after",
                    "Sunan an-Nasa'i 1370 — Jumu'ah: warning about missing three consecutive Friday prayers",
                    "Sahih al-Bukhari 552 — Asr: missing it is like losing family and property",
                    "Sahih Muslim 612 — Maghrib: timing of the sunset prayer",
                    "Sahih Muslim 728 — Rawatib sunnah: the 12 confirmed sunnah prayers",
                    "Sahih al-Bukhari 615 — Isha & Fajr: reward for attending them in congregation",
                    "Sahih al-Bukhari 998 — Witr: make the last of your night prayer Witr",
                    "Quran 17:78 — Establish prayer from the decline of the sun until the darkness of night",
                    "Quran 2:238 — Guard the prayers, especially the middle prayer (Asr)",
                    "Sifat Salat an-Nabi by Shaykh al-Albani — Description of the Prophet's prayer",
                  ].map((source) => (
                    <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                      <span className="text-gold/40 mt-0.5">&#8226;</span>
                      {source}
                    </li>
                  ))}
                </ul>
              </ContentCard>
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
              <div className="flex gap-4 items-start">
                {/* Left side — vertical prayer pills */}
                <div className="flex flex-col gap-2 shrink-0">
                  {filteredVoluntary.map((prayer) => (
                    <button
                      key={prayer.id}
                      onClick={() => {
                        setActiveVoluntary(prayer.id);
                        setShowGuide(false);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left flex items-center justify-between gap-3 ${
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
                <div className="flex-1 min-w-0">
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
              <ContentCard delay={0.3} className="mt-8">
                <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                  <BookOpen size={14} className="text-sky-400" />
                  Sources &amp; References
                </h4>
                <ul className="space-y-1.5">
                  {[
                    "Sahih al-Bukhari 1145, 1147 — Tahajjud: Allah descends to the lowest heaven; the Prophet's night prayer practice",
                    "Sahih Muslim 758, 1163 — Tahajjud: night prayer is the best prayer after the obligatory ones",
                    "Sahih Muslim 720 — Duha: two rak'at of Duha suffice as charity for every joint",
                    "Sunan at-Tirmidhi 586 — Duha/Ishraq: reward like Hajj and Umrah for praying after sunrise (graded da'if by some; widely practiced)",
                    "Sunan Abu Dawud 1521; Sunan at-Tirmidhi 406 — Tawbah: forgiveness for praying 2 rak'at after sinning",
                    "Sahih al-Bukhari 1166 — Istikhara: the du'a and method taught by the Prophet (peace be upon him)",
                    "Sahih al-Bukhari 2013 — Tarawih: Aisha's narration of the Prophet's night prayer in Ramadan",
                    "Sahih al-Bukhari 37; Sahih Muslim 759 — Tarawih: forgiveness for standing in prayer during Ramadan",
                    "Sahih al-Bukhari 956 — Eid: the Prophet's practice of praying in the musalla",
                    "Sahih al-Bukhari 1325; Sahih Muslim 945 — Janazah: reward for attending the funeral prayer",
                    "Fiqh us-Sunnah by Sayyid Sabiq — General reference for voluntary prayer rulings",
                    "Sifat Salat an-Nabi by Shaykh al-Albani — Description of the Prophet's prayer",
                  ].map((source) => (
                    <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                      <span className="text-sky-400/40 mt-0.5">&#8226;</span>
                      {source}
                    </li>
                  ))}
                </ul>
              </ContentCard>
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
