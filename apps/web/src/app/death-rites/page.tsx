"use client";

import { useState, Suspense } from "react";
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
import {
  BookOpen,
  HandHeart,
  Hourglass,
  Bed,
  Droplets,
  Mountain,
  CloudRain,
  Footprints,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES & TABS
   ═══════════════════════════════════════════════════════════════════ */

type MainTab = "preparing" | "dying" | "washing-janazah" | "burial" | "grief-visiting";
type RailTab = "washing-janazah" | "grief-visiting";
type WashingJanazahSub = "washing" | "janazah";
type GriefVisitingSub = "grief" | "visiting";

const mainTabs: { key: MainTab; label: string; icon: React.ReactNode }[] = [
  { key: "preparing", label: "Preparing", icon: <Hourglass size={16} /> },
  { key: "dying", label: "The Dying", icon: <Bed size={16} /> },
  { key: "washing-janazah", label: "Washing & Janazah", icon: <Droplets size={16} /> },
  { key: "burial", label: "Burial", icon: <Mountain size={16} /> },
  { key: "grief-visiting", label: "Grief & Visiting", icon: <CloudRain size={16} /> },
];

const washingJanazahSubs: { key: WashingJanazahSub; label: string; icon: React.ReactNode }[] = [
  { key: "washing", label: "Washing & Shrouding", icon: <Droplets size={16} /> },
  { key: "janazah", label: "Janazah Prayer", icon: <HandHeart size={16} /> },
];

const griefVisitingSubs: { key: GriefVisitingSub; label: string; icon: React.ReactNode }[] = [
  { key: "grief", label: "Grief & Patience", icon: <CloudRain size={16} /> },
  { key: "visiting", label: "Visiting Graves", icon: <Footprints size={16} /> },
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

function PreparingDeathTab() {
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
      </div>

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

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 3:185", desc: "Every soul will taste death" },
        { ref: "Quran 3:102", desc: "Do not die except in a state of Islam" },
        { ref: "Bukhari 55:1", desc: "A Muslim should not sleep without his wasiyyah" },
        { ref: "Tirmidhi 36:4", desc: "Remember often the destroyer of pleasures" },
        { ref: "Muslim 11:136", desc: "Visit graves — they remind you of the Hereafter" },
      ]} />
    </div>
  );
}

function DyingMomentsTab() {
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Muslim 11:1", desc: "Prompt the dying with the shahada" },
        { ref: "Abu Dawud 21:28", desc: "Last words 'La ilaha illa Allah' → Paradise" },
        { ref: "Muslim 11:7", desc: "Speak only good around the sick and dying" },
        { ref: "Muslim 11:8", desc: "Closing the eyes of the deceased" },
        { ref: "Quran 2:156", desc: "Inna lillahi wa inna ilayhi raji'un" },
      ]} />
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
            The awrah is covered at all times during washing. Whoever washes is required to keep what they see private. The Prophet ﷺ said: &quot;Whoever washes a Muslim and conceals his faults, Allah will forgive him forty times.&quot;
          </p>
        </ContentCard>
      </div>

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

function BurialTab() {
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
          <h5 className="text-gold font-medium mb-2">Depth and design</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The grave should be dug deep enough to contain the body and protect it (traditionally chest-to-shoulder depth of a standing man). A lahd (side-niche) carved into the qibla wall, or a shaqq (straight pit) — both are valid; the lahd is preferred.
          </p>
        </ContentCard>
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Bukhari 23:73", desc: "Hasten the burial" },
        { ref: "Abu Dawud 21:125", desc: "Bismillahi wa 'ala millati Rasulillah — when lowering" },
        { ref: "Abu Dawud 21:133", desc: "Stand and pray for firmness for the deceased" },
        { ref: "Muslim 11:44", desc: "Women discouraged but not forbidden from following the funeral" },
        { ref: "Muslim 11:121", desc: "Prohibition of building over and decorating graves" },
      ]} />
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
        <ContentCard delay={0.35}>
          <h5 className="text-gold font-medium mb-2">Cooking for the bereaved</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When the family of a deceased loses someone, the Prophet ﷺ said: &quot;Prepare food for the family of Ja&apos;far, for what has come to them keeps them preoccupied.&quot; Neighbors and friends should feed the bereaved family, not the other way around.
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

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

/* Per-sub-view sources, rendered full-width BELOW the rail layout so the
   Sources card lines up with the rest of the page instead of the rail's
   right column. */
