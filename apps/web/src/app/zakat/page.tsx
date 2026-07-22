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
import TopicInfoCard, { topicSourceRefs, type Topic } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";

/* ───────────────────────── data ─────────────────────────
 * All Arabic below is spliced byte-exact from packages/content — never typed.
 * All quoted English matches the local translations verbatim.
 */

const overviewTopics: Topic[] = [
  {
    id: "the-third-pillar",
    name: "The Third Pillar",
    content: {
      intro:
        "Zakat is the obligatory yearly alms on wealth — the third pillar of Islam, named in the Quran alongside prayer again and again. It is not a tip, a tax, or an optional kindness: it is worship with wealth, owed to Allah, with the poor as its appointed destination. The word itself carries the meanings of purification and growth.",
      verse: {
        arabic: "وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ ۚ وَمَا تُقَدِّمُوا۟ لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ ٱللَّهِ ۗ إِنَّ ٱللَّهَ بِمَا تَعْمَلُونَ بَصِيرٌ",
        text: "And establish prayer and give zakah. Whatever good you send forth for yourselves, you will find it with Allah, for Allah is All-Seeing of what you do.",
        ref: "Quran 2:110",
      },
      points: [
        {
          title: "One of the five",
          detail:
            "The Prophet (peace be upon him) said: 'Islam is based on (the following) five (principles): To testify that none has the right to be worshipped but Allah and Muhammad is Allah's Messenger. To offer the (compulsory congregational) prayers dutifully and perfectly. To pay Zakat (i.e. obligatory charity). To perform Hajj (i.e. Pilgrimage to Mecca). To observe fast during the month of Ramadan.' Giving zakat stands third — before fasting and pilgrimage.",
          note: "Bukhari 2:1; Muslim 1:19",
        },
        {
          title: "Taken from the rich, given to the poor",
          detail:
            "When the Prophet (peace be upon him) sent Muadh to Yemen, he told him to teach the people the shahada, then the five prayers, and then 'that Allah has made it obligatory for them to pay the Zakat from their property and it is to be taken from the wealthy among them and given to the poor.' That one sentence is the whole institution: a fixed right of the poor inside the wealth of the rich.",
          note: "Bukhari 24:1; Ibn Majah 8:1",
        },
        {
          title: "Paired with prayer",
          detail:
            "The Quran couples establishing prayer with giving zakat dozens of times: 'Those who believe, do righteous deeds, establish prayer, and give zakah, will have their reward with their Lord; and they will have no fear, nor will they grieve.' The pairing is the point — devotion to Allah in the body and in the wallet, neither accepted as a substitute for the other.",
          note: "Quran 2:277; Quran 2:110",
        },
      ],
    },
  },
  {
    id: "purification",
    name: "Purification & Growth",
    content: {
      intro:
        "Why does Allah, who owns everything, command us to give? The Quran's own answer: the giving cleanses the giver. Zakat purifies the heart of greed, purifies the remaining wealth, and — against all arithmetic — causes it to grow.",
      verse: {
        arabic: "وَمَآ ءَاتَيْتُم مِّن رِّبًا لِّيَرْبُوَا۟ فِىٓ أَمْوَٰلِ ٱلنَّاسِ فَلَا يَرْبُوا۟ عِندَ ٱللَّهِ ۖ وَمَآ ءَاتَيْتُم مِّن زَكَوٰةٍ تُرِيدُونَ وَجْهَ ٱللَّهِ فَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُضْعِفُونَ",
        text: "Whatever you lend in usury in order to gain more at the expense of people's wealth, it will not increase [in reward] with Allah. But whatever you give as charity, seeking Allah's pleasure – it is they who will have multiple rewards.",
        ref: "Quran 30:39",
      },
      points: [
        {
          title: "It cleanses the giver",
          detail:
            "Allah commanded His Prophet (peace be upon him): 'Take charity from their wealth [O Prophet] to cleanse and purify them, and pray for them.' The verse names the purpose before anything else — zakat is a washing of the soul from attachment to money, and of the wealth from the right of others still sitting inside it.",
          note: "Quran 9:103",
        },
        {
          title: "It does not shrink wealth",
          detail:
            "The Prophet (peace be upon him) said: 'Charity does not decrease wealth, no one forgives another except that Allah increases his honor, and no one humbles himself for the sake of Allah except that Allah raises his status.' The believer gives 2.5% certain that the ledger Allah keeps is the one that counts.",
          note: "Muslim 45:90",
        },
        {
          title: "Grown by Allah Himself",
          detail:
            "The Prophet (peace be upon him) said: 'If one gives in charity what equals one date-fruit from the honestly earned money — and Allah accepts only the honestly earned money — Allah takes it in His right (hand) and then enlarges its reward for that person (who has given it), as anyone of you brings up his baby horse, so much so that it becomes as big as a mountain.'",
          note: "Bukhari 24:14",
        },
      ],
    },
  },
  {
    id: "virtues-of-giving",
    name: "Virtues of Giving",
    content: {
      intro:
        "Beyond the obligation, giving is one of the most beloved deeds in Islam — multiplied seven-hundredfold, shaded on the Day of Resurrection, and praised as the mark of the true believer.",
      verse: {
        arabic: "مَّثَلُ ٱلَّذِينَ يُنفِقُونَ أَمْوَٰلَهُمْ فِى سَبِيلِ ٱللَّهِ كَمَثَلِ حَبَّةٍ أَنۢبَتَتْ سَبْعَ سَنَابِلَ فِى كُلِّ سُنۢبُلَةٍ مِّا۟ئَةُ حَبَّةٍ ۗ وَٱللَّهُ يُضَـٰعِفُ لِمَن يَشَآءُ ۗ وَٱللَّهُ وَٰسِعٌ عَلِيمٌ",
        text: "The likeness of those who spend their wealth in the way of Allah is like a grain that sprouts seven ears, each ear bearing a hundred grains. And Allah gives multiple [rewards] for whom He wills. And Allah is All-Encompassing, All-Knowing.",
        ref: "Quran 2:261",
      },
      points: [
        {
          title: "Shade when there is no shade",
          detail:
            "Among the seven whom Allah will shade on the Day when there is no shade but His, the Prophet (peace be upon him) named 'a person who practices charity so secretly that his left hand does not know what his right hand has given.' Quiet giving, free of show, is among the highest ranks a believer can reach.",
          note: "Bukhari 24:27",
        },
        {
          title: "The upper hand",
          detail:
            "The Prophet (peace be upon him) said: 'The upper hand is better than the lower hand (i.e. he who gives in charity is better than him who takes it). One should start giving first to his dependents. And the best object of charity is that which is given by a wealthy person (from the money which is left after his expenses).'",
          note: "Bukhari 24:31",
        },
        {
          title: "The mark of the believer",
          detail:
            "Describing the successful believers, Allah says they are those 'who give a due share of their wealth to the beggar and the dispossessed.' The Quran calls it a due share — in the believer's own accounting, part of what he earns was never his to keep.",
          note: "Quran 70:24-25",
        },
      ],
    },
  },
  {
    id: "withholding",
    name: "Withholding It",
    content: {
      intro:
        "Because zakat is the poor's right and Allah's command, withholding it carries some of the most severe warnings in the Quran and Sunnah — aimed not at wealth itself, but at hoarded wealth whose due was never paid.",
      verse: {
        arabic: "يَوْمَ يُحْمَىٰ عَلَيْهَا فِى نَارِ جَهَنَّمَ فَتُكْوَىٰ بِهَا جِبَاهُهُمْ وَجُنُوبُهُمْ وَظُهُورُهُمْ ۖ هَـٰذَا مَا كَنَزْتُمْ لِأَنفُسِكُمْ فَذُوقُوا۟ مَا كُنتُمْ تَكْنِزُونَ",
        text: "On the Day when their treasures will be heated up in the Fire of Hell, and their foreheads, sides and backs will be branded therewith. [They will be told], “This is what you hoarded for yourselves; so taste [the punishment of] what you used to hoard.”",
        ref: "Quran 9:35",
      },
      points: [
        {
          title: "Hoarded gold and silver",
          detail:
            "The verse before it warns: 'Those who hoard gold and silver and do not spend it in the way of Allah, give them tidings of a painful punishment.' The Prophet (peace be upon him) explained: 'If any owner of gold or silver does not pay what is due on him, when the Day of Resurrection would come, plates of fire would be beaten out for him; these would then be heated in the fire of Hell and his sides, his forehead and his back would be cauterized with them.'",
          note: "Quran 9:34; Muslim 12:28",
        },
        {
          title: "The snake of hoarded wealth",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever is made wealthy by Allah and does not pay the Zakat of his wealth, then on the Day of Resurrection his wealth will be made like a baldheaded poisonous male snake with two black spots over the eyes. The snake will encircle his neck and bite his cheeks and say, “I am your wealth, I am your treasure.”' Then he recited the verse: 'Let not those who withhold...'",
          note: "Bukhari 24:8; Quran 3:180",
        },
        {
          title: "Withheld wealth is no gain",
          detail:
            "'Those who greedily withhold what Allah has given them of His grace, should not think that it is good for them, rather it is bad for them; their necks will be chained by what they greedily withheld on the Day of Resurrection.' The warnings are not against being wealthy — they are against wealth whose zakat was never separated out and paid.",
          note: "Quran 3:180",
        },
      ],
    },
  },
];

