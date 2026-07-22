"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PageSearch from "@hidden-hiqmah/ui/components/PageSearch";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import TabBar from "@hidden-hiqmah/ui/components/TabBar";
import SubTabLayout from "@hidden-hiqmah/ui/components/SubTabLayout";
import TopicInfoCard, { type Topic } from "@hidden-hiqmah/ui/components/TopicInfoCard";
import HadithRefText from "@hidden-hiqmah/ui/components/HadithRefText";
import SourcesCard from "@hidden-hiqmah/ui/components/SourcesCard";
import VerseHero from "@hidden-hiqmah/ui/components/VerseHero";
import { textMatch } from "@hidden-hiqmah/ui/lib/search";
import { useScrollToSection } from "@hidden-hiqmah/ui/hooks/useScrollToSection";

/* ───────────────────────── data ─────────────────────────
   All Arabic below is spliced byte-exact from packages/content
   (Quran verses and the hadith corpus) — never hand-typed. */

// Quran 3:96-97 — the House at Bakkah and the duty of pilgrimage.
const houseVerses = [
  {
    ar: "إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ لَلَّذِى بِبَكَّةَ مُبَارَكًا وَهُدًى لِّلْعَـٰلَمِينَ",
    en: "The first House [of worship] established for mankind was the one at Bakkah [i.e., Makkah], full of blessings and guidance for the worlds.",
    ref: "3:96",
  },
  {
    ar: "فِيهِ ءَايَـٰتٌۢ بَيِّنَـٰتٌ مَّقَامُ إِبْرَٰهِيمَ ۖ وَمَن دَخَلَهُۥ كَانَ ءَامِنًا ۗ وَلِلَّهِ عَلَى ٱلنَّاسِ حِجُّ ٱلْبَيْتِ مَنِ ٱسْتَطَاعَ إِلَيْهِ سَبِيلًا ۚ وَمَن كَفَرَ فَإِنَّ ٱللَّهَ غَنِىٌّ عَنِ ٱلْعَـٰلَمِينَ",
    en: "In it are clear signs [such as] the standing place of Abraham; whoever enters it will be safe. Pilgrimage to the House is a duty owed to Allah upon all people who are able to make their way to it; whoever disbelieves, then Allah is in no need for the worlds.",
    ref: "3:97",
  },
];

const ihramTopics: Topic[] = [
  {
    id: "what-is-ihram",
    name: "What is Ihram",
    content: {
      intro:
        "Ihram is the sacred state a pilgrim enters before crossing into the rites of Hajj or Umrah — an intention made in the heart, announced with the talbiyah, and marked (for men) by setting aside ordinary dress. From that moment the pilgrim lives under a special discipline until the rites release him from it.",
      verse: {
        arabic: "ٱلْحَجُّ أَشْهُرٌ مَّعْلُومَـٰتٌ ۚ فَمَن فَرَضَ فِيهِنَّ ٱلْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِى ٱلْحَجِّ ۗ وَمَا تَفْعَلُوا۟ مِنْ خَيْرٍ يَعْلَمْهُ ٱللَّهُ ۗ وَتَزَوَّدُوا۟ فَإِنَّ خَيْرَ ٱلزَّادِ ٱلتَّقْوَىٰ ۚ وَٱتَّقُونِ يَـٰٓأُو۟لِى ٱلْأَلْبَـٰبِ",
        text: "The pilgrimage is in known months. Whoever commits himself to perform the pilgrimage, there should be no intimacy, foul language, and arguments during the pilgrimage. Whatever good you do, Allah is aware of it. And take provisions for the journey, but the best provision is righteousness. So fear Me, O people of understanding.",
        ref: "Quran 2:197",
      },
      points: [
        {
          title: "Prepare with a bath",
          detail:
            "At Dhul-Hulaifa, when Asma bint Umais gave birth just as the Prophet's (peace be upon him) caravan set out for his Hajj, she sent asking what she should do. He told her: 'Take a bath, bandage your private parts and put on Ihram.' A full bath (ghusl) before ihram is Sunnah for everyone — even a woman in her condition, showing that ihram is a state of intention, not of ritual purity.",
          note: "Muslim 15:159",
        },
        {
          title: "Intention, then talbiyah",
          detail:
            "Ihram begins with the intention for the rite you are entering — Umrah, Hajj, or both together. Ibn Umar said: 'I saw that Allah's Messenger (peace be upon him) used to ride on his Mount at Dhul Hulaifa and used to start saying, \"Labbaik\" when the Mount stood upright' — the intention in the heart, the talbiyah on the tongue, and the journey begins.",
          note: "Bukhari 25:2",
        },
        {
          title: "The pilgrim's dress",
          detail:
            "The Prophet (peace be upon him) defined the man's ihram by what may not be worn — no shirt, turban, trousers, hooded cloak, or scented garments (Bukhari 25:29) — which is why men wrap themselves in the two familiar plain, unstitched sheets. A woman simply wears her ordinary modest clothing; her only dress restrictions are that she does not veil her face or wear gloves.",
          note: "Bukhari 25:29; Abu Dawud 11:106",
        },
        {
          title: "A state of the heart",
          detail:
            "The verse above sets the inner terms of ihram: no intimacy, no foul language, no arguments — 'and take provisions for the journey, but the best provision is righteousness.' The white sheets that erase every mark of wealth and rank are a rehearsal of the Day when all will stand before Allah the same.",
          note: "Quran 2:197",
        },
      ],
    },
  },
  {
    id: "the-miqat",
    name: "The Miqat",
    content: {
      intro:
        "The mawaqit are the boundary points the Prophet (peace be upon him) fixed around Mecca. No one heading for Hajj or Umrah passes them without being in ihram.",
      points: [
        {
          title: "The stations the Prophet fixed",
          detail:
            "Ibn Abbas narrated: 'Allah's Messenger (peace be upon him) made Dhul-Hulaifa as the Miqat for the people of Medina; Al-Juhfa for the people of Sham; Qarn-al-Manazil for the people of Najd; and Yalamlam for the people of Yemen; and these Mawaqit are for the people at those very places, and besides them for those who come through those places with the intention of performing Hajj and Umra.'",
          note: "Bukhari 25:12",
        },
        {
          title: "If you live inside the boundary",
          detail:
            "The same hadith continues: 'whoever is living within these boundaries can assume Ihram from the place he starts, and the people of Mecca can assume Ihram from Mecca.' Residents of Jeddah, for example, enter ihram from home; for Umrah, a person already in Mecca goes just outside the sanctuary limits — as the Prophet (peace be upon him) sent A'isha to Tan'im for her Umrah (Bukhari 25:121).",
          note: "Bukhari 25:12; Bukhari 25:121",
        },
        {
          title: "Flying over the miqat",
          detail:
            "Most pilgrims today cross their miqat in the air. Scholars advise changing into the ihram garments before boarding or during the flight and making the intention with the talbiyah when the plane comes in line with the miqat — the boundary applies in the sky just as on the road.",
        },
      ],
    },
  },
  {
    id: "restrictions",
    name: "Restrictions of Ihram",
    content: {
      intro:
        "While in ihram, a set of ordinary permissions is suspended. Each restriction has a prophetic source — and each falls away again when the rites release the pilgrim.",
      points: [
        {
          title: "For men: no fitted clothing",
          detail:
            "A man asked, 'O Allah's Messenger (peace be upon him)! What kind of clothes should a Muhrim wear?' He replied: 'He should not wear a shirt, a turban, trousers, a headcloak or leather socks except if he can find no slippers, he then may wear leather socks after cutting off what might cover the ankles. And he should not wear clothes which are scented with saffron or Wars (kinds of perfumes).'",
          note: "Bukhari 25:29",
        },
        {
          title: "For women: face and hands",
          detail:
            "Ibn Umar reported that the Prophet (peace be upon him) said: 'A woman in the sacred state (wearing ihram) must not be veiled or wear gloves.' Everything else she wears remains her normal modest dress.",
          note: "Abu Dawud 11:106",
        },
        {
          title: "No cutting hair, no perfume, no hunting",
          detail:
            "The Quran commands: 'do not shave your heads until the sacrificial animal reaches its place of sacrifice' (2:196), and: 'do not kill game while you are on pilgrimage' (5:95). Scented garments are excluded by the hadith above, and scholars extend this to applying perfume after entering ihram, and to cutting nails, on the same principle of leaving oneself untrimmed until release.",
          note: "Quran 2:196; Quran 5:95; Bukhari 25:29",
        },
        {
          title: "No marriage, no intimacy",
          detail:
            "Uthman reported that Allah's Messenger (peace be upon him) said: 'A Muhrim should neither marry himself, nor should he be got married to anyone, nor should he make the proposal of marriage.' And the verse of ihram closes the door on intimacy altogether: 'there should be no intimacy, foul language, and arguments during the pilgrimage.'",
          note: "Muslim 16:51; Quran 2:197",
        },
        {
          title: "If necessity forces a slip",
          detail:
            "The Quran itself builds in the concession: 'if anyone among you is sick or has an ailment of the scalp [and had his head shaved], then he must compensate by fasting, charity, or a sacrificial offering.' Ihram is a discipline, not a trap — necessity is met with a fidyah (compensation), not with despair.",
          note: "Quran 2:196",
        },
      ],
    },
  },
  {
    id: "the-talbiyah",
    name: "The Talbiyah",
    content: {
      intro:
        "From the miqat until the stoning on Eid morning, the pilgrim's anthem is the talbiyah — the answer of the whole caravan of Islam to the call Ibrahim was commanded to make.",
      verse: {
        arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ",
        text: "Labbaika Allahumma labbaik, Labbaika la sharika laka labbaik, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak — I respond to Your call O Allah, I respond to Your call, and I am obedient to Your orders, You have no partner, I respond to Your call. All the praises and blessings are for You, all the sovereignty is for You, and You have no partners with You.",
        ref: "Bukhari 25:35",
      },
      points: [
        {
          title: "The Prophet's own words",
          detail:
            "Ibn Umar preserved the exact talbiyah of Allah's Messenger (peace be upon him) — the words above, kept unchanged by the ummah for fourteen centuries. Jabir described the scene on the road: the people around the Prophet added phrases of their own, 'and the Messenger of Allah (peace be upon him) did not reject anything out of it. But the Messenger of Allah (peace be upon him) adhered to his own Talbiya.'",
          note: "Bukhari 25:35; Muslim 15:159",
        },
        {
          title: "When it begins",
          detail:
            "It begins at the miqat, the moment ihram is assumed — 'he used to start saying, \"Labbaik\" when the Mount stood upright' — and is repeated on every rise and descent of the road, kept alive on the tongue through the journey.",
          note: "Bukhari 25:2",
        },
        {
          title: "When it ends",
          detail:
            "Al-Fadl bin Abbas, who rode behind the Prophet (peace be upon him) from Muzdalifah to Mina, reported that 'he kept on reciting Talbiya till he did the Rami of the Jamra (Jamrat-Al-Aqaba)' on the morning of Eid. For Umrah, it ends when tawaf begins.",
          note: "Bukhari 25:165",
        },
      ],
    },
  },
];

