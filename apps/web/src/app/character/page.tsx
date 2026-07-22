"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import SubTabLayout from "@hidden-hiqmah/ui/components/SubTabLayout";
import TopicInfoCard, { type Topic } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";

/* ───────────────────────── data ───────────────────────── */

const virtueTopics: Topic[] = [
  {
    id: "ikhlas",
    name: "Sincerity (Ikhlas)",
    content: {
      intro:
        "Ikhlas — doing a deed for Allah alone — is the soul of every act of worship and every good trait. The same prayer, charity, or kindness can be immensely heavy or completely weightless depending on the intention behind it.",
      points: [
        {
          title: "Deeds are judged by intentions",
          detail:
            "The very first hadith of Sahih al-Bukhari: 'The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.' Character work begins inside — the same visible act can be worship or performance.",
          note: "Bukhari 1:1",
        },
        {
          title: "Riya — the hidden shirk in a deed",
          detail:
            "Riya is doing a deed to be seen by people rather than for Allah, and scholars call it the hidden shirk because it slips a second audience into an act that belongs to Allah alone. In a hadith qudsi, Allah says: 'I am the One, One Who does not stand in need of a partner. If anyone does anything in which he associates anyone else with Me, I shall abandon him with one whom he associates with Allah.' A deed done for show is left to the audience it was done for.",
          note: "Muslim 55:58",
        },
        {
          title: "Whoever wants to be seen",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever wants to be heard of, Allah will make him heard of, and whoever wants to be seen, Allah will show him' — that is, Allah will expose his real motives. The cure is simple and lifelong: hide good deeds as carefully as you would hide sins, and renew the intention before, during, and after each act.",
          note: "Ibn Majah 37:107",
        },
      ],
    },
  },
  {
    id: "sabr",
    name: "Patience (Sabr)",
    content: {
      intro:
        "Sabr is steadfastness — holding the soul firm in hardship, away from sin, and steady upon obedience. It is not passive resignation but a strength the believer brings to every season of life.",
      points: [
        {
          title: "Good in every affair",
          detail:
            "The Prophet (peace be upon him) said: 'Strange are the ways of a believer for there is good in every affair of his and this is not the case with anyone else except in the case of a believer for if he has an occasion to feel delight, he thanks (God), thus there is a good for him in it, and if he gets into trouble and shows resignation (and endures it patiently), there is a good for him in it.' Patience and gratitude together make every circumstance a win.",
          note: "Muslim 55:82",
        },
        {
          title: "At the first stroke",
          detail:
            "The Prophet (peace be upon him) said: 'The real patience is at the first stroke of a calamity.' Anyone becomes calm once the shock fades; sabr is the heart's response in the very first moment — no despairing words, no objection against the decree.",
          note: "Bukhari 23:60",
        },
        {
          title: "Patience in daily character",
          detail:
            "Sabr is not only for tragedies. Holding your tongue in an argument, repeating a kindness to someone who ignores it, staying constant in prayer when motivation dips — these small, unseen acts of endurance are the daily training ground of character.",
        },
      ],
    },
  },
  {
    id: "shukr",
    name: "Gratitude (Shukr)",
    content: {
      intro:
        "Shukr is recognizing every blessing as coming from Allah — with the heart, the tongue, and the limbs. Allah ties gratitude to increase, and the Prophet (peace be upon him) tied gratitude to Allah with gratitude to people.",
      verse: {
        arabic: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِى لَشَدِيدٌ",
        text: "And [remember] when your Lord declared, ‘If you are grateful, I will surely give you more; but if you are ungrateful, My punishment is severe indeed.’",
        ref: "Quran 14:7",
      },
      points: [
        {
          title: "Thanking people is thanking Allah",
          detail:
            "The Prophet (peace be upon him) said: 'He who does not thank the people is not thankful to Allah.' Gratitude is a trait, not a mood — the person who cannot say thank you to the visible giver has not truly learned to thank the unseen Giver.",
          note: "Abu Dawud 43:39",
        },
        {
          title: "Gratitude in ease is worship",
          detail:
            "In the hadith of the believer's strange affair, delight is met with thanks — and that thanks itself becomes good for him. Naming blessings out loud, saying alhamdulillah with presence, and using each blessing in obedience are the three limbs of shukr.",
          note: "Muslim 55:82",
        },
      ],
    },
  },
  {
    id: "humility",
    name: "Humility (Tawadu)",
    content: {
      intro:
        "Tawadu is lowering the wing — with Allah by submitting to His truth, and with people by meeting them without airs. It is the trait Allah answers with elevation.",
      points: [
        {
          title: "Allah raises the humble",
          detail:
            "The Prophet (peace be upon him) said: 'Charity does not decrease wealth, no one forgives another except that Allah increases his honor, and no one humbles himself for the sake of Allah except that Allah raises his status.' The world's math is inverted: lowering yourself for Allah is the only reliable way up.",
          note: "Muslim 45:90",
        },
        {
          title: "Humility is not shabbiness",
          detail:
            "When a man asked whether loving fine clothes and shoes was pride, the Prophet (peace be upon him) answered: 'Verily, Allah is Graceful and He loves Grace. Pride is disdaining the truth (out of self-conceit) and contempt for the people.' Humility lives in how you receive truth and how you regard people — not in dressing poorly.",
          note: "Muslim 1:171",
        },
        {
          title: "Everyday humility",
          detail:
            "Accepting correction without bristling, giving credit away, sitting with those the world overlooks, serving your own family with your own hands — the Prophet's (peace be upon him) life modeled a greatness that never needed to announce itself.",
        },
      ],
    },
  },
  {
    id: "forgiveness",
    name: "Forgiveness & Restraint",
    content: {
      intro:
        "The Quran describes the people of Paradise as those who swallow their anger and pardon people. Restraining the self in the heat of the moment is, in the Prophet's (peace be upon him) words, real strength.",
      verse: {
        arabic: "ٱلَّذِينَ يُنفِقُونَ فِى ٱلسَّرَّآءِ وَٱلضَّرَّآءِ وَٱلْكَـٰظِمِينَ ٱلْغَيْظَ وَٱلْعَافِينَ عَنِ ٱلنَّاسِ ۗ وَٱللَّهُ يُحِبُّ ٱلْمُحْسِنِينَ",
        text: "those who spend in times of prosperity and adversity, and who restrain their anger and pardon people; for Allah loves those who do good.",
        ref: "Quran 3:134",
      },
      points: [
        {
          title: "The truly strong one",
          detail:
            "The Prophet (peace be upon him) said: 'The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger.' Islam relocates strength from the fist to the heart.",
          note: "Bukhari 78:141; Muslim 45:140",
        },
        {
          title: "Pardoning only increases honor",
          detail:
            "'No one forgives another except that Allah increases his honor.' The fear that forgiving makes you look weak is answered directly: Allah Himself guarantees the opposite.",
          note: "Muslim 45:90",
        },
        {
          title: "Forgiving is not excusing",
          detail:
            "Pardoning someone does not require pretending the wrong never happened, and it does not forbid seeking justice where rights are owed. It means releasing the grudge from your own heart — for Allah's sake, and for the lightness of your own scale.",
        },
      ],
    },
  },
  {
    id: "truthfulness",
    name: "Truthfulness (Sidq)",
    content: {
      intro:
        "Sidq — truthfulness in speech, dealings, and intention — is a path: each honest word walks a person further toward righteousness until Allah records him as truthful.",
      points: [
        {
          title: "Truth leads to Paradise",
          detail:
            "The Prophet (peace be upon him) said: 'Truthfulness leads to righteousness, and righteousness leads to Paradise. And a man keeps on telling the truth until he becomes a truthful person.' Honesty compounds — every truthful word makes the next one easier, until truthfulness is who you are.",
          note: "Bukhari 78:121",
        },
        {
          title: "A house in the middle of Paradise",
          detail:
            "The Prophet (peace be upon him) guaranteed 'a house in the middle of Paradise for a man who avoids lying even if he were joking.' Even the 'harmless' lie — the exaggerated story, the joke at truth's expense — is worth leaving for this promise.",
          note: "Abu Dawud 43:28",
        },
      ],
    },
  },
  {
    id: "generosity",
    name: "Generosity",
    content: {
      intro:
        "The Prophet (peace be upon him) was the most generous of people — and generosity in Islam extends beyond money to time, knowledge, hospitality, and a cheerful face.",
      points: [
        {
          title: "More generous than the free wind",
          detail:
            "Ibn Abbas said: 'Allah's Messenger (peace be upon him) was the most generous of all the people, and he used to reach the peak in generosity in the month of Ramadan when Gabriel met him… Allah's Messenger was the most generous person, even more generous than the strong uncontrollable wind (in readiness and haste to do charitable deeds).'",
          note: "Bukhari 1:6",
        },
        {
          title: "Charity does not decrease wealth",
          detail:
            "The Prophet (peace be upon him) stated it as a rule: 'Charity does not decrease wealth.' Giving is the one expense with a guarantee attached — what leaves the hand for Allah's sake never truly diminishes what remains.",
          note: "Muslim 45:90",
        },
      ],
    },
  },
  {
    id: "gentleness",
    name: "Gentleness (Rifq)",
    content: {
      intro:
        "Rifq — gentleness in speech, dealings, and correction — is a trait Allah loves in all things, and it achieves what harshness never can.",
      points: [
        {
          title: "Allah loves gentleness in all things",
          detail:
            "A'isha narrated that the Prophet (peace be upon him) said: 'Allah is Gentle and loves gentleness in all things.' Not merely in some things — in correcting others, in teaching, in the home, even in disagreement.",
          note: "Ibn Majah 33:33",
        },
        {
          title: "What harshness cannot earn",
          detail:
            "The Prophet (peace be upon him) said: 'Allah is gentle, likes gentleness, and gives for gentleness what he does not give for harshness.' Gentleness opens hearts, homes, and outcomes that force and sharpness permanently close.",
          note: "Abu Dawud 43:35",
        },
      ],
    },
  },
];

