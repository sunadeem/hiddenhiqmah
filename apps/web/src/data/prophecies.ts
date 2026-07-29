/**
 * SINGLE SOURCE OF TRUTH for the prophecies that appear on BOTH
 * /miracles (as "Fulfilled Prophecy" cards) and /prophet-muhammad
 * (as the Prophecies rail).
 *
 * WHY THIS FILE EXISTS: these nine prophecies used to be written out twice,
 * once per page, and the copies drifted — a correction applied to one page was
 * silently missed on the other. Both renderings now live side by side in one
 * record, so a fix cannot land on one page alone.
 *
 * The two pages address different readers (a catalogue of evidences vs. a
 * seerah narrative), so their prose deliberately differs in register and is
 * kept in separate `miracles` / `seerah` views. That divergence is now
 * VISIBLE rather than accidental: when you correct a claim, correct both views
 * in the same record. The shared `sources` list is the authoritative citation
 * set for the prophecy and is what /miracles renders in its SourcesCard.
 *
 * Cards unique to one page (e.g. the Plague of Amwas on /miracles, or the
 * riba and Ammar prophecies on /prophet-muhammad) stay local to that page.
 *
 * All strings were carried over byte-for-byte from the two pages in the
 * 2026-07 de-duplication refactor and diffed against the originals; do not
 * "tidy" them, and verify any new citation against packages/content first.
 */

export type ProphecyStrength = "strong" | "moderate" | "debated";
export type ProphecyStatus = "fulfilled" | "ongoing";

/** How /miracles renders the prophecy (matches that page's `Miracle` shape). */
export type ProphecyMiraclesView = {
  title: string;
  reference: string;
  arabic?: string;
  translation?: string;
  explanation: string;
  historicalContext?: string;
  strength: ProphecyStrength;
  strengthNote?: string;
};

/** How /prophet-muhammad renders the prophecy (matches that page's `Prophecy` shape). */
export type ProphecySeerahView = {
  title: string;
  description: string;
  hadith: string;
  reference: string;
  status: ProphecyStatus;
};

export type SharedProphecy = {
  /** Stable key. Not user-visible — deep links still slug the seerah title. */
  id: string;
  /** Authoritative citation set; rendered by /miracles in its SourcesCard. */
  sources: string[];
  miracles: ProphecyMiraclesView;
  seerah: ProphecySeerahView;
};

