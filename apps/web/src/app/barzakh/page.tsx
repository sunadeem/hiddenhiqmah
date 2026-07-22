"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TopicInfoCard, { topicSourceRefs } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";

/* ───────────────────────── data ───────────────────────── */

const whyItMatters = [
  {
    point: "The first stage of the Hereafter",
    detail:
      "The grave is the first station of the afterlife. The Prophet (peace be upon him) said: 'The grave is the first stage of the Hereafter. If one is saved from it, then what comes after is easier. And if one is not saved from it, then what comes after is worse.'",
    reference: "Tirmidhi 36:5; Ibn Majah 37:168",
  },
  {
    point: "Every soul will experience it",
    detail:
      "Death is the one certainty that unites all of creation. Allah says: 'Every soul will taste death.' No wealth, status, or power can prevent it. The Barzakh is the realm every soul enters after death and before resurrection.",
    reference: "Quran 3:185; Quran 23:100",
  },
  {
    point: "The Prophet sought refuge from its punishment",
    detail:
      "The Prophet (peace be upon him) used to regularly seek refuge from the punishment of the grave, and he instructed his companions to include this supplication in every prayer. This shows how seriously this matter should be taken.",
    reference: "Muslim 10:9",
  },
  {
    point: "It is a place of either bliss or torment",
    detail:
      "The grave is not a place of nothingness. The believer's grave is expanded as far as the eye can see, and a gate to Paradise is opened so that its fragrance and breeze reach him. The disbeliever's grave is constricted until his ribs interlock, and a gate to the Hellfire is opened so that its heat and scorching wind reach him. Every deceased person is shown their place — in Paradise or in the Fire — morning and evening.",
    reference: "Abu Dawud 42:158 (graded Sahih by al-Albani); Bukhari 23:131",
  },
  {
    point: "Awareness of this life motivates good deeds",
    detail:
      "Remembering death and what follows it is one of the greatest motivators to leave sin and hasten to good deeds. The Prophet (peace be upon him) said: 'Remember often the destroyer of pleasures — death.'",
    reference: "Tirmidhi 36:4; Nasai 21:7",
  },
  {
    point: "The Quran confirms the soul's experience before Resurrection",
    detail:
      "Allah describes Pharaoh's people being exposed to the Fire morning and evening in their Barzakh life, even before the Day of Judgement arrives — confirming that the soul is aware and experiencing reward or punishment between death and resurrection.",
    reference:
      "Quran 40:46 — 'The Fire, they are exposed to it morning and evening. And the Day the Hour is established: Admit the people of Pharaoh to the severest punishment.'",
  },
];

type GraveTopic = {
  id: string;
  name: string;
  content: {
    intro: string;
    points: { title: string; detail: string; note?: string }[];
    verse?: { arabic: string; text: string; ref: string };
    source?: string;
  };
};

