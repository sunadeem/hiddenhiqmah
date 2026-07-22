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
  Music,
  HelpCircle,
  HeartHandshake,
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

type BeforeSub = "what-to-look-for" | "who-you-can-marry" | "forbidden-marriages" | "the-halal-way" | "marry-timely" | "trust-in-allah";
const beforeSubs: { key: BeforeSub; label: string; icon: React.ReactNode }[] = [
  { key: "what-to-look-for", label: "What to Look For", icon: <Eye size={14} /> },
  { key: "who-you-can-marry", label: "Who You Can Marry", icon: <Users size={14} /> },
  { key: "forbidden-marriages", label: "Forbidden Marriage Types", icon: <Ban size={14} /> },
  { key: "the-halal-way", label: "The Halal Way", icon: <ShieldHalf size={14} /> },
  { key: "marry-timely", label: "Marry Timely", icon: <Clock size={14} /> },
  { key: "trust-in-allah", label: "Trust in Allah", icon: <Sparkles size={14} /> },
];

type WeddingSub = "the-nikah" | "the-walimah" | "celebration" | "dua-for-newlyweds";
const weddingSubs: { key: WeddingSub; label: string; icon: React.ReactNode }[] = [
  { key: "the-nikah", label: "The Nikah", icon: <FileText size={14} /> },
  { key: "the-walimah", label: "The Walimah", icon: <Users size={14} /> },
  { key: "celebration", label: "Celebration & the Wedding Night", icon: <Music size={14} /> },
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

type MarriedLifeSub = "prophet-as-husband" | "intimacy" | "permitted" | "privacy" | "dua-before-intimacy" | "purity" | "menses-planning" | "resolving-conflict" | "polygyny";
const marriedLifeSubs: { key: MarriedLifeSub; label: string; icon: React.ReactNode }[] = [
  { key: "prophet-as-husband", label: "The Prophet ﷺ as a Husband", icon: <Sparkles size={14} /> },
  { key: "intimacy", label: "Intimacy in Islam", icon: <Heart size={14} /> },
  { key: "permitted", label: "Permitted & Not", icon: <Scale size={14} /> },
  { key: "privacy", label: "Privacy of the Bedroom", icon: <Lock size={14} /> },
  { key: "dua-before-intimacy", label: "Du'a Before Intimacy", icon: <HandHeart size={14} /> },
  { key: "purity", label: "Purity Afterwards", icon: <Droplets size={14} /> },
  { key: "menses-planning", label: "Menses & Family Planning", icon: <Moon size={14} /> },
  { key: "resolving-conflict", label: "When Marriage Struggles", icon: <HeartHandshake size={14} /> },
  { key: "polygyny", label: "Polygyny & Justice", icon: <Scale size={14} /> },
];

type DivorceSub = "last-resort" | "three-talaqs" | "khul" | "common-questions" | "after-divorce";
const divorceSubs: { key: DivorceSub; label: string; icon: React.ReactNode }[] = [
  { key: "last-resort", label: "A Last Resort", icon: <AlertTriangle size={14} /> },
  { key: "three-talaqs", label: "The Three Talaqs", icon: <Ban size={14} /> },
  { key: "khul", label: "Khul'", icon: <ArrowRightLeft size={14} /> },
  { key: "common-questions", label: "Common Questions", icon: <HelpCircle size={14} /> },
  { key: "after-divorce", label: "Iddah & Widowhood", icon: <Clock size={14} /> },
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

function WhoYouCanMarry() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">The Mahram Categories</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Quran itself lists the relatives a Muslim may never marry (one&apos;s <span className="text-gold font-medium">mahrams</span>):
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;It is prohibited for you [to marry] your mothers, your daughters, your sisters, your paternal and maternal aunts, your brother&apos;s daughters, your sister&apos;s daughters, your foster mothers, your foster sisters, your mothers-in-law, your step-daughters under your guardianship if you have consummated the marriage with their mothers... nor wives of your own sons, nor two sisters together...&quot;
        </p>
        <Ref text="Quran 4:23" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          The verses before and after complete the list: a man may not marry a woman his father was married to (Quran 4:22), nor a woman who is already married (Quran 4:24). Everyone outside these categories is, in principle, marriageable.
        </p>
        <Link href="/quran/4" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Read Surah An-Nisa →
        </Link>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Milk-Kinship (Fosterage)</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          A woman who breastfed you in infancy becomes your foster mother, and her children your foster siblings — with the same marriage prohibitions as blood relatives. When it was suggested the Prophet &#xFDFA; marry Hamza&apos;s daughter, he said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;I am not legally permitted to marry her, as foster relations are treated like blood relations (in marital affairs). She is the daughter of my foster brother.&quot;
        </p>
        <Ref text="Bukhari 52:9; Muslim 17:16" />
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Not a Woman Together With Her Aunt</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Beyond the permanent prohibitions, some combinations are forbidden while both women are alive and married to the same man:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;The Prophet &#xFDFA; forbade that a woman should be married to a man along with her paternal aunt or with her maternal aunt (at the same time).&quot;
        </p>
        <Ref text="Bukhari 67:48" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          The Quran likewise forbids being married to two sisters at once (Quran 4:23).
        </p>
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">Marrying Outside the Faith</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Quran forbids marriage to polytheists:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Do not marry polytheist women until they believe; for a believing slave woman is better than a free polytheist, even though she may attract you. And do not give your women in marriage to polytheist men until they believe...&quot;
        </p>
        <Ref text="Quran 2:221" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          One exception is given for men: marriage to <span className="text-gold font-medium">chaste women of the People of the Book</span> (Jews and Christians):
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;And [it is lawful to marry] chaste believing women and chaste women from among those who were given the Book before you, provided that you give them their dowries in honest wedlock...&quot;
        </p>
        <Ref text="Quran 5:5" />
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          No parallel exception is given for Muslim women — by scholarly consensus a Muslim woman marries only a Muslim man. And even for men, many contemporary scholars counsel caution about interfaith marriage in practice (raising the children, mutual religious life). Speak to a knowledgeable scholar about your specific situation.
        </p>
      </ContentCard>
    </div>
  );
}