const whoTopics: Topic[] = [
  {
    id: "nisab",
    name: "The Nisab",
    content: {
      intro:
        "Zakat is only due from those who can afford it. The nisab is the minimum amount of wealth a person must own before any zakat is owed — below it, you pay nothing and may yourself be eligible to receive. The Prophet (peace be upon him) fixed the thresholds in the money of his time: 200 dirhams of silver, or 20 dinars of gold.",
      points: [
        {
          title: "The Prophet set the thresholds",
          detail:
            "He (peace be upon him) said: 'No Zakat is imposed on less than five Awsuq of dates; no Zakat is imposed on less than five Awaq of silver, and no Zakat is imposed on less than five camels.' Five awaq of silver is 200 dirhams. And in the narration of Ali: 'When you possess two hundred dirhams and one year passes on them, five dirhams are payable. Nothing is incumbent on you, that is, on gold, till it reaches twenty dinars. When you possess twenty dinars and one year passes on them, half a dinar is payable.'",
          note: "Bukhari 24:61; Abu Dawud 9:18",
        },
        {
          title: "In today's measures",
          detail:
            "Contemporary scholars commonly convert the two classical thresholds to approximately 85 grams of pure gold (20 dinars) or 595 grams of pure silver (200 dirhams). Because they are weights of metal, their value in your currency moves with the market — check current gold and silver prices when you calculate (the Calculator tab on this page does this for you).",
        },
        {
          title: "Gold nisab or silver nisab?",
          detail:
            "For pure gold, the gold nisab applies; for pure silver, the silver nisab. For cash and mixed modern wealth, contemporary scholars differ: many advise using the silver nisab, since it is lower and results in more reaching the poor, while others use the gold nisab as closer to the original purchasing power. Both are respected positions — ask your local scholar which to follow.",
        },
      ],
    },
  },
  {
    id: "hawl",
    name: "The Hawl — One Year",
    content: {
      intro:
        "Zakat is not owed the moment you earn money. Wealth must sit at or above the nisab for a full lunar year (the hawl) before 2.5% falls due — zakat targets held, accumulating wealth, not income passing through your hands.",
      points: [
        {
          title: "A year must pass",
          detail:
            "In the narration of Ali, the Prophet (peace be upon him) tied each threshold to the year: 'When you possess two hundred dirhams and one year passes on them, five dirhams are payable' — and the narration adds: 'No zakat is payable on property till a year passes on it.'",
          note: "Abu Dawud 9:18",
        },
        {
          title: "How it works in practice",
          detail:
            "Scholars advise a simple method: note the Islamic (hijri) date on which your wealth first reached the nisab — that is your zakat anniversary. Every year on that date, look at what you own on that day, and pay 2.5% of whatever zakatable wealth you hold above the nisab. Many people choose a date in Ramadan for the extra reward of the season and so it is never forgotten.",
        },
        {
          title: "If wealth dips during the year",
          detail:
            "The schools of law differ on mid-year fluctuations: the Hanafi school looks at the beginning and end of the year — dips in between do not break the hawl as long as some wealth remains — while the majority hold that if wealth falls below the nisab, the year restarts when it climbs back above it. Follow one consistent, scholarly-guided approach rather than switching to whichever is lighter.",
        },
      ],
    },
  },
  {
    id: "who-must-pay",
    name: "Who Must Pay",
    content: {
      intro:
        "Every Muslim who owns the nisab in zakatable wealth, beyond basic needs and for a full year, must pay — man or woman, working or not. It is owed on wealth, not on salaries or status.",
      points: [
        {
          title: "Ownership, not income",
          detail:
            "A student with savings above the nisab owes zakat; a high earner who spends everything and holds nothing does not. What matters is the zakatable wealth actually in your ownership when your zakat date arrives — after your living costs, and above the threshold the Prophet (peace be upon him) set.",
          note: "Abu Dawud 9:18",
        },
        {
          title: "Women's wealth too",
          detail:
            "A woman's gold, savings, and investments are her own — and zakat on them is her own obligation, whether or not she works. A husband may pay it on her behalf with her knowledge, but the duty attaches to the owner of the wealth.",
        },
        {
          title: "Children's wealth",
          detail:
            "The schools differ on wealth owned by children and the mentally incapable: the majority hold that zakat is due on the wealth itself, paid by the guardian, while the Hanafi school holds it is not due until maturity. Families in this situation should ask a scholar they trust.",
        },
        {
          title: "It is worship, not a tax",
          detail:
            "Like prayer, zakat needs intention (niyyah): when you set the money aside or hand it over, intend it as the zakat Allah commanded. Money that happens to be given away is charity; money given as zakat, intending zakat, discharges the pillar.",
        },
      ],
    },
  },
];

