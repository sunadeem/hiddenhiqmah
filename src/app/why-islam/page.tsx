"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import PageSearch from "@/components/PageSearch";
import ContentCard from "@/components/ContentCard";
import { textMatch } from "@/lib/search";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { BookOpen } from "lucide-react";

/* ───────────────────────── types ───────────────────────── */

type Topic = {
  id: string;
  name: string;
  content: {
    intro: string;
    points: { title: string; detail: string; note?: string }[];
    verse?: { arabic: string; text: string; ref: string };
    source?: string;
  };
};

/* ───────────────────────── Tab 1: Proofs ───────────────────────── */

const proofTopics: Topic[] = [
  {
    id: "preservation",
    name: "Scripture Preservation",
    content: {
      intro:
        "The Quran is the only religious scripture that has been preserved letter-for-letter, word-for-word since its revelation over 1,400 years ago. This preservation is unmatched by any other text in human history — religious or secular.",
      verse: {
        arabic: "إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَـٰفِظُونَ",
        text: "Indeed, it is We who sent down the Reminder, and indeed, We will be its guardian.",
        ref: "Quran 15:9",
      },
      points: [
        {
          title: "Oral and written preservation from day one",
          detail:
            "The Quran was memorized by hundreds of companions during the Prophet's lifetime and written on various materials. Abu Bakr compiled it into a single manuscript, and Uthman standardized copies sent across the Muslim world. Today, over 10 million people have memorized the entire Quran — a living chain of preservation unbroken for 14 centuries.",
          note: "Sahih al-Bukhari 4986-4987",
        },
        {
          title: "Manuscript evidence confirms zero corruption",
          detail:
            "The Birmingham Quran manuscript (dated 568-645 CE by radiocarbon analysis) and the Sana'a manuscripts match today's Quran identically. No other scripture can claim this. The Dead Sea Scrolls (dating to 150 BCE) revealed significant differences from the later Masoretic Hebrew Bible text.",
        },
        {
          title: "Compare: The Bible's textual history",
          detail:
            "There are over 5,800 Greek manuscripts of the New Testament, and scholars have identified more than 400,000 textual variants between them — more variants than there are words in the New Testament. The earliest complete New Testament manuscript (Codex Sinaiticus) dates to the 4th century, over 300 years after Jesus. No original autographs exist for any Biblical book.",
          note: "Bart Ehrman, Misquoting Jesus; Bruce Metzger, The Text of the New Testament",
        },
        {
          title: "Compare: The Torah's composition",
          detail:
            "Modern Biblical scholarship (the Documentary Hypothesis) identifies at least four separate authors/editors of the Torah (J, E, P, D sources), composed over several centuries and compiled after the Babylonian exile. The Torah itself records the death of Moses — something Moses could not have written. This is not a preserved original revelation but an edited compilation.",
        },
        {
          title: "Compare: Hindu and Buddhist scriptures",
          detail:
            "The Vedas were transmitted orally for over a millennium before being written down, with multiple recensions. The Pali Canon (Buddhist scriptures) was not written down until approximately 450 years after the Buddha, at the Fourth Council in Sri Lanka (29 BCE). Neither tradition can demonstrate an unbroken chain of preservation to its founder.",
        },
      ],
      source: "Quran 15:9; Sahih al-Bukhari 4986-4987",
    },
  },
  {
    id: "monotheism",
    name: "Pure Monotheism",
    content: {
      intro:
        "Islam presents the purest and most logically consistent concept of God: Tawhid — absolute oneness of God with no partners, no incarnation, no division, and no intermediaries. This was the message of every prophet from Adam to Muhammad (peace be upon them all).",
      verse: {
        arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ",
        text: "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.",
        ref: "Quran 112:1-4",
      },
      points: [
        {
          title: "One God — the simplest and most logical explanation",
          detail:
            "Occam's Razor favors the simplest sufficient explanation. One all-powerful Creator requires no further explanation — unlike polytheism (who created the gods?), the Trinity (how is three also one?), or pantheism (how can the universe be both created and creator?). Islam's concept of God is internally consistent with no paradoxes.",
        },
        {
          title: "Every prophet taught monotheism",
          detail:
            "The Quran states that every nation received a messenger with the same core message: worship God alone. Abraham, Moses, Jesus, and Muhammad all preached the same theology. The concept of God being 'three in one' or God taking human form was introduced by later followers, not by the prophets themselves.",
          note: "Quran 21:25 — 'We sent no messenger before you except that We revealed to him: There is no deity except Me, so worship Me.'",
        },
        {
          title: "The Trinity is a later development",
          detail:
            "Jesus never explicitly taught the Trinity in the Gospels. The word 'Trinity' does not appear in the Bible. The doctrine was formalized at the Council of Nicaea (325 CE) — three centuries after Jesus — where bishops voted on whether Jesus was divine. Early Christians like the Ebionites and Arians rejected the Trinity. The Quran corrects this: Jesus was a mighty prophet, not God incarnate.",
          note: "Quran 4:171 — 'Do not say Three. Desist — it is better for you. Indeed, Allah is but one God.'",
        },
        {
          title: "Idol worship contradicts reason",
          detail:
            "Hinduism contains an estimated 33 million deities. Worshipping created objects (statues, animals, celestial bodies) that cannot hear, see, or respond contradicts basic reason. Abraham's argument against idolatry — recorded in the Quran — remains unanswered: how can you worship what you carve with your own hands?",
          note: "Quran 21:52-67 — Abraham's argument against his people's idol worship",
        },
      ],
      source: "Quran 112:1-4; Quran 4:171; Quran 21:25, 52-67",
    },
  },
  {
    id: "prophecies",
    name: "Fulfilled Prophecies",
    content: {
      intro:
        "Prophet Muhammad (peace be upon him) made dozens of specific, verifiable predictions about the future — many of which have been precisely fulfilled. No other religious figure in history has such a documented track record of accurate prophecies recorded in contemporaneous authenticated sources.",
      verse: {
        arabic: "وَمَا يَنطِقُ عَنِ ٱلْهَوَىٰٓ ۝ إِنْ هُوَ إِلَّا وَحْىٌ يُوحَىٰ",
        text: "Nor does he speak from his own desire. It is nothing but revelation that is revealed.",
        ref: "Quran 53:3-4",
      },
      points: [
        {
          title: "Barefoot shepherds competing in tall buildings",
          detail:
            "The Prophet ﷺ said: 'You will see the barefoot, naked, destitute shepherds competing in constructing tall buildings.' In the 7th century, Bedouin Arabs lived in tents. Today, the UAE (historically Bedouin territory) has the Burj Khalifa — the world's tallest building — and Gulf states compete to build ever-taller skyscrapers.",
          note: "Sahih Muslim 8; Sahih al-Bukhari 50 (Hadith of Jibril)",
        },
        {
          title: "The conquest of Constantinople",
          detail:
            "The Prophet ﷺ specifically named Constantinople as a city the Muslims would conquer. This was fulfilled in 1453 CE — over 800 years later — when Sultan Mehmed II conquered the city, ending the Byzantine Empire. Multiple authentic narrations confirm this prophecy.",
          note: "Sahih Muslim 2897; Jami' at-Tirmidhi 2239; Musnad Ahmad 18189",
        },
        {
          title: "The conquest of Persia and Rome",
          detail:
            "During the Battle of Al-Khandaq — when the Muslims were besieged, starving, and outnumbered — the Prophet ﷺ prophesied the fall of both the Persian and Roman Empires. He said: 'When Kisra perishes, there will be no Kisra after him. And when Caesar perishes, there will be no Caesar after him.' Within a decade of his passing, both empires had fallen to the Muslim armies.",
          note: "Sahih al-Bukhari 3120; Sahih Muslim 2918",
        },
        {
          title: "The Muslim conquest of Jerusalem",
          detail:
            "The Prophet ﷺ foretold the conquest of Jerusalem (Bayt al-Maqdis). This was fulfilled during the caliphate of Umar ibn al-Khattab in 637 CE, when Umar personally traveled to Jerusalem to accept its surrender and guaranteed the safety of its Christian inhabitants in the Pact of Umar.",
          note: "Sahih al-Bukhari 3176",
        },
        {
          title: "A fire from Hijaz visible from Busra",
          detail:
            "The Prophet ﷺ said: 'The Hour will not come until a fire emerges from the land of Hijaz that will illuminate the necks of camels in Busra (Syria).' In 654 AH (1256 CE), a massive volcanic eruption occurred east of Medina. Contemporary historians documented that the light was visible from great distances, with reports reaching as far as Syria.",
          note: "Sahih al-Bukhari 7118; Sahih Muslim 2902",
        },
        {
          title: "The Mongol siege and destruction of Baghdad",
          detail:
            "The Prophet ﷺ warned that Muslims would fight a people 'whose faces are like hammered shields' with small eyes and flat noses, who wear shoes made of hair. In 1258 CE, the Mongol army under Hulagu Khan — matching this description exactly — sacked Baghdad, the capital of the Abbasid Caliphate, killing an estimated 200,000 to over a million people, destroying the House of Wisdom, and ending the Islamic Golden Age.",
          note: "Sahih Muslim 2912; Sahih al-Bukhari 2928",
        },
        {
          title: "The prevalence of interest-based transactions",
          detail:
            "The Prophet ﷺ said: 'There will come a time when there will be no one left who does not consume riba (usury/interest), and whoever does not consume it will nevertheless be affected by its residue.' Today, the entire global financial system is built on interest — mortgages, credit cards, student loans, government bonds. It is virtually impossible to live without encountering interest-based transactions.",
          note: "Sunan an-Nasa'i 4455 (graded sahih); Sunan Abu Dawud 3331",
        },
        {
          title: "Time passing quickly",
          detail:
            "The Prophet ﷺ said: 'The Hour will not come until time contracts — a year will be like a month, a month like a week, a week like a day, a day like an hour.' With modern technology, social media, and the pace of life, people universally report that time feels like it is accelerating.",
          note: "Sunan at-Tirmidhi 2332; Musnad Ahmad",
        },
        {
          title: "Music and entertainment becoming widespread",
          detail:
            "The Prophet ﷺ said: 'There will be people from my Ummah who will consider illegal sexual intercourse, silk (for men), alcohol, and musical instruments as lawful.' The modern entertainment industry — worth trillions — has made music and these vices a central part of daily life globally.",
          note: "Sahih al-Bukhari 5590",
        },
        {
          title: "Muslims will be numerous but weak",
          detail:
            "The Prophet ﷺ said: 'The nations will soon summon one another to attack you, as people invite others to share a dish of food.' Someone asked: 'Will that be because of our small numbers?' He said: 'No, you will be numerous, but you will be like the foam on a flood.' Today, there are nearly 2 billion Muslims, yet the Muslim world remains largely divided and powerless on the global stage.",
          note: "Sunan Abu Dawud 4297",
        },
        {
          title: "No comparable prophetic track record exists",
          detail:
            "Biblical prophecies are often vague, retroactively interpreted, or unfulfilled. Nostradamus's quatrains are deliberately ambiguous. Hindu and Buddhist texts do not contain specific, dated, verifiable predictions. Muhammad's prophecies are specific, recorded in authenticated chains of transmission, and verifiably fulfilled.",
        },
      ],
      source: "Sahih Muslim 8, 2897, 2912; Sahih al-Bukhari 50, 2928, 3120, 3176, 5590, 7118; Jami' at-Tirmidhi 2239, 2332; Sunan an-Nasa'i 4455; Sunan Abu Dawud 4297",
    },
  },
  {
    id: "science",
    name: "Scientific Consistency",
    content: {
      intro:
        "The Quran contains descriptions of natural phenomena that are consistent with modern scientific discoveries — described 1,400 years ago by an unlettered man in the Arabian desert. While the Quran is not a science textbook, its accuracy on these matters points to a divine origin.",
      points: [
        {
          title: "Human embryological development",
          detail:
            "The Quran describes the stages of embryonic development with remarkable accuracy: a drop (nutfah), then a clinging clot ('alaqah), then a lump of flesh (mudghah), then bones, then flesh covering the bones. Modern embryology confirms this sequence precisely. Professor Keith Moore, a leading embryologist, stated that the Quran's descriptions could not have been based on 7th-century scientific knowledge.",
          note: "Quran 23:12-14",
        },
        {
          title: "The expanding universe",
          detail:
            "The Quran states: 'And the heaven We constructed with strength, and indeed, We are its expander.' The expansion of the universe was only discovered by Edwin Hubble in 1929. This concept was unknown and unimaginable in the 7th century.",
          note: "Quran 51:47",
        },
        {
          title: "Barrier between seas",
          detail:
            "The Quran describes a barrier between two bodies of water that meet but do not transgress upon each other. Modern oceanography has confirmed this phenomenon — different seas maintain distinct temperatures, salinity levels, and densities despite meeting, due to surface tension and density differences.",
          note: "Quran 55:19-20",
        },
        {
          title: "Mountains as stabilizers",
          detail:
            "The Quran describes mountains as pegs (awtad) driven into the earth. Modern geology has confirmed that mountains have deep roots extending beneath the surface, and they play a role in stabilizing the earth's lithospheric plates — functioning exactly like pegs or anchors.",
          note: "Quran 78:6-7; Quran 21:31",
        },
        {
          title: "Iron sent down from space",
          detail:
            "The Quran says Allah 'sent down iron, in which there is great might and benefits for people.' Modern astrophysics confirms that iron is not native to Earth — it was formed in massive stars and delivered to Earth via meteorites billions of years ago. The word 'sent down' (anzalna) is scientifically precise.",
          note: "Quran 57:25",
        },
        {
          title: "No scientific errors",
          detail:
            "Despite addressing dozens of natural phenomena, the Quran contains no scientific errors — unlike other ancient texts. Greek science taught four elements; the Bible implies a flat earth with a solid dome (firmament); Hindu cosmology describes the earth on the back of elephants on a turtle. The Quran avoids all such errors while being consistent with modern knowledge.",
        },
      ],
      source: "Quran 23:12-14; 51:47; 55:19-20; 78:6-7; 57:25; 21:31",
    },
  },
  {
    id: "linguistic",
    name: "Linguistic Miracle",
    content: {
      intro:
        "The Quran's literary form is unique in the Arabic language — it is neither poetry nor prose, but an entirely new category. For 1,400 years, the challenge to produce even one chapter like it has remained unmet, despite being issued to the most eloquent poets and orators of Arabia.",
      verse: {
        arabic: "وَإِن كُنتُمْ فِى رَيْبٍۢ مِّمَّا نَزَّلْنَا عَلَىٰ عَبْدِنَا فَأْتُوا۟ بِسُورَةٍۢ مِّن مِّثْلِهِۦ",
        text: "And if you are in doubt about what We have revealed to Our servant, then produce a surah like it.",
        ref: "Quran 2:23",
      },
      points: [
        {
          title: "The unmet challenge",
          detail:
            "The Quran challenges all of humanity and jinn to produce even one chapter (surah) like it. The shortest surah is only 3 verses (10 words in Arabic). Despite 1,400 years and billions of Arabic speakers, this challenge remains unmet. The Arabs of the Prophet's time — masters of poetry and rhetoric — could not meet it despite being his fiercest enemies with every motivation to disprove him.",
          note: "Quran 2:23-24; Quran 17:88",
        },
        {
          title: "A unique literary form",
          detail:
            "Arabic literature recognizes poetry (shi'r) and prose (nathr). The Quran fits neither category — it created an entirely new form called 'Quranic discourse.' It has rhythm without meter, rhyme without the constraints of poetry, and a structure that shifts seamlessly between narrative, law, theology, and exhortation. Linguists have been unable to classify or replicate it.",
        },
        {
          title: "Even enemies acknowledged it",
          detail:
            "Al-Walid ibn al-Mughirah, one of the fiercest opponents of Islam and the most respected literary critic of Quraysh, said upon hearing the Quran: 'By Allah, it is not poetry, nor is it sorcery, nor the speech of a madman. His speech is from above.' He could only resort to calling it 'magic' because he had no other explanation.",
          note: "Referenced in Tafsir Ibn Kathir; the incident is well-documented in the Seerah",
        },
        {
          title: "Mathematical and structural patterns",
          detail:
            "The Quran contains intricate numerical patterns: the word 'day' (yawm) appears exactly 365 times; 'month' (shahr) appears exactly 12 times; 'sea' (bahr) and 'land' (barr) appear in a ratio matching the actual sea-to-land ratio on Earth (71.1% to 28.9%). These patterns were only discovered with computer analysis.",
        },
      ],
      source: "Quran 2:23-24; Quran 17:88",
    },
  },
  {
    id: "consistency",
    name: "Internal Consistency",
    content: {
      intro:
        "The Quran was revealed over 23 years, in different locations, addressing different situations — yet it maintains perfect internal consistency across theology, law, history, and science. It explicitly challenges anyone to find contradictions within it.",
      verse: {
        arabic: "أَفَلَا يَتَدَبَّرُونَ ٱلْقُرْءَانَ ۚ وَلَوْ كَانَ مِنْ عِندِ غَيْرِ ٱللَّهِ لَوَجَدُوا۟ فِيهِ ٱخْتِلَـٰفًا كَثِيرًا",
        text: "Do they not reflect upon the Quran? If it had been from other than Allah, they would have found within it much contradiction.",
        ref: "Quran 4:82",
      },
      points: [
        {
          title: "23 years, zero contradictions",
          detail:
            "The Quran was revealed piecemeal over 23 years — in Makkah and Madinah, during peace and war, in times of triumph and hardship. Despite this, it contains no theological contradictions, no historical errors, and no internal inconsistencies. This is unprecedented for any text of comparable length and scope.",
          note: "Quran 4:82",
        },
        {
          title: "An unlettered author",
          detail:
            "Prophet Muhammad (peace be upon him) was unlettered (ummi) — he could neither read nor write. He was not a poet, a priest, or a scholar. Yet the Quran covers theology, law, embryology, cosmology, history, ethics, and more with complete accuracy. The hypothesis that an unlettered 7th-century Arabian merchant authored this text is far more extraordinary than the claim of divine revelation.",
          note: "Quran 7:157 — 'Those who follow the Messenger, the unlettered Prophet'",
        },
        {
          title: "Compare: Biblical contradictions",
          detail:
            "The Bible contains well-documented internal contradictions: the genealogies of Jesus in Matthew and Luke differ; the accounts of Judas's death are incompatible (Matthew 27:5 vs Acts 1:18); the creation accounts in Genesis 1 and Genesis 2 present different sequences. These indicate human editing, not divine preservation.",
        },
        {
          title: "Compare: Contradictions in other scriptures",
          detail:
            "The Hindu Vedas, Upanishads, and Puranas contain contradictory cosmological and theological claims — reflecting composition over many centuries by different authors. Buddhist scriptures contain mutually exclusive doctrines across different schools. The Quran's consistency across 23 years stands in stark contrast.",
        },
      ],
      source: "Quran 4:82; Quran 7:157",
    },
  },
  {
    id: "morality",
    name: "Moral Framework",
    content: {
      intro:
        "Islam provides the most comprehensive moral framework of any religion — covering personal conduct, family life, economics, governance, warfare, and social relations. Many of its principles were revolutionary in the 7th century and remain unmatched in their completeness.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلنَّاسُ إِنَّا خَلَقْنَـٰكُم مِّن ذَكَرٍۢ وَأُنثَىٰ وَجَعَلْنَـٰكُمْ شُعُوبًا وَقَبَآئِلَ لِتَعَارَفُوٓا۟ ۚ إِنَّ أَكْرَمَكُمْ عِندَ ٱللَّهِ أَتْقَىٰكُمْ",
        text: "O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another. Indeed, the most noble of you in the sight of Allah is the most righteous.",
        ref: "Quran 49:13",
      },
      points: [
        {
          title: "Abolished racism 1,400 years ago",
          detail:
            "In his Farewell Sermon, the Prophet declared: 'An Arab has no superiority over a non-Arab, nor a non-Arab over an Arab; a white has no superiority over a black, nor a black over a white — except by piety and good action.' This was said in 632 CE — over 1,200 years before the American Civil Rights Movement.",
          note: "Musnad Ahmad 23489",
        },
        {
          title: "Women's rights in the 7th century",
          detail:
            "Islam granted women the right to own property, inherit wealth, choose their spouse, seek divorce, and engage in business — in the 7th century. Khadijah (may Allah be pleased with her) was a successful businesswoman who proposed marriage to the Prophet. European women did not gain comparable property rights until the 19th century.",
          note: "Quran 4:7 (inheritance); Quran 4:19 (consent in marriage)",
        },
        {
          title: "The five essential preservations (Maqasid al-Shariah)",
          detail:
            "Islamic law is built on preserving five essentials: life, religion, intellect, lineage, and wealth. Every Islamic ruling can be traced to protecting one of these. This framework, identified by scholars like al-Ghazali and al-Shatibi, is remarkably similar to modern concepts of universal human rights — formulated a millennium later.",
        },
        {
          title: "Complete system — not just spiritual",
          detail:
            "Unlike religions that address only spiritual matters, Islam provides guidance for every aspect of life: personal hygiene, diet, business ethics, criminal justice, international relations, environmental stewardship, and treatment of animals. No other religion offers such a comprehensive and integrated system of life.",
        },
      ],
      source: "Quran 49:13; Quran 4:7, 4:19; Musnad Ahmad 23489",
    },
  },
  {
    id: "hadith-science",
    name: "Hadith Science",
    content: {
      intro:
        "Islam developed the most rigorous system of oral tradition verification in human history. The science of hadith (ʿilm al-ḥadīth) is a sophisticated methodology for authenticating prophetic narrations through unbroken chains of transmission — a system with no parallel in any other civilization or religion.",
      verse: {
        arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا إِن جَآءَكُمْ فَاسِقٌۢ بِنَبَإٍۢ فَتَبَيَّنُوٓا",
        text: "O you who believe, if a sinful person comes to you with information, verify it.",
        ref: "Quran 49:6",
      },
      points: [
        {
          title: "The Isnad system — unbroken chains of transmission",
          detail:
            "Every hadith consists of two parts: the isnad (chain of narrators) and the matn (text). The isnad traces the narration back to the Prophet ﷺ through named individuals in every link. Scholars verified that each narrator actually met the next, that their lifespans overlapped, and that they were known to be in the same region. No other civilization developed anything comparable to this system.",
          note: "Ibn al-Salah, Muqaddimah fi ʿUlum al-Hadith",
        },
        {
          title: "Narrator criticism — the first biographical science",
          detail:
            "Muslim scholars created the science of al-Jarḥ wa al-Taʿdīl (narrator criticism and validation) — evaluating the memory, honesty, precision, and character of every person in every chain. Biographical encyclopedias documented hundreds of thousands of narrators: their teachers, students, travels, reputation, and any lapses in memory. This effectively created the world's first large-scale peer review system.",
          note: "Al-Dhahabi, Mizan al-I'tidal; Ibn Hajar, Tahdhib al-Tahdhib",
        },
        {
          title: "Classification system — grading authenticity",
          detail:
            "Hadith are classified into precise grades: Sahih (authentic), Hasan (good), Da'if (weak), and Mawdu' (fabricated). A hadith is only sahih if every narrator in the chain is trustworthy (ʿadl) and precise (ḍābiṭ), the chain is unbroken, and the text has no hidden defects (ʿillah) or anomalies (shudhūdh). Scholars like al-Bukhari reportedly examined 600,000 narrations and accepted only ~7,275 — a rejection rate of over 98%.",
          note: "Sahih al-Bukhari; Ibn al-Salah's classification methodology",
        },
        {
          title: "Compare: No other religion has this verification",
          detail:
            "The Gospels are anonymous — Matthew, Mark, Luke, and John are traditional attributions, not claims by the authors themselves. There is no chain of narration from Jesus to the Gospel writers. The Hindu Vedas are attributed to divine revelation with no named human chain. The Pali Canon was first written down approximately 450 years after the Buddha (29 BCE). Only Islam demands: 'Who told you? Who told them? All the way back to the Prophet.'",
        },
        {
          title: "Massive scholarly infrastructure",
          detail:
            "The hadith sciences produced an enormous body of scholarship: collections (Kutub al-Sittah — the six canonical books), narrator biographies (Rijal literature containing 100,000+ entries), defect analysis (ʿIlal), abrogation studies (Nasikh wa Mansukh), and legal derivation (Usul al-Fiqh). This represents over a millennium of continuous scholarly effort dedicated solely to preserving and verifying the words of one man — the Prophet Muhammad ﷺ.",
          note: "The six canonical collections: Bukhari, Muslim, Abu Dawud, Tirmidhi, al-Nasa'i, Ibn Majah",
        },
      ],
      source: "Quran 49:6; Ibn al-Salah, Muqaddimah; al-Bukhari; al-Dhahabi, Mizan al-I'tidal",
    },
  },
];

