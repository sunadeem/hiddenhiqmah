"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import ContentCard from "@/components/ContentCard";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { textMatch } from "@/lib/search";
import { BookOpen } from "lucide-react";

/* ───────────────────────── data ───────────────────────── */

const whyItMatters = [
  {
    point: "The ultimate purpose of life",
    detail:
      "Everything in Islam — prayer, fasting, charity, patience, good character — points toward one ultimate goal: earning the pleasure of Allah and entering Jannah. It is the destination that gives meaning to every test and trial in this life.",
    reference: "Quran 3:185 — 'Every soul will taste death, and you will only receive your full reward on the Day of Resurrection. Whoever is drawn away from the Fire and admitted into Paradise has truly succeeded. The life of this world is merely an illusory enjoyment.'",
  },
  {
    point: "What no eye has seen",
    detail:
      "The Prophet (peace be upon him) said, quoting his Lord: 'I have prepared for My righteous servants what no eye has seen, no ear has heard, and no human heart has ever conceived.' The reality of Jannah is beyond human imagination — the descriptions in the Quran and Sunnah are only glimpses.",
    reference: "Sahih al-Bukhari 3244; Sahih Muslim 2824; also in Quran 32:17",
  },
  {
    point: "It is near — closer than your shoelace",
    detail:
      "The Prophet (peace be upon him) said: 'Paradise is closer to any of you than the strap of his sandal, and the same applies to the Hellfire.' Every small act of goodness can bring a person closer to Jannah.",
    reference: "Sahih al-Bukhari 6488",
  },
  {
    point: "The mercy of Allah encompasses it",
    detail:
      "No one enters Jannah by their deeds alone — it is by the mercy of Allah. The Prophet (peace be upon him) said: 'None of you will enter Paradise by his deeds alone.' They said: 'Not even you, O Messenger of Allah?' He said: 'Not even me, unless Allah envelops me in His mercy.'",
    reference: "Sahih al-Bukhari 5673; Sahih Muslim 2816",
  },
  {
    point: "Its inhabitants will live forever",
    detail:
      "There is no death in Jannah, no aging, no sickness, no sorrow. Its people will live in eternal bliss. Allah says: 'They will not taste death therein except the first death, and He will have protected them from the punishment of Hellfire.'",
    reference: "Quran 44:56; Sahih Muslim 2849 (death will be slaughtered between Jannah and the Fire)",
  },
  {
    point: "The greatest reward: seeing the Face of Allah",
    detail:
      "The people of Jannah will be granted the greatest of all blessings — looking upon the Face of their Lord. The Prophet (peace be upon him) said: 'When the people of Paradise enter Paradise, Allah will say: Do you want anything more? They will say: Have You not brightened our faces? Have You not admitted us to Paradise and saved us from the Fire? Then the veil will be lifted, and nothing they were given will be more beloved to them than looking at their Lord.'",
    reference: "Sahih Muslim 181; Quran 75:22-23",
  },
];

type DescriptionTopic = {
  id: string;
  name: string;
  content: {
    intro: string;
    points: { title: string; detail: string; note?: string }[];
    verse?: { arabic: string; text: string; ref: string };
    source?: string;
  };
};

