"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import {
  BookOpen,
  AlertTriangle,
  Shield,
  Feather,
  BookMarked,
  Users,
  Clock,
  Compass,
} from "lucide-react";

/* ───────────────────────── data ───────────────────────── */

const whyItMatters = [
  {
    point: "It is what distinguishes a believer from a disbeliever",
    detail:
      "The Prophet (peace be upon him) was asked about Iman and he listed these six articles. Without believing in all six, a person's faith is incomplete.",
    reference: "Sahih Muslim 8 (Hadith of Jibril)",
  },
  {
    point: "It gives life purpose and meaning",
    detail:
      "Knowing that Allah created us, sent messengers with guidance, revealed books, appointed angels, and that there is a Day of Judgement gives every moment of life purpose and accountability.",
    reference: "Quran 67:2",
  },
  {
    point: "It is the foundation of all righteous action",
    detail:
      "Actions without correct belief are like a building without a foundation. Allah says that whoever disbelieves, their deeds become worthless.",
    reference: "Quran 39:65",
  },
  {
    point: "It provides comfort and resilience through trials",
    detail:
      "Belief in divine decree means the believer faces hardship with patience, knowing that nothing happens without Allah's wisdom. The Prophet (peace be upon him) said: \"How wonderful is the affair of the believer — everything is good for him.\"",
    reference: "Sahih Muslim 2999",
  },
  {
    point: "Denying any one article nullifies one's faith",
    detail:
      "These six articles are not optional — they are a package. Denying the angels, the books, the messengers, the Last Day, or divine decree takes a person outside the fold of Islam, just as denying Allah does.",
    reference: "Quran 4:136",
  },
];

type Article = {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof Shield;
  description: string;
  detailedExplanation: string;
  keyVerses: { ref: string; arabic?: string; text: string }[];
  hadith: { ref: string; text: string }[];
  points: string[];
  misconceptions: { title: string; clarification: string }[];
  sources: string[];
};

