"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import SubTabLayout from "@hidden-hiqmah/ui/components/SubTabLayout";
import TopicInfoCard, { type Topic } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";

/* ───────────────────────── Evidence for Islam ───────────────────────── */

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
          note: "Bukhari 66:8-9",
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
      source: "Quran 15:9; Bukhari 66:8-9",
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
      source: "Quran 112:1-4; Quran 4:171; Quran 21:25; Quran 21:52-67",
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
          note: "Muslim 1:1; Bukhari 2:43 (Hadith of Jibril)",
        },
        {
          title: "The conquest of Constantinople",
          detail:
            "The Prophet ﷺ specifically named Constantinople as a city the Muslims would conquer. This was fulfilled in 1453 CE — over 800 years later — when Sultan Mehmed II conquered the city, ending the Byzantine Empire. Multiple authentic narrations confirm this prophecy.",
          note: "Muslim 54:44; Tirmidhi 33:82",
        },
        {
          title: "The conquest of Persia and Rome",
          detail:
            "During the Battle of Al-Khandaq — when the Muslims were besieged, starving, and outnumbered — the Prophet ﷺ prophesied the fall of both the Persian and Roman Empires. He said: 'When Kisra perishes, there will be no Kisra after him. And when Caesar perishes, there will be no Caesar after him.' Within a decade of his passing, both empires had fallen to the Muslim armies.",
          note: "Bukhari 57:29; Muslim 54:92",
        },
        {
          title: "The Muslim conquest of Jerusalem",
          detail:
            "The Prophet ﷺ foretold the conquest of Jerusalem (Bayt al-Maqdis). This was fulfilled during the caliphate of Umar ibn al-Khattab in 637 CE, when Umar personally traveled to Jerusalem to accept its surrender and guaranteed the safety of its Christian inhabitants in the Pact of Umar.",
          note: "Bukhari 58:18",
        },
        {
          title: "A fire from Hijaz visible from Busra",
          detail:
            "The Prophet ﷺ said: 'The Hour will not come until a fire emerges from the land of Hijaz that will illuminate the necks of camels in Busra (Syria).' In 654 AH (1256 CE), a massive volcanic eruption occurred east of Medina. Contemporary historians documented that the light was visible from great distances, with reports reaching as far as Syria.",
          note: "Bukhari 92:65; Muslim 54:55",
        },
        {
          title: "The Mongol siege and destruction of Baghdad",
          detail:
            "The Prophet ﷺ warned that Muslims would fight a people 'whose faces are like hammered shields' with small eyes and flat noses, who wear shoes made of hair. In 1258 CE, the Mongol army under Hulagu Khan — matching this description exactly — sacked Baghdad, the capital of the Abbasid Caliphate, killing an estimated 200,000 to over a million people, destroying the House of Wisdom, and ending the Islamic Golden Age.",
          note: "Muslim 54:76; Bukhari 56:141",
        },
        {
          title: "The prevalence of interest-based transactions",
          detail:
            "The Prophet ﷺ said: 'There will come a time when there will be no one left who does not consume riba (usury/interest), and whoever does not consume it will nevertheless be affected by its residue.' Today, the entire global financial system is built on interest — mortgages, credit cards, student loans, government bonds. It is virtually impossible to live without encountering interest-based transactions.",
          note: "Nasai 44:7 (graded sahih); Abu Dawud 23:6",
        },
        {
          title: "Time passing quickly",
          detail:
            "The Prophet ﷺ said: 'The Hour will not come until time contracts — a year will be like a month, a month like a week, a week like a day, a day like an hour.' With modern technology, social media, and the pace of life, people universally report that time feels like it is accelerating.",
          note: "Tirmidhi 36:29; Musnad Ahmad",
        },
        {
          title: "Music and entertainment becoming widespread",
          detail:
            "The Prophet ﷺ said: 'There will be people from my Ummah who will consider illegal sexual intercourse, silk (for men), alcohol, and musical instruments as lawful.' The modern entertainment industry — worth trillions — has made music and these vices a central part of daily life globally.",
          note: "Bukhari 74:16",
        },
        {
          title: "Muslims will be numerous but weak",
          detail:
            "The Prophet ﷺ said: 'The nations will soon summon one another to attack you, as people invite others to share a dish of food.' Someone asked: 'Will that be because of our small numbers?' He said: 'No, you will be numerous, but you will be like the foam on a flood.' Today, there are nearly 2 billion Muslims, yet the Muslim world remains largely divided and powerless on the global stage.",
          note: "Abu Dawud 39:7",
        },
        {
          title: "No comparable prophetic track record exists",
          detail:
            "Biblical prophecies are often vague, retroactively interpreted, or unfulfilled. Nostradamus's quatrains are deliberately ambiguous. Hindu and Buddhist texts do not contain specific, dated, verifiable predictions. Muhammad's prophecies are specific, recorded in authenticated chains of transmission, and verifiably fulfilled.",
        },
      ],
      source: "Muslim 1:1; Bukhari 2:43; Bukhari 92:65; Tirmidhi 33:82; Tirmidhi 36:29; Nasai 44:7; Abu Dawud 39:7",
    },
  },
  {
    id: "prophet-character",
    name: "The Prophet Himself",
    content: {
      intro:
        "The Evidence tab argues from the book — but the man who delivered it is evidence in his own right. Before examining a single verse, ask the question a Byzantine emperor asked in 628 CE: what kind of man was this? His enemies' own answers — recorded in the most rigorously authenticated sources — leave only one credible explanation.",
      verse: {
        arabic: "وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ",
        text: "Indeed, you are of a great moral character.",
        ref: "Quran 68:4",
      },
      points: [
        {
          title: "Trusted before he was believed",
          detail:
            "For forty years before claiming prophethood, Muhammad ﷺ lived among the Quraysh with a reputation for honesty so established that the seerah literature records them calling him al-Amin — the Trustworthy. That reputation was put on the record by his opponents themselves: when he climbed Mount Safa and asked the assembled tribes, 'If I inform you that cavalrymen are proceeding up the side of this mountain, will you believe me?' they answered, 'We have never heard you telling a lie.' Only then did he deliver his warning — and they rejected the message without ever being able to attack the messenger's honesty.",
          note: "Bukhari 65:493",
        },
        {
          title: "A Byzantine emperor ran the analysis",
          detail:
            "In 628 CE, Emperor Heraclius summoned Abu Sufyan — then still the Prophet's enemy and the leader of Quraysh — and cross-examined him: Is he from a noble family? Did anyone claim prophethood before him? Was he ever accused of lying? Does he break treaties? Do his followers abandon him? Abu Sufyan later admitted he would have lied if he could. From the answers, Heraclius reasoned point by point: 'I wondered how a person who does not tell a lie about others could ever tell a lie about Allah' — and concluded, 'If what you have said is true, he will very soon occupy this place underneath my feet.' A hostile witness, examined by a neutral head of state, produced this page's argument thirteen centuries early.",
          note: "Bukhari 1:7 — the full Heraclius interrogation",
        },
        {
          title: "Liar, deluded, or truthful — the trilemma",
          detail:
            "Only three explanations exist for a man who claims revelation: he lied, he was deluded, or he told the truth. The liar hypothesis collapses on the record above — a man who never lied about people for forty years does not begin, at that age, by lying about God, and liars fold under persecution rather than endure boycott, exile, and war for a claim that earned them nothing. The delusion hypothesis collapses on the output: the Quran's legal precision, historical accuracy, and internal consistency over 23 years (Quran 4:82) are not the products of disordered thinking. What remains is the explanation his own scripture gives — and the one Heraclius reached from enemy testimony alone.",
        },
        {
          title: "He gained nothing worldly — and died in debt",
          detail:
            "False prophets take wealth and power. Muhammad ﷺ ruled all of Arabia at the end of his life, yet Aisha reported that he 'died while his (iron) armor was mortgaged to a Jew for thirty Sas of barley.' She also described his household to her nephew Urwa: 'We used to see three crescents in two months, and no fire used to be made in the houses of Allah's Messenger' — the family survived on 'the two black things i.e. dates and water.' Every incentive that explains an impostor — money, luxury, dynastic ambition — is absent. He distributed what came to him and kept nothing.",
          note: "Bukhari 56:129; Bukhari 81:48",
        },
      ],
      source: "Quran 68:4; Bukhari 1:7; Bukhari 65:493; Bukhari 56:129; Bukhari 81:48",
    },
  },
  {
    id: "miracles",
    name: "Miracles of the Prophet",
    content: {
      intro:
        "Beyond the Quran itself, the Prophet Muhammad ﷺ performed physical miracles witnessed not by one or two followers in private, but by crowds — believers and enemies alike — and transmitted through the same authenticated chains that preserve the rest of his words. These are not later legends; they sit in the most rigorously verified collections Islam possesses.",
      verse: {
        arabic: "ٱقْتَرَبَتِ ٱلسَّاعَةُ وَٱنشَقَّ ٱلْقَمَرُ",
        text: "The Hour has drawn near and the moon has split asunder.",
        ref: "Quran 54:1",
      },
      points: [
        {
          title: "The splitting of the moon — demanded by his enemies",
          detail:
            "The people of Mecca themselves asked the Prophet ﷺ to show them a miracle — 'So he showed them the moon split in two halves between which they saw the Hira' mountain.' Ibn Masud narrated that when it happened, the Prophet ﷺ said: 'Bear witness (to this).' The Quran memorializes the event and the reaction of those who saw it and still refused: 'Whenever they see a sign, they turn away and say: Same old magic!' (Quran 54:2). They did not deny seeing it — they could only relabel it.",
          note: "Bukhari 63:93; Bukhari 61:140; Quran 54:1-2",
        },
        {
          title: "Water flowing from between his fingers",
          detail:
            "At al-Hudaybiyyah the entire company ran out of water. The Prophet ﷺ placed his hand into the one vessel that remained, 'and the water started spouting out between his fingers like springs' — the whole army drank and made ablution. Asked how many they were, Jabir answered: 'Even if we had been one hundred thousand, that water would have been sufficient for us.' On another occasion at az-Zaura in Medina, about three hundred companions performed ablution from water flowing from his fingers. This miracle was public, repeated, and narrated by multiple companions.",
          note: "Bukhari 64:196; Muslim 43:6",
        },
        {
          title: "A few loaves feeding seventy or eighty men",
          detail:
            "When Abu Talha noticed feebleness in the Prophet's ﷺ voice and recognized it as hunger, he asked Umm Sulaim for food, and she sent the Prophet ﷺ a few loaves of barley bread. He arrived with the people of the mosque, had the bread broken into pieces, prayed over it, and admitted the men ten at a time — each group 'ate their fill and went out' — until seventy or eighty men had eaten from bread meant for one.",
          note: "Bukhari 61:87",
        },
        {
          title: "The tree trunk that wept",
          detail:
            "The Prophet ﷺ used to deliver his sermons leaning on a date-palm trunk in the mosque. When a pulpit was built and he moved to it, 'the trunk started crying and the Prophet ﷺ went to it, rubbing his hand over it (to stop its crying)' — witnessed by the congregation of the mosque and narrated by Ibn Umar.",
          note: "Bukhari 61:92",
        },
        {
          title: "Why the mass testimony matters",
          detail:
            "A private vision can be claimed by anyone; a crowd cannot be retrofitted. These events were witnessed by hundreds at once — hostile Meccans at the moon-splitting, a whole army at al-Hudaybiyyah, the mosque congregation at the pulpit — and reached us through the isnad system's named, vetted chains (see the Hadith Science topic). No comparable body of mass-witnessed, chain-authenticated miracle reports exists for any other religious founder.",
        },
      ],
      source: "Quran 54:1-2; Bukhari 63:93; Bukhari 61:140; Bukhari 64:196; Muslim 43:6; Bukhari 61:87; Bukhari 61:92",
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
          title: "The one man who took up the challenge became a punchline",
          detail:
            "Musaylimah of Yamamah claimed prophethood in the Prophet's own lifetime and produced imitation 'revelations' to rival the Quran. Classical historians preserved samples of his verses precisely because contemporaries found them so embarrassingly bad — sing-song lines about frogs and kneading dough that Arabs quoted for laughs. He commanded an army and had every worldly incentive to succeed, yet the language itself defeated him: history remembers him as 'Musaylimah the Liar.' (A note of honesty: popular word-count claims — 'day' appearing 365 times, 'month' 12 times — depend on which word-forms you count and were never part of the classical case. The argument the Quraysh actually faced, and failed, was literary.)",
          note: "Musaylimah's imitations are preserved in classical history and tafsir works; the word-count caveat reflects standard scholarly critique of popular numerology",
        },
        {
          title: "Ring composition — structure discovered 14 centuries later",
          detail:
            "Modern literary analysis has shown that Surah al-Baqarah — 286 verses revealed piecemeal over roughly nine years, addressing events as they happened — forms a precise symmetric ring: its opening themes mirror its closing themes, its second section mirrors its second-to-last, and so on inward. At the surah's literal midpoint sits verse 2:143 — 'Thus We made you a balanced nation' — the verse announcing the change of prayer direction, the pivot of the Muslim community itself placed at the pivot of the text. A human author improvising responses to unfolding events over nine years does not produce concentric symmetry only visible once the whole is laid out.",
          note: "Raymond Farrin, Structure and Qur'anic Interpretation (2014)",
        },
        {
          title: "The masters of the craft went silent",
          detail:
            "Pre-Islamic Arabia's highest art was poetry — its greatest odes, the Mu'allaqat, were honored at the Kaaba itself. Labid ibn Rabi'ah, author of one of those odes, accepted Islam and is famously reported to have essentially stopped composing, indicating that the Quran had taken poetry's place. The generation best equipped in history to beat the Quran's challenge — native masters of its exact medium, many of them its enemies — either failed, converted, or fell silent.",
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
          note: "Ahmad 23489",
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
      source: "Quran 49:13; Quran 4:7; Quran 4:19; Ahmad 23489",
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
  {
    id: "seekers-stories",
    name: "Seekers Who Found Islam",
    content: {
      intro:
        "Argument convinces the mind; stories move the person. From the first generation onward, Islam's most striking converts were not the credulous but the best-informed — a rabbi, a Persian truth-seeker who crossed empires, and a Christian king. Each examined the claim from inside another tradition, and each recognized what he found.",
      verse: {
        arabic: "قُلْ أَرَءَيْتُمْ إِن كَانَ مِنْ عِندِ ٱللَّهِ وَكَفَرْتُم بِهِۦ وَشَهِدَ شَاهِدٌ مِّنۢ بَنِىٓ إِسْرَٰٓءِيلَ عَلَىٰ مِثْلِهِۦ فَـَٔامَنَ وَٱسْتَكْبَرْتُمْ ۖ إِنَّ ٱللَّهَ لَا يَهْدِى ٱلْقَوْمَ ٱلظَّـٰلِمِينَ",
        text: "Say, “What do you think, if this [Qur’an] is really from Allah and yet you reject it, and a witness from the Children of Israel has testified in its favor and believed, whereas you persist in arrogance? Indeed, Allah does not guide the wrongdoing people.”",
        ref: "Quran 46:10",
      },
      points: [
        {
          title: "Abdullah ibn Salam — the rabbi who tested him",
          detail:
            "Madinah's most learned Jewish scholar did not convert on emotion — he ran a test. He came to the newly arrived Prophet with 'three things which nobody knows except a prophet' and accepted Islam when the answers matched. His first impression is equally telling: 'When I gazed upon the face of the Messenger of Allah, I knew that this face was not the face of a liar' — and the first sermon he heard was simply: spread peace, feed people, pray at night. Sa'd ibn Abi Waqqas later said he never heard the Prophet ﷺ declare of anyone walking the earth that he was from the people of Paradise 'except Abdullah bin Salam' — and the verse about 'a witness from the Children of Israel' was understood to be about him.",
          note: "Bukhari 60:4; Tirmidhi 37:71; Bukhari 63:37; Quran 46:10",
        },
        {
          title: "Salman al-Farisi — the seeker's journey",
          detail:
            "Salman's search is the template for every seeker on this page. Born in Persia — he says in Bukhari, 'I am from Ram-Hurmuz' — he left the religion of his fathers, attached himself to Christian teachers, and, as the classical seerah literature recounts, was directed by the last of them toward a coming prophet in a land of date palms. Betrayed and sold into slavery on the way — Bukhari records he 'was sold (as a slave) by one master to another' more than ten times — he reached Madinah in bondage, checked the signs he had been given, and embraced Islam. A man who personally examined Zoroastrianism and Christianity before Islam chose it with his eyes open — and paid for the search with his freedom.",
          note: "Bukhari 63:170; Bukhari 63:171; the full journey is recounted in the classical seerah literature",
        },
        {
          title: "The Negus — the king who wept",
          detail:
            "When persecuted Muslims fled to Abyssinia, its Christian king heard the Quran's account of Jesus and Mary from Ja'far ibn Abi Talib and, as the seerah recounts, wept and protected them against Makkah's extradition demands. What the strongest sources record is the ending: years later the Prophet ﷺ announced in Madinah, 'Today a pious man from Ethiopia (i.e. An Najashi) has expired, come on to offer the funeral prayer' — and prayed the funeral prayer for him in absentia. Classical commentators read Quran 5:83 — 'you see their eyes overflowing with tears because of recognizing the truth' — in connection with such Christians who recognized what they heard.",
          note: "Bukhari 23:77; Bukhari 23:8; Quran 5:83",
        },
        {
          title: "The road is still walked",
          detail:
            "These journeys did not end in the 7th century. Every year, people from every background — clergy, scientists, skeptics, and the simply curious — study Islam to refute it or explain it away, and end up embracing it. Their reasons are the very topics of this tab: a preserved book, a coherent theology, a prophet whose life withstands scrutiny. If you have read this far, you are already on the same road Salman walked. The difference is that his search took decades and cost him his freedom; yours can start with the next tab.",
        },
      ],
      source: "Quran 46:10; Quran 5:83; Bukhari 60:4; Bukhari 63:37; Bukhari 63:170; Bukhari 23:8; Bukhari 23:77; Tirmidhi 37:71",
    },
  },
];

/* ───────────────────────── Worldviews · Christianity ───────────────────────── */

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

/* ───────────────────────── Worldviews · Judaism ───────────────────────── */

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
          note: "Ahmad 23489",
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
      source: "Quran 49:13; Quran 35:24; Ahmad 23489; Exodus 19:5",
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
          note: "Tirmidhi 37:71; Ibn Hisham, Sirah",
        },
      ],
      source: "Deuteronomy 18:18; Isaiah 42:1-4; Song of Solomon 5:16; Tirmidhi 37:71",
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

