"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import TabBar from "@/components/TabBar";
import BookmarkButton from "@/components/BookmarkButton";
import HadithRefText from "@/components/HadithRefText";
import {
  BookOpen,
  Search,
  Heart,
  Scroll,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Eye,
  ShieldHalf,
  Clock,
  Sparkles,
  HandHeart,
  FileText,
  Gavel,
  Users,
  HeartCrack,
  Ban,
  ArrowRightLeft,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type Tab = "finding" | "getting-married" | "wedding" | "husband-rights" | "wife-rights" | "divorce";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "finding", label: "Finding a Spouse", icon: <Search size={16} /> },
  { key: "getting-married", label: "Getting Married", icon: <Heart size={16} /> },
  { key: "wedding", label: "The Wedding", icon: <Scroll size={16} /> },
  { key: "husband-rights", label: "Husband's Rights", icon: <ShieldCheck size={16} /> },
  { key: "wife-rights", label: "Wife's Rights", icon: <Scale size={16} /> },
  { key: "divorce", label: "Divorce", icon: <AlertTriangle size={16} /> },
];

/* ═══════════════════════════════════════════════════════════════════
   SUB-TAB DEFINITIONS
   ═══════════════════════════════════════════════════════════════════ */

type FindingSub = "what-to-look-for" | "the-halal-way";
const findingSubs: { key: FindingSub; label: string; icon: React.ReactNode }[] = [
  { key: "what-to-look-for", label: "What to Look For", icon: <Eye size={14} /> },
  { key: "the-halal-way", label: "The Halal Way", icon: <ShieldHalf size={14} /> },
];

type GettingMarriedSub = "marry-timely" | "trust-in-allah";
const gettingMarriedSubs: { key: GettingMarriedSub; label: string; icon: React.ReactNode }[] = [
  { key: "marry-timely", label: "Marry Timely", icon: <Clock size={14} /> },
  { key: "trust-in-allah", label: "Trust in Allah", icon: <Sparkles size={14} /> },
];

type WeddingSub = "the-nikah" | "the-walimah" | "dua-for-newlyweds";
const weddingSubs: { key: WeddingSub; label: string; icon: React.ReactNode }[] = [
  { key: "the-nikah", label: "The Nikah", icon: <FileText size={14} /> },
  { key: "the-walimah", label: "The Walimah", icon: <Users size={14} /> },
  { key: "dua-for-newlyweds", label: "Dua for Newlyweds", icon: <HandHeart size={14} /> },
];

type HusbandRightsSub = "status" | "specific-rights";
const husbandRightsSubs: { key: HusbandRightsSub; label: string; icon: React.ReactNode }[] = [
  { key: "status", label: "Status of the Husband", icon: <ShieldCheck size={14} /> },
  { key: "specific-rights", label: "Specific Rights", icon: <Gavel size={14} /> },
];

type WifeRightsSub = "kind-treatment" | "specific-rights";
const wifeRightsSubs: { key: WifeRightsSub; label: string; icon: React.ReactNode }[] = [
  { key: "kind-treatment", label: "Kind Treatment", icon: <HeartCrack size={14} /> },
  { key: "specific-rights", label: "Specific Rights", icon: <Scale size={14} /> },
];

type DivorceSub = "last-resort" | "three-talaqs" | "khul" | "after-divorce";
const divorceSubs: { key: DivorceSub; label: string; icon: React.ReactNode }[] = [
  { key: "last-resort", label: "A Last Resort", icon: <AlertTriangle size={14} /> },
  { key: "three-talaqs", label: "The Three Talaqs", icon: <Ban size={14} /> },
  { key: "khul", label: "Khul'", icon: <ArrowRightLeft size={14} /> },
  { key: "after-divorce", label: "After Divorce", icon: <Clock size={14} /> },
];

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function Ref({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-gold/80 mt-2">
      <BookOpen size={12} className="shrink-0" />
      <HadithRefText text={text} className="leading-relaxed" />
    </p>
  );
}

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
   TAB: Finding a Spouse
   ═══════════════════════════════════════════════════════════════════ */

