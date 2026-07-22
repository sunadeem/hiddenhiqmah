"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TopicInfoCard, { topicSourceRefs } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import Accordion from "@hidden-hiqmah/ui/components/Accordion";

/* ───────────────────────── data ───────────────────────── */

const whyItMatters = [
  {
    point: "Belief in the Last Day is a pillar of faith",
    detail:
      "Belief in the Day of Judgement is one of the six articles of Islamic faith. The angel Jibril asked the Prophet (peace be upon him): 'Tell me about iman.' He replied: 'It is to believe in Allah, His angels, His books, His messengers, the Last Day, and to believe in destiny — its good and its evil.'",
    reference: "Muslim 1:1",
  },
  {
    point: "It is mentioned over 1,000 times in the Quran",
    detail:
      "The Day of Judgement is referred to by many names in the Quran — Yawm al-Qiyamah (Day of Resurrection), Yawm ad-Din (Day of Recompense), al-Haqqah (The Inevitable Reality), al-Qari'ah (The Striking Calamity), as-Sa'ah (The Hour), and more. Its constant mention shows its centrality in the Islamic worldview.",
    reference: "Quran 1:4; Quran 69:1; Quran 101:1; Quran 75:1",
  },
  {
    point: "It gives meaning to our actions",
    detail:
      "Without accountability, life would have no ultimate purpose. Allah says: 'Did you think that We created you in vain and that you would not be returned to Us?' The Day of Judgement is when every deed — no matter how small — is accounted for.",
    reference: "Quran 23:115; Quran 99:7-8",
  },
  {
    point: "Perfect justice will be established",
    detail:
      "In this world, oppressors may escape justice and the righteous may suffer. On the Day of Judgement, Allah will establish absolute justice. No soul will be wronged in the slightest — even the weight of an atom of good or evil will be seen.",
    reference: "Quran 21:47; Quran 99:7-8",
  },
  {
    point: "It motivates preparation and repentance",
    detail:
      "The Prophet (peace be upon him) said: 'The wise person is the one who holds himself accountable and works for what comes after death. And the helpless one is the one who follows his desires and then places his hope in Allah.' Awareness of the Day keeps the believer conscious of their deeds.",
    reference: "Tirmidhi 37:45",
  },
  {
    point: "The Prophet described it in vivid detail",
    detail:
      "The Prophet (peace be upon him) described the events of that Day with such detail — the sun being brought close, people drowning in sweat according to their deeds, the scales, the bridge — that the companions would weep hearing it. These descriptions are meant to awaken the heart.",
    reference: "Muslim 53:75; Bukhari 65:234",
  },
];

type Topic = {
  id: string;
  name: string;
  content: {
    intro: string;
    points: { title: string; detail: string; note?: string }[];
    verse?: { arabic: string; text: string; ref: string };
    source?: string;
  };
};

