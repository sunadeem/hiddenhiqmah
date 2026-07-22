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
  Heart,
  Scroll,
  UserCog,
  Stethoscope,
  HandHeart,
  Flower,
  Users,
  HeartPulse,
  Baby,
  Sprout,
  Gift,
  Scale,
  GraduationCap,
  Crown,
  Sunset,
  Coins,
  HeartHandshake,
  Unlink,
  Globe,
  Thermometer,
  Droplets,
  Home,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES & TABS
   ═══════════════════════════════════════════════════════════════════ */

type MainTab = "parents" | "elders" | "children" | "kinship";
type ParentsSub = "rights" | "quran" | "sunnah" | "duas" | "after" | "non-muslim" | "stories";
type EldersSub = "elderly" | "sick" | "bearing" | "caring";
type ChildrenSub = "conceiving" | "pregnancy" | "nursing" | "newborn" | "blessings" | "loss" | "rights" | "raising" | "daughters" | "orphans";
type KinshipSub = "why" | "reward" | "severing" | "who" | "cut-off" | "neighbors";

const mainTabs: { key: MainTab; label: string; icon: React.ReactNode }[] = [
  { key: "children", label: "Children", icon: <Baby size={16} /> },
  { key: "parents", label: "Parents", icon: <Users size={16} /> },
  { key: "elders", label: "Elders & Sick", icon: <HeartPulse size={16} /> },
  { key: "kinship", label: "Kinship", icon: <HeartHandshake size={16} /> },
];

const parentsSubs: { key: ParentsSub; label: string; icon: React.ReactNode }[] = [
  { key: "rights", label: "Rights of Parents", icon: <Heart size={16} /> },
  { key: "quran", label: "In the Quran", icon: <BookOpen size={16} /> },
  { key: "sunnah", label: "From the Sunnah", icon: <Scroll size={16} /> },
  { key: "duas", label: "Du'a for Parents", icon: <HandHeart size={16} /> },
  { key: "after", label: "After They Pass", icon: <Flower size={16} /> },
  { key: "non-muslim", label: "Non-Muslim Parents", icon: <Globe size={16} /> },
  { key: "stories", label: "Stories of Birr", icon: <BookOpen size={16} /> },
];

const eldersSubs: { key: EldersSub; label: string; icon: React.ReactNode }[] = [
  { key: "elderly", label: "Honoring Elderly", icon: <UserCog size={16} /> },
  { key: "sick", label: "Visiting the Sick", icon: <Stethoscope size={16} /> },
  { key: "bearing", label: "Bearing Illness", icon: <Thermometer size={16} /> },
  { key: "caring", label: "Caring for Aging Parents", icon: <HandHeart size={16} /> },
];

const childrenSubs: { key: ChildrenSub; label: string; icon: React.ReactNode }[] = [
  { key: "conceiving", label: "Conceiving", icon: <Sprout size={16} /> },
  { key: "pregnancy", label: "Pregnancy", icon: <Heart size={16} /> },
  { key: "nursing", label: "Nursing & Milk-Kinship", icon: <Droplets size={16} /> },
  { key: "newborn", label: "Newborn", icon: <Baby size={16} /> },
  { key: "blessings", label: "Blessings", icon: <Gift size={16} /> },
  { key: "loss", label: "Losing a Child", icon: <Flower size={16} /> },
  { key: "rights", label: "Rights of Children", icon: <Scale size={16} /> },
  { key: "raising", label: "Raising Them Right", icon: <GraduationCap size={16} /> },
  { key: "daughters", label: "Virtue of Daughters", icon: <Crown size={16} /> },
  { key: "orphans", label: "Orphans & Adoption", icon: <Home size={16} /> },
];

const kinshipSubs: { key: KinshipSub; label: string; icon: React.ReactNode }[] = [
  { key: "why", label: "Why Kinship Matters", icon: <Heart size={16} /> },
  { key: "reward", label: "Reward of Maintaining Ties", icon: <Gift size={16} /> },
  { key: "severing", label: "Severity of Cutting Ties", icon: <Unlink size={16} /> },
  { key: "who", label: "Who Counts as Kin", icon: <Users size={16} /> },
  { key: "cut-off", label: "When They Cut You Off", icon: <HandHeart size={16} /> },
  { key: "neighbors", label: "Beyond Kin: Neighbors", icon: <Home size={16} /> },
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
          href="/family"
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
   TAB CONTENT
   ═══════════════════════════════════════════════════════════════════ */

function RightsTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-lg mb-2">Birr al-Walidayn — Goodness to Parents</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Allah pairs the command to worship Him alone with the command to be good to parents — a sign of how heavy this right weighs in Islam. Birr al-walidayn is not merely obedience; it is honor, gentleness, service, patience, and prayer for them throughout their lives and after.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.1}>
          <h5 className="text-gold font-medium mb-2">Obedience in what is good</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Obey them in everything that does not contradict the command of Allah. If they ask you to disobey Allah, do not — but still treat them with kindness in this world.
          </p>
          <Ref text="Quran 31:15" />
        </ContentCard>
        <ContentCard delay={0.13}>
          <h5 className="text-gold font-medium mb-2">Never even sigh at them</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Allah forbade us from saying even &quot;uff&quot; (the smallest sigh of impatience) to our parents — let alone scold or harm them.
          </p>
          <Ref text="Quran 17:23" />
        </ContentCard>
        <ContentCard delay={0.16}>
          <h5 className="text-gold font-medium mb-2">Lower the wing of humility</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Be humble before them out of mercy, and pray: &quot;My Lord, have mercy upon them as they raised me when I was small.&quot;
          </p>
          <Ref text="Quran 17:24" />
        </ContentCard>
        <ContentCard delay={0.19}>
          <h5 className="text-gold font-medium mb-2">Mother three times over</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A man asked the Prophet ﷺ who deserved his best companionship. He answered &quot;Your mother&quot; three times, then &quot;Your father.&quot;
          </p>
          <Ref text="Bukhari 78:2" />
        </ContentCard>
        <ContentCard delay={0.22}>
          <h5 className="text-gold font-medium mb-2">Pleasing parents pleases Allah</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;The pleasure of the Lord lies in the pleasure of the parent, and the anger of the Lord lies in the anger of the parent.&quot;
          </p>
          <Ref text="Tirmidhi 27:3" />
        </ContentCard>
        <ContentCard delay={0.25}>
          <h5 className="text-gold font-medium mb-2">A door to Paradise</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;The parent is the middle door of Paradise. So if you wish, keep it or lose it.&quot;
          </p>
          <Ref text="Tirmidhi 27:3" />
        </ContentCard>
        <ContentCard delay={0.28}>
          <h5 className="text-gold font-medium mb-2">&apos;Uquq — the warning</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ asked his companions three times: &quot;Shall I not inform you of the biggest of the great sins?&quot; They said yes. He said: &quot;To join partners in worship with Allah; to be undutiful to one&apos;s parents.&quot; Disobedience and cruelty to parents (&apos;uquq al-walidayn) is named beside shirk itself — there is no stronger way the religion could mark its gravity.
          </p>
          <Ref text="Bukhari 78:7; Bukhari 52:18" />
        </ContentCard>
      </div>
    </div>
  );
}

function QuranTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Quran returns again and again to the rights of parents — often immediately after the command to worship Allah alone. These verses are the foundation of how a Muslim treats their mother and father.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا"
          transliteration="Wa qada Rabbuka alla ta'budu illa iyyahu wa bil-walidayni ihsana"
          english="Your Lord has decreed that you worship none but Him, and that you be good to your parents."
          source="Quran 17:23"
          delay={0.1}
        />
        <VerseCard
          arabic="إِمَّا يَبْلُغَنَّ عِنْدَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُلْ لَهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُلْ لَهُمَا قَوْلًا كَرِيمًا"
          transliteration="Imma yablughanna 'indaka al-kibara ahaduhuma aw kilahuma fala taqul lahuma uffin wa la tanharhuma wa qul lahuma qawlan karima"
          english="If one or both of them reach old age in your care, do not say to them even 'uff,' nor scold them — speak to them a noble word."
          source="Quran 17:23"
          delay={0.13}
        />
        <VerseCard
          arabic="وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُلْ رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا"
          transliteration="Wakhfid lahuma janahadh-dhulli mina ar-rahmati wa qul rabbi irhamhuma kama rabbayani saghira"
          english="Lower to them the wing of humility out of mercy and say: 'My Lord, have mercy upon them as they raised me when I was small.'"
          source="Quran 17:24"
          delay={0.16}
        />
        <VerseCard
          arabic="وَوَصَّيْنَا الْإِنْسَانَ بِوَالِدَيْهِ حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَىٰ وَهْنٍ وَفِصَالُهُ فِي عَامَيْنِ أَنِ اشْكُرْ لِي وَلِوَالِدَيْكَ"
          transliteration="Wa wassayna al-insana bi-walidayhi hamalat-hu ummuhu wahnan 'ala wahnin wa fisaluhu fi 'amayni ani ishkur li wa li-walidayk"
          english="We have enjoined on man concerning his parents — his mother bore him in weakness upon weakness, and his weaning took two years — that you be grateful to Me and to your parents."
          source="Quran 31:14"
          delay={0.19}
        />
        <VerseCard
          arabic="وَوَصَّيْنَا الْإِنْسَانَ بِوَالِدَيْهِ إِحْسَانًا ۖ حَمَلَتْهُ أُمُّهُ كُرْهًا وَوَضَعَتْهُ كُرْهًا"
          transliteration="Wa wassayna al-insana bi-walidayhi ihsana, hamalat-hu ummuhu kurhan wa wada'at-hu kurha"
          english="We have enjoined on man kindness to his parents — his mother carried him with hardship and gave birth to him with hardship."
          source="Quran 46:15"
          delay={0.22}
        />
        <VerseCard
          arabic="وَاعْبُدُوا اللَّهَ وَلَا تُشْرِكُوا بِهِ شَيْئًا ۖ وَبِالْوَالِدَيْنِ إِحْسَانًا"
          transliteration="Wa'budu Allaha wa la tushriku bihi shay'an, wa bil-walidayni ihsana"
          english="Worship Allah and associate nothing with Him, and to parents do good."
          source="Quran 4:36"
          delay={0.25}
        />
      </div>
    </div>
  );
}

function SunnahTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="رَغِمَ أَنْفُهُ، ثُمَّ رَغِمَ أَنْفُهُ، ثُمَّ رَغِمَ أَنْفُهُ. قِيلَ مَنْ يَا رَسُولَ اللَّهِ قَالَ مَنْ أَدْرَكَ أَبَوَيْهِ عِنْدَ الْكِبَرِ أَحَدَهُمَا أَوْ كِلَيْهِمَا ثُمَّ لَمْ يَدْخُلِ الْجَنَّةَ"
          transliteration="Raghima anfuhu, thumma raghima anfuhu, thumma raghima anfuh. Qila man ya RasulAllah? Qala: man adraka abawayhi 'inda al-kibari ahadahuma aw kilayhima thumma lam yadkhuli al-jannah"
          english="May he be humbled, may he be humbled, may he be humbled! It was said: Who, O Messenger of Allah? He said: The one who finds one or both of his parents in old age and does not enter Paradise."
          source="Muslim 45:11"
          delay={0.05}
        />
        <VerseCard
          arabic="أَىُّ الْعَمَلِ أَحَبُّ إِلَى اللَّهِ قَالَ الصَّلاَةُ عَلَى وَقْتِهَا. قَالَ ثُمَّ أَىٌّ قَالَ ثُمَّ بِرُّ الْوَالِدَيْنِ"
          transliteration="Ayyu al-'amali ahabbu ila Allah? Qala: as-salatu 'ala waqtiha. Qala: thumma ayy? Qala: thumma birru al-walidayn"
          english="Which deed is most beloved to Allah? He said: Prayer at its time. Then which? He said: Then goodness to parents."
          source="Bukhari 78:1"
          delay={0.08}
        />
        <VerseCard
          arabic="فَإِنَّ الْجَنَّةَ تَحْتَ رِجْلَيْهَا"
          transliteration="Fa-inna al-jannata tahta rijlayha"
          english="Paradise is beneath her (the mother's) feet."
          source="Nasai 25:20"
          delay={0.11}
        />
        <VerseCard
          arabic="مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ وَيُنْسَأَ لَهُ فِي أَثَرِهِ فَلْيَصِلْ رَحِمَهُ"
          transliteration="Man ahabba an yubsata lahu fi rizqihi wa yunsa'a lahu fi atharihi falyasil rahimah"
          english="Whoever wishes that his provision be expanded and his lifespan extended — let him maintain his ties of kinship."
          source="Bukhari 78:17"
          delay={0.14}
        />
        <VerseCard
          arabic="ثَلاَثُ دَعَوَاتٍ مُسْتَجَابَاتٌ لاَ شَكَّ فِيهِنَّ دَعْوَةُ الْمَظْلُومِ وَدَعْوَةُ الْمُسَافِرِ وَدَعْوَةُ الْوَالِدِ عَلَى وَلَدِهِ"
          transliteration="Thalathu da'awatin mustajabatun la shakka fihinna: da'watu al-mazlumi, wa da'watu al-musafiri, wa da'watu al-walidi 'ala waladih"
          english="Three supplications are answered without doubt: the supplication of the oppressed, the traveler, and the parent against their child — a reminder of how heavy a parent's word is."
          source="Tirmidhi 27:11"
          delay={0.17}
        />
        <VerseCard
          arabic="رِضَا الرَّبِّ فِي رِضَا الْوَالِدِ، وَسَخَطُ الرَّبِّ فِي سَخَطِ الْوَالِدِ"
          transliteration="Rida ar-Rabbi fi rida al-walid, wa sakhatu ar-Rabbi fi sakhati al-walid"
          english="The pleasure of the Lord lies in the pleasure of the parent, and the anger of the Lord lies in the anger of the parent."
          source="Tirmidhi 27:3"
          delay={0.2}
        />
        <VerseCard
          arabic={`جَاءَ رَجُلٌ إِلَى النَّبِيِّ صلى الله عليه وسلم فَاسْتَأْذَنَهُ فِي الْجِهَادِ فَقَالَ ‏"‏ أَحَىٌّ وَالِدَاكَ ‏"‏‏.‏ قَالَ نَعَمْ‏.‏ قَالَ ‏"‏ فَفِيهِمَا فَجَاهِدْ ‏"‏‏.`}
          transliteration="A-hayyun walidaka? Qala: na'am. Qala: fa-fihima fa-jahid"
          english="A man came to the Prophet ﷺ asking his permission to take part in Jihad. The Prophet ﷺ asked him, 'Are your parents alive?' He replied in the affirmative. The Prophet ﷺ said to him, 'Then exert yourself in their service.'"
          source="Bukhari 56:213"
          delay={0.23}
        />
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Service to parents outweighs the battlefield</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The same exchange is recorded in An-Nasa&apos;i: &quot;Are your parents alive?&quot; — &quot;Yes.&quot; — &quot;Then strive for their sake.&quot; The daily grind of serving a mother and father is placed in the vocabulary of jihad itself.
          </p>
          <Ref text="Nasai 25:19" />
        </ContentCard>
      </div>
    </div>
  );
}

function DuasTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Allah taught us to pray for our parents in His own words. These du&apos;as can be said daily — especially in sujood, after salah, and on Friday — and continue benefiting parents long after they pass.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا"
          transliteration="Rabbi irhamhuma kama rabbayani saghira"
          english="My Lord, have mercy upon them as they raised me when I was small."
          source="Quran 17:24"
          delay={0.08}
        />
        <VerseCard
          arabic="رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ"
          transliteration="Rabbana ighfir li wa li-walidayya wa lil-mu'minina yawma yaqumu al-hisab"
          english="Our Lord, forgive me and my parents and the believers on the Day the reckoning is established."
          source="Quran 14:41"
          delay={0.11}
        />
        <VerseCard
          arabic="رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ"
          transliteration="Rabbi awzi'ni an ashkura ni'matakallati an'amta 'alayya wa 'ala walidayya wa an a'mala salihan tardah"
          english="My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents, and to do righteousness of which You approve."
          source="Quran 46:15"
          delay={0.14}
        />
        <VerseCard
          arabic="رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَنْ دَخَلَ بَيْتِيَ مُؤْمِنًا"
          transliteration="Rabbi ighfir li wa li-walidayya wa liman dakhala baytiya mu'mina"
          english="My Lord, forgive me and my parents and whoever enters my house as a believer."
          source="Quran 71:28"
          delay={0.17}
        />
      </div>
    </div>
  );
}

function AfterTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The duty to parents does not end with their death. There are specific acts the Prophet ﷺ taught that continue to reach them in the grave — and many of them are simple, daily things you can do for the rest of your life.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلاَّ مِنْ ثَلاَثَةٍ إِلاَّ مِنْ صَدَقَةٍ جَارِيَةٍ أَوْ عِلْمٍ يُنْتَفَعُ بِهِ أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ"
          transliteration="Idha mata al-insanu inqata'a 'anhu 'amaluhu illa min thalathatin: illa min sadaqatin jariyatin, aw 'ilmin yuntafa'u bihi, aw waladin salihin yad'u lah"
          english="When a person dies, their deeds come to an end except three: ongoing charity, beneficial knowledge, or a righteous child who prays for them."
          source="Muslim 25:20"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Ongoing du&apos;a</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Continue praying for their forgiveness and mercy daily. The dua of a righteous child reaches them in the grave and raises their station.
          </p>
          <Ref text="Muslim 25:20" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Sadaqah on their behalf</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Give charity in their name — feed someone, build a well, support a student of knowledge. Each becomes a sadaqah jariyah for them.
          </p>
          <Ref text="Bukhari 55:23" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Honor their friends</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ said the finest act of birr after death is to keep ties with the parents&apos; friends.
          </p>
          <Ref text="Muslim 45:13" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Maintain their ties of kinship</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Visit and honor their relatives — aunts, uncles, cousins — even those you do not know well. These ties were precious to them.
          </p>
          <Ref text="Muslim 45:13" />
          <Link href="/family?tab=kinship&sub=why" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            More on kinship ties →
          </Link>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Hajj and Umrah on their behalf</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A man told the Prophet ﷺ that his father was too old to perform Hajj or Umrah or even ride a mount. He ﷺ said: &quot;Perform hajj and umrah on behalf of your father.&quot; The same applies for a parent who has passed — a woman asked about Hajj on behalf of her deceased mother and the Prophet ﷺ said yes.
          </p>
          <Ref text="Abu Dawud 11:90; Nasai 24:15" />
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Settle their debts</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When asked whether Hajj on behalf of a deceased mother would count, the Prophet ﷺ answered with a debt: &quot;If her mother owed a debt and she paid it off, would that not be good enough?&quot; Discharging what a parent owed — to Allah or to people — is among the first duties of the child left behind.
          </p>
          <Ref text="Nasai 24:15" />
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Fasts they owed</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Whoever died and he ought to have fasted, then his guardians must fast on his behalf.&quot; If your parent passed with missed fasts or an unfulfilled vow, some scholars hold the heir fasts on their behalf — the Hanbali school applies this especially to vowed fasts — while the Hanafi and Maliki schools direct feeding a poor person for each missed day instead. Consult a scholar for your situation.
          </p>
          <Ref text="Bukhari 30:59; Muslim 13:198" />
        </ContentCard>
      </div>
    </div>
  );
}

function NonMuslimParentsTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-lg mb-2">Kindness Without Compromise</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          For many who embrace Islam, the first family question is the hardest: how do I treat my mother and father who are not Muslim? The answer of the Quran and Sunnah is remarkably clear — your parents keep their full right to your kindness, service, and companionship. Only one thing is withheld: obedience in anything that contradicts Allah.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="وَإِن جَـٰهَدَاكَ عَلَىٰٓ أَن تُشْرِكَ بِى مَا لَيْسَ لَكَ بِهِۦ عِلْمٌ فَلَا تُطِعْهُمَا ۖ وَصَاحِبْهُمَا فِى ٱلدُّنْيَا مَعْرُوفًا"
          transliteration="Wa in jahadaka 'ala an tushrika bi ma laysa laka bihi 'ilmun fala tuti'huma, wa sahibhuma fi ad-dunya ma'rufa"
          english="But if they strive to make you associate partners with Me of what you have no knowledge, then do not obey them. Yet keep company with them in this world with kindness."
          source="Quran 31:15"
          delay={0.08}
        />
        <VerseCard
          arabic="لَّا يَنْهَىٰكُمُ ٱللَّهُ عَنِ ٱلَّذِينَ لَمْ يُقَـٰتِلُوكُمْ فِى ٱلدِّينِ وَلَمْ يُخْرِجُوكُم مِّن دِيَـٰرِكُمْ أَن تَبَرُّوهُمْ وَتُقْسِطُوٓا۟ إِلَيْهِمْ ۚ إِنَّ ٱللَّهَ يُحِبُّ ٱلْمُقْسِطِينَ"
          transliteration="La yanhakumu Allahu 'ani alladhina lam yuqatilukum fi ad-dini wa lam yukhrijukum min diyarikum an tabarruhum wa tuqsitu ilayhim, inna Allaha yuhibbu al-muqsitin"
          english="Allah does not forbid you from being kind and just to those who did not fight against you nor did they drive you out of your homes. Indeed, Allah loves those who are just."
          source="Quran 60:8"
          delay={0.11}
        />
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Asma and her pagan mother</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Asma bint Abi Bakr&apos;s mother — still a pagan — came to visit her in Madinah hoping for her daughter&apos;s generosity. Asma went to the Prophet ﷺ and asked: shall I keep good relations with her? He said: &quot;Yes, keep good relations with her.&quot; The word used for that kindness in the verse the commentators connect to her story (Quran 60:8) is <span className="text-gold italic">birr</span> — the same word used for goodness to Muslim parents.
          </p>
          <Ref text="Bukhari 51:52" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">What this looks like</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Visit them, call them, care for them in sickness and old age, spend on them if they need it, speak gently even when they speak against your faith. The verse commanding refusal in shirk commands kind company in the very same breath — and for many parents, years of a child&apos;s patient, consistent goodness became the strongest da&apos;wah they ever received.
          </p>
          <Ref text="Quran 31:15" />
        </ContentCard>
      </div>
    </div>
  );
}

function StoriesOfBirrTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Three stories the Prophet ﷺ and his companions passed down are the classical curriculum of birr al-walidayn — a shepherd who stood all night holding milk, a worshipper whose mother&apos;s words changed his life, and a Yemeni whose service to his mother made his du&apos;a sought by Umar himself.
        </p>
      </ContentCard>

      <div className="space-y-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">The three in the cave</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Three travelers took shelter in a cave, and a rock sealed the entrance. Each begged Allah by his most sincere deed. One said: I had old parents, and I would always give them milk before my own children. One night I returned late and found them asleep — so I stood with the cup in my hand until dawn, my children crying at my feet, unwilling to wake my parents or serve anyone before them. He asked Allah by that deed, and the rock began to move. Birr that Allah accepts moves mountains — it is patient, quiet, and puts parents first even when no one is watching.
          </p>
          <Ref text="Bukhari 78:5" />
        </ContentCard>
        <ContentCard delay={0.12}>
          <h5 className="text-gold font-medium mb-2">Juraij and his mother</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Juraij, a devoted worshipper of Bani Israil, was praying in his hermitage when his mother called him. Torn between prayer and her call, he chose to continue praying — three times. Hurt, she prayed: &quot;O Allah, do not let him die until he sees the faces of prostitutes.&quot; Her words were answered: Juraij was falsely accused by a woman of fathering her child, his hermitage torn down, his name disgraced — until Allah cleared him through the infant speaking. The lesson the scholars drew: even a voluntary act of worship does not outrank a mother&apos;s call, and a parent&apos;s hurt is a dangerous thing to earn.
          </p>
          <Ref text="Bukhari 46:43; Bukhari 21:10" />
        </ContentCard>
        <ContentCard delay={0.16}>
          <h5 className="text-gold font-medium mb-2">Uways al-Qarani</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ told his companions of a man they would never meet in his lifetime: &quot;Worthy amongst the successors would be a person who would be called Uwais. He would have his mother with him... Ask him to beg pardon for you from Allah.&quot; Umar (RA) would ask the delegations arriving from Yemen for him, and when he found him, asked him — the Khalifah of the Muslims — to pray for his forgiveness. Uways&apos;s station was not built on the battlefield or in gatherings of knowledge the world could see. It was built serving his mother.
          </p>
          <Ref text="Muslim 44:319; Muslim 44:320" />
        </ContentCard>
      </div>
    </div>
  );
}

function ElderlyTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Honoring elders — parents or otherwise — is part of glorifying Allah Himself. The Prophet ﷺ tied it directly to mercy on the young: a community that respects its elders and protects its children is a community Allah loves.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="لَيْسَ مِنَّا مَنْ لَمْ يَرْحَمْ صَغِيرَنَا وَيُوَقِّرْ كَبِيرَنَا"
          transliteration="Laysa minna man lam yarham saghirana wa yuwaqqir kabirana"
          english="He is not one of us who does not show mercy to our young and respect to our elders."
          source="Tirmidhi 27:25"
          delay={0.08}
        />
        <VerseCard
          arabic="إِنَّ مِنْ إِجْلاَلِ اللَّهِ إِكْرَامَ ذِي الشَّيْبَةِ الْمُسْلِمِ"
          transliteration="Inna min ijlali Allahi ikrama dhi ash-shaybati al-muslim"
          english="Part of glorifying Allah is honoring the grey-haired Muslim."
          source="Abu Dawud 43:71"
          delay={0.11}
        />
        <VerseCard
          arabic="مَا أَكْرَمَ شَابٌّ شَيْخًا لِسِنِّهِ إِلاَّ قَيَّضَ اللَّهُ لَهُ مَنْ يُكْرِمُهُ عِنْدَ سِنِّهِ"
          transliteration="Ma akrama shabbun shaykhan li-sinnihi illa qayyada Allahu lahu man yukrimuhu 'inda sinnih"
          english="No young person honors an elder for their age except that Allah appoints someone to honor them in their own old age."
          source="Tirmidhi 27:128"
          delay={0.14}
        />
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Let elders speak first</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ corrected a young man trying to speak before his elders by saying: &quot;The elder, the elder&quot; — let the older one begin.
          </p>
          <Ref text="Bukhari 78:169" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Practical kindness</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Stand to greet them, give them the best seat, lower your voice when they speak, help them with practical needs, and never roll your eyes or sigh at their pace.
          </p>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Their du&apos;a is precious</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Seek the du&apos;a of righteous elders. Their hearts are softened by years of remembering Allah, and their supplication is accepted.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function SickTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Visiting the sick is one of the rights every Muslim owes another. The Prophet ﷺ described it as walking in a garden of Paradise, with seventy thousand angels praying for the visitor until they return home.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="حَقُّ الْمُسْلِمِ عَلَى الْمُسْلِمِ خَمْسٌ رَدُّ السَّلاَمِ وَعِيَادَةُ الْمَرِيضِ وَاتِّبَاعُ الْجَنَائِزِ وَإِجَابَةُ الدَّعْوَةِ وَتَشْمِيتُ الْعَاطِسِ"
          transliteration="Haqqu al-muslimi 'ala al-muslimi khamsun: raddu as-salami, wa 'iyadatu al-maridi, wa ittiba'u al-jana'izi, wa ijabatu ad-da'wati, wa tashmitu al-'atis"
          english="The rights of a Muslim over another are five: returning the salam, visiting the sick, following the funeral, accepting the invitation, and responding to the one who sneezes."
          source="Bukhari 23:4"
          delay={0.08}
        />
        <VerseCard
          arabic="مَا مِنْ مُسْلِمٍ يَعُودُ مُسْلِمًا غُدْوَةً إِلاَّ صَلَّى عَلَيْهِ سَبْعُونَ أَلْفَ مَلَكٍ حَتَّى يُمْسِيَ"
          transliteration="Ma min muslimin ya'udu musliman ghudwatan illa salla 'alayhi sab'una alfa malakin hatta yumsi"
          english="No Muslim visits another Muslim who is sick in the morning except that seventy thousand angels pray for him until evening."
          source="Tirmidhi 10:5"
          delay={0.11}
        />
        <VerseCard
          arabic="مَنْ عَادَ مَرِيضًا لَمْ يَزَلْ فِي خُرْفَةِ الْجَنَّةِ"
          transliteration="Man 'ada maridan lam yazal fi khurfati al-jannah"
          english="Whoever visits the sick is in a garden of Paradise until he returns."
          source="Muslim 45:49"
          delay={0.14}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Du&apos;a for the Sick</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ"
          transliteration="As'alu Allaha al-'Azima Rabba al-'Arshi al-'Azimi an yashfiyak"
          english="I ask Allah the Mighty, Lord of the Mighty Throne, to cure you."
          source="Abu Dawud 21:18"
          delay={0.17}
        />
        <VerseCard
          arabic="اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لاَ شِفَاءَ إِلاَّ شِفَاؤُكَ، شِفَاءً لاَ يُغَادِرُ سَقَمًا"
          transliteration="Allahumma Rabban-nasi, adhhibi al-ba'sa, ishfi anta ash-Shafi, la shifa'a illa shifa'uka, shifa'an la yughadiru saqama"
          english="O Allah, Lord of the people, remove the harm. Cure — You are the Curer. There is no cure except Your cure, a cure that leaves no illness behind."
          source="Bukhari 75:35"
          delay={0.2}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Etiquette of the Visit</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Keep it short</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A brief visit is best for the sick. Long sittings tire them; a short, warm presence comforts.
          </p>
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Speak hope</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Remind them that illness wipes away sins as leaves fall from a tree. Speak words of healing and good expectation, not grim predictions.
          </p>
          <Ref text="Bukhari 75:1" />
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Make du&apos;a beside them</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Place your hand gently on the affected area or hold their hand and recite the Prophetic du&apos;as for healing. Do not rush — sit, listen, and pray.
          </p>
          <Ref text="Bukhari 75:35" />
        </ContentCard>
        <ContentCard delay={0.32}>
          <h5 className="text-gold font-medium mb-2">Bring something with you</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A small gift, fruit, or warm food is from the Sunnah of visiting. Even a smile and presence is a gift.
          </p>
        </ContentCard>
        <ContentCard delay={0.35}>
          <h5 className="text-gold font-medium mb-2">Allah is with the sick</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            In a Qudsi hadith, Allah says on the Day of Judgement: &quot;O son of Adam, I was sick and you did not visit Me.&quot; The servant asks how, and Allah says: &quot;Did you not know My servant So-and-so was sick? Had you visited him, you would have found Me with him.&quot;
          </p>
          <Ref text="Muslim 45:54" />
        </ContentCard>
      </div>
    </div>
  );
}

function BearingIllnessTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-lg mb-2">When You Are the Sick One</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Islam does not only speak to the visitor at the bedside — it speaks to the one in the bed. Illness borne with patience is never wasted: it erases sins, raises ranks, and puts on your tongue the very words the prophets used in their hardest hours.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلاَ وَصَبٍ وَلاَ هَمٍّ وَلاَ حُزْنٍ وَلاَ أَذًى وَلاَ غَمٍّ حَتَّى الشَّوْكَةِ يُشَاكُهَا، إِلاَّ كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ"
          transliteration="Ma yusibu al-muslima min nasabin wa la wasabin wa la hammin wa la huznin wa la adhan wa la ghammin hatta ash-shawkati yushakuha illa kaffara Allahu biha min khatayah"
          english="No fatigue, nor disease, nor sorrow, nor sadness, nor hurt, nor distress befalls a Muslim, even if it were the prick he receives from a thorn, but that Allah expiates some of his sins for that."
          source="Bukhari 75:2"
          delay={0.08}
        />
        <VerseCard
          arabic="ٱلَّذِينَ إِذَآ أَصَـٰبَتْهُم مُّصِيبَةٌ قَالُوٓا۟ إِنَّا لِلَّهِ وَإِنَّآ إِلَيْهِ رَٰجِعُونَ"
          transliteration="Alladhina idha asabat-hum musibatun qalu inna lillahi wa inna ilayhi raji'un"
          english="Those when afflicted with a disaster, say, 'We belong to Allah, and to Him we will return.'"
          source="Quran 2:155-156"
          delay={0.11}
        />
        <VerseCard
          arabic="وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُۥٓ أَنِّى مَسَّنِىَ ٱلضُّرُّ وَأَنتَ أَرْحَمُ ٱلرَّٰحِمِينَ"
          transliteration="Wa Ayyuba idh nada Rabbahu anni massaniya ad-durru wa anta arhamu ar-rahimin"
          english="And [remember] Job, when he cried out to his Lord, 'I have been struck by adversity, and You are the Most Merciful of those who show mercy.'"
          source="Quran 21:83"
          delay={0.14}
        />
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Ayyub&apos;s du&apos;a — and Allah&apos;s answer</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Ayyub (Job) did not list demands; he stated his pain and named Allah&apos;s mercy — and Allah says in the very next verse: &quot;So We responded to him and relieved his adversity, and We restored to him his family, twice as many.&quot; This is the model du&apos;a of the sick: honest about the hurt, certain about the One being asked.
          </p>
          <Ref text="Quran 21:83-84" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Ask for the cure yourself</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The healing du&apos;a the Prophet ﷺ made over the sick — &quot;O Allah, Lord of the people, remove the harm. Cure — You are the Curer...&quot; — is yours to say for yourself as well. Combine it with the means Allah created: medicine, rest, and treatment are part of trusting Him, not a departure from it.
          </p>
          <Ref text="Bukhari 75:35" />
          <Link href="/family?tab=elders&sub=sick" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            The du&apos;as for the sick →
          </Link>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Sins falling like leaves</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Ibn Mas&apos;ud visited the Prophet ﷺ burning with fever — &quot;as much fever as two men of you&quot; — and asked if that meant a double reward. He ﷺ said yes: &quot;No Muslim is afflicted with any harm, even if it were the prick of a thorn, but that Allah expiates his sins because of that, as a tree sheds its leaves.&quot;
          </p>
          <Ref text="Bukhari 75:8" />
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">The deen bends around your weakness</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Imran bin Husain, suffering from piles, asked the Prophet ﷺ about the prayer. He said: &quot;Pray while standing and if you can&apos;t, pray while sitting and if you cannot do even that, then pray lying on your side.&quot; Illness never locks you out of salah — the salah reshapes itself around you.
          </p>
          <Ref text="Bukhari 18:37" />
        </ContentCard>
      </div>
    </div>
  );
}

function CaringForParentsTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-lg mb-2">The Door Standing Open in Your Home</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Prophet ﷺ declared it a humiliation to find one&apos;s parents in old age and fail to reach Paradise through them. If you are cooking, lifting, driving, repeating answers, and losing sleep for an aging mother or father — you are not falling behind on your deen. You are standing in front of one of its widest doors.
        </p>
        <Ref text="Muslim 45:11" />
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">&quot;Uff&quot; was forbidden for this stage</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The verse forbidding even a sigh of impatience names its context: &quot;If one or both of them reach old age in your care.&quot; Allah legislated for the exhausting years specifically — the repeated questions, the slowness, the reversal of roles where you now do for them what they once did for you. &quot;My Lord, have mercy on them as they raised me when I was small&quot; is the du&apos;a of this season.
          </p>
          <Ref text="Quran 17:23-24" />
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">This service is your jihad</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When a man sought permission for the battlefield, the Prophet ﷺ asked if his parents were alive, then said: &quot;Then exert yourself in their service.&quot; Caregiving fatigue is not a distraction from great deeds — in the Prophet&apos;s own words, it stands in their highest rank.
          </p>
          <Ref text="Bukhari 56:213" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Patience with repetition and decline</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Scholars counsel that a parent&apos;s dementia, confusion, or sharpened temper in old age changes nothing of their right — answer the tenth repetition of a question like the first, and guard their dignity in front of others as fiercely as their health. Every gentle answer is written for you, and none of it is forgotten by the One who watched them once answer your own endless questions.
          </p>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Share the load among siblings</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Scholars note that the duty of care falls on the children together — not solely on the one who lives closest or the daughter by default. Speak plainly with siblings about rotations, money, and respite. Enabling a sibling to carry their share is itself birr; quietly burning out alone serves no one, least of all your parents.
          </p>
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Outside help and care homes</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Scholars state that the obligation is that parents are genuinely cared for, honored, and kept close to their children&apos;s presence and affection — bringing in nurses or professional help to do what you cannot is not a failure of birr. What the tradition warns against is abandonment: outsourcing their care in order to be free of them. The heart of the matter is presence, whoever holds the equipment.
          </p>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Renew the intention</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The same lifting, feeding, and driving can be a chore or an act of worship — the difference is intention. Renew it on the hard days: &quot;O Allah, this is my birr, my service, my door of Paradise.&quot; And keep asking Allah to make you patient with them, as they once asked Him to make them patient with you.
          </p>
          <Ref text="Quran 17:24" />
        </ContentCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CHILDREN TAB CONTENT
   ═══════════════════════════════════════════════════════════════════ */

function ConceivingTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Before a child is even conceived, Islam shapes the act with intention and du&apos;a. The Prophet ﷺ taught that saying Allah&apos;s name beforehand keeps Shaytan from harming the offspring. The prophets of old asked Allah for righteous children — and we are taught to ask in their words.
        </p>
      </ContentCard>

      <ContentCard delay={0.08}>
        <h5 className="text-gold font-medium mb-2">Du&apos;a before intimacy</h5>
        <p className="text-themed-muted text-sm leading-relaxed">
          The du&apos;a the Prophet ﷺ taught for before intimacy — &quot;Bismillah, Allahumma jannibna ash-Shaytana...&quot; — and its promise of protection for the child now live with the rest of the married-life guidance.
        </p>
        <Link href="/marriage?tab=married-life&sub=dua-before-intimacy" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Read it on the Marriage page →
        </Link>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Du&apos;as of the Prophets for Righteous Offspring</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ"
          transliteration="Rabbi hab li mina as-salihin"
          english="My Lord, grant me one of the righteous."
          source="Quran 37:100"
          delay={0.05}
        />
        <VerseCard
          arabic="رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً ۖ إِنَّكَ سَمِيعُ الدُّعَاءِ"
          transliteration="Rabbi hab li min ladunka dhurriyyatan tayyibah, innaka Sami'u ad-du'a"
          english="My Lord, grant me from Yourself a pure offspring. Indeed, You are the Hearer of supplication."
          source="Quran 3:38"
          delay={0.08}
        />
        <VerseCard
          arabic="رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا"
          transliteration="Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama"
          english="Our Lord, grant us from among our spouses and our offspring a coolness of the eyes, and make us a leader of the righteous."
          source="Quran 25:74"
          delay={0.11}
        />
        <VerseCard
          arabic="رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ"
          transliteration="Rabbi-j'alni muqima as-salati wa min dhurriyyati, Rabbana wa taqabbal du'a"
          english="My Lord, make me an establisher of prayer, and from my offspring. Our Lord, and accept my supplication."
          source="Quran 14:40"
          delay={0.14}
        />
      </div>
    </div>
  );
}

function PregnancyTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Quran is heavy on the weight a mother carries. Pregnancy is months of hardship, exhaustion, and worry — and a season of profound spiritual opportunity. Recite Quran often, make du&apos;a for a righteous child, and lean into Allah&apos;s name through every wave of difficulty.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">Quran on the Hardship of Pregnancy</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَىٰ وَهْنٍ وَفِصَالُهُ فِي عَامَيْنِ"
          transliteration="Hamalat-hu ummuhu wahnan 'ala wahnin wa fisaluhu fi 'amayn"
          english="His mother bore him in weakness upon weakness, and his weaning took two years."
          source="Quran 31:14"
          delay={0.08}
        />
        <VerseCard
          arabic="حَمَلَتْهُ أُمُّهُ كُرْهًا وَوَضَعَتْهُ كُرْهًا ۖ وَحَمْلُهُ وَفِصَالُهُ ثَلَاثُونَ شَهْرًا"
          transliteration="Hamalat-hu ummuhu kurhan wa wada'at-hu kurha, wa hamluhu wa fisaluhu thalathuna shahra"
          english="His mother carried him with hardship and gave birth to him with hardship — and his bearing and weaning is thirty months."
          source="Quran 46:15"
          delay={0.11}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Du&apos;as During Pregnancy</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="رَبِّ إِنِّي نَذَرْتُ لَكَ مَا فِي بَطْنِي مُحَرَّرًا فَتَقَبَّلْ مِنِّي ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ"
          transliteration="Rabbi inni nadhartu laka ma fi batni muharraran fataqabbal minni, innaka anta as-Sami'u al-'Alim"
          english="My Lord, I have vowed to You what is in my womb, dedicated [for Your service], so accept this from me. Indeed, You are the Hearing, the Knowing."
          source="Quran 3:35"
          delay={0.08}
        />
        <VerseCard
          arabic="رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً"
          transliteration="Rabbi hab li min ladunka dhurriyyatan tayyibah"
          english="My Lord, grant me from Yourself a pure offspring."
          source="Quran 3:38"
          delay={0.11}
        />
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Recite Quran often</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Many mothers make a habit of reciting Surah Maryam (for ease in delivery) and Surah Yusuf (for beautiful character) regularly. While these specific recitations are based on tradition rather than authentic hadith, recitation of Quran in any form is barakah for both mother and child.
          </p>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Lean on dhikr through difficulty</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Hasbunallahu wa ni&apos;mal-wakeel, La hawla wa la quwwata illa billah, and abundant istighfar. Each moment of nausea, exhaustion, and pain is rewarded as a hardship borne for Allah&apos;s sake.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function NursingTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-lg mb-2">Rada&apos;ah — Nursing and Milk-Kinship</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Quran gives breastfeeding its own legislation: a two-year term, a duty of provision on the father, and — unique to this ummah&apos;s law — a kinship created by milk itself, strong enough to prohibit marriage exactly as blood does.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="وَٱلْوَٰلِدَٰتُ يُرْضِعْنَ أَوْلَـٰدَهُنَّ حَوْلَيْنِ كَامِلَيْنِ ۖ لِمَنْ أَرَادَ أَن يُتِمَّ ٱلرَّضَاعَةَ"
          transliteration="Wal-walidatu yurdi'na awladahunna hawlayni kamilayni liman arada an yutimma ar-rada'ah"
          english="Mothers may breastfeed their children for two full years, for those who wish to complete the full term of breastfeeding."
          source="Quran 2:233"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">The father&apos;s duty while she nurses</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The same verse continues: &quot;It is the obligation upon the father of the child that he provides food and clothing [for the mothers] with fairness. No soul is obligated beyond what it can bear.&quot; Nursing is her gift; provision, comfort, and shielding her from hardship during it is his duty. Weaning earlier is permitted &quot;by mutual consent and consultation&quot; — a household decision, not a unilateral one.
          </p>
          <Ref text="Quran 2:233" />
        </ContentCard>
        <VerseCard
          arabic="وَأُمَّهَـٰتُكُمُ ٱلَّـٰتِىٓ أَرْضَعْنَكُمْ وَأَخَوَٰتُكُم مِّنَ ٱلرَّضَـٰعَةِ"
          transliteration="Wa ummahatukumu allati arda'nakum wa akhawatukum mina ar-rada'ah"
          english="[Prohibited for you in marriage are] ... your foster mothers, your foster sisters ..."
          source="Quran 4:23"
          delay={0.14}
        />
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Milk-kinship is real kinship</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When it was suggested the Prophet ﷺ marry the daughter of his uncle Hamzah, he said: &quot;I am not legally permitted to marry her, as foster relations are treated like blood relations — she is the daughter of my foster brother.&quot; A child nursed by a woman becomes her child in the law of marriage: her sons and daughters are the child&apos;s siblings.
          </p>
          <Ref text="Bukhari 52:9" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">The foster-uncle Aflah</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When Aisha (RA) veiled herself from her foster-uncle, the Prophet ﷺ corrected her: &quot;Don&apos;t observe veil from him, for he is Mahram on account of fosterage as one is Mahram on account of consanguinity.&quot; The milk-tie extends through the nursing mother&apos;s family — her husband&apos;s brother becomes the child&apos;s uncle.
          </p>
          <Ref text="Muslim 17:12" />
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">What establishes it — and why it matters today</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The madhhabs differ on the details: the Shafi&apos;i and Hanbali schools require five known feedings, while the Hanafi and Maliki schools hold that even less establishes the tie; the majority also restrict it to nursing within the first two years. Families using wet-nursing or sharing expressed milk should keep careful records of who nursed whom — these children may not marry each other, and a scholar should be consulted for specific cases.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function NewbornTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Islam meets the newborn with sound, sweetness, sacrifice, and a beautiful name. The first sounds reaching their ears should be the words of tawhid; the first taste, a date softened by a righteous mouth. These small Sunnahs frame a child&apos;s entire life around remembrance of Allah.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">First Acts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">Adhan in the right ear</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ called the adhan in the ear of Al-Hasan, son of Ali, when he was born. The words of tawhid are the first the child hears in the world.
          </p>
          <Ref text="Abu Dawud 43:333" />
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Tahnik — softened date</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ would chew a date and place a small piece on the newborn&apos;s palate, then make du&apos;a for them. Today families ask a righteous person to do this — placing something sweet on the gums and making du&apos;a.
          </p>
          <Ref text="Bukhari 71:1" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">A beautiful name</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;The most beloved names to Allah are Abdullah and Abdur-Rahman.&quot; Names with meaning, names of prophets, names rooted in worship — all are recommended. Avoid names with bad meaning.
          </p>
          <Ref text="Muslim 38:2" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Aqiqah on the 7th day</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            On the seventh day after birth: name the child, shave their head, give the weight of the hair in silver as charity, and offer the aqiqah sacrifice — two sheep for a boy, one for a girl, distributed to family, friends, and the poor.
          </p>
          <Ref text="Tirmidhi 43:106" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Khitan — circumcision</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Circumcision for boys is part of the five practices of fitrah (natural disposition) taught by the Prophet ﷺ. It is typically performed in early childhood; some families do it shortly after birth.
          </p>
          <Ref text="Bukhari 77:106" />
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">The Protection Du&apos;a Over Children</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لاَمَّةٍ"
          transliteration="U'idhukuma bi-kalimatillahi at-tammati min kulli shaytanin wa hammah, wa min kulli 'aynin lammah"
          english="I seek refuge for the two of you in the Perfect Words of Allah, from every devil and every poisonous pest, and from every harmful eye."
          source="Tirmidhi 28:25"
          delay={0.23}
        />
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">The Prophet&apos;s practice — and Ibrahim&apos;s</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            This is the du&apos;a the Prophet ﷺ recited over his grandsons al-Hasan and al-Husayn, saying: &quot;Your forefather (Abraham) used to seek Refuge with Allah for Ishmael and Isaac&quot; with these words. Recite it over your children — for one child say <span className="text-gold italic">u&apos;idhuka</span> (a boy) or <span className="text-gold italic">u&apos;idhuki</span> (a girl). The evil eye it guards against is real: &quot;Seek refuge with Allah, for the evil eye is real.&quot;
          </p>
          <Ref text="Bukhari 60:45; Ibn Majah 31:73" />
        </ContentCard>
      </div>
    </div>
  );
}

function BlessingsTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Children are described in the Quran as adornment and as a coolness of the eyes — gifts from Allah, not achievements of parents. Even infertility is not absence of blessing: prophets like Zakariyya waited decades, and Allah answered them with sons whose stories still teach us.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا ۖ وَالْبَاقِيَاتُ الصَّالِحَاتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا"
          transliteration="Al-malu wal-banuna zinatu al-hayati ad-dunya, wal-baqiyatu as-salihatu khayrun 'inda Rabbika thawaban wa khayrun amala"
          english="Wealth and children are the adornment of the life of this world — but enduring good deeds are better with your Lord in reward and better for [one's] hope."
          source="Quran 18:46"
          delay={0.08}
        />
        <ContentCard delay={0.095}>
          <h5 className="text-gold font-medium mb-2">Adornment, not the goal</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            This verse comes right after the parable of worldly life as vegetation that dries and scatters in the wind. Allah is honest with us: children are a gift and a beauty of this life — but they are <span className="text-gold">not the purpose</span> of it. The <span className="text-gold italic">baqiyat as-salihat</span> — enduring good deeds done for Allah — will always outweigh any worldly bond. Love your children, raise them well, and let that very upbringing become one of your enduring deeds.
          </p>
          <Ref text="Quran 18:46" />
        </ContentCard>
        <VerseCard
          arabic="رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ"
          transliteration="Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yun"
          english="Our Lord, grant us from among our spouses and our offspring a coolness of the eyes."
          source="Quran 25:74"
          delay={0.11}
        />
        <VerseCard
          arabic="يَهَبُ لِمَن يَشَاءُ إِنَاثًا وَيَهَبُ لِمَن يَشَاءُ الذُّكُورَ"
          transliteration="Yahabu liman yasha'u inathan wa yahabu liman yasha'u adh-dhukur"
          english="He bestows daughters upon whom He wills and bestows sons upon whom He wills."
          source="Quran 42:49"
          delay={0.14}
        />
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">A child&apos;s du&apos;a after you</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ said that when a person dies, only three things continue to benefit them — and one is a righteous child whose du&apos;a continues. Raising a child to be a believer is investing in your own akhirah.
          </p>
          <Ref text="Muslim 25:20" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">A test as well as a gift</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Allah also calls children &quot;a trial&quot; — meaning the love we have for them must never overtake our love for Him. Children are entrusted to us, not owned by us.
          </p>
          <Ref text="Quran 64:15" />
        </ContentCard>
        <VerseCard
          arabic="أَلْهَاكُمُ التَّكَاثُرُ ۞ حَتَّىٰ زُرْتُمُ الْمَقَابِرَ"
          transliteration="Alhakumut-takathur, hatta zurtumul-maqabir"
          english="Competition in increase distracts you, until you visit the graves."
          source="Quran 102:1-2"
          delay={0.23}
        />
        <ContentCard delay={0.245}>
          <h5 className="text-gold font-medium mb-2">Do not compete in children</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Surah At-Takathur was revealed about people boasting about their numbers — clans and tribes counting their men, even tallying their dead, to outdo one another. Allah warned that this competition is a distraction that lasts until the grave. The same warning applies today: comparing how many children we have, how successful they are, how they measure against others — all of it is the fitnah At-Takathur named. A child raised on tawhid is more valuable than ten raised on pride.
          </p>
          <Ref text="Quran 102:1-2" />
        </ContentCard>
        <VerseCard
          arabic="اعْلَمُوا أَنَّمَا الْحَيَاةُ الدُّنْيَا لَعِبٌ وَلَهْوٌ وَزِينَةٌ وَتَفَاخُرٌ بَيْنَكُمْ وَتَكَاثُرٌ فِي الْأَمْوَالِ وَالْأَوْلَادِ"
          transliteration="I'lamu annama al-hayatu ad-dunya la'ibun wa lahwun wa zinatun wa tafakhurun baynakum wa takathurun fi al-amwali wal-awlad"
          english="Know that the life of this world is but play, diversion, adornment, mutual boasting, and competition in increase of wealth and children."
          source="Quran 57:20"
          delay={0.26}
        />
        <ContentCard delay={0.275}>
          <h5 className="text-gold font-medium mb-2">Loss of a child</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ said: &quot;A Muslim whose three children die before the age of puberty will be granted Paradise by Allah due to his mercy for them.&quot; No grief in this life is wasted — the tradition speaks to bereaved parents at length.
          </p>
          <Ref text="Bukhari 23:11" />
          <Link href="/family?tab=children&sub=loss" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Losing a child — comfort and reward →
          </Link>
        </ContentCard>
      </div>
    </div>
  );
}

function LossOfChildTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-lg mb-2">For the Bereaved Parent</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Whether the loss came before birth, in infancy, or after years of love — the tradition does not pass over it in silence. The Prophet ﷺ buried children of his own. He wept, he named the grief a mercy, and he carried promises for parents like you that exist nowhere else in the religion.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="ابْنُوا لِعَبْدِي بَيْتًا فِي الْجَنَّةِ وَسَمُّوهُ بَيْتَ الْحَمْدِ"
          transliteration="Ibnu li-'abdi baytan fi al-jannati wa sammuhu bayta al-hamd"
          english="When a child of the slave (of Allah) dies, Allah says to the angels: 'Have you taken the fruits of his work?' They reply: 'Yes.' So He says: 'What did My slave say?' They reply: 'He praised You and mentioned that to You is the return.' So Allah says: 'Build a house in Paradise for My slave, and name it the House of Praise.'"
          source="Tirmidhi 10:57"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Bayt al-Hamd — the House of Praise</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The house is named not for the child, but for what the parent said in the darkest hour: <span className="text-gold italic">alhamdulillah, inna lillahi wa inna ilayhi raji&apos;un</span>. Grief and praise can live in the same heart at the same moment — that is precisely what Allah honors.
          </p>
          <Ref text="Tirmidhi 10:57" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">A shield from the Fire</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;A Muslim whose three children die before the age of puberty will be granted Paradise by Allah due to his mercy for them.&quot; And when a woman asked the Prophet ﷺ, &quot;If two died?&quot; he replied: &quot;Even two.&quot; The children you could not keep become the very screen between you and the Fire.
          </p>
          <Ref text="Bukhari 23:11; Bukhari 23:12" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">The Prophet&apos;s tears for Ibrahim</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            As his infant son Ibrahim took his last breaths, the Prophet&apos;s ﷺ eyes flowed. When asked about it, he said: &quot;This is mercy... The eyes are shedding tears and the heart is grieved, and we will not say except what pleases our Lord. O Ibrahim, indeed we are grieved by your separation.&quot; Tears are not a lapse of faith. Grief is permitted; only despair of Allah&apos;s mercy is not.
          </p>
          <Ref text="Bukhari 23:61" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Words for the hardest moment</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Those when afflicted with a disaster, say: We belong to Allah, and to Him we will return&quot; — and the verse before it promises glad tidings to the patient. Istirja&apos; is not pretending it doesn&apos;t hurt; it is placing the one you lost back in the hands of the One who lent them to you.
          </p>
          <Ref text="Quran 2:155-156" />
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Miscarriage and infant loss count</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The narrations of children shielding their parents speak of those who died &quot;before the age of puberty&quot; — the youngest losses included. Scholars extend the hope of these texts to miscarried children as well, and books of fiqh treat the miscarried child as one who will be a cause of their parents&apos; reward. No loss is too early to matter to Allah.
          </p>
          <Ref text="Bukhari 23:12" />
        </ContentCard>
      </div>
    </div>
  );
}

function ChildrenRightsTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Just as parents have rights over their children, children have rights over their parents — and the Prophet ﷺ was specific about what they are. These rights begin before birth and continue through adulthood.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">A good mother and father</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The first right is choosing a righteous spouse — a child&apos;s deen begins with the partner their parent chose. Ali (RA) said: a child has the right to a good mother, a good name, and a good upbringing.
          </p>
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">A beautiful name</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;On the Day of Resurrection you will be called by your names and your fathers&apos; names — so give yourselves good names.&quot;
          </p>
          <Ref text="Abu Dawud 43:176" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Education in the deen</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Teach them tawhid, Quran, salah, and good character before the world fills their hearts with something else. &quot;The best of you is the one who learns the Quran and teaches it.&quot;
          </p>
          <Ref text="Bukhari 66:49" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Teach them salah</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Command your children to pray when they are seven, and discipline them for it when they are ten, and separate their sleeping places.&quot;
          </p>
          <Ref text="Abu Dawud 2:104" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Equal treatment</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When a father wanted the Prophet ﷺ to witness a gift he gave one of his children, the Prophet ﷺ asked: did you give the same to all of them? When he said no, the Prophet ﷺ refused to witness and said: &quot;Be just among your children.&quot;
          </p>
          <Ref text="Bukhari 51:20" />
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Provision and protection</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A man&apos;s spending on his family — food, clothing, shelter, education — is considered sadaqah, even the morsel he places in his wife&apos;s mouth.
          </p>
          <Ref text="Bukhari 69:1" />
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Show them mercy</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A bedouin once saw the Prophet ﷺ kissing his grandchildren and said he had ten children and had never kissed one. The Prophet ﷺ replied: &quot;Whoever does not show mercy will not be shown mercy.&quot;
          </p>
          <Ref text="Bukhari 78:27" />
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Don&apos;t curse them</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The parent&apos;s du&apos;a is among the three that are never rejected. Be cautious — never invoke Allah&apos;s anger upon your child in a moment of rage. Pray for them, not against them.
          </p>
          <Ref text="Tirmidhi 27:11" />
        </ContentCard>
      </div>
    </div>
  );
}

function RaisingTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Tarbiyah — Islamic upbringing — is not a list of rules; it is the slow, patient shaping of a heart toward Allah. The Prophet ﷺ played with children, carried them on his back during prayer, kissed them in front of crowds, and corrected them gently. His method is the template.
        </p>
      </ContentCard>

      <VerseCard
        arabic="يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ قُوٓا۟ أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا وَقُودُهَا ٱلنَّاسُ وَٱلْحِجَارَةُ"
        transliteration="Ya ayyuha alladhina amanu qu anfusakum wa ahlikum naran waquduha an-nasu wal-hijarah"
        english="O you who believe, protect yourselves and your families from a Fire whose fuel is people and stones."
        source="Quran 66:6"
        delay={0.06}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">Teach tawhid first</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ to Ibn &apos;Abbas, who was a child: &quot;Be mindful of Allah and He will protect you. Be mindful of Allah and you will find Him before you. When you ask, ask Allah. When you seek help, seek it from Allah.&quot;
          </p>
          <Ref text="Tirmidhi 37:102" />
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Be the example</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Children imitate before they understand. If they see you pray, they will pray. If they see you read Quran, the book will feel familiar. If they see you patient, they will learn patience.
          </p>
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Make du&apos;a a habit</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Teach them short du&apos;as for daily moments — eating, leaving the house, sleeping. Tie remembrance of Allah to small things so it becomes second nature.
          </p>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Play with them</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ raced his wife, carried his granddaughter Umama in prayer, and let Al-Hasan and Al-Husayn ride on his back as he prostrated. Joy is part of tarbiyah, not separate from it.
          </p>
          <Ref text="Bukhari 8:163" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Speak gently, correct privately</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Public scolding wounds; private correction shapes. The Prophet ﷺ would correct gently — sometimes through a question, sometimes a story, rarely a harsh word.
          </p>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Pick their company carefully</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;A person is upon the religion of their close friend, so let one of you look at whom he befriends.&quot; A child&apos;s friends will shape them more than your lectures.
          </p>
          <Ref text="Tirmidhi 36:75" />
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Don&apos;t lie to them — even in play</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ warned a mother against luring her child with a false promise: &quot;If you do not give him something, it would be written down as a lie.&quot;
          </p>
          <Ref text="Abu Dawud 43:219" />
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Keep making du&apos;a for them</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The parent&apos;s du&apos;a for their child is answered without doubt. Through every age — toddler, teen, adult — never stop asking Allah for their guidance, faith, and protection.
          </p>
          <Ref text="Tirmidhi 27:11" />
        </ContentCard>
        <ContentCard delay={0.32}>
          <h5 className="text-gold font-medium mb-2">Their tears moved his prayer</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ said: &quot;I stand up to pray and intend to prolong it; but when I hear the cry of a boy I shorten it, for fear that his mother might be distressed.&quot; Even the salah of the Messenger bent around a crying child. A home where worship and small children coexist — noise, interruptions and all — is his Sunnah, not a compromise of it.
          </p>
          <Ref text="Abu Dawud 2:399; Nasai 10:49; Tirmidhi 2:228" />
        </ContentCard>
        <ContentCard delay={0.35}>
          <h5 className="text-gold font-medium mb-2">Shield them with the protection du&apos;a</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Make the Prophet&apos;s ﷺ nightly armor for al-Hasan and al-Husayn a habit over your own children — seeking refuge for them in Allah&apos;s Perfect Words from every devil, every poisonous pest, and every harmful eye.
          </p>
          <Ref text="Tirmidhi 28:25" />
          <Link href="/family?tab=children&sub=newborn" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            The du&apos;a in full →
          </Link>
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Discipline the Prophet&apos;s Way</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">Gentleness first — always</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Allah is Gentle and loves gentleness, and He grants reward for it that He does not grant for harshness.&quot; And: &quot;Allah is Gentle and loves gentleness in all things.&quot; Any approach to correcting a child that is built on harshness starts outside the Prophet&apos;s method, whatever result it seems to get.
          </p>
          <Ref text="Ibn Majah 33:32; Ibn Majah 33:33; Abu Dawud 43:35" />
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Years of teaching before any firmness</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The salah hadith itself is a lesson in gradualness: command at seven, and only at ten — after three full years of patient teaching, modeling, and encouragement — does firmer discipline even enter the picture. Firmness is the last tool in the box, never the first.
          </p>
          <Ref text="Abu Dawud 2:104; Abu Dawud 2:105" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">What correction is not</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Scholars who allow physical discipline at all hedge it with strict limits: never out of anger, never the face, never anything that injures, bruises, or humiliates, and never for a child too young to understand. Correction in the Prophet&apos;s method exists to teach — the moment it becomes venting a parent&apos;s rage, it is no longer discipline but transgression.
          </p>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">The common mistakes</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Correcting in public what could be corrected in private; punishing the childishness Allah created them with as if it were sin; demanding of a seven-year-old the composure of an adult; and letting your worst moment become their model of authority. Nowhere is self-restraint harder, or more closely watched, than in front of your own children — and nothing teaches them gentleness like receiving it.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function DaughtersTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Pre-Islamic Arabs buried daughters in shame; the Quran exposed their sin and Islam exalted daughters to a station Paradise itself rewards. The Prophet ﷺ promised that raising daughters well is a direct path to Jannah — and to his own company there.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">The Quran Condemns the Old Disgrace</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="وَإِذَا بُشِّرَ أَحَدُهُم بِالْأُنثَىٰ ظَلَّ وَجْهُهُ مُسْوَدًّا وَهُوَ كَظِيمٌ"
          transliteration="Wa idha bushshira ahaduhum bil-untha zalla wajhuhu muswaddan wa huwa kazim"
          english="When one of them is given the news of a daughter, his face darkens and he is filled with grief."
          source="Quran 16:58"
          delay={0.08}
        />
        <VerseCard
          arabic="وَإِذَا الْمَوْءُودَةُ سُئِلَتْ ۞ بِأَيِّ ذَنبٍ قُتِلَتْ"
          transliteration="Wa idha al-maw'udatu su'ilat, bi-ayyi dhanbin qutilat"
          english="And when the buried girl is asked: for what sin was she killed?"
          source="Quran 81:8-9"
          delay={0.11}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">The Reward for Raising Daughters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="مَنْ عَالَ ثَلاَثَ بَنَاتٍ فَأَدَّبَهُنَّ وَزَوَّجَهُنَّ وَأَحْسَنَ إِلَيْهِنَّ فَلَهُ الْجَنَّةُ"
          transliteration="Man 'ala thalatha banatin fa-addabahunna wa zawwajahunna wa ahsana ilayhinna fa-lahu al-jannah"
          english="Whoever has three daughters and is patient with them, teaches them, marries them off, and is good to them — Paradise is for him."
          source="Abu Dawud 43:375"
          delay={0.14}
        />
        <VerseCard
          arabic="مَنِ ابْتُلِيَ مِنْ هَذِهِ الْبَنَاتِ بِشَيْءٍ فَأَحْسَنَ إِلَيْهِنَّ كُنَّ لَهُ سِتْرًا مِنَ النَّارِ"
          transliteration="Man ibtuliya min hadhihi al-banati bi-shay'in fa-ahsana ilayhinna kunna lahu sitran mina an-nar"
          english="Whoever is tested with [the responsibility of] these daughters and is good to them — they will be a shield for him from the Fire."
          source="Bukhari 78:26"
          delay={0.17}
        />
        <VerseCard
          arabic="مَنْ عَالَ جَارِيَتَيْنِ حَتَّى تَبْلُغَا جَاءَ يَوْمَ الْقِيَامَةِ أَنَا وَهُوَ"
          transliteration="Man 'ala jariyatayni hatta tablugha ja'a yawma al-qiyamati ana wa huwa"
          english="Whoever raises two daughters until they reach maturity will come on the Day of Resurrection — he and I, like this — and he joined his fingers."
          source="Muslim 45:192"
          delay={0.2}
        />
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">A practical reminder</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Patient with them, teach them, marry them off, treat them well.&quot; This is the framework. Education and a sound deen are not extras — they are the substance of the right.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function OrphansTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-lg mb-2">Kafalah — Fostering the Orphan</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Can Muslims adopt? The answer is one of Islam&apos;s most distinctive: opening your home, wealth, and heart to a child who has no one is among the greatest deeds in the religion — while the child&apos;s true lineage is honored and preserved, never erased.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="أَنَا وَكَافِلُ الْيَتِيمِ، فِي الْجَنَّةِ هَكَذَا"
          transliteration="Ana wa kafilu al-yatimi fi al-jannati hakadha"
          english="I and the person who looks after an orphan and provides for him, will be in Paradise like this — and he put his index and middle fingers together."
          source="Bukhari 78:36"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">A relative&apos;s orphan — or a stranger&apos;s</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;One who looks after the orphan, whether he is his relative or not, I and he would be together in Paradise like this.&quot; The door is open both ways: the nephew who lost his father, and the child from across the world you have never met.
          </p>
          <Ref text="Muslim 55:52" />
        </ContentCard>
        <VerseCard
          arabic="ٱدْعُوهُمْ لِـَٔابَآئِهِمْ هُوَ أَقْسَطُ عِندَ ٱللَّهِ ۚ فَإِن لَّمْ تَعْلَمُوٓا۟ ءَابَآءَهُمْ فَإِخْوَٰنُكُمْ فِى ٱلدِّينِ وَمَوَٰلِيكُمْ"
          transliteration="Ud'uhum li-aba'ihim huwa aqsatu 'inda Allah, fa-in lam ta'lamu aba'ahum fa-ikhwanukum fi ad-dini wa mawalikum"
          english="Call these [adopted sons] by their fathers' names; that is more equitable before Allah. But if you do not know their fathers, then they are your brothers in faith and your patronized associates."
          source="Quran 33:5"
          delay={0.14}
        />
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Why the name is preserved</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The verse before it declares that Allah &quot;has not made your adopted sons your real sons — these are only words that you utter.&quot; Islam abolished the pre-Islamic fiction that adoption rewrites blood. The child keeps their father&apos;s name, their true lineage, and their identity — and gains, on top of it, a family that chose them for the sake of Allah.
          </p>
          <Ref text="Quran 33:4-5" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Kafalah in practice</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Because the fostered child remains legally the child of their birth parents, scholars note practical differences from Western adoption: the child does not automatically inherit from the fostering family (though a bequest of up to a third can be made for them), and mahram rules with the household are not automatic — which families historically addressed through milk-kinship when the child arrived in infancy. None of this diminishes the deed; it simply keeps every truth intact. Consult a scholar when setting up a kafalah.
          </p>
          <Link href="/family?tab=children&sub=nursing" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Milk-kinship explained →
          </Link>
        </ContentCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   KINSHIP TAB CONTENT (silat al-rahim)
   ═══════════════════════════════════════════════════════════════════ */

function KinshipWhyTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Silat al-rahim — maintaining the ties of kinship — is not a social nicety in Islam; it is a command Allah pairs with taqwa of Himself in the very first verse of Surah An-Nisa. The word for kinship, <span className="text-gold italic">rahim</span> (womb), is derived from Ar-Rahman — the ties of family carry a share of Allah&apos;s own name.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="يَـٰٓأَيُّهَا ٱلنَّاسُ ٱتَّقُوا۟ رَبَّكُمُ ٱلَّذِى خَلَقَكُم مِّن نَّفْسٍ وَٰحِدَةٍ وَخَلَقَ مِنْهَا زَوْجَهَا وَبَثَّ مِنْهُمَا رِجَالًا كَثِيرًا وَنِسَآءً ۚ وَٱتَّقُوا۟ ٱللَّهَ ٱلَّذِى تَسَآءَلُونَ بِهِۦ وَٱلْأَرْحَامَ ۚ إِنَّ ٱللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا"
          transliteration="Ya ayyuha an-nasu-ttaqu Rabbakumu alladhi khalaqakum min nafsin wahidatin wa khalaqa minha zawjaha wa baththa minhuma rijalan kathiran wa nisa'a, wattaqu Allaha alladhi tasa'aluna bihi wal-arham, inna Allaha kana 'alaykum raqiba"
          english="O people, fear your Lord Who created you from a single soul, and created from it its mate, and from both of them created countless men and women. Fear Allah in Whose name you ask one another, and be mindful of your kinship ties, for Allah is ever Watchful over you."
          source="Quran 4:1"
          delay={0.08}
        />
        <VerseCard
          arabic="وَٱلَّذِينَ يَصِلُونَ مَآ أَمَرَ ٱللَّهُ بِهِۦٓ أَن يُوصَلَ وَيَخْشَوْنَ رَبَّهُمْ وَيَخَافُونَ سُوٓءَ ٱلْحِسَابِ"
          transliteration="Walladhina yasiluna ma amara Allahu bihi an yusala wa yakhshawna Rabbahum wa yakhafuna su'a al-hisab"
          english="[And] those who maintain [the ties] which Allah has ordered to be maintained, and fear their Lord, and are afraid of a terrible reckoning"
          source="Quran 13:21"
          delay={0.11}
        />
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">The rahim clings to the Throne</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ related that when Allah finished creating, the rahim (kinship) stood and sought refuge with Him from being severed. Allah answered: &quot;Won&apos;t you be pleased that I keep good relations with the one who keeps good relations with you, and sever relations with the one who severs relations with you?&quot; It said: &quot;Yes, O my Lord.&quot; He said: &quot;Then that is for you.&quot;
          </p>
          <Ref text="Bukhari 78:18" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">A name from Ar-Rahman</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ said that the word rahim derives its name from Ar-Rahman, and that Allah said: &quot;I will keep good relations with the one who keeps good relations with you, and sever the relations with the one who severs the relations with you.&quot;
          </p>
          <Ref text="Bukhari 78:19" />
        </ContentCard>
      </div>
    </div>
  );
}

function KinshipRewardTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Few deeds come with promises this concrete: more provision and a longer, more blessed life — in exchange for keeping up with your relatives.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="مَنْ سَرَّهُ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ، وَأَنْ يُنْسَأَ لَهُ فِي أَثَرِهِ، فَلْيَصِلْ رَحِمَهُ"
          transliteration="Man sarrahu an yubsata lahu fi rizqihi, wa an yunsa'a lahu fi atharihi, falyasil rahimah"
          english="Whoever is pleased that he be granted more wealth and that his lease of life be prolonged, then he should keep good relations with his kith and kin."
          source="Bukhari 78:16"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Khadijah&apos;s first testimony</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When the first revelation shook the Prophet ﷺ, Khadijah (RA) comforted him with the deeds Allah would never disgrace him for — and the first she named was: &quot;You keep good relations with your kith and kin.&quot; Silat al-rahim was part of his character before prophethood itself.
          </p>
          <Ref text="Bukhari 1:3" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Barakah, not just length</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Scholars explain the &quot;extension of life&quot; as barakah — a life whose hours carry more good, more worship, and a legacy that outlives it — and some held it as a literal extension written in the decree. Either way, the transaction is real: keep the ties, and Allah increases you.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function KinshipSeveringTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Cutting the ties of kinship (qati&apos;at al-rahim) is counted among the major sins. The warnings attached to it are among the most severe in the religion — a barrier at the gate of Paradise, and a curse in the Quran.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="لاَ يَدْخُلُ الْجَنَّةَ قَاطِعٌ"
          transliteration="La yadkhulu al-jannata qati'"
          english="The person who severs the bond of kinship will not enter Paradise."
          source="Bukhari 78:15"
          delay={0.08}
        />
        <VerseCard
          arabic="فَهَلْ عَسَيْتُمْ إِن تَوَلَّيْتُمْ أَن تُفْسِدُوا۟ فِى ٱلْأَرْضِ وَتُقَطِّعُوٓا۟ أَرْحَامَكُمْ"
          transliteration="Fahal 'asaytum in tawallaytum an tufsidu fi al-ardi wa tuqatti'u arhamakum"
          english="Then if you turn away, what else can be expected but that you will spread corruption in the land and sever your ties of kinship?"
          source="Quran 47:22"
          delay={0.11}
        />
        <VerseCard
          arabic="أُو۟لَـٰٓئِكَ ٱلَّذِينَ لَعَنَهُمُ ٱللَّهُ فَأَصَمَّهُمْ وَأَعْمَىٰٓ أَبْصَـٰرَهُمْ"
          transliteration="Ula'ika alladhina la'anahumu Allahu fa-asammahum wa a'ma absarahum"
          english="These are the ones whom Allah has cursed and has made them deaf and blinded their sight."
          source="Quran 47:23"
          delay={0.14}
        />
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">What counts as severing</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Scholars state that severing is not only open hostility — years of silence, refusing to visit or answer, withholding help a relative needs when you can give it, and nursing grudges across generations all fall under it. The bar for &quot;maintaining&quot; is low: a visit, a call, a greeting, a du&apos;a. The bar for &quot;severing&quot; is simply abandoning even that.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

function KinshipWhoTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The rahim is everyone joined to you by lineage — with the strength of the duty following the closeness of the tie. Begin with the closest and work outward; a little done consistently outweighs grand gestures once a decade.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">Parents first</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The greatest of all kinship rights belongs to the mother — three times — then the father. Everything else in silat al-rahim sits beneath this.
          </p>
          <Ref text="Bukhari 78:2" />
          <Link href="/family?tab=parents&sub=rights" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Rights of parents →
          </Link>
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Then the nearest kin</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Grandparents, siblings, then aunts and uncles — when the Prophet ﷺ judged the custody of Hamzah&apos;s daughter to her maternal aunt, he said that &ldquo;the aunt was like the mother&rdquo; — then cousins and their children. Scholars state the duty is strongest toward those who would inherit from you and those forbidden in marriage to you (mahram relatives), then extends outward by closeness.
          </p>
          <Ref text="Bukhari 53:9; Abu Dawud 13:104" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Practical upkeep</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Visits when you can, calls and messages when you cannot; gifts — even small ones; checking on the sick and the elderly among them; sadaqah to a poor relative (which scholars describe as both charity and silat); attending their joys and their griefs; and du&apos;a for them by name.
          </p>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">In-laws are honored too</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Your spouse&apos;s parents and family are not, strictly, your rahim — but honoring them is from the kind treatment Allah commands between spouses, and it is honoring your spouse and your children&apos;s own kinship ties. Scholars encourage treating in-laws with the generosity you would show your own elders.
          </p>
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Your parents&apos; friends and relatives</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            After a parent passes, keeping ties with their friends and relatives is among the finest acts of birr — the ties they loved become yours to carry.
          </p>
          <Ref text="Muslim 45:13" />
        </ContentCard>
      </div>
    </div>
  );
}

function KinshipCutOffTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The hardest test of silat al-rahim is the relative who does not reciprocate. Islam&apos;s answer is direct: your duty was never conditional on theirs.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="لَيْسَ الْوَاصِلُ بِالْمُكَافِئِ، وَلَكِنِ الْوَاصِلُ الَّذِي إِذَا قَطَعَتْ رَحِمُهُ وَصَلَهَا"
          transliteration="Laysa al-wasilu bil-mukafi', wa lakini al-wasilu alladhi idha qata'at rahimuhu wasalaha"
          english="The one who maintains ties is not the one who reciprocates; the one who truly maintains ties is the one who, when his relatives cut him off, keeps the ties with them."
          source="Bukhari 78:22"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Allah&apos;s support stays with you</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A man complained to the Prophet ﷺ: &quot;I have relatives with whom I keep ties while they sever them; I treat them well and they treat me badly; I am forbearing and they are harsh.&quot; He ﷺ replied: &quot;If it is as you say, it is as if you are feeding them hot ashes — and there will remain with you a supporter from Allah against them so long as you continue.&quot;
          </p>
          <Ref text="Muslim 45:25" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Your reward is not in their hands</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The reward of silat al-rahim is written the moment you reach out — whether or not they answer. A message on Eid, a du&apos;a for them in sujood, a door left open: these keep you on the side of the wasil even if they never walk through it.
          </p>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Boundaries where there is harm</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Maintaining ties does not mean accepting abuse. Scholars state that where a relative causes real harm, you may keep the tie at a safe distance — the occasional greeting, du&apos;a from afar, help in genuine need — without exposing yourself or your family to injury. The obligation is to not sever; it is not an obligation to be harmed.
          </p>
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Mending a Broken Tie</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="لاَ يَحِلُّ لِرَجُلٍ أَنْ يَهْجُرَ أَخَاهُ فَوْقَ ثَلاَثِ لَيَالٍ، يَلْتَقِيَانِ فَيُعْرِضُ هَذَا وَيُعْرِضُ هَذَا، وَخَيْرُهُمَا الَّذِي يَبْدَأُ بِالسَّلاَمِ"
          transliteration="La yahillu li-rajulin an yahjura akhahu fawqa thalathi layal... wa khayruhuma alladhi yabda'u bis-salam"
          english="It is not lawful for a man to desert his brother Muslim for more than three nights — when they meet, one of them turns his face away from the other, and the other turns his face from the former — and the better of the two will be the one who greets the other first."
          source="Bukhari 78:105"
          delay={0.2}
        />
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Three nights — then the clock runs out</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Do not hate one another, nor be jealous of one another; and do not desert one another... it is unlawful for a Muslim to desert his brother Muslim for more than three nights.&quot; If this is the limit between any two Muslims, how much heavier is it between relatives, where the tie itself is a command? Three days is the mercy given to let tempers cool — not a licence to make silence permanent.
          </p>
          <Ref text="Bukhari 78:104" />
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">The first move wins</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;The better of the two is the one who greets the other first.&quot; Reconciliation in the Sunnah does not begin with resolving the grievance — it begins with salam. A greeting, a message on Eid, a du&apos;a for them by name, showing up at their moment of joy or grief. Start smaller than the argument: the salam re-opens the door, and what is behind it can be worked through slowly, or even left with Allah.
          </p>
          <Ref text="Bukhari 78:105" />
        </ContentCard>
      </div>
    </div>
  );
}

function NeighborsTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-lg mb-2">The Right Next Door</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          In the verse that commands worship of Allah and goodness to parents and kin, Allah continues in the same breath: orphans, the needy — and neighbors, near and distant. The books of adab place the neighbor&apos;s right beside kinship for a reason: it is the tie you did not choose, renewed at your doorstep every single day.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="مَا زَالَ جِبْرِيلُ يُوصِينِي بِالْجَارِ حَتَّى ظَنَنْتُ أَنَّهُ لَيُوَرِّثَنَّهُ"
          transliteration="Ma zala Jibrilu yusini bil-jari hatta zanantu annahu la-yuwarrithannahu"
          english="Gabriel impressed upon me (kind treatment) towards the neighbour (so much) that I thought as if he would confer upon him the (right) of inheritance."
          source="Muslim 45:182"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Named beside kin in the Quran</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;Worship Allah and do not associate any partners with Him. Be kind to parents, relatives, orphans, the needy, near and distant neighbors, close friends, wayfarers...&quot; — the neighbor&apos;s right descends from the same verse as the parent&apos;s and the relative&apos;s. Jibril&apos;s insistence was so relentless that the Prophet ﷺ thought neighbors would be written into inheritance itself, the ultimate marker of family.
          </p>
          <Ref text="Quran 4:36; Muslim 45:184" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">No gift is too small</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;O Muslim women! None of you should look down upon the gift sent by her female neighbor, even if it were the trotters of the sheep.&quot; The currency of neighborliness is not grandeur but constancy — a plate of food, a greeting by name, help carrying what is heavy, checking in on the elderly and the new arrival.
          </p>
          <Ref text="Bukhari 51:1" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Every neighbor — of every faith</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The verse names &quot;near and distant&quot; neighbors, and scholars read in that breadth the Muslim neighbor and the non-Muslim, the relative and the stranger, the one beside you and the one streets away — each holding a share of the right, the nearest holding the most. For many people, a Muslim neighbor&apos;s quiet decency is the only page of this religion they will ever read.
          </p>
          <Ref text="Quran 4:36" />
        </ContentCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

