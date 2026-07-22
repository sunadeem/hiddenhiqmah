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
import TopicInfoCard, { topicSourceRefs, type Topic } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";

/* ───────────────────────── data ─────────────────────────
   All Quran text (Arabic and English) is copied verbatim from
   packages/content/quran; hadith quotes verbatim from packages/content/hadith. */

const statusTopics: Topic[] = [
  {
    id: "equal-before-allah",
    name: "Equal Before Allah",
    content: {
      intro:
        "In everything that ultimately matters — faith, worship, reward, and nearness to Allah — the Quran addresses women and men as full equals. Ten times in a single verse, Allah names the women alongside the men.",
      verse: {
        arabic: "إِنَّ ٱلْمُسْلِمِينَ وَٱلْمُسْلِمَـٰتِ وَٱلْمُؤْمِنِينَ وَٱلْمُؤْمِنَـٰتِ وَٱلْقَـٰنِتِينَ وَٱلْقَـٰنِتَـٰتِ وَٱلصَّـٰدِقِينَ وَٱلصَّـٰدِقَـٰتِ وَٱلصَّـٰبِرِينَ وَٱلصَّـٰبِرَٰتِ وَٱلْخَـٰشِعِينَ وَٱلْخَـٰشِعَـٰتِ وَٱلْمُتَصَدِّقِينَ وَٱلْمُتَصَدِّقَـٰتِ وَٱلصَّـٰٓئِمِينَ وَٱلصَّـٰٓئِمَـٰتِ وَٱلْحَـٰفِظِينَ فُرُوجَهُمْ وَٱلْحَـٰفِظَـٰتِ وَٱلذَّٰكِرِينَ ٱللَّهَ كَثِيرًا وَٱلذَّٰكِرَٰتِ أَعَدَّ ٱللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا",
        text: "Muslim men and women, believing men and women, obedient men and women, truthful men and women, patient men and women, humble men and women, charitable men and women, fasting men and women, and the men and women who guard their chastity, and men and women who remember Allah much – Allah has prepared for them forgiveness and a great reward.",
        ref: "Quran 33:35",
      },
      points: [
        {
          title: "One reward, whoever you are",
          detail:
            "Allah answers the believers: 'I will never waste the deeds of any doer among you, male or female; you are the same in reward.' And: 'Whoever does righteous deeds, whether male or female, and is a believer, it is they who will enter Paradise, and they will not be wronged even as much as the speck on a date stone.' The scales of the Hereafter know no gender.",
          note: "Quran 3:195; Quran 4:124; Quran 16:97",
        },
        {
          title: "'Women are the partners of men'",
          detail:
            "When Umm Salamah asked whether a woman must perform ghusl as a man does, the Prophet (peace be upon him) replied: 'Yes. Indeed women are the partners of men.' One sentence that settles the frame: in accountability before Allah, women are not an afterthought to men's religion — they are its equal half.",
          note: "Tirmidhi 1:113",
        },
        {
          title: "Allies of one another",
          detail:
            "'The believers, both men and women, are allies of one another; they enjoin what is good and forbid what is evil, they establish prayer, give zakah and obey Allah and His Messenger.' Faith is a joint project — women are named as guardians of the community's good alongside men, not as its silent audience.",
          note: "Quran 9:71",
        },
      ],
    },
  },
  {
    id: "mothers",
    name: "Mothers",
    content: {
      intro:
        "No human being is honored in the Sunnah the way a mother is honored. Asked who deserves the best companionship, the Prophet (peace be upon him) named her three times before anyone else.",
      verse: {
        arabic: "وَوَصَّيْنَا ٱلْإِنسَـٰنَ بِوَٰلِدَيْهِ حَمَلَتْهُ أُمُّهُۥ وَهْنًا عَلَىٰ وَهْنٍ وَفِصَـٰلُهُۥ فِى عَامَيْنِ أَنِ ٱشْكُرْ لِى وَلِوَٰلِدَيْكَ إِلَىَّ ٱلْمَصِيرُ",
        text: "We have enjoined upon man kindness to his parents. His mother bore him in weakness upon weakness, and his weaning took place within two years. Be grateful to Me and to your parents. To Me is the final return.",
        ref: "Quran 31:14",
      },
      points: [
        {
          title: "Your mother — three times",
          detail:
            "A man came to Allah's Messenger (peace be upon him) and said, 'O Allah's Messenger! Who is more entitled to be treated with the best companionship by me?' The Prophet said, 'Your mother.' The man said, 'Who is next?' The Prophet said, 'Your mother.' The man further said, 'Who is next?' The Prophet said, 'Your mother.' The man asked for the fourth time, 'Who is next?' The Prophet said, 'Your father.'",
          note: "Bukhari 78:2",
        },
        {
          title: "Paradise beneath her feet",
          detail:
            "When Jahimah came asking permission to go out and fight, the Prophet (peace be upon him) asked: 'Do you have a mother?' He said: 'Yes.' He said: 'Then stay with her, for Paradise is beneath her feet.' Serving one's mother outweighed even the battlefield.",
          note: "Nasai 25:20",
        },
        {
          title: "Undutifulness to mothers is forbidden by name",
          detail:
            "The Prophet (peace be upon him) said: 'Allah has forbidden for you, (1) to be undutiful to your mothers, (2) to bury your daughters alive…' Of all the forms of disobedience to parents, the mother is singled out by name for protection.",
          note: "Bukhari 43:23",
        },
      ],
    },
  },
  {
    id: "daughters",
    name: "Daughters",
    content: {
      intro:
        "Islam arrived in a world where baby girls were buried alive — and made raising daughters well a shield from the Fire. The Quran gave the murdered girl a voice on the Day of Judgment.",
      verse: {
        arabic: "وَإِذَا ٱلْمَوْءُۥدَةُ سُئِلَتْ بِأَىِّ ذَنۢبٍ قُتِلَتْ",
        text: "and when the baby girl buried alive is asked, for what crime she was killed,",
        ref: "Quran 81:8-9",
      },
      points: [
        {
          title: "A shield from the Fire",
          detail:
            "A'isha gave her single remaining date to a mother who split it between her two daughters, eating nothing herself. When she told the Prophet (peace be upon him), he said: 'Whoever is in charge of (put to test by) these daughters and treats them generously, then they will act as a shield for him from the (Hell) Fire.'",
          note: "Bukhari 78:26; Muslim 45:190",
        },
        {
          title: "Patience with daughters",
          detail:
            "The Messenger of Allah (peace be upon him) said: 'Whoever is tried with something from daughters, and he is patient with them, they will be a barrier from the Fire for him.' And: 'Whoever has three daughters and is patient towards them, and feeds them, gives them to drink, and clothes them from his wealth; they will be a shield for him from the Fire on the Day of Resurrection.'",
          note: "Tirmidhi 27:19; Ibn Majah 33:13",
        },
        {
          title: "The old world overturned",
          detail:
            "Burying daughters alive was named by the Prophet (peace be upon him) among the things Allah has forbidden outright. Where pre-Islamic Arabia saw a daughter as a disgrace, revelation made her a door to Paradise for the parent who honors her.",
          note: "Quran 81:8-9; Bukhari 78:6",
        },
      ],
    },
  },
  {
    id: "khadijah",
    name: "Khadijah",
    content: {
      intro:
        "Khadijah bint Khuwaylid — the first person to believe in the Prophet (peace be upon him), a successful merchant of Makkah, his only spouse for twenty-five years, and the mother of most of his children.",
      points: [
        {
          title: "The best of its women",
          detail:
            "The Prophet (peace be upon him) said: 'The best of the world's women is Mary (at her lifetime), and the best of the world's women is Khadija (at her lifetime).' Before revelation she was a respected businesswoman who had entrusted the young Muhammad with her trade; scholars of the seerah relate that it was she who proposed marriage — and she who wrapped him and believed him the night revelation began.",
          note: "Bukhari 63:40",
        },
        {
          title: "Greeted by her Lord",
          detail:
            "Gabriel came to the Prophet (peace be upon him) and said: 'O Allah's Messenger! This is Khadija coming to you with a dish having meat soup (or some food or drink). When she reaches you, greet her on behalf of her Lord (i.e. Allah) and on my behalf, and give her the glad tidings of having a Qasab palace in Paradise wherein there will be neither any noise nor any fatigue (trouble).'",
          note: "Bukhari 63:45",
        },
        {
          title: "A love that never faded",
          detail:
            "Years after her death, A'isha said she never felt jealous of any wife as she did of Khadijah — the Prophet (peace be upon him) 'used to mention her very often, and whenever he slaughtered a sheep, he would cut its parts and send them to the women friends of Khadija.' When A'isha protested, he answered: 'Khadija was such-and-such, and from her I had children.'",
          note: "Bukhari 63:43",
        },
      ],
    },
  },
  {
    id: "aisha",
    name: "A'isha the Scholar",
    content: {
      intro:
        "A'isha bint Abi Bakr, Mother of the Believers, is one of the greatest scholars of this ummah — among the most prolific narrators of hadith, and the reference the community turned to for how the Prophet (peace be upon him) actually lived and worshiped.",
      points: [
        {
          title: "A superiority the Prophet himself described",
          detail:
            "Allah's Messenger (peace be upon him) said: 'Many amongst men attained perfection but amongst women none attained the perfection except Mary, the daughter of Imran and Asiya, the wife of Pharaoh. And the superiority of A'isha to other women is like the superiority of Tharid (i.e. an Arabic dish) to other meals.'",
          note: "Bukhari 62:114",
        },
        {
          title: "The teacher of a generation",
          detail:
            "Open almost any chapter of worship and you find her students asking and her answers preserved: Masruq 'asked Aishah about the Witr of the Prophet,' Abdullah bin Shaqiq asked her about his regular voluntary prayers, others about his night recitation and his fasting. After the Prophet's (peace be upon him) death, much of how this ummah knows his private worship, it knows through her.",
          note: "Tirmidhi 3:5; Tirmidhi 2:289",
        },
        {
          title: "A jurist in her own right",
          detail:
            "Scholars record over two thousand narrations transmitted from her, and count her among the handful of companions who gave the most legal verdicts. Abu Musa al-Ash'ari said that whenever the companions found a hadith difficult and asked A'isha, they found knowledge of it with her. A woman stands permanently at the center of Islamic scholarship.",
          note: "Tirmidhi 49:283",
        },
      ],
    },
  },
  {
    id: "fatimah",
    name: "Fatimah",
    content: {
      intro:
        "Fatimah, the youngest daughter of the Prophet (peace be upon him) — so beloved that he described her as a piece of himself, and gave her glad tidings of leadership over the believing women.",
      points: [
        {
          title: "'Fatima is a part of me'",
          detail:
            "Allah's Messenger (peace be upon him) said: 'Fatima is a part of me, and he who makes her angry, makes me angry.' Her honor was his honor — stated publicly, from the pulpit.",
          note: "Bukhari 62:63",
        },
        {
          title: "Chief of the believing women",
          detail:
            "In his final illness the Prophet (peace be upon him) confided two secrets to her: first that his death was near — and she wept; then he asked, 'O Fatima! Will you not be pleased that you will be chief of all the believing women?' — and she laughed.",
          note: "Bukhari 79:58",
        },
        {
          title: "Her father's manner",
          detail:
            "A'isha said: 'I have not seen anyone closer in conduct, way, and manners to that of the Messenger of Allah in regards to standing and sitting, than Fatimah the daughter of the Messenger of Allah. Whenever she would enter upon the Prophet he would stand to her and kiss her, and he would sit her in his sitting place.'",
          note: "Tirmidhi 49:272",
        },
      ],
    },
  },
];