/* ───────────────────────── Worldviews · Hinduism ───────────────────────── */

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
      source: "Quran 21:22; Quran 21:52-67; Quran 23:91; Quran 35:24; Quran 37:91-96",
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
          note: "Ahmad 23489; Quran 49:13",
        },
        {
          title: "Karma justifies oppression",
          detail:
            "The caste system is theologically justified by karma: a Dalit's suffering is 'deserved' because of sins in a past life. This creates a moral catastrophe — there is no obligation to help the oppressed because their oppression is 'cosmic justice.' Islam rejects this absolutely: every person is born sinless, suffering is a test not a punishment, and social justice is a religious obligation.",
        },
      ],
      source: "Quran 49:13; Ahmad 23489",
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

/* ───────────────────────── Worldviews · Buddhism ───────────────────────── */

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

/* ───────────────────────── Worldviews · Sikhism ───────────────────────── */

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

/* ───────────────────────── Worldviews · Agnosticism & Deism ───────────────────────── */

const agnosticismTopics: Topic[] = [
  {
    id: "creator-not-enough",
    name: "A Creator, But No Religion?",
    content: {
      intro:
        "“I believe in something — a higher power — just not organized religion.” This is the most common worldview among the people reading this page. The Quran takes it seriously — because it is exactly where 7th-century Makkah stood. The pagans of Arabia were not atheists; they affirmed a supreme Creator. The Quran's argument to them is its argument to the modern deist: acknowledging the Creator is the beginning, not the destination.",
      verse: {
        arabic: "وَلَئِن سَأَلْتَهُم مَّنْ خَلَقَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ لَيَقُولُنَّ ٱللَّهُ ۚ قُلِ ٱلْحَمْدُ لِلَّهِ ۚ بَلْ أَكْثَرُهُمْ لَا يَعْلَمُونَ",
        text: "If you ask them who created the heavens and earth, they will surely say, “Allah.” Say, “All praise is for Allah.” Yet most of them do not understand.",
        ref: "Quran 31:25",
      },
      points: [
        {
          title: "The Quran's original audience was 'spiritual but not religious'",
          detail:
            "Three times the Quran makes the same observation about the Makkan pagans: 'If you ask them who created the heavens and earth and subjected the sun and moon, they will surely say, “Allah.” How are they then deluded?' (29:61); 'If you ask them who created them, they will surely say, “Allah”' (43:87). They believed in the supreme Creator — they simply would not let that belief change how they lived and worshipped. The Quran's critique is not aimed at atheism; it is aimed at believing in the Creator and stopping there.",
          note: "Quran 29:61; Quran 31:25; Quran 43:87",
        },
        {
          title: "Deism is a conclusion without its consequences",
          detail:
            "The deist grants the decisive premise: an intelligent Creator brought this universe into being with evident order and purpose. But a conclusion that big cannot be inert. If a Being created you deliberately, then what that Being wants from you is the most practically urgent question that exists — your origin, your purpose, and what follows death all hang on it. 'Higher power, no religion' treats the most consequential fact in reality as if it had no consequences. That is not neutrality; it is stopping the investigation one step before it becomes personally costly.",
        },
        {
          title: "The Creator you already accept describes Himself",
          detail:
            "The gap between 'something is out there' and 'God has spoken' is bridged the same way any claim is settled: by examining the evidence. Islam's claim is testable — a book whose preservation, consistency, and content can be checked (see the Evidence tab). The Quran even names the moment the deist is standing in: 'We will show them Our signs in the universe and in their own selves until it becomes clear to them that this [Qur’an] is the truth' (41:53). If the signs in the universe were enough to convince you a Creator exists, the same standard of evidence applied to revelation is the honest next step.",
          note: "Quran 41:53",
        },
      ],
      source: "Quran 29:61; Quran 31:25; Quran 43:87; Quran 41:53",
    },
  },
  {
    id: "silent-creator",
    name: "Would God Stay Silent?",
    content: {
      intro:
        "The deist's picture is a Creator who builds a universe of staggering precision, places conscious moral beings inside it — and then never says a word to them. Islam's counter-argument is simple: silence is exactly what a wise Creator would not do.",
      points: [
        {
          title: "A wise Creator communicates",
          detail:
            "A being powerful enough to fine-tune physical constants and author the genetic code is not incapable of communication — so if He is silent, He is either indifferent or withholding. But indifference contradicts the evident care in creation: a world provisioned for life, and creatures endowed with reason, conscience, and an unshakeable hunger for meaning. Giving beings the capacity to ask 'why am I here?' while making the answer unknowable would be pointless cruelty from a wise Creator. The expectation that God has spoken is not wishful thinking — it follows from the same design inference the deist already accepts.",
        },
        {
          title: "The claim: no nation was left without a messenger",
          detail:
            "Islam's account matches that expectation precisely: 'Indeed, We sent to every community a messenger, [saying], “Worship Allah and shun false gods”' (16:36). Prophets are the communication channel — humans chosen to deliver, embody, and demonstrate the message. This is also why revelation, not private intuition, is the medium: a public message through a verifiable messenger can be tested, transmitted, and preserved. A private hunch cannot.",
          note: "Quran 16:36",
        },
        {
          title: "Communication is also fairness",
          detail:
            "The Quran ties revelation to divine justice: 'These messengers were sent as bearers of glad tidings and as warners, so that the people may have no excuse before Allah after [the coming of] the messengers' (4:165). If humans are accountable, they must first be informed — a judge who never published the law could not justly enforce it. The deist's silent God, who will either judge people by rules He never disclosed or not judge at all, is less coherent — and less just — than the God who speaks.",
          note: "Quran 4:165",
        },
      ],
      source: "Quran 16:36; Quran 4:165",
    },
  },
  {
    id: "test-revelation",
    name: "How to Test a Revelation",
    content: {
      intro:
        "'Fine — but every religion claims revelation. How would I know which one is real?' That is the right question, and it has a rational answer: treat claimed revelations the way you treat any competing claims — set criteria in advance and apply them evenly.",
      points: [
        {
          title: "Criterion 1 — Is it preserved?",
          detail:
            "A message from God is worthless to you if you cannot access what was actually sent. So the first filter is textual: does the scripture exist today as it was delivered, with a demonstrable chain of transmission? Most candidates fall at this first hurdle — anonymous authors, centuries-late compilation, and manuscript traditions full of variants (see Scripture Preservation in the Evidence tab). The Quran's letter-for-letter preservation, oral and written, is precisely the property a genuine revelation would need — and it is the property the Quran uniquely claims and demonstrates.",
        },
        {
          title: "Criterion 2 — Does it survive hostile scrutiny?",
          detail:
            "A real revelation should invite examination rather than forbid it — and it should hold up. The Quran issues both challenges itself: find a contradiction ('If it had been from anyone other than Allah, they would have surely found in it many discrepancies' — 4:82), or produce a comparable chapter (2:23). Fourteen centuries of motivated critics have had both standing challenges. A text that dares its enemies to falsify it, and remains unfalsified, behaves exactly as a divine message would.",
          note: "Quran 4:82; Quran 2:23",
        },
        {
          title: "Criterion 3 — Does the messenger check out?",
          detail:
            "Examine the man who carried the claim: his honesty before the claim, what the claim cost him, and what he gained. By enemy testimony Muhammad ﷺ was never accused of lying before his mission, endured persecution for it, and died with his armor pawned for barley (see 'The Prophet Himself' in the Evidence tab). Then examine the message's fit with what you already accept: one God, no idols, no intermediaries — the pure monotheism the deist position already gravitates toward. Apply these three criteria to every claimed revelation on earth, evenly. Islam is the invitation to run exactly that test.",
        },
      ],
      source: "Quran 4:82; Quran 2:23",
    },
  },
];