const umrahTopics: Topic[] = [
  {
    id: "tawaf",
    name: "1 · Tawaf",
    content: {
      intro:
        "Umrah has four movements: tawaf, two rak'ahs, sa'i, and cutting the hair. It begins the moment you enter the Sacred Mosque — still in ihram, talbiyah now hushed — and walk to the Black Stone corner of the Ka'bah.",
      points: [
        {
          title: "Seven circuits, beginning at the Black Stone",
          detail:
            "Jabir described the Prophet's (peace be upon him) arrival at the House: 'he touched the pillar and (made seven circuits) running three of them and walking four.' Tawaf is seven counter-clockwise circuits with the Ka'bah on your left, each beginning and ending at the Black Stone; the brisk walk (raml) in the first three is Sunnah for men in the arrival tawaf.",
          note: "Muslim 15:159",
        },
        {
          title: "The Stone is greeted, not worshipped",
          detail:
            "Kiss the Black Stone if you can reach it easily, touch it, or simply gesture toward it from afar with 'Allahu Akbar' — scholars state that all three are valid, and no one should push or harm others for it. Umar set the compass for every pilgrim: 'No doubt, I know that you are a stone and can neither benefit anyone nor harm anyone. Had I not seen Allah's Messenger (peace be upon him) kissing you I would not have kissed you.'",
          note: "Bukhari 25:83",
        },
        {
          title: "Dhikr while you circle",
          detail:
            "There is no fixed litany for tawaf: make du'a, recite Quran, and remember Allah in your own words and language. Between the Yemeni corner and the Black Stone many keep the Quran's own du'a: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire' (2:201).",
          note: "Quran 2:201",
        },
      ],
    },
  },
  {
    id: "maqam-zamzam",
    name: "2 · Two Rak'ahs & Zamzam",
    content: {
      intro:
        "Tawaf is sealed with prayer at the Station of Ibrahim — the very stone he stood on while raising the walls of the House — exactly as the Quran instructs.",
      verse: {
        arabic: "وَإِذْ جَعَلْنَا ٱلْبَيْتَ مَثَابَةً لِّلنَّاسِ وَأَمْنًا وَٱتَّخِذُوا۟ مِن مَّقَامِ إِبْرَٰهِـۧمَ مُصَلًّى ۖ وَعَهِدْنَآ إِلَىٰٓ إِبْرَٰهِـۧمَ وَإِسْمَـٰعِيلَ أَن طَهِّرَا بَيْتِىَ لِلطَّآئِفِينَ وَٱلْعَـٰكِفِينَ وَٱلرُّكَّعِ ٱلسُّجُودِ",
        text: "And [remember] when We made the House [i.e., Ka'bah] a focal point and a sanctuary for the people. \"[O believers], take the Station of Abraham as a place for prayer.\" We charged Abraham and Ishmael to purify My House for those who perform circumambulation or stay for worship, or those who bow down and prostrate.",
        ref: "Quran 2:125",
      },
      points: [
        {
          title: "Two rak'ahs behind the Station",
          detail:
            "Jabir narrated that after tawaf the Prophet (peace be upon him) went 'to the Station of Ibrahim' and recited the verse 'And adopt the Station of Ibrahim as a place of prayer,' keeping the Station between himself and the House, and prayed two rak'ahs — reciting Surah al-Kafirun and Surah al-Ikhlas in the two rak'ahs. If the area is crowded, praying anywhere in the mosque fulfils the Sunnah.",
          note: "Muslim 15:159",
        },
        {
          title: "Drink Zamzam",
          detail:
            "At the end of his Hajj rites the Prophet (peace be upon him) came to his uncle's family drawing water at the well of Zamzam, 'so they handed him a basket and he drank from it.' Drinking one's fill of Zamzam after tawaf follows his example in the very place Allah brought the water out for Hajar and Isma'il.",
          note: "Muslim 15:159",
        },
      ],
    },
  },
  {
    id: "sai",
    name: "3 · Sa'i",
    content: {
      intro:
        "Sa'i retraces the steps of Hajar, who ran between the two hills searching water for her infant son until Allah brought forth Zamzam at his feet. Seven lengths between Safa and Marwah, walking in the footprints of a mother's trust in her Lord.",
      verse: {
        arabic: "۞ إِنَّ ٱلصَّفَا وَٱلْمَرْوَةَ مِن شَعَآئِرِ ٱللَّهِ ۖ فَمَنْ حَجَّ ٱلْبَيْتَ أَوِ ٱعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَن يَطَّوَّفَ بِهِمَا ۚ وَمَن تَطَوَّعَ خَيْرًا فَإِنَّ ٱللَّهَ شَاكِرٌ عَلِيمٌ",
        text: "Indeed, Safa and Marwah [mounts] are among the symbols of Allah. So whoever performs the pilgrimage or 'Umra, there is no blame upon him to go between them. And whoever does good voluntarily, then Allah is All-Appreciative, All-Knowing.",
        ref: "Quran 2:158",
      },
      points: [
        {
          title: "Begin at Safa",
          detail:
            "Approaching Safa, the Prophet (peace be upon him) recited this verse and said: 'I begin with what Allah (has commanded me) to begin.' He climbed Safa until he could see the House, faced the qiblah, and declared Allah's oneness and greatness, making long du'a three times.",
          note: "Muslim 15:159",
        },
        {
          title: "The dhikr on the hill",
          detail:
            "On Safa he proclaimed the oneness of Allah and glorified Him, saying that there is no god but Allah alone, without partner — His is the sovereignty and His is the praise, and He is powerful over everything; He alone fulfilled His promise, helped His servant, and routed the confederates alone. The same is repeated on Marwah at the end of each length.",
          note: "Muslim 15:159",
        },
        {
          title: "Seven lengths, running in the valley",
          detail:
            "Safa to Marwah is one; Marwah back to Safa is the second; the seventh ends at Marwah. Jabir described that 'when his feet came down in the bottom of the valley, he ran, and when he began to ascend he walked' — the stretch now marked by green lights, where men hasten and women walk normally.",
          note: "Muslim 15:159",
        },
      ],
    },
  },
  {
    id: "halq-taqsir",
    name: "4 · Halq or Taqsir",
    content: {
      intro:
        "The final act of Umrah: men shave the head (halq) or shorten the hair all over (taqsir); women clip a fingertip's length. With it, ihram ends and everything ordinary is permitted again.",
      points: [
        {
          title: "The triple du'a for those who shave",
          detail:
            "Allah's Messenger (peace be upon him) said: 'O Allah! Forgive those who get their heads shaved.' The people asked, 'Also those who get their hair cut short?' Only at the third time did he add: 'also (forgive) those who get their hair cut short.' Shaving carries the greater reward — but both complete the rite.",
          note: "Bukhari 25:206",
        },
        {
          title: "Women clip, never shave",
          detail:
            "Ibn Abbas reported that the Prophet (peace be upon him) said: 'Shaving is not a duty laid on women; only clipping the hair is incumbent on them.'",
          note: "Abu Dawud 11:264",
        },
        {
          title: "Umrah's reward",
          detail:
            "Allah's Messenger (peace be upon him) said: '(The performance of) Umra is an expiation for the sins committed (between it and the previous one).' A pilgrim who entered the sanctuary hours ago leaves it lighter than he came — and one who came for Hajj at-tamattu' now waits, released from ihram, for the 8th of Dhul-Hijjah.",
          note: "Bukhari 26:1",
        },
      ],
    },
  },
];

