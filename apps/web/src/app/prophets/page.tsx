"use client";

import { useState, Suspense, type ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import Accordion from "@hidden-hiqmah/ui/components/Accordion";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import SubTabLayout from "@hidden-hiqmah/ui/components/SubTabLayout";
import { EmptyState } from "@hidden-hiqmah/ui/components/EmptyState";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { ArrowRight, GitBranch, Sparkles, HelpCircle, Users } from "lucide-react";
import { prophets } from "@hidden-hiqmah/content/prophets";

// Displayed verse heroes. Arabic + English are spliced byte-for-byte from
// packages/content/quran/verses by scripts at build-authoring time — never
// hand-typed — so they match the app's own Quran text exactly.
const VERSES: Record<string, { ar: string; en: string; ref: string }> = {"21:25": {"ar": "وَمَآ أَرْسَلْنَا مِن قَبْلِكَ مِن رَّسُولٍ إِلَّا نُوحِىٓ إِلَيْهِ أَنَّهُۥ لَآ إِلَـٰهَ إِلَّآ أَنَا۠ فَٱعْبُدُونِ", "en": "“We never sent before you [O Prophet] any messenger without revealing to him that none has the right to be worshiped except Me, so worship Me.”", "ref": "Quran 21:25"}, "18:65": {"ar": "فَوَجَدَا عَبْدًا مِّنْ عِبَادِنَآ ءَاتَيْنَـٰهُ رَحْمَةً مِّنْ عِندِنَا وَعَلَّمْنَـٰهُ مِن لَّدُنَّا عِلْمًا", "en": "There they found one of Our slaves upon whom We bestowed Our mercy and We taught him from Our Own knowledge.", "ref": "Quran 18:65"}, "18:83": {"ar": "وَيَسْـَٔلُونَكَ عَن ذِى ٱلْقَرْنَيْنِ ۖ قُلْ سَأَتْلُوا۟ عَلَيْكُم مِّنْهُ ذِكْرًا", "en": "They ask you about Dhul-Qarnayn. Say, “I will tell you something about him.”", "ref": "Quran 18:83"}, "31:12": {"ar": "وَلَقَدْ ءَاتَيْنَا لُقْمَـٰنَ ٱلْحِكْمَةَ أَنِ ٱشْكُرْ لِلَّهِ ۚ وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِۦ ۖ وَمَن كَفَرَ فَإِنَّ ٱللَّهَ غَنِىٌّ حَمِيدٌ", "en": "Indeed, We endowed Luqmān with wisdom, [saying], “Be grateful to Allah.” Whoever is grateful, it is only for his own good; and whoever is ungrateful, then Allah is Self-Sufficient, Praiseworthy.", "ref": "Quran 31:12"}, "3:42": {"ar": "وَإِذْ قَالَتِ ٱلْمَلَـٰٓئِكَةُ يَـٰمَرْيَمُ إِنَّ ٱللَّهَ ٱصْطَفَىٰكِ وَطَهَّرَكِ وَٱصْطَفَىٰكِ عَلَىٰ نِسَآءِ ٱلْعَـٰلَمِينَ", "en": "And [remember] when the angels said, “O Mary, Allah has chosen you, purified you, and chosen you over all women.", "ref": "Quran 3:42"}, "9:30": {"ar": "وَقَالَتِ ٱلْيَهُودُ عُزَيْرٌ ٱبْنُ ٱللَّهِ وَقَالَتِ ٱلنَّصَـٰرَى ٱلْمَسِيحُ ٱبْنُ ٱللَّهِ ۖ ذَٰلِكَ قَوْلُهُم بِأَفْوَٰهِهِمْ ۖ يُضَـٰهِـُٔونَ قَوْلَ ٱلَّذِينَ كَفَرُوا۟ مِن قَبْلُ ۚ قَـٰتَلَهُمُ ٱللَّهُ ۚ أَنَّىٰ يُؤْفَكُونَ", "en": "The Jews say, “Ezra is the son of Allah,” and the Christians say, “The Messiah is the son of Allah.” These are mere words that they utter, imitating the words of the disbelievers before them. May Allah ruin them; how can they be deluded?", "ref": "Quran 9:30"}, "2:247": {"ar": "وَقَالَ لَهُمْ نَبِيُّهُمْ إِنَّ ٱللَّهَ قَدْ بَعَثَ لَكُمْ طَالُوتَ مَلِكًا ۚ قَالُوٓا۟ أَنَّىٰ يَكُونُ لَهُ ٱلْمُلْكُ عَلَيْنَا وَنَحْنُ أَحَقُّ بِٱلْمُلْكِ مِنْهُ وَلَمْ يُؤْتَ سَعَةً مِّنَ ٱلْمَالِ ۚ قَالَ إِنَّ ٱللَّهَ ٱصْطَفَىٰهُ عَلَيْكُمْ وَزَادَهُۥ بَسْطَةً فِى ٱلْعِلْمِ وَٱلْجِسْمِ ۖ وَٱللَّهُ يُؤْتِى مُلْكَهُۥ مَن يَشَآءُ ۚ وَٱللَّهُ وَٰسِعٌ عَلِيمٌ", "en": "Their prophet said to them: “Allah has appointed Saul as your king.” They said: “How could he be a king over us when we are more deserving of kingship than him, and he has not been given affluence in wealth?” He said: “Allah has chosen him over you and has increased him abundantly in knowledge and physique. Allah gives kingship to whom He wills, and Allah is All-Encompassing, All-Knowing.”", "ref": "Quran 2:247"}, "18:9": {"ar": "أَمْ حَسِبْتَ أَنَّ أَصْحَـٰبَ ٱلْكَهْفِ وَٱلرَّقِيمِ كَانُوا۟ مِنْ ءَايَـٰتِنَا عَجَبًا", "en": "Do you think that the people of the Cave and the Inscription were of Our only wondrous signs?", "ref": "Quran 18:9"}, "4:158": {"ar": "بَل رَّفَعَهُ ٱللَّهُ إِلَيْهِ ۚ وَكَانَ ٱللَّهُ عَزِيزًا حَكِيمًا", "en": "Rather, Allah raised him up to Himself, and Allah is All-Mighty, All-Wise.", "ref": "Quran 4:158"}};

function getYearsAgo(date: string): string | null {
  // Extract the first year from the date string (handles ~2000–1800 BCE, ~9th century BCE, 570–632 CE, etc.)
  const currentYear = new Date().getFullYear();

  // Match "Xth century BCE/CE"
  const centuryMatch = date.match(/~?(\d+)(?:st|nd|rd|th)\s+century\s+(BCE|CE)/i);
  if (centuryMatch) {
    const century = parseInt(centuryMatch[1]);
    const isBCE = centuryMatch[2].toUpperCase() === "BCE";
    // Middle of the century
    const midYear = (century - 1) * 100 + 50;
    const yearsAgo = isBCE ? currentYear + midYear : currentYear - midYear;
    return `~${(yearsAgo / 1000).toFixed(1)}k yrs ago`;
  }

  // Match "~YYYY" or "YYYY" (first number in the string), with BCE/CE
  const yearMatch = date.match(/~?(\d{3,4})/);
  if (!yearMatch) return null;

  const year = parseInt(yearMatch[1]);
  const isBCE = date.includes("BCE");
  const isCE = date.includes("CE");

  if (!isBCE && !isCE) return null;

  const yearsAgo = isBCE ? currentYear + year : currentYear - year;

  if (yearsAgo >= 1000) {
    return `~${(yearsAgo / 1000).toFixed(1)}k yrs ago`;
  }
  return `~${yearsAgo} yrs ago`;
}

function VerseBlock({ id }: { id: string }) {
  const v = VERSES[id];
  if (!v) return null;
  return (
    <div className="rounded-lg p-4 my-3" style={{ backgroundColor: "var(--color-bg)" }}>
      <p className="text-base font-arabic text-gold leading-loose mb-2 text-right">{v.ar}</p>
      <p className="text-themed text-sm italic">&ldquo;{v.en}&rdquo;</p>
    </div>
  );
}

function XLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-accent text-xs font-medium hover:gap-2 transition-all border border-[var(--color-border)] rounded-full px-3 py-1"
    >
      {label} <ArrowRight size={12} />
    </Link>
  );
}

