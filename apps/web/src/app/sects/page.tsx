"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import Accordion from "@hidden-hiqmah/ui/components/Accordion";

/* ───────────────────────── types ───────────────────────── */

type SectTopic = {
  id: string;
  name: string;
  content: {
    intro: string;
    points: { title: string; detail: string; note?: string }[];
    verse?: { arabic: string; text: string; ref: string };
    source?: string;
  };
};

/* ───────────────────────── data ───────────────────────── */

const whyItMatters = [
  {
    point: "The Prophet ﷺ foretold the splitting of the Ummah",
    detail:
      "The Prophet (peace be upon him) said: 'My Ummah will split into seventy-three sects, all of which will be in the Fire except one.' They asked: 'Which one is it, O Messenger of Allah?' He said: 'The one that follows what I and my Companions are upon today.'",
    reference: "Tirmidhi 40:36 (graded Hasan)",
  },
  {
    point: "Unity upon truth, not blind unity",
    detail:
      "Islam does not call for unity at the expense of truth. The Quran commands holding firmly to the rope of Allah together, not to invented doctrines. True unity is built upon the Quran, the Sunnah, and the understanding of the Companions — not political allegiances or tribal loyalties.",
    reference: "Quran 3:103",
  },
  {
    point: "The saved group is identified by its methodology",
    detail:
      "The saved sect is not identified by a label or organization, but by its adherence to the Quran, the authentic Sunnah, and the way of the Companions. Scholars call this approach 'Ahl al-Sunnah wal-Jama\'ah' — the people of the Prophetic tradition and the united body.",
    reference: "Abu Dawud 42:2",
  },
  {
    point: "Knowledge protects from deviation",
    detail:
      "Understanding the origins and beliefs of different sects — with fairness and scholarly rigour — helps Muslims identify innovations (bid'ah) and protect their creed. The early scholars wrote extensively on this topic to safeguard the Ummah.",
    reference: "Al-Milal wan-Nihal by ash-Shahrastani",
  },
  {
    point: "Declaring a Muslim a disbeliever (takfir) is the gravest of accusations",
    detail:
      "Ahl al-Sunnah warn sternly against loosely branding fellow Muslims as disbelievers — the very instinct that drove the first sect, the Khawarij. The Prophet ﷺ said: 'If a man says to his brother, O Kafir (disbeliever)!' Then surely one of them is such (i.e., a Kafir).' In another wording: 'When a man calls his brother an unbeliever, it returns (at least) to one of them.' If the accusation is untrue, its weight falls back on the one who made it. This is why takfir of a specific person is a ruling that belongs to qualified scholars — never to an app, an online argument, or an individual acting alone.",
    reference: "Bukhari 78:130; Muslim 1:121; Muslim 1:122",
  },
  {
    point: "Conditions and barriers must be established before anyone is judged",
    detail:
      "Even where a belief or statement is clearly disbelief, judging that a particular person has left Islam requires meeting strict conditions and removing every barrier (such as ignorance, misinterpretation, or coercion) — a task for scholars, in the same way a judge, not a bystander, issues a verdict. The Prophet ﷺ said: 'If any believing man calls another believing man an unbeliever, if he is actually an infidel, it is all right ; if not, he will become an infidel.' The safe path for the ordinary Muslim is to clarify the truth about ideas while withholding verdicts on individuals.",
    reference: "Abu Dawud 42:92",
  },
];

