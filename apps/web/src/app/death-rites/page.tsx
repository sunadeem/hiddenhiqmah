"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import SubTabLayout from "@hidden-hiqmah/ui/components/SubTabLayout";
import BookmarkButton from "@hidden-hiqmah/ui/components/BookmarkButton";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard, { type SourceRef } from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import {
  BookOpen,
  HandHeart,
  Hourglass,
  Bed,
  Droplets,
  Mountain,
  CloudRain,
  Footprints,
  Award,
  ScrollText,
  Sparkles,
  Moon,
  Star,
  Swords,
  Medal,
  Heart,
  ArrowDown,
  Users,
  Baby,
  ClipboardList,
  Sunrise,
  HelpCircle,
  Route,
  HeartHandshake,
  Gift,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES & TABS
   ═══════════════════════════════════════════════════════════════════ */

type MainTab = "preparing" | "dying" | "types-of-death" | "washing-janazah" | "burial" | "grief-visiting";
type RailTab = MainTab;
type PreparingSub = "reality" | "affairs" | "good-ending" | "checklist";
type DyingSub = "bedside" | "words-dua" | "departure" | "meeting-allah";
type TypesOfDeathSub = "good-end" | "battlefield-martyr" | "martyrs-of-reward" | "seeking-martyrdom" | "children";
type WashingJanazahSub = "washing" | "janazah" | "special-cases";
type BurialSub = "procession" | "grave" | "lowering" | "after-burial" | "women";
type GriefVisitingSub = "grief" | "consoling" | "visiting" | "reaches";

const mainTabs: { key: MainTab; label: string; icon: React.ReactNode }[] = [
  { key: "preparing", label: "Preparing", icon: <Hourglass size={16} /> },
  { key: "dying", label: "The Dying", icon: <Bed size={16} /> },
  { key: "types-of-death", label: "Types of Death", icon: <Award size={16} /> },
  { key: "washing-janazah", label: "Washing & Janazah", icon: <Droplets size={16} /> },
  { key: "burial", label: "Burial", icon: <Mountain size={16} /> },
  { key: "grief-visiting", label: "Grief & Visiting", icon: <CloudRain size={16} /> },
];

const preparingSubs: { key: PreparingSub; label: string; icon: React.ReactNode }[] = [
  { key: "reality", label: "Reality of Death", icon: <Hourglass size={16} /> },
  { key: "affairs", label: "Set Your Affairs", icon: <ScrollText size={16} /> },
  { key: "good-ending", label: "A Good Ending", icon: <Sparkles size={16} /> },
  { key: "checklist", label: "Practical Checklist", icon: <ClipboardList size={16} /> },
];

const dyingSubs: { key: DyingSub; label: string; icon: React.ReactNode }[] = [
  { key: "bedside", label: "At the Bedside", icon: <Bed size={16} /> },
  { key: "words-dua", label: "Words & Du'a", icon: <HandHeart size={16} /> },
  { key: "departure", label: "The Soul Departs", icon: <Moon size={16} /> },
  { key: "meeting-allah", label: "Meeting Allah", icon: <Sunrise size={16} /> },
];

const typesOfDeathSubs: { key: TypesOfDeathSub; label: string; icon: React.ReactNode }[] = [
  { key: "good-end", label: "The Good End", icon: <Star size={16} /> },
  { key: "battlefield-martyr", label: "Battlefield Martyr", icon: <Swords size={16} /> },
  { key: "martyrs-of-reward", label: "Martyrs of Reward", icon: <Medal size={16} /> },
  { key: "seeking-martyrdom", label: "Seeking Martyrdom", icon: <Heart size={16} /> },
  { key: "children", label: "Children Who Die Young", icon: <Baby size={16} /> },
];

const burialSubs: { key: BurialSub; label: string; icon: React.ReactNode }[] = [
  { key: "procession", label: "The Procession", icon: <Route size={16} /> },
  { key: "grave", label: "The Grave", icon: <Mountain size={16} /> },
  { key: "lowering", label: "Lowering & Closing", icon: <ArrowDown size={16} /> },
  { key: "after-burial", label: "After Burial", icon: <HandHeart size={16} /> },
  { key: "women", label: "Women & Burial", icon: <Users size={16} /> },
];

const washingJanazahSubs: { key: WashingJanazahSub; label: string; icon: React.ReactNode }[] = [
  { key: "washing", label: "Washing & Shrouding", icon: <Droplets size={16} /> },
  { key: "janazah", label: "Janazah Prayer", icon: <HandHeart size={16} /> },
  { key: "special-cases", label: "Special Cases", icon: <HelpCircle size={16} /> },
];

const griefVisitingSubs: { key: GriefVisitingSub; label: string; icon: React.ReactNode }[] = [
  { key: "grief", label: "Grief & Patience", icon: <CloudRain size={16} /> },
  { key: "consoling", label: "Consoling Others", icon: <HeartHandshake size={16} /> },
  { key: "visiting", label: "Visiting Graves", icon: <Footprints size={16} /> },
  { key: "reaches", label: "What Reaches Them", icon: <Gift size={16} /> },
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
   HELPER: VerseCard (Arabic + English + reference + bookmark)
   ═══════════════════════════════════════════════════════════════════ */

function VerseCard({
  arabic,
  transliteration,
  english,
  source,
  delay = 0,
}: {
  arabic: string;
  transliteration?: string;
  english: string;
  source: string;
  delay?: number;
}) {
  return (
    <ContentCard delay={delay}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-arabic text-gold text-lg leading-loose mb-2 flex-1">{arabic}</p>
        <BookmarkButton
          type="hadith"
          id={`family-${source.replace(/\s+/g, "-").toLowerCase()}`}
          title={english.slice(0, 60) + "..."}
          href="/death-rites"
        />
      </div>
      {transliteration && (
        <p className="text-themed text-sm leading-relaxed mb-1">{transliteration}</p>
      )}
      <p className="text-themed-muted text-sm leading-relaxed italic mb-1">&ldquo;{english}&rdquo;</p>
      <Ref text={source} />
    </ContentCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB CONTENT (moved verbatim from /family → Death)
   ═══════════════════════════════════════════════════════════════════ */

function PreparingRealitySub() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Prophet ﷺ told us to remember death often — not to be morbid, but to live with clarity. A believer prepares for death the way a traveler prepares for a long journey: by setting affairs in order, paying debts, asking forgiveness, and asking Allah for a beautiful ending.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">The Reality of Death</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ ۗ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ الْقِيَامَةِ"
          transliteration="Kullu nafsin dha'iqatu al-mawt, wa innama tuwaffawna ujurakum yawma al-qiyamah"
          english="Every soul will taste death, and you will only be given your full compensation on the Day of Resurrection."
          source="Quran 3:185"
          delay={0.08}
        />
        <VerseCard
          arabic="وَمَا تَدْرِي نَفْسٌ مَاذَا تَكْسِبُ غَدًا ۖ وَمَا تَدْرِي نَفْسٌ بِأَيِّ أَرْضٍ تَمُوتُ"
          transliteration="Wa ma tadri nafsun madha taksibu ghadan, wa ma tadri nafsun bi'ayyi ardin tamut"
          english="No soul knows what it will earn tomorrow, and no soul knows in what land it will die."
          source="Quran 31:34"
          delay={0.11}
        />
        <VerseCard
          arabic="أَكْثِرُوا ذِكْرَ هَاذِمِ اللَّذَّاتِ"
          transliteration="Akthiru dhikra hadhimi al-ladhdhat"
          english="Remember often the destroyer of pleasures — death."
          source="Tirmidhi 36:4"
          delay={0.14}
        />
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Two return, one remains</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Three things follow the bier of a dead man. Two of them come back and one is left with him: the members of his family, wealth and his good deeds. The members of his family and wealth come back and the deeds alone are left with him.&quot; When they carry you out, everything you spent your life chasing walks back home. Only what you sent ahead stays.
          </p>
          <Ref text="Muslim 55:8" />
        </ContentCard>
      </div>
    </div>
  );
}

function PreparingAffairsSub() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Practical Preparation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Write your wasiyyah</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;It is not right for a Muslim who has something to bequeath to spend two nights without having his will written down with him.&quot; Write down debts, instructions for janazah, ghusl, burial, and any final bequests (up to one-third of your estate to non-heirs).
          </p>
          <Ref text="Bukhari 55:1" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Settle debts</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The soul of a believer remains attached to their debt until it is settled. Pay off what you can now, leave clear records, and tell trusted family members so they can fulfill what remains.
          </p>
          <Ref text="Tirmidhi 10:114" />
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Make sincere tawbah</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Do not delay repentance. Allah accepts the tawbah of a servant as long as the soul has not reached the throat. Return rights you owe to others, ask forgiveness from those you have wronged, and ask Allah daily for forgiveness.
          </p>
          <Ref text="Tirmidhi 48:168" />
        </ContentCard>
      </div>
    </div>
  );
}

function PreparingGoodEndingSub() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ وَلَا تَمُوتُنَّ إِلَّا وَأَنتُم مُّسْلِمُونَ"
          transliteration="Ya ayyuhal-ladhina amanu-ttaqu Allaha haqqa tuqatihi wa la tamutunna illa wa antum muslimun"
          english="O you who believe, fear Allah as He should be feared, and do not die except as Muslims."
          source="Quran 3:102"
          delay={0.26}
        />
        <ContentCard delay={0.275}>
          <h5 className="text-gold font-medium mb-2">Ask for husn al-khatimah</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A &quot;good ending&quot; — leaving this world upon iman, on a good deed, with the shahada on your tongue. Allah commands us to live in such a way that we never die in any state but Islam. Ask Him for this every day: that He gather you among the believers at the moment of death, and let your final word be the shahada.
          </p>
          <Ref text="Quran 3:102" />
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Visit the graves</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Visit the graves, for they remind you of the Hereafter.&quot; A short walk through a cemetery does what a hundred lectures cannot.
          </p>
          <Ref text="Muslim 11:136" />
        </ContentCard>
        <ContentCard delay={0.32}>
          <h5 className="text-gold font-medium mb-2">Live as if today is the day</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Ibn Umar (RA) said: &quot;When you reach the evening, do not expect the morning. When you reach the morning, do not expect the evening. Take from your health for your sickness, and from your life for your death.&quot;
          </p>
          <Ref text="Bukhari 81:5" />
        </ContentCard>
      </div>
    </div>
  );
}

