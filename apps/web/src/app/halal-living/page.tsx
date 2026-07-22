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

/* ───────────────────────── data ─────────────────────────
   All Quranic Arabic and verse translations below are spliced verbatim from
   packages/content/quran (byte-identical). Hadith quotations match the local
   corpus in packages/content/hadith. Rulings on which scholars genuinely
   differ are presented as differed — never as absolutes. */

const principlesTopics: Topic[] = [
  {
    id: "halal-is-clear",
    name: "The Halal is Clear",
    content: {
      intro:
        "One hadith carries the whole framework of halal living. An-Nu'man ibn Bashir heard the Prophet (peace be upon him) declare that the lawful and the unlawful are both plain — and that the fate of the religion is decided in the gray zone between them.",
      points: [
        {
          title: "The foundational hadith",
          detail:
            "The Prophet (peace be upon him) said: 'Both legal and illegal things are evident but in between them there are doubtful (suspicious) things and most of the people have no knowledge about them. So whoever saves himself from these suspicious things saves his religion and his honor.' Most of daily life is not a puzzle — the clear halal is vast, the clear haram is limited and known.",
          note: "Bukhari 2:45; Muslim 22:133",
        },
        {
          title: "Allah's private pasture",
          detail:
            "The same hadith continues: 'And whoever indulges in these suspicious things is like a shepherd who grazes (his animals) near the Hima (private pasture) of someone else and at any moment he is liable to get in it. (O people!) Beware! Every king has a Hima and the Hima of Allah on the earth is His illegal (forbidden) things.' Circling the edge of the haram is how people fall into it.",
          note: "Bukhari 2:45",
        },
        {
          title: "The heart decides the body",
          detail:
            "It ends: 'Beware! There is a piece of flesh in the body if it becomes good (reformed) the whole body becomes good but if it gets spoilt the whole body gets spoilt and that is the heart.' Halal living is not a checklist imposed from outside — it flows from a sound heart, and in turn keeps the heart sound.",
          note: "Bukhari 2:45",
        },
      ],
    },
  },
  {
    id: "original-permissibility",
    name: "The Default is Permissible",
    content: {
      intro:
        "Islam did not arrive to forbid the world. Scholars state as a foundational principle that worldly things — food, trade, clothing, tools, customs — are permissible by default, and only what Allah and His Messenger prohibited is forbidden.",
      verse: {
        arabic: "قُلْ مَنْ حَرَّمَ زِينَةَ ٱللَّهِ ٱلَّتِىٓ أَخْرَجَ لِعِبَادِهِۦ وَٱلطَّيِّبَـٰتِ مِنَ ٱلرِّزْقِ ۚ قُلْ هِىَ لِلَّذِينَ ءَامَنُوا۟ فِى ٱلْحَيَوٰةِ ٱلدُّنْيَا خَالِصَةً يَوْمَ ٱلْقِيَـٰمَةِ ۗ كَذَٰلِكَ نُفَصِّلُ ٱلْـَٔايَـٰتِ لِقَوْمٍ يَعْلَمُونَ",
        text: "Say, “Who has forbidden the adornments and lawful provisions that Allah has brought forth for His slaves?” Say, “They are for the believers in the life of this world, and they will be exclusively for them on the Day of Resurrection. This is how We make the verses clear for people who have knowledge.”",
        ref: "Quran 7:32",
      },
      points: [
        {
          title: "The halal is vast",
          detail:
            "The Quran addresses all people: 'O people, eat from what is lawful and good on earth, and do not follow the footsteps of Satan, for he is your sworn enemy.' The earth and its good things are the starting point; prohibition is the exception that must be proven, not assumed.",
          note: "Quran 2:168",
        },
        {
          title: "Inventing prohibitions is itself a wrong",
          detail:
            "The verse above is a rebuke: 'Who has forbidden the adornments and lawful provisions that Allah has brought forth for His slaves?' Scholars note that declaring the halal to be haram is as serious an offense against Allah's law as the reverse — both claim His right to legislate.",
          note: "Quran 7:32",
        },
        {
          title: "So live, and enjoy gratefully",
          detail:
            "'O children of Adam, dress well for every prayer. Eat and drink, but do not waste, for He does not like the wasteful.' The believer eats, dresses, works, and celebrates — with gratitude and without excess. Halal living is a full life, not a shrunken one.",
          note: "Quran 7:31",
        },
      ],
    },
  },
  {
    id: "doubtful-matters",
    name: "Doubtful Matters",
    content: {
      intro:
        "Between the clear halal and the clear haram lie the doubtful things. The Sunnah gives a calm, practical method for them — caution without obsession.",
      points: [
        {
          title: "Guarding the doubtful guards everything",
          detail:
            "In Muslim's wording: 'So he who guards against doubtful things keeps his religion and honour blameless, and he who indulges in doubtful things indulges in fact in unlawful things.' Leaving a gray area is never a loss — it is the very act that protects both faith and reputation.",
          note: "Muslim 22:133",
        },
        {
          title: "Leave what makes you doubt",
          detail:
            "Al-Hasan ibn Ali said: 'I memorized from him (the Messenger of Allah, peace be upon him): Leave that which makes you doubt for that which does not make you doubt.' When two options sit before you and one is unambiguous, the Sunnah is simply to take the clean one.",
          note: "Nasai 51:173",
        },
        {
          title: "Caution, not obsession",
          detail:
            "Scholars caution that this principle is for genuine doubt — not for waswasa (obsessive misgivings) about things already clearly halal. If a matter genuinely troubles you, ask someone with sound knowledge; then act and move on. Endless second-guessing of the clear halal is a trick of Shaytan, not piety.",
        },
      ],
    },
  },
  {
    id: "taqwa-of-the-stomach",
    name: "Taqwa of the Stomach",
    content: {
      intro:
        "What enters the body — and how it was earned — is not a side issue. The Prophet (peace be upon him) tied the acceptance of worship itself to the purity of a person's food, drink, and income.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُلُوا۟ مِن طَيِّبَـٰتِ مَا رَزَقْنَـٰكُمْ وَٱشْكُرُوا۟ لِلَّهِ إِن كُنتُمْ إِيَّاهُ تَعْبُدُونَ",
        text: "O you who believe, eat of the good things We have provided for you, and be grateful to Allah, if you truly worship Him alone.",
        ref: "Quran 2:172",
      },
      points: [
        {
          title: "Allah accepts only the pure",
          detail:
            "The Prophet (peace be upon him) said: 'O people, Allah is Good and He therefore, accepts only that which is good. And Allah commanded the believers as He commanded the Messengers...' — then he cited the very verse above. The standard set for the Messengers is the standard set for us.",
          note: "Muslim 12:83",
        },
        {
          title: "The du'a that cannot rise",
          detail:
            "In the same hadith he described 'a person who travels widely, his hair disheveled and covered with dust. He lifts his hand towards the sky (and thus makes the supplication): O Lord, O Lord, whereas his diet is unlawful, his drink is unlawful, and his clothes are unlawful and his nourishment is unlawful. How can then his supplication be accepted?' Haram consumption severs the very line to Allah.",
          note: "Muslim 12:83",
        },
        {
          title: "Eating halal is itself worship",
          detail:
            "'So eat from the lawful and good things that Allah has provided for you, and be grateful for Allah's blessings, if it is Him that you worship.' The Quran places halal eating next to gratitude and worship — a meal eaten mindfully of its lawfulness is an act of din, not just of diet.",
          note: "Quran 16:114",
        },
      ],
    },
  },
];