const signsTopics: Topic[] = [
  {
    id: "minor-signs",
    name: "Minor Signs",
    content: {
      intro:
        "The minor signs of the Hour are events that occur long before the Day of Judgement, many of which have already come to pass. The Prophet (peace be upon him) described them as warnings and reminders for the ummah.",
      points: [
        {
          title: "The sending of the Prophet Muhammad (peace be upon him)",
          detail:
            "The Prophet (peace be upon him) said: 'I and the Hour have been sent like these two,' and he joined his index and middle fingers together — indicating the closeness of his mission to the final Hour.",
          note: "Bukhari 81:92; Muslim 7:55",
        },
        {
          title: "The slave woman gives birth to her mistress",
          detail:
            "In the hadith of Jibril, the Prophet (peace be upon him) mentioned among the signs of the Hour: 'When the slave woman gives birth to her mistress.' Scholars have interpreted this as the spread of disobedience to parents, or the reversal of social order.",
          note: "Muslim 1:1",
        },
        {
          title: "Barefoot, naked shepherds compete in constructing tall buildings",
          detail:
            "The Prophet (peace be upon him) said the Hour would not come until 'you see barefoot, naked, destitute shepherds competing in constructing tall buildings.' This has been widely noted as fulfilled in modern times.",
          note: "Muslim 1:1",
        },
        {
          title: "Knowledge will be taken away and ignorance will prevail",
          detail:
            "The Prophet (peace be upon him) said: 'Among the signs of the Hour: knowledge will be taken away, ignorance will prevail, drinking of wine will be widespread, and adultery will be prevalent.'",
          note: "Bukhari 3:22; Muslim 47:11",
        },
        {
          title: "Widespread killing and bloodshed (al-harj)",
          detail:
            "The Prophet (peace be upon him) said: 'The Hour will not come until al-harj (killing) increases.' The companions asked: 'What is al-harj?' He said: 'Killing, killing' — indicating widespread, senseless violence.",
          note: "Muslim 54:23",
        },
        {
          title: "Time will pass quickly",
          detail:
            "The Prophet (peace be upon him) said: 'The Hour will not come until time passes quickly, so that a year will be like a month, a month like a week, a week like a day, a day like an hour, and an hour like the burning of a braid of palm leaves.'",
          note: "Tirmidhi 36:29; graded Sahih by al-Albani",
        },
        {
          title: "Widespread dishonesty and betrayal of trust",
          detail:
            "The Prophet (peace be upon him) said: 'When trust is lost, then wait for the Hour.' He was asked: 'How will trust be lost?' He said: 'When authority is given to those who do not deserve it, then wait for the Hour.'",
          note: "Bukhari 81:85",
        },
        {
          title: "A fire emerges from the land of Hijaz",
          detail:
            "The Prophet (peace be upon him) said: 'The Hour will not be established until a fire comes out of the land of Hijaz, and it will throw light on the necks of the camels at Busra.' Many scholars consider this fulfilled by the great volcanic eruption near Madinah in 654 AH (1256 CE), which was visible from great distances.",
          note: "Bukhari 92:65",
        },
        {
          title: "The Euphrates uncovers a mountain of gold",
          detail:
            "The Prophet (peace be upon him) said the Euphrates 'will disclose the treasure (the mountain) of gold, so whoever will be present at that time should not take anything of it.' In another narration, people will fight over it, and ninety-nine out of every hundred will be killed — each hoping to be the one who survives with the gold.",
          note: "Bukhari 92:66; Muslim 54:38; Muslim 54:40",
        },
        {
          title: "About thirty false prophets will appear",
          detail:
            "The Prophet (peace be upon him) said the Hour will not come 'till there appear about thirty liars, all of whom will be claiming to be the messengers of Allah.' He is the Seal of the Prophets — there is no true prophet after him.",
          note: "Bukhari 61:116; Bukhari 92:68; Abu Dawud 37:13",
        },
        {
          title: "A man will wish to be in the grave",
          detail:
            "The Prophet (peace be upon him) said: 'The Hour will not be established till a man passes by a grave of somebody and says, Would that I were in his place' — a sign of overwhelming trials and hardship, not out of longing for Allah but out of despair at the state of the world.",
          note: "Bukhari 92:62",
        },
        {
          title: "The conquest of Constantinople",
          detail:
            "Among the events preceding the Dajjal, the Prophet (peace be upon him) foretold a great battle with the Romans at al-A'maq or Dabiq, after which the Muslims 'would be conquerors of Constantinople.' It is while they are dividing the spoils that news of the Dajjal's emergence reaches them.",
          note: "Muslim 54:44",
        },
      ],
      source:
        "Bukhari 3:22; Bukhari 92:65; Muslim 1:1; Muslim 0:15:159; Tirmidhi 36:29",
    },
  },
  {
    id: "major-signs",
    name: "Major Signs",
    content: {
      intro:
        "The major signs of the Hour are extraordinary events that will occur close to the Day of Judgement. They will come in rapid succession, like beads falling from a broken string.",
      points: [
        {
          title: "The appearance of al-Mahdi",
          detail:
            "The Prophet (peace be upon him) said: 'The Mahdi is from my progeny, from the descendants of Fatimah.' He will fill the earth with justice and fairness after it has been filled with oppression and tyranny. He will lead the Muslims and rule for seven or nine years.",
          note: "Abu Dawud 38:6; Ibn Majah 36:161",
        },
        {
          title: "The emergence of al-Masih al-Dajjal (the False Messiah)",
          detail:
            "The greatest trial to face humanity. The Prophet (peace be upon him) said: 'Between the creation of Adam and the Hour, there is no greater trial than the Dajjal.' He will claim to be God, perform extraordinary feats, and lead many astray. He is one-eyed, and between his eyes is written 'kafir' (disbeliever), which every believer will be able to read.",
          note: "Muslim 54:134; Muslim 15:142",
        },
        {
          title: "The descent of 'Isa ibn Maryam (Jesus, peace be upon him)",
          detail:
            "Jesus (peace be upon him) will descend at the white minaret east of Damascus, wearing two garments lightly dyed with saffron, placing his hands on the wings of two angels. He will kill the Dajjal, break the cross, abolish the jizyah, and rule with justice. He will live on earth and then die, and the Muslims will pray over him.",
          note: "Muslim 54:134; Bukhari 60:118",
        },
        {
          title: "Ya'juj and Ma'juj (Gog and Magog)",
          detail:
            "After the Dajjal is killed, Allah will reveal to 'Isa: 'I have brought forth from among My servants people whom no one will be able to fight. Take My servants to Mount Tur.' Ya'juj and Ma'juj will spread corruption until Allah destroys them by sending worms into their necks.",
          note: "Muslim 54:134; Quran 18:94-99; Quran 21:96",
        },
        {
          title: "Three great landslides (khusuf)",
          detail:
            "Three major landslides (sinkings of the earth) will occur — one in the east, one in the west, and one in the Arabian Peninsula. These are among the ten major signs mentioned together by the Prophet (peace be upon him).",
          note: "Muslim 54:51",
        },
        {
          title: "A smoke (al-Dukhan) will cover the earth",
          detail:
            "A great smoke will envelop the earth. Allah says: 'Then watch for the Day when the sky will bring a visible smoke, covering the people. This is a painful torment.' The believers will experience it as a mild cold, while the disbelievers will be severely affected.",
          note: "Quran 44:10-11; Muslim 54:51",
        },
        {
          title: "The sun will rise from the west",
          detail:
            "The Prophet (peace be upon him) said: 'The Hour will not come until the sun rises from the west. When it rises from the west, all people will believe, but that will be when belief will no longer benefit a person who did not believe before.' After this, the door of repentance is closed.",
          note: "Bukhari 65:157; Muslim 33:253; Quran 6:158",
        },
        {
          title: "The Beast (al-Dabbah) will emerge",
          detail:
            "A beast will emerge from the earth and speak to people, marking the believers and the disbelievers. Allah says: 'And when the Word is fulfilled against them, We will produce for them a creature from the earth speaking to them — that the people were not certain of Our signs.'",
          note: "Quran 27:82; Muslim 54:51",
        },
        {
          title: "A fire will drive people to their gathering place",
          detail:
            "The last of the major signs — a fire will emerge from the direction of Yemen (from the bottom of Aden) and will drive the people to their place of gathering (the land of al-Sham).",
          note: "Muslim 54:51",
        },
      ],
      source:
        "Bukhari 60:118; Bukhari 65:157; Muslim 54:23; Muslim 15:146; Abu Dawud 38:6; Quran 6:158; Quran 18:94-99; Quran 21:96; Quran 27:82; Quran 44:10-11",
    },
  },
  {
    id: "dajjal",
    name: "The Dajjal (False Messiah)",
    content: {
      intro:
        "The Prophet (peace be upon him) warned of the Dajjal more than any other trial, calling it the greatest test since the creation of Adam. Every prophet warned their people about him, and the Prophet Muhammad (peace be upon him) gave his ummah specific, practical protections. He is a one-eyed man who will claim to be God and will be given power to appear to control rain, wealth, and life itself — but his right eye is defective, and between his eyes is written 'kafir' (disbeliever), which every believer will read.",
      points: [
        {
          title: "He will remain on earth for forty days",
          detail:
            "The Prophet (peace be upon him) said he would stay 'For forty days, one day like a year and one day like a month and one day like a week and the rest of the days would be like your days.' The companions asked whether one day's prayers would suffice for the day that is like a year. He said no — 'you must make an estimate of time' and observe the prayers accordingly.",
          note: "Muslim 54:134",
        },
        {
          title: "He cannot enter Madinah",
          detail:
            "The Prophet (peace be upon him) said: 'Neither Messiah (Ad-Dajjal) nor plague will enter Medina.' He will camp outside the city, which will then shake three times, driving out every disbeliever and hypocrite toward him — so the trial itself purifies the believing community.",
          note: "Bukhari 76:46; Bukhari 92:71; Bukhari 92:72",
        },
        {
          title: "Memorize the opening verses of Surah al-Kahf",
          detail:
            "The Prophet (peace be upon him) said: 'If anyone learns by heart the first ten verses of the Surah al-Kahf, he will be protected from the Dajjal.' In the long Dajjal narration he added that whoever meets him should recite over him the opening verses of Surah al-Kahf. The ten verses themselves are set out on the Protection page.",
          note: "Muslim 6:311; Abu Dawud 39:31; Muslim 54:134",
        },
        {
          title: "Seek refuge from his trial in every prayer",
          detail:
            "A'ishah reported that the Prophet (peace be upon him) sought refuge from the trial of the Dajjal in his prayer, and Abu Hurayrah reported that he sought refuge 'from the torment of the grave, torment of Hell and the trial of Dajjal.' This refuge is made in the final sitting of the prayer — the du'a is on the 'Preparing for the Day' tab.",
          note: "Muslim 5:161; Muslim 5:169",
        },
        {
          title: "'Isa (Jesus) will kill him",
          detail:
            "The Dajjal's reign ends when 'Isa ibn Maryam (peace be upon him) descends and catches him at the gate of Ludd, killing him. His descent and the destruction of the Dajjal are described among the Major Signs.",
          note: "Muslim 54:134",
        },
      ],
      source:
        "Muslim 5:161; Muslim 5:169; Muslim 6:311; Muslim 54:134; Bukhari 76:46; Bukhari 92:71; Bukhari 92:72; Abu Dawud 39:31",
    },
  },
];

