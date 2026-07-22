"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import { BookOpen, Telescope, Clock, MapPin, Moon, Sparkles } from "lucide-react";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import Link from "next/link";

type Strength = "strong" | "moderate" | "debated";

type Miracle = {
  category: string;
  title: string;
  reference: string;
  arabic?: string;
  translation?: string;
  explanation: string;
  historicalContext?: string;
  sources: string[];
  strength: Strength;
  strengthNote?: string;
};

// Pills shown in the TabBar. To stay within ~6 tabs while adding the Prophet's
// sensory miracles, the "numerical" cards are folded under the combined
// Linguistic & Textual pill (each pill lists the card-categories it matches).
const categories = [
  { key: "all", label: "All", icon: null, cats: null as string[] | null },
  { key: "prophetic", label: "Prophet's Miracles ﷺ", icon: Moon, cats: ["prophetic"] },
  { key: "linguistic", label: "Linguistic & Textual", icon: BookOpen, cats: ["linguistic", "numerical"] },
  { key: "prophecy", label: "Fulfilled Prophecies", icon: Clock, cats: ["prophecy"] },
  { key: "scientific", label: "Scientific References", icon: Telescope, cats: ["scientific"] },
  { key: "historical", label: "Historical & Archaeological", icon: MapPin, cats: ["historical"] },
];

// Per-card display labels (distinct from the pills above, since two card
// categories now share one pill).
const categoryLabels: Record<string, string> = {
  prophetic: "Miracle of the Prophet ﷺ",
  linguistic: "Linguistic Miracle",
  numerical: "Numerical Pattern",
  prophecy: "Fulfilled Prophecy",
  scientific: "Scientific Reference",
  historical: "Historical & Archaeological",
};

// Honest strength grading surfaced on every card. Inline colours keep the badge
// legible in both light and dark themes without touching shared CSS.
const strengthMeta: Record<Strength, { label: string; color: string; bg: string }> = {
  strong: { label: "Well-established", color: "#059669", bg: "rgba(16,185,129,0.14)" },
  moderate: { label: "Reasonable / secondary", color: "#d97706", bg: "rgba(217,119,6,0.16)" },
  debated: { label: "Contested", color: "#9ca3af", bg: "rgba(148,163,184,0.18)" },
};

