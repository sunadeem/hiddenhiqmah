"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import ContentCard from "@/components/ContentCard";
import { textMatch } from "@/lib/search";
import { BookOpen } from "lucide-react";

/* ───────────────────────── sections nav ───────────────────────── */

const sections = [
  { id: "timeline", label: "Timeline" },
  { id: "character", label: "Character & Virtues" },
  { id: "appearance", label: "Physical Description" },
  { id: "family", label: "Family & Companions" },
  { id: "prophecies", label: "Prophecies" },
  { id: "worship", label: "His Worship" },
  { id: "daily-sunnah", label: "Daily Sunnah" },
];

/* ───────────────────────── timeline data ───────────────────────── */

type TimelineEvent = {
  year: string;
  hijri?: string;
  title: string;
  detail: string;
  reference?: string;
};

const timeline: TimelineEvent[] = [
  {
    year: "570 CE",
    title: "Birth in Mecca — Year of the Elephant",
    detail:
      "Muhammad ﷺ was born on a Monday, 12th of Rabi' al-Awwal, into the Banu Hashim clan of the Quraysh tribe in Mecca. His father Abdullah ibn Abdul Muttalib had passed away before his birth, leaving him an orphan from the start. His mother Aminah bint Wahb entrusted him to Halimah al-Sa'diyyah as his wet-nurse, as was the custom among the Arabs to raise children in the desert for pure air and eloquent speech. The same year, Abraha, the Abyssinian governor of Yemen, marched with a great army and war elephants to destroy the Ka'bah, but Allah destroyed them by sending flocks of birds that pelted them with stones of baked clay, as described in Surah Al-Fil. The Prophet ﷺ later said: 'I am the answer to the prayer of my father Ibrahim, and the glad tidings of my brother Isa.'",
    reference: "Quran 105:1-5; Musnad Ahmad 16700",
  },
  {
    year: "576 CE",
    title: "Passing of his mother Aminah",
    detail:
      "During his time with Halimah in the desert, the miraculous opening of his chest (shaqq al-sadr) occurred — two angels came and washed his heart with Zamzam water and filled it with wisdom and faith, as narrated in Sahih Muslim. He was returned to his mother Aminah, who then took him to visit his father's grave and maternal relatives in Medina. On the return journey, she fell ill and passed away at al-Abwa, between Mecca and Medina, when Muhammad ﷺ was just six years old. He was then cared for by his grandfather Abdul Muttalib, the chief of Quraysh and custodian of the Ka'bah, who loved him deeply and would seat him on his own mat beside the Ka'bah — a privilege given to none of his other children.",
    reference: "Sahih Muslim 162",
  },
  {
    year: "578 CE",
    title: "Grandfather Abdul Muttalib passes away",
    detail:
      "Abdul Muttalib, who had been deeply attached to his grandson and recognized his special qualities, passed away when Muhammad ﷺ was eight years old. On his deathbed, he entrusted the boy to his son Abu Talib, who was the full brother of the Prophet's ﷺ father Abdullah. Abu Talib took Muhammad ﷺ into his household, treating him with more care than his own children, and would remain his protector and supporter for the next four decades. Despite never embracing Islam, Abu Talib shielded the Prophet ﷺ from the Quraysh and refused all pressure to hand him over.",
  },
  {
    year: "583 CE",
    title: "Journey to Syria with Abu Talib",
    detail:
      "At the age of twelve, Muhammad ﷺ accompanied his uncle Abu Talib on a trading caravan to Syria. When they reached Busra, a Christian monk named Bahira — known for his knowledge of earlier scriptures — noticed signs of prophethood in the young boy. He observed that a cloud shaded him as he traveled, and that a tree lowered its branches over him when he sat beneath it. Bahira examined the seal of prophethood between his shoulders and questioned Abu Talib about the boy. He confirmed what he found matched the descriptions in his scriptures, and urgently advised Abu Talib to take the boy back to Mecca and guard him carefully from the Romans and others who might wish him harm.",
    reference: "Sunan at-Tirmidhi 3620",
  },
  {
    year: "595 CE",
    title: "Marriage to Khadijah",
    detail:
      "Before his prophethood, Muhammad ﷺ was renowned throughout Mecca as 'Al-Amin' (The Trustworthy) and 'As-Sadiq' (The Truthful). Khadijah bint Khuwaylid, a noble and wealthy businesswoman of the Quraysh, hired him to lead her trading caravan to Syria. Impressed by his honesty and the extraordinary profits he returned, and after hearing her servant Maysarah describe his noble character, she proposed marriage through her friend Nafisah. He married her when he was 25 and she was 40. She bore him all of his children except Ibrahim — including Qasim, Abdullah, Zaynab, Ruqayyah, Umm Kulthum, and Fatimah. She was the first person to believe in his prophethood, and he never married another woman during her lifetime. Years later, the Prophet ﷺ said: 'She believed in me when no one else did, and she supported me with her wealth when people deprived me.'",
    reference: "Sahih al-Bukhari 3818; Sahih Muslim 2432",
  },
  {
    year: "605 CE",
    title: "Hilf al-Fudul & Rebuilding of the Ka'bah",
    detail:
      "In his thirties, Muhammad ﷺ participated in two defining events. First, he joined the Hilf al-Fudul (Pact of the Virtuous) — an alliance formed at the house of Abdullah ibn Jud'an by several Quraysh clans to protect the oppressed and ensure justice for anyone wronged in Mecca, regardless of their tribe. The Prophet ﷺ later said after Islam: 'I witnessed a pact in the house of Ibn Jud'an that was more beloved to me than a herd of red camels. If I were called to it now in Islam, I would respond.' Around the same time, when the Ka'bah was damaged by flooding and the Quraysh rebuilt it, a fierce dispute arose over which clan would have the honor of placing the Black Stone (al-Hajar al-Aswad) back in its corner. They nearly came to blows until they agreed to let the next person who entered the Sanctuary decide. That person was Muhammad ﷺ. He placed the Black Stone on a cloth, had a representative from each tribe hold a corner and lift it together, then set it in place with his own hands — a solution that satisfied all and prevented bloodshed.",
  },
  {
    year: "610 CE",
    title: "First Revelation in Cave Hira",
    detail:
      "In the years before revelation, Muhammad ﷺ would retreat to the Cave of Hira on Jabal al-Nour (the Mountain of Light) overlooking Mecca, spending nights in contemplation and worship. During one of these retreats in the month of Ramadan, when he was 40 years old, the angel Jibreel appeared to him and commanded: 'Iqra!' (Read!). He replied: 'I cannot read.' Jibreel squeezed him tightly three times, then revealed the first verses of the Quran: 'Read in the name of your Lord who created, created man from a clinging substance. Read, and your Lord is the Most Generous, who taught by the pen, taught man that which he knew not.' The Prophet ﷺ returned to Khadijah trembling and said: 'Cover me! Cover me!' (Zammilooni). She wrapped him in a cloak, comforted him, and declared: 'By Allah, Allah will never disgrace you. You maintain ties of kinship, bear the burdens of others, help the destitute, honor your guests, and assist in every just cause.' She then took him to her elderly cousin Waraqah ibn Nawfal, a Christian scholar of the scriptures, who confirmed: 'This is the same angel who came to Musa. I wish I were young when your people drive you out.' The Prophet ﷺ asked in surprise: 'Will they drive me out?' Waraqah replied: 'Yes, no man has ever brought what you bring except that he was treated with hostility.'",
    reference: "Sahih al-Bukhari 3; Quran 96:1-5",
  },
  {
    year: "613 CE",
    title: "Public preaching begins",
    detail:
      "For the first three years, the Prophet ﷺ invited people to Islam privately, gathering a small group of believers including Khadijah, Abu Bakr, Ali ibn Abi Talib, and Zayd ibn Harithah. Then Allah revealed: 'Proclaim what you have been commanded and turn away from the polytheists.' He climbed Mount Safa and called out to each clan of the Quraysh by name. When they gathered, he asked: 'If I told you there was an army behind this mountain about to attack you, would you believe me?' They replied: 'Yes, we have never known you to lie.' He then warned them of a severe punishment from Allah. The Quraysh responded with fierce opposition. Abu Lahab cursed him openly, and Allah revealed Surah al-Masad in response. As Islam spread, the Quraysh subjected the early Muslims to brutal persecution — Bilal ibn Rabah was tortured by Umayyah ibn Khalaf under the scorching sun with boulders on his chest, yet he would only repeat: 'Ahad, Ahad' (One, One). Sumayyah bint Khayyat was killed by Abu Jahl with a spear, becoming the first martyr in Islam. Her son Ammar and husband Yasir were also tortured severely.",
    reference: "Quran 15:94; Sahih al-Bukhari 4770; Quran 111:1-5",
  },
  {
    year: "615 CE",
    title: "First migration to Abyssinia",
    detail:
      "As the persecution of Muslims in Mecca became unbearable, the Prophet ﷺ told his companions: 'If you went to the land of Abyssinia, you would find a king under whom no one is oppressed.' He sent a first group of 11 men and 4 women, followed later by a larger second migration of about 83 men and 18 women. The Quraysh sent Amr ibn al-As and Abdullah ibn Abi Rabi'ah with lavish gifts for the Negus (An-Najashi) and his courtiers, demanding the return of the Muslims. In the royal court, Ja'far ibn Abi Talib — the Prophet's ﷺ cousin — stood and delivered a powerful speech: 'O King, we were a people of ignorance, worshipping idols, eating dead animals, committing shameful acts... then Allah sent us a Messenger from among us, whose lineage, truthfulness, trustworthiness, and purity we knew.' He then recited the opening verses of Surah Maryam about the birth of Isa (Jesus). The Negus wept until his beard was wet and declared he would never hand them over. The Muslims remained safely in Abyssinia for years, and the Negus later embraced Islam.",
  },
  {
    year: "616 CE",
    title: "Boycott of Banu Hashim",
    detail:
      "Unable to stop Islam's growth, the Quraysh imposed a complete social and economic boycott on the Banu Hashim and Banu al-Muttalib clans — both Muslim and non-Muslim members. They drafted a document banning all trade, marriage, and social interaction, and hung it inside the Ka'bah. The entire clan was confined to the narrow valley of Shi'b Abi Talib for nearly three years (616–619 CE). The suffering was immense — the sounds of children crying from hunger could be heard beyond the valley. Some sympathetic Meccans would secretly smuggle food at night, but it was never enough. The Prophet ﷺ and his followers survived on leaves and scraps of leather. The boycott finally ended when several just men of the Quraysh — including Hisham ibn Amr and Zuhayr ibn Abi Umayyah — publicly denounced the injustice. When they went to tear up the parchment, they found that termites had eaten away all the writing except the words 'Bismika Allahumma' (In Your Name, O Allah), confirming what the Prophet ﷺ had told Abu Talib would happen.",
  },
  {
    year: "619 CE",
    title: "Year of Sorrow (Am al-Huzn)",
    detail:
      "Within a span of just a few weeks, the Prophet ﷺ lost his two greatest supporters. First, his uncle Abu Talib — who had shielded him from the Quraysh for over 40 years — passed away. The Prophet ﷺ was deeply grieved and continued to pray for him until Allah revealed that it was not for him to seek forgiveness for the polytheists. Then, only days later, his beloved wife Khadijah — his first and dearest companion — also died. She had stood by him through every hardship, spending her entire wealth in the cause of Islam. With both of them gone, the persecution of the Prophet ﷺ reached its peak. The Quraysh became openly violent — people would insult and harass him publicly in the streets. Seeking support outside Mecca, the Prophet ﷺ traveled to Ta'if and invited its leaders to Islam, but they rejected him and sent their slaves and children to chase him out, pelting him with stones until his sandals were soaked with blood. Despite this, when the angel of the mountains offered to crush the people of Ta'if between the mountains, the Prophet ﷺ refused, saying: 'Rather, I hope that Allah will bring from their descendants people who will worship Allah alone.'",
    reference: "Quran 9:113; Sahih al-Bukhari 3231",
  },
  {
    year: "620 CE",
    title: "Al-Isra wal-Mi'raj — The Night Journey",
    detail:
      "During his most difficult period, Allah honored His Messenger ﷺ with the miraculous night journey. In the first part (Al-Isra), Jibreel brought the Buraq — a white riding beast — and the Prophet ﷺ traveled from al-Masjid al-Haram in Mecca to al-Masjid al-Aqsa in Jerusalem, where he led all the previous prophets in prayer. In the second part (Al-Mi'raj), he ascended through the seven heavens. In the first heaven he met Adam; in the second, Yahya (John) and Isa (Jesus); in the third, Yusuf (Joseph); in the fourth, Idris (Enoch); in the fifth, Harun (Aaron); in the sixth, Musa (Moses); and in the seventh, Ibrahim (Abraham), who was leaning against al-Bayt al-Ma'mur — the heavenly Ka'bah which 70,000 angels enter daily and never return. He was then taken to Sidrat al-Muntaha (the Lote Tree of the Utmost Boundary) and into the divine presence, where the five daily prayers were prescribed. Originally fifty prayers were commanded, but on the repeated advice of Musa, the Prophet ﷺ returned and asked for a reduction until they became five — with the reward of fifty. When he told the Quraysh about the journey, many mocked him, but Abu Bakr immediately believed him, earning the title 'As-Siddiq' (The Confirmer of Truth).",
    reference: "Quran 17:1; Quran 53:1-18; Sahih al-Bukhari 3887; Sahih Muslim 162",
  },
  {
    year: "622 CE",
    hijri: "1 AH",
    title: "The Hijrah to Medina",
    detail:
      "In the years before the Hijrah, groups from the tribes of Aws and Khazraj in Yathrib (later named Medina) met the Prophet ﷺ during the Hajj season and embraced Islam. In the First Pledge of Aqabah, 12 men pledged allegiance, and in the Second Pledge, 73 men and 2 women swore to protect him as they would their own families. The Prophet ﷺ then instructed his companions to migrate to Medina in small groups. When the Quraysh learned of this, they plotted to assassinate him — selecting a young man from each clan so the blame would be shared. Allah revealed their plot, and the Prophet ﷺ asked Ali to sleep in his bed as a decoy while he and Abu Bakr slipped away at night. They hid in the Cave of Thawr for three days while the Quraysh searched everywhere. Abu Bakr was terrified, but the Prophet ﷺ reassured him: 'Do not grieve; indeed Allah is with us.' They then traveled south through an unconventional desert route with their guide Abdullah ibn Urayqit. When the Prophet ﷺ arrived in Quba (outskirts of Medina), he built the first mosque in Islam — Masjid Quba. He then entered Medina to a joyous reception from the Ansar. He let his camel choose where to stop, and built his mosque and home at that spot. He established brotherhood (mu'akhah) between the Muhajirun (migrants) and Ansar (helpers), and drafted the Constitution of Medina — a charter establishing the rights and duties of all citizens, including the Jewish tribes.",
    reference: "Quran 9:40; Sahih al-Bukhari 3905; Sahih al-Bukhari 3906",
  },
  {
    year: "624 CE",
    hijri: "2 AH",
    title: "Battle of Badr",
    detail:
      "The first major military confrontation between the Muslims and the Quraysh. The Prophet ﷺ set out with 313 companions — poorly armed, with only 2 horses and 70 camels — to intercept a Qurayshi trade caravan led by Abu Sufyan. The caravan escaped, but Abu Jahl marched from Mecca with an army of over 1,000 well-equipped warriors, determined to crush the Muslims. The night before battle, the Prophet ﷺ spent the night in earnest supplication, raising his hands until his cloak fell off his shoulders, praying: 'O Allah, if this small band of Muslims perishes today, You will not be worshipped on earth again.' Abu Bakr picked up his cloak, placed it back on his shoulders, and said: 'Enough, O Messenger of Allah, your Lord will fulfill His promise to you.' Allah responded by revealing: 'I will reinforce you with a thousand angels, following one another.' The Muslims achieved a decisive victory — 70 Qurayshi leaders were killed including Abu Jahl, and 70 were captured, while only 14 Muslims were martyred. The Prophet ﷺ treated the captives with unprecedented mercy, and those who could read and write were freed by teaching ten Muslim children to read.",
    reference: "Quran 3:123-125; Quran 8:9; Sahih al-Bukhari 3953; Sahih Muslim 1763",
  },
  {
    year: "624 CE",
    hijri: "2 AH",
    title: "Change of Qiblah",
    detail:
      "For approximately 16 to 17 months after the Hijrah, the Muslims prayed facing Jerusalem (Bayt al-Maqdis), as they had done in Mecca. The Prophet ﷺ longed deeply to face the Ka'bah in prayer, and would often look up toward the sky in anticipation. Allah then revealed: 'We have certainly seen the turning of your face toward the heaven. So We will surely turn you to a qiblah with which you will be pleased. So turn your face toward al-Masjid al-Haram.' The Prophet ﷺ received this revelation while leading the Dhuhr (or Asr) prayer at what is now known as Masjid al-Qiblatayn (the Mosque of Two Qiblahs) in Medina. He turned mid-prayer from facing north (Jerusalem) to facing south (Mecca), and the entire congregation turned with him. This change was a test of faith — the hypocrites and some of the People of the Book objected, but Allah declared: 'We did not make the qiblah which you used to face except that We might make evident who would follow the Messenger from who would turn back on his heels.'",
    reference: "Quran 2:144; Quran 2:143; Sahih al-Bukhari 4488; Sahih Muslim 525",
  },
  {
    year: "625 CE",
    hijri: "3 AH",
    title: "Battle of Uhud",
    detail:
      "Seeking revenge for Badr, the Quraysh assembled an army of 3,000 warriors led by Abu Sufyan, with Khalid ibn al-Walid commanding the cavalry. The Prophet ﷺ marched out with about 1,000 men, but the hypocrite Abdullah ibn Ubayy deserted with 300 of his followers, leaving only 700 Muslims. The Prophet ﷺ positioned 50 archers on a strategic hill with strict orders not to leave their posts under any circumstances. The battle initially went in the Muslims' favor, and the Quraysh began to flee. Seeing this, most of the archers abandoned their positions to collect spoils, despite the warnings of their commander Abdullah ibn Jubayr. Khalid ibn al-Walid seized the opportunity and led a devastating cavalry charge from behind, turning the tide. In the chaos, a rumor spread that the Prophet ﷺ had been killed, causing many to lose heart. In reality, he was struck in the face by a rock, breaking his tooth and cutting his lip. His helmet rings were driven into his cheek, and Abu Ubaydah pulled them out with his own teeth. Hamzah, the Prophet's ﷺ uncle and one of the bravest warriors, was martyred by Wahshi. About 70 Muslims were killed. Despite the heavy losses, the Prophet ﷺ led his injured companions out the very next day in pursuit to show the Quraysh that the Muslims were still a force, an act of courage that prevented the enemy from returning to attack Medina.",
    reference: "Quran 3:152-153; Quran 3:140; Sahih al-Bukhari 4043; Sahih al-Bukhari 4075",
  },
  {
    year: "625 CE",
    hijri: "4 AH",
    title: "Expulsion of Banu Nadir",
    detail:
      "The Jewish tribe of Banu Nadir in Medina had a treaty with the Muslims but repeatedly violated it. After the setback at Uhud, they plotted to assassinate the Prophet ﷺ — when he visited their settlement to discuss a matter of blood money, they planned to drop a large boulder on him from a rooftop while he sat against a wall. Allah informed the Prophet ﷺ of the conspiracy through revelation, and he quietly stood up and left before the plot could be carried out. He then sent Muhammad ibn Maslamah to inform them they had broken the treaty and must leave Medina within ten days. The hypocrite Abdullah ibn Ubayy secretly urged them to stay, promising military support that never came. After a siege of about fifteen days, the Banu Nadir surrendered and were expelled to Khaybar and Syria, carrying as much of their belongings as their camels could hold. Their abandoned lands, date palms, and weapons became fay' (war gains without battle) for the Muslims. Surah Al-Hashr was revealed about this event.",
    reference: "Quran 59:2-5; Quran 59:11-12",
  },
  {
    year: "627 CE",
    hijri: "5 AH",
    title: "Battle of the Trench (Al-Khandaq)",
    detail:
      "Leaders of the expelled Banu Nadir traveled to Mecca and other tribes, assembling a grand coalition (al-Ahzab) of 10,000 soldiers — the largest army Arabia had ever seen — to march on Medina and annihilate the Muslims once and for all. When the Prophet ﷺ consulted his companions, Salman al-Farisi suggested a strategy unknown to the Arabs: digging a defensive trench around the exposed northern side of Medina. The Muslims worked in bitterly cold conditions with little food, digging for six days. The Prophet ﷺ dug alongside them, carrying dirt on his back, and when they hit an immovable rock, he struck it three times with a pickaxe, and sparks flew. He said: 'With the first strike, the palaces of Persia were shown to me. With the second, the palaces of Rome. With the third, the palaces of Yemen.' The massive army arrived and was confounded by the trench, unable to cross. The siege lasted nearly a month. The Banu Qurayza, the last major Jewish tribe in Medina, betrayed their treaty and sided with the coalition from within, creating panic. The Prophet ﷺ sent Nu'aym ibn Mas'ud, a new Muslim whose conversion was unknown, to sow discord between the coalition forces and Banu Qurayza. Then Allah sent a fierce, freezing wind that tore up their tents, overturned their cooking pots, and extinguished their fires. Demoralized and divided, the massive army retreated into the night. The Prophet ﷺ declared: 'Now we will march against them, and they will never march against us.'",
    reference: "Quran 33:9-11; Quran 33:22; Sahih al-Bukhari 4106; Sahih al-Bukhari 4115",
  },
  {
    year: "628 CE",
    hijri: "6 AH",
    title: "Treaty of Hudaybiyyah",
    detail:
      "The Prophet ﷺ saw a dream that he was performing Umrah, so he set out for Mecca with about 1,400 companions in the state of ihram, bringing sacrificial animals to show their peaceful intent. The Quraysh, however, refused them entry. At Hudaybiyyah, on the outskirts of Mecca, the Prophet ﷺ sent Uthman ibn Affan as an envoy to negotiate. When a rumor spread that Uthman had been killed, the Prophet ﷺ called his companions to pledge allegiance under a tree — the Bay'ah al-Ridwan (Pledge of Good Pleasure), which Allah praised in the Quran: 'Allah was pleased with the believers when they pledged to you under the tree.' A treaty was then negotiated with terms that appeared unfavorable: the Muslims would return to Medina without performing Umrah that year, any Meccan who fled to Medina must be returned, but any Muslim who fled to Mecca would not be returned, and there would be a ten-year truce. Umar ibn al-Khattab was so distressed that he questioned the terms, but the Prophet ﷺ remained firm: 'I am the Messenger of Allah, and I will not disobey Him.' Despite the apparent setback, Allah called it a 'clear victory' — the peace allowed the Prophet ﷺ to send letters inviting rulers of the world to Islam, and more people entered Islam in the two years of peace that followed than in all the previous years combined.",
    reference: "Quran 48:1; Quran 48:18; Sahih al-Bukhari 2731; Sahih al-Bukhari 2732",
  },
  {
    year: "628 CE",
    hijri: "7 AH",
    title: "Battle of Khaybar",
    detail:
      "Khaybar was a heavily fortified oasis about 150 km north of Medina, home to the expelled Banu Nadir and other hostile tribes who continued to conspire against the Muslims and had helped organize the coalition at the Battle of the Trench. The Prophet ﷺ marched with 1,400 men to confront this threat. The fortresses of Khaybar were among the strongest in Arabia, and several initial assaults were repelled. After some days, the Prophet ﷺ announced: 'Tomorrow I will give the banner to a man who loves Allah and His Messenger, and whom Allah and His Messenger love. Allah will grant victory at his hands.' Every companion hoped to be chosen. The next morning, the Prophet ﷺ called for Ali ibn Abi Talib, who was suffering from an eye ailment. The Prophet ﷺ applied his saliva to Ali's eyes, and they were immediately healed. Ali then led the decisive assault and Khaybar was conquered fortress by fortress. After the conquest, a Jewish woman named Zaynab bint al-Harith served the Prophet ﷺ a poisoned lamb — he tasted it but spat it out, saying the meat had told him it was poisoned. The effects of this poison would trouble him for the rest of his life, and he considered himself a martyr because of it.",
    reference: "Sahih al-Bukhari 4210; Sahih Muslim 2407; Sahih al-Bukhari 4249",
  },
  {
    year: "629 CE",
    hijri: "7 AH",
    title: "Umrah al-Qada",
    detail:
      "As stipulated in the Treaty of Hudaybiyyah, the Prophet ﷺ and approximately 2,000 Muslims returned to Mecca to perform the Umrah they had been prevented from completing the previous year. The Quraysh evacuated the city and watched from the surrounding hills. The Prophet ﷺ entered Mecca riding his camel al-Qaswa, and the Muslims performed the tawaf (circumambulation) of the Ka'bah and the sa'i (walking) between Safa and Marwah. Abdullah ibn Rawahah walked before the Prophet ﷺ reciting poetry praising Allah and His Messenger. The Muslims stayed for three days as agreed. This peaceful visit made a powerful impression on the Quraysh and contributed to several prominent figures embracing Islam shortly afterward, including Khalid ibn al-Walid — who had led the cavalry charge at Uhud — and Amr ibn al-As.",
    reference: "Sahih al-Bukhari 4251; Sahih al-Bukhari 4256",
  },
  {
    year: "630 CE",
    hijri: "8 AH",
    title: "Conquest of Mecca (Fath Makkah)",
    detail:
      "The Quraysh violated the Treaty of Hudaybiyyah by supporting their allies, the Banu Bakr, in an attack on the Khuza'ah tribe, who were allies of the Muslims. The Khuza'ah sent a delegation to Medina pleading for help, and Abu Sufyan himself traveled to Medina attempting to renew the treaty, but was turned away. The Prophet ﷺ prepared in secret and marched on Mecca with an army of 10,000 Muslims — the largest force he had ever assembled. On the night before entering Mecca, he ordered each soldier to light a fire, so that the hills surrounding Mecca were covered with 10,000 fires. Abu Sufyan came out to investigate, met al-Abbas (the Prophet's ﷺ uncle who had recently migrated), and was taken to the Prophet ﷺ. Witnessing the vast Muslim army, Abu Sufyan declared his Islam. The Prophet ﷺ then showed extraordinary magnanimity by declaring: 'Whoever enters the house of Abu Sufyan is safe. Whoever closes his door is safe. Whoever enters the Sacred Mosque is safe.' The city was taken almost entirely without bloodshed. The Prophet ﷺ entered Mecca with his head bowed low on his camel in humility to Allah, reciting Surah al-Fath. He went directly to the Ka'bah, performed tawaf, and then entered it. He destroyed the 360 idols with a stick, reciting: 'Truth has come and falsehood has departed. Indeed, falsehood is bound to depart.' He then stood at the door of the Ka'bah before the gathered people of Mecca — the very people who had tortured, expelled, and fought the Muslims for 21 years — and asked: 'What do you think I will do with you?' They replied: 'You are a noble brother, son of a noble brother.' He declared: 'Go, for you are free.' This general amnesty, known as the greatest act of forgiveness in history, led to the people of Mecca embracing Islam en masse.",
    reference: "Quran 17:81; Quran 110:1-3; Sahih al-Bukhari 4287; Sahih Muslim 1780",
  },
  {
    year: "630 CE",
    hijri: "8 AH",
    title: "Battle of Hunayn",
    detail:
      "Only two weeks after the conquest of Mecca, the powerful Bedouin tribes of Hawazin and Thaqif, led by Malik ibn Awf, assembled a large army — bringing their families, livestock, and possessions to ensure no one would flee. The Prophet ﷺ marched out with 12,000 men, the largest Muslim force to date, including many newly converted Meccans. Some Muslims felt overconfident in their numbers, which the Quran addressed: 'On the day of Hunayn, when your great number pleased you, but it did not avail you at all.' The enemy had prepared an ambush in the narrow valley of Hunayn. At dawn, as the Muslim army entered the valley, arrows rained down from the hillsides and the vanguard was thrown into chaos. Most of the army fled in disarray. The Prophet ﷺ stood firm on his white mule, riding forward into the arrows, calling out: 'I am the Prophet, it is no lie! I am the son of Abdul Muttalib!' His uncle Abbas, who had a powerful voice, called out to the Ansar and Muhajirun to return. The companions rallied around the Prophet ﷺ, and Allah sent unseen forces. The tide turned dramatically, and the enemy was routed. The spoils from Hunayn were enormous — 6,000 captives, 24,000 camels, and more than 40,000 sheep. The Prophet ﷺ distributed the spoils generously to the new Meccan converts to strengthen their faith, giving nothing to the Ansar. When some Ansar felt hurt, he gathered them and said: 'Are you not pleased that the people take sheep and camels, while you take the Messenger of Allah back with you to your homes?' They wept and said: 'We are pleased with the Messenger of Allah as our share.'",
    reference: "Quran 9:25-26; Sahih al-Bukhari 4317; Sahih al-Bukhari 4330; Sahih Muslim 1775",
  },
  {
    year: "630 CE",
    hijri: "9 AH",
    title: "Expedition of Tabuk",
    detail:
      "Reports reached Medina that the Byzantine (Roman) Empire was assembling a massive force at the northern frontier of Arabia, possibly preparing to invade. The Prophet ﷺ — unlike his usual practice of keeping military destinations secret — openly declared the destination and called for a general mobilization. It was the height of summer, the harvest season, and the journey was over 600 km through harsh desert. The Quran described the conditions as 'the hour of difficulty.' The hypocrites made excuses to stay behind, and Allah exposed their treachery in Surah at-Tawbah. The sincere companions sacrificed enormously — Abu Bakr donated his entire wealth, Umar gave half of his, and Uthman ibn Affan single-handedly equipped one-third of the army (about 10,000 soldiers with horses and camels), leading the Prophet ﷺ to say: 'Nothing Uthman does after today will harm him.' A poor companion named Abu Khaythamah, who initially stayed behind, was overcome with guilt seeing his two wives and shade while the Prophet ﷺ suffered in the sun, and rushed to join the army despite the distance. Three sincere companions — Ka'b ibn Malik, Murarah ibn al-Rabi', and Hilal ibn Umayyah — who stayed behind without valid excuse were boycotted for 50 days until Allah revealed their repentance and forgiveness. The army of 30,000 reached Tabuk but found no Roman army. The expedition secured the northern frontier, and several Christian and Jewish border communities agreed to pay the jizyah, establishing Muslim authority up to the borders of the Byzantine Empire.",
    reference: "Quran 9:38-42; Quran 9:117-118; Sahih al-Bukhari 4418; Sunan at-Tirmidhi 3700",
  },
  {
    year: "631 CE",
    hijri: "9 AH",
    title: "Year of Delegations (Am al-Wufud)",
    detail:
      "After the conquest of Mecca, the victory at Hunayn, and the show of strength at Tabuk, the remaining tribes of Arabia recognized the supremacy of Islam and the Muslim state. Delegations from across the Arabian Peninsula traveled to Medina to meet the Prophet ﷺ, declare their acceptance of Islam, and pledge allegiance. They came from Yemen, Oman, Bahrain, Najd, and every corner of Arabia. The Prophet ﷺ received each delegation with hospitality, taught them the fundamentals of Islam, and sent teachers back with them. Among the notable delegations was that of the Christians of Najran, who came with a large retinue of priests and scholars. The Prophet ﷺ debated with them about the nature of Isa (Jesus) and invited them to a mubahalah (mutual invocation of Allah's curse on the liars), but they declined and agreed to a treaty. The delegation of Abdul Qays from Bahrain came asking about faith, and the Prophet ﷺ told them: 'I command you with four things and forbid you from four things: I command you to believe in Allah alone — do you know what belief in Allah alone means? It is to testify that there is no god but Allah and that Muhammad is the Messenger of Allah, to establish the prayer, to pay the zakah, to fast Ramadan, and to give one-fifth of war spoils.' This period fulfilled the Quranic prophecy in Surah An-Nasr, and Islam became the dominant faith of the entire Arabian Peninsula without further major warfare.",
    reference: "Quran 110:1-3; Sahih al-Bukhari 53; Sahih Muslim 17",
  },
  {
    year: "632 CE",
    hijri: "10 AH",
    title: "The Farewell Pilgrimage (Hajjat al-Wada')",
    detail:
      "In the tenth year after Hijrah, the Prophet ﷺ announced his intention to perform Hajj. Over 100,000 Muslims accompanied him from Medina — the only Hajj he ever performed. He taught the ummah every rite of Hajj by his example, saying: 'Take your rites from me, for I do not know whether I will perform Hajj after this one.' He entered ihram at Dhul Hulayfah, proceeded to Mecca, performed tawaf and sa'i, and on the 8th of Dhul Hijjah led the pilgrims to Mina, then to the plain of Arafat on the 9th. It was here, mounted on his camel al-Qaswa', that he delivered the Farewell Sermon to the vast multitude gathered before him — one of the most significant addresses in human history.",
    reference: "Sahih Muslim 1218; Sahih al-Bukhari 1623; Sunan Ibn Majah 3074",
  },
  {
    year: "632 CE",
    hijri: "10 AH — 9th Dhul Hijjah",
    title: "The Farewell Sermon (Khutbat al-Wada')",
    detail:
      "Standing on the plain of Arafat before over 100,000 people, the Prophet ﷺ delivered his final public address. He began by praising Allah and then declared:\n\n'O People, lend me an attentive ear, for I know not whether after this year I shall ever be amongst you again. Therefore, listen to what I am saying to you very carefully and take these words to those who could not be present here today.'\n\n'O People, just as you regard this month, this day, this city as sacred, so regard the life and property of every Muslim as a sacred trust. Return the goods entrusted to you to their rightful owners. Hurt no one so that no one may hurt you.'\n\n'O People, it is true that you have certain rights with regard to your women, but they also have rights over you. Remember that you have taken them as your wives only under Allah's trust and with His permission. If they abide by your right, then to them belongs the right to be fed and clothed in kindness. Do treat your women well and be kind to them, for they are your partners and committed helpers.'\n\n'All mankind is from Adam and Eve. An Arab has no superiority over a non-Arab, nor a non-Arab over an Arab; a white person has no superiority over a black person, nor a black person over a white person — except by piety and good action. Learn that every Muslim is the brother of every other Muslim, and that the Muslims constitute one brotherhood.'\n\n'Remember, one day you will appear before Allah and answer for your deeds. So beware, do not stray from the path of righteousness after I am gone.'\n\n'O People, no prophet or apostle will come after me, and no new faith will be born. Reason well, therefore, O People, and understand the words which I convey to you. I leave behind me two things — the Quran and my Sunnah — and if you follow these you will never go astray.'\n\n'All those who listen to me shall pass on my words to others, and those to others again; and may the last ones understand my words better than those who listen to me directly. Be my witness, O Allah, that I have conveyed Your message to Your people.'\n\nAfter each declaration, he would point his finger to the sky and then to the people, saying: 'O Allah, bear witness! O Allah, bear witness!' The crowd echoed back in confirmation. It was during these blessed days that the final verse of legislation was revealed: 'Today I have perfected your religion for you, completed My favor upon you, and have chosen for you Islam as your religion' (Quran 5:3). When Umar ibn al-Khattab heard this verse, he wept, understanding that it signaled the approaching end of the Prophet's ﷺ mission on earth.\n\nThis sermon established, 1400 years ago, principles that the world would take centuries to recognize: racial equality, women's rights, the sanctity of life and property, the prohibition of usury, and the brotherhood of all believers regardless of their origin.",
    reference: "Sahih al-Bukhari 1623; Sahih al-Bukhari 4406; Sahih Muslim 1218; Musnad Ahmad 19774; Quran 5:3; Sahih al-Bukhari 4606",
  },
  {
    year: "632 CE",
    hijri: "11 AH — 12th Rabi' al-Awwal",
    title: "The Passing of the Prophet ﷺ",
    detail:
      "About three months after the Farewell Pilgrimage, the Prophet ﷺ fell ill with a severe fever and headache. Despite his illness, he continued to lead prayers in the mosque until he was too weak to stand, at which point he appointed Abu Bakr to lead in his place. During his final days, he freed his slaves, gave away his last possessions — even a few dirhams that remained in his house — and repeatedly asked: 'Have I wronged anyone? Let him come forward.' He addressed the Muslims from the door of Aisha's room, his head wrapped, saying: 'O people, the fire is kindled, and tribulations are coming like segments of a dark night. By Allah, you cannot hold me accountable for anything — I have not made lawful except what the Quran has made lawful, and I have not made unlawful except what the Quran has made unlawful.'\n\nHe called for his daughter Fatimah and whispered something to her. She wept. Then he whispered again, and she smiled. She later revealed: 'He told me he was going to die, so I wept. Then he told me I would be the first of his family to join him, and that I would be the leader of the women of Paradise, so I smiled.'\n\nOn Monday morning, 12th Rabi' al-Awwal, 11 AH (June 8, 632 CE), Abu Bakr had begun leading Fajr prayer. The Prophet ﷺ drew aside the curtain of Aisha's room and looked out at the Muslims praying. Anas said: 'His face was like a page of the Quran (radiant and bright). He smiled.' It was his last gaze upon his ummah at prayer. He returned to Aisha's lap, and his condition worsened. His final words, as his eyes were fixed upward, were: 'Rather, the highest companion... the highest companion (ar-Rafiq al-A'la).' Aisha said: 'He chose the Hereafter over this world.' He was 63 years old.\n\nUmar ibn al-Khattab, overwhelmed with grief, drew his sword and declared that the Prophet ﷺ had not died. Abu Bakr entered, kissed the Prophet ﷺ on the forehead, and went out to the people: 'Whoever worshipped Muhammad, let him know that Muhammad has died. And whoever worshipped Allah, let him know that Allah is Ever-Living and shall never die.' He then recited: 'Muhammad is no more than a messenger; other messengers have passed away before him. If he were to die or be killed, would you turn back on your heels?' (Quran 3:144). Umar said: 'It was as though I had never heard this verse until Abu Bakr recited it.' The Prophet ﷺ was buried where he passed away, in Aisha's room, which is now part of al-Masjid an-Nabawi in Medina.",
    reference: "Quran 3:144; Sahih al-Bukhari 4435; Sahih al-Bukhari 4462; Sahih al-Bukhari 1389; Sahih Muslim 2444; Sahih al-Bukhari 680",
  },
];

