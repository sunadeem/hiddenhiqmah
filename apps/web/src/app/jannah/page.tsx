"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TopicInfoCard, { topicSourceRefs } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";

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
    reference: "Bukhari 59:55; Muslim 53:3; also in Quran 32:17",
  },
  {
    point: "It is near — closer than your shoelace",
    detail:
      "The Prophet (peace be upon him) said: 'Paradise is closer to any of you than the strap of his sandal, and the same applies to the Hellfire.' Every small act of goodness can bring a person closer to Jannah.",
    reference: "Bukhari 81:77",
  },
  {
    point: "The mercy of Allah encompasses it",
    detail:
      "No one enters Jannah by their deeds alone — it is by the mercy of Allah. The Prophet (peace be upon him) said: 'None of you will enter Paradise by his deeds alone.' They said: 'Not even you, O Messenger of Allah?' He said: 'Not even me, unless Allah envelops me in His mercy.'",
    reference: "Bukhari 75:33; Muslim 52:66",
  },
  {
    point: "Its inhabitants will live forever",
    detail:
      "There is no death in Jannah, no aging, no sickness, no sorrow. Its people will live in eternal bliss. Allah says: 'They will not taste death therein except the first death, and He will have protected them from the punishment of Hellfire.'",
    reference: "Quran 44:56; Muslim 53:50 (death will be slaughtered between Jannah and the Fire)",
  },
  {
    point: "The greatest reward: seeing the Face of Allah",
    detail:
      "The people of Jannah will be granted the greatest of all blessings — looking upon the Face of their Lord. The Prophet (peace be upon him) said: 'When the people of Paradise enter Paradise, Allah will say: Do you want anything more? They will say: Have You not brightened our faces? Have You not admitted us to Paradise and saved us from the Fire? Then the veil will be lifted, and nothing they were given will be more beloved to them than looking at their Lord.'",
    reference: "Muslim 1:88; Quran 75:22-23",
  },
  {
    point: "Paradise is surrounded by hardships",
    detail:
      "The Prophet (peace be upon him) said: 'Paradise is surrounded by hardships, and the Fire is surrounded by desires.' The road to Jannah passes through what the self dislikes — patience, restraint, sincerity, and struggle — while the road to the Fire is paved with what the self craves. This is why striving is the price, and why it is always worth paying.",
    reference: "Muslim 53:1; Tirmidhi 38:37",
  },
  {
    point: "Shown to Jibril before it was veiled",
    detail:
      "When Allah created Paradise, He sent Jibril to look at it. Jibril said: 'By Your Glory, no one will hear of it but he will enter it.' Then Allah surrounded it with hardships, and when Jibril looked again he said: 'By Your Glory, I fear that no one will enter it.' The Fire was shown to him the same way — beautiful to approach, ruinous to reach. The struggle in between is the whole test.",
    reference: "Nasai 35:3",
  },
  {
    point: "A whip's length of it is better than the world",
    detail:
      "The Prophet (peace be upon him) said: 'A (small) place equal to an area occupied by a whip in Paradise is better than the (whole) world and whatever is in it.' A single hand-span of Jannah outweighs everything a person could chase in this life — which is why no worldly loss suffered for its sake is truly a loss.",
    reference: "Bukhari 81:4; Ibn Majah 37:231",
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
          note: "Quran 47:15; Tirmidhi 38:49",
        },
        {
          title: "Al-Kawthar",
          detail:
            "Al-Kawthar is a river in Jannah granted exclusively to the Prophet Muhammad (peace be upon him). On its two banks are tents of hollow pearls, and its scent is of sharp musk. Its water is whiter than milk and sweeter than honey, and its drinking vessels are as numerous as the stars. From it pours the Prophet's Hawd — his Basin, where the believers drink before entering Paradise — described in full on the Day of Judgement page.",
          note: "Bukhari 81:169; Muslim 4:56; Quran 108:1",
        },
        {
          title: "Trees and shade",
          detail:
            "The trees of Jannah are immense. The Prophet (peace be upon him) said: 'In Paradise there is a tree under whose shade a rider could travel for a hundred years and not cross it.' Their fruits hang low and are always within reach.",
          note: "Bukhari 59:62; Muslim 53:7; Quran 56:28-30",
        },
        {
          title: "The soil and fragrance",
          detail:
            "The Prophet (peace be upon him) described the soil of Paradise as fine white musk and its pebbles as pearls and rubies. In another narration, the soil is described as saffron, its mortar as fragrant musk, and its bricks as gold and silver.",
          note: "Muslim 53:19; Tirmidhi 38:4",
        },
      ],
      source:
        "Quran 47:15; Quran 56:28-34; Bukhari 59:62; Bukhari 81:169; Muslim 4:56; Muslim 53:7; Tirmidhi 38:4; Tirmidhi 38:49",
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
          note: "Tirmidhi 38:4 (graded Sahih li-shawahidihi by al-Albani via Mishkat 5630); also transmitted by Ahmad and ad-Darimi",
        },
        {
          title: "Rooms built upon rooms",
          detail:
            "Allah describes lofty chambers (ghuraf) — rooms built upon rooms, beneath which rivers flow. The Prophet (peace be upon him) said: 'The people of Paradise will see the dwellers of the upper rooms as you see a distant star in the sky, because of the difference in their degrees.'",
          note: "Quran 39:20; Bukhari 59:66; Muslim 53:11",
        },
        {
          title: "Tents of hollow pearls",
          detail:
            "The Prophet (peace be upon him) said: 'The believer in Paradise will have a tent made of a single hollowed-out pearl, sixty miles wide. In each corner of it, there will be a wife whom the others cannot see, and the believer will visit each of them.'",
          note: "Bukhari 65:400; Muslim 53:27",
        },
        {
          title: "The vastness of each person's kingdom",
          detail:
            "The lowest in rank among the people of Paradise will be given ten times the like of this entire world. They will have whatever their soul desires and their eyes delight in. Some narrations describe the last person to enter Paradise as receiving a kingdom greater than the world and everything in it.",
          note: "Muslim 1:95; Bukhari 81:159",
        },
      ],
      source:
        "Quran 39:20; Bukhari 59:66; Bukhari 81:159; Muslim 1:95; Muslim 15:48; Tirmidhi 38:4",
    },
  },
  {
    id: "gates",
    name: "The Gates & the Entry",
    content: {
      intro:
        "The most famous single fact about Jannah is its eight gates — and the scene of entry, when the righteous are led to it in groups and its keepers greet them with peace. Which gate opens for a person reflects the deeds they were known for (those deeds are gathered under How to Enter).",
      verse: {
        arabic: "وَسِيقَ ٱلَّذِينَ ٱتَّقَوْا۟ رَبَّهُمْ إِلَى ٱلْجَنَّةِ زُمَرًا ۖ حَتَّىٰٓ إِذَا جَآءُوهَا وَفُتِحَتْ أَبْوَٰبُهَا وَقَالَ لَهُمْ خَزَنَتُهَا سَلَـٰمٌ عَلَيْكُمْ طِبْتُمْ فَٱدْخُلُوهَا خَـٰلِدِينَ",
        text: "But those who feared their Lord will be led to Paradise in groups, until when they reach it, its gates will be wide open, and its keepers will say to them, “Peace be upon you. You have done well, so enter it, abiding forever.”",
        ref: "Quran 39:73",
      },
      points: [
        {
          title: "Eight gates",
          detail:
            "The Prophet (peace be upon him) said: 'Paradise has eight gates, and one of them is called Ar-Raiyan through which none will enter but those who observe fasting.'",
          note: "Bukhari 59:67",
        },
        {
          title: "Ar-Rayyan — reserved for those who fasted",
          detail:
            "The Prophet (peace be upon him) said: 'There is a gate in Paradise called Ar-Raiyan, and those who observe fasts will enter through it on the Day of Resurrection and none except them will enter through it... After their entry the gate will be closed and nobody will enter through it.'",
          note: "Bukhari 30:6",
        },
        {
          title: "Called from every gate",
          detail:
            "Whoever spends a pair of anything in Allah's cause is called from the gates of Paradise — from the gate of prayer if he prayed much, of jihad if he fought, of fasting if he fasted, of charity if he gave. Abu Bakr asked whether anyone would be called from all the gates at once, and the Prophet (peace be upon him) answered: 'Yes, and I hope you will be among those, O Abu Bakr.'",
          note: "Bukhari 30:7; Bukhari 62:18",
        },
        {
          title: "Wudu and the shahadah open all eight",
          detail:
            "The Prophet (peace be upon him) said that whoever perfects his ablution and then testifies that there is no god but Allah and that Muhammad is His servant and Messenger — 'the eight gates of Paradise would be opened for him and he may enter by whichever of them he wishes.'",
          note: "Muslim 2:20",
        },
        {
          title: "The Prophet is the first to knock",
          detail:
            "The Prophet (peace be upon him) said: 'I would be the first to knock at the door of Paradise.' On that Day he will seek its opening, and the keeper will ask: 'Who art thou?' He will say: 'Muhammad.' The keeper will answer: 'It is for thee that I have been ordered, and not to open it for anyone before thee.'",
          note: "Muslim 1:390; Muslim 1:392",
        },
        {
          title: "The Qantarah — the last accounts settled",
          detail:
            "After the believers are saved from the Fire, they are halted at a bridge (qantarah) between Paradise and the Fire, where any remaining wrongs between them are settled — 'and when they get purified of all their sins, they will be admitted into Paradise.' Only then does each enter, knowing his own dwelling better than he knew his home in this world. (The Sirat, the Hawd, and the Scale are detailed on the Day of Judgement page.)",
          note: "Bukhari 46:1; Bukhari 81:124",
        },
      ],
      source:
        "Quran 39:73; Bukhari 30:6; Bukhari 30:7; Bukhari 46:1; Bukhari 59:67; Bukhari 62:18; Bukhari 81:124; Muslim 1:390; Muslim 1:392; Muslim 2:20",
    },
  },
  {
    id: "people",
    name: "The People of Jannah",
    content: {
      intro:
        "The rivers, palaces, and gardens are only the setting. Among the most-asked questions is what the people themselves will be like — and the Sunnah answers in vivid detail: transformed bodies, free of every defect, ageless, and always growing more beautiful.",
      points: [
        {
          title: "The first group — like the full moon",
          detail:
            "The Prophet (peace be upon him) said: 'The first group (of people) who will enter Paradise will be (glittering) like the moon when it is full,' and those after them like the brightest star in the sky — 'their hearts will be as if one heart,' with no differences and no hatred between them.",
          note: "Bukhari 59:56; Muslim 53:19",
        },
        {
          title: "No bodily needs; sweat of musk",
          detail:
            "Of that first group the Prophet (peace be upon him) said: 'They will not spit or blow their noses or relieve nature. Their utensils will be of gold and their combs of gold and silver... and their sweat will smell like musk.' Every burden of the body is gone.",
          note: "Bukhari 59:56; Muslim 53:18",
        },
        {
          title: "In the form of their father Adam — sixty cubits",
          detail:
            "The Prophet (peace be upon him) said that Allah created Adam 'sixty cubits (about 30 meters) in height,' and that 'whoever will enter Paradise, will be of the shape and picture of Adam.' The people of Paradise are restored to that original, towering form.",
          note: "Bukhari 79:1; Bukhari 60:2",
        },
        {
          title: "Ageless, thirty years old",
          detail:
            "The Prophet (peace be upon him) said: 'The people of Paradise shall enter Paradise without body hair... thirty years of age or thirty-three years.' There is no aging, and no one grows old.",
          note: "Tirmidhi 38:23",
        },
        {
          title: "The market of Paradise",
          detail:
            "There is a market in Paradise which its people visit, 'in which there is no buying nor selling.' When they return home, their spouses greet them saying they have come back even more handsome and better-scented than they left — for in Jannah, beauty only increases.",
          note: "Ibn Majah 37:237; Tirmidhi 38:28",
        },
      ],
      source:
        "Bukhari 59:56; Bukhari 60:2; Bukhari 79:1; Muslim 53:18; Muslim 53:19; Tirmidhi 38:23; Tirmidhi 38:28; Ibn Majah 37:237",
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
          note: "Quran 55:52; Quran 56:20-21; Quran 2:25",
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
          note: "Quran 37:45-47; Quran 56:17-19; Quran 76:15-17",
        },
        {
          title: "Springs of Tasnim and Salsabil",
          detail:
            "Among the finest drinks of Paradise are two named springs: Tasnim — the highest spring, from which the closest to Allah drink directly — and Salsabil — a spring of ginger-flavored drink. There is also Kafur — a spring scented with camphor.",
          note: "Quran 83:27-28 (Tasnim), 76:18 (Salsabil), 76:5 (Kafur)",
        },
      ],
      source:
        "Quran 2:25; Quran 37:45-47; Quran 55:52; Quran 56:17-21; Quran 76:5-18; Quran 83:27-28",
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
          note: "Quran 44:54; Quran 55:70-74; Quran 56:35-37; Muslim 53:16",
        },
        {
          title: "No envy, no ill will",
          detail:
            "One of the first things removed from the hearts of the people of Jannah is any rancor or envy. They will be 'brothers, on thrones facing each other.' There is only love, contentment, and peace between them.",
          note: "Quran 15:47; Bukhari 59:56",
        },
        {
          title: "In the company of the prophets",
          detail:
            "Those who obey Allah and His Messenger will be with the prophets, the truthful, the martyrs, and the righteous. The Prophet (peace be upon him) told a companion who asked about being with him in Paradise: 'You will be with those whom you love.'",
          note: "Quran 4:69; Bukhari 62:38; Muslim 45:208",
        },
        {
          title: "Children in Paradise",
          detail:
            "For grieving parents, the Sunnah gives direct comfort. In the Prophet's long dream, the tall man in a garden of every spring colour was Ibrahim, 'and the children around him are those children who die with Al-Fitra' — the natural faith. And of a child lost before birth the Prophet (peace be upon him) said: 'The miscarried fetus will drag his mother by his umbilical cord to Paradise, if she (was patient and) sought reward (for her loss).' The pastoral guidance for losing a child is gathered on the Family page.",
          note: "Bukhari 91:61; Ibn Majah 6:177",
        },
      ],
      source:
        "Quran 4:69; Quran 13:23; Quran 15:47; Quran 44:54; Quran 52:21; Quran 55:70-74; Bukhari 59:56; Bukhari 62:38; Bukhari 91:61; Muslim 45:208; Muslim 53:50; Ibn Majah 6:177",
    },
  },
  {
    id: "women",
    name: "Women & Jannah",
    content: {
      intro:
        "One of the most-searched questions about the Hereafter — for roughly half the audience — is what Jannah holds for women, and how to read the narrations that mention them. The Quran is unambiguous that the reward is equal; the Sunnah names the greatest women who ever lived; and the warnings it gives are aimed at conduct, not gender.",
      verse: {
        arabic: "وَمَن يَعْمَلْ مِنَ ٱلصَّـٰلِحَـٰتِ مِن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ فَأُو۟لَـٰٓئِكَ يَدْخُلُونَ ٱلْجَنَّةَ وَلَا يُظْلَمُونَ نَقِيرًا",
        text: "Whoever does righteous deeds, whether male or female, and is a believer, it is they who will enter Paradise, and they will not be wronged even as much as the speck on a date stone.",
        ref: "Quran 4:124",
      },
      points: [
        {
          title: "Equal reward, male and female",
          detail:
            "The measure of Paradise is faith and deeds, not gender. Allah promises that whoever does righteousness — 'whether male or female, and is a believer' — enters Paradise 'and they will not be wronged even as much as the speck on a date stone.'",
          note: "Quran 4:124",
        },
        {
          title: "The best of women",
          detail:
            "The Prophet (peace be upon him) taught that among all women only a few reached perfection — naming Maryam the daughter of Imran and Asiyah the wife of Pharaoh — and that Khadijah is the best of this nation's women. Of Aisha he said that her superiority 'to other women is like the superiority of Tharid (i.e. an Arabic dish) to other meals.'",
          note: "Bukhari 60:84; Bukhari 60:103; Bukhari 62:114",
        },
        {
          title: "The 'majority of its people are women' narration — in context",
          detail:
            "The Prophet (peace be upon him) said he 'was shown the Hell-fire and that the majority of its dwellers were women who were ungrateful,' and when asked whether they disbelieved in Allah he explained: 'They are ungrateful to their husbands and are ungrateful for the favors and the good... done to them.' The hadith names a specific fault of character — not an inherent inferiority of women — and its cure is simply the gratitude and good conduct it calls for. It is one part of a wider warning, not a verdict on any believing woman's worth.",
          note: "Bukhari 2:22; Bukhari 6:9",
        },
        {
          title: "The Fire's warnings target deeds, not a sex",
          detail:
            "When the Prophet (peace be upon him) described the 'Two are the types of the denizens of Hell,' he named both men — those 'having flogs like the tails of the ox... beating people' — and 'the women who would be dressed but appear to be naked.' The point of such narrations is the conduct being warned against; both sexes are addressed, and both are told how to be saved.",
          note: "Muslim 37:190",
        },
        {
          title: "One popular narration set aside",
          detail:
            "A widely-shared saying holds that a believing wife will surpass the Hur al-'Ayn in rank. It rests on a weak chain and is not established by an authentic report, so it is not cited here as proof; scholars discuss it, and it is best left to that discussion rather than quoted as certain.",
          note: "Generically attributed — held back pending scholarly review; no authentic chain",
        },
      ],
      source:
        "Quran 4:124; Bukhari 2:22; Bukhari 6:9; Bukhari 60:84; Bukhari 60:103; Bukhari 62:114; Muslim 37:190",
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
          note: "Muslim 1:88",
        },
        {
          title: "The 'extra' (al-Ziyadah)",
          detail:
            "In the verse 'For those who have done good is the best reward and even more (ziyadah)' (Quran 10:26), the Prophet (peace be upon him) explained that 'the best reward' is Paradise, and 'even more' (al-ziyadah) is looking at the Face of Allah. This is the greatest pleasure of Jannah — greater than all its physical blessings combined.",
          note: "Muslim 1:88; Tirmidhi 38:30",
        },
        {
          title: "The people of the highest level",
          detail:
            "The believers will see their Lord in Paradise as clearly as they see the full moon — without any difficulty. Those most honoured by Allah will look upon His Face morning and evening. This closeness to Allah is what truly differentiates the levels of Jannah.",
          note: "Bukhari 97:61; Tirmidhi 38:31 (regarding morning and evening)",
        },
        {
          title: "Allah's pleasure — the greatest of all",
          detail:
            "Allah will say to the people of Paradise: 'O people of Paradise!' They will say: 'Here we are, our Lord!' He will say: 'Are you pleased?' They will say: 'How could we not be pleased when You have given us what You have not given anyone else?' He will say: 'I will give you something even better.' They will ask: 'What could be better?' He will say: 'I bestow upon you My pleasure (ridwan), and I shall never be angry with you after this.'",
          note: "Bukhari 23:138; Muslim 53:10",
        },
      ],
      source:
        "Quran 10:26; Quran 75:22-23; Bukhari 23:138; Bukhari 97:61; Muslim 1:88; Muslim 15:39; Tirmidhi 38:30; Tirmidhi 38:31",
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
          note: "Muslim 1:178; Quran 4:48",
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
          note: "Bukhari 1:1; Muslim 6:335",
        },
        {
          title: "The mercy of Allah",
          detail:
            "Ultimately, no one enters Paradise by their deeds alone — it is by Allah's mercy. Deeds are the means, but mercy is the cause. The Prophet (peace be upon him) said: 'Do good deeds properly, sincerely and moderately... and always adopt a middle, moderate course, whereby you will reach your target (Paradise).'",
          note: "Bukhari 81:53; Bukhari 75:33",
        },
      ],
      source:
        "Quran 2:82; Quran 4:48; Quran 4:124; Bukhari 1:1; Bukhari 81:52; Muslim 1:178; Muslim 0:6:335",
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
          note: "Bukhari 17:3; Muslim 1:14",
        },
        {
          title: "Good character",
          detail:
            "The Prophet (peace be upon him) said: 'The most common thing that will admit people to Paradise is taqwa (God-consciousness) and good character.' In another hadith: 'I guarantee a house in the highest part of Paradise for one who has good manners.'",
          note: "Tirmidhi 27:110; Abu Dawud 43:28",
        },
        {
          title: "Saying SubhanAllah, Alhamdulillah, and La ilaha illallah",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever says SubhanAllahi wa bihamdihi (Glory and praise be to Allah) 100 times a day will have his sins forgiven even if they were like the foam of the sea.' He also said: 'There are two statements that are light on the tongue, heavy on the scale, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil-Azeem.'",
          note: "Bukhari 80:100; Bukhari 80:101; Muslim 5:99",
        },
        {
          title: "Caring for orphans",
          detail:
            "The Prophet (peace be upon him) said: 'I and the one who sponsors an orphan will be like these two in Paradise' — and he held up his index and middle fingers together.",
          note: "Bukhari 10:53",
        },
        {
          title: "Building a masjid",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever builds a masjid for the sake of Allah, Allah will build for him a house in Paradise.'",
          note: "Bukhari 8:99; Muslim 5:29",
        },
        {
          title: "Patience in trials",
          detail:
            "The Prophet (peace be upon him) said: 'No Muslim is afflicted with harm — whether it be a thorn prick or something greater — except that Allah expiates some of his sins because of it, as a tree sheds its leaves.' And: 'Whoever loses two children (who die before puberty), they will be a shield for him from the Fire.'",
          note: "Bukhari 75:8; Muslim 45:197",
        },
        {
          title: "The 12 sunnah rak'at daily",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever prays 12 rak'at during the day and night (the sunnah prayers), a house will be built for him in Paradise.'",
          note: "Muslim 6:124; Tirmidhi 2:268",
        },
      ],
      source:
        "Bukhari 8:99; Bukhari 80:100; Muslim 1:14; Muslim 6:124; Tirmidhi 2:268; Tirmidhi 27:110",
    },
  },
  {
    id: "guarantees",
    name: "Guarantees & Glad Tidings",
    content: {
      intro:
        "Some texts do not merely encourage a deed — they attach an explicit promise of Paradise to it. These are the clearest glad tidings in the Sunnah: whole groups admitted without reckoning, and short, doable deeds the Prophet (peace be upon him) personally guaranteed. (When these people are led in, they enter through the eight gates described under 'The Gates & the Entry.')",
      points: [
        {
          title: "Seventy thousand without reckoning",
          detail:
            "The Prophet (peace be upon him) said: 'Seventy thousand people of my followers will enter Paradise without accounts, and they are those who do not practice Ar-Ruqya and do not see an evil omen in things, and put their trust in their Lord.' When he described them, Ukasha bin Muhsin asked him to supplicate that he be one of them, and the Prophet said: 'Yes' — then a second man asked the same, and was told that Ukasha had anticipated him.",
          note: "Bukhari 81:61; Bukhari 76:25",
        },
        {
          title: "'Pleased with Allah as Lord...'",
          detail:
            "The Prophet (peace be upon him) said that whoever declares 'I am pleased with Allah as Lord, with Islam as religion' and with Muhammad as Messenger — 'Paradise will be his due.' A single sincere sentence of contentment with Allah, said and meant, secures it.",
          note: "Abu Dawud 8:114",
        },
        {
          title: "Sayyid al-Istighfar — the master of seeking forgiveness",
          detail:
            "Of the best words for seeking forgiveness, the Prophet (peace be upon him) said: 'If somebody recites it during the day with firm faith in it, and dies on the same day before the evening, he will be from the people of Paradise; and if somebody recites it at night with firm faith in it, and dies before the morning, he will be from the people of Paradise.' The full wording of Sayyid al-Istighfar is taught on the Tawbah page.",
          note: "Bukhari 80:3",
        },
        {
          title: "Guard the tongue and the chastity",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever guarantees me (the chastity of) what is between his legs (i.e. his private parts), and what is between his jaws (i.e., his tongue), I guarantee him Paradise.' The two hardest organs to govern are made the very price of Jannah.",
          note: "Bukhari 86:36",
        },
      ],
      source:
        "Bukhari 76:25; Bukhari 80:3; Bukhari 81:61; Bukhari 86:36; Abu Dawud 8:114",
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
          note: "Bukhari 97:51",
        },
        {
          title: "The Quranic names of Paradise",
          detail:
            "The Quran refers to Paradise by several names, each highlighting a different quality. Jannat al-Firdaws (الفردوس) — the highest garden, beneath the Throne of Allah. Jannat al-Adn (جنات عدن) — the Gardens of Perpetual Residence, mentioned 11 times in the Quran, described with flowing rivers, gold adornments, and reunion with righteous family. Jannat an-Na'im (جنات النعيم) — the Gardens of Delight, a life of complete happiness and peace. Jannat al-Ma'wa (جنة المأوى) — the Garden of Refuge, an eternal shelter for the pious. Dar as-Salam (دار السلام) — the Abode of Peace, where all trials end and Allah's peace is guaranteed. Dar al-Khuld (دار الخلد) — the Abode of Immortality, where its people live forever. Illiyyun (عليّون) — the Highest Place, where the record of the righteous is kept and the angels bear witness to it. Whether these are names for distinct levels or different descriptions of the same Paradise is discussed among scholars — what is certain is that each name is from the Quran itself.",
          note: "Quran 18:107; Quran 23:11 (Firdaws); 9:72, 13:23, 18:31, 61:12, 98:8 (Adn); 10:9, 56:12, 68:34 (Na'im); 32:19, 53:15 (Ma'wa); 6:127, 10:25 (Dar as-Salam); 41:28 (Dar al-Khuld); 83:18-21 (Illiyyun)",
        },
        {
          title: "Jannatul Firdaus — the highest level",
          detail:
            "The Prophet (peace be upon him) said: 'When you ask Allah, ask Him for al-Firdaus, for it is the middle and highest part of Paradise. Above it is the Throne of the Most Merciful, and from it spring the rivers of Paradise.'",
          note: "Bukhari 56:156; Bukhari 97:51",
        },
        {
          title: "Al-Wasilah — the single highest station",
          detail:
            "Al-Wasilah is a unique station in Paradise that belongs to only one person. The Prophet (peace be upon him) said: 'When you hear the mu'adhin, say what he says, then send blessings upon me... then ask Allah to grant me al-Wasilah, for it is a station in Paradise that is only fitting for one of the servants of Allah, and I hope that I will be the one. Whoever asks Allah to grant me al-Wasilah, my intercession will be guaranteed for him.' Muslims are encouraged to make this du'a after every adhan.",
          note: "Bukhari 10:12",
        },
        {
          title: "Seeing the people of higher ranks",
          detail:
            "The Prophet (peace be upon him) said: 'The people of Paradise will look at the people of the upper rooms as you look at a brilliant star far away on the eastern or western horizon, because of the superiority of some over others.' The companions asked: 'Are those the abodes of the prophets?' He said: 'By the One in Whose Hand is my soul, they are for those who believed in Allah and believed the messengers.'",
          note: "Bukhari 59:66; Muslim 53:11",
        },
        {
          title: "Ranks are earned through deeds",
          detail:
            "The level a person attains in Paradise corresponds to their faith and deeds. Among the things that raise one's rank: recitation of the Quran ('Read and ascend, for your rank will be at the last verse you recite'), du'a, extra prayers, charity, and patience. The competition for Jannah is the worthiest competition.",
          note: "Abu Dawud 8:49; Tirmidhi 45:40; Quran 83:26 — 'So for this let the competitors compete.'",
        },
      ],
      source:
        "Quran 6:127; Quran 9:72; Quran 10:9; Quran 10:25; Quran 13:23; Quran 18:31; Quran 18:107; Quran 23:11; Quran 32:19; Quran 41:28; Quran 53:15; Quran 56:12; Quran 61:12; Quran 68:34; Quran 83:18-21; Quran 83:26; Quran 98:8; Bukhari 59:66; Bukhari 97:51; Muslim 53:11; Abu Dawud 8:49; Tirmidhi 45:40",
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
          note: "Bukhari 81:159; Muslim 1:356",
        },
        {
          title: "Allah's generosity multiplied",
          detail:
            "Allah will tell him to go again, and again the man will return saying it is full. This will happen multiple times. Then Allah will say: 'Go and enter Paradise, for you shall have the like of the entire world and ten times more.' The man will say: 'Are You mocking me, and You are the King?' The narrator (Ibn Mas'ud) said: 'I saw the Messenger of Allah laugh until his molar teeth were visible.'",
          note: "Bukhari 81:159; Muslim 1:366",
        },
        {
          title: "The minimum — and it exceeds the world",
          detail:
            "This is the lowest rank of the people of Paradise — and even this person receives ten times the entire world. If the last person to enter receives this much, what of those above him? What of the people of Firdaus? The hadith puts into perspective how limitless Allah's generosity truly is.",
          note: "Muslim 1:371",
        },
        {
          title: "A reminder of hope",
          detail:
            "This hadith is one of the greatest sources of hope in Islam. No matter how many sins a person has, no matter how far they have strayed — if they die upon tawhid, there is hope. The door of repentance is always open, and the mercy of Allah is vast beyond measure. (How Allah brings the people of tawhid out of the Fire in the first place is told under 'Deliverance From It' in the Jahannam section.)",
          note: "Quran 39:53 — 'Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.'",
        },
      ],
      source:
        "Quran 39:53; Bukhari 81:159; Muslim 1:93; Muslim 1:95",
    },
  },
];