function PreparingChecklistSub() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          When a Muslim dies in the West, the family is often thrown — in the first hours of grief — into a system built around funeral homes, embalming, and cremation, none of which match how Islam buries its dead. The Sunnah is speed, simplicity, and dignity: <span className="italic">&quot;Hasten with the funeral.&quot;</span> The steps below are a practical map, not a fatwa — confirm details with your local masjid and follow the fiqh on the other sub-tabs.
        </p>
        <Ref text="Bukhari 23:73" />
        <Link href="/death-rites?tab=preparing&sub=affairs" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Set your affairs before this day comes →
        </Link>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">The First 24 Hours</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">1. Call the masjid&apos;s janazah service first</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Before the funeral home, before anything, contact your local masjid or an Islamic funeral service. Most established communities have a dedicated janazah team or a partnered Muslim funeral home that handles ghusl, kafan, the janazah prayer, and a burial without embalming. They will walk a first-timer through every step.
          </p>
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">2. Obtain the death certificate</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A licensed physician, hospice nurse, or coroner must pronounce death and sign the paperwork; the funeral service then files for the death certificate and burial/transit permit. This is what legally allows burial to proceed. Ask for several certified copies — banks, employers, and estates will each require one.
          </p>
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">3. Decline embalming and cremation</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Both are contrary to Islamic burial. Embalming (injecting chemicals) is a default many homes assume and is not legally required for a prompt burial. Cremation is forbidden — the body is honored, washed, and returned whole to the earth. State clearly, in writing if asked, that the family declines both on religious grounds.
          </p>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">4. If an autopsy is requested</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Autopsy is only obligatory when the law requires it (e.g. an unexplained or suspicious death). Where it is optional, the family may respectfully decline to preserve the body&apos;s dignity and avoid delay. If one is legally mandated, it is permitted by necessity — cooperate, and resume the Islamic process as soon as the body is released.
          </p>
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Burial Decisions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Hasten the burial — do not wait for travel</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Sunnah is to bury quickly, ideally within a day. Try not to delay for distant relatives to arrive; they can pray the janazah in absentia or visit the grave later. Refrigeration for a short, necessary delay is acceptable — a long delay for convenience is against the Sunnah.
          </p>
          <Ref text="Bukhari 23:73" />
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Local burial vs. repatriation</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Shipping the body to a home country delays burial by many days and is costly. The overwhelming scholarly preference is to bury where the person died, in the nearest Muslim cemetery — the earth of Allah is one, and hastening the burial takes priority. Repatriate only where there is a genuine, weighty reason.
          </p>
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Muslim cemetery sections</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Many cities have a dedicated Muslim cemetery or a Muslim section within a larger one, where graves face the qibla and vaults/liners can be minimized. The masjid can tell you which plots are available. Ask about a simple in-ground burial without a concrete vault where local ordinances allow it.
          </p>
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Costs and who pays</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A Muslim burial is deliberately modest — a plain shroud, a simple plot, no lavish casket. Community janazah funds often subsidize or cover the cost for those in need; do not let expense drive the family toward a cheaper haram option like cremation. If the deceased left debts, settling them is a priority on the estate.
          </p>
          <Link href="/death-rites?tab=preparing&sub=affairs" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Settling debts and the wasiyyah →
          </Link>
        </ContentCard>
      </div>
    </div>
  );
}

function DyingBedsideSub() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The moments at someone&apos;s deathbed are sacred. The angels are present, the soul is on the threshold, and what is said and done has weight beyond what we can see. The Prophet ﷺ gave precise guidance for this time.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">Prompt them with the shahada</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Prompt your dying with <span className="font-arabic text-gold">لَا إِلَٰهَ إِلَّا اللَّهُ</span> — La ilaha illa Allah.&quot; Gently say it near them — do not pressure them to repeat it. If they say it last, they have a promise of Paradise.
          </p>
          <Ref text="Muslim 11:1" />
        </ContentCard>
        <VerseCard
          arabic="مَنْ كَانَ آخِرُ كَلَامِهِ لَا إِلَهَ إِلَّا اللَّهُ دَخَلَ الْجَنَّةَ"
          transliteration="Man kana akhiru kalamihi la ilaha illa Allah dakhala al-jannah"
          english="Whoever's last words are 'La ilaha illa Allah' will enter Paradise."
          source="Abu Dawud 21:28"
          delay={0.11}
        />
      </div>
    </div>
  );
}

function DyingWordsDuaSub() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Speak only good</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;When you are with the sick or the dying, say good — for the angels say <span className="italic">ameen</span> to what you say.&quot; No grief talk, no complaints, no scary predictions. Words of mercy, hope, and du&apos;a only.
          </p>
          <Ref text="Muslim 11:7" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Recite Surah Yasin</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Recite Yasin over your dying.&quot; A widely practiced tradition — sit nearby and recite, even softly. The mercy of the verses descends with their hearing.
          </p>
          <Ref text="Abu Dawud 21:33" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Make du&apos;a for them</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Ask Allah for mercy on them, for an easy passing, for forgiveness of their sins, for safety from the trials of the grave. Be present, not panicked.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function DyingDepartureSub() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">When the soul departs</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When Abu Salama died, the Prophet ﷺ closed his eyes and said: &quot;When the soul is taken, the eyesight follows it.&quot; Close their eyes gently, cover the body, and make du&apos;a: &quot;O Allah, forgive him and raise his rank.&quot;
          </p>
          <Ref text="Muslim 11:8" />
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Say inna lillahi</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The first words of a believer at any loss — including the loss of a loved one — are <span className="font-arabic text-gold">إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ</span> (&quot;To Allah we belong and to Him we return&quot;). It anchors the heart immediately.
          </p>
          <Ref text="Quran 2:156" />
        </ContentCard>
      </div>
    </div>
  );
}

function DyingMeetingAllahSub() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Every other page here speaks to those <span className="italic">around</span> the dying. This one is for the dying person&apos;s own heart — and for the family who reads to them. If you are ill and afraid, the tradition&apos;s most tender promise is this: turn your face toward Allah with hope, and He turns toward you with love. Meet Him thinking the best of Him.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">Meet Allah with Hope</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="مَنْ أَحَبَّ لِقَاءَ اللَّهِ أَحَبَّ اللَّهُ لِقَاءَهُ، وَمَنْ كَرِهَ لِقَاءَ اللَّهِ كَرِهَ اللَّهُ لِقَاءَهُ"
          transliteration="Man ahabba liqa'a Allahi ahabba Allahu liqa'ahu, wa man kariha liqa'a Allahi kariha Allahu liqa'ah"
          english="Who-ever loves to meet Allah, Allah (too) loves to meet him and who-ever hates to meet Allah, Allah (too) hates to meet him"
          source="Bukhari 81:96; Muslim 48:16; Tirmidhi 10:102"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">It is not about fearing death</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Aisha (RA) understood this to mean disliking death, and said: &quot;But we dislike death.&quot; The Prophet ﷺ corrected her: it is not that. &quot;When the time of the death of a believer approaches, he receives the good news of Allah&apos;s pleasure with him and His blessings upon him, and so at that time nothing is dearer to him than what is in front of him.&quot; The natural fear of dying is not what is meant — it is the state of the heart at the very threshold, when the veil lifts and the believer is shown mercy.
          </p>
          <Ref text="Bukhari 81:96" />
        </ContentCard>
        <VerseCard
          arabic="لاَ يَمُوتَنَّ أَحَدُكُمْ إِلاَّ وَهُوَ يُحْسِنُ الظَّنَّ بِاللَّهِ عَزَّ وَجَلَّ"
          transliteration="La yamutanna ahadukum illa wa huwa yuhsinu az-zanna billahi 'azza wa jall"
          english="None of you should die but hoping only good from Allah, the Exalted and Glorious."
          source="Muslim 53:100"
          delay={0.14}
        />
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Think well of your Lord</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ said this three days before his own death. However heavy your record feels, come to Allah expecting His mercy, not His wrath — for He meets His servant according to that servant&apos;s expectation of Him. Balance hope and fear your whole life; at the end, let hope carry you home.
          </p>
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">The Prophet&apos;s ﷺ Own Last Moments</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="اللَّهُمَّ الرَّفِيقَ الأَعْلَى"
          transliteration="Allahumma ar-Rafiq al-A'la"
          english="O Allah (with) the highest companions."
          source="Bukhari 81:98; Bukhari 81:99"
          delay={0.2}
        />
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">His head on Aisha&apos;s chest</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            In his final illness the Prophet ﷺ used a fresh siwak that Aisha (RA) softened for him, cleaning his teeth as beautifully as she had ever seen. Then he raised his finger and said thrice, &quot;O Allah, the highest companions,&quot; and passed — his head resting between her chest and chin, &quot;on his last day on earth and his first day in the Hereafter.&quot; Even the Messenger of Allah met death gently, choosing the nearness of Allah over the world.
          </p>
          <Ref text="Bukhari 64:459; Bukhari 64:471; Bukhari 75:34" />
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Death has its hardships — and that is alright</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            He would dip his hand in water and wipe his face, saying: <span className="font-arabic text-gold">لاَ إِلَهَ إِلاَّ اللَّهُ، إِنَّ لِلْمَوْتِ سَكَرَاتٍ</span> — &quot;None has the right to be worshipped but Allah! No doubt, death has its stupors.&quot; The hardship of dying is real, and felt even by the beloved of Allah. It is not a sign of Allah&apos;s displeasure — it is part of the passage. Bear it with the shahada on your tongue.
          </p>
          <Ref text="Bukhari 81:99" />
        </ContentCard>
      </div>

      <ContentCard delay={0.29} className="mt-2">
        <p className="text-themed-muted text-sm leading-relaxed">
          What is said and done at the very bedside — prompting the shahada, reciting Yasin, speaking only good — is on the earlier sub-tabs.
        </p>
        <Link href="/death-rites?tab=dying&sub=bedside" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          At the bedside — words and du&apos;a for the dying →
        </Link>
      </ContentCard>
    </div>
  );
}

function TypesGoodEndSub() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Islam speaks less about <span className="italic">how</span> a person dies than about the state they die in. What a believer hopes for is <span className="text-gold">husn al-khatimah</span> — a good ending: leaving this world upon iman, on a good deed, with Allah pleased. Among good endings, the Quran and Sunnah single out certain deaths for a special rank — above all <span className="text-gold">shahadah</span> (martyrdom). It is an honor Allah grants to whom He wills; it is never something a person may seize by harming themselves or others. The believer&apos;s part is to ask Allah for the rank and live sincerely — the ending belongs to Allah alone.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        <ContentCard delay={0.1}>
          <h5 className="text-gold font-medium mb-2">Good endings beyond martyrdom</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A good ending is not reserved for martyrs. Dying with the shahada as one&apos;s last words — &quot;If anyone&apos;s last words are &apos;There is no god but Allah,&apos; he will enter Paradise&quot; — or being taken while on a righteous deed are endings the Prophet ﷺ gave glad tidings for. Live in the state you hope to die in.
          </p>
          <Ref text="Abu Dawud 21:28" />
          <Link href="/barzakh?tab=protection" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Signs of a good ending and deeds that protect in the grave →
          </Link>
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">The martyrs at a glance</h5>
          <p className="text-themed-muted text-sm leading-relaxed mb-3">
            The Prophet ﷺ named those who die in these ways as martyrs — the one killed in battle
            receives the rank in this world and the next; the rest are granted the martyr&apos;s
            reward in the Hereafter:
          </p>
          <ol className="text-themed-muted text-sm leading-relaxed space-y-1.5 list-none">
            <li><span className="text-gold font-medium">1.</span> Killed in battle in the cause of Allah — the battlefield shahid</li>
            <li><span className="text-gold font-medium">2.</span> The one who dies of the plague</li>
            <li><span className="text-gold font-medium">3.</span> The one who dies of an abdominal illness</li>
            <li><span className="text-gold font-medium">4.</span> The one who drowns</li>
            <li><span className="text-gold font-medium">5.</span> The one crushed beneath a collapsing structure</li>
            <li><span className="text-gold font-medium">6.</span> The one who dies by burning</li>
            <li><span className="text-gold font-medium">7.</span> The woman who dies pregnant or in childbirth</li>
            <li><span className="text-gold font-medium">8.</span> The one killed defending their property</li>
            <li><span className="text-gold font-medium">9.</span> The one killed defending their family, blood, or religion</li>
          </ol>
          <p className="text-themed-muted/70 text-xs leading-relaxed mt-3">
            <span className="text-themed-muted">In today&apos;s terms:</span> scholars extend
            the <span className="italic">plague</span> (ṭāʿūn) to deadly epidemics and pandemics
            generally, and the <span className="italic">abdominal illness</span> (mabṭūn) to fatal
            diseases of the stomach and digestive system — severe intestinal infections, and
            illnesses of that nature.
          </p>
          <p className="text-themed-muted/70 text-xs leading-relaxed mt-2">
            Each is detailed on the next sub-tabs — and children who die young hold their own
            honored place, on the last one.
          </p>
          <Ref text="Bukhari 56:45; Muslim 33:235; Abu Dawud 21:23; Nasai 21:237; Bukhari 46:41; Abu Dawud 42:177" />
        </ContentCard>
      </div>
    </div>
  );
}

