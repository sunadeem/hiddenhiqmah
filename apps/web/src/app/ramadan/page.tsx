"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import { topicSourceRefs } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";

/* ───────────────────────── data ───────────────────────── */

const whyItMatters = [
  {
    point: "The gates of Paradise are opened",
    detail:
      "The Prophet (peace be upon him) said: 'When Ramadan begins, the gates of Paradise are opened, the gates of Hellfire are closed, and the devils are chained.'",
    reference: "Bukhari 30:8; Muslim 13:211",
  },
  {
    point: "Fasting is a shield from the Hellfire",
    detail:
      "The Prophet (peace be upon him) said: 'Fasting is a shield. When any one of you is fasting, let him not speak indecently or act ignorantly. If someone fights him or insults him, let him say: I am fasting.'",
    reference: "Bukhari 30:4; Muslim 13:211",
  },
  {
    point: "Previous sins are forgiven",
    detail:
      "The Prophet (peace be upon him) said: 'Whoever fasts Ramadan out of sincere faith and seeking reward, his previous sins will be forgiven.' He also said the same about standing in prayer during Ramadan and during Laylatul Qadr.",
    reference: "Bukhari 2:31; Muslim 6:209",
  },
  {
    point: "The Quran was revealed in this month",
    detail:
      "Allah chose Ramadan as the month in which He sent down the Quran — the final revelation and guidance for all of humanity. Jibreel would review the Quran with the Prophet every Ramadan.",
    reference: "Quran 2:185; Bukhari 1:6",
  },
  {
    point: "It contains a night better than a thousand months",
    detail:
      "Laylatul Qadr (the Night of Decree) falls within the last ten nights of Ramadan. Worship on this single night is better than worshipping for over 83 years. The angels descend with every decree.",
    reference: "Quran 97:1-5; Bukhari 32:4",
  },
  {
    point: "The reward of fasting is with Allah alone",
    detail:
      "In a hadith qudsi, Allah says: 'Every deed of the son of Adam is for him, except fasting — it is for Me, and I shall reward it.' The reward is so immense that only Allah knows its extent.",
    reference: "Bukhari 30:14; Muslim 13:212",
  },
  {
    point: "There is a special gate — Ar-Rayyan",
    detail:
      "The Prophet (peace be upon him) said: 'There is a gate in Paradise called Ar-Raiyan, and those who observe fasts will enter through it on the Day of Resurrection and none except them will enter through it…' Once the fasting people have entered, the gate is closed and no one else passes through it.",
    reference: "Bukhari 30:6",
  },
  {
    point: "The fasting person has two joys, and a breath sweeter than musk",
    detail:
      "The Prophet (peace be upon him) said: 'There are two joys for the fasting person: the joy when he breaks his fast, and the joy of when he meets his Lord.' And within the hadith qudsi he said: 'The unpleasant smell coming out from the mouth of a fasting person is better in the sight of Allah than the smell of musk.'",
    reference: "Tirmidhi 8:85; Bukhari 30:14",
  },
  {
    point: "Fasting is not merely giving up food",
    detail:
      "The fast is a training in character, not only in hunger. The Prophet (peace be upon him) warned: 'Whoever does not give up forged speech and evil actions, Allah is not in need of his leaving his food and drink…' Guarding the tongue and conduct is part of the fast itself.",
    reference: "Bukhari 30:13",
  },
  {
    point: "The fasting person's supplication is not turned back",
    detail:
      "The Prophet (peace be upon him) said: 'There are three whose supplications are not turned back: A just ruler, and a fasting person until he breaks his fast…' The moments of fasting — especially just before iftar — are a prime time to ask Allah for whatever you need.",
    reference: "Ibn Majah 7:115",
  },
];

type FastingTopic = {
  id: string;
  name: string;
  content: {
    intro: string;
    points: { title: string; detail: string; note?: string }[];
    source?: string;
  };
};