/* ───────────────────────── Worldviews · Atheism ───────────────────────── */

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
          note: "Bukhari 23:112; Muslim 46:11",
        },
        {
          title: "Atheism leads logically to nihilism",
          detail:
            "If there is no God, no afterlife, no objective morality — then life has no inherent purpose, death is final, and nothing ultimately matters. This is nihilism. Most atheists reject nihilism because it contradicts their lived experience of meaning and love. But they are borrowing from a theistic worldview without acknowledging the loan. Islam provides what atheism cannot: genuine, grounded, eternal meaning.",
          note: "Quran 51:56 — 'I did not create jinn and mankind except to worship Me'",
        },
      ],
      source: "Quran 17:85; Quran 51:56; Bukhari 23:112; Muslim 46:11",
    },
  },
];

/* ───────────────────────── Common Questions ───────────────────────── */

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
          note: "Bukhari 75:2; Muslim 45:60",
        },
        {
          title: "Patience is rewarded without limit",
          detail:
            "Allah says: 'Indeed, the patient will be given their reward without account' (Quran 39:10). Those who bear suffering with patience are among the most rewarded people in the Hereafter. The Prophets suffered the most — precisely because they were the most beloved to Allah.",
          note: "Quran 39:10; Tirmidhi 36:96",
        },
        {
          title: "Justice comes on the Day of Judgement",
          detail:
            "In Islam, this world is not the place of final justice — the Hereafter is. Every act of oppression, every tear shed, every moment of pain will be compensated with perfect justice. No one will be wronged by even the weight of an atom. Atheism offers no such promise — suffering under atheism is truly meaningless.",
          note: "Quran 99:7-8; Quran 4:40",
        },
      ],
      source: "Quran 2:155-157; Quran 67:2; Bukhari 75:2; Muslim 45:79",
    },
  },
  {
    id: "hell-justice",
    name: "Is Eternal Hell Just?",
    content: {
      intro:
        "For many seekers — and quietly, for many believers — this is the hardest question: how can finite sins earn infinite punishment? Islam's answer starts from a fact critics rarely quote: in Islam's own sources, the overwhelmingly dominant attribute of God is not wrath. It is mercy — and the texts define exactly who Hell is for.",
      verse: {
        arabic: "۞ قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ",
        text: "Say [Allah says], “O My slaves who have transgressed against themselves, do not despair of Allah’s mercy, for indeed Allah forgives all sins. He is indeed the All-Forgiving, the Most Merciful.",
        ref: "Quran 39:53",
      },
      points: [
        {
          title: "Mercy is the rule — one part of a hundred",
          detail:
            "The Prophet ﷺ taught that Allah created 'one hundred parts of mercy,' and 'out of this mercy endowed one part to the earth' — and that single part accounts for every act of compassion in history: 'it is because of this that the mother shows affection to her child and even the beasts and birds show kindness to one another.' The other ninety-nine are held back for the Day of Resurrection. And Bukhari records that Allah wrote with Him upon His Throne: 'My Mercy has preceded My Anger.' A theology in which mercy structurally outweighs wrath ninety-nine to one is not a theology eager to damn.",
          note: "Muslim 50:25; Bukhari 97:79",
        },
        {
          title: "More merciful than a mother",
          detail:
            "When a captive woman was seen desperately searching for and nursing her lost child, the Prophet ﷺ asked his companions: 'Do you think that this lady can throw her son in the fire?' They said never — not if she could help it. He replied: 'Allah is more merciful to His slaves than this lady to her son.' This is the sourced, textual picture of the Judge — and it must be held alongside every text about the Fire, because both come from the same mouth.",
          note: "Bukhari 78:30",
        },
        {
          title: "No one is wronged by an atom's weight",
          detail:
            "Whatever the outcome of Judgement, the Quran categorically excludes injustice from it: 'Allah does not do injustice as much as an atom’s weight' (4:40), and 'We will place the scales of justice on the Day of Resurrection, and no soul will be wronged in the least. Even if a deed is the weight of a mustard seed, We will bring it forth' (21:47). No one reaches Hell by oversight, technicality, or bad luck. If the Judge is by definition incapable of wronging anyone, then whoever is punished is punished by a standard more exacting and more informed than any objector's.",
          note: "Quran 4:40; Quran 21:47",
        },
        {
          title: "Who Hell is actually for",
          detail:
            "The Quran's warnings target a specific person: not the struggling, the doubting, or the unreached (see 'People Who Never Heard'), but the one who 'embrace[s] disbelief willingly' after the truth reached them (16:106) — and no one is judged without first being warned, 'so that the people may have no excuse before Allah after [the coming of] the messengers' (4:165). The Prophet ﷺ framed it as refusal, not failure: 'All my followers will enter Paradise except those who refuse.' Hell, in the Islamic texts, is not a trap set for the imperfect — it is the end point of a knowing, persistent, final rejection. And until the last breath, the door of 39:53 stands open: 'do not despair of Allah’s mercy, for indeed Allah forgives all sins.'",
          note: "Quran 16:106; Quran 4:165; Bukhari 96:12",
        },
      ],
      source: "Quran 39:53; Quran 4:40; Quran 21:47; Quran 16:106; Quran 4:165; Muslim 50:25; Bukhari 97:79; Bukhari 78:30; Bukhari 96:12",
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
          note: "Bukhari 56:224; Abu Dawud 15:138",
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
          note: "Bukhari 64:314",
        },
      ],
      source: "Quran 2:190; Quran 2:256; Quran 9:5-6; Bukhari 56:224; Bukhari 64:314; Abu Dawud 15:138",
    },
  },
  {
    id: "apostasy",
    name: "What About Apostasy?",
    content: {
      intro:
        "Anyone who reads 'there is no compulsion in religion' will, within one search, find the hadith critics quote against it. Hiding that hadith would forfeit this page's credibility — so here it is, in full, alongside what the Quran itself says and what the Prophet himself did.",
      verse: {
        arabic: "لَآ إِكْرَاهَ فِى ٱلدِّينِ ۖ قَد تَّبَيَّنَ ٱلرُّشْدُ مِنَ ٱلْغَىِّ ۚ فَمَن يَكْفُرْ بِٱلطَّـٰغُوتِ وَيُؤْمِنۢ بِٱللَّهِ فَقَدِ ٱسْتَمْسَكَ بِٱلْعُرْوَةِ ٱلْوُثْقَىٰ لَا ٱنفِصَامَ لَهَا ۗ وَٱللَّهُ سَمِيعٌ عَلِيمٌ",
        text: "There is no compulsion in religion; the truth has been made distinct from falsehood. Whoever rejects Tāghoot [i.e., false gods] and believes in Allah, has indeed grasped the strong handhold that never breaks. And Allah is All-Hearing, All-Knowing.",
        ref: "Quran 2:256",
      },
      points: [
        {
          title: "The Quran's own penalty for apostasy is in the Hereafter",
          detail:
            "The Quran discusses apostasy repeatedly — and never once prescribes an earthly punishment for it. 'Whoever disbelieves in Allah after having believed... upon them will be the wrath of Allah, and for them there will be a great punishment' (16:106) — the consequence named is divine, not judicial. Most strikingly, 4:137 describes 'those who believe then disbelieve, then believe and then again disbelieve, then increase in disbelief' — a verse that is incoherent if apostates were simply executed on the first lapse, since it presupposes people leaving and re-entering Islam over a lifetime.",
          note: "Quran 16:106; Quran 4:137; Quran 2:256",
        },
        {
          title: "The hadith critics quote — presented honestly",
          detail:
            "The narration exists and is authentic: 'Whoever changes his religion, kill him' (Nasai 37:94, also 37:96). The companion record around it must be reported precisely too: when Ali burned a group of apostates, Ibn Abbas's recorded objection was to execution by fire — 'If it had been me, I would not have burned them; the Messenger of Allah said: “No one should be punished with the punishment of Allah”' — while affirming the ruling itself, citing this very hadith (Nasai 37:95). What the first generation debated, then, was the method of execution, not whether the ruling existed; the questions of who it covers and in what circumstances belong to the juristic discussion below.",
          note: "Nasai 37:94; Nasai 37:95; Nasai 37:96",
        },
        {
          title: "Treason, not thought-crime — the classical context",
          detail:
            "In 7th-century Arabia there was no neutral citizenship: religious affiliation was political allegiance, and 'changing religion' in wartime meant defecting to forces actively fighting the Muslims — the Quran even records enemies plotting exactly this as a tactic, believing in the morning and disbelieving in the evening to demoralize the believers (3:72). Accordingly, many scholars, classical and modern, have understood the hadith as addressing apostasy compounded with treason and taking up arms — the capital crime being betrayal of the polity, not the private change of conviction — while others in premodern law read it more broadly. What no reading can erase is the Quranic layer above: no compulsion, and judgement of belief belonging to Allah.",
        },
        {
          title: "What the Prophet actually did",
          detail:
            "Bukhari records a Bedouin who pledged Islam, fell ill in Madinah, and three times demanded of the Prophet ﷺ, 'Cancel my Pledge.' The Prophet refused to release him from it — and then the man simply 'went out (of Medina).' No pursuit, no punishment; the Prophet's only comment was that Madinah, like a furnace, purifies itself of impurities. A man publicly renounced his pledge to the Prophet's face and walked away unharmed. Whatever the hadith of apostasy regulates, the Prophet's own conduct here is part of the evidence for what it does not.",
          note: "Bukhari 93:71",
        },
      ],
      source: "Quran 2:256; Quran 4:137; Quran 16:106; Nasai 37:94; Nasai 37:95; Nasai 37:96; Bukhari 93:71",
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
          note: "Ibn Majah 0:224",
        },
        {
          title: "The Prophet's example",
          detail:
            "The Prophet (peace be upon him) said: 'The best of you are those who are the best to their wives.' He helped with household chores, mended his own clothes, and consulted his wives on important matters. He never struck a woman. Aisha reported: 'The Messenger of Allah never struck anything with his hand — neither a woman nor a servant.'",
          note: "Tirmidhi 49:295; Muslim 43:108",
        },
      ],
      source: "Quran 2:228; Quran 4:7; Quran 24:31; Quran 33:59; Tirmidhi 49:295; Muslim 43:108; Ibn Majah 0:224",
    },
  },
  {
    id: "prophets-marriages",
    name: "The Prophet's Marriages",
    content: {
      intro:
        "The two objections raised most often about the Prophet ﷺ personally are his marriage to Aisha and his polygamy. A page that scrutinizes other traditions' hardest texts owes you the same honesty about its own — so here are the actual sources, presented without evasion, and the context in which they sit.",
      verse: {
        arabic: "وَلَن تَسْتَطِيعُوٓا۟ أَن تَعْدِلُوا۟ بَيْنَ ٱلنِّسَآءِ وَلَوْ حَرَصْتُمْ ۖ فَلَا تَمِيلُوا۟ كُلَّ ٱلْمَيْلِ فَتَذَرُوهَا كَٱلْمُعَلَّقَةِ ۚ وَإِن تُصْلِحُوا۟ وَتَتَّقُوا۟ فَإِنَّ ٱللَّهَ كَانَ غَفُورًا رَّحِيمًا",
        text: "You will never be able to maintain absolute justice between your wives, no matter how keen you are. So do not completely incline to one leaving the other in suspense. If you do what is right and fear Allah, Allah is surely All-Forgiving, Most Merciful.",
        ref: "Quran 4:129",
      },
      points: [
        {
          title: "What the sources actually say about Aisha",
          detail:
            "We will not soften the text: Aisha herself narrated 'that the Prophet ﷺ married her when she was six years old and he consummated his marriage when she was nine years old, and then she remained with him for nine years (i.e., till his death).' These narrations come to us from Aisha's own account, preserved in the most authenticated collection Muslims possess — Islam did not hide this; it recorded it.",
          note: "Bukhari 67:69; Bukhari 67:70",
        },
        {
          title: "The context his own enemies understood",
          detail:
            "In the 7th century — and for most of human history, across Europe, Asia, and Arabia alike — betrothal at a young age and marriage upon maturity were unremarkable norms; adulthood was marked by physical maturity, not a birthday. The decisive historical fact is this: the Quraysh attacked the Prophet ﷺ relentlessly — they called him a sorcerer, a madman, a poet, they mocked his son's death — yet no contemporary, Muslim or enemy, is recorded objecting to this marriage. The objection is a projection of modern norms onto a world that shared none of them; judging the 7th century by 21st-century milestones would condemn virtually every civilization in history, including the ancestors of the objectors.",
        },
        {
          title: "Aisha's own voice — scholar, not victim",
          detail:
            "Aisha did not disappear into silence; she became one of the most learned figures of the entire generation. She narrated a vast body of hadith, senior companions consulted her on law and inheritance, and she taught for nearly fifty years after the Prophet's death — correcting other companions' reports with textual evidence. Her narrations, including the ones above, are her own testimony: she recounted her marriage without grievance and defended her husband's legacy her whole life. Any honest account must include how the woman herself spoke.",
        },
        {
          title: "Polygamy: permitted, capped, and conditional on justice",
          detail:
            "The Quran did not invent polygamy — it found unlimited polygamy in Arabia (and in the Bible: David and Solomon had wives by the hundreds) and restricted it: up to four, with an explicit condition — 'but if you fear that you may not maintain justice, then marry only one' (Quran 4:3). Then it adds a sobering check: 'You will never be able to maintain absolute justice between your wives, no matter how keen you are' (Quran 4:129) — so a man who cannot uphold material fairness has no permission at all. Monogamy is the default; plural marriage is a regulated exception, historically tied to war widows and orphans.",
          note: "Quran 4:3; Quran 4:129",
        },
        {
          title: "Twenty-five monogamous years with Khadijah",
          detail:
            "The clearest evidence that the Prophet's marriages were not driven by desire is his own life: at 25 he married Khadijah, a twice-widowed businesswoman about fifteen years his senior, and remained faithfully monogamous with her for roughly twenty-five years until her death — through his entire youth. Almost all his later marriages, contracted in his fifties, were to widows and divorcees, sealing tribal alliances or sheltering women whose husbands had died — the marriages of a statesman and community leader, not a hedonist. A man seeking pleasure does not wait until age 50 to begin.",
        },
      ],
      source: "Bukhari 67:69; Bukhari 67:70; Quran 4:3; Quran 4:129",
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
          note: "Quran 35:24; Ahmad 21257",
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
      source: "Quran 17:15; Quran 35:24; Ahmad 21257",
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
          title: "Pharaoh's body — 'an example for those who come after you'",
          detail:
            "Narrating the Exodus, the Quran adds a detail found nowhere in the Bible: as Pharaoh drowned, Allah declared, 'So today We will preserve your body, so that you will be an example for those who come after you' (10:92). For over a millennium after the Quran's revelation this claim was uncheckable — Egypt's royal mummies lay undiscovered until the Deir el-Bahari cache (1881) and the tomb finds that followed. Today the mummies of the New Kingdom pharaohs — including Ramesses II and Merenptah, the very rulers Egyptologists debate as the pharaoh of the Exodus — are preserved and displayed in Cairo. Bodies drowned or lost at sea are precisely the ones that should not survive; this one, the Quran said, would.",
          note: "Quran 10:90-92",
        },
        {
          title: "A claim that could only be checked 1,200 years later",
          detail:
            "This is what makes the point forensic rather than poetic: a 7th-century author inventing scripture gains nothing by adding a falsifiable physical claim about a corpse — least of all one that contradicts the Biblical account he is supposedly copying, which has no preservation of Pharaoh's body at all. The claim sat in the text, checkable by no one, until modern archaeology could rule on it. It is the same pattern as the al-Aziz title above: where the Quran diverges from the Bible on ancient Egypt, the divergence lands on the side history later confirmed.",
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
      source: "Quran 17:88; Quran 7:157; Quran 4:82; Quran 2:23-24; Quran 29:48; Quran 10:90-92",
    },
  },
  {
    id: "evolution",
    name: "Does Islam Conflict With Evolution?",
    content: {
      intro:
        "This is the science question educated readers actually arrive with. The honest answer has three parts: what the Quran explicitly fixes, what Islam has no quarrel with, and where qualified scholars genuinely differ. Islam does not ask you to choose between your Lord and your biology textbook — but it does draw one line.",
      verse: {
        arabic: "ٱلَّذِىٓ أَحْسَنَ كُلَّ شَىْءٍ خَلَقَهُۥ ۖ وَبَدَأَ خَلْقَ ٱلْإِنسَـٰنِ مِن طِينٍ ۝ ثُمَّ جَعَلَ نَسْلَهُۥ مِن سُلَـٰلَةٍ مِّن مَّآءٍ مَّهِينٍ ۝ ثُمَّ سَوَّىٰهُ وَنَفَخَ فِيهِ مِن رُّوحِهِۦ ۖ وَجَعَلَ لَكُمُ ٱلسَّمْعَ وَٱلْأَبْصَـٰرَ وَٱلْأَفْـِٔدَةَ ۚ قَلِيلًا مَّا تَشْكُرُونَ",
        text: "Who perfected everything He created, and initiated the creation of man from clay. Then He made his progeny from the extract of a worthless fluid. Then He fashioned him and breathed into him of His spirit. He granted you hearing, sight and intellect; yet little it is that you give thanks.",
        ref: "Quran 32:7-9",
      },
      points: [
        {
          title: "What the Quran actually fixes: Adam's special creation",
          detail:
            "The Quran is explicit that humanity's origin is a deliberate divine act: Allah 'initiated the creation of man from clay,' then made his descendants 'from the extract of a worthless fluid,' then 'fashioned him and breathed into him of His spirit' (Quran 32:7-9); man was created 'from sounding clay, made of aging mud' (Quran 15:26). Adam was created directly, honored with Allah's spirit, and did not have parents. That single point — the special creation of Adam and the ensoulment that makes humans morally accountable — is the theological line. It is a claim about one species' origin, not a rejection of biology.",
          note: "Quran 32:7-9; Quran 15:26",
        },
        {
          title: "What Islam has no quarrel with",
          detail:
            "Notice what the Quran never commits to: no 6,000-year-old earth (it gives no creation date and no genealogical chronology to add up), no denial of natural processes, no claim that species are frozen. 'What is the matter with you that you do not fear the Majesty of Allah, when He has created you in stages?' (Quran 71:13-14) — gradual, staged development is the Quran's own vocabulary for how Allah creates. Deep time, an ancient universe, adaptation, and natural selection as mechanisms operating within creation raise no theological problem: in Islam, natural causes are simply how Allah ordinarily acts.",
          note: "Quran 71:13-14",
        },
        {
          title: "Where scholars genuinely differ",
          detail:
            "On everything outside Adam, Muslim scholars hold a range of positions. Some accept common descent for all non-human life while excepting Adam; some read the 'clay' stages as compatible with a longer developmental process; others are more reserved about evolutionary theory generally. Scholars have also discussed whether other beings walked the earth before Adam. These are live discussions among qualified scholars, not settled dogma — Islam has no Galileo problem and no church council binding believers to a scientific cosmology.",
        },
        {
          title: "The real conflict is with naturalism, not biology",
          detail:
            "Strip the debate to its core and the disagreement is not about fossils or genomes — it is about the philosophical add-on that the process was unguided, purposeless, and unsupervised. That claim is metaphysics, not measurement: no experiment can detect 'purposelessness.' A Muslim biologist can accept every observation in the field while affirming that the entire system — its laws, its mechanisms, its outcomes — runs by Allah's decree. The data belongs to science; the meaning of the data was never science's to award.",
        },
      ],
      source: "Quran 32:7-9; Quran 71:13-14; Quran 15:26",
    },
  },
  {
    id: "slavery",
    name: "What About Slavery?",
    content: {
      intro:
        "Islam arrived in a world where slavery was the economic bedrock of every civilization — Roman, Persian, African, Arabian. Rather than issue a decree no 7th-century society could survive, Islam did something historically unique: it made freeing slaves an act of worship, wired emancipation into its laws of repentance, and made the slave a brother. Judge the trajectory, not the snapshot.",
      verse: {
        arabic: "وَمَآ أَدْرَىٰكَ مَا ٱلْعَقَبَةُ ۝ فَكُّ رَقَبَةٍ",
        text: "And how do you know what the steep path is? It is freeing a slave.",
        ref: "Quran 90:12-13",
      },
      points: [
        {
          title: "Freeing a slave frees you from the Fire",
          detail:
            "The Prophet ﷺ said: 'Whoever frees a Muslim slave, Allah will save all the parts of his body from the (Hell) Fire as he has freed the body-parts of the slave.' The narrator of this very hadith relayed it to Ali bin Al-Husain — who promptly freed a slave for whom he had been offered ten thousand dirhams (or, in another wording, a thousand dinars). Islamic law then made manumission the prescribed expiation for a string of common sins — broken oaths, and more — turning the legal system itself into an engine that continuously converted slaves into free believers.",
          note: "Bukhari 49:1",
        },
        {
          title: "'Your slaves are your brothers'",
          detail:
            "A companion found Abu Dhar and his slave wearing identical cloaks and asked why. Abu Dhar explained that after he had once insulted a man through his mother, the Prophet ﷺ rebuked him: 'You still have some characteristics of ignorance. Your slaves are your brothers... whoever has a brother under his command should feed him of what he eats and dress him of what he wears,' and never burden him beyond capacity without helping him yourself. Same food, same clothes, bounded work, and the title 'brother' — no ancient legal system spoke of the enslaved this way.",
          note: "Bukhari 2:23; Bukhari 49:28",
        },
        {
          title: "Emancipation ranked among the best money you can spend",
          detail:
            "The Prophet ﷺ listed spending 'to set free a slave' alongside spending in Allah's path, charity to the needy, and providing for one's own family as the great categories of righteous spending. The Quran itself defines moral heroism by it: 'And how do you know what the steep path is? It is freeing a slave' (Quran 90:12-13). Wealthy companions competed in manumission as an act of devotion — and the Quran additionally allotted a share of zakat itself to freeing people from bondage.",
          note: "Muslim 12:48; Quran 90:12-13",
        },
        {
          title: "Bilal — from tortured slave to the voice of Islam",
          detail:
            "Bilal ibn Rabah, an enslaved Abyssinian, was tortured on the Meccan sands for believing in one God — and was purchased and freed by Abu Bakr. The Prophet ﷺ then chose him, a freed black slave, as the first muezzin of Islam — the voice calling the entire community to prayer, a position of maximal public honor. When Mecca was conquered, Bilal made the call from atop the Kaaba itself, above the heads of the aristocrats who had once owned men like him. That is what Islam did with a slave within one generation.",
        },
        {
          title: "The honest contrast with chattel slavery",
          detail:
            "Be precise about what is being compared. Transatlantic chattel slavery was race-based, hereditary by law, treated humans as livestock with no rights, no path to freedom, and no personhood. Islamic law knew nothing of a slave-race, commanded feeding and clothing slaves at the owner's own standard, made mistreatment grounds for mandated release, gave slaves the right to buy their own freedom, and made freeing them a means of salvation. It is also honest to say plainly: where Muslim societies later ran slave trades that betrayed these rules, they violated Islam's trajectory rather than followed it — and today every Muslim authority affirms slavery's abolition. The religion that defined 'the steep path' as freeing a slave got there first in principle.",
        },
      ],
      source: "Quran 90:12-13; Bukhari 49:1; Bukhari 2:23; Bukhari 49:28; Muslim 12:48",
    },
  },
  {
    id: "doubts",
    name: "Doubts & Waswas",
    content: {
      intro:
        "This page mostly speaks to seekers — but many readers are Muslims quietly frightened by their own intrusive thoughts, wondering if a doubt means their faith is gone. The Prophet's companions had the same fear, brought it to him directly, and received one of the most comforting answers in the entire tradition.",
      verse: {
        arabic: "وَلَقَدْ خَلَقْنَا ٱلْإِنسَـٰنَ وَنَعْلَمُ مَا تُوَسْوِسُ بِهِۦ نَفْسُهُۥ ۖ وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ ٱلْوَرِيدِ",
        text: "We have created man and know what his soul whispers within him, for We are closer to him than his jugular vein.",
        ref: "Quran 50:16",
      },
      points: [
        {
          title: "“That is pure faith”",
          detail:
            "Companions of the Prophet ﷺ came to him and confessed: 'Verily we perceive in our minds that which every one of us considers it too grave to express.' He asked if they really experienced that, and when they said yes, he answered: 'That is the faith manifest.' In the parallel narration, asked about these evil promptings, he said simply: 'It is pure faith.' The distress you feel at the thought is itself the proof of your iman — a heart with no faith would not be disturbed. The whisper is the attack; your discomfort is the defense.",
          note: "Muslim 1:247; Muslim 1:249",
        },
        {
          title: "The 'who created Allah?' whisper — predicted by name",
          detail:
            "The single most common intrusive question was described by the Prophet ﷺ fourteen centuries before any internet forum: 'The Satan comes to everyone of you and says: Who created this and that? till he questions: Who created your Lord? When he comes to that, one should seek refuge in Allah and keep away (from such idle thoughts).' Bukhari carries the same teaching. Note what the instruction is not: it is not 'out-argue the whisper.' The question is malformed — everything that begins to exist needs a cause; the eternal Creator, by definition, did not begin — but the prescribed response is practical: seek refuge, and decline the loop.",
          note: "Muslim 1:252; Bukhari 59:85",
        },
        {
          title: "A thought is not a sin",
          detail:
            "The Prophet ﷺ said: 'Allah has forgiven my followers the evil thoughts that occur to their minds, as long as such thoughts are not put into action or uttered.' You are not accountable for what fires uninvited across your mind — only for what you choose. This matters especially for waswas sufferers who fear the thought itself has damned them: the tradition explicitly says otherwise, and the Quran seals it: 'Allah does not burden any soul greater than it can bear' (2:286).",
          note: "Bukhari 68:19; Quran 2:286",
        },
        {
          title: "Having a question is not losing your religion",
          detail:
            "There is a difference between a doubt that visits you and a rejection you choose. Islam's tradition welcomed hard questions — this entire page exists because the Quran invites examination (4:82) — and the companions who voiced their darkest whispers were reassured, not rebuked. If a doubt persists, investigate it: read the relevant topic here, ask someone knowledgeable, and pray the prayer the Quran itself teaches: 'Our Lord, do not let our hearts deviate after You have guided us, and grant us Your mercy' (3:8). Doubts handled honestly have made countless believers stronger; doubts hidden in shame only fester.",
          note: "Quran 3:8; Quran 4:82",
        },
      ],
      source: "Quran 50:16; Quran 2:286; Quran 3:8; Muslim 1:247; Muslim 1:249; Muslim 1:252; Bukhari 59:85; Bukhari 68:19",
    },
  },
  {
    id: "sharing-islam",
    name: "How to Share Islam",
    content: {
      intro:
        "Many readers of this page are already Muslim — parents, friends, coworkers of someone asking these questions. Islam does not just give you answers; it legislates the manner of giving them. The Quran's dawah method is a discipline of wisdom, gentleness, and common ground — and it holds you to it even when the other side does not.",
      verse: {
        arabic: "ٱدْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِٱلْحِكْمَةِ وَٱلْمَوْعِظَةِ ٱلْحَسَنَةِ ۖ وَجَـٰدِلْهُم بِٱلَّتِى هِىَ أَحْسَنُ ۚ إِنَّ رَبَّكَ هُوَ أَعْلَمُ بِمَن ضَلَّ عَن سَبِيلِهِۦ ۖ وَهُوَ أَعْلَمُ بِٱلْمُهْتَدِينَ",
        text: "Call to the way of your Lord with wisdom and goodly exhortation, and reason with them in the best manner. Your Lord knows best who has strayed from His way and knows best those who are rightly guided.",
        ref: "Quran 16:125",
      },
      points: [
        {
          title: "The method is commanded, not optional",
          detail:
            "Quran 16:125 legislates three registers and their order: wisdom (hikmah — knowing what to say, to whom, and when), goodly exhortation (words that reach the heart, not just the argument), and — only when discussion arises — reasoning 'in the best manner.' Note what the verse rules out: mockery, humiliation, and point-scoring. The same verse ends by reminding the caller that 'Your Lord knows best who has strayed' — assessing hearts is Allah's job, not yours.",
          note: "Quran 16:125",
        },
        {
          title: "Open with common ground — the Quran's own opener",
          detail:
            "When addressing Christians and Jews, the Quran does not begin with the disputes — it begins with the shared foundation: 'O people of the Book, come to a common term between us and you, that we worship none but Allah and associate no partners with Him' (Quran 3:64). Start where you agree: one Creator, love of Jesus and Moses, moral seriousness, prayer. The disagreements on this page matter, but they land only after trust is built on what you hold in common.",
          note: "Quran 3:64",
        },
        {
          title: "Guidance is not your job — conveying is",
          detail:
            "'You cannot guide whoever you like, but Allah guides whom He wills' (Quran 28:56) — revealed about the Prophet ﷺ himself and his beloved uncle. And 'there is no compulsion in religion' (Quran 2:256) — pressure is not just ineffective, it is prohibited. This is liberating: your success is measured by the sincerity and clarity of the conveying, not by whether the person converts. Drop the scoreboard and the desperation disappears from your voice.",
          note: "Quran 28:56; Quran 2:256; Muslim 1:41",
        },
        {
          title: "Answer questions; don't win arguments",
          detail:
            "Practical discipline for real conversations: listen fully before responding — most objections are really one underlying question. Address one idea per conversation and let it breathe. Say 'I don't know, let me find out' rather than improvising — an honest gap builds more credibility than a weak answer. Never fabricate a citation or inflate a claim; this page exists so you can point to sources instead. And know when to stop: a person who is agitated is no longer listening, and 'reasoning in the best manner' includes ending warmly before it becomes a contest.",
        },
        {
          title: "With family and coworkers, your life speaks first",
          detail:
            "Do's: share meals, show up for people, let them see prayer and character up close, answer what is asked rather than what you wish they had asked, and offer resources ('read this when you're curious') instead of ultimatums. Don'ts: don't corner people, don't turn every dinner into a debate, don't treat a loved one as a project, and don't take rejection of the message as rejection of you. For most people who eventually embrace Islam, the argument opened the door — but a Muslim they trusted is why they walked through it.",
        },
      ],
      source: "Quran 16:125; Quran 3:64; Quran 28:56; Quran 2:256; Muslim 1:41",
    },
  },
];

