"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import BookmarkButton from "@hidden-hiqmah/ui/components/BookmarkButton";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import { useIsNative } from "@/lib/mobile/platform";
import DailyScreen from "@/components/mobile/screens/DailyScreen";
import { useDailyAdapter } from "@/lib/daily/useDailyAdapter";
import { useChecklist } from "@hidden-hiqmah/ui/lib/daily/useChecklist";
import {
  mondayOf,
  todayLocalDate,
  type DailyAdapter,
  type DayRollup,
} from "@hidden-hiqmah/ui/lib/daily/types";
import { Checklist } from "@hidden-hiqmah/ui/components/daily/Checklist";
import { ChecklistEditor } from "@hidden-hiqmah/ui/components/daily/ChecklistEditor";
import { StreakBadges } from "@hidden-hiqmah/ui/components/daily/StreakBadges";
import { StreakWeekStrip } from "@hidden-hiqmah/ui/components/daily/StreakWeekStrip";
import { StreakCalendar } from "@hidden-hiqmah/ui/components/daily/StreakCalendar";
import { Skeleton } from "@hidden-hiqmah/ui/components/Skeleton";
import {
  BookOpen,
  Sun,
  CloudSun,
  Moon,
  BedDouble,
  CheckSquare,
  Heart,
  Flame,
  Star,
  UtensilsCrossed,
  HandHeart,
  DoorOpen,
  Shirt,
  MessageCircle,
  Bed,
  Hourglass,
  Skull,
  Landmark,
  Scale,
  Sparkles,
  HeartHandshake,
  Pencil,
  Wind,
  Stethoscope,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════════════════ */

// Canonical tab keys, shared with the native DailyScreen. "remember" is
// accepted as a legacy alias for "reminders" in old ?tab= deep links.
type MainTab = "worship" | "sunnah" | "checklist" | "reminders";

export function resolveMainTab(param: string | null): MainTab | null {
  const key = param === "remember" ? "reminders" : param;
  if (key === "worship" || key === "sunnah" || key === "checklist" || key === "reminders")
    return key;
  return null;
}
type WorshipSub = "morning" | "afternoon" | "evening" | "sleep" | "midnight";
export type SunnahSub = "eating" | "greeting" | "entering" | "dress" | "speech" | "sleeping" | "sneezing" | "sick";
type RememberSub = "dunya" | "death" | "grave" | "judgement" | "paradise" | "mercy";

const mainTabs: { key: MainTab; label: string; icon: React.ReactNode; highlight?: boolean }[] = [
  { key: "worship", label: "Worship", icon: <BookOpen size={16} /> },
  { key: "sunnah", label: "Sunnah Acts", icon: <Heart size={16} /> },
  { key: "reminders", label: "Reminders", icon: <Flame size={16} /> },
  { key: "checklist", label: "Daily Checklist", icon: <CheckSquare size={16} />, highlight: true },
];

const worshipSubs: { key: WorshipSub; label: string; icon: React.ReactNode }[] = [
  { key: "morning", label: "Morning", icon: <Sun size={16} /> },
  { key: "afternoon", label: "Afternoon", icon: <CloudSun size={16} /> },
  { key: "evening", label: "Evening", icon: <Moon size={16} /> },
  { key: "sleep", label: "Before Sleep", icon: <BedDouble size={16} /> },
  { key: "midnight", label: "Midnight", icon: <Star size={16} /> },
];

export const sunnahSubs: { key: SunnahSub; label: string; icon: React.ReactNode }[] = [
  { key: "eating", label: "Eating & Drinking", icon: <UtensilsCrossed size={16} /> },
  { key: "greeting", label: "Greeting", icon: <HandHeart size={16} /> },
  { key: "entering", label: "Entering & Leaving", icon: <DoorOpen size={16} /> },
  { key: "dress", label: "Dress & Appearance", icon: <Shirt size={16} /> },
  { key: "speech", label: "Speech & Conduct", icon: <MessageCircle size={16} /> },
  { key: "sleeping", label: "Sleeping", icon: <Bed size={16} /> },
  { key: "sneezing", label: "Sneezing & Yawning", icon: <Wind size={16} /> },
  { key: "sick", label: "Visiting the Sick", icon: <Stethoscope size={16} /> },
];

const rememberSubs: { key: RememberSub; label: string; icon: React.ReactNode }[] = [
  { key: "dunya", label: "Dunya is Temporary", icon: <Hourglass size={16} /> },
  { key: "death", label: "Death is Near", icon: <Skull size={16} /> },
  { key: "grave", label: "The Grave", icon: <Landmark size={16} /> },
  { key: "judgement", label: "Day of Judgement", icon: <Scale size={16} /> },
  { key: "paradise", label: "Paradise Awaits", icon: <Sparkles size={16} /> },
  { key: "mercy", label: "Hope & Mercy", icon: <HeartHandshake size={16} /> },
];

/* ═══════════════════════════════════════════════════════════════════
   SEARCH INDEX — one entry per (tab, sub) view. PageSearch filters the
   rails by label + keywords and jumps to the first matching view.
   ═══════════════════════════════════════════════════════════════════ */

const searchIndex: { tab: MainTab; sub: string; label: string; keywords: string[] }[] = [
  { tab: "worship", sub: "morning", label: "Morning", keywords: ["fajr", "wake", "waking", "morning adhkar", "duha", "ishraq", "quran time", "ayat al-kursi", "sunrise", "tasbeeh"] },
  { tab: "worship", sub: "afternoon", label: "Afternoon", keywords: ["dhuhr", "asr", "midday", "dhikr", "charity", "sadaqah", "jumuah", "friday", "kahf", "salawat", "knowledge", "work", "hour of acceptance", "friday hour"] },
  { tab: "worship", sub: "evening", label: "Evening", keywords: ["maghrib", "isha", "witr", "evening adhkar", "sayyid al-istighfar", "family time", "sunset", "al-baqarah", "houses graves"] },
  { tab: "worship", sub: "sleep", label: "Before Sleep", keywords: ["sleep", "bed", "bedtime", "wudu", "ayat al-kursi", "muhasabah", "reflection", "istighfar", "three quls", "baqarah", "bad dream", "nightmare", "waking at night", "tahajjud"] },
  { tab: "worship", sub: "midnight", label: "Midnight", keywords: ["tahajjud", "night prayer", "qiyam", "last third", "witr", "suhoor", "istighfar", "descends", "feet swelled", "grateful servant", "how to wake"] },
  { tab: "sunnah", sub: "eating", label: "Eating & Drinking", keywords: ["bismillah", "food", "drink", "eat", "right hand", "standing", "meal", "praise", "dua after eating", "three breaths", "stomach thirds", "eat together", "never criticized"] },
  { tab: "sunnah", sub: "greeting", label: "Greeting", keywords: ["salam", "greet", "greeting", "peace", "young", "old", "spread salam", "handshake", "musafahah", "six rights", "rights of a muslim"] },
  { tab: "sunnah", sub: "entering", label: "Entering & Leaving", keywords: ["home", "mosque", "enter", "entering", "leave", "leaving", "shoes", "dua", "bathroom", "toilet", "washroom", "ghufranak", "istinja", "qiblah", "leaving home"] },
  { tab: "sunnah", sub: "dress", label: "Dress & Appearance", keywords: ["clothes", "dress", "miswak", "fitrah", "grooming", "nails", "right side", "new garment", "new clothes", "thawb"] },
  { tab: "sunnah", sub: "speech", label: "Speech & Conduct", keywords: ["speak", "speech", "silence", "silent", "backbite", "backbiting", "truthfulness", "gossip", "anger", "angry", "do not become angry", "smile", "smiling", "tongue"] },
  { tab: "sunnah", sub: "sleeping", label: "Sleeping", keywords: ["sleep", "sleeping", "right side", "wudu", "bed", "stomach", "prone", "al-kafirun"] },
  { tab: "sunnah", sub: "sneezing", label: "Sneezing & Yawning", keywords: ["sneeze", "sneezing", "yawn", "yawning", "alhamdulillah", "yarhamukallah", "tashmit", "cover mouth"] },
  { tab: "sunnah", sub: "sick", label: "Visiting the Sick", keywords: ["sick", "ill", "visit", "visiting", "patient", "iyadah", "seventy thousand angels", "dua for the sick", "shifa"] },
  { tab: "reminders", sub: "dunya", label: "Dunya is Temporary", keywords: ["world", "dunya", "stranger", "traveler", "amusement", "temporary"] },
  { tab: "reminders", sub: "death", label: "Death is Near", keywords: ["death", "die", "dies", "five before five", "destroyer of pleasures", "youth"] },
  { tab: "reminders", sub: "grave", label: "The Grave", keywords: ["grave", "hereafter", "deeds remain", "first stage"] },
  { tab: "reminders", sub: "judgement", label: "Day of Judgement", keywords: ["judgement", "judgment", "qiyamah", "atom", "account", "reckoning", "asked"] },
  { tab: "reminders", sub: "paradise", label: "Paradise Awaits", keywords: ["paradise", "jannah", "reward", "garden", "radiant"] },
  { tab: "reminders", sub: "mercy", label: "Hope & Mercy", keywords: ["mercy", "forgive", "forgiveness", "despair", "hardship", "ease", "hope"] },
];

/* ═══════════════════════════════════════════════════════════════════
   HELPER: Reference line
   ═══════════════════════════════════════════════════════════════════ */

function Ref({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-gold/80 mt-2">
      <BookOpen size={12} className="shrink-0" />
      <HadithRefText text={text} className="leading-relaxed" />
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HELPER: Adhkar item
   ═══════════════════════════════════════════════════════════════════ */

function AdhkarItem({
  arabic,
  transliteration,
  translation,
  english,
  reference,
  note,
  delay = 0,
  children,
}: {
  arabic?: string;
  transliteration?: string;
  translation?: string;
  english: string;
  reference: string;
  note?: string;
  delay?: number;
  children?: React.ReactNode;
}) {
  return (
    <ContentCard delay={delay}>
      {arabic && <p className="font-arabic text-gold text-xl leading-loose mb-2">{arabic}</p>}
      {transliteration && (
        <p className="text-themed font-medium text-sm mb-1 italic">{transliteration}</p>
      )}
      {translation && (
        <p className="text-themed-muted text-sm leading-relaxed mb-1">&ldquo;{translation}&rdquo;</p>
      )}
      <p className="text-themed-muted text-sm leading-relaxed">{english}</p>
      {note && <p className="text-themed-muted/70 text-xs mt-2 italic">{note}</p>}
      <Ref text={reference} />
      {children}
    </ContentCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Morning
   ═══════════════════════════════════════════════════════════════════ */

function TimelineStep({
  time,
  title,
  isLast = false,
  delay = 0,
  children,
}: {
  time: string;
  title: string;
  isLast?: boolean;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex gap-4"
    >
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center pt-1">
        <div className="w-3 h-3 rounded-full border-2 border-gold bg-[#d4a84333] shrink-0" />
        {!isLast && <div className="w-[2px] flex-1 bg-gold/20 mt-1" />}
      </div>

      {/* Content */}
      <div className="pb-8 flex-1 min-w-0">
        <p className="text-xs text-gold font-medium uppercase tracking-wider mb-1">{time}</p>
        <h3 className="text-base font-semibold text-themed mb-3">{title}</h3>
        {children}
      </div>
    </motion.div>
  );
}

export function MorningTab() {
  return (
    <div>
      {/* Step 1: Upon Waking */}
      <TimelineStep time="Upon waking" title="Wake Up Sunnahs" delay={0.05}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-arabic text-gold text-lg leading-loose mb-2">
                الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور
              </p>
              <p className="text-themed font-medium text-sm mb-1 italic">
                Alhamdulillah alladhi ahyana ba&apos;da ma amatana wa ilayhi an-nushur
              </p>
              <p className="text-themed-muted text-sm leading-relaxed">
                All praise is for Allah who gave us life after death, and to Him is the resurrection.
              </p>
              <p className="text-themed-muted text-sm mt-3 leading-relaxed">
                Wipe face and eyes, use miswak / brush teeth, make wudu.
              </p>
              <Ref text="Bukhari 80:9" />
            </div>
            <BookmarkButton
              type="hadith"
              id="daily-waking-up"
              title="Waking Up Sunnahs"
              subtitle="Muslim Daily"
              href="/muslim-daily?tab=worship&sub=morning"
            />
          </div>
        </ContentCard>
      </TimelineStep>

      {/* Step 2: Fajr */}
      <TimelineStep time="Before dawn" title="Fajr Prayer" delay={0.1}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                &quot;The two rak&apos;ahs of Fajr are better than the world and everything in it.&quot;
              </p>
              <p className="text-themed-muted text-sm mt-2 leading-relaxed">
                <span className="text-gold font-medium">Sunnah:</span> 2 rak&apos;ahs before the fard prayer.
              </p>
              <Ref text="Muslim 6:118" />
              <Link
                href="/salah"
                className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2"
              >
                View Salah guide →
              </Link>
            </div>
            <BookmarkButton
              type="hadith"
              id="daily-fajr"
              title="Fajr Prayer"
              subtitle="Muslim Daily"
              href="/muslim-daily?tab=worship&sub=morning"
            />
          </div>
        </ContentCard>
      </TimelineStep>

      {/* Step 3: After Fajr — Adhkar */}
      <TimelineStep time="After Fajr" title="Morning Adhkar" delay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdhkarItem
            transliteration="Ayat al-Kursi (Quran 2:255)"
            english="Whoever recites it after every prayer — the only thing between him and Paradise is death (meaning paradise awaits him after death)."
            reference="Nasai, Sunan al-Kubra 9928"
            delay={0}
          >
            <Link href="/quran/2" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Read Surah Al-Baqarah →</Link>
          </AdhkarItem>
          <AdhkarItem
            english="Recite Surah Al-Ikhlas, Al-Falaq, and An-Nas three times each — &quot;Recite them three times in the morning and evening and they will suffice you against everything.&quot;"
            reference="Abu Dawud 43:310"
            delay={0}
          >
            <div className="flex gap-3 flex-wrap mt-2">
              <Link href="/quran/112" className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">Al-Ikhlas →</Link>
              <Link href="/quran/113" className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">Al-Falaq →</Link>
              <Link href="/quran/114" className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">An-Nas →</Link>
            </div>
          </AdhkarItem>
          <AdhkarItem
            arabic="سبحان الله (٣٣) · الحمد لله (٣٣) · الله أكبر (٣٣) · لا إله إلا الله..."
            transliteration="SubhanAllah 33x, Alhamdulillah 33x, Allahu Akbar 33x, then say: La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa ala kulli shay'in qadir"
            translation="Glory be to Allah (33x), All praise is due to Allah (33x), Allah is the Greatest (33x), then: There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He is over all things capable."
            english="Whoever says this after every prayer — his sins will be forgiven even if they are like the foam of the sea."
            reference="Muslim 5:188"
            delay={0}
          >
            <Link href="/dhikr" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Open Dhikr counter →</Link>
          </AdhkarItem>
          <AdhkarItem
            arabic="سبحان الله وبحمده"
            transliteration="SubhanAllahi wa bihamdihi — 100 times"
            translation="Glory be to Allah and all praise is due to Him."
            english="His sins will be forgiven even if they are like the foam of the sea."
            reference="Bukhari 80:100"
            delay={0}
          >
            <Link href="/dhikr" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Open Dhikr counter →</Link>
          </AdhkarItem>
          <AdhkarItem
            arabic="لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير"
            transliteration="La ilaha illallah, wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa ala kulli shay'in qadir — 10 times"
            translation="There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He is over all things capable."
            english="He will have the reward of freeing four slaves from the children of Isma'il."
            note="Said once in the morning it also earns ten good deeds, erases ten sins, raises you ten ranks, and guards you from Shaytan until evening."
            reference="Bukhari 80:98; Abu Dawud 43:305"
            delay={0}
          />
          <AdhkarItem
            arabic="اللّهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور"
            transliteration="Allahumma bika asbahna wa bika amsayna, wa bika nahya wa bika namutu, wa ilaykan-nushur"
            english="O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection."
            reference="Tirmidhi 48:22"
            delay={0}
          />
          <AdhkarItem
            arabic="أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ"
            transliteration="Asbahna wa asbahal-mulku lillah"
            translation="We have entered the morning and the whole dominion belongs to Allah."
            english="The source gives this short form for the morning and notes the Prophet ﷺ 'said likewise' the fuller evening supplication that begins Amsayna wa amsal-mulku lillah, wal-hamdu lillah."
            reference="Muslim 48:101"
            delay={0}
          />
          <AdhkarItem
            arabic="بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَىْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ"
            transliteration="Bismillahilladhi la yadurru ma'a-smihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim — 3 times"
            translation="In the name of Allah, with whose name nothing in the earth or the sky can cause harm, and He is the All-Hearing, the All-Knowing."
            english="Whoever says it three times in the morning and evening, nothing will harm him."
            reference="Ibn Majah 34:43"
            delay={0}
          />
          <AdhkarItem
            arabic="رَضِيتُ بِاللَّهِ رَبًّا وَبِالإِسْلاَمِ دِينًا وَبِمُحَمَّدٍ رَسُولاً"
            transliteration="Radeetu billahi rabban, wa bil-islami dinan, wa bi-Muhammadin rasula"
            translation="I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Messenger."
            english="Whoever says it in the morning and evening, Allah has promised to please him."
            reference="Abu Dawud 8:114; Abu Dawud 43:300"
            delay={0}
          />
          <AdhkarItem
            arabic="اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي لاَ إِلَهَ إِلاَّ أَنْتَ"
            transliteration="Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa Anta — 3 times"
            translation="O Allah, grant me well-being in my body; O Allah, grant me well-being in my hearing; O Allah, grant me well-being in my sight. There is no god but You."
            english="A supplication the Prophet ﷺ repeated three times each morning and evening."
            reference="Abu Dawud 43:318; Tirmidhi 48:111"
            delay={0}
          />
        </div>
      </TimelineStep>

      {/* Step 4: After Fajr — Quran */}
      <TimelineStep time="After Fajr" title="Quran Time" delay={0.2}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                The best time to read Quran is after Fajr — the angels witness the Fajr recitation.
              </p>
              <Ref text="Quran 17:78" />
              <Link
                href="/quran/17"
                className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2"
              >
                Read Surah Al-Isra →
              </Link>
            </div>
            <BookmarkButton
              type="hadith"
              id="daily-quran-time"
              title="Quran Time (after Fajr)"
              subtitle="Muslim Daily"
              href="/muslim-daily?tab=worship&sub=morning"
            />
          </div>
        </ContentCard>
      </TimelineStep>

      {/* Step 5: Mid-morning — Duha */}
      <TimelineStep time="After sunrise → before Dhuhr" title="Duha Prayer" isLast delay={0.25}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                <span className="text-gold font-medium">Time:</span> After sunrise (~20 min) until just before Dhuhr.
              </p>
              <p className="text-themed-muted text-sm mt-1 leading-relaxed">
                Minimum 2 rak&apos;ahs, up to 8.
              </p>
              <p className="text-themed-muted text-sm mt-2 leading-relaxed">
                &quot;In the morning, charity is due from every joint of your body. Every SubhanAllah is
                charity, every Alhamdulillah is charity... and two rak&apos;ahs of Duha suffice for all
                of that.&quot;
              </p>
              <Ref text="Muslim 6:101" />
            </div>
            <BookmarkButton
              type="hadith"
              id="daily-duha"
              title="Duha Prayer"
              subtitle="Muslim Daily"
              href="/muslim-daily?tab=worship&sub=morning"
            />
          </div>
        </ContentCard>
      </TimelineStep>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Afternoon
   ═══════════════════════════════════════════════════════════════════ */

export function AfternoonTab() {
  return (
    <div>
      <TimelineStep time="Midday" title="Dhuhr Prayer" delay={0.05}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                &quot;Whoever prays four rak&apos;ahs before Dhuhr and four after, Allah will forbid him from the Fire.&quot;
              </p>
              <p className="text-themed-muted text-sm mt-2 leading-relaxed">
                <span className="text-gold font-medium">Sunnah:</span> 4 rak&apos;ahs before Dhuhr, 2 after.
              </p>
              <Ref text="Tirmidhi 2:281" />
              <Link href="/salah" className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2">View Salah guide →</Link>
            </div>
            <BookmarkButton type="hadith" id="daily-dhuhr-asr" title="Dhuhr & Asr Prayers" subtitle="Muslim Daily" href="/muslim-daily?tab=worship&sub=afternoon" />
          </div>
        </ContentCard>
      </TimelineStep>

      <TimelineStep time="Between Dhuhr &amp; Asr" title="Midday Dhikr" delay={0.1}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                &quot;The best of dhikr is La ilaha illallah.&quot;
              </p>
              <Ref text="Tirmidhi 48:14" />
              <p className="text-themed-muted text-sm mt-2 leading-relaxed">
                Short dhikr sessions between prayers — even a few minutes.
              </p>
              <Link href="/dhikr" className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
                Open Dhikr counter →
              </Link>
            </div>
            <BookmarkButton type="hadith" id="daily-midday-dhikr" title="Midday Dhikr" subtitle="Muslim Daily" href="/muslim-daily?tab=worship&sub=afternoon" />
          </div>
        </ContentCard>
      </TimelineStep>

      <TimelineStep time="Between Dhuhr &amp; Asr" title="Dua for Knowledge &amp; Work" delay={0.15}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-arabic text-gold text-lg leading-loose mb-2">
                اللّهم إنّي أسألك علماً نافعاً ورزقاً طيّباً وعملاً متقبّلاً
              </p>
              <p className="text-themed font-medium text-sm mb-1 italic">
                Allahumma inni as&apos;aluka ilman nafi&apos;an, wa rizqan tayyiban, wa amalan mutaqabbalan
              </p>
              <p className="text-themed-muted text-sm leading-relaxed">
                O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.
              </p>
              <Ref text="Ibn Majah 5:123" />
              <Link href="/duas" className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Browse Duas →</Link>
            </div>
            <BookmarkButton type="hadith" id="daily-dua-knowledge" title="Dua for Knowledge & Work" subtitle="Muslim Daily" href="/muslim-daily?tab=worship&sub=afternoon" />
          </div>
        </ContentCard>
      </TimelineStep>

      <TimelineStep time="Late afternoon" title="Asr Prayer" delay={0.2}>
        <ContentCard delay={0}>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Guard strictly the prayers, especially the middle prayer (Asr).&quot;
          </p>
          <Ref text="Quran 2:238" />
          <Link href="/quran/2" className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Read Surah Al-Baqarah →</Link>
        </ContentCard>
      </TimelineStep>

      <TimelineStep time="Throughout the day" title="Good Deeds &amp; Charity" delay={0.25}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                &quot;Every act of kindness is charity.&quot; Even a smile, removing harm from the path, or a kind word.
              </p>
              <Ref text="Bukhari 78:52" />
              <p className="text-themed-muted text-sm mt-2 leading-relaxed">
                &quot;Charity does not decrease wealth.&quot;
              </p>
              <Ref text="Muslim 45:90" />
            </div>
            <BookmarkButton type="hadith" id="daily-charity" title="Good Deeds & Charity" subtitle="Muslim Daily" href="/muslim-daily?tab=worship&sub=afternoon" />
          </div>
        </ContentCard>
      </TimelineStep>

      <TimelineStep time="Friday special" title="Jumu&apos;ah Sunnahs" isLast delay={0.3}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <ul className="space-y-3 text-themed-muted text-sm leading-relaxed">
                <li>
                  <span className="text-gold font-medium">Ghusl:</span> Take a bath, wear best clothes, apply perfume.
                </li>
                <li>
                  <span className="text-gold font-medium">Surah Al-Kahf:</span> &quot;Whoever reads Surah Al-Kahf on Friday, a light will shine for him between the two Fridays.&quot;
                  <Ref text="Hakim Mustadrak 1:564" />
                  <Link href="/quran/18" className="inline-block mt-1 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Read Al-Kahf →</Link>
                </li>
                <li>
                  <span className="text-gold font-medium">Salawat:</span> Increase salawat on the Prophet &#xFDFA; — &quot;The best of your days is Friday, so increase your salawat upon me on that day.&quot;
                  <Ref text="Abu Dawud 8:116" />
                </li>
                <li>
                  <span className="text-gold font-medium">The hour of acceptance:</span> There is an hour on Friday in which no Muslim asks Allah for something while praying except that He gives it to him — many scholars locate it in the last hour before Maghrib.
                  <Ref text="Bukhari 11:59; Abu Dawud 2:659" />
                </li>
              </ul>
              <Link href="/salah?tab=prayers&sub=jumuah" className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Full Jumu&apos;ah guide →</Link>
            </div>
            <BookmarkButton type="hadith" id="daily-jumuah" title="Friday Special (Jumu'ah)" subtitle="Muslim Daily" href="/muslim-daily?tab=worship&sub=afternoon" />
          </div>
        </ContentCard>
      </TimelineStep>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Evening
   ═══════════════════════════════════════════════════════════════════ */

export function EveningTab() {
  return (
    <div>
      <TimelineStep time="Sunset" title="Maghrib Prayer" delay={0.05}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                Pray immediately when the time enters — Maghrib should not be delayed.
              </p>
              <p className="text-themed-muted text-sm mt-2 leading-relaxed">
                <span className="text-gold font-medium">Sunnah:</span> 2 rak&apos;ahs after Maghrib.
              </p>
              <Ref text="Bukhari 9:50" />
              <Link href="/salah" className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2">View Salah guide →</Link>
            </div>
            <BookmarkButton type="hadith" id="daily-maghrib" title="Maghrib Prayer" subtitle="Muslim Daily" href="/muslim-daily?tab=worship&sub=evening" />
          </div>
        </ContentCard>
      </TimelineStep>

      <TimelineStep time="After Maghrib" title="Evening Adhkar" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdhkarItem
            transliteration="Ayat al-Kursi (Quran 2:255)"
            english="Whoever recites it after every prayer — the only thing between him and Paradise is death (meaning paradise awaits him after death)."
            reference="Nasai, Sunan al-Kubra 9928"
            delay={0}
          >
            <Link href="/quran/2" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Read Surah Al-Baqarah →</Link>
          </AdhkarItem>
          <AdhkarItem
            english="Recite Surah Al-Ikhlas, Al-Falaq, and An-Nas three times each — &quot;Recite them three times in the morning and evening and they will suffice you against everything.&quot;"
            reference="Abu Dawud 43:310"
            delay={0}
          >
            <div className="flex gap-3 flex-wrap mt-2">
              <Link href="/quran/112" className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">Al-Ikhlas →</Link>
              <Link href="/quran/113" className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">Al-Falaq →</Link>
              <Link href="/quran/114" className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">An-Nas →</Link>
            </div>
          </AdhkarItem>
          <AdhkarItem
            arabic="اللّهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير"
            transliteration="Allahumma bika amsayna wa bika asbahna, wa bika nahya wa bika namutu, wa ilaykal-masir"
            english="O Allah, by You we enter the evening, by You we enter the morning, by You we live, by You we die, and to You is the return."
            reference="Tirmidhi 48:22"
            delay={0}
          />
          <AdhkarItem
            arabic="اللّهم إنّي أسألك العافية في الدنيا والآخرة"
            transliteration="Allahumma inni as'alukal-afiyah fid-dunya wal-akhirah"
            english="O Allah, I ask You for well-being in this world and the Hereafter."
            reference="Abu Dawud 43:302"
            delay={0}
          />
          <AdhkarItem
            arabic="اللّهم أنت ربّي لا إله إلا أنت خلقتني وأنا عبدك..."
            transliteration="Sayyid al-Istighfar: Allahumma Anta Rabbi, la ilaha illa Anta, khalaqtani wa ana abduka..."
            translation="O Allah, You are my Lord. There is no god but You. You created me and I am Your servant, and I hold to Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your blessings upon me and I acknowledge my sins, so forgive me — for none forgives sins but You."
            english="Whoever says it in the evening and dies that night enters Paradise."
            reference="Bukhari 80:3"
            delay={0}
          />
          <AdhkarItem
            arabic="أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ"
            transliteration="Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah"
            translation="We have entered the evening and the whole dominion belongs to Allah. All praise is for Allah; there is no god but Allah alone, with no partner."
            english="The Prophet ﷺ said this every evening; the parallel morning form begins Asbahna wa asbahal-mulku lillah."
            reference="Muslim 48:101"
            delay={0}
          />
          <AdhkarItem
            arabic="رَضِيتُ بِاللَّهِ رَبًّا وَبِالإِسْلاَمِ دِينًا وَبِمُحَمَّدٍ رَسُولاً"
            transliteration="Radeetu billahi rabban, wa bil-islami dinan, wa bi-Muhammadin rasula"
            translation="I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Messenger."
            english="Whoever says it in the morning and evening, Allah has promised to please him."
            reference="Abu Dawud 8:114; Abu Dawud 43:300"
            delay={0}
          />
          <AdhkarItem
            arabic="اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي لاَ إِلَهَ إِلاَّ أَنْتَ"
            transliteration="Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa Anta — 3 times"
            translation="O Allah, grant me well-being in my body; O Allah, grant me well-being in my hearing; O Allah, grant me well-being in my sight. There is no god but You."
            english="A supplication the Prophet ﷺ repeated three times each morning and evening."
            reference="Abu Dawud 43:318; Tirmidhi 48:111"
            delay={0}
          />
          <AdhkarItem
            arabic="أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ"
            transliteration="A'udhu bikalimatillahi-t-tammati min sharri ma khalaq — 3 times"
            translation="I seek refuge in the perfect words of Allah from the evil of what He has created."
            english="Whoever says it three times when entering the evening, no harm will befall him that night."
            reference="Tirmidhi 48:236; Abu Dawud 29:44; Abu Dawud 29:45"
            delay={0}
          />
        </div>
      </TimelineStep>

      <TimelineStep time="After dark" title="Isha &amp; Witr" delay={0.15}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                &quot;Make Witr the last of your night prayer.&quot;
              </p>
              <p className="text-themed-muted text-sm mt-2 leading-relaxed">
                <span className="text-gold font-medium">Sunnah:</span> 2 rak&apos;ahs after Isha, then Witr (1 or 3 rak&apos;ahs).
              </p>
              <Ref text="Bukhari 14:9" />
              <Link href="/salah" className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2">View Salah guide →</Link>
            </div>
            <BookmarkButton type="hadith" id="daily-isha-witr" title="Isha & Witr" subtitle="Muslim Daily" href="/muslim-daily?tab=worship&sub=evening" />
          </div>
        </ContentCard>
      </TimelineStep>

      <TimelineStep time="After Isha" title="Family Time" isLast delay={0.2}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                The Prophet &#xFDFA; would help with household chores — when asked what he did at home, Aisha said: &quot;He would be in the service of his family.&quot;
              </p>
              <Ref text="Bukhari 78:69" />
              <p className="text-themed-muted text-sm mt-2 leading-relaxed">
                Teach children, play with them, check on family members.
              </p>
              <div className="mt-3 border-l-2 border-gold/30 pl-3">
                <p className="font-arabic text-gold text-base leading-loose mb-1">لاَ تَجْعَلُوا بُيُوتَكُمْ مَقَابِرَ إِنَّ الشَّيْطَانَ يَنْفِرُ مِنَ الْبَيْتِ الَّذِي تُقْرَأُ فِيهِ سُورَةُ الْبَقَرَةِ</p>
                <p className="text-themed-muted text-sm leading-relaxed">
                  <span className="text-gold font-medium">Fill the home with Quran:</span> &quot;Do not make your houses as graveyards. Satan runs away from the house in which Surah Baqara is recited.&quot;
                </p>
                <Ref text="Muslim 6:252; Tirmidhi 45:3" />
                <Link href="/quran/2" className="inline-block mt-1 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Read Surah Al-Baqarah →</Link>
              </div>
            </div>
            <BookmarkButton type="hadith" id="daily-family" title="Family Time" subtitle="Muslim Daily" href="/muslim-daily?tab=worship&sub=evening" />
          </div>
        </ContentCard>
      </TimelineStep>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Before Sleep
   ═══════════════════════════════════════════════════════════════════ */

export function SleepTab() {
  return (
    <div>
      <TimelineStep time="Before lying down" title="Sleep Sunnahs" delay={0.05}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <ul className="space-y-2 text-themed-muted text-sm leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-gold">•</span> Make wudu before sleeping
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">•</span> Dust off the bed before lying down (3 times)
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">•</span> Sleep on your right side
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">•</span> Place right hand under right cheek
                </li>
              </ul>
              <Ref text="Bukhari 80:8" />
              <Ref text="Muslim 48:75" />
            </div>
            <BookmarkButton type="hadith" id="daily-sleep-sunnahs" title="Sleep Sunnahs" subtitle="Muslim Daily" href="/muslim-daily?tab=worship&sub=sleep" />
          </div>
        </ContentCard>
      </TimelineStep>

      <TimelineStep time="In bed" title="Bedtime Duas" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdhkarItem
            english="Blow into palms and recite Al-Ikhlas, Al-Falaq, An-Nas, then wipe over body — do this 3 times."
            reference="Bukhari 66:39"
            delay={0}
          >
            <div className="flex gap-3 flex-wrap mt-2">
              <Link href="/quran/112" className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">Al-Ikhlas →</Link>
              <Link href="/quran/113" className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">Al-Falaq →</Link>
              <Link href="/quran/114" className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">An-Nas →</Link>
            </div>
          </AdhkarItem>
          <AdhkarItem
            transliteration="Ayat al-Kursi"
            english="If you recite it when going to bed, a guardian from Allah will protect you, and no devil will come near you until morning."
            reference="Bukhari 40:11"
            note="Hadith of Abu Hurayrah with the shaytan"
            delay={0}
          >
            <Link href="/quran/2" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Read Ayat al-Kursi →</Link>
          </AdhkarItem>
          <AdhkarItem
            transliteration="Last 2 verses of Surah Al-Baqarah (2:285-286)"
            english="Whoever recites them at night, they will suffice him."
            reference="Bukhari 66:31"
            delay={0}
          >
            <Link href="/quran/2" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Read Surah Al-Baqarah →</Link>
          </AdhkarItem>
          <AdhkarItem
            arabic="بسمك اللّهم أموت وأحيا"
            transliteration="Bismika Allahumma amutu wa ahya"
            english="In Your name, O Allah, I die and I live."
            reference="Bukhari 80:9"
            delay={0}
          />
          <AdhkarItem
            arabic="اللّهم قني عذابك يوم تبعث عبادك"
            transliteration="Allahumma qini adhabaka yawma tab'athu ibadak"
            english="O Allah, protect me from Your punishment on the Day You resurrect Your servants."
            reference="Abu Dawud 43:273"
            delay={0}
          />
        </div>
      </TimelineStep>

      <TimelineStep time="During the night" title="Bad Dreams &amp; Waking at Night" delay={0.13}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContentCard delay={0}>
            <p className="font-arabic text-gold text-base leading-loose mb-2">فَإِذَا حَلَمَ فَلْيَتَعَوَّذْ مِنْهُ وَلْيَبْصُقْ عَنْ شِمَالِهِ، فَإِنَّهَا لاَ تَضُرُّهُ</p>
            <p className="text-themed-muted text-sm leading-relaxed">
              <span className="text-gold font-medium">A bad dream:</span> A good dream is from Allah and a bad dream is from Shaytan. If you see one, seek refuge in Allah from it, spit lightly to your left three times, and do not tell anyone about it — then it will not harm you.
            </p>
            <Ref text="Bukhari 91:5" />
          </ContentCard>
          <ContentCard delay={0}>
            <p className="font-arabic text-gold text-base leading-loose mb-2">مَنْ تَعَارَّ مِنَ اللَّيْلِ فَقَالَ … وَحْدَهُ لاَ شَرِيكَ</p>
            <p className="text-themed-muted text-sm leading-relaxed">
              <span className="text-gold font-medium">If you wake in the night:</span> Whoever wakes and remembers Allah — declaring His oneness and then asking forgiveness or making duʿa — his supplication is answered. Whoever sleeps in a state of wudu and then asks Allah for anything will be given it.
            </p>
            <Ref text="Bukhari 19:35; Ibn Majah 34:55" />
          </ContentCard>
        </div>
      </TimelineStep>

      <TimelineStep time="Before closing your eyes" title="Self-Reflection (Muhasabah)" delay={0.15}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                Reflect on your day: Did I pray all 5 prayers? Was I truthful? Did I harm anyone? Did I remember Allah?
              </p>
              <p className="text-themed-muted text-sm mt-3 leading-relaxed italic border-l-2 border-gold/30 pl-3">
                &quot;Take account of yourselves before you are taken to account.&quot; — Umar ibn al-Khattab
              </p>
            </div>
            <BookmarkButton type="hadith" id="daily-muhasabah" title="Self-Reflection (Muhasabah)" subtitle="Muslim Daily" href="/muslim-daily?tab=worship&sub=sleep" />
          </div>
        </ContentCard>
      </TimelineStep>

      <TimelineStep time="Last thing before sleep" title="Istighfar" isLast delay={0.2}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                The Prophet &#xFDFA; would seek forgiveness 70+ times a day. End your day by turning back to Allah.
              </p>
              <p className="font-arabic text-gold text-lg leading-loose mt-2 mb-1">
                أستغفر الله وأتوب إليه
              </p>
              <p className="text-themed font-medium text-sm italic">Astaghfirullah wa atubu ilayh</p>
              <Ref text="Bukhari 80:4" />
              <Link href="/dhikr" className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Open Dhikr counter →</Link>
            </div>
            <BookmarkButton type="hadith" id="daily-istighfar-sleep" title="Istighfar Before Sleep" subtitle="Muslim Daily" href="/muslim-daily?tab=worship&sub=sleep" />
          </div>
        </ContentCard>
      </TimelineStep>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Daily Checklist
   ═══════════════════════════════════════════════════════════════════ */

/* The checklist is driven by the SAME daily adapter as the native app:
   local (device-only) when signed out, Supabase-synced when signed in.
   One-time migration: if the legacy fixed-12 localStorage checklist has data
   and the adapter's day is still untouched, carry today's ticks over once,
   then delete the legacy keys. */

const LEGACY_CHECKLIST_KEY = "hiqmah-daily-checklist";
const LEGACY_STREAK_KEY = "hiqmah-daily-streak";

// legacy fixed item id → adapter default sourceKey(s) (unmapped ids are dropped)
const LEGACY_TO_SOURCE_KEYS: Record<string, string[]> = {
  pray5: ["fajr", "dhuhr", "asr", "maghrib", "isha"],
  quran: ["quran_page"],
  "morning-adhkar": ["morning_adhkar"],
  "evening-adhkar": ["evening_adhkar"],
  salawat: ["salawat"],
  istighfar: ["istighfar"],
  charity: ["sadaqah"],
};

async function migrateLegacyChecklist(adapter: DailyAdapter, today: string): Promise<boolean> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(LEGACY_CHECKLIST_KEY);
  } catch {
    return false;
  }
  if (!raw) return false;

  const dropLegacyKeys = () => {
    try {
      localStorage.removeItem(LEGACY_CHECKLIST_KEY);
      localStorage.removeItem(LEGACY_STREAK_KEY);
    } catch {
      /* ignore */
    }
  };

  // Parse failures mean genuinely corrupt data — drop it. Adapter failures
  // (offline signed-in user, transient 5xx) must NOT delete the legacy keys:
  // return early and let the next visit retry the one-shot migration.
  let legacy: Record<string, string[]>;
  try {
    legacy = JSON.parse(raw);
  } catch {
    dropLegacyKeys();
    return false;
  }

  // The legacy writer keyed "today" in UTC (toISOString) while the adapter uses
  // the device-local date — read the union of both buckets so evening (west of
  // UTC) and pre-Fajr (east of UTC) ticks aren't dropped at the boundary.
  const utcToday = new Date().toISOString().slice(0, 10);
  const checkedToday = new Set([
    ...(legacy[today] ?? []),
    ...(utcToday !== today ? legacy[utcToday] ?? [] : []),
  ]);

  let migrated = false;
  try {
    await adapter.ensureSeeded();
    const { rollup } = await adapter.getDay(today);
    if (rollup.doneItems === 0 && checkedToday.size > 0) {
      const items = await adapter.getUserItems();
      const bySource = new Map(
        items.filter((i) => i.sourceKey).map((i) => [i.sourceKey as string, i])
      );
      for (const legacyId of checkedToday) {
        for (const key of LEGACY_TO_SOURCE_KEYS[legacyId] ?? []) {
          const it = bySource.get(key);
          if (!it) continue;
          if (it.dhikrKey && it.goalCount != null) {
            await adapter.setDhikrCount(it.dhikrKey, today, it.goalCount);
          } else if (it.goalCount != null) {
            await adapter.setCount(today, it.id, it.goalCount);
          } else {
            await adapter.setDone(today, it.id, true);
          }
          migrated = true;
        }
      }
    }
  } catch {
    // Retryable adapter failure — keep the legacy data for the next visit.
    return false;
  }
  dropLegacyKeys();
  return migrated;
}

function ChecklistTab() {
  const router = useRouter();
  const { adapter, signedIn, authLoading } = useDailyAdapter();
  const today = useMemo(() => todayLocalDate(), []);
  const list = useChecklist(adapter, today);
  const [calOpen, setCalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [week, setWeek] = useState<DayRollup[]>([]);

  useEffect(() => {
    adapter.getDayRollups(mondayOf(today), today).then(setWeek).catch(() => setWeek([]));
  }, [adapter, today, list.rollup]);

  // One-time seed from the legacy fixed checklist (keys removed afterwards).
  const migrationRan = useRef(false);
  const { loading: listLoading, reload } = list;
  useEffect(() => {
    if (authLoading || listLoading || migrationRan.current) return;
    migrationRan.current = true;
    migrateLegacyChecklist(adapter, today)
      .then((did) => (did ? reload() : undefined))
      .catch(() => undefined);
  }, [authLoading, listLoading, adapter, today, reload]);

  const weekMerged = useMemo(() => {
    const map = new Map(week.map((r) => [r.localDate, r]));
    if (list.rollup) map.set(today, list.rollup);
    return [...map.values()];
  }, [week, list.rollup, today]);

  if (authLoading || list.loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-24 flex-1 rounded-2xl" />
          <Skeleton className="h-24 w-[42%] rounded-2xl" />
        </div>
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!signedIn && (
        <Link
          href="/signin"
          className="block card-bg rounded-2xl border sidebar-border px-4 py-3 text-sm text-themed-muted card-hover"
        >
          <span className="text-gold font-semibold">Sign in</span> to sync your checklist
          and keep your streak across devices.
        </Link>
      )}

      {/* Streak + prayer badges → the Humane Streaks page */}
      <StreakBadges streaks={list.streaks} onOpen={() => router.push("/streaks")} />

      <StreakWeekStrip rollups={weekMerged} today={today} onOpen={() => setCalOpen(true)} />

      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-themed-muted">
          {list.rollup && list.rollup.totalItems > 0
            ? `${list.rollup.doneItems} of ${list.rollup.totalItems} today`
            : "Today"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm text-themed-muted hover:text-themed transition-colors"
          >
            <Pencil size={14} /> Edit
          </button>
          <BookmarkButton
            type="page"
            id="/muslim-daily?tab=checklist"
            title="Daily Checklist"
            subtitle="Muslim Daily"
            href="/muslim-daily?tab=checklist"
          />
        </div>
      </div>

      <Checklist rows={list.rows} onCheck={list.check} onBump={list.bump} />

      {calOpen && (
        <StreakCalendar
          adapter={adapter}
          today={today}
          onClose={() => {
            setCalOpen(false);
            void list.reload(); // reflect any retro-completed past days
          }}
        />
      )}

      {editOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[70] bg-themed overflow-y-auto py-10"
          style={{ overscrollBehavior: "contain" }}
        >
          <div className="max-w-xl mx-auto px-4">
            <ChecklistEditor
              adapter={adapter}
              onClose={() => {
                setEditOpen(false);
                void list.reload();
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Midnight (Last Third of the Night)
   ═══════════════════════════════════════════════════════════════════ */

export function MidnightTab() {
  return (
    <div className="space-y-5">
      {/* Tahajjud */}
      <TimelineStep time="Last third of the night" title="Tahajjud Prayer" delay={0.05}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                The Prophet &#xFDFA; said: &quot;The best prayer after the obligatory prayers is the night prayer (Qiyam al-Layl).&quot;
              </p>
              <p className="text-themed-muted text-sm mt-2 leading-relaxed">
                <span className="text-gold font-medium">How to pray:</span> Pray in sets of 2 rak&apos;ahs. The Prophet &#xFDFA; would typically pray 8 rak&apos;ahs + 3 Witr.
              </p>
              <Ref text="Muslim 6:147" />
              <Link
                href="/salah"
                className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2"
              >
                View Salah guide →
              </Link>
            </div>
            <BookmarkButton
              type="hadith"
              id="daily-tahajjud"
              title="Tahajjud Prayer"
              subtitle="Muslim Daily"
              href="/muslim-daily?tab=worship&sub=midnight"
            />
          </div>
        </ContentCard>
      </TimelineStep>

      {/* Gratitude + practical on-ramp */}
      <TimelineStep time="How the Prophet ﷺ prayed" title="Devotion &amp; a Realistic Start" delay={0.08}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContentCard delay={0}>
            <p className="font-arabic text-gold text-base leading-loose mb-2">أَفَلاَ أَكُونُ عَبْدًا شَكُورًا</p>
            <p className="text-themed-muted text-sm leading-relaxed">
              The Prophet ﷺ would stand in night prayer until his feet became swollen. When asked why he burdened himself when his past and future sins were forgiven, he answered: &quot;Shouldn&apos;t I be a grateful worshipper?&quot;
            </p>
            <Ref text="Muslim 52:77; Tirmidhi 2:265; Nasai 20:47" />
          </ContentCard>
          <ContentCard delay={0}>
            <p className="text-themed-muted text-sm leading-relaxed mb-2">
              <span className="text-gold font-medium">How to actually wake for Tahajjud:</span>
            </p>
            <ul className="space-y-2 text-themed-muted text-sm leading-relaxed">
              <li className="flex gap-2"><span className="text-gold">•</span> Sleep early, ideally already in a state of wudu.</li>
              <li className="flex gap-2"><span className="text-gold">•</span> Set an alarm for the last third of the night, even for just 10–15 minutes.</li>
              <li className="flex gap-2"><span className="text-gold">•</span> Start with two short rak&apos;ahs — begin light rather than aiming for many.</li>
              <li className="flex gap-2"><span className="text-gold">•</span> Keep a few duʿas ready for when you finish, then pray Witr.</li>
            </ul>
            <p className="text-themed-muted/70 text-xs mt-2 italic">Practical guidance drawn from the general teachings of the Sunnah.</p>
          </ContentCard>
        </div>
      </TimelineStep>

      {/* Allah descends */}
      <TimelineStep time="Last third of the night" title="Allah&apos;s Special Nearness" delay={0.1}>
        <ContentCard delay={0}>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Our Lord descends every night to the lowest heaven in the last third of the night and says: &apos;Who is calling upon Me that I may answer him? Who is asking of Me that I may give him? Who is seeking My forgiveness that I may forgive him?&apos;&quot;
          </p>
          <Ref text="Bukhari 19:26" />
        </ContentCard>
      </TimelineStep>

      {/* Dua at night */}
      <TimelineStep time="During Tahajjud" title="Dua &amp; Istighfar" delay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdhkarItem
            arabic="اللّهم لك الحمد أنت نور السماوات والأرض ومن فيهن"
            transliteration="Allahumma lakal-hamd, Anta nurus-samawati wal-ard wa man fihinn"
            english="O Allah, to You belongs all praise. You are the Light of the heavens and the earth and all within them."
            reference="Bukhari 19:1"
            delay={0}
          />
          <ContentCard delay={0}>
            <p className="text-themed-muted text-sm leading-relaxed">
              <span className="text-gold font-medium">Seek forgiveness:</span> &quot;Those who seek forgiveness before dawn&quot; — Allah praises the ones who make istighfar in the last part of the night.
            </p>
            <Ref text="Quran 3:17" />
            <Link href="/quran/3" className="inline-block mt-3 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Read Surah Aal-Imran →</Link>
          </ContentCard>
        </div>
      </TimelineStep>

      {/* Witr */}
      <TimelineStep time="Before Fajr" title="Witr Prayer" delay={0.2}>
        <ContentCard delay={0}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-themed-muted text-sm leading-relaxed">
                &quot;Make Witr as your last prayer at night.&quot;
              </p>
              <p className="text-themed-muted text-sm mt-2 leading-relaxed">
                <span className="text-gold font-medium">How:</span> Minimum 1 rak&apos;ah, best is 3. Include Qunut dua in the last rak&apos;ah.
              </p>
              <Ref text="Bukhari 14:9" />
              <div className="flex gap-3 flex-wrap mt-3">
                <Link href="/salah" className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">View Salah guide →</Link>
                <Link href="/duas" className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">Browse Duas →</Link>
              </div>
            </div>
            <BookmarkButton
              type="hadith"
              id="daily-witr"
              title="Witr Prayer"
              subtitle="Muslim Daily"
              href="/muslim-daily?tab=worship&sub=midnight"
            />
          </div>
        </ContentCard>
      </TimelineStep>

      {/* Suhoor / Pre-Fajr */}
      <TimelineStep time="Before Fajr" title="Suhoor (Pre-Dawn Meal)" isLast delay={0.25}>
        <ContentCard delay={0}>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Eat suhoor, for in suhoor there is blessing.&quot;
          </p>
          <p className="text-themed-muted text-sm mt-2 leading-relaxed">
            Even if fasting is not obligatory that day, the Prophet &#xFDFA; encouraged eating before Fajr when fasting voluntarily.
          </p>
          <Ref text="Bukhari 30:32" />
        </ContentCard>
      </TimelineStep>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Sunnah Acts
   ═══════════════════════════════════════════════════════════════════ */

export function SunnahContent({
  activeSub,
  setActiveSub,
  hideRail = false,
  visibleKeys,
}: {
  activeSub: SunnahSub;
  setActiveSub: (s: SunnahSub) => void;
  hideRail?: boolean;
  visibleKeys?: string[];
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      {!hideRail && (
        <div className="daily-subrail flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
          {sunnahSubs.filter((sub) => !visibleKeys || visibleKeys.includes(sub.key)).map((sub) => (
            <button
              key={sub.key}
              onClick={() => setActiveSub(sub.key)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left flex items-center gap-2 ${
                activeSub === sub.key
                  ? "bg-gold/20 text-gold border border-gold/40"
                  : "text-themed-muted hover:text-themed border sidebar-border"
              }`}
            >
              {sub.icon}
              {sub.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSub}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeSub === "eating" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContentCard delay={0.05}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِذَا أَكَلَ أَحَدُكُمْ فَلْيَذْكُرِ اسْمَ اللَّهِ تَعَالَى فَإِنْ نَسِيَ أَنْ يَذْكُرَ اسْمَ اللَّهِ تَعَالَى فِي أَوَّلِهِ فَلْيَقُلْ بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Say <span className="text-gold font-medium">&quot;Bismillah&quot;</span> before
                    eating; if you forget, say &quot;Bismillahi fi awwalihi wa akhirih.&quot;
                  </p>
                  <Ref text="Abu Dawud 28:32" />
                </ContentCard>
                <ContentCard delay={0.08}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِذَا أَكَلَ أَحَدُكُمْ فَلْيَأْكُلْ بِيَمِينِهِ وَإِذَا شَرِبَ فَلْيَشْرَبْ بِيَمِينِهِ فَإِنَّ الشَّيْطَانَ يَأْكُلُ بِشِمَالِهِ وَيَشْرَبُ بِشِمَالِهِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Eat with the right hand, for the Shaytan eats and drinks with his left.
                  </p>
                  <Ref text="Muslim 36:139" />
                </ContentCard>
                <ContentCard delay={0.11}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">يَا غُلاَمُ سَمِّ اللَّهَ، وَكُلْ بِيَمِينِكَ وَكُلْ مِمَّا يَلِيكَ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    &quot;O boy, mention the name of Allah, eat with your right hand, and eat from what is nearest to you.&quot;
                  </p>
                  <Ref text="Bukhari 70:4" />
                </ContentCard>
                <ContentCard delay={0.14}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">نَهَى رَسُولُ اللَّهِ ﷺ عَنِ الشُّرْبِ مِنْ ثُلْمَةِ الْقَدَحِ وَأَنْ يُنْفَخَ فِي الشَّرَابِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    The Prophet ﷺ forbade drinking from a chipped cup and blowing into drinks.
                  </p>
                  <Ref text="Abu Dawud 27:54" />
                </ContentCard>
                <ContentCard delay={0.17}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">زَجَرَ عَنِ الشُّرْبِ قَائِمًا</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    He ﷺ forbade drinking while standing.
                  </p>
                  <Ref text="Muslim 36:148" />
                </ContentCard>
                <ContentCard delay={0.2}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِنَّ اللَّهَ لَيَرْضَى عَنِ الْعَبْدِ أَنْ يَأْكُلَ الأَكْلَةَ فَيَحْمَدَهُ عَلَيْهَا أَوْ يَشْرَبَ الشَّرْبَةَ فَيَحْمَدَهُ عَلَيْهَا</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Allah is pleased with His servant who praises Him after eating and praises Him after drinking.
                  </p>
                  <Ref text="Muslim 48:123" />
                </ContentCard>
                <ContentCard delay={0.23}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا الطَّعَامَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    <span className="text-gold font-medium">After a meal:</span> Whoever says &quot;Al-hamdu lillahilladhi at&apos;amani hadhat-ta&apos;ama wa razaqanihi min ghayri hawlin minni wa la quwwah&quot; (All praise is for Allah who fed me this food and provided it to me without any power or strength on my part) is forgiven his past sins.
                  </p>
                  <Ref text="Abu Dawud 34:4; Tirmidhi 48:89" />
                </ContentCard>
                <ContentCard delay={0.26}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">مَا عَابَ النَّبِيُّ صلى الله عليه وسلم طَعَامًا قَطُّ، إِنِ اشْتَهَاهُ أَكَلَهُ، وَإِنْ كَرِهَهُ تَرَكَهُ.</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    The Prophet ﷺ never criticized any food; if he liked it he ate it, and if he disliked it he simply left it.
                  </p>
                  <Ref text="Bukhari 70:37; Muslim 36:254" />
                </ContentCard>
                <ContentCard delay={0.29}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">كُلُوا جَمِيعًا وَلاَ تَفَرَّقُوا فَإِنَّ الْبَرَكَةَ مَعَ الْجَمَاعَةِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Eat together and do not eat separately, for the blessing is in eating as a group and mentioning Allah&apos;s name over the food.
                  </p>
                  <Ref text="Ibn Majah 29:37; Abu Dawud 28:29" />
                </ContentCard>
                <ContentCard delay={0.32}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">مَا مَلأَ آدَمِيٌّ وِعَاءً شَرًّا مِنْ بَطْنٍ بِحَسْبِ ابْنِ آدَمَ أُكُلاَتٌ يُقِمْنَ صُلْبَهُ فَإِنْ كَانَ لاَ مَحَالَةَ فَثُلُثٌ لِطَعَامِهِ وَثُلُثٌ لِشَرَابِهِ وَثُلُثٌ لِنَفَسِهِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Moderation: no one fills a vessel worse than his stomach. A few morsels to keep the back straight suffice; if more is needed, then a third for food, a third for drink, and a third for breath.
                  </p>
                  <Ref text="Tirmidhi 36:77" />
                </ContentCard>
                <ContentCard delay={0.35}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">أَنَّ النَّبِيَّ صلى الله عليه وسلم كَانَ يَتَنَفَّسُ ثَلاَثًا.</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    The Prophet ﷺ would take three breaths while drinking (breathing outside the vessel), rather than draining it in one go.
                  </p>
                  <Ref text="Bukhari 74:57" />
                </ContentCard>
              </div>
            )}
            {activeSub === "greeting" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContentCard delay={0.05}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">يُسَلِّمُ الصَّغِيرُ عَلَى الْكَبِيرِ، وَالْمَارُّ عَلَى الْقَاعِدِ، وَالْقَلِيلُ عَلَى الْكَثِيرِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    The young should greet the old, the passer-by should greet the one sitting, and the few should greet the many.
                  </p>
                  <Ref text="Bukhari 79:5" />
                </ContentCard>
                <ContentCard delay={0.08}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">وَإِذَا حُيِّيتُمْ بِتَحِيَّةٍ فَحَيُّوا بِأَحْسَنَ مِنْهَا أَوْ رُدُّوهَا</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    When you are greeted with a greeting, greet with one better than it or return it.
                  </p>
                  <Ref text="Quran 4:86" />
                </ContentCard>
                <ContentCard delay={0.11}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">تُطْعِمُ الطَّعَامَ، وَتَقْرَأُ السَّلاَمَ عَلَى مَنْ عَرَفْتَ وَمَنْ لَمْ تَعْرِفْ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Feed the poor and spread Salam to those you know and those you do not know.
                  </p>
                  <Ref text="Bukhari 2:5" />
                </ContentCard>
                <ContentCard delay={0.14}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">لاَ تَدْخُلُوا الْجَنَّةَ حَتَّى تُؤْمِنُوا وَلاَ تُؤْمِنُوا حَتَّى تَحَابُّوا … أَفْشُوا السَّلاَمَ بَيْنَكُمْ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    &quot;You will not enter Paradise until you believe, and you will not (truly) believe until you love one another. Shall I not tell you of something which, if you do it, you will love one another? Spread the greetings of Salam amongst yourselves.&quot;
                  </p>
                  <Ref text="Abu Dawud 43:421; Ibn Majah 0:68" />
                </ContentCard>
                <ContentCard delay={0.17}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِذَا الْتَقَى الْمُسْلِمَانِ فَتَصَافَحَا وَحَمِدَا اللَّهَ عَزَّ وَجَلَّ وَاسْتَغْفَرَاهُ غُفِرَ لَهُمَا</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    When two Muslims meet and shake hands, praising Allah and seeking His forgiveness, they are forgiven before they part. Shaking hands on meeting was the practice of the Companions.
                  </p>
                  <Ref text="Abu Dawud 43:439; Abu Dawud 43:440; Bukhari 79:37" />
                </ContentCard>
                <ContentCard delay={0.2}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">لِلْمُسْلِمِ عَلَى الْمُسْلِمِ سِتٌّ بِالْمَعْرُوفِ يُسَلِّمُ عَلَيْهِ إِذَا لَقِيَهُ وَيُجِيبُهُ إِذَا دَعَاهُ وَيُشَمِّتُهُ إِذَا عَطَسَ وَيَعُودُهُ إِذَا مَرِضَ وَيَتْبَعُ جَنَازَتَهُ إِذَا مَاتَ وَيُحِبُّ لَهُ مَا يُحِبُّ لِنَفْسِهِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Six courtesies a Muslim owes another: greet him with Salam, answer his invitation, reply when he sneezes, visit him when ill, follow his funeral, and love for him what you love for yourself.
                  </p>
                  <Ref text="Tirmidhi 43:1; Bukhari 23:4" />
                </ContentCard>
              </div>
            )}
            {activeSub === "entering" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContentCard delay={0.05}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">يُعْجِبُهُ التَّيَمُّنُ فِي تَنَعُّلِهِ وَتَرَجُّلِهِ وَطُهُورِهِ وَفِي شَأْنِهِ كُلِّهِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    The Prophet ﷺ loved to start with the right in all his affairs — putting on shoes, combing his hair, and purification.
                  </p>
                  <Ref text="Bukhari 4:34" />
                </ContentCard>
                <ContentCard delay={0.08}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    <span className="text-gold font-medium">Dua entering home:</span> &quot;O Allah, I ask You for the best entrance and the best exit. In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we rely.&quot;
                  </p>
                  <Ref text="Abu Dawud 43:324" />
                </ContentCard>
                <ContentCard delay={0.11}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    <span className="text-gold font-medium">Dua entering mosque:</span> &quot;O Allah, open for me the doors of Your mercy.&quot;
                  </p>
                  <Ref text="Muslim 6:82" />
                </ContentCard>
                <ContentCard delay={0.14}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِذَا دَخَلَ الرَّجُلُ بَيْتَهُ فَذَكَرَ اللَّهَ عِنْدَ دُخُولِهِ وَعِنْدَ طَعَامِهِ قَالَ الشَّيْطَانُ لاَ مَبِيتَ لَكُمْ وَلاَ عَشَاءَ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    When a man enters his home mentioning Allah, the Shaytan says to his companions: &quot;You have no lodging and no dinner tonight.&quot;
                  </p>
                  <Ref text="Muslim 36:136" />
                </ContentCard>
                <ContentCard delay={0.17}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    <span className="text-gold font-medium">Entering the bathroom:</span> &quot;Allahumma inni a&apos;udhu bika minal-khubuthi wal-khaba&apos;ith&quot; (O Allah, I seek refuge in You from the male and female devils) — these places are frequented by them.
                  </p>
                  <Ref text="Bukhari 4:8; Bukhari 80:19; Abu Dawud 1:6" />
                </ContentCard>
                <ContentCard delay={0.2}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">غُفْرَانَكَ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    <span className="text-gold font-medium">Leaving the bathroom:</span> &quot;Ghufranak&quot; (I seek Your forgiveness) — the Prophet ﷺ said it whenever he came out.
                  </p>
                  <Ref text="Abu Dawud 1:30" />
                </ContentCard>
                <ContentCard delay={0.23}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِذَا أَتَيْتُمُ الْغَائِطَ فَلاَ تَسْتَقْبِلُوا الْقِبْلَةَ بِغَائِطٍ وَلاَ بَوْلٍ وَلَكِنْ شَرِّقُوا أَوْ غَرِّبُوا</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    <span className="text-gold font-medium">Toilet manners:</span> Do not face or turn your back to the qiblah while relieving yourself, and do not use the right hand for cleaning — reserve the left hand for it. The prohibition is strongest in the open; scholars differ over enclosed, built toilets, so follow the guidance of a trusted scholar.
                  </p>
                  <Ref text="Abu Dawud 1:9; Abu Dawud 1:31" />
                </ContentCard>
                <ContentCard delay={0.26}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    <span className="text-gold font-medium">Leaving home:</span> &quot;Bismillah, tawakkaltu &apos;alallah, la hawla wa la quwwata illa billah&quot; (In the name of Allah, I trust in Allah; there is no might nor power except with Allah). He is told: you are guided, defended, and protected — and the devils turn away from him.
                  </p>
                  <Ref text="Abu Dawud 43:323" />
                  <Link href="/duas" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Browse Duas →</Link>
                </ContentCard>
              </div>
            )}
            {activeSub === "dress" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContentCard delay={0.05}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">كَانَ النَّبِيُّ ﷺ يُحِبُّ التَّيَمُّنَ مَا اسْتَطَاعَ فِي طُهُورِهِ وَتَنَعُّلِهِ وَتَرَجُّلِهِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    The Prophet ﷺ loved to start with the right side as much as possible — in purification, putting on shoes, and combing.
                  </p>
                  <Ref text="Bukhari 70:8" />
                </ContentCard>
                <ContentCard delay={0.08}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">لَوْلاَ أَنْ أَشُقَّ عَلَى أُمَّتِي لأَمَرْتُهُمْ بِالسِّوَاكِ مَعَ كُلِّ صَلاَةٍ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    &quot;Were it not for the difficulty on my ummah, I would have ordered them to use the miswak before every prayer.&quot;
                  </p>
                  <Ref text="Bukhari 11:12" />
                </ContentCard>
                <ContentCard delay={0.11}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">الْفِطْرَةُ خَمْسٌ الْخِتَانُ وَالاِسْتِحْدَادُ وَتَقْلِيمُ الأَظْفَارِ وَنَتْفُ الإِبْطِ وَقَصُّ الشَّارِبِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Five acts of fitrah: circumcision, shaving the pubic hair, trimming the nails, plucking the armpit hair, and trimming the moustache.
                  </p>
                  <Ref text="Muslim 2:64" />
                </ContentCard>
                <ContentCard delay={0.14}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    <span className="text-gold font-medium">A new garment:</span> The Prophet ﷺ would name it (shirt, turban) and then praise Allah who had clothed him with it, asking Allah for its good and the good for which it was made, and seeking refuge in Allah from its evil and the evil for which it was made. ʿUmar&apos;s well-known duʿa on new clothes is also reported.
                  </p>
                  <Ref text="Abu Dawud 34:1; Tirmidhi 48:191; Ibn Majah 32:8" />
                  <Link href="/duas" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Browse Duas →</Link>
                </ContentCard>
              </div>
            )}
            {activeSub === "speech" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContentCard delay={0.05}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    &quot;Whoever believes in Allah and the Last Day, let him speak good or remain silent.&quot;
                  </p>
                  <Ref text="Bukhari 78:49" />
                </ContentCard>
                <ContentCard delay={0.08}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">وَلَا يَغْتَبْ بَعْضُكُمْ بَعْضًا ۚ أَيُحِبُّ أَحَدُكُمْ أَنْ يَأْكُلَ لَحْمَ أَخِيهِ مَيْتًا فَكَرِهْتُمُوهُ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    &quot;Do not backbite one another. Would any of you like to eat the flesh of his dead brother? You would detest it.&quot;
                  </p>
                  <Ref text="Quran 49:12" />
                </ContentCard>
                <ContentCard delay={0.11}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    &quot;Truthfulness leads to righteousness, and righteousness leads to Paradise.&quot;
                  </p>
                  <Ref text="Bukhari 78:121" />
                </ContentCard>
                <ContentCard delay={0.14}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">لاَ تَغْضَبْ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    A man asked for advice and the Prophet ﷺ said: &quot;Do not become angry,&quot; repeating it each time he asked again. He also taught: when anger comes while standing, sit down; if it does not pass, lie down.
                  </p>
                  <Ref text="Bukhari 78:143; Abu Dawud 43:10" />
                </ContentCard>
                <ContentCard delay={0.17}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    &quot;Your smiling in the face of your brother is charity.&quot; Even the smallest kindness in your dealings is rewarded.
                  </p>
                  <Ref text="Tirmidhi 27:62" />
                </ContentCard>
                <ContentCard delay={0.2}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">وَهَلْ يَكُبُّ النَّاسَ فِي النَّارِ عَلَى وُجُوهِهِمْ أَوْ عَلَى مَنَاخِرِهِمْ إِلاَّ حَصَائِدُ أَلْسِنَتِهِمْ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    When Muʿadh asked how to guard all good, the Prophet ﷺ took hold of his tongue and said &quot;Restrain this,&quot; then warned: are people thrown on their faces into the Fire for anything but the harvests of their tongues?
                  </p>
                  <Ref text="Tirmidhi 40:11; Ibn Majah 36:48" />
                </ContentCard>
              </div>
            )}
            {activeSub === "sleeping" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContentCard delay={0.05}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">اضْطَجِعْ عَلَى شِقِّكَ الأَيْمَنِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    &quot;Lie down on your right side.&quot;
                  </p>
                  <Ref text="Bukhari 80:8" />
                </ContentCard>
                <ContentCard delay={0.08}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِذَا أَتَيْتَ مَضْجَعَكَ فَتَوَضَّأْ وُضُوءَكَ لِلصَّلاَةِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    &quot;When you go to bed, perform wudu as you would for prayer.&quot;
                  </p>
                  <Ref text="Bukhari 4:113" />
                </ContentCard>
                <ContentCard delay={0.11}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">اللَّهُمَّ أَسْلَمْتُ وَجْهِي إِلَيْكَ وَفَوَّضْتُ أَمْرِي إِلَيْكَ وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    &quot;O Allah, I submit my face to You, entrust my affairs to You, and lean my back on You&quot; — let your last words before sleep be remembrance of Allah.
                  </p>
                  <Ref text="Bukhari 80:8" />
                </ContentCard>
                <ContentCard delay={0.14}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِنَّ هَذِهِ ضِجْعَةٌ يُبْغِضُهَا اللَّهُ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Do not sleep lying flat on your stomach — the Prophet ﷺ found a man lying prone and said: &quot;This is a method of lying which Allah hates.&quot;
                  </p>
                  <Ref text="Abu Dawud 43:268" />
                </ContentCard>
                <ContentCard delay={0.17}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">ثُمَّ نَمْ عَلَى خَاتِمَتِهَا فَإِنَّهَا بَرَاءَةٌ مِنَ الشِّرْكِ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    The Prophet ﷺ advised reciting Surah Al-Kafirun before sleeping and sleeping upon its ending, &quot;for it is a declaration of freedom from polytheism.&quot;
                  </p>
                  <Ref text="Abu Dawud 43:283" />
                  <Link href="/quran/109" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">Read Al-Kafirun →</Link>
                </ContentCard>
              </div>
            )}
            {activeSub === "sneezing" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContentCard delay={0.05}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِذَا عَطَسَ أَحَدُكُمْ فَلْيَقُلِ الْحَمْدُ لِلَّهِ. وَلْيَقُلْ لَهُ أَخُوهُ أَوْ صَاحِبُهُ يَرْحَمُكَ اللَّهُ. فَإِذَا قَالَ لَهُ يَرْحَمُكَ اللَّهُ. فَلْيَقُلْ يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    When you sneeze, say &quot;Alhamdulillah.&quot; The one who hears replies &quot;Yarhamukallah&quot; (may Allah have mercy on you), and the sneezer answers &quot;Yahdikumullah wa yuslih balakum&quot; (may Allah guide you and set your affairs right).
                  </p>
                  <Ref text="Bukhari 78:248" />
                </ContentCard>
                <ContentCard delay={0.08}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">هَذَا حَمِدَ اللَّهَ، وَهَذَا لَمْ يَحْمَدِ اللَّهَ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Two men sneezed near the Prophet ﷺ; he answered one but not the other, explaining that the one he answered had praised Allah while the other had not. The reply is earned by first saying Alhamdulillah.
                  </p>
                  <Ref text="Bukhari 78:245" />
                </ContentCard>
                <ContentCard delay={0.11}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِنَّ اللَّهَ يُحِبُّ الْعُطَاسَ وَيَكْرَهُ التَّثَاؤُبَ،</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Allah loves sneezing but dislikes yawning. When someone sneezes and praises Allah, every Muslim who hears should say Tashmit (Yarhamukallah) to him.
                  </p>
                  <Ref text="Bukhari 78:250; Bukhari 78:247" />
                </ContentCard>
                <ContentCard delay={0.14}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">إِذَا تَثَاءَبَ أَحَدُكُمْ فَلْيُمْسِكْ عَلَى فِيهِ فَإِنَّ الشَّيْطَانَ يَدْخُلُ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Yawning is from Shaytan: restrain it as much as you can, and cover your mouth with your hand when you yawn.
                  </p>
                  <Ref text="Abu Dawud 43:254" />
                </ContentCard>
              </div>
            )}
            {activeSub === "sick" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContentCard delay={0.05}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">مَنْ أَتَى أَخَاهُ الْمُسْلِمَ عَائِدًا مَشَى فِي خِرَافَةِ الْجَنَّةِ حَتَّى يَجْلِسَ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    Whoever visits his sick Muslim brother walks amid the harvest of Paradise until he sits, and is then enveloped in mercy. If he visits in the evening, seventy thousand angels seek forgiveness for him until morning — and he will have a garden in Paradise.
                  </p>
                  <Ref text="Abu Dawud 21:10; Ibn Majah 6:10" />
                </ContentCard>
                <ContentCard delay={0.08}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    <span className="text-gold font-medium">Duʿa for the sick (7 times):</span> &quot;As&apos;alullahal-&apos;Azima Rabbal-&apos;arshil-&apos;azimi an yashfiyak&quot; (I ask Allah the Mighty, Lord of the Mighty Throne, to cure you). If his time has not come, Allah will cure him of that illness.
                  </p>
                  <Ref text="Abu Dawud 21:18" />
                </ContentCard>
                <ContentCard delay={0.11}>
                  <p className="font-arabic text-gold text-lg leading-loose mb-2">أَمَرَنَا النَّبِيُّ صلى الله عليه وسلم بِسَبْعٍ عِيَادَةِ الْمَرِيضِ، وَاتِّبَاعِ الْجَنَائِزِ، وَتَشْمِيتِ الْعَاطِسِ،</p>
                  <p className="text-themed-muted text-sm leading-relaxed">
                    The Prophet ﷺ commanded seven things, among them: visiting the sick, following funeral processions, and replying to the one who sneezes — daily duties of a believer toward others.
                  </p>
                  <Ref text="Bukhari 77:66" />
                </ContentCard>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Always Remember
   ═══════════════════════════════════════════════════════════════════ */

function ReminderCard({
  arabic,
  english,
  source,
  delay = 0,
}: {
  arabic: string;
  english: string;
  source: string;
  delay?: number;
}) {
  return (
    <ContentCard delay={delay}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-arabic text-gold text-xl leading-loose mb-3 flex-1">{arabic}</p>
        <BookmarkButton
          type="hadith"
          id={`remember-${source.replace(/\s+/g, "-").toLowerCase()}`}
          title={english.slice(0, 60) + "..."}
          href="/muslim-daily?tab=reminders"
        />
      </div>
      <p className="text-themed-muted text-sm leading-relaxed italic mb-2">&ldquo;{english}&rdquo;</p>
      <Ref text={source} />
    </ContentCard>
  );
}

function RememberContent({ activeSub, setActiveSub, visibleKeys }: { activeSub: RememberSub; setActiveSub: (s: RememberSub) => void; visibleKeys?: string[] }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div className="daily-subrail flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
        {rememberSubs.filter((sub) => !visibleKeys || visibleKeys.includes(sub.key)).map((sub) => (
          <button
            key={sub.key}
            onClick={() => setActiveSub(sub.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left flex items-center gap-2 ${
              activeSub === sub.key
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-themed-muted hover:text-themed border sidebar-border"
            }`}
          >
            {sub.icon}
            {sub.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSub}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeSub === "dunya" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ReminderCard
                  arabic="كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ ۗ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ الْقِيَامَةِ"
                  english="Every soul will taste death, and you will only be given your full compensation on the Day of Resurrection."
                  source="Quran 3:185"
                  delay={0.05}
                />
                <ReminderCard
                  arabic="اعْلَمُوا أَنَّمَا الْحَيَاةُ الدُّنْيَا لَعِبٌ وَلَهْوٌ وَزِينَةٌ وَتَفَاخُرٌ بَيْنَكُمْ وَتَكَاثُرٌ فِي الْأَمْوَالِ وَالْأَوْلَادِ"
                  english="Know that the life of this world is but amusement and diversion and adornment and boasting to one another and competition in increase of wealth and children."
                  source="Quran 57:20"
                  delay={0.1}
                />
                <ReminderCard
                  arabic="مَا الدُّنْيَا فِي الْآخِرَةِ إِلَّا مِثْلُ مَا يَجْعَلُ أَحَدُكُمْ إِصْبَعَهُ فِي الْيَمِّ فَلْيَنْظُرْ بِمَ يَرْجِعُ"
                  english="What is the dunya compared to the akhirah except like one of you dipping his finger in the sea — let him see what it returns with."
                  source="Muslim 53:66"
                  delay={0.15}
                />
                <ReminderCard
                  arabic="لَوْ كَانَتِ الدُّنْيَا تَعْدِلُ عِنْدَ اللَّهِ جَنَاحَ بَعُوضَةٍ مَا سَقَى كَافِرًا مِنْهَا شَرْبَةَ مَاءٍ"
                  english="If this world were worth the wing of a mosquito to Allah, He would not have given a disbeliever a single sip of water from it."
                  source="Tirmidhi 36:17"
                  delay={0.2}
                />
                <ReminderCard
                  arabic="كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ"
                  english="Be in this world as if you were a stranger or a traveler."
                  source="Bukhari 81:5"
                  delay={0.25}
                />
                <ReminderCard
                  arabic="وَمَا الْحَيَاةُ الدُّنْيَا إِلَّا مَتَاعُ الْغُرُورِ"
                  english="And the life of this world is nothing but the enjoyment of deception."
                  source="Quran 3:185"
                  delay={0.3}
                />
              </div>
            )}
            {activeSub === "death" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ReminderCard
                  arabic="أَكْثِرُوا ذِكْرَ هَاذِمِ اللَّذَّاتِ"
                  english="Remember often the destroyer of pleasures — death."
                  source="Tirmidhi 36:4"
                  delay={0.05}
                />
                <ReminderCard
                  arabic="وَمَا تَدْرِي نَفْسٌ مَاذَا تَكْسِبُ غَدًا ۖ وَمَا تَدْرِي نَفْسٌ بِأَيِّ أَرْضٍ تَمُوتُ"
                  english="No soul knows what it will earn tomorrow, and no soul knows in what land it will die."
                  source="Quran 31:34"
                  delay={0.1}
                />
                <ReminderCard
                  arabic="أَيْنَمَا تَكُونُوا يُدْرِكْكُمُ الْمَوْتُ وَلَوْ كُنْتُمْ فِي بُرُوجٍ مُشَيَّدَةٍ"
                  english="Wherever you may be, death will overtake you, even if you are in fortified towers."
                  source="Quran 4:78"
                  delay={0.15}
                />
                <ReminderCard
                  arabic="اغْتَنِمْ خَمْسًا قَبْلَ خَمْسٍ: شَبَابَكَ قَبْلَ هَرَمِكَ وَصِحَّتَكَ قَبْلَ سَقَمِكَ وَغِنَاكَ قَبْلَ فَقْرِكَ وَفَرَاغَكَ قَبْلَ شُغْلِكَ وَحَيَاتَكَ قَبْلَ مَوْتِكَ"
                  english="Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your busyness, and your life before your death."
                  source="Shu'ab al-Iman 10248"
                  delay={0.2}
                />
              </div>
            )}
            {activeSub === "grave" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ReminderCard
                  arabic="إِنَّ الْقَبْرَ أَوَّلُ مَنَازِلِ الْآخِرَةِ فَإِنْ نَجَا مِنْهُ فَمَا بَعْدَهُ أَيْسَرُ مِنْهُ وَإِنْ لَمْ يَنْجُ مِنْهُ فَمَا بَعْدَهُ أَشَدُّ مِنْهُ"
                  english="The grave is the first stage of the hereafter. If one is saved from it, then what comes after is easier. And if one is not saved from it, then what comes after is worse."
                  source="Tirmidhi 36:5"
                  delay={0.05}
                />
                <ReminderCard
                  arabic="يَتْبَعُ الْمَيِّتَ ثَلاَثَةٌ فَيَرْجِعُ اثْنَانِ وَيَبْقَى مَعَهُ وَاحِدٌ يَتْبَعُهُ أَهْلُهُ وَمَالُهُ وَعَمَلُهُ فَيَرْجِعُ أَهْلُهُ وَمَالُهُ وَيَبْقَى عَمَلُهُ"
                  english="Three follow the deceased: his family, his wealth, and his deeds. Two return and one remains — his family and wealth return, but his deeds remain with him."
                  source="Bukhari 81:103"
                  delay={0.1}
                />
                <ReminderCard
                  arabic="أَتَاهُ مَلَكَانِ أَسْوَدَانِ أَزْرَقَانِ يُقَالُ لأَحَدِهِمَا الْمُنْكَرُ وَالآخَرُ النَّكِيرُ فَيَقُولاَنِ مَا كُنْتَ تَقُولُ فِي هَذَا الرَّجُلِ"
                  english="One of them is called Al-Munkar, and the other An-Nakir. They say: 'What did you used to say about this man?'"
                  source="Tirmidhi 10:107"
                  delay={0.15}
                />
                <ReminderCard
                  arabic="إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلاَّ مِنْ ثَلاَثَةٍ مِنْ صَدَقَةٍ جَارِيَةٍ وَعِلْمٍ يُنْتَفَعُ بِهِ وَوَلَدٍ صَالِحٍ يَدْعُو لَهُ"
                  english="When a man dies all his good deeds come to an end except three: Ongoing charity (Sadaqah Jariyah), beneficial knowledge and a righteous son who prays for him"
                  source="Nasai 30:41; Ibn Majah 0:241"
                  delay={0.2}
                />
                <ReminderCard
                  arabic="زُورُوا الْقُبُورَ فَإِنَّهَا تُذَكِّرُكُمُ الآخِرَةَ"
                  english="Visit the graves, for they will remind you of the Hereafter."
                  source="Ibn Majah 6:137; Abu Dawud 21:147"
                  delay={0.25}
                />
              </div>
            )}
            {activeSub === "judgement" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ReminderCard
                  arabic="فَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ ۞ وَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ"
                  english="Whoever does an atom&apos;s weight of good will see it, and whoever does an atom&apos;s weight of evil will see it."
                  source="Quran 99:7-8"
                  delay={0.05}
                />
                <ReminderCard
                  arabic="يَوْمَ تَجِدُ كُلُّ نَفْسٍ مَا عَمِلَتْ مِنْ خَيْرٍ مُحْضَرًا وَمَا عَمِلَتْ مِنْ سُوءٍ تَوَدُّ لَوْ أَنَّ بَيْنَهَا وَبَيْنَهُ أَمَدًا بَعِيدًا"
                  english="The Day every soul will find what it has done of good presented before it, and what it has done of evil — it will wish there was a great distance between itself and that evil."
                  source="Quran 3:30"
                  delay={0.1}
                />
                <ReminderCard
                  arabic="لَا تَزُولُ قَدَمَا عَبْدٍ يَوْمَ الْقِيَامَةِ حَتَّى يُسْأَلَ عَنْ عُمُرِهِ فِيمَا أَفْنَاهُ وَعَنْ عِلْمِهِ فِيمَا فَعَلَ وَعَنْ مَالِهِ مِنْ أَيْنَ اكْتَسَبَهُ وَفِيمَا أَنْفَقَهُ وَعَنْ جِسْمِهِ فِيمَا أَبْلَاهُ"
                  english="The feet of a servant will not move on the Day of Judgement until he is asked about his life and how he spent it, his knowledge and what he did with it, his wealth and how he earned and spent it, and his body and how he used it."
                  source="Tirmidhi 37:3"
                  delay={0.15}
                />
                <ReminderCard
                  arabic="يَوْمَ يَفِرُّ الْمَرْءُ مِنْ أَخِيهِ ۞ وَأُمِّهِ وَأَبِيهِ ۞ وَصَاحِبَتِهِ وَبَنِيهِ ۞ لِكُلِّ امْرِئٍ مِنْهُمْ يَوْمَئِذٍ شَأْنٌ يُغْنِيهِ"
                  english="On the Day a man will flee from his brother, his mother, his father, his wife, and his children. For every person that Day will be a matter to occupy him."
                  source="Quran 80:34-37"
                  delay={0.2}
                />
              </div>
            )}
            {activeSub === "paradise" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ReminderCard
                  arabic="فَلَا تَعْلَمُ نَفْسٌ مَا أُخْفِيَ لَهُمْ مِنْ قُرَّةِ أَعْيُنٍ جَزَاءً بِمَا كَانُوا يَعْمَلُونَ"
                  english="No soul knows what has been hidden for them of comfort for the eyes as reward for what they used to do."
                  source="Quran 32:17"
                  delay={0.05}
                />
                <ReminderCard
                  arabic="أَعْدَدْتُ لِعِبَادِيَ الصَّالِحِينَ مَا لاَ عَيْنٌ رَأَتْ وَلاَ أُذُنٌ سَمِعَتْ وَلاَ خَطَرَ عَلَى قَلْبِ بَشَرٍ"
                  english="I have prepared for My righteous servants what no eye has seen, no ear has heard, and no human heart has ever imagined."
                  source="Bukhari 59:55"
                  delay={0.1}
                />
                <ReminderCard
                  arabic="وَالْآخِرَةُ خَيْرٌ وَأَبْقَىٰ"
                  english="And the Hereafter is better and more lasting."
                  source="Quran 87:17"
                  delay={0.15}
                />
                <ReminderCard
                  arabic="مَوْضِعُ سَوْطِ أَحَدِكُمْ مِنَ الْجَنَّةِ خَيْرٌ مِنَ الدُّنْيَا وَمَا عَلَيْهَا"
                  english="A space in Paradise the size of a whip is better than the entire world and everything in it."
                  source="Bukhari 56:107"
                  delay={0.2}
                />
                <ReminderCard
                  arabic="وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِنْ رَبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ"
                  english="And hasten to forgiveness from your Lord and a Garden as wide as the heavens and earth, prepared for the righteous."
                  source="Quran 3:133"
                  delay={0.25}
                />
                <ReminderCard
                  arabic="وُجُوهٌ يَوْمَئِذٍ نَاضِرَةٌ ۞ إِلَىٰ رَبِّهَا نَاظِرَةٌ"
                  english="Some faces that Day will be radiant, looking at their Lord."
                  source="Quran 75:22-23"
                  delay={0.3}
                />
              </div>
            )}
            {activeSub === "mercy" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ReminderCard
                  arabic="قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنْفُسِهِمْ لَا تَقْنَطُوا مِنْ رَحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا"
                  english="Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins."
                  source="Quran 39:53"
                  delay={0.05}
                />
                <ReminderCard
                  arabic="جَعَلَ اللَّهُ الرَّحْمَةَ مِائَةَ جُزْءٍ فَأَمْسَكَ عِنْدَهُ تِسْعَةً وَتِسْعِينَ جُزْءًا وَأَنْزَلَ فِي الْأَرْضِ جُزْءًا وَاحِدًا"
                  english="Allah divided mercy into one hundred parts. He kept ninety-nine parts with Himself and sent down one part to the earth — and from that one part comes all the compassion the creatures show to one another."
                  source="Bukhari 78:31"
                  delay={0.1}
                />
                <ReminderCard
                  arabic="إِنَّ مَعَ الْعُسْرِ يُسْرًا"
                  english="Indeed, with hardship comes ease."
                  source="Quran 94:6"
                  delay={0.15}
                />
                <ReminderCard
                  arabic="أَنَا عِنْدَ ظَنِّ عَبْدِي بِي"
                  english="I am as My servant thinks of Me."
                  source="Bukhari 97:34"
                  delay={0.2}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

function WorshipContent({ activeSub, setActiveSub, visibleKeys }: { activeSub: WorshipSub; setActiveSub: (s: WorshipSub) => void; visibleKeys?: string[] }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      {/* Left sub-tabs */}
      <div className="daily-subrail flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
        {worshipSubs.filter((sub) => !visibleKeys || visibleKeys.includes(sub.key)).map((sub) => (
          <button
            key={sub.key}
            onClick={() => setActiveSub(sub.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left flex items-center gap-2 ${
              activeSub === sub.key
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-themed-muted hover:text-themed border sidebar-border"
            }`}
          >
            {sub.icon}
            {sub.label}
          </button>
        ))}
      </div>

      {/* Right content */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSub}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeSub === "morning" && <MorningTab />}
            {activeSub === "afternoon" && <AfternoonTab />}
            {activeSub === "evening" && <EveningTab />}
            {activeSub === "sleep" && <SleepTab />}
            {activeSub === "midnight" && <MidnightTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Sources & References — aggregated from the refs already shown on this page's
   cards, KEYED BY SUB-VIEW so the card always reflects the current selection. */
const worshipSources: Record<WorshipSub, { ref: string; desc: string }[]> = {
  morning: [{ ref: "Bukhari 80:9; Muslim 6:118; Nasai, Sunan al-Kubra 9928; Abu Dawud 43:310; Muslim 5:188; Bukhari 80:100; Bukhari 80:98; Abu Dawud 43:305; Tirmidhi 48:22; Muslim 48:101; Ibn Majah 34:43; Abu Dawud 8:114; Abu Dawud 43:300; Abu Dawud 43:318; Tirmidhi 48:111; Quran 17:78; Muslim 6:101", desc: "Morning — waking, Fajr, the morning adhkar, Quran time, and Duha" }],
  afternoon: [{ ref: "Tirmidhi 2:281; Tirmidhi 48:14; Ibn Majah 5:123; Quran 2:238; Bukhari 78:52; Muslim 45:90; Hakim Mustadrak 1:564; Abu Dawud 8:116; Bukhari 11:59; Abu Dawud 2:659", desc: "Afternoon — Dhuhr, midday dhikr, Asr, charity, and the Friday sunnahs" }],
  evening: [{ ref: "Bukhari 9:50; Abu Dawud 43:302; Bukhari 80:3; Muslim 48:101; Abu Dawud 8:114; Abu Dawud 43:300; Abu Dawud 43:318; Tirmidhi 48:111; Abu Dawud 29:44; Abu Dawud 29:45; Tirmidhi 48:236; Bukhari 14:9; Bukhari 78:69; Muslim 6:252; Tirmidhi 45:3", desc: "Evening — Maghrib, the evening adhkar, Isha & Witr, and family time" }],
  sleep: [{ ref: "Bukhari 80:8; Muslim 48:75; Bukhari 66:39; Bukhari 40:11; Bukhari 66:31; Abu Dawud 43:273; Bukhari 91:5; Bukhari 19:35; Ibn Majah 34:55; Bukhari 80:4", desc: "Before sleep — the sleep sunnahs, bedtime duas, bad dreams, and istighfar" }],
  midnight: [{ ref: "Muslim 6:147; Bukhari 19:26; Muslim 52:77; Tirmidhi 2:265; Nasai 20:47; Bukhari 19:1; Quran 3:17; Bukhari 30:32", desc: "Midnight — Tahajjud, Allah's nearness in the last third, Witr, and suhoor" }],
};
const sunnahSources: Record<SunnahSub, { ref: string; desc: string }[]> = {
  eating: [{ ref: "Abu Dawud 28:32; Muslim 36:139; Bukhari 70:4; Abu Dawud 27:54; Muslim 36:148; Muslim 48:123; Abu Dawud 34:4; Tirmidhi 48:89; Bukhari 70:37; Muslim 36:254; Ibn Majah 29:37; Abu Dawud 28:29; Tirmidhi 36:77; Bukhari 74:57", desc: "Eating & drinking" }],
  greeting: [{ ref: "Bukhari 79:5; Quran 4:86; Bukhari 2:5; Abu Dawud 43:421; Ibn Majah 0:68; Abu Dawud 43:439; Abu Dawud 43:440; Bukhari 79:37; Tirmidhi 43:1; Bukhari 23:4", desc: "Greeting" }],
  entering: [{ ref: "Bukhari 4:34; Abu Dawud 43:324; Muslim 6:82; Muslim 36:136; Bukhari 4:8; Bukhari 80:19; Abu Dawud 1:6; Abu Dawud 1:30; Abu Dawud 1:9; Abu Dawud 1:31; Abu Dawud 43:323", desc: "Entering & leaving" }],
  dress: [{ ref: "Bukhari 70:8; Bukhari 11:12; Muslim 2:64; Abu Dawud 34:1; Tirmidhi 48:191; Ibn Majah 32:8", desc: "Dress & appearance" }],
  speech: [{ ref: "Bukhari 78:49; Quran 49:12; Bukhari 78:121; Bukhari 78:143; Abu Dawud 43:10; Tirmidhi 27:62; Tirmidhi 40:11; Ibn Majah 36:48", desc: "Speech & conduct" }],
  sleeping: [{ ref: "Bukhari 80:8; Bukhari 4:113; Abu Dawud 43:268; Abu Dawud 43:283", desc: "Sleeping" }],
  sneezing: [{ ref: "Bukhari 78:248; Bukhari 78:245; Bukhari 78:250; Bukhari 78:247; Abu Dawud 43:254", desc: "Sneezing & yawning" }],
  sick: [{ ref: "Abu Dawud 21:10; Ibn Majah 6:10; Abu Dawud 21:18; Bukhari 77:66", desc: "Visiting the sick" }],
};
const reminderSources: Record<RememberSub, { ref: string; desc: string }[]> = {
  dunya: [{ ref: "Quran 3:185; Quran 57:20; Muslim 53:66; Tirmidhi 36:17; Bukhari 81:5", desc: "Dunya is temporary" }],
  death: [{ ref: "Tirmidhi 36:4; Quran 31:34; Quran 4:78; Shu'ab al-Iman 10248", desc: "Death is near" }],
  grave: [{ ref: "Tirmidhi 36:5; Bukhari 81:103; Tirmidhi 10:107; Nasai 30:41; Ibn Majah 0:241; Ibn Majah 6:137; Abu Dawud 21:147", desc: "The grave" }],
  judgement: [{ ref: "Quran 99:7-8; Quran 3:30; Tirmidhi 37:3; Quran 80:34-37", desc: "Day of Judgement" }],
  paradise: [{ ref: "Quran 32:17; Bukhari 59:55; Quran 87:17; Bukhari 56:107; Quran 3:133; Quran 75:22-23", desc: "Paradise awaits" }],
  mercy: [{ ref: "Quran 39:53; Bukhari 78:31; Quran 94:6; Bukhari 97:34", desc: "Hope & mercy" }],
};

function MuslimDailyContent() {
  const isNative = useIsNative();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<MainTab>(
    () => resolveMainTab(searchParams.get("tab")) ?? "worship"
  );
  const [worshipSub, setWorshipSub] = useState<WorshipSub>(() => {
    const sub = searchParams.get("sub");
    if (sub === "morning" || sub === "afternoon" || sub === "evening" || sub === "sleep" || sub === "midnight") return sub;
    return "morning";
  });
  const [sunnahSub, setSunnahSub] = useState<SunnahSub>("eating");
  const [rememberSub, setRememberSub] = useState<RememberSub>("dunya");
  const [search, setSearch] = useState("");

  /* search filters the (tab, sub) rails via the searchIndex and jumps to the
     first matching view; clearing the query restores everything */
  const matched = useMemo(
    () =>
      search.trim().length >= 2
        ? searchIndex.filter((e) => textMatch(search, e.label, e.tab, ...e.keywords))
        : null,
    [search]
  );
  const visibleFor = (tab: MainTab): string[] | undefined =>
    matched ? matched.filter((m) => m.tab === tab).map((m) => m.sub) : undefined;

  useEffect(() => {
    if (!matched || matched.length === 0) return;
    const currentSub =
      activeTab === "worship" ? worshipSub
      : activeTab === "sunnah" ? sunnahSub
      : activeTab === "reminders" ? rememberSub
      : undefined;
    const stillVisible = matched.some(
      (m) => m.tab === activeTab && (currentSub === undefined || m.sub === currentSub)
    );
    if (!stillVisible) {
      const first = matched[0];
      setActiveTab(first.tab);
      if (first.tab === "worship") setWorshipSub(first.sub as WorshipSub);
      else if (first.tab === "sunnah") setSunnahSub(first.sub as SunnahSub);
      else if (first.tab === "reminders") setRememberSub(first.sub as RememberSub);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  const changeTab = (tab: MainTab) => {
    setActiveTab(tab);
    const qs = tab === "worship" ? `tab=worship&sub=${worshipSub}` : `tab=${tab}`;
    router.replace(`/muslim-daily?${qs}`, { scroll: false });
  };
  const changeWorshipSub = (sub: WorshipSub) => {
    setWorshipSub(sub);
    router.replace(`/muslim-daily?tab=worship&sub=${sub}`, { scroll: false });
  };

  return (
    <div>
      <PageHeader
        title="Muslim Daily"
        titleAr="يوميات المسلم"
        subtitle="Your daily guide to living the Sunnah — organized by time of day"
      />

      <VerseHero
        label="The Prophet ﷺ said"
        arabic="فَوَاللَّهِ لَلدُّنْيَا أَهْوَنُ عَلَى اللَّهِ مِنْ هَذَا عَلَيْكُمْ"
        text="By Allah, this world is more insignificant in the eye of Allah than this dead lamb is in your eyes."
        reference="Muslim 55:2"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search worship, sunnahs, reminders..." className="mb-6" />

      <div
        className={
          isNative
            ? "sticky top-0 z-20 -mx-3 px-3 py-2 bg-[var(--color-bg)]/85 backdrop-blur-xl"
            : ""
        }
      >

        <TabBar
          tabs={mainTabs.map((t) => ({ key: t.key, label: t.label, icon: t.icon, highlight: t.highlight }))}
          activeTab={activeTab}
          onTabChange={(key) => changeTab(key as MainTab)}
          mobileThreshold={4}
          wrap={isNative}
        />

        <div className={isNative ? "mt-4" : "mt-6"}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "worship" && (
                <>
                  <WorshipContent activeSub={worshipSub} setActiveSub={changeWorshipSub} visibleKeys={visibleFor("worship")} />
                  <SourcesCard className="mt-8" sources={worshipSources[worshipSub]} />
                </>
              )}
              {activeTab === "sunnah" && (
                <>
                  <SunnahContent activeSub={sunnahSub} setActiveSub={setSunnahSub} visibleKeys={visibleFor("sunnah")} />
                  <SourcesCard className="mt-8" sources={sunnahSources[sunnahSub]} />
                </>
              )}
              {activeTab === "checklist" && <ChecklistTab />}
              {activeTab === "reminders" && (
                <>
                  <RememberContent activeSub={rememberSub} setActiveSub={setRememberSub} visibleKeys={visibleFor("reminders")} />
                  <SourcesCard className="mt-8" sources={reminderSources[rememberSub]} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function MuslimDailyPage() {
  return (
    <Suspense>
      <DailyRouter />
    </Suspense>
  );
}

// Native app gets the redesigned Daily experience; the website keeps the
// existing page. useIsNative() is false on web (and on first native paint, then
// flips true) — the brief first frame is hidden by MobileShell's opacity fade.
function DailyRouter() {
  const isNative = useIsNative();
  if (isNative) return <DailyScreen />;
  return <MuslimDailyContent />;
}
