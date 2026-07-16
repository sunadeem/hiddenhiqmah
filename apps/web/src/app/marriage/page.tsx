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
  Lock,
  Droplets,
  Moon,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type Tab = "before" | "wedding" | "husband-rights" | "wife-rights" | "married-life" | "divorce";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "before", label: "Before Marriage", icon: <Search size={16} /> },
  { key: "wedding", label: "The Wedding", icon: <Scroll size={16} /> },
  { key: "husband-rights", label: "Husband's Rights", icon: <ShieldCheck size={16} /> },
  { key: "wife-rights", label: "Wife's Rights", icon: <Scale size={16} /> },
  { key: "married-life", label: "Married Life", icon: <Heart size={16} /> },
  { key: "divorce", label: "Divorce", icon: <AlertTriangle size={16} /> },
];

/* ═══════════════════════════════════════════════════════════════════
   SUB-TAB DEFINITIONS
   ═══════════════════════════════════════════════════════════════════ */

type BeforeSub = "what-to-look-for" | "the-halal-way" | "marry-timely" | "trust-in-allah";
const beforeSubs: { key: BeforeSub; label: string; icon: React.ReactNode }[] = [
  { key: "what-to-look-for", label: "What to Look For", icon: <Eye size={14} /> },
  { key: "the-halal-way", label: "The Halal Way", icon: <ShieldHalf size={14} /> },
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

type MarriedLifeSub = "intimacy" | "permitted" | "privacy" | "dua-before-intimacy" | "purity" | "menses-planning";
const marriedLifeSubs: { key: MarriedLifeSub; label: string; icon: React.ReactNode }[] = [
  { key: "intimacy", label: "Intimacy in Islam", icon: <Heart size={14} /> },
  { key: "permitted", label: "Permitted & Not", icon: <Scale size={14} /> },
  { key: "privacy", label: "Privacy of the Bedroom", icon: <Lock size={14} /> },
  { key: "dua-before-intimacy", label: "Du'a Before Intimacy", icon: <HandHeart size={14} /> },
  { key: "purity", label: "Purity Afterwards", icon: <Droplets size={14} /> },
  { key: "menses-planning", label: "Menses & Family Planning", icon: <Moon size={14} /> },
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

/* ═══════════════════════════════════════════════════════════════════
   TAB: Before Marriage
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
          <BookmarkButton type="hadith" id="marriage-choose-religion" title="Choose the One with Religion" subtitle="Marriage" href="/marriage?tab=before&sub=what-to-look-for" />
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
          <BookmarkButton type="hadith" id="marriage-marry-young" title="Marry if You Can" subtitle="Marriage" href="/marriage?tab=before&sub=marry-timely" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Half of Your Faith</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Marriage is one of the greatest means of protecting yourself from sin — the Prophet &#xFDFA; counted &quot;the man who gets married, seeking to keep himself chaste&quot; among three who have a promise of help from Allah — and he described it as completing half of one&apos;s faith:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;When a servant of Allah marries, he has completed half of his religion, so let him fear Allah in the remaining half.&quot;
        </p>
        <Ref text="Nasai 25:36; Bayhaqi, Shu'ab al-Iman 5100 — graded hasan by al-Albani (Sahih al-Targhib 1916)" />
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
          <BookmarkButton type="hadith" id="marriage-allah-helps" title="Allah Helps Those Who Marry" subtitle="Marriage" href="/marriage?tab=before&sub=trust-in-allah" />
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
        <h4 className="text-gold font-semibold text-sm mb-2">Intimacy Between Spouses</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Intimacy is a mutual right of both spouses — including the hadith on not refusing without a valid excuse. This topic now lives in the Married Life tab.
        </p>
        <Link href="/marriage?tab=married-life&sub=intimacy" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Read in Married Life →
        </Link>
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

      <ContentCard delay={0.25}>
        <h4 className="text-gold font-semibold text-sm mb-2">Intimacy Between Spouses</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Intimacy is the wife&apos;s right just as it is the husband&apos;s — a mutual right covered in the Married Life tab.
        </p>
        <Link href="/marriage?tab=married-life&sub=intimacy" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Read in Married Life →
        </Link>
      </ContentCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Married Life
   ═══════════════════════════════════════════════════════════════════ */

function IntimacyView() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-arabic text-gold text-lg leading-loose mb-2">
              وَفِي بُضْعِ أَحَدِكُمْ صَدَقَةٌ
            </p>
            <p className="text-themed font-medium text-sm mb-1 italic">
              &quot;...and in the intimacy of one of you there is a charity.&quot; The companions asked: &quot;O Messenger of Allah, when one of us fulfils his desire, is there reward in that?&quot; He said: &quot;Tell me, if he were to devote it to something forbidden, would it not be a sin on his part? Similarly, if he devotes it to something lawful, he has a reward.&quot;
            </p>
            <Ref text="Muslim 12:66" />
          </div>
          <BookmarkButton type="hadith" id="marriage-intimacy-charity" title="Intimacy is a Charity" subtitle="Marriage" href="/marriage?tab=married-life&sub=intimacy" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">A Right of Both Spouses</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Intimacy in marriage is not a favor one spouse grants the other — it is a mutual right, and one of the central purposes of nikah: guarding chastity and building the affection and mercy Allah describes between spouses (Quran 30:21). Far from being something shameful, Islam treats the lawful fulfillment of desire as an act of worship that Allah rewards.
        </p>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Not Refusing Without Excuse</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Prophet &#xFDFA; said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;If a man calls his wife to his bed and she refuses, and he goes to sleep angry with her, the angels will curse her until morning.&quot;
        </p>
        <Ref text="Bukhari 67:127" />
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          Scholars note that this applies when there is no valid excuse (illness, hardship, etc.) — and that the husband is likewise obligated to fulfill his wife&apos;s need and must not neglect her.
        </p>
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">Kindness, Tenderness & Foreplay</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Scholars — classical and contemporary — emphasize that a husband should not treat intimacy as something rushed or one-sided. Gentle words, affection, and foreplay before intercourse are part of the kind treatment Allah commands (&quot;And live with them in kindness&quot; — Quran 4:19), and each spouse should care that the other is satisfied, not only themselves. The Prophet &#xFDFA; was affectionate and playful with his wives, and his Sunnah in marriage was warmth, not coldness.
        </p>
      </ContentCard>

    </div>
  );
}