function ForbiddenMarriages() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">Mut&apos;ah — Temporary Marriage</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          A &quot;marriage&quot; contracted for a fixed period was permitted in the earliest years of Islam and then prohibited. Ali ibn Abi Talib reported:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;On the day of Khaibar, Allah&apos;s Messenger &#xFDFA; forbade the Mut&apos;a (i.e. temporary marriage) and the eating of donkey-meat.&quot;
        </p>
        <Ref text="Bukhari 64:256; Bukhari 67:52" />
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          Note: This is a point of genuine divergence between Sunni and Shia Islam — Sunni scholarship across all four madhhabs holds mut&apos;ah to be abrogated and impermissible, while Twelver Shia jurisprudence permits it. A valid Sunni nikah has no expiry date: marriage is entered as a lifelong commitment.
        </p>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Shighar — Exchange Marriage</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Trading daughters or sisters in marriage so that neither pays a mahr treats women as currency, and the Prophet &#xFDFA; forbade it:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Allah&apos;s Messenger &#xFDFA; forbade Ash-Shighar, which means that somebody marries his daughter to somebody else, and the latter marries his daughter to the former without paying Mahr.&quot; And he said: &quot;There is no Shighar in Islam.&quot;
        </p>
        <Ref text="Bukhari 67:49; Muslim 16:67; Muslim 16:70" />
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Proposing Over Your Brother&apos;s Proposal</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          While a brother&apos;s marriage proposal is pending, it is not lawful to move in on it:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;A believer is the brother of a believer, so it is not lawful for a believer to outbid his brother, and he should not propose an engagement when his brother has thus proposed until he gives it up.&quot;
        </p>
        <Ref text="Muslim 16:66" />
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">Secret &quot;Marriages&quot;</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Arrangements designed to stay hidden — no wali, no witnesses, no announcement — fail the very conditions that make a nikah valid. The Prophet &#xFDFA; commanded: &quot;Announce the marriage&quot; (Tirmidhi 11:10). If a &quot;marriage&quot; must be kept secret from everyone, that is a warning sign, not a technicality.
        </p>
        <Link href="/marriage?tab=wedding&sub=the-nikah" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          What makes a nikah valid →
        </Link>
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

      <ContentCard delay={0.25}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-gold font-semibold text-sm mb-2">A Du&apos;a for a Righteous Spouse</h4>
            <p className="text-themed-muted text-sm leading-relaxed">
              The Quran teaches the du&apos;a of the servants of the Most Merciful — the most beloved words for the one asking Allah for a righteous spouse and family:
            </p>
            <p className="font-arabic text-gold text-lg leading-loose mt-2 mb-1">
              وَٱلَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعْيُنٍ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا
            </p>
            <p className="text-themed font-medium text-sm italic">
              &quot;Our Lord, let our spouses and children be a source of joy for us, and make us good examples for the righteous.&quot;
            </p>
            <Ref text="Quran 25:74" />
            <Link href="/quran/25" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
              Read Surah Al-Furqan →
            </Link>
          </div>
          <BookmarkButton type="hadith" id="marriage-dua-righteous-spouse" title="Du'a for a Righteous Spouse" subtitle="Marriage" href="/marriage?tab=before&sub=trust-in-allah" />
        </div>
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

      <ContentCard delay={0.3}>
        <h4 className="text-gold font-semibold text-sm mb-2">Stipulated Conditions in the Contract</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Conditions agreed in the marriage contract carry real weight. The Prophet &#xFDFA; said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;From among all the conditions which you have to fulfill, the conditions which make it legal for you to have sexual relations (i.e. the marriage contract) have the greatest right to be fulfilled.&quot;
        </p>
        <Ref text="Bukhari 54:10" />
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          The madhhabs differ on which stipulations are binding (e.g. continuing studies, remaining in one&apos;s city) — the Hanbali school enforces the widest range. If a condition matters to you, discuss it before the nikah and consult a scholar about how to word it.
        </p>
      </ContentCard>

      <ContentCard delay={0.35}>
        <h4 className="text-gold font-semibold text-sm mb-2">When a Woman Has No Wali</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Many convert sisters have no Muslim father or male relative. The Sunnah itself answers this:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;There is no marriage except with a guardian... And the ruler is the guardian of the one who does not have a guardian.&quot;
        </p>
        <Ref text="Ibn Majah 9:36" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          In practice today, the &quot;ruler&quot; role is filled by the Islamic authority available to her — a qadi, or commonly the imam of her local community — who acts as her wali. A woman without a Muslim relative is not left without a path to marriage.
        </p>
      </ContentCard>

      <ContentCard delay={0.4}>
        <h4 className="text-gold font-semibold text-sm mb-2">Civil Marriage & the Nikah</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          A civil (registry) marriage and the nikah answer different questions: the nikah makes the marriage valid before Allah, while civil registration gives it legal standing in your country — protecting rights like inheritance and spousal status. Scholars generally encourage registering the marriage civilly alongside the nikah, and communities differ on whether a civil ceremony that meets the nikah&apos;s conditions (consent, wali, mahr, witnesses) itself counts as one. Ask your local imam how the two are handled where you live.
        </p>
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

