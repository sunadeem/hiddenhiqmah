"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import BookmarkButton from "@hidden-hiqmah/ui/components/BookmarkButton";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import { ArrowLeft, Sun, HandHeart, Utensils, Plane, Home, Shield, Heart, Brain, Stethoscope, Users, BookOpen, CloudRain, Bed, Sparkles, Hand, Moon, HeartCrack, Handshake } from "lucide-react";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import { getBookmarks, addBookmark, removeBookmark } from "@hidden-hiqmah/ui/lib/storage";

type Dua = {
  /** Stable slug — bookmark ids and ?d= deep links depend on it; never renumber. */
  id: string;
  tags: string[];
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  when: string;
  repeat?: string;
  virtue?: string;
};

/** Landing-grid sections — grouped so the growing grid stays scannable on mobile. */
const sectionOrder = ["Start Here", "Daily Rhythm", "Life Moments", "Heart & Hardship"] as const;

const categories = [
  { key: "powerful", section: "Start Here", label: "Most Powerful", icon: Sparkles, description: "Duas carrying explicit promises in the Sahih collections" },
  { key: "making-dua", section: "Start Here", label: "Making Dua", icon: Hand, description: "How to supplicate, and the times dua is answered" },
  { key: "morning-evening", section: "Daily Rhythm", label: "Morning & Evening", icon: Sun, description: "Daily adhkar to open and close your day" },
  { key: "prayer", section: "Daily Rhythm", label: "Prayer", icon: HandHeart, description: "Before, during, and after the prayer" },
  { key: "sleep", section: "Daily Rhythm", label: "Sleep", icon: Bed, description: "Before sleeping, upon waking, and after bad dreams" },
  { key: "eating", section: "Daily Rhythm", label: "Eating & Drinking", icon: Utensils, description: "Before and after meals, and when breaking the fast" },
  { key: "home-mosque", section: "Daily Rhythm", label: "Home, Mosque & Wudu", icon: Home, description: "Entering and leaving the home, mosque, bathroom, and ablution" },
  { key: "travel", section: "Life Moments", label: "Travel", icon: Plane, description: "Setting out, returning, and bidding farewell" },
  { key: "ramadan", section: "Life Moments", label: "Ramadan & Fasting", icon: Moon, description: "Breaking the fast and the Night of Decree" },
  { key: "parents-family", section: "Life Moments", label: "Parents & Family", icon: Users, description: "For parents, spouses, and children" },
  { key: "death-loss", section: "Life Moments", label: "Death & Loss", icon: HeartCrack, description: "The funeral prayer, visiting graves, and bearing loss" },
  { key: "everyday-social", section: "Life Moments", label: "Everyday & Social", icon: Handshake, description: "Sneezing, anger, new clothes, and the new moon" },
  { key: "rain-weather", section: "Life Moments", label: "Rain & Weather", icon: CloudRain, description: "When it rains and when strong winds blow" },
  { key: "protection", section: "Heart & Hardship", label: "Protection", icon: Shield, description: "Seeking refuge from harm, evil, and the evil eye" },
  { key: "forgiveness", section: "Heart & Hardship", label: "Forgiveness", icon: Heart, description: "Istighfar and turning back to Allah in repentance" },
  { key: "distress", section: "Heart & Hardship", label: "Distress & Anxiety", icon: Brain, description: "For worry, grief, hardship, and calamity" },
  { key: "illness", section: "Heart & Hardship", label: "Illness & Healing", icon: Stethoscope, description: "For the sick and those who visit them" },
  { key: "guidance", section: "Heart & Hardship", label: "Guidance & Knowledge", icon: BookOpen, description: "Seeking guidance, clarity, and beneficial knowledge" },
];

