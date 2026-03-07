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
            source: "Sahih al-Bukhari 3207, Sahih Muslim 162",
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
      "Sahih al-Bukhari 3207 — Night Journey (Isra and Mi'raj)",
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
      "Sahih al-Bukhari 3364 — Ibrahim as Khalilullah",
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
            source: "Sahih al-Bukhari 3364",
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
      "Sahih al-Bukhari 3364",
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
          "During the famine, Yusuf's brothers came to Egypt seeking food, not recognizing him. After testing them, Yusuf revealed his identity and forgave them, saying, 'No blame upon you today. Allah will forgive you.' He then sent for his father and family, and Yaqub's dream was fulfilled when they all bowed before him in gratitude.",
        verses: [
          {
            arabic: "قَالَ لَا تَثْرِيبَ عَلَيْكُمُ الْيَوْمَ ۖ يَغْفِرُ اللَّهُ لَكُمْ ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ",
            translation:
              "He said, 'No blame upon you today. Allah will forgive you; and He is the most merciful of the merciful.'",
            reference: "Quran 12:92",
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
      "Sahih al-Bukhari 3407 — Musa and the Angel of Death",
      "Sahih Muslim 166 — Night Journey, Musa in the sixth heaven",
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
            source: "Sahih al-Bukhari 3706, Sahih Muslim 2404",
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
      "Sahih al-Bukhari 3706, Sahih Muslim 2404",
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
            source: "Sahih al-Bukhari 3124",
          },
        ],
      },
      {
        title: "Leading the Israelites",
        content:
          "After Musa's death, Yusha ibn Nun took on the responsibility of leading the Israelites into the Holy Land. He was among the few who had remained faithful when the majority of Israelites had refused to enter the land, fearing its powerful inhabitants. Under his leadership, they finally entered and established themselves there.",
        hadith: [
          {
            text: "The Prophet ﷺ mentioned that the sun was held back (delayed in setting) for Yusha ibn Nun when he was fighting on a Friday.",
            source: "Sahih Muslim 1747, Ahmad 8296",
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
      "Sahih al-Bukhari 3124",
      "Sahih Muslim 1747",
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
            source: "Sahih al-Bukhari 1131, Sahih Muslim 1159",
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
      "Sahih al-Bukhari 1131, Sahih Muslim 1159",
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
            source: "Sunan at-Tirmidhi 3505 (graded Sahih)",
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
      "Sunan at-Tirmidhi 3505",
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
            source: "Sahih al-Bukhari 2222, Sahih Muslim 155",
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
      "Sahih al-Bukhari 2222, Sahih Muslim 155",
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
            source: "Musnad Ahmad 8952 (graded Sahih by Al-Albani)",
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
            source: "Sahih al-Bukhari 3231, Sahih Muslim 1795",
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
            source: "Musnad Ahmad 23489",
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
      "Ar-Rahiq al-Makhtum (The Sealed Nectar) by Safiur-Rahman al-Mubarakpuri",
      "Ibn Kathir, Al-Bidaya wan-Nihaya",
    ],
  },
};

export function getStoryBySlug(slug: string): ProphetStory | undefined {
  return prophetStories[slug];
}
