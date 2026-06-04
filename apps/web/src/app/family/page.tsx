"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import TabBar from "@/components/TabBar";
import BookmarkButton from "@/components/BookmarkButton";
import HadithRefText from "@/components/HadithRefText";
import SourcesCard from "@/components/SourcesCard";
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
  Hourglass,
  Bed,
  Droplets,
  Mountain,
  CloudRain,
  Footprints,
  Landmark,
  ListChecks,
  PieChart,
  FileText,
  HelpCircle,
  Coins,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES & TABS
   ═══════════════════════════════════════════════════════════════════ */

type MainTab = "parents" | "elders" | "children" | "death" | "inheritance";
type ParentsSub = "rights" | "quran" | "sunnah" | "duas" | "after";
type EldersSub = "elderly" | "sick";
type ChildrenSub = "conceiving" | "pregnancy" | "newborn" | "blessings" | "rights" | "raising" | "daughters";
type DeathSub = "preparing" | "dying" | "washing" | "janazah" | "burial" | "grief" | "visiting";
type InheritanceSub = "foundations" | "verses" | "before" | "shares" | "heirs" | "wasiyyah" | "wisdom";

const mainTabs: { key: MainTab; label: string; icon: React.ReactNode }[] = [
  { key: "children", label: "Children", icon: <Baby size={16} /> },
  { key: "parents", label: "Parents", icon: <Users size={16} /> },
  { key: "elders", label: "Elders & Sick", icon: <HeartPulse size={16} /> },
  { key: "death", label: "Death", icon: <Sunset size={16} /> },
  { key: "inheritance", label: "Inheritance", icon: <Coins size={16} /> },
];

const parentsSubs: { key: ParentsSub; label: string; icon: React.ReactNode }[] = [
  { key: "rights", label: "Rights of Parents", icon: <Heart size={16} /> },
  { key: "quran", label: "In the Quran", icon: <BookOpen size={16} /> },
  { key: "sunnah", label: "From the Sunnah", icon: <Scroll size={16} /> },
  { key: "duas", label: "Du'a for Parents", icon: <HandHeart size={16} /> },
  { key: "after", label: "After They Pass", icon: <Flower size={16} /> },
];

const eldersSubs: { key: EldersSub; label: string; icon: React.ReactNode }[] = [
  { key: "elderly", label: "Honoring Elderly", icon: <UserCog size={16} /> },
  { key: "sick", label: "Visiting the Sick", icon: <Stethoscope size={16} /> },
];

const childrenSubs: { key: ChildrenSub; label: string; icon: React.ReactNode }[] = [
  { key: "conceiving", label: "Conceiving", icon: <Sprout size={16} /> },
  { key: "pregnancy", label: "Pregnancy", icon: <Heart size={16} /> },
  { key: "newborn", label: "Newborn", icon: <Baby size={16} /> },
  { key: "blessings", label: "Blessings", icon: <Gift size={16} /> },
  { key: "rights", label: "Rights of Children", icon: <Scale size={16} /> },
  { key: "raising", label: "Raising Them Right", icon: <GraduationCap size={16} /> },
  { key: "daughters", label: "Virtue of Daughters", icon: <Crown size={16} /> },
];

const deathSubs: { key: DeathSub; label: string; icon: React.ReactNode }[] = [
  { key: "preparing", label: "Preparing", icon: <Hourglass size={16} /> },
  { key: "dying", label: "Dying Moments", icon: <Bed size={16} /> },
  { key: "washing", label: "Washing & Shrouding", icon: <Droplets size={16} /> },
  { key: "janazah", label: "Janazah Prayer", icon: <HandHeart size={16} /> },
  { key: "burial", label: "Burial", icon: <Mountain size={16} /> },
  { key: "grief", label: "Grief & Patience", icon: <CloudRain size={16} /> },
  { key: "visiting", label: "Visiting Graves", icon: <Footprints size={16} /> },
];