function PermittedView() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="font-arabic text-gold text-lg leading-loose mb-2">
          هُنَّ لِبَاسٌ لَّكُمْ وَأَنتُمْ لِبَاسٌ لَّهُنَّ
        </p>
        <p className="text-themed font-medium text-sm mb-1 italic">
          &quot;They are a garment for you just as you are a garment for them.&quot;
        </p>
        <Ref text="Quran 2:187" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          Spouses cover, protect, warm, and beautify one another — the Quran&apos;s own image for the closeness of marriage. Within that closeness, the default is permissibility: everything between spouses is halal except the few things Allah and His Messenger &#xFDFA; excluded.
        </p>
      </ContentCard>

      <ContentCard delay={0.1}>
        <p className="font-arabic text-gold text-lg leading-loose mb-2">
          نِسَآؤُكُمْ حَرْثٌ لَّكُمْ فَأْتُوا۟ حَرْثَكُمْ أَنَّىٰ شِئْتُمْ
        </p>
        <p className="text-themed font-medium text-sm mb-1 italic">
          &quot;Your wives are a [place of] tillage for you, so come to your tillage as you please.&quot;
        </p>
        <Ref text="Quran 2:223" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          Scholars explain &quot;as you please&quot; to mean any manner or position — so long as it is in the <span className="text-gold font-medium">place of tilth</span>, the place from which children come. The verse grants breadth of manner, not breadth of place.
        </p>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Not During Menstruation</h4>
        <p className="font-arabic text-gold text-lg leading-loose mb-2">
          فَٱعْتَزِلُوا۟ ٱلنِّسَآءَ فِى ٱلْمَحِيضِ ۖ وَلَا تَقْرَبُوهُنَّ حَتَّىٰ يَطْهُرْنَ
        </p>
        <p className="text-themed font-medium text-sm mb-1 italic">
          &quot;...so stay away from women during menstruation and do not have intercourse with them until they become pure.&quot;
        </p>
        <Ref text="Quran 2:222" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          Intercourse is prohibited during menses and postnatal bleeding. Everything else between the spouses remains permitted — see the <span className="text-gold">Menses &amp; Family Planning</span> section.
        </p>
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">Anal Intercourse is Forbidden</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Prophet &#xFDFA; said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;He who has intercourse with his wife through her anus is accursed.&quot;
        </p>
        <Ref text="Abu Dawud 12:117" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          This prohibition is agreed upon by the scholars of the four madhhabs. It applies at all times — during menses and outside of it.
        </p>
      </ContentCard>

      <ContentCard delay={0.25}>
        <h4 className="text-gold font-semibold text-sm mb-2">No Harm, No Coercion</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Nothing harmful, degrading, or forced is permitted between spouses. Allah commands: &quot;And live with them in kindness&quot; (Quran 4:19) — and scholars state that this governs the bedroom as much as everything else in marriage. Marriage grants a right; it never grants a license to hurt, humiliate, or compel.
        </p>
      </ContentCard>

    </div>
  );
}