function WeddingCelebration() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">Celebrate Openly — With the Duff</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Joy at a wedding is not merely tolerated — it is commanded. The Prophet &#xFDFA; said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Publicize this marriage, and hold it in the Masjid, and beat the Duff for it.&quot;
        </p>
        <Ref text="Tirmidhi 11:10" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          He &#xFDFA; also made the celebration itself the public marker of a lawful union:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;The distinction between the lawful and the unlawful is the Duff and the voice.&quot;
        </p>
        <Ref text="Tirmidhi 11:9" />
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Singing at the Wedding</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Ar-Rubayyi&apos; bint Muawwidh described her own wedding:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;After the consummation of my marriage, the Prophet &#xFDFA; came and sat on my bed... and our little girls started beating the tambourines and reciting elegiac verses mourning my father who had been killed in the battle of Badr. One of them said, &apos;Among us is a Prophet who knows what will happen tomorrow.&apos; On that the Prophet &#xFDFA; said, &apos;Leave this (saying) and keep on saying the verses which you had been saying before.&apos;&quot;
        </p>
        <Ref text="Bukhari 67:82" />
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          He &#xFDFA; approved the duff and the singing, correcting only the line that ascribed knowledge of the unseen to him. Scholars draw the limits of wedding celebration from evidences like this: wholesome words, no free mixing of the sexes in ways Islam prohibits, and nothing that contradicts the Shariah — with details differing between scholars, so ask locally about specific practices.
        </p>
      </ContentCard>

      <ContentCard delay={0.15}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-gold font-semibold text-sm mb-2">The Groom&apos;s Du&apos;a for His Bride</h4>
            <p className="text-themed-muted text-sm leading-relaxed">
              From the Sunnah of the wedding night: the Prophet &#xFDFA; taught that when one of you marries a woman, he should say —
            </p>
            <p className="font-arabic text-gold text-lg leading-loose mt-2 mb-1">
              اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَمِنْ شَرِّ مَا جَبَلْتَهَا عَلَيْهِ
            </p>
            <p className="text-themed font-medium text-sm italic">
              &quot;O Allah, I ask You for the good in her, and in the disposition You have given her; I take refuge in You from the evil in her, and in the disposition You have given her.&quot;
            </p>
            <Ref text="Abu Dawud 12:115" />
            <p className="text-themed-muted text-sm mt-2 leading-relaxed">
              A version adds that he should place his hand on her forelock and pray for blessing.
            </p>
          </div>
          <BookmarkButton type="hadith" id="marriage-groom-dua-bride" title="Groom's Du'a for His Bride" subtitle="Marriage" href="/marriage?tab=wedding&sub=celebration" />
        </div>
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">The First Night — Gentleness</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          There is no required checklist beyond the du&apos;a — the Sunnah&apos;s spirit for the wedding night is kindness, patience, and putting a nervous spouse at ease (see how the Prophet &#xFDFA; sat and chatted at ar-Rubayyi&apos;s wedding gathering above). Nothing should be rushed or forced. When intimacy comes, its own du&apos;a and etiquettes apply.
        </p>
        <Link href="/marriage?tab=married-life&sub=dua-before-intimacy" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Du&apos;a before intimacy →
        </Link>
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
        <h4 className="text-gold font-semibold text-sm mb-2">Voluntary Fasting & Admitting Guests</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Two rights the Prophet &#xFDFA; joined in one hadith:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;It is not lawful for a lady to fast (Nawafil) without the permission of her husband when he is at home; and she should not allow anyone to enter his house except with his permission...&quot;
        </p>
        <Ref text="Bukhari 67:129; Bukhari 67:126" />
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          This concerns voluntary fasts while he is present — obligatory fasts like Ramadan need no permission. The wisdom scholars mention: voluntary fasting cuts off his right to intimacy, so it is not taken up unilaterally while he is home.
        </p>
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">Intimacy Between Spouses</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Intimacy is a mutual right of both spouses — including the hadith on not refusing without a valid excuse. This topic now lives in the Married Life tab.
        </p>
        <Link href="/marriage?tab=married-life&sub=intimacy" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Read in Married Life →
        </Link>
      </ContentCard>

      <ContentCard delay={0.25}>
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
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-gold font-semibold text-sm mb-2">&quot;Feed Her When You Eat&quot;</h4>
            <p className="text-themed-muted text-sm leading-relaxed">
              Mu&apos;awiyah al-Qushayri asked the Prophet &#xFDFA;: &quot;Messenger of Allah, what is the right of the wife of one of us over him?&quot; He replied:
            </p>
            <p className="text-themed font-medium text-sm mt-2 italic">
              &quot;That you should give her food when you eat, clothe her when you clothe yourself, do not strike her on the face, do not revile her or separate yourself from her except in the house.&quot;
            </p>
            <Ref text="Abu Dawud 12:97" />
            <p className="text-themed-muted text-sm mt-2 leading-relaxed">
              Her standard of living is tied to his own — whatever he has, she shares in. And even at the lowest point of conflict, insult and public humiliation are forbidden: any &quot;separation&quot; is limited to the bed, within the home.
            </p>
          </div>
          <BookmarkButton type="hadith" id="marriage-qushayri-wife-rights" title="Feed Her When You Eat" subtitle="Marriage" href="/marriage?tab=wife-rights&sub=specific-rights" />
        </div>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Even Against a Stingy Husband</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Maintenance is a right the wife may claim, not a favor she must beg for. Hind bint Utbah complained:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;O Allah&apos;s Messenger &#xFDFA;! Abu Sufyan is a miser so is it sinful of me to feed our children from his property?&quot; Allah&apos;s Messenger &#xFDFA; said: &quot;No, except if you take for your needs what is just and reasonable.&quot;
        </p>
        <Ref text="Bukhari 69:9; Bukhari 46:21" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          Scholars derive from this that a wife whose husband withholds what she and her children genuinely need may take a reasonable amount from his wealth — without extravagance — even without his knowledge.
        </p>
      </ContentCard>

      <ContentCard delay={0.2}>
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

      <ContentCard delay={0.25}>
        <h4 className="text-gold font-semibold text-sm mb-2">No Harm or Mistreatment</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Islam absolutely prohibits any form of abuse — physical, emotional, or verbal. The Prophet &#xFDFA; never struck a woman or a servant.
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;The Messenger of Allah &#xFDFA; never struck anything with his hand, neither a servant nor a woman.&quot;
        </p>
        <Ref text="Muslim 43:108" />
      </ContentCard>

      <ContentCard delay={0.3}>
        <h4 className="text-gold font-semibold text-sm mb-2">Emotional & Spiritual Care</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          A husband should be gentle, patient, and supportive. The Prophet &#xFDFA; used to help with housework, mend his own shoes, and was playful and kind with his wives.
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          Aishah was asked: &quot;What did the Prophet &#xFDFA; do at home?&quot; She said: &quot;He used to be at the service of his family, and when the time for prayer came, he would go out to pray.&quot;
        </p>
        <Ref text="Bukhari 10:70" />
      </ContentCard>

      <ContentCard delay={0.35}>
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