const foodTopics: Topic[] = [
  {
    id: "what-is-forbidden",
    name: "What is Forbidden",
    content: {
      intro:
        "The Quran names the prohibited foods explicitly — a short, closed list. Everything wholesome outside it remains halal.",
      verse: {
        arabic: "إِنَّمَا حَرَّمَ عَلَيْكُمُ ٱلْمَيْتَةَ وَٱلدَّمَ وَلَحْمَ ٱلْخِنزِيرِ وَمَآ أُهِلَّ بِهِۦ لِغَيْرِ ٱللَّهِ ۖ فَمَنِ ٱضْطُرَّ غَيْرَ بَاغٍ وَلَا عَادٍ فَلَآ إِثْمَ عَلَيْهِ ۚ إِنَّ ٱللَّهَ غَفُورٌ رَّحِيمٌ",
        text: "He has only forbidden to you carrion, blood, the flesh of swine, and what has been sacrificed to other than Allah. But if someone is compelled by necessity – neither driven by desire nor exceeding immediate need – then there is no sin upon him; for Allah is All-Forgiving, Most Merciful.",
        ref: "Quran 2:173",
      },
      points: [
        {
          title: "The full list",
          detail:
            "Surah al-Ma'idah expands the same core: 'Forbidden to you are carrion, blood, the flesh of swine, and that which is sacrificed to other than Allah; and that which is killed by strangling, or by a violent blow, or by a headlong fall, or by being gored; and that which is partly eaten by a predator unless you slaughter it [before it dies]; and that which is sacrificed to idols.' Beyond these texts, scholars also count predatory animals and a small number of other categories from the Sunnah.",
          note: "Quran 5:3",
        },
        {
          title: "Necessity is measured, not open-ended",
          detail:
            "The verse itself carves out the exception: one 'compelled by necessity — neither driven by desire nor exceeding immediate need' bears no sin. Genuine, life-preserving necessity lifts the prohibition only to its own extent — a principle scholars apply carefully, not casually.",
          note: "Quran 2:173",
        },
        {
          title: "Everything else stays halal",
          detail:
            "Because the default of foods is permissibility, the burden of proof is always on prohibition. Fruits, vegetables, grains, seafood (which the majority of scholars hold broadly permissible), and properly slaughtered livestock make the halal table enormously wide.",
          note: "Quran 2:168",
        },
      ],
    },
  },
  {
    id: "slaughter-zabiha",
    name: "Slaughter & Zabiha",
    content: {
      intro:
        "For land animals that require slaughter, Islam prescribes a method defined by the mention of Allah's name and by excellence toward the animal itself.",
      points: [
        {
          title: "Excellence even in slaughter",
          detail:
            "The Prophet (peace be upon him) said: 'Verily Allah has enjoined goodness to everything; so when you kill, kill in a good way and when you slaughter, slaughter in a good way. So every one of you should sharpen his knife, and let the slaughtered animal die comfortably.' Halal slaughter is inseparable from mercy — a sharp blade, a swift cut, no cruelty before or during.",
          note: "Muslim 34:84",
        },
        {
          title: "In Allah's name, for Allah alone",
          detail:
            "The Quran forbids 'that which is sacrificed to other than Allah' — dedication of the animal to anyone besides Him voids it entirely. Scholars state that valid slaughter requires a Muslim (or, per the verse below, a Jew or Christian), cutting the throat and vessels, and the mention of Allah's name — with the madhhabs differing on details such as whether an omitted tasmiyah (deliberate or forgetful) invalidates the meat.",
          note: "Quran 5:3",
        },
        {
          title: "The food of the People of the Book",
          detail:
            "'As the food of the people of the Book is lawful to you, and your food is lawful to them.' Scholars agree this verse permits the slaughtered meat of Jews and Christians in principle; they differ over how it applies to modern industrial slaughter — whether today's mechanized processing in historically Christian lands still qualifies. Positions range across the madhhabs, so many practicing Muslims follow the position of the scholars they trust, and choose certified halal where it is available.",
          note: "Quran 5:5",
        },
      ],
    },
  },
  {
    id: "alcohol",
    name: "Alcohol — Total Avoidance",
    content: {
      intro:
        "The Quran did not merely discourage intoxicants; it commanded total avoidance, and the Prophet (peace be upon him) closed every loophole of name, quantity, and involvement.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِنَّمَا ٱلْخَمْرُ وَٱلْمَيْسِرُ وَٱلْأَنصَابُ وَٱلْأَزْلَـٰمُ رِجْسٌ مِّنْ عَمَلِ ٱلشَّيْطَـٰنِ فَٱجْتَنِبُوهُ لَعَلَّكُمْ تُفْلِحُونَ",
        text: "O you who believe, intoxicants, gambling, [sacrificing on] stone alters and divining arrows are of Satan’s evil work; therefore avoid such [evil], so that you may be successful.",
        ref: "Quran 5:90",
      },
      points: [
        {
          title: "Every intoxicant, whatever it is called",
          detail:
            "Ibn Umar reported the Prophet (peace be upon him) saying: 'Every intoxicant is Khamr and every intoxicant is forbidden.' And an-Nu'man ibn Bashir heard him say: 'Wine is made from grape-syrup, raisins, dried dates, wheat, barley, millet, and I forbid you from every intoxicant.' The ruling follows the intoxication, not the ingredient or the label.",
          note: "Muslim 36:92; Abu Dawud 27:9",
        },
        {
          title: "Quantity is no loophole",
          detail:
            "The Prophet (peace be upon him) said: 'What intoxicates in large amounts, a small amount of it is unlawful.' There is no 'moderate drinking' in Islam — the first sip of what intoxicates is as forbidden as the last.",
          note: "Nasai 51:69",
        },
        {
          title: "The entire chain is cursed",
          detail:
            "'Allah has cursed wine, its drinker, its server, its seller, its buyer, its presser, the one for whom it is pressed, the one who conveys it, and the one to whom it is conveyed.' This is why serving, selling, and transporting alcohol are avoided as scrupulously as drinking it — relevant to jobs in bars, delivery, and retail.",
          note: "Abu Dawud 27:6",
        },
        {
          title: "Why so absolute",
          detail:
            "The next verse answers: 'Satan only wants to create enmity and hatred between you through intoxicants and gambling, and to prevent you from remembering Allah and from prayer. Will you not then abstain?' Intoxication attacks the two things halal living protects — the bonds between people and the bond with Allah.",
          note: "Quran 5:91",
        },
      ],
    },
  },
  {
    id: "gelatin-additives",
    name: "Gelatin & Additives",
    content: {
      intro:
        "Modern food chemistry raises questions the classical books never faced by name — gelatin, enzymes, emulsifiers, trace alcohol in flavorings. These are genuinely differed-upon contemporary questions, not clear-cut prohibitions or permissions.",
      points: [
        {
          title: "The istihalah debate",
          detail:
            "The pivot of the gelatin question is istihalah — complete chemical transformation. Some scholars hold that a substance transformed into something new (as pork collagen becomes gelatin) takes a new ruling and becomes permissible; others hold the original impurity remains. Both positions rest on recognized fiqh principles, so contemporary fatwa bodies genuinely differ.",
        },
        {
          title: "Trace alcohol and flavorings",
          detail:
            "Scholars state that minute, non-intoxicating traces of alcohol used as a solvent or formed naturally (as in vinegar, ripe fruit, or bread) do not fall under the ruling of khamr for many fatwa bodies, while others advise stricter avoidance where alternatives exist. The agreed line: anything consumed in a way or quantity that could intoxicate is categorically haram.",
        },
        {
          title: "A practical approach",
          detail:
            "Where certified-halal or clearly plant/microbial/fish-sourced versions exist, choosing them removes the doubt entirely — the Sunnah of leaving what makes you doubt. Where they do not, follow a reliable scholarly body consistently rather than ruling case-by-case by mood, and do not condemn Muslims who follow a different valid position.",
          note: "Nasai 51:173",
        },
      ],
    },
  },
  {
    id: "eating-out",
    name: "Eating Out",
    content: {
      intro:
        "Restaurants, travel, and shared tables are where halal awareness meets real life. The method is the same everywhere: avoid the clear haram, ask when in doubt, and stay gracious.",
      points: [
        {
          title: "Know the clear lines",
          detail:
            "Pork and its derivatives and alcohol (including as a cooking ingredient where it remains present) are avoided outright. For meat and poultry, apply whichever position on slaughter you follow — vegetarian, seafood, and dairy options are a straightforward fallback almost anywhere.",
          note: "Quran 5:3; Quran 5:90",
        },
        {
          title: "Asking is not awkward — it is Sunnah",
          detail:
            "Asking a server how a dish is prepared, whether the stock contains wine, or whether the fryer is shared with pork items is simply guarding against the doubtful. Scholars advise reasonable diligence, not forensic investigation: you are answerable for what you can reasonably know, not for hidden kitchen details after honest inquiry.",
        },
        {
          title: "Keep good company gracefully",
          detail:
            "Sharing a table with colleagues or family who order differently is not itself sinful eating; many scholars advise avoiding gatherings whose actual purpose is drinking, while ordinary meals are navigated with courtesy and a clear personal line. A Muslim's cheerful, unfussy discipline at the table is itself da'wah.",
        },
      ],
    },
  },
];