const washingJanazahSources: Record<WashingJanazahSub, SourceRef[]> = {
  washing: [
    { ref: "Bukhari 23:15", desc: "Wash an odd number of times with sidr and camphor" },
    { ref: "Bukhari 23:18", desc: "Method of washing — begin from the right" },
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
};

const griefVisitingSources: Record<GriefVisitingSub, SourceRef[]> = {
  grief: [
    { ref: "Quran 2:156", desc: "Inna lillahi wa inna ilayhi raji'un" },
    { ref: "Quran 2:234", desc: "Widow's iddah of 4 months and 10 days" },
    { ref: "Quran 65:4", desc: "Pregnant widow's iddah ends at birth" },
    { ref: "Bukhari 23:43", desc: "Patience is at the first shock" },
    { ref: "Bukhari 23:52", desc: "Forbidden: slapping cheeks and tearing garments" },
    { ref: "Bukhari 23:61", desc: "The Prophet ﷺ weeping for his son" },
    { ref: "Muslim 11:4", desc: "Du'a at the moment of musibah" },
  ],
  visiting: [
    { ref: "Muslim 11:136", desc: "Visit graves — they remind you of the Hereafter" },
    { ref: "Muslim 11:131", desc: "The salam to give upon entering a graveyard" },
    { ref: "Muslim 11:124", desc: "Prohibition of sitting on graves" },
    { ref: "Muslim 11:127", desc: "Prohibition of praying facing graves" },
    { ref: "Muslim 25:20", desc: "Du'a of the living benefits the deceased" },
  ],
};

const subsByTab: Record<RailTab, readonly { key: string }[]> = {
  "washing-janazah": washingJanazahSubs,
  "grief-visiting": griefVisitingSubs,
};

const defaultSubs: Record<RailTab, string> = {
  "washing-janazah": "washing",
  "grief-visiting": "grief",
};

const isRailTab = (tab: MainTab): tab is RailTab =>
  tab === "washing-janazah" || tab === "grief-visiting";

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
    if (subParam && isRailTab(activeMain) && subsByTab[activeMain].some((s) => s.key === subParam)) {
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

  const changeTab = (tab: MainTab) => syncUrl(tab, isRailTab(tab) ? activeSubOf(tab) : undefined);

  const changeSub = (tab: RailTab) => (sub: string) => {
    setSubMemory((m) => ({ ...m, [tab]: sub }));
    syncUrl(tab, sub);
  };

  const activeWashing = activeSubOf("washing-janazah") as WashingJanazahSub;
  const activeGrief = activeSubOf("grief-visiting") as GriefVisitingSub;

  return (
    <div>
      <PageHeader
        title="Death & Janazah"
        titleAr="الموت والجنازة"
        subtitle="Preparing for death, the dying moments, washing and shrouding, the janazah prayer, burial, grief, and visiting graves"
      />

      <ContentCard className="mb-6">
        <div className="text-center py-4">
          <p className="text-2xl font-arabic text-gold leading-loose mb-3">
            ٱلَّذِينَ إِذَآ أَصَـٰبَتْهُم مُّصِيبَةٌ قَالُوٓا۟ إِنَّا لِلَّهِ وَإِنَّآ إِلَيْهِ رَٰجِعُونَ
          </p>
          <p className="text-themed-muted italic">
            &ldquo;Those when afflicted with a disaster, say, “We belong to Allah, and to Him we will return.”&rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-1">Quran 2:156</p>
        </div>
      </ContentCard>

      <TabBar
        tabs={mainTabs}
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
            {activeMain === "preparing" && <PreparingDeathTab />}
            {activeMain === "dying" && <DyingMomentsTab />}
            {activeMain === "washing-janazah" && (
              <>
                <SubTabLayout subs={washingJanazahSubs} activeSub={activeWashing} setActiveSub={changeSub("washing-janazah")}>
                  {activeWashing === "washing" && <WashingTab />}
                  {activeWashing === "janazah" && <JanazahTab />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={washingJanazahSources[activeWashing]} />
              </>
            )}
            {activeMain === "burial" && <BurialTab />}
            {activeMain === "grief-visiting" && (
              <>
                <SubTabLayout subs={griefVisitingSubs} activeSub={activeGrief} setActiveSub={changeSub("grief-visiting")}>
                  {activeGrief === "grief" && <GriefTab />}
                  {activeGrief === "visiting" && <VisitingGravesTab />}
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