const articles: Article[] = [
  {
    id: "allah",
    title: "Belief in Allah",
    titleAr: "الإيمان بالله",
    icon: Shield,
    description:
      "To believe in Allah's existence, His Oneness in Lordship, worship, and names and attributes. This is the foundation of the entire religion and encompasses Tawheed in all its forms.",
    detailedExplanation:
      "Belief in Allah is not merely acknowledging that a god exists. It encompasses four aspects: (1) Believing in His existence — which is established through the fitrah (natural disposition), reason, the Quran, and the senses. (2) Believing in His Rububiyyah — that He alone is the Lord, Creator, Sustainer, and Controller of all things. (3) Believing in His Uluhiyyah — that He alone deserves all worship. (4) Believing in His Asma wa Sifat — that He has perfect names and attributes as described in the Quran and Sunnah, without distortion, denial, or comparison to creation. This article is the most comprehensive, as it forms the basis of every other article of faith.",
    keyVerses: [
      {
        ref: "Quran 2:255 (Ayat al-Kursi)",
        arabic: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ",
        text: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth.",
      },
      {
        ref: "Quran 112:1-4",
        arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
        text: "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
      },
      {
        ref: "Quran 42:11",
        arabic: "لَيْسَ كَمِثْلِهِۦ شَىْءٌۭ ۖ وَهُوَ ٱلسَّمِيعُ ٱلْبَصِيرُ",
        text: "There is nothing like unto Him, and He is the All-Hearing, the All-Seeing.",
      },
    ],
    hadith: [
      {
        ref: "Sahih Muslim 8",
        text: "He (Jibril) said: 'Tell me about Iman.' He (the Prophet) said: 'It is to believe in Allah, His angels, His books, His messengers, the Last Day, and to believe in divine decree — both its good and its evil.'",
      },
    ],
    points: [
      "Belief in Allah encompasses His existence, Lordship, right to worship, and names & attributes",
      "The fitrah (natural disposition) of every human recognizes Allah — it is shirk and disbelief that are learned",
      "This article is the foundation upon which all other articles rest",
      "Tawheed in all three categories is part of believing in Allah",
      "Allah is above His Throne, separate from His creation, yet His knowledge encompasses everything",
      "He is described only by what He and His Messenger have described Him with",
    ],
    misconceptions: [
      {
        title: "Belief in God is enough without specifics",
        clarification:
          "Simply believing a higher power exists is not sufficient. One must believe in Allah specifically — His Oneness, His right to be worshipped alone, and His names and attributes as He described them.",
      },
      {
        title: "Allah is everywhere",
        clarification:
          "Allah is above His Throne (Quran 20:5), risen over it in a manner that befits His majesty. His knowledge is everywhere, but He Himself is above the creation. Imam Malik said: 'The istiwaa is not unknown, the how (kayfiyyah) is inconceivable, belief in it is obligatory, and asking about it is an innovation.' (Reported by al-Bayhaqi in al-Asma was-Sifat)",
      },
    ],
    sources: [
      "Sharh Usul al-Iman, Ibn Uthaymeen — Section on belief in Allah",
      "Kitab at-Tawhid, Muhammad ibn Abd al-Wahhab",
      "Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah — On Allah's names and attributes",
      "Tafsir Ibn Kathir — Commentary on Ayat al-Kursi (2:255) and Surah al-Ikhlas",
    ],
  },
  {
    id: "angels",
    title: "Belief in the Angels",
    titleAr: "الإيمان بالملائكة",
    icon: Feather,
    description:
      "To believe that angels are honoured creatures created from light by Allah. They do not disobey Him, have no free will to rebel, and carry out His commands with perfect obedience.",
    detailedExplanation:
      "Angels are part of the unseen world (al-ghayb). They were created from light, as the Prophet (peace be upon him) informed us. Unlike humans and jinn, angels do not have free will to disobey Allah. They worship Him constantly — some are always in prostration, some always in bowing, some glorify Allah without ceasing. Belief in the angels includes four aspects: (1) Believing in their existence. (2) Believing in those we know by name — like Jibril, Mikail, Israfil, and Malik. (3) Believing in their attributes as described — they have wings, they can take human form, and they are immense in size. (4) Believing in their duties — delivering revelation, recording deeds, taking souls, and more.",
    keyVerses: [
      {
        ref: "Quran 2:285",
        arabic: "ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ ۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَـٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ",
        text: "The Messenger has believed in what was revealed to him from his Lord, and so have the believers. All of them have believed in Allah, His angels, His books, and His messengers.",
      },
      {
        ref: "Quran 35:1",
        arabic: "ٱلْحَمْدُ لِلَّهِ فَاطِرِ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ جَاعِلِ ٱلْمَلَـٰٓئِكَةِ رُسُلًا أُولِىٓ أَجْنِحَةٍۢ مَّثْنَىٰ وَثُلَـٰثَ وَرُبَـٰعَ",
        text: "Praise be to Allah, Creator of the heavens and the earth, who made the angels messengers having wings — two or three or four.",
      },
      {
        ref: "Quran 66:6",
        arabic: "لَّا يَعْصُونَ ٱللَّهَ مَآ أَمَرَهُمْ وَيَفْعَلُونَ مَا يُؤْمَرُونَ",
        text: "They do not disobey Allah in what He commands them and they do what they are commanded.",
      },
    ],
    hadith: [
      {
        ref: "Sahih Muslim 2996",
        text: "The angels were created from light, the jinn were created from smokeless fire, and Adam was created from what has been described to you (clay).",
      },
      {
        ref: "Sahih Muslim 2842",
        text: "On the Day of Judgement, Hell will be brought with seventy thousand reins, each rein held by seventy thousand angels.",
      },
    ],
    points: [
      "Angels are created from light and cannot disobey Allah",
      "Jibril (Gabriel) — the greatest angel, delivered the Quran to the Prophet (peace be upon him)",
      "Mikail — responsible for rain and vegetation by Allah's permission",
      "Israfil — will blow the Trumpet on the Day of Judgement",
      "Malik — the keeper of Hellfire",
      "Kiraman Katibin — the noble scribes who record every person's deeds (Quran 82:10-12)",
      "The Angel of Death — takes souls at the appointed time",
      "Munkar and Nakir — question the deceased in the grave",
      "Their number is known only to Allah — the Ka'bah in heaven (al-Bayt al-Ma'mur) is visited by 70,000 angels daily who never return (Sahih al-Bukhari 3207)",
    ],
    misconceptions: [
      {
        title: "Angels are female or have gender",
        clarification:
          "The Quran condemns those who claimed the angels are female or daughters of Allah. Angels are not male or female — they are a creation unlike humans. (Quran 53:27)",
      },
      {
        title: "Iblis (Satan) is a fallen angel",
        clarification:
          "In Islamic theology, Iblis is from the jinn, not from the angels. The Quran explicitly says: 'He was of the jinn and departed from the command of his Lord.' (Quran 18:50). Angels cannot disobey.",
      },
    ],
    sources: [
      "Sharh Usul al-Iman, Ibn Uthaymeen — Section on belief in the angels",
      "Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah — Chapter on angels",
      "Tafsir Ibn Kathir — Commentary on Quran 2:285, 35:1, 66:6",
      "Sahih Muslim 2996, 2842 — On the creation of angels and their immense number",
    ],
  },
  {
    id: "books",
    title: "Belief in the Books",
    titleAr: "الإيمان بالكتب",
    icon: BookMarked,
    description:
      "To believe that Allah revealed divine scriptures to His messengers as guidance for humanity. The Quran is the final revelation, perfectly preserved, confirming and superseding all previous scriptures.",
    detailedExplanation:
      "Belief in the divine books includes four aspects: (1) Believing that they were truly sent down from Allah. (2) Believing in those named specifically — the Suhuf (Scrolls) of Ibrahim, the Tawrat (Torah) revealed to Musa, the Zabur (Psalms) revealed to Dawud, the Injil (Gospel) revealed to Isa, and the Quran revealed to Muhammad (peace be upon them all). (3) Believing in the authentic contents of these books — affirming what the Quran confirms and withholding judgement on what it does not. (4) Acting upon the rulings of the Quran, as it is the final revelation that abrogates all previous scriptures. The previous books have been altered by human hands over time, while the Quran is divinely protected: 'Indeed, it is We who sent down the reminder, and indeed, We will be its guardian.' (Quran 15:9)",
    keyVerses: [
      {
        ref: "Quran 2:4",
        arabic: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ",
        text: "And who believe in what has been revealed to you and what was revealed before you, and of the Hereafter they are certain.",
      },
      {
        ref: "Quran 15:9",
        arabic: "إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَـٰفِظُونَ",
        text: "Indeed, it is We who sent down the reminder (Quran), and indeed, We will be its guardian.",
      },
      {
        ref: "Quran 5:48",
        arabic: "وَأَنزَلْنَآ إِلَيْكَ ٱلْكِتَـٰبَ بِٱلْحَقِّ مُصَدِّقًۭا لِّمَا بَيْنَ يَدَيْهِ مِنَ ٱلْكِتَـٰبِ وَمُهَيْمِنًا عَلَيْهِ",
        text: "And We have revealed to you the Book in truth, confirming that which preceded it of Scripture and as a criterion over it.",
      },
    ],
    hadith: [
      {
        ref: "Sahih al-Bukhari 4485",
        text: "The Prophet (peace be upon him) said: 'Do not believe the People of the Book, nor disbelieve them. Say: We believe in Allah and what has been revealed to us and what has been revealed to you.'",
      },
    ],
    points: [
      "The Suhuf (Scrolls) were revealed to Ibrahim (Abraham)",
      "The Tawrat (Torah) was revealed to Musa (Moses)",
      "The Zabur (Psalms) was revealed to Dawud (David)",
      "The Injil (Gospel) was revealed to Isa (Jesus) — not the New Testament written later by men",
      "The Quran is the final revelation, confirming truth in previous scriptures and superseding them",
      "Previous scriptures were altered (tahrif) by human hands — only the Quran is divinely preserved",
      "The Quran was revealed over 23 years and compiled into a single manuscript under Uthman ibn Affan",
    ],
    misconceptions: [
      {
        title: "The Bible today is the Injil revealed to Isa",
        clarification:
          "The Injil (Gospel) was what Allah revealed directly to Isa (Jesus). The New Testament was written by various authors decades later and is not the same as the original divine revelation.",
      },
      {
        title: "We must follow previous scriptures alongside the Quran",
        clarification:
          "The Quran abrogates and supersedes all previous scriptures. Muslims follow the Quran and the Sunnah of the Prophet Muhammad (peace be upon him) as the final and complete guidance.",
      },
    ],
    sources: [
      "Sharh Usul al-Iman, Ibn Uthaymeen — Section on belief in the books",
      "Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah — Chapter on divine books",
      "Tafsir Ibn Kathir — Commentary on Quran 2:4, 15:9, 5:48",
      "Sahih al-Bukhari 4485 — On the approach to previous scriptures",
    ],
  },
  {
    id: "messengers",
    title: "Belief in the Messengers",
    titleAr: "الإيمان بالرسل",
    icon: Users,
    description:
      "To believe that Allah sent prophets and messengers to every nation, calling them to worship Allah alone and reject false gods. They were the best of humanity — truthful, trustworthy, and delivered the message faithfully.",
    detailedExplanation:
      "Belief in the messengers includes four aspects: (1) Believing that their message is truly from Allah. (2) Believing in those named in the Quran — 25 prophets are mentioned by name, including Adam, Nuh, Ibrahim, Musa, Isa, and Muhammad (peace be upon them all). (3) Believing in what has been authentically reported about them. (4) Acting upon the Shariah of the one sent to us — Muhammad (peace be upon him), the final messenger. Every nation was sent a messenger with the same core message: worship Allah alone. The prophets were protected from major sins, were truthful in everything they conveyed from Allah, and delivered the message completely without hiding anything.",
    keyVerses: [
      {
        ref: "Quran 16:36",
        arabic: "وَلَقَدْ بَعَثْنَا فِى كُلِّ أُمَّةٍۢ رَّسُولًا أَنِ ٱعْبُدُوا ٱللَّهَ وَٱجْتَنِبُوا ٱلطَّـٰغُوتَ",
        text: "And We certainly sent into every nation a messenger, saying: Worship Allah and avoid false gods.",
      },
      {
        ref: "Quran 33:40",
        arabic: "مَّا كَانَ مُحَمَّدٌ أَبَآ أَحَدٍۢ مِّن رِّجَالِكُمْ وَلَـٰكِن رَّسُولَ ٱللَّهِ وَخَاتَمَ ٱلنَّبِيِّـۧنَ",
        text: "Muhammad is not the father of any of your men, but he is the Messenger of Allah and the seal of the prophets.",
      },
      {
        ref: "Quran 4:164",
        arabic: "وَرُسُلًۭا قَدْ قَصَصْنَـٰهُمْ عَلَيْكَ مِن قَبْلُ وَرُسُلًۭا لَّمْ نَقْصُصْهُمْ عَلَيْكَ",
        text: "And messengers about whom We have related their stories to you before, and messengers about whom We have not related to you.",
      },
    ],
    hadith: [
      {
        ref: "Musnad Ahmad 21546 (from Abu Dharr, graded hasan by some scholars)",
        text: "The Prophet (peace be upon him) was asked about the number of prophets and he indicated that there were a great many, and among them were 315 messengers.",
      },
      {
        ref: "Sahih al-Bukhari 3532",
        text: "The Prophet (peace be upon him) said: 'My example and the example of the prophets before me is like that of a man who built a house and made it beautiful except for the place of one brick. People would look at it and say: How excellent — if only that brick were put in its place. I am that brick, and I am the seal of the prophets.'",
      },
    ],
    points: [
      "25 prophets are mentioned by name in the Quran — but many more were sent",
      "The five greatest messengers (Ulul-Azm) are Nuh, Ibrahim, Musa, Isa, and Muhammad (peace be upon them)",
      "All prophets called to the same message: La ilaha illallah — worship Allah alone",
      "Muhammad (peace be upon him) is the final prophet — no prophet will come after him",
      "Prophets were human beings — they ate, drank, married, and died — but were the best of humanity",
      "They were protected (ma'sum) in conveying the message — they did not lie about Allah",
      "We must believe in all of them without distinction — rejecting one is rejecting all",
    ],
    misconceptions: [
      {
        title: "Prophets were divine or superhuman",
        clarification:
          "Prophets were human beings chosen by Allah. The Quran says: 'Say: I am only a man like you, to whom it has been revealed that your god is one God.' (Quran 18:110). They had no share in divinity.",
      },
      {
        title: "Muslims only follow Muhammad and reject other prophets",
        clarification:
          "Muslims are required to believe in and respect all prophets. Rejecting any single prophet is disbelief. 'We make no distinction between any of His messengers.' (Quran 2:285)",
      },
    ],
    sources: [
      "Sharh Usul al-Iman, Ibn Uthaymeen — Section on belief in the messengers",
      "Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah — Chapter on prophets and messengers",
      "Tafsir Ibn Kathir — Commentary on Quran 16:36, 33:40, 4:164",
      "Qasas al-Anbiya, Ibn Kathir — Stories of the Prophets",
    ],
  },
  {
    id: "last-day",
    title: "Belief in the Last Day",
    titleAr: "الإيمان باليوم الآخر",
    icon: Clock,
    description:
      "To believe in the Day of Judgement when all people will be resurrected, held accountable for their deeds, and given their final abode — Paradise or the Hellfire. This includes everything after death: the grave, the resurrection, and the reckoning.",
    detailedExplanation:
      "Belief in the Last Day encompasses everything that happens after death: (1) The trial of the grave — the questioning by Munkar and Nakir, and either punishment or bliss in the grave. (2) The signs of the Hour — minor signs (most have occurred) and major signs (the Dajjal, the descent of Isa, Gog and Magog, the rising of the sun from the west, and others). (3) The blowing of the Trumpet — all creation will perish, then be resurrected. (4) The gathering (Hashr) — all of humanity from Adam to the last person, standing before Allah. (5) The reckoning (Hisab) — being shown one's deeds. (6) The Scale (Mizan) — deeds are weighed. (7) The Bridge (Sirat) — laid across Hellfire, crossed according to one's deeds. (8) The intercession (Shafa'ah) — the Prophet (peace be upon him) will be granted the great intercession. (9) The final destination — Paradise for the believers and Hellfire for the disbelievers.",
    keyVerses: [
      {
        ref: "Quran 3:185",
        arabic: "كُلُّ نَفْسٍۢ ذَآئِقَةُ ٱلْمَوْتِ ۗ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ ٱلْقِيَـٰمَةِ",
        text: "Every soul will taste death, and you will only be given your full compensation on the Day of Resurrection.",
      },
      {
        ref: "Quran 99:7-8",
        arabic: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًۭا يَرَهُۥ ۝ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍۢ شَرًّۭا يَرَهُۥ",
        text: "Whoever does an atom's weight of good will see it. And whoever does an atom's weight of evil will see it.",
      },
      {
        ref: "Quran 83:6",
        arabic: "يَوْمَ يَقُومُ ٱلنَّاسُ لِرَبِّ ٱلْعَـٰلَمِينَ",
        text: "The Day when mankind will stand before the Lord of the worlds.",
      },
    ],
    hadith: [
      {
        ref: "Sahih al-Bukhari 1338",
        text: "When a person is placed in his grave and his companions leave, he hears their footsteps. Then two angels come to him, sit him up, and ask: 'What did you used to say about this man, Muhammad?'",
      },
      {
        ref: "Sahih Muslim 2864",
        text: "The sun will be brought close to the people on the Day of Resurrection, about a mile away. People will be in their own sweat according to their deeds — some to their ankles, some to their knees, some to their waists, and some will be bridled by it.",
      },
    ],
    points: [
      "Death is not the end — it is the beginning of the next life",
      "The grave is either a garden from the gardens of Paradise or a pit from the pits of Hellfire",
      "Minor signs of the Hour include the spread of ignorance, widespread killing, and the slave girl giving birth to her master",
      "Major signs include the Dajjal, the descent of Isa (Jesus), Gog and Magog, and the sun rising from the west",
      "All of humanity will be resurrected and gathered before Allah",
      "Deeds will be weighed on the Scale — good deeds on one side, bad on the other",
      "The Bridge (Sirat) over Hellfire will be crossed — some like lightning, some crawling",
      "The Prophet (peace be upon him) will be granted the great intercession for all of mankind",
      "The final abode is either Jannah (Paradise) or Jahannam (Hellfire)",
    ],
    misconceptions: [
      {
        title: "Nobody knows what happens after death",
        clarification:
          "Allah and His Messenger have told us in great detail what happens after death — the questioning in the grave, the resurrection, the judgement, and the final abode. This is from the unseen (al-ghayb) that we believe in based on revelation.",
      },
      {
        title: "Good people automatically go to Paradise regardless of belief",
        clarification:
          "Entry into Paradise requires both correct belief (Iman) and righteous deeds. Allah says: 'Whoever does righteousness, whether male or female, while being a believer — those will enter Paradise.' (Quran 4:124). Faith is a condition.",
      },
    ],
    sources: [
      "Sharh Usul al-Iman, Ibn Uthaymeen — Section on belief in the Last Day",
      "Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah — Chapter on the Last Day",
      "Kitab ar-Ruh, Ibn al-Qayyim — On the soul and the afterlife",
      "Tafsir Ibn Kathir — Commentary on Quran 3:185, 99:7-8, 83:6",
      "An-Nihayah fil-Fitan wal-Malahim, Ibn Kathir — On the signs of the Hour",
    ],
  },
  {
    id: "qadr",
    title: "Belief in Divine Decree",
    titleAr: "الإيمان بالقدر",
    icon: Compass,
    description:
      "To believe that everything that happens — good or bad — occurs by Allah's knowledge, will, writing, and creation. Allah knew everything before it happened, wrote it in the Preserved Tablet, willed it to happen, and created it.",
    detailedExplanation:
      "Belief in divine decree (al-Qadr) has four levels, all of which must be believed in: (1) Al-Ilm (Knowledge) — Allah knew everything that would happen before He created anything. He knows what every soul will do, when they will be born, when they will die, and what their provision will be. (2) Al-Kitabah (Writing) — Allah wrote everything in the Preserved Tablet (al-Lawh al-Mahfuz) fifty thousand years before He created the heavens and the earth. (3) Al-Mashee'ah (Will) — Nothing happens except by Allah's will. Whatever He wills happens, and whatever He does not will does not happen. (4) Al-Khalq (Creation) — Allah is the Creator of everything, including people's actions. However, this does not mean humans are forced — Allah gave us free will and the ability to choose, and we are accountable for our choices.",
    keyVerses: [
      {
        ref: "Quran 54:49",
        arabic: "إِنَّا كُلَّ شَىْءٍ خَلَقْنَـٰهُ بِقَدَرٍۢ",
        text: "Indeed, We have created all things with qadr (divine decree).",
      },
      {
        ref: "Quran 57:22",
        arabic: "مَآ أَصَابَ مِن مُّصِيبَةٍۢ فِى ٱلْأَرْضِ وَلَا فِىٓ أَنفُسِكُمْ إِلَّا فِى كِتَـٰبٍۢ مِّن قَبْلِ أَن نَّبْرَأَهَآ",
        text: "No disaster strikes upon the earth or among yourselves except that it is in a register before We bring it into being.",
      },
      {
        ref: "Quran 76:30",
        arabic: "وَمَا تَشَآءُونَ إِلَّآ أَن يَشَآءَ ٱللَّهُ",
        text: "And you do not will except that Allah wills.",
      },
    ],
    hadith: [
      {
        ref: "Sahih Muslim 2653",
        text: "Allah determined the measures of creation fifty thousand years before He created the heavens and the earth.",
      },
      {
        ref: "Sahih al-Bukhari 3208",
        text: "The creation of each one of you is brought together in his mother's womb for forty days as a drop, then he becomes a clot for the same period, then a morsel of flesh. Then an angel is sent to him who blows the soul into him and is commanded to write four things: his provision, his lifespan, his deeds, and whether he will be wretched or blessed.",
      },
    ],
    points: [
      "First level: Knowledge — Allah knows everything past, present, and future",
      "Second level: Writing — Everything is written in the Preserved Tablet (al-Lawh al-Mahfuz)",
      "Third level: Will — Nothing happens without Allah's will and permission",
      "Fourth level: Creation — Allah created everything, including people and their actions",
      "Belief in qadr does NOT negate human free will — Allah gave humans the ability to choose",
      "We are accountable for our choices because we have genuine ability and will",
      "Qadr is not an excuse for sinning — the Prophet (peace be upon him) rebuked those who used it as such",
      "The believer's response to good is gratitude (shukr) and to hardship is patience (sabr)",
    ],
    misconceptions: [
      {
        title: "If everything is decreed, why should we try?",
        clarification:
          "The means (asbab) are also part of the decree. You don't know what's decreed for you — the decree is hidden, and your duty is to strive. The Prophet (peace be upon him) said: 'Strive for what benefits you and seek help from Allah, and do not be helpless.' (Sahih Muslim 2664)",
      },
      {
        title: "Qadr means humans have no free will",
        clarification:
          "Islam affirms both Allah's will and human choice. Allah says: 'For whoever among you wills to take a right course.' (Quran 81:28). Humans genuinely choose, and Allah knew what they would choose. The two are not contradictory.",
      },
    ],
    sources: [
      "Sharh Usul al-Iman, Ibn Uthaymeen — Section on belief in divine decree",
      "Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah — Chapter on qadr",
      "Shifa al-Alil fi Masa'il al-Qada wal-Qadr, Ibn al-Qayyim",
      "Tafsir Ibn Kathir — Commentary on Quran 54:49, 57:22, 76:30",
      "Sahih Muslim 2653, Sahih al-Bukhari 3208 — Hadith on writing of decree",
    ],
  },
];

