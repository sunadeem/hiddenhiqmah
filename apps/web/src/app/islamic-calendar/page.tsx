"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import { Calendar } from "lucide-react";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";

/* ───────────────────────── data ───────────────────────── */

type Month = {
  id: number;
  name: string;
  nameAr: string;
  meaning: string;
  sacred: boolean;
  intro: string;
  points: { title: string; detail: string; note?: string }[];
};

const months: Month[] = [
  {
    id: 1,
    name: "Muharram",
    nameAr: "مُحَرَّم",
    meaning: "The Sacred / The Forbidden",
    sacred: true,
    intro:
      "Muharram is the first month of the Islamic calendar and one of the four sacred months in which fighting is forbidden. The Prophet (peace be upon him) called it 'the month of Allah' and encouraged fasting in it.",
    points: [
      {
        title: "The best fasting after Ramadan",
        detail:
          "The Prophet (peace be upon him) said: 'The best fasting after the month of Ramadan is fasting in the month of Allah — al-Muharram.'",
        note: "Muslim 13:261",
      },
      {
        title: "The Day of Ashura (10th Muharram)",
        detail:
          "Fasting on the 10th of Muharram expiates the sins of the previous year. The Prophet (peace be upon him) fasted it and said: 'I hope that Allah will expiate the sins of the year before it.' He also intended to fast the 9th alongside it to differ from the People of the Book.",
        note: "Muslim 13:253; Muslim 13:173",
      },
      {
        title: "Ashura and Musa (peace be upon him)",
        detail:
          "When the Prophet (peace be upon him) came to Madinah, he found the Jews fasting on Ashura. They said: 'This is the day on which Allah saved Musa and his people, and drowned Pharaoh and his people.' The Prophet said: 'We have more right to Musa than you,' and he fasted it.",
        note: "Bukhari 30:109; Muslim 13:162",
      },
      {
        title: "Ashura and Karbala (10th Muharram)",
        detail:
          "In 61 AH — decades after the Prophet's death — his grandson al-Husayn ibn Ali (may Allah be pleased with him) was killed at Karbala in Iraq on the 10th of Muharram, a tragedy Sunnis remember with deep grief. The Prophet (peace be upon him) had loved him dearly; he was seen carrying al-Hasan on his shoulder, saying: 'O Allah! I love him, so please love him,' and he called al-Hasan and al-Husayn 'my two sweet basils in this world.' The fast of Ashura, however, was established centuries earlier for the deliverance of Musa (peace be upon him) and is entirely independent of this later event.",
        note: "Bukhari 62:94; Bukhari 62:98",
      },
      {
        title: "The Islamic New Year (1st Muharram)",
        detail:
          "Muharram opens the Hijri year, whose count begins from the Prophet's migration (Hijrah) to Madinah rather than his birth or the first revelation. No specific prayer, celebration, or act of worship is prescribed for the 1st of Muharram in the authentic Sunnah — it is not observed like the two Eids. The month's real virtue lies in its voluntary fasting, above all the Day of Ashura.",
        note: "Established under Umar ibn al-Khattab (may Allah be pleased with him); the Hijrah itself: Bukhari 63:131",
      },
    ],
  },
  {
    id: 2,
    name: "Safar",
    nameAr: "صَفَر",
    meaning: "The Empty / The Void",
    sacred: false,
    intro:
      "Safar is the second month of the Islamic calendar. Its name may come from the emptying of houses as the Arabs would leave for travel or battle. The pre-Islamic Arabs considered it an unlucky month, which Islam rejected.",
    points: [
      {
        title: "No bad omen in Safar",
        detail:
          "The Prophet (peace be upon him) said: 'There is no contagion, no evil omen, no haamah (a pre-Islamic superstition about owls), and no Safar (superstition about the month).' Islam rejects the pre-Islamic belief that Safar brings misfortune.",
        note: "Bukhari 76:27; Muslim 39:141",
      },
      {
        title: "The Hijrah journey",
        detail:
          "The Prophet (peace be upon him) and Abu Bakr departed from Makkah on the Hijrah during the month of Safar (or late Muharram), arriving in Madinah in Rabi al-Awwal. This journey marks the beginning of the Islamic calendar.",
        note: "Bukhari 63:131",
      },
    ],
  },
  {
    id: 3,
    name: "Rabi al-Awwal",
    nameAr: "رَبِيع الأَوَّل",
    meaning: "The First Spring",
    sacred: false,
    intro:
      "Rabi al-Awwal is the third month. It is best known as the month in which the Prophet Muhammad (peace be upon him) was born, and also the month in which he passed away and in which the Hijrah to Madinah was completed.",
    points: [
      {
        title: "Birth of the Prophet (peace be upon him)",
        detail:
          "The majority of scholars agree that the Prophet (peace be upon him) was born on a Monday in Rabi al-Awwal. When asked about fasting on Monday, he said: 'That is the day on which I was born, the day on which I was sent, and the day on which revelation came to me.'",
        note: "Muslim 13:256",
      },
      {
        title: "The Prophet's arrival in Madinah",
        detail:
          "The Prophet (peace be upon him) arrived in Madinah during Rabi al-Awwal, completing the Hijrah. Upon arrival, he built Masjid Quba — the first mosque in Islam — and then proceeded to establish Masjid an-Nabawi.",
        note: "Bukhari 63:131",
      },
      {
        title: "The Prophet's death",
        detail:
          "The Prophet (peace be upon him) also passed away on Monday, 12th Rabi al-Awwal, 11 AH. Anas ibn Malik said: 'The day the Prophet entered Madinah, everything was bright, and the day he died, everything became dark.'",
        note: "Tirmidhi 49:14; graded Sahih",
      },
      {
        title: "Do Muslims celebrate the Prophet's birthday?",
        detail:
          "Because the 12th of Rabi al-Awwal is remembered as the Prophet's birthday (mawlid), new Muslims often ask whether it should be celebrated — and scholars have long differed. The exact date of his birth is itself not certain in the sources, and there is no report that the Prophet (peace be upon him) or his companions marked the day with a special observance. Some later scholars permitted gatherings of gratitude, remembrance, and sending salawat upon him; others hold that no fixed annual celebration was prescribed. What all agree on is that loving him, following his Sunnah, and sending blessings upon him are acts of worship for every day of the year, not one.",
        note: "Scholarly positions differ; the date is not fixed in the authentic sources and no annual observance is prescribed in them — a matter to take up with a trusted scholar.",
      },
    ],
  },
  {
    id: 4,
    name: "Rabi al-Thani",
    nameAr: "رَبِيع الثَّانِي",
    meaning: "The Second Spring",
    sacred: false,
    intro:
      "Rabi al-Thani is the fourth month of the Islamic calendar, also called Rabi al-Akhir. There are no specific acts of worship or major events uniquely associated with this month in the authenticated Sunnah.",
    points: [
      {
        title: "A time for continued worship",
        detail:
          "While no specific acts of worship are designated for this month, the general encouragement of voluntary fasting, prayer, and dhikr applies throughout the year. The Prophet (peace be upon him) said: 'The most beloved deeds to Allah are the most consistent, even if small.'",
        note: "Bukhari 81:53",
      },
    ],
  },
  {
    id: 5,
    name: "Jumada al-Ula",
    nameAr: "جُمَادَى الأُولَى",
    meaning: "The First Dry / Frozen",
    sacred: false,
    intro:
      "Jumada al-Ula is the fifth month. Its name comes from 'jamad' (to freeze), as it originally fell in winter when the month was first named. There are no specific acts of worship tied to this month in the Sunnah.",
    points: [
      {
        title: "Birth of Fatimah (may Allah be pleased with her)",
        detail:
          "Some historians place the birth of Fatimah, the daughter of the Prophet (peace be upon him), in this month, approximately five years before prophethood. She is the mother of al-Hasan and al-Husayn, and the Prophet said: 'Fatimah is the leader of the women of Paradise.'",
        note: "Bukhari 61:129",
      },
      {
        title: "The Battle of Mu'tah",
        detail:
          "The Battle of Mu'tah was fought in Jumada al-Ula of 8 AH near the Byzantine frontier — the first major encounter between the Muslims and the Roman empire. After its three appointed commanders were martyred one after another, Khalid ibn al-Walid took up the banner and skilfully withdrew the vastly outnumbered army, later earning the title 'Sayf Allah' (the Sword of Allah). The month-dating is a matter of the recorded sīrah, and no specific worship is tied to it.",
        note: "Historical event recorded in the sīrah; no specific worship is attached to this month.",
      },
    ],
  },
  {
    id: 6,
    name: "Jumada al-Thani",
    nameAr: "جُمَادَى الثَّانِيَة",
    meaning: "The Second Dry / Frozen",
    sacred: false,
    intro:
      "Jumada al-Thani (also called Jumada al-Akhirah) is the sixth month. Like its predecessor, there are no specific acts of worship uniquely tied to this month in the authenticated sources.",
    points: [
      {
        title: "Death of Abu Talib",
        detail:
          "Abu Talib, the uncle of the Prophet (peace be upon him) who protected him for decades, is reported by some historians to have died in this month (though others say Shawwal) in the 10th year of prophethood — the 'Year of Sorrow' (Am al-Huzn).",
        note: "Bukhari 23:113; Muslim 1:39",
      },
    ],
  },
  {
    id: 7,
    name: "Rajab",
    nameAr: "رَجَب",
    meaning: "The Revered / The Respected",
    sacred: true,
    intro:
      "Rajab is the seventh month and one of the four sacred months. Its name comes from 'tarjib' (to honor/revere). It stands alone as the only sacred month not adjacent to the others. The Prophet's Night Journey (al-Isra wal-Mi'raj) is traditionally placed in this month.",
    points: [
      {
        title: "One of the four sacred months",
        detail:
          "Rajab is singled out as a sacred month. It is called 'Rajab al-Fard' (the solitary Rajab) because it stands alone, separated from the other three sacred months (Dhul Qi'dah, Dhul Hijjah, and Muharram) which are consecutive.",
        note: "Bukhari 65:184; Muslim 13:261",
      },
      {
        title: "Al-Isra wal-Mi'raj",
        detail:
          "The Night Journey and Ascension — when the Prophet (peace be upon him) was taken from Masjid al-Haram to Masjid al-Aqsa, and then ascended through the heavens — is traditionally placed on the 27th of Rajab, though the exact date is not confirmed in the Sunnah. During this journey, the five daily prayers were prescribed.",
        note: "Bukhari 63:112; Muslim 1:321",
      },
      {
        title: "No specific fasting authenticated",
        detail:
          "There is no authentic hadith that singles out Rajab for special fasting. Ibn Hajar said: 'There is no authentic hadith that is fit to be used as evidence that speaks of the virtue of fasting in Rajab specifically.' The general virtues of fasting in the sacred months apply.",
        note: "Tabyin al-Ajab, Ibn Hajar; Abu Dawud 14:116",
      },
    ],
  },
  {
    id: 8,
    name: "Sha'ban",
    nameAr: "شَعْبَان",
    meaning: "The Scattered / The Branching",
    sacred: false,
    intro:
      "Sha'ban is the eighth month, named because the Arab tribes would 'scatter' (tasha'aba) in search of water. It falls between Rajab and Ramadan, and the Prophet (peace be upon him) used to fast extensively in it.",
    points: [
      {
        title: "The Prophet fasted most of Sha'ban",
        detail:
          "A'ishah (may Allah be pleased with her) said: 'I never saw the Prophet fast a complete month except Ramadan, and I never saw him fast more in any month than he did in Sha'ban.' He fasted most of Sha'ban.",
        note: "Bukhari 30:76; Muslim 13:229",
      },
      {
        title: "Deeds are raised to Allah",
        detail:
          "The Prophet (peace be upon him) said: 'That is a month to which people do not pay attention, between Rajab and Ramadan. It is a month in which deeds are raised to the Lord of the worlds, and I like for my deeds to be raised while I am fasting.'",
        note: "Nasai 22:268; graded Hasan",
      },
      {
        title: "Do not fast in the second half to prepare for Ramadan",
        detail:
          "The Prophet (peace be upon him) said: 'When the first half of Sha'ban is over, do not fast.' This is to preserve strength for Ramadan. However, one who has a regular fasting habit (like Monday/Thursday) may continue it.",
        note: "Abu Dawud 14:25; Tirmidhi 8:57",
      },
      {
        title: "The night of mid-Sha'ban",
        detail:
          "The 15th night of Sha'ban is widely observed in many communities, so it deserves an honest treatment. There is a narration, graded hasan (sound) by a number of scholars, that: 'Allah looks down on the night of the middle of Sha’ban and forgives all His creation, apart from the idolater and the Mushahin' (one who harbours enmity). On its strength, seeking Allah's forgiveness that night is good. However, the popular reports that single out this one night for a special communal vigil and its day for a special fast are weak, and were not the practice of the Prophet (peace be upon him) or his companions. What is authentic is the general instruction to ease off fasting from mid-Sha'ban onward to save strength for Ramadan.",
        note: "Ibn Majah 5:588 (graded hasan by some); Ibn Majah 5:586 (weak); Ibn Majah 7:14",
      },
    ],
  },
  {
    id: 9,
    name: "Ramadan",
    nameAr: "رَمَضَان",
    meaning: "The Scorching / The Burning",
    sacred: false,
    intro:
      "Ramadan is the ninth month and the holiest month in the Islamic calendar. Fasting during Ramadan is the fourth pillar of Islam. It is the month in which the Quran was revealed, and it contains Laylatul Qadr — a night better than a thousand months.",
    points: [
      {
        title: "Fasting is obligatory",
        detail:
          "Allah says: 'O you who believe, fasting has been prescribed for you as it was prescribed for those before you, so that you may attain taqwa.' Fasting from true dawn to sunset is required for every sane, adult Muslim who is able.",
        note: "Quran 2:183",
      },
      {
        title: "The month the Quran was revealed",
        detail:
          "Allah says: 'The month of Ramadan in which the Quran was revealed — a guidance for the people and clear proofs of guidance and criterion.' The Prophet (peace be upon him) and Jibreel would review the Quran together every Ramadan.",
        note: "Quran 2:185; Bukhari 91:10",
      },
      {
        title: "Laylatul Qadr — better than a thousand months",
        detail:
          "The Night of Decree falls in the odd nights of the last ten days. Allah says: 'The Night of Decree is better than a thousand months. The angels and the Spirit descend therein by permission of their Lord for every matter. Peace it is until the emergence of dawn.'",
        note: "Quran 97:1-5; Bukhari 32:1",
      },
      {
        title: "The gates of Paradise are opened",
        detail:
          "The Prophet (peace be upon him) said: 'When Ramadan begins, the gates of Paradise are opened, the gates of Hellfire are closed, and the devils are chained.'",
        note: "Bukhari 30:9; Muslim 13:1",
      },
      {
        title: "The Battle of Badr (17 Ramadan, 2 AH)",
        detail:
          "The first decisive battle of Islam was fought at Badr during Ramadan of 2 AH, when a small, poorly-equipped band of Muslims defeated a far larger Quraysh army. Allah recalled it to the believers: 'Allah had helped you at Badr when you were weak; then fear Allah so that you may be grateful.' The well-known 17-Ramadan dating comes from the sīrah.",
        note: "Quran 3:123",
      },
      {
        title: "The Conquest of Makkah (Ramadan, 8 AH)",
        detail:
          "In Ramadan of 8 AH the Prophet (peace be upon him) marched on Makkah. Ibn Abbas reported that he set out with 'ten-thousand (Muslim warriors) in (the month of) Ramadan.' He and his companions fasted until they reached a watering-place between Usfan and Qudaid, where he broke his fast so the people would follow his lead. Makkah was taken almost without bloodshed, and the Prophet forgave its people.",
        note: "Bukhari 64:310; Bukhari 64:313",
      },
    ],
  },
  {
    id: 10,
    name: "Shawwal",
    nameAr: "شَوَّال",
    meaning: "The Raising / The Lifting",
    sacred: false,
    intro:
      "Shawwal is the tenth month, beginning with Eid al-Fitr — the celebration marking the end of Ramadan. Fasting six days of Shawwal after Ramadan carries an immense reward.",
    points: [
      {
        title: "Eid al-Fitr (1st Shawwal)",
        detail:
          "The first day of Shawwal is Eid al-Fitr, the day of celebration after Ramadan. It is forbidden to fast on this day. The Prophet (peace be upon him) would eat an odd number of dates before going to the Eid prayer.",
        note: "Bukhari 13:5",
      },
      {
        title: "Fasting six days equals fasting the whole year",
        detail:
          "The Prophet (peace be upon him) said: 'Whoever fasts Ramadan and then follows it with six days of Shawwal, it will be as if he fasted the entire year.' (Ramadan = 10 months reward, 6 days = 2 months reward = 12 months total.)",
        note: "Muslim 13:264",
      },
      {
        title: "The Battle of Uhud",
        detail:
          "The Battle of Uhud took place on the 7th of Shawwal, 3 AH. Seventy companions were martyred, including Hamzah ibn Abdil-Muttalib, the uncle of the Prophet (peace be upon him).",
        note: "Bukhari 64:90",
      },
      {
        title: "The Battle of the Trench (5 AH)",
        detail:
          "The Battle of the Trench (al-Khandaq), also called the Battle of the Confederates (al-Ahzab), began around Shawwal of 5 AH. On the advice of Salman al-Farisi the Muslims dug a trench to defend Madinah against a besieging coalition, and after weeks of siege Allah scattered the enemy with a bitter wind. Surah al-Ahzab (33) recounts these events. The month-dating follows the sīrah.",
        note: "Events recounted in Surah al-Ahzab (33); the month-dating follows the sīrah.",
      },
    ],
  },
  {
    id: 11,
    name: "Dhul Qi'dah",
    nameAr: "ذُو القَعْدَة",
    meaning: "The Month of Sitting / Truce",
    sacred: true,
    intro:
      "Dhul Qi'dah is the eleventh month and one of the four sacred months. Its name means 'the month of sitting' because the Arabs would sit (refrain) from fighting. It is the month preceding the Hajj season.",
    points: [
      {
        title: "One of the four sacred months",
        detail:
          "Dhul Qi'dah is the first of the three consecutive sacred months (Dhul Qi'dah, Dhul Hijjah, and Muharram). Fighting was prohibited during these months, and the Arabs would observe a truce to allow safe travel for pilgrimage.",
        note: "Quran 9:36; Bukhari 65:184",
      },
      {
        title: "The Prophet's Umrahs",
        detail:
          "The Prophet (peace be upon him) performed all four of his Umrahs in Dhul Qi'dah. Ibn Abbas said: 'He performed Umrah four times, all of them in Dhul Qi'dah except the one he performed with his Hajj.'",
        note: "Bukhari 64:192",
      },
      {
        title: "The Treaty of Hudaybiyyah (6 AH)",
        detail:
          "In Dhul Qi'dah of 6 AH the Prophet (peace be upon him) set out for Umrah but was stopped at al-Hudaybiyyah, where he concluded a ten-year truce with Quraysh. Though it looked like a setback, the Quran described it as a clear victory (Surah al-Fath, 48), and the following Dhul Qi'dah he returned to perform the very Umrah he had been prevented from — one of the four Umrahs he offered, all of them in this month.",
        note: "Bukhari 64:192; the truce is recounted in Surah al-Fath (48).",
      },
    ],
  },
  {
    id: 12,
    name: "Dhul Hijjah",
    nameAr: "ذُو الحِجَّة",
    meaning: "The Month of Hajj",
    sacred: true,
    intro:
      "Dhul Hijjah is the twelfth and final month of the Islamic calendar. It is the month of Hajj — the fifth pillar of Islam — and contains the best days of the entire year: the first ten days.",
    points: [
      {
        title: "The first ten days are the best days of the year",
        detail:
          "The Prophet (peace be upon him) said: 'There are no days on which righteous deeds are more beloved to Allah than these ten days.' The companions asked: 'Not even jihad for the sake of Allah?' He said: 'Not even jihad, except for a man who goes out with his self and his wealth and returns with neither.'",
        note: "Bukhari 13:18",
      },
      {
        title: "For non-pilgrims: what to do in the ten days",
        detail:
          "You do not need to be at Hajj to share in these best days. It is recommended to fast the first nine days (ending the day before Eid), to increase in dhikr, du'a and charity, and to raise the takbir — 'Allahu akbar, Allahu akbar, la ilaha illa Allah, Allahu akbar, Allahu akbar, wa lillahil-hamd' — throughout the ten days. The Prophet (peace be upon him) counted the Day of Arafah, the Day of Nahr and the days of Tashriq as 'Eid for us... days of eating and drinking.'",
        note: "Bukhari 13:18; Tirmidhi 8:68; Tirmidhi 8:92",
      },
      {
        title: "For the one sacrificing: leave hair and nails",
        detail:
          "There is a famous ruling most new Muslims have never heard: once the ten days of Dhul Hijjah begin, anyone who intends to offer a sacrifice (udhiyah) should not remove any hair or clip any nails until the animal is slaughtered. The Prophet (peace be upon him) said: 'When any one of you intending to sacrifice the animal enters in the month (of Dhu'l-Hijja) he should not get his hair or nails touched (cut).' Scholars differ on whether this is obligatory or strongly recommended, so follow the guidance of a trusted scholar.",
        note: "Muslim 35:53; Muslim 35:54",
      },
      {
        title: "The Day of Arafah (9th Dhul Hijjah)",
        detail:
          "The Prophet (peace be upon him) said: 'Fasting on the Day of ‘Arafah, I hope from Allah, expiates for the sins of the year before and the year after.' For those not performing Hajj, it is the most recommended day to fast in the entire year. It is also the best day for supplication — the Prophet called the du'a of the Day of Arafah the best of supplications, so pour out your du'a wherever you are.",
        note: "Ibn Majah 7:93; Tirmidhi 48:216",
      },
      {
        title: "Eid al-Adha (10th Dhul Hijjah)",
        detail:
          "The Day of Sacrifice, the greatest day in the Islamic calendar. The Prophet (peace be upon him) said: 'The greatest day in the sight of Allah is the Day of Sacrifice.' Muslims offer an animal sacrifice (udhiyah) commemorating Ibrahim's willingness to sacrifice his son.",
        note: "Abu Dawud 11:45; Bukhari 73:9",
      },
      {
        title: "The days of Tashriq (11th-13th)",
        detail:
          "The Prophet (peace be upon him) said: 'The days of Tashriq are days of eating, drinking, and remembering Allah.' Fasting is forbidden on these days. The takbirat (Allahu Akbar) continue to be recited after every prayer.",
        note: "Muslim 13:183",
      },
      {
        title: "Hajj — the fifth pillar of Islam",
        detail:
          "The rites of Hajj take place on the 8th-12th of Dhul Hijjah. The Prophet (peace be upon him) said: 'An accepted Hajj has no reward except Paradise.' Over two million Muslims gather at Makkah annually to fulfill this pillar.",
        note: "Bukhari 26:1; Muslim 15:493",
      },
      {
        title: "The Farewell Hajj (10 AH)",
        detail:
          "In Dhul Hijjah of 10 AH the Prophet (peace be upon him) led his only Hajj — the Farewell Pilgrimage — and delivered his Farewell Sermon at Arafah before a vast gathering of companions, affirming the sanctity of life, wealth and honour, the rights of women, and the completion of his message. He passed away less than three months later, in Rabi al-Awwal of 11 AH. The pilgrimage is recorded in detail in the sīrah and the Sunnah.",
        note: "The Farewell Pilgrimage is recorded in the sīrah and the Sunnah.",
      },
    ],
  },
];

