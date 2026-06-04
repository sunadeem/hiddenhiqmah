export interface WifeNode {
  name: string;
  nameAr?: string;
  description?: string;
}

export interface FamilyNode {
  name: string;
  nameAr?: string;
  isProphet: boolean;
  slug?: string; // links to prophet detail page if prophet
  note?: string; // short context shown on click
  description?: string; // longer description for detail panel
  gap?: boolean; // true = multiple generations between parent and this node
  wives?: WifeNode[];
  children?: FamilyNode[];
}

// Based on Ibn Kathir's Al-Bidaya wan-Nihaya, Qasas al-Anbiya,
// and authenticated Quranic/Hadith references.
// "gap: true" indicates multiple unknown generations between nodes.

export const familyTree: FamilyNode = {
  name: "Adam",
  nameAr: "آدم",
  isProphet: true,
  slug: "adam",
  note: "First human and prophet",
  wives: [
    {
      name: "Hawwa (Eve)",
      nameAr: "حواء",
      description: "Hawwa (Eve) was the first woman, created by Allah as a companion for Adam. She and Adam lived in Jannah before being sent to earth. She is the mother of all humanity. The Quran addresses both Adam and Hawwa together regarding their test in the Garden (Quran 7:19-25).",
    },
  ],
  children: [
    {
      name: "Habil (Abel)",
      nameAr: "هابيل",
      isProphet: false,
      note: "Killed by his brother Qabil",
      description: "Habil (Abel) was the righteous son of Adam who offered a sincere sacrifice to Allah which was accepted. His brother Qabil became jealous and killed him, making it the first murder in human history. The story is mentioned in Quran 5:27-31 as a lesson about envy and the sanctity of life.",
    },
    {
      name: "Qabil (Cain)",
      nameAr: "قابيل",
      isProphet: false,
      note: "Committed the first murder",
      description: "Qabil (Cain) committed the first murder in human history by killing his brother Habil out of jealousy when Allah accepted Habil's sacrifice but rejected his own. The Quran states that he became filled with regret and did not even know how to bury his brother until a crow showed him (Quran 5:27-31).",
    },
    {
      name: "Shith (Seth)",
      nameAr: "شيث",
      isProphet: true,
      slug: "shith",
      note: "Received 50 scriptures",
      children: [
        {
          name: "Idris (Enoch)",
          nameAr: "إدريس",
          isProphet: true,
          slug: "idris",
          gap: true,
          note: "Raised to a high station",
          children: [
            {
              name: "Nuh (Noah)",
              nameAr: "نوح",
              isProphet: true,
              slug: "nuh",
              gap: true,
              note: "Preached for 950 years",
              wives: [
                {
                  name: "Waila",
                  nameAr: "واعلة",
                  description: "The wife of Prophet Nuh is not named in the Quran but is mentioned as an example of disbelief: 'Allah presents an example of those who disbelieved: the wife of Nuh and the wife of Lut' (Quran 66:10). She betrayed her husband's mission by not believing in his message despite living with a prophet. Some scholars name her Waila or Amzurah.",
                },
              ],
              children: [
                {
                  name: "Sam (Shem)",
                  nameAr: "سام",
                  isProphet: false,
                  note: "Ancestor of Semitic peoples",
                  description: "Sam (Shem) was the eldest son of Prophet Nuh (Noah) and is considered the ancestor of the Semitic peoples, including the Arabs and Israelites. Through his lineage came the majority of the prophets mentioned in the Quran. He is believed to have been righteous and followed his father's teachings.",
                  children: [
                    {
                      name: "Hud",
                      nameAr: "هود",
                      isProphet: true,
                      slug: "hud",
                      gap: true,
                      note: "Sent to the people of 'Ad",
                    },
                    {
                      name: "Salih",
                      nameAr: "صالح",
                      isProphet: true,
                      slug: "salih",
                      gap: true,
                      note: "Sent to the people of Thamud",
                    },
                    {
                      name: "Azar (Tarakh)",
                      nameAr: "آزر",
                      isProphet: false,
                      gap: true,
                      note: "Father of Ibrahim (Quran 6:74)",
                      description: "Azar is mentioned in the Quran (6:74) as the father of Ibrahim. He was an idol-maker and idol-worshipper in the city of Ur. Ibrahim repeatedly called him to monotheism, but Azar rejected his son's message. Their exchange is recorded in Quran 19:41-48 and 6:74, showing Ibrahim's respectful yet firm stance against his father's polytheism.",
                      children: [
                        {
                          name: "Ibrahim (Abraham)",
                          nameAr: "إبراهيم",
                          isProphet: true,
                          slug: "ibrahim",
                          note: "Khalilullah — Friend of Allah",
                          wives: [
                            {
                              name: "Sarah",
                              nameAr: "سارة",
                              description: "Sarah was the first wife of Prophet Ibrahim and the mother of Prophet Ishaq (Isaac). She was known for her beauty and piety. When she was elderly and beyond childbearing age, angels brought the miraculous news that she would bear a son, Ishaq. She laughed in amazement at this news (Quran 11:71-72). She is highly regarded in Islamic tradition.",
                            },
                            {
                              name: "Hajar (Hagar)",
                              nameAr: "هاجر",
                              description: "Hajar was the second wife of Prophet Ibrahim and the mother of Prophet Ismail. Ibrahim left her and infant Ismail in the barren valley of Makkah by Allah's command. Her desperate search for water between the hills of Safa and Marwa is commemorated in the Hajj pilgrimage (Sa'i). Allah caused the well of Zamzam to spring forth for her and her son. The Prophet ﷺ said: 'May Allah have mercy on the mother of Ismail' (Bukhari 60:38).",
                            },
                          ],
                          children: [
                            {
                              name: "Ismail (Ishmael)",
                              nameAr: "إسماعيل",
                              isProphet: true,
                              slug: "ismail",
                              note: "From Hajar. Built the Kaaba with Ibrahim",
                              children: [
                                {
                                  name: "Adnan",
                                  nameAr: "عدنان",
                                  isProphet: false,
                                  gap: true,
                                  note: "Ancestor of northern Arab tribes",
                                  description: "Adnan is considered the ancestor of the northern Arab tribes (Adnanites), including the Quraysh. The Prophet Muhammad ﷺ traced his lineage to Adnan, and scholars agree on the genealogy from Adnan to the Prophet. The generations between Ismail and Adnan are disputed, which is why the Prophet ﷺ himself stopped his genealogy at Adnan (narrated by Ibn Abbas).",
                                  children: [
                                    {
                                      name: "Abd al-Muttalib",
                                      nameAr: "عبد المطلب",
                                      isProphet: false,
                                      gap: true,
                                      note: "Grandfather of the Prophet ﷺ. Chief of Quraysh. Rediscovered Zamzam",
                                      description: "Abd al-Muttalib (Shaybah ibn Hashim) was the grandfather of Prophet Muhammad ﷺ and the chief of the Quraysh tribe. He rediscovered the well of Zamzam, which had been lost for generations. He was entrusted with providing water to the pilgrims (Siqayah). During the Year of the Elephant, when Abrahah marched to destroy the Kaaba, Abd al-Muttalib famously said 'The House has a Lord who will protect it.' He cared for the young Muhammad ﷺ after the death of Abdullah and Aminah.",
                                      children: [
                                        {
                                          name: "Abu Talib",
                                          nameAr: "أبو طالب",
                                          isProphet: false,
                                          note: "Uncle and protector of Muhammad ﷺ",
                                          description: "Abu Talib ibn Abd al-Muttalib was the uncle who raised Prophet Muhammad ﷺ after the death of his grandfather. He was the chief of Banu Hashim and provided crucial protection to the Prophet during the early years of Islam in Makkah. Despite never publicly accepting Islam, he shielded Muhammad ﷺ from the persecution of the Quraysh. His death in 619 CE, known as the Year of Sorrow, left the Prophet ﷺ vulnerable and was one of the most difficult periods of his life.",
                                          wives: [
                                            {
                                              name: "Fatimah bint Asad",
                                              nameAr: "فاطمة بنت أسد",
                                              description: "Fatimah bint Asad was the wife of Abu Talib and the mother of Ali ibn Abi Talib. She was among the early Muslims and was like a mother to the Prophet Muhammad ﷺ, who grew up in her household. When she died, the Prophet ﷺ wrapped her in his own shirt and prayed over her.",
                                            },
                                          ],
                                          children: [
                                            {
                                              name: "Ali ibn Abi Talib",
                                              nameAr: "علي",
                                              isProphet: false,
                                              note: "4th Caliph. Married Fatimah. 'Gate to the city of knowledge'",
                                              description: "Ali ibn Abi Talib was the cousin and son-in-law of the Prophet Muhammad ﷺ, and the fourth Rightly Guided Caliph. He was among the first to accept Islam (as a child) and was known for his bravery, knowledge, and piety. The Prophet ﷺ said: 'I am the city of knowledge and Ali is its gate' (al-Hakim). He married Fatimah, the Prophet's beloved daughter, and from them came Hasan and Husayn. He served as Caliph from 656-661 CE.",
                                            },
                                          ],
                                        },
                                        {
                                          name: "Hamzah",
                                          nameAr: "حمزة",
                                          isProphet: false,
                                          note: "Uncle of Muhammad ﷺ. Lion of Allah. Martyred at Uhud",
                                          description: "Hamzah ibn Abd al-Muttalib was the uncle of the Prophet Muhammad ﷺ and one of the greatest warriors of early Islam. Known as Asadullah (Lion of Allah) and Sayyid al-Shuhada (Master of Martyrs), he accepted Islam in the 6th year of prophethood and was a fierce defender of the faith. He was martyred at the Battle of Uhud in 625 CE. The Prophet ﷺ was deeply grieved by his death and called him the best of his uncles.",
                                        },
                                        {
                                          name: "Abdullah ibn Abd al-Muttalib",
                                          nameAr: "عبد الله",
                                          isProphet: false,
                                          note: "Father of Prophet Muhammad ﷺ. Died before his birth",
                                          description: "Abdullah ibn Abd al-Muttalib was the father of the Prophet Muhammad ﷺ. He was the youngest and most beloved son of Abd al-Muttalib. He married Aminah bint Wahb and died while on a trading journey to Syria, before Muhammad ﷺ was born. His early death meant the Prophet ﷺ was raised as an orphan, a condition the Quran references: 'Did He not find you an orphan and give you shelter?' (Quran 93:6).",
                                          wives: [
                                            {
                                              name: "Aminah bint Wahb",
                                              nameAr: "آمنة بنت وهب",
                                              description: "Aminah bint Wahb was the mother of Prophet Muhammad ﷺ. She was from the Banu Zuhrah clan of Quraysh. After Abdullah's death during her pregnancy, she raised Muhammad ﷺ until her own death when he was six years old. She passed away at al-Abwa during a return journey from Madinah where she had visited Abdullah's grave.",
                                            },
                                          ],
                                          children: [
                                            {
                                              name: "Muhammad ﷺ",
                                              nameAr: "محمد ﷺ",
                                              isProphet: true,
                                              slug: "muhammad",
                                              note: "Seal of the Prophets",
                                              wives: [
                                                {
                                                  name: "Khadijah",
                                                  nameAr: "خديجة",
                                                  description: "Khadijah bint Khuwaylid was the first wife of the Prophet Muhammad ﷺ and the first person to accept Islam. She was a successful businesswoman of Quraysh. She supported the Prophet ﷺ through the early difficult years of revelation and persecution. The Prophet ﷺ said: 'The best of its women is Maryam and the best of its women is Khadijah' (Bukhari 60:103). She is the mother of all of the Prophet's children except Ibrahim.",
                                                },
                                                {
                                                  name: "Aisha",
                                                  nameAr: "عائشة",
                                                  description: "Aisha bint Abu Bakr was the daughter of Abu Bakr al-Siddiq and one of the wives of the Prophet Muhammad ﷺ. She was one of the greatest scholars of Islam, narrating over 2,200 hadiths. The Prophet ﷺ said: 'Take half of your religion from this Humaira (Aisha).' She was known for her sharp intellect, memory, and deep understanding of Islamic jurisprudence.",
                                                },
                                                {
                                                  name: "Hafsa",
                                                  nameAr: "حفصة",
                                                  description: "Hafsa bint Umar was the daughter of Umar ibn al-Khattab and a wife of the Prophet Muhammad ﷺ. She was entrusted with the safekeeping of the written compilation of the Quran after the death of her father. She was known for her devotion to worship, fasting, and prayer.",
                                                },
                                                {
                                                  name: "Zaynab bint Khuzaymah",
                                                  nameAr: "زينب بنت خزيمة",
                                                  description: "Zaynab bint Khuzaymah was known as 'Umm al-Masakin' (Mother of the Poor) for her generosity and care for the needy. She married the Prophet Muhammad ﷺ after the martyrdom of her previous husband at the Battle of Badr. She passed away only a few months after the marriage.",
                                                },
                                                {
                                                  name: "Umm Salamah",
                                                  nameAr: "أم سلمة",
                                                  description: "Umm Salamah (Hind bint Abi Umayyah) was one of the wives of the Prophet Muhammad ﷺ. She was known for her wisdom, intelligence, and counsel. She advised the Prophet ﷺ during the Treaty of Hudaybiyyah. She was among the early emigrants to Abyssinia and later to Madinah, enduring great hardship for the sake of Islam.",
                                                },
                                                {
                                                  name: "Zaynab bint Jahsh",
                                                  nameAr: "زينب بنت جحش",
                                                  description: "Zaynab bint Jahsh was a wife of the Prophet Muhammad ﷺ and his cousin. Her marriage to the Prophet was ordained by Allah directly (Quran 33:37). She was known for her generosity, piety, and skill in leatherwork. She was the first of the Prophet's wives to pass away after him.",
                                                },
                                                {
                                                  name: "Juwayriyah",
                                                  nameAr: "جويرية",
                                                  description: "Juwayriyah bint al-Harith was the daughter of the chief of Banu Mustaliq. Her marriage to the Prophet Muhammad ﷺ led to the release of many captives from her tribe, as the Muslims freed them out of respect for the Prophet's new family ties. She was known for her constant remembrance of Allah (dhikr).",
                                                },
                                                {
                                                  name: "Umm Habibah",
                                                  nameAr: "أم حبيبة",
                                                  description: "Umm Habibah (Ramlah bint Abi Sufyan) was a wife of the Prophet Muhammad ﷺ. She was the daughter of Abu Sufyan, a prominent leader of Quraysh. She was among the early emigrants to Abyssinia, where her first husband apostated. Despite her family's opposition to Islam, she remained firm in her faith.",
                                                },
                                                {
                                                  name: "Safiyyah",
                                                  nameAr: "صفية",
                                                  description: "Safiyyah bint Huyayy was a wife of the Prophet Muhammad ﷺ. She was of noble Jewish descent, tracing her lineage to Prophet Harun (Aaron). After the Battle of Khaybar, the Prophet ﷺ freed her and married her. She was known for her intelligence, beauty, and dignified character.",
                                                },
                                                {
                                                  name: "Maymunah",
                                                  nameAr: "ميمونة",
                                                  description: "Maymunah bint al-Harith was the last wife the Prophet Muhammad ﷺ married. Her original name was Barrah, and the Prophet ﷺ renamed her Maymunah (blessed). She was known for her piety and devotion to worship. She passed away in Sarif, the same place where her marriage to the Prophet took place.",
                                                },
                                                {
                                                  name: "Sawdah",
                                                  nameAr: "سودة",
                                                  description: "Sawdah bint Zam'ah was the second wife of the Prophet Muhammad ﷺ, married after the death of Khadijah. She was among the early Muslims who emigrated to Abyssinia. She was known for her kindness, generosity, and sense of humor. She selflessly gave her allotted day with the Prophet to Aisha.",
                                                },
                                              ],
                                              children: [
                                                {
                                                  name: "Qasim",
                                                  nameAr: "القاسم",
                                                  isProphet: false,
                                                  note: "First son, from Khadijah. Died in infancy",
                                                },
                                                {
                                                  name: "Zaynab",
                                                  nameAr: "زينب",
                                                  isProphet: false,
                                                  note: "Eldest daughter, from Khadijah. Married Abu al-As",
                                                },
                                                {
                                                  name: "Ruqayyah",
                                                  nameAr: "رقية",
                                                  isProphet: false,
                                                  note: "Daughter, from Khadijah. Married Uthman ibn Affan",
                                                },
                                                {
                                                  name: "Umm Kulthum",
                                                  nameAr: "أم كلثوم",
                                                  isProphet: false,
                                                  note: "Daughter, from Khadijah. Also married Uthman after Ruqayyah",
                                                },
                                                {
                                                  name: "Fatimah",
                                                  nameAr: "فاطمة",
                                                  isProphet: false,
                                                  note: "Youngest daughter, from Khadijah. Leader of women in Jannah",
                                                  description: "Fatimah al-Zahra was the youngest and most beloved daughter of the Prophet Muhammad ﷺ from Khadijah. The Prophet ﷺ said she is 'the leader of the women of Jannah' (Bukhari 62:98). She married Ali ibn Abi Talib and was the mother of Hasan and Husayn, through whom the Prophet's lineage continues. She was known for her piety, modesty, and resemblance to her father in speech and mannerisms. She passed away six months after the Prophet ﷺ.",
                                                  children: [
                                                    {
                                                      name: "Hasan",
                                                      nameAr: "الحسن",
                                                      isProphet: false,
                                                      note: "Grandson of the Prophet ﷺ. Leader of the youth of Jannah",
                                                      description: "Hasan ibn Ali was the elder grandson of the Prophet Muhammad ﷺ. The Prophet said: 'Hasan and Husayn are the leaders of the youth of Jannah' (Sunan al-Tirmidhi 49:167). He briefly served as Caliph after Ali's assassination but stepped down in favor of Muawiyah to prevent further bloodshed among Muslims, fulfilling the Prophet's prophecy: 'This son of mine is a leader, and perhaps Allah will make peace between two great groups of Muslims through him' (Bukhari 65:272).",
                                                    },
                                                    {
                                                      name: "Husayn",
                                                      nameAr: "الحسين",
                                                      isProphet: false,
                                                      note: "Grandson of the Prophet ﷺ. Martyred at Karbala",
                                                      description: "Husayn ibn Ali was the younger grandson of the Prophet Muhammad ﷺ. He is revered for his stand against injustice at the Battle of Karbala in 680 CE, where he and many of his family were martyred by the forces of Yazid ibn Muawiyah. His sacrifice is seen as a powerful example of standing for truth against tyranny. The Prophet ﷺ loved him dearly and said: 'Husayn is from me, and I am from Husayn' (Sunan al-Tirmidhi 49:174).",
                                                    },
                                                  ],
                                                },
                                                {
                                                  name: "Abdullah",
                                                  nameAr: "عبد الله",
                                                  isProphet: false,
                                                  note: "Son from Khadijah. Also called al-Tayyib/al-Tahir. Died in infancy",
                                                },
                                                {
                                                  name: "Ibrahim",
                                                  nameAr: "إبراهيم",
                                                  isProphet: false,
                                                  note: "Son from Mariyah al-Qibtiyyah. Died in infancy",
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              name: "Ishaq (Isaac)",
                              nameAr: "إسحاق",
                              isProphet: true,
                              slug: "ishaq",
                              note: "From Sarah. Born miraculously",
                              children: [
                                {
                                  name: "Al-Eis (Esau)",
                                  nameAr: "العيص",
                                  isProphet: false,
                                  note: "Twin brother of Yaqub",
                                  description: "Al-Eis (Esau) was the twin brother of Prophet Yaqub (Jacob). According to some scholars, through his descendants came Prophet Ayyub (Job), though this lineage is debated. He is mentioned in Israelite traditions as the ancestor of the Edomites.",
                                  children: [
                                    {
                                      name: "Ayyub (Job)",
                                      nameAr: "أيوب",
                                      isProphet: true,
                                      slug: "ayyub",
                                      gap: true,
                                      note: "Model of patience. Lineage debated — some scholars say from Ishaq's line directly",
                                      wives: [
                                        {
                                          name: "Rahmah",
                                          nameAr: "رحمة",
                                          description: "Rahmah (also known as Liyya in some sources) was the wife of Prophet Ayyub. She stood by him through his long years of illness and hardship with extraordinary patience and devotion, working to support them both when he lost everything. She is considered one of the most loyal wives in Islamic tradition. Some scholars identify her as a descendant of Prophet Yusuf.",
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Yaqub (Jacob/Israel)",
                                  nameAr: "يعقوب",
                                  isProphet: true,
                                  slug: "yaqub",
                                  note: "Also known as Israel",
                                  wives: [
                                    {
                                      name: "Rahil (Rachel)",
                                      nameAr: "راحيل",
                                      description: "Rahil (Rachel) was the beloved wife of Prophet Yaqub (Jacob). She was the mother of Prophets Yusuf (Joseph) and Binyamin (Benjamin). According to tradition, Yaqub worked for many years to earn the right to marry her. She is remembered in Islamic tradition for her beauty and patience.",
                                    },
                                    {
                                      name: "Liya (Leah)",
                                      nameAr: "ليا",
                                      description: "Liya (Leah) was a wife of Prophet Yaqub (Jacob) and the mother of several of his sons, including Lawi (Levi) and Yahudha (Judah). Through Lawi came Prophets Musa and Harun, and through Yahudha came Prophets Dawud and Sulayman.",
                                    },
                                  ],
                                  children: [
                                    {
                                      name: "Yusuf (Joseph)",
                                      nameAr: "يوسف",
                                      isProphet: true,
                                      slug: "yusuf",
                                      note: "Son of Rahil. Minister of Egypt",
                                      wives: [
                                        {
                                          name: "Zulaykha",
                                          nameAr: "زليخا",
                                          description: "Zulaykha (also referred to as the wife of al-Aziz in the Quran) is mentioned in Surah Yusuf. According to many classical scholars and traditions, after years of repentance, she eventually married Prophet Yusuf. Her story of desire, repentance, and eventual redemption is one of the most detailed narratives in the Quran (Surah 12).",
                                        },
                                      ],
                                    },
                                    {
                                      name: "Lawi (Levi)",
                                      nameAr: "لاوي",
                                      isProphet: false,
                                      note: "Son of Liya. Ancestor of the priestly tribe",
                                      description: "Lawi (Levi) was one of the twelve sons of Prophet Yaqub (Jacob). He is the ancestor of the Levites, the priestly tribe of Bani Israel. From his descendants came Prophets Musa (Moses) and Harun (Aaron), who led the Israelites out of Egypt.",
                                      children: [
                                        {
                                          name: "Imran (father of Musa)",
                                          nameAr: "عمران",
                                          isProphet: false,
                                          gap: true,
                                          note: "Father of Musa and Harun",
                                          wives: [
                                            {
                                              name: "Yukabid",
                                              nameAr: "يوكابد",
                                              description: "Yukabid (Jochebed) was the mother of Prophets Musa (Moses) and Harun (Aaron) and their sister Maryam. When Pharaoh ordered the killing of all newborn Israelite boys, Allah inspired her to place baby Musa in a basket on the river Nile: 'We inspired the mother of Musa: Suckle him, and when you fear for him, cast him into the river' (Quran 28:7). Allah returned Musa to her as his wet nurse.",
                                            },
                                          ],
                                          children: [
                                            {
                                              name: "Musa (Moses)",
                                              nameAr: "موسى",
                                              isProphet: true,
                                              slug: "musa",
                                              note: "Kalimullah — spoke directly to Allah",
                                              wives: [
                                                {
                                                  name: "Safura",
                                                  nameAr: "صفورة",
                                                  description: "Safura (Zipporah) was one of the daughters of Prophet Shu'ayb (according to many scholars) whom Musa married after fleeing Egypt to Madyan. The Quran mentions how Musa helped water her flock, and her father offered one of his daughters in marriage: 'I wish to wed one of these two daughters of mine to you, on condition that you serve me for eight years' (Quran 28:27).",
                                                },
                                              ],
                                            },
                                            {
                                              name: "Harun (Aaron)",
                                              nameAr: "هارون",
                                              isProphet: true,
                                              slug: "harun",
                                              note: "Brother of Musa",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      name: "Yahudha (Judah)",
                                      nameAr: "يهوذا",
                                      isProphet: false,
                                      note: "Son of Liya. Ancestor of the royal tribe",
                                      description: "Yahudha (Judah) was one of the twelve sons of Prophet Yaqub (Jacob). He is the ancestor of the royal tribe of Bani Israel. From his lineage came Prophets Dawud (David) and Sulayman (Solomon), who were both kings and prophets. The name 'Yahud' (Jews) is derived from his name.",
                                      children: [
                                        {
                                          name: "Dawud (David)",
                                          nameAr: "داود",
                                          isProphet: true,
                                          slug: "dawud",
                                          gap: true,
                                          note: "King and prophet. Received the Zabur",
                                          children: [
                                            {
                                              name: "Sulayman (Solomon)",
                                              nameAr: "سليمان",
                                              isProphet: true,
                                              slug: "sulayman",
                                              note: "Given dominion over jinn, animals, and wind",
                                              wives: [
                                                {
                                                  name: "Bilqis (Queen of Sheba)",
                                                  nameAr: "بلقيس",
                                                  description: "Bilqis, the Queen of Sheba (Saba), is mentioned in the Quran in Surah al-Naml (27:22-44). She initially ruled a kingdom that worshipped the sun, but after exchanging messages with Prophet Sulayman and witnessing his God-given power, she submitted to Allah: 'My Lord, I have wronged myself, and I submit with Sulayman to Allah, Lord of the worlds' (Quran 27:44). Many scholars consider her to have married Sulayman.",
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      name: "Binyamin (Benjamin)",
                                      nameAr: "بنيامين",
                                      isProphet: false,
                                      note: "Son of Rahil. Youngest brother of Yusuf",
                                    },
                                    {
                                      name: "Other sons of Yaqub",
                                      isProphet: false,
                                      note: "The twelve tribes of Israel",
                                      children: [
                                        {
                                          name: "Ilyas (Elijah)",
                                          nameAr: "إلياس",
                                          isProphet: true,
                                          slug: "ilyas",
                                          gap: true,
                                          note: "From Bani Israel. Confronted Ba'l worship",
                                          children: [
                                            {
                                              name: "Al-Yasa (Elisha)",
                                              nameAr: "اليسع",
                                              isProphet: true,
                                              slug: "al-yasa",
                                              note: "Successor of Ilyas",
                                            },
                                          ],
                                        },
                                        {
                                          name: "Yunus (Jonah)",
                                          nameAr: "يونس",
                                          isProphet: true,
                                          slug: "yunus",
                                          gap: true,
                                          note: "From Bani Israel. Sent to Nineveh",
                                        },
                                        {
                                          name: "Imran (father of Maryam)",
                                          nameAr: "عمران",
                                          isProphet: false,
                                          gap: true,
                                          note: "Father of Maryam. Quran 3:33-36",
                                          wives: [
                                            {
                                              name: "Hannah",
                                              nameAr: "حنة",
                                              description: "Hannah (Anne) was the wife of Imran and the mother of Maryam. She vowed to dedicate her unborn child to the service of Allah: 'My Lord, I have vowed to You what is in my womb, consecrated for Your service' (Quran 3:35). When she gave birth to Maryam instead of a boy, she still fulfilled her vow and entrusted Maryam to the care of Prophet Zakariyya in the temple.",
                                            },
                                          ],
                                          children: [
                                            {
                                              name: "Maryam (Mary)",
                                              nameAr: "مريم",
                                              isProphet: false,
                                              note: "Greatest woman in Islam. Quran 3:42",
                                              description: "Maryam (Mary) is the only woman mentioned by name in the Quran and has an entire surah named after her (Surah Maryam, 19). Allah chose her above all women: 'O Maryam, indeed Allah has chosen you and purified you and chosen you above the women of the worlds' (Quran 3:42). She devoted her life to worship and miraculously gave birth to Prophet Isa (Jesus) without a father. She is considered one of the four greatest women in Islam.",
                                              children: [
                                                {
                                                  name: "Isa (Jesus)",
                                                  nameAr: "عيسى",
                                                  isProphet: true,
                                                  slug: "isa",
                                                  note: "Born without a father. Raised to heaven",
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          name: "Zakariyya (Zechariah)",
                                          nameAr: "زكريا",
                                          isProphet: true,
                                          slug: "zakariyya",
                                          gap: true,
                                          note: "Guardian of Maryam. Husband of Maryam's aunt",
                                          wives: [
                                            {
                                              name: "Ishba (Elizabeth)",
                                              nameAr: "إيشاع",
                                              description: "Ishba (Elizabeth) was the wife of Prophet Zakariyya and the mother of Prophet Yahya (John). She was the sister or aunt of Hannah (Maryam's mother), making Yahya and Isa (Jesus) related. She was elderly and barren when Allah answered Zakariyya's prayer and granted them Yahya: 'O Zakariyya, We give you good tidings of a boy whose name will be Yahya' (Quran 19:7).",
                                            },
                                          ],
                                          children: [
                                            {
                                              name: "Yahya (John)",
                                              nameAr: "يحيى",
                                              isProphet: true,
                                              slug: "yahya",
                                              note: "Given wisdom as a child",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          name: "Haran",
                          nameAr: "هاران",
                          isProphet: false,
                          note: "Brother of Ibrahim",
                          description: "Haran was the brother of Prophet Ibrahim and the father of Prophet Lut (Lot). He died in Ur before the family migrated. Through his son Lut, his lineage includes a prophet who was sent to the people of Sodom and Gomorrah.",
                          children: [
                            {
                              name: "Lut (Lot)",
                              nameAr: "لوط",
                              isProphet: true,
                              slug: "lut",
                              note: "Nephew of Ibrahim. Sent to Sodom",
                              wives: [
                                {
                                  name: "Wife of Lut",
                                  nameAr: "امرأة لوط",
                                  description: "The wife of Prophet Lut is not named in the Quran but is mentioned alongside the wife of Nuh as an example of disbelief: 'Allah presents an example of those who disbelieved: the wife of Nuh and the wife of Lut. They were under two of Our righteous servants but betrayed them' (Quran 66:10). She sided with the sinful people of Sodom and was destroyed along with them when Allah's punishment came.",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: "Shuayb",
                      nameAr: "شعيب",
                      isProphet: true,
                      slug: "shuayb",
                      gap: true,
                      note: "Sent to Madyan. Lineage traced to Midian son of Ibrahim by some scholars",
                    },
                  ],
                },
                {
                  name: "Ham",
                  nameAr: "حام",
                  isProphet: false,
                  note: "Ancestor of African peoples",
                  description: "Ham was a son of Prophet Nuh (Noah) who survived the Great Flood. He is traditionally considered the ancestor of African peoples. Islamic sources mention him among the righteous sons who boarded the Ark with their father.",
                },
                {
                  name: "Yafith (Japheth)",
                  nameAr: "يافث",
                  isProphet: false,
                  note: "Ancestor of European/Asian peoples",
                },
                {
                  name: "Kan'an",
                  nameAr: "كنعان",
                  isProphet: false,
                  note: "Son who refused to board the Ark (Quran 11:42-43)",
                  description: "Kan'an was the son of Prophet Nuh who refused to board the Ark despite his father's pleas. The Quran records the emotional exchange: Nuh called out 'O my son, come aboard with us and be not with the disbelievers.' But Kan'an replied 'I will take refuge on a mountain to protect me from the water.' He drowned in the flood. When Nuh asked Allah about his son, Allah said 'He is not of your family; indeed, his work was unrighteous' (Quran 11:42-46).",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const treeReferences = [
  "Quran 6:74 — Azar as Ibrahim's father",
  "Quran 11:42-43 — Nuh's son who refused the Ark",
  "Quran 3:33-36 — Family of Imran",
  "Quran 19:28 — Maryam called 'sister of Harun' (lineage reference)",
  "Quran 66:10 — Wives of Nuh and Lut as examples of disbelief",
  "Quran 28:7,27 — Mother of Musa; daughters of Shu'ayb",
  "Quran 27:22-44 — Queen of Sheba and Sulayman",
  "Ibn Kathir, Al-Bidaya wan-Nihaya — Primary source for genealogical connections",
  "Ibn Kathir, Qasas al-Anbiya — Stories and family relationships of the prophets",
  "Bukhari 60:38 — Story of Ibrahim, Hajar, and Ismail",
  "Bukhari 60:103 — Khadijah as best of women",
  "Bukhari 62:98, Muslim 44:55 — Fatimah as leader of women in Jannah",
  "Sunan al-Tirmidhi 49:167 — Hasan and Husayn as leaders of the youth of Jannah",
  "Sunan al-Tirmidhi 49:174 — 'Husayn is from me, and I am from Husayn'",
  "Ibn Hisham, Al-Sirah al-Nabawiyyah — Family of the Prophet Muhammad ﷺ",
];