const sunniTopics: SectTopic[] = [
  {
    id: "aqeedah",
    name: "Core Creed (Aqeedah)",
    content: {
      intro:
        "Ahl al-Sunnah wal-Jama'ah follow the creed established by the Quran, the Sunnah, and the consensus of the Companions. This creed was articulated and defended by scholars like Imam Ahmad ibn Hanbal, Ibn Taymiyyah, and others against various theological innovations.",
      verse: {
        arabic: "وَٱعْتَصِمُوا بِحَبْلِ ٱللَّهِ جَمِيعًۭا وَلَا تَفَرَّقُوا",
        text: "And hold firmly to the rope of Allah all together and do not become divided.",
        ref: "Quran 3:103",
      },
      points: [
        {
          title: "Tawhid in all its categories",
          detail:
            "Affirming Allah's Lordship (Rububiyyah), His sole right to worship (Uluhiyyah), and His unique names and attributes (Asma' wa Sifat) as described in the Quran and Sunnah — without distortion (tahrif), denial (ta'til), asking 'how' (takyif), or likening to creation (tamthil).",
          note: "Quran 42:11; Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah",
        },
        {
          title: "The Quran is the uncreated speech of Allah",
          detail:
            "Ahl al-Sunnah affirm that the Quran is the actual speech of Allah, not created. This was the position defended by Imam Ahmad ibn Hanbal during the famous Mihnah (inquisition) trial, when he was imprisoned and tortured for refusing to say the Quran was created.",
          note: "Usul al-Sunnah, Imam Ahmad; Al-Bidayah wan-Nihayah, Ibn Kathir — Events of 218 AH",
        },
        {
          title: "Allah's attributes are affirmed literally",
          detail:
            'The Hand of Allah, His Face, His Rising over the Throne (Istiwaa) — all are affirmed as they are described, in a manner that befits His Majesty. We do not liken them to human attributes, nor do we strip them of meaning. As Imam Malik said when asked about Istiwaa: "The Rising is known, the how is unknown, belief in it is obligatory, and asking about it is an innovation."',
          note: "Reported by al-Bayhaqi in Al-Asma' was-Sifat",
        },
        {
          title: "Faith is belief, speech, and action",
          detail:
            "Iman consists of belief in the heart, affirmation on the tongue, and actions of the limbs. It increases with obedience and decreases with sin. This distinguishes Ahl al-Sunnah from the Murji'ah (who exclude actions from faith) and the Khawarij (who make major sin equivalent to disbelief).",
          note: "Bukhari 2:2; Sharh Usul al-Sunnah, Imam Ahmad",
        },
      ],
      source: "Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah; Usul al-Sunnah, Imam Ahmad; Lum'at al-I'tiqad, Ibn Qudamah",
    },
  },
  {
    id: "fiqh",
    name: "Schools of Jurisprudence",
    content: {
      intro:
        "Within Sunni Islam, four major schools of fiqh (jurisprudence) emerged, each named after its founding scholar. These schools differ in secondary rulings (furu') but agree on the fundamentals of creed and worship. Following any of them is valid, and they are considered a mercy and richness — not a division.",
      points: [
        {
          title: "Hanafi (Abu Hanifah, d. 150 AH)",
          detail:
            "The oldest and most widely followed school globally. Known for its extensive use of analogy (qiyas) and juridical reasoning (ra'y). Dominant in Turkey, Central Asia, South Asia, and parts of the Arab world. Imam Abu Hanifah was a student of Hammad ibn Abi Sulayman and had indirect connections to the Companions.",
          note: "Approximately 30% of Muslims worldwide follow this school",
        },
        {
          title: "Maliki (Imam Malik, d. 179 AH)",
          detail:
            "Founded by the author of al-Muwatta, one of the earliest hadith compilations. The Maliki school uniquely considers the practice of the people of Madinah ('Amal Ahl al-Madinah) as a source of law, reasoning that they inherited the Prophet's practice directly. Dominant in North and West Africa, and parts of the Gulf.",
          note: "Approximately 25% of Muslims worldwide follow this school",
        },
        {
          title: "Shafi'i (Imam ash-Shafi'i, d. 204 AH)",
          detail:
            "Imam ash-Shafi'i is known as the father of usul al-fiqh (principles of jurisprudence) for his landmark work 'al-Risalah.' His school strikes a balance between hadith-based and reason-based approaches. Dominant in Southeast Asia, East Africa, Yemen, and parts of Egypt.",
          note: "Approximately 25% of Muslims worldwide follow this school",
        },
        {
          title: "Hanbali (Imam Ahmad ibn Hanbal, d. 241 AH)",
          detail:
            "Known for its strong adherence to textual evidence from the Quran and Sunnah with minimal reliance on analogy. Imam Ahmad compiled the Musnad, one of the largest hadith collections. Dominant in Saudi Arabia and Qatar. The school produced major scholars like Ibn Taymiyyah and Ibn al-Qayyim.",
          note: "Approximately 5% of Muslims worldwide follow this school",
        },
        {
          title: "Differences are a mercy, not a division",
          detail:
            "The four schools agree on the vast majority of issues. Their differences lie in secondary matters — how to place hands in prayer, the wording of qunut, specific inheritance scenarios, etc. None of these differences involve the fundamentals of the religion. The Prophet ﷺ said: 'If a judge makes a ruling, striving to reach the correct verdict, and he is right, he has two rewards. If he is wrong, he has one reward.'",
          note: "Bukhari 96:79; Muslim 30:18",
        },
        {
          title: "Do I have to follow a madhhab?",
          detail:
            "For most Muslims — especially newcomers who cannot yet weigh evidence directly — the practical answer of the majority of scholars is to learn and act upon one of the four schools, because a reliable school is a tested path back to the Quran and Sunnah, not a rival to them. A person is not sinful for following the ruling of qualified scholars in good faith. What matters is sincerity to the evidence, not loyalty to a name: if an authentic proof clearly shows a school's position on a point is weaker, the truth is followed. This is a question worth putting to a trusted local scholar rather than settling from the internet.",
          note: "A practical orientation, not a fifth ruling — consult a qualified scholar for your situation",
        },
        {
          title: "Switching schools and mixing rulings",
          detail:
            "Following one school does not bind a person to it for life; scholars permit moving to another school, and a layperson may take a different school's ruling in a specific need. What scholars caution against is 'talfiq' — assembling a single act of worship from several schools purely to chase the easiest option in each step, in a way none of the schools would accept. The guiding principle is to seek the correct ruling, not the most convenient one.",
          note: "The four schools each represent disciplined ijtihad — cherry-picking to escape obligation is discouraged; ask a scholar when unsure",
        },
        {
          title: "Praying behind a different madhhab",
          detail:
            "The next mosque may raise the hands differently, say the qunut aloud, or hold that touching one's spouse breaks wudu — all valid positions within the four schools. Ahl al-Sunnah pray behind one another without objection; the Companions and the early scholars did the same despite their fiqh differences. Minor variations in a congregation are a sign of the richness of the tradition, not a reason to split from it.",
          note: "Secondary (furu') differences never justify boycotting a fellow Muslim's prayer",
        },
        {
          title: "Legitimate disagreement: the Banu Qurayzah precedent",
          detail:
            "When the Prophet ﷺ sent the Companions to Banu Qurayzah he said: 'None should offer the 'Asr prayer but at Bani Quraiza.' Asr became due on the way. Some prayed at once, reasoning the command meant 'hurry,' while others delayed until they arrived, taking the words literally. When it was mentioned to the Prophet ﷺ, 'he did not blame anyone of them.' This is the classic proof that two sincere, evidence-based readings of the same text can both be within the fold — the very basis of respectful fiqh disagreement.",
          note: "Bukhari 12:5; Bukhari 64:163",
        },
      ],
      source: "Al-Madhahib al-Arba'ah, Abdur-Rahman al-Jaziri; Siyar A'lam an-Nubala, adh-Dhahabi; Bukhari 12:5; Bukhari 64:163",
    },
  },
  {
    id: "hadith-methodology",
    name: "Hadith Sciences",
    content: {
      intro:
        "The preservation of hadith is one of the distinguishing features of Sunni Islam. An unparalleled system of narrator criticism (al-jarh wa al-ta'dil) was developed to authenticate every statement attributed to the Prophet ﷺ.",
      points: [
        {
          title: "The chain of narration (isnad)",
          detail:
            "Every hadith is accompanied by its chain of narrators going back to the Prophet ﷺ. Abdullah ibn al-Mubarak said: 'The isnad is part of the religion. Were it not for the isnad, whoever wished would say whatever they wished.' This system is unique to Islam — no other civilization developed anything comparable.",
          note: "Muqaddimah Sahih Muslim",
        },
        {
          title: "Classifications of hadith",
          detail:
            "Hadith are graded as Sahih (authentic), Hasan (good), Da'if (weak), or Mawdu' (fabricated) based on the integrity and memory of narrators, the continuity of the chain, and the absence of hidden defects or contradictions. Only Sahih and Hasan hadith are used as evidence in rulings.",
          note: "Muqaddimah Ibn as-Salah",
        },
        {
          title: "The six canonical collections",
          detail:
            "The most authoritative collections are: Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami' at-Tirmidhi, Sunan an-Nasa'i, and Sunan Ibn Majah. Bukhari and Muslim are considered the most authentic books after the Quran.",
          note: "An-Nawawi, Sharh Sahih Muslim",
        },
        {
          title: "Narrator biographies (Rijal)",
          detail:
            "Scholars compiled massive biographical dictionaries documenting the life, character, memory, teachers, students, and reliability of over 100,000 hadith narrators. This meticulous system — called 'ilm ar-rijal — ensured that fabricated narrations could be identified and rejected.",
          note: "Tahdhib at-Tahdhib, Ibn Hajar; Mizan al-I'tidal, adh-Dhahabi",
        },
      ],
      source: "Muqaddimah Ibn as-Salah; Nukhbat al-Fikar, Ibn Hajar al-Asqalani; Muqaddimah Sahih Muslim",
    },
  },
  {
    id: "companions",
    name: "Status of the Companions",
    content: {
      intro:
        "Ahl al-Sunnah love and respect all of the Companions (Sahabah) of the Prophet ﷺ, consider them the best generation of Muslims, and refrain from speaking about their disputes. This is one of the clearest distinguishing markers between Sunni Islam and other sects.",
      verse: {
        arabic: "وَٱلسَّـٰبِقُونَ ٱلْأَوَّلُونَ مِنَ ٱلْمُهَـٰجِرِينَ وَٱلْأَنصَارِ وَٱلَّذِينَ ٱتَّبَعُوهُم بِإِحْسَـٰنٍۢ رَّضِىَ ٱللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ",
        text: "And the foremost among the Muhajirun and the Ansar, and those who followed them in goodness — Allah is pleased with them and they are pleased with Him.",
        ref: "Quran 9:100",
      },
      points: [
        {
          title: "All Companions are trustworthy ('udul)",
          detail:
            "The Quran and Sunnah testify to the righteousness of the Companions as a whole. The Prophet ﷺ said: 'The best of people is my generation, then those who follow them, then those who follow them.' Their testimony is accepted, and we do not impugn any of them.",
          note: "Bukhari 52:16; Muslim 44:55",
        },
        {
          title: "The Rightly Guided Caliphs",
          detail:
            "The best of the Companions are Abu Bakr, then Umar, then Uthman, then Ali (may Allah be pleased with them all) — in this order of merit. This is the position of the majority of Ahl al-Sunnah. All four were righteous leaders who served Islam with sincerity.",
          note: "Bukhari 62:7; Bukhari 62:21; Al-Aqidah at-Tahawiyyah",
        },
        {
          title: "Silence about their disputes",
          detail:
            "What occurred between the Companions — such as the conflicts between Ali and Mu'awiyah — we are silent about. Each of them exercised ijtihad (independent reasoning). We do not curse, insult, or disparage any of them. As Umar ibn Abd al-Aziz said: 'That was blood from which Allah kept our swords clean, so let us keep our tongues clean from it.'",
          note: "Al-Aqidah at-Tahawiyyah; Minhaj as-Sunnah, Ibn Taymiyyah",
        },
        {
          title: "The Ahl al-Bayt are honored",
          detail:
            "Ahl al-Sunnah love and honor the Prophet's family (Ahl al-Bayt), including Ali, Fatimah, Hasan, and Husayn. Loving them is part of loving the Prophet ﷺ. However, this love does not lead to elevating them above their station or using them as a basis for sectarianism.",
          note: "Quran 42:23; Muslim 44:55",
        },
      ],
      source: "Al-Aqidah at-Tahawiyyah; Minhaj as-Sunnah an-Nabawiyyah, Ibn Taymiyyah; Bukhari 52:16; Bukhari 62:7; Bukhari 62:21",
    },
  },
  {
    id: "sunnah-bidah",
    name: "Sunnah & Bid'ah",
    content: {
      intro:
        "The whole subject of sects rests on one tool: the ability to tell the Sunnah (the Prophet's way) from bid'ah (religious innovation). Every deviant group deviated by adding to, or subtracting from, what the Prophet ﷺ and his Companions were upon. Understanding what bid'ah actually is — and what it is not — is how a Muslim recognises deviation without falling into the opposite extreme of branding every new thing 'haram.'",
      verse: {
        arabic: "وَكُلُّ بِدْعَةٍ ضَلاَلَةٌ",
        text: "…and every innovation is error.",
        ref: "Muslim 7:55",
      },
      points: [
        {
          title: "What bid'ah means",
          detail:
            "In the religious sense, bid'ah is introducing into the religion a way of worship or belief that has no basis in the Quran, the Sunnah, or the practice of the Companions — while treating it as part of the religion. In his Friday sermons the Prophet ﷺ would warn: 'The best of the speech is embodied in the Book of Allah, and the best of the guidance is the guidance given by Muhammad. And the most evil affairs are their innovations; and every innovation is error.'",
          note: "Muslim 7:55",
        },
        {
          title: "The farewell advice of al-'Irbad ibn Sariyah",
          detail:
            "The Prophet ﷺ gave a moving exhortation that made hearts tremble and eyes weep. Asked for a parting injunction, he said: '…those of you who live after me will see great disagreement. You must then follow my sunnah and that of the rightly-guided caliphs. Hold to it and stick fast to it. Avoid novelties, for every novelty is an innovation, and every innovation is an error.' This hadith is the charter of the whole subject: in times of confusion, cling to the established Sunnah and the way of the Rightly-Guided Caliphs.",
          note: "Abu Dawud 42:12; Ibn Majah 0:42",
        },
        {
          title: "What bid'ah is NOT",
          detail:
            "Innovation in the blameworthy sense concerns matters of religion. New worldly inventions — cars, printing, microphones, schools, cataloguing hadith, or compiling the Quran into one book — are not bid'ah, because they are not offered as acts of worship with their own reward. The Companions themselves undertook worldly and organisational novelties. Confusing beneficial worldly development with religious innovation is itself a mistake, and the balanced Sunni position avoids both extremes.",
          note: "The Companions gathered the Quran into one mushaf and organised the standing tarawih congregation — worldly means serving the Sunnah, not additions to worship",
        },
        {
          title: "Why bid'ah is treated so seriously",
          detail:
            "A person who innovates in worship implicitly claims the religion was incomplete — yet Allah declared: 'Today I have perfected your religion for you' (Quran 5:3). Bid'ah is also more dangerous than ordinary sin because the innovator rarely repents, believing he is doing good. This is why the Salaf guarded the boundaries of worship so carefully, and why recognising bid'ah is the reader's core defence against every sect on this page.",
          note: "Quran 5:3; every group surveyed here departed from the Sunnah by innovation in creed or worship",
        },
      ],
      source: "Muslim 7:55; Abu Dawud 42:12; Ibn Majah 0:42; Quran 5:3; Al-I'tisam, ash-Shatibi",
    },
  },
  {
    id: "jamaah",
    name: "Holding to the Jama'ah",
    content: {
      intro:
        "'The saved group' is identified with 'the Jama'ah' — the main body of the Muslims following the Prophet ﷺ and his Companions. These narrations are the canonical proof-texts behind the instruction to 'stay with the main body,' and they include the Prophet's practical guidance for times of confusion when the community seems fractured.",
      verse: {
        arabic: "يَدُ اللَّهِ مَعَ الْجَمَاعَةِ",
        text: "Allah's Hand is with the Jama'ah",
        ref: "Tirmidhi 33:9",
      },
      points: [
        {
          title: "Do not separate from the main body",
          detail:
            "The Prophet ﷺ said: 'One who found in his Amir something which he disliked should hold his patience, for one who separated from the main body of the Muslims even to the extent of a handspan and then he died would die the death of one belonging to the days of Jahiliyya.' Splitting away is treated as a grave matter — even a handspan's separation from the united body of Muslims is warned against.",
          note: "Muslim 33:87",
        },
        {
          title: "The Ummah will not unite on misguidance",
          detail:
            "Anas ibn Malik reported the Prophet ﷺ saying: 'My nation will not unite on misguidance, so if you see them differing, follow the great majority.' In another wording: 'Indeed Allah will not gather my Ummah … upon deviation, and Allah's Hand is over the Jama'ah, and whoever deviates, he deviates to the Fire.' The collective, guided body of the Ummah is divinely protected from agreeing upon error.",
          note: "Ibn Majah 36:25; Tirmidhi 33:10",
        },
        {
          title: "Hudhayfah's hadith — the callers at the gates of Hell",
          detail:
            "Hudhayfah ibn al-Yaman asked the Prophet ﷺ about coming evil. He described 'people standing and inviting at the gates of Hell. Whoso responds to their call they will throw them into the fire… a people having the same complexion as ours and speaking our language.' Asked what to do, he ﷺ said: 'You should stick to the main body of the Muslims and their leader.' And if there were none? 'Separate yourself from all these factions…' This is the practical protocol for confusing times.",
          note: "Muslim 33:81",
        },
        {
          title: "What 'the Jama'ah' actually means",
          detail:
            "The scholars explained that the Jama'ah is defined by truth, not mere numbers: it is the body of Muslims upon the way of the Prophet ﷺ and his Companions, and its people are the scholars of fiqh, knowledge, and hadith. Abdullah ibn al-Mubarak was asked, 'Who is the Jama'ah?' — and named the scholars of the Sunnah of his day. So holding to the Jama'ah means holding to the established, evidence-based understanding carried by trustworthy scholars, not simply following whichever crowd is largest.",
          note: "Explained by at-Tirmidhi in his Sunan after 33:10; Al-I'tisam, ash-Shatibi",
        },
      ],
      source: "Muslim 33:87; Muslim 33:81; Tirmidhi 33:9; Tirmidhi 33:10; Ibn Majah 36:25",
    },
  },
];