const eventsTopics: Topic[] = [
  {
    id: "trumpet",
    name: "The Trumpet",
    content: {
      intro:
        "The Day of Judgement begins with the blowing of the Trumpet (as-Sur) by the angel Israfil. It will be blown twice — the first blast causes everything to perish, and the second causes all of creation to be resurrected.",
      verse: {
        arabic:
          "وَنُفِخَ فِى ٱلصُّورِ فَصَعِقَ مَن فِى ٱلسَّمَـٰوَٰتِ وَمَن فِى ٱلْأَرْضِ إِلَّا مَن شَآءَ ٱللَّهُ ۖ ثُمَّ نُفِخَ فِيهِ أُخْرَىٰ فَإِذَا هُمْ قِيَامٌ يَنظُرُونَ",
        text: "And the Trumpet will be blown, and all who are in the heavens and all who are on the earth will fall dead except whom Allah wills. Then it will be blown a second time, and at once they will be standing, looking on.",
        ref: "Quran 39:68",
      },
      points: [
        {
          title: "The first blast — everything perishes",
          detail:
            "The first blowing causes all living creation to die. The Prophet (peace be upon him) said: 'The Trumpet will be blown, and no one who hears it will remain alive except that he will tilt his neck (and die).' Between the two blasts is a period of forty.",
          note: "Bukhari 65:456; Muslim 54:175",
        },
        {
          title: "The second blast — all are resurrected",
          detail:
            "Then Allah will send rain from the sky, and the bodies will grow from the tailbone (the coccyx) like seeds grow from the earth. Then the Trumpet will be blown a second time, and every soul will rise from their graves, standing and looking.",
          note: "Bukhari 65:456; Muslim 54:175",
        },
        {
          title: "The earth will be changed",
          detail:
            "Allah says: 'On the Day the earth will be replaced by another earth, and the heavens as well, and they will come forth before Allah, the One, the Prevailing.' The earth will be flattened like a loaf of white bread — no landmarks, no shelter, nothing to hide behind.",
          note: "Quran 14:48; Muslim 52:13",
        },
      ],
      source:
        "Quran 14:48; Quran 39:68; Bukhari 65:456; Muslim 52:13; Muslim 54:175",
    },
  },
  {
    id: "resurrection",
    name: "The Resurrection",
    content: {
      intro:
        "All of mankind — from the first human to the last — will be raised from their graves and brought before Allah. The resurrection is physical and real, not metaphorical.",
      verse: {
        arabic:
          "يَوْمَ يَخْرُجُونَ مِنَ ٱلْأَجْدَاثِ سِرَاعًا كَأَنَّهُمْ إِلَىٰ نُصُبٍۢ يُوفِضُونَ",
        text: "The Day they will emerge from the graves rapidly as if they were, toward an erected idol, hastening.",
        ref: "Quran 70:43",
      },
      points: [
        {
          title: "Raised barefoot, naked, and uncircumcised",
          detail:
            "The Prophet (peace be upon him) said: 'You will be gathered barefoot, naked, and uncircumcised.' A'ishah asked: 'O Messenger of Allah, will men and women be looking at each other?' He said: 'The matter will be too serious for them to be concerned with that.'",
          note: "Bukhari 81:116; Muslim 53:67",
        },
        {
          title: "The first to be clothed will be Ibrahim",
          detail:
            "The Prophet (peace be upon him) said: 'The first of creation to be clothed on the Day of Resurrection will be Ibrahim (peace be upon him).'",
          note: "Bukhari 81:115",
        },
        {
          title: "People will be raised upon their deeds",
          detail:
            "The Prophet (peace be upon him) said: 'Every person will be raised in the state in which they died.' Those who died doing good will be raised upon goodness; those who died in sin will be raised upon that sin.",
          note: "Muslim 53:75",
        },
      ],
      source:
        "Quran 70:43; Bukhari 81:115; Bukhari 81:116; Muslim 53:67; Muslim 53:69",
    },
  },
  {
    id: "gathering",
    name: "The Gathering & Standing",
    content: {
      intro:
        "All of creation will be gathered on one plain and will stand before Allah for a period of 50,000 years. The sun will be brought close, and people will suffer according to the weight of their sins.",
      verse: {
        arabic:
          "يَوْمَ يَقُومُ ٱلنَّاسُ لِرَبِّ ٱلْعَـٰلَمِينَ",
        text: "The Day when mankind will stand before the Lord of the worlds.",
        ref: "Quran 83:6",
      },
      points: [
        {
          title: "Standing for 50,000 years",
          detail:
            "Allah says: 'The angels and the Spirit ascend to Him in a Day the measure of which is fifty thousand years.' Scholars explain that this refers to the length of the Day of Judgement. However, for the believer, it will be made easy — like a short obligatory prayer.",
          note: "Quran 70:4",
        },
        {
          title: "The sun is brought close — a mile away",
          detail:
            "The Prophet (peace be upon him) said: 'The sun will be brought close to the people on the Day of Resurrection until it is about a mile away.' People will be drowning in their own sweat according to their deeds — some to their ankles, some to their knees, some to their waists, and some will be bridled by it.",
          note: "Muslim 53:75",
        },
        {
          title: "Seven under the shade of Allah",
          detail:
            "The Prophet (peace be upon him) said: 'Seven will be shaded by Allah under His shade on the Day when there is no shade except His shade: a just leader, a youth who grew up in the worship of Allah, a man whose heart is attached to the mosques, two people who love each other for the sake of Allah, a man who is called by a woman of beauty and position but refuses, a man who gives charity so secretly that his left hand does not know what his right hand has given, and a man who remembers Allah in seclusion and his eyes overflow with tears.'",
          note: "Bukhari 24:27; Muslim 4:193",
        },
        {
          title: "Gathered in three classes",
          detail:
            "The Prophet (peace be upon him) said: 'People will be gathered in three classes on the Day of Resurrection: A class walking, a class riding, and a class upon their faces.' It was asked how they would walk on their faces, and he replied: 'Indeed the One Who made them walk upon their feet, is able to make them walk upon their faces.' People arrive at the gathering according to their deeds.",
          note: "Tirmidhi 47:194; Tirmidhi 47:195; Tirmidhi 37:10",
        },
      ],
      source:
        "Quran 70:4; Quran 83:6; Bukhari 24:27; Muslim 4:193; Muslim 15:74; Tirmidhi 37:10; Tirmidhi 47:194",
    },
  },
  {
    id: "reckoning",
    name: "The Reckoning",
    content: {
      intro:
        "Every person will be called to account for their deeds. Their record of deeds will be presented, and they will be questioned about how they spent their life, their body, their wealth, and their knowledge.",
      verse: {
        arabic:
          "وَكُلَّ إِنسَـٰنٍ أَلْزَمْنَـٰهُ طَـٰٓئِرَهُۥ فِى عُنُقِهِۦ ۖ وَنُخْرِجُ لَهُۥ يَوْمَ ٱلْقِيَـٰمَةِ كِتَـٰبًۭا يَلْقَىٰهُ مَنشُورًا",
        text: "And We have fastened every person's deeds to his neck, and on the Day of Resurrection We shall bring out for him a record which he will find wide open.",
        ref: "Quran 17:13",
      },
      points: [
        {
          title: "Five questions everyone will be asked",
          detail:
            "The Prophet (peace be upon him) said: 'The feet of the son of Adam shall not move on the Day of Judgement until he is asked about five things: about his life and how he spent it, about his body and how he wore it out, about his wealth — how he earned it and how he spent it, and about his knowledge and what he did with it.'",
          note: "Tirmidhi 37:3 (graded Hasan Sahih by at-Tirmidhi; graded Da'if by Darussalam)",
        },
        {
          title: "The record of deeds (right or left hand)",
          detail:
            "Those who receive their record in their right hand will have an easy reckoning. Allah says: 'As for he who is given his record in his right hand, he will say: Here, read my record! Indeed, I was certain that I would meet my account.' Those who receive it in their left hand or behind their back will say: 'I wish I had not been given my record.'",
          note: "Quran 69:19-20; Quran 69:25-26; Quran 84:7-9",
        },
        {
          title: "The private reckoning of the believer",
          detail:
            "The Prophet (peace be upon him) said: 'Allah will bring the believer close and place His veil over him, concealing him from the people, and will make him acknowledge his sins one by one. When the believer thinks he is doomed, Allah will say: I concealed them for you in the world, and I forgive them for you today.'",
          note: "Bukhari 46:2; Muslim 50:61",
        },
        {
          title: "The body will testify",
          detail:
            "If a person denies their sins, Allah will seal their mouth and their limbs will speak. Allah says: 'On the Day when their tongues, their hands, and their feet will bear witness against them as to what they used to do.'",
          note: "Quran 24:24; Muslim 55:23",
        },
        {
          title: "Salah is the first deed to be judged",
          detail:
            "The Prophet (peace be upon him) said: 'Indeed the first deed by which a servant will be called to account on the Day of Resurrection is his Salat. If it is complete, he is successful and saved, but if it is defective, he has failed and lost.' If the obligatory prayers fall short, Allah will ask whether the servant has any voluntary prayers to make up the deficiency — and 'then the rest of his deeds will be treated like that.'",
          note: "Tirmidhi 2:266; Abu Dawud 2:474; Nasai 37:26",
        },
        {
          title: "The first three judged — and condemned for showing off",
          detail:
            "The Prophet (peace be upon him) said the first three to be judged will be a martyr, a scholar who taught and recited the Quran, and a wealthy man who gave charity. Each will recount his great deed — but Allah will expose that it was done for reputation, not for Him. To the martyr He will say: 'You have told a lie. You fought that you might be called a brave warrior. And you were called so.' The scholar is likewise condemned for having studied and recited only to be called learned, and the wealthy man for giving only to be called generous. Each will be dragged on his face into the Fire, because the deed was done to be seen by people rather than for Allah.",
          note: "Muslim 33:218",
        },
        {
          title: "You will be asked about every blessing",
          detail:
            "No pleasure of this life is overlooked. Allah says: 'Then on that Day you will surely be asked about your worldly pleasures' — the health, security, food, and comfort we too easily take for granted.",
          note: "Quran 102:8",
        },
      ],
      source:
        "Quran 17:13; Quran 24:24; Quran 69:19-26; Quran 84:7-9; Quran 102:8; Bukhari 81:125; Muslim 33:218; Muslim 55:23; Tirmidhi 2:266; Tirmidhi 37:3",
    },
  },
  {
    id: "settling-scores",
    name: "The Settling of Scores",
    content: {
      intro:
        "Before a person reaches their final abode, the wrongs they committed against other people (huquq al-'ibad) must be settled. Unlike sins that are purely between a servant and Allah — which He may forgive out of His mercy — rights owed to other people are paid back in the only currency that has value on that Day: good deeds. This is why the Prophet (peace be upon him) taught that the truly bankrupt person is not the one without money, but the one who arrives with mountains of worship and leaves with nothing.",
      points: [
        {
          title: "The bankrupt one (al-muflis)",
          detail:
            "The Prophet (peace be upon him) asked his companions who they thought was poor. They said it was one who has neither money nor property. He said the truly poor of his ummah is the one who 'would come on the Day of Resurrection with prayers and fasts and Zakat but ... since he hurled abuses upon others, brought calumny against others and unlawfully consumed the wealth of others and shed the blood of others and beat others, and his virtues would be credited to the account of one (who suffered at his hand).' When his good deeds run out, the sins of those he wronged are loaded onto him, and he is thrown into the Fire.",
          note: "Muslim 45:77",
        },
        {
          title: "The first disputes judged are over bloodshed",
          detail:
            "The Prophet (peace be upon him) said: 'The cases which will be decided first (on the Day of Resurrection) will be the cases of blood-shedding.' The gravest violations of others' rights are settled first.",
          note: "Bukhari 81:122; Muslim 28:40",
        },
        {
          title: "Even the hornless sheep takes its claim",
          detail:
            "So complete is the justice of that Day that the Prophet (peace be upon him) said: 'Rights will certainly be restored to those entitled to them on the Day of Resurrection, (to the point that) even the hornless sheep will lay claim upon the horned one' that butted it. No wrong, against human or animal, is overlooked.",
          note: "Muslim 45:78; Tirmidhi 37:6",
        },
        {
          title: "The bridge of retaliation (al-qantarah)",
          detail:
            "The Prophet (peace be upon him) said the believers, after being saved from the Fire, 'will be stopped at a bridge between Paradise and Hell and mutual retaliation will be established among them regarding wrongs they have committed in the world against one another.' Only once they are cleansed and purified are they admitted into Paradise — each knowing his home there better than he knew his home in this world.",
          note: "Bukhari 81:124",
        },
        {
          title: "A flag for every betrayer",
          detail:
            "The Prophet (peace be upon him) said: 'Every betrayer will have a flag on the Day of Resurrection' by which he is recognized — so that broken trusts and treachery are exposed before all of creation. This is why settling debts, returning what was taken, and seeking the forgiveness of those you wronged is part of sincere repentance while you still can.",
          note: "Bukhari 58:28; Bukhari 78:201; Bukhari 90:13",
        },
      ],
      source:
        "Bukhari 58:28; Bukhari 78:201; Bukhari 81:122; Bukhari 81:124; Bukhari 90:13; Muslim 28:40; Muslim 45:77; Muslim 45:78; Tirmidhi 37:6",
    },
  },
  {
    id: "scale",
    name: "The Scale (al-Mizan)",
    content: {
      intro:
        "The Scale will be set up on the Day of Judgement to weigh the deeds of every person. It is a real, physical scale with two pans — one for good deeds and one for bad deeds. What is weighed is the deeds themselves.",
      verse: {
        arabic:
          "وَنَضَعُ ٱلْمَوَٰزِينَ ٱلْقِسْطَ لِيَوْمِ ٱلْقِيَـٰمَةِ فَلَا تُظْلَمُ نَفْسٌۭ شَيْـًۭٔا ۖ وَإِن كَانَ مِثْقَالَ حَبَّةٍۢ مِّنْ خَرْدَلٍ أَتَيْنَا بِهَا ۗ وَكَفَىٰ بِنَا حَـٰسِبِينَ",
        text: "And We set up the scales of justice for the Day of Resurrection, so no soul will be treated unjustly at all. And if there is even the weight of a mustard seed, We will bring it forth. And sufficient are We as accountant.",
        ref: "Quran 21:47",
      },
      points: [
        {
          title: "Two words heavy on the Scale",
          detail:
            "The Prophet (peace be upon him) said: 'Two words are light on the tongue, heavy on the Scale, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil-Azeem (Glory be to Allah and His praise, Glory be to Allah the Almighty).'",
          note: "Bukhari 80:101; Muslim 48:41",
        },
        {
          title: "The card (al-Bitaqah) hadith",
          detail:
            "A man will be brought on the Day of Judgement with 99 scrolls of sins, each scroll stretching as far as the eye can see. Then a small card will be brought with La ilaha illallah on it. The scrolls will be placed on one side and the card on the other — and the card will outweigh all the scrolls.",
          note: "Tirmidhi 40:34; graded Sahih by al-Albani",
        },
        {
          title: "Good character is heavy on the Scale",
          detail:
            "The Prophet (peace be upon him) said: 'Nothing is heavier on the believer's Scale on the Day of Resurrection than good character. Allah hates the one who is obscene and foul-mouthed.'",
          note: "Tirmidhi 27:108; graded Sahih by al-Albani",
        },
        {
          title: "Al-Hamd fills the Scale",
          detail:
            "The Prophet (peace be upon him) said: 'Purity is half of faith. Al-hamdulillah fills the Scale. SubhanAllah and al-hamdulillah fill what is between the heavens and the earth.'",
          note: "Muslim 2:1",
        },
      ],
      source:
        "Quran 21:47; Bukhari 80:101; Muslim 2:1; Muslim 48:41; Tirmidhi 27:108; Tirmidhi 40:34",
    },
  },
  {
    id: "bridge",
    name: "The Bridge (as-Sirat)",
    content: {
      intro:
        "The Sirat is a bridge laid over the Hellfire that every person must cross. It is sharper than a sword and thinner than a hair. People will cross it at different speeds according to their deeds.",
      points: [
        {
          title: "It is set up over the Hellfire",
          detail:
            "The Prophet (peace be upon him) described the bridge as being set over the middle of Hellfire. It has hooks and thorns like the thorns of the sa'dan plant. People will cross it, and the hooks will snatch them according to their deeds.",
          note: "Bukhari 97:65; Muslim 1:356",
        },
        {
          title: "Crossing speed depends on deeds",
          detail:
            "The Prophet (peace be upon him) said: 'Some will cross in the blink of an eye, some like lightning, some like wind, some like a fast horse, some like a camel rider, some will run, some will walk, some will crawl, and some will be snatched and thrown into the Hellfire.'",
          note: "Muslim 1:102",
        },
        {
          title: "The supplication on the Sirat",
          detail:
            "The Prophet (peace be upon him) said: 'The call of the messengers on that Day will be: Allahumma sallim, sallim (O Allah, save! Save!)' — imploring Allah to grant safety to those crossing.",
          note: "Bukhari 97:65; Muslim 1:102",
        },
        {
          title: "Light will guide the believers",
          detail:
            "Allah says: 'On the Day you see the believing men and believing women, their light proceeding before them and on their right.' The hypocrites will be told: 'Go back and seek light.' The believers' light will guide them across the Sirat.",
          note: "Quran 57:12-13",
        },
      ],
      source:
        "Quran 57:12-13; Bukhari 97:65; Muslim 1:102",
    },
  },
  {
    id: "final-separation",
    name: "The Final Separation",
    content: {
      intro:
        "Once the Bridge is crossed, the two groups reach their eternal homes and the door between them is sealed forever. The Prophet (peace be upon him) described the closing scenes of that Day in vivid, unforgettable images — the terror of the Fire being dragged forth, the supreme honour of the believers seeing their Lord, and the final abolition of death itself.",
      verse: {
        arabic: "وَأَنذِرْهُمْ يَوْمَ ٱلْحَسْرَةِ إِذْ قُضِىَ ٱلْأَمْرُ وَهُمْ فِى غَفْلَةٍ وَهُمْ لَا يُؤْمِنُونَ",
        text: "Warn them of the Day of Remorse when all matters will be decided, but they are heedless and they do not believe.",
        ref: "Quran 19:39",
      },
      points: [
        {
          title: "Hell dragged forth by seventy thousand angels",
          detail:
            "The Prophet (peace be upon him) said Hell would be brought on that day 'with seventy thousand bridles, and seventy thousand angels dragging each bridle.' Its sheer magnitude is beyond imagining.",
          note: "Muslim 53:33; Tirmidhi 39:1",
        },
        {
          title: "The believers will see their Lord",
          detail:
            "Looking at the full moon, the Prophet (peace be upon him) said: 'You people will see your Lord as you see this full moon, and you will have no trouble in seeing Him.' This vision of Allah — denied to the disbelievers — is the greatest delight the people of Paradise will ever be given.",
          note: "Bukhari 97:61; Bukhari 97:63; Bukhari 65:372",
        },
        {
          title: "Death is slaughtered — no more death",
          detail:
            "The Prophet (peace be upon him) said that Death will be brought 'in the shape of a black and white ram' and placed between Paradise and Hell. Both groups are asked, 'Do you know this?' and both answer, 'Yes, this is Death.' Then it is slaughtered, and a caller announces: 'O people of Paradise! Eternity for you and no death O people of Hell! Eternity for you and no death.' — adding joy to the joyful and grief to the grieving.",
          note: "Bukhari 65:252; Bukhari 81:137",
        },
      ],
      source:
        "Quran 19:39; Bukhari 65:252; Bukhari 65:372; Bukhari 81:137; Bukhari 97:61; Bukhari 97:63; Muslim 53:33; Tirmidhi 39:1",
    },
  },
];