const daysTopics: Topic[] = [
  {
    id: "day-8-mina",
    name: "8th · To Mina",
    content: {
      intro:
        "Yawm at-Tarwiyah — the day of setting out. Pilgrims who released their ihram after Umrah (tamattu') re-enter ihram for Hajj from wherever they are staying, and the whole pilgrimage moves to the tent city of Mina.",
      points: [
        {
          title: "Assume ihram and go",
          detail:
            "Jabir narrated: 'when it was the day of Tarwiya (8th of Dhu'l-Hijja) they went to Mina and put on the Ihram for Hajj and the Messenger of Allah (peace be upon him) rode and led the noon, afternoon, sunset, Isha and dawn prayers' there — five prayers in Mina before Arafah.",
          note: "Muslim 15:159",
        },
        {
          title: "A quiet day of prayer",
          detail:
            "Anas confirmed where the Prophet (peace be upon him) prayed Zuhr and Asr on the day of Tarwiyah: 'at Mina.' Nothing else is prescribed for the day — the four-rak'ah prayers are shortened to two, as Ibn Umar said: 'I offered the prayer with the Prophet, Abu Bakr and Umar at Mina and it was of two rak'at' — each in its own time, with the talbiyah in between.",
          note: "Bukhari 25:134; Bukhari 18:3",
        },
        {
          title: "The night before the great day",
          detail:
            "The Prophet (peace be upon him) stayed the night in Mina and waited after Fajr 'a little till the sun rose' before moving on. The Sunnah of this night is rest — gathering strength and presence of heart for Arafah.",
          note: "Muslim 15:159",
        },
      ],
    },
  },
  {
    id: "day-9-arafah",
    name: "9th · Arafah",
    content: {
      intro:
        "The Day of Arafah is the heart of the pilgrimage. Everything else in Hajj has a substitute or a compensation — this standing has none. A pilgrim who reaches Arafah, even for a moment before the next dawn, has caught the Hajj.",
      points: [
        {
          title: "'The Hajj is Arafat'",
          detail:
            "The Messenger of Allah (peace be upon him) said: 'The Hajj is Arafat, the Hajj is Arafat, the Hajj is Arafat.' In Nasai's narration: 'Hajj is Arafat. Whoever catches up with the night of Arafat before dawn comes on the night of Jam (Al-Muzdalifah), his Hajj is complete.'",
          note: "Tirmidhi 47:27; Nasai 24:399",
        },
        {
          title: "The sermon and the combined prayer",
          detail:
            "After midday the Prophet (peace be upon him) addressed the people from the valley: 'Verily your blood, your property are as sacred and inviolable as the sacredness of this day of yours, in this month of yours, in this town of yours' — abolishing the blood-feuds and usury of the age of ignorance, charging men to fear Allah concerning women, and leaving behind 'the Book of Allah, and if you hold fast to it, you would never go astray.' Then Zuhr and Asr were prayed together, shortened, and the standing began.",
          note: "Muslim 15:159",
        },
        {
          title: "An afternoon of nothing but du'a",
          detail:
            "From then until sunset the Prophet (peace be upon him) simply stood facing the qiblah, supplicating. He said: 'The best of supplication is the supplication of the Day of Arafah. And the best of what I and the Prophets before me have said is: None has the right to be worshipped but Allah, Alone, without partner, to Him belongs all that exists, and to Him belongs the Praise, and He is powerful over all things.'",
          note: "Muslim 15:159; Tirmidhi 48:216 (hasan)",
        },
        {
          title: "The day Allah frees His slaves",
          detail:
            "A'isha reported the Prophet (peace be upon him) saying: 'There is no day when God sets free more servants from Hell than the Day of Arafa. He draws near, then praises them to the angels, saying: What do these want?'",
          note: "Muslim 15:492",
        },
        {
          title: "Pilgrims do not fast this day",
          detail:
            "When people wondered whether the Prophet (peace be upon him) was fasting at Arafah, Umm al-Fadl sent him a cup of milk 'and he was halting at Arafa, and he drank that' — in full view. Strength for the standing comes first. For everyone not on Hajj, the opposite is Sunnah: 'Fasting on the Day of Arafah, I hope from Allah, expiates for the sins of the year before and the year after.'",
          note: "Muslim 13:141; Ibn Majah 7:93",
        },
      ],
    },
  },
  {
    id: "muzdalifah",
    name: "Night · Muzdalifah",
    content: {
      intro:
        "At sunset the standing ends and the sea of pilgrims flows from Arafah to Muzdalifah — the Mash'ar al-Haram named in the Quran — for a night under the open sky.",
      verse: {
        arabic: "لَيْسَ عَلَيْكُمْ جُنَاحٌ أَن تَبْتَغُوا۟ فَضْلًا مِّن رَّبِّكُمْ ۚ فَإِذَآ أَفَضْتُم مِّنْ عَرَفَـٰتٍ فَٱذْكُرُوا۟ ٱللَّهَ عِندَ ٱلْمَشْعَرِ ٱلْحَرَامِ ۖ وَٱذْكُرُوهُ كَمَا هَدَىٰكُمْ وَإِن كُنتُم مِّن قَبْلِهِۦ لَمِنَ ٱلضَّآلِّينَ",
        text: "There is no blame upon you for seeking the bounty of your Lord [by trading]. But as you leave the plains of 'Arafāt, remember Allah at the Sacred Site [in Muzdalifah] and remember Him for having guided you, for you were previously among those who had gone astray.",
        ref: "Quran 2:198",
      },
      points: [
        {
          title: "Leave with calm",
          detail:
            "Riding out of Arafah, the Prophet (peace be upon him) 'pointed out to the people with his right hand to be moderate (in speed)' — no racing, no crushing. He delayed Maghrib until Muzdalifah: Usama, who rode behind him, asked about the prayer on the way and he replied, 'The prayer is ahead of you (i.e. at Al-Muzdalifa).'",
          note: "Muslim 15:159; Bukhari 25:152",
        },
        {
          title: "Two prayers, then sleep",
          detail:
            "At Muzdalifah 'Iqama for the prayer was pronounced and he offered the Maghrib prayer... and then Iqama for the prayer was pronounced and he offered the (Isha) prayer and he did not offer any prayer in between them.' Then, Jabir says, he 'lay down till dawn' — no night vigil is prescribed here; the worship of this night is rest.",
          note: "Bukhari 25:152; Muslim 15:159",
        },
        {
          title: "Dawn at the Sacred Site",
          detail:
            "He prayed Fajr at first light, then stood at the Mash'ar al-Haram facing the qiblah — 'supplicated Him, Glorified Him, and pronounced His Uniqueness' — until the sky was bright, and set off for Mina before sunrise. Pebbles for the stoning may be picked up here or anywhere along the way.",
          note: "Muslim 15:159; Quran 2:198",
        },
        {
          title: "The weak may go ahead",
          detail:
            "Ibn Abbas said: 'I was among those whom the Prophet (peace be upon him) sent on the night of Al-Muzdalifa early, being among the weak members of his family.' Women, children, the elderly and their carers may leave for Mina in the night — the Sharia builds mercy into the crowd.",
          note: "Bukhari 25:158",
        },
      ],
    },
  },
  {
    id: "day-10-nahr",
    name: "10th · Eid Day",
    content: {
      intro:
        "Yawm an-Nahr, the Day of Sacrifice — the busiest day of Hajj and the day the rest of the Muslim world celebrates Eid al-Adha. Four rites fall on it: stoning Jamrat al-Aqabah, the sacrifice, shaving or shortening, and Tawaf al-Ifadah.",
      verse: {
        arabic: "لَن يَنَالَ ٱللَّهَ لُحُومُهَا وَلَا دِمَآؤُهَا وَلَـٰكِن يَنَالُهُ ٱلتَّقْوَىٰ مِنكُمْ ۚ كَذَٰلِكَ سَخَّرَهَا لَكُمْ لِتُكَبِّرُوا۟ ٱللَّهَ عَلَىٰ مَا هَدَىٰكُمْ ۗ وَبَشِّرِ ٱلْمُحْسِنِينَ",
        text: "It is neither their flesh nor their blood that reaches Allah, but it is your piety that reaches Him. This is how He has subjected them to you, so that you may proclaim Allah's greatness for having guided you. And give glad tidings to those who do good.",
        ref: "Quran 22:37",
      },
      points: [
        {
          title: "Stone the great Jamrah",
          detail:
            "Arriving from Muzdalifah, the Prophet (peace be upon him) came to the Jamrah near the tree and 'threw seven small pebbles, saying Allah-o-Akbar while throwing every one of them.' Ibn Mas'ud stoned it the same way — seven small pebbles, Ka'bah on his left, Mina on his right — saying, 'This is the place where the one on whom Surat-al-Baqara was revealed stood.' With this throwing, the talbiyah falls silent.",
          note: "Muslim 15:159; Bukhari 25:227; Bukhari 25:165",
        },
        {
          title: "The sacrifice",
          detail:
            "The Prophet (peace be upon him) then went to the place of sacrifice and slaughtered sixty-three camels with his own hand. The animal is a hadi of thanks, obligatory for tamattu' and qiran pilgrims — and the verse above fixes its meaning: 'It is neither their flesh nor their blood that reaches Allah, but it is your piety that reaches Him.' Today most pilgrims delegate the slaughter through official vouchers, and the meat feeds the poor.",
          note: "Muslim 15:159; Quran 22:37; Quran 22:28",
        },
        {
          title: "Shave or shorten, and release",
          detail:
            "Then the head is shaved or the hair shortened — 'O Allah! Forgive those who get their heads shaved' — and the pilgrim exits the main restrictions of ihram: ordinary clothes and perfume return, with only marital relations held back until the tawaf. Scholars call this the first release (at-tahallul al-awwal).",
          note: "Bukhari 25:206",
        },
        {
          title: "Tawaf al-Ifadah",
          detail:
            "The Prophet (peace be upon him) 'again rode and came to the House, and offered the Zuhr prayer at Mecca.' This tawaf is a pillar of Hajj that no one may leave out: when he was told Safiyya had her menses, he said 'You will detain us. Did you perform Tawaf-al-Ifada on the day of Nahr?' — and when told yes, said 'Then you can depart.' Tamattu' pilgrims follow it with the sa'i of Hajj. With it, ihram ends completely.",
          note: "Muslim 15:159; Bukhari 68:74",
        },
        {
          title: "Out of order? 'No harm'",
          detail:
            "On this crowded day people came to the Prophet (peace be upon him) saying they had shaved before sacrificing or sacrificed before stoning. A man said, 'I performed the Tawaf-al-Ifada before the Rami.' He replied, 'There is no harm.' 'I had my head shaved before slaughtering.' 'There is no harm.' 'I have slaughtered the Hadi before the Rami.' 'There is no harm.'",
          note: "Bukhari 25:200",
        },
        {
          title: "The world celebrates with you",
          detail:
            "While the pilgrims sacrifice at Mina, Muslims everywhere pray the Eid prayer and offer their own sacrifice — the Prophet (peace be upon him) 'on the day of Id-ul-Adha slaughtered (sacrificed) two horned rams, black and white in color.' Eid al-Adha is the whole ummah joining the pilgrims' day.",
          note: "Bukhari 25:190",
        },
      ],
    },
  },
  {
    id: "tashriq",
    name: "11th–13th · Mina",
    content: {
      intro:
        "The days of tashriq — appointed days of eating, drinking and the remembrance of Allah, spent in the tents of Mina with one daily duty: the stoning of the three jamarat.",
      verse: {
        arabic: "۞ وَٱذْكُرُوا۟ ٱللَّهَ فِىٓ أَيَّامٍ مَّعْدُودَٰتٍ ۚ فَمَن تَعَجَّلَ فِى يَوْمَيْنِ فَلَآ إِثْمَ عَلَيْهِ وَمَن تَأَخَّرَ فَلَآ إِثْمَ عَلَيْهِ ۚ لِمَنِ ٱتَّقَىٰ ۗ وَٱتَّقُوا۟ ٱللَّهَ وَٱعْلَمُوٓا۟ أَنَّكُمْ إِلَيْهِ تُحْشَرُونَ",
        text: "And remember Allah during the appointed days. But whoever hastens to depart [Mina] on the second day, there is no sin upon him; and whoever delays [until the third], there is no sin upon him for those who fear Allah. So fear Allah, and know that you will be gathered before Him.",
        ref: "Quran 2:203",
      },
      points: [
        {
          title: "Stoning after midday",
          detail:
            "Wabra asked Ibn Umar when to stone the jamarat. He replied: 'We used to wait till the sun declined and then we would do the Rami (i.e. on the 11th and 12th of Dhul-Hijja).' Each of the three pillars receives seven pebbles, small to great.",
          note: "Bukhari 25:224",
        },
        {
          title: "Takbir with every pebble, du'a in between",
          detail:
            "Az-Zuhri described the Prophet's (peace be upon him) way: seven small pebbles at the first jamrah with takbir on each, then standing long facing the qiblah with raised hands in du'a; the same at the middle jamrah; and at Jamrat al-Aqabah he would throw and 'leave and not stay by it' — the stoning ends in movement, not lingering.",
          note: "Bukhari 25:231; Bukhari 25:230",
        },
        {
          title: "Two days or three",
          detail:
            "The verse gives the choice: leave Mina after the stoning of the 12th before sunset, or stay for the 13th — 'whoever hastens to depart on the second day, there is no sin upon him; and whoever delays, there is no sin upon him.' The Prophet (peace be upon him) said the same: 'The days of Mina are three: but whoever hastens to leave in two days, there is no sin on him, and whoever stays on, there is no sin on him.'",
          note: "Quran 2:203; Tirmidhi 47:27",
        },
        {
          title: "'Learn your rituals from me'",
          detail:
            "Jabir said: 'I saw Allah's Messenger (peace be upon him) flinging pebbles while riding his camel on the Day of Nahr, and he was saying: Learn your rituals (by seeing me performing them), for I do not know whether I would be performing Hajj after this Hajj of mine.' Every detail of these days is walked in his footsteps — it was his only Hajj, and his farewell.",
          note: "Muslim 15:341",
        },
      ],
    },
  },
  {
    id: "farewell",
    name: "Farewell Tawaf",
    content: {
      intro:
        "The last act before leaving Mecca: seven more circuits of the House, so that the pilgrim's final moment in the sanctuary is spent where the whole journey pointed.",
      points: [
        {
          title: "The last thing before leaving",
          detail:
            "Ibn Abbas said: 'The people were ordered to perform the Tawaf of the Ka'ba (Tawaf-al-Wada) as the lastly thing, before leaving (Mecca), except the menstruating women who were excused.'",
          note: "Bukhari 25:233",
        },
        {
          title: "Menstruating women are excused",
          detail:
            "The exemption is explicit in the same hadith — and in Safiyya's story: once the Prophet (peace be upon him) confirmed she had already performed Tawaf al-Ifadah, he said, 'Then you can depart.' The farewell tawaf is waived for her; the Ifadah is not.",
          note: "Bukhari 25:233; Bukhari 68:74",
        },
        {
          title: "Then carry it home",
          detail:
            "'When you have completed your rites, remember Allah as you used to remember your forefathers, or even with greater remembrance' (2:200). The pilgrimage ends at the Ka'bah, but the accepted Hajj shows itself in the life that follows it.",
          note: "Quran 2:200",
        },
      ],
    },
  },
];