type Item = { id: string; title: string; subtitle?: string; search: string; children: ReactNode };

// ── Intro: what Muslims believe about the prophets ────────────────────────
const introItems: Item[] = [
  {
    id: "nabi-rasul",
    title: "A nabī and a rasūl — prophet vs messenger",
    subtitle: "Every messenger is a prophet, but not every prophet is a messenger",
    search: "nabi rasul prophet messenger difference definition what is a prophet human",
    children: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Islam teaches that Allah chose human beings to guide humanity back to Him. A{" "}
          <strong className="text-themed">nabī</strong> (prophet) receives revelation and calls
          people to the truth; a <strong className="text-themed">rasūl</strong> (messenger) is a
          prophet additionally sent with a new sacred law or to a people who had abandoned the
          message. Every messenger is a prophet, but not every prophet is a messenger. All of them
          were human — they ate, married, and died — and none shares in any part of Allah&rsquo;s
          divinity.
        </p>
        <VerseBlock id="21:25" />
      </div>
    ),
  },
  {
    id: "twenty-five",
    title: "Twenty-five named — and countless unnamed",
    subtitle: "The Quran names 25 prophets and says there were many more",
    search: "how many prophets twenty five 25 named unnamed 124000 hundred twenty four thousand number total",
    children: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          The Quran names twenty-five prophets, from Adam to Muhammad ﷺ, and states plainly that
          these are only some of the messengers Allah sent — others were never named to us (Quran
          4:164). The best-known figure for the total number of prophets is roughly{" "}
          <strong className="text-themed">124,000</strong>, reported in a long narration; scholars
          grade it differently, so it is mentioned as a report rather than a fixed article of belief
          (Ibn Hibban 361, graded Sahih by some scholars and Hasan by others).
        </p>
      </div>
    ),
  },
  {
    id: "ulul-azm",
    title: "The five of firm resolve — Ulū al-ʿAzm",
    subtitle: "Nuh, Ibrahim, Musa, Isa, and Muhammad ﷺ",
    search: "ulul azm firm resolve five greatest prophets nuh noah ibrahim abraham musa moses isa jesus muhammad covenant",
    children: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Five messengers are singled out for their steadfastness through the hardest trials:{" "}
          <strong className="text-themed">Nuh, Ibrahim, Musa, Isa, and Muhammad ﷺ</strong>. Allah
          names them together when He took a solemn covenant from the prophets (Quran 33:7), and He
          tells the Prophet ﷺ to be patient &ldquo;as the Messengers of Firm Resolve were
          patient&rdquo; (Quran 46:35).
        </p>
      </div>
    ),
  },
  {
    id: "one-message",
    title: "One message, from Adam to Muhammad ﷺ",
    subtitle: "The laws differed; the creed of tawhid never changed",
    search: "one message tawhid worship allah alone same religion brothers different mothers creed",
    children: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Every prophet brought the same core message — worship Allah alone and reject false gods.
          The laws and details changed with time and people, but the creed (tawḥīd) never did. The
          Prophet ﷺ said the prophets are like brothers from one father: &ldquo;their mothers are
          different, but their religion is one&rdquo; (Bukhari 60:113).
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/tawhid" label="What is tawhid" />
          <XLink href="/story-of-creation" label="How it began — Adam" />
        </div>
      </div>
    ),
  },
  {
    id: "seal",
    title: "The final prophet — no nabī after Muhammad ﷺ",
    subtitle: "The Seal of the Prophets; none came between Isa and him",
    search: "seal of the prophets last final khatam no prophet after muhammad between isa jesus",
    children: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          The Prophet ﷺ is the Seal of the Prophets. Of Isa (Jesus) he said, &ldquo;I am the nearest
          of all the people to the son of Mary&rdquo; and &ldquo;there has been no prophet between me
          and him&rdquo; (Bukhari 60:112). No prophet came between Isa and Muhammad ﷺ, and none will
          come after him.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/prophet-muhammad" label="The full seerah" />
          <XLink href="/articles-of-faith" label="Belief in the prophets" />
        </div>
      </div>
    ),
  },
  {
    id: "great-intercession",
    title: "The Great Intercession — the whole timeline in one scene",
    subtitle: "Humanity goes from Adam to Nuh to Ibrahim to Musa to Isa to Muhammad ﷺ",
    search: "great intercession shafaah day of judgment adam nuh ibrahim musa isa muhammad maqam mahmud resurrection",
    children: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          On the Day of Judgment the overwhelmed crowds will go from prophet to prophet seeking
          someone to ask Allah to begin the reckoning — first to Adam, then Nuh, Ibrahim, Musa, and
          Isa, each humbly passing them on, until they reach Muhammad ﷺ, who alone is granted the
          great intercession (Bukhari 97:39). It is the one moment that draws every prophet on this
          page into a single scene.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/day-of-judgement" label="The Intercession, in full" />
        </div>
      </div>
    ),
  },
];