const salvationTopics: Topic[] = [
  {
    id: "intercession",
    name: "The Intercession",
    content: {
      intro:
        "On the Day of Judgement, people will seek someone to intercede before Allah to begin the reckoning. All the prophets will decline until they come to the Prophet Muhammad (peace be upon him), who will be granted the greatest intercession (ash-Shafa'ah al-Uzma).",
      points: [
        {
          title: "People go from prophet to prophet",
          detail:
            "The people will go to Adam, then Nuh, then Ibrahim, then Musa, then 'Isa — each will say: 'I am not fit for this, go to someone else.' Each will mention a personal concern. Finally they will come to Muhammad (peace be upon him), who will say: 'I am the one for this.'",
          note: "Bukhari 65:234; Muslim 1:195",
        },
        {
          title: "The Prophet prostrates before Allah",
          detail:
            "The Prophet (peace be upon him) said: 'I will prostrate before my Lord and praise Him with praises that He will teach me. Then it will be said: O Muhammad, raise your head. Ask and you shall be given. Intercede and your intercession will be accepted.'",
          note: "Bukhari 65:234; Muslim 1:381",
        },
        {
          title: "Other forms of intercession",
          detail:
            "The Prophet (peace be upon him) will intercede for his ummah, and Allah will also permit the angels, the prophets, the righteous, and even the believers to intercede for one another. But no one intercedes except by Allah's permission.",
          note: "Muslim 1:90; Quran 2:255",
        },
        {
          title: "The al-Maqam al-Mahmud (Praised Station)",
          detail:
            "This is the station of intercession promised to the Prophet (peace be upon him). Allah says: 'And from the night, pray with it as additional worship for you; it is expected that your Lord will raise you to a praised station.' This is the greatest honor given to any created being.",
          note: "Quran 17:79; Bukhari 65:234",
        },
        {
          title: "Intercession for those who committed major sins",
          detail:
            "For the struggling believer, the most hope-giving narration is this: the Prophet (peace be upon him) said, 'My intercession is for the people who committed the major sins in my Ummah.' It is not reserved for the flawless — it is precisely for the sinners of his ummah who died upon faith.",
          note: "Tirmidhi 37:21; Tirmidhi 37:22; Abu Dawud 42:144",
        },
        {
          title: "The Quran will intercede for its companions",
          detail:
            "Intercession is not only through people. The Prophet (peace be upon him) said: 'Recite the Qur'an, for on the Day of Resurrection it will come as an intercessor for those who recite It.' The one who kept the Quran close in this life will find it pleading on their behalf on that Day — see the 'Preparing for the Day' tab.",
          note: "Muslim 6:302",
        },
      ],
      source:
        "Quran 2:255; Quran 17:79; Bukhari 65:234; Muslim 1:90; Muslim 1:101; Muslim 6:302; Tirmidhi 37:21; Tirmidhi 37:22; Abu Dawud 42:144",
    },
  },
  {
    id: "hawd",
    name: "The Hawd (Pool)",
    content: {
      intro:
        "Every prophet has a hawd (pool), and the Prophet Muhammad's (peace be upon him) hawd is the largest of them all. Its water is whiter than milk, its fragrance is more pleasant than musk, and its drinking cups are as numerous as the stars. Whoever drinks from it will never be thirsty again.",
      points: [
        {
          title: "Its vastness",
          detail:
            "The Prophet (peace be upon him) said: 'My pool is so large that it takes a month to cross it. Its water is whiter than milk, its smell is more pleasant than musk, and its drinking cups are as numerous as the stars of the sky. Whoever drinks from it will never be thirsty again.'",
          note: "Bukhari 81:167",
        },
        {
          title: "The cups are as numerous as the stars",
          detail:
            "The Prophet (peace be upon him) described the hawd as having cups placed around it, as numerous as the stars in the sky. Two channels from Paradise (from the river al-Kawthar) pour into it.",
          note: "Muslim 43:33",
        },
        {
          title: "Some will be turned away",
          detail:
            "The Prophet (peace be upon him) said: 'I will precede you to the Pool. Some people will be brought to me, and when I try to give them drink, they will be pulled away from me. I will say: My Lord, these are my companions! It will be said: You do not know what they innovated after you.'",
          note: "Bukhari 81:172",
        },
      ],
      source:
        "Bukhari 81:167; Bukhari 81:172; Muslim 43:33",
    },
  },
  {
    id: "al-kawthar",
    name: "Al-Kawthar",
    content: {
      intro:
        "Al-Kawthar is a river in Paradise granted exclusively to the Prophet Muhammad (peace be upon him). An entire surah of the Quran is named after it. It is the source that feeds into the Hawd on the Day of Judgement.",
      verse: {
        arabic: "إِنَّآ أَعْطَيْنَـٰكَ ٱلْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَٱنْحَرْ ۝ إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ",
        text: "Indeed, We have granted you al-Kawthar. So pray to your Lord and sacrifice. Indeed, your enemy is the one cut off.",
        ref: "Quran 108:1-3",
      },
      points: [
        {
          title: "A river in Paradise",
          detail:
            "The Prophet (peace be upon him) said: 'Al-Kawthar is a river in Paradise. Its banks are of gold, and it flows over pearls and precious gems. Its soil is more fragrant than musk, its water is sweeter than honey and whiter than snow.'",
          note: "Tirmidhi 47:413; Ibn Majah 37:235",
        },
        {
          title: "The Prophet saw it during the Night Journey",
          detail:
            "The Prophet (peace be upon him) said: 'While I was walking in Paradise, I came upon a river whose banks were domes of hollow pearls. I asked: What is this, O Jibril? He said: This is al-Kawthar which your Lord has given you.' The Prophet struck the water and found it to be the finest musk.",
          note: "Bukhari 81:169",
        },
      ],
      source:
        "Quran 108:1-3; Bukhari 81:169; Tirmidhi 47:413; Ibn Majah 37:235",
    },
  },
];

