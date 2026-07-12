"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TopicInfoCard, { type Topic } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";

/* ───────────────────────── tabs ───────────────────────── */

const tabs = [
  { key: "before-creation", label: "Before Creation" },
  { key: "pen-tablet", label: "The Pen & Tablet" },
  { key: "throne-water", label: "The Throne & Water" },
  { key: "heavens-earth", label: "The Heavens & Earth" },
  { key: "angels", label: "The Angels" },
  { key: "jinn", label: "The Jinn" },
  { key: "adam-hawa", label: "Adam & Hawa" },
  { key: "life-on-earth", label: "Life on Earth" },
  { key: "death-grave", label: "Death & The Grave" },
  { key: "end-times", label: "The End Times" },
  { key: "day-of-judgement", label: "Day of Judgement" },
  { key: "jannah-jahannam", label: "Jannah & Jahannam" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* ───────────────────────── 1. Before Creation ───────────────────────── */

const beforeCreationTopics: Topic[] = [
  {
    id: "allah-alone",
    name: "Allah Alone",
    content: {
      intro:
        "Before anything existed — no heavens, no earth, no time, no space — there was only Allah. He is the First (al-Awwal), before whom there was nothing, and the Last (al-Akhir), after whom there will be nothing.",
      verse: {
        arabic:
          "هُوَ ٱلْأَوَّلُ وَٱلْـَٔاخِرُ وَٱلظَّـٰهِرُ وَٱلْبَاطِنُ ۖ وَهُوَ بِكُلِّ شَىْءٍ عَلِيمٌ",
        text: "He is the First and the Last, the Manifest and the Hidden, and He has knowledge of all things.",
        ref: "Quran 57:3",
      },
      points: [
        {
          title: "Nothing existed before Him",
          detail:
            "The Prophet (peace be upon him) said in his supplication: 'O Allah, You are the First — there was nothing before You. And You are the Last — there will be nothing after You. You are the Manifest — there is nothing above You. And You are the Hidden — there is nothing beyond You.' Before creation, there was no time, no space, no darkness, no light — only Allah, the Eternal, the Self-Sufficient.",
          note: "Tirmidhi 48:31",
        },
        {
          title: "He was not in need of creation",
          detail:
            "Allah did not create because He was lonely or in need. He is al-Ghani (the Self-Sufficient), entirely free of need from all of His creation. Allah says: 'O mankind, you are the ones in need of Allah, while Allah is the Free of need, the Praiseworthy.' He created out of His wisdom, will, and power — not out of necessity.",
          note: "Quran 35:15",
        },
        {
          title: "His knowledge preceded all things",
          detail:
            "Allah knew everything that would ever happen before creating anything. He knew every soul that would exist, every leaf that would fall, every word that would be spoken. Nothing occurs except that He already knew it and wrote it. He says: 'Did you not know that Allah knows what is in the heaven and the earth? Indeed, that is in a Record. Indeed that, for Allah, is easy.'",
          note: "Quran 22:70",
        },
      ],
      source: "Quran 57:3; Quran 35:15; Quran 22:70; Tirmidhi 48:31",
    },
  },
  {
    id: "his-speech",
    name: "His Will & Speech",
    content: {
      intro:
        "Allah creates by His command — He says 'Be' and it is. His word is the origin of all existence. Nothing comes into being except through His will.",
      verse: {
        arabic:
          "إِنَّمَآ أَمْرُهُۥٓ إِذَآ أَرَادَ شَيْـًٔا أَن يَقُولَ لَهُۥ كُن فَيَكُونُ",
        text: "His command, when He wills a thing, is only to say to it: 'Be' — and it is.",
        ref: "Quran 36:82",
      },
      points: [
        {
          title: "Creation through the command 'Kun' (Be)",
          detail:
            "The entire universe — from the greatest galaxy to the smallest atom — came into existence through Allah's word. He does not need materials, tools, or effort. When He decides a matter, He says 'Be' and it is. This is mentioned repeatedly in the Quran to establish that Allah's power is absolute and without limitation.",
          note: "Quran 2:117; Quran 36:82; Quran 40:68",
        },
        {
          title: "He is the Creator, the Originator, the Fashioner",
          detail:
            "Allah introduced Himself with names that describe His creative power: al-Khaliq (the Creator), al-Bari' (the Originator who brings things into existence from nothing), and al-Musawwir (the Fashioner who gives each creation its unique form). These names tell us that creation was purposeful, intentional, and beautiful.",
          note: "Quran 59:24",
        },
      ],
      source: "Quran 36:82; Quran 2:117; Quran 59:24",
    },
  },
];

/* ───────────────────────── 2. The Pen & Tablet ───────────────────────── */

const penTabletTopics: Topic[] = [
  {
    id: "the-pen",
    name: "The Pen (al-Qalam)",
    content: {
      intro:
        "The first thing Allah created was the Pen. He commanded it to write, and it wrote everything that would ever happen — from that moment until the end of time. This was the beginning of the divine decree.",
      verse: {
        arabic: "نٓ ۚ وَٱلْقَلَمِ وَمَا يَسْطُرُونَ",
        text: "Nun. By the Pen and what they inscribe.",
        ref: "Quran 68:1",
      },
      points: [
        {
          title: "The first thing created",
          detail:
            "The Prophet (peace be upon him) said: 'The first thing Allah created was the Pen. He said to it: Write. It said: My Lord, what shall I write? He said: Write the decree of everything until the Hour is established.' Everything that would ever occur was recorded at that moment.",
          note: "Tirmidhi 32:23; Tirmidhi 32:23",
        },
        {
          title: "It wrote everything",
          detail:
            "The Pen wrote the destiny of every creation — every birth and death, every provision, every moment of happiness and sadness, every leaf that falls and every drop of rain. Nothing was left unrecorded. The Prophet (peace be upon him) said: 'The pens have been lifted and the pages have dried.' — meaning everything has already been written and nothing can change what was decreed.",
          note: "Tirmidhi 37:102",
        },
      ],
      source: "Quran 68:1; Tirmidhi 32:23; Tirmidhi 32:23; Tirmidhi 37:102",
    },
  },
  {
    id: "preserved-tablet",
    name: "The Preserved Tablet (al-Lawh al-Mahfuz)",
    content: {
      intro:
        "The Preserved Tablet is the record upon which the Pen wrote. It contains the complete decree of everything that was, is, and will be — protected and guarded by Allah from any alteration.",
      verse: {
        arabic: "بَلْ هُوَ قُرْءَانٌۭ مَّجِيدٌۭ فِى لَوْحٍۢ مَّحْفُوظٍ",
        text: "Rather, it is a glorious Quran, in a Preserved Tablet.",
        ref: "Quran 85:21-22",
      },
      points: [
        {
          title: "The mother of all books",
          detail:
            "Allah refers to this record as 'Umm al-Kitab' — the Mother of the Book. Everything is derived from it. All divine scriptures, all decrees, all knowledge of what will occur — everything traces back to this Preserved Tablet. Allah says: 'And with Him is the Mother of the Book.'",
          note: "Quran 13:39; Quran 43:4",
        },
        {
          title: "Nothing is missing from it",
          detail:
            "Allah says: 'We have not neglected in the Register a thing.' Every event, every creature, every moment is accounted for. The Preserved Tablet is the master record of all existence — a testament to Allah's complete and perfect knowledge.",
          note: "Quran 6:38",
        },
        {
          title: "It was written 50,000 years before creation",
          detail:
            "The Prophet (peace be upon him) said: 'Allah wrote the decrees of creation fifty thousand years before He created the heavens and the earth.' This shows that the divine decree preceded the physical creation by an immense span, establishing that nothing happens by accident.",
          note: "Muslim 46:27",
        },
      ],
      source: "Quran 85:21-22; Quran 13:39; Quran 6:38; Muslim 46:27",
    },
  },
];

/* ───────────────────────── 3. The Throne & Water ───────────────────────── */

const throneWaterTopics: Topic[] = [
  {
    id: "the-throne",
    name: "The Throne (al-Arsh)",
    content: {
      intro:
        "The Throne of Allah is the greatest of all created things — so vast that the heavens and the earth compared to it are like a ring thrown into a desert. It is the ceiling of all creation, above which is Allah, the Most High.",
      verse: {
        arabic:
          "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ",
        text: "Allah — there is no god except Him, the Ever-Living, the Self-Sustaining. Neither drowsiness overtakes Him nor sleep.",
        ref: "Quran 2:255",
      },
      points: [
        {
          title: "The greatest of all created things",
          detail:
            "The Prophet (peace be upon him) said: 'The seven heavens compared to the Kursi (Footstool) are like a ring thrown into a vast desert, and the superiority of the Arsh (Throne) over the Kursi is like the superiority of that desert over that ring.' The Throne is the largest physical creation of Allah, and it is carried by mighty angels.",
          note: "Narrated by Ibn Hibban and others; see Silsilah as-Sahihah 109",
        },
        {
          title: "It has bearers",
          detail:
            "Allah says: 'Those who carry the Throne and those around it glorify the praises of their Lord and believe in Him and ask forgiveness for those who believe.' On the Day of Judgement, eight angels will carry it. The Prophet (peace be upon him) described these angels as so immense that the distance between the earlobe and shoulder of one angel is a journey of seven hundred years.",
          note: "Quran 40:7; Abu Dawud 42:132",
        },
        {
          title: "Allah rose over the Throne",
          detail:
            "After creating the heavens and the earth, Allah rose over (istawa) the Throne in a manner that befits His majesty. This is mentioned seven times in the Quran. Imam Malik was asked about it and said: 'The istiwaa is known, the how is unknown, belief in it is obligatory, and asking about its nature is an innovation.'",
          note: "Quran 7:54; Quran 20:5",
        },
      ],
      source: "Quran 2:255; Quran 7:54; Quran 40:7; Abu Dawud 42:132",
    },
  },
  {
    id: "the-water",
    name: "The Primordial Water",
    content: {
      intro:
        "Before the heavens and the earth were created, the Throne of Allah was upon water. Water was one of the earliest creations, and from it, Allah brought forth all living things.",
      verse: {
        arabic:
          "وَهُوَ ٱلَّذِى خَلَقَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ فِى سِتَّةِ أَيَّامٍۢ وَكَانَ عَرْشُهُۥ عَلَى ٱلْمَآءِ",
        text: "And it is He who created the heavens and the earth in six days, and His Throne was upon the water.",
        ref: "Quran 11:7",
      },
      points: [
        {
          title: "The Throne was upon water",
          detail:
            "Before the creation of the heavens and the earth, the Throne of Allah existed upon water. The Prophet (peace be upon him) said: 'Allah existed and nothing else existed before Him, and His Throne was over the water, and He then wrote in the Preserved Tablet everything, and He created the heavens and the earth.'",
          note: "Bukhari 59:2",
        },
        {
          title: "Every living thing was made from water",
          detail:
            "Allah says: 'And We made from water every living thing. Will they not then believe?' Water is the foundation of all biological life — a truth stated in the Quran over 1,400 years ago, long before modern science confirmed that water is essential for all known forms of life.",
          note: "Quran 21:30",
        },
      ],
      source: "Quran 11:7; Quran 21:30; Bukhari 59:2",
    },
  },
];

/* ───────────────────────── 4. The Heavens & Earth ───────────────────────── */

const heavensEarthTopics: Topic[] = [
  {
    id: "six-days",
    name: "Created in Six Days",
    content: {
      intro:
        "Allah created the heavens and the earth in six days. These 'days' (ayyam) refer to periods of time known to Allah — not necessarily 24-hour days as we know them. After completing creation, He rose over the Throne.",
      verse: {
        arabic:
          "إِنَّ رَبَّكُمُ ٱللَّهُ ٱلَّذِى خَلَقَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ فِى سِتَّةِ أَيَّامٍۢ ثُمَّ ٱسْتَوَىٰ عَلَى ٱلْعَرْشِ",
        text: "Indeed, your Lord is Allah, who created the heavens and the earth in six days and then rose over the Throne.",
        ref: "Quran 7:54",
      },
      points: [
        {
          title: "The earth was created first",
          detail:
            "Allah created the earth in two days, then placed upon it firm mountains, blessed it, and measured therein its sustenance in four days equal (included in the first two). Then He turned to the heaven while it was smoke, and fashioned it into seven heavens in two days.",
          note: "Quran 41:9-12",
        },
        {
          title: "The heavens were smoke",
          detail:
            "Before being formed into seven distinct heavens, the sky was in a state of smoke (dukhan). Allah turned to it and said to it and to the earth: 'Come, willingly or unwillingly.' They both said: 'We come willingly.' Then He completed them as seven heavens in two days and assigned to each heaven its command.",
          note: "Quran 41:11-12",
        },
        {
          title: "He created without fatigue",
          detail:
            "Unlike claims found in other traditions, Allah explicitly states that creating the heavens and the earth did not tire Him: 'And We did certainly create the heavens and the earth and what is between them in six days, and there touched Us no weariness.' He is al-Qayyum — the Self-Sustaining who sustains all of creation.",
          note: "Quran 50:38",
        },
      ],
      source: "Quran 7:54; Quran 41:9-12; Quran 50:38",
    },
  },
  {
    id: "seven-heavens",
    name: "Seven Heavens",
    content: {
      intro:
        "Allah created seven heavens, layered one above another. Each heaven is a vast realm with its own inhabitants and wonders. The lowest heaven is adorned with the stars we see.",
      points: [
        {
          title: "Layered heavens",
          detail:
            "Allah says: 'It is Allah who has created seven heavens and of the earth, the like of them.' And: 'Do you not see how Allah has created seven heavens in layers, and made the moon a light therein, and made the sun a lamp?' The heavens are stacked above one another, each one immensely larger than the last.",
          note: "Quran 65:12; Quran 71:15-16",
        },
        {
          title: "Adorned with stars",
          detail:
            "The lowest heaven is adorned with the celestial lights we see at night. Allah says: 'And We adorned the nearest heaven with lamps (stars) and as protection.' The stars serve as beauty, as guidance for travelers, and as missiles against the devils who try to eavesdrop on the heavenly assembly.",
          note: "Quran 67:5; Quran 37:6-10",
        },
        {
          title: "The Prophet visited them during the Night Journey",
          detail:
            "During al-Isra' wal-Mi'raj, the Prophet (peace be upon him) was taken through each of the seven heavens. At each level, he met a different prophet — Adam in the first heaven, Isa and Yahya in the second, Yusuf in the third, Idris in the fourth, Harun in the fifth, Musa in the sixth, and Ibrahim in the seventh, leaning against al-Bayt al-Ma'mur.",
          note: "Bukhari 59:10; Muslim 1:309",
        },
      ],
      source: "Quran 67:5; Quran 71:15-16; Bukhari 59:10; Muslim 1:309",
    },
  },
];

/* ───────────────────────── 5. The Angels ───────────────────────── */

const angelsTopics: Topic[] = [
  {
    id: "nature",
    name: "Their Nature",
    content: {
      intro:
        "Angels are created from light. They do not eat, drink, sleep, or disobey Allah. They are devoted entirely to worshipping Him and carrying out His commands.",
      verse: {
        arabic: "لَّا يَعْصُونَ ٱللَّهَ مَآ أَمَرَهُمْ وَيَفْعَلُونَ مَا يُؤْمَرُونَ",
        text: "They do not disobey Allah in what He commands them, and they do what they are commanded.",
        ref: "Quran 66:6",
      },
      points: [
        {
          title: "Created from light",
          detail:
            "The Prophet (peace be upon him) said: 'The angels were created from light, the jinn were created from a smokeless flame of fire, and Adam was created from what has been described to you (clay).' Angels have no free will to disobey — they are programmed for obedience and worship.",
          note: "Muslim 55:78",
        },
        {
          title: "They have wings",
          detail:
            "Allah says: 'Praise be to Allah, Creator of the heavens and the earth, who made the angels messengers having wings — two or three or four. He increases in creation what He wills.' Jibril has six hundred wings, each spanning the horizon.",
          note: "Quran 35:1; Bukhari 59:17",
        },
        {
          title: "They are immense in number",
          detail:
            "The Prophet (peace be upon him) said: 'The heaven is creaking — and it has the right to creak — for there is no space in it the size of four fingers except that there is an angel there, prostrating to Allah.' Every day, seventy thousand angels enter al-Bayt al-Ma'mur in the seventh heaven and never return — replaced by another seventy thousand.",
          note: "Ibn Majah 37:91; Bukhari 59:10",
        },
      ],
      source: "Quran 35:1; Quran 66:6; Muslim 55:78; Bukhari 59:10; Bukhari 59:17; Ibn Majah 37:91",
    },
  },
  {
    id: "roles",
    name: "Their Roles",
    content: {
      intro:
        "Each angel has a specific duty assigned by Allah. Some are tasked with revelation, others with sustaining life, recording deeds, or executing divine commands.",
      points: [
        {
          title: "Jibril — the conveyor of revelation",
          detail:
            "Jibril (Gabriel) is the greatest of all angels. He is called Ruh al-Qudus (the Holy Spirit) and Ruh al-Amin (the Trustworthy Spirit). His role is to bring Allah's revelation to the prophets. He brought the Quran to Prophet Muhammad (peace be upon him) over twenty-three years.",
          note: "Quran 2:97; Quran 26:193-194",
        },
        {
          title: "Mika'il — provision and rain",
          detail:
            "Mika'il (Michael) is entrusted with rain, vegetation, and the provision of sustenance to creation. He manages the natural systems by which Allah provides for His creatures.",
          note: "Quran 2:98",
        },
        {
          title: "Israfil — the blowing of the Trumpet",
          detail:
            "Israfil is the angel who will blow the Trumpet (as-Sur) to signal the end of the world and the resurrection. The Prophet (peace be upon him) said: 'How can I be at ease when the one with the Horn has put it to his lips and inclined his forehead, waiting to be given permission to blow?'",
          note: "Tirmidhi 47:295",
        },
        {
          title: "Malak al-Mawt — the angel of death",
          detail:
            "The Angel of Death extracts souls at the time of death. Allah says: 'Say: The angel of death who has been entrusted with you will take your souls. Then to your Lord you will be returned.'",
          note: "Quran 32:11",
        },
        {
          title: "The recording angels (Kiraman Katibin)",
          detail:
            "Every person has two angels — one on the right recording good deeds, one on the left recording bad deeds. Allah says: 'When the two receivers receive, seated on the right and on the left. He does not utter a single word except that there is with him an observer ready.'",
          note: "Quran 50:17-18; Quran 82:10-12",
        },
      ],
      source: "Quran 2:97-98; Quran 32:11; Quran 50:17-18; Tirmidhi 47:295",
    },
  },
];

/* ───────────────────────── 6. The Jinn ───────────────────────── */

const jinnTopics: Topic[] = [
  {
    id: "creation",
    name: "Their Creation",
    content: {
      intro:
        "The jinn are an entire species created by Allah from smokeless fire, before the creation of mankind. They live in a world parallel to ours — they can see us, but we cannot see them. Like humans, they have free will.",
      verse: {
        arabic: "وَٱلْجَآنَّ خَلَقْنَـٰهُ مِن قَبْلُ مِن نَّارِ ٱلسَّمُومِ",
        text: "And the jinn We created before from scorching fire.",
        ref: "Quran 15:27",
      },
      points: [
        {
          title: "Created from fire before mankind",
          detail:
            "Allah created the jinn from 'marij min nar' — a smokeless flame of fire. They existed on the earth before Adam was created. Among them are believers and disbelievers, righteous and wicked. They are a nation unto themselves.",
          note: "Quran 55:15; Quran 72:11",
        },
        {
          title: "They have free will",
          detail:
            "Unlike angels, jinn can choose to obey or disobey Allah. A group of jinn heard the Quran and believed: 'And among us are Muslims, and among us are those who deviate. As for those who became Muslim — they have sought out the right path.' They will be held accountable on the Day of Judgement just like humans.",
          note: "Quran 72:14; Quran 46:29-31",
        },
        {
          title: "They were created to worship Allah",
          detail:
            "The purpose of the jinn is the same as that of humans. Allah says: 'I did not create the jinn and mankind except to worship Me.' They are addressed in the Quran alongside humans and bear the same responsibility of tawhid (monotheism).",
          note: "Quran 51:56",
        },
      ],
      source: "Quran 15:27; Quran 51:56; Quran 55:15; Quran 72:11-14",
    },
  },
  {
    id: "iblis",
    name: "Iblis (Satan)",
    content: {
      intro:
        "Iblis was among the jinn who worshipped Allah so devoutly that he was elevated to the ranks of the angels. But when Allah commanded the angels to prostrate to Adam, Iblis refused out of arrogance — and became the chief enemy of mankind.",
      verse: {
        arabic:
          "وَإِذْ قُلْنَا لِلْمَلَـٰٓئِكَةِ ٱسْجُدُوا۟ لِـَٔادَمَ فَسَجَدُوٓا۟ إِلَّآ إِبْلِيسَ كَانَ مِنَ ٱلْجِنِّ فَفَسَقَ عَنْ أَمْرِ رَبِّهِۦ",
        text: "And when We said to the angels: Prostrate to Adam — they prostrated, except Iblis. He was of the jinn and departed from the command of his Lord.",
        ref: "Quran 18:50",
      },
      points: [
        {
          title: "His arrogance and refusal",
          detail:
            "When commanded to prostrate, Iblis said: 'I am better than him. You created me from fire and created him from clay.' This was the first sin driven by arrogance (kibr) — the refusal to submit to Allah's command because of self-perceived superiority.",
          note: "Quran 7:12; Quran 38:76",
        },
        {
          title: "His vow against humanity",
          detail:
            "After being expelled, Iblis swore: 'Because You have put me in error, I will surely sit in wait for them on Your straight path. Then I will come to them from before them and from behind them, and on their right and on their left, and You will not find most of them grateful.' Allah granted him respite until the Day of Judgement.",
          note: "Quran 7:16-17; Quran 15:36-39",
        },
        {
          title: "He has no power over the sincere believers",
          detail:
            "Despite his vow, Iblis admitted: 'Except, among them, Your chosen servants.' Allah confirmed: 'Indeed, My servants — you have no authority over them.' The Shaytan can whisper and suggest, but he cannot force anyone to sin. On the Day of Judgement, he will disown all who followed him.",
          note: "Quran 15:40; Quran 14:22; Quran 17:65",
        },
      ],
      source: "Quran 7:12-17; Quran 15:27-42; Quran 18:50; Quran 38:76",
    },
  },
];

/* ───────────────────────── 7. Adam & Hawa ───────────────────────── */

const adamHawaTopics: Topic[] = [
  {
    id: "creation-adam",
    name: "Creation of Adam",
    content: {
      intro:
        "Adam (peace be upon him) was the first human being — created by Allah's own hands from clay. He was given a form unlike any other creation, honored with knowledge, and made the khalifah (vicegerent) on earth.",
      verse: {
        arabic:
          "إِذْ قَالَ رَبُّكَ لِلْمَلَـٰٓئِكَةِ إِنِّى خَـٰلِقٌۭ بَشَرًۭا مِّن طِينٍۢ",
        text: "When your Lord said to the angels: Indeed, I am going to create a human being from clay.",
        ref: "Quran 38:71",
      },
      points: [
        {
          title: "Created from clay by Allah's hands",
          detail:
            "Allah created Adam with His own two hands — an honor given to no other creation. He fashioned him from clay, from black mud altered, then breathed into him from His soul. Allah said to Iblis: 'What prevented you from prostrating to that which I created with My hands?'",
          note: "Quran 38:75; Quran 15:28-29",
        },
        {
          title: "Taught the names of all things",
          detail:
            "Allah taught Adam the names of everything — a knowledge the angels themselves did not possess. When asked, the angels said: 'Exalted are You; we have no knowledge except what You have taught us.' Then Adam informed them of the names, proving the unique capacity of human intellect.",
          note: "Quran 2:31-33",
        },
        {
          title: "The angels were commanded to prostrate",
          detail:
            "After creating Adam, Allah commanded all the angels to prostrate to him — not in worship, but in honor. Every angel obeyed, except Iblis, who refused out of arrogance. This prostration established the nobility of mankind in the order of creation.",
          note: "Quran 2:34; Quran 15:29-31",
        },
        {
          title: "Created in the best form",
          detail:
            "The Prophet (peace be upon him) said: 'Allah created Adam in His image, sixty cubits tall.' He was given the best of forms. Every human being descends from this noble origin — a reminder that every person carries inherent dignity.",
          note: "Bukhari 79:1; Quran 95:4",
        },
      ],
      source: "Quran 2:31-34; Quran 15:28-31; Quran 38:71-76; Bukhari 79:1",
    },
  },
  {
    id: "paradise-fall",
    name: "Paradise & The Fall",
    content: {
      intro:
        "Adam and Hawa (Eve) were placed in Paradise and given freedom to enjoy everything — except one tree. Through the whispering of Iblis, they ate from it, realized their mistake, and repented. Allah accepted their repentance and sent them to earth.",
      verse: {
        arabic:
          "قَالَا رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَـٰسِرِينَ",
        text: "They said: Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
        ref: "Quran 7:23",
      },
      points: [
        {
          title: "Hawa was created from Adam",
          detail:
            "Allah says: 'O mankind, fear your Lord, who created you from one soul and created from it its mate and dispersed from both of them many men and women.' Hawa (Eve) was created from Adam as his companion and partner — and from this pair, all of humanity descended.",
          note: "Quran 4:1",
        },
        {
          title: "Forbidden from one tree",
          detail:
            "They were given complete freedom in Paradise except for one restriction: 'Do not approach this tree, or you will be among the wrongdoers.' Iblis whispered to them, swearing by Allah that he was a sincere advisor, and told them the tree would make them angels or grant them immortality.",
          note: "Quran 2:35; Quran 7:20-21",
        },
        {
          title: "They ate and immediately repented",
          detail:
            "When they ate from the tree, their private parts became exposed to them and they began covering themselves with leaves. But unlike Iblis, they did not persist in disobedience — they immediately turned to Allah with sincere repentance. Allah accepted their repentance, for He is the Acceptor of repentance, the Merciful.",
          note: "Quran 7:22-23; Quran 2:37",
        },
        {
          title: "Sent to earth with a purpose",
          detail:
            "Allah said: 'Go down, all of you, from it. And when guidance comes to you from Me — whoever follows My guidance, there will be no fear upon them, nor will they grieve.' The descent to earth was not merely a punishment — it was the fulfillment of Allah's original plan to place a khalifah (vicegerent) on earth.",
          note: "Quran 2:38; Quran 2:30",
        },
      ],
      source: "Quran 2:30-38; Quran 4:1; Quran 7:19-25",
    },
  },
];

/* ───────────────────────── 8. Life on Earth ───────────────────────── */

const lifeOnEarthTopics: Topic[] = [
  {
    id: "purpose",
    name: "The Purpose of Life",
    content: {
      intro:
        "Life on earth is a test — a temporary stage where every human being is given the chance to know their Creator, worship Him, and earn their place in the eternal life to come.",
      verse: {
        arabic:
          "ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًۭا",
        text: "He who created death and life to test you — which of you is best in deed.",
        ref: "Quran 67:2",
      },
      points: [
        {
          title: "Created to worship Allah",
          detail:
            "The fundamental purpose of human existence is stated plainly: 'I did not create the jinn and mankind except to worship Me.' Worship (ibadah) encompasses everything done with the intention of pleasing Allah — from prayer and charity to kindness and honest work.",
          note: "Quran 51:56",
        },
        {
          title: "This life is a test",
          detail:
            "Allah tests people through hardship and ease, poverty and wealth, loss and blessing. He says: 'Do people think they will be left alone because they say, We believe, and will not be tested? We certainly tested those before them, and Allah will surely make evident those who are truthful, and He will surely make evident the liars.'",
          note: "Quran 29:2-3",
        },
        {
          title: "This world is temporary",
          detail:
            "The Prophet (peace be upon him) said: 'What is the example of this world compared to the Hereafter except that of one of you dipping his finger into the sea — let him see what it brings back.' The entire duration of this life is nothing compared to eternity.",
          note: "Muslim 53:55",
        },
      ],
      source: "Quran 29:2-3; Quran 51:56; Quran 67:2; Muslim 53:55",
    },
  },
  {
    id: "messengers",
    name: "The Sending of Messengers",
    content: {
      intro:
        "Throughout human history, Allah sent prophets and messengers to every nation — all with the same core message: worship Allah alone. From Adam to Muhammad (peace be upon them all), the chain of prophethood guided humanity back to its Creator.",
      verse: {
        arabic:
          "وَلَقَدْ بَعَثْنَا فِى كُلِّ أُمَّةٍۢ رَّسُولًا أَنِ ٱعْبُدُوا۟ ٱللَّهَ وَٱجْتَنِبُوا۟ ٱلطَّـٰغُوتَ",
        text: "And We certainly sent into every nation a messenger, saying: Worship Allah and avoid false gods.",
        ref: "Quran 16:36",
      },
      points: [
        {
          title: "Every nation received a warner",
          detail:
            "Allah says: 'There was no nation but that there passed within it a warner.' The message of tawhid was delivered to every people in every era. No community was left without guidance — and this is part of Allah's perfect justice.",
          note: "Quran 35:24; Quran 10:47",
        },
        {
          title: "124,000 prophets",
          detail:
            "The Prophet (peace be upon him) was asked how many prophets there were, and he said 124,000, among whom 315 were messengers (rusul). The Quran names 25 of them by name. All of them called to the same truth: 'There is no god but Allah.'",
          note: "Musnad Ahmad 21546 (graded Sahih by some scholars); Quran 40:78",
        },
        {
          title: "Muhammad — the seal of the prophets",
          detail:
            "The Prophet Muhammad (peace be upon him) is the final messenger sent to all of humanity, not just one nation. Allah says: 'Muhammad is not the father of any of your men, but he is the Messenger of Allah and the seal of the prophets.' His message completes and confirms all that came before.",
          note: "Quran 33:40; Muslim 43:7",
        },
      ],
      source: "Quran 16:36; Quran 33:40; Quran 35:24; Muslim 43:7",
    },
  },
  {
    id: "the-test",
    name: "Trials & Accountability",
    content: {
      intro:
        "Every human being will face tests in this life — in their health, wealth, family, and faith. Allah promises that no soul is burdened beyond its capacity, and every test carries the potential for immense reward.",
      points: [
        {
          title: "No soul is burdened beyond its capacity",
          detail:
            "Allah says: 'Allah does not burden a soul beyond that it can bear.' Every hardship a person faces is within their ability to endure. This is a source of comfort and strength for every believer facing difficulty.",
          note: "Quran 2:286",
        },
        {
          title: "Patience in hardship is rewarded without limit",
          detail:
            "Allah says: 'Indeed, the patient will be given their reward without account.' The Prophet (peace be upon him) said: 'No fatigue, illness, anxiety, sorrow, harm, or distress befalls a Muslim — even the pricking of a thorn — except that Allah expiates some of his sins thereby.'",
          note: "Quran 39:10; Bukhari 75:1",
        },
        {
          title: "Every deed is recorded",
          detail:
            "Allah says: 'Whoever does an atom's weight of good will see it, and whoever does an atom's weight of evil will see it.' Nothing is overlooked or forgotten. On the Day of Judgement, every person will find their record — complete and precise.",
          note: "Quran 99:7-8",
        },
      ],
      source: "Quran 2:286; Quran 39:10; Quran 99:7-8; Bukhari 75:1",
    },
  },
];

/* ───────────────────────── 9. Death & The Grave ───────────────────────── */

const deathGraveTopics: Topic[] = [
  {
    id: "certainty-death",
    name: "The Certainty of Death",
    content: {
      intro:
        "Death is the one absolute certainty of life. Every soul will taste it — no wealth, power, or status can prevent it. It is the doorway from this temporary world to the eternal life beyond.",
      verse: {
        arabic: "كُلُّ نَفْسٍۢ ذَآئِقَةُ ٱلْمَوْتِ ۗ ثُمَّ إِلَيْنَا تُرْجَعُونَ",
        text: "Every soul will taste death. Then to Us you will be returned.",
        ref: "Quran 29:57",
      },
      points: [
        {
          title: "Remember death often",
          detail:
            "The Prophet (peace be upon him) said: 'Remember often the destroyer of pleasures — death.' Remembering death keeps the believer focused on what truly matters and prevents attachment to the temporary comforts of this world.",
          note: "Tirmidhi 36:4; Nasai 21:7",
        },
        {
          title: "The soul is taken by the Angel of Death",
          detail:
            "At the appointed time, the Angel of Death comes to extract the soul. For the believer, angels descend with white shrouds and fragrance from Paradise. For the disbeliever, they descend with coarse cloth from the Hellfire. The experience of death reflects how one lived.",
          note: "Quran 32:11; Mishkat al-Masabih 1630",
        },
        {
          title: "The grave is the first stage of the Hereafter",
          detail:
            "The Prophet (peace be upon him) said: 'The grave is the first stage of the Hereafter. If one is saved from it, then what comes after is easier. And if one is not saved from it, then what comes after is worse.' In the grave, every person is questioned by two angels about their Lord, their religion, and their prophet.",
          note: "Tirmidhi 36:5; Bukhari 23:93",
        },
      ],
      source: "Quran 29:57; Quran 32:11; Tirmidhi 36:4-5; Bukhari 23:93",
    },
  },
  {
    id: "barzakh-life",
    name: "Life in the Barzakh",
    content: {
      intro:
        "The Barzakh is the barrier between death and resurrection. In this realm, the soul experiences either comfort or punishment based on how it lived. It remains in this state until the Day of Judgement.",
      verse: {
        arabic: "وَمِن وَرَآئِهِم بَرْزَخٌ إِلَىٰ يَوْمِ يُبْعَثُونَ",
        text: "And behind them is a barrier (Barzakh) until the Day they are resurrected.",
        ref: "Quran 23:100",
      },
      points: [
        {
          title: "The believer's grave is a garden",
          detail:
            "After the believer answers the three questions correctly, their grave is expanded as far as the eye can see. A gate to Paradise is opened, and its fragrance reaches them. A man with a beautiful face says: 'I am your righteous deeds.' The believer sleeps in comfort until the Day of Resurrection.",
          note: "Abu Dawud 42:158; Tirmidhi 10:107",
        },
        {
          title: "The disbeliever's grave is a pit of fire",
          detail:
            "The disbeliever cannot answer the questions. Their grave constricts until their ribs interlock. A gate to the Hellfire is opened, and a man with a hideous face says: 'I am your wicked deeds.' Allah describes Pharaoh's people being exposed to the Fire morning and evening in their Barzakh.",
          note: "Abu Dawud 42:158; Quran 40:46",
        },
        {
          title: "Protection from the punishment of the grave",
          detail:
            "The Prophet (peace be upon him) sought refuge from the punishment of the grave in every prayer. Reciting Surah al-Mulk regularly, dying on a Friday, and martyrdom are among the means of protection mentioned in the Sunnah.",
          note: "Muslim 10:9; Tirmidhi 45:17; Tirmidhi 10:110",
        },
      ],
      source: "Quran 23:100; Quran 40:46; Abu Dawud 42:158; Muslim 10:9; Tirmidhi 10:107; Tirmidhi 45:17",
    },
  },
];

/* ───────────────────────── 10. The End Times ───────────────────────── */

const endTimesTopics: Topic[] = [
  {
    id: "minor-signs",
    name: "Minor Signs of the Hour",
    content: {
      intro:
        "The minor signs are events that occur long before the Day of Judgement — many have already been fulfilled. They serve as warnings and reminders to prepare for what is coming.",
      points: [
        {
          title: "The sending of the Prophet Muhammad (peace be upon him)",
          detail:
            "The Prophet (peace be upon him) said: 'I and the Hour have been sent like these two,' and he joined his index and middle fingers — indicating how close his mission is to the final Hour. His coming is itself a sign that the end is near.",
          note: "Bukhari 81:92",
        },
        {
          title: "Barefoot shepherds competing in tall buildings",
          detail:
            "Among the signs: 'You see barefoot, naked, destitute shepherds competing in constructing tall buildings.' This has been widely noted as fulfilled in modern times in certain regions.",
          note: "Muslim 1:1",
        },
        {
          title: "Knowledge taken away, ignorance spreads",
          detail:
            "The Prophet (peace be upon him) said: 'Among the signs of the Hour: knowledge will be taken away, ignorance will prevail, drinking of wine will be widespread, and adultery will be prevalent.'",
          note: "Bukhari 3:22; Muslim 47:11",
        },
        {
          title: "Time will pass quickly",
          detail:
            "The Prophet (peace be upon him) said: 'The Hour will not come until time passes quickly, so that a year will be like a month, a month like a week, a week like a day, a day like an hour.'",
          note: "Tirmidhi 36:29",
        },
      ],
      source: "Bukhari 3:22; Bukhari 81:92; Muslim 1:1; Muslim 47:11; Tirmidhi 36:29",
    },
  },
  {
    id: "major-signs",
    name: "Major Signs of the Hour",
    content: {
      intro:
        "The major signs are extraordinary events that will occur in rapid succession close to the end of the world — like beads falling from a broken string. They signal that the Hour is imminent.",
      points: [
        {
          title: "The Dajjal (False Messiah)",
          detail:
            "The greatest trial to face humanity. He will claim to be God and perform extraordinary feats. He is one-eyed, with 'kafir' written between his eyes. The Prophet (peace be upon him) said: 'Between the creation of Adam and the Hour, there is no greater trial than the Dajjal.'",
          note: "Muslim 54:134",
        },
        {
          title: "The descent of Isa ibn Maryam (Jesus)",
          detail:
            "Jesus (peace be upon him) will descend at the white minaret east of Damascus. He will kill the Dajjal, break the cross, abolish the jizyah, and rule with justice according to Islamic law.",
          note: "Muslim 54:134; Bukhari 60:118",
        },
        {
          title: "Ya'juj and Ma'juj (Gog and Magog)",
          detail:
            "A massive, destructive people who were sealed behind a barrier built by Dhul-Qarnayn. They will be released near the end of time and cause immense corruption, until Allah destroys them.",
          note: "Quran 18:94-98; Quran 21:96; Muslim 54:1",
        },
        {
          title: "The sun rises from the west",
          detail:
            "One of the final signs — after which the door of repentance is closed forever. The Prophet (peace be upon him) said: 'The Hour will not come until the sun rises from its place of setting. When it rises and the people see it, they will all believe — but that will be the time when belief will not benefit a soul that did not believe before.'",
          note: "Bukhari 65:234; Muslim 1:375",
        },
        {
          title: "The blowing of the Trumpet",
          detail:
            "Israfil will blow the Trumpet twice. The first blowing will cause everything to perish — every living thing in the heavens and the earth will die. The second blowing will resurrect all of creation for judgement.",
          note: "Quran 39:68",
        },
      ],
      source: "Quran 18:94-98; Quran 39:68; Bukhari 60:118; Bukhari 65:234; Muslim 1:375; Muslim 54:1; Muslim 54:134",
    },
  },
];

/* ───────────────────────── 11. Day of Judgement ───────────────────────── */

const dayOfJudgementTopics: Topic[] = [
  {
    id: "resurrection",
    name: "The Resurrection",
    content: {
      intro:
        "After the second blowing of the Trumpet, all of creation — from the first human to the last — will be resurrected and gathered on a vast plain for judgement. Every soul will stand before Allah.",
      verse: {
        arabic:
          "يَوْمَ يَقُومُ ٱلنَّاسُ لِرَبِّ ٱلْعَـٰلَمِينَ",
        text: "The Day when mankind will stand before the Lord of all the worlds.",
        ref: "Quran 83:6",
      },
      points: [
        {
          title: "All of creation gathered",
          detail:
            "Every human being who ever lived will be resurrected — barefoot, naked, and uncircumcised. The Prophet (peace be upon him) said the first to be clothed will be Ibrahim (peace be upon him). The sun will be brought close, and people will drown in their own sweat according to their deeds.",
          note: "Bukhari 60:103; Muslim 53:75",
        },
        {
          title: "A day of fifty thousand years",
          detail:
            "Allah says this day will last fifty thousand years by our reckoning. The Prophet (peace be upon him) said for the believer it will be shortened until it feels like the time between Dhuhr and Asr prayer.",
          note: "Quran 70:4; Abu Ya'la — graded Sahih by al-Albani in Sahih al-Jami' 8193",
        },
        {
          title: "The intercession (Shafa'ah)",
          detail:
            "When people cannot bear the wait, they will go from prophet to prophet begging for intercession — from Adam to Nuh to Ibrahim to Musa to Isa — and each will say 'Not me.' Finally they will come to Muhammad (peace be upon him), who will prostrate before Allah and be given permission to intercede. This is the Maqam al-Mahmud — the praised station.",
          note: "Bukhari 65:349; Muslim 1:378",
        },
      ],
      source: "Quran 70:4; Quran 83:6; Bukhari 60:103; Bukhari 65:349; Muslim 1:378; Muslim 53:75",
    },
  },
  {
    id: "reckoning",
    name: "The Reckoning & The Scales",
    content: {
      intro:
        "Every person will be given their record of deeds and will stand before Allah for their reckoning. The scales (al-Mizan) will weigh every deed with absolute precision — not an atom's weight of good or evil will be missed.",
      verse: {
        arabic:
          "وَنَضَعُ ٱلْمَوَٰزِينَ ٱلْقِسْطَ لِيَوْمِ ٱلْقِيَـٰمَةِ فَلَا تُظْلَمُ نَفْسٌۭ شَيْـًٔا",
        text: "And We place the scales of justice for the Day of Resurrection, so no soul will be treated unjustly at all.",
        ref: "Quran 21:47",
      },
      points: [
        {
          title: "The record in the right or left hand",
          detail:
            "Those who receive their record in their right hand will have an easy reckoning and return to their people in happiness. Those who receive it in their left hand or behind their back will cry out for destruction. Allah says: 'Read your record. Sufficient is yourself against you this Day as accountant.'",
          note: "Quran 17:14; Quran 69:19-29; Quran 84:7-12",
        },
        {
          title: "The weight of La ilaha illallah",
          detail:
            "The Prophet (peace be upon him) told of a man whose record contains 99 scrolls of sins, each stretching as far as the eye can see. Then a small card is brought with 'La ilaha illallah' on it. It is placed on the scale and it outweighs all 99 scrolls. Nothing is heavier than the name of Allah.",
          note: "Tirmidhi 40:22; Ibn Majah 37:200",
        },
        {
          title: "The Sirat (bridge over Hellfire)",
          detail:
            "All of creation must cross the Sirat — a bridge set over Hellfire, thinner than a hair and sharper than a sword. People will cross at different speeds: some like lightning, some like wind, some crawling — according to their deeds. Some will fall into the Fire.",
          note: "Muslim 1:360; Bukhari 81:151",
        },
      ],
      source: "Quran 17:14; Quran 21:47; Quran 69:19-29; Muslim 1:360; Tirmidhi 40:22",
    },
  },
];

/* ───────────────────────── 12. Jannah & Jahannam ───────────────────────── */

const jannahJahannamTopics: Topic[] = [
  {
    id: "jannah",
    name: "Jannah (Paradise)",
    content: {
      intro:
        "Jannah is the eternal abode of bliss — the final home of the believers. In it is what no eye has seen, no ear has heard, and no human heart has ever conceived. It is the ultimate success.",
      verse: {
        arabic:
          "فَمَن زُحْزِحَ عَنِ ٱلنَّارِ وَأُدْخِلَ ٱلْجَنَّةَ فَقَدْ فَازَ",
        text: "Whoever is drawn away from the Fire and admitted into Paradise — he has truly succeeded.",
        ref: "Quran 3:185",
      },
      points: [
        {
          title: "Beyond imagination",
          detail:
            "The Prophet (peace be upon him) said, quoting his Lord: 'I have prepared for My righteous servants what no eye has seen, no ear has heard, and no human heart has ever conceived.' The descriptions we read are only glimpses — the reality is infinitely greater.",
          note: "Bukhari 59:55; Muslim 53:3",
        },
        {
          title: "Levels upon levels",
          detail:
            "Jannah has one hundred levels. The Prophet (peace be upon him) said: 'Between each level is a distance like that between the heavens and the earth.' The highest level is al-Firdaws, directly beneath the Throne of Allah, from which the rivers of Paradise spring.",
          note: "Bukhari 56:20",
        },
        {
          title: "Rivers, palaces, and eternal youth",
          detail:
            "Its rivers flow with water, milk, wine, and honey. Its soil is musk, its pebbles are pearls and rubies. Its people will never age, never fall ill, never sleep, and never die. They will be in a state of perpetual bliss, reunion with loved ones, and closeness to their Lord.",
          note: "Quran 47:15; Tirmidhi 38:4; Muslim 53:19",
        },
        {
          title: "The greatest reward: seeing Allah",
          detail:
            "The greatest of all rewards in Jannah is seeing the Face of Allah. The Prophet (peace be upon him) said: 'When the people of Paradise enter Paradise, Allah will say: Do you want anything more? They will say: Have You not brightened our faces? Then the veil will be lifted, and nothing they were given will be more beloved than looking at their Lord.'",
          note: "Muslim 1:88; Quran 75:22-23",
        },
      ],
      source: "Quran 3:185; Quran 47:15; Quran 75:22-23; Bukhari 56:20; Bukhari 59:55; Muslim 1:88; Muslim 53:3",
    },
  },
  {
    id: "jahannam",
    name: "Jahannam (Hellfire)",
    content: {
      intro:
        "Jahannam is the abode of punishment — prepared for those who rejected Allah, persisted in disbelief, and died without repentance. It is described in terrifying detail in the Quran and Sunnah as a warning to mankind.",
      verse: {
        arabic:
          "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ قُوٓا۟ أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًۭا وَقُودُهَا ٱلنَّاسُ وَٱلْحِجَارَةُ",
        text: "O you who believe, protect yourselves and your families from a Fire whose fuel is people and stones.",
        ref: "Quran 66:6",
      },
      points: [
        {
          title: "Its depth and intensity",
          detail:
            "The Prophet (peace be upon him) said: 'If a stone were dropped from the edge of Hellfire, it would travel for seventy years before reaching the bottom.' Its fire is seventy times hotter than the fire of this world. Its fuel is people and stones.",
          note: "Muslim 53:36; Tirmidhi 39:17",
        },
        {
          title: "Levels of punishment",
          detail:
            "Jahannam has levels, and each person is placed according to the severity of their sins. The hypocrites are in the lowest depths. Allah says: 'Indeed, the hypocrites will be in the lowest depths of the Fire — and never will you find for them a helper.'",
          note: "Quran 4:145",
        },
        {
          title: "It will be filled",
          detail:
            "Allah will say to Hellfire: 'Are you filled?' And it will say: 'Are there any more?' Until Allah places His foot upon it and it will say: 'Enough, enough!' — and its parts will draw together. Allah has sworn: 'I will surely fill Hellfire with jinn and people, all together.'",
          note: "Bukhari 65:355; Quran 11:119; Quran 32:13",
        },
        {
          title: "Mercy for the sinful believers",
          detail:
            "Some Muslims who committed major sins may enter the Hellfire temporarily as purification, but they will eventually be removed by the intercession of the Prophet (peace be upon him) and the mercy of Allah. 'Whoever has in his heart even a mustard seed's weight of faith will be taken out of the Fire.'",
          note: "Bukhari 2:30; Muslim 1:377",
        },
      ],
      source: "Quran 4:145; Quran 11:119; Quran 66:6; Bukhari 2:30; Bukhari 65:355; Muslim 1:377; Muslim 53:68",
    },
  },
  {
    id: "eternal-end",
    name: "The Eternal End",
    content: {
      intro:
        "After the people of Jannah and Jahannam have entered their respective abodes, death itself will be brought in the form of a ram and slaughtered between the two. Then it will be announced: eternal life, no more death — forever.",
      verse: {
        arabic:
          "وَنَادَوْا۟ يَـٰمَـٰلِكُ لِيَقْضِ عَلَيْنَا رَبُّكَ ۖ قَالَ إِنَّكُم مَّـٰكِثُونَ",
        text: "And they will call out: O Malik, let your Lord put an end to us. He will say: Indeed, you are to remain.",
        ref: "Quran 43:77",
      },
      points: [
        {
          title: "Death will be slaughtered",
          detail:
            "The Prophet (peace be upon him) said: 'Death will be brought on the Day of Resurrection in the form of a black and white ram. A caller will say: O people of Paradise! — and they will crane their necks and look. He will say: Do you know what this is? They will say: Yes, this is death. Then a caller will say: O people of Hellfire! They will crane their necks and look. Then the ram will be slaughtered and the caller will say: O people of Paradise — eternity, no more death. O people of the Fire — eternity, no more death.'",
          note: "Bukhari 65:373; Muslim 53:50",
        },
        {
          title: "The people of Jannah will rejoice",
          detail:
            "The Prophet (peace be upon him) said: 'The people of Paradise will increase in joy, and the people of the Fire will increase in grief.' Knowing that death is gone forever means the bliss of Paradise will never end — and neither will the punishment of the Fire for those who earned it.",
          note: "Bukhari 65:373; Muslim 53:50",
        },
        {
          title: "The ultimate conclusion",
          detail:
            "This is where the story of creation ends — and eternity begins. Everything that was written on the Preserved Tablet will have come to pass. Every soul will be in the abode it earned. And Allah's words will be fulfilled: 'Is not He who created the heavens and the earth able to create the likes of them? Yes indeed. And He is the Knowing Creator.'",
          note: "Quran 36:81",
        },
      ],
      source: "Quran 36:81; Quran 43:77; Bukhari 65:373; Muslim 53:50",
    },
  },
];

/* ───────────────────────── Tab → Data mapping ───────────────────────── */

const tabDataMap: Record<TabKey, { topics: Topic[]; sources: { ref: string; desc: string }[] }> = {
  "before-creation": {
    topics: beforeCreationTopics,
    sources: [
      { ref: "Quran 22:70", desc: "Allah knows what is in the heaven and the earth" },
      { ref: "Quran 35:15", desc: "You are those in need of Allah" },
      { ref: "Quran 36:82", desc: "His command is only 'Be' and it is" },
      { ref: "Quran 57:3", desc: "He is the First and the Last" },
      { ref: "Quran 59:24", desc: "He is the Creator, the Originator, the Fashioner" },
      { ref: "Tirmidhi 48:31", desc: "You are the First, there was nothing before You" },
    ],
  },
  "pen-tablet": {
    topics: penTabletTopics,
    sources: [
      { ref: "Quran 6:38", desc: "We have not neglected in the Register a thing" },
      { ref: "Quran 68:1", desc: "Nun. By the Pen and what they inscribe" },
      { ref: "Quran 85:21-22", desc: "A glorious Quran in a Preserved Tablet" },
      { ref: "Tirmidhi 32:23", desc: "The first thing Allah created was the Pen" },
      { ref: "Muslim 46:27", desc: "Allah wrote the decrees 50,000 years before creation" },
      { ref: "Tirmidhi 32:23", desc: "Write the decree of everything until the Hour" },
      { ref: "Tirmidhi 37:102", desc: "The pens have been lifted and the pages have dried" },
    ],
  },
  "throne-water": {
    topics: throneWaterTopics,
    sources: [
      { ref: "Quran 2:255", desc: "Ayat al-Kursi" },
      { ref: "Quran 7:54", desc: "He rose over the Throne" },
      { ref: "Quran 11:7", desc: "His Throne was upon the water" },
      { ref: "Quran 21:30", desc: "We made from water every living thing" },
      { ref: "Quran 40:7", desc: "Those who carry the Throne glorify Allah" },
      { ref: "Bukhari 59:2", desc: "Allah existed and nothing else existed before Him" },
      { ref: "Abu Dawud 42:132", desc: "The immensity of the Throne-bearing angels" },
    ],
  },
  "heavens-earth": {
    topics: heavensEarthTopics,
    sources: [
      { ref: "Quran 7:54", desc: "Created the heavens and the earth in six days" },
      { ref: "Quran 37:6-10", desc: "Stars as missiles against eavesdropping devils" },
      { ref: "Quran 41:9-12", desc: "Detailed breakdown of the six days of creation" },
      { ref: "Quran 50:38", desc: "No weariness touched Us" },
      { ref: "Quran 67:5", desc: "Adorned the nearest heaven with lamps" },
      { ref: "Quran 71:15-16", desc: "Seven heavens in layers" },
      { ref: "Bukhari 59:10; Muslim 1:309", desc: "The Prophet's journey through the heavens" },
    ],
  },
  angels: {
    topics: angelsTopics,
    sources: [
      { ref: "Quran 2:97-98", desc: "Jibril and Mika'il" },
      { ref: "Quran 32:11", desc: "The Angel of Death" },
      { ref: "Quran 35:1", desc: "Angels with wings, two or three or four" },
      { ref: "Quran 50:17-18", desc: "The two recording angels" },
      { ref: "Quran 66:6", desc: "They do not disobey Allah" },
      { ref: "Muslim 55:78", desc: "Angels were created from light" },
      { ref: "Bukhari 59:10; Bukhari 59:17", desc: "Angels in the heavens; Jibril's six hundred wings" },
      { ref: "Ibn Majah 37:91", desc: "The heavens are creaking with angels" },
    ],
  },
  jinn: {
    topics: jinnTopics,
    sources: [
      { ref: "Quran 7:12-17", desc: "Iblis's arrogance and vow" },
      { ref: "Quran 14:22", desc: "Satan will disown his followers" },
      { ref: "Quran 15:27-42", desc: "Creation of jinn; Iblis's refusal and expulsion" },
      { ref: "Quran 18:50", desc: "Iblis was of the jinn" },
      { ref: "Quran 51:56", desc: "Created jinn and mankind to worship" },
      { ref: "Quran 55:15", desc: "Created from a smokeless flame of fire" },
      { ref: "Quran 72:11-14", desc: "Among the jinn are Muslims and deviators" },
    ],
  },
  "adam-hawa": {
    topics: adamHawaTopics,
    sources: [
      { ref: "Quran 2:30-38", desc: "Adam as khalifah; the fall and descent" },
      { ref: "Quran 4:1", desc: "Created you from one soul and its mate" },
      { ref: "Quran 7:19-25", desc: "The tree, the fall, and the repentance" },
      { ref: "Quran 15:28-31", desc: "Created from clay; the angels prostrated" },
      { ref: "Quran 38:71-76", desc: "Created with Allah's hands" },
      { ref: "Quran 95:4", desc: "Created man in the best of forms" },
      { ref: "Bukhari 79:1", desc: "Adam was created sixty cubits tall" },
    ],
  },
  "life-on-earth": {
    topics: lifeOnEarthTopics,
    sources: [
      { ref: "Quran 2:286", desc: "No soul is burdened beyond its capacity" },
      { ref: "Quran 16:36", desc: "A messenger sent to every nation" },
      { ref: "Quran 29:2-3", desc: "Do people think they will not be tested?" },
      { ref: "Quran 33:40", desc: "Muhammad is the seal of the prophets" },
      { ref: "Quran 51:56", desc: "Created to worship" },
      { ref: "Quran 67:2", desc: "Created death and life to test you" },
      { ref: "Quran 99:7-8", desc: "An atom's weight of good or evil" },
      { ref: "Bukhari 75:1", desc: "No fatigue or harm befalls a Muslim except..." },
      { ref: "Muslim 53:55", desc: "This world compared to the Hereafter" },
    ],
  },
  "death-grave": {
    topics: deathGraveTopics,
    sources: [
      { ref: "Quran 23:100", desc: "Behind them is a Barzakh" },
      { ref: "Quran 29:57", desc: "Every soul will taste death" },
      { ref: "Quran 32:11", desc: "The angel of death will take your souls" },
      { ref: "Quran 40:46", desc: "Pharaoh's people exposed to Fire morning and evening" },
      { ref: "Bukhari 23:93", desc: "The questioning in the grave" },
      { ref: "Muslim 10:9", desc: "Seeking refuge from the punishment of the grave" },
      { ref: "Tirmidhi 36:4-5", desc: "Remember death often; the grave is the first stage" },
      { ref: "Tirmidhi 45:17", desc: "Surah al-Mulk intercedes" },
    ],
  },
  "end-times": {
    topics: endTimesTopics,
    sources: [
      { ref: "Quran 18:94-98", desc: "Ya'juj and Ma'juj" },
      { ref: "Quran 39:68", desc: "The two blowings of the Trumpet" },
      { ref: "Bukhari 3:22", desc: "Knowledge taken away, ignorance spreads" },
      { ref: "Bukhari 60:118", desc: "The descent of Isa" },
      { ref: "Bukhari 65:234", desc: "The sun rises from the west" },
      { ref: "Bukhari 81:92", desc: "I and the Hour have been sent like these two" },
      { ref: "Muslim 1:1", desc: "Hadith of Jibril: signs of the Hour" },
      { ref: "Muslim 54:134", desc: "The Dajjal; the descent of Isa" },
    ],
  },
  "day-of-judgement": {
    topics: dayOfJudgementTopics,
    sources: [
      { ref: "Quran 17:14", desc: "Read your record" },
      { ref: "Quran 21:47", desc: "The scales of justice" },
      { ref: "Quran 69:19-29", desc: "The record in the right or left hand" },
      { ref: "Quran 70:4", desc: "A day the measure of fifty thousand years" },
      { ref: "Quran 83:6", desc: "The Day mankind stands before the Lord" },
      { ref: "Bukhari 60:103", desc: "Resurrected barefoot, naked, uncircumcised" },
      { ref: "Bukhari 65:349", desc: "The great intercession" },
      { ref: "Muslim 1:378; Muslim 1:382", desc: "Intercession; the Sirat" },
      { ref: "Tirmidhi 40:22", desc: "The card of La ilaha illallah" },
    ],
  },
  "jannah-jahannam": {
    topics: jannahJahannamTopics,
    sources: [
      { ref: "Quran 3:185", desc: "Whoever is admitted to Paradise has truly succeeded" },
      { ref: "Quran 4:145", desc: "The hypocrites in the lowest depths of the Fire" },
      { ref: "Quran 36:81", desc: "Is He not able to create the likes of them?" },
      { ref: "Quran 43:77", desc: "O Malik, let your Lord put an end to us" },
      { ref: "Quran 47:15", desc: "Rivers of water, milk, wine, and honey" },
      { ref: "Quran 75:22-23", desc: "Faces that Day will be radiant, looking at their Lord" },
      { ref: "Bukhari 2:30", desc: "Whoever has a mustard seed of faith" },
      { ref: "Bukhari 56:20", desc: "Paradise has one hundred levels" },
      { ref: "Bukhari 65:373; Muslim 53:50", desc: "Death will be slaughtered" },
      { ref: "Muslim 1:88", desc: "The greatest reward: seeing Allah" },
      { ref: "Muslim 53:36", desc: "The depth and heat of the Hellfire" },
    ],
  },
};

/* ───────────────────────── go deeper ───────────────────────── */

/* The four afterlife stages have dedicated pages — link out at the bottom */
const goDeeperLinks: Partial<Record<TabKey, { href: string; label: string }>> = {
  "death-grave": { href: "/barzakh", label: "Go deeper: Barzakh — the grave in detail" },
  "end-times": { href: "/day-of-judgement", label: "Go deeper: Day of Judgement — the signs of the Hour in detail" },
  "day-of-judgement": { href: "/day-of-judgement", label: "Go deeper: Day of Judgement — the events of the Day in detail" },
  "jannah-jahannam": { href: "/jannah", label: "Go deeper: Jannah — Paradise in detail" },
};

/* ───────────────────────── page ───────────────────────── */

function StoryOfCreationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useScrollToSection();
  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "before-creation"
  );
  // Deep-link support: ?sub=<topic id> (old ?section= accepted as a mount-time alias)
  const [activeTopicMap, setActiveTopicMap] = useState<Record<string, string>>(() => {
    const tab = (searchParams.get("tab") as TabKey) || "before-creation";
    const sub = searchParams.get("sub") ?? searchParams.get("section");
    return sub && tabDataMap[tab]?.topics.some((t) => t.id === sub) ? { [tab]: sub } : {};
  });

  const currentData = tabDataMap[activeTab];
  const activeTopic =
    activeTopicMap[activeTab] || currentData.topics[0]?.id || "";

  // Keep ?tab= / ?sub= in sync so the current view is shareable
  const syncUrl = (tab: TabKey, sub?: string) => {
    router.replace(sub ? `${pathname}?tab=${tab}&sub=${sub}` : `${pathname}?tab=${tab}`, { scroll: false });
  };

  const setActiveTopic = (id: string) => {
    setActiveTopicMap((prev) => ({ ...prev, [activeTab]: id }));
    syncUrl(activeTab, id);
  };

  // Get tab index for progress indicator
  const currentTabIndex = tabs.findIndex((t) => t.key === activeTab);

  return (
    <div>
      <PageHeader
        title="Story of Creation"
        titleAr="قصة الخلق"
        subtitle="The complete journey — from before anything existed, to the eternal life that awaits."
      />

      {/* Tab navigation — the 12 numbered stages WRAP into rows (no horizontal
          scroll, no mobile dropdown): the whole journey map stays visible,
          which is the point of this page. */}
      <TabBar
        tabs={tabs.map((tab, i) => ({
          key: tab.key,
          label: `${i + 1}. ${tab.label}`,
        }))}
        activeTab={activeTab}
        onTabChange={(k) => {
          setActiveTab(k as TabKey);
          syncUrl(k as TabKey);
        }}
        wrap
        mobileThreshold={12}
        className="mb-2"
      />

      {/* Progress bar — below pills */}
      <div className="mb-6">
        <div className="h-1 rounded-full bg-themed-muted/10 overflow-hidden">
          <motion.div
            className="h-full bg-gold/60 rounded-full"
            initial={false}
            animate={{ width: `${((currentTabIndex + 1) / tabs.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
        <p className="text-xs text-themed-muted text-right mt-1.5">
          {currentTabIndex + 1} of {tabs.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Sub-topic navigation + content */}
          {currentData.topics.length > 1 ? (
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left — vertical pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-52 w-full shrink-0">
                {currentData.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopic(topic.id)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium md:whitespace-normal whitespace-nowrap transition-all text-left ${
                      activeTopic === topic.id
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>

              {/* Right — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {currentData.topics.map(
                    (topic) =>
                      activeTopic === topic.id && (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <TopicInfoCard topic={topic} showSource={false} />
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* Single topic — no sub-nav needed */
            <TopicInfoCard topic={currentData.topics[0]} />
          )}

          {/* Sources */}
          <SourcesCard sources={currentData.sources} className="mt-8" />

          {/* Go deeper — dedicated page for this stage */}
          {goDeeperLinks[activeTab] && (
            <Link href={goDeeperLinks[activeTab]!.href} className="block mt-4 group">
              <ContentCard>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-themed">
                    {goDeeperLinks[activeTab]!.label}
                  </span>
                  <ArrowRight size={16} className="text-gold shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </ContentCard>
            </Link>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function StoryOfCreationPage() {
  return (
    <Suspense>
      <StoryOfCreationContent />
    </Suspense>
  );
}