const diseaseTopics: Topic[] = [
  {
    id: "hasad",
    name: "Envy (Hasad)",
    content: {
      intro:
        "Hasad is resenting a blessing in someone else's hand — the first sin committed against Adam. It harms the envier first: his own worship burns while the blessing he resents stays exactly where Allah placed it.",
      points: [
        {
          title: "Envy devours good deeds",
          detail:
            "The Prophet (peace be upon him) said: 'Avoid envy, for envy devours good deeds just as fire devours fuel…' Years of prayer and charity can be eaten quietly from within by a heart that cannot bear another's blessing.",
          note: "Abu Dawud 43:131",
        },
        {
          title: "The cure",
          detail:
            "Make du'a for the person you envy — sincerely asking Allah to increase them; congratulate them out loud; and remember that Allah's giving follows His wisdom. What He allotted you was never diminished by what He gave another. The evil-eye page covers envy's outward harm and the refuge from it.",
        },
      ],
    },
  },
  {
    id: "gheebah",
    name: "Backbiting (Gheebah)",
    content: {
      intro:
        "The Quran gives backbiting the ugliest image in the Book — eating the flesh of your dead brother — and the Prophet (peace be upon him) defined it so precisely that no one can pretend not to recognize it.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱجْتَنِبُوا۟ كَثِيرًا مِّنَ ٱلظَّنِّ إِنَّ بَعْضَ ٱلظَّنِّ إِثْمٌ ۖ وَلَا تَجَسَّسُوا۟ وَلَا يَغْتَب بَّعْضُكُم بَعْضًا ۚ أَيُحِبُّ أَحَدُكُمْ أَن يَأْكُلَ لَحْمَ أَخِيهِ مَيْتًا فَكَرِهْتُمُوهُ ۚ وَٱتَّقُوا۟ ٱللَّهَ ۚ إِنَّ ٱللَّهَ تَوَّابٌ رَّحِيمٌ",
        text: "O you who believe, avoid much suspicion, for some suspicions are sin. Do not spy on one another, nor backbite one another. Would any of you like to eat the flesh of his dead brother? You would surely abhor it. So fear Allah. Indeed, Allah is Accepting of Repentance, Most Merciful.",
        ref: "Quran 49:12",
      },
      points: [
        {
          title: "The Prophet's definition",
          detail:
            "The Prophet (peace be upon him) asked: 'Do you know what is backbiting?' They said: Allah and His Messenger know best. He said: 'Backbiting implies your talking about your brother in a manner which he does not like.' It was said: What if that failing is actually in my brother? He said: 'If (that failing) is actually found (in him) what you assert, you in fact backbited him, and if that is not in him it is a slander.'",
          note: "Muslim 45:91",
        },
        {
          title: "True does not make it permissible",
          detail:
            "The most common excuse — 'but it's true!' — is answered inside the definition itself: if it is true, it is backbiting; if false, it is the worse sin of slander (buhtan). The believer's tongue is safest busy with dhikr and silent about people.",
          note: "Muslim 45:91",
        },
      ],
    },
  },
  {
    id: "kibr",
    name: "Arrogance (Kibr)",
    content: {
      intro:
        "Kibr is the disease of Iblis — and the Prophet (peace be upon him) attached to it one of the most severe warnings in the Sunnah, while defining it with surgical precision.",
      points: [
        {
          title: "A mustard seed of pride",
          detail:
            "The Prophet (peace be upon him) said: 'He who has in his heart the weight of a mustard seed of pride shall not enter Paradise.' Not a mountain of pride — a mustard seed. The warning is calibrated to how subtly this disease hides.",
          note: "Muslim 1:171",
        },
        {
          title: "What pride actually is",
          detail:
            "When a man worried that loving fine clothes might be pride, the Prophet (peace be upon him) reassured him — 'Verily, Allah is Graceful and He loves Grace' — then defined the disease: 'Pride is disdaining the truth (out of self-conceit) and contempt for the people.' Two symptoms: truth feels beneath you, and people feel beneath you.",
          note: "Muslim 1:171",
        },
        {
          title: "The diagnostic questions",
          detail:
            "How do I receive correction — especially from someone younger, poorer, or less learned? Is there any category of person I quietly feel above? Honest answers to these two questions locate the mustard seed before it grows.",
        },
      ],
    },
  },
  {
    id: "anger",
    name: "Anger",
    content: {
      intro:
        "Unrestrained anger is the gateway through which almost every other sin of the tongue and hand enters. The Prophet (peace be upon him) treated it as urgent — and left a concrete first-aid protocol for it.",
      points: [
        {
          title: "'Do not become angry'",
          detail:
            "A man said to the Prophet (peace be upon him), 'Advise me!' The Prophet said, 'Do not become angry and furious.' The man asked again and again, and he said in each case, 'Do not become angry and furious.' One request for advice, one repeated answer — that is how central this is to character.",
          note: "Bukhari 78:143",
        },
        {
          title: "The word that extinguishes it",
          detail:
            "Watching a man whose face had reddened with rage, the Prophet (peace be upon him) said: 'I know a word, the saying of which will cause him to relax, if he does say it. If he says: I seek Refuge with Allah from Satan, then all his anger will go away.' Anger is the Shaytan's moment — naming him and seeking refuge breaks it.",
          note: "Bukhari 59:91; Muslim 45:144",
        },
        {
          title: "Change your posture",
          detail:
            "The Prophet (peace be upon him) said: 'When one of you becomes angry while standing, he should sit down. If the anger leaves him, well and good; otherwise he should lie down.' Physical de-escalation, prescribed fourteen centuries before anger management: sit, then lie down, and say nothing until it passes.",
          note: "Abu Dawud 43:10",
        },
      ],
    },
  },
  {
    id: "lying",
    name: "Lying",
    content: {
      intro:
        "Lying is the reverse of the path of sidq: each falsehood makes the next easier, until a person is written before Allah as a liar.",
      points: [
        {
          title: "Falsehood leads to the Fire",
          detail:
            "The Prophet (peace be upon him) said: 'Avoid falsehood, for falsehood leads to wickedness, and wickedness to hell; and if a man continues to speak falsehood and makes falsehood his object, he will be recorded in Allah's presence as a great liar.'",
          note: "Abu Dawud 43:217; Bukhari 78:121",
        },
        {
          title: "Even in jest",
          detail:
            "The guarantee of 'a house in the middle of Paradise' is for 'a man who avoids lying even if he were joking.' The exaggerated story and the invented excuse both count — truthfulness admits no small print.",
          note: "Abu Dawud 43:28",
        },
      ],
    },
  },
  {
    id: "nifaq",
    name: "Signs of Hypocrisy",
    content: {
      intro:
        "The Prophet (peace be upon him) named three everyday behaviors as the signs of a hypocrite — not to license calling others hypocrites, but so each believer can audit himself.",
      points: [
        {
          title: "The three signs",
          detail:
            "The Prophet (peace be upon him) said: 'The signs of a hypocrite are three: Whenever he speaks, he tells a lie. Whenever he promises, he always breaks it. If you trust him, he proves to be dishonest.' Speech, promises, trusts — the three arenas where inner and outer either match or split.",
          note: "Bukhari 2:26",
        },
        {
          title: "Worship does not cancel them",
          detail:
            "In Muslim's narration: 'Three are the signs of a hypocrite, even if he observed fast and prayed and asserted that he was a Muslim.' Prayer and fasting do not neutralize broken promises and betrayed trusts — character is not a separate, optional department of the religion.",
          note: "Muslim 1:119",
        },
        {
          title: "A mirror, not a weapon",
          detail:
            "The companions feared hypocrisy for themselves more than anyone; the righteous have always read this hadith inward. Use it on your own promises, your own excuses, your own handling of what people entrust to you — never as a label for others.",
        },
      ],
    },
  },
];

