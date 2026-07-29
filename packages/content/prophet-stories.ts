export interface Verse {
  arabic: string;
  translation: string;
  reference: string;
}

export interface StorySection {
  title: string;
  content: string;
  verses?: Verse[];
  hadith?: { text: string; source: string }[];
}

export interface ProphetStory {
  slug: string;
  title: string;
  sections: StorySection[];
  lessons: string[];
  references: string[];
}

export const prophetStories: Record<string, ProphetStory> = {
  adam: {
    slug: "adam",
    title: "Prophet Adam — The First Human",
    sections: [
      {
        title: "Creation from Clay",
        content:
          "Allah created Adam from clay, fashioning him with His own Hands. He breathed His spirit into him and commanded the angels to prostrate before him. All the angels obeyed, except Iblis (Satan), who refused out of arrogance, claiming he was superior because he was made from fire while Adam was made from clay.",
        verses: [
          {
            arabic: "إِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي خَالِقٌ بَشَرًا مِّن طِينٍ",
            translation:
              "When your Lord said to the angels, 'I am going to create a human being from clay.'",
            reference: "Quran 38:71",
          },
          {
            arabic: "وَإِذْ قُلْنَا لِلْمَلَائِكَةِ اسْجُدُوا لِآدَمَ فَسَجَدُوا إِلَّا إِبْلِيسَ أَبَىٰ وَاسْتَكْبَرَ وَكَانَ مِنَ الْكَافِرِينَ",
            translation:
              "And when We said to the angels, 'Prostrate before Adam,' so they prostrated, except for Iblis. He refused and was arrogant and became of the disbelievers.",
            reference: "Quran 2:34",
          },
        ],
        hadith: [
          {
            text:
              "The Prophet ﷺ said: ‘Allah created Adam sixty cubits tall. Whoever enters Paradise will be in the form of Adam — and human stature has kept diminishing since then.’",
            source: "Bukhari 79:1",
          },
          {
            text:
              "The Prophet ﷺ said: ‘The best day on which the sun has risen is Friday; on it Adam was created, on it he was made to enter Paradise, and on it he was expelled from it.’",
            source: "Muslim 7:26; 7:27",
          },
        ],
      },
      {
        title: "Knowledge Given to Adam",
        content:
          "Allah taught Adam the names of all things — a knowledge that even the angels did not possess. When the angels expressed their concern about placing a creation on earth that would cause corruption, Allah demonstrated Adam's superiority through this knowledge. This established humanity's role as khalifah (vicegerent) on earth.",
        verses: [
          {
            arabic: "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ثُمَّ عَرَضَهُمْ عَلَى الْمَلَائِكَةِ فَقَالَ أَنبِئُونِي بِأَسْمَاءِ هَٰؤُلَاءِ إِن كُنتُمْ صَادِقِينَ",
            translation:
              "And He taught Adam the names — all of them. Then He showed them to the angels and said, 'Inform Me of the names of these, if you are truthful.'",
            reference: "Quran 2:31",
          },
        ],
      },
      {
        title: "Life in Jannah & the Forbidden Tree",
        content:
          "Adam and his wife Hawwa (Eve) were placed in Jannah (Paradise) and told they could enjoy everything freely except one tree. Iblis, driven by jealousy, whispered to them and deceived them into eating from it. As a result, they were sent down to earth. However, unlike the Christian concept of 'original sin,' Islam teaches that Adam and Hawwa sincerely repented and were fully forgiven by Allah.",
        verses: [
          {
            arabic: "فَتَلَقَّىٰ آدَمُ مِن رَّبِّهِ كَلِمَاتٍ فَتَابَ عَلَيْهِ ۚ إِنَّهُ هُوَ التَّوَّابُ الرَّحِيمُ",
            translation:
              "Then Adam received from his Lord words, and He accepted his repentance. Indeed, He is the Accepting of repentance, the Merciful.",
            reference: "Quran 2:37",
          },
          {
            arabic: "قَالَا رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
            translation:
              "They said, 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.'",
            reference: "Quran 7:23",
          },
        ],
      },
      {
        title: "Descent to Earth & Legacy",
        content:
          "Adam and Hawwa were sent to earth as vicegerents, tasked with worshipping Allah and building civilization. Adam is considered the father of all humanity. He taught his children about the oneness of Allah and how to worship Him. The story of his two sons, Habil (Abel) and Qabil (Cain), demonstrates the consequences of jealousy and the first murder on earth.",
        verses: [
          {
            arabic: "قُلْنَا اهْبِطُوا مِنْهَا جَمِيعًا ۖ فَإِمَّا يَأْتِيَنَّكُم مِّنِّي هُدًى فَمَن تَبِعَ هُدَايَ فَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
            translation:
              "We said, 'Go down from it, all of you. And when guidance comes to you from Me, whoever follows My guidance — there will be no fear concerning them, nor will they grieve.'",
            reference: "Quran 2:38",
          },
        ],
      },
      {
        title: "Habil and Qabil — The First Murder",
        content:
          "Adam’s two sons each offered a sacrifice; it was accepted from one (Habil) but not from the other (Qabil). Consumed by envy, Qabil threatened to kill his brother. Habil refused to raise his hand in return, saying he feared Allah and would rather his brother carry the sin. Qabil murdered him — the first bloodshed on earth — then did not know how to hide the body, until Allah sent a crow scratching the ground to show him how to bury it, and he was left in remorse.",
        verses: [
          {
            arabic: "۞ وَٱتْلُ عَلَيْهِمْ نَبَأَ ٱبْنَىْ ءَادَمَ بِٱلْحَقِّ إِذْ قَرَّبَا قُرْبَانًا فَتُقُبِّلَ مِنْ أَحَدِهِمَا وَلَمْ يُتَقَبَّلْ مِنَ ٱلْـَٔاخَرِ قَالَ لَأَقْتُلَنَّكَ ۖ قَالَ إِنَّمَا يَتَقَبَّلُ ٱللَّهُ مِنَ ٱلْمُتَّقِينَ",
            translation:
              "Relate to them the story of the two sons of Adam in truth, when both offered a sacrifice; it was accepted from one [i.e., Abel] but not accepted from the other [i.e., Cain]. The latter said, “I will kill you.” The former said, “Allah only accepts from those who fear Him.",
            reference: "Quran 5:27",
          },
          {
            arabic: "لَئِنۢ بَسَطتَ إِلَىَّ يَدَكَ لِتَقْتُلَنِى مَآ أَنَا۠ بِبَاسِطٍ يَدِىَ إِلَيْكَ لِأَقْتُلَكَ ۖ إِنِّىٓ أَخَافُ ٱللَّهَ رَبَّ ٱلْعَـٰلَمِينَ",
            translation:
              "Even if you stretch your hand forward to kill me, I will not stretch my hand forward to kill you, for I fear Allah, the Lord of the worlds.",
            reference: "Quran 5:28",
          },
          {
            arabic: "فَبَعَثَ ٱللَّهُ غُرَابًا يَبْحَثُ فِى ٱلْأَرْضِ لِيُرِيَهُۥ كَيْفَ يُوَٰرِى سَوْءَةَ أَخِيهِ ۚ قَالَ يَـٰوَيْلَتَىٰٓ أَعَجَزْتُ أَنْ أَكُونَ مِثْلَ هَـٰذَا ٱلْغُرَابِ فَأُوَٰرِىَ سَوْءَةَ أَخِى ۖ فَأَصْبَحَ مِنَ ٱلنَّـٰدِمِينَ",
            translation:
              "Then Allah sent a crow scratching the ground to show him how to bury the corpse of his brother. He said, “Woe to me! Have I failed even to be like this crow to bury the corpse of my brother?” And he became one of the remorseful.",
            reference: "Quran 5:31",
          },
        ],
      },
    ],
    lessons: [
      "Repentance (Tawbah) is always accepted by Allah when sincere",
      "Arrogance is the root of disobedience — it caused Iblis to fall",
      "Humans are honored by Allah and given knowledge and responsibility",
      "Sin does not define a person — how they respond to it does",
      "Jealousy and envy can lead to the worst of actions",
    ],
    references: [
      "Quran: Surah Al-Baqarah (2:30-39), Al-A'raf (7:11-25), Al-Hijr (15:26-44), Ta-Ha (20:115-123), Sad (38:71-85)",
      "Tafsir Ibn Kathir — Stories of the Prophets (Qasas al-Anbiya)",
      "Ibn Kathir, Al-Bidaya wan-Nihaya",
    ],
  },

  shith: {
    slug: "shith",
    title: "Prophet Shith (Seth) — Son of Adam",
    sections: [
      {
        title: "Successor to Adam",
        content:
          "Shith (Seth) was the son of Adam, born after the death of Habil (Abel). He was granted prophethood and received 50 scriptures (suhuf) from Allah. He continued his father's mission of guiding humanity in the worship of Allah alone and teaching them the foundations of righteous living.",
        hadith: [
          {
            text: "Abu Dharr asked the Prophet ﷺ about the number of prophets, and he said: 'One hundred and twenty-four thousand.' Abu Dharr asked: 'How many of them were messengers?' He said: 'Three hundred and thirteen.' Abu Dharr then asked about Adam, and he ﷺ confirmed he was a prophet who received revelation. Shith was given 50 scriptures.",
            source: "Ibn Hibban 361 (graded Sahih by some scholars, Hasan by others)",
          },
        ],
      },
      {
        title: "Continuation of Guidance",
        content:
          "After Adam passed away, Shith took on the responsibility of leading humanity. He taught them the laws revealed to Adam and the additional guidance contained in the scriptures he received. He is considered a crucial link in the chain of prophethood, preserving monotheism after Adam.",
      },
      {
        title: "Legacy",
        content:
          "Shith lived during a time when humanity was still largely guided. The corruption and deviation from monotheism that later prophets would contend with had not yet taken root. His role was foundational — maintaining the pure worship of Allah that Adam had established.",
      },
    ],
    lessons: [
      "The chain of prophethood began immediately to guide humanity",
      "Preserving knowledge and passing it to the next generation is essential",
      "Even in times of relative peace, prophetic guidance is needed",
    ],
    references: [
      "Ibn Hibban, Sahih Ibn Hibban 361",
      "Ibn Kathir, Al-Bidaya wan-Nihaya, Vol. 1",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  idris: {
    slug: "idris",
    title: "Prophet Idris (Enoch) — Raised to a High Station",
    sections: [
      {
        title: "A Prophet of Knowledge and Patience",
        content:
          "Idris is mentioned twice in the Quran, praised for his truthfulness and patience. Many scholars identify him with the biblical Enoch. He is described as having been raised to a high station by Allah, which scholars interpret as either a high rank in paradise or being raised physically to the heavens.",
        verses: [
          {
            arabic: "وَاذْكُرْ فِي الْكِتَابِ إِدْرِيسَ ۚ إِنَّهُ كَانَ صِدِّيقًا نَّبِيًّا * وَرَفَعْنَاهُ مَكَانًا عَلِيًّا",
            translation:
              "And mention in the Book, Idris. Indeed, he was a man of truth and a prophet. And We raised him to a high station.",
            reference: "Quran 19:56-57",
          },
        ],
      },
      {
        title: "First to Write with a Pen",
        content:
          "According to scholarly tradition, Idris was the first person to write with a pen and to sew clothing. He was also associated with astronomy and mathematics. He called his people to the worship of Allah and warned them against following their desires.",
        hadith: [
          {
            text: "During the Night Journey (Isra and Mi'raj), the Prophet ﷺ met Idris in the fourth heaven and greeted him.",
            source: "Bukhari 59:18, Muslim 1:321",
          },
        ],
      },
      {
        title: "His Place Among the Righteous",
        content:
          "Allah lists Idris among the prophets He favored, alongside Ibrahim, Musa, and others. He is praised alongside Ismail and Dhul-Kifl for their patience and steadfastness.",
        verses: [
          {
            arabic: "وَإِسْمَاعِيلَ وَإِدْرِيسَ وَذَا الْكِفْلِ ۖ كُلٌّ مِّنَ الصَّابِرِينَ",
            translation:
              "And [mention] Ismail, Idris, and Dhul-Kifl — all were of the patient.",
            reference: "Quran 21:85",
          },
        ],
      },
    ],
    lessons: [
      "Knowledge and learning are central to the prophetic tradition",
      "Patience (sabr) is a defining quality of the righteous",
      "Allah elevates those who are truthful and devout",
    ],
    references: [
      "Quran: Surah Maryam (19:56-57), Al-Anbiya (21:85-86)",
      "Bukhari 59:18, Muslim 1:321 — Night Journey (Isra and Mi'raj)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  nuh: {
    slug: "nuh",
    title: "Prophet Nuh (Noah) — The First Major Messenger",
    sections: [
      {
        title: "950 Years of Da'wah",
        content:
          "Nuh is one of the five Ulul-Azm (Prophets of Determination). He called his people to worship Allah alone for 950 years, yet only a handful believed. Despite facing mockery, rejection, and hostility, he never gave up. His patience is unmatched in the history of prophethood.",
        verses: [
          {
            arabic: "وَلَقَدْ أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِ فَلَبِثَ فِيهِمْ أَلْفَ سَنَةٍ إِلَّا خَمْسِينَ عَامًا",
            translation:
              "And We certainly sent Nuh to his people, and he remained among them a thousand years minus fifty years.",
            reference: "Quran 29:14",
          },
        ],
      },
      {
        title: "The Rejection of His People",
        content:
          "The chiefs and elite of his people accused him of being misguided, called him a liar, and mocked his followers as being lowly people. They stuffed their fingers in their ears and covered themselves with their garments to avoid hearing his message. Nuh tried every approach — public preaching, private counsel, day and night — but they persisted in disbelief.",
        verses: [
          {
            arabic: "قَالَ رَبِّ إِنِّي دَعَوْتُ قَوْمِي لَيْلًا وَنَهَارًا * فَلَمْ يَزِدْهُمْ دُعَائِي إِلَّا فِرَارًا",
            translation:
              "He said, 'My Lord, indeed I invited my people night and day. But my invitation increased them not except in flight.'",
            reference: "Quran 71:5-6",
          },
        ],
      },
      {
        title: "Building the Ark",
        content:
          "When Allah's decree came, He commanded Nuh to build the Ark. His people mocked him for building a ship far from water. Nuh built it under divine guidance, and when the flood began, he was commanded to load the believers and a pair of every species aboard. The floodwaters rose until they covered the mountains.",
        verses: [
          {
            arabic: "وَيَصْنَعُ الْفُلْكَ وَكُلَّمَا مَرَّ عَلَيْهِ مَلَأٌ مِّن قَوْمِهِ سَخِرُوا مِنْهُ",
            translation:
              "And he constructed the ship, and whenever an assembly of the eminent of his people passed by him, they ridiculed him.",
            reference: "Quran 11:38",
          },
        ],
      },
      {
        title: "The Great Flood",
        content:
          "The earth erupted with water from below and rain poured from above. The flood destroyed all the disbelievers, including Nuh's own son who refused to board the Ark, thinking he could escape to a mountain. Nuh called out to his son, but the waves came between them. After the flood, the Ark settled on Mount Judi, and the earth was cleansed.",
        verses: [
          {
            arabic: "وَنَادَىٰ نُوحٌ ابْنَهُ وَكَانَ فِي مَعْزِلٍ يَا بُنَيَّ ارْكَب مَّعَنَا وَلَا تَكُن مَّعَ الْكَافِرِينَ",
            translation:
              "And Nuh called to his son who was apart [from them], 'O my son, come aboard with us and be not with the disbelievers.'",
            reference: "Quran 11:42",
          },
          {
            arabic: "وَقِيلَ يَا أَرْضُ ابْلَعِي مَاءَكِ وَيَا سَمَاءُ أَقْلِعِي وَغِيضَ الْمَاءُ وَقُضِيَ الْأَمْرُ وَاسْتَوَتْ عَلَى الْجُودِيِّ",
            translation:
              "And it was said, 'O earth, swallow your water, and O sky, withhold [your rain].' And the water subsided, and the matter was accomplished, and the ship came to rest on Mount Judi.",
            reference: "Quran 11:44",
          },
        ],
      },
    ],
    lessons: [
      "Perseverance in da'wah regardless of the results — success is in the effort, not the outcome",
      "Family ties do not override faith — even Nuh's own son and wife were not saved",
      "Allah's punishment comes when a people collectively and persistently reject guidance",
      "Trust in Allah's plan, even when it seems improbable to others",
    ],
    references: [
      "Quran: Surah Nuh (71), Hud (11:25-49), Al-A'raf (7:59-64), Al-Mu'minun (23:23-30), Al-Qamar (54:9-16)",
      "Tafsir Ibn Kathir",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  hud: {
    slug: "hud",
    title: "Prophet Hud — Sent to the People of 'Ad",
    sections: [
      {
        title: "The Mighty Civilization of 'Ad",
        content:
          "The people of 'Ad were a powerful civilization in southern Arabia (modern-day Yemen/Oman region). They built impressive structures and were known for their physical strength. They considered themselves invincible and asked arrogantly, 'Who is mightier than us in strength?' They had deviated from the monotheism of Nuh and began worshipping idols.",
        verses: [
          {
            arabic: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِعَادٍ * إِرَمَ ذَاتِ الْعِمَادِ * الَّتِي لَمْ يُخْلَقْ مِثْلُهَا فِي الْبِلَادِ",
            translation:
              "Have you not considered how your Lord dealt with 'Ad — [the city of] Iram, with its lofty pillars, the likes of which had never been created in the land?",
            reference: "Quran 89:6-8",
          },
        ],
      },
      {
        title: "Hud's Message",
        content:
          "Hud called his people to abandon their idols and worship Allah alone. He reminded them of the blessings Allah had given them — strength, prosperity, gardens, and springs. He warned them that if they did not repent, they would face a severe punishment. But they accused him of being foolish and a liar.",
        verses: [
          {
            arabic: "وَإِلَىٰ عَادٍ أَخَاهُمْ هُودًا ۗ قَالَ يَا قَوْمِ اعْبُدُوا اللَّهَ مَا لَكُم مِّنْ إِلَٰهٍ غَيْرُهُ",
            translation:
              "And to 'Ad [We sent] their brother Hud. He said, 'O my people, worship Allah; you have no deity other than Him.'",
            reference: "Quran 7:65",
          },
        ],
      },
      {
        title: "Destruction by a Furious Wind",
        content:
          "When they persisted in their rejection, Allah sent upon them a violent, barren wind that lasted for seven nights and eight days. It destroyed everything in its path, leaving the people of 'Ad like hollow palm trunks. Only Hud and the believers were saved.",
        verses: [
          {
            arabic: "فَأَرْسَلْنَا عَلَيْهِمْ رِيحًا صَرْصَرًا فِي أَيَّامٍ نَّحِسَاتٍ لِّنُذِيقَهُمْ عَذَابَ الْخِزْيِ فِي الْحَيَاةِ الدُّنْيَا",
            translation:
              "So We sent upon them a screaming wind during days of misfortune to make them taste the punishment of disgrace in worldly life.",
            reference: "Quran 41:16",
          },
        ],
      },
    ],
    lessons: [
      "Physical power and material wealth cannot protect against Allah's decree",
      "Arrogance blinds a people from recognizing the truth",
      "Blessings come from Allah and can be taken away when gratitude is absent",
    ],
    references: [
      "Quran: Surah Hud (11:50-60), Al-A'raf (7:65-72), Ash-Shu'ara (26:123-140), Al-Ahqaf (46:21-26), Al-Fajr (89:6-8)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  salih: {
    slug: "salih",
    title: "Prophet Salih — The She-Camel of Allah",
    sections: [
      {
        title: "The People of Thamud",
        content:
          "Thamud were the successors of 'Ad, dwelling in the rocky valleys of Al-Hijr (modern-day Mada'in Salih in Saudi Arabia). They carved magnificent homes into the mountains and were blessed with gardens, springs, and fertile land. Despite these blessings, they turned to idol worship.",
        verses: [
          {
            arabic: "وَثَمُودَ الَّذِينَ جَابُوا الصَّخْرَ بِالْوَادِ",
            translation:
              "And [with] Thamud, who carved out the rocks in the valley.",
            reference: "Quran 89:9",
          },
        ],
      },
      {
        title: "The Miracle of the She-Camel",
        content:
          "The people of Thamud demanded a miracle from Salih. Allah caused a she-camel to emerge from a rock as a sign. Salih told his people that this was Allah's she-camel and they must let her graze and drink freely, and that harming her would bring severe punishment.",
        verses: [
          {
            arabic: "وَيَا قَوْمِ هَٰذِهِ نَاقَةُ اللَّهِ لَكُمْ آيَةً فَذَرُوهَا تَأْكُلْ فِي أَرْضِ اللَّهِ",
            translation:
              "And O my people, this is the she-camel of Allah — a sign for you. So let her feed upon Allah's earth.",
            reference: "Quran 11:64",
          },
        ],
      },
      {
        title: "The Hamstringing & Destruction",
        content:
          "Despite the clear warning, the most wicked among them hamstrung and killed the she-camel. Salih gave them three days before the punishment would come. On the appointed day, a massive earthquake (sayha — a deafening blast) struck them, leaving them dead in their homes.",
        verses: [
          {
            arabic: "فَعَقَرُوهَا فَقَالَ تَمَتَّعُوا فِي دَارِكُمْ ثَلَاثَةَ أَيَّامٍ ۖ ذَٰلِكَ وَعْدٌ غَيْرُ مَكْذُوبٍ",
            translation:
              "But they hamstrung her. So he said, 'Enjoy yourselves in your homes for three days. That is a promise not to be denied.'",
            reference: "Quran 11:65",
          },
        ],
      },
    ],
    lessons: [
      "Miracles are signs from Allah, not entertainment — they demand a response",
      "The actions of a few can bring consequences upon an entire community that supports them",
      "Allah's warnings have a set timeline — they are never empty threats",
    ],
    references: [
      "Quran: Surah Hud (11:61-68), Al-A'raf (7:73-79), Ash-Shu'ara (26:141-159), An-Naml (27:45-53), Ash-Shams (91:11-15)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  ibrahim: {
    slug: "ibrahim",
    title: "Prophet Ibrahim (Abraham) — The Friend of Allah",
    sections: [
      {
        title: "Searching for the Truth",
        content:
          "Ibrahim grew up in a society of idol worshippers. Even as a young man, he questioned the worship of stars, the moon, and the sun, realizing that none of these could be the true God because they all set and changed. Through this rational journey, he arrived at the truth of monotheism — that only the Creator of the heavens and earth deserves worship.",
        verses: [
          {
            arabic: "فَلَمَّا جَنَّ عَلَيْهِ اللَّيْلُ رَأَىٰ كَوْكَبًا ۖ قَالَ هَٰذَا رَبِّي ۖ فَلَمَّا أَفَلَ قَالَ لَا أُحِبُّ الْآفِلِينَ",
            translation:
              "So when the night covered him [with darkness], he saw a star. He said, 'This is my lord.' But when it set, he said, 'I like not those that set.'",
            reference: "Quran 6:76",
          },
        ],
      },
      {
        title: "Inviting His Father Azar",
        content:
          "Ibrahim gently called his father Azar away from idols, asking why he worshipped what could neither hear, nor see, nor benefit him. His father threatened to stone him and ordered him to leave. Ibrahim answered only with peace and a promise to seek forgiveness for him — a model of patient, respectful da’wah to family. He later disassociated from that plea once it was clear his father had died an enemy of Allah.",
        verses: [
          {
            arabic: "۞ وَإِذْ قَالَ إِبْرَٰهِيمُ لِأَبِيهِ ءَازَرَ أَتَتَّخِذُ أَصْنَامًا ءَالِهَةً ۖ إِنِّىٓ أَرَىٰكَ وَقَوْمَكَ فِى ضَلَـٰلٍ مُّبِينٍ",
            translation:
              "And [remember] when Abraham said to his father, Āzar, “Do you take idols as gods? I see that you and your people are clearly misguided.”",
            reference: "Quran 6:74",
          },
          {
            arabic: "إِذْ قَالَ لِأَبِيهِ يَـٰٓأَبَتِ لِمَ تَعْبُدُ مَا لَا يَسْمَعُ وَلَا يُبْصِرُ وَلَا يُغْنِى عَنكَ شَيْـًٔا",
            translation:
              "When he said to his father, “O my dear father, why do you worship something that neither hears nor sees nor benefits you in any way?",
            reference: "Quran 19:42",
          },
          {
            arabic: "قَالَ أَرَاغِبٌ أَنتَ عَنْ ءَالِهَتِى يَـٰٓإِبْرَٰهِيمُ ۖ لَئِن لَّمْ تَنتَهِ لَأَرْجُمَنَّكَ ۖ وَٱهْجُرْنِى مَلِيًّا",
            translation:
              "He said, “Are you turning away from my gods, O Abraham? If you do not desist, I will surely stone you. Keep away from me for a long time!”",
            reference: "Quran 19:46",
          },
          {
            arabic: "قَالَ سَلَـٰمٌ عَلَيْكَ ۖ سَأَسْتَغْفِرُ لَكَ رَبِّىٓ ۖ إِنَّهُۥ كَانَ بِى حَفِيًّا",
            translation:
              "Abraham said, “Peace be on you. I will seek my Lord’s forgiveness for you. Indeed, He is Most Gracious to me.",
            reference: "Quran 19:47",
          },
        ],
      },
      {
        title: "Challenging the Idolaters",
        content:
          "Ibrahim smashed the idols in the temple, leaving only the largest one intact, to prove to his people that their idols could not defend themselves. When confronted, he pointed to the largest idol and said, 'Ask him.' The people knew their idols could not speak, yet still refused to abandon them. As punishment, they threw Ibrahim into a massive fire.",
        verses: [
          {
            arabic: "قُلْنَا يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ",
            translation:
              "We said, 'O fire, be coolness and safety upon Ibrahim.'",
            reference: "Quran 21:69",
          },
        ],
      },
      {
        title: "The Debate with Nimrod",
        content:
          "Ibrahim confronted a tyrant king — identified by scholars as Nimrod — whom Allah had given kingship and who claimed the power over life and death. When Ibrahim said his Lord is the One Who gives life and causes death, the king boasted that he too could kill and spare. Ibrahim then silenced him: Allah brings the sun from the east, so bring it from the west. The disbeliever was left dumbfounded.",
        verses: [
          {
            arabic: "أَلَمْ تَرَ إِلَى ٱلَّذِى حَآجَّ إِبْرَٰهِـۧمَ فِى رَبِّهِۦٓ أَنْ ءَاتَىٰهُ ٱللَّهُ ٱلْمُلْكَ إِذْ قَالَ إِبْرَٰهِـۧمُ رَبِّىَ ٱلَّذِى يُحْىِۦ وَيُمِيتُ قَالَ أَنَا۠ أُحْىِۦ وَأُمِيتُ ۖ قَالَ إِبْرَٰهِـۧمُ فَإِنَّ ٱللَّهَ يَأْتِى بِٱلشَّمْسِ مِنَ ٱلْمَشْرِقِ فَأْتِ بِهَا مِنَ ٱلْمَغْرِبِ فَبُهِتَ ٱلَّذِى كَفَرَ ۗ وَٱللَّهُ لَا يَهْدِى ٱلْقَوْمَ ٱلظَّـٰلِمِينَ",
            translation:
              "Have you not considered the one who argued with Abraham about his Lord, as Allah had given him kingship? When Abraham said, “My Lord is the One Who gives life and causes death.” He said, “I give life and cause death.” Abraham said, “It is Allah Who brings the sun from the east, so bring it from the west.” Thus the disbeliever was dumbfounded, and Allah does not guide the wrongdoing people.",
            reference: "Quran 2:258",
          },
        ],
      },
      {
        title: "The Four Birds",
        content:
          "Seeking the tranquillity of certainty, Ibrahim asked Allah to show him how He brings the dead to life. Allah affirmed that Ibrahim already believed, then told him to take four birds, cut them, place a portion of each on a separate hill, and call them — and they came rushing back to him. His request was not doubt, but a longing for his heart to be at rest.",
        verses: [
          {
            arabic: "وَإِذْ قَالَ إِبْرَٰهِـۧمُ رَبِّ أَرِنِى كَيْفَ تُحْىِ ٱلْمَوْتَىٰ ۖ قَالَ أَوَلَمْ تُؤْمِن ۖ قَالَ بَلَىٰ وَلَـٰكِن لِّيَطْمَئِنَّ قَلْبِى ۖ قَالَ فَخُذْ أَرْبَعَةً مِّنَ ٱلطَّيْرِ فَصُرْهُنَّ إِلَيْكَ ثُمَّ ٱجْعَلْ عَلَىٰ كُلِّ جَبَلٍ مِّنْهُنَّ جُزْءًا ثُمَّ ٱدْعُهُنَّ يَأْتِينَكَ سَعْيًا ۚ وَٱعْلَمْ أَنَّ ٱللَّهَ عَزِيزٌ حَكِيمٌ",
            translation:
              "And [remember] when Abraham said: “My Lord, show me how You give life to the dead.” He said: “Do you not believe?’’ He said: “I do believe, but just to reassure my heart.’’ Allah said: “Then take four birds and cut them into pieces, then put a piece of each of them on each mountain, then call them; they will come swiftly to you. And know that Allah is All-Mighty, All-Wise.”",
            reference: "Quran 2:260",
          },
        ],
      },
      {
        title: "The Three Statements of Ibrahim",
        content:
          "The Prophet ﷺ mentioned that Ibrahim spoke only three words that outwardly departed from the literal: twice for the sake of Allah (‘I am sick’ and ‘the big idol did it’), and once when he called his wife Sarah his sister before a tyrant to protect her. Scholars explain these were not blameworthy lies but words of double meaning (ma’arid) that shielded faith and life; on the Day of Judgment Ibrahim recalls them only out of his intense humility before Allah.",
        hadith: [
          {
            text:
              "The Prophet ﷺ said: ‘Ibrahim never told a lie except on three occasions’ — two for the sake of Allah (‘I am sick’ and ‘the big idol did it’), and once when he called Sarah his sister before a tyrant king.",
            source: "Bukhari 60:32; 60:33",
          },
        ],
      },
      {
        title: "The Sacrifice",
        content:
          "In the ultimate test of faith, Allah commanded Ibrahim in a dream to sacrifice his son. Ibrahim informed his son, who willingly submitted to Allah's command. As Ibrahim was about to carry out the sacrifice, Allah replaced his son with a ram and declared that Ibrahim had fulfilled the vision. This event is commemorated every year during Eid al-Adha.",
        verses: [
          {
            arabic: "فَلَمَّا بَلَغَ مَعَهُ السَّعْيَ قَالَ يَا بُنَيَّ إِنِّي أَرَىٰ فِي الْمَنَامِ أَنِّي أَذْبَحُكَ فَانظُرْ مَاذَا تَرَىٰ ۚ قَالَ يَا أَبَتِ افْعَلْ مَا تُؤْمَرُ ۖ سَتَجِدُنِي إِن شَاءَ اللَّهُ مِنَ الصَّابِرِينَ",
            translation:
              "And when he reached with him [the age of] exertion, he said, 'O my son, indeed I have seen in a dream that I must sacrifice you, so see what you think.' He said, 'O my father, do as you are commanded. You will find me, if Allah wills, of the patient.'",
            reference: "Quran 37:102",
          },
        ],
      },
      {
        title: "Building the Kaaba",
        content:
          "Ibrahim and his son Ismail raised the foundations of the Kaaba in Makkah, the first house of worship established for humanity. As they built it, they prayed for Allah to accept their effort and to make their descendants a Muslim nation. Ibrahim also established the rites of Hajj, calling people to make pilgrimage to this sacred house.",
        verses: [
          {
            arabic: "وَإِذْ يَرْفَعُ إِبْرَاهِيمُ الْقَوَاعِدَ مِنَ الْبَيْتِ وَإِسْمَاعِيلُ رَبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ",
            translation:
              "And [mention] when Ibrahim was raising the foundations of the House and Ismail, [saying], 'Our Lord, accept [this] from us. Indeed, You are the Hearing, the Knowing.'",
            reference: "Quran 2:127",
          },
          {
            arabic: "رَبِّ ٱجْعَلْنِى مُقِيمَ ٱلصَّلَوٰةِ وَمِن ذُرِّيَّتِى ۚ رَبَّنَا وَتَقَبَّلْ دُعَآءِ",
            translation:
              "My Lord, make me steadfast in prayer and those of my offspring. Our Lord, accept my supplication.",
            reference: "Quran 14:40",
          },
        ],
      },
    ],
    lessons: [
      "True faith requires intellectual conviction, not blind following",
      "Complete submission to Allah may require sacrificing what you love most",
      "Standing alone for the truth is better than following the majority in falsehood",
      "Allah protects and honors those who trust Him completely",
      "The legacy of a righteous person endures for millennia",
    ],
    references: [
      "Quran: Surah Al-Baqarah (2:124-132), Al-An'am (6:74-83), Al-Anbiya (21:51-73), As-Saffat (37:83-113), Ibrahim (14:35-41), Maryam (19:41-50)",
      "Bukhari 60:38 — Ibrahim as Khalilullah",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  lut: {
    slug: "lut",
    title: "Prophet Lut (Lot) — Righteous in a Corrupt Land",
    sections: [
      {
        title: "Mission to Sodom",
        content:
          "Lut was the nephew of Ibrahim who believed in his message and migrated with him. He was sent to the people of Sodom and the surrounding cities near the Dead Sea. These people were engaged in unprecedented acts of immorality, highway robbery, and open wickedness in their gatherings.",
        verses: [
          {
            arabic: "وَلُوطًا إِذْ قَالَ لِقَوْمِهِ أَتَأْتُونَ الْفَاحِشَةَ مَا سَبَقَكُم بِهَا مِنْ أَحَدٍ مِّنَ الْعَالَمِينَ",
            translation:
              "And [We sent] Lut when he said to his people, 'Do you commit such immorality as no one has preceded you with from among the worlds?'",
            reference: "Quran 7:80",
          },
        ],
      },
      {
        title: "The Angels Visit",
        content:
          "Allah sent angels in the form of handsome young men to Lut. The wicked people of the city rushed to Lut's house, demanding access to his guests. Lut was distressed and tried to reason with them, but they persisted. The angels then revealed their true identity and told Lut to leave with his family during the night, warning that his wife would be among those who remained behind.",
        verses: [
          {
            arabic: "قَالُوا يَا لُوطُ إِنَّا رُسُلُ رَبِّكَ لَن يَصِلُوا إِلَيْكَ ۖ فَأَسْرِ بِأَهْلِكَ بِقِطْعٍ مِّنَ اللَّيْلِ",
            translation:
              "They said, 'O Lut, indeed we are messengers of your Lord; they will never reach you. So set out with your family during a portion of the night.'",
            reference: "Quran 11:81",
          },
        ],
      },
      {
        title: "The Destruction",
        content:
          "At dawn, the cities were turned upside down and rained upon with stones of baked clay. The entire civilization was wiped out. Lut's wife, who had sympathized with the people and betrayed his trust, was among those destroyed. The area of the Dead Sea today stands as a stark reminder of this event.",
        verses: [
          {
            arabic: "فَلَمَّا جَاءَ أَمْرُنَا جَعَلْنَا عَالِيَهَا سَافِلَهَا وَأَمْطَرْنَا عَلَيْهَا حِجَارَةً مِّن سِجِّيلٍ مَّنضُودٍ",
            translation:
              "So when Our command came, We made the highest part [of the city] its lowest and rained upon them stones of layered hard clay.",
            reference: "Quran 11:82",
          },
        ],
      },
    ],
    lessons: [
      "Standing for morality in an immoral society is a prophetic duty",
      "Open and unashamed sin invites divine punishment",
      "Family bonds do not guarantee shared faith — each person is accountable individually",
    ],
    references: [
      "Quran: Surah Hud (11:77-83), Al-A'raf (7:80-84), Ash-Shu'ara (26:160-175), Al-Qamar (54:33-40), Al-Ankabut (29:28-35)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  ismail: {
    slug: "ismail",
    title: "Prophet Ismail — The Patient Sacrifice",
    sections: [
      {
        title: "Left in the Desert",
        content:
          "As an infant, Ismail was taken with his mother Hajar to the barren valley of Makkah by Ibrahim, following Allah's command. When Hajar asked Ibrahim if this was Allah's command, and he confirmed, she said, 'Then He will not abandon us.' Alone in the desert, Hajar ran between the hills of Safa and Marwa searching for water, a journey Muslims reenact during Hajj and Umrah.",
        hadith: [
          {
            text: "The Prophet ﷺ narrated the story of Hajar running between Safa and Marwa, saying that is why people walk between them during Hajj.",
            source: "Bukhari 60:38",
          },
        ],
      },
      {
        title: "The Well of Zamzam",
        content:
          "Allah caused the spring of Zamzam to gush forth at the feet of the infant Ismail. This water attracted the Jurhum tribe, who settled in the valley with Hajar's permission. The well of Zamzam continues to flow to this day in Makkah, serving millions of pilgrims.",
        verses: [
          {
            arabic: "رَّبَّنَا إِنِّي أَسْكَنتُ مِن ذُرِّيَّتِي بِوَادٍ غَيْرِ ذِي زَرْعٍ عِندَ بَيْتِكَ الْمُحَرَّمِ",
            translation:
              "Our Lord, I have settled some of my descendants in an uncultivated valley near Your sacred House.",
            reference: "Quran 14:37",
          },
        ],
      },
      {
        title: "Willing Sacrifice & Building the Kaaba",
        content:
          "When Ibrahim was commanded to sacrifice his son, Ismail's response demonstrated extraordinary faith: 'O my father, do as you are commanded. You will find me, if Allah wills, of the patient.' Later, father and son together raised the foundations of the Kaaba, establishing the spiritual center of Islam.",
        verses: [
          {
            arabic: "وَاذْكُرْ فِي الْكِتَابِ إِسْمَاعِيلَ ۚ إِنَّهُ كَانَ صَادِقَ الْوَعْدِ وَكَانَ رَسُولًا نَّبِيًّا",
            translation:
              "And mention in the Book, Ismail. Indeed, he was true to his promise, and he was a messenger and a prophet.",
            reference: "Quran 19:54",
          },
        ],
      },
    ],
    lessons: [
      "True trust in Allah (tawakkul) means accepting His plan even in the most difficult circumstances",
      "Youth is no excuse for lack of faith — Ismail submitted to Allah's command as a young man",
      "The greatest institutions are built by those who sacrifice for Allah's sake",
    ],
    references: [
      "Quran: Surah Al-Baqarah (2:125-129), As-Saffat (37:100-111), Maryam (19:54-55), Ibrahim (14:37-41)",
      "Bukhari 60:38",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  ishaq: {
    slug: "ishaq",
    title: "Prophet Ishaq (Isaac) — The Gift of Old Age",
    sections: [
      {
        title: "A Miraculous Birth",
        content:
          "Ishaq was born to Ibrahim and Sarah in their old age, a miracle announced by the angels who visited Ibrahim on their way to the people of Lut. Sarah laughed in astonishment when given the news, as she was elderly and barren. Allah granted them this child as a reward for their decades of faith and patience.",
        verses: [
          {
            arabic: "فَبَشَّرْنَاهَا بِإِسْحَاقَ وَمِن وَرَاءِ إِسْحَاقَ يَعْقُوبَ",
            translation:
              "So We gave her good tidings of Ishaq, and after Ishaq, Yaqub.",
            reference: "Quran 11:71",
          },
        ],
      },
      {
        title: "A Prophet and Father of Prophets",
        content:
          "Ishaq grew up to be a righteous prophet. Through his son Yaqub (also known as Israel), he became the ancestor of the entire line of Israelite prophets, including Musa, Dawud, Sulayman, and Isa. He is consistently mentioned in the Quran alongside his father Ibrahim and son Yaqub as part of a blessed lineage.",
        verses: [
          {
            arabic: "وَوَهَبْنَا لَهُ إِسْحَاقَ وَيَعْقُوبَ ۚ كُلًّا هَدَيْنَا",
            translation:
              "And We gave him Ishaq and Yaqub — all [of them] We guided.",
            reference: "Quran 6:84",
          },
        ],
      },
    ],
    lessons: [
      "Allah's blessings come at the time He decrees, not when we expect",
      "A righteous person's legacy extends far beyond their own lifetime",
      "Children are a gift from Allah, and gratitude for them is essential",
    ],
    references: [
      "Quran: Surah Hud (11:69-73), Al-Baqarah (2:133-136), As-Saffat (37:112-113), Al-An'am (6:84)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  yaqub: {
    slug: "yaqub",
    title: "Prophet Yaqub (Jacob/Israel) — Beautiful Patience",
    sections: [
      {
        title: "Father of the Twelve Tribes",
        content:
          "Yaqub, also known as Israel, was the son of Ishaq and the father of twelve sons who became the twelve tribes of Bani Israel. His life was marked by deep faith and extraordinary patience, especially in his relationship with his beloved son Yusuf.",
        verses: [
          {
            arabic: "وَوَصَّىٰ بِهَا إِبْرَاهِيمُ بَنِيهِ وَيَعْقُوبُ يَا بَنِيَّ إِنَّ اللَّهَ اصْطَفَىٰ لَكُمُ الدِّينَ فَلَا تَمُوتُنَّ إِلَّا وَأَنتُم مُّسْلِمُونَ",
            translation:
              "And Ibrahim instructed his sons [to do the same] and [so did] Yaqub, [saying], 'O my sons, indeed Allah has chosen for you this religion, so do not die except while you are Muslims.'",
            reference: "Quran 2:132",
          },
        ],
      },
      {
        title: "The Loss of Yusuf",
        content:
          "When Yaqub's sons threw Yusuf into a well and brought back his shirt stained with false blood, Yaqub recognized their deception. His grief was immense, and he wept until he lost his eyesight. Yet he described his patience as 'beautiful patience' (sabr jamil) — patience without complaint to anyone but Allah.",
        verses: [
          {
            arabic: "قَالَ بَلْ سَوَّلَتْ لَكُمْ أَنفُسُكُمْ أَمْرًا ۖ فَصَبْرٌ جَمِيلٌ ۖ وَاللَّهُ الْمُسْتَعَانُ عَلَىٰ مَا تَصِفُونَ",
            translation:
              "He said, 'Rather, your souls have enticed you to something, so patience is most fitting. And Allah is the one sought for help against that which you describe.'",
            reference: "Quran 12:18",
          },
        ],
      },
      {
        title: "Reunion and Restoration",
        content:
          "After years of separation, Yaqub was reunited with Yusuf in Egypt. When Yusuf's shirt was placed over his father's face, Yaqub's sight was restored. This reunion is one of the most emotionally powerful moments in the Quran, demonstrating that Allah's promise is always true.",
        verses: [
          {
            arabic: "فَلَمَّا أَن جَاءَ الْبَشِيرُ أَلْقَاهُ عَلَىٰ وَجْهِهِ فَارْتَدَّ بَصِيرًا ۖ قَالَ أَلَمْ أَقُل لَّكُمْ إِنِّي أَعْلَمُ مِنَ اللَّهِ مَا لَا تَعْلَمُونَ",
            translation:
              "And when the bearer of good tidings arrived, he cast it over his face, and he returned [once again] seeing. He said, 'Did I not tell you that I know from Allah that which you do not know?'",
            reference: "Quran 12:96",
          },
        ],
      },
    ],
    lessons: [
      "'Beautiful patience' (sabr jamil) means complaining only to Allah, not to people",
      "Never lose hope in Allah's mercy, no matter how long the trial lasts",
      "A parent's love and du'a are powerful — Yaqub never stopped praying for Yusuf's return",
    ],
    references: [
      "Quran: Surah Yusuf (12), Al-Baqarah (2:132-133), Al-Anbiya (21:72)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  yusuf: {
    slug: "yusuf",
    title: "Prophet Yusuf (Joseph) — The Best of Stories",
    sections: [
      {
        title: "The Dream",
        content:
          "As a young boy, Yusuf saw a dream in which eleven stars, the sun, and the moon prostrated to him. His father Yaqub recognized this as a sign of future prophethood and warned Yusuf not to tell his brothers, fearing their jealousy. This dream would be fulfilled decades later when his family came to him in Egypt.",
        verses: [
          {
            arabic: "إِذْ قَالَ يُوسُفُ لِأَبِيهِ يَا أَبَتِ إِنِّي رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا وَالشَّمْسَ وَالْقَمَرَ رَأَيْتُهُمْ لِي سَاجِدِينَ",
            translation:
              "When Yusuf said to his father, 'O my father, indeed I have seen eleven stars and the sun and the moon; I saw them prostrating to me.'",
            reference: "Quran 12:4",
          },
        ],
      },
      {
        title: "Betrayal by His Brothers",
        content:
          "Driven by jealousy, Yusuf's brothers plotted against him. They threw him into a deep well and told their father that a wolf had eaten him. A passing caravan found Yusuf and sold him into slavery in Egypt, where he was purchased by a high-ranking official (Al-Aziz).",
        verses: [
          {
            arabic: "وَجَاءَتْ سَيَّارَةٌ فَأَرْسَلُوا وَارِدَهُمْ فَأَدْلَىٰ دَلْوَهُ ۖ قَالَ يَا بُشْرَىٰ هَٰذَا غُلَامٌ",
            translation:
              "And there came a caravan, and they sent their water drawer, and he let down his bucket. He said, 'Good news! Here is a boy.'",
            reference: "Quran 12:19",
          },
        ],
      },
      {
        title: "Trial of Temptation",
        content:
          "In Egypt, the wife of Al-Aziz attempted to seduce Yusuf. Despite her beauty, power, and persistence, Yusuf refused and sought refuge in Allah. He said, 'I seek refuge in Allah. Indeed, He is my master who has made good my residence.' He chose imprisonment over sin when she threatened him.",
        verses: [
          {
            arabic: "قَالَ رَبِّ السِّجْنُ أَحَبُّ إِلَيَّ مِمَّا يَدْعُونَنِي إِلَيْهِ",
            translation:
              "He said, 'My Lord, prison is more to my liking than that to which they invite me.'",
            reference: "Quran 12:33",
          },
        ],
      },
      {
        title: "From Prison to Power",
        content:
          "In prison, Yusuf interpreted dreams for two fellow inmates and, later, for the King of Egypt himself. The King's dream of seven fat cows eaten by seven lean ones predicted seven years of plenty followed by seven years of famine. Yusuf's wisdom led to his appointment as treasurer of Egypt, managing the nation's food reserves.",
        verses: [
          {
            arabic: "قَالَ اجْعَلْنِي عَلَىٰ خَزَائِنِ الْأَرْضِ ۖ إِنِّي حَفِيظٌ عَلِيمٌ",
            translation:
              "He said, 'Appoint me over the storehouses of the land. Indeed, I am a knowing guardian.'",
            reference: "Quran 12:55",
          },
        ],
      },
      {
        title: "Forgiveness and Reunion",
        content:
          "During the famine, Yusuf's brothers came to Egypt seeking food, not recognizing him. After testing them, Yusuf revealed his identity and forgave them, saying, 'No blame upon you today. Allah will forgive you.' He then sent for his father and family, and Yaqub's dream was fulfilled when they all bowed before him in gratitude. Commentators note that when the Prophet ﷺ entered Makkah victorious over those who had persecuted him, he pardoned them in the very spirit of Yusuf's words of forgiveness.",
        verses: [
          {
            arabic: "قَالَ لَا تَثْرِيبَ عَلَيْكُمُ الْيَوْمَ ۖ يَغْفِرُ اللَّهُ لَكُمْ ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ",
            translation:
              "He said, 'No blame upon you today. Allah will forgive you; and He is the most merciful of the merciful.'",
            reference: "Quran 12:92",
          },
        ],
        hadith: [
          {
            text:
              "The Prophet ﷺ said: ‘The honourable, the son of the honourable, the son of the honourable, the son of the honourable — Yusuf, the son of Yaqub, the son of Ishaq, the son of Ibrahim.’",
            source: "Bukhari 60:56; 60:64",
          },
        ],
      },
    ],
    lessons: [
      "Allah's plan unfolds over years and decades — patience and trust are essential",
      "Resisting temptation, even at great personal cost, is the mark of true faith",
      "Forgiveness is more powerful than revenge",
      "Every trial is a stepping stone — the well, the palace, the prison all led to power",
      "Dreams can be a form of divine communication",
    ],
    references: [
      "Quran: Surah Yusuf (12) — the entire surah is devoted to his story",
      "Ibn Kathir, Qasas al-Anbiya",
      "Tafsir Ibn Kathir, Surah Yusuf",
    ],
  },

  ayyub: {
    slug: "ayyub",
    title: "Prophet Ayyub (Job) — The Epitome of Patience",
    sections: [
      {
        title: "A Life of Blessings",
        content:
          "Ayyub was a wealthy and righteous man who had abundant health, family, and wealth. He was grateful to Allah in prosperity and used his blessings to help others. His life was a testament to how a believer should live during times of ease.",
      },
      {
        title: "The Great Trial",
        content:
          "Allah tested Ayyub with the loss of his wealth, his children, and his health. A severe illness afflicted his body for years, causing everyone except his faithful wife to abandon him. Despite his immense suffering, Ayyub never complained or questioned Allah's wisdom. He remained patient and continued to worship Allah.",
        verses: [
          {
            arabic: "وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
            translation:
              "And [mention] Ayyub, when he called to his Lord, 'Indeed, adversity has touched me, and You are the most merciful of the merciful.'",
            reference: "Quran 21:83",
          },
        ],
      },
      {
        title: "Restoration",
        content:
          "After years of patient endurance, Ayyub was commanded by Allah to strike the ground with his foot, from which a cool spring emerged for washing and drinking, curing his ailments. Allah restored his health, returned his family to him (doubling their number), and gave him back his wealth as a reward for his patience.",
        verses: [
          {
            arabic: "ارْكُضْ بِرِجْلِكَ ۖ هَٰذَا مُغْتَسَلٌ بَارِدٌ وَشَرَابٌ",
            translation:
              "'Strike [the ground] with your foot; this is a [spring for a] cool bath and drink.'",
            reference: "Quran 38:42",
          },
          {
            arabic: "وَوَهَبْنَا لَهُ أَهْلَهُ وَمِثْلَهُم مَّعَهُمْ رَحْمَةً مِّنَّا وَذِكْرَىٰ لِأُولِي الْأَلْبَابِ",
            translation:
              "And We gave him [back] his family and the like thereof with them as mercy from Us and a reminder for those of understanding.",
            reference: "Quran 38:43",
          },
        ],
      },
    ],
    lessons: [
      "True patience is maintaining faith and gratitude through the worst of trials",
      "Allah tests those He loves to elevate their rank",
      "After hardship comes ease — Allah's relief may come when least expected",
      "A supportive spouse is one of Allah's greatest blessings",
    ],
    references: [
      "Quran: Surah Al-Anbiya (21:83-84), Sad (38:41-44), An-Nisa (4:163)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  shuayb: {
    slug: "shuayb",
    title: "Prophet Shuayb — Orator of the Prophets",
    sections: [
      {
        title: "Sent to the People of Madyan",
        content:
          "Shuayb was sent to the people of Madyan (Midian), a trading community near modern-day northwest Arabia. They were guilty of cheating in their measurements and scales, hoarding wealth through dishonest trade, and obstructing travelers. Shuayb was known for his exceptional eloquence, earning him the title 'Orator of the Prophets.'",
        verses: [
          {
            arabic: "وَإِلَىٰ مَدْيَنَ أَخَاهُمْ شُعَيْبًا ۗ قَالَ يَا قَوْمِ اعْبُدُوا اللَّهَ مَا لَكُم مِّنْ إِلَٰهٍ غَيْرُهُ ۖ وَلَا تَنقُصُوا الْمِكْيَالَ وَالْمِيزَانَ",
            translation:
              "And to Madyan [We sent] their brother Shuayb. He said, 'O my people, worship Allah; you have no deity other than Him. And do not decrease from the measure and the scale.'",
            reference: "Quran 11:84",
          },
        ],
      },
      {
        title: "Economic Justice",
        content:
          "Shuayb's message uniquely emphasized economic ethics alongside monotheism. He commanded fair dealing, honest weights and measures, and warned against corruption in business. His call demonstrates that Islam addresses all aspects of life, including commerce and social justice.",
        verses: [
          {
            arabic: "وَيَا قَوْمِ أَوْفُوا الْمِكْيَالَ وَالْمِيزَانَ بِالْقِسْطِ ۖ وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ",
            translation:
              "And O my people, give full measure and weight in justice and do not deprive the people of their due.",
            reference: "Quran 11:85",
          },
        ],
      },
      {
        title: "Destruction of Madyan",
        content:
          "When the people rejected Shuayb and threatened to expel him, Allah destroyed them with an earthquake and a blast from the sky. They were found dead in their homes, as if they had never lived there.",
        verses: [
          {
            arabic: "فَأَخَذَتْهُمُ الرَّجْفَةُ فَأَصْبَحُوا فِي دَارِهِمْ جَاثِمِينَ",
            translation:
              "So the earthquake seized them, and they became within their homes corpses fallen prone.",
            reference: "Quran 7:91",
          },
        ],
      },
    ],
    lessons: [
      "Honesty in business dealings is a religious obligation, not just good practice",
      "Economic corruption is a form of oppression that invites divine punishment",
      "Eloquence in conveying the truth is a gift from Allah",
    ],
    references: [
      "Quran: Surah Hud (11:84-95), Al-A'raf (7:85-93), Ash-Shu'ara (26:176-191), Al-Ankabut (29:36-37)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  musa: {
    slug: "musa",
    title: "Prophet Musa (Moses) — Kalimullah, The One Who Spoke to Allah",
    sections: [
      {
        title: "Birth Under Tyranny",
        content:
          "Musa was born during Pharaoh's campaign to kill all Israelite male children. His mother, inspired by Allah, placed him in a basket and set him adrift on the Nile. By divine decree, Pharaoh's own household found and raised him, fulfilling Allah's plan to raise the instrument of Pharaoh's downfall within his own palace.",
        verses: [
          {
            arabic: "وَأَوْحَيْنَا إِلَىٰ أُمِّ مُوسَىٰ أَنْ أَرْضِعِيهِ ۖ فَإِذَا خِفْتِ عَلَيْهِ فَأَلْقِيهِ فِي الْيَمِّ وَلَا تَخَافِي وَلَا تَحْزَنِي",
            translation:
              "And We inspired the mother of Musa, 'Nurse him; but when you fear for him, cast him into the river and do not fear and do not grieve.'",
            reference: "Quran 28:7",
          },
        ],
      },
      {
        title: "Escape to Madyan",
        content:
          "As a young man, Musa accidentally killed an Egyptian who was oppressing an Israelite. Fearing retribution, he fled to Madyan, where he helped two women water their flock and was taken in by their father (identified by many scholars as Shuayb). He married one of the daughters and lived there for years.",
        verses: [
          {
            arabic: "وَلَمَّا تَوَجَّهَ تِلْقَاءَ مَدْيَنَ قَالَ عَسَىٰ رَبِّي أَن يَهْدِيَنِي سَوَاءَ السَّبِيلِ",
            translation:
              "And when he directed himself toward Madyan, he said, 'Perhaps my Lord will guide me to the right way.'",
            reference: "Quran 28:22",
          },
        ],
      },
      {
        title: "The Burning Bush & Divine Commission",
        content:
          "While traveling with his family, Musa saw a fire on Mount Tur (Sinai). When he approached, Allah spoke to him directly — making Musa unique among prophets as 'Kalimullah' (the one who spoke with Allah). He was given his staff as a miraculous sign and his hand that glowed with white light, and was commanded to go to Pharaoh.",
        verses: [
          {
            arabic: "إِنِّي أَنَا رَبُّكَ فَاخْلَعْ نَعْلَيْكَ ۖ إِنَّكَ بِالْوَادِ الْمُقَدَّسِ طُوًى",
            translation:
              "Indeed, I am your Lord, so remove your sandals. Indeed, you are in the sacred valley of Tuwa.",
            reference: "Quran 20:12",
          },
          {
            arabic: "قَالَ رَبِّ ٱشْرَحْ لِى صَدْرِى",
            translation:
              "He said, “My Lord, reassure my heart for me,",
            reference: "Quran 20:25",
          },
          {
            arabic: "وَيَسِّرْ لِىٓ أَمْرِى",
            translation:
              "and ease my task for me,",
            reference: "Quran 20:26",
          },
          {
            arabic: "وَٱحْلُلْ عُقْدَةً مِّن لِّسَانِى",
            translation:
              "and loosen the knot from my tongue,",
            reference: "Quran 20:27",
          },
          {
            arabic: "يَفْقَهُوا۟ قَوْلِى",
            translation:
              "so that they may understand my speech.",
            reference: "Quran 20:28",
          },
        ],
      },
      {
        title: "Confronting Pharaoh",
        content:
          "Musa and his brother Harun went to Pharaoh with Allah's message, showing him clear signs. Pharaoh, who claimed divinity, rejected the message and called Musa a madman and sorcerer. Allah sent nine signs upon Egypt — including the flood, locusts, lice, frogs, and blood — but Pharaoh's heart remained hardened.",
        verses: [
          {
            arabic: "فَأَرْسَلْنَا عَلَيْهِمُ الطُّوفَانَ وَالْجَرَادَ وَالْقُمَّلَ وَالضَّفَادِعَ وَالدَّمَ آيَاتٍ مُّفَصَّلَاتٍ",
            translation:
              "So We sent upon them the flood and locusts and lice and frogs and blood as distinct signs.",
            reference: "Quran 7:133",
          },
        ],
      },
      {
        title: "The Parting of the Sea",
        content:
          "When Pharaoh finally allowed the Israelites to leave, he then pursued them with his army. Trapped between the sea and the approaching army, the Israelites despaired. But Musa struck the sea with his staff, and Allah split it into two towering walls of water, creating a dry path. The Israelites crossed safely, and when Pharaoh's army followed, the sea closed upon them.",
        verses: [
          {
            arabic: "فَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنِ اضْرِب بِّعَصَاكَ الْبَحْرَ ۖ فَانفَلَقَ فَكَانَ كُلُّ فِرْقٍ كَالطَّوْدِ الْعَظِيمِ",
            translation:
              "Then We inspired to Musa, 'Strike with your staff the sea,' and it parted, and each portion was like a great towering mountain.",
            reference: "Quran 26:63",
          },
        ],
      },
      {
        title: "Receiving the Torah on Mount Sinai",
        content:
          "After the exodus, Musa went to Mount Sinai for forty days to receive the Torah (Tawrat) from Allah. During his absence, a man named Samiri led the Israelites astray by constructing a golden calf for worship. Musa returned to find his people in idolatry, was deeply angered, and destroyed the calf.",
        verses: [
          {
            arabic: "وَوَاعَدْنَا مُوسَىٰ ثَلَاثِينَ لَيْلَةً وَأَتْمَمْنَاهَا بِعَشْرٍ فَتَمَّ مِيقَاتُ رَبِّهِ أَرْبَعِينَ لَيْلَةً",
            translation:
              "And We made an appointment with Musa for thirty nights and perfected them by [the addition of] ten; so the term of his Lord was completed as forty nights.",
            reference: "Quran 7:142",
          },
        ],
      },
      {
        title: "The Cow of Bani Israel",
        content:
          "A man among the Israelites was murdered and his killers concealed the crime. Through Musa, Allah commanded the people to slaughter a cow. Instead of simply obeying, they interrogated Musa again and again about its age, colour and condition — making the command harder upon themselves — until they finally slaughtered it. When they struck the dead man with a piece of it, Allah restored him to life to name his killer: a living proof of the resurrection. This episode gives Surah Al-Baqarah (‘The Cow’) its name.",
        verses: [
          {
            arabic: "وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِۦٓ إِنَّ ٱللَّهَ يَأْمُرُكُمْ أَن تَذْبَحُوا۟ بَقَرَةً ۖ قَالُوٓا۟ أَتَتَّخِذُنَا هُزُوًا ۖ قَالَ أَعُوذُ بِٱللَّهِ أَنْ أَكُونَ مِنَ ٱلْجَـٰهِلِينَ",
            translation:
              "And [remember] when Moses said to his people, “Allah commands you to slaughter a cow.” They said, “Are you mocking us?” Moses said, “I seek refuge in Allah from being among the ignorant!”",
            reference: "Quran 2:67",
          },
          {
            arabic: "فَقُلْنَا ٱضْرِبُوهُ بِبَعْضِهَا ۚ كَذَٰلِكَ يُحْىِ ٱللَّهُ ٱلْمَوْتَىٰ وَيُرِيكُمْ ءَايَـٰتِهِۦ لَعَلَّكُمْ تَعْقِلُونَ",
            translation:
              "We said, “Strike the slain with a piece of it.” This is how Allah brings the dead to life and shows you His signs, so that you may understand.",
            reference: "Quran 2:73",
          },
        ],
      },
      {
        title: "The Journey with Al-Khidr",
        content:
          "When Musa was asked whether anyone was more knowledgeable than him and answered no, Allah corrected him and directed him to a servant at the junction of the two seas — Al-Khidr — who had been given knowledge Musa did not possess. Musa travelled to learn from him and witnessed three baffling acts: Al-Khidr damaged a ship, took the life of a boy, and rebuilt a collapsing wall without pay. Unable to restrain his objections, Musa parted from him, but not before Al-Khidr revealed the hidden mercy and wisdom behind each act. The story is a lesson in humility before Allah’s greater knowledge.",
        verses: [
          {
            arabic: "وَإِذْ قَالَ مُوسَىٰ لِفَتَىٰهُ لَآ أَبْرَحُ حَتَّىٰٓ أَبْلُغَ مَجْمَعَ ٱلْبَحْرَيْنِ أَوْ أَمْضِىَ حُقُبًا",
            translation:
              "And [remember] when Moses said to his servant, “I will not give up until I reach the junction of the two seas, or I travel for ages.”",
            reference: "Quran 18:60",
          },
          {
            arabic: "فَوَجَدَا عَبْدًا مِّنْ عِبَادِنَآ ءَاتَيْنَـٰهُ رَحْمَةً مِّنْ عِندِنَا وَعَلَّمْنَـٰهُ مِن لَّدُنَّا عِلْمًا",
            translation:
              "There they found one of Our slaves upon whom We bestowed Our mercy and We taught him from Our Own knowledge.",
            reference: "Quran 18:65",
          },
        ],
        hadith: [
          {
            text:
              "Ibn ‘Abbas asked Ubai ibn Ka‘b about the companion of Musa. Ubai reported that the Prophet ﷺ said: a man once asked Musa if anyone was more learned than him, and Musa said no; so Allah revealed that His slave Al-Khidr was more learned, and made a fish the sign of their meeting place.",
            source: "Bukhari 3:16; 3:20",
          },
        ],
      },
      {
        title: "Qarun and His Treasure",
        content:
          "Qarun was a man of Musa’s own people whom Allah had blessed with treasures so vast that their very keys would weigh down a band of strong men. He grew arrogant, insisting his wealth was owed to his own knowledge, and paraded his splendour before the people. When he refused gratitude and correction, Allah caused the earth to swallow him and his house — and no party could help him against Allah. Qarun became a byword for wealth that breeds tyranny.",
        verses: [
          {
            arabic: "۞ إِنَّ قَـٰرُونَ كَانَ مِن قَوْمِ مُوسَىٰ فَبَغَىٰ عَلَيْهِمْ ۖ وَءَاتَيْنَـٰهُ مِنَ ٱلْكُنُوزِ مَآ إِنَّ مَفَاتِحَهُۥ لَتَنُوٓأُ بِٱلْعُصْبَةِ أُو۟لِى ٱلْقُوَّةِ إِذْ قَالَ لَهُۥ قَوْمُهُۥ لَا تَفْرَحْ ۖ إِنَّ ٱللَّهَ لَا يُحِبُّ ٱلْفَرِحِينَ",
            translation:
              "Indeed, Korah was one of the people of Moses, but he behaved arrogantly towards them. We had given him such treasures that their keys would weigh down a group of strong men. When his people said to him, “Do not exult, for Allah does not like the exultant.",
            reference: "Quran 28:76",
          },
          {
            arabic: "قَالَ إِنَّمَآ أُوتِيتُهُۥ عَلَىٰ عِلْمٍ عِندِىٓ ۚ أَوَلَمْ يَعْلَمْ أَنَّ ٱللَّهَ قَدْ أَهْلَكَ مِن قَبْلِهِۦ مِنَ ٱلْقُرُونِ مَنْ هُوَ أَشَدُّ مِنْهُ قُوَّةً وَأَكْثَرُ جَمْعًا ۚ وَلَا يُسْـَٔلُ عَن ذُنُوبِهِمُ ٱلْمُجْرِمُونَ",
            translation:
              "He said, “I have been given all this because of the knowledge that I have.” Did he not know that Allah destroyed some generations before him who were superior to him in power and greater in accumulating [wealth]? There will be no need for the wicked to be asked about their sins.",
            reference: "Quran 28:78",
          },
          {
            arabic: "فَخَسَفْنَا بِهِۦ وَبِدَارِهِ ٱلْأَرْضَ فَمَا كَانَ لَهُۥ مِن فِئَةٍ يَنصُرُونَهُۥ مِن دُونِ ٱللَّهِ وَمَا كَانَ مِنَ ٱلْمُنتَصِرِينَ",
            translation:
              "Then We caused the earth to swallow him and his house. There was no one to help him against Allah, nor was he able to help himself.",
            reference: "Quran 28:81",
          },
        ],
      },
      {
        title: "The Death of Musa",
        content:
          "Near the end of his life, when the Angel of Death came to Musa, Musa struck him. The angel returned to Allah, Who sent him back with an offer: for every hair his hand would cover on the back of an ox, a year of added life. Learning that death would still follow, Musa asked to die at once — praying to be brought near the Holy Land. The Prophet ﷺ said that were he there, he would show Musa’s grave by the roadside near the red sand hill.",
        hadith: [
          {
            text:
              "The Prophet ﷺ said that the Angel of Death was sent to Musa, and Musa struck him. The angel returned to his Lord, Who sent him back offering a year of life for every hair his hand covered on an ox’s back. Learning death would still come, Musa asked to die then, near the Holy Land.",
            source: "Bukhari 60:80",
          },
        ],
      },
    ],
    lessons: [
      "Allah's plan can use the oppressor's own household to bring about justice",
      "True courage is confronting tyranny with truth, not with matching force",
      "Leadership requires patience — the people you lead will test you constantly",
      "Allah speaks directly to whom He wills — closeness to Allah is the greatest honor",
      "Miracles are from Allah, not from the prophet himself",
    ],
    references: [
      "Quran: Surah Al-Baqarah (2:49-73), Al-A'raf (7:103-171), Taha (20:9-98), Al-Qasas (28:1-46), Ash-Shu'ara (26:10-68), An-Naziat (79:15-26)",
      "Bukhari 60:80 — Musa and the Angel of Death",
      "Muslim 1:321 — Night Journey, Musa in the sixth heaven",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  harun: {
    slug: "harun",
    title: "Prophet Harun (Aaron) — The Eloquent Brother",
    sections: [
      {
        title: "Appointed as Musa's Support",
        content:
          "When Musa was commanded to confront Pharaoh, he asked Allah to appoint his brother Harun as his helper, citing Harun's greater eloquence. Allah granted this request, making Harun a prophet and partner in the mission. This highlights the Islamic principle that seeking help is a sign of wisdom, not weakness.",
        verses: [
          {
            arabic: "وَأَخِي هَارُونُ هُوَ أَفْصَحُ مِنِّي لِسَانًا فَأَرْسِلْهُ مَعِيَ رِدْءًا يُصَدِّقُنِي",
            translation:
              "And my brother Harun — he is more fluent than me in tongue, so send him with me as support, verifying me.",
            reference: "Quran 28:34",
          },
        ],
      },
      {
        title: "During Musa's Absence",
        content:
          "When Musa went to Mount Sinai for forty days, he left Harun in charge of the Israelites. During this time, Samiri misled the people into worshipping a golden calf. Harun tried to stop them but was overpowered by the majority. When Musa returned and rebuked him, Harun explained that the people had nearly killed him and he feared causing division.",
        verses: [
          {
            arabic: "قَالَ ابْنَ أُمَّ إِنَّ الْقَوْمَ اسْتَضْعَفُونِي وَكَادُوا يَقْتُلُونَنِي",
            translation:
              "He said, 'O son of my mother, indeed the people overpowered me and were about to kill me.'",
            reference: "Quran 7:150",
          },
        ],
      },
      {
        title: "A Beloved Prophet",
        content:
          "The Prophet Muhammad ﷺ spoke of Harun with great respect, once telling Ali ibn Abi Talib, 'You are to me as Harun was to Musa, except that there is no prophet after me.' Harun was beloved by the Israelites for his gentle and compassionate nature.",
        hadith: [
          {
            text: "The Prophet ﷺ said to Ali: 'You are to me as Harun was to Musa, except that there is no prophet after me.'",
            source: "Bukhari 62:56, Muslim 44:47",
          },
        ],
      },
    ],
    lessons: [
      "Seeking help and delegation is prophetic wisdom, not weakness",
      "Gentle leadership is valuable — not every leader needs to be stern",
      "Standing for truth when outnumbered requires immense courage",
    ],
    references: [
      "Quran: Surah Taha (20:29-36, 90-94), Al-A'raf (7:142, 150-151), Al-Qasas (28:33-35)",
      "Bukhari 62:56, Muslim 44:47",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  yusha: {
    slug: "yusha",
    title: "Prophet Yusha ibn Nun (Joshua) — Successor of Musa",
    sections: [
      {
        title: "The Young Companion",
        content:
          "Yusha ibn Nun served as the devoted young companion of Musa. He accompanied Musa on the journey to meet Khidr, as mentioned in Surah Al-Kahf. His dedication and service to Musa prepared him for the great responsibility that would follow.",
        verses: [
          {
            arabic: "وَإِذْ قَالَ مُوسَىٰ لِفَتَاهُ لَا أَبْرَحُ حَتَّىٰ أَبْلُغَ مَجْمَعَ الْبَحْرَيْنِ",
            translation:
              "And [mention] when Musa said to his young companion, 'I will not cease [traveling] until I reach the junction of the two seas.'",
            reference: "Quran 18:60",
          },
        ],
        hadith: [
          {
            text: "The Prophet ﷺ identified the young companion (fata) of Musa as Yusha ibn Nun.",
            source: "Bukhari 60:74",
          },
        ],
      },
      {
        title: "Leading the Israelites",
        content:
          "After Musa's death, Yusha ibn Nun took on the responsibility of leading the Israelites into the Holy Land. He was among the few who had remained faithful when the majority of Israelites had refused to enter the land, fearing its powerful inhabitants. Under his leadership, they finally entered and established themselves there.",
        hadith: [
          {
            text: "The Prophet ﷺ told of a prophet who, setting out on campaign, asked Allah to hold the sun back for him — and it was held back until Allah granted him victory. A separate narration names him outright: 'The sun was never held back for any human being except for Yusha, on the nights he marched towards Bayt al-Maqdis.'",
            source: "Muslim 32:36; Musnad Ahmad 8315 (isnad sahih on al-Bukhari's criterion — al-Arna'ut; also authenticated by al-Albani, as-Silsilah as-Sahihah) — not in this app's local collection",
          },
        ],
      },
    ],
    lessons: [
      "Serving and learning from a mentor prepares one for great responsibilities",
      "Courage and faith in Allah's promise are essential for achieving great goals",
      "Leadership falls to those who remain steadfast when others waver",
    ],
    references: [
      "Quran 18:60-65 — identified as the young companion of Musa",
      "Bukhari 60:74",
      "Muslim 32:36",
      "Musnad Ahmad 8315 — names Yusha explicitly; isnad sahih on al-Bukhari's criterion (al-Arna'ut); not in this app's local collection",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  "dhul-kifl": {
    slug: "dhul-kifl",
    title: "Prophet Dhul-Kifl — The One Who Fulfilled",
    sections: [
      {
        title: "Mentioned Among the Righteous",
        content:
          "Dhul-Kifl is mentioned twice in the Quran, praised alongside great prophets for his patience and righteousness. His name means 'the one of the portion' or 'the one who fulfilled his pledge.' Scholars have differed on his identity — some say he was Ezekiel (Hizqil), others say he was Bishr ibn Ayyub (a son of Prophet Ayyub), and others consider him a righteous man who was not a prophet.",
        verses: [
          {
            arabic: "وَإِسْمَاعِيلَ وَإِدْرِيسَ وَذَا الْكِفْلِ ۖ كُلٌّ مِّنَ الصَّابِرِينَ * وَأَدْخَلْنَاهُمْ فِي رَحْمَتِنَا ۖ إِنَّهُم مِّنَ الصَّالِحِينَ",
            translation:
              "And [mention] Ismail, Idris, and Dhul-Kifl — all were of the patient. And We admitted them into Our mercy. Indeed, they were of the righteous.",
            reference: "Quran 21:85-86",
          },
        ],
      },
      {
        title: "The Fulfillment of Duty",
        content:
          "According to some narrations, Dhul-Kifl earned his title by taking on the responsibility (kifl) of a predecessor, pledging to fast every day, pray all night, and judge between people with justice. He fulfilled this pledge perfectly, demonstrating that keeping one's covenant with Allah is a hallmark of prophethood.",
        verses: [
          {
            arabic: "وَاذْكُرْ إِسْمَاعِيلَ وَالْيَسَعَ وَذَا الْكِفْلِ ۖ وَكُلٌّ مِّنَ الْأَخْيَارِ",
            translation:
              "And remember Ismail, Al-Yasa, and Dhul-Kifl — and all are among the outstanding.",
            reference: "Quran 38:48",
          },
        ],
      },
    ],
    lessons: [
      "Fulfilling one's commitments and pledges is a defining quality of the righteous",
      "Patience and steadfastness are mentioned alongside prophethood as the highest virtues",
      "Not all details of every prophet's life have been preserved — what matters is the lesson",
    ],
    references: [
      "Quran: Surah Al-Anbiya (21:85-86), Sad (38:48)",
      "Ibn Kathir, Qasas al-Anbiya — discussion of scholarly opinions on his identity",
      "Tafsir al-Tabari on Quran 21:85",
    ],
  },

  dawud: {
    slug: "dawud",
    title: "Prophet Dawud (David) — King, Prophet, and Psalmist",
    sections: [
      {
        title: "Defeating Jalut (Goliath)",
        content:
          "As a young man in the army of Talut (Saul), Dawud faced the giant warrior Jalut (Goliath) when others feared to fight. With Allah's permission, Dawud killed Jalut, demonstrating that victory comes from Allah, not from physical strength or numbers. This victory earned him great honor among the Israelites.",
        verses: [
          {
            arabic: "فَهَزَمُوهُم بِإِذْنِ اللَّهِ وَقَتَلَ دَاوُودُ جَالُوتَ وَآتَاهُ اللَّهُ الْمُلْكَ وَالْحِكْمَةَ",
            translation:
              "So they defeated them by permission of Allah, and Dawud killed Jalut, and Allah gave him the kingship and wisdom.",
            reference: "Quran 2:251",
          },
        ],
      },
      {
        title: "The Zabur (Psalms)",
        content:
          "Allah gave Dawud the Zabur (Psalms), a scripture of praise, wisdom, and prayer. He was blessed with an extraordinarily beautiful voice — when he recited the Zabur, the mountains and birds would join him in glorifying Allah. Iron was made soft in his hands, allowing him to craft armor.",
        verses: [
          {
            arabic: "وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا فَضْلًا ۖ يَا جِبَالُ أَوِّبِي مَعَهُ وَالطَّيْرَ ۖ وَأَلَنَّا لَهُ الْحَدِيدَ",
            translation:
              "And We certainly gave Dawud from Us bounty. [We said], 'O mountains, repeat [Our] praises with him, and the birds [as well].' And We made pliable for him iron.",
            reference: "Quran 34:10",
          },
        ],
      },
      {
        title: "Just Ruler",
        content:
          "Dawud combined prophethood with kingship, ruling with justice and wisdom. He is praised in the Quran as one who turned to Allah frequently. He would fast every other day, which the Prophet Muhammad ﷺ described as the most beloved fasting to Allah.",
        hadith: [
          {
            text: "The Prophet ﷺ said: 'The most beloved fasting to Allah is the fasting of Dawud — he would fast one day and not fast the next.'",
            source: "Bukhari 19:11, Muslim 13:246",
          },
        ],
      },
      {
        title: "A Living Sunnah — the Fast and Night Prayer of Dawud",
        content:
          "Dawud’s worship remains a practical model a Muslim can adopt today. He fasted every other day, which the Prophet ﷺ called the most beloved fasting to Allah and the most balanced of fasts. He also divided his night: sleeping half, praying a third, and sleeping a sixth — which the Prophet ﷺ named the most beloved prayer to Allah. Rather than exhaust oneself, the sunnah of Dawud teaches steady, sustainable devotion. (See the fasting guidance in /salah and Muslim daily worship.)",
        hadith: [
          {
            text:
              "The Prophet ﷺ said: ‘The most beloved prayer to Allah is the prayer of Dawud, and the most beloved fasting to Allah is the fasting of Dawud. He used to sleep half the night, pray a third, then sleep a sixth, and he would fast one day and not the next.’",
            source: "Bukhari 19:11",
          },
          {
            text:
              "When Abdullah ibn Amr wished to fast every day and pray all night, the Prophet ﷺ directed him: ‘Fast like the fasting of Dawud — fast one day and not the next — and do not exceed it.’",
            source: "Bukhari 30:81; 30:86",
          },
        ],
      },
      {
        title: "The Two Disputants",
        content:
          "Two men climbed the wall of Dawud’s prayer chamber, startling him, and asked him to judge between them: one had ninety-nine ewes yet coveted his brother’s single ewe. Dawud ruled at once that the man had been wronged — then realised Allah was testing him over haste in judgment, and fell down in prostration seeking forgiveness. Allah forgave him and reaffirmed the trust of just rule. (The Bathsheba tale found in earlier scriptures is a later fabrication that Islam rejects; the Quran’s test concerns only hastiness in judging.)",
        verses: [
          {
            arabic: "إِذْ دَخَلُوا۟ عَلَىٰ دَاوُۥدَ فَفَزِعَ مِنْهُمْ ۖ قَالُوا۟ لَا تَخَفْ ۖ خَصْمَانِ بَغَىٰ بَعْضُنَا عَلَىٰ بَعْضٍ فَٱحْكُم بَيْنَنَا بِٱلْحَقِّ وَلَا تُشْطِطْ وَٱهْدِنَآ إِلَىٰ سَوَآءِ ٱلصِّرَٰطِ",
            translation:
              "When they entered upon David, he was frightened. They said, “Do not be afraid. We are two adversaries: one of us has wronged the other, so judge between us with fairness, and do not be unjust, and guide us to the straight path.",
            reference: "Quran 38:22",
          },
          {
            arabic: "قَالَ لَقَدْ ظَلَمَكَ بِسُؤَالِ نَعْجَتِكَ إِلَىٰ نِعَاجِهِۦ ۖ وَإِنَّ كَثِيرًا مِّنَ ٱلْخُلَطَآءِ لَيَبْغِى بَعْضُهُمْ عَلَىٰ بَعْضٍ إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ وَقَلِيلٌ مَّا هُمْ ۗ وَظَنَّ دَاوُۥدُ أَنَّمَا فَتَنَّـٰهُ فَٱسْتَغْفَرَ رَبَّهُۥ وَخَرَّ رَاكِعًا وَأَنَابَ ۩",
            translation:
              "David said, “He has certainly wronged you by demanding that your ewe be added to his flock. Indeed, many partners oppress one another, except those who believe and do righteous deeds – and how few they are.” Then David realized that We were only testing him, so he asked his Lord for forgiveness, fell down in prostration, and turned to Him in repentance.",
            reference: "Quran 38:24",
          },
          {
            arabic: "يَـٰدَاوُۥدُ إِنَّا جَعَلْنَـٰكَ خَلِيفَةً فِى ٱلْأَرْضِ فَٱحْكُم بَيْنَ ٱلنَّاسِ بِٱلْحَقِّ وَلَا تَتَّبِعِ ٱلْهَوَىٰ فَيُضِلَّكَ عَن سَبِيلِ ٱللَّهِ ۚ إِنَّ ٱلَّذِينَ يَضِلُّونَ عَن سَبِيلِ ٱللَّهِ لَهُمْ عَذَابٌ شَدِيدٌۢ بِمَا نَسُوا۟ يَوْمَ ٱلْحِسَابِ",
            translation:
              "“O David, We have made you a ruler on earth, so judge between people with justice, and do not follow your desires lest they lead you astray from Allah’s way. Those who go astray from Allah’s way will have a severe punishment because of their forgetting the Day of Reckoning.”",
            reference: "Quran 38:26",
          },
        ],
      },
    ],
    lessons: [
      "True power comes from Allah, not from physical might",
      "Combining worship with worldly responsibility is the prophetic model",
      "Justice in leadership is a sacred trust",
      "Praising and remembering Allah should permeate all aspects of life",
    ],
    references: [
      "Quran: Surah Al-Baqarah (2:249-252), Sad (38:17-26), Saba (34:10-11), Al-Anbiya (21:78-80)",
      "Bukhari 19:11, Muslim 13:246",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  sulayman: {
    slug: "sulayman",
    title: "Prophet Sulayman (Solomon) — Kingdom Like No Other",
    sections: [
      {
        title: "Dominion Over Creation",
        content:
          "Sulayman, son of Dawud, was given a kingdom unlike any before or after. Allah subjected the wind, the jinn, and animals to his command. He could understand the speech of birds and ants, and commanded armies of humans, jinn, and birds. Despite this unparalleled power, he remained a devout servant of Allah.",
        verses: [
          {
            arabic: "قَالَ رَبِّ اغْفِرْ لِي وَهَبْ لِي مُلْكًا لَّا يَنبَغِي لِأَحَدٍ مِّن بَعْدِي ۖ إِنَّكَ أَنتَ الْوَهَّابُ",
            translation:
              "He said, 'My Lord, forgive me and grant me a kingdom such as will not belong to anyone after me. Indeed, You are the Bestower.'",
            reference: "Quran 38:35",
          },
        ],
      },
      {
        title: "The Ant and the Hoopoe",
        content:
          "While marching with his armies, Sulayman heard an ant warning its colony to enter their dwellings lest Sulayman's armies crush them unknowingly. Sulayman smiled and prayed for gratitude. He also discovered that the hoopoe bird was absent from his army and later learned it had found the Queen of Sheba (Bilqis), who ruled a kingdom that worshipped the sun.",
        verses: [
          {
            arabic: "قَالَتْ نَمْلَةٌ يَا أَيُّهَا النَّمْلُ ادْخُلُوا مَسَاكِنَكُمْ لَا يَحْطِمَنَّكُمْ سُلَيْمَانُ وَجُنُودُهُ وَهُمْ لَا يَشْعُرُونَ",
            translation:
              "An ant said, 'O ants, enter your dwellings that you not be crushed by Sulayman and his soldiers while they perceive not.'",
            reference: "Quran 27:18",
          },
        ],
      },
      {
        title: "The Queen of Sheba",
        content:
          "Sulayman invited Queen Bilqis to submit to Allah. He demonstrated his God-given power by having her throne transported to his palace before her arrival. When she visited and saw the crystal floor that appeared to be water, she recognized the truth and submitted to Allah, abandoning sun worship.",
        verses: [
          {
            arabic: "قَالَتْ رَبِّ إِنِّي ظَلَمْتُ نَفْسِي وَأَسْلَمْتُ مَعَ سُلَيْمَانَ لِلَّهِ رَبِّ الْعَالَمِينَ",
            translation:
              "She said, 'My Lord, indeed I have wronged myself, and I submit with Sulayman to Allah, Lord of the worlds.'",
            reference: "Quran 27:44",
          },
        ],
      },
      {
        title: "Death and the Jinn",
        content:
          "Sulayman died while leaning on his staff, and the jinn who were working for him did not realize he had died until a creature of the earth (a termite) ate through the staff and his body fell. This revealed that the jinn did not possess knowledge of the unseen, as they continued working under the assumption he was alive.",
        verses: [
          {
            arabic: "فَلَمَّا قَضَيْنَا عَلَيْهِ الْمَوْتَ مَا دَلَّهُمْ عَلَىٰ مَوْتِهِ إِلَّا دَابَّةُ الْأَرْضِ تَأْكُلُ مِنسَأَتَهُ",
            translation:
              "And when We decreed for him death, nothing indicated to them his death except a creature of the earth eating his staff.",
            reference: "Quran 34:14",
          },
        ],
      },
    ],
    lessons: [
      "Power and wealth are tests — they can be used for good or lead to arrogance",
      "Gratitude to Allah must increase with every blessing",
      "Knowledge of the unseen belongs to Allah alone — even the jinn are limited",
      "Da'wah can use wisdom and demonstration, not just words",
    ],
    references: [
      "Quran: Surah An-Naml (27:15-44), Saba (34:12-14), Sad (38:30-40), Al-Anbiya (21:81-82)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  ilyas: {
    slug: "ilyas",
    title: "Prophet Ilyas (Elijah) — Against the Idol Ba'l",
    sections: [
      {
        title: "Calling Bani Israel Back",
        content:
          "Ilyas was sent to the people of Baalbek (in modern-day Lebanon) who had begun worshipping an idol called Ba'l while abandoning Allah. He courageously confronted them, calling them to return to the worship of Allah alone.",
        verses: [
          {
            arabic: "وَإِنَّ إِلْيَاسَ لَمِنَ الْمُرْسَلِينَ * إِذْ قَالَ لِقَوْمِهِ أَلَا تَتَّقُونَ * أَتَدْعُونَ بَعْلًا وَتَذَرُونَ أَحْسَنَ الْخَالِقِينَ",
            translation:
              "And indeed, Ilyas was from among the messengers. When he said to his people, 'Will you not fear Allah? Do you call upon Ba'l and leave the best of creators?'",
            reference: "Quran 37:123-125",
          },
        ],
      },
      {
        title: "Rejection and Legacy",
        content:
          "The majority of his people rejected him, and only a few believed. Despite this, Allah praised him and granted peace upon him and his legacy. His steadfastness in the face of widespread idolatry is a model for all who call to truth in hostile environments.",
        verses: [
          {
            arabic: "سَلَامٌ عَلَىٰ إِلْ يَاسِينَ * إِنَّا كَذَٰلِكَ نَجْزِي الْمُحْسِنِينَ",
            translation:
              "Peace upon Ilyas. Indeed, We thus reward the doers of good.",
            reference: "Quran 37:130-131",
          },
        ],
      },
    ],
    lessons: [
      "Naming and confronting specific forms of falsehood is part of prophetic da'wah",
      "Being in the minority does not mean being wrong",
      "Allah honors those who stand for truth regardless of the outcome",
    ],
    references: [
      "Quran: Surah As-Saffat (37:123-132), Al-An'am (6:85)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  "al-yasa": {
    slug: "al-yasa",
    title: "Prophet Al-Yasa (Elisha) — Continuing the Mission",
    sections: [
      {
        title: "Successor of Ilyas",
        content:
          "Al-Yasa continued the mission of Ilyas among the Israelites. He is mentioned in the Quran among the righteous and the outstanding, placed alongside prophets of the highest caliber. While detailed accounts of his life are limited in Islamic sources, his inclusion in the Quran affirms his prophethood and righteousness.",
        verses: [
          {
            arabic: "وَاذْكُرْ إِسْمَاعِيلَ وَالْيَسَعَ وَذَا الْكِفْلِ ۖ وَكُلٌّ مِّنَ الْأَخْيَارِ",
            translation:
              "And remember Ismail, Al-Yasa, and Dhul-Kifl — and all are among the outstanding.",
            reference: "Quran 38:48",
          },
          {
            arabic: "وَإِسْمَاعِيلَ وَالْيَسَعَ وَيُونُسَ وَلُوطًا ۚ وَكُلًّا فَضَّلْنَا عَلَى الْعَالَمِينَ",
            translation:
              "And Ismail, Al-Yasa, Yunus, and Lut — and all [of them] We preferred over the worlds.",
            reference: "Quran 6:86",
          },
        ],
      },
    ],
    lessons: [
      "Not every prophet's detailed story has been preserved, but their righteousness is affirmed",
      "Continuing the work of a predecessor is a noble and essential role",
      "Allah prefers and elevates those who carry His message",
    ],
    references: [
      "Quran: Surah Al-An'am (6:86), Sad (38:48)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  yunus: {
    slug: "yunus",
    title: "Prophet Yunus (Jonah) — The Companion of the Whale",
    sections: [
      {
        title: "Leaving His People",
        content:
          "Yunus was sent to the people of Nineveh (in modern-day Iraq), a city of over 100,000 people. When they rejected his message, Yunus left them in frustration and anger before receiving Allah's permission to do so. He boarded a ship, which was caught in a terrible storm.",
        verses: [
          {
            arabic: "وَإِنَّ يُونُسَ لَمِنَ الْمُرْسَلِينَ * إِذْ أَبَقَ إِلَى الْفُلْكِ الْمَشْحُونِ",
            translation:
              "And indeed, Yunus was among the messengers. When he ran away to the laden ship.",
            reference: "Quran 37:139-140",
          },
        ],
      },
      {
        title: "Swallowed by the Whale",
        content:
          "When the passengers drew lots to lighten the ship's load, Yunus was chosen. He was cast into the sea and swallowed by a great whale. In the darkness of the whale's belly, at the bottom of the sea, at night — three layers of darkness — Yunus called out to Allah with one of the most powerful supplications in the Quran.",
        verses: [
          {
            arabic: "فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
            translation:
              "And he called out within the darknesses, 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.'",
            reference: "Quran 21:87",
          },
        ],
      },
      {
        title: "Salvation and the Repentance of Nineveh",
        content:
          "Allah accepted Yunus's repentance and commanded the whale to cast him ashore. He was weak and ill, and Allah grew a gourd plant to shade and nourish him. Meanwhile, the people of Nineveh — uniquely in Quranic history — collectively repented and believed before the punishment came. Allah spared them.",
        verses: [
          {
            arabic: "فَلَوْلَا كَانَتْ قَرْيَةٌ آمَنَتْ فَنَفَعَهَا إِيمَانُهَا إِلَّا قَوْمَ يُونُسَ لَمَّا آمَنُوا كَشَفْنَا عَنْهُمْ عَذَابَ الْخِزْيِ فِي الْحَيَاةِ الدُّنْيَا",
            translation:
              "Then has there not been a [single] city that believed so its faith benefited it except the people of Yunus? When they believed, We removed from them the punishment of disgrace in worldly life.",
            reference: "Quran 10:98",
          },
        ],
        hadith: [
          {
            text: "The Prophet ﷺ said: 'The supplication of Dhun-Nun (Yunus) when he was in the belly of the whale: La ilaha illa anta, subhanaka, inni kuntu min az-zalimin. No Muslim ever prays to his Lord with these words for anything, but He will answer him.'",
            source: "Tirmidhi 48:136 (graded Sahih)",
          },
        ],
      },
    ],
    lessons: [
      "A prophet must persevere and not abandon his mission without Allah's permission",
      "Sincere repentance is accepted by Allah, no matter the circumstances",
      "The du'a of Yunus is one of the most powerful supplications — effective for any difficulty",
      "An entire community can be saved through collective repentance",
    ],
    references: [
      "Quran: Surah Yunus (10:98), Al-Anbiya (21:87-88), As-Saffat (37:139-148), Al-Qalam (68:48-50)",
      "Tirmidhi 48:136",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  zakariyya: {
    slug: "zakariyya",
    title: "Prophet Zakariyya (Zechariah) — A Prayer Answered in Old Age",
    sections: [
      {
        title: "Guardian of Maryam",
        content:
          "Zakariyya was a righteous priest and prophet among the Israelites who was appointed as the guardian of Maryam (Mary), the mother of Isa. He would find her provided with food from Allah whenever he visited her prayer chamber. Witnessing this miracle inspired him to make his own supplication for a child.",
        verses: [
          {
            arabic: "كُلَّمَا دَخَلَ عَلَيْهَا زَكَرِيَّا الْمِحْرَابَ وَجَدَ عِندَهَا رِزْقًا ۖ قَالَ يَا مَرْيَمُ أَنَّىٰ لَكِ هَٰذَا ۖ قَالَتْ هُوَ مِنْ عِندِ اللَّهِ",
            translation:
              "Every time Zakariyya entered upon her in the prayer chamber, he found with her provision. He said, 'O Maryam, from where is this [coming] to you?' She said, 'It is from Allah.'",
            reference: "Quran 3:37",
          },
        ],
      },
      {
        title: "The Prayer for a Son",
        content:
          "Seeing Allah's provision for Maryam, Zakariyya prayed for a righteous heir despite being elderly and his wife being barren. He called upon Allah secretly, and his prayer is one of the most beautiful and humble supplications in the Quran.",
        verses: [
          {
            arabic: "قَالَ رَبِّ إِنِّي وَهَنَ الْعَظْمُ مِنِّي وَاشْتَعَلَ الرَّأْسُ شَيْبًا وَلَمْ أَكُن بِدُعَائِكَ رَبِّ شَقِيًّا",
            translation:
              "He said, 'My Lord, indeed my bones have weakened, and my head has filled with white, and never have I been in my supplication to You, my Lord, unhappy [i.e., disappointed].'",
            reference: "Quran 19:4",
          },
        ],
      },
      {
        title: "The Gift of Yahya",
        content:
          "Allah answered his prayer and gave him glad tidings of a son named Yahya — a name that had never been given to anyone before. As a sign, Zakariyya was unable to speak to people for three days, while still being able to glorify Allah. This was a confirmation of the miracle.",
        verses: [
          {
            arabic: "يَا زَكَرِيَّا إِنَّا نُبَشِّرُكَ بِغُلَامٍ اسْمُهُ يَحْيَىٰ لَمْ نَجْعَل لَّهُ مِن قَبْلُ سَمِيًّا",
            translation:
              "O Zakariyya, indeed We give you good tidings of a boy whose name will be Yahya. We have not assigned to any before [this] name.",
            reference: "Quran 19:7",
          },
        ],
      },
    ],
    lessons: [
      "Never consider yourself too old or your situation too impossible for du'a",
      "Witnessing Allah's blessings on others should inspire hope, not jealousy",
      "Humility and sincerity in supplication are key to having prayers answered",
    ],
    references: [
      "Quran: Surah Maryam (19:1-15), Aal-E-Imran (3:37-41), Al-Anbiya (21:89-90)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  yahya: {
    slug: "yahya",
    title: "Prophet Yahya (John) — Given Wisdom as a Child",
    sections: [
      {
        title: "A Unique Name and Mission",
        content:
          "Yahya was the son of Zakariyya, born as a miraculous answer to his father's prayer. His name was chosen by Allah Himself — unprecedented, as no one before him had borne this name. He was given wisdom, judgment, and compassion from childhood.",
        verses: [
          {
            arabic: "يَا يَحْيَىٰ خُذِ الْكِتَابَ بِقُوَّةٍ ۖ وَآتَيْنَاهُ الْحُكْمَ صَبِيًّا",
            translation:
              "O Yahya, take the Scripture with determination. And We gave him judgment while yet a boy.",
            reference: "Quran 19:12",
          },
        ],
      },
      {
        title: "Character and Qualities",
        content:
          "The Quran describes Yahya with remarkable attributes: he was compassionate, pure (chaste), dutiful to his parents, and not arrogant or disobedient. He confirmed the word from Allah (i.e., Isa) and was a noble, chaste leader among his people.",
        verses: [
          {
            arabic: "وَحَنَانًا مِّن لَّدُنَّا وَزَكَاةً ۖ وَكَانَ تَقِيًّا * وَبَرًّا بِوَالِدَيْهِ وَلَمْ يَكُن جَبَّارًا عَصِيًّا",
            translation:
              "And [We gave him] compassion from Us and purity, and he was God-fearing. And dutiful to his parents, and he was not a disobedient tyrant.",
            reference: "Quran 19:13-14",
          },
        ],
      },
      {
        title: "Peace Upon Him",
        content:
          "Allah specifically mentions sending peace upon Yahya at three critical moments: the day he was born, the day he dies, and the day he will be raised alive. These are the same words used for Isa, highlighting Yahya's exalted status.",
        verses: [
          {
            arabic: "وَسَلَامٌ عَلَيْهِ يَوْمَ وُلِدَ وَيَوْمَ يَمُوتُ وَيَوْمَ يُبْعَثُ حَيًّا",
            translation:
              "And peace be upon him the day he was born and the day he dies and the day he is raised alive.",
            reference: "Quran 19:15",
          },
        ],
      },
    ],
    lessons: [
      "Youth is no barrier to wisdom — Allah gives understanding to whom He wills",
      "Purity of character and devotion to parents are inseparable from faith",
      "True nobility comes from piety, not from power or status",
    ],
    references: [
      "Quran: Surah Maryam (19:12-15), Aal-E-Imran (3:38-41), Al-An'am (6:85)",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  isa: {
    slug: "isa",
    title: "Prophet Isa (Jesus) — The Messiah, Son of Maryam",
    sections: [
      {
        title: "The Miraculous Birth",
        content:
          "Isa was born to Maryam (Mary) without a father, by the command of Allah — 'Be, and it is.' The angel Jibril appeared to Maryam and announced that she would bear a pure son. When she gave birth alone under a palm tree, Allah provided for her and told her to shake the tree for dates and drink from a stream He created.",
        verses: [
          {
            arabic: "إِنَّ مَثَلَ عِيسَىٰ عِندَ اللَّهِ كَمَثَلِ آدَمَ ۖ خَلَقَهُ مِن تُرَابٍ ثُمَّ قَالَ لَهُ كُن فَيَكُونُ",
            translation:
              "Indeed, the example of Isa to Allah is like that of Adam. He created him from dust; then He said to him, 'Be,' and he was.",
            reference: "Quran 3:59",
          },
        ],
      },
      {
        title: "Speaking from the Cradle",
        content:
          "When Maryam brought the infant Isa to her people, they accused her of immorality. She pointed to the baby, and miraculously, Isa spoke from the cradle, declaring himself a servant and prophet of Allah, clearing his mother's honor.",
        verses: [
          {
            arabic: "قَالَ إِنِّي عَبْدُ اللَّهِ آتَانِيَ الْكِتَابَ وَجَعَلَنِي نَبِيًّا",
            translation:
              "He said, 'Indeed, I am the servant of Allah. He has given me the Scripture and made me a prophet.'",
            reference: "Quran 19:30",
          },
        ],
      },
      {
        title: "Miracles by Allah's Permission",
        content:
          "Isa performed numerous miracles by Allah's permission: he healed the blind and the leper, raised the dead, and fashioned a bird from clay which came alive when he breathed into it. All of these were signs to the Israelites, yet many still rejected him. The Quran emphasizes that these miracles were by Allah's permission, not by Isa's own power.",
        verses: [
          {
            arabic: "وَأُبْرِئُ الْأَكْمَهَ وَالْأَبْرَصَ وَأُحْيِي الْمَوْتَىٰ بِإِذْنِ اللَّهِ",
            translation:
              "And I cure the blind and the leper, and I give life to the dead — by permission of Allah.",
            reference: "Quran 3:49",
          },
        ],
      },
      {
        title: "The Table Spread (Al-Ma'idah)",
        content:
          "The disciples of Isa asked for a table spread with food to descend from heaven as a sign. Isa prayed to Allah, and the table was sent down. Allah warned that whoever disbelieved after this sign would face a punishment unlike any other. This event gives Surah Al-Ma'idah its name.",
        verses: [
          {
            arabic: "قَالَ عِيسَى ابْنُ مَرْيَمَ اللَّهُمَّ رَبَّنَا أَنزِلْ عَلَيْنَا مَائِدَةً مِّنَ السَّمَاءِ تَكُونُ لَنَا عِيدًا",
            translation:
              "Isa, the son of Maryam, said, 'O Allah, our Lord, send down to us a table [spread with food] from the heaven to be for us a festival.'",
            reference: "Quran 5:114",
          },
        ],
      },
      {
        title: "Not Crucified — Raised to Heaven",
        content:
          "Islam teaches that Isa was not crucified. When his enemies plotted to kill him, Allah raised him to heaven. Someone else was made to resemble him and was crucified in his place. Isa is alive in heaven and will return before the Day of Judgment to establish justice, break the cross, and confirm the truth of Islam.",
        verses: [
          {
            arabic: "وَمَا قَتَلُوهُ وَمَا صَلَبُوهُ وَلَٰكِن شُبِّهَ لَهُمْ",
            translation:
              "And they did not kill him, nor did they crucify him; but [another] was made to resemble him to them.",
            reference: "Quran 4:157",
          },
          {
            arabic: "بَل رَّفَعَهُ اللَّهُ إِلَيْهِ ۚ وَكَانَ اللَّهُ عَزِيزًا حَكِيمًا",
            translation:
              "Rather, Allah raised him to Himself. And ever is Allah Exalted in Might and Wise.",
            reference: "Quran 4:158",
          },
        ],
        hadith: [
          {
            text: "The Prophet ﷺ said: 'By Him in Whose Hand is my life, the son of Maryam will soon descend among you as a just judge. He will break the cross, kill the swine, and abolish the jizyah.'",
            source: "Bukhari 34:169, Muslim 1:294",
          },
          {
            text:
              "The Prophet ﷺ listed ten major signs before the Last Hour, among them ‘the descent of Jesus son of Mary,’ alongside the Dajjal, Gog and Magog, and the rising of the sun from the west — his return being one of the great signs of the end times.",
            source: "Muslim 54:51; 54:52",
          },
          {
            text:
              "The Prophet ﷺ said: ‘I am the nearest of all people to the son of Mary. The prophets are paternal brothers, and there has been no prophet between me and him.’",
            source: "Bukhari 60:112; 60:113",
          },
        ],
      },
    ],
    lessons: [
      "Isa is a mighty prophet and servant of Allah — not divine, but deeply honored",
      "Miracles belong to Allah — prophets are channels, not the source",
      "Maryam is the greatest woman in Islam — her purity and faith are unmatched",
      "Islam corrects misconceptions about Isa while honoring him greatly",
      "Isa's return is a confirmed belief in Islam, tied to the end times",
    ],
    references: [
      "Quran: Surah Maryam (19:16-40), Aal-E-Imran (3:42-62), Al-Ma'idah (5:110-120), An-Nisa (4:156-159), As-Saff (61:6)",
      "Bukhari 34:169, Muslim 1:294",
      "Ibn Kathir, Qasas al-Anbiya",
    ],
  },

  muhammad: {
    slug: "muhammad",
    title: "Prophet Muhammad ﷺ — The Seal of the Prophets",
    sections: [
      {
        title: "Early Life and Character",
        content:
          "Muhammad ﷺ was born in Makkah in 570 CE to the tribe of Quraysh. Orphaned early — his father Abdullah died before his birth and his mother Aminah when he was six — he was raised by his grandfather Abdul-Muttalib and then his uncle Abu Talib. Even before prophethood, he was known as Al-Amin (the Trustworthy) and As-Sadiq (the Truthful).",
        hadith: [
          {
            text: "The Prophet ﷺ said: 'I was sent to perfect good character.'",
            source: "Ahmad 8952 (graded Sahih by Al-Albani; not in this app's local collection)",
          },
        ],
      },
      {
        title: "The First Revelation",
        content:
          "At the age of 40, while meditating in the Cave of Hira on Mount Nur, the angel Jibril appeared to Muhammad ﷺ and commanded him to read. The first verses of the Quran were revealed — the opening of Surah Al-Alaq. He returned home trembling to his wife Khadijah, who comforted him and became the first person to accept Islam.",
        verses: [
          {
            arabic: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ * خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ * اقْرَأْ وَرَبُّكَ الْأَكْرَمُ",
            translation:
              "Read in the name of your Lord who created. Created man from a clinging substance. Read, and your Lord is the most Generous.",
            reference: "Quran 96:1-3",
          },
        ],
      },
      {
        title: "Persecution and Patience in Makkah",
        content:
          "For 13 years in Makkah, the Prophet ﷺ and his followers endured severe persecution. They were boycotted, tortured, and driven from their homes. The early Muslims — especially Bilal, Yasir, Sumayyah, and others — suffered immensely. The Prophet ﷺ himself was mocked, had garbage thrown on him, and was attacked, yet he responded with patience and prayer.",
        hadith: [
          {
            text: "The Prophet ﷺ said about the people of Ta'if who rejected and stoned him: 'Perhaps Allah will bring from their descendants people who will worship Allah alone.'",
            source: "Bukhari 59:42, Muslim 32:135",
          },
        ],
      },
      {
        title: "The Hijrah to Madinah",
        content:
          "After 13 years of persecution, the Prophet ﷺ migrated to Madinah (then called Yathrib), where the people of Aws and Khazraj had accepted Islam. He established the first Islamic community, built the Prophet's Mosque, and created the Constitution of Madinah — one of the earliest charters of civil rights, establishing rights for Muslims, Jews, and others.",
        verses: [
          {
            arabic: "إِلَّا تَنصُرُوهُ فَقَدْ نَصَرَهُ اللَّهُ إِذْ أَخْرَجَهُ الَّذِينَ كَفَرُوا ثَانِيَ اثْنَيْنِ إِذْ هُمَا فِي الْغَارِ",
            translation:
              "If you do not aid him, Allah has already aided him when those who disbelieved had driven him out [of Makkah] as one of two, when they were in the cave.",
            reference: "Quran 9:40",
          },
        ],
      },
      {
        title: "The Final Sermon and Legacy",
        content:
          "During his final Hajj, the Prophet ﷺ delivered the Farewell Sermon to over 100,000 companions, establishing the principles of equality, justice, and human rights. Shortly after, the final verse of the Quran regarding religious law was revealed, completing the message of Islam. He passed away in 632 CE in Madinah.",
        verses: [
          {
            arabic: "الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِي وَرَضِيتُ لَكُمُ الْإِسْلَامَ دِينًا",
            translation:
              "This day I have perfected for you your religion and completed My favor upon you and have approved for you Islam as religion.",
            reference: "Quran 5:3",
          },
          {
            arabic: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
            translation:
              "And We have not sent you, [O Muhammad], except as a mercy to the worlds.",
            reference: "Quran 21:107",
          },
        ],
        hadith: [
          {
            text: "In his Farewell Sermon, the Prophet ﷺ said: 'All mankind is from Adam and Eve. An Arab has no superiority over a non-Arab, nor does a non-Arab have any superiority over an Arab; a white has no superiority over a black, nor does a black have any superiority over a white — except by piety and good action.'",
            source: "Musnad Ahmad 23489 (Farewell Sermon; isnad sahih — al-Arna'ut; al-Albani, as-Sahihah 2700; not in this app's local collection)",
          },
        ],
      },
      {
        title: "The Great Intercession",
        content:
          "On the Day of Resurrection, when the sun draws near and the crowds can bear no more, people will search for someone to intercede with Allah so the reckoning may begin. They will go to Adam, who will recall his own slip and say, ‘I am concerned with myself, I am concerned with myself’ — nafsī, nafsī — and send them to Nuh. Nuh will send them to Ibrahim, Ibrahim to Musa, Musa to Isa, and each will decline in turn. Isa will say: go to Muhammad ﷺ. He will go, fall in prostration beneath the Throne, and praise Allah with praises Allah teaches him there — until he is told, ‘Raise your head and speak, for you will be listened to; and ask, for you will be granted; and intercede, for your intercession will be accepted.’ This is the Great Intercession (ash-shafāʿah al-ʿuẓmā), the praised station (al-maqām al-maḥmūd) promised to him alone — the one scene in which every prophet in this collection stands together.",
        verses: [
          {
            arabic: "وَمِنَ ٱلَّيْلِ فَتَهَجَّدْ بِهِۦ نَافِلَةً لَّكَ عَسَىٰٓ أَن يَبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُودًا",
            translation:
              "And wake up during the night and pray, as an additional prayer for you [O Prophet], so your Lord may raise you to a praised status.",
            reference: "Quran 17:79",
          },
        ],
        hadith: [
          {
            text:
              "Anas reported that the Prophet ﷺ said: the believers will say, ‘Let us ask someone to intercede for us with our Lord,’ and they will come to Adam, who will say ‘I am not fit for this undertaking’ and send them to Nuh; Nuh will send them to Ibrahim, Ibrahim to Musa, Musa to Isa, and Isa will say, ‘Go to Muhammad.’ ‘So they will come to me, and I will ask the permission of my Lord… When I see my Lord I will fall down in prostration before Him, and He will leave me as long as He wishes, and then it will be said: O Muhammad! Raise your head and speak, for you will be listened to; and ask, for you will be granted; and intercede, for your intercession will be accepted.’",
            source: "Bukhari 97:39; Bukhari 65:3",
          },
          {
            text:
              "Abu Hurayrah reported that the Prophet ﷺ said: ‘I shall be the leader of mankind on the Day of Resurrection.’ He described the people going from Adam to Nuh to Ibrahim to Musa to Isa, each saying, ‘I am concerned with myself, I am concerned with myself,’ until they come to him: ‘I shall then set off and come below the Throne and fall down prostrate before my Lord… then it would be said: Muhammad, raise your head; ask and it would be granted; intercede and intercession would be accepted.’",
            source: "Muslim 1:386",
          },
          {
            text:
              "In the long narration of the intercession, the Prophet ﷺ described returning again and again — each time prostrating, praising Allah with praises He teaches him, and being told, ‘Raise your head and speak, for you will be listened to; and ask, for you will be granted; and intercede, for your intercession will be accepted’ — and each time more are taken out of the Fire, down to those with the weight of a mustard seed of faith in their hearts.",
            source: "Bukhari 97:135",
          },
          {
            text:
              "Abu Hurayrah reported that the Messenger of Allah ﷺ was asked about Allah’s words, ‘It may be that your Lord will raise you to a praised station’ (Quran 17:79), and he said: ‘It is the intercession.’",
            source: "Tirmidhi 47:189",
          },
        ],
      },
    ],
    lessons: [
      "The Prophet ﷺ is the ultimate role model — in worship, character, leadership, and mercy",
      "Islam was completed and perfected through him — no new prophet or revelation will come",
      "Patience in the face of persecution eventually leads to victory",
      "Equality of all humans regardless of race or status is a core Islamic principle",
      "Mercy, not vengeance, defined the Prophet's response to even his worst enemies",
    ],
    references: [
      "Quran: Surah Al-Alaq (96:1-5), Al-Ahzab (33:21, 40), Al-Anbiya (21:107), Al-Fath (48:29), Al-Ma'idah (5:3)",
      "Sahih al-Bukhari — numerous hadith throughout",
      "Sahih Muslim — numerous hadith throughout",
      "Bukhari 97:39; Bukhari 97:135; Muslim 1:386 — the hadith of the Great Intercession",
      "Tirmidhi 47:189; Bukhari 65:240 — the praised station (Quran 17:79) explained as the intercession",
      "Ar-Rahiq al-Makhtum (The Sealed Nectar) by Safiur-Rahman al-Mubarakpuri",
      "Ibn Kathir, Al-Bidaya wan-Nihaya",
    ],
  },

  // ── Righteous figures of the Quran whose prophethood scholars debated ──
  // Deliberately not part of the 25-prophet timeline in prophets.ts; each is
  // surfaced from the "Righteous Figures" section of the /prophets landing.
  maryam: {
    slug: "maryam",
    title: "Maryam (Mary) — The Best of Women",
    sections: [
      {
        title: "Dedicated Before She Was Born",
        content:
          "Maryam was the daughter of ʿImran. Before she was born, her mother vowed the child in her womb to the service of Allah; when the baby proved to be a girl she named her Maryam and sought Allah’s protection for her and her offspring from Satan. Allah accepted her with a gracious acceptance, caused her to grow in a good manner, and placed her in the care of the prophet Zakariyya — who found provision waiting with her every time he entered her prayer chamber, and was told plainly: ‘It is from Allah.’",
        verses: [
          {
            arabic: "إِذْ قَالَتِ ٱمْرَأَتُ عِمْرَٰنَ رَبِّ إِنِّى نَذَرْتُ لَكَ مَا فِى بَطْنِى مُحَرَّرًا فَتَقَبَّلْ مِنِّىٓ ۖ إِنَّكَ أَنتَ ٱلسَّمِيعُ ٱلْعَلِيمُ",
            translation:
              "[Remember] when the wife of ‘Imrān said, “My Lord, I dedicate to You what is in my womb, so accept it from me, for You are the All-Hearing, the All-Knowing.”",
            reference: "Quran 3:35",
          },
          {
            arabic: "فَلَمَّا وَضَعَتْهَا قَالَتْ رَبِّ إِنِّى وَضَعْتُهَآ أُنثَىٰ وَٱللَّهُ أَعْلَمُ بِمَا وَضَعَتْ وَلَيْسَ ٱلذَّكَرُ كَٱلْأُنثَىٰ ۖ وَإِنِّى سَمَّيْتُهَا مَرْيَمَ وَإِنِّىٓ أُعِيذُهَا بِكَ وَذُرِّيَّتَهَا مِنَ ٱلشَّيْطَـٰنِ ٱلرَّجِيمِ",
            translation:
              "When she gave birth, she said, “My Lord, I have given birth to a female child,” – and Allah knew best what she had given birth to – “and the male is not like the female. I have named her Mary, and I seek refuge with You for her and her offspring from Satan, the accursed.”",
            reference: "Quran 3:36",
          },
          {
            arabic: "فَتَقَبَّلَهَا رَبُّهَا بِقَبُولٍ حَسَنٍ وَأَنۢبَتَهَا نَبَاتًا حَسَنًا وَكَفَّلَهَا زَكَرِيَّا ۖ كُلَّمَا دَخَلَ عَلَيْهَا زَكَرِيَّا ٱلْمِحْرَابَ وَجَدَ عِندَهَا رِزْقًا ۖ قَالَ يَـٰمَرْيَمُ أَنَّىٰ لَكِ هَـٰذَا ۖ قَالَتْ هُوَ مِنْ عِندِ ٱللَّهِ ۖ إِنَّ ٱللَّهَ يَرْزُقُ مَن يَشَآءُ بِغَيْرِ حِسَابٍ",
            translation:
              "Her Lord graciously accepted her and caused her to grow in a good manner, and entrusted her to the care of Zachariah. Every time Zachariah entered her prayer chamber, he found with her some provision. He said, “O Mary, where did this come from?” She said, “It is from Allah, for Allah provides for whom He wills without measure.”",
            reference: "Quran 3:37",
          },
        ],
        hadith: [
          {
            text:
              "Abu Hurayrah reported that the Prophet ﷺ said: ‘There is none born among the offspring of Adam but Satan touches it — a child cries loudly at birth because of the touch of Satan — except Maryam and her child.’ Abu Hurayrah then recited: ‘And I seek refuge with You for her and for her offspring from the outcast Satan.’",
            source: "Bukhari 60:102; Muslim 43:191",
          },
        ],
      },
      {
        title: "Chosen, Purified, Chosen Above All Women",
        content:
          "The angels addressed Maryam directly: Allah had chosen her, purified her, and chosen her above the women of the worlds — and commanded her to a life of devotion, prostration, and bowing with those who bow. The Prophet ﷺ named her among the very few who reached perfection, and the best of the women of her time.",
        verses: [
          {
            arabic: "وَإِذْ قَالَتِ ٱلْمَلَـٰٓئِكَةُ يَـٰمَرْيَمُ إِنَّ ٱللَّهَ ٱصْطَفَىٰكِ وَطَهَّرَكِ وَٱصْطَفَىٰكِ عَلَىٰ نِسَآءِ ٱلْعَـٰلَمِينَ",
            translation:
              "And [remember] when the angels said, “O Mary, Allah has chosen you, purified you, and chosen you over all women.",
            reference: "Quran 3:42",
          },
          {
            arabic: "يَـٰمَرْيَمُ ٱقْنُتِى لِرَبِّكِ وَٱسْجُدِى وَٱرْكَعِى مَعَ ٱلرَّٰكِعِينَ",
            translation:
              "O Mary, worship your Lord devoutly, prostrate yourself and bow down with those who bow down.”",
            reference: "Quran 3:43",
          },
        ],
        hadith: [
          {
            text:
              "ʿAli reported that he heard the Prophet ﷺ say: ‘Maryam, the daughter of ʿImran, was the best among the women of her time, and Khadijah is the best among the women of this nation.’",
            source: "Bukhari 60:103; Muslim 44:101",
          },
          {
            text:
              "Abu Musa al-Ashʿari reported that the Messenger of Allah ﷺ said: ‘Many among men attained perfection, but among women none attained perfection except Maryam the daughter of ʿImran and Asiyah the wife of Pharaoh.’",
            source: "Bukhari 62:114",
          },
        ],
      },
      {
        title: "The Annunciation — a Word from Allah",
        content:
          "Maryam withdrew from her family to a place in the east and screened herself from them. Allah sent the angel to her in the form of a perfect man; she sought refuge in the Most Compassionate from him, and he answered that he was only a messenger from her Lord, sent to grant her a righteous son. She asked how she could have a child when no man had touched her and she had never been unchaste — and was told that this was easy for Allah, and that the child would be a sign for people and a mercy from Him.",
        verses: [
          {
            arabic: "إِذْ قَالَتِ ٱلْمَلَـٰٓئِكَةُ يَـٰمَرْيَمُ إِنَّ ٱللَّهَ يُبَشِّرُكِ بِكَلِمَةٍ مِّنْهُ ٱسْمُهُ ٱلْمَسِيحُ عِيسَى ٱبْنُ مَرْيَمَ وَجِيهًا فِى ٱلدُّنْيَا وَٱلْـَٔاخِرَةِ وَمِنَ ٱلْمُقَرَّبِينَ",
            translation:
              "[Remember] when the angels said, “O Mary, Allah gives you glad tidings of a Word from Him, whose name will be the Messiah, Jesus, son of Mary; honorable in this world and the Hereafter, and one of those near [to Allah].",
            reference: "Quran 3:45",
          },
          {
            arabic: "فَٱتَّخَذَتْ مِن دُونِهِمْ حِجَابًا فَأَرْسَلْنَآ إِلَيْهَا رُوحَنَا فَتَمَثَّلَ لَهَا بَشَرًا سَوِيًّا",
            translation:
              "She screened herself from them, then We sent to her Our Spirit [Gabriel] and he appeared before her in the form of a perfect human being.",
            reference: "Quran 19:17",
          },
          {
            arabic: "قَالَتْ أَنَّىٰ يَكُونُ لِى غُلَـٰمٌ وَلَمْ يَمْسَسْنِى بَشَرٌ وَلَمْ أَكُ بَغِيًّا",
            translation:
              "She said, “How can I have a son when no man has touched me, nor have I ever been unchaste?”",
            reference: "Quran 19:20",
          },
          {
            arabic: "قَالَ كَذَٰلِكِ قَالَ رَبُّكِ هُوَ عَلَىَّ هَيِّنٌ ۖ وَلِنَجْعَلَهُۥٓ ءَايَةً لِّلنَّاسِ وَرَحْمَةً مِّنَّا ۚ وَكَانَ أَمْرًا مَّقْضِيًّا",
            translation:
              "He said, “Thus it will be; your Lord says, ‘It is easy for Me; We make him a sign for people and a mercy from Us. This matter has already been decreed.’”",
            reference: "Quran 19:21",
          },
          {
            arabic: "قَالَتْ رَبِّ أَنَّىٰ يَكُونُ لِى وَلَدٌ وَلَمْ يَمْسَسْنِى بَشَرٌ ۖ قَالَ كَذَٰلِكِ ٱللَّهُ يَخْلُقُ مَا يَشَآءُ ۚ إِذَا قَضَىٰٓ أَمْرًا فَإِنَّمَا يَقُولُ لَهُۥ كُن فَيَكُونُ",
            translation:
              "She said: “My Lord, how can I have a child when no man has ever touched me?” He said, “Thus Allah creates what He wills. When He decrees something, He only says to it ‘Be’, and it is.",
            reference: "Quran 3:47",
          },
        ],
      },
      {
        title: "The Birth Under the Palm Tree",
        content:
          "She carried him and withdrew to a distant place. The pains of labour drove her to the trunk of a palm tree, and in that moment she wished she had died before this and been completely forgotten. Then she was called from beneath her: do not grieve — a stream had been placed beneath her, and shaking the trunk would drop fresh ripe dates upon her. She was told to eat, drink, be glad, and to answer anyone she met with a vow of silence to the Most Compassionate.",
        verses: [
          {
            arabic: "۞ فَحَمَلَتْهُ فَٱنتَبَذَتْ بِهِۦ مَكَانًا قَصِيًّا",
            translation:
              "So she conceived him and withdrew with him to a distant place.",
            reference: "Quran 19:22",
          },
          {
            arabic: "فَأَجَآءَهَا ٱلْمَخَاضُ إِلَىٰ جِذْعِ ٱلنَّخْلَةِ قَالَتْ يَـٰلَيْتَنِى مِتُّ قَبْلَ هَـٰذَا وَكُنتُ نَسْيًا مَّنسِيًّا",
            translation:
              "The pains of labor drove her to the trunk of a palm tree. She said, “Oh, would that I had died before this and had been completely forgotten!”",
            reference: "Quran 19:23",
          },
          {
            arabic: "فَنَادَىٰهَا مِن تَحْتِهَآ أَلَّا تَحْزَنِى قَدْ جَعَلَ رَبُّكِ تَحْتَكِ سَرِيًّا",
            translation:
              "Then he called her from beneath her, “Do not grieve; your Lord has provided a stream beneath you.",
            reference: "Quran 19:24",
          },
          {
            arabic: "وَهُزِّىٓ إِلَيْكِ بِجِذْعِ ٱلنَّخْلَةِ تُسَـٰقِطْ عَلَيْكِ رُطَبًا جَنِيًّا",
            translation:
              "Shake the trunk of the palm tree towards yourself; fresh ripe dates will drop upon you.",
            reference: "Quran 19:25",
          },
          {
            arabic: "فَكُلِى وَٱشْرَبِى وَقَرِّى عَيْنًا ۖ فَإِمَّا تَرَيِنَّ مِنَ ٱلْبَشَرِ أَحَدًا فَقُولِىٓ إِنِّى نَذَرْتُ لِلرَّحْمَـٰنِ صَوْمًا فَلَنْ أُكَلِّمَ ٱلْيَوْمَ إِنسِيًّا",
            translation:
              "Eat and drink, and be glad. And if you see any human being, say, ‘I have vowed silence to the Most Compassionate, so I will not talk to any human being today.’”",
            reference: "Quran 19:26",
          },
        ],
      },
      {
        title: "Facing Her People — the Cradle Answers",
        content:
          "She came to her people carrying him, and they accused her of something monstrous: her father had been no man of evil, nor her mother unchaste. She did not argue — she pointed to the infant. They objected that they could not speak to a baby in the cradle, and the baby spoke: a servant of Allah, given the Scripture and made a prophet. Her honour was defended by Allah Himself through the very child she was accused over. His own story is told in the entry for Prophet Isa.",
        verses: [
          {
            arabic: "فَأَتَتْ بِهِۦ قَوْمَهَا تَحْمِلُهُۥ ۖ قَالُوا۟ يَـٰمَرْيَمُ لَقَدْ جِئْتِ شَيْـًٔا فَرِيًّا",
            translation:
              "Then she came to her people carrying him. They said, “O Mary, you have committed something monstrous!",
            reference: "Quran 19:27",
          },
          {
            arabic: "يَـٰٓأُخْتَ هَـٰرُونَ مَا كَانَ أَبُوكِ ٱمْرَأَ سَوْءٍ وَمَا كَانَتْ أُمُّكِ بَغِيًّا",
            translation:
              "O sister of Aaron, your father was not a man of evil, nor was your mother unchaste.”",
            reference: "Quran 19:28",
          },
          {
            arabic: "فَأَشَارَتْ إِلَيْهِ ۖ قَالُوا۟ كَيْفَ نُكَلِّمُ مَن كَانَ فِى ٱلْمَهْدِ صَبِيًّا",
            translation:
              "Thereupon she pointed to him. They said, “How can we talk to someone who is still a baby in the cradle?”",
            reference: "Quran 19:29",
          },
          {
            arabic: "قَالَ إِنِّى عَبْدُ ٱللَّهِ ءَاتَىٰنِىَ ٱلْكِتَـٰبَ وَجَعَلَنِى نَبِيًّا",
            translation:
              "Jesus said, “I am a slave of Allah. He has given me the Scripture and made me a prophet.",
            reference: "Quran 19:30",
          },
          {
            arabic: "وَٱلسَّلَـٰمُ عَلَىَّ يَوْمَ وُلِدتُّ وَيَوْمَ أَمُوتُ وَيَوْمَ أُبْعَثُ حَيًّا",
            translation:
              "Peace is upon me the day I was born, the day I will die and the day I will be resurrected.”",
            reference: "Quran 19:33",
          },
        ],
      },
      {
        title: "Was Maryam a Prophet?",
        content:
          "The Quran gives Maryam a title of its own: the Messiah’s ‘mother was a woman of truth’ — a ṣiddīqah (Quran 5:75) — who guarded her chastity, believed in the words of her Lord and His Scriptures, and was one of the obedient (Quran 66:12). The great majority of scholars — and many transmit it as the settled position of the scholars — held that prophethood was given only to men, citing ‘We did not send before you except men whom We gave a revelation’ (Quran 12:109), so Maryam is honoured as the greatest of women and a ṣiddīqah rather than a prophetess. A minority disagreed, most famously Ibn Hazm, who argued that because an angel brought her news from Allah she received a form of revelation and could be called a prophetess. The disagreement is about the title, not her rank: both sides read the same verses of her being chosen above the women of the worlds.",
        verses: [
          {
            arabic: "مَّا ٱلْمَسِيحُ ٱبْنُ مَرْيَمَ إِلَّا رَسُولٌ قَدْ خَلَتْ مِن قَبْلِهِ ٱلرُّسُلُ وَأُمُّهُۥ صِدِّيقَةٌ ۖ كَانَا يَأْكُلَانِ ٱلطَّعَامَ ۗ ٱنظُرْ كَيْفَ نُبَيِّنُ لَهُمُ ٱلْـَٔايَـٰتِ ثُمَّ ٱنظُرْ أَنَّىٰ يُؤْفَكُونَ",
            translation:
              "The Messiah, son of Mary, was no more than a messenger. There were messengers who passed away before him, and His mother was a woman of truth; they both ate food. See how We make Our signs clear to them, yet see how they are deluded!",
            reference: "Quran 5:75",
          },
          {
            arabic: "وَمَرْيَمَ ٱبْنَتَ عِمْرَٰنَ ٱلَّتِىٓ أَحْصَنَتْ فَرْجَهَا فَنَفَخْنَا فِيهِ مِن رُّوحِنَا وَصَدَّقَتْ بِكَلِمَـٰتِ رَبِّهَا وَكُتُبِهِۦ وَكَانَتْ مِنَ ٱلْقَـٰنِتِينَ",
            translation:
              "Also [the example of] Mary, daughter of ‘Imrān who guarded her chastity, so We breathed into her through Our angel [Gabriel], and she firmly believed in the words of her Lord and His Scriptures and was one of the obedient.",
            reference: "Quran 66:12",
          },
          {
            arabic: "وَمَآ أَرْسَلْنَا مِن قَبْلِكَ إِلَّا رِجَالًا نُّوحِىٓ إِلَيْهِم مِّنْ أَهْلِ ٱلْقُرَىٰٓ ۗ أَفَلَمْ يَسِيرُوا۟ فِى ٱلْأَرْضِ فَيَنظُرُوا۟ كَيْفَ كَانَ عَـٰقِبَةُ ٱلَّذِينَ مِن قَبْلِهِمْ ۗ وَلَدَارُ ٱلْـَٔاخِرَةِ خَيْرٌ لِّلَّذِينَ ٱتَّقَوْا۟ ۗ أَفَلَا تَعْقِلُونَ",
            translation:
              "We did not send before you except men whom We gave a revelation, from the people of each society. Have they not traveled through the land to see how was the end of those who came before them? But the home of the Hereafter is far better for those who fear Allah. Do you not then understand?",
            reference: "Quran 12:109",
          },
        ],
      },
    ],
    lessons: [
      "Allah accepts what is offered to Him sincerely — even when it does not arrive in the form we expected",
      "Worship and purity, not lineage or status, are what raise a person with Allah",
      "Allah defends the honour of those who trust Him — Maryam stayed silent and He answered for her",
      "The Quran names one woman, and it names her as chosen above the women of the worlds",
      "Hardship and honour can arrive together: the trial that terrified Maryam was the sign that vindicated her",
    ],
    references: [
      "Quran: Surah Aal-E-Imran (3:33-47), Maryam (19:16-34), Al-Ma'idah (5:75), Al-Anbiya (21:91), At-Tahrim (66:12)",
      "Bukhari 60:102; Muslim 43:191 — Maryam and her son not touched by Satan at birth",
      "Bukhari 60:103; Muslim 44:101 — the best of the women of her time",
      "Bukhari 62:114 — perfection attained among women by Maryam and Asiyah",
      "Ibn Kathir, Qasas al-Anbiya — the story of Maryam and the scholarly discussion of whether she was a prophetess",
    ],
  },

  khidr: {
    slug: "khidr",
    title: "Al-Khidr — The Servant Given Knowledge",
    sections: [
      {
        title: "The Question That Sent Musa Travelling",
        content:
          "A man asked Musa whether anyone was more learned than he was, and Musa said no. Allah corrected him: His slave at the junction of the two seas had knowledge Musa did not have, and a fish was made the sign of their meeting place. Musa set out with his young companion, the fish slipped away into the sea, and there they found ‘one of Our slaves upon whom We bestowed Our mercy and We taught him from Our Own knowledge.’ The same journey is told from Musa’s side in the entry for Prophet Musa.",
        verses: [
          {
            arabic: "وَإِذْ قَالَ مُوسَىٰ لِفَتَىٰهُ لَآ أَبْرَحُ حَتَّىٰٓ أَبْلُغَ مَجْمَعَ ٱلْبَحْرَيْنِ أَوْ أَمْضِىَ حُقُبًا",
            translation:
              "And [remember] when Moses said to his servant, “I will not give up until I reach the junction of the two seas, or I travel for ages.”",
            reference: "Quran 18:60",
          },
          {
            arabic: "فَوَجَدَا عَبْدًا مِّنْ عِبَادِنَآ ءَاتَيْنَـٰهُ رَحْمَةً مِّنْ عِندِنَا وَعَلَّمْنَـٰهُ مِن لَّدُنَّا عِلْمًا",
            translation:
              "There they found one of Our slaves upon whom We bestowed Our mercy and We taught him from Our Own knowledge.",
            reference: "Quran 18:65",
          },
        ],
        hadith: [
          {
            text:
              "Ibn ʿAbbas differed with al-Hurr ibn Qays about the companion of Musa, and Ubayy ibn Kaʿb reported that the Prophet ﷺ said: while Musa was sitting among the Israelites a man asked him whether he knew anyone more learned than himself, and Musa said no — so Allah revealed to him, ‘Yes, Our slave Khadir,’ and made a fish the sign of their meeting place.",
            source: "Bukhari 60:73; Bukhari 3:16; Bukhari 3:20",
          },
        ],
      },
      {
        title: "The Condition: Ask Me About Nothing",
        content:
          "Musa asked to follow him and be taught. Al-Khidr warned him twice that he would never be able to bear it, because he would be watching things he had no knowledge of. Musa promised patience, if Allah willed, and obedience — and was given one condition: ask nothing until it is explained to you.",
        verses: [
          {
            arabic: "قَالَ لَهُۥ مُوسَىٰ هَلْ أَتَّبِعُكَ عَلَىٰٓ أَن تُعَلِّمَنِ مِمَّا عُلِّمْتَ رُشْدًا",
            translation:
              "Moses said to him, “May I follow you so that you may teach me some knowledge that you have been taught?”",
            reference: "Quran 18:66",
          },
          {
            arabic: "قَالَ إِنَّكَ لَن تَسْتَطِيعَ مَعِىَ صَبْرًا",
            translation:
              "He said, “You will never be able to have patience with me.”",
            reference: "Quran 18:67",
          },
          {
            arabic: "قَالَ سَتَجِدُنِىٓ إِن شَآءَ ٱللَّهُ صَابِرًا وَلَآ أَعْصِى لَكَ أَمْرًا",
            translation:
              "Moses said, “You will find me patient, if Allah wills; and I will not disobey any of your orders.”",
            reference: "Quran 18:69",
          },
          {
            arabic: "قَالَ فَإِنِ ٱتَّبَعْتَنِى فَلَا تَسْـَٔلْنِى عَن شَىْءٍ حَتَّىٰٓ أُحْدِثَ لَكَ مِنْهُ ذِكْرًا",
            translation:
              "He said, “Then if you follow me, do not ask me about anything until I mention it to you.”",
            reference: "Quran 18:70",
          },
        ],
      },
      {
        title: "Three Acts That Baffled a Prophet",
        content:
          "They boarded a ship and Al-Khidr made a hole in it; Musa objected that its people would drown. They met a boy and Al-Khidr killed him; Musa objected that an innocent soul had been taken. They came to a town whose people refused them hospitality, and Al-Khidr rebuilt a wall that was about to collapse without asking for payment; Musa objected that he could at least have taken a wage. Each time he was reminded of the warning — and at the third he asked to be parted from his teacher if he objected again.",
        verses: [
          {
            arabic: "فَٱنطَلَقَا حَتَّىٰٓ إِذَا رَكِبَا فِى ٱلسَّفِينَةِ خَرَقَهَا ۖ قَالَ أَخَرَقْتَهَا لِتُغْرِقَ أَهْلَهَا لَقَدْ جِئْتَ شَيْـًٔا إِمْرًا",
            translation:
              "So they both set out, until when they boarded a ship, he made a hole in it. Moses said, “Did you make a hole in it to drown its people? You have done something terrible!”",
            reference: "Quran 18:71",
          },
          {
            arabic: "فَٱنطَلَقَا حَتَّىٰٓ إِذَا لَقِيَا غُلَـٰمًا فَقَتَلَهُۥ قَالَ أَقَتَلْتَ نَفْسًا زَكِيَّةًۢ بِغَيْرِ نَفْسٍ لَّقَدْ جِئْتَ شَيْـًٔا نُّكْرًا",
            translation:
              "Then they proceeded until they met a boy, and the man killed him. Moses said, “Did you kill an innocent soul who killed none? You have done something monstrous!”",
            reference: "Quran 18:74",
          },
          {
            arabic: "فَٱنطَلَقَا حَتَّىٰٓ إِذَآ أَتَيَآ أَهْلَ قَرْيَةٍ ٱسْتَطْعَمَآ أَهْلَهَا فَأَبَوْا۟ أَن يُضَيِّفُوهُمَا فَوَجَدَا فِيهَا جِدَارًا يُرِيدُ أَن يَنقَضَّ فَأَقَامَهُۥ ۖ قَالَ لَوْ شِئْتَ لَتَّخَذْتَ عَلَيْهِ أَجْرًا",
            translation:
              "Then they went on until they came to the people of a town. They asked its people for food, but they refused to offer them hospitality. They found there a wall that was about to collapse, but he repaired it. Moses said, “If you wished, you could have taken some payment for it.”",
            reference: "Quran 18:77",
          },
        ],
      },
      {
        title: "The Wisdom Behind Each Act",
        content:
          "At the parting, Al-Khidr explained. The ship belonged to poor men working at sea, and a king ahead was seizing every sound ship — a defect saved their livelihood. The boy’s parents were believers, and it was feared he would overburden them with rebellion and disbelief, so a better and more merciful child was hoped for in his place. The wall stood over a treasure belonging to two orphans whose father had been righteous, and Allah willed that they reach maturity and take it out themselves. He ended with the decisive words: ‘I did not do it of my own accord.’",
        verses: [
          {
            arabic: "قَالَ هَـٰذَا فِرَاقُ بَيْنِى وَبَيْنِكَ ۚ سَأُنَبِّئُكَ بِتَأْوِيلِ مَا لَمْ تَسْتَطِع عَّلَيْهِ صَبْرًا",
            translation:
              "The man said, “This is the parting of ways between me and you. I will inform you of the interpretation of that which you could not bear with patience.",
            reference: "Quran 18:78",
          },
          {
            arabic: "أَمَّا ٱلسَّفِينَةُ فَكَانَتْ لِمَسَـٰكِينَ يَعْمَلُونَ فِى ٱلْبَحْرِ فَأَرَدتُّ أَنْ أَعِيبَهَا وَكَانَ وَرَآءَهُم مَّلِكٌ يَأْخُذُ كُلَّ سَفِينَةٍ غَصْبًا",
            translation:
              "“As for the ship, it belonged to some poor people who worked at sea. I wanted to make it defective because there was a king ahead of them who seized every [good] ship by force.",
            reference: "Quran 18:79",
          },
          {
            arabic: "وَأَمَّا ٱلْغُلَـٰمُ فَكَانَ أَبَوَاهُ مُؤْمِنَيْنِ فَخَشِينَآ أَن يُرْهِقَهُمَا طُغْيَـٰنًا وَكُفْرًا",
            translation:
              "“As for the boy, his parents were believers, and we feared that he would overburden them with his rebellion and disbelief.",
            reference: "Quran 18:80",
          },
          {
            arabic: "فَأَرَدْنَآ أَن يُبْدِلَهُمَا رَبُّهُمَا خَيْرًا مِّنْهُ زَكَوٰةً وَأَقْرَبَ رُحْمًا",
            translation:
              "So we hoped that their Lord would give them another in his place, more righteous and tender-hearted.",
            reference: "Quran 18:81",
          },
          {
            arabic: "وَأَمَّا ٱلْجِدَارُ فَكَانَ لِغُلَـٰمَيْنِ يَتِيمَيْنِ فِى ٱلْمَدِينَةِ وَكَانَ تَحْتَهُۥ كَنزٌ لَّهُمَا وَكَانَ أَبُوهُمَا صَـٰلِحًا فَأَرَادَ رَبُّكَ أَن يَبْلُغَآ أَشُدَّهُمَا وَيَسْتَخْرِجَا كَنزَهُمَا رَحْمَةً مِّن رَّبِّكَ ۚ وَمَا فَعَلْتُهُۥ عَنْ أَمْرِى ۚ ذَٰلِكَ تَأْوِيلُ مَا لَمْ تَسْطِع عَّلَيْهِ صَبْرًا",
            translation:
              "As for the wall, it belonged to two orphan boys in the city, and there was a treasure under it that belonged to them. Their father was a righteous man, so your Lord willed that they should reach their maturity and retrieve their treasure, as a mercy from your Lord; I did not do it of my own accord. This is the interpretation of that which you could not bear with patience.”",
            reference: "Quran 18:82",
          },
        ],
      },
      {
        title: "Who Was Al-Khidr?",
        content:
          "The Quran never names him — it calls him a slave of Allah given mercy and knowledge from Him. The name Al-Khidr comes from the Prophet ﷺ himself, and one narration explains it. Scholars have long differed over whether he was a prophet (nabī) receiving revelation or a righteous servant of Allah given special knowledge: most Quran commentators lean towards his prophethood, partly because he said ‘I did not do it of my own accord’ and because taking a life is not left to a man’s own judgement; others hold he was a righteous walī and not a prophet. Whether he is still alive is a separate and equally old dispute — some scholars held that he lives on, while others held that he died like every other human being and read the reports about him as narrations rather than proofs. Neither question is settled by an explicit text, so both are reported here as scholarly positions rather than as creed.",
        hadith: [
          {
            text:
              "Abu Hurayrah reported that the Prophet ﷺ said: ‘Al-Khadir was named so because he sat over a barren white land, and it turned green with plantation after his sitting over it.’",
            source: "Bukhari 60:75",
          },
        ],
      },
    ],
    lessons: [
      "There is always knowledge beyond your own — Allah sent even Musa to sit and learn",
      "What looks like harm can be hidden mercy; the wisdom of a decree often arrives after the shock of it",
      "Patience with a teacher, and holding the tongue, are part of seeking knowledge",
      "Working for people without asking a wage is the way of the righteous",
      "No one acts of his own accord in what belongs to Allah — Al-Khidr’s own last words",
    ],
    references: [
      "Quran: Surah Al-Kahf (18:60-82)",
      "Bukhari 3:16; Bukhari 3:20 — the full narration of Musa and Al-Khadir",
      "Bukhari 60:73 — Ibn ʿAbbas and Ubayy ibn Kaʿb on the companion of Musa",
      "Bukhari 60:75 — why he was called Al-Khadir",
      "Ibn Kathir, Qasas al-Anbiya — the scholarly discussion of his prophethood and of whether he is alive",
    ],
  },

  "dhul-qarnayn": {
    slug: "dhul-qarnayn",
    title: "Dhul-Qarnayn — The Just King and the Barrier",
    sections: [
      {
        title: "A Question Put to the Prophet ﷺ",
        content:
          "Dhul-Qarnayn — ‘the two-horned one’ — enters the Quran as the answer to a question put to the Prophet ﷺ. Allah had established him in the earth and given him the means to reach everything, and he used those means: he followed one course, then another, judging as he went. His story closes Surah al-Kahf, the surah recommended to be read every Friday.",
        verses: [
          {
            arabic: "وَيَسْـَٔلُونَكَ عَن ذِى ٱلْقَرْنَيْنِ ۖ قُلْ سَأَتْلُوا۟ عَلَيْكُم مِّنْهُ ذِكْرًا",
            translation:
              "They ask you about Dhul-Qarnayn. Say, “I will tell you something about him.”",
            reference: "Quran 18:83",
          },
          {
            arabic: "إِنَّا مَكَّنَّا لَهُۥ فِى ٱلْأَرْضِ وَءَاتَيْنَـٰهُ مِن كُلِّ شَىْءٍ سَبَبًا",
            translation:
              "We established him on earth and gave him the means to achieve everything.",
            reference: "Quran 18:84",
          },
          {
            arabic: "فَأَتْبَعَ سَبَبًا",
            translation:
              "He pursued a course,",
            reference: "Quran 18:85",
          },
        ],
      },
      {
        title: "Westward — Justice Before Power",
        content:
          "He reached the far west, where he found the sun setting in a dark body of water and a people living nearby. He was given a choice: punish them or treat them with kindness. His answer set the rule of his rule — the wrongdoer would be punished and then returned to his Lord for a graver punishment, while the believer who did righteous deeds would have the best reward and be commanded only what is easy.",
        verses: [
          {
            arabic: "حَتَّىٰٓ إِذَا بَلَغَ مَغْرِبَ ٱلشَّمْسِ وَجَدَهَا تَغْرُبُ فِى عَيْنٍ حَمِئَةٍ وَوَجَدَ عِندَهَا قَوْمًا ۗ قُلْنَا يَـٰذَا ٱلْقَرْنَيْنِ إِمَّآ أَن تُعَذِّبَ وَإِمَّآ أَن تَتَّخِذَ فِيهِمْ حُسْنًا",
            translation:
              "until when he reached the far west, he found the sun setting in a dark body of water, and he found some people nearby. We said, “O Dhul-Qarnayn, either punish them or treat them with kindness.”",
            reference: "Quran 18:86",
          },
          {
            arabic: "قَالَ أَمَّا مَن ظَلَمَ فَسَوْفَ نُعَذِّبُهُۥ ثُمَّ يُرَدُّ إِلَىٰ رَبِّهِۦ فَيُعَذِّبُهُۥ عَذَابًا نُّكْرًا",
            translation:
              "He said, “As for one who does wrong, we will punish him, then he will be brought back to his Lord, and He will punish him grievously.",
            reference: "Quran 18:87",
          },
          {
            arabic: "وَأَمَّا مَنْ ءَامَنَ وَعَمِلَ صَـٰلِحًا فَلَهُۥ جَزَآءً ٱلْحُسْنَىٰ ۖ وَسَنَقُولُ لَهُۥ مِنْ أَمْرِنَا يُسْرًا",
            translation:
              "But he who believes and does righteous deeds, he will have the best reward, and we will enjoin upon him to do what is easy.”",
            reference: "Quran 18:88",
          },
        ],
      },
      {
        title: "Eastward — a People Without Shelter",
        content:
          "Then he pursued another course until he reached the far east, and found the sun rising upon a people for whom Allah had provided no shelter from it. The Quran does not linger on who they were: ‘So it was, and We had full knowledge about him.’ What is preserved is the pattern — a ruler who kept travelling, kept judging, and kept crediting Allah.",
        verses: [
          {
            arabic: "ثُمَّ أَتْبَعَ سَبَبًا",
            translation:
              "Then he pursued another course,",
            reference: "Quran 18:89",
          },
          {
            arabic: "حَتَّىٰٓ إِذَا بَلَغَ مَطْلِعَ ٱلشَّمْسِ وَجَدَهَا تَطْلُعُ عَلَىٰ قَوْمٍ لَّمْ نَجْعَل لَّهُم مِّن دُونِهَا سِتْرًا",
            translation:
              "until when he reached the far east, he found the sun rising on a people for whom We provided no shelter from it.",
            reference: "Quran 18:90",
          },
          {
            arabic: "كَذَٰلِكَ وَقَدْ أَحَطْنَا بِمَا لَدَيْهِ خُبْرًا",
            translation:
              "So it was, and We had full knowledge about him.",
            reference: "Quran 18:91",
          },
        ],
      },
      {
        title: "The Barrier Against Gog and Magog",
        content:
          "Between two mountains he found a people who could barely understand a word, and who complained that Gog and Magog (Yaʾjuj and Maʾjuj) were spreading corruption in the land. They offered him payment to build a barrier. He refused the payment — what his Lord had given him was better — and asked only for manpower. He had iron blocks brought and levelled between the two mountainsides, had the fire blown to extreme heat, and poured molten copper over it. Gog and Magog could neither climb it nor pierce it.",
        verses: [
          {
            arabic: "حَتَّىٰٓ إِذَا بَلَغَ بَيْنَ ٱلسَّدَّيْنِ وَجَدَ مِن دُونِهِمَا قَوْمًا لَّا يَكَادُونَ يَفْقَهُونَ قَوْلًا",
            translation:
              "until when he reached [a valley] between the two mountains, he found beyond them a people who could barely understand a word.",
            reference: "Quran 18:93",
          },
          {
            arabic: "قَالُوا۟ يَـٰذَا ٱلْقَرْنَيْنِ إِنَّ يَأْجُوجَ وَمَأْجُوجَ مُفْسِدُونَ فِى ٱلْأَرْضِ فَهَلْ نَجْعَلُ لَكَ خَرْجًا عَلَىٰٓ أَن تَجْعَلَ بَيْنَنَا وَبَيْنَهُمْ سَدًّا",
            translation:
              "They said, “O Dhul-Qarnayn, Gog and Magog are spreading corruption in the land. Can we give you some payment in return for you to construct a barrier between us and them?”",
            reference: "Quran 18:94",
          },
          {
            arabic: "قَالَ مَا مَكَّنِّى فِيهِ رَبِّى خَيْرٌ فَأَعِينُونِى بِقُوَّةٍ أَجْعَلْ بَيْنَكُمْ وَبَيْنَهُمْ رَدْمًا",
            translation:
              "He said, “What my Lord has given me is better. But help me with manpower, I will construct a barricade between you and them.",
            reference: "Quran 18:95",
          },
          {
            arabic: "ءَاتُونِى زُبَرَ ٱلْحَدِيدِ ۖ حَتَّىٰٓ إِذَا سَاوَىٰ بَيْنَ ٱلصَّدَفَيْنِ قَالَ ٱنفُخُوا۟ ۖ حَتَّىٰٓ إِذَا جَعَلَهُۥ نَارًا قَالَ ءَاتُونِىٓ أُفْرِغْ عَلَيْهِ قِطْرًا",
            translation:
              "Bring me iron blocks” – until when he leveled between the two mountainsides, he said, “Blow [with bellows],” until when he fired them up to extreme heat, he said, “Bring me molten copper to pour over it.”",
            reference: "Quran 18:96",
          },
          {
            arabic: "فَمَا ٱسْطَـٰعُوٓا۟ أَن يَظْهَرُوهُ وَمَا ٱسْتَطَـٰعُوا۟ لَهُۥ نَقْبًا",
            translation:
              "Thus they could not climb over it nor could they pierce it.",
            reference: "Quran 18:97",
          },
        ],
      },
      {
        title: "“This Is a Mercy From My Lord”",
        content:
          "He did not call the barrier his achievement. He called it a mercy from his Lord — and said that when the promise of his Lord came, He would raze it to the ground. The Prophet ﷺ later warned that an opening had already been made in it, a reminder that the strongest structure on earth stands only as long as Allah wills.",
        verses: [
          {
            arabic: "قَالَ هَـٰذَا رَحْمَةٌ مِّن رَّبِّى ۖ فَإِذَا جَآءَ وَعْدُ رَبِّى جَعَلَهُۥ دَكَّآءَ ۖ وَكَانَ وَعْدُ رَبِّى حَقًّا",
            translation:
              "He said, “This is a mercy from my Lord. But when the promise of my Lord comes to pass, He will raze it to the ground. The promise of my Lord is ever true.”",
            reference: "Quran 18:98",
          },
        ],
        hadith: [
          {
            text:
              "Zaynab bint Jahsh reported that the Prophet ﷺ came in alarm and said: ‘None has the right to be worshipped but Allah. Woe to the Arabs from an evil that has drawn near — an opening has been made in the barrier of Gog and Magog like this,’ making a circle with his thumb and forefinger. She asked, ‘Shall we be destroyed though there are righteous people among us?’ He said: ‘Yes, when evil persons increase.’",
            source: "Bukhari 60:21; Bukhari 92:11",
          },
          {
            text:
              "Abu Hurayrah reported that the Prophet ﷺ said: ‘Allah has made an opening in the barrier of Gog and Magog like this’ — and he showed it with his fingers.",
            source: "Bukhari 60:22",
          },
        ],
      },
      {
        title: "King, Prophet — and the Question of His Identity",
        content:
          "Scholars have differed over whether Dhul-Qarnayn was a prophet or a righteous, Allah-guided king. Most classical commentators regarded him as a believing king rather than a prophet; some counted him among the prophets, pointing to Allah addressing him in the verses. Both positions are reported and neither is settled by an explicit text. His identity in history is disputed in the same way: the Quran gives no name, land, or era, and the identifications later writers have proposed with various ancient rulers are conjecture rather than established fact — the Quran gives the lesson and withholds the label. Even the meaning of ‘the two horns’ is explained differently by the commentators — the two ends of the earth he reached, two braids of hair, or a twin-horned crown — with none of the explanations decisive.",
      },
    ],
    lessons: [
      "Power is a trust: Allah ‘established him in the earth’, and he answered by ruling justly",
      "Justice means restraining the wrongdoer and making the doer of good secure",
      "Real strength builds what protects people — and credits Allah with it, not itself",
      "Every barrier, and every empire, ends when the promise of Allah comes",
      "The Quran preserves the lesson and omits the labels we would otherwise chase",
    ],
    references: [
      "Quran: Surah Al-Kahf (18:83-98)",
      "Bukhari 60:21; Bukhari 92:11 — an opening made in the barrier of Gog and Magog",
      "Bukhari 60:22 — the same warning narrated by Abu Hurayrah",
      "Ibn Kathir, Tafsir on Surah Al-Kahf — the scholarly positions on who Dhul-Qarnayn was",
    ],
  },

  luqman: {
    slug: "luqman",
    title: "Luqman al-Hakim — The Wisdom of a Father",
    sections: [
      {
        title: "Wisdom Given, and the Gratitude It Owes",
        content:
          "Allah endowed Luqman with wisdom (ḥikmah) and paired the gift with its duty in the same breath: be grateful to Allah. The Quran adds the reason — whoever is grateful is grateful for his own good, and Allah is in need of no one. A whole surah carries Luqman’s name, and its heart is a passage of advice from a father to his son.",
        verses: [
          {
            arabic: "وَلَقَدْ ءَاتَيْنَا لُقْمَـٰنَ ٱلْحِكْمَةَ أَنِ ٱشْكُرْ لِلَّهِ ۚ وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِۦ ۖ وَمَن كَفَرَ فَإِنَّ ٱللَّهَ غَنِىٌّ حَمِيدٌ",
            translation:
              "Indeed, We endowed Luqmān with wisdom, [saying], “Be grateful to Allah.” Whoever is grateful, it is only for his own good; and whoever is ungrateful, then Allah is Self-Sufficient, Praiseworthy.",
            reference: "Quran 31:12",
          },
        ],
      },
      {
        title: "“O My Son, Do Not Associate Anything With Allah”",
        content:
          "The first thing he taught his son was tawhid — and he called shirk by its true name: the greatest wrongdoing there is. The Prophet ﷺ used this very verse to settle a fear among his Companions when they read that security belongs to ‘those who believe and do not mix their faith with wrongdoing’ (Quran 6:82).",
        verses: [
          {
            arabic: "وَإِذْ قَالَ لُقْمَـٰنُ لِٱبْنِهِۦ وَهُوَ يَعِظُهُۥ يَـٰبُنَىَّ لَا تُشْرِكْ بِٱللَّهِ ۖ إِنَّ ٱلشِّرْكَ لَظُلْمٌ عَظِيمٌ",
            translation:
              "When Luqmān said to his son, while advising him, “O my dear son, do not associate partners with Allah. Indeed, associating partners with Allah is the worst wrongdoing.”",
            reference: "Quran 31:13",
          },
        ],
        hadith: [
          {
            text:
              "ʿAbdullah ibn Masʿud reported that when ‘those who believe and do not mix their belief with wrongdoing’ (Quran 6:82) was revealed, it weighed heavily on the Companions, and they said: ‘Which of us has not wronged himself?’ The Messenger of Allah ﷺ said: ‘It does not mean that. Have you not heard what Luqman said to his son — “Indeed, associating partners with Allah is a great wrong”?’",
            source: "Bukhari 65:298; Muslim 1:234",
          },
        ],
      },
      {
        title: "Parents — Kindness Even Where There Is No Obedience",
        content:
          "Allah interrupts Luqman’s advice with His own command about parents: a mother carried her child in weakness upon weakness, so be grateful to Allah and to your parents. And then the limit — if they strive to make you associate anything with Allah, do not obey them in that; yet keep company with them in this world with kindness. Obedience has a ceiling; good treatment does not.",
        verses: [
          {
            arabic: "وَوَصَّيْنَا ٱلْإِنسَـٰنَ بِوَٰلِدَيْهِ حَمَلَتْهُ أُمُّهُۥ وَهْنًا عَلَىٰ وَهْنٍ وَفِصَـٰلُهُۥ فِى عَامَيْنِ أَنِ ٱشْكُرْ لِى وَلِوَٰلِدَيْكَ إِلَىَّ ٱلْمَصِيرُ",
            translation:
              "We have enjoined upon man kindness to his parents. His mother bore him in weakness upon weakness, and his weaning took place within two years. Be grateful to Me and to your parents. To Me is the final return.",
            reference: "Quran 31:14",
          },
          {
            arabic: "وَإِن جَـٰهَدَاكَ عَلَىٰٓ أَن تُشْرِكَ بِى مَا لَيْسَ لَكَ بِهِۦ عِلْمٌ فَلَا تُطِعْهُمَا ۖ وَصَاحِبْهُمَا فِى ٱلدُّنْيَا مَعْرُوفًا ۖ وَٱتَّبِعْ سَبِيلَ مَنْ أَنَابَ إِلَىَّ ۚ ثُمَّ إِلَىَّ مَرْجِعُكُمْ فَأُنَبِّئُكُم بِمَا كُنتُمْ تَعْمَلُونَ",
            translation:
              "But if they strive to make you associate partners with Me of what you have no knowledge, then do not obey them. Yet keep company with them in this world with kindness, and follow the way of those who turn to Me [in repentance]. Then to Me is your return, and I will inform you of what you used to do.",
            reference: "Quran 31:15",
          },
        ],
      },
      {
        title: "Nothing Is Too Small for Allah to Bring Forth",
        content:
          "Luqman returns to his son with the smallest image the Quran uses for a deed: the weight of a mustard seed, hidden inside a rock, or lost in the heavens or the earth — Allah will bring it forth. It is a warning and a comfort at once: no wrong is too well hidden to be seen, and no good is too small to be counted.",
        verses: [
          {
            arabic: "يَـٰبُنَىَّ إِنَّهَآ إِن تَكُ مِثْقَالَ حَبَّةٍ مِّنْ خَرْدَلٍ فَتَكُن فِى صَخْرَةٍ أَوْ فِى ٱلسَّمَـٰوَٰتِ أَوْ فِى ٱلْأَرْضِ يَأْتِ بِهَا ٱللَّهُ ۚ إِنَّ ٱللَّهَ لَطِيفٌ خَبِيرٌ",
            translation:
              "[Luqmān said], “O my dear son, even if a deed were the weight of a mustard seed – whether in a rock or in the heavens or in the earth – Allah will bring it forth. Indeed, Allah is Most Subtle, All-Aware.",
            reference: "Quran 31:16",
          },
        ],
      },
      {
        title: "Prayer, Enjoining Good, and Patience",
        content:
          "The next instruction is a whole religious life in one line: establish the prayer, enjoin what is right, forbid what is wrong, and be patient with whatever befalls you — because the one who calls to good will be tested by it. Luqman closes the instruction with the Quran’s own words: ‘This is a matter of firm resolve.’",
        verses: [
          {
            arabic: "يَـٰبُنَىَّ أَقِمِ ٱلصَّلَوٰةَ وَأْمُرْ بِٱلْمَعْرُوفِ وَٱنْهَ عَنِ ٱلْمُنكَرِ وَٱصْبِرْ عَلَىٰ مَآ أَصَابَكَ ۖ إِنَّ ذَٰلِكَ مِنْ عَزْمِ ٱلْأُمُورِ",
            translation:
              "“O my dear son, establish prayer, enjoin what is right and forbid what is wrong, and be patient with whatever befalls you. This is a matter of firm resolve.",
            reference: "Quran 31:17",
          },
        ],
      },
      {
        title: "How You Walk and How You Speak",
        content:
          "He closes with manners, because wisdom shows in the body before it shows in speech: do not turn your face from people in contempt, do not walk the earth in arrogance, be moderate in your gait, and lower your voice. The Quran ends the passage with a comparison no one forgets — the most repugnant of voices is the voice of donkeys.",
        verses: [
          {
            arabic: "وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِى ٱلْأَرْضِ مَرَحًا ۖ إِنَّ ٱللَّهَ لَا يُحِبُّ كُلَّ مُخْتَالٍ فَخُورٍ",
            translation:
              "Do not turn your face away from people [in contempt], and do not walk on earth in arrogance. Indeed, Allah does not like anyone who is arrogant and boastful.",
            reference: "Quran 31:18",
          },
          {
            arabic: "وَٱقْصِدْ فِى مَشْيِكَ وَٱغْضُضْ مِن صَوْتِكَ ۚ إِنَّ أَنكَرَ ٱلْأَصْوَٰتِ لَصَوْتُ ٱلْحَمِيرِ",
            translation:
              "Be moderate in your gait and lower your voice. Indeed, the most repugnant of voices is the voice of donkeys.”",
            reference: "Quran 31:19",
          },
        ],
      },
      {
        title: "Was Luqman a Prophet?",
        content:
          "The majority of scholars held that Luqman was a wise, righteous servant of Allah — a ḥakīm — and not a prophet, which is how the Quran describes him: he was given wisdom, not revelation or a scripture. A minority among the early scholars counted him a prophet. Early commentators also transmit descriptions of him as an Abyssinian or Nubian man, a freed slave, a carpenter, or a shepherd; these come from early reports rather than from the Quran or an authentic hadith, and the scholars who cite them do not treat them as certain. What the Quran does establish is that Allah gave him wisdom, that he is named twice (Quran 31:12-13), and that a father’s advice to his son was preserved in a surah bearing his name.",
      },
    ],
    lessons: [
      "Wisdom begins with tawhid — the first thing Luqman taught his son was to worship Allah alone",
      "The gravest wrong is not a wrong done to people but shirk done to Allah",
      "Be good to your parents even in the one place where you cannot obey them",
      "No deed is too small to be brought forth — not the weight of a mustard seed",
      "Calling to good comes with being tested, and patience is what carries it",
      "Teach children gently: the Quran preserves a father speaking, not lecturing",
    ],
    references: [
      "Quran: Surah Luqman (31:12-19)",
      "Bukhari 65:298; Muslim 1:234 — the Prophet ﷺ explains Quran 6:82 with Luqman’s advice to his son",
      "Ibn Kathir, Tafsir on Surah Luqman — reports on who Luqman was and on whether he was a prophet",
    ],
  },
};

export function getStoryBySlug(slug: string): ProphetStory | undefined {
  return prophetStories[slug];
}