const shiaTopics: SectTopic[] = [
  {
    id: "origins",
    name: "Historical Origins",
    content: {
      intro:
        "The Shia (شيعة, literally 'partisans' or 'followers') originated from a political dispute over the succession to the Prophet ﷺ. After the Prophet's death, the majority of Companions chose Abu Bakr as caliph through consultation (shura), while a minority believed Ali ibn Abi Talib had been designated as the direct successor. Over time, this political disagreement evolved into deep theological differences.",
      points: [
        {
          title: "The succession dispute",
          detail:
            "When the Prophet ﷺ passed away, the Ansar and Muhajirun gathered at Saqifah Bani Sa'idah. After discussion, Abu Bakr was chosen as caliph, and Ali himself pledged allegiance to him. The historical record shows the early community resolved this through consultation, though later Shia scholarship reinterpreted events to argue that Ali was divinely appointed.",
          note: "Bukhari 86:56; Tarikh at-Tabari",
        },
        {
          title: "From political to theological",
          detail:
            "Initially, the 'Shia of Ali' were simply those who supported Ali's political claim. The transformation into a distinct theological sect occurred gradually over centuries, with concepts like divine Imamah, infallibility of Imams, and the rejection of certain Companions being developed well after the era of the Companions.",
          note: "Al-Milal wan-Nihal, ash-Shahrastani; Al-Farq bayn al-Firaq, al-Baghdadi",
        },
        {
          title: "The tragedy of Karbala (61 AH)",
          detail:
            "The killing of Husayn ibn Ali at Karbala by the forces of Yazid ibn Mu'awiyah was a tragedy that all Muslims grieve. Ahl al-Sunnah condemn this act and honor Husayn as a grandson of the Prophet ﷺ and a righteous martyr. However, this event is used by Shia Islam as a foundational narrative that shapes much of their practice and theology.",
          note: "Bukhari 62:98; Tarikh at-Tabari",
        },
        {
          title: "Major sub-sects developed over time",
          detail:
            "The Shia themselves split into numerous groups over disagreements about which Imam to follow: the Twelvers (Ithna 'Ashariyyah) are the largest, followed by the Ismailis (Seveners), Zaidis (Fivers), Alawites, Druze, and others. Each group has distinct beliefs about the line of Imamah.",
          note: "Al-Milal wan-Nihal, ash-Shahrastani",
        },
      ],
      source: "Bukhari 86:56; Tarikh at-Tabari; Al-Milal wan-Nihal, ash-Shahrastani",
    },
  },
  {
    id: "beliefs",
    name: "Key Beliefs",
    content: {
      intro:
        "Twelver Shia Islam (the largest branch, dominant in Iran, Iraq, Lebanon, and Bahrain) holds several beliefs that distinguish it from Sunni Islam. These differences go beyond jurisprudence and touch the foundations of creed.",
      points: [
        {
          title: "Divine Imamah (leadership)",
          detail:
            "Shia believe that Allah directly appointed Ali and his descendants as leaders (Imams) of the Muslim community. They consider Imamah one of the five pillars of their religion (Usul al-Din). Ahl al-Sunnah reject this, as the Quran does not prescribe a specific system of succession, and the Prophet ﷺ left the matter to the community's consultation (shura).",
          note: "Al-Kafi, al-Kulayni — Kitab al-Hujjah",
        },
        {
          title: "Infallibility of the twelve Imams",
          detail:
            "Shia believe that the twelve Imams are divinely protected from all sin and error (ma'sum), and that their authority equals or supplements the Prophet's Sunnah. Ahl al-Sunnah hold that infallibility belongs only to prophets in conveying revelation, and that no human after the Prophet ﷺ is infallible.",
          note: "Usul al-Kafi, al-Kulayni; refuted in Minhaj as-Sunnah, Ibn Taymiyyah",
        },
        {
          title: "The concept of the Hidden Imam",
          detail:
            "Twelver Shia believe their twelfth Imam, Muhammad al-Mahdi, went into occultation (ghaybah) in 874 CE and is still alive, guiding the community from hiding. He will return as the Mahdi. Ahl al-Sunnah believe in the Mahdi as a future leader but do not believe he has been born yet or is currently in hiding.",
          note: "Al-Ghaybah, at-Tusi; contrast with Abu Dawud 38:6",
        },
        {
          title: "Position on the Companions",
          detail:
            "Many Shia scholars and texts criticize, curse, or declare disbelief in prominent Companions, especially Abu Bakr, Umar, Uthman, A'ishah, and others — claiming they usurped Ali's right and altered the religion. This directly contradicts Quran 9:100 where Allah declares His pleasure with the foremost among the Muhajirun and Ansar.",
          note: "Quran 9:100; Quran 48:18; Muslim 44:55",
        },
        {
          title: "Different hadith corpus",
          detail:
            "Shia do not accept the six canonical Sunni hadith collections. Instead, they rely on their own compilations, primarily: Al-Kafi by al-Kulayni, Man La Yahduruhu al-Faqih by Ibn Babawayh, Tahdhib al-Ahkam by at-Tusi, and Al-Istibsar by at-Tusi. Their chains of narration bypass the Companions whom they reject.",
          note: "Al-Kafi contains approximately 16,199 narrations; many contradict Sunni sources",
        },
      ],
      source: "Al-Kafi, al-Kulayni; Minhaj as-Sunnah an-Nabawiyyah, Ibn Taymiyyah; Al-Khutut al-'Aridah, Muhibb ad-Din al-Khatib",
    },
  },
  {
    id: "practices",
    name: "Distinct Practices",
    content: {
      intro:
        "Several Shia practices differ from Sunni Islam and have no basis in the authentic Sunnah of the Prophet ﷺ. Understanding these differences helps clarify the scope of divergence.",
      points: [
        {
          title: "Mut'ah (temporary marriage)",
          detail:
            "Shia permit mut'ah — a marriage with a predetermined end date. Ahl al-Sunnah hold that the Prophet ﷺ definitively prohibited this practice. Ali ibn Abi Talib himself narrated that the Prophet ﷺ forbade mut'ah at the Battle of Khaybar.",
          note: "Bukhari 67:52; Muslim 16:29",
        },
        {
          title: "Tatbir and self-flagellation",
          detail:
            "Some Shia communities practice self-flagellation and cutting during the commemoration of Husayn's martyrdom in Muharram. Islam prohibits harming oneself: 'And do not kill yourselves. Indeed, Allah is ever Merciful to you.' Some senior Shia scholars have also spoken against these practices.",
          note: "Quran 4:29",
        },
        {
          title: "Combining prayers and different adhan",
          detail:
            "Shia regularly combine Dhuhr with Asr and Maghrib with Isha, praying three times daily instead of five. They also add 'Hayya 'ala khayr al-'amal' (Come to the best of deeds) and 'Ash-hadu anna Aliyyan waliyu-llah' (I testify that Ali is the ally of Allah) to the adhan — additions not taught by the Prophet ﷺ.",
          note: "Bukhari 10:1 — the established adhan; no authentic hadith supports the additions to the adhan",
        },
        {
          title: "Taqiyyah (religious dissimulation)",
          detail:
            "Shia theology elevates taqiyyah (concealing one's beliefs) to a central religious principle. Some Shia texts state that 'nine-tenths of religion is taqiyyah' and that one who has no taqiyyah has no religion. While Islam permits concealing faith under threat of death, the Shia application goes far beyond this limited exception.",
          note: "Al-Kafi, al-Kulayni — Kitab al-Iman wal-Kufr; contrast with Quran 16:106",
        },
        {
          title: "Shrine visitation and intercession through the dead",
          detail:
            "Many Shia visit the shrines of their Imams and saints, making supplications to them, asking them for intercession, and performing acts of worship at their graves. Ahl al-Sunnah hold that du'a (supplication) is worship and must be directed only to Allah. Asking the dead to intercede contradicts Tawhid.",
          note: "Quran 39:3; Quran 72:18",
        },
      ],
      source: "Bukhari 67:52; Muslim 16:29; Al-Kafi, al-Kulayni; Quran 4:29; Quran 39:3",
    },
  },
  {
    id: "branches",
    name: "Branches & Sub-sects",
    content: {
      intro:
        "'Shia' is not a single body. Over disputes about which Imam to follow, the movement divided into branches whose beliefs range from very close to Sunni positions to esoteric doctrines that most scholars place outside Islam entirely. Naming them fairly matters, because the differences between them are large and practically relevant.",
      points: [
        {
          title: "Twelvers (Ithna 'Ashariyyah)",
          detail:
            "By far the largest branch, dominant in Iran, Iraq, Azerbaijan, Bahrain, and southern Lebanon. They follow a line of twelve Imams ending with Muhammad al-Mahdi, whom they believe went into occultation. Their creed and practices are the ones described in the Key Beliefs and Distinct Practices sections of this page.",
          note: "The largest Shia branch; see the Key Beliefs and Distinct Practices topics above",
        },
        {
          title: "Zaidis (Fivers)",
          detail:
            "Named for Zayd ibn Ali, and concentrated historically in Yemen. Zaidis are widely regarded as the closest of the Shia branches to Ahl al-Sunnah: they do not hold the Imams to be infallible, do not curse or excommunicate the earlier Companions, accept the caliphates of Abu Bakr and Umar as valid, and their fiqh is close to the Sunni schools. Their disagreement with Sunnis is comparatively narrow.",
          note: "Historically dominant in Yemen; the branch nearest to Sunni positions",
        },
        {
          title: "Ismailis (Seveners): Nizari and Musta'li-Bohra",
          detail:
            "Ismailis split from the Twelvers over the seventh Imam. The Nizari Ismailis follow a living hereditary Imam, the Aga Khan, and are known for a highly interpretive (batini, 'inner-meaning') approach to religious texts. The Musta'li line includes the Dawoodi Bohras, led by a Da'i al-Mutlaq. Both hold doctrines of esoteric interpretation that differ substantially from mainstream Islam.",
          note: "Al-Milal wan-Nihal, ash-Shahrastani — the batini (esoteric) schools",
        },
        {
          title: "Alawites and Druze",
          detail:
            "The Alawites (Nusayris) of Syria and the Druze of the Levant grew out of Shia currents but developed secret, esoteric belief systems — including, among some, the near-deification of Ali or of other figures, and (among the Druze) belief in the transmigration of souls. Because these doctrines contradict the foundations of Tawhid, the majority of Muslim scholars — both Sunni and mainstream Shia — regard them as separate from Islam rather than a branch within it.",
          note: "Al-Farq bayn al-Firaq, al-Baghdadi; classical heresiographies place the ghulat (extremists) outside Islam",
        },
      ],
      source: "Al-Milal wan-Nihal, ash-Shahrastani; Al-Farq bayn al-Firaq, al-Baghdadi",
    },
  },
  {
    id: "sunni-response",
    name: "The Sunni Position",
    content: {
      intro:
        "Ahl al-Sunnah engage with these differences based on knowledge, justice, and authentic sources — not sectarian hatred. The goal is to clarify the truth, not to fuel animosity.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا كُونُوا قَوَّٰمِينَ لِلَّهِ شُهَدَآءَ بِٱلْقِسْطِ",
        text: "O you who have believed, be persistently standing firm for Allah, witnesses in justice.",
        ref: "Quran 5:8",
      },
      points: [
        {
          title: "We judge beliefs, not individuals",
          detail:
            "Ahl al-Sunnah distinguish between judging a belief as deviant and declaring a specific individual a disbeliever. Many laypeople among the Shia are simply following what they were taught. Our obligation is to convey the truth with wisdom and good counsel, and to pray for guidance for all Muslims.",
          note: "Quran 16:125; Majmu' al-Fatawa, Ibn Taymiyyah",
        },
        {
          title: "Ibn Taymiyyah's comprehensive response",
          detail:
            "Shaykh al-Islam Ibn Taymiyyah wrote 'Minhaj as-Sunnah an-Nabawiyyah' — a detailed, multi-volume response to the Shia theologian al-Hilli. In it, he systematically addresses Shia claims about Imamah, the Companions, and theology, while maintaining scholarly objectivity and relying on authentic sources.",
          note: "Minhaj as-Sunnah an-Nabawiyyah, 9 volumes",
        },
        {
          title: "Common ground exists",
          detail:
            "Sunni and Shia Muslims share the testimony of faith, belief in the Quran, the five pillars of Islam (though with differences in practice), and belief in the Prophet Muhammad ﷺ. These shared foundations mean we can engage in dialogue and coexist, while being honest about real theological differences.",
        },
      ],
      source: "Minhaj as-Sunnah an-Nabawiyyah, Ibn Taymiyyah; Quran 5:8; Quran 16:125",
    },
  },
];