/* ───────────────────────── character & virtues ───────────────────────── */

type Virtue = {
  name: string;
  nameAr: string;
  description: string;
  hadith: string;
  reference: string;
};

const virtues: Virtue[] = [
  {
    name: "Mercy",
    nameAr: "الرحمة",
    description:
      "Allah declared: 'We have not sent you except as a mercy to all the worlds.' His mercy extended to believers and disbelievers, to adults and children, and even to animals. When the people of Ta'if stoned him until his sandals were soaked with blood, and the angel of the mountains offered to crush them between the mountains, he refused and prayed: 'Perhaps Allah will bring from their descendants people who worship Him alone.' He once saw a donkey that had been branded on its face and became angry, forbidding the practice. He told his companions of a woman who entered the Hellfire for starving a cat, and of a sinful man who was forgiven for giving water to a thirsty dog. He would shorten the congregational prayer if he heard a child crying, out of compassion for the child's mother.",
    hadith:
      "The Messenger of Allah ﷺ said: 'The merciful are shown mercy by the Most Merciful. Be merciful to those on earth, and the One in the heavens will be merciful to you.'",
    reference: "Quran 21:107; Sunan Abu Dawud 4941; Sahih al-Bukhari 3231; Sahih al-Bukhari 3318; Sahih al-Bukhari 2363; Sahih al-Bukhari 707",
  },
  {
    name: "Truthfulness",
    nameAr: "الصدق",
    description:
      "Even before prophethood, he was known among the Quraysh as 'Al-Amin' (The Trustworthy) and 'As-Sadiq' (The Truthful). His reputation was so unshakeable that even his enemies entrusted him with their valuables — on the night of the Hijrah, he instructed Ali to stay behind and return the deposits that the Quraysh had placed with him. When he first called the people of Mecca to Islam from Mount Safa, he asked them: 'If I told you there was an army behind this mountain, would you believe me?' They unanimously replied: 'Yes, we have never known you to lie.' He never lied even in jest, and taught that lying is incompatible with faith.",
    hadith:
      "The Messenger of Allah ﷺ said: 'Truthfulness leads to righteousness, and righteousness leads to Paradise. A man keeps telling the truth until he is recorded with Allah as a truthful person (siddiq). And lying leads to wickedness, and wickedness leads to the Hellfire. A man keeps lying until he is recorded with Allah as a liar.'",
    reference: "Sahih al-Bukhari 6094; Sahih Muslim 2607; Sahih al-Bukhari 4770",
  },
  {
    name: "Humility",
    nameAr: "التواضع",
    description:
      "Despite being the leader of an entire nation and the Messenger of Allah, he lived with extraordinary simplicity. Aisha reported that he would mend his own shoes, sew his own clothes, and milk his own goats. He sat on the ground and ate on the ground. A Bedouin once entered his gathering and had to ask: 'Which of you is Muhammad?' because nothing distinguished him from his companions. He ate with his servants, sat wherever there was space, and never allowed anyone to walk behind him as a follower.",
    hadith:
      "Anas ibn Malik said: 'Any servant-girl among the people of Medina could take the hand of the Messenger of Allah ﷺ and lead him wherever she wanted (to help her with a need).'",
    reference: "Sahih al-Bukhari 6072; Shama'il at-Tirmidhi 126",
  },
  {
    name: "Patience",
    nameAr: "الصبر",
    description:
      "He endured the death of six of his seven children in his own lifetime — Qasim, Abdullah, Zaynab, Ruqayyah, Umm Kulthum, and his infant son Ibrahim — in addition to years of persecution, a three-year boycott, exile from his homeland, and the loss of his most beloved wife Khadijah and his protective uncle in the same year. Yet he never complained against Allah's decree. When his son Ibrahim died in his arms, his eyes shed tears and he said: 'The eyes shed tears, the heart grieves, but we say only what pleases our Lord. O Ibrahim, we are grieved by your departure.' He taught that true patience is at the first strike of calamity, not after the grief has subsided.",
    hadith:
      "The Messenger of Allah ﷺ said: 'How wonderful is the affair of the believer, for all of it is good — and this is for no one except the believer. If something good happens to him, he is grateful, and that is good for him. If something bad happens to him, he is patient, and that is good for him.'",
    reference: "Sahih Muslim 2999; Sahih al-Bukhari 1303; Sahih al-Bukhari 1283",
  },
  {
    name: "Generosity",
    nameAr: "الكرم",
    description:
      "He never said 'no' to anyone who asked him for something. He gave away everything he had, and his family would often go days without a fire being lit in their home for cooking — surviving on just dates and water. When a man asked him for something, he gave him an entire valley full of sheep. The man returned to his people and said: 'O my people, accept Islam, for Muhammad gives like a man who does not fear poverty.' He was most generous during Ramadan, when Jibreel would visit him nightly to review the Quran.",
    hadith:
      "Ibn Abbas said: 'The Messenger of Allah ﷺ was the most generous of people, and he was most generous during Ramadan when Jibreel met him. Jibreel used to meet him every night in Ramadan and review the Quran with him. The Messenger of Allah ﷺ was more generous with good than the blowing wind.'",
    reference: "Sahih al-Bukhari 6; Sahih Muslim 2312; Sahih al-Bukhari 2567",
  },
  {
    name: "Bravery",
    nameAr: "الشجاعة",
    description:
      "He stood firm at Badr with only 313 poorly-armed men against over 1,000 warriors. At Uhud, when the army scattered and a rumor spread that he had been killed, he stood his ground with a handful of companions. At Hunayn, when 12,000 Muslims fled in panic, he rode forward on his mule toward the enemy calling out: 'I am the Prophet, it is no lie!' Ali ibn Abi Talib said: 'When the fighting was intense and the two sides clashed, we used to seek shelter behind the Messenger of Allah ﷺ, and no one would be closer to the enemy than him.'",
    hadith:
      "Anas said: 'The Prophet ﷺ was the best of people, the most generous of people, and the bravest of people. One night the people of Medina were alarmed by a loud sound. The people went toward it, but the Prophet ﷺ met them coming back, having already investigated the matter ahead of everyone else, riding the horse of Abu Talhah bareback, with a sword around his neck. He said: Do not be afraid, do not be afraid.'",
    reference: "Sahih al-Bukhari 2820; Sahih Muslim 2307; Sahih Muslim 1776",
  },
  {
    name: "Forgiveness",
    nameAr: "العفو",
    description:
      "When he conquered Mecca with 10,000 soldiers — having the power to take revenge on those who had persecuted, tortured, and killed his companions for over 20 years — he forgave them all, declaring: 'Go, for you are free.' He forgave Hind bint Utbah, who had ordered the killing of his uncle Hamzah and mutilated his body. He forgave Wahshi, the man who actually killed Hamzah with a spear. He even forgave Ikrimah ibn Abi Jahl, the son of his greatest enemy, who had fought against Islam for decades. He never struck anyone with his hand — not a servant, not a woman, not anyone — except in battle in the cause of Allah.",
    hadith:
      "Aisha said: 'The Messenger of Allah ﷺ never took revenge for himself. But if the sanctity of Allah was violated, he would take action for the sake of Allah.'",
    reference: "Sahih al-Bukhari 3560; Sahih Muslim 2327; Sahih Muslim 2328",
  },
  {
    name: "Justice",
    nameAr: "العدل",
    description:
      "He judged fairly even against his own family and companions. When a noble woman from the Makhzum clan of the Quraysh was caught stealing and people sent Usamah ibn Zayd to intercede — knowing the Prophet ﷺ loved Usamah — his face changed with anger. He stood and addressed the people, explaining that previous nations were destroyed because they applied the law selectively: punishing the weak and sparing the powerful. He established justice as a core principle of the Muslim community, declaring that all people are equal before the law of Allah, regardless of their lineage, wealth, or status.",
    hadith:
      "The Messenger of Allah ﷺ said: 'The people before you were destroyed because when a noble person among them stole, they would leave him, but when a weak person stole, they would apply the punishment. By Allah, if Fatimah the daughter of Muhammad were to steal, I would cut off her hand.'",
    reference: "Sahih al-Bukhari 3475; Sahih Muslim 1688",
  },
  {
    name: "Modesty",
    nameAr: "الحياء",
    description:
      "He was the most modest of people, more shy than a young maiden in her chamber. Abu Sa'id al-Khudri said that when something displeased him, it could be seen on his face — but he would rarely confront someone directly out of shyness. He never stared at anyone's face. He would lower his gaze and looked at the ground more than he looked at the sky. He taught that modesty is an integral branch of faith, and that it brings nothing but good.",
    hadith:
      "The Messenger of Allah ﷺ said: 'Modesty (haya') is a branch of faith.' And Abu Sa'id al-Khudri said: 'The Prophet ﷺ was more shy than a maiden in her chamber. If he saw something he disliked, we would recognize it in his face.'",
    reference: "Sahih al-Bukhari 3562; Sahih Muslim 35",
  },
  {
    name: "Love for Family",
    nameAr: "حب الأهل",
    description:
      "He was deeply affectionate with his family. He would race with his wife Aisha — she won the first time, and he won the second, and he smiled and said: 'This one is for that one.' He would greet his daughter Fatimah by standing up, kissing her forehead, and seating her in his place. He would carry his granddaughter Umamah on his shoulders during prayer, setting her down when he prostrated and picking her up when he stood. He declared that the best of people are those who are best to their families.",
    hadith:
      "The Messenger of Allah ﷺ said: 'The best of you are the best to their families, and I am the best of you to my family.'",
    reference: "Sunan at-Tirmidhi 3895; Sunan Abu Dawud 2578; Sahih al-Bukhari 5994; Sahih al-Bukhari 516",
  },
  {
    name: "Gentleness",
    nameAr: "الرفق",
    description:
      "He chose the easier of two options in every matter, so long as it was not sinful. When a Bedouin urinated in the mosque, the companions rushed to stop him, but the Prophet ﷺ told them to leave him alone and wait until he finished, then had water poured over the spot. He said: 'You were sent to make things easy, not to make them difficult.' He dealt gently with the young, the old, the ignorant, and the hostile. A man once grabbed him so violently by his cloak that it left marks on his neck, demanding money — the Prophet ﷺ simply smiled and ordered that the man be given what he needed.",
    hadith:
      "The Messenger of Allah ﷺ said: 'Allah is gentle and loves gentleness. He gives for gentleness what He does not give for harshness, and what He does not give for anything else.'",
    reference: "Sahih Muslim 2593; Sahih al-Bukhari 6025; Sahih al-Bukhari 3149",
  },
  {
    name: "Asceticism",
    nameAr: "الزهد",
    description:
      "He lived with extraordinary simplicity despite having the world at his disposal. He slept on a rough straw mat that left marks on his body. Umar ibn al-Khattab once entered his room, saw the marks on his side, and wept. The Prophet ﷺ asked why he was crying, and Umar said: 'The kings of Persia and Rome live in luxury while you, the Messenger of Allah, live like this.' He replied: 'Are you not content that they have the world and we have the Hereafter?' His pillow was stuffed with palm fibers. Aisha reported that he never ate his fill of barley bread for two consecutive days, and that months would pass with no fire lit in their home — they survived on just dates and water.",
    hadith:
      "The Messenger of Allah ﷺ said: 'What have I to do with the world? My example and the example of the world is like that of a traveler who rests under the shade of a tree for a while, then moves on and leaves it behind.'",
    reference: "Sunan at-Tirmidhi 2377; Sahih al-Bukhari 6452; Sahih Muslim 2784; Sahih al-Bukhari 2567",
  },
  {
    name: "Kindness to Children",
    nameAr: "رحمة الأطفال",
    description:
      "He would greet children in the street with salam. He would pick up his grandsons Hasan and Husayn and kiss them. A man saw him kissing his grandchild and said: 'I have ten children and I have never kissed any of them.' The Prophet ﷺ looked at him and said: 'The one who does not show mercy will not be shown mercy.' He would prolong his prostration in prayer if one of his grandchildren climbed on his back, not wanting to disturb them.",
    hadith:
      "The Prophet ﷺ kissed Hasan ibn Ali while al-Aqra' ibn Habis was sitting with him. Al-Aqra' said: 'I have ten children and I have never kissed any of them.' The Prophet ﷺ looked at him and said: 'Whoever does not show mercy will not be shown mercy.'",
    reference: "Sahih al-Bukhari 5997; Sahih Muslim 2318",
  },
  {
    name: "Kindness to Servants",
    nameAr: "معاملة الخدم",
    description:
      "Anas ibn Malik served him for ten years — from the age of ten until the Prophet's ﷺ passing. In that entire decade, the Prophet ﷺ never once rebuked him, never said 'uff' to him, and never said 'why did you do this?' or 'why didn't you do that?' He commanded people to feed their servants from the same food they ate and clothe them from the same clothes they wore. He said: 'Your servants are your brothers whom Allah has placed under your authority. Whoever has a brother under his authority, let him feed him from what he eats and clothe him from what he wears, and do not burden them with what overwhelms them.'",
    hadith:
      "Anas said: 'I served the Prophet ﷺ for ten years. He never said to me uff, nor did he ever say: why did you do this? or why did you not do that?'",
    reference: "Sahih al-Bukhari 6038; Sahih Muslim 2309; Sahih al-Bukhari 30",
  },
  {
    name: "Honoring Neighbors & Guests",
    nameAr: "حق الجار والضيف",
    description:
      "He said that Jibreel kept advising him about the rights of neighbors until he thought the neighbor would be given a share of inheritance. He forbade harming one's neighbor in any way and said: 'By Allah, he does not believe — the one whose neighbor is not safe from his evil.' He instructed that whoever believes in Allah and the Last Day should honor their guest and be generous to their neighbor. He would send food to his neighbors and taught that even adding extra water to soup to share with one's neighbor is an act of goodness.",
    hadith:
      "The Prophet ﷺ said: 'Whoever believes in Allah and the Last Day, let him not harm his neighbor. Whoever believes in Allah and the Last Day, let him honor his guest. Whoever believes in Allah and the Last Day, let him speak good or remain silent.'",
    reference: "Sahih al-Bukhari 6018; Sahih Muslim 47; Sahih al-Bukhari 6014",
  },
  {
    name: "Kindness to Animals",
    nameAr: "الرفق بالحيوان",
    description:
      "He forbade branding animals on the face, overloading beasts of burden, and using living creatures as targets for sport. When he saw a donkey branded on its face, he became angry and asked: 'Who did this?' He told his companions of a woman who entered the Hellfire for locking up a cat until it died of starvation, and of a sinful person who was forgiven by Allah for giving water to a thirsty dog by climbing down into a well with his shoe. He once entered a garden and found a camel that was overworked and underfed — it came to him and groaned, and he stroked its head and said: 'Who is the owner of this camel? This camel complains that you starve it and exhaust it.'",
    hadith:
      "The Prophet ﷺ said: 'A woman was punished because of a cat she had locked up until it died. She did not feed it or let it eat from the vermin of the earth.' And he said: 'While a man was walking, he became extremely thirsty. He found a well, went down into it, drank, and came out. He saw a dog panting and eating moist earth from thirst. He said: This dog is suffering the same thirst I suffered. He went back down into the well, filled his shoe with water, and gave it to the dog. Allah thanked him and forgave him.'",
    reference: "Sahih al-Bukhari 3318; Sahih al-Bukhari 2363; Sahih Muslim 2117; Sunan Abu Dawud 2549",
  },
];

