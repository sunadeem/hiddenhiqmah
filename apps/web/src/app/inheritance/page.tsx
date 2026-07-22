"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
  Scroll,
  Users,
  Landmark,
  ListChecks,
  PieChart,
  FileText,
  HelpCircle,
  Calculator,
  Sparkles,
  Gavel,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES & TABS
   ═══════════════════════════════════════════════════════════════════ */

type MainTab = "foundations" | "shares" | "heirs" | "wasiyyah-faqs";
type RailTab = "foundations" | "shares" | "wasiyyah-faqs";
type FoundationsSub = "foundations" | "verses" | "before";
type SharesSub = "shares" | "special-cases" | "calculator";
type WasiyyahFaqsSub = "wasiyyah" | "making-legal" | "wisdom";

const mainTabs: { key: MainTab; label: string; icon: React.ReactNode }[] = [
  { key: "foundations", label: "Foundations", icon: <Landmark size={16} /> },
  { key: "shares", label: "The Shares", icon: <PieChart size={16} /> },
  { key: "heirs", label: "Heirs", icon: <Users size={16} /> },
  { key: "wasiyyah-faqs", label: "Wasiyyah & FAQs", icon: <FileText size={16} /> },
];

const foundationsSubs: { key: FoundationsSub; label: string; icon: React.ReactNode }[] = [
  { key: "foundations", label: "Foundations", icon: <Landmark size={16} /> },
  { key: "verses", label: "The Verses", icon: <Scroll size={16} /> },
  { key: "before", label: "Before Distribution", icon: <ListChecks size={16} /> },
];

const sharesSubs: { key: SharesSub; label: string; icon: React.ReactNode }[] = [
  { key: "shares", label: "The Shares", icon: <PieChart size={16} /> },
  { key: "special-cases", label: "Special Cases", icon: <Sparkles size={16} /> },
  { key: "calculator", label: "Calculator", icon: <Calculator size={16} /> },
];

