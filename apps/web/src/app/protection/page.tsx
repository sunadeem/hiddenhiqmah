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
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";

/* ───────────────────────── data ───────────────────────── */

// Surah al-Falaq and Surah an-Nas — the two protectors (al-Mu'awwidhatan),
// quoted in full. Text copied verbatim from the local Quran data.
const falaqVerses = [
  { ar: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", en: "Say, “I seek refuge with the Lord of the daybreak,", ref: "113:1" },
  { ar: "مِن شَرِّ مَا خَلَقَ", en: "from the harm of all what He has created;", ref: "113:2" },
  { ar: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", en: "from the harm of darkening [night] when it spreads around,", ref: "113:3" },
  { ar: "وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ", en: "from the harm of the sorceresses who blow on knots,", ref: "113:4" },
  { ar: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", en: "and from the harm of the envier when he envies.\"", ref: "113:5" },
];

const nasVerses = [
  { ar: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", en: "Say, “I seek refuge with the Lord of mankind,", ref: "114:1" },
  { ar: "مَلِكِ ٱلنَّاسِ", en: "the Sovereign of mankind,", ref: "114:2" },
  { ar: "إِلَـٰهِ ٱلنَّاسِ", en: "the God of mankind,", ref: "114:3" },
  { ar: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ", en: "from the harm of the lurking whisperer,", ref: "114:4" },
  { ar: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ", en: "who whispers into the hearts of mankind,", ref: "114:5" },
  { ar: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", en: "from among jinn and mankind.”", ref: "114:6" },
];

const sihrTopics: Topic[] = [
  {
    id: "reality-of-sihr",
    name: "The Reality of Sihr",
    content: {
      intro:
        "The Quran affirms that sihr (magic) is real: devils taught it to people, and it can cause real harm — but never outside the limits Allah permits. Denying its existence contradicts the Quran, while fearing it more than Allah contradicts tawhid. The believer holds both truths at once.",
      verse: {
        arabic:
          "وَمَا كَفَرَ سُلَيْمَـٰنُ وَلَـٰكِنَّ ٱلشَّيَـٰطِينَ كَفَرُوا۟ يُعَلِّمُونَ ٱلنَّاسَ ٱلسِّحْرَ … وَمَا هُم بِضَآرِّينَ بِهِۦ مِنْ أَحَدٍ إِلَّا بِإِذْنِ ٱللَّهِ",
        text: "It was not Solomon who disbelieved, but the devils disbelieved, teaching people magic… But they could not harm anyone except by Allah’s permission. They would learn what harmed them and did not benefit them…",
        ref: "Quran 2:102",
      },
      points: [
        {
          title: "Real — but under Allah's control",
          detail:
            "The verse is explicit that sorcerers 'could not harm anyone except by Allah's permission.' Nothing reaches a person except what Allah has decreed. This is why the believer's response to the fear of sihr is reliance on Allah (tawakkul) and the prescribed adhkar — not panic, and not counter-magic.",
          note: "Quran 2:102",
        },
        {
          title: "Practicing it is disbelief",
          detail:
            "The same verse states that 'the devils disbelieved, teaching people magic' and that 'whoever gets into it would not have any share in the Hereafter.' Sorcery works through devotion to devils — which is why learning or practicing it takes a person out of the fold of tawhid.",
          note: "Quran 2:102",
        },
        {
          title: "The Quran itself is the shield",
          detail:
            "Surah al-Falaq was revealed teaching the believer to seek refuge 'from the harm of the sorceresses who blow on knots.' The Prophet (peace be upon him) said of al-Falaq and an-Nas: 'What wonderful verses have been sent down today, the like of which has never been seen!' Allah revealed the problem and its cure together.",
          note: "Quran 113:4; Muslim 6:319",
        },
      ],
    },
  },
  {
    id: "afflicted-prophet",
    name: "When the Prophet Was Afflicted",
    content: {
      intro:
        "The most famous narration on the whole subject concerns the Prophet (peace be upon him) himself: sorcery was worked on him by a man named Labid ibn al-A'sam. It answers the question every afflicted believer asks — can this reach even the best of people? — and it shows exactly how he responded: not with counter-magic, but by turning to Allah, who cured him.",
      points: [
        {
          title: "Magic was worked on the Prophet",
          detail:
            "A'isha narrated: 'Magic was worked on the Prophet (peace be upon him) so that he began to fancy that he was doing a thing which he was not actually doing. One day he invoked (Allah) for a long period and then said, \"I feel that Allah has inspired me as how to cure myself.\"' That sihr struck even the Messenger of Allah shows that being afflicted is no sign of weak faith or of Allah's displeasure — it is a trial, and it has a cure.",
          note: "Bukhari 59:78",
        },
        {
          title: "Labid ibn al-A'sam, named",
          detail:
            "A'isha said: 'A man called Labid bin al-A'sam from the tribe of Bani Zaraiq worked magic on Allah's Messenger (peace be upon him) till Allah's Messenger (peace be upon him) started imagining that he had done a thing that he had not really done.' In answer to his long supplication, two men came to him in a dream and named the sorcerer, the material he had used — a comb, the hairs stuck to it, and the skin of pollen of a male date-palm — and its hiding place in the well of Dharwan.",
          note: "Bukhari 76:77",
        },
        {
          title: "He turned to Allah, not to counter-magic",
          detail:
            "When the well was found, the Prophet (peace be upon him) did not answer sorcery with sorcery. He said, 'Since Allah cured me, I disliked to let evil spread among the people,' and ordered the well filled with earth. His cure was du'a and Allah's response — the very means available to every believer: the two protecting surahs, ruqyah, and reliance on Allah.",
        },
      ],
    },
  },
  {
    id: "seven-destructive-sins",
    name: "A Destructive Sin",
    content: {
      intro:
        "Sorcery is not a gray area. The Prophet (peace be upon him) placed it second only to shirk in his list of the sins that destroy a person.",
      points: [
        {
          title: "Among the seven destructive sins",
          detail:
            "The Prophet (peace be upon him) said: 'Avoid the seven great destructive sins.' The people asked: 'O Allah's Messenger! What are they?' He said: 'To join others in worship along with Allah, to practice sorcery, to kill the life which Allah has forbidden except for a just cause, to eat up riba (usury), to eat up an orphan's wealth, to flee from the battlefield at the time of fighting, and to accuse chaste women, who never even think of anything touching chastity and are good believers.'",
          note: "Bukhari 55:29; Bukhari 86:79",
        },
        {
          title: "Knots and blowing are magic",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever ties a knot and blows on it, he has practiced magic; and whoever practices magic, he has committed shirk; and whoever hangs up something (as an amulet) will be entrusted to it.' The classic form of sorcery — blowing on knots — is the very image the Quran uses in Surah al-Falaq.",
          note: "Nasai 37:114",
        },
        {
          title: "Why it is so severe",
          detail:
            "Sorcery combines the worst of both worlds: devotion to devils instead of Allah (a corruption of the sorcerer's own soul) and deliberate harm to other people — separating spouses, ruining health and livelihoods. It attacks both tawhid and the creation.",
          note: "Quran 2:102",
        },
      ],
    },
  },
  {
    id: "fortune-tellers",
    name: "Fortune-Tellers & Sorcerers",
    content: {
      intro:
        "The cure for sihr is sought through the Quran and supplication — never through sorcerers, fortune-tellers, or 'spiritual healers' who use the same dark means. Fighting magic with magic trades one harm for a worse one.",
      points: [
        {
          title: "Forty nights of prayer not accepted",
          detail:
            "The Prophet (peace be upon him) said: 'He who visits a diviner (arraf) and asks him about anything, his prayers extending to forty nights will not be accepted.' Merely going and asking carries this penalty — because it entrusts to a creature what belongs to Allah alone: knowledge of the unseen.",
          note: "Muslim 39:173",
        },
        {
          title: "Never fight sihr with sihr",
          detail:
            "Ibn Mas'ud reported the Prophet (peace be upon him) saying: 'Spells, charms and love-potions are polytheism.' Seeking to undo magic through another sorcerer means seeking help from the devils — the very source of the harm. The prescribed cure is ruqyah with the Quran and the authentic supplications.",
          note: "Abu Dawud 29:29",
        },
        {
          title: "Where to turn instead",
          detail:
            "Recite al-Fatiha, Ayat al-Kursi, and the three Quls over yourself; keep the morning and evening adhkar; and if needed, ask a person known for sound belief and righteousness to recite over you. The Ruqyah tab of this page walks through each step.",
        },
      ],
    },
  },
  {
    id: "signs-vs-superstition",
    name: "Signs vs. Superstition",
    content: {
      intro:
        "Islam affirms that sihr exists — and just as firmly rejects superstition. Most hardship has ordinary causes, and reading magic into every difficulty is itself a door the Shaytan loves to open.",
      points: [
        {
          title: "Do not read sihr into every hardship",
          detail:
            "Illness, anxiety, sleeplessness, and marital conflict usually have ordinary medical, psychological, or social causes. Seek qualified medical and professional help first — doing so is part of taking the means Allah has prescribed, not a weakness of faith. Ruqyah and medicine are companions, not rivals.",
        },
        {
          title: "Omens are not from Islam",
          detail:
            "The Prophet (peace be upon him) said: 'There is no adwa (no contagious disease is conveyed without Allah's permission), nor is there any bad omen (from birds), nor is there any hamah, nor is there any bad omen in the month of Safar.' Islam cut the roots of the pre-Islamic superstitions that made people slaves to signs and dread.",
          note: "Bukhari 76:27",
        },
        {
          title: "Do not accuse people",
          detail:
            "Suspecting a named person of sihr or envy without proof is a serious accusation against their faith and honor. Scholars advise treating the affliction with ruqyah and leaving the matter of blame to Allah — a believer thinks well of others (husn adh-dhann) even while guarding himself.",
        },
        {
          title: "A balanced heart",
          detail:
            "The person who keeps the daily adhkar, prays on time, and recites the Quran regularly has done what the Prophet (peace be upon him) prescribed. After that, fear of sihr should have no grip on the heart: nothing occurs except by Allah's permission, and He is sufficient for those who rely on Him.",
        },
      ],
    },
  },
  {
    id: "if-you-suspect",
    name: "If You Suspect Affliction",
    content: {
      intro:
        "A genuinely worried reader needs more than doctrine — an ordered, calm walkthrough of what to actually do. The steps below reflect standard scholarly guidance; keep them in order and do not skip the first.",
      points: [
        {
          title: "1. See a doctor first",
          detail:
            "Most symptoms blamed on sihr or the eye — exhaustion, anxiety, insomnia, marital strain — have ordinary medical or psychological causes. Seeking qualified help is part of taking the means Allah prescribed, not a lapse of faith. Medicine and ruqyah are companions, not rivals.",
        },
        {
          title: "2. Keep the daily fortress",
          detail:
            "Hold firmly to the morning and evening adhkar, the three Quls, Ayat al-Kursi, and praying on time. These are the everyday shield the Prophet (peace be upon him) never left — see the Daily Protection tab of this page.",
        },
        {
          title: "3. Perform self-ruqyah",
          detail:
            "You need no one's permission or presence: recite al-Fatiha, Ayat al-Kursi, and the three Quls over yourself, blowing gently, and persist over days rather than expecting one session to suffice. The Ruqyah tab walks through each step.",
        },
        {
          title: "4. Do not accuse anyone",
          detail:
            "Suspecting a named person without proof is a grave charge against their faith and honor. Treat the affliction and leave blame to Allah — a believer keeps husn adh-dhann (thinking well of others) even while guarding himself.",
        },
        {
          title: "5. Never seek a cure through sorcery (nushrah)",
          detail:
            "Undoing magic through another sorcerer — 'nushrah' — means seeking help from the very devils that caused the harm. The Prophet (peace be upon him) said: 'Spells, charms and love-potions are polytheism' (Abu Dawud 29:29), and 'He who visits a diviner and asks him about anything, his prayers extending to forty nights will not be accepted' (Muslim 39:173). A cure sought through shirk is no cure.",
          note: "Muslim 39:173; Abu Dawud 29:29",
        },
        {
          title: "6. Involve a trustworthy raqi if needed",
          detail:
            "If the adhkar and self-ruqyah are not enough, ask a person known for sound belief and righteousness to recite over you — openly, from the Quran and the authentic supplications. The Ruqyah tab lists what to look for and the red flags of a sorcerer in disguise.",
        },
      ],
    },
  },
];

const evilEyeTopics: Topic[] = [
  {
    id: "the-eye-is-real",
    name: "The Eye is Real",
    content: {
      intro:
        "The evil eye (al-ayn) is harm that Allah may cause through a look of envy or unchecked admiration. The Prophet (peace be upon him) affirmed it plainly — and, just as plainly, prescribed its prevention and cure.",
      points: [
        {
          title: "'The effect of an evil eye is a fact'",
          detail:
            "Abu Huraira narrated that the Prophet (peace be upon him) said: 'The effect of an evil eye is a fact.' The same affirmation is reported in Sahih Muslim: 'The influence of an evil eye is a fact.'",
          note: "Bukhari 76:55; Muslim 39:55",
        },
        {
          title: "If anything could outpace the decree",
          detail:
            "Ibn Abbas reported that the Prophet (peace be upon him) said: 'The influence of an evil eye is a fact; if anything would precede the destiny it would be the influence of an evil eye.' This is emphasis on how real its effect is — while affirming that nothing actually escapes Allah's decree.",
          note: "Muslim 39:56",
        },
        {
          title: "From humans and jinn",
          detail:
            "Surah an-Nas concludes by seeking refuge from harm 'from among jinn and mankind.' The two protecting surahs were revealed precisely for this: the Prophet (peace be upon him) called them verses 'the like of which has never been seen.'",
          note: "Quran 114:6; Muslim 6:319",
        },
      ],
    },
  },
  {
    id: "when-admiring",
    name: "When You Admire",
    content: {
      intro:
        "The eye usually strikes through admiration that is not tied back to Allah. The Quranic remedy is to attribute every blessing to His will the moment you notice it — in yourself or in others.",
      verse: {
        arabic: "وَلَوْلَآ إِذْ دَخَلْتَ جَنَّتَكَ قُلْتَ مَا شَآءَ ٱللَّهُ لَا قُوَّةَ إِلَّا بِٱللَّهِ",
        text: "If only you had said, when you entered your garden, ‘This is by Allah’s Will; there is no power except with Allah.’",
        ref: "Quran 18:39",
      },
      points: [
        {
          title: "Say ma sha' Allah",
          detail:
            "In Surah al-Kahf, the believer counsels the owner of the two gardens to say 'ma sha' Allah, la quwwata illa billah' (This is by Allah's will; there is no power except with Allah) upon seeing his blessing. Saying it turns admiration into remembrance — the blessing is credited to the Giver, not the given. It was also part of the Prophet's own speech: he would say 'Ma sha' Allah' upon hearing good.",
          note: "Quran 18:39; Bukhari 23:138",
        },
        {
          title: "Invoke blessing on what you admire",
          detail:
            "When something in another person amazes you, the Sunnah is to pray for blessing for them — saying, for example, 'barakallahu fik' (may Allah bless you in it). When Amir bin Rabi'ah admired Sahl bin Hunayf's skin and Sahl collapsed, the Prophet (peace be upon him) said: 'Why would anyone of you kill his brother? If he sees something that he likes, then let him pray for blessing for him.'",
          note: "Ibn Majah 31:74",
        },
        {
          title: "Guard your own eye",
          detail:
            "Prevention is not only for the one admired. A believer trains himself to look at others' blessings with du'a rather than longing — contentment with what Allah has allotted is the surest protection against becoming a source of harm oneself.",
          note: "Quran 113:5",
        },
      ],
    },
  },
  {
    id: "remedy",
    name: "The Remedy",
    content: {
      intro:
        "When the evil eye is feared or has struck, the Prophet (peace be upon him) prescribed two remedies: ruqyah (recitation over the afflicted) and washing.",
      points: [
        {
          title: "Ruqyah is the treatment",
          detail:
            "A'isha said: 'The Prophet (peace be upon him) ordered me or somebody else to do ruqya (if there was danger) from an evil eye.' And when he saw in Um Salama's house a girl whose face had a black spot, he said: 'She is under the effect of an evil eye; so treat her with a ruqya.'",
          note: "Bukhari 76:53; Bukhari 76:54",
        },
        {
          title: "Washing",
          detail:
            "The Prophet (peace be upon him) said: 'When you are asked to take a bath (as a cure) from the influence of an evil eye, you should take a bath.' In the incident of Sahl bin Hunayf, he had the one whose eye caused the harm perform ablution — washing his face, his arms up to the elbows, his knees, and inside his lower garment — and the water was then poured over the afflicted, by which Allah removes the harm.",
          note: "Muslim 39:56; Ibn Majah 31:74",
        },
        {
          title: "The two protectors",
          detail:
            "A'isha reported: 'Whenever Allah's Messenger (peace be upon him) became sick, he would recite the Mu'awwidhat (Surah al-Falaq and Surah an-Nas) and then blow his breath over his body.' These two surahs — seeking refuge from the envier and from every harm — are the heart of ruqyah against the eye.",
          note: "Bukhari 66:38",
        },
      ],
    },
  },
  {
    id: "envy-hasad",
    name: "Envy (Hasad)",
    content: {
      intro:
        "Behind the evil eye stands envy — resenting a blessing in someone else's hand. The final verse of Surah al-Falaq names it as the last of the harms we seek refuge from, and the Prophet (peace be upon him) warned against letting it live in the heart.",
      verse: {
        arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        text: "and from the harm of the envier when he envies.",
        ref: "Quran 113:5",
      },
      points: [
        {
          title: "Envy devours good deeds",
          detail:
            "The Prophet (peace be upon him) said: 'Avoid envy, for envy devours good deeds just as fire devours fuel.' The envier harms himself first — his worship is eaten away while the blessing he resents remains where Allah placed it.",
          note: "Abu Dawud 43:131",
        },
        {
          title: "The refuge is with Allah",
          detail:
            "Notice that the Quran's answer to the envier is not confrontation but seeking refuge: 'Say, I seek refuge with the Lord of the daybreak… from the harm of the envier when he envies.' The believer's shield is turning to Allah, not anxiety about people.",
          note: "Quran 113:1-5",
        },
        {
          title: "Emptying the heart of hasad",
          detail:
            "The practical cure scholars prescribe for envy in one's own heart: make du'a for the person you envy, congratulate them sincerely, and remember that Allah's giving follows His wisdom. What He allotted you was never diminished by what He gave another.",
        },
      ],
    },
  },
  {
    id: "protecting-children",
    name: "Protecting Children",
    content: {
      intro:
        "Parents — especially of a new baby — are the audience most anxious about the evil eye. The Prophet's own practice with his grandsons is the template: seek Allah's refuge over them, recite the Quls at bedtime, and keep them in at dusk. Prevention here is gentle and daily, not fearful.",
      verse: {
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لاَمَّةٍ",
        text: "I seek Refuge with Your Perfect Words from every devil and from poisonous pests and from every evil, harmful, envious eye.",
        ref: "Bukhari 60:45",
      },
      points: [
        {
          title: "The Prophet's du'a for Hasan and Husayn",
          detail:
            "Ibn Abbas said: 'The Prophet (peace be upon him) used to seek Refuge with Allah for Al-Hasan and Al-Husain and say: \"Your forefather (i.e. Abraham) used to seek Refuge with Allah for Ishmael and Isaac by reciting the following: A'udhu bi-kalimatillah at-tammah min kulli shaytanin wa hammah, wa min kulli 'aynin lammah — I seek Refuge with Your Perfect Words from every devil and from poisonous pests and from every evil, harmful, envious eye.\"' Say it over each child, morning and evening.",
          note: "Bukhari 60:45",
        },
        {
          title: "The three Quls at bedtime",
          detail:
            "Recite Surah al-Ikhlas, al-Falaq and an-Nas, blow into your cupped hands, and wipe them gently over the child — the very routine the Prophet (peace be upon him) kept over himself every night. It turns bedtime into a moment of protection the child grows up loving.",
          note: "Bukhari 66:39",
        },
        {
          title: "Keep them in at dusk",
          detail:
            "The Prophet (peace be upon him) said: 'When night falls, then keep your children close to you, for the devils spread out then. An hour later you can let them free.' A simple habit for the first stretch of nightfall — see 'When Night Falls' in the Daily Protection tab.",
          note: "Bukhari 59:89",
        },
        {
          title: "Say ma sha' Allah when you admire them",
          detail:
            "When a child's beauty, health, or cleverness amazes you — or amazes a guest — tie it back to Allah with 'ma sha' Allah, tabarakallah' and a prayer for blessing. This is the Sunnah guard against the admiring glance becoming a harmful one (see 'When You Admire').",
        },
      ],
    },
  },
];

const ruqyahTopics: Topic[] = [
  {
    id: "conditions",
    name: "When Ruqyah is Permissible",
    content: {
      intro:
        "Ruqyah is recitation over oneself or another, seeking healing and protection from Allah. The Prophet (peace be upon him) practiced it, approved it, and set its boundary: it must be free of every trace of shirk.",
      points: [
        {
          title: "The Prophet's approval",
          detail:
            "Awf ibn Malik said: 'We practiced incantation in the pre-Islamic days and we said: Allah's Messenger, what is your opinion about it? He said: Let me know your incantation. And he said: There is no harm in the incantation which does not smack of polytheism.'",
          note: "Muslim 39:86; Abu Dawud 29:32",
        },
        {
          title: "The three classical conditions",
          detail:
            "Scholars state that permissible ruqyah must meet three conditions: (1) it uses the words of Allah — Quran, His names and attributes — or authentic supplications; (2) it is in Arabic or in speech whose meaning is understood; and (3) both reciter and patient believe the ruqyah has no effect of itself — Allah alone cures, and the recitation is only a means.",
        },
        {
          title: "What is never permissible",
          detail:
            "Amulets and talismans, unintelligible chants and symbols, and invoking anyone besides Allah — jinn, 'spirits', or saints — are all excluded. The Prophet (peace be upon him) said: 'Whoever ties a knot and blows on it, he has practiced magic; and whoever practices magic, he has committed shirk.'",
          note: "Nasai 37:114",
        },
      ],
    },
  },
  {
    id: "al-fatiha",
    name: "Al-Fatiha — the Ruqyah",
    content: {
      intro:
        "The opening surah of the Quran is the greatest surah — and the companions used it as a ruqyah with the Prophet's (peace be upon him) explicit approval.",
      points: [
        {
          title: "The scorpion sting",
          detail:
            "A group of companions were refused hospitality by a tribe, whose chief was then stung by a scorpion. The tribe asked if anyone could treat him, and one companion recited over him — and the man was cured. When they asked the reciter what he had used, he said: 'I treated him only with the recitation of the Mother of the Book (al-Fatiha).' The Prophet (peace be upon him) said: 'How did he come to know that it (al-Fatiha) could be used for treatment?'",
          note: "Bukhari 66:29; Bukhari 76:52",
        },
        {
          title: "The greatest surah",
          detail:
            "The Prophet (peace be upon him) said: 'Shall I not teach you the most superior surah in the Quran?' — '(It is) Praise be to Allah, the Lord of the worlds (Surah al-Fatiha), which consists of the seven repeatedly-recited verses.'",
          note: "Bukhari 66:28",
        },
        {
          title: "Payment for ruqyah is permitted",
          detail:
            "The companions had recited for a flock of sheep as their fee, then hesitated over it. The Prophet (peace be upon him) said: 'You are most entitled to take wages for doing a ruqya with Allah's Book' — establishing that a legitimate raqi may accept payment.",
          note: "Bukhari 76:52",
        },
      ],
    },
  },
  {
    id: "self-ruqyah",
    name: "Self-Ruqyah, Step by Step",
    content: {
      intro:
        "You do not need anyone's permission — or presence — to perform ruqyah on yourself. This is exactly what the Prophet (peace be upon him) did every night and whenever he was ill. Recite with presence of heart, certain that Allah alone cures.",
      verse: {
        arabic:
          "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
        text: "Allah: none has the right to be worshiped except Him, the Ever-Living, All-Sustaining. Neither drowsiness overtakes Him nor sleep. To Him belongs all that is in the heavens and all that is on earth. Who is there that can intercede with Him except with His permission? He knows what was before them and what will be after them, while they encompass nothing of His knowledge, except what He wills. His Kursī [i.e., footstool] extends over the heavens and earth, and safeguarding of both does not weary Him, for He is the Most High, the Most Great.",
        ref: "Quran 2:255",
      },
      points: [
        {
          title: "1. Turn to Allah first",
          detail:
            "Begin with the certainty that the recitation is only a means — the cure is from Allah alone. This conviction is itself a condition of ruqyah. It helps to be in a state of wudu and to face the recitation with an attentive heart rather than rushing through words.",
        },
        {
          title: "2. Recite Surah al-Fatiha",
          detail:
            "Recite the Mother of the Book over yourself (or over the afflicted person), blowing gently as the companion did for the man stung by a scorpion. Repeat it — the companions recited it multiple times.",
          note: "Bukhari 66:29; Bukhari 76:52",
        },
        {
          title: "3. Recite Ayat al-Kursi (2:255)",
          detail:
            "The verse above. The Prophet (peace be upon him) confirmed (through the words of the disguised Shaytan, which he verified as true): 'When you go to your bed, recite Ayat al-Kursi, for then there will be a guard from Allah who will protect you all night long, and Satan will not be able to come near you till dawn.'",
          note: "Bukhari 66:32",
        },
        {
          title: "4. Recite the three Quls into your hands",
          detail:
            "A'isha narrated: 'Whenever the Prophet (peace be upon him) went to bed every night, he used to cup his hands together and blow over them after reciting Surah al-Ikhlas, Surah al-Falaq and Surah an-Nas, and then rub his hands over whatever parts of his body he was able to rub, starting with his head, face and front of his body. He used to do that three times.'",
          note: "Bukhari 66:39; Bukhari 76:63",
        },
        {
          title: "5. For pain or illness, wipe and supplicate",
          detail:
            "The Prophet (peace be upon him) used to treat his family by passing his right hand over the place of ailment, saying: 'Adhhib al-ba's, Rabb an-nas — O Allah, the Lord of the people! Remove the trouble and heal the patient, for You are the Healer. No healing is of any avail but Yours; healing that will leave behind no ailment.'",
          note: "Bukhari 76:58; Bukhari 75:35",
        },
        {
          title: "6. When sick, persist",
          detail:
            "A'isha said: 'Whenever Allah's Messenger (peace be upon him) became sick, he would recite the Mu'awwidhat (Surah al-Falaq and Surah an-Nas) and then blow his breath over his body. When he became seriously ill, I used to recite (these two surahs) and rub his hands over his body hoping for its blessings.' Ruqyah is repeated, not a one-time formula.",
          note: "Bukhari 66:38",
        },
      ],
    },
  },
  {
    id: "trustworthy-raqi",
    name: "Seeking a Raqi",
    content: {
      intro:
        "There is nothing wrong with asking a righteous person to recite over you — the Prophet (peace be upon him) told A'isha to seek ruqyah, and the companions performed it for strangers. But choose carefully: many who advertise 'spiritual healing' are sorcerers in disguise.",
      points: [
        {
          title: "What to look for",
          detail:
            "A trustworthy raqi is known for sound belief and righteous practice, recites openly from the Quran and the authentic supplications in words you can hear and understand, and directs your heart to Allah — never to himself, to objects, or to secrets.",
        },
        {
          title: "Red flags",
          detail:
            "Scholars warn against anyone who asks for your mother's name or personal effects for 'diagnosis', writes talismans or unintelligible symbols, prescribes strange or impure substances, demands an animal be slaughtered for other than Allah, claims knowledge of the unseen, or insists on being alone with women. These are the marks of a sorcerer, whatever he calls himself.",
        },
        {
          title: "The forty-nights warning applies",
          detail:
            "Going to such a person falls under the Prophet's (peace be upon him) warning: 'He who visits a diviner (arraf) and asks him about anything, his prayers extending to forty nights will not be accepted.' A cure sought through shirk is no cure.",
          note: "Muslim 39:173",
        },
      ],
    },
  },
];

const dailyTopics: Topic[] = [
  {
    id: "morning-evening",
    name: "Morning & Evening",
    content: {
      intro:
        "The morning and evening adhkar are the believer's daily fortress — a few minutes after Fajr and before Maghrib that the Prophet (peace be upon him) never left.",
      points: [
        {
          title: "The three Quls, three times",
          detail:
            "The Prophet (peace be upon him) said to Abdullah ibn Khubayb: 'Say: \"Say, He is Allah, One\" (al-Ikhlas) and al-Mu'awwidhatan (al-Falaq and an-Nas) three times in the morning and evening; they will serve you for every purpose.'",
          note: "Abu Dawud 43:310",
        },
        {
          title: "Nothing can harm with His name",
          detail:
            "The Prophet (peace be upon him) said: 'If anyone says three times: \"In the name of Allah, when Whose name is mentioned nothing on Earth or in Heaven can cause harm, and He is the Hearer, the Knower\" — he will not suffer sudden affliction till the morning, and if anyone says this in the morning, he will not suffer sudden affliction till the evening.'",
          note: "Abu Dawud 43:316",
        },
        {
          title: "Build it into your day",
          detail:
            "The full morning and evening routine — with these and the other authentic adhkar — is laid out step by step in the daily worship guide on this app.",
        },
      ],
    },
  },
  {
    id: "ayat-al-kursi",
    name: "Ayat al-Kursi",
    content: {
      intro:
        "One verse — Quran 2:255 — carries a protection the Prophet (peace be upon him) himself confirmed, in one of the most striking stories in Sahih al-Bukhari.",
      points: [
        {
          title: "The night visitor",
          detail:
            "Abu Huraira was set to guard the zakat of Ramadan when a needy 'man' kept stealing from it night after night. On the third night, the caught thief bargained: 'When you go to your bed, recite Ayat al-Kursi, for then there will be a guard from Allah who will protect you all night long, and Satan will not be able to come near you till dawn.' The Prophet (peace be upon him) said: 'He told you the truth although he is a liar; and it was Satan.'",
          note: "Bukhari 66:32",
        },
        {
          title: "Before sleep, every night",
          detail:
            "This is the verse's confirmed nightly protection: recite it when you go to your bed and a guard from Allah remains over you until dawn. Pair it with the three Quls blown into the hands, as the Prophet (peace be upon him) did.",
          note: "Bukhari 66:32; Bukhari 66:39",
        },
        {
          title: "After each prayer",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death.' Many Muslims keep it as a fixed habit at the end of each salah alongside the tasbih.",
          note: "Nasai, al-Sunan al-Kubra 9928 — graded sahih by Ibn Hibban and al-Albani (as-Sahihah 972)",
        },
      ],
    },
  },
  {
    id: "quran-in-home",
    name: "The Quran in Your Home",
    content: {
      intro:
        "Two of the best-loved protection practices in the Sunnah concern the home itself: the surah that drives the Shaytan out of the house, and the two verses that suffice the believer at night.",
      points: [
        {
          title: "Al-Baqarah empties the house of Shaytan",
          detail:
            "The Prophet (peace be upon him) said: 'Do not make your houses as graveyards. Satan runs away from the house in which Surah Baqara is recited.' A home in which the Quran is recited — even a regular portion — is a home the Shaytan flees; a home with no recitation and no dhikr is likened to a grave.",
          note: "Muslim 6:252",
        },
        {
          title: "The last two verses at night",
          detail:
            "The Prophet (peace be upon him) said: 'It is sufficient for one to recite the last two Verses of Surat-al-Baqara at night,' and in another wording, 'that will be sufficient for him.' These verses — Amana-r-rasulu (2:285-286) — are a nightly protection that takes under a minute.",
          note: "Bukhari 64:59; Bukhari 66:31",
        },
        {
          title: "Keep recitation alive in it",
          detail:
            "You need not recite all of al-Baqarah at once — keep the Quran a living sound in your home through daily portions, memorization, and teaching the children. The full daily routine is on the worship guide linked below.",
        },
      ],
    },
  },
  {
    id: "when-night-falls",
    name: "When Night Falls",
    content: {
      intro:
        "A vivid, immediately practical household sunnah: as dusk settles, the Prophet (peace be upon him) taught a few simple acts that shut the Shaytan out of the home for the night — acts a parent can begin the very evening they read them.",
      points: [
        {
          title: "Keep your children close at dusk",
          detail:
            "The Prophet (peace be upon him) said: 'When night falls, then keep your children close to you, for the devils spread out then. An hour later you can let them free; and close the gates of your house, and mention Allah's Name thereupon, and cover your utensils, and mention Allah's Name thereupon.'",
          note: "Bukhari 59:89; Bukhari 59:112",
        },
        {
          title: "Shut the doors, cover the vessels, put out the lamps",
          detail:
            "The Prophet (peace be upon him) said: 'Cover vessels, waterskins, close the doors and extinguish the lamps, for the Satan does not loosen the waterskin, does not open the door and does not uncover the vessels. And if one amongst you fails to find (something) to cover it well, he should cover it by placing (a piece of) wood across it.'",
          note: "Muslim 36:120",
        },
        {
          title: "The thread through all of it is Allah's name",
          detail:
            "Each act is paired with bismillah: a door closed in Allah's name stays shut against the Shaytan. As the Prophet (peace be upon him) said, 'Close the doors and mention the Name of Allah, for Satan does not open a closed door.'",
          note: "Bukhari 59:112",
        },
      ],
    },
  },
  {
    id: "home-and-out",
    name: "Home & Going Out",
    content: {
      intro:
        "Protection in Islam is woven into ordinary moments — entering the home, sitting to eat, stepping out of the door. Each has a sentence of remembrance that shuts the Shaytan out.",
      points: [
        {
          title: "Entering the home and eating",
          detail:
            "The Prophet (peace be upon him) said: 'When a person enters his house and mentions the name of Allah at the time of entering it and while eating the food, Satan says (addressing himself): You have no place to spend the night and no evening meal; but when he enters without mentioning the name of Allah, the Satan says: You have found a place to spend the night.'",
          note: "Muslim 36:136",
        },
        {
          title: "Leaving the home",
          detail:
            "The Prophet (peace be upon him) said: 'When a man goes out of his house and says: \"In the name of Allah, I trust in Allah; there is no might and no power but in Allah\" (Bismillah, tawakkaltu ala Allah, la hawla wa la quwwata illa billah) — it will be said to him: You are guided, defended and protected. The devils will go far from him.'",
          note: "Abu Dawud 43:323; Tirmidhi 48:57",
        },
        {
          title: "Setting out on a journey",
          detail:
            "When mounting a ride — a car, plane, or anything that carries you — the Sunnah is the du'a of travel: سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ — 'Subhanal-ladhi sakh-khara lana hadha wa ma kunna lahu muqrineen, wa inna ila Rabbina la munqalibun' — 'Glory to Him who has subjected this to us, and we could never have it by our efforts. And to our Lord we will surely return.' The words are the Quran's own (43:13-14), and the Prophet (peace be upon him) said them whenever he mounted his camel setting out on a journey. The full set of travel du'as — returning home and bidding farewell included — is linked below.",
          note: "Quran 43:13-14; Muslim 15:479",
        },
        {
          title: "Small words, constant shield",
          detail:
            "None of these takes more than a few seconds. Together they mean a believer's day is bracketed by Allah's name at every threshold — food, home, road, and bed. Protection in Islam is not an emergency measure; it is a lifestyle of remembrance.",
        },
      ],
    },
  },
];

const waswasTopics: Topic[] = [
  {
    id: "whispers-about-faith",
    name: "Whispers About Faith",
    content: {
      intro:
        "One of the Shaytan's sharpest attacks is the whisper aimed at faith itself — sudden, unwanted thoughts that question Allah, the religion, or one's own belief. These thoughts distress the believer precisely because he loves his faith. The Prophet (peace be upon him) did not tell us to fear them or to untangle them by argument; he gave a short, decisive response: recognize where the whisper comes from, seek refuge in Allah, affirm your belief, and turn away.",
      points: [
        {
          title: "'Who created your Lord?'",
          detail:
            "Abu Huraira narrated that the Prophet (peace be upon him) said: 'Satan comes to one of you and says, \"Who created so-and-so?\" till he says, \"Who has created your Lord?\" So, when he inspires such a question, one should seek refuge with Allah and give up such thoughts.' The whisper is not your belief — it is an attack on it, and the answer is not to debate but to seek refuge and stop.",
          note: "Bukhari 59:85",
        },
        {
          title: "Affirm your faith and move on",
          detail:
            "In Sahih Muslim the same guidance is given: 'Men will continue to question one another till this is propounded: Allah created all things but who created Allah? He who found himself confronted with such a situation should say: I affirm my faith in Allah.' A firm word of belief — 'I believe in Allah' — and then disengaging is the prophetic cure, not chasing the thought in circles.",
          note: "Muslim 1:250",
        },
        {
          title: "The thought is not held against you",
          detail:
            "The Prophet (peace be upon him) said: 'Allah has forgiven my followers the evil thoughts that occur to their minds, as long as such thoughts are not put into action or uttered.' An intrusive thought that arrives uninvited and unwanted is not a sin — you answer for what you choose and do, not for what the Shaytan throws at you.",
          note: "Bukhari 68:19",
        },
      ],
    },
  },
  {
    id: "sign-of-faith",
    name: "A Sign of Faith",
    content: {
      intro:
        "The most reassuring truth for anyone plagued by these whispers: experiencing them is not hypocrisy or weak faith. The Prophet (peace be upon him) told his own Companions — who were terrified by such thoughts — that the very distress they felt was evidence of a believing heart.",
      points: [
        {
          title: "'That is the faith manifest'",
          detail:
            "Abu Huraira reported that some of the Companions came to the Prophet (peace be upon him) and said: 'Verily we perceive in our minds that which every one of us considers it too grave to express.' He said: 'Do you really perceive it?' They said: 'Yes.' Upon this he remarked: 'That is the faith manifest.' The horror you feel at the thought is itself proof that faith, not the whisper, owns your heart.",
          note: "Muslim 1:247",
        },
        {
          title: "'It is pure faith'",
          detail:
            "Ibn Mas'ud reported that the Prophet (peace be upon him) 'was asked about evil prompting, to which he replied: It is pure faith.' The Shaytan does not waste effort whispering doubt into a heart already empty of faith — he attacks the believer precisely because there is something there to attack.",
          note: "Muslim 1:249",
        },
        {
          title: "When it feels relentless",
          detail:
            "Scholars of the heart note that anxiety over these whispers — sometimes so intense it resembles obsessive doubt (waswas qahri) — is a trial, not a verdict. The believer troubled by the thought has already rejected it. When it becomes persistent and distressing, seeking professional help alongside the adhkar is taking the means, not a failure of faith.",
        },
      ],
    },
  },
  {
    id: "whispers-in-prayer",
    name: "Whispers in Prayer",
    content: {
      intro:
        "The Shaytan works hardest to steal the believer's focus in salah and recitation. When a Companion complained of exactly this, the Prophet (peace be upon him) named the culprit and gave a simple, one-time remedy — not a ritual to repeat obsessively.",
      points: [
        {
          title: "The devil named Khinzab",
          detail:
            "Uthman b. Abu al-'As came to the Prophet (peace be upon him) and said: 'Allah's Messenger, the Satan intervenes between me and my prayer and my reciting of the Qur'an and he confounds me.' The Prophet (peace be upon him) said: 'That is (the doing of a) Satan (devil) who is known as Khinzab, and when you perceive its effect, seek refuge with Allah from it and spit three times to your left.' Uthman said: 'I did that and Allah dispelled that from me.'",
          note: "Muslim 39:92",
        },
        {
          title: "The response: refuge and a light spit",
          detail:
            "When distraction floods the prayer, seek refuge in Allah and give a light dry spit (nafth, without saliva) three times to your left, then simply return to your salah. It is done once and left — treating it as a compulsion to repeat perfectly only feeds the very whisper it was meant to dispel.",
        },
        {
          title: "The adhan already routs him",
          detail:
            "The Prophet (peace be upon him) said: 'When the Adhan is pronounced Satan takes to his heels and passes wind with noise during his flight in order not to hear the Adhan… till he whispers into the heart of the person… and makes him remember things which he does not recall to his mind before the prayer.' The call to prayer itself drives the Shaytan off; he returns only to whisper — a daily contest the believer is fully equipped to win.",
          note: "Bukhari 10:6; Bukhari 21:26",
        },
      ],
    },
  },
  {
    id: "seeking-refuge",
    name: "Seeking Refuge Daily",
    content: {
      intro:
        "Isti'adha — seeking refuge in Allah — is the believer's standing guard against the whisperer. Allah Himself commands it before recitation, and the Prophet (peace be upon him) reached for it at the moments the Shaytan presses hardest.",
      verse: {
        arabic: "فَإِذَا قَرَأْتَ ٱلْقُرْءَانَ فَٱسْتَعِذْ بِٱللَّهِ مِنَ ٱلشَّيْطَـٰنِ ٱلرَّجِيمِ",
        text: "When you recite the Qur’an, seek refuge with Allah from the accursed Satan.",
        ref: "Quran 16:98",
      },
      points: [
        {
          title: "Before reciting the Quran",
          detail:
            "Allah commands: 'When you recite the Qur'an, seek refuge with Allah from the accursed Satan.' Beginning with 'A'udhu billahi min ash-shaytan ir-rajim' sets a guard over the recitation before the whisper can enter it.",
          note: "Quran 16:98",
        },
        {
          title: "When anger rises",
          detail:
            "Two men abused each other before the Prophet (peace be upon him) and the face of one reddened with rage. The Prophet (peace be upon him) said: 'I know a word, the saying of which will cause him to relax… If he says: \"I seek Refuge with Allah from Satan,\" then all his anger will go away.' Anger is a doorway the Shaytan uses; the isti'adha shuts it.",
          note: "Bukhari 59:91",
        },
        {
          title: "A habit, not an emergency",
          detail:
            "Seeking refuge belongs to the whole day — entering the bathroom, at moments of fear, before sleep, when a bad thought comes. Turn the isti'adha into a reflex. The Daily Protection tab and the protection du'as page collect the fixed adhkar that keep this guard in place.",
        },
      ],
    },
  },
  {
    id: "dreams-and-nightmares",
    name: "Dreams & Nightmares",
    content: {
      intro:
        "Frightening dreams are a common trigger for anxiety — and, historically, for turning to fortune-tellers, which this page warns against. The Prophet (peace be upon him) gave a complete, calming etiquette: a good dream is from Allah, a bad one is the Shaytan's idle play, and it can do you no harm once you follow the simple response.",
      points: [
        {
          title: "Good is from Allah, bad is from the Shaytan",
          detail:
            "The Prophet (peace be upon him) said: 'A good vision is from Allah and a bad dream (hulm) is from the satan; so if one of you sees anything (in a dream) which he dislikes, he should spit on his left side thrice and seek refuge with Allah from its evil, and then it will never harm him.' A distressing dream is not a message or an omen — it is the Shaytan trying to grieve you.",
          note: "Muslim 42:4",
        },
        {
          title: "The response, step by step",
          detail:
            "Jabir reported that the Prophet (peace be upon him) said: 'If anyone sees a dream which he does not like, he should spit on his left side three times, and seek refuge with Allah from the Satan three times, and let him turn over from the side on which he was sleeping.' Spit lightly (dry) to the left, say the isti'adha, and change the side you were lying on.",
          note: "Muslim 42:8",
        },
        {
          title: "Tell no one about it",
          detail:
            "The Prophet (peace be upon him) said one 'should not disclose it to anyone,' whereas a good vision may be shared only 'to anyone but whom one loves.' Not retelling a bad dream is part of stripping it of its power — 'it will not do one any harm.'",
          note: "Muslim 42:6",
        },
      ],
    },
  },
];

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "sihr", label: "Sihr (Magic)" },
  { key: "evil-eye", label: "The Evil Eye" },
  { key: "waswas", label: "Waswas" },
  { key: "ruqyah", label: "Ruqyah" },
  { key: "daily", label: "Daily Protection" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* ───────────────────────── sub-components ───────────────────────── */

function SurahCard({
  title,
  titleAr,
  verses,
  refText,
  delay = 0,
}: {
  title: string;
  titleAr: string;
  verses: { ar: string; en: string; ref: string }[];
  refText: string;
  delay?: number;
}) {
  return (
    <ContentCard delay={delay}>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xl font-semibold text-themed">{title}</h2>
        <span className="font-arabic text-gold text-lg">{titleAr}</span>
      </div>
      <div className="space-y-4">
        {verses.map((v) => (
          <div key={v.ref}>
            <p className="text-lg font-arabic text-gold leading-loose text-right mb-1">{v.ar}</p>
            <p className="text-themed-muted text-sm italic">{v.en}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-themed-muted mt-4">
        <HadithRefText text={refText} />
      </p>
    </ContentCard>
  );
}

/* ───────────────────────── page ───────────────────────── */

function ProtectionContent() {
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
  const [sihrSub, setSihrSub] = useState(() =>
    initialSub && sihrTopics.some((t) => t.id === initialSub) ? initialSub : sihrTopics[0].id
  );
  const [eyeSub, setEyeSub] = useState(() =>
    initialSub && evilEyeTopics.some((t) => t.id === initialSub) ? initialSub : evilEyeTopics[0].id
  );
  const [waswasSub, setWaswasSub] = useState(() =>
    initialSub && waswasTopics.some((t) => t.id === initialSub) ? initialSub : waswasTopics[0].id
  );
  const [ruqyahSub, setRuqyahSub] = useState(() =>
    initialSub && ruqyahTopics.some((t) => t.id === initialSub) ? initialSub : ruqyahTopics[0].id
  );
  const [dailySub, setDailySub] = useState(() =>
    initialSub && dailyTopics.some((t) => t.id === initialSub) ? initialSub : dailyTopics[0].id
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
    fix(sihrTopics, sihrSub, setSihrSub);
    fix(evilEyeTopics, eyeSub, setEyeSub);
    fix(waswasTopics, waswasSub, setWaswasSub);
    fix(ruqyahTopics, ruqyahSub, setRuqyahSub);
    fix(dailyTopics, dailySub, setDailySub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sihrSub, eyeSub, waswasSub, ruqyahSub, dailySub]);

  // Active topic per rail — the Sources card below each rail lists ONLY the
  // currently selected topic's refs (house rule), never the whole tab's.
  const activeSihrTopic = sihrTopics.find((t) => t.id === sihrSub) ?? sihrTopics[0];
  const activeEyeTopic = evilEyeTopics.find((t) => t.id === eyeSub) ?? evilEyeTopics[0];
  const activeWaswasTopic = waswasTopics.find((t) => t.id === waswasSub) ?? waswasTopics[0];
  const activeRuqyahTopic = ruqyahTopics.find((t) => t.id === ruqyahSub) ?? ruqyahTopics[0];
  const activeDailyTopic = dailyTopics.find((t) => t.id === dailySub) ?? dailyTopics[0];

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
        title="Protection & Ruqyah"
        titleAr="الرقية والتحصين"
        subtitle="Sihr, the evil eye, and the prophetic means of protection — refuge is with Allah alone."
      />

      {/* Opening verse — above search + tabs, matching every other content page. */}
      <VerseHero
        arabic="قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ"
        text="Say, I seek refuge with the Lord of the daybreak…"
        reference="Quran 113:1"
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
              <h2 className="text-xl font-semibold text-themed mb-4">
                Protection comes from Allah alone
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  Islam affirms that unseen harms are real — sihr (magic) and the evil eye among
                  them — and in the same breath closes every door to fearing them more than Allah.
                  Nothing touches a person except by His permission, and refuge is sought from Him
                  alone. This page covers what the Quran and authentic Sunnah actually say about
                  sihr and the evil eye, how ruqyah (recitation for healing) is performed, and the
                  daily adhkar that fortify a believer.
                </p>
                <p>
                  The believer&apos;s posture is tawakkul: take the prescribed means — the
                  recitations, the supplications, the two protecting surahs — while the heart
                  relies on the One who protects, not on the means themselves. The words are a
                  key; the protection is His.
                </p>
                <p>
                  Allah revealed two entire surahs for this purpose. Uqbah ibn Amir reported that
                  the Prophet (peace be upon him) said:{" "}
                  <em>
                    &ldquo;What wonderful verses have been sent down today, the like of which has
                    never been seen! They are: Say: I seek refuge with the Lord of the dawn, and
                    Say: I seek refuge with the Lord of men.&rdquo;
                  </em>{" "}
                  (Muslim 6:319). Both are quoted in full below — they are short, memorized in a
                  day, and carried for a lifetime.
                </p>
              </div>
            </ContentCard>

            <SurahCard
              title="Surah al-Falaq — The Daybreak"
              titleAr="سُورَةُ الفَلَقِ"
              verses={falaqVerses}
              refText="Quran 113:1-5"
              delay={0.15}
            />

            <SurahCard
              title="Surah an-Nas — Mankind"
              titleAr="سُورَةُ النَّاسِ"
              verses={nasVerses}
              refText="Quran 114:1-6"
              delay={0.2}
            />

            <ContentCard delay={0.25}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                Amulets and talismans are shirk
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  Protection is never sought through objects — charms, strings, engraved pendants,
                  &ldquo;protective&rdquo; jewelry, or written talismans. The Prophet (peace be
                  upon him) said:{" "}
                  <em>
                    &ldquo;Whoever ties a knot and blows on it, he has practiced magic; and whoever
                    practices magic, he has committed shirk; and whoever hangs up something (as an
                    amulet) will be entrusted to it&rdquo;
                  </em>{" "}
                  (Nasai 37:114) — left to the object, and cut off from Allah&apos;s protection.
                </p>
                <p>
                  Ibn Mas&apos;ud likewise reported the Prophet (peace be upon him) saying:{" "}
                  <em>&ldquo;Spells, charms and love-potions are polytheism&rdquo;</em>{" "}
                  (Abu Dawud 29:29). Attaching the heart to an object is the opposite of the
                  refuge the two surahs teach — the whole point of al-Falaq and an-Nas is that
                  protection is asked from the Lord of the daybreak and the Lord of mankind,
                  directly, with no intermediary.
                </p>
              </div>
            </ContentCard>

            <SourcesCard
              delay={0.3}
              sources={[
                { ref: "Quran 113:1-5", desc: "Surah al-Falaq — refuge from every harm, sorcery, and envy" },
                { ref: "Quran 114:1-6", desc: "Surah an-Nas — refuge from the whisperer, jinn and mankind" },
                { ref: "Muslim 6:319", desc: "The revelation of the two protecting surahs" },
                { ref: "Nasai 37:114", desc: "Knots, magic, and hanging amulets" },
                { ref: "Abu Dawud 29:29", desc: "Spells, charms and love-potions are polytheism" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Sihr (Magic) ─── */}
        {activeTab === "sihr" && (
          <motion.div
            key="sihr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(sihrTopics, sihrSub, handleSubChange("sihr", setSihrSub))}

            {topicSourceRefs(activeSihrTopic).length > 0 && (
              <SourcesCard className="mt-8" sources={topicSourceRefs(activeSihrTopic)} />
            )}
          </motion.div>
        )}

        {/* ─── The Evil Eye ─── */}
        {activeTab === "evil-eye" && (
          <motion.div
            key="evil-eye"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(evilEyeTopics, eyeSub, handleSubChange("evil-eye", setEyeSub))}

            {topicSourceRefs(activeEyeTopic).length > 0 && (
              <SourcesCard className="mt-8" sources={topicSourceRefs(activeEyeTopic)} />
            )}
          </motion.div>
        )}

        {/* ─── Waswas & the Shaytan ─── */}
        {activeTab === "waswas" && (
          <motion.div
            key="waswas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(waswasTopics, waswasSub, handleSubChange("waswas", setWaswasSub))}

            {/* Companion pages — the whisper about faith is treated in depth here;
                the doubt-framing angles live on why-islam and articles-of-faith. */}
            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">Reassurance, not alarm</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Intrusive religious thoughts are among the most common trials a believer faces —
                and, as the Prophet (peace be upon him) taught, the distress they cause is itself a
                mark of faith. For the fixed adhkar that keep the whisperer at bay, and for the
                framing of doubt as a step toward certainty, see the pages below.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/duas?tab=protection"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Protection du&apos;as →
                </Link>
                <Link
                  href="/articles-of-faith"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Articles of faith →
                </Link>
                <Link
                  href="/why-islam"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Why Islam →
                </Link>
              </div>
            </ContentCard>

            {topicSourceRefs(activeWaswasTopic).length > 0 && (
              <SourcesCard className="mt-6" sources={topicSourceRefs(activeWaswasTopic)} />
            )}
          </motion.div>
        )}

        {/* ─── Ruqyah ─── */}
        {activeTab === "ruqyah" && (
          <motion.div
            key="ruqyah"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(ruqyahTopics, ruqyahSub, handleSubChange("ruqyah", setRuqyahSub))}

            {topicSourceRefs(activeRuqyahTopic).length > 0 && (
              <SourcesCard className="mt-8" sources={topicSourceRefs(activeRuqyahTopic)} />
            )}
          </motion.div>
        )}

        {/* ─── Daily Protection ─── */}
        {activeTab === "daily" && (
          <motion.div
            key="daily"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(dailyTopics, dailySub, handleSubChange("daily", setDailySub))}

            {/* Companion pages */}
            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">Keep the daily fortress</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                The full morning-to-night worship routine — and the complete collection of
                protection du&apos;as with Arabic, transliteration, and translation — live on
                their own pages.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/muslim-daily?tab=worship"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Morning &amp; evening adhkar →
                </Link>
                <Link
                  href="/duas?tab=protection"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Protection du&apos;as →
                </Link>
                <Link
                  href="/duas?tab=travel"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  All travel du&apos;as →
                </Link>
              </div>
            </ContentCard>

            {topicSourceRefs(activeDailyTopic).length > 0 && (
              <SourcesCard className="mt-6" sources={topicSourceRefs(activeDailyTopic)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProtectionPage() {
  return (
    <Suspense>
      <ProtectionContent />
    </Suspense>
  );
}