const worshipTopics: Topic[] = [
  {
    id: "menstruation",
    name: "Menstruation",
    content: {
      intro:
        "During menstruation a woman does not pray or fast. The missed prayers are excused entirely — never made up — while missed fasts are made up later. This is a concession from Allah, not an exclusion from His mercy.",
      verse: {
        arabic: "وَيَسْـَٔلُونَكَ عَنِ ٱلْمَحِيضِ ۖ قُلْ هُوَ أَذًى فَٱعْتَزِلُوا۟ ٱلنِّسَآءَ فِى ٱلْمَحِيضِ ۖ وَلَا تَقْرَبُوهُنَّ حَتَّىٰ يَطْهُرْنَ ۖ فَإِذَا تَطَهَّرْنَ فَأْتُوهُنَّ مِنْ حَيْثُ أَمَرَكُمُ ٱللَّهُ ۚ إِنَّ ٱللَّهَ يُحِبُّ ٱلتَّوَّٰبِينَ وَيُحِبُّ ٱلْمُتَطَهِّرِينَ",
        text: "They ask you about menstruation. Say: “It is impurity; so stay away from women during menstruation and do not have intercourse with them until they become pure. When they are cleansed, then have intimacy with them as Allah has commanded you. Allah loves those who frequently repent and He loves those who purify themselves.",
        ref: "Quran 2:222",
      },
      points: [
        {
          title: "Prayers excused, fasts deferred",
          detail:
            "Mu'adha asked A'isha why a menstruating woman makes up the fasts but not the prayers. A'isha answered: 'We passed through this (period of menstruation), and we were ordered to complete the fasts, but were not ordered to complete the prayers.' This is the agreed-upon rule of all schools: salah during menses is lifted completely; Ramadan fasts are repaid on other days.",
          note: "Muslim 3:85; Tirmidhi 8:106",
        },
        {
          title: "Dignity, not exile",
          detail:
            "Among the Jews of Madinah, a menstruating woman was ejected from the house — no one would eat or drink with her. When the Prophet (peace be upon him) was asked, the verse above was revealed and he said: 'Associate with them in the houses and do everything except sexual intercourse.' The restriction is one act only; everyday life, affection, and companionship continue unchanged.",
          note: "Abu Dawud 1:258; Quran 2:222",
        },
        {
          title: "What else changes — the schools differ",
          detail:
            "Beyond prayer and fasting, scholars discuss touching the mushaf, reciting Quran from memory, and remaining in the mosque during menses. The schools of law differ on these details — some allow recitation from memory, others do not — so follow the position of your school or a scholar you trust rather than assuming one absolute rule.",
        },
        {
          title: "The door of dhikr stays open",
          detail:
            "Menstruation never suspends a woman's connection with Allah. Dhikr, du'a, istighfar, listening to Quran, charity, and every other good deed remain fully open — and scholars note that a woman who keeps her habitual worship in the ways available to her loses nothing of her reward.",
        },
      ],
    },
  },
  {
    id: "istihada",
    name: "Istihada Is Different",
    content: {
      intro:
        "Istihada — irregular, non-menstrual bleeding — does not carry the rulings of menses. A woman experiencing it prays and fasts as normal. The Prophet (peace be upon him) settled this for a woman brave enough to ask.",
      points: [
        {
          title: "The question of Fatimah bint Abi Hubaysh",
          detail:
            "Fatimah bint Abi Hubaysh said to Allah's Messenger (peace be upon him): 'O Allah's Messenger! I do not become clean (from bleeding). Shall I give up my prayers?' He replied: 'No, because it is from a blood vessel and not the menses. So when the real menses begins give up your prayers and when it (the period) has finished wash the blood off your body (take a bath) and offer your prayers.'",
          note: "Bukhari 6:11; Ibn Majah 1:355",
        },
        {
          title: "Count your habit, then resume",
          detail:
            "In another narration he told her: 'Give up the prayers only for the days on which you usually get the menses and then take a bath and offer your prayers.' A woman with continuous bleeding treats only her usual monthly days as menses; outside them she performs ghusl once and resumes prayer and fasting.",
          note: "Bukhari 6:30; Ibn Majah 1:354",
        },
        {
          title: "Wudu for each prayer",
          detail:
            "One narration adds: 'take a bath, and perform ablution for each prayer, even if drops of blood fall on the mat.' Based on this, most schools instruct the woman with istihada to make fresh wudu for each prayer (or each prayer time), while the schools differ on whether this is obligatory or recommended — another point to confirm with your school.",
          note: "Ibn Majah 1:358",
        },
        {
          title: "When to ask a scholar",
          detail:
            "Telling menses from istihada in irregular cycles — after miscarriage, on contraception, or with medical conditions — is precisely the kind of case the books of fiqh treat individually. If your situation is unclear, ask a qualified scholar (and, where relevant, a doctor) rather than guessing; worship built on a wrong assumption is harder to untangle later.",
        },
      ],
    },
  },
  {
    id: "nifas",
    name: "Nifas — After Childbirth",
    content: {
      intro:
        "Nifas is the bleeding that follows childbirth. During it a woman is excused from prayer and fasting on the same pattern as menstruation — prayers are not made up, fasts are.",
      points: [
        {
          title: "Forty days as the outer mark",
          detail:
            "Umm Salamah reported: 'The woman having bleeding after delivery (puerperal haemorrhage) would refrain (from prayer) for forty days or forty nights.' Based on this, the majority of scholars set forty days as the usual maximum of nifas.",
          note: "Abu Dawud 1:311",
        },
        {
          title: "If the bleeding stops earlier",
          detail:
            "There is no fixed minimum. Most scholars hold that if the bleeding stops before forty days, the woman performs ghusl and resumes prayer and fasting right away — she does not wait out the forty days.",
        },
        {
          title: "Beyond forty days",
          detail:
            "If bleeding continues past the usual maximum, scholars generally treat the excess as istihada — she bathes, then prays and fasts, renewing wudu as the istihada rulings describe. The schools differ on the details here, and postnatal cases vary greatly; take your specific situation to a scholar you trust.",
        },
      ],
    },
  },
  {
    id: "mosque-and-home",
    name: "Mosque & Praying at Home",
    content: {
      intro:
        "The Prophet (peace be upon him) commanded that women never be barred from the mosque — and in the same breath taught that a woman's prayer at home carries its own virtue. Both texts are honored together: access is her right; the home is not a lesser place of worship.",
      points: [
        {
          title: "'Do not prevent'",
          detail:
            "The wife of Umar used to pray Fajr and Isha in congregation in the mosque although she knew Umar disliked it. Asked why, she answered that what prevents him from stopping her is the Prophet's (peace be upon him) own statement: 'Do not stop Allah's women-slaves from going to Allah's Mosques.' When one of Ibn Umar's sons swore he would prevent women anyway, Ibn Umar rebuked him more harshly than he had ever been heard.",
          note: "Bukhari 11:24; Muslim 4:150; Muslim 4:151; Muslim 4:152",
        },
        {
          title: "The home also carries virtue",
          detail:
            "The same Ibn Umar reported the Messenger of Allah (peace be upon him) as saying: 'Do not prevent your women from visiting the mosque; but their houses are better for them (for praying).' Congregational prayer in the mosque is not obligatory upon women as it is discussed for men — she keeps full choice, and loses nothing praying at home.",
          note: "Abu Dawud 2:177",
        },
        {
          title: "Holding both texts honestly",
          detail:
            "Neither text erases the other. A community that locks women out of the mosque disobeys an explicit command; a woman who prefers to pray at home follows a path the Prophet (peace be upon him) himself called better for her. The choice belongs to her — not to gatekeepers in either direction.",
        },
      ],
    },
  },
  {
    id: "asking-without-shame",
    name: "Asking Without Shame",
    content: {
      intro:
        "The rulings on this page exist because women of the first generation asked direct questions about blood, purity, and intimacy — and the Prophet (peace be upon him) answered them without embarrassment.",
      points: [
        {
          title: "Umm Salamah's question",
          detail:
            "When the Prophet (peace be upon him) was asked about ghusl for men, Umm Salamah followed up: 'O Messenger of Allah! Is the woman required to perform Ghusl if she sees that?' He replied: 'Yes. Indeed women are the partners of men.' Her question fixed a ruling for half the ummah.",
          note: "Tirmidhi 1:113",
        },
        {
          title: "Asma asks about purification",
          detail:
            "Asma asked the Prophet (peace be upon him) how a woman purifies after her period, and he answered her practically — down to using 'a musk-scented piece of cloth.' The books of purification are full of women's names because women kept asking.",
          note: "Abu Dawud 1:316",
        },
        {
          title: "Shyness never blocks knowledge",
          detail:
            "Modesty is part of faith, but it was never allowed to stand between a believer and knowing how to worship. If a question about your body and your worship feels awkward, ask it anyway — privately, to a scholar or a knowledgeable woman. That is the Sunnah of the women of Madinah.",
        },
      ],
    },
  },
];

