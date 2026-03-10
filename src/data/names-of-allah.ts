export type NameOfAllah = {
  name: string;
  nameAr: string;
  meaning: string;
  explanation: string;
  verse?: { arabic: string; text: string; ref: string };
};

const namesOfAllah: NameOfAllah[] = [
  {
    name: "Allah",
    nameAr: "الله",
    meaning: "The Greatest Name",
    explanation:
      "The supreme name of God, encompassing all His attributes of perfection. It is the personal name of God, unique to Him alone, and cannot be made plural or given to any creation.",
    verse: {
      arabic: "اللَّهُ لَا إِلَـٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
      text: "Allah — there is no deity except Him, the Ever-Living, the Self-Sustaining.",
      ref: "Quran 2:255",
    },
  },
  {
    name: "Ar-Rahman",
    nameAr: "الرحمن",
    meaning: "The Most Gracious",
    explanation:
      "The One whose mercy encompasses all of creation without exception. This mercy is vast and all-encompassing — it includes believers and disbelievers, humans, animals, and all that exists.",
    verse: {
      arabic: "الرَّحْمَـٰنُ عَلَى الْعَرْشِ اسْتَوَىٰ",
      text: "The Most Gracious rose over the Throne.",
      ref: "Quran 20:5",
    },
  },
  {
    name: "Ar-Raheem",
    nameAr: "الرحيم",
    meaning: "The Most Merciful",
    explanation:
      "The One who bestows special mercy upon the believers. While Ar-Rahman refers to the vastness of mercy, Ar-Raheem refers to the specific mercy reserved for those who believe and do good.",
    verse: {
      arabic: "وَكَانَ بِالْمُؤْمِنِينَ رَحِيمًا",
      text: "And He is ever, to the believers, Merciful.",
      ref: "Quran 33:43",
    },
  },
  {
    name: "Al-Malik",
    nameAr: "الملك",
    meaning: "The King",
    explanation:
      "The absolute Sovereign and Ruler of all that exists. His dominion is complete — He owns everything, controls everything, and His authority is unchallenged and eternal.",
    verse: {
      arabic: "فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ",
      text: "So exalted is Allah, the True King.",
      ref: "Quran 20:114",
    },
  },
  {
    name: "Al-Quddus",
    nameAr: "القدوس",
    meaning: "The Most Holy",
    explanation:
      "The One who is free from every imperfection, deficiency, and anything that does not befit His majesty. He is pure and sacred beyond any comparison to His creation.",
    verse: {
      arabic: "هُوَ اللَّهُ الَّذِي لَا إِلَـٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ",
      text: "He is Allah, other than whom there is no deity, the King, the Most Holy.",
      ref: "Quran 59:23",
    },
  },
  {
    name: "As-Salam",
    nameAr: "السلام",
    meaning: "The Source of Peace",
    explanation:
      "The One who is free from all defects and the source of all peace and safety. He greets the people of Paradise with peace, and from Him all tranquility originates.",
    verse: {
      arabic: "الْمَلِكُ الْقُدُّوسُ السَّلَامُ",
      text: "The King, the Most Holy, the Source of Peace.",
      ref: "Quran 59:23",
    },
  },
  {
    name: "Al-Mu'min",
    nameAr: "المؤمن",
    meaning: "The Granter of Security",
    explanation:
      "The One who grants safety and security to His creation. He confirms the truthfulness of His messengers through miracles and signs, and gives peace of heart to those who believe in Him.",
    verse: {
      arabic: "السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ",
      text: "The Source of Peace, the Granter of Security, the Guardian.",
      ref: "Quran 59:23",
    },
  },
  {
    name: "Al-Muhaymin",
    nameAr: "المهيمن",
    meaning: "The Guardian",
    explanation:
      "The One who watches over and protects all of creation. He is the Guardian who oversees everything, preserving and maintaining all that exists with perfect awareness.",
    verse: {
      arabic: "الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ",
      text: "The Granter of Security, the Guardian, the Almighty.",
      ref: "Quran 59:23",
    },
  },
  {
    name: "Al-Aziz",
    nameAr: "العزيز",
    meaning: "The Almighty",
    explanation:
      "The One who possesses absolute power and honor that can never be overcome. None can resist His decree, and His might is unmatched. He grants honor to whomever He wills.",
    verse: {
      arabic: "وَاللَّهُ عَزِيزٌ ذُو انتِقَامٍ",
      text: "And Allah is Almighty, Owner of Retribution.",
      ref: "Quran 3:4",
    },
  },
  {
    name: "Al-Jabbar",
    nameAr: "الجبار",
    meaning: "The Compeller",
    explanation:
      "The One whose will is irresistible and who compels all of creation according to His divine wisdom. He also mends what is broken — mending hearts, fixing affairs, and restoring what is damaged.",
    verse: {
      arabic: "الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ",
      text: "The Almighty, the Compeller, the Supreme.",
      ref: "Quran 59:23",
    },
  },
  {
    name: "Al-Mutakabbir",
    nameAr: "المتكبر",
    meaning: "The Supreme",
    explanation:
      "The One who is supremely great, above all His creation in every way. Greatness and pride belong only to Him. When a human being is arrogant it is blameworthy, but for Allah it is a statement of truth.",
    verse: {
      arabic: "الْجَبَّارُ الْمُتَكَبِّرُ سُبْحَانَ اللَّهِ عَمَّا يُشْرِكُونَ",
      text: "The Compeller, the Supreme. Exalted is Allah above whatever they associate with Him.",
      ref: "Quran 59:23",
    },
  },
  {
    name: "Al-Khaliq",
    nameAr: "الخالق",
    meaning: "The Creator",
    explanation:
      "The One who brings everything into existence from nothing. He determines the measure and plan of all creation before bringing it into being.",
    verse: {
      arabic: "هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ",
      text: "He is Allah, the Creator, the Originator, the Fashioner.",
      ref: "Quran 59:24",
    },
  },
  {
    name: "Al-Bari",
    nameAr: "البارئ",
    meaning: "The Originator",
    explanation:
      "The One who creates and brings things into existence without any prior model or example. He originates creation with perfect precision and distinction between each thing.",
    verse: {
      arabic: "الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ لَهُ الْأَسْمَاءُ الْحُسْنَىٰ",
      text: "The Creator, the Originator, the Fashioner. To Him belong the most beautiful names.",
      ref: "Quran 59:24",
    },
  },
  {
    name: "Al-Musawwir",
    nameAr: "المصور",
    meaning: "The Fashioner",
    explanation:
      "The One who shapes and gives form to all of creation. He fashions each being in its unique appearance and gives each thing its distinctive image.",
    verse: {
      arabic: "هُوَ الَّذِي يُصَوِّرُكُمْ فِي الْأَرْحَامِ كَيْفَ يَشَاءُ",
      text: "It is He who forms you in the wombs however He wills.",
      ref: "Quran 3:6",
    },
  },
  {
    name: "Al-Ghaffar",
    nameAr: "الغفار",
    meaning: "The Ever-Forgiving",
    explanation:
      "The One who forgives sins repeatedly and abundantly. No matter how many times a servant sins, if they turn back sincerely, He forgives again and again.",
    verse: {
      arabic: "وَإِنِّي لَغَفَّارٌ لِّمَن تَابَ وَآمَنَ وَعَمِلَ صَالِحًا",
      text: "And indeed, I am the Ever-Forgiving of whoever repents and believes and does righteousness.",
      ref: "Quran 20:82",
    },
  },
  {
    name: "Al-Qahhar",
    nameAr: "القهار",
    meaning: "The Subduer",
    explanation:
      "The One who dominates over all things and whom nothing can resist. All of creation is subject to His power and authority — nothing can escape His grasp.",
    verse: {
      arabic: "قُلِ اللَّهُ خَالِقُ كُلِّ شَيْءٍ وَهُوَ الْوَاحِدُ الْقَهَّارُ",
      text: "Say: Allah is the Creator of all things, and He is the One, the Subduer.",
      ref: "Quran 13:16",
    },
  },
  {
    name: "Al-Wahhab",
    nameAr: "الوهاب",
    meaning: "The Bestower",
    explanation:
      "The One who gives generously and freely without expecting anything in return. His gifts are unlimited — He gives to whomever He wills, of whatever He wills, whenever He wills.",
    verse: {
      arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ",
      text: "Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.",
      ref: "Quran 3:8",
    },
  },
  {
    name: "Ar-Razzaq",
    nameAr: "الرزاق",
    meaning: "The Provider",
    explanation:
      "The One who provides sustenance to all creation — both physical nourishment and spiritual provision. Every creature's sustenance is guaranteed by Him, whether they acknowledge Him or not.",
    verse: {
      arabic: "إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ",
      text: "Indeed, it is Allah who is the Provider, the Firm Possessor of Strength.",
      ref: "Quran 51:58",
    },
  },
  {
    name: "Al-Fattah",
    nameAr: "الفتاح",
    meaning: "The Opener",
    explanation:
      "The One who opens all doors of mercy and sustenance. He opens what is closed, resolves what is difficult, and grants victory and relief. He opens the hearts of people to guidance.",
    verse: {
      arabic: "وَهُوَ الْفَتَّاحُ الْعَلِيمُ",
      text: "And He is the Opener, the All-Knowing.",
      ref: "Quran 34:26",
    },
  },
  {
    name: "Al-Aleem",
    nameAr: "العليم",
    meaning: "The All-Knowing",
    explanation:
      "The One whose knowledge encompasses everything — past, present, and future, the seen and unseen, the hidden and the apparent. Nothing escapes His knowledge, not even the weight of an atom.",
    verse: {
      arabic: "وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ",
      text: "And He is, of all things, All-Knowing.",
      ref: "Quran 2:29",
    },
  },
  {
    name: "Al-Qabid",
    nameAr: "القابض",
    meaning: "The Withholder",
    explanation:
      "The One who constricts and withholds as He wills. He may withhold sustenance, constrict hearts, or take souls — all according to His perfect wisdom and justice.",
    verse: {
      arabic: "وَاللَّهُ يَقْبِضُ وَيَبْسُطُ وَإِلَيْهِ تُرْجَعُونَ",
      text: "And Allah withholds and extends, and to Him you will be returned.",
      ref: "Quran 2:245",
    },
  },
  {
    name: "Al-Basit",
    nameAr: "الباسط",
    meaning: "The Extender",
    explanation:
      "The One who expands and extends provision, mercy, and relief. He opens the hearts with joy and generosity and spreads His blessings abundantly among His creation.",
    verse: {
      arabic: "وَاللَّهُ يَقْبِضُ وَيَبْسُطُ وَإِلَيْهِ تُرْجَعُونَ",
      text: "And Allah withholds and extends, and to Him you will be returned.",
      ref: "Quran 2:245",
    },
  },
  {
    name: "Al-Khafid",
    nameAr: "الخافض",
    meaning: "The Humbler",
    explanation:
      "The One who lowers and humbles whomever He wills. He brings down the arrogant and the oppressors, lowering their status in this life and the next.",
  },
  {
    name: "Ar-Rafi",
    nameAr: "الرافع",
    meaning: "The Exalter",
    explanation:
      "The One who raises and elevates whomever He wills. He elevates the status of the believers, raises people in rank through knowledge and piety, and lifts the humble.",
    verse: {
      arabic: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
      text: "Allah will raise those who have believed among you and those who were given knowledge, by degrees.",
      ref: "Quran 58:11",
    },
  },
  {
    name: "Al-Mu'izz",
    nameAr: "المعز",
    meaning: "The Honourer",
    explanation:
      "The One who grants honor, dignity, and strength to whomever He wills. True honor comes only from Him — it cannot be attained through wealth, lineage, or status alone.",
    verse: {
      arabic: "تُعِزُّ مَن تَشَاءُ وَتُذِلُّ مَن تَشَاءُ",
      text: "You honor whom You will and humble whom You will.",
      ref: "Quran 3:26",
    },
  },
  {
    name: "Al-Mudhill",
    nameAr: "المذل",
    meaning: "The Humiliator",
    explanation:
      "The One who brings disgrace and humiliation upon those who deserve it. He humbles the arrogant, the tyrants, and those who oppose His commands.",
    verse: {
      arabic: "تُعِزُّ مَن تَشَاءُ وَتُذِلُّ مَن تَشَاءُ",
      text: "You honor whom You will and humble whom You will.",
      ref: "Quran 3:26",
    },
  },
  {
    name: "As-Sami",
    nameAr: "السميع",
    meaning: "The All-Hearing",
    explanation:
      "The One who hears everything — every sound, whisper, thought, and prayer. Nothing is hidden from His hearing, whether spoken aloud or concealed in the heart.",
    verse: {
      arabic: "إِنَّ اللَّهَ سَمِيعٌ بَصِيرٌ",
      text: "Indeed, Allah is All-Hearing, All-Seeing.",
      ref: "Quran 22:75",
    },
  },
  {
    name: "Al-Basir",
    nameAr: "البصير",
    meaning: "The All-Seeing",
    explanation:
      "The One who sees everything — the visible and the hidden, the apparent and the concealed. Nothing escapes His sight, no matter how small or hidden.",
    verse: {
      arabic: "إِنَّ اللَّهَ سَمِيعٌ بَصِيرٌ",
      text: "Indeed, Allah is All-Hearing, All-Seeing.",
      ref: "Quran 22:75",
    },
  },
  {
    name: "Al-Hakam",
    nameAr: "الحكم",
    meaning: "The Judge",
    explanation:
      "The One who judges between His creation with absolute justice. His judgment is final and perfect — He settles all disputes and no one can overturn His verdict.",
    verse: {
      arabic: "أَفَغَيْرَ اللَّهِ أَبْتَغِي حَكَمًا",
      text: "Then is it other than Allah I should seek as judge?",
      ref: "Quran 6:114",
    },
  },
  {
    name: "Al-Adl",
    nameAr: "العدل",
    meaning: "The Just",
    explanation:
      "The One who is perfectly just in all His actions, decrees, and judgments. He never wrongs anyone, even by the weight of an atom. His justice is absolute and all-encompassing.",
    verse: {
      arabic: "وَلَا يَظْلِمُ رَبُّكَ أَحَدًا",
      text: "And your Lord does injustice to no one.",
      ref: "Quran 18:49",
    },
  },
  {
    name: "Al-Latif",
    nameAr: "اللطيف",
    meaning: "The Subtle",
    explanation:
      "The One who is kind and gentle with His servants in ways they do not perceive. He arranges affairs with subtlety and care, guiding events toward good in ways beyond human comprehension.",
    verse: {
      arabic: "اللَّهُ لَطِيفٌ بِعِبَادِهِ",
      text: "Allah is Subtle with His servants.",
      ref: "Quran 42:19",
    },
  },
  {
    name: "Al-Khabir",
    nameAr: "الخبير",
    meaning: "The All-Aware",
    explanation:
      "The One who has complete inner knowledge of all things — their hidden nature, their secrets, and their innermost realities. Nothing is concealed from His awareness.",
    verse: {
      arabic: "وَهُوَ الْحَكِيمُ الْخَبِيرُ",
      text: "And He is the All-Wise, the All-Aware.",
      ref: "Quran 6:18",
    },
  },
  {
    name: "Al-Halim",
    nameAr: "الحليم",
    meaning: "The Forbearing",
    explanation:
      "The One who is not hasty in punishing those who disobey Him. He gives respite and delays punishment, giving people time to repent and return to Him, despite His full ability to punish immediately.",
    verse: {
      arabic: "وَاعْلَمُوا أَنَّ اللَّهَ غَفُورٌ حَلِيمٌ",
      text: "And know that Allah is Forgiving and Forbearing.",
      ref: "Quran 2:235",
    },
  },
  {
    name: "Al-Azim",
    nameAr: "العظيم",
    meaning: "The Magnificent",
    explanation:
      "The One who possesses absolute greatness in every attribute and aspect. His greatness is beyond human comprehension — greater than anything the mind can conceive.",
    verse: {
      arabic: "وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      text: "And He is the Most High, the Magnificent.",
      ref: "Quran 2:255",
    },
  },
  {
    name: "Al-Ghafur",
    nameAr: "الغفور",
    meaning: "The All-Forgiving",
    explanation:
      "The One who forgives abundantly and covers the sins of His servants. He not only forgives sins but conceals them, protecting the dignity of the sinner.",
    verse: {
      arabic: "وَرَبُّكَ الْغَفُورُ ذُو الرَّحْمَةِ",
      text: "And your Lord is the Forgiving, Full of Mercy.",
      ref: "Quran 18:58",
    },
  },
  {
    name: "Ash-Shakur",
    nameAr: "الشكور",
    meaning: "The Appreciative",
    explanation:
      "The One who appreciates and rewards even the smallest good deed. He multiplies rewards and gives abundantly in return for little — even a smile, a kind word, or removing harm from the road.",
    verse: {
      arabic: "إِنَّ رَبَّنَا لَغَفُورٌ شَكُورٌ",
      text: "Indeed, our Lord is Forgiving and Appreciative.",
      ref: "Quran 35:34",
    },
  },
  {
    name: "Al-Aliyy",
    nameAr: "العلي",
    meaning: "The Most High",
    explanation:
      "The One who is above all creation in His essence, His attributes, and His power. He is the highest in every sense — in status, in authority, and in every attribute of perfection.",
    verse: {
      arabic: "وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      text: "And He is the Most High, the Magnificent.",
      ref: "Quran 2:255",
    },
  },
  {
    name: "Al-Kabir",
    nameAr: "الكبير",
    meaning: "The Greatest",
    explanation:
      "The One who is greater than everything else. His greatness surpasses all things — He is greater than any description, any imagination, and any comparison.",
    verse: {
      arabic: "عَالِمُ الْغَيْبِ وَالشَّهَادَةِ الْكَبِيرُ الْمُتَعَالِ",
      text: "Knower of the unseen and the witnessed, the Greatest, the Most Exalted.",
      ref: "Quran 13:9",
    },
  },
  {
    name: "Al-Hafiz",
    nameAr: "الحفيظ",
    meaning: "The Preserver",
    explanation:
      "The One who preserves and protects all of creation. He guards the heavens and earth from destruction, preserves the deeds of people, and protects the believers from harm.",
    verse: {
      arabic: "إِنَّ رَبِّي عَلَىٰ كُلِّ شَيْءٍ حَفِيظٌ",
      text: "Indeed, my Lord is, over all things, a Preserver.",
      ref: "Quran 11:57",
    },
  },
  {
    name: "Al-Muqit",
    nameAr: "المقيت",
    meaning: "The Sustainer",
    explanation:
      "The One who sustains, nourishes, and maintains all creation. He provides every living being with exactly what it needs to survive and thrive.",
    verse: {
      arabic: "وَكَانَ اللَّهُ عَلَىٰ كُلِّ شَيْءٍ مُّقِيتًا",
      text: "And Allah is, over all things, a Sustainer.",
      ref: "Quran 4:85",
    },
  },
  {
    name: "Al-Hasib",
    nameAr: "الحسيب",
    meaning: "The Reckoner",
    explanation:
      "The One who takes account of every deed and is sufficient for His servants. He is enough for whoever relies upon Him, and He will bring every person to account on the Day of Judgment.",
    verse: {
      arabic: "وَكَفَىٰ بِاللَّهِ حَسِيبًا",
      text: "And sufficient is Allah as a Reckoner.",
      ref: "Quran 4:6",
    },
  },
  {
    name: "Al-Jalil",
    nameAr: "الجليل",
    meaning: "The Majestic",
    explanation:
      "The One who possesses absolute majesty and grandeur. He is majestic in His essence, His attributes, and His actions — and all majesty in creation is but a reflection of His.",
  },
  {
    name: "Al-Karim",
    nameAr: "الكريم",
    meaning: "The Generous",
    explanation:
      "The One who is endlessly generous and noble. He gives without being asked, forgives without being begged, and fulfills promises without fail. His generosity has no limit.",
    verse: {
      arabic: "يَا أَيُّهَا الْإِنسَانُ مَا غَرَّكَ بِرَبِّكَ الْكَرِيمِ",
      text: "O mankind, what has deceived you concerning your Lord, the Generous?",
      ref: "Quran 82:6",
    },
  },
  {
    name: "Ar-Raqib",
    nameAr: "الرقيب",
    meaning: "The Watchful",
    explanation:
      "The One who watches over all things at all times. Nothing escapes His observation — every action, every thought, every whisper is under His constant watch.",
    verse: {
      arabic: "إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا",
      text: "Indeed Allah is ever, over you, a Watchful Guardian.",
      ref: "Quran 4:1",
    },
  },
  {
    name: "Al-Mujib",
    nameAr: "المجيب",
    meaning: "The Responsive",
    explanation:
      "The One who responds to the supplications of those who call upon Him. He answers every prayer — either granting what is asked, averting harm, or storing the reward for the Hereafter.",
    verse: {
      arabic: "إِنَّ رَبِّي قَرِيبٌ مُّجِيبٌ",
      text: "Indeed, my Lord is near and responsive.",
      ref: "Quran 11:61",
    },
  },
  {
    name: "Al-Wasi",
    nameAr: "الواسع",
    meaning: "The All-Encompassing",
    explanation:
      "The One whose capacity, knowledge, mercy, and provision encompass all things. His reach has no limit, and His bounty extends to all of creation without being diminished.",
    verse: {
      arabic: "وَاللَّهُ وَاسِعٌ عَلِيمٌ",
      text: "And Allah is All-Encompassing, All-Knowing.",
      ref: "Quran 2:247",
    },
  },
  {
    name: "Al-Hakim",
    nameAr: "الحكيم",
    meaning: "The All-Wise",
    explanation:
      "The One who possesses complete wisdom in all His actions and decrees. Everything He ordains has a perfect reason and purpose, even when it is not apparent to human understanding.",
    verse: {
      arabic: "وَاللَّهُ عَلِيمٌ حَكِيمٌ",
      text: "And Allah is All-Knowing, All-Wise.",
      ref: "Quran 4:26",
    },
  },
  {
    name: "Al-Wadud",
    nameAr: "الودود",
    meaning: "The Most Loving",
    explanation:
      "The One who loves His righteous servants and is beloved to them. His love is active — He shows affection, draws near, and treats His servants with warmth and tenderness.",
    verse: {
      arabic: "وَهُوَ الْغَفُورُ الْوَدُودُ",
      text: "And He is the Forgiving, the Most Loving.",
      ref: "Quran 85:14",
    },
  },
  {
    name: "Al-Majid",
    nameAr: "المجيد",
    meaning: "The Glorious",
    explanation:
      "The One who possesses perfect glory and honor. His glory combines greatness, generosity, and authority in a way that inspires awe and reverence.",
    verse: {
      arabic: "ذُو الْعَرْشِ الْمَجِيدُ",
      text: "Owner of the Throne, the Glorious.",
      ref: "Quran 85:15",
    },
  },
  {
    name: "Al-Ba'ith",
    nameAr: "الباعث",
    meaning: "The Resurrector",
    explanation:
      "The One who raises the dead to life on the Day of Judgment. He will bring all of creation back to life for the final accounting — nothing is lost to Him.",
    verse: {
      arabic: "وَأَنَّ اللَّهَ يَبْعَثُ مَن فِي الْقُبُورِ",
      text: "And that Allah will resurrect those in the graves.",
      ref: "Quran 22:7",
    },
  },
  {
    name: "Ash-Shahid",
    nameAr: "الشهيد",
    meaning: "The Witness",
    explanation:
      "The One who witnesses everything — every event, every action, every thought. Nothing happens without His knowledge. On the Day of Judgment, He will testify as the ultimate Witness.",
    verse: {
      arabic: "إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ شَهِيدٌ",
      text: "Indeed Allah is, over all things, a Witness.",
      ref: "Quran 22:17",
    },
  },
  {
    name: "Al-Haqq",
    nameAr: "الحق",
    meaning: "The Truth",
    explanation:
      "The One who is the absolute truth and reality. His existence is the most real of all existence. Everything else may perish, but He is the eternal truth that never changes.",
    verse: {
      arabic: "فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ",
      text: "So exalted is Allah, the True King.",
      ref: "Quran 23:116",
    },
  },
  {
    name: "Al-Wakil",
    nameAr: "الوكيل",
    meaning: "The Trustee",
    explanation:
      "The One who is the ultimate disposer of affairs for those who rely upon Him. Whoever puts their trust in Allah, He is sufficient for them and will manage their affairs perfectly.",
    verse: {
      arabic: "وَكَفَىٰ بِاللَّهِ وَكِيلًا",
      text: "And sufficient is Allah as a Trustee.",
      ref: "Quran 4:81",
    },
  },
  {
    name: "Al-Qawiyy",
    nameAr: "القوي",
    meaning: "The Most Strong",
    explanation:
      "The One who possesses absolute and unlimited strength. His power never diminishes, fatigue never touches Him, and nothing can weaken or exhaust Him.",
    verse: {
      arabic: "إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ",
      text: "Indeed, it is Allah who is the Provider, the Firm Possessor of Strength.",
      ref: "Quran 51:58",
    },
  },
  {
    name: "Al-Matin",
    nameAr: "المتين",
    meaning: "The Firm",
    explanation:
      "The One whose strength is firm, steady, and unshakeable. His power is not subject to any weakness or fluctuation — it is constant and unchanging.",
    verse: {
      arabic: "إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ",
      text: "Indeed, it is Allah who is the Provider, the Firm Possessor of Strength.",
      ref: "Quran 51:58",
    },
  },
  {
    name: "Al-Waliyy",
    nameAr: "الولي",
    meaning: "The Protecting Friend",
    explanation:
      "The One who is the close friend, ally, and protector of the believers. He supports them, guides them, and defends them against their enemies.",
    verse: {
      arabic: "اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا",
      text: "Allah is the Protector of those who believe.",
      ref: "Quran 2:257",
    },
  },
  {
    name: "Al-Hamid",
    nameAr: "الحميد",
    meaning: "The Praiseworthy",
    explanation:
      "The One who is praised and deserves all praise in every circumstance. He is praised for His attributes, His actions, His blessings, and even for His tests — because all that He does is worthy of praise.",
    verse: {
      arabic: "يَا أَيُّهَا النَّاسُ أَنتُمُ الْفُقَرَاءُ إِلَى اللَّهِ وَاللَّهُ هُوَ الْغَنِيُّ الْحَمِيدُ",
      text: "O mankind, you are those in need of Allah, while Allah is the Self-Sufficient, the Praiseworthy.",
      ref: "Quran 35:15",
    },
  },
  {
    name: "Al-Muhsi",
    nameAr: "المحصي",
    meaning: "The Accounter",
    explanation:
      "The One who counts and enumerates everything. He knows the exact number of all things in creation — every grain of sand, every drop of rain, every deed of every soul.",
    verse: {
      arabic: "وَأَحْصَىٰ كُلَّ شَيْءٍ عَدَدًا",
      text: "And He has enumerated everything in number.",
      ref: "Quran 72:28",
    },
  },
  {
    name: "Al-Mubdi",
    nameAr: "المبدئ",
    meaning: "The Originator",
    explanation:
      "The One who originates creation without any prior model or material. He brought all things into being from nothing — the first creation, with no precedent.",
    verse: {
      arabic: "إِنَّهُ هُوَ يُبْدِئُ وَيُعِيدُ",
      text: "Indeed, it is He who originates and repeats.",
      ref: "Quran 85:13",
    },
  },
  {
    name: "Al-Mu'id",
    nameAr: "المعيد",
    meaning: "The Restorer",
    explanation:
      "The One who restores and brings back creation after its destruction. Just as He originated creation the first time, He will recreate it on the Day of Resurrection.",
    verse: {
      arabic: "إِنَّهُ هُوَ يُبْدِئُ وَيُعِيدُ",
      text: "Indeed, it is He who originates and repeats.",
      ref: "Quran 85:13",
    },
  },
  {
    name: "Al-Muhyi",
    nameAr: "المحيي",
    meaning: "The Giver of Life",
    explanation:
      "The One who gives life to all living things. He brings the dead earth to life with rain, breathes the soul into the body, and will give life to the dead on the Day of Resurrection.",
    verse: {
      arabic: "يُخْرِجُ الْحَيَّ مِنَ الْمَيِّتِ وَيُخْرِجُ الْمَيِّتَ مِنَ الْحَيِّ",
      text: "He brings the living out of the dead and brings the dead out of the living.",
      ref: "Quran 30:19",
    },
  },
  {
    name: "Al-Mumit",
    nameAr: "المميت",
    meaning: "The Bringer of Death",
    explanation:
      "The One who causes death and brings life to an end when He decrees. Every soul will taste death at its appointed time — no one can hasten it or delay it.",
    verse: {
      arabic: "كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ",
      text: "Every soul will taste death.",
      ref: "Quran 3:185",
    },
  },
  {
    name: "Al-Hayy",
    nameAr: "الحي",
    meaning: "The Ever-Living",
    explanation:
      "The One who possesses perfect and eternal life. His life has no beginning and no end — He never sleeps, never tires, and is never diminished. All other life depends on Him.",
    verse: {
      arabic: "اللَّهُ لَا إِلَـٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
      text: "Allah — there is no deity except Him, the Ever-Living, the Self-Sustaining.",
      ref: "Quran 2:255",
    },
  },
  {
    name: "Al-Qayyum",
    nameAr: "القيوم",
    meaning: "The Self-Sustaining",
    explanation:
      "The One who sustains Himself and sustains all of creation. He needs nothing and no one, while everything in existence depends entirely upon Him for its continued existence.",
    verse: {
      arabic: "اللَّهُ لَا إِلَـٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
      text: "Allah — there is no deity except Him, the Ever-Living, the Self-Sustaining.",
      ref: "Quran 2:255",
    },
  },
  {
    name: "Al-Wajid",
    nameAr: "الواجد",
    meaning: "The Finder",
    explanation:
      "The One who finds whatever He wishes and nothing is ever lost to Him. He is self-sufficient, lacking nothing, and possessing everything in abundance.",
  },
  {
    name: "Al-Majid",
    nameAr: "الماجد",
    meaning: "The Noble",
    explanation:
      "The One who is noble, illustrious, and full of glory. He combines supreme greatness with supreme generosity — He is noble in His essence and noble in His treatment of creation.",
  },
  {
    name: "Al-Wahid",
    nameAr: "الواحد",
    meaning: "The One",
    explanation:
      "The One who is uniquely singular in His essence, attributes, and actions. He has no partner, no equal, and no rival. There is nothing like Him.",
    verse: {
      arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
      text: "Say: He is Allah, the One.",
      ref: "Quran 112:1",
    },
  },
  {
    name: "As-Samad",
    nameAr: "الصمد",
    meaning: "The Eternal Refuge",
    explanation:
      "The One to whom all creation turns in their needs. He is the Master who is relied upon in all matters — self-sufficient, needing no one, while all others are in need of Him.",
    verse: {
      arabic: "اللَّهُ الصَّمَدُ",
      text: "Allah, the Eternal Refuge.",
      ref: "Quran 112:2",
    },
  },
  {
    name: "Al-Qadir",
    nameAr: "القادر",
    meaning: "The Able",
    explanation:
      "The One who has absolute power and ability over all things. Nothing is difficult for Him, and nothing is impossible when He wills it.",
    verse: {
      arabic: "قُلْ هُوَ الْقَادِرُ عَلَىٰ أَن يَبْعَثَ عَلَيْكُمْ عَذَابًا",
      text: "Say: He is able to send upon you affliction.",
      ref: "Quran 6:65",
    },
  },
  {
    name: "Al-Muqtadir",
    nameAr: "المقتدر",
    meaning: "The Powerful",
    explanation:
      "The One who has absolute and established power to do whatever He wills. This name emphasizes the totality and permanence of divine power — nothing can limit or restrict it.",
    verse: {
      arabic: "فِي مَقْعَدِ صِدْقٍ عِندَ مَلِيكٍ مُّقْتَدِرٍ",
      text: "In a seat of honor near a Sovereign, Perfect in Power.",
      ref: "Quran 54:55",
    },
  },
  {
    name: "Al-Muqaddim",
    nameAr: "المقدم",
    meaning: "The Expediter",
    explanation:
      "The One who brings forward whatever He wills. He advances some over others in rank, provision, time, or status — all according to His perfect wisdom.",
  },
  {
    name: "Al-Mu'akhkhir",
    nameAr: "المؤخر",
    meaning: "The Delayer",
    explanation:
      "The One who delays whatever He wills. He puts things in their proper place and time — some things are delayed as a test, others as mercy, all according to His perfect plan.",
  },
  {
    name: "Al-Awwal",
    nameAr: "الأول",
    meaning: "The First",
    explanation:
      "The One who existed before all of creation, with no beginning. Nothing preceded Him — He is the origin and cause of all existence.",
    verse: {
      arabic: "هُوَ الْأَوَّلُ وَالْآخِرُ وَالظَّاهِرُ وَالْبَاطِنُ",
      text: "He is the First and the Last, the Manifest and the Hidden.",
      ref: "Quran 57:3",
    },
  },
  {
    name: "Al-Akhir",
    nameAr: "الآخر",
    meaning: "The Last",
    explanation:
      "The One who will remain after all of creation ceases to exist. Everything will perish except Him — He is the eternal, everlasting, with no end.",
    verse: {
      arabic: "هُوَ الْأَوَّلُ وَالْآخِرُ وَالظَّاهِرُ وَالْبَاطِنُ",
      text: "He is the First and the Last, the Manifest and the Hidden.",
      ref: "Quran 57:3",
    },
  },
  {
    name: "Az-Zahir",
    nameAr: "الظاهر",
    meaning: "The Manifest",
    explanation:
      "The One whose existence is evident through His signs and creation. The evidence of His existence is apparent everywhere — in the heavens, the earth, and within ourselves.",
    verse: {
      arabic: "هُوَ الْأَوَّلُ وَالْآخِرُ وَالظَّاهِرُ وَالْبَاطِنُ",
      text: "He is the First and the Last, the Manifest and the Hidden.",
      ref: "Quran 57:3",
    },
  },
  {
    name: "Al-Batin",
    nameAr: "الباطن",
    meaning: "The Hidden",
    explanation:
      "The One whose essence is hidden from human perception. No vision can encompass Him, no mind can fully comprehend Him. The Prophet ﷺ said: 'You are Al-Batin, and there is nothing beneath You' — meaning nothing is hidden from His knowledge, and His awareness is closer to us than our own jugular vein.",
    verse: {
      arabic: "هُوَ الْأَوَّلُ وَالْآخِرُ وَالظَّاهِرُ وَالْبَاطِنُ",
      text: "He is the First and the Last, the Manifest and the Hidden.",
      ref: "Quran 57:3",
    },
  },
  {
    name: "Al-Wali",
    nameAr: "الوالي",
    meaning: "The Governing Lord",
    explanation:
      "The One who governs and manages all the affairs of creation. He is the sovereign authority who administers the universe — nothing happens outside His governance.",
  },
  {
    name: "Al-Muta'ali",
    nameAr: "المتعالي",
    meaning: "The Most Exalted",
    explanation:
      "The One who is exalted above everything. He transcends all that His creation can conceive — above all imperfections, above all comparisons, above all limitations.",
    verse: {
      arabic: "عَالِمُ الْغَيْبِ وَالشَّهَادَةِ الْكَبِيرُ الْمُتَعَالِ",
      text: "Knower of the unseen and the witnessed, the Greatest, the Most Exalted.",
      ref: "Quran 13:9",
    },
  },
  {
    name: "Al-Barr",
    nameAr: "البر",
    meaning: "The Source of Goodness",
    explanation:
      "The One who is the source of all goodness, kindness, and righteousness. He treats His servants with gentleness and generosity far beyond what they deserve.",
    verse: {
      arabic: "إِنَّهُ هُوَ الْبَرُّ الرَّحِيمُ",
      text: "Indeed, it is He who is the Source of Goodness, the Merciful.",
      ref: "Quran 52:28",
    },
  },
  {
    name: "At-Tawwab",
    nameAr: "التواب",
    meaning: "The Acceptor of Repentance",
    explanation:
      "The One who constantly turns toward His servants with forgiveness. He not only accepts repentance but actively guides people toward it — inspiring them to return to Him again and again.",
    verse: {
      arabic: "وَأَنَّ اللَّهَ هُوَ التَّوَّابُ الرَّحِيمُ",
      text: "And that Allah is the Ever-Accepting of repentance, the Merciful.",
      ref: "Quran 49:12",
    },
  },
  {
    name: "Al-Muntaqim",
    nameAr: "المنتقم",
    meaning: "The Avenger",
    explanation:
      "The One who takes retribution against those who persist in transgression and oppression. His vengeance is not unjust — it is the perfect consequence for those who reject truth and persist in evil.",
    verse: {
      arabic: "إِنَّا مِنَ الْمُجْرِمِينَ مُنتَقِمُونَ",
      text: "Indeed, from the criminals We will take retribution.",
      ref: "Quran 32:22",
    },
  },
  {
    name: "Al-Afuww",
    nameAr: "العفو",
    meaning: "The Pardoner",
    explanation:
      "The One who pardons sins and wipes them away completely. While Al-Ghafur covers sins, Al-Afuww erases them as if they never existed — a level of forgiveness beyond mere concealment.",
    verse: {
      arabic: "إِنَّ اللَّهَ كَانَ عَفُوًّا غَفُورًا",
      text: "Indeed, Allah is ever Pardoning and Forgiving.",
      ref: "Quran 4:43",
    },
  },
  {
    name: "Ar-Ra'uf",
    nameAr: "الرؤوف",
    meaning: "The Most Kind",
    explanation:
      "The One who shows the utmost kindness and compassion. His compassion is tender and merciful — He does not burden souls beyond their capacity and always provides a way out.",
    verse: {
      arabic: "إِنَّ اللَّهَ بِالنَّاسِ لَرَءُوفٌ رَّحِيمٌ",
      text: "Indeed, Allah is, to the people, Kind and Merciful.",
      ref: "Quran 2:143",
    },
  },
  {
    name: "Malik al-Mulk",
    nameAr: "مالك الملك",
    meaning: "Owner of Sovereignty",
    explanation:
      "The One who owns all sovereignty and dominion. He gives authority to whom He wills and takes it away from whom He wills — all worldly power is merely borrowed from Him.",
    verse: {
      arabic: "قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَن تَشَاءُ وَتَنزِعُ الْمُلْكَ مِمَّن تَشَاءُ",
      text: "Say: O Allah, Owner of Sovereignty, You give sovereignty to whom You will and You take it away from whom You will.",
      ref: "Quran 3:26",
    },
  },
  {
    name: "Dhul-Jalali wal-Ikram",
    nameAr: "ذو الجلال والإكرام",
    meaning: "Lord of Majesty & Generosity",
    explanation:
      "The One who possesses both supreme majesty and supreme generosity. He combines awe-inspiring greatness with boundless kindness — to be revered and loved simultaneously.",
    verse: {
      arabic: "تَبَارَكَ اسْمُ رَبِّكَ ذِي الْجَلَالِ وَالْإِكْرَامِ",
      text: "Blessed is the name of your Lord, Owner of Majesty and Generosity.",
      ref: "Quran 55:78",
    },
  },
  {
    name: "Al-Muqsit",
    nameAr: "المقسط",
    meaning: "The Equitable",
    explanation:
      "The One who acts with perfect equity and fairness. He establishes justice among His creation and never allows injustice to stand on the Day of Judgment.",
    verse: {
      arabic: "شَهِدَ اللَّهُ أَنَّهُ لَا إِلَـٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ قَائِمًا بِالْقِسْطِ",
      text: "Allah witnesses that there is no deity except Him, and the angels and those of knowledge — maintaining justice.",
      ref: "Quran 3:18",
    },
  },
  {
    name: "Al-Jami",
    nameAr: "الجامع",
    meaning: "The Gatherer",
    explanation:
      "The One who gathers all of creation on the Day of Judgment. He will bring together every soul that ever lived — and nothing will be missing, not a single person or deed.",
    verse: {
      arabic: "رَبَّنَا إِنَّكَ جَامِعُ النَّاسِ لِيَوْمٍ لَّا رَيْبَ فِيهِ",
      text: "Our Lord, surely You will gather the people for a Day about which there is no doubt.",
      ref: "Quran 3:9",
    },
  },
  {
    name: "Al-Ghaniyy",
    nameAr: "الغني",
    meaning: "The Self-Sufficient",
    explanation:
      "The One who is absolutely free of any need. He does not need the worship of His creation, their obedience, or anything else. All of creation is in need of Him, while He is in need of nothing.",
    verse: {
      arabic: "يَا أَيُّهَا النَّاسُ أَنتُمُ الْفُقَرَاءُ إِلَى اللَّهِ وَاللَّهُ هُوَ الْغَنِيُّ الْحَمِيدُ",
      text: "O mankind, you are those in need of Allah, while Allah is the Self-Sufficient, the Praiseworthy.",
      ref: "Quran 35:15",
    },
  },
  {
    name: "Al-Mughni",
    nameAr: "المغني",
    meaning: "The Enricher",
    explanation:
      "The One who enriches and satisfies His creation. He makes the poor wealthy, the weak strong, and the empty heart full — all provision and enrichment come from Him alone.",
    verse: {
      arabic: "وَأَنَّهُ هُوَ أَغْنَىٰ وَأَقْنَىٰ",
      text: "And that it is He who enriches and suffices.",
      ref: "Quran 53:48",
    },
  },
  {
    name: "Al-Mani",
    nameAr: "المانع",
    meaning: "The Withholder",
    explanation:
      "The One who prevents and withholds as He wills. He prevents harm from reaching His servants, and He withholds provision or blessings when it is part of His wise plan.",
  },
  {
    name: "Ad-Darr",
    nameAr: "الضار",
    meaning: "The Distresser",
    explanation:
      "The One who creates distress and hardship as a test or purification. Trials come only by His decree and serve a purpose — to purify souls, elevate ranks, and draw people back to Him.",
  },
  {
    name: "An-Nafi",
    nameAr: "النافع",
    meaning: "The Propitious",
    explanation:
      "The One who creates benefit and good. All benefit in this world and the next originates from Him — no one can bring benefit to themselves or others except by His permission.",
  },
  {
    name: "An-Nur",
    nameAr: "النور",
    meaning: "The Light",
    explanation:
      "The One who is the light of the heavens and the earth. He illuminates hearts with faith, illuminates creation with the sun and stars, and His guidance is a light that dispels all darkness.",
    verse: {
      arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
      text: "Allah is the Light of the heavens and the earth.",
      ref: "Quran 24:35",
    },
  },
  {
    name: "Al-Hadi",
    nameAr: "الهادي",
    meaning: "The Guide",
    explanation:
      "The One who guides creation to what benefits them. He guides the heart to faith, the lost to the path, and every creature to its sustenance and purpose. True guidance belongs to Him alone.",
    verse: {
      arabic: "وَإِنَّ اللَّهَ لَهَادِ الَّذِينَ آمَنُوا إِلَىٰ صِرَاطٍ مُّسْتَقِيمٍ",
      text: "And indeed, Allah is the Guide of those who have believed to a straight path.",
      ref: "Quran 22:54",
    },
  },
  {
    name: "Al-Badi",
    nameAr: "البديع",
    meaning: "The Incomparable",
    explanation:
      "The One who originates creation in a wondrous, unprecedented way. His creation is unique and without any prior model — everything He makes is original, innovative, and beyond imitation.",
    verse: {
      arabic: "بَدِيعُ السَّمَاوَاتِ وَالْأَرْضِ",
      text: "Originator of the heavens and the earth.",
      ref: "Quran 2:117",
    },
  },
  {
    name: "Al-Baqi",
    nameAr: "الباقي",
    meaning: "The Everlasting",
    explanation:
      "The One who remains forever after all of creation perishes. Everything in this world is temporary and will come to an end, but He alone is everlasting and eternal.",
    verse: {
      arabic: "وَيَبْقَىٰ وَجْهُ رَبِّكَ ذُو الْجَلَالِ وَالْإِكْرَامِ",
      text: "And there will remain the Face of your Lord, Owner of Majesty and Generosity.",
      ref: "Quran 55:27",
    },
  },
  {
    name: "Al-Warith",
    nameAr: "الوارث",
    meaning: "The Inheritor",
    explanation:
      "The One who inherits all of creation after everything perishes. When all owners are gone and all possessions abandoned, everything returns to its true owner — Allah.",
    verse: {
      arabic: "وَإِنَّا لَنَحْنُ نُحْيِي وَنُمِيتُ وَنَحْنُ الْوَارِثُونَ",
      text: "And indeed, it is We who give life and cause death, and We are the Inheritors.",
      ref: "Quran 15:23",
    },
  },
  {
    name: "Ar-Rashid",
    nameAr: "الرشيد",
    meaning: "The Guide to the Right Path",
    explanation:
      "The One who directs all things to their proper course with perfect wisdom. His guidance leads to the right path, and His direction of affairs is always toward what is best.",
  },
  {
    name: "As-Sabur",
    nameAr: "الصبور",
    meaning: "The Patient",
    explanation:
      "The One who is infinitely patient with His creation. He does not hasten punishment for those who disobey Him, giving them time and opportunity to repent and return to Him.",
  },
];

export default namesOfAllah;