const purificationTopics: Topic[] = [
  {
    id: "muhasabah",
    name: "Self-Accounting (Muhasabah)",
    content: {
      intro:
        "Muhasabah is the regular, honest audit of your own soul — the discipline the Quran ties to success itself. Character does not improve by accident; it improves by review.",
      verse: {
        arabic: "قَدْ أَفْلَحَ مَن زَكَّىٰهَا وَقَدْ خَابَ مَن دَسَّىٰهَا",
        text: "Indeed, he who purifies his soul will attain success, and he who corrupts it will be doomed.",
        ref: "Quran 91:9-10",
      },
      points: [
        {
          title: "Take account before you are taken to account",
          detail:
            "The early Muslims urged taking account of yourself before you are taken to account, and weighing your deeds before they are weighed for you. The Day of Judgement is an audit; muhasabah is simply doing the audit first, while the ledger can still be changed.",
        },
        {
          title: "A practical nightly review",
          detail:
            "A few minutes before sleep: What did my tongue do today? Whom did I wrong, and can I apologize tomorrow? Which prayer was rushed? One sincere istighfar over a named fault does more for character than a vague resolve to 'be better'.",
        },
      ],
    },
  },
  {
    id: "dhikr",
    name: "Remembrance (Dhikr)",
    content: {
      intro:
        "A heart being purified needs a constant climate of remembrance. Dhikr softens the heart, starves the diseases, and is the difference — in the Prophet's (peace be upon him) own image — between a living heart and a dead one.",
      verse: {
        arabic: "ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
        text: "those who believe and whose hearts find tranquility in the remembrance of Allah, for indeed in the remembrance of Allah do hearts find tranquility.",
        ref: "Quran 13:28",
      },
      points: [
        {
          title: "The living and the dead",
          detail:
            "The Prophet (peace be upon him) said: 'The house in which remembrance of Allah is made and the house in which Allah is not remembered are like the living and the dead.' The same is true of hearts — dhikr is not an extra; it is the pulse.",
          note: "Muslim 6:251",
        },
        {
          title: "Dhikr crowds out the diseases",
          detail:
            "A tongue busy with subhanallah has no bandwidth for backbiting; a heart watching Allah has little room for riya. The daily adhkar — morning, evening, after prayer — are the maintenance schedule of the purified heart. The dhikr page on this app walks through them all.",
        },
      ],
    },
  },
  {
    id: "tawbah",
    name: "Repentance (Tawbah)",
    content: {
      intro:
        "No one purifies the heart without falling along the way. Tawbah — turning back to Allah — is how the believer converts every fall into a step forward, and Allah receives it with a joy the Prophet (peace be upon him) described unforgettably.",
      points: [
        {
          title: "Allah's joy at your return",
          detail:
            "The Prophet (peace be upon him) said: 'Allah is more pleased with the repentance of His slave than anyone of you is pleased with finding his camel which he had lost in the desert.' Repentance is not met with a grudging pardon but with delight.",
          note: "Bukhari 80:6; Muslim 50:2",
        },
        {
          title: "The best of sinners",
          detail:
            "The Prophet (peace be upon him) said: 'Every son of Adam sins, and the best of the sinners are the repentant.' The standard was never sinlessness — it is the speed and sincerity of the return.",
          note: "Tirmidhi 37:85",
        },
        {
          title: "Repentance owed to people",
          detail:
            "Where the sin wronged a person — backbiting, broken trust, harshness — scholars note that setting it right includes, where possible, restoring the right or seeking the person's pardon, alongside seeking Allah's forgiveness. Tawbah repairs both directions: up to Allah, and across to people.",
        },
      ],
    },
  },
  {
    id: "company",
    name: "Righteous Company",
    content: {
      intro:
        "Character is contagious. The Prophet (peace be upon him) captured a lifetime of social wisdom in one image: the musk seller and the blacksmith's bellows.",
      points: [
        {
          title: "The musk seller and the bellows",
          detail:
            "The Prophet (peace be upon him) said: 'The example of a good companion (who sits with you) in comparison with a bad one, is like that of the musk seller and the blacksmith's bellows (or furnace); from the first you would either buy musk or enjoy its good smell while the bellows would either burn your clothes or your house, or you get a bad nasty smell thereof.' No one leaves either shop unchanged.",
          note: "Bukhari 34:54; Muslim 45:189",
        },
        {
          title: "Choose your air",
          detail:
            "Company — including the online kind — is the air your character breathes. Sit with people whose presence makes dhikr, honesty, and gentleness easier; reduce the feeds and gatherings that normalize mockery, envy, and coarse speech. Over years, you become the room you sit in.",
        },
      ],
    },
  },
];