const whatHappensTopics: GraveTopic[] = [
  {
    id: "departure-soul",
    name: "The Departure of the Soul",
    content: {
      intro:
        "At the moment of death, the angel of death comes to extract the soul. The experience differs drastically between the believer and the disbeliever.",
      verse: {
        arabic:
          "قُلْ يَتَوَفَّىٰكُم مَّلَكُ ٱلْمَوْتِ ٱلَّذِى وُكِّلَ بِكُمْ ثُمَّ إِلَىٰ رَبِّكُمْ تُرْجَعُونَ",
        text: "Say: The angel of death who has been entrusted with you will take your souls. Then to your Lord you will be returned.",
        ref: "Quran 32:11",
      },
      points: [
        {
          title: "The believer's soul departs gently",
          detail:
            "Angels descend with white shrouds and fragrant musk from Paradise. They say: 'O good soul, come out to the forgiveness and pleasure of Allah.' The soul exits as easily as water flows from a water-skin, and they wrap it in those heavenly shrouds. From it emanates the finest fragrance of musk found on the face of the earth.",
          note: "Mishkat al-Masabih 1630 (from Musnad Ahmad, hadith of al-Bara' ibn 'Azib; graded Sahih by al-Albani)",
        },
        {
          title: "The disbeliever's soul is wrenched out",
          detail:
            "Angels descend with coarse cloth from the Hellfire. They say: 'O wicked soul, come out to the wrath and anger of Allah.' The soul scatters through the body and is pulled out like a skewer is pulled through moistened wool. From it emanates the most foul stench found on the face of the earth.",
          note: "Mishkat al-Masabih 1630 (from Musnad Ahmad, hadith of al-Bara' ibn 'Azib; graded Sahih by al-Albani)",
        },
        {
          title: "The soul is taken up through the heavens",
          detail:
            "The believer's soul is carried up through each heaven, and at every level the angels welcome it and ask about it. The gates of heaven are opened for it until it reaches the seventh heaven, and Allah says: 'Record the book of My servant in 'Illiyyeen (the highest register) and return him to the earth, for from it I created them, to it I shall return them, and from it I shall raise them again.'",
          note: "Mishkat al-Masabih 1630 (from Musnad Ahmad; graded Sahih by al-Albani)",
        },
      ],
      source:
        "Mishkat al-Masabih 1630 (from Musnad Ahmad, hadith of al-Bara' ibn 'Azib; graded Sahih by al-Albani); Quran 32:11",
    },
  },
  {
    id: "where-souls-go",
    name: "Where the Souls Go",
    content: {
      intro:
        "The grave holds the body, but the soul's abode in the Barzakh differs by rank. The texts describe where the greatest souls reside while they await the Day of Resurrection.",
      verse: {
        arabic: "وَلَا تَحْسَبَنَّ ٱلَّذِينَ قُتِلُوا۟ فِى سَبِيلِ ٱللَّهِ أَمْوَٰتًۢا ۚ بَلْ أَحْيَآءٌ عِندَ رَبِّهِمْ يُرْزَقُونَ",
        text: "Never think of those who are killed in Allah's way as dead; rather, they are alive with their Lord, receiving provision,",
        ref: "Quran 3:169",
      },
      points: [
        {
          title: "The souls of the martyrs — green birds beneath the Throne",
          detail:
            "When the companions asked about the verse 'Think not of those who are slain in Allah's way as dead...', the Prophet (peace be upon him) said that the souls of the martyrs live in the bodies of green birds who have their nests in lamps hung from the Throne of the Almighty. They eat the fruits of Paradise wherever they like, then return to those lamps. When their Lord asked what more they desired, they wished only to be returned to the world to be slain in His way once again.",
          note: "Muslim 33:181; Quran 3:169; Quran 2:154",
        },
        {
          title: "The prophets are alive in their graves",
          detail:
            "The prophets occupy the highest station. Of Musa (Moses), the Prophet (peace be upon him) said, describing his Night Journey: 'I happened to pass by Moses as he was busy in saying prayer in his grave.' The prophets' life in the Barzakh is a special, elevated life that only Allah fully knows.",
          note: "Muslim 43:216",
        },
        {
          title: "The registers — 'Illiyyin and Sijjin",
          detail:
            "The Quran names two records where every soul's book is kept: the register of the righteous, 'Illiyyin — 'a record inscribed, witnessed by those who are close to Allah' — and the register of the wicked, Sijjin. In the hadith of al-Bara' ibn 'Azib, the believer's soul is recorded in 'Illiyyin and the disbeliever's is cast down to Sijjin.",
          note: "Quran 83:18; Quran 83:20; Quran 83:21; Quran 83:7; Mishkat al-Masabih 1630 (from Musnad Ahmad; graded Sahih by al-Albani)",
        },
      ],
      source:
        "Muslim 33:181; Muslim 43:216; Quran 3:169; Quran 2:154; Quran 83:7; Quran 83:18; Quran 83:20; Quran 83:21",
    },
  },
  {
    id: "funeral-burial",
    name: "The Funeral & Burial",
    content: {
      intro:
        "Islam emphasizes hastening the funeral and burial. The deceased is aware of what happens around them even after death.",
      points: [
        {
          title: "Hasten the funeral",
          detail:
            "The Prophet (peace be upon him) said: 'Hasten the funeral. If the deceased was righteous, you are advancing them to good. And if they were otherwise, then it is an evil you are putting off your necks.'",
          note: "Bukhari 23:72; Muslim 11:66",
        },
        {
          title: "The deceased hears the footsteps",
          detail:
            "The Prophet (peace be upon him) said: 'When a person is placed in his grave and his companions depart from him, he hears the sound of their sandals.'",
          note: "Nasai 21:233",
        },
        {
          title: "The grave squeezes",
          detail:
            "No one is spared from the squeezing of the grave. The Prophet (peace be upon him) said about Sa'd ibn Mu'adh — the companion at whose death the Throne of Allah shook and the gates of heaven were opened: 'It squeezed him once, then released him.'",
          note: "Nasai 21:238",
        },
      ],
      source:
        "Bukhari 23:72; Bukhari 23:93; Muslim 4:106; Muslim 15:80; Nasai 21:238",
    },
  },
  {
    id: "questioning",
    name: "The Questioning",
    content: {
      intro:
        "After burial, every person will be questioned in their grave by two angels. This is the first test of the afterlife, and one's answers depend on how they lived.",
      verse: {
        arabic:
          "يُثَبِّتُ ٱللَّهُ ٱلَّذِينَ ءَامَنُوا۟ بِٱلْقَوْلِ ٱلثَّابِتِ فِى ٱلْحَيَوٰةِ ٱلدُّنْيَا وَفِى ٱلْـَٔاخِرَةِ",
        text: "Allah keeps firm those who believe with the firm word, in the life of this world and in the Hereafter.",
        ref: "Quran 14:27",
      },
      points: [
        {
          title: "The two angels: Munkar and Nakir",
          detail:
            "The two angels who conduct the questioning are named in the Sunnah. The Prophet (peace be upon him) said that when the deceased is buried, two angels — black and blue-eyed — come to him: one is called al-Munkar and the other an-Nakir, and they ask him what he used to say about this man (the Prophet).",
          note: "Tirmidhi 10:107; graded Hasan by al-Albani",
        },
        {
          title: "Three questions",
          detail:
            "Two angels come to the deceased and sit them up. They ask three questions: 'Who is your Lord?' 'What is your religion?' and 'What do you say about this man who was sent among you?'",
          note: "Abu Dawud 42:158; Bukhari 23:93",
        },
        {
          title: "The believer answers with certainty",
          detail:
            "The believer will say: 'My Lord is Allah, my religion is Islam, and he is Muhammad, the Messenger of Allah (peace be upon him).' A caller from heaven will say: 'My servant has spoken the truth, so spread for him a bed from Paradise, clothe him from Paradise, and open for him a gate to Paradise.'",
          note: "Abu Dawud 42:158",
        },
        {
          title: "The hypocrite and disbeliever cannot answer",
          detail:
            "The disbeliever or hypocrite will say: 'I don't know... I heard the people saying something and I said it too.' It will be said: 'You did not know and you did not recite (follow guidance).' Then he will be struck with an iron hammer between his ears, and he will let out a scream that is heard by everything near him except humans and jinn.",
          note: "Bukhari 23:93; Abu Dawud 42:158",
        },
      ],
      source:
        "Bukhari 23:93; Muslim 53:85; Abu Dawud 42:158; Quran 14:27",
    },
  },
  {
    id: "believer-experience",
    name: "The Believer's Experience",
    content: {
      intro:
        "For the righteous believer, the grave becomes a place of comfort, spaciousness, and light — a garden from the gardens of Paradise.",
      points: [
        {
          title: "The grave is expanded",
          detail:
            "After the believer answers correctly, his grave is expanded for him as far as his eye can see. It is furnished with furnishings from Paradise, and a gate to Paradise is opened for him so that its fragrance and breeze reach him.",
          note: "Abu Dawud 42:158; Bukhari 23:93",
        },
        {
          title: "A beautiful companion appears",
          detail:
            "A man with a beautiful face, fine clothing, and pleasant fragrance comes and says: 'Receive glad tidings of that which will please you. This is the day you were promised.' The believer asks: 'Who are you? Your face brings good.' He replies: 'I am your righteous deeds.'",
          note: "Abu Dawud 42:158; Mishkat al-Masabih 1630",
        },
        {
          title: "The believer asks for the Hour to come",
          detail:
            "The believer will say: 'My Lord, establish the Hour so that I may return to my family and my wealth!' — so eager is he for what awaits him in the Hereafter.",
          note: "Abu Dawud 42:158",
        },
        {
          title: "Sleep like a bride",
          detail:
            "The righteous person will sleep in their grave in comfort, like a bride whom no one wakes except the dearest of her family — until Allah raises them on the Day of Resurrection.",
          note: "Tirmidhi 10:107; graded Hasan by al-Albani",
        },
        {
          title: "Children who die young are with Ibrahim",
          detail:
            "In the Prophet's dream of the Barzakh, he saw an old man at the base of a great, flourishing tree surrounded by children — 'the old man who was sitting at the base of the tree was Abraham (Ibrahim) and the little children around him were the offspring of the people.' The young children of the believers are in the care of the Friend of Allah (peace be upon him) until the Day of Resurrection.",
          note: "Bukhari 23:138",
        },
      ],
      source:
        "Abu Dawud 42:158; Bukhari 23:93; Mishkat al-Masabih 1630; Tirmidhi 10:107; Bukhari 23:138",
    },
  },
  {
    id: "disbeliever-experience",
    name: "The Disbeliever's Experience",
    content: {
      intro:
        "For the disbeliever and the hypocrite, the grave becomes a place of constriction, darkness, and suffering — a pit from the pits of the Hellfire.",
      points: [
        {
          title: "The grave constricts upon them",
          detail:
            "After they fail to answer, their grave is constricted until their ribs interlock. A gate to the Hellfire is opened, and its heat and scorching wind reach them.",
          note: "Abu Dawud 42:158; Bukhari 23:93",
        },
        {
          title: "An ugly companion appears",
          detail:
            "A man with a hideous face, foul clothing, and terrible stench comes and says: 'Receive the tidings of that which will grieve you. This is the day you were promised.' The person asks: 'Who are you? Your face brings evil.' He says: 'I am your wicked deeds.'",
          note: "Abu Dawud 42:158; Mishkat al-Masabih 1630",
        },
        {
          title: "Ongoing punishment until the Hour",
          detail:
            "Allah describes Pharaoh's people being exposed to the Fire morning and evening in their graves. On the Day of Judgement, they will be admitted to the severest punishment. This shows that punishment in the grave is real and continuous.",
          note: "Quran 40:46",
        },
        {
          title: "Punishment for specific sins",
          detail:
            "The Prophet (peace be upon him) passed by two graves and said: 'They are being punished, and they are not being punished for something major (that was difficult to avoid). One of them used to not protect himself from his urine, and the other used to walk about spreading malicious gossip.'",
          note: "Bukhari 23:114; Muslim 1:198a",
        },
      ],
      source:
        "Abu Dawud 42:158; Mishkat al-Masabih 1630; Quran 40:46; Bukhari 23:114; Muslim 1:198a",
    },
  },
  {
    id: "prophets-dream",
    name: "The Prophet's Dream",
    content: {
      intro:
        "In a long, vivid dream, the Prophet (peace be upon him) was taken by two angels — Jibril (Gabriel) and Mika'il (Michael) — and shown souls in the Barzakh being requited for specific sins, alongside scenes of comfort for the righteous. It is the most detailed authentic depiction of Barzakh consequences.",
      points: [
        {
          title: "The liar — his cheek torn open",
          detail:
            "The Prophet saw a man whose cheek was being torn from ear to jaw with an iron hook, healing and being torn again. He was told: 'he was a liar and he used to tell lies, and the people would report those lies on his authority till they spread all over the world. So, he will be punished like that till the Day of Resurrection.'",
          note: "Bukhari 23:138",
        },
        {
          title: "The one who abandoned the Quran — his head crushed",
          detail:
            "He saw a man whose head was being crushed with a rock, healing and being crushed again. He was told this was 'the one whom Allah had given the knowledge of Qur'an (i.e. knowing it by heart) but he used to sleep at night (i.e. he did not recite it then) and did not use to act upon it (i.e. upon its orders etc.) by day' — punished thus till the Day of Resurrection.",
          note: "Bukhari 23:138",
        },
        {
          title: "The adulterers — in the fiery pit",
          detail:
            "He passed a hole like an oven, narrow at the top and wide at the bottom, with fire kindling beneath it; naked men and women inside were lifted up as the flames rose and sank back as they subsided. He was told: 'those you saw in the hole were adulterers.'",
          note: "Bukhari 23:138",
        },
        {
          title: "The riba-eaters — in the river of blood",
          detail:
            "He reached a river of blood where a man swam; whenever he tried to climb out, another standing on the bank threw a stone into his mouth and drove him back. He was told: 'those you saw in the river of blood were those dealing in Riba (usury).'",
          note: "Bukhari 23:138",
        },
        {
          title: "Comfort for the righteous — Ibrahim and the martyrs",
          detail:
            "Amid the punishments were scenes of mercy: an old man beneath a flourishing tree surrounded by children was 'Abraham (Ibrahim) and the little children around him were the offspring of the people'; and two beautiful houses were shown to be 'the house of the common believers' and 'the house of the martyrs.'",
          note: "Bukhari 23:138",
        },
      ],
      source: "Bukhari 23:138",
    },
  },
  {
    id: "common-questions",
    name: "Common Questions",
    content: {
      intro:
        "A few questions come up again and again about the Barzakh. Some have clear textual answers; others are matters scholars address by principle — where a ruling is a scholarly position rather than an explicit text, that is noted.",
      points: [
        {
          title: "What about those never buried — cremated, drowned, or lost?",
          detail:
            "The Barzakh reaches every soul, not only the buried. Reward and punishment attach to the soul in a manner known to Allah, so a body that was burned, drowned, eaten by beasts, or never found is in no way beyond His reach or His justice. The grave is simply the ordinary setting for what happens to every departed soul. (Scholarly consensus; no single explicit narration is quoted here.)",
          note: "Scholarly summary; anchored in Quran 40:46 (the soul exposed to the Fire before the grave is even entered by resurrection)",
        },
        {
          title: "Is it the body or the soul that is questioned?",
          detail:
            "The mainstream Sunni position is that the punishment and bliss of the Barzakh are experienced primarily by the soul, which Allah reconnects to the body in a manner unlike worldly life and known only to Him — which is why a buried body may appear undisturbed while its soul is in bliss or torment. (This is the summarized position of the scholars, not a verbatim narration.)",
          note: "Scholarly summary (mainstream Sunni position)",
        },
        {
          title: "Do the dead hear us?",
          detail:
            "The Prophet (peace be upon him) said that the deceased, once laid down, 'hears the sound of their sandals' as his companions depart. Beyond such specific texts, whether and how the dead hear the living in general is a matter of scholarly difference — so the safest practice is to benefit them with du'a and charity rather than to address them expecting a reply.",
          note: "Nasai 21:233",
        },
        {
          title: "How does time pass in the Barzakh?",
          detail:
            "However long the Barzakh lasts, the soul's sense of its duration is compressed. On the Day of Resurrection those raised will say, 'We stayed for a day or part of a day,' and it will seem to them 'no more than an evening or a morning' — the whole interval between death and rising will feel brief.",
          note: "Quran 23:112; Quran 23:113; Quran 79:46",
        },
        {
          title: "How does the Barzakh end?",
          detail:
            "The Barzakh closes with the second blowing of the Trumpet: 'The Trumpet will be blown and all those in the heavens and all those on earth will fall dead ... Then it will be blown again, and at once they will be standing, looking on.' At that, souls return to reassembled bodies and the Resurrection begins.",
          note: "Quran 39:68",
        },
      ],
      source: "Bukhari 23:93; Quran 40:46; Quran 23:112; Quran 23:113; Quran 79:46; Quran 39:68",
    },
  },
];

