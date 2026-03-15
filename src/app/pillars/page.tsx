"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import ContentCard from "@/components/ContentCard";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { textMatch } from "@/lib/search";
import HadithRefText from "@/components/HadithRefText";
import {
  BookOpen,
  AlertTriangle,
  MessageCircle,
  Clock,
  Coins,
  Utensils,
  MapPin,
} from "lucide-react";

/* ───────────────────────── types ───────────────────────── */

type Pillar = {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof MessageCircle;
  description: string;
  detailedExplanation: string;
  keyVerses: { ref: string; arabic?: string; text: string }[];
  hadith: { ref: string; text: string }[];
  points: string[];
  misconceptions: { title: string; clarification: string }[];
  sources: string[];
};

/* ───────────────────────── data ───────────────────────── */

const whyItMatters = [
  {
    point: "They are the foundation upon which Islam is built",
    detail:
      "The Prophet (peace be upon him) described Islam as being built upon five things, like a structure resting on its pillars. Without them, the structure of one's Islam collapses.",
    reference: "Bukhari 2:1, Muslim 1:21",
  },
  {
    point: "They combine belief with action",
    detail:
      "Islam is not merely an internal belief — it demands outward action. The pillars translate inner faith into tangible worship, creating a complete way of life that connects the heart, tongue, and body.",
    reference: "Muslim 1:1 (Hadith of Jibril)",
  },
  {
    point: "They establish discipline and God-consciousness",
    detail:
      "Each pillar trains the believer in a different dimension: the tongue (shahada), the body (salah), wealth (zakat), desire (sawm), and journey (hajj). Allah says fasting was prescribed so 'that you may achieve taqwa,' and the scholars note that all five pillars share this purpose of building God-consciousness.",
    reference: "Quran 2:183",
  },
  {
    point: "They unify the Muslim ummah worldwide",
    detail:
      "All Muslims — regardless of race, language, or culture — share the same declaration, pray toward the same qiblah, fast in the same month, and gather at the same House. Allah commands the believers to hold firm together and not divide.",
    reference: "Quran 3:103",
  },
  {
    point: "They are a means of forgiveness and elevation",
    detail:
      "The Prophet (peace be upon him) said: 'The five daily prayers, and Friday to Friday, and Ramadan to Ramadan are expiation for what is between them, so long as major sins are avoided.'",
    reference: "Muslim 1:139",
  },
];

