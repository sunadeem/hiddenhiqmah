"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import { BookOpen } from "lucide-react";

/* ───────────────────────── data ───────────────────────── */

const whyItMatters = [
  {
    point: "The gates of Paradise are opened",
    detail:
      "The Prophet (peace be upon him) said: 'When Ramadan begins, the gates of Paradise are opened, the gates of Hellfire are closed, and the devils are chained.'",
    reference: "Sahih al-Bukhari 1899; Sahih Muslim 1079",
  },
  {
    point: "Fasting is a shield from the Hellfire",
    detail:
      "The Prophet (peace be upon him) said: 'Fasting is a shield. When any one of you is fasting, let him not speak indecently or act ignorantly. If someone fights him or insults him, let him say: I am fasting.'",
    reference: "Sahih al-Bukhari 1904; Sahih Muslim 1151",
  },
  {
    point: "Previous sins are forgiven",
    detail:
      "The Prophet (peace be upon him) said: 'Whoever fasts Ramadan out of sincere faith and seeking reward, his previous sins will be forgiven.' He also said the same about standing in prayer during Ramadan and during Laylatul Qadr.",
    reference: "Sahih al-Bukhari 38; Sahih Muslim 760",
  },
  {
    point: "The Quran was revealed in this month",
    detail:
      "Allah chose Ramadan as the month in which He sent down the Quran — the final revelation and guidance for all of humanity. Jibreel would review the Quran with the Prophet every Ramadan.",
    reference: "Quran 2:185; Sahih al-Bukhari 4998",
  },
  {
    point: "It contains a night better than a thousand months",
    detail:
      "Laylatul Qadr (the Night of Decree) falls within the last ten nights of Ramadan. Worship on this single night is better than worshipping for over 83 years. The angels descend with every decree.",
    reference: "Quran 97:1-5; Sahih al-Bukhari 2014",
  },
  {
    point: "The reward of fasting is with Allah alone",
    detail:
      "In a hadith qudsi, Allah says: 'Every deed of the son of Adam is for him, except fasting — it is for Me, and I shall reward it.' The reward is so immense that only Allah knows its extent.",
    reference: "Sahih al-Bukhari 1904; Sahih Muslim 1151",
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
          note: "Hadith: 'There is no fast for the one who does not intend to fast from the night before.' — Sunan an-Nasa'i 2331; Sunan Abu Dawud 2454",
        },
        {
          title: "Suhoor (Pre-dawn Meal)",
          detail:
            "Eating suhoor is a blessed sunnah and should be taken as close to Fajr as possible. The Prophet (peace be upon him) said: 'Eat suhoor, for in suhoor there is blessing.'",
          note: "Sahih al-Bukhari 1923; Sahih Muslim 1095",
        },
        {
          title: "Iftar (Breaking the Fast)",
          detail:
            "The fast should be broken as soon as Maghrib enters, without delay. The Prophet (peace be upon him) said: 'The people will remain upon goodness as long as they hasten to break the fast.' It is sunnah to break the fast with fresh dates, and if not available, then with water.",
          note: "Sahih al-Bukhari 1957; Sunan Abu Dawud 2356; Sunan at-Tirmidhi 696",
        },
        {
          title: "Du'a at Iftar",
          detail:
            "The Prophet (peace be upon him) would say upon breaking his fast: 'Dhahaba adh-dhama'u wabtallatil-'urooqu wa thabatal-ajru in sha Allah' — The thirst has gone, the veins have been moistened, and the reward is assured, if Allah wills. Another widely recited du'a is: 'Allahumma inni laka sumtu wa bika aamantu wa 'alaika tawakkaltu wa 'ala rizqika aftartu' — O Allah, I fasted for You, believed in You, placed my trust in You, and broke my fast with Your provision. This version is from Abu Dawud 2358 but is graded da'if (weak); the first du'a above is the stronger narration.",
          note: "Sunan Abu Dawud 2357 (graded hasan); Sunan Abu Dawud 2358 (graded da'if — widely recited but weak chain)",
        },
        {
          title: "Timing",
          detail:
            "The fast begins at true dawn (when the white thread of dawn becomes distinct from the black thread of night) and ends at sunset. This is confirmed in the Quran: 'Eat and drink until the white thread of dawn becomes distinct from the black thread.' The exact times vary by location and season.",
          note: "Quran 2:187",
        },
      ],
      source: "Quran 2:183-187; Sahih al-Bukhari 1923, 1957; Sahih Muslim 1095",
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
          note: "Sahih al-Bukhari 1933; Sahih Muslim 1155",
        },
        {
          title: "Sexual intercourse",
          detail:
            "Intimacy during fasting hours invalidates the fast and requires both qada (making up the day) and kaffarah (expiation): freeing a slave, or fasting 60 consecutive days, or feeding 60 poor people.",
          note: "Sahih al-Bukhari 1936; Sahih Muslim 1111",
        },
        {
          title: "Deliberate vomiting",
          detail:
            "Inducing vomit intentionally breaks the fast. If vomiting occurs involuntarily (e.g., due to illness), the fast remains valid.",
          note: "Sunan Abu Dawud 2380; Sunan at-Tirmidhi 720",
        },
        {
          title: "Menstruation or post-natal bleeding",
          detail:
            "The onset of menstruation or post-natal bleeding (nifas) at any point during the day invalidates the fast. The days must be made up after Ramadan. Women are not permitted to fast during these periods.",
          note: "Sahih al-Bukhari 1951",
        },
        {
          title: "Cupping / blood extraction (scholarly difference)",
          detail:
            "Some scholars hold that cupping (hijama) breaks the fast based on the hadith: 'The one who cups and the one who is cupped have both broken their fast.' Others, including the Hanafi and Shafi'i schools, consider this hadith abrogated and say cupping does not break the fast. Blood tests and donations that extract a small amount are generally considered permissible.",
          note: "Sunan Abu Dawud 2367; differed upon — see Fiqh us-Sunnah",
        },
      ],
      source: "Sahih al-Bukhari 1933, 1936; Sahih Muslim 1111, 1155; Sunan Abu Dawud 2380",
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
          note: "Sahih al-Bukhari 1933; Sahih Muslim 1155",
        },
        {
          title: "Rinsing the mouth and nose (without exaggeration)",
          detail:
            "Rinsing the mouth and nose during wudu is permissible, but the fasting person should not exaggerate (i.e., sniff water deep into the nose or gargle excessively).",
          note: "Sunan Abu Dawud 2366; Sunan an-Nasa'i 87",
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
          note: "Sahih al-Bukhari 887 (general miswak encouragement)",
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
      source: "Sahih al-Bukhari 1933; Sahih Muslim 1155; Sunan Abu Dawud 2366",
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
          note: "Quran 2:184-185; Sahih Muslim 1113",
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
          note: "Quran 2:184; reported from Ibn Abbas — Sahih al-Bukhari 4505",
        },
        {
          title: "Pregnant and breastfeeding women",
          detail:
            "If a pregnant or breastfeeding woman fears harm to herself or her child, she may break the fast. Scholars differ on whether she must only make up the days (Hanafi view) or also pay fidyah (Shafi'i/Hanbali view, if the fear was only for the child).",
          note: "Sunan Abu Dawud 2317; Sunan at-Tirmidhi 715; Sunan an-Nasa'i 2274",
        },
        {
          title: "Children (pre-puberty)",
          detail:
            "Fasting is not obligatory on children who have not reached puberty. However, parents are encouraged to gradually introduce them to fasting so they are accustomed to it when it becomes obligatory.",
          note: "Sahih al-Bukhari 1960 (companions would have their children fast)",
        },
        {
          title: "Menstruating women and post-natal bleeding",
          detail:
            "Women experiencing menstruation or post-natal bleeding (nifas) are prohibited from fasting during those days. They must make up the missed days after Ramadan. Aisha said: 'We were commanded to make up the fasts but not the prayers.'",
          note: "Sahih al-Bukhari 1951; Sahih Muslim 335",
        },
      ],
      source: "Quran 2:184-185; Sahih al-Bukhari 1951, 4505; Sahih Muslim 335, 1113",
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
          note: "Quran 2:185; Sahih Muslim 1146 (Aisha making up fasts in Sha'ban)",
        },
        {
          title: "Fidyah (Compensation for Inability)",
          detail:
            "For those permanently unable to fast (chronic illness, extreme old age), fidyah must be paid: feeding one poor person for each day missed. This is typically the cost of one meal per day. It cannot substitute for qada if the person is able to fast later.",
          note: "Quran 2:184; Ibn Abbas' interpretation — Sahih al-Bukhari 4505",
        },
        {
          title: "Kaffarah (Expiation for Intentional Violation)",
          detail:
            "If a person deliberately breaks the fast during Ramadan without a valid excuse (specifically by eating, drinking, or sexual intercourse), kaffarah is required in addition to making up the day. The kaffarah is, in order: freeing a slave (no longer applicable), fasting 60 consecutive days, or feeding 60 poor people.",
          note: "Sahih al-Bukhari 1936; Sahih Muslim 1111",
        },
        {
          title: "Delaying Make-Up Past the Next Ramadan",
          detail:
            "Scholars agree that make-up fasts should ideally be completed before the next Ramadan. If delayed without a valid reason, some scholars (Shafi'i, Hanbali, Maliki) say fidyah must also be paid in addition to making up the days. The Hanafi school does not require the additional fidyah but considers the delay sinful if without excuse.",
        },
      ],
      source: "Quran 2:184-185; Sahih al-Bukhari 1936, 4505; Sahih Muslim 1111, 1146",
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
          note: "Sahih al-Bukhari 2017; Sahih Muslim 1169",
        },
        {
          title: "Signs of the night",
          detail:
            "The Prophet (peace be upon him) described it as a calm, serene night — neither too hot nor too cold. Some narrations mention that the sun rises the next morning without strong rays (appearing pale). However, these signs are recognized after the fact — the point is to worship every odd night.",
          note: "Sahih Muslim 762; reported in Ibn Khuzaymah",
        },
        {
          title: "The best du'a for this night",
          detail:
            "Aisha asked the Prophet: 'If I know which night is Laylatul Qadr, what should I say?' He replied: 'Say: Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'anni — O Allah, You are the Pardoner, You love to pardon, so pardon me.'",
          note: "Sunan at-Tirmidhi 3513; Sunan Ibn Majah 3850",
        },
        {
          title: "What to do",
          detail:
            "Spend the night in prayer (qiyam al-layl), recitation of the Quran, dhikr, du'a, and seeking forgiveness. The Prophet (peace be upon him) said: 'Whoever stands in prayer on Laylatul Qadr out of faith and seeking reward, his previous sins will be forgiven.'",
          note: "Sahih al-Bukhari 1901; Sahih Muslim 760",
        },
      ],
      source: "Quran 97:1-5; Sahih al-Bukhari 1901, 2017; Sahih Muslim 760, 762, 1169; Sunan at-Tirmidhi 3513",
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
          note: "Sahih al-Bukhari 2025; Sahih Muslim 1172",
        },
        {
          title: "Rules during i'tikaf",
          detail:
            "The person should remain in the masjid and only leave for necessities (bathroom, wudu, eating if food cannot be brought in). They should not leave without a valid reason. They may speak to visitors and attend to basic needs, but the focus should remain on worship.",
          note: "Sahih al-Bukhari 2029; Sahih Muslim 297 (Aisha would comb the Prophet's hair while he was in i'tikaf)",
        },
        {
          title: "Who can do it?",
          detail:
            "I'tikaf is for both men and women. Women may perform i'tikaf in the masjid or, according to some scholars (Hanafi), in a designated prayer area at home. The key conditions are: being Muslim, sane, and having the intention of i'tikaf.",
          note: "Sahih al-Bukhari 2033 (the Prophet's wives performed i'tikaf)",
        },
      ],
      source: "Sahih al-Bukhari 2025, 2029, 2033; Sahih Muslim 297, 1172",
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
          note: "Sahih al-Bukhari 1503; Sahih Muslim 984",
        },
        {
          title: "How much?",
          detail:
            "The amount is one sa' (approximately 2.5-3 kg) of the staple food of the land — dates, barley, wheat, rice, or similar. In monetary terms, many scholars permit paying the equivalent cash value, which varies by region (commonly $10-15 per person in Western countries). The Hanafi school specifically permits cash payment.",
          note: "Sahih al-Bukhari 1506, 1507; Sahih Muslim 985",
        },
        {
          title: "When to pay it?",
          detail:
            "It should be paid before the Eid prayer. The Prophet (peace be upon him) commanded that it be given before people go out to the Eid prayer. It can be given a day or two before Eid. If paid after the Eid prayer, it counts as regular charity, not Zakat al-Fitr.",
          note: "Sahih al-Bukhari 1509; Sunan Abu Dawud 1609",
        },
        {
          title: "Its purpose",
          detail:
            "Ibn Abbas said: 'The Messenger of Allah prescribed Zakat al-Fitr as a purification for the fasting person from idle talk and obscenity, and as food for the poor.' It ensures that every Muslim — rich or poor — can celebrate Eid with dignity.",
          note: "Sunan Abu Dawud 1609; Sunan Ibn Majah 1827",
        },
      ],
      source: "Sahih al-Bukhari 1503, 1506, 1509; Sahih Muslim 984, 985; Sunan Abu Dawud 1609",
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
          note: "Sahih al-Bukhari 956, 986",
        },
        {
          title: "Sunnahs of Eid al-Fitr",
          detail:
            "Eat something (preferably dates) before going to the Eid prayer. Perform ghusl and wear your best clothes. Say the takbirat of Eid from Maghrib on the last night of Ramadan until the Eid prayer: 'Allahu Akbar, Allahu Akbar, la ilaha illallah, Allahu Akbar, Allahu Akbar, wa lillahil-hamd.'",
          note: "Sahih al-Bukhari 953; Quran 2:185 (basis for takbir)",
        },
        {
          title: "It is forbidden to fast on Eid",
          detail:
            "Fasting on the day of Eid al-Fitr is strictly prohibited. It is a day of celebration and gratitude, not a day of fasting. The Prophet (peace be upon him) explicitly forbade fasting on the two Eid days.",
          note: "Sahih al-Bukhari 1991; Sahih Muslim 1137",
        },
        {
          title: "Celebrate and connect",
          detail:
            "Eid is a time to visit family, exchange gifts, feed others, and spread joy. The Prophet (peace be upon him) said: 'Every nation has its celebration, and this is our celebration.' It is a communal celebration that strengthens the bonds of the ummah.",
          note: "Sahih al-Bukhari 952",
        },
      ],
      source: "Sahih al-Bukhari 952, 953, 956, 1991; Sahih Muslim 1137",
    },
  },
];