const moneyTopics: Topic[] = [
  {
    id: "gravity-of-riba",
    name: "The Gravity of Riba",
    content: {
      intro:
        "No sin of wealth is condemned in the Quran like riba (usury/interest). It is the only sin against which Allah declares war in His Book.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَذَرُوا۟ مَا بَقِىَ مِنَ ٱلرِّبَوٰٓا۟ إِن كُنتُم مُّؤْمِنِينَ",
        text: "O you who believe, fear Allah and give up usury that is still due, if you are truly believers.",
        ref: "Quran 2:278",
      },
      points: [
        {
          title: "A declaration of war",
          detail:
            "The Quran warns: 'Those who consume usury will not stand [on the Day of Resurrection] except like those being beaten by Satan. That is because they say, Trade is just like usury. But Allah has permitted trade and forbidden usury.' And to those who persist: 'beware of a declaration of war from Allah and His Messenger. However, if you repent, you may retain your capital — neither harming nor suffering harm.'",
          note: "Quran 2:275; Quran 2:279",
        },
        {
          title: "Everyone at the table is cursed",
          detail:
            "Jabir said that Allah's Messenger (peace be upon him) 'cursed the accepter of interest and its payer, and one who records it, and the two witnesses, and he said: They are all equal.' The prohibition covers the whole transaction — taking, paying, drafting, and witnessing.",
          note: "Muslim 22:132",
        },
        {
          title: "Among the seven destructive sins",
          detail:
            "The Prophet (peace be upon him) said: 'Avoid the seven great destructive sins' — and listed eating riba alongside shirk, sorcery, and unjust killing. This ranking is why practicing Muslims restructure their finances around avoiding it, even at real cost.",
          note: "Bukhari 55:29",
        },
      ],
    },
  },
  {
    id: "honest-trade",
    name: "Honest Trade & Wages",
    content: {
      intro:
        "Islam honors commerce — the Prophet (peace be upon him) was himself a trader — and holds it to a standard of truthfulness that turns the marketplace into a field of worship.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَأْكُلُوٓا۟ أَمْوَٰلَكُم بَيْنَكُم بِٱلْبَـٰطِلِ إِلَّآ أَن تَكُونَ تِجَـٰرَةً عَن تَرَاضٍ مِّنكُمْ ۚ وَلَا تَقْتُلُوٓا۟ أَنفُسَكُمْ ۚ إِنَّ ٱللَّهَ كَانَ بِكُمْ رَحِيمًا",
        text: "O you who believe, do not consume one another’s property unlawfully, unless it is trade conducted with your mutual consent. And do not kill yourselves [or one another]. Indeed, Allah is Most Merciful to you.",
        ref: "Quran 4:29",
      },
      points: [
        {
          title: "Truthfulness brings barakah",
          detail:
            "The Prophet (peace be upon him) said: 'The seller and the buyer have the right to keep or return goods as long as they have not parted or till they part; and if both the parties spoke the truth and described the defects and qualities (of the goods), then they would be blessed in their transaction, and if they told lies or hid something, then the blessings of their transaction would be lost.'",
          note: "Bukhari 34:32",
        },
        {
          title: "Deception expels from the Prophet's way",
          detail:
            "When the Prophet (peace be upon him) found rain-damaged grain hidden beneath the top of a heap, he told the seller: 'Why did you not place this (the drenched part of the heap) over other eatables so that the people could see it? He who deceives is not of me.'",
          note: "Muslim 1:190",
        },
        {
          title: "The rank of the honest merchant",
          detail:
            "'The trustworthy, honest Muslim merchant will be with the martyrs on the Day of Resurrection.' And of traders generally: 'The merchants will be raised on the Day of Resurrection as immoral people, apart from those who fear Allah and act righteously and speak the truth.' Commerce is a path to either rank — the trader chooses.",
          note: "Ibn Majah 12:3; Ibn Majah 12:10",
        },
        {
          title: "Leniency and prompt wages",
          detail:
            "'May Allah's mercy be on him who is lenient in his buying, selling, and in demanding back his money.' And to employers: 'Give the worker his wages before his sweat dries.' Easy dealing and paying people on time are not business style — they are religion.",
          note: "Bukhari 34:29; Ibn Majah 16:8",
        },
      ],
    },
  },
  {
    id: "modern-finance",
    name: "Mortgages, Loans & Insurance",
    content: {
      intro:
        "Interest-based mortgages, student and car loans, credit cards, and conventional insurance are among the most-asked contemporary questions — and among the genuinely debated ones. What follows maps the discussion; it is not a fatwa.",
      points: [
        {
          title: "The agreed core",
          detail:
            "Scholars agree that a loan contract stipulating guaranteed interest is riba, whatever it finances. Contemporary debate is not over whether riba is haram — it is over which modern structures actually constitute it, and what genuine necessity or unavoidable legal requirement (such as mandated insurance) permits.",
          note: "Quran 2:275",
        },
        {
          title: "Where scholars genuinely differ",
          detail:
            "Islamic-finance alternatives (murabaha, ijara, diminishing musharakah) are accepted by many contemporary scholars and criticized by others as interest restructured. Some fatwa bodies have permitted home purchase through conventional mortgages for Muslims in non-Muslim lands under strict conditions of need; others firmly reject this. Conventional insurance is held impermissible by many for its uncertainty (gharar), while cooperative/takaful models — and legally required policies — are broadly accepted.",
        },
        {
          title: "Consult, decide, be consistent",
          detail:
            "These rulings turn on contract details and personal circumstances, so this is precisely where the Quran's command applies: ask the people of knowledge. Put your actual contract before a scholar or fatwa body you trust, follow the answer consistently, and prefer the exit from doubt whenever a workable halal alternative exists.",
          note: "Nasai 51:173",
        },
      ],
    },
  },
  {
    id: "saving-investing",
    name: "Saving & Investing",
    content: {
      intro:
        "Growing wealth is welcome in Islam — through real trade, real assets, and real risk-sharing. A few principles keep a portfolio halal.",
      points: [
        {
          title: "Earn returns from ownership, not interest",
          detail:
            "Scholars state the core test simply: halal profit comes from sharing in an asset's risk and reward — equity, property, business partnership — while a guaranteed return on lent money is riba. In practice this means preferring shariah-screened equity funds and real assets over interest-bearing savings products, and donating unavoidable interest credited to accounts rather than consuming it.",
          note: "Quran 2:275",
        },
        {
          title: "Screen what the business does",
          detail:
            "Contemporary scholars screen investments on two levels: the company's business (excluding alcohol, gambling, conventional finance, and the like) and its financials (limits on interest-bearing debt and income). Certified halal index funds and screening apps now make this practical for ordinary savers — details of the thresholds differ between standards bodies.",
        },
        {
          title: "Avoid gambling-like speculation",
          detail:
            "'Intoxicants, gambling, [sacrificing on] stone alters and divining arrows are of Satan's evil work.' Scholars extend the gambling prohibition to bets dressed as investing — instruments that are pure wagers on price movement with no underlying ownership. The more an 'investment' resembles a casino, the further it sits from the halal.",
          note: "Quran 5:90",
        },
      ],
    },
  },
];