const sections = [
  { key: "intro", label: "What are the Articles?" },
  { key: "importance", label: "Why They Matter" },
  { key: "articles", label: "The Six Articles" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── components ───────────────────────── */

function ArticleCard({ article }: { article: Article }) {
  return (
    <ContentCard>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-themed">{article.title}</h2>
          <span className="text-lg font-arabic text-gold">{article.titleAr}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-themed-muted text-sm leading-relaxed mb-4">
        {article.description}
      </p>

      {/* Detailed explanation */}
      <div className="mb-4 p-4 rounded-lg border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
        <h4 className="text-sm font-semibold text-themed mb-2 flex items-center gap-2">
          <BookOpen size={14} className="text-gold" /> Understanding in Depth
        </h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          {article.detailedExplanation}
        </p>
      </div>

      {/* Key points */}
      <ul className="space-y-2 mb-4">
        {article.points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm text-themed">
            <span className="text-gold mt-0.5">&#9670;</span>
            {point}
          </li>
        ))}
      </ul>

      {/* All verses */}
      <div className="space-y-3 mb-4">
        {article.keyVerses.map((verse) => (
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
            <p className="text-xs text-themed-muted mt-2">{verse.ref}</p>
          </div>
        ))}
      </div>

      {/* Hadith */}
      {article.hadith.length > 0 && (
        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-semibold text-themed">From the Sunnah</h4>
          {article.hadith.map((h) => (
            <div
              key={h.ref}
              className="rounded-lg p-4 border-l-2 border-gold/30"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              <p className="text-themed text-sm italic">
                &ldquo;{h.text}&rdquo;
              </p>
              <p className="text-xs text-themed-muted mt-2">{h.ref}</p>
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
        {article.misconceptions.map((m) => (
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

export default function ArticlesOfFaithPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("intro");
  const [activeArticle, setActiveArticle] = useState("allah");

  return (
    <div>
      <PageHeader
        title="Articles of Faith"
        titleAr="أركان الإيمان"
        subtitle="The six pillars of Iman — the core beliefs every Muslim holds"
      />

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
        {/* ─── What are the Articles? ─── */}
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
                  Hadith of Jibril
                </p>
                <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose mb-4">
                  الإيمان أن تؤمن بالله وملائكته وكتبه ورسله واليوم الآخر وتؤمن بالقدر خيره وشره
                </p>
                <p className="text-themed-muted italic mb-2 max-w-2xl mx-auto">
                  &ldquo;Iman is to believe in Allah, His angels, His books, His messengers, the Last Day, and to believe in divine decree — both its good and its evil.&rdquo;
                </p>
                <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Sahih Muslim 8
                </span>
              </div>
            </ContentCard>

            {/* Definition */}
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">What are the Articles of Faith?</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  The <span className="text-themed font-medium">Articles of Faith</span> (أركان الإيمان) are the six fundamental beliefs that define what it means to be a believer (mu'min) in Islam. They were defined by the Prophet Muhammad (peace be upon him) himself in the famous Hadith of Jibril, when the angel Jibril came in human form and asked about Islam, Iman, and Ihsan.
                </p>
                <p>
                  While the <span className="text-themed font-medium">Five Pillars of Islam</span> are the outward acts of worship (shahada, prayer, zakat, fasting, hajj), the <span className="text-themed font-medium">Articles of Faith</span> are the inner beliefs of the heart. A person may perform all the pillars outwardly, but without these core beliefs, their worship is hollow.
                </p>
                <p>
                  Iman (faith) is not merely a claim on the tongue — it is belief in the heart, statement on the tongue, and action of the limbs. It increases with obedience and decreases with disobedience.
                </p>
                <p>
                  These six articles form a connected whole. Believing in Allah leads to believing in His angels (whom He created), His books (which He revealed), His messengers (whom He sent), the Last Day (which He promised), and His decree (which He ordained). Rejecting any one article breaks the chain.
                </p>
              </div>
            </ContentCard>

            {/* The difference between Islam and Iman */}
            <ContentCard delay={0.2}>
              <h2 className="text-xl font-semibold text-themed mb-4">Islam vs. Iman</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  In the Hadith of Jibril, the Prophet (peace be upon him) distinguished between <span className="text-themed font-medium">Islam</span> (the outward submission — the five pillars) and <span className="text-themed font-medium">Iman</span> (the inward belief — these six articles). A third level, <span className="text-themed font-medium">Ihsan</span>, is to worship Allah as though you see Him.
                </p>
                <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg)" }}>
                  <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                    قَالَ فَأَخْبِرْنِي عَنِ الإِيمَانِ
                  </p>
                  <p className="text-themed text-sm italic text-center">
                    &ldquo;He (Jibril) said: Then tell me about Iman.&rdquo;
                  </p>
                  <p className="text-xs text-themed-muted mt-2 text-center">Sahih Muslim 8</p>
                </div>
                <p>
                  Every mu'min (believer) is a muslim (one who submits), but not every muslim has attained the full level of Iman. The articles of faith are what elevate a person from mere outward compliance to true, heartfelt belief.
                </p>
              </div>
            </ContentCard>

            {/* Overview of the six */}
            <ContentCard delay={0.3}>
              <h2 className="text-xl font-semibold text-themed mb-4">The Six Articles</h2>
              <p className="text-themed-muted text-sm leading-relaxed mb-4">
                Each article builds upon the others — together they form a complete worldview of faith:
              </p>
              <div className="space-y-3">
                {articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => {
                      setActiveArticle(article.id);
                      setActiveSection("articles");
                    }}
                    className="w-full text-left rounded-lg p-4 border sidebar-border hover:border-gold/30 transition-colors"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-semibold text-themed text-sm">{article.title}</h3>
                      <span className="text-xs font-arabic text-gold/70">{article.titleAr}</span>
                    </div>
                    <p className="text-xs text-themed-muted mt-0.5 line-clamp-1">{article.description}</p>
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
                  "Sahih Muslim 8 — The Hadith of Jibril, defining Islam, Iman, and Ihsan",
                  "Sharh Usul al-Iman, Ibn Uthaymeen — Comprehensive explanation of the six articles",
                  "Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah — On the creed of Ahl as-Sunnah",
                  "Sharh al-Aqidah at-Tahawiyyah, Ibn Abi al-Izz — Classical commentary on creed",
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
                  ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ ۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَـٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ
                </p>
                <p className="text-themed-muted italic">
                  &ldquo;The Messenger has believed in what was revealed to him from his Lord, and so have the believers. All of them have believed in Allah, His angels, His books, and His messengers.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 2:285</p>
              </div>
            </ContentCard>

            {whyItMatters.map((item, i) => (
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

            {/* Quran 4:136 */}
            <ContentCard delay={0.35}>
              <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg)" }}>
                <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                  يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا ءَامِنُوا بِٱللَّهِ وَرَسُولِهِۦ وَٱلْكِتَـٰبِ ٱلَّذِى نَزَّلَ عَلَىٰ رَسُولِهِۦ وَٱلْكِتَـٰبِ ٱلَّذِىٓ أَنزَلَ مِن قَبْلُ ۚ وَمَن يَكْفُرْ بِٱللَّهِ وَمَلَـٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ وَٱلْيَوْمِ ٱلْـَٔاخِرِ فَقَدْ ضَلَّ ضَلَـٰلًۢا بَعِيدًا
                </p>
                <p className="text-themed text-sm italic">
                  &ldquo;O you who have believed, believe in Allah and His Messenger and the Book that He sent down upon His Messenger and the Scripture which He sent down before. And whoever disbelieves in Allah, His angels, His books, His messengers, and the Last Day has certainly gone far astray.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 4:136</p>
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
                  "Sahih Muslim 8 — The Hadith of Jibril",
                  "Sahih Muslim 2999 — On the affair of the believer being entirely good",
                  "Sharh Usul al-Iman, Ibn Uthaymeen — On the importance and implications of Iman",
                  "Tafsir Ibn Kathir — Commentary on Quran 2:285, 4:136, 67:2",
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

        {/* ─── The Six Articles ─── */}
        {activeSection === "articles" && (
          <motion.div
            key="articles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Article subtabs */}
            <div className="flex justify-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setActiveArticle(article.id)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeArticle === article.id
                      ? "bg-gold/20 text-gold border border-gold/40"
                      : "text-themed-muted hover:text-themed border sidebar-border"
                  }`}
                >
                  {article.title.replace("Belief in ", "").replace("the ", "The ")}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {articles.map(
                (article) =>
                  activeArticle === article.id && (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ArticleCard article={article} />

                      {/* Sources */}
                      {article.sources.length > 0 && (
                        <div className="mt-4">
                          <ContentCard delay={0.15}>
                            <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                              <BookOpen size={14} className="text-gold" />
                              Sources &amp; References
                            </h4>
                            <ul className="space-y-1.5">
                              {article.sources.map((source) => (
                                <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                                  <span className="text-gold/40 mt-0.5">&#8226;</span>
                                  {source}
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
