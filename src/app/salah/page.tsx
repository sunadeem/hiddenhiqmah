"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import { textMatch } from "@/lib/search";
import ContentCard from "@/components/ContentCard";
import HadithRefText from "@/components/HadithRefText";
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
      ref: "Bukhari 2:50",
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
      "Maghrib has a narrow window — it should be prayed soon after sunset. The 3 fard rak'at are unique: the first 2 have audible recitation, and the 3rd is silent with only Al-Fatihah. The 2 sunnah rak'at after Maghrib are part of the 12 confirmed rawatib sunnah (Muslim 5:208).",
    description:
      "The sunset prayer — prayed immediately after the sun has fully set below the horizon. Its time ends when the red twilight (shafaq) disappears from the sky.",
    hadith: {
      text: "The time for Maghrib prayer is when the sun sets, as long as the twilight has not disappeared.",
      ref: "Muslim 2:79",
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
      "After the 2 sunnah, the Witr prayer is highly recommended — the Prophet (peace be upon him) never left it, even while traveling. Witr is an odd number of rak'at (most commonly 1 or 3). He said: 'Make the last of your night prayer Witr' (Bukhari 7:9). The first 2 rak'at of Isha fard are recited aloud, the last 2 silently.",
    description:
      "The night prayer — prayed after the disappearance of the red/white twilight. Its preferred time extends until the middle of the night, though it remains valid until Fajr.",
    hadith: {
      text: "If the people knew what reward is in the Fajr and Isha prayers, they would come to them even if they had to crawl.",
      ref: "Bukhari 3:13",
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
      "Tahajjud is not obligatory but is the most virtuous voluntary prayer. It is prayed in sets of 2 rak'at, typically 2 to 12 rak'at, followed by Witr. The Prophet (peace be upon him) would regularly pray 11 rak'at at night (Bukhari 9:50). Recitation is done aloud or quietly — both are permissible. The last third of the night is when Allah descends to the lowest heaven and says: 'Who is calling upon Me, that I may answer him?' (Bukhari 9:29, Muslim 6:183).",
    description:
      "The voluntary night prayer — prayed after sleeping and waking in the latter part of the night. It is a deeply personal act of devotion, praised extensively in the Quran and Sunnah. Allah described the people of Tahajjud as those whose 'sides forsake their beds' in worship.",
    verse: {
      arabic: "وَمِنَ ٱلَّيْلِ فَتَهَجَّدْ بِهِۦ نَافِلَةًۭ لَّكَ عَسَىٰٓ أَن يَبْعَثَكَ رَبُّكَ مَقَامًۭا مَّحْمُودًۭا",
      text: "And in a part of the night, pray Tahajjud as an additional prayer for you. It may be that your Lord will raise you to a praised station.",
      ref: "Quran 17:79",
    },
    hadith: {
      text: "The best prayer after the obligatory prayers is the night prayer (Tahajjud).",
      ref: "Muslim 5:3",
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
      "Duha can be prayed as few as 2 rak'at and up to 12. The most common is 2–4. When prayed shortly after sunrise, it is also called Ishraq. The Prophet (peace be upon him) said: 'In the morning, charity is due on every joint of the body. Every tasbeeh is charity, every tahmeed is charity, every tahleel is charity... and two rak'at of Duha suffice for all of that' (Muslim 5:120).",
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
      "Istikhara is 2 rak'at of voluntary prayer, followed by the specific du'a of Istikhara in which you ask Allah to guide you toward what is best. It is not about seeing a dream or a sign — rather, it is entrusting the decision to Allah and proceeding with what feels right. The Prophet (peace be upon him) taught this for all matters, saying: 'If any of you is concerned about a decision, let him pray two rak'at of non-obligatory prayer...' (Bukhari 9:29). The du'a includes: 'O Allah, if You know this matter to be good for me... then decree it for me.'",
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
      "Tarawih is prayed in sets of 2 rak'at. The number varies — 8 rak'at (the practice of Aisha's narration, Bukhari 24:6) or 20 rak'at (the practice established by Umar ibn al-Khattab in congregation). Both are valid. The entire Quran is typically recited over the course of Ramadan in Tarawih at the masjid. It is concluded with Witr prayer.",
    description:
      "The Ramadan night prayer — a special congregational prayer prayed every night during the month of Ramadan. The word 'tarawih' means 'rest,' as worshippers would rest between every 4 rak'at due to its length.",
    hadith: {
      text: "Whoever stands in prayer during Ramadan out of sincere faith and seeking reward, his previous sins will be forgiven.",
      ref: "Bukhari 2:30; Muslim 3:81",
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
      ref: "Bukhari 6:8",
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
      "Janazah prayer has a unique structure: 4 takbirat with no ruku' or sujud. After the 1st takbir: recite Al-Fatihah. After the 2nd: recite the Salawat al-Ibrahimiyyah. After the 3rd: make du'a for the deceased. After the 4th: make a brief du'a, then give one taslim to the right. It is a fard kifayah — a communal obligation (if some perform it, the obligation is lifted from the rest). The Prophet (peace be upon him) said: 'Whoever attends the funeral until the prayer is offered will have one qirat of reward' (Bukhari 10:13).",
    description:
      "The funeral prayer — a unique prayer performed for a deceased Muslim. It is a communal obligation (fard kifayah) and differs from all other prayers in that it has no bowing or prostration, only four standing takbirat with specific recitations between them.",
    hadith: {
      text: "Whoever attends the funeral until the prayer is offered will have one qirat of reward, and whoever stays until the burial will have two qirat. It was asked: 'What are the two qirat?' He said: 'Like two great mountains.'",
      ref: "Bukhari 19:28; Muslim 4:107",
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
    reference: "Muslim 1:300",
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
    reference: "Bukhari 2:7, Muslim 2:133",
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
          note: "Bukhari 32:2",
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
          note: "Muslim 1:151",
        },
        {
          title: "The mark of the believers",
          detail:
            "The Prophet ﷺ said that on the Day of Judgement he will recognize his ummah by the traces of wudu — their faces, hands, and feet will shine with light (ghurr and muhajjalin). He encouraged the believers to extend the washing of the face and limbs beyond the minimum to increase this light.",
          note: "Muslim 1:153",
        },
      ],
      source: "Quran 5:6; Bukhari 32:2; Muslim 2:1, 1:153",
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
        ref: "Muslim 15:159",
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
          note: "Muslim 53:31",
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
          note: "Bukhari 4:25; Muslim 1:132",
        },
      ],
      source: "Bukhari 4:25; Muslim 1:132, 1:140; Abu Dawud 1:101; Tirmidhi 1:55",
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
          note: "Bukhari 94:15; Muslim 2:59",
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
      source: "Bukhari 4:25, 11:12; Muslim 1:158, 1:174; Abu Dawud 1:101, 1:142; Tirmidhi 1:31, 1:38; Ibn Majah 1:133, 1:159",
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
          note: "Abu Dawud 1:200; Muslim 1:283",
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
          note: "Muslim 1:267",
        },
      ],
      source: "Bukhari 4:1, 4:3; Muslim 1:267, 1:283; Abu Dawud 1:60, 1:200; Tirmidhi 1:82",
    },
  },
];