const pillars: Pillar[] = [
  {
    id: "shahada",
    title: "The Shahada",
    titleAr: "الشهادة",
    icon: MessageCircle,
    description:
      "The declaration of faith — bearing witness that there is no god worthy of worship except Allah, and that Muhammad (peace be upon him) is His final Messenger. It is the gateway to Islam and the most important of the five pillars.",
    detailedExplanation:
      "The Shahada consists of two testimonies. The first — 'La ilaha illa Allah' (There is no god but Allah) — is a negation of all false deities followed by an affirmation of Allah alone as worthy of worship. This is the essence of Tawhid. The second — 'Muhammadur Rasulullah' (Muhammad is the Messenger of Allah) — means obeying him in what he commanded, believing him in what he reported, avoiding what he prohibited, and worshipping Allah only in the way he prescribed. The Shahada has seven conditions that scholars have derived from the Quran and Sunnah: knowledge (ilm), certainty (yaqeen), acceptance (qabool), submission (inqiyad), truthfulness (sidq), sincerity (ikhlas), and love (mahabbah). A person must fulfill all of these for their shahada to be valid.",
    keyVerses: [
      {
        ref: "Quran 3:18",
        arabic:
          "شَهِدَ ٱللَّهُ أَنَّهُۥ لَآ إِلَـٰهَ إِلَّا هُوَ وَٱلْمَلَـٰٓئِكَةُ وَأُولُوا ٱلْعِلْمِ قَآئِمًۢا بِٱلْقِسْطِ",
        text: "Allah witnesses that there is no deity except Him, and so do the angels and those of knowledge — maintaining [creation] in justice.",
      },
      {
        ref: "Quran 47:19",
        arabic:
          "فَٱعْلَمْ أَنَّهُۥ لَآ إِلَـٰهَ إِلَّا ٱللَّهُ وَٱسْتَغْفِرْ لِذَنۢبِكَ",
        text: "So know that there is no deity except Allah and ask forgiveness for your sin.",
      },
      {
        ref: "Quran 48:29",
        arabic: "مُّحَمَّدٌۭ رَّسُولُ ٱللَّهِ",
        text: "Muhammad is the Messenger of Allah.",
      },
    ],
    hadith: [
      {
        ref: "Bukhari 65:1, Muslim 1:29",
        text: "I have been ordered to fight the people until they testify that there is no god but Allah and that Muhammad is the Messenger of Allah, and establish prayer and give zakat. If they do that, their blood and wealth are protected from me, except by the right of Islam, and their account is with Allah.",
      },
      {
        ref: "Muslim 15:159",
        text: "Whoever says 'La ilaha illa Allah' and disbelieves in everything worshipped besides Allah, his property and blood become inviolable, and his reckoning is with Allah.",
      },
    ],
    points: [
      "It is the first thing a person says to enter Islam",
      "The first half (la ilaha illa Allah) negates all false gods; the second half affirms Allah alone",
      "The second testimony (Muhammadur Rasulullah) means following the Prophet's Sunnah in worship",
      "Seven conditions: knowledge, certainty, acceptance, submission, truthfulness, sincerity, and love",
      "It must be said with understanding and conviction, not merely as words on the tongue",
      "It is the last thing the Prophet (peace be upon him) encouraged people to say before death (Abu Dawud 21:28)",
      "A person who says it sincerely, even once in their lifetime, will eventually enter Paradise",
    ],
    misconceptions: [
      {
        title: "Simply saying the words is enough",
        clarification:
          "The shahada requires understanding and fulfilling its conditions. The hypocrites (munafiqun) said the shahada outwardly but did not believe in their hearts, and Allah declared them to be in the lowest depths of the Hellfire (Quran 4:145).",
      },
      {
        title: "The shahada only needs to be said once",
        clarification:
          "While a single sincere shahada is sufficient to enter Islam, the believer reaffirms it in every prayer (tashahhud), in the adhan, and throughout daily life. It is a continuous commitment, not a one-time utterance.",
      },
    ],
    sources: [
      "Kitab at-Tawhid, Muhammad ibn Abd al-Wahhab — On the meaning and conditions of La ilaha illa Allah",
      "Sharh Usul al-Iman, Ibn Uthaymeen — Section on the shahada and its conditions",
      "Al-Qawa'id al-Muthla, Ibn Uthaymeen — On the testimony of faith",
      "Bukhari 65:1, Muslim 1:29, 0:26 — Hadith on the shahada",
    ],
  },
  {
    id: "salah",
    title: "The Salah",
    titleAr: "الصلاة",
    icon: Clock,
    description:
      "The five daily prayers — the direct connection between the servant and Allah. Salah is the most important pillar after the shahada and the first deed a person will be questioned about on the Day of Judgement.",
    detailedExplanation:
      "Salah was prescribed during the Night Journey (al-Isra wal-Mi'raj), when the Prophet (peace be upon him) was taken up to the heavens. Originally fifty prayers were prescribed, then reduced to five in number but fifty in reward. The five prayers are: Fajr (dawn, 2 rak'at), Dhuhr (noon, 4 rak'at), Asr (afternoon, 4 rak'at), Maghrib (sunset, 3 rak'at), and Isha (night, 4 rak'at). Salah must be performed at its appointed time, facing the qiblah (direction of the Ka'bah), in a state of ritual purity (wudu). It involves standing, reciting the Quran, bowing (ruku'), prostrating (sujud), and sitting — each position accompanied by specific supplications. The prayer begins with 'Allahu Akbar' (takbiratul ihram) and ends with the taslim (saying 'As-salamu alaykum wa rahmatullah' to each side).",
    keyVerses: [
      {
        ref: "Quran 4:103",
        arabic:
          "إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَـٰبًۭا مَّوْقُوتًۭا",
        text: "Indeed, prayer has been decreed upon the believers at specified times.",
      },
      {
        ref: "Quran 29:45",
        arabic:
          "إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ",
        text: "Indeed, prayer prohibits immorality and wrongdoing.",
      },
      {
        ref: "Quran 2:238",
        arabic:
          "حَـٰفِظُوا عَلَى ٱلصَّلَوَٰتِ وَٱلصَّلَوٰةِ ٱلْوُسْطَىٰ وَقُومُوا لِلَّهِ قَـٰنِتِينَ",
        text: "Maintain the prayers and [especially] the middle prayer, and stand before Allah in devout obedience.",
      },
    ],
    hadith: [
      {
        ref: "Nasai 5:16, Tirmidhi 2:266",
        text: "The first thing a person will be held accountable for on the Day of Judgement is the prayer. If it is sound, then the rest of his deeds will be sound. And if it is deficient, then the rest of his deeds will be deficient.",
      },
      {
        ref: "Bukhari 10:6, Muslim 1:5",
        text: "The Prophet (peace be upon him) was asked: 'Which deed is most beloved to Allah?' He said: 'Prayer at its proper time.'",
      },
      {
        ref: "Muslim 1:139",
        text: "The five daily prayers, and Friday to Friday, and Ramadan to Ramadan are expiation for whatever sins come between them, so long as major sins are avoided.",
      },
    ],
    points: [
      "It is the second pillar and the most important act of worship after the shahada",
      "Prescribed during al-Isra wal-Mi'raj — originally 50, reduced to 5 but rewarded as 50 (Bukhari 59:18, Muslim 1:321)",
      "Five obligatory prayers: Fajr, Dhuhr, Asr, Maghrib, Isha",
      "Requires ritual purity (wudu), facing the qiblah, covering the awrah, and praying at the appointed time",
      "Sujud (prostration) is the closest a servant is to Allah (Muslim 1:388)",
      "Abandoning prayer entirely is a matter of major sin — some scholars consider it an act of disbelief based on Muslim 1:12",
      "Congregation (jama'ah) prayer is 27 times more rewarding than praying alone (Bukhari 8:1)",
      "Friday (Jumu'ah) prayer is obligatory for men and replaces Dhuhr on Friday",
    ],
    misconceptions: [
      {
        title: "Prayer is just a ritual with no real benefit",
        clarification:
          "Allah Himself states that prayer prevents immorality and wrongdoing (Quran 29:45). It is a direct conversation with Allah — when you recite al-Fatihah, Allah responds to each verse (Muslim 4:300). It is both spiritual nourishment and practical protection.",
      },
      {
        title: "You can make up for missed prayers whenever you want",
        clarification:
          "The scholars agree that deliberately delaying prayer beyond its time without a valid excuse is a major sin. Allah specified times for prayer (Quran 4:103). However, if one misses a prayer due to sleep or forgetfulness, it must be made up immediately upon remembering (Bukhari 9:72).",
      },
    ],
    sources: [
      "Sifat Salat an-Nabi, al-Albani — Detailed description of the Prophet's prayer",
      "Sharh Umdatul Ahkam, Ibn Uthaymeen — Rulings on prayer",
      "Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah — On the obligation of salah",
      "Bukhari 10:6, 10:42; Muslim 1:5, 0:1:388 — Hadith on prayer",
      "Tafsir Ibn Kathir — Commentary on Quran 4:103, 29:45, 2:238",
    ],
  },
  {
    id: "zakat",
    title: "The Zakat",
    titleAr: "الزكاة",
    icon: Coins,
    description:
      "The obligatory annual charity — 2.5% of qualifying wealth given to those in need. Zakat purifies wealth, purifies the soul from greed, and supports the most vulnerable members of the Muslim community.",
    detailedExplanation:
      "The word 'zakat' comes from the Arabic root meaning purification and growth. It is not a voluntary charity (sadaqah) but a divine right that the poor have over the wealth of the rich. Zakat becomes obligatory when a Muslim's wealth exceeds the nisab (minimum threshold) — approximately 85 grams of gold or 595 grams of silver in value — and has been held for one full lunar year (hawl). The rate is 2.5% on cash, gold, silver, and trade goods. Different rates apply to agricultural produce (5% or 10%), livestock, and minerals. The Quran specifies eight categories of eligible recipients in Surah at-Tawbah (9:60): the poor (fuqara), the needy (masakin), zakat collectors, those whose hearts are to be reconciled, freeing slaves, those in debt, in the cause of Allah, and the wayfarer.",
    keyVerses: [
      {
        ref: "Quran 9:60",
        arabic:
          "إِنَّمَا ٱلصَّدَقَـٰتُ لِلْفُقَرَآءِ وَٱلْمَسَـٰكِينِ وَٱلْعَـٰمِلِينَ عَلَيْهَا وَٱلْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِى ٱلرِّقَابِ وَٱلْغَـٰرِمِينَ وَفِى سَبِيلِ ٱللَّهِ وَٱبْنِ ٱلسَّبِيلِ",
        text: "Zakah expenditures are only for the poor, the needy, those employed to collect [zakah], for bringing hearts together, for freeing captives, for those in debt, for the cause of Allah, and for the stranded traveler.",
      },
      {
        ref: "Quran 9:103",
        arabic:
          "خُذْ مِنْ أَمْوَٰلِهِمْ صَدَقَةًۭ تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا",
        text: "Take from their wealth a charity by which you purify them and cause them increase.",
      },
      {
        ref: "Quran 2:43",
        arabic: "وَأَقِيمُوا ٱلصَّلَوٰةَ وَءَاتُوا ٱلزَّكَوٰةَ وَٱرْكَعُوا مَعَ ٱلرَّٰكِعِينَ",
        text: "And establish prayer and give zakah and bow with those who bow [in worship].",
      },
    ],
    hadith: [
      {
        ref: "Bukhari 65:1",
        text: "The Prophet (peace be upon him) sent Mu'adh to Yemen and said: 'Inform them that Allah has made obligatory upon them sadaqah (zakat) from their wealth, to be taken from the rich among them and given to the poor among them.'",
      },
      {
        ref: "Muslim 12:28",
        text: "There is no owner of gold or silver who does not pay what is due on it except that on the Day of Resurrection, plates of fire will be heated for him in the Hellfire, and his side, forehead, and back will be branded with them.",
      },
    ],
    points: [
      "Obligatory on every Muslim whose wealth meets the nisab and has been held for one lunar year",
      "The nisab is approximately 85 grams of gold or 595 grams of silver in value",
      "The standard rate is 2.5% on cash, gold, silver, and trade goods",
      "Eight eligible categories of recipients are specified in Quran 9:60",
      "Zakat cannot be given to one's own parents, children, or spouse — the majority of scholars hold this by consensus, as their maintenance is already an obligation",
      "Abu Bakr (may Allah be pleased with him) fought those who refused to pay zakat after the Prophet's death, declaring it inseparable from salah (Bukhari 24:5)",
      "Zakat al-Fitr is a separate obligation at the end of Ramadan — one sa' (approximately 3 kg) of food per person (Bukhari 24:103)",
      "Zakat is mentioned alongside salah numerous times in the Quran, showing their inseparable connection",
    ],
    misconceptions: [
      {
        title: "Zakat is the same as voluntary charity (sadaqah)",
        clarification:
          "Zakat is an obligation with specific rules on amounts, thresholds, and recipients. Sadaqah is voluntary and can be given in any amount to anyone. Withholding zakat is a major sin with severe punishment described in the Quran (3:180) and Sunnah (Muslim 12:40).",
      },
      {
        title: "Zakat is just a tax",
        clarification:
          "Zakat is an act of worship (ibadah) that purifies the soul and wealth. Unlike taxes, it has divinely specified rates and recipients. The intention (niyyah) for Allah's sake is required for it to be valid, just like prayer.",
      },
    ],
    sources: [
      "Fiqh az-Zakat, Yusuf al-Qaradawi — Comprehensive jurisprudence of zakat",
      "Sharh Umdatul Ahkam, Ibn Uthaymeen — Chapters on zakat",
      "Al-Mughni, Ibn Qudamah — Section on zakat rulings",
      "Bukhari 65:1, 24:103; Muslim 4:149 — Hadith on zakat",
      "Tafsir Ibn Kathir — Commentary on Quran 9:60, 9:103",
    ],
  },
  {
    id: "sawm",
    title: "The Sawm",
    titleAr: "الصيام",
    icon: Utensils,
    description:
      "Fasting during the month of Ramadan — abstaining from food, drink, and marital relations from dawn (Fajr) until sunset (Maghrib). Fasting cultivates taqwa, self-discipline, empathy for the less fortunate, and gratitude to Allah.",
    detailedExplanation:
      "Fasting in Ramadan was prescribed in the second year after the Hijrah. It involves abstaining from all food, drink, and marital intimacy from the true dawn (Fajr) until sunset (Maghrib). Beyond the physical fast, the believer must also guard the tongue from lying, backbiting, and foul speech, and guard the eyes and ears from the impermissible. The Prophet (peace be upon him) said: 'Whoever does not give up false speech and acting upon it, Allah has no need of his giving up food and drink' (Bukhari 30:13). The fast is broken each evening with iftar, and a pre-dawn meal (suhoor) is recommended. Exemptions exist for the traveler, the sick, pregnant and nursing women, the elderly who cannot fast, and menstruating women — who make up the missed days later. The month of Ramadan is also the month in which the Quran was first revealed, and it contains Laylatul Qadr (the Night of Decree), which is better than a thousand months (Quran 97:3).",
    keyVerses: [
      {
        ref: "Quran 2:183",
        arabic:
          "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
        text: "O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous (achieve taqwa).",
      },
      {
        ref: "Quran 2:185",
        arabic:
          "شَهْرُ رَمَضَانَ ٱلَّذِىٓ أُنزِلَ فِيهِ ٱلْقُرْءَانُ هُدًۭى لِّلنَّاسِ وَبَيِّنَـٰتٍۢ مِّنَ ٱلْهُدَىٰ وَٱلْفُرْقَانِ",
        text: "The month of Ramadan [is that] in which the Quran was revealed, a guidance for the people and clear proofs of guidance and criterion.",
      },
      {
        ref: "Quran 97:3",
        arabic: "لَيْلَةُ ٱلْقَدْرِ خَيْرٌۭ مِّنْ أَلْفِ شَهْرٍۢ",
        text: "The Night of Decree is better than a thousand months.",
      },
    ],
    hadith: [
      {
        ref: "Bukhari 30:14",
        text: "Whoever fasts the month of Ramadan out of faith and seeking reward, his previous sins will be forgiven.",
      },
      {
        ref: "Bukhari 30:13",
        text: "Whoever does not give up false speech and acting upon it and ignorance, Allah has no need of his giving up his food and drink.",
      },
      {
        ref: "Bukhari 30:4",
        text: "Allah said: 'Every deed of the son of Adam is for him except fasting — it is for Me, and I shall reward it.' Fasting is a shield. When one of you is fasting, let him not speak obscenely or act ignorantly. If someone fights him or insults him, let him say: 'I am fasting, I am fasting.'",
      },
    ],
    points: [
      "Obligatory for every sane, adult Muslim during Ramadan",
      "Abstain from food, drink, and marital relations from true dawn (Fajr) to sunset (Maghrib)",
      "The purpose is to achieve taqwa (God-consciousness) — Quran 2:183",
      "Suhoor (pre-dawn meal) is a blessed sunnah — the Prophet encouraged it (Bukhari 30:32)",
      "Exemptions: the traveler, the sick, pregnant/nursing women, the elderly, and menstruating women",
      "Those exempt due to temporary reasons must make up the days; those permanently unable give fidyah (feeding a poor person per day)",
      "Laylatul Qadr falls in the last ten nights of Ramadan — the Prophet would increase his worship during these nights (Bukhari 25:11)",
      "Voluntary fasting outside Ramadan is highly encouraged — Mondays and Thursdays, the white days (13th-15th), and the day of Arafah",
    ],
    misconceptions: [
      {
        title: "Fasting is just about not eating",
        clarification:
          "The Prophet (peace be upon him) made clear that fasting includes guarding the tongue, eyes, and behavior. A person who fasts but lies, backbites, or acts immorally has not truly fasted in the spiritual sense (Bukhari 30:13).",
      },
      {
        title: "Swallowing saliva or accidentally eating breaks the fast",
        clarification:
          "Swallowing one's own saliva does not break the fast. If a person eats or drinks out of forgetfulness, their fast is still valid — the Prophet (peace be upon him) said: 'If he forgets and eats or drinks, let him complete his fast, for it was Allah who fed him and gave him drink' (Bukhari 30:40).",
      },
    ],
    sources: [
      "Sharh Umdatul Ahkam, Ibn Uthaymeen — Chapters on fasting",
      "Al-Mughni, Ibn Qudamah — Section on the rulings of sawm",
      "Majalis Shahr Ramadan, Ibn Uthaymeen — Lessons on fasting and Ramadan",
      "Bukhari 30:4, 32:11 — Hadith on fasting",
      "Tafsir Ibn Kathir — Commentary on Quran 2:183-185, Surah al-Qadr (97)",
    ],
  },
  {
    id: "hajj",
    title: "The Hajj",
    titleAr: "الحج",
    icon: MapPin,
    description:
      "The annual pilgrimage to Makkah — obligatory once in a lifetime for every Muslim who is physically and financially able. Hajj commemorates the legacy of Ibrahim, Hajar, and Ismail, and symbolizes the unity and equality of all believers before Allah.",
    detailedExplanation:
      "Hajj takes place during the 8th-12th of Dhul Hijjah, the last month of the Islamic calendar. The rites begin with entering the state of ihram — a state of consecration marked by wearing simple white garments (for men) and making the intention. The pilgrim performs Tawaf (circling the Ka'bah seven times), Sa'i (walking between Safa and Marwah seven times, commemorating Hajar's search for water), standing at Arafah on the 9th of Dhul Hijjah (the greatest pillar of Hajj), staying overnight at Muzdalifah, stoning the Jamarat (pillars representing where Ibrahim resisted Shaytan), sacrificing an animal (commemorating Ibrahim's willingness to sacrifice Ismail), and shaving or trimming the hair. The Prophet (peace be upon him) performed Hajj only once — the Farewell Pilgrimage in the 10th year after Hijrah — during which he delivered his famous Farewell Sermon and said: 'Take from me your rites of Hajj' (Muslim 15:135).",
    keyVerses: [
      {
        ref: "Quran 3:97",
        arabic:
          "وَلِلَّهِ عَلَى ٱلنَّاسِ حِجُّ ٱلْبَيْتِ مَنِ ٱسْتَطَاعَ إِلَيْهِ سَبِيلًۭا",
        text: "And [due] to Allah from the people is a pilgrimage to the House — for whoever is able to find thereto a way.",
      },
      {
        ref: "Quran 22:27",
        arabic:
          "وَأَذِّن فِى ٱلنَّاسِ بِٱلْحَجِّ يَأْتُوكَ رِجَالًۭا وَعَلَىٰ كُلِّ ضَامِرٍۢ يَأْتِينَ مِن كُلِّ فَجٍّ عَمِيقٍۢ",
        text: "And proclaim to the people the Hajj; they will come to you on foot and on every lean camel; they will come from every distant pass.",
      },
      {
        ref: "Quran 2:197",
        arabic:
          "ٱلْحَجُّ أَشْهُرٌۭ مَّعْلُومَـٰتٌۭ ۚ فَمَن فَرَضَ فِيهِنَّ ٱلْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِى ٱلْحَجِّ",
        text: "Hajj is [during] well-known months, so whoever has made hajj obligatory upon himself therein — there is no sexual relations, no disobedience, and no disputing during hajj.",
      },
    ],
    hadith: [
      {
        ref: "Bukhari 25:9, Muslim 15:495",
        text: "Whoever performs Hajj and does not engage in obscenity or wickedness will return [free of sin] as the day his mother bore him.",
      },
      {
        ref: "Bukhari 26:1",
        text: "An accepted Hajj (Hajj Mabrur) has no reward except Paradise.",
      },
      {
        ref: "Muslim 15:135",
        text: "Take from me your rites of Hajj, for I do not know — perhaps I will not perform Hajj after this year of mine.",
      },
    ],
    points: [
      "Obligatory once in a lifetime for those who are physically and financially able (istitaa'ah)",
      "Takes place on 8th-12th Dhul Hijjah — the last month of the Islamic calendar",
      "Standing at Arafah on the 9th of Dhul Hijjah is the greatest pillar — 'Hajj is Arafah' (Tirmidhi 9:82)",
      "The rites include: ihram, tawaf, sa'i, standing at Arafah, Muzdalifah, stoning the Jamarat, sacrifice, and shaving",
      "All pilgrims wear simple garments (ihram), removing all signs of social status and wealth",
      "The Ka'bah was originally built by Ibrahim and Ismail (Quran 2:127)",
      "The sacrifice commemorates Ibrahim's willingness to sacrifice his son in obedience to Allah",
      "The Day of Arafah (for non-pilgrims) — fasting it expiates the sins of the previous and coming year (Muslim 15:2)",
    ],
    misconceptions: [
      {
        title: "Hajj is just a tourist trip or cultural tradition",
        clarification:
          "Hajj is a profound act of worship with deep spiritual significance. Every rite connects to the legacy of Ibrahim and the submission to Allah. The talbiyah ('Labbayk Allahumma labbayk') is a declaration of answering Allah's call. It is meant to be a transformative, life-changing experience.",
      },
      {
        title: "You can delay Hajj indefinitely if you have the means",
        clarification:
          "The majority of scholars hold that Hajj is an immediate obligation once a person has the means and ability. The Prophet (peace be upon him) said: 'Hasten to perform Hajj — the obligation — for none of you knows what may happen to him' (Musnad Ahmad, graded hasan by some scholars).",
      },
    ],
    sources: [
      "Sharh Umdatul Ahkam, Ibn Uthaymeen — Chapters on Hajj",
      "Al-Mughni, Ibn Qudamah — Section on the rites and rulings of Hajj",
      "Sifat Hajjat an-Nabi, Ibn al-Qayyim (from Zad al-Ma'ad) — Description of the Prophet's Hajj",
      "Bukhari 28:9, 26:1; Muslim 15:135, 1350 — Hadith on Hajj",
      "Tafsir Ibn Kathir — Commentary on Quran 2:127, 2:197, 3:97, 22:27",
    ],
  },
];

