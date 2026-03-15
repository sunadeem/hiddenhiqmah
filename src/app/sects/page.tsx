"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import ContentCard from "@/components/ContentCard";
import { textMatch } from "@/lib/search";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { BookOpen } from "lucide-react";
import HadithRefText from "@/components/HadithRefText";

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
          note: "Bukhari 97:83; Usul al-Sunnah, Imam Ahmad",
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
          note: "Bukhari 96:79; Muslim 47:11",
        },
      ],
      source: "Al-Madhahib al-Arba'ah, Abdur-Rahman al-Jaziri; Siyar A'lam an-Nubala, adh-Dhahabi",
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
          note: "Bukhari 62:7-21; Al-Aqidah at-Tahawiyyah",
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
      source: "Al-Aqidah at-Tahawiyyah; Minhaj as-Sunnah an-Nabawiyyah, Ibn Taymiyyah; Bukhari 52:16, 62:7-3671",
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
          note: "Bukhari 10:8 — the five prayer times; no authentic hadith supports the additions to the adhan",
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
      source: "Bukhari 67:52; Muslim 16:29; Al-Kafi, al-Kulayni; Quran 4:29, 39:3",
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
      source: "Minhaj as-Sunnah an-Nabawiyyah, Ibn Taymiyyah; Quran 5:8, 16:125",
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
          title: "They assassinated Ali ibn Abi Talib",
          detail:
            "In 40 AH, the Kharijite Abd al-Rahman ibn Muljam assassinated Ali (may Allah be pleased with him) while he was leading the Fajr prayer. They also plotted to kill Mu'awiyah and Amr ibn al-As on the same day but failed in those attempts.",
          note: "Tarikh at-Tabari; Al-Bidayah wan-Nihayah, Ibn Kathir",
        },
        {
          title: "Modern-day manifestations",
          detail:
            "The Kharijite methodology — declaring Muslims as disbelievers and justifying violence against them — has resurfaced throughout history, including in modern extremist groups. The scholars of Ahl al-Sunnah have consistently identified and refuted this ideology, which the Prophet ﷺ himself condemned.",
          note: "Bukhari 61:12; fatawa of contemporary scholars",
        },
      ],
      source: "Bukhari 61:117; Muslim 12:196-228; Maqalat al-Islamiyyin, al-Ash'ari",
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
          note: "Quran 75:22-23; Bukhari 10:31; Muslim 1:356",
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
          note: "Quran 33:40; Bukhari 60:122; Muslim 24:33",
        },
        {
          title: "Reinterpretation of 'Seal of the Prophets'",
          detail:
            "Ahmadis argue that 'khatam an-nabiyyin' means 'best of the prophets' rather than 'last.' This interpretation contradicts the Arabic language, the understanding of the Companions, the consensus of scholars for 1400 years, and the explicit hadith: 'The chain of messengers and prophets has come to an end. There shall be no messenger or prophet after me.'",
          note: "Tirmidhi 34:3",
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
      source: "Quran 33:40; Bukhari 60:122; Tirmidhi 34:3; Resolution of Muslim World League, 1974",
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
      source: "Quran 33:40, 49:13; Ahmad 23489; The Autobiography of Malcolm X",
    },
  },
];

const sections = [
  { key: "intro", label: "Overview" },
  { key: "importance", label: "Why It Matters" },
  { key: "sunni", label: "Ahl al-Sunnah" },
  { key: "shia", label: "Shia Islam" },
  { key: "other", label: "Other Groups" },
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

      {topic.content.source && (
        <div className="mt-4 pt-3 border-t sidebar-border">
          <p className="text-xs text-themed-muted">
            <span className="text-gold/60 font-medium">Sources:</span>{" "}
            <HadithRefText text={topic.content.source} />
          </p>
        </div>
      )}
    </ContentCard>
  );
}

/* ───────────────────────── page ───────────────────────── */

