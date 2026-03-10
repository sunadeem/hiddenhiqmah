"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import ContentCard from "@/components/ContentCard";
import { textMatch } from "@/lib/search";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { BookOpen } from "lucide-react";

/* ───────────────────────── data ───────────────────────── */

const whyItMatters = [
  {
    point: "The first stage of the Hereafter",
    detail:
      "The grave is the first station of the afterlife. The Prophet (peace be upon him) said: 'The grave is the first stage of the Hereafter. If one is saved from it, then what comes after is easier. And if one is not saved from it, then what comes after is worse.'",
    reference: "Sunan at-Tirmidhi 2308; Sunan Ibn Majah 4267",
  },
  {
    point: "Every soul will experience it",
    detail:
      "Death is the one certainty that unites all of creation. Allah says: 'Every soul will taste death.' No wealth, status, or power can prevent it. The Barzakh is the realm every soul enters after death and before resurrection.",
    reference: "Quran 3:185; Quran 23:100",
  },
  {
    point: "The Prophet sought refuge from its punishment",
    detail:
      "The Prophet (peace be upon him) used to regularly seek refuge from the punishment of the grave, and he instructed his companions to include this supplication in every prayer. This shows how seriously this matter should be taken.",
    reference: "Sahih Muslim 588",
  },
  {
    point: "It is a place of either bliss or torment",
    detail:
      "The grave is not a place of nothingness. The believer's grave is expanded as far as the eye can see, and a gate to Paradise is opened so that its fragrance and breeze reach him. The disbeliever's grave is constricted until his ribs interlock, and a gate to the Hellfire is opened so that its heat and scorching wind reach him. Every deceased person is shown their place — in Paradise or in the Fire — morning and evening.",
    reference: "Abu Dawud 4753 (graded Sahih by al-Albani); Sahih al-Bukhari 1379",
  },
  {
    point: "Awareness of this life motivates good deeds",
    detail:
      "Remembering death and what follows it is one of the greatest motivators to leave sin and hasten to good deeds. The Prophet (peace be upon him) said: 'Remember often the destroyer of pleasures — death.'",
    reference: "Sunan at-Tirmidhi 2307; Sunan an-Nasa'i 1824",
  },
  {
    point: "The Quran confirms the soul's experience before Resurrection",
    detail:
      "Allah describes Pharaoh's people being exposed to the Fire morning and evening in their Barzakh life, even before the Day of Judgement arrives — confirming that the soul is aware and experiencing reward or punishment between death and resurrection.",
    reference:
      "Quran 40:46 — 'The Fire, they are exposed to it morning and evening. And the Day the Hour is established: Admit the people of Pharaoh to the severest punishment.'",
  },
];

type GraveTopic = {
  id: string;
  name: string;
  content: {
    intro: string;
    points: { title: string; detail: string; note?: string }[];
    verse?: { arabic: string; text: string; ref: string };
    source?: string;
  };
};