function FindingWhatToLookFor() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-arabic text-gold text-lg leading-loose mb-2">
              تُنكَحُ المرأةُ لأربعٍ: لمالِها، ولحَسَبِها، ولجمالِها، ولدينِها، فاظفَرْ بذاتِ الدِّينِ تَرِبَتْ يداكَ
            </p>
            <p className="text-themed font-medium text-sm mb-1 italic">
              A woman is married for four things: her wealth, her lineage, her beauty, and her religion. Choose the one with religion — may your hands be rubbed with dust (i.e., may you prosper).
            </p>
            <Ref text="Bukhari 67:28" />
          </div>
          <BookmarkButton type="hadith" id="marriage-choose-religion" title="Choose the One with Religion" subtitle="Marriage" href="/marriage?tab=finding" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The same applies when choosing a husband. The Prophet &#xFDFA; said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;If there comes to you one whose religion and character please you, then marry (your daughter/ward) to him. If you do not do so, there will be fitnah (tribulation) on earth and widespread corruption.&quot;
        </p>
        <Ref text="Tirmidhi 11:5" />
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Looking at a Potential Spouse</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          It is permissible — and encouraged — to see the person you intend to marry. Al-Mughirah ibn Shu&apos;bah wanted to marry a woman, and the Prophet &#xFDFA; told him:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Go and look at her, for that is more likely to create harmony between you.&quot;
        </p>
        <Ref text="Tirmidhi 11:8" />
      </ContentCard>

      <ContentCard delay={0.2}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Jabir ibn Abdullah reported that the Prophet &#xFDFA; said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;When one of you proposes to a woman, if he is able to look at what will encourage him to marry her, he should do so.&quot;
        </p>
        <Ref text="Abu Dawud 12:37" />
      </ContentCard>
    </div>
  );
}

function FindingTheHalalWay() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">Involve Your Family</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The process of finding a spouse should involve your wali (guardian). A woman&apos;s marriage without her guardian&apos;s involvement is invalid:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Whichever woman marries without the permission of her wali, her marriage is invalid, her marriage is invalid, her marriage is invalid.&quot;
        </p>
        <Ref text="Tirmidhi 11:23" />
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">No Secret Relationships</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Islam does not permit dating, being alone together (khalwa), or secret relationships. The path is: identify, involve families, meet in appropriate settings with a chaperone, and proceed to nikah.
        </p>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Istikhara</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Pray the prayer of guidance (Salat al-Istikhara) before making your decision, and trust in Allah&apos;s plan.
        </p>
        <Link href="/salah" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Learn about Istikhara prayer →
        </Link>
      </ContentCard>
    </div>
  );
}

function FindingTab() {
  const [activeSub, setActiveSub] = useState<FindingSub>("what-to-look-for");
  return (
    <SubTabLayout subs={findingSubs} activeSub={activeSub} setActiveSub={setActiveSub}>
      {activeSub === "what-to-look-for" && <FindingWhatToLookFor />}
      {activeSub === "the-halal-way" && <FindingTheHalalWay />}
    </SubTabLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Getting Married
   ═══════════════════════════════════════════════════════════════════ */

function MarryTimely() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-arabic text-gold text-lg leading-loose mb-2">
              يا مَعشَرَ الشَّبابِ، مَنِ استَطاعَ مِنكُمُ الباءَةَ فَليَتَزَوَّجْ
            </p>
            <p className="text-themed font-medium text-sm mb-1 italic">
              &quot;O young men, whoever among you can afford to get married, let him do so, for it lowers the gaze and guards chastity. And whoever cannot, then let him fast, for it will be a shield for him.&quot;
            </p>
            <Ref text="Bukhari 67:4" />
          </div>
          <BookmarkButton type="hadith" id="marriage-marry-young" title="Marry if You Can" subtitle="Marriage" href="/marriage?tab=getting-married" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Half of Your Faith</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Marriage is one of the greatest means of protecting yourself from sin. The Prophet &#xFDFA; described it as completing half of one&apos;s faith:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;When a servant of Allah marries, he has completed half of his religion, so let him fear Allah in the remaining half.&quot;
        </p>
        <Ref text="Bayhaqi, Shu'ab al-Iman 5100" />
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Do Not Delay Without Reason</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Delaying marriage unnecessarily — especially when one has the means and desire — is discouraged. The longer one delays, the greater the risk of falling into sin. The Prophet &#xFDFA; emphasized that marriage is from his Sunnah:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Marriage is part of my Sunnah. Whoever does not follow my Sunnah is not of me. Get married, for I will boast of your great numbers before the nations on the Day of Judgement.&quot;
        </p>
        <Ref text="Ibn Majah 9:2" />
      </ContentCard>
    </div>
  );
}