const descriptionTopics: DescriptionTopic[] = [
  {
    id: "rivers-gardens",
    name: "Rivers & Gardens",
    content: {
      intro:
        "The Quran describes Jannah as 'gardens beneath which rivers flow' — a phrase repeated over 30 times. These are not ordinary rivers or gardens, but creations beyond anything in this world.",
      verse: {
        arabic:
          "فِيهَآ أَنْهَـٰرٌۭ مِّن مَّآءٍ غَيْرِ ءَاسِنٍۢ وَأَنْهَـٰرٌۭ مِّن لَّبَنٍۢ لَّمْ يَتَغَيَّرْ طَعْمُهُۥ وَأَنْهَـٰرٌۭ مِّنْ خَمْرٍۢ لَّذَّةٍۢ لِّلشَّـٰرِبِينَ وَأَنْهَـٰرٌۭ مِّنْ عَسَلٍۢ مُّصَفًّۭى",
        text: "In it are rivers of water unaltered, rivers of milk the taste of which never changes, rivers of wine delicious to those who drink, and rivers of purified honey.",
        ref: "Quran 47:15",
      },
      points: [
        {
          title: "Four types of rivers",
          detail:
            "The rivers of Jannah flow with four substances: pure water that never becomes stale, milk whose taste never changes, wine that is delightful without intoxication or harm, and clear purified honey. In Paradise there is a sea of water, a sea of honey, a sea of milk, and a sea of wine, and the rivers branch off from them.",
          note: "Quran 47:15; Sunan at-Tirmidhi 2571",
        },
        {
          title: "Al-Kawthar",
          detail:
            "Al-Kawthar is a river in Jannah granted exclusively to the Prophet Muhammad (peace be upon him). On its two banks are tents of hollow pearls, and its scent is of sharp musk. Its water is whiter than milk and sweeter than honey, and its drinking vessels are as numerous as the stars.",
          note: "Sahih al-Bukhari 6581; Sahih Muslim 2300; Sahih Muslim 400; Quran 108:1",
        },
        {
          title: "Trees and shade",
          detail:
            "The trees of Jannah are immense. The Prophet (peace be upon him) said: 'In Paradise there is a tree under whose shade a rider could travel for a hundred years and not cross it.' Their fruits hang low and are always within reach.",
          note: "Sahih al-Bukhari 3251; Sahih Muslim 2826; Quran 56:28-30",
        },
        {
          title: "The soil and fragrance",
          detail:
            "The Prophet (peace be upon him) described the soil of Paradise as fine white musk and its pebbles as pearls and rubies. In another narration, the soil is described as saffron, its mortar as fragrant musk, and its bricks as gold and silver.",
          note: "Sahih Muslim 2928; Sunan at-Tirmidhi 2526",
        },
      ],
      source:
        "Quran 47:15; Quran 56:28-34; Sahih al-Bukhari 3251, 6581; Sahih Muslim 400, 2300, 2826, 2928; Sunan at-Tirmidhi 2526, 2571",
    },
  },
  {
    id: "dwellings",
    name: "Dwellings",
    content: {
      intro:
        "The dwellings of Jannah range from grand palaces to lofty rooms built upon rooms, each described in extraordinary detail by the Prophet (peace be upon him). Every believer will have a home beyond imagination.",
      points: [
        {
          title: "Palaces of gold and silver",
          detail:
            "The Prophet (peace be upon him) described Paradise: 'Its bricks are of gold and silver, its mortar is fragrant musk, its pebbles are pearls and rubies, and its soil is saffron. Whoever enters it will enjoy bliss and never be miserable, will live forever and never die, their clothes will never wear out, and their youth will never fade.'",
          note: "Sunan at-Tirmidhi 2526 (graded Sahih li-shawahidihi by al-Albani via Mishkat 5630); also transmitted by Ahmad and ad-Darimi",
        },
        {
          title: "Rooms built upon rooms",
          detail:
            "Allah describes lofty chambers (ghuraf) — rooms built upon rooms, beneath which rivers flow. The Prophet (peace be upon him) said: 'The people of Paradise will see the dwellers of the upper rooms as you see a distant star in the sky, because of the difference in their degrees.'",
          note: "Quran 39:20; Sahih al-Bukhari 3256; Sahih Muslim 2831",
        },
        {
          title: "Tents of hollow pearls",
          detail:
            "The Prophet (peace be upon him) said: 'The believer in Paradise will have a tent made of a single hollowed-out pearl, sixty miles wide. In each corner of it, there will be a wife whom the others cannot see, and the believer will visit each of them.'",
          note: "Sahih al-Bukhari 4879; Sahih Muslim 2838",
        },
        {
          title: "The vastness of each person's kingdom",
          detail:
            "The lowest in rank among the people of Paradise will be given ten times the like of this entire world. They will have whatever their soul desires and their eyes delight in. Some narrations describe the last person to enter Paradise as receiving a kingdom greater than the world and everything in it.",
          note: "Sahih Muslim 188; Sahih al-Bukhari 6571",
        },
      ],
      source:
        "Quran 39:20; Sahih al-Bukhari 3256, 4879, 6571; Sahih Muslim 188, 2831, 2838; Sunan at-Tirmidhi 2526",
    },
  },
  {
    id: "food-drink",
    name: "Food & Drink",
    content: {
      intro:
        "The food and drink of Jannah are described in vivid detail — not for sustenance (there is no hunger), but for pure pleasure and delight. Everything is available in abundance, instantly, and in forms never seen in this world.",
      points: [
        {
          title: "Fruits in pairs",
          detail:
            "Allah describes fruits of every kind, presented in pairs, and fruits that are familiar yet entirely different from what exists in this world. Ibn Abbas said: 'Nothing in Paradise resembles anything in this world except in name.' The fruits are always in season and never out of reach.",
          note: "Quran 55:52, 56:20-21, 2:25",
        },
        {
          title: "Meat of any kind they desire",
          detail:
            "The people of Jannah will have the meat of birds — any kind they wish — served to them. There is no cooking, no preparation, no effort — only enjoyment.",
          note: "Quran 56:21 — 'And the meat of fowl, from whatever they desire.'",
        },
        {
          title: "Wine without intoxication",
          detail:
            "The wine of Paradise is pure — it does not cause intoxication, headache, or loss of reason. It is 'white, delicious to the drinkers; no bad effect is there in it, nor from it will they be intoxicated.' It is served in cups by immortal youths.",
          note: "Quran 37:45-47, 56:17-19, 76:15-17",
        },
        {
          title: "Springs of Tasnim and Salsabil",
          detail:
            "Among the finest drinks of Paradise are two named springs: Tasnim — the highest spring, from which the closest to Allah drink directly — and Salsabil — a spring of ginger-flavored drink. There is also Kafur — a spring scented with camphor.",
          note: "Quran 83:27-28 (Tasnim), 76:18 (Salsabil), 76:5 (Kafur)",
        },
      ],
      source:
        "Quran 2:25, 37:45-47, 55:52, 56:17-21, 76:5-18, 83:27-28",
    },
  },
  {
    id: "companions",
    name: "Companions & Family",
    content: {
      intro:
        "Jannah is not a place of solitude — it is a place of reunion, love, and companionship. Believers will be with their families, their loved ones, and in the company of the prophets and the righteous.",
      points: [
        {
          title: "Reuniting with family",
          detail:
            "Allah will join believing family members together in Paradise, even elevating the rank of children or parents to match the highest among them, so that they may be together. 'And those who believed and whose descendants followed them in faith — We will join with them their descendants, and We will not deprive them of anything of their deeds.'",
          note: "Quran 52:21; Quran 13:23 — 'Gardens of perpetual residence; they will enter them with whoever were righteous among their fathers, spouses, and descendants.'",
        },
        {
          title: "Spouses of Jannah",
          detail:
            "Believing spouses who enter Jannah together will be reunited in a state of perfect love, beauty, and youth. There will be no jealousy, no arguments, no ill feelings — only pure affection. Allah also describes the Hur al-'Ayn — companions of Paradise with beautiful eyes, created specifically for the people of Jannah.",
          note: "Quran 44:54, 55:70-74, 56:35-37; Sahih Muslim 2834",
        },
        {
          title: "No envy, no ill will",
          detail:
            "One of the first things removed from the hearts of the people of Jannah is any rancor or envy. They will be 'brothers, on thrones facing each other.' There is only love, contentment, and peace between them.",
          note: "Quran 15:47; Sahih al-Bukhari 3245",
        },
        {
          title: "In the company of the prophets",
          detail:
            "Those who obey Allah and His Messenger will be with the prophets, the truthful, the martyrs, and the righteous. The Prophet (peace be upon him) told a companion who asked about being with him in Paradise: 'You will be with those whom you love.'",
          note: "Quran 4:69; Sahih al-Bukhari 3688; Sahih Muslim 2639",
        },
      ],
      source:
        "Quran 4:69, 13:23, 15:47, 44:54, 52:21, 55:70-74; Sahih al-Bukhari 3245, 3688; Sahih Muslim 2639, 2834",
    },
  },
  {
    id: "greatest-reward",
    name: "The Greatest Reward",
    content: {
      intro:
        "Above all the rivers, palaces, fruits, and companions, the greatest blessing of Jannah — the one that surpasses everything else — is seeing the Face of Allah, the Lord of all creation.",
      verse: {
        arabic: "وُجُوهٌۭ يَوْمَئِذٍۢ نَّاضِرَةٌ ۝ إِلَىٰ رَبِّهَا نَاظِرَةٌۭ",
        text: "Some faces, that Day, will be radiant, looking at their Lord.",
        ref: "Quran 75:22-23",
      },
      points: [
        {
          title: "The lifting of the veil",
          detail:
            "The Prophet (peace be upon him) said: 'When the people of Paradise enter Paradise, Allah will say: Do you want anything more? They will say: Have You not brightened our faces? Have You not admitted us to Paradise and saved us from the Fire? Then the veil will be lifted, and nothing they were given will be more beloved to them than looking at their Lord, the Exalted and Majestic.' Then the Prophet recited: 'For those who have done good is the best reward and even more.' (Quran 10:26)",
          note: "Sahih Muslim 181",
        },
        {
          title: "The 'extra' (al-Ziyadah)",
          detail:
            "In the verse 'For those who have done good is the best reward and even more (ziyadah)' (Quran 10:26), the Prophet (peace be upon him) explained that 'the best reward' is Paradise, and 'even more' (al-ziyadah) is looking at the Face of Allah. This is the greatest pleasure of Jannah — greater than all its physical blessings combined.",
          note: "Sahih Muslim 181; Sunan at-Tirmidhi 2552",
        },
        {
          title: "The people of the highest level",
          detail:
            "The believers will see their Lord in Paradise as clearly as they see the full moon — without any difficulty. Those most honoured by Allah will look upon His Face morning and evening. This closeness to Allah is what truly differentiates the levels of Jannah.",
          note: "Sahih al-Bukhari 7434; Sunan at-Tirmidhi 2553 (regarding morning and evening)",
        },
        {
          title: "Allah's pleasure — the greatest of all",
          detail:
            "Allah will say to the people of Paradise: 'O people of Paradise!' They will say: 'Here we are, our Lord!' He will say: 'Are you pleased?' They will say: 'How could we not be pleased when You have given us what You have not given anyone else?' He will say: 'I will give you something even better.' They will ask: 'What could be better?' He will say: 'I bestow upon you My pleasure (ridwan), and I shall never be angry with you after this.'",
          note: "Sahih al-Bukhari 6549; Sahih Muslim 2829",
        },
      ],
      source:
        "Quran 10:26, 75:22-23; Sahih al-Bukhari 6549, 7434; Sahih Muslim 181, 2829; Sunan at-Tirmidhi 2552, 2553",
    },
  },
];