const subsByTab: Record<MainTab, readonly { key: string }[]> = {
  parents: parentsSubs,
  elders: eldersSubs,
  children: childrenSubs,
  kinship: kinshipSubs,
};

const defaultSubs: Record<MainTab, string> = {
  parents: "rights",
  elders: "elderly",
  children: "conceiving",
  kinship: "why",
};

// The Death and Inheritance mini-books were promoted to their own routes.
// Old /family deep links redirect there, preserving the sub-view when mappable.
const deathRedirects: Record<string, string> = {
  preparing: "?tab=preparing",
  dying: "?tab=dying",
  washing: "?tab=washing-janazah&sub=washing",
  janazah: "?tab=washing-janazah&sub=janazah",
  burial: "?tab=burial",
  grief: "?tab=grief-visiting&sub=grief",
  visiting: "?tab=grief-visiting&sub=visiting",
};

const inheritanceRedirects: Record<string, string> = {
  foundations: "?tab=foundations&sub=foundations",
  verses: "?tab=foundations&sub=verses",
  before: "?tab=foundations&sub=before",
  shares: "?tab=shares",
  heirs: "?tab=heirs",
  wasiyyah: "?tab=wasiyyah-faqs&sub=wasiyyah",
  wisdom: "?tab=wasiyyah-faqs&sub=wisdom",
};

/* Per-sub-view sources, rendered full-width BELOW the rail layout so the
   Sources card lines up with the rest of the page instead of the rail's
   right column. */

const parentsSources: Record<ParentsSub, SourceRef[]> = {
  rights: [
    { ref: "Quran 17:23-24", desc: "Worship Allah alone and treat parents with excellence" },
    { ref: "Quran 31:14-15", desc: "Be thankful to Allah and to your parents" },
    { ref: "Bukhari 78:2", desc: "Your mother, your mother, your mother, then your father" },
    { ref: "Tirmidhi 27:3", desc: "Pleasure of the Lord in the pleasure of the parent" },
    { ref: "Bukhari 78:7", desc: "'Uquq al-walidayn named beside shirk among the greatest sins" },
    { ref: "Bukhari 52:18", desc: "The warning repeated three times" },
  ],
  quran: [
    { ref: "Quran 17:23-24", desc: "The foundational verses on parents" },
    { ref: "Quran 31:14", desc: "Be grateful to Allah and to your parents" },
    { ref: "Quran 46:15", desc: "Hardship of pregnancy and birth" },
    { ref: "Quran 4:36", desc: "Worship Allah, do good to parents" },
  ],
  sunnah: [
    { ref: "Bukhari 78:1", desc: "Prayer on time, then goodness to parents" },
    { ref: "Muslim 45:11", desc: "Loss for one who does not honor aging parents" },
    { ref: "Tirmidhi 27:3", desc: "Allah's pleasure follows parents' pleasure" },
    { ref: "Tirmidhi 27:11", desc: "Three supplications always answered, including the parent's against their child" },
    { ref: "Bukhari 56:213", desc: "'Are your parents alive? Then exert yourself in their service'" },
    { ref: "Nasai 25:19", desc: "'Then strive for their sake' — the same exchange in An-Nasa'i" },
  ],
  duas: [
    { ref: "Quran 17:24", desc: "The most well-known du'a for parents" },
    { ref: "Quran 14:41", desc: "Ibrahim's du'a for his parents and the believers" },
    { ref: "Quran 46:15", desc: "Gratitude for parents and good deeds" },
    { ref: "Quran 71:28", desc: "Nuh's du'a for his parents and household" },
  ],
  after: [
    { ref: "Muslim 25:20", desc: "Three things that continue after death" },
    { ref: "Muslim 45:13", desc: "Keeping ties with parents' friends" },
    { ref: "Bukhari 55:23", desc: "Charity on behalf of the deceased" },
    { ref: "Abu Dawud 11:90", desc: "Hajj and Umrah on behalf of the aged father" },
    { ref: "Nasai 24:15", desc: "Hajj for the deceased mother — like paying off her debt" },
    { ref: "Bukhari 30:59", desc: "The guardian fasts for one who died with fasts due" },
    { ref: "Muslim 13:198", desc: "The heir fasts on behalf of the deceased" },
  ],
  "non-muslim": [
    { ref: "Quran 31:15", desc: "Do not obey in shirk — yet keep kind company in this world" },
    { ref: "Quran 60:8", desc: "Allah does not forbid kindness and justice to the peaceful" },
    { ref: "Bukhari 51:52", desc: "Asma bint Abi Bakr told to keep ties with her pagan mother" },
  ],
  stories: [
    { ref: "Bukhari 78:5", desc: "The cave — milk held all night for sleeping parents" },
    { ref: "Bukhari 46:43", desc: "Juraij, his mother's call, and her answered words" },
    { ref: "Bukhari 21:10", desc: "Juraij — the mother's call during prayer" },
    { ref: "Muslim 44:319", desc: "Umar seeks out Uways al-Qarani" },
    { ref: "Muslim 44:320", desc: "'He would have his mother with him' — ask him to pray for you" },
  ],
};

const eldersSources: Record<EldersSub, SourceRef[]> = {
  elderly: [
    { ref: "Tirmidhi 27:25", desc: "Mercy to young, respect to elders" },
    { ref: "Abu Dawud 43:71", desc: "Honoring the grey-haired Muslim" },
    { ref: "Tirmidhi 27:128", desc: "Allah appoints honor in your own old age" },
    { ref: "Bukhari 78:169", desc: "Let the elder speak first" },
  ],
  sick: [
    { ref: "Bukhari 23:4", desc: "Visiting the sick is one of five rights between Muslims" },
    { ref: "Tirmidhi 10:5", desc: "Seventy thousand angels pray for the visitor" },
    { ref: "Muslim 45:49", desc: "A garden of Paradise while visiting" },
    { ref: "Muslim 45:54", desc: "Allah is with the sick — visit them" },
    { ref: "Bukhari 75:35", desc: "The Prophetic du'a for healing" },
  ],
  bearing: [
    { ref: "Bukhari 75:2", desc: "Even a thorn's prick expiates sins" },
    { ref: "Quran 2:155-156", desc: "Glad tidings to the patient — istirja' in affliction" },
    { ref: "Quran 21:83-84", desc: "Ayyub's cry and Allah's response" },
    { ref: "Bukhari 75:35", desc: "The healing du'a — say it for yourself too" },
    { ref: "Bukhari 75:8", desc: "Sins removed as the leaves of a tree fall down" },
    { ref: "Bukhari 18:37", desc: "Pray standing; if you can't, sitting; if not, on your side" },
  ],
  caring: [
    { ref: "Muslim 45:11", desc: "Humbled is he who finds aging parents and misses Paradise" },
    { ref: "Quran 17:23-24", desc: "'If one or both of them reach old age in your care...'" },
    { ref: "Bukhari 56:213", desc: "Service to parents in the vocabulary of jihad" },
  ],
};

const childrenSources: Record<ChildrenSub, SourceRef[]> = {
  conceiving: [
    { ref: "Bukhari 80:83", desc: "Du'a before intimacy (see Marriage → Married Life)" },
    { ref: "Quran 25:74", desc: "Asking for spouses and offspring as comfort of the eyes" },
    { ref: "Quran 3:38", desc: "Zakariyya's du'a for pure offspring" },
    { ref: "Quran 14:40", desc: "Ibrahim's du'a for prayer in his offspring" },
  ],
  pregnancy: [
    { ref: "Quran 31:14", desc: "Weakness upon weakness — the mother's burden" },
    { ref: "Quran 46:15", desc: "Pregnancy and weaning is thirty months" },
    { ref: "Quran 3:35", desc: "The mother of Maryam's vow during pregnancy" },
    { ref: "Quran 3:38", desc: "Zakariyya's du'a for pure offspring" },
  ],
  nursing: [
    { ref: "Quran 2:233", desc: "Two full years — and the father's duty of provision" },
    { ref: "Quran 4:23", desc: "Foster mothers and foster sisters are mahram" },
    { ref: "Bukhari 52:9", desc: "Foster relations are treated like blood relations" },
    { ref: "Muslim 17:12", desc: "The foster-uncle Aflah — mahram through fosterage" },
  ],
  newborn: [
    { ref: "Abu Dawud 43:142", desc: "Adhan in the newborn's ear" },
    { ref: "Bukhari 71:51", desc: "Tahnik with dates and du'a" },
    { ref: "Muslim 38:2", desc: "Best names: Abdullah and Abdur-Rahman" },
    { ref: "Tirmidhi 22:21", desc: "Aqiqah, naming, shaving on the 7th day" },
    { ref: "Bukhari 77:63", desc: "Khitan as part of the fitrah" },
    { ref: "Tirmidhi 28:25", desc: "The protection du'a with its Arabic wording" },
    { ref: "Bukhari 60:45", desc: "The Prophet's refuge-seeking for al-Hasan and al-Husayn" },
    { ref: "Ibn Majah 31:73", desc: "'Seek refuge with Allah, for the evil eye is real'" },
  ],
  blessings: [
    { ref: "Quran 18:46", desc: "Children are adornment, but enduring good deeds are better" },
    { ref: "Quran 25:74", desc: "Asking Allah for children who delight the eyes" },
    { ref: "Quran 42:49", desc: "Allah gives daughters and sons to whom He wills" },
    { ref: "Quran 64:15", desc: "Children are a trial — keep love for Allah first" },
    { ref: "Quran 102:1-2", desc: "At-Takathur — the warning against competing in numbers" },
    { ref: "Quran 57:20", desc: "Worldly life is competition in wealth and children" },
    { ref: "Muslim 25:20", desc: "A righteous child's du'a reaches the parent" },
    { ref: "Bukhari 23:11", desc: "Children who die young grant their parents Paradise" },
  ],
  loss: [
    { ref: "Tirmidhi 10:57", desc: "Bayt al-Hamd — the House of Praise built in Paradise" },
    { ref: "Bukhari 23:11", desc: "Three children who die before puberty — Paradise by His mercy" },
    { ref: "Bukhari 23:12", desc: "'If two died?' — 'Even two'" },
    { ref: "Bukhari 23:61", desc: "The Prophet's tears at Ibrahim's death — grief is mercy" },
    { ref: "Quran 2:155-156", desc: "Glad tidings to the patient — inna lillahi wa inna ilayhi raji'un" },
  ],
  rights: [
    { ref: "Abu Dawud 43:147", desc: "Give children beautiful names" },
    { ref: "Abu Dawud 2:90", desc: "Command salah at seven, discipline at ten" },
    { ref: "Bukhari 51:13", desc: "Be just among your children" },
    { ref: "Bukhari 78:27", desc: "Mercy to one's children" },
    { ref: "Bukhari 66:21", desc: "The best is one who learns the Quran and teaches it" },
  ],
  raising: [
    { ref: "Quran 66:6", desc: "Protect yourselves and your families from a Fire" },
    { ref: "Tirmidhi 37:102", desc: "Be mindful of Allah — the Prophet's advice to a child" },
    { ref: "Bukhari 8:163", desc: "Carrying Umama in prayer — children and worship coexist" },
    { ref: "Tirmidhi 36:75", desc: "A person is upon the religion of their friend" },
    { ref: "Abu Dawud 43:219", desc: "Do not lie to children" },
    { ref: "Abu Dawud 2:399", desc: "Shortening the prayer at a child's cry" },
    { ref: "Ibn Majah 33:32", desc: "Allah rewards gentleness as He does not reward harshness" },
    { ref: "Abu Dawud 43:35", desc: "Allah is gentle and likes gentleness" },
    { ref: "Abu Dawud 2:104-105", desc: "Salah at seven, firmness only at ten — gradualness" },
  ],
  daughters: [
    { ref: "Quran 16:58-59", desc: "Condemnation of disliking daughters" },
    { ref: "Quran 81:8-9", desc: "The buried girl will be asked on the Day of Judgement" },
    { ref: "Bukhari 78:26", desc: "Daughters as a shield from the Fire" },
    { ref: "Muslim 45:192", desc: "Two fingers held together — companionship with the Prophet ﷺ" },
    { ref: "Abu Dawud 43:375", desc: "Raising three daughters: Paradise" },
  ],
  orphans: [
    { ref: "Bukhari 78:36", desc: "With the Prophet ﷺ in Paradise like two fingers" },
    { ref: "Muslim 55:52", desc: "Whether the orphan is a relative or not" },
    { ref: "Quran 33:4-5", desc: "Call them by their fathers' names — brothers in faith" },
  ],
};

const kinshipSources: Record<KinshipSub, SourceRef[]> = {
  why: [
    { ref: "Quran 4:1", desc: "Fear Allah and be mindful of the wombs (kinship ties)" },
    { ref: "Quran 13:21", desc: "Those who maintain what Allah ordered to be maintained" },
    { ref: "Bukhari 78:18", desc: "The rahim seeks refuge with Allah from being severed" },
    { ref: "Bukhari 78:19", desc: "Rahim derives its name from Ar-Rahman" },
  ],
  reward: [
    { ref: "Bukhari 78:16", desc: "Provision expanded and life extended for maintaining kinship" },
    { ref: "Bukhari 1:3", desc: "Khadijah: 'You keep good relations with your kith and kin'" },
  ],
  severing: [
    { ref: "Bukhari 78:15", desc: "The one who severs kinship will not enter Paradise" },
    { ref: "Quran 47:22-23", desc: "Severing kinship — corruption and Allah's curse" },
  ],
  who: [
    { ref: "Bukhari 78:2", desc: "Your mother, your mother, your mother, then your father" },
    { ref: "Bukhari 53:9; Abu Dawud 13:104", desc: "The maternal aunt is like the mother — the custody of Hamzah's daughter" },
    { ref: "Muslim 45:13", desc: "Keeping ties with the parents' friends after their death" },
  ],
  "cut-off": [
    { ref: "Bukhari 78:22", desc: "The true wasil keeps ties with those who cut him off" },
    { ref: "Muslim 45:25", desc: "Feeding them hot ashes — Allah's support for the one who persists" },
    { ref: "Bukhari 78:105", desc: "Not lawful beyond three nights — the better one greets first" },
    { ref: "Bukhari 78:104", desc: "Do not hate, envy, or desert one another" },
  ],
  neighbors: [
    { ref: "Muslim 45:182", desc: "Jibril's insistence — until inheritance seemed near" },
    { ref: "Muslim 45:184", desc: "The same from Ibn Umar's narration" },
    { ref: "Quran 4:36", desc: "Near and distant neighbors named beside parents and kin" },
    { ref: "Bukhari 51:1", desc: "Do not look down on a neighbor's gift — even sheep's trotters" },
  ],
};