const assetTopics: Topic[] = [
  {
    id: "cash-savings",
    name: "Cash & Savings",
    content: {
      intro:
        "The Prophet (peace be upon him) set zakat on gold and silver — the money of his day. Scholars agree that modern currency takes the same ruling: your cash, bank balances, and savings are zakatable at 2.5% once they meet the nisab and a year passes.",
      points: [
        {
          title: "What counts",
          detail:
            "Cash at home, checking and savings accounts, money saved toward a goal (a house, a wedding, hajj), and foreign currency all count at their value on your zakat date. Saving for a purpose does not exempt money — until it is spent, it is wealth you own.",
        },
        {
          title: "Money owed to you",
          detail:
            "Scholars distinguish strong debts (loans to reliable people you expect back — most say include these each year, or at least when repaid) from weak or doubtful debts (many say pay only if and when recovered, for that year). If friends or family owe you money you realistically expect, the safer course is to include it.",
        },
        {
          title: "The rate",
          detail:
            "The rate on money is one-fortieth — 2.5% — taken from the narration of Ali: five dirhams on every two hundred, and 'whatever exceeds, that will be reckoned properly.'",
          note: "Abu Dawud 9:18",
        },
      ],
    },
  },
  {
    id: "gold-silver",
    name: "Gold & Silver",
    content: {
      intro:
        "Gold and silver are zakatable in themselves — coins, bars, and (per some schools) jewelry — because they are the very wealth the texts name.",
      verse: {
        arabic: "۞ يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِنَّ كَثِيرًا مِّنَ ٱلْأَحْبَارِ وَٱلرُّهْبَانِ لَيَأْكُلُونَ أَمْوَٰلَ ٱلنَّاسِ بِٱلْبَـٰطِلِ وَيَصُدُّونَ عَن سَبِيلِ ٱللَّهِ ۗ وَٱلَّذِينَ يَكْنِزُونَ ٱلذَّهَبَ وَٱلْفِضَّةَ وَلَا يُنفِقُونَهَا فِى سَبِيلِ ٱللَّهِ فَبَشِّرْهُم بِعَذَابٍ أَلِيمٍ",
        text: "O you who believe, there are many rabbis and monks who consume people's wealth unlawfully and prevent people from Allah's way. Those who hoard gold and silver and do not spend it in the way of Allah, give them tidings of a painful punishment.",
        ref: "Quran 9:34",
      },
      points: [
        {
          title: "Weigh it, value it",
          detail:
            "Add up the weight of gold you own and multiply by today's price per gram (and the same for silver). If the gold alone reaches 85 g — or your total zakatable wealth reaches the nisab — 2.5% of its value is due. The severe warning for 'any owner of gold or silver [who] does not pay what is due on him' attaches precisely to these two metals.",
          note: "Muslim 12:28",
        },
        {
          title: "Jewelry in personal use",
          detail:
            "The schools differ on jewelry a woman actually wears: the Hanafi school holds zakat is due on all gold and silver jewelry, while the Maliki, Shafii, and Hanbali schools exempt jewelry kept for lawful personal use. Jewelry kept as an investment or store of value is zakatable by agreement. Many choose to pay on all of it as the safer and more generous course — but both positions are established.",
        },
        {
          title: "Purity matters",
          detail:
            "The nisab is weighed in pure metal. For 18k or 21k gold, scholars advise counting the actual gold content (18k is 75% gold, 21k is 87.5%) — or simply valuing the pieces at what a jeweler would pay for them today.",
        },
      ],
    },
  },
  {
    id: "business-assets",
    name: "Business Assets",
    content: {
      intro:
        "A business owner pays zakat on what the business holds for trade — not on the shop, the van, or the tools. Classical scholars call this 'urud at-tijarah: goods bought to be sold.",
      points: [
        {
          title: "Inventory at market value",
          detail:
            "Scholars state that on your zakat date you value the stock you hold for sale at its current selling price, add the business's cash and the receivables you expect to collect, subtract debts currently due from the business, and pay 2.5% of the result.",
        },
        {
          title: "Tools of the trade are exempt",
          detail:
            "Equipment, premises, vehicles, computers — things used to run the business rather than sold by it — carry no zakat, just as personal-use property carries none. The Prophet (peace be upon him) said: 'There is no Zakat either on a horse or a slave belonging to a Muslim' — and scholars derive from this that what a person keeps for use and work, not for trade, is not zakatable.",
          note: "Bukhari 24:65",
        },
        {
          title: "Rental property",
          detail:
            "Scholars state that a property held to earn rent is not itself zakatable — but the rental income that accumulates in your accounts is, like any other savings, on your zakat date. A property bought to resell for profit, however, is trade goods and is valued like inventory.",
        },
      ],
    },
  },
  {
    id: "modern-assets",
    name: "Stocks & Modern Assets",
    content: {
      intro:
        "Shares, pensions, and digital assets did not exist in the books of the early scholars, so contemporary scholars have extended the classical categories to them. The positions below are widely held — but they are contemporary judgments, and a local scholar should be your final reference.",
      points: [
        {
          title: "Stocks & funds",
          detail:
            "Contemporary scholars generally distinguish intention: shares bought to trade are treated like trade goods — pay 2.5% of their full market value each year. Shares held long-term for dividends are treated by many scholars as partial ownership of the company — zakat on the company's zakatable assets (its cash, inventory, receivables) proportional to your share, with paying on full market value as a simpler, safer alternative. Dividends themselves join your cash.",
        },
        {
          title: "Retirement accounts",
          detail:
            "Contemporary scholars differ on pensions and retirement funds: some hold zakat is due yearly on the accessible balance (minus any penalties and taxes you would pay to withdraw), others that no zakat is due until the money is actually received, since you lack full ownership. This genuinely differs by scheme and school — ask a scholar familiar with your country's system.",
        },
        {
          title: "Crypto & digital assets",
          detail:
            "Contemporary scholars who permit holding cryptocurrency generally treat it as zakatable wealth — like currency or trade goods — at 2.5% of market value on your zakat date. Coins bought to flip are trade goods by any account.",
        },
      ],
    },
  },
  {
    id: "debts-exemptions",
    name: "Debts & What's Exempt",
    content: {
      intro:
        "Zakat falls on surplus, held wealth — not on the things you live from, and not on wealth that is really someone else's because you owe it.",
      points: [
        {
          title: "Personal use is exempt",
          detail:
            "Your home, car, furniture, clothes, phone, and the tools of your work carry no zakat, whatever they are worth. The Prophet (peace be upon him) said: 'There is no Zakat either on a horse or a slave belonging to a Muslim' — property kept for use, not for growth or trade, is outside zakat entirely.",
          note: "Bukhari 24:65",
        },
        {
          title: "Debts you owe",
          detail:
            "Scholars state that debts currently due are deducted from your zakatable wealth before calculating. For long-term debts like a mortgage or student loan, many contemporary scholars advise deducting only the payments due in the coming year — not the entire balance — otherwise most homeowners would never pay zakat while wealth sits in their accounts.",
        },
        {
          title: "When in doubt, give",
          detail:
            "Zakat is worship, and the poor are its owners. Where positions genuinely differ, scholars praise choosing the course that pays rather than the one that exempts — no one was ever harmed by generosity: 'Charity does not decrease wealth.'",
          note: "Muslim 45:90",
        },
      ],
    },
  },
];