/* ───────────────────────── Tab 2: Christianity Deep Dive ───────────────────────── */

const christianityTopics: Topic[] = [
  {
    id: "trinity",
    name: "The Trinity",
    content: {
      intro:
        "The Trinity — the belief that God is three persons (Father, Son, Holy Spirit) in one being — is the central doctrine of Christianity. Yet it was never taught by Jesus, never appears as a formulated doctrine in the Bible, and was only defined centuries after Jesus by church councils under political pressure.",
      verse: {
        arabic: "لَّقَدْ كَفَرَ ٱلَّذِينَ قَالُوٓا۟ إِنَّ ٱللَّهَ ثَالِثُ ثَلَـٰثَةٍۢ ۘ وَمَا مِنْ إِلَـٰهٍ إِلَّآ إِلَـٰهٌ وَ‌ٰحِدٌ",
        text: "They have certainly disbelieved who say: Allah is the third of three. And there is no god except one God.",
        ref: "Quran 5:73",
      },
      points: [
        {
          title: "The word 'Trinity' never appears in the Bible",
          detail:
            "The term 'Trinity' (Latin: Trinitas) was first coined by Tertullian around 200 CE — nearly two centuries after Jesus. The concept does not appear in any of Jesus's teachings recorded in the Gospels. The only explicit Trinitarian verse in the Bible — the Comma Johanneum (1 John 5:7-8: 'For there are three that bear record in heaven: the Father, the Word, and the Holy Ghost') — is a later addition not found in any Greek manuscript before the 16th century. Modern Bibles either remove it or footnote it as inauthentic.",
          note: "Bruce Metzger, A Textual Commentary on the Greek New Testament",
        },
        {
          title: "The Council of Nicaea (325 CE) — voted on by politicians",
          detail:
            "Emperor Constantine convened the Council of Nicaea — not for theological purity, but to unify his empire. Over 300 bishops debated and voted on whether Jesus was 'of the same substance' (homoousios) as God. This was a political decision, not a divine revelation. The vote was not unanimous — Arius and his followers, who believed Jesus was a created being (closer to the Islamic view), were exiled and their writings burned. Truth is not determined by majority vote.",
        },
        {
          title: "The councils kept changing the doctrine",
          detail:
            "Christian doctrine evolved through centuries of councils: Nicaea (325 CE) — Jesus is 'same substance' as God. Constantinople (381 CE) — the Holy Spirit is added to make it a Trinity. Ephesus (431 CE) — Mary is declared 'Mother of God' (Theotokos). Chalcedon (451 CE) — Jesus has two natures (divine and human) in one person. Each council condemned the previous generation's beliefs as heresy. A divinely revealed truth should not need centuries of committee revisions.",
        },
        {
          title: "The Trinity is logically incoherent",
          detail:
            "Christians claim God is one being but three persons. This is not a mystery — it is a contradiction. If the Father is God, the Son is God, and the Holy Spirit is God, but there are not three Gods but one God — this violates the law of non-contradiction. When Jesus prayed to the Father, was he praying to himself? When he said 'My God, My God, why have you forsaken me?' (Matthew 27:46) — did God forsake himself? Islam's concept of Tawhid (absolute oneness) requires no such logical gymnastics.",
        },
        {
          title: "Early Christians rejected the Trinity",
          detail:
            "The earliest Jewish Christians — the Ebionites — who actually knew Jesus's apostles, rejected his divinity entirely. They considered Jesus a human prophet and followed the Law of Moses. The Arians (followers of Arius) — who constituted a huge portion of early Christianity — believed Jesus was a creation of God, not God himself. These groups were suppressed and destroyed by the Trinitarian faction that gained political power. The 'losers' of church politics were closer to Jesus's actual teaching.",
        },
      ],
      source: "Quran 5:73; Quran 4:171; Matthew 27:46; 1 John 5:7-8 (disputed)",
    },
  },
  {
    id: "jesus-words",
    name: "Jesus's Own Words",
    content: {
      intro:
        "The strongest argument against Christianity's claims about Jesus comes from Jesus's own words as recorded in the Gospels. When we examine what Jesus actually said — rather than what was said about him — we find a prophet who preached pure monotheism, denied divinity, and worshipped God exactly as Muslims do.",
      verse: {
        arabic: "مَا قُلْتُ لَهُمْ إِلَّا مَآ أَمَرْتَنِى بِهِۦٓ أَنِ ٱعْبُدُوا۟ ٱللَّهَ رَبِّى وَرَبَّكُمْ",
        text: "I said not to them except what You commanded me — to worship Allah, my Lord and your Lord.",
        ref: "Quran 5:117",
      },
      points: [
        {
          title: "Jesus declared God is one — not three",
          detail:
            "When asked 'Which is the most important commandment?' Jesus replied: 'Hear, O Israel: The Lord our God, the Lord is ONE. Love the Lord your God with all your heart' (Mark 12:29). He did not say 'the Lord is three' or 'the Lord is a Trinity.' He affirmed the exact same monotheism that Islam teaches — the Shema of Judaism, the Tawhid of Islam.",
          note: "Mark 12:29 — quoting Deuteronomy 6:4",
        },
        {
          title: "Jesus explicitly denied being God",
          detail:
            "'Why do you call me good? No one is good except God alone' (Mark 10:18). 'I can of myself do nothing' (John 5:30). 'My Father is greater than I' (John 14:28). 'I am ascending to my Father and your Father, to my God and your God' (John 20:17). If Jesus were God, these statements would be lies. Islam says they are the truth — Jesus was a humble servant and prophet of God, not God himself.",
          note: "Mark 10:18; John 5:30; John 14:28; John 20:17",
        },
        {
          title: "Jesus prayed and prostrated — to whom?",
          detail:
            "Jesus 'fell with his face to the ground and prayed' (Matthew 26:39) — the exact posture of Islamic sujud (prostration). He fasted for 40 days. He said: 'I do nothing on my own but speak just what the Father has taught me' (John 8:28). If Jesus were God, who was he praying to? Who taught him? A God who prostrates to another God, who admits he can do nothing alone, and who needs to be taught — is not God at all. He is a prophet.",
          note: "Matthew 26:39; John 8:28; Matthew 4:2 (fasting)",
        },
        {
          title: "Jesus called himself a prophet and servant",
          detail:
            "Jesus referred to himself as a prophet: 'A prophet is not without honor except in his own town' (Mark 6:4). The book of Acts records the early Christians calling Jesus 'God's servant' — not God's son in a divine sense: 'God glorified his servant Jesus' (Acts 3:13). Even the title 'Son of God' in Jewish culture was metaphorical — Israel was called 'God's firstborn son' (Exodus 4:22), and angels were called 'sons of God' (Job 1:6). It did not imply divinity.",
          note: "Mark 6:4; Acts 3:13; Exodus 4:22; Job 1:6",
        },
        {
          title: "Jesus said he was sent only to the Israelites",
          detail:
            "Jesus explicitly stated: 'I was sent only to the lost sheep of the house of Israel' (Matthew 15:24). He instructed his disciples: 'Do not go among the Gentiles or enter any town of the Samaritans' (Matthew 10:5-6). This confirms Islam's teaching that Jesus was a prophet sent to a specific nation — not the universal savior that Christianity later made him. Muhammad (peace be upon him) was the prophet sent to all of humanity.",
          note: "Matthew 15:24; Matthew 10:5-6; Quran 34:28 — 'We have sent you to all mankind'",
        },
        {
          title: "Jesus prophesied another prophet after him",
          detail:
            "Jesus said: 'I have much more to say to you, more than you can now bear. But when he, the Spirit of Truth, comes, he will guide you into all the truth. He will not speak on his own; he will speak only what he hears' (John 16:12-13). Christians claim this is the Holy Spirit, but the description — 'he will not speak on his own, he will speak only what he hears' — perfectly matches Prophet Muhammad, who spoke only what was revealed to him. The Quran itself says: 'Nor does he speak from his own desire. It is nothing but revelation revealed' (Quran 53:3-4).",
          note: "John 16:12-13; John 14:16; Quran 53:3-4; Quran 61:6",
        },
      ],
      source: "Mark 12:29; Mark 10:18; John 5:30; John 14:28; John 20:17; Matthew 26:39; Matthew 15:24; John 16:12-13; Acts 3:13",
    },
  },
  {
    id: "biblical-corruption",
    name: "Biblical Corruption",
    content: {
      intro:
        "The Bible — as it exists today — is not the original revelation given to Jesus (the Injeel) or Moses (the Torah). Mainstream Biblical scholarship, including Christian scholars themselves, has demonstrated that the Bible has undergone extensive editing, additions, deletions, and mistranslations over centuries.",
      verse: {
        arabic: "فَوَيْلٌ لِّلَّذِينَ يَكْتُبُونَ ٱلْكِتَـٰبَ بِأَيْدِيهِمْ ثُمَّ يَقُولُونَ هَـٰذَا مِنْ عِندِ ٱللَّهِ",
        text: "So woe to those who write the scripture with their own hands, then say: This is from Allah.",
        ref: "Quran 2:79",
      },
      points: [
        {
          title: "400,000+ textual variants in the New Testament",
          detail:
            "There are approximately 5,800 Greek manuscripts of the New Testament, and scholars have identified more than 400,000 textual variants between them — more variants than there are words in the entire New Testament (approximately 138,000 words). While most are minor spelling differences, many are theologically significant — affecting key doctrines about Jesus's divinity, the Trinity, and salvation.",
          note: "Bart Ehrman, Misquoting Jesus (2005); Bruce Metzger, The Text of the New Testament",
        },
        {
          title: "Major passages that were added later",
          detail:
            "Three of the most famous passages in the New Testament are later additions not found in the earliest manuscripts:\n\n1. The ending of Mark (16:9-20) — describing Jesus's resurrection appearances — is absent from the two oldest manuscripts (Codex Sinaiticus and Codex Vaticanus).\n\n2. The story of the adulteress ('let him who is without sin cast the first stone' — John 7:53-8:11) — does not appear in any manuscript before the 5th century.\n\n3. The Comma Johanneum (1 John 5:7-8) — the only explicit Trinitarian statement — was not in any Greek manuscript before the 16th century.\n\nThese are not minor footnotes — they are foundational Christian teachings that were fabricated and inserted into the text.",
          note: "All major modern Bibles (NIV, ESV, NRSV) footnote these passages as disputed or later additions",
        },
        {
          title: "No original manuscripts exist",
          detail:
            "Not a single original manuscript (autograph) of any New Testament book exists. The earliest substantial manuscript — Codex Sinaiticus — dates to approximately 350 CE, over 300 years after Jesus. The earliest fragment — P52 — is a credit-card-sized piece of papyrus from around 125 CE containing a few verses of John. We are relying on copies of copies of copies — each introducing errors and alterations. Compare this to the Quran, which has an unbroken oral and written chain of transmission from the Prophet Muhammad to today.",
        },
        {
          title: "The Gospels were not written by eyewitnesses",
          detail:
            "The four Gospels are titled 'According to Matthew,' 'According to Mark,' etc. — but they were written anonymously. The names were assigned later by church tradition. Modern scholars agree: Mark was written around 70 CE (40 years after Jesus), Matthew and Luke around 80-90 CE (using Mark as a source), and John around 90-100 CE. None were written by Jesus's direct companions. They are third-hand accounts written in Greek — a language Jesus did not speak (he spoke Aramaic).",
          note: "Bart Ehrman, Jesus, Interrupted; Raymond Brown, An Introduction to the New Testament",
        },
        {
          title: "Contradictions between the Gospels",
          detail:
            "The four Gospels contradict each other on fundamental events:\n\n- Jesus's genealogy: Matthew traces it through Solomon; Luke traces it through Nathan — they cannot both be right.\n- The birth narratives: Matthew has the family fleeing to Egypt; Luke has them calmly returning to Nazareth. These are irreconcilable.\n- Judas's death: Matthew says he hanged himself (27:5); Acts says he fell and burst open (1:18).\n- The resurrection: How many women went to the tomb? Who did they meet? What did they do? Each Gospel gives a different answer.\n\nIf the Bible were divinely preserved, these contradictions would not exist. The Quran explicitly challenges: 'If it had been from other than Allah, they would have found within it much contradiction' (Quran 4:82).",
          note: "Matthew 1:6 vs Luke 3:31; Matthew 27:5 vs Acts 1:18; Matthew 2:14 vs Luke 2:39",
        },
        {
          title: "The Old Testament is equally corrupted",
          detail:
            "The Documentary Hypothesis — the consensus of mainstream Biblical scholarship — identifies at least four distinct literary sources in the Pentateuch (J, E, D, P), composed by different authors over several centuries and compiled after the Babylonian exile (~500 BCE). Genesis contains two contradictory creation accounts (Genesis 1 vs Genesis 2). Deuteronomy records the death and burial of Moses — an impossibility if Moses wrote it. Isaiah was written by at least two different authors (Proto-Isaiah and Deutero-Isaiah). The Quran confirms: the original Torah was divine, but it was corrupted by human hands.",
          note: "Richard Friedman, Who Wrote the Bible?; Quran 2:75; Quran 5:13",
        },
      ],
      source: "Quran 2:79; Quran 4:82; Bart Ehrman, Misquoting Jesus; Bruce Metzger, The Text of the New Testament; Richard Friedman, Who Wrote the Bible?",
    },
  },
  {
    id: "paul-vs-jesus",
    name: "Paul vs. Jesus",
    content: {
      intro:
        "Perhaps the most devastating internal critique of Christianity is the fundamental conflict between what Jesus taught and what Paul preached. Paul — who never met Jesus during his ministry — effectively replaced the religion of Jesus with a religion about Jesus. Modern Christianity is, in many ways, more Pauline than Christian.",
      verse: {
        arabic: "يَـٰٓأَهْلَ ٱلْكِتَـٰبِ لَا تَغْلُوا۟ فِى دِينِكُمْ وَلَا تَقُولُوا۟ عَلَى ٱللَّهِ إِلَّا ٱلْحَقَّ",
        text: "O People of the Scripture, do not commit excess in your religion or say about Allah except the truth.",
        ref: "Quran 4:171",
      },
      points: [
        {
          title: "Paul never met Jesus",
          detail:
            "Paul (originally Saul of Tarsus) was a Pharisee who persecuted the early Christians. He claims to have seen a vision of Jesus on the road to Damascus — but he never met Jesus in person, never heard his sermons, never witnessed his miracles. Despite this, Paul wrote 13 of the 27 New Testament books — nearly half the New Testament. His letters (written 50-65 CE) predate the Gospels (written 70-100 CE). Christianity is built more on Paul's vision than on Jesus's actual teachings.",
          note: "Acts 9:1-19; Galatians 1:11-12 — Paul claims his gospel came 'not from any man but by revelation'",
        },
        {
          title: "Jesus upheld the Law — Paul abolished it",
          detail:
            "Jesus explicitly said: 'Do not think that I have come to abolish the Law or the Prophets. I have not come to abolish them but to fulfill them. For truly I tell you, until heaven and earth disappear, not the smallest letter, not the least stroke of a pen, will by any means disappear from the Law' (Matthew 5:17-18). Paul directly contradicted this: 'Christ is the end of the law' (Romans 10:4), 'You are not under the law but under grace' (Romans 6:14). One of them must be wrong — and it is the one who never met Jesus.",
          note: "Matthew 5:17-18 vs Romans 10:4; Romans 6:14; Galatians 3:13",
        },
        {
          title: "James (Jesus's brother) opposed Paul",
          detail:
            "James — the biological brother of Jesus and the leader of the Jerusalem church — directly contradicted Paul's theology. Paul taught salvation by faith alone: 'A person is justified by faith apart from works of the law' (Romans 3:28). James rebutted: 'You see that a person is justified by what they do and not by faith alone' (James 2:24). James continued to follow Jewish law and worship at the Temple — as Jesus did. The conflict between James and Paul is documented even in Acts (Acts 15, 21:17-26). Paul won because he had more Gentile converts, not because he was right.",
          note: "Romans 3:28 vs James 2:24; Galatians 2:11-14 — Paul publicly confronted Peter/James's allies",
        },
        {
          title: "Paul invented the divinity of Christ",
          detail:
            "Jesus never explicitly claimed to be God in the Synoptic Gospels (Matthew, Mark, Luke — the earliest accounts). It was Paul who first articulated the concept of Christ's pre-existence and divine nature: 'He is the image of the invisible God, the firstborn over all creation' (Colossians 1:15). The Gospel of John (written last, around 90-100 CE) then retroactively placed high Christological claims in Jesus's mouth ('I and the Father are one' — John 10:30) — reflecting decades of Pauline theological development, not Jesus's actual words.",
          note: "Colossians 1:15; Philippians 2:6-11; John 10:30 (late composition)",
        },
        {
          title: "Paul invented original sin and vicarious atonement",
          detail:
            "The concept that all humanity inherited Adam's sin and that Jesus died to pay for it is Paul's invention: 'For as in Adam all die, so in Christ all will be made alive' (1 Corinthians 15:22). Jesus never taught original sin. The Hebrew Bible itself contradicts it: 'The son shall not bear the iniquity of the father' (Ezekiel 18:20). Islam's position is that of natural justice: every person is born sinless (fitrah) and is accountable only for their own deeds. No one else can carry your sins or be punished in your place.",
          note: "1 Corinthians 15:22; Romans 5:12; Ezekiel 18:20; Quran 6:164",
        },
        {
          title: "The religion of Jesus vs. the religion about Jesus",
          detail:
            "Jesus was a Jewish prophet who worshipped one God, prayed by prostrating, fasted, kept the dietary laws, was circumcised, and preached monotheism. If Jesus walked into a modern church — with statues, a Trinity, pork on the menu, and no one fasting — he would not recognize it as his religion. If he walked into a mosque — where people prostrate to one God, fast, abstain from pork, and honor him as a mighty prophet — he would feel at home. Islam is the religion of Jesus; Christianity is the religion about Jesus.",
        },
      ],
      source: "Matthew 5:17-18; Romans 3:28; Romans 10:4; James 2:24; 1 Corinthians 15:22; Ezekiel 18:20; Galatians 2:11-14; Quran 4:171; Quran 6:164",
    },
  },
  {
    id: "councils",
    name: "Council History",
    content: {
      intro:
        "Christian doctrine was not established by Jesus or his immediate followers — it was hammered out over four centuries through a series of contentious church councils, often driven by political pressure from Roman emperors. Each council condemned the previous generation's beliefs and created new orthodoxies.",
      points: [
        {
          title: "Council of Nicaea (325 CE) — Constantine's political unity project",
          detail:
            "Emperor Constantine — who was not even baptized until his deathbed — convened this council to resolve the Arian controversy and unify his empire. The key question: Is Jesus 'of the same substance' (homoousios) as God, or 'of similar substance' (homoiousios)? The difference of a single Greek letter determined all of Christian theology. The Nicene faction won by political maneuvering. Arius and his supporters were exiled, their books burned. Constantine later reversed course and supported the Arians — then reversed again. Divine truth should not depend on an emperor's mood.",
        },
        {
          title: "Council of Constantinople (381 CE) — the Holy Spirit added",
          detail:
            "The original Nicene Creed (325 CE) barely mentioned the Holy Spirit. At Constantinople, Emperor Theodosius convened 150 bishops (only Eastern bishops — the West was not represented) who expanded the creed to include the Holy Spirit as 'Lord and Life-giver, who proceeds from the Father.' The Trinity as Christians know it today was only fully formulated 350 years after Jesus. This is theology by committee evolution, not divine revelation.",
        },
        {
          title: "Council of Ephesus (431 CE) — Mary becomes 'Mother of God'",
          detail:
            "At Ephesus, the title 'Theotokos' (God-bearer / Mother of God) was officially assigned to Mary. Nestorius, the Patriarch of Constantinople, objected — arguing that Mary was the mother of Jesus's human nature, not his divine nature. He was condemned as a heretic and exiled. The Nestorian Christians (who rejected Mary's divine motherhood and questioned the Trinity) fled eastward and established churches across Persia, India, and China — their theology closer to Islam's view of Jesus than to modern Christianity.",
        },
        {
          title: "Council of Chalcedon (451 CE) — two natures in one person",
          detail:
            "How exactly is Jesus both God and man? Chalcedon declared that Jesus has two complete natures — fully divine and fully human — united in one person without confusion or division. The Monophysites (who believed Jesus had one divine-human nature) rejected this and split off, forming the Coptic, Ethiopian, and Armenian churches. The church that claims to represent absolute truth has never been able to agree on the most basic question: what exactly is Jesus?",
        },
        {
          title: "Council of Carthage (397 CE) — the Bible's table of contents",
          detail:
            "The 27 books of the New Testament were only officially canonized at the Council of Carthage — nearly 400 years after Jesus. Before this, different churches used different collections. Dozens of texts were excluded: the Gospel of Thomas, the Gospel of Peter, the Didache, the Shepherd of Hermas, the Apocalypse of Peter, and the Epistle of Barnabas. The books that 'won' were those that aligned with the faction that held political power. The 'Word of God' was curated by committee vote.",
        },
        {
          title: "The pattern is clear",
          detail:
            "Each generation of Christians condemned the previous generation as heretics. The theology kept evolving — from simple monotheism (Jesus's teaching), to high Christology (Paul), to the Trinity (Nicaea), to Mary as Mother of God (Ephesus), to two natures of Christ (Chalcedon). This is not the pattern of a preserved divine message — it is the pattern of a man-made religion evolving through political and intellectual pressures. Islam's theology, by contrast, has remained unchanged since the day it was revealed: La ilaha illallah — there is no god but Allah.",
        },
      ],
      source: "Historical records of the Ecumenical Councils; Quran 5:73; Quran 4:171",
    },
  },
  {
    id: "lost-christianities",
    name: "The Lost Christianities",
    content: {
      intro:
        "Modern Christianity represents the version that won the political battles of the early centuries — not necessarily the version closest to Jesus's teaching. Dozens of early Christian groups, many with direct connections to the apostles, held beliefs remarkably similar to Islam's view of Jesus. They were systematically suppressed and destroyed.",
      points: [
        {
          title: "The Ebionites — the original Jewish Christians",
          detail:
            "The Ebionites were Jewish Christians who maintained the closest connection to the original Jerusalem church led by James (Jesus's brother). They believed: Jesus was a human prophet, not God; the Jewish Law must be followed; Jesus was the Messiah but not divine; Paul was a false apostle who corrupted Jesus's message. Their beliefs align almost exactly with Islam's view of Jesus. They were declared heretics and suppressed by the Pauline faction that gained Roman political support.",
          note: "Irenaeus, Against Heresies; Eusebius, Church History",
        },
        {
          title: "The Arians — the largest 'heresy' in Christian history",
          detail:
            "Arius (250-336 CE), a priest from Alexandria, taught that Jesus was God's greatest creation — exalted and honored, but not equal to God. 'There was a time when the Son was not,' he argued. At its peak, Arianism was the majority position in Christianity — not a fringe sect. Multiple Roman emperors supported it. It took centuries of political persecution to stamp it out. Arius's view of Jesus — a revered but created being, subordinate to God — is essentially the Islamic position.",
        },
        {
          title: "The Nestorians — spread across Asia",
          detail:
            "Nestorius, Patriarch of Constantinople, rejected the title 'Mother of God' for Mary and questioned the union of divine and human natures in Jesus. Condemned at Ephesus (431 CE), his followers spread eastward — establishing the Church of the East across Persia, Central Asia, India, and China. Nestorian Christianity, with its lower Christology and rejection of Marian worship, was the form of Christianity that Muslims first encountered. Many Nestorian Christians recognized Muhammad as a prophet and converted to Islam.",
        },
        {
          title: "The Gospel of Barnabas",
          detail:
            "The Gospel of Barnabas — attributed to Barnabas, Paul's early companion — presents a version of Jesus's life strikingly consistent with Islamic theology. It denies Jesus's divinity, affirms strict monotheism, and prophesies the coming of Muhammad by name. While its dating and authenticity are debated (critics date the surviving manuscript to the medieval period), its existence demonstrates that alternative Christian traditions preserving a more monotheistic view of Jesus persisted for centuries.",
        },
        {
          title: "The Gnostic Gospels — suppressed alternatives",
          detail:
            "The 1945 discovery of the Nag Hammadi library in Egypt revealed dozens of early Christian texts that had been suppressed: the Gospel of Thomas, the Gospel of Philip, the Gospel of Truth, and others. While Gnostic theology differs from Islam, these texts prove that early Christianity was far more diverse than the single narrative presented today. The 'orthodox' version was one of many — and it won through political power, not theological superiority.",
          note: "Elaine Pagels, The Gnostic Gospels; Bart Ehrman, Lost Christianities",
        },
        {
          title: "A pattern of suppression",
          detail:
            "Every group that maintained a lower Christology (Jesus as prophet, not God) was systematically persecuted: books burned, followers exiled or killed, churches destroyed. Emperor Theodosius made Trinitarian Christianity the state religion in 380 CE and banned all other forms. What we call 'Christianity' today is not the religion of Jesus — it is the religion of the faction that won the political wars. Islam came to restore what these suppressed groups were trying to preserve: the original monotheistic message of Jesus.",
        },
      ],
      source: "Bart Ehrman, Lost Christianities; Elaine Pagels, The Gnostic Gospels; Irenaeus, Against Heresies; Eusebius, Church History",
    },
  },
  {
    id: "modern-scholarship",
    name: "Modern Scholarship",
    content: {
      intro:
        "Some of the most powerful critiques of traditional Christian theology come not from Muslim scholars, but from Western academics — many of them former Christians or current Christian scholars — who have applied rigorous historical-critical methods to the New Testament and found its claims wanting.",
      points: [
        {
          title: "Bart Ehrman — from evangelical to agnostic",
          detail:
            "Bart Ehrman, professor at the University of North Carolina and one of the world's leading New Testament scholars, started as an evangelical Christian. His detailed study of Biblical manuscripts led him to conclude: the Bible has been significantly altered, key passages were fabricated, and the historical Jesus never claimed to be God. His books — Misquoting Jesus, How Jesus Became God, and Jesus, Interrupted — systematically dismantle the claims of Biblical inerrancy and Jesus's divinity using rigorous textual analysis. He confirms what the Quran said 1,400 years ago: the scriptures were corrupted.",
          note: "Bart Ehrman, How Jesus Became God (2014); Misquoting Jesus (2005); Jesus, Interrupted (2009)",
        },
        {
          title: "The Jesus Seminar — separating history from theology",
          detail:
            "The Jesus Seminar, a group of over 150 scholars, spent years analyzing every saying attributed to Jesus in the Gospels. Their conclusion: only about 18% of the words attributed to Jesus were actually spoken by him. The rest were invented by the Gospel authors or the early church communities. The famous 'I and the Father are one' (John 10:30) was rated as almost certainly not spoken by the historical Jesus. The Jesus of history bears little resemblance to the Christ of faith.",
          note: "Robert Funk, The Five Gospels: What Did Jesus Really Say? (1993)",
        },
        {
          title: "Raymond Brown — a Catholic scholar's honest assessment",
          detail:
            "Raymond Brown, one of the most respected Catholic Biblical scholars of the 20th century, acknowledged that the Gospels contain theological embellishments, that the birth narratives in Matthew and Luke are historically irreconcilable, and that the authorship of several New Testament books is pseudonymous (falsely attributed). Even a devout Catholic scholar could not defend the Bible's historical reliability under rigorous academic scrutiny.",
          note: "Raymond Brown, An Introduction to the New Testament (1997); The Birth of the Messiah (1977)",
        },
        {
          title: "The Q Source — a lost original gospel",
          detail:
            "Scholars have identified 'Q' (from German Quelle, 'source') — a hypothetical document that both Matthew and Luke used as a source alongside Mark. Q appears to have been a collection of Jesus's sayings — with no passion narrative, no resurrection story, and no claims of Jesus's divinity. This suggests the earliest layer of Jesus's teaching was purely about monotheism and ethical living — consistent with Islam's portrayal of Jesus as a prophet, not a savior-god.",
          note: "Burton Mack, The Lost Gospel: The Book of Q (1993)",
        },
        {
          title: "Historical Jesus research confirms the Islamic view",
          detail:
            "The cumulative conclusion of two centuries of historical Jesus research: Jesus was a Jewish prophet who preached the coming Kingdom of God, called people to repentance and monotheism, performed healings, clashed with the religious establishment, and was crucified by the Romans. He did not claim to be God, did not teach the Trinity, did not abolish the Jewish Law, and did not establish a church. This portrait — the product of rigorous Western scholarship — matches the Quran's description of Jesus almost perfectly.",
        },
        {
          title: "Western scholars who acknowledged Muhammad",
          detail:
            "Multiple Western scholars and intellectuals have acknowledged Muhammad's extraordinary impact and the Quran's authenticity. Michael Hart ranked Muhammad #1 in his book The 100: A Ranking of the Most Influential Persons in History, calling him 'the most influential single figure in human history.' George Bernard Shaw wrote: 'If Muhammad were alive today, he would succeed in solving all those problems which threaten to destroy human civilization.' Even scholars who remained non-Muslim have recognized what they could not explain away.",
          note: "Michael Hart, The 100 (1978); George Bernard Shaw, The Genuine Islam (1936)",
        },
      ],
      source: "Bart Ehrman, How Jesus Became God; Robert Funk, The Five Gospels; Raymond Brown, An Introduction to the New Testament; Burton Mack, The Lost Gospel",
    },
  },
];

