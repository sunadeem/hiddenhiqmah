"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import { textMatch } from "@/lib/search";
import ContentCard from "@/components/ContentCard";
import { BookOpen, Calendar } from "lucide-react";
import HadithRefText from "@/components/HadithRefText";

/* ───────────────────────── data ───────────────────────── */

type Month = {
  id: number;
  name: string;
  nameAr: string;
  meaning: string;
  sacred: boolean;
  intro: string;
  points: { title: string; detail: string; note?: string }[];
};

const months: Month[] = [
  {
    id: 1,
    name: "Muharram",
    nameAr: "مُحَرَّم",
    meaning: "The Sacred / The Forbidden",
    sacred: true,
    intro:
      "Muharram is the first month of the Islamic calendar and one of the four sacred months in which fighting is forbidden. The Prophet (peace be upon him) called it 'the month of Allah' and encouraged fasting in it.",
    points: [
      {
        title: "The best fasting after Ramadan",
        detail:
          "The Prophet (peace be upon him) said: 'The best fasting after the month of Ramadan is fasting in the month of Allah — al-Muharram.'",
        note: "Muslim 13:261",
      },
      {
        title: "The Day of Ashura (10th Muharram)",
        detail:
          "Fasting on the 10th of Muharram expiates the sins of the previous year. The Prophet (peace be upon him) fasted it and said: 'I hope that Allah will expiate the sins of the year before it.' He also intended to fast the 9th alongside it to differ from the People of the Book.",
        note: "Muslim 13:259; Muslim 13:137",
      },
      {
        title: "Ashura and Musa (peace be upon him)",
        detail:
          "When the Prophet (peace be upon him) came to Madinah, he found the Jews fasting on Ashura. They said: 'This is the day on which Allah saved Musa and his people, and drowned Pharaoh and his people.' The Prophet said: 'We have more right to Musa than you,' and he fasted it.",
        note: "Bukhari 30:109; Muslim 13:137",
      },
    ],
  },
  {
    id: 2,
    name: "Safar",
    nameAr: "صَفَر",
    meaning: "The Empty / The Void",
    sacred: false,
    intro:
      "Safar is the second month of the Islamic calendar. Its name may come from the emptying of houses as the Arabs would leave for travel or battle. The pre-Islamic Arabs considered it an unlucky month, which Islam rejected.",
    points: [
      {
        title: "No bad omen in Safar",
        detail:
          "The Prophet (peace be upon him) said: 'There is no contagion, no evil omen, no haamah (a pre-Islamic superstition about owls), and no Safar (superstition about the month).' Islam rejects the pre-Islamic belief that Safar brings misfortune.",
        note: "Bukhari 76:27; Muslim 16:70",
      },
      {
        title: "The Hijrah journey",
        detail:
          "The Prophet (peace be upon him) and Abu Bakr departed from Makkah on the Hijrah during the month of Safar (or late Muharram), arriving in Madinah in Rabi al-Awwal. This journey marks the beginning of the Islamic calendar.",
        note: "Bukhari 63:131",
      },
    ],
  },
  {
    id: 3,
    name: "Rabi al-Awwal",
    nameAr: "رَبِيع الأَوَّل",
    meaning: "The First Spring",
    sacred: false,
    intro:
      "Rabi al-Awwal is the third month. It is best known as the month in which the Prophet Muhammad (peace be upon him) was born, and also the month in which he passed away and in which the Hijrah to Madinah was completed.",
    points: [
      {
        title: "Birth of the Prophet (peace be upon him)",
        detail:
          "The majority of scholars agree that the Prophet (peace be upon him) was born on a Monday in Rabi al-Awwal. When asked about fasting on Monday, he said: 'That is the day on which I was born, the day on which I was sent, and the day on which revelation came to me.'",
        note: "Muslim 13:259",
      },
      {
        title: "The Prophet's arrival in Madinah",
        detail:
          "The Prophet (peace be upon him) arrived in Madinah during Rabi al-Awwal, completing the Hijrah. Upon arrival, he built Masjid Quba — the first mosque in Islam — and then proceeded to establish Masjid an-Nabawi.",
        note: "Bukhari 63:131",
      },
      {
        title: "The Prophet's death",
        detail:
          "The Prophet (peace be upon him) also passed away on Monday, 12th Rabi al-Awwal, 11 AH. Anas ibn Malik said: 'The day the Prophet entered Madinah, everything was bright, and the day he died, everything became dark.'",
        note: "Tirmidhi 49:14; graded Sahih",
      },
    ],
  },
  {
    id: 4,
    name: "Rabi al-Thani",
    nameAr: "رَبِيع الثَّانِي",
    meaning: "The Second Spring",
    sacred: false,
    intro:
      "Rabi al-Thani is the fourth month of the Islamic calendar, also called Rabi al-Akhir. There are no specific acts of worship or major events uniquely associated with this month in the authenticated Sunnah.",
    points: [
      {
        title: "A time for continued worship",
        detail:
          "While no specific acts of worship are designated for this month, the general encouragement of voluntary fasting, prayer, and dhikr applies throughout the year. The Prophet (peace be upon him) said: 'The most beloved deeds to Allah are the most consistent, even if small.'",
        note: "Bukhari 30:46",
      },
    ],
  },
  {
    id: 5,
    name: "Jumada al-Ula",
    nameAr: "جُمَادَى الأُولَى",
    meaning: "The First Dry / Frozen",
    sacred: false,
    intro:
      "Jumada al-Ula is the fifth month. Its name comes from 'jamad' (to freeze), as it originally fell in winter when the month was first named. There are no specific acts of worship tied to this month in the Sunnah.",
    points: [
      {
        title: "Birth of Fatimah (may Allah be pleased with her)",
        detail:
          "Some historians place the birth of Fatimah, the daughter of the Prophet (peace be upon him), in this month, approximately five years before prophethood. She is the mother of al-Hasan and al-Husayn, and the Prophet said: 'Fatimah is the leader of the women of Paradise.'",
        note: "Bukhari 61:129",
      },
    ],
  },
  {
    id: 6,
    name: "Jumada al-Thani",
    nameAr: "جُمَادَى الثَّانِيَة",
    meaning: "The Second Dry / Frozen",
    sacred: false,
    intro:
      "Jumada al-Thani (also called Jumada al-Akhirah) is the sixth month. Like its predecessor, there are no specific acts of worship uniquely tied to this month in the authenticated sources.",
    points: [
      {
        title: "Death of Abu Talib",
        detail:
          "Abu Talib, the uncle of the Prophet (peace be upon him) who protected him for decades, is reported by some historians to have died in this month (though others say Shawwal) in the 10th year of prophethood — the 'Year of Sorrow' (Am al-Huzn).",
        note: "Bukhari 23:113; Muslim 1:39",
      },
    ],
  },
  {
    id: 7,
    name: "Rajab",
    nameAr: "رَجَب",
    meaning: "The Revered / The Respected",
    sacred: true,
    intro:
      "Rajab is the seventh month and one of the four sacred months. Its name comes from 'tarjib' (to honor/revere). It stands alone as the only sacred month not adjacent to the others. The Prophet's Night Journey (al-Isra wal-Mi'raj) is traditionally placed in this month.",
    points: [
      {
        title: "One of the four sacred months",
        detail:
          "Rajab is singled out as a sacred month. It is called 'Rajab al-Fard' (the solitary Rajab) because it stands alone, separated from the other three sacred months (Dhul Qi'dah, Dhul Hijjah, and Muharram) which are consecutive.",
        note: "Bukhari 65:184; Muslim 13:261",
      },
      {
        title: "Al-Isra wal-Mi'raj",
        detail:
          "The Night Journey and Ascension — when the Prophet (peace be upon him) was taken from Masjid al-Haram to Masjid al-Aqsa, and then ascended through the heavens — is traditionally placed on the 27th of Rajab, though the exact date is not confirmed in the Sunnah. During this journey, the five daily prayers were prescribed.",
        note: "Bukhari 63:112; Muslim 1:321",
      },
      {
        title: "No specific fasting authenticated",
        detail:
          "There is no authentic hadith that singles out Rajab for special fasting. Ibn Hajar said: 'There is no authentic hadith that is fit to be used as evidence that speaks of the virtue of fasting in Rajab specifically.' The general virtues of fasting in the sacred months apply.",
        note: "Tabyin al-Ajab, Ibn Hajar; Abu Dawud 14:116",
      },
    ],
  },
  {
    id: 8,
    name: "Sha'ban",
    nameAr: "شَعْبَان",
    meaning: "The Scattered / The Branching",
    sacred: false,
    intro:
      "Sha'ban is the eighth month, named because the Arab tribes would 'scatter' (tasha'aba) in search of water. It falls between Rajab and Ramadan, and the Prophet (peace be upon him) used to fast extensively in it.",
    points: [
      {
        title: "The Prophet fasted most of Sha'ban",
        detail:
          "A'ishah (may Allah be pleased with her) said: 'I never saw the Prophet fast a complete month except Ramadan, and I never saw him fast more in any month than he did in Sha'ban.' He fasted most of Sha'ban.",
        note: "Bukhari 30:76; Muslim 13:229",
      },
      {
        title: "Deeds are raised to Allah",
        detail:
          "The Prophet (peace be upon him) said: 'That is a month to which people do not pay attention, between Rajab and Ramadan. It is a month in which deeds are raised to the Lord of the worlds, and I like for my deeds to be raised while I am fasting.'",
        note: "Nasai 22:268; graded Hasan",
      },
      {
        title: "Do not fast in the second half to prepare for Ramadan",
        detail:
          "The Prophet (peace be upon him) said: 'When the first half of Sha'ban is over, do not fast.' This is to preserve strength for Ramadan. However, one who has a regular fasting habit (like Monday/Thursday) may continue it.",
        note: "Abu Dawud 14:25; Tirmidhi 8:57",
      },
    ],
  },
  {
    id: 9,
    name: "Ramadan",
    nameAr: "رَمَضَان",
    meaning: "The Scorching / The Burning",
    sacred: false,
    intro:
      "Ramadan is the ninth month and the holiest month in the Islamic calendar. Fasting during Ramadan is the fourth pillar of Islam. It is the month in which the Quran was revealed, and it contains Laylatul Qadr — a night better than a thousand months.",
    points: [
      {
        title: "Fasting is obligatory",
        detail:
          "Allah says: 'O you who believe, fasting has been prescribed for you as it was prescribed for those before you, so that you may attain taqwa.' Fasting from true dawn to sunset is required for every sane, adult Muslim who is able.",
        note: "Quran 2:183",
      },
      {
        title: "The month the Quran was revealed",
        detail:
          "Allah says: 'The month of Ramadan in which the Quran was revealed — a guidance for the people and clear proofs of guidance and criterion.' The Prophet (peace be upon him) and Jibreel would review the Quran together every Ramadan.",
        note: "Quran 2:185; Bukhari 91:10",
      },
      {
        title: "Laylatul Qadr — better than a thousand months",
        detail:
          "The Night of Decree falls in the odd nights of the last ten days. Allah says: 'The Night of Decree is better than a thousand months. The angels and the Spirit descend therein by permission of their Lord for every matter. Peace it is until the emergence of dawn.'",
        note: "Quran 97:1-5; Bukhari 32:1",
      },
      {
        title: "The gates of Paradise are opened",
        detail:
          "The Prophet (peace be upon him) said: 'When Ramadan begins, the gates of Paradise are opened, the gates of Hellfire are closed, and the devils are chained.'",
        note: "Bukhari 30:9; Muslim 13:173",
      },
    ],
  },
  {
    id: 10,
    name: "Shawwal",
    nameAr: "شَوَّال",
    meaning: "The Raising / The Lifting",
    sacred: false,
    intro:
      "Shawwal is the tenth month, beginning with Eid al-Fitr — the celebration marking the end of Ramadan. Fasting six days of Shawwal after Ramadan carries an immense reward.",
    points: [
      {
        title: "Eid al-Fitr (1st Shawwal)",
        detail:
          "The first day of Shawwal is Eid al-Fitr, the day of celebration after Ramadan. It is forbidden to fast on this day. The Prophet (peace be upon him) would eat an odd number of dates before going to the Eid prayer.",
        note: "Bukhari 30:5",
      },
      {
        title: "Fasting six days equals fasting the whole year",
        detail:
          "The Prophet (peace be upon him) said: 'Whoever fasts Ramadan and then follows it with six days of Shawwal, it will be as if he fasted the entire year.' (Ramadan = 10 months reward, 6 days = 2 months reward = 12 months total.)",
        note: "Muslim 6:168",
      },
      {
        title: "The Battle of Uhud",
        detail:
          "The Battle of Uhud took place on the 7th of Shawwal, 3 AH. Seventy companions were martyred, including Hamzah ibn Abdil-Muttalib, the uncle of the Prophet (peace be upon him).",
        note: "Bukhari 64:90",
      },
    ],
  },
  {
    id: 11,
    name: "Dhul Qi'dah",
    nameAr: "ذُو القَعْدَة",
    meaning: "The Month of Sitting / Truce",
    sacred: true,
    intro:
      "Dhul Qi'dah is the eleventh month and one of the four sacred months. Its name means 'the month of sitting' because the Arabs would sit (refrain) from fighting. It is the month preceding the Hajj season.",
    points: [
      {
        title: "One of the four sacred months",
        detail:
          "Dhul Qi'dah is the first of the three consecutive sacred months (Dhul Qi'dah, Dhul Hijjah, and Muharram). Fighting was prohibited during these months, and the Arabs would observe a truce to allow safe travel for pilgrimage.",
        note: "Quran 9:36; Bukhari 65:184",
      },
      {
        title: "The Prophet's Umrahs",
        detail:
          "The Prophet (peace be upon him) performed all four of his Umrahs in Dhul Qi'dah. Ibn Abbas said: 'He performed Umrah four times, all of them in Dhul Qi'dah except the one he performed with his Hajj.'",
        note: "Bukhari 27:5; Muslim 15:90",
      },
    ],
  },
  {
    id: 12,
    name: "Dhul Hijjah",
    nameAr: "ذُو الحِجَّة",
    meaning: "The Month of Hajj",
    sacred: true,
    intro:
      "Dhul Hijjah is the twelfth and final month of the Islamic calendar. It is the month of Hajj — the fifth pillar of Islam — and contains the best days of the entire year: the first ten days.",
    points: [
      {
        title: "The first ten days are the best days of the year",
        detail:
          "The Prophet (peace be upon him) said: 'There are no days on which righteous deeds are more beloved to Allah than these ten days.' The companions asked: 'Not even jihad for the sake of Allah?' He said: 'Not even jihad, except for a man who goes out with his self and his wealth and returns with neither.'",
        note: "Bukhari 30:18",
      },
      {
        title: "The Day of Arafah (9th Dhul Hijjah)",
        detail:
          "The Prophet (peace be upon him) said: 'Fasting the Day of Arafah, I hope from Allah that it will expiate the sins of the year before it and the year after it.' For those not performing Hajj, it is the most recommended day to fast in the entire year.",
        note: "Muslim 13:259",
      },
      {
        title: "Eid al-Adha (10th Dhul Hijjah)",
        detail:
          "The Day of Sacrifice, the greatest day in the Islamic calendar. The Prophet (peace be upon him) said: 'The greatest day in the sight of Allah is the Day of Sacrifice.' Muslims offer an animal sacrifice (udhiyah) commemorating Ibrahim's willingness to sacrifice his son.",
        note: "Abu Dawud 11:45; Bukhari 73:9",
      },
      {
        title: "The days of Tashriq (11th-13th)",
        detail:
          "The Prophet (peace be upon him) said: 'The days of Tashriq are days of eating, drinking, and remembering Allah.' Fasting is forbidden on these days. The takbirat (Allahu Akbar) continue to be recited after every prayer.",
        note: "Muslim 13:147",
      },
      {
        title: "Hajj — the fifth pillar of Islam",
        detail:
          "The rites of Hajj take place on the 8th-12th of Dhul Hijjah. The Prophet (peace be upon him) said: 'An accepted Hajj has no reward except Paradise.' Over two million Muslims gather at Makkah annually to fulfill this pillar.",
        note: "Bukhari 19:1; Muslim 15:186",
      },
    ],
  },
];

