"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import SubTabLayout from "@hidden-hiqmah/ui/components/SubTabLayout";
import TopicInfoCard, { type Topic } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";

/* ───────────────────────── data ───────────────────────── */

const doorTopics: Topic[] = [
  {
    id: "allahs-joy",
    name: "Allah's Joy at Your Return",
    content: {
      intro:
        "Before tawbah is a duty, it is a welcome. The Prophet (peace be upon him) described Allah's delight at a returning servant with the most vivid image his companions knew: a traveler alone in the desert whose camel — carrying all his food and water — is lost, then suddenly found.",
      points: [
        {
          title: "More pleased than the man who found his camel",
          detail:
            "The Prophet (peace be upon him) said: 'Allah is more pleased with the repentance of His servant when he turns penitently towards Him than one of you would be on finding the lost camel.' In Bukhari's wording: 'Allah is more pleased with the repentance of His slave than anyone of you is pleased with finding his camel which he had lost in the desert.' The man in the parable had given up on life itself — and that is the scale of joy your return meets.",
          note: "Muslim 50:2; Bukhari 80:6",
        },
        {
          title: "Draw near a hand-span, He draws near a cubit",
          detail:
            "In the same narration in Muslim, Allah says: 'I live in the thought of My servant and I am with him as he remembers Me' — and the Prophet (peace be upon him) described how when the servant draws near Allah by the span of a hand, Allah draws near a cubit; when he draws near a cubit, Allah draws near a fathom; 'and when he draws near Me walking I draw close to him hurriedly.' Every step back is met with more than a step.",
          note: "Muslim 50:1",
        },
        {
          title: "The full desert parable",
          detail:
            "In the longer narrations, the traveler loses the camel carrying his food and drink, searches until hope is gone, and lies down waiting for death — then opens his eyes to find it standing over him. He seizes its rope and, out of boundless joy, misspeaks: 'O Lord, Thou art my servant and I am Thine Lord.' The Prophet (peace be upon him) told this to teach one thing: Allah's pleasure at your tawbah is greater than even that joy.",
          note: "Muslim 50:4; Muslim 50:9",
        },
      ],
    },
  },
  {
    id: "o-son-of-adam",
    name: "“O Son of Adam…”",
    content: {
      intro:
        "In a hadith qudsi — Allah's own words conveyed by His Messenger — three doors of forgiveness are thrown open one after another: du'a with hope, istighfar, and meeting Allah upon tawhid.",
      points: [
        {
          title: "The hadith qudsi",
          detail:
            "The Messenger of Allah (peace be upon him) said: “Allah, Blessed is He and Most High, said: 'O son of Adam! Verily as long as you called upon Me and hoped in Me, I forgave you, despite whatever may have occurred from you, and I did not mind. O son of Adam! Were your sins to reach the clouds of the sky, then you sought forgiveness from Me, I would forgive you, and I would not mind. So son of Adam! If you came to me with sins nearly as great as the earth, and then you met Me not associating anything with Me, I would come to you with forgiveness nearly as great as it.'”",
          note: "Tirmidhi 48:171",
        },
        {
          title: "Sins to the clouds — forgiveness to match",
          detail:
            "Notice the escalation: whatever may have occurred, then sins reaching the clouds of the sky, then sins nearly as great as the earth. Each time the forgiveness scales up to meet them. The only condition that runs through all three doors is turning to Him — calling, seeking forgiveness, and keeping tawhid intact.",
          note: "Tirmidhi 48:171",
        },
        {
          title: "'And I did not mind'",
          detail:
            "Twice in this hadith Allah says He does not mind — forgiving is not a burden on Him and does not diminish Him. The Quran puts it as a name: 'It is He Who accepts repentance from His slaves and pardons sins, and He knows all what you do.' He forgives knowingly, not because the sin was hidden from Him.",
          note: "Tirmidhi 48:171; Quran 42:25",
        },
      ],
    },
  },
  {
    id: "man-who-killed-99",
    name: "The Man Who Killed 99",
    content: {
      intro:
        "If any sin could slam the door shut, it would be a hundred murders. The Prophet (peace be upon him) told the story of a man from the nations before us precisely so that no one could ever say 'my sin is too great.'",
      points: [
        {
          title: "The monk and the scholar",
          detail:
            "A man who had killed ninety-nine people asked a monk whether his repentance could be accepted. The monk said no — and the man killed him, completing one hundred. He then asked for the most learned person of the earth and was directed to a scholar, who answered: 'Yes; what stands between you and the repentance?' The difference between the two answers is the difference between ignorance and knowledge of Allah.",
          note: "Bukhari 60:137; Muslim 50:54",
        },
        {
          title: "Leave the land of your sin",
          detail:
            "The scholar did not stop at 'yes.' He told him: go to such and such land, where there are people devoted to the worship of Allah, worship with them, and do not return to your own land, 'since it was an evil land.' Part of sincere tawbah is changing the surroundings, company, and habits that fed the sin — the scholar prescribed it before the man had done a single good deed.",
          note: "Muslim 50:54",
        },
        {
          title: "A hand-span closer to mercy",
          detail:
            "Death overtook him on the way, before he reached the righteous town. The angels of mercy and the angels of punishment disputed over him, and the distance to the two lands was measured: he was found 'one span closer' to the land he was heading to — and he was forgiven. He died with nothing but a direction and an intention, and it was enough.",
          note: "Bukhari 60:137; Muslim 50:54",
        },
      ],
    },
  },
  {
    id: "while-the-door-is-open",
    name: "While the Door Is Open",
    content: {
      intro:
        "The door of tawbah stays open for a lifetime — but not one moment longer. The texts name exactly two closings: for each person, the arrival of death; for the world, the rising of the sun from the west.",
      points: [
        {
          title: "Until the soul reaches the throat",
          detail:
            "The Prophet (peace be upon him) said: 'Indeed Allah accepts the repentance of a slave as long as (his soul does not reach his throat).' Up to the very edge of death the door is open — which is both an immense hope and a warning against gambling on a deathbed you may never see coming.",
          note: "Tirmidhi 48:168",
        },
        {
          title: "Not the repentance of the last gasp",
          detail:
            "The Quran draws the same line: 'Allah only accepts the repentance of those who commit evil out of ignorance, then repent soon thereafter… However, repentance is not for those who commit evil deeds until death approaches one of them, he then says, “Now I repent”.' Tawbah is for the living — delay is itself a sin to repent from.",
          note: "Quran 4:17; Quran 4:18",
        },
        {
          title: "Before the sun rises from the west",
          detail:
            "The Prophet (peace be upon him) said: 'He who seeks repentance (from the Lord) before the rising of the sun from the west (before the Day of Resurrection), Allah turns to him with Mercy.' Until that final sign of the Hour, the world's door of tawbah does not close.",
          note: "Muslim 48:55",
        },
      ],
    },
  },
];

