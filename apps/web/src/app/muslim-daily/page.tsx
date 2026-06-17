"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import BookmarkButton from "@hidden-hiqmah/ui/components/BookmarkButton";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import { useIsNative } from "@/lib/mobile/platform";
import DailyScreen from "@/components/mobile/screens/DailyScreen";
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
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════════════════ */

type MainTab = "worship" | "sunnah" | "checklist" | "remember";
type WorshipSub = "morning" | "afternoon" | "evening" | "sleep" | "midnight";
type SunnahSub = "eating" | "greeting" | "entering" | "dress" | "speech" | "sleeping";
type RememberSub = "dunya" | "death" | "grave" | "judgement" | "paradise" | "mercy";

const mainTabs: { key: MainTab; label: string; icon: React.ReactNode; highlight?: boolean }[] = [
  { key: "worship", label: "Worship", icon: <BookOpen size={16} /> },
  { key: "sunnah", label: "Sunnah Acts", icon: <Heart size={16} /> },
  { key: "remember", label: "Reminders", icon: <Flame size={16} /> },
  { key: "checklist", label: "Daily Checklist", icon: <CheckSquare size={16} />, highlight: true },
];

const worshipSubs: { key: WorshipSub; label: string; icon: React.ReactNode }[] = [
  { key: "morning", label: "Morning", icon: <Sun size={16} /> },
  { key: "afternoon", label: "Afternoon", icon: <CloudSun size={16} /> },
  { key: "evening", label: "Evening", icon: <Moon size={16} /> },
  { key: "sleep", label: "Before Sleep", icon: <BedDouble size={16} /> },
  { key: "midnight", label: "Midnight", icon: <Star size={16} /> },
];

const sunnahSubs: { key: SunnahSub; label: string; icon: React.ReactNode }[] = [
  { key: "eating", label: "Eating & Drinking", icon: <UtensilsCrossed size={16} /> },
  { key: "greeting", label: "Greeting", icon: <HandHeart size={16} /> },
  { key: "entering", label: "Entering & Leaving", icon: <DoorOpen size={16} /> },
  { key: "dress", label: "Dress & Appearance", icon: <Shirt size={16} /> },
  { key: "speech", label: "Speech & Conduct", icon: <MessageCircle size={16} /> },
  { key: "sleeping", label: "Sleeping", icon: <Bed size={16} /> },
];

const rememberSubs: { key: RememberSub; label: string; icon: React.ReactNode }[] = [
  { key: "dunya", label: "Dunya is Temporary", icon: <Hourglass size={16} /> },
  { key: "death", label: "Death is Near", icon: <Skull size={16} /> },
  { key: "grave", label: "The Grave", icon: <Landmark size={16} /> },
  { key: "judgement", label: "Day of Judgement", icon: <Scale size={16} /> },
  { key: "paradise", label: "Paradise Awaits", icon: <Sparkles size={16} /> },
  { key: "mercy", label: "Hope & Mercy", icon: <HeartHandshake size={16} /> },
];