/* ───────────────────────── physical description ───────────────────────── */

type PhysicalTrait = {
  trait: string;
  description: string;
  reference: string;
  group: "face" | "body" | "manner";
};

const physicalDescription: PhysicalTrait[] = [
  /* ── Face & Features ── */
  {
    trait: "Face",
    description:
      "His face was round with a slight length, not fully round. It was white tinged with redness, luminous as if the sun were flowing across it. When he was pleased, his face would light up as if it were a piece of the moon. Ka'b ibn Malik said: 'When the Messenger of Allah ﷺ was happy, his face would shine like a piece of the moon — we could recognize that from his face.'",
    reference: "Sahih al-Bukhari 3552; Sahih Muslim 2344; Sahih al-Bukhari 3556",
    group: "face",
  },
  {
    trait: "Eyes",
    description:
      "He had large, dark black eyes with natural kohl-like lining (akhal al-'aynayn), giving them a striking appearance without actually applying kohl. His eyelashes were long and thick. The white of his eyes had a slight reddish tinge. His gaze was more often lowered toward the ground than raised to the sky, and he would look at things with a slight side-glance rather than a full stare.",
    reference: "Shama'il at-Tirmidhi 1; Sahih al-Bukhari 3549",
    group: "face",
  },
  {
    trait: "Teeth",
    description:
      "His front teeth were wide-spaced (aflaj), which was considered a mark of beauty among the Arabs. When he spoke, a light seemed to emanate from between his teeth. His teeth were bright and clean — he was meticulous about using the miswak (tooth-stick), saying: 'Were it not that I would burden my ummah, I would have ordered them to use the miswak before every prayer.'",
    reference: "Shama'il at-Tirmidhi 1; Sahih al-Bukhari 887",
    group: "face",
  },
  {
    trait: "Hair",
    description:
      "His hair was neither straight nor tightly curled, but wavy. It reached between his earlobes and shoulders, and at times grew to his shoulders. He sometimes parted it in the middle. He used to oil and comb his hair regularly. He had a few white hairs at his temples — no more than twenty in total — at the time of his passing. Anas ibn Malik said: 'Allah took him when there were not twenty white hairs on his head and beard.'",
    reference: "Sahih al-Bukhari 3551; Sahih Muslim 2338; Sahih al-Bukhari 3547",
    group: "face",
  },
  {
    trait: "Beard",
    description:
      "He had a full, thick beard that covered his chest. He would sometimes apply oil to it and comb it regularly. He used to perfume it with musk and other fragrances. He commanded the Muslims to grow their beards and trim their mustaches.",
    reference: "Shama'il at-Tirmidhi 23; Sahih Muslim 2340; Sahih al-Bukhari 5893",
    group: "face",
  },
  {
    trait: "Complexion",
    description:
      "His skin was fair, not excessively white, with a light reddish glow. Anas described him as 'neither very white nor very dark, but a shade between the two — a radiant white.' His skin was softer than silk. Anas said: 'I never touched silk or dibaj (brocade) softer than the palm of the Messenger of Allah ﷺ.'",
    reference: "Sahih al-Bukhari 3547; Sahih Muslim 2330; Sahih al-Bukhari 3561",
    group: "face",
  },
  /* ── Body & Build ── */
  {
    trait: "Overall Appearance",
    description:
      "He was the most handsome of people. Al-Bara ibn Azib said: 'The Messenger of Allah ﷺ was of medium height with broad shoulders. His hair reached his earlobes. I saw him in a red garment, and I never saw anything more beautiful than him.' He was neither excessively tall nor short, but of medium height leaning toward tallness. When he walked among people, he appeared taller than those around him.",
    reference: "Sahih al-Bukhari 3549; Shama'il at-Tirmidhi 1",
    group: "body",
  },
  {
    trait: "Build & Physique",
    description:
      "He had broad shoulders and a wide chest. His arms were long and his palms were wide. His joints were large and strong. The line of hair running from his chest to his navel was fine and narrow. Between his shoulder blades was the Seal of Prophethood — a raised mark the size of a pigeon's egg, surrounded by moles. Jabir ibn Samurah said: 'I saw the seal between his shoulders like a pigeon's egg, resembling his body in color.'",
    reference: "Sahih Muslim 2344; Sahih al-Bukhari 3541; Sahih Muslim 2346",
    group: "body",
  },
  {
    trait: "Hands",
    description:
      "He had large, well-proportioned hands with wide palms. Despite their size, they were remarkably soft. Anas said: 'I never touched silk or dibaj softer than the palm of the Messenger of Allah ﷺ.' His handshake left a lingering fragrance — whoever shook hands with him would smell the scent on their hand for the rest of the day.",
    reference: "Sahih al-Bukhari 3561; Sahih Muslim 2329",
    group: "body",
  },
  {
    trait: "Fragrance",
    description:
      "He had a naturally beautiful scent even without applying perfume. Anas said: 'I never smelled any amber or musk or anything more fragrant than the scent of the Messenger of Allah ﷺ.' He also loved applying perfume and would never refuse it when offered. His favorite scent was musk. He said: 'The best of perfume is musk.'",
    reference: "Sahih Muslim 2331; Sahih al-Bukhari 5929; Sahih Muslim 2252",
    group: "body",
  },
  {
    trait: "Sweat",
    description:
      "His sweat was described as being like pearls, glistening on his skin. It had a fragrance more beautiful than perfume. Umm Sulaym (the mother of Anas) would collect his sweat when he slept at her home, gathering it in a bottle. When the Prophet ﷺ asked her why, she said: 'We hope for its barakah (blessing) for our children — and it is the most fragrant of fragrances.'",
    reference: "Sahih Muslim 2331; Sahih Muslim 2332",
    group: "body",
  },
  /* ── Manner & Presence ── */
  {
    trait: "Walk & Manner",
    description:
      "He walked swiftly with purpose, leaning slightly forward as if descending a slope. His stride was wide and steady. When he turned, he turned his whole body — he did not glance sideways while walking. He spoke with deliberation — anyone could count his words. His speech was clear and concise, and his silence was longer than his speech. He would repeat important words three times to ensure understanding.",
    reference: "Shama'il at-Tirmidhi 118; Sahih Muslim 2330; Sahih al-Bukhari 95",
    group: "manner",
  },
  {
    trait: "Smile & Laughter",
    description:
      "He smiled frequently — so much so that Abdullah ibn al-Harith said: 'I never saw anyone who smiled more than the Messenger of Allah ﷺ.' His smile was radiant and put people at ease. His laughter was mostly smiling; he would rarely laugh out loud, and when he did, at most his premolars would show. Jarir ibn Abdullah said: 'The Messenger of Allah ﷺ never saw me except that he smiled at me.'",
    reference: "Shama'il at-Tirmidhi 217; Sahih al-Bukhari 3035; Sahih Muslim 2475",
    group: "manner",
  },
  {
    trait: "Voice",
    description:
      "His voice was powerful and far-reaching, able to carry to the farthest rows of a large gathering. Despite its strength, it was pleasant and melodious. He spoke deliberately, pausing between sentences so that listeners could understand and remember his words. Aisha said: 'He did not speak quickly the way you do — he spoke clearly, word by word, so that whoever sat with him could memorize what he said.'",
    reference: "Shama'il at-Tirmidhi 222; Sahih al-Bukhari 3568",
    group: "manner",
  },
  {
    trait: "Clothing & Grooming",
    description:
      "He preferred white garments, saying: 'Wear white clothes, for they are the purest and best; and shroud your dead in them.' He also wore garments of green and red-striped Yemeni cloth. He regularly applied kohl (ithmid) to his eyes before sleeping, three times in each eye. He used the miswak (tooth-stick) frequently — upon waking, before prayer, and upon entering his home. He oiled his hair, combed it regularly, and forbade neglecting one's appearance.",
    reference: "Sunan at-Tirmidhi 2810; Sahih al-Bukhari 5929; Sahih al-Bukhari 887; Sunan Abu Dawud 4159",
    group: "manner",
  },
];