const jahannamTopics: DescriptionTopic[] = [
  {
    id: "heat-depths",
    name: "Its Heat & Depths",
    content: {
      intro:
        "The Fire of Jahannam is beyond any comparison with the fires of this world — in its heat, in its depths, and in its degrees of punishment. Even its 'least' punishment is unbearable.",
      points: [
        {
          title: "Seventy times hotter than worldly fire",
          detail:
            "The Prophet (peace be upon him) said: 'The fire which sons of Adam burn is only one-seventieth part of the Fire of Hell.' His Companions said: 'By Allah, even ordinary fire would have been enough.' He said: 'It is sixty-nine parts in excess of (the heat of) fire in this world, each of them being equivalent to their heat.'",
          note: "Muslim 53:34; Tirmidhi 39:17",
        },
        {
          title: "The Fire complained to its Lord",
          detail:
            "The Prophet (peace be upon him) said: 'The (Hell) Fire complained to its Lord saying: O my Lord! My different parts eat up each other. So He allowed it to take two breaths, one in the winter and the other in summer' — and this, he explained, is the reason for the severest heat and the bitterest cold people experience in this world.",
          note: "Bukhari 59:70",
        },
        {
          title: "The least punishment",
          detail:
            "The Prophet (peace be upon him) said: 'The least punished person of the (Hell) Fire people on the Day of Resurrection will be a man under whose arch of the feet two smoldering embers will be placed, because of which his brain will boil.' Muslim likewise records of the inhabitant of the Fire with the least suffering that 'he would be wearing two shoes (of Fire) which would boil his brain.' If this is the lightest of it, what of the rest?",
          note: "Bukhari 81:151; Muslim 1:421",
        },
        {
          title: "The lowest depths — the hypocrites",
          detail:
            "Jahannam has depths beneath depths, and its lowest is reserved for the hypocrites — those who wore faith as a mask while concealing disbelief. Allah says: 'Indeed, the hypocrites will be in the lowest depths of the Fire, and you will never find for them any helper.'",
          note: "Quran 4:145",
        },
        {
          title: "From the shallowest part to the depths",
          detail:
            "Between that lowest depth and the Fire's edge lie degrees. Of his uncle Abu Talib, the Prophet (peace be upon him) said: 'My intercession may benefit him on the Day of Resurrection and he may be placed in the shallow part of the Fire which would reach his ankles and his brain would be boiling.' And Allah says: 'Everyone will be assigned ranks according to their deeds' — in both abodes, the standing differs with the deeds. Of its seven gates, 'each gate will have its allotted share of them,' and a narration in Tirmidhi names one: 'a gate for whoever carries a sword against my Ummah.'",
          note: "Muslim 1:419; Bukhari 81:153; Quran 6:132; Quran 15:43-44; Tirmidhi 47:175",
        },
        {
          title: "Its names — and the popular 'seven levels' list",
          detail:
            "The Quran calls the Fire by several names: Laza ('a raging Flame', Quran 70:15), al-Hutamah ('the Crushing Fire', Quran 104:4-5), Saqar ('the Scorching Fire', Quran 74:26-27), al-Hawiyah ('the abyss', Quran 101:9-11), as well as al-Jahim and as-Sa'ir. A widely-shared list assigns each name to a separate level with a specific community inside it — but that scheme comes from weak tafsir reports, not from any authentic hadith. What the texts themselves establish is simpler and weightier: one Fire with seven gates, differing depths, and differing punishments — each share already allotted.",
          note: "Quran 70:15; Quran 104:4-5; Quran 74:26-27; Quran 101:9-11; Quran 15:43-44",
        },
      ],
      source:
        "Quran 4:145; Quran 6:132; Quran 15:43-44; Quran 70:15; Quran 74:26-27; Quran 101:9-11; Quran 104:4-5; Bukhari 59:70; Bukhari 81:151; Bukhari 81:153; Muslim 1:419; Muslim 1:421; Muslim 53:34; Tirmidhi 39:17; Tirmidhi 47:175",
    },
  },
  {
    id: "its-people",
    name: "Its People",
    content: {
      intro:
        "The Quran and Sunnah are precise about who the Fire was prepared for: those who rejected Allah, and those whose hearts carried the arrogance of Iblis. And they record — word for word — what its people will say once the truth becomes undeniable.",
      points: [
        {
          title: "Prepared for the disbelievers",
          detail:
            "Allah says the Fire is 'prepared for the disbelievers' — those who rejected His signs after they reached them. For them, Allah says: 'there will be the Fire of Hell; neither will they be sentenced to death, so that they may die, nor will its punishment be lightened for them.'",
          note: "Quran 2:24; Quran 35:36",
        },
        {
          title: "The proud and the arrogant",
          detail:
            "The Prophet (peace be upon him) said: 'Shall I inform you about the people of the Fire? They comprise every cruel, violent, proud and conceited person.' And he said: 'No one will enter Paradise who has pride in his heart equal to the weight of a grain of mustard seed.' Arrogance — the sin of Iblis — is the hallmark of the people of the Fire.",
          note: "Bukhari 78:101; Ibn Majah 37:74",
        },
        {
          title: "Skins renewed",
          detail:
            "The punishment does not fade as it would in this world. Allah says: 'Whenever their skins are burnt through, We will replace them with fresh skins, so that they may taste the punishment. Indeed, Allah is All-Mighty, All-Wise.'",
          note: "Quran 4:56",
        },
        {
          title: "What they will say",
          detail:
            "The Quran records their pleas. They will say: 'Our Lord, take us out; we will do righteous deeds, unlike what we used to do' — and be reminded that they were given long enough lives, and that the warner did come to them. They will beg the keepers: 'Pray to your Lord to lighten for us the punishment for just one day.' And to their plea 'Our Lord, take us out of this,' the answer will come: 'Stay therein despised and do not speak to Me.'",
          note: "Quran 23:107-108; Quran 35:37; Quran 40:49-50",
        },
      ],
      source:
        "Quran 2:24; Quran 4:56; Quran 23:107-108; Quran 35:36-37; Quran 40:49-50; Bukhari 78:101; Ibn Majah 37:74",
    },
  },
  {
    id: "deeds-warned",
    name: "Deeds Warned with the Fire",
    content: {
      intro:
        "'Its People' names those the Fire was prepared for. But the Prophet (peace be upon him) also warned Muslims about specific deeds that draw a person toward it — the practical half of protection. None of these is a verdict of eternity for a believer; they are warnings meant to turn a person back while there is still time (repentance erases them, as under 'The Door of Hope').",
      verse: {
        arabic: "إِنَّ ٱلَّذِينَ يَأْكُلُونَ أَمْوَٰلَ ٱلْيَتَـٰمَىٰ ظُلْمًا إِنَّمَا يَأْكُلُونَ فِى بُطُونِهِمْ نَارًا ۖ وَسَيَصْلَوْنَ سَعِيرًا",
        text: "Indeed, those who consume the orphans’ property unjustly, only consume fire into their bellies, and they will burn in a Blazing Fire.",
        ref: "Quran 4:10",
      },
      points: [
        {
          title: "Taking one's own life",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever purposely throws himself from a mountain and kills himself, will be in the (Hell) Fire falling down into it,' and likewise whoever kills himself with poison or an iron weapon will keep repeating that act in the Fire. Despair is never a way out — it only compounds the loss.",
          note: "Bukhari 76:90",
        },
        {
          title: "Cruelty to a helpless creature",
          detail:
            "The Prophet (peace be upon him) said: 'A woman entered the (Hell) Fire because of a cat which she had tied, neither giving it food nor setting it free to eat from the vermin of the earth.' Even mercy to an animal is weighed; even its neglect can be ruinous.",
          note: "Bukhari 59:124; Bukhari 60:149",
        },
        {
          title: "Oppression and immodesty",
          detail:
            "Among the 'Two are the types of the denizens of Hell' the Prophet (peace be upon him) named those who beat people unjustly — 'having flogs like the tails of the ox' — and those who parade immodesty, 'dressed but appear to be naked.' Wielding power over others and flaunting sin are both warned with the Fire.",
          note: "Muslim 37:190",
        },
        {
          title: "Devouring an orphan's wealth",
          detail:
            "Allah warns that 'those who consume the orphans' property unjustly, only consume fire into their bellies, and they will burn in a Blazing Fire.' Exploiting those with no protector is singled out among the gravest of wrongs.",
          note: "Quran 4:10",
        },
        {
          title: "Ingratitude",
          detail:
            "When the Prophet (peace be upon him) was shown that most of the Fire's dwellers were ungrateful, he explained the fault as ingratitude — being 'ungrateful for the favors and the good... done to them.' A heart that forgets every kindness it received hardens against the One who gave it.",
          note: "Bukhari 2:22",
        },
      ],
      source:
        "Quran 4:10; Bukhari 2:22; Bukhari 59:124; Bukhari 60:149; Bukhari 76:90; Muslim 37:190",
    },
  },
  {
    id: "food-drink-chains",
    name: "Food, Drink & Chains",
    content: {
      intro:
        "In Jannah, food and drink are pure delight. In Jahannam, they are part of the punishment — a tree that grows from the bottom of the Blaze, water that scalds, and chains prepared in advance.",
      verse: {
        arabic:
          "إِنَّ شَجَرَتَ ٱلزَّقُّومِ ۝ طَعَامُ ٱلْأَثِيمِ ۝ كَٱلْمُهْلِ يَغْلِى فِى ٱلْبُطُونِ ۝ كَغَلْىِ ٱلْحَمِيمِ",
        text: "Indeed, the tree of Zaqqūm will be the food of the sinful, like molten metal that will boil in their bellies, like the boiling of scalding water.",
        ref: "Quran 44:43-46",
      },
      points: [
        {
          title: "The tree of Zaqqum",
          detail:
            "Zaqqum is 'a tree that grows in the bottom of the Blazing Fire; its fruits are like heads of devils.' Allah says its people 'will certainly eat from it, filling their bellies,' and elsewhere: 'will surely eat from the tree of zaqqūm, filling your bellies with it, and drinking scalding water on top of it, drinking like thirsty camels do.'",
          note: "Quran 37:62-68; Quran 56:51-55",
        },
        {
          title: "Scalding water",
          detail:
            "The drink of the Fire is described with terrifying precision: its people 'will be given boiling water to drink that tears apart their intestines.' And: 'They will neither taste therein any coolness nor any drink, except for scalding water and discharge of wounds.'",
          note: "Quran 47:15; Quran 78:24-25",
        },
        {
          title: "Chains and shackles",
          detail:
            "Allah says: 'We have surely prepared for the disbelievers chains, shackles, and a Blazing Fire.' And of the one who rejected his Lord it will be said: 'Seize him and shackle him, then make him burn in the Blazing Fire, then tie him up with a chain of seventy cubits long.'",
          note: "Quran 69:30-32; Quran 76:4",
        },
      ],
      source:
        "Quran 37:62-68; Quran 44:43-46; Quran 47:15; Quran 56:51-55; Quran 69:30-32; Quran 76:4; Quran 78:24-25",
    },
  },
  {
    id: "keepers",
    name: "Its Keepers",
    content: {
      intro:
        "Jahannam is not unattended. Over it stand angels who never disobey Allah — led by Malik, its keeper — and their number itself is described in the Quran as a test for those who doubt.",
      points: [
        {
          title: "Malik, the keeper of the Fire",
          detail:
            "The people of the Fire will call out to its keeper by name: 'They will cry out: O Malik, let your Lord put an end to us! He will say: You are here to stay.' Even the plea for annihilation will be denied.",
          note: "Quran 43:77",
        },
        {
          title: "Nineteen keepers",
          detail:
            "Of Saqar — the Scorching Fire that 'leaves nothing and spares no one, scorching the skin' — Allah says: 'It is overseen by nineteen.' And He explains: 'We have only appointed angels as keepers of the Fire, and We have only made their number as a test for the disbelievers... and none knows the soldiers of your Lord but He.'",
          note: "Quran 74:26-31",
        },
        {
          title: "Stern and severe angels",
          detail:
            "The Fire is 'overseen by rigorous and stern angels, who never disobey whatever Allah commands and do whatever they are commanded.' There is no bribing them, no softening them, and no escaping them.",
          note: "Quran 66:6",
        },
        {
          title: "\"Did there not come to you a warner?\"",
          detail:
            "Every time a group is thrown into the Fire, its keepers will ask them: 'Did there not come to you a warner?' The people of the Fire will admit: 'Yes indeed' — the messengers came, the warnings were heard, and the proof was established before the punishment ever began.",
          note: "Quran 39:71; Quran 67:8",
        },
      ],
      source:
        "Quran 39:71; Quran 43:77; Quran 66:6; Quran 67:7-8; Quran 74:26-31",
    },
  },
  {
    id: "deliverance",
    name: "Deliverance From It",
    content: {
      intro:
        "For the people of tawhid, Jahannam is not the end of the story. The same texts that describe its horrors describe — in equal detail — how Allah will bring out of it everyone with even the smallest grain of faith.",
      points: [
        {
          title: "A mustard seed of faith",
          detail:
            "The Prophet (peace be upon him) said: 'When the people of Paradise have entered Paradise, and the people of the Fire have entered the Fire, Allah will say: Take out (of the Fire) whoever has got faith equal to a mustard seed in his heart.' They will come out charred like coal, be thrown into the river of life, and 'spring up just as a seed grows on the bank of a rainwater stream.'",
          note: "Bukhari 2:15; Bukhari 81:149",
        },
        {
          title: "The Prophet's intercession",
          detail:
            "The Prophet (peace be upon him) said: 'On the Day of Resurrection I will intercede and say: O my Lord! Admit into Paradise (even) those who have faith equal to a mustard seed in their hearts. Such people will enter Paradise, and then I will say: O (Allah) admit into Paradise (even) those who have the least amount of faith in their hearts.'",
          note: "Bukhari 97:134",
        },
        {
          title: "No one who dies upon tawhid remains forever",
          detail:
            "The Prophet (peace be upon him) said that Jibril gave him the tidings: 'Verily he who died amongst your Ummah without associating anything with Allah would enter Paradise.' He was asked: 'Even if he committed adultery and theft?' He said: '(Yes), even if he committed adultery and theft.' And he said: 'no one will enter Hell who has faith in his heart equal to the weight of a grain of mustard seed.'",
          note: "Muslim 1:178; Ibn Majah 37:74",
        },
        {
          title: "The last to leave",
          detail:
            "The Prophet (peace be upon him) said: 'I know the person who will be the last to come out of the (Hell) Fire, and the last to enter Paradise. He will be a man who will come out of the (Hell) Fire crawling, and Allah will say to him: Go and enter Paradise' — and he will end up with the like of the entire world and ten times more. His full story is told under 'The Last to Enter' in the How to Enter section.",
          note: "Bukhari 81:159",
        },
      ],
      source:
        "Bukhari 2:15; Bukhari 81:149; Bukhari 81:159; Bukhari 97:134; Muslim 1:178; Ibn Majah 37:74",
    },
  },
  {
    id: "araf",
    name: "Al-A'raf — the Heights",
    content: {
      intro:
        "Between Paradise and the Fire the Quran describes a third vantage point: Al-A'raf, the Heights — and men who stand upon it, able to see both abodes. It is the one scene that sits literally between the two, and the surah named after it (Surah 7) preserves it.",
      verse: {
        arabic: "وَبَيْنَهُمَا حِجَابٌ ۚ وَعَلَى ٱلْأَعْرَافِ رِجَالٌ يَعْرِفُونَ كُلًّۢا بِسِيمَىٰهُمْ ۚ وَنَادَوْا۟ أَصْحَـٰبَ ٱلْجَنَّةِ أَن سَلَـٰمٌ عَلَيْكُمْ ۚ لَمْ يَدْخُلُوهَا وَهُمْ يَطْمَعُونَ",
        text: "Between them there will be a barrier, and on its Heights there will be men who will recognize each group by their marks. They will call out to the people of Paradise, “Peace be on you.” They will not have entered it, yet they will eagerly hope [to enter].",
        ref: "Quran 7:46",
      },
      points: [
        {
          title: "A barrier, and men who know both sides",
          detail:
            "Allah says: 'Between them there will be a barrier, and on its Heights there will be men who will recognize each group by their marks.' They call to the people of Paradise with peace; they have not yet entered it, yet they long to.",
          note: "Quran 7:46",
        },
        {
          title: "Neither numbers nor arrogance availed",
          detail:
            "Turning to the people of the Fire whom they recognize, the men of the Heights will say: 'Neither your great numbers nor your arrogance were of any avail to you.' Everything the worldly relied on is shown, on that Day, to have counted for nothing.",
          note: "Quran 7:48",
        },
        {
          title: "'Enter Paradise; you will have no fear'",
          detail:
            "Of the very people the arrogant had mocked, Allah asks: 'Are these the ones whom you swore that Allah would never grant mercy?' — and then the word comes to them: 'Enter Paradise; you will have no fear, nor will you grieve.' The scene ends not in suspense but in mercy.",
          note: "Quran 7:49",
        },
      ],
      source:
        "Quran 7:46; Quran 7:47; Quran 7:48; Quran 7:49",
    },
  },
];