const recipientTopics: Topic[] = [
  {
    id: "eight-categories",
    name: "The Eight Categories",
    content: {
      intro:
        "Zakat's destinations are not left to preference. Allah Himself fixed the eight categories of recipient in a single verse — 'as ordained by Allah' — so that the poor's right could never be redirected by wealth or politics.",
      verse: {
        arabic: "۞ إِنَّمَا ٱلصَّدَقَـٰتُ لِلْفُقَرَآءِ وَٱلْمَسَـٰكِينِ وَٱلْعَـٰمِلِينَ عَلَيْهَا وَٱلْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِى ٱلرِّقَابِ وَٱلْغَـٰرِمِينَ وَفِى سَبِيلِ ٱللَّهِ وَٱبْنِ ٱلسَّبِيلِ ۖ فَرِيضَةً مِّنَ ٱللَّهِ ۗ وَٱللَّهُ عَلِيمٌ حَكِيمٌ",
        text: "Alms [i.e., zakah] is only for the poor and the needy; those in charge of it; those whose hearts may be attracted [to Islam]; for freeing those in bondage; for those in debt; for the cause of Allah; and for [the stranded] traveler – as ordained by Allah, for Allah is All-Knowing, All-Wise.",
        ref: "Quran 9:60",
      },
      points: [
        {
          title: "1–2. The poor (fuqara) and the needy (masakin)",
          detail:
            "Those without enough for their basic needs — the two groups named first, and in practice the destination of most zakat. Scholars describe the faqir as having almost nothing and the miskin as having some means but not sufficiency; both qualify.",
        },
        {
          title: "3. Those in charge of it",
          detail:
            "The collectors and administrators who gather and distribute zakat may be paid from it — in the Prophet's (peace be upon him) time, appointed collectors; today, reflected in the operating share of legitimate zakat institutions.",
        },
        {
          title: "4. Those whose hearts may be attracted",
          detail:
            "New Muslims being strengthened in their faith, and those close to embracing Islam whose hearts may be reconciled.",
        },
        {
          title: "5. Freeing those in bondage",
          detail:
            "Classically, buying slaves their freedom and ransoming captives — scholars today apply it to ransoming prisoners and freeing people from bondage and trafficking.",
        },
        {
          title: "6. Those in debt",
          detail:
            "People genuinely crushed by debts they cannot repay — zakat may clear what they owe and restore them.",
        },
        {
          title: "7. In the cause of Allah",
          detail:
            "Spending in Allah's cause. Scholars differ on its breadth — classically those striving in Allah's way; some contemporary scholars include broader Islamic causes. Ask before routing zakat here.",
        },
        {
          title: "8. The stranded traveler",
          detail:
            "A traveler cut off from his money — even a wealthy person, stranded, may receive enough to reach home.",
        },
      ],
    },
  },
  {
    id: "who-cannot-receive",
    name: "Who Cannot Receive It",
    content: {
      intro:
        "Because zakat is the right of the eight categories, it cannot go to those outside them — however worthy the cause. Regular charity (sadaqah) remains open for everything else.",
      points: [
        {
          title: "The rich and the able",
          detail:
            "Two men asked the Prophet (peace be upon him) for a share of the sadaqah. 'He looked us up and down, and seeing that we were robust, he said: If you wish, I shall give you something, but there is nothing spare in it for a rich man or for one who is strong and able to earn a living.'",
          note: "Abu Dawud 9:78",
        },
        {
          title: "Your own dependents",
          detail:
            "Scholars agree zakat cannot go to those you are already obliged to support — your wife, children, and parents — since paying it to them just discharges your own duty back into your pocket. Relatives outside your obligation (a struggling brother, cousin, aunt) can be among the best recipients, combining zakat with upholding kinship.",
        },
        {
          title: "The family of the Prophet",
          detail:
            "Zakat was not permitted to the Prophet's own household: 'It does not become the family of Muhammad (to accept) sadaqat for they are the impurities of people.' The pillar that purifies the givers was kept entirely away from the one who taught it — proof it was never a means of enrichment.",
          note: "Muslim 12:218",
        },
        {
          title: "Buildings and projects",
          detail:
            "Most scholars hold that zakat must reach eligible people, so mosques, schools, and general projects are funded from sadaqah and endowments rather than zakat. Some contemporary scholars allow certain institutional uses under 'the cause of Allah' — if in doubt, give your zakat to the poor directly and support projects with sadaqah.",
        },
      ],
    },
  },
  {
    id: "giving-it-well",
    name: "Giving It Well",
    content: {
      intro:
        "How you give matters almost as much as what you give. The Quran and Sunnah shape the manner: from good wealth, with a good word, without follow-up reminders of your generosity.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ أَنفِقُوا۟ مِن طَيِّبَـٰتِ مَا كَسَبْتُمْ وَمِمَّآ أَخْرَجْنَا لَكُم مِّنَ ٱلْأَرْضِ ۖ وَلَا تَيَمَّمُوا۟ ٱلْخَبِيثَ مِنْهُ تُنفِقُونَ وَلَسْتُم بِـَٔاخِذِيهِ إِلَّآ أَن تُغْمِضُوا۟ فِيهِ ۚ وَٱعْلَمُوٓا۟ أَنَّ ٱللَّهَ غَنِىٌّ حَمِيدٌ",
        text: "O you who believe, spend in charity from the good things you have earned and of what We have produced for you from the earth. Do not choose inferior things for charity, which you yourselves would not take except by overlooking. And know that Allah is Self-Sufficient, Praiseworthy.",
        ref: "Quran 2:267",
      },
      points: [
        {
          title: "From the good, not the castoffs",
          detail:
            "Zakat is given from wealth you would be content to receive yourself — 'do not choose inferior things for charity, which you yourselves would not take except by overlooking.' And Allah accepts only what is pure: 'Allah accepts only the honestly earned money.'",
          note: "Quran 2:267; Bukhari 24:14",
        },
        {
          title: "Near before far",
          detail:
            "'One should start giving first to his dependents' — support your own household first (that is not zakat but your duty), then look to struggling relatives you are not obliged to support, then your neighborhood and community, then the wider world.",
          note: "Bukhari 24:31",
        },
        {
          title: "Quietly, if you can",
          detail:
            "Among those shaded on the Day of Resurrection is the one 'who practices charity so secretly that his left hand does not know what his right hand has given.' Give in a way that guards the dignity of the one who receives.",
          note: "Bukhari 24:27",
        },
      ],
    },
  },
];