function TypesBattlefieldSub() {
  return (
    <div className="space-y-4">
      <VerseCard
        arabic="وَلَا تَحْسَبَنَّ ٱلَّذِينَ قُتِلُوا۟ فِى سَبِيلِ ٱللَّهِ أَمْوَٰتًۢا ۚ بَلْ أَحْيَآءٌ عِندَ رَبِّهِمْ يُرْزَقُونَ"
        transliteration="Wa laa tahsabannal lazeena qutiloo fee sabeelillaahi amwaata; bal ahyaaa'un 'inda Rabbihim yurzaqoon"
        english="Never think of those who are killed in Allah’s way as dead; rather, they are alive with their Lord, receiving provision,"
        source="Quran 3:169"
        delay={0.08}
      />

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">The Battlefield Martyr (Shahid al-Ma&apos;rakah)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Wounds with the scent of musk</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;By Him in Whose Hands my soul is! Whoever is wounded in Allah&apos;s Cause — and Allah knows well who gets wounded in His Cause — will come on the Day of Resurrection with his wound having the color of blood but the scent of musk.&quot;
          </p>
          <Ref text="Bukhari 56:20; Muslim 33:159" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Six blessings of the shahid</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;There are six things with Allah for the martyr: he is forgiven with the first flow of his blood; he is shown his place in Paradise; he is protected from the punishment of the grave; he is secured from the greatest terror; the crown of dignity is placed upon his head — and its gems are better than the world and what is in it; he is married to seventy-two wives among al-Hur al-&apos;Ayn of Paradise; and he may intercede for seventy of his close relatives.&quot;
          </p>
          <Ref text="Tirmidhi 22:46" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Buried in their blood — the exception to washing</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Jabir (RA) narrated that on the day of Uhud the Prophet ﷺ said: &quot;Bury them with their blood&quot; — he did not have the martyrs washed. He ordered them buried with their blood on their bodies, and Jabir&apos;s narration adds that they were neither washed nor was a funeral prayer offered for them. The battle martyr is buried as he fell — his wounds are his witness. This is the one exception to the normal ghusl of the deceased.
          </p>
          <Ref text="Bukhari 23:101; Bukhari 23:98" />
          <Link href="/death-rites?tab=washing-janazah" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Normal washing &amp; janazah rules →
          </Link>
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Is the janazah prayer offered for him?</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Schools differ. Based on the Uhud narrations, most scholars hold that the battle martyr is not prayed over — his rank makes intercession unneeded — while others hold the janazah prayer is still offered for him. Both positions rest on authentic reports, and communities follow their local scholarship. All agree he is not washed.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function TypesRewardSub() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Martyrs of the Hereafter&apos;s Reward</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">A wider mercy — with a practical difference</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ asked his companions: &quot;Whom do you consider to be a martyr among you?&quot; They said: one who is slain in the way of Allah. He replied: &quot;Then the martyrs of my Umma will be small in number&quot; — and named others. These are granted a <span className="text-gold">martyr&apos;s reward</span> in the Hereafter, but in this world they are washed, shrouded, and prayed over normally — the battlefield martyr&apos;s burial rulings do not apply to them.
          </p>
          <Ref text="Muslim 33:236" />
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">The five martyrs</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Five are regarded as martyrs: those who die because of plague, abdominal disease, drowning, or a falling building, and the martyrs in Allah&apos;s Cause.&quot;
          </p>
          <Ref text="Bukhari 56:45; Muslim 33:235" />
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">The expanded seven</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;There are seven types of martyrdom in addition to being killed in Allah&apos;s cause: one who dies of plague is a martyr; one who is drowned is a martyr; one who dies of pleurisy is a martyr; one who dies of an internal complaint is a martyr; one who is burnt to death is a martyr; one who is killed by a building falling on him is a martyr; and a woman who dies while pregnant is a martyr.&quot; Nasai&apos;s narration counts the woman who dies in childbirth among the martyrs.
          </p>
          <Ref text="Abu Dawud 21:23; Nasai 21:237" />
        </ContentCard>
        <ContentCard delay={0.32}>
          <h5 className="text-gold font-medium mb-2">Killed defending what is yours</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Whoever is killed while protecting his property, then he is a martyr.&quot; And in Abu Dawud&apos;s narration: &quot;He who is killed while protecting his property is a martyr, and he who is killed while defending his family, or his blood, or his religion is a martyr.&quot;
          </p>
          <Ref text="Bukhari 46:41; Muslim 1:268; Abu Dawud 42:177" />
        </ContentCard>
      </div>
    </div>
  );
}

function TypesSeekingSub() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Asking Allah for Martyrdom</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.35}>
          <h5 className="text-gold font-medium mb-2">A du&apos;a, not a death wish</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Whoever seeks martyrdom with sincerity will be ranked by Allah among the martyrs, even if he dies on his bed.&quot; The door to this rank is the heart&apos;s sincerity, not recklessness with the life Allah entrusted to you. Ask Allah for it — and let Him choose the ending.
          </p>
          <Ref text="Muslim 33:225; Abu Dawud 8:105" />
        </ContentCard>
      </div>
    </div>
  );
}

function TypesChildrenSub() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          If you are reading this while grieving a child — or a pregnancy that ended before you ever held them — know that Islam does not leave you alone in that grief. The texts about children who die young are among the most tender in the whole Sunnah: no reckoning awaits them, Paradise holds them, and their short lives are made a shield and an outstretched hand for the parents who lost them.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">No Reckoning Awaits Them</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">The Pen never touched them</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;The Pen has been lifted from three: from the child until he reaches puberty, from the sleeper until he wakes up and from the insane until he regains his sanity.&quot; A child who dies before puberty was never under the Pen at all — nothing was recorded against them, and there is nothing to answer for. They stand before Allah with a clean page.
          </p>
          <Ref text="Musnad Ahmad 940" />
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Born upon the fitrah</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;The funeral prayer should be offered for every child&quot; — because, as the Prophet ﷺ said, &quot;Every child is born with a true faith,&quot; the pure fitrah with which Allah created human beings. The community honors every child with a janazah because every child leaves this world upon that original purity.
          </p>
          <Ref text="Bukhari 23:111" />
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">They Are in Paradise</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">In the garden with Ibrahim عليه السلام</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            In the long dream shown to the Prophet ﷺ, the two angels brought him to &quot;a garden of deep green dense vegetation, having all sorts of spring colors&quot; — and in its midst a man so tall his head could hardly be seen, &quot;and around him there were children in such a large number as I have never seen.&quot; The angels explained: &quot;The tall man whom you saw in the garden is Abraham, and the children around him are those children who die with al-Fitra.&quot; When some Muslims asked about the children of the pagans, he replied: &quot;And also the children of pagans.&quot; A child who dies young is not lost and not waiting in darkness — they are in a garden, in the care of Ibrahim, the father of the prophets.
          </p>
          <Ref text="Bukhari 91:61" />
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">A Shield for Their Parents</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">&quot;Even two&quot;</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When the women asked the Prophet ﷺ for a day of teaching of their own, he taught them and said: &quot;A woman whose three children died would be screened from the Hell Fire by them.&quot; Hearing that, a woman asked, &quot;If two died?&quot; He replied: &quot;Even two.&quot; The loss you carry is not wasted — Allah makes the very children you grieve a screen between you and the Fire.
          </p>
          <Ref text="Bukhari 23:12; Muslim 45:196" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">&quot;Except for Allah&apos;s oath&quot; — what it means</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;No Muslim whose three children died will go to the Fire except for Allah&apos;s oath&quot; — and in the parallel narration, he &quot;will not be touched by the Fire except that which will render Allah&apos;s oath fulfilled.&quot; The &quot;oath&quot; is the crossing described in Quran 19:71 (below) — the pass over the Fire that no one, righteous or otherwise, is exempted from. It does not mean punishment awaits such parents; the texts promise they are screened from the Fire, and their children go before them into Paradise. It is a promise of protection, not of exemption from standing before Allah.
          </p>
          <Ref text="Bukhari 23:13; Bukhari 83:35; Muslim 45:193" />
        </ContentCard>
        <VerseCard
          arabic="وَإِن مِّنكُمْ إِلَّا وَارِدُهَا ۚ كَانَ عَلَىٰ رَبِّكَ حَتْمًا مَّقْضِيًّا"
          transliteration="Wa im minkum illaa waa riduhaa; kaana 'alaa Rabbika hatmam maqdiyyaa"
          english="There is none among you except that he will pass over it; a decree from your Lord that must be fulfilled."
          source="Quran 19:71"
          delay={0.23}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">The Miscarried Child (as-Siqt)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">By the cord that joined you</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;By the One in Whose Hand is my soul! The miscarried fetus will drag his mother by his umbilical cord to Paradise, if she (was patient and) sought reward (for her loss).&quot; And in the companion narration: the miscarried child &quot;will plead with his Lord if his parents are admitted to Hell&quot; — and it will be said: &quot;O fetus who pleads with your Lord! Admit your parents to Paradise. So he will drag them out with his umbilical cord until he admits them to Paradise.&quot; Even a child who never drew breath is not nothing in Allah&apos;s sight — the very cord that joined you becomes the rope by which they pull you to safety.
          </p>
          <Ref text="Ibn Majah 6:177; Ibn Majah 6:176" />
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Dearer than a horseman left behind</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;A miscarried fetus sent before me is dearer to me than a horseman whom I leave behind.&quot; A life the world never counted is counted by the Prophet ﷺ himself — sent ahead, waiting, not left behind.
          </p>
          <Ref text="Ibn Majah 6:175" />
        </ContentCard>
        <ContentCard delay={0.32}>
          <h5 className="text-gold font-medium mb-2">They will not let go</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A man told Abu Huraira his two children had died and asked for a hadith to soothe
            their hearts. He answered: &quot;Yes. Small children are the fowls of Paradise. If one
            of them meets his father — or he said his parents — he would take hold of his cloth,
            or he said with his hand, as I take hold of the hem of your cloth. And he would not
            take off (his hand) from it until Allah causes his father to enter Paradise.&quot;
            The child you lost is not waiting to be found — they are waiting to bring you in.
          </p>
          <Ref text="Muslim 45:198" />
        </ContentCard>
      </div>

      <div className="grid grid-cols-1 gap-3 mt-4">
        <ContentCard delay={0.35}>
          <h5 className="text-gold font-medium mb-2">Patience with hope of reward</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Notice how these promises are worded: the mother is drawn to Paradise &quot;if she was patient and sought reward for her loss,&quot; and the parent spared the Fire is the one who &quot;resigns himself calmly to the will of God.&quot; The shield is real, and it is wrapped in sabr and ihtisab — grieving with tears, as the Prophet ﷺ himself did, while keeping the heart anchored in Allah and hoping in His reward. Grieve gently. Your child has gone ahead of you into safety, and holds the door.
          </p>
          <Link href="/death-rites?tab=grief-visiting" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Grief, patience, and what the Sunnah permits →
          </Link>
        </ContentCard>
      </div>
    </div>
  );
}

function WashingTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Ghusl al-mayyit (washing the deceased) and kafan (shrouding) are a final act of love and a fard kifayah on the community. The Prophet ﷺ taught the women washing his daughter Zaynab the exact method — clean, dignified, fragrant.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">Ghusl — Washing the Body</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">Who washes</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Men wash men, women wash women. A husband may wash his wife and vice versa. Young children may be washed by either. Trusted, knowledgeable people of the same gender should perform it — the body&apos;s privacy is preserved throughout.
          </p>
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Wash an odd number of times</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ instructed: &quot;Wash her three times, or five, or more if you see fit — with water and sidr (lote-tree leaf), and put camphor or something of it in the last wash.&quot;
          </p>
          <Ref text="Bukhari 23:15" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Method</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Begin from the right side, then the left. Wash the parts of wudu first. Use sidr (or modern soap) on the second wash, camphor on the last. Hair of women is braided into three plaits and placed behind.
          </p>
          <Ref text="Bukhari 23:18" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Cover what should be covered</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The awrah is covered at all times during washing, and whoever washes is required to keep private whatever they see. This is a special case of a general promise: &quot;He who conceals (the faults) of a Muslim, Allah would conceal his faults in the world and in the Hereafter.&quot; A well-known additional narration promises forgiveness &quot;forty times&quot; for the one who washes a Muslim and conceals what he sees — it is reported outside the primary collections and graded acceptable by a number of scholars.
          </p>
          <Ref text="Muslim 48:48" />
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">If You Are Asked to Help Wash</h3>
      <ContentCard delay={0.185}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Ghusl al-mayyit is a fard kifayah, and masajid often recruit untrained volunteers with little notice. If it falls to you, you do not need to be an expert — a knowledgeable person present will guide you, and your intention of serving a fellow Muslim is itself an act of worship. A simple sequence:
        </p>
        <ol className="text-themed-muted text-sm leading-relaxed space-y-1.5 list-none mt-3">
          <li><span className="text-gold font-medium">1.</span> Make niyyah, say Bismillah, and ensure only same-gender washers (plus those who truly need to help) are present. Keep the awrah covered with a cloth throughout.</li>
          <li><span className="text-gold font-medium">2.</span> Gently press the abdomen to expel any waste, then clean that area with gloved hands and water.</li>
          <li><span className="text-gold font-medium">3.</span> Perform wudu on the body — as for prayer, but without putting water in the mouth or nose (wipe them instead).</li>
          <li><span className="text-gold font-medium">4.</span> Wash the head and beard, then the right side, then the left, an odd number of times (three, five, or more), using sidr or soap.</li>
          <li><span className="text-gold font-medium">5.</span> Put camphor (or its fragrance) in the final wash. For a woman, braid the hair into three plaits and lay it behind.</li>
          <li><span className="text-gold font-medium">6.</span> Dry the body, then shroud it in the kafan. Speak only good, and carry to your grave nothing of what you saw.</li>
        </ol>
        <Ref text="Bukhari 23:15; Bukhari 23:18" />
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Kafan — The Shroud</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">For men: three white sheets</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;The Prophet ﷺ was shrouded in three white sheets of Yemeni cotton — with no shirt and no turban among them.&quot; Plain white, clean, sufficient to cover the body.
          </p>
          <Ref text="Bukhari 23:32" />
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">For women: five pieces</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Layla bint Qa&apos;if narrated that when Umm Kulthum, daughter of the Prophet ﷺ, died, he gave them: an izar (waist-wrap), a qamis (chemise), a khimar (head-cover), and a wrapping cloak — and a fifth sheet to enshroud her in. Five pieces, arranged to preserve dignity in shrouding.
          </p>
          <Ref text="Abu Dawud 21:69" />
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Apply fragrance</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Umm &apos;Atiyya narrated that the Prophet ﷺ instructed them to apply camphor in the final wash. Some scholars extend this to the kafan itself — perfuming the shroud with halal fragrance. Avoid extravagant or expensive materials — the kafan&apos;s purpose is dignity, not display.
          </p>
          <Ref text="Bukhari 23:15" />
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Hasten the burial</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Hasten with the funeral. If they were righteous, you are hastening them to something good. If they were otherwise, you are removing something evil from your necks.&quot;
          </p>
          <Ref text="Bukhari 23:73" />
        </ContentCard>
      </div>

    </div>
  );
}

function JanazahTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Salat al-Janazah is a fard kifayah — a collective obligation. It has no ruku and no sujood, only four takbirs while standing. It is the final du&apos;a the community makes for the deceased before burial, and the reward of attending is enormous.
        </p>
        <Link href="/salah?tab=voluntary&sub=janazah" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Janazah prayer on the Salah page →
        </Link>
        <Link href="/barzakh" className="block mt-1 text-xs text-gold hover:text-gold/80 underline underline-offset-2 w-fit">
          What happens after — Barzakh →
        </Link>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">How to Pray It</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">Stand and face the qibla</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The body is placed in front of the imam, head to his right for a man, with the imam standing in line with the middle of the body. For a woman, the imam stands in line with the middle of the body. Worshippers stand in straight rows behind.
          </p>
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">First takbir — Al-Fatihah</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Raise the hands, say <span className="font-arabic text-gold">اللَّهُ أَكْبَر</span>, then place the hands and silently recite Surah Al-Fatihah.
          </p>
          <Ref text="Bukhari 23:90" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Second takbir — Salawat</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Say <span className="font-arabic text-gold">اللَّهُ أَكْبَر</span> again, then silently send salawat on the Prophet ﷺ (Allahumma salli &apos;ala Muhammad...) — the same as in the final tashahhud.
          </p>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Third takbir — Du&apos;a for the deceased</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Make a sincere du&apos;a for the deceased — ask for forgiveness, mercy, ease in the grave, and entry into Paradise. Recite the well-known du&apos;a below if you know it.
          </p>
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Fourth takbir — Brief du&apos;a, then salam</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A short du&apos;a (e.g. &quot;O Allah, do not deprive us of his reward, and do not put us to trial after him&quot;), then turn the head to the right and say <span className="font-arabic text-gold">السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّه</span>. Some traditions say one salam, others two.
          </p>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Lateness — pick up where you can</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            If you join late, begin from the takbir you arrive at, complete what you missed afterward (still standing), then make salam. Do not delay leaving with the imam if the body is being carried out.
          </p>
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Du&apos;a for the Deceased (After 3rd Takbir)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ وَنَقِّهِ مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ"
          transliteration="Allahumma-ghfir lahu warhamhu wa 'afihi wa'fu 'anhu wa akrim nuzulahu wa wassi' mudkhalahu, wa-ghsilhu bil-ma'i wath-thalji wal-baradi wa naqqihi mina al-khataya kama yunaqqa ath-thawbu al-abyadu mina ad-danas"
          english="O Allah, forgive him and have mercy on him, give him strength and pardon him. Be generous to him and make his entrance roomy. Wash him with water, snow, and hail, and purify him of sins as a white garment is purified of stains."
          source="Muslim 11:109"
          delay={0.26}
        />
        <VerseCard
          arabic="اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَصَغِيرِنَا وَكَبِيرِنَا وَذَكَرِنَا وَأُنْثَانَا"
          transliteration="Allahumma-ghfir li-hayyina wa mayyitina wa shahidina wa gha'ibina wa saghirina wa kabirina wa dhakarina wa unthana"
          english="O Allah, forgive our living and our dead, those present and those absent, our young and our old, our males and our females."
          source="Abu Dawud 21:113"
          delay={0.29}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">The Reward</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="مَنْ شَهِدَ الْجَنَازَةَ حَتَّى يُصَلِّيَ عَلَيْهَا فَلَهُ قِيرَاطٌ، وَمَنْ شَهِدَهَا حَتَّى تُدْفَنَ فَلَهُ قِيرَاطَانِ. قِيلَ: وَمَا الْقِيرَاطَانِ؟ قَالَ: مِثْلُ الْجَبَلَيْنِ الْعَظِيمَيْنِ"
          transliteration="Man shahida al-janazata hatta yusalliya 'alayha fa-lahu qirat, wa man shahidaha hatta tudfana fa-lahu qiratan. Qila: wa ma al-qiratan? Qala: mithlu al-jabalayni al-'azimayn"
          english="Whoever attends the funeral until the prayer is offered gets one qirat. Whoever stays until burial gets two qirats. It was asked: what are two qirats? He said: like two great mountains."
          source="Bukhari 23:80"
          delay={0.32}
        />
      </div>

    </div>
  );
}

function SpecialCasesSub() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Real communities meet situations the simple how-to does not cover: someone dies far away, a burial has already happened, a family is shattered by a suicide, a debtor leaves no estate, or a pilgrim dies mid-Hajj. The Sunnah addresses each — often with striking mercy.
        </p>
        <Link href="/death-rites?tab=washing-janazah&sub=janazah" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          How to pray the janazah →
        </Link>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">Prayer in absentia — the Najashi</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When the Negus (An-Najashi), the just Christian king of Abyssinia who had sheltered the Muslims, died as a believer, the Prophet ﷺ announced his death — &quot;a pious servant of Allah has died today&quot; — took the companions out, lined them in rows, and prayed the funeral prayer over him with four takbirs, though the body was in another land. This is <span className="italic">salat al-gha&apos;ib</span>: praying the janazah for a Muslim who died elsewhere and was not prayed over. Scholars differ on when it applies — most restrict it to one who had no janazah prayed where they died.
          </p>
          <Ref text="Bukhari 23:74; Muslim 11:85; Muslim 11:86; Ibn Majah 6:106" />
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Praying at the grave after burial</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A woman (or young man) used to sweep the masjid. When she died, the people buried her without telling the Prophet ﷺ, thinking it a small matter. He said: &quot;Why did you not inform me? Show me her grave&quot; — then went and prayed over her at the graveside, saying these graves are full of darkness for their people and Allah illuminates them by his prayer. So one who missed the janazah may still pray it at the grave.
          </p>
          <Ref text="Bukhari 8:106; Muslim 11:93; Abu Dawud 21:115" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">One who died by suicide</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A man who had killed himself with an arrowhead was brought to the Prophet ﷺ, and he said: &quot;As for me, I will not pray for him&quot; — declining to lead the prayer <span className="italic">himself</span>, as a deterrent, but he did not forbid the companions from praying over him. The scholarly conclusion: the janazah <span className="text-gold">is</span> prayed for a Muslim who died this way; he is washed, shrouded, and buried as any Muslim. His sin is grave and left to Allah, but he is not cast out of the Muslim burial. Grieving families should take this mercy to heart.
          </p>
          <Ref text="Muslim 11:138; Nasai 21:147" />
          <Link href="/barzakh" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            The gravity of the sin, and hope in Allah&apos;s mercy →
          </Link>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">The debtor</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A body was brought for the Prophet ﷺ to pray over, and he asked whether the man had left enough to clear his debt. When there was none, he said, &quot;Pray for your companion&quot; — until Abu Qatadah guaranteed the debt would be paid, and only then did the Prophet ﷺ pray for him. Later, after Allah opened the conquests, he took the debts of the deceased upon himself: &quot;I am nearer to the believers than themselves, so if anyone dies leaving a debt, its payment is my responsibility…&quot;
          </p>
          <Ref text="Tirmidhi 10:105; Muslim 23:18" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">The pilgrim in ihram (muhrim)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When a man in ihram was thrown from his mount at Arafat and killed, the Prophet ﷺ said: &quot;Wash him with water and Sidr and shroud him in his two garments; neither perfume him nor cover his head, for he will be resurrected on the Day of Resurrection, reciting Talbiya.&quot; The pilgrim who dies in the state of ihram is buried in it, his devotion made a mark of honor he carries to the Resurrection.
          </p>
          <Ref text="Bukhari 28:29; Bukhari 28:31; Muslim 15:106" />
        </ContentCard>
      </div>
    </div>
  );
}