const keyDates = [
  { date: "1 Muharram", event: "Islamic New Year", note: "Beginning of the Hijri calendar year" },
  { date: "10 Muharram", event: "Day of Ashura", note: "Recommended fast — expiates previous year's sins (Muslim 13:253)" },
  { date: "12 Rabi al-Awwal", event: "Birth of the Prophet (peace be upon him)", note: "Widely accepted date; he was born on a Monday" },
  { date: "27 Rajab", event: "Al-Isra wal-Mi'raj", note: "Traditional date of the Night Journey (exact date not confirmed in Sunnah)" },
  { date: "15 Sha'ban", event: "Mid-Sha'ban", note: "Some scholars note its virtue; no specific authenticated acts of worship for this night" },
  { date: "1 Ramadan", event: "Beginning of Ramadan", note: "Start of the obligatory fast" },
  { date: "Last 10 nights", event: "Laylatul Qadr", note: "Sought in the odd nights of the last ten days of Ramadan (Bukhari 32:1)" },
  { date: "1 Shawwal", event: "Eid al-Fitr", note: "Celebration after Ramadan — fasting is prohibited" },
  { date: "1-10 Dhul Hijjah", event: "Best days of the year", note: "Good deeds are most beloved to Allah in these days (Bukhari 13:18). Non-pilgrims: fast the first nine days, increase dhikr and du'a, raise the takbir, and — if intending to sacrifice — leave hair and nails until Eid (Muslim 35:53)" },
  { date: "9 Dhul Hijjah", event: "Day of Arafah", note: "Fasting expiates sins of two years (Muslim 13:253)" },
  { date: "10 Dhul Hijjah", event: "Eid al-Adha", note: "The Day of Sacrifice — the greatest day of the year" },
  { date: "11-13 Dhul Hijjah", event: "Days of Tashriq", note: "Days of eating, drinking, and dhikr — fasting prohibited (Muslim 13:183)" },
];