const dressTopics: Topic[] = [
  {
    id: "modesty-inner-outer",
    name: "Modesty, Inner & Outer",
    content: {
      intro:
        "Dress in Islam is the outer garment of an inner quality: haya — modesty, shame before Allah, dignity before people. The clothing rulings only make sense rooted in it.",
      points: [
        {
          title: "A branch of faith itself",
          detail:
            "The Prophet (peace be upon him) said: 'Faith has over seventy branches... and modesty is the branch of faith.' And when he passed a man lecturing his brother against being too modest, he said: 'Leave him alone, for modesty is a part of faith.' Haya is never a weakness to be trained away.",
          note: "Muslim 1:60; Abu Dawud 43:23",
        },
        {
          title: "Dress beautifully — for Allah first",
          detail:
            "'O children of Adam, dress well for every prayer.' Modesty and beauty are not opposites in Islam: clean, dignified, beautiful dress is commanded, especially for worship. What Islam removes is display designed to provoke desire or envy.",
          note: "Quran 7:31",
        },
        {
          title: "The inner check",
          detail:
            "Scholars summarize the spirit of the dress rulings in two inner questions: does this clothing conceal what Allah commanded to be concealed, and is my intention dignity or display? Fabric can comply while the heart shows off — halal living asks for both.",
        },
      ],
    },
  },
  {
    id: "for-men",
    name: "For Men",
    content: {
      intro:
        "Men's dress rulings are fewer but real: cover the awrah, avoid what the Prophet (peace be upon him) forbade specifically to men, and wear nothing for arrogance.",
      points: [
        {
          title: "The awrah of a man",
          detail:
            "The majority of scholars hold a man's awrah — what must be covered before others — to be from the navel to the knee, based on hadith they grade reliable, while noting some difference among the madhhabs over the thigh. Practically: shorts above the knee and exposing oneself in locker rooms sit at best in differed-upon territory, and covering to the knee exits the doubt.",
        },
        {
          title: "Silk and gold are for the women of this Ummah",
          detail:
            "The Prophet (peace be upon him) said: 'Wearing silk and gold has made unlawful for the males of my Ummah and lawful for its females.' This is why men avoid gold jewelry and pure-silk garments — silver is permitted: the Prophet (peace be upon him) himself discarded a gold ring and wore a silver one. Scholars apply the prohibition to real silk and gold, with modern imitation fabrics and metals falling outside it.",
          note: "Tirmidhi 24:1; Nasai 48:109; Bukhari 77:82",
        },
        {
          title: "Nothing worn for arrogance",
          detail:
            "'Whoever drags his clothes (on the ground) out of pride and arrogance, Allah will not look at him on the Day of Resurrection.' The illness named in the text is pride. Whatever the garment — thobe, suit, or sneakers — clothing worn to tower over people carries this warning.",
          note: "Bukhari 77:9",
        },
      ],
    },
  },
  {
    id: "for-women",
    name: "For Women",
    content: {
      intro:
        "The Quran itself legislates women's dress — in verses of remarkable gentleness, tied to recognition and protection, not erasure.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلنَّبِىُّ قُل لِّأَزْوَٰجِكَ وَبَنَاتِكَ وَنِسَآءِ ٱلْمُؤْمِنِينَ يُدْنِينَ عَلَيْهِنَّ مِن جَلَـٰبِيبِهِنَّ ۚ ذَٰلِكَ أَدْنَىٰٓ أَن يُعْرَفْنَ فَلَا يُؤْذَيْنَ ۗ وَكَانَ ٱللَّهُ غَفُورًا رَّحِيمًا",
        text: "O Prophet, tell your wives and your daughters, and the believing women to draw their outer garments over themselves; that is more likely that they will be known [as chaste women] and will not be harassed. And Allah is All-Forgiving, Most Merciful.",
        ref: "Quran 33:59",
      },
      points: [
        {
          title: "The khimar verse",
          detail:
            "Allah commands the believing women 'not to reveal their beauty except what appears. And let them draw their veils over their chests' — listing the family members before whom dress relaxes. The majority position across the madhhabs is that a woman covers all but the face and hands before non-mahram men, in loose, non-transparent dress; a well-known scholarly position adds covering the face. Both positions are centuries old and sincerely held.",
          note: "Quran 24:31",
        },
        {
          title: "Covered in name only",
          detail:
            "The Prophet (peace be upon him) warned of 'women who would be dressed but appear to be naked' — among people he described as not entering Paradise nor smelling its fragrance. Scholars draw from it that hijab is defeated by tight or transparent clothing that technically covers while actually displaying.",
          note: "Muslim 37:190",
        },
        {
          title: "Dignity, not disappearance",
          detail:
            "The verse above gives the purpose in Allah's own words: 'that is more likely that they will be known [as chaste women] and will not be harassed.' Hijab in the Quran is a mark of honor and identification — worn by women who studied, traded, taught, and narrated hadith at the heart of the first community.",
          note: "Quran 33:59",
        },
      ],
    },
  },
  {
    id: "lowering-the-gaze",
    name: "Lowering the Gaze",
    content: {
      intro:
        "The Quran's dress code begins, for both sexes, before any garment — with the eyes. The gaze is the first act of modesty, and it is commanded of men first.",
      verse: {
        arabic: "قُل لِّلْمُؤْمِنِينَ يَغُضُّوا۟ مِنْ أَبْصَـٰرِهِمْ وَيَحْفَظُوا۟ فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ ۗ إِنَّ ٱللَّهَ خَبِيرٌۢ بِمَا يَصْنَعُونَ",
        text: "Tell the believing men to lower their gazes and guard their private parts; that is purer for them. Indeed, Allah is All-Aware of what they do.",
        ref: "Quran 24:30",
      },
      points: [
        {
          title: "Commanded of men first",
          detail:
            "'Tell the believing men to lower their gazes and guard their private parts; that is purer for them.' Only then does the next verse address women with the same command. No one's dress excuses anyone else's stare — each gender carries its own instruction directly from Allah.",
          note: "Quran 24:30; Quran 24:31",
        },
        {
          title: "The sudden glance",
          detail:
            "Jarir ibn Abdullah said: 'I asked Allah's Messenger (peace be upon him) about the sudden glance (that is cast) on the face (of a non-Mahram). He commanded me that I should turn away my eyes.' The unplanned first look carries no sin; modesty is in not feeding it a second.",
          note: "Muslim 38:59",
        },
        {
          title: "Purer for the heart",
          detail:
            "The verse gives its own reasoning — 'that is purer for them.' Scholars note that the unchecked gaze plants what the heart then waters; guarding it is less a restriction than a mercy, in an age when the whole economy of screens is built on capturing eyes.",
        },
      ],
    },
  },
];