const fitrTopics: Topic[] = [
  {
    id: "what-it-is",
    name: "A Different Zakat",
    content: {
      intro:
        "Zakat al-Fitr is a separate obligation from the yearly zakat on wealth. It is small, per-person rather than per-wealth, tied to Ramadan, and due from nearly every Muslim — its two purposes named by the Prophet (peace be upon him) himself: purifying the fasting person, and feeding the poor for Eid.",
      points: [
        {
          title: "Why it exists",
          detail:
            "Ibn Abbas said: 'The Messenger of Allah (peace be upon him) enjoined Zakatul-Fitr as a purification for the fasting person from idle talk and obscenities, and to feed the poor.' It seals the month's fast — mending its small tears — and makes sure no one in the community spends Eid hungry.",
          note: "Ibn Majah 8:45",
        },
        {
          title: "Not the same as zakat on wealth",
          detail:
            "The yearly zakat is 2.5% of wealth above the nisab; Zakat al-Fitr is a fixed measure of food for each person in the household, regardless of wealth. Paying one never discharges the other.",
        },
      ],
    },
  },
  {
    id: "how-much",
    name: "How Much & For Whom",
    content: {
      intro:
        "The measure is one sa' of the staple food of the land — roughly two and a half to three kilograms — for every member of the household, young and old.",
      points: [
        {
          title: "One sa' per person",
          detail:
            "Ibn Umar narrated: 'Allah's Messenger (peace be upon him) enjoined the payment of one Sa' of dates or one Sa' of barley as Zakat-ul-Fitr on every Muslim slave or free, male or female, young or old...' The companions gave whatever was the food of the time: 'one Sa' of meal or one Sa' of barley or one Sa' of dates, or one Sa' of cottage cheese or one Sa' of Raisins.'",
          note: "Bukhari 24:103; Bukhari 24:106",
        },
        {
          title: "The head of the household pays",
          detail:
            "One person may pay on behalf of the whole family — Ibn Umar 'used to give Sadaqat-ul-Fitr for every young and old person. He even used to give on behalf of my children,' said his freed servant Nafi. Count everyone under your roof, including a newborn.",
          note: "Bukhari 24:111",
        },
        {
          title: "Food or its value?",
          detail:
            "The schools differ: the Hanafi school permits paying the cash value of the food — often the most useful form for today's poor — while the majority hold to giving food itself, as the texts describe. Many communities and zakat organizations handle the conversion for you; both practices are widespread and scholarly-backed.",
        },
      ],
    },
  },
  {
    id: "before-the-prayer",
    name: "Before the Eid Prayer",
    content: {
      intro:
        "The deadline is sharp: Zakat al-Fitr must reach the poor before the Eid prayer. Given on time it is accepted zakat; given late, it counts only as ordinary charity — the pillar's timing is part of the pillar.",
      points: [
        {
          title: "The Prophet's order",
          detail:
            "'The Prophet (peace be upon him) ordered the people to pay Zakat-ul-Fitr before going to the Id prayer.' And Ibn Abbas reported: 'Whoever pays it before the (Eid) prayer, it is an accepted Zakah, and whoever pays it after the prayer, it is (ordinary) charity.'",
          note: "Bukhari 24:109; Ibn Majah 8:45",
        },
        {
          title: "Paying a little early",
          detail:
            "The companions did not leave it to the last hour: 'People used to give Sadaqat-ul-Fitr (even) a day or two before the Id.' Most scholars allow paying in the last day or two of Ramadan — and organizations collecting it today typically need those days to deliver it in time.",
          note: "Bukhari 24:111",
        },
        {
          title: "Plan it into your Ramadan",
          detail:
            "Set it aside when the last ten nights begin, so the rush toward Eid never makes you miss the deadline. If you give through a charity, check their cutoff date — what matters is the poor receiving it before the prayer.",
        },
      ],
    },
  },
];