const fastingTopics: FastingTopic[] = [
  {
    id: "when-it-begins",
    name: "When It Begins",
    content: {
      intro:
        "'Is tomorrow Ramadan?' and 'why do the mosques disagree?' are the most-asked questions of the year. Ramadan begins and ends with the sighting of the crescent moon (hilal), and the month is always either 29 or 30 days — never fixed in advance.",
      points: [
        {
          title: "Fasting begins with the crescent",
          detail:
            "The month starts when the new crescent of Ramadan is sighted, and ends when the crescent of Shawwal is seen. The Prophet (peace be upon him) said: 'Start fasting on seeing the crescent (of Ramadan), and give up fasting on seeing the crescent (of Shawwal), and if the sky is overcast (and you cannot see it), complete thirty days of Sha'ban'",
          note: "Bukhari 30:19",
        },
        {
          title: "Always 29 or 30 days",
          detail:
            "A lunar month is never longer than 30 days. If the crescent is not sighted on the 29th night, the current month is completed as thirty days. The Prophet (peace be upon him) said: 'We are an illiterate nation; we neither write, nor know accounts. The month is like this and this,' meaning sometimes 29 days and sometimes thirty.",
          note: "Bukhari 30:23",
        },
        {
          title: "Do not 'jump the gun'",
          detail:
            "It is not allowed to start fasting Ramadan a day or two early out of caution. The Prophet (peace be upon him) said: 'None of you should fast a day or two before the month of Ramadan unless he has the habit of fasting…' — the only exception being someone whose regular voluntary fast happens to fall on that day.",
          note: "Bukhari 30:24",
        },
        {
          title: "Why communities differ",
          detail:
            "Scholars differ on whether a single global sighting binds everyone, or whether each region (or country) follows its own local sighting — which is why neighbouring mosques can begin on different days. Both positions are respected; follow your local community or trusted authority and do not let it become a source of division. The full moon-sighting discussion, and how it applies to every Islamic month, is on the Islamic Calendar page.",
          note: "Differed upon — see /islamic-calendar for the detailed moon-sighting discussion",
        },
      ],
      source: "Bukhari 30:19; Bukhari 30:23; Bukhari 30:24",
    },
  },
  {
    id: "basics",
    name: "Basics",
    content: {
      intro:
        "Fasting (sawm) in Ramadan is the fourth pillar of Islam. It is obligatory upon every sane, adult Muslim who is able to fast. The fast begins at true dawn (Fajr) and ends at sunset (Maghrib) each day.",
      points: [
        {
          title: "Intention (Niyyah)",
          detail:
            "The intention to fast must be made before Fajr each day. It is made in the heart — no verbal declaration is required. Many scholars hold that a single intention at the start of Ramadan suffices for the entire month, unless the fast is broken and needs to be restarted.",
          note: "Hadith: 'There is no fast for the one who does not intend to fast from the night before.' — Nasai 22:242; Abu Dawud 14:142",
        },
        {
          title: "Suhoor (Pre-dawn Meal)",
          detail:
            "Eating suhoor is a blessed sunnah and should be taken as close to Fajr as possible. The Prophet (peace be upon him) said: 'Eat suhoor, for in suhoor there is blessing.'",
          note: "Bukhari 30:32; Muslim 13:55",
        },
        {
          title: "Iftar (Breaking the Fast)",
          detail:
            "The fast should be broken as soon as Maghrib enters, without delay. The Prophet (peace be upon him) said: 'The people will remain upon goodness as long as they hasten to break the fast.' It is sunnah to break the fast with fresh dates, and if not available, then with water.",
          note: "Bukhari 30:64; Abu Dawud 14:44; Tirmidhi 8:15",
        },
        {
          title: "Du'a at Iftar",
          detail:
            "The Prophet (peace be upon him) would say upon breaking his fast: 'Dhahaba adh-dhama'u wabtallatil-'urooqu wa thabatal-ajru in sha Allah' — The thirst has gone, the veins have been moistened, and the reward is assured, if Allah wills. Another widely recited du'a is: 'Allahumma inni laka sumtu wa bika aamantu wa 'alaika tawakkaltu wa 'ala rizqika aftartu' — O Allah, I fasted for You, believed in You, placed my trust in You, and broke my fast with Your provision. This version is from Abu Dawud 14:46 but is graded da'if (weak); the first du'a above is the stronger narration.",
          note: "Abu Dawud 14:45 (graded hasan); Abu Dawud 14:46 (graded da'if — widely recited but weak chain)",
        },
        {
          title: "Timing",
          detail:
            "The fast begins at true dawn (when the white thread of dawn becomes distinct from the black thread of night) and ends at sunset. This is confirmed in the Quran: 'Eat and drink until the white thread of dawn becomes distinct from the black thread.' The exact times vary by location and season.",
          note: "Quran 2:187",
        },
      ],
      source: "Quran 2:183-187; Bukhari 30:32; Bukhari 30:64; Muslim 13:55",
    },
  },
  {
    id: "breaks",
    name: "What Breaks It",
    content: {
      intro:
        "The following actions invalidate the fast if done intentionally and with full knowledge during the fasting hours (from Fajr to Maghrib). If done out of forgetfulness, the fast remains valid.",
      points: [
        {
          title: "Eating or drinking intentionally",
          detail:
            "Consuming any food, drink, or substance intentionally — including water, medicine, or nutritional injections — breaks the fast. If done out of forgetfulness, the fast is still valid: 'If he forgets and eats or drinks, let him complete his fast, for it was Allah who fed him and gave him drink.'",
          note: "Bukhari 30:40; Muslim 13:222",
        },
        {
          title: "Sexual intercourse",
          detail:
            "Intimacy during fasting hours invalidates the fast and requires both qada (making up the day) and kaffarah (expiation): freeing a slave, or fasting 60 consecutive days, or feeding 60 poor people.",
          note: "Bukhari 30:42; Muslim 13:101",
        },
        {
          title: "Deliberate vomiting",
          detail:
            "Inducing vomit intentionally breaks the fast. If vomiting occurs involuntarily (e.g., due to illness), the fast remains valid.",
          note: "Abu Dawud 14:68; Tirmidhi 8:39",
        },
        {
          title: "Menstruation or post-natal bleeding",
          detail:
            "The onset of menstruation or post-natal bleeding (nifas) at any point during the day invalidates the fast. The days must be made up after Ramadan. Women are not permitted to fast during these periods.",
          note: "Bukhari 30:59",
        },
        {
          title: "Cupping / blood extraction (scholarly difference)",
          detail:
            "Some scholars hold that cupping (hijama) breaks the fast based on the hadith: 'The one who cups and the one who is cupped have both broken their fast.' Others, including the Hanafi and Shafi'i schools, consider this hadith abrogated and say cupping does not break the fast. Blood tests and donations that extract a small amount are generally considered permissible.",
          note: "Abu Dawud 14:55; differed upon — see Fiqh us-Sunnah",
        },
      ],
      source: "Bukhari 30:40; Bukhari 30:42; Muslim 13:101; Muslim 13:222; Abu Dawud 14:68",
    },
  },
  {
    id: "doesnt-break",
    name: "What Doesn't Break It",
    content: {
      intro:
        "Many people worry about actions that do NOT actually break the fast. The following are permissible during fasting hours according to the majority of scholars.",
      points: [
        {
          title: "Eating or drinking out of forgetfulness",
          detail:
            "If a fasting person eats or drinks accidentally, forgetting that they are fasting, the fast is not broken. They should stop as soon as they remember and continue fasting.",
          note: "Bukhari 30:40; Muslim 13:222",
        },
        {
          title: "Rinsing the mouth and nose (without exaggeration)",
          detail:
            "Rinsing the mouth and nose during wudu is permissible, but the fasting person should not exaggerate (i.e., sniff water deep into the nose or gargle excessively).",
          note: "Abu Dawud 14:54; Nasai 1:87",
        },
        {
          title: "Swallowing saliva",
          detail:
            "Normal swallowing of one's own saliva does not break the fast. This is agreed upon by all scholars.",
        },
        {
          title: "Using miswak (tooth stick)",
          detail:
            "The Prophet (peace be upon him) used the miswak while fasting. Brushing teeth with a toothbrush (without toothpaste) is also generally considered permissible, though some scholars advise caution with flavored toothpaste.",
          note: "Bukhari 11:12 (general miswak encouragement)",
        },
        {
          title: "Eye drops, ear drops, and non-nutritional injections",
          detail:
            "The majority of contemporary scholars hold that eye drops, ear drops, and injections that are not nutritional (e.g., insulin, vaccines) do not break the fast, as they do not enter the stomach and are not food or drink.",
          note: "Fatwa of the Islamic Fiqh Academy; Shaykh Ibn Uthaymeen",
        },
        {
          title: "Tasting food without swallowing",
          detail:
            "A person may taste food (e.g., while cooking) as long as nothing is swallowed. This is permitted by most scholars, especially if there is a need.",
          note: "Reported from Ibn Abbas — see Musannaf Ibn Abi Shaybah",
        },
        {
          title: "Unintentional inhalation of dust, smoke, or steam",
          detail:
            "Accidentally inhaling dust, steam, or incidental smoke does not break the fast, as it is not done intentionally.",
        },
      ],
      source: "Bukhari 30:40; Muslim 13:222; Abu Dawud 14:54",
    },
  },
  {
    id: "exemptions",
    name: "Exemptions",
    content: {
      intro:
        "Islam does not place hardship beyond what a person can bear. Several categories of people are exempt from fasting, with different rulings on whether they must make up the days or pay fidyah.",
      points: [
        {
          title: "Travelers",
          detail:
            "A traveler has the option to fast or break the fast. If they break it, the days must be made up after Ramadan. The Quran states: 'Whoever among you is ill or on a journey — then an equal number of other days.' The concession applies to journeys that qualify as travel in Islamic law (typically 80+ km).",
          note: "Quran 2:184-185; Muslim 13:112",
        },
        {
          title: "The sick (temporary illness)",
          detail:
            "A person with a temporary illness that makes fasting harmful or extremely difficult may break the fast and make up the days later. This includes conditions worsened by fasting, fever, or recovery from surgery.",
          note: "Quran 2:184-185",
        },
        {
          title: "The chronically ill and elderly",
          detail:
            "Those with permanent illnesses or the elderly who cannot fast at all are exempt. Instead of making up the days, they pay fidyah: feeding one poor person for each day missed (approximately the cost of one meal).",
          note: "Quran 2:184; reported from Ibn Abbas — Bukhari 65:32",
        },
        {
          title: "Pregnant and breastfeeding women",
          detail:
            "If a pregnant or breastfeeding woman fears harm to herself or her child, she may break the fast. Scholars differ on whether she must only make up the days (Hanafi view) or also pay fidyah (Shafi'i/Hanbali view, if the fear was only for the child).",
          note: "Abu Dawud 14:5; Tirmidhi 8:34; Nasai 22:185",
        },
        {
          title: "Children (pre-puberty)",
          detail:
            "Fasting is not obligatory on children who have not reached puberty. However, parents are encouraged to gradually introduce them to fasting so they are accustomed to it when it becomes obligatory.",
          note: "Bukhari 30:67 (companions would have their children fast)",
        },
        {
          title: "Menstruating women and post-natal bleeding",
          detail:
            "Women experiencing menstruation or post-natal bleeding (nifas) are prohibited from fasting during those days. They must make up the missed days after Ramadan. Aisha said: 'We were commanded to make up the fasts but not the prayers.'",
          note: "Bukhari 6:9; Muslim 3:85",
        },
        {
          title: "Diabetes and time-critical medication",
          detail:
            "The classical categories above map onto modern medicine. A person whose diabetes, or any condition, requires food or medication during daylight hours to avoid real harm is treated as 'ill': if the need is temporary, they break the fast and make up the days; if it is permanent, they pay fidyah. Insulin injections themselves are generally held not to break the fast (they are not nutrition), but hypoglycaemia is a genuine danger — the ruling depends entirely on your specific condition.",
          note: "Quran 2:184-185 — establish the specifics with your doctor and a qualified scholar",
        },
        {
          title: "IV drips, dialysis, and transfusions",
          detail:
            "Contemporary fiqh councils distinguish by what enters the body: a nutritional/glucose IV drip is generally held to break the fast because it nourishes like food, whereas non-nutritional injections do not. Kidney dialysis and blood transfusions are differed upon among contemporary scholars. These are exactly the modern specifics that need a case-by-case ruling.",
          note: "Scholarly-summary — contemporary fiqh-academy positions; consult a scholar for your case",
        },
        {
          title: "Mental-health and other daily medication",
          detail:
            "If prescribed medication must be taken at fixed times during fasting hours and cannot safely be rescheduled around suhoor and iftar, the person is excused as one who is ill — do not stop essential medication to fast. Never discontinue psychiatric or life-sustaining medication for the sake of fasting; seek an accommodation from your doctor, and a ruling from a scholar, together.",
          note: "Quran 2:184-185 — 'Allah wants ease for you and does not want hardship for you'",
        },
      ],
      source: "Quran 2:184-185; Bukhari 6:9; Bukhari 65:32; Muslim 3:85; Muslim 13:112",
    },
  },
  {
    id: "makeup",
    name: "Making Up Days",
    content: {
      intro:
        "Missed days of Ramadan must be made up (qada) before the next Ramadan arrives. Understanding the rules of qada, fidyah, and kaffarah ensures that the obligation is properly fulfilled.",
      points: [
        {
          title: "Qada (Making Up Missed Days)",
          detail:
            "Any day missed due to a valid reason (illness, travel, menstruation, etc.) must be made up by fasting an equal number of days after Ramadan. These make-up fasts can be done consecutively or separately — there is flexibility. Aisha reported that she would make up her missed Ramadan fasts in Sha'ban (the month before Ramadan).",
          note: "Quran 2:185; Muslim 13:193 (Aisha making up fasts in Sha'ban)",
        },
        {
          title: "Fidyah (Compensation for Inability)",
          detail:
            "For those permanently unable to fast (chronic illness, extreme old age), fidyah must be paid: feeding one poor person for each day missed. This is typically the cost of one meal per day. It cannot substitute for qada if the person is able to fast later.",
          note: "Quran 2:184; Ibn Abbas' interpretation — Bukhari 65:32",
        },
        {
          title: "Kaffarah (Expiation for Intentional Violation)",
          detail:
            "If a person deliberately breaks the fast during Ramadan without a valid excuse (specifically by eating, drinking, or sexual intercourse), kaffarah is required in addition to making up the day. The kaffarah is, in order: freeing a slave (no longer applicable), fasting 60 consecutive days, or feeding 60 poor people.",
          note: "Bukhari 30:44; Muslim 13:101",
        },
        {
          title: "Delaying Make-Up Past the Next Ramadan",
          detail:
            "Scholars agree that make-up fasts should ideally be completed before the next Ramadan. If delayed without a valid reason, some scholars (Shafi'i, Hanbali, Maliki) say fidyah must also be paid in addition to making up the days. The Hanafi school does not require the additional fidyah but considers the delay sinful if without excuse.",
        },
      ],
      source: "Quran 2:184-185; Bukhari 30:44; Bukhari 65:32; Muslim 13:101; Muslim 13:193",
    },
  },
  {
    id: "with-kids",
    name: "Ramadan with Kids",
    content: {
      intro:
        "Fasting is not obligatory before puberty, but Ramadan is how children fall in love with it. The companions trained their young ones gently, and the goal is a happy first fast — not an exhausted, resentful one.",
      points: [
        {
          title: "The companions' example",
          detail:
            "The companions had their children fast on encouraged days and made the day manageable for them. Ar-Rubai' bint Mu'awwidh said: '…and also make our boys fast. We used to make toys of wool for the boys and if anyone of them cried for food, he was given those toys till it was the time of the breaking of the fast.' Distraction, play, and a countdown to iftar were part of the method.",
          note: "Bukhari 30:67",
        },
        {
          title: "Start gradually",
          detail:
            "Build up over a few years rather than all at once: a half-day fast until Dhuhr, then until Asr, then a full day when the child is keen and able. Let the child ask to fast rather than being forced — enthusiasm sustained over years matters more than one hard day. Watch for genuine hunger, thirst, or illness in a growing body and let them break without guilt.",
          note: "Scholarly-summary — practical parenting guidance",
        },
        {
          title: "Make the month special at home",
          detail:
            "Wake for suhoor together, let children help prepare iftar and hand out dates, decorate the home, and keep a simple reward chart or countdown for good deeds and completed fasts. Celebrate the first full fast as a milestone. These rituals are what a child remembers Ramadan by. See the Kids section for family-friendly activities and stories.",
          note: "Scholarly-summary — see /kids for family activities and first-fast ideas",
        },
      ],
      source: "Bukhari 30:67",
    },
  },
  {
    id: "common-questions",
    name: "Common Questions",
    content: {
      intro:
        "The questions people are often too embarrassed to ask a person face-to-face — but which every fasting Muslim eventually wonders about. Where a matter is differed upon or depends on your situation, the safest course is to ask a trusted local scholar.",
      points: [
        {
          title: "I woke up needing a ghusl (in janabah) — is my fast valid?",
          detail:
            "Yes. Becoming ritually impure from intimacy or a wet dream during the night does not affect the fast, even if you only perform ghusl after Fajr. Aisha and Umm Salama reported that the Prophet (peace be upon him) 'used to get up in the morning in the state of Janaba after having sexual relations with his wives. He would then take a bath and fast' Rushing the ghusl is better, but a delay does not break the fast.",
          note: "Bukhari 30:34; Bukhari 30:39",
        },
        {
          title: "Can I kiss or be affectionate with my spouse while fasting?",
          detail:
            "Affection short of intercourse is permitted for those who can control themselves. Aisha said the Prophet (peace be upon him) 'used to kiss and embrace (his wives) while he was fasting, and he had more power to control his desires than any of you.' If a person fears it will lead to intercourse or ejaculation, they should avoid it — the concern is where it leads, not the affection itself.",
          note: "Bukhari 30:35; Bukhari 30:36",
        },
        {
          title: "Does a wet dream or nosebleed break my fast?",
          detail:
            "No. Anything involuntary — a wet dream, a nosebleed, involuntary vomiting, or an accidental swallow of dust or water — does not break the fast, because the fast is only broken by deliberate acts. There is no ghusl-related penalty and nothing to make up.",
          note: "Scholarly-summary — the majority hold involuntary acts do not break the fast",
        },
        {
          title: "Toothpaste, mouthwash, and brushing?",
          detail:
            "Using the miswak or a dry toothbrush is fine (see 'What Doesn't Break It'). With toothpaste or mouthwash, take care that nothing is swallowed; some scholars advise leaving strongly-flavoured toothpaste until after iftar out of caution. If a trace is accidentally swallowed, the fast is not broken.",
          note: "Scholarly-summary — see the miswak point under 'What Doesn't Break It'",
        },
        {
          title: "Inhalers, patches, and vaccines?",
          detail:
            "Most contemporary scholars and fiqh councils hold that non-nutritional injections, skin patches, and vaccines do not break the fast (nothing is eaten or drunk). Asthma inhalers are differed upon — a minority treat the spray as entering the throat like a drink, while many permit them, especially where they are medically necessary. If you rely on an inhaler to breathe, do not risk your health over the difference.",
          note: "Scholarly-summary — see the eye-drops/injections point under 'What Doesn't Break It'; consult a scholar",
        },
        {
          title: "Showering, swimming, and cooling off?",
          detail:
            "Showering, bathing, and swimming are all permitted while fasting — pouring water over yourself to cool down does not break the fast. The only caution is not to deliberately swallow water. If some water is swallowed by accident, the fast remains valid.",
          note: "Scholarly-summary — permitted by the majority; avoid deliberately swallowing water",
        },
        {
          title: "I keep forgetting and eating — did I ruin my fasts?",
          detail:
            "No. Every time you eat or drink genuinely forgetting you are fasting, the fast remains valid however many times it happens — the Prophet (peace be upon him) said the one who forgets 'should complete his fast, for it is only Allah Who has fed him and given him drink.' Simply stop the moment you remember, remove what is in your mouth, and continue. There is nothing to make up.",
          note: "Bukhari 30:40; Muslim 13:222",
        },
      ],
      source: "Bukhari 30:34; Bukhari 30:35; Bukhari 30:39; Bukhari 30:40; Muslim 13:222",
    },
  },
];