const protectionTopics: DescriptionTopic[] = [
  {
    id: "shield-of-deeds",
    name: "Deeds That Shield",
    content: {
      intro:
        "The Prophet (peace be upon him) named specific deeds — some as small as half a date — that stand between a person and the Fire. Allah Himself commands the believers to build this protection for themselves and their families.",
      verse: {
        arabic:
          "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ قُوٓا۟ أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا وَقُودُهَا ٱلنَّاسُ وَٱلْحِجَارَةُ عَلَيْهَا مَلَـٰٓئِكَةٌ غِلَاظٌ شِدَادٌ لَّا يَعْصُونَ ٱللَّهَ مَآ أَمَرَهُمْ وَيَفْعَلُونَ مَا يُؤْمَرُونَ",
        text: "O you who believe, protect yourselves and your families from a Fire whose fuel is people and stones, and is overseen by rigorous and stern angels, who never disobey whatever Allah commands and do whatever they are commanded.",
        ref: "Quran 66:6",
      },
      points: [
        {
          title: "Even half a date",
          detail:
            "The Prophet (peace be upon him) said: 'Save yourself from Hell-fire even by giving half a date-fruit in charity.' No act of goodness is too small to matter when the stakes are the Fire.",
          note: "Bukhari 24:21",
        },
        {
          title: "La ilaha illallah — said sincerely",
          detail:
            "The Prophet (peace be upon him) said: 'Verily Allah has forbidden the Fire for one who says: There is no god but Allah, thereby seeking Allah's pleasure.' In Bukhari's narration: 'Nobody will meet Allah with that saying on the Day of Resurrection, but Allah will save him from the Fire.'",
          note: "Muslim 5:329; Bukhari 88:20",
        },
        {
          title: "Fasting for Allah's sake",
          detail:
            "The Prophet (peace be upon him) said: 'Indeed, anyone who fasts for one day for Allah's Pleasure, Allah will keep his face away from the (Hell) fire for (a distance covered by a journey of) seventy years.' In another narration: 'Allah shall put between him and the Fire a trench whose distance is like that between the heavens and the earth.'",
          note: "Bukhari 56:56; Muslim 13:217; Tirmidhi 22:6",
        },
        {
          title: "Freeing another from bondage",
          detail:
            "The Prophet (peace be upon him) said: 'If somebody manumits a Muslim slave, Allah will save from the Fire every part of his body for freeing the corresponding parts of the slave's body.' Deeds that liberate and relieve others become a person's own ransom from the Fire.",
          note: "Bukhari 84:8",
        },
        {
          title: "Two eyes the Fire will not touch",
          detail:
            "The Prophet (peace be upon him) said: 'There are two eyes that shall not be touched by the Fire: An eye that wept from the fear of Allah, and an eye that spent the night standing on guard in the cause of Allah.'",
          note: "Tirmidhi 22:22",
        },
      ],
      source:
        "Quran 66:6; Bukhari 24:21; Bukhari 56:56; Bukhari 84:8; Bukhari 88:20; Muslim 5:329; Muslim 13:217; Tirmidhi 22:6; Tirmidhi 22:22",
    },
  },
  {
    id: "duas-of-protection",
    name: "Du'as of Protection",
    content: {
      intro:
        "Seeking refuge from the Fire is not an occasional du'a — the Prophet (peace be upon him) built it into every single prayer, and the Quran puts it on the tongues of the believers as one of their defining traits.",
      points: [
        {
          title: "In every prayer — the tashahhud",
          detail:
            "The Prophet (peace be upon him) said: 'When any one of you utters tashahhud (in prayer) he must seek refuge with Allah from four (trials) and should thus say: O Allah! I seek refuge with Thee from the torment of the Hell, from the torment of the grave, from the trial of life and death and from the evil of the trial of Masih al-Dajjal.'",
          note: "Muslim 5:162",
        },
        {
          title: "Ask three times",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever asks Allah Paradise three times, Paradise says: O Allah, admit him into Paradise; and whoever seeks refuge from the Fire three times, the Fire says: O Allah, save him from the Fire.'",
          note: "Tirmidhi 38:50; Nasai 50:94",
        },
        {
          title: "The du'a of the believers in the Quran",
          detail:
            "Allah describes His servants as 'those who say: Our Lord, we believe, so forgive us our sins and protect us from the punishment of the Fire' — and those who reflect on creation and conclude: 'Our Lord, you have not created all this in vain. Glory be to You. Protect us from the punishment of the Fire.' The servants of the Most Merciful plead: 'Our Lord, turn the punishment of Hell away from us, for its punishment is unrelenting.'",
          note: "Quran 3:16; Quran 3:191; Quran 25:65-66",
        },
      ],
      source:
        "Quran 3:16; Quran 3:191; Quran 25:65-66; Muslim 5:162; Nasai 50:94; Tirmidhi 38:50",
    },
  },
  {
    id: "door-of-hope",
    name: "The Door of Hope",
    content: {
      intro:
        "Protection from the Fire is not earned by the flawless — it is granted by the Most Merciful to those who keep turning back to Him. Even grief, borne with faith, becomes a shield.",
      points: [
        {
          title: "Children as a shield",
          detail:
            "The Prophet (peace be upon him) told the believing women: 'No woman amongst you who sends her three children as her forerunners (in the Hereafter) but they would serve him as a protection against Hell-Fire.' A woman asked: 'What about two?' He said: 'Even if they are two.' And he said: 'A Muslim whose three children die before the age of puberty will be granted Paradise by Allah due to his mercy for them.'",
          note: "Muslim 45:196; Bukhari 23:11",
        },
        {
          title: "Do not despair",
          detail:
            "The door of repentance stands open. Allah says: 'O My slaves who have transgressed against themselves, do not despair of Allah's mercy, for indeed Allah forgives all sins. He is indeed the All-Forgiving, the Most Merciful.' This is the same verse of hope that closes the story of the last man to leave the Fire (see 'The Last to Enter' under How to Enter).",
          note: "Quran 39:53",
        },
        {
          title: "True success",
          detail:
            "Allah defines success itself by this one escape: 'Whoever is spared from the Fire and admitted into Paradise has truly won, for the life of this world is nothing but an illusory pleasure.' To be pulled away from the Fire is the victory every deed in this life is working toward.",
          note: "Quran 3:185",
        },
      ],
      source:
        "Quran 3:185; Quran 39:53; Bukhari 23:11; Muslim 45:196",
    },
  },
];