function PrivacyView() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-arabic text-gold text-lg leading-loose mb-2">
              إِنَّ مِنْ أَشَرِّ النَّاسِ عِنْدَ اللَّهِ مَنْزِلَةً يَوْمَ الْقِيَامَةِ الرَّجُلَ يُفْضِي إِلَى امْرَأَتِهِ وَتُفْضِي إِلَيْهِ ثُمَّ يَنْشُرُ سِرَّهَا
            </p>
            <p className="text-themed font-medium text-sm mb-1 italic">
              &quot;Among the worst of people in station before Allah on the Day of Judgement is the man who is intimate with his wife and she with him, and he then spreads her secret.&quot;
            </p>
            <Ref text="Muslim 16:144" />
          </div>
          <BookmarkButton type="hadith" id="marriage-bedroom-secrets" title="Privacy of the Bedroom" subtitle="Marriage" href="/marriage?tab=married-life&sub=privacy" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">A Trust, Not a Topic</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          What happens between spouses is an amanah (trust). Describing it to friends, joking about it in gatherings, or airing it in group chats and online is a betrayal of that trust — and the hadith places the one who does it among the worst of people before Allah. This applies equally to husbands and wives. Seeking necessary medical or scholarly advice about a genuine problem is not included in the prohibition.
        </p>
      </ContentCard>

    </div>
  );
}

function DuaBeforeIntimacyView() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-arabic text-gold text-lg leading-loose mb-2">
              بِسْمِ اللَّهِ اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا
            </p>
            <p className="text-themed text-sm leading-relaxed mb-1">
              Bismillah, Allahumma jannibna ash-Shaytana wa jannib ash-Shaytana ma razaqtana
            </p>
            <p className="text-themed-muted text-sm leading-relaxed italic mb-1">
              &ldquo;In the name of Allah. O Allah, keep Shaytan away from us, and keep Shaytan away from what You provide us.&rdquo;
            </p>
            <Ref text="Bukhari 80:83" />
          </div>
          <BookmarkButton type="hadith" id="marriage-dua-before-intimacy" title="Du'a Before Intimacy" subtitle="Marriage" href="/marriage?tab=married-life&sub=dua-before-intimacy" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">The promise</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Prophet &#xFDFA; said: if a child is decreed for them, Shaytan will never be able to harm that child. A simple sentence before intimacy can shape the spiritual fate of a life not yet conceived.
        </p>
        <Ref text="Bukhari 80:83" />
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Trying for a Child?</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The prophets asked Allah for righteous offspring in words the Quran preserves — du&apos;as you can make your own.
        </p>
        <Link href="/family?tab=children&sub=conceiving" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Du&apos;as of the prophets for offspring →
        </Link>
      </ContentCard>

    </div>
  );
}