/* ───────────────────────── family & companions ───────────────────────── */

type FamilyMember = {
  name: string;
  nameAr: string;
  relation: string;
  detail: string;
};

const wives: FamilyMember[] = [
  {
    name: "Khadijah bint Khuwaylid",
    nameAr: "خديجة بنت خويلد",
    relation: "First wife — married ~15 years before prophethood",
    detail:
      "A noble, wealthy businesswoman of the Quraysh who was impressed by his honesty and character when he led her trading caravan to Syria. She proposed marriage through her friend Nafisah, and he married her when he was 25 and she was 40. She was the first person to accept Islam and his greatest supporter during the most difficult years — spending her entire wealth in the cause of Allah. She bore him all his children except Ibrahim. Jibreel himself brought her greetings of peace from Allah, and the Prophet ﷺ said: 'The best of its women is Maryam bint Imran, and the best of its women is Khadijah bint Khuwaylid.' He loved her so deeply that years after her passing, Aisha said: 'I was never jealous of any wife of the Prophet ﷺ as much as I was of Khadijah, even though I never saw her — because of how often he would mention her.'",
  },
  {
    name: "Sawdah bint Zam'ah",
    nameAr: "سودة بنت زمعة",
    relation: "Second wife — married after Khadijah's passing",
    detail:
      "An early convert to Islam who migrated to Abyssinia with her first husband Sakran ibn Amr. After he passed away upon their return, the Prophet ﷺ married her shortly after Khadijah's death. She was the first woman he married after Khadijah. She cared for the household and raised the Prophet's ﷺ daughters. She was known for her tall stature, kind nature, and sense of humor that would make the Prophet ﷺ smile and laugh.",
  },
  {
    name: "Aisha bint Abi Bakr",
    nameAr: "عائشة بنت أبي بكر",
    relation: "Daughter of Abu Bakr as-Siddiq",
    detail:
      "The daughter of Abu Bakr, the Prophet's ﷺ closest companion. She was the most knowledgeable of the wives in fiqh, hadith, medicine, poetry, and Arab genealogy. She narrated over 2,200 hadiths — more than any other wife. When asked who was the most beloved person to him, the Prophet ﷺ replied: 'Aisha.' Senior companions like Abu Hurayrah, Ibn Abbas, and Abu Musa would consult her on matters of jurisprudence. She corrected the mistakes of other narrators and was recognized as one of the greatest scholars of her generation. The Prophet ﷺ passed away with his head resting against her, and was buried in her room.",
  },
  {
    name: "Hafsah bint Umar",
    nameAr: "حفصة بنت عمر",
    relation: "Daughter of Umar ibn al-Khattab",
    detail:
      "The daughter of the second caliph, Umar ibn al-Khattab. She was previously married to Khunays ibn Hudhafah, who was martyred after the Battle of Badr. After his death, Umar offered her in marriage to Abu Bakr and Uthman, but both declined — knowing that the Prophet ﷺ had expressed interest. She was literate, knowledgeable, and devoted to worship. After the Quran was compiled into a single manuscript during Abu Bakr's caliphate, it was entrusted to her for safekeeping. It remained with her until Uthman used it as the basis for the standardized copies distributed throughout the Muslim lands.",
  },
  {
    name: "Zaynab bint Khuzaymah",
    nameAr: "زينب بنت خزيمة",
    relation: "Mother of the Poor (Umm al-Masakin)",
    detail:
      "She was known even before Islam as 'Umm al-Masakin' (Mother of the Poor) for her extraordinary generosity to the needy. Her previous husband Abdullah ibn Jahsh was martyred at the Battle of Uhud. The Prophet ﷺ married her to honor her sacrifice and care for her. She passed away only about two to three months after the marriage — the shortest marriage of any of the Prophet's ﷺ wives. She and Khadijah are the only two wives who passed away during the Prophet's ﷺ lifetime.",
  },
  {
    name: "Umm Salamah (Hind bint Abi Umayyah)",
    nameAr: "أم سلمة",
    relation: "Wife of wisdom and counsel",
    detail:
      "She was previously married to Abu Salamah (Abdullah ibn Abdul Asad), one of the earliest converts to Islam. When he died from wounds sustained at Uhud, she was devastated and said the dua the Prophet ﷺ had taught her: 'To Allah we belong and to Him we return. O Allah, reward me in my calamity and replace it with something better.' Allah replaced her loss with the Prophet ﷺ himself. She was known for her wisdom and sound judgment. At Hudaybiyyah, when the companions hesitated to shave their heads and sacrifice their animals after the treaty, the Prophet ﷺ consulted her. She advised him to go out and do it himself without speaking to anyone — once the companions saw him act, they all followed. She narrated nearly 400 hadiths and was the last of the Prophet's ﷺ wives to pass away.",
  },
  {
    name: "Zaynab bint Jahsh",
    nameAr: "زينب بنت جحش",
    relation: "Cousin of the Prophet ﷺ",
    detail:
      "She was the Prophet's ﷺ cousin — her mother Umaymah was his paternal aunt. She was previously married to Zayd ibn Harithah, the Prophet's ﷺ adopted son. After their marriage ended, Allah commanded the Prophet ﷺ to marry her in the Quran (33:37) to abolish the pre-Islamic taboo that treated the divorced wives of adopted sons as permanently forbidden. She took great pride that her marriage was ordained by Allah from above the seven heavens. She was known for her exceptional generosity and handiwork — she would tan leather and sew, donating all her earnings to the poor. Aisha said: 'I never saw a woman better in her religion, more God-fearing, more truthful, more generous, and more devoted to charity than Zaynab.' She was the first of the Prophet's ﷺ wives to pass away after him.",
  },
  {
    name: "Juwayriyah bint al-Harith",
    nameAr: "جويرية بنت الحارث",
    relation: "Daughter of the chief of Banu Mustaliq",
    detail:
      "She was the daughter of al-Harith ibn Abi Dirar, the chief of the Banu Mustaliq tribe. After the Muslims' encounter with her tribe, she came to the Prophet ﷺ seeking a deal for her freedom. He offered to pay her ransom and marry her, which she accepted. When the companions learned that the Banu Mustaliq were now relatives of the Prophet ﷺ by marriage, they freed all the captives from the tribe — about 100 families. Aisha said: 'I know of no woman who was a greater blessing to her people than Juwayriyah.' She was deeply devoted to worship and dhikr — the Prophet ﷺ once left her in the morning while she was making dhikr and returned hours later to find her still in the same spot.",
  },
  {
    name: "Umm Habibah (Ramlah bint Abi Sufyan)",
    nameAr: "أم حبيبة",
    relation: "Daughter of Abu Sufyan",
    detail:
      "The daughter of Abu Sufyan, the leader of the Quraysh and one of the Prophet's ﷺ strongest opponents. She embraced Islam early and migrated to Abyssinia with her husband Ubaydullah ibn Jahsh. There, her husband apostatized and converted to Christianity, eventually dying in that state — yet she remained firm in her Islam despite being alone and far from home. The Negus (An-Najashi) of Abyssinia conducted her marriage to the Prophet ﷺ in absentia and paid her mahr on his behalf. When her father Abu Sufyan visited Medina before his own conversion and tried to sit on the Prophet's ﷺ bedding in her room, she pulled it away, saying she would not let an impure polytheist sit on the Messenger of Allah's ﷺ bedding — choosing her faith over her own father.",
  },
  {
    name: "Safiyyah bint Huyayy",
    nameAr: "صفية بنت حيي",
    relation: "Noble lineage of prophets",
    detail:
      "She was the daughter of Huyayy ibn Akhtab, the chief of Banu Nadir, and was descended from the lineage of the Prophet Harun (Aaron, peace be upon him). After the Battle of Khaybar, the Prophet ﷺ freed her and proposed marriage, which she accepted, choosing Islam and the Prophet ﷺ over returning to her people. Some of the other wives would occasionally tease her about her Jewish origins. When she came to the Prophet ﷺ in tears about this, he comforted her and said: 'Tell them: My father is Harun, my uncle is Musa, and my husband is Muhammad — so what do you have over me?' She was known for her intelligence, dignity, and forbearance.",
  },
  {
    name: "Maymunah bint al-Harith",
    nameAr: "ميمونة بنت الحارث",
    relation: "Last wife of the Prophet ﷺ",
    detail:
      "The last woman the Prophet ﷺ married. She was the maternal aunt of both Khalid ibn al-Walid and Abdullah ibn Abbas. She was known for her deep piety, constant worship, and generosity. Ibn Abbas — one of the greatest scholars among the companions — learned much about the Prophet's ﷺ private worship and night prayers from her accounts. She passed away in Sarif, near Mecca — the same place where her marriage to the Prophet ﷺ had been contracted.",
  },
];