const introSources = [
  { ref: "Quran 21:25", desc: "one message — worship Allah alone" },
  { ref: "Quran 4:164", desc: "messengers named and unnamed" },
  { ref: "Quran 33:7", desc: "the covenant of the five" },
  { ref: "Quran 46:35", desc: "the Messengers of Firm Resolve" },
  { ref: "Bukhari 60:112", desc: "no prophet between me and Isa" },
  { ref: "Bukhari 60:113", desc: "prophets are brothers, one religion" },
  { ref: "Bukhari 97:39", desc: "the Great Intercession" },
  { ref: "Ibn Hibban 361", desc: "the ~124,000 figure (graded Sahih/Hasan)" },
];

// ── Righteous figures whose prophethood scholars have debated ─────────────
type Figure = {
  id: string;
  name: string;
  nameAr: string;
  badge: string;
  search: string;
  body: ReactNode;
};

const figures: Figure[] = [
  {
    id: "khidr",
    name: "Al-Khidr",
    nameAr: "الخضر",
    badge: "Prophethood debated",
    search: "khidr khadir green man musa moses surah kahf boat boy wall hidden knowledge teacher junction two seas",
    body: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Al-Khidr is the mysterious servant of Allah whom Musa travelled to learn from — &ldquo;one
          of Our slaves upon whom We bestowed Our mercy and We taught him from Our Own
          knowledge&rdquo; (Quran 18:65). He scuttled a boat, took a boy&rsquo;s life, and rebuilt a
          falling wall — each act baffling Musa until Khidr revealed the hidden wisdom behind it, a
          lesson that a prophet like Musa was still shown there is knowledge beyond his own. The full
          journey opens the middle of Surah al-Kahf and is narrated in detail in Bukhari 3:16; Bukhari 3:20.
        </p>
        <VerseBlock id="18:65" />
        <p>
          Scholars differ on whether Khidr was a prophet (nabī) receiving revelation or a righteous{" "}
          walī (friend of Allah) given special knowledge. Most Quran commentators lean towards his
          prophethood, since he acted on certain knowledge from Allah; others hold he was a righteous
          servant, not a prophet.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/prophets/musa" label="Prophet Musa" />
          <XLink href="/quran/18" label="Surah al-Kahf" />
        </div>
      </div>
    ),
  },
  {
    id: "dhul-qarnayn",
    name: "Dhul-Qarnayn",
    nameAr: "ذو القرنين",
    badge: "Prophethood debated",
    search: "dhul qarnayn two horned king barrier gog magog yajuj majuj iron copper surah kahf east west traveller",
    body: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Dhul-Qarnayn — &ldquo;the two-horned one&rdquo; — was a just and powerful ruler who
          travelled east and west judging with fairness, and built a great barrier of iron and molten
          copper to hold back the corrupting peoples of Gog and Magog (Yaʾjūj and Maʾjūj) until a
          time appointed by Allah. His story fills the closing of Surah al-Kahf (Quran 18:83 onward).
        </p>
        <VerseBlock id="18:83" />
        <p>
          Scholars debate whether he was a prophet or simply a righteous, Allah-guided king. Most
          classical commentators regard him as a righteous believing king rather than a prophet,
          while some counted him among the prophets. His identity in history is likewise disputed.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/quran/18" label="Surah al-Kahf" />
          <XLink href="/day-of-judgement" label="Gog & Magog — a sign" />
        </div>
      </div>
    ),
  },
  {
    id: "luqman",
    name: "Luqman",
    nameAr: "لقمان",
    badge: "Prophethood debated",
    search: "luqman luqmaan wise man wisdom hakim advice to son shirk parents prayer humility surah 31",
    body: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Luqman is the sage whom Allah endowed with wisdom (Quran 31:12) and after whom an entire
          surah is named. Its most beloved passage is his tender advice to his son: never associate
          anything with Allah, be dutiful to your parents, establish the prayer, stay humble, and
          lower your voice (Quran 31:13 onward).
        </p>
        <VerseBlock id="31:12" />
        <p>
          The majority of scholars hold that Luqman was a wise, righteous man — a ḥakīm — and not a
          prophet, though a minority counted him among the prophets.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/quran/31" label="Surah Luqman" />
          <XLink href="/family" label="Raising righteous children" />
        </div>
      </div>
    ),
  },
  {
    id: "maryam",
    name: "Maryam",
    nameAr: "مريم",
    badge: "Not a prophet — the best of women",
    search: "maryam mary mother of isa jesus virgin chosen purified best of women siddiqah surah 19 imran",
    body: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Maryam, the mother of Isa (Jesus), is the only woman named in the Quran, and a whole surah
          bears her name. Allah chose her, purified her, and chose her above all women (Quran 3:42),
          and gave her Isa without a father, breathing into her of His spirit through the angel
          (Quran 66:12). She was a ṣiddīqah — a woman of the very highest truthfulness.
        </p>
        <VerseBlock id="3:42" />
        <p>
          The mainstream position is that Maryam was not a prophet, since prophethood was given to
          men; a minority of scholars held that she received a form of revelation through the angel,
          but this is not the majority view. Either way she is honoured as the greatest of women.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/prophets/isa" label="Prophet Isa" />
          <XLink href="/women" label="Women in Islam" />
        </div>
      </div>
    ),
  },
  {
    id: "uzair",
    name: "Uzair",
    nameAr: "عزير",
    badge: "Debated identity",
    search: "uzair ezra son of allah revived hundred years town ruins resurrection sign surah 9 2 259",
    body: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Uzair — identified by many with the biblical Ezra — is named once in the Quran, rebuking
          those who called him &ldquo;the son of Allah,&rdquo; a claim Islam utterly rejects, for
          Allah has no son (Quran 9:30). Many commentators also identify him with the man in Quran
          2:259 whom Allah caused to die for a hundred years and then revived, as a living sign of
          the resurrection.
        </p>
        <VerseBlock id="9:30" />
        <p>
          Whether Uzair himself was a prophet is debated; the Quran does not settle it, and scholars
          have held differing views.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/quran/2" label="Surah al-Baqarah" />
          <XLink href="/day-of-judgement" label="Signs of resurrection" />
        </div>
      </div>
    ),
  },
  {
    id: "talut",
    name: "Talut",
    nameAr: "طالوت",
    badge: "A God-given king",
    search: "talut saul king israel jalut goliath dawud david battle chosen knowledge strength surah 2 247",
    body: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Talut (Saul) was the king Allah appointed over the Children of Israel to lead them into
          battle, chosen for his knowledge and strength rather than his wealth (Quran 2:247). Under
          his command the young Dawud struck down the giant Jalut (Goliath). Talut is remembered as a
          righteous, Allah-appointed leader — not as a prophet.
        </p>
        <VerseBlock id="2:247" />
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/prophets/dawud" label="Prophet Dawud" />
          <XLink href="/quran/2" label="Surah al-Baqarah" />
        </div>
      </div>
    ),
  },
  {
    id: "people-of-the-cave",
    name: "The People of the Cave",
    nameAr: "أصحاب الكهف",
    badge: "Righteous believers",
    search: "people of the cave ashab al kahf sleepers seven cave dog friday tyrant faith sleep years surah 18",
    body: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          The People of the Cave (Aṣḥāb al-Kahf) were young believers who fled a tyrant to preserve
          their faith in one God. Allah caused them to sleep in a cave for many years and then woke
          them — a sign of His power to give life after death. Their story opens Surah al-Kahf (Quran
          18:9 onward), the surah recommended to be read every Friday. They were righteous believers,
          not prophets.
        </p>
        <VerseBlock id="18:9" />
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/quran/18" label="Surah al-Kahf" />
        </div>
      </div>
    ),
  },
];