function PurityView() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="font-arabic text-gold text-lg leading-loose mb-2">
          إِذَا جَاوَزَ الْخِتَانُ الْخِتَانَ فَقَدْ وَجَبَ الْغُسْلُ
        </p>
        <p className="text-themed font-medium text-sm mb-1 italic">
          Aishah narrated: &quot;When the circumcised meets the circumcised, then indeed ghusl is required. Myself and Allah&apos;s Messenger &#xFDFA; did that, so we performed ghusl.&quot;
        </p>
        <Ref text="Tirmidhi 1:108" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          Ghusl (the full ritual bath) becomes obligatory after intercourse <span className="text-gold font-medium">regardless of whether emission occurs</span> — the mere meeting of the private parts obligates it. This was settled by Aishah&apos;s report of the Prophet&apos;s &#xFDFA; own practice.
        </p>
        <Ref text="Muslim 3:107" />
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Between Two Acts — Wudu</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Prophet &#xFDFA; said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;When anyone amongst you has sexual intercourse with his wife and then he intends to repeat it, he should perform ablution.&quot;
        </p>
        <Ref text="Muslim 3:29" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          Wudu is likewise recommended before sleeping or eating while in a state of janabah — the ghusl itself can wait until before the next prayer.
        </p>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">How to Perform Ghusl</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The full step-by-step ghusl guide — what makes it obligatory, its obligatory acts, and the Sunnah method — lives on the Salah page.
        </p>
        <Link href="/salah?tab=purification&sub=ghusl" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Ghusl guide on the Salah page →
        </Link>
      </ContentCard>

    </div>
  );
}

function MensesPlanningView() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">During Menses — Everything Except Intercourse</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          When the verse on menstruation (Quran 2:222) was revealed, the Jews of Madinah would not even eat with a menstruating woman or share the house with her. The Prophet &#xFDFA; corrected both extremes:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Do everything except intercourse.&quot;
        </p>
        <Ref text="Muslim 3:16" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          A menstruating wife is not impure as a person — affection, closeness, sharing the bed, and all intimacy short of intercourse remain permitted. Only intercourse itself is prohibited until the bleeding ends and she purifies.
        </p>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">&apos;Azl (Withdrawal) Was Practiced</h4>
        <p className="font-arabic text-gold text-lg leading-loose mb-2">
          كُنَّا نَعْزِلُ وَالْقُرْآنُ يَنْزِلُ
        </p>
        <p className="text-themed font-medium text-sm mb-1 italic">
          Jabir said: &quot;We used to practice coitus interruptus while the Qur&apos;an was being revealed.&quot;
        </p>
        <Ref text="Bukhari 67:142" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          The companions practiced &apos;azl (withdrawal) during the Prophet&apos;s &#xFDFA; lifetime, revelation was still descending, and it was not forbidden. Scholars note that had it been sinful, the Quran or the Prophet &#xFDFA; would have prohibited it. He did describe it as less than ideal — reminding that no soul Allah has decreed will fail to come into existence — but he did not forbid it.
        </p>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Modern Contraception</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Contemporary scholars generally treat temporary, reversible contraception (condoms, the pill, and similar) by the same principles as &apos;azl: permissible with the mutual consent of both spouses, for a valid purpose such as spacing children or the mother&apos;s health, and provided the method causes no harm. Neither spouse should impose it on the other unilaterally.
        </p>
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">No Permanent Prevention Without Need</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Permanent sterilization (vasectomy, tubal ligation) without genuine necessity is impermissible according to the great majority of scholars — it cuts off progeny altogether, and children are among the purposes of marriage the Quran celebrates. Scholars allow it where a trustworthy medical need exists, such as real danger to the mother&apos;s life. For any specific situation, consult a knowledgeable scholar.
        </p>
      </ContentCard>

    </div>
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

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

/* Per-sub-view sources, rendered full-width BELOW the rail layout so the
   Sources card lines up with the rest of the page instead of the rail's
   right column. Built from the references already shown on each view's cards. */
const beforeSources: Record<BeforeSub, SourceRef[]> = {
  "what-to-look-for": [
    { ref: "Bukhari 67:28", desc: "A woman is married for four things — choose the one with religion" },
    { ref: "Tirmidhi 11:5", desc: "Marry the suitor whose religion and character please you" },
    { ref: "Tirmidhi 11:8", desc: "Go and look at her — more likely to create harmony" },
    { ref: "Abu Dawud 12:37", desc: "Looking at what encourages one to marry her" },
  ],
  "the-halal-way": [
    { ref: "Tirmidhi 11:23", desc: "Marriage without the wali's permission is invalid" },
  ],
  "marry-timely": [
    { ref: "Bukhari 67:4", desc: "O young men, whoever among you can afford it, let him marry" },
    { ref: "Bayhaqi, Shu'ab al-Iman 5100 (hasan — al-Albani, Sahih al-Targhib 1916)", desc: "Marriage completes half of the religion" },
    { ref: "Nasai 25:36", desc: "Allah's promised help for the one who marries seeking chastity" },
    { ref: "Ibn Majah 9:2", desc: "Marriage is part of my Sunnah" },
  ],
  "trust-in-allah": [
    { ref: "Tirmidhi 22:38", desc: "Allah is bound to help the one who marries seeking chastity" },
    { ref: "Quran 24:32", desc: "If they are poor, Allah will enrich them from His bounty" },
    { ref: "Bukhari 59:19", desc: "Four things written for the embryo, including provision" },
    { ref: "Quran 2:216", desc: "Perhaps you dislike something and it is good for you" },
  ],
};