/* ───────────────────────── Tab 3: Judaism ───────────────────────── */

const judaismTopics: Topic[] = [
  {
    id: "torah-corruption",
    name: "Torah Corruption",
    content: {
      intro:
        "The Quran affirms that the original Torah was divine revelation given to Moses. However, mainstream Biblical scholarship — including Jewish scholars — has demonstrated that the Torah as we have it today is a composite document compiled centuries after Moses, not a preserved original revelation.",
      verse: {
        arabic: "أَفَتَطْمَعُونَ أَن يُؤْمِنُوا۟ لَكُمْ وَقَدْ كَانَ فَرِيقٌ مِّنْهُمْ يَسْمَعُونَ كَلَـٰمَ ٱللَّهِ ثُمَّ يُحَرِّفُونَهُۥ مِنۢ بَعْدِ مَا عَقَلُوهُ وَهُمْ يَعْلَمُونَ",
        text: "Do you then hope that they would believe in you, when a group of them used to hear the words of Allah and then distort it after they had understood it, while they knew?",
        ref: "Quran 2:75",
      },
      points: [
        {
          title: "The Documentary Hypothesis — four authors, not one",
          detail:
            "Mainstream Biblical scholarship identifies at least four distinct literary sources in the Pentateuch: J (Yahwist), E (Elohist), D (Deuteronomist), and P (Priestly). These were composed by different authors over several centuries and compiled after the Babylonian exile (~500 BCE). This is not a fringe theory — it is the academic consensus taught at every major university and seminary, including Jewish ones.",
          note: "Richard Friedman, Who Wrote the Bible? (1987); Julius Wellhausen, Prolegomena to the History of Israel (1878)",
        },
        {
          title: "Moses did not write his own death",
          detail:
            "Deuteronomy 34 records the death, burial, and mourning of Moses — and adds 'no one knows his burial place to this day.' Moses obviously did not write this. The phrase 'to this day' implies significant time had passed. Even traditional Jewish commentators like Ibn Ezra acknowledged these anachronisms. The Torah contains numerous post-Mosaic references that betray later authorship.",
          note: "Deuteronomy 34:5-10; Genesis 36:31 references kings of Israel (post-Moses)",
        },
        {
          title: "Two contradictory creation accounts",
          detail:
            "Genesis 1 and Genesis 2 present different creation sequences: in Genesis 1, animals are created before humans; in Genesis 2, man is created before animals. In Genesis 1, male and female are created simultaneously; in Genesis 2, man is created first, then animals, then woman from his rib. These are from different source documents (P and J respectively), compiled by a later editor.",
          note: "Genesis 1:24-27 vs Genesis 2:7, 18-22",
        },
      ],
      source: "Quran 2:75; Quran 5:13; Richard Friedman, Who Wrote the Bible?",
    },
  },
  {
    id: "chosen-people",
    name: "Chosen People",
    content: {
      intro:
        "Judaism's claim that the Jews are God's 'chosen people' with a unique, exclusive covenant raises fundamental questions about God's justice and universality.",
      verse: {
        arabic: "إِنَّ أَكْرَمَكُمْ عِندَ ٱللَّهِ أَتْقَىٰكُمْ",
        text: "Indeed, the most noble of you in the sight of Allah is the most righteous of you.",
        ref: "Quran 49:13",
      },
      points: [
        {
          title: "Ethnic superiority contradicts divine justice",
          detail:
            "A just God does not favor one ethnic group over all of humanity based on lineage. Islam teaches that the only criterion that elevates a person before God is righteousness (taqwa) — not race, ethnicity, or ancestry. The Farewell Sermon declared: 'An Arab has no superiority over a non-Arab, nor a non-Arab over an Arab; a white has no superiority over a black, nor a black over a white — except by piety.'",
          note: "Musnad Ahmad 23489",
        },
        {
          title: "The covenant was conditional, not unconditional",
          detail:
            "Even in the Hebrew Bible, God's covenant with Israel was conditional on obedience: 'If you obey my voice and keep my covenant, you shall be my treasured possession' (Exodus 19:5). The Israelites repeatedly broke this covenant — worshipping the golden calf, killing prophets, corrupting the scripture. The Quran records these violations and explains that prophethood was transferred to the line of Ishmael through Muhammad.",
          note: "Exodus 19:5; Quran 2:83-86; Quran 5:70",
        },
        {
          title: "All nations received guidance",
          detail:
            "Islam's universal claim is more just: every nation received a messenger with the same message — worship God alone. The 25 prophets named in the Quran represent only a fraction of the 124,000 sent throughout history. God did not neglect 99.9% of humanity to focus on one tribe. The message was always universal; the final messenger was sent to all of mankind.",
          note: "Quran 35:24; Quran 34:28",
        },
      ],
      source: "Quran 49:13; Quran 35:24; Musnad Ahmad 23489; Exodus 19:5",
    },
  },
  {
    id: "prophecies-muhammad",
    name: "Prophecies of Muhammad",
    content: {
      intro:
        "The Hebrew Bible contains prophecies that, when examined objectively, point to the coming of Prophet Muhammad — from the Ishmaelite branch of Abraham's family.",
      points: [
        {
          title: "'A prophet like Moses from among their brothers'",
          detail:
            "Deuteronomy 18:18: 'I will raise up for them a prophet like you from among their brothers, and I will put my words in his mouth.' The 'brothers' of the Israelites are the Ishmaelites (descendants of Ishmael, Abraham's firstborn). Muhammad was an Ishmaelite. Like Moses, he was an unlettered leader who brought divine law, led his people out of persecution, established a nation, and commanded armies. Jesus does not fit this description — he brought no new law, led no nation, and commanded no army.",
          note: "Deuteronomy 18:18",
        },
        {
          title: "Isaiah's prophecy of the servant",
          detail:
            "Isaiah 42 describes a servant of God who will 'bring justice to the nations,' establish law, and not falter until he sets justice on earth. The passage mentions 'Kedar' (an Ishmaelite tribe in Arabia) and 'Sela' (identified with Madinah). This fits Muhammad far more precisely than Jesus, who did not establish a legal system or bring justice through governance.",
          note: "Isaiah 42:1-4, 11",
        },
        {
          title: "Song of Solomon 5:16 — 'Muhammadim'",
          detail:
            "In the Hebrew text of Song of Solomon 5:16, the word used is 'Muhammadim' (מחמדים) — literally 'Muhammad' with a Hebrew plural of respect. Christian translations render this as 'altogether lovely,' but the word itself is a proper noun form: Muhammad. While Christians dispute this interpretation, the linguistic connection is striking and acknowledged by Hebrew scholars.",
          note: "Song of Solomon 5:16 in Hebrew",
        },
        {
          title: "Jewish scholars who accepted Muhammad",
          detail:
            "Abdullah ibn Salam, one of the most learned Jewish scholars in Madinah, accepted Islam immediately upon meeting the Prophet, saying: 'I knew he was a prophet from the moment I saw his face — it was not the face of a liar.' Mukhayriq, a rabbi, fought alongside the Prophet at Uhud and bequeathed his wealth to the Muslim community. These scholars recognized in Muhammad the fulfillment of their own scriptures.",
          note: "Sunan at-Tirmidhi 3631; Ibn Hisham, Sirah",
        },
      ],
      source: "Deuteronomy 18:18; Isaiah 42:1-4; Song of Solomon 5:16; Sunan at-Tirmidhi 3631",
    },
  },
  {
    id: "talmud",
    name: "The Talmud",
    content: {
      intro:
        "Rabbinic Judaism is based not primarily on the Torah but on the Talmud — a vast body of oral traditions compiled centuries after Moses. The Talmud effectively replaced divine revelation with human rabbinic authority.",
      verse: {
        arabic: "فَوَيْلٌ لِّلَّذِينَ يَكْتُبُونَ ٱلْكِتَـٰبَ بِأَيْدِيهِمْ ثُمَّ يَقُولُونَ هَـٰذَا مِنْ عِندِ ٱللَّهِ",
        text: "So woe to those who write the scripture with their own hands, then say: This is from Allah.",
        ref: "Quran 2:79",
      },
      points: [
        {
          title: "Human traditions elevated above revelation",
          detail:
            "The Talmud — compiled between 200-500 CE — contains rabbinic discussions, legal rulings, and commentary that in practice supersedes the Torah itself. In disputes between the Torah and rabbinic opinion, the rabbinic opinion often prevails. The Talmud even records a story where God is 'overruled' by the rabbis (Bava Metzia 59b), and God laughs saying 'My children have defeated Me.' This elevates human reasoning above divine authority.",
          note: "Babylonian Talmud, Bava Metzia 59b",
        },
        {
          title: "Contradictions with the Torah",
          detail:
            "The Talmud sometimes contradicts the Torah's explicit commands. For example, the Torah prescribes 'an eye for an eye' (Exodus 21:24) — the Talmud reinterprets this as monetary compensation, effectively changing the law. While Islam also favors forgiveness, the principle is different: the Talmud claims authority to reinterpret God's explicit words, while Islam preserves the Quran's text unchanged and applies jurisprudence within its framework.",
        },
        {
          title: "This is exactly what the Quran warned about",
          detail:
            "The Quran describes precisely this phenomenon: people who 'write the scripture with their own hands, then say this is from Allah, to exchange it for a small price' (Quran 2:79). The Talmudization of Judaism — replacing divine revelation with human rabbinic authority — is the very corruption the Quran identifies and that Islam came to correct.",
          note: "Quran 2:79; Quran 3:78",
        },
      ],
      source: "Quran 2:79; Quran 3:78; Babylonian Talmud, Bava Metzia 59b",
    },
  },
];