function TrustInAllah() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-gold font-semibold text-sm mb-2">Allah Provides for Those Who Marry</h4>
            <p className="text-themed-muted text-sm leading-relaxed">
              Do not delay marriage out of fear of poverty. Allah promises to provide for those who marry seeking to guard their chastity:
            </p>
            <p className="text-themed font-medium text-sm mt-2 italic">
              &quot;There are three whom Allah is bound to help: the mujahid who strives in the cause of Allah, the mukatab (slave) who wants to pay for his freedom, and the one who gets married seeking chastity.&quot;
            </p>
            <Ref text="Tirmidhi 22:38" />
          </div>
          <BookmarkButton type="hadith" id="marriage-allah-helps" title="Allah Helps Those Who Marry" subtitle="Marriage" href="/marriage?tab=getting-married" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <p className="font-arabic text-gold text-lg leading-loose mb-2">
          وَأَنكِحُوا۟ ٱلْأَيَـٰمَىٰ مِنكُمْ وَٱلصَّـٰلِحِينَ مِنْ عِبَادِكُمْ وَإِمَآئِكُمْ ۚ إِن يَكُونُوا۟ فُقَرَآءَ يُغْنِهِمُ ٱللَّهُ مِن فَضْلِهِۦ
        </p>
        <p className="text-themed font-medium text-sm mb-1 italic">
          &quot;And marry the unmarried among you and the righteous among your male and female slaves. If they are poor, Allah will enrich them from His bounty.&quot;
        </p>
        <Ref text="Quran 24:32" />
        <Link href="/quran/24" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Read Surah An-Nur →
        </Link>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Your Spouse is Decreed by Allah</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          While we take the means — searching, praying istikhara, involving our families — ultimately your spouse is part of Allah&apos;s qadr (divine decree). Before you were even born, four things were written for you:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;The angel is sent to the embryo and writes four things: his provision, his lifespan, his deeds, and whether he will be wretched or blessed.&quot;
        </p>
        <Ref text="Bukhari 59:19" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          Your rizq (provision) includes your spouse. The person you marry was written for you by Allah before your creation.
        </p>
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">Trust Allah&apos;s Plan</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          You may desire someone, but Allah knows what is best:
        </p>
        <p className="font-arabic text-gold text-lg leading-loose mt-2 mb-1">
          وَعَسَىٰٓ أَن تَكْرَهُوا۟ شَيْـًۭٔا وَهُوَ خَيْرٌۭ لَّكُمْ ۖ وَعَسَىٰٓ أَن تُحِبُّوا۟ شَيْـًۭٔا وَهُوَ شَرٌّۭ لَّكُمْ
        </p>
        <p className="text-themed font-medium text-sm italic">
          &quot;Perhaps you dislike something and it is good for you; and perhaps you love something and it is bad for you. And Allah knows, while you do not know.&quot;
        </p>
        <Ref text="Quran 2:216" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          Take the means, pray sincerely, and then trust that whoever Allah places in your path is part of His perfect plan for you.
        </p>
      </ContentCard>
    </div>
  );
}