function ProphetAsHusbandView() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-gold font-semibold text-sm mb-2">He Raced His Wife</h4>
            <p className="text-themed-muted text-sm leading-relaxed">
              Aishah, while on a journey with the Messenger of Allah &#xFDFA;, said:
            </p>
            <p className="text-themed font-medium text-sm mt-2 italic">
              &quot;I had a race with him (the Prophet &#xFDFA;) and I outstripped him on my feet. When I became fleshy, (again) I had a race with him and he outstripped me. He said: This is for that outstripping.&quot;
            </p>
            <Ref text="Abu Dawud 15:102; Ibn Majah 9:135" />
            <p className="text-themed-muted text-sm mt-2 leading-relaxed">
              The best of creation, the leader of a community — and he raced his wife for fun, and remembered the score years later. Playfulness is Sunnah.
            </p>
          </div>
          <BookmarkButton type="hadith" id="marriage-prophet-raced-aishah" title="He Raced His Wife" subtitle="Marriage" href="/marriage?tab=married-life&sub=prophet-as-husband" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">The Shared Cup</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Aishah reported:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;I would drink when I was menstruating, then I would hand it (the vessel) to the Apostle &#xFDFA; and he would put his mouth where mine had been, and drink; and I would eat flesh from a bone when I was menstruating, then hand it over to the Apostle &#xFDFA; and he would put his mouth where mine had been.&quot;
        </p>
        <Ref text="Muslim 3:14" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          A deliberate, tender gesture — he sought out the exact spot her lips had touched, and during her menses at that, when other communities of the time shunned menstruating women entirely.
        </p>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">His Head in Her Lap</h4>
        <p className="text-themed font-medium text-sm italic">
          &quot;The Prophet &#xFDFA; used to recite the Qur&apos;an with his head in my lap while I used to be in my periods (having menses).&quot;
        </p>
        <Ref text="Bukhari 97:174" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          Worship and affection were not separate compartments of his life — the Quran itself was recited resting against his wife.
        </p>
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">&quot;I Am to You as Abu Zar&apos; Was to Umm Zar&apos;&quot;</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Aishah once related to him the long story of eleven women who described their husbands — the best of them was Abu Zar&apos;, whose wife Umm Zar&apos; described his generosity and kindness at length. The Prophet &#xFDFA; listened to the whole tale, then said to her:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;I am to you as Abu Zar&apos; was to his wife Umm Zar&apos;.&quot;
        </p>
        <Ref text="Bukhari 67:123; Muslim 44:135" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          He listened to a long, winding story from his wife with full attention — and then reassured her of his love at the end of it. Both halves are the Sunnah.
        </p>
      </ContentCard>

      <ContentCard delay={0.25}>
        <h4 className="text-gold font-semibold text-sm mb-2">At the Service of His Family</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          When Aishah was asked what the Prophet &#xFDFA; did at home, she said he used to be at the service of his family — mending, helping, working — until the call to prayer.
        </p>
        <Link href="/marriage?tab=wife-rights&sub=specific-rights" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Read the hadith in Wife&apos;s Rights →
        </Link>
      </ContentCard>
    </div>
  );
}

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

function ResolvingConflictView() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-gold font-semibold text-sm mb-2">The Rib — Gentleness, Not Forcing Change</h4>
            <p className="text-themed-muted text-sm leading-relaxed">
              The Prophet &#xFDFA; said:
            </p>
            <p className="text-themed font-medium text-sm mt-2 italic">
              &quot;The woman is like a rib; if you try to straighten her, she will break. So if you want to get benefit from her, do so while she still has some crookedness.&quot;
            </p>
            <Ref text="Bukhari 67:119; Muslim 17:77" />
            <p className="text-themed-muted text-sm mt-2 leading-relaxed">
              Scholars explain this as a command of gentleness, not a criticism: your spouse will never be a remodeled version of themselves. Trying to force a personality straight breaks the marriage. Live with the person you married — differences included — and take the good that is really there.
            </p>
          </div>
          <BookmarkButton type="hadith" id="marriage-rib-hadith" title="The Rib — Gentleness" subtitle="Marriage" href="/marriage?tab=married-life&sub=resolving-conflict" />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Do Not Hate — Weigh the Whole Person</h4>
        <p className="text-themed font-medium text-sm italic">
          &quot;A believing man should not hate a believing woman; if he dislikes one of her characteristics, he will be pleased with another.&quot;
        </p>
        <Ref text="Muslim 17:81" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          In conflict, the mind fixates on the one trait that hurts. The Prophet &#xFDFA; commands the opposite discipline: hold the whole person in view. The same applies to a wife weighing her husband.
        </p>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Reconciliation Is Best</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Quran addresses the wife who fears her husband is turning away — and names its own preference:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;If a woman fears ill-treatment or indifference on her husband&apos;s part, there is no blame on them to reach an amicable reconciliation between themselves, for reconciliation is best...&quot;
        </p>
        <Ref text="Quran 4:128" />
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">Bring In the Families — Arbiters Before Lawyers</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          When a couple cannot resolve things alone, the Quran prescribes structured mediation before anyone speaks of divorce:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;If you fear a breach between them, appoint an arbitrator from his family and another from hers. If they both want reconciliation, Allah will bring harmony between them.&quot;
        </p>
        <Ref text="Quran 4:35" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          One trusted person from each side, both sincerely wanting repair — and Allah Himself promises to grant the reconciliation. Today this can mean elders, an imam, or a Muslim marriage counselor. Seeking help is not a failure; it is the Quran&apos;s own instruction.
        </p>
      </ContentCard>

      <ContentCard delay={0.25}>
        <h4 className="text-gold font-semibold text-sm mb-2">In-Laws & Boundaries</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Much marital conflict is really extended-family conflict. The Prophet &#xFDFA; set a firm boundary around a wife&apos;s privacy with respect to her husband&apos;s male relatives:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Beware of entering upon women.&quot; A man from the Ansar said: &quot;O Messenger of Allah! What do you think about the Hamu (the husband&apos;s male in-laws)?&quot; So he said: &quot;The Hamu is death.&quot;
        </p>
        <Ref text="Tirmidhi 12:26" />
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          Scholars also note that serving her in-laws is kindness from a wife, not a contractual obligation — and that a husband honoring his parents must not come at the cost of wronging his wife, nor her rights at the cost of his parents&apos;. Clear, kind boundaries protect everyone. For a specific family situation, seek advice from a knowledgeable scholar.
        </p>
      </ContentCard>

      <ContentCard delay={0.3}>
        <h4 className="text-gold font-semibold text-sm mb-2">If, After All This, It Cannot Be Repaired</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Divorce exists in Islam precisely because some marriages cannot be saved — but it comes after counsel, patience, and arbitration, not instead of them.
        </p>
        <Link href="/marriage?tab=divorce&sub=last-resort" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Divorce — a last resort →
        </Link>
      </ContentCard>
    </div>
  );
}