const conditionsTopics: Topic[] = [
  {
    id: "three-conditions",
    name: "The Three Conditions",
    content: {
      intro:
        "Tawbah is not a word — it is a turning. Scholars state that sincere repentance from a sin between you and Allah stands on three things: stop the sin now, regret it genuinely, and resolve never to return to it. If any one is missing, the turning has not happened.",
      verse: {
        arabic: "وَٱلَّذِينَ إِذَا فَعَلُوا۟ فَـٰحِشَةً أَوْ ظَلَمُوٓا۟ أَنفُسَهُمْ ذَكَرُوا۟ ٱللَّهَ فَٱسْتَغْفَرُوا۟ لِذُنُوبِهِمْ وَمَن يَغْفِرُ ٱلذُّنُوبَ إِلَّا ٱللَّهُ وَلَمْ يُصِرُّوا۟ عَلَىٰ مَا فَعَلُوا۟ وَهُمْ يَعْلَمُونَ",
        text: "And those who, when they commit a shameful act or wrong themselves, remember Allah and seek forgiveness for their sins – who can forgive sins except Allah? – and they do not persist in what they did knowingly.",
        ref: "Quran 3:135",
      },
      points: [
        {
          title: "1. Leave the sin",
          detail:
            "Repentance while still doing the sin is a contradiction. The verse praises those who 'do not persist in what they did knowingly' — the remembering of Allah interrupts the sin itself. Scholars state that abandoning the sin immediately is the first pillar of tawbah.",
          note: "Quran 3:135",
        },
        {
          title: "2. Regret it",
          detail:
            "Regret is the heart's share of tawbah — the difference between quitting a sin out of remorse before Allah and merely drifting away from it. Scholars state that this grief over having disobeyed Allah is the core of repentance; the one who feels no loss has not yet turned.",
        },
        {
          title: "3. Resolve not to return",
          detail:
            "A firm intention never to go back — made honestly today, even knowing you are weak. The Quran calls this 'tawbatan nasuha,' sincere repentance, and it is made 'soon thereafter,' not parked for later: 'Allah only accepts the repentance of those who commit evil out of ignorance, then repent soon thereafter.'",
          note: "Quran 66:8; Quran 4:17",
        },
      ],
    },
  },
  {
    id: "rights-of-people",
    name: "When People Were Wronged",
    content: {
      intro:
        "Sins divide into what is between you and Allah, and what trampled the rights of His servants. For the second kind, scholars state a fourth condition: restore the right — return the money, retract the slander, seek the person's pardon. Allah's forgiveness does not erase a debt still sitting in someone else's ledger.",
      points: [
        {
          title: "Settle it before a Day without dinars",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever has wronged his brother, should ask for his pardon (before his death), as (in the Hereafter) there will be neither a Dinar nor a Dirham. (He should secure pardon in this life) before some of his good deeds are taken and paid to his brother, or, if he has done no good deeds, some of the bad deeds of his brother are taken to be loaded on him (in the Hereafter).'",
          note: "Bukhari 81:123",
        },
        {
          title: "What restoring rights looks like",
          detail:
            "Scholars state it takes the shape of the wrong: stolen or withheld wealth is returned; backbiting and slander are retracted before the people who heard them, or countered by speaking well of the person and seeking forgiveness for them; injuries are compensated or pardoned. Where direct restoration would cause greater harm, scholars advise making amends in kind — du'a for the wronged person and good done on their behalf.",
        },
        {
          title: "Between you and Allah: conceal, don't confess publicly",
          detail:
            "Sins that violated no one's rights are settled with Allah alone — Islam has no confession box. The Prophet (peace be upon him) warned: 'All the sins of my followers will be forgiven except those of the Mujahirin (those who commit a sin openly or disclose their sins to the people)' — the one who sins at night 'screened by his Lord,' then tears Allah's screen off himself in the morning. Repent in private; do not advertise what Allah covered.",
          note: "Bukhari 78:99",
        },
      ],
    },
  },
  {
    id: "sincere-tawbah",
    name: "Tawbatan Nasuha",
    content: {
      intro:
        "The Quran's command is not merely to repent but to repent sincerely — a tawbah that faces Allah alone, not embarrassment, consequences, or people.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ تُوبُوٓا۟ إِلَى ٱللَّهِ تَوْبَةً نَّصُوحًا عَسَىٰ رَبُّكُمْ أَن يُكَفِّرَ عَنكُمْ سَيِّـَٔاتِكُمْ وَيُدْخِلَكُمْ جَنَّـٰتٍ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَـٰرُ …",
        text: "O you who believe, turn to Allah in sincere repentance. It may be that your Lord will absolve you of your bad deeds and admit you to gardens under which rivers flow…",
        ref: "Quran 66:8",
      },
      points: [
        {
          title: "A command to the believers",
          detail:
            "This verse addresses 'O you who believe' — tawbah is not only for the fallen; it is the standing order of every believer. The Quran likewise says: 'And turn to Allah in repentance all together, O believers, so that you may be successful.' No one graduates from needing it.",
          note: "Quran 66:8; Quran 24:31",
        },
        {
          title: "Then stay on the path",
          detail:
            "Sincerity shows in what follows: 'I am indeed Most Forgiving to those who repent and believe, and do righteous deeds, then stay on the right path.' Tawbah that is real changes the days after it — prayer guarded, company changed, the road to the sin closed.",
          note: "Quran 20:82",
        },
        {
          title: "And mend what the sin broke",
          detail:
            "'But whoever repents after having committed wrong and mends his way, Allah will accept his repentance, for Allah is All-Forgiving, Most Merciful.' Islah — putting right — is the Quran's constant companion to tawbah: the returning servant rebuilds.",
          note: "Quran 5:39",
        },
      ],
    },
  },
];