type HowToTopic = {
  id: string;
  name: string;
  content: {
    intro: string;
    points: { title: string; detail: string; note?: string }[];
    source?: string;
  };
};

const howToTopics: HowToTopic[] = [
  {
    id: "conditions",
    name: "The Conditions",
    content: {
      intro:
        "Entry into Jannah requires two fundamental things: sincere faith (iman) and righteous deeds ('amal salih). Neither is sufficient without the other, and both are ultimately accepted through the mercy of Allah.",
      points: [
        {
          title: "Tawhid — the key to Jannah",
          detail:
            "The absolute prerequisite for entering Jannah is tawhid — believing in the oneness of Allah and not associating any partners with Him. The Prophet (peace be upon him) said: 'Whoever dies knowing that there is no god but Allah will enter Paradise.' Shirk (associating partners with Allah) is the only sin that Allah will not forgive if a person dies upon it.",
          note: "Sahih Muslim 26; Quran 4:48",
        },
        {
          title: "Faith and righteous deeds together",
          detail:
            "Throughout the Quran, Allah pairs faith with righteous deeds over 50 times: 'Those who believe and do righteous deeds — they are the companions of Paradise.' Faith without action is incomplete, and action without sincerity is rejected.",
          note: "Quran 2:82; Quran 4:124; Quran 103:1-3",
        },
        {
          title: "Sincerity (Ikhlas)",
          detail:
            "All deeds must be done sincerely for the sake of Allah alone. The Prophet (peace be upon him) said: 'Actions are judged by intentions, and every person will be rewarded according to what they intended.' A deed done for showing off or worldly gain has no reward with Allah.",
          note: "Sahih al-Bukhari 1; Sahih Muslim 1907",
        },
        {
          title: "The mercy of Allah",
          detail:
            "Ultimately, no one enters Paradise by their deeds alone — it is by Allah's mercy. Deeds are the means, but mercy is the cause. The Prophet (peace be upon him) said: 'Do good deeds properly, sincerely and moderately... and always adopt a middle, moderate course, whereby you will reach your target (Paradise).'",
          note: "Sahih al-Bukhari 6463; Sahih al-Bukhari 5673",
        },
      ],
      source:
        "Quran 2:82, 4:48, 4:124; Sahih al-Bukhari 1, 5673, 6463; Sahih Muslim 26, 1907",
    },
  },
  {
    id: "deeds",
    name: "Deeds That Lead to It",
    content: {
      intro:
        "The Prophet (peace be upon him) mentioned specific deeds that lead to Jannah. These are not exhaustive, but they show the breadth of actions that earn Paradise — from major acts of worship to simple words and daily kindness.",
      points: [
        {
          title: "The five pillars",
          detail:
            "A man asked the Prophet: 'Tell me of a deed that will admit me to Paradise.' He said: 'Worship Allah and associate nothing with Him, establish the prayer, pay the zakah, and fast Ramadan.' The man asked: 'Is there anything else?' He said: 'Maintain the ties of kinship.'",
          note: "Sahih al-Bukhari 1397; Sahih Muslim 13",
        },
        {
          title: "Good character",
          detail:
            "The Prophet (peace be upon him) said: 'The most common thing that will admit people to Paradise is taqwa (God-consciousness) and good character.' In another hadith: 'I guarantee a house in the highest part of Paradise for one who has good manners.'",
          note: "Sunan at-Tirmidhi 2004; Sunan Abu Dawud 4800",
        },
        {
          title: "Saying SubhanAllah, Alhamdulillah, and La ilaha illallah",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever says SubhanAllahi wa bihamdihi (Glory and praise be to Allah) 100 times a day will have his sins forgiven even if they were like the foam of the sea.' He also said: 'There are two statements that are light on the tongue, heavy on the scale, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil-Azeem.'",
          note: "Sahih al-Bukhari 6405, 6406; Sahih Muslim 2692",
        },
        {
          title: "Caring for orphans",
          detail:
            "The Prophet (peace be upon him) said: 'I and the one who sponsors an orphan will be like these two in Paradise' — and he held up his index and middle fingers together.",
          note: "Sahih al-Bukhari 5304",
        },
        {
          title: "Building a masjid",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever builds a masjid for the sake of Allah, Allah will build for him a house in Paradise.'",
          note: "Sahih al-Bukhari 450; Sahih Muslim 533",
        },
        {
          title: "Patience in trials",
          detail:
            "The Prophet (peace be upon him) said: 'No Muslim is afflicted with harm — whether it be a thorn prick or something greater — except that Allah expiates some of his sins because of it, as a tree sheds its leaves.' And: 'Whoever loses two children (who die before puberty), they will be a shield for him from the Fire.'",
          note: "Sahih al-Bukhari 5648; Sahih Muslim 2632",
        },
        {
          title: "The 12 sunnah rak'at daily",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever prays 12 rak'at during the day and night (the sunnah prayers), a house will be built for him in Paradise.'",
          note: "Sahih Muslim 728; Sunan at-Tirmidhi 415",
        },
      ],
      source:
        "Sahih al-Bukhari 450, 1397, 5304, 5648, 6405; Sahih Muslim 13, 533, 728, 2632, 2692; Sunan at-Tirmidhi 415, 2004",
    },
  },
  {
    id: "levels",
    name: "Levels of Jannah",
    content: {
      intro:
        "Jannah is not a single flat destination — it has degrees, levels, and ranks. The highest is Jannatul Firdaus al-A'la, directly beneath the Throne of Allah. The differences between levels are vast.",
      points: [
        {
          title: "One hundred degrees",
          detail:
            "The Prophet (peace be upon him) said: 'In Paradise there are one hundred degrees, which Allah has prepared for those who strive in His cause (mujahideen). The distance between each two degrees is like the distance between the heavens and the earth.'",
          note: "Sahih al-Bukhari 2790",
        },
        {
          title: "The Quranic names of Paradise",
          detail:
            "The Quran refers to Paradise by several names, each highlighting a different quality. Jannat al-Firdaws (الفردوس) — the highest garden, beneath the Throne of Allah. Jannat al-Adn (جنات عدن) — the Gardens of Perpetual Residence, mentioned 11 times in the Quran, described with flowing rivers, gold adornments, and reunion with righteous family. Jannat an-Na'im (جنات النعيم) — the Gardens of Delight, a life of complete happiness and peace. Jannat al-Ma'wa (جنة المأوى) — the Garden of Refuge, an eternal shelter for the pious. Dar as-Salam (دار السلام) — the Abode of Peace, where all trials end and Allah's peace is guaranteed. Dar al-Khuld (دار الخلد) — the Abode of Immortality, where its people live forever. Illiyyun (عليّون) — the Highest Place, where the record of the righteous is kept and the angels bear witness to it. Whether these are names for distinct levels or different descriptions of the same Paradise is discussed among scholars — what is certain is that each name is from the Quran itself.",
          note: "Quran 18:107, 23:11 (Firdaws); 9:72, 13:23, 18:31, 61:12, 98:8 (Adn); 10:9, 56:12, 68:34 (Na'im); 32:19, 53:15 (Ma'wa); 6:127, 10:25 (Dar as-Salam); 41:28 (Dar al-Khuld); 83:18-21 (Illiyyun)",
        },
        {
          title: "Jannatul Firdaus — the highest level",
          detail:
            "The Prophet (peace be upon him) said: 'When you ask Allah, ask Him for al-Firdaus, for it is the middle and highest part of Paradise. Above it is the Throne of the Most Merciful, and from it spring the rivers of Paradise.'",
          note: "Sahih al-Bukhari 2790; Sahih al-Bukhari 7423",
        },
        {
          title: "Al-Wasilah — the single highest station",
          detail:
            "Al-Wasilah is a unique station in Paradise that belongs to only one person. The Prophet (peace be upon him) said: 'When you hear the mu'adhin, say what he says, then send blessings upon me... then ask Allah to grant me al-Wasilah, for it is a station in Paradise that is only fitting for one of the servants of Allah, and I hope that I will be the one. Whoever asks Allah to grant me al-Wasilah, my intercession will be guaranteed for him.' Muslims are encouraged to make this du'a after every adhan.",
          note: "Sahih Muslim 384; Sahih al-Bukhari 614",
        },
        {
          title: "Seeing the people of higher ranks",
          detail:
            "The Prophet (peace be upon him) said: 'The people of Paradise will look at the people of the upper rooms as you look at a brilliant star far away on the eastern or western horizon, because of the superiority of some over others.' The companions asked: 'Are those the abodes of the prophets?' He said: 'By the One in Whose Hand is my soul, they are for those who believed in Allah and believed the messengers.'",
          note: "Sahih al-Bukhari 3256; Sahih Muslim 2831",
        },
        {
          title: "Ranks are earned through deeds",
          detail:
            "The level a person attains in Paradise corresponds to their faith and deeds. Among the things that raise one's rank: recitation of the Quran ('Read and ascend, for your rank will be at the last verse you recite'), du'a, extra prayers, charity, and patience. The competition for Jannah is the worthiest competition.",
          note: "Sunan Abu Dawud 1464; Sunan at-Tirmidhi 2914; Quran 83:26 — 'So for this let the competitors compete.'",
        },
      ],
      source:
        "Quran 6:127, 9:72, 10:9, 10:25, 13:23, 18:31, 18:107, 23:11, 32:19, 41:28, 53:15, 56:12, 61:12, 68:34, 83:18-21, 83:26, 98:8; Sahih al-Bukhari 614, 2790, 3256, 7423; Sahih Muslim 384, 2831; Sunan Abu Dawud 1464; Sunan at-Tirmidhi 2914",
    },
  },
  {
    id: "last-person",
    name: "The Last to Enter",
    content: {
      intro:
        "One of the most remarkable hadiths in all of Islam describes the last person to be taken out of the Hellfire and admitted into Paradise. It is a powerful reminder of Allah's limitless generosity.",
      points: [
        {
          title: "The last person to leave the Fire",
          detail:
            "The Prophet (peace be upon him) described a man who will crawl out of the Hellfire, the last of all people to be saved. He will emerge scorched and exhausted. Then Allah will say to him: 'Go and enter Paradise.' He will go and find it full (or think it is full). He will return and say: 'O Lord, I found it full.'",
          note: "Sahih al-Bukhari 6571; Sahih Muslim 187",
        },
        {
          title: "Allah's generosity multiplied",
          detail:
            "Allah will tell him to go again, and again the man will return saying it is full. This will happen multiple times. Then Allah will say: 'Go and enter Paradise, for you shall have the like of the entire world and ten times more.' The man will say: 'Are You mocking me, and You are the King?' The narrator (Ibn Mas'ud) said: 'I saw the Messenger of Allah laugh until his molar teeth were visible.'",
          note: "Sahih al-Bukhari 6571; Sahih Muslim 186",
        },
        {
          title: "The minimum — and it exceeds the world",
          detail:
            "This is the lowest rank of the people of Paradise — and even this person receives ten times the entire world. If the last person to enter receives this much, what of those above him? What of the people of Firdaus? The hadith puts into perspective how limitless Allah's generosity truly is.",
          note: "Sahih Muslim 188",
        },
        {
          title: "A reminder of hope",
          detail:
            "This hadith is one of the greatest sources of hope in Islam. No matter how many sins a person has, no matter how far they have strayed — if they die upon tawhid, there is hope. The door of repentance is always open, and the mercy of Allah is vast beyond measure.",
          note: "Quran 39:53 — 'Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.'",
        },
      ],
      source:
        "Quran 39:53; Sahih al-Bukhari 6571; Sahih Muslim 186, 187, 188",
    },
  },
];

