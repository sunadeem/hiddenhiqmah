"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import { textMatch } from "@/lib/search";
import ContentCard from "@/components/ContentCard";
import { BookOpen } from "lucide-react";
import HadithRefText from "@/components/HadithRefText";

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
    reference: "Quran 1:4, 69:1, 101:1, 75:1",
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
      ],
      source:
        "Bukhari 3:22, 92:65; Muslim 1:1, 0:15:159; Tirmidhi 36:29",
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
          note: "Muslim 54:134, 15:142",
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
        "Bukhari 60:118, 65:157; Muslim 54:23, 15:146; Abu Dawud 38:6; Quran 6:158, 18:94-99, 21:96, 27:82, 44:10-11",
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
        "Quran 14:48, 39:68; Bukhari 65:456; Muslim 52:13, 54:175",
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
        "Quran 70:43; Bukhari 81:115, 81:116; Muslim 53:67, 53:69",
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
      ],
      source:
        "Quran 70:4, 83:6; Bukhari 24:27; Muslim 4:193, 15:74",
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
          note: "Quran 69:19-20, 69:25-26; Quran 84:7-9",
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
      ],
      source:
        "Quran 17:13, 24:24, 69:19-26, 84:7-9; Bukhari 81:125; Muslim 53:94, 55:23; Tirmidhi 37:3",
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
        "Quran 21:47; Bukhari 80:101; Muslim 2:1, 48:41; Tirmidhi 27:108, 40:34",
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
      ],
      source:
        "Quran 2:255, 17:79; Bukhari 65:234; Muslim 1:90, 1:101",
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
        "Bukhari 81:167, 81:172; Muslim 43:33",
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