// Weekly and monthly recurring observances — the rhythm most of a practising
// Muslim's calendar is actually built on (rendered as a group above the annual dates).
const recurringObservances = [
  {
    date: "Every Mon & Thu",
    event: "Fasting Monday and Thursday",
    note: "Deeds are presented to Allah on these two days, and the Prophet loved his deeds presented while fasting; Monday is also the day he was born and received revelation (Tirmidhi 8:66; Nasai 22:276; Muslim 13:256)",
  },
  {
    date: "13, 14, 15 each month",
    event: "The White Days (ayyam al-bid)",
    note: "The Prophet advised fasting the 13th, 14th and 15th of every lunar month; three days a month equals fasting the whole year in reward (Tirmidhi 8:80; Tirmidhi 8:81; Bukhari 30:88)",
  },
  {
    date: "Every Friday",
    event: "Jumu'ah — the best day of the week",
    note: "'The best day on which the sun has risen is Friday' — the weekly congregational prayer (see the Salah guide for its rites); do not single out Friday alone for fasting (Muslim 7:26; Bukhari 30:92)",
  },
];

/* ── Hijri ⇄ Gregorian helpers (Umm al-Qura via Intl) ── */

function hijriPartsOf(date: Date): { day: number; month: number; year: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    calendar: "islamic-umalqura",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { day: get("day"), month: get("month"), year: get("year") };
}

