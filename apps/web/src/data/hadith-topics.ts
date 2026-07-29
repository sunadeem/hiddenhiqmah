// AUTO-CURATED, MANUALLY VERIFIED. Do not hand-edit `snippet`, `reference`,
// `bookId` or `hadithId`: every entry was read in full in the local corpus
// (packages/content/hadith/{collection}/{book}.json) and confirmed to teach its
// topic, and every `snippet` is a byte-identical slice of that entry's
// `english` field (multi-part quotes are joined with " … ").
//
//   reference = the entry's `reference` field, i.e. sunnah.com "book:number"
//   hadithNo  = the in-book number (the part after the colon). THIS is what the
//               ?h= deep link must carry: the reader resolves ?h= against
//               `data-ref="<book>:<h>"` FIRST, so passing the collection-wide id
//               silently lands on the wrong hadith whenever that id also happens
//               to be a valid in-book number (e.g. Bukhari 2:26 has id 33, and
//               "2:33" is a different hadith).
//   hadithId  = the entry's `id` field, the collection-wide sunnah.com number.
//               Kept so each entry is unambiguously identifiable in the corpus.

export type TopicHadith = {
  collection: string;
  collectionName: string;
  bookId: number;
  /** In-book hadith number — the value the reader's ?h= deep link expects. */
  hadithNo: number;
  /** Collection-wide sunnah.com id of the same entry (identification only). */
  hadithId: number;
  /** sunnah.com "book:number" reference, as printed on the card. */
  reference: string;
  /** Verbatim excerpt of the corpus entry's English translation. */
  snippet: string;
};

export type HadithTopic = {
  id: string;
  label: string;
  /** lucide-react icon name; the page maps this to a component. */
  icon: string;
  blurb: string;
  hadiths: TopicHadith[];
};