const sections = [
  { key: "intro", label: "What is Yawm al-Qiyamah?" },
  { key: "importance", label: "Why It Matters" },
  { key: "signs", label: "Signs of the Hour" },
  { key: "events", label: "Events of the Day" },
  { key: "salvation", label: "Salvation" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── sub-components ───────────────────────── */

function TopicInfoCard({ topic }: { topic: Topic }) {
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
    </ContentCard>
  );
}

/* ───────────────────────── page ───────────────────────── */

function DayOfJudgementContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "intro");
  const [search, setSearch] = useState("");
  const [activeSigns, setActiveSigns] = useState("minor-signs");
  const [activeEvents, setActiveEvents] = useState("trumpet");
  const [activeSalvation, setActiveSalvation] = useState("intercession");

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

      <PageSearch value={search} onChange={setSearch} placeholder="Search signs, events, verses..." className="mb-6" />

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
            <ContentCard>
              <div className="text-center py-6">
                <p className="text-xs text-themed-muted mb-3 uppercase tracking-wider">
                  The Quran
                </p>
                <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose mb-4">
                  يَوْمَ يَقُومُ ٱلنَّاسُ لِرَبِّ ٱلْعَـٰلَمِينَ
                </p>
                <p className="text-themed-muted italic mb-2 max-w-2xl mx-auto">
                  &ldquo;The Day when mankind will stand before the Lord of the
                  worlds.&rdquo;
                </p>
                <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Quran 83:6
                </span>
              </div>
            </ContentCard>

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

            {/* Sources */}
            <ContentCard delay={0.3}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Quran 1:4 — Master of the Day of Recompense",
                  "Quran 83:6 — The Day when mankind will stand before the Lord of the worlds",
                  "Quran 99:7-8 — Whoever does an atom's weight of good or evil will see it",
                  "Muslim 1:1 — Hadith of Jibril: belief in the Last Day is a pillar of faith",
                  "Bukhari 65:234 — The great intercession of the Prophet (peace be upon him)",
                ].map((source) => (
                  <li
                    key={source}
                    className="text-xs text-themed-muted leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    <HadithRefText text={source} />
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
                  أَفَحَسِبْتُمْ أَنَّمَا خَلَقْنَـٰكُمْ عَبَثًۭا وَأَنَّكُمْ إِلَيْنَا لَا تُرْجَعُونَ
                </p>
                <p className="text-themed-muted italic">
                  &ldquo;Did you think that We created you in vain and that you
                  would not be returned to Us?&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 23:115</p>
              </div>
            </ContentCard>

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
            <ContentCard delay={0.4}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Quran 1:4, 23:115, 69:1, 75:1, 99:7-8, 101:1 — Names and reality of the Day of Judgement",
                  "Quran 21:47 — The scales of justice on the Day of Resurrection",
                  "Muslim 1:1 — Hadith of Jibril on the pillars of faith",
                  "Muslim 53:75 — The sun being brought close on the Day of Judgement",
                  "Bukhari 65:234 — The great intercession",
                  "Tirmidhi 37:45 — The wise person holds himself accountable",
                ].map((source) => (
                  <li
                    key={source}
                    className="text-xs text-themed-muted leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    <HadithRefText text={source} />
                  </li>
                ))}
              </ul>
            </ContentCard>
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
                    onClick={() => setActiveSigns(topic.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
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
                  "Bukhari 3:22; Muslim 47:11 — Knowledge taken away, ignorance prevails",
                  "Bukhari 81:85 — When trust is lost, wait for the Hour",
                  "Bukhari 81:92; Muslim 7:55 — The Prophet and the Hour sent like two fingers",
                  "Bukhari 92:65 — A fire from Hijaz illuminating camels at Busra",
                  "Muslim 1:1 — Hadith of Jibril: slave woman, tall buildings",
                  "Muslim 54:23 — Widespread killing (al-harj)",
                  "Muslim 54:51 — Ten major signs mentioned together",
                  "Muslim 54:134, 15:146 — The Dajjal, descent of 'Isa, Ya'juj and Ma'juj",
                  "Bukhari 60:118 — The descent of 'Isa ibn Maryam",
                  "Bukhari 65:157 — The sun rising from the west",
                  "Abu Dawud 38:6 — The Mahdi from the descendants of Fatimah",
                  "Quran 6:158, 18:94-99, 21:96, 27:82, 44:10-11 — Major signs in the Quran",
                ].map((source) => (
                  <li
                    key={source}
                    className="text-xs text-themed-muted leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    <HadithRefText text={source} />
                  </li>
                ))}
              </ul>
            </ContentCard>
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
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
                {filteredEvents.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setActiveEvents(topic.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
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
                  "Quran 14:48, 17:13, 21:47, 24:24, 39:68, 57:12-13, 69:19-26, 70:4, 70:43, 83:6, 84:7-9",
                  "Bukhari 46:8, 97:65 — Resurrection, reckoning, scale, bridge",
                  "Muslim 1:102, 55:23 — Events of the Day",
                  "Tirmidhi 27:108, 40:34 — Good character, four questions, the card hadith",
                  "Tirmidhi 37:3 — Five questions on the Day of Judgement",
                ].map((source) => (
                  <li
                    key={source}
                    className="text-xs text-themed-muted leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    <HadithRefText text={source} />
                  </li>
                ))}
              </ul>
            </ContentCard>
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
                    onClick={() => setActiveSalvation(topic.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
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
                  "Quran 2:255 — No one intercedes except by His permission",
                  "Quran 17:79 — The Praised Station (al-Maqam al-Mahmud)",
                  "Quran 108:1-3 — Surah al-Kawthar",
                  "Bukhari 65:234; Muslim 1:381 — The great intercession",
                  "Bukhari 81:167, 81:172; Muslim 43:33 — The Hawd (Pool) of the Prophet",
                  "Bukhari 81:169 — The Prophet seeing al-Kawthar during the Night Journey",
                  "Muslim 1:90 — Others permitted to intercede by Allah's leave",
                  "Tirmidhi 47:413; Ibn Majah 37:235 — Description of al-Kawthar",
                ].map((source) => (
                  <li
                    key={source}
                    className="text-xs text-themed-muted leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    <HadithRefText text={source} />
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

export default function DayOfJudgementPage() {
  return <Suspense><DayOfJudgementContent /></Suspense>;
}