type LastTenTopic = {
  id: string;
  name: string;
  content: {
    intro: string;
    points: { title: string; detail: string; note?: string }[];
    verse?: { arabic: string; text: string; ref: string };
    source?: string;
  };
};

const lastTenTopics: LastTenTopic[] = [
  {
    id: "laylatul-qadr",
    name: "Laylatul Qadr",
    content: {
      intro:
        "Laylatul Qadr (the Night of Decree) is the single most important night in the Islamic calendar. It is the night on which the Quran was first revealed, and worship on this night is better than 1,000 months (over 83 years).",
      verse: {
        arabic: "إِنَّآ أَنزَلْنَـٰهُ فِى لَيْلَةِ ٱلْقَدْرِ ۝ وَمَآ أَدْرَىٰكَ مَا لَيْلَةُ ٱلْقَدْرِ ۝ لَيْلَةُ ٱلْقَدْرِ خَيْرٌۭ مِّنْ أَلْفِ شَهْرٍۢ",
        text: "Indeed, We sent it down during the Night of Decree. And what can make you know what the Night of Decree is? The Night of Decree is better than a thousand months.",
        ref: "Quran 97:1-3",
      },
      points: [
        {
          title: "When is it?",
          detail:
            "The Prophet (peace be upon him) said: 'Seek Laylatul Qadr in the odd nights of the last ten days of Ramadan.' This means the 21st, 23rd, 25th, 27th, or 29th nights. While many communities focus on the 27th, the Prophet did not specify a single date — it moves each year. The wisdom in this is to encourage worship throughout the last ten nights.",
          note: "Bukhari 32:4; Muslim 13:272",
        },
        {
          title: "Signs of the night",
          detail:
            "The Prophet (peace be upon him) described it as a calm, serene night — neither too hot nor too cold. Some narrations mention that the sun rises the next morning without strong rays (appearing pale). However, these signs are recognized after the fact — the point is to worship every odd night.",
          note: "Muslim 13:283; reported in Ibn Khuzaymah",
        },
        {
          title: "The best du'a for this night",
          detail:
            "Aisha asked the Prophet: 'If I know which night is Laylatul Qadr, what should I say?' He replied: 'Say: Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'anni — O Allah, You are the Pardoner, You love to pardon, so pardon me.'",
          note: "Tirmidhi 48:144; Ibn Majah 34:24",
        },
        {
          title: "The Prophet's example in the last ten",
          detail:
            "This is the model for stepping up. Aisha reported that with the start of the last ten days of Ramadan, the Prophet (peace be upon him) 'used to tighten his waist belt (i.e. work hard) and used to pray all the night, and used to keep his family awake for the prayers.' He gave these nights an intensity unlike the rest of the month, and pulled his household into it with him.",
          note: "Bukhari 32:11",
        },
        {
          title: "What to do",
          detail:
            "Spend the night in prayer (qiyam al-layl), recitation of the Quran, dhikr, du'a, and seeking forgiveness. The Prophet (peace be upon him) said: 'Whoever stands in prayer on Laylatul Qadr out of faith and seeking reward, his previous sins will be forgiven.'",
          note: "Bukhari 2:28; Muslim 6:209",
        },
      ],
      source: "Quran 97:1-5; Bukhari 2:28; Bukhari 32:4; Bukhari 32:11; Muslim 6:209; Muslim 13:272; Tirmidhi 48:144",
    },
  },
  {
    id: "itikaf",
    name: "I'tikaf",
    content: {
      intro:
        "I'tikaf is the practice of secluding oneself in the masjid for worship, especially during the last ten days and nights of Ramadan. It is a sunnah mu'akkadah (emphasized sunnah) that the Prophet (peace be upon him) observed every Ramadan.",
      points: [
        {
          title: "What is it?",
          detail:
            "I'tikaf means staying in the masjid with the intention of devotion to Allah. The person in i'tikaf dedicates themselves entirely to worship — prayer, Quran, dhikr, and du'a — withdrawing from worldly distractions. It is one of the most powerful spiritual retreats in Islam.",
        },
        {
          title: "Duration and timing",
          detail:
            "The sunnah is to begin i'tikaf from Fajr on the 20th of Ramadan (entering the masjid the night before) and remain until the announcement of Eid. Some scholars permit shorter i'tikaf (even a few hours) with the right intention, though the 10-day sunnah is most virtuous.",
          note: "Bukhari 33:1; Muslim 14:3",
        },
        {
          title: "Rules during i'tikaf",
          detail:
            "The person should remain in the masjid and only leave for necessities (bathroom, wudu, eating if food cannot be brought in). They should not leave without a valid reason. They may speak to visitors and attend to basic needs, but the focus should remain on worship.",
          note: "Bukhari 33:4; Muslim 14:3 (Aisha would comb the Prophet's hair while he was in i'tikaf)",
        },
        {
          title: "Who can do it?",
          detail:
            "I'tikaf is for both men and women. Women may perform i'tikaf in the masjid or, according to some scholars (Hanafi), in a designated prayer area at home. The key conditions are: being Muslim, sane, and having the intention of i'tikaf.",
          note: "Bukhari 33:8 (the Prophet's wives performed i'tikaf)",
        },
      ],
      source: "Bukhari 33:1; Bukhari 33:8; Muslim 14:3; Muslim 13:275",
    },
  },
  {
    id: "zakat-al-fitr",
    name: "Zakat al-Fitr",
    content: {
      intro:
        "Zakat al-Fitr is an obligatory charity given at the end of Ramadan, before the Eid prayer. It purifies the fasting person from any shortcomings during the fast and provides for the poor so they can also celebrate Eid.",
      points: [
        {
          title: "Who must pay it?",
          detail:
            "Every Muslim who has food in excess of their needs for themselves and their dependents on the day of Eid must pay Zakat al-Fitr. It is paid on behalf of every member of the household — including children and dependents.",
          note: "Bukhari 24:103; Muslim 12:26",
        },
        {
          title: "How much?",
          detail:
            "The amount is one sa' (approximately 2.5-3 kg) of the staple food of the land — dates, barley, wheat, rice, or similar. In monetary terms, many scholars permit paying the equivalent cash value, which varies by region (commonly $10-15 per person in Western countries). The Hanafi school specifically permits cash payment.",
          note: "Bukhari 24:106; Bukhari 24:107; Muslim 12:19",
        },
        {
          title: "When to pay it?",
          detail:
            "It should be paid before the Eid prayer. The Prophet (peace be upon him) commanded that it be given before people go out to the Eid prayer. It can be given a day or two before Eid. If paid after the Eid prayer, it counts as regular charity, not Zakat al-Fitr.",
          note: "Bukhari 24:109; Abu Dawud 9:54",
        },
        {
          title: "Its purpose",
          detail:
            "Ibn Abbas said: 'The Messenger of Allah prescribed Zakat al-Fitr as a purification for the fasting person from idle talk and obscenity, and as food for the poor.' It ensures that every Muslim — rich or poor — can celebrate Eid with dignity.",
          note: "Abu Dawud 9:54; Ibn Majah 8:45",
        },
        {
          title: "Not the same as annual Zakat",
          detail:
            "Do not confuse the two. Zakat al-Fitr is a small, fixed charity of roughly one sa' of food paid per person by every Muslim tied to the end of Ramadan. Annual Zakat (Zakat al-mal) is the third pillar of Islam — 2.5% of qualifying wealth held for a full year, due from those who reach the nisab threshold. They are separate obligations: paying one does not discharge the other. See the Zakat and Pillars pages for the wealth-based Zakat in full.",
          note: "Bukhari 24:103 (Zakat al-Fitr scope) — see /zakat and /pillars for annual Zakat",
        },
      ],
      source: "Bukhari 24:103; Bukhari 24:109; Muslim 12:16; Muslim 12:17; Abu Dawud 9:54",
    },
  },
  {
    id: "eid",
    name: "Eid al-Fitr",
    content: {
      intro:
        "Eid al-Fitr marks the end of Ramadan and the beginning of Shawwal. It is a day of celebration, gratitude, and community — a reward from Allah for the month of fasting and worship.",
      points: [
        {
          title: "Eid prayer",
          detail:
            "The Eid prayer is 2 rak'at with additional takbirat, prayed in congregation after sunrise. There is no adhan or iqamah. It is followed by a khutbah. The Prophet (peace be upon him) would pray in an open area (musalla) and take one route going and a different route returning.",
          note: "Bukhari 13:8; Bukhari 13:35",
        },
        {
          title: "Sunnahs of Eid al-Fitr",
          detail:
            "Eat something (preferably dates) before going to the Eid prayer. Perform ghusl and wear your best clothes. Say the takbirat of Eid from Maghrib on the last night of Ramadan until the Eid prayer: 'Allahu Akbar, Allahu Akbar, la ilaha illallah, Allahu Akbar, Allahu Akbar, wa lillahil-hamd.'",
          note: "Bukhari 13:5; Quran 2:185 (basis for takbir)",
        },
        {
          title: "It is forbidden to fast on Eid",
          detail:
            "Fasting on the day of Eid al-Fitr is strictly prohibited. It is a day of celebration and gratitude, not a day of fasting. The Prophet (peace be upon him) explicitly forbade fasting on the two Eid days.",
          note: "Bukhari 30:98; Muslim 13:178",
        },
        {
          title: "Celebrate and connect",
          detail:
            "Eid is a time to visit family, exchange gifts, feed others, and spread joy. The Prophet (peace be upon him) said: 'Every nation has its celebration, and this is our celebration.' It is a communal celebration that strengthens the bonds of the ummah.",
          note: "Bukhari 13:4",
        },
        {
          title: "Everyone comes out — even women and children",
          detail:
            "Eid is meant to gather the whole community. Umm Atiyya said: 'We were ordered to go out (for `Id) and also to take along with us the menstruating women, mature girls and virgins staying in seclusion.' Menstruating women do not pray but attend the gathering and the du'a. Bring the family — first-timers included; the prayer itself and its takbirat are walked through step by step in the Salah section.",
          note: "Bukhari 13:29; Bukhari 13:30",
        },
        {
          title: "The Eid greeting, and if you arrive late",
          detail:
            "The companions would greet one another with 'Taqabbal Allahu minna wa minkum' — 'May Allah accept it from us and from you.' If you miss the Eid prayer entirely, there is no make-up obligation on you; scholars mention you may pray two rak'at on your own if you wish, but it is not required. Simply join the celebration and the day's kindness.",
          note: "Scholarly-summary — the taqabbal greeting is a companions' practice; missed-Eid ruling is differed",
        },
      ],
      source: "Bukhari 13:4; Bukhari 13:8; Bukhari 13:29; Bukhari 13:30; Muslim 13:178",
    },
  },
  {
    id: "after-ramadan",
    name: "After Ramadan",
    content: {
      intro:
        "The month ends, but the worship shouldn't. The week after Eid brings its own questions — 'the six of Shawwal,' making up missed days, and how to keep the momentum alive once the mosques empty out.",
      points: [
        {
          title: "The six days of Shawwal",
          detail:
            "Fasting six days in the month of Shawwal (after Eid) carries an enormous reward. The Prophet (peace be upon him) said that whoever 'observed the fast of Ramadan and then followed it with six (fasts) of Shawwal' — 'it would be as if he fasted perpetually.' They can be any six days of the month, consecutive or spread out. The Islamic Calendar page covers Shawwal and the rest of the year's recommended fasts.",
          note: "Muslim 13:264",
        },
        {
          title: "Make up missed Ramadan days first",
          detail:
            "If you owe make-up (qada) fasts from Ramadan, many scholars hold you should complete those before beginning the voluntary six of Shawwal, since the reward described is for six 'after Ramadan' — i.e. after Ramadan is fully fulfilled. There is flexibility in timing overall: Aisha herself would delay her qada — 'I could not do it but during the month of Sha'ban due to my duties to the Messenger of Allah…' If in doubt about your situation, ask a scholar.",
          note: "Muslim 13:193",
        },
        {
          title: "Keep the habits alive",
          detail:
            "The real test of Ramadan is the eleven months after it. Carry one or two habits forward — a daily portion of Quran, a voluntary prayer, regular charity, guarding the tongue. The Prophet (peace be upon him) taught that 'the most beloved deed to Allah is the most regular and constant even if it were little.' A small deed you keep all year is worth more than a burst that fades by Shawwal.",
          note: "Bukhari 81:53",
        },
      ],
      source: "Muslim 13:264; Muslim 13:193; Bukhari 81:53",
    },
  },
];