/* ───────────────────────── sections ───────────────────────── */

const sections = [
  { key: "times", label: "Prayer Times" },
  { key: "intro", label: "What is Salah?" },
  { key: "importance", label: "Why It Matters" },
  { key: "wudu", label: "Wudu" },
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
        <ContentCard delay={0.15}>
          <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-gold" />
            Sources &amp; References
          </h4>
          <ul className="space-y-1.5">
            {[
              "Sifat Salat an-Nabi, al-Albani — Comprehensive description of the Prophet's prayer",
              "Bukhari 19:26 — On the obligation of Al-Fatihah in every rak'ah",
              "Muslim 1:300 — Allah's response to each verse of Al-Fatihah",
              "Muslim 1:388 — The closest a servant is to Allah is in sujud",
              "Bukhari 19:45 — Tashahhud and Salawat narrated by Ibn Mas'ud",
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

/* ───────────────────────── page ───────────────────────── */

function SalahContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "times");
  const [activePrayer, setActivePrayer] = useState("fajr");
  const [activeVoluntary, setActiveVoluntary] = useState("tahajjud");
  const [activeWudu, setActiveWudu] = useState("overview");
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
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm card-bg border sidebar-border text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/50"
                  />
                  <input
                    type="text"
                    placeholder="Country (optional)"
                    value={ptSearchCountry}
                    onChange={(e) => setPtSearchCountry(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm card-bg border sidebar-border text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/50"
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
                <div className="card-bg rounded-xl border sidebar-border p-4 sm:p-5 text-center relative overflow-hidden">
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
              <div className="text-center py-4 sm:py-6">
                <p className="text-xs text-themed-muted mb-3 uppercase tracking-wider">
                  The Quran
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-arabic text-gold leading-loose mb-4">
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
                  Salah was prescribed during the Night Journey (al-Isra wal-Mi&apos;raj), when the Prophet Muhammad (peace be upon him) was taken up through the heavens. Originally fifty prayers were prescribed, then reduced to five in number but fifty in reward (Bukhari 19:45, Muslim 1:321).
                </p>
                <p>
                  The prayer involves a sequence of positions — standing, bowing, prostrating, and sitting — each accompanied by specific recitations from the Quran and supplications. It begins with &apos;Allahu Akbar&apos; (takbiratul ihram) and ends with the taslim (saying &apos;As-salamu alaykum wa rahmatullah&apos; to each side).
                </p>
                <p>
                  Salah requires ritual purity (wudu), facing the qiblah (direction of the Ka&apos;bah in Makkah), covering the awrah, and praying within the appointed time. It is not merely a ritual — the Prophet (peace be upon him) said it is a conversation with Allah. When you recite Al-Fatihah, Allah responds to each verse (Muslim 1:300).
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
                  "Bukhari 31:6, Muslim 1:321 — The prescription of prayer during al-Isra wal-Mi'raj",
                  "Muslim 1:300 — Allah's response to Al-Fatihah",
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
            <ContentCard delay={0.4}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Nasai 5:18 — Prayer is the first deed judged",
                  "Muslim 1:300 — Allah responds to Al-Fatihah",
                  "Tirmidhi 40:16 — The covenant between us and them is prayer; Muslim 1:12 — similar meaning",
                  "Bukhari 2:7, Muslim 2:133 — The likeness of the five prayers",
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
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left flex items-center gap-2 ${
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
            <ContentCard delay={0.3} className="mt-8">
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Quran 5:6 — The verse of wudu, detailing the obligatory acts of purification",
                  "Bukhari 1:1, 90:2 — Niyyah, nullifiers, the Prophet's ﷺ wudu, right-side preference, miswak",
                  "Muslim 2:1, 1:283 — Cleanliness, two rak'at after wudu, dua, sins washed away, ghurr and muhajjalin, camel meat",
                  "Abu Dawud 1:60, 1:200 — Passing wind, Bismillah, ears, washing three times, interlacing fingers, deep sleep",
                  "Tirmidhi 1:31, 1:82 — Beard, ears are part of head, interlacing toes, dua after wudu, touching private parts",
                  "Ibn Majah 1:133, 1:159 — Bismillah obligation discussion, moderation with water",
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
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Left side — prayer pills (horizontal scroll on mobile, vertical on md+) */}
                <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
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
                <div className="flex-1 min-w-0 w-full">
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
                    "Bukhari 9:50 — Fajr & Asr: whoever prays the two cool prayers will enter Paradise",
                    "Muslim 5:271 — Fajr sunnah: better than the world and everything in it",
                    "Tirmidhi 2:281 — Dhuhr: reward for praying four rak'at before and after",
                    "Nasai 14:6 — Jumu'ah: warning about missing three consecutive Friday prayers",
                    "Bukhari 2:29 — Asr: missing it is like losing family and property",
                    "Muslim 2:79 — Maghrib: timing of the sunset prayer",
                    "Muslim 3:50 — Rawatib sunnah: the 12 confirmed sunnah prayers",
                    "Bukhari 3:13 — Isha & Fajr: reward for attending them in congregation",
                    "Bukhari 7:9 — Witr: make the last of your night prayer Witr",
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
              <ContentCard delay={0.3} className="mt-8">
                <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                  <BookOpen size={14} className="text-sky-400" />
                  Sources &amp; References
                </h4>
                <ul className="space-y-1.5">
                  {[
                    "Bukhari 13:8, 19:28 — Tahajjud: Allah descends to the lowest heaven; the Prophet's night prayer practice",
                    "Muslim 6:187, 5:3 — Tahajjud: night prayer is the best prayer after the obligatory ones",
                    "Muslim 3:42 — Duha: two rak'at of Duha suffice as charity for every joint",
                    "Tirmidhi 6:43 — Duha/Ishraq: reward like Hajj and Umrah for praying after sunrise (graded da'if by some; widely practiced)",
                    "Abu Dawud 8:106; Tirmidhi 2:259 — Tawbah: forgiveness for praying 2 rak'at after sinning",
                    "Bukhari 19:45 — Istikhara: the du'a and method taught by the Prophet (peace be upon him)",
                    "Bukhari 24:6 — Tarawih: Aisha's narration of the Prophet's night prayer in Ramadan",
                    "Bukhari 2:30; Muslim 3:81 — Tarawih: forgiveness for standing in prayer during Ramadan",
                    "Bukhari 6:8 — Eid: the Prophet's practice of praying in the musalla",
                    "Bukhari 19:45; Muslim 4:107 — Janazah: reward for attending the funeral prayer",
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