const miracles: Miracle[] = [
  // === PROPHETIC — MIRACLES OF THE PROPHET ﷺ ===
  {
    category: "prophetic",
    title: "The Splitting of the Moon",
    reference: "Quran 54:1; Bukhari 63:94",
    arabic: "ٱقْتَرَبَتِ ٱلسَّاعَةُ وَٱنشَقَّ ٱلْقَمَرُ",
    translation: "The Hour has drawn near and the moon has split asunder.",
    explanation: "Before the pagans of Mecca demanded a sign, the moon was split into two visible halves — one part appearing over the mountain of Mina and the other beside it — after which the Quran recorded the event and the Meccans' dismissal of it as “magic.” It is the physical miracle most associated with the Prophet ﷺ, narrated by several companions (Ibn Masʿud, Ibn ʿAbbas, and Anas) through many independent chains in the two most authentic collections.",
    historicalContext: "Al-Qamar (chapter 54) opens with the event and the immediate reaction of the onlookers, and the multiple companion narrations in Bukhari and Muslim place it at Mina during the Meccan period.",
    sources: ["Quran 54:1-2", "Bukhari 61:140", "Bukhari 61:142", "Bukhari 63:94", "Muslim 52:27", "Muslim 52:34"],
    strength: "strong",
    strengthNote: "Reported through numerous independent companion chains in both Bukhari and Muslim (near-mutawatir), which is why the classical scholars treated it as one of the most firmly established sensory miracles.",
  },
  {
    category: "prophetic",
    title: "Water Flowing From Between His Fingers",
    reference: "Bukhari 64:196; Muslim 43:6",
    explanation: "On more than one occasion, when the companions had no water, the Prophet ﷺ placed his hand in a vessel and water spouted out from between his fingers — enough for an entire company to drink and make ablution. Jabir ibn ʿAbdullah narrated it from the day of Hudaybiyah (where he estimated the people at around 1,500), and Anas ibn Malik narrated a separate incident at az-Zawraʾ near Medina.",
    sources: ["Bukhari 64:196", "Muslim 43:6"],
    strength: "strong",
    strengthNote: "Established in both Bukhari and Muslim through separate companions (Jabir and Anas) describing distinct occasions.",
  },
  {
    category: "prophetic",
    title: "A Little Food Feeding a Multitude",
    reference: "Bukhari 61:87; Muslim 36:190; Bukhari 9:77",
    explanation: "Several authentic reports describe small quantities of food being blessed to feed far more people than it should have. In Abu Talha's house a small meal of barley bread, touched and blessed by the Prophet ﷺ, fed roughly seventy to eighty men in groups of ten until all were satisfied; the food of Abu Bakr's household likewise multiplied while feeding the poor companions of the Suffah.",
    sources: ["Bukhari 61:87", "Muslim 36:190", "Bukhari 9:77"],
    strength: "strong",
    strengthNote: "Multiple independent narrations of food-multiplication appear across Bukhari and Muslim; those cited are among the most detailed.",
  },
  {
    category: "prophetic",
    title: "The Weeping Palm-Trunk (al-Hannanah)",
    reference: "Bukhari 34:48",
    explanation: "The Prophet ﷺ used to deliver the Friday sermon leaning against the trunk of a date-palm in his mosque. When a pulpit (minbar) was built and he moved to it, the abandoned trunk audibly cried out — “like a child being quieted” — until he came down, embraced it, and it fell silent. The event was witnessed by the congregation and narrated by Jabir ibn ʿAbdullah and others.",
    sources: ["Bukhari 34:48", "Bukhari 61:93"],
    strength: "strong",
    strengthNote: "Narrated by several companions who were present in the mosque; recorded in Bukhari among the Prophet's signs.",
  },
  {
    category: "prophetic",
    title: "The Opening of the Chest and the Night Journey",
    reference: "Bukhari 60:17",
    explanation: "Among the extraordinary events of the Prophet's ﷺ life was the splitting open of his chest by the angel Jibril, who washed his heart with Zamzam water and filled it with wisdom and faith — recounted in the narration of the Israʾ (Night Journey) and Miʿraj (Ascension), when he was carried from Mecca to Jerusalem and then through the heavens. This sits alongside the wider narrative of the Israʾ wal-Miʿraj referenced in Surah al-Israʾ (17:1).",
    sources: ["Bukhari 60:17", "Quran 17:1"],
    strength: "strong",
    strengthNote: "The chest-opening and ascension are established in Bukhari; details differ across narrations, and scholars discuss whether the journey was in body and soul (the majority view) or in vision.",
  },

  // === LINGUISTIC MIRACLE ===
  {
    category: "linguistic",
    title: "The Quran's Challenge (Tahaddī)",
    reference: "Quran 2:23; Quran 17:88",
    arabic: "وَإِن كُنتُمْ فِى رَيْبٍۢ مِّمَّا نَزَّلْنَا عَلَىٰ عَبْدِنَا فَأْتُوا۟ بِسُورَةٍۢ مِّن مِّثْلِهِ",
    translation: "And if you are in doubt about what We have sent down upon Our Servant, then produce a surah the like thereof.",
    explanation: "The Quran issues an open challenge to all of humanity and jinn to produce even a single chapter like it. In over 1400 years, despite fierce opposition from the most eloquent Arab poets and orators, no one has successfully met this challenge. This is considered the foundational miracle of the Quran.",
    sources: ["Quran 2:23-24", "Quran 17:88", "Quran 11:13", "Quran 10:38"],
    strength: "strong",
  },
  {
    category: "linguistic",
    title: "A Unique Literary Form",
    reference: "Recognized by Arab linguists across centuries",
    explanation: "The Quran does not conform to any existing form of Arabic literature — it is neither poetry (shi'r), nor prose (nathr), nor rhymed prose (saj'). It created an entirely new literary category. Even opponents of Prophet Muhammad ﷺ, such as Al-Walid ibn al-Mughirah, acknowledged its extraordinary nature. He famously said: 'It is not the speech of a human being.' Arab linguists throughout history, including non-Muslim scholars, have recognized the Quran's linguistic inimitability.",
    historicalContext: "Al-Walid ibn al-Mughirah, a chief of Quraysh and expert in Arabic poetry, was sent by the Quraysh to evaluate the Quran. Despite being a staunch opponent of Islam, he could not classify it as poetry, prose, or sorcery, and admitted its superiority over all known forms of speech.",
    sources: ["Ibn Kathir, Al-Bidayah wan-Nihayah", "Al-Baqillani, I'jaz al-Quran", "Al-Jurjani, Dala'il al-I'jaz"],
    strength: "strong",
  },

  // === FULFILLED PROPHECIES ===
  {
    category: "prophecy",
    title: "The Conquest of Constantinople",
    reference: "Muslim 54:44; Tirmidhi 33:82",
    arabic: "لَتُفْتَحَنَّ الْقُسْطَنْطِينِيَّةُ فَلَنِعْمَ الْأَمِيرُ أَمِيرُهَا وَلَنِعْمَ الْجَيْشُ ذَٰلِكَ الْجَيْشُ",
    translation: "Verily, Constantinople will be conquered. How excellent will be the commander who conquers it, and how excellent will be his army.",
    explanation: "Prophet Muhammad ﷺ prophesied the conquest of Constantinople (modern-day Istanbul). Multiple authentic narrations confirm this prophecy. The specific narration praising the commander and army is from Musnad Ahmad (grading disputed among scholars). This prophecy was fulfilled in 1453 CE — over 800 years later — when the Ottoman Sultan Mehmed II conquered the city.",
    historicalContext: "Constantinople was the capital of the Byzantine Empire and one of the most fortified cities in the world. Multiple Muslim attempts to conquer it had failed over centuries before Mehmed II's successful siege.",
    sources: ["Muslim 54:44", "Tirmidhi 33:82", "Historical: Fall of Constantinople, 1453 CE"],
    strength: "strong",
    strengthNote: "The general prophecy of Constantinople's conquest is in Sahih Muslim and other authentic collections. The specific 'how excellent the commander' wording (Musnad Ahmad) has been weakened by al-Albani and al-Arna'ut, but authenticated by al-Hakim and al-Dhahabi.",
  },
  {
    category: "prophecy",
    title: "The Conquest of Jerusalem",
    reference: "Bukhari 58:18",
    explanation: "Prophet Muhammad ﷺ told his companion Awf ibn Malik about six signs before the Day of Judgment, the first being his own death and the second being the conquest of Jerusalem (Bayt al-Maqdis). Jerusalem was conquered by the Muslim army under Caliph Umar ibn al-Khattab in 637 CE, just 5 years after the Prophet's death.",
    historicalContext: "Caliph Umar personally traveled to Jerusalem to accept its surrender from the Patriarch Sophronius. He famously refused to pray inside the Church of the Holy Sepulchre to prevent Muslims from converting it to a mosque.",
    sources: ["Bukhari 58:18", "Historical: Siege of Jerusalem, 637 CE"],
    strength: "strong",
  },
  {
    category: "prophecy",
    title: "The Conquest of Persia and Treasures of Kisra",
    reference: "Bukhari 57:29",
    arabic: "إِذَا هَلَكَ كِسْرَى فَلَا كِسْرَى بَعْدَهُ",
    translation: "When Kisra (Chosroes) perishes, there will be no Kisra after him.",
    explanation: "Prophet Muhammad ﷺ prophesied the fall of the Persian Empire and that its treasures would be spent in the cause of Allah. The Sasanian Persian Empire — one of the two superpowers of the time — fell to the Muslim army in 651 CE, and its vast treasures were distributed.",
    sources: ["Bukhari 57:29", "Muslim 54:92", "Historical: Fall of Sasanian Empire, 651 CE"],
    strength: "strong",
  },
  {
    category: "prophecy",
    title: "Barefoot Shepherds Competing in Tall Buildings",
    reference: "Muslim 1:1",
    arabic: "أَنْ تَلِدَ الْأَمَةُ رَبَّتَهَا وَأَنْ تَرَى الْحُفَاةَ الْعُرَاةَ الْعَالَةَ رِعَاءَ الشَّاءِ يَتَطَاوَلُونَ فِي الْبُنْيَانِ",
    translation: "...and you will see barefoot, naked, destitute shepherds competing in constructing tall buildings.",
    explanation: "In the famous Hadith of Jibreel, the Prophet ﷺ described one of the signs of the approaching Hour: that barefoot, impoverished Bedouin shepherds would compete in building the tallest structures. Today, the Arabian Peninsula — historically home to nomadic Bedouin tribes — hosts the world's tallest skyscrapers, including the Burj Khalifa (828m) and the upcoming Jeddah Tower.",
    sources: ["Muslim 1:1 (Hadith of Jibreel)", "Bukhari 2:43"],
    strength: "strong",
  },
  {
    category: "prophecy",
    title: "A Fire from Hijaz Visible from Busra",
    reference: "Bukhari 92:65, Muslim 54:55",
    arabic: "لَا تَقُومُ السَّاعَةُ حَتَّى تَخْرُجَ نَارٌ مِنْ أَرْضِ الْحِجَازِ تُضِيءُ أَعْنَاقَ الْإِبِلِ بِبُصْرَى",
    translation: "The Hour will not come until a fire emerges from the land of Hijaz that will illuminate the necks of camels in Busra (Syria).",
    explanation: "In 1256 CE, a massive volcanic eruption occurred east of Medina. The eruption lasted for weeks and the lava flow extended over 23 km. Contemporary historians, including Abu Shama al-Maqdisi, documented that the light of the fire was visible from great distances, with reports reaching as far as Busra in Syria.",
    historicalContext: "Abu Shama al-Maqdisi recorded: 'A great fire appeared in the Harrah near Medina on Friday, 6th Jumada al-Akhirah 654 AH.' The event was documented by multiple historians of the period.",
    sources: ["Bukhari 92:65", "Muslim 54:55", "Abu Shama al-Maqdisi, Dhayl al-Rawdatayn"],
    strength: "strong",
  },
  {
    category: "prophecy",
    title: "The Plague of Amwas",
    reference: "Bukhari 58:18",
    explanation: "Prophet Muhammad ﷺ informed his companion Awf ibn Malik of six signs, one of which was a plague that would strike the Muslims like the disease of sheep. The Plague of Amwas struck Palestine in 639 CE (18 AH), devastating the Muslim community in the Levant and killing approximately 25,000 people, including prominent companions such as Abu Ubayda ibn al-Jarrah.",
    historicalContext: "Abu Ubayda ibn al-Jarrah, the overall commander of the Muslim armies in Syria and one of the ten companions promised Paradise, died in this plague along with Mu'adh ibn Jabal and Yazid ibn Abi Sufyan.",
    sources: ["Bukhari 58:18", "Ibn Kathir, Al-Bidayah wan-Nihayah"],
    strength: "strong",
  },
  {
    category: "prophecy",
    title: "Widespread Senseless Killing",
    reference: "Bukhari 92:13, Muslim 54:23",
    arabic: "يَتَقَارَبُ الزَّمَانُ وَيَكْثُرُ الْهَرْجُ ... الْقَتْلُ الْقَتْلُ",
    translation: "Time will pass rapidly and al-harj will increase... killing, killing.",
    explanation: "The Prophet ﷺ prophesied a time when senseless, widespread killing (al-harj) would become commonplace — where the killer would not know why he kills and the victim would not know why he was killed. This describes an era of indiscriminate violence, terrorism, and mass conflict that the modern world has witnessed in unprecedented scale.",
    sources: ["Bukhari 92:13", "Muslim 54:23"],
    strength: "strong",
  },
  {
    category: "prophecy",
    title: "Time Passing Rapidly",
    reference: "Tirmidhi 36:29",
    arabic: "لَا تَقُومُ السَّاعَةُ حَتَّى يَتَقَارَبَ الزَّمَانُ",
    translation: "The Hour will not come until time passes rapidly — a year will be like a month, a month like a week, a week like a day.",
    explanation: "The Prophet ﷺ described a time when time itself would seem to accelerate. Modern life, with its constant connectivity, information overload, and rapid pace, has made this perception of accelerating time a widely shared experience across cultures.",
    sources: ["Tirmidhi 36:29 (graded sahih by al-Albani)"],
    strength: "strong",
    strengthNote: "The prophecy is authentic; its fulfillment is based on the widely shared perception of modern life's accelerating pace.",
  },
  {
    category: "prophecy",
    title: "Markets Coming Close Together",
    reference: "Ahmad 10724",
    arabic: "تَقَارُبُ الْأَسْوَاقِ",
    translation: "Markets will come close together.",
    explanation: "The Prophet ﷺ prophesied that markets would draw close to one another. This has been interpreted as the proliferation of shopping centers, malls, and the rise of global e-commerce — where virtually any marketplace in the world is accessible from anywhere. International trade and supply chains have made markets across continents effectively 'close together.'",
    sources: ["Ahmad 10724"],
    strength: "strong",
    strengthNote: "Authentic hadith; interpretation of 'closeness' as global commerce is a modern reading.",
  },

  {
    category: "prophecy",
    title: "The Mongol Siege and Destruction of Baghdad",
    reference: "Bukhari 56:141; Muslim 54:76",
    arabic: "لَا تَقُومُ السَّاعَةُ حَتَّى تُقَاتِلُوا قَوْمًا نِعَالُهُمُ الشَّعَرُ وَلَا تَقُومُ السَّاعَةُ حَتَّى تُقَاتِلُوا قَوْمًا صِغَارَ الْأَعْيُنِ ذُلْفَ الْأُنُوفِ",
    translation: "The Hour will not come until you fight a people whose shoes are made of hair, and the Hour will not come until you fight a people with small eyes and flat noses.",
    explanation: "The Prophet ﷺ warned that Muslims would fight a people 'whose faces are like hammered shields' with small eyes and flat noses, who wear shoes made of hair. In 1258 CE, the Mongol army under Hulagu Khan — matching this description exactly — sacked Baghdad, the capital of the Abbasid Caliphate. An estimated 200,000 to over a million people were killed, the House of Wisdom was destroyed, and the Tigris ran black with ink from the books thrown into it. This was one of the most catastrophic events in human history.",
    historicalContext: "The Mongol invasion ended the Islamic Golden Age. Baghdad, which had been the intellectual and political center of the Muslim world for over 500 years, was utterly devastated. The last Abbasid Caliph, al-Musta'sim, was executed by being wrapped in a carpet and trampled by horses.",
    sources: ["Bukhari 56:141", "Muslim 54:76", "Historical: Siege of Baghdad, 1258 CE"],
    strength: "strong",
  },

  // === SCIENTIFIC REFERENCES ===
  {
    category: "scientific",
    title: "Embryonic Development Stages",
    reference: "Quran 23:12-14",
    arabic: "ثُمَّ خَلَقْنَا ٱلنُّطْفَةَ عَلَقَةًۭ فَخَلَقْنَا ٱلْعَلَقَةَ مُضْغَةًۭ فَخَلَقْنَا ٱلْمُضْغَةَ عِظَـٰمًۭا فَكَسَوْنَا ٱلْعِظَـٰمَ لَحْمًۭا",
    translation: "Then We made the sperm-drop into a clinging clot, and We made the clot into a lump [of flesh], and We made from the lump, bones, and We covered the bones with flesh.",
    explanation: "The Quran describes precise stages of embryonic development: nutfah (drop/sperm), alaqah (clinging clot — the embryo at this stage literally clings to the uterine wall), mudghah (chewed-like lump — the embryo resembles a chewed substance), then bones forming and being clothed with flesh. These stages correspond remarkably to modern embryology, described centuries before microscopes existed.",
    historicalContext: "Dr. Keith Moore, a professor of anatomy at the University of Toronto, studied the Quranic descriptions and stated: 'It is clear to me that these statements must have come to Muhammad from God, because almost all of this knowledge was not discovered until many centuries later.'",
    sources: ["Quran 23:12-14", "Keith Moore, The Developing Human (1982)", "Quran 22:5"],
    strength: "strong",
  },
  {
    category: "scientific",
    title: "The Barrier Between Two Seas",
    reference: "Quran 55:19-20; Quran 25:53",
    arabic: "مَرَجَ ٱلْبَحْرَيْنِ يَلْتَقِيَانِ ﴿١٩﴾ بَيْنَهُمَا بَرْزَخٌۭ لَّا يَبْغِيَانِ",
    translation: "He released the two seas, meeting [side by side]. Between them is a barrier [so] neither of them transgresses.",
    explanation: "The Quran describes two bodies of water that meet but do not mix, separated by an invisible barrier (barzakh). Modern oceanography has confirmed the phenomenon of haloclines — zones where bodies of water with different salinity, temperature, and density meet but maintain distinct properties. This is observable at locations such as the Strait of Gibraltar, where the Mediterranean and Atlantic meet.",
    sources: ["Quran 55:19-20", "Quran 25:53", "Oceanographic studies on haloclines and pycnoclines"],
    strength: "strong",
  },
  {
    category: "scientific",
    title: "Mountains as Stakes/Pegs",
    reference: "Quran 78:6-7",
    arabic: "أَلَمْ نَجْعَلِ ٱلْأَرْضَ مِهَـٰدًۭا ﴿٦﴾ وَٱلْجِبَالَ أَوْتَادًۭا",
    translation: "Have We not made the earth a resting place? And the mountains as stakes?",
    explanation: "The Quran describes mountains as 'awtad' (pegs or stakes). Modern geology has confirmed that mountains have deep roots extending far beneath the Earth's surface into the mantle — like pegs driven into the ground. This root structure helps stabilize the Earth's crust and is a key component of the theory of isostasy.",
    sources: ["Quran 78:6-7", "Quran 21:31", "Press & Siever, Earth (1986)", "Theory of isostasy"],
    strength: "strong",
  },
  {
    category: "scientific",
    title: "The Origin of Iron",
    reference: "Quran 57:25",
    arabic: "وَأَنزَلْنَا ٱلْحَدِيدَ فِيهِ بَأْسٌۭ شَدِيدٌۭ وَمَنَـٰفِعُ لِلنَّاسِ",
    translation: "And We sent down iron, wherein is great military might and benefits for the people.",
    explanation: "The Quran uses the specific word 'anzalna' (We sent down) for iron, rather than 'created.' Modern astrophysics has confirmed that iron is not native to Earth — it was formed in massive stars through nuclear fusion and arrived on Earth via meteorites during the planet's formation. The energy required to produce iron exceeds what our solar system's sun can generate.",
    sources: ["Quran 57:25", "Astrophysical Journal — iron nucleosynthesis in supernovae"],
    strength: "strong",
  },
  {
    category: "scientific",
    title: "Deep Sea Internal Waves and Darkness",
    reference: "Quran 24:40",
    arabic: "أَوْ كَظُلُمَـٰتٍۢ فِى بَحْرٍۢ لُّجِّىٍّۢ يَغْشَىٰهُ مَوْجٌۭ مِّن فَوْقِهِۦ مَوْجٌۭ مِّن فَوْقِهِۦ سَحَابٌۭ ۚ ظُلُمَـٰتٌۢ بَعْضُهَا فَوْقَ بَعْضٍ",
    translation: "Or [they are] like darknesses within a deep sea covered by waves, upon which are waves, upon which are clouds — darknesses, some of them upon others.",
    explanation: "The Quran describes layers of darkness in the deep ocean, with internal waves beneath surface waves. Modern oceanography has confirmed: (1) Light is progressively absorbed in the ocean, with near-total darkness below 200 meters. (2) Internal waves exist at the boundaries between water layers of different densities. (3) The description of 'waves upon waves' accurately reflects surface waves and internal waves. This knowledge was impossible to obtain without modern submarines and deep-sea technology.",
    sources: ["Quran 24:40", "Oceanographic studies on deep-sea darkness and internal waves"],
    strength: "strong",
  },
  {
    category: "scientific",
    title: "The Water Cycle",
    reference: "Quran 39:21; Quran 23:18",
    arabic: "أَلَمْ تَرَ أَنَّ ٱللَّهَ أَنزَلَ مِنَ ٱلسَّمَآءِ مَآءًۭ فَسَلَكَهُۥ يَنَـٰبِيعَ فِى ٱلْأَرْضِ",
    translation: "Do you not see that Allah sends down rain from the sky and makes it flow as springs in the earth?",
    explanation: "The Quran describes the complete water cycle: evaporation, cloud formation, precipitation, and groundwater springs — with remarkable accuracy. While some ancient civilizations had partial understanding of rain and rivers, the Quran's comprehensive description of water being sent from the sky and then emerging as springs from the earth accurately describes infiltration and the water table.",
    sources: ["Quran 39:21", "Quran 23:18", "Quran 15:22"],
    strength: "moderate",
    strengthNote: "The water cycle was partially understood by some ancient civilizations, though the Quran's complete and accurate description predates full scientific understanding.",
  },
  {
    category: "scientific",
    title: "Celestial Bodies in Orbits",
    reference: "Quran 21:33; Quran 36:40",
    arabic: "وَكُلٌّۭ فِى فَلَكٍۢ يَسْبَحُونَ",
    translation: "...and each [celestial body] is floating in an orbit.",
    explanation: "The Quran states that the sun, moon, and celestial bodies each travel in their own orbit (falak). The word 'yasbahun' (swimming/floating) accurately describes orbital motion in space. The concept of the sun having its own orbit was only confirmed in modern astronomy — the sun orbits the center of the Milky Way galaxy at about 828,000 km/h.",
    sources: ["Quran 21:33", "Quran 36:40"],
    strength: "moderate",
    strengthNote: "The concept of celestial orbits was partially known to ancient astronomers, though the Quran's description of the sun also having an orbit predates its scientific confirmation.",
  },
  {
    category: "scientific",
    title: "The Expanding Universe",
    reference: "Quran 51:47",
    arabic: "وَٱلسَّمَآءَ بَنَيْنَـٰهَا بِأَيْىدٍۢ وَإِنَّا لَمُوسِعُونَ",
    translation: "And the heaven We constructed with strength, and indeed, We are [its] expander.",
    explanation: "The Quran uses the word 'musi'un' which can mean 'expander' or 'vast in power.' Many modern scholars and scientists have noted the remarkable parallel with Hubble's 1929 discovery that the universe is expanding. However, this is a modern interpretation — classical tafsirs (such as Ibn Kathir and Al-Tabari) primarily interpreted 'musi'un' as 'We are vast in power and capability.'",
    sources: ["Quran 51:47", "Hubble, E. (1929). PNAS, 15(3), 168-173", "Tafsir Ibn Kathir", "Tafsir al-Tabari"],
    strength: "debated",
    strengthNote: "Classical scholars interpreted 'musi'un' as 'vast in power.' The expanding universe interpretation is modern and not universally accepted among traditional scholars.",
  },
  {
    category: "scientific",
    title: "The Big Bang — Heavens and Earth Joined Then Split",
    reference: "Quran 21:30",
    arabic: "أَوَلَمْ يَرَ ٱلَّذِينَ كَفَرُوٓا۟ أَنَّ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ كَانَتَا رَتْقًۭا فَفَتَقْنَـٰهُمَا",
    translation: "Have those who disbelieved not considered that the heavens and the earth were a joined entity, and We separated them?",
    explanation: "The Quran describes the heavens and earth as having been a single joined entity (ratq) that was then split apart (fatq). Some modern scholars see a parallel with the Big Bang theory, where all matter and energy was concentrated in a singularity before expanding. However, classical interpretations (Ibn Abbas, Mujahid) understood this as the sky and earth being joined and then separated — with rain sent from the sky and plants grown from the earth.",
    sources: ["Quran 21:30", "Tafsir Ibn Kathir", "Tafsir al-Tabari"],
    strength: "debated",
    strengthNote: "Classical tafsirs interpret this as the separation of sky and earth (for rain and vegetation), not necessarily the Big Bang. The cosmological reading is a modern interpretation.",
  },
  {
    category: "scientific",
    title: "Pain Receptors in the Skin",
    reference: "Quran 4:56",
    arabic: "كُلَّمَا نَضِجَتْ جُلُودُهُم بَدَّلْنَـٰهُمْ جُلُودًا غَيْرَهَا لِيَذُوقُوا۟ ٱلْعَذَابَ",
    translation: "Every time their skins are roasted through, We will replace them with other skins so they may taste the punishment.",
    explanation: "The Quran states that when the skin is burned away, it will be replaced so the person can continue to feel pain. Modern medicine has confirmed that pain receptors (nociceptors) are concentrated in the skin — when skin is completely destroyed (full-thickness burns), the patient paradoxically feels less pain because the nerve endings are destroyed. The Quran's emphasis on replacing the skin to 'taste' the punishment aligns with this medical reality.",
    sources: ["Quran 4:56"],
    strength: "moderate",
    strengthNote: "The verse's primary context is describing punishment in the Hereafter. The connection to pain receptor science is a secondary observation.",
  },
  {
    category: "scientific",
    title: "The Frontal Lobe — The Lying Forelock",
    reference: "Quran 96:15-16",
    arabic: "كَلَّا لَئِن لَّمْ يَنتَهِ لَنَسْفَعًۢا بِٱلنَّاصِيَةِ ﴿١٥﴾ نَاصِيَةٍۢ كَـٰذِبَةٍ خَاطِئَةٍۢ",
    translation: "No! If he does not desist, We will surely drag him by the forelock — a lying, sinning forelock.",
    explanation: "The Quran describes the nasiyah (forelock/frontal area of the head) as 'lying' and 'sinful' — attributing moral decision-making to this specific area of the head. Modern neuroscience has confirmed that the prefrontal cortex, located directly behind the forehead, is responsible for executive functions including planning, decision-making, moderating social behavior, and importantly, the ability to deceive.",
    sources: ["Quran 96:15-16", "Neuroscience research on prefrontal cortex function"],
    strength: "moderate",
    strengthNote: "The connection between the frontal lobe and lying/decision-making is well-established in neuroscience. The Quranic description is notable but brief.",
  },

  // === HISTORICAL & ARCHAEOLOGICAL ===
  {
    category: "historical",
    title: "Pharaoh's Body Preserved",
    reference: "Quran 10:92",
    arabic: "فَٱلْيَوْمَ نُنَجِّيكَ بِبَدَنِكَ لِتَكُونَ لِمَنْ خَلْفَكَ ءَايَةًۭ",
    translation: "So today We will save you in body that you may be to those who succeed you a sign.",
    explanation: "The Quran states that Pharaoh's body would be preserved as a sign for future generations. While the Torah describes Pharaoh drowning in the sea, it makes no mention of bodily preservation. The discovery of royal Egyptian mummies — preserved for thousands of years — confirmed this Quranic claim. The mummy commonly identified as the Pharaoh of the Exodus was found remarkably intact.",
    historicalContext: "The exact identity of the Pharaoh of the Exodus is debated among historians. Ramesses II and his son Merneptah are the two primary candidates. Both mummies are preserved in the Egyptian Museum.",
    sources: ["Quran 10:92", "Egyptian Museum, Cairo", "Maurice Bucaille, The Bible, the Quran and Science (1976)"],
    strength: "strong",
    strengthNote: "The preservation claim is confirmed. The specific identification of which Pharaoh is debated among historians.",
  },
  {
    category: "historical",
    title: "The Dwellings of Thamud",
    reference: "Quran 7:74; Quran 26:149",
    arabic: "وَتَنْحِتُونَ مِنَ ٱلْجِبَالِ بُيُوتًۭا فَـٰرِهِينَ",
    translation: "And you carve out of the mountains, homes, with skill.",
    explanation: "The Quran describes the people of Thamud as carving homes out of mountains. The archaeological site of Mada'in Saleh (Al-Hijr) in northwestern Saudi Arabia contains over 130 monumental tombs carved directly into sandstone rock faces, dating to the 1st century CE Nabataean period. The site is traditionally identified with the dwellings of Thamud and matches the Quranic description precisely.",
    historicalContext: "Mada'in Saleh was designated a UNESCO World Heritage Site in 2008. It is the largest conserved site of the Nabataean civilization south of Petra. The Quran describes these dwellings as a warning — the site remains largely uninhabited to this day.",
    sources: ["Quran 7:74", "Quran 26:149", "Quran 15:80-84", "UNESCO: Al-Hijr Archaeological Site"],
    strength: "strong",
  },
  {
    category: "historical",
    title: "Iram of the Pillars (City of 'Ad)",
    reference: "Quran 89:6-8",
    arabic: "إِرَمَ ذَاتِ ٱلْعِمَادِ ﴿٧﴾ ٱلَّتِى لَمْ يُخْلَقْ مِثْلُهَا فِى ٱلْبِلَـٰدِ",
    translation: "Iram — who had lofty pillars, the likes of whom had never been created in the land.",
    explanation: "The Quran describes Iram as a powerful civilization with impressive pillars, the like of which had never been seen. For centuries, critics considered Iram to be purely mythological. In 1992, archaeologist Nicholas Clapp and a team using NASA satellite imaging discovered the remains of a buried city in the Rub' al-Khali (Empty Quarter) desert of Oman, which they identified as a candidate for the lost city of Ubar/Iram.",
    historicalContext: "The discovery was widely reported, with the Los Angeles Times calling it 'The Atlantis of the Sands.' However, the identification of the archaeological site with the Quranic Iram remains debated among scholars.",
    sources: ["Quran 89:6-8", "Nicholas Clapp, The Road to Ubar (1998)", "NASA/JPL satellite imagery"],
    strength: "moderate",
    strengthNote: "Archaeological remains were found, but the definitive identification as the Quranic Iram is debated among historians and archaeologists.",
  },
  {
    category: "historical",
    title: "The Lowest Point on Earth",
    reference: "Quran 30:2-3",
    arabic: "غُلِبَتِ ٱلرُّومُ ﴿٢﴾ فِىٓ أَدْنَى ٱلْأَرْضِ",
    translation: "The Romans have been defeated in the lowest [nearest] land.",
    explanation: "The Quran describes the Roman defeat as occurring in 'adna al-ard.' The word 'adna' in Arabic carries two meanings: 'nearest' and 'lowest.' The battle between the Romans and Persians took place near the Dead Sea basin, which at approximately 430 meters below sea level is indeed the lowest point on the Earth's surface. This dual meaning — both geographically nearest to Arabia and the lowest elevation on Earth — was impossible to verify without modern measurement tools.",
    sources: ["Quran 30:2-3", "Geographic surveys: Dead Sea depression, lowest land point on Earth"],
    strength: "strong",
  },

  // === NUMERICAL PATTERNS ===
  {
    category: "numerical",
    title: "\"Day\" (Yawm) Mentioned 365 Times",
    reference: "Various verses throughout the Quran",
    explanation: "A popular claim states that the singular word 'yawm' (day) appears exactly 365 times in the Quran — matching the number of days in a solar year. Some researchers have counted this and arrived at 365, while others reach different totals (ranging from 349 to 475) depending on whether they count dual forms, plural forms, or the word when it appears as part of compound phrases like 'Yawm al-Qiyamah.'",
    sources: ["Abdulrazaq Naufal, Al-I'jaz al-Adadi fil-Quran", "Various independent word counts"],
    strength: "debated",
    strengthNote: "The count of 365 depends heavily on which grammatical forms are included or excluded. There is no scholarly consensus on the counting methodology, and different methods yield different results.",
  },
  {
    category: "numerical",
    title: "\"Month\" (Shahr) Mentioned 12 Times",
    reference: "Various verses throughout the Quran",
    explanation: "The word 'shahr' (month) in its singular form appears exactly 12 times in the Quran, matching the 12 months in both the Islamic lunar calendar and the solar calendar. This is one of the more consistently verified numerical claims, as the count is straightforward and has been confirmed by multiple independent researchers.",
    sources: ["Quran word frequency analysis", "Abdulrazaq Naufal, Al-I'jaz al-Adadi fil-Quran"],
    strength: "moderate",
    strengthNote: "The count of 12 is widely agreed upon and is one of the more straightforward numerical observations. However, whether this constitutes a deliberate miracle or coincidence is debated among scholars.",
  },
  {
    category: "numerical",
    title: "\"Sea\" and \"Land\" — 71.1% to 28.9% Ratio",
    reference: "Word frequency analysis across the Quran",
    explanation: "The word 'bahr' (sea) is said to appear 32 times in the Quran, while 'barr' (land) appears 13 times — totaling 45 mentions. Sea: 32/45 = 71.1%, Land: 13/45 = 28.9%. Remarkably, the actual surface area of Earth is approximately 71% water and 29% land. Proponents argue this precise ratio could not have been known in 7th-century Arabia.",
    sources: ["Quran word frequency analysis", "NASA Earth surface area data"],
    strength: "debated",
    strengthNote: "The word counts vary depending on methodology. Critics note that 'bahr' can refer to large rivers (not just seas), and some forms may be missed or over-counted. The mathematical result is striking if the counts are accepted, but the counting method is disputed.",
  },
  {
    category: "numerical",
    title: "\"Man\" and \"Woman\" — Equal Mentions",
    reference: "Word frequency analysis across the Quran",
    explanation: "The words 'rajul' (man) and 'imra'ah' (woman) are each claimed to appear 24 times in the Quran, representing equality between the genders in God's sight. Some researchers have also noted that related pairs like 'male' (dhakr) and 'female' (untha) appear equal numbers of times.",
    sources: ["Abdulrazaq Naufal, Al-I'jaz al-Adadi fil-Quran", "Various word count analyses"],
    strength: "debated",
    strengthNote: "The count of 24 each is one specific methodology. Some counts using different grammatical forms arrive at different numbers. The pairing is suggestive but depends on which word forms are included.",
  },
  {
    category: "numerical",
    title: "\"Life\" and \"Death\" — Equal Mentions",
    reference: "Word frequency analysis across the Quran",
    explanation: "The words 'al-hayat' (life) and 'al-mawt' (death) are claimed to each appear 145 times in the Quran, representing the inseparable pairing of life and death. This symmetry is cited as evidence of deliberate divine structure in the Quran's composition.",
    sources: ["Abdulrazaq Naufal, Al-I'jaz al-Adadi fil-Quran"],
    strength: "debated",
    strengthNote: "Counts vary significantly depending on whether derived forms, verbal nouns, and related words are included. Some researchers report different numbers using different counting criteria.",
  },
  {
    category: "numerical",
    title: "\"Angels\" and \"Devils\" — Equal Mentions",
    reference: "Word frequency analysis across the Quran",
    explanation: "The words 'mala'ikah' (angels) and 'shayatin' (devils/satans) are each claimed to appear 88 times in the Quran, representing the cosmic balance between forces of good and evil. This is one of several word-pair symmetries cited in the Quran.",
    sources: ["Abdulrazaq Naufal, Al-I'jaz al-Adadi fil-Quran"],
    strength: "debated",
    strengthNote: "Like other word-pair claims, the count of 88 depends on specific counting rules (singular vs. plural, definite vs. indefinite). Different methodologies produce different results.",
  },
  {
    category: "numerical",
    title: "\"Mercy\" Mentioned Far More Than \"Punishment\"",
    reference: "Word frequency analysis across the Quran",
    explanation: "Words related to mercy (rahmah, rahma, and derivatives) appear far more frequently in the Quran than words related to punishment (adhab and derivatives). The root ر-ح-م (r-h-m, mercy) appears in various forms over 300 times, while 'adhab' (punishment/torment) appears approximately 70 times. This overwhelmingly skewed ratio towards mercy reflects the prophetic hadith: 'My mercy prevails over My wrath' (Bukhari 97:179).",
    sources: ["Quran word frequency analysis", "Bukhari 97:179", "Muslim 48:1"],
    strength: "strong",
    strengthNote: "The dominance of mercy-related words over punishment-related words is well-established and consistently confirmed across counting methodologies.",
  },
  {
    category: "numerical",
    title: "Surah Al-Hadid — Iron and the Number 57",
    reference: "Quran 57 (Surah Al-Hadid)",
    explanation: "Surah Al-Hadid (The Iron) is the 57th chapter of the Quran. The atomic number of iron is 26, and the most common isotope of iron has an atomic mass of 57 (Fe-57). Some researchers also note that the word 'al-hadid' first appears in verse 25 of this surah, and the atomic number of the most common iron isotope (Fe-56) is 56 = 26 protons + 30 neutrons. These numerical connections between the surah number, verse positions, and iron's atomic properties are cited as remarkable.",
    sources: ["Quran 57:25", "Atomic properties of iron (Fe): atomic number 26, isotopes Fe-54, Fe-56, Fe-57, Fe-58"],
    strength: "debated",
    strengthNote: "While the numerical connections are interesting, iron has four stable isotopes (54, 56, 57, 58) — selecting the one that matches requires cherry-picking. Classical scholars never interpreted the surah number as significant. This is a modern numerical observation.",
  },
  {
    category: "numerical",
    title: "\"Salawat\" (Prayer) Mentioned 5 Times in One Form",
    reference: "Various verses throughout the Quran",
    explanation: "The word 'salah' (prayer) in its specific singular definite form 'al-salah' is claimed to appear exactly 5 times in the Quran in verses commanding its establishment, corresponding to the five daily prayers prescribed in Islam. This is cited as a subtle textual indicator of the number of obligatory prayers.",
    sources: ["Quran word frequency analysis"],
    strength: "debated",
    strengthNote: "The count of 5 is only achieved by restricting to a very specific grammatical form and context (commands to establish). The word 'salah' and its derivatives appear far more than 5 times overall. The five daily prayers are established through hadith, not the Quran directly.",
  },

  // === FULFILLED PROPHECIES (additions) ===
  {
    category: "prophecy",
    title: "Rome Will Prevail Within a Few Years (Surah Ar-Rum)",
    reference: "Quran 30:2-4; Tirmidhi 47:243",
    arabic: "غُلِبَتِ ٱلرُّومُ فِىٓ أَدْنَى ٱلْأَرْضِ وَهُم مِّنۢ بَعْدِ غَلَبِهِمْ سَيَغْلِبُونَ",
    translation: "The Romans have been defeated in a nearby land, but they will gain victory after their defeat",
    explanation: "When the Sasanian Persians crushed the Byzantine (“Roman”) Empire around 614–619 CE, the Meccan pagans rejoiced, since the Persians were idolaters like themselves. The Quran then declared that the defeated Romans would themselves be victorious “within a few years” (bidʿ, i.e. three to nine). Abu Bakr publicly staked a wager with the Quraysh on it — and the Byzantines under Heraclius decisively defeated Persia by 627–628 CE, within the window. This is the clearest fulfilled prophecy in the Quran itself, rather than in hadith. (See also the 'Lowest Point on Earth' card, which reads the same passage geographically.)",
    historicalContext: "Tirmidhi narrates that the verse was revealed after the Persian victory and that the Prophet ﷺ advised Abu Bakr to raise both the stake and the term of his wager to the full ‘bidʿ’ of up to nine years — the Byzantine reconquest fell exactly within it.",
    sources: ["Quran 30:2-4", "Tirmidhi 46:9", "Tirmidhi 47:243"],
    strength: "strong",
    strengthNote: "The Quranic prophecy is explicit and its historical fulfillment (Byzantine–Sasanian War, 602–628 CE) is well documented; the wager narration is in Tirmidhi.",
  },
  {
    category: "prophecy",
    title: "“Be Firm, O Uhud” — Foretelling the Two Martyrs",
    reference: "Bukhari 62:25",
    explanation: "As the Prophet ﷺ stood on Mount Uhud with Abu Bakr, ʿUmar, and ʿUthman, the mountain trembled and he said: “Be firm, O Uhud! For on you there are no more than a Prophet, a Siddiq and two martyrs” (the Siddiq being Abu Bakr). At that moment none of the three companions had been killed — yet ʿUmar and ʿUthman were both later assassinated, fulfilling the prophecy within the lifetime of those who heard it.",
    sources: ["Bukhari 62:25"],
    strength: "strong",
    strengthNote: "A prophecy fulfilled within living memory of its narrators — evidentially stronger than distant-future signs — recorded in Sahih al-Bukhari.",
  },
  {
    category: "prophecy",
    title: "The Earth Folded Up — Islam Spreading East and West",
    reference: "Abu Dawud 37:13",
    explanation: "The Prophet ﷺ said that the earth was “folded up” for him so that he saw its easts and its wests, and that the dominion of his community would reach as far as he had been shown. Within roughly a century, Muslim rule extended from the Atlantic coast of Spain in the west to the frontiers of China and India in the east — closely matching the reach he described.",
    sources: ["Abu Dawud 37:13", "Muslim 54:24"],
    strength: "strong",
    strengthNote: "Narrated by Thawban; the “earth drawn together, east and west” wording is also in Sahih Muslim, and the eastward–westward reach of early Muslim rule is a matter of documented history.",
  },
  {
    category: "prophecy",
    title: "Abu Lahab's Decade of Open Falsification (Surah al-Masad)",
    reference: "Quran 111:1-3",
    arabic: "تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ",
    translation: "May the hands of Abu Lahab perish, and may he perish!",
    explanation: "Surah al-Masad condemned the Prophet's ﷺ uncle Abu Lahab by name, declaring that he would die a disbeliever and enter the Fire. This was revealed years before his death, leaving him an obvious way to “falsify” the Quran: he needed only to feign acceptance of Islam. He never did — he remained hostile until he died shortly after the Battle of Badr, exactly as foretold.",
    sources: ["Quran 111:1-3"],
    strength: "strong",
    strengthNote: "The verse is explicit; the surrounding biographical detail (Abu Lahab's death shortly after Badr without ever professing Islam) rests on the standard seerah accounts rather than a single graded narration.",
  },
  {
    category: "prophecy",
    title: "The Greening of the Arabian Peninsula",
    reference: "Sahih Muslim, Kitab al-Zakat",
    explanation: "A well-known prophecy states that the Hour will not come until the land of the Arabs once again becomes meadows and rivers — a striking image given the arid Peninsula. Some contemporary writers connect it with modern pivot-irrigation agriculture and satellite imagery of greening in parts of Saudi Arabia. This reading is recent and interpretive.",
    sources: ["Sahih Muslim, Book of Zakat (commonly cited as Sahih Muslim 157) — external; wording not verified against this app's local corpus"],
    strength: "moderate",
    strengthNote: "The narration is attributed to Sahih Muslim but its exact wording is not available in this app's local hadith set; the ‘fulfillment’ is a modern interpretation, not a classical one.",
  },

  // === LINGUISTIC (additions) ===
  {
    category: "linguistic",
    title: "The Preservation of the Quran",
    reference: "Quran 15:9",
    arabic: "إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَـٰفِظُونَ",
    translation: "It is We Who have sent down the Reminder, and it is We Who will preserve it.",
    explanation: "The Quran declares that Allah Himself will guard the “Reminder” from corruption. Unlike earlier scriptures, the Quran has been continuously preserved both in writing and in the memory of huffaz — individuals who memorize the entire text — in an unbroken chain since revelation. Early manuscripts and the living oral tradition agree on a single consonantal text across the Muslim world, an outcome believers hold up as the fulfillment of this promise.",
    sources: ["Quran 15:9"],
    strength: "strong",
    strengthNote: "The verse is explicit; the supporting detail about the manuscript record and the global huffaz tradition is a scholarly summary rather than a claim from a single graded narration.",
  },
  {
    category: "linguistic",
    title: "No Contradictions — The Consistency Challenge",
    reference: "Quran 4:82",
    arabic: "أَفَلَا يَتَدَبَّرُونَ ٱلْقُرْءَانَ ۚ وَلَوْ كَانَ مِنْ عِندِ غَيْرِ ٱللَّهِ لَوَجَدُوا۟ فِيهِ ٱخْتِلَـٰفًا كَثِيرًا",
    translation: "Do they not then ponder on the Qur’an? If it had been from anyone other than Allah, they would have surely found in it many discrepancies.",
    explanation: "The Quran invites its readers to search it for internal contradiction, arguing that a book revealed over twenty-three years amid war, migration, and changing circumstances — yet free of discrepancy — could only come from Allah. This is a distinct challenge from the literary ‘tahaddi’ (produce a chapter like it): here the test is coherence rather than eloquence.",
    sources: ["Quran 4:82"],
    strength: "strong",
  },
  {
    category: "linguistic",
    title: "The Unlettered Prophet",
    reference: "Quran 29:48",
    arabic: "وَمَا كُنتَ تَتْلُوا۟ مِن قَبْلِهِۦ مِن كِتَـٰبٍ وَلَا تَخُطُّهُۥ بِيَمِينِكَ ۖ إِذًا لَّٱرْتَابَ ٱلْمُبْطِلُونَ",
    translation: "You [O Prophet] never recited any book before this, nor did you write with your hand. Otherwise, the people of falsehood would have raised suspicions.",
    explanation: "The Quran points out that the Prophet ﷺ neither read nor wrote before it was revealed — so its account of earlier prophets, its legal and moral system, and its literary power could not be attributed to prior study or authorship. Had he been known as a reader of books, the Quran notes, doubters would have had grounds to dismiss it as copied.",
    sources: ["Quran 29:48", "Quran 7:157"],
    strength: "strong",
  },

  // === SCIENTIFIC (additions) ===
  {
    category: "scientific",
    title: "The Restoration of the Fingertips",
    reference: "Quran 75:3-4",
    arabic: "بَلَىٰ قَـٰدِرِينَ عَلَىٰٓ أَن نُّسَوِّىَ بَنَانَهُۥ",
    translation: "In fact, We are able to restore even his very fingertips.",
    explanation: "Answering those who doubted the resurrection, the Quran says Allah is able to restore even the person's ‘banan’ (fingertips) — singling out the very part of the body whose ridge patterns are, we now know, unique to every individual and used for identification. The primary meaning is the perfection of Allah's power to recreate; the fingerprint-uniqueness observation is a modern, secondary reading.",
    sources: ["Quran 75:3-4"],
    strength: "moderate",
    strengthNote: "The verse's primary subject is the resurrection. Fingerprints were shown to be unique only in the 19th–20th centuries, so the scientific parallel is a modern observation, not the classical interpretation.",
  },
  {
    category: "scientific",
    title: "Milk Produced Between Excretion and Blood",
    reference: "Quran 16:66",
    arabic: "وَإِنَّ لَكُمْ فِى ٱلْأَنْعَـٰمِ لَعِبْرَةً ۖ نُّسْقِيكُم مِّمَّا فِى بُطُونِهِۦ مِنۢ بَيْنِ فَرْثٍ وَدَمٍ لَّبَنًا خَالِصًا سَآئِغًا لِّلشَّـٰرِبِينَ",
    translation: "And there is surely a lesson for you in livestock. We give you drink from what is in their bellies – produced between excretion and blood – pure and pleasant milk for those who drink.",
    explanation: "The Quran locates the origin of milk ‘between excretion (farth) and blood.’ In the ruminant's digestive system, nutrients released from digested food are carried by the bloodstream to the mammary glands, which synthesize milk — a process physically situated between the contents of the gut and the blood, and only understood in detail with modern physiology.",
    sources: ["Quran 16:66"],
    strength: "moderate",
    strengthNote: "The description is a widely cited scientific-reference point; the detailed physiology of nutrient transport to the mammary glands is a modern understanding read onto the verse.",
  },

  // === HISTORICAL (additions) ===
  {
    category: "historical",
    title: "“The King” of Yusuf's Egypt vs “Pharaoh” of Musa's",
    reference: "Quran 12:43; Quran 12:50; Quran 7:103",
    explanation: "In the story of Yusuf (Joseph), the Egyptian ruler is consistently called ‘al-Malik’ (the King), never ‘Firʿawn’ (Pharaoh). In the story of Musa (Moses), centuries later, the ruler is always called ‘Firʿawn.’ This tracks a real historical shift: the title ‘Pharaoh’ as a designation for the ruler came into common use in the later New Kingdom period, after the era in which Yusuf is placed — a distinction the Bible does not preserve, since it calls both rulers ‘Pharaoh.’",
    sources: ["Quran 12:43", "Quran 12:50", "Quran 7:103"],
    strength: "moderate",
    strengthNote: "The Quran's consistent use of ‘King’ for Yusuf's era and ‘Pharaoh’ for Musa's is a textual fact; the Egyptological dating of when ‘Pharaoh’ became a royal title is a scholarly summary and debated in its particulars.",
  },
];