const jahannamMattersItems = [
  {
    point: "The Fire is as near as Paradise",
    detail:
      "The same hadith that brings Jannah close brings the Fire close too. The Prophet (peace be upon him) said: 'Paradise is nearer to any of you than the Shirak (leather strap) of his shoe, and so is the (Hell) Fire.' A single deed can draw a person toward either — which is why he also said: 'Save yourself from Hell-fire even by giving half a date-fruit in charity.'",
    reference: "Bukhari 81:77; Bukhari 24:21",
  },
  {
    point: "Fear and hope, held together",
    detail:
      "The Quran never mentions the Fire to crush hope — the servants of the Most Merciful plead, 'Our Lord, turn the punishment of Hell away from us, for its punishment is unrelenting,' and in the very same Book Allah declares: 'O My slaves who have transgressed against themselves, do not despair of Allah's mercy, for indeed Allah forgives all sins.' Remembering Jahannam keeps the heart awake; remembering Allah's mercy keeps it from despair.",
    reference: "Quran 25:65-66; Quran 39:53",
  },
  {
    point: "An archangel has not laughed since it was created",
    detail:
      "The Prophet (peace be upon him) asked Jibril: 'Why do I never see Mika'il laughing?' Jibril replied: 'Mika'il has not laughed since the Fire was created.' An archangel who beholds the unseen has not laughed since Jahannam came into being — those still able to escape it cannot afford to treat it lightly. (A similar account about Malik, the Fire's keeper, never smiling appears in a longer, weaker narration of the Night Journey; what is firmly established is Malik's role as its stern gate-keeper.)",
    reference: "Musnad Ahmad (13343) — graded hasan by al-Albani, Sahih al-Targhib 3664; Bukhari 59:47",
  },
  {
    point: "Remembrance that moves the heart",
    detail:
      "Allah praises 'those who remember Allah while standing, sitting, and lying on their sides, and reflect upon the creation of the heavens and earth' — and their reflection ends in one plea: 'Protect us from the punishment of the Fire.' Thinking about the Hereafter is not morbid; in the Quran it is the mark of a living, reflecting heart, and it is what turns belief into action.",
    reference: "Quran 3:191; Quran 3:16",
  },
  {
    point: "One dip erases the memory of the other life",
    detail:
      "The Prophet (peace be upon him) described the person of the world who lived in the greatest ease, dipped just once into the Fire, then asked: 'O, son of Adam, did you find any comfort, did you happen to get any material blessing?' He answers: 'By Allah, no, my Lord.' And the most afflicted believer, dipped once into Paradise, is asked whether he ever faced any hardship or distress, and answers that he never did. A single moment of either abode outweighs an entire lifetime of the other.",
    reference: "Muslim 52:42",
  },
];