const worshipTopics: FastingTopic[] = [
  {
    id: "tarawih",
    name: "Tarawih & Night Prayer",
    content: {
      intro:
        "Tarawih — the long night prayer of Ramadan — is the defining nightly worship of the month. It is a voluntary prayer of immense reward, prayed in congregation in mosques across the world every night of Ramadan.",
      points: [
        {
          title: "Its reward",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever prayed at night in it (the month of Ramadan) out of sincere Faith and hoping for a reward from Allah, then all his previous sins will be forgiven.' Standing the nights of Ramadan in prayer is one of the two great forgivenesses of the month, alongside the fast itself.",
          note: "Bukhari 31:1; Bukhari 31:2",
        },
        {
          title: "Why the Prophet prayed it, then stopped in congregation",
          detail:
            "The Prophet (peace be upon him) led the night prayer in the mosque for a few nights and the crowds grew, then on the fourth night he came out only for the morning prayer and explained: 'your presence was not hidden from me but I was afraid lest the night prayer (Qiyam) should be enjoined on you and you might not be able to carry it on.' He wanted to spare the ummah an obligation, so it remained a beloved voluntary prayer.",
          note: "Bukhari 31:5",
        },
        {
          title: "How it became congregational again",
          detail:
            "Umar ibn al-Khattab later gathered the people to pray behind a single reciter, Ubayy ibn Ka'b. Seeing them united, he said: 'What an excellent Bid'a (i.e. innovation in religion) this is…' — an approved good he revived, since the Prophet himself had prayed it in congregation before withdrawing only out of fear it be made obligatory.",
          note: "Bukhari 31:3",
        },
        {
          title: "How many rak'at?",
          detail:
            "Aisha said the Prophet (peace be upon him) 'did not pray more than eleven rak`at in Ramadan or in any other month.' On this basis some pray eight rak'at plus witr, while others follow the practice established in Umar's time of twenty rak'at plus witr. Both are valid, well-established positions — pray what your mosque prays and focus on presence over counting.",
          note: "Bukhari 31:6",
        },
        {
          title: "How to pray it",
          detail:
            "Tarawih is prayed in sets of two rak'at after the Isha prayer, concluded with witr, any time from Isha until Fajr. The full step-by-step method, timing, and etiquette are covered in the Salah section under voluntary prayers.",
          note: "See /salah?tab=voluntary&sub=tarawih for the full how-to",
        },
      ],
      source: "Bukhari 31:1; Bukhari 31:2; Bukhari 31:3; Bukhari 31:5; Bukhari 31:6",
    },
  },
  {
    id: "quran",
    name: "The Quran Habit",
    content: {
      intro:
        "Ramadan is 'the month of the Quran' — the month in which it was revealed. Reconnecting with the Book, by reading, understanding, and living it, is the heart of the month's worship.",
      points: [
        {
          title: "Ramadan is the month of the Quran",
          detail:
            "Allah says the Quran was sent down in Ramadan (Quran 2:185). Every Ramadan, the angel Jibreel would review the entire Quran with the Prophet (peace be upon him). Ibn Abbas reported that 'Gabriel used to meet him every night of Ramadan to teach him the Qur'an' — the month is built around this Book.",
          note: "Bukhari 1:6",
        },
        {
          title: "A realistic daily plan",
          detail:
            "Many Muslims aim to complete the whole Quran at least once during the month — reading roughly one juz (one of thirty parts) each day makes this achievable. If that is too much, set a portion you can keep, whether pages or minutes, and hold to it every day. Consistency matters more than volume.",
          note: "Scholarly-summary — completing the Quran in Ramadan is a well-established practice",
        },
        {
          title: "Understand, don't just recite",
          detail:
            "Pair recitation with meaning: read a translation of what you recite, pause at verses that move you, and carry one lesson into your day. Tarawih is an excellent time to listen attentively as the reciter takes you through the Quran across the nights. Use the Quran reader to follow along with translation and, if you wish, word-by-word meaning.",
          note: "Scholarly-summary — see the Quran reader for translation and word-by-word",
        },
      ],
      source: "Quran 2:185; Bukhari 1:6",
    },
  },
  {
    id: "generosity",
    name: "Generosity & Feeding",
    content: {
      intro:
        "Ramadan is the season of giving. The Prophet (peace be upon him) — already the most generous of people — became more generous still in this month, and feeding others carries a reward multiplied by the fast.",
      points: [
        {
          title: "The Prophet's generosity in Ramadan",
          detail:
            "Ibn Abbas said the Prophet (peace be upon him) 'was the most generous of all the people, and he used to reach the peak in generosity in the month of Ramadan when Gabriel met him…' and was 'even more generous than the strong uncontrollable wind.' Increased giving is following his example directly.",
          note: "Bukhari 1:6",
        },
        {
          title: "Feed a fasting person",
          detail:
            "One of the easiest ways to multiply reward in Ramadan: the Prophet (peace be upon him) said: 'Whoever provides the food for a fasting person to break his fast with, then for him is the same reward as his (the fasting person's), without anything being diminished from the reward of the fasting person.' A single date or a cup of water at iftar can earn the reward of the whole fast.",
          note: "Tirmidhi 8:126; Ibn Majah 7:109",
        },
        {
          title: "Give in every form",
          detail:
            "Generosity in Ramadan is broad: sponsoring iftars, giving sadaqah, paying charity to the poor, hosting others, and being easy and kind with family and strangers. Many Muslims also pay their annual Zakat in Ramadan to seek the month's multiplied reward. Small, consistent giving throughout the thirty days builds a lasting habit.",
          note: "Scholarly-summary — many choose Ramadan to give their annual Zakat",
        },
      ],
      source: "Bukhari 1:6; Tirmidhi 8:126; Ibn Majah 7:109",
    },
  },
  {
    id: "dua",
    name: "Du'a in Ramadan",
    content: {
      intro:
        "Ramadan is a month of answered prayer. The fasting person is in a state Allah honours, and the days and nights hold moments when supplication is especially accepted — so ask, and ask abundantly.",
      points: [
        {
          title: "The fasting person's du'a is answered",
          detail:
            "The Prophet (peace be upon him) said: 'There are three whose supplications are not turned back: A just ruler, and a fasting person until he breaks his fast…' Every hour you fast is an open window for du'a — keep asking Allah throughout the day, not only at set times.",
          note: "Ibn Majah 7:115",
        },
        {
          title: "The best moments to ask",
          detail:
            "The time just before iftar — while still fasting and at the point of breaking it — is among the most beloved moments to make du'a. So too the last third of every night before Fajr, and above all the odd nights of the last ten in search of Laylatul Qadr. Raise your hands, be specific, and repeat your most important requests.",
          note: "Scholarly-summary — established times of accepted supplication",
        },
        {
          title: "Allah is near, so call on Him",
          detail:
            "Allah placed the verse of du'a in the very middle of the passages on fasting: 'When My slaves ask you concerning Me, I am indeed near. I respond to the call of the supplicant when he calls upon Me…' (Quran 2:186). Its placement within the Ramadan verses is a direct invitation to turn the month into a season of asking.",
          note: "Quran 2:186",
        },
      ],
      source: "Quran 2:186; Ibn Majah 7:115",
    },
  },
];