// Page hero — the Quran's open challenge (Tahaddī), located by title so the
// array order can change without moving the hero.
const heroMiracle = miracles.find((m) => m.title.startsWith("The Quran's Challenge")) ?? miracles[0];

function MiraclesContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("tab") || "all");
  const [search, setSearch] = useState("");

  const searchLower = search.toLowerCase().trim();
  // A pill may map to several card-categories (e.g. Linguistic & Textual covers
  // both "linguistic" and "numerical"). Fall back to treating the active key as
  // a raw card-category so deep links like ?tab=numerical still resolve.
  const activePill = categories.find((c) => c.key === activeCategory);
  const activeCats = activeCategory === "all"
    ? null
    : activePill?.cats ?? [activeCategory];
  const categoryFiltered = !activeCats
    ? miracles
    : miracles.filter((m) => activeCats.includes(m.category));

  // Searching spans ALL categories, not just the active pill.
  const filtered = searchLower.length < 2
    ? categoryFiltered
    : miracles.filter((m) =>
        m.title.toLowerCase().includes(searchLower) ||
        m.explanation.toLowerCase().includes(searchLower) ||
        m.reference.toLowerCase().includes(searchLower) ||
        (m.translation && m.translation.toLowerCase().includes(searchLower)) ||
        (m.historicalContext && m.historicalContext.toLowerCase().includes(searchLower))
      );

  const counts = Object.fromEntries(
    categories.map((c) => [
      c.key,
      c.cats ? miracles.filter((m) => c.cats!.includes(m.category)).length : miracles.length,
    ])
  ) as Record<string, number>;

  return (
    <div>
      <PageHeader
        title="Miracles & Prophecies"
        titleAr="المعجزات والنبوءات"
        subtitle="Quranic miracles, scientific references, fulfilled prophecies, and historical confirmations"
      />

      {/* Opening verse — the Quran's own challenge (reuses the first card's strings) */}
      <VerseHero
        arabic={heroMiracle.arabic}
        text={heroMiracle.translation ?? ""}
        reference={heroMiracle.reference}
      />

      {/* Framing: what a miracle (mu'jizah) is */}
      <ContentCard className="mb-4">
        <div className="flex items-start gap-2 mb-2">
          <Sparkles size={16} className="text-gold mt-0.5 shrink-0" />
          <h2 className="text-lg font-semibold text-themed">What is a miracle (muʿjizah)?</h2>
        </div>
        <p className="text-themed text-sm leading-relaxed mb-3">
          A <span className="font-medium">muʿjizah</span> is an extraordinary act that breaks the normal
          laws of nature, granted by Allah to a prophet as proof of his truthfulness — something no
          human could match or counter. It differs from a <span className="font-medium">karamah</span>{" "}
          (a lesser wonder granted to a righteous person) and from magic or sleight of hand, which are
          learned tricks. Every prophet was given signs suited to his people; the Prophet Muhammad ﷺ said:
          &ldquo;Every Prophet was given miracles because of which people believed, but what I have been
          given, is Divine Inspiration which Allah has revealed to me&rdquo; (Bukhari 66:3) — which is why
          the Quran itself, still recited and unchanged, is regarded as his greatest and lasting miracle,
          while the sensory miracles below were witnessed by the people of his own time.
        </p>
        <p className="text-xs text-themed-muted leading-relaxed">
          The miracles of earlier prophets — and the biography behind these events — are told on the{" "}
          <Link href="/prophets" className="text-gold underline">Prophets</Link> and{" "}
          <Link href="/prophet-muhammad?tab=prophecies" className="text-gold underline">Prophet Muhammad ﷺ</Link> pages.
        </p>
      </ContentCard>

      <PageSearch value={search} onChange={setSearch} placeholder="Search miracles..." className="mb-6" />

      {/* Category pills (shared TabBar) */}
      <TabBar
        tabs={categories.map((cat) => {
          const Icon = cat.icon;
          return {
            key: cat.key,
            label: cat.label,
            icon: Icon ? <Icon size={14} /> : undefined,
            count: counts[cat.key as keyof typeof counts],
          };
        })}
        activeTab={activeCategory}
        onTabChange={setActiveCategory}
        className="mb-6"
      />

      {/* How we grade these — intellectual-honesty legend */}
      <div className="rounded-xl border sidebar-border card-bg p-4 mb-6">
        <p className="text-sm font-semibold text-themed mb-2">How we grade these</p>
        <p className="text-xs text-themed-muted leading-relaxed mb-3">
          Not every claim carries the same weight. Each entry is labelled with an honest assessment so you
          can weigh it for yourself. Sensory miracles and explicit prophecies rest on the strength of their
          narrations; &ldquo;scientific&rdquo; and numerical readings are often modern interpretations laid
          onto the text, and we say so rather than overstate them.
        </p>
        <div className="flex flex-wrap gap-2">
          {(["strong", "moderate", "debated"] as Strength[]).map((s) => (
            <span
              key={s}
              className="text-[11px] font-medium px-2 py-1 rounded-full"
              style={{ color: strengthMeta[s].color, backgroundColor: strengthMeta[s].bg }}
            >
              {strengthMeta[s].label}
            </span>
          ))}
        </div>
      </div>

      {/* Miracles list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}-${searchLower}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {filtered.map((miracle, i) => {
            const catLabel = categoryLabels[miracle.category] ?? miracle.category;
            const grade = strengthMeta[miracle.strength];

            return (
              <ContentCard key={`${miracle.category}-${i}`} delay={Math.min(i * 0.05, 0.4)} id={`section-${miracle.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gold font-medium">{catLabel}</span>
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ color: grade.color, backgroundColor: grade.bg }}
                    >
                      {grade.label}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-themed mt-1">{miracle.title}</h2>
                </div>

                {/* Arabic + Translation */}
                {miracle.arabic && (
                  <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "var(--color-bg)" }}>
                    <p className="text-xl font-arabic text-gold text-right leading-loose mb-2">
                      {miracle.arabic}
                    </p>
                    {miracle.translation && (
                      <p className="text-themed-muted italic text-sm">
                        &ldquo;{miracle.translation}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* Explanation */}
                <p className="text-themed text-sm leading-relaxed mb-4">
                  {miracle.explanation}
                </p>

                {/* Historical context */}
                {miracle.historicalContext && (
                  <div className="rounded-lg p-3 mb-4 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
                    <p className="text-xs font-medium text-themed-muted mb-1">Historical Context</p>
                    <p className="text-themed text-sm leading-relaxed opacity-85">
                      {miracle.historicalContext}
                    </p>
                  </div>
                )}

                {/* Honesty footnote — how strongly this claim holds up */}
                {miracle.strengthNote && (
                  <div className="rounded-lg p-3 mb-4 border-l-2" style={{ backgroundColor: "var(--color-bg)", borderLeftColor: grade.color }}>
                    <p className="text-[11px] font-semibold text-themed-muted mb-1 uppercase tracking-wide">
                      Assessment · {grade.label}
                    </p>
                    <p className="text-xs text-themed-muted leading-relaxed">
                      {miracle.strengthNote}
                    </p>
                  </div>
                )}

                {/* Sources */}
                <div className="border-t sidebar-border pt-3">
                  <p className="text-xs text-themed-muted font-medium mb-1">Sources:</p>
                  <ul className="text-xs text-themed-muted space-y-0.5">
                    {miracle.sources.map((src, j) => (
                      <li key={j}>• <HadithRefText text={src} /></li>
                    ))}
                  </ul>
                </div>
              </ContentCard>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-themed-muted py-8 text-center">
              No miracles found matching &ldquo;{search}&rdquo;
            </p>
          )}
          {filtered.length > 0 && (
            <SourcesCard
              className="mt-3"
              sources={filtered.map((m) => ({ ref: m.reference, desc: m.title }))}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Cross-link: miracles of earlier prophets (told in full on the Prophets page) */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-themed mb-1">Miracles of Earlier Prophets</h2>
        <p className="text-xs text-themed-muted mb-3 leading-relaxed">
          The Quran records mighty signs given to the prophets before Muhammad ﷺ. Their full stories,
          with verses, are on the Prophets page.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { slug: "salih", name: "Salih", sign: "The she-camel drawn from the rock", ref: "Quran 7:73" },
            { slug: "ibrahim", name: "Ibrahim", sign: "The fire made cool and safe", ref: "Quran 21:69" },
            { slug: "musa", name: "Musa", sign: "The staff, and the parting of the sea", ref: "Quran 26:63" },
            { slug: "isa", name: "Isa", sign: "Forming a bird from clay, and healing the blind", ref: "Quran 3:49" },
          ].map((p) => (
            <Link
              key={p.slug}
              href={`/prophets/${p.slug}`}
              className="block rounded-xl border sidebar-border card-bg p-4 card-hover"
            >
              <p className="text-sm font-semibold text-themed">{p.name}</p>
              <p className="text-xs text-themed-muted mt-0.5 leading-relaxed">{p.sign}</p>
              <p className="text-[11px] text-gold mt-1">{p.ref}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MiraclesPage() {
  return <Suspense><MiraclesContent /></Suspense>;
}