function PolygynyView() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">The Permission — and Its Condition</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Quran permits a man up to four wives — in a verse revealed about justice toward orphans, and hedged by justice on every side:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;If you fear that you may not maintain justice with orphan girls [by marrying them] then marry women of your choice — two, three, or four; but if you fear that you may not maintain justice, then marry only one... That is more likely to avoid committing injustice.&quot;
        </p>
        <Ref text="Quran 4:3" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          The permission is real, and so is the condition: equal treatment in maintenance, housing, and time. One who fears he cannot be just is directed by the verse itself to one wife.
        </p>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Perfect Justice Is Impossible</h4>
        <p className="text-themed font-medium text-sm italic">
          &quot;You will never be able to maintain absolute justice between your wives, no matter how keen you are. So do not completely incline to one leaving the other in suspense...&quot;
        </p>
        <Ref text="Quran 4:129" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          Scholars reconcile the two verses: the justice demanded in Quran 4:3 is in outward, controllable matters (spending, nights, housing); the justice declared impossible in 4:129 is the heart&apos;s inclination — which is why the verse forbids acting on that inclination, not having it.
        </p>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">The Warning for Injustice</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Prophet &#xFDFA; said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;When a man has two wives and he is inclined to one of them, he will come on the Day of Resurrection with a side hanging down.&quot;
        </p>
        <Ref text="Abu Dawud 12:88; Tirmidhi 11:63" />
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          Polygyny in Islam is a regulated permission, not a command or an ideal for every man — most Muslim marriages, in the Prophet&apos;s &#xFDFA; community and today, are monogamous. Anyone considering it carries the full weight of these texts, along with the laws of his country and the rights of the wife he already has. This is a decision to take with scholarly counsel, not alone.
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
        <Link href="/marriage?tab=married-life&sub=resolving-conflict" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          When marriage struggles — repairing before parting →
        </Link>
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