const whatHappensTopics: GraveTopic[] = [
  {
    id: "departure-soul",
    name: "The Departure of the Soul",
    content: {
      intro:
        "At the moment of death, the angel of death comes to extract the soul. The experience differs drastically between the believer and the disbeliever.",
      verse: {
        arabic:
          "قُلْ يَتَوَفَّىٰكُم مَّلَكُ ٱلْمَوْتِ ٱلَّذِى وُكِّلَ بِكُمْ ثُمَّ إِلَىٰ رَبِّكُمْ تُرْجَعُونَ",
        text: "Say: The angel of death who has been entrusted with you will take your souls. Then to your Lord you will be returned.",
        ref: "Quran 32:11",
      },
      points: [
        {
          title: "The believer's soul departs gently",
          detail:
            "Angels descend with white shrouds and fragrant musk from Paradise. They say: 'O good soul, come out to the forgiveness and pleasure of Allah.' The soul exits as easily as water flows from a water-skin, and they wrap it in those heavenly shrouds. From it emanates the finest fragrance of musk found on the face of the earth.",
          note: "Mishkat al-Masabih 1630 (from Musnad Ahmad, hadith of al-Bara' ibn 'Azib; graded Sahih by al-Albani)",
        },
        {
          title: "The disbeliever's soul is wrenched out",
          detail:
            "Angels descend with coarse cloth from the Hellfire. They say: 'O wicked soul, come out to the wrath and anger of Allah.' The soul scatters through the body and is pulled out like a skewer is pulled through moistened wool. From it emanates the most foul stench found on the face of the earth.",
          note: "Mishkat al-Masabih 1630 (from Musnad Ahmad, hadith of al-Bara' ibn 'Azib; graded Sahih by al-Albani)",
        },
        {
          title: "The soul is taken up through the heavens",
          detail:
            "The believer's soul is carried up through each heaven, and at every level the angels welcome it and ask about it. The gates of heaven are opened for it until it reaches the seventh heaven, and Allah says: 'Record the book of My servant in 'Illiyyeen (the highest register) and return him to the earth, for from it I created them, to it I shall return them, and from it I shall raise them again.'",
          note: "Mishkat al-Masabih 1630 (from Musnad Ahmad; graded Sahih by al-Albani)",
        },
      ],
      source:
        "Mishkat al-Masabih 1630 (from Musnad Ahmad, hadith of al-Bara' ibn 'Azib; graded Sahih by al-Albani); Quran 32:11",
    },
  },
  {
    id: "funeral-burial",
    name: "The Funeral & Burial",
    content: {
      intro:
        "Islam emphasizes hastening the funeral and burial. The deceased is aware of what happens around them even after death.",
      points: [
        {
          title: "Hasten the funeral",
          detail:
            "The Prophet (peace be upon him) said: 'Hasten the funeral. If the deceased was righteous, you are advancing them to good. And if they were otherwise, then it is an evil you are putting off your necks.'",
          note: "Sahih al-Bukhari 1315; Sahih Muslim 944",
        },
        {
          title: "The deceased hears the footsteps",
          detail:
            "The Prophet (peace be upon him) said: 'When a person is placed in their grave and his companions depart from him, he hears the sound of their sandals.'",
          note: "Sahih al-Bukhari 1338; Sahih Muslim 2870",
        },
        {
          title: "The grave squeezes",
          detail:
            "No one is spared from the squeezing of the grave. The Prophet (peace be upon him) said about Sa'd ibn Mu'adh — the companion at whose death the Throne of Allah shook and the gates of heaven were opened: 'It squeezed him once, then released him.'",
          note: "Sunan an-Nasa'i 2055",
        },
      ],
      source:
        "Sahih al-Bukhari 1315, 1338; Sahih Muslim 944, 2870; Sunan an-Nasa'i 2055",
    },
  },
  {
    id: "questioning",
    name: "The Questioning",
    content: {
      intro:
        "After burial, every person will be questioned in their grave by two angels. This is the first test of the afterlife, and one's answers depend on how they lived.",
      verse: {
        arabic:
          "يُثَبِّتُ ٱللَّهُ ٱلَّذِينَ ءَامَنُوا۟ بِٱلْقَوْلِ ٱلثَّابِتِ فِى ٱلْحَيَوٰةِ ٱلدُّنْيَا وَفِى ٱلْـَٔاخِرَةِ",
        text: "Allah keeps firm those who believe with the firm word, in the life of this world and in the Hereafter.",
        ref: "Quran 14:27",
      },
      points: [
        {
          title: "Three questions",
          detail:
            "Two angels come to the deceased and sit them up. They ask three questions: 'Who is your Lord?' 'What is your religion?' and 'What do you say about this man who was sent among you?'",
          note: "Abu Dawud 4753; Sahih al-Bukhari 1338",
        },
        {
          title: "The believer answers with certainty",
          detail:
            "The believer will say: 'My Lord is Allah, my religion is Islam, and he is Muhammad, the Messenger of Allah (peace be upon him).' A caller from heaven will say: 'My servant has spoken the truth, so spread for him a bed from Paradise, clothe him from Paradise, and open for him a gate to Paradise.'",
          note: "Abu Dawud 4753",
        },
        {
          title: "The hypocrite and disbeliever cannot answer",
          detail:
            "The disbeliever or hypocrite will say: 'I don't know... I heard the people saying something and I said it too.' It will be said: 'You did not know and you did not recite (follow guidance).' Then he will be struck with an iron hammer between his ears, and he will let out a scream that is heard by everything near him except humans and jinn.",
          note: "Sahih al-Bukhari 1338; Abu Dawud 4753",
        },
      ],
      source:
        "Sahih al-Bukhari 1338; Sahih Muslim 2870; Abu Dawud 4753; Quran 14:27",
    },
  },
  {
    id: "believer-experience",
    name: "The Believer's Experience",
    content: {
      intro:
        "For the righteous believer, the grave becomes a place of comfort, spaciousness, and light — a garden from the gardens of Paradise.",
      points: [
        {
          title: "The grave is expanded",
          detail:
            "After the believer answers correctly, his grave is expanded for him as far as his eye can see. It is furnished with furnishings from Paradise, and a gate to Paradise is opened for him so that its fragrance and breeze reach him.",
          note: "Abu Dawud 4753; Sahih al-Bukhari 1338",
        },
        {
          title: "A beautiful companion appears",
          detail:
            "A man with a beautiful face, fine clothing, and pleasant fragrance comes and says: 'Receive glad tidings of that which will please you. This is the day you were promised.' The believer asks: 'Who are you? Your face brings good.' He replies: 'I am your righteous deeds.'",
          note: "Abu Dawud 4753; Mishkat al-Masabih 1630",
        },
        {
          title: "The believer asks for the Hour to come",
          detail:
            "The believer will say: 'My Lord, establish the Hour so that I may return to my family and my wealth!' — so eager is he for what awaits him in the Hereafter.",
          note: "Abu Dawud 4753",
        },
        {
          title: "Sleep like a bride",
          detail:
            "The righteous person will sleep in their grave in comfort, like a bride whom no one wakes except the dearest of her family — until Allah raises them on the Day of Resurrection.",
          note: "Sunan at-Tirmidhi 1071; graded Hasan by al-Albani",
        },
      ],
      source:
        "Abu Dawud 4753; Sahih al-Bukhari 1338; Mishkat al-Masabih 1630; Sunan at-Tirmidhi 1071",
    },
  },
  {
    id: "disbeliever-experience",
    name: "The Disbeliever's Experience",
    content: {
      intro:
        "For the disbeliever and the hypocrite, the grave becomes a place of constriction, darkness, and suffering — a pit from the pits of the Hellfire.",
      points: [
        {
          title: "The grave constricts upon them",
          detail:
            "After they fail to answer, their grave is constricted until their ribs interlock. A gate to the Hellfire is opened, and its heat and scorching wind reach them.",
          note: "Abu Dawud 4753; Sahih al-Bukhari 1338",
        },
        {
          title: "An ugly companion appears",
          detail:
            "A man with a hideous face, foul clothing, and terrible stench comes and says: 'Receive the tidings of that which will grieve you. This is the day you were promised.' The person asks: 'Who are you? Your face brings evil.' He says: 'I am your wicked deeds.'",
          note: "Abu Dawud 4753; Mishkat al-Masabih 1630",
        },
        {
          title: "Ongoing punishment until the Hour",
          detail:
            "Allah describes Pharaoh's people being exposed to the Fire morning and evening in their graves. On the Day of Judgement, they will be admitted to the severest punishment. This shows that punishment in the grave is real and continuous.",
          note: "Quran 40:46",
        },
        {
          title: "Punishment for specific sins",
          detail:
            "The Prophet (peace be upon him) passed by two graves and said: 'They are being punished, and they are not being punished for something major (that was difficult to avoid). One of them used to not protect himself from his urine, and the other used to walk about spreading malicious gossip.'",
          note: "Sahih al-Bukhari 1361; Sahih Muslim 292a",
        },
      ],
      source:
        "Abu Dawud 4753; Mishkat al-Masabih 1630; Quran 40:46; Sahih al-Bukhari 1361; Sahih Muslim 292a",
    },
  },
];