function GettingMarriedTab() {
  const [activeSub, setActiveSub] = useState<GettingMarriedSub>("marry-timely");
  return (
    <SubTabLayout subs={gettingMarriedSubs} activeSub={activeSub} setActiveSub={setActiveSub}>
      {activeSub === "marry-timely" && <MarryTimely />}
      {activeSub === "trust-in-allah" && <TrustInAllah />}
    </SubTabLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: The Wedding
   ═══════════════════════════════════════════════════════════════════ */

function TheNikah() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">What is the Nikah?</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The <span className="text-gold font-medium">nikah</span> is the Islamic marriage contract — it is the actual marriage ceremony itself. It is a simple, sacred contract between the groom and the bride&apos;s guardian (wali), conducted in the presence of witnesses. The nikah typically includes a short khutbah (sermon), the agreement on the mahr (dowry), and the formal acceptance by both parties. It can take place in a mosque, a home, or any suitable location. Unlike many cultural traditions, the nikah in Islam is meant to be straightforward and uncomplicated.
        </p>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">1. Consent of Both Parties</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Both the bride and groom must freely consent to the marriage. A woman cannot be forced into marriage against her will.
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;A previously-married woman should not be married until she is consulted, and a virgin should not be married until her permission is sought.&quot;
        </p>
        <Ref text="Bukhari 67:72" />
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">2. Wali (Guardian)</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The bride must have a wali — a male guardian (typically her father) who acts on her behalf in the marriage contract.
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;There is no marriage without the permission of a guardian.&quot;
        </p>
        <Ref text="Abu Dawud 12:40" />
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">3. Mahr (Dowry)</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The groom must give the bride a mahr — a gift that belongs to her alone. It can be anything of value, and Islam encourages making it easy, not extravagant.
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          The Prophet &#xFDFA; approved a mahr of even an iron ring, and in one case accepted teaching Quran as mahr.
        </p>
        <Ref text="Bukhari 67:25" />
      </ContentCard>

      <ContentCard delay={0.25}>
        <h4 className="text-gold font-semibold text-sm mb-2">4. Witnesses & Public Announcement</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The marriage must be witnessed by at least two trustworthy witnesses. This requirement is established through scholarly consensus and supporting narrations.
        </p>
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          The marriage should also be publicly announced, not kept secret. The Prophet &#xFDFA; said: &quot;Announce the marriage.&quot;
        </p>
        <Ref text="Tirmidhi 11:10" />
      </ContentCard>
    </div>
  );
}

function TheWalimah() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">What is the Walimah?</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The <span className="text-gold font-medium">walimah</span> is the wedding feast or banquet held after the nikah and consummation of the marriage. It serves as a public celebration and announcement of the marriage. The walimah is a Sunnah of the Prophet &#xFDFA; and is considered obligatory by some scholars. Family, friends, and community members are invited to share in the joy. Importantly, Islam encourages keeping the walimah simple and within one&apos;s means — it is about bringing people together, not extravagance.
        </p>
      </ContentCard>

      <ContentCard delay={0.1}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Prophet &#xFDFA; told Abdur-Rahman ibn Awf when he got married:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Give a walimah, even if it is with just one sheep.&quot;
        </p>
        <Ref text="Bukhari 67:90" />
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Keep it Simple</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The most blessed marriages are those that are easiest in terms of cost. Extravagance in weddings is not from the Sunnah.
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;The best of marriage is that which is made easiest.&quot;
        </p>
        <Ref text="Abu Dawud 12:72" />
      </ContentCard>
    </div>
  );
}

function DuaForNewlyweds() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="font-arabic text-gold text-xl leading-loose mb-2">
          بَارَكَ اللهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
        </p>
        <p className="text-themed font-medium text-sm mb-1 italic">
          Barakallahu laka wa baraka alayka wa jama&apos;a baynakuma fi khayr
        </p>
        <p className="text-themed-muted text-sm leading-relaxed">
          May Allah bless you, and may He bestow His blessings upon you, and may He unite you both in goodness.
        </p>
        <Ref text="Tirmidhi 11:12" />
      </ContentCard>

      <ContentCard delay={0.1}>
        <p className="text-themed-muted text-sm leading-relaxed">
          This dua should be said to the newlywed couple. It is from the Sunnah to make dua of barakah (blessing) for those who have just gotten married. When you attend a wedding or hear of someone&apos;s marriage, recite this beautiful supplication for them.
        </p>
      </ContentCard>
    </div>
  );
}