/** Convert a Hijri (Umm al-Qura) date to its Gregorian Date by scanning around an estimate. */
function hijriToGregorian(hy: number, hm: number, hd: number): Date | null {
  const approxYear = Math.floor((hy - 1) * 0.970229 + 622);
  const d = new Date(approxYear - 1, 0, 1, 12, 0, 0, 0);
  for (let i = 0; i < 1300; i++) {
    const p = hijriPartsOf(d);
    if (p.year === hy && p.month === hm && p.day === hd) return new Date(d);
    d.setDate(d.getDate() + 1);
  }
  return null;
}

/** Next Gregorian date on/after today whose Hijri month & day match the target. */
function nextGregorianFor(hm: number, hd: number): Date | null {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = 0; i < 400; i++) {
    const p = hijriPartsOf(d);
    if (p.month === hm && p.day === hd) return new Date(d);
    d.setDate(d.getDate() + 1);
  }
  return null;
}

const upcomingTargets: { label: string; month: number; day: number }[] = [
  { label: "Islamic New Year (1 Muharram)", month: 1, day: 1 },
  { label: "Day of Ashura (10 Muharram)", month: 1, day: 10 },
  { label: "Ramadan begins (1 Ramadan)", month: 9, day: 1 },
  { label: "Eid al-Fitr (1 Shawwal)", month: 10, day: 1 },
  { label: "Dhul Hijjah begins (1 Dhul Hijjah)", month: 12, day: 1 },
  { label: "Day of Arafah (9 Dhul Hijjah)", month: 12, day: 9 },
  { label: "Eid al-Adha (10 Dhul Hijjah)", month: 12, day: 10 },
];