const protectionTopics: GraveTopic[] = [
  {
    id: "deeds-protect",
    name: "Deeds That Protect",
    content: {
      intro:
        "Certain deeds serve as a shield and protection for a person in the grave. The Prophet (peace be upon him) and the Quran highlight specific actions that safeguard the believer.",
      points: [
        {
          title: "Reciting Surah al-Mulk",
          detail:
            "The Prophet (peace be upon him) said: 'There is a surah in the Quran of thirty verses that interceded for a man until he was forgiven. It is: Blessed is He in Whose Hand is the dominion (Surah al-Mulk).' It is known as the protector from the punishment of the grave.",
          note: "Tirmidhi 45:17; Abu Dawud 6:30",
        },
        {
          title: "Dying as a shaheed (martyr)",
          detail:
            "The Prophet (peace be upon him) said: 'There are six things with Allah for the martyr...' and among them: 'He is protected from the punishment of the grave.'",
          note: "Tirmidhi 22:46; Ibn Majah 24:47",
        },
        {
          title: "Dying on a Friday",
          detail:
            "The Prophet (peace be upon him) said: 'There is no Muslim who dies on the day of Friday or the night of Friday except that Allah protects him from the trial of the grave.'",
          note: "Tirmidhi 10:110 (graded Hasan)",
        },
        {
          title: "Dying while guarding the frontier (ribat)",
          detail:
            "The Prophet (peace be upon him) said: 'Guarding the frontier for one day in the cause of Allah is better than the world and everything in it... and he is protected from the trial of the grave.'",
          note: "Tirmidhi 22:48",
        },
        {
          title: "Dying from a stomach ailment",
          detail:
            "The Prophet (peace be upon him) said: 'Whoever is killed by a stomach ailment will not be punished in his grave.'",
          note: "Tirmidhi 10:100; graded Sahih by al-Albani",
        },
      ],
      source:
        "Tirmidhi 45:17; Tirmidhi 10:100; Abu Dawud 6:30; Ibn Majah 24:47",
    },
  },
  {
    id: "seeking-refuge",
    name: "Seeking Refuge",
    content: {
      intro:
        "The Prophet (peace be upon him) taught specific supplications to seek protection from the punishment of the grave. These are to be said regularly, especially in prayer.",
      points: [
        {
          title: "Dua in every prayer",
          detail:
            "The Prophet (peace be upon him) said: 'When one of you finishes the last tashahhud, let him seek refuge with Allah from four things: from the punishment of the Hellfire, from the punishment of the grave, from the trials of life and death, and from the evil of the trial of al-Masih al-Dajjal.'",
          note: "Muslim 10:9; Bukhari 23:129",
        },
        {
          title: "The Prophet's regular practice",
          detail:
            "A'ishah (may Allah be pleased with her) reported that the Prophet (peace be upon him) used to supplicate in prayer: 'O Allah, I seek refuge with You from the punishment of the grave, and I seek refuge with You from the trial of al-Masih al-Dajjal, and I seek refuge with You from the trials of life and the trials of death.'",
          note: "Muslim 5:162",
        },
        {
          title: "Supplication after burial",
          detail:
            "The Prophet (peace be upon him) would stand at the grave after burial and say: 'Ask Allah to forgive your brother and ask that he be made firm, for he is now being questioned.'",
          note: "Abu Dawud 21:133; graded Sahih by al-Albani",
        },
      ],
      source:
        "Bukhari 23:129; Muslim 10:9; Muslim 2:56; Abu Dawud 21:133",
    },
  },
  {
    id: "good-ending",
    name: "Signs of a Good Ending",
    content: {
      intro:
        "The Prophet (peace be upon him) described certain signs that indicate a good ending (husn al-khatimah) — signs of Allah's acceptance and pleasure at the time of death.",
      points: [
        {
          title: "Dying with the shahadah on one's lips",
          detail:
            "The Prophet (peace be upon him) said: 'He whose last words are La ilaha illallah (There is no god but Allah) will enter Paradise.'",
          note: "Abu Dawud 21:28; graded Sahih by al-Albani",
        },
        {
          title: "Prompting the dying (talqin) — the family's role",
          detail:
            "The other half of that teaching is a duty on those present. The Prophet (peace be upon him) said: 'Exhort to recite “There is no god but Allah” to those of you who are dying.' Gently and without pressuring, the family prompts the shahadah so it is the dying person's last word.",
          note: "Muslim 11:1; Muslim 11:3",
        },
        {
          title: "Sweat on the forehead at death",
          detail:
            "The Prophet (peace be upon him) said: 'The believer dies with sweat on his forehead.' This is considered one of the signs of a good ending.",
          note: "Tirmidhi 10:18; Nasai 21:11",
        },
        {
          title: "Dying while performing a righteous deed",
          detail:
            "The Prophet (peace be upon him) said: 'When Allah wills good for His servant, He uses him.' They asked: 'How does He use him?' He said: 'He guides him to do a righteous deed before his death.'",
          note: "Tirmidhi 32:10 (graded Sahih)",
        },
        {
          title: "The state of the face after death",
          detail:
            "Scholars note that a peaceful, content expression on the face of the deceased is considered a sign of a good ending, while a distressed appearance may indicate otherwise. This is observed but ultimately only Allah knows the true state of a person.",
        },
      ],
      source:
        "Abu Dawud 21:28; Muslim 11:1; Muslim 11:3; Tirmidhi 10:18; Tirmidhi 32:10; Nasai 21:11",
    },
  },
];