const istighfarTopics: Topic[] = [
  {
    id: "sayyid-al-istighfar",
    name: "Sayyid al-Istighfar",
    content: {
      intro:
        "The Prophet (peace be upon him) taught one du'a as 'the most superior way of asking for forgiveness from Allah' — known ever since as Sayyid al-Istighfar, the master of seeking forgiveness. Say it every morning and evening.",
      points: [
        {
          title: "The words",
          detail:
            "'Allahumma anta Rabbi la ilaha illa anta, Khalaqtani wa ana Abduka, wa ana ala ahdika wa wa'dika mastata'tu, A'udhu bika min sharri ma sana'tu, abu'u laka bini'matika alayya, wa abu'u laka bidhanbi faghfir li fa innahu la yaghfiru adh-dhunuba illa anta.' Its meaning: O Allah, You are my Lord; none has the right to be worshiped but You. You created me and I am Your slave, and I keep Your covenant and promise as far as I am able. I seek refuge in You from the evil of what I have done. I acknowledge before You Your favor upon me, and I acknowledge my sin — so forgive me, for none forgives sins but You.",
          note: "Bukhari 80:3",
        },
        {
          title: "The promise attached to it",
          detail:
            "The Prophet (peace be upon him) added: 'If somebody recites it during the day with firm faith in it, and dies on the same day before the evening, he will be from the people of Paradise; and if somebody recites it at night with firm faith in it, and dies before the morning, he will be from the people of Paradise.'",
          note: "Bukhari 80:3",
        },
        {
          title: "Why it is the master",
          detail:
            "In a few lines it gathers everything tawbah contains: tawhid ('You are my Lord'), servitude ('I am Your slave'), renewed commitment ('I keep Your covenant… as far as I am able'), honest acknowledgment of both Allah's favor and one's own sin, and asking forgiveness from the only One who can give it.",
          note: "Bukhari 80:3",
        },
      ],
    },
  },
  {
    id: "the-prophets-habit",
    name: "The Prophet's Daily Habit",
    content: {
      intro:
        "The most forgiven of creation sought forgiveness the most. If istighfar filled the Prophet's (peace be upon him) day, it can never be beneath ours.",
      points: [
        {
          title: "More than seventy times a day",
          detail:
            "Abu Huraira said: I heard Allah's Messenger (peace be upon him) saying: 'By Allah! I ask for forgiveness from Allah and turn to Him in repentance more than seventy times a day.'",
          note: "Bukhari 80:4",
        },
        {
          title: "A hundred times a day",
          detail:
            "He also said: 'There is (at times) some sort of shade upon my heart, and I seek forgiveness from Allah a hundred times a day.' And he commanded it: 'O people, seek repentance from Allah. Verily, I seek repentance from Him a hundred times a day.' Istighfar was not his response to scandal — it was his maintenance of the heart.",
          note: "Muslim 48:52; Muslim 48:53",
        },
        {
          title: "Make it a running thread",
          detail:
            "Astaghfirullah takes a second — in traffic, between tasks, walking. A hundred a day is not a mountain; it is a habit of turning. Build it into the morning and evening adhkar and the moments after each prayer.",
        },
      ],
    },
  },
  {
    id: "what-istighfar-opens",
    name: "What Istighfar Opens",
    content: {
      intro:
        "Istighfar is not only an eraser for the past — the Quran presents it as a key to provision, strength, and life itself. Nuh (peace be upon him) preached it to his people as the answer to drought and childlessness.",
      verse: {
        arabic: "فَقُلْتُ ٱسْتَغْفِرُوا۟ رَبَّكُمْ إِنَّهُۥ كَانَ غَفَّارًا",
        text: "I said, ‘Seek forgiveness from your Lord. Indeed, He is Most Forgiving.",
        ref: "Quran 71:10",
      },
      points: [
        {
          title: "Rain, wealth, children, gardens, rivers",
          detail:
            "Nuh continues: 'He will shower you with abundant rain from the sky, and He will give you wealth and children, and bestow upon you gardens and rivers.' Five worldly openings, all hung on one act of the tongue and heart — seeking Allah's forgiveness.",
          note: "Quran 71:11; Quran 71:12",
        },
        {
          title: "A good life until the appointed term",
          detail:
            "'And seek your Lord's forgiveness and turn to Him in repentance, He will grant you good enjoyment of life for an appointed term and graciously reward the doers of good.' Istighfar and tawbah together are the Quran's recipe for a good life — not only a saved afterlife.",
          note: "Quran 11:3",
        },
        {
          title: "Whoever seeks forgiveness, finds it",
          detail:
            "'Whoever commits evil or wrongs himself, then seeks Allah's forgiveness will find Allah All-Forgiving, Most Merciful.' The verse is unconditional about the finding — the only variable is whether the seeking happens.",
          note: "Quran 4:110",
        },
      ],
    },
  },
];