const tabs = [
  { key: "why", label: "Why Character" },
  { key: "virtues", label: "Virtues" },
  { key: "diseases", label: "Diseases of the Heart" },
  { key: "purification", label: "Purification" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* Sources & References for a single active sub-topic — one row per cited
   point (plus the topic's own verse, if any), scoped to whatever the user
   has selected rather than the whole tab. Mirrors the groupSourceRefs
   pattern in /why-islam, adapted for this page's per-point `note` refs. */
const topicSourceRefs = (topic?: Topic) => {
  if (!topic) return [];
  const rows: { ref: string; desc: string }[] = [];
  if (topic.content.verse) {
    rows.push({ ref: topic.content.verse.ref, desc: topic.name });
  }
  for (const point of topic.content.points) {
    if (point.note) rows.push({ ref: point.note, desc: point.title });
  }
  return rows;
};

/* ───────────────────────── page ───────────────────────── */

function CharacterContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const t = searchParams.get("tab");
    return t && tabs.some((x) => x.key === t) ? (t as TabKey) : "why";
  });
  // Deep-link support: ?tab=<key>&sub=<topic id>. The initial ?sub= is applied
  // to whichever rail it belongs to; ids are unique across the page.
  const initialSub = searchParams.get("sub");
  const [virtueSub, setVirtueSub] = useState(() =>
    initialSub && virtueTopics.some((t) => t.id === initialSub) ? initialSub : virtueTopics[0].id
  );
  const [diseaseSub, setDiseaseSub] = useState(() =>
    initialSub && diseaseTopics.some((t) => t.id === initialSub) ? initialSub : diseaseTopics[0].id
  );
  const [purifySub, setPurifySub] = useState(() =>
    initialSub && purificationTopics.some((t) => t.id === initialSub)
      ? initialSub
      : purificationTopics[0].id
  );
  const [search, setSearch] = useState("");

  const replaceUrl = (tab: TabKey, sub?: string) => {
    router.replace(`${pathname}?tab=${tab}${sub ? `&sub=${sub}` : ""}`, { scroll: false });
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
    replaceUrl(key as TabKey);
  };

  const handleSubChange = (tab: TabKey, setter: (s: string) => void) => (sub: string) => {
    setter(sub);
    replaceUrl(tab, sub);
  };

  const topicMatches = (t: Topic) => {
    if (!search || search.length < 2) return true;
    return textMatch(
      search,
      t.name,
      t.content.intro,
      t.content.source,
      t.content.verse?.text,
      ...t.content.points.map((p) => p.title),
      ...t.content.points.map((p) => p.detail)
    );
  };

  /* auto-select the first visible topic when search filters out the active one */
  useEffect(() => {
    if (!search || search.length < 2) return;
    const fix = (topics: Topic[], active: string, set: (s: string) => void) => {
      const visible = topics.filter(topicMatches);
      if (visible.length && !visible.some((t) => t.id === active)) set(visible[0].id);
    };
    fix(virtueTopics, virtueSub, setVirtueSub);
    fix(diseaseTopics, diseaseSub, setDiseaseSub);
    fix(purificationTopics, purifySub, setPurifySub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, virtueSub, diseaseSub, purifySub]);

  const renderTopicRail = (
    topics: Topic[],
    activeSub: string,
    onSubChange: (s: string) => void
  ) => {
    const visible = topics.filter(topicMatches);
    const active = visible.find((t) => t.id === activeSub);
    return (
      <SubTabLayout
        subs={visible.map((t) => ({ key: t.id, label: t.name }))}
        activeSub={activeSub}
        setActiveSub={onSubChange}
      >
        {active && <TopicInfoCard topic={active} />}
      </SubTabLayout>
    );
  };

  return (
    <div>
      <PageHeader
        title="Character (Akhlaq)"
        titleAr="الأخلاق"
        subtitle="The virtues the Prophet ﷺ embodied, the diseases of the heart, and how the soul is purified."
      />

      {/* Opening verse — above search + tabs, matching every other content page. */}
      <VerseHero
        arabic="وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ"
        text="Indeed, you are of a great moral character."
        reference="Quran 68:4"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search topics, virtues..." className="mb-6" />

      <TabBar tabs={[...tabs]} activeTab={activeTab} onTabChange={handleTabChange} className="mb-6" />

      <AnimatePresence mode="wait">
        {/* ─── Why Character ─── */}
        {activeTab === "why" && (
          <motion.div
            key="why"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                Character is the point of the mission
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  Allah described His Messenger (peace be upon him) with a single, sweeping
                  sentence: <em>&ldquo;Indeed, you are of a great moral character&rdquo;</em>{" "}
                  (Quran 68:4). The Prophet (peace be upon him) himself summarized his mission
                  as the perfection of character: &ldquo;I was sent only to perfect noble
                  character&rdquo; — reported in Musnad Ahmad (8952), graded sahih by al-Albani
                  (as-Sahihah 45). Akhlaq is not a garnish on top of the religion; it is what
                  the religion is for.
                </p>
                <p>
                  And it is how the Prophet (peace be upon him) ranked people. Abdullah bin Amr
                  narrated that he never used bad language, and used to say:{" "}
                  <em>
                    &ldquo;The best amongst you are those who have the best manners and
                    character.&rdquo;
                  </em>{" "}
                  (Bukhari 61:68). Not the wealthiest, not the most eloquent — the best in
                  character.
                </p>
              </div>
            </ContentCard>

            <ContentCard delay={0.15}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                The heaviest thing on the scale
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  On the Day when deeds are weighed, nothing outweighs good character. The
                  Prophet (peace be upon him) said:{" "}
                  <em>
                    &ldquo;There is nothing heavier than good character put in the scale of a
                    believer on the Day of Resurrection.&rdquo;
                  </em>{" "}
                  (Abu Dawud 43:27). Tirmidhi&apos;s narration adds the warning on the other
                  side: <em>&ldquo;For indeed Allah, Most High, is angered by the shameless
                  obscene person&rdquo;</em> (Tirmidhi 27:108).
                </p>
                <p>
                  Years of worship sit on the same scale as how you spoke to your family this
                  morning. That is the weight Islam assigns to akhlaq.
                </p>
              </div>
            </ContentCard>

            <ContentCard delay={0.2}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                Three houses in Paradise
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  The Prophet (peace be upon him) said:{" "}
                  <em>
                    &ldquo;I guarantee a house in the surroundings of Paradise for a man who
                    avoids quarrelling even if he were in the right, a house in the middle of
                    Paradise for a man who avoids lying even if he were joking, and a house in
                    the upper part of Paradise for a man who made his character good.&rdquo;
                  </em>{" "}
                  (Abu Dawud 43:28).
                </p>
                <p>
                  Notice the ladder: leaving arguments, leaving even joking lies, and — at the
                  very top — good character itself. The tabs of this page walk that ladder: the
                  virtues to build, the diseases to uproot, and the daily work of purification.
                </p>
              </div>
            </ContentCard>

            <SourcesCard
              delay={0.25}
              sources={[
                { ref: "Quran 68:4", desc: "'Indeed, you are of a great moral character'" },
                { ref: "Bukhari 61:68", desc: "The best of you are the best in manners and character" },
                { ref: "Abu Dawud 43:27", desc: "Nothing heavier than good character on the scale" },
                { ref: "Tirmidhi 27:108", desc: "Nothing heavier on the Scale; Allah is angered by obscenity" },
                { ref: "Abu Dawud 43:28", desc: "Three guaranteed houses in Paradise" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Virtues ─── */}
        {activeTab === "virtues" && (
          <motion.div
            key="virtues"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(virtueTopics, virtueSub, handleSubChange("virtues", setVirtueSub))}

            <SourcesCard
              className="mt-8"
              sources={topicSourceRefs(virtueTopics.find((t) => t.id === virtueSub))}
            />
          </motion.div>
        )}

        {/* ─── Diseases of the Heart ─── */}
        {activeTab === "diseases" && (
          <motion.div
            key="diseases"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(diseaseTopics, diseaseSub, handleSubChange("diseases", setDiseaseSub))}

            {/* Companion pages */}
            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">Related on this app</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Envy&apos;s outward harm — the evil eye — and the prophetic protection from it
                have their own page.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/protection?tab=evil-eye&sub=envy-hasad"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Envy &amp; the evil eye →
                </Link>
              </div>
            </ContentCard>

            <SourcesCard
              className="mt-6"
              sources={topicSourceRefs(diseaseTopics.find((t) => t.id === diseaseSub))}
            />
          </motion.div>
        )}

        {/* ─── Purification ─── */}
        {activeTab === "purification" && (
          <motion.div
            key="purification"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(
              purificationTopics,
              purifySub,
              handleSubChange("purification", setPurifySub)
            )}

            {/* Companion pages */}
            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">Live it daily</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Character is trained in the day-to-day. The daily Sunnah guide covers speech and
                conduct, the dhikr page holds the full adhkar, forgiveness du&apos;as have their
                own collection, and the kids section teaches these traits to children.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/muslim-daily?tab=sunnah&sub=speech"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Speech &amp; conduct in daily life →
                </Link>
                <Link
                  href="/dhikr"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Daily dhikr →
                </Link>
                <Link
                  href="/tawbah"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Repentance (Tawbah) →
                </Link>
                <Link
                  href="/duas?tab=forgiveness"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Du&apos;as of forgiveness →
                </Link>
                <Link
                  href="/kids"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Teaching kids →
                </Link>
              </div>
            </ContentCard>

            <SourcesCard
              className="mt-6"
              sources={topicSourceRefs(purificationTopics.find((t) => t.id === purifySub))}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CharacterPage() {
  return (
    <Suspense>
      <CharacterContent />
    </Suspense>
  );
}