const figureSources = [
  { ref: "Quran 18:65", desc: "Al-Khidr, the servant given knowledge" },
  { ref: "Bukhari 3:16", desc: "Musa and Al-Khidr — the full journey" },
  { ref: "Bukhari 3:20", desc: "Musa and Al-Khidr (parallel narration)" },
  { ref: "Quran 18:83", desc: "Dhul-Qarnayn" },
  { ref: "Quran 31:12", desc: "Luqman endowed with wisdom" },
  { ref: "Quran 3:42", desc: "Maryam chosen above all women" },
  { ref: "Quran 66:12", desc: "Maryam who guarded her chastity" },
  { ref: "Quran 9:30", desc: "the false claim about Uzair" },
  { ref: "Quran 2:247", desc: "Talut appointed king" },
  { ref: "Quran 18:9", desc: "the People of the Cave" },
];

// ── FAQ ────────────────────────────────────────────────────────────────────
const faqItems: Item[] = [
  {
    id: "faq-sinless",
    title: "Are the prophets sinless (maʿṣūm)?",
    search: "are prophets sinless infallible isma protected sin adam yunus mistake minor major",
    children: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Muslims believe the prophets were protected (ʿiṣmah) from major sins and from anything that
          would undermine their message — they never worshipped other than Allah, and never lied in
          conveying revelation. Scholars discuss whether small slips occurred (such as Adam eating
          from the tree, or Yunus leaving his people); the mainstream view is that any such lapse was
          minor, was corrected at once, and that the prophets remain the finest of humanity and the
          models we are to follow.
        </p>
      </div>
    ),
  },
  {
    id: "faq-alive",
    title: "Which prophets are still alive?",
    search: "which prophets alive isa jesus raised heaven return descend idris enoch dead graves barzakh",
    children: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Isa (Jesus) was not killed or crucified — &ldquo;Allah raised him up to Himself&rdquo;
          (Quran 4:158) — and he will return before the Day of Judgment. Every other prophet has
          died, including Muhammad ﷺ. Authentic reports also describe the prophets as alive in their
          graves in a special barzakh life, which is not the same as remaining in this world.
        </p>
        <VerseBlock id="4:158" />
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/day-of-judgement" label="The return of Isa" />
          <XLink href="/barzakh" label="Life in the grave" />
        </div>
      </div>
    ),
  },
  {
    id: "faq-miracles",
    title: "Why were some prophets given miracles?",
    search: "why prophets miracles mujizah sign staff musa healing isa quran permission of allah proof",
    children: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          A miracle (muʿjizah) was a sign Allah gave to prove a prophet&rsquo;s truthfulness to his
          people — Musa&rsquo;s staff, Isa&rsquo;s healing, and the Quran itself. But no prophet could
          produce a sign of his own accord; it came only by Allah&rsquo;s permission (Quran 40:78).
          The miracle points to Allah&rsquo;s power, never the prophet&rsquo;s.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/miracles" label="Miracles of the Prophet ﷺ" />
        </div>
      </div>
    ),
  },
  {
    id: "faq-biblical",
    title: "Do Muslims accept the prophets of the Bible?",
    search: "do muslims accept biblical prophets bible moses jesus david noah abraham scripture changed torah gospel",
    children: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Yes — Muslims believe in every prophet Allah sent and &ldquo;make no distinction between
          any of His messengers&rdquo; (Quran 2:285). Adam, Nuh, Ibrahim, Musa, Dawud, Sulayman, and
          Isa (Adam, Noah, Abraham, Moses, David, Solomon, and Jesus) are all honoured prophets in
          Islam. Muslims do, however, believe the earlier scriptures were changed over time, and that
          the Quran is Allah&rsquo;s final, preserved revelation confirming the true message of them
          all.
        </p>
      </div>
    ),
  },
  {
    id: "faq-last",
    title: "Was Muhammad ﷺ really the last prophet?",
    search: "was muhammad last final prophet seal khatam no prophet after false claimant",
    children: (
      <div className="text-themed-muted text-sm leading-relaxed space-y-3">
        <p>
          Yes. He is the Seal of the Prophets: &ldquo;there has been no prophet between me and
          him,&rdquo; he said of Isa, and none will come after him (Bukhari 60:112). Anyone claiming
          prophethood after him is, by definition, false.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <XLink href="/prophet-muhammad" label="The final Prophet ﷺ" />
        </div>
      </div>
    ),
  },
];