export const sharedProphecies: SharedProphecy[] = [
  {
    id: "persia-and-rome",
    sources: ["Bukhari 57:29", "Muslim 54:92", "Historical: Fall of Sasanian Empire, 651 CE"],
    miracles: {
      title: "The Conquest of Persia and Treasures of Kisra",
      reference: "Bukhari 57:29",
      arabic: "إِذَا هَلَكَ كِسْرَى فَلَا كِسْرَى بَعْدَهُ",
      translation: "When Kisra (Chosroes) perishes, there will be no Kisra after him.",
      explanation: "Prophet Muhammad ﷺ prophesied the fall of the Persian Empire and that its treasures would be spent in the cause of Allah. The Sasanian Persian Empire — one of the two superpowers of the time — fell to the Muslim army in 651 CE, and its vast treasures were distributed.",
      strength: "strong",
    },
    seerah: {
      title: "Conquest of Persia and Rome",
      description: "During the digging of the trench at the Battle of Al-Khandaq, when the Muslims were at their weakest — besieged, starving, and outnumbered — the Prophet ﷺ prophesied the fall of the great empires. Within a decade of his passing, the Muslim armies had conquered the entirety of the Persian Empire and taken the Levant and Egypt from the Romans. The Prophet ﷺ also said that when Kisra (the Persian emperor) perishes, there will be no Kisra after him — and when Caesar perishes, there will be no Caesar after him.",
      hadith: "The Prophet ﷺ said: 'When Kisra perishes, there will be no Kisra after him. And when Caesar perishes, there will be no Caesar after him. By the One in whose hand is my soul, you will spend their treasures in the cause of Allah.'",
      reference: "Bukhari 57:29; Muslim 54:92",
      status: "fulfilled",
    },
  },
  {
    id: "barefoot-shepherds",
    sources: ["Muslim 1:1 (Hadith of Jibreel)", "Bukhari 2:43"],
    miracles: {
      title: "Barefoot Shepherds Competing in Tall Buildings",
      reference: "Muslim 1:1",
      arabic: "أَنْ تَلِدَ الْأَمَةُ رَبَّتَهَا وَأَنْ تَرَى الْحُفَاةَ الْعُرَاةَ الْعَالَةَ رِعَاءَ الشَّاءِ يَتَطَاوَلُونَ فِي الْبُنْيَانِ",
      translation: "...and you will see barefoot, naked, destitute shepherds competing in constructing tall buildings.",
      explanation: "In the famous Hadith of Jibreel, the Prophet ﷺ described one of the signs of the approaching Hour: that barefoot, impoverished Bedouin shepherds would compete in building the tallest structures. Today, the Arabian Peninsula — historically home to nomadic Bedouin tribes — hosts the world's tallest skyscrapers, including the Burj Khalifa (828m) and the upcoming Jeddah Tower.",
      strength: "strong",
    },
    seerah: {
      title: "Barefoot shepherds competing in tall buildings",
      description: "The Prophet ﷺ told Jibreel that among the signs of the Hour is that barefoot, naked, destitute shepherds would compete in constructing tall buildings. This has been visibly fulfilled in the Arabian Peninsula, where Bedouin communities transformed within decades into nations competing to build the tallest skyscrapers in the world.",
      hadith: "When Jibreel asked: 'Tell me about the Hour.' The Prophet ﷺ said: '...and you will see the barefoot, naked, destitute shepherds competing in constructing tall buildings.'",
      reference: "Muslim 1:1; Bukhari 2:43",
      status: "fulfilled",
    },
  },
  {
    id: "constantinople",
    sources: ["Musnad Ahmad 18957 (ar-Risala / al-Arna'ut ed.) — outside the app's local collections; isnad graded da'if by al-Arna'ut (jahalah of 'Abdullah ibn Bishr al-Khath'ami) and by al-Albani (ad-Da'ifah 878), but authenticated by al-Hakim with adh-Dhahabi concurring", "Muslim 54:44 — the general prophecy of the conquest", "Tirmidhi 33:82 — the general prophecy of the conquest", "Historical: Fall of Constantinople, 1453 CE"],
    miracles: {
      title: "The Conquest of Constantinople",
      reference: "Musnad Ahmad 18957 — outside the app's local collections; grading disputed",
      arabic: "لَتُفْتَحَنَّ الْقُسْطَنْطِينِيَّةُ فَلَنِعْمَ الْأَمِيرُ أَمِيرُهَا وَلَنِعْمَ الْجَيْشُ ذَٰلِكَ الْجَيْشُ",
      translation: "Verily, Constantinople will be conquered. How excellent will be the commander who conquers it, and how excellent will be his army.",
      explanation: "Prophet Muhammad ﷺ prophesied the conquest of Constantinople (modern-day Istanbul). Multiple authentic narrations confirm this prophecy. The specific narration praising the commander and army is from Musnad Ahmad (grading disputed among scholars). This prophecy was fulfilled in 1453 CE — over 800 years later — when the Ottoman Sultan Mehmed II conquered the city.",
      historicalContext: "Constantinople was the capital of the Byzantine Empire and one of the most fortified cities in the world. Multiple Muslim attempts to conquer it had failed over centuries before Mehmed II's successful siege.",
      strength: "strong",
      strengthNote: "The general prophecy of Constantinople's conquest is in Sahih Muslim and other authentic collections. The specific 'how excellent the commander' wording (Musnad Ahmad) has been weakened by al-Albani and al-Arna'ut, but authenticated by al-Hakim and al-Dhahabi.",
    },
    seerah: {
      title: "The conquest of Constantinople",
      description: "The Prophet ﷺ foretold the Muslim conquest of Constantinople (modern-day Istanbul). This was fulfilled in 1453 CE — over 800 years later — when Sultan Mehmed II (Mehmed the Conqueror) conquered the city, ending the Byzantine Empire. The prophecy is recorded in both Sahih Muslim and Jami' at-Tirmidhi.",
      hadith: "The Prophet ﷺ said: 'Constantinople will be conquered with the coming of the Hour.' In another narration, of the army that endures the great battle with the Romans: 'the third who would never be put to trial would win — and they would be the conquerors of Constantinople.'",
      reference: "Muslim 54:44; Tirmidhi 33:82",
      status: "fulfilled",
    },
  },
  {
    id: "jerusalem",
    sources: ["Bukhari 58:18", "Historical: Siege of Jerusalem, 637 CE"],
    miracles: {
      title: "The Conquest of Jerusalem",
      reference: "Bukhari 58:18",
      explanation: "Prophet Muhammad ﷺ told his companion Awf ibn Malik about six signs before the Day of Judgment, the first being his own death and the second being the conquest of Jerusalem (Bayt al-Maqdis). Jerusalem was conquered by the Muslim army under Caliph Umar ibn al-Khattab in 637 CE, just 5 years after the Prophet's death.",
      historicalContext: "Caliph Umar personally traveled to Jerusalem to accept its surrender from the Patriarch Sophronius. He famously refused to pray inside the Church of the Holy Sepulchre to prevent Muslims from converting it to a mosque.",
      strength: "strong",
    },
    seerah: {
      title: "The Muslim conquest of Jerusalem",
      description: "The Prophet ﷺ foretold the conquest of Jerusalem (Bayt al-Maqdis). This was fulfilled during the caliphate of Umar ibn al-Khattab in 637 CE (16 AH), when Umar personally traveled to Jerusalem to accept its surrender and guaranteed the safety of its Christian inhabitants in what became known as the Pact of Umar.",
      hadith: "The Prophet ﷺ said to Awf ibn Malik: 'Count six signs before the Hour: my death, then the conquest of Bayt al-Maqdis...'",
      reference: "Bukhari 58:18",
      status: "fulfilled",
    },
  },
  {
    id: "hijaz-fire",
    sources: ["Bukhari 92:65", "Muslim 54:55", "Abu Shama al-Maqdisi, Dhayl al-Rawdatayn"],
    miracles: {
      title: "A Fire from Hijaz Visible from Busra",
      reference: "Bukhari 92:65, Muslim 54:55",
      arabic: "لَا تَقُومُ السَّاعَةُ حَتَّى تَخْرُجَ نَارٌ مِنْ أَرْضِ الْحِجَازِ تُضِيءُ أَعْنَاقَ الْإِبِلِ بِبُصْرَى",
      translation: "The Hour will not come until a fire emerges from the land of Hijaz that will illuminate the necks of camels in Busra (Syria).",
      explanation: "In 1256 CE, a massive volcanic eruption occurred east of Medina. The eruption lasted for weeks and the lava flow extended over 23 km. Contemporary historians, including Abu Shama al-Maqdisi, documented that the light of the fire was visible from great distances, with reports reaching as far as Busra in Syria.",
      historicalContext: "Abu Shama al-Maqdisi recorded: 'A great fire appeared in the Harrah near Medina on Friday, 6th Jumada al-Akhirah 654 AH.' The event was documented by multiple historians of the period.",
      strength: "strong",
    },
    seerah: {
      title: "Fire emerging from the Hijaz",
      description: "The Prophet ﷺ foretold that a great fire would emerge from the land of Hijaz (western Arabia) that would illuminate the necks of camels in Busra (Syria). In 654 AH (1256 CE), a massive volcanic eruption occurred east of Medina that lasted for months. Historical records confirm that the glow of its lava was visible from great distances, and the people of Medina were terrified.",
      hadith: "The Prophet ﷺ said: 'The Hour will not come until a fire emerges from the land of Hijaz that will illuminate the necks of camels in Busra.'",
      reference: "Bukhari 92:65; Muslim 54:55",
      status: "fulfilled",
    },
  },
  {
    id: "senseless-killing",
    sources: ["Bukhari 92:13", "Muslim 54:23", "Muslim 54:70"],
    miracles: {
      title: "Widespread Senseless Killing",
      reference: "Bukhari 92:13, Muslim 54:23",
      arabic: "يَتَقَارَبُ الزَّمَانُ ... وَيَكْثُرُ الْهَرْجُ ... الْقَتْلُ الْقَتْلُ",
      translation: "Time will pass rapidly ... and al-harj will increase... killing, killing.",
      explanation: "The Prophet ﷺ prophesied a time when senseless, widespread killing (al-harj) would become commonplace — where the killer would not know why he kills and the victim would not know why he was killed. This describes an era of indiscriminate violence, terrorism, and mass conflict that the modern world has witnessed in unprecedented scale.",
      strength: "strong",
    },
    seerah: {
      title: "Widespread tribulations and killing",
      description: "The Prophet ﷺ foretold that as the Hour approaches, killing and tribulations (fitan) would increase dramatically, and that the killer would not know why he killed, nor the killed why he was killed.",
      hadith: "The Prophet ﷺ said: 'By the One in whose hand is my soul, this world will not end until a time comes when the killer does not know why he killed, and the killed does not know why he was killed.' They asked: 'How will that be?' He said: 'Haraj (killing/chaos). The killer and the killed will both be in the Hellfire.'",
      reference: "Muslim 54:69-70",
      status: "ongoing",
    },
  },
  {
    id: "time-passing-rapidly",
    sources: ["Tirmidhi 36:29 (graded sahih by al-Albani)"],
    miracles: {
      title: "Time Passing Rapidly",
      reference: "Tirmidhi 36:29",
      arabic: "لاَ تَقُومُ السَّاعَةُ حَتَّى يَتَقَارَبَ الزَّمَانُ فَتَكُونُ السَّنَةُ كَالشَّهْرِ وَالشَّهْرُ كَالْجُمُعَةِ وَتَكُونُ الْجُمُعَةُ كَالْيَوْمِ",
      translation: "The Hour will not come until time passes rapidly — a year will be like a month, a month like a week, a week like a day.",
      explanation: "The Prophet ﷺ described a time when time itself would seem to accelerate. Modern life, with its constant connectivity, information overload, and rapid pace, has made this perception of accelerating time a widely shared experience across cultures.",
      strength: "strong",
      strengthNote: "The prophecy is authentic; its fulfillment is based on the widely shared perception of modern life's accelerating pace.",
    },
    seerah: {
      title: "Time will pass quickly",
      description: "The Prophet ﷺ foretold that as the Hour draws near, time would feel as though it passes faster and faster. Many people today remark on how quickly years, months, and days seem to go by compared to previous generations.",
      hadith: "The Prophet ﷺ said: 'The Hour will not come until time contracts — a year will be like a month, a month like a week, a week like a day, a day like an hour, and an hour like the burning of a palm-leaf frond.'",
      reference: "Tirmidhi 36:29 (graded sahih by al-Albani)",
      status: "ongoing",
    },
  },
  {
    id: "mongol-baghdad",
    sources: ["Bukhari 56:141", "Muslim 54:76", "Historical: Siege of Baghdad, 1258 CE"],
    miracles: {
      title: "The Mongol Siege and Destruction of Baghdad",
      reference: "Bukhari 56:141; Muslim 54:76",
      arabic: "لاَ تَقُومُ السَّاعَةُ حَتَّى تُقَاتِلُوا التُّرْكَ صِغَارَ الأَعْيُنِ، حُمْرَ الْوُجُوهِ، ذُلْفَ الأُنُوفِ، كَأَنَّ وُجُوهَهُمُ الْمَجَانُّ الْمُطَرَّقَةُ، وَلاَ تَقُومُ السَّاعَةُ حَتَّى تُقَاتِلُوا قَوْمًا نِعَالُهُمُ الشَّعَرُ",
      translation: "The Hour will not be established until you fight with the Turks; people with small eyes, red faces, and flat noses. Their faces will look like shields coated with leather. The Hour will not be established till you fight with people whose shoes are made of hair.",
      explanation: "The Prophet ﷺ warned that Muslims would fight the Turks — a people with small eyes, red faces and flat noses, whose faces are like hammered shields — and a people whose shoes are made of hair. The hadith names the Turks; classical scholars such as Ibn Hajar read the Mongol and Tatar invasions as its fulfillment. In 1258 CE, the Mongol army under Hulagu Khan sacked Baghdad, the capital of the Abbasid Caliphate. An estimated 200,000 to over a million people were killed, the House of Wisdom was destroyed, and the Tigris ran black with ink from the books thrown into it. This was one of the most catastrophic events in human history.",
      historicalContext: "The Mongol invasion ended the Islamic Golden Age. Baghdad, which had been the intellectual and political center of the Muslim world for over 500 years, was utterly devastated. The last Abbasid Caliph, al-Musta'sim, was executed by being wrapped in a carpet and trampled by horses.",
      strength: "strong",
      strengthNote: "The narration is in Bukhari and Muslim; identifying its fulfillment with the Mongol invasions is a reading of later scholars such as Ibn Hajar, not part of the hadith itself.",
    },
    seerah: {
      title: "The Mongol siege and destruction of Baghdad",
      description: "The Prophet ﷺ warned that Muslims would fight the Turks — a people with small eyes, red faces and flat noses, whose faces are like hammered shields — and a people whose shoes are made of hair. Classical scholars such as Ibn Hajar read the Mongol and Tatar invasions as this hadith's fulfillment: in 1258 CE, the Mongol army under Hulagu Khan sacked Baghdad, the capital of the Abbasid Caliphate. An estimated 200,000 to over a million people were killed, the House of Wisdom was destroyed, and the Tigris ran black with ink. This ended the Islamic Golden Age.",
      hadith: "The Prophet ﷺ said: 'The Hour will not be established until you fight with the Turks; people with small eyes, red faces, and flat noses. Their faces will look like shields coated with leather. The Hour will not be established till you fight with people whose shoes are made of hair.'",
      reference: "Bukhari 56:141; Muslim 54:76",
      status: "fulfilled",
    },
  },
  {
    id: "earth-folded",
    sources: ["Abu Dawud 37:13", "Muslim 54:24"],
    miracles: {
      title: "The Earth Folded Up — Islam Spreading East and West",
      reference: "Abu Dawud 37:13",
      explanation: "The Prophet ﷺ said that the earth was “folded up” for him so that he saw its easts and its wests, and that the dominion of his community would reach as far as he had been shown. Within roughly a century, Muslim rule extended from the Atlantic coast of Spain in the west to the frontiers of China and India in the east — closely matching the reach he described.",
      strength: "strong",
      strengthNote: "Narrated by Thawban; the “earth drawn together, east and west” wording is also in Sahih Muslim, and the eastward–westward reach of early Muslim rule is a matter of documented history.",
    },
    seerah: {
      title: "Islam will reach wherever the earth was folded",
      description: "The Prophet ﷺ was shown, in a single vision, the whole earth 'folded' before him — its farthest east and west — and told that the dominion of his ummah would one day span exactly that expanse. Within a century Islam stretched from the Atlantic coast of Spain to the frontiers of China, and today it is present in every land on earth, fulfilling this within-history sign of his prophethood.",
      hadith: "The Messenger of Allah ﷺ said: 'Allah, the Exalted, folded for me the earth... so much so that I saw its easts and wests... The kingdom of my community will reach as far as the earth was folded for me.'",
      reference: "Abu Dawud 37:13",
      status: "fulfilled",
    },
  },
];

const byId = new Map(sharedProphecies.map((p) => [p.id, p]));

function get(id: string): SharedProphecy {
  const p = byId.get(id);
  if (!p) throw new Error(`Unknown shared prophecy id: ${id}`);
  return p;
}

/** A "Fulfilled Prophecy" card for the /miracles catalogue. */
export function miraclesProphecy(id: string): ProphecyMiraclesView & {
  category: "prophecy";
  sources: string[];
} {
  const p = get(id);
  return { category: "prophecy", ...p.miracles, sources: p.sources };
}

/** A prophecy entry for the /prophet-muhammad rail. */
export function seerahProphecy(id: string): ProphecySeerahView {
  return { ...get(id).seerah };
}