const wasiyyahFaqsSubs: { key: WasiyyahFaqsSub; label: string; icon: React.ReactNode }[] = [
  { key: "wasiyyah", label: "Wasiyyah (Will)", icon: <FileText size={16} /> },
  { key: "making-legal", label: "Making It Legal", icon: <Gavel size={16} /> },
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
          href="/inheritance"
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
   TAB CONTENT (moved verbatim from /family → Inheritance)
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
          <h5 className="text-gold font-medium mb-2">Fire in the bellies — the orphans&apos; wealth</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Three verses before the shares are set out, Allah gives one of the sternest warnings in the Quran: those who devour orphans&apos; property unjustly &quot;only consume fire into their bellies.&quot; Mishandling an estate is not a paperwork error — it is swallowing fire. When a family divides wealth, the most vulnerable heirs (orphaned grandchildren, minor children, widows) are exactly the ones Allah shields here.
          </p>
          <Ref text="Quran 4:10" />
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">Wealth belongs to Allah</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The estate is not &quot;ours&quot; to distribute as we please. We are temporary stewards. Allah lays out the shares of His wealth among His servants — our job is to faithfully transmit it according to His instruction.
          </p>
        </ContentCard>
      </div>

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

      <h3 className="text-lg font-semibold text-themed mt-6 mb-3 px-1">Quran 4:8-10 — The verses beside the shares</h3>
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          Right before the fixed shares, the mushaf places three commands the fara&apos;id student meets first: gift the non-heirs who show up at the division (4:8), fear for helpless offspring as you would your own (4:9), and never devour orphans&apos; property (4:10). They frame the shares in mercy and fear of Allah.
        </p>
      </ContentCard>
      <div className="grid grid-cols-1 gap-3">
        <VerseCard
          arabic={"وَإِذَا حَضَرَ ٱلْقِسْمَةَ أُو۟لُوا۟ ٱلْقُرْبَىٰ وَٱلْيَتَـٰمَىٰ وَٱلْمَسَـٰكِينُ فَٱرْزُقُوهُم مِّنْهُ وَقُولُوا۟ لَهُمْ قَوْلًا مَّعْرُوفًا"}
          transliteration="Wa idha hadara al-qismata ulu al-qurba wal-yatama wal-masakinu farzuquhum minhu wa qulu lahum qawlan ma'rufa"
          english={"If at the time of distribution, [other] relatives, orphans, and the needy are present, give them something too, and speak to them kindly."}
          source="Quran 4:8"
          delay={0.08}
        />
        <VerseCard
          arabic={"وَلْيَخْشَ ٱلَّذِينَ لَوْ تَرَكُوا۟ مِنْ خَلْفِهِمْ ذُرِّيَّةً ضِعَـٰفًا خَافُوا۟ عَلَيْهِمْ فَلْيَتَّقُوا۟ ٱللَّهَ وَلْيَقُولُوا۟ قَوْلًا سَدِيدًا"}
          transliteration="Walyakhsha alladhina law taraku min khalfihim dhurriyyatan di'afan khafu 'alayhim, falyattaqu Allaha walyaqulu qawlan sadida"
          english={"And let those [in charge of orphans] be cautious just as they themselves would be concerned had they left helpless offspring behind; let them fear Allah and say words of justice."}
          source="Quran 4:9"
          delay={0.11}
        />
        <VerseCard
          arabic={"إِنَّ ٱلَّذِينَ يَأْكُلُونَ أَمْوَٰلَ ٱلْيَتَـٰمَىٰ ظُلْمًا إِنَّمَا يَأْكُلُونَ فِى بُطُونِهِمْ نَارًا ۖ وَسَيَصْلَوْنَ سَعِيرًا"}
          transliteration="Inna alladhina ya'kuluna amwala al-yatama zulman innama ya'kuluna fi butunihim nara, wa sayaslawna sa'ira"
          english={"Indeed, those who consume the orphans’ property unjustly, only consume fire into their bellies, and they will burn in a Blazing Fire."}
          source="Quran 4:10"
          delay={0.14}
        />
      </div>

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
          <h5 className="text-gold font-medium mb-2">2. Debts to people (Duyun al-&apos;ibad)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Debts owed to people <span className="text-gold">must be paid in full</span> before any inheritance distribution — even if it consumes the entire estate. The Prophet ﷺ refused to pray janazah over someone with unpaid debt until it was settled. The soul of a believer remains attached to debt until cleared.
          </p>
          <Ref text="Tirmidhi 10:114" />
        </ContentCard>
        <ContentCard delay={0.125}>
          <h5 className="text-gold font-medium mb-2">2b. Debts to Allah (Huquq Allah)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A practicing family must also settle the deceased&apos;s unpaid obligations of worship, treated as a debt owed to Allah: outstanding <span className="text-gold">zakah</span>, an unfulfilled <span className="text-gold">obligatory or vowed Hajj</span>, expiations (<span className="text-gold italic">kaffarah</span>), and missed obligatory fasts.
          </p>
          <ul className="text-themed-muted text-sm leading-relaxed list-disc pl-5 mt-2 space-y-1">
            <li><span className="text-gold">Vowed / obligatory Hajj:</span> when a woman said her mother died before performing a vowed Hajj, the Prophet ﷺ told her to perform it on her behalf and said &quot;…pay Allah&apos;s debt as He has more right to be paid.&quot;</li>
            <li><span className="text-gold">Missed fasts:</span> &quot;If anyone dies when some fast due from him has been unfulfilled, his heir must fast on his behalf&quot; — and Hajj may likewise be performed for a deceased parent who never fulfilled it.</li>
          </ul>
          <p className="text-themed-muted text-sm leading-relaxed mt-2">
            The schools differ on the details (e.g. whether heirs fast for the deceased or feed the poor from the estate); scholars agree these <span className="text-gold italic">huquq Allah</span> are not simply forgiven by death. For a specific estate, ask a scholar which obligations bind and how to discharge them.
          </p>
          <Ref text="Bukhari 28:32; Bukhari 28:33; Bukhari 30:59; Bukhari 30:60; Abu Dawud 22:70; Muslim 15:455; Muslim 15:456; Nasai 24:21" />
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
          <li>Debts (to people, and the debts to Allah — zakah, obligatory/vowed Hajj, kaffarah, missed fasts)</li>
          <li>Wasiyyah (≤ 1/3)</li>
          <li>Inheritance distribution</li>
        </ol>
      </ContentCard>

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

      <ContentCard delay={0.05} className="mt-3 border-gold/40">
        <h5 className="text-gold font-medium mb-2">What about the children of a son who died first?</h5>
        <p className="text-themed-muted text-sm leading-relaxed">
          A grandson or granddaughter through a son inherits <span className="text-gold">only when no son of the deceased is alive</span>. So if a man&apos;s son dies before him and that man later dies leaving other living sons, the orphaned grandchildren are blocked and take nothing by fixed shares. This painful, common case — and the remedy the tradition offers (a wasiyyah for them, and the <span className="text-gold italic">wasiyyah wajibah</span> statutes) — is covered under <span className="text-gold">Wasiyyah &amp; FAQs → Wisdom &amp; FAQs</span>.
        </p>
      </ContentCard>

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

      <ContentCard delay={0.05}>
        <h5 className="text-gold font-medium mb-2">Example 4 — A man dies leaving: wife, mother, father, no children</h5>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          This is the famous <span className="text-gold italic">Umariyyatan</span> (al-gharrawayn) case — spouse + both parents, no descendants.
        </p>
        <ol className="text-themed-muted text-sm leading-relaxed list-decimal pl-5 space-y-1">
          <li><span className="text-gold">Wife:</span> no descendants → <span className="font-mono text-gold">1/4</span></li>
          <li><span className="text-gold">Mother:</span> takes <span className="font-mono text-gold">1/3 of what remains after the wife</span>, not 1/3 of the whole — that is 1/3 × 3/4 = <span className="font-mono text-gold">1/4</span> (Umar&apos;s ruling, the majority view)</li>
          <li><span className="text-gold">Father:</span> asaba → the rest = 3/4 − 1/4 = <span className="font-mono text-gold">1/2</span></li>
        </ol>
        <p className="text-themed-muted text-sm leading-relaxed mt-3">
          On a $120,000 net estate: Wife = $30,000. Mother = $30,000. Father = $60,000. (With a husband instead of a wife the mother&apos;s slice becomes 1/3 of the remaining 1/2, i.e. 1/6 of the whole.)
        </p>
      </ContentCard>

      <ContentCard delay={0.05}>
        <h5 className="text-gold font-medium mb-2">Example 5 — A man dies leaving: 3 daughters, a paternal uncle (no sons)</h5>
        <ol className="text-themed-muted text-sm leading-relaxed list-decimal pl-5 space-y-1">
          <li><span className="text-gold">Three daughters:</span> no son, so they share the fixed <span className="font-mono text-gold">2/3</span> equally</li>
          <li><span className="text-gold">Paternal uncle:</span> the nearest male asaba → takes the remaining <span className="font-mono text-gold">1/3</span></li>
        </ol>
        <p className="text-themed-muted text-sm leading-relaxed mt-3">
          On a $90,000 net estate: Each daughter = $20,000. Uncle = $30,000. If there had been <span className="text-gold">no asaba at all</span> (no father, brother, uncle, etc.), that leftover 1/3 would return to the daughters by <span className="text-gold italic">radd</span> — see Example 7.
        </p>
      </ContentCard>

      <ContentCard delay={0.05}>
        <h5 className="text-gold font-medium mb-2">Example 6 — A woman dies leaving: husband, mother, one maternal sister (kalalah)</h5>
        <p className="text-themed-muted text-sm leading-relaxed mb-3">
          No children and no father, so the deceased is <span className="text-gold italic">kalalah</span> and the maternal side inherits by fixed share.
        </p>
        <ol className="text-themed-muted text-sm leading-relaxed list-decimal pl-5 space-y-1">
          <li><span className="text-gold">Husband:</span> no descendants → <span className="font-mono text-gold">1/2</span></li>
          <li><span className="text-gold">Mother:</span> no descendants and fewer than two siblings → <span className="font-mono text-gold">1/3</span></li>
          <li><span className="text-gold">Maternal sister:</span> one alone → <span className="font-mono text-gold">1/6</span></li>
        </ol>
        <p className="text-themed-muted text-sm leading-relaxed mt-3">
          Shares total 1/2 + 1/3 + 1/6 = 1 exactly. On a $60,000 net estate: Husband = $30,000. Mother = $20,000. Maternal sister = $10,000.
        </p>
      </ContentCard>

      <ContentCard delay={0.05}>
        <h5 className="text-gold font-medium mb-2">Example 7 — A woman dies leaving: one daughter, mother, no spouse and no asaba (radd)</h5>
        <ol className="text-themed-muted text-sm leading-relaxed list-decimal pl-5 space-y-1">
          <li><span className="text-gold">Daughter:</span> only one, no son → <span className="font-mono text-gold">1/2</span></li>
          <li><span className="text-gold">Mother:</span> descendant present → <span className="font-mono text-gold">1/6</span></li>
          <li>Fixed shares total 1/2 + 1/6 = <span className="font-mono">2/3</span>. With no asaba to take the leftover 1/3, the surplus returns to the fixed-share heirs in proportion — this is <span className="text-gold italic">radd</span>. Reduce the base to the sum of shares (3/6 + 1/6 = 4/6): daughter <span className="font-mono text-gold">3/4</span>, mother <span className="font-mono text-gold">1/4</span>.</li>
        </ol>
        <p className="text-themed-muted text-sm leading-relaxed mt-3">
          On an $80,000 net estate: Daughter = $60,000. Mother = $20,000. (A spouse never shares in radd — the surplus would then pass on to the state treasury / be handled per the local scholarly view. The Hanafi and much of the later tradition apply radd; consult a specialist.)
        </p>
      </ContentCard>

      <ContentCard delay={0.05} className="mt-4 border-gold/40">
        <h5 className="text-gold font-medium mb-2">When in doubt, consult a specialist</h5>
        <p className="text-themed-muted text-sm leading-relaxed">
          The shares are simple in theory but the interactions can be intricate — <span className="text-gold italic">awl</span> (when shares exceed 1, all are reduced proportionally), <span className="text-gold italic">radd</span> (when shares total less than 1 and there are no asaba, fixed-share heirs receive the surplus proportionally), and special cases like the <span className="text-gold italic">gharrawayn</span> (the two glittering ones) all require care. For any actual death, consult a Muslim scholar trained in <span className="text-gold italic">fara&apos;id</span> or an Islamic estate planner.
        </p>
      </ContentCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   THE SHARES → SPECIAL CASES (classical fara'id doctrine; framed as
   positions, no invented narrations — see genericItems)
   ═══════════════════════════════════════════════════════════════════ */

function SpecialCasesTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05} className="border-gold/40">
        <p className="text-themed-muted text-sm leading-relaxed">
          The moment you try a real calculation you meet the classical &quot;hard cases.&quot; These are matters of <span className="text-gold">fiqh reasoning</span> where the schools sometimes differ — the summaries below are teaching positions, <span className="text-gold">not a fatwa</span> for any specific estate. For an actual death, a trained <span className="text-gold italic">fara&apos;id</span> scholar must run the numbers.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">Awl — when the shares overflow</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Sometimes the fixed fractions add up to <span className="text-gold">more than one</span> (e.g. husband 1/2 + two full sisters 2/3). Rather than favour one heir, the base is enlarged and every share is reduced in the same proportion — so all heirs shrink together fairly. This is <span className="text-gold italic">awl</span>, first applied by Umar (RA) in consultation with the Companions.
          </p>
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">Radd — when shares fall short</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            The opposite case: fixed shares total <span className="text-gold">less than one</span> and there is no asaba to absorb the remainder. The surplus is returned (<span className="text-gold italic">radd</span>) to the fixed-share heirs in proportion — with the majority excluding the <span className="text-gold">spouse</span> from the return. Some early scholars sent the surplus to the treasury instead; most of the later tradition applies radd.
          </p>
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">Al-Gharrawayn / Umariyyatan</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            &quot;The two glittering ones&quot; — spouse + both parents, no descendants. Here the mother takes <span className="text-gold">1/3 of the remainder after the spouse</span>, not 1/3 of the whole, so she and the father keep the 2:1 relationship. This is Umar&apos;s ruling and the majority view; Ibn Abbas (RA) held she takes 1/3 of the entire estate. Worked in full as Example 4.
          </p>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">Grandfather with siblings</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When a grandfather inherits alongside the deceased&apos;s brothers and sisters, the Companions themselves differed. Abu Bakr (RA) treated the grandfather like a father, fully blocking the siblings; Ali and Zayd ibn Thabit (RA) let him share with them by intricate rules. The Hanafis follow the first view, the Shafi&apos;is and Hanbalis the second — a textbook case for a specialist.
          </p>
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">Simultaneous deaths</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            When two heirs die together (a car crash, a disaster) and it cannot be known who died first, the majority ruling — from Abu Bakr and Umar (RA) — is that <span className="text-gold">neither inherits from the other</span>; each estate passes only to the surviving heirs. A minority historically assumed an order. This is a live modern question best taken to a scholar with the facts.
          </p>
        </ContentCard>
        <ContentCard delay={0.23}>
          <h5 className="text-gold font-medium mb-2">The unborn child (al-haml)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A child in the womb at the time of death inherits <span className="text-gold">if it is born alive</span>. Distribution is paused, or a share is held back assuming the most favourable outcome (often reserving for twins), and settled once the child is born. The share is void if the child is stillborn.
          </p>
        </ContentCard>
        <ContentCard delay={0.26}>
          <h5 className="text-gold font-medium mb-2">The missing person (al-mafqud)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            An heir whose life or death is unknown is treated as alive for his own potential share (it is reserved) while the estate around him is settled cautiously. The schools set different waiting periods before he is judged legally dead and his own estate divided — again, a matter for a qualified judge or scholar.
          </p>
        </ContentCard>
        <ContentCard delay={0.29} className="border-gold/40">
          <h5 className="text-gold font-medium mb-2">This is not a fatwa</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Every case above turns on details a page cannot see. Use these summaries to understand the questions — never to settle a real inheritance. For an actual estate, consult a scholar trained in <span className="text-gold italic">fara&apos;id</span> or a qualified Islamic estate planner.
          </p>
        </ContentCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   THE SHARES → CALCULATOR (exact rational arithmetic; deliberately scoped
   to spouse + children + parents. Any case outside this set — grandchildren,
   siblings, grandparents, awl among many heirs — is NOT computed; the tool
   says so and defers to a specialist. Logic verified against onsite
   Examples 1, 2, 4, 5, 7.)
   ═══════════════════════════════════════════════════════════════════ */