const otherSects: SectTopic[] = [
  {
    id: "khawarij",
    name: "Khawarij",
    content: {
      intro:
        "The Khawarij ('those who went out') were the first sect to emerge in Islam. They broke away from Ali ibn Abi Talib's army after the Battle of Siffin (37 AH) when he agreed to arbitration with Mu'awiyah. They declared both Ali and Mu'awiyah — and anyone who accepted arbitration — as disbelievers.",
      verse: {
        arabic: "يَخْرُجُ مِنْ ضِئْضِئِ هَذَا قَوْمٌ يَتْلُونَ كِتَابَ اللَّهِ رَطْبًا لاَ يُجَاوِزُ حَنَاجِرَهُمْ",
        text: "There will emerge from the progeny of this man a people who will recite the Quran, but it will not go beyond their throats (i.e., they won't understand it).",
        ref: "Bukhari 61:117",
      },
      points: [
        {
          title: "Declaring Muslims as disbelievers (Takfir)",
          detail:
            "The defining characteristic of the Khawarij is declaring major sin as kufr (disbelief). They believe that any Muslim who commits a major sin leaves Islam entirely. This led them to view most Muslims — including Companions — as apostates deserving death.",
          note: "Muslim 12:196; Maqalat al-Islamiyyin, al-Ash'ari",
        },
        {
          title: "The Prophet ﷺ warned about them extensively",
          detail:
            "The Prophet ﷺ described them in multiple hadith: they are young in age, foolish in mind, they speak the best of words but leave Islam like an arrow passes through its target. He ﷺ said: 'If I were to encounter them, I would kill them as the people of 'Ad were killed.'",
          note: "Bukhari 61:118; Muslim 12:196",
        },
        {
          title: "The founding incident: Dhul-Khuwaysirah",
          detail:
            "While the Prophet ﷺ was distributing wealth, a man of Banu Tamim named Dhul-Khuwaysirah objected: 'Be just, O Allah's Messenger!' The Prophet ﷺ replied: 'Woe to you ! Who would be just if I were not?' When Umar sought permission to strike his neck, the Prophet ﷺ refused and foretold: '…he has companions, and if you compare your prayers with their prayers and your fasting with theirs, you will look down upon your prayers and fasting… Yet they will go out of the religion as an arrow darts through the game's body.' Their hallmark — self-righteous zeal that presumes to correct even the Prophet ﷺ — was present from the very first.",
          note: "Bukhari 88:15; Bukhari 78:189",
        },
        {
          title: "Impressive worship, empty of guidance",
          detail:
            "The Prophet ﷺ said: 'There will appear some people among you whose prayer will make you look down upon yours, and whose fasting will make you look down upon yours, but they will recite the Qur'an which will not exceed their throats … and they will go out of Islam as an arrow goes out through the game.' Intense devotion is no proof of being upon the truth; the Khawarij were famous for their prayer and recitation, yet it did not reach their hearts.",
          note: "Bukhari 66:83; Bukhari 88:14",
        },
        {
          title: "'The dogs of the Hellfire'",
          detail:
            "The Prophet ﷺ said of them, as Ibn Abi Awfa reported: 'The Khawarij are the dogs of Hell.' He also described how at the end of time 'a people with new teeth (i.e., young in age), with foolish minds' would arise, speaking the finest words yet passing through Islam like an arrow — 'Whoever meets them, let him kill them, for killing them will bring a reward from Allah…' These are the strongest warnings issued against any group in the hadith corpus.",
          note: "Ibn Majah 0:173; Tirmidhi 47:52; Ibn Majah 0:168; Bukhari 66:82",
        },
        {
          title: "They assassinated Ali ibn Abi Talib",
          detail:
            "In 40 AH, the Kharijite Abd al-Rahman ibn Muljam assassinated Ali (may Allah be pleased with him) while he was leading the Fajr prayer. They also plotted to kill Mu'awiyah and Amr ibn al-As on the same day but failed in those attempts.",
          note: "Tarikh at-Tabari; Al-Bidayah wan-Nihayah, Ibn Kathir",
        },
        {
          title: "Modern-day manifestations",
          detail:
            "The Kharijite methodology — declaring Muslims as disbelievers and justifying violence against them — has resurfaced throughout history, including in modern extremist groups. The scholars of Ahl al-Sunnah have consistently identified and refuted this ideology, which the Prophet ﷺ himself condemned.",
          note: "Bukhari 61:117; Muslim 12:196; fatawa of contemporary scholars",
        },
      ],
      source: "Bukhari 61:117; Bukhari 88:15; Bukhari 78:189; Bukhari 88:14; Bukhari 66:82; Bukhari 66:83; Tirmidhi 47:52; Ibn Majah 0:173; Ibn Majah 0:168; Muslim 12:196; Maqalat al-Islamiyyin, al-Ash'ari",
    },
  },
  {
    id: "ibadiyyah",
    name: "Ibadiyyah",
    content: {
      intro:
        "The Ibadiyyah are the third living branch of Islam alongside Sunnis and Shia — today the majority in Oman and present in parts of North and East Africa. They emerged from the moderate wing of the early Kharijite movement, though modern Ibadis firmly reject the 'Khariji' label and distance themselves from the extremism described above. They have their own school of law and their own creed.",
      points: [
        {
          title: "Origins and the Kharijite question",
          detail:
            "The Ibadiyyah trace their name to Abdullah ibn Ibad al-Tamimi (2nd century AH) and their scholarly heritage to Jabir ibn Zayd, a student of Ibn Abbas. Classical Sunni heresiographies count them among the more moderate offshoots of the Khawarij who broke with the violent factions — declining to declare mainstream Muslims disbelievers or to sanction killing them. Contemporary Ibadis, however, reject any Kharijite descent and present themselves simply as a distinct madhhab.",
          note: "Al-Milal wan-Nihal, ash-Shahrastani; modern Ibadi scholarship disputes the classical genealogy",
        },
        {
          title: "Distinct creed points",
          detail:
            "Ibadi theology overlaps with the Mu'tazilah on several points that Ahl al-Sunnah differ with: they hold that the Quran is created rather than the uncreated speech of Allah, and they deny that the believers will see Allah with their eyes in the Hereafter. They also, like the early Khawarij, take a severe view of the Muslim who dies unrepentant from a major sin — though far more moderately expressed than the extremist factions.",
          note: "Contrast Ahl al-Sunnah on the beatific vision: Quran 75:22-23; Bukhari 10:201",
        },
        {
          title: "Their own hadith corpus",
          detail:
            "The Ibadiyyah do not rely on the six Sunni collections as their primary references. Their best-known compilation is the Musnad al-Rabi' ibn Habib, which they hold in high esteem. As with any tradition, Ahl al-Sunnah weigh such narrations against the established, rigorously authenticated Sunnah preserved through the science of isnad.",
          note: "Musnad al-Rabi' ibn Habib is the principal Ibadi hadith reference",
        },
        {
          title: "How they differ from the extremist Khawarij",
          detail:
            "It would be unjust to equate today's Ibadis with the arrow-through-the-game Khawarij of the hadith. Ibadi communities have historically been peaceable, do not practise takfir of the broader Ummah, and coexist within the wider Muslim world. Their differences with Ahl al-Sunnah are real and creedal, but they are engaged as a distinct school — not as the violent sect the Prophet ﷺ warned against.",
          note: "Fairness ('adl) requires distinguishing the moderate living community from the historical extremists",
        },
      ],
      source: "Al-Milal wan-Nihal, ash-Shahrastani; Al-Farq bayn al-Firaq, al-Baghdadi; Quran 75:22-23; Bukhari 10:201",
    },
  },
  {
    id: "qadariyyah-murjiah",
    name: "Qadariyyah & Murji'ah",
    content: {
      intro:
        "After the Khawarij, the next great fitna of creed concerned two opposite errors about faith and destiny: the Qadariyyah, who denied Allah's decree (qadar), and the Murji'ah, who emptied faith of actions. Ahl al-Sunnah define themselves against both by name — so it helps to know who they actually were.",
      verse: {
        arabic: "صِنْفَانِ مِنْ أُمَّتِي لَيْسَ لَهُمَا فِي الإِسْلاَمِ نَصِيبٌ الْمُرْجِئَةُ وَالْقَدَرِيَّةُ",
        text: "There are two groups in my Ummah for whom there is no share in Islam: The Murji'ah and the Qadariyyah.",
        ref: "Tirmidhi 32:17",
      },
      points: [
        {
          title: "The Qadariyyah — deniers of divine decree",
          detail:
            "The Qadariyyah claimed that man's actions are entirely his own and 'there is no such thing as Divine Decree.' The very first hadith of Sahih Muslim records that the first to speak this doctrine in Basra was Ma'bad al-Juhani. When it was reported to Abdullah ibn Umar, he disowned them completely: '…tell them that I have nothing to do with them and they have nothing to do with me,' swearing that Allah would not accept the charity of one who does not believe in the decree. That same chain then relates the famous hadith of Jibril, in which belief 'in the Divine Decree about good and evil' is named a pillar of faith.",
          note: "Muslim 1:1; Abu Dawud 42:100",
        },
        {
          title: "'The Magians of this community'",
          detail:
            "By making man an independent creator of his own acts alongside Allah, the Qadariyyah echoed the dualism of the Magians (who posited two creators, of good and of evil). The Prophet ﷺ said: 'The Qadariyyah are the Magians of this community.' Ahl al-Sunnah affirm both that Allah decrees all things and that man has real, accountable choice — holding the two truths together without denying either.",
          note: "Abu Dawud 42:96",
        },
        {
          title: "The Murji'ah — faith without actions",
          detail:
            "At the opposite extreme, the Murji'ah 'postponed' (irja') actions out of the definition of faith, holding that iman is mere belief in the heart which neither increases nor decreases, so that sin does no harm to one's faith. Ahl al-Sunnah reject this: iman is belief, speech, and action together, rising with obedience and falling with sin — the balanced position between the Murji'ah and the Khawarij (who made major sin outright disbelief).",
          note: "See the Core Creed topic — 'Faith is belief, speech, and action' (Bukhari 2:2)",
        },
        {
          title: "Two errors, one prophetic warning",
          detail:
            "The Prophet ﷺ named both together: 'There are two groups in my Ummah for whom there is no share in Islam: The Murji'ah and the Qadariyyah.' They err in opposite directions — one denies the decree, the other empties faith of works — and Ahl al-Sunnah steer the middle course between them, as they do between all extremes.",
          note: "Tirmidhi 32:17",
        },
      ],
      source: "Muslim 1:1; Abu Dawud 42:96; Abu Dawud 42:100; Tirmidhi 32:17; Maqalat al-Islamiyyin, al-Ash'ari",
    },
  },
  {
    id: "mutazilah",
    name: "Mu'tazilah",
    content: {
      intro:
        "The Mu'tazilah (المعتزلة, 'those who withdrew') emerged in the 2nd century AH in Basra. Their founder, Wasil ibn Ata, 'withdrew' from the circle of Hasan al-Basri over the question of the status of a Muslim who commits a major sin. They became known for prioritizing rational philosophy over revealed texts.",
      points: [
        {
          title: "The five principles of the Mu'tazilah",
          detail:
            "They are known for five core positions: (1) Tawhid — which they used to deny Allah's attributes, saying that affirming them leads to multiple 'eternal' entities. (2) 'Adl (Justice) — which they used to deny divine decree (qadr). (3) The promise and threat — meaning Allah is obligated to reward the obedient and punish the disobedient. (4) The intermediate position — a major sinner is neither a believer nor a disbeliever. (5) Commanding good and forbidding evil — which they used to justify armed revolt.",
          note: "Al-Milal wan-Nihal, ash-Shahrastani; Maqalat al-Islamiyyin, al-Ash'ari",
        },
        {
          title: "Denial of Allah's attributes",
          detail:
            "The Mu'tazilah denied the attributes of Allah — His hearing, sight, hand, face, etc. — claiming that affirming them would amount to anthropomorphism (tashbih). In doing so, they stripped the texts of their meanings (ta'til). Ahl al-Sunnah affirm the attributes as described, without likening Allah to His creation.",
          note: "Quran 42:11 — 'There is nothing like unto Him, and He is the All-Hearing, the All-Seeing'",
        },
        {
          title: "They said the Quran was created",
          detail:
            "Their most infamous position was that the Quran is created, not the eternal speech of Allah. The Abbasid Caliph al-Ma'mun adopted this view and launched the Mihnah (inquisition) in 218 AH, imprisoning scholars who refused to accept it. Imam Ahmad ibn Hanbal famously withstood torture rather than submit, and this fitnah eventually ended.",
          note: "Al-Bidayah wan-Nihayah, Ibn Kathir — Events of 218 AH",
        },
        {
          title: "They denied that Allah will be seen in the Hereafter",
          detail:
            "Despite authentic hadith and Quranic verses affirming that the believers will see Allah on the Day of Judgement, the Mu'tazilah denied this. The Quran says: 'Faces that Day will be radiant, looking at their Lord' (Quran 75:22-23). The Prophet ﷺ said: 'You will see your Lord as you see the moon on a clear night.'",
          note: "Quran 75:22-23; Bukhari 10:201; Muslim 1:356",
        },
      ],
      source: "Al-Milal wan-Nihal, ash-Shahrastani; Maqalat al-Islamiyyin, al-Ash'ari; Dar' Ta'arud al-Aql wan-Naql, Ibn Taymiyyah",
    },
  },
  {
    id: "sufism",
    name: "Sufism (Tasawwuf)",
    content: {
      intro:
        "Sufism is a complex phenomenon within Islamic history. Early Sufism (zuhd) referred to legitimate asceticism and spiritual purification rooted in the Quran and Sunnah. Over time, however, many Sufi orders incorporated practices, beliefs, and philosophies that deviate significantly from orthodox Islam.",
      points: [
        {
          title: "Early asceticism was praiseworthy",
          detail:
            "Early figures associated with zuhd (asceticism) — like Hasan al-Basri (d. 110 AH), Ibrahim ibn Adham (d. ~161 AH), and al-Fudayl ibn 'Iyad (d. 187 AH) — practiced detachment from worldly pleasures and focused on inner purification within the boundaries of the Shariah. This was not a separate 'sect' but an emphasis on the spiritual dimension of Islam.",
          note: "Siyar A'lam an-Nubala, adh-Dhahabi",
        },
        {
          title: "Problematic later developments",
          detail:
            "Over centuries, many Sufi orders introduced practices with no basis in Islam: dancing and whirling as worship, music sessions (sama') as spiritual practice, seeking intercession from dead saints, claiming divine union (hulul/ittihad), belief in wahdat al-wujud (unity of existence), and saint veneration at shrines that resembles idol worship.",
          note: "Majmu' al-Fatawa, Ibn Taymiyyah; Ighathah al-Lahfan, Ibn al-Qayyim",
        },
        {
          title: "Extreme Sufi claims",
          detail:
            "Some Sufi figures made statements that clearly contradict Islam: al-Hallaj said 'Ana al-Haqq' (I am the Truth — i.e., I am God), Ibn Arabi promoted wahdat al-wujud (that all existence is God), and many claimed to receive direct divine revelation bypassing the Prophet ﷺ. These claims were rejected and refuted by the scholars of Ahl al-Sunnah.",
          note: "Talbis Iblis, Ibn al-Jawzi; Majmu' al-Fatawa, Ibn Taymiyyah",
        },
        {
          title: "The Sunni position on spiritual purification",
          detail:
            "Ahl al-Sunnah affirm that purifying the soul (tazkiyah) is an obligation, but it must be done through the means taught by the Prophet ﷺ: dhikr, du'a, night prayer, fasting, recitation of the Quran, and repentance. There is no need for a separate 'Sufi path' — the Shariah itself is the complete spiritual program.",
          note: "Quran 91:9-10; Madarij as-Salikin, Ibn al-Qayyim",
        },
      ],
      source: "Majmu' al-Fatawa, Ibn Taymiyyah; Ighathah al-Lahfan, Ibn al-Qayyim; Talbis Iblis, Ibn al-Jawzi; Madarij as-Salikin, Ibn al-Qayyim",
    },
  },
  {
    id: "asharis-maturidis",
    name: "Ash'aris & Maturidis",
    content: {
      intro:
        "The Ash'ari and Maturidi schools of theology emerged in the 3rd-4th centuries AH as a response to the Mu'tazilah. While they defended Islam against rationalist excesses, scholars within Ahl al-Sunnah have noted areas where they diverged from the methodology of the Salaf (early generations).",
      points: [
        {
          title: "Abu al-Hasan al-Ash'ari (d. 324 AH)",
          detail:
            "Al-Ash'ari was initially a Mu'tazili who recanted and returned to the Sunnah. He wrote 'Al-Ibanah 'an Usul ad-Diyanah' in which he affirmed the creed of Imam Ahmad and the early scholars. However, later Ash'ari scholars developed a methodology that used philosophical arguments (kalam) to interpret some of Allah's attributes metaphorically (ta'wil).",
          note: "Al-Ibanah, al-Ash'ari; Maqalat al-Islamiyyin, al-Ash'ari",
        },
        {
          title: "Abu Mansur al-Maturidi (d. 333 AH)",
          detail:
            "Al-Maturidi developed a theology similar to the Ash'aris in Central Asia. The Maturidi school is closely associated with the Hanafi school of fiqh. They share most positions with the Ash'aris, with some minor differences (e.g., on the relationship between reason and revelation).",
          note: "Kitab at-Tawhid, al-Maturidi",
        },
        {
          title: "Areas of agreement with Ahl al-Sunnah",
          detail:
            "Ash'aris and Maturidis agree with Ahl al-Sunnah wal-Jama'ah on many fundamentals: the Quran is from Allah, the Companions are honored, the six articles of faith, and the five pillars. They oppose the Mu'tazilah and the Shia on key issues. Many great scholars of hadith, fiqh, and tafsir were Ash'ari in theology.",
        },
        {
          title: "Areas of divergence",
          detail:
            "Key areas where some Ash'ari/Maturidi positions differ from the methodology of the Salaf include: using ta'wil (metaphorical interpretation) for some of Allah's attributes (e.g., interpreting 'Hand' as 'Power'), saying that faith does not increase or decrease, defining Iman as only belief and statement (without actions), and prioritizing kalam (speculative theology) over textual evidence in certain creedal matters.",
          note: "Dar' Ta'arud al-Aql wan-Naql, Ibn Taymiyyah; Sharh al-Aqidah at-Tahawiyyah, Ibn Abi al-'Izz",
        },
      ],
      source: "Al-Ibanah, al-Ash'ari; Dar' Ta'arud al-Aql wan-Naql, Ibn Taymiyyah; Sharh al-Aqidah at-Tahawiyyah, Ibn Abi al-'Izz",
    },
  },
  {
    id: "quranists",
    name: "Quranists (Hadith Rejection)",
    content: {
      intro:
        "'Quranists' or 'Quran-only' groups claim to follow the Quran while rejecting the Sunnah and the hadith entirely. It is one of the most common deviations an English-speaking Muslim meets online today — and, remarkably, the Prophet ﷺ described it almost word for word. This topic is the mirror image of the Hadith Sciences tab: it shows why the Sunnah is indispensable.",
      verse: {
        arabic: "وَمَآ ءَاتَىٰكُمُ ٱلرَّسُولُ فَخُذُوهُ وَمَا نَهَىٰكُمْ عَنْهُ فَٱنتَهُوا۟",
        text: "Whatever the Messenger gives you, accept it, and whatever he forbids you, refrain from it…",
        ref: "Quran 59:7",
      },
      points: [
        {
          title: "The Prophet ﷺ foretold this exact claim",
          detail:
            "He ﷺ said: 'Let me not find one of you reclining on his couch when he hears something regarding me which I have commanded or forbidden and saying: We do not know. What we found in Allah's Book we have followed.' The 'man on his couch' who accepts only what is in the Book and waves away the Prophet's own commands is described fourteen centuries before the modern movement appeared.",
          note: "Abu Dawud 42:10; Tirmidhi 41:19",
        },
        {
          title: "The Prophet's word carries the weight of revelation",
          detail:
            "In al-Miqdam's narration the Prophet ﷺ warned of the man who says, 'Between us and you is Allah's Book. So whatever we find in it that is lawful, we consider lawful, and whatever we find in it that is unlawful, we consider it unlawful,' and then declared: 'whatever the Messenger of Allah made unlawful, it is the same as what Allah made unlawful.' The Quran itself commands obedience to what the Messenger gives and forbids (Quran 59:7).",
          note: "Tirmidhi 41:20; Quran 59:7",
        },
        {
          title: "The Quran cannot be practised without the Sunnah",
          detail:
            "The Quran commands the prayer but never states its units or times; it commands zakat without fixing its rates; it commands Hajj without detailing its rites. The Prophet ﷺ said, 'Pray as you have seen me praying.' Rejecting the Sunnah does not leave 'pure Quran' — it leaves a religion that cannot actually be performed, which is why the science of hadith exists in the first place.",
          note: "Bukhari 10:28 — 'Pray as you have seen me praying' (cross-reference the Hadith Sciences topic)",
        },
        {
          title: "Not the same as critical scholarship",
          detail:
            "Rejecting authentic hadith wholesale is very different from the rigorous science of narrator criticism (see Hadith Sciences), which itself sifts weak and fabricated reports from sound ones. Ahl al-Sunnah do not accept every narration uncritically — they accept what is authenticated and act on it. The Quranist error is not scepticism about a weak chain; it is the rejection of the Prophet's authority as a source of the religion.",
          note: "The remedy is the isnad system, not the discarding of the Sunnah",
        },
      ],
      source: "Abu Dawud 42:10; Tirmidhi 41:19; Tirmidhi 41:20; Quran 59:7; Bukhari 10:28",
    },
  },
  {
    id: "ahmadiyyah",
    name: "Ahmadiyyah",
    content: {
      intro:
        "The Ahmadiyyah movement was founded by Mirza Ghulam Ahmad (1835–1908) in Qadian, British India. He claimed to be the promised Messiah, the Mahdi, and a prophet — directly contradicting the Islamic belief that Muhammad ﷺ is the final prophet. Muslim scholars unanimously consider this group outside the fold of Islam.",
      verse: {
        arabic: "مَّا كَانَ مُحَمَّدٌ أَبَآ أَحَدٍۢ مِّن رِّجَالِكُمْ وَلَـٰكِن رَّسُولَ ٱللَّهِ وَخَاتَمَ ٱلنَّبِيِّـۧنَ",
        text: "Muhammad is not the father of any of your men, but he is the Messenger of Allah and the seal of the prophets.",
        ref: "Quran 33:40",
      },
      points: [
        {
          title: "Claim to prophethood",
          detail:
            "Mirza Ghulam Ahmad claimed to receive divine revelation and be a prophet, directly violating the Quranic verse that Muhammad ﷺ is the seal of the prophets (khatam an-nabiyyin). The Prophet ﷺ said: 'There is no prophet after me.' The Muslim Ummah has reached unanimous consensus (ijma') that anyone claiming prophethood after Muhammad ﷺ is a liar.",
          note: "Quran 33:40; Bukhari 60:122; Muslim 33:71",
        },
        {
          title: "Reinterpretation of 'Seal of the Prophets'",
          detail:
            "Ahmadis argue that 'khatam an-nabiyyin' means 'best of the prophets' rather than 'last.' This interpretation contradicts the Arabic language, the understanding of the Companions, the consensus of scholars for 1400 years, and the explicit hadith: 'The chain of messengers and prophets has come to an end. There shall be no messenger or prophet after me.'",
          note: "Tirmidhi 34:3",
        },
        {
          title: "The Prophet ﷺ foretold false claimants",
          detail:
            "Far from catching Muslims off guard, movements built on a post-Muhammadan prophet were prophesied. The Prophet ﷺ said: 'The Last Hour will not come before there come forth thirty Dajjals (fraudulents), everyone presuming himself that he is an apostle of Allah,' and elsewhere: '…the Hour will not be established till there appear about thirty liars, all of whom will be claiming to be the messengers of Allah.' A claim to prophethood is thus a foretold sign of falsehood, not evidence of truth — a frame that applies to every false-prophet movement, not one group alone.",
          note: "Abu Dawud 39:43; Bukhari 61:116",
        },
        {
          title: "Collaboration with colonial powers",
          detail:
            "Mirza Ghulam Ahmad publicly declared loyalty to the British Empire and prohibited jihad, at a time when the British were colonizing Muslim lands. He wrote that he had been 'raised to support the British government.' This context is relevant to understanding the movement's origins.",
          note: "Kitab al-Bariyyah, Mirza Ghulam Ahmad; Tabligh-e-Risalat",
        },
        {
          title: "Scholarly consensus",
          detail:
            "Every major Muslim scholarly body worldwide — the Muslim World League, Organisation of Islamic Cooperation, Al-Azhar, and numerous national fatwa councils — has declared Ahmadiyyah outside the fold of Islam. Pakistan's constitution defines them as non-Muslims. This consensus is based on their denial of the finality of prophethood.",
          note: "Resolution of Muslim World League, 1974; Constitution of Pakistan, Second Amendment",
        },
      ],
      source: "Quran 33:40; Bukhari 60:122; Tirmidhi 34:3; Abu Dawud 39:43; Bukhari 61:116; Resolution of Muslim World League, 1974",
    },
  },
  {
    id: "nation-of-islam",
    name: "Nation of Islam",
    content: {
      intro:
        "The Nation of Islam (NOI) was founded by Wallace Fard Muhammad in 1930s America and expanded under Elijah Muhammad. Despite using Islamic terminology, its core beliefs fundamentally contradict Islam. It should not be confused with orthodox Islam practiced by millions of African American Muslims.",
      points: [
        {
          title: "Racial theology contradicts Tawhid",
          detail:
            "The NOI taught that Black people are divine, that Fard Muhammad was 'God in person,' and that white people were 'devils' created by an evil scientist named Yakub. Islam categorically rejects all forms of racism and teaches that no human being is divine. The Prophet ﷺ said: 'No Arab has superiority over a non-Arab, nor does a non-Arab have superiority over an Arab — except by piety.'",
          note: "Quran 49:13; Ahmad 23489 (Farewell Sermon)",
        },
        {
          title: "Denial of the Hereafter as taught in Islam",
          detail:
            "Elijah Muhammad taught that the resurrection is not physical but refers to the mental 'resurrection' of Black people. Islam teaches a literal, physical resurrection and judgement, which is one of the six articles of faith.",
          note: "Quran 75:3-4; Quran 99:1-8",
        },
        {
          title: "Elijah Muhammad claimed prophethood",
          detail:
            "Elijah Muhammad was given the title 'Messenger of Allah,' directly contradicting the finality of prophethood. His son, Warith Deen Mohammed, later dismantled the NOI's heterodox teachings and led most of its members to orthodox Sunni Islam — one of the largest mass conversions in American history.",
          note: "Quran 33:40",
        },
        {
          title: "Distinguished from orthodox African American Islam",
          detail:
            "Millions of African American Muslims follow orthodox Sunni Islam and have made tremendous contributions to the Muslim community. Figures like Malcolm X (after his Hajj), Warith Deen Mohammed, and Imam Siraj Wahhaj represent this authentic tradition. Malcolm X's letter from Makkah, where he witnessed Muslims of all races praying together, powerfully illustrates Islam's rejection of racism.",
          note: "The Autobiography of Malcolm X, Chapter 18 — El-Hajj Malik El-Shabazz",
        },
      ],
      source: "Quran 33:40; Quran 49:13; Ahmad 23489; The Autobiography of Malcolm X",
    },
  },
];