function WeddingTab() {
  const [activeSub, setActiveSub] = useState<WeddingSub>("the-nikah");
  return (
    <SubTabLayout subs={weddingSubs} activeSub={activeSub} setActiveSub={setActiveSub}>
      {activeSub === "the-nikah" && <TheNikah />}
      {activeSub === "the-walimah" && <TheWalimah />}
      {activeSub === "dua-for-newlyweds" && <DuaForNewlyweds />}
    </SubTabLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Husband's Rights
   ═══════════════════════════════════════════════════════════════════ */

function HusbandStatus() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-themed-muted text-sm leading-relaxed">
              The Prophet &#xFDFA; emphasized the great right of the husband over his wife. He said:
            </p>
            <p className="text-themed font-medium text-sm mt-2 italic">
              &quot;If I were to command anyone to prostrate to anyone other than Allah, I would have commanded women to prostrate to their husbands. By the One in Whose hand is my soul, a woman cannot fulfill her duty towards Allah until she fulfills her duty towards her husband.&quot;
            </p>
            <Ref text="Ibn Majah 9:9" />
            <p className="text-themed-muted/70 text-xs mt-2 italic">
              Note: This does not mean the husband is worshipped — prostration is for Allah alone. This hadith illustrates the magnitude of the husband&apos;s rights, not that he is above accountability or that the wife has no rights of her own.
            </p>
          </div>
          <BookmarkButton type="hadith" id="marriage-prostrate-husband" title="Status of the Husband" subtitle="Marriage" href="/marriage?tab=husband-rights" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <p className="text-themed-muted text-sm leading-relaxed">
          The same hadith is narrated from Abu Hurairah with slightly different wording:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;If I were to command anyone to prostrate to anyone other than Allah, I would have commanded the wife to prostrate to her husband.&quot;
        </p>
        <Ref text="Tirmidhi 12:14" />
        <p className="text-themed-muted text-xs mt-2">
          Graded Hasan Sahih by Imam at-Tirmidhi.
        </p>
      </ContentCard>
    </div>
  );
}

function HusbandSpecificRights() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">Obedience in Good</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          A wife is expected to obey her husband in matters that are permissible and good. Obedience does not extend to anything sinful — &quot;There is no obedience to any created being if it involves disobedience to the Creator.&quot;
        </p>
        <Ref text="Musnad Ahmad 1095" />
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Guarding the Home</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          From the Prophet&apos;s farewell sermon:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Your rights over your women are that they are not to allow anyone whom you dislike to enter your home.&quot;
        </p>
        <Ref text="Tirmidhi 12:18" />
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Not Refusing Intimacy</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Prophet &#xFDFA; said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;If a man calls his wife to his bed and she refuses, and he goes to sleep angry with her, the angels will curse her until morning.&quot;
        </p>
        <Ref text="Bukhari 67:127" />
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          Scholars note that this applies when there is no valid excuse (illness, hardship, etc.).
        </p>
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">Gratitude</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Prophet &#xFDFA; said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;I was shown the Hellfire and the majority of its inhabitants were women, because of their ingratitude (kufr).&quot; It was said: &quot;Do they disbelieve in Allah?&quot; He said: &quot;They are ungrateful to their husbands and ungrateful for good deeds done for them.&quot;
        </p>
        <Ref text="Bukhari 2:29" />
      </ContentCard>
    </div>
  );
}