const rulingsTopics: Topic[] = [
  {
    id: "three-ways",
    name: "Tamattu', Qiran, Ifrad",
    content: {
      intro:
        "The companions left Medina for the Farewell Hajj in three different states of ihram — and the Prophet (peace be upon him) approved them all. The three forms remain valid ways to perform Hajj to this day.",
      points: [
        {
          title: "The companions did all three",
          detail:
            "A'isha said: 'We set out with Allah's Messenger (peace be upon him) in the year of the Prophet's Last Hajj. Some of us had assumed Ihram for Umra only, some for both Hajj and Umra, and others for Hajj only.' Umrah alone first is tamattu'; both together is qiran; Hajj alone is ifrad.",
          note: "Bukhari 25:48",
        },
        {
          title: "Tamattu' — Umrah, release, then Hajj",
          detail:
            "The pilgrim performs Umrah in the Hajj season, leaves ihram and lives normally in Mecca, then re-enters ihram for Hajj on the 8th. This is what the Prophet (peace be upon him) commanded his companions without sacrificial animals to do, saying at Marwah: 'he who among you has not the sacrificial animals with him should put off Ihram and treat it as an Umra' — adding that Umrah had entered into Hajj 'for ever and ever.' A hadi is due: 'if anyone takes a break between Umrah and Hajj, he must offer a sacrifice of whatever animal is available... if he cannot afford an offering, he should fast for three days during Hajj and seven days upon his return.'",
          note: "Muslim 15:159; Quran 2:196",
        },
        {
          title: "Qiran — both under one ihram",
          detail:
            "The qarin joins Hajj and Umrah in a single ihram, kept until the Day of Sacrifice, and offers a hadi. The Prophet (peace be upon him) himself brought sacrificial animals and did not release his ihram; and when Uthman discouraged joining them, Ali assumed ihram for both together saying, 'Labbaik for Umra and Hajj — I will not leave the tradition of the Prophet (peace be upon him) on the saying of somebody.'",
          note: "Muslim 15:159; Bukhari 25:49",
        },
        {
          title: "Ifrad — Hajj alone",
          detail:
            "The mufrid enters ihram for Hajj only and no hadi is due. Which of the three is best is a question the madhhabs answer differently — each school reading the Farewell Hajj narrations its own way — and a pilgrim may follow any of them; most package groups today perform tamattu' for its ease.",
          note: "Bukhari 25:48",
        },
      ],
    },
  },
  {
    id: "on-behalf",
    name: "Hajj on Behalf of Another",
    content: {
      intro:
        "Islam does not let the obligation lapse for those whose bodies fail before their means do — and it does not forget its debts to the dead. Hajj can be performed on behalf of another, under clear conditions.",
      points: [
        {
          title: "The woman of Khath'am",
          detail:
            "During the Farewell Hajj a woman from the tribe of Khath'am asked: 'O Allah's Messenger (peace be upon him)! The obligation of Hajj enjoined by Allah on His devotees has become due on my father and he is old and weak, and he cannot sit firm on the Mount; may I perform Hajj on his behalf?' The Prophet (peace be upon him) replied, 'Yes, you may.' In the other narration she asks, 'Will the obligation be fulfilled if I perform Hajj on his behalf?' — and he replied in the affirmative.",
          note: "Bukhari 25:1; Bukhari 28:33",
        },
        {
          title: "Your own Hajj comes first",
          detail:
            "The Prophet (peace be upon him) heard a man say, 'Labbayk on behalf of Shubrumah.' He asked: 'Who is Shubrumah?' The man said: 'A brother or relative of mine.' He asked: 'Have you performed hajj on your own behalf?' He said: 'No.' He said: 'Perform hajj on your own behalf, then perform it on behalf of Shubrumah.'",
          note: "Abu Dawud 11:91",
        },
        {
          title: "Who it applies to",
          detail:
            "Scholars apply this to two cases: a person permanently unable to travel (like the Khath'ami woman's father), and a person who died with Hajj still owed — a son, daughter, or even a hired trustworthy pilgrim may perform it for them. The proxy must have completed their own Hajj first, as the Shubrumah hadith shows; the details of hiring and its conditions vary among the madhhabs.",
        },
      ],
    },
  },
  {
    id: "common-mistakes",
    name: "Common Mistakes",
    content: {
      intro:
        "Most 'mistakes' at Hajj come from fear or zeal — fear that a slip ruins everything, or zeal that harms other pilgrims. The Prophet's (peace be upon him) own Hajj answers both.",
      points: [
        {
          title: "Thinking one slip ruins the Hajj",
          detail:
            "On the busiest day of the rites, every question about doing things out of order got the same answer: 'There is no harm, there is no harm' (Bukhari 25:199). Genuine errors have fidyah and remedies, not ruin — ask a scholar with your group rather than despairing or guessing.",
          note: "Bukhari 25:199; Bukhari 25:200",
        },
        {
          title: "Pushing and harming others at the Stone",
          detail:
            "Kissing the Black Stone is Sunnah; not harming Muslims is obligatory — and Umar's words keep the kiss in its place: 'I know that you are a stone and can neither benefit anyone nor harm anyone.' When the crowd is thick, gesture from afar and move on. The Prophet (peace be upon him) signalled the same spirit leaving Arafah, motioning the crowds 'to be moderate (in speed).'",
          note: "Bukhari 25:83; Muslim 15:159",
        },
        {
          title: "Quarrels in the crowd",
          detail:
            "Heat, exhaustion and millions of people are the test inside the test. The verse of ihram names it directly: 'there should be no intimacy, foul language, and arguments during the pilgrimage.' And the reward hangs on exactly this: 'Whoever performs Hajj for Allah's pleasure and does not have sexual relations with his wife, and does not do evil or sins then he will return (after Hajj free from all sins) as if he were born anew.'",
          note: "Quran 2:197; Bukhari 25:9",
        },
        {
          title: "Inventing rituals",
          detail:
            "Nothing in Hajj is left to improvisation: 'Learn your rituals (by seeing me performing them)' (Muslim 15:341). Scholars caution against practices with no source — rubbing the Ka'bah's walls for blessing, collecting stones as relics, or fixed du'as claimed for each circuit of tawaf. The prescribed acts are few and clear; presence of heart fills the rest.",
          note: "Muslim 15:341",
        },
      ],
    },
  },
  {
    id: "after-hajj",
    name: "After Hajj",
    content: {
      intro:
        "The rites close with a command about what comes next — more remembrance, not less. The pilgrim goes home; the Hajj is meant to stay.",
      verse: {
        arabic: "وَمِنْهُم مَّن يَقُولُ رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْـَٔاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ",
        text: "And there are others who say, \"Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.\"",
        ref: "Quran 2:201",
      },
      points: [
        {
          title: "Remember Allah even more",
          detail:
            "'When you have completed your rites, remember Allah as you used to remember your forefathers, or even with greater remembrance' (2:200). The Quran then contrasts the one who asks only for this world with the one who prays the du'a above — the pilgrim's petition for both worlds.",
          note: "Quran 2:200; Quran 2:201",
        },
        {
          title: "The mark of acceptance",
          detail:
            "The reward of Hajj Mabrur — the accepted Hajj — 'is nothing except Paradise' (Bukhari 26:1). Scholars describe its sign as the state a person returns in: sins left behind at Mina, habits changed, worship steadier than before. The one who came back 'as if he were born anew' (Bukhari 25:9) is expected to live like it.",
          note: "Bukhari 26:1; Bukhari 25:9",
        },
        {
          title: "Keep the connection alive",
          detail:
            "Umrah remains open all year — 'Umra is an expiation for the sins committed (between it and the previous one)' (Bukhari 26:1) — and every Dhul-Hijjah brings the Day of Arafah fast and Eid al-Adha to those at home. The pilgrimage may be once in a lifetime; its season returns every year.",
          note: "Bukhari 26:1; Ibn Majah 7:93",
        },
      ],
    },
  },
];

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "ihram", label: "Ihram" },
  { key: "umrah", label: "Umrah Step-by-Step" },
  { key: "days", label: "The Days of Hajj" },
  { key: "rulings", label: "Types & Rulings" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* ───────────────────────── sub-components ───────────────────────── */

function VersePairCard({
  title,
  verses,
  refText,
  delay = 0,
}: {
  title: string;
  verses: { ar: string; en: string; ref: string }[];
  refText: string;
  delay?: number;
}) {
  return (
    <ContentCard delay={delay}>
      <h2 className="text-xl font-semibold text-themed mb-4">{title}</h2>
      <div className="space-y-4">
        {verses.map((v) => (
          <div key={v.ref}>
            <p className="text-lg font-arabic text-gold leading-loose text-right mb-1">{v.ar}</p>
            <p className="text-themed-muted text-sm italic">{v.en}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-themed-muted mt-4">
        <HadithRefText text={refText} />
      </p>
    </ContentCard>
  );
}

/* ───────────────────────── page ───────────────────────── */

function HajjContent() {
  useScrollToSection();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const t = searchParams.get("tab");
    return t && tabs.some((x) => x.key === t) ? (t as TabKey) : "overview";
  });
  // Deep-link support: ?tab=<key>&sub=<topic id>; ids are unique across the page.
  const initialSub = searchParams.get("sub");
  const [ihramSub, setIhramSub] = useState(() =>
    initialSub && ihramTopics.some((t) => t.id === initialSub) ? initialSub : ihramTopics[0].id
  );
  const [umrahSub, setUmrahSub] = useState(() =>
    initialSub && umrahTopics.some((t) => t.id === initialSub) ? initialSub : umrahTopics[0].id
  );
  const [daysSub, setDaysSub] = useState(() =>
    initialSub && daysTopics.some((t) => t.id === initialSub) ? initialSub : daysTopics[0].id
  );
  const [rulingsSub, setRulingsSub] = useState(() =>
    initialSub && rulingsTopics.some((t) => t.id === initialSub) ? initialSub : rulingsTopics[0].id
  );
  const [search, setSearch] = useState("");

  const replaceUrl = (tab: TabKey, sub?: string) => {
    router.replace(`${pathname}?tab=${tab}${sub ? `&sub=${sub}` : ""}`, { scroll: false });
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
    replaceUrl(key as TabKey);
  };

  const handleSubChange = (tab: TabKey, setter: (s: string) => void) => (sub: string) => {
    setter(sub);
    replaceUrl(tab, sub);
  };

  const topicMatches = (t: Topic) => {
    if (!search || search.length < 2) return true;
    return textMatch(
      search,
      t.name,
      t.content.intro,
      t.content.source,
      t.content.verse?.text,
      ...t.content.points.map((p) => p.title),
      ...t.content.points.map((p) => p.detail)
    );
  };

  /* auto-select the first visible topic when search filters out the active one */
  useEffect(() => {
    if (!search || search.length < 2) return;
    const fix = (topics: Topic[], active: string, set: (s: string) => void) => {
      const visible = topics.filter(topicMatches);
      if (visible.length && !visible.some((t) => t.id === active)) set(visible[0].id);
    };
    fix(ihramTopics, ihramSub, setIhramSub);
    fix(umrahTopics, umrahSub, setUmrahSub);
    fix(daysTopics, daysSub, setDaysSub);
    fix(rulingsTopics, rulingsSub, setRulingsSub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, ihramSub, umrahSub, daysSub, rulingsSub]);

  const renderTopicRail = (
    topics: Topic[],
    activeSub: string,
    onSubChange: (s: string) => void
  ) => {
    const visible = topics.filter(topicMatches);
    const active = visible.find((t) => t.id === activeSub);
    return (
      <SubTabLayout
        subs={visible.map((t) => ({ key: t.id, label: t.name }))}
        activeSub={activeSub}
        setActiveSub={onSubChange}
      >
        {active && <TopicInfoCard topic={active} />}
      </SubTabLayout>
    );
  };

  return (
    <div>
      <PageHeader
        title="Hajj & Umrah"
        titleAr="ٱلْحَجَّ وَٱلْعُمْرَةَ"
        subtitle="The fifth pillar — the journey to the House of Allah, its rites, its days, and its reward."
      />

      {/* Opening verse — the call of Ibrahim that every pilgrim answers. */}
      <VerseHero
        arabic="وَأَذِّن فِى ٱلنَّاسِ بِٱلْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ يَأْتِينَ مِن كُلِّ فَجٍّ عَمِيقٍ"
        text="And proclaim the pilgrimage to all people; they will come to you on foot and on every lean camel from every distant pathway,"
        reference="Quran 22:27"
      />

      <PageSearch value={search} onChange={setSearch} placeholder="Search rites, days, rulings..." className="mb-6" />

      <TabBar tabs={[...tabs]} activeTab={activeTab} onTabChange={handleTabChange} className="mb-6" />

      <AnimatePresence mode="wait">
        {/* ─── Overview ─── */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCard delay={0.1}>
              <h2 className="text-xl font-semibold text-themed mb-4">The fifth pillar of Islam</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  Hajj is the pilgrimage to the Ka&apos;bah in Mecca during the days of Dhul-Hijjah
                  — the fifth pillar on which the religion stands. The Prophet (peace be upon him)
                  said:{" "}
                  <em>
                    &ldquo;Verily, al-Islam is founded on five (pillars): testifying the fact that
                    there is no god but Allah, establishment of prayer, payment of Zakat, fast of
                    Ramadan and Pilgrimage to the House&rdquo;
                  </em>{" "}
                  (Muslim 1:22). For a few days the believer leaves home, wealth, and status behind
                  and walks the ground where Ibrahim raised the walls of the first House built for
                  the worship of Allah.
                </p>
                <p>
                  Umrah is the &ldquo;lesser pilgrimage&rdquo; — tawaf, sa&apos;i, and cutting the
                  hair — which may be performed at any time of year, alone or woven into the Hajj
                  itself. This page walks through both: the state of ihram, Umrah step by step, and
                  the six days of Hajj rite by rite.
                </p>
              </div>
            </ContentCard>

            <VersePairCard
              title="A duty owed to Allah"
              verses={houseVerses}
              refText="Quran 3:96-97"
              delay={0.15}
            />

            <ContentCard delay={0.2}>
              <h2 className="text-xl font-semibold text-themed mb-4">Who must go</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  The verse hangs the duty on one condition:{" "}
                  <em>&ldquo;upon all people who are able to make their way to it&rdquo;</em>{" "}
                  (Quran 3:97). This ability (istita&apos;ah) is classically described by scholars
                  as sound health for the journey, wealth that covers the trip and one&apos;s
                  dependents left behind, and a safe route — whoever lacks these is excused until
                  Allah grants them.
                </p>
                <p>
                  And the duty is once in a lifetime. When al-Aqra&apos; ibn Habis asked the
                  Prophet (peace be upon him) whether Hajj was due annually or only once, he
                  replied:{" "}
                  <em>
                    &ldquo;Only once, and if anyone performs it more often, he performs a
                    supererogatory act&rdquo;
                  </em>{" "}
                  (Abu Dawud 11:1).
                </p>
                <p>
                  A woman travels with her husband or a mahram: when a man told the Prophet (peace
                  be upon him) that he was enlisted for an expedition while his wife had left for
                  Hajj, he said, <em>&ldquo;Go along with her (to Hajj)&rdquo;</em> (Bukhari 28:42).
                  Whether a woman may make the obligatory Hajj with a trustworthy group when she
                  has no mahram is a question the madhhabs answer differently — some require the
                  mahram absolutely, others permit safe company for the obligatory journey.
                </p>
                <p>
                  For the one whose body fails before the means do — and for the dead who owed the
                  Hajj — the pilgrimage can be performed on their behalf. See{" "}
                  <em>Types &amp; Rulings → Hajj on Behalf of Another</em>.
                </p>
              </div>
            </ContentCard>

            <ContentCard delay={0.25}>
              <h2 className="text-xl font-semibold text-themed mb-4">What the pilgrim comes home with</h2>
              <div className="space-y-4 text-themed-muted text-sm leading-relaxed">
                <p>
                  The Prophet (peace be upon him) was asked which deed is best. He said:{" "}
                  <em>&ldquo;To believe in Allah and His Apostle.&rdquo;</em> Then what?{" "}
                  <em>&ldquo;To participate in Jihad in Allah&apos;s Cause.&rdquo;</em> Then what?{" "}
                  <em>&ldquo;To perform Hajj-Mabrur&rdquo;</em> (Bukhari 25:7) — and to A&apos;isha
                  he said: <em>&ldquo;The best Jihad (for women) is Hajj Mabrur&rdquo;</em>{" "}
                  (Bukhari 25:8).
                </p>
                <p>
                  Its reward:{" "}
                  <em>
                    &ldquo;(The performance of) Umra is an expiation for the sins committed
                    (between it and the previous one). And the reward of Hajj Mabrur (the one
                    accepted by Allah) is nothing except Paradise&rdquo;
                  </em>{" "}
                  (Bukhari 26:1). And its cleansing:{" "}
                  <em>
                    &ldquo;Whoever performs Hajj for Allah&apos;s pleasure and does not have sexual
                    relations with his wife, and does not do evil or sins then he will return
                    (after Hajj free from all sins) as if he were born anew&rdquo;
                  </em>{" "}
                  (Bukhari 25:9).
                </p>
              </div>
            </ContentCard>

            <ContentCard delay={0.3}>
              <h3 className="font-semibold text-themed mb-2">Companion pages</h3>
              <p className="text-themed-muted text-sm leading-relaxed">
                Hajj sits inside a wider season — the ten days of Dhul-Hijjah and Eid al-Adha —
                and alongside the other four pillars.
              </p>
              <div className="flex gap-3 flex-wrap mt-3">
                <Link
                  href="/pillars"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  The five pillars →
                </Link>
                <Link
                  href="/islamic-calendar"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Dhul-Hijjah &amp; Eid al-Adha →
                </Link>
                <Link
                  href="/duas"
                  className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                >
                  Du&apos;as for travel &amp; worship →
                </Link>
              </div>
            </ContentCard>

            <SourcesCard
              delay={0.35}
              sources={[
                { ref: "Quran 22:27", desc: "The command to Ibrahim: proclaim the pilgrimage to all people" },
                { ref: "Quran 3:96-97", desc: "The first House at Bakkah; pilgrimage a duty on those able" },
                { ref: "Muslim 1:22", desc: "Islam is founded on five pillars" },
                { ref: "Abu Dawud 11:1", desc: "Hajj is obligatory once; more is voluntary" },
                { ref: "Bukhari 28:42", desc: "'Go along with her (to Hajj)' — the mahram and the wife's Hajj" },
                { ref: "Bukhari 25:7; Bukhari 25:8", desc: "Hajj Mabrur among the best of deeds" },
                { ref: "Bukhari 26:1", desc: "Umrah expiates; the reward of Hajj Mabrur is Paradise" },
                { ref: "Bukhari 25:9", desc: "The pilgrim returns as if born anew" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Ihram ─── */}
        {activeTab === "ihram" && (
          <motion.div
            key="ihram"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(ihramTopics, ihramSub, handleSubChange("ihram", setIhramSub))}

            <SourcesCard
              className="mt-8"
              sources={[
                { ref: "Quran 2:196-197", desc: "Complete Hajj and Umrah for Allah; the conduct of ihram" },
                { ref: "Quran 5:95", desc: "No hunting while on pilgrimage" },
                { ref: "Bukhari 25:12", desc: "The mawaqit fixed for each direction" },
                { ref: "Bukhari 25:29", desc: "What a muhrim may not wear" },
                { ref: "Abu Dawud 11:106", desc: "The muhrima does not veil her face or wear gloves" },
                { ref: "Muslim 16:51", desc: "A muhrim neither marries nor proposes" },
                { ref: "Bukhari 25:35", desc: "The talbiyah of Allah's Messenger, word for word" },
                { ref: "Bukhari 25:2", desc: "The talbiyah begun at Dhul-Hulaifa" },
                { ref: "Bukhari 25:165", desc: "Talbiyah continues until the stoning of Jamrat al-Aqabah" },
                { ref: "Muslim 15:159", desc: "Jabir's narration of the Farewell Hajj" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Umrah ─── */}
        {activeTab === "umrah" && (
          <motion.div
            key="umrah"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(umrahTopics, umrahSub, handleSubChange("umrah", setUmrahSub))}

            <SourcesCard
              className="mt-8"
              sources={[
                { ref: "Muslim 15:159", desc: "The Prophet's tawaf, two rak'ahs, sa'i and Zamzam — Jabir's narration" },
                { ref: "Bukhari 25:83", desc: "Umar at the Black Stone: 'you are a stone'" },
                { ref: "Quran 2:125", desc: "Take the Station of Abraham as a place for prayer" },
                { ref: "Quran 2:158", desc: "Safa and Marwah are among the symbols of Allah" },
                { ref: "Bukhari 25:206", desc: "'O Allah! Forgive those who get their heads shaved'" },
                { ref: "Abu Dawud 11:264", desc: "Women clip; shaving is not for them" },
                { ref: "Bukhari 26:1", desc: "Umrah is an expiation for what is between it and the last" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── The Days of Hajj ─── */}
        {activeTab === "days" && (
          <motion.div
            key="days"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(daysTopics, daysSub, handleSubChange("days", setDaysSub))}

            <SourcesCard
              className="mt-8"
              sources={[
                { ref: "Muslim 15:159", desc: "Jabir's day-by-day narration of the Farewell Hajj" },
                { ref: "Bukhari 25:134; Bukhari 18:3", desc: "Prayers at Mina on the 8th, shortened to two rak'ahs" },
                { ref: "Tirmidhi 47:27; Nasai 24:399", desc: "'The Hajj is Arafat' — and the days of Mina" },
                { ref: "Muslim 15:492", desc: "No day Allah frees more servants from the Fire than Arafah" },
                { ref: "Tirmidhi 48:216", desc: "The best supplication is that of the Day of Arafah (hasan)" },
                { ref: "Muslim 13:141; Ibn Majah 7:93", desc: "The Prophet did not fast at Arafah; its fast for those at home" },
                { ref: "Quran 2:198", desc: "Remember Allah at the Mash'ar al-Haram" },
                { ref: "Bukhari 25:152", desc: "Maghrib and Isha joined at Muzdalifah" },
                { ref: "Bukhari 25:158", desc: "The weak sent ahead from Muzdalifah by night" },
                { ref: "Bukhari 25:227; Bukhari 25:231", desc: "Seven pebbles with takbir; the Prophet's way at the jamarat" },
                { ref: "Quran 22:37", desc: "Neither flesh nor blood reaches Allah — but your piety" },
                { ref: "Bukhari 25:190", desc: "Eid al-Adha: the Prophet's camels and two horned rams" },
                { ref: "Bukhari 25:200", desc: "'There is no harm' — flexibility in the order of Eid-day rites" },
                { ref: "Bukhari 68:74", desc: "Tawaf al-Ifadah is indispensable — Safiyya's story" },
                { ref: "Quran 2:203; Bukhari 25:224", desc: "The appointed days; stoning after the sun declines" },
                { ref: "Bukhari 25:233", desc: "The farewell tawaf, the last act before leaving" },
                { ref: "Muslim 15:341", desc: "'Learn your rituals from me'" },
              ]}
            />
          </motion.div>
        )}

        {/* ─── Types & Rulings ─── */}
        {activeTab === "rulings" && (
          <motion.div
            key="rulings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTopicRail(rulingsTopics, rulingsSub, handleSubChange("rulings", setRulingsSub))}

            <SourcesCard
              className="mt-8"
              sources={[
                { ref: "Bukhari 25:48", desc: "The companions entered ihram in all three forms" },
                { ref: "Muslim 15:159", desc: "'Treat it as an Umra' — tamattu' commanded; qiran kept with the hadi" },
                { ref: "Quran 2:196", desc: "The tamattu' sacrifice, or ten days of fasting" },
                { ref: "Bukhari 25:49", desc: "Ali: 'Labbaik for Umra and Hajj' — refusing to leave the Sunnah" },
                { ref: "Bukhari 25:1; Bukhari 28:33", desc: "The woman of Khath'am — Hajj on behalf of her aged father" },
                { ref: "Abu Dawud 11:91", desc: "'Perform hajj on your own behalf, then on behalf of Shubrumah'" },
                { ref: "Bukhari 25:199; Bukhari 25:200", desc: "'There is no harm, there is no harm'" },
                { ref: "Bukhari 25:83", desc: "The Stone neither benefits nor harms" },
                { ref: "Quran 2:197", desc: "No obscenity, wickedness, or quarrels in Hajj" },
                { ref: "Bukhari 25:9", desc: "Returning as if born anew" },
                { ref: "Quran 2:200-201", desc: "After the rites: remember Allah with greater remembrance" },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HajjPage() {
  return (
    <Suspense>
      <HajjContent />
    </Suspense>
  );
}