const sections = [
  { key: "intro", label: "What are the Pillars?" },
  { key: "importance", label: "Why They Matter" },
  { key: "pillars", label: "The Five Pillars" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── components ───────────────────────── */

function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <ContentCard>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-themed">{pillar.title}</h2>
          <span className="text-lg font-arabic text-gold">{pillar.titleAr}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-themed-muted text-sm leading-relaxed mb-4">
        {pillar.description}
      </p>

      {/* Detailed explanation */}
      <div className="mb-4 p-4 rounded-lg border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
        <h4 className="text-sm font-semibold text-themed mb-2 flex items-center gap-2">
          <BookOpen size={14} className="text-gold" /> Understanding in Depth
        </h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          {pillar.detailedExplanation}
        </p>
      </div>

      {/* Key points */}
      <ul className="space-y-2 mb-4">
        {pillar.points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm text-themed">
            <span className="text-gold mt-0.5">&#9670;</span>
            {point}
          </li>
        ))}
      </ul>

      {/* All verses */}
      <div className="space-y-3 mb-4">
        {pillar.keyVerses.map((verse) => (
          <div
            key={verse.ref}
            className="rounded-lg p-4"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            {verse.arabic && (
              <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                {verse.arabic}
              </p>
            )}
            <p className="text-themed text-sm italic">
              &ldquo;{verse.text}&rdquo;
            </p>
            <p className="text-xs text-themed-muted mt-2"><HadithRefText text={verse.ref} /></p>
          </div>
        ))}
      </div>

      {/* Hadith */}
      {pillar.hadith.length > 0 && (
        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-semibold text-themed">From the Sunnah</h4>
          {pillar.hadith.map((h) => (
            <div
              key={h.ref}
              className="rounded-lg p-4 border-l-2 border-gold/30"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              <p className="text-themed text-sm italic">
                &ldquo;{h.text}&rdquo;
              </p>
              <p className="text-xs text-themed-muted mt-2"><HadithRefText text={h.ref} /></p>
            </div>
          ))}
        </div>
      )}

      {/* Misconceptions */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-themed flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400" />
          Common Misconceptions
        </h4>
        {pillar.misconceptions.map((m) => (
          <div
            key={m.title}
            className="rounded-lg p-4 border border-red-500/10"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <p className="text-themed text-sm font-medium mb-1">{m.title}</p>
            <p className="text-themed-muted text-sm">{m.clarification}</p>
          </div>
        ))}
      </div>
    </ContentCard>
  );
}