function HusbandRightsTab() {
  const [activeSub, setActiveSub] = useState<HusbandRightsSub>("status");
  return (
    <SubTabLayout subs={husbandRightsSubs} activeSub={activeSub} setActiveSub={setActiveSub}>
      {activeSub === "status" && <HusbandStatus />}
      {activeSub === "specific-rights" && <HusbandSpecificRights />}
    </SubTabLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Wife's Rights
   ═══════════════════════════════════════════════════════════════════ */

function WifeKindTreatment() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-themed-muted text-sm leading-relaxed">
              The Prophet &#xFDFA; said:
            </p>
            <p className="text-themed font-medium text-sm mt-2 italic">
              &quot;The best of you are those who are best to their wives, and I am the best of you to my wives.&quot;
            </p>
            <Ref text="Tirmidhi 49:295" />
          </div>
          <BookmarkButton type="hadith" id="marriage-best-to-wives" title="Best to Their Wives" subtitle="Marriage" href="/marriage?tab=wife-rights" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <p className="font-arabic text-gold text-lg leading-loose mb-2">
          وَعَاشِرُوهُنَّ بِٱلْمَعْرُوفِ
        </p>
        <p className="text-themed font-medium text-sm mb-1 italic">
          &quot;And live with them in kindness.&quot;
        </p>
        <Ref text="Quran 4:19" />
        <Link href="/quran/4" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Read Surah An-Nisa →
        </Link>
      </ContentCard>

      <ContentCard delay={0.15}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-gold font-semibold text-sm mb-2">The Farewell Sermon</h4>
            <p className="text-themed-muted text-sm leading-relaxed">
              In his farewell sermon at Arafat, the Prophet &#xFDFA; said:
            </p>
            <p className="text-themed font-medium text-sm mt-2 italic">
              &quot;Fear Allah concerning women! Verily you have taken them on the security of Allah, and intercourse with them has been made lawful to you by the words of Allah... And their rights upon you are that you provide for them and clothe them in a fitting manner.&quot;
            </p>
            <Ref text="Muslim 15:159" />
          </div>
          <BookmarkButton type="hadith" id="marriage-farewell-sermon" title="Farewell Sermon on Women" subtitle="Marriage" href="/marriage?tab=wife-rights" />
        </div>
      </ContentCard>
    </div>
  );
}

function WifeSpecificRights() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">Financial Support (Nafaqah)</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The husband is obligated to provide for his wife — housing, food, clothing, and general maintenance. This is her right even if she is wealthy herself.
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;It is sufficient sin for a person to neglect those whom he is responsible for.&quot;
        </p>
        <Ref text="Abu Dawud 9:137" />
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">The Mahr Belongs to Her</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The mahr (dowry) is the wife&apos;s exclusive property. The husband has no right to take it back.
        </p>
        <p className="font-arabic text-gold text-lg leading-loose mt-2 mb-1">
          وَآتُوا النِّسَاءَ صَدُقَاتِهِنَّ نِحْلَةً
        </p>
        <p className="text-themed font-medium text-sm italic">
          &quot;And give the women their dowries graciously.&quot;
        </p>
        <Ref text="Quran 4:4" />
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">No Harm or Mistreatment</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Islam absolutely prohibits any form of abuse — physical, emotional, or verbal. The Prophet &#xFDFA; never struck a woman or a servant.
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;The Messenger of Allah &#xFDFA; never struck anything with his hand, neither a servant nor a woman.&quot;
        </p>
        <Ref text="Muslim 43:108" />
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">Emotional & Spiritual Care</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          A husband should be gentle, patient, and supportive. The Prophet &#xFDFA; used to help with housework, mend his own shoes, and was playful and kind with his wives.
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          Aishah was asked: &quot;What did the Prophet &#xFDFA; do at home?&quot; She said: &quot;He used to be at the service of his family, and when the time for prayer came, he would go out to pray.&quot;
        </p>
        <Ref text="Bukhari 10:70" />
      </ContentCard>
    </div>
  );
}

function WifeRightsTab() {
  const [activeSub, setActiveSub] = useState<WifeRightsSub>("kind-treatment");
  return (
    <SubTabLayout subs={wifeRightsSubs} activeSub={activeSub} setActiveSub={setActiveSub}>
      {activeSub === "kind-treatment" && <WifeKindTreatment />}
      {activeSub === "specific-rights" && <WifeSpecificRights />}
    </SubTabLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Divorce
   ═══════════════════════════════════════════════════════════════════ */

function DivorceLastResort() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-themed-muted text-sm leading-relaxed">
              While Islam permits divorce, it is the most disliked of permissible things:
            </p>
            <p className="text-themed font-medium text-sm mt-2 italic">
              &quot;The most hated of permissible things to Allah is divorce.&quot;
            </p>
            <Ref text="Abu Dawud 13:4" />
            <p className="text-themed-muted/70 text-xs mt-2 italic">
              Note: Some scholars consider this narration to have a weakness in its chain, but the general meaning — that divorce is strongly disliked — is agreed upon by scholars.
            </p>
          </div>
          <BookmarkButton type="hadith" id="marriage-divorce-disliked" title="Divorce is Disliked" subtitle="Marriage" href="/marriage?tab=divorce" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Steps Before Divorce</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Before resorting to divorce, Islam prescribes a process:
        </p>
        <ol className="list-decimal list-inside text-themed-muted text-sm leading-relaxed mt-2 space-y-2">
          <li><span className="text-gold font-medium">Advise and counsel</span> — talk things through with kindness</li>
          <li><span className="text-gold font-medium">Separate beds</span> — a cooling-off period</li>
          <li><span className="text-gold font-medium">Appoint arbitrators</span> — one from each family to mediate</li>
        </ol>
        <Ref text="Quran 4:34-35" />
      </ContentCard>
    </div>
  );
}