function BurialProcessionSub() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Before the grave comes the procession — <span className="italic">tashyi&apos; al-janazah</span>, walking the deceased to their resting place. Following the funeral is one of the named rights a Muslim owes a Muslim, and the Sunnahs of the procession are among the first things a newcomer will witness and wonder about at any janazah.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">A right of every Muslim</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;The rights of a Muslim on the Muslims are five: to respond to the salaam, visiting the sick, to follow the funeral processions, to accept an invitation, and to reply to those who sneeze.&quot; And among the seven the Prophet ﷺ commanded was &quot;to follow the funeral procession.&quot; Walking with a Muslim to their grave is not merely kind — it is owed.
          </p>
          <Ref text="Bukhari 23:4; Bukhari 23:3" />
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Carry it, and walk near it</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            It is a Sunnah to help carry the bier — traditionally taking a turn at each of its four corners. The pace is a brisk, dignified walk (&quot;Hasten with the funeral&quot;), not a slow, mournful crawl. Those on foot may walk in front of, behind, or beside the bier.
          </p>
          <Ref text="Bukhari 23:73" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Standing for a passing funeral — &quot;Is it not a soul?&quot;</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;When you see a funeral procession, stand up until it passes you.&quot; Once a funeral passed and the Prophet ﷺ stood; they said, &quot;It is the funeral of a Jew,&quot; and he replied, &quot;When you see a funeral, stand up&quot; — in another narration: &quot;Is it not a soul?&quot; The standing honors the awe of death itself, not the religion of the deceased.
          </p>
          <Ref text="Bukhari 23:65; Bukhari 23:68; Bukhari 23:69; Bukhari 23:70; Nasai 21:104" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Whoever follows it, do not sit until it is placed down</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;When a funeral passes by you, stand up; and whoever follows it, let him not sit down until it is put down (in the grave).&quot; The Prophet ﷺ would remain standing at the graveside until the body was placed in the lahd. (Later practice on standing for a passing bier is broad; scholars differ on whether it was abrogated — many hold it remains recommended.)
          </p>
          <Ref text="Abu Dawud 21:88; Nasai 21:97" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">The qirat is for following, not just praying</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;He who offered prayer over the dead, but did not follow the bier, for him is the reward of one qirat, and he who followed it, for him is the reward of two qirats.&quot; The smaller of the two is like Mount Uhud. The immense reward is tied to accompanying the deceased all the way to burial, not only to the prayer. Do not leave the moment the salam is given.
          </p>
          <Ref text="Muslim 11:70" />
          <Link href="/death-rites?tab=washing-janazah&sub=janazah" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            The two-qirat reward in full →
          </Link>
        </ContentCard>
      </div>
    </div>
  );
}

function BurialGraveSub() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The burial is the deceased&apos;s last visible act in this world and their first in the next. Islamic burial is simple, swift, and dignified — direct contact with the earth, facing the qibla, with du&apos;a from those who lower them.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">Hasten the burial</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Sunnah is to bury without unnecessary delay. The body should be carried respectfully and placed in the grave quickly after the janazah prayer.
          </p>
          <Ref text="Bukhari 23:73" />
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Dig deep, and dig well</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            On the day of Uhud, when digging a grave for each martyr was too hard, the Prophet ﷺ said: &quot;Dig graves and make them good and deep, and bury two or three in one grave.&quot; When they asked whom to place in first, he said: &quot;Put in first the one who knew more Qur&apos;an.&quot; The grave is dug deep enough to contain and protect the body — and in genuine necessity, more than one may share a single grave.
          </p>
          <Ref text="Nasai 21:193" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Lahd or shaqq</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A lahd (side-niche carved into the qibla wall of the grave) or a shaqq (a straight pit dug into the floor) — both are valid. The lahd is preferred where the ground holds, and it was the Prophet&apos;s ﷺ own grave.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function BurialLoweringSub() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Lower into the grave</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The body is lowered from the qibla side, ideally placed gently on the right side facing the qibla. Mahram males of the deceased do the lowering when possible.
          </p>
        </ContentCard>
        <VerseCard
          arabic="بِسْمِ اللَّهِ وَعَلَى مِلَّةِ رَسُولِ اللَّهِ"
          transliteration="Bismillahi wa 'ala millati Rasulillah"
          english="In the name of Allah and upon the religion of the Messenger of Allah."
          source="Abu Dawud 21:125"
          delay={0.17}
        />
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Untie the shroud</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Once in the grave, the cloth bindings at the head and feet of the kafan are untied. The face is uncovered toward the qibla in some traditions, or the kafan is left in place — local practice varies.
          </p>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Throw three handfuls of earth</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ would throw three handfuls of soil into the grave from the head side after the body was placed. Each attendee may do the same — the first symbolizes &quot;from it We created you,&quot; the second &quot;into it We return you,&quot; the third &quot;from it We will bring you forth again&quot; (Quran 20:55).
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function BurialAfterSub() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Raise the grave only slightly</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The grave is raised about a hand-span above the ground — no more. The Prophet ﷺ forbade plastering graves, sitting on them, building over them, or making them ornate.
          </p>
          <Ref text="Muslim 11:121" />
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Stand and make du&apos;a after burial</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ would stand at the grave after burial and say: &quot;Ask Allah to forgive your brother and ask Allah to make him firm — for he is being questioned now.&quot; This is when the angels Munkar and Nakir come.
          </p>
          <Ref text="Abu Dawud 21:133" />
        </ContentCard>
      </div>
    </div>
  );
}

function BurialWomenSub() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="كُنَّا نُنْهَى عَنِ اتِّبَاعِ الْجَنَائِزِ وَلَمْ يُعْزَمْ عَلَيْنَا"
          transliteration="Kunna nunha 'ani-ttiba'i al-jana'izi wa lam yu'zam 'alayna"
          english="(Umm 'Atiyya said:) We women were forbidden from following the funeral, but it was not made strict on us."
          source="Muslim 11:44"
          delay={0.32}
        />
        <ContentCard delay={0.335}>
          <h5 className="text-gold font-medium mb-2">Women and the burial</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The hadith of Umm &apos;Atiyya is the foundation: women were <span className="text-gold">discouraged</span> from following the funeral procession to the graveyard, but not absolutely forbidden. Scholars differ on the application:
          </p>
          <ul className="text-themed-muted text-sm leading-relaxed list-disc pl-5 mt-2 space-y-1">
            <li><span className="text-gold">Hanafi & Shafi&apos;i:</span> Disliked (makruh) for women to attend the burial site, especially younger women, due to the risk of grief leading to wailing.</li>
            <li><span className="text-gold">Maliki & Hanbali:</span> Permissible — especially for older women — provided they remain composed and avoid the practices of jahiliyyah (loud wailing, tearing clothes).</li>
          </ul>
          <p className="text-themed-muted text-sm leading-relaxed mt-2">
            Women <span className="text-gold">may freely pray salat al-janazah</span> — Aisha (RA) prayed over the body of Sa&apos;d ibn Abi Waqqas in the masjid. The discouragement is specific to walking with the bier to the grave and standing at the burial site.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function GriefTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Islam does not silence grief — it shapes it. Tears, sadness, and longing are permitted; the Prophet ﷺ himself wept openly for his son Ibrahim and his daughter. What is forbidden is despair, wailing, and the practices of jahiliyyah. Sabr is not absence of pain; it is keeping faith inside the pain.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">First Response to Loss</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="الَّذِينَ إِذَا أَصَابَتْهُمْ مُصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ"
          transliteration="Alladhina idha asabat-hum musibatun qalu inna lillahi wa inna ilayhi raji'un"
          english="Those who, when affliction strikes them, say: To Allah we belong, and to Him we return."
          source="Quran 2:156"
          delay={0.08}
        />
        <VerseCard
          arabic="إِنَّمَا الصَّبْرُ عِنْدَ الصَّدْمَةِ الأُولَى"
          transliteration="Innama as-sabru 'inda as-sadmati al-ula"
          english="Patience is at the first shock."
          source="Bukhari 23:43"
          delay={0.11}
        />
        <VerseCard
          arabic="اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا"
          transliteration="Allahumma-jurni fi musibati wa akhlif li khayran minha"
          english="O Allah, reward me for my calamity and replace it for me with something better."
          source="Muslim 11:4"
          delay={0.14}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Mourning Periods</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">For everyone else: 3 days max</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;It is not lawful for a woman who believes in Allah and the Last Day to mourn for any deceased more than three days, except for her husband — for him she mourns four months and ten days.&quot; Three days is the outer limit of formal mourning for non-spouses.
          </p>
          <Ref text="Bukhari 23:40" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">For a widow: 4 months and 10 days</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Allah commanded in the Quran: <span className="italic">&quot;Those of you who die and leave widows behind — they shall wait by themselves four months and ten days.&quot;</span> This is the iddah period during which she does not remarry, does not beautify herself, and remains in her husband&apos;s home.
          </p>
          <Ref text="Quran 2:234" />
        </ContentCard>
        <ContentCard delay={0.215}>
          <h5 className="text-gold font-medium mb-2">What ihdad actually involves</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Umm &apos;Atiyya said: during mourning &quot;we were not allowed to put kohl in our eyes, nor perfume ourselves, nor wear dyed clothes, except a garment of &apos;asb.&quot; From this scholars derive the widow&apos;s <span className="italic">ihdad</span>: she avoids perfume, kohl, adornment jewelry, and eye-catching or dyed clothing, and stays in the marital home, going out only for genuine need — work, medical care, necessities. It is restraint from beautification, not confinement or a ban on ordinary living, speaking, or receiving visitors.
          </p>
          <Ref text="Bukhari 68:86; Muslim 18:85" />
          <Link href="/marriage" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Iddah and ihdad in family law →
          </Link>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">If pregnant — until birth</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A pregnant widow&apos;s iddah ends when she gives birth, even if it is shortly after her husband&apos;s death. <span className="italic">&quot;And those who are pregnant — their term is until they deliver.&quot;</span>
          </p>
          <Ref text="Quran 65:4" />
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">No fixed limit for men</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A man whose wife dies has no iddah and no formal mourning restriction. He may remarry whenever he is ready. Grief, of course, is its own timeline — but the rulings differ.
          </p>
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">What is Permitted, What is Not</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Permitted: tears</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When the Prophet&apos;s son Ibrahim died, he wept. He said: &quot;The eye sheds tears and the heart grieves, and we do not say anything except that which pleases our Lord.&quot;
          </p>
          <Ref text="Bukhari 23:61" />
        </ContentCard>
        <ContentCard delay={0.32}>
          <h5 className="text-gold font-medium mb-2">Not from us: wailing and self-harm</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;He is not of us who slaps his cheeks, tears his garments, and calls with the calls of jahiliyyah.&quot; Loud wailing (niyaha), screaming, tearing clothes, slapping the face — all are forbidden.
          </p>
          <Ref text="Bukhari 23:52" />
        </ContentCard>
        <ContentCard delay={0.335}>
          <h5 className="text-gold font-medium mb-2">&quot;Does my crying harm my dead relative?&quot;</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A famous narration reports the Prophet ﷺ saying, &quot;The deceased is punished by the weeping of his family over him&quot; — and it frightens many mourners. But Aisha (RA) clarified it. When told of it, she said: &quot;May Allah have mercy on Umar. By Allah, the Messenger of Allah did not say a believer is punished by the weeping of his family. He said: Allah increases the punishment of a <span className="italic">disbeliever</span> because of his family&apos;s weeping&quot; — and she recited: <span className="italic">&quot;No burdened soul will bear another&apos;s burden&quot;</span> (Quran 35:18). Your quiet tears do not harm your dead. What the hadith warns against is the loud, ritual <span className="italic">niyaha</span> the deceased had asked for or that expresses rejection of the decree.
          </p>
          <Ref text="Bukhari 23:46; Muslim 11:20; Muslim 11:23; Nasai 21:31" />
        </ContentCard>
        <ContentCard delay={0.35}>
          <h5 className="text-gold font-medium mb-2">Bayt al-Hamd — the House of Praise</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;When a child of the servant dies, Allah says to His angels: &apos;You have taken the child of My servant?&apos; They say: &apos;Yes.&apos; He says: &apos;You have taken the fruit of his heart?&apos; They say: &apos;Yes.&apos; He says: &apos;What did My servant say?&apos; They say: &apos;He praised You and said <span className="font-arabic text-gold">إِنَّا لِلَّهِ وَإِنَّآ إِلَيْهِ رَٰجِعُونَ</span>.&apos; So Allah says: &apos;Build for My servant a house in Paradise, and call it the House of Praise.&apos;&quot; The one who meets the loss of a child with <span className="italic">alhamdulillah</span> has a named house built for them in Jannah.
          </p>
          <Ref text="Tirmidhi 10:57" />
          <Link href="/death-rites?tab=types-of-death&sub=children" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            More on children who die young →
          </Link>
        </ContentCard>
        <ContentCard delay={0.35}>
          <h5 className="text-gold font-medium mb-2">Cooking for the bereaved</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When the family of a deceased loses someone, the Prophet ﷺ said: &quot;Prepare food for the family of Ja&apos;far for there came upon them an incident which has engaged them.&quot; Neighbors and friends should feed the bereaved family, not the other way around.
          </p>
          <Ref text="Abu Dawud 21:44" />
        </ContentCard>
        <ContentCard delay={0.38}>
          <h5 className="text-gold font-medium mb-2">Do not curse time or fate</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            In a Qudsi hadith: &quot;The son of Adam offends Me when he curses time, for I am time. I rotate the night and the day.&quot; Loss is from Allah&apos;s decree — never blame time, fate, or destiny.
          </p>
          <Ref text="Bukhari 65:348" />
        </ContentCard>
      </div>

    </div>
  );
}

function VisitingGravesTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Prophet ﷺ once forbade visiting graves — then permitted it. The reason: in early Islam he was protecting people from the polytheistic practices around graves. Once their hearts were firm in tawhid, the visit became encouraged — because nothing brings the Hereafter closer than standing where a body lies waiting for it.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="كُنْتُ نَهَيْتُكُمْ عَنْ زِيَارَةِ الْقُبُورِ فَزُورُوهَا، فَإِنَّهَا تُذَكِّرُ الْآخِرَةَ"
          transliteration="Kuntu nahaytukum 'an ziyarati al-qubur fa-zuruha, fa-innaha tudhakkiru al-akhirah"
          english="I used to forbid you from visiting graves — but now visit them, for they remind you of the Hereafter."
          source="Muslim 11:136"
          delay={0.08}
        />
        <VerseCard
          arabic="السَّلَامُ عَلَيْكُمْ دَارَ قَوْمٍ مُؤْمِنِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ"
          transliteration="As-salamu 'alaykum dara qawmin mu'minin, wa inna in sha'a Allah bikum lahiqun, nas'alu Allaha lana wa lakumu al-'afiyah"
          english="Peace be upon you, abode of a believing people. And we, if Allah wills, will be joining you. We ask Allah for safety for us and for you."
          source="Muslim 11:131"
          delay={0.11}
        />
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Make du&apos;a for them</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Ask Allah for their forgiveness, mercy, and ease in the grave. The du&apos;a of the living for the dead is one of the three things that benefit the deceased.
          </p>
          <Ref text="Muslim 25:20" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Don&apos;t sit on the graves</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Better for one of you to sit on a burning coal that scorches his clothes and reaches his skin than to sit on a grave.&quot;
          </p>
          <Ref text="Muslim 11:124" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Don&apos;t pray to or at graves</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Do not pray facing graves and do not sit on them.&quot; Graves are places to remember Allah and make du&apos;a — not places to direct worship. Asking the dead, making vows to them, or seeking help from them is shirk.
          </p>
          <Ref text="Muslim 11:127" />
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Walk with respect</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Remove your shoes if you are walking among graves (one narration in Abu Dawud encourages this). Speak quietly. Recall that you are walking on a community of souls in their barzakh.
          </p>
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Reflect on yourself</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The purpose of the visit is not them — it is you. They are at the end of what is coming for you. Pray you arrive at your grave the way you wish for them, and that the soil receives you in mercy.
          </p>
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">May Women Visit Graves?</h3>
      <ContentCard delay={0.29}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Online you will meet the narration &quot;the Messenger of Allah ﷺ cursed the women who visit graves&quot; — quoted alone, it reads as an outright ban. The fuller picture is more balanced:
        </p>
        <ul className="text-themed-muted text-sm leading-relaxed list-disc pl-5 mt-3 space-y-1.5">
          <li>The general permission &quot;I used to forbid you from visiting graves — but now visit them&quot; is worded to <span className="text-gold">everyone</span>, and the reason given (remembering the Hereafter) applies to women as much as men.</li>
          <li>The cursing narrations use the intensive form <span className="italic">zawwarat</span> — the <span className="text-gold">frequent</span> visitors — which many scholars read as a warning against excessive visiting that leads to wailing, neglect, or innovation, not against a calm, occasional visit.</li>
          <li>Some scholars hold the cursing was before the general permission and is thus included in it; others hold visiting is disliked for women who cannot keep their composure. All agree a woman must avoid wailing, adornment, and mixing.</li>
        </ul>
        <p className="text-themed-muted text-sm leading-relaxed mt-3">
          The safest, widely-held position: a woman may visit graves for remembrance and du&apos;a, dressed modestly and composed — while frequent, grief-stricken visiting is what the warning targets. Where the scholars of your community rule differently, follow them.
        </p>
        <Ref text="Muslim 11:136; Tirmidhi 10:92; Abu Dawud 21:148; Ibn Majah 6:142" />
      </ContentCard>

    </div>
  );
}

function ConsolingSub() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The grief tab speaks to the mourner. This one is for everyone <span className="italic">around</span> them — the friend who does not know what to say, the newcomer at their first Muslim funeral. Consoling the bereaved (<span className="italic">ta&apos;ziyah</span>) is a Sunnah, and the tradition even gives you the words.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">The Prophet&apos;s ﷺ own words of condolence</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When his daughter sent word that her child was dying, the Prophet ﷺ sent back: <span className="font-arabic text-gold">لِلَّهِ مَا أَخَذَ وَلَهُ مَا أَعْطَى وَكُلُّ شَىْءٍ عِنْدَهُ إِلَى أَجَلٍ مُسَمًّى فَلْتَصْبِرْ وَلْتَحْتَسِبْ</span> — &quot;To Allah belongs what He has taken and to Him belongs what He has given. Everything has an appointed time with Him, so be patient and seek reward.&quot; This is the model condolence: affirm Allah&apos;s ownership, and gently point the grieving heart toward sabr and reward.
          </p>
          <Ref text="Ibn Majah 6:156" />
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">A message is enough</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            You do not need to attend in person. &apos;Amr bin Shu&apos;ayb <span className="italic">wrote</span> to console a man whose son had died, quoting the Prophet ﷺ: Allah does not accept, for His believing servant whose loved one He has taken and who bears it with patience and seeks reward, any recompense less than Paradise. A sincere text, call, or note carries the Sunnah.
          </p>
          <Ref text="Nasai 21:54" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Feed the family — don&apos;t make them host</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When news of Ja&apos;far&apos;s death came, the Prophet ﷺ said: &quot;Prepare food for the family of Ja&apos;far for there came upon them an incident which has engaged them.&quot; The Sunnah is that neighbors and friends cook <span className="italic">for</span> the bereaved. The grieving family playing host — cooking large gatherings for guests — reverses this and is disliked.
          </p>
          <Ref text="Abu Dawud 21:44" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">The reward of consoling</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Whoever consoles a bereaved (mother) will be clothed with a garment (burd) in Paradise.&quot; (Graded gharib, its chain judged not strong by Tirmidhi — cited for encouragement, not as a firm ruling.) The point stands across stronger evidence: turning toward the grieving with comfort is beloved to Allah.
          </p>
          <Ref text="Tirmidhi 10:112" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Keep it three days — and avoid innovated gatherings</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Condolence is offered when you learn of the death; scholars describe roughly a three-day window, matching the limit of formal mourning. Console once, sincerely — repeatedly reopening the wound, or fixed ceremonial gatherings on set nights (the third, the fortieth) that people treat as obligatory, have no basis in the Sunnah. Simplicity and sincerity over ritual.
          </p>
          <Link href="/death-rites?tab=grief-visiting&sub=grief" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Mourning periods and what the Sunnah permits →
          </Link>
        </ContentCard>
      </div>
    </div>
  );
}

function ReachesSub() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          After losing a parent, the question that aches most is: <span className="italic">what can I still do for them?</span> The answer is a mercy — the door does not close at the grave. Your deeds on their behalf reach them, and continue to raise their rank while you live.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">The Three That Continue</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلاَّ مِنْ ثَلاَثَةٍ إِلاَّ مِنْ صَدَقَةٍ جَارِيَةٍ أَوْ عِلْمٍ يُنْتَفَعُ بِهِ أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ"
          transliteration="Idha mata al-insanu inqata'a 'anhu 'amaluhu illa min thalathah: illa min sadaqatin jariyah, aw 'ilmin yuntafa'u bihi, aw waladin salihin yad'u lah"
          english="When a man dies, his acts come to an end, but three, recurring charity, or knowledge (by which people) benefit, or a pious son, who prays for him (for the deceased)."
          source="Nasai 30:41; Tirmidhi 15:57; Muslim 25:20"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Become their ongoing charity</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A <span className="italic">sadaqah jariyah</span> in their name keeps giving after they are gone: a well, a masjid, a share in a school, a mushaf placed in a masjid, a tree that feeds. Being their <span className="text-gold">righteous child who prays for them</span> is itself one of the three — every du&apos;a you make for their forgiveness reaches them. Teach or spread beneficial knowledge in their memory, and their scroll of good keeps filling.
          </p>
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Acts You Can Do on Their Behalf</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Give charity for them</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Sa&apos;d ibn &apos;Ubadah&apos;s mother died while he was away. He asked, &quot;Will it benefit her if I give charity on her behalf?&quot; The Prophet ﷺ said, &quot;Yes.&quot; So Sa&apos;d gave his garden in charity for her. And when a man said his mother died suddenly and would have given charity had she spoken, the Prophet ﷺ told him: &quot;Yes, give charity on her behalf.&quot; Sadaqah on behalf of the dead reaches them.
          </p>
          <Ref text="Bukhari 55:19; Bukhari 55:23; Muslim 25:17" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Fast the fasts they owed</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Whoever died and he ought to have fasted (the missed days of Ramadan) then his guardians must fast on his behalf.&quot; When a man asked about his mother who died owing a month of fasting, the Prophet ﷺ said yes, and added: &quot;Allah&apos;s debts have more right to be paid.&quot; An heir may make up missed obligatory or vowed fasts for the deceased.
          </p>
          <Ref text="Bukhari 30:59; Bukhari 30:60" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Perform Hajj for them</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A woman said her mother had vowed to perform Hajj but died before doing it. The Prophet ﷺ said: &quot;Perform Hajj on her behalf. Had there been a debt on your mother, would you have paid it or not? So, pay Allah&apos;s debt as He has more right to be paid.&quot; Hajj and &apos;umrah may be performed for a deceased parent who could not fulfill them.
          </p>
          <Ref text="Bukhari 28:32; Muslim 15:455" />
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Above all — pray for them</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The simplest, weightiest gift costs nothing: du&apos;a. Ask Allah to forgive them, raise their rank, widen their grave, and admit them to Firdaws — at every salah, in every sujood. Keep their good name alive, honor their friends, and fulfill the promises and debts they left behind.
          </p>
          <Link href="/death-rites?tab=grief-visiting&sub=visiting" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Du&apos;a at the graveside →
          </Link>
          <Link href="/barzakh" className="block mt-1 text-xs text-gold hover:text-gold/80 underline underline-offset-2 w-fit">
            How the deceased experience the grave →
          </Link>
        </ContentCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

/* Per-sub-view sources, rendered full-width BELOW the rail layout so the
   Sources card lines up with the rest of the page instead of the rail's
   right column. */
const preparingSources: Record<PreparingSub, SourceRef[]> = {
  reality: [
    { ref: "Quran 3:185", desc: "Every soul will taste death" },
    { ref: "Tirmidhi 36:4", desc: "Remember often the destroyer of pleasures" },
    { ref: "Muslim 55:8", desc: "Three follow the deceased — two return, the deeds remain" },
  ],
  affairs: [
    { ref: "Bukhari 55:1", desc: "A Muslim should not sleep without his wasiyyah" },
  ],
  "good-ending": [
    { ref: "Quran 3:102", desc: "Do not die except in a state of Islam" },
    { ref: "Muslim 11:136", desc: "Visit graves — they remind you of the Hereafter" },
  ],
  checklist: [
    { ref: "Bukhari 23:73", desc: "Hasten with the funeral — the anchor for a prompt, dignified burial" },
  ],
};