// "Preparing for the Day" — practical deeds. Single-view tab, so it keeps a
// curated SourcesCard below.
const preparingPoints = [
  {
    point: "Make the Quran your intercessor",
    detail:
      "The Prophet (peace be upon him) said: 'Recite the Qur'an, for on the Day of Resurrection it will come as an intercessor for those who recite It.' A consistent daily portion — even a few verses — builds an advocate for that Day.",
    reference: "Muslim 6:302",
  },
  {
    point: "Send abundant salawat upon the Prophet",
    detail:
      "The Prophet (peace be upon him) said: 'The person closest to me on the Day of Judgement is the one who sent the most Salat upon me.' Sending blessings on him is light to say and draws you near to the one whose intercession you will hope for.",
    reference: "Tirmidhi 3:32",
  },
  {
    point: "Let the Quran take you to that Day",
    detail:
      "The Prophet (peace be upon him) said: 'Whoever wishes to look at the Day of Resurrection, as if he is seeing it with this eye, then let him recite' Surahs at-Takwir (81), al-Infitar (82), and al-Inshiqaq (84). Reciting and pondering these short, vivid surahs keeps the reality of the Day alive in the heart.",
    reference: "Tirmidhi 47:385",
  },
  {
    point: "Settle your accounts with people now",
    detail:
      "Because wrongs against others are repaid from your good deeds on that Day (see 'The Settling of Scores'), the wise believer returns what was taken, repays debts, and seeks the pardon of anyone they wronged while it can still be done with words rather than deeds.",
    reference: "Muslim 45:77",
  },
];