function DivorceThreeTalaqs() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">First Talaq</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The husband issues <span className="text-gold font-medium">one talaq</span> during a period of purity (when the wife is not menstruating and they have not had intercourse in that cycle). This is the Sunnah method.
        </p>
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          After the first talaq, the wife observes an <span className="text-gold font-medium">iddah</span> (waiting period) of three menstrual cycles. During this time, <span className="text-gold font-medium">she stays in the marital home</span> — do not expel her.
        </p>
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          The husband may <span className="text-gold font-medium">take her back (ruju&apos;)</span> at any point during the iddah — no new nikah or mahr is required. If the iddah passes without reconciliation, the divorce is finalized but they may remarry with a new contract and mahr.
        </p>
        <Ref text="Quran 65:1" />
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Second Talaq</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          If the couple remarries (or reconciles during iddah) and the problems persist, the husband may issue a <span className="text-gold font-medium">second talaq</span> — again during a period of purity.
        </p>
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          The same iddah applies. He can still take her back during the iddah, or they can remarry after it with a new contract. After two talaqs, Allah warns:
        </p>
        <p className="font-arabic text-gold text-lg leading-loose mt-2 mb-1">
          ٱلطَّلَـٰقُ مَرَّتَانِ ۖ فَإِمْسَاكٌۢ بِمَعْرُوفٍ أَوْ تَسْرِيحٌۢ بِإِحْسَـٰنٍ
        </p>
        <p className="text-themed font-medium text-sm italic">
          &quot;Divorce is twice. Then either retain with kindness or release with grace.&quot;
        </p>
        <Ref text="Quran 2:229" />
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Third Talaq — Final & Irrevocable</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          If the husband issues a <span className="text-gold font-medium">third talaq</span>, the divorce becomes <span className="text-gold font-medium">irrevocable</span>. They <span className="text-gold font-medium">cannot remarry</span> — unless the wife naturally marries another man, consummates the marriage, and that marriage ends (by divorce or death) of its own accord. This is not something to be arranged or planned.
        </p>
        <p className="font-arabic text-gold text-lg leading-loose mt-2 mb-1">
          فَإِن طَلَّقَهَا فَلَا تَحِلُّ لَهُۥ مِنۢ بَعْدُ حَتَّىٰ تَنكِحَ زَوْجًا غَيْرَهُۥ
        </p>
        <p className="text-themed font-medium text-sm italic">
          &quot;And if he has divorced her [for the third time], then she is not lawful to him afterward until she marries a husband other than him.&quot;
        </p>
        <Ref text="Quran 2:230" />
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400" />
          Do NOT Say Talaq Three Times at Once
        </h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Issuing three talaqs in one sitting (&quot;talaq, talaq, talaq&quot;) is <span className="text-gold font-medium">sinful and against the Sunnah</span>. The Prophet &#xFDFA; became angry when he heard of a man who did this:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Is the Book of Allah being toyed with while I am still among you?&quot;
        </p>
        <Ref text="Nasai 27:13" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          The correct method is <span className="text-gold font-medium">one talaq at a time</span>, with a full iddah and genuine attempt at reconciliation between each. The three talaqs exist as a mercy — giving the couple three chances — not to be used all at once in anger.
        </p>
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          Note: The majority of scholars hold that three talaqs spoken at once still count as three (and thus become irrevocable), even though doing so is sinful. Some scholars, including Ibn Taymiyyah, held that it counts as only one. Consult a knowledgeable scholar for your specific situation.
        </p>
      </ContentCard>
    </div>
  );
}