const sections = [
  { key: "overview", label: "Overview" },
  { key: "months", label: "The 12 Months" },
  { key: "sacred", label: "Sacred Months" },
  { key: "moon", label: "Moon Sighting" },
  { key: "dates", label: "Key Dates" },
  { key: "converter", label: "Date Converter" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── page ───────────────────────── */

function IslamicCalendarContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "overview");

  // Keep ?tab= in sync so the current view is shareable
  const syncUrl = (tab: SectionKey) => {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };
  const [search, setSearch] = useState("");
  const [expandedMonth, setExpandedMonth] = useState<number | null>(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // YYYY-MM-DD
  });
  const [converterMode, setConverterMode] = useState<"g2h" | "h2g">("g2h");
  const [hijriInput, setHijriInput] = useState(() => {
    const p = hijriPartsOf(new Date());
    return { day: p.day, month: p.month, year: p.year };
  });

  const filteredMonths = useMemo(
    () =>
      search
        ? months.filter((m) =>
            textMatch(
              search,
              m.name,
              m.nameAr,
              m.meaning,
              m.intro,
              ...m.points.map((p) => p.title),
              ...m.points.map((p) => p.detail)
            )
          )
        : months,
    [search]
  );

  const filteredKeyDates = useMemo(
    () =>
      search
        ? keyDates.filter((d) => textMatch(search, d.date, d.event, d.note))
        : keyDates,
    [search]
  );

  const filteredRecurring = useMemo(
    () =>
      search
        ? recurringObservances.filter((d) => textMatch(search, d.date, d.event, d.note))
        : recurringObservances,
    [search]
  );

  /* auto-expand the first visible month when search filters out the expanded one */
  useEffect(() => {
    if (!search || search.length < 2) return;
    if (filteredMonths.length && !filteredMonths.some((m) => m.id === expandedMonth)) {
      setExpandedMonth(filteredMonths[0].id);
    }
  }, [search, filteredMonths, expandedMonth]);

  const todayHijri = useMemo(() => {
    try {
      const now = new Date();
      const en = new Intl.DateTimeFormat("en-US", {
        calendar: "islamic-umalqura",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now);
      const ar = new Intl.DateTimeFormat("ar-SA", {
        calendar: "islamic-umalqura",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now);
      return { en, ar };
    } catch {
      return null;
    }
  }, []);

  const hijriResult = useMemo(() => {
    try {
      const date = new Date(selectedDate + "T12:00:00"); // noon to avoid timezone issues
      if (isNaN(date.getTime())) return null;

      const dayFormatter = new Intl.DateTimeFormat("en-US", {
        calendar: "islamic-umalqura",
        day: "numeric",
      });
      const monthFormatter = new Intl.DateTimeFormat("en-US", {
        calendar: "islamic-umalqura",
        month: "long",
      });
      const yearFormatter = new Intl.DateTimeFormat("en-US", {
        calendar: "islamic-umalqura",
        year: "numeric",
      });
      const fullFormatterAr = new Intl.DateTimeFormat("ar-SA", {
        calendar: "islamic-umalqura",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
      });

      return {
        day: dayFormatter.format(date),
        month: monthFormatter.format(date),
        year: yearFormatter.format(date).replace(/\s*AH$/, ""),
        arabic: fullFormatterAr.format(date),
        weekday: weekdayFormatter.format(date),
        gregorian: new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(date),
      };
    } catch {
      return null;
    }
  }, [selectedDate]);

  // Hijri → Gregorian (reverse direction)
  const gregorianResult = useMemo(() => {
    try {
      const { year, month, day } = hijriInput;
      if (!year || !month || !day) return null;
      const g = hijriToGregorian(year, month, day);
      // hijriToGregorian only returns a Date when the Hijri parts match exactly,
      // so a null result means the requested day does not exist in that month.
      if (!g) return { valid: false, gregorian: "" };
      return {
        valid: true,
        gregorian: new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(g),
      };
    } catch {
      return null;
    }
  }, [hijriInput]);

  // Auto-computed upcoming key dates in Gregorian ("when is Ramadan next year?")
  const upcomingDates = useMemo(() => {
    try {
      return upcomingTargets
        .map((t) => ({ label: t.label, date: nextGregorianFor(t.month, t.day) }))
        .filter((x): x is { label: string; date: Date } => x.date !== null)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((x) => ({
          label: x.label,
          gregorian: new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(x.date),
        }));
    } catch {
      return [];
    }
  }, []);

  return (
    <div>
      <PageHeader
        title="Islamic Calendar"
        titleAr="التقويم الهجري"
        subtitle="The twelve months of the Hijri calendar and their significance."
        action={
          todayHijri ? (
            <div className="text-right">
              <p className="text-xs text-themed-muted uppercase tracking-wider mb-1.5">Today</p>
              <p className="text-lg font-arabic text-gold leading-relaxed">{todayHijri.ar}</p>
              <p className="text-sm text-themed-muted mt-1">{todayHijri.en}</p>
            </div>
          ) : undefined
        }
      />

      <VerseHero
        arabic="إِنَّ عِدَّةَ ٱلشُّهُورِ عِندَ ٱللَّهِ ٱثْنَا عَشَرَ شَهْرًۭا فِى كِتَـٰبِ ٱللَّهِ يَوْمَ خَلَقَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ مِنْهَآ أَرْبَعَةٌ حُرُمٌۭ"
        text="Indeed, the number of months with Allah is twelve months in the register of Allah from the day He created the heavens and the earth; of these, four are sacred."
        reference="Quran 9:36"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search months, events, dates..." className="mb-6" />

      {/* Section navigation (shared TabBar) */}
      <TabBar
        tabs={sections.map((s) => ({ key: s.key, label: s.label }))}
        activeTab={activeSection}
        onTabChange={(k) => {
          setActiveSection(k as SectionKey);
          syncUrl(k as SectionKey);
        }}
        className="mb-6"
      />

      <AnimatePresence mode="wait">
        {/* ─── Overview ─── */}
        {activeSection === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                What is the Hijri Calendar?
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">The Hijri calendar</span> (التقويم الهجري) is the Islamic lunar calendar used to determine the dates of religious observances, fasting, Hajj, and the two Eids. It was established by the Caliph Umar ibn al-Khattab (may Allah be pleased with him), who set the starting point at the Hijrah — the Prophet&apos;s migration from Makkah to Madinah in 622 CE.
                </p>
                <p>
                  The calendar consists of <span className="text-themed font-medium">12 lunar months</span>, each beginning with the sighting of the new crescent moon (hilal). A lunar month is either 29 or 30 days, making the Hijri year approximately 354 days — about 11 days shorter than the Gregorian solar year. This means Islamic dates shift through the seasons over a 33-year cycle.
                </p>
                <p>
                  Of these twelve months, <span className="text-themed font-medium">four are sacred</span> (al-ashhur al-hurum): Muharram, Rajab, Dhul Qi&apos;dah, and Dhul Hijjah. Allah says: <em>&ldquo;So do not wrong yourselves during them.&rdquo;</em> (Quran 9:36). Fighting was prohibited in these months, and sins committed during them carry greater weight.
                </p>
                <p>
                  The Prophet (peace be upon him) explained their arrangement in his Farewell Sermon: <em>&ldquo;Time has come back to its original state, the way it was when Allah created the heavens and the earth. The year is twelve months, of which four are sacred: three consecutive — Dhul Qi&apos;dah, Dhul Hijjah, and Muharram — and Rajab of Mudar, which comes between Jumada and Sha&apos;ban.&rdquo;</em>
                </p>
              </div>
            </ContentCard>

            <ContentCard delay={0.2}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                How the Hijri Calendar Was Established
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  The Islamic calendar was not begun by the Prophet (peace be upon him) himself. Roughly seventeen years after the Hijrah, during the caliphate of <span className="text-themed font-medium">Umar ibn al-Khattab</span> (may Allah be pleased with him), the growing Muslim state needed a fixed way to date its letters and records. Umar gathered the companions to consult them, and they agreed to number the years from a single starting event.
                </p>
                <p>
                  Several options were weighed — the Prophet&apos;s birth, the first revelation, even his death. They chose the <span className="text-themed font-medium">year of the Hijrah</span>, the migration from Makkah to Madinah, because it was the turning point at which the Muslim community first gained a home and a state of its own. <span className="text-themed font-medium">Muharram</span> was set as the first month of that year.
                </p>
                <p>
                  A note for new Muslims: no specific worship, prayer, or celebration is prescribed for the Islamic New Year. The 1st of Muharram is not an Eid and passes without any special ritual in the Sunnah. The month&apos;s virtue lies in voluntary fasting — above all the Day of Ashura on the 10th.
                </p>
              </div>
            </ContentCard>

            {/* Sources */}
            <SourcesCard sources={[
              { ref: "Quran 9:36", desc: "Twelve months ordained by Allah, four sacred" },
              { ref: "Quran 2:185; Quran 2:189", desc: "Ramadan and the crescent moons" },
              { ref: "Bukhari 65:184; Muslim 13:261", desc: "The four sacred months named by the Prophet" },
              { ref: "Bukhari 63:131", desc: "The Hijrah and the establishment of the calendar" },
            ]} />
          </motion.div>
        )}

        {/* ─── The 12 Months ─── */}
        {activeSection === "months" && (
          <motion.div
            key="months"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Month grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredMonths.map((month, i) => {
                const isExpanded = expandedMonth === month.id;
                return (
                  <ContentCard key={month.id} delay={0.02 + i * 0.015} id={`section-${month.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                    <button
                      onClick={() =>
                        setExpandedMonth(isExpanded ? null : month.id)
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            month.sacred
                              ? "bg-gold/15 border-gold/30"
                              : "bg-gold/10 border-gold/20"
                          }`}
                        >
                          <span className="text-gold font-semibold text-xs">
                            {month.id}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3
                            className={`font-semibold text-sm leading-tight ${
                              isExpanded ? "text-gold" : "text-themed"
                            }`}
                          >
                            {month.name}
                          </h3>
                          <p className="text-gold/70 font-arabic text-xs mt-0.5">
                            {month.nameAr}
                          </p>
                          {month.sacred && (
                            <span className="inline-block mt-1 text-[9px] text-gold bg-gold/10 border border-gold/20 rounded-full px-1.5 py-0.5 leading-none">
                              Sacred
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </ContentCard>
                );
              })}
            </div>

            {/* Expanded month detail */}
            <AnimatePresence mode="wait">
              {expandedMonth && (() => {
                const month = months.find((m) => m.id === expandedMonth)!;
                return (
                  <motion.div
                    key={month.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ContentCard>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-xl font-semibold text-themed">
                            {month.name}
                          </h2>
                          <span className="text-gold/70 font-arabic">
                            {month.nameAr}
                          </span>
                          {month.sacred && (
                            <span className="text-[10px] text-gold bg-gold/10 border border-gold/20 rounded-full px-2 py-0.5">
                              Sacred
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setExpandedMonth(null)}
                          className="text-themed-muted hover:text-themed text-lg px-2"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-themed-muted text-xs mb-1">
                        {month.meaning}
                      </p>
                      <p className="text-themed-muted text-sm leading-relaxed mb-4">
                        {month.intro}
                      </p>
                      <div className="space-y-3">
                        {month.points.map((point) => (
                          <div
                            key={point.title}
                            className="rounded-lg p-3 border sidebar-border"
                            style={{
                              backgroundColor: "var(--color-bg)",
                            }}
                          >
                            <h4 className="text-sm font-semibold text-themed mb-1.5">
                              {point.title}
                            </h4>
                            <p className="text-themed-muted text-sm leading-relaxed">
                              {point.detail}
                            </p>
                            {point.note && (
                              <p className="text-xs text-gold/60 mt-2">
                                <HadithRefText text={point.note} />
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </ContentCard>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* Sources — scoped to the currently EXPANDED month (house rule) */}
            {expandedMonth && (
              <SourcesCard className="mt-6" sources={
                ({
                  1: [{ ref: "Muslim 13:261; Muslim 13:253; Muslim 13:173; Bukhari 30:109; Muslim 13:162; Bukhari 62:94; Bukhari 62:98; Bukhari 63:131", desc: "Muharram — the month of Allah, the Day of Ashura, Musa (peace be upon him), Karbala, and the Islamic New Year" }],
                  2: [{ ref: "Bukhari 76:27; Muslim 39:141; Bukhari 63:131", desc: "Safar — no bad omens; the Hijrah journey" }],
                  3: [{ ref: "Muslim 13:256; Bukhari 63:131; Tirmidhi 49:14", desc: "Rabi al-Awwal — the Prophet's birth, arrival in Madinah, and death" }],
                  4: [{ ref: "Bukhari 81:53", desc: "Rabi al-Thani — the most beloved deeds are the most consistent" }],
                  5: [{ ref: "Bukhari 61:129", desc: "Jumada al-Ula — Fatimah, the leader of the women of Paradise" }],
                  6: [{ ref: "Bukhari 23:113; Muslim 1:39", desc: "Jumada al-Thani — the death of Abu Talib, the Year of Sorrow" }],
                  7: [{ ref: "Bukhari 65:184; Bukhari 63:112; Muslim 1:321; Abu Dawud 14:116", desc: "Rajab — the solitary sacred month; al-Isra wal-Mi'raj; fasting in the sacred months" }],
                  8: [{ ref: "Bukhari 30:76; Muslim 13:229; Nasai 22:268; Abu Dawud 14:25; Tirmidhi 8:57; Ibn Majah 5:588; Ibn Majah 5:586; Ibn Majah 7:14", desc: "Sha'ban — the Prophet's fasting; deeds raised to Allah; the night of mid-Sha'ban" }],
                  9: [{ ref: "Quran 2:183; Quran 2:185; Quran 97:1-5; Bukhari 91:10; Bukhari 32:1; Bukhari 30:9; Muslim 13:1; Quran 3:123; Bukhari 64:310; Bukhari 64:313", desc: "Ramadan — the obligation of fasting, the revelation of the Quran, Laylatul Qadr, Badr and the Conquest of Makkah" }],
                  10: [{ ref: "Bukhari 13:5; Muslim 13:264; Bukhari 64:90", desc: "Shawwal — Eid al-Fitr, the six days of Shawwal, the Battle of Uhud" }],
                  11: [{ ref: "Quran 9:36; Bukhari 65:184; Bukhari 64:192", desc: "Dhul Qi'dah — a sacred month; the Prophet's Umrahs" }],
                  12: [{ ref: "Bukhari 13:18; Muslim 13:253; Tirmidhi 8:68; Tirmidhi 8:92; Tirmidhi 48:216; Muslim 35:53; Muslim 35:54; Abu Dawud 11:45; Bukhari 73:9; Muslim 13:183; Bukhari 26:1; Muslim 15:493", desc: "Dhul Hijjah — the best ten days, the non-pilgrim's worship, hair and nails, Arafah, Eid al-Adha, Tashriq, and Hajj" }],
                } as Record<number, { ref: string; desc: string }[]>)[expandedMonth] ?? []
              } />
            )}
          </motion.div>
        )}

        {/* ─── Sacred Months ─── */}
        {activeSection === "sacred" && (
          <motion.div
            key="sacred"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                The Four Sacred Months
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  Allah designated four months as sacred (حُرُم) from the day He created the heavens and the earth. During these months, sins are graver and good deeds are more rewarding. The Arabs, even before Islam, honored these months by ceasing warfare to allow safe travel and trade.
                </p>
                <p>
                  The Prophet (peace be upon him) identified them in his Farewell Sermon: <em>&ldquo;Three consecutive — Dhul Qi&apos;dah, Dhul Hijjah, and Muharram — and Rajab of Mudar, which comes between Jumada and Sha&apos;ban.&rdquo;</em>
                </p>
              </div>
            </ContentCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMonths
                .filter((m) => m.sacred)
                .map((month, i) => (
                  <ContentCard key={month.id} delay={0.15 + i * 0.05}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                        <span className="text-gold font-semibold text-sm">
                          {month.id}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-semibold text-themed">
                            {month.name}
                          </h3>
                          <span className="text-gold/70 font-arabic text-sm">
                            {month.nameAr}
                          </span>
                        </div>
                        <p className="text-themed-muted text-sm mt-1 leading-relaxed">
                          {month.id === 1 &&
                            "The month of Allah. Best fasting after Ramadan. Contains the Day of Ashura."}
                          {month.id === 7 &&
                            "The solitary sacred month. Stands alone between Jumada and Sha'ban."}
                          {month.id === 11 &&
                            "First of three consecutive sacred months. The month of the Prophet's Umrahs."}
                          {month.id === 12 &&
                            "The month of Hajj. Contains the best days and the greatest day of the year."}
                        </p>
                      </div>
                    </div>
                  </ContentCard>
                ))}
            </div>

            <ContentCard delay={0.4}>
              <h3 className="text-base font-semibold text-themed mb-3">
                What does &ldquo;sacred&rdquo; mean?
              </h3>
              <div className="space-y-3">
                {[
                  {
                    title: "Sins are graver",
                    detail:
                      "Ibn Kathir explained: 'Sins committed during the sacred months are worse and more serious than at other times.' The command 'do not wrong yourselves during them' (Quran 9:36) indicates heightened accountability.",
                    note: "Tafsir Ibn Kathir on Quran 9:36",
                  },
                  {
                    title: "Good deeds are more rewarding",
                    detail:
                      "Just as sins are graver, righteous deeds carry greater reward during these months. The Prophet (peace be upon him) encouraged fasting in the sacred months: 'Fast some days of the sacred months, and leave some days.'",
                    note: "Abu Dawud 14:116",
                  },
                  {
                    title: "Fighting was prohibited",
                    detail:
                      "Allah says: 'They ask you about fighting in the sacred month. Say: Fighting therein is a great sin.' This prohibition was recognized even by the pre-Islamic Arabs, and Islam affirmed it.",
                    note: "Quran 2:217",
                  },
                  {
                    title: "Do these rulings still apply? (Nasi')",
                    detail:
                      "Before Islam the Arabs would 'postpone' a sacred month — swapping it for another to suit their wars and trade. The very next verse condemns this: it is 'an act of disbelief, which leads them further astray… making lawful what Allah has made forbidden' (Quran 9:37). The sacredness Allah fixed at creation still stands: the heightened gravity of sin and the greater reward of good deeds remain in force. The prohibition on fighting is understood by the scholars as a ban on initiating hostilities during these months; consult a trusted scholar on its contemporary application.",
                    note: "Quran 9:37",
                  },
                ].map((point) => (
                  <div
                    key={point.title}
                    className="rounded-lg p-3 border sidebar-border"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <h4 className="text-sm font-semibold text-themed mb-1.5">
                      {point.title}
                    </h4>
                    <p className="text-themed-muted text-sm leading-relaxed">
                      {point.detail}
                    </p>
                    <p className="text-xs text-gold/60 mt-2"><HadithRefText text={point.note} /></p>
                  </div>
                ))}
              </div>
            </ContentCard>

            {/* Sources */}
            <SourcesCard delay={0.5} sources={[
              { ref: "Quran 2:217", desc: "Fighting in the sacred month is a great sin" },
              { ref: "Quran 9:36; Quran 9:37", desc: "Four sacred months ordained by Allah; the condemnation of nasi'" },
              { ref: "Bukhari 65:184; Muslim 13:261", desc: "The Prophet named the four sacred months" },
              { ref: "Abu Dawud 14:116", desc: "Fasting in the sacred months" },
              { ref: "Tafsir Ibn Kathir", desc: "Sins are graver during sacred months" },
            ]} />
          </motion.div>
        )}

        {/* ─── Moon Sighting ─── */}
        {activeSection === "moon" && (
          <motion.div
            key="moon"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                How an Islamic Month Begins
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  Each Hijri month begins not on a fixed date but with the sighting of the <span className="text-themed font-medium">new crescent moon (hilal)</span> — a thin sliver of light low on the western horizon, just after sunset. Because a lunar cycle lasts about 29.5 days, a month is either <span className="text-themed font-medium">29 or 30 days</span>, never more.
                </p>
                <p>
                  On the evening of the 29th, Muslims look for the crescent. If it is seen, the new month begins the next day. If it is <span className="text-themed font-medium">not</span> seen — whether the moon has not yet appeared or the sky is overcast — the current month is simply completed as a full 30 days, and the new month follows.
                </p>
              </div>
            </ContentCard>

            <ContentCard delay={0.2}>
              <h3 className="text-base font-semibold text-themed mb-3">
                What the Sunnah says
              </h3>
              <div className="space-y-3">
                {[
                  {
                    title: "Begin and end with the crescent",
                    detail:
                      "The Prophet (peace be upon him) said: 'Start fasting on seeing the crescent (of Ramadan), and give up fasting on seeing the crescent (of Shawwal), and if the sky is overcast (and you cannot see it), complete thirty days of Sha'ban.' The month is tied to the sighting of the hilal, not to a printed calendar.",
                    note: "Bukhari 30:19",
                  },
                  {
                    title: "A month is 29 or 30 days",
                    detail:
                      "The Prophet (peace be upon him) said: 'We are an illiterate nation; we neither write, nor know accounts. The month is like this and this' — holding up his hands to show sometimes 29 days and sometimes 30. If the crescent is not sighted on the 29th night, the month is completed as 30.",
                    note: "Bukhari 30:23",
                  },
                  {
                    title: "No fasting on the 'day of doubt'",
                    detail:
                      "To keep the boundary of Ramadan clear, one should not fast just before it as a precaution. The Prophet (peace be upon him) said: 'None of you should fast a day or two before the month of Ramadan unless he has the habit of fasting (Nawafil)…' Fasting begins only once the new month is confirmed.",
                    note: "Bukhari 30:24",
                  },
                ].map((point) => (
                  <div
                    key={point.title}
                    className="rounded-lg p-3 border sidebar-border"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <h4 className="text-sm font-semibold text-themed mb-1.5">
                      {point.title}
                    </h4>
                    <p className="text-themed-muted text-sm leading-relaxed">
                      {point.detail}
                    </p>
                    <p className="text-xs text-gold/60 mt-2"><HadithRefText text={point.note} /></p>
                  </div>
                ))}
              </div>
            </ContentCard>

            <ContentCard delay={0.3}>
              <h3 className="text-base font-semibold text-themed mb-3">
                Sighting, calculation, and why communities differ
              </h3>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">Sighting vs calculation.</span> The classical practice, rooted directly in the hadith above, is physical sighting (ru&apos;yah) with the naked eye. Today many scholars and moon-sighting committees also use astronomical calculation to predict and confirm sightings. Scholars differ on how far calculation may stand in for the eye — a recognised difference of opinion, not a matter of right versus wrong.
                </p>
                <p>
                  <span className="text-themed font-medium">Local vs global sighting.</span> Scholars also differ on whether a confirmed sighting <em>anywhere</em> obliges everyone to begin the month together, or whether each region follows its own horizon. This is the real reason your mosque may start Ramadan a day apart from your family abroad — usually a valid difference of scholarly opinion rather than an error by either side.
                </p>
                <p>
                  The safest course is to follow your local mosque or a trusted moon-sighting authority, and not to let these differences become a source of division. For how this plays out at the start of Ramadan and the two Eids, see the <a href="/ramadan?tab=fasting" className="text-gold hover:underline">Ramadan guide</a>.
                </p>
              </div>
            </ContentCard>

            <SourcesCard delay={0.4} sources={[
              { ref: "Bukhari 30:19", desc: "Begin and end the fast on sighting the crescent" },
              { ref: "Bukhari 30:23", desc: "The month is 29 or 30 days" },
              { ref: "Bukhari 30:24", desc: "Do not fast a day of doubt before Ramadan" },
            ]} />
          </motion.div>
        )}

        {/* ─── Key Dates ─── */}
        {activeSection === "dates" && (
          <motion.div
            key="dates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard>
              <h2 className="text-xl font-semibold text-themed mb-4">
                Important Dates in the Islamic Year
              </h2>
              <p className="text-themed-muted text-sm leading-relaxed">
                A practising Muslim&apos;s calendar runs on two rhythms: a weekly and monthly cycle of voluntary worship, and the great annual occasions. Both are gathered here — whether for fasting, celebration, or heightened worship.
              </p>
            </ContentCard>

            {/* Weekly & monthly recurring observances */}
            {filteredRecurring.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gold/80 uppercase tracking-wider px-1">
                  Every Week &amp; Every Month
                </h3>
                {filteredRecurring.map((item, i) => (
                  <ContentCard key={item.event} delay={0.03 + i * 0.02} id={`section-${item.event.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-20 shrink-0">
                        <span className="text-xs text-gold font-medium bg-gold/10 border border-gold/20 rounded-lg px-2 py-1 inline-block">
                          {item.date}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-themed text-sm">
                          {item.event}
                        </h3>
                        <p className="text-themed-muted text-xs mt-0.5 leading-relaxed">
                          <HadithRefText text={item.note} />
                        </p>
                      </div>
                    </div>
                  </ContentCard>
                ))}
              </div>
            )}

            {filteredKeyDates.length > 0 && (
              <h3 className="text-sm font-semibold text-gold/80 uppercase tracking-wider px-1 pt-2">
                Once a Year
              </h3>
            )}

            <div className="space-y-2">
              {filteredKeyDates.map((item, i) => (
                <ContentCard key={item.event} delay={0.03 + i * 0.02} id={`section-${item.event.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-20 shrink-0">
                      <span className="text-xs text-gold font-medium bg-gold/10 border border-gold/20 rounded-lg px-2 py-1 inline-block">
                        {item.date}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-themed text-sm">
                        {item.event}
                      </h3>
                      <p className="text-themed-muted text-xs mt-0.5 leading-relaxed">
                        <HadithRefText text={item.note} />
                      </p>
                    </div>
                  </div>
                </ContentCard>
              ))}
            </div>

            {/* Sources */}
            <SourcesCard delay={0.4} sources={[
              { ref: "Tirmidhi 8:66; Nasai 22:276; Muslim 13:256", desc: "Fasting Monday and Thursday — deeds presented to Allah" },
              { ref: "Tirmidhi 8:80; Tirmidhi 8:81; Bukhari 30:88", desc: "The White Days — three days a month equals fasting the year" },
              { ref: "Muslim 7:26; Bukhari 30:92", desc: "Friday, the best day; do not single it out for fasting" },
              { ref: "Quran 2:183; Quran 2:185", desc: "Fasting prescribed in Ramadan" },
              { ref: "Quran 97:1-5", desc: "Laylatul Qadr better than a thousand months" },
              { ref: "Bukhari 13:5; Bukhari 13:18; Bukhari 32:1", desc: "Eid, best ten days, Laylatul Qadr" },
              { ref: "Muslim 13:173; Muslim 13:253; Muslim 13:264; Muslim 13:183; Muslim 35:53", desc: "Ashura, Arafah, six days of Shawwal, Tashriq, the Dhul Hijjah sacrifice ruling" },
              { ref: "Abu Dawud 11:45", desc: "The Day of Sacrifice is the greatest day" },
            ]} />
          </motion.div>
        )}
        {/* ─── Date Converter ─── */}
        {activeSection === "converter" && (
          <motion.div
            key="converter"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard>
              <h2 className="text-xl font-semibold text-themed mb-2">
                Date Converter
              </h2>
              <p className="text-themed-muted text-sm leading-relaxed">
                Convert in either direction between the Gregorian and Hijri (Islamic) calendars. This uses the Umm al-Qura calendar system used in Saudi Arabia; your local dates may differ by a day or two depending on the moon sighting.
              </p>
            </ContentCard>

            <ContentCard delay={0.1}>
              {/* Direction toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-xl border sidebar-border p-1" style={{ backgroundColor: "var(--color-bg)" }}>
                  {([
                    { key: "g2h", label: "Gregorian → Hijri" },
                    { key: "h2g", label: "Hijri → Gregorian" },
                  ] as const).map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setConverterMode(m.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        converterMode === m.key
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "text-themed-muted hover:text-gold border border-transparent"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {converterMode === "g2h" && (
              <div className="flex flex-col items-center gap-6">
                {/* Date input */}
                <div className="w-full max-w-xs">
                  <label className="block text-xs text-themed-muted mb-2 uppercase tracking-wider text-center">
                    Select Gregorian Date
                  </label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60 pointer-events-none"
                    />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border sidebar-border text-themed text-sm focus:outline-none focus:border-gold/50 transition-colors"
                      style={{ backgroundColor: "var(--color-bg)" }}
                    />
                  </div>
                </div>

                {/* Result */}
                {hijriResult && (
                  <div className="w-full text-center">
                    {/* Gregorian */}
                    <p className="text-themed-muted text-sm mb-4">
                      {hijriResult.weekday}, {hijriResult.gregorian.replace(hijriResult.weekday + ", ", "")}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="h-px flex-1 max-w-[80px] bg-gold/20" />
                      <span className="text-gold text-lg">↓</span>
                      <div className="h-px flex-1 max-w-[80px] bg-gold/20" />
                    </div>

                    {/* Hijri date display */}
                    <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6">
                      <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose mb-2">
                        {hijriResult.arabic}
                      </p>
                      <p className="text-themed text-lg font-semibold">
                        {hijriResult.day} {hijriResult.month}, {hijriResult.year} AH
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick date buttons */}
                <div className="w-full">
                  <p className="text-xs text-themed-muted mb-2 text-center uppercase tracking-wider">
                    Quick Select
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { label: "Today", getDate: () => new Date() },
                      {
                        label: "Tomorrow",
                        getDate: () => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          return d;
                        },
                      },
                      {
                        label: "Next Week",
                        getDate: () => {
                          const d = new Date();
                          d.setDate(d.getDate() + 7);
                          return d;
                        },
                      },
                      {
                        label: "Next Month",
                        getDate: () => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 1);
                          return d;
                        },
                      },
                    ].map((btn) => {
                      const btnDate = btn.getDate().toISOString().split("T")[0];
                      const isActive = selectedDate === btnDate;
                      return (
                      <button
                        key={btn.label}
                        onClick={() => setSelectedDate(btnDate)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border active:scale-95 transition-all cursor-pointer ${
                          isActive
                            ? "border-gold/40 bg-gold/20 text-gold"
                            : "sidebar-border text-themed-muted hover:text-gold hover:border-gold/30"
                        }`}
                      >
                        {btn.label}
                      </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              )}

              {converterMode === "h2g" && (
              <div className="flex flex-col items-center gap-6">
                {/* Hijri input */}
                <div className="w-full max-w-md">
                  <label className="block text-xs text-themed-muted mb-2 uppercase tracking-wider text-center">
                    Select Hijri Date
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={hijriInput.day}
                      onChange={(e) => setHijriInput((h) => ({ ...h, day: Number(e.target.value) }))}
                      aria-label="Hijri day"
                      className="w-full px-2 py-2.5 rounded-xl border sidebar-border text-themed text-sm focus:outline-none focus:border-gold/50 transition-colors"
                      style={{ backgroundColor: "var(--color-bg)" }}
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <select
                      value={hijriInput.month}
                      onChange={(e) => setHijriInput((h) => ({ ...h, month: Number(e.target.value) }))}
                      aria-label="Hijri month"
                      className="w-full px-2 py-2.5 rounded-xl border sidebar-border text-themed text-sm focus:outline-none focus:border-gold/50 transition-colors"
                      style={{ backgroundColor: "var(--color-bg)" }}
                    >
                      {months.map((m) => (
                        <option key={m.id} value={m.id}>{m.id}. {m.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={hijriInput.year}
                      min={1}
                      onChange={(e) => setHijriInput((h) => ({ ...h, year: Number(e.target.value) }))}
                      aria-label="Hijri year"
                      className="w-full px-2 py-2.5 rounded-xl border sidebar-border text-themed text-sm focus:outline-none focus:border-gold/50 transition-colors"
                      style={{ backgroundColor: "var(--color-bg)" }}
                    />
                  </div>
                  <p className="text-[11px] text-themed-muted mt-1.5 text-center">Day · Month · Year (AH)</p>
                </div>

                {/* Result */}
                {gregorianResult && (
                  <div className="w-full text-center">
                    <p className="text-themed-muted text-sm mb-4">
                      {hijriInput.day} {months.find((m) => m.id === hijriInput.month)?.name} {hijriInput.year} AH
                    </p>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="h-px flex-1 max-w-[80px] bg-gold/20" />
                      <span className="text-gold text-lg">↓</span>
                      <div className="h-px flex-1 max-w-[80px] bg-gold/20" />
                    </div>
                    {gregorianResult.valid ? (
                      <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6">
                        <p className="text-themed text-lg font-semibold">
                          {gregorianResult.gregorian}
                        </p>
                      </div>
                    ) : (
                      <p className="text-themed-muted text-sm">
                        That day does not exist in this Hijri month (it has only 29 days). Try the 29th or the 1st of the next month.
                      </p>
                    )}
                  </div>
                )}
              </div>
              )}
            </ContentCard>

            {/* Upcoming key dates — the "when is Ramadan next year?" answer */}
            <ContentCard delay={0.15}>
              <h3 className="text-base font-semibold text-themed mb-3">
                Upcoming Key Dates
              </h3>
              <div className="space-y-2">
                {upcomingDates.map((u) => (
                  <div
                    key={u.label}
                    className="flex items-center justify-between gap-3 rounded-lg p-3 border sidebar-border"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <span className="text-themed text-sm font-medium">{u.label}</span>
                    <span className="text-gold text-xs font-medium bg-gold/10 border border-gold/20 rounded-lg px-2 py-1 whitespace-nowrap">
                      {u.gregorian}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-themed-muted mt-3 leading-relaxed">
                Next occurrence of each date, estimated by the Umm al-Qura calendar. Actual dates depend on the local moon sighting and may shift by a day or two.
              </p>
            </ContentCard>

            <ContentCard delay={0.2}>
              <h3 className="text-base font-semibold text-themed mb-3">
                About the Hijri Calendar
              </h3>
              <div className="space-y-2 text-themed-muted text-sm leading-relaxed">
                <p>
                  The Islamic (Hijri) calendar is a <span className="text-themed font-medium">purely lunar calendar</span> of 354 or 355 days. Each month begins with the sighting of the new crescent moon, making it approximately 11 days shorter than the Gregorian solar year.
                </p>
                <p>
                  This converter uses the <span className="text-themed font-medium">Umm al-Qura</span> calendar — the official calendar of Saudi Arabia — which is a computational approximation. Actual Islamic dates in your region may differ by 1-2 days depending on local moon sighting.
                </p>
              </div>
            </ContentCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IslamicCalendarPage() {
  return <Suspense><IslamicCalendarContent /></Suspense>;
}