function DivorceCommonQuestions() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <h4 className="text-gold font-semibold text-sm mb-2">&quot;I Was Only Joking&quot; — Does It Count?</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Talaq is not a word to play with. The Prophet &#xFDFA; said:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;There are three matters in which seriousness is serious and joking is serious: marriage, divorce and taking back (one&apos;s wife).&quot;
        </p>
        <Ref text="Ibn Majah 10:24" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          A talaq pronounced in jest still takes effect according to the majority of scholars, based on this hadith. The word carries its weight whether or not the heart was behind it.
        </p>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">Talaq Spoken in Anger</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Most divorces are pronounced in anger — and the ruling depends on the degree. Scholars distinguish ordinary anger (in which a man knows what he is saying: the talaq counts, by broad agreement) from extreme rage in which he no longer comprehends his own words — many scholars, drawing on the principle that acts require sound intent, hold such a talaq does not take effect, while others are stricter.
        </p>
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          This page cannot rule on your situation — whether a specific pronouncement counted is exactly the kind of question that must go to a qualified scholar or Islamic judge, with the details laid out honestly. Do not decide it yourself in either direction.
        </p>
      </ContentCard>

      <ContentCard delay={0.15}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-gold font-semibold text-sm mb-2">Who Keeps the Children?</h4>
            <p className="text-themed-muted text-sm leading-relaxed">
              A divorced mother came to the Prophet &#xFDFA; and said: &quot;Messenger of Allah, my womb is a vessel to this son of mine, my breasts a water-skin for him, and my lap a guard for him, yet his father has divorced me and wants to take him away from me.&quot; He replied:
            </p>
            <p className="text-themed font-medium text-sm mt-2 italic">
              &quot;You have more right to him as long as you do not marry.&quot;
            </p>
            <Ref text="Abu Dawud 13:102" />
            <p className="text-themed-muted text-sm mt-2 leading-relaxed">
              Young children generally remain with their mother. Beyond this anchor text the madhhabs differ on the age at which custody shifts, the child&apos;s own say, and the effect of either parent remarrying — and the father remains responsible for the children&apos;s maintenance throughout. Custody disputes should go to a scholar or Islamic judge (and be handled lawfully in your country), with the child&apos;s welfare first.
            </p>
          </div>
          <BookmarkButton type="hadith" id="marriage-mother-custody" title="The Mother's Right to Custody" subtitle="Marriage" href="/marriage?tab=divorce&sub=common-questions" />
        </div>
      </ContentCard>

      <ContentCard delay={0.2}>
        <h4 className="text-gold font-semibold text-sm mb-2">The Parting Gift (Mut&apos;at at-Talaq)</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Even divorce before consummation comes with a command of generosity:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;There is no sin on you if you divorce women before you have consummated the marriage or the dowry has been fixed; but give them a [gift of] compensation — the wealthy according to his means and the poor according to his means — a reasonable compensation is an obligation upon those who do good.&quot;
        </p>
        <Ref text="Quran 2:236" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          Scholars differ on when this gift is obligatory versus recommended in other divorces — but the spirit is unambiguous: a Muslim leaves a marriage with generosity, not scorched earth.
        </p>
      </ContentCard>

      <ContentCard delay={0.25}>
        <h4 className="text-gold font-semibold text-sm mb-2">Other Rulings: Zihar, Ila&apos;, and Li&apos;an</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          The Quran also legislates for three rarer marital situations:
        </p>
        <ul className="list-disc list-inside text-themed-muted text-sm leading-relaxed mt-2 space-y-2">
          <li>
            <span className="text-gold font-medium">Zihar</span> — declaring one&apos;s wife &quot;like my mother&apos;s back&quot; (a pre-Islamic pseudo-divorce). The Quran calls the words &quot;abhorrent and false&quot; and imposes an expiation — freeing a slave, or fasting two consecutive months, or feeding sixty needy people — before the couple may resume relations. <span className="text-themed-muted/70">(Quran 58:1-4)</span>
          </li>
          <li>
            <span className="text-gold font-medium">Ila&apos;</span> — an oath to abstain from one&apos;s wife. A maximum of four months is set: then he returns (and expiates his oath) or the matter proceeds to divorce. A wife cannot be left suspended indefinitely. <span className="text-themed-muted/70">(Quran 2:226-227)</span>
          </li>
          <li>
            <span className="text-gold font-medium">Li&apos;an</span> — when a husband accuses his wife of adultery with no witnesses: each swears four oaths, with a fifth invoking Allah&apos;s curse or wrath on themselves if lying; she is spared punishment by her oath, and the marriage is permanently dissolved. <span className="text-themed-muted/70">(Quran 24:6-9)</span>
          </li>
        </ul>
        <Ref text="Quran 58:1-4; Quran 2:226-227; Quran 24:6-9" />
        <p className="text-themed-muted/70 text-xs mt-2 italic">
          The fiqh details of all three are extensive and differ between the madhhabs; this is an orientation, not a manual. Anyone actually facing one of these situations must sit with a qualified scholar.
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
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          For women who do not menstruate — past menopause or not yet menstruating — the iddah is three months instead:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;As for those women from among you who reached their menopause, in case you doubt, their waiting period is three months, as well as of those who have not yet menstruated. As for pregnant women, their waiting period ends with delivery.&quot;
        </p>
        <Ref text="Quran 65:4" />
      </ContentCard>

      <ContentCard delay={0.1}>
        <h4 className="text-gold font-semibold text-sm mb-2">The Widow&apos;s Iddah — Four Months and Ten Days</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          A wife whose husband passes away observes a different waiting period, fixed by the Quran itself:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;Those among you who pass away and leave behind widows should refrain from remarrying for four months and ten days. When they have completed their waiting period, there is no sin on you concerning what they do for themselves in a reasonable manner.&quot;
        </p>
        <Ref text="Quran 2:234" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          For a pregnant widow, the majority of scholars hold that her iddah ends when she gives birth, based on Quran 65:4 — a widow expecting a child should confirm her specific timeline with a scholar.
        </p>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h4 className="text-gold font-semibold text-sm mb-2">Mourning (Ihdad)</h4>
        <p className="text-themed-muted text-sm leading-relaxed">
          Mourning a husband is set apart from all other grief:
        </p>
        <p className="text-themed font-medium text-sm mt-2 italic">
          &quot;It is not legal for a woman who believes in Allah and the Last Day to mourn for any dead person for more than three days except for her husband, (for whom she should mourn) for four months and ten days.&quot;
        </p>
        <Ref text="Bukhari 23:42; Bukhari 68:79-80" />
        <p className="text-themed-muted text-sm mt-2 leading-relaxed">
          During this period the widow refrains from adornment — perfume, beautification, and remarriage — as the companions&apos; wives described doing. It is a mark of the marriage bond&apos;s sanctity, and it ends completely when the iddah does: after it, remarriage and normal life are fully hers again.
        </p>
        <Link href="/death-rites" className="inline-block mt-2 text-xs text-gold hover:text-gold/80 underline underline-offset-2">
          Death, grief & the rites — the Death Rites page →
        </Link>
      </ContentCard>

      <ContentCard delay={0.2}>
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
  "who-you-can-marry": [
    { ref: "Quran 4:22-24", desc: "The prohibited categories of marriage" },
    { ref: "Bukhari 52:9", desc: "Foster relations are treated like blood relations" },
    { ref: "Muslim 17:16", desc: "Hamza's daughter unlawful by reason of fosterage" },
    { ref: "Bukhari 67:48", desc: "Not a woman together with her paternal or maternal aunt" },
    { ref: "Quran 2:221", desc: "No marriage to polytheists until they believe" },
    { ref: "Quran 5:5", desc: "Chaste women of the People of the Book" },
  ],
  "forbidden-marriages": [
    { ref: "Bukhari 64:256", desc: "Mut'ah (temporary marriage) forbidden at Khaybar" },
    { ref: "Bukhari 67:52", desc: "Ali's report of the prohibition of mut'ah" },
    { ref: "Bukhari 67:49", desc: "Shighar (exchange marriage) forbidden" },
    { ref: "Muslim 16:70", desc: "There is no shighar in Islam" },
    { ref: "Muslim 16:66", desc: "Do not propose over the proposal of your brother" },
    { ref: "Tirmidhi 11:10", desc: "Announce the marriage" },
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
    { ref: "Quran 25:74", desc: "Our Lord, let our spouses and children be a source of joy for us" },
  ],
};