type CommonQuestion = {
  q: string;
  answer: string;
  verse?: { arabic: string; text: string; ref: string };
  note?: string;
};

const commonQuestions: CommonQuestion[] = [
  {
    q: "Is Jannah already created, and where is it?",
    answer:
      "Yes — it already exists. When Allah created Paradise and Hell, He sent Jibril to look at what He had prepared for its people (Nasai 35:3), and Adam and his wife were told 'dwell in Paradise' before this worldly life began (Quran 2:35). As for where it is: the highest part, al-Firdaus, lies directly beneath the Throne, for the Prophet (peace be upon him) said 'at its top there is the Throne of Beneficent, and from it gush forth the rivers of Paradise' (Bukhari 97:51).",
  },
  {
    q: "Will we ever get bored in Jannah?",
    answer:
      "No. Allah removes from Paradise the two things that would make eternity wearisome — bad company and fatigue. There is no idle talk or sinful speech there, only peace (Quran 56:25-26); its people say Allah 'has caused us to settle... in the everlasting home, wherein no weariness or fatigue will touch us' (Quran 35:35); and 'they will have therein all what they wish for, and We have yet more' (Quran 50:35) — even a market where whatever the heart desires simply appears (Tirmidhi 38:28).",
    verse: {
      arabic: "لَا يَسْمَعُونَ فِيهَا لَغْوًا وَلَا تَأْثِيمًا إِلَّا قِيلًا سَلَـٰمًا سَلَـٰمًا",
      text: "They will not hear therein any idle talk or sinful speech, except the words of peace, peace.",
      ref: "Quran 56:25-26",
    },
  },
  {
    q: "Do animals or pets enter Paradise?",
    answer:
      "The Quran mentions that on the Day of Resurrection 'wild beasts are gathered' (Quran 81:5), and it describes birds in Paradise. But whether a particular pet is reunited with its owner is not settled by an explicit authentic text, and scholars have differed. What is certain is that the people of Paradise 'will have therein all what they wish for' (Quran 50:35); the specifics beyond the texts are left to Allah's knowledge.",
    note: "The reunion of a specific pet is a scholarly-summary point, not an established narration — flagged for founder review.",
  },
  {
    q: "What about people who never received the message?",
    answer:
      "Allah is perfectly just: 'nor do We punish until We have sent a messenger' (Quran 17:15). For those who lived where the message never authentically reached them — the people of the fatrah — the position of most scholars is that they will be tested on the Day of Judgement, and whoever obeys will enter Paradise. The exact mechanism is a matter of scholarly discussion; what is certain is that no one will be wronged.",
    note: "The 'test on the Day of Judgement' position is a scholarly summary of the majority view — consult a scholar; flagged for founder review.",
  },
];