// "Helping the Dead" — the souls-in-Barzakh receiving end lives here; the full
// mechanics of deeds performed on the deceased's behalf are owned by /death-rites
// ("What Reaches the Dead"), which this tab cross-links.
const helpingDead = [
  {
    point: "Three deeds continue after death",
    detail:
      "The Prophet (peace be upon him) said: 'When a man dies, his acts come to an end, but three, recurring charity, or knowledge (by which people) benefit, or a pious son, who prays for him (for the deceased)' These keep reaching a person in the Barzakh long after they are gone.",
    reference: "Muslim 25:20",
  },
  {
    point: "Charity given on their behalf reaches them",
    detail:
      "A man told the Prophet (peace be upon him) that his mother had died suddenly and asked whether giving charity on her behalf would benefit her; the Prophet replied in the affirmative. Sa'd ibn 'Ubadah likewise gave a garden in charity for his deceased mother on the Prophet's instruction. Charity given for the dead reaches them.",
    reference: "Bukhari 23:140; Bukhari 55:19",
  },
  {
    point: "Du'a for the dead is a gift they receive",
    detail:
      "A'ishah (may Allah be pleased with her) reported that the Prophet (peace be upon him) would go out to al-Baqi' toward the end of the night and pray for its people: 'Peace be upon you, abode of a people who are believers ... O Allah, grant forgiveness to the inhabitants of Baqi' al-Gharqad.' Sincere supplication for the deceased reaches and benefits them.",
    reference: "Muslim 11:131",
  },
];