/* ───────────────────────── Tab 4: Hinduism ───────────────────────── */

const hinduismTopics: Topic[] = [
  {
    id: "polytheism",
    name: "Polytheism & Idolatry",
    content: {
      intro:
        "Hinduism's most fundamental departure from truth is its polytheism and idol worship — practices that contradict reason, the Quran, and even the earliest layer of Hindu scripture itself.",
      verse: {
        arabic: "لَوْ كَانَ فِيهِمَآ ءَالِهَةٌ إِلَّا ٱللَّهُ لَفَسَدَتَا",
        text: "Had there been gods besides Allah in the heavens and the earth, both would have been ruined.",
        ref: "Quran 21:22",
      },
      points: [
        {
          title: "33 million gods — a logical impossibility",
          detail:
            "Hinduism recognizes an estimated 33 million deities (330 million in some traditions). Logically, if multiple gods existed, they would either conflict (causing cosmic chaos) or defer to one supreme being (making the others unnecessary). The Quran argues: 'Had there been gods besides Allah, both [heavens and earth] would have been ruined.' One all-powerful Creator is the simplest and most coherent explanation.",
          note: "Quran 21:22; Quran 23:91",
        },
        {
          title: "Abraham's timeless argument against idolatry",
          detail:
            "The Quran records Abraham asking his people: how can you worship what you carve with your own hands? He smashed their idols to prove they could not protect themselves — then asked: 'Do you worship what you yourselves carve, while Allah has created you and what you make?' Statues of stone, metal, or wood cannot hear, see, respond, or benefit the worshipper.",
          note: "Quran 21:52-67; Quran 37:91-96",
        },
        {
          title: "Early Vedic monotheism supports Islam's claim",
          detail:
            "The oldest layer of Hindu scripture — the Rig Veda — contains striking monotheistic passages: 'They call him Indra, Mitra, Varuna, Agni... the wise speak of the One Being in many ways' (Rig Veda 1.164.46). This may reflect the original monotheistic message brought by a prophet to that region — consistent with the Quran's claim that every nation received a messenger calling to the worship of one God.",
          note: "Quran 35:24 — 'There was no nation but that a warner had passed among them'",
        },
      ],
      source: "Quran 21:22, 52-67; Quran 23:91; Quran 35:24; Quran 37:91-96",
    },
  },
  {
    id: "caste-system",
    name: "The Caste System",
    content: {
      intro:
        "Hinduism's caste system represents one of history's most systematic forms of birth-based inequality — a system that contradicts any concept of a just Creator.",
      points: [
        {
          title: "Birth determines worth",
          detail:
            "The Manusmriti (Laws of Manu) codifies a hereditary caste system: Brahmins (priests), Kshatriyas (warriors), Vaishyas (merchants), and Shudras (servants). Below all four are the Dalits — 'untouchables' — who for millennia could not drink from the same wells, enter temples, or even let their shadow fall on a higher-caste person. A system where a child's worth is determined at birth contradicts any concept of divine justice.",
          note: "Manusmriti 1:87-91",
        },
        {
          title: "Islam abolished birth-based hierarchy",
          detail:
            "1,400 years ago, Islam declared: 'An Arab has no superiority over a non-Arab, nor a non-Arab over an Arab; a white has no superiority over a black, nor a black over a white — except by piety.' Bilal, a freed Ethiopian slave, was chosen as the first muezzin (caller to prayer). Salman al-Farisi, a Persian, was honored as one of the Prophet's closest companions. Islam's egalitarianism is not just theoretical — it was practiced from day one.",
          note: "Musnad Ahmad 23489; Quran 49:13",
        },
        {
          title: "Karma justifies oppression",
          detail:
            "The caste system is theologically justified by karma: a Dalit's suffering is 'deserved' because of sins in a past life. This creates a moral catastrophe — there is no obligation to help the oppressed because their oppression is 'cosmic justice.' Islam rejects this absolutely: every person is born sinless, suffering is a test not a punishment, and social justice is a religious obligation.",
        },
      ],
      source: "Quran 49:13; Musnad Ahmad 23489",
    },
  },
  {
    id: "reincarnation",
    name: "Reincarnation",
    content: {
      intro:
        "The doctrine of reincarnation (samsara) — that the soul is reborn into new bodies based on karma — is central to Hinduism. Yet it lacks evidence, creates moral problems, and contradicts the Islamic model of accountability.",
      points: [
        {
          title: "No empirical evidence",
          detail:
            "Despite thousands of years of belief, there is no verifiable empirical evidence for reincarnation. Anecdotal 'past life memories' have been repeatedly explained by psychologists through false memory syndrome, cryptomnesia, and suggestion. A belief this consequential should be supported by evidence, not tradition.",
        },
        {
          title: "No beginning, no accountability",
          detail:
            "If souls transmigrate eternally, when did the cycle begin? If there is no first life, there is no original free choice — the entire system is deterministic. Islam's model is coherent: one life, one death, one judgement. Each person has one opportunity to demonstrate faith and righteousness, creating genuine moral urgency.",
        },
        {
          title: "No preserved scripture to verify the claim",
          detail:
            "The Vedas were transmitted orally for over a millennium before being written down. Multiple recensions exist with textual variations. Unlike the Quran — which has an unbroken chain of preservation — there is no way to verify that modern Hindu teachings about reincarnation match what was originally revealed (if anything was originally revealed to that region).",
        },
      ],
      source: "Quran 67:2 — 'He who created death and life to test which of you is best in deed'",
    },
  },
];