function SectsContent() {
  const searchParams = useSearchParams();
  useScrollToSection();
  const [activeSection, setActiveSection] = useState<SectionKey>(
    (searchParams.get("tab") as SectionKey) || "intro"
  );
  const [activeSunni, setActiveSunni] = useState("aqeedah");
  const [activeShia, setActiveShia] = useState("origins");
  const [activeOther, setActiveOther] = useState("khawarij");
  const [search, setSearch] = useState("");

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
  const filteredMatters = useMemo(() => whyItMatters.filter(mattersMatches), [search]);

  // Auto-select first visible topic when active is filtered out
  if (filteredSunni.length > 0 && !filteredSunni.find((t) => t.id === activeSunni)) {
    setActiveSunni(filteredSunni[0].id);
  }
  if (filteredShia.length > 0 && !filteredShia.find((t) => t.id === activeShia)) {
    setActiveShia(filteredShia[0].id);
  }
  if (filteredOther.length > 0 && !filteredOther.find((t) => t.id === activeOther)) {
    setActiveOther(filteredOther[0].id);
  }

  const renderPillNav = (
    topics: SectTopic[],
    active: string,
    setActive: (id: string) => void
  ) => (
    <div className="flex md:flex-col flex-row gap-1 overflow-x-auto md:overflow-x-visible md:w-48 w-full shrink-0">
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
  );

  const renderTopicWithNav = (
    topics: SectTopic[],
    active: string,
    setActive: (id: string) => void
  ) => {
    const activeTopic = topics.find((t) => t.id === active);
    return (
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
    );
  };

  return (
    <div>
      <PageHeader
        title="Islamic Sects & Groups"
        titleAr="الفرق الإسلامية"
        subtitle="Understanding the origins, beliefs, and key differences between Muslim denominations and groups — based on authentic sources."
      />

      <PageSearch
        value={search}
        onChange={setSearch}
        placeholder="Search sects, beliefs, history..."
        className="mb-6"
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
            <ContentCard>
              <div className="text-center py-4 sm:py-6">
                <p className="text-xs text-themed-muted mb-3 uppercase tracking-wider">
                  The Prophet ﷺ said
                </p>
                <p className="text-themed italic mb-2 max-w-2xl mx-auto">
                  &ldquo;My Ummah will split into seventy-three sects, all of
                  which will be in the Fire except one.&rdquo; They asked:
                  &ldquo;Which one is it, O Messenger of Allah?&rdquo; He said:
                  &ldquo;The one that follows what I and my Companions are upon
                  today.&rdquo;
                </p>
                <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Tirmidhi 40:36
                </span>
              </div>
            </ContentCard>

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

            {/* Sources */}
            <ContentCard delay={0.3}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Tirmidhi 40:36 — The Ummah will split into 73 sects",
                  "Abu Dawud 42:2 — The saved group follows the Jama'ah",
                  "Quran 3:103 — Hold firmly to the rope of Allah and do not divide",
                  "Quran 6:159 — Those who divided their religion into sects",
                  "Al-Milal wan-Nihal, ash-Shahrastani — Comprehensive survey of sects",
                  "Al-Farq bayn al-Firaq, al-Baghdadi — Differences between the sects",
                  "Minhaj as-Sunnah an-Nabawiyyah, Ibn Taymiyyah — Response to sectarian claims",
                ].map((source) => (
                  <li
                    key={source}
                    className="text-xs text-themed-muted leading-relaxed flex items-start gap-2"
                  >
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
                  إِنَّ ٱلَّذِينَ فَرَّقُوا دِينَهُمْ وَكَانُوا شِيَعًۭا لَّسْتَ مِنْهُمْ فِى شَىْءٍ
                </p>
                <p className="text-themed-muted italic">
                  &ldquo;Indeed, those who have divided their religion and become
                  sects — you are not associated with them in anything.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 6:159</p>
              </div>
            </ContentCard>

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
              renderTopicWithNav(filteredSunni, activeSunni, setActiveSunni)
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
              renderTopicWithNav(filteredShia, activeShia, setActiveShia)
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
              renderTopicWithNav(filteredOther, activeOther, setActiveOther)
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