const modernTopics: SectTopic[] = [
  {
    id: "warning-signs",
    name: "Reading the Landscape (& Warning Signs)",
    content: {
      intro:
        "Walk into real mosques and you will hear labels immediately — Salafi, Deobandi, Barelwi, Tablighi, Ikhwani, Sufi. Most of these are not sects; they are orientations, movements, or trends within Ahl al-Sunnah that emphasise different things while sharing the same creed, the same five pillars, and the same qiblah. This tab describes them calmly. It opens with a protective checklist, because new Muslims are the prime recruiting target of the small number of genuinely deviant or cult-like fringe groups.",
      points: [
        {
          title: "Movements are not sects",
          detail:
            "A sect departs from the creed of Ahl al-Sunnah; a movement is a way of prioritising within it — one stresses creed and evidence, another spiritual reform, another grassroots preaching, another political activism. Muslims across these currents pray together, marry one another, and make Hajj side by side. Treat the labels as descriptions of emphasis, not as walls, and never let a label become a reason to break from the wider body of Muslims.",
          note: "Cross-reference the Ahl al-Sunnah tab — Holding to the Jama'ah",
        },
        {
          title: "Warning sign: claims of special revelation or infallibility",
          detail:
            "A leader who claims private revelation, prophethood, or that he cannot err is the clearest danger sign. The Prophet ﷺ foretold 'thirty Dajjals (fraudulents), everyone presuming himself that he is an apostle of Allah.' No one after the Prophet ﷺ receives revelation or is infallible; a group built around such a claim has already left the path.",
          note: "Abu Dawud 39:43",
        },
        {
          title: "Warning sign: isolation and blanket takfir",
          detail:
            "Fringe groups cut recruits off from mainstream mosques, scholars, and even family, and declare everyone outside the group to be disbelievers. This is the Kharijite instinct the Prophet ﷺ condemned: 'If a man says to his brother, O Kafir (disbeliever)!' Then surely one of them is such (i.e., a Kafir).' Hudhayfah was told that in times of confusion the safe course is to 'stick to the main body of the Muslims and their leader' — the opposite of retreating into a closed faction.",
          note: "Bukhari 78:130; Muslim 33:81",
        },
        {
          title: "Warning sign: secrecy, control, and exploitation",
          detail:
            "Be wary of secret teachings revealed only to insiders, unquestioning obedience demanded to a leader, pressure to hand over money, and control over marriage or movement. The religion of the Prophet ﷺ was public and its knowledge open. Hudhayfah described the misguided callers as 'a people having the same complexion as ours and speaking our language' — they look and sound like ordinary Muslims, so the test is their teaching and conduct, not their appearance.",
          note: "Muslim 33:81 — measure any group against open, scholar-anchored, mainstream Islam",
        },
      ],
      source: "Muslim 33:81; Bukhari 78:130; Abu Dawud 39:43",
    },
  },
  {
    id: "salafiyyah",
    name: "Salafiyyah & the 'Wahhabi' Label",
    content: {
      intro:
        "'Salafiyyah' refers to a call to return to the understanding of the Salaf — the first three generations praised by the Prophet ﷺ — in creed and worship, giving primacy to the Quran and authentic Sunnah over later theological or juristic accretions. It is best understood as an orientation within Ahl al-Sunnah, not a separate sect.",
      points: [
        {
          title: "Origin and emphasis",
          detail:
            "As a self-conscious modern movement it is associated with the 18th-century revivalist Muhammad ibn Abd al-Wahhab in Arabia and, more broadly, with reform currents that sought to strip away practices they viewed as innovations — especially at graves and shrines — and to reconnect worship directly to textual evidence. Its emphasis is on Tawhid, adherence to authentic hadith, and following the Salaf's creed.",
          note: "The name derives from al-Salaf al-Salih, the righteous early generations (Bukhari 52:16)",
        },
        {
          title: "The 'Wahhabi' label",
          detail:
            "'Wahhabi' is a label applied by others — often polemically — to those influenced by Ibn Abd al-Wahhab's call; adherents themselves generally reject it, since they claim to follow no man but the Salaf. As with any broad label, it lumps together a wide spectrum, from mainstream scholars to a fringe that drifts toward the harshness and takfir of the Khawarij. Judging individuals by a label rather than their actual beliefs is exactly what this page cautions against.",
          note: "A label is not a verdict — weigh people by their stated creed and conduct",
        },
        {
          title: "Where it sits relative to Ahl al-Sunnah",
          detail:
            "In creed, the Salafi call is squarely within Ahl al-Sunnah and overlaps heavily with the Hanbali tradition and the school of Ibn Taymiyyah. Points of tension with other Sunnis are usually about method — the role of the four madhhabs, attitudes to Sufism and to Ash'ari theology, and tone toward differing Muslims — rather than the fundamentals of the faith.",
          note: "Differences here are largely of manhaj (method) within Sunni Islam, not of core creed",
        },
      ],
      source: "Scholarly summary; see Al-Aqidah al-Wasitiyyah, Ibn Taymiyyah for the underlying creed",
    },
  },
  {
    id: "deobandi-barelwi",
    name: "Deobandi & Barelwi",
    content: {
      intro:
        "Two of the largest movements in the South Asian Muslim world (and its global diaspora) emerged from 19th-century British India. Both are Sunni and Hanafi in fiqh and Maturidi in creed; their long-running rivalry is about spirituality, saint-veneration, and attitudes to certain practices — not about the pillars of Islam.",
      points: [
        {
          title: "The Deobandi movement",
          detail:
            "Named after the seminary founded at Deoband in 1866, the Deobandi movement arose to preserve Islamic scholarship under colonial rule through a network of madrasas. It is Hanafi in fiqh, respects tasawwuf (Sufism) within the bounds of the Shariah, and tends toward caution against practices it views as innovations around graves and celebrations. It has produced vast scholarly output and many of the world's traditional seminaries follow its curriculum.",
          note: "Hanafi-Maturidi, seminary-based, reformist toward popular practices",
        },
        {
          title: "The Barelwi movement",
          detail:
            "Named after Ahmad Raza Khan of Bareilly (d. 1921), the Barelwi movement centres devotion to the Prophet ﷺ, celebration of the Mawlid, and a warm embrace of Sufi orders, saints, and their shrines. It too is Hanafi in fiqh and Maturidi in creed. Its differences with the Deobandis turn on the permissibility and framing of these devotional practices.",
          note: "Hanafi-Maturidi, Sufi-devotional, Prophet-centred piety",
        },
        {
          title: "Where they sit relative to Ahl al-Sunnah",
          detail:
            "Both are within Sunni Islam and share creed and worship at the fundamental level. Their disputes — over Mawlid, seeking blessings at shrines, and how far to venerate the righteous dead — echo the wider Sunni conversation about the boundary between honouring the pious and innovation. They are two orientations of the same Ummah, not two religions, and treating either community with contempt is contrary to the fairness this page calls for.",
          note: "Intra-Sunni difference over devotional practice, not a break in creed",
        },
      ],
      source: "Scholarly summary of modern South Asian Islamic movements",
    },
  },
  {
    id: "tablighi",
    name: "Tablighi Jama'at",
    content: {
      intro:
        "The Tablighi Jama'at is a grassroots revivalist and missionary movement — one of the largest voluntary religious movements in the world — focused on calling Muslims back to practising their faith through peer-to-peer preaching. It is a method of activism within Sunni Islam, not a sect with its own creed.",
      points: [
        {
          title: "Origin and emphasis",
          detail:
            "Founded by Muhammad Ilyas al-Kandhlawi in India in 1926, and rooted in the Deobandi tradition, its method centres on small groups of ordinary Muslims who volunteer time to travel, stay in mosques, and gently encourage fellow Muslims toward prayer and good character. Its emphasis is deliberately non-political and non-controversial: personal reform, worship, and manners rather than doctrine or debate.",
          note: "Grassroots self-reform and da'wah, Deobandi-linked, deliberately apolitical",
        },
        {
          title: "Common critiques",
          detail:
            "Scholars who value the movement's sincerity have still raised concerns: a reliance on some weak narrations in popular texts used for motivation, over-emphasis on travelling for da'wah at the expense of seeking grounded knowledge, and men spending long periods away from families. These are critiques of method and balance offered from within Sunni Islam, not a charge of deviation in creed.",
          note: "Critiques concern method and sourcing, not the fundamentals of the faith",
        },
        {
          title: "Where it sits relative to Ahl al-Sunnah",
          detail:
            "The Tablighi Jama'at is squarely Sunni; its participants pray in ordinary mosques and hold mainstream beliefs. It is best seen as a channel for encouraging practice, most beneficial when paired with sound knowledge from qualified scholars.",
          note: "A da'wah movement within Ahl al-Sunnah, not a distinct sect",
        },
      ],
      source: "Scholarly summary of modern da'wah movements",
    },
  },
  {
    id: "political-movements",
    name: "Islamic Political Movements",
    content: {
      intro:
        "Some modern movements are defined less by a distinct creed than by a political project — the revival of Islamic governance and society. The Muslim Brotherhood and Hizb ut-Tahrir are the best known. Their members are generally Sunni; what distinguishes them is a programme and strategy, and they are engaged here descriptively.",
      points: [
        {
          title: "The Muslim Brotherhood (al-Ikhwan al-Muslimun)",
          detail:
            "Founded by Hasan al-Banna in Egypt in 1928, the Brotherhood began as a movement of religious revival, education, and social welfare that grew into a major political and civic force across the Arab world. It is broadly Sunni and typically accommodates a range of theological and juristic backgrounds under a shared emphasis on gradual reform, activism, and organisation. Assessments of it vary widely across the Muslim world and are often bound up with local politics.",
          note: "A revivalist-political movement spanning diverse Sunni backgrounds",
        },
        {
          title: "Hizb ut-Tahrir",
          detail:
            "Founded by Taqi al-Din al-Nabhani in Jerusalem in 1953, Hizb ut-Tahrir is a political party whose single defining goal is the re-establishment of a global caliphate. It is known for intellectual and organisational activism and for rejecting participation in existing political systems. Some of its theological positions (for instance on certain questions of creed and the acceptance of khabar al-ahad in belief) have drawn criticism from mainstream Sunni scholars.",
          note: "A caliphate-focused political party; some creedal positions are contested by mainstream scholars",
        },
        {
          title: "Where they sit relative to Ahl al-Sunnah",
          detail:
            "These are principally political orientations rather than new sects; their followers are overwhelmingly Sunni Muslims. Sincere Muslims differ over their methods, priorities, and specific rulings, and this page takes no political side. The consistent Sunni counsel is to anchor any activism in sound knowledge and the unity of the Ummah, and to avoid the slide into declaring other Muslims disbelievers over political disagreement.",
          note: "Political method, not a separate creed — keep disagreement from becoming takfir (Bukhari 78:130)",
        },
      ],
      source: "Scholarly summary of modern Islamic political movements",
    },
  },
  {
    id: "sufi-orders",
    name: "Contemporary Sufi Orders",
    content: {
      intro:
        "Beyond the historical account of Sufism in the Other Groups tab, organised Sufi orders (turuq, singular tariqah) remain a living part of the Muslim landscape a newcomer will encounter — the Naqshbandi, Qadiri, Shadhili, Tijani, Chishti and others. They range from orders firmly within the Sunnah to some whose practices scholars critique.",
      points: [
        {
          title: "What a tariqah is",
          detail:
            "A tariqah is a spiritual order organised around a chain of teachers (silsilah) and a set of litanies (awrad) and gatherings for remembrance (dhikr). Many observant Sunni Muslims belong to one while holding entirely mainstream creed and fiqh, using it as a structured framework for worship, discipline, and character.",
          note: "An organised path of spiritual training within, ideally, the bounds of the Shariah",
        },
        {
          title: "The spectrum of practice",
          detail:
            "Ahl al-Sunnah affirm the goal of purifying the soul (tazkiyah) but measure the means against the Sunnah. Orders whose gatherings stay within authentic dhikr and worship are unobjectionable; concerns arise where practices seen earlier appear — treating a shaykh as infallible, extreme claims, or seeking from the dead what may only be sought from Allah. The judgement is practice-by-practice, order-by-order, not a blanket verdict.",
          note: "See the Sufism (Tasawwuf) topic in the Other Groups tab for the fuller treatment",
        },
        {
          title: "Where they sit relative to Ahl al-Sunnah",
          detail:
            "Contemporary Sufi orders are, in the main, a devotional current within Sunni Islam rather than a sect apart. The balanced approach is neither to romanticise every practice nor to condemn tasawwuf wholesale, but to keep spiritual striving tethered to the Quran and the authentic Sunnah — the complete spiritual programme the Prophet ﷺ left behind.",
          note: "Cross-reference Other Groups — Sufism (Tasawwuf)",
        },
      ],
      source: "Scholarly summary; see Madarij as-Salikin, Ibn al-Qayyim on disciplined tazkiyah",
    },
  },
];

