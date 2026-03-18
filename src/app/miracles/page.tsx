"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ContentCard from "@/components/ContentCard";
import { BookOpen, Telescope, Clock, MapPin, Hash, Search, X } from "lucide-react";
import HadithRefText from "@/components/HadithRefText";

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

const categories = [
  { key: "all", label: "All", icon: null },
  { key: "linguistic", label: "Linguistic Miracle", icon: BookOpen },
  { key: "prophecy", label: "Fulfilled Prophecies", icon: Clock },
  { key: "scientific", label: "Scientific References", icon: Telescope },
  { key: "historical", label: "Historical & Archaeological", icon: MapPin },
  { key: "numerical", label: "Numerical Patterns", icon: Hash },
];

const miracles: Miracle[] = [
  // === LINGUISTIC MIRACLE ===
  {
    category: "linguistic",
    title: "The Quran's Challenge (Tahaddī)",
    reference: "Quran 2:23, 17:88",
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
    reference: "Quran 55:19-20, 25:53",
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
    reference: "Quran 39:21, 23:18",
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
    reference: "Quran 21:33, 36:40",
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
    reference: "Quran 7:74, 26:149",
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
];


function MiraclesContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("tab") || "all");
  const [search, setSearch] = useState("");

  const searchLower = search.toLowerCase().trim();
  const categoryFiltered = activeCategory === "all"
    ? miracles
    : miracles.filter((m) => m.category === activeCategory);

  const filtered = searchLower.length < 2
    ? categoryFiltered
    : categoryFiltered.filter((m) =>
        m.title.toLowerCase().includes(searchLower) ||
        m.explanation.toLowerCase().includes(searchLower) ||
        m.reference.toLowerCase().includes(searchLower) ||
        (m.translation && m.translation.toLowerCase().includes(searchLower)) ||
        (m.historicalContext && m.historicalContext.toLowerCase().includes(searchLower))
      );

  const counts = {
    all: miracles.length,
    linguistic: miracles.filter((m) => m.category === "linguistic").length,
    prophecy: miracles.filter((m) => m.category === "prophecy").length,
    scientific: miracles.filter((m) => m.category === "scientific").length,
    historical: miracles.filter((m) => m.category === "historical").length,
    numerical: miracles.filter((m) => m.category === "numerical").length,
  };

  return (
    <div>
      <PageHeader
        title="Miracles & Prophecies"
        titleAr="المعجزات والنبوءات"
        subtitle="Quranic miracles, scientific references, fulfilled prophecies, and historical confirmations"
      />

      {/* Search bar */}
      <div className="relative max-w-xl mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-muted"
        />
        <input
          type="text"
          placeholder="Search miracles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl card-bg border sidebar-border text-themed placeholder:text-themed-muted focus:outline-none focus:border-[var(--color-gold)] transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-[var(--color-gold)] text-[#1a1a2e] shadow-lg shadow-[var(--color-gold)]/20"
                  : "card-bg border sidebar-border text-themed-muted hover:text-themed hover:border-[var(--color-gold)]/30"
              }`}
            >
              {Icon && <Icon size={15} />}
              <span>{cat.label}</span>
              <span className={`text-xs ${isActive ? "opacity-70" : "opacity-50"}`}>
                ({counts[cat.key as keyof typeof counts]})
              </span>
            </button>
          );
        })}
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
            const catLabel = categories.find((c) => c.key === miracle.category)?.label ?? miracle.category;

            return (
              <ContentCard key={`${miracle.category}-${i}`} delay={Math.min(i * 0.05, 0.4)} id={`section-${miracle.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                {/* Header */}
                <div className="mb-3">
                  <div>
                    <span className="text-xs text-gold font-medium">{catLabel}</span>
                    <h2 className="text-xl font-semibold text-themed mt-1">{miracle.title}</h2>
                  </div>
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function MiraclesPage() {
  return <Suspense><MiraclesContent /></Suspense>;
}