const children: FamilyMember[] = [
  {
    name: "Qasim",
    nameAr: "القاسم",
    relation: "Son (from Khadijah)",
    detail: "His firstborn son, after whom the Prophet ﷺ was known by his kunya 'Abu al-Qasim.' He passed away in infancy in Mecca before the prophethood. The Prophet ﷺ later said: 'Name yourselves with my name, but do not use my kunya (Abu al-Qasim).'",
  },
  {
    name: "Zaynab",
    nameAr: "زينب",
    relation: "Eldest daughter (from Khadijah)",
    detail: "The eldest daughter. She married her maternal cousin Abu al-As ibn al-Rabi' before Islam. After the Prophet's ﷺ mission began, she accepted Islam but her husband initially did not, creating a painful separation. She remained in Mecca while the Prophet ﷺ migrated. After Abu al-As was captured at Badr, she sent her mother Khadijah's necklace as ransom — when the Prophet ﷺ saw it, he wept. Abu al-As later embraced Islam and they were reunited. She passed away in 8 AH.",
  },
  {
    name: "Ruqayyah",
    nameAr: "رقية",
    relation: "Daughter (from Khadijah)",
    detail: "She was initially married to Utbah, the son of Abu Lahab, but he divorced her under his father's pressure after the Prophet's ﷺ mission began. She then married Uthman ibn Affan and they were among the first to migrate to Abyssinia together. She later migrated to Medina. She fell gravely ill during the Battle of Badr, and Uthman stayed behind to care for her on the Prophet's ﷺ instructions. She passed away the same day the news of victory at Badr reached Medina.",
  },
  {
    name: "Umm Kulthum",
    nameAr: "أم كلثوم",
    relation: "Daughter (from Khadijah)",
    detail: "She was initially married to Utaybah, another son of Abu Lahab, who also divorced her under his father's pressure. After her sister Ruqayyah's death, the Prophet ﷺ married her to Uthman ibn Affan, earning Uthman the honored title 'Dhun-Nurayn' (Possessor of Two Lights) for having married two of the Prophet's ﷺ daughters. She passed away in 9 AH, and the Prophet ﷺ was deeply saddened.",
  },
  {
    name: "Fatimah",
    nameAr: "فاطمة",
    relation: "Youngest daughter (from Khadijah)",
    detail:
      "The most beloved daughter of the Prophet ﷺ, and the one who resembled him the most in her walk and manner. She married Ali ibn Abi Talib and was the mother of Hasan and Husayn — through whom the Prophet's ﷺ lineage continues. The Prophet ﷺ said: 'Fatimah is the leader of the women of the people of Paradise.' Whenever she would visit him, he would stand up, kiss her forehead, and seat her in his place. She was the only one of his children who survived him — she passed away six months after his death. She was known for her patience, devotion, and simple life despite hardship.",
  },
  {
    name: "Abdullah",
    nameAr: "عبد الله",
    relation: "Son (from Khadijah)",
    detail: "Also known as At-Tayyib (the Pure) and At-Tahir (the Clean). He was born after the beginning of prophethood and passed away in infancy in Mecca. Some scholars consider At-Tayyib and At-Tahir to be the same child with different epithets, while others count them as separate children.",
  },
  {
    name: "Ibrahim",
    nameAr: "إبراهيم",
    relation: "Son (from Mariyah al-Qibtiyyah)",
    detail:
      "Born in Medina in 8 AH. He was entrusted to a wet-nurse named Umm Sayf in the outskirts of Medina. He passed away at around 17 or 18 months old. The Prophet ﷺ held him as he took his last breaths, with tears streaming down his face, and said: 'The eyes shed tears, the heart grieves, but we say only what pleases our Lord. O Ibrahim, we are grieved by your departure.' A solar eclipse occurred on the day of his death, and some people attributed it to Ibrahim's passing. The Prophet ﷺ corrected them: 'The sun and the moon are two signs of Allah. They are not eclipsed for the death or birth of anyone.'",
  },
];