const checklistItems = [
  { id: "pray5", label: "Prayed all 5 prayers" },
  { id: "quran", label: "Read Quran (even 1 page)" },
  { id: "morning-adhkar", label: "Morning adhkar" },
  { id: "evening-adhkar", label: "Evening adhkar" },
  { id: "dhikr", label: "Made dhikr (SubhanAllah, Alhamdulillah, Allahu Akbar)" },
  { id: "salawat", label: "Sent salawat on the Prophet \uFDFA" },
  { id: "charity", label: "Gave charity (even a smile)" },
  { id: "kindness", label: "Was kind / helped someone" },
  { id: "dua-others", label: "Made dua for others" },
  { id: "istighfar", label: "Sought forgiveness (istighfar)" },
  { id: "avoid-sin", label: "Avoided a sin / lowered gaze" },
  { id: "learn-deen", label: "Learned something about the deen" },
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

function MorningTab() {
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
              href="/muslim-daily?tab=morning"
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
              href="/muslim-daily?tab=morning"
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
            reference="Bukhari 80:98"
            delay={0}
          />
          <AdhkarItem
            arabic="اللّهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور"
            transliteration="Allahumma bika asbahna wa bika amsayna, wa bika nahya wa bika namutu, wa ilaykan-nushur"
            english="O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection."
            reference="Tirmidhi 48:22"
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
              href="/muslim-daily?tab=morning"
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
              href="/muslim-daily?tab=morning"
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

function AfternoonTab() {
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
              </ul>
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

function EveningTab() {
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

function SleepTab() {
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

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function ChecklistTab() {
  const [checked, setChecked] = useState<string[]>([]);
  const [streak, setStreak] = useState({ current: 0, best: 0, lastDate: "" });
  const [weekData, setWeekData] = useState<boolean[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const today = getToday();

      // Load checklist
      const raw = localStorage.getItem("hiqmah-daily-checklist");
      const all: Record<string, string[]> = raw ? JSON.parse(raw) : {};
      setChecked(all[today] || []);

      // Load streak
      const sRaw = localStorage.getItem("hiqmah-daily-streak");
      const s = sRaw ? JSON.parse(sRaw) : { current: 0, best: 0, lastDate: "" };
      setStreak(s);

      // Build week data (last 7 days)
      const week: boolean[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        week.push((all[key] || []).length >= 5);
      }
      setWeekData(week);
    } catch {
      // ignore
    }
  }, []);

  const toggle = (id: string) => {
    const today = getToday();
    let next: string[];
    if (checked.includes(id)) {
      next = checked.filter((c) => c !== id);
    } else {
      next = [...checked, id];
    }
    setChecked(next);

    // Save checklist
    try {
      const raw = localStorage.getItem("hiqmah-daily-checklist");
      const all: Record<string, string[]> = raw ? JSON.parse(raw) : {};
      all[today] = next;
      localStorage.setItem("hiqmah-daily-checklist", JSON.stringify(all));
    } catch {
      // ignore
    }

    // Update streak
    try {
      const sRaw = localStorage.getItem("hiqmah-daily-streak");
      const s = sRaw ? JSON.parse(sRaw) : { current: 0, best: 0, lastDate: "" };

      if (next.length >= 5) {
        if (s.lastDate !== today) {
          // Check if yesterday was completed
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yKey = yesterday.toISOString().slice(0, 10);

          if (s.lastDate === yKey) {
            s.current += 1;
          } else {
            s.current = 1;
          }
          s.lastDate = today;
          s.best = Math.max(s.best, s.current);
        }
      }
      setStreak(s);
      localStorage.setItem("hiqmah-daily-streak", JSON.stringify(s));
    } catch {
      // ignore
    }

    // Update week data
    setWeekData((prev) => {
      const copy = [...prev];
      copy[6] = next.length >= 5;
      return copy;
    });
  };

  const completed = checked.length;
  const pct = Math.round((completed / checklistItems.length) * 100);

  return (
    <div className="space-y-5">
      {/* Progress Banner */}
      <ContentCard delay={0.05}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-themed">
            {completed} / {checklistItems.length} completed today
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <Flame size={16} className="text-gold" />
            <span className="text-gold font-semibold">{streak.current} day streak</span>
            <span className="text-themed-muted text-xs">Best: {streak.best}</span>
            <BookmarkButton
              type="page"
              id="/muslim-daily?tab=checklist"
              title="Daily Checklist"
              subtitle="Muslim Daily"
              href="/muslim-daily?tab=checklist"
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 rounded-full bg-themed-muted/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Weekly summary */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-themed-muted text-xs mr-1">Last 7 days:</span>
          {weekData.map((done, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-colors ${
                done
                  ? "bg-gold border-gold"
                  : "bg-transparent border-themed-muted/20"
              }`}
            />
          ))}
        </div>
      </ContentCard>

      {/* Checklist Items */}
      <div className="space-y-2">
        {checklistItems.map((item, i) => {
          const isChecked = checked.includes(item.id);
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.03 }}
              onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-3 card-bg rounded-xl border sidebar-border p-4 card-hover text-left"
            >
              <motion.div
                animate={isChecked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isChecked
                    ? "bg-gold border-gold"
                    : "border-themed-muted/30 bg-transparent"
                }`}
              >
                {isChecked && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-black"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                )}
              </motion.div>
              <span
                className={`text-sm transition-colors ${
                  isChecked ? "text-themed-muted line-through" : "text-themed"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Midnight (Last Third of the Night)
   ═══════════════════════════════════════════════════════════════════ */

function MidnightTab() {
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

function SunnahContent({ activeSub, setActiveSub }: { activeSub: SunnahSub; setActiveSub: (s: SunnahSub) => void }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div className="daily-subrail flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
        {sunnahSubs.map((sub) => (
          <button
            key={sub.key}
            onClick={() => setActiveSub(sub.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-left flex items-center gap-2 ${
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
          href="/muslim-daily?tab=remember"
        />
      </div>
      <p className="text-themed-muted text-sm leading-relaxed italic mb-2">&ldquo;{english}&rdquo;</p>
      <Ref text={source} />
    </ContentCard>
  );
}

function RememberContent({ activeSub, setActiveSub }: { activeSub: RememberSub; setActiveSub: (s: RememberSub) => void }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div className="daily-subrail flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
        {rememberSubs.map((sub) => (
          <button
            key={sub.key}
            onClick={() => setActiveSub(sub.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-left flex items-center gap-2 ${
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

function WorshipContent({ activeSub, setActiveSub }: { activeSub: WorshipSub; setActiveSub: (s: WorshipSub) => void }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      {/* Left sub-tabs */}
      <div className="daily-subrail flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
        {worshipSubs.map((sub) => (
          <button
            key={sub.key}
            onClick={() => setActiveSub(sub.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-left flex items-center gap-2 ${
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

function MuslimDailyContent() {
  const isNative = useIsNative();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    const tab = searchParams.get("tab");
    if (tab === "worship" || tab === "sunnah" || tab === "checklist" || tab === "remember") return tab;
    return "worship";
  });
  const [worshipSub, setWorshipSub] = useState<WorshipSub>(() => {
    const sub = searchParams.get("sub");
    if (sub === "morning" || sub === "afternoon" || sub === "evening" || sub === "sleep" || sub === "midnight") return sub;
    return "morning";
  });
  const [sunnahSub, setSunnahSub] = useState<SunnahSub>("eating");
  const [rememberSub, setRememberSub] = useState<RememberSub>("dunya");

  return (
    <div>
      <PageHeader
        title="Muslim Daily"
        titleAr="يوميات المسلم"
        subtitle="Your daily guide to living the Sunnah — organized by time of day"
      />

      <ContentCard className={isNative ? "mb-4" : "mb-6"}>
        <div className="text-center py-4">
          <p className="text-2xl font-arabic text-gold leading-loose mb-3">
            فَوَاللَّهِ لَلدُّنْيَا أَهْوَنُ عَلَى اللَّهِ مِنْ هَذَا عَلَيْكُمْ
          </p>
          <p className="text-themed-muted italic">&ldquo;By Allah, this world is more insignificant in the eye of Allah than this dead lamb is in your eyes.&rdquo;</p>
          <p className="text-xs text-themed-muted mt-1">Muslim 55:2</p>
        </div>
      </ContentCard>

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
          onTabChange={(key) => setActiveTab(key as MainTab)}
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
              {activeTab === "worship" && <WorshipContent activeSub={worshipSub} setActiveSub={setWorshipSub} />}
              {activeTab === "sunnah" && <SunnahContent activeSub={sunnahSub} setActiveSub={setSunnahSub} />}
              {activeTab === "checklist" && <ChecklistTab />}
              {activeTab === "remember" && <RememberContent activeSub={rememberSub} setActiveSub={setRememberSub} />}
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