type Fraction = { n: number; d: number };
const cgcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
const cfr = (n: number, d = 1): Fraction => { if (d < 0) { n = -n; d = -d; } const g = cgcd(n, d); return { n: n / g, d: d / g }; };
const cadd = (a: Fraction, b: Fraction) => cfr(a.n * b.d + b.n * a.d, a.d * b.d);
const csub = (a: Fraction, b: Fraction) => cfr(a.n * b.d - b.n * a.d, a.d * b.d);
const cmul = (a: Fraction, b: Fraction) => cfr(a.n * b.n, a.d * b.d);
const csign = (a: Fraction, b: Fraction) => a.n * b.d - b.n * a.d;
const cstr = (a: Fraction) => (a.n === 0 ? "0" : a.d === 1 ? `${a.n}` : `${a.n}/${a.d}`);
const cpct = (a: Fraction) => `${((a.n / a.d) * 100).toFixed(a.n % a.d === 0 ? 0 : 2)}%`;

type CalcInput = { spouse: "none" | "husband" | "wife"; sons: number; daughters: number; father: boolean; mother: boolean };
type CalcRow = { label: string; share: string; pct: string; each?: string };
type CalcResult = { ok: false; message: string } | { ok: true; rows: CalcRow[]; flags: string[] };

function computeShares(inp: CalcInput): CalcResult {
  const { spouse, sons, daughters, father, mother } = inp;
  const hasChild = sons > 0 || daughters > 0;
  const hasMale = sons > 0;
  const heirCount = (spouse !== "none" ? 1 : 0) + sons + daughters + (father ? 1 : 0) + (mother ? 1 : 0);
  if (heirCount === 0) return { ok: false, message: "Select at least one surviving heir to see the split." };
  if (spouse !== "none" && !hasChild && !father && !mother)
    return { ok: false, message: "A surviving spouse as the sole heir is a contested case (the surplus goes to the treasury or is returned by some scholars). Consult a fara'id specialist." };

  const fixed: Record<string, Fraction> = {};
  const flags = new Set<string>();
  const wifeLabel = "Wife (or wives, sharing equally)";

  let spouseShare = cfr(0);
  let spouseKey = "";
  if (spouse === "husband") { spouseShare = hasChild ? cfr(1, 4) : cfr(1, 2); spouseKey = "Husband"; fixed[spouseKey] = spouseShare; }
  else if (spouse === "wife") { spouseShare = hasChild ? cfr(1, 8) : cfr(1, 4); spouseKey = wifeLabel; fixed[spouseKey] = spouseShare; }

  const umar = !hasChild && spouse !== "none" && father && mother;
  if (mother) fixed["Mother"] = umar ? cmul(csub(cfr(1), spouseShare), cfr(1, 3)) : hasChild ? cfr(1, 6) : cfr(1, 3);
  if (umar) flags.add("umar");

  const dLabel = "Daughter" + (daughters > 1 ? `s (${daughters}, sharing equally)` : "");
  if (daughters > 0 && !hasMale) fixed[dLabel] = daughters === 1 ? cfr(1, 2) : cfr(2, 3);
  if (father && hasChild) fixed["Father"] = cfr(1, 6);

  let sumFixed = cfr(0);
  for (const k in fixed) sumFixed = cadd(sumFixed, fixed[k]);
  const residue = csub(cfr(1), sumFixed);

  const result: Record<string, Fraction> = { ...fixed };
  const eachOf: Record<string, Fraction> = {};

  if (hasMale) {
    const parts = sons * 2 + daughters;
    const perPart = cmul(residue, cfr(1, parts));
    if (sons > 0) { const t = cmul(perPart, cfr(sons * 2)); result[`Son${sons > 1 ? `s (${sons})` : ""}`] = t; if (sons > 1) eachOf[`Son${sons > 1 ? `s (${sons})` : ""}`] = cmul(perPart, cfr(2)); }
    if (daughters > 0) { const t = cmul(perPart, cfr(daughters)); result[`Daughter${daughters > 1 ? `s (${daughters})` : ""}`] = t; if (daughters > 1) eachOf[`Daughter${daughters > 1 ? `s (${daughters})` : ""}`] = perPart; }
  } else if (!hasChild) {
    if (father) { if (csign(residue, cfr(0)) < 0) flags.add("awl"); else result["Father"] = cadd(result["Father"] || cfr(0), residue); }
    else if (csign(residue, cfr(0)) > 0) flags.add("radd");
  } else {
    if (father) { if (csign(residue, cfr(0)) < 0) flags.add("awl"); else result["Father"] = cadd(result["Father"], residue); }
    else if (csign(residue, cfr(0)) > 0) flags.add("radd");
    else if (csign(residue, cfr(0)) < 0) flags.add("awl");
  }

  if (flags.has("awl")) for (const k in result) result[k] = cmul(result[k], cfr(sumFixed.d, sumFixed.n));

  if (flags.has("radd")) {
    let nonSpouseSum = cfr(0);
    for (const k in result) if (k !== spouseKey) nonSpouseSum = cadd(nonSpouseSum, result[k]);
    const target = spouseKey ? csub(cfr(1), result[spouseKey]) : cfr(1);
    if (nonSpouseSum.n !== 0) { const factor = cmul(target, cfr(nonSpouseSum.d, nonSpouseSum.n)); for (const k in result) if (k !== spouseKey) result[k] = cmul(result[k], factor); }
  }

  // per-daughter for the fixed (no-son) case
  if (daughters > 1 && !hasMale && result[dLabel]) eachOf[dLabel] = cmul(result[dLabel], cfr(1, daughters));

  const rows: CalcRow[] = Object.entries(result).map(([label, f]) => ({
    label, share: cstr(f), pct: cpct(f), each: eachOf[label] ? `${cstr(eachOf[label])} each` : undefined,
  }));
  return { ok: true, rows, flags: [...flags] };
}