const faqItems = [
  {
    id: "children",
    title: "What happens to children who die?",
    body:
      "The mainstream position of scholars is that the young children of the believers are in Paradise, and many scholars hold that all children who die before the age of accountability enter Paradise, as they die in a state of natural purity (fitrah) with no sins recorded against them. There is a recognized scholarly discussion on the specifics, so a knowledgeable scholar should be consulted for detail; but the consistent thrust of the texts is one of mercy for those who died before they could be held responsible.",
    generic: true,
  },
  {
    id: "never-heard",
    title: "What about those who never received the message?",
    body:
      "Allah says: 'No bearer of burden will bear the burden of another, nor do We punish until We have sent a messenger' (Quran 17:15). The majority position is that those who genuinely never received the message of Islam in a way they could understand — the people of the fatrah (the interval between prophets), and those in comparable situations — are not held to the same account as one who rejected a clear message. Many scholars hold that such people will be tested on the Day of Resurrection. The details are a matter of scholarly discussion; the anchor is Allah's justice — He never punishes anyone for a message that never reached them.",
    generic: true,
  },
  {
    id: "recognize-family",
    title: "Will I recognize my family on that Day?",
    body:
      "The overwhelming terror of the Day means each person is consumed by their own situation. Allah describes it — 'everyone will flee from his brother, and from his mother and father, and from his wife and children. On that day, everyone will have enough concern of his own' (Quran 80:34-37). This is why the bonds that truly last are those built on faith and righteousness — the people of Paradise are reunited there with the believers among their families.",
    generic: false,
  },
  {
    id: "when",
    title: "Why does no one know when the Hour will come?",
    body:
      "Its timing is knowledge Allah kept for Himself alone. When asked about the Hour, the Prophet (peace be upon him) was told to reply: 'Its knowledge is only with my Lord' (Quran 7:187). The wisdom is that not knowing keeps every generation ready — living each day as though the Hour could arrive, since by the time its final signs appear, faith will no longer benefit the one who did not believe before (Quran 6:158).",
    generic: false,
  },
];