/* ───────────────────────── Tab 5: Buddhism ───────────────────────── */

const buddhismTopics: Topic[] = [
  {
    id: "no-god",
    name: "No Creator God",
    content: {
      intro:
        "Buddhism's most fundamental problem is its silence on the most important question in philosophy: why does anything exist?",
      points: [
        {
          title: "The question Buddhism refuses to answer",
          detail:
            "The Buddha classified certain questions as 'unanswerable' (avyakata) — including the origin of the universe and the existence of God. But the most fundamental question a worldview must answer is: why does anything exist rather than nothing? Islam provides a clear, logical answer: an uncaused, eternal Creator brought everything into being. Avoiding the question does not resolve it.",
          note: "Quran 52:35-36 — 'Were they created by nothing, or were they themselves the creators?'",
        },
        {
          title: "The Buddha made no divine claims",
          detail:
            "Unlike Muhammad (who claimed to receive divine revelation) or Jesus (claimed by Christians to be God), the Buddha made no claims of divine authority. He presented himself as an enlightened teacher sharing personal discoveries. His teachings carry the weight of human wisdom — valuable, but not divine mandate. Islam offers something Buddhism cannot: direct communication from the Creator of the universe.",
        },
        {
          title: "Dependent origination doesn't explain ultimate origin",
          detail:
            "Buddhism's 'dependent origination' (pratityasamutpada) explains that everything arises from conditions. But this creates an infinite regress — what caused the first conditions? Without a first uncaused cause, the chain of causation has no foundation. The Kalam cosmological argument resolves this: the universe began to exist, therefore it has a cause — a cause that must be timeless, spaceless, and unimaginably powerful.",
        },
      ],
      source: "Quran 52:35-36",
    },
  },
  {
    id: "suffering-nirvana",
    name: "Suffering & Nirvana",
    content: {
      intro:
        "Buddhism's view that life is inherently suffering and that the goal is to extinguish the self contrasts sharply with Islam's purposeful, hopeful worldview.",
      verse: {
        arabic: "ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا",
        text: "He who created death and life to test which of you is best in deed.",
        ref: "Quran 67:2",
      },
      points: [
        {
          title: "Life is a test, not inherent suffering",
          detail:
            "The First Noble Truth — 'life is suffering' (dukkha) — declares existence itself to be a problem. Islam offers a more balanced view: life is a test containing both hardship and blessing. Suffering has meaning — it purifies, tests, and elevates. Joy and beauty exist because this world, though temporary, is a mercy from Allah. Buddhism's pessimism contrasts with Islam's purposeful optimism.",
        },
        {
          title: "Nirvana is extinction — Islam offers eternal life",
          detail:
            "Nirvana means the cessation of desire and the extinction of the individual self. Islam offers something incomparably more compelling: eternal life in Paradise, where believers enjoy Allah's pleasure, reunite with loved ones, and experience joy beyond imagination. The human desires for permanence, love, and meaning are not problems to be extinguished — they are fulfilled in the Hereafter.",
        },
        {
          title: "Purpose vs. purposelessness",
          detail:
            "In Buddhism, the goal is to escape the cycle of existence. In Islam, existence has a grand purpose: to know, worship, and draw near to the Creator. Life is meaningful, death is meaningful, and the Hereafter is the ultimate fulfillment. Islam provides answers where Buddhism provides escape.",
          note: "Quran 51:56 — 'I did not create jinn and mankind except to worship Me'",
        },
      ],
      source: "Quran 67:2; Quran 51:56",
    },
  },
  {
    id: "fragmentation",
    name: "Schools & Scripture",
    content: {
      intro:
        "Buddhism's internal fragmentation and late scripture compilation raise serious questions about whether modern Buddhist teachings reflect the Buddha's original message.",
      points: [
        {
          title: "Multiple contradictory schools",
          detail:
            "Buddhism split into fundamentally different branches: Theravada (no deities, individual liberation), Mahayana (quasi-divine Bodhisattvas, universal salvation), and Vajrayana (tantric practices, esoteric rituals). They disagree on whether the Buddha was a man or a cosmic being, whether salvation is individual or collective, and whether rituals matter. This fragmentation suggests human evolution of doctrine, not preserved divine guidance.",
        },
        {
          title: "Scripture written 400 years later",
          detail:
            "The Pali Canon was not written down until approximately 400 years after the Buddha's death, at the Fourth Buddhist Council in Sri Lanka. By this time, the oral tradition had already split into multiple schools with different versions of the Buddha's teachings. Compare this to the Quran — memorized by hundreds during the Prophet's lifetime, compiled within 20 years, and preserved identically to this day.",
        },
        {
          title: "No chain of transmission",
          detail:
            "Islam has the science of isnad — a verified chain of narrators from the Prophet to the present. Every hadith is graded by the reliability of its chain. Buddhism has no comparable system. We have no way to verify whether any specific teaching actually came from the Buddha or was attributed to him by later followers with their own theological agendas.",
        },
      ],
      source: "Quran 15:9 — 'Indeed, it is We who sent down the Reminder, and indeed, We will be its guardian'",
    },
  },
];