function Stepper({ label, value, set, max = 12 }: { label: string; value: number; set: (n: number) => void; max?: number }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-themed-muted text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => set(Math.max(0, value - 1))} className="w-7 h-7 rounded border sidebar-border text-gold text-lg leading-none flex items-center justify-center hover:bg-gold/10" aria-label={`Decrease ${label}`}>−</button>
        <span className="font-mono text-gold w-6 text-center">{value}</span>
        <button type="button" onClick={() => set(Math.min(max, value + 1))} className="w-7 h-7 rounded border sidebar-border text-gold text-lg leading-none flex items-center justify-center hover:bg-gold/10" aria-label={`Increase ${label}`}>+</button>
      </div>
    </div>
  );
}

function CalculatorTab() {
  const [inp, setInp] = useState<CalcInput>({ spouse: "none", sons: 0, daughters: 0, father: false, mother: false });
  const res = computeShares(inp);
  const upd = (patch: Partial<CalcInput>) => setInp((p) => ({ ...p, ...patch }));

  return (
    <div className="space-y-4">
      <ContentCard delay={0.05} className="border-gold/40">
        <h5 className="text-gold font-medium mb-2">A teaching calculator — not a fatwa</h5>
        <p className="text-themed-muted text-sm leading-relaxed">
          This computes the exact Quranic shares for the <span className="text-gold">most common household</span>: a spouse, children, and parents. It deliberately does <span className="text-gold">not</span> handle grandchildren, siblings, grandparents, or other relatives — those (and the special cases) need a trained <span className="text-gold italic">fara&apos;id</span> scholar. Shares are shown before funeral costs, debts (to people and to Allah), and any wasiyyah are removed. For any real estate, verify with a specialist.
        </p>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-3">Who survives the deceased?</h5>
          <div className="mb-3">
            <p className="text-themed-muted text-sm mb-2">Spouse</p>
            <div className="flex gap-2 flex-wrap">
              {(["none", "husband", "wife"] as const).map((s) => (
                <button key={s} type="button" onClick={() => upd({ spouse: s })}
                  className={`px-3 py-1.5 rounded text-sm border transition-colors ${inp.spouse === s ? "bg-gold/20 border-gold text-gold" : "sidebar-border text-themed-muted hover:bg-gold/10"}`}>
                  {s === "none" ? "None" : s === "husband" ? "Husband" : "Wife"}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t sidebar-border pt-2">
            <Stepper label="Sons" value={inp.sons} set={(n) => upd({ sons: n })} />
            <Stepper label="Daughters" value={inp.daughters} set={(n) => upd({ daughters: n })} />
          </div>
          <div className="border-t sidebar-border pt-2 mt-1">
            <label className="flex items-center justify-between gap-3 py-1.5 cursor-pointer">
              <span className="text-themed-muted text-sm">Father alive</span>
              <input type="checkbox" checked={inp.father} onChange={(e) => upd({ father: e.target.checked })} className="accent-gold w-4 h-4" />
            </label>
            <label className="flex items-center justify-between gap-3 py-1.5 cursor-pointer">
              <span className="text-themed-muted text-sm">Mother alive</span>
              <input type="checkbox" checked={inp.mother} onChange={(e) => upd({ mother: e.target.checked })} className="accent-gold w-4 h-4" />
            </label>
          </div>
        </ContentCard>

        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-3">The split</h5>
          {!res.ok ? (
            <p className="text-themed-muted text-sm leading-relaxed">{res.message}</p>
          ) : (
            <>
              <div className="space-y-2">
                {res.rows.map((r) => (
                  <div key={r.label} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-themed-muted leading-relaxed">{r.label}{r.each && <span className="text-themed-muted/70"> — {r.each}</span>}</span>
                    <span className="font-mono text-gold shrink-0 text-right">{r.share}<span className="text-themed-muted/60"> · {r.pct}</span></span>
                  </div>
                ))}
              </div>
              {(res.flags.includes("awl") || res.flags.includes("radd") || res.flags.includes("umar")) && (
                <div className="mt-3 pt-3 border-t sidebar-border space-y-1.5">
                  {res.flags.includes("awl") && <p className="text-xs text-themed-muted"><span className="text-gold/80 font-medium">Awl:</span> the fixed shares overflowed one, so all were reduced proportionally. See Special Cases.</p>}
                  {res.flags.includes("radd") && <p className="text-xs text-themed-muted"><span className="text-gold/80 font-medium">Radd:</span> shares fell short of one with no residuary heir, so the surplus returned to the fixed-share heirs (the spouse is excluded from radd). See Special Cases.</p>}
                  {res.flags.includes("umar") && <p className="text-xs text-themed-muted"><span className="text-gold/80 font-medium">Umariyyatan:</span> spouse + both parents — the mother took a third of the remainder after the spouse (the majority view). See Special Cases.</p>}
                </div>
              )}
            </>
          )}
        </ContentCard>
      </div>

      <ContentCard delay={0.14} className="border-gold/40">
        <p className="text-themed-muted text-sm leading-relaxed">
          Selecting a sibling, grandchild, or grandparent is intentionally not possible here — their presence can block or change every share above. If your family includes anyone beyond a spouse, children, and parents, treat this result as incomplete and take the full facts to a <span className="text-gold italic">fara&apos;id</span> scholar or Islamic estate planner.
        </p>
      </ContentCard>
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
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">The consent exception, and going over 1/3</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Most fiqh manuals attach an exception to the two rules above: a bequest to an heir — or one exceeding a third — is <span className="text-gold">valid if the other heirs freely consent after the death</span>, once they own their shares and can waive part of them. The same principle governs a bequest above 1/3: the excess is void unless the heirs agree to let it stand. Some transmissions of the hadith add &quot;unless the heirs consent&quot;; scholars weigh this addition rather than treat it as firmly established, and it is the underlying <span className="text-gold italic">fiqh</span> — not one graded wording — that the schools rely on.
          </p>
          <p className="text-themed-muted text-sm leading-relaxed mt-2">
            Consent must be genuine and given <span className="text-gold">after</span> the death, never pressured. For a specific will, confirm the details with a scholar.
          </p>
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
        <ContentCard delay={0.38}>
          <h5 className="text-gold font-medium mb-2">Guardian for minor children (Wasi)</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            For most young Muslim parents this is the single biggest reason to write a will: <span className="text-gold">who raises your children if you die while they are minors</span>. Name a guardian (and a backup) you trust to bring them up upon Islam, and record your wishes for their upbringing, education, and the management of the wealth they inherit until they come of age.
          </p>
          <ul className="text-themed-muted text-sm leading-relaxed list-disc pl-5 mt-2 space-y-1">
            <li>The person who raises the child and the person who manages the child&apos;s inherited wealth can be two different, trusted people.</li>
            <li>Civil courts have the final say on custody — but a clearly stated preference in a valid will carries real weight with a judge.</li>
            <li>The scholars discuss <span className="text-gold italic">wisayah</span> (guardianship) in detail; arrangements vary by school and by country.</li>
          </ul>
          <p className="text-themed-muted text-sm leading-relaxed mt-2">
            This is a general summary, <span className="text-gold">not a fatwa</span> — settle the specifics of guardianship with a scholar and a local family-law professional.
          </p>
        </ContentCard>
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WASIYYAH & FAQs → MAKING IT LEGAL (civil-process guidance; framed
   with the onsite Bukhari 55:1 command — no religious citations invented)
   ═══════════════════════════════════════════════════════════════════ */

function MakingLegalTab() {
  return (
    <div className="space-y-4">
      <ContentCard delay={0.05}>
        <p className="text-themed-muted text-sm leading-relaxed">
          A wasiyyah only protects your family if a court will actually enforce it. In the US, UK, Canada, and similar jurisdictions, an Islamic will has no special status — it is a civil document that must meet civil formalities. The Prophet ﷺ told every Muslim not to pass even two nights without a written will; the steps below turn that command into an enforceable document.
        </p>
        <Ref text="Bukhari 55:1" />
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ContentCard delay={0.08}>
          <h5 className="text-gold font-medium mb-2">1. Meet the witnessing / signing rules</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Most jurisdictions require the will to be signed by you and witnessed by two adults who are not beneficiaries (some also allow or expect notarization). Get this wrong and the whole document can be thrown out — so follow your state or country&apos;s exact wording, or use a solicitor/attorney.
          </p>
        </ContentCard>
        <ContentCard delay={0.11}>
          <h5 className="text-gold font-medium mb-2">2. Use a vetted Islamic-will template</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Several Muslim legal organizations publish country-specific Islamic wills reviewed by both scholars and lawyers. Starting from one of these — rather than a generic form — makes sure the fara&apos;id shares, the ≤ 1/3 bequest, the executor, and the guardian clauses are all worded in a way local courts accept.
          </p>
        </ContentCard>
        <ContentCard delay={0.14}>
          <h5 className="text-gold font-medium mb-2">3. Mind beneficiary designations</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Retirement accounts (401(k), IRA, pensions), life insurance, and &quot;payable on death&quot; accounts usually pass by their <span className="text-gold">named beneficiary and bypass the will entirely</span>. Update those forms to match your Islamic distribution, or the money will go outside fara&apos;id no matter what your will says.
          </p>
        </ContentCard>
        <ContentCard delay={0.17}>
          <h5 className="text-gold font-medium mb-2">4. Joint ownership and trusts</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Jointly-owned property with a right of survivorship, and assets held in certain trusts, can also skip the will. A Muslim estate planner can structure these (tenancy in common, revocable trusts, etc.) so that your share still flows through the Islamic distribution.
          </p>
        </ContentCard>
        <ContentCard delay={0.2}>
          <h5 className="text-gold font-medium mb-2">5. Update after any move or major change</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            A will valid in one state or country may fail the formalities of another. Re-check it whenever you move jurisdictions, and revoke and replace (rather than scribble on) the old one — an outdated or ambiguously amended will invites disputes.
          </p>
        </ContentCard>
        <ContentCard delay={0.23} className="border-gold/40">
          <h5 className="text-gold font-medium mb-2">Get qualified help</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            This is general guidance, <span className="text-gold">not legal advice</span>. Laws differ by state, province, and country and change over time. Have your final will reviewed by a licensed attorney/solicitor in your jurisdiction and, for the shares, a scholar trained in <span className="text-gold italic">fara&apos;id</span>.
          </p>
        </ContentCard>
      </div>
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
          <h5 className="text-gold font-medium mb-2">My son died before me — do his children inherit?</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            By the fixed shares, <span className="text-gold">no</span>: grandchildren through a son are blocked whenever a son of the deceased is still alive (their uncles inherit, they do not). This is one of the most painful, common questions families face. The tradition&apos;s remedy is the wasiyyah: Allah tells us to give present non-heir relatives something and speak to them kindly (4:8), so a grandparent can leave the orphaned grandchildren up to a third of the estate by will.
          </p>
          <ul className="text-themed-muted text-sm leading-relaxed list-disc pl-5 mt-2 space-y-1">
            <li>Several Muslim-majority countries legislate a <span className="text-gold italic">wasiyyah wajibah</span> — an obligatory bequest to such grandchildren up to a third — but this is a modern statutory ijtihad, applied differently from place to place.</li>
            <li>Other heirs may also, after the death, gift part of their own shares to the grandchildren.</li>
          </ul>
          <p className="text-themed-muted text-sm leading-relaxed mt-2">
            This is a general answer, <span className="text-gold">not a fatwa</span>. The rulings differ by school and country — consult a scholar for your family&apos;s exact situation.
          </p>
          <Ref text="Quran 4:8" />
        </ContentCard>
        <ContentCard delay={0.32}>
          <h5 className="text-gold font-medium mb-2">Learn the rules — they will affect you</h5>
          <p className="text-themed-muted text-sm leading-relaxed">
            Most Muslims encounter inheritance only when someone dies — when emotions are high and clarity is low. Learn the basics now: who inherits, what fractions apply, what must happen before distribution. Two narrations urge exactly this: &quot;Learn the laws of inheritance and the Quran, and teach the people…&quot; and &quot;Learn about the inheritance and teach it, for it is half of knowledge…&quot;
          </p>
          <p className="text-themed-muted text-xs leading-relaxed mt-2 italic">
            Both narrations are graded weak (da&apos;if) by many hadith scholars, so they are taken as encouragement rather than binding proof; the obligation to learn what one needs still stands. Then put your own will in writing while you are healthy.
          </p>
          <Ref text="Tirmidhi 29:2; Ibn Majah 23:1" />
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
const foundationsSources: Record<FoundationsSub, SourceRef[]> = {
  foundations: [
    { ref: "Quran 4:7", desc: "Men and women each have an ordained share" },
    { ref: "Quran 4:10", desc: "Consuming orphans' property unjustly is fire in the bellies" },
    { ref: "Quran 4:11-12", desc: "The detailed shares of children, parents, and spouses" },
    { ref: "Quran 4:13", desc: "These are Allah's limits — obey and enter Paradise" },
    { ref: "Quran 4:14", desc: "Transgress His limits — enter the Fire" },
  ],
  verses: [
    { ref: "Quran 4:8", desc: "Give present non-heir relatives, orphans, and the needy something too" },
    { ref: "Quran 4:9", desc: "Fear for helpless offspring; say words of justice" },
    { ref: "Quran 4:10", desc: "Devouring orphans' wealth is swallowing fire" },
    { ref: "Quran 4:11", desc: "Shares of children and parents" },
    { ref: "Quran 4:12", desc: "Shares of spouses; kalalah (no descendants/ascendants)" },
    { ref: "Quran 4:176", desc: "Full sisters and siblings when no children or parents exist" },
  ],
  before: [
    { ref: "Quran 4:11", desc: "After any bequest and any debt — children/parents" },
    { ref: "Quran 4:12", desc: "After any bequest and any debt — spouses/kalalah" },
    { ref: "Bukhari 55:5", desc: "Wasiyyah limited to one-third — Sa'd ibn Abi Waqqas" },
    { ref: "Tirmidhi 10:114", desc: "Soul of believer attached to debt until paid" },
    { ref: "Bukhari 28:32", desc: "Perform the deceased's vowed Hajj — Allah's debt has more right to be paid" },
    { ref: "Bukhari 30:59", desc: "Whoever dies owing missed fasts, his guardian fasts on his behalf" },
    { ref: "Abu Dawud 22:70", desc: "The heir fasts on behalf of one who died with fasts unfulfilled" },
    { ref: "Muslim 15:455", desc: "Hajj performed on behalf of an aged/deceased parent" },
    { ref: "Nasai 24:21", desc: "The debt owed to Allah is more deserving of being paid" },
  ],
};

const sharesSources: Record<SharesSub, SourceRef[]> = {
  shares: [
    { ref: "Quran 4:11", desc: "Shares of children and parents" },
    { ref: "Quran 4:12", desc: "Shares of spouses and kalalah" },
    { ref: "Quran 4:176", desc: "Full and paternal sisters' shares" },
    { ref: "Bukhari 85:9", desc: "Give fixed shares first, remainder to nearest male relative" },
  ],
  "special-cases": [],
  calculator: [],
};

const wasiyyahFaqsSources: Record<WasiyyahFaqsSub, SourceRef[]> = {
  wasiyyah: [
    { ref: "Bukhari 55:1", desc: "A Muslim should not sleep two nights without his will" },
    { ref: "Bukhari 55:5", desc: "Sa'd ibn Abi Waqqas — bequest limited to one-third" },
    { ref: "Tirmidhi 30:5", desc: "No bequest for an heir" },
  ],
  "making-legal": [
    { ref: "Bukhari 55:1", desc: "The command to keep a written will — the basis for making it legal" },
  ],
  wisdom: [
    { ref: "Quran 4:8", desc: "Give present non-heir relatives something — basis of the wasiyyah for orphaned grandchildren" },
    { ref: "Quran 4:11", desc: "Lidh-dhakari mithlu hazzi al-unthayayn — and the financial context" },
    { ref: "Quran 4:14", desc: "Transgressing Allah's limits = the Fire" },
    { ref: "Bukhari 51:20", desc: "Be just among your children — Nu'man ibn Bashir" },
    { ref: "Bukhari 55:1", desc: "Keep your wasiyyah written down" },
    { ref: "Tirmidhi 29:2", desc: "Learn the laws of inheritance and teach them (graded weak)" },
    { ref: "Ibn Majah 23:1", desc: "Inheritance is half of knowledge (graded weak)" },
  ],
};

const subsByTab: Record<RailTab, readonly { key: string }[]> = {
  foundations: foundationsSubs,
  shares: sharesSubs,
  "wasiyyah-faqs": wasiyyahFaqsSubs,
};

const defaultSubs: Record<RailTab, string> = {
  foundations: "foundations",
  shares: "shares",
  "wasiyyah-faqs": "wasiyyah",
};

/* ── Page search (Rule 2): the tab strip + rail are filtered by label +
   per-view keywords; matching pills stay visible, non-matching hide, and the
   first match is auto-selected. Empty query restores everything. ── */
type SearchEntry = { tab: MainTab; sub?: string; label: string; keywords: string };

const searchIndex: SearchEntry[] = [
  { tab: "foundations", sub: "foundations", label: "Foundations", keywords: "ordained share sons daughters both inherit warning wealth belongs to allah faraid" },
  { tab: "foundations", sub: "verses", label: "The Verses", keywords: "quran 4:11 4:12 4:176 children parents spouses kalalah verses of inheritance" },
  { tab: "foundations", sub: "before", label: "Before Distribution", keywords: "order funeral expenses takfin debts duyun wasiyyah bequest distribution among heirs" },
  { tab: "shares", sub: "shares", label: "The Shares", keywords: "fixed shares fractions husband wife spouses children parents grandparents siblings kalalah asaba residuary worked examples half quarter eighth two-thirds sixth male double orphaned grandchild" },
  { tab: "shares", sub: "special-cases", label: "Special Cases", keywords: "awl radd gharrawayn umariyyatan grandfather with siblings simultaneous deaths unborn child al-haml missing person mafqud madhhab differences" },
  { tab: "shares", sub: "calculator", label: "Calculator", keywords: "inheritance calculator compute shares split spouse sons daughters father mother estate divide fractions tool" },
  { tab: "heirs", label: "Heirs", keywords: "categories ashab al-furud fixed-share asaba residuary dhu al-arham distant relatives who does not inherit non-muslim killer illegitimate divorced adopted" },
  { tab: "wasiyyah-faqs", sub: "wasiyyah", label: "Wasiyyah (Will)", keywords: "will command to have a will one third rule bequest no bequest to an heir consent exception executor wasiy guardian minor children wisayah debts declaration of faith update debts to allah zakah hajj fasting" },
  { tab: "wasiyyah-faqs", sub: "making-legal", label: "Making It Legal", keywords: "legally binding will us uk canada witnessing notarization template beneficiary designation retirement account life insurance trust joint ownership revocation jurisdiction attorney solicitor" },
  { tab: "wasiyyah-faqs", sub: "wisdom", label: "Wisdom & FAQs", keywords: "faq why male double female equal or more exclude daughter wife redistribute non-muslim country trusts joint property hibah gifts orphaned grandchild son died before father wasiyyah wajibah learn faraid half of knowledge" },
];

const isRailTab = (tab: MainTab): tab is RailTab =>
  tab === "foundations" || tab === "shares" || tab === "wasiyyah-faqs";

function InheritanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Deep-link support: ?tab= and ?sub= are the source of truth (read on mount,
  // written on every change), so in-page links and back/forward both work.
  const tabParam = searchParams.get("tab");
  const subParam = searchParams.get("sub");
  const activeMain: MainTab = mainTabs.some((t) => t.key === tabParam) ? (tabParam as MainTab) : "foundations";

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

  const activeFoundations = activeSubOf("foundations") as FoundationsSub;
  const activeShares = activeSubOf("shares") as SharesSub;
  const activeWasiyyahFaqs = activeSubOf("wasiyyah-faqs") as WasiyyahFaqsSub;

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
      (e) => e.tab === activeMain && (!isRailTab(activeMain) || e.sub === activeSubOf(activeMain))
    );
    if (currentVisible) return;
    const target = matches.find((e) => e.tab === activeMain) ?? matches[0];
    if (isRailTab(target.tab) && target.sub) {
      const sub = target.sub;
      setSubMemory((m) => ({ ...m, [target.tab]: sub }));
    }
    syncUrl(target.tab, isRailTab(target.tab) ? target.sub : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Inheritance"
        titleAr="الميراث"
        subtitle="The shares Allah decreed in the Quran — who inherits, the fixed fractions, the wasiyyah, and what must happen before distribution"
      />

      <VerseHero
        arabic="لِّلرِّجَالِ نَصِيبٌ مِّمَّا تَرَكَ ٱلْوَٰلِدَانِ وَٱلْأَقْرَبُونَ وَلِلنِّسَآءِ نَصِيبٌ مِّمَّا تَرَكَ ٱلْوَٰلِدَانِ وَٱلْأَقْرَبُونَ مِمَّا قَلَّ مِنْهُ أَوْ كَثُرَ ۚ نَصِيبًا مَّفْرُوضًا"
        text="Men have a share in what parents and relatives leave behind, and women have a share in what parents and relatives leave behind, whether it is little or much; an ordained share."
        reference="Quran 4:7"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search shares, heirs, wasiyyah..." className="mb-6" />

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
            {activeMain === "foundations" && (
              <>
                <SubTabLayout subs={foundationsSubs.filter((s) => subMatches("foundations", s.key))} activeSub={activeFoundations} setActiveSub={changeSub("foundations")}>
                  {activeFoundations === "foundations" && <FoundationsInheritanceTab />}
                  {activeFoundations === "verses" && <VersesInheritanceTab />}
                  {activeFoundations === "before" && <BeforeDistributionTab />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={foundationsSources[activeFoundations]} />
              </>
            )}
            {activeMain === "shares" && (
              <>
                <SubTabLayout subs={sharesSubs.filter((s) => subMatches("shares", s.key))} activeSub={activeShares} setActiveSub={changeSub("shares")}>
                  {activeShares === "shares" && <SharesTab />}
                  {activeShares === "special-cases" && <SpecialCasesTab />}
                  {activeShares === "calculator" && <CalculatorTab />}
                </SubTabLayout>
                {/* Full-width, per-selection sources with empty-list guard */}
                {sharesSources[activeShares].length > 0 && (
                  <SourcesCard className="mt-6" sources={sharesSources[activeShares]} />
                )}
              </>
            )}
            {activeMain === "heirs" && <HeirsTab />}
            {activeMain === "wasiyyah-faqs" && (
              <>
                <SubTabLayout subs={wasiyyahFaqsSubs.filter((s) => subMatches("wasiyyah-faqs", s.key))} activeSub={activeWasiyyahFaqs} setActiveSub={changeSub("wasiyyah-faqs")}>
                  {activeWasiyyahFaqs === "wasiyyah" && <WasiyyahTab />}
                  {activeWasiyyahFaqs === "making-legal" && <MakingLegalTab />}
                  {activeWasiyyahFaqs === "wisdom" && <WisdomInheritanceTab />}
                </SubTabLayout>
                {/* Full-width sources for the active sub-view, below the rail */}
                <SourcesCard className="mt-6" sources={wasiyyahFaqsSources[activeWasiyyahFaqs]} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function InheritancePage() {
  return (
    <Suspense>
      <InheritanceContent />
    </Suspense>
  );
}