const sections = [
  { key: "intro", label: "What is Yawm al-Qiyamah?" },
  { key: "importance", label: "Why It Matters" },
  { key: "signs", label: "Signs of the Hour" },
  { key: "events", label: "Events of the Day" },
  { key: "salvation", label: "Salvation" },
  { key: "preparing", label: "Preparing for the Day" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

// The chronological order of the Day — an at-a-glance map so the parallel
// Events pills read as a sequence. Each step links to its rail topic (some live
// on the Salvation tab). Reuses only refs already cited on the page.
const timelineSteps: { label: string; tab: SectionKey; sub: string }[] = [
  { label: "The Trumpet is blown", tab: "events", sub: "trumpet" },
  { label: "The Resurrection", tab: "events", sub: "resurrection" },
  { label: "The Gathering & Standing", tab: "events", sub: "gathering" },
  { label: "The Great Intercession begins", tab: "salvation", sub: "intercession" },
  { label: "The Reckoning", tab: "events", sub: "reckoning" },
  { label: "The Settling of Scores", tab: "events", sub: "settling-scores" },
  { label: "The Scale (al-Mizan)", tab: "events", sub: "scale" },
  { label: "The Bridge (as-Sirat)", tab: "events", sub: "bridge" },
  { label: "The Hawd (Pool)", tab: "salvation", sub: "hawd" },
  { label: "The Final Separation — Paradise or the Fire", tab: "events", sub: "final-separation" },
];

/* ───────────────────────── page ───────────────────────── */

function DayOfJudgementContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "intro");
  const [search, setSearch] = useState("");
  // Deep-link support: ?sub=<topic id> (old ?section= accepted as a mount-time alias)
  const subParam = searchParams.get("sub") ?? searchParams.get("section");
  const [activeSigns, setActiveSigns] = useState(
    subParam && signsTopics.some((t) => t.id === subParam) ? subParam : "minor-signs"
  );
  const [activeEvents, setActiveEvents] = useState(
    subParam && eventsTopics.some((t) => t.id === subParam) ? subParam : "trumpet"
  );
  const [activeSalvation, setActiveSalvation] = useState(
    subParam && salvationTopics.some((t) => t.id === subParam) ? subParam : "intercession"
  );

  // Keep ?tab= / ?sub= in sync so the current view is shareable
  const syncUrl = (tab: SectionKey, sub?: string) => {
    router.replace(sub ? `${pathname}?tab=${tab}&sub=${sub}` : `${pathname}?tab=${tab}`, { scroll: false });
  };

  const topicMatches = (t: { name?: string; point?: string; detail?: string; reference?: string; content?: { intro: string; points: { title: string; detail: string; note?: string }[]; verse?: { arabic: string; text: string; ref: string }; source?: string } }) => {
    if (!search || search.length < 2) return true;
    if ('content' in t && t.content) {
      return textMatch(search, t.name, t.content.intro, t.content.source,
        t.content.verse?.text, t.content.verse?.ref,
        ...t.content.points.map(p => p.title),
        ...t.content.points.map(p => p.detail),
      );
    }
    // For whyItMatters items
    return textMatch(search, t.point, t.detail, t.reference);
  };

  const filteredSigns = signsTopics.filter(topicMatches);
  const filteredEvents = eventsTopics.filter(topicMatches);
  const filteredSalvation = salvationTopics.filter(topicMatches);
  const filteredWhyItMatters = whyItMatters.filter(topicMatches);

  // House rule: the References card below a rail shows only the ACTIVE
  // selection's sources, never the whole tab's aggregate.
  const activeSignsTopic = signsTopics.find((t) => t.id === activeSigns);
  const activeEventsTopic = eventsTopics.find((t) => t.id === activeEvents);
  const activeSalvationTopic = salvationTopics.find((t) => t.id === activeSalvation);

  // Auto-select first visible topic if current selection is filtered out
  useEffect(() => {
    if (filteredSigns.length > 0 && !filteredSigns.find(t => t.id === activeSigns)) {
      setActiveSigns(filteredSigns[0].id);
    }
  }, [filteredSigns, activeSigns]);

  useEffect(() => {
    if (filteredEvents.length > 0 && !filteredEvents.find(t => t.id === activeEvents)) {
      setActiveEvents(filteredEvents[0].id);
    }
  }, [filteredEvents, activeEvents]);

  useEffect(() => {
    if (filteredSalvation.length > 0 && !filteredSalvation.find(t => t.id === activeSalvation)) {
      setActiveSalvation(filteredSalvation[0].id);
    }
  }, [filteredSalvation, activeSalvation]);

  return (
    <div>
      <PageHeader
        title="Day of Judgement"
        titleAr="يوم القيامة"
        subtitle="The greatest day — when every soul will stand before Allah and be held accountable."
      />

      <VerseHero
        label="The Quran"
        arabic="يَوْمَ يَقُومُ ٱلنَّاسُ لِرَبِّ ٱلْعَـٰلَمِينَ"
        text="The Day when mankind will stand before the Lord of the worlds."
        reference="Quran 83:6"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search signs, events, verses..." className="mb-6" />

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
        {/* ─── What is Yawm al-Qiyamah? ─── */}
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
                What is Yawm al-Qiyamah?
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">
                    Yawm al-Qiyamah
                  </span>{" "}
                  (يوم القيامة) — the Day of Resurrection — is the day when all
                  of creation will be raised from death, gathered before Allah,
                  and held accountable for every deed they performed in this
                  life. It is the ultimate destination that every human being is
                  heading toward.
                </p>
                <p>
                  The Quran refers to this Day by many names, each highlighting
                  a different aspect of its reality:{" "}
                  <em>Yawm ad-Din</em> (Day of Recompense),{" "}
                  <em>al-Haqqah</em> (The Inevitable Reality),{" "}
                  <em>al-Qari&apos;ah</em> (The Striking Calamity),{" "}
                  <em>as-Sa&apos;ah</em> (The Hour),{" "}
                  <em>Yawm al-Hisab</em> (Day of Reckoning),{" "}
                  and <em>Yawm al-Fasl</em> (Day of Separation between truth and
                  falsehood).
                </p>
                <p>
                  On this Day, the scales will be set up, the records of deeds
                  will be distributed, the bridge over Hellfire will be crossed,
                  and every soul will be sent to its final abode — either
                  Paradise or the Hellfire. Allah says:{" "}
                  <em>
                    &ldquo;So whoever does an atom&apos;s weight of good will see
                    it, and whoever does an atom&apos;s weight of evil will see
                    it.&rdquo;
                  </em>{" "}
                  (Quran 99:7-8).
                </p>
                <p>
                  No one knows when the Hour will come except Allah. The Prophet
                  (peace be upon him) said:{" "}
                  <em>
                    &ldquo;The one who is asked about it knows no more than the
                    one who is asking.&rdquo;
                  </em>{" "}
                  (Muslim 1:1). However, the Prophet described its signs and
                  events in great detail, so that the believers would prepare for
                  it as though it could come at any moment.
                </p>
                <p>
                  Belief in the Day of Judgement is one of the six articles of
                  faith in Islam. Without it, no amount of outward worship is
                  accepted. It is the anchor that gives meaning to every trial,
                  every injustice endured, and every good deed performed in this
                  temporary world.
                </p>
              </div>
            </ContentCard>

            {/* The three stages of the journey — de-orphan the neighbouring pages */}
            <ContentCard delay={0.15}>
              <h3 className="font-semibold text-themed mb-1">One journey, three stages</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                The Day of Judgement is the middle stage of a single journey. Before it
                comes life in the grave (al-Barzakh); after the reckoning comes the
                eternal home — Paradise or the Fire.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/barzakh"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  ← Before: the grave &amp; al-Barzakh
                </Link>
                <Link
                  href="/jannah"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  After: Paradise &amp; the Fire →
                </Link>
              </div>
            </ContentCard>

            {/* Common questions */}
            <ContentCard delay={0.2}>
              <h3 className="font-semibold text-themed mb-3">Common questions</h3>
              <Accordion
                items={faqItems.map((f) => ({
                  id: f.id,
                  title: f.title,
                  children: (
                    <p className="text-themed-muted text-sm leading-relaxed">
                      {f.body}
                      {f.generic && (
                        <span className="block mt-2 text-xs text-themed-muted italic">
                          General scholarly position — consult a qualified scholar for detail.
                        </span>
                      )}
                    </p>
                  ),
                }))}
              />
            </ContentCard>

            {/* Sources */}
            <SourcesCard sources={[
              { ref: "Quran 1:4", desc: "Master of the Day of Recompense" },
              { ref: "Quran 83:6", desc: "The Day when mankind will stand before the Lord of the worlds" },
              { ref: "Quran 99:7-8", desc: "Whoever does an atom's weight of good or evil will see it" },
              { ref: "Quran 7:187", desc: "Knowledge of the Hour is with Allah alone" },
              { ref: "Quran 17:15", desc: "Nor do We punish until We have sent a messenger" },
              { ref: "Quran 80:34-37", desc: "Everyone will flee from his own family on that Day" },
              { ref: "Muslim 1:1", desc: "Hadith of Jibril: belief in the Last Day is a pillar of faith" },
              { ref: "Bukhari 65:234", desc: "The great intercession of the Prophet (peace be upon him)" },
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
            {filteredWhyItMatters.map((item, i) => (
              <ContentCard key={item.point} delay={0.05 + i * 0.05}>
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

            {/* Sources */}
            <SourcesCard delay={0.4} sources={[
              { ref: "Quran 1:4; Quran 23:115; Quran 69:1; Quran 75:1; Quran 99:7-8; Quran 101:1", desc: "Names and reality of the Day of Judgement" },
              { ref: "Quran 21:47", desc: "The scales of justice on the Day of Resurrection" },
              { ref: "Muslim 1:1", desc: "Hadith of Jibril on the pillars of faith" },
              { ref: "Muslim 53:75", desc: "The sun being brought close on the Day of Judgement" },
              { ref: "Bukhari 65:234", desc: "The great intercession" },
              { ref: "Tirmidhi 37:45", desc: "The wise person holds himself accountable" },
            ]} />
          </motion.div>
        )}

        {/* ─── Signs of the Hour ─── */}
        {activeSection === "signs" && (
          <motion.div
            key="signs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
                {filteredSigns.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setActiveSigns(topic.id);
                      syncUrl("signs", topic.id);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left ${
                      activeSigns === topic.id
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
                  {filteredSigns.map(
                    (topic) =>
                      activeSigns === topic.id && (
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

            {/* Sources — active selection only */}
            {activeSignsTopic && topicSourceRefs(activeSignsTopic).length > 0 && (
              <SourcesCard className="mt-8" sources={topicSourceRefs(activeSignsTopic)} />
            )}
          </motion.div>
        )}

        {/* ─── Events of the Day ─── */}
        {activeSection === "events" && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Ordered timeline — the sequence of the Day at a glance */}
            {(!search || search.length < 2) && (
              <ContentCard className="mb-6">
                <h3 className="font-semibold text-themed mb-1">The sequence of the Day</h3>
                <p className="text-themed-muted text-sm leading-relaxed mb-3">
                  The events below unfold in order. Tap any step to jump to it.
                </p>
                <ol className="space-y-1.5">
                  {timelineSteps.map((step, i) => (
                    <li key={step.sub}>
                      <button
                        onClick={() => {
                          if (step.tab === "events") {
                            setActiveEvents(step.sub);
                            syncUrl("events", step.sub);
                          } else {
                            setActiveSection(step.tab);
                            setActiveSalvation(step.sub);
                            syncUrl(step.tab, step.sub);
                          }
                        }}
                        className="w-full flex items-center gap-3 text-left rounded-lg px-3 py-2 border sidebar-border hover:border-gold/40 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 text-gold text-xs font-semibold">
                          {i + 1}
                        </span>
                        <span className="text-sm text-themed">{step.label}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-themed-muted mt-3">
                  <HadithRefText text="Quran 39:68; Muslim 54:175; Bukhari 65:234; Muslim 1:102" />
                </p>
              </ContentCard>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
                {filteredEvents.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setActiveEvents(topic.id);
                      syncUrl("events", topic.id);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left ${
                      activeEvents === topic.id
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
                  {filteredEvents.map(
                    (topic) =>
                      activeEvents === topic.id && (
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

            {/* Sources — active selection only */}
            {activeEventsTopic && topicSourceRefs(activeEventsTopic).length > 0 && (
              <SourcesCard className="mt-8" sources={topicSourceRefs(activeEventsTopic)} />
            )}
          </motion.div>
        )}

        {/* ─── Salvation ─── */}
        {activeSection === "salvation" && (
          <motion.div
            key="salvation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
                {filteredSalvation.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setActiveSalvation(topic.id);
                      syncUrl("salvation", topic.id);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left ${
                      activeSalvation === topic.id
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
                  {filteredSalvation.map(
                    (topic) =>
                      activeSalvation === topic.id && (
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

            {/* Sources — active selection only */}
            {activeSalvationTopic && topicSourceRefs(activeSalvationTopic).length > 0 && (
              <SourcesCard className="mt-8" sources={topicSourceRefs(activeSalvationTopic)} />
            )}
          </motion.div>
        )}

        {/* ─── Preparing for the Day ─── */}
        {activeSection === "preparing" && (
          <motion.div
            key="preparing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <ContentCard delay={0.05}>
              <h2 className="text-xl font-semibold text-themed mb-2">
                Preparing for the Day
              </h2>
              <p className="text-themed-muted text-sm leading-relaxed">
                The point of learning about the Day is not fear alone but action. The
                Prophet (peace be upon him) said the wise person is the one who holds
                himself accountable and works for what comes after death. These are
                deeds he taught his ummah to store up for that Day.
              </p>
            </ContentCard>

            {preparingPoints.map((item, i) => (
              <ContentCard key={item.point} delay={0.1 + i * 0.05}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold font-semibold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-themed mb-1">{item.point}</h3>
                    <p className="text-themed-muted text-sm leading-relaxed">
                      <HadithRefText text={item.detail} />
                    </p>
                    <p className="text-xs text-gold/60 mt-2">
                      <HadithRefText text={item.reference} />
                    </p>
                  </div>
                </div>
              </ContentCard>
            ))}

            {/* The refuge du'a of the tashahhud */}
            <ContentCard delay={0.3}>
              <h3 className="font-semibold text-themed mb-1">
                Seek refuge from the four trials in every prayer
              </h3>
              <p className="text-themed-muted text-sm leading-relaxed mb-3">
                The Prophet (peace be upon him) taught that after the final tashahhud, before
                the tasleem, one should seek refuge in Allah from four things. He also sought
                refuge from the Dajjal&apos;s trial in his prayer.
              </p>
              <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg)" }}>
                <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                  اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ وَمِنْ عَذَابِ الْقَبْرِ وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ
                </p>
                <p className="text-xs text-themed-muted italic mb-1">
                  Allahumma inni a&apos;udhu bika min &apos;adhabi jahannam, wa min
                  &apos;adhabil-qabr, wa min fitnatil-mahya wal-mamat, wa min sharri
                  fitnatil-masihid-dajjal.
                </p>
                <p className="text-themed text-sm italic">
                  &ldquo;O Allah! I seek refuge with Thee from the torment of the Hell, from the
                  torment of the grave, from the trial of life and death and from the evil of
                  the trial of Masih al-Dajjal (Antichrist).&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">
                  <HadithRefText text="Muslim 5:162; Muslim 5:161; Muslim 5:169" />
                </p>
              </div>
            </ContentCard>

            {/* Cross-links to deeds covered elsewhere on the page */}
            <ContentCard delay={0.35}>
              <h3 className="font-semibold text-themed mb-1">Deeds that weigh heavy on that Day</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Much of what prepares you for the Day is already elsewhere on this page: the
                dhikr and good character that fill the Scale, and the deeds that place you
                among the seven shaded by Allah&apos;s throne when there is no other shade.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <button
                  onClick={() => { setActiveSection("events"); setActiveEvents("scale"); syncUrl("events", "scale"); }}
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  What fills the Scale →
                </button>
                <button
                  onClick={() => { setActiveSection("events"); setActiveEvents("gathering"); syncUrl("events", "gathering"); }}
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  The seven shaded by Allah →
                </button>
                <button
                  onClick={() => { setActiveSection("events"); setActiveEvents("settling-scores"); syncUrl("events", "settling-scores"); }}
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Settle your scores now →
                </button>
              </div>
            </ContentCard>

            <SourcesCard delay={0.4} sources={[
              { ref: "Muslim 6:302", desc: "Recite the Quran — it will come as an intercessor on the Day of Resurrection" },
              { ref: "Tirmidhi 3:32", desc: "The closest to the Prophet is the one who sent the most salat upon him" },
              { ref: "Tirmidhi 47:385", desc: "Whoever wishes to see the Day, let him recite Surahs at-Takwir, al-Infitar, al-Inshiqaq" },
              { ref: "Muslim 5:162", desc: "The tashahhud refuge from the four trials" },
              { ref: "Muslim 5:161; Muslim 5:169", desc: "Seeking refuge from the Dajjal's trial in prayer" },
              { ref: "Muslim 45:77", desc: "The bankrupt one — settling rights with people" },
            ]} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DayOfJudgementPage() {
  return <Suspense><DayOfJudgementContent /></Suspense>;
}