const sections = [
  { key: "intro", label: "What is the Barzakh?" },
  { key: "importance", label: "Why It Matters" },
  { key: "what-happens", label: "What Happens" },
  { key: "protection", label: "Protection" },
  { key: "helping-dead", label: "Helping the Dead" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

// Go-deeper cross-links (house pattern) — this page owns the Barzakh; the
// mechanics of janazah, the deathbed and what reaches the dead live on the
// dedicated pages, so overlapping rail topics link out instead of restating.
const whatHappensGoDeeper: Record<string, { href: string; label: string }> = {
  "funeral-burial": {
    href: "/death-rites?tab=washing-janazah",
    label: "Go deeper: Death & Janazah — washing, shrouding, the funeral prayer and burial in detail",
  },
  "believer-experience": {
    href: "/death-rites?tab=types-of-death&sub=children",
    label: "Go deeper: Children Who Die Young — the full pastoral treatment on Death & Rites",
  },
  "common-questions": {
    href: "/day-of-judgement?tab=events",
    label: "Go deeper: Day of Judgement — the Trumpet, resurrection and what follows the Barzakh",
  },
};

const protectionGoDeeper: Record<string, { href: string; label: string }> = {
  "good-ending": {
    href: "/death-rites?tab=dying&sub=bedside",
    label: "Go deeper: At the Bedside — prompting the shahadah and the moment of death",
  },
};

/* ───────────────────────── page ───────────────────────── */

function TheGraveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useScrollToSection();
  const [activeSection, setActiveSection] = useState<SectionKey>(searchParams.get("tab") as SectionKey || "intro");
  // Deep-link support: ?sub=<topic id> (old ?section= accepted as a mount-time alias)
  const subParam = searchParams.get("sub") ?? searchParams.get("section");
  const [activeWhatHappens, setActiveWhatHappens] = useState(
    subParam && whatHappensTopics.some((t) => t.id === subParam) ? subParam : "departure-soul"
  );
  const [activeProtection, setActiveProtection] = useState(
    subParam && protectionTopics.some((t) => t.id === subParam) ? subParam : "deeds-protect"
  );
  const [search, setSearch] = useState("");

  // Keep ?tab= / ?sub= in sync so the current view is shareable
  const syncUrl = (tab: SectionKey, sub?: string) => {
    router.replace(sub ? `${pathname}?tab=${tab}&sub=${sub}` : `${pathname}?tab=${tab}`, { scroll: false });
  };

  const topicMatches = (t: GraveTopic) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, t.name, t.content.intro, t.content.source,
      t.content.verse?.text,
      ...t.content.points.map(p => p.title),
      ...t.content.points.map(p => p.detail),
    );
  };

  const mattersMatches = (item: { point: string; detail: string; reference: string }) => {
    if (!search || search.length < 2) return true;
    return textMatch(search, item.point, item.detail, item.reference);
  };

  // auto-select the first visible topic when the active one is filtered out
  useEffect(() => {
    const wh = whatHappensTopics.filter(topicMatches);
    if (wh.length && !wh.some((t) => t.id === activeWhatHappens)) setActiveWhatHappens(wh[0].id);
    const pr = protectionTopics.filter(topicMatches);
    if (pr.length && !pr.some((t) => t.id === activeProtection)) setActiveProtection(pr[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Barzakh"
        titleAr="البرزخ"
        subtitle="The life of al-Barzakh — what happens after death according to authentic sources."
      />

      <VerseHero
        label="The Quran"
        arabic="وَمِن وَرَآئِهِم بَرْزَخٌ إِلَىٰ يَوْمِ يُبْعَثُونَ"
        text="And behind them is a barrier (Barzakh) until the Day they are resurrected."
        reference="Quran 23:100"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search topics, verses..." className="mb-6" />

      {/* Section navigation (shared TabBar) */}
      <TabBar
        tabs={sections.map((s) => ({ key: s.key, label: s.label }))}
        activeTab={activeSection}
        onTabChange={(k) => {
          setActiveSection(k as SectionKey);
          syncUrl(k as SectionKey);
        }}
        className="mb-6"
      />

      <AnimatePresence mode="wait">
        {/* ─── What is the Barzakh? ─── */}
        {activeSection === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">
                What is the Barzakh?
              </h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  <span className="text-themed font-medium">Al-Barzakh</span>{" "}
                  (البرزخ) literally means &ldquo;barrier&rdquo; or
                  &ldquo;partition&rdquo; and refers to the intermediate realm
                  between death and the Day of Resurrection. It is the life of
                  the grave — a stage every soul must pass through, regardless of
                  whether they are physically buried or not.
                </p>
                <p>
                  Belief in the life of the grave is part of belief in the
                  unseen (al-ghayb), which is one of the fundamental qualities
                  of the believers described in the opening of the Quran:{" "}
                  <em>
                    &ldquo;Those who believe in the unseen, establish prayer, and
                    spend from what We have provided for them&rdquo;
                  </em>{" "}
                  (Quran 2:3). The questioning of the grave, its punishment, and
                  its bliss are affirmed by the Quran, the Sunnah, and the
                  consensus of the scholars.
                </p>
                <p>
                  The Prophet (peace be upon him) said:{" "}
                  <em>
                    &ldquo;The grave is the first stage of the Hereafter. If one
                    is saved from it, then what comes after is easier. And if one
                    is not saved from it, then what comes after is worse.&rdquo;
                  </em>{" "}
                  (Tirmidhi 36:5). This hadith establishes the grave as
                  the beginning of the journey — the first test of the
                  Hereafter.
                </p>
                <p>
                  In the Barzakh, the soul is reunited with the body in a manner
                  that only Allah knows. The person is questioned by two angels,
                  and depending on their answers, the grave becomes either a
                  garden from the gardens of Paradise or a pit from the pits of
                  the Hellfire. The soul remains in this state — experiencing
                  comfort or torment — until the Day of Resurrection.
                </p>
                <p>
                  The Prophet (peace be upon him) regularly sought refuge from
                  the punishment of the grave and taught his companions to do the
                  same in every prayer. Allah says:{" "}
                  <em>
                    &ldquo;The Fire, they are exposed to it morning and evening.
                    And the Day the Hour is established: Admit the people of
                    Pharaoh to the severest punishment&rdquo;
                  </em>{" "}
                  (Quran 40:46) — confirming that the soul experiences its
                  outcome even before the Day of Judgement.
                </p>
              </div>
            </ContentCard>

            {/* Sources */}
            <SourcesCard sources={[
              { ref: "Quran 2:3", desc: "Those who believe in the unseen" },
              { ref: "Quran 23:100", desc: "Behind them is a Barzakh until the Day they are resurrected" },
              { ref: "Quran 40:46", desc: "Pharaoh's people exposed to Fire morning and evening" },
              { ref: "Tirmidhi 36:5", desc: "The grave is the first stage of the Hereafter" },
              { ref: "Muslim 10:9", desc: "Seeking refuge from the punishment of the grave in prayer" },
            ]} />

            {/* Go deeper — how the Barzakh ends: the second Trumpet and resurrection */}
            <Link href="/day-of-judgement?tab=events" className="block group">
              <ContentCard>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-themed">
                    Go deeper: Day of Judgement — how the Barzakh ends with the second Trumpet and the resurrection
                  </span>
                  <ArrowRight size={16} className="text-gold shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </ContentCard>
            </Link>
          </motion.div>
        )}

        {/* ─── Why It Matters ─── */}
        {activeSection === "importance" && (
          <motion.div
            key="importance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Numbered points */}
            {whyItMatters.filter(mattersMatches).map((item, i) => (
              <ContentCard key={i} delay={0.05 + i * 0.05}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold font-semibold text-sm">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-themed mb-1">
                      {item.point}
                    </h3>
                    <p className="text-themed-muted text-sm leading-relaxed">
                      {item.detail}
                    </p>
                    <p className="text-xs text-gold/60 mt-2">
                      <HadithRefText text={item.reference} />
                    </p>
                  </div>
                </div>
              </ContentCard>
            ))}

            {/* Sources */}
            <SourcesCard delay={0.4} sources={[
              { ref: "Quran 3:185", desc: "Every soul will taste death" },
              { ref: "Quran 23:100", desc: "Behind them is a Barzakh" },
              { ref: "Quran 40:46", desc: "Pharaoh's people exposed to the Fire morning and evening" },
              { ref: "Muslim 10:9", desc: "Seeking refuge from the punishment of the grave" },
              { ref: "Tirmidhi 36:4", desc: "Remember often the destroyer of pleasures" },
              { ref: "Tirmidhi 36:5; Ibn Majah 37:168", desc: "The grave is the first stage of the Hereafter" },
              { ref: "Abu Dawud 42:158", desc: "The believer's grave is expanded; the disbeliever's is constricted" },
              { ref: "Bukhari 23:131", desc: "The deceased is shown their place morning and evening" },
              { ref: "Nasai 21:7", desc: "Remember death often" },
            ]} />
          </motion.div>
        )}

        {/* ─── What Happens ─── */}
        {activeSection === "what-happens" && (
          <motion.div
            key="what-happens"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
                {whatHappensTopics.filter(topicMatches).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveWhatHappens(topic.id);
                        syncUrl("what-happens", topic.id);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left ${
                        activeWhatHappens === topic.id
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "text-themed-muted hover:text-themed border sidebar-border"
                      }`}
                    >
                      {topic.name}
                    </button>
                ))}
              </div>

              {/* Right side — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {whatHappensTopics.filter(topicMatches).map(
                    (topic) =>
                      activeWhatHappens === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <TopicInfoCard topic={topic} showSource={false} />
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Go deeper — dedicated pages that own the overlapping material */}
            {whatHappensGoDeeper[activeWhatHappens] && (
              <Link href={whatHappensGoDeeper[activeWhatHappens].href} className="block mt-4 group">
                <ContentCard>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-themed">
                      {whatHappensGoDeeper[activeWhatHappens].label}
                    </span>
                    <ArrowRight size={16} className="text-gold shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </ContentCard>
              </Link>
            )}

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const t = whatHappensTopics.find((x) => x.id === activeWhatHappens);
              const rows = t ? topicSourceRefs(t) : [];
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
          </motion.div>
        )}

        {/* ─── Protection ─── */}
        {activeSection === "protection" && (
          <motion.div
            key="protection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Left side — vertical pills */}
              <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:w-48 w-full shrink-0">
                {protectionTopics.filter(topicMatches).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveProtection(topic.id);
                        syncUrl("protection", topic.id);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap md:whitespace-normal transition-all text-left ${
                        activeProtection === topic.id
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "text-themed-muted hover:text-themed border sidebar-border"
                      }`}
                    >
                      {topic.name}
                    </button>
                ))}
              </div>

              {/* Right side — content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {protectionTopics.filter(topicMatches).map(
                    (topic) =>
                      activeProtection === topic.id && (
                        <motion.div
                          key={topic.id}
                          id={`section-${topic.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <TopicInfoCard topic={topic} showSource={false} />
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Go deeper — dedicated page that owns the deathbed material */}
            {protectionGoDeeper[activeProtection] && (
              <Link href={protectionGoDeeper[activeProtection].href} className="block mt-4 group">
                <ContentCard>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-themed">
                      {protectionGoDeeper[activeProtection].label}
                    </span>
                    <ArrowRight size={16} className="text-gold shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </ContentCard>
              </Link>
            )}

            {/* Sources & References — scoped to the active selection */}
            {(() => {
              const t = protectionTopics.find((x) => x.id === activeProtection);
              const rows = t ? topicSourceRefs(t) : [];
              return rows.length > 0 ? <SourcesCard className="mt-8" sources={rows} /> : null;
            })()}
          </motion.div>
        )}

        {/* ─── Helping the Dead ─── */}
        {activeSection === "helping-dead" && (
          <motion.div
            key="helping-dead"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <ContentCard delay={0.05}>
              <h2 className="text-xl font-semibold text-themed mb-2">
                Can I still help them?
              </h2>
              <p className="text-themed-muted text-sm leading-relaxed">
                The most-asked question after losing someone is whether anything
                we do still reaches them. It does. The Barzakh is not sealed off
                from the living — the deceased continues to receive the fruit of
                deeds they set in motion and the good the living send on their
                behalf.
              </p>
            </ContentCard>

            {helpingDead.filter(mattersMatches).map((item, i) => (
              <ContentCard key={i} delay={0.1 + i * 0.05}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold font-semibold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-themed mb-1">{item.point}</h3>
                    <p className="text-themed-muted text-sm leading-relaxed">
                      {item.detail}
                    </p>
                    <p className="text-xs text-gold/60 mt-2">
                      <HadithRefText text={item.reference} />
                    </p>
                  </div>
                </div>
              </ContentCard>
            ))}

            {/* Go deeper — /death-rites owns the full mechanics of what reaches the dead */}
            <Link href="/death-rites?tab=grief-visiting&sub=reaches" className="block group">
              <ContentCard>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-themed">
                    Go deeper: What Reaches the Dead — Hajj and fasting on their behalf, unpaid debts, and more on Death &amp; Rites
                  </span>
                  <ArrowRight size={16} className="text-gold shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </ContentCard>
            </Link>

            <SourcesCard delay={0.35} sources={[
              { ref: "Muslim 25:20", desc: "When a man dies his deeds end except three" },
              { ref: "Bukhari 23:140", desc: "Charity on behalf of a deceased mother benefits her" },
              { ref: "Bukhari 55:19", desc: "Sa'd gives his garden in charity for his deceased mother" },
              { ref: "Muslim 11:131", desc: "The Prophet's du'a for the people of al-Baqi'" },
            ]} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TheGravePage() {
  return <Suspense><TheGraveContent /></Suspense>;
}