const weddingSources: Record<WeddingSub, SourceRef[]> = {
  "the-nikah": [
    { ref: "Bukhari 67:72", desc: "Consent of the bride must be sought" },
    { ref: "Abu Dawud 12:40", desc: "No marriage without the permission of a guardian" },
    { ref: "Bukhari 67:25", desc: "The mahr — even an iron ring or teaching Quran" },
    { ref: "Tirmidhi 11:10", desc: "Announce the marriage" },
  ],
  "the-walimah": [
    { ref: "Bukhari 67:90", desc: "Give a walimah, even if with just one sheep" },
    { ref: "Abu Dawud 12:72", desc: "The best of marriage is that which is made easiest" },
  ],
  "dua-for-newlyweds": [
    { ref: "Tirmidhi 11:12", desc: "The du'a of barakah for the newlyweds" },
  ],
};

const husbandRightsSources: Record<HusbandRightsSub, SourceRef[]> = {
  status: [
    { ref: "Ibn Majah 9:9", desc: "The magnitude of the husband's right over the wife" },
    { ref: "Tirmidhi 12:14", desc: "The same hadith narrated from Abu Hurairah" },
  ],
  "specific-rights": [
    { ref: "Musnad Ahmad 1095", desc: "No obedience to a created being in disobedience to the Creator" },
    { ref: "Tirmidhi 12:18", desc: "Guarding the home — from the farewell sermon" },
    { ref: "Bukhari 2:29", desc: "Warning against ingratitude to husbands" },
  ],
};

const wifeRightsSources: Record<WifeRightsSub, SourceRef[]> = {
  "kind-treatment": [
    { ref: "Tirmidhi 49:295", desc: "The best of you are those who are best to their wives" },
    { ref: "Quran 4:19", desc: "And live with them in kindness" },
    { ref: "Muslim 15:159", desc: "Fear Allah concerning women — the farewell sermon" },
  ],
  "specific-rights": [
    { ref: "Abu Dawud 9:137", desc: "Sin of neglecting those one is responsible for" },
    { ref: "Quran 4:4", desc: "And give the women their dowries graciously" },
    { ref: "Muslim 43:108", desc: "The Prophet ﷺ never struck a servant or a woman" },
    { ref: "Bukhari 10:70", desc: "He was at the service of his family" },
  ],
};

const divorceSources: Record<DivorceSub, SourceRef[]> = {
  "last-resort": [
    { ref: "Abu Dawud 13:4", desc: "The most hated of permissible things to Allah is divorce" },
    { ref: "Quran 4:34-35", desc: "The steps before divorce — counsel, separation, arbitrators" },
  ],
  "three-talaqs": [
    { ref: "Quran 65:1", desc: "Divorce during a period of purity; the iddah" },
    { ref: "Quran 2:229", desc: "Divorce is twice — retain with kindness or release with grace" },
    { ref: "Quran 2:230", desc: "After the third talaq she is not lawful to him" },
    { ref: "Nasai 27:13", desc: "The Prophet's ﷺ anger at three talaqs in one sitting" },
  ],
  khul: [
    { ref: "Bukhari 68:22", desc: "The wife of Thabit ibn Qays and the khul'" },
  ],
  "after-divorce": [
    { ref: "Quran 2:228", desc: "The iddah of three menstrual cycles" },
    { ref: "Quran 2:229", desc: "Either retain her with kindness or release her with grace" },
  ],
};