const hijabTopics: Topic[] = [
  {
    id: "the-command",
    name: "The Command",
    content: {
      intro:
        "Hijab is not a cultural leftover — it is a direct command in the Quran, addressed to believing women through the Prophet (peace be upon him), with its purpose stated in the verses themselves.",
      verse: {
        arabic: "وَقُل لِّلْمُؤْمِنَـٰتِ يَغْضُضْنَ مِنْ أَبْصَـٰرِهِنَّ وَيَحْفَظْنَ فُرُوجَهُنَّ وَلَا يُبْدِينَ زِينَتَهُنَّ إِلَّا مَا ظَهَرَ مِنْهَا ۖ وَلْيَضْرِبْنَ بِخُمُرِهِنَّ عَلَىٰ جُيُوبِهِنَّ ۖ وَلَا يُبْدِينَ زِينَتَهُنَّ إِلَّا لِبُعُولَتِهِنَّ أَوْ ءَابَآئِهِنَّ أَوْ ءَابَآءِ بُعُولَتِهِنَّ أَوْ أَبْنَآئِهِنَّ أَوْ أَبْنَآءِ بُعُولَتِهِنَّ أَوْ إِخْوَٰنِهِنَّ أَوْ بَنِىٓ إِخْوَٰنِهِنَّ أَوْ بَنِىٓ أَخَوَٰتِهِنَّ أَوْ نِسَآئِهِنَّ أَوْ مَا مَلَكَتْ أَيْمَـٰنُهُنَّ أَوِ ٱلتَّـٰبِعِينَ غَيْرِ أُو۟لِى ٱلْإِرْبَةِ مِنَ ٱلرِّجَالِ أَوِ ٱلطِّفْلِ ٱلَّذِينَ لَمْ يَظْهَرُوا۟ عَلَىٰ عَوْرَٰتِ ٱلنِّسَآءِ ۖ وَلَا يَضْرِبْنَ بِأَرْجُلِهِنَّ لِيُعْلَمَ مَا يُخْفِينَ مِن زِينَتِهِنَّ ۚ وَتُوبُوٓا۟ إِلَى ٱللَّهِ جَمِيعًا أَيُّهَ ٱلْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ",
        text: "Tell the believing women to lower their gazes and guard their private parts, and not to reveal their beauty except what appears. And let them draw their veils over their chests, and not to reveal their beauty except to their husbands, their fathers, their fathers-in-law, their sons, their stepsons, their brothers, their brothers’ sons or sisters’ sons, their fellow women, slaves whom they own, male attendants who have no [sexual] desire, or children who are still unaware of private aspects of women. Nor let them stamp their feet in order to draw attention to their hidden charm. And turn to Allah in repentance all together, O believers, so that you may be successful.",
        ref: "Quran 24:31",
      },
      points: [
        {
          title: "Men are commanded first",
          detail:
            "The verse before this one addresses men: 'Tell the believing men to lower their gazes and guard their private parts; that is purer for them.' Modesty in Islam begins as a duty on men's eyes before it says anything about women's dress — a sequencing the Quran itself chose.",
          note: "Quran 24:30",
        },
        {
          title: "The khimar drawn over the chest",
          detail:
            "The verse instructs believing women to 'draw their veils over their chests' — the khimar (head-covering) already worn by Arab women was to be extended to cover the neck and chest, and beauty shown only to the close family members the verse lists.",
          note: "Quran 24:31",
        },
        {
          title: "'Known and not harassed'",
          detail:
            "The second verse of hijab gives its purpose: 'O Prophet, tell your wives and your daughters, and the believing women to draw their outer garments over themselves; that is more likely that they will be known [as chaste women] and will not be harassed.' Hijab in the Quran is framed as dignity and protection — a public statement of who she is, on her own terms.",
          note: "Quran 33:59",
        },
      ],
    },
  },
  {
    id: "what-it-covers",
    name: "What It Covers",
    content: {
      intro:
        "The broad lines of a Muslim woman's dress come from the two verses; the precise boundaries are discussed in the schools of law — with one well-known difference.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلنَّبِىُّ قُل لِّأَزْوَٰجِكَ وَبَنَاتِكَ وَنِسَآءِ ٱلْمُؤْمِنِينَ يُدْنِينَ عَلَيْهِنَّ مِن جَلَـٰبِيبِهِنَّ ۚ ذَٰلِكَ أَدْنَىٰٓ أَن يُعْرَفْنَ فَلَا يُؤْذَيْنَ ۗ وَكَانَ ٱللَّهُ غَفُورًا رَّحِيمًا",
        text: "O Prophet, tell your wives and your daughters, and the believing women to draw their outer garments over themselves; that is more likely that they will be known [as chaste women] and will not be harassed. And Allah is All-Forgiving, Most Merciful.",
        ref: "Quran 33:59",
      },
      points: [
        {
          title: "The majority position",
          detail:
            "The majority of scholars across the schools hold that a woman covers everything in front of non-mahram men except the face and hands, reading 'except what appears' in 24:31 as referring to these. This is the position most contemporary scholars give as the baseline obligation.",
        },
        {
          title: "The face-veil difference",
          detail:
            "A significant body of classical scholars held that the face is also to be covered, understanding the outer-garment verse to include it. Both positions have long scholarly pedigrees; women following either are following recognized Islamic scholarship, and neither should be belittled for it.",
        },
        {
          title: "How it fits, not just what it hides",
          detail:
            "Scholars describe conditions beyond coverage: the garment should be loose rather than shaping the body, not transparent, and not itself a showpiece of adornment that defeats the verse's purpose. The spirit is consistency between the covering and what it is for.",
        },
      ],
    },
  },
  {
    id: "modesty-within",
    name: "Modesty Within",
    content: {
      intro:
        "Cloth is the visible edge of something deeper. Haya — modesty, self-respect, reverent shyness before Allah — is named by the Prophet (peace be upon him) as a branch of faith itself, for men and women alike.",
      verse: {
        arabic: "قُل لِّلْمُؤْمِنِينَ يَغُضُّوا۟ مِنْ أَبْصَـٰرِهِمْ وَيَحْفَظُوا۟ فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ ۗ إِنَّ ٱللَّهَ خَبِيرٌۢ بِمَا يَصْنَعُونَ",
        text: "Tell the believing men to lower their gazes and guard their private parts; that is purer for them. Indeed, Allah is All-Aware of what they do.",
        ref: "Quran 24:30",
      },
      points: [
        {
          title: "A branch of faith",
          detail:
            "The Prophet (peace be upon him) said: 'Faith (Belief) consists of more than sixty branches (i.e. parts). And Haya … is a part of faith.' Modesty is not a rule bolted onto Islam from outside — it grows from the same root as belief.",
          note: "Bukhari 2:2",
        },
        {
          title: "It brings nothing but good",
          detail:
            "Imran bin Husain reported the Prophet (peace be upon him) saying: 'Haya' … does not bring anything except good.' Inner modesty — in speech, gaze, and bearing — is a strength, not a weakness, and it belongs to men as fully as to women.",
          note: "Bukhari 78:144",
        },
        {
          title: "The order of the heart",
          detail:
            "A covered body with a heedless heart misses the point, and scholars remind that hijab of the eyes, the tongue, and the intention is asked of every believer. The outer and inner are meant to grow together — neither is an excuse to abandon the other.",
        },
      ],
    },
  },
  {
    id: "a-journey",
    name: "A Journey, Not a Judgment",
    content: {
      intro:
        "For many women, hijab is a path walked in stages — sometimes with fear, family pressure, or workplaces that make it costly. The command is real; so is Allah's gentleness with those moving toward Him.",
      points: [
        {
          title: "Start where you are",
          detail:
            "Every step toward obedience counts with Allah, and a step taken sincerely is never wasted even when the next one feels far. Scholars advise pairing the outward step with du'a and good company, and treating setbacks as part of the road rather than its end.",
        },
        {
          title: "No one else's scorecard",
          detail:
            "A woman's hijab is between her and her Lord. Mocking a sister who wears it, or shaming one who is still struggling toward it, both wound where the Quran commanded dignity. The believing community's job is to make obedience easier, not heavier.",
        },
        {
          title: "It does not pause your worship",
          detail:
            "A woman who has not yet taken this step still prays, fasts, gives, and is loved by Allah for all of it. Hijab is one obligation among the obligations — never a gate that must be passed before the rest of Islam opens.",
        },
      ],
    },
  },
];