const workTopics: Topic[] = [
  {
    id: "lawful-earning",
    name: "Lawful Earning",
    content: {
      intro:
        "Work is honored in Islam as the prophets' own path. Earning halal bread is counted among the noblest of deeds — and the search for provision is framed as part of worship itself.",
      verse: {
        arabic: "فَإِذَا قُضِيَتِ ٱلصَّلَوٰةُ فَٱنتَشِرُوا۟ فِى ٱلْأَرْضِ وَٱبْتَغُوا۟ مِن فَضْلِ ٱللَّهِ وَٱذْكُرُوا۟ ٱللَّهَ كَثِيرًا لَّعَلَّكُمْ تُفْلِحُونَ",
        text: "When the prayer is over, disperse in the land and seek from the bounty of Allah, and remember Allah much so that you may be successful.",
        ref: "Quran 62:10",
      },
      points: [
        {
          title: "The best meal ever eaten",
          detail:
            "The Prophet (peace be upon him) said: 'Nobody has ever eaten a better meal than that which one has earned by working with one's own hands. The Prophet of Allah, David (peace be upon him) used to eat from the earnings of his manual labor.' No lawful work is beneath a believer's dignity — a prophet-king worked with his hands.",
          note: "Bukhari 34:25",
        },
        {
          title: "Blessing in the early hours",
          detail:
            "The Prophet (peace be upon him) prayed: 'O Allah bless my Ummah in what they do early (in the day).' The narrator adds that Sakhr, a merchant, 'used to send his goods for trade during the beginning of the day, so he became rich, and his wealth increased.' Diligence and barakah are companions.",
          note: "Tirmidhi 14:11",
        },
        {
          title: "The income test",
          detail:
            "Since haram income voids even du'a (see Taqwa of the Stomach under Principles), scholars advise auditing the source, not just the size, of earnings: work whose core service is haram — serving alcohol, interest-based lending, gambling operations — is avoided, while scholars differ over roles merely adjacent to such industries. When in doubt, ask a scholar about your specific role.",
          note: "Muslim 12:83",
        },
      ],
    },
  },
  {
    id: "music",
    name: "Music — The Honest Picture",
    content: {
      intro:
        "Few questions divide sincere Muslims like music. Honesty requires saying plainly: this is a genuinely differed-upon issue with serious scholarship on more than one side — not a settled absolute in either direction.",
      points: [
        {
          title: "The case for prohibition",
          detail:
            "The position of the majority of classical scholars prohibits musical instruments (with exceptions like the duff), citing among other texts the Prophet's (peace be upon him) warning: 'From among my followers there will be some people who will consider illegal sexual intercourse, the wearing of silk, the drinking of alcoholic drinks and the use of musical instruments, as lawful' — instruments listed alongside grave sins.",
          note: "Bukhari 74:16",
        },
        {
          title: "The case for permissibility",
          detail:
            "Other scholars, classical and contemporary, have held wholesome music permissible, reading the condemnations as tied to the drinking-and-vice gatherings they historically accompanied. They note the Prophet (peace be upon him) defended two girls singing in his own home on Eid, telling Abu Bakr: 'There is an Eid for every nation and this is our Eid.'",
          note: "Bukhari 13:4",
        },
        {
          title: "The shared ground",
          detail:
            "All scholars agree on this much: lyrics glorifying sin, music bound up with haram gatherings, and any listening that crowds out salah or Quran are impermissible by content and effect regardless of the instrument question. Study both positions, follow the scholars you trust with taqwa rather than convenience, and extend respect to Muslims who sincerely follow the other view.",
        },
      ],
    },
  },
  {
    id: "workplace-conduct",
    name: "Workplace Conduct",
    content: {
      intro:
        "Most Muslims spend more waking hours at work than anywhere else. The same halal-living principles — honesty, modesty, guarded boundaries — walk into the office with you.",
      points: [
        {
          title: "Integrity is the job description",
          detail:
            "'He who deceives is not of me' governs timesheets, expense reports, and sales claims as much as grain heaps. Scholars state that an employment contract is a trust: giving the hours and effort you are paid for is a religious duty, and padding, misreporting, or misusing employer resources is a form of consuming wealth unlawfully.",
          note: "Muslim 1:190; Quran 4:29",
        },
        {
          title: "Professional, with guarded boundaries",
          detail:
            "Working alongside colleagues of the opposite sex is a reality scholars address with the Sunnah's own tools: lowering the gaze, professional rather than flirtatious speech, and avoiding being secluded one-on-one in closed private settings — the Prophet (peace be upon him) said: 'No person should be alone with a woman except when there is a Mahram with her.' Scholars discuss how this applies to open, public, or glass-walled professional spaces; the principle is removing the setting where wrong grows easy.",
          note: "Muslim 15:476; Quran 24:30",
        },
        {
          title: "Hold your worship at work",
          detail:
            "Salah does not pause for a career. Practical halal living means knowing your prayer windows, using breaks for them, and asking (most workplaces accommodate) rather than quietly forfeiting prayers. A Muslim whose colleagues know them as punctually honest and punctually praying is carrying da'wah without a word.",
        },
      ],
    },
  },
  {
    id: "entertainment",
    name: "Entertainment & Leisure",
    content: {
      intro:
        "Rest and recreation are halal — the Prophet (peace be upon him) stood screening A'isha with his cloak so she could watch the Ethiopians' spear-play in the mosque (Bukhari 8:103). The filters on leisure are few and clear.",
      points: [
        {
          title: "Gambling in every costume",
          detail:
            "'Intoxicants, gambling, [sacrificing on] stone alters and divining arrows are of Satan's evil work; therefore avoid such [evil], so that you may be successful.' Scholars apply the gambling prohibition to its modern costumes — casinos, betting apps, lotteries, and paid loot-box mechanics that stake money on chance.",
          note: "Quran 5:90",
        },
        {
          title: "Content is consumption",
          detail:
            "Scholars advise applying the taqwa of the eyes and ears the way one applies taqwa of the stomach: entertainment built on explicit content or the celebration of sin feeds the heart what haram food feeds the body. The practical test they suggest is simple — could you remember Allah comfortably in the middle of it?",
        },
        {
          title: "Time is the hidden stake",
          detail:
            "Even fully halal leisure becomes a loss when it devours salah, family, and sleep. Scholars class this under wasting what Allah entrusted — 'Eat and drink, but do not waste' extends to hours as well as food. Leisure in halal living is the servant of a full life, never its master.",
          note: "Quran 7:31",
        },
      ],
    },
  },
];