const protectionTopics: GraveTopic[] = [
  {
    id: "deeds-protect",
    name: "Deeds That Protect",
    content: {
      intro:
        "Certain deeds serve as a shield and protection for a person in the grave. The Prophet (peace be upon him) and the Quran highlight specific actions that safeguard the believer.",
      points: [
        {
          title: "Reciting Surah al-Mulk",
          detail:
            "The Prophet (peace be upon him) said: 'There is a surah in the Quran of thirty verses that interceded for a man until he was forgiven. It is: Blessed is He in Whose Hand is the dominion (Surah al-Mulk).' It is known as the protector from the punishment of the grave.",
          note: "Sunan at-Tirmidhi 2891; Sunan Abu Dawud 1400",
        },
        {
          title: "Dying as a shaheed (martyr)",
          detail:
            "The Prophet (peace be upon him) said: 'There are six things with Allah for the martyr...' and among them: 'He is protected from the punishment of the grave.'",
          note: "Sunan at-Tirmidhi 1663; Sunan Ibn Majah 2799",
        },
        {
          title: "Dying on a Friday",
          detail:
            "The Prophet (peace be upon him) said: 'There is no Muslim who dies on the day of Friday or the night of Friday except that Allah protects him from the trial of the grave.'",
          note: "Sunan at-Tirmidhi 1074 (graded Hasan)",
        },
        {
          title: "Dying while guarding the frontier (ribat)",
          detail:
            "The Prophet (peace be upon him) said: 'Guarding the frontier for one day in the cause of Allah is better than the world and everything in it... and he is protected from the trial of the grave.'",
          note: "Sunan at-Tirmidhi 1665",
        },
        {
          title: "Dying from a stomach ailment",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever is killed by a stomach ailment will not be punished in his grave.'",
          note: "Sunan at-Tirmidhi 1064; graded Sahih by al-Albani",
        },
      ],
      source:
        "Sunan at-Tirmidhi 2891, 1663, 1074, 1665, 1064; Sunan Abu Dawud 1400; Sunan Ibn Majah 2799",
    },
  },
  {
    id: "seeking-refuge",
    name: "Seeking Refuge",
    content: {
      intro:
        "The Prophet (peace be upon him) taught specific supplications to seek protection from the punishment of the grave. These are to be said regularly, especially in prayer.",
      points: [
        {
          title: "Dua in every prayer",
          detail:
            "The Prophet (peace be upon him) said: 'When one of you finishes the last tashahhud, let him seek refuge with Allah from four things: from the punishment of the Hellfire, from the punishment of the grave, from the trials of life and death, and from the evil of the trial of al-Masih al-Dajjal.'",
          note: "Sahih Muslim 588; Sahih al-Bukhari 1377",
        },
        {
          title: "The Prophet's regular practice",
          detail:
            "A'ishah (may Allah be pleased with her) reported that the Prophet (peace be upon him) used to supplicate in prayer: 'O Allah, I seek refuge with You from the punishment of the grave, and I seek refuge with You from the trial of al-Masih al-Dajjal, and I seek refuge with You from the trials of life and the trials of death.'",
          note: "Sahih Muslim 589",
        },
        {
          title: "Supplication after burial",
          detail:
            "The Prophet (peace be upon him) would stand at the grave after burial and say: 'Ask Allah to forgive your brother and ask that he be made firm, for he is now being questioned.'",
          note: "Sunan Abu Dawud 3221; graded Sahih by al-Albani",
        },
      ],
      source:
        "Sahih al-Bukhari 1377; Sahih Muslim 588, 589; Sunan Abu Dawud 3221",
    },
  },
  {
    id: "good-ending",
    name: "Signs of a Good Ending",
    content: {
      intro:
        "The Prophet (peace be upon him) described certain signs that indicate a good ending (husn al-khatimah) — signs of Allah's acceptance and pleasure at the time of death.",
      points: [
        {
          title: "Dying with the shahadah on one's lips",
          detail:
            "The Prophet (peace be upon him) said: 'He whose last words are La ilaha illallah (There is no god but Allah) will enter Paradise.'",
          note: "Sunan Abu Dawud 3116; graded Sahih by al-Albani",
        },
        {
          title: "Sweat on the forehead at death",
          detail:
            "The Prophet (peace be upon him) said: 'The believer dies with sweat on his forehead.' This is considered one of the signs of a good ending.",
          note: "Sunan at-Tirmidhi 982; Sunan an-Nasa'i 1828",
        },
        {
          title: "Dying while performing a righteous deed",
          detail:
            "The Prophet (peace be upon him) said: 'When Allah wills good for His servant, He uses him.' They asked: 'How does He use him?' He said: 'He guides him to do a righteous deed before his death.'",
          note: "Sunan at-Tirmidhi 2142 (graded Sahih)",
        },
        {
          title: "The state of the face after death",
          detail:
            "Scholars note that a peaceful, content expression on the face of the deceased is considered a sign of a good ending, while a distressed appearance may indicate otherwise. This is observed but ultimately only Allah knows the true state of a person.",
        },
      ],
      source:
        "Sunan Abu Dawud 3116; Sunan at-Tirmidhi 982, 2142; Sunan an-Nasa'i 1828",
    },
  },
];