function DivorceKhul() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">Divorce Initiated by the Wife</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          If a wife wants a divorce, she may request khul&apos; — she returns her mahr (or part of it) in exchange for the dissolution of the marriage.
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          The wife of Thabit ibn Qays came to the Prophet &#xFDFA; and said: &quot;I do not find fault with him in character or religion, but I dislike kufr (ingratitude) in Islam.&quot; The Prophet &#xFDFA; said: &quot;Will you return his garden?&quot; She said: &quot;Yes.&quot; He told Thabit: &quot;Accept the garden and divorce her.&quot;
        </p>
        <Ref text="Bukhari 68:22" />
      </ContentCard>

      <ContentCard delay={0.1}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Khul&apos; is a right given to women in Islam so that they are not trapped in a marriage that is causing them harm or unhappiness. The husband should not make it difficult for her if she wishes to separate, and the process should be handled with dignity and fairness.
        </p>
      </ContentCard>
    </div>
  );
}

function DivorceAfter() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">The Iddah (Waiting Period)</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          After divorce, the wife observes an iddah of three menstrual cycles. If she is pregnant, her iddah lasts until she gives birth. During the iddah of a revocable divorce, the husband provides housing and maintenance.
        </p>
        <Ref text="Quran 2:228" />
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Part with Grace</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Even in divorce, Islam commands kindness and dignity:
        </p>
        <p className="font-arabic text-gold text-lg leading-loose mt-2 mb-1">
          فَإِمْسَاكٌۢ بِمَعْرُوفٍ أَوْ تَسْرِيحٌۢ بِإِحْسَـٰنٍ
        </p>
        <p className="text-themed font-medium text-sm italic">
          &quot;Either retain her with kindness or release her with grace.&quot;
        </p>
        <Ref text="Quran 2:229" />
        <Link href="/quran/2" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Read Surah Al-Baqarah →
        </Link>
      </ContentCard>
    </div>
  );
}

function DivorceTab() {
  const [activeSub, setActiveSub] = useState<DivorceSub>("last-resort");
  return (
    <SubTabLayout subs={divorceSubs} activeSub={activeSub} setActiveSub={setActiveSub}>
      {activeSub === "last-resort" && <DivorceLastResort />}
      {activeSub === "three-talaqs" && <DivorceThreeTalaqs />}
      {activeSub === "khul" && <DivorceKhul />}
      {activeSub === "after-divorce" && <DivorceAfter />}
    </SubTabLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function MarriagePage() {
  const [activeTab, setActiveTab] = useState<Tab>("finding");

  return (
    <div>
      <PageHeader
        title="Marriage in Islam"
        titleAr="الزواج في الإسلام"
        subtitle="From finding a spouse to building a righteous household — guided by the Quran and Sunnah"
      />

      <ContentCard className="mb-6">
        <div className="text-center py-4">
          <p className="text-2xl font-arabic text-gold leading-loose mb-3">
            وَمِنْ ءَايَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًۭا لِّتَسْكُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةًۭ وَرَحْمَةً
          </p>
          <p className="text-themed-muted italic">
            &ldquo;And among His signs is that He created for you mates from among yourselves, that you may find tranquility in them; and He placed between you affection and mercy.&rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-1">Quran 30:21</p>
        </div>
      </ContentCard>

      <TabBar
        tabs={tabs.map((t) => ({ key: t.key, label: t.label, icon: t.icon }))}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as Tab)}
        mobileThreshold={4}
      />

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "finding" && <FindingTab />}
            {activeTab === "getting-married" && <GettingMarriedTab />}
            {activeTab === "wedding" && <WeddingTab />}
            {activeTab === "husband-rights" && <HusbandRightsTab />}
            {activeTab === "wife-rights" && <WifeRightsTab />}
            {activeTab === "divorce" && <DivorceTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