// Two-level navigation: top tabs are the two abodes; the second row selects a
// view within the active abode. Section keys are unchanged from the flat-tab
// era so existing deep links (?tab=descriptions&sub=..., ?tab=jahannam) resolve.
const tabGroups = [
  {
    key: "jannah",
    label: "Jannah",
    sections: [
      { key: "intro", label: "What is Jannah?" },
      { key: "importance", label: "Why It Matters" },
      { key: "descriptions", label: "Descriptions" },
      { key: "how-to", label: "How to Enter" },
      { key: "common-questions", label: "Common Questions" },
    ],
  },
  {
    key: "jahannam",
    label: "Jahannam",
    sections: [
      { key: "jahannam-intro", label: "What is Jahannam?" },
      { key: "jahannam-importance", label: "Why It Matters" },
      { key: "jahannam", label: "Descriptions" },
      { key: "protection", label: "Protection from It" },
    ],
  },
] as const;

type SectionKey = (typeof tabGroups)[number]["sections"][number]["key"];
type GroupKey = (typeof tabGroups)[number]["key"];

const ALL_SECTION_KEYS = tabGroups.flatMap((g) => g.sections.map((s) => s.key)) as SectionKey[];

function groupOf(section: SectionKey): GroupKey {
  return tabGroups.find((g) => g.sections.some((s) => s.key === section))?.key ?? "jannah";
}