const tabs = [
  { key: "principles", label: "Principles" },
  { key: "food", label: "Food & Drink" },
  { key: "money", label: "Money & Riba" },
  { key: "dress", label: "Dress" },
  { key: "work", label: "Work & Leisure" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* ───────────────────────── page ───────────────────────── */

function HalalLivingContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const t = searchParams.get("tab");
    return t && tabs.some((x) => x.key === t) ? (t as TabKey) : "principles";
  });
  // Deep-link support: ?tab=<key>&sub=<topic id>. The initial ?sub= is applied
  // to whichever rail it belongs to; ids are unique across the page.
  const initialSub = searchParams.get("sub");
  const [principlesSub, setPrinciplesSub] = useState(() =>
    initialSub && principlesTopics.some((t) => t.id === initialSub) ? initialSub : principlesTopics[0].id
  );
  const [foodSub, setFoodSub] = useState(() =>
    initialSub && foodTopics.some((t) => t.id === initialSub) ? initialSub : foodTopics[0].id
  );
  const [moneySub, setMoneySub] = useState(() =>
    initialSub && moneyTopics.some((t) => t.id === initialSub) ? initialSub : moneyTopics[0].id
  );
  const [dressSub, setDressSub] = useState(() =>
    initialSub && dressTopics.some((t) => t.id === initialSub) ? initialSub : dressTopics[0].id
  );
  const [workSub, setWorkSub] = useState(() =>
    initialSub && workTopics.some((t) => t.id === initialSub) ? initialSub : workTopics[0].id
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
    fix(principlesTopics, principlesSub, setPrinciplesSub);
    fix(foodTopics, foodSub, setFoodSub);
    fix(moneyTopics, moneySub, setMoneySub);
    fix(dressTopics, dressSub, setDressSub);
    fix(workTopics, workSub, setWorkSub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, principlesSub, foodSub, moneySub, dressSub, workSub]);

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
        {active && <TopicInfoCard topic={active} showSource={false} />}
      </SubTabLayout>
    );
  };

  return (
    <div>
      <PageHeader
        title="Halal Living"
        titleAr="الحلال والحرام"
        subtitle="Food, money, dress, work, and leisure — the clear lines, the differed-upon questions, and the wide halal in between."
      />

      {/* Opening verse — above search + tabs, matching every other content page. */}
      <VerseHero
        arabic="يَـٰٓأَيُّهَا ٱلنَّاسُ كُلُوا۟ مِمَّا فِى ٱلْأَرْضِ حَلَـٰلًا طَيِّبًا وَلَا تَتَّبِعُوا۟ خُطُوَٰتِ ٱلشَّيْطَـٰنِ ۚ إِنَّهُۥ لَكُمْ عَدُوٌّ مُّبِينٌ"
        text="O people, eat from what is lawful and good on earth, and do not follow the footsteps of Satan, for he is your sworn enemy."
        reference="Quran 2:168"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search topics, rulings..." className="mb-6" />

      <TabBar tabs={[...tabs]} activeTab={activeTab} onTabChange={handleTabChange} className="mb-6" />

      <AnimatePresence mode="wait">
        {/* ─── Principles ─── */}
        {activeTab === "principles" && (
          <motion.div
            key="principles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(principlesTopics, principlesSub, handleSubChange("principles", setPrinciplesSub))}

            {/* Companion pages */}
            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">Live it daily</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Halal living is carried by daily habits — the prayers, the adhkar, and a guarded
                heart. These companion pages put the principles into a routine.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/muslim-daily"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  The Muslim daily checklist →
                </Link>
                <Link
                  href="/protection?tab=daily"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Daily protection &amp; adhkar →
                </Link>
              </div>
            </ContentCard>

            <SourcesCard
              className="mt-6"
              sources={[
                { ref: "Bukhari 2:45; Muslim 22:133", desc: "The halal is clear and the haram is clear; the doubtful in between" },
                { ref: "Quran 2:168", desc: "Eat from what is lawful and good on earth" },
                { ref: "Quran 7:31-32", desc: "Who has forbidden the adornments Allah brought forth?" },
                { ref: "Nasai 51:173", desc: "Leave that which makes you doubt" },
                { ref: "Quran 2:172", desc: "Eat of the good things We have provided for you" },
                { ref: "Muslim 12:83", desc: "Allah is Good and accepts only the good; the traveler whose du'a cannot rise" },
                { ref: "Quran 16:114", desc: "Eat from the lawful and good things and be grateful" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Food & Drink ─── */}
        {activeTab === "food" && (
          <motion.div
            key="food"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(foodTopics, foodSub, handleSubChange("food", setFoodSub))}

            <SourcesCard
              className="mt-8"
              sources={[
                { ref: "Quran 2:173", desc: "Carrion, blood, swine, and what is dedicated to other than Allah" },
                { ref: "Quran 5:3", desc: "The full list of prohibited meats" },
                { ref: "Quran 5:5", desc: "The food of the People of the Book is lawful" },
                { ref: "Muslim 34:84", desc: "Slaughter in a good way; sharpen the blade" },
                { ref: "Quran 5:90-91", desc: "Intoxicants and gambling are of Satan's work" },
                { ref: "Muslim 36:92", desc: "Every intoxicant is khamr and every intoxicant is forbidden" },
                { ref: "Abu Dawud 27:9", desc: "Wine from any source; every intoxicant forbidden" },
                { ref: "Nasai 51:69", desc: "What intoxicates in large amounts — a small amount is unlawful" },
                { ref: "Abu Dawud 27:6", desc: "The curse on wine and all nine involved with it" },
                { ref: "Nasai 51:173", desc: "Leave that which makes you doubt" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Money & Riba ─── */}
        {activeTab === "money" && (
          <motion.div
            key="money"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(moneyTopics, moneySub, handleSubChange("money", setMoneySub))}

            <SourcesCard
              className="mt-8"
              sources={[
                { ref: "Quran 2:275", desc: "Allah has permitted trade and forbidden usury" },
                { ref: "Quran 2:278-279", desc: "Give up remaining usury — or a declaration of war from Allah" },
                { ref: "Muslim 22:132", desc: "The curse on riba's accepter, payer, scribe, and witnesses" },
                { ref: "Bukhari 55:29", desc: "Riba among the seven destructive sins" },
                { ref: "Quran 4:29", desc: "Consume not wealth unlawfully — trade by mutual consent" },
                { ref: "Bukhari 34:32", desc: "Truthful buyer and seller are blessed in their transaction" },
                { ref: "Muslim 1:190", desc: "He who deceives is not of me" },
                { ref: "Ibn Majah 12:3; Ibn Majah 12:10", desc: "The honest merchant with the martyrs; the heedless raised as immoral" },
                { ref: "Bukhari 34:29", desc: "Allah's mercy on the lenient in buying, selling, and collecting" },
                { ref: "Ibn Majah 16:8", desc: "Give the worker his wages before his sweat dries" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Dress & Appearance ─── */}
        {activeTab === "dress" && (
          <motion.div
            key="dress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(dressTopics, dressSub, handleSubChange("dress", setDressSub))}

            <SourcesCard
              className="mt-8"
              sources={[
                { ref: "Muslim 1:60", desc: "Modesty is a branch of faith" },
                { ref: "Abu Dawud 43:23", desc: "Leave him alone, for modesty is a part of faith" },
                { ref: "Quran 7:31", desc: "Dress well for every prayer" },
                { ref: "Tirmidhi 24:1; Nasai 48:109", desc: "Silk and gold — unlawful for the men of this Ummah, lawful for its women" },
                { ref: "Bukhari 77:82", desc: "The Prophet discarded the gold ring and wore silver" },
                { ref: "Bukhari 77:9", desc: "Dragging one's garment out of pride" },
                { ref: "Quran 24:30-31", desc: "Lower the gaze; draw the veils over the chests" },
                { ref: "Quran 33:59", desc: "The outer garment — known and not harassed" },
                { ref: "Muslim 37:190", desc: "Dressed but appearing naked — the warning" },
                { ref: "Muslim 38:59", desc: "The sudden glance — turn away your eyes" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Work & Leisure ─── */}
        {activeTab === "work" && (
          <motion.div
            key="work"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(workTopics, workSub, handleSubChange("work", setWorkSub))}

            <SourcesCard
              className="mt-8"
              sources={[
                { ref: "Quran 62:10", desc: "Disperse in the land and seek from the bounty of Allah" },
                { ref: "Bukhari 34:25", desc: "No better meal than what one's own hands earned" },
                { ref: "Tirmidhi 14:11", desc: "O Allah bless my Ummah in what they do early" },
                { ref: "Muslim 12:83", desc: "Haram income and the du'a that cannot rise" },
                { ref: "Bukhari 74:16", desc: "Those who will consider instruments (with silk, wine, zina) lawful" },
                { ref: "Bukhari 13:4", desc: "The Eid singing — 'There is an Eid for every nation'" },
                { ref: "Muslim 1:190", desc: "He who deceives is not of me" },
                { ref: "Muslim 15:476", desc: "No man alone with a non-mahram woman" },
                { ref: "Bukhari 8:103", desc: "A'isha watching the Ethiopians' spear-play in the mosque" },
                { ref: "Quran 5:90", desc: "Gambling is of Satan's work" },
                { ref: "Quran 7:31", desc: "Eat and drink, but do not waste" },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HalalLivingPage() {
  return (
    <Suspense>
      <HalalLivingContent />
    </Suspense>
  );
}