const sections = [
  { key: "intro", label: "Overview" },
  { key: "importance", label: "Why It Matters" },
  { key: "sunni", label: "Ahl al-Sunnah" },
  { key: "shia", label: "Shia Islam" },
  { key: "other", label: "Other Groups" },
  { key: "modern", label: "Modern Movements" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── sub-components ───────────────────────── */

function TopicInfoCard({ topic }: { topic: SectTopic }) {
  const hasVerse = "verse" in topic.content && topic.content.verse;
  return (
    <ContentCard>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-themed">{topic.name}</h2>
      </div>

      <p className="text-themed-muted text-sm leading-relaxed mb-5">
        {topic.content.intro}
      </p>

      {hasVerse && (
        <div
          className="rounded-lg p-4 mb-5"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
            {topic.content.verse!.arabic}
          </p>
          <p className="text-themed text-sm italic">
            &ldquo;{topic.content.verse!.text}&rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-2">
            <HadithRefText text={topic.content.verse!.ref} />
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

      {/* Aggregated source footer suppressed — the point cards above carry
          their own refs, and the rail ends with a SourcesCard scoped to the
          active topic. */}
    </ContentCard>
  );
}

/* "Sources & References" rows for the ACTIVE topic only — house rule: the
   card below a rail lists just the current selection's sources (its curated
   source line), never an aggregate of the whole tab. Point notes are not used
   here because some are commentary (e.g. madhhab share estimates), not refs. */
const topicSourceRows = (topic?: SectTopic) =>
  topic?.content.source ? [{ ref: topic.content.source, desc: topic.name }] : [];

/* ───────────────────────── page ───────────────────────── */

function SectsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useScrollToSection();
  const [activeSection, setActiveSection] = useState<SectionKey>(
    (searchParams.get("tab") as SectionKey) || "intro"
  );
  // Deep-link support: ?sub=<topic id> (old ?section= accepted as a mount-time alias)
  const subParam = searchParams.get("sub") ?? searchParams.get("section");
  const [activeSunni, setActiveSunni] = useState(
    subParam && sunniTopics.some((t) => t.id === subParam) ? subParam : "aqeedah"
  );
  const [activeShia, setActiveShia] = useState(
    subParam && shiaTopics.some((t) => t.id === subParam) ? subParam : "origins"
  );
  const [activeOther, setActiveOther] = useState(
    subParam && otherSects.some((t) => t.id === subParam) ? subParam : "khawarij"
  );
  const [activeModern, setActiveModern] = useState(
    subParam && modernTopics.some((t) => t.id === subParam) ? subParam : "warning-signs"
  );
  const [search, setSearch] = useState("");

  // Keep ?tab= / ?sub= in sync so the current view is shareable
  const syncUrl = (tab: SectionKey, sub?: string) => {
    router.replace(sub ? `${pathname}?tab=${tab}&sub=${sub}` : `${pathname}?tab=${tab}`, { scroll: false });
  };

  // Jump to a tab (and, where relevant, select a rail topic) — used by the
  // Overview timeline so each era links to the section that covers it.
  const goTo = (tab: SectionKey, sub?: string) => {
    setSearch("");
    setActiveSection(tab);
    if (sub) {
      if (tab === "sunni") setActiveSunni(sub);
      else if (tab === "shia") setActiveShia(sub);
      else if (tab === "other") setActiveOther(sub);
      else if (tab === "modern") setActiveModern(sub);
    }
    syncUrl(tab, sub);
  };

  const topicMatches = (t: SectTopic) => {
    if (!search || search.length < 2) return true;
    return textMatch(
      search,
      t.name,
      t.content.intro,
      t.content.source,
      t.content.verse?.text,
      ...t.content.points.map((p) => p.title),
      ...t.content.points.map((p) => p.detail)
    );
  };

  const mattersMatches = (item: { point: string; detail: string; reference: string }) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, item.point, item.detail, item.reference);
  };

  const filteredSunni = useMemo(() => sunniTopics.filter(topicMatches), [search]);
  const filteredShia = useMemo(() => shiaTopics.filter(topicMatches), [search]);
  const filteredOther = useMemo(() => otherSects.filter(topicMatches), [search]);
  const filteredModern = useMemo(() => modernTopics.filter(topicMatches), [search]);
  const filteredMatters = useMemo(() => whyItMatters.filter(mattersMatches), [search]);

  // Auto-select first visible topic when active is filtered out
  useEffect(() => {
    if (filteredSunni.length > 0 && !filteredSunni.find((t) => t.id === activeSunni))
      setActiveSunni(filteredSunni[0].id);
    if (filteredShia.length > 0 && !filteredShia.find((t) => t.id === activeShia))
      setActiveShia(filteredShia[0].id);
    if (filteredOther.length > 0 && !filteredOther.find((t) => t.id === activeOther))
      setActiveOther(filteredOther[0].id);
    if (filteredModern.length > 0 && !filteredModern.find((t) => t.id === activeModern))
      setActiveModern(filteredModern[0].id);
  }, [filteredSunni, filteredShia, filteredOther, filteredModern, activeSunni, activeShia, activeOther, activeModern]);

  const renderTopicWithNav = (
    topics: SectTopic[],
    active: string,
    setActive: (id: string) => void
  ) => {
    const activeTopic = topics.find((t) => t.id === active);
    return (
      <>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex md:flex-col flex-row gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide md:w-48 w-full shrink-0">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setActive(topic.id)}
              className={`text-left px-3 py-2 rounded-lg text-sm whitespace-nowrap md:whitespace-normal transition-all ${
                active === topic.id
                  ? "bg-gold/15 text-gold font-medium"
                  : "text-themed-muted hover:text-themed hover:bg-[var(--color-bg)]"
              }`}
            >
              {topic.name}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTopic && (
              <motion.div
                key={activeTopic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <TopicInfoCard topic={activeTopic} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sources & References — scoped to the active selection */}
      {topicSourceRows(activeTopic).length > 0 && (
        <SourcesCard className="mt-8" sources={topicSourceRows(activeTopic)} />
      )}
      </>
    );
  };

  return (
    <div>
      <PageHeader
        title="Islamic Sects & Groups"
        titleAr="الفرق الإسلامية"
        subtitle="Understanding the origins, beliefs, and key differences between Muslim denominations and groups — based on authentic sources."
      />

      {/* Honest framing — states the perspective, describes groups fairly, and
          keeps the app out of issuing verdicts on individuals (no scholar on staff). */}
      <div className="mb-6 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm leading-relaxed text-themed-muted">
        <p>
          <strong className="text-themed">About this overview.</strong> This is an
          educational introduction written from a mainstream Sunni (Ahl al-Sunnah
          wal-Jamāʿah) perspective. We try to describe each group fairly and cite
          authentic sources — but it is a study aid, not a substitute for learning
          from qualified scholars, and it is <strong className="text-themed">not</strong> a
          verdict on any individual or community. Who is or isn&apos;t within Islam is
          a serious matter for qualified scholars, not an app.
        </p>
      </div>

      <VerseHero
        label="The Prophet ﷺ said"
        text="My Ummah will split into seventy-three sects, all of which will be in the Fire except one.” They asked: “Which one is it, O Messenger of Allah?” He said: “The one that follows what I and my Companions are upon today."
        reference="Tirmidhi 40:36"
      />

      <PageSearch
        value={search}
        onChange={setSearch}
        placeholder="Search sects, beliefs, history..."
        className="mb-6"
      />

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
        {activeSection === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                Understanding Sects in Islam
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  The Prophet Muhammad (peace be upon him) foretold that his Ummah would divide into many sects, just as the Jews divided into seventy-one sects and the Christians into seventy-two. He identified the{" "}
                  <span className="text-themed font-medium">saved group</span>{" "}
                  as those who follow his way and the way of his Companions — not a political party, ethnic group, or organization, but a{" "}
                  <span className="text-themed font-medium">methodology</span>.
                </p>
                <p>
                  This page presents the major sects and groups that have emerged in Islamic history, their origins, core beliefs, and how they compare to the Quran, the authentic Sunnah, and the understanding of the early generations (Salaf). The aim is not to fuel hatred or division, but to provide clarity — because the Prophet ﷺ warned about these divisions as a mercy, so that Muslims could recognize them and hold firmly to the truth.
                </p>
                <p>
                  <span className="text-themed font-medium">Ahl al-Sunnah wal-Jama&apos;ah</span>{" "}
                  (the People of the Sunnah and the Community) represents the mainstream of Islam from the time of the Companions until today. It is not a sect — it is the original path that sects deviated from. Its scholars include the four Imams of fiqh, the scholars of hadith, and the great authorities of tafsir and aqeedah across all centuries.
                </p>
              </div>
            </ContentCard>

            {/* Timeline — the chronological skeleton, each era linking to the
                section that covers it (deep-links via goTo → ?tab=&sub=). */}
            <ContentCard delay={0.15}>
              <h3 className="text-lg font-semibold text-themed mb-1">
                When the groups emerged
              </h3>
              <p className="text-themed-muted text-xs leading-relaxed mb-4">
                A rough chronological map. Dates are approximate; tap any era to
                jump to where it is covered.
              </p>
              <div className="space-y-2">
                {[
                  { era: "11 AH / 632 CE", title: "Saqifah — the succession debated", desc: "The Companions choose Abu Bakr by consultation; the seed of the later Shia–Sunni divide.", tab: "shia" as SectionKey, sub: "origins" },
                  { era: "37 AH / 657 CE", title: "Siffin & the Khawarij", desc: "The first sect breaks from Ali over arbitration and pronounces takfir.", tab: "other" as SectionKey, sub: "khawarij" },
                  { era: "61 AH / 680 CE", title: "Karbala", desc: "The killing of Husayn — a tragedy that becomes foundational to Shia identity.", tab: "shia" as SectionKey, sub: "origins" },
                  { era: "late 1st c. AH", title: "Qadariyyah & Murji'ah", desc: "Opposite errors on divine decree and on faith-without-works.", tab: "other" as SectionKey, sub: "qadariyyah-murjiah" },
                  { era: "2nd c. AH", title: "Mu'tazilah & the Ibadiyyah", desc: "Rationalist theology in Basra; the Ibadi school consolidates, later centred in Oman.", tab: "other" as SectionKey, sub: "mutazilah" },
                  { era: "218 AH / 833 CE", title: "The Mihnah (inquisition)", desc: "The 'created Quran' doctrine imposed by the state; Imam Ahmad withstands it.", tab: "other" as SectionKey, sub: "mutazilah" },
                  { era: "3rd–4th c. AH", title: "Ash'ari & Maturidi schools", desc: "Kalam-based theology arises to answer the Mu'tazilah.", tab: "other" as SectionKey, sub: "asharis-maturidis" },
                  { era: "18th–20th c. CE", title: "Modern reform & revival movements", desc: "Salafiyyah, Deobandi/Barelwi, Tablighi, and political movements take shape.", tab: "modern" as SectionKey, sub: "salafiyyah" },
                  { era: "1889 CE", title: "Ahmadiyyah", desc: "Mirza Ghulam Ahmad claims prophethood in Qadian, India.", tab: "other" as SectionKey, sub: "ahmadiyyah" },
                  { era: "1930 CE", title: "Nation of Islam", desc: "A racial-theological movement founded in the United States.", tab: "other" as SectionKey, sub: "nation-of-islam" },
                ].map((row) => (
                  <button
                    key={row.title}
                    onClick={() => goTo(row.tab, row.sub)}
                    className="w-full text-left rounded-lg p-3 border sidebar-border hover:bg-gold/5 transition-colors flex gap-3 items-start"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <span className="text-xs font-semibold text-gold whitespace-nowrap shrink-0 w-24 pt-0.5">
                      {row.era}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-themed">
                        {row.title}
                      </span>
                      <span className="block text-xs text-themed-muted leading-relaxed mt-0.5">
                        {row.desc}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </ContentCard>

            {/* Sources */}
            <SourcesCard sources={[
              { ref: "Tirmidhi 40:36", desc: "The Ummah will split into 73 sects" },
              { ref: "Abu Dawud 42:2", desc: "The saved group follows the Jama'ah" },
              { ref: "Quran 3:103", desc: "Hold firmly to the rope of Allah and do not divide" },
              { ref: "Quran 6:159", desc: "Those who divided their religion into sects" },
              { ref: "Al-Milal wan-Nihal, ash-Shahrastani", desc: "Comprehensive survey of sects" },
              { ref: "Al-Farq bayn al-Firaq, al-Baghdadi", desc: "Differences between the sects" },
              { ref: "Minhaj as-Sunnah an-Nabawiyyah, Ibn Taymiyyah", desc: "Response to sectarian claims" },
            ]} />

            {/* Glossary of recurring technical terms (bottom of Overview) */}
            <ContentCard delay={0.2}>
              <h3 className="text-lg font-semibold text-themed mb-1">
                Glossary of key terms
              </h3>
              <p className="text-themed-muted text-xs leading-relaxed mb-4">
                Terms that recur across this page, in one place.
              </p>
              <Accordion
                items={[
                  { id: "aqeedah", title: "Aqeedah", subtitle: "creed", children: <p className="text-themed-muted text-sm leading-relaxed">The core beliefs of the religion — what a Muslim affirms about Allah, the angels, the books, the messengers, the Last Day, and divine decree. It is the foundation on which everything else rests, and the level at which true sects differ from Ahl al-Sunnah.</p> },
                  { id: "manhaj", title: "Manhaj", subtitle: "methodology", children: <p className="text-themed-muted text-sm leading-relaxed">The method or approach used to arrive at religious conclusions — which sources are relied upon, in what order, and how they are understood. Many differences between Muslim movements are differences of manhaj rather than of creed.</p> },
                  { id: "bidah", title: "Bid'ah", subtitle: "religious innovation", children: <p className="text-themed-muted text-sm leading-relaxed">Introducing into the religion an act of worship or belief with no basis in the Quran, Sunnah, or the practice of the Companions, while treating it as part of the religion. It does not refer to worldly inventions. See the Ahl al-Sunnah tab, "Sunnah &amp; Bid'ah."</p> },
                  { id: "takfir", title: "Takfir", subtitle: "declaring someone a disbeliever", children: <p className="text-themed-muted text-sm leading-relaxed">Ruling that a specific person has left Islam. It is a grave, conditions-bound verdict reserved for qualified scholars, not something an individual pronounces in an argument. Reckless takfir is the defining error of the Khawarij.</p> },
                  { id: "kalam", title: "Kalam", subtitle: "speculative theology", children: <p className="text-themed-muted text-sm leading-relaxed">Reasoning about God and creed using philosophical argument and logic. The Mu'tazilah were its early champions; the Ash'aris and Maturidis used it to defend Sunni positions. The Salaf generally preferred to keep creed anchored directly in the texts.</p> },
                  { id: "tawil", title: "Ta'wil", subtitle: "figurative interpretation", children: <p className="text-themed-muted text-sm leading-relaxed">Interpreting a text away from its apparent meaning to a figurative one — for example, reading Allah's "Hand" as "power." Ahl al-Sunnah affirm the attributes as they came, without distortion; some theological schools applied ta'wil to certain attributes.</p> },
                  { id: "tatil", title: "Ta'til", subtitle: "denial / stripping of meaning", children: <p className="text-themed-muted text-sm leading-relaxed">Emptying Allah's names and attributes of their real meanings — the error Ahl al-Sunnah charged against the Mu'tazilah, who denied the attributes to avoid likening Allah to creation, and ended up stripping the texts of meaning altogether.</p> },
                  { id: "salaf", title: "Salaf", subtitle: "the righteous early generations", children: <p className="text-themed-muted text-sm leading-relaxed">The first three generations of Muslims — the Companions, their successors, and those after them — whom the Prophet ﷺ praised as the best of people. "Following the Salaf" means adopting their understanding of the religion.</p> },
                  { id: "ijma", title: "Ijma'", subtitle: "scholarly consensus", children: <p className="text-themed-muted text-sm leading-relaxed">The agreement of the qualified scholars of the Ummah on a religious ruling. It is a recognised source of Islamic law, and the Prophet ﷺ indicated the Ummah as a whole would not unite upon misguidance.</p> },
                  { id: "ghuluww", title: "Ghuluww", subtitle: "excess / extremism", children: <p className="text-themed-muted text-sm leading-relaxed">Going beyond the proper bounds in religion — whether in praising the righteous (elevating them toward divinity) or in harshness (as the Khawarij did). Ahl al-Sunnah hold the middle path between excess and neglect.</p> },
                ]}
              />
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
            {filteredMatters.map((item, i) => (
              <ContentCard key={item.point} delay={0.05 + i * 0.04}>
                <h3 className="text-themed font-semibold mb-2">
                  {item.point}
                </h3>
                <p className="text-themed-muted text-sm leading-relaxed">
                  {item.detail}
                </p>
                <p className="text-xs text-gold/60 mt-2"><HadithRefText text={item.reference} /></p>
              </ContentCard>
            ))}

            <SourcesCard delay={0.3} sources={whyItMatters.map((m) => ({ ref: m.reference, desc: m.point }))} />
          </motion.div>
        )}

        {/* ─── Ahl al-Sunnah ─── */}
        {activeSection === "sunni" && (
          <motion.div
            key="sunni"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {filteredSunni.length > 0 ? (
              renderTopicWithNav(filteredSunni, activeSunni, (id) => {
                setActiveSunni(id);
                syncUrl("sunni", id);
              })
            ) : (
              <ContentCard>
                <p className="text-themed-muted text-sm text-center py-8">
                  No results match your search.
                </p>
              </ContentCard>
            )}
          </motion.div>
        )}

        {/* ─── Shia Islam ─── */}
        {activeSection === "shia" && (
          <motion.div
            key="shia"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {filteredShia.length > 0 ? (
              renderTopicWithNav(filteredShia, activeShia, (id) => {
                setActiveShia(id);
                syncUrl("shia", id);
              })
            ) : (
              <ContentCard>
                <p className="text-themed-muted text-sm text-center py-8">
                  No results match your search.
                </p>
              </ContentCard>
            )}
          </motion.div>
        )}

        {/* ─── Other Groups ─── */}
        {activeSection === "other" && (
          <motion.div
            key="other"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {filteredOther.length > 0 ? (
              renderTopicWithNav(filteredOther, activeOther, (id) => {
                setActiveOther(id);
                syncUrl("other", id);
              })
            ) : (
              <ContentCard>
                <p className="text-themed-muted text-sm text-center py-8">
                  No results match your search.
                </p>
              </ContentCard>
            )}
          </motion.div>
        )}

        {/* ─── Modern Movements ─── */}
        {activeSection === "modern" && (
          <motion.div
            key="modern"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Calm framing: these are mostly orientations within Ahl al-Sunnah,
                not sects — described even-handedly, no verdicts on individuals. */}
            <div className="mb-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm leading-relaxed text-themed-muted">
              <p>
                <strong className="text-themed">A note on labels.</strong> Most of
                the names below are movements, orientations, or trends{" "}
                <strong className="text-themed">within</strong> Sunni Islam — they
                share the same creed and pillars while emphasising different things.
                They are not, as a rule, separate sects, and this section describes
                them fairly rather than ranking them.
              </p>
            </div>
            {filteredModern.length > 0 ? (
              renderTopicWithNav(filteredModern, activeModern, (id) => {
                setActiveModern(id);
                syncUrl("modern", id);
              })
            ) : (
              <ContentCard>
                <p className="text-themed-muted text-sm text-center py-8">
                  No results match your search.
                </p>
              </ContentCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SectsPage() {
  return (
    <Suspense>
      <SectsContent />
    </Suspense>
  );
}