const duas: Dua[] = [
  // === MORNING & EVENING ===
  {
    id: "morning-remembrance",
    tags: ["morning-evening"],
    title: "Morning Remembrance",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: "We have reached the morning and at this very time the kingdom belongs to Allah. All praise is due to Allah. None has the right to be worshipped except Allah alone, without any partner. To Him belongs the dominion, to Him belongs all praise, and He is over all things capable.",
    source: "Muslim 48:100",
    when: "Every morning",
  },
  {
    id: "evening-remembrance",
    tags: ["morning-evening"],
    title: "Evening Remembrance",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: "We have reached the evening and at this very time the kingdom belongs to Allah. All praise is due to Allah. None has the right to be worshipped except Allah alone, without any partner. To Him belongs the dominion, to Him belongs all praise, and He is over all things capable.",
    source: "Muslim 48:100",
    when: "Every evening",
  },
  {
    id: "sayyid-al-istighfar",
    tags: ["morning-evening", "forgiveness", "powerful"],
    title: "Sayyid al-Istighfar (Master of Seeking Forgiveness)",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bi ni'matika 'alayya, wa abu'u bi dhanbi, faghfir li fa innahu la yaghfirudh-dhunuba illa anta",
    translation: "O Allah, You are my Lord. There is no god but You. You created me and I am Your servant, and I hold to Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your blessings upon me and I acknowledge my sin. So forgive me, for none forgives sins but You.",
    source: "Bukhari 80:3",
    when: "Morning and evening",
    virtue: "Whoever says this during the day with firm belief and dies that day before evening, he will be among the people of Paradise. Whoever says it at night with firm belief and dies before morning, he will be among the people of Paradise.",
  },
  {
    id: "protection-from-all-harm",
    tags: ["morning-evening", "protection"],
    title: "Protection from All Harm",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim",
    translation: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing.",
    source: "Abu Dawud 43:316, Tirmidhi 48:19",
    when: "Morning and evening",
    repeat: "3 times",
    virtue: "Nothing will harm the one who says this three times in the morning and three times in the evening.",
  },
  {
    id: "contentment-with-allah",
    tags: ["morning-evening"],
    title: "Contentment with Allah",
    arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    transliteration: "Raditu billahi rabba, wa bil-islami deena, wa bi Muhammadin sallallahu 'alayhi wa sallama nabiyya",
    translation: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet.",
    source: "Abu Dawud 43:300, Tirmidhi 48:20",
    when: "Morning and evening",
    repeat: "3 times",
    virtue: "It is a right upon Allah to please whoever says this three times every morning and evening.",
  },
  {
    id: "subhanallah-wa-bihamdihi",
    tags: ["morning-evening", "forgiveness", "powerful"],
    title: "SubhanAllah wa Bihamdihi",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllahi wa bihamdihi",
    translation: "Glory and praise be to Allah.",
    source: "Muslim 48:39",
    when: "Morning and evening",
    repeat: "100 times",
    virtue: "Whoever says this one hundred times a day, his sins will be forgiven even if they were as much as the foam of the sea.",
  },
  {
    id: "tahleel",
    tags: ["morning-evening", "protection", "powerful"],
    title: "Tahleel (Declaration of Oneness)",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: "None has the right to be worshipped except Allah alone, without any partner. To Him belongs the dominion and to Him belongs all praise, and He is over all things capable.",
    source: "Bukhari 80:98, Muslim 48:38",
    when: "Morning and evening",
    repeat: "100 times",
    virtue: "Equivalent to freeing ten slaves, one hundred good deeds are recorded, one hundred sins are erased, and it is a protection from Shaytan until evening.",
  },
  {
    id: "seeking-refuge-from-evil-of-creation",
    tags: ["morning-evening", "protection"],
    title: "Seeking Refuge from Evil of Creation",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bi kalimatillahit-tammati min sharri ma khalaq",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    source: "Muslim 48:72",
    when: "Evening",
    repeat: "3 times",
    virtue: "Nothing will harm the one who says this three times in the evening.",
  },

  // === PRAYER ===
  {
    id: "after-the-adhan",
    tags: ["prayer", "powerful"],
    title: "After the Adhan",
    arabic: "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ",
    transliteration: "Allahumma rabba hadhihid-da'watit-tammah, was-salatil-qa'imah, ati Muhammadanil-waseelata wal-fadeelah, wab'athhu maqamam mahmudanil-ladhi wa'adtah",
    translation: "O Allah, Lord of this perfect call and established prayer, grant Muhammad the intercession and virtue, and raise him to the praised station that You have promised him.",
    source: "Bukhari 10:12",
    when: "After hearing the adhan",
    virtue: "My intercession will be granted to whoever says this after hearing the adhan.",
  },
  {
    id: "opening-supplication-in-prayer",
    tags: ["prayer"],
    title: "Opening Supplication in Prayer",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَٰهَ غَيْرُكَ",
    transliteration: "Subhanakallahumma wa bihamdika, wa tabarakasmuka, wa ta'ala jadduka, wa la ilaha ghayruk",
    translation: "Glory and praise be to You, O Allah. Blessed is Your name, exalted is Your majesty, and there is no god but You.",
    source: "Abu Dawud 2:385, Tirmidhi 2:95",
    when: "After opening takbeer in prayer",
  },
  {
    id: "between-the-two-prostrations",
    tags: ["prayer"],
    title: "Between the Two Prostrations",
    arabic: "رَبِّ اغْفِرْ لِي رَبِّ اغْفِرْ لِي",
    transliteration: "Rabbighfir li, Rabbighfir li",
    translation: "My Lord, forgive me. My Lord, forgive me.",
    source: "Abu Dawud 2:484, Ibn Majah 5:95",
    when: "While sitting between the two prostrations",
  },
  {
    id: "seeking-refuge-before-salam",
    tags: ["prayer"],
    title: "Seeking Refuge Before Salam",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ وَمِنْ عَذَابِ الْقَبْرِ وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
    transliteration: "Allahumma inni a'udhu bika min 'adhabi jahannam, wa min 'adhabil-qabr, wa min fitnatil-mahya wal-mamat, wa min sharri fitnatil-masihid-dajjal",
    translation: "O Allah, I seek refuge in You from the punishment of Hellfire, from the punishment of the grave, from the trials of life and death, and from the evil trial of the False Messiah.",
    source: "Muslim 5:164",
    when: "After the final tashahhud, before salam",
    virtue: "The Prophet (peace be upon him) used to seek refuge from these four things before giving salam.",
  },
  {
    id: "after-completing-prayer",
    tags: ["prayer"],
    title: "After Completing Prayer",
    arabic: "أَسْتَغْفِرُ اللَّهَ أَسْتَغْفِرُ اللَّهَ أَسْتَغْفِرُ اللَّهَ اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration: "Astaghfirullah, Astaghfirullah, Astaghfirullah. Allahumma antas-salam wa minkas-salam, tabarakta ya dhal-jalali wal-ikram",
    translation: "I seek the forgiveness of Allah (three times). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of Majesty and Honor.",
    source: "Muslim 5:171",
    when: "Immediately after salam",
  },
  {
    id: "tasbeeh-after-prayer",
    tags: ["prayer", "powerful"],
    title: "Tasbeeh After Prayer",
    arabic: "سُبْحَانَ اللَّهِ (٣٣) الْحَمْدُ لِلَّهِ (٣٣) اللَّهُ أَكْبَرُ (٣٣) لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "SubhanAllah (33x), Alhamdulillah (33x), Allahu Akbar (33x), La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: "Glory be to Allah (33x). Praise be to Allah (33x). Allah is the Greatest (33x). None has the right to be worshipped except Allah alone, with no partner. To Him belongs the dominion and praise, and He is over all things capable.",
    source: "Muslim 5:184",
    when: "After every obligatory prayer",
    virtue: "The sins of whoever says this after every prayer will be forgiven, even if they were as much as the foam of the sea.",
  },
  {
    id: "istikhara",
    tags: ["prayer"],
    title: "Istikhara (Seeking Guidance)",
    arabic: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ وَتَعْلَمُ وَلَا أَعْلَمُ وَأَنْتَ عَلَّامُ الْغُيُوبِ",
    transliteration: "Allahumma inni astakhiruka bi 'ilmika, wa astaqdiruka bi qudratika, wa as'aluka min fadlikal-'azeem, fa innaka taqdiru wa la aqdir, wa ta'lamu wa la a'lam, wa anta 'allamul-ghuyub",
    translation: "O Allah, I seek Your guidance by virtue of Your knowledge, and I seek ability by virtue of Your power, and I ask You of Your great bounty. You are capable and I am not. You know and I do not, and You are the Knower of the unseen.",
    source: "Bukhari 19:45",
    when: "When making a decision, after praying two rak'ahs",
  },

  // === SLEEP ===
  {
    id: "before-sleeping",
    tags: ["sleep"],
    title: "Before Sleeping",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    translation: "In Your name, O Allah, I die and I live.",
    source: "Bukhari 80:21",
    when: "Every night before sleep",
  },
  {
    id: "sleeping-on-your-right-side",
    tags: ["sleep"],
    title: "Sleeping on Your Right Side",
    arabic: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ وَفَوَّضْتُ أَمْرِي إِلَيْكَ وَوَجَّهْتُ وَجْهِي إِلَيْكَ وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ رَغْبَةً وَرَهْبَةً إِلَيْكَ لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ",
    transliteration: "Allahumma aslamtu nafsi ilayk, wa fawwadtu amri ilayk, wa wajjahtu wajhi ilayk, wa alja'tu zahri ilayk, raghbatan wa rahbatan ilayk, la malja'a wa la manja minka illa ilayk, amantu bi kitabikal-ladhi anzalt, wa bi nabiyyikal-ladhi arsalt",
    translation: "O Allah, I submit myself to You, I entrust my affairs to You, I turn my face to You, and I lean my back on You, out of hope and fear of You. There is no refuge and no escape from You except to You. I believe in Your Book which You have revealed and in Your Prophet whom You have sent.",
    source: "Bukhari 4:113, Muslim 48:75",
    when: "Before sleeping, lying on right side",
    virtue: "If you die that night, you will die upon the fitrah (natural disposition of Islam).",
  },
  {
    id: "upon-waking-up",
    tags: ["sleep"],
    title: "Upon Waking Up",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdulillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    translation: "All praise is due to Allah, who gave us life after causing us to die, and to Him is the resurrection.",
    source: "Bukhari 80:21",
    when: "Upon waking up",
  },
  {
    id: "after-a-bad-dream",
    tags: ["sleep"],
    title: "After a Bad Dream",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "A'udhu billahi minash-shaytanir-rajeem",
    translation: "I seek refuge in Allah from the accursed Shaytan.",
    source: "Muslim 42:4",
    when: "After a bad dream",
    virtue: "Spit lightly to your left three times, seek refuge in Allah from Shaytan, and turn to your other side. Do not tell anyone about the bad dream.",
  },

  // === EATING & DRINKING ===
  {
    id: "before-eating",
    tags: ["eating"],
    title: "Before Eating",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    translation: "In the name of Allah.",
    source: "Bukhari 70:4, Muslim 36:136",
    when: "Before every meal",
  },
  {
    id: "forgetting-to-say-bismillah",
    tags: ["eating"],
    title: "Forgetting to Say Bismillah",
    arabic: "بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ",
    transliteration: "Bismillahi awwalahu wa akhirah",
    translation: "In the name of Allah, at its beginning and at its end.",
    source: "Abu Dawud 28:32, Tirmidhi 25:75",
    when: "If you forget to say Bismillah before eating",
  },
  {
    id: "after-eating",
    tags: ["eating"],
    title: "After Eating",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Alhamdulillahil-ladhi at'amani hadha wa razaqaneehi min ghayri hawlin minni wa la quwwah",
    translation: "All praise is due to Allah who fed me this and provided it for me without any power or might from me.",
    source: "Abu Dawud 34:4, Tirmidhi 48:89",
    when: "After finishing a meal",
    virtue: "Whoever says this after eating, his past sins will be forgiven.",
  },
  {
    id: "dua-of-a-guest-for-the-host",
    tags: ["eating"],
    title: "Dua of a Guest for the Host",
    arabic: "اللَّهُمَّ بَارِكْ لَهُمْ فِيمَا رَزَقْتَهُمْ وَاغْفِرْ لَهُمْ وَارْحَمْهُمْ",
    transliteration: "Allahumma barik lahum feema razaqtahum, waghfir lahum, warhamhum",
    translation: "O Allah, bless them in what You have provided for them, forgive them, and have mercy upon them.",
    source: "Muslim 36:202",
    when: "When eating at someone's home",
  },
  {
    id: "when-breaking-fast",
    tags: ["ramadan", "eating"],
    title: "When Breaking Fast",
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
    transliteration: "Dhahabadh-dhama'u wabtallatil-'uruqu wa thabatal-ajru in sha'Allah",
    translation: "The thirst has gone, the veins have been moistened, and the reward is confirmed, if Allah wills.",
    source: "Abu Dawud 14:45",
    when: "When breaking the fast (iftar)",
  },

  // === TRAVEL ===
  {
    id: "dua-for-travel",
    tags: ["travel"],
    title: "Dua for Travel",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Subhanal-ladhi sakh-khara lana hadha wa ma kunna lahu muqrineen, wa inna ila Rabbina la munqalibun",
    translation: "Glory to Him who has subjected this to us, and we could never have it by our efforts. And to our Lord we will surely return.",
    source: "Quran 43:13-14, Muslim 15:479",
    when: "When beginning a journey",
  },
  {
    id: "returning-from-travel",
    tags: ["travel"],
    title: "Returning from Travel",
    arabic: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ",
    transliteration: "Ayibuna, ta'ibuna, 'abiduna, li Rabbina hamidun",
    translation: "We are returning, repenting, worshipping, and praising our Lord.",
    source: "Bukhari 26:22, Muslim 15:482",
    when: "When returning from a journey",
  },
  {
    id: "bidding-farewell-to-a-traveler",
    tags: ["travel"],
    title: "Bidding Farewell to a Traveler",
    arabic: "أَسْتَوْدِعُ اللَّهَ دِينَكَ وَأَمَانَتَكَ وَخَوَاتِيمَ عَمَلِكَ",
    transliteration: "Astawdi'ullaha deenaka wa amanataka wa khawateema 'amalik",
    translation: "I entrust to Allah your religion, your trust, and the conclusion of your deeds.",
    source: "Abu Dawud 15:124, Tirmidhi 48:74",
    when: "When saying farewell to someone traveling",
  },

  // === HOME & MOSQUE ===
  {
    id: "entering-the-home",
    tags: ["home-mosque"],
    title: "Entering the Home",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna",
    translation: "In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we rely.",
    source: "Abu Dawud 43:324",
    when: "When entering your home",
  },
  {
    id: "leaving-the-home",
    tags: ["home-mosque"],
    title: "Leaving the Home",
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Bismillah, tawakkaltu 'alAllah, wa la hawla wa la quwwata illa billah",
    translation: "In the name of Allah, I place my trust in Allah, and there is no power nor might except with Allah.",
    source: "Abu Dawud 43:323, Tirmidhi 48:57",
    when: "When leaving the home",
    virtue: "It will be said to him: You are guided, sufficed, and protected. And the devil will turn away from him.",
  },
  {
    id: "entering-the-mosque",
    tags: ["home-mosque"],
    title: "Entering the Mosque",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahummaf-tah li abwaba rahmatik",
    translation: "O Allah, open for me the gates of Your mercy.",
    source: "Muslim 6:82",
    when: "When entering the mosque",
  },
  {
    id: "leaving-the-mosque",
    tags: ["home-mosque"],
    title: "Leaving the Mosque",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allahumma inni as'aluka min fadlik",
    translation: "O Allah, I ask You for Your bounty.",
    source: "Muslim 6:82",
    when: "When leaving the mosque",
  },
  {
    id: "entering-the-bathroom",
    tags: ["home-mosque"],
    title: "Entering the Bathroom",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    transliteration: "Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith",
    translation: "O Allah, I seek refuge in You from the male and female evil jinn.",
    source: "Bukhari 4:8",
    when: "Before entering the bathroom",
  },
  {
    id: "leaving-the-bathroom",
    tags: ["home-mosque"],
    title: "Leaving the Bathroom",
    arabic: "غُفْرَانَكَ",
    transliteration: "Ghufranaka",
    translation: "I seek Your forgiveness.",
    source: "Abu Dawud 1:30, Tirmidhi 1:7",
    when: "After leaving the bathroom",
  },

  // === PROTECTION ===
  {
    id: "ayatul-kursi",
    tags: ["protection", "sleep", "prayer", "morning-evening", "powerful"],
    title: "Ayatul Kursi (The Verse of the Throne)",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "Allahu la ilaha illa huwal-hayyul-qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard, man dhal-ladhi yashfa'u 'indahu illa bi idhnih, ya'lamu ma bayna aydeehim wa ma khalfahum, wa la yuheetuna bi shay'in min 'ilmihi illa bima sha', wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifzuhuma, wa huwal-'aliyyul-'azeem",
    translation: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and the earth, and their preservation does not tire Him. And He is the Most High, the Most Great.",
    source: "Quran 2:255, Bukhari 59:84; Nasai, al-Sunan al-Kubra 9928",
    when: "After every obligatory prayer, before sleep, morning and evening",
    virtue: "Whoever recites Ayatul Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death. (Nasai, al-Sunan al-Kubra 9928; sahih — Ibn Hibban, al-Albani)",
  },
  {
    id: "the-three-quls",
    tags: ["protection", "morning-evening", "sleep", "powerful"],
    title: "The Three Quls (Al-Ikhlas, Al-Falaq, An-Nas)",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ﴿٤﴾ · قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِنْ شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾ · قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾",
    transliteration: "Qul huwa Allahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad. · Qul a'udhu bi rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-'uqad. Wa min sharri hasidin idha hasad. · Qul a'udhu bi rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.",
    translation: "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent. · Say: I seek refuge in the Lord of daybreak, from the evil of that which He created, from the evil of darkness when it settles, from the evil of the blowers in knots, and from the evil of an envier when he envies. · Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer, who whispers in the breasts of mankind, from among the jinn and mankind.",
    source: "Quran 112, 113, 114, Abu Dawud 43:310, Tirmidhi 48:206",
    when: "Morning and evening",
    repeat: "3 times each",
    virtue: "These three surahs will suffice you against everything.",
  },
  {
    id: "protection-for-children",
    tags: ["protection"],
    title: "Protection for Children",
    arabic: "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
    transliteration: "U'idhukuma bi kalimatillahit-tammati min kulli shaytanin wa hammah, wa min kulli 'aynin lammah",
    translation: "I seek protection for you both in the perfect words of Allah, from every devil and poisonous creature, and from every evil eye.",
    source: "Bukhari 60:45",
    when: "When seeking protection for children",
    virtue: "The Prophet (peace be upon him) used to seek protection for Hasan and Husayn with this dua.",
  },
  {
    id: "when-afraid-or-anxious-at-night",
    tags: ["protection"],
    title: "When Afraid or Anxious at Night",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ",
    transliteration: "A'udhu bi kalimatillahit-tammati min ghadabihi wa 'iqabihi wa sharri 'ibadihi wa min hamazatish-shayateeni wa an yahduroon",
    translation: "I seek refuge in the perfect words of Allah from His anger and His punishment, from the evil of His servants, and from the whisperings of the devils and from their presence.",
    source: "Abu Dawud 29:39, Tirmidhi 48:159",
    when: "When feeling afraid, especially at night",
  },

  // === FORGIVENESS ===
  {
    id: "seeking-forgiveness",
    tags: ["forgiveness"],
    title: "Seeking Forgiveness",
    arabic: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullahal-ladhi la ilaha illa huwal-hayyul-qayyumu wa atubu ilayh",
    translation: "I seek the forgiveness of Allah, there is no god but He, the Ever-Living, the Sustainer of existence, and I repent to Him.",
    source: "Abu Dawud 8:102, Tirmidhi 48:208",
    when: "Anytime, especially after sinning",
    virtue: "Whoever says this, Allah will forgive him even if he fled from battle.",
  },
  {
    id: "dua-of-adam",
    tags: ["forgiveness"],
    title: "Dua of Adam (peace be upon him)",
    arabic: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    transliteration: "Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakoonanna minal-khasireen",
    translation: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
    source: "Quran 7:23",
    when: "When seeking repentance",
  },
  {
    id: "kaffaratul-majlis",
    tags: ["forgiveness"],
    title: "Kaffaratul-Majlis (Expiation of the Gathering)",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
    transliteration: "Subhanaka Allahumma wa bihamdika, ash-hadu an la ilaha illa anta, astaghfiruka wa atubu ilayk",
    translation: "Glory and praise be to You, O Allah. I bear witness that there is no god but You. I seek Your forgiveness and I repent to You.",
    source: "Abu Dawud 43:87, Tirmidhi 48:64",
    when: "At the end of any gathering or meeting",
    virtue: "It serves as an expiation for any shortcomings that may have occurred during the gathering.",
  },
  {
    id: "comprehensive-istighfar",
    tags: ["forgiveness", "making-dua"],
    title: "Comprehensive Istighfar",
    arabic: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
    transliteration: "Allahumma inni zalamtu nafsi zulman katheeran wa la yaghfirudh-dhunuba illa anta, faghfir li maghfiratan min 'indika warhamni innaka antal-ghafurur-raheem",
    translation: "O Allah, I have greatly wronged myself and no one forgives sins but You. So grant me forgiveness from You and have mercy on me. Surely, You are the Oft-Forgiving, Most Merciful.",
    source: "Bukhari 10:227, Muslim 48:63",
    when: "In prayer and anytime",
    virtue: "The Prophet (peace be upon him) taught this to Abu Bakr to say in his prayer.",
  },

  // === DISTRESS & ANXIETY ===
  {
    id: "in-times-of-distress",
    tags: ["distress"],
    title: "In Times of Distress",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
    transliteration: "La ilaha illallahul-'azeemul-haleem, la ilaha illallahu rabbul-'arshil-'azeem, la ilaha illallahu rabbus-samawati wa rabbul-ardi wa rabbul-'arshil-kareem",
    translation: "There is no god but Allah, the Great, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.",
    source: "Bukhari 80:43, Muslim 48:113",
    when: "In moments of severe distress or difficulty",
  },
  {
    id: "dua-of-yunus",
    tags: ["distress", "forgiveness", "powerful", "making-dua"],
    title: "Dua of Yunus (peace be upon him)",
    arabic: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta, subhanaka inni kuntu minaz-zalimeen",
    translation: "There is no god but You, glory be to You. Indeed, I have been of the wrongdoers.",
    source: "Quran 21:87, Tirmidhi 48:136",
    when: "In times of distress and difficulty",
    virtue: "No Muslim supplicates with this except that Allah will answer his prayer.",
  },
  {
    id: "refuge-from-worry-and-grief",
    tags: ["distress"],
    title: "Refuge from Worry and Grief",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayni wa ghalabatir-rijal",
    translation: "O Allah, I seek refuge in You from worry and grief, from weakness and laziness, from miserliness and cowardice, from the burden of debt and being overpowered by men.",
    source: "Bukhari 80:66",
    when: "When feeling overwhelmed, anxious, or burdened",
  },
  {
    id: "when-a-calamity-strikes",
    tags: ["distress", "death-loss"],
    title: "When a Calamity Strikes",
    arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
    transliteration: "Inna lillahi wa inna ilayhi raji'un. Allahumma'jurni fi museebati wa akhlif li khayran minha",
    translation: "Indeed, to Allah we belong and to Him we shall return. O Allah, reward me in my calamity and replace it with something better.",
    source: "Muslim 11:5",
    when: "When afflicted by a calamity or loss",
    virtue: "Umm Salamah said this when her husband died, and Allah replaced him with the Prophet (peace be upon him).",
  },
  {
    id: "trusting-in-allah",
    tags: ["distress", "powerful"],
    title: "Trusting in Allah (Hasbunallah)",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal-wakeel",
    translation: "Allah is sufficient for us, and He is the best Disposer of affairs.",
    source: "Quran 3:173, Bukhari 65:85",
    when: "When facing a threat or overwhelming situation",
    virtue: "This was said by Ibrahim (peace be upon him) when he was thrown into the fire, and by Muhammad (peace be upon him) when told that the people had gathered against him.",
  },
  {
    id: "do-not-leave-me-to-myself",
    tags: ["distress"],
    title: "Do Not Leave Me to Myself",
    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    transliteration: "Ya Hayyu ya Qayyumu bi rahmatika astagheethu, aslih li sha'ni kullahu wa la takilni ila nafsi tarfata 'ayn",
    translation: "O Ever-Living, O Sustainer, in Your mercy I seek relief. Rectify all my affairs and do not leave me to myself for even the blink of an eye.",
    source: "Mustadrak al-Hakim 2000, graded Hasan",
    when: "In times of distress, especially feeling helpless",
  },

  // === ILLNESS & HEALING ===
  {
    id: "dua-for-healing",
    tags: ["illness"],
    title: "Dua for Healing (Ruqyah)",
    arabic: "أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا",
    transliteration: "Adhhibil-ba's, Rabban-nas, ishfi antash-shafi, la shifa'a illa shifa'uka, shifa'an la yughadiru saqama",
    translation: "Remove the affliction, O Lord of mankind. Heal, for You are the Healer. There is no healing except Your healing — a healing that leaves no illness behind.",
    source: "Bukhari 76:58, Muslim 39:73",
    when: "When visiting or supplicating for the sick",
  },
  {
    id: "placing-hand-on-pain",
    tags: ["illness"],
    title: "Placing Hand on Pain",
    arabic: "بِسْمِ اللَّهِ (ثَلاثًا) أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ",
    transliteration: "Bismillah (3x). A'udhu billahi wa qudratihi min sharri ma ajidu wa uhadhir",
    translation: "In the name of Allah (three times). I seek refuge in Allah and His power from the evil of what I feel and what I fear.",
    source: "Muslim 39:91",
    when: "Place your hand on the area of pain",
    repeat: "7 times",
  },
  {
    id: "visiting-the-sick",
    tags: ["illness"],
    title: "Visiting the Sick",
    arabic: "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ",
    transliteration: "La ba'sa, tahurun in sha'Allah",
    translation: "No worry, it is a purification, if Allah wills.",
    source: "Bukhari 75:16",
    when: "When visiting someone who is ill",
  },
  {
    id: "supplication-for-good-health",
    tags: ["illness", "morning-evening"],
    title: "Supplication for Good Health",
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي لَا إِلَٰهَ إِلَّا أَنْتَ",
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa anta",
    translation: "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight. There is no god but You.",
    source: "Abu Dawud 43:318",
    when: "Morning and evening",
    repeat: "3 times",
  },

  // === PARENTS & FAMILY ===
  {
    id: "dua-for-parents",
    tags: ["parents-family"],
    title: "Dua for Parents",
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbir-hamhuma kama rabbayani sagheera",
    translation: "My Lord, have mercy upon them as they brought me up when I was small.",
    source: "Quran 17:24",
    when: "Anytime, especially in prayer",
  },
  {
    id: "dua-for-righteous-offspring",
    tags: ["parents-family"],
    title: "Dua for Righteous Offspring",
    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yun, waj'alna lil-muttaqeena imama",
    translation: "Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us leaders of the righteous.",
    source: "Quran 25:74",
    when: "Anytime, especially when praying for family",
  },
  {
    id: "dua-for-establishing-prayer-in-family",
    tags: ["parents-family"],
    title: "Dua for Establishing Prayer in Family",
    arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    transliteration: "Rabbij-'alni muqeemas-salati wa min dhurriyyati, Rabbana wa taqabbal du'a",
    translation: "My Lord, make me an establisher of prayer, and from my descendants. Our Lord, and accept my supplication.",
    source: "Quran 14:40",
    when: "Anytime, a dua of Prophet Ibrahim (peace be upon him)",
  },
  {
    id: "wedding-marriage-dua",
    tags: ["parents-family"],
    title: "Wedding / Marriage Dua",
    arabic: "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
    transliteration: "Barakallahu laka wa baraka 'alayka wa jama'a baynakuma fi khayr",
    translation: "May Allah bless you, and shower His blessings upon you, and join you together in goodness.",
    source: "Abu Dawud 12:85, Tirmidhi 11:12",
    when: "When congratulating a newlywed",
  },

  // === GUIDANCE & KNOWLEDGE ===
  {
    id: "asking-for-increase-in-knowledge",
    tags: ["guidance"],
    title: "Asking for Increase in Knowledge",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma",
    translation: "My Lord, increase me in knowledge.",
    source: "Quran 20:114",
    when: "When seeking knowledge, before studying",
  },
  {
    id: "dua-of-musa",
    tags: ["guidance"],
    title: "Dua of Musa (peace be upon him)",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي",
    transliteration: "Rabbish-rahli sadri, wa yassir li amri, wahlul 'uqdatan min lisani, yafqahu qawli",
    translation: "My Lord, expand for me my chest, ease for me my task, and untie the knot from my tongue, that they may understand my speech.",
    source: "Quran 20:25-28",
    when: "Before presentations, teaching, or speaking",
  },
  {
    id: "seeking-beneficial-knowledge",
    tags: ["guidance"],
    title: "Seeking Beneficial Knowledge",
    arabic: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي وَزِدْنِي عِلْمًا",
    transliteration: "Allahumman-fa'ni bima 'allamtani, wa 'allimni ma yanfa'uni, wa zidni 'ilma",
    translation: "O Allah, benefit me with what You have taught me, teach me what will benefit me, and increase me in knowledge.",
    source: "Tirmidhi 48:230, Ibn Majah 0:251",
    when: "After prayer, when studying",
  },
  {
    id: "dua-for-guidance",
    tags: ["guidance"],
    title: "Dua for Guidance (Hidayah)",
    arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي",
    transliteration: "Allahummah-dini wa saddidni",
    translation: "O Allah, guide me and keep me on the right path.",
    source: "Muslim 48:65",
    when: "Anytime, especially when facing decisions",
  },

  // === RAIN & WEATHER ===
  {
    id: "when-it-rains",
    tags: ["rain-weather"],
    title: "When It Rains",
    arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا",
    transliteration: "Allahumma sayyiban nafi'a",
    translation: "O Allah, let it be a beneficial rain.",
    source: "Bukhari 15:27",
    when: "When it starts raining",
  },
  {
    id: "after-rain",
    tags: ["rain-weather"],
    title: "After Rain",
    arabic: "مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ",
    transliteration: "Mutirna bi fadlillahi wa rahmatihi",
    translation: "We have been given rain by the grace and mercy of Allah.",
    source: "Bukhari 10:238, Muslim 1:137",
    when: "After the rain",
  },
  {
    id: "during-strong-winds",
    tags: ["rain-weather"],
    title: "During Strong Winds",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا فِيهَا وَخَيْرَ مَا أُرْسِلَتْ بِهِ وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا وَشَرِّ مَا أُرْسِلَتْ بِهِ",
    transliteration: "Allahumma inni as'aluka khayraha wa khayra ma feeha wa khayra ma ursilat bihi, wa a'udhu bika min sharriha wa sharri ma feeha wa sharri ma ursilat bih",
    translation: "O Allah, I ask You for the good of it, the good within it, and the good it was sent with. And I seek refuge in You from the evil of it, the evil within it, and the evil it was sent with.",
    source: "Muslim 9:16",
    when: "When strong winds blow",
  },

  // === ADDED: in-prayer essentials, wudu, ramadan, death, everyday, and more ===
  {
    id: "tashahhud",
    tags: ["prayer"],
    title: "Tashahhud (At-Tahiyyat)",
    arabic: "التَّحِيَّاتُ لِلَّهِ، وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration: "At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu 'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu 'alayna wa 'ala 'ibadillahis-salihin. Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh",
    translation: "All greetings, prayers, and good things are due to Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger.",
    source: "Bukhari 10:225",
    when: "In the sitting (tashahhud) of every prayer",
    virtue: "The Prophet (peace be upon him) taught these exact words to be recited in the sitting of the prayer; they are a pillar of every salah.",
  },
  {
    id: "salawat-in-prayer",
    tags: ["prayer"],
    title: "Salawat Ibrahimiyyah (Blessings on the Prophet)",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidun Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidun Majid",
    translation: "O Allah, send Your grace upon Muhammad and upon the family of Muhammad, as You sent Your grace upon Ibrahim and upon the family of Ibrahim. You are indeed Praiseworthy, Glorious. O Allah, send Your blessings upon Muhammad and upon the family of Muhammad, as You sent Your blessings upon Ibrahim and upon the family of Ibrahim. You are indeed Praiseworthy, Glorious.",
    source: "Bukhari 60:44",
    when: "In the final tashahhud, after the testimony of faith",
    virtue: "The Companions asked the Prophet how to send blessings upon him, and he taught them these exact words.",
  },
  {
    id: "tasbih-ruku-sujud",
    tags: ["prayer"],
    title: "Glorifying Allah in Ruku and Sujud",
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ • سُبْحَانَ رَبِّيَ الأَعْلَى",
    transliteration: "In ruku': Subhana Rabbiyal-'Azeem. In sujud: Subhana Rabbiyal-A'la",
    translation: "Glory to my Lord, the Most Great (said while bowing). Glory to my Lord, the Most High (said while prostrating).",
    source: "Abu Dawud 2:496",
    when: "Said at least three times in each bowing (ruku') and each prostration (sujud)",
    repeat: "3 times",
  },
  {
    id: "responding-to-the-adhan",
    tags: ["prayer"],
    title: "Responding to the Adhan",
    arabic: "لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    translation: "There is no might nor power except with Allah.",
    source: "Muslim 4:14, Muslim 4:13",
    when: "Repeat each phrase after the muezzin; at 'Come to prayer' and 'Come to success', say this instead",
    virtue: "Whoever repeats the words of the muezzin sincerely from the heart enters Paradise. After the adhan, also send blessings upon the Prophet and ask Allah to grant him al-wasilah, and his intercession becomes due for you.",
  },
  {
    id: "qunut-al-witr",
    tags: ["prayer"],
    title: "Qunut al-Witr",
    arabic: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِي فِيمَنْ عَافَيْتَ وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ وَبَارِكْ لِي فِيمَا أَعْطَيْتَ وَقِنِي شَرَّ مَا قَضَيْتَ فَإِنَّكَ تَقْضِي وَلاَ يُقْضَى عَلَيْكَ وَإِنَّهُ لاَ يَذِلُّ مَنْ وَالَيْتَ تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ",
    transliteration: "Allahummah-dini fiman hadayt, wa 'afini fiman 'afayt, wa tawallani fiman tawallayt, wa barik li fima a'tayt, wa qini sharra ma qadayt, fa innaka taqdi wa la yuqda 'alayk, wa innahu la yadhillu man walayt, tabarakta Rabbana wa ta'alayt",
    translation: "O Allah, guide me among those You have guided, grant me well-being among those You have granted well-being, take me into Your care among those You have taken into Your care, bless me in what You have given, and protect me from the evil of what You have decreed. For You decree and none can decree over You. He whom You befriend is never humiliated. Blessed are You, our Lord, and Exalted.",
    source: "Abu Dawud 8:10, Tirmidhi 3:12",
    when: "In the qunut of the witr prayer (see the Prayer guide on Salah for how witr is prayed)",
    virtue: "The Prophet taught these words to his grandson al-Hasan ibn Ali to say in the witr. Graded hasan by Tirmidhi.",
  },
  {
    id: "rabbana-atina-fid-dunya",
    tags: ["powerful", "guidance", "making-dua"],
    title: "Rabbana Atina (Good in Both Worlds)",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً، وَفِي الآخِرَةِ حَسَنَةً، وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina 'adhaban-nar",
    translation: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
    source: "Quran 2:201, Bukhari 80:84",
    when: "Anytime — a single dua that gathers the good of both worlds",
    virtue: "This was the most frequent invocation of the Prophet (peace be upon him). It asks for the good of this life, the good of the next, and refuge from the Fire, all in one supplication.",
  },
  {
    id: "before-wudu",
    tags: ["home-mosque"],
    title: "Before Wudu",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    translation: "In the name of Allah.",
    source: "Abu Dawud 1:101, Ibn Majah 1:131",
    when: "Before beginning ablution (wudu)",
    virtue: "The Prophet said there is no (complete) ablution for the one who does not mention the name of Allah over it. Graded hasan.",
  },
  {
    id: "after-wudu",
    tags: ["home-mosque"],
    title: "After Wudu",
    arabic: "أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
    transliteration: "Ash-hadu an la ilaha illallahu wahdahu la sharika lah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh. Allahummaj-'alni minat-tawwabin, waj-'alni minal-mutatahhirin",
    translation: "I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad is His servant and Messenger. O Allah, make me of those who turn to You in repentance, and make me of those who purify themselves.",
    source: "Muslim 2:20, Tirmidhi 1:55",
    when: "Upon completing ablution (wudu)",
    virtue: "Whoever completes wudu well and then bears this testimony has the eight gates of Paradise opened for him, to enter by whichever he wishes. (The closing line 'make me of those who repent...' is an addition reported by Tirmidhi.)",
  },
  {
    id: "laylat-al-qadr",
    tags: ["ramadan"],
    title: "Dua of Laylat al-Qadr",
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    transliteration: "Allahumma innaka 'Afuwwun tuhibbul-'afwa fa'fu 'anni",
    translation: "O Allah, You are Pardoning and love pardon, so pardon me.",
    source: "Tirmidhi 48:144, Ibn Majah 34:24",
    when: "On the Night of Decree, sought in the last ten nights of Ramadan",
    virtue: "Aishah asked the Prophet what she should say if she came upon Laylat al-Qadr, and he taught her these words.",
  },
  {
    id: "janazah-dua",
    tags: ["death-loss"],
    title: "Dua of the Funeral Prayer",
    arabic: "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ وَنَقِّهِ مِنَ الْخَطَايَا كَمَا نَقَّيْتَ الثَّوْبَ الأَبْيَضَ مِنَ الدَّنَسِ وَأَبْدِلْهُ دَارًا خَيْرًا مِنْ دَارِهِ وَأَهْلاً خَيْرًا مِنْ أَهْلِهِ وَزَوْجًا خَيْرًا مِنْ زَوْجِهِ وَأَدْخِلْهُ الْجَنَّةَ وَأَعِذْهُ مِنْ عَذَابِ الْقَبْرِ أَوْ مِنْ عَذَابِ النَّارِ",
    transliteration: "Allahummaghfir lahu warhamhu wa 'afihi wa'fu 'anhu, wa akrim nuzulahu wa wassi' mudkhalahu, waghsilhu bil-ma'i wath-thalji wal-barad, wa naqqihi minal-khataya kama naqqaytath-thawbal-abyada minad-danas, wa abdilhu daran khayran min darihi, wa ahlan khayran min ahlihi, wa zawjan khayran min zawjihi, wa adkhilhul-jannah, wa a'idhhu min 'adhabil-qabri aw min 'adhabin-nar",
    translation: "O Allah, forgive him and have mercy on him, keep him safe and pardon him, honor his rest and make his entrance spacious, wash him with water, snow, and hail, and cleanse him of his sins as a white garment is cleansed of dirt. Give him in exchange a home better than his home, a family better than his family, and a spouse better than his spouse. Admit him to Paradise and protect him from the punishment of the grave and the punishment of the Fire.",
    source: "Muslim 11:109",
    when: "In the funeral prayer, after the third takbir (change the pronouns for a woman). See also the funeral rites section.",
    virtue: "'Awf ibn Malik heard the Prophet make this supplication over a deceased person and said he wished he were that dead person, so beautiful was the dua.",
  },
  {
    id: "visiting-the-graveyard",
    tags: ["death-loss"],
    title: "Greeting the People of the Graves",
    arabic: "السَّلاَمُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ وَإِنَّا إِنْ شَاءَ اللَّهُ لَلَاحِقُونَ أَسْأَلُ اللَّهَ لَنَا وَلَكُمْ الْعَافِيَةَ",
    transliteration: "As-salamu 'alaykum ahlad-diyari minal-mu'minina wal-muslimin, wa inna in sha'Allahu la-lahiqun, as'alullaha lana wa lakumul-'afiyah",
    translation: "Peace be upon you, O inhabitants of these dwellings, believers and Muslims. Allah willing, we shall join you. I ask Allah for well-being for us and for you.",
    source: "Muslim 11:133",
    when: "When entering or passing by a graveyard",
  },
  {
    id: "responding-to-a-sneeze",
    tags: ["everyday-social"],
    title: "When Someone Sneezes",
    arabic: "الْحَمْدُ لِلَّهِ — يَرْحَمُكَ اللَّهُ — يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ",
    transliteration: "The one who sneezes: Alhamdulillah. The one who hears: Yarhamukallah. The one who sneezed replies: Yahdikumullahu wa yuslihu balakum",
    translation: "When you sneeze, say: 'Praise be to Allah.' The one who hears you should say: 'May Allah have mercy on you.' Then you reply: 'May Allah guide you and set your affairs right.'",
    source: "Bukhari 78:248",
    when: "Whenever you or someone near you sneezes",
  },
  {
    id: "when-angry",
    tags: ["everyday-social"],
    title: "When You Are Angry",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ",
    transliteration: "A'udhu billahi minash-shaytan",
    translation: "I seek refuge in Allah from Satan.",
    source: "Bukhari 59:91",
    when: "When you feel anger rising within you",
    virtue: "The Prophet said that if the angry person says this, the anger he feels will leave him.",
  },
  {
    id: "seeing-someone-afflicted",
    tags: ["everyday-social"],
    title: "Seeing Someone Afflicted",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلاَكَ بِهِ وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلاً",
    transliteration: "Alhamdulillahil-ladhi 'afani mimmab-talaka bihi wa faddalani 'ala kathirin mimman khalaqa tafdila",
    translation: "All praise is due to Allah who saved me from that with which He has afflicted you, and who favored me greatly over many of those He has created.",
    source: "Tirmidhi 48:62, Tirmidhi 48:63",
    when: "When you see someone in hardship or affliction — say it quietly, to yourself",
    virtue: "Whoever sees an afflicted person and says this will be spared that affliction for as long as he lives.",
  },
  {
    id: "wearing-new-clothes",
    tags: ["everyday-social"],
    title: "Wearing New Clothes",
    arabic: "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ",
    transliteration: "Allahumma lakal-hamdu anta kasawtanihi, as'aluka min khayrihi wa khayri ma suni'a lah, wa a'udhu bika min sharrihi wa sharri ma suni'a lah",
    translation: "O Allah, to You is all praise; You have clothed me with this. I ask You for its good and the good for which it was made, and I seek refuge in You from its evil and the evil for which it was made.",
    source: "Abu Dawud 34:1",
    when: "When putting on a new garment",
  },
  {
    id: "sighting-the-new-moon",
    tags: ["everyday-social"],
    title: "Sighting the New Moon",
    arabic: "اللَّهُمَّ أَهْلِلْهُ عَلَيْنَا بِالْيُمْنِ وَالإِيمَانِ وَالسَّلاَمَةِ وَالإِسْلاَمِ رَبِّي وَرَبُّكَ اللَّهُ",
    transliteration: "Allahumma ahlilhu 'alayna bil-yumni wal-iman, was-salamati wal-islam, Rabbi wa Rabbukallah",
    translation: "O Allah, bring it over us with blessing and faith, safety and Islam. My Lord and your Lord is Allah.",
    source: "Tirmidhi 48:82",
    when: "When you see the new crescent moon at the start of a month",
    virtue: "The Prophet would say this whenever he saw the new crescent. Graded hasan.",
  },
  {
    id: "before-marital-intimacy",
    tags: ["parents-family"],
    title: "Before Marital Intimacy",
    arabic: "بِسْمِ اللَّهِ اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا",
    transliteration: "Bismillah, Allahumma jannibnash-shaytan, wa jannibish-shaytana ma razaqtana",
    translation: "In the name of Allah. O Allah, keep us away from Satan and keep Satan away from what You provide us.",
    source: "Bukhari 4:7, Bukhari 59:81",
    when: "Said by a husband before intimacy with his wife",
    virtue: "The Prophet said that if a child is then destined for the couple, Satan will never be able to harm that child.",
  },
  {
    id: "relief-from-debt",
    tags: ["distress"],
    title: "Relief from Debt",
    arabic: "اللَّهُمَّ اكْفِنِي بِحَلاَلِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    transliteration: "Allahummak-fini bi halalika 'an haramik, wa aghnini bi fadlika 'amman siwak",
    translation: "O Allah, suffice me with what You have made lawful so that I have no need of what You have forbidden, and enrich me by Your bounty so that I have no need of anyone besides You.",
    source: "Tirmidhi 48:194",
    when: "When burdened by debt or financial hardship",
    virtue: "The Prophet taught these words to Ali, saying that even if one's debt were like the mountain of Sir, Allah would settle it for him.",
  },
  {
    id: "asking-rain-to-ease",
    tags: ["rain-weather"],
    title: "When Rain Becomes Excessive",
    arabic: "اللَّهُمَّ حَوَالَيْنَا وَلاَ عَلَيْنَا",
    transliteration: "Allahumma hawalayna wa la 'alayna",
    translation: "O Allah, around us and not upon us.",
    source: "Bukhari 15:28",
    when: "When rain is heavy and you fear its harm",
    virtue: "When continuous rain threatened Medina, the Prophet raised his hands and said this, and the clouds parted from over the city.",
  },
];