/* ───────────────────────── Tab 6: Sikhism ───────────────────────── */

const sikhismTopics: Topic[] = [
  {
    id: "syncretic-origin",
    name: "Syncretic Origins",
    content: {
      intro:
        "Sikhism emerged in the 15th century in Punjab — a region deeply influenced by both Islam and Hinduism. Its theology appears to be a synthesis of both traditions rather than an independent divine revelation.",
      points: [
        {
          title: "Islamic monotheism + Hindu reincarnation",
          detail:
            "Guru Nanak was born into a Hindu family in an area heavily influenced by Sufi Islam. Sikhism's theology combines Islamic monotheism (Ik Onkar — One God, no idols) with Hindu concepts (karma, reincarnation, maya). This combination suggests human synthesis rather than independent divine revelation. A true revelation from God would not mix truth with error — it would be internally consistent, as the Quran is.",
        },
        {
          title: "Relatively recent — 15th century",
          detail:
            "Sikhism emerged roughly 900 years after Islam, 2,000 years after Judaism, and 2,500 years after Hinduism. Islam claims to be the original religion of all humanity — every prophet from Adam taught the same core message, and Muhammad was the final messenger. Sikhism makes no such universal claim. It is historically and geographically bounded.",
        },
        {
          title: "Guru Granth Sahib is a compilation",
          detail:
            "The Sikh scripture contains writings from the Sikh Gurus alongside compositions from Hindu saints (Kabir, Ravidas, Namdev) and Muslim Sufis (Sheikh Farid). This is fundamentally different from the Quran, which claims to be the direct, unmediated word of God. A scripture that includes multiple human authors from different religious traditions cannot claim to be exclusively divine speech.",
        },
      ],
    },
  },
  {
    id: "close-but-incomplete",
    name: "Close but Incomplete",
    content: {
      intro:
        "Sikhism comes closer to Islam than most religions — particularly in its strict monotheism. But it remains incomplete, lacking key elements expected of a universal divine message.",
      points: [
        {
          title: "Monotheism without a complete framework",
          detail:
            "Sikhism's concept of God (Ik Onkar) is remarkably close to Islamic Tawhid — one God, formless, beyond human comprehension, no incarnation. But Sikhism lacks: a comprehensive legal framework (shariah), a chain of prophets connecting to a universal message, structured worship (like the five daily prayers), detailed eschatology (Day of Judgement, Paradise, Hellfire), and rules for society (economics, governance, warfare). It addresses spiritual matters but leaves much of life unguided.",
        },
        {
          title: "No prophetic chain",
          detail:
            "Islam connects its message to an unbroken chain of prophets from Adam to Muhammad — all teaching the same core theology. Sikhism has no such chain. It does not claim that Guru Nanak received revelation from the same God who sent Moses, Jesus, or Muhammad. Without this prophetic continuity, Sikhism is an isolated religious movement, not a universal message.",
        },
        {
          title: "No claim to be the original religion",
          detail:
            "Islam claims to be the original religion of all humanity — 'Islam' means submission to God, and every prophet submitted to God. Sikhism does not make this claim. It is culturally rooted in Punjab, with no prophetic tradition connecting it to the beginning of human history. A universal truth should be universal in its claim.",
        },
      ],
    },
  },
];

/* ───────────────────────── Tab 7: Atheism ───────────────────────── */