const returningTopics: Topic[] = [
  {
    id: "repent-again",
    name: "Fell Again? Repent Again",
    content: {
      intro:
        "Relapse does not void the previous tawbah, and it does not disqualify the next one. The rule is simple and has no expiry: every fall is answered with a fresh return.",
      verse: {
        arabic: "وَمَن يَعْمَلْ سُوٓءًا أَوْ يَظْلِمْ نَفْسَهُۥ ثُمَّ يَسْتَغْفِرِ ٱللَّهَ يَجِدِ ٱللَّهَ غَفُورًا رَّحِيمًا",
        text: "Whoever commits evil or wrongs himself, then seeks Allah’s forgiveness will find Allah All-Forgiving, Most Merciful.",
        ref: "Quran 4:110",
      },
      points: [
        {
          title: "The servant who kept sinning — and kept returning",
          detail:
            "In a hadith qudsi, a servant commits a sin and says: 'O Allah, forgive me my sins,' and Allah says: 'My servant committed a sin and then he came to realise that he has a Lord Who forgives the sins and takes to account (the sinner) for the sin.' The servant sins again and repents again — a second time, a third — and Allah answers the same way each time, then says: 'O servant, do what you like. I have granted you forgiveness.' The meaning, as the narration shows, is: so long as each sin is met with turning back to Him, forgiveness meets it.",
          note: "Muslim 50:33",
        },
        {
          title: "Sinning is your condition; returning is your test",
          detail:
            "The Prophet (peace be upon him) said: 'By Him in Whose Hand is my life, if you were not to commit sin, Allah would sweep you out of existence and He would replace (you by) those people who would commit sin and seek forgiveness from Allah, and He would have pardoned them.' And he said: 'Every son of Adam sins, and the best of the sinners are the repentant.' You were never expected to be sinless — you are asked to be a returner.",
          note: "Muslim 50:13; Tirmidhi 37:85; Ibn Majah 37:152",
        },
        {
          title: "An honest resolve, even from a weak heart",
          detail:
            "The condition of tawbah is a sincere resolve not to return at the moment of repenting — not a guarantee of the future. Scholars state that a later relapse does not invalidate the earlier tawbah, provided it was sincere at the time; the new sin simply needs its own new repentance.",
        },
      ],
    },
  },
  {
    id: "despair-is-the-trap",
    name: "Despair Is the Trap",
    content: {
      intro:
        "After the fall, the Shaytan changes tactics: before the sin he whispered 'it's not so bad,' and after it he whispers 'you're beyond forgiveness.' The second whisper is the deadlier one — because despair, not the sin, is what keeps a person from returning.",
      points: [
        {
          title: "The verse that forbids despair",
          detail:
            "Allah addresses precisely the person drowning in sin: 'O My slaves who have transgressed against themselves, do not despair of Allah's mercy, for indeed Allah forgives all sins. He is indeed the All-Forgiving, the Most Merciful.' Despairing of mercy is itself the thing forbidden in this verse — the sins are declared forgivable, all of them.",
          note: "Quran 39:53",
        },
        {
          title: "'You are too far gone' is a whisper, not a verdict",
          detail:
            "The monk who told the killer of ninety-nine 'no' was wrong, and saying it cost him his life; the scholar's 'what stands between you and repentance?' was the truth. Any voice — inner or outer — that tells you the door is closed while you still breathe is contradicting Allah's own words.",
          note: "Muslim 50:54; Quran 39:53",
        },
        {
          title: "Treat the whisper like a whisper",
          detail:
            "Hopelessness about Allah's mercy is waswas — fought the same way as any whispering: seek refuge in Allah, and answer it with the texts above. The protection page covers the whisperer and the daily armor against him in full.",
        },
      ],
    },
  },
];