const sections = [
  { key: "intro", label: "What is Ramadan?" },
  { key: "importance", label: "Why It Matters" },
  { key: "fasting", label: "Fasting Guide" },
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
                <p className="text-xs text-gold/60 mt-2">{point.note}</p>
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
            <p className="text-xs text-themed-muted mt-2">{topic.content.verse.ref}</p>
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
    </>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function RamadanPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("intro");
  const [activeFasting, setActiveFasting] = useState("basics");
  const [activeLastTen, setActiveLastTen] = useState("laylatul-qadr");

  return (
    <div>
      <PageHeader
        title="Ramadan"
        titleAr="رمضان"
        subtitle="The blessed month of fasting, Quran, and spiritual renewal"
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
            <ContentCard>
              <div className="text-center py-6">
                <p className="text-xs text-themed-muted mb-3 uppercase tracking-wider">
                  The Quran
                </p>
                <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose mb-4">
                  شَهْرُ رَمَضَانَ ٱلَّذِىٓ أُنزِلَ فِيهِ ٱلْقُرْءَانُ هُدًۭى لِّلنَّاسِ وَبَيِّنَـٰتٍۢ مِّنَ ٱلْهُدَىٰ وَٱلْفُرْقَانِ
                </p>
                <p className="text-themed-muted italic mb-2 max-w-2xl mx-auto">
                  &ldquo;The month of Ramadan in which the Quran was revealed, a guidance for mankind and clear proofs of guidance and criterion.&rdquo;
                </p>
                <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Quran 2:185
                </span>
              </div>
            </ContentCard>

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
                  But Ramadan is far more than abstaining from food. It is a month of intensified worship — extra prayers (Tarawih), recitation of the Quran (many Muslims complete the entire Quran during this month), charity, and supplication. The Prophet (peace be upon him) was described as being &ldquo;more generous than the blowing wind&rdquo; during Ramadan (Sahih al-Bukhari 6, Sahih Muslim 2308).
                </p>
                <p>
                  The month begins and ends with the sighting of the crescent moon (hilal). Because the Islamic calendar is lunar, Ramadan shifts approximately 10-11 days earlier each solar year, meaning it cycles through all seasons over a 33-year period. This ensures that the experience of fasting — whether in long summer days or short winter ones — is shared equally across generations and geographies.
                </p>
                <p>
                  Ramadan culminates in the celebration of Eid al-Fitr on the 1st of Shawwal, a day of joy, gratitude, and community. Before the Eid prayer, every Muslim must give Zakat al-Fitr — a small charity to ensure that the poor can also celebrate.
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
                  "Quran 2:183-187 — The verses prescribing fasting and its rules",
                  "Quran 2:185 — The month of Ramadan and the revelation of the Quran",
                  "Quran 97:1-5 — Surah Al-Qadr: the Night of Decree",
                  "Sahih al-Bukhari 6 — The Prophet's generosity in Ramadan",
                  "Sahih al-Bukhari 4998 — Jibreel reviewing the Quran with the Prophet every Ramadan",
                ].map((source) => (
                  <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
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
                  يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ
                </p>
                <p className="text-themed-muted italic">
                  &ldquo;O you who have believed, decreed upon you is fasting as it was decreed upon those before you, that you may become righteous.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 2:183</p>
              </div>
            </ContentCard>

            {/* Numbered points */}
            {whyItMatters.map((item, i) => (
              <ContentCard key={i} delay={0.05 + i * 0.05}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold font-semibold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-themed mb-1">{item.point}</h3>
                    <p className="text-themed-muted text-sm leading-relaxed">{item.detail}</p>
                    <p className="text-xs text-gold/60 mt-2">{item.reference}</p>
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

            {/* Sources */}
            <ContentCard delay={0.4}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Sahih al-Bukhari 1899; Sahih Muslim 1079 — Gates of Paradise opened, Hellfire closed, devils chained",
                  "Sahih al-Bukhari 1904; Sahih Muslim 1151 — Fasting as a shield; hadith qudsi on fasting's reward",
                  "Sahih al-Bukhari 38; Sahih Muslim 760 — Previous sins forgiven for fasting and praying in Ramadan",
                  "Sahih al-Bukhari 2014 — Seeking Laylatul Qadr in the last ten nights",
                  "Sahih al-Bukhari 4998 — Jibreel reviewing the Quran with the Prophet",
                  "Quran 2:183-185 — The obligation of fasting and its virtues",
                  "Quran 97:1-5 — Laylatul Qadr is better than a thousand months",
                ].map((source) => (
                  <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    {source}
                  </li>
                ))}
              </ul>
            </ContentCard>
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
            <div className="flex gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex flex-col gap-2 shrink-0">
                {fastingTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setActiveFasting(topic.id)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
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
                  {fastingTopics.map(
                    (topic) =>
                      activeFasting === topic.id && (
                        <motion.div
                          key={topic.id}
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

            {/* Sources */}
            <ContentCard delay={0.3} className="mt-8">
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Quran 2:183-187 — The obligation of fasting, its timing, and exemptions",
                  "Sahih al-Bukhari 1904; Sahih Muslim 1151 — Fasting as a shield; conduct while fasting",
                  "Sahih al-Bukhari 1923; Sahih Muslim 1095 — Blessing of suhoor",
                  "Sahih al-Bukhari 1933; Sahih Muslim 1155 — Eating out of forgetfulness does not break the fast",
                  "Sahih al-Bukhari 1936; Sahih Muslim 1111 — Kaffarah for intentionally breaking the fast",
                  "Sahih al-Bukhari 1951; Sahih Muslim 335 — Women making up missed fasts",
                  "Sahih al-Bukhari 1957 — Hastening to break the fast",
                  "Sahih al-Bukhari 4505 — Ibn Abbas on fidyah for the elderly",
                  "Sunan Abu Dawud 2380; Sunan at-Tirmidhi 720 — Ruling on deliberate vomiting",
                  "Sunan an-Nasa'i 2331; Sunan Abu Dawud 2454 — Intention for fasting",
                  "Fiqh us-Sunnah by Sayyid Sabiq — General fasting rulings and scholarly differences",
                ].map((source) => (
                  <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    {source}
                  </li>
                ))}
              </ul>
            </ContentCard>
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
            <div className="flex gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex flex-col gap-2 shrink-0">
                {lastTenTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setActiveLastTen(topic.id)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
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
                  {lastTenTopics.map(
                    (topic) =>
                      activeLastTen === topic.id && (
                        <motion.div
                          key={topic.id}
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

            {/* Sources */}
            <ContentCard delay={0.3} className="mt-8">
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Quran 97:1-5 — Surah Al-Qadr: Laylatul Qadr is better than a thousand months",
                  "Quran 2:185 — Basis for the takbirat of Eid",
                  "Sahih al-Bukhari 1901; Sahih Muslim 760 — Sins forgiven for standing in prayer on Laylatul Qadr",
                  "Sahih al-Bukhari 2017; Sahih Muslim 1169 — Seek Laylatul Qadr in the odd nights of the last ten",
                  "Sahih al-Bukhari 2025; Sahih Muslim 1172 — The Prophet's i'tikaf in the last ten days",
                  "Sahih al-Bukhari 1503, 1506; Sahih Muslim 984, 985 — Zakat al-Fitr obligation and amount",
                  "Sahih al-Bukhari 953, 956 — Sunnahs of the Eid prayer",
                  "Sahih al-Bukhari 1991; Sahih Muslim 1137 — Prohibition of fasting on the day of Eid",
                  "Sunan at-Tirmidhi 3513; Sunan Ibn Majah 3850 — The du'a for Laylatul Qadr",
                  "Sunan Abu Dawud 1609; Sunan Ibn Majah 1827 — Purpose and timing of Zakat al-Fitr",
                ].map((source) => (
                  <li key={source} className="text-xs text-themed-muted leading-relaxed flex items-start gap-2">
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