/* ── Page search (Rule 2): the rail is filtered by label + per-view keywords;
   matching pills stay visible, non-matching hide, and the first match is
   auto-selected. Empty query restores everything. ── */
type SearchEntry = { tab: MainTab; sub: string; label: string; keywords: string };

const searchIndex: SearchEntry[] = [
  { tab: "children", sub: "conceiving", label: "Conceiving", keywords: "conceive trying for a child offspring dua before intimacy zakariyya pure offspring recite quran dhikr patience" },
  { tab: "children", sub: "pregnancy", label: "Pregnancy", keywords: "pregnant mother weakness upon weakness burden maryam vow thirty months reward" },
  { tab: "children", sub: "nursing", label: "Nursing & Milk-Kinship", keywords: "breastfeeding nursing rada'ah milk kinship two full years wet nurse foster mother foster sister mahram weaning father provides five feedings" },
  { tab: "children", sub: "newborn", label: "Newborn", keywords: "baby adhan right ear tahnik softened date beautiful name aqiqah seventh day khitan circumcision protection dua perfect words evil eye hasan husayn" },
  { tab: "children", sub: "blessings", label: "Blessings", keywords: "gift adornment trial test loss of a child do not compete takathur child's dua after you" },
  { tab: "children", sub: "loss", label: "Losing a Child", keywords: "miscarriage infant loss stillbirth grief bereaved house of praise bayt al-hamd three children shield fire ibrahim tears istirja comfort" },
  { tab: "children", sub: "rights", label: "Rights of Children", keywords: "good mother father beautiful name education deen teach salah equal treatment justice provision protection mercy curse" },
  { tab: "children", sub: "raising", label: "Raising Them Right", keywords: "tarbiyah teach tawhid be the example dua habit play speak gently correct privately company friends don't lie protect your family fire discipline smack gentleness crying child shorten prayer" },
  { tab: "children", sub: "daughters", label: "Virtue of Daughters", keywords: "girls shield from the fire paradise buried alive condemnation raising daughters" },
  { tab: "children", sub: "orphans", label: "Orphans & Adoption", keywords: "orphan adoption adopt kafalah foster sponsor yateem paradise fingers lineage fathers' names inheritance mahram" },
  { tab: "parents", sub: "rights", label: "Rights of Parents", keywords: "birr walidayn goodness obedience uff sigh humility mother three times over pleasing allah door of paradise uquq greatest sins warning" },
  { tab: "parents", sub: "quran", label: "In the Quran", keywords: "verses worship none but him old age noble word wing of humility weaning grateful hardship" },
  { tab: "parents", sub: "sunnah", label: "From the Sunnah", keywords: "hadith prayer on time jihad aging parents supplication answered pleasure anger exert yourself in their service" },
  { tab: "parents", sub: "duas", label: "Du'a for Parents", keywords: "dua supplication rabbi irhamhuma mercy ibrahim nuh forgiveness" },
  { tab: "parents", sub: "after", label: "After They Pass", keywords: "after death ongoing dua sadaqah charity on their behalf honor their friends maintain ties hajj umrah debts fasts vows heir" },
  { tab: "parents", sub: "non-muslim", label: "Non-Muslim Parents", keywords: "non-muslim parents convert revert new muslim kindness asma pagan mother christian shirk do not obey keep ties dawah" },
  { tab: "parents", sub: "stories", label: "Stories of Birr", keywords: "stories cave rock milk sleeping parents juraij mother's call uways qarani umar forgiveness prayer birr" },
  { tab: "elders", sub: "elderly", label: "Honoring Elderly", keywords: "old age grey hair respect honor let elders speak first practical kindness precious dua" },
  { tab: "elders", sub: "sick", label: "Visiting the Sick", keywords: "illness visit angels garden of paradise keep it short speak hope dua healing bring something" },
  { tab: "elders", sub: "bearing", label: "Bearing Illness", keywords: "when you are sick illness patience expiation sins thorn istirja ayyub job dua cure ruqyah bearing disease" },
  { tab: "elders", sub: "caring", label: "Caring for Aging Parents", keywords: "caregiving aging parents dementia repetition patience siblings share load care home nurse burnout intention service" },
  { tab: "kinship", sub: "why", label: "Why Kinship Matters", keywords: "silat rahim womb ties relatives clings to the throne name from ar-rahman fear allah" },
  { tab: "kinship", sub: "reward", label: "Reward of Maintaining Ties", keywords: "provision expanded life extended barakah khadijah first testimony" },
  { tab: "kinship", sub: "severing", label: "Severity of Cutting Ties", keywords: "cutting severing qati will not enter paradise curse corruption what counts as severing" },
  { tab: "kinship", sub: "who", label: "Who Counts as Kin", keywords: "parents first nearest kin relatives in-laws practical upkeep parents' friends" },
  { tab: "kinship", sub: "cut-off", label: "When They Cut You Off", keywords: "one-sided reconcile hot ashes allah's support reward boundaries harm three nights desert salam greet first mend broken tie" },
  { tab: "kinship", sub: "neighbors", label: "Beyond Kin: Neighbors", keywords: "neighbor neighbour jibril gabriel inheritance rights gift trotters near and distant non-muslim neighbor kindness" },
];

function FamilyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Deep-link support: ?tab= and ?sub= are the source of truth (read on mount,
  // written on every change), so in-page links and back/forward both work.
  const tabParam = searchParams.get("tab");
  const subParam = searchParams.get("sub");
  const activeMain: MainTab = mainTabs.some((t) => t.key === tabParam) ? (tabParam as MainTab) : "children";

  // Death & Inheritance moved out to /death-rites and /inheritance — forward old deep links.
  useEffect(() => {
    if (tabParam === "death") {
      router.replace(`/death-rites${(subParam && deathRedirects[subParam]) || ""}`, { scroll: false });
    } else if (tabParam === "inheritance") {
      router.replace(`/inheritance${(subParam && inheritanceRedirects[subParam]) || ""}`, { scroll: false });
    }
  }, [tabParam, subParam, router]);

  // Last-visited rail pill per tab, so switching tabs restores the selection.
  const [subMemory, setSubMemory] = useState<Record<MainTab, string>>(() => {
    const memory = { ...defaultSubs };
    if (subParam && subsByTab[activeMain].some((s) => s.key === subParam)) memory[activeMain] = subParam;
    return memory;
  });

  const activeSubOf = (tab: MainTab): string =>
    activeMain === tab && subParam && subsByTab[tab].some((s) => s.key === subParam)
      ? subParam
      : subMemory[tab];

  const syncUrl = (tab: MainTab, sub: string) =>
    router.replace(`${pathname}?tab=${tab}&sub=${sub}`, { scroll: false });

  const changeTab = (tab: MainTab) => syncUrl(tab, activeSubOf(tab));

  const changeSub = (tab: MainTab) => (sub: string) => {
    setSubMemory((m) => ({ ...m, [tab]: sub }));
    syncUrl(tab, sub);
  };

  const activeParents = activeSubOf("parents") as ParentsSub;
  const activeElders = activeSubOf("elders") as EldersSub;
  const activeChildren = activeSubOf("children") as ChildrenSub;
  const activeKinship = activeSubOf("kinship") as KinshipSub;

  // Page search over the searchIndex rail entries (Rule 2).
  const [search, setSearch] = useState("");
  const searching = search.trim().length >= 2;
  const matches = searching
    ? searchIndex.filter((e) => textMatch(search, e.label, e.keywords))
    : searchIndex;
  const hasMatches = matches.length > 0;
  const visibleTabs =
    searching && hasMatches ? mainTabs.filter((t) => matches.some((e) => e.tab === t.key)) : mainTabs;
  const subMatches = (tab: MainTab, sub: string) =>
    !searching || !hasMatches || matches.some((e) => e.tab === tab && e.sub === sub);

  // Auto-select the first matching view when the current one is filtered out.
  useEffect(() => {
    if (!searching || !hasMatches) return;
    if (matches.some((e) => e.tab === activeMain && e.sub === activeSubOf(activeMain))) return;
    const target = matches.find((e) => e.tab === activeMain) ?? matches[0];
    setSubMemory((m) => ({ ...m, [target.tab]: target.sub }));
    syncUrl(target.tab, target.sub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Family"
        titleAr="الأسرة"
        subtitle="Rights of parents, raising children, kinship ties, honoring elders — and the duas that bind family together"
      />

      <VerseHero
        arabic="وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا"
        text="Your Lord has decreed that you worship none but Him, and that you be good to your parents."
        reference="Quran 17:23"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search parents, children, kinship..." className="mb-6" />

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
            {activeMain === "parents" && (
              <>
                <SubTabLayout subs={parentsSubs.filter((s) => subMatches("parents", s.key))} activeSub={activeParents} setActiveSub={changeSub("parents")}>
                  {activeParents === "rights" && <RightsTab />}
                  {activeParents === "quran" && <QuranTab />}
                  {activeParents === "sunnah" && <SunnahTab />}
                  {activeParents === "duas" && <DuasTab />}
                  {activeParents === "after" && <AfterTab />}
                  {activeParents === "non-muslim" && <NonMuslimParentsTab />}
                  {activeParents === "stories" && <StoriesOfBirrTab />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={parentsSources[activeParents]} />
              </>
            )}
            {activeMain === "elders" && (
              <>
                <SubTabLayout subs={eldersSubs.filter((s) => subMatches("elders", s.key))} activeSub={activeElders} setActiveSub={changeSub("elders")}>
                  {activeElders === "elderly" && <ElderlyTab />}
                  {activeElders === "sick" && <SickTab />}
                  {activeElders === "bearing" && <BearingIllnessTab />}
                  {activeElders === "caring" && <CaringForParentsTab />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={eldersSources[activeElders]} />
              </>
            )}
            {activeMain === "children" && (
              <>
                <SubTabLayout subs={childrenSubs.filter((s) => subMatches("children", s.key))} activeSub={activeChildren} setActiveSub={changeSub("children")}>
                  {activeChildren === "conceiving" && <ConceivingTab />}
                  {activeChildren === "pregnancy" && <PregnancyTab />}
                  {activeChildren === "nursing" && <NursingTab />}
                  {activeChildren === "newborn" && <NewbornTab />}
                  {activeChildren === "blessings" && <BlessingsTab />}
                  {activeChildren === "loss" && <LossOfChildTab />}
                  {activeChildren === "rights" && <ChildrenRightsTab />}
                  {activeChildren === "raising" && <RaisingTab />}
                  {activeChildren === "daughters" && <DaughtersTab />}
                  {activeChildren === "orphans" && <OrphansTab />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={childrenSources[activeChildren]} />
              </>
            )}
            {activeMain === "kinship" && (
              <>
                <SubTabLayout subs={kinshipSubs.filter((s) => subMatches("kinship", s.key))} activeSub={activeKinship} setActiveSub={changeSub("kinship")}>
                  {activeKinship === "why" && <KinshipWhyTab />}
                  {activeKinship === "reward" && <KinshipRewardTab />}
                  {activeKinship === "severing" && <KinshipSeveringTab />}
                  {activeKinship === "who" && <KinshipWhoTab />}
                  {activeKinship === "cut-off" && <KinshipCutOffTab />}
                  {activeKinship === "neighbors" && <NeighborsTab />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={kinshipSources[activeKinship]} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
        <ContentCard>
          <h4 className="text-gold font-semibold text-sm mb-2 flex items-center gap-2"><Sunset size={16} /> Death & Janazah</h4>
          <p className="text-themed-muted text-sm leading-relaxed">
            Preparing for death, the dying moments, washing and shrouding, the janazah prayer, burial, grief, and visiting graves.
          </p>
          <Link href="/death-rites" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Death & Janazah →
          </Link>
        </ContentCard>
        <ContentCard>
          <h4 className="text-gold font-semibold text-sm mb-2 flex items-center gap-2"><Coins size={16} /> Inheritance</h4>
          <p className="text-themed-muted text-sm leading-relaxed">
            The shares Allah decreed in the Quran — who inherits, the fixed fractions, the wasiyyah, and the order of distribution.
          </p>
          <Link href="/inheritance" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
            Inheritance →
          </Link>
        </ContentCard>
      </div>

      <ContentCard className="mt-3">
        <h4 className="text-gold font-semibold text-sm mb-2">Marriage in Islam</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Every family begins with a nikah — finding a spouse, the wedding, the rights of husband and wife, and married life.
        </p>
        <Link href="/marriage" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Visit the Marriage page →
        </Link>
      </ContentCard>
    </div>
  );
}

export default function FamilyPage() {
  return (
    <Suspense>
      <FamilyContent />
    </Suspense>
  );
}