/* House rule: the Sources & References card below a rail lists ONLY the active
   selection's refs (never the whole tab's). Rows derive from the active topic's
   verse + point notes via topicSourceRefs; the rows below are supported by a
   topic's content without appearing in a point note, so they are appended to
   that topic's list rather than dropped. */
const extraSourceRows: Record<string, { ref: string; desc: string }[]> = {
  // Parallel narration of the nisab thresholds (five uqiyas of silver).
  nisab: [{ ref: "Bukhari 24:10", desc: "The same thresholds — five uqiyas of silver" }],
};

function topicSources(topics: Topic[], activeId: string): { ref: string; desc: string }[] {
  const t = topics.find((x) => x.id === activeId);
  return t ? [...topicSourceRefs(t), ...(extraSourceRows[t.id] ?? [])] : [];
}

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "who-pays", label: "Who Pays" },
  { key: "assets", label: "What You Pay On" },
  { key: "recipients", label: "Recipients" },
  { key: "fitr", label: "Zakat al-Fitr" },
  { key: "calculator", label: "Calculator" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* ───────────────────────── calculator ───────────────────────── */

const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;

const inputClass =
  "mt-1 w-full px-3 py-2 rounded-lg text-sm card-bg border sidebar-border text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

function NumberField({
  label,
  hint,
  value,
  onChange,
  placeholder = "0",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-themed">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {hint && <span className="block text-[11px] text-themed-muted mt-1">{hint}</span>}
    </label>
  );
}

function num(s: string): number {
  const v = parseFloat(s);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function fmt(x: number): string {
  return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function ZakatCalculator() {
  const [cash, setCash] = useState("");
  const [goldGrams, setGoldGrams] = useState("");
  const [silverGrams, setSilverGrams] = useState("");
  const [business, setBusiness] = useState("");
  const [other, setOther] = useState("");
  const [debts, setDebts] = useState("");
  // Prefilled example prices — clearly marked in the UI as "edit to today's price".
  const [goldPrice, setGoldPrice] = useState("110");
  const [silverPrice, setSilverPrice] = useState("1.20");
  const [nisabBasis, setNisabBasis] = useState<"silver" | "gold">("silver");

  const goldValue = num(goldGrams) * num(goldPrice);
  const silverValue = num(silverGrams) * num(silverPrice);
  const totalAssets = num(cash) + goldValue + silverValue + num(business) + num(other);
  const net = Math.max(0, totalAssets - num(debts));

  const goldNisab = GOLD_NISAB_GRAMS * num(goldPrice);
  const silverNisab = SILVER_NISAB_GRAMS * num(silverPrice);
  const nisab = nisabBasis === "gold" ? goldNisab : silverNisab;

  const hasInput = totalAssets > 0;
  const due = hasInput && nisab > 0 && net >= nisab;
  const zakat = due ? net * 0.025 : 0;

  return (
    <div className="space-y-6">
      <ContentCard delay={0.05}>
        <h2 className="text-xl font-semibold text-themed mb-1">Zakat calculator</h2>
        <p className="text-themed-muted text-sm leading-relaxed mb-5">
          Everything runs on your device — nothing is sent or stored. Enter what you own on
          your zakat date, in your own currency. If your net zakatable wealth is at or above
          the nisab, 2.5% is due.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Cash & bank balances"
            hint="Cash on hand, checking, savings, money saved for any goal."
            value={cash}
            onChange={setCash}
          />
          <NumberField
            label="Gold (grams)"
            hint="Total weight of gold you own. See 'Gold & Silver' for jewelry positions."
            value={goldGrams}
            onChange={setGoldGrams}
          />
          <NumberField
            label="Silver (grams)"
            hint="Total weight of silver you own."
            value={silverGrams}
            onChange={setSilverGrams}
          />
          <NumberField
            label="Business assets"
            hint="Inventory at selling price + business cash + receivables you expect."
            value={business}
            onChange={setBusiness}
          />
          <NumberField
            label="Other zakatable assets"
            hint="Shares held for trading, crypto, money owed to you that you expect back."
            value={other}
            onChange={setOther}
          />
          <NumberField
            label="Debts due (deducted)"
            hint="Debts currently due; for long-term loans many scholars deduct only the coming year's payments."
            value={debts}
            onChange={setDebts}
          />
        </div>
      </ContentCard>

      <ContentCard delay={0.1}>
        <h3 className="font-semibold text-themed mb-1">Metal prices</h3>
        <p className="text-xs text-gold mb-4">
          Prefilled example prices — edit these to today&apos;s price per gram in your currency
          before relying on the result.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Gold price per gram"
            value={goldPrice}
            onChange={setGoldPrice}
            placeholder="110"
          />
          <NumberField
            label="Silver price per gram"
            value={silverPrice}
            onChange={setSilverPrice}
            placeholder="1.20"
          />
        </div>

        <div className="mt-5 rounded-lg p-4 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
          <h4 className="text-sm font-semibold text-themed mb-2">The nisab, both ways</h4>
          <div className="space-y-1 text-sm text-themed-muted">
            <p className="flex justify-between gap-4">
              <span>Gold nisab — {GOLD_NISAB_GRAMS} g of gold</span>
              <span className="text-themed tabular-nums">{fmt(goldNisab)}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span>Silver nisab — {SILVER_NISAB_GRAMS} g of silver</span>
              <span className="text-themed tabular-nums">{fmt(silverNisab)}</span>
            </p>
          </div>
          <p className="text-[11px] text-themed-muted mt-3 leading-relaxed">
            The Prophet (peace be upon him) set the thresholds at 20 dinars of gold and 200
            dirhams (five awaq) of silver; contemporary scholars commonly express these as
            about 85 g of gold and 595 g of silver. Many advise using the lower (silver)
            nisab for cash and mixed wealth, so that more reaches the poor.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => setNisabBasis("silver")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                nisabBasis === "silver"
                  ? "border-[var(--color-gold)] text-gold"
                  : "sidebar-border text-themed-muted"
              }`}
            >
              Use silver nisab
            </button>
            <button
              type="button"
              onClick={() => setNisabBasis("gold")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                nisabBasis === "gold"
                  ? "border-[var(--color-gold)] text-gold"
                  : "sidebar-border text-themed-muted"
              }`}
            >
              Use gold nisab
            </button>
          </div>
        </div>
      </ContentCard>

      <ContentCard delay={0.15}>
        <h3 className="font-semibold text-themed mb-4">Your result</h3>
        <div className="space-y-2 text-sm text-themed-muted">
          <p className="flex justify-between gap-4">
            <span>Cash &amp; savings</span>
            <span className="tabular-nums">{fmt(num(cash))}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span>Gold ({fmt(num(goldGrams))} g)</span>
            <span className="tabular-nums">{fmt(goldValue)}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span>Silver ({fmt(num(silverGrams))} g)</span>
            <span className="tabular-nums">{fmt(silverValue)}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span>Business assets</span>
            <span className="tabular-nums">{fmt(num(business))}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span>Other zakatable assets</span>
            <span className="tabular-nums">{fmt(num(other))}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span>Less: debts due</span>
            <span className="tabular-nums">&minus;{fmt(num(debts))}</span>
          </p>
          <div className="border-t sidebar-border pt-2 mt-2">
            <p className="flex justify-between gap-4 text-themed font-medium">
              <span>Net zakatable wealth</span>
              <span className="tabular-nums">{fmt(net)}</span>
            </p>
            <p className="flex justify-between gap-4 mt-1">
              <span>Nisab in use ({nisabBasis})</span>
              <span className="tabular-nums">{fmt(nisab)}</span>
            </p>
          </div>
        </div>

        <div
          className="rounded-lg p-4 mt-4 border sidebar-border"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          {!hasInput ? (
            <p className="text-sm text-themed-muted">
              Enter your amounts above to see whether zakat is due.
            </p>
          ) : due ? (
            <>
              <p className="text-sm text-themed-muted mb-1">
                Your wealth is at or above the nisab. Zakat due (2.5%):
              </p>
              <p className="text-2xl font-semibold text-gold tabular-nums">{fmt(zakat)}</p>
            </>
          ) : (
            <p className="text-sm text-themed-muted">
              Your net zakatable wealth is below the {nisabBasis} nisab — on these figures, no
              zakat is due. (Check the other nisab too: if you hold mostly{" "}
              {nisabBasis === "silver" ? "gold" : "silver"}, its own threshold applies to it.)
            </p>
          )}
        </div>

        <p className="text-[11px] text-themed-muted mt-4 leading-relaxed">
          This is a simplified aid, not a fatwa. It assumes a full lunar year (hawl) has
          passed on this wealth and uses common contemporary positions (85 g / 595 g nisab,
          2.5% rate). Jewelry, retirement accounts, long-term debts, and business specifics
          carry genuine differences of opinion — confirm your calculation with a scholar or
          your local zakat authority before paying.
        </p>
      </ContentCard>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

function ZakatContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const t = searchParams.get("tab");
    return t && tabs.some((x) => x.key === t) ? (t as TabKey) : "overview";
  });
  // Deep-link support: ?tab=<key>&sub=<topic id>. The initial ?sub= is applied
  // to whichever rail it belongs to; ids are unique across the page.
  const initialSub = searchParams.get("sub");
  const [overviewSub, setOverviewSub] = useState(() =>
    initialSub && overviewTopics.some((t) => t.id === initialSub) ? initialSub : overviewTopics[0].id
  );
  const [whoSub, setWhoSub] = useState(() =>
    initialSub && whoTopics.some((t) => t.id === initialSub) ? initialSub : whoTopics[0].id
  );
  const [assetSub, setAssetSub] = useState(() =>
    initialSub && assetTopics.some((t) => t.id === initialSub) ? initialSub : assetTopics[0].id
  );
  const [recipientSub, setRecipientSub] = useState(() =>
    initialSub && recipientTopics.some((t) => t.id === initialSub) ? initialSub : recipientTopics[0].id
  );
  const [fitrSub, setFitrSub] = useState(() =>
    initialSub && fitrTopics.some((t) => t.id === initialSub) ? initialSub : fitrTopics[0].id
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
    fix(overviewTopics, overviewSub, setOverviewSub);
    fix(whoTopics, whoSub, setWhoSub);
    fix(assetTopics, assetSub, setAssetSub);
    fix(recipientTopics, recipientSub, setRecipientSub);
    fix(fitrTopics, fitrSub, setFitrSub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, overviewSub, whoSub, assetSub, recipientSub, fitrSub]);

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
        title="Zakat"
        titleAr="الزَّكَاة"
        subtitle="The third pillar — purification of wealth, the fixed right of the poor."
      />

      {/* Opening verse — above search + tabs, matching every other content page. */}
      <VerseHero
        arabic="خُذْ مِنْ أَمْوَٰلِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا وَصَلِّ عَلَيْهِمْ ۖ إِنَّ صَلَوٰتَكَ سَكَنٌ لَّهُمْ ۗ وَٱللَّهُ سَمِيعٌ عَلِيمٌ"
        text="Take charity from their wealth [O Prophet] to cleanse and purify them, and pray for them. Your prayer is a source of comfort for them. And Allah is All-Hearing, All-Knowing."
        reference="Quran 9:103"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search topics, verses..." className="mb-6" />

      <TabBar tabs={[...tabs]} activeTab={activeTab} onTabChange={handleTabChange} className="mb-6" />

      <AnimatePresence mode="wait">
        {/* ─── Overview ─── */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(overviewTopics, overviewSub, handleSubChange("overview", setOverviewSub))}

            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">See it among the pillars</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Zakat stands with the shahada, prayer, fasting, and hajj as one of the five
                pillars Islam is built on — the overview of all five lives on its own page.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/pillars"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  The Five Pillars &rarr;
                </Link>
              </div>
            </ContentCard>

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const rows = topicSources(overviewTopics, overviewSub);
              return rows.length > 0 ? <SourcesCard className="mt-6" sources={rows} /> : null;
            })()}
          </motion.div>
        )}

        {/* ─── Who Pays ─── */}
        {activeTab === "who-pays" && (
          <motion.div
            key="who-pays"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(whoTopics, whoSub, handleSubChange("who-pays", setWhoSub))}

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const rows = topicSources(whoTopics, whoSub);
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
          </motion.div>
        )}

        {/* ─── What You Pay On ─── */}
        {activeTab === "assets" && (
          <motion.div
            key="assets"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(assetTopics, assetSub, handleSubChange("assets", setAssetSub))}

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const rows = topicSources(assetTopics, assetSub);
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
          </motion.div>
        )}

        {/* ─── Recipients ─── */}
        {activeTab === "recipients" && (
          <motion.div
            key="recipients"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(recipientTopics, recipientSub, handleSubChange("recipients", setRecipientSub))}

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const rows = topicSources(recipientTopics, recipientSub);
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
          </motion.div>
        )}

        {/* ─── Zakat al-Fitr ─── */}
        {activeTab === "fitr" && (
          <motion.div
            key="fitr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(fitrTopics, fitrSub, handleSubChange("fitr", setFitrSub))}

            <ContentCard className="mt-6">
              <h3 className="font-semibold text-themed mb-2">Part of your Ramadan</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Zakat al-Fitr belongs to the rhythm of Ramadan and Eid — the full month&apos;s
                guide lives on its own page.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/ramadan"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Ramadan guide &rarr;
                </Link>
              </div>
            </ContentCard>

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const rows = topicSources(fitrTopics, fitrSub);
              return rows.length > 0 ? <SourcesCard className="mt-6" sources={rows} /> : null;
            })()}
          </motion.div>
        )}

        {/* ─── Calculator ─── */}
        {activeTab === "calculator" && (
          <motion.div
            key="calculator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ZakatCalculator />

            <SourcesCard
              className="mt-6"
              sources={[
                { ref: "Abu Dawud 9:18", desc: "200 dirhams → 5 dirhams (2.5%); gold nisab 20 dinars; after a year" },
                { ref: "Bukhari 24:61", desc: "No zakat on less than five awaq of silver" },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ZakatPage() {
  return (
    <Suspense>
      <ZakatContent />
    </Suspense>
  );
}