/** Legacy ?d= deep links used array indexes; map them onto the stable ids. */
function resolveDuaParam(raw: string | null): string | null {
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return duas[Number(raw)]?.id ?? null;
  return raw;
}

/** One-time rewrite of legacy index-based dua bookmarks (id "dua-<N>") onto the
 *  stable slug ids, so old saves register as saved again. Idempotent — after
 *  the rewrite no legacy ids remain. The duas array order is unchanged since
 *  the index era, so the index → slug mapping is exact. */
function migrateLegacyDuaBookmarks() {
  try {
    for (const b of getBookmarks()) {
      if (b.type !== "dua") continue;
      const m = /^dua-(\d+)$/.exec(b.id);
      if (!m) continue;
      const target = duas[Number(m[1])];
      removeBookmark("dua", b.id);
      if (target) {
        addBookmark({
          type: "dua",
          id: target.id,
          title: b.title || target.title,
          subtitle: b.subtitle,
          href: `/duas?d=${target.id}`,
        });
      }
    }
  } catch {
    /* non-browser / storage unavailable */
  }
}

function DuasContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const scrollToDua = resolveDuaParam(searchParams.get("d"));

  useEffect(() => {
    migrateLegacyDuaBookmarks();
  }, []);

  // null = category landing grid; ?tab= deep links (and ?d= links, which need
  // their dua's card rendered to scroll to) skip the landing.
  const [activeCategory, setActiveCategory] = useState<string | null>(() => {
    const tab = searchParams.get("tab");
    const validTab = tab && categories.some((c) => c.key === tab) ? tab : null;
    const targetDua = scrollToDua ? duas.find((d) => d.id === scrollToDua) : undefined;
    if (targetDua && !(validTab && targetDua.tags.includes(validTab))) return targetDua.tags[0];
    return validTab;
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!scrollToDua) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`dua-${scrollToDua}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("section-highlight");
        setTimeout(() => el.classList.remove("section-highlight"), 2000);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [scrollToDua]);

  const selectCategory = (key: string | null) => {
    setActiveCategory(key);
    router.replace(key ? `${pathname}?tab=${key}` : pathname, { scroll: false });
  };

  const searchLower = search.toLowerCase().trim();
  const isSearching = searchLower.length >= 2;

  // Search is global — it matches across every category, landing or not.
  const filtered = isSearching
    ? duas.filter((d) =>
        d.title.toLowerCase().includes(searchLower) ||
        d.translation.toLowerCase().includes(searchLower) ||
        d.transliteration.toLowerCase().includes(searchLower) ||
        d.source.toLowerCase().includes(searchLower) ||
        d.when.toLowerCase().includes(searchLower) ||
        (d.virtue && d.virtue.toLowerCase().includes(searchLower))
      )
    : activeCategory
      ? duas.filter((d) => d.tags.includes(activeCategory))
      : [];

  const counts: Record<string, number> = {};
  categories.forEach((cat) => {
    counts[cat.key] = duas.filter((d) => d.tags.includes(cat.key)).length;
  });

  const activeCat = categories.find((c) => c.key === activeCategory);

  // Page hero — reuses the exact strings of the Dua of Yunus card below.
  const heroDua = duas.find((d) => d.id === "dua-of-yunus");

  // One dua card — rendered by both the category list and global search results
  const renderDuaCard = (dua: Dua, i: number) => {
    const displayTag = !isSearching && activeCategory ? activeCategory : dua.tags[0];
    const catLabel = categories.find((c) => c.key === displayTag)?.label ?? displayTag;

    return (
      <ContentCard key={dua.id} delay={Math.min(i * 0.05, 0.4)} id={`dua-${dua.id}`}>
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs text-gold font-medium">{catLabel}</span>
              <h2 className="text-xl font-semibold text-themed mt-1">{dua.title}</h2>
            </div>
            <BookmarkButton
              type="dua"
              id={dua.id}
              title={dua.title}
              subtitle={dua.source}
              href={`/duas?d=${dua.id}`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {dua.repeat && (
              <span className="text-[11px] px-2.5 py-1 rounded-full border bg-[var(--color-gold)]/10 text-gold border-[var(--color-gold)]/30">
                {dua.repeat}
              </span>
            )}
            <span className="text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
              {dua.when}
            </span>
          </div>
        </div>

        {/* Arabic + Transliteration + Translation */}
        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "var(--color-bg)" }}>
          <p className="text-2xl font-arabic text-gold text-right leading-loose mb-3">
            {dua.arabic}
          </p>
          <p className="text-themed-muted italic text-sm mb-2">
            {dua.transliteration}
          </p>
          <p className="text-themed text-sm">
            &ldquo;{dua.translation}&rdquo;
          </p>
        </div>

        {/* Virtue */}
        {dua.virtue && (
          <div className="rounded-lg p-3 mb-4 border border-emerald-400/30 bg-emerald-400/10">
            <p className="text-xs font-medium text-emerald-400 mb-1">Virtue</p>
            <p className="text-emerald-400 text-sm leading-relaxed opacity-90">
              {dua.virtue}
            </p>
          </div>
        )}

        {/* Source */}
        <div className="border-t sidebar-border pt-3">
          <p className="text-xs text-themed-muted">
            Source: <strong className="text-themed"><HadithRefText text={dua.source} /></strong>
          </p>
        </div>
      </ContentCard>
    );
  };

  return (
    <div>
      <PageHeader
        title="Duas & Supplications"
        titleAr="الأدعية والأذكار"
        subtitle="Authentic daily supplications with Arabic, transliteration, translation, and virtues"
      />

      {/* Opening dua — the dua of Yunus (built from this page's own data) */}
      {heroDua && (
        <VerseHero
          arabic={heroDua.arabic}
          text={heroDua.translation}
          reference={heroDua.source}
        />
      )}

      {/* Search — global across every category, landing or not */}
      <PageSearch
        value={search}
        onChange={setSearch}
        placeholder="Search all duas..."
        className="mb-6"
      />

      <AnimatePresence mode="wait">
        {isSearching ? (
          /* Global search results */
          <motion.div
            key={`search-${searchLower}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {filtered.map(renderDuaCard)}
            {filtered.length === 0 && (
              <p className="text-sm text-themed-muted py-8 text-center">
                No duas found matching &ldquo;{search}&rdquo;
              </p>
            )}
            {filtered.length > 0 && (
              <SourcesCard
                sources={filtered.map((d) => ({ ref: d.source, desc: d.title }))}
              />
            )}
          </motion.div>
        ) : activeCategory ? (
          /* Category dua list */
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => selectCategory(null)}
              className="flex items-center gap-1.5 text-sm text-themed-muted hover:text-gold transition-colors mb-4"
            >
              <ArrowLeft size={15} />
              All categories
            </button>
            <div className="flex items-center gap-2 mb-5">
              {activeCat && <activeCat.icon size={18} className="text-gold" />}
              <h2 className="text-lg font-semibold text-themed">{activeCat?.label}</h2>
              <span className="text-sm text-themed-muted">({filtered.length})</span>
            </div>

            {/* Most Powerful description */}
            {activeCategory === "powerful" && (
              <div className="rounded-xl p-5 mb-6 border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5">
                <h3 className="text-gold font-semibold mb-2 flex items-center gap-2">
                  <Sparkles size={16} />
                  Why These Duas Are the Most Powerful
                </h3>
                <p className="text-sm text-themed-muted leading-relaxed mb-3">
                  These are not opinions or rankings — each of these duas carries an <strong className="text-themed">explicit, extraordinary promise</strong> from the Prophet Muhammad (peace be upon him), narrated in Sahih al-Bukhari and Sahih Muslim, the two most rigorously authenticated hadith collections. Scholars across all schools of thought agree on their virtues.
                </p>
                <ul className="text-sm text-themed-muted space-y-1.5 list-disc list-inside">
                  <li><strong className="text-themed">Sayyid al-Istighfar</strong> — The Prophet called it the <em>master</em> of all istighfar; promised Paradise for whoever says it with conviction</li>
                  <li><strong className="text-themed">Ayatul Kursi</strong> — The greatest verse in the Quran; guaranteed protection at night and nothing prevents Paradise except death</li>
                  <li><strong className="text-themed">The Three Quls</strong> — &ldquo;Will suffice you against everything&rdquo; — a comprehensive shield</li>
                  <li><strong className="text-themed">Dua of Yunus</strong> — &ldquo;No Muslim supplicates with this except that Allah answers&rdquo; — a guaranteed response</li>
                  <li><strong className="text-themed">Tahleel (100x)</strong> — Equivalent to freeing ten slaves; a fortress from Shaytan until evening</li>
                  <li><strong className="text-themed">SubhanAllah wa Bihamdihi (100x)</strong> — Sins forgiven even if like the foam of the sea</li>
                  <li><strong className="text-themed">Tasbeeh After Prayer</strong> — Same promise of total sin forgiveness after every obligatory prayer</li>
                  <li><strong className="text-themed">After the Adhan</strong> — The Prophet&rsquo;s intercession on the Day of Judgement granted to the one who says it</li>
                  <li><strong className="text-themed">Hasbunallah</strong> — Said by Ibrahim when thrown into fire and by the Prophet when armies gathered against him</li>
                  <li><strong className="text-themed">Rabbana Atina</strong> — The Prophet&rsquo;s <em>most frequent</em> invocation; gathers the good of both worlds and refuge from the Fire</li>
                </ul>
              </div>
            )}

            {/* Making Dua explainer */}
            {activeCategory === "making-dua" && (
              <div className="rounded-xl p-5 mb-6 border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5">
                <h3 className="text-gold font-semibold mb-2 flex items-center gap-2">
                  <Hand size={16} />
                  How Dua Is Answered
                </h3>
                <p className="text-sm text-themed-muted leading-relaxed mb-3">
                  Dua is worship in itself. The Prophet Muhammad (peace be upon him) taught both an <strong className="text-themed">etiquette</strong> for supplicating and the <strong className="text-themed">times</strong> when a dua is most likely to be answered.
                </p>
                <p className="text-xs font-semibold text-themed mb-1.5">The manners of dua</p>
                <ul className="text-sm text-themed-muted space-y-1.5 list-disc list-inside mb-3">
                  <li>Begin by praising Allah and sending blessings upon the Prophet, then ask.</li>
                  <li>Do not be hasty — the Prophet taught that a servant&rsquo;s dua is answered as long as he does not grow impatient and give up, complaining that he supplicated but received no answer. (Bukhari 80:37)</li>
                  <li>Eat, drink, and earn only what is lawful — a man whose food and clothing are unlawful raises his hands, but &ldquo;How can then his supplication be accepted?&rdquo; (Muslim 12:83)</li>
                  <li>Ask with certainty that Allah will respond, and never invoke against yourself or your family.</li>
                </ul>
                <p className="text-xs font-semibold text-themed mb-1.5">The golden windows</p>
                <ul className="text-sm text-themed-muted space-y-1.5 list-disc list-inside">
                  <li>The last third of the night, when Allah descends to the lowest heaven and calls out, asking who is invoking Him that He may answer, and who is asking Him that He may give. (Bukhari 80:18)</li>
                  <li>Between the adhan and the iqamah — &ldquo;The supplication made between the adhan and the iqamah is not rejected.&rdquo; (Abu Dawud 2:131)</li>
                  <li>While prostrating — &ldquo;The nearest a servant comes to his Lord is when he is prostrating himself, so make supplication.&rdquo; (Muslim 4:245)</li>
                  <li>While fasting, on Laylat al-Qadr, and on the Day of Arafah.</li>
                </ul>
              </div>
            )}

            <div className="space-y-5">
              {filtered.map(renderDuaCard)}
            </div>

            {filtered.length > 0 && (
              <SourcesCard
                className="mt-5"
                sources={filtered.map((d) => ({ ref: d.source, desc: d.title }))}
              />
            )}
          </motion.div>
        ) : (
          /* Category landing grid */
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {sectionOrder.map((section) => (
              <div key={section}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-themed-muted mb-3">
                  {section}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories
                    .filter((cat) => cat.section === section)
                    .map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => selectCategory(cat.key)}
                        className={`card-bg border rounded-xl p-4 text-left transition-colors hover:border-[var(--color-gold)]/50 ${
                          cat.key === "powerful" ? "border-[var(--color-gold)]/40" : "sidebar-border"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-gold bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20">
                            <cat.icon size={16} />
                          </span>
                          <span>
                            <span className="block font-medium text-themed">{cat.label}</span>
                            <span className="text-xs text-themed-muted">
                              {counts[cat.key]} {counts[cat.key] === 1 ? "dua" : "duas"}
                            </span>
                          </span>
                        </div>
                        <p className="text-xs text-themed-muted leading-relaxed">{cat.description}</p>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DuasPage() {
  return <Suspense><DuasContent /></Suspense>;
}