const sections = [
  { key: "intro", label: "What is the Barzakh?" },
  { key: "importance", label: "Why It Matters" },
  { key: "what-happens", label: "What Happens" },
  { key: "protection", label: "Protection" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── sub-components ───────────────────────── */

function TopicInfoCard({ topic }: { topic: GraveTopic }) {
  const hasVerse = "verse" in topic.content && topic.content.verse;
  return (
    <ContentCard>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-themed">{topic.name}</h2>
      </div>

      <p className="text-themed-muted text-sm leading-relaxed mb-5">
        {topic.content.intro}
      </p>

      {hasVerse && (
        <div
          className="rounded-lg p-4 mb-5"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
            {topic.content.verse!.arabic}
          </p>
          <p className="text-themed text-sm italic">
            &ldquo;{topic.content.verse!.text}&rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-2">
            {topic.content.verse!.ref}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {topic.content.points.map((point) => (
          <div
            key={point.title}
            className="rounded-lg p-4 border sidebar-border"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <h4 className="text-sm font-semibold text-themed mb-2">
              {point.title}
            </h4>
            <p className="text-themed-muted text-sm leading-relaxed">
              {point.detail}
            </p>
            {point.note && (
              <p className="text-xs text-gold/60 mt-2">{point.note}</p>
            )}
          </div>
        ))}
      </div>
    </ContentCard>
  );
}

/* ───────────────────────── page ───────────────────────── */

function TheGraveContent() {
  const searchParams = useSearchParams();
  useScrollToSection();
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "intro");
  const [activeWhatHappens, setActiveWhatHappens] = useState("departure-soul");
  const [activeProtection, setActiveProtection] = useState("deeds-protect");
  const [search, setSearch] = useState("");

  const topicMatches = (t: GraveTopic) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, t.name, t.content.intro, t.content.source,
      t.content.verse?.text,
      ...t.content.points.map(p => p.title),
      ...t.content.points.map(p => p.detail),
    );
  };

  const mattersMatches = (item: { point: string; detail: string; reference: string }) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, item.point, item.detail, item.reference);
  };

  return (
    <div>
      <PageHeader
        title="Barzakh"
        titleAr="البرزخ"
        subtitle="The life of al-Barzakh — what happens after death according to authentic sources."
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search topics, verses..." className="mb-6" />

      {/* Section navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === section.key
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-themed-muted hover:text-themed border sidebar-border"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── What is the Barzakh? ─── */}
        {activeSection === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard>
              <div className="text-center py-6">
                <p className="text-xs text-themed-muted mb-3 uppercase tracking-wider">
                  The Quran
                </p>
                <p className="text-2xl md:text-3xl font-arabic text-gold leading-loose mb-4">
                  وَمِن وَرَآئِهِم بَرْزَخٌ إِلَىٰ يَوْمِ يُبْعَثُونَ
                </p>
                <p className="text-themed-muted italic mb-2 max-w-2xl mx-auto">
                  &ldquo;And behind them is a barrier (Barzakh) until the Day
                  they are resurrected.&rdquo;
                </p>
                <span className="inline-block mt-3 text-xs text-themed-muted border sidebar-border rounded-full px-3 py-1">
                  Quran 23:100
                </span>
              </div>
            </ContentCard>

            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                What is the Barzakh?
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">Al-Barzakh</span>{" "}
                  (البرزخ) literally means &ldquo;barrier&rdquo; or
                  &ldquo;partition&rdquo; and refers to the intermediate realm
                  between death and the Day of Resurrection. It is the life of
                  the grave — a stage every soul must pass through, regardless of
                  whether they are physically buried or not.
                </p>
                <p>
                  Belief in the life of the grave is part of belief in the
                  unseen (al-ghayb), which is one of the fundamental qualities
                  of the believers described in the opening of the Quran:{" "}
                  <em>
                    &ldquo;Those who believe in the unseen, establish prayer, and
                    spend from what We have provided for them&rdquo;
                  </em>{" "}
                  (Quran 2:3). The questioning of the grave, its punishment, and
                  its bliss are affirmed by the Quran, the Sunnah, and the
                  consensus of the scholars.
                </p>
                <p>
                  The Prophet (peace be upon him) said:{" "}
                  <em>
                    &ldquo;The grave is the first stage of the Hereafter. If one
                    is saved from it, then what comes after is easier. And if one
                    is not saved from it, then what comes after is worse.&rdquo;
                  </em>{" "}
                  (Sunan at-Tirmidhi 2308). This hadith establishes the grave as
                  the beginning of the journey — the first test of the
                  Hereafter.
                </p>
                <p>
                  In the Barzakh, the soul is reunited with the body in a manner
                  that only Allah knows. The person is questioned by two angels,
                  and depending on their answers, the grave becomes either a
                  garden from the gardens of Paradise or a pit from the pits of
                  the Hellfire. The soul remains in this state — experiencing
                  comfort or torment — until the Day of Resurrection.
                </p>
                <p>
                  The Prophet (peace be upon him) regularly sought refuge from
                  the punishment of the grave and taught his companions to do the
                  same in every prayer. Allah says:{" "}
                  <em>
                    &ldquo;The Fire, they are exposed to it morning and evening.
                    And the Day the Hour is established: Admit the people of
                    Pharaoh to the severest punishment&rdquo;
                  </em>{" "}
                  (Quran 40:46) — confirming that the soul experiences its
                  outcome even before the Day of Judgement.
                </p>
              </div>
            </ContentCard>

            {/* Sources */}
            <ContentCard delay={0.3}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Quran 2:3 — Those who believe in the unseen",
                  "Quran 23:100 — Behind them is a Barzakh until the Day they are resurrected",
                  "Quran 40:46 — Pharaoh's people exposed to Fire morning and evening",
                  "Sunan at-Tirmidhi 2308 — The grave is the first stage of the Hereafter",
                  "Sahih Muslim 588 — Seeking refuge from the punishment of the grave in prayer",
                ].map((source) => (
                  <li
                    key={source}
                    className="text-xs text-themed-muted leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    {source}
                  </li>
                ))}
              </ul>
            </ContentCard>
          </motion.div>
        )}

        {/* ─── Why It Matters ─── */}
        {activeSection === "importance" && (
          <motion.div
            key="importance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Opening verse */}
            <ContentCard>
              <div className="text-center py-4">
                <p className="text-lg font-arabic text-gold leading-loose mb-3">
                  كُلُّ نَفْسٍۢ ذَآئِقَةُ ٱلْمَوْتِ ۗ وَإِنَّمَا
                  تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ ٱلْقِيَـٰمَةِ
                </p>
                <p className="text-themed-muted italic">
                  &ldquo;Every soul will taste death, and you will only receive
                  your full reward on the Day of Resurrection.&rdquo;
                </p>
                <p className="text-xs text-themed-muted mt-2">Quran 3:185</p>
              </div>
            </ContentCard>

            {/* Numbered points */}
            {whyItMatters.filter(mattersMatches).map((item, i) => (
              <ContentCard key={i} delay={0.05 + i * 0.05}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold font-semibold text-sm">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-themed mb-1">
                      {item.point}
                    </h3>
                    <p className="text-themed-muted text-sm leading-relaxed">
                      {item.detail}
                    </p>
                    <p className="text-xs text-gold/60 mt-2">
                      {item.reference}
                    </p>
                  </div>
                </div>
              </ContentCard>
            ))}

            {/* Sources */}
            <ContentCard delay={0.4}>
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Quran 3:185 — Every soul will taste death",
                  "Quran 23:100 — Behind them is a Barzakh",
                  "Quran 40:46 — Pharaoh's people exposed to the Fire morning and evening",
                  "Sahih Muslim 588 — Seeking refuge from the punishment of the grave",
                  "Sunan at-Tirmidhi 2307 — Remember often the destroyer of pleasures",
                  "Sunan at-Tirmidhi 2308; Sunan Ibn Majah 4267 — The grave is the first stage of the Hereafter",
                  "Abu Dawud 4753 — The believer's grave is expanded; the disbeliever's is constricted",
                  "Sahih al-Bukhari 1379 — The deceased is shown their place morning and evening",
                  "Sunan an-Nasa'i 1824 — Remember death often",
                ].map((source) => (
                  <li
                    key={source}
                    className="text-xs text-themed-muted leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    {source}
                  </li>
                ))}
              </ul>
            </ContentCard>
          </motion.div>
        )}

        {/* ─── What Happens ─── */}
        {activeSection === "what-happens" && (
          <motion.div
            key="what-happens"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex flex-col gap-2 shrink-0">
                {whatHappensTopics.filter(topicMatches).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setActiveWhatHappens(topic.id)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
                        activeWhatHappens === topic.id
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "text-themed-muted hover:text-themed border sidebar-border"
                      }`}
                    >
                      {topic.name}
                    </button>
                ))}
              </div>

              {/* Right side — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {whatHappensTopics.filter(topicMatches).map(
                    (topic) =>
                      activeWhatHappens === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <TopicInfoCard topic={topic} />
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sources */}
            <ContentCard delay={0.3} className="mt-8">
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Quran 14:27 — Allah keeps firm those who believe with the firm word",
                  "Quran 32:11 — The angel of death will take your souls",
                  "Quran 40:46 — Pharaoh's people exposed to Fire morning and evening",
                  "Sahih al-Bukhari 1315; Sahih Muslim 944 — Hasten the funeral",
                  "Sahih al-Bukhari 1338; Sahih Muslim 2870 — The questioning in the grave; hearing footsteps",
                  "Sahih al-Bukhari 1361; Sahih Muslim 292a — Punishment for not avoiding urine and gossip",
                  "Mishkat al-Masabih 1630 (from Musnad Ahmad) — Full hadith of al-Bara' ibn 'Azib on the soul's journey",
                  "Sunan an-Nasa'i 2055 — Sa'd ibn Mu'adh and the squeezing of the grave",
                  "Sunan at-Tirmidhi 1071 — The righteous sleeps like a bride",
                ].map((source) => (
                  <li
                    key={source}
                    className="text-xs text-themed-muted leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    {source}
                  </li>
                ))}
              </ul>
            </ContentCard>
          </motion.div>
        )}

        {/* ─── Protection ─── */}
        {activeSection === "protection" && (
          <motion.div
            key="protection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex flex-col gap-2 shrink-0">
                {protectionTopics.filter(topicMatches).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setActiveProtection(topic.id)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
                        activeProtection === topic.id
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "text-themed-muted hover:text-themed border sidebar-border"
                      }`}
                    >
                      {topic.name}
                    </button>
                ))}
              </div>

              {/* Right side — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {protectionTopics.filter(topicMatches).map(
                    (topic) =>
                      activeProtection === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <TopicInfoCard topic={topic} />
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sources */}
            <ContentCard delay={0.3} className="mt-8">
              <h4 className="text-sm font-semibold text-themed flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-gold" />
                Sources &amp; References
              </h4>
              <ul className="space-y-1.5">
                {[
                  "Sahih al-Bukhari 1377; Sahih Muslim 588, 589 — Seeking refuge from the punishment of the grave in prayer",
                  "Sunan Abu Dawud 3116 — Dying with La ilaha illallah on one's lips",
                  "Sunan Abu Dawud 3221 — Supplication after burial for firmness",
                  "Sunan at-Tirmidhi 982; Sunan an-Nasa'i 1828 — Sweat on the forehead at death",
                  "Sunan at-Tirmidhi 1064 — Dying from a stomach ailment",
                  "Sunan at-Tirmidhi 1074 — Dying on Friday (graded Hasan)",
                  "Sunan at-Tirmidhi 1663; Sunan Ibn Majah 2799 — The shaheed is protected",
                  "Sunan at-Tirmidhi 1665 — Guarding the frontier (ribat)",
                  "Sunan at-Tirmidhi 2142 — Allah guides to a righteous deed before death (graded Sahih)",
                  "Sunan at-Tirmidhi 2891; Sunan Abu Dawud 1400 — Surah al-Mulk intercedes",
                ].map((source) => (
                  <li
                    key={source}
                    className="text-xs text-themed-muted leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-gold/40 mt-0.5">&#8226;</span>
                    {source}
                  </li>
                ))}
              </ul>
            </ContentCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TheGravePage() {
  return <Suspense><TheGraveContent /></Suspense>;
}