/* ───────────────────────── page ───────────────────────── */

function PillarsContent() {
  const searchParams = useSearchParams();
  useScrollToSection();
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "intro");
  const [activePillar, setActivePillar] = useState("shahada");
  const [search, setSearch] = useState("");

  const mattersMatches = (item: { point: string; detail: string; reference: string }) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, item.point, item.detail, item.reference);
  };

  const pillarMatches = (pillar: Pillar) => {
    if (!search || search.length < 2) return true;
    return textMatch(
      search,
      pillar.title,
      pillar.titleAr,
      pillar.description,
      pillar.detailedExplanation,
      ...pillar.points,
      ...pillar.keyVerses.flatMap((v) => [v.ref, v.text, v.arabic]),
      ...pillar.hadith.flatMap((h) => [h.ref, h.text]),
      ...pillar.misconceptions.flatMap((m) => [m.title, m.clarification]),
      ...pillar.sources,
    );
  };

  return (
    <div>
      <PageHeader
        title="Pillars of Islam"
        titleAr="أركان الإسلام"
        subtitle="The five foundational acts of worship upon which Islam is built"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search pillars, practices, verses..." className="mb-6" />

      {/* Section navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
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
        {/* ─── What are the Pillars? ─── */}
        {activeSection === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Hadith of Jibril */}
            <ContentCard>
              <div className="text-center py-6">
                <p className="text-xs text-themed-muted mb-3 uppercase tracking-wider">
                  Hadith of Ibn Umar
                </p>
                <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose mb-4">
                  بُنِيَ الإسْلامُ عَلَى خَمْسٍ شَهَادَةِ أنْ لا إلَهَ إلَّا اللَّهُ وَأنَّ مُحَمَّدًا رَسُولُ اللَّهِ وَإقَامِ الصَّلاةِ وَإيتَاءِ الزَّكَاةِ وَصَوْمِ رَمَضَانَ وَحَجِّ الْبَيْتِ
                </p>
                <p className="text-themed-muted italic mb-2 max-w-2xl mx-auto">
                  &ldquo;Islam is built upon five: the testimony that there is no god but Allah and that Muhammad is the Messenger of Allah, establishing the prayer, giving the zakat, fasting Ramadan, and performing pilgrimage to the House.&rdquo;
                </p>
                <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Bukhari 2:1, Muslim 1:21
                </span>
              </div>
            </ContentCard>

            {/* Definition */}
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">What are the Pillars of Islam?</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  The <span className="text-themed font-medium">Pillars of Islam</span> (أركان الإسلام) are the five obligatory acts of worship that form the foundation of a Muslim&apos;s practice. They were defined by the Prophet Muhammad (peace be upon him) in the famous hadith narrated by Ibn Umar, and also referenced in the Hadith of Jibril (Muslim 1:1) when the angel asked about Islam.
                </p>
                <p>
                  While the <span className="text-themed font-medium">Articles of Faith</span> (Arkan al-Iman) are the six inner beliefs of the heart, the <span className="text-themed font-medium">Pillars of Islam</span> are the outward actions that demonstrate and strengthen those beliefs. The two are inseparable — faith without action is incomplete, and action without faith is hollow.
                </p>
                <p>
                  The Prophet (peace be upon him) likened Islam to a building — the pillars are what hold it up. Remove one, and the entire structure is weakened. These five acts cover every dimension of human life: the tongue (shahada), the body (salah), wealth (zakat), desire (sawm), and journey (hajj).
                </p>
              </div>
            </ContentCard>

            {/* Islam vs Iman vs Ihsan */}
            <ContentCard delay={0.2}>
              <h2 className="text-xl font-semibold text-themed mb-4">Islam, Iman, and Ihsan</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  In the Hadith of Jibril, the Prophet (peace be upon him) distinguished three levels of the religion: <span className="text-themed font-medium">Islam</span> (outward submission — these five pillars), <span className="text-themed font-medium">Iman</span> (inward belief — the six articles of faith), and <span className="text-themed font-medium">Ihsan</span> (excellence — to worship Allah as though you see Him).
                </p>
                <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg)" }}>
                  <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                    قَالَ فَأَخْبِرْنِي عَنِ الإِسْلامِ
                  </p>
                  <p className="text-themed text-sm italic text-center">
                    &ldquo;He (Jibril) said: Then tell me about Islam.&rdquo;
                  </p>
                  <p className="text-xs text-themed-muted mt-2 text-center">Muslim 1:1</p>
                </div>
                <p>
                  The pillars are the minimum requirements for a person&apos;s Islam to be valid. Beyond them, there are countless voluntary acts (nawafil) that bring the servant closer to Allah. But the obligatory acts always take priority — the Prophet (peace be upon him) said that Allah said: &ldquo;My servant does not draw near to Me with anything more beloved to Me than the religious duties I have obligated upon him.&rdquo; (Bukhari 2:37)
                </p>
              </div>
            </ContentCard>

            {/* Overview of the five */}
            <ContentCard delay={0.3}>
              <h2 className="text-xl font-semibold text-themed mb-4">The Five Pillars</h2>
              <p className="text-themed-muted text-sm leading-relaxed mb-4">
                Each pillar addresses a different aspect of the Muslim&apos;s life and worship:
              </p>
              <div className="space-y-3">
                {pillars.filter(pillarMatches).map((pillar) => (
                  <button
                    key={pillar.id}
                    onClick={() => {
                      setActivePillar(pillar.id);
                      setActiveSection("pillars");
                    }}
                    className="w-full text-left rounded-lg p-4 border sidebar-border hover:border-gold/30 transition-colors"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-semibold text-themed text-sm">{pillar.title}</h3>
                      <span className="text-xs font-arabic text-gold/70">{pillar.titleAr}</span>
                    </div>
                    <p className="text-xs text-themed-muted mt-0.5 line-clamp-1">{pillar.description}</p>
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
                  "Bukhari 2:1, Muslim 1:21 — Hadith of Ibn Umar on the five pillars",
                  "Muslim 1:1 — The Hadith of Jibril, defining Islam, Iman, and Ihsan",
                  "Sharh Usul al-Iman, Ibn Uthaymeen — On the pillars of Islam",
                  "Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah — On the foundations of the religion",
                ].map((source) => (
                  <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    <HadithRefText text={source} />
                  </li>
                ))}
              </ul>
            </ContentCard>
          </motion.div>
        )}

        {/* ─── Why They Matter ─── */}
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
                  وَمَآ أُمِرُوٓا إِلَّا لِيَعْبُدُوا ٱللَّهَ مُخْلِصِينَ لَهُ ٱلدِّينَ حُنَفَآءَ وَيُقِيمُوا ٱلصَّلَوٰةَ وَيُؤْتُوا ٱلزَّكَوٰةَ ۚ وَذَٰلِكَ دِينُ ٱلْقَيِّمَةِ
                </p>
                <p className="text-themed-muted italic">
                  &ldquo;And they were not commanded except to worship Allah, sincere to Him in religion, inclining to truth, and to establish prayer and give zakah. And that is the correct religion.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 98:5</p>
              </div>
            </ContentCard>

            {whyItMatters.filter(mattersMatches).map((item, i) => (
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

            {/* Quran 2:177 */}
            <ContentCard delay={0.35}>
              <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg)" }}>
                <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                  لَّيْسَ ٱلْبِرَّ أَن تُوَلُّوا وُجُوهَكُمْ قِبَلَ ٱلْمَشْرِقِ وَٱلْمَغْرِبِ وَلَـٰكِنَّ ٱلْبِرَّ مَنْ ءَامَنَ بِٱللَّهِ وَٱلْيَوْمِ ٱلْـَٔاخِرِ وَٱلْمَلَـٰٓئِكَةِ وَٱلْكِتَـٰبِ وَٱلنَّبِيِّـۧنَ وَءَاتَى ٱلْمَالَ عَلَىٰ حُبِّهِۦ ذَوِى ٱلْقُرْبَىٰ وَٱلْيَتَـٰمَىٰ وَٱلْمَسَـٰكِينَ
                </p>
                <p className="text-themed text-sm italic">
                  &ldquo;Righteousness is not that you turn your faces toward the east or the west, but [true] righteousness is in one who believes in Allah, the Last Day, the angels, the Book, and the prophets, and gives wealth, in spite of love for it, to relatives, orphans, the needy...&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 2:177</p>
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
                  "Bukhari 2:1, Muslim 1:21 — The five pillars hadith",
                  "Muslim 1:139 — On the five prayers as expiation for sins",
                  "Sharh Usul al-Iman, Ibn Uthaymeen — On the importance of the pillars",
                  "Tafsir Ibn Kathir — Commentary on Quran 2:177, 3:103, 98:5",
                ].map((source) => (
                  <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    <HadithRefText text={source} />
                  </li>
                ))}
              </ul>
            </ContentCard>
          </motion.div>
        )}

        {/* ─── The Five Pillars ─── */}
        {activeSection === "pillars" && (
          <motion.div
            key="pillars"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Pillar subtabs */}
            <div className="flex justify-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
              {pillars.filter(pillarMatches).map((pillar) => (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar.id)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activePillar === pillar.id
                      ? "bg-gold/20 text-gold border border-gold/40"
                      : "text-themed-muted hover:text-themed border sidebar-border"
                  }`}
                >
                  {pillar.title.replace("The ", "")}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {pillars.filter(pillarMatches).map(
                (pillar) =>
                  activePillar === pillar.id && (
                    <motion.div
                      key={pillar.id}
                      id={`section-${pillar.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <PillarCard pillar={pillar} />

                      {/* Sources */}
                      {pillar.sources.length > 0 && (
                        <div className="mt-4">
                          <ContentCard delay={0.15}>
                            <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                              <BookOpen size={14} className="text-gold" />
                              Sources &amp; References
                            </h4>
                            <ul className="space-y-1.5">
                              {pillar.sources.map((source) => (
                                <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                                  <span className="text-gold/40 mt-0.5">&#8226;</span>
                                  <HadithRefText text={source} />
                                </li>
                              ))}
                            </ul>
                          </ContentCard>
                        </div>
                      )}
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PillarsPage() {
  return <Suspense><PillarsContent /></Suspense>;
}