export const hadithTopics: HadithTopic[] = [
  {
    id: "mercy",
    label: "Mercy",
    icon: "HeartHandshake",
    blurb:
      "Mercy toward people, children, elders and even animals — and the warning that Allah withholds mercy from the one who shows none.",
    hadiths: [
      { collection: "bukhari", collectionName: "Bukhari", bookId: 97, hadithNo: 6, hadithId: 7376, reference: "97:6", snippet: "Allah will not be merciful to those who are not merciful to mankind" },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 27, hadithNo: 30, hadithId: 1924, reference: "27:30", snippet: "The merciful are shown mercy by Ar-Rahman. Be merciful on the earth, and you will be shown mercy from Who is above the heavens" },
      { collection: "muslim", collectionName: "Muslim", bookId: 43, hadithNo: 86, hadithId: 6028, reference: "43:86", snippet: "I have ten children, but I have never kissed any one of them, whereupon Allah's Messenger (ﷺ) said: He who does not show mercy (towards his children), no mercy would be shown to him" },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 27, hadithNo: 25, hadithId: 1919, reference: "27:25", snippet: "He is not one of us who does not have mercy on our young and does not respect our elders" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 78, hadithNo: 40, hadithId: 6009, reference: "78:40", snippet: "So he went down the well (again) and filled his shoe (with water) and held it in his mouth and watered the dog. Allah thanked him for that deed and forgave him. … There is a reward for serving any animate (living being)" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 42, hadithNo: 13, hadithId: 2365, reference: "42:13", snippet: "A woman was tortured and was put in Hell because of a cat which she had kept locked till it died of hunger" },
      { collection: "muslim", collectionName: "Muslim", bookId: 50, hadithNo: 25, hadithId: 6977, reference: "50:25", snippet: "Allah created, on the same very day when He created the heavens and the earth, one hundred parts of mercy. … He out of this mercy endowed one part to the earth and it is because of this that the mother shows affection to her child and even the beasts and birds show kindness to one another" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 78, hadithNo: 30, hadithId: 5999, reference: "78:30", snippet: "Do you think that this lady can throw her son in the fire? … Allah is more merciful to His slaves than this lady to her son" },
    ],
  },
  {
    id: "parents",
    label: "Parents",
    icon: "Users",
    blurb:
      "Birr al-walidayn — the rank Islam gives to parents, the reward tied to serving them, and the gravity of falling short.",
    hadiths: [
      { collection: "muslim", collectionName: "Muslim", bookId: 45, hadithNo: 1, hadithId: 6500, reference: "45:1", snippet: "Who among the people is most deserving of a fine treatment from my hand? He said: Your mother. … Then who? Thereupon he said: Then it is your father." },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 78, hadithNo: 1, hadithId: 5970, reference: "78:1", snippet: "To offer prayers at their early (very first) stated times. … To be good and dutiful to one's parents" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 78, hadithNo: 3, hadithId: 5972, reference: "78:3", snippet: "Shall I participate in Jihad? … Are your parents living? … Do Jihad for their benefit" },
      { collection: "muslim", collectionName: "Muslim", bookId: 45, hadithNo: 10, hadithId: 6510, reference: "45:10", snippet: "Let him be humbled into dust; let him be humbled into dust. It was said: Allah's Messenger, who is he? He said: He who sees either of his parents during their old age or he sees both of them, but he does not enter Paradise" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 78, hadithNo: 7, hadithId: 5976, reference: "78:7", snippet: "Shall I not inform you of the biggest of the great sins? … To join partners in worship with Allah: to be undutiful to one's parents." },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 78, hadithNo: 4, hadithId: 5973, reference: "78:4", snippet: "It is one of the greatest sins that a man should curse his parents" },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 27, hadithNo: 3, hadithId: 1899, reference: "27:3", snippet: "The Lord's pleasure is in the parent's pleasure, and the Lord's anger is in the parent's anger" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 78, hadithNo: 5, hadithId: 5974, reference: "78:5", snippet: "I used to start giving the milk to my parents first before giving to my children" },
    ],
  },
  {
    id: "anger",
    label: "Anger",
    icon: "Flame",
    blurb:
      "What the Prophet ﷺ taught about restraining anger — the repeated advice, the practical steps, and the reward promised to the one who holds back.",
    hadiths: [
      { collection: "bukhari", collectionName: "Bukhari", bookId: 78, hadithNo: 143, hadithId: 6116, reference: "78:143", snippet: "Advise me! … Do not become angry and furious." },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 78, hadithNo: 141, hadithId: 6114, reference: "78:141", snippet: "The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 59, hadithNo: 91, hadithId: 3282, reference: "59:91", snippet: "I know a word, the saying of which will cause him to relax, if he does say it. If he says: 'I seek Refuge with Allah from Satan.' then all his anger will go away" },
      { collection: "abudawud", collectionName: "Abu Dawud", bookId: 43, hadithNo: 10, hadithId: 4782, reference: "43:10", snippet: "When one of you becomes angry while standing, he should sit down. If the anger leaves him, well and good; otherwise he should lie down" },
      { collection: "abudawud", collectionName: "Abu Dawud", bookId: 43, hadithNo: 5, hadithId: 4777, reference: "43:5", snippet: "If anyone suppresses anger when he is in a position to give vent to it, Allah, the Exalted, will call him on the Day of Resurrection over the heads of all creatures" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 86, hadithNo: 15, hadithId: 6786, reference: "86:15", snippet: "he never took revenge for himself concerning any matter that was presented to him, but when Allah's Limits were transgressed, he would take revenge for Allah's Sake" },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 27, hadithNo: 126, hadithId: 2020, reference: "27:126", snippet: "Teach me something that is not too much for me so that, perhaps, I may abide by it. … Do not get angry" },
    ],
  },
  {
    id: "charity",
    label: "Charity",
    icon: "HandHeart",
    blurb:
      "Sadaqah in the widest sense — from half a date to a smile — who to begin with, when it counts most, and what outlives you.",
    hadiths: [
      { collection: "bukhari", collectionName: "Bukhari", bookId: 24, hadithNo: 21, hadithId: 1417, reference: "24:21", snippet: "Save yourself from Hell-fire even by giving half a date-fruit in charity" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 24, hadithNo: 23, hadithId: 1419, reference: "24:23", snippet: "Which charity is the most superior in reward? … The charity which you practice while you are healthy, niggardly and afraid of poverty and wish to become wealthy." },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 24, hadithNo: 27, hadithId: 1423, reference: "24:27", snippet: "a person who practices charity so secretly that his left hand does not know what his right hand has given" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 24, hadithNo: 31, hadithId: 1428, reference: "24:31", snippet: "The upper hand is better than the lower hand (i.e. he who gives in charity is better than him who takes it). One should start giving first to his dependents" },
      { collection: "muslim", collectionName: "Muslim", bookId: 45, hadithNo: 90, hadithId: 6592, reference: "45:90", snippet: "Charity does not decrease wealth, no one forgives another except that Allah increases his honor, and no one humbles himself for the sake of Allah except that Allah raises his status" },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 27, hadithNo: 62, hadithId: 1956, reference: "27:62", snippet: "Your smiling in the face of your brother is charity, commanding good and forbidding evil is charity, your giving directions to a man lost in the land is charity for you. Your seeing for a man with bad sight is a charity for you, your removal of a rock, a thorn or a bone from the road is charity for you" },
      { collection: "abudawud", collectionName: "Abu Dawud", bookId: 18, hadithNo: 19, hadithId: 2880, reference: "18:19", snippet: "When a man dies, his action discontinues from him except three things, namely, perpetual sadaqah (charity), or the knowledge by which benefit is acquired, or a pious child who prays for him" },
      { collection: "muslim", collectionName: "Muslim", bookId: 12, hadithNo: 123, hadithId: 2386, reference: "12:123", snippet: "The most excellent Sadaqa or the best of Sadaqa is that after giving which the (giver) remains rich and the upper hand is better than the lower hand, and begin from the members of your household" },
    ],
  },
  {
    id: "honesty",
    label: "Honesty",
    icon: "Scale",
    blurb:
      "Truthfulness, keeping trusts, and straight dealing in trade — with the marks of hypocrisy set out as their opposite.",
    hadiths: [
      { collection: "bukhari", collectionName: "Bukhari", bookId: 78, hadithNo: 121, hadithId: 6094, reference: "78:121", snippet: "Truthfulness leads to righteousness, and righteousness leads to Paradise. And a man keeps on telling the truth until he becomes a truthful person" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 2, hadithNo: 26, hadithId: 33, reference: "2:26", snippet: "The signs of a hypocrite are three: 1. Whenever he speaks, he tells a lie. 2. Whenever he promises, he always breaks it (his promise ). 3. If you trust him, he proves to be dishonest" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 2, hadithNo: 27, hadithId: 34, reference: "2:27", snippet: "Whoever has the following four (characteristics) will be a pure hypocrite … 1. Whenever he is entrusted, he betrays. 2. Whenever he speaks, he tells a lie. 3. Whenever he makes a covenant, he proves treacherous" },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 14, hadithNo: 118, hadithId: 1315, reference: "14:118", snippet: "He put his fingers in it and felt wetness. … Why not put it on top of the food so the people can see it? … Whoever cheats, he is not one of us" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 34, hadithNo: 67, hadithId: 2114, reference: "34:67", snippet: "if they speak the truth and mention the defects, then their bargain will be blessed, and if they tell lies and conceal the defects, they might gain some financial gain but they will deprive their sale of (Allah's) blessings" },
      { collection: "abudawud", collectionName: "Abu Dawud", bookId: 24, hadithNo: 120, hadithId: 3535, reference: "24:120", snippet: "Pay the deposit to him who deposited it with you, and do not betray him who betrayed you" },
      { collection: "ibnmajah", collectionName: "Ibn Majah", bookId: 12, hadithNo: 3, hadithId: 2139, reference: "12:3", snippet: "The trustworthy, honest Muslim merchant will be with the martyrs on the Day of Resurrection" },
      { collection: "muslim", collectionName: "Muslim", bookId: 22, hadithNo: 165, hadithId: 4126, reference: "22:165", snippet: "Beware of swearing; it produces a ready sale for a commodity, but blots out the blessing" },
    ],
  },
  {
    id: "neighbors",
    label: "Neighbors",
    icon: "Handshake",
    blurb:
      "The rights of the person next door — how heavily the Prophet ﷺ weighted them, and the small everyday ways they are kept.",
    hadiths: [
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 27, hadithNo: 48, hadithId: 1942, reference: "27:48", snippet: "Jibril – may the Salawat of Allah be upon him – continued to recommend me about (treating) the neighbors so (kindly and politely), that I thought he would order me to make them heirs" },
      { collection: "muslim", collectionName: "Muslim", bookId: 1, hadithNo: 79, hadithId: 172, reference: "1:79", snippet: "He will not enter Paradise whose neighbour is not secure from his wrongful conduct" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 78, hadithNo: 49, hadithId: 6018, reference: "78:49", snippet: "Anybody who believes in Allah and the Last Day should not harm his neighbor, and anybody who believes in Allah and the Last Day should entertain his guest generously" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 51, hadithNo: 29, hadithId: 2595, reference: "51:29", snippet: "I have two neighbors; which of them should I give a gift to? … (Give) to the one whose door is nearer to you" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 51, hadithNo: 1, hadithId: 2566, reference: "51:1", snippet: "None of you should look down upon the gift sent by her female neighbor even if it were the trotters of the sheep (fleshless part of legs)" },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 25, hadithNo: 49, hadithId: 1833, reference: "25:49", snippet: "If you buy some meat or cook something in a pot, then increase its broth, and serve some of it to your neighbor." },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 27, hadithNo: 49, hadithId: 1943, reference: "27:49", snippet: "Have you given some to our neighbor, the Jew? … Jibril continued to advise me about (treating) the neighbors so (kindly and politely), that I thought he would order me (from Allah) to make them heirs" },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 27, hadithNo: 50, hadithId: 1944, reference: "27:50", snippet: "The companion who is the best to Allah is the one who is best to his companion. And the neighbor that is the best to Allah is the one that is best to his neighbor" },
    ],
  },
  {
    id: "knowledge",
    label: "Knowledge",
    icon: "GraduationCap",
    blurb:
      "Seeking sacred knowledge, teaching it on, the standing of the scholar — and the warning against hoarding what you know.",
    hadiths: [
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 41, hadithNo: 2, hadithId: 2646, reference: "41:2", snippet: "Whoever takes a path upon which to obtain knowledge, Allah makes the path to Paradise easy for him" },
      { collection: "abudawud", collectionName: "Abu Dawud", bookId: 26, hadithNo: 1, hadithId: 3641, reference: "26:1", snippet: "The angels will lower their wings in their great pleasure with one who seeks knowledge, the inhabitants of the heavens and the Earth and the fish in the deep waters will ask forgiveness for the learned man … The learned are the heirs of the Prophets, and the Prophets leave neither dinar nor dirham, leaving only knowledge" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 66, hadithNo: 49, hadithId: 5027, reference: "66:49", snippet: "The best among you (Muslims) are those who learn the Qur'an and teach it" },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 41, hadithNo: 25, hadithId: 2669, reference: "41:25", snippet: "Convey from me, even if it be an Ayah, and narrate from the Children of Isra'il, and there is no harm" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 3, hadithNo: 13, hadithId: 71, reference: "3:13", snippet: "If Allah wants to do good to a person, He makes him comprehend the religion. I am just a distributor, but the grant is from Allah" },
      { collection: "abudawud", collectionName: "Abu Dawud", bookId: 26, hadithNo: 18, hadithId: 3658, reference: "26:18", snippet: "He who is asked something he knows and conceals it will have a bridle of fire put on him on the Day of Resurrection" },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 41, hadithNo: 30, hadithId: 2674, reference: "41:30", snippet: "Whoever calls to guidance, then he receives the reward similar to the reward of whoever follows him, without that diminishing anything from their rewards" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 3, hadithNo: 27, hadithId: 85, reference: "3:27", snippet: "(Religious) knowledge will be taken away (by the death of religious scholars) ignorance (in religion) and afflictions will appear; and Harj will increase" },
    ],
  },
  {
    id: "repentance",
    label: "Repentance",
    icon: "RotateCcw",
    blurb:
      "Tawbah — how gladly it is received, how late it may still come, and how constantly the Prophet ﷺ turned back to Allah himself.",
    hadiths: [
      { collection: "bukhari", collectionName: "Bukhari", bookId: 80, hadithNo: 6, hadithId: 6309, reference: "80:6", snippet: "Allah is more pleased with the repentance of His slave than anyone of you is pleased with finding his camel which he had lost in the desert" },
      { collection: "muslim", collectionName: "Muslim", bookId: 50, hadithNo: 54, hadithId: 7008, reference: "50:54", snippet: "There was a person before you who had killed ninety-nine persons … Yes; what stands between you and the repentance? … found him nearer to the land where he intended to go (the land of piety), and so the angels of mercy took possession of it" },
      { collection: "tirmidhi", collectionName: "Tirmidhi", bookId: 48, hadithNo: 168, hadithId: 3537, reference: "48:168", snippet: "Indeed Allah accepts the repentance of a slave as long as (his soul does not reach his throat)." },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 80, hadithNo: 4, hadithId: 6307, reference: "80:4", snippet: "By Allah! I ask for forgiveness from Allah and turn to Him in repentance more than seventy times a day" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 80, hadithNo: 3, hadithId: 6306, reference: "80:3", snippet: "The most superior way of asking for forgiveness from Allah is … If somebody recites it during the day with firm faith in it, and dies on the same day before the evening, he will be from the people of Paradise" },
      { collection: "bukhari", collectionName: "Bukhari", bookId: 80, hadithNo: 5, hadithId: 6308, reference: "80:5", snippet: "A believer sees his sins as if he were sitting under a mountain which, he is afraid, may fall on him; whereas the wicked person considers his sins as flies passing over his nose and he just drives them away like this." },
      { collection: "abudawud", collectionName: "Abu Dawud", bookId: 15, hadithNo: 3, hadithId: 2479, reference: "15:3", snippet: "Migration will not end until repentance ends, and repentance will not end until the sun rises in the west" },
      { collection: "muslim", collectionName: "Muslim", bookId: 48, hadithNo: 53, hadithId: 6859, reference: "48:53", snippet: "O people, seek repentance from Allah. Verily, I seek repentance from Him a hundred times a day" },
    ],
  },
];