const questionTopics: Topic[] = [
  {
    id: "polygamy",
    name: "Polygamy in Context",
    content: {
      intro:
        "The Quran did not invent plural marriage — it found a world of unlimited wives and restricted it: a maximum of four, bound to a justice condition, revealed in a passage about protecting orphans.",
      verse: {
        arabic: "وَإِنْ خِفْتُمْ أَلَّا تُقْسِطُوا۟ فِى ٱلْيَتَـٰمَىٰ فَٱنكِحُوا۟ مَا طَابَ لَكُم مِّنَ ٱلنِّسَآءِ مَثْنَىٰ وَثُلَـٰثَ وَرُبَـٰعَ ۖ فَإِنْ خِفْتُمْ أَلَّا تَعْدِلُوا۟ فَوَٰحِدَةً أَوْ مَا مَلَكَتْ أَيْمَـٰنُكُمْ ۚ ذَٰلِكَ أَدْنَىٰٓ أَلَّا تَعُولُوا۟",
        text: "If you fear that you may not maintain justice with orphan girls [by marrying them] then marry women of your choice—two, three, or four; but if you fear that you may not maintain justice, then marry only one, or slave-girls you may own. That is more likely to avoid committing injustice.",
        ref: "Quran 4:3",
      },
      points: [
        {
          title: "A restriction, not an invention",
          detail:
            "In seventh-century Arabia — as in much of the ancient world — men married without limit. The verse cut that down to four and, in the same sentence, ordered retreat to one wherever justice is feared to fail. Historically the verse narrowed men's options; it did not widen them.",
          note: "Quran 4:3",
        },
        {
          title: "The justice condition is heavy",
          detail:
            "The Quran itself says: 'You will never be able to maintain absolute justice between your wives, no matter how keen you are. So do not completely incline to one leaving the other in suspense.' Equal maintenance and time are required of a man with more than one wife; the verse warns how demanding that is.",
          note: "Quran 4:129",
        },
        {
          title: "The lived norm",
          detail:
            "For most Muslims in most times and places, marriage has been to one spouse — and scholars note the Quran names 'one' as the safer course for whoever fears injustice. Where it is practiced, plural marriage carries legal and ethical duties, and a woman may also set conditions in her marriage contract; the details belong with scholars of family law.",
        },
      ],
    },
  },
  {
    id: "inheritance-shares",
    name: "Inheritance Shares",
    content: {
      intro:
        "Fourteen centuries ago — when women in most of the world could be inherited as property — the Quran made women heirs by divine decree.",
      verse: {
        arabic: "لِّلرِّجَالِ نَصِيبٌ مِّمَّا تَرَكَ ٱلْوَٰلِدَانِ وَٱلْأَقْرَبُونَ وَلِلنِّسَآءِ نَصِيبٌ مِّمَّا تَرَكَ ٱلْوَٰلِدَانِ وَٱلْأَقْرَبُونَ مِمَّا قَلَّ مِنْهُ أَوْ كَثُرَ ۚ نَصِيبًا مَّفْرُوضًا",
        text: "Men have a share in what parents and relatives leave behind, and women have a share in what parents and relatives leave behind, whether it is little or much; an ordained share.",
        ref: "Quran 4:7",
      },
      points: [
        {
          title: "A guaranteed share",
          detail:
            "The verse grants women an 'ordained share' — not a gift a family may choose to give, but a right fixed by Allah that no relative can cancel. The Quran also forbade the pre-Islamic practice outright: 'it is not lawful for you to forcibly inherit women.'",
          note: "Quran 4:7; Quran 4:19",
        },
        {
          title: "Why some shares differ",
          detail:
            "In the sibling case the Quran assigns 'the share of a male is equal to that of two females' — and classical scholars connect this to who carries the financial load: the brother must pay a dower and maintain his wife and family from his share, while the sister's share is hers alone, with no obligation to spend it on anyone. Her wealth stays hers; his is claimed by others.",
          note: "Quran 4:11",
        },
        {
          title: "Not a flat rule",
          detail:
            "The two-to-one ratio applies to specific cases, not to 'women' as a category — scholars enumerate many configurations where a woman inherits the same as, or more than, a man of the same degree (a mother and father inheriting from a child each take a sixth, for instance). The full system is worked out case by case in the law of inheritance.",
        },
      ],
    },
  },
  {
    id: "testimony",
    name: "Testimony",
    content: {
      intro:
        "One verse about documenting debts is often quoted as if it graded women's worth. Read in place, it is a rule about evidence in financial contracts — and it is not the whole picture of testimony in Islam.",
      points: [
        {
          title: "The debt verse, in its own words",
          detail:
            "In the longest verse of the Quran — about writing down loans — Allah says: 'bring two witnesses from among your men; if two men are not available, then one man and two women from those whom you accept as witnesses – so that if one of them forgets, the other can remind her.' The verse itself gives its mechanism: corroboration in formal financial documentation, in a society where commerce was overwhelmingly men's domain.",
          note: "Quran 2:282",
        },
        {
          title: "Not a statement of worth",
          detail:
            "The same tradition accepted the lone word of individual women in what matters most: a large portion of the religion itself reaches us through single narrations of A'isha, Umm Salamah, and other women, accepted by every school of hadith scholarship on exactly the same terms as men's narrations. No scholar ever required two women narrators to equal one man.",
        },
        {
          title: "Where classical positions differ",
          detail:
            "Classical jurists differed over how far the debt-verse rule extends beyond financial cases — some domains (such as matters only women typically witness) were resolved by women's testimony alone. This is an area of genuine scholarly discussion, best explored through the fiqh literature rather than slogans in either direction.",
        },
      ],
    },
  },
  {
    id: "leadership",
    name: "Leadership & Public Life",
    content: {
      intro:
        "Believing women in the Quran enjoin good, forbid evil, give pledges of allegiance, and question prophets. On the single office of head of state, classical scholarship read one hadith strictly — and its scope is discussed to this day.",
      verse: {
        arabic: "وَٱلْمُؤْمِنُونَ وَٱلْمُؤْمِنَـٰتُ بَعْضُهُمْ أَوْلِيَآءُ بَعْضٍ ۚ يَأْمُرُونَ بِٱلْمَعْرُوفِ وَيَنْهَوْنَ عَنِ ٱلْمُنكَرِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَيُؤْتُونَ ٱلزَّكَوٰةَ وَيُطِيعُونَ ٱللَّهَ وَرَسُولَهُۥٓ ۚ أُو۟لَـٰٓئِكَ سَيَرْحَمُهُمُ ٱللَّهُ ۗ إِنَّ ٱللَّهَ عَزِيزٌ حَكِيمٌ",
        text: "The believers, both men and women, are allies of one another; they enjoin what is good and forbid what is evil, they establish prayer, give zakah and obey Allah and His Messenger. It is they who will receive Allah’s mercy, for Allah is All-Mighty, All-Wise.",
        ref: "Quran 9:71",
      },
      points: [
        {
          title: "Present from the first day",
          detail:
            "Scholars of the seerah relate that the first believer was a woman, the first martyr of Islam was a woman, and the Prophet's (peace be upon him) wealthiest early supporter was a businesswoman. The community's greatest hadith teacher after him was also a woman: women prayed in his mosque, asked him rulings in public, and are recorded arguing their cases — the sources are full of their names.",
          note: "Bukhari 63:40; Tirmidhi 1:113; Bukhari 11:24",
        },
        {
          title: "The head-of-state hadith",
          detail:
            "When news reached the Prophet (peace be upon him) that Persia had crowned the daughter of Khosrau, he said: 'Never will succeed such a nation as makes a woman their ruler.' Classical scholars applied this to the supreme leadership of the state. Contemporary scholars discuss its scope — whether it was specific to that context or general, and what it does and does not cover — and positions genuinely differ.",
          note: "Bukhari 92:50",
        },
        {
          title: "Everything short of that office",
          detail:
            "Beyond the contested question of head of state, Muslim history records women as scholars, muftis, teachers of the great imams, market inspectors, and transmitters of the religion itself — roles scholars across the schools accepted. A tradition whose second-greatest source of Prophetic knowledge is A'isha cannot coherently be read as silencing women.",
        },
      ],
    },
  },
];