const fruitsTopics: Topic[] = [
  {
    id: "sins-become-good-deeds",
    name: "Sins Exchanged for Good Deeds",
    content: {
      intro:
        "Tawbah does not merely wipe the slate — for the one who repents, believes, and goes on to righteous action, Allah promises to convert the record itself.",
      verse: {
        arabic: "إِلَّا مَن تَابَ وَءَامَنَ وَعَمِلَ عَمَلًا صَـٰلِحًا فَأُو۟لَـٰٓئِكَ يُبَدِّلُ ٱللَّهُ سَيِّـَٔاتِهِمْ حَسَنَـٰتٍ ۗ وَكَانَ ٱللَّهُ غَفُورًا رَّحِيمًا",
        text: "except those who repent and believe, and do righteous deeds; for them Allah will change their evil deeds into good deeds, for Allah is All-Forgiving, Most Merciful.",
        ref: "Quran 25:70",
      },
      points: [
        {
          title: "Revealed about the worst of sins",
          detail:
            "This verse answers the verses just before it, which threaten those who invoke other gods, kill the soul Allah has forbidden, and commit zina. Ibn Abbas explained that when those verses came down, the people of Makkah said: we have done all of these — 'So Allah revealed: Except those who repent, believe, and do good deeds…' The exchange is offered precisely to people with the heaviest records.",
          note: "Quran 25:68; Bukhari 65:287",
        },
        {
          title: "A complete turning",
          detail:
            "The very next verse generalizes it: 'Whoever repents and does righteous deeds has turned to Allah with sincere repentance.' The transformation of the record follows the transformation of the person.",
          note: "Quran 25:71",
        },
      ],
    },
  },
  {
    id: "allah-loves-the-repentant",
    name: "Allah Loves Those Who Repent",
    content: {
      intro:
        "The highest fruit of tawbah is not the clean slate — it is what the turning earns you with Allah Himself.",
      verse: {
        arabic: "إِنَّ ٱللَّهَ يُحِبُّ ٱلتَّوَّٰبِينَ وَيُحِبُّ ٱلْمُتَطَهِّرِينَ",
        text: "Allah loves those who frequently repent and He loves those who purify themselves.",
        ref: "Quran 2:222",
      },
      points: [
        {
          title: "Loved — not merely tolerated",
          detail:
            "The verse does not say Allah puts up with the repentant; it says He loves them — and the word 'tawwabin' is intensive: those who repent again and again. A history of falling and returning is, in Allah's description, a quality He loves.",
          note: "Quran 2:222",
        },
        {
          title: "His names carry the promise",
          detail:
            "At-Tawwab — the One who constantly accepts repentance and turns to His servants; al-Ghafur — the All-Forgiving. 'The Forgiver of sin and Accepter of repentance, the Severe in punishment and Infinite in bounty.' The Quran's final revealed surahs still command: 'and ask His forgiveness. Indeed, He is ever Accepting of Repentance.'",
          note: "Quran 40:3; Quran 110:3",
        },
      ],
    },
  },
  {
    id: "good-deeds-erase",
    name: "Good Deeds Erase Bad Ones",
    content: {
      intro:
        "Tawbah has a companion habit: follow the bad deed with a good one. The Quran states it as a law of the scales, and the Prophet (peace be upon him) applied it to a man in front of him.",
      points: [
        {
          title: "The law",
          detail:
            "'Establish prayer at the two ends of the day and at some hours of the night. Indeed, good deeds wipe out evil deeds. This is a reminder for those who are mindful.'",
          note: "Quran 11:114",
        },
        {
          title: "It concerns every one of my Ummah",
          detail:
            "A man came to the Prophet (peace be upon him) and confessed he had kissed a woman unlawfully. This verse was revealed, and the man asked: 'Allah's Messenger, does it concern me only?' He replied that it concerns everyone of his Ummah who acts according to it. The prescription for the guilty conscience was: pray.",
          note: "Muslim 50:47",
        },
        {
          title: "Hasten — the prize is Paradise",
          detail:
            "'And hasten towards forgiveness from your Lord and a Paradise as wide as the heavens and earth, prepared for the righteous… And those who, when they commit a shameful act or wrong themselves, remember Allah and seek forgiveness for their sins… Their reward is forgiveness from their Lord and gardens under which rivers flow.' Tawbah is the door of hope that opens onto Jannah itself.",
          note: "Quran 3:133; Quran 3:135; Quran 3:136",
        },
      ],
    },
  },
];

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "door", label: "The Open Door" },
  { key: "conditions", label: "How to Repent" },
  { key: "istighfar", label: "Istighfar" },
  { key: "returning", label: "Relapse & Return" },
  { key: "fruits", label: "Fruits of Tawbah" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* ───────────────────────── page ───────────────────────── */

function TawbahContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const t = searchParams.get("tab");
    return t && tabs.some((x) => x.key === t) ? (t as TabKey) : "overview";
  });
  // Deep-link support: ?tab=<key>&sub=<topic id>. The initial ?sub= is applied
  // to whichever rail it belongs to; ids are unique across the page.
  const initialSub = searchParams.get("sub");
  const [doorSub, setDoorSub] = useState(() =>
    initialSub && doorTopics.some((t) => t.id === initialSub) ? initialSub : doorTopics[0].id
  );
  const [conditionsSub, setConditionsSub] = useState(() =>
    initialSub && conditionsTopics.some((t) => t.id === initialSub)
      ? initialSub
      : conditionsTopics[0].id
  );
  const [istighfarSub, setIstighfarSub] = useState(() =>
    initialSub && istighfarTopics.some((t) => t.id === initialSub)
      ? initialSub
      : istighfarTopics[0].id
  );
  const [returningSub, setReturningSub] = useState(() =>
    initialSub && returningTopics.some((t) => t.id === initialSub)
      ? initialSub
      : returningTopics[0].id
  );
  const [fruitsSub, setFruitsSub] = useState(() =>
    initialSub && fruitsTopics.some((t) => t.id === initialSub) ? initialSub : fruitsTopics[0].id
  );
  const [search, setSearch] = useState("");

  const replaceUrl = (tab: TabKey, sub?: string) => {
    router.replace(`${pathname}?tab=${tab}${sub ? `&sub=${sub}` : ""}`, { scroll: false });
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
    replaceUrl(key as TabKey);
  };

  const handleSubChange = (tab: TabKey, setter: (s: string) => void) => (sub: string) => {
    setter(sub);
    replaceUrl(tab, sub);
  };

  const topicMatches = (t: Topic) => {
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

  /* auto-select the first visible topic when search filters out the active one */
  useEffect(() => {
    if (!search || search.length < 2) return;
    const fix = (topics: Topic[], active: string, set: (s: string) => void) => {
      const visible = topics.filter(topicMatches);
      if (visible.length && !visible.some((t) => t.id === active)) set(visible[0].id);
    };
    fix(doorTopics, doorSub, setDoorSub);
    fix(conditionsTopics, conditionsSub, setConditionsSub);
    fix(istighfarTopics, istighfarSub, setIstighfarSub);
    fix(returningTopics, returningSub, setReturningSub);
    fix(fruitsTopics, fruitsSub, setFruitsSub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, doorSub, conditionsSub, istighfarSub, returningSub, fruitsSub]);

  const renderTopicRail = (
    topics: Topic[],
    activeSub: string,
    onSubChange: (s: string) => void
  ) => {
    const visible = topics.filter(topicMatches);
    const active = visible.find((t) => t.id === activeSub);
    return (
      <SubTabLayout
        subs={visible.map((t) => ({ key: t.id, label: t.name }))}
        activeSub={activeSub}
        setActiveSub={onSubChange}
      >
        {active && <TopicInfoCard topic={active} showSource={false} />}
      </SubTabLayout>
    );
  };

  return (
    <div>
      <PageHeader
        title="Tawbah & Repentance"
        titleAr="التوبة"
        subtitle="Turning back to Allah — the door He never closes on the living."
      />

      {/* Opening verse — above search + tabs, matching every other content page. */}
      <VerseHero
        arabic="۞ قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ"
        text="O My slaves who have transgressed against themselves, do not despair of Allah’s mercy, for indeed Allah forgives all sins. He is indeed the All-Forgiving, the Most Merciful."
        reference="Quran 39:53"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search topics, verses..." className="mb-6" />

      <TabBar tabs={[...tabs]} activeTab={activeTab} onTabChange={handleTabChange} className="mb-6" />

      <AnimatePresence mode="wait">
        {/* ─── Overview ─── */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">What tawbah is</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  Tawbah literally means turning back. In Islam it is the act of turning away from
                  a sin and back to Allah — stopping it, regretting it, and resolving to stay away
                  from it, while trusting completely in His willingness to forgive. It is not a
                  ritual for rare occasions or great criminals; the Quran commands it of every
                  believer:{" "}
                  <em>
                    &ldquo;And turn to Allah in repentance all together, O believers, so that you
                    may be successful&rdquo;
                  </em>{" "}
                  (Quran 24:31).
                </p>
                <p>
                  The Prophet (peace be upon him) said:{" "}
                  <em>
                    &ldquo;Every son of Adam sins, and the best of the sinners are the
                    repentant&rdquo;
                  </em>{" "}
                  (Tirmidhi 37:85; Ibn Majah 37:152). Islam&apos;s starting assumption is that you
                  will fall — the whole religion of tawbah is about what you do next. This page
                  walks through the open door, the conditions of a sincere return, the practice of
                  istighfar, what to do after a relapse, and what tawbah earns.
                </p>
              </div>
            </ContentCard>

            <ContentCard delay={0.15}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                At-Tawwab &amp; al-Ghafur — who you are returning to
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  Among Allah&apos;s names are <strong className="text-themed">at-Tawwab</strong> —
                  the One who constantly accepts repentance and turns back to His servants — and{" "}
                  <strong className="text-themed">al-Ghafur</strong> — the All-Forgiving. Accepting
                  your return is not an exception He makes; it is who He tells us He is.
                </p>
                <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg)" }}>
                  <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                    وَهُوَ ٱلَّذِى يَقْبَلُ ٱلتَّوْبَةَ عَنْ عِبَادِهِۦ وَيَعْفُوا۟ عَنِ ٱلسَّيِّـَٔاتِ وَيَعْلَمُ مَا تَفْعَلُونَ
                  </p>
                  <p className="text-themed text-sm italic">
                    &ldquo;It is He Who accepts repentance from His slaves and pardons sins, and He
                    knows all what you do.&rdquo;
                  </p>
                  <p className="text-xs text-themed-muted mt-2">
                    <HadithRefText text="Quran 42:25" />
                  </p>
                </div>
                <p>
                  The Quran opens one of its surahs by introducing Him as{" "}
                  <em>
                    &ldquo;the Forgiver of sin and Accepter of repentance, the Severe in punishment
                    and Infinite in bounty&rdquo;
                  </em>{" "}
                  (Quran 40:3) — forgiveness named first. And in one of the last surahs revealed,
                  the command to the Prophet (peace be upon him) himself:{" "}
                  <em>
                    &ldquo;then glorify the praise of your Lord, and ask His forgiveness. Indeed,
                    He is ever Accepting of Repentance&rdquo;
                  </em>{" "}
                  (Quran 110:3).
                </p>
              </div>
            </ContentCard>

            <ContentCard delay={0.2}>
              <h3 className="font-semibold text-themed mb-2">Companion pages</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Tawbah touches everything: the whispers of despair are fought on the protection
                page, istighfar lives inside the daily worship routine, and the door of hope opens
                onto Jannah.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/protection"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Protection from waswas →
                </Link>
                <Link
                  href="/muslim-daily?tab=worship"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  The daily worship routine →
                </Link>
                <Link
                  href="/jannah"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Jannah — what the door opens onto →
                </Link>
              </div>
            </ContentCard>

            <SourcesCard
              delay={0.25}
              sources={[
                { ref: "Quran 39:53", desc: "Do not despair of Allah's mercy — He forgives all sins" },
                { ref: "Quran 24:31", desc: "Turn to Allah in repentance all together, O believers" },
                { ref: "Tirmidhi 37:85; Ibn Majah 37:152", desc: "Every son of Adam sins; the best sinners are the repentant" },
                { ref: "Quran 42:25", desc: "It is He Who accepts repentance from His slaves" },
                { ref: "Quran 40:3", desc: "The Forgiver of sin and Accepter of repentance" },
                { ref: "Quran 110:3", desc: "He is ever Accepting of Repentance (Tawwaba)" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── The Open Door ─── */}
        {activeTab === "door" && (
          <motion.div
            key="door"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(doorTopics, doorSub, handleSubChange("door", setDoorSub))}

            <SourcesCard
              className="mt-8"
              sources={[
                { ref: "Muslim 50:2; Bukhari 80:6", desc: "Allah more pleased with His servant's tawbah than the man who found his lost camel" },
                { ref: "Muslim 50:1", desc: "Draw near a hand-span, He draws near a cubit; walking — He comes hurriedly" },
                { ref: "Muslim 50:4; Muslim 50:9", desc: "The full desert parable — 'O Lord, Thou art my servant and I am Thine Lord…' from boundless joy" },
                { ref: "Tirmidhi 48:171", desc: "Hadith qudsi: 'O son of Adam…' — sins to the clouds, forgiveness to match" },
                { ref: "Quran 42:25", desc: "He accepts repentance from His slaves and pardons sins" },
                { ref: "Bukhari 60:137; Muslim 50:54", desc: "The man who killed ninety-nine — forgiven a hand-span closer to mercy" },
                { ref: "Tirmidhi 48:168", desc: "Repentance accepted until the soul reaches the throat" },
                { ref: "Quran 4:17; Quran 4:18", desc: "Repent soon — not at the moment death arrives" },
                { ref: "Muslim 48:55", desc: "Repentance accepted before the sun rises from the west" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── How to Repent ─── */}
        {activeTab === "conditions" && (
          <motion.div
            key="conditions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(
              conditionsTopics,
              conditionsSub,
              handleSubChange("conditions", setConditionsSub)
            )}

            <SourcesCard
              className="mt-8"
              sources={[
                { ref: "Quran 3:135", desc: "They seek forgiveness and do not persist knowingly" },
                { ref: "Quran 66:8", desc: "Turn to Allah in sincere repentance (tawbatan nasuha)" },
                { ref: "Quran 4:17", desc: "Repentance is for those who repent soon thereafter" },
                { ref: "Bukhari 81:123", desc: "Whoever wronged his brother — settle it before the Day without dinars" },
                { ref: "Bukhari 78:99", desc: "All forgiven except those who sin openly and tear off Allah's screen" },
                { ref: "Quran 24:31", desc: "A command to all believers together" },
                { ref: "Quran 20:82", desc: "Forgiving to those who repent, believe, act — then stay on the path" },
                { ref: "Quran 5:39", desc: "Whoever repents and mends his way, Allah accepts his repentance" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Istighfar ─── */}
        {activeTab === "istighfar" && (
          <motion.div
            key="istighfar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(
              istighfarTopics,
              istighfarSub,
              handleSubChange("istighfar", setIstighfarSub)
            )}

            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">Build it into the day</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Sayyid al-Istighfar belongs in the morning and evening adhkar — the full daily
                worship routine has a place ready for it.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/muslim-daily?tab=worship"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  The daily worship checklist →
                </Link>
                <Link
                  href="/duas"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  All du&apos;as →
                </Link>
              </div>
            </ContentCard>

            <SourcesCard
              className="mt-6"
              sources={[
                { ref: "Bukhari 80:3", desc: "Sayyid al-Istighfar — the most superior way of asking forgiveness, and its promise" },
                { ref: "Bukhari 80:4", desc: "The Prophet sought forgiveness more than seventy times a day" },
                { ref: "Muslim 48:52; Muslim 48:53", desc: "'I seek forgiveness from Allah a hundred times a day' — and the command to the people" },
                { ref: "Quran 71:10-12", desc: "Nuh: seek forgiveness — rain, wealth, children, gardens, rivers" },
                { ref: "Quran 11:3", desc: "Istighfar and tawbah — a good life for an appointed term" },
                { ref: "Quran 4:110", desc: "Whoever seeks Allah's forgiveness finds Him All-Forgiving" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Relapse & Return ─── */}
        {activeTab === "returning" && (
          <motion.div
            key="returning"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(
              returningTopics,
              returningSub,
              handleSubChange("returning", setReturningSub)
            )}

            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">When the whisper says you&apos;re done</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Hopelessness after sin is the Shaytan&apos;s whisper, and it is fought like every
                other whisper — with refuge in Allah and the daily armor of remembrance.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/protection"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Protection &amp; the whisperer →
                </Link>
                <Link
                  href="/protection?tab=daily"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Daily protection adhkar →
                </Link>
              </div>
            </ContentCard>

            <SourcesCard
              className="mt-6"
              sources={[
                { ref: "Quran 4:110", desc: "Whoever commits evil, then seeks forgiveness, finds Allah All-Forgiving" },
                { ref: "Muslim 50:33", desc: "The servant who sinned and returned again and again — 'I have granted you forgiveness'" },
                { ref: "Muslim 50:13", desc: "If you did not sin, Allah would replace you with people who sin and seek forgiveness" },
                { ref: "Tirmidhi 37:85; Ibn Majah 37:152", desc: "The best of sinners are the repentant" },
                { ref: "Quran 39:53", desc: "Do not despair of Allah's mercy" },
                { ref: "Muslim 50:54", desc: "The monk's 'no' was false; the scholar's door stood open" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Fruits of Tawbah ─── */}
        {activeTab === "fruits" && (
          <motion.div
            key="fruits"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(fruitsTopics, fruitsSub, handleSubChange("fruits", setFruitsSub))}

            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">The door of hope</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Every promise on this tab points the same direction — forgiveness from your Lord
                and gardens under which rivers flow. See what is waiting behind the door.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/jannah"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Jannah →
                </Link>
              </div>
            </ContentCard>

            <SourcesCard
              className="mt-6"
              sources={[
                { ref: "Quran 25:68-71", desc: "Allah will change their evil deeds into good deeds" },
                { ref: "Bukhari 65:287", desc: "Ibn Abbas: the exchange verse was revealed for the heaviest of sinners" },
                { ref: "Quran 2:222", desc: "Allah loves those who frequently repent" },
                { ref: "Quran 40:3; Quran 110:3", desc: "Forgiver of sin, Accepter of repentance — ever Accepting of Repentance" },
                { ref: "Quran 11:114; Muslim 50:47", desc: "Good deeds wipe out evil deeds — 'it concerns every one of my Ummah'" },
                { ref: "Quran 3:133-136", desc: "Hasten to forgiveness and a Paradise as wide as the heavens and earth" },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TawbahPage() {
  return (
    <Suspense>
      <TawbahContent />
    </Suspense>
  );
}
