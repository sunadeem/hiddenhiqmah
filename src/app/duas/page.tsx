"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import BookmarkButton from "@/components/BookmarkButton";
import { Search, X, Sun, Moon as MoonIcon, HandHeart, Utensils, Plane, Home, Shield, Heart, Brain, Stethoscope, Users, BookOpen, CloudRain, Bed, Sparkles } from "lucide-react";
import TabBar from "@/components/TabBar";
import HadithRefText from "@/components/HadithRefText";

type Dua = {
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

const categories = [
  { key: "all", label: "All", icon: null },
  { key: "powerful", label: "Most Powerful", icon: Sparkles },
  { key: "morning-evening", label: "Morning & Evening", icon: Sun },
  { key: "prayer", label: "Prayer", icon: HandHeart },
  { key: "sleep", label: "Sleep", icon: Bed },
  { key: "eating", label: "Eating & Drinking", icon: Utensils },
  { key: "travel", label: "Travel", icon: Plane },
  { key: "home-mosque", label: "Home & Mosque", icon: Home },
  { key: "protection", label: "Protection", icon: Shield },
  { key: "forgiveness", label: "Forgiveness", icon: Heart },
  { key: "distress", label: "Distress & Anxiety", icon: Brain },
  { key: "illness", label: "Illness & Healing", icon: Stethoscope },
  { key: "parents-family", label: "Parents & Family", icon: Users },
  { key: "guidance", label: "Guidance & Knowledge", icon: BookOpen },
  { key: "rain-weather", label: "Rain & Weather", icon: CloudRain },
];

const duas: Dua[] = [
  // === MORNING & EVENING ===
  {
    tags: ["morning-evening"],
    title: "Morning Remembrance",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: "We have reached the morning and at this very time the kingdom belongs to Allah. All praise is due to Allah. None has the right to be worshipped except Allah alone, without any partner. To Him belongs the dominion, to Him belongs all praise, and He is over all things capable.",
    source: "Muslim 48:27",
    when: "Every morning",
  },
  {
    tags: ["morning-evening"],
    title: "Evening Remembrance",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: "We have reached the evening and at this very time the kingdom belongs to Allah. All praise is due to Allah. None has the right to be worshipped except Allah alone, without any partner. To Him belongs the dominion, to Him belongs all praise, and He is over all things capable.",
    source: "Muslim 48:27",
    when: "Every evening",
  },
  {
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
    tags: ["morning-evening", "forgiveness", "powerful"],
    title: "SubhanAllah wa Bihamdihi",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllahi wa bihamdihi",
    translation: "Glory and praise be to Allah.",
    source: "Muslim 48:31",
    when: "Morning and evening",
    repeat: "100 times",
    virtue: "Whoever says this one hundred times a day, his sins will be forgiven even if they were as much as the foam of the sea.",
  },
  {
    tags: ["morning-evening", "protection", "powerful"],
    title: "Tahleel (Declaration of Oneness)",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: "None has the right to be worshipped except Allah alone, without any partner. To Him belongs the dominion and to Him belongs all praise, and He is over all things capable.",
    source: "Bukhari 80:98, Muslim 48:32",
    when: "Morning and evening",
    repeat: "100 times",
    virtue: "Equivalent to freeing ten slaves, one hundred good deeds are recorded, one hundred sins are erased, and it is a protection from Shaytan until evening.",
  },
  {
    tags: ["morning-evening", "protection"],
    title: "Seeking Refuge from Evil of Creation",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bi kalimatillahit-tammati min sharri ma khalaq",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    source: "Muslim 48:52",
    when: "Evening",
    repeat: "3 times",
    virtue: "Nothing will harm the one who says this three times in the evening.",
  },

  // === PRAYER ===
  {
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
    tags: ["prayer"],
    title: "Opening Supplication in Prayer",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَٰهَ غَيْرُكَ",
    transliteration: "Subhanakallahumma wa bihamdika, wa tabarakasmuka, wa ta'ala jadduka, wa la ilaha ghayruk",
    translation: "Glory and praise be to You, O Allah. Blessed is Your name, exalted is Your majesty, and there is no god but You.",
    source: "Abu Dawud 2:385, Tirmidhi 2:95",
    when: "After opening takbeer in prayer",
  },
  {
    tags: ["prayer"],
    title: "Between the Two Prostrations",
    arabic: "رَبِّ اغْفِرْ لِي رَبِّ اغْفِرْ لِي",
    transliteration: "Rabbighfir li, Rabbighfir li",
    translation: "My Lord, forgive me. My Lord, forgive me.",
    source: "Abu Dawud 2:484, Ibn Majah 5:95",
    when: "While sitting between the two prostrations",
  },
  {
    tags: ["prayer"],
    title: "Seeking Refuge Before Salam",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ وَمِنْ عَذَابِ الْقَبْرِ وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
    transliteration: "Allahumma inni a'udhu bika min 'adhabi jahannam, wa min 'adhabil-qabr, wa min fitnatil-mahya wal-mamat, wa min sharri fitnatil-masihid-dajjal",
    translation: "O Allah, I seek refuge in You from the punishment of Hellfire, from the punishment of the grave, from the trials of life and death, and from the evil trial of the False Messiah.",
    source: "Muslim 4:129",
    when: "After the final tashahhud, before salam",
    virtue: "The Prophet (peace be upon him) used to seek refuge from these four things before giving salam.",
  },
  {
    tags: ["prayer"],
    title: "After Completing Prayer",
    arabic: "أَسْتَغْفِرُ اللَّهَ أَسْتَغْفِرُ اللَّهَ أَسْتَغْفِرُ اللَّهَ اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration: "Astaghfirullah, Astaghfirullah, Astaghfirullah. Allahumma antas-salam wa minkas-salam, tabarakta ya dhal-jalali wal-ikram",
    translation: "I seek the forgiveness of Allah (three times). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of Majesty and Honor.",
    source: "Muslim 2:1",
    when: "Immediately after salam",
  },
  {
    tags: ["prayer", "powerful"],
    title: "Tasbeeh After Prayer",
    arabic: "سُبْحَانَ اللَّهِ (٣٣) الْحَمْدُ لِلَّهِ (٣٣) اللَّهُ أَكْبَرُ (٣٣) لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "SubhanAllah (33x), Alhamdulillah (33x), Allahu Akbar (33x), La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    translation: "Glory be to Allah (33x). Praise be to Allah (33x). Allah is the Greatest (33x). None has the right to be worshipped except Allah alone, with no partner. To Him belongs the dominion and praise, and He is over all things capable.",
    source: "Muslim 2:1",
    when: "After every obligatory prayer",
    virtue: "The sins of whoever says this after every prayer will be forgiven, even if they were as much as the foam of the sea.",
  },
  {
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
    tags: ["sleep"],
    title: "Before Sleeping",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    translation: "In Your name, O Allah, I die and I live.",
    source: "Bukhari 80:21",
    when: "Every night before sleep",
  },
  {
    tags: ["sleep"],
    title: "Sleeping on Your Right Side",
    arabic: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ وَفَوَّضْتُ أَمْرِي إِلَيْكَ وَوَجَّهْتُ وَجْهِي إِلَيْكَ وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ رَغْبَةً وَرَهْبَةً إِلَيْكَ لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ",
    transliteration: "Allahumma aslamtu nafsi ilayk, wa fawwadtu amri ilayk, wa wajjahtu wajhi ilayk, wa alja'tu zahri ilayk, raghbatan wa rahbatan ilayk, la malja'a wa la manja minka illa ilayk, amantu bi kitabikal-ladhi anzalt, wa bi nabiyyikal-ladhi arsalt",
    translation: "O Allah, I submit myself to You, I entrust my affairs to You, I turn my face to You, and I lean my back on You, out of hope and fear of You. There is no refuge and no escape from You except to You. I believe in Your Book which You have revealed and in Your Prophet whom You have sent.",
    source: "Bukhari 4:113, Muslim 48:54",
    when: "Before sleeping, lying on right side",
    virtue: "If you die that night, you will die upon the fitrah (natural disposition of Islam).",
  },
  {
    tags: ["sleep"],
    title: "Upon Waking Up",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdulillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    translation: "All praise is due to Allah, who gave us life after causing us to die, and to Him is the resurrection.",
    source: "Bukhari 80:21",
    when: "Upon waking up",
  },
  {
    tags: ["sleep"],
    title: "After a Bad Dream",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "A'udhu billahi minash-shaytanir-rajeem",
    translation: "I seek refuge in Allah from the accursed Shaytan.",
    source: "Muslim 42:12",
    when: "After a bad dream",
    virtue: "Spit lightly to your left three times, seek refuge in Allah from Shaytan, and turn to your other side. Do not tell anyone about the bad dream.",
  },

  // === EATING & DRINKING ===
  {
    tags: ["eating"],
    title: "Before Eating",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    translation: "In the name of Allah.",
    source: "Bukhari 70:4, Muslim 36:136",
    when: "Before every meal",
  },
  {
    tags: ["eating"],
    title: "Forgetting to Say Bismillah",
    arabic: "بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ",
    transliteration: "Bismillahi awwalahu wa akhirah",
    translation: "In the name of Allah, at its beginning and at its end.",
    source: "Abu Dawud 28:32, Tirmidhi 25:75",
    when: "If you forget to say Bismillah before eating",
  },
  {
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
    tags: ["eating"],
    title: "Dua of a Guest for the Host",
    arabic: "اللَّهُمَّ بَارِكْ لَهُمْ فِيمَا رَزَقْتَهُمْ وَاغْفِرْ لَهُمْ وَارْحَمْهُمْ",
    transliteration: "Allahumma barik lahum feema razaqtahum, waghfir lahum, warhamhum",
    translation: "O Allah, bless them in what You have provided for them, forgive them, and have mercy upon them.",
    source: "Muslim 36:175",
    when: "When eating at someone's home",
  },
  {
    tags: ["eating"],
    title: "When Breaking Fast",
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
    transliteration: "Dhahabadh-dhama'u wabtallatil-'uruqu wa thabatal-ajru in sha'Allah",
    translation: "The thirst has gone, the veins have been moistened, and the reward is confirmed, if Allah wills.",
    source: "Abu Dawud 14:45",
    when: "When breaking the fast (iftar)",
  },

  // === TRAVEL ===
  {
    tags: ["travel"],
    title: "Dua for Travel",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Subhanal-ladhi sakh-khara lana hadha wa ma kunna lahu muqrineen, wa inna ila Rabbina la munqalibun",
    translation: "Glory to Him who has subjected this to us, and we could never have it by our efforts. And to our Lord we will surely return.",
    source: "Quran 43:13-14, Muslim 5:179",
    when: "When beginning a journey",
  },
  {
    tags: ["travel"],
    title: "Returning from Travel",
    arabic: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ",
    transliteration: "Ayibuna, ta'ibuna, 'abiduna, li Rabbina hamidun",
    translation: "We are returning, repenting, worshipping, and praising our Lord.",
    source: "Bukhari 64:22, Muslim 5:179",
    when: "When returning from a journey",
  },
  {
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
    tags: ["home-mosque"],
    title: "Entering the Home",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna",
    translation: "In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we rely.",
    source: "Abu Dawud 43:324",
    when: "When entering your home",
  },
  {
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
    tags: ["home-mosque"],
    title: "Entering the Mosque",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahummaf-tah li abwaba rahmatik",
    translation: "O Allah, open for me the gates of Your mercy.",
    source: "Muslim 4:128",
    when: "When entering the mosque",
  },
  {
    tags: ["home-mosque"],
    title: "Leaving the Mosque",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allahumma inni as'aluka min fadlik",
    translation: "O Allah, I ask You for Your bounty.",
    source: "Muslim 4:128",
    when: "When leaving the mosque",
  },
  {
    tags: ["home-mosque"],
    title: "Entering the Bathroom",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    transliteration: "Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith",
    translation: "O Allah, I seek refuge in You from the male and female evil jinn.",
    source: "Bukhari 4:8, Muslim 4:128",
    when: "Before entering the bathroom",
  },
  {
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
    tags: ["protection", "sleep", "prayer", "morning-evening", "powerful"],
    title: "Ayatul Kursi (The Verse of the Throne)",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "Allahu la ilaha illa huwal-hayyul-qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard, man dhal-ladhi yashfa'u 'indahu illa bi idhnih, ya'lamu ma bayna aydeehim wa ma khalfahum, wa la yuheetuna bi shay'in min 'ilmihi illa bima sha', wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifzuhuma, wa huwal-'aliyyul-'azeem",
    translation: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and the earth, and their preservation does not tire Him. And He is the Most High, the Most Great.",
    source: "Quran 2:255, Bukhari 59:32, Muslim 4:128",
    when: "After every obligatory prayer, before sleep, morning and evening",
    virtue: "Whoever recites Ayatul Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death.",
  },
  {
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
    tags: ["forgiveness"],
    title: "Dua of Adam (peace be upon him)",
    arabic: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    transliteration: "Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakoonanna minal-khasireen",
    translation: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
    source: "Quran 7:23",
    when: "When seeking repentance",
  },
  {
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
    tags: ["forgiveness"],
    title: "Comprehensive Istighfar",
    arabic: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
    transliteration: "Allahumma inni zalamtu nafsi zulman katheeran wa la yaghfirudh-dhunuba illa anta, faghfir li maghfiratan min 'indika warhamni innaka antal-ghafurur-raheem",
    translation: "O Allah, I have greatly wronged myself and no one forgives sins but You. So grant me forgiveness from You and have mercy on me. Surely, You are the Oft-Forgiving, Most Merciful.",
    source: "Bukhari 10:227, Muslim 48:49",
    when: "In prayer and anytime",
    virtue: "The Prophet (peace be upon him) taught this to Abu Bakr to say in his prayer.",
  },

  // === DISTRESS & ANXIETY ===
  {
    tags: ["distress"],
    title: "In Times of Distress",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
    transliteration: "La ilaha illallahul-'azeemul-haleem, la ilaha illallahu rabbul-'arshil-'azeem, la ilaha illallahu rabbus-samawati wa rabbul-ardi wa rabbul-'arshil-kareem",
    translation: "There is no god but Allah, the Great, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.",
    source: "Bukhari 80:43, Muslim 48:72",
    when: "In moments of severe distress or difficulty",
  },
  {
    tags: ["distress", "forgiveness", "powerful"],
    title: "Dua of Yunus (peace be upon him)",
    arabic: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta, subhanaka inni kuntu minaz-zalimeen",
    translation: "There is no god but You, glory be to You. Indeed, I have been of the wrongdoers.",
    source: "Quran 21:87, Tirmidhi 48:136",
    when: "In times of distress and difficulty",
    virtue: "No Muslim supplicates with this except that Allah will answer his prayer.",
  },
  {
    tags: ["distress"],
    title: "Refuge from Worry and Grief",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayni wa ghalabatir-rijal",
    translation: "O Allah, I seek refuge in You from worry and grief, from weakness and laziness, from miserliness and cowardice, from the burden of debt and being overpowered by men.",
    source: "Bukhari 80:66",
    when: "When feeling overwhelmed, anxious, or burdened",
  },
  {
    tags: ["distress"],
    title: "When a Calamity Strikes",
    arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
    transliteration: "Inna lillahi wa inna ilayhi raji'un. Allahumma'jurni fi museebati wa akhlif li khayran minha",
    translation: "Indeed, to Allah we belong and to Him we shall return. O Allah, reward me in my calamity and replace it with something better.",
    source: "Muslim 11:5",
    when: "When afflicted by a calamity or loss",
    virtue: "Umm Salamah said this when her husband died, and Allah replaced him with the Prophet (peace be upon him).",
  },
  {
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
    tags: ["illness"],
    title: "Dua for Healing (Ruqyah)",
    arabic: "أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا",
    transliteration: "Adhhibil-ba's, Rabban-nas, ishfi antash-shafi, la shifa'a illa shifa'uka, shifa'an la yughadiru saqama",
    translation: "Remove the affliction, O Lord of mankind. Heal, for You are the Healer. There is no healing except Your healing — a healing that leaves no illness behind.",
    source: "Bukhari 76:58, Muslim 39:73",
    when: "When visiting or supplicating for the sick",
  },
  {
    tags: ["illness"],
    title: "Placing Hand on Pain",
    arabic: "بِسْمِ اللَّهِ (ثَلاثًا) أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ",
    transliteration: "Bismillah (3x). A'udhu billahi wa qudratihi min sharri ma ajidu wa uhadhir",
    translation: "In the name of Allah (three times). I seek refuge in Allah and His power from the evil of what I feel and what I fear.",
    source: "Muslim 39:82",
    when: "Place your hand on the area of pain",
    repeat: "7 times",
  },
  {
    tags: ["illness"],
    title: "Visiting the Sick",
    arabic: "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ",
    transliteration: "La ba'sa, tahurun in sha'Allah",
    translation: "No worry, it is a purification, if Allah wills.",
    source: "Bukhari 75:16",
    when: "When visiting someone who is ill",
  },
  {
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
    tags: ["parents-family"],
    title: "Dua for Parents",
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbir-hamhuma kama rabbayani sagheera",
    translation: "My Lord, have mercy upon them as they brought me up when I was small.",
    source: "Quran 17:24",
    when: "Anytime, especially in prayer",
  },
  {
    tags: ["parents-family"],
    title: "Dua for Righteous Offspring",
    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yun, waj'alna lil-muttaqeena imama",
    translation: "Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us leaders of the righteous.",
    source: "Quran 25:74",
    when: "Anytime, especially when praying for family",
  },
  {
    tags: ["parents-family"],
    title: "Dua for Establishing Prayer in Family",
    arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    transliteration: "Rabbij-'alni muqeemas-salati wa min dhurriyyati, Rabbana wa taqabbal du'a",
    translation: "My Lord, make me an establisher of prayer, and from my descendants. Our Lord, and accept my supplication.",
    source: "Quran 14:40",
    when: "Anytime, a dua of Prophet Ibrahim (peace be upon him)",
  },
  {
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
    tags: ["guidance"],
    title: "Asking for Increase in Knowledge",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma",
    translation: "My Lord, increase me in knowledge.",
    source: "Quran 20:114",
    when: "When seeking knowledge, before studying",
  },
  {
    tags: ["guidance"],
    title: "Dua of Musa (peace be upon him)",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي",
    transliteration: "Rabbish-rahli sadri, wa yassir li amri, wahlul 'uqdatan min lisani, yafqahu qawli",
    translation: "My Lord, expand for me my chest, ease for me my task, and untie the knot from my tongue, that they may understand my speech.",
    source: "Quran 20:25-28",
    when: "Before presentations, teaching, or speaking",
  },
  {
    tags: ["guidance"],
    title: "Seeking Beneficial Knowledge",
    arabic: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي وَزِدْنِي عِلْمًا",
    transliteration: "Allahumman-fa'ni bima 'allamtani, wa 'allimni ma yanfa'uni, wa zidni 'ilma",
    translation: "O Allah, benefit me with what You have taught me, teach me what will benefit me, and increase me in knowledge.",
    source: "Tirmidhi 48:230, Ibn Majah 0:251",
    when: "After prayer, when studying",
  },
  {
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
    tags: ["rain-weather"],
    title: "When It Rains",
    arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا",
    transliteration: "Allahumma sayyiban nafi'a",
    translation: "O Allah, let it be a beneficial rain.",
    source: "Bukhari 15:27",
    when: "When it starts raining",
  },
  {
    tags: ["rain-weather"],
    title: "After Rain",
    arabic: "مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ",
    transliteration: "Mutirna bi fadlillahi wa rahmatihi",
    translation: "We have been given rain by the grace and mercy of Allah.",
    source: "Bukhari 10:238, Muslim 1:137",
    when: "After the rain",
  },
  {
    tags: ["rain-weather"],
    title: "During Strong Winds",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا فِيهَا وَخَيْرَ مَا أُرْسِلَتْ بِهِ وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا وَشَرِّ مَا أُرْسِلَتْ بِهِ",
    transliteration: "Allahumma inni as'aluka khayraha wa khayra ma feeha wa khayra ma ursilat bihi, wa a'udhu bika min sharriha wa sharri ma feeha wa sharri ma ursilat bih",
    translation: "O Allah, I ask You for the good of it, the good within it, and the good it was sent with. And I seek refuge in You from the evil of it, the evil within it, and the evil it was sent with.",
    source: "Muslim 4:128",
    when: "When strong winds blow",
  },
];

function DuasContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const scrollToDua = searchParams.get("d");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("tab") || "all");
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

  const searchLower = search.toLowerCase().trim();
  const categoryFiltered = activeCategory === "all"
    ? duas
    : duas.filter((d) => d.tags.includes(activeCategory));

  const filtered = searchLower.length < 2
    ? categoryFiltered
    : categoryFiltered.filter((d) =>
        d.title.toLowerCase().includes(searchLower) ||
        d.translation.toLowerCase().includes(searchLower) ||
        d.transliteration.toLowerCase().includes(searchLower) ||
        d.source.toLowerCase().includes(searchLower) ||
        d.when.toLowerCase().includes(searchLower) ||
        (d.virtue && d.virtue.toLowerCase().includes(searchLower))
      );

  const counts: Record<string, number> = { all: duas.length };
  categories.forEach((cat) => {
    if (cat.key !== "all") {
      counts[cat.key] = duas.filter((d) => d.tags.includes(cat.key)).length;
    }
  });

  return (
    <div>
      <PageHeader
        title="Duas & Supplications"
        titleAr="الأدعية والأذكار"
        subtitle="Authentic daily supplications with Arabic, transliteration, translation, and virtues"
      />

      {/* Search bar */}
      <div className="relative max-w-xl mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-muted"
        />
        <input
          type="text"
          placeholder="Search duas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl card-bg border sidebar-border text-themed placeholder:text-themed-muted focus:outline-none focus:border-[var(--color-gold)] transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category pills / dropdown */}
      <TabBar
        tabs={categories.map((cat) => ({
          key: cat.key,
          label: cat.label,
          icon: cat.icon ? <cat.icon size={15} /> : undefined,
          count: counts[cat.key],
        }))}
        activeTab={activeCategory}
        onTabChange={setActiveCategory}
        className="mb-6"
      />

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
          </ul>
        </div>
      )}

      {/* Duas list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}-${searchLower}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {filtered.map((dua, i) => {
            const displayTag = activeCategory !== "all" ? activeCategory : dua.tags[0];
            const catLabel = categories.find((c) => c.key === displayTag)?.label ?? displayTag;

            return (
              <ContentCard key={`${dua.title}-${i}`} delay={Math.min(i * 0.05, 0.4)} id={`dua-${duas.indexOf(dua)}`}>
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs text-gold font-medium">{catLabel}</span>
                      <h2 className="text-xl font-semibold text-themed mt-1">{dua.title}</h2>
                    </div>
                    <BookmarkButton
                      type="dua"
                      id={`dua-${duas.indexOf(dua)}`}
                      title={dua.title}
                      subtitle={dua.source}
                      href={`/duas?d=${duas.indexOf(dua)}`}
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
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-themed-muted py-8 text-center">
              No duas found matching &ldquo;{search}&rdquo;
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function DuasPage() {
  return <Suspense><DuasContent /></Suspense>;
}