const tabs = [
  { key: "status", label: "Status & Honor" },
  { key: "worship", label: "Worship & Fiqh" },
  { key: "hijab", label: "Hijab & Dress" },
  { key: "questions", label: "Common Questions" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* ───────────────────────── page ───────────────────────── */

function WomenContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const t = searchParams.get("tab");
    return t && tabs.some((x) => x.key === t) ? (t as TabKey) : "status";
  });
  // Deep-link support: ?tab=<key>&sub=<topic id>. Ids are unique across the page.
  const initialSub = searchParams.get("sub");
  const [statusSub, setStatusSub] = useState(() =>
    initialSub && statusTopics.some((t) => t.id === initialSub) ? initialSub : statusTopics[0].id
  );
  const [worshipSub, setWorshipSub] = useState(() =>
    initialSub && worshipTopics.some((t) => t.id === initialSub) ? initialSub : worshipTopics[0].id
  );
  const [hijabSub, setHijabSub] = useState(() =>
    initialSub && hijabTopics.some((t) => t.id === initialSub) ? initialSub : hijabTopics[0].id
  );
  const [questionSub, setQuestionSub] = useState(() =>
    initialSub && questionTopics.some((t) => t.id === initialSub) ? initialSub : questionTopics[0].id
  );
  const [search, setSearch] = useState("");

  // House rule: the Sources & References card below a rail lists ONLY the
  // active selection's sources (derived from its verse ref + point notes).
  const activeStatusTopic = statusTopics.find((t) => t.id === statusSub) ?? statusTopics[0];
  const activeWorshipTopic = worshipTopics.find((t) => t.id === worshipSub) ?? worshipTopics[0];
  const activeHijabTopic = hijabTopics.find((t) => t.id === hijabSub) ?? hijabTopics[0];
  const activeQuestionTopic =
    questionTopics.find((t) => t.id === questionSub) ?? questionTopics[0];
  // "Bukhari 4:94" (Book of Wudu version of the Fatimah bint Abi Hubaysh istihada
  // hadith) was cited in the old tab-wide list but appears in no point note, so
  // topicSourceRefs cannot derive it — appended here to keep the list complete.
  const worshipSourceRows = [
    ...topicSourceRefs(activeWorshipTopic),
    ...(activeWorshipTopic.id === "istihada"
      ? [{ ref: "Bukhari 4:94", desc: "Fatimah bint Abi Hubaysh — istihada is not menses" }]
      : []),
  ];

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
    fix(statusTopics, statusSub, setStatusSub);
    fix(worshipTopics, worshipSub, setWorshipSub);
    fix(hijabTopics, hijabSub, setHijabSub);
    fix(questionTopics, questionSub, setQuestionSub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusSub, worshipSub, hijabSub, questionSub]);

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
        title="Women in Islam"
        titleAr="المرأة في الإسلام"
        subtitle="Honor, worship, dress, and the honest answers — from the Quran and authentic Sunnah."
      />

      <VerseHero
        arabic="مَنْ عَمِلَ صَـٰلِحًا مِّن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ فَلَنُحْيِيَنَّهُۥ حَيَوٰةً طَيِّبَةً ۖ وَلَنَجْزِيَنَّهُمْ أَجْرَهُم بِأَحْسَنِ مَا كَانُوا۟ يَعْمَلُونَ"
        text="Whoever does righteous deeds, male or female, while being a believer, We will surely grant him a good life, and We will surely reward them according to the best of their deeds."
        reference="Quran 16:97"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search topics, verses..." className="mb-6" />

      <TabBar tabs={[...tabs]} activeTab={activeTab} onTabChange={handleTabChange} className="mb-6" />

      <AnimatePresence mode="wait">
        {/* ─── Status & Honor ─── */}
        {activeTab === "status" && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(statusTopics, statusSub, handleSubChange("status", setStatusSub))}

            {topicSourceRefs(activeStatusTopic).length > 0 && (
              <SourcesCard className="mt-8" sources={topicSourceRefs(activeStatusTopic)} />
            )}
          </motion.div>
        )}

        {/* ─── Worship & Fiqh ─── */}
        {activeTab === "worship" && (
          <motion.div
            key="worship"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(worshipTopics, worshipSub, handleSubChange("worship", setWorshipSub))}

            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">A note on these rulings</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Menstruation, istihada, and nifas gate real daily worship, and the schools of law
                differ on several details noted above. This page gives the anchored texts and the
                broad rulings — for your own cycle, your madhhab, or any unclear case, ask a
                qualified scholar. Ghusl itself is covered step by step on the purification page.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/salah?tab=wudu&sub=ghusl"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Ghusl — full purification →
                </Link>
                <Link
                  href="/salah"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  The salah guide →
                </Link>
              </div>
            </ContentCard>

            {worshipSourceRows.length > 0 && (
              <SourcesCard className="mt-6" sources={worshipSourceRows} />
            )}
          </motion.div>
        )}

        {/* ─── Hijab & Dress ─── */}
        {activeTab === "hijab" && (
          <motion.div
            key="hijab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(hijabTopics, hijabSub, handleSubChange("hijab", setHijabSub))}

            {topicSourceRefs(activeHijabTopic).length > 0 && (
              <SourcesCard className="mt-8" sources={topicSourceRefs(activeHijabTopic)} />
            )}
          </motion.div>
        )}

        {/* ─── Common Questions ─── */}
        {activeTab === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(questionTopics, questionSub, handleSubChange("questions", setQuestionSub))}

            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">Go deeper</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                The full case-by-case system of Islamic inheritance — shares, examples, and the
                verses behind them — has its own page, as do marriage and family life.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/inheritance"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Inheritance in Islam →
                </Link>
                <Link
                  href="/marriage"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Marriage →
                </Link>
                <Link
                  href="/family"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Family life →
                </Link>
              </div>
            </ContentCard>

            {topicSourceRefs(activeQuestionTopic).length > 0 && (
              <SourcesCard className="mt-6" sources={topicSourceRefs(activeQuestionTopic)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WomenPage() {
  return (
    <Suspense>
      <WomenContent />
    </Suspense>
  );
}