const atheismTopics: Topic[] = [
  {
    id: "cosmological",
    name: "Why Does Anything Exist?",
    content: {
      intro:
        "The most fundamental question in philosophy — why does anything exist rather than nothing? — demands an answer that atheism cannot provide.",
      verse: {
        arabic: "أَمْ خُلِقُوا۟ مِنْ غَيْرِ شَىْءٍ أَمْ هُمُ ٱلْخَـٰلِقُونَ",
        text: "Were they created by nothing, or were they themselves the creators?",
        ref: "Quran 52:35",
      },
      points: [
        {
          title: "The Kalam Cosmological Argument",
          detail:
            "Everything that begins to exist has a cause. The universe began to exist (confirmed by the Big Bang, the second law of thermodynamics, and the impossibility of an actual infinite regress). Therefore, the universe has a cause. This cause must be timeless, spaceless, immaterial, and unimaginably powerful — precisely what Islam describes as Allah.",
          note: "Quran 52:35-36",
        },
        {
          title: "Fine-tuning of the universe",
          detail:
            "The physical constants of the universe are calibrated with extraordinary precision. If the gravitational constant were altered by 1 in 10^60, life could not exist. The probability of this happening by chance is essentially zero. This points to an intelligent Designer, not blind chance. The 'multiverse' response is unfalsifiable speculation — not science.",
        },
        {
          title: "The universe is not eternal",
          detail:
            "Modern cosmology confirms the universe had a beginning — the Big Bang, approximately 13.8 billion years ago. Before this, there was no matter, no energy, no space, no time. Something brought it into existence from nothing. That 'something' must transcend space, time, and matter — it must be an uncaused, eternal, all-powerful Creator.",
        },
      ],
      source: "Quran 52:35-36",
    },
  },
  {
    id: "morality",
    name: "The Morality Problem",
    content: {
      intro:
        "Without God, there is no foundation for objective morality. Atheism cannot coherently say anything is truly 'right' or 'wrong' — only that humans have preferences.",
      points: [
        {
          title: "Objective morality requires a moral lawgiver",
          detail:
            "If God does not exist, then morality is merely a human invention — a matter of personal or cultural preference. But we intuitively know that torturing innocents is objectively wrong, not just personally distasteful. Objective moral values require a transcendent moral lawgiver. Without God, 'good' and 'evil' are just words with no ultimate meaning. Atheists live as if morality is objective while denying the only foundation for it.",
        },
        {
          title: "Evolution explains behavior, not morality",
          detail:
            "Some atheists argue that morality evolved for survival. But evolution explains why we have moral instincts — not whether those instincts are objectively true. Evolution could have produced beings who thrive through deception and violence. The fact that we recognize selflessness as 'good' and cruelty as 'evil' — even when they don't serve survival — points to a moral truth beyond biology.",
        },
        {
          title: "Atheist regimes — the historical record",
          detail:
            "The most atheistic regimes in history — the Soviet Union, Maoist China, Pol Pot's Cambodia — produced the worst atrocities of the 20th century. Without God, 'the strong do what they can and the weak suffer what they must.' This is not an argument from consequences — it is a demonstration of what happens when societies consistently apply atheistic materialism.",
        },
      ],
      source: "Quran 91:7-8 — 'By the soul and He who proportioned it, and inspired it with its wickedness and its righteousness'",
    },
  },
  {
    id: "consciousness",
    name: "Consciousness & Meaning",
    content: {
      intro:
        "Materialism — the view that only physical matter exists — cannot explain the most fundamental aspects of human experience: consciousness, free will, and the universal search for meaning.",
      verse: {
        arabic: "وَيَسْـَٔلُونَكَ عَنِ ٱلرُّوحِ ۖ قُلِ ٱلرُّوحُ مِنْ أَمْرِ رَبِّى",
        text: "And they ask you about the soul. Say: The soul is of the affair of my Lord.",
        ref: "Quran 17:85",
      },
      points: [
        {
          title: "The hard problem of consciousness",
          detail:
            "Why do physical brain processes produce subjective experience? Why does it feel like something to see red, taste chocolate, or hear music? This is the 'hard problem of consciousness' — and materialism has no answer. After decades of neuroscience, we are no closer to explaining why matter produces experience. Islam explains it: the soul (ruh) is from Allah, breathed into each human being, and it is the source of consciousness.",
          note: "Quran 17:85; Quran 15:29",
        },
        {
          title: "The universal search for meaning",
          detail:
            "Humans universally seek meaning, purpose, and transcendence. This is the fitrah — the innate disposition to seek God. The Prophet said every child is born upon the fitrah. Studies in cognitive science confirm that children naturally attribute design and purpose to the world. Atheism says this is an illusion. Islam says it is our deepest truth.",
          note: "Sahih al-Bukhari 1358; Sahih Muslim 2658",
        },
        {
          title: "Atheism leads logically to nihilism",
          detail:
            "If there is no God, no afterlife, no objective morality — then life has no inherent purpose, death is final, and nothing ultimately matters. This is nihilism. Most atheists reject nihilism because it contradicts their lived experience of meaning and love. But they are borrowing from a theistic worldview without acknowledging the loan. Islam provides what atheism cannot: genuine, grounded, eternal meaning.",
          note: "Quran 51:56 — 'I did not create jinn and mankind except to worship Me'",
        },
      ],
      source: "Quran 17:85; Quran 51:56; Sahih al-Bukhari 1358; Sahih Muslim 2658",
    },
  },
];

/* ───────────────────────── Tab 8: Common Questions ───────────────────────── */

const questionTopics: Topic[] = [
  {
    id: "suffering",
    name: "Why Do Muslims Suffer?",
    content: {
      intro:
        "One of the most common objections to God's existence is the problem of suffering. Islam provides the most satisfying and comprehensive answer to this question of any worldview.",
      verse: {
        arabic: "وَلَنَبْلُوَنَّكُم بِشَىْءٍۢ مِّنَ ٱلْخَوْفِ وَٱلْجُوعِ وَنَقْصٍۢ مِّنَ ٱلْأَمْوَ‌ٰلِ وَٱلْأَنفُسِ وَٱلثَّمَرَ‌ٰتِ ۗ وَبَشِّرِ ٱلصَّـٰبِرِينَ",
        text: "And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient.",
        ref: "Quran 2:155",
      },
      points: [
        {
          title: "This world is a test, not Paradise",
          detail:
            "Allah created life and death 'to test which of you is best in deed' (Quran 67:2). This world was never meant to be perfect — that is what Jannah is for. Hardship is part of the test. Expecting a world without suffering is expecting Paradise before earning it.",
          note: "Quran 67:2; Quran 29:2 — 'Do people think they will be left alone because they say we believe and not be tested?'",
        },
        {
          title: "Suffering purifies and elevates",
          detail:
            "The Prophet said: 'No fatigue, disease, sorrow, sadness, hurt, or distress befalls a Muslim — even the prick of a thorn — but that Allah expiates some of his sins thereby.' Suffering is not meaningless — it removes sins and elevates the believer's rank in the Hereafter.",
          note: "Sahih al-Bukhari 5641; Sahih Muslim 2573",
        },
        {
          title: "Patience is rewarded without limit",
          detail:
            "Allah says: 'Indeed, the patient will be given their reward without account' (Quran 39:10). Those who bear suffering with patience are among the most rewarded people in the Hereafter. The Prophets suffered the most — precisely because they were the most beloved to Allah.",
          note: "Quran 39:10; Sunan at-Tirmidhi 2398",
        },
        {
          title: "Justice comes on the Day of Judgement",
          detail:
            "In Islam, this world is not the place of final justice — the Hereafter is. Every act of oppression, every tear shed, every moment of pain will be compensated with perfect justice. No one will be wronged by even the weight of an atom. Atheism offers no such promise — suffering under atheism is truly meaningless.",
          note: "Quran 99:7-8; Quran 4:40",
        },
      ],
      source: "Quran 2:155-157; Quran 67:2; Sahih al-Bukhari 5641; Sahih Muslim 2573",
    },
  },
  {
    id: "violence",
    name: "What About Violence?",
    content: {
      intro:
        "Critics often selectively quote Quranic verses about fighting to portray Islam as inherently violent. This ignores the context, the Quran's overarching message, and the actual rules of engagement Islam prescribes.",
      verse: {
        arabic: "لَآ إِكْرَاهَ فِى ٱلدِّينِ ۖ قَد تَّبَيَّنَ ٱلرُّشْدُ مِنَ ٱلْغَىِّ",
        text: "There is no compulsion in religion. The right course has become distinct from the wrong.",
        ref: "Quran 2:256",
      },
      points: [
        {
          title: "Context is everything",
          detail:
            "Verses about fighting (e.g., Quran 9:5) were revealed in specific historical contexts — during active warfare against those who had broken treaties, persecuted Muslims, and driven them from their homes. Reading the verses before and after immediately clarifies the context. Quran 9:6, the very next verse, says: 'If any of the polytheists seeks your protection, then grant him protection so that he may hear the word of Allah.'",
          note: "Quran 9:5-6; Quran 2:190 — 'Fight those who fight you but do not transgress'",
        },
        {
          title: "Islam's rules of engagement",
          detail:
            "The Prophet established rules of war 1,400 years before the Geneva Conventions: no killing of women, children, elderly, or monks; no destroying trees, crops, or animals; no mutilation of bodies; no forced conversion; prisoners of war must be treated well. Abu Bakr's famous ten rules to his army are unparalleled in their era.",
          note: "Sahih al-Bukhari 3015; Sunan Abu Dawud 2614",
        },
        {
          title: "Compare: Violence in other scriptures",
          detail:
            "The Bible commands genocide: 'Now go and attack Amalek and utterly destroy all that they have; do not spare them, but kill both man and woman, infant and nursing child, ox and sheep, camel and donkey' (1 Samuel 15:3). The Bhagavad Gita's entire premise is Krishna convincing Arjuna to fight a war. Islam's verses on warfare are defensive and contextual — not blanket commands for perpetual violence.",
        },
        {
          title: "Historical record",
          detail:
            "When the Prophet conquered Makkah — the city that had tortured, killed, and expelled Muslims for 13 years — he declared a general amnesty. He forgave his worst enemies. Compare this to the Crusades, the Inquisition, the conquest of the Americas, or the partition of India. Islam's historical record of tolerance and coexistence far exceeds its critics' claims.",
          note: "Sahih al-Bukhari 4280-4281",
        },
      ],
      source: "Quran 2:190, 256; Quran 9:5-6; Sahih al-Bukhari 3015, 4280-4281; Sunan Abu Dawud 2614",
    },
  },
  {
    id: "women",
    name: "Women in Islam",
    content: {
      intro:
        "The Western narrative about women in Islam conflates cultural practices with Islamic teachings. When we examine what Islam actually says — from the Quran and authentic hadith — a very different picture emerges.",
      verse: {
        arabic: "وَلَهُنَّ مِثْلُ ٱلَّذِى عَلَيْهِنَّ بِٱلْمَعْرُوفِ",
        text: "And women have rights similar to those of men over them, in kindness.",
        ref: "Quran 2:228",
      },
      points: [
        {
          title: "Islam elevated women's status in the 7th century",
          detail:
            "Before Islam, baby girls were buried alive in Arabia. Islam abolished this, gave women the right to own property, inherit wealth, seek divorce, choose their husband, pursue education, and engage in business. Khadijah was a successful businesswoman; Aisha was one of the greatest scholars of hadith; Fatimah is honored as a leader of the women of Paradise.",
          note: "Quran 81:8-9 (condemning female infanticide); Quran 4:7 (women's inheritance)",
        },
        {
          title: "Hijab is empowerment, not oppression",
          detail:
            "The hijab is a command from Allah to preserve modesty and dignity. It liberates women from being judged by appearance and objectified. The Western insistence that women must show more skin to be 'free' is itself a form of social pressure. Muslim women who wear hijab exercise their right to define their identity on their own terms — by their intellect and character, not their appearance.",
          note: "Quran 33:59; Quran 24:31",
        },
        {
          title: "Distinguish culture from religion",
          detail:
            "Many practices attributed to Islam are actually cultural: honor killings, forced marriages, denial of education for girls — all of these are explicitly prohibited in Islam. The Taliban's ban on girls' education contradicts the Prophet's statement: 'Seeking knowledge is an obligation upon every Muslim' (male and female). Cultural distortions should not be confused with Islamic teachings.",
          note: "Sunan Ibn Majah 224",
        },
        {
          title: "The Prophet's example",
          detail:
            "The Prophet (peace be upon him) said: 'The best of you are those who are the best to their wives.' He helped with household chores, mended his own clothes, and consulted his wives on important matters. He never struck a woman. Aisha reported: 'The Messenger of Allah never struck anything with his hand — neither a woman nor a servant.'",
          note: "Sunan at-Tirmidhi 3895; Sahih Muslim 2328",
        },
      ],
      source: "Quran 2:228; Quran 4:7; Quran 24:31; Quran 33:59; Sunan at-Tirmidhi 3895; Sahih Muslim 2328; Sunan Ibn Majah 224",
    },
  },
  {
    id: "one-religion",
    name: "How Can One Religion Be Right?",
    content: {
      intro:
        "The claim that all religions are equally valid sounds tolerant, but it is logically untenable. Religions make mutually exclusive truth claims — they cannot all be correct. The question is not whether one religion can be right, but which one has the evidence.",
      points: [
        {
          title: "Islam is not 'one of many' — it is the original",
          detail:
            "Islam's claim is unique: it is not a new religion founded by Muhammad, but the restoration of the original monotheistic message taught by every prophet — Adam, Noah, Abraham, Moses, Jesus, and Muhammad (peace be upon them all). Islam means 'submission to God.' Every prophet submitted to God and called others to do the same. Muhammad was the final prophet who brought the final, preserved revelation.",
          note: "Quran 42:13 — 'He has ordained for you the same religion that He enjoined upon Noah, Abraham, Moses, and Jesus'",
        },
        {
          title: "Truth is not democratic",
          detail:
            "Mathematical truth does not change based on how many people believe it. Similarly, theological truth is not determined by popularity or cultural preference. If God exists (and the evidence strongly points to this), then He has a nature and has communicated with humanity. The question is: which communication is preserved and authentic? The Quran alone passes this test.",
        },
        {
          title: "Mutual exclusivity demands a choice",
          detail:
            "Christianity says Jesus is God; Islam says he is a prophet; Judaism rejects him as the Messiah. Hinduism accepts multiple gods; Islam insists on one. Buddhism denies a Creator; Islam affirms one. These positions are mutually exclusive — logically, they cannot all be true. Claiming 'all paths lead to God' ignores these fundamental contradictions.",
        },
        {
          title: "Evidence-based evaluation",
          detail:
            "We should evaluate religions the same way we evaluate any truth claim: by examining the evidence. Which scripture is preserved? Which contains fulfilled prophecies? Which is internally consistent? Which provides a complete system of life? On every criterion, the Quran and Islam stand apart. Faith should not be blind — it should be informed by evidence.",
        },
      ],
      source: "Quran 42:13; Quran 3:19 — 'Indeed, the religion in the sight of Allah is Islam'",
    },
  },
  {
    id: "never-heard",
    name: "People Who Never Heard",
    content: {
      intro:
        "A just God does not punish people for what they had no access to. Islam provides a clear and just answer to this question.",
      verse: {
        arabic: "وَمَا كُنَّا مُعَذِّبِينَ حَتَّىٰ نَبْعَثَ رَسُولًا",
        text: "And We would never punish until We had sent a messenger.",
        ref: "Quran 17:15",
      },
      points: [
        {
          title: "Allah does not punish without warning",
          detail:
            "The Quran explicitly states that Allah does not punish any people until He has sent them a messenger to convey the message. This is a fundamental principle of divine justice in Islam — no one is held accountable for a message they never received.",
          note: "Quran 17:15",
        },
        {
          title: "Every nation received guidance",
          detail:
            "The Quran states that every nation throughout history received a warner: 'There was no nation but that a warner had passed among them' (Quran 35:24). The 25 prophets named in the Quran are only a fraction — the Prophet said there were 124,000 prophets sent throughout human history to every corner of the world.",
          note: "Quran 35:24; Musnad Ahmad 21257",
        },
        {
          title: "Those who truly never received the message",
          detail:
            "Scholars hold that people who genuinely never received the message of Islam — those in remote areas, those with mental disabilities, children who died before maturity — will be tested by Allah on the Day of Judgement in a manner that is just. They are not automatically condemned. Allah's justice is perfect and absolute.",
          note: "Based on hadith in Musnad Ahmad; scholarly positions of Ibn Taymiyyah and others",
        },
        {
          title: "The burden is on those who received the message",
          detail:
            "The greater accountability falls on those who heard the message clearly and rejected it out of arrogance, not ignorance. In today's world, with the internet and global communication, the excuse of not having access to Islam is increasingly difficult to maintain. The question shifts from 'did you hear about Islam?' to 'did you sincerely investigate it?'",
        },
      ],
      source: "Quran 17:15; Quran 35:24; Musnad Ahmad 21257",
    },
  },
  {
    id: "man-made",
    name: "Is Religion Man-Made?",
    content: {
      intro:
        "The claim that religion is a human invention fails to account for the specific, verifiable evidence that the Quran presents. If the Quran were man-made, it would contain the errors, biases, and limitations of its supposed author.",
      verse: {
        arabic: "قُل لَّئِنِ ٱجْتَمَعَتِ ٱلْإِنسُ وَٱلْجِنُّ عَلَىٰٓ أَن يَأْتُوا۟ بِمِثْلِ هَـٰذَا ٱلْقُرْءَانِ لَا يَأْتُونَ بِمِثْلِهِۦ وَلَوْ كَانَ بَعْضُهُمْ لِبَعْضٍۢ ظَهِيرًا",
        text: "Say: If mankind and the jinn gathered together to produce the like of this Quran, they could not produce the like of it, even if they assisted each other.",
        ref: "Quran 17:88",
      },
      points: [
        {
          title: "An unlettered man could not have authored this",
          detail:
            "Muhammad (peace be upon him) could neither read nor write. He had no formal education, no library, no access to Biblical or scientific texts. Yet the Quran discusses embryology, cosmology, history, law, and theology with complete accuracy. The hypothesis that an unlettered 7th-century merchant independently composed the most influential text in human history — with zero errors — is far more extraordinary than the claim of divine revelation.",
          note: "Quran 7:157; Quran 29:48 — 'You did not recite before it any scripture, nor did you inscribe one with your right hand'",
        },
        {
          title: "The Quran corrects the Bible — how?",
          detail:
            "The Quran corrects specific errors found in the Bible while preserving what is accurate. For example, it correctly identifies the Egyptian ruler during Joseph's time as 'al-Aziz' (a title), not 'Pharaoh' — because the title 'Pharaoh' was not used until later dynasties. The Bible incorrectly uses 'Pharaoh' for Joseph's era. How would a 7th-century Arabian know this historical distinction?",
          note: "Quran 12:30 vs Genesis 41:1",
        },
        {
          title: "If man-made, where are the errors?",
          detail:
            "Every human text of comparable scope and length contains errors — factual, logical, or internal contradictions. The Quran has been scrutinized for 1,400 years by its enemies and critics. Despite this, no genuine contradiction or factual error has been identified. If it were man-made, this would be statistically impossible across 6,236 verses covering dozens of subjects.",
          note: "Quran 4:82",
        },
        {
          title: "The Quran's challenge remains open",
          detail:
            "The Quran challenges all of humanity to produce even one chapter like it (Quran 2:23). This challenge has stood for 1,400 years. Poets, scholars, and critics have tried and failed. No human text has ever issued such a challenge and maintained it for so long. This alone should give pause to anyone dismissing the Quran as man-made.",
          note: "Quran 2:23-24",
        },
      ],
      source: "Quran 17:88; Quran 7:157; Quran 4:82; Quran 2:23-24; Quran 29:48",
    },
  },
];