const dyingSources: Record<DyingSub, SourceRef[]> = {
  bedside: [
    { ref: "Muslim 11:1", desc: "Prompt the dying with the shahada" },
    { ref: "Abu Dawud 21:28", desc: "Last words 'La ilaha illa Allah' → Paradise" },
  ],
  "words-dua": [
    { ref: "Muslim 11:7", desc: "Speak only good around the sick and dying" },
  ],
  departure: [
    { ref: "Muslim 11:8", desc: "Closing the eyes of the deceased" },
    { ref: "Quran 2:156", desc: "Inna lillahi wa inna ilayhi raji'un" },
  ],
  "meeting-allah": [
    { ref: "Bukhari 81:96; Muslim 48:16; Tirmidhi 10:102", desc: "Whoever loves to meet Allah, Allah loves to meet him — with Aisha's clarification" },
    { ref: "Muslim 53:100", desc: "None should die except thinking well of Allah" },
    { ref: "Bukhari 81:98; Bukhari 81:99", desc: "The Prophet's ﷺ last words — 'ar-Rafiq al-A'la'" },
    { ref: "Bukhari 64:459; Bukhari 64:471; Bukhari 75:34", desc: "His final moments — the siwak, and death in Aisha's arms" },
  ],
};

const typesOfDeathSources: Record<TypesOfDeathSub, SourceRef[]> = {
  "good-end": [
    { ref: "Bukhari 56:45; Muslim 33:235", desc: "The five martyrs — plague, abdominal illness, drowning, collapsed structure, and the shahid in Allah's cause" },
    { ref: "Abu Dawud 21:23; Nasai 21:237", desc: "The expanded categories — incl. burning and the woman who dies pregnant/in childbirth" },
    { ref: "Bukhari 46:41; Abu Dawud 42:177", desc: "Killed defending property, family, blood, or religion" },
    { ref: "Abu Dawud 21:28", desc: "Last words 'La ilaha illa Allah' → Paradise" },
  ],
  "battlefield-martyr": [
    { ref: "Quran 3:169", desc: "The martyrs are alive with their Lord, receiving provision" },
    { ref: "Bukhari 56:20; Muslim 33:159", desc: "The martyr's wound — color of blood, scent of musk" },
    { ref: "Tirmidhi 22:46", desc: "Six blessings with Allah for the martyr" },
    { ref: "Bukhari 23:101; Bukhari 23:98", desc: "Uhud martyrs buried in their blood, not washed" },
  ],
  "martyrs-of-reward": [
    { ref: "Bukhari 56:45; Muslim 33:235", desc: "The five who are regarded as martyrs" },
    { ref: "Muslim 33:236", desc: "'Then the martyrs of my Umma will be small in number'" },
    { ref: "Abu Dawud 21:23; Nasai 21:237", desc: "Seven types of martyrdom — including burning and childbirth" },
    { ref: "Bukhari 46:41; Muslim 1:268; Abu Dawud 42:177", desc: "Killed defending property, family, blood, or religion" },
  ],
  "seeking-martyrdom": [
    { ref: "Muslim 33:225; Abu Dawud 8:105", desc: "Sincerely asking for martyrdom — ranked among martyrs even in bed" },
  ],
  children: [
    { ref: "Musnad Ahmad 940", desc: "The Pen is lifted from the child until he reaches puberty" },
    { ref: "Bukhari 23:111", desc: "The funeral prayer is offered for every child — born upon the fitrah" },
    { ref: "Bukhari 91:61", desc: "The Prophet's ﷺ dream — the children in the garden around Ibrahim" },
    { ref: "Bukhari 23:12; Muslim 45:196", desc: "Three children a screen from the Fire — 'and two?' — 'Even two'" },
    { ref: "Bukhari 23:13; Bukhari 83:35; Muslim 45:193", desc: "'Except for Allah's oath' — the pass over the Fire none are exempted from" },
    { ref: "Quran 19:71", desc: "There is none among you except that he will pass over it" },
    { ref: "Ibn Majah 6:177; Ibn Majah 6:176", desc: "The miscarried child draws his mother to Paradise by his umbilical cord" },
    { ref: "Ibn Majah 6:175", desc: "A miscarried fetus sent before me is dearer to me than a horseman left behind" },
    { ref: "Muslim 45:198", desc: "Small children of Paradise take hold of the parent's garment and do not let go" },
  ],
};

const burialSources: Record<BurialSub, SourceRef[]> = {
  procession: [
    { ref: "Bukhari 23:4; Bukhari 23:3", desc: "Following the funeral is a right of a Muslim upon a Muslim" },
    { ref: "Bukhari 23:65; Bukhari 23:68; Bukhari 23:69; Bukhari 23:70; Nasai 21:104", desc: "Standing for a passing funeral — 'Is it not a soul?'" },
    { ref: "Abu Dawud 21:88; Nasai 21:97", desc: "Remain standing until the bier is put down" },
    { ref: "Muslim 11:70", desc: "The qirat is for following the bier, not only praying" },
    { ref: "Bukhari 23:73", desc: "Hasten with the funeral" },
  ],
  grave: [
    { ref: "Bukhari 23:73", desc: "Hasten the burial" },
    { ref: "Nasai 21:193", desc: "Dig deep and dig well — and, in necessity, two or three in one grave (Uhud)" },
  ],
  lowering: [
    { ref: "Abu Dawud 21:125", desc: "Bismillahi wa 'ala millati Rasulillah — when lowering" },
  ],
  "after-burial": [
    { ref: "Abu Dawud 21:133", desc: "Stand and pray for firmness for the deceased" },
    { ref: "Muslim 11:121", desc: "Prohibition of building over and decorating graves" },
  ],
  women: [
    { ref: "Muslim 11:44", desc: "Women discouraged but not forbidden from following the funeral" },
  ],
};

const washingJanazahSources: Record<WashingJanazahSub, SourceRef[]> = {
  washing: [
    { ref: "Bukhari 23:15", desc: "Wash an odd number of times with sidr and camphor" },
    { ref: "Bukhari 23:18", desc: "Method of washing — begin from the right" },
    { ref: "Muslim 48:48", desc: "Concealing a Muslim's faults — Allah conceals his in both worlds" },
    { ref: "Bukhari 23:32", desc: "Three white sheets, no shirt, no turban" },
    { ref: "Abu Dawud 21:69", desc: "Five pieces of cloth for shrouding Umm Kulthum" },
    { ref: "Bukhari 23:73", desc: "Hasten the funeral" },
  ],
  janazah: [
    { ref: "Bukhari 23:80", desc: "Two qirats — like two great mountains — for attending burial" },
    { ref: "Bukhari 23:90", desc: "Reciting Al-Fatihah in the janazah" },
    { ref: "Muslim 11:109", desc: "The Prophet's du'a in janazah" },
    { ref: "Abu Dawud 21:113", desc: "The comprehensive janazah du'a" },
  ],
  "special-cases": [
    { ref: "Bukhari 23:74; Muslim 11:85; Muslim 11:86; Ibn Majah 6:106", desc: "Salat al-gha'ib — the prayer in absentia for the Najashi" },
    { ref: "Bukhari 8:106; Muslim 11:93; Abu Dawud 21:115", desc: "Praying at the grave after burial — the mosque sweeper" },
    { ref: "Muslim 11:138; Nasai 21:147", desc: "The one who died by suicide — the Prophet abstained but did not forbid the prayer" },
    { ref: "Tirmidhi 10:105; Muslim 23:18", desc: "The debtor — 'pray for your companion' until the debt was guaranteed" },
    { ref: "Bukhari 28:29; Bukhari 28:31; Muslim 15:106", desc: "The pilgrim in ihram — buried in it, raised reciting the talbiyah" },
  ],
};

const griefVisitingSources: Record<GriefVisitingSub, SourceRef[]> = {
  grief: [
    { ref: "Quran 2:156", desc: "Inna lillahi wa inna ilayhi raji'un" },
    { ref: "Quran 2:234", desc: "Widow's iddah of 4 months and 10 days" },
    { ref: "Quran 65:4", desc: "Pregnant widow's iddah ends at birth" },
    { ref: "Bukhari 68:86; Muslim 18:85", desc: "Ihdad — no kohl, perfume, or dyed clothing during mourning" },
    { ref: "Bukhari 23:43", desc: "Patience is at the first shock" },
    { ref: "Bukhari 23:52", desc: "Forbidden: slapping cheeks and tearing garments" },
    { ref: "Bukhari 23:46; Muslim 11:20; Muslim 11:23; Nasai 21:31", desc: "The deceased and the family's wailing — with Aisha's clarification" },
    { ref: "Bukhari 23:61", desc: "The Prophet ﷺ weeping for his son" },
    { ref: "Tirmidhi 10:57", desc: "Bayt al-Hamd — the House of Praise for the patient bereaved parent" },
    { ref: "Muslim 11:4", desc: "Du'a at the moment of musibah" },
  ],
  consoling: [
    { ref: "Ibn Majah 6:156", desc: "The Prophet's ﷺ words of condolence — 'To Allah belongs what He took'" },
    { ref: "Nasai 21:54", desc: "Written condolences carry the Sunnah" },
    { ref: "Tirmidhi 10:112", desc: "Whoever consoles a bereaved mother (chain judged not strong)" },
    { ref: "Abu Dawud 21:44", desc: "Prepare food for the family of Ja'far" },
  ],
  visiting: [
    { ref: "Muslim 11:136", desc: "Visit graves — they remind you of the Hereafter" },
    { ref: "Muslim 11:131", desc: "The salam to give upon entering a graveyard" },
    { ref: "Muslim 11:124", desc: "Prohibition of sitting on graves" },
    { ref: "Muslim 11:127", desc: "Prohibition of praying facing graves" },
    { ref: "Muslim 25:20", desc: "Du'a of the living benefits the deceased" },
    { ref: "Tirmidhi 10:92; Abu Dawud 21:148; Ibn Majah 6:142", desc: "The 'cursing' of frequent women visitors — read alongside the general permission" },
  ],
  reaches: [
    { ref: "Nasai 30:41; Tirmidhi 15:57; Muslim 25:20", desc: "Deeds end except three: ongoing charity, knowledge, a righteous child's du'a" },
    { ref: "Bukhari 55:19; Bukhari 55:23; Muslim 25:17", desc: "Charity on behalf of a deceased mother reaches her" },
    { ref: "Bukhari 30:59; Bukhari 30:60", desc: "An heir fasts for the deceased — 'Allah's debt has more right'" },
    { ref: "Bukhari 28:32; Muslim 15:455", desc: "Hajj performed on behalf of a deceased parent" },
  ],
};

const subsByTab: Record<RailTab, readonly { key: string }[]> = {
  preparing: preparingSubs,
  dying: dyingSubs,
  "types-of-death": typesOfDeathSubs,
  "washing-janazah": washingJanazahSubs,
  burial: burialSubs,
  "grief-visiting": griefVisitingSubs,
};

const defaultSubs: Record<RailTab, string> = {
  preparing: "reality",
  dying: "bedside",
  "types-of-death": "good-end",
  "washing-janazah": "washing",
  burial: "grave",
  "grief-visiting": "grief",
};

/* ── Page search (Rule 2): the tab strip + rail are filtered by label +
   per-view keywords; matching pills stay visible, non-matching hide, and the
   first match is auto-selected. Empty query restores everything. ── */
type SearchEntry = { tab: MainTab; sub: string; label: string; keywords: string };