const keyDates = [
  { date: "1 Muharram", event: "Islamic New Year", note: "Beginning of the Hijri calendar year" },
  { date: "10 Muharram", event: "Day of Ashura", note: "Recommended fast — expiates previous year's sins (Muslim 13:259)" },
  { date: "12 Rabi al-Awwal", event: "Birth of the Prophet (peace be upon him)", note: "Widely accepted date; he was born on a Monday" },
  { date: "27 Rajab", event: "Al-Isra wal-Mi'raj", note: "Traditional date of the Night Journey (exact date not confirmed in Sunnah)" },
  { date: "15 Sha'ban", event: "Mid-Sha'ban", note: "Some scholars note its virtue; no specific authenticated acts of worship for this night" },
  { date: "1 Ramadan", event: "Beginning of Ramadan", note: "Start of the obligatory fast" },
  { date: "Last 10 nights", event: "Laylatul Qadr", note: "Sought in the odd nights of the last ten days of Ramadan (Bukhari 32:1)" },
  { date: "1 Shawwal", event: "Eid al-Fitr", note: "Celebration after Ramadan — fasting is prohibited" },
  { date: "1-10 Dhul Hijjah", event: "Best days of the year", note: "Good deeds are most beloved to Allah in these days (Bukhari 32:4)" },
  { date: "9 Dhul Hijjah", event: "Day of Arafah", note: "Fasting expiates sins of two years (Muslim 13:259)" },
  { date: "10 Dhul Hijjah", event: "Eid al-Adha", note: "The Day of Sacrifice — the greatest day of the year" },
  { date: "11-13 Dhul Hijjah", event: "Days of Tashriq", note: "Days of eating, drinking, and dhikr — fasting prohibited (Muslim 13:147)" },
];