const inheritanceSubs: { key: InheritanceSub; label: string; icon: React.ReactNode }[] = [
  { key: "foundations", label: "Foundations", icon: <Landmark size={16} /> },
  { key: "verses", label: "The Verses", icon: <Scroll size={16} /> },
  { key: "before", label: "Before Distribution", icon: <ListChecks size={16} /> },
  { key: "shares", label: "Quranic Shares", icon: <PieChart size={16} /> },
  { key: "heirs", label: "The Heirs", icon: <Users size={16} /> },
  { key: "wasiyyah", label: "Wasiyyah (Will)", icon: <FileText size={16} /> },
  { key: "wisdom", label: "Wisdom & FAQs", icon: <HelpCircle size={16} /> },
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
   SUB-TAB LAYOUT
   ═══════════════════════════════════════════════════════════════════ */

function SubTabLayout<T extends string>({
  subs,
  activeSub,
  setActiveSub,
  children,
}: {
  subs: { key: T; label: string; icon: React.ReactNode }[];
  activeSub: T;
  setActiveSub: (s: T) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-52 w-full shrink-0">
        {subs.map((sub) => (
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
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
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
            Be humble before them out of mercy, and pray: &quot;My Lord, have mercy on them as they raised me when I was small.&quot;
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
      </div>

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 17:23-24", desc: "Worship Allah alone and treat parents with excellence" },
        { ref: "Quran 31:14-15", desc: "Be thankful to Allah and to your parents" },
        { ref: "Bukhari 78:2", desc: "Your mother, your mother, your mother, then your father" },
        { ref: "Tirmidhi 27:3", desc: "Pleasure of the Lord in the pleasure of the parent" },
      ]} />
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
          english="Lower to them the wing of humility out of mercy and say: 'My Lord, have mercy on them as they raised me when I was small.'"
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 17:23-24", desc: "The foundational verses on parents" },
        { ref: "Quran 31:14", desc: "Be grateful to Allah and to your parents" },
        { ref: "Quran 46:15", desc: "Hardship of pregnancy and birth" },
        { ref: "Quran 4:36", desc: "Worship Allah, do good to parents" },
      ]} />
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
          source="Bukhari 78:16"
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
      </div>

      <SourcesCard className="mt-6" sources={[
        { ref: "Bukhari 78:1", desc: "Prayer on time, then goodness to parents" },
        { ref: "Muslim 45:11", desc: "Loss for one who does not honor aging parents" },
        { ref: "Tirmidhi 27:3", desc: "Allah's pleasure follows parents' pleasure" },
        { ref: "Tirmidhi 27:11", desc: "Three supplications always answered, including the parent's against their child" },
      ]} />
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
          english="My Lord, have mercy on them as they raised me when I was small."
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 17:24", desc: "The most well-known du'a for parents" },
        { ref: "Quran 14:41", desc: "Ibrahim's du'a for his parents and the believers" },
        { ref: "Quran 46:15", desc: "Gratitude for parents and good deeds" },
        { ref: "Quran 71:28", desc: "Nuh's du'a for his parents and household" },
      ]} />
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
        </ContentCard>
      </div>

      <SourcesCard className="mt-6" sources={[
        { ref: "Muslim 25:20", desc: "Three things that continue after death" },
        { ref: "Muslim 45:13", desc: "Keeping ties with parents' friends" },
        { ref: "Bukhari 55:23", desc: "Charity on behalf of the deceased" },
      ]} />
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Tirmidhi 27:25", desc: "Mercy to young, respect to elders" },
        { ref: "Abu Dawud 43:71", desc: "Honoring the grey-haired Muslim" },
        { ref: "Tirmidhi 27:128", desc: "Allah appoints honor in your own old age" },
        { ref: "Bukhari 78:169", desc: "Let the elder speak first" },
      ]} />
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Bukhari 23:4", desc: "Visiting the sick is one of five rights between Muslims" },
        { ref: "Tirmidhi 10:5", desc: "Seventy thousand angels pray for the visitor" },
        { ref: "Muslim 45:49", desc: "A garden of Paradise while visiting" },
        { ref: "Muslim 45:54", desc: "Allah is with the sick — visit them" },
        { ref: "Bukhari 75:35", desc: "The Prophetic du'a for healing" },
      ]} />
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

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">Du&apos;a Before Intimacy</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="بِسْمِ اللَّهِ اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا"
          transliteration="Bismillah, Allahumma jannibna ash-Shaytana wa jannib ash-Shaytana ma razaqtana"
          english="In the name of Allah. O Allah, keep Shaytan away from us, and keep Shaytan away from what You provide us."
          source="Bukhari 67:100"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">The promise</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ said: if a child is decreed for them, Shaytan will never be able to harm that child. A simple sentence before intimacy can shape the spiritual fate of a life not yet conceived.
          </p>
          <Ref text="Bukhari 67:100" />
        </ContentCard>
      </div>

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

      <SourcesCard className="mt-6" sources={[
        { ref: "Bukhari 67:100", desc: "Du'a before intimacy — protection of the child from Shaytan" },
        { ref: "Quran 25:74", desc: "Asking for spouses and offspring as comfort of the eyes" },
        { ref: "Quran 3:38", desc: "Zakariyya's du'a for pure offspring" },
        { ref: "Quran 14:40", desc: "Ibrahim's du'a for prayer in his offspring" },
      ]} />
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 31:14", desc: "Weakness upon weakness — the mother's burden" },
        { ref: "Quran 46:15", desc: "Pregnancy and weaning is thirty months" },
        { ref: "Quran 3:35", desc: "The mother of Maryam's vow during pregnancy" },
        { ref: "Quran 3:38", desc: "Zakariyya's du'a for pure offspring" },
      ]} />
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
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Make du&apos;a for them often</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            From the first day: ask Allah for their faith, their health, their guidance, their protection from Shaytan and the evil eye. Recite Surah al-Falaq and an-Nas over them.
          </p>
        </ContentCard>
      </div>

      <SourcesCard className="mt-6" sources={[
        { ref: "Abu Dawud 43:142", desc: "Adhan in the newborn's ear" },
        { ref: "Bukhari 71:51", desc: "Tahnik with dates and du'a" },
        { ref: "Muslim 38:2", desc: "Best names: Abdullah and Abdur-Rahman" },
        { ref: "Tirmidhi 22:21", desc: "Aqiqah, naming, shaving on the 7th day" },
        { ref: "Bukhari 77:63", desc: "Khitan as part of the fitrah" },
      ]} />
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
            The Prophet ﷺ said that a child who dies before their parents will come on the Day of Judgement and refuse to enter Paradise without their parents — pulling them in by Allah&apos;s mercy. No grief in this life is wasted.
          </p>
          <Ref text="Bukhari 23:11" />
        </ContentCard>
      </div>

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 18:46", desc: "Children are adornment, but enduring good deeds are better" },
        { ref: "Quran 25:74", desc: "Asking Allah for children who delight the eyes" },
        { ref: "Quran 42:49", desc: "Allah gives daughters and sons to whom He wills" },
        { ref: "Quran 64:15", desc: "Children are a trial — keep love for Allah first" },
        { ref: "Quran 102:1-2", desc: "At-Takathur — the warning against competing in numbers" },
        { ref: "Quran 57:20", desc: "Worldly life is competition in wealth and children" },
        { ref: "Muslim 25:20", desc: "A righteous child's du'a reaches the parent" },
      ]} />
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Abu Dawud 43:147", desc: "Give children beautiful names" },
        { ref: "Abu Dawud 2:90", desc: "Command salah at seven, discipline at ten" },
        { ref: "Bukhari 51:13", desc: "Be just among your children" },
        { ref: "Bukhari 78:27", desc: "Mercy to one's children" },
        { ref: "Bukhari 66:21", desc: "The best is one who learns the Quran and teaches it" },
      ]} />
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
      </div>

      <SourcesCard className="mt-6" sources={[
        { ref: "Tirmidhi 37:102", desc: "Be mindful of Allah — the Prophet's advice to a child" },
        { ref: "Bukhari 8:163", desc: "Carrying Umama in prayer — children and worship coexist" },
        { ref: "Tirmidhi 36:75", desc: "A person is upon the religion of their friend" },
        { ref: "Abu Dawud 43:219", desc: "Do not lie to children" },
      ]} />
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 16:58-59", desc: "Condemnation of disliking daughters" },
        { ref: "Quran 81:8-9", desc: "The buried girl will be asked on the Day of Judgement" },
        { ref: "Bukhari 78:26", desc: "Daughters as a shield from the Fire" },
        { ref: "Muslim 45:192", desc: "Two fingers held together — companionship with the Prophet ﷺ" },
        { ref: "Abu Dawud 43:375", desc: "Raising three daughters: Paradise" },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DEATH TAB CONTENT
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Bukhari 23:15", desc: "Wash an odd number of times with sidr and camphor" },
        { ref: "Bukhari 23:18", desc: "Method of washing — begin from the right" },
        { ref: "Bukhari 23:32", desc: "Three white sheets, no shirt, no turban" },
        { ref: "Abu Dawud 21:69", desc: "Five pieces of cloth for shrouding Umm Kulthum" },
        { ref: "Bukhari 23:73", desc: "Hasten the funeral" },
      ]} />
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Bukhari 23:80", desc: "Two qirats — like two great mountains — for attending burial" },
        { ref: "Bukhari 23:90", desc: "Reciting Al-Fatihah in the janazah" },
        { ref: "Muslim 11:109", desc: "The Prophet's du'a in janazah" },
        { ref: "Abu Dawud 21:113", desc: "The comprehensive janazah du'a" },
      ]} />
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 2:156", desc: "Inna lillahi wa inna ilayhi raji'un" },
        { ref: "Quran 2:234", desc: "Widow's iddah of 4 months and 10 days" },
        { ref: "Quran 65:4", desc: "Pregnant widow's iddah ends at birth" },
        { ref: "Bukhari 23:43", desc: "Patience is at the first shock" },
        { ref: "Bukhari 23:52", desc: "Forbidden: slapping cheeks and tearing garments" },
        { ref: "Bukhari 23:61", desc: "The Prophet ﷺ weeping for his son" },
        { ref: "Muslim 11:4", desc: "Du'a at the moment of musibah" },
      ]} />
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

      <SourcesCard className="mt-6" sources={[
        { ref: "Muslim 11:136", desc: "Visit graves — they remind you of the Hereafter" },
        { ref: "Muslim 11:131", desc: "The salam to give upon entering a graveyard" },
        { ref: "Muslim 11:124", desc: "Prohibition of sitting on graves" },
        { ref: "Muslim 11:127", desc: "Prohibition of praying facing graves" },
        { ref: "Muslim 25:20", desc: "Du'a of the living benefits the deceased" },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INHERITANCE TAB CONTENT
   ═══════════════════════════════════════════════════════════════════ */

function FoundationsInheritanceTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Inheritance (<span className="text-gold italic">mirath</span> / <span className="text-gold italic">fara&apos;id</span>) is one of the few areas of Islamic law that Allah Himself laid out in precise detail in the Quran. There is no human committee deciding shares — Allah set them. To follow these laws is to honor His command; to overlook them is among the most serious of transgressions.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="لِلرِّجَالِ نَصِيبٌ مِّمَّا تَرَكَ الْوَالِدَانِ وَالْأَقْرَبُونَ وَلِلنِّسَاءِ نَصِيبٌ مِّمَّا تَرَكَ الْوَالِدَانِ وَالْأَقْرَبُونَ ۚ مِمَّا قَلَّ مِنْهُ أَوْ كَثُرَ ۚ نَصِيبًا مَّفْرُوضًا"
          transliteration="Lir-rijali nasibun mimma taraka al-walidani wal-aqrabun, wa lin-nisa'i nasibun mimma taraka al-walidani wal-aqrabun, mimma qalla minhu aw kathur, nasiban mafruda"
          english="Men have a share of what their parents and close relatives leave, and women have a share of what their parents and close relatives leave — whether little or much, an ordained share."
          source="Quran 4:7"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Both sons and daughters inherit</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Pre-Islamic Arabia gave inheritance only to those who could carry a sword. The Quran shattered that. Allah declared women and children inheritors — and made it <span className="text-gold italic">nasiban mafruda</span>: an ordained share, not a custom or favor.
          </p>
          <Ref text="Quran 4:7" />
        </ContentCard>
        <VerseCard
          arabic="تِلْكَ حُدُودُ اللَّهِ ۚ وَمَن يُطِعِ اللَّهَ وَرَسُولَهُ يُدْخِلْهُ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ"
          transliteration="Tilka hududu Allah, wa man yuti'i Allaha wa rasulahu yudkhilhu jannatin tajri min tahtiha al-anhar"
          english="These are the limits of Allah. Whoever obeys Allah and His Messenger — He will admit him to Gardens beneath which rivers flow."
          source="Quran 4:13"
          delay={0.14}
        />
        <VerseCard
          arabic="وَمَن يَعْصِ اللَّهَ وَرَسُولَهُ وَيَتَعَدَّ حُدُودَهُ يُدْخِلْهُ نَارًا خَالِدًا فِيهَا وَلَهُ عَذَابٌ مُّهِينٌ"
          transliteration="Wa man ya'si Allaha wa rasulahu wa yata'adda hududahu yudkhilhu naran khalidan fiha, wa lahu 'adhabun muhin"
          english="And whoever disobeys Allah and His Messenger and transgresses His limits — He will admit him into a Fire to abide eternally therein, and he will have a humiliating punishment."
          source="Quran 4:14"
          delay={0.17}
        />
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">The severity of the warning</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            These two verses come <span className="text-gold">immediately after</span> the inheritance verses. Allah lists the shares in 4:11-12, then says: these are My limits — obey them and enter Paradise, transgress them and enter the Fire. Few areas of fiqh carry this exact tone. Inheritance is heavy because injustice over wealth tears families apart and silences the rights of the weak (daughters, widows).
          </p>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Wealth belongs to Allah</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The estate is not &quot;ours&quot; to distribute as we please. We are temporary stewards. Allah lays out the shares of His wealth among His servants — our job is to faithfully transmit it according to His instruction.
          </p>
        </ContentCard>
      </div>

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 4:7", desc: "Men and women each have an ordained share" },
        { ref: "Quran 4:11-12", desc: "The detailed shares of children, parents, and spouses" },
        { ref: "Quran 4:13", desc: "These are Allah's limits — obey and enter Paradise" },
        { ref: "Quran 4:14", desc: "Transgress His limits — enter the Fire" },
      ]} />
    </div>
  );
}

function VersesInheritanceTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Three verses in Surah An-Nisa form the entire foundation of Islamic inheritance: <span className="text-gold">4:11, 4:12, and 4:176</span>. Read them slowly — every share mentioned here is Allah&apos;s personal decree.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">Quran 4:11 — Children and Parents</h3>
      <div className="grid grid-cols-1 gap-3">
        <VerseCard
          arabic="يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ ۚ فَإِن كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ ۖ وَإِن كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ ۚ وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِن كَانَ لَهُ وَلَدٌ ۚ فَإِن لَّمْ يَكُن لَّهُ وَلَدٌ وَوَرِثَهُ أَبَوَاهُ فَلِأُمِّهِ الثُّلُثُ ۚ فَإِن كَانَ لَهُ إِخْوَةٌ فَلِأُمِّهِ السُّدُسُ ۚ مِن بَعْدِ وَصِيَّةٍ يُوصِي بِهَا أَوْ دَيْنٍ"
          transliteration="Yusikumullahu fi awladikum, lidh-dhakari mithlu hazzi al-unthayayn. Fa-in kunna nisa'an fawqa-thnatayni falahunna thuluthamatarak, wa in kanat wahidatan falaha an-nisf. Wa li-abawayhi likulli wahidin minhuma as-sudusu mimma taraka in kana lahu walad. Fa-in lam yakun lahu waladun wa warithahu abawahu fa-li-ummihi ath-thuluth, fa-in kana lahu ikhwatun fa-li-ummihi as-sudus, min ba'di wasiyyatin yusi biha aw dayn"
          english="Allah commands you concerning your children: for the male a share equal to that of two females. If there are only daughters, two or more, theirs is two-thirds of the estate. If only one daughter, hers is half. For the parents, each of them gets one-sixth of the estate if the deceased left children. If there are no children and the parents are the heirs, the mother gets one-third. If the deceased had siblings, the mother gets one-sixth — after any bequest and any debt."
          source="Quran 4:11"
          delay={0.08}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Quran 4:12 — Spouses and Kalalah</h3>
      <div className="grid grid-cols-1 gap-3">
        <VerseCard
          arabic="وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ ۚ فَإِن كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ ۚ مِن بَعْدِ وَصِيَّةٍ يُوصِينَ بِهَا أَوْ دَيْنٍ ۚ وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ إِن لَّمْ يَكُن لَّكُمْ وَلَدٌ ۚ فَإِن كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ مِمَّا تَرَكْتُم"
          transliteration="Wa lakum nisfu ma taraka azwajukum in lam yakun lahunna walad, fa-in kana lahunna waladun falakumu ar-rubu'u mimma tarakna, min ba'di wasiyyatin yusina biha aw dayn. Wa lahunna ar-rubu'u mimma taraktum in lam yakun lakum walad, fa-in kana lakum waladun falahunna ath-thumunu mimma taraktum"
          english="For you (husbands), half of what your wives leave if they have no children. If they have children, you get one-quarter — after any bequest and any debt. For them (wives), one-quarter of what you leave if you have no children. If you have children, they get one-eighth of what you leave."
          source="Quran 4:12"
          delay={0.05}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Quran 4:176 — Kalalah (siblings, no children/parents)</h3>
      <div className="grid grid-cols-1 gap-3">
        <VerseCard
          arabic="يَسْتَفْتُونَكَ قُلِ اللَّهُ يُفْتِيكُمْ فِي الْكَلَالَةِ ۚ إِنِ امْرُؤٌ هَلَكَ لَيْسَ لَهُ وَلَدٌ وَلَهُ أُخْتٌ فَلَهَا نِصْفُ مَا تَرَكَ ۚ وَهُوَ يَرِثُهَا إِن لَّمْ يَكُن لَّهَا وَلَدٌ ۚ فَإِن كَانَتَا اثْنَتَيْنِ فَلَهُمَا الثُّلُثَانِ مِمَّا تَرَكَ ۚ وَإِن كَانُوا إِخْوَةً رِّجَالًا وَنِسَاءً فَلِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ"
          transliteration="Yastaftunaka qul-illahu yuftikum fi al-kalalah. Ini-mru'un halaka laysa lahu waladun wa lahu ukhtun falaha nisfu ma tarak, wa huwa yarithuha in lam yakun laha walad. Fa-in kanata-thnatayni falahuma ath-thuluthani mimma tarak, wa in kanu ikhwatan rijalan wa nisa'an falidh-dhakari mithlu hazzi al-unthayayn"
          english="They ask you for a ruling. Say: Allah gives you a ruling concerning kalalah (one who dies with no children or parents). If a man dies childless and has a sister, she gets half of what he left. He inherits from her if she has no children. If there are two sisters, they get two-thirds. If they are brothers and sisters together, the male gets twice the female's share."
          source="Quran 4:176"
          delay={0.05}
        />
      </div>

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 4:11", desc: "Shares of children and parents" },
        { ref: "Quran 4:12", desc: "Shares of spouses; kalalah (no descendants/ascendants)" },
        { ref: "Quran 4:176", desc: "Full sisters and siblings when no children or parents exist" },
      ]} />
    </div>
  );
}

function BeforeDistributionTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Before the estate is divided among heirs, <span className="text-gold">four things must happen in order</span>. This sequence is fixed — skipping a step or reordering them is a violation of the Sharia. Allah states it Himself in 4:11 and 4:12: <span className="italic">&quot;...after any bequest and any debt.&quot;</span>
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">1. Funeral expenses (Takfin)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            First, the deceased&apos;s body must be washed, shrouded, and buried. The cost — kafan, transportation, grave digging — is paid from the estate before anything else. This is a right of the deceased&apos;s body before any heir takes a share.
          </p>
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">2. Debts (Duyun)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Debts owed to people <span className="text-gold">must be paid in full</span> before any inheritance distribution — even if it consumes the entire estate. The Prophet ﷺ refused to pray janazah over someone with unpaid debt until it was settled. The soul of a believer remains attached to debt until cleared.
          </p>
          <Ref text="Tirmidhi 10:114" />
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">3. Wasiyyah (Bequest)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Any will (wasiyyah) the deceased left, <span className="text-gold">up to one-third of the estate</span>, is executed next. This can go to non-heirs (charities, poor relatives who don&apos;t inherit, friends). It cannot exceed one-third, and cannot include existing heirs.
          </p>
          <Ref text="Bukhari 55:5" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">4. Distribution among heirs</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Only after the first three are completed does the remaining estate get distributed among the Quranic heirs according to the fixed shares. The shares are calculated on what <span className="text-gold">remains</span>, not on the original estate.
          </p>
        </ContentCard>
      </div>

      <ContentCard delay={0.2} className="mt-4">
        <h5 className="text-gold font-medium mb-2">Important: Allah specified the order Himself</h5>
        <p className="text-themed-muted text-sm leading-relaxed">
          Notice the phrase Allah repeats in both 4:11 and 4:12: <span className="font-arabic text-gold">مِنْ بَعْدِ وَصِيَّةٍ يُوصِي بِهَا أَوْ دَيْنٍ</span> — &quot;after any bequest and any debt.&quot; Scholars note that although Allah mentions wasiyyah first in the verse, hadith clarifies that debts are paid before bequest (and bequest is executed after debt but before distribution). Ali (RA) explained this practice. Order:
        </p>
        <ol className="text-themed-muted text-sm leading-relaxed list-decimal pl-5 mt-2 space-y-1">
          <li>Funeral expenses</li>
          <li>Debts to people</li>
          <li>Wasiyyah (≤ 1/3)</li>
          <li>Inheritance distribution</li>
        </ol>
      </ContentCard>

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 4:11", desc: "After any bequest and any debt — children/parents" },
        { ref: "Quran 4:12", desc: "After any bequest and any debt — spouses/kalalah" },
        { ref: "Bukhari 55:5", desc: "Wasiyyah limited to one-third — Sa'd ibn Abi Waqqas" },
        { ref: "Tirmidhi 10:114", desc: "Soul of believer attached to debt until paid" },
      ]} />
    </div>
  );
}

function HeirShareCard({
  heir,
  shares,
  excludedBy,
  delay = 0,
}: {
  heir: string;
  shares: { fraction: string; when: string }[];
  excludedBy?: string;
  delay?: number;
}) {
  return (
    <ContentCard delay={delay}>
      <h5 className="text-gold font-semibold text-lg mb-3">{heir}</h5>
      <div className="space-y-2.5">
        {shares.map((s, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span className="font-mono text-gold text-sm shrink-0 inline-flex items-center justify-center min-w-[3rem] h-7 px-2.5 bg-gold/10 rounded border border-gold/30 whitespace-nowrap leading-none">
              {s.fraction}
            </span>
            <span className="text-themed-muted leading-relaxed pt-0.5">{s.when}</span>
          </div>
        ))}
      </div>
      {excludedBy && (
        <p className="text-xs text-themed-muted mt-3 pt-3 border-t sidebar-border">
          <span className="text-gold/80 font-medium">Excluded by:</span> {excludedBy}
        </p>
      )}
    </ContentCard>
  );
}

function SharesTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed mb-2">
          Allah specified <span className="text-gold">six fixed fractional shares</span> in the Quran: <span className="font-mono text-gold">1/2, 1/4, 1/8, 2/3, 1/3, 1/6</span>. But which fraction an heir receives depends entirely on <span className="text-gold">who else is alive</span>. Below, each heir is shown with all the shares they may receive and the exact conditions for each.
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          <span className="text-gold">Reading guide:</span> &quot;descendants&quot; = children or grandchildren through a son. &quot;Kalalah&quot; = deceased left no children and no father. Heirs labeled <span className="text-gold italic">asaba</span> have no fixed share — they take whatever remains after the fixed shares are distributed.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">Spouses</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HeirShareCard
          heir="Husband"
          shares={[
            { fraction: "1/2", when: "Wife left no descendants (no children or grandchildren through a son)" },
            { fraction: "1/4", when: "Wife left descendants" },
          ]}
          delay={0.08}
        />
        <HeirShareCard
          heir="Wife (or wives, sharing equally)"
          shares={[
            { fraction: "1/4", when: "Husband left no descendants" },
            { fraction: "1/8", when: "Husband left descendants" },
          ]}
          delay={0.11}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Children</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HeirShareCard
          heir="Son"
          shares={[
            { fraction: "asaba", when: "Takes what remains after fixed shares — no fixed fraction. If multiple sons, they share equally. With a daughter present, son:daughter = 2:1." },
          ]}
          delay={0.05}
        />
        <HeirShareCard
          heir="Daughter"
          shares={[
            { fraction: "1/2", when: "Only one daughter and no son" },
            { fraction: "2/3", when: "Two or more daughters share equally, and no son present" },
            { fraction: "asaba", when: "Son is present — she becomes asaba with him at 2:1 (son gets 2 shares, daughter gets 1)" },
          ]}
          delay={0.08}
        />
        <HeirShareCard
          heir="Son's Son (grandson through son)"
          shares={[
            { fraction: "asaba", when: "Inherits like a son when no son is alive — same rules, same 2:1 ratio with sister granddaughters" },
          ]}
          excludedBy="Any living son of the deceased"
          delay={0.11}
        />
        <HeirShareCard
          heir="Son's Daughter (granddaughter through son)"
          shares={[
            { fraction: "1/2", when: "Only one and no daughters or sons of deceased" },
            { fraction: "2/3", when: "Two or more, sharing, no daughters or sons present" },
            { fraction: "1/6", when: "Completing the 2/3 when one daughter of deceased is alive (daughter takes 1/2, granddaughter(s) take 1/6)" },
            { fraction: "asaba", when: "With a son's son — becomes asaba at 2:1" },
          ]}
          excludedBy="Son of deceased, or two-or-more daughters (because 2/3 is taken)"
          delay={0.14}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Parents</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HeirShareCard
          heir="Father"
          shares={[
            { fraction: "1/6", when: "Deceased has a son or son's son (male descendant)" },
            { fraction: "1/6", when: "Only daughter(s) present — father takes 1/6 fixed plus any remainder after fixed shares" },
            { fraction: "asaba", when: "No descendants — father takes the remainder after fixed shares (or the entire estate if alone)" },
          ]}
          delay={0.05}
        />
        <HeirShareCard
          heir="Mother"
          shares={[
            { fraction: "1/6", when: "Deceased left descendants, OR two-or-more siblings (any kind) are alive" },
            { fraction: "1/3", when: "No descendants and fewer than two siblings — taken from the full estate" },
            { fraction: "1/3", when: "Special case (Umariyyatan): heirs are spouse + father + mother only. Mother gets 1/3 of what remains after the spouse's share, not 1/3 of the full estate. Umar's ruling, accepted by the majority." },
          ]}
          delay={0.08}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Grandparents</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HeirShareCard
          heir="Paternal Grandfather"
          shares={[
            { fraction: "1/6", when: "Deceased left descendants" },
            { fraction: "asaba", when: "No father alive — takes the father's role, including remainder after fixed shares" },
          ]}
          excludedBy="The father of the deceased"
          delay={0.05}
        />
        <HeirShareCard
          heir="Grandmother (Paternal or Maternal)"
          shares={[
            { fraction: "1/6", when: "Qualifies as heir — if multiple grandmothers (both lines), they share the 1/6 equally" },
          ]}
          excludedBy="Mother of the deceased (excludes both maternal and paternal grandmothers); father excludes only paternal grandmother"
          delay={0.08}
        />
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Siblings (in Kalalah only)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HeirShareCard
          heir="Full Brother"
          shares={[
            { fraction: "asaba", when: "In kalalah (no children, no father) — takes residuary like a son would. Multiple brothers share equally; with sister, 2:1." },
          ]}
          excludedBy="Son, son's son, father"
          delay={0.05}
        />
        <HeirShareCard
          heir="Full Sister"
          shares={[
            { fraction: "1/2", when: "Only one full sister in kalalah, no full brother" },
            { fraction: "2/3", when: "Two or more full sisters share, no full brother" },
            { fraction: "asaba", when: "With full brother (2:1)" },
            { fraction: "asaba", when: "With daughter(s) of deceased — she becomes asaba ma'a al-ghayr" },
          ]}
          excludedBy="Son, son's son, father"
          delay={0.08}
        />
        <HeirShareCard
          heir="Paternal Brother"
          shares={[
            { fraction: "asaba", when: "In kalalah with no full brother — takes residuary like a full brother would" },
          ]}
          excludedBy="Son, son's son, father, full brother"
          delay={0.11}
        />
        <HeirShareCard
          heir="Paternal Sister"
          shares={[
            { fraction: "1/2", when: "Only one paternal sister, no full siblings" },
            { fraction: "2/3", when: "Two or more paternal sisters, no full siblings" },
            { fraction: "1/6", when: "Completing the 2/3 alongside one full sister (full sister 1/2 + paternal sister 1/6)" },
            { fraction: "asaba", when: "With paternal brother (2:1)" },
          ]}
          excludedBy="Son, son's son, father, full brother, or two-or-more full sisters"
          delay={0.14}
        />
        <HeirShareCard
          heir="Maternal Sibling (Brother or Sister — equal)"
          shares={[
            { fraction: "1/6", when: "One alone (any gender)" },
            { fraction: "1/3", when: "Two or more, share equally regardless of gender" },
          ]}
          excludedBy="Father, paternal grandfather, son, son's son, daughter, son's daughter"
          delay={0.17}
        />
      </div>

      <ContentCard delay={0.05} className="mt-6">
        <h5 className="text-gold font-medium mb-2">The principle of Asaba (residuary heirs)</h5>
        <p className="text-themed-muted text-sm leading-relaxed mb-2">
          After all fixed-share heirs are paid, anything that remains goes to the <span className="text-gold italic">asaba</span> — typically the closest male in the paternal line: son → son&apos;s son → father → grandfather → full brother → paternal brother → paternal uncle. Only one tier inherits at a time (the closer relative blocks the more distant).
        </p>
        <p className="font-arabic text-gold text-lg leading-loose mb-1">أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ</p>
        <p className="text-themed text-sm leading-relaxed mb-1">Alhiqu al-fara&apos;ida bi-ahliha, fama baqiya fahuwa li-awla rajulin dhakar</p>
        <p className="text-themed-muted text-sm leading-relaxed italic">&ldquo;Give the fixed shares to those entitled. What remains goes to the nearest male relative.&rdquo;</p>
        <Ref text="Bukhari 85:9" />
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-8 mb-3 px-1">Worked Examples</h3>

      <ContentCard delay={0.05}>
        <h5 className="text-gold font-medium mb-2">Example 1 — A man dies leaving: wife, 1 son, 2 daughters</h5>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          (After funeral, debts, and any wasiyyah are paid, the remaining estate is the &quot;net estate.&quot;)
        </p>
        <ol className="text-themed-muted text-sm leading-relaxed list-decimal pl-5 space-y-1">
          <li><span className="text-gold">Wife:</span> husband has descendants → wife gets <span className="font-mono text-gold">1/8</span></li>
          <li><span className="text-gold">Remaining</span> = ⅞ goes to children as asaba, son:daughter = 2:1</li>
          <li>Total shares among children: 2 (son) + 1 + 1 (two daughters) = <span className="font-mono">4</span> parts</li>
          <li>So son gets <span className="font-mono text-gold">2/4 × ⅞ = ⁷⁄₁₆</span>, each daughter gets <span className="font-mono text-gold">1/4 × ⅞ = ⁷⁄₃₂</span></li>
        </ol>
        <p className="text-themed-muted text-sm leading-relaxed mt-3">
          On a $160,000 net estate: Wife = $20,000. Son = $70,000. Each daughter = $35,000.
        </p>
      </ContentCard>

      <ContentCard delay={0.05}>
        <h5 className="text-gold font-medium mb-2">Example 2 — A woman dies leaving: husband, mother, father, 1 daughter</h5>
        <ol className="text-themed-muted text-sm leading-relaxed list-decimal pl-5 space-y-1">
          <li><span className="text-gold">Husband:</span> wife left descendant → <span className="font-mono text-gold">1/4</span></li>
          <li><span className="text-gold">Mother:</span> deceased left descendant → <span className="font-mono text-gold">1/6</span></li>
          <li><span className="text-gold">Father:</span> deceased left only daughter (no son) → 1/6 fixed + asaba on the remainder</li>
          <li><span className="text-gold">Daughter:</span> only one, no son → <span className="font-mono text-gold">1/2</span></li>
          <li>Fixed shares so far: 1/4 + 1/6 + 1/6 + 1/2 = <span className="font-mono">13/12</span> — exceeds 1. This is &quot;awl&quot; (proportional reduction). Multiply each share by <span className="font-mono">12/13</span>.</li>
        </ol>
        <p className="text-themed-muted text-sm leading-relaxed mt-3">
          On a $130,000 net estate (chosen for clean math): Husband = $30,000. Mother = $20,000. Father = $20,000. Daughter = $60,000.
        </p>
      </ContentCard>

      <ContentCard delay={0.05}>
        <h5 className="text-gold font-medium mb-2">Example 3 — A man dies leaving: 2 daughters, mother, full brother</h5>
        <ol className="text-themed-muted text-sm leading-relaxed list-decimal pl-5 space-y-1">
          <li><span className="text-gold">Two daughters:</span> share <span className="font-mono text-gold">2/3</span></li>
          <li><span className="text-gold">Mother:</span> deceased has descendants → <span className="font-mono text-gold">1/6</span></li>
          <li><span className="text-gold">Full brother:</span> takes residuary (asaba) → remaining <span className="font-mono text-gold">1/6</span></li>
        </ol>
        <p className="text-themed-muted text-sm leading-relaxed mt-3">
          On a $60,000 net estate: Each daughter = $20,000. Mother = $10,000. Brother = $10,000.
        </p>
      </ContentCard>

      <ContentCard delay={0.05} className="mt-4 border-gold/40">
        <h5 className="text-gold font-medium mb-2">When in doubt, consult a specialist</h5>
        <p className="text-themed-muted text-sm leading-relaxed">
          The shares are simple in theory but the interactions can be intricate — <span className="text-gold italic">awl</span> (when shares exceed 1, all are reduced proportionally), <span className="text-gold italic">radd</span> (when shares total less than 1 and there are no asaba, fixed-share heirs receive the surplus proportionally), and special cases like the <span className="text-gold italic">gharrawayn</span> (the two glittering ones) all require care. For any actual death, consult a Muslim scholar trained in <span className="text-gold italic">fara&apos;id</span> or an Islamic estate planner.
        </p>
      </ContentCard>

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 4:11", desc: "Shares of children and parents" },
        { ref: "Quran 4:12", desc: "Shares of spouses and kalalah" },
        { ref: "Quran 4:176", desc: "Full and paternal sisters' shares" },
        { ref: "Bukhari 85:9", desc: "Give fixed shares first, remainder to nearest male relative" },
      ]} />
    </div>
  );
}

function HeirsTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Not everyone in a family inherits. Allah and His Messenger ﷺ specified exactly who qualifies. There are three categories of heirs — and several people who are <span className="text-gold">excluded</span> entirely.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">Categories of Heirs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">1. Ashab al-Furud — Fixed-share heirs</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Twelve relatives who receive a specific Quranic share:
          </p>
          <ul className="text-themed-muted text-sm leading-relaxed list-disc pl-5 mt-2 space-y-1">
            <li>Husband, wife</li>
            <li>Father, mother</li>
            <li>Daughter, son&apos;s daughter</li>
            <li>Full sister, paternal sister, maternal sibling (brother or sister)</li>
            <li>Paternal grandfather, maternal/paternal grandmother</li>
          </ul>
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">2. Asaba — Residuary heirs</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Receive whatever remains after the fixed shares. Primarily male relatives through paternal line:
          </p>
          <ul className="text-themed-muted text-sm leading-relaxed list-disc pl-5 mt-2 space-y-1">
            <li>Son, son&apos;s son (down)</li>
            <li>Father, grandfather (up)</li>
            <li>Full brother, paternal brother</li>
            <li>Their male descendants</li>
            <li>Paternal uncles, their sons</li>
          </ul>
          <p className="text-themed-muted text-sm leading-relaxed mt-2">A daughter or sister may become &quot;asaba&quot; with their brother (&quot;asaba bi-ghayriha&quot;).</p>
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">3. Dhu al-Arham — Distant relatives</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Relatives connected through the female line who are not in the first two categories: maternal uncles/aunts, daughter&apos;s children, paternal aunts, etc. They inherit <span className="text-gold">only when no one in the first two categories exists</span>. Some scholarly opinions differ on this.
          </p>
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Who Does Not Inherit</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">A non-Muslim does not inherit from a Muslim</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ said: &quot;A Muslim does not inherit from a non-Muslim, and a non-Muslim does not inherit from a Muslim.&quot; This is a clear ruling. A non-Muslim family member can, however, receive up to 1/3 of the estate through wasiyyah.
          </p>
          <Ref text="Bukhari 85:41" />
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">A killer does not inherit from his victim</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;The killer does not inherit anything (from his victim).&quot; If someone intentionally kills another and would otherwise inherit, they are barred. The Sharia prevents murder from becoming a means of acquiring wealth.
          </p>
          <Ref text="Tirmidhi 29:20" />
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">An illegitimate child and the father</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A child born outside of a valid marriage inherits only from the mother and the mother&apos;s family — not from the biological father&apos;s lineage. The child is attributed to the mother in Islamic law.
          </p>
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">A divorced wife (after iddah)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            If a couple is fully divorced (irrevocable, after iddah expires), they do not inherit from each other. However, if the husband dies during a revocable divorce&apos;s iddah, the wife still inherits.
          </p>
        </ContentCard>
      </div>

      <ContentCard delay={0.29} className="mt-4">
        <h5 className="text-gold font-medium mb-2">A note on adopted children</h5>
        <p className="text-themed-muted text-sm leading-relaxed">
          Islam does not recognize legal adoption that transfers lineage. An &quot;adopted&quot; child keeps their biological father&apos;s name and inherits from their biological family — not from the adopting family. If the adopting family wishes to leave something for the child, they may do so through <span className="text-gold">wasiyyah (up to 1/3)</span> or <span className="text-gold">gifts during their lifetime</span>.
        </p>
        <Ref text="Quran 33:5" />
      </ContentCard>

      <SourcesCard className="mt-6" sources={[
        { ref: "Bukhari 85:9", desc: "Give fixed shares first, remainder to nearest male relative" },
        { ref: "Bukhari 85:41", desc: "Muslim and non-Muslim do not inherit from each other" },
        { ref: "Tirmidhi 29:20", desc: "Killer does not inherit from victim" },
        { ref: "Quran 33:5", desc: "Children attributed to their biological fathers" },
      ]} />
    </div>
  );
}

function WasiyyahTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          A <span className="text-gold italic">wasiyyah</span> is a will — written instructions a Muslim leaves for what should happen to their estate, body, and unsettled affairs after death. The Prophet ﷺ commanded every Muslim to keep one written down. There are specific rules for what can be in it.
        </p>
      </ContentCard>

      <h3 className="text-lg font-semibold text-themed mt-4 mb-3 px-1">The Command to Have a Will</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <VerseCard
          arabic="مَا حَقُّ امْرِئٍ مُسْلِمٍ لَهُ شَيْءٌ يُوصِي فِيهِ يَبِيتُ لَيْلَتَيْنِ إِلَّا وَوَصِيَّتُهُ مَكْتُوبَةٌ عِنْدَهُ"
          transliteration="Ma haqqu-mri'in muslimin lahu shay'un yusi fihi yabitu laylatayni illa wa wasiyyatuhu maktubatun 'indah"
          english="It is not right for a Muslim who has something to bequeath to spend two nights without his will written down with him."
          source="Bukhari 55:1"
          delay={0.08}
        />
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Update it regularly</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A will is not a one-time task. Life changes — children are born, debts paid, assets acquired. Review your wasiyyah annually, after major life events (marriage, birth, property purchase, illness), and update it accordingly.
          </p>
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">The 1/3 Rule</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Sa&apos;d ibn Abi Waqqas&apos;s question</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Sa&apos;d (RA) fell sick during the Farewell Pilgrimage and asked the Prophet ﷺ if he could bequeath two-thirds of his wealth. The Prophet ﷺ said no. He asked half — no. He asked a third. The Prophet ﷺ said:
          </p>
          <p className="font-arabic text-gold text-lg leading-loose mt-2 mb-1">الثُّلُثُ، وَالثُّلُثُ كَثِيرٌ، إِنَّكَ أَنْ تَذَرَ وَرَثَتَكَ أَغْنِيَاءَ خَيْرٌ مِنْ أَنْ تَذَرَهُمْ عَالَةً يَتَكَفَّفُونَ النَّاسَ</p>
          <p className="text-themed text-sm leading-relaxed mb-1">Ath-thuluthu, wath-thuluthu kathir. Innaka an tadhara warathataka aghniya&apos;a khayrun min an tadharahum &apos;alatan yatakaffafuna an-nas</p>
          <p className="text-themed-muted text-sm leading-relaxed italic mb-1">&ldquo;A third, and a third is much. To leave your heirs wealthy is better than to leave them poor begging from people.&rdquo;</p>
          <Ref text="Bukhari 55:5" />
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">No bequest to an heir</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The Prophet ﷺ said: <span className="font-arabic text-gold">&quot;لَا وَصِيَّةَ لِوَارِثٍ&quot;</span> — &quot;No bequest for an heir.&quot; Existing heirs already have their fixed shares — the wasiyyah cannot increase any of their shares. It is for non-heirs only (e.g. charity, a needy non-heir relative, a friend).
          </p>
          <Ref text="Tirmidhi 30:5" />
        </ContentCard>
      </div>

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">What to Include in Your Wasiyyah</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Declaration of faith</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Open with the shahada and your wish to be buried as a Muslim, with ghusl, kafan, and janazah according to the Sunnah.
          </p>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">List of debts</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Every debt you owe — to family, friends, financial institutions, anyone. Even small ones. Include payment instructions and account details so executors can fulfill them.
          </p>
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">List of what is owed to you</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Money others owe you, items lent out, business interests — so your heirs can recover them. These are part of your estate.
          </p>
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Bequests (up to 1/3)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Specify any charity, masjid, school, or needy non-heir relative you wish to receive a share. Total cannot exceed 1/3 of your estate after debts.
          </p>
        </ContentCard>
        <ContentCard delay={0.32}>
          <h5 className="text-gold font-medium mb-2">Specify Islamic distribution</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Especially in countries with non-Islamic inheritance laws: state explicitly that you want the rest distributed according to Islamic shari&apos;ah (fara&apos;id), and name who falls into which category to help executors.
          </p>
        </ContentCard>
        <ContentCard delay={0.35}>
          <h5 className="text-gold font-medium mb-2">Executor (Wasiy)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Appoint a trustworthy Muslim — knowledgeable in fiqh of inheritance — to execute your wasiyyah. Get witnesses. In most countries, the document needs to meet local legal requirements (witnessed, notarized, etc.) to be enforceable.
          </p>
        </ContentCard>
      </div>

      <SourcesCard className="mt-6" sources={[
        { ref: "Bukhari 55:1", desc: "A Muslim should not sleep two nights without his will" },
        { ref: "Bukhari 55:5", desc: "Sa'd ibn Abi Waqqas — bequest limited to one-third" },
        { ref: "Tirmidhi 30:5", desc: "No bequest for an heir" },
      ]} />
    </div>
  );
}

function WisdomInheritanceTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Inheritance is one of the areas where modern questions and confusions arise most often. Here are the common ones — answered with the foundational principles of the Quran and Sunnah.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">Why does a male get double in some cases?</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            In the verse <span className="font-arabic text-gold">لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ</span> (4:11), the male gets twice the female&apos;s share when they are siblings inheriting from a parent. But understand the financial framework:
          </p>
          <ul className="text-themed-muted text-sm leading-relaxed list-disc pl-5 mt-2 space-y-1">
            <li>The male carries the financial obligation of mahr (when he marries), maintenance of his wife and children, and care of needy female relatives.</li>
            <li>The female keeps <span className="text-gold">100% of her share</span> as her own personal wealth — not legally obligated to spend it on anyone.</li>
            <li>In many cases, the female actually receives more usable wealth than the male.</li>
          </ul>
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Women inherit equal or more in many cases</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The &quot;2:1&quot; rule is only one specific scenario. In <span className="text-gold">more than 30 cases</span>, women inherit equal to or more than men:
          </p>
          <ul className="text-themed-muted text-sm leading-relaxed list-disc pl-5 mt-2 space-y-1">
            <li>Maternal siblings: male and female inherit equally</li>
            <li>Mother inherits, while a paternal uncle (a man) may be excluded</li>
            <li>Daughter (1/2) vs. brother of the deceased (≤ 1/2) — often the daughter takes more</li>
            <li>Wife with no children of deceased gets 1/4; husband&apos;s parents take fixed shares</li>
          </ul>
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Can I exclude a daughter or wife?</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            <span className="text-gold">No</span>. The Quranic shares are non-negotiable. Excluding a Quranic heir is transgressing the limits of Allah — exactly what 4:14 warns against. Even a wasiyyah cannot reduce a Quranic share.
          </p>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">What if heirs want to redistribute after?</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Once heirs have received their lawful shares, they are free to gift portions to each other voluntarily. A daughter who wants to give her share to her brother (or vice versa) may do so <span className="text-gold">after</span> she has received it — never by being excluded beforehand. The act of gifting must be free and consensual.
          </p>
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">What if I live in a non-Muslim country?</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Civil law in most non-Muslim countries does not follow Islamic distribution by default. You <span className="text-gold">must write a legally binding Islamic will</span> that directs distribution according to shari&apos;ah. Otherwise, the state will distribute your estate according to its civil laws — which may give equal shares to all children regardless of gender, exclude certain Quranic heirs, or give your entire estate to your spouse.
          </p>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">Joint property and trusts</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Property held jointly (e.g. a house in two spouses&apos; names) — only the deceased&apos;s portion enters the inheritance pool. Trusts, life insurance, and named beneficiaries can override Islamic distribution if not structured carefully. Consult a Muslim estate-planning specialist who knows both fiqh and local law.
          </p>
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Gifts during life — Hibah</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            You may gift assets <span className="text-gold">during your lifetime</span> to anyone — heirs or not. These are not bound by the inheritance rules. But gifts to one child while excluding others are discouraged: the Prophet ﷺ refused to witness a gift one father gave only to one son and said: <span className="italic">&quot;Be just among your children.&quot;</span>
          </p>
          <Ref text="Bukhari 51:20" />
        </ContentCard>
        <ContentCard delay={0.29}>
          <h5 className="text-gold font-medium mb-2">Learn the rules — they will affect you</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Most Muslims encounter inheritance only when someone dies — when emotions are high and clarity is low. Learn the basics now: who inherits, what fractions apply, what must happen before distribution. The Prophet ﷺ encouraged learning the laws of inheritance. Then put your own will in writing while you are healthy.
          </p>
        </ContentCard>
      </div>

      <SourcesCard className="mt-6" sources={[
        { ref: "Quran 4:11", desc: "Lidh-dhakari mithlu hazzi al-unthayayn — and the financial context" },
        { ref: "Quran 4:14", desc: "Transgressing Allah's limits = the Fire" },
        { ref: "Bukhari 51:20", desc: "Be just among your children — Nu'man ibn Bashir" },
        { ref: "Bukhari 55:1", desc: "Keep your wasiyyah written down" },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function FamilyPage() {
  const [activeMain, setActiveMain] = useState<MainTab>("children");
  const [activeParents, setActiveParents] = useState<ParentsSub>("rights");
  const [activeElders, setActiveElders] = useState<EldersSub>("elderly");
  const [activeChildren, setActiveChildren] = useState<ChildrenSub>("conceiving");
  const [activeDeath, setActiveDeath] = useState<DeathSub>("preparing");
  const [activeInheritance, setActiveInheritance] = useState<InheritanceSub>("foundations");

  return (
    <div>
      <PageHeader
        title="Family"
        titleAr="الأسرة"
        subtitle="Rights of parents, honoring elders, visiting the sick — and the duas that bind family together"
      />

      <ContentCard className="mb-6">
        <div className="text-center py-4">
          <p className="text-2xl font-arabic text-gold leading-loose mb-3">
            وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا
          </p>
          <p className="text-themed-muted italic">
            &ldquo;Your Lord has decreed that you worship none but Him, and that you be good to your parents.&rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-1">Quran 17:23</p>
        </div>
      </ContentCard>

      <TabBar
        tabs={mainTabs}
        activeTab={activeMain}
        onTabChange={(key) => setActiveMain(key as MainTab)}
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
              <SubTabLayout subs={parentsSubs} activeSub={activeParents} setActiveSub={setActiveParents}>
                {activeParents === "rights" && <RightsTab />}
                {activeParents === "quran" && <QuranTab />}
                {activeParents === "sunnah" && <SunnahTab />}
                {activeParents === "duas" && <DuasTab />}
                {activeParents === "after" && <AfterTab />}
              </SubTabLayout>
            )}
            {activeMain === "elders" && (
              <SubTabLayout subs={eldersSubs} activeSub={activeElders} setActiveSub={setActiveElders}>
                {activeElders === "elderly" && <ElderlyTab />}
                {activeElders === "sick" && <SickTab />}
              </SubTabLayout>
            )}
            {activeMain === "children" && (
              <SubTabLayout subs={childrenSubs} activeSub={activeChildren} setActiveSub={setActiveChildren}>
                {activeChildren === "conceiving" && <ConceivingTab />}
                {activeChildren === "pregnancy" && <PregnancyTab />}
                {activeChildren === "newborn" && <NewbornTab />}
                {activeChildren === "blessings" && <BlessingsTab />}
                {activeChildren === "rights" && <ChildrenRightsTab />}
                {activeChildren === "raising" && <RaisingTab />}
                {activeChildren === "daughters" && <DaughtersTab />}
              </SubTabLayout>
            )}
            {activeMain === "death" && (
              <SubTabLayout subs={deathSubs} activeSub={activeDeath} setActiveSub={setActiveDeath}>
                {activeDeath === "preparing" && <PreparingDeathTab />}
                {activeDeath === "dying" && <DyingMomentsTab />}
                {activeDeath === "washing" && <WashingTab />}
                {activeDeath === "janazah" && <JanazahTab />}
                {activeDeath === "burial" && <BurialTab />}
                {activeDeath === "grief" && <GriefTab />}
                {activeDeath === "visiting" && <VisitingGravesTab />}
              </SubTabLayout>
            )}
            {activeMain === "inheritance" && (
              <SubTabLayout subs={inheritanceSubs} activeSub={activeInheritance} setActiveSub={setActiveInheritance}>
                {activeInheritance === "foundations" && <FoundationsInheritanceTab />}
                {activeInheritance === "verses" && <VersesInheritanceTab />}
                {activeInheritance === "before" && <BeforeDistributionTab />}
                {activeInheritance === "shares" && <SharesTab />}
                {activeInheritance === "heirs" && <HeirsTab />}
                {activeInheritance === "wasiyyah" && <WasiyyahTab />}
                {activeInheritance === "wisdom" && <WisdomInheritanceTab />}
              </SubTabLayout>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