const companions: FamilyMember[] = [
  {
    name: "Abu Bakr as-Siddiq",
    nameAr: "أبو بكر الصديق",
    relation: "First Caliph",
    detail:
      "The closest companion and first free man to accept Islam. He accompanied the Prophet ﷺ during the Hijrah. The Prophet ﷺ said: 'If I were to take a khalil (intimate friend) other than my Lord, I would have taken Abu Bakr.' He spent his entire wealth for Islam.",
  },
  {
    name: "Umar ibn al-Khattab",
    nameAr: "عمر بن الخطاب",
    relation: "Second Caliph",
    detail:
      "Known as 'Al-Faruq' (the one who distinguishes truth from falsehood). His conversion to Islam was a turning point — the Prophet ﷺ had prayed for it. He was unmatched in justice and administration.",
  },
  {
    name: "Uthman ibn Affan",
    nameAr: "عثمان بن عفان",
    relation: "Third Caliph",
    detail:
      "Known as 'Dhun-Nurayn.' He was extremely wealthy and spent generously for Islam. He equipped the entire army for Tabuk, bought the well of Rumah for the Muslims, and oversaw the compilation of the Quran into a single standardized manuscript.",
  },
  {
    name: "Ali ibn Abi Talib",
    nameAr: "علي بن أبي طالب",
    relation: "Fourth Caliph",
    detail:
      "The Prophet's ﷺ cousin and son-in-law, the first youth to accept Islam. He slept in the Prophet's ﷺ bed during the Hijrah as a decoy while the Quraysh plotted assassination. Known for his bravery, knowledge, and eloquence. The Prophet ﷺ said to him: 'You are to me as Harun was to Musa, except that there is no prophet after me.' He was the hero of Khaybar and one of the greatest scholars of the Quran and Islamic jurisprudence.",
  },
  {
    name: "Bilal ibn Rabah",
    nameAr: "بلال بن رباح",
    relation: "First Muezzin",
    detail:
      "An Abyssinian slave who was tortured for accepting Islam — his master would place a boulder on his chest in the scorching heat. Abu Bakr purchased and freed him. He became the first muezzin (caller to prayer) in Islam.",
  },
  {
    name: "Khadijah bint Khuwaylid",
    nameAr: "خديجة بنت خويلد",
    relation: "First person to accept Islam",
    detail:
      "His first wife and the first person in history to accept Islam. She supported him emotionally, financially, and spiritually. Jibreel sent her salam (greetings) from Allah, and the Prophet ﷺ said she is one of the best women of all time.",
  },
  {
    name: "Hamzah ibn Abdul Muttalib",
    nameAr: "حمزة بن عبد المطلب",
    relation: "Lion of Allah",
    detail:
      "The Prophet's ﷺ uncle, known as Asadullah (Lion of Allah) and Sayyid ash-Shuhada (Master of the Martyrs). He was one of the bravest warriors in Islam. He was martyred at the Battle of Uhud. The Prophet ﷺ wept deeply over his death.",
  },
  {
    name: "Khalid ibn al-Walid",
    nameAr: "خالد بن الوليد",
    relation: "Sword of Allah",
    detail:
      "Initially fought against the Muslims at Uhud, then embraced Islam and became the greatest military commander in Islamic history. The Prophet ﷺ gave him the title 'Sayfullah' (Sword of Allah). He never lost a single battle in his career.",
  },
  {
    name: "Abu Hurayrah",
    nameAr: "أبو هريرة",
    relation: "Greatest narrator of hadith",
    detail:
      "He accepted Islam in 7 AH and devoted himself entirely to learning from the Prophet ﷺ, rarely leaving his side. Despite being a companion for only about four years, he narrated over 5,300 hadiths — more than any other companion — due to his extraordinary memory and constant attendance. He was poor and lived in the Suffah (the covered area of the Prophet's ﷺ Mosque) with other destitute companions, prioritizing knowledge over worldly earnings.",
  },
  {
    name: "Salman al-Farisi",
    nameAr: "سلمان الفارسي",
    relation: "The Persian seeker of truth",
    detail:
      "Born a Zoroastrian in Persia, he traveled across the lands seeking true religion — moving from master to master, from Christianity to finally Islam in Medina. His journey of seeking truth is one of the most remarkable in Islamic history. He suggested digging the trench at the Battle of Al-Khandaq — a strategy unknown to the Arabs that saved Medina. The Prophet ﷺ helped him gain his freedom by planting date palms and paying his ransom.",
  },
  {
    name: "Mus'ab ibn Umayr",
    nameAr: "مصعب بن عمير",
    relation: "First ambassador of Islam",
    detail:
      "A wealthy young man of Quraysh who gave up his luxurious life for Islam. The Prophet ﷺ sent him to Medina as the first ambassador to teach Islam. His efforts led to the conversion of most of Medina before the Hijrah. He was martyred at Uhud, and was so poor by then that his burial shroud could not cover his entire body.",
  },
  {
    name: "Abdur-Rahman ibn Awf",
    nameAr: "عبد الرحمن بن عوف",
    relation: "One of the ten promised Paradise",
    detail:
      "One of the earliest converts and among the ten companions promised Paradise (Ashara Mubashara). He was an immensely successful merchant who donated vast amounts of wealth for Islam. When he migrated to Medina with nothing, an Ansari companion offered to share his wealth and one of his wives, but Abdur-Rahman declined and asked only to be shown the marketplace — where he quickly rebuilt his fortune through honest trade and donated generously.",
  },
  {
    name: "Sa'd ibn Abi Waqqas",
    nameAr: "سعد بن أبي وقاص",
    relation: "One of the ten promised Paradise",
    detail:
      "One of the earliest converts to Islam at the age of 17. He was the first person to shoot an arrow in the path of Allah. The Prophet ﷺ said: 'Shoot, Sa'd! May my father and mother be sacrificed for you!' — a phrase he never used for anyone else. He later conquered Persia.",
  },
  {
    name: "Talha ibn Ubaydullah",
    nameAr: "طلحة بن عبيد الله",
    relation: "The living martyr",
    detail:
      "One of the ten promised Paradise. At the Battle of Uhud, he used his own body as a human shield to protect the Prophet ﷺ, receiving over 70 wounds. The Prophet ﷺ said: 'Whoever wants to see a walking martyr, let him look at Talha.'",
  },
  {
    name: "Zubayr ibn al-Awwam",
    nameAr: "الزبير بن العوام",
    relation: "Disciple of the Prophet ﷺ",
    detail:
      "The Prophet's ﷺ cousin and one of the ten promised Paradise. He was the first to draw a sword for Islam. The Prophet ﷺ called him his 'hawari' (disciple), the same title given to the disciples of Isa (Jesus, peace be upon him).",
  },
  {
    name: "Abu Dharr al-Ghifari",
    nameAr: "أبو ذر الغفاري",
    relation: "The truthful ascetic",
    detail:
      "Known for his extreme honesty and asceticism. The Prophet ﷺ said: 'The earth has not carried nor has the sky covered a man more truthful than Abu Dharr.' He lived simply, spoke truth to power, and is remembered as a model of Islamic integrity.",
  },
  {
    name: "Abdullah ibn Mas'ud",
    nameAr: "عبد الله بن مسعود",
    relation: "Scholar of the Quran",
    detail:
      "One of the earliest converts and among the greatest scholars of the Quran. The Prophet ﷺ said: 'Whoever wants to recite the Quran as fresh as it was revealed, let him recite it in the manner of Ibn Mas'ud.' He was the first person to publicly recite Quran in Mecca.",
  },
];

/* ───────────────────────── prophecies ───────────────────────── */

type Prophecy = {
  title: string;
  description: string;
  hadith: string;
  reference: string;
  status: "fulfilled" | "ongoing";
};

const prophecies: Prophecy[] = [
  {
    title: "Conquest of Persia and Rome",
    description:
      "During the digging of the trench at the Battle of Al-Khandaq, when the Muslims were at their weakest — besieged, starving, and outnumbered — the Prophet ﷺ prophesied the fall of the great empires. Within a decade of his passing, the Muslim armies had conquered the entirety of the Persian Empire and taken the Levant and Egypt from the Romans. The Prophet ﷺ also said that when Kisra (the Persian emperor) perishes, there will be no Kisra after him — and when Caesar perishes, there will be no Caesar after him.",
    hadith:
      "The Prophet ﷺ said: 'When Kisra perishes, there will be no Kisra after him. And when Caesar perishes, there will be no Caesar after him. By the One in whose hand is my soul, you will spend their treasures in the cause of Allah.'",
    reference: "Sahih al-Bukhari 3120; Sahih Muslim 2918",
    status: "fulfilled",
  },
  {
    title: "Barefoot shepherds competing in tall buildings",
    description:
      "The Prophet ﷺ told Jibreel that among the signs of the Hour is that barefoot, naked, destitute shepherds would compete in constructing tall buildings. This has been visibly fulfilled in the Arabian Peninsula, where Bedouin communities transformed within decades into nations competing to build the tallest skyscrapers in the world.",
    hadith:
      "When Jibreel asked: 'Tell me about the Hour.' The Prophet ﷺ said: '...and you will see the barefoot, naked, destitute shepherds competing in constructing tall buildings.'",
    reference: "Sahih Muslim 8; Sahih al-Bukhari 50",
    status: "fulfilled",
  },
  {
    title: "The conquest of Constantinople",
    description:
      "The Prophet ﷺ foretold the Muslim conquest of Constantinople (modern-day Istanbul). This was fulfilled in 1453 CE — over 800 years later — when Sultan Mehmed II (Mehmed the Conqueror) conquered the city, ending the Byzantine Empire. The prophecy is recorded in multiple authentic collections.",
    hadith:
      "The Prophet ﷺ said: 'Constantinople will be conquered with the coming of the Hour.' In another narration: 'You will certainly conquer Constantinople. How excellent will be the commander who conquers it, and how excellent will be his army.'",
    reference: "Sahih Muslim 2897; Jami' at-Tirmidhi 2239; Musnad Ahmad 18189 (grading disputed)",
    status: "fulfilled",
  },
  {
    title: "The Muslim conquest of Jerusalem",
    description:
      "The Prophet ﷺ foretold the conquest of Jerusalem (Bayt al-Maqdis). This was fulfilled during the caliphate of Umar ibn al-Khattab in 637 CE (16 AH), when Umar personally traveled to Jerusalem to accept its surrender and guaranteed the safety of its Christian inhabitants in what became known as the Pact of Umar.",
    hadith:
      "The Prophet ﷺ said to Awf ibn Malik: 'Count six signs before the Hour: my death, then the conquest of Bayt al-Maqdis...'",
    reference: "Sahih al-Bukhari 3176",
    status: "fulfilled",
  },
  {
    title: "Fire emerging from the Hijaz",
    description:
      "The Prophet ﷺ foretold that a great fire would emerge from the land of Hijaz (western Arabia) that would illuminate the necks of camels in Busra (Syria). In 654 AH (1256 CE), a massive volcanic eruption occurred east of Medina that lasted for months. Historical records confirm that the glow of its lava was visible from great distances, and the people of Medina were terrified.",
    hadith:
      "The Prophet ﷺ said: 'The Hour will not come until a fire emerges from the land of Hijaz that will illuminate the necks of camels in Busra.'",
    reference: "Sahih al-Bukhari 7118; Sahih Muslim 2902",
    status: "fulfilled",
  },
  {
    title: "Prevalence of usury (riba)",
    description:
      "The Prophet ﷺ warned that a time would come when interest-based transactions would become so widespread that no one would be able to completely avoid it. Today, the global financial system is built upon interest, and virtually every person is affected by it in some way — through banking, mortgages, loans, and national debt.",
    hadith:
      "The Prophet ﷺ said: 'There will come a time when there will be no one left who does not consume riba (usury/interest), and whoever does not consume it will nevertheless be affected by its residue.'",
    reference: "Sunan an-Nasa'i 4455 (graded sahih); Sunan Abu Dawud 3331",
    status: "fulfilled",
  },
  {
    title: "Widespread tribulations and killing",
    description:
      "The Prophet ﷺ foretold that as the Hour approaches, killing and tribulations (fitan) would increase dramatically, and that the killer would not know why he killed, nor the killed why he was killed.",
    hadith:
      "The Prophet ﷺ said: 'By the One in whose hand is my soul, this world will not end until a time comes when the killer does not know why he killed, and the killed does not know why he was killed.' They asked: 'How will that be?' He said: 'Haraj (killing/chaos). The killer and the killed will both be in the Hellfire.'",
    reference: "Sahih Muslim 2908",
    status: "ongoing",
  },
  {
    title: "Time will pass quickly",
    description:
      "The Prophet ﷺ foretold that as the Hour draws near, time would feel as though it passes faster and faster. Many people today remark on how quickly years, months, and days seem to go by compared to previous generations.",
    hadith:
      "The Prophet ﷺ said: 'The Hour will not come until time contracts — a year will be like a month, a month like a week, a week like a day, a day like an hour, and an hour like the burning of a palm-leaf frond.'",
    reference: "Sunan at-Tirmidhi 2332 (graded sahih by al-Albani); Musnad Ahmad",
    status: "ongoing",
  },
  {
    title: "Wealth will increase until people are dissatisfied",
    description:
      "The Prophet ﷺ foretold that wealth would increase so dramatically that a person would be given a hundred dinars and still be dissatisfied. He also prophesied that the impoverished Bedouins of Arabia — who were barefoot and destitute — would compete in constructing tall buildings. Both have been visibly fulfilled in the modern era.",
    hadith:
      "The Prophet ﷺ said, counting six signs before the Hour: '...then wealth will increase so much that a man will be given one hundred dinars and still be dissatisfied...'",
    reference: "Sahih al-Bukhari 3176",
    status: "fulfilled",
  },
  {
    title: "The Mongol siege and destruction of Baghdad",
    description:
      "The Prophet ﷺ warned that Muslims would fight a people 'whose faces are like hammered shields' with small eyes and flat noses, who wear shoes made of hair. In 1258 CE, the Mongol army under Hulagu Khan — matching this description exactly — sacked Baghdad, the capital of the Abbasid Caliphate. An estimated 200,000 to over a million people were killed, the House of Wisdom was destroyed, and the Tigris ran black with ink. This ended the Islamic Golden Age.",
    hadith:
      "The Prophet ﷺ said: 'The Hour will not come until you fight a people whose shoes are made of hair, and the Hour will not come until you fight a people with small eyes and flat noses.'",
    reference: "Sahih al-Bukhari 2928; Sahih Muslim 2912",
    status: "fulfilled",
  },
  {
    title: "Muslims will be numerous but weak",
    description:
      "The Prophet ﷺ foretold a time when the Muslims would be vast in number but weak and insignificant — like the foam on the surface of a flood. The nations of the world would conspire against them and divide their lands among themselves.",
    hadith:
      "The Prophet ﷺ said: 'The nations will soon summon one another to attack you, as people invite others to share a dish of food.' Someone asked: 'Will that be because of our small numbers at that time?' He said: 'No, you will be numerous at that time, but you will be like the foam on a flood. Allah will remove the fear of you from the hearts of your enemies and cast wahn into your hearts.' Someone asked: 'What is wahn?' He said: 'Love of the world and hatred of death.'",
    reference: "Sunan Abu Dawud 4297",
    status: "ongoing",
  },
];

/* ───────────────────────── his worship ───────────────────────── */

type WorshipAspect = {
  title: string;
  description: string;
  hadith: string;
  reference: string;
};