const sections = [
  { key: "overview", label: "Overview" },
  { key: "months", label: "The 12 Months" },
  { key: "sacred", label: "Sacred Months" },
  { key: "dates", label: "Key Dates" },
  { key: "converter", label: "Date Converter" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── page ───────────────────────── */

function IslamicCalendarContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "overview");
  const [search, setSearch] = useState("");
  const [expandedMonth, setExpandedMonth] = useState<number | null>(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const filteredMonths = useMemo(
    () =>
      search
        ? months.filter(
            (m) =>
              textMatch(m.name, search) ||
              textMatch(m.nameAr, search) ||
              textMatch(m.meaning, search) ||
              textMatch(m.intro, search) ||
              m.points.some(
                (p) => textMatch(p.title, search) || textMatch(p.detail, search)
              )
          )
        : months,
    [search]
  );

  const filteredKeyDates = useMemo(
    () =>
      search
        ? keyDates.filter(
            (d) =>
              textMatch(d.date, search) ||
              textMatch(d.event, search) ||
              textMatch(d.note, search)
          )
        : keyDates,
    [search]
  );

  const todayHijri = useMemo(() => {
    try {
      const now = new Date();
      const en = new Intl.DateTimeFormat("en-US", {
        calendar: "islamic-umalqura",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now);
      const ar = new Intl.DateTimeFormat("ar-SA", {
        calendar: "islamic-umalqura",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now);
      return { en, ar };
    } catch {
      return null;
    }
  }, []);

  const hijriResult = useMemo(() => {
    try {
      const date = new Date(selectedDate + "T12:00:00"); // noon to avoid timezone issues
      if (isNaN(date.getTime())) return null;

      const dayFormatter = new Intl.DateTimeFormat("en-US", {
        calendar: "islamic-umalqura",
        day: "numeric",
      });
      const monthFormatter = new Intl.DateTimeFormat("en-US", {
        calendar: "islamic-umalqura",
        month: "long",
      });
      const yearFormatter = new Intl.DateTimeFormat("en-US", {
        calendar: "islamic-umalqura",
        year: "numeric",
      });
      const fullFormatterAr = new Intl.DateTimeFormat("ar-SA", {
        calendar: "islamic-umalqura",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
      });

      return {
        day: dayFormatter.format(date),
        month: monthFormatter.format(date),
        year: yearFormatter.format(date).replace(/\s*AH$/, ""),
        arabic: fullFormatterAr.format(date),
        weekday: weekdayFormatter.format(date),
        gregorian: new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(date),
      };
    } catch {
      return null;
    }
  }, [selectedDate]);

  return (
    <div>
      <PageHeader
        title="Islamic Calendar"
        titleAr="التقويم الهجري"
        subtitle="The twelve months of the Hijri calendar and their significance."
        action={
          todayHijri ? (
            <div className="text-right">
              <p className="text-xs text-themed-muted uppercase tracking-wider mb-1.5">Today</p>
              <p className="text-lg font-arabic text-gold leading-relaxed">{todayHijri.ar}</p>
              <p className="text-sm text-themed-muted mt-1">{todayHijri.en}</p>
            </div>
          ) : undefined
        }
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search months, events, dates..." className="mb-6" />

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
        {/* ─── Overview ─── */}
        {activeSection === "overview" && (
          <motion.div
            key="overview"
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
                  إِنَّ عِدَّةَ ٱلشُّهُورِ عِندَ ٱللَّهِ ٱثْنَا عَشَرَ شَهْرًۭا فِى كِتَـٰبِ ٱللَّهِ يَوْمَ خَلَقَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ مِنْهَآ أَرْبَعَةٌ حُرُمٌۭ
                </p>
                <p className="text-themed-muted italic mb-2 max-w-2xl mx-auto">
                  &ldquo;Indeed, the number of months with Allah is twelve months in the register of Allah from the day He created the heavens and the earth; of these, four are sacred.&rdquo;
                </p>
                <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Quran 9:36
                </span>
              </div>
            </ContentCard>

            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                What is the Hijri Calendar?
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">The Hijri calendar</span> (التقويم الهجري) is the Islamic lunar calendar used to determine the dates of religious observances, fasting, Hajj, and the two Eids. It was established by the Caliph Umar ibn al-Khattab (may Allah be pleased with him), who set the starting point at the Hijrah — the Prophet&apos;s migration from Makkah to Madinah in 622 CE.
                </p>
                <p>
                  The calendar consists of <span className="text-themed font-medium">12 lunar months</span>, each beginning with the sighting of the new crescent moon (hilal). A lunar month is either 29 or 30 days, making the Hijri year approximately 354 days — about 11 days shorter than the Gregorian solar year. This means Islamic dates shift through the seasons over a 33-year cycle.
                </p>
                <p>
                  Of these twelve months, <span className="text-themed font-medium">four are sacred</span> (al-ashhur al-hurum): Muharram, Rajab, Dhul Qi&apos;dah, and Dhul Hijjah. Allah says: <em>&ldquo;So do not wrong yourselves during them.&rdquo;</em> (Quran 9:36). Fighting was prohibited in these months, and sins committed during them carry greater weight.
                </p>
                <p>
                  The Prophet (peace be upon him) explained their arrangement in his Farewell Sermon: <em>&ldquo;Time has come back to its original state, the way it was when Allah created the heavens and the earth. The year is twelve months, of which four are sacred: three consecutive — Dhul Qi&apos;dah, Dhul Hijjah, and Muharram — and Rajab of Mudar, which comes between Jumada and Sha&apos;ban.&rdquo;</em>
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
                  "Quran 9:36 — Twelve months ordained by Allah, four sacred",
                  "Quran 2:185, 2:189 — Ramadan and the crescent moons",
                  "Bukhari 65:184; Muslim 13:261 — The four sacred months named by the Prophet",
                  "Bukhari 63:131 — The Hijrah and the establishment of the calendar",
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

        {/* ─── The 12 Months ─── */}
        {activeSection === "months" && (
          <motion.div
            key="months"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Month grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredMonths.map((month, i) => {
                const isExpanded = expandedMonth === month.id;
                return (
                  <ContentCard key={month.id} delay={0.02 + i * 0.015} id={`section-${month.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                    <button
                      onClick={() =>
                        setExpandedMonth(isExpanded ? null : month.id)
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            month.sacred
                              ? "bg-gold/15 border-gold/30"
                              : "bg-gold/10 border-gold/20"
                          }`}
                        >
                          <span className="text-gold font-semibold text-xs">
                            {month.id}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3
                            className={`font-semibold text-sm leading-tight ${
                              isExpanded ? "text-gold" : "text-themed"
                            }`}
                          >
                            {month.name}
                          </h3>
                          <p className="text-gold/70 font-arabic text-xs mt-0.5">
                            {month.nameAr}
                          </p>
                          {month.sacred && (
                            <span className="inline-block mt-1 text-[9px] text-gold bg-gold/10 border border-gold/20 rounded-full px-1.5 py-0.5 leading-none">
                              Sacred
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </ContentCard>
                );
              })}
            </div>

            {/* Expanded month detail */}
            <AnimatePresence mode="wait">
              {expandedMonth && (() => {
                const month = months.find((m) => m.id === expandedMonth)!;
                return (
                  <motion.div
                    key={month.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ContentCard>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-xl font-semibold text-themed">
                            {month.name}
                          </h2>
                          <span className="text-gold/70 font-arabic">
                            {month.nameAr}
                          </span>
                          {month.sacred && (
                            <span className="text-[10px] text-gold bg-gold/10 border border-gold/20 rounded-full px-2 py-0.5">
                              Sacred
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setExpandedMonth(null)}
                          className="text-themed-muted hover:text-themed text-lg px-2"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-themed-muted text-xs mb-1">
                        {month.meaning}
                      </p>
                      <p className="text-themed-muted text-sm leading-relaxed mb-4">
                        {month.intro}
                      </p>
                      <div className="space-y-3">
                        {month.points.map((point) => (
                          <div
                            key={point.title}
                            className="rounded-lg p-3 border sidebar-border"
                            style={{
                              backgroundColor: "var(--color-bg)",
                            }}
                          >
                            <h4 className="text-sm font-semibold text-themed mb-1.5">
                              {point.title}
                            </h4>
                            <p className="text-themed-muted text-sm leading-relaxed">
                              {point.detail}
                            </p>
                            {point.note && (
                              <p className="text-xs text-gold/60 mt-2">
                                <HadithRefText text={point.note} />
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </ContentCard>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── Sacred Months ─── */}
        {activeSection === "sacred" && (
          <motion.div
            key="sacred"
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
                <p className="text-xl md:text-2xl font-arabic text-gold leading-loose mb-4">
                  ذَٰلِكَ ٱلدِّينُ ٱلْقَيِّمُ ۚ فَلَا تَظْلِمُوا۟ فِيهِنَّ أَنفُسَكُمْ
                </p>
                <p className="text-themed-muted italic mb-2 max-w-2xl mx-auto">
                  &ldquo;That is the correct religion, so do not wrong yourselves during them.&rdquo;
                </p>
                <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Quran 9:36
                </span>
              </div>
            </ContentCard>

            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                The Four Sacred Months
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  Allah designated four months as sacred (حُرُم) from the day He created the heavens and the earth. During these months, sins are graver and good deeds are more rewarding. The Arabs, even before Islam, honored these months by ceasing warfare to allow safe travel and trade.
                </p>
                <p>
                  The Prophet (peace be upon him) identified them in his Farewell Sermon: <em>&ldquo;Three consecutive — Dhul Qi&apos;dah, Dhul Hijjah, and Muharram — and Rajab of Mudar, which comes between Jumada and Sha&apos;ban.&rdquo;</em>
                </p>
              </div>
            </ContentCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMonths
                .filter((m) => m.sacred)
                .map((month, i) => (
                  <ContentCard key={month.id} delay={0.15 + i * 0.05}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                        <span className="text-gold font-semibold text-sm">
                          {month.id}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-semibold text-themed">
                            {month.name}
                          </h3>
                          <span className="text-gold/70 font-arabic text-sm">
                            {month.nameAr}
                          </span>
                        </div>
                        <p className="text-themed-muted text-sm mt-1 leading-relaxed">
                          {month.id === 1 &&
                            "The month of Allah. Best fasting after Ramadan. Contains the Day of Ashura."}
                          {month.id === 7 &&
                            "The solitary sacred month. Stands alone between Jumada and Sha'ban."}
                          {month.id === 11 &&
                            "First of three consecutive sacred months. The month of the Prophet's Umrahs."}
                          {month.id === 12 &&
                            "The month of Hajj. Contains the best days and the greatest day of the year."}
                        </p>
                      </div>
                    </div>
                  </ContentCard>
                ))}
            </div>

            <ContentCard delay={0.4}>
              <h3 className="text-base font-semibold text-themed mb-3">
                What does &ldquo;sacred&rdquo; mean?
              </h3>
              <div className="space-y-3">
                {[
                  {
                    title: "Sins are graver",
                    detail:
                      "Ibn Kathir explained: 'Sins committed during the sacred months are worse and more serious than at other times.' The command 'do not wrong yourselves during them' (Quran 9:36) indicates heightened accountability.",
                    note: "Tafsir Ibn Kathir on Quran 9:36",
                  },
                  {
                    title: "Good deeds are more rewarding",
                    detail:
                      "Just as sins are graver, righteous deeds carry greater reward during these months. The Prophet (peace be upon him) encouraged fasting in the sacred months: 'Fast some days of the sacred months, and leave some days.'",
                    note: "Abu Dawud 14:116",
                  },
                  {
                    title: "Fighting was prohibited",
                    detail:
                      "Allah says: 'They ask you about fighting in the sacred month. Say: Fighting therein is a great sin.' This prohibition was recognized even by the pre-Islamic Arabs, and Islam affirmed it.",
                    note: "Quran 2:217",
                  },
                ].map((point) => (
                  <div
                    key={point.title}
                    className="rounded-lg p-3 border sidebar-border"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <h4 className="text-sm font-semibold text-themed mb-1.5">
                      {point.title}
                    </h4>
                    <p className="text-themed-muted text-sm leading-relaxed">
                      {point.detail}
                    </p>
                    <p className="text-xs text-gold/60 mt-2"><HadithRefText text={point.note} /></p>
                  </div>
                ))}
              </div>
            </ContentCard>

            {/* Sources */}
            <ContentCard delay={0.5}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Quran 2:217 — Fighting in the sacred month is a great sin",
                  "Quran 9:36 — Four sacred months ordained by Allah",
                  "Bukhari 65:184; Muslim 13:261 — The Prophet named the four sacred months",
                  "Abu Dawud 14:116 — Fasting in the sacred months",
                  "Tafsir Ibn Kathir — Sins are graver during sacred months",
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

        {/* ─── Key Dates ─── */}
        {activeSection === "dates" && (
          <motion.div
            key="dates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard>
              <h2 className="text-xl font-semibold text-themed mb-4">
                Important Dates in the Islamic Year
              </h2>
              <p className="text-themed-muted text-sm leading-relaxed">
                These are the key dates and occasions throughout the Hijri year that carry special religious significance — whether for fasting, celebration, or heightened worship.
              </p>
            </ContentCard>

            <div className="space-y-2">
              {filteredKeyDates.map((item, i) => (
                <ContentCard key={item.event} delay={0.03 + i * 0.02} id={`section-${item.event.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-20 shrink-0">
                      <span className="text-xs text-gold font-medium bg-gold/10 border border-gold/20 rounded-lg px-2 py-1 inline-block">
                        {item.date}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-themed text-sm">
                        {item.event}
                      </h3>
                      <p className="text-themed-muted text-xs mt-0.5 leading-relaxed">
                        <HadithRefText text={item.note} />
                      </p>
                    </div>
                  </div>
                </ContentCard>
              ))}
            </div>

            {/* Sources */}
            <ContentCard delay={0.4}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Quran 2:183, 2:185 — Fasting prescribed in Ramadan",
                  "Quran 97:1-5 — Laylatul Qadr better than a thousand months",
                  "Bukhari 30:5, 32:1 — Eid, best ten days, Ashura, Laylatul Qadr",
                  "Muslim 13:173, 5:4 — Ramadan, Ashura, Arafah, six days of Shawwal, Tashriq",
                  "Abu Dawud 11:45 — The Day of Sacrifice is the greatest day",
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
        {/* ─── Date Converter ─── */}
        {activeSection === "converter" && (
          <motion.div
            key="converter"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard>
              <h2 className="text-xl font-semibold text-themed mb-2">
                Gregorian to Hijri Converter
              </h2>
              <p className="text-themed-muted text-sm leading-relaxed">
                Select a Gregorian date to see its corresponding Hijri (Islamic) date. This uses the Umm al-Qura calendar system used in Saudi Arabia.
              </p>
            </ContentCard>

            <ContentCard delay={0.1}>
              <div className="flex flex-col items-center gap-6">
                {/* Date input */}
                <div className="w-full max-w-xs">
                  <label className="block text-xs text-themed-muted mb-2 uppercase tracking-wider text-center">
                    Select Gregorian Date
                  </label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60 pointer-events-none"
                    />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border sidebar-border text-themed text-sm focus:outline-none focus:border-gold/50 transition-colors"
                      style={{ backgroundColor: "var(--color-bg)" }}
                    />
                  </div>
                </div>

                {/* Result */}
                {hijriResult && (
                  <div className="w-full text-center">
                    {/* Gregorian */}
                    <p className="text-themed-muted text-sm mb-4">
                      {hijriResult.weekday}, {hijriResult.gregorian.replace(hijriResult.weekday + ", ", "")}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="h-px flex-1 max-w-[80px] bg-gold/20" />
                      <span className="text-gold text-lg">↓</span>
                      <div className="h-px flex-1 max-w-[80px] bg-gold/20" />
                    </div>

                    {/* Hijri date display */}
                    <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6">
                      <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose mb-2">
                        {hijriResult.arabic}
                      </p>
                      <p className="text-themed text-lg font-semibold">
                        {hijriResult.day} {hijriResult.month}, {hijriResult.year} AH
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick date buttons */}
                <div className="w-full">
                  <p className="text-xs text-themed-muted mb-2 text-center uppercase tracking-wider">
                    Quick Select
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { label: "Today", getDate: () => new Date() },
                      {
                        label: "Tomorrow",
                        getDate: () => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          return d;
                        },
                      },
                      {
                        label: "Next Week",
                        getDate: () => {
                          const d = new Date();
                          d.setDate(d.getDate() + 7);
                          return d;
                        },
                      },
                      {
                        label: "Next Month",
                        getDate: () => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 1);
                          return d;
                        },
                      },
                    ].map((btn) => {
                      const btnDate = btn.getDate().toISOString().split("T")[0];
                      const isActive = selectedDate === btnDate;
                      return (
                      <button
                        key={btn.label}
                        onClick={() => setSelectedDate(btnDate)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border active:scale-95 transition-all cursor-pointer ${
                          isActive
                            ? "border-gold/40 bg-gold/20 text-gold"
                            : "sidebar-border text-themed-muted hover:text-gold hover:border-gold/30"
                        }`}
                      >
                        {btn.label}
                      </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ContentCard>

            <ContentCard delay={0.2}>
              <h3 className="text-base font-semibold text-themed mb-3">
                About the Hijri Calendar
              </h3>
              <div className="space-y-2 text-themed-muted text-sm leading-relaxed">
                <p>
                  The Islamic (Hijri) calendar is a <span className="text-themed font-medium">purely lunar calendar</span> of 354 or 355 days. Each month begins with the sighting of the new crescent moon, making it approximately 11 days shorter than the Gregorian solar year.
                </p>
                <p>
                  This converter uses the <span className="text-themed font-medium">Umm al-Qura</span> calendar — the official calendar of Saudi Arabia — which is a computational approximation. Actual Islamic dates in your region may differ by 1-2 days depending on local moon sighting.
                </p>
              </div>
            </ContentCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IslamicCalendarPage() {
  return <Suspense><IslamicCalendarContent /></Suspense>;
}