/* ───────────────────────── Becoming Muslim ───────────────────────── */

const becomingTopics: Topic[] = [
  {
    id: "shahada-meaning",
    name: "The Shahada & What It Means",
    content: {
      intro:
        "Everything in Islam begins with one sentence — the Shahada, the testimony of faith: “I bear witness that there is no god but Allah, and I bear witness that Muhammad is the Messenger of Allah.” Saying this sincerely is what makes a person Muslim. There is no baptism, no initiation, no ceremony — one honest sentence before your Creator.",
      verse: {
        arabic: "فَٱعْلَمْ أَنَّهُۥ لَآ إِلَـٰهَ إِلَّا ٱللَّهُ وَٱسْتَغْفِرْ لِذَنۢبِكَ وَلِلْمُؤْمِنِينَ وَٱلْمُؤْمِنَـٰتِ ۗ وَٱللَّهُ يَعْلَمُ مُتَقَلَّبَكُمْ وَمَثْوَىٰكُمْ",
        text: "Then know [O Prophet] that none has the right to be worshiped except Allah, and seek forgiveness for your sins and for the [the sins of] the believing men and women, for Allah knows your movements and your places of rest.",
        ref: "Quran 47:19",
      },
      points: [
        {
          title: "Two halves of one testimony",
          detail:
            "The first half — la ilaha illa Allah — clears everything else away: no idol, no saint, no celebrity, no desire deserves your worship; only the One who made you. The second half — Muhammadun rasul Allah — accepts Muhammad ﷺ as Allah's final messenger, which means accepting the Quran he delivered as Allah's own word and his example as the way to live by it.",
          note: "Quran 47:19",
        },
        {
          title: "The words carry a promise",
          detail:
            "The Prophet ﷺ said: “He who died knowing (fully well) that there is no god but Allah entered Paradise.” The testimony is not a formality — it is the key to Paradise itself, and every other teaching in Islam flows from it.",
          note: "Muslim 1:43",
        },
        {
          title: "Witness, not just words",
          detail:
            "To “bear witness” is stronger than to merely say. Scholars explain that the Shahada asks for three things: knowing what you are saying, meaning it sincerely, and intending to live by it. Allah does not ask for perfection from day one — He asks for a truthful heart.",
        },
      ],
      source: "Quran 47:19; Muslim 1:43",
    },
  },
  {
    id: "how-to-take-it",
    name: "How to Take It",
    content: {
      intro:
        "Becoming Muslim is deliberately simple. Say the testimony — in Arabic if you can, and in your own language so you know exactly what you are saying: “Ashhadu an la ilaha illa Allah, wa ashhadu anna Muhammadan rasul Allah.” The moment you say it sincerely, you are Muslim.",
      points: [
        {
          title: "No ceremony, no clergy, no waiting period",
          detail:
            "Islam has no baptism and no priesthood standing between you and Allah. When Amr ibn al-As — once among the Prophet's fiercest enemies — decided to accept Islam, he simply came to the Prophet ﷺ, took his hand, and pledged. Nothing more was asked of him.",
          note: "Muslim 1:228",
        },
        {
          title: "Witnesses are not required",
          detail:
            "Your Shahada is valid between you and Allah alone — said in your own room with no one watching. Scholars state that witnesses serve a practical purpose only: connecting you to a community that can support you from day one. Saying it at a local mosque is encouraged for exactly that reason — you will find people eager to help, not gatekeepers.",
        },
        {
          title: "A bath (ghusl) is recommended",
          detail:
            "When Qays ibn Asim came to accept Islam, the Prophet ﷺ “commanded him to perform Ghusl with water and lotus leaves” — a full-body bath. Scholars state this ghusl is recommended for the new Muslim: a physical marker of the clean start the Shahada has just made. It is a beautiful practice, not a barrier — the testimony itself needs no preparation at all.",
          note: "Abu Dawud 1:355; Nasai 1:189",
        },
      ],
      source: "Muslim 1:228; Abu Dawud 1:355; Nasai 1:189",
    },
  },
  {
    id: "sins-wiped",
    name: "All Past Sins Wiped",
    content: {
      intro:
        "Whatever came before the Shahada — every sin, however heavy — is erased the moment you take it. This is not a hopeful sentiment; it is the Prophet's explicit teaching and the Quran's explicit promise.",
      verse: {
        arabic: "قُل لِّلَّذِينَ كَفَرُوٓا۟ إِن يَنتَهُوا۟ يُغْفَرْ لَهُم مَّا قَدْ سَلَفَ وَإِن يَعُودُوا۟ فَقَدْ مَضَتْ سُنَّتُ ٱلْأَوَّلِينَ",
        text: "Say to those who disbelieve that if they desist, their past will be forgiven, but if they persist, then they have a precedent in those who have passed before them.",
        ref: "Quran 8:38",
      },
      points: [
        {
          title: "“Islam wipes out all the previous misdeeds”",
          detail:
            "When Amr ibn al-As reached out to pledge his Shahada, he hesitated and pulled his hand back — he wanted a guarantee that his past would be pardoned first. The Prophet ﷺ answered: “Are you not aware of the fact that Islam wipes out all the previous (misdeeds)?” The same narration adds that migration and pilgrimage do the same. Amr needed no condition — the wiping clean is built in.",
          note: "Muslim 1:228",
        },
        {
          title: "No sin is too great",
          detail:
            "Allah addresses precisely the person who feels beyond forgiveness: “O My slaves who have transgressed against themselves, do not despair of Allah’s mercy, for indeed Allah forgives all sins.” Whatever you are carrying, the door is open — and the Shahada walks you through it.",
          note: "Quran 39:53",
        },
        {
          title: "From enemy of the Prophet to trusted commander",
          detail:
            "Amr admitted that before Islam “there was no other desire stronger in me than the one that I should overpower him and kill him.” Yet after his Shahada, the Prophet ﷺ trusted him to lead Muslim armies — Amr himself narrated: “The Prophet ﷺ deputed me to lead the Army of Dhat-as-Salasil.” If a man who once plotted to kill the Messenger of Allah could begin again with a clean slate, so can you.",
          note: "Muslim 1:228; Bukhari 62:14",
        },
      ],
      source: "Quran 8:38; Quran 39:53; Muslim 1:228; Bukhari 62:14",
    },
  },
  {
    id: "first-week",
    name: "Your First Week",
    content: {
      intro:
        "You are not expected to learn everything at once. Revelation itself came gradually over twenty-three years, and whenever the Prophet sent teachers to new Muslims he gave them the same order: a few essentials first, everything else in its own time.",
      points: [
        {
          title: "Learn in the Prophet's order — faith, then prayer, then charity",
          detail:
            "Sending Muadh ibn Jabal to teach in Yemen, the Prophet ﷺ told him to “invite them to testify that none has the right to be worshipped except Allah and that Muhammad is His Apostle” — and only “if they obey you in that,” “then tell them that Allah has enjoined on them five prayers to be performed every day and night.” Zakat (charity) came third. That is your syllabus: the testimony you have already made, then the prayer, then the rest step by step.",
          note: "Bukhari 64:374",
        },
        {
          title: "Focus on the five daily prayers",
          detail:
            "Prayer is the first practice to learn because Islam stands on it — the Prophet ﷺ named it immediately after the testimony among the five pillars. Learn the movements first and the words a line at a time; pray with what you know while you learn the rest. No one begins fluent.",
          note: "Bukhari 2:1",
        },
        {
          title: "The obligations alone are enough",
          detail:
            "A Bedouin asked the Prophet ﷺ exactly what was required of him, then vowed to do no more and no less than the obligations. The Prophet ﷺ said: “He will be successful if he has told the truth.” In Muslim's narration: “He is successful, if he is true to what he affirms.” The floor of this religion is genuinely enough to succeed — everything beyond it is voluntary reward.",
          note: "Bukhari 90:4; Muslim 1:8",
        },
        {
          title: "Take it gently — burnout is not piety",
          detail:
            "The Prophet ﷺ warned: “Religion is very easy and whoever overburdens himself in his religion will not be able to continue in that way.” New Muslims who try to adopt everything in a week often exhaust themselves. Steady and small beats intense and short-lived.",
          note: "Bukhari 2:32",
        },
      ],
      source: "Bukhari 64:374; Bukhari 2:1; Bukhari 90:4; Muslim 1:8; Bukhari 2:32",
    },
  },
  {
    id: "telling-family",
    name: "Telling Family & Friends",
    content: {
      intro:
        "For many new Muslims, saying the Shahada is the easy part — telling the people they love is the hard one. The Quran gives direct guidance for exactly this conversation, and you are under no obligation to rush it.",
      verse: {
        arabic: "ٱدْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِٱلْحِكْمَةِ وَٱلْمَوْعِظَةِ ٱلْحَسَنَةِ ۖ وَجَـٰدِلْهُم بِٱلَّتِى هِىَ أَحْسَنُ ۚ إِنَّ رَبَّكَ هُوَ أَعْلَمُ بِمَن ضَلَّ عَن سَبِيلِهِۦ ۖ وَهُوَ أَعْلَمُ بِٱلْمُهْتَدِينَ",
        text: "Call to the way of your Lord with wisdom and goodly exhortation, and reason with them in the best manner. Your Lord knows best who has strayed from His way and knows best those who are rightly guided.",
        ref: "Quran 16:125",
      },
      points: [
        {
          title: "Wisdom first — there is no announcement deadline",
          detail:
            "The Quran commands calling to Allah's way “with wisdom and goodly exhortation” — and wisdom includes choosing your moment, your words, and your audience. Your Shahada is already complete before Allah. Telling others is a step you take when you are ready, not a condition of your Islam.",
          note: "Quran 16:125",
        },
        {
          title: "Kindness to parents survives their disapproval",
          detail:
            "The Quran addresses the hardest case directly: even if parents actively pressure you to abandon your faith, you do not obey them in that — but you still “keep company with them in this world with kindness.” Becoming Muslim makes you more dutiful to your parents, not less. Let them see that.",
          note: "Quran 31:15",
        },
        {
          title: "Let your life do the arguing",
          detail:
            "Shock, worry, or anger is often the first reaction — and it usually softens with time. Long debates in week one rarely help. What does: becoming visibly more patient, more honest, more present. For many families, the strongest answer to “why Islam?” is watching who you become.",
        },
        {
          title: "You are not alone",
          detail:
            "Millions have walked this exact road before you. Seek out your local mosque and ask if there are other converts — most communities have them, and they remember their own first conversations vividly. Their company will steady you through yours.",
        },
      ],
      source: "Quran 16:125; Quran 31:15",
    },
  },
];