const searchIndex: SearchEntry[] = [
  { tab: "preparing", sub: "reality", label: "Reality of Death", keywords: "reality of death remember often destroyer of pleasures every soul will taste death" },
  { tab: "preparing", sub: "affairs", label: "Set Your Affairs", keywords: "wasiyyah will debts settle tawbah repentance" },
  { tab: "preparing", sub: "good-ending", label: "A Good Ending", keywords: "husn al-khatimah good ending visit graves live as if today" },
  { tab: "preparing", sub: "checklist", label: "Practical Checklist", keywords: "first 24 hours funeral home death certificate embalming cremation autopsy muslim cemetery repatriation costs west america uk first muslim funeral what to do" },
  { tab: "dying", sub: "bedside", label: "At the Bedside", keywords: "dying moments shahada la ilaha illallah prompt talqin" },
  { tab: "dying", sub: "words-dua", label: "Words & Du'a", keywords: "speak only good yasin dua for the dying" },
  { tab: "dying", sub: "departure", label: "The Soul Departs", keywords: "soul departs inna lillahi close the eyes" },
  { tab: "dying", sub: "meeting-allah", label: "Meeting Allah", keywords: "meeting allah husn adh-dhann think well of allah hope loves to meet allah terminally ill dying person rafiq al-ala prophet last words death agonies sakarat" },
  { tab: "types-of-death", sub: "good-end", label: "The Good End", keywords: "good end good ending husn al-khatimah last words" },
  { tab: "types-of-death", sub: "battlefield-martyr", label: "Battlefield Martyr", keywords: "shaheed shahid martyr martyrdom battlefield uhud musk wounds six blessings buried in blood" },
  { tab: "types-of-death", sub: "martyrs-of-reward", label: "Martyrs of Reward", keywords: "martyrs of reward plague drowning childbirth burning collapsed building defending property" },
  { tab: "types-of-death", sub: "seeking-martyrdom", label: "Seeking Martyrdom", keywords: "asking allah for martyrdom sincerity dies on his bed" },
  { tab: "types-of-death", sub: "children", label: "Children Who Die Young", keywords: "miscarriage stillbirth womb child death before puberty infant baby no accountability pen lifted umbilical cord siqt children in paradise ibrahim screened from the fire grieving parents" },
  { tab: "washing-janazah", sub: "washing", label: "Washing & Shrouding", keywords: "ghusl wash the body who washes odd number sidr camphor kafan shroud white sheets fragrance hasten" },
  { tab: "washing-janazah", sub: "janazah", label: "Janazah Prayer", keywords: "funeral prayer takbir fatihah salawat dua for the deceased salam reward qirat standing" },
  { tab: "washing-janazah", sub: "special-cases", label: "Special Cases", keywords: "special cases prayer in absentia najashi negus salat al-ghaib praying at the grave suicide killed himself debtor muhrim ihram pilgrim arafat" },
  { tab: "burial", sub: "procession", label: "The Procession", keywords: "procession tashyi following the funeral carry the bier stand for a passing funeral is it not a soul jew qirat rights of a muslim" },
  { tab: "burial", sub: "grave", label: "The Grave", keywords: "grave hasten depth lahd shaqq dig deep make it wide uhud two or three in one grave" },
  { tab: "burial", sub: "lowering", label: "Lowering & Closing", keywords: "lower into the grave bismillah untie shroud three handfuls of earth" },
  { tab: "burial", sub: "after-burial", label: "After Burial", keywords: "raise slightly dua after burial questioning firmness" },
  { tab: "burial", sub: "women", label: "Women & Burial", keywords: "women funeral procession burial site" },
  { tab: "grief-visiting", sub: "grief", label: "Grief & Patience", keywords: "mourning loss patience first shock tears wailing permitted iddah ihdad widow four months kohl perfume does my crying harm my dead bayt al-hamd house of praise cooking for the bereaved" },
  { tab: "grief-visiting", sub: "consoling", label: "Consoling Others", keywords: "taziyah condolence console the bereaved what to say prophet condolence message three day window feed the family innovated gatherings fortieth night" },
  { tab: "grief-visiting", sub: "visiting", label: "Visiting Graves", keywords: "graveyard salam dua reminder of the hereafter don't sit on graves don't pray at graves respect reflect women visiting graves zawwarat cursed" },
  { tab: "grief-visiting", sub: "reaches", label: "What Reaches Them", keywords: "what reaches the dead deeds that benefit the deceased sadaqah jariyah ongoing charity on their behalf fasting hajj for parents dua for the dead what can i do for my parent" },
];

function DeathRitesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Deep-link support: ?tab= and ?sub= are the source of truth (read on mount,
  // written on every change), so in-page links and back/forward both work.
  const tabParam = searchParams.get("tab");
  const subParam = searchParams.get("sub");
  const activeMain: MainTab = mainTabs.some((t) => t.key === tabParam) ? (tabParam as MainTab) : "preparing";

  // Last-visited rail pill per grouped tab, so switching tabs restores the selection.
  const [subMemory, setSubMemory] = useState<Record<RailTab, string>>(() => {
    const memory = { ...defaultSubs };
    if (subParam && subsByTab[activeMain].some((s) => s.key === subParam)) {
      memory[activeMain] = subParam;
    }
    return memory;
  });

  const activeSubOf = (tab: RailTab): string =>
    activeMain === tab && subParam && subsByTab[tab].some((s) => s.key === subParam)
      ? subParam
      : subMemory[tab];

  const syncUrl = (tab: MainTab, sub?: string) =>
    router.replace(`${pathname}?tab=${tab}${sub ? `&sub=${sub}` : ""}`, { scroll: false });

  const changeTab = (tab: MainTab) => syncUrl(tab, activeSubOf(tab));

  const changeSub = (tab: RailTab) => (sub: string) => {
    setSubMemory((m) => ({ ...m, [tab]: sub }));
    syncUrl(tab, sub);
  };

  const activePreparing = activeSubOf("preparing") as PreparingSub;
  const activeDying = activeSubOf("dying") as DyingSub;
  const activeTypes = activeSubOf("types-of-death") as TypesOfDeathSub;
  const activeWashing = activeSubOf("washing-janazah") as WashingJanazahSub;
  const activeBurial = activeSubOf("burial") as BurialSub;
  const activeGrief = activeSubOf("grief-visiting") as GriefVisitingSub;

  // Page search over the searchIndex rail entries (Rule 2).
  const [search, setSearch] = useState("");
  const searching = search.trim().length >= 2;
  const matches = searching
    ? searchIndex.filter((e) => textMatch(search, e.label, e.keywords))
    : searchIndex;
  const hasMatches = matches.length > 0;
  const visibleTabs =
    searching && hasMatches ? mainTabs.filter((t) => matches.some((e) => e.tab === t.key)) : mainTabs;
  const subMatches = (tab: RailTab, sub: string) =>
    !searching || !hasMatches || matches.some((e) => e.tab === tab && e.sub === sub);

  // Auto-select the first matching view when the current one is filtered out.
  useEffect(() => {
    if (!searching || !hasMatches) return;
    const currentVisible = matches.some(
      (e) => e.tab === activeMain && e.sub === activeSubOf(activeMain)
    );
    if (currentVisible) return;
    const target = matches.find((e) => e.tab === activeMain) ?? matches[0];
    setSubMemory((m) => ({ ...m, [target.tab]: target.sub }));
    syncUrl(target.tab, target.sub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Death & Janazah"
        titleAr="الموت والجنازة"
        subtitle="Preparing for death, the dying moments, types of death and martyrdom, washing and shrouding, the janazah prayer, burial, grief, and visiting graves"
      />

      <VerseHero
        arabic="ٱلَّذِينَ إِذَآ أَصَـٰبَتْهُم مُّصِيبَةٌ قَالُوٓا۟ إِنَّا لِلَّهِ وَإِنَّآ إِلَيْهِ رَٰجِعُونَ"
        text="Those when afflicted with a disaster, say, “We belong to Allah, and to Him we will return.”"
        reference="Quran 2:156"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search janazah, burial, grief..." className="mb-6" />

      <TabBar
        tabs={visibleTabs}
        activeTab={activeMain}
        onTabChange={(key) => changeTab(key as MainTab)}
      />

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMain}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {activeMain === "preparing" && (
              <>
                <SubTabLayout subs={preparingSubs.filter((s) => subMatches("preparing", s.key))} activeSub={activePreparing} setActiveSub={changeSub("preparing")}>
                  {activePreparing === "reality" && <PreparingRealitySub />}
                  {activePreparing === "affairs" && <PreparingAffairsSub />}
                  {activePreparing === "good-ending" && <PreparingGoodEndingSub />}
                  {activePreparing === "checklist" && <PreparingChecklistSub />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={preparingSources[activePreparing]} />
              </>
            )}
            {activeMain === "dying" && (
              <>
                <SubTabLayout subs={dyingSubs.filter((s) => subMatches("dying", s.key))} activeSub={activeDying} setActiveSub={changeSub("dying")}>
                  {activeDying === "bedside" && <DyingBedsideSub />}
                  {activeDying === "words-dua" && <DyingWordsDuaSub />}
                  {activeDying === "departure" && <DyingDepartureSub />}
                  {activeDying === "meeting-allah" && <DyingMeetingAllahSub />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={dyingSources[activeDying]} />
              </>
            )}
            {activeMain === "types-of-death" && (
              <>
                <SubTabLayout subs={typesOfDeathSubs.filter((s) => subMatches("types-of-death", s.key))} activeSub={activeTypes} setActiveSub={changeSub("types-of-death")}>
                  {activeTypes === "good-end" && <TypesGoodEndSub />}
                  {activeTypes === "battlefield-martyr" && <TypesBattlefieldSub />}
                  {activeTypes === "martyrs-of-reward" && <TypesRewardSub />}
                  {activeTypes === "seeking-martyrdom" && <TypesSeekingSub />}
                  {activeTypes === "children" && <TypesChildrenSub />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={typesOfDeathSources[activeTypes]} />
              </>
            )}
            {activeMain === "washing-janazah" && (
              <>
                <SubTabLayout subs={washingJanazahSubs.filter((s) => subMatches("washing-janazah", s.key))} activeSub={activeWashing} setActiveSub={changeSub("washing-janazah")}>
                  {activeWashing === "washing" && <WashingTab />}
                  {activeWashing === "janazah" && <JanazahTab />}
                  {activeWashing === "special-cases" && <SpecialCasesSub />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={washingJanazahSources[activeWashing]} />
              </>
            )}
            {activeMain === "burial" && (
              <>
                <SubTabLayout subs={burialSubs.filter((s) => subMatches("burial", s.key))} activeSub={activeBurial} setActiveSub={changeSub("burial")}>
                  {activeBurial === "procession" && <BurialProcessionSub />}
                  {activeBurial === "grave" && <BurialGraveSub />}
                  {activeBurial === "lowering" && <BurialLoweringSub />}
                  {activeBurial === "after-burial" && <BurialAfterSub />}
                  {activeBurial === "women" && <BurialWomenSub />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={burialSources[activeBurial]} />
              </>
            )}
            {activeMain === "grief-visiting" && (
              <>
                <SubTabLayout subs={griefVisitingSubs.filter((s) => subMatches("grief-visiting", s.key))} activeSub={activeGrief} setActiveSub={changeSub("grief-visiting")}>
                  {activeGrief === "grief" && <GriefTab />}
                  {activeGrief === "consoling" && <ConsolingSub />}
                  {activeGrief === "visiting" && <VisitingGravesTab />}
                  {activeGrief === "reaches" && <ReachesSub />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={griefVisitingSources[activeGrief]} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ContentCard className="mt-8">
        <h4 className="text-gold font-semibold text-sm mb-2">What happens after — Barzakh</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The grave is the first stage of the Hereafter. What the deceased experiences between death and the Day of Judgement is the life of al-Barzakh.
        </p>
        <Link href="/barzakh" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          What happens after — Barzakh →
        </Link>
      </ContentCard>
    </div>
  );
}

export default function DeathRitesPage() {
  return (
    <Suspense>
      <DeathRitesContent />
    </Suspense>
  );
}