const weddingSources: Record<WeddingSub, SourceRef[]> = {
  "the-nikah": [
    { ref: "Bukhari 67:72", desc: "Consent of the bride must be sought" },
    { ref: "Abu Dawud 12:40", desc: "No marriage without the permission of a guardian" },
    { ref: "Bukhari 67:25", desc: "The mahr — even an iron ring or teaching Quran" },
    { ref: "Tirmidhi 11:10", desc: "Announce the marriage" },
    { ref: "Bukhari 54:10", desc: "The conditions most deserving of fulfillment — the marriage contract" },
    { ref: "Ibn Majah 9:36", desc: "The ruler is the guardian of the one who has no guardian" },
  ],
  "the-walimah": [
    { ref: "Bukhari 67:90", desc: "Give a walimah, even if with just one sheep" },
    { ref: "Abu Dawud 12:72", desc: "The best of marriage is that which is made easiest" },
  ],
  celebration: [
    { ref: "Tirmidhi 11:10", desc: "Publicize this marriage... and beat the duff for it" },
    { ref: "Tirmidhi 11:9", desc: "The distinction between the lawful and the unlawful is the duff and the voice" },
    { ref: "Bukhari 67:82", desc: "Girls beating the duff and singing at ar-Rubayyi's wedding" },
    { ref: "Abu Dawud 12:115", desc: "The groom's du'a — O Allah, I ask You for the good in her" },
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
    { ref: "Bukhari 67:129", desc: "Voluntary fasting and admitting guests only with his permission" },
    { ref: "Bukhari 67:126", desc: "No optional fasts without her husband's permission when he is present" },
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
    { ref: "Abu Dawud 12:97", desc: "Feed her when you eat, clothe her when you clothe yourself" },
    { ref: "Bukhari 69:9", desc: "Hind bint Utbah — take what is just and reasonable" },
    { ref: "Bukhari 46:21", desc: "Hind's case — spending from a stingy husband's property" },
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
  "common-questions": [
    { ref: "Ibn Majah 10:24", desc: "Three matters in which joking is serious: marriage, divorce, taking back" },
    { ref: "Abu Dawud 13:102", desc: "The mother's right to custody — 'you have more right to him'" },
    { ref: "Quran 2:236", desc: "The parting gift of divorce (mut'ah)" },
    { ref: "Quran 58:1-4", desc: "Zihar and its expiation" },
    { ref: "Quran 2:226-227", desc: "Ila' — the four-month limit on abstention oaths" },
    { ref: "Quran 24:6-9", desc: "Li'an — the mutual oaths of accusation" },
  ],
  "after-divorce": [
    { ref: "Quran 2:228", desc: "The iddah of three menstrual cycles" },
    { ref: "Quran 65:4", desc: "The iddah of the pregnant and the non-menstruating" },
    { ref: "Quran 2:234", desc: "The widow's iddah — four months and ten days" },
    { ref: "Bukhari 23:42", desc: "No mourning beyond three days except for a husband" },
    { ref: "Bukhari 68:79-80", desc: "The companions' wives on the widow's mourning" },
    { ref: "Quran 2:229", desc: "Either retain her with kindness or release her with grace" },
  ],
};

const marriedLifeSources: Record<MarriedLifeSub, SourceRef[]> = {
  "prophet-as-husband": [
    { ref: "Abu Dawud 15:102", desc: "Aishah's races with the Prophet ﷺ — 'this is for that outstripping'" },
    { ref: "Ibn Majah 9:135", desc: "The Prophet ﷺ raced with me and I beat him" },
    { ref: "Muslim 3:14", desc: "He drank from the spot where her mouth had been" },
    { ref: "Bukhari 97:174", desc: "Reciting Quran with his head in her lap during her menses" },
    { ref: "Bukhari 67:123", desc: "The Umm Zar' hadith — 'I am to you as Abu Zar' was to Umm Zar''" },
    { ref: "Muslim 44:135", desc: "Muslim's narration of the Umm Zar' hadith" },
  ],
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
  "resolving-conflict": [
    { ref: "Bukhari 67:119", desc: "The rib hadith — gentleness, not forcing change" },
    { ref: "Muslim 17:77", desc: "Muslim's narration of the rib hadith" },
    { ref: "Muslim 17:81", desc: "A believing man should not hate a believing woman" },
    { ref: "Quran 4:128", desc: "Amicable settlement when a wife fears aversion — reconciliation is best" },
    { ref: "Quran 4:35", desc: "An arbitrator from his family and another from hers" },
    { ref: "Tirmidhi 12:26", desc: "The hamu (in-law) is death — the khalwa boundary" },
  ],
  polygyny: [
    { ref: "Quran 4:3", desc: "Two, three, or four — but if you fear injustice, then one" },
    { ref: "Quran 4:129", desc: "You will never be able to maintain absolute justice between wives" },
    { ref: "Abu Dawud 12:88", desc: "The one inclined to one wife comes with a side hanging down" },
    { ref: "Tirmidhi 11:63", desc: "Tirmidhi's narration of the drooping-side warning" },
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
  "married-life": "prophet-as-husband",
  divorce: "last-resort",
};

/* ── Page search (Rule 2): the rail is filtered by label + per-view keywords;
   matching pills stay visible, non-matching hide, and the first match is
   auto-selected. Empty query restores everything. ── */
type SearchEntry = { tab: Tab; sub: string; label: string; keywords: string };

const searchIndex: SearchEntry[] = [
  { tab: "before", sub: "what-to-look-for", label: "What to Look For", keywords: "choose spouse religion character beauty wealth lineage look at her suitor proposal harmony" },
  { tab: "before", sub: "who-you-can-marry", label: "Who You Can Marry", keywords: "mahram prohibited categories relatives foster milk kinship breastfeeding aunt two sisters interfaith people of the book christian jewish polytheist convert" },
  { tab: "before", sub: "forbidden-marriages", label: "Forbidden Marriage Types", keywords: "mutah temporary marriage shighar exchange proposal over brother secret marriage invalid khaybar" },
  { tab: "before", sub: "the-halal-way", label: "The Halal Way", keywords: "wali guardian involve family no dating khalwa secret relationships chaperone istikhara" },
  { tab: "before", sub: "marry-timely", label: "Marry Timely", keywords: "young men afford lowers the gaze fasting half of faith do not delay sunnah" },
  { tab: "before", sub: "trust-in-allah", label: "Trust in Allah", keywords: "provision poverty allah enriches qadr decree written for you rizq trust plan dua righteous spouse comfort of eyes rabbana hab lana" },
  { tab: "wedding", sub: "the-nikah", label: "The Nikah", keywords: "marriage contract ceremony consent wali guardian mahr dowry witnesses announce khutbah conditions stipulations no wali convert imam ruler civil marriage registration" },
  { tab: "wedding", sub: "the-walimah", label: "The Walimah", keywords: "wedding feast banquet one sheep keep it simple celebration invitation" },
  { tab: "wedding", sub: "celebration", label: "Celebration & the Wedding Night", keywords: "duff tambourine singing music wedding night first night groom dua bride forelock allowed at wedding" },
  { tab: "wedding", sub: "dua-for-newlyweds", label: "Dua for Newlyweds", keywords: "barakallahu laka blessing congratulate couple supplication" },
  { tab: "husband-rights", sub: "status", label: "Status of the Husband", keywords: "prostrate magnitude right duty wife" },
  { tab: "husband-rights", sub: "specific-rights", label: "Specific Rights", keywords: "obedience in good guarding the home permission gratitude ingratitude intimacy voluntary fasting nawafil guests entering house" },
  { tab: "wife-rights", sub: "kind-treatment", label: "Kind Treatment", keywords: "best to their wives live with them in kindness farewell sermon fear allah concerning women" },
  { tab: "wife-rights", sub: "specific-rights", label: "Specific Rights", keywords: "nafaqah financial support housing food clothing mahr belongs to her no harm abuse never struck emotional care housework feed her when you eat clothe do not strike face revile hind bint utbah stingy miser maintenance" },
  { tab: "married-life", sub: "prophet-as-husband", label: "The Prophet ﷺ as a Husband", keywords: "racing aishah shared cup drank same spot lap menses umm zar abu zar playful affection example home life" },
  { tab: "married-life", sub: "intimacy", label: "Intimacy in Islam", keywords: "charity mutual right refusing excuse foreplay tenderness affection" },
  { tab: "married-life", sub: "permitted", label: "Permitted & Not", keywords: "garments tilth menstruation anal forbidden lawful manner" },
  { tab: "married-life", sub: "privacy", label: "Privacy of the Bedroom", keywords: "secrets spreading worst of people confidentiality" },
  { tab: "married-life", sub: "dua-before-intimacy", label: "Du'a Before Intimacy", keywords: "bismillah shaytan protection child supplication" },
  { tab: "married-life", sub: "purity", label: "Purity Afterwards", keywords: "ghusl janabah wudu between emission ritual bath" },
  { tab: "married-life", sub: "menses-planning", label: "Menses & Family Planning", keywords: "menstruation period azl contraception family planning" },
  { tab: "married-life", sub: "resolving-conflict", label: "When Marriage Struggles", keywords: "conflict argument fighting rib gentleness do not hate reconciliation arbitration counseling mediation in-laws hamu mother in law boundaries struggling problems" },
  { tab: "married-life", sub: "polygyny", label: "Polygyny & Justice", keywords: "polygyny polygamy multiple wives two three four justice equal treatment cowife inclination" },
  { tab: "divorce", sub: "last-resort", label: "A Last Resort", keywords: "divorce disliked steps counsel separate beds arbitrators mediation" },
  { tab: "divorce", sub: "three-talaqs", label: "The Three Talaqs", keywords: "talaq iddah ruju taking back irrevocable three at once sinful purity" },
  { tab: "divorce", sub: "khul", label: "Khul'", keywords: "wife initiated divorce return mahr thabit ibn qays garden" },
  { tab: "divorce", sub: "common-questions", label: "Common Questions", keywords: "joking jest anger talaq counts custody children mother right parting gift compensation zihar ila lian oath accusation" },
  { tab: "divorce", sub: "after-divorce", label: "Iddah & Widowhood", keywords: "iddah waiting period pregnant housing maintenance part with grace kindness widow widowhood four months ten days mourning ihdad husband died menopause" },
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
                  {activeBefore === "who-you-can-marry" && <WhoYouCanMarry />}
                  {activeBefore === "forbidden-marriages" && <ForbiddenMarriages />}
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
                  {activeWedding === "celebration" && <WeddingCelebration />}
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
                  {activeMarried === "prophet-as-husband" && <ProphetAsHusbandView />}
                  {activeMarried === "intimacy" && <IntimacyView />}
                  {activeMarried === "permitted" && <PermittedView />}
                  {activeMarried === "privacy" && <PrivacyView />}
                  {activeMarried === "dua-before-intimacy" && <DuaBeforeIntimacyView />}
                  {activeMarried === "purity" && <PurityView />}
                  {activeMarried === "menses-planning" && <MensesPlanningView />}
                  {activeMarried === "resolving-conflict" && <ResolvingConflictView />}
                  {activeMarried === "polygyny" && <PolygynyView />}
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
                  {activeDivorce === "common-questions" && <DivorceCommonQuestions />}
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