/* ───────────────────────── page ───────────────────────── */

function JannahContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useScrollToSection();
  const [activeSection, setActiveSection] = useState<SectionKey>(() => {
    const tab = searchParams.get("tab");
    if (tab === "jannah") return "intro"; // group alias
    // The what-is-jahannam rail topic became its own view; honor old links.
    if (tab === "jahannam" && (searchParams.get("sub") ?? searchParams.get("section")) === "what-is-jahannam")
      return "jahannam-intro";
    return ALL_SECTION_KEYS.includes(tab as SectionKey) ? (tab as SectionKey) : "intro";
  });
  // Deep-link support: ?sub=<topic id> (old ?section= accepted as a mount-time alias)
  const subParam = searchParams.get("sub") ?? searchParams.get("section");
  const [activeDescription, setActiveDescription] = useState(
    subParam && descriptionTopics.some((t) => t.id === subParam) ? subParam : "rivers-gardens"
  );
  const [activeHowTo, setActiveHowTo] = useState(
    subParam && howToTopics.some((t) => t.id === subParam) ? subParam : "conditions"
  );
  const [activeJahannam, setActiveJahannam] = useState(
    subParam && jahannamTopics.some((t) => t.id === subParam) ? subParam : "heat-depths"
  );
  const [activeProtection, setActiveProtection] = useState(
    subParam && protectionTopics.some((t) => t.id === subParam) ? subParam : "shield-of-deeds"
  );
  const [search, setSearch] = useState("");

  // Keep ?tab= / ?sub= in sync so the current view is shareable
  const syncUrl = (tab: SectionKey, sub?: string) => {
    router.replace(sub ? `${pathname}?tab=${tab}&sub=${sub}` : `${pathname}?tab=${tab}`, { scroll: false });
  };

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

  // auto-select the first visible topic when the active one is filtered out
  useEffect(() => {
    const d = descriptionTopics.filter(topicMatches);
    if (d.length && !d.some((t) => t.id === activeDescription)) setActiveDescription(d[0].id);
    const h = howToTopics.filter(topicMatches);
    if (h.length && !h.some((t) => t.id === activeHowTo)) setActiveHowTo(h[0].id);
    const j = jahannamTopics.filter(topicMatches);
    if (j.length && !j.some((t) => t.id === activeJahannam)) setActiveJahannam(j[0].id);
    const p = protectionTopics.filter(topicMatches);
    if (p.length && !p.some((t) => t.id === activeProtection)) setActiveProtection(p[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Jannah & Jahannam"
        titleAr="الجنة والنار"
        subtitle="Paradise and Hellfire — the two eternal abodes"
      />

      <VerseHero
        label="The Quran"
        arabic="كُلُّ نَفْسٍ ذَآئِقَةُ ٱلْمَوْتِ ۗ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ ٱلْقِيَـٰمَةِ ۖ فَمَن زُحْزِحَ عَنِ ٱلنَّارِ وَأُدْخِلَ ٱلْجَنَّةَ فَقَدْ فَازَ ۗ وَمَا ٱلْحَيَوٰةُ ٱلدُّنْيَآ إِلَّا مَتَـٰعُ ٱلْغُرُورِ"
        text="Every soul will taste death, and you will be paid your reward in full on the Day of Resurrection. Whoever is spared from the Fire and admitted into Paradise has truly won, for the life of this world is nothing but an illusory pleasure."
        reference="Quran 3:185"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search topics, descriptions, verses..." className="mb-6" />

      {/* Top level: the two abodes */}
      <TabBar
        tabs={tabGroups.map((g) => ({ key: g.key, label: g.label }))}
        activeTab={groupOf(activeSection)}
        onTabChange={(k) => {
          const first = tabGroups.find((g) => g.key === k)!.sections[0].key;
          setActiveSection(first);
          syncUrl(first);
        }}
        className="mb-4"
      />

      {/* Second level: views within the active abode */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabGroups
          .find((g) => g.key === groupOf(activeSection))!
          .sections.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setActiveSection(s.key);
                syncUrl(s.key);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === s.key
                  ? "bg-gold/20 text-gold border border-gold/40"
                  : "text-themed-muted hover:text-themed border sidebar-border"
              }`}
            >
              {s.label}
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
                  (Bukhari 59:55).
                </p>
                <p>
                  Jannah is not a distant idea awaiting creation — it already
                  exists. When Allah created it, He sent Jibril to look at it and
                  at what He had prepared for its people (Nasai 35:3). And its
                  scale is beyond the mind: Allah calls the believers to{" "}
                  <em>
                    &ldquo;Race one another towards forgiveness from your Lord and
                    Paradise the width of which is like the width of the heaven and
                    earth&rdquo;
                  </em>{" "}
                  (Quran 57:21), and to{" "}
                  <em>
                    &ldquo;hasten towards forgiveness from your Lord and a Paradise
                    as wide as the heavens and earth&rdquo;
                  </em>{" "}
                  (Quran 3:133). If the width of a single garden matches the
                  heavens and the earth, no worldly loss endured to reach it is
                  truly a loss.
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
            <SourcesCard sources={[
              { ref: "Quran 3:133", desc: "A garden as wide as the heavens and earth" },
              { ref: "Quran 57:21", desc: "Race towards a Paradise the width of the heaven and earth" },
              { ref: "Quran 3:185", desc: "Every soul will taste death; true success is entering Paradise" },
              { ref: "Quran 32:17", desc: "No soul knows what delight awaits them" },
              { ref: "Quran 39:53", desc: "Do not despair of the mercy of Allah" },
              { ref: "Nasai 35:3", desc: "Jibril sent to look at the already-created Paradise" },
              { ref: "Bukhari 59:55; Muslim 53:3", desc: "What no eye has seen, no ear has heard" },
              { ref: "Bukhari 56:8", desc: "One hundred degrees of Paradise" },
            ]} />
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
                      <HadithRefText text={item.reference} />
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
            <SourcesCard delay={0.4} sources={[
              { ref: "Quran 3:185", desc: "True success is being saved from the Fire and admitted to Paradise" },
              { ref: "Quran 32:17", desc: "What no soul knows has been hidden for them" },
              { ref: "Quran 44:56", desc: "No death in Paradise except the first death" },
              { ref: "Quran 75:22-23", desc: "Faces looking at their Lord" },
              { ref: "Bukhari 59:55; Muslim 53:3", desc: "What no eye has seen" },
              { ref: "Bukhari 75:33; Muslim 52:66", desc: "None enters Paradise by deeds alone" },
              { ref: "Bukhari 81:77", desc: "Paradise is closer than your sandal strap" },
              { ref: "Muslim 1:88", desc: "The lifting of the veil; seeing the Face of Allah" },
              { ref: "Muslim 53:50", desc: "Death slaughtered between Paradise and the Fire" },
            ]} />
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
                      onClick={() => {
                        setActiveDescription(topic.id);
                        syncUrl("descriptions", topic.id);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left flex items-center gap-2 ${
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
                          <TopicInfoCard topic={topic} showSource={false} />
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const t = descriptionTopics.find((x) => x.id === activeDescription);
              const rows = t ? topicSourceRefs(t) : [];
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
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
                      onClick={() => {
                        setActiveHowTo(topic.id);
                        syncUrl("how-to", topic.id);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left flex items-center gap-2 ${
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
                          <TopicInfoCard topic={topic} showSource={false} />
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const t = howToTopics.find((x) => x.id === activeHowTo);
              const rows = t ? topicSourceRefs(t) : [];
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
          </motion.div>
        )}

        {/* ─── Common Questions ─── */}
        {activeSection === "common-questions" && (
          <motion.div
            key="common-questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {commonQuestions
              .filter((item) =>
                !search || search.length < 2
                  ? true
                  : textMatch(search, item.q, item.answer),
              )
              .map((item, i) => (
                <ContentCard key={item.q} delay={0.05 + i * 0.05}>
                  <h3 className="font-semibold text-themed mb-2">{item.q}</h3>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    <HadithRefText text={item.answer} />
                  </p>
                  {item.verse && (
                    <div
                      className="rounded-lg p-4 mt-4"
                      style={{ backgroundColor: "var(--color-bg)" }}
                    >
                      <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                        {item.verse.arabic}
                      </p>
                      <p className="text-themed text-sm italic">
                        &ldquo;{item.verse.text}&rdquo;
                      </p>
                      <p className="text-xs text-themed-muted mt-2">
                        <HadithRefText text={item.verse.ref} />
                      </p>
                    </div>
                  )}
                  {item.note && (
                    <p className="text-xs text-gold/60 mt-3">{item.note}</p>
                  )}
                </ContentCard>
              ))}

            {/* Sources */}
            <SourcesCard delay={0.35} sources={[
              { ref: "Nasai 35:3", desc: "Jibril sent to the already-created Paradise" },
              { ref: "Quran 2:35", desc: "Adam told to dwell in Paradise before this life" },
              { ref: "Bukhari 97:51", desc: "Al-Firdaus beneath the Throne; rivers gush from it" },
              { ref: "Quran 56:25-26", desc: "No idle talk in Paradise, only peace" },
              { ref: "Quran 35:35", desc: "No weariness or fatigue will touch its people" },
              { ref: "Quran 50:35", desc: "They will have whatever they wish, and more" },
              { ref: "Tirmidhi 38:28", desc: "The market of Paradise — whatever is desired" },
              { ref: "Quran 81:5", desc: "Wild beasts gathered on the Day of Resurrection" },
              { ref: "Quran 17:15", desc: "Allah does not punish before sending a messenger" },
            ]} />
          </motion.div>
        )}

        {/* ─── What is Jahannam? ─── */}
        {activeSection === "jahannam-intro" && (
          <motion.div
            key="jahannam-intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                What is Jahannam?
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">Jahannam</span>{" "}
                  (جهنم) is the Fire — the abode of punishment that Allah has
                  prepared and warned about throughout the Quran. Just as Jannah
                  is real, the Fire is real, and Allah describes it in vivid
                  detail so that hearts turn to Him now, before the Day when
                  warnings become sight.
                </p>
                <p>
                  Allah describes Jahannam as having seven gates —{" "}
                  <em>&ldquo;each gate will have its allotted share of them&rdquo;</em>{" "}
                  (Quran 15:43-44). Its fuel is not wood: <em>&ldquo;beware of the Fire
                  whose fuel will be people and stones, which is prepared for the
                  disbelievers&rdquo;</em> (Quran 2:24; Quran 66:6).
                </p>
                <p>
                  The Quran and Sunnah describe the Fire not as something inert,
                  but as a creation with perception given by its Lord:{" "}
                  <em>&ldquo;When it sees them from a far distance, they will hear its
                  raging and roaring&rdquo;</em> (Quran 25:12) — and when they are thrown
                  in it, <em>&ldquo;they will hear its roaring as it boils up, almost
                  bursting in fury&rdquo;</em> (Quran 67:7-8). It will even speak: on the
                  Day when Allah asks it, <em>&ldquo;Have you reached your fill?&rdquo;</em> it
                  will answer, <em>&ldquo;Are there any more?&rdquo;</em> (Quran 50:30).
                </p>
                <p>
                  And it will be dragged before creation on that Day. Allah says
                  <em>&ldquo;and Hell is brought near on that Day&rdquo;</em> (Quran 89:23), and
                  the Prophet (peace be upon him) described how: <em>&ldquo;Hell would
                  be brought on that day (the Day of Judgment) with seventy
                  thousand bridles, and seventy thousand angels dragging each
                  bridle.&rdquo;</em> (Muslim 53:33; Tirmidhi 39:1). It remains the abode
                  of punishment — a real place — yet one that sees, roars, and
                  answers its Lord.
                </p>
                <p>
                  Yet every description of Jahannam in the Quran comes while its
                  readers are still alive — while the door to escape it is wide
                  open. Allah addresses the believers directly: <em>&ldquo;O you who
                  believe, protect yourselves and your families from a
                  Fire...&rdquo;</em> (Quran 66:6). The warning itself is a mercy: it
                  is given to people who still have time to act on it.
                </p>
              </div>
            </ContentCard>

            <ContentCard delay={0.2}>
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: "var(--color-bg)" }}
              >
                <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                  وَإِنَّ جَهَنَّمَ لَمَوْعِدُهُمْ أَجْمَعِينَ ۝ لَهَا سَبْعَةُ أَبْوَٰبٍ لِّكُلِّ بَابٍ مِّنْهُمْ جُزْءٌ مَّقْسُومٌ
                </p>
                <p className="text-themed text-sm italic">
                  &ldquo;And Hell is certainly the promised place for them, all
                  together. It has seven gates; each gate will have its allotted
                  share of them.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 15:43-44</p>
              </div>
            </ContentCard>

            {/* Sources */}
            <SourcesCard sources={[
              { ref: "Quran 15:43-44", desc: "The seven gates of Jahannam" },
              { ref: "Quran 2:24; Quran 66:6", desc: "Its fuel is people and stones" },
              { ref: "Quran 25:12; Quran 67:7-8", desc: "Its raging and roaring" },
              { ref: "Quran 50:30", desc: "'Are there any more?' — the Fire answers its Lord" },
              { ref: "Quran 89:23; Muslim 53:33; Tirmidhi 39:1", desc: "Brought near that Day with seventy thousand bridles, each dragged by seventy thousand angels" },
              { ref: "Quran 39:71", desc: "Driven to it in groups; the keepers' question" },
            ]} />
          </motion.div>
        )}

        {/* ─── Why It Matters (Jahannam) ─── */}
        {activeSection === "jahannam-importance" && (
          <motion.div
            key="jahannam-importance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Numbered points */}
            {jahannamMattersItems.filter(mattersMatches).map((item, i) => (
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
                      <HadithRefText text={item.reference} />
                    </p>
                  </div>
                </div>
              </ContentCard>
            ))}

            {/* Closing verse */}
            <ContentCard delay={0.25}>
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: "var(--color-bg)" }}
              >
                <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                  ٱلَّذِينَ يَذْكُرُونَ ٱللَّهَ قِيَـٰمًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِى خَلْقِ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَـٰذَا بَـٰطِلًا سُبْحَـٰنَكَ فَقِنَا عَذَابَ ٱلنَّارِ
                </p>
                <p className="text-themed text-sm italic">
                  &ldquo;Those who remember Allah while standing, sitting, and lying
                  on their sides, and reflect upon the creation of the heavens and
                  earth [saying], &lsquo;Our Lord, you have not created all this in
                  vain. Glory be to You. Protect us from the punishment of the
                  Fire.&rsquo;&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 3:191</p>
              </div>
            </ContentCard>

            {/* Sources */}
            <SourcesCard delay={0.3} sources={[
              { ref: "Bukhari 81:77", desc: "The Fire is as near as your sandal strap" },
              { ref: "Bukhari 24:21", desc: "Save yourself from the Fire even with half a date" },
              { ref: "Quran 25:65-66", desc: "The servants of the Most Merciful plead against the Fire" },
              { ref: "Quran 39:53", desc: "Do not despair of the mercy of Allah" },
              { ref: "Quran 3:16; Quran 3:191", desc: "The believers' reflection ends in one plea" },
              { ref: "Musnad Ahmad (13343); hasan — al-Albani, Sahih al-Targhib 3664", desc: "Mika'il has not laughed since the Fire was created" },
              { ref: "Bukhari 59:47", desc: "Malik, the gate-keeper of the Fire" },
            ]} />
          </motion.div>
        )}

        {/* ─── jahannam ─── */}
        {activeSection === "jahannam" && (
          <motion.div
            key="jahannam"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
                {jahannamTopics.filter(topicMatches).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveJahannam(topic.id);
                        syncUrl("jahannam", topic.id);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left flex items-center gap-2 ${
                        activeJahannam === topic.id
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
                  {jahannamTopics.map(
                    (topic) =>
                      activeJahannam === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
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

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const t = jahannamTopics.find((x) => x.id === activeJahannam);
              const rows = t ? topicSourceRefs(t) : [];
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
          </motion.div>
        )}

        {/* ─── protection ─── */}
        {activeSection === "protection" && (
          <motion.div
            key="protection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
                {protectionTopics.filter(topicMatches).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveProtection(topic.id);
                        syncUrl("protection", topic.id);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left flex items-center gap-2 ${
                        activeProtection === topic.id
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
                  {protectionTopics.map(
                    (topic) =>
                      activeProtection === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
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

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const t = protectionTopics.find((x) => x.id === activeProtection);
              const rows = t ? topicSourceRefs(t) : [];
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function JannahPage() {
  return <Suspense><JannahContent /></Suspense>;
}