const worshipAspects: WorshipAspect[] = [
  {
    title: "Night Prayer (Tahajjud)",
    description:
      "He would stand in prayer for so long during the night that his feet would swell. When Aisha asked why he exerted himself so much when Allah had already forgiven all his sins — past and future — he replied with a profound statement about gratitude.",
    hadith:
      "Al-Mughira ibn Shu'ba said: 'The Prophet ﷺ used to pray at night until his feet would swell.' It was said to him: 'Why do you do this when Allah has forgiven your past and future sins?' He said: 'Should I not be a grateful servant?'",
    reference: "Sahih al-Bukhari 1130; Sahih Muslim 2819",
  },
  {
    title: "Weeping in Prayer",
    description:
      "His prayer was not merely physical movements — it was an intimate conversation with his Lord. He would weep during recitation, and Abdullah ibn al-Shikhkhir reported that his chest would produce a sound like a boiling pot from the intensity of his crying (Abu Dawud 904). He would ask his companions to recite Quran to him so he could listen and weep.",
    hadith:
      "Abdullah ibn Mas'ud said: 'The Prophet ﷺ said to me: Recite the Quran to me. I said: Shall I recite it to you when it was revealed to you? He said: I like to hear it from someone other than me. So I recited Surah an-Nisa until I reached the verse: How will it be when We bring a witness from every nation, and We bring you as a witness over these people? He said: That is enough. I looked at him, and his eyes were flowing with tears.'",
    reference: "Sahih al-Bukhari 5055; Sahih Muslim 800",
  },
  {
    title: "Fasting",
    description:
      "He fasted regularly beyond the obligatory fasts of Ramadan. He fasted Mondays and Thursdays, saying it was the day he was born and the day revelation came to him. He fasted the 13th, 14th, and 15th of each lunar month (the 'white days'). He fasted most of the month of Sha'ban. He also observed the fast of Dawud — fasting every other day — which he called the most beloved fast to Allah.",
    hadith:
      "When asked about fasting on Mondays, the Prophet ﷺ said: 'That is the day on which I was born and the day on which I was sent (as a Prophet) or revelation was sent down to me.' He also said: 'The most beloved fasting to Allah is the fasting of Dawud — he used to fast one day and break his fast the next.'",
    reference: "Sahih Muslim 1162; Sahih al-Bukhari 1975",
  },
  {
    title: "His Lengthy Prostration (Sujud)",
    description:
      "His prostrations were long and filled with supplication. He taught that a servant is closest to Allah during sujud, and he would make extensive du'a while prostrating. His grandchildren Hasan and Husayn would sometimes climb on his back during prostration, and he would prolong it until they got down on their own, not wanting to disturb them (Sunan an-Nasa'i 1141).",
    hadith:
      "The Prophet ﷺ said: 'The closest a servant is to his Lord is when he is in prostration, so increase your supplications in it.' And he ﷺ said: 'As for the prostration, strive in making du'a in it, for it is most likely that you will be answered.'",
    reference: "Sahih Muslim 482; Sunan an-Nasa'i 1137",
  },
  {
    title: "Devotion in Ramadan",
    description:
      "His worship intensified greatly during Ramadan. He would spend the last ten nights of Ramadan in i'tikaf (spiritual retreat) in the mosque, seeking Laylat al-Qadr (the Night of Decree). He would tighten his belt (i.e., exert himself fully), pray through the nights, and wake his family for worship. Jibreel would review the entire Quran with him every Ramadan, and in his final year, they reviewed it twice.",
    hadith:
      "Aisha said: 'When the last ten nights of Ramadan began, the Prophet ﷺ would tighten his waist belt (i.e., strive harder), pray throughout the night, and wake his family.' And: 'Jibreel used to meet him every night in Ramadan and review the Quran with him.'",
    reference: "Sahih al-Bukhari 2024; Sahih al-Bukhari 6",
  },
  {
    title: "Remembrance of Allah at All Times",
    description:
      "He remembered Allah in every situation — standing, sitting, and lying down. Aisha said he would remember Allah at all times without exception. He had specific dhikr for every daily activity: waking, sleeping, eating, drinking, entering and leaving the home, entering the bathroom, traveling, seeing rain, hearing thunder, and more. No moment of his life was devoid of connection with Allah.",
    hadith:
      "Aisha said: 'The Messenger of Allah ﷺ used to remember Allah at all times.' And he ﷺ said: 'Shall I not tell you of the best of your deeds, the purest in the sight of your Lord, which raises your ranks the most, and is better for you than spending gold and silver, and better than meeting your enemy and striking their necks? They said: Yes. He said: The remembrance of Allah.'",
    reference: "Sahih Muslim 373; Sunan at-Tirmidhi 3377",
  },
  {
    title: "Charity and Giving",
    description:
      "He never kept wealth for himself. When money came to him, he would distribute it before the day was over. He never turned away anyone who asked, even if he had nothing — he would borrow to give. He would give preference to others over himself and his family, sometimes tying a stone to his stomach from hunger while ensuring others were fed.",
    hadith:
      "Anas said: 'The Messenger of Allah ﷺ was never asked for anything for the sake of Islam except that he gave it. A man came to him and he gave him a flock of sheep filling the valley between two mountains. The man went back to his people and said: O my people, accept Islam! For Muhammad gives like a man who does not fear poverty.'",
    reference: "Sahih Muslim 2312",
  },
  {
    title: "Recitation of the Quran",
    description:
      "He recited the Quran with a beautiful, measured voice, pausing at each verse, stretching the long vowels, and giving each letter its right. He forbade rushing through the Quran and commanded beautifying it with one's voice. He would recite it during prayer, while traveling, and in his daily life. He said that the one who recites the Quran fluently will be with the noble angels, and the one who recites it with difficulty, stammering, will have a double reward.",
    hadith:
      "The Prophet ﷺ said: 'Beautify the Quran with your voices.' And he ﷺ said: 'The one who is proficient in the Quran will be with the noble, dutiful scribes (angels), and the one who recites it and finds it difficult, stammering, will have a double reward.'",
    reference: "Sunan Abu Dawud 1468; Sahih al-Bukhari 4937; Sahih Muslim 798",
  },
];

/* ───────────────────────── daily sunnah ───────────────────────── */

type SunnahPractice = {
  category: string;
  practices: {
    practice: string;
    hadith: string;
    reference: string;
  }[];
};

const dailySunnah: SunnahPractice[] = [
  {
    category: "Waking Up",
    practices: [
      {
        practice: "Say the du'a upon waking",
        hadith:
          "When the Prophet ﷺ woke up, he would say: 'Al-hamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur' (All praise is for Allah who gave us life after death, and to Him is the return).",
        reference: "Sahih al-Bukhari 6312",
      },
      {
        practice: "Use the miswak upon waking",
        hadith:
          "Hudhayfah said: 'When the Prophet ﷺ got up during the night (for tahajjud), he would clean his mouth with the miswak.' He ﷺ also said: 'Were it not that I would make it difficult for my ummah, I would have commanded them to use the miswak before every prayer.'",
        reference: "Sahih al-Bukhari 245; Sahih al-Bukhari 887",
      },
      {
        practice: "Wash the hands three times before using water",
        hadith:
          "The Prophet ﷺ said: 'When one of you wakes up from sleep, let him not dip his hand into the vessel until he washes it three times, for he does not know where his hand spent the night.'",
        reference: "Sahih al-Bukhari 162; Sahih Muslim 278",
      },
    ],
  },
  {
    category: "Eating & Drinking",
    practices: [
      {
        practice: "Say Bismillah before eating",
        hadith:
          "The Prophet ﷺ said: 'When one of you eats, let him mention the name of Allah. If he forgets to mention it at the beginning, let him say: Bismillahi fi awwalihi wa akhirih (In the name of Allah at its beginning and end).'",
        reference: "Sunan Abu Dawud 3767; Sunan at-Tirmidhi 1858",
      },
      {
        practice: "Eat with the right hand and from what is nearest",
        hadith:
          "The Prophet ﷺ said to the young Umar ibn Abi Salamah: 'O young boy, mention the name of Allah, eat with your right hand, and eat from what is nearest to you.'",
        reference: "Sahih al-Bukhari 5376; Sahih Muslim 2022",
      },
      {
        practice: "Drink water in three sips",
        hadith:
          "Anas reported that the Prophet ﷺ used to breathe three times while drinking (i.e., drink in three sips, pausing to breathe outside the vessel), and he said: 'It is more satisfying, more wholesome, and more quenching.'",
        reference: "Sahih Muslim 2028",
      },
      {
        practice: "Never criticize food",
        hadith:
          "Abu Hurayrah said: 'The Messenger of Allah ﷺ never criticized any food. If he liked it, he would eat it; and if he disliked it, he would leave it.'",
        reference: "Sahih al-Bukhari 5409; Sahih Muslim 2064",
      },
      {
        practice: "Say Alhamdulillah after eating",
        hadith:
          "The Prophet ﷺ said: 'Allah is pleased with a servant who eats something and praises Him for it, or drinks something and praises Him for it.'",
        reference: "Sahih Muslim 2734",
      },
      {
        practice: "Lick the fingers and do not waste food",
        hadith:
          "The Prophet ﷺ said: 'When one of you eats, let him not wipe his hand until he has licked it or had it licked.' And he ﷺ said: 'If a morsel of food falls from one of you, let him pick it up, remove any dirt, and eat it — do not leave it for the shaytan.'",
        reference: "Sahih Muslim 2031; Sahih Muslim 2033",
      },
    ],
  },
  {
    category: "Entering & Leaving Home",
    practices: [
      {
        practice: "Say Bismillah and du'a when leaving home",
        hadith:
          "The Prophet ﷺ said: 'When a man leaves his house and says: Bismillah, tawakkaltu ala Allah, la hawla wa la quwwata illa billah (In the name of Allah, I place my trust in Allah, there is no might and no power except with Allah), it is said to him: You are guided, defended, and protected, and the devil turns away from him.'",
        reference: "Sunan Abu Dawud 5095; Sunan at-Tirmidhi 3426",
      },
      {
        practice: "Say Bismillah when entering the home",
        hadith:
          "The Prophet ﷺ said: 'When a man enters his house and mentions the name of Allah upon entering and upon eating, the shaytan says (to his companions): There is no place for you to spend the night and no dinner. But if he enters without mentioning the name of Allah, the shaytan says: You have found a place to spend the night.'",
        reference: "Sahih Muslim 2018",
      },
      {
        practice: "Give salam when entering the home",
        hadith:
          "Anas said: 'The Messenger of Allah ﷺ said to me: O my son, when you enter upon your family, give salam — it will be a blessing for you and for the people of your household.'",
        reference: "Sunan at-Tirmidhi 2698",
      },
    ],
  },
  {
    category: "Sleep",
    practices: [
      {
        practice: "Perform wudu and sleep on the right side",
        hadith:
          "The Prophet ﷺ said: 'When you go to your bed, perform wudu as you would for prayer, then lie down on your right side and say the du'a: O Allah, I surrender myself to You, I entrust my affairs to You, I turn my face to You... I believe in Your Book that You have revealed and Your Prophet ﷺ whom You have sent.'",
        reference: "Sahih al-Bukhari 247; Sahih Muslim 2710",
      },
      {
        practice: "Recite Ayat al-Kursi before sleeping",
        hadith:
          "The Prophet ﷺ said: 'When you go to bed, recite Ayat al-Kursi. Then there will remain over you a protector from Allah, and no devil will approach you until morning.'",
        reference: "Sahih al-Bukhari 5010",
      },
      {
        practice: "Blow into the hands and recite the Mu'awwidhat",
        hadith:
          "Aisha reported: 'Every night when the Prophet ﷺ went to bed, he would cup his hands together, blow into them, and recite Surah al-Ikhlas, Surah al-Falaq, and Surah an-Nas. Then he would wipe his hands over whatever he could of his body, starting with his head and face and the front of his body. He would do this three times.'",
        reference: "Sahih al-Bukhari 5017",
      },
      {
        practice: "Recite the last two verses of Surah Al-Baqarah",
        hadith:
          "The Prophet ﷺ said: 'Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him.'",
        reference: "Sahih al-Bukhari 5009; Sahih Muslim 807",
      },
      {
        practice: "Dust the bed before lying down",
        hadith:
          "The Prophet ﷺ said: 'When one of you goes to his bed, let him dust it off with the inside of his lower garment, for he does not know what came onto it after him. Then let him say: Bismika Rabbi wada'tu janbi, wa bika arfa'uhu (In Your name, my Lord, I lay down my side, and in Your name I raise it up).'",
        reference: "Sahih al-Bukhari 6320; Sahih Muslim 2714",
      },
    ],
  },
  {
    category: "Daily Remembrance (Dhikr)",
    practices: [
      {
        practice: "Say SubhanAllah wa bihamdihi 100 times",
        hadith:
          "The Prophet ﷺ said: 'Whoever says SubhanAllahi wa bihamdihi (Glory and praise be to Allah) one hundred times a day, his sins will be forgiven even if they are like the foam of the sea.'",
        reference: "Sahih al-Bukhari 6405; Sahih Muslim 2691",
      },
      {
        practice: "Dhikr after each prayer",
        hadith:
          "The Prophet ﷺ said: 'Whoever glorifies Allah (SubhanAllah) after every prayer thirty-three times, praises Allah (Alhamdulillah) thirty-three times, and declares His greatness (Allahu Akbar) thirty-three times — that is ninety-nine — and then says to complete one hundred: La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa ala kulli shay'in qadir — his sins will be forgiven even if they are like the foam of the sea.'",
        reference: "Sahih Muslim 597",
      },
      {
        practice: "Send salawat upon the Prophet ﷺ",
        hadith:
          "The Prophet ﷺ said: 'Whoever sends salah (blessings) upon me once, Allah will send salah upon him ten times.'",
        reference: "Sahih Muslim 408",
      },
      {
        practice: "Say La ilaha illallah frequently",
        hadith:
          "The Prophet ﷺ said: 'The best dhikr is La ilaha illallah (There is no god but Allah), and the best du'a is Alhamdulillah (All praise is for Allah).'",
        reference: "Sunan at-Tirmidhi 3383; Sunan Ibn Majah 3800",
      },
      {
        practice: "Seek forgiveness (istighfar) regularly",
        hadith:
          "The Prophet ﷺ said: 'By Allah, I seek forgiveness from Allah and turn to Him in repentance more than seventy times a day.'",
        reference: "Sahih al-Bukhari 6307",
      },
    ],
  },
  {
    category: "Interactions with People",
    practices: [
      {
        practice: "Greet others with salam",
        hadith:
          "The Prophet ﷺ said: 'You will not enter Paradise until you believe, and you will not believe until you love one another. Shall I not tell you of something which, if you do it, you will love one another? Spread salam among yourselves.'",
        reference: "Sahih Muslim 54",
      },
      {
        practice: "Smile — it is charity",
        hadith:
          "The Prophet ﷺ said: 'Your smiling in the face of your brother is an act of charity. Commanding good and forbidding evil is charity. Guiding a lost person is charity. Removing a stone, thorn, or bone from the road is charity. Pouring from your bucket into your brother's bucket is charity.'",
        reference: "Sunan at-Tirmidhi 1956",
      },
      {
        practice: "Visit the sick",
        hadith:
          "The Prophet ﷺ said: 'The rights of a Muslim over another Muslim are five: returning the salam, visiting the sick, following the funeral, accepting the invitation, and saying yarhamukallah (may Allah have mercy on you) to one who sneezes.'",
        reference: "Sahih al-Bukhari 1240; Sahih Muslim 2162",
      },
      {
        practice: "Be good to neighbors",
        hadith:
          "The Prophet ﷺ said: 'Jibreel kept advising me to be good to my neighbor until I thought he would give him a share of my inheritance.'",
        reference: "Sahih al-Bukhari 6014; Sahih Muslim 2625",
      },
      {
        practice: "Be gentle and avoid harshness",
        hadith:
          "The Prophet ﷺ said: 'Allah is gentle and loves gentleness in all matters. He gives for gentleness what He does not give for harshness, and what He does not give for anything else.'",
        reference: "Sahih al-Bukhari 6927; Sahih Muslim 2593",
      },
    ],
  },
  {
    category: "Personal Hygiene",
    practices: [
      {
        practice: "Maintain the five acts of fitrah",
        hadith:
          "The Prophet ﷺ said: 'Five things are from the fitrah (natural disposition): circumcision, shaving the pubic hair, trimming the mustache, cutting the nails, and plucking the armpit hair.'",
        reference: "Sahih al-Bukhari 5889; Sahih Muslim 257",
      },
      {
        practice: "Apply perfume and never refuse it",
        hadith:
          "The Prophet ﷺ said: 'Whoever is offered perfume should not refuse it, for it is light to carry and has a pleasant scent.' He ﷺ loved perfume and never refused it when offered.",
        reference: "Sahih Muslim 2253; Sunan Abu Dawud 4172",
      },
      {
        practice: "Apply kohl before sleeping",
        hadith:
          "The Prophet ﷺ said: 'Use ithmid (antimony kohl), for it clears the sight and makes the eyelashes grow.' He would apply it three times in each eye before sleeping.",
        reference: "Sunan at-Tirmidhi 1757; Sunan Ibn Majah 3497",
      },
      {
        practice: "Take care of the hair and beard",
        hadith:
          "The Prophet ﷺ said: 'Whoever has hair, let him honor it.' He ﷺ would oil and comb his hair regularly, and he commanded the Muslims to grow their beards and trim their mustaches.",
        reference: "Sunan Abu Dawud 4163; Sahih al-Bukhari 5893",
      },
    ],
  },
];

/* ───────────────────────── component ───────────────────────── */

function ProphetMuhammadContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState(searchParams.get("tab") || "timeline");
  const [activeTimeline, setActiveTimeline] = useState(0);
  const [activeVirtue, setActiveVirtue] = useState(0);
  const [activeAppearance, setActiveAppearance] = useState<"face" | "body" | "manner">("face");
  const [familyTab, setFamilyTab] = useState("wives");
  const [sunnahTab, setSunnahTab] = useState(dailySunnah[0].category);
  const [activeProphecy, setActiveProphecy] = useState(0);
  const [activeWorship, setActiveWorship] = useState(0);
  const [search, setSearch] = useState("");

  const searchMatch = (...fields: (string | undefined | null)[]) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, ...fields);
  };

  const filteredTimeline = timeline.filter((e) => searchMatch(e.title, e.detail, e.year));
  const filteredVirtues = virtues.filter((v) => searchMatch(v.name, v.description, v.hadith));
  const filteredProphecies = prophecies.filter((p) => searchMatch(p.title, p.description, p.hadith));

  return (
    <div>
      <PageHeader
        title="Prophet Muhammad ﷺ"
        titleAr="النبي محمد ﷺ"
        subtitle="The final Messenger of Allah ﷺ— his life, character, and legacy"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search life, character, prophecies..." className="mb-6" />

      {/* Opening verse */}
      <ContentCard className="mb-6">
        <div className="text-center py-4">
          <p className="text-2xl font-arabic text-gold leading-loose mb-3">
            وَمَآ أَرْسَلْنَـٰكَ إِلَّا رَحْمَةًۭ لِّلْعَـٰلَمِينَ
          </p>
          <p className="text-themed-muted italic">
            &ldquo;And We have not sent you, [O Muhammad], except as a mercy to the worlds.&rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-1">Quran 21:107</p>
        </div>
      </ContentCard>

      {/* Section navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                isActive
                  ? "border-gold/40 bg-gold/20 text-gold"
                  : "sidebar-border text-themed-muted hover:text-gold hover:border-gold/30"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── TIMELINE ─── */}
        {activeSection === "timeline" && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-4 items-start">
              {/* Left side — vertical timeline pills */}
              <div className="flex flex-col gap-2 shrink-0 max-h-[70vh] overflow-y-auto pr-1">
                {filteredTimeline.map((event, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTimeline(i)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTimeline === i
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    <span className="font-bold">{event.year}</span>
                    <span className="text-xs opacity-70"> — {event.title.split(" — ")[0]}</span>
                  </button>
                ))}
              </div>

              {/* Right side — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {filteredTimeline.map(
                    (event, i) =>
                      activeTimeline === i && (
                        <motion.div
                          key={i}
                          id={`section-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-4"
                        >
                          <ContentCard>
                            <h2 className="text-lg font-semibold text-themed mb-1">{event.title}</h2>
                            <p className="text-xs text-gold mb-4">{event.year}{event.hijri ? ` / ${event.hijri}` : ""}</p>
                            <p className="text-themed-muted text-sm leading-relaxed">{event.detail}</p>
                            {event.reference && (
                              <p className="text-xs text-gold/70 flex items-center gap-1 mt-4">
                                <BookOpen size={12} />
                                {event.reference}
                              </p>
                            )}
                          </ContentCard>
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── CHARACTER & VIRTUES ─── */}
        {activeSection === "character" && (
          <motion.div
            key="character"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <ContentCard>
              <p className="text-themed-muted text-sm">
                Allah described him: <span className="text-gold font-arabic">&ldquo;وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ&rdquo;</span>{" "}
                — &ldquo;And indeed, you are of a great moral character.&rdquo; <span className="text-xs">(Quran 68:4)</span>
              </p>
            </ContentCard>

            <div className="flex gap-4 items-start">
              {/* Left side — virtue pills */}
              <div className="flex flex-col gap-2 shrink-0 max-h-[70vh] overflow-y-auto pr-1">
                {filteredVirtues.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveVirtue(i)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
                      activeVirtue === i
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    <span className="font-bold">{v.name}</span>
                    <span className="text-xs opacity-70"> — {v.nameAr}</span>
                  </button>
                ))}
              </div>

              {/* Right side — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {filteredVirtues[activeVirtue] && (
                  <motion.div
                    key={activeVirtue}
                    id={`section-${filteredVirtues[activeVirtue].name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ContentCard>
                      <div className="flex items-baseline gap-3 mb-3">
                        <h3 className="font-semibold text-themed text-lg">{filteredVirtues[activeVirtue].name}</h3>
                        <span className="font-arabic text-gold">{filteredVirtues[activeVirtue].nameAr}</span>
                      </div>
                      <p className="text-themed-muted text-sm leading-relaxed mb-4">{filteredVirtues[activeVirtue].description}</p>
                      <div className="border-l-2 border-gold/30 pl-4">
                        <p className="text-themed text-sm italic leading-relaxed">{filteredVirtues[activeVirtue].hadith}</p>
                        <p className="text-xs text-gold/70 mt-2 flex items-center gap-1">
                          <BookOpen size={12} />
                          {filteredVirtues[activeVirtue].reference}
                        </p>
                      </div>
                    </ContentCard>
                  </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── PHYSICAL DESCRIPTION ─── */}
        {activeSection === "appearance" && (
          <motion.div
            key="appearance"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <ContentCard>
              <p className="text-themed-muted text-sm mb-4">
                Based on descriptions from the <span className="text-gold">Shama&apos;il al-Muhammadiyyah</span> of Imam at-Tirmidhi and the authentic hadith collections — the companions&apos; eyewitness accounts of the most beautiful of creation.
              </p>
              <div>
                <h3 className="text-sm font-semibold text-themed mb-2">His Names &amp; Titles</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Muhammad", nameAr: "محمد", meaning: "The Praised One" },
                    { name: "Ahmad", nameAr: "أحمد", meaning: "The Most Praiseworthy" },
                    { name: "Al-Amin", nameAr: "الأمين", meaning: "The Trustworthy" },
                    { name: "As-Sadiq", nameAr: "الصادق", meaning: "The Truthful" },
                    { name: "Al-Mustafa", nameAr: "المصطفى", meaning: "The Chosen One" },
                    { name: "Ar-Rasul", nameAr: "الرسول", meaning: "The Messenger" },
                    { name: "An-Nabi", nameAr: "النبي", meaning: "The Prophet" },
                    { name: "Al-Mahi", nameAr: "الماحي", meaning: "The Effacer (of disbelief)" },
                    { name: "Al-Hashir", nameAr: "الحاشر", meaning: "The Gatherer (people gathered at his feet)" },
                    { name: "Al-Aqib", nameAr: "العاقب", meaning: "The Last (no prophet after him)" },
                  ].map((n) => (
                    <span
                      key={n.name}
                      className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-xs"
                      title={n.meaning}
                    >
                      <span className="text-gold font-medium">{n.name}</span>
                      <span className="text-themed-muted ml-1.5 font-arabic">{n.nameAr}</span>
                      <span className="text-themed-muted/60 ml-1.5">— {n.meaning}</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gold/70 flex items-center gap-1 mt-3">
                  <BookOpen size={12} />
                  Sahih al-Bukhari 3532; Sahih Muslim 2354 (Muhammad, Ahmad, Al-Mahi, Al-Hashir, Al-Aqib); Quran 61:6, 33:40, 3:144 (Ahmad, An-Nabi, Ar-Rasul); Seerah (Al-Amin, As-Sadiq, Al-Mustafa)
                </p>
              </div>
            </ContentCard>

            <div className="flex gap-4 items-start">
              {/* Left side — category pills */}
              <div className="flex flex-col gap-2 shrink-0">
                {([
                  { id: "face" as const, label: "Face & Features" },
                  { id: "body" as const, label: "Body & Build" },
                  { id: "manner" as const, label: "Manner & Presence" },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAppearance(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
                      activeAppearance === tab.id
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Right side — traits */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeAppearance}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {physicalDescription
                      .filter((item) => item.group === activeAppearance)
                      .map((item, i) => (
                        <ContentCard key={i} delay={Math.min(i * 0.05, 0.25)} id={`section-${item.trait.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                          <h3 className="font-semibold text-gold mb-2">{item.trait}</h3>
                          <p className="text-themed-muted text-sm leading-relaxed mb-2">{item.description}</p>
                          <p className="text-xs text-gold/70 flex items-center gap-1">
                            <BookOpen size={12} />
                            {item.reference}
                          </p>
                        </ContentCard>
                      ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── FAMILY & COMPANIONS ─── */}
        {activeSection === "family" && (
          <motion.div
            key="family"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex flex-col gap-2 shrink-0">
                {[
                  { id: "wives", label: "Wives" },
                  { id: "children", label: "Children" },
                  { id: "companions", label: "Companions" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFamilyTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
                      familyTab === tab.id
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Right side — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {/* Wives */}
                  {familyTab === "wives" && (
                    <motion.div
                      key="wives"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      <ContentCard>
                        <p className="text-themed-muted text-sm">
                          The Mothers of the Believers <span className="font-arabic text-gold">(أمهات المؤمنين)</span> — each marriage served a purpose: strengthening alliances, caring for widows, or fulfilling divine command.
                        </p>
                      </ContentCard>
                      {wives.map((w, i) => (
                        <ContentCard key={i} delay={Math.min(i * 0.03, 0.2)} id={`section-${w.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                          <div className="flex items-baseline gap-3 mb-1">
                            <h3 className="font-semibold text-themed">{w.name}</h3>
                            <span className="font-arabic text-gold text-sm">{w.nameAr}</span>
                          </div>
                          <p className="text-xs text-gold/70 mb-2">{w.relation}</p>
                          <p className="text-themed-muted text-sm leading-relaxed">{w.detail}</p>
                        </ContentCard>
                      ))}
                    </motion.div>
                  )}

                  {/* Children */}
                  {familyTab === "children" && (
                    <motion.div
                      key="children"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      <ContentCard>
                        <p className="text-themed-muted text-sm">
                          Seven children — four daughters and three sons. All his sons passed away in infancy. His lineage continued through his daughter Fatimah.
                        </p>
                      </ContentCard>
                      {children.map((c, i) => (
                        <ContentCard key={i} delay={Math.min(i * 0.03, 0.2)} id={`section-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                          <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="font-semibold text-themed">{c.name}</h3>
                            <span className="font-arabic text-gold text-sm">{c.nameAr}</span>
                          </div>
                          <p className="text-xs text-gold/70 mb-2">{c.relation}</p>
                          <p className="text-themed-muted text-sm leading-relaxed">{c.detail}</p>
                        </ContentCard>
                      ))}
                    </motion.div>
                  )}

                  {/* Companions */}
                  {familyTab === "companions" && (
                    <motion.div
                      key="companions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      <ContentCard>
                        <p className="text-themed-muted text-sm">
                          The companions <span className="font-arabic text-gold">(الصحابة)</span> — those who believed in him, supported him, and sacrificed everything for the sake of Allah.
                        </p>
                      </ContentCard>
                      {companions.map((c, i) => (
                        <ContentCard key={i} delay={Math.min(i * 0.05, 0.3)} id={`section-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                          <div className="flex items-baseline gap-3 mb-1">
                            <h3 className="font-semibold text-themed">{c.name}</h3>
                            <span className="font-arabic text-gold text-sm">{c.nameAr}</span>
                          </div>
                          <p className="text-xs text-gold/70 mb-2">{c.relation}</p>
                          <p className="text-themed-muted text-sm leading-relaxed">{c.detail}</p>
                        </ContentCard>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── PROPHECIES ─── */}
        {activeSection === "prophecies" && (
          <motion.div
            key="prophecies"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-4 items-start">
              {/* Left side — prophecy pills */}
              <div className="flex flex-col gap-2 shrink-0 max-h-[70vh] overflow-y-auto pr-1">
                {filteredProphecies.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveProphecy(i)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeProphecy === i
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    <span className="font-bold">{p.title}</span>
                    <span className={`block text-xs mt-0.5 ${p.status === "fulfilled" ? "text-green-400" : "text-blue-400"}`}>
                      {p.status === "fulfilled" ? "Fulfilled" : "Ongoing"}
                    </span>
                  </button>
                ))}
              </div>

              {/* Right side — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {filteredProphecies[activeProphecy] && (
                  <motion.div
                    key={activeProphecy}
                    id={`section-${filteredProphecies[activeProphecy].title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ContentCard>
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-themed text-lg">{filteredProphecies[activeProphecy].title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          filteredProphecies[activeProphecy].status === "fulfilled"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}>
                          {filteredProphecies[activeProphecy].status === "fulfilled" ? "Fulfilled" : "Ongoing"}
                        </span>
                      </div>
                      <p className="text-themed-muted text-sm leading-relaxed mb-4">{filteredProphecies[activeProphecy].description}</p>
                      <div className="border-l-2 border-gold/30 pl-4">
                        <p className="text-themed text-sm italic leading-relaxed">{filteredProphecies[activeProphecy].hadith}</p>
                        <p className="text-xs text-gold/70 mt-2 flex items-center gap-1">
                          <BookOpen size={12} />
                          {filteredProphecies[activeProphecy].reference}
                        </p>
                      </div>
                    </ContentCard>
                  </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── HIS WORSHIP ─── */}
        {activeSection === "worship" && (
          <motion.div
            key="worship"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-4 items-start">
              {/* Left side — worship pills */}
              <div className="flex flex-col gap-2 shrink-0 max-h-[70vh] overflow-y-auto pr-1">
                {worshipAspects.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveWorship(i)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
                      activeWorship === i
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    {w.title}
                  </button>
                ))}
              </div>

              {/* Right side — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeWorship}
                    id={`section-${worshipAspects[activeWorship].title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ContentCard>
                      <h3 className="font-semibold text-themed text-lg mb-3">{worshipAspects[activeWorship].title}</h3>
                      <p className="text-themed-muted text-sm leading-relaxed mb-4">{worshipAspects[activeWorship].description}</p>
                      <div className="border-l-2 border-gold/30 pl-4">
                        <p className="text-themed text-sm italic leading-relaxed">{worshipAspects[activeWorship].hadith}</p>
                        <p className="text-xs text-gold/70 mt-2 flex items-center gap-1">
                          <BookOpen size={12} />
                          {worshipAspects[activeWorship].reference}
                        </p>
                      </div>
                    </ContentCard>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── DAILY SUNNAH ─── */}
        {activeSection === "daily-sunnah" && (
          <motion.div
            key="daily-sunnah"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex flex-col gap-2 shrink-0">
                {dailySunnah.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => setSunnahTab(cat.category)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
                      sunnahTab === cat.category
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "text-themed-muted hover:text-themed border sidebar-border"
                    }`}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>

              {/* Right side — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {dailySunnah
                    .filter((cat) => cat.category === sunnahTab)
                    .map((category) => (
                      <motion.div
                        key={category.category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-3"
                      >
                        {category.practices.map((p, pi) => (
                          <ContentCard key={pi} delay={Math.min(pi * 0.05, 0.2)} id={`section-${p.practice.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>
                            <h3 className="font-semibold text-themed mb-2">{p.practice}</h3>
                            <p className="text-themed-muted text-sm leading-relaxed mb-3 italic">{p.hadith}</p>
                            <p className="text-xs text-gold/70 flex items-center gap-1">
                              <BookOpen size={12} />
                              {p.reference}
                            </p>
                          </ContentCard>
                        ))}
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProphetMuhammadPage() {
  return <Suspense><ProphetMuhammadContent /></Suspense>;
}