const faqSources = [
  { ref: "Quran 4:158", desc: "Isa raised to Allah, alive" },
  { ref: "Quran 40:78", desc: "signs only by Allah's permission" },
  { ref: "Quran 2:285", desc: "no distinction between the messengers" },
  { ref: "Bukhari 60:112", desc: "the Seal of the Prophets" },
];

const tabs = [
  { key: "timeline", label: "Timeline" },
  { key: "about", label: "About the Prophets" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

// Sub-tabs of the "About the Prophets" tab — the house master-detail rail.
type SubKey = "beliefs" | "figures" | "questions";

const subTabs: { key: SubKey; label: string; icon: ReactNode }[] = [
  { key: "beliefs", label: "Beliefs", icon: <Sparkles size={16} /> },
  { key: "figures", label: "Righteous Figures", icon: <Users size={16} /> },
  { key: "questions", label: "Questions", icon: <HelpCircle size={16} /> },
];

function ProphetsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const tab = searchParams.get("tab");
    return tab && tabs.some((t) => t.key === tab) ? (tab as TabKey) : "timeline";
  });

  // Sub-tab of the "About the Prophets" tab (Beliefs default). Read on mount,
  // written back to ?sub= — the ?tab= for the top tabs is preserved alongside it.
  const [activeSub, setActiveSub] = useState<SubKey>(() => {
    const sub = searchParams.get("sub");
    return sub && subTabs.some((s) => s.key === sub) ? (sub as SubKey) : "beliefs";
  });

  const selectTab = (k: TabKey) => {
    setActiveTab(k);
    // Deep-linkable: ?tab=timeline (default) | ?tab=about&sub=… — scroll preserved.
    router.replace(
      `${pathname}?tab=${k}${k === "about" ? `&sub=${activeSub}` : ""}`,
      { scroll: false }
    );
  };

  const selectSub = (k: SubKey) => {
    setActiveSub(k);
    router.replace(`${pathname}?tab=about&sub=${k}`, { scroll: false });
  };

  const [search, setSearch] = useState("");
  const searching = search.trim() !== "";

  const filtered = prophets.filter((p) =>
    textMatch(search, p.name, p.nameAr, p.date, p.era, p.summary, p.surahs)
  );
  const introFiltered = introItems.filter((it) => textMatch(search, it.title, it.search));
  const figuresFiltered = figures.filter((f) => textMatch(search, f.name, f.nameAr, f.search));
  const faqFiltered = faqItems.filter((it) => textMatch(search, it.title, it.search));

  const nothing =
    searching &&
    filtered.length === 0 &&
    introFiltered.length === 0 &&
    figuresFiltered.length === 0 &&
    faqFiltered.length === 0;

  // Section render helpers (deferred so unshown sections cost nothing). Each
  // keeps its own `searching` conditionals, so the same markup serves both the
  // combined search results and the sub-tab views.
  const renderIntro = () => (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-gold" />
        <h2 className="text-lg sm:text-xl font-semibold text-themed">
          What Muslims believe about the prophets
        </h2>
      </div>
      {!searching && (
        <p className="text-themed-muted text-sm leading-relaxed mb-4">
          Who the prophets were, how many there are, and the beliefs that tie all twenty-seven
          prophet stories into one message.
        </p>
      )}
      <div className="space-y-4">
        {(searching ? introFiltered : introItems).map((it) => (
          <ContentCard key={it.id}>
            <h3 className="font-semibold text-themed mb-1">{it.title}</h3>
            {it.subtitle && <p className="text-xs text-gold/70 mb-3">{it.subtitle}</p>}
            {it.children}
          </ContentCard>
        ))}
      </div>
    </section>
  );

  const renderTimeline = () => (
    <>
      {searching && (
        <h2 className="text-lg font-semibold text-themed mb-3">Prophets</h2>
      )}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[52px] sm:left-[88px] md:left-[140px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--color-gold)] via-[var(--color-border)] to-transparent" />

        <div className="space-y-4">
          {filtered.map((prophet, i) => {
            const dateLabel = prophet.date === "Unknown" ? "Time Unknown" : prophet.date;
            const yearsAgo = getYearsAgo(prophet.date);
            return (
            <div key={prophet.slug} className="relative pl-[68px] sm:pl-[108px] md:pl-[168px]">
              {/* Date label (left of line) */}
              <div
                className="absolute left-0 top-4 w-[42px] sm:w-[78px] md:w-[130px] text-right pr-2 sm:pr-3"
                title={prophet.dateNote}
              >
                <span className="text-[8px] sm:text-[9px] md:text-[10px] leading-tight text-themed-muted block">
                  {dateLabel}
                </span>
                {yearsAgo && (
                  <span className="text-[7px] sm:text-[8px] md:text-[9px] leading-tight text-gold/60 block mt-0.5">
                    ({yearsAgo})
                  </span>
                )}
              </div>
              {/* Timeline dot */}
              <div className="absolute left-[47px] sm:left-[83px] md:left-[135px] top-6 w-3 h-3 rounded-full bg-gold border-2 border-[var(--color-card)]" />

              <ContentCard delay={i * 0.06}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-semibold text-themed">
                        Prophet {prophet.name}
                      </h2>
                      <span className="text-base sm:text-lg font-arabic text-gold">
                        {prophet.nameAr}
                      </span>
                    </div>
                    {prophet.name === "Muhammad" ? (
                      <span className="text-xs text-themed-muted">
                        صلى الله عليه وسلم
                      </span>
                    ) : (
                      <span className="text-xs text-themed-muted">
                        عليه السلام
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap sm:flex-col sm:items-end gap-1 shrink-0">
                    <span className="text-[10px] sm:text-xs text-themed-muted border sidebar-border rounded-full px-2 sm:px-3 py-0.5 sm:py-1">
                      {prophet.era}
                    </span>
                    {prophet.source !== "quran" && (
                      <span className="text-[10px] sm:text-xs text-gold border border-gold/30 rounded-full px-2 sm:px-3 py-0.5 sm:py-1">
                        {prophet.source === "hadith" ? "Hadith" : "Scholarly"}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-themed-muted text-sm leading-relaxed mb-3">
                  {prophet.summary}
                </p>

                <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1 text-xs text-themed-muted mb-3">
                  {prophet.mentions > 0 && (
                    <span>
                      Mentioned:{" "}
                      <strong className="text-themed">
                        {prophet.mentions}x
                      </strong>{" "}
                      in Quran
                    </span>
                  )}
                  {prophet.surahs && (
                    <span>
                      Key Surahs:{" "}
                      <strong className="text-themed">{prophet.surahs}</strong>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Link
                    href={`/prophets/${prophet.slug}`}
                    className="flex items-center gap-1 text-accent text-sm font-medium hover:gap-2 transition-all"
                  >
                    Read Full Story <ArrowRight size={14} />
                  </Link>
                  {prophet.name === "Muhammad" && (
                    <Link
                      href="/prophet-muhammad"
                      className="flex items-center gap-1 text-gold text-sm font-medium hover:gap-2 transition-all"
                    >
                      Full life &amp; seerah <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </ContentCard>
            </div>
            );
          })}
        </div>
      </div>
    </>
  );

  const renderFigures = () => (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Users size={18} className="text-gold" />
        <h2 className="text-lg sm:text-xl font-semibold text-themed">
          Righteous figures in the Quran
        </h2>
      </div>
      {!searching && (
        <p className="text-themed-muted text-sm leading-relaxed mb-4">
          Beyond the twenty-five prophets, the Quran honours other figures whose prophethood
          scholars have debated — several of them anchoring Surah al-Kahf, read every Friday.
          Here are the main scholarly positions.
        </p>
      )}
      <div className="space-y-4">
        {(searching ? figuresFiltered : figures).map((f, i) => (
          <ContentCard key={f.id} delay={i * 0.05}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <h3 className="text-lg font-semibold text-themed">{f.name}</h3>
                <span className="text-base font-arabic text-gold">{f.nameAr}</span>
              </div>
              <span className="text-[10px] sm:text-xs text-gold border border-gold/30 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap shrink-0">
                {f.badge}
              </span>
            </div>
            {f.body}
          </ContentCard>
        ))}
      </div>
    </section>
  );

  const renderFaq = () => (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle size={18} className="text-gold" />
        <h2 className="text-lg sm:text-xl font-semibold text-themed">
          Common questions about the prophets
        </h2>
      </div>
      <Accordion
        items={(searching ? faqFiltered : faqItems).map(({ search: _s, ...rest }) => rest)}
        defaultOpenId={searching ? faqFiltered[0]?.id ?? null : null}
      />
    </section>
  );

  return (
    <div>
      <PageHeader
        title="The Prophets"
        titleAr="الأنبياء"
        subtitle="Stories of the prophets in chronological order, from Adam to Muhammad ﷺ"
        action={
          <Link
            href="/prophets/family-tree"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 hover:border-[var(--color-gold)]/60 transition-colors group"
            style={{ animation: "glow-pulse 3s ease-in-out infinite" }}
          >
            <GitBranch size={16} className="text-gold" />
            <span className="text-sm font-medium text-gold whitespace-nowrap">Family Tree</span>
            <ArrowRight size={14} className="text-gold/60 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        }
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search prophets, figures, questions..." className="mb-6" />

      {/* Section tabs — hidden while searching so results span both tabs. */}
      {!searching && (
        <TabBar
          tabs={tabs.map((t) => ({ key: t.key, label: t.label }))}
          activeTab={activeTab}
          onTabChange={(k) => selectTab(k as TabKey)}
          className="mb-6"
        />
      )}

      {nothing && (
        <EmptyState
          icon={Users}
          title="No matches"
          subtitle={`No prophets, figures, or questions match "${search}".`}
        />
      )}

      {/* Search bypasses the tabs — every matching section spans the page.
          Otherwise the Timeline tab shows the timeline, and the "About the
          Prophets" tab routes its three sections through the sub-tab rail. */}
      {searching ? (
        <>
          {introFiltered.length > 0 && renderIntro()}
          {filtered.length > 0 && renderTimeline()}
          {figuresFiltered.length > 0 && renderFigures()}
          {faqFiltered.length > 0 && renderFaq()}
        </>
      ) : activeTab === "timeline" ? (
        renderTimeline()
      ) : (
        <>
          <SubTabLayout subs={subTabs} activeSub={activeSub} setActiveSub={selectSub}>
            {activeSub === "beliefs" && renderIntro()}
            {activeSub === "figures" && renderFigures()}
            {activeSub === "questions" && renderFaq()}
          </SubTabLayout>
          <SourcesCard
            className="mt-6"
            sources={activeSub === "beliefs" ? introSources : activeSub === "figures" ? figureSources : faqSources}
          />
        </>
      )}
    </div>
  );
}

export default function ProphetsPage() {
  return (
    <Suspense>
      <ProphetsContent />
    </Suspense>
  );
}