/* Rows from the old tab-wide aggregate cards whose refs no point note of any
   sub cites — kept with their most relevant selection so no reference is
   dropped (house rule: the card below a rail lists ONLY the active
   selection's sources). All other old rows are covered by topicSourceRefs. */
const extraSourceRows: Record<string, { ref: string; desc: string }[]> = {
  basics: [
    { ref: "Bukhari 30:4; Muslim 13:211", desc: "Fasting as a shield; conduct while fasting" },
  ],
  "zakat-al-fitr": [
    { ref: "Muslim 12:16; Muslim 12:17", desc: "Zakat al-Fitr obligation and amount" },
  ],
};

const sections = [
  { key: "intro", label: "What is Ramadan?" },
  { key: "importance", label: "Why It Matters" },
  { key: "fasting", label: "Fasting Guide" },
  { key: "worship", label: "Worship in Ramadan" },
  { key: "last-ten", label: "Last 10 Nights & Eid" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── sub-components ───────────────────────── */

function FastingInfoCard({ topic }: { topic: FastingTopic }) {
  return (
    <>
      <ContentCard>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-themed">{topic.name}</h2>
        </div>

        <p className="text-themed-muted text-sm leading-relaxed mb-5">
          {topic.content.intro}
        </p>

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
    </>
  );
}

function LastTenInfoCard({ topic }: { topic: LastTenTopic }) {
  return (
    <>
      <ContentCard>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-themed">{topic.name}</h2>
        </div>

        <p className="text-themed-muted text-sm leading-relaxed mb-5">
          {topic.content.intro}
        </p>

        {topic.content.verse && (
          <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: "var(--color-bg)" }}>
            <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
              {topic.content.verse.arabic}
            </p>
            <p className="text-themed text-sm italic">
              &ldquo;{topic.content.verse.text}&rdquo;
            </p>
            <p className="text-xs text-themed-muted mt-2"><HadithRefText text={topic.content.verse.ref} /></p>
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
    </>
  );
}

/* ───────────────────────── page ───────────────────────── */

function RamadanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useScrollToSection();
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "intro");
  // Deep-link support: ?sub=<topic id> (old ?section= accepted as a mount-time alias)
  const subParam = searchParams.get("sub") ?? searchParams.get("section");
  const [activeFasting, setActiveFasting] = useState(
    subParam && fastingTopics.some((t) => t.id === subParam) ? subParam : "basics"
  );
  const [activeWorship, setActiveWorship] = useState(
    subParam && worshipTopics.some((t) => t.id === subParam) ? subParam : "tarawih"
  );
  const [activeLastTen, setActiveLastTen] = useState(
    subParam && lastTenTopics.some((t) => t.id === subParam) ? subParam : "laylatul-qadr"
  );
  const [search, setSearch] = useState("");

  // Keep ?tab= / ?sub= in sync so the current view is shareable
  const syncUrl = (tab: SectionKey, sub?: string) => {
    router.replace(sub ? `${pathname}?tab=${tab}&sub=${sub}` : `${pathname}?tab=${tab}`, { scroll: false });
  };

  const topicMatches = (t: { name: string; content: { intro: string; points: { title: string; detail: string; note?: string }[]; verse?: { text: string }; source?: string } }) => {
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


  /* auto-select the first visible topic when search filters out the active one */
  useEffect(() => {
    if (!search || search.length < 2) return;
    const vf = fastingTopics.filter(topicMatches);
    if (vf.length && !vf.some((t) => t.id === activeFasting)) setActiveFasting(vf[0].id);
    const vw = worshipTopics.filter(topicMatches);
    if (vw.length && !vw.some((t) => t.id === activeWorship)) setActiveWorship(vw[0].id);
    const vl = lastTenTopics.filter(topicMatches);
    if (vl.length && !vl.some((t) => t.id === activeLastTen)) setActiveLastTen(vl[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeFasting, activeWorship, activeLastTen]);

  return (
    <div>
      <PageHeader
        title="Ramadan"
        titleAr="رمضان"
        subtitle="The blessed month of fasting, Quran, and spiritual renewal"
      />

      <VerseHero
        arabic="شَهْرُ رَمَضَانَ ٱلَّذِىٓ أُنزِلَ فِيهِ ٱلْقُرْءَانُ هُدًۭى لِّلنَّاسِ وَبَيِّنَـٰتٍۢ مِّنَ ٱلْهُدَىٰ وَٱلْفُرْقَانِ"
        text="The month of Ramadan in which the Quran was revealed, a guidance for mankind and clear proofs of guidance and criterion."
        reference="Quran 2:185"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search fasting, prayers, virtues..." className="mb-6" />

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
        {/* ─── What is Ramadan? ─── */}
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
              <h2 className="text-xl font-semibold text-themed mb-4">What is Ramadan?</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">Ramadan</span> (رمضان) is the ninth month of the Islamic lunar calendar and one of the most sacred periods in Islam. It is the month in which the Quran was first revealed to the Prophet Muhammad (peace be upon him) through the angel Jibreel, on a night known as Laylatul Qadr (the Night of Decree).
                </p>
                <p>
                  Fasting during Ramadan is the fourth pillar of Islam. Allah says: <em>&ldquo;O you who have believed, decreed upon you is fasting as it was decreed upon those before you, that you may become righteous&rdquo;</em> (Quran 2:183). From dawn to sunset each day, Muslims abstain from food, drink, and marital relations — training the soul in patience, self-discipline, and God-consciousness (taqwa).
                </p>
                <p>
                  But Ramadan is far more than abstaining from food. It is a month of intensified worship — extra prayers (Tarawih), recitation of the Quran (many Muslims complete the entire Quran during this month), charity, and supplication. The Prophet (peace be upon him) was described as being &ldquo;more generous than the blowing wind&rdquo; during Ramadan (Bukhari 1:6, Muslim 12:45).
                </p>
                <p>
                  The month begins and ends with the sighting of the crescent moon (hilal). Because the Islamic calendar is lunar, Ramadan shifts approximately 10-11 days earlier each solar year, meaning it cycles through all seasons over a 33-year period. This ensures that the experience of fasting — whether in long summer days or short winter ones — is shared equally across generations and geographies.
                </p>
                <p>
                  Ramadan culminates in the celebration of Eid al-Fitr on the 1st of Shawwal, a day of joy, gratitude, and community. Before the Eid prayer, every Muslim must give Zakat al-Fitr — a small charity to ensure that the poor can also celebrate.
                </p>
              </div>
            </ContentCard>

            <SourcesCard sources={[
              { ref: "Quran 2:183-187", desc: "The verses prescribing fasting and its rules" },
              { ref: "Quran 2:185", desc: "The month of Ramadan and the revelation of the Quran" },
              { ref: "Quran 97:1-5", desc: "Surah Al-Qadr: the Night of Decree" },
              { ref: "Bukhari 1:6", desc: "The Prophet's generosity in Ramadan; Jibreel reviewing the Quran with him every night" },
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
                    <span className="text-gold font-semibold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-themed mb-1">{item.point}</h3>
                    <p className="text-themed-muted text-sm leading-relaxed">{item.detail}</p>
                    <p className="text-xs text-gold/60 mt-2"><HadithRefText text={item.reference} /></p>
                  </div>
                </div>
              </ContentCard>
            ))}

            {/* Closing verse */}
            <ContentCard delay={0.35}>
              <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg)" }}>
                <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
                  وَأَن تَصُومُوا خَيْرٌۭ لَّكُمْ ۖ إِن كُنتُمْ تَعْلَمُونَ
                </p>
                <p className="text-themed text-sm italic">
                  &ldquo;And to fast is better for you, if you only knew.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 2:184</p>
              </div>
            </ContentCard>

            <SourcesCard delay={0.4} sources={[
              { ref: "Bukhari 30:8; Muslim 13:211", desc: "Gates of Paradise opened, Hellfire closed, devils chained" },
              { ref: "Bukhari 30:4; Muslim 13:212", desc: "Fasting as a shield; hadith qudsi on fasting's reward" },
              { ref: "Bukhari 2:31; Muslim 6:209", desc: "Previous sins forgiven for fasting and praying in Ramadan" },
              { ref: "Bukhari 30:6", desc: "The gate Ar-Rayyan, reserved for those who fast" },
              { ref: "Tirmidhi 8:85", desc: "The two joys of the fasting person" },
              { ref: "Bukhari 30:13", desc: "Whoever does not give up forged speech and evil actions" },
              { ref: "Ibn Majah 7:115", desc: "The fasting person's supplication is not turned back" },
              { ref: "Bukhari 32:4", desc: "Seeking Laylatul Qadr in the last ten nights" },
              { ref: "Bukhari 1:6", desc: "Jibreel reviewing the Quran with the Prophet" },
              { ref: "Quran 2:183-185", desc: "The obligation of fasting and its virtues" },
              { ref: "Quran 97:1-5", desc: "Laylatul Qadr is better than a thousand months" },
            ]} />
          </motion.div>
        )}

        {/* ─── Fasting Guide ─── */}
        {activeSection === "fasting" && (
          <motion.div
            key="fasting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills (horizontal scroll on mobile) */}
              <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                {fastingTopics.filter(topicMatches).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveFasting(topic.id);
                        syncUrl("fasting", topic.id);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-left ${
                        activeFasting === topic.id
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
                  {fastingTopics.filter(topicMatches).map(
                    (topic) =>
                      activeFasting === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <FastingInfoCard topic={topic} />
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const t = fastingTopics.filter(topicMatches).find((topic) => topic.id === activeFasting);
              if (!t) return null;
              const rows = [...topicSourceRefs(t), ...(extraSourceRows[t.id] ?? [])];
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
          </motion.div>
        )}

        {/* ─── Worship in Ramadan ─── */}
        {activeSection === "worship" && (
          <motion.div
            key="worship"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills (horizontal scroll on mobile) */}
              <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                {worshipTopics.filter(topicMatches).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveWorship(topic.id);
                        syncUrl("worship", topic.id);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-left ${
                        activeWorship === topic.id
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
                  {worshipTopics.filter(topicMatches).map(
                    (topic) =>
                      activeWorship === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <FastingInfoCard topic={topic} />
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const t = worshipTopics.filter(topicMatches).find((topic) => topic.id === activeWorship);
              if (!t) return null;
              const rows = [...topicSourceRefs(t), ...(extraSourceRows[t.id] ?? [])];
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
          </motion.div>
        )}

        {/* ─── Last 10 Nights & Eid ─── */}
        {activeSection === "last-ten" && (
          <motion.div
            key="last-ten"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills (horizontal scroll on mobile) */}
              <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                {lastTenTopics.filter(topicMatches).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveLastTen(topic.id);
                        syncUrl("last-ten", topic.id);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-left ${
                        activeLastTen === topic.id
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
                  {lastTenTopics.filter(topicMatches).map(
                    (topic) =>
                      activeLastTen === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <LastTenInfoCard topic={topic} />
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const t = lastTenTopics.filter(topicMatches).find((topic) => topic.id === activeLastTen);
              if (!t) return null;
              const rows = [...topicSourceRefs(t), ...(extraSourceRows[t.id] ?? [])];
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RamadanPage() {
  return <Suspense><RamadanContent /></Suspense>;
}