const marriedLifeSources: Record<MarriedLifeSub, SourceRef[]> = {
  intimacy: [
    { ref: "Muslim 12:66", desc: "In the intimacy of one of you there is a charity" },
    { ref: "Bukhari 67:127", desc: "Not refusing the spouse without a valid excuse" },
    { ref: "Quran 30:21", desc: "Affection and mercy placed between spouses" },
    { ref: "Quran 4:19", desc: "And live with them in kindness" },
  ],
  permitted: [
    { ref: "Quran 2:187", desc: "Spouses are garments for one another" },
    { ref: "Quran 2:223", desc: "The tilth verse — breadth of manner, one place" },
    { ref: "Quran 2:222", desc: "Prohibition of intercourse during menstruation" },
    { ref: "Abu Dawud 12:117", desc: "Prohibition of anal intercourse" },
    { ref: "Quran 4:19", desc: "And live with them in kindness" },
  ],
  privacy: [
    { ref: "Muslim 16:144", desc: "The one who spreads the spouse's secret is among the worst of people" },
  ],
  "dua-before-intimacy": [
    { ref: "Bukhari 80:83", desc: "Du'a before intimacy — protection of the child from Shaytan" },
  ],
  purity: [
    { ref: "Tirmidhi 1:108", desc: "When the circumcised meets the circumcised, ghusl is required" },
    { ref: "Muslim 3:107", desc: "Ghusl obligatory even without emission — Aishah's report" },
    { ref: "Muslim 3:29", desc: "Wudu between two acts of intimacy" },
  ],
  "menses-planning": [
    { ref: "Quran 2:222", desc: "The verse on menstruation" },
    { ref: "Muslim 3:16", desc: "Do everything except intercourse" },
    { ref: "Bukhari 67:142", desc: "'Azl practiced while the Quran was being revealed" },
  ],
};

const subsByTab: Record<Tab, readonly { key: string }[]> = {
  before: beforeSubs,
  wedding: weddingSubs,
  "husband-rights": husbandRightsSubs,
  "wife-rights": wifeRightsSubs,
  "married-life": marriedLifeSubs,
  divorce: divorceSubs,
};

const defaultSubs: Record<Tab, string> = {
  before: "what-to-look-for",
  wedding: "the-nikah",
  "husband-rights": "status",
  "wife-rights": "kind-treatment",
  "married-life": "intimacy",
  divorce: "last-resort",
};

/* ── Page search (Rule 2): the rail is filtered by label + per-view keywords;
   matching pills stay visible, non-matching hide, and the first match is
   auto-selected. Empty query restores everything. ── */
type SearchEntry = { tab: Tab; sub: string; label: string; keywords: string };

const searchIndex: SearchEntry[] = [
  { tab: "before", sub: "what-to-look-for", label: "What to Look For", keywords: "choose spouse religion character beauty wealth lineage look at her suitor proposal harmony" },
  { tab: "before", sub: "the-halal-way", label: "The Halal Way", keywords: "wali guardian involve family no dating khalwa secret relationships chaperone istikhara" },
  { tab: "before", sub: "marry-timely", label: "Marry Timely", keywords: "young men afford lowers the gaze fasting half of faith do not delay sunnah" },
  { tab: "before", sub: "trust-in-allah", label: "Trust in Allah", keywords: "provision poverty allah enriches qadr decree written for you rizq trust plan" },
  { tab: "wedding", sub: "the-nikah", label: "The Nikah", keywords: "marriage contract ceremony consent wali guardian mahr dowry witnesses announce khutbah" },
  { tab: "wedding", sub: "the-walimah", label: "The Walimah", keywords: "wedding feast banquet one sheep keep it simple celebration invitation" },
  { tab: "wedding", sub: "dua-for-newlyweds", label: "Dua for Newlyweds", keywords: "barakallahu laka blessing congratulate couple supplication" },
  { tab: "husband-rights", sub: "status", label: "Status of the Husband", keywords: "prostrate magnitude right duty wife" },
  { tab: "husband-rights", sub: "specific-rights", label: "Specific Rights", keywords: "obedience in good guarding the home permission gratitude ingratitude intimacy" },
  { tab: "wife-rights", sub: "kind-treatment", label: "Kind Treatment", keywords: "best to their wives live with them in kindness farewell sermon fear allah concerning women" },
  { tab: "wife-rights", sub: "specific-rights", label: "Specific Rights", keywords: "nafaqah financial support housing food clothing mahr belongs to her no harm abuse never struck emotional care housework" },
  { tab: "married-life", sub: "intimacy", label: "Intimacy in Islam", keywords: "charity mutual right refusing excuse foreplay tenderness affection" },
  { tab: "married-life", sub: "permitted", label: "Permitted & Not", keywords: "garments tilth menstruation anal forbidden lawful manner" },
  { tab: "married-life", sub: "privacy", label: "Privacy of the Bedroom", keywords: "secrets spreading worst of people confidentiality" },
  { tab: "married-life", sub: "dua-before-intimacy", label: "Du'a Before Intimacy", keywords: "bismillah shaytan protection child supplication" },
  { tab: "married-life", sub: "purity", label: "Purity Afterwards", keywords: "ghusl janabah wudu between emission ritual bath" },
  { tab: "married-life", sub: "menses-planning", label: "Menses & Family Planning", keywords: "menstruation period azl contraception family planning" },
  { tab: "divorce", sub: "last-resort", label: "A Last Resort", keywords: "divorce disliked steps counsel separate beds arbitrators mediation" },
  { tab: "divorce", sub: "three-talaqs", label: "The Three Talaqs", keywords: "talaq iddah ruju taking back irrevocable three at once sinful purity" },
  { tab: "divorce", sub: "khul", label: "Khul'", keywords: "wife initiated divorce return mahr thabit ibn qays garden" },
  { tab: "divorce", sub: "after-divorce", label: "After Divorce", keywords: "iddah waiting period pregnant housing maintenance part with grace kindness" },
];

function MarriageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Deep-link support: ?tab= and ?sub= are the source of truth (read on mount,
  // written on every change), so in-page links and back/forward both work.
  const tabParam = searchParams.get("tab");
  const subParam = searchParams.get("sub");
  const activeTab: Tab = tabs.some((t) => t.key === tabParam) ? (tabParam as Tab) : "before";

  // Last-visited rail pill per tab, so switching tabs restores the selection.
  const [subMemory, setSubMemory] = useState<Record<Tab, string>>(() => {
    const memory = { ...defaultSubs };
    if (subParam && subsByTab[activeTab].some((s) => s.key === subParam)) memory[activeTab] = subParam;
    return memory;
  });

  const activeSubOf = (tab: Tab): string =>
    activeTab === tab && subParam && subsByTab[tab].some((s) => s.key === subParam)
      ? subParam
      : subMemory[tab];

  const syncUrl = (tab: Tab, sub: string) =>
    router.replace(`${pathname}?tab=${tab}&sub=${sub}`, { scroll: false });

  const changeTab = (tab: Tab) => syncUrl(tab, activeSubOf(tab));

  const changeSub = (tab: Tab) => (sub: string) => {
    setSubMemory((m) => ({ ...m, [tab]: sub }));
    syncUrl(tab, sub);
  };

  const activeBefore = activeSubOf("before") as BeforeSub;
  const activeWedding = activeSubOf("wedding") as WeddingSub;
  const activeHusband = activeSubOf("husband-rights") as HusbandRightsSub;
  const activeWife = activeSubOf("wife-rights") as WifeRightsSub;
  const activeMarried = activeSubOf("married-life") as MarriedLifeSub;
  const activeDivorce = activeSubOf("divorce") as DivorceSub;

  // Page search over the searchIndex rail entries (Rule 2).
  const [search, setSearch] = useState("");
  const searching = search.trim().length >= 2;
  const matches = searching
    ? searchIndex.filter((e) => textMatch(search, e.label, e.keywords))
    : searchIndex;
  const hasMatches = matches.length > 0;
  const visibleTabs =
    searching && hasMatches ? tabs.filter((t) => matches.some((e) => e.tab === t.key)) : tabs;
  const subMatches = (tab: Tab, sub: string) =>
    !searching || !hasMatches || matches.some((e) => e.tab === tab && e.sub === sub);

  // Auto-select the first matching view when the current one is filtered out.
  useEffect(() => {
    if (!searching || !hasMatches) return;
    if (matches.some((e) => e.tab === activeTab && e.sub === activeSubOf(activeTab))) return;
    const target = matches.find((e) => e.tab === activeTab) ?? matches[0];
    setSubMemory((m) => ({ ...m, [target.tab]: target.sub }));
    syncUrl(target.tab, target.sub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Marriage in Islam"
        titleAr="الزواج في الإسلام"
        subtitle="From finding a spouse to building a righteous household — guided by the Quran and Sunnah"
      />

      <VerseHero
        arabic="وَمِنْ ءَايَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًۭا لِّتَسْكُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةًۭ وَرَحْمَةً"
        text="And among His signs is that He created for you mates from among yourselves, that you may find tranquility in them; and He placed between you affection and mercy."
        reference="Quran 30:21"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search nikah, rights, married life..." className="mb-6" />

      <TabBar
        tabs={visibleTabs.map((t) => ({ key: t.key, label: t.label, icon: t.icon }))}
        activeTab={activeTab}
        onTabChange={(key) => changeTab(key as Tab)}
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
            {activeTab === "before" && (
              <>
                <SubTabLayout subs={beforeSubs.filter((s) => subMatches("before", s.key))} activeSub={activeBefore} setActiveSub={changeSub("before")}>
                  {activeBefore === "what-to-look-for" && <FindingWhatToLookFor />}
                  {activeBefore === "the-halal-way" && <FindingTheHalalWay />}
                  {activeBefore === "marry-timely" && <MarryTimely />}
                  {activeBefore === "trust-in-allah" && <TrustInAllah />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={beforeSources[activeBefore]} />
              </>
            )}
            {activeTab === "wedding" && (
              <>
                <SubTabLayout subs={weddingSubs.filter((s) => subMatches("wedding", s.key))} activeSub={activeWedding} setActiveSub={changeSub("wedding")}>
                  {activeWedding === "the-nikah" && <TheNikah />}
                  {activeWedding === "the-walimah" && <TheWalimah />}
                  {activeWedding === "dua-for-newlyweds" && <DuaForNewlyweds />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={weddingSources[activeWedding]} />
              </>
            )}
            {activeTab === "husband-rights" && (
              <>
                <SubTabLayout subs={husbandRightsSubs.filter((s) => subMatches("husband-rights", s.key))} activeSub={activeHusband} setActiveSub={changeSub("husband-rights")}>
                  {activeHusband === "status" && <HusbandStatus />}
                  {activeHusband === "specific-rights" && <HusbandSpecificRights />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={husbandRightsSources[activeHusband]} />
              </>
            )}
            {activeTab === "wife-rights" && (
              <>
                <SubTabLayout subs={wifeRightsSubs.filter((s) => subMatches("wife-rights", s.key))} activeSub={activeWife} setActiveSub={changeSub("wife-rights")}>
                  {activeWife === "kind-treatment" && <WifeKindTreatment />}
                  {activeWife === "specific-rights" && <WifeSpecificRights />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={wifeRightsSources[activeWife]} />
              </>
            )}
            {activeTab === "married-life" && (
              <>
                <SubTabLayout subs={marriedLifeSubs.filter((s) => subMatches("married-life", s.key))} activeSub={activeMarried} setActiveSub={changeSub("married-life")}>
                  {activeMarried === "intimacy" && <IntimacyView />}
                  {activeMarried === "permitted" && <PermittedView />}
                  {activeMarried === "privacy" && <PrivacyView />}
                  {activeMarried === "dua-before-intimacy" && <DuaBeforeIntimacyView />}
                  {activeMarried === "purity" && <PurityView />}
                  {activeMarried === "menses-planning" && <MensesPlanningView />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={marriedLifeSources[activeMarried]} />
              </>
            )}
            {activeTab === "divorce" && (
              <>
                <SubTabLayout subs={divorceSubs.filter((s) => subMatches("divorce", s.key))} activeSub={activeDivorce} setActiveSub={changeSub("divorce")}>
                  {activeDivorce === "last-resort" && <DivorceLastResort />}
                  {activeDivorce === "three-talaqs" && <DivorceThreeTalaqs />}
                  {activeDivorce === "khul" && <DivorceKhul />}
                  {activeDivorce === "after-divorce" && <DivorceAfter />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={divorceSources[activeDivorce]} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ContentCard className="mt-8">
        <h4 className="text-gold font-semibold text-sm mb-2">Building a Family</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Children, parents, kinship ties, and the rulings around death and inheritance — the next chapter after marriage.
        </p>
        <Link href="/family" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Continue to the Family page →
        </Link>
      </ContentCard>
    </div>
  );
}

export default function MarriagePage() {
  return (
    <Suspense>
      <MarriageContent />
    </Suspense>
  );
}