/* ───────────────────────── sections config ───────────────────────── */

const sections = [
  { key: "start", label: "Start Here" },
  { key: "proofs", label: "Evidence for Islam" },
  { key: "worldviews", label: "Other Worldviews" },
  { key: "questions", label: "Common Questions" },
  { key: "becoming", label: "Becoming Muslim" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

/* The six religion/worldview sections live inside ONE "Other Worldviews" tab:
   first-level selection = the worldview (shared SubTabLayout rail),
   second-level = that worldview's topics as a compact chip row. */
const worldviews = [
  { key: "christianity", label: "Christianity" },
  { key: "judaism", label: "Judaism" },
  { key: "hinduism", label: "Hinduism" },
  { key: "buddhism", label: "Buddhism" },
  { key: "sikhism", label: "Sikhism" },
  { key: "agnosticism", label: "Agnosticism" },
  { key: "atheism", label: "Atheism" },
] as const;

type WorldviewKey = (typeof worldviews)[number]["key"];

/* One keyed map of every topic group — replaces the eight per-group copies of
   filter/auto-select state that used to live in the page component. */
const topicGroups = {
  proofs: proofTopics,
  christianity: christianityTopics,
  judaism: judaismTopics,
  hinduism: hinduismTopics,
  buddhism: buddhismTopics,
  sikhism: sikhismTopics,
  agnosticism: agnosticismTopics,
  atheism: atheismTopics,
  questions: questionTopics,
  becoming: becomingTopics,
};

type GroupKey = keyof typeof topicGroups;

const defaultTopics = Object.fromEntries(
  (Object.keys(topicGroups) as GroupKey[]).map((k) => [k, topicGroups[k][0].id])
) as Record<GroupKey, string>;

/* Legacy deep-link tab keys (pre-restructure, when each religion had its own
   top tab) — old links resolve into the Worldviews tab. */
const legacyWorldviewTabs: Record<string, WorldviewKey> = {
  christianity: "christianity",
  judaism: "judaism",
  hinduism: "hinduism",
  buddhism: "buddhism",
  sikhism: "sikhism",
  agnosticism: "agnosticism",
  atheism: "atheism",
};

/* Aggregated "Sources & References" rows for a topic group — reuses each
   topic's existing source line (the per-card footer is suppressed above). */
const groupSourceRefs = (topics: Topic[]) =>
  topics.flatMap((t) => (t.content.source ? [{ ref: t.content.source, desc: t.name }] : []));

/* Start Here — clickable index of the sections (the /pillars intro pattern) */
const startIndex: { key: SectionKey; title: string; count: string; description: string }[] = [
  {
    key: "proofs",
    title: "Evidence for Islam",
    count: `${proofTopics.length} topics`,
    description:
      "The positive case — scripture preservation, pure monotheism, fulfilled prophecies, scientific consistency, the linguistic miracle, and more.",
  },
  {
    key: "worldviews",
    title: "Other Worldviews",
    count: `${worldviews.length} worldviews`,
    description:
      "How the same questions are answered by Christianity, Judaism, Hinduism, Buddhism, Sikhism, agnosticism, and atheism — examined through their own sources.",
  },
  {
    key: "questions",
    title: "Common Questions",
    count: `${questionTopics.length} questions`,
    description:
      "Direct answers to the objections people raise most — suffering, violence, women in Islam, religious pluralism, and whether religion is man-made.",
  },
  {
    key: "becoming",
    title: "Becoming Muslim",
    count: `${becomingTopics.length} steps`,
    description:
      "Convinced, or close to it? What the Shahada means, how to take it, the clean slate it brings, and how to walk your first days as a Muslim.",
  },
];

/* ───────────────────────── page ───────────────────────── */

function WhyIslamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useScrollToSection();

  /* Deep-link resolution (once, on mount). Current vocabulary: ?tab= is the
     section, ?sub= is the rail/topic selection. Legacy links are honored:
     ?tab=<religion> (the old per-religion tabs) and ?section= (the old
     topic param, still used by useScrollToSection for the highlight glow). */
  const [init] = useState(() => {
    const rawTab = searchParams.get("tab") ?? "";
    const rawSub = searchParams.get("sub") ?? searchParams.get("section");

    const tab: SectionKey = sections.some((s) => s.key === rawTab)
      ? (rawTab as SectionKey)
      : rawTab in legacyWorldviewTabs
        ? "worldviews"
        : "start";
    let worldview: WorldviewKey = legacyWorldviewTabs[rawTab] ?? "christianity";
    const topics = { ...defaultTopics };

    if (rawSub) {
      if (tab === "worldviews") {
        /* ?sub= may name the worldview itself (rail selection) or one of its
           topics — topic ids are unique across the six worldviews, so either
           form resolves. */
        const asWorldview = worldviews.find((w) => w.key === rawSub);
        const owner =
          asWorldview ??
          worldviews.find((w) => topicGroups[w.key].some((t) => t.id === rawSub));
        if (owner) {
          worldview = owner.key;
          if (!asWorldview) topics[owner.key] = rawSub;
        }
      } else if (tab === "proofs" || tab === "questions" || tab === "becoming") {
        if (topicGroups[tab].some((t) => t.id === rawSub)) topics[tab] = rawSub;
      }
    }

    return { tab, worldview, topics };
  });

  const [activeSection, setActiveSection] = useState<SectionKey>(init.tab);
  const [activeWorldview, setActiveWorldview] = useState<WorldviewKey>(init.worldview);
  const [activeTopics, setActiveTopics] = useState<Record<GroupKey, string>>(init.topics);
  const [search, setSearch] = useState("");

  const setTopic = (group: GroupKey, id: string) =>
    setActiveTopics((prev) => ({ ...prev, [group]: id }));

  const topicMatches = (t: Topic) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, t.name, t.content.intro, t.content.source,
      t.content.verse?.text, t.content.verse?.ref,
      ...t.content.points.map(p => p.title),
      ...t.content.points.map(p => p.detail),
      ...t.content.points.map(p => p.note ?? ""),
    );
  };

  const filtered = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(topicGroups) as GroupKey[]).map((k) => [k, topicGroups[k].filter(topicMatches)])
      ) as Record<GroupKey, Topic[]>,
    [search]
  );

  /* auto-select first visible topic when the active one is filtered out */
  useEffect(() => {
    (Object.keys(filtered) as GroupKey[]).forEach((k) => {
      if (filtered[k].length && !filtered[k].some((t) => t.id === activeTopics[k]))
        setActiveTopics((prev) => ({ ...prev, [k]: filtered[k][0].id }));
    });
  }, [filtered, activeTopics]);

  /* write the current position back to the URL so every view is linkable */
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const sub =
      activeSection === "worldviews"
        ? activeTopics[activeWorldview]
        : activeSection === "proofs" || activeSection === "questions" || activeSection === "becoming"
          ? activeTopics[activeSection]
          : "";
    router.replace(`${pathname}?tab=${activeSection}${sub ? `&sub=${sub}` : ""}`, { scroll: false });
  }, [activeSection, activeWorldview, activeTopics, pathname, router]);

  const activeProof = filtered.proofs.find((t) => t.id === activeTopics.proofs);
  const activeQuestion = filtered.questions.find((t) => t.id === activeTopics.questions);
  const activeBecoming = filtered.becoming.find((t) => t.id === activeTopics.becoming);
  const worldviewTopics = filtered[activeWorldview];
  const activeWorldviewTopic = worldviewTopics.find((t) => t.id === activeTopics[activeWorldview]);

  return (
    <div>
      <PageHeader
        title="Why Islam?"
        titleAr="لماذا الإسلام؟"
        subtitle="Examining the evidence for Islam and comparing it against other worldviews — with authentic sources and logical reasoning."
      />

      <VerseHero
        label="Surah Aal Imran"
        arabic="إِنَّ ٱلدِّينَ عِندَ ٱللَّهِ ٱلْإِسْلَـٰمُ ۗ وَمَا ٱخْتَلَفَ ٱلَّذِينَ أُوتُوا۟ ٱلْكِتَـٰبَ إِلَّا مِنۢ بَعْدِ مَا جَآءَهُمُ ٱلْعِلْمُ بَغْيًۢا بَيْنَهُمْ ۗ وَمَن يَكْفُرْ بِـَٔايَـٰتِ ٱللَّهِ فَإِنَّ ٱللَّهَ سَرِيعُ ٱلْحِسَابِ"
        text="The true religion with Allah is Islam. Those who were given the Scripture did not dispute except after the knowledge had come to them, out of mutual envy and rivalry. But whoever rejects the verses of Allah, then Allah is swift in reckoning."
        reference="Quran 3:19"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search topics, evidence, verses..." className="mb-6" />

      {/* Section navigation (shared TabBar) */}
      <TabBar
        tabs={sections.map((s) => ({ key: s.key, label: s.label }))}
        activeTab={activeSection}
        onTabChange={(k) => setActiveSection(k as SectionKey)}
        className="mb-6"
      />

      <AnimatePresence mode="wait">
        {/* ─── Start Here ─── */}
        {activeSection === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* What this page covers */}
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">What this page covers</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  Islam does not ask for blind faith — the Quran repeatedly calls on people to reflect, question, and examine the evidence. This page takes that invitation seriously. It lays out the case for Islam in three parts: the <span className="text-themed font-medium">positive evidence</span> that the Quran is divine revelation, an honest <span className="text-themed font-medium">comparison with other worldviews</span> through their own scriptures and scholarship, and direct answers to the <span className="text-themed font-medium">common questions</span> people ask about Islam. And for the reader who finds the case convincing, it closes with <span className="text-themed font-medium">becoming Muslim</span> — what the Shahada is and how to take it.
                </p>
                <p>
                  Read the sections in order for the full argument, or jump straight to whatever you are curious about — each topic stands on its own, and every claim is tied to its sources so you can verify rather than take our word for it. Use the search box above to find a specific topic across all sections.
                </p>
              </div>
            </ContentCard>

            {/* How to investigate honestly */}
            <ContentCard delay={0.15}>
              <h2 className="text-xl font-semibold text-themed mb-4">How to investigate honestly</h2>
              <div className="space-y-3 text-themed-muted text-sm leading-relaxed">
                <p>
                  Before any evidence, the Quran lays down the method — and it applies to everyone, including Muslims:
                </p>
                <ul className="space-y-3 list-none">
                  <li className="rounded-lg p-3 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
                    <span className="text-themed font-medium">Don&apos;t claim what you haven&apos;t checked.</span>{" "}
                    &ldquo;Do not follow that of which you have no knowledge. Indeed, the hearing, the sight, and the heart — all of them will be called to account&rdquo; (Quran 17:36). Your senses and your mind are instruments you answer for. Verify this page&apos;s sources; that is what they are cited for.
                  </li>
                  <li className="rounded-lg p-3 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
                    <span className="text-themed font-medium">Inherited belief is not evidence.</span>{" "}
                    The Quran condemns those who answer truth with &ldquo;we follow what we found our forefathers doing&rdquo; (Quran 2:170) — and the critique cuts both ways. Being born into a religion, including Islam, settles nothing; being born into secularism settles nothing either. Every worldview must earn its keep.
                  </li>
                  <li className="rounded-lg p-3 border sidebar-border" style={{ backgroundColor: "var(--color-bg)" }}>
                    <span className="text-themed font-medium">Follow the argument, not the crowd.</span>{" "}
                    If a claim on this page is wrong, its citation will fail when you check it; if it is right, the discomfort of where it leads is not a rebuttal. Read as a judge weighing evidence, not as a lawyer defending the position you walked in with.
                  </li>
                </ul>
              </div>
            </ContentCard>

            {/* Clickable index of the sections */}
            <ContentCard delay={0.2}>
              <h2 className="text-xl font-semibold text-themed mb-4">Explore the sections</h2>
              <div className="space-y-3">
                {startIndex.map((entry) => (
                  <button
                    key={entry.key}
                    onClick={() => setActiveSection(entry.key)}
                    className="w-full text-left rounded-lg p-4 border sidebar-border hover:border-gold/30 transition-colors"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-semibold text-themed text-sm">{entry.title}</h3>
                      <span className="text-xs text-themed-muted">{entry.count}</span>
                    </div>
                    <p className="text-xs text-themed-muted mt-0.5">{entry.description}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-themed-muted mt-4 mb-2">Or jump straight to a worldview:</p>
              <div className="flex flex-wrap gap-2">
                {worldviews.map((w) => (
                  <button
                    key={w.key}
                    onClick={() => {
                      setActiveWorldview(w.key);
                      setActiveSection("worldviews");
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-themed-muted hover:text-themed border sidebar-border transition-all"
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </ContentCard>

            <SourcesCard delay={0.3} sources={[
              { ref: "Quran 3:19", desc: "“The true religion with Allah is Islam”" },
              { ref: "Quran 2:256", desc: "“There is no compulsion in religion; the truth has been made distinct from falsehood”" },
              { ref: "Quran 4:82", desc: "the Quran's open invitation to examine it for contradiction" },
              { ref: "Quran 17:36", desc: "“Do not follow that of which you have no knowledge” — the Quran's own standard of inquiry" },
              { ref: "Quran 2:170", desc: "the Quran's critique of inherited, unexamined belief" },
            ]} />
          </motion.div>
        )}

        {/* ─── Evidence for Islam ─── */}
        {activeSection === "proofs" && (
          <motion.div
            key="proofs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.proofs.length === 0 ? (
              <p className="text-sm text-themed-muted text-center py-8">No topics match your search.</p>
            ) : (
              <SubTabLayout
                subs={filtered.proofs.map((t) => ({ key: t.id, label: t.name }))}
                activeSub={activeTopics.proofs}
                setActiveSub={(id) => setTopic("proofs", id)}
              >
                {activeProof && (
                  <div id={`section-${activeProof.id}`}>
                    <TopicInfoCard topic={activeProof} showSource={false} />
                  </div>
                )}
              </SubTabLayout>
            )}

            <SourcesCard className="mt-8" sources={groupSourceRefs(activeProof ? [activeProof] : [])} />
          </motion.div>
        )}

        {/* ─── Other Worldviews ─── */}
        {activeSection === "worldviews" && (
          <motion.div
            key="worldviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <SubTabLayout
              subs={worldviews.map((w) => ({ key: w.key, label: w.label }))}
              activeSub={activeWorldview}
              setActiveSub={setActiveWorldview}
            >
              {worldviewTopics.length === 0 ? (
                <p className="text-sm text-themed-muted text-center py-8">No topics match your search.</p>
              ) : (
                <div>
                  {/* second level — this worldview's topics as a compact chip row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {worldviewTopics.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTopic(activeWorldview, t.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          activeWorldviewTopic?.id === t.id
                            ? "bg-gold/20 text-gold border border-gold/40"
                            : "text-themed-muted hover:text-themed border sidebar-border"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    {activeWorldviewTopic && (
                      <motion.div
                        key={activeWorldviewTopic.id}
                        id={`section-${activeWorldviewTopic.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                      >
                        <TopicInfoCard topic={activeWorldviewTopic} showSource={false} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </SubTabLayout>

            <SourcesCard className="mt-8" sources={groupSourceRefs(activeWorldviewTopic ? [activeWorldviewTopic] : [])} />
          </motion.div>
        )}

        {/* ─── Common Questions ─── */}
        {activeSection === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.questions.length === 0 ? (
              <p className="text-sm text-themed-muted text-center py-8">No topics match your search.</p>
            ) : (
              <SubTabLayout
                subs={filtered.questions.map((t) => ({ key: t.id, label: t.name }))}
                activeSub={activeTopics.questions}
                setActiveSub={(id) => setTopic("questions", id)}
              >
                {activeQuestion && (
                  <div id={`section-${activeQuestion.id}`}>
                    <TopicInfoCard topic={activeQuestion} showSource={false} />
                  </div>
                )}
              </SubTabLayout>
            )}

            <SourcesCard className="mt-8" sources={groupSourceRefs(activeQuestion ? [activeQuestion] : [])} />
          </motion.div>
        )}

        {/* ─── Becoming Muslim ─── */}
        {activeSection === "becoming" && (
          <motion.div
            key="becoming"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.becoming.length === 0 ? (
              <p className="text-sm text-themed-muted text-center py-8">No topics match your search.</p>
            ) : (
              <SubTabLayout
                subs={filtered.becoming.map((t) => ({ key: t.id, label: t.name }))}
                activeSub={activeTopics.becoming}
                setActiveSub={(id) => setTopic("becoming", id)}
              >
                {activeBecoming && (
                  <div id={`section-${activeBecoming.id}`}>
                    <TopicInfoCard topic={activeBecoming} showSource={false} />
                  </div>
                )}
              </SubTabLayout>
            )}

            <SourcesCard className="mt-8" sources={groupSourceRefs(activeBecoming ? [activeBecoming] : [])} />

            {/* Encouraging next steps for the new (or almost-new) Muslim */}
            <ContentCard className="mt-6" delay={0.2}>
              <h2 className="text-xl font-semibold text-themed mb-2">Where to go next</h2>
              <p className="text-sm text-themed-muted leading-relaxed mb-4">
                The Shahada is a beginning, not a finish line — and you do not have to figure out the rest alone. These pages will walk you through your first months:
              </p>
              <div className="space-y-3">
                <Link
                  href="/salah"
                  className="block rounded-lg p-4 border sidebar-border hover:border-gold/30 transition-colors"
                  style={{ backgroundColor: "var(--color-bg)" }}
                >
                  <h3 className="font-semibold text-themed text-sm">Learn the Prayer →</h3>
                  <p className="text-xs text-themed-muted mt-0.5">Step-by-step guides to wudu and the five daily prayers — your first and most important practice.</p>
                </Link>
                <Link
                  href="/muslim-daily"
                  className="block rounded-lg p-4 border sidebar-border hover:border-gold/30 transition-colors"
                  style={{ backgroundColor: "var(--color-bg)" }}
                >
                  <h3 className="font-semibold text-themed text-sm">Live a Muslim Day →</h3>
                  <p className="text-xs text-themed-muted mt-0.5">A gentle daily rhythm — morning to night — showing how worship fits into ordinary life.</p>
                </Link>
                <Link
                  href="/learn-arabic"
                  className="block rounded-lg p-4 border sidebar-border hover:border-gold/30 transition-colors"
                  style={{ backgroundColor: "var(--color-bg)" }}
                >
                  <h3 className="font-semibold text-themed text-sm">Learn Arabic →</h3>
                  <p className="text-xs text-themed-muted mt-0.5">Start reading the Quran in its own words — a little at a time, no background needed.</p>
                </Link>
              </div>
            </ContentCard>
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