const sections = [
  { key: "intro", label: "What is Jannah?" },
  { key: "importance", label: "Why It Matters" },
  { key: "descriptions", label: "Descriptions" },
  { key: "how-to", label: "How to Enter" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── sub-components ───────────────────────── */

function TopicInfoCard({
  topic,
}: {
  topic: DescriptionTopic | HowToTopic;
}) {
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
            {(topic.content as DescriptionTopic["content"]).verse!.arabic}
          </p>
          <p className="text-themed text-sm italic">
            &ldquo;
            {(topic.content as DescriptionTopic["content"]).verse!.text}
            &rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-2">
            {(topic.content as DescriptionTopic["content"]).verse!.ref}
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
              <p className="text-xs text-gold/60 mt-2">{point.note}</p>
            )}
          </div>
        ))}
      </div>
    </ContentCard>
  );
}

/* ───────────────────────── page ───────────────────────── */

function JannahContent() {
  const searchParams = useSearchParams();
  useScrollToSection();
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "intro");
  const [activeDescription, setActiveDescription] = useState("rivers-gardens");
  const [activeHowTo, setActiveHowTo] = useState("conditions");
  const [search, setSearch] = useState("");

  const topicMatches = (t: { name: string; content: { intro: string; points: { title: string; detail: string }[]; verse?: { text: string }; source?: string } }) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, t.name, t.content.intro, t.content.source,
      t.content.verse?.text,
      ...t.content.points.map(p => p.title),
      ...t.content.points.map(p => p.detail),
    );
  };

  const mattersMatches = (item: { point: string; detail: string; reference: string }) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, item.point, item.detail, item.reference);
  };

  return (
    <div>
      <PageHeader
        title="Jannah"
        titleAr="الجنة"
        subtitle="Paradise — the eternal home prepared for the believers"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search topics, descriptions, verses..." className="mb-6" />

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
        {/* ─── What is Jannah? ─── */}
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
                  وَسَارِعُوٓا إِلَىٰ مَغْفِرَةٍۢ مِّن رَّبِّكُمْ وَجَنَّةٍ
                  عَرْضُهَا ٱلسَّمَـٰوَٰتُ وَٱلْأَرْضُ أُعِدَّتْ
                  لِلْمُتَّقِينَ
                </p>
                <p className="text-themed-muted italic mb-2 max-w-2xl mx-auto">
                  &ldquo;And hasten to forgiveness from your Lord and a garden
                  as wide as the heavens and earth, prepared for the
                  righteous.&rdquo;
                </p>
                <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Quran 3:133
                </span>
              </div>
            </ContentCard>

            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                What is Jannah?
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">Jannah</span>{" "}
                  (الجنة) literally means &ldquo;garden&rdquo; and refers to
                  Paradise — the eternal abode of bliss that Allah has prepared
                  for those who believe in Him and live righteously. It is the
                  ultimate reward, the final destination, and the purpose behind
                  every act of worship in Islam.
                </p>
                <p>
                  Belief in the Hereafter — including Jannah and Jahannam — is
                  one of the six articles of faith in Islam. Every Muslim
                  believes that this worldly life is temporary and that the real
                  life begins after death. Allah says:{" "}
                  <em>
                    &ldquo;Every soul will taste death, and you will only receive
                    your full reward on the Day of Resurrection&rdquo;
                  </em>{" "}
                  (Quran 3:185).
                </p>
                <p>
                  The descriptions of Jannah in the Quran and Sunnah are vivid
                  and detailed — rivers of milk, honey, and wine; palaces of
                  gold; fruits of every kind; eternal youth; reunion with loved
                  ones. Yet these are only glimpses. The Prophet (peace be upon
                  him) said, quoting his Lord:{" "}
                  <em>
                    &ldquo;I have prepared for My righteous servants what no eye
                    has seen, no ear has heard, and no human heart has ever
                    conceived&rdquo;
                  </em>{" "}
                  (Sahih al-Bukhari 3244).
                </p>
                <p>
                  Jannah has levels and degrees — the highest being Jannatul
                  Firdaus al-A&rsquo;la, directly beneath the Throne of Allah.
                  The distance between each level is like the distance between
                  the heavens and the earth. And above all the physical
                  pleasures, the greatest reward of Jannah is seeing the Face of
                  Allah — a blessing that surpasses everything else.
                </p>
                <p>
                  The door to Jannah is open to every person who sincerely
                  believes in Allah, repents from their sins, and strives to
                  live a righteous life. Allah&rsquo;s mercy is vast, and He
                  says:{" "}
                  <em>
                    &ldquo;O My servants who have transgressed against
                    themselves, do not despair of the mercy of Allah. Indeed,
                    Allah forgives all sins&rdquo;
                  </em>{" "}
                  (Quran 39:53).
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
                  "Quran 3:133 — A garden as wide as the heavens and earth",
                  "Quran 3:185 — Every soul will taste death; true success is entering Paradise",
                  "Quran 32:17 — No soul knows what delight awaits them",
                  "Quran 39:53 — Do not despair of the mercy of Allah",
                  "Sahih al-Bukhari 3244; Sahih Muslim 2824 — What no eye has seen, no ear has heard",
                  "Sahih al-Bukhari 2790 — One hundred degrees of Paradise",
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
            {/* Opening verse */}
            <ContentCard>
              <div className="text-center py-4">
                <p className="text-lg font-arabic text-gold leading-loose mb-3">
                  لَا تَعْلَمُ نَفْسٌۭ مَّآ أُخْفِىَ لَهُم مِّن قُرَّةِ
                  أَعْيُنٍۢ جَزَآءًۢ بِمَا كَانُوا يَعْمَلُونَ
                </p>
                <p className="text-themed-muted italic">
                  &ldquo;No soul knows what has been hidden for them of comfort
                  for eyes as reward for what they used to do.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 32:17</p>
              </div>
            </ContentCard>

            {/* Numbered points */}
            {whyItMatters.filter(mattersMatches).map((item, i) => (
              <ContentCard key={i} delay={0.05 + i * 0.05}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold font-semibold text-sm">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-themed mb-1">
                      {item.point}
                    </h3>
                    <p className="text-themed-muted text-sm leading-relaxed">
                      {item.detail}
                    </p>
                    <p className="text-xs text-gold/60 mt-2">
                      {item.reference}
                    </p>
                  </div>
                </div>
              </ContentCard>
            ))}

            {/* Closing verse */}
            <ContentCard delay={0.35}>
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: "var(--color-bg)" }}
              >
                <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                  فَلَا تَعْلَمُ نَفْسٌۭ مَّآ أُخْفِىَ لَهُم مِّن قُرَّةِ
                  أَعْيُنٍۢ
                </p>
                <p className="text-themed text-sm italic">
                  &ldquo;No soul knows what delight of the eyes has been hidden
                  for them.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 32:17</p>
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
                  "Quran 3:185 — True success is being saved from the Fire and admitted to Paradise",
                  "Quran 32:17 — What no soul knows has been hidden for them",
                  "Quran 44:56 — No death in Paradise except the first death",
                  "Quran 75:22-23 — Faces looking at their Lord",
                  "Sahih al-Bukhari 3244; Sahih Muslim 2824 — What no eye has seen",
                  "Sahih al-Bukhari 5673; Sahih Muslim 2816 — None enters Paradise by deeds alone",
                  "Sahih al-Bukhari 6488 — Paradise is closer than your sandal strap",
                  "Sahih Muslim 181 — The lifting of the veil; seeing the Face of Allah",
                  "Sahih Muslim 2849 — Death slaughtered between Paradise and the Fire",
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

        {/* ─── Descriptions ─── */}
        {activeSection === "descriptions" && (
          <motion.div
            key="descriptions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
                {descriptionTopics.filter(topicMatches).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setActiveDescription(topic.id)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left flex items-center gap-2 ${
                        activeDescription === topic.id
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
                  {descriptionTopics.map(
                    (topic) =>
                      activeDescription === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <TopicInfoCard topic={topic} />
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
                  "Quran 47:15 — The four rivers of Paradise",
                  "Quran 55:52-74 — Fruits, companions, and gardens of Paradise",
                  "Quran 56:17-37 — The food, drink, and companions of the foremost",
                  "Quran 75:22-23; Quran 10:26 — Seeing the Face of Allah",
                  "Sahih al-Bukhari 3251; Sahih Muslim 2826 — Trees whose shade takes 100 years to cross",
                  "Sahih al-Bukhari 4879; Sahih Muslim 2838 — Tents of hollow pearls",
                  "Sahih al-Bukhari 6581; Sahih Muslim 400 — Al-Kawthar river",
                  "Sahih al-Bukhari 3245 — No envy or rancor in the hearts of Paradise's people",
                  "Sahih Muslim 181 — The greatest reward: looking at the Face of Allah",
                  "Sunan at-Tirmidhi 2526 — Bricks of gold and silver, soil of saffron; Sahih Muslim 2928 — Soil of white musk",
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

        {/* ─── How to Enter ─── */}
        {activeSection === "how-to" && (
          <motion.div
            key="how-to"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
                {howToTopics.filter(topicMatches).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setActiveHowTo(topic.id)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left flex items-center gap-2 ${
                        activeHowTo === topic.id
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
                  {howToTopics.map(
                    (topic) =>
                      activeHowTo === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <TopicInfoCard topic={topic} />
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
                  "Quran 2:82 — Those who believe and do righteous deeds are the companions of Paradise",
                  "Quran 4:48 — Allah does not forgive shirk",
                  "Quran 4:69 — Being with the prophets, the truthful, and the righteous",
                  "Quran 39:53 — Do not despair of the mercy of Allah",
                  "Quran 83:26 — For this let the competitors compete",
                  "Sahih al-Bukhari 1; Sahih Muslim 1907 — Actions are judged by intentions",
                  "Sahih al-Bukhari 1397; Sahih Muslim 13 — Deeds that admit to Paradise",
                  "Sahih al-Bukhari 2790 — One hundred degrees of Paradise; al-Firdaus",
                  "Sahih Muslim 384; Sahih al-Bukhari 614 — Al-Wasilah: the highest station for the Prophet",
                  "Sahih al-Bukhari 5304 — Sponsoring an orphan: together in Paradise",
                  "Sahih al-Bukhari 6571; Sahih Muslim 186-188 — The last person to enter Paradise",
                  "Sahih Muslim 26 — Whoever dies upon tawhid will enter Paradise",
                  "Sunan at-Tirmidhi 2004 — The most common cause of admission: taqwa and good character",
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
      </AnimatePresence>
    </div>
  );
}

export default function JannahPage() {
  return <Suspense><JannahContent /></Suspense>;
}