/* ───────────────────────── sections config ───────────────────────── */

const sections = [
  { key: "proofs", label: "Evidence for Islam" },
  { key: "christianity", label: "Christianity" },
  { key: "judaism", label: "Judaism" },
  { key: "hinduism", label: "Hinduism" },
  { key: "buddhism", label: "Buddhism" },
  { key: "sikhism", label: "Sikhism" },
  { key: "atheism", label: "Atheism" },
  { key: "questions", label: "Common Questions" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* ───────────────────────── sub-components ───────────────────────── */

function TopicInfoCard({ topic }: { topic: Topic }) {
  const hasVerse = topic.content.verse;
  return (
    <ContentCard>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-themed">{topic.name}</h2>
      </div>

      <p className="text-themed-muted text-sm leading-relaxed mb-5">
        {topic.content.intro}
      </p>

      {hasVerse && (
        <div
          className="rounded-lg p-4 mb-5"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <p className="text-lg font-arabic text-gold leading-loose mb-2 text-right">
            {topic.content.verse!.arabic}
          </p>
          <p className="text-themed text-sm italic">
            &ldquo;{topic.content.verse!.text}&rdquo;
          </p>
          <p className="text-xs text-themed-muted mt-2">
            {topic.content.verse!.ref}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {topic.content.points.map((point) => (
          <div
            key={point.title}
            className="rounded-lg p-4 border sidebar-border"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <h4 className="text-sm font-semibold text-themed mb-2">
              {point.title}
            </h4>
            <p className="text-themed-muted text-sm leading-relaxed">
              {point.detail}
            </p>
            {point.note && (
              <p className="text-xs text-gold/60 mt-2">{point.note}</p>
            )}
          </div>
        ))}
      </div>

      {topic.content.source && (
        <div className="mt-5 pt-4 border-t sidebar-border">
          <p className="text-xs text-themed-muted flex items-center gap-2">
            <BookOpen size={12} className="text-gold/60" />
            {topic.content.source}
          </p>
        </div>
      )}
    </ContentCard>
  );
}

function TopicSection({
  topics,
  activeId,
  setActiveId,
}: {
  topics: Topic[];
  activeId: string;
  setActiveId: (id: string) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      {/* Left — vertical pills (horizontal scrollable on mobile) */}
      <div className="flex flex-row md:flex-col gap-2 w-full md:w-48 shrink-0 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setActiveId(topic.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left ${
              activeId === topic.id
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-themed-muted hover:text-themed border sidebar-border"
            }`}
          >
            {topic.name}
          </button>
        ))}
      </div>

      {/* Right — content */}
      <div className="min-w-0 flex-1 w-full">
        <AnimatePresence mode="wait">
          {topics.map(
            (topic) =>
              activeId === topic.id && (
                <motion.div
                  key={topic.id}
                  id={`section-${topic.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <TopicInfoCard topic={topic} />
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

function WhyIslamContent() {
  const searchParams = useSearchParams();
  useScrollToSection();
  const [activeSection, setActiveSection] = useState<SectionKey>(
    (searchParams.get("tab") as SectionKey) || "proofs"
  );
  const sectionParam = searchParams.get("section");
  const [activeProof, setActiveProof] = useState(
    sectionParam && activeSection === "proofs" ? sectionParam : "preservation"
  );
  const [activeChristianity, setActiveChristianity] = useState(
    sectionParam && activeSection === "christianity" ? sectionParam : "trinity"
  );
  const [activeJudaism, setActiveJudaism] = useState(
    sectionParam && activeSection === "judaism" ? sectionParam : judaismTopics[0]?.id ?? ""
  );
  const [activeHinduism, setActiveHinduism] = useState(
    sectionParam && activeSection === "hinduism" ? sectionParam : hinduismTopics[0]?.id ?? ""
  );
  const [activeBuddhism, setActiveBuddhism] = useState(
    sectionParam && activeSection === "buddhism" ? sectionParam : buddhismTopics[0]?.id ?? ""
  );
  const [activeSikhism, setActiveSikhism] = useState(
    sectionParam && activeSection === "sikhism" ? sectionParam : sikhismTopics[0]?.id ?? ""
  );
  const [activeAtheism, setActiveAtheism] = useState(
    sectionParam && activeSection === "atheism" ? sectionParam : atheismTopics[0]?.id ?? ""
  );
  const [activeQuestion, setActiveQuestion] = useState(
    sectionParam && activeSection === "questions" ? sectionParam : "suffering"
  );
  const [search, setSearch] = useState("");

  const topicMatches = (t: Topic) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, t.name, t.content.intro, t.content.source,
      t.content.verse?.text, t.content.verse?.ref,
      ...t.content.points.map(p => p.title),
      ...t.content.points.map(p => p.detail),
      ...t.content.points.map(p => p.note ?? ""),
    );
  };

  const filteredProofs = useMemo(() => proofTopics.filter(topicMatches), [search]);
  const filteredChristianity = useMemo(() => christianityTopics.filter(topicMatches), [search]);
  const filteredJudaism = useMemo(() => judaismTopics.filter(topicMatches), [search]);
  const filteredHinduism = useMemo(() => hinduismTopics.filter(topicMatches), [search]);
  const filteredBuddhism = useMemo(() => buddhismTopics.filter(topicMatches), [search]);
  const filteredSikhism = useMemo(() => sikhismTopics.filter(topicMatches), [search]);
  const filteredAtheism = useMemo(() => atheismTopics.filter(topicMatches), [search]);
  const filteredQuestions = useMemo(() => questionTopics.filter(topicMatches), [search]);

  /* auto-select first visible topic when active is filtered out */
  useEffect(() => {
    if (filteredProofs.length && !filteredProofs.find(t => t.id === activeProof))
      setActiveProof(filteredProofs[0].id);
    if (filteredChristianity.length && !filteredChristianity.find(t => t.id === activeChristianity))
      setActiveChristianity(filteredChristianity[0].id);
    if (filteredJudaism.length && !filteredJudaism.find(t => t.id === activeJudaism))
      setActiveJudaism(filteredJudaism[0].id);
    if (filteredHinduism.length && !filteredHinduism.find(t => t.id === activeHinduism))
      setActiveHinduism(filteredHinduism[0].id);
    if (filteredBuddhism.length && !filteredBuddhism.find(t => t.id === activeBuddhism))
      setActiveBuddhism(filteredBuddhism[0].id);
    if (filteredSikhism.length && !filteredSikhism.find(t => t.id === activeSikhism))
      setActiveSikhism(filteredSikhism[0].id);
    if (filteredAtheism.length && !filteredAtheism.find(t => t.id === activeAtheism))
      setActiveAtheism(filteredAtheism[0].id);
    if (filteredQuestions.length && !filteredQuestions.find(t => t.id === activeQuestion))
      setActiveQuestion(filteredQuestions[0].id);
  }, [search, filteredProofs, filteredChristianity, filteredJudaism, filteredHinduism, filteredBuddhism, filteredSikhism, filteredAtheism, filteredQuestions]);

  return (
    <div>
      <PageHeader
        title="Why Islam?"
        titleAr="لماذا الإسلام؟"
        subtitle="Examining the evidence for Islam and comparing it against other worldviews — with authentic sources and logical reasoning."
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search topics, evidence, verses..." className="mb-6" />

      {/* Section navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === section.key
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-themed-muted hover:text-themed border sidebar-border"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Proofs ─── */}
        {activeSection === "proofs" && (
          <motion.div
            key="proofs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TopicSection
              topics={filteredProofs}
              activeId={activeProof}
              setActiveId={setActiveProof}
            />
          </motion.div>
        )}

        {/* ─── Christianity ─── */}
        {activeSection === "christianity" && (
          <motion.div
            key="christianity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TopicSection
              topics={filteredChristianity}
              activeId={activeChristianity}
              setActiveId={setActiveChristianity}
            />
          </motion.div>
        )}

        {/* ─── Judaism ─── */}
        {activeSection === "judaism" && (
          <motion.div
            key="judaism"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TopicSection
              topics={filteredJudaism}
              activeId={activeJudaism}
              setActiveId={setActiveJudaism}
            />
          </motion.div>
        )}

        {/* ─── Hinduism ─── */}
        {activeSection === "hinduism" && (
          <motion.div
            key="hinduism"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TopicSection
              topics={filteredHinduism}
              activeId={activeHinduism}
              setActiveId={setActiveHinduism}
            />
          </motion.div>
        )}

        {/* ─── Buddhism ─── */}
        {activeSection === "buddhism" && (
          <motion.div
            key="buddhism"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TopicSection
              topics={filteredBuddhism}
              activeId={activeBuddhism}
              setActiveId={setActiveBuddhism}
            />
          </motion.div>
        )}

        {/* ─── Sikhism ─── */}
        {activeSection === "sikhism" && (
          <motion.div
            key="sikhism"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TopicSection
              topics={filteredSikhism}
              activeId={activeSikhism}
              setActiveId={setActiveSikhism}
            />
          </motion.div>
        )}

        {/* ─── Atheism ─── */}
        {activeSection === "atheism" && (
          <motion.div
            key="atheism"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TopicSection
              topics={filteredAtheism}
              activeId={activeAtheism}
              setActiveId={setActiveAtheism}
            />
          </motion.div>
        )}

        {/* ─── Questions ─── */}
        {activeSection === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TopicSection
              topics={filteredQuestions}
              activeId={activeQuestion}
              setActiveId={setActiveQuestion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WhyIslamPage() {
  return (
    <Suspense>
      <WhyIslamContent />
    </Suspense>
  );
}
