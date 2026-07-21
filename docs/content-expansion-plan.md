# Content Expansion Plan — every page, audited for depth

_Generated 2026-07-21 by a 20-agent audit (one auditor per page + an app-wide completeness
critic). Each auditor mapped the page's full current coverage, assessed it as three readers
(new Muslim / practicing Muslim seeking daleel / parent-teacher), and **spot-checked the local
corpus** for every high-priority proposal — the refs named under "sourcing" were actually
found in `packages/content`; nothing is invented. Items marked `needs-external-source` or
`scholarly-summary-generic` would follow the same named-grading / generic-attribution rules
as the existing content._

**How to review:** mark items keep/skip (e.g. "salah: 1,2,4; zakat page yes; skip women for
now"). Approved items get built in verified waves like the IA redesign.

---

**At a glance:** 28 pages audited · **314 proposed additions** (133 high · 146 medium · 35 low) · 258 already verified buildable from the local corpus · 11 subjects with no home at all.

---

## The critic's Top 10 — highest impact across the app

- 1. Zakat dedicated page — an entire pillar of Islam with no page; every earning Muslim needs it yearly, and a calculator fits the app's existing tool pattern (prayer-times, qiblah, inheritance-calculator proposal). Anchors verified locally (Quran 9:60, Ibn Majah 1783).
- 2. Hajj & Umrah dedicated page — the second absent pillar; guaranteed seasonal traffic every Dhul Hijjah and the umrah walkthrough serves users year-round (Quran 3:97, Tirmidhi 1658 verified).
- 3. Salah situational-fiqh cluster (sujud al-sahw, missed prayers, traveler, illness/seated, congregation) — the digest's densest block of [high] gaps on the app's most-used worship page; these are the questions people actually search mid-life, not theory.
- 4. Tawbah & istighfar page — completely absent yet central to the app's spiritual retention arc (Ramadan, muslim-daily, protection all implicitly point at it); Quran 39:53 and Sayyid al-Istighfar verified in corpus.
- 5. Halal living daily-fiqh page (food, riba/finance, dress) — the highest-volume practical question class for the app's Western audience with no home anywhere; riba texts verified locally.
- 6. 'Becoming Muslim' tab on /why-islam — converts are the highest-stakes users the app can serve; the page currently argues the case but abandons the reader at the moment of decision; also resolves the pillars-page Shahada overlap.
- 7. Women's fiqh page — menstruation/istihada rules gate salah and fasting for half of all users and exist nowhere in the app; Ibn Majah 620-621 (Fatimah bint Abi Hubaysh) verified locally.
- 8. Kids: surface the 14 already-written hidden prophet stories — the single cheapest win in the entire digest: finished, presumably reviewed content earning zero value while hidden.
- 9. Akhlaq & diseases-of-the-heart page — character is a pillar of the religion's presentation and the adult app has no home for patience, sincerity, envy, backbiting, anger; 'best of you in character' narrations verified locally.
- 10. Post-salah adhkar (salah topic) + dhikr 'After every prayer' preset — a five-times-daily habit loop that converts content into recurring engagement with the app's counter tool; write once, cross-link salah/dhikr/duas.

---

## Subjects missing entirely (no page, no home)

### 🔴 HIGH · Zakat (dedicated page)
- **Placement:** Own page (/zakat). The pillars auditor proposed only a 'how to calculate' topic — the third pillar needs full treatment: who must pay, nisab & hawl, zakatable assets (cash, gold, stocks, crypto, business), the eight recipients, zakat al-fitr, and a calculator tool (fits the app's prayer-times/qiblah tool pattern).
- **Corpus anchors:** Verified local: Quran 9:60 (recipients, packages/content/quran/verses/9.json); Ibn Majah 1783 ('taken from the rich and given to the poor' — Muadh to Yemen, packages/content/hadith/ibnmajah/8.json); Quran 2:110 in verses/2.json.

### 🔴 HIGH · Hajj & Umrah (dedicated page)
- **Placement:** Own page (/hajj). The pillars auditor proposed a 'companion' tab, but a fifth pillar with day-by-day rites, ihram, talbiyah, umrah walkthrough, types of hajj, common mistakes, and proxy hajj outgrows a tab — and it cross-feeds the proposed Dhul Hijjah non-pilgrim guide on islamic-calendar.
- **Corpus anchors:** Verified local: Quran 3:97 (obligation, verses/3.json); Tirmidhi 1658 and Ibn Majah 2888 ('accepted Hajj has no reward but Paradise').

### 🔴 HIGH · Tawbah & istighfar (repentance)
- **Placement:** Own page (/tawbah) — zero coverage anywhere in the inventory or the digest. Conditions of repentance, despair vs hope, Sayyid al-Istighfar, the man who killed 99, sins between people vs sins against Allah, relapse and returning.
- **Corpus anchors:** Verified local: Quran 39:53 ('do not despair of Allah's mercy') and 66:8 (sincere tawbah); Nasai 5522 (best supplication for forgiveness = Sayyid al-Istighfar); the 'killed ninety-nine' narration present in muslim corpus (id 6952).

### 🔴 HIGH · Halal living — daily fiqh of food, finance, and dress
- **Placement:** Own page (/halal-living or similar) with tabs: Food & drink (halal meat, alcohol, gelatin, eating out), Money (riba, mortgages, loans, insurance, investing), Dress & appearance, Work & entertainment. This is the single most-asked practical question class for Western Muslims and has no home; why-islam and muslim-daily only graze it.
- **Corpus anchors:** Verified local: Quran 2:275 (riba, verses/2.json); Tirmidhi 1206 / Ibn Majah 2277 (the consumer of riba cursed); Quran 24:31 (dress, verses/24.json); Quran 5:3 forbidden foods available in verses/5.json.

### 🔴 HIGH · Akhlaq & diseases of the heart (adult character page)
- **Placement:** Own page (/character or /akhlaq). Kids has manners and muslim-daily has 'Speech & Conduct', but there is no adult treatment of sincerity (ikhlas/riya), patience, gratitude, humility, envy, backbiting, anger, arrogance, forgiveness — a pillar of any Islamic companion app.
- **Corpus anchors:** Verified local: Bukhari 6035 and Tirmidhi 2018 ('the best among you are those best in character'); Ibn Majah 3671 ('sent to perfect good character'); Quran 49:12 (backbiting) in verses/49.json.

### 🔴 HIGH · Women in Islam + women-specific fiqh
- **Placement:** Own page (/women). Menstruation/istihada/nifas rules gate salah, fasting, Quran-touching, and mosque attendance for half the user base and appear nowhere; plus hijab in depth, women's mosque access, women scholars (Aisha), and status-of-women dawah material (currently why-islam only handles the polemic side).
- **Corpus anchors:** Verified local: Quran 33:35 (verses/33.json); Ibn Majah 620–621 (Fatimah bint Abi Hubaysh istihada rulings, packages/content/hadith/ibnmajah/1.json); Bukhari Book of Menses present under bukhari/ per-book files.

### 🟡 MED · Fasting beyond Ramadan (voluntary fasts)
- **Placement:** Tab on /ramadan (retitle rail 'Fasting') or topic on /islamic-calendar: Mondays/Thursdays, White Days, Ashura, Arafah, fast of Dawud, six of Shawwal, who may not fast. Note: islamic-calendar's proposed 'Recurring Sunnah days' partially covers this — coordinate ownership there.
- **Corpus anchors:** Verified local: Quran 2:183 (verses/2.json); Ashura/Arafah expiation narrations in tirmidhi/muslim fasting books (spot-check before writing).

### 🟡 MED · Companions & early Islamic history (post-Prophet)
- **Placement:** Own page (/companions or /history). The Rashidun caliphate, the ten promised Paradise as a set, preservation of the Quran under Abu Bakr/Uthman, and the spread of Islam are covered nowhere; prophet-muhammad's companions tab and sects' proposed timeline only graze it, and both would cross-link into it.
- **Corpus anchors:** Verified local: Tirmidhi 3859/2221 ('the best of people are my generation'); Tirmidhi 3861/3866 ('do not abuse my companions'); companion-virtue chapters exist in tirmidhi/49.json.

### 🟡 MED · About the Quran (Quran sciences intro)
- **Placement:** Tab or landing section on the /quran reader (or small own page): what the Quran is, how revelation came, compilation & preservation, virtues of recitation, etiquette (wudu, tajwid pointer to /learn-arabic), intro to what tafsir is (the reader already ships Mukhtasar/Ibn Kathir with no explanation of what they are).
- **Corpus anchors:** Verified local: Bukhari 5027 ('the best among you are those who learn the Quran and teach it', bukhari/66.json); Quran 15:9 (preservation) in verses/15.json — also proposed by the miracles auditor, cross-link rather than duplicate.

### 🟡 MED · New-Muslim onboarding path (cross-app curriculum)
- **Placement:** Extend why-islam's proposed 'Becoming Muslim' tab into a sequenced start-here path (or /new-muslim route): shahada → wudu → salah basics → first surahs → community, each step deep-linking existing pages (salah, learn-arabic, duas, pillars). The tab proposal covers the content; the guided cross-page sequence is what's missing.
- **Corpus anchors:** Content anchors already live on target pages; the shahada-conditions material exists on /pillars per the tawhid auditor's cross-link note.

### ⚪ LOW · Sadaqah & generosity (beyond zakat)
- **Placement:** Tab on the new zakat page: sadaqah jariyah, 'charity does not decrease wealth', giving in secret, smiling/removing harm as charity — distinct from obligatory zakat and currently scattered (death-rites and family both touch sadaqah jariyah).
- **Corpus anchors:** Spot-check 'charity does not decrease wealth' and sadaqah jariyah narrations in muslim/tirmidhi before writing; Quran 2:261 (seven-hundredfold) in verses/2.json.

---

## Per-page additions

### /salah — 16 proposals (9 high)

_Current coverage: Six top tabs (already at the house max): 'Salah' (what is salah, prerequisites list, five-prayers overview, Types of Prayer accordion: fard/sunnah mu'akkadah/ghair/witr/nafl/fard kifayah), 'Why It Matters' (5 daleel points), 'Purification' (SubTabLayout rail: overview, steps of wudu with fard/sunnah chips, duas, sunnah acts, nullifiers, ghusl, tayammum), 'Adhan & Iqamah' (full texts + audio playback), 'The Prayers' (rail: Fajr–Isha cards + Jumu'ah accordion, plus a 13-step interactive PrayerGuide with PrayerFigure and per-rak'ah structure), and 'Voluntary & Special' (rail: Tahajjud, Duha, Tawbah, Istikhara, Tarawih, Eid, Janazah). Strong on the ideal-case how-to-pray and purification; almost silent on real-life situations (mistakes, travel, illness, missed prayers, congregation) and on what happens before (answering the adhan) and after (post-salah adhkar) the prayer itself._

**1. 🔴 HIGH · Sujud al-Sahw — the forgetfulness prostration (what to do when you make a mistake in prayer)**
   - Where: New rail entry in 'The Prayers' tab (after Jumu'ah), label e.g. 'Mistakes & Sujud al-Sahw'
   - Why: Every new Muslim (and everyone else) loses count of rak'at or forgets the middle sitting within their first week of praying, and the page offers no answer at all.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 22:2 Ibn Buhaina — stood without the middle sitting, two prostrations before taslim; Bukhari 22:3 — prayed five rak'at, prostrated after; Bukhari 22:4 — Dhul-Yadain, taslim after two rak'at then completed and prostrated)

**2. 🔴 HIGH · Missed prayers — qada, sleeping through, and building consistency after lapses**
   - Where: New rail entry in 'The Prayers' tab ('Missed Prayers')
   - Why: "I slept through Fajr / I have years of missed prayers — what now?" is among the most common practical prayer questions and the page never addresses it.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Nasai 6:120 & 6:126 — 'Whoever forgets a prayer, let him pray it when he remembers it'; Nasai 6:122 — Abu Qatadah: 'there is no negligence in sleep')

**3. 🔴 HIGH · Prayer of the traveler — shortening (qasr) and combining (jam')**
   - Where: New rail entry in 'The Prayers' tab ('When Traveling')
   - Why: Practicing families travel constantly and need the concrete rules: which prayers shorten to 2, when combining is allowed, distance/duration positions, praying on a plane.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Quran 4:101 — 'no blame to shorten the prayer'; Bukhari 18:1 — nineteen days praying shortened; Bukhari 18:10 — Anas: 4 rak'at in Madinah, 2 at Dhul-Hulaifa; Muslim 6:61 & 6:64 — combining Zuhr/Asr and Maghrib/Isha on journeys)

**4. 🔴 HIGH · Praying while ill, seated, or on a chair**
   - Where: New rail entry in 'The Prayers' tab ('When Ill or Seated'), could share a rail entry with the traveler topic as 'Prayer in Special Situations'
   - Why: Elderly users, hospital patients, and anyone injured needs the standing→sitting→lying-down concession chain and how to gesture ruku'/sujud from a chair.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 18:37 — Imran b. Husain: 'Pray while standing and if you can't... sitting... on your side'; Bukhari 10:83 — the Prophet prayed sitting after his fall; Muslim 6:145 & Abu Dawud 2:562 — sitting voluntary prayer is half the reward of standing)

**5. 🔴 HIGH · Praying in congregation — virtues, following the imam, rows, catching a rak'ah, women at the mosque, voluntary prayer at home**
   - Where: New rail entry in 'The Prayers' tab ('In Congregation')
   - Why: The page teaches praying alone perfectly but says nothing about the default communal form — a new Muslim's first mosque visit (where to stand, what to do if you join late) is completely unguided.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 10:42 & 10:46 — congregation 27x superior; Muslim 4:97 — 'the Imam is appointed to be followed'; Bukhari 10:112–117 — 'Straighten your rows'; Muslim 4:152 & Abu Dawud 2:175 — do not prevent women from the mosques; Bukhari 19:63 — 'offer some of your prayers in your houses'; Bukhari 10:28 / 95:1 — 'pray as you have seen me praying')

**6. 🔴 HIGH · After the prayer — the post-salah adhkar (istighfar x3, Allahumma Antas-Salam, tasbih 33/33/34, mu'awwidhat, Ayat al-Kursi)**
   - Where: Add as a final 'After the Taslim' step/panel in the PrayerGuide plus a short section under 'The Prayers'; cross-link /duas#after-completing-prayer and /dhikr (both already exist and partially cover this)
   - Why: The interactive guide ends abruptly at the taslim — 'what do I say after prayer?' is the immediate next question of every learner, and the sunnah here is rich and easy to present.
   - Size: topic (a rail entry) · Kind: missing-narrations
   - Sourcing: local-verified (Muslim 5:171 & Ibn Majah 5:126 — Thawban: istighfar three times then 'Allahumma Antas-Salam'; Muslim 5:184 & 5:188 — tasbih/tahmid/takbir 33 after every prayer; Abu Dawud 8:108 & Nasai 13:158 — the mu'awwidhat after every prayer). Note: the famous Ayat-al-Kursi-after-every-prayer narration (Nasai al-Kubra) was NOT found in the local corpus — that one point needs-external-source

**7. 🔴 HIGH · Responding to the adhan — repeating after the muadhdhin, the du'a after the adhan (intercession hadith), du'a between adhan and iqamah**
   - Where: New section inside the 'Adhan & Iqamah' tab, after the adhan text (tab key 'adhan' is deep-linked — do not rename)
   - Why: The tab presents the adhan as text to read but never tells the user the sunnah of answering it — one of the easiest, highest-reward daily practices, tied directly to the app's adhan playback feature.
   - Size: topic (a rail entry) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 10:9 & Muslim 4:12 — 'say what the Mu'adhdhin is saying'; Bukhari 10:12 & Abu Dawud 2:139 — 'Allahumma Rabba hadhihi-d-da'wati-t-tammah...' earns the Prophet's intercession; Abu Dawud 2:131 — 'the supplication made between the adhan and the iqamah is not rejected')

**8. 🔴 HIGH · What invalidates the prayer + common mistakes (the man who prayed badly, tranquility, talking, looking around, sutrah etiquette)**
   - Where: New rail entry in 'The Prayers' tab, or an accordion appended to the intro tab; pairs naturally with the Sujud al-Sahw entry
   - Why: Purification has a 'Nullifiers' pill but salah itself has none — users need to know rushing without stillness invalidates the prayer, that speaking breaks it, and the etiquette of passing in front of someone praying.
   - Size: topic (a rail entry) · Kind: practical-guide
   - Sourcing: local-verified (Bukhari 10:188 / 10:151 — 'Go back and pray, for you have not prayed' with the tranquility checklist; Nasai 13:40 — Mu'awiyah b. al-Hakam, no human speech in prayer; Bukhari 59:100 — looking around is 'a snatching by Satan'; Bukhari 8:157 & Muslim 4:294 — sin of passing in front of a praying person; Bukhari 13:21–22 — the spear planted as a sutrah)

**9. 🔴 HIGH · Complete the Purification rail: wiping over khuffs/socks (mash) + cleaning impurities (najasah)**
   - Where: Two new rail entries in the 'Purification' tab (rail currently has 7 pills; 9 is fine)
   - Why: The rail covers rare tayammum but omits khuff-wiping — a daily-relevance concession for converts in cold climates and workers — and never explains the 'clean body, clothes, place' prerequisite (how to actually clean urine, pet mess, etc.).
   - Size: sub-tab · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 4:72 — Mughirah, wiping over the khuffs; Muslim 2:89 — Jarir; Tirmidhi 1:95 — Khuzaimah: three days for the traveler, one for the resident; Bukhari 78:56 & Muslim 2:125 — the bedouin who urinated in the mosque, pour water over it)

**10. 🟡 MED · Witr as a full entry with the Qunut du'a text (Allahumma-hdini fiman hadayt)**
   - Where: New rail entry in 'Voluntary & Special' (tab key 'voluntary' is deep-linked — do not rename); Witr currently exists only as a Types-of-Prayer accordion row and a note under Isha
   - Why: The page tells users Witr 'includes the Qunut supplication' but never gives the du'a text, formats (1 vs 2+1 vs 3), or a how-to — practicing users pray it nightly.
   - Size: topic (a rail entry) · Kind: deepen-existing
   - Sourcing: local-verified (Abu Dawud 8:10, Tirmidhi 3:12, Nasai 20:148–149 — al-Hasan ibn Ali taught the Qunut words for Witr; Abu Dawud 5:101 — the Prophet's 13 rak'at with Witr; Bukhari 14:9 already cited on page)

**11. 🟡 MED · Complete the Voluntary & Special roster: Tahiyyat al-Masjid, Salat al-Kusuf (eclipse), Salat al-Istisqa (rain)**
   - Where: Three new rail entries in 'Voluntary & Special' (rail grows from 7 to 10 pills — acceptable, or group Kusuf/Istisqa as one 'Occasional Prayers' entry)
   - Why: Tahiyyat al-masjid is a habit every mosque-goer should know, and eclipse/rain prayers spike in demand on the actual days they occur (and are classic parent/teacher questions).
   - Size: sub-tab · Kind: new-subtopic
   - Sourcing: local-verified (Abu Dawud 2:77 — pray two rak'at before sitting when entering the mosque; Bukhari 56:292 — the Prophet's two rak'at on entering the mosque after journeys; Bukhari 16:1 & 16:4 — the eclipse prayer at Ibrahim's death, 'they are not eclipsed for anyone's death'; Bukhari 15:1 & 15:6 — turning the cloak inside out at Istisqa; Bukhari 15:14 — the man asking for rain during the khutbah)

**12. 🟡 MED · Forbidden and disliked prayer times (after Fajr until sunrise, zenith, after Asr)**
   - Where: Points added to the intro tab's Prerequisites card or a short card in 'Voluntary & Special' (it governs when nafl like Duha/makeup can be prayed); cross-link /prayer-times
   - Why: Users told to pray Duha 'after sunrise' or make up prayers have no way to know the three forbidden windows, a rule every fiqh primer covers.
   - Size: points (2-4 bullets) · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 9:61 — 'no prayer after the morning prayer till the sun rises'; Muslim 6:357 — Uqbah b. Amir: the three times the Prophet forbade praying or burying the dead)

**13. 🟡 MED · Khushu — presence of heart in prayer**
   - Where: New numbered entries (2-3 points) in the 'Why It Matters' tab or a closing card there
   - Why: Practicing Muslims' most-asked spiritual question about salah ('my mind wanders') gets zero treatment; the page is entirely mechanical.
   - Size: points (2-4 bullets) · Kind: new-subtopic
   - Sourcing: local-verified (Quran 23:1-2 — 'the believers have attained true success: those who humble themselves in their prayers'; Quran 2:45 — 'it is strenuous except for the humble'; Quran 107:4-5 — 'woe to those who pray but are heedless'; Bukhari 59:100 — looking around is a snatching by Satan; already-cited Muslim 4:41 divided-prayer hadith fits here too)

**14. 🟡 MED · Deepen the Eid and Janazah entries — Eid-day sunnahs and the janazah du'a text; cross-link /death-rites**
   - Where: Extend the existing 'eid' and 'janazah' entries in 'Voluntary & Special'; add a cross-link card from Janazah to the existing /death-rites route
   - Why: Eid gives takbirat counts but no Eid-day sunnahs (dates before Fitr prayer, ghusl, takbir aloud), and Janazah describes the structure but omits the actual du'a for the deceased that the worshipper is told to recite after the third takbir.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 13:5 — never proceeded on Eid al-Fitr without eating dates; Ibn Majah 6:66, Tirmidhi 10:60, Nasai 21:169 — 'Allahumma-ghfir li-hayyina wa mayyitina...' the janazah du'a). The 'return by a different route' narration was not found locally — needs-external-source for that single point

**15. 🟡 MED · Teaching children to pray (the age 7/10 hadith) — parent-facing guidance**
   - Where: A point in 'Why It Matters' (beside the already-present Quran 20:132 'enjoin prayer upon your family' card) or the intro tab; cross-link /kids
   - Why: The parent/teacher persona has no entry point on this page even though the family-command verse is already displayed; the age-seven hadith is the canonical answer to 'when do my kids start?'
   - Size: points (2-4 bullets) · Kind: new-subtopic
   - Sourcing: local-verified (Abu Dawud 2:105 — 'Command your children to pray when they become seven years old'; Tirmidhi 2:260 — 'Teach the boy Salat when he is seven')

**16. 🟡 MED · Structural: 'The Prayers' rail growth plan — group the new situational topics or split them to their own route**
   - Where: Decision for 'The Prayers' tab: adding congregation/traveler/ill/missed/sahw/mistakes takes its rail from 6 to ~11 pills; either group as 2-3 combined rail entries ('In Congregation', 'Special Situations', 'Mistakes & Missed Prayers') or create a new route (e.g. /salah-situations) per the house rule that page-sized subjects become their own route
   - Why: The page is already at the 6-tab house maximum, so all six high-priority situational gaps must land in rails — a deliberate grouping keeps the rail scannable instead of doubling it.
   - Size: own-page · Kind: structural
   - Sourcing: scholarly-summary-generic (structural decision, no new sources needed; note tab keys 'adhan' and 'voluntary' are deep-linked from Settings/Ramadan-home and 'purification' aliases 'wudu' — keys must not be renamed)

---

### /why-islam — 15 proposals (7 high)

_Current coverage: Four tabs. 'Start Here' is an intro plus a clickable index. 'Evidence for Islam' has 8 rail topics (Scripture Preservation, Pure Monotheism, Fulfilled Prophecies, Scientific Consistency, Linguistic Miracle, Internal Consistency, Moral Framework, Hadith Science). 'Other Worldviews' has 6 rails — Christianity (7 topics: Trinity, Jesus's Own Words, Biblical Corruption, Paul vs. Jesus, Council History, Lost Christianities, Modern Scholarship), Judaism (4), Hinduism (3), Buddhism (3), Sikhism (2), Atheism (3). 'Common Questions' has 6 (suffering, violence, women, one-religion-right, people-who-never-heard, man-made). The comparative/polemic side is deep; the practical 'what now' side and the hardest modern objections are the thin areas._

**1. 🔴 HIGH · Becoming Muslim — the Shahada and your first steps (new 5th top tab with rail: The Shahada & what it means; How to take it (no ceremony/witnesses required, ghusl recommended); All past sins wiped; Your first week — what to learn in what order; Telling family and friends)**
   - Where: New top tab 'Becoming Muslim' after 'Common Questions' (page has 4 of max 6 tabs); rail via SubTabLayout like the other tabs
   - Why: The page argues the entire case for Islam but never closes — a convinced seeker has no path from 'this is true' to 'here is what to do', which is the single most obvious omission on a dawah page.
   - Size: tab · Kind: structural
   - Sourcing: local-verified (Muslim 1:228 — Amr ibn al-As's deathbed conversion account, 'Islam destroys that which has gone before it'; Bukhari 90:4 and Muslim 1:8 — the Bedouin told he succeeds with just the obligations 'if he is truthful')

**2. 🔴 HIGH · The Prophet's character and life as evidence — al-Amin reputation, Heraclius's interrogation of Abu Sufyan, the liar/deluded/truthful trilemma, and his poverty at death proving no worldly motive**
   - Where: New topic in the 'Evidence for Islam' rail, placed after 'Fulfilled Prophecies'
   - Why: The Evidence tab argues from the book but never from the man — the classical proof-from-the-messenger (Heraclius's own point-by-point analysis of prophethood is essentially this page's argument made by a Byzantine emperor) is missing entirely.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 1:7 — full Heraclius/Abu Sufyan narration; Bukhari 56:129 — died with his armor mortgaged to a Jew for thirty sa' of barley; Bukhari 81:48 — Aisha: months passed with no fire lit in his houses)

**3. 🔴 HIGH · Miracles of the Prophet — splitting of the moon, water flowing from between his fingers for the whole army, the weeping tree trunk, food multiplication**
   - Where: New topic in the 'Evidence for Islam' rail, adjacent to 'Fulfilled Prophecies'
   - Why: The tab presents prophecies and the Quran as evidence but omits the mass-witnessed physical miracles that mainstream Sunni tradition treats as core daleel for prophethood.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 54:1 'the moon has split asunder'; Bukhari 63:93 and 61:140 — moon split witnessed at Mecca/Mina; Bukhari 64:196 and Muslim 43:6 — water from between his fingers; Bukhari 61:92 — the date-palm trunk that wept when he moved to the pulpit)

**4. 🔴 HIGH · Dealing with doubts and waswas — 'that is pure faith', the shaytan's 'who created Allah?' whisper, and why having a doubt is not losing iman**
   - Where: New topic in the 'Common Questions' rail
   - Why: The page speaks outward to seekers, but its biggest silent audience is practicing Muslims (especially teens) experiencing doubt — the tradition has direct, comforting texts for exactly this and the page never addresses the believer's own wavering.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 1:249 — companions horrified to voice their whispers, the Prophet: 'It is pure faith'; Muslim 1:252 and Bukhari 96:27 — 'who created your Lord?... let him seek refuge in Allah and desist')

**5. 🔴 HIGH · The Prophet's marriages — Aisha's age and polygamy, answered honestly (present the source texts, historical context of betrothal norms, Aisha's own scholarship and testimony, no contemporaneous objection even from his enemies; polygamy conditional on justice, and his 25 monogamous years with Khadijah)**
   - Where: New topic in the 'Common Questions' rail (or a major expansion of 'Women in Islam' — better as its own rail entry so 'Women in Islam' stays focused)
   - Why: These are the two objections every seeker and every new Muslim's family raises first; a comparative-religion page that critiques other scriptures' weak points while skipping its own hardest question loses credibility with exactly the skeptical reader it targets.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 67:69, 67:70 — the marriage/consummation-age narrations to present and contextualize honestly; Quran 4:3 — polygamy conditional on justice; Quran 4:129 — 'you will never be able to maintain absolute justice between wives')

**6. 🔴 HIGH · Agnosticism & Deism — 'I believe in something, but not organized religion' (acknowledging a Creator is not enough; the Quran's argument that even pagans admitted the Creator; why a wise Creator would not stay silent; prophets as the communication channel; how to test a claimed revelation)**
   - Where: New 7th rail entry in 'Other Worldviews', between Sikhism and Atheism
   - Why: This is the single most common worldview among the page's English-speaking Western audience, and it is the one worldview the tab skips — the Atheism rail argues God exists but nothing bridges 'a Creator exists' to 'the Creator has spoken'.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 29:61, 31:25, 43:87 — 'if you ask them who created the heavens and earth they will surely say Allah'; Quran 41:53 — 'We will show them Our signs in the universe and in themselves')

**7. 🔴 HIGH · Does Islam conflict with evolution? — Adam's special creation, 'created you in stages', what is theologically fixed vs. where scholars differ on pre-human life**
   - Where: New topic in the 'Common Questions' rail
   - Why: Evolution is the most common science-based objection from educated seekers and Muslim students; the 'Scientific Consistency' topic asserts harmony with science but never confronts the one question readers actually arrive with.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified for the Quranic anchors (Quran 32:7-9 — creation of man from clay then progeny from fluid; 71:14 — 'created you in stages'; 15:26 — 'sounding clay of aging mud'); the survey of scholarly positions is scholarly-summary-generic

**8. 🟡 MED · Is eternal Hell just? — Allah's mercy in one hundred parts, no despair of forgiveness, no one wronged an atom's weight, and who Hell is actually for**
   - Where: New topic in the 'Common Questions' rail, next to 'Why Do Muslims Suffer?'
   - Why: The justice-of-Hell objection is a standard seeker blocker (and a quiet struggle for believers) that the Questions tab currently skips despite covering adjacent territory in 'suffering' and 'people who never heard'.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 50:25 — Allah created one hundred parts of mercy; Quran 39:53 — 'do not despair of Allah's mercy, He forgives all sins'; Quran 4:40 already used on-page for atom's-weight justice)

**9. 🟡 MED · Slavery in Islam — the manumission engine (freeing slaves as expiation and salvation from the Fire, 'your slaves are your brothers — feed them from what you eat', Bilal's elevation), and honest contrast with chattel slavery**
   - Where: New topic in the 'Common Questions' rail
   - Why: A standard objection in every comparative-religion conversation; the corpus support is unusually strong and the page already makes adjacent claims (Bilal under Hinduism/caste) without ever addressing slavery directly.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 49:1 — freeing a slave frees the freer's limbs from the Fire; Bukhari 2:23 and 49:28 — Abu Dhar clothing his slave as himself, 'they are your brothers'; Muslim 12:48 — freeing a slave among the best spending)

**10. 🟡 MED · What about apostasy and freedom of belief? — reconcile 'no compulsion in religion' with the hadith critics quote back, its treason-in-wartime context, and the Quran's hereafter-only consequences for apostasy**
   - Where: New topic in the 'Common Questions' rail, adjacent to 'What About Violence?' (which quotes 2:256 but leaves the obvious rebuttal unanswered)
   - Why: Any reader who googles 'no compulsion in religion' immediately finds the apostasy hadith quoted against it; leaving the page's own centerpiece verse undefended is a credibility gap.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified for the texts to be addressed (Nasai 37:94/37:96 — 'whoever changes his religion...'; Nasai 37:95 — Ibn Abbas's qualification of Ali's punishment); the contextual/juristic treatment is scholarly-summary-generic and sensitive — route through the founder's content-review-queue before shipping

**11. 🟡 MED · How to share Islam — a practical dawah guide for the reader who is already Muslim (invite with wisdom and beautiful preaching; 'come to a common word' as the opener with Christians; common ground before contention; answering vs. arguing; do's and don'ts with family/coworkers)**
   - Where: New topic in 'Start Here' (turning that tab from a pure index into index + one practical guide), or last entry in 'Common Questions'
   - Why: Practicing Muslims and parents open this page to equip themselves for conversations, not to be convinced — the page hands them ammunition but no adab or method for using it.
   - Size: topic · Kind: practical-guide
   - Sourcing: local-verified (Quran 16:125 — 'call to the way of your Lord with wisdom and goodly exhortation'; Quran 3:64 — 'come to a common term between us and you'; Quran 2:256 already on-page)

**12. 🟡 MED · Seekers who found Islam — conversion narratives: Salman al-Farisi's journey (Zoroastrian to Christian monasteries to the awaited prophet), Abdullah ibn Salam, the Negus of Abyssinia, and a couple of well-documented modern voices**
   - Where: New topic in 'Start Here' or the closing entry of 'Evidence for Islam'
   - Why: Narrative persuades where argument exhausts — Salman's story is literally the seeker's-journey template across the very religions the Worldviews tab compares, and the page has zero human stories.
   - Size: topic · Kind: new-subtopic
   - Sourcing: needs-external-source for the full Salman narrative (Musnad Ahmad / Ibn Hisham — local ahmad corpus only surfaces short Salman fragments like Bukhari 63:171); Abdullah ibn Salam partially covered on-page via Tirmidhi 47:196

**13. 🟡 MED · Harden the 'Linguistic Miracle' topic — replace or heavily caveat the word-count 'mathematical patterns' point (365/12 counts are popularly debunked as form-dependent) with stronger material: ring composition of al-Baqarah, Musaylimah's failed imitation attempts, testimony of poets like Labid**
   - Where: Existing 'Evidence for Islam' > 'Linguistic Miracle' topic — swap its weakest point and add 2-3 stronger ones
   - Why: On a page inviting skeptics to fact-check, the one claim that fails a quick Google search taints the seven solid topics around it.
   - Size: points · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (literary analysis, e.g. Raymond Farrin's ring-composition work; no hadith citations needed)

**14. ⚪ LOW · Historical accuracy points for 'Is Religion Man-Made?' — add Pharaoh's preserved body ('today We will preserve your body as a sign for those after you') alongside the existing al-Aziz/Pharaoh title point**
   - Where: Existing 'Common Questions' > 'Is Religion Man-Made?' — 1-2 additional points
   - Why: The Ramesses/Merenptah mummies on display in Cairo make this the most concrete, checkable claim in the whole genre, and the topic already has the sibling argument.
   - Size: points · Kind: deepen-existing
   - Sourcing: local-verified (Quran 10:92 — 'So today We will preserve your body, so that you will be an example for those who come after you'; 10:90 — the drowning context)

**15. ⚪ LOW · 'How to investigate honestly' points for Start Here — the Quran's own epistemology: do not follow what you have no knowledge of (hearing, sight, heart all questioned), and the critique of inheriting your parents' religion unexamined (which cuts both ways, including for cultural Muslims)**
   - Where: Existing 'Start Here' tab — 2-3 bullets inside the 'What this page covers' card or a small card of their own
   - Why: It frames the whole page's method with the Quran's own words and disarms the 'you were just born into it' objection before any evidence is presented.
   - Size: points · Kind: deepen-existing
   - Sourcing: local-verified (Quran 17:36 — 'do not follow that of which you have no knowledge'; Quran 2:170 — 'we follow what we found our forefathers upon')

---

### /family — 15 proposals (7 high)

_Current coverage: Four tabs with SubTabLayout rails. Children (default): Conceiving, Pregnancy, Newborn, Blessings, Rights of Children, Raising Them Right, Virtue of Daughters. Parents: Rights, In the Quran, From the Sunnah, Du'a for Parents, After They Pass. Elders & Sick: Honoring Elderly, Visiting the Sick (entirely from the visitor's perspective). Kinship: Why It Matters, Reward, Severity of Cutting Ties, Who Counts as Kin, When They Cut You Off. Death & Janazah, Inheritance, and Marriage were promoted to their own routes and are cross-linked at the bottom; per-sub SourcesCard and page search already exist._

**1. 🔴 HIGH · Non-Muslim parents — birr for the convert (Asma's mother, kindness without compromise)**
   - Where: New topic in the Parents rail (6th pill, e.g. 'Non-Muslim Parents'), after 'After They Pass'
   - Why: The app explicitly targets new Muslims, and a convert's first family question — 'how do I treat my non-Muslim mother and father?' — is answered nowhere on the page beyond one card on Quran 31:15 obedience.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 51:52 — Asma bint Abi Bakr's pagan mother, 'keep ties with your mother'; Quran 31:15 — do not obey in shirk yet keep kind company; Quran 60:8 — Allah does not forbid kindness and justice to those who do not fight you)

**2. 🔴 HIGH · The 'jihad' hadith — 'Are your parents alive? Then strive in their service'**
   - Where: Parents tab → 'From the Sunnah' sub-view (add as a VerseCard)
   - Why: One of the most-quoted parent hadiths is absent, and the page's own searchIndex keywords for parents/sunnah (line 1408) already list 'jihad' even though no such card exists — searching 'jihad' surfaces a view that doesn't contain it.
   - Size: points (1-2 cards) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 56:213 — 'Are your parents alive?... Then exert yourself in their service'; Nasai 25:19 same narration)

**3. 🔴 HIGH · After They Pass — Hajj/Umrah on their behalf, and settling their debts, fasts, and vows**
   - Where: Parents tab → 'After They Pass' sub-view (2-3 new cards alongside dua/sadaqah/friends/kinship)
   - Why: The classical list of posthumous birr always includes performing Hajj/Umrah for a deceased or incapable parent and discharging their debts/fasts/vows; the tab currently stops at dua, charity, friends, and kinship.
   - Size: points (2-3 cards) · Kind: deepen-existing
   - Sourcing: local-verified (Abu Dawud 11:90 — Hajj and Umrah on behalf of the aged father; Nasai 24:15 — asking about the deceased mother; Bukhari 30:59 and Muslim 13:198 — 'whoever dies with fasts due, his heir fasts for him')

**4. 🔴 HIGH · Losing a Child — miscarriage, infant loss, and the House of Praise**
   - Where: New topic in the Children rail (after 'Blessings'), absorbing/cross-linking the single 'Loss of a child' card currently buried in Blessings
   - Why: Bereaved parents are a real pastoral audience the tradition speaks to at length, and the page currently gives them exactly one card; the famous Bayt al-Hamd hadith and the 'three children as a shield from the Fire' narrations are all missing.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Tirmidhi 10:57 — 'Build for My slave a house in Paradise and name it the House of Praise'; Bukhari 23:11, 23:12, 23:13 — three children who die before puberty shield the parent from the Fire; Bukhari 23:61 — the Prophet's tears at his son Ibrahim's death, grief is permitted)

**5. 🔴 HIGH · The Prophet's protection du'a over children — 'U'idhukuma bi-kalimatillahi at-tammah...'**
   - Where: Children tab → 'Newborn' sub-view (replace the vague 'recite Falaq and Nas over them' card) and echo in 'Raising Them Right'
   - Why: This is THE du'a Muslim parents memorize to recite over their children (from every devil, vermin, and evil eye), taught by the Prophet for Hasan and Husayn — the page alludes to protection but never gives the formula, Arabic, or source.
   - Size: points (1-2 cards) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 60:45 — the Prophet's refuge-seeking for al-Hasan and al-Husayn as Ibrahim did for Ismail and Ishaq; Tirmidhi 28:25 with the Arabic wording; Ibn Majah 31:90; Abu Dawud 42:142; supporting: Ibn Majah 31:71-73 'the evil eye is real')

**6. 🔴 HIGH · 'Uquq al-walidayn — disobedience to parents named among the greatest of major sins**
   - Where: Parents tab → 'Rights of Parents' sub-view (one warning card closing the grid) or 'From the Sunnah'
   - Why: The page gives only the positive framing; the famous thrice-repeated hadith pairing disobedience to parents with shirk itself is the standard daleel for how grave the matter is and users studying the topic will expect it.
   - Size: points (1-2 cards) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 78:7 and 78:8 — 'Shall I not inform you of the biggest of the great sins? ... to join partners with Allah, to be undutiful to one's parents...'; also Bukhari 52:18, 79:47)

**7. 🔴 HIGH · When You Are the Sick One — patience, expiation, and du'a in your own illness**
   - Where: New topic in the Elders & Sick rail (3rd pill, e.g. 'Bearing Illness'), cross-linking /salah praying-while-ill if covered there
   - Why: The tab is named 'Elders & Sick' yet speaks only to the visitor — a user who is themselves ill finds nothing on the reward of patience, istirja, Ayyub's du'a, or self-ruqyah.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 75:2 — 'no fatigue, nor disease... but Allah expiates sins by it'; Quran 2:155-156 — glad tidings to the patient, 'inna lillahi wa inna ilayhi raji'un'; Quran 21:83-84 — Ayyub's cry and Allah's response)

**8. 🟡 MED · Deepen 'Raising Them Right' with its Quranic anchor (66:6) and the crying-child prayer narration**
   - Where: Children tab → 'Raising Them Right' sub-view: add Quran 66:6 as the lead VerseCard plus 1-2 narration cards
   - Why: 'Protect yourselves and your families from a Fire' is the single most famous tarbiyah verse and is missing from the whole page, and the beloved narration of the Prophet shortening prayer when he heard a child cry rounds out the mercy theme.
   - Size: points (2-3 cards) · Kind: deepen-existing
   - Sourcing: local-verified (Quran 66:6; Abu Dawud 2:399 and Nasai 10:49 and Tirmidhi 2:228 — shortening the prayer at a child's cry for the mother's sake)

**9. 🟡 MED · Discipline the Prophet's way — gentleness first, what correction is and is not**
   - Where: Children tab → 'Raising Them Right' (a titled card cluster or the tail of the grid); could grow into its own rail topic if it takes an FAQ shape
   - Why: Parents actively search 'can I discipline/smack my child in Islam'; the page cites the salah-at-seven hadith but never addresses limits, anger, gentleness, or common mistakes.
   - Size: points (3-4 cards) · Kind: practical-guide
   - Sourcing: local-verified for the anchors (Ibn Majah 33:32-33 and Abu Dawud 43:35 — 'Allah is Gentle and loves gentleness'; Abu Dawud 2:104-105 already on page for the age-ten context); the fiqh limits themselves are scholarly-summary-generic — route through the founder's content-review queue like prior generic fiqh points

**10. 🟡 MED · Breastfeeding and milk-kinship (rada'ah) — the two years, and who becomes mahram through milk**
   - Where: New topic in the Children rail between 'Pregnancy' and 'Newborn' (e.g. 'Nursing & Milk-Kinship')
   - Why: The page quotes the weaning verses twice in passing but never covers the Quranic two-year term, the father's duty to provide for the nursing mother, or the marriage-prohibiting milk-kinship rules that practically affect families with wet-nursing or milk-sharing.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 2:233 — two full years and the father's obligation; Quran 4:23 — foster mothers and foster sisters are mahram; Bukhari 52:9 — 'foster relations are treated like blood relations' re Hamzah's daughter; Muslim 17:12 — the foster-uncle Aflah)

**11. 🟡 MED · Orphans, fostering, and adoption — kafalah and the ruling on names**
   - Where: New topic in the Children rail (last pill, e.g. 'Orphans & Adoption'), or a topic in Kinship if the Children rail is judged too long
   - Why: English-speaking families ask constantly whether adoption is allowed; Islam's distinctive answer (fostering is among the greatest deeds, but lineage names are preserved) appears nowhere in the app's family content.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 78:36 — 'I and the one who looks after an orphan will be in Paradise like this'; Muslim 55:52 — whether the orphan is a relative or not; Quran 33:4-5 — call adopted sons by their fathers' names, 'your brothers in faith')

**12. 🟡 MED · Stories of Birr — the three in the cave, Juraij and his mother, Uways al-Qarani**
   - Where: Parents tab → new topic in the rail (e.g. 'Stories of Birr') or three narrative cards appended to 'From the Sunnah'
   - Why: These are the three canonical stories every teacher uses for birr al-walidayn — memorable narrative depth the page's short hadith cards don't provide, and ready-made material for the parent/teacher persona.
   - Size: topic · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 78:5 — the cave and the man who held the milk for his sleeping parents; Bukhari 46:43 and 21:10 — Juraij, his mother's call and her du'a; Muslim 44:319-320 — Uways, 'he would have his mother with him', Umar seeking his forgiveness-prayer)

**13. 🟡 MED · Mending a broken tie — the three-day limit and how to reconcile**
   - Where: Kinship tab → 'When They Cut You Off' sub-view (2-3 cards: the three-night hadith, 'the better of them begins with salam', practical first-steps)
   - Why: The cut-off sub-view tells users to persist but gives no mechanics of reconciliation; the famous three-night prohibition and the merit of greeting first are the concrete daleel users need when they are the ones sulking.
   - Size: points (2-3 cards) · Kind: practical-guide
   - Sourcing: local-verified (Bukhari 78:105 — not lawful to desert a brother beyond three nights, the better is the one who greets first; Bukhari 78:104 — do not hate one another nor desert one another)

**14. 🟡 MED · Rights of neighbors — Jibril's insistence**
   - Where: Structural decision needed: no page in the app covers neighbors; nearest fit is a new topic at the end of the Kinship rail ('Beyond Kin: Neighbors') with the intro noting neighbors are a right adjacent to kinship, or hold it for a future brotherhood/community page
   - Why: Neighbor rights sit beside kinship in every adab collection (Quran 4:36, already quoted on this page, names kin and neighbors in the same verse) and users will look for them near family ties.
   - Size: topic · Kind: structural
   - Sourcing: local-verified (Muslim 45:182 and 45:184 — 'Gabriel kept impressing upon me kind treatment of the neighbour until I thought he would confer inheritance on him'; Quran 4:36 already on page)

**15. ⚪ LOW · Caring for aging parents at home — a practical caregiving guide**
   - Where: Elders & Sick tab → new topic (e.g. 'Caring for Aging Parents') or expansion of 'Honoring Elderly' with a titled section
   - Why: The sandwich-generation reader (target persona: practicing families) gets attitude and etiquette but no guidance on the daily grind — patience with repetition and dementia, sharing the load among siblings, care homes, and burnout as ibadah.
   - Size: topic · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (anchor with Muslim 45:11 and Quran 17:23-24 already on page; the practical guidance itself has no single hadith and should go through the founder's content-review queue)

---

### /marriage — 14 proposals (7 high)

_Current coverage: Six tabs, each a SubTabLayout rail with all content inline in page.tsx (no external data files). Before Marriage (what to look for, the halal way, marry timely, trust in Allah), The Wedding (nikah pillars, walimah, dua for newlyweds), Husband's Rights (status, specific rights), Wife's Rights (kind treatment, specific rights), Married Life (intimacy, permitted & not, privacy, du'a before intimacy, purity afterwards, menses & family planning), Divorce (last resort, three talaqs, khul', after divorce). Roughly 50 content cards, all cited to Quran/hadith with per-sub SourcesCard, page search, and deep links. The page is strong on the marriage lifecycle mechanics but has no coverage of WHO one may marry, forbidden marriage types, the Prophet's own conduct as a husband, conflict resolution short of divorce, or post-divorce practicalities (custody, widowhood)._

**1. 🔴 HIGH · Who You Can Marry — mahram categories, milk-kinship, and interfaith marriage**
   - Where: New topic in the Before Marriage rail (e.g. 'Who You Can Marry'), placed first or second in the rail
   - Why: The single most basic legal question about marriage — which relatives, foster-relations, and non-Muslims one may or may not marry — is entirely absent; new Muslims especially need the People-of-the-Book vs. polytheist distinction and the milk-kinship rule.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Quran 4:22-24 prohibited categories; Quran 2:221 no marriage to polytheists; Quran 5:5 chaste women of the People of the Book; Bukhari 52:9 'foster relations are treated like blood relations'; Bukhari 67:48 cannot combine a woman with her paternal or maternal aunt; Muslim 17:16 Hamza's daughter unlawful through fosterage)

**2. 🔴 HIGH · The Prophet ﷺ as a Husband — his lived example at home**
   - Where: New topic in the Married Life rail, ideally first, so the tab opens with warmth before rulings
   - Why: The page quotes 'I am the best of you to my wives' but never shows it — the famous racing, shared-cup, and Umm Zar' narrations are the most beloved marriage content in the tradition and humanize a rulings-heavy page.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Abu Dawud 15:102 and Ibn Majah 9:135 racing with Aishah; Muslim 3:14 drinking from the spot where her mouth had been; Bukhari 97:174 reciting Quran with his head in her lap during her menses; Bukhari 67:123 / Muslim 44:135 the Umm Zar' hadith — 'I am to you as Abu Zar' was to Umm Zar''; cross-link existing Bukhari 10:70 serving his family)

**3. 🔴 HIGH · When Marriage Struggles — resolving conflict before divorce**
   - Where: New topic in the Married Life rail (e.g. 'Resolving Conflict'), cross-linked from Divorce → A Last Resort
   - Why: The page jumps from happy married life straight to talaq mechanics; the rib hadith, 'do not hate a believing woman,' and Quran 4:128 on reconciliation are the canonical texts for the struggling-but-not-divorcing couple, which is most couples in difficulty.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 67:119 / Muslim 17:77 the rib hadith — gentleness, not forcing change; Muslim 17:81 'a believing man should not hate a believing woman; if he dislikes one characteristic he is pleased with another'; Quran 4:128 settlement when a wife fears aversion; Quran 4:34-35 arbitration steps already on page, to be expanded here)

**4. 🔴 HIGH · Forbidden Marriage Types — mut'ah, shighar, and proposing over a brother's proposal**
   - Where: New topic in the Before Marriage rail (could sit adjacent to 'Who You Can Marry'), or merged into it as a second card group
   - Why: Converts and young Muslims encounter mut'ah/'temporary marriage' claims online and secret-marriage arrangements; the page currently offers no defense of what a valid Sunni nikah excludes.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 64:256 and 67:52 mut'ah forbidden at Khaybar; Bukhari 67:49 / Muslim 16:67 and 16:70 shighar forbidden — 'there is no shighar in Islam'; Muslim 16:66 do not propose over the proposal of your brother)

**5. 🔴 HIGH · Wedding-Night Sunnahs & the Halal Celebration — groom's du'a, the duff, and singing**
   - Where: New topic in The Wedding rail (e.g. 'Celebration & the Wedding Night'), between The Walimah and Dua for Newlyweds
   - Why: Every engaged user asks 'what is actually allowed at my wedding?' and 'what do I do on the first night?' — the duff/singing evidences and the groom's du'a over the bride are famous, practical, and missing.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Abu Dawud 12:115 groom's du'a — 'O Allah, I ask You for the good in her...'; Tirmidhi 11:10 'Publicize this marriage... and beat the duff'; Tirmidhi 11:9 'the distinction between the lawful and the unlawful is the duff and the voice'; Bukhari 67:82 girls beating the duff and singing at ar-Rubayyi's wedding with the Prophet ﷺ present)

**6. 🔴 HIGH · Canonical nafaqah narrations missing from Wife's Rights — the Qushayri hadith and Hind bint Utbah**
   - Where: Wife's Rights tab → Specific Rights sub-tab, as 2 new cards under Financial Support
   - Why: Abu Dawud's Mu'awiyah al-Qushayri hadith ('feed her when you eat, clothe her when you clothe yourself, do not strike the face, do not revile her...') is THE most-cited wife's-rights text in the tradition and is absent; Hind's case grounds the wife's right to reasonable maintenance even against a stingy husband.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Abu Dawud 12:97 the Qushayri hadith; Bukhari 69:9 and 46:21 Hind bint Utbah — take what suffices you and your children reasonably)

**7. 🔴 HIGH · Nikah practicalities — stipulated conditions, and who is the wali when a woman has none**
   - Where: The Wedding tab → The Nikah sub-tab, as 2-3 new cards after '4. Witnesses & Public Announcement'
   - Why: Convert women routinely have no Muslim father — the 'ruler/imam is the wali of one who has no wali' point is a high-need answer — and the enforceability of conditions in the contract (Bukhari 54:10) is the daleel behind modern marriage-contract stipulations; a short note on civil vs. religious marriage would complete it.
   - Size: points (2-4 bullets) · Kind: practical-guide
   - Sourcing: local-verified (Ibn Majah 9:36 'the ruler is the guardian of the one who does not have a guardian'; Bukhari 54:10 the conditions most deserving of fulfillment are those by which intimacy is made lawful; civil-marriage note = scholarly-summary-generic)

**8. 🟡 MED · Divorce FAQs — what counts as a talaq (jest, anger) and child custody after divorce**
   - Where: New topic in the Divorce rail (e.g. 'Common Questions'), after Khul'
   - Why: Users in a divorce crisis need to know that joking talaq counts and what happens to the children — the mother's custody hadith is a famous, directly practical text the tab omits, along with the parting gift (mut'ah) of divorce.
   - Size: topic (a rail entry) · Kind: practical-guide
   - Sourcing: local-verified (Ibn Majah 10:24 'three matters in which seriousness is serious and joking is serious: marriage, divorce, and taking back'; Abu Dawud 13:102 'you have more right to him as long as you do not marry'; Quran 2:236 the divorce gift)

**9. 🟡 MED · Husband's Rights — the voluntary-fasting and home-entry permission hadith**
   - Where: Husband's Rights tab → Specific Rights sub-tab, 1-2 cards after 'Guarding the Home'
   - Why: Bukhari's 'a woman should not fast (voluntarily) except with her husband's permission when he is present' is among the best-known husband's-rights narrations and pairs naturally with the existing guarding-the-home card.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 67:126 and 67:129 — voluntary fasting and admitting guests only with his permission)

**10. 🟡 MED · Polygyny — the Quranic permission and the justice condition**
   - Where: New topic in the Married Life rail (e.g. 'Polygyny & Justice'), last in the rail
   - Why: A mainstream Sunni resource that never mentions Quran 4:3 leaves users to hostile or extreme sources for one of the most-asked questions about Islamic marriage; the justice condition and the drooping-side warning frame it honestly.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Quran 4:3 up to four with the justice condition; Quran 4:129 'you will never be able to be perfectly just between wives'; Abu Dawud 12:88 / Tirmidhi 11:63 'when a man has two wives and is inclined to one of them, he will come on the Day of Resurrection with a side hanging down')

**11. 🟡 MED · Widowhood — the widow's iddah of four months and ten days, and mourning (ihdad)**
   - Where: Divorce tab → After Divorce sub-tab, expanded and possibly retitled 'Iddah & Widowhood' (2-3 new cards); cross-link to /death-rites
   - Why: The After Divorce sub-tab covers only the divorce iddah — a widow looking up her waiting period and mourning rules finds nothing, though the texts are famous and the app already has a death-rites page to cross-link.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Quran 2:234 four months and ten days; Bukhari 23:42 and 68:79-80 no mourning beyond three days except four months and ten for a husband; Quran 65:4 iddah of the pregnant and non-menstruating)

**12. 🟡 MED · In-laws — the khalwa boundary ('the in-law is death') and living with extended family**
   - Where: Married Life rail, either 1-2 cards inside a 'Resolving Conflict' topic or a small card group in Privacy of the Bedroom's neighborhood; alternatively a point in Before Marriage → The Halal Way
   - Why: Extended-family friction is the most common real-world marriage stressor for the app's audience, and the hamu hadith plus a scholarly note on the wife's non-obligation to serve in-laws answers questions users actually have.
   - Size: points (2-4 bullets) · Kind: new-subtopic
   - Sourcing: local-verified for the anchor hadith (Tirmidhi 12:26 'Beware of entering upon women... the hamu is death'); in-law etiquette guidance = scholarly-summary-generic

**13. ⚪ LOW · Du'a for a righteous spouse — Quran 25:74 in Trust in Allah**
   - Where: Before Marriage tab → Trust in Allah sub-tab, one card with Arabic + translation
   - Why: The single most-recited spouse-seeking du'a ('grant us from our spouses and offspring comfort of eyes') is the natural devotional capstone of the Trust in Allah view and is currently absent.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Quran 25:74, present in packages/content/quran/verses/25.json)

**14. ⚪ LOW · Zihar, ila', and li'an — the Quran's other marital-dissolution rulings**
   - Where: Divorce rail, as a short 'Other Rulings' card group inside the proposed Common Questions topic (not its own rail entry)
   - Why: Advanced readers studying Surahs al-Mujadila and an-Nur will look for these; a brief plain-English explainer with the verses closes the loop without needing full fiqh treatment.
   - Size: points (2-4 bullets) · Kind: new-subtopic
   - Sourcing: local-verified for the verses (Quran 58:1-4 zihar; Quran 2:226-227 ila'; Quran 24:6-9 li'an); fiqh detail = scholarly-summary-generic

---

### /jannah — 12 proposals (7 high)

_Current coverage: Two top tabs (Jannah / Jahannam), each with 4 sub-views. Jannah: 'What is Jannah?' intro, 'Why It Matters' (6 points), 'Descriptions' rail (Rivers & Gardens, Dwellings, Food & Drink, Companions & Family, The Greatest Reward), 'How to Enter' rail (The Conditions, Deeds That Lead to It, Levels of Jannah, The Last to Enter). Jahannam: 'What is Jahannam?' intro, 'Why It Matters' (4 points), 'Descriptions' rail (Its Heat & Depths, Its People, Food Drink & Chains, Its Keepers, Deliverance From It), 'Protection from It' rail (Deeds That Shield, Du'as of Protection, The Door of Hope). Coverage of the environment of Jannah and mechanics of Jahannam is solid; the biggest holes are the moment of entry (gates), the people of Jannah themselves, women/children FAQs, and sins explicitly warned with the Fire. Note: day-of-judgement/page.tsx already covers Sirat, Hawd, Mizan, and intercession — do not duplicate those here._

**1. 🔴 HIGH · The Gates of Jannah & the Day of Entry — eight gates, Ar-Rayyan, being called from all gates, the Prophet first to knock, the Qantarah, the angels' greeting**
   - Where: New topic in the Jannah 'Descriptions' rail (descriptionTopics), placed between 'Dwellings' and 'Companions & Family'; cross-link from How to Enter
   - Why: The eight gates (especially Ar-Rayyan for fasters) are among the most famous facts about Jannah and the entry scene is the emotional climax of the whole subject — the page currently skips straight from descriptions to life inside.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 30:6 Ar-Raiyan for fasters; Bukhari 59:67 eight gates; Bukhari 30:7 & 62:18 called from all gates; Muslim 2:20 wudu+shahadah opens all eight gates; Muslim 1:390 & 1:392 the Prophet first to knock / the keeper asks who; Bukhari 46:1 & 81:124 the Qantarah where believers settle scores before entering; Quran 39:73 led in groups, gates wide open)

**2. 🔴 HIGH · The People of Jannah — their form, age, and life there (first group like the full moon, Adam's form 60 cubits, age 30-33, no bodily needs, sweat of musk, the market of Jannah)**
   - Where: New topic in the Jannah 'Descriptions' rail; the market point could alternatively extend 'Companions & Family'
   - Why: The rail describes rivers, palaces, and food but never the transformed people themselves — among the most-asked questions ('what will we look like, what will we do all day').
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 59:56-57 & 60:2, Muslim 53:18-19 first group glittering like the full moon, no spitting/relieving nature, sweat is musk, combs of gold; Bukhari 79:1 Adam created sixty cubits and all who enter Paradise in his form; Tirmidhi 38:23 enter without body hair, aged thirty or thirty-three; Tirmidhi 38:27-28 & Ibn Majah 37:237 the market of Paradise where beauty increases)

**3. 🔴 HIGH · Missing famous narrations: 'Paradise is surrounded by hardships and the Fire by desires', the Jibril look-at-it hadith, and 'a whip's-length in Paradise is better than the world'**
   - Where: 2-3 new numbered points in Jannah 'Why It Matters' (whyItMatters array)
   - Why: 'Surrounded by hardships' is arguably the single most-quoted hadith about Jannah and its absence is conspicuous to any practicing Muslim; all three reframe why striving is worth it.
   - Size: points · Kind: missing-narrations
   - Sourcing: local-verified (Muslim 53:1 & Tirmidhi 38:37 surrounded by hardships/desires; Nasai 35:3 Jibril sent to look at Paradise and Hell before and after they were veiled; Bukhari 81:4 & Ibn Majah 37:231 a whip's-length space in Paradise better than the world and all in it)

**4. 🔴 HIGH · Guarantees & Glad Tidings — the 70,000 who enter without reckoning, and short deeds with an explicit Jannah guarantee (radhitu billahi, Sayyid al-Istighfar, guarding tongue and chastity)**
   - Where: New topic in the Jannah 'How to Enter' rail (howToTopics), after 'Deeds That Lead to It'
   - Why: The Ukasha / 70,000 story is a staple of khutbahs, and the explicit 'I guarantee him Paradise' hadiths are exactly the actionable daleel a practicing Muslim looks for on a 'How to Enter' tab.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 81:61 seventy thousand enter without accounts — no ruqya-seeking, no omens, trust in their Lord; Bukhari 76:25 the nations-displayed context; Abu Dawud 8:114 'pleased with Allah as Lord...' — Paradise will be his due; Bukhari 80:3 Sayyid al-Istighfar with the Paradise promise; Bukhari 86:36 'whoever guarantees me what is between his jaws and what is between his legs, I guarantee him Paradise')

**5. 🔴 HIGH · Women and Jannah — an honest FAQ (equal reward for male and female, the best women of Paradise, what women receive, the majority-women hadith handled with its context, warnings addressed to both sexes)**
   - Where: New topic in the Jannah 'Descriptions' rail next to 'Companions & Family' (or expand that topic into sub-sections)
   - Why: This is one of the most-searched Hereafter questions for roughly half the audience, and the page currently mentions women only via one Hur al-'Ayn clause — leaving common doubts unanswered on our own turf.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 4:124 whoever does righteousness male or female enters Paradise; Bukhari 60:84, 60:103, 62:114 the best women — Maryam, Khadijah, Asiyah, Aisha's superiority; Bukhari 2:22 & 6:9 the majority-women narration with its stated reason — ingratitude to husbands — needing careful framing; Muslim 37:190 the dressed-yet-naked warning). One popular point — the believing wife being better than the Hur al-'Ayn — is Tabarani/weaker: needs-external-source, flag for founder review

**6. 🔴 HIGH · Children in Jannah & the miscarried child — children who die are with Ibrahim in Paradise; the miscarried child drags its mother to Paradise by the umbilical cord**
   - Where: 2-3 points added to 'Companions & Family' (Jannah Descriptions rail) with a cross-link from 'The Door of Hope' in the Jahannam Protection rail (which already has 'Children as a shield')
   - Why: Grieving parents ('where is my baby now?') are a real and recurring audience for exactly this page, and the answer in the Sunnah is direct comfort we currently omit.
   - Size: points · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 91:61 the long Samurah dream — the tall man in the garden is Ibrahim surrounded by children in numbers never seen; Ibn Majah 6:177 the miscarried fetus drags his mother by his umbilical cord to Paradise if she was patient; Ibn Majah 6:175-176 the fetus pleading for its parents; already-cited Muslim 45:196 / Bukhari 23:11 children as a shield)

**7. 🔴 HIGH · Deeds Warned with the Fire — specific sins the Prophet tied to Jahannam for Muslims (suicide, cruelty to animals, oppression, devouring orphans' wealth, immodesty), balancing 'Deeds That Shield'**
   - Where: New topic in the Jahannam 'Descriptions' rail (jahannamTopics) after 'Its People', or as the first topic of the 'Protection from It' rail ('know what draws it near')
   - Why: 'Its People' covers only disbelievers and the arrogant, so a practicing Muslim reading this page finds no concrete list of the sins the texts actually warn with the Fire — the practical half of protection.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 76:90 whoever kills himself abides in the Fire doing the same act; Bukhari 59:124 & 60:149 the woman who entered the Fire over a cat; Muslim 37:190 the two types of the people of Hell — those beating people with ox-tail whips and the dressed-yet-naked; Quran 4:10 those who consume orphans' property unjustly consume fire into their bellies; Bukhari 2:22 ingratitude)

**8. 🟡 MED · The dipping hadith — the most affluent disbeliever dipped once in the Fire forgets every comfort; the most afflicted believer dipped once in Paradise forgets every hardship**
   - Where: New numbered point in Jahannam 'Why It Matters' (jahannamMattersItems); could also be echoed in Jannah 'Why It Matters'
   - Why: One of the most-quoted perspective hadiths on the entire subject — it collapses the value of worldly ease and suffering in one image, exactly the page's message.
   - Size: points · Kind: missing-narrations
   - Sourcing: local-verified (Muslim 52:42 — the denizen of Hell who lived in ease dipped once in the Fire: 'have you ever experienced any comfort?')

**9. 🟡 MED · Al-A'raf — the people of the Heights between the two abodes (Quran 7:46-49)**
   - Where: Short topic at the end of the Jahannam 'Descriptions' rail or as a bridging topic; fits the page's two-abode frame uniquely well
   - Why: A distinctive Quranic scene (and the name of a whole surah) that sits literally between Jannah and Jahannam — readers who know the Quran will expect it on this page, and no other page covers it.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 7:46-49 present in packages/content/quran/verses/7.json — the barrier, the men on the Heights recognizing each group by their marks, and 'Enter Paradise; no fear upon you')

**10. 🟡 MED · Common Questions sub-tab — Is Jannah already created and where? Will we get bored? Do animals/pets enter? What about people who never heard the message?**
   - Where: New 5th sub-view under the Jannah top tab ('Common Questions'), following the house pattern of second-row pills; second-row currently has 4 entries so one more fits
   - Why: These are the questions new Muslims and curious visitors actually type into search; answering them with texts where they exist (and honest 'scholars differ' where they don't) is high-trust content.
   - Size: sub-tab · Kind: practical-guide
   - Sourcing: local-verified for the answerable ones (Nasai 35:3 Jibril sent to look at the already-created Paradise and Hell; Quran 2:35 Adam told to dwell in Paradise; Quran 56:25-26 no idle talk, only peace; Tirmidhi 38:28 the market — whatever is desired). Pets/animals and ahl al-fatrah answers are scholarly-summary-generic — route through docs/content-review-queue.md per house rule

**11. ⚪ LOW · Vastness and present reality of Jannah in the intro — 'as wide as the heavens and the earth', race toward it, already created**
   - Where: 1-2 paragraphs + sources added to the existing 'What is Jannah?' intro card (Quran 3:133 is already in its SourcesCard but never stated in the body)
   - Why: The intro never conveys the scale or present existence of Jannah — two of the most striking Quranic facts about it — despite citing 3:133 in the sources.
   - Size: points · Kind: deepen-existing
   - Sourcing: local-verified (Quran 57:21 'race one another... Paradise the width of which is like the width of the heaven and earth' in verses/57.json; Quran 3:133; Nasai 35:3)

**12. ⚪ LOW · Named rivers/springs cross-linking and Kawthar deduplication note**
   - Where: Structural: 'Al-Kawthar' exists both here (Rivers & Gardens) and as a topic on day-of-judgement/page.tsx — add a cross-link line in each rather than parallel drift; likewise link 'The Last to Enter' (How to Enter) and 'The last to leave' (Deliverance) which currently duplicate the same hadith in prose
   - Why: Two pages now describe Al-Kawthar independently and two rail topics on this page retell Bukhari 81:159 — cross-links keep citations single-sourced as content deepens.
   - Size: points · Kind: structural
   - Sourcing: local-verified (existing refs on both pages: Bukhari 81:169, Muslim 4:56, Bukhari 81:159 — no new texts needed)

---

### /prayer-times — 10 proposals (6 high)

_Current coverage: Pure utility page with zero educational content: auto/manual location, a 12-option calculation-method menu, Hijri date line, hero countdown to the next prayer with window progress bar, a day-timeline strip of the 5 prayers, and six time cards (5 prayers + Sunrise labeled 'Not a prayer'). Nothing on the page explains what the times mean, when windows end, why methods differ, or what the Hijri date is — and there is no SourcesCard. The sibling /qiblah page shows the house pattern for utility pages (tool + educational ContentCards + SourcesCard below); this page has only the tool._

**1. 🔴 HIGH · When each prayer's window begins and ends (the hadith of Jibril + the window-definitions hadith)**
   - Where: New educational ContentCard section below the time cards, adopting the /qiblah pattern (ContentCards + SourcesCard under the tool). First card of the section.
   - Why: The tool shows only start times; every reader (especially new Muslims) needs to know each prayer is a window with an end — e.g. Isha until half the night, Asr before the sun yellows — and where these definitions come from.
   - Size: topic · Kind: structural
   - Sourcing: local-verified (Abu Dawud 2:3 'Gabriel led me in prayer at the House' with both ends of each window; Muslim 5:222 and 5:223 Abdullah b. Amr window definitions; Abu Dawud 2:6 'Asr as long as the sun has not become yellow')

**2. 🔴 HIGH · Forbidden prayer times — why the Sunrise card says 'Not a prayer'**
   - Where: ContentCard in the new educational section, directly answering the 'Not a prayer' label the UI already shows
   - Why: The page displays Sunrise with an unexplained 'Not a prayer' badge; the three prohibited windows (sunrise, zenith, sunset) and the after-Fajr/after-Asr rule are core fiqh every user praying by this page needs, including the exceptions (missed obligatory prayers, funeral timing).
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 9:61 'no prayer after the morning prayer till the sun rises, and no prayer after Asr till the sun sets'; Muslim 6:357 Uqbah b. Amir's three forbidden times for prayer and burial; Muslim 6:352-353 'it rises between the horns of Satan')

**3. 🔴 HIGH · The virtue of praying each prayer on time**
   - Where: ContentCard in the new educational section, near the countdown hero it motivates
   - Why: A countdown page is the natural home for the 'why hurry' texts — the single most famous hadith on the subject (dearest deed to Allah) is nowhere in the app's prayer-times context.
   - Size: points · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 9:6 'Which deed is dearest to Allah? To offer the prayers at their early stated fixed times'; Bukhari 10:51 Fajr and Isha heaviest on the hypocrites; Muslim 5:271 / Bukhari 9:50 two cool prayers → Paradise; Quran 4:103 'prayer is prescribed at fixed times')

**4. 🔴 HIGH · Missed or slept through a prayer — what to do (qada)**
   - Where: ContentCard + short FAQ in the new educational section
   - Why: Every new Muslim's first crisis is oversleeping Fajr; the app currently has no answer anywhere. Should cover: pray on waking/remembering, no sin for genuine sleep/forgetting, order of makeup, the Khaybar precedent, and (generic) note on deliberately missed prayers requiring repentance.
   - Size: topic · Kind: practical-guide
   - Sourcing: local-verified (Bukhari 9:72 'If anyone forgets a prayer he should pray it when he remembers it. There is no expiation except to pray the same'; Muslim 5:393 the Khaybar journey sleep with Bilal on watch; Abu Dawud 2:53 and Bukhari 61:80 companions sleeping past Fajr on a journey)

**5. 🔴 HIGH · Prayer of the traveler — shortening (qasr) and combining (jam') and how it changes your times**
   - Where: Full treatment belongs as a new topic in the /salah rail ('Prayer of the Traveler'); /prayer-times gets a summary ContentCard cross-linking it (this page is exactly where travelers will be looking)
   - Why: Nowhere in the app explains 4→2 rak'ah while traveling or combining Dhuhr+Asr / Maghrib+Isha — one of the most-searched practical prayer questions, and directly about times.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 4:101 shortening on journeys; Bukhari 18:1 nineteen days of shortened prayers; Bukhari 18:2 Anas: two rak'ah Madinah→Makkah; Bukhari 18:27 combined Zuhr+Asr and Maghrib+Isha on journeys; Bukhari 18:30 delaying Zuhr to Asr time when departing before noon)

**6. 🔴 HIGH · Which calculation method should I choose? (and why Fajr/Isha differ between them)**
   - Where: FAQ ContentCard in the educational section, referenced from the method menu (e.g. a small 'What's this?' link)
   - Why: Every user faces a 12-item menu (ISNA, MWL, Umm Al-Qura…) with zero guidance; explain that methods differ mainly in the sun-depression angles used for Fajr/Isha, that Dhuhr–Maghrib barely vary, and the practical rule: match your local masjid/community, plus a one-line note on the Hanafi Asr setting that the code already supports.
   - Size: points · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (astronomical convention differences; no hadith claims needed)

**7. 🟡 MED · Islamic midnight, the last third of the night, and tahajjud time**
   - Where: ContentCard in the educational section; optionally a computed row in the tool (midnight and last-third are simple midpoints of Maghrib→Fajr the page already knows)
   - Why: Practicing users ask 'until when can I pray Isha / when does the last third start tonight' — the page has all the data to answer with actual clock times, paired with the famous descent hadith.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 80:18 and Muslim 6:201 'our Lord descends every night to the lowest heaven in the last third'; Abu Dawud 2:165 Isha in congregation = vigil till midnight; Muslim 5:222 Isha window texts)

**8. 🟡 MED · The Hijri date, explained (lunar months, day begins at Maghrib)**
   - Where: Small ContentCard in the educational section, anchored to the Hijri date line the header already displays
   - Why: The page shows '14 Muharram 1448 AH' with no explanation; new Muslims need the 12 lunar months, 29/30-day months, the four sacred months, and that the Islamic day turns over at sunset (why Ramadan 'starts' the evening before).
   - Size: points · Kind: new-subtopic
   - Sourcing: local-verified (Quran 9:36 twelve months of which four are sacred; Quran 10:5 moon phases 'so that you may know the number of years')

**9. 🟡 MED · Prayer times at high latitudes and unusual daylight (UK/Scandinavia summers, polar regions)**
   - Where: FAQ ContentCard at the end of the educational section
   - Why: A large share of the English-speaking audience (UK, Canada, northern US) sees Isha near midnight and 3am Fajr in summer and wonders if the app is broken; needs the estimation approaches (nearest-day, 1/7 night, 45th-parallel) used by fiqh councils.
   - Size: points · Kind: practical-guide
   - Sourcing: needs-external-source (contemporary fiqh-council rulings, e.g. European Council for Fatwa / Moonsighting Committee guidance — verify before authoring)

**10. ⚪ LOW · When you hear the adhan — respond, then the dua (cross-link card)**
   - Where: Micro ContentCard in the educational section cross-linking /salah?tab=…adhan section and the duas page's 'After the Adhan' entry
   - Why: The countdown ends where the adhan begins; a 3-point card (repeat after the muezzin, salawat, dua between adhan and iqamah is not rejected) closes the loop without duplicating the existing /salah adhan section.
   - Size: points · Kind: missing-narrations
   - Sourcing: local-verified (Muslim 4:12 repeat what the mu'adhdhin says; Bukhari 10:12 / Abu Dawud 2:139 wasilah dua; Abu Dawud 2:131 'the supplication made between the adhan and the iqamah is not rejected')

---

### /prophets — 12 proposals (6 high)

_Current coverage: Landing page is a chronological timeline of 27 prophets (Adam through Muhammad) with era/date chips, Quran-mention counts, key surahs, search, and a Family Tree route. Each prophet links to /prophets/[slug], driven by packages/content/prophet-stories.ts: 2-6 story sections with Quran verses and occasional hadith, a Key Lessons list, and references. Depth is uneven — Musa/Isa/Yusuf get 5-6 sections; Al-Yasa, Ishaq, Ilyas, Yusha, Dhul-Kifl get 1-3 thin sections. There is no conceptual framing content at all, and no coverage of Quranic figures whose prophethood is debated._

**1. 🔴 HIGH · Intro topic: 'What Muslims believe about prophets' (nabi vs rasul, 25 named in the Quran, the five Ulul-'Azm, one shared message, no prophet between Isa and Muhammad)**
   - Where: New intro ContentCard/section at the top of /prophets, above the timeline (collapsible Accordion per house pattern)
   - Why: The page dives straight into a timeline with zero framing — a new Muslim landing here has no answer to 'what IS a prophet in Islam, and how many were there?', which is the first question the subject raises.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 21:25, 4:164, 33:7, 46:35 all present in packages/content/quran/verses; 'prophets are paternal brothers... no prophet between me and him' = Bukhari 60:112, 60:113; 124,000-prophets figure NOT in local corpus — app already cites Ibn Hibban 361 for it on the Shith entry, reuse that)

**2. 🔴 HIGH · Righteous figures & debated prophethood: Khidr, Dhul-Qarnayn, Luqman, Maryam, Uzair, Talut, People of the Cave**
   - Where: New second section on /prophets below the timeline ('Righteous Figures in the Quran'), each with a /prophets/[slug] detail page reusing the existing story template plus a 'Prophethood debated' badge (the source-badge pattern already exists)
   - Why: These are among the most-asked-about Quranic figures (Khidr and Dhul-Qarnayn anchor Surah al-Kahf, read every Friday); searching 'Khidr' or 'Luqman' on this page today returns nothing.
   - Size: own-page · Kind: new-subtopic
   - Sourcing: local-verified (Quran 18:65 Khidr, 18:83 Dhul-Qarnayn, 31:12 Luqman, 3:42 + 66:12 Maryam, 9:30 + 2:259 Uzair, 2:247 Talut, 18:9 Cave — all present; Khidr narrative also in Bukhari 3:16, 3:20)

**3. 🔴 HIGH · Deepen Musa: the journey with Khidr, the cow of Bani Israel, Qarun, and the death of Musa**
   - Where: 3-4 new sections appended to the musa entry in packages/content/prophet-stories.ts
   - Why: Musa is the most-mentioned prophet (136x, flagged on the card itself) yet his story stops at Sinai — the Khidr episode, one of the most beloved prophet narratives, is entirely absent from the app.
   - Size: topic · Kind: deepen-existing
   - Sourcing: local-verified (Quran 18:60, 18:65 present; Bukhari 3:16 and 3:20 carry the full Musa-Khidr narration; Bukhari 60:80 'Musa and the Angel of Death' is already cited in the story's references but never told)

**4. 🔴 HIGH · Deepen Ibrahim: debate with Nimrod, the four birds, the 'three lies' hadith, and the dialogue with his father Azar**
   - Where: 2-3 new sections in the ibrahim entry of prophet-stories.ts (currently 4 sections)
   - Why: Ibrahim is the second pillar of the whole page (69 mentions, father of the lineage in the family tree) and famous episodes practicing Muslims expect — Nimrod, the birds, the three lies — are all missing.
   - Size: topic · Kind: deepen-existing
   - Sourcing: local-verified (Quran 2:258 Nimrod debate, 2:260 four birds; Bukhari 60:32 and 60:33 'Abraham did not tell a lie except on three occasions')

**5. 🔴 HIGH · Duas of the Prophets — the Quranic supplications of Adam, Yunus, Ayyub, Musa, Ibrahim, Zakariyya**
   - Where: Either a 'His du'a' block added to each story section in prophet-stories.ts, or a 'Prophets' category in /duas with cross-links both ways
   - Why: This is the most practical, memorizable takeaway of the whole subject — Dua Yunus alone is one of the most recited duas in distress, and none of these appear on the prophet pages.
   - Size: topic · Kind: practical-guide
   - Sourcing: local-verified (Quran 7:23 Adam, 21:87 Yunus, 21:83 Ayyub, 20:25 Musa, 14:40 Ibrahim, 19:4 Zakariyya — all present in packages/content/quran/verses)

**6. 🔴 HIGH · Cross-link /prophets/muhammad to the dedicated /prophet-muhammad page**
   - Where: Prominent link card at the top of the muhammad detail page (and on the timeline card) pointing to /prophet-muhammad (Timeline, Character, Prophecies, Worship & Sunnah tabs)
   - Why: The 5-section muhammad story looks thin next to Musa, but a full seerah page already exists elsewhere in the app — users reaching it via the prophets timeline never discover it.
   - Size: points (2-4 bullets) · Kind: structural
   - Sourcing: local-verified (route exists: apps/web/src/app/prophet-muhammad/page.tsx with 6 tabs and a 27-event timeline)

**7. 🟡 MED · The Great Intercession — humanity goes from Adam to Nuh to Ibrahim to Musa to Isa to Muhammad on the Day of Judgment**
   - Where: Closing section of the muhammad story (or the new intro topic), cross-linked to /day-of-judgement
   - Why: It is the single narration that ties all 27 prophets on this page into one scene and shows the Prophet's unique station — a natural capstone for the timeline.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 97:39, 97:66, 97:141; also Muslim book 1)

**8. 🟡 MED · Adam story additions: created sixty cubits tall, created on Friday, and an expanded Habil & Qabil section**
   - Where: New hadith blocks + one expanded section in the adam entry of prophet-stories.ts
   - Why: The current 'Descent to Earth & Legacy' section compresses the first murder into one sentence, and two famous authentic creation hadith are absent.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 60:2 and 79:1 'sixty cubits'; Muslim 7:26, 7:27 'best day... on it Adam was created'; Habil/Qabil at Quran 5:27-31)

**9. 🟡 MED · Dawud story additions: the fast of Dawud and his night prayer as living sunnah, plus the two disputants (Sad 38)**
   - Where: One new section in the dawud entry (currently 3 sections), cross-link to /salah and fasting content
   - Why: 'The most beloved fasting to Allah is the fast of Dawud' is the one thing about Dawud a practicing Muslim can act on today — the story currently offers nothing practical.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 30:81, 30:86 on the fasting of David)

**10. 🟡 MED · Isa story addition: the descent before the Hour among the major signs, and 'I am the closest of people to Isa'**
   - Where: Extend the existing 'Not Crucified — Raised to Heaven' section in the isa entry; cross-link /day-of-judgement
   - Why: The return of Isa is mentioned in one sentence, but for new Muslims (especially ex-Christians) this is the topic they most want detailed, with daleel.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Muslim 54:51, 54:52 descent of Jesus among the ten signs; Bukhari 60:112, 60:113 'closest of people to the son of Mary')

**11. 🟡 MED · FAQ topic: common questions about prophets (Are prophets sinless? Which prophets are alive? Why did some get miracles? Do Muslims accept Biblical prophets?)**
   - Where: Accordion at the bottom of /prophets landing, after the timeline
   - Why: These are the exact questions parents get from kids and new Muslims get from family; today the page has stories but no Q&A surface.
   - Size: topic · Kind: practical-guide
   - Sourcing: scholarly-summary-generic ('ismah discussion is scholarly; 'no prophet between me and him' anchor = Bukhari 60:112 local-verified)

**12. ⚪ LOW · Yusuf story additions: 'the honorable, son of the honorable' hadith and the link from 'no blame upon you today' (12:92) to the conquest of Makkah**
   - Where: Hadith block in the existing 'Forgiveness and Reunion' section of the yusuf entry
   - Why: Small additions that connect the 'best of stories' to the Prophet's own words and conduct, deepening the forgiveness lesson.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 60:56, 60:64 'The honorable, the son of the honorable... Joseph'; Quran 12:50 present, 12:92 same local surah file)

---

### /kids — 13 proposals (6 high)

_Current coverage: Card-grid landing with 7 lessons across 3 age tiers (4-6, 7-9, 10-12), gamified with stars/streaks/badges. Lessons: Who is Allah (99-Names flashcards, age-sliced 10/33/99 from packages/content/names-of-allah.ts); Five Pillars (description + steps + 2-3 quiz Qs per pillar); Daily Words (15 phrases with spaced repetition); Prophet Stories (11 prophets rendered from packages/content/prophet-stories.ts); Quran Corner (6 short surahs with per-verse reciter audio and memorize tracking); Good Deeds (12-item daily checklist + streak); Challenges (15-question mixed quiz bank). Aqidah beyond 'who is Allah', worship how-to, duas, akhlaq/manners, and calendar/Eid content are absent, and quiz/word/surah banks are shallow for returning users._

**1. 🔴 HIGH · Surface the 14 prophet stories already written but hidden — Hud, Salih, Lut, Shith, Idris, Ishaq, Yaqub, Ayyub, Shuayb, Harun, Yusha, Ilyas, Zakariyya, Yahya**
   - Where: Prophet Stories tab — extend prophetList[] (and getProphetsByAge tiers) in page.tsx; stories render automatically from prophetStories[slug]
   - Why: packages/content/prophet-stories.ts contains 25 complete stories with sections, verses, hadith and lessons, but the kids tab hard-codes only 11 — more than half the finished corpus is invisible, and the 'story-explorer' badge caps engagement early.
   - Size: topic (extend existing tab's list + age tiers; zero new authoring) · Kind: deepen-existing
   - Sourcing: local-verified (packages/content/prophet-stories.ts keys: hud, salih, lut, shith, idris, ishaq, yaqub, ayyub, shuayb, harun, yusha, ilyas, zakariyya, yahya — all with full sections/verses/lessons)

**2. 🔴 HIGH · Six Pillars of Iman (What Do Muslims Believe?) — Allah, angels, holy books, messengers, Last Day, qadar**
   - Where: New lesson card in the landing grid (mirror the Five Pillars pattern: age-tiered description + steps + quiz per article)
   - Why: Every children's Islamic curriculum teaches the 5 pillars of Islam alongside the 6 pillars of iman; parents and madrassah teachers will look for it and find only half the foundation.
   - Size: tab (new lesson card, ~6 mini-lessons + quizzes) · Kind: new-subtopic
   - Sourcing: local-verified (Jibril hadith on iman: Bukhari 2:43; angels created from light: Muslim 55:78; 99-names belief: Bukhari 54:23)

**3. 🔴 HIGH · Let's Pray! — kid step-by-step wudu and salah (rakat counts, what to say in each position, common mistakes)**
   - Where: New lesson card in the landing grid; cross-link the adult /salah page for parents; natural home for the user's planned Rive animated prayer figures (PrayerFigure component exists)
   - Why: The Salah pillar lesson describes prayer but never teaches a child how to actually do it — the single most practical thing a parent opens a kids Islam app for, especially around age seven.
   - Size: tab (new lesson card: wudu sequence + prayer walkthrough + quiz) · Kind: practical-guide
   - Sourcing: local-verified (Command your children to pray at seven: Abu Dawud 2:105; bedtime/practice framing; wudu/salah step content can mirror the app's existing /salah page)

**4. 🔴 HIGH · My First Duas — daily supplications for kids (waking, sleeping, before/after eating, entering bathroom, leaving home, morning-evening protection) with transliteration and audio**
   - Where: New lesson card, or a 'duas' deck alongside Daily Words reusing its flashcard + spaced-repetition mechanics; cross-link /duas stable ids
   - Why: Teaching bedtime and eating duas is the first thing Muslim parents do with small children; the page teaches single words (Bismillah) but not one actual dua.
   - Size: tab (new lesson card, ~10-15 duas in flashcard format) · Kind: new-subtopic
   - Sourcing: local-verified (sleep dua 'Bismika amutu wa ahya': Bukhari 80:9, 80:11; 'Say Bismillah and eat with your right hand': Bukhari 70:4; morning/evening protection dua: Abu Dawud 43:316)

**5. 🔴 HIGH · Good Manners (Akhlaq) lessons — honesty, kindness, gentleness, greeting, respecting parents, controlling anger, mercy to animals; each as a mini-story + hadith + quiz**
   - Where: New lesson card in the landing grid ('Good Manners' / 'Be Like the Prophet ﷺ'), structured like Five Pillars: pick a virtue → short lesson → quiz
   - Why: Character education is the core of Islamic tarbiyah for kids; the Good Deeds checklist tracks behavior but nothing teaches WHY, and the tradition's most kid-friendly authentic hadiths are all absent.
   - Size: tab (new lesson card, ~8 virtue mini-lessons) · Kind: new-subtopic
   - Sourcing: local-verified (truthfulness leads to Paradise: Bukhari 78:121; smiling is charity: Tirmidhi 27:62; love for your brother: Bukhari 2:6; not merciful/not shown mercy: Bukhari 78:44; man who watered the thirsty dog: Bukhari 4:39; the strong one controls anger: Bukhari 78:141; Allah is kind and loves kindness: Muslim 45:99; young greet the old: Bukhari 79:5; mother deserves best companionship: Bukhari 78:2)

**6. 🔴 HIGH · Quran Corner expansion: 6 → ~12 surahs (Al-Asr, Al-Fil, Quraysh, Al-Ma'un, Al-Kafirun, Al-Masad) + Ayat al-Kursi as a special memorization item**
   - Where: Quran Corner tab — extend miniSurahs[] (structure already supports it; globalStart IDs for CDN audio are the only lookup needed)
   - Why: Six surahs is a ceiling a motivated child hits in weeks (the hint literally shows 'X of 6 memorized'); the standard kids' hifz set is Juz Amma's last ~10 surahs plus Ayat al-Kursi for bedtime.
   - Size: topic (6-7 new miniSurah entries in existing tab) · Kind: deepen-existing
   - Sourcing: local-verified (Arabic/English available in packages/content/quran/verses/103,105,106,107,109,111.json and 2.json v255; motivation hadith 'best of you learns the Quran and teaches it': Bukhari 66:49; Ayat al-Kursi guards you through the night: Bukhari 66:32)

**7. 🟡 MED · Ramadan and the Two Eids for kids — what fasting month feels like, gates-of-Paradise hadith, Eid al-Fitr vs Eid al-Adha, Eid morning routine, Hijri months overview**
   - Where: New lesson card ('Special Days'), or a rail inside a broadened Five Pillars/celebrations lesson; can cross-link the adult Ramadan home seasonally
   - Why: Eid is the most exciting Islamic experience in a child's year and kids constantly ask what it is; Sawm's lesson covers fasting mechanics but nothing covers the celebrations or the Islamic calendar.
   - Size: sub-tab (one lesson card with 3-4 sections + quiz) · Kind: new-subtopic
   - Sourcing: local-verified for Ramadan (gates of Paradise opened when Ramadan begins: Bukhari 30:8; fasting forgiveness: already quoted in pillar text); Eid customs and Hijri-months overview = scholarly-summary-generic

**8. 🟡 MED · Challenges bank expansion: 15 → 50+ questions with themed packs (Prophets, Quran, Pillars, Manners, Seerah) and per-pack best scores**
   - Where: Challenges tab — grow challengeQuestions[] and add a pack picker before startQuiz(); difficulty tiers already exist
   - Why: A returning child sees repeats within two sessions (little tier draws from only 5 questions), which kills the replay loop the stars/streak economy depends on.
   - Size: topic (35+ new questions + small pack-picker UI) · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (questions derived from the page's own verified lesson content; no new citations required)

**9. 🟡 MED · Daily Words expansion: 15 → ~30 phrases (Ameen, BarakAllahu feek, the full sneeze exchange reply 'Yahdikumullah', Taqabbal Allahu minna, Eid Mubarak / Ramadan Mubarak, Subhanahu wa ta'ala, Alayhis-salam, Radiyallahu anhu, Fi amanillah)**
   - Where: Daily Words tab — extend dailyWords[] (categories field already exists: add 'honorifics' and 'celebrations')
   - Why: The sneeze exchange is currently taught incomplete (Alhamdulillah and Yarhamukallah exist but not the reply), and everyday phrases kids hear at the mosque and on Eid are missing.
   - Size: points (12-15 new dailyWords entries) · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (common-usage phrases; the sneeze-exchange etiquette itself is in Bukhari's Adab chapters if a citation is wanted on the card)

**10. 🟡 MED · Good Deeds checklist additions — 'Helped or obeyed my parents', 'Said sorry / forgave someone', 'Was kind to an animal', 'Brushed teeth / kept clean', 'Prayed a prayer on time by myself' (scholar tier)**
   - Where: Good Deeds tab — extend checklistItems[] with ageMin tiers
   - Why: Kindness to parents — arguably the #1 child-facing deed in Islam — is missing from a deeds checklist that includes dhikr and charity; a parent reviewing the list at bedtime will notice.
   - Size: points (4-5 new checklist items) · Kind: deepen-existing
   - Sourcing: local-verified (mother deserves best companionship: Bukhari 78:2; mercy to animals via the dog hadith: Bukhari 4:39; cleanliness is half of faith: Muslim 2:1; children commanded to pray at seven: Abu Dawud 2:105)

**11. 🟡 MED · Heroes of Islam — Sahaba and family stories for kids (Abu Bakr the loyal friend, Bilal's perseverance, young Anas the Prophet's helper, Khadijah, Fatimah, Umar's justice)**
   - Where: New rail inside Prophet Stories (rename card 'Stories') or its own lesson card once the grid grows; reuse the sectioned story-reader + 'What I Learned' pattern
   - Why: After the prophets, companion stories are the standard next layer of every kids' Islamic storybook, and they model relatable child/teen role models (Anas was a boy when he served the Prophet).
   - Size: tab (6-8 sectioned stories) · Kind: new-subtopic
   - Sourcing: local-verified for anchor narrations (Anas served the Prophet ten years and never heard 'uff': Bukhari 78:68, Muslim 43:70; Prophet kissing his grandson al-Hasan: Bukhari 78:28); full biographies = scholarly-summary-generic, so route through docs/content-review-queue.md per house rule

**12. ⚪ LOW · Arabic Alphabet corner for Little Learners — 28 letters with shapes, sounds, and a trace/flashcard game**
   - Where: New lesson card gated to little/explorer tiers, or a rail inside Quran Corner as a pre-memorization step
   - Why: Letter recognition is the entry point to Quran reading and a staple of competing kids' Islam apps; Quran Corner currently assumes the child can already follow Arabic.
   - Size: tab (28-item interactive deck; asset work dominates) · Kind: new-subtopic
   - Sourcing: needs-external-source (letter-sound audio assets; letter forms themselves are uncontroversial reference material)

**13. ⚪ LOW · Parents' Guide — how to use the age tiers, a suggested weekly rhythm, and consolidated 'Learn Together' teaching tips**
   - Where: Collapsible intro card on the landing grid above the lesson cards, or a small 'For Parents' entry at the bottom of the grid
   - Why: The page's subtitle promises parent-child co-learning but the guidance is scattered one-liners at the bottom of each lesson; a teacher or new-Muslim parent gets no orientation on where to start per age.
   - Size: points (one card with 4-6 short sections) · Kind: structural
   - Sourcing: scholarly-summary-generic (pedagogical guidance, no citations needed)

---

### /death-rites — 13 proposals (6 high)

_Current coverage: Six tabs, each a SubTabLayout rail (already at the 6-tab house max). Preparing (reality of death, set your affairs, good ending), The Dying (bedside talqin, words & du'a, soul departs), Types of Death (good end, battlefield martyr, martyrs of reward, seeking martyrdom, children who die young — this last one is deep and excellent), Washing & Janazah (ghusl + kafan, janazah prayer how-to with du'as and qirat reward), Burial (grave, lowering, after-burial, women & burial), Grief & Visiting (grief/patience/iddah periods, visiting graves). All content is inline JSX with per-sub SourcesCards; cross-links to /barzakh and /salah exist._

**1. 🔴 HIGH · What Reaches the Dead — deeds that benefit the deceased (sadaqah jariyah; charity, fasting and hajj on their behalf)**
   - Where: New topic in the Grief & Visiting rail (e.g. 'What Reaches Them', after 'Visiting Graves'); cross-link from the janazah and children subs
   - Why: This is the single most-asked question after losing a parent ('what can I still do for them?') and the page only alludes to it in one sentence (Muslim 25:20 in the visiting sub) without ever presenting the famous hadith or the on-behalf-of acts.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (deeds end except three: Nasai 30:41, Tirmidhi 15:57, Muslim book 25 — already cited onsite as Muslim 25:20; charity on behalf of the dead mother: Bukhari 55:19, Bukhari 55:23, Muslim 25:17-18; heir fasts for the deceased: Bukhari 30:59-60; hajj on behalf + 'Allah's debt has more right to be paid': Bukhari 28:32-33, Muslim 15:455-456)

**2. 🔴 HIGH · Ta'ziyah — consoling the bereaved: what to say, what to do, what to avoid**
   - Where: New topic in the Grief & Visiting rail ('Consoling Others'), between 'Grief & Patience' and 'Visiting Graves'
   - Why: The grief tab is written entirely from the mourner's side; a new Muslim attending their first Muslim funeral has no guidance on what to actually say (the Prophet's condolence message), the 3-day condolence window, or avoiding innovated fixed gatherings — only the 'cook for the family of Ja'far' card exists.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (the Prophet's ﷺ condolence 'To Allah belongs what He has taken... everything has an appointed term, so be patient and seek reward': Ibn Majah 6:156; written condolences: Nasai 21:54; 'whoever consoles a bereaved mother': Tirmidhi 10:112 — present with grading note, weak per some; food for the bereaved Abu Dawud 21:44 already onsite)

**3. 🔴 HIGH · The funeral procession (tashyi' al-janazah) — following, carrying, standing, and the qirat for staying**
   - Where: New topic at the start of the Burial rail ('The Procession', before 'The Grave') — the page currently jumps from the janazah prayer straight to the dug grave
   - Why: Following the funeral is one of the named rights of a Muslim upon a Muslim, and standing when a funeral passes ('Is it not a soul?') is a famous Sunnah attendees will encounter and ask about at every janazah.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (rights of a Muslim include following funerals: Bukhari 23:4; the seven commands: Bukhari 23:3; stand for a passing funeral: Bukhari 23:65, 23:68; the Prophet standing for a Jew's funeral: Bukhari 23:69; remain standing until it is put down: Abu Dawud 21:88, Nasai 21:97; the qirat requires following, not just praying: Muslim 11:70)

**4. 🔴 HIGH · Special janazah cases — prayer in absentia (Najashi), praying at the grave after burial, the person who died by suicide, the debtor, and the muhrim**
   - Where: New topic in the Washing & Janazah rail ('Special Cases', after 'Janazah Prayer')
   - Why: These are the situations real communities actually hit — especially whether janazah is prayed for someone who died by suicide (yes; the Prophet abstained personally but did not forbid it), a pastorally critical answer grieving families search for.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (salat al-gha'ib for the Najashi with four takbirs: Bukhari 23:74, Muslim 11:85-88, Ibn Majah 6:106; praying at the grave — the mosque sweeper: Bukhari 8:106, Muslim 11:93, Abu Dawud 21:115; suicide — the man with the arrowhead: Muslim 11:138, Nasai 21:147, with warnings at Muslim 1:206-210; the debtor — 'pray over your companion' until Abu Qatadah guaranteed the two dinars: Tirmidhi 10:105, Muslim 23:18; the muhrim crushed at Arafat — wash with sidr, no perfume, resurrected saying talbiyah: Bukhari 28:29-31, Muslim 15:106)

**5. 🔴 HIGH · For the dying person themselves — meeting Allah with hope (husn adh-dhann, 'whoever loves to meet Allah', the Prophet's own last moments)**
   - Where: New topic in The Dying rail ('Meeting Allah', after 'The Soul Departs')
   - Why: The entire Dying tab is written for the bystander at the bedside; the terminally ill user (or the family reading to them) finds nothing addressed to the dying person's own heart — the tradition's most tender material.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified ('Whoever loves to meet Allah, Allah loves to meet him' with Aisha's clarification about the moment of death: Bukhari 81:96-97, Muslim 48:16-24, Tirmidhi 10:102; the Prophet's ﷺ last words 'ar-Rafiq al-A'la' and the siwak/water narrations: Bukhari 75:34, 64:459, 64:471, 81:98-99). The 'let none of you die except thinking well of Allah' narration (Muslim) was not matched in the local corpus by my searches — verify wording before use (needs-external-source for that one narration)

**6. 🔴 HIGH · When a Muslim dies in the West — the first 24 hours practical checklist**
   - Where: New topic in the Preparing rail ('Practical Checklist') or as the first entry of Washing & Janazah; cross-link from 'Set Your Affairs'
   - Why: The app's English-speaking audience faces funeral homes, death certificates, autopsy requests, embalming defaults, and cremation marketing that the classical material never addresses — a step-by-step (call the masjid janazah service, decline embalming/cremation, hasten burial, costs, repatriation vs local burial, Muslim cemetery sections) is the page's biggest practical hole.
   - Size: topic (a rail entry) · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (procedure guidance; anchor the hastening and dignity points to Bukhari 23:73 already onsite — do not invent refs for the civil-process steps)

**7. 🟡 MED · 'The deceased is punished by the wailing of his family' — the famous narration and Aisha's clarification**
   - Where: Grief & Visiting → Grief & Patience, in the 'What is Permitted, What is Not' section
   - Why: This widely quoted and widely misunderstood hadith (does my crying harm my dead relative?) is exactly what an informed reader expects a wailing section to address, and the clarification is deeply comforting.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 23:46 — Ibn Umar at the funeral in Mecca with Aisha's response cluster; Muslim 11:20, 11:23 — Umar's death narrations; Nasai 21:31-33)

**8. 🟡 MED · Bayt al-Hamd — 'build for My servant a house in Paradise and call it the House of Praise'**
   - Where: Grief & Visiting → Grief & Patience (or a card in Types of Death → Children Who Die Young)
   - Why: One of the most famous consolation texts for bereaved parents — praising Allah at the loss of a child earns a named house in Paradise — and it is absent from an otherwise excellent children-loss section.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Tirmidhi 10:57 — Abu Sinan burying his son Sinan, Abu Talhah al-Khawlani's narration)

**9. 🟡 MED · The widow's mourning in practice (ihdad) — what the 4 months and 10 days actually involve**
   - Where: Grief & Visiting → Grief & Patience, expanding the existing 'Mourning Periods' section
   - Why: The page states the period but not its content — a new widow needs the practical rules (no adornment/perfume/kohl, staying in the marital home, exceptions for work and necessity) that scholars derive from the Umm 'Atiyya/Umm Habibah narrations.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: needs-external-source for the detailed no-kohl/no-perfume narration (Bukhari, Book of Divorce — not spot-checked locally); the period itself is anchored by Bukhari 23:40 and Quran 2:234/65:4 already onsite

**10. 🟡 MED · Women visiting graves — presenting the ruling honestly**
   - Where: Grief & Visiting → Visiting Graves, one balanced card
   - Why: The page covers women at the burial but is silent on women visiting graves afterwards, where the 'Allah cursed women who visit graves' narrations circulate online without the frequent-visitor reading and the general-permission evidence — a female user deserves the balanced treatment.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Tirmidhi 10:92, Abu Dawud 21:148, Ibn Majah 6:142-144 for the cursing narrations; pair with the general permission 'I forbade you... now visit them' Muslim 11:136 already onsite and the scholarly zawwarat reading as scholarly summary)

**11. 🟡 MED · 'Three things follow the deceased; two return and one remains' — strengthen Reality of Death**
   - Where: Preparing → Reality of Death (currently only 3 cards)
   - Why: Among the most famous death-reminder hadith in the tradition (family and wealth return, deeds remain) and a natural companion to the existing 'destroyer of pleasures' card.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Muslim 55:8 — Anas ibn Malik)

**12. 🟡 MED · Ghusl volunteer walkthrough + fix the unsourced 'forgiven forty times' card**
   - Where: Washing & Janazah → Washing & Shrouding: add a step-by-step 'if you are asked to help wash' sequence (many first-timers are recruited by the masjid with zero notice) and a citation or removal for the 'conceals his faults... forgiven forty times' card, which currently ships with no reference
   - Why: Ghusl is fard kifayah and communities constantly need untrained volunteers; meanwhile the forty-times narration has no local corpus support (it is in al-Hakim/Bayhaqi) and is the only uncited claim in the sub.
   - Size: points (2-4 bullets) · Kind: practical-guide
   - Sourcing: local-verified for the method (Bukhari 23:15, 23:18 — already onsite); the forty-times narration itself needs-external-source (al-Hakim/Bayhaqi with grading)

**13. ⚪ LOW · 'Dig deep, make it wide' — the Uhud grave-digging instruction**
   - Where: Burial → The Grave (currently only 2 cards, and the 'Depth and design' card has no reference)
   - Why: Gives the thin grave sub its missing daleel and covers the practically relevant Uhud ruling of burying two or three in one grave in necessity.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Nasai 21:193 — Hisham bin 'Amir, 'dig deep, make it wide, and bury two or three in one grave')

---

### /sects — 14 proposals (6 high)

_Current coverage: Five tabs. Overview (essay: 73-sects prophecy, saved group as methodology, Ahl al-Sunnah is not a sect) and Why It Matters (4 flat cards). Ahl al-Sunnah tab has a 4-topic rail: Core Creed/Aqeedah, Four Fiqh Schools, Hadith Sciences, Status of the Companions. Shia Islam tab has a 4-topic rail: Historical Origins, Key Beliefs (Imamah/infallibility/Hidden Imam/Companions/hadith corpus), Distinct Practices (mut'ah, tatbir, adhan, taqiyyah, shrines), The Sunni Position. Other Groups tab has a 6-topic rail: Khawarij, Mu'tazilah, Sufism, Ash'aris & Maturidis, Ahmadiyyah, Nation of Islam. All content is inline in the page file (no external data imports); it opens with an honest-framing disclaimer that the app issues no verdicts on individuals._

**1. 🔴 HIGH · Modern movements and labels a Muslim actually encounters today — Salafiyyah (and the 'Wahhabi' label), Deobandi vs. Barelwi, Tablighi Jamaat, Muslim Brotherhood/Ikhwan, Hizb ut-Tahrir, contemporary Sufi orders**
   - Where: New 6th tab 'Modern Movements' (page is at 5 of max 6 tabs) with its own rail; alternatively new topics appended to the Other Groups rail
   - Why: A new Muslim walks into real mosques and hears these labels immediately — the page covers 7th-century and 19th-century groups but nothing about the landscape users must actually navigate; each entry needs origin, what they emphasize, where they sit relative to Ahl al-Sunnah, and a calm 'these are mostly intra-Sunni orientations, not sects' framing.
   - Size: tab · Kind: new-subtopic
   - Sourcing: scholarly-summary-generic

**2. 🔴 HIGH · Sunnah vs. Bid'ah — what innovation actually is, the 'Irbad ibn Sariyah farewell-advice hadith, and the khutbah warning against newly invented matters**
   - Where: New topic in the Ahl al-Sunnah rail (5th entry), since bid'ah-recognition is the core Sunni tool the whole page presupposes
   - Why: The page uses the word bid'ah (Why It Matters card 4, Imam Malik quote) but never defines it or gives its daleel — the reader is told sects deviated by innovation without being taught what innovation is, its types, and what it is not (mubah worldly inventions).
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 7:55 'worst of matters are newly invented'; Abu Dawud 42:12 'Irbad ibn Sariyah — Sunnah of the rightly-guided caliphs, bite on it with molar teeth; Ibn Majah 0:42 same event)

**3. 🔴 HIGH · The danger of takfir — why declaring a Muslim a disbeliever is the gravest of accusations and belongs to scholars**
   - Where: New card(s) in the Why It Matters tab, cross-linked from the Khawarij topic and the page disclaimer
   - Why: The page's own disclaimer says 'who is or isn't within Islam is a serious matter for qualified scholars' but presents zero evidence for that principle — the famous 'it returns to one of them' hadith is exactly the daleel and directly counters the Kharijite instinct the page warns about.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 78:130 'If a man says to his brother O Kafir, surely one of them is such'; Muslim 1:121 and 1:122; Abu Dawud 42:92)

**4. 🔴 HIGH · Sticking to the Jama'ah — the famous unity narrations: separating a handspan, Allah's Hand is with the Jama'ah, the Ummah will not unite on misguidance, Hudhayfah's 'callers at the gates of Hell'**
   - Where: Deepen the Why It Matters tab (currently only 4 cards) or a new 'Holding to the Jama'ah' topic in the Ahl al-Sunnah rail
   - Why: These are the canonical proof-texts of the entire subject — a practicing Muslim looking for the daleel behind 'stay with the main body' finds none of them on the page; Hudhayfah's hadith also gives the practical instruction ('adhere to the jama'ah of the Muslims and their imam') for times of confusion.
   - Size: topic (a rail entry) · Kind: missing-narrations
   - Sourcing: local-verified (Muslim 33:87 separating from the jama'ah = death of jahiliyyah; Muslim 33:81 Hudhayfah — callers standing at the gates of Hell; Tirmidhi 33:9 'Allah's Hand is with the Jama'ah'; Tirmidhi 33:10 Ummah will not gather upon deviation; Ibn Majah 36:25 'my nation will not unite on misguidance')

**5. 🔴 HIGH · Qadariyyah and Murji'ah — the two missing early creed sects (free-will deniers of decree, and faith-without-actions)**
   - Where: One or two new topics in the Other Groups rail, placed chronologically after Khawarij
   - Why: The page's own Aqeedah tab defines Ahl al-Sunnah against the Murji'ah by name yet never explains who they were; the qadar dispute is the very first hadith of Sahih Muslim and the classic second fitna of creed — a practicing reader will notice the omission.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 1:1 Ma'bad al-Juhani first to deny qadar in Basra + Ibn Umar's disavowal; Abu Dawud 42:96 'the Qadariyyah are the Magians of this community'; Abu Dawud 42:100 same Yahya b. Ya'mur account; Tirmidhi 32:17 'two groups with no share in Islam: the Murji'ah and the Qadariyyah')

**6. 🔴 HIGH · Quranists / hadith-rejectors ('Quran alone' movement) — and the Prophet's explicit prophecy of the man on his couch**
   - Where: New topic in the Other Groups rail
   - Why: Hadith-rejection is one of the most common deviations an English-speaking Muslim meets online today, and the Prophet foretold it almost verbatim — a made-to-order topic connecting to the existing Hadith Sciences tab as the positive case.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Abu Dawud 42:10 'reclining on his couch... we follow what we find in the Book of Allah'; Tirmidhi 41:19; Tirmidhi 41:20 al-Miqdam version 'Between us and you is the Book of Allah'; pairs with Quran 59:7)

**7. 🟡 MED · Khawarij topic: add the founding Dhul-Khuwaysirah incident narrative and the remaining famous descriptions (arrow leaving the game, their prayer makes you belittle yours, dogs of the Fire, young with foolish minds)**
   - Where: Deepen existing Khawarij topic in the Other Groups rail (currently 4 points, uses Bukhari 61:117 only as the hero text)
   - Why: This is the sect with the richest authentic hadith record — the page summarizes but doesn't present the vivid, memorable narrations that make the warning stick for a reader or a teacher preparing a lesson.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 88:15 and 78:189 Dhul-Khuwaysirah 'Be just!'; Bukhari 88:14 'go out of Islam as an arrow darts out of the game's body'; Bukhari 66:82 young people with foolish thoughts; Bukhari 66:83 'their prayer will make you look down upon yours'; Tirmidhi 47:52 and Ibn Majah 0:173 'dogs of the Fire'; Ibn Majah 0:168 new teeth/foolish minds)

**8. 🟡 MED · Practical guide: 'Do I have to follow a madhhab?' — choosing a school, mixing rulings, praying behind other madhhabs, and the Banu Qurayzah precedent for legitimate disagreement**
   - Where: Extend the Schools of Jurisprudence topic in the Ahl al-Sunnah rail with a practical-FAQ block, or a sibling rail topic 'Living with fiqh differences'
   - Why: The fiqh tab describes the four schools academically but answers none of the questions a new Muslim actually has (which one am I? is switching allowed? why does the next mosque pray differently?) — the Banu Qurayzah 'Asr incident is the classic proof the Prophet approved both sides of a good-faith textual disagreement.
   - Size: sub-tab · Kind: practical-guide
   - Sourcing: local-verified (Bukhari 12:5 and 64:163 'None should offer the Asr prayer but at Banu Quraiza' and the Prophet blamed neither group; Bukhari 96:79 mujtahid two-rewards already on page)

**9. 🟡 MED · Warning signs of cults and deviant groups — a convert-protection checklist (leader claims special revelation or infallibility, secret teachings, isolation from mainstream mosques, blanket takfir of outsiders, financial exploitation)**
   - Where: New card-set at the end of the Why It Matters tab, or first entry of the proposed Modern Movements tab
   - Why: New Muslims are the primary recruiting target of fringe groups; the page teaches history but gives no actionable filter — anchor it in Hudhayfah's 'callers at the gates of Hell... adhere to the jama'ah' and the checklist writes itself from the sect profiles already on the page.
   - Size: topic (a rail entry) · Kind: practical-guide
   - Sourcing: local-verified (Muslim 33:81 Hudhayfah hadith — people inviting at the gates of Hell; Bukhari 78:130 takfir returns; Abu Dawud 39:43 thirty dajjals each claiming to be a messenger)

**10. 🟡 MED · Ibadiyyah (Oman) — the third living branch of Islam, entirely absent**
   - Where: New topic in the Other Groups rail, adjacent to Khawarij (historical descent from the moderate Kharijite wing, which modern Ibadis dispute)
   - Why: Users travel to or hear about Oman and find a whole state following a school the page never names; cover origins (Abdullah ibn Ibad), distinct creed points (created Quran, denial of seeing Allah in the Hereafter, view of major sinners), their own hadith corpus (Musnad al-Rabi'), and how they differ from the extremist Khawarij described above.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: scholarly-summary-generic (Al-Milal wan-Nihal framework; creed contrasts reuse refs already on page, e.g. Quran 75:22-23 and Bukhari 10:201 for the beatific vision)

**11. 🟡 MED · Branches of Shia Islam — Zaidis, Ismailis (Nizari/Agha Khani, Bohra), Alawites, Druze as a dedicated topic instead of one bullet**
   - Where: New 5th topic in the Shia Islam rail ('Branches & Sub-sects'), expanding the single 'Major sub-sects developed over time' point in Historical Origins
   - Why: The differences are large and practically relevant (Zaidis are closest to Sunni positions and reject cursing the Companions; Druze and Alawites hold esoteric doctrines most scholars place outside Islam entirely) — collapsing them into one sentence flattens distinctions the page elsewhere insists on.
   - Size: topic (a rail entry) · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (Al-Milal wan-Nihal, ash-Shahrastani; Al-Farq bayn al-Firaq, al-Baghdadi — both already in the page's source lists)

**12. 🟡 MED · Ahmadiyyah topic: add the 'thirty dajjals' prophecy and the Musaylimah precedent of false-prophet claimants**
   - Where: Deepen existing Ahmadiyyah topic in the Other Groups rail (1-2 new points)
   - Why: The strongest prophetic frame for false-prophet movements — that the Prophet foretold ~30 claimants — is missing, and it generalizes the topic beyond one group (also covers Elijah Muhammad's claim in the NOI topic, which currently cites only Quran 33:40).
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Abu Dawud 39:43 'thirty Dajjals, everyone presuming himself an apostle of Allah'; Bukhari 61:116 near-thirty liars before the Hour; Bukhari 60:122 'no prophet after me' already cited on page)

**13. ⚪ LOW · Glossary of recurring technical terms — aqeedah, manhaj, bid'ah, takfir, kalam, ta'wil, ta'til, Salaf, ijma', ghuluww**
   - Where: Accordion at the bottom of the Overview tab (shared Accordion component exists in packages/ui)
   - Why: The topic cards use these terms with inline parentheticals inconsistently; a parent or new Muslim reading any single tab hits 5+ untranslated terms with no single place to look them up.
   - Size: sub-tab · Kind: structural
   - Sourcing: scholarly-summary-generic (definitions, no citations needed)

**14. ⚪ LOW · Timeline of when the sects emerged — Saqifah (11 AH) to Siffin/Khawarij (37 AH) to Karbala (61 AH) to Mu'tazilah (2nd c.) to Ash'ari/Maturidi (4th c.) to Ahmadiyyah (1889) and NOI (1930)**
   - Where: Visual/list card in the Overview tab, each era linking to its ?tab=&sub= deep link (the page already supports them)
   - Why: A teacher or parent needs the chronological skeleton to present this subject in order; the page's facts are all present but scattered across three tabs with no unified sequence.
   - Size: points (2-4 bullets) · Kind: structural
   - Sourcing: scholarly-summary-generic (dates already present in existing topic text; Tarikh at-Tabari / Al-Bidayah wan-Nihayah already in source lists)

---

### /learn-arabic — 13 proposals (6 high)

_Current coverage: Seven tabs: The Alphabet (28 letters with name, sound description, 4 positional forms, one example word each, browser TTS); Vowels & Marks (8 diacritics incl. 3 tanwin + 3 long vowels); Quranic Vocabulary (8 categories, ~94 words: names of Allah, worship, faith, hereafter, Quranic terms, people, nature, common verbs); Basic Grammar (8 topics: RTL, gender, al-, pronouns, sentence types, past tense, root system, attached pronouns); Essential Phrases (4 categories, 29 phrases with usage notes); Numbers (0-10, tens to 50, 100, 1000); Learning Tips (8 tips + resource list). All content is inline in the page file; no imported data files. It teaches recognition well but stops before actual reading fluency, tajwid, or the highest-frequency Quran words (particles)._

**1. 🔴 HIGH · Why learn Quranic Arabic — the virtues, with daleel**
   - Where: New intro card at the top of the 'Learning Tips' tab (or a 'Why Learn?' card above the tips list); the strongest 1-2 narrations could also surface as a card on the Alphabet tab landing
   - Why: Practicing Muslims and new Muslims both want the motivation grounded in texts, and the tradition's most famous Quran-learning narrations are entirely absent from a page about learning the Quran's language.
   - Size: topic (a rail entry) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 66:49 'best among you are those who learn the Qur'an and teach it'; Muslim 6:290 'proficient reciter with the noble angels... one who falters gets two rewards'; Muslim 6:302 'Recite the Qur'an, for on the Day of Resurrection it will come as an intercessor'; Tirmidhi 45:36 'whoever recites a letter gets a hasanah... Alif-Lam-Mim is three letters'; Quran 12:2 & 43:3 'an Arabic Qur'an so that you may understand'; Quran 54:17 'We have made the Qur'an easy... to remember')

**2. 🔴 HIGH · Beyond the 28 letters — hamza, ta marbutah, alif maqsurah, and other special forms**
   - Where: Alphabet tab: second ContentCard below the letter grid, 'Special letters & forms', reusing the Letter detail layout
   - Why: A learner opening any surah immediately hits characters not in the grid — hamza ء and its seats (أ إ ؤ ئ), ta marbutah ة (in salah/zakah/jannah), alif maqsurah ى, lam-alif ligature لا, maddah آ, hamzat al-wasl ٱ, dagger alif ٰ (in Allah, Rahman) — and this page currently never explains them.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: scholarly-summary-generic (orthographic facts; example words like ٱلصَّلَوٰة can be copied programmatically from packages/content/quran/verses per the byte-identity gotcha)

**3. 🔴 HIGH · Symbols you'll see in the mushaf — waqf (stop) signs and markers**
   - Where: Vowels & Marks tab: third ContentCard after 'Long Vowels' — table of مـ (compulsory stop), لا (do not stop), ج (permissible), صلى (continuing preferred), قلى (stopping preferred), س/سكتة (brief pause), ∴∴ (mu'anaqah pair), ۩ (sajdah), ۞ (rub' al-hizb), plus superscript alif and small madd
   - Why: Every new Muslim who opens a physical or digital mushaf sees these signs on the first page and has nowhere in the app that decodes them.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: scholarly-summary-generic (standard Hafs mushaf conventions; no hadith citation needed)

**4. 🔴 HIGH · Tajwid essentials — actual rules, not just a mention**
   - Where: Own page (/tajwid) — page-sized subject and this page is already at 7 top tabs (over the house max of 6); cross-link from Learning Tips tip #6 and from the Quran reader. Content: makharij overview, heavy vs light letters, nun sakinah/tanwin rules (izhar, idgham, iqlab, ikhfa), meem sakinah rules, qalqalah, madd types with beat-counts, ghunnah, common beginner mistakes, 'find a teacher' guidance
   - Why: Tip #6 name-drops six tajwid rule categories but the app teaches none of them — the single most-requested next step for anyone who finishes the alphabet and marks tabs.
   - Size: own-page · Kind: new-subtopic
   - Sourcing: local-verified for framing texts (Quran 73:4 'recite the Qur'an at a measured pace [tartil]'; Muslim 6:290 proficient-reciter reward); the rules themselves are scholarly-summary-generic standard tajwid pedagogy

**5. 🔴 HIGH · Particles & small words — the true highest-frequency Quran vocabulary**
   - Where: Vocabulary tab: new category in the rail ('Particles & Connectors', ~22-25 entries): min, fi, 'ala, ila, 'an, 'inda, ma'a, bi, li, wa, fa, thumma, aw, inna/anna, lā, mā, lam, lan, illā, alladhī/allatī, hādhā/dhālika, kull, ba'd, qad, in/idhā, yā (vocative)
   - Why: Tip #3 promises '300 words = 70-80% of the Quran' but the vocabulary tab omits the particles that make up roughly 40% of Quran word tokens — the fastest real win for a learner following along in the reader.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: scholarly-summary-generic (frequency claims from the Quranic corpus; example verses can be grounded via packages/content/quran/words/ word-by-word data which exists locally)

**6. 🔴 HIGH · Your first reading practice — joining letters, then decoding Al-Fatihah**
   - Where: Alphabet tab: 'Put it together' card after the letter detail (Qaidah-style progression: ب+ي+ت → بيت, consonant+vowel drills), ending with a guided word-by-word decode of Al-Fatihah and Al-Ikhlas that links to the Quran reader's word-by-word mode
   - Why: The page teaches isolated letters and marks but never bridges to actually reading a word or verse — the exact wall where self-learners quit.
   - Size: sub-tab · Kind: practical-guide
   - Sourcing: local-verified (packages/content/quran/verses/1.json and 112.json plus packages/content/quran/words/ word-by-word data provide all practice text; copy Arabic programmatically)

**7. 🟡 MED · Grammar rail expansion: present/future tense, imperative, idafah, negation, inna & sisters, plurals/duals**
   - Where: Grammar tab: 5-6 new GrammarTopic entries in the existing rail — (1) present & future (yaktubu, sa-/sawfa), (2) commands & prohibitions (qul!, lā + jussive), (3) idafah possession (Rabbi l-'ālamīn, Yawmi d-dīn — both in Al-Fatihah), (4) negation particles (mā/lā/lam/lan), (5) inna and its sisters, (6) plurals (sound m/f + broken) and duals (the refrain 'rabbikumā' in Ar-Rahman is dual)
   - Why: The current 8 topics cover past tense only and skip constructions a reader meets in the very first surah (idafah appears twice in Al-Fatihah); without present tense and negation the grammar tab can't parse most verses.
   - Size: topic (a rail entry) · Kind: deepen-existing
   - Sourcing: local-verified for examples (Quran 1:2, 1:4 idafah; 55:13 dual rabbikumā; all in packages/content/quran/verses); the grammar itself is scholarly-summary-generic

**8. 🟡 MED · Numbers tab completion: 11-19, 60-90, ordinals, days of the week, Islamic months**
   - Where: Numbers tab: extend the grid with 11-19 and 60/70/80/90; add two new cards — 'Ordinals' (awwal, thānī, thālith... needed for 'the first surah', 'juz 2') and 'Days & Months' (yawm al-jumu'ah etc., the 12 hijri months with a cross-link to /islamic-calendar)
   - Why: A family actually uses day names and hijri month names weekly; the current jump from 10 to 20 and absence of 11-19 leaves the most-used numbers untaught.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified for the months framing (Quran 9:36 'the number of months with Allah is twelve'); the number words themselves are scholarly-summary-generic language content

**9. 🟡 MED · Phrases: add the reward daleel and the missing everyday exchanges (sneezing, visiting the sick, farewell)**
   - Where: Phrases tab: (a) add a 'why it's rewarding' note field to key dhikr phrases (SubhanAllah wa bihamdih = 'two words light on the tongue'); (b) extend 'Greetings & Social' or add a 'Responses & Etiquette' category: the three-step sneezing exchange (al-hamdu lillah → yarhamuk Allah → yahdikumullah), fi amanillah (farewell), lā ba'sa ṭahūrun in shā' Allāh (to the sick), full long-form salam response wa rahmatullahi wa barakatuh
   - Why: New Muslims get corrected socially on exactly these exchanges (especially the sneezing replies), and the phrases currently carry no daleel for the practicing reader.
   - Size: topic (a rail entry) · Kind: missing-narrations
   - Sourcing: local-verified (Muslim 48:41 'two expressions light on the tongue'; Bukhari 78:248 'if anyone of you sneezes he should say Al-Hamdulillah and his brother should say...'; Muslim 6:288 citron simile for the reciter, usable on the recitation phrases)

**10. 🟡 MED · Sound pairs that change meaning — pronunciation pitfalls**
   - Where: Alphabet tab: card 'Easily confused sounds' with minimal pairs: ق/ك (qalb 'heart' vs kalb 'dog'), ح/ه, س/ص, ت/ط, ذ/ز/ظ, ع/ء, each with a listen button reusing SpeakButton
   - Why: The classic qalb/kalb example shows learners why emphatic letters matter for meaning (including in recitation), and it turns the passive letter grid into corrective practice.
   - Size: points (2-4 bullets) · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (standard Arabic-pedagogy minimal pairs; no citation needed)

**11. 🟡 MED · Structural: page is at 7 top tabs (house max is 6) — fold Numbers into Vocabulary**
   - Where: Merge 'Numbers' as a category inside the Vocabulary tab's existing rail (it is vocabulary), freeing a tab slot for future 'Practice' content; alternatively adopt the shared SubTabLayout used by the IA-redesign pages so rails handle growth
   - Why: Every high-priority addition above competes for tab space; without consolidation the tab bar will overflow the house pattern further.
   - Size: tab · Kind: structural
   - Sourcing: scholarly-summary-generic (structural, no sourcing)

**12. ⚪ LOW · How letters are written — stroke direction and writing practice for parents/teachers**
   - Where: Alphabet tab: short card in the letter detail or a 'Writing the letters' card at bottom — stroke-order guidance, note that letters are written right-to-left and mostly on/above the baseline, tips for teaching kids; optional cross-link from /kids
   - Why: Parents teaching children (a core audience) need production guidance, not just recognition — currently there is zero writing content.
   - Size: points (2-4 bullets) · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (handwriting pedagogy; no citation needed)

**13. ⚪ LOW · Reading our transliteration — a one-card key to the diacritic scheme**
   - Where: Learning Tips tab (or a collapsible under PageSearch): explains ḥ vs h, ṣ/ḍ/ṭ/ẓ dots, ' vs ' (hamza vs 'ayn), ā/ī/ū macrons — the exact scheme this page and the Quran reader already use
   - Why: The page leans on academic transliteration everywhere but never tells the reader what the dots and macrons mean, so beginners silently mispronounce.
   - Size: points (2-4 bullets) · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (documenting the app's own convention)

---

### /muslim-daily — 14 proposals (5 high)

_Current coverage: Four tabs. Worship: a time-of-day timeline rail (Morning, Afternoon, Evening, Before Sleep, Midnight) covering waking sunnahs, the 5 prayers + Duha/Tahajjud/Witr, ~6 morning and ~5 evening adhkar cards, Quran time, Jumu'ah basics (ghusl, Al-Kahf, salawat), muhasabah, and suhoor. Sunnah Acts: a 6-entry rail (Eating & Drinking 6 cards, Greeting 3, Entering & Leaving 4, Dress & Appearance 3, Speech & Conduct 3, Sleeping 3). Reminders: 6-entry rail of Quran/hadith cards (Dunya 6, Death 4, Grave 2, Judgement 4, Paradise 6, Mercy 4). Daily Checklist: interactive streak/checklist tool (not content). Note: native app renders DailyScreen instead; this audit covers the shared web content._

**1. 🔴 HIGH · Complete the Morning & Evening adhkar sets (Bismillahilladhi la yadurru 3x, Radeetu billahi rabban 3x, Allahumma 'afini fi badani, A'udhu bikalimatillahi-t-tammat, morning tahlil with its 10-rewards virtue, Asbahna wa asbahal-mulku lillah)**
   - Where: Worship tab -> Morning rail (Morning Adhkar grid) and Evening rail (Evening Adhkar grid); 3-4 new AdhkarItem cards in each
   - Why: Any user following a standard Hisnul-Muslim-style adhkar routine will immediately notice these most-famous daily adhkar are missing from a page whose whole point is the daily routine.
   - Size: points (6-8 AdhkarItem cards across the two grids) · Kind: deepen-existing
   - Sourcing: local-verified (Ibn Majah 34:43 + Ahmad 'Musnad Ahmad 474' bismillah-no-harm; Abu Dawud 8:114 & 43:300 radeetu; Abu Dawud 43:318 & Tirmidhi 48:111 'afini fi badani; Abu Dawud 29:44-45 perfect-words; Abu Dawud 43:305 morning tahlil; Muslim 48:101 & Ibn Majah 34:42 asbahna/amsayna)

**2. 🔴 HIGH · Sneezing & Yawning etiquette — new Sunnah Acts subtopic (say Alhamdulillah, reply Yarhamukallah, why the Prophet answered one sneezer and not the other, cover the mouth when yawning)**
   - Where: New topic in the Sunnah Acts rail (7th entry, e.g. 'Sneezing & Yawning'); rail scrolls so a 7th entry fits the house pattern
   - Why: This is one of the first everyday-sunnah questions every new Muslim asks and it is completely absent from a page dedicated to daily sunnahs.
   - Size: topic (a rail entry, 4-5 cards) · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 78:248 what to say; Bukhari 78:245 the two sneezers; Bukhari 78:250 & 78:247 Allah loves sneezing/dislikes yawning; Abu Dawud 43:254 cover the mouth)

**3. 🔴 HIGH · Bathroom/toilet etiquette — dua entering (a'udhu bika minal-khubuthi wal-khaba'ith), 'Ghufranak' on leaving, not facing the qiblah, left-hand rule**
   - Where: Sunnah Acts -> Entering & Leaving (3-4 new cards), or fold into the same new rail entry as sneezing as 'Everyday Etiquette' if the founder prefers fewer rail entries
   - Why: It is the most frequently repeated daily dua situation of all, appears in every adhkar book, and Entering & Leaving currently covers only home and mosque.
   - Size: points (3-4 cards) · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 4:8 & 80:19 entering dua; Abu Dawud 1:30 'Ghufranak' on leaving; Abu Dawud 1:9 qiblah; Abu Dawud 1:31 left hand; Abu Dawud 1:6 jinn frequent the privies)

**4. 🔴 HIGH · Leaving-home dua ('Bismillah, tawakkaltu 'alallah…' — you are guided, defended, protected) to balance the entering-only coverage**
   - Where: Sunnah Acts -> Entering & Leaving rail (1-2 cards); also worth a one-line mention in Worship -> Morning timeline
   - Why: The rail is literally named 'Entering & Leaving' but contains no leaving dua, which users notice immediately.
   - Size: points (1-2 cards) · Kind: missing-narrations
   - Sourcing: local-verified (Abu Dawud 43:323 leaving-home dua with the 'guided, defended, protected' promise). A leaving-the-mosque dua variant ('as'aluka min fadlik') was NOT found locally — verify before adding that one.

**5. 🔴 HIGH · Eating & Drinking deepened: dua after eating with its forgiveness promise, the Prophet never criticized food, eat together for blessing, stomach-thirds moderation, drinking in three breaths**
   - Where: Sunnah Acts -> Eating & Drinking (5 new cards alongside the existing 6)
   - Why: The current cards cover before/during a meal but stop before the after-meal dua — the single most-searched eating sunnah — and omit the most famous adab narrations.
   - Size: points (4-5 cards) · Kind: deepen-existing
   - Sourcing: local-verified (Abu Dawud 34:4 & Tirmidhi 48:89 dua after eating; Bukhari 70:37 & Muslim 36:254 never criticized food; Ibn Majah 29:37 & Abu Dawud 28:29 eat together; Tirmidhi 36:77 stomach thirds; Bukhari 74:57 three breaths)

**6. 🟡 MED · Before Sleep / Sleeping deepened: bad-dream etiquette (spit left 3x, seek refuge, tell no one), sleeping on the stomach discouraged, the answered dua of one who wakes at night, Surah Al-Kafirun before sleep**
   - Where: Split: bad dreams + waking-at-night dhikr as new cards in Worship -> Before Sleep timeline; stomach-sleeping + Kafirun in Sunnah Acts -> Sleeping
   - Why: Bad dreams are a top practical question for new Muslims, and the waking-at-night dua (Bukhari) is a beloved, famous virtue currently absent.
   - Size: points (4-5 cards across two rails) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 91:5 bad dream; Abu Dawud 43:268 'a manner of lying Allah hates'; Bukhari 19:35 whoever wakes at night and says la ilaha illallah… his dua is answered; Ibn Majah 34:55 sleeping in purity; Abu Dawud 43:283 Kafirun then sleep — disavowal of shirk)

**7. 🟡 MED · Speech & Conduct deepened: 'Do not become angry' plus the sit-down-when-angry sunnah, smiling is charity, and the Mu'adh 'harvests of their tongues' hadith**
   - Where: Sunnah Acts -> Speech & Conduct (3 new cards next to the existing 3)
   - Why: Anger control is the most-cited practical conduct sunnah and the current subtopic has only 3 cards where the tradition is rich.
   - Size: points (3-4 cards) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 78:143 'Do not become angry'; Abu Dawud 43:10 sit down when angry; Tirmidhi 27:62 smiling is charity; Tirmidhi 40:11 & Ibn Majah 36:48 Mu'adh tongue hadith)

**8. 🟡 MED · Greeting deepened: 'spread salam and you will love one another' paradise hadith, handshake wipes away sins, and the six rights of a Muslim upon a Muslim**
   - Where: Sunnah Acts -> Greeting (3 new cards next to the existing 3)
   - Why: The famous salam-love-paradise narration is the anchor text of this whole topic and is missing.
   - Size: points (3-4 cards) · Kind: deepen-existing
   - Sourcing: local-verified (Abu Dawud 43:421 & Ibn Majah 0:68 spread salam; Abu Dawud 43:439-440 handshake forgiveness; Bukhari 79:37 companions shook hands; Tirmidhi 43:1 six courtesies; Bukhari 23:4 five rights). The graded 10/20/30-rewards salam hadith was NOT found locally — treat as needs-external-source if wanted.

**9. 🟡 MED · Reminders -> The Grave is thin (2 cards): add the two-angels questioning, the three deeds that continue after death, and 'visit the graves, they remind you of the Hereafter'**
   - Where: Reminders tab -> Grave rail entry (3 new ReminderCards)
   - Why: At 2 cards it is visibly the thinnest reminders subtopic, and sadaqah-jariyah is among the most famous hadith in the language.
   - Size: points (3 cards) · Kind: deepen-existing
   - Sourcing: local-verified (Tirmidhi 10:107 two angels questioning; Nasai 30:41 deeds end except three; Ibn Majah 0:241 best things left behind; Ibn Majah 6:137 & Abu Dawud 21:147 visiting graves)

**10. 🟡 MED · Jumu'ah step deepened: the hour on Friday when dua is answered, plus a cross-link to the dedicated Jumu'ah guide at /salah?tab=prayers&sub=jumuah**
   - Where: Worship tab -> Afternoon rail -> 'Jumu'ah Sunnahs' TimelineStep (1 new list item + link)
   - Why: The Friday hour of acceptance is the most actionable Friday virtue and the page currently omits it while the dedicated Jumu'ah page exists un-linked.
   - Size: points (1-2 bullets + cross-link) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 11:59 & Abu Dawud 2:659 the Friday hour)

**11. 🟡 MED · Visiting the sick and daily social duties: 70,000 angels seek forgiveness for the visitor, walking in the harvest of Paradise, the 7x dua for the sick, the Prophet's seven commands**
   - Where: New topic in the Sunnah Acts rail (e.g. 'With Others' / 'Community'), or merge with the Greeting expansion if rail length is a concern
   - Why: Visiting the sick is a canonical daily-life sunnah (listed among the rights of a Muslim) with zero presence on the page.
   - Size: topic (a rail entry, 4 cards) · Kind: new-subtopic
   - Sourcing: local-verified (Abu Dawud 21:10 seventy thousand angels; Ibn Majah 6:10 harvests of Paradise; Abu Dawud 21:18 dua for the sick 7x; Bukhari 77:66 seven commands incl. visiting the sick)

**12. 🟡 MED · Midnight deepened: the Prophet prayed until his feet swelled ('should I not be a grateful servant?') plus a short practical 'how to actually wake for Tahajjud' guide (sleep early on wudu, start with 2 light rak'ahs)**
   - Where: Worship tab -> Midnight rail (1 narration card + 1 practical-tips card in the Tahajjud step)
   - Why: The feet-swelling narration is the emotional centerpiece of night prayer, and beginners need a realistic on-ramp rather than only virtues.
   - Size: points (2 cards) · Kind: practical-guide
   - Sourcing: local-verified (Muslim 52:77, Tirmidhi 2:265, Nasai 20:47 feet swelled). Practical tips are scholarly-summary-generic — write without invented citations.

**13. ⚪ LOW · Quran in the home: 'Do not turn your houses into graves — Shaytan flees the house where Al-Baqarah is recited'**
   - Where: Worship tab -> Evening rail -> Family Time step (1 card, with link to /quran/2)
   - Why: A famous, family-oriented narration that turns the Family Time step from generic advice into a concrete nightly practice.
   - Size: points (1 card) · Kind: missing-narrations
   - Sourcing: local-verified (Muslim 6:252; Tirmidhi 45:3)

**14. ⚪ LOW · Dress & Appearance: dua when putting on a (new) garment — Umar's 'Alhamdulillah who clothed me…' and the Prophet naming the garment**
   - Where: Sunnah Acts -> Dress & Appearance (1-2 cards next to the existing 3)
   - Why: A daily-frequency dua users expect under a 'Dress' heading that currently covers only right-side, miswak, and fitrah.
   - Size: points (1-2 cards) · Kind: missing-narrations
   - Sourcing: local-verified (Abu Dawud 34:1 new garment named; Tirmidhi 48:191 & Ibn Majah 32:8 Umar's garment dua)

---

### /day-of-judgement — 11 proposals (5 high)

_Current coverage: Five tabs, all content inline in the page file: (1) 'What is Yawm al-Qiyamah?' intro prose with names of the Day; (2) 'Why It Matters' — 6 numbered points; (3) 'Signs of the Hour' rail — Minor Signs (8 points) and Major Signs (9 points incl. Mahdi, Dajjal, descent of 'Isa, Ya'juj/Ma'juj, sun from the west); (4) 'Events of the Day' rail — Trumpet, Resurrection, Gathering & Standing, Reckoning, Scale, Bridge; (5) 'Salvation' rail — Intercession, Hawd, al-Kawthar. Adjacent routes /barzakh (grave/questioning) and /jannah (Paradise & Hellfire) already exist, so this page correctly owns only the Day itself. Coverage of what exists is solid and well-cited; the biggest holes are the settling of scores between people, any practical 'what do I do about this' guidance, and Dajjal protection._

**1. 🔴 HIGH · The Settling of Scores (Qisas) — the bankrupt (muflis) hadith and rights restored between people**
   - Where: New topic in the Events rail, between 'The Reckoning' and 'The Scale (al-Mizan)'
   - Why: The muflis hadith is one of the most-quoted narrations about the Day and the entire theme of interpersonal rights (huquq al-'ibad) — arguably the Day's most practically consequential aspect — is absent from the page.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 45:77 muflis/bankrupt; Muslim 45:78 & Tirmidhi 37:6 hornless sheep claims from the horned; Bukhari 81:122 & Muslim 28:40 first cases decided are bloodshed; Bukhari 81:124 qantarah bridge between Paradise and Hell where believers settle wrongs; Bukhari 58:28, 78:201, 90:13 a flag raised for every betrayer)

**2. 🔴 HIGH · Preparing for the Day — practical deeds tab**
   - Where: New 6th top tab 'Preparing for the Day' (page currently has 5 of the max 6)
   - Why: The page describes the Day in detail but never answers the new Muslim's obvious question — 'so what should I do?'; a deeds-focused tab converts fear into action and completes the page's arc.
   - Size: tab · Kind: practical-guide
   - Sourcing: local-verified (Muslim 6:302 'Recite the Quran, for on the Day of Resurrection it will come as an intercessor'; Tirmidhi 3:32 closest to the Prophet = most salawat; Tirmidhi 47:385 whoever wishes to see the Day as with his own eye, recite Surah at-Takwir — pairs with Surahs 81/82/84 in packages/content/quran/verses; Muslim 5:161 & 5:169 the tashahhud du'a of refuge from the four trials; cross-link the existing Scale points on dhikr/character and the Seven Shaded)

**3. 🔴 HIGH · The Dajjal — his trial and how to be protected**
   - Where: New topic in the Signs rail after 'Major Signs' (Dajjal is currently one paragraph inside Major Signs)
   - Why: The Prophet called it the greatest trial since Adam and gave specific protective actions; users looking up the Dajjal expect the forty-days timeline, where he cannot enter, and the Kahf/du'a protections — none are on the page.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 54:134 forty days — one like a year, one like a month, one like a week — and reciting the opening of al-Kahf over him; Muslim 6:311 & Abu Dawud 39:31 memorizing the first ten verses of Surah al-Kahf protects from him; Bukhari 76:46, 92:71, 92:72 he cannot enter Madinah, which will shake out the hypocrites; Muslim 5:161, 5:169 seeking refuge from his trial in prayer)

**4. 🔴 HIGH · Deepen 'The Reckoning' — salah judged first, the first three people judged, and being asked about life's pleasures**
   - Where: 3 new points inside the existing 'reckoning' topic in the Events rail
   - Why: These are among the most famous reckoning narrations — 'the first deed a servant is called to account for is his salah' and the martyr/scholar/generous-man hadith on sincerity — and practicing Muslims will notice their absence immediately.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Tirmidhi 2:266, Abu Dawud 2:474, Nasai 37:26 salah is the first deed reckoned; Muslim 33:218 the first man judged is a martyr, then a reciter/scholar, then a generous man — each condemned for doing it to be seen; Quran 102:8 'you will surely be asked that Day about your worldly pleasures')

**5. 🔴 HIGH · Deepen 'Minor Signs' — Euphrates uncovering a mountain of gold, ~30 false prophets, wishing to be in the grave, conquest of Constantinople**
   - Where: 4 new points appended to the existing 'minor-signs' topic in the Signs rail
   - Why: Eschatology is the page's biggest draw and these four are staple, frequently-searched signs (the Euphrates-gold hadith especially) that anyone comparing with a signs-of-the-Hour lecture will expect.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 92:66 & Muslim 54:38, 54:40 the Euphrates discloses a mountain of gold, 'whoever is present should not take any of it'; Bukhari 61:116, 92:68 & Abu Dawud 37:13 about thirty liars each claiming to be Allah's messenger; Bukhari 92:62 a man passes a grave and says 'would that I were in his place'; Muslim 54:44 the conquest of Constantinople before the Dajjal emerges)

**6. 🟡 MED · The Final Separation — Hell brought forth with 70,000 bridles, believers seeing their Lord, and Death slaughtered as a ram**
   - Where: New topic at the end of the Events rail, after 'The Bridge (as-Sirat)'
   - Why: The Events rail currently ends at the Bridge with no closure; these vivid, authentic scenes complete the sequence and the 'Death is slaughtered' hadith is one of the most memorable in the tradition (and very teachable to children).
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 53:33 & Tirmidhi 39:1 Hell brought forth with seventy thousand bridles, each pulled by seventy thousand angels; Bukhari 97:61, 97:63, 65:372 'you will see your Lord as you see this full moon'; Bukhari 65:252 & 81:137 Death brought as a black-and-white ram and slaughtered between Paradise and Hell — 'eternity, no more death')

**7. 🟡 MED · Deepen 'The Intercession' — intercession for those who committed major sins, and the Quran as intercessor**
   - Where: 2 new points inside the existing 'intercession' topic in the Salvation rail
   - Why: The topic covers the mechanics of the Great Intercession but omits the hope-giving narration most relevant to a struggling believer — that the Prophet's intercession is specifically for the major sinners of his ummah.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Tirmidhi 37:21, 37:22 & Abu Dawud 42:144 'My intercession is for the people of my Ummah who committed major sins'; Muslim 6:302 the Quran comes as an intercessor for its companions)

**8. 🟡 MED · Deepen 'The Gathering & Standing' — people gathered in three groups: walking, riding, and dragged on their faces**
   - Where: 1 new point inside the existing 'gathering' topic in the Events rail
   - Why: It is the classic description of how people arrive at the gathering according to their deeds and pairs naturally with the sun-brought-close and sweat imagery already present.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Tirmidhi 47:194 'People will be gathered in three classes: walking, riding, and upon their faces'; Tirmidhi 47:195 & 37:10 variants)

**9. 🟡 MED · Common questions (FAQ) — children, people who never heard the message, recognizing family on that Day, why no one knows the Hour**
   - Where: Accordion section (shared Accordion component from packages/ui) at the bottom of the 'What is Yawm al-Qiyamah?' intro tab
   - Why: These are the first questions new Muslims and parents actually ask about the Day, and the current intro tab answers none of them.
   - Size: topic (a rail entry) · Kind: practical-guide
   - Sourcing: scholarly-summary-generic for the children/ahl-al-fatrah rulings (frame as mainstream scholarly positions, no invented isnads); Quran anchors are local (Quran 17:15 'We never punish until We have sent a messenger'; Quran 80:34-37 a man flees from his brother, mother, father, wife and children; Quran 7:187 knowledge of the Hour is with Allah alone; Quran 6:158 belief no longer benefits — already cited on the page)

**10. 🟡 MED · Ordered timeline card — the sequence of the Day at a glance**
   - Where: Structural: an intro/timeline card at the top of the 'Events of the Day' tab (Trumpet → Resurrection → Gathering → Intercession begins → Reckoning → Scale → Bridge → Hawd → final abode), each step linking to its rail topic
   - Why: The rail presents events as parallel pills so readers (especially kids/teachers) never see the chronological order, which is the single most useful mental model for this subject; reuses only refs already on the page.
   - Size: points (2-4 bullets) · Kind: structural
   - Sourcing: local-verified (reuses existing page citations: Quran 39:68; Muslim 54:175; Bukhari 65:234; Muslim 1:102 — no new sourcing needed)

**11. ⚪ LOW · Cross-links to the neighboring stages: /barzakh (before the Day) and /jannah (after the Day)**
   - Where: One short 'journey so far / journey ahead' link row in the intro tab, mirroring how Hereafter pages were de-orphaned elsewhere
   - Why: The three pages form one chronological journey (grave → Day → final abode) but nothing on this page tells the reader the other two stages exist.
   - Size: points (2-4 bullets) · Kind: structural
   - Sourcing: local-verified (navigation only — routes /barzakh and /jannah confirmed to exist in apps/web/src/app)

---

### /duas — 14 proposals (5 high)

_Current coverage: A single self-contained page (no SubTabLayout) with a category landing grid of 14 categories (Most Powerful, Morning & Evening, Prayer, Sleep, Eating & Drinking, Travel, Home & Mosque, Protection, Forgiveness, Distress & Anxiety, Illness & Healing, Parents & Family, Guidance & Knowledge, Rain & Weather) over ~55 hardcoded dua cards, each with Arabic, transliteration, translation, source, when/repeat, and optional virtue. Global search, bookmarks with stable slug ids, and a 'Most Powerful' explainer card. Coverage of the daily-rhythm adhkar (morning/evening, sleep, eating, home) is solid; the gaps are in-prayer essentials, dua pedagogy, and life-moment categories (Ramadan, death, social etiquette, marriage)._

**1. 🔴 HIGH · In-prayer essentials: Tashahhud (at-tahiyyat), Salawat Ibrahimiyyah, tasbih of ruku/sujud, and 'make dua in sujud'**
   - Where: Prayer category — 3-4 new dua cards alongside the existing opening dua / between-prostrations / before-salam cards, completing the inside-the-prayer sequence
   - Why: A new Muslim literally cannot pray without the tashahhud and salawat, yet the Prayer category skips from the opening supplication straight to the pre-salam refuge; salawat on the Prophet is also absent from the entire page.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 10:225 tashahhud; Bukhari 60:43 and 60:44 salawat Ibrahimiyyah; Muslim 4:245 'the nearest a servant comes to his Lord is when he is prostrating, so make supplication')

**2. 🔴 HIGH · Rabbana atina fid-dunya hasanah — the Prophet's most frequent dua (Quran 2:201)**
   - Where: New card tagged powerful + guidance (or a general category); belongs in Most Powerful given the explicit 'most frequent invocation' narration
   - Why: Arguably the single most famous dua in the Quran and explicitly the Prophet's most-repeated supplication — every practicing Muslim will notice its absence.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 80:84 'The most frequent invocation of the Prophet was: O Allah! Give to us in the world that which is good...'; Quran 2:201)

**3. 🔴 HIGH · 'How dua works' guide — etiquette of supplication and the times when dua is accepted**
   - Where: New category ('Making Dua' / 'How Dua Is Answered') rendered as an explainer card plus 3-4 cards, in the style of the existing Most Powerful explainer; or an intro card on the landing grid
   - Why: The page is a list with zero pedagogy — new Muslims don't know to praise Allah first, send salawat, avoid hastening, or that the last third of the night / between adhan-iqamah / in sujud / while fasting are golden windows.
   - Size: topic (a rail entry) · Kind: practical-guide
   - Sourcing: local-verified (Bukhari 80:37 'granted if he does not show impatience'; Bukhari 80:18 Allah descends in the last third of the night; Abu Dawud 2:131 'supplication between the adhan and the iqamah is not rejected'; Muslim 4:245 sujud; Muslim 12:83 halal earnings — 'Allah is Good and accepts only that which is good... how can his supplication be accepted')

**4. 🔴 HIGH · Wudu duas — bismillah before, and the shahada + 'make me of those who repent' after**
   - Where: Home & Mosque category (rename to 'Home, Mosque & Wudu') or 1-2 cards cross-linked from /salah?tab=wudu
   - Why: The post-wudu dua carries the famous 'eight gates of Paradise opened' promise and is among the first duas every new Muslim is taught; purification currently has no dua at all on this page.
   - Size: points (2-4 bullets) · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 2:20 — Uqba b. Amir, whoever performs wudu well then testifies, the eight gates of Paradise are opened)

**5. 🔴 HIGH · Everyday social etiquette duas: sneezing exchange, when angry, seeing someone afflicted, wearing new clothes, sighting the new moon**
   - Where: New category 'Everyday & Social' in the landing grid (5 cards)
   - Why: The sneezing response (yarhamuk-Allah) and the anger remedy are among the most common real-life dua needs — parents teaching children will look for these first.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 78:248 sneezing; Bukhari 59:91 two men abused each other — 'I seek refuge with Allah from Satan'; Tirmidhi 48:62 and 48:63 seeing an afflicted person; Abu Dawud 34:1 new garment; Tirmidhi 48:82 crescent moon)

**6. 🟡 MED · Ramadan & Laylat al-Qadr duas — 'Allahumma innaka Afuwwun tuhibbul-afwa fa'fu anni' and companions**
   - Where: New 'Ramadan & Fasting' category (move the existing iftar dua into it, add Laylat al-Qadr dua and dua for the host who feeds a fasting person)
   - Why: Every Ramadan users search for the Laylat al-Qadr dua taught to Aisha; the page currently has only the iftar dua buried under Eating & Drinking.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Tirmidhi 48:144 and Ibn Majah 34:24 — Aisha: 'what should I say on Laylatul-Qadr?')

**7. 🟡 MED · Complete the adhan sequence: repeat after the muadhin, and dua between adhan and iqamah**
   - Where: Prayer category — 1-2 cards next to the existing 'After the Adhan' card
   - Why: The page has the wasilah dua but not the two adjacent sunnahs that frame it, which are taught together in every adhkar book.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Muslim 4:12 'repeat what the Mu'adhdhin pronounces'; Abu Dawud 2:131 dua between adhan and iqamah not rejected)

**8. 🟡 MED · Qunut al-Witr — 'Allahummahdini fiman hadayt'**
   - Where: Prayer category, one card noting it is said in witr
   - Why: The standard nightly witr supplication taught by the Prophet to his grandson al-Hasan; anyone praying witr regularly will look for it.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Abu Dawud 8:10; Tirmidhi 3:12 — al-Hasan bin Ali, words to say during al-Witr)

**9. 🟡 MED · Grief, funerals, and visiting graves: janazah dua for the deceased and the graveyard greeting**
   - Where: New 'Death & Loss' category (2-3 cards: janazah dua, graveyard visit dua, plus the existing calamity dua cross-tagged), cross-linked to /death-rites
   - Why: Bereavement is when many users reach for the app most urgently; the only related card today is the general calamity dua.
   - Size: topic (a rail entry) · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 11:109 'O Allah! forgive him, have mercy upon him...'; Muslim 11:132 and 11:133 — what the Prophet taught for visiting the graveyard)

**10. 🟡 MED · Dua before marital intimacy — 'Bismillah, Allahumma jannibnash-shaytan...'**
   - Where: Parents & Family category, one card next to the wedding dua (tone matching the existing married-life tab)
   - Why: An authentic, universally taught dua for married couples with an explicit protection promise for the child; the app already has a married-life section so the audience is served elsewhere but not here.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 4:7; Bukhari 59:81 — 'In the name of Allah. O Allah! Protect us from Satan and prevent Satan from approaching our offspring')

**11. 🟡 MED · Debt relief dua — 'O Allah, suffice me with Your lawful against Your unlawful'**
   - Where: Distress & Anxiety category, one card complementing the existing 'Refuge from Worry and Grief' (which only seeks refuge from debt, without the positive dua)
   - Why: Financial hardship is one of the most common reasons people search for a specific dua, and the narration carries the striking 'debt like Mount Sir' promise.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Tirmidhi 48:194 — Ali teaching the mukatib the words the Prophet taught him)

**12. 🟡 MED · The famous grief dua — 'O Allah, I am Your servant, son of Your servant... make the Quran the spring of my heart'**
   - Where: Distress & Anxiety category, one card
   - Why: One of the best-known distress narrations ('no one says it except Allah removes his grief'), widely requested; users who know Hisnul Muslim will expect it.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: needs-external-source (Musnad Ahmad 3712 / Ibn Mas'ud — searched the local ahmad corpus (8 books present) and it is not there; do not ship without verifying against a full Musnad source)

**13. ⚪ LOW · Asking for rain and asking it to stop — istisqa duas**
   - Where: Rain & Weather category (currently only 3 duas): 'Allahumma aghithna' and 'around us, not upon us' from the famine narration
   - Why: Completes the weather set with two very famous supplications from a single vivid Bukhari story (the bedouin at jumu'ah).
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 15:28 — contains both the request for rain and 'around us and not upon us')

**14. ⚪ LOW · Structural: group the growing landing grid into sections**
   - Where: Landing grid — with 14 categories today and 4-5 proposed, group cards under three headers: Daily Rhythm (morning/evening, prayer, sleep, eating, home), Life Moments (travel, Ramadan, family, death, social), Heart & Hardship (protection, forgiveness, distress, illness, guidance)
   - Why: A flat 18-19 item grid becomes hard to scan on mobile; sectioning keeps the one-page pattern while restoring findability.
   - Size: sub-tab · Kind: structural
   - Sourcing: scholarly-summary-generic

---

### /prophet-muhammad — 14 proposals (4 high)

_Current coverage: Six tabs, all content inline in the page file (no external data imports). Timeline: 27 events in 3 era groups (Before Prophethood / Makkah / Madinah) from birth 570 CE to his passing, incl. Farewell Sermon full text. Character & Virtues: 17 virtues each with narrative + hadith. His Person: 15 names/titles accordion + 15 shama'il traits across Face/Body/Manner rails. Family & Companions: 12 wives (incl. Mariyah with umm-walad nuance), 7 children, 17 companions. Prophecies: 11 fulfilled/ongoing entries. Worship & Sunnah: 8 aspects of his worship + 7 daily-sunnah categories (~31 practices)._

**1. 🔴 HIGH · Miracles of the Prophet ﷺ — splitting of the moon, water from his fingers, food multiplication at the Trench, the weeping tree trunk, the Quran as the enduring miracle**
   - Where: Prophecies tab: rename to 'Miracles & Prophecies' and use the existing GroupedRail pattern (as Worship & Sunnah does) with a 'Miracles' group above the 'Prophecies' group. No new top tab needed (page is at the 6-tab max).
   - Why: Miracles are among the first things every reader type looks for on a Prophet page — the page covers prophecies (future miracles) but presents zero sensory miracles besides those buried inside timeline events.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 61:140-142 moon split; Bukhari 4:35 & 61:81 water from his fingers; Bukhari 64:145-146 Trench food/rock; Bukhari 11:42 & 61:92 weeping trunk; Quran 17:88 inimitability of the Quran)

**2. 🔴 HIGH · Salawat guide — what ﷺ means, the full Salat al-Ibrahimiyyah text (Arabic + English), why and when to send blessings**
   - Where: Worship & Sunnah tab: new third rail group 'Loving & Following Him' (GroupedRail already supports N groups); cross-link from the duas landing page.
   - Why: The page tells users to 'send salawat' (Daily Remembrance) but never teaches the actual wording or the command verse — the single most practical devotional act tied to this page for a new Muslim.
   - Size: topic · Kind: practical-guide
   - Sourcing: local-verified (Quran 33:56 command verse; Bukhari 60:43-44 and Muslim 4:70 the Ibrahimiyyah wording; Ibn Majah 5:283 increase salawat on Friday; Nasai 13:118 tenfold reward already on page)

**3. 🔴 HIGH · Loving the Prophet ﷺ and his rights over believers — faith requires loving him above all, following his Sunnah as proof of love, seeing him in dreams**
   - Where: Second rail item in the same new 'Loving & Following Him' group in Worship & Sunnah (pairs with the salawat guide).
   - Why: The page describes him thoroughly but never addresses the believer's relationship TO him — the devotional frame practicing Muslims expect and new Muslims need explained.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 2:7-2:8 'none of you believes till he loves me more than his father, children and all mankind'; Bukhari 91:12 'whoever sees me in a dream'; Quran 9:128 his concern for the believers)

**4. 🔴 HIGH · Missing pivotal timeline events: his shepherd youth, conversions of Hamzah & Umar (615-616), the Ifk slander incident (5-6 AH), letters to the kings (628), Battle of Mu'tah (629)**
   - Where: Timeline tab: ~5 new events slotted chronologically into the existing era groups (shepherd youth in Before Prophethood; Hamzah/Umar in Makkah; Ifk, letters, Mu'tah in Madinah).
   - Why: Anyone following the seerah will notice the jumps — Umar's conversion is a turning point, Mu'tah explains Khalid's 'Sword of Allah' title the Companions tab already cites, and the Ifk is a major event with a full surah passage revealed about it.
   - Size: topic · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 37:3 every prophet shepherded sheep; Tirmidhi 49:77 & Ibn Majah 0:105 dua for Umar's conversion; Bukhari 64:185 the long Ifk narration + Quran 24:11; Bukhari 1:7 Heraclius letter & Bukhari 64:446 Khosrau tore the letter; Bukhari 56:16 & 62:103 Mu'tah — Zayd, Ja'far, Ibn Rawahah martyred)

**5. 🟡 MED · His station on the Day of Judgment — first intercessor, master of the children of Adam, the Hawd (Basin), al-Maqam al-Mahmud**
   - Where: New rail entry under 'His Worship' group's tab or as a 'His Station' item in His Person; cross-link to the Hereafter page rather than duplicating end-times content.
   - Why: Mentioned only in passing under the name Al-Hashir; meeting him at the Hawd and his intercession are central to how Muslims relate to him and are frequently asked about.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 1:391 'I will be the first intercessor'; Muslim 43:3 pre-eminent among the descendants of Adam; Bukhari 61:104 'I am your predecessor at the Hawd'; Quran 17:79 Maqam Mahmud already cited on page)

**6. 🟡 MED · Khasa'is — 'I have been given five things given to no prophet before me' (earth a mosque, spoils lawful, victory by awe, intercession, sent to all mankind)**
   - Where: His Person tab: new accordion item at the end of Names & Titles (or intro card for that rail), since it defines what makes his prophethood unique.
   - Why: A famous, compact hadith that answers 'what makes Muhammad ﷺ different from earlier prophets' — a natural question for new Muslims and da'wah conversations.
   - Size: points (2-4 bullets) · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 7:2 and Bukhari 8:87, both Jabir's 'I have been given five things' narration)

**7. 🟡 MED · Missing major companions: Zayd ibn Harithah, Ja'far ibn Abi Talib, Abu Ubaydah ibn al-Jarrah, Mu'adh ibn Jabal, Sa'id ibn Zayd (completing the Ten), Anas ibn Malik**
   - Where: Family & Companions tab → Companions sub: 6 new cards in the existing list.
   - Why: Zayd is the only companion named in the Quran and the Prophet's adopted son (already referenced in Zaynab bint Jahsh's entry with no card of his own); the list names 'the ten promised Paradise' but includes only 8 of them.
   - Size: topic · Kind: deepen-existing
   - Sourcing: local-verified (Quran 33:37 Zayd named; Tirmidhi 49:216 Zayd/Usamah 'most beloved'; Bukhari 53:9 'you resemble me in appearance and character' to Ja'far + Bukhari 56:16 his martyrdom at Mu'tah; Bukhari 62:89-90 Abu Ubaydah 'the trustworthy man of this ummah'; Abu Dawud 8:107 & Nasai 13:125 'By Allah, I love you, Mu'adh'; Tirmidhi 49:144 the Ten listed)

**8. 🟡 MED · Women companions beyond Khadijah: Sumayyah (first martyr), Asma bint Abi Bakr, Umm Sulaym, Nusaybah bint Ka'b (Umm Ammarah) at Uhud**
   - Where: Family & Companions tab: either new cards in the Companions sub or a fourth 'Women Companions' sub in the familySubs rail.
   - Why: The Companions sub currently has one woman (Khadijah, duplicated from Wives) — a visible imbalance for a family/teacher audience, and Sumayyah is already named in the timeline with no profile.
   - Size: sub-tab · Kind: new-subtopic
   - Sourcing: local-verified (Ibn Majah 0:150 first seven to declare Islam publicly incl. Sumayyah; Bukhari 24:37 the Prophet's counsel to Asma; Muslim 43:115 Umm Sulaym already cited on page); Nusaybah's Uhud defense needs-external-source (seerah literature)

**9. 🟡 MED · Household & grandchildren: Hasan and Husayn, uncle Abbas, guardian Abu Talib, foster mother Halimah al-Sa'diyyah, Umm Ayman**
   - Where: Family & Companions tab: new 'Household' sub in the familySubs rail (or 'Grandchildren' section appended to the Children sub).
   - Why: Hasan and Husayn appear repeatedly in virtue anecdotes but have no profiles, and the guardianship chain (Halimah → Aminah → Abdul Muttalib → Abu Talib) that the timeline narrates has no reference cards.
   - Size: sub-tab · Kind: new-subtopic
   - Sourcing: local-verified for the anchors (Bukhari 61:133 'this son of mine is a sayyid... reconcile two great groups'; Bukhari 78:28 kissing Hasan already on page); Halimah/Umm Ayman detail is scholarly-summary-generic (Ibn Hisham, Ibn Sa'd)

**10. 🟡 MED · Prophecies rail additions: Islam reaching everywhere the earth was 'folded' for him, Ammar killed by the transgressing party, Hasan reconciling two Muslim armies, Uthman's trial foretold at the garden gate**
   - Where: Prophecies tab (or the Prophecies group after the miracles restructure): 4 new rail entries with the existing fulfilled/ongoing chips.
   - Why: The current 11 entries skew to end-times signs; these are the classic within-a-generation fulfillments practicing Muslims cite as daleel for his prophethood.
   - Size: topic · Kind: deepen-existing
   - Sourcing: local-verified (Abu Dawud 37:13 'Allah folded the earth for me... my ummah's dominion will reach it'; Tirmidhi 49:200 'Rejoice, Ammar, the transgressing party shall kill you'; Bukhari 61:133 Hasan reconciliation; Bukhari 95:16 garden-gate hadith foretelling Uthman's calamity)

**11. 🟡 MED · New Daily Sunnah categories: bathroom etiquette, dressing (new-clothes dua, right side first), sneezing & gathering etiquette, Duha and his voluntary-prayer day rhythm**
   - Where: Worship & Sunnah tab: 3-4 new categories in the dailySunnah array (each 3-5 practices), matching the existing category structure.
   - Why: The Daily Sunnah rail covers waking, eating, home, sleep and hygiene but skips other everyday moments a new Muslim actively searches for ('what do I say when...').
   - Size: topic · Kind: practical-guide
   - Sourcing: local-verified (Abu Dawud 1:4 & Nasai 1:19 dua entering the toilet; Abu Dawud 34:1 naming and dua for a new garment; Bukhari 77:66 the seven commands incl. responding to the sneezer; Bukhari 18:23 Umm Hani on his Duha prayer)

**12. 🟡 MED · Character tab: 'His character was the Quran' framing quote + a 'Cheerfulness & Humor' virtue entry**
   - Where: Character & Virtues tab: add Aisha's summary to the intro ContentCard beside Quran 68:4, and one new virtue in the rail (he joked but spoke only truth; playfulness with family and children).
   - Why: Aisha's one-line summary is the most famous description of his character and is absent; the humor entry humanizes him for teens/kids audiences without new structural work.
   - Size: topic · Kind: deepen-existing
   - Sourcing: local-verified for the framing quote (Muslim 6:168, the Sa'd ibn Hisham narration containing 'his character was the Quran'); the specific jest narrations (the she-camel joke, 'O two-eared one') needs-external-source (Tirmidhi Shama'il / Abu Dawud Adab — not in local corpus)

**13. ⚪ LOW · What he owned and what he left behind — armor mortgaged for barley at his death, his silver ring 'Muhammad Rasul Allah'**
   - Where: His Person tab: short 'His Possessions' trait card(s) in Manner & Presence, or 2-3 points strengthening the Asceticism virtue.
   - Why: Concrete, memorable proof of the simplicity the Asceticism entry describes abstractly — strong teaching material for parents.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 34:21-22 armor mortgaged to a Jew for barley; Bukhari 56:151 the engraved seal ring for letters to rulers)

**14. ⚪ LOW · How he taught — khutbah intensity, teaching youth one-on-one (advice to Ibn Abbas: 'Be mindful of Allah and He will protect you')**
   - Where: His Person tab → Manner & Presence: one new trait card 'How He Taught' (complements existing Voice and Walk & Manner cards).
   - Why: Teachers and parents mine this page for his pedagogy; the Ibn Abbas advice is one of the most-memorized hadiths for children and appears nowhere in the app's Prophet coverage.
   - Size: points (2-4 bullets) · Kind: new-subtopic
   - Sourcing: local-verified (Tirmidhi 37:102 the full 'O boy, be mindful of Allah' narration; Muslim 7:55 his sermon delivery — eyes reddened, voice rose)

---

### /miracles — 12 proposals (4 high)

_Current coverage: Single page with 5 category pills over 38 inline cards: Linguistic (2: tahaddi challenge, unique literary form), Fulfilled Prophecies (11: Constantinople, Jerusalem, Persia, tall buildings, Hijaz fire, Amwas plague, harj, time, markets, Mongols), Scientific References (12: embryology, two seas, mountains, iron, deep-sea, water cycle, orbits, expanding universe, Big Bang, pain receptors, forelock), Historical (4: Pharaoh's body, Thamud, Iram, lowest land), Numerical (9 word-count patterns). Cards carry Arabic, translation, explanation, historical context, sources, and an internal strong/moderate/debated grading._

**1. 🔴 HIGH · Entire missing category: the physical miracles of the Prophet ﷺ — splitting of the moon, water from his fingers, food multiplication, the weeping tree trunk, Isra wal-Mi'raj**
   - Where: New category pill 'Miracles of the Prophet ﷺ' in the categories array; to stay within ~6 pills, fold 'Numerical Patterns' (all debated anyway) under Linguistic or a combined 'Textual Patterns' pill
   - Why: A page titled 'Miracles & Prophecies' with zero sensory mu'jizat is the gap every reader notices — the splitting of the moon is the first miracle most users would search for.
   - Size: tab · Kind: new-subtopic
   - Sourcing: local-verified (moon: Quran 54:1-2 + Bukhari 61:140, 61:142, 63:94; water from fingers: Bukhari 64:196, Muslim 36:191; food increase: Bukhari 9:77; weeping trunk: Bukhari 34:48; Isra chest-opening/Zamzam: Bukhari 60:17)

**2. 🔴 HIGH · Surah Ar-Rum prophecy — 'The Romans will be victorious within a few years' and Abu Bakr's wager**
   - Where: New card in the Fulfilled Prophecies category (it is the only major Quranic — not hadith — fulfilled prophecy, so it also diversifies that tab)
   - Why: This is the most famous fulfilled prophecy in the Quran itself, verifiable against Byzantine-Sasanian war history (614-628 CE), and it is absent while ten hadith prophecies are present.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Quran 30:2, 30:3, 30:4 present; Tirmidhi 46:9 and 47:243 narrate the revelation and Abu Bakr's wager with Quraysh)

**3. 🔴 HIGH · Render the existing strength grading — 'strong / moderate / debated' badges and strengthNote are in the data but never displayed**
   - Where: Badge next to the category label on each card + the strengthNote as a footnote block; add a short 'How we grade these' intro card above the list
   - Why: The intellectual-honesty work is already written (every debated numerical claim has a caveat) but invisible — surfacing it is the page's biggest credibility win for near-zero authoring cost.
   - Size: points (2-4 bullets) · Kind: structural
   - Sourcing: local-verified (fields exist on all 38 entries in miracles/page.tsx lines 16-29 and are unused in the card render, lines 500-548)

**4. 🔴 HIGH · Beef up the 2-entry Linguistic tab: preservation of the Quran (15:9, huffaz, manuscript record), the internal-consistency challenge (4:82), and the unlettered Prophet (29:48)**
   - Where: Three new cards in the linguistic category
   - Why: The page's own framing calls the linguistic miracle 'foundational', yet the tab holds only 2 cards while numerical word-counts hold 9 — inverted emphasis relative to mainstream scholarship.
   - Size: topic · Kind: deepen-existing
   - Sourcing: local-verified (Quran 15:9, 4:82, 29:48 all present in packages/content/quran/verses; manuscript/huffaz detail = scholarly-summary-generic)

**5. 🟡 MED · Prophecies witnessed by the companions: 'Be firm, Uhud — a Prophet, a Siddiq and two martyrs' (Umar and Uthman's martyrdoms) and 'the earth was folded for me' (spread of the ummah east and west)**
   - Where: Two new cards in Fulfilled Prophecies
   - Why: Current prophecy cards are all far-future (1258 CE onward); prophecies fulfilled within living memory of the narrators are stronger evidentially and are missing.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 62:25 'Be firm, O Uhud! For on you there are... a Prophet, a Siddiq and two martyrs'; Abu Dawud 37:13 'Allah... folded for me the earth')

**6. 🟡 MED · Abu Lahab's decade-long open falsification window (Surah Al-Masad)**
   - Where: New card in Fulfilled Prophecies
   - Why: A classic dawah point new Muslims encounter constantly: Surah 111 condemned Abu Lahab to die a disbeliever ~10 years before his death, and he never falsified it by feigning conversion.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Quran 111:1 present; death after Badr context = scholarly-summary-generic)

**7. 🟡 MED · Scientific additions: fingertips restored in resurrection (75:4) and milk 'from between excretion and blood' (16:66)**
   - Where: Two new cards in Scientific References, graded moderate with honest strengthNotes per the page's existing convention
   - Why: Fingerprint uniqueness (75:4) is among the most-cited scientific-reference points in English dawah literature and users will look for it here.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Quran 75:4 'We are able to restore even his very fingertips' and 16:66 both present)

**8. 🟡 MED · Historical addition: 'King' in Yusuf's Egypt vs 'Pharaoh' in Musa's Egypt — title precision across a 400-year gap**
   - Where: New card in Historical & Archaeological
   - Why: A well-known point of Quranic historical precision (the 'Pharaoh' title postdates the Hyksos era of Yusuf) that fits this tab exactly and doubles its currently thin 4-card coverage.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Quran 12:43, 12:50 use 'The King'; Musa narrative uses Fir'awn e.g. 7:103ff; Egyptology framing = scholarly-summary-generic)

**9. 🟡 MED · Intro explainer: what is a mu'jizah? (miracle vs karamah vs magic, why miracles accompany prophets, why the Quran is the lasting miracle)**
   - Where: Short intro card between the VerseHero and the category pills
   - Why: New Muslims arrive with a Christian/skeptic frame of 'miracle'; two paragraphs of Islamic framing make the whole page land correctly.
   - Size: points (2-4 bullets) · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (anchor hadith 'every prophet was given signs... what I was given is revelation' is in Bukhari — the local corpus has Bukhari book 66/97 candidates but I did not pin the exact entry, verify before shipping)

**10. 🟡 MED · De-duplicate or cross-link: the Prophecies tab repeats ~10 entries already in /prophet-muhammad?tab=prophecies**
   - Where: Structural decision: single-source the prophecy dataset in packages/content and render in both places, or add reciprocal 'See also' links
   - Why: Constantinople, shepherds, Hijaz fire, Mongols, harj, time-acceleration etc. are maintained as two divergent copies (this page's data vs prophet-muhammad/page.tsx lines 1003-1102), which will drift as content is corrected.
   - Size: points (2-4 bullets) · Kind: structural
   - Sourcing: local-verified (duplicate titles confirmed in apps/web/src/app/prophet-muhammad/page.tsx lines 1012-1102)

**11. ⚪ LOW · Greening of Arabia prophecy ('the land of the Arabs will return to meadows and rivers')**
   - Where: New card in Fulfilled Prophecies, graded moderate (fulfillment reading is contemporary)
   - Why: Widely shared in English-language dawah with modern satellite imagery of Saudi greening; users will search for it.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: needs-external-source (Sahih Muslim, Book of Zakat — NOT found in local corpus under 'meadows/pastures and rivers'; fetch and verify wording before authoring)

**12. ⚪ LOW · Miracles of earlier prophets index (she-camel of Salih, fire cooled for Ibrahim, staff and sea of Musa, virgin birth of Isa) with links into the prophet stories**
   - Where: Small cross-link card grid at the bottom of the page pointing to /prophets/[slug] sections, rather than duplicating content
   - Why: The page reads as Quran/Muhammad-only despite its generic title; a link grid satisfies the expectation without creating a second copy of the stories.
   - Size: points (2-4 bullets) · Kind: structural
   - Sourcing: local-verified (all four episodes already authored in packages/content/prophet-stories.ts with verses, e.g. Quran 21:69 fire, 26:63 sea)

---

### /story-of-creation — 12 proposals (4 high)

_Current coverage: A 12-stage numbered journey (Before Creation, Pen & Tablet, Throne & Water, Heavens & Earth, Angels, Jinn, Adam & Hawa, Life on Earth, Death & Grave, End Times, Day of Judgement, Jannah & Jahannam), each stage a rail of 1-3 topics with 2-5 cited points, verse hero, per-tab SourcesCard, and go-deeper links to /barzakh, /day-of-judgement, /jannah for the last four stages. Coverage per stage is a solid summary (creation of the Pen, Throne, six days, angel roles, Iblis, Adam's creation and fall, purpose of life, minor/major signs, resurrection/scales/sirat, Paradise/Hell/eternal end) but each stage stops at 2-3 headline narrations._

**1. 🔴 HIGH · The Covenant of Alast (al-Mithaq) — 'Am I not your Lord?' and the fitrah**
   - Where: New topic in the 'Adam & Hawa' tab rail (after 'Creation of Adam'), e.g. 'The Covenant of All Souls'
   - Why: The extraction of all of Adam's descendants and their testimony (Quran 7:172) is a pillar of the creation narrative and the standard dawah explanation of why every child is born knowing Allah — the arc currently jumps from Adam's fall straight to earth without it.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 7:172 'brought forth from the loins of the children of Adam'; Muslim 46:36 'no child is born but upon fitrah'; Bukhari 81:127 ransom hadith referencing what was asked 'in the loins of Adam')

**2. 🔴 HIGH · Qadar and free will — 'if everything is written, why am I responsible?'**
   - Where: New topic 'Decree & Your Choices' in the 'Pen & Tablet' tab rail
   - Why: The tab establishes that everything was written 50,000 years before creation but never answers the number-one question this raises for every new Muslim; cover the four levels of belief in qadar, the Adam-and-Musa argument, and the angel writing provision/lifespan/deeds in the womb.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 46:20 argument of Adam and Musa; Muslim 46:1 Ibn Mas'ud embryo hadith with the angel writing four decrees; Quran 22:70 already on the page)

**3. 🔴 HIGH · Habil & Qabil — the first death and first murder on earth**
   - Where: New topic 'The First Sons of Adam' in the 'Life on Earth' tab rail (opening topic, before 'The Purpose of Life')
   - Why: The narrative jumps from Adam's descent to abstract 'purpose of life' — the first human story after the descent (the two offerings, the murder, the crow teaching burial) is a famous Quranic account every reader expects in a creation-story arc.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 5:27-31 full account incl. the crow; Bukhari 60:10 'whenever a person is murdered unjustly, part of the burden is on the first son of Adam')

**4. 🔴 HIGH · Angels Around You — guardian angels and angels in daily life**
   - Where: New topic in the 'Angels' tab rail (third topic after 'Their Nature' and 'Their Roles')
   - Why: 'Do I have a guardian angel?' is a top question on any angels page; cover the successive protecting angels of Quran 13:11, the roaming squads seeking dhikr gatherings, wings lowered for the seeker of knowledge, and why angels avoid houses with dogs/images.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 13:11; Muslim 48:35 mobile squads of angels seeking remembrance; Bukhari 59:128 angels do not enter a house with a dog or picture; Tirmidhi 41:38 wings for the seeker of knowledge)

**5. 🟡 MED · How each of us is created — the embryo stages (nutfah, alaqah, mudghah) and the soul breathed in**
   - Where: New topic 'Your Own Creation' in the 'Life on Earth' tab rail, or 2-3 points appended to 'Creation of Adam'
   - Why: The page covers Adam's creation but not the ongoing creation of every human — the Quranic embryo stages plus the hadith of the soul being breathed in at 120 days are among the most-quoted creation texts and a mainstay of dawah content.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 23:12-14; Quran 32:9 'breathed into him of His spirit'; Muslim 46:1)

**6. 🟡 MED · 'My Mercy prevails over My Wrath' — written above the Throne**
   - Where: New point in the 'The Throne (al-Arsh)' topic, 'Throne & Water' tab
   - Why: The single most famous narration about the Throne after the ring-in-desert hadith, and it reframes the entire creation story around mercy — an obvious emotional anchor the tab lacks.
   - Size: points (1-2 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 59:5; Bukhari 97:50; Muslim 50:18)

**7. 🟡 MED · Adam & Hawa deepening: created on Friday, the handful from all the earth, souls as recruited troops, the rib narration**
   - Where: Points distributed across the two existing 'Adam & Hawa' topics
   - Why: Four famous authentic narrations that enrich the stage: Friday as the day of Adam's creation/entry/expulsion, the handful-from-all-earth hadith (a powerful teaching on human diversity: red, white, black), souls knowing each other before bodies, and the 'treat women kindly' rib hadith on Hawa.
   - Size: points (3-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Muslim 7:26 best day is Friday; Abu Dawud 42:98 and Tirmidhi 47:7 handful from all the earth; Bukhari 60:11 souls are like recruited troops; Bukhari 60:6 created from a rib)

**8. 🟡 MED · The Qarin — every person's assigned jinn companion, plus protection cross-link**
   - Where: New topic or 2 points in the 'Jinn' tab rail, ending with a go-deeper card to /protection (Daily Protection tab)
   - Why: New Muslims are often anxious about jinn; the qarin hadith (including that the Prophet's companion accepted Islam), that waswas is not sin, and a pointer to the existing /protection page turn the tab from theory into reassurance.
   - Size: points (2-3 bullets) + cross-link · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 52:62 'there is none amongst you with whom is not an attache from amongst the jinn')

**9. 🟡 MED · The sun, moon and mountains — the furnished earth**
   - Where: New topic or points in the 'Heavens & Earth' tab (third topic after 'Seven Heavens')
   - Why: The tab covers the six days and seven heavens but nothing on the celestial bodies and earth's features readers actually see — the sun running its course and prostrating beneath the Throne (Abu Dharr hadith) and mountains as stakes are famous, vivid texts.
   - Size: points (2-3 bullets) or topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 59:10 'do you know where the sun goes?'; Quran 36:38; Quran 78:7 mountains as stakes)

**10. 🟡 MED · Complete the ten major signs — the hadith of Hudhayfah (smoke, the Beast, three landslides, the fire)**
   - Where: One summarizing point in 'Major Signs of the Hour', 'End Times' tab (detail already lives on /day-of-judgement, which covers Mahdi/Beast/landslides)
   - Why: The tab lists 5 of the 10 major signs; a single point quoting the Hudhayfah hadith that enumerates all ten keeps the summary honest and drives readers to the go-deeper page.
   - Size: points (1-2 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Muslim 54:51 and 54:52, hadith of Hudhayfah b. Usaid listing the ten signs)

**11. 🟡 MED · From Adam to Nuh — mankind was one nation and how shirk first entered**
   - Where: Point(s) in 'The Sending of Messengers' topic, 'Life on Earth' tab, with cross-link to /prophets
   - Why: Explains WHY messengers were needed — Ibn Abbas's narration that the idols of Nuh's people began as venerated righteous men bridges the gap between Adam's tawhid and the first messenger, a story most readers have never heard sourced.
   - Size: points (2 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Quran 2:213 'mankind was one nation'; Bukhari 65:440 Ibn Abbas on the idols of the people of Nuh)

**12. ⚪ LOW · FAQ: 'Why did Allah create at all?' — including a caution that 'I was a hidden treasure' is not an authentic hadith**
   - Where: Points appended to 'Allah Alone' in the 'Before Creation' tab
   - Why: The most common seeker question on this subject; the page already says He was not in need, but should positively frame the wisdom (to be known and worshipped, to manifest His names) and explicitly flag the ubiquitous fabricated 'hidden treasure' quote.
   - Size: points (2 bullets) · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (Quran 51:56 already on page; the hidden-treasure caution is a standard scholarly grading, no invented citation needed)

---

### /protection — 8 proposals (4 high)

_Current coverage: Five tabs. Overview: full text of al-Falaq and an-Nas plus 'amulets are shirk'. Sihr rail (4 topics): reality of sihr, among the seven destructive sins, fortune-tellers/never fight sihr with sihr, signs vs superstition. Evil Eye rail (4 topics): the eye is real, when you admire (ma sha' Allah / invoke blessing), the remedy (ruqyah + washing), envy. Ruqyah rail (4 topics): conditions, al-Fatiha, 6-step self-ruqyah, choosing a raqi. Daily Protection rail (3 topics): morning-evening, Ayat al-Kursi, home & going out, with cross-links to /muslim-daily and /duas. Well-sourced and balanced; the biggest holes are the Shaytan/waswas dimension and the Quran-recitation home fortress._

**1. 🔴 HIGH · New tab: 'Waswas & the Shaytan' — intrusive whispers in faith and worship**
   - Where: New 6th top tab (page is at 5 of the 6-tab cap) with a 3-4 topic rail: whispers about Allah ('who created your Lord?' — say 'I believe in Allah' and desist), waswas is a sign of faith not hypocrisy, whispers during prayer and recitation (the Khinzab hadith — seek refuge and dry-spit left three times), and seeking refuge in daily life (before reciting Quran, when angry)
   - Why: Intrusive religious thoughts are the most common 'protection' problem real users face — far more than sihr — and are especially acute for new Muslims and those with OCD-like waswas; the page currently covers external harms only.
   - Size: tab · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 59:85 'Who has created your Lord?'; Muslim 1:249 evil prompting is 'pure faith'; Muslim 39:92 Uthman b. Abu al-As and Khinzab; Quran 16:98 seek refuge when reciting; Bukhari 59:91 refuge when angry)

**2. 🔴 HIGH · The sihr worked on the Prophet himself (Labid ibn al-A'sam) and how it was undone**
   - Where: Sihr tab — new topic in the rail ('When the Prophet was afflicted') or 2 points added to 'The Reality of Sihr'
   - Why: The most famous narration on the entire subject, and it answers the question every afflicted reader asks — 'can this happen to a good person, and what did the Prophet do about it?' (he turned to dua and Allah's cure, not counter-magic).
   - Size: topic (a rail entry) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 59:78 'Magic was worked on the Prophet'; Bukhari 76:77 Labid bin al-A'sam named)

**3. 🔴 HIGH · The home fortress: Surah al-Baqarah drives Shaytan from the house, and its last two verses suffice at night**
   - Where: Daily Protection tab — new rail topic 'The Quran in Your Home' between 'Ayat al-Kursi' and 'Home & Going Out'
   - Why: Two of the most famous protection texts in the Sunnah are entirely absent — practicing Muslims universally know 'Shaytan flees from the house in which al-Baqarah is recited' and Amana-r-rasulu at night.
   - Size: topic (a rail entry) · Kind: missing-narrations
   - Sourcing: local-verified (Muslim 6:252 'Do not make your houses as graveyards. Satan runs away from the house in which Surah Baqara is recited'; Bukhari 64:59 and 66:31 last two verses of al-Baqarah at night are sufficient)

**4. 🔴 HIGH · When night falls: keep children close, shut doors with bismillah, cover vessels, extinguish lamps**
   - Where: Daily Protection tab — either a new rail topic 'When Night Falls' or 2 points added to 'Home & Going Out'
   - Why: A vivid, immediately actionable household sunnah of protection that parents in particular will use the same evening they read it; the current 'Home & Going Out' covers entering/leaving but nothing about nightfall.
   - Size: topic (a rail entry) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 59:89 and 59:112 'When night falls keep your children close to you, for the devils spread out'; Muslim 36:120 cover vessels, close doors, extinguish lamps)

**5. 🟡 MED · Protecting your children — the Prophet's dua for Hasan and Husayn plus a parent's routine**
   - Where: Evil Eye tab (new rail topic 'Protecting Children') or Daily Protection rail — combining the u'idhukuma dua (already on /duas), reciting the Quls over children at bedtime, and keeping them in at dusk; cross-link to /duas?tab=protection
   - Why: Parents are the primary evil-eye-anxious audience (new babies especially), and the page never addresses children even though the Prophet's own practice with his grandsons is the template.
   - Size: topic (a rail entry) · Kind: practical-guide
   - Sourcing: local-verified (Bukhari 60:45 — 'I seek protection for you both in the perfect words of Allah', already cited on /duas; Bukhari 59:89 children at dusk; Bukhari 66:39 the Quls before sleep)

**6. 🟡 MED · 'Do I have sihr or the evil eye?' — a practical triage FAQ**
   - Where: Sihr tab — new rail topic ('If You Suspect Affliction') expanding 'Signs vs. Superstition' into a step-by-step: see a doctor first, keep the adhkar, perform the self-ruqyah steps (link to Ruqyah tab), do not accuse anyone, when and how to involve a raqi, and the ruling on 'undoing magic with magic' (nushrah)
   - Why: The page teaches doctrine well but a genuinely worried reader still lacks a single ordered 'what do I actually do this week' walkthrough — the exact reason this page will be opened.
   - Size: topic (a rail entry) · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (the component narrations are already verified on-page: Muslim 39:173, Bukhari 76:27, Abu Dawud 29:29; the triage ordering itself is standard scholarly guidance, keep generic attribution per docs/content-review-queue.md convention)

**7. 🟡 MED · The adhan drives Shaytan away — protection woven into the prayer itself**
   - Where: Point inside the proposed Waswas tab, or added to Daily Protection 'Morning & Evening' topic
   - Why: A famous, memorable narration that reframes the five daily prayers as the believer's primary protection schedule — reinforcing the page's core message that protection is a lifestyle of worship.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 10:6 and 21:26 'When the Adhan is pronounced Satan takes to his heels')

**8. 🟡 MED · Dreams and nightmares — the full prophetic etiquette**
   - Where: Waswas tab (if built) or Daily Protection rail: good dreams are from Allah, bad from Shaytan; spit lightly left three times, seek refuge, change sides, tell no one — expanding the one-line treatment currently on /duas sleep category, with a cross-link both ways
   - Why: Frightening dreams are a common trigger for protection-seeking (and for visiting fortune-tellers — which this page warns against), so the complete etiquette belongs here.
   - Size: topic (a rail entry) · Kind: deepen-existing
   - Sourcing: local-verified (Muslim 42:4 — already cited on /duas 'After a Bad Dream'; the same book of Muslim (Kitab ar-Ru'ya) carries the good-dream/bad-dream framing)

---

### /ramadan — 10 proposals (4 high)

_Current coverage: Four tabs: What is Ramadan? (single essay card), Why It Matters (6 numbered virtues: gates opened, shield, sins forgiven, Quran revealed, Laylatul Qadr, hadith qudsi), Fasting Guide (rail: Basics incl. niyyah/suhoor/iftar/du'a/timing, What Breaks It, What Doesn't Break It, Exemptions, Making Up Days incl. qada/fidyah/kaffarah), Last 10 Nights & Eid (rail: Laylatul Qadr, I'tikaf, Zakat al-Fitr, Eid al-Fitr). Fiqh of the fast is genuinely solid; the big holes are worship beyond fasting (Tarawih gets one passing sentence), month start/end mechanics, and lived-experience guidance (FAQs, family, health, after Ramadan)._

**1. 🔴 HIGH · Worship in Ramadan — new tab covering Tarawih & night prayer, the Quran habit, generosity & feeding others, and du'a in Ramadan**
   - Where: New 5th top tab 'Worship in Ramadan' (page has 4 of max 6) with a 4-topic rail: tarawih, quran, generosity, dua; Tarawih topic cross-links to the how-to at /salah?tab=voluntary&sub=tarawih
   - Why: The intro itself says Ramadan is 'far more than abstaining from food,' yet every tab after it is about the fast — Tarawih, the defining nightly worship of the month, has no home here.
   - Size: tab · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 31:1-2 whoever prays the nights of Ramadan in faith is forgiven; Bukhari 31:3 Umar gathering the people behind one reciter; Bukhari 31:5 the Prophet withdrew fearing it be made obligatory; Bukhari 31:6 Aisha: never more than eleven rak'at; Tirmidhi 8:126 and Ibn Majah 7:109 reward for feeding a fasting person; Ibn Majah 7:115 the fasting person's du'a is not rejected; Bukhari 1:6 generosity — already cited)

**2. 🔴 HIGH · When Ramadan begins and ends — moon sighting, the 29/30-day month, the doubt day, and why communities differ**
   - Where: New first topic 'When It Begins' in the Fasting Guide rail (before Basics)
   - Why: The single most-asked practical question every year ('is tomorrow Ramadan? why do mosques disagree?') is answered nowhere on the page.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 30:19 fast on seeing the crescent, complete thirty if obscured; Bukhari 30:23 'We are an illiterate nation... the month is like this and this'; Bukhari 30:24 do not fast a day or two before Ramadan except an established habit)

**3. 🔴 HIGH · Fasting FAQ — common questions (waking up junub, intimacy short of intercourse, toothpaste, inhalers, showering/swimming, nosebleeds, wet dreams, forgetting repeatedly, vaccination)**
   - Where: New topic 'Common Questions' at the end of the Fasting Guide rail, in Q&A format
   - Why: These embarrassment-prone questions are exactly what new Muslims won't ask a person and will ask an app; 'What Doesn't Break It' covers some but skips the intimate ones entirely.
   - Size: topic · Kind: practical-guide
   - Sourcing: local-verified for the core narrations (Bukhari 30:34 and 30:39 the Prophet woke in janabah and fasted; Bukhari 30:35-36 he kissed his wives while fasting and had the most self-control); modern items (inhaler, patches, vaccines) are scholarly-summary-generic per fiqh-academy positions the page already cites in this style

**4. 🔴 HIGH · Missing famous virtues in 'Why It Matters' — the gate of Ar-Rayyan, the two joys of the fasting person + breath sweeter than musk, 'whoever does not give up false speech,' and the unrejected du'a**
   - Where: 3-4 additional numbered cards in the Why It Matters tab (currently 6 items)
   - Why: Ar-Rayyan and the two-joys hadith are among the most beloved and quoted fasting narrations in the tradition; their absence is conspicuous to any practicing reader.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 30:6 the gate Ar-Raiyan for those who fast; Bukhari 30:14 two joys and breath sweeter than musk within the hadith qudsi; Tirmidhi 8:85 two joys standalone; Bukhari 30:13 'whoever does not give up forged speech and evil actions'; Ibn Majah 7:115 three whose supplications are not turned back, including the fasting person)

**5. 🟡 MED · The Prophet's intensity in the last ten nights — 'he tightened his belt, prayed the night, and woke his family'**
   - Where: One point added to the Laylatul Qadr topic (or the last-ten tab intro) in the Last 10 Nights & Eid rail
   - Why: It is the framing narration for the entire last-ten section — the practical model of what stepping it up looks like — and it's absent.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 32:11 'With the start of the last ten days of Ramadan, the Prophet used to tighten his waist belt, pray all night, and wake his family')

**6. 🟡 MED · After Ramadan — six days of Shawwal, making up missed days first, and keeping habits alive**
   - Where: New topic 'After Ramadan' at the end of the Last 10 Nights & Eid rail (after Eid al-Fitr); cross-link to /islamic-calendar Shawwal card
   - Why: The page ends at Eid with no bridge to what comes next, and 'six of Shawwal' is the first question every mosque gets the week after Eid (including the qada-before-voluntary ordering question).
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 13:264 six of Shawwal = fasting the year, already cited on the calendar page; Muslim 13:193 Aisha delaying qada to Sha'ban, already cited in Making Up Days; consistency hadith Bukhari 81:53 already cited on calendar page)

**7. 🟡 MED · Ramadan with children and family — training kids gradually, the first fast, making the month special at home**
   - Where: New topic 'Ramadan with Kids' in the Fasting Guide rail (or a card in the intro tab); cross-link from /kids
   - Why: The stated audience includes practicing families; the only child-related content is one exemption bullet, with zero guidance on the how (half-days, suhoor together, reward charts, first full fast).
   - Size: topic · Kind: practical-guide
   - Sourcing: local-verified for the anchor (Bukhari 30:67, already cited — companions had their children fast and distracted them with toys); the practical parenting guidance itself is scholarly-summary-generic

**8. 🟡 MED · Fasting with health conditions — diabetes, daily medication timing, IV drips/dialysis, mental-health medication, and when NOT to fast**
   - Where: 2-3 additional points inside the existing Exemptions topic (plus a gentle 'consult your doctor and a scholar' note)
   - Why: Exemptions covers the classical categories but users arrive with modern medical specifics, and the page's own eye-drops/injections point shows the house style already accommodates fiqh-academy material.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (contemporary fiqh-academy and Ibn Uthaymeen positions, same sourcing style as the existing 'Eye drops... Islamic Fiqh Academy' point; anchored by Quran 2:184-185 already cited)

**9. 🟡 MED · Your first Eid — step-by-step (the takbir text is present but add: everyone attends including women and children, prayer structure walkthrough, Eid greetings, what to do if you miss the prayer)**
   - Where: 2-3 additional points in the Eid al-Fitr topic of the Last 10 Nights & Eid rail
   - Why: A convert attending their first Eid needs the social script — that women and children are commanded to attend is both practically vital and a famous narration the page omits.
   - Size: points (2-4 bullets) · Kind: practical-guide
   - Sourcing: local-verified (Bukhari 13:30 Umm Atiyya: 'We were ordered to go out for Eid and take along the menstruating women and mature girls'; Bukhari 13:29 same theme; the taqabbal-Allahu-minna-wa-minkum greeting is a companions' athar — mark scholarly-summary-generic for that item)

**10. ⚪ LOW · Zakat al-Fitr vs annual Zakat — one clarifying point**
   - Where: One point appended to the Zakat al-Fitr topic distinguishing it from the wealth-based annual zakat pillar, with a cross-link to the pillars page
   - Why: New Muslims routinely conflate the two obligations and can wrongly assume paying one covers the other.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 24:103 already cited for Zakat al-Fitr scope; annual zakat daleel lives on the pillars page — this is primarily a definitional cross-link point)

---

### /hadith — 12 proposals (4 high)

_Current coverage: A reference/browser page, not a taught-content page: a hero (Bukhari 1:1 on intentions), full-text English search plus structured-reference lookup (e.g. 'bukhari 50'), and a pill TabBar with a Featured tab (10 famous hadiths with illustrations: intentions, no-harm, cleanliness, speech, anger, stranger, Quran, ease, wives, character) followed by 7 collection tabs (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Ahmad). Each collection tab shows a 1-2 sentence description, a Sahih/Mixed grade badge, and a books grid linking into the /hadith/[collection]/[book] reader. There is zero educational framing: nothing on what a hadith is, why it is authoritative, how grading works, who the compilers were, or how the corpus was preserved — and no curated entry point besides the 10 Featured items._

**1. 🔴 HIGH · 'About Hadith' intro — what hadith is, isnad vs matn, and why the Sunnah is authoritative**
   - Where: New 'About' tab placed right after Featured in the pill TabBar (or an intro section above the pills); 3-4 short topics inside it
   - Why: A new Muslim lands on a wall of 7 book collections with no explanation of what a hadith even is, how it differs from the Quran, or why Muslims follow it — the single most obvious framing gap; should also briefly answer the 'Quran-alone' objection.
   - Size: tab · Kind: new-subtopic
   - Sourcing: local-verified (Quran 4:80, 59:7, 33:21, 53:3-4, 16:44 all present in packages/content/quran/verses; anti-fabrication warning Bukhari 3:48 'whoever tells a lie against me' confirmed in bukhari/3.json)

**2. 🔴 HIGH · Hadith grading explained — sahih, hasan, da'if, mawdu' and what 'Mixed' means**
   - Where: Topic inside the new About tab, plus a tappable info popover on the existing Sahih/Mixed grade badges on each collection tab
   - Why: The page already shows 'All Sahih' / 'Mixed' badges and warns that Ibn Majah has weaker hadiths, but never explains what grading is, the conditions of a sahih chain, mutawatir vs ahad, or how a lay reader should treat a weak narration.
   - Size: topic · Kind: new-subtopic
   - Sourcing: scholarly-summary-generic (standard mustalah al-hadith framework); anchor hadith locally verified: Bukhari 3:48-49 on fabrication, Bukhari 3:27 'knowledge will be taken away' in bukhari/3.json

**3. 🔴 HIGH · The Forty Hadith of Imam an-Nawawi as a curated set**
   - Where: New curated-set tab next to Featured (or own sub-route /hadith/nawawi40 if built with per-hadith commentary); each entry = number, title, text, one-line lesson, deep-link into the corpus reader
   - Why: The canonical beginner curriculum and the most-expected curated hadith set in any Islamic app; every entry is drawn from books already in the local corpus so it is pure curation work.
   - Size: tab · Kind: new-subtopic
   - Sourcing: local-verified spot-checks: #1 intentions Bukhari 1:1; #2 Jibril Muslim 1:1; #6 halal/haram clear Muslim 22:133; #7 religion is nasiha Muslim 1:103; #12 leave what doesn't concern you Tirmidhi 36:14; #13 love for your brother Bukhari 2:6; #18 fear Allah wherever you are Tirmidhi 27:93

**4. 🔴 HIGH · Hadith Qudsi — what a sacred hadith is + curated set of the famous ones**
   - Where: Second curated-set tab (or a topic under About with the set below it): short explainer distinguishing Qudsi from Quran and ordinary hadith, then ~10 entries linking into the reader
   - Why: Hadith Qudsi are among the most beloved and shared narrations, and the Quran-vs-Qudsi distinction is a genuine point of confusion for new Muslims.
   - Size: tab · Kind: new-subtopic
   - Sourcing: local-verified: 'I am just as My slave thinks I am' Bukhari 97:34; 'O My servants, I have forbidden oppression to Myself' Muslim 45:70; 'I have prepared for My pious worshipers what no eye has seen' Bukhari 59:55 (also 65:301-302)

**5. 🟡 MED · How the hadith reached us — preservation and compilation timeline**
   - Where: Topic inside the About tab: memorization culture → early written sahifas → Umar ibn Abd al-Aziz's directive → the era of the Six Books, as a short timeline
   - Why: Practicing Muslims and skeptical newcomers alike ask 'how do we know these words are really his?' — the preservation story is the answer and the page currently says nothing about it.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified anchors: Abu Huraira 'none narrated more than me except Abdullah bin Amr, for he used to write' Bukhari 3:55; fear of knowledge disappearing Bukhari 3:27; historical timeline itself is scholarly-summary-generic

**6. 🟡 MED · Compiler biographies — the men behind the six books and Ahmad**
   - Where: Expandable 'About the compiler' card at the top of each existing collection tab (7 cards), replacing the current single sentence
   - Why: Bukhari's 16-year journey sifting ~600,000 narrations, Muslim studying under him, Tirmidhi inventing in-text grading, Ahmad and the mihna — these stories build trust in the collections and each tab currently gives one line.
   - Size: topic · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (well-established biographical facts; no hadith citations required)

**7. 🟡 MED · Famous narrators — the companions who carried the Sunnah**
   - Where: Topic inside the About tab: short profile cards for Abu Huraira, Aisha, Ibn Umar, Anas, Ibn Abbas, Jabir with how many narrations and their story
   - Why: Every hadith on the site opens with 'Narrated Abu Huraira / Aisha / Anas' and the reader is never told who these people are or why they narrated so much.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified anchor: Bukhari 3:55 (Abu Huraira on being the most prolific narrator and Abdullah bin Amr writing); individual bios scholarly-summary-generic

**8. 🟡 MED · Reader's guide — how to use these collections**
   - Where: Points inside the About tab (or a dismissible card above the collection pills): how to read 'Bukhari 1:1' references, that numbering matches sunnah.com, why hadiths repeat across collections, where a beginner should start, and why some narrations need scholarly commentary (sharh) for context
   - Why: First-time users don't know how to navigate 40,000+ hadiths or interpret references, and reading isolated narrations without context is the #1 way newcomers get confused.
   - Size: points (2-4 bullets) · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (app-usage and methodology guidance, no citations needed)

**9. 🟡 MED · Thematic browsing — curated hadith by topic (Riyad as-Salihin style)**
   - Where: Own sub-route /hadith/topics (page-sized) or a 'Topics' tab: a card grid of themes (Mercy, Parents, Anger, Charity, Honesty, Neighbors, Knowledge, Hope & Repentance), each with 5-10 verified hadiths linking into the reader
   - Why: Parents and teachers looking for 'hadiths about honesty for my kids' currently have only raw text search or book-by-book browsing — thematic curation is the classic teaching entry point.
   - Size: own-page · Kind: structural
   - Sourcing: local-verified samplers: seven shaded by Allah Bukhari 24:27; anger/self-control Bukhari 78:6114; Allah is Beautiful Muslim 1:171; path of knowledge Abu Dawud 26:3 and Muslim 48:48; remaining themes need per-hadith verification at build time per reference_verified_content_gen.md

**10. 🟡 MED · Expand Featured with the missing all-time-famous narrations**
   - Where: Additional entries in the existing featuredHadiths array on the Featured tab (each needs an illustration in FeaturedIllustrations)
   - Why: The current 10 omit several of the most-quoted hadiths in the tradition — most glaringly the hadith of Jibril, which defines Islam/Iman/Ihsan.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified: hadith of Jibril Muslim 1:1 (and Bukhari 2:43); love for your brother Bukhari 2:6; religion is sincerity Muslim 1:103; halal and haram are clear Muslim 22:133; seven shaded Bukhari 24:27; fear Allah wherever you are Tirmidhi 27:93; Allah is Beautiful Muslim 1:171

**11. 🟡 MED · Per-hadith authenticity grades in the Mixed collections**
   - Where: Structural/data: add an optional grade field to the corpus entry schema and render a badge in the /hadith/[collection]/[book] reader for Tirmidhi, Abu Dawud, Ibn Majah, Nasai, Ahmad
   - Why: A da'if narration in Ibn Majah currently renders identically to a sahih one in Bukhari, so trusting readers cannot tell them apart — the page's own descriptions admit the collections are mixed but the reader gives no per-hadith signal.
   - Size: own-page · Kind: structural
   - Sourcing: needs-external-source (corpus entries have no grade field; Darussalam/al-Albani gradings would be needed and are licensing-gray per the project's content-licensing audit — flag for founder decision)

**12. ⚪ LOW · FAQ accordion — common questions about hadith**
   - Where: Bottom of the About tab: 'What if two hadiths seem to conflict?', 'Can I act on a weak hadith?', 'Why do collections repeat the same hadith?', 'Why does numbering differ between books/apps?'
   - Why: These are the questions new and practicing Muslims actually bring to a hadith library, and answering them preempts confusion the raw corpus will otherwise create.
   - Size: points (2-4 bullets) · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (methodological answers; any hadith quoted must be corpus-verified at build time)

---

### /qiblah — 6 proposals (3 high)

_Current coverage: Thin PageHeader wrapper around QiblahSection (apps/web/src/components/QiblahSection.tsx): an intro card (what the qiblah is, 16-17 months facing Jerusalem, Quran 2:144), a strong live compass tool (true-north bearing with declination correction, distance to the Ka'bah, alignment haptic, calibration/tilt hints), a 'What if I'm not sure' card (Tirmidhi 2:194 'between east and west is qiblah', one sentence on travelers, Quran 2:286), and a SourcesCard with 4 refs. The tool is excellent; the educational layer is two cards._

**1. 🔴 HIGH · Why the Ka'bah? — its story, and the 'do Muslims worship it?' misconception**
   - Where: New ContentCard(s) after the intro card in QiblahSection (non-compact mode); the compact widget's existing link text 'Why do we face the Ka'bah?' promises exactly this and the page never answers it
   - Why: The number-one question from new Muslims, kids, and non-Muslim family: cover Ibrahim and Ismail raising the foundations, the first house of worship, first mosque on earth, and Umar's words at the Black Stone proving the direction is obedience, not idol-veneration.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Quran 2:127 Ibrahim raising the foundations; Quran 3:96 first House at Bakkah; Bukhari 60:40 first mosque built on earth = al-Masjid al-Haram; Bukhari 25:83 Umar: 'you are a stone and can neither benefit nor harm')

**2. 🔴 HIGH · The day the qiblah changed — the full story (Bara's narration, Quba turning mid-prayer, Masjid al-Qiblatayn, the 'test' verses)**
   - Where: Deepen the existing intro card or add a follow-on 'The story of the change' ContentCard
   - Why: The current intro gives two sentences and one verse; the tradition has a vivid, well-attested story — the congregation at Quba pivoting mid-prayer (also the proof-text that an honest wrong direction doesn't void prayer), the criticism from 'the foolish' and Allah's answer, and the Mosque of the Two Qiblahs visitors still see in Madinah.
   - Size: topic · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 2:33 Bara b. Azib: sixteen or seventeen months facing Bayt al-Maqdis and his longing for the Ka'bah; Bukhari 65:15-18 the Quba congregation turning toward the Ka'bah mid-prayer; Quran 2:142-143 'the foolish will say… We did not change your former direction except to test')

**3. 🔴 HIGH · Praying in a car, plane, train, or on a mount — qiblah rules in vehicles**
   - Where: New ContentCard after 'What if I'm not sure' (which currently gives travelers one sentence)
   - Why: Extremely common real-world case for this audience: the Prophet's own distinction — voluntary prayer on his mount facing wherever it turned, but dismounting for obligatory prayer — plus practical plane guidance (face qiblah at the opening takbir if feasible, otherwise direction of travel; pray seated when standing is impossible; whether to repeat on landing per madhhab, kept generic).
   - Size: topic · Kind: practical-guide
   - Sourcing: local-verified (Bukhari 14:11 nawafil on his mount facing its direction 'but not the compulsory prayer'; Bukhari 18:13 'offering the prayer on his mount whatever direction it took'; Quran 2:286) — plane-specific rulings scholarly-summary-generic

**4. 🟡 MED · Finding the qiblah without your phone (sun, shadows, stars, mosques)**
   - Where: Practical ContentCard near the compass tool — the natural fallback content when sensors fail (the page already detects poor calibration)
   - Why: Dead battery, no sensors on desktop, camping: teach sunrise/sunset east-west lines, solar-noon shadow, the Pole Star, following local mosque orientation, hotel ceiling arrows — and the comfort text that the earth was made a place of prayer and every direction belongs to Allah.
   - Size: topic · Kind: practical-guide
   - Sourcing: local-verified for the framing texts (Quran 2:115 'to Allah belong the east and the west'; Muslim 5:3 the earth made a mosque and a means of purification); navigation techniques are scholarly-summary-generic

**5. 🟡 MED · Qiblah mistakes and tolerances FAQ — realized mid-prayer, found out after, how exact must I be**
   - Where: Extend the existing 'What if I'm not sure' card into a short FAQ (3-4 Q&As) or a sibling card
   - Why: The existing card answers only the before-prayer case; users also ask: what if someone corrects me mid-prayer (turn and continue — the Quba precedent), what if I learn afterward (prayer stands after honest ijtihad), and how precise is required (facing the general direction suffices at distance — jihat al-Ka'bah, madhhab nuance kept generic), which also reassures users about a degree or two of compass error.
   - Size: points · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 65:15 Quba congregation turned mid-prayer and their prayer counted; Tirmidhi 2:194 already on page); jihat vs 'ayn al-Ka'bah summary scholarly-summary-generic

**6. 🟡 MED · The qiblah beyond salah — when facing it is loved, and when it is not allowed**
   - Where: Small ContentCard at the end of QiblahSection, cross-linking /death-rites for burial direction
   - Why: Rounds out the subject for practicing users and parents: facing qiblah for dua, dhikr, and slaughtering; the deceased buried facing it; and the well-known etiquette of not facing or backing the qiblah when relieving oneself in the open (with the Ibn Umar indoor nuance).
   - Size: points · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 4:10 Abu Ayyub: 'neither face nor turn his back towards the Qibla' when answering the call of nature; Bukhari 4:11 Ibn Umar's rooftop observation for the indoors nuance); dua/slaughter/burial customs scholarly-summary-generic with cross-link to existing /death-rites content

---

### /inheritance — 10 proposals (3 high)

_Current coverage: Four tabs: Foundations (rail: foundations / the three verses 4:11-12-176 / before-distribution order), The Shares (flat tab: complete heir-by-heir share cards including spouses, children, grandchildren, parents, grandparents, siblings, the asaba principle, and 3 worked examples incl. awl), Heirs (flat tab: three heir categories + who does not inherit: non-Muslim, killer, illegitimacy, divorced, adopted), Wasiyyah & FAQs (rail: wasiyyah rules incl. 1/3 cap and no-bequest-to-heir / wisdom-and-FAQs incl. the 2:1 question and non-Muslim-country wills). Strong on the core shares; thin on debts to Allah, guardianship, and classical special cases._

**1. 🔴 HIGH · Debts to Allah — unpaid zakah, kaffarah, unperformed obligatory hajj, and missed fasts as estate debts**
   - Where: Foundations → Before Distribution (extend the existing '2. Debts' card into debts-to-people and debts-to-Allah)
   - Why: The before-distribution sequence covers only debts to people, but a practicing family settling an estate must also handle the deceased's unpaid zakah and vowed/obligatory worship — a classical category with famous explicit daleel.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified ('Allah's debt has more right to be paid' — hajj vowed by the deceased mother: Bukhari 28:32, also 28:33; fasting owed — 'his heir must fast on his behalf': Bukhari 30:59-60, Abu Dawud 22:70; hajj on behalf of the aged/deceased parent: Muslim 15:455-456, Nasai 24:17-21)

**2. 🔴 HIGH · Naming a guardian (wasi) for minor children in the wasiyyah**
   - Where: Wasiyyah & FAQs → Wasiyyah (Will), as a card in the 'What to Include' grid
   - Why: Guardianship of minor children is the number-one reason young Muslim parents write a will, and the otherwise thorough what-to-include list omits it entirely (who raises the kids, Islamic-upbringing wishes, interaction with civil custody law).
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (fiqh of wisayah/guardianship; no specific hadith needed — do not invent one)

**3. 🔴 HIGH · The orphaned-grandchild problem — children of a son who died before his father**
   - Where: Wasiyyah & FAQs → Wisdom & FAQs (new FAQ card), cross-linked from the Son's Son exclusion note in The Shares
   - Why: One of the most common and emotionally charged real-world confusions: grandchildren blocked by living uncles get nothing by fara'id, and the tradition's remedy (a wasiyyah for them within the 1/3, plus the wasiyyah-wajibah statutes in several Muslim countries) is exactly what a family in this situation is searching for.
   - Size: points (2-4 bullets) · Kind: new-subtopic
   - Sourcing: local-verified for the anchor verse (Quran 4:8 — give present non-heir relatives something and speak kindly, confirmed in packages/content/quran/verses/4.json); the wasiyyah-wajibah discussion is scholarly-summary-generic

**4. 🟡 MED · The forgotten verses of the sequence — Quran 4:8, 4:9, 4:10**
   - Where: Foundations → The Verses (add after 4:176) and Foundations → Foundations (the 4:10 orphan-wealth warning pairs with the existing 4:13-14 severity cards)
   - Why: The verses sub presents 4:11/12/176 but skips the adjacent commands readers will meet in the mushaf: gifting non-heirs present at distribution (4:8), fearing for helpless offspring (4:9), and consuming orphans' property being fire in the bellies (4:10).
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (verses/4.json: 4:8 'If at the time of distribution, relatives, orphans, and the needy are present, give them something too'; 4:9; 4:10 'consume fire into their bellies')

**5. 🟡 MED · 'Learn the fara'id and teach them' — cite the encouragement the page already asserts**
   - Where: Foundations → Foundations, or the closing 'Learn the rules' card in Wisdom & FAQs (which currently claims 'The Prophet ﷺ encouraged learning the laws of inheritance' with no reference)
   - Why: Fixes an existing uncited claim with the actual narrations — presented with an honest grading note since both are graded weak by many scholars.
   - Size: points (2-4 bullets) · Kind: missing-narrations
   - Sourcing: local-verified (Tirmidhi 29:2 — 'Learn the laws of inheritance and the Quran, and teach the people'; Ibn Majah 23:1 — 'O Abu Hurairah, learn about the inheritance and teach it, for it is half of knowledge'; include a da'if grading caveat)

**6. 🟡 MED · Special Cases — awl, radd, al-gharrawayn/umariyyatan, grandfather with siblings, simultaneous deaths, the unborn child, the missing person**
   - Where: Structural: give The Shares tab a SubTabLayout rail with two entries ('The Shares' / 'Special Cases') — awl currently lives only inside Example 2, radd only in one closing sentence, and gharrawayn is name-dropped without explanation
   - Why: Practicing users and students of fiqh hit these the moment they try a real calculation (a car crash killing spouses simultaneously is a live modern question), and the page teases the terms without teaching them.
   - Size: sub-tab · Kind: structural
   - Sourcing: scholarly-summary-generic (classical fara'id doctrine; the umariyyatan is already summarized onsite under Mother; simultaneous-death and mafqud rules are madhhab summaries — no invented hadith)

**7. 🟡 MED · More worked examples covering the common Western household shapes**
   - Where: The Shares → Worked Examples: add (a) man leaves wife + both parents, no children; (b) only daughters, no son — who takes the remainder (asaba vs radd); (c) woman leaves husband + maternal siblings (kalalah); (d) a clean radd example
   - Why: The three current examples all include a male descendant or brother; the scenarios families actually agonize over — daughters-only estates and childless couples — are the missing ones.
   - Size: points (2-4 bullets) · Kind: practical-guide
   - Sourcing: local-verified (all arithmetic follows from Quran 4:11, 4:12, 4:176 and Bukhari 85:9 already cited onsite; no new texts needed)

**8. 🟡 MED · Making the Islamic will legally binding — step-by-step for the US/UK/Canada**
   - Where: Wasiyyah & FAQs rail: new topic ('Making It Legal') after 'Wasiyyah (Will)' — the current coverage is one sentence inside the Executor card
   - Why: The page correctly warns that civil intestacy law overrides fara'id without a valid will, but never tells the user how to actually get one done: witnessing/notarization requirements, template organizations, updating after moves between jurisdictions, revocation, and how beneficiary designations on retirement accounts and life insurance bypass the will.
   - Size: topic (a rail entry) · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (civil-law process guidance framed with the onsite Bukhari 55:1 two-nights command; no religious citations to invent)

**9. 🟡 MED · Interactive inheritance calculator (enter heirs, see the split)**
   - Where: Structural: a new sub-tab inside The Shares or a card linking to a small client-side tool; the share logic is already fully specified by the HeirShareCard data on this page
   - Why: The page teaches the fractions but every real user ultimately wants their own family computed; a calculator (with the existing 'consult a fara'id specialist' disclaimer) would be the app's most differentiating feature on this subject.
   - Size: sub-tab · Kind: structural
   - Sourcing: scholarly-summary-generic (implements rules already sourced onsite to Quran 4:11/12/176 and Bukhari 85:9; must exclude the special cases and say so)

**10. ⚪ LOW · Bequest to an heir with the other heirs' consent, and other wasiyyah edge rules**
   - Where: Wasiyyah & FAQs → Wasiyyah (Will), extending the 'No bequest to an heir' card (majority view: valid if the remaining heirs freely consent after the death; also what happens to a bequest exceeding 1/3)
   - Why: The absolute 'no bequest for an heir' statement leaves out the consent exception most fiqh manuals attach to it, which changes real outcomes for families who all agree.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (the exception rides on the onsite Tirmidhi 30:5 narration's fiqh commentary; some transmissions add 'unless the heirs consent' — grade honestly rather than cite the addition as sahih)

---

### /islamic-calendar — 11 proposals (3 high)

_Current coverage: Five tabs: Overview (what the Hijri calendar is, Umar's establishment, lunar mechanics, four sacred months), The 12 Months (expandable card per month with 1-5 sourced points each — strong on Muharram/Sha'ban/Ramadan/Dhul Hijjah, deliberately thin on Rabi al-Thani and both Jumadas), Sacred Months (what 'sacred' means: graver sins, greater rewards, fighting prohibited), Key Dates (12 annual dates from 1 Muharram to Tashriq), and a Gregorian-to-Hijri Date Converter (Umm al-Qura via Intl API). All content is annual-cycle focused; no weekly/monthly recurring observances, no moon-sighting explainer, and no practical guidance for the seasons it lists (e.g. Dhul Hijjah for non-pilgrims)._

**1. 🔴 HIGH · Moon Sighting — how an Islamic month actually begins (hilal, 29/30 days, sighting vs calculation, local vs global, the doubt day)**
   - Where: New 6th tab 'Moon Sighting' (page has 5 of max 6 tabs); alternatively a second ContentCard section inside Overview
   - Why: Every user hits the 'why does my mosque start Ramadan a day apart from my family abroad' question, and the page explains the lunar calendar without ever explaining how a month is declared.
   - Size: tab · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 30:19 'Start fasting on seeing the crescent'; Bukhari 30:23 'We are an illiterate nation... the month is like this and this' i.e. 29 or 30; Bukhari 30:24 'None of you should fast a day or two before Ramadan')

**2. 🔴 HIGH · Recurring Sunnah days — the weekly and monthly rhythm (Mondays/Thursdays, the White Days 13-14-15, Friday)**
   - Where: New 'Every Week & Every Month' group at the top of the Key Dates tab (the tab currently covers only annual dates)
   - Why: A practicing Muslim's calendar is built on weekly/monthly observances far more than annual ones, and the page presents zero of them.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Tirmidhi 8:80 fast the 13th/14th/15th; Tirmidhi 8:81 three days a month = fasting the year; Bukhari 30:88 the Prophet's three-part advice incl. fasting 3 days/month; Nasai 22:276 Monday and Thursday pattern; Muslim 13:256 Monday fasting — already cited on page)

**3. 🔴 HIGH · Dhul Hijjah for non-pilgrims — practical guide (takbir of the ten days, fasting the nine, no hair/nails for the one sacrificing, udhiyah basics, best du'a of Arafah)**
   - Where: 3-4 new points inside the Dhul Hijjah month card (id 12) + a matching Key Dates note; udhiyah step-by-step could cross-link if a Hajj/pillars page hosts it
   - Why: The page says the first ten days are the best of the year but gives a non-pilgrim nothing to actually do, and the hair/nails ruling is a famous obligation most converts have never heard of.
   - Size: points (2-4 bullets) · Kind: practical-guide
   - Sourcing: local-verified (Muslim 35:53 and 35:54 — no cutting hair or nails once Dhul Hijjah enters for the one intending sacrifice; Tirmidhi 48:216 'The best of supplication is the supplication of the Day of Arafah'; Tirmidhi 8:68 fasting Arafah expiates two years; Tirmidhi 8:92 Arafah, Nahr and Tashriq are our Eid)

**4. 🟡 MED · Ramadan in history — Battle of Badr (17 Ramadan 2 AH) and the Conquest of Makkah (Ramadan 8 AH)**
   - Where: Two new points in the Ramadan month card (id 9)
   - Why: Other month cards carry their signature historical events (Uhud in Shawwal, Hijrah in Safar) but the Ramadan card omits the two most famous ones in the tradition.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 64:310 the Prophet left Madinah with ten thousand in Ramadan for the Conquest; Bukhari 64:313 traveling and fasting until Usfan on that march; Quran 3:123 'Allah had helped you at Badr' — Badr's 17-Ramadan dating itself is standard sira, note as such)

**5. 🟡 MED · The night of mid-Sha'ban — honest treatment of what is authentic vs weak**
   - Where: New point in the Sha'ban month card (id 8), expanding the one-line Key Dates entry for 15 Sha'ban
   - Why: Mid-Sha'ban is widely observed in many communities and users will search for it; the app should present the hasan-graded narration and flag the weak practices rather than stay silent.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Ibn Majah 5:588 'Allah looks down on the night of the middle of Sha'ban and forgives...' — graded hasan by some, note grading; Ibn Majah 5:586 the night-vigil/day-fast narration — present as weak; Ibn Majah 7:14 no fasting after mid-Sha'ban, corroborates existing point)

**6. 🟡 MED · How the Hijri calendar was established — Umar's consultation, why the Hijrah (not the birth or first revelation) was chosen as year 1, and 'is there Islamic New Year worship?'**
   - Where: New ContentCard in the Overview tab + one point in the Muharram card addressing the 1-Muharram Key Dates row
   - Why: The Overview names Umar in one clause; the story behind the epoch is a genuinely engaging teach, and new Muslims need the honest note that no specific new-year worship is prescribed.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (epoch-choice deliberation is in Tabari/Ibn Hajar, not local hadith corpus; anchor with already-used Bukhari 63:131 for the Hijrah arrival)

**7. 🟡 MED · Ashura in later history — the martyrdom of al-Husayn at Karbala (10 Muharram 61 AH), with mainstream Sunni framing**
   - Where: One point in the Muharram month card (id 1), after the existing Ashura fasting points
   - Why: Anyone who searches Ashura online meets Karbala immediately; the page should acknowledge the event, the Prophet's love for al-Husayn, and that the fast predates and is independent of it.
   - Size: points (2-4 bullets) · Kind: new-subtopic
   - Sourcing: scholarly-summary-generic (Karbala dating is historical; the Prophet's love for Hasan/Husayn has local support, e.g. corpus hits in Bukhari book 61 — verify exact ref at build time)

**8. 🟡 MED · Seerah events for the thin months — Battle of Mu'tah (Jumada al-Ula 8 AH), Khandaq (Shawwal-Dhul Qi'dah 5 AH), Treaty of Hudaybiyyah (Dhul Qi'dah 6 AH), the Farewell Hajj (Dhul Hijjah 10 AH)**
   - Where: One historical point each in the Jumada al-Ula (id 5), Shawwal (id 10), Dhul Qi'dah (id 11) and Dhul Hijjah (id 12) cards
   - Why: Rabi al-Thani and the Jumadas honestly say 'no prescribed worship' but then have almost nothing — historical anchors keep every month card worth opening without inventing virtues.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (month datings are sira convention; Hudaybiyyah/Umrah context partially supported by already-cited Bukhari 64:192)

**9. 🟡 MED · Converter upgrades — Hijri-to-Gregorian reverse direction and 'upcoming key dates' (next Ramadan, next Eid, next Dhul Hijjah in Gregorian)**
   - Where: Date Converter tab: a direction toggle plus an auto-computed list derived from the existing keyDates array via Intl islamic-umalqura
   - Why: The most common real-world query ('when is Ramadan next year?') is a Hijri-to-Gregorian question the converter cannot currently answer.
   - Size: sub-tab · Kind: structural
   - Sourcing: scholarly-summary-generic (feature work, no citations needed beyond the existing Umm al-Qura disclaimer)

**10. ⚪ LOW · Do Muslims celebrate the Prophet's birthday? (Mawlid FAQ)**
   - Where: One carefully-worded point in the Rabi al-Awwal card (id 3), noting the date itself is not certain and that scholars have differed on commemoration
   - Why: The page lists 12 Rabi al-Awwal as a key date, so new Muslims will reasonably ask whether to celebrate it — silence invites confusion either way.
   - Size: points (2-4 bullets) · Kind: new-subtopic
   - Sourcing: scholarly-summary-generic (present both mainstream positions without adjudicating; founder review recommended given sensitivity — fits the existing content-review-queue pattern)

**11. ⚪ LOW · Nasi' — the pre-Islamic postponing of sacred months, and whether sacred-month rulings still apply today**
   - Where: One point in the Sacred Months tab's 'What does sacred mean?' card
   - Why: Quran 9:37 directly continues the verse the page is built on (9:36), and practicing users ask whether the fighting prohibition and graver-sin ruling remain in effect.
   - Size: points (2-4 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Quran 9:37 in packages/content/quran/verses/9.json; pairs with already-cited Quran 9:36 and Bukhari 65:184)

---

### /articles-of-faith — 7 proposals (3 high)

_Current coverage: Three tabs: 'What are the Articles?' (definition, Islam-vs-Iman, six-article overview cards), 'Why They Matter' (5 points), and 'The Six Articles' (sub-tabs for Allah, Angels, Books, Messengers, Last Day, Qadr). Each article card has a description, one 'Understanding in Depth' paragraph, 6-9 key points, 3-4 Quran verses, 1-3 hadith, 2 misconceptions, and sources. The Last Day card links out to /barzakh, /day-of-judgement, and /jannah for depth._

**1. 🔴 HIGH · Iman rises and falls — branches of faith, its sweetness, and the warning of hypocrisy**
   - Where: New 4th top tab 'Living Your Iman' (page has 3 of max 6 tabs), or 3-4 new cards appended to the 'Why They Matter' tab
   - Why: The intro states 'Iman increases with obedience and decreases with disobedience' in one sentence but never shows the famous texts or gives the practicing Muslim anything to do about weak iman — the most practical iman topic is entirely absent.
   - Size: sub-tab · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 1:59 'Iman has over seventy branches, and modesty is a branch of iman'; Ibn Majah 0:57 'faith has sixty-some or seventy parts'; Muslim 1:72 + Ibn Majah 36:108 'three qualities... sweetness of faith'; Tirmidhi 40:18 'pleased with Allah as Lord... tasted faith'; Bukhari 2:26 + Muslim 1:117 'signs of a hypocrite are three')

**2. 🔴 HIGH · Dealing with doubts and waswas about Allah — the Prophet's protocol**
   - Where: New section inside the 'allah' article card (after Common Misconceptions), or a standalone card on the intro tab
   - Why: New Muslims (and teens) commonly get intrusive 'who created Allah?' doubts and think their faith is broken; the Sunnah gives an exact named remedy (say 'amantu billah', seek refuge, desist) that the page never mentions.
   - Size: topic · Kind: practical-guide
   - Sourcing: local-verified (Muslim 1:250, 1:252, 1:254 — men will keep questioning until 'who created Allah?' is asked, and the believer's response; fitrah pairing: Muslim 46:34, 46:37 and Tirmidhi 32:6 'every child is born upon the millah')

**3. 🔴 HIGH · Living with Qadr — does dua change the decree? striving, and responding to calamity**
   - Where: 3-5 new points plus 2 hadith blocks in the 'qadr' article card; optionally cross-link istikharah on /duas
   - Why: 'Does dua change qadr?' is one of the most-asked aqidah questions and the card's current points stop at the four levels + free will; the two most famous practical narrations are missing.
   - Size: points · Kind: deepen-existing
   - Sourcing: local-verified (Tirmidhi 32:7 'nothing turns back the decree except supplication, and nothing increases the lifespan except righteousness'; Ibn Majah 36:97 same theme from Thawban; Tirmidhi 37:102 Ibn Abbas 'Be mindful of Allah... the pens have been lifted and the pages have dried')

**4. 🟡 MED · Angels in your daily life — scribes, guardians, and angels praying for you**
   - Where: New sub-section or 5-6 additional points in the 'angels' article card, which is currently a who's-who name list
   - Why: The card lists named angels but never connects angels to the reader's own day (every word recorded, guardians in succession, throne-bearers seeking forgiveness for believers) — the part that changes behavior; the dog/image hadith is also a common family question.
   - Size: topic · Kind: deepen-existing
   - Sourcing: local-verified (Quran 50:17-18 two recording scribes; Quran 13:11 successive guardians; Quran 40:7 throne-bearers pray for believers; Quran 41:30 angels descend on the steadfast — all present in packages/content/quran/verses; Tirmidhi 43:77 + Ibn Majah 32:100 'angels do not enter a house in which there is a dog or an image')

**5. 🟡 MED · Ihsan — the third level of the religion (muraqabah)**
   - Where: New card on the intro tab after 'Islam vs. Iman' (which mentions Ihsan in a single clause)
   - Why: The Hadith of Jibril is the page's hero yet its third pillar, Ihsan ('worship Allah as though you see Him'), gets one sentence — a short card completes the hadith's own framework.
   - Size: points · Kind: deepen-existing
   - Sourcing: local-verified (Muslim 1:1 — already the page's hero hadith; scholarly elaboration from Sharh Usul al-Iman is generic)

**6. 🟡 MED · Jahannam (Hellfire) page to complete the Last Day 'go deeper' set**
   - Where: New route (e.g. /jahannam) mirroring /jannah; add a fourth 'Go deeper' link under the 'last-day' article card
   - Why: The go-deeper links cover Barzakh, Day of Judgement, and Jannah but there is no Hellfire counterpart anywhere in the app, leaving the warning half of the Last Day shallow.
   - Size: own-page · Kind: structural
   - Sourcing: scholarly-summary-generic (ample local anchors already on this page: Muslim 53:33 seventy thousand reins; Muslim 53:75 sun brought near; Quran 66:6)

**7. ⚪ LOW · Messengers article: cross-links to /prophets and /miracles**
   - Where: 'Go deeper' link cards under the 'messengers' article, same pattern as the last-day card
   - Why: The app already has full /prophets and /miracles pages but a reader on the messengers article has no path to them.
   - Size: points · Kind: structural
   - Sourcing: scholarly-summary-generic (pure navigation change, no new texts required)

---

### /pillars — 5 proposals (3 high)

_Current coverage: Three tabs: 'What are the Pillars?' (definition, Islam/Iman/Ihsan, five-pillar overview), 'Why They Matter' (5 points), and 'The Five Pillars' (sub-tabs for Shahada, Salah, Zakat, Sawm, Hajj — each with description, in-depth paragraph, points, verses, hadith, 2 misconceptions, sources). Solid overview altitude; deep dives for salah and fasting exist elsewhere (/salah, /ramadan) but are not linked, and zakat/hajj have no depth anywhere in the app._

**1. 🔴 HIGH · 'Go deeper' links from each pillar card to the app's existing depth pages**
   - Where: Link cards under each pillar card (same pattern as the last-day card on /articles-of-faith): salah → /salah + /prayer-times + /qiblah; sawm → /ramadan; shahada → /tawhid and /why-islam; hajj → /islamic-calendar (Dhul-Hijjah)
   - Why: The app already has full salah and Ramadan pages, but a reader on the pillars page hits a dead end — this is the cheapest, most visible win on the page.
   - Size: points · Kind: structural
   - Sourcing: scholarly-summary-generic (navigation only, no new texts)

**2. 🔴 HIGH · How to calculate your zakat — step-by-step practical guide**
   - Where: New SubTabLayout rail inside the zakat pillar (topics: Am I liable? nisab & hawl / What wealth counts / Worked example / Who can receive it / Zakat al-Fitr / FAQs: jewelry, retirement accounts, debts, giving to relatives); promote to its own /zakat route if it outgrows the rail
   - Why: Zakat is the only pillar with zero practical depth anywhere in the app, and 'how do I actually calculate it?' is the number-one zakat question for every working Muslim family.
   - Size: sub-tab · Kind: practical-guide
   - Sourcing: local-verified (Ibn Majah 8:11 'no sadaqah on less than five awsaq of dates, five awaq of silver, five camels'; Tirmidhi 7:10 same nisab thresholds; Bukhari 24:1 and 24:103 already cited on the page; Quran 9:60 recipients already on the page)

**3. 🔴 HIGH · Taking the Shahada — how to actually become a Muslim**
   - Where: New section in the shahada pillar card (or a rail topic), cross-linked from /why-islam 'Start Here'
   - Why: The card explains the shahada theologically but a person ready to convert finds no answer to 'what do I do, do I need witnesses, what about my past sins, what next?' — the app's core new-Muslim audience needs this.
   - Size: topic · Kind: practical-guide
   - Sourcing: local-verified (Tirmidhi 6:62 — Qais ibn Asim accepted Islam and the Prophet ordered him to perform ghusl with water and sidr; Muslim 1:228 — Amr ibn al-As deathbed narration that Islam wipes out what came before it; Muslim 1:37 already on the page)

**4. 🟡 MED · Hajj & Umrah companion — day-by-day rites, talbiyah, types of hajj, proxy hajj**
   - Where: Own route (/hajj) with SubTabLayout long-term (rites day-by-day, Umrah, types of hajj tamattu/qiran/ifrad, common mistakes, virtues); short-term add Umrah + proxy-hajj points and full talbiyah Arabic to the hajj pillar card
   - Why: The card describes the rites in one paragraph, Umrah is never mentioned anywhere in the app despite being far more commonly performed, and practical questions (hajj for a deceased parent, an infirm father) go unanswered.
   - Size: own-page · Kind: new-subtopic
   - Sourcing: local-verified (Tirmidhi 9:18 full talbiyah text; Bukhari 26:1 + Muslim 15:493 'Umrah to Umrah is expiation'; Abu Dawud 11:271 the Prophet's umrahs; Tirmidhi 9:122 hajj on behalf of a deceased mother; Ibn Majah 25:25 Abu Razin's aged father)

**5. 🟡 MED · Missed fasts, kaffarah, fidyah, and the six days of Shawwal**
   - Where: 4-5 additional points in the sawm pillar card, deduped/cross-linked against the /ramadan 'Fasting Guide' tab
   - Why: The card lists who is exempt but not the mechanics of making up (qada order and deadline, kaffarah for deliberate breaking, fidyah amounts) or the famous Shawwal follow-up fast — the questions people actually have in the month after Ramadan.
   - Size: points · Kind: deepen-existing
   - Sourcing: local-verified for Shawwal (Muslim 13:264 + Ibn Majah 7:79 'whoever fasts Ramadan then follows it with six of Shawwal'); the kaffarah narration (man who broke his fast through intercourse) was NOT located in the local corpus with the terms tried — verify locally or treat as needs-external-source before authoring that point

---

### /dhikr — 6 proposals (2 high)

_Current coverage: A tasbeeh counter tool, not a content page: 8 base counter cards (SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 34, tahlil 100, SubhanAllahi wa bihamdihi 100, istighfar 100, hawqala free, salawat 100) each showing Arabic, transliteration, one-line translation, and a bare hadith ref; users can add ~6 more short adhkar from the 14-entry catalog (src/lib/dhikr/catalog.ts), set goals, and counts sync with the Worship tab. One VerseHero (Quran 13:28) and a SourcesCard of bare refs. No virtue texts, no method/etiquette content, no sequences._

**1. 🔴 HIGH · Per-dhikr virtue text ('Why this dhikr'): the famous reward narrations behind each counter — two words light on the tongue, tahlil 100x = 100 slaves freed + Shaytan protection all day, hawqala is a treasure of Paradise, Alhamdulillah fills the Scale, 'the best dhikr is La ilaha illallah'**
   - Where: On each DhikrCard as a one-line virtue under the translation or an expandable info row (the card already renders a bare ref — replace with ref + virtue sentence); also enrich the SourcesCard descriptions
   - Why: The page tells users to count to 33/100 without ever telling them why — the motivating narrations are the heart of dhikr and are one sentence each.
   - Size: points (one virtue line per existing card + catalog entries) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 80:101 & 83:59, Muslim 48:41 two words light on the tongue; Bukhari 59:102 & Ibn Majah 33:142 tahlil 100x; Bukhari 80:79/80:104 hawqala treasure of Paradise; Muslim 2:1 & Tirmidhi 48:148 Alhamdulillah fills the Scale; Tirmidhi 48:14 best dhikr)

**2. 🔴 HIGH · Catalog expansion with famous countable adhkar: full tahlil ('…wahdahu la sharika lah, lahul-mulku…' 10x/100x), the paired 'SubhanAllahi wa bihamdihi, SubhanAllahil-'Azim', Dua of Yunus, Radeetu billahi rabban 3x, Bismillahilladhi la yadurru 3x, post-Fajr tahlil 10x before moving**
   - Where: New entries in DHIKR_CATALOG (src/lib/dhikr/catalog.ts) so they appear in the AddDhikrDialog; note the catalog's stated one-line-Arabic scope — the full tahlil runs two lines, a deliberate founder exception
   - Why: Practicing users looking for the highest-reward counted adhkar (100x tahlil, the paired tasbih) cannot add them today even though they are the most famous counter-style dhikr in the tradition.
   - Size: points (6-8 catalog entries) · Kind: new-subtopic
   - Sourcing: local-verified (Bukhari 59:102 & Abu Dawud 43:305 full tahlil; Bukhari 80:101 paired tasbih; Tirmidhi 48:136 Dua of Yunus; Abu Dawud 8:114 radeetu; Ibn Majah 34:43 bismillah-no-harm; Tirmidhi 48:105 post-Fajr tahlil while feet still folded)

**3. 🟡 MED · Guided sequences/presets: 'After every prayer' (Astaghfirullah 3x, Ayat al-Kursi, 33-33-34 + tahlil to 100) and 'Tasbih Fatimah before sleep' (33-33-34), auto-advancing card to card**
   - Where: Structural: a preset row above the card grid (or a 'Sequences' toggle) that chains existing dhikrKeys in order — reuses the shared counters so nothing double-counts
   - Why: The canonical use of a tasbeeh counter is the post-prayer and bedtime sequences, and today the user must manually hop between cards in the right order from memory.
   - Size: sub-tab (a presets/sequences affordance + 2 defined sequences) · Kind: structural
   - Sourcing: local-verified (Muslim 5:184 33/33/34 after prayer — already on page; Muslim 48:38 tahlil completion; Bukhari 80:15 Tasbih Fatimah at bedtime — already the catalog ref). The 'Allahumma antas-salam' post-salah dua was not spot-checked locally — verify before including it in the preset.

**4. 🟡 MED · 'How the Prophet counted' etiquette card: count on the fingers/fingertips 'for they will be made to speak' (Yusayrah), dhikr morning and evening, quietly within yourself, standing/sitting/lying down**
   - Where: One info ContentCard between the card grid and the SourcesCard (or an info sheet off the page header)
   - Why: Users of a digital counter reasonably ask whether/how counting was done in the sunnah, and the answer is a well-attested one-card teaching moment.
   - Size: points (1 card, 3-4 bullets) · Kind: new-subtopic
   - Sourcing: local-verified (Abu Dawud 8:86 & Tirmidhi 48:214 Yusayrah finger-counting; Quran 33:41-42, 7:205, 3:191 all confirmed in packages/content/quran/verses)

**5. 🟡 MED · Virtues-of-dhikr framing content: the Mufarridun hadith ('those who remember Allah much have raced ahead') and 'better for you than spending gold and silver' as a header/intro element**
   - Where: A second VerseHero-style rotation or a short intro card under the existing Quran 13:28 hero
   - Why: Two of the most beloved dhikr narrations in Muslim/Tirmidhi would give the page an emotional anchor beyond the single verse it has now.
   - Size: points (1-2 cards) · Kind: missing-narrations
   - Sourcing: local-verified (Tirmidhi 48:227 Mufarridun; Tirmidhi 48:8 better than gold and silver; Tirmidhi 48:7 superior in rank)

**6. ⚪ LOW · Istighfar card note: the Prophet's own practice — counted seeking forgiveness 100 times in a single sitting**
   - Where: A note/virtue line on the existing istighfar card (pairs with its 100 goal)
   - Why: Directly justifies the card's default goal of 100 with the Prophet's own counted practice.
   - Size: points (1 line) · Kind: missing-narrations
   - Sourcing: local-verified (Tirmidhi 48:65 'one could count that he said a hundred times… O my Lord forgive me and accept my repentance')

---

### /barzakh — 8 proposals (2 high)

_Current coverage: Four tabs: 'What is the Barzakh?' (prose intro), 'Why It Matters' (6 numbered points), 'What Happens' (rail: Departure of the Soul, Funeral & Burial, The Questioning, Believer's Experience, Disbeliever's Experience — largely the al-Bara' ibn 'Azib hadith plus Abu Dawud 42:158), and 'Protection' (rail: Deeds That Protect, Seeking Refuge, Signs of a Good Ending). Solid on the grave sequence itself; thin on the living's ongoing relationship with the dead and the classical soul-location questions. Note: /death-rites now covers janazah, visiting-grave etiquette, wailing, talqin, martyr categories and children who die — so those belong here only as points + cross-links._

**1. 🔴 HIGH · The Living & the Dead — what still reaches them (deeds that continue, charity and du'a on their behalf)**
   - Where: New 5th top tab 'Helping the Dead' (page has 4 of max 6), or a new topic in the Protection rail
   - Why: The single most-asked practical question by anyone who has lost a parent — 'can I still help them?' — is answered by three of the most famous hadith in the tradition and is currently absent (only glancingly present on /death-rites).
   - Size: tab (or topic) · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 25:20 'when a man dies his deeds end except three'; Bukhari 23:140 and Bukhari 55:19 charity on behalf of a deceased mother; Muslim 11:131 A'isha's report of the Prophet's du'a for the people of Baqi')

**2. 🔴 HIGH · Where the souls reside — martyrs as green birds, prophets alive in their graves, 'Illiyyin and Sijjin**
   - Where: New topic 'Where the Souls Go' in the 'What Happens' rail (after 'The Departure of the Soul')
   - Why: The classical Barzakh question — the page describes the grave experience but never says where souls actually are; martyrs' souls in green birds beneath the Throne and the Prophet passing Musa praying in his grave are famous texts practicing Muslims will look for.
   - Size: topic · Kind: new-subtopic
   - Sourcing: local-verified (Muslim 33:181 souls of martyrs in green birds; Muslim 43:216 'I passed by Musa as he was praying in his grave'; Quran 3:169 and 2:154 'do not say those killed in Allah's way are dead')

**3. 🟡 MED · The Prophet's dream of the Barzakh (Samura ibn Jundub) — punishments for the liar, the Quran-neglecter, the adulterer, the riba-eater**
   - Where: New topic in the 'What Happens' rail, or 3-4 points extending 'The Disbeliever's Experience'
   - Why: The page's only sin-specific punishments are urine and gossip; the long Bukhari dream hadith is the most vivid authentic depiction of Barzakh consequences for specific sins, and its comforting scenes (Ibrahim surrounded by the children of the people) balance the fear.
   - Size: topic · Kind: missing-narrations
   - Sourcing: local-verified (Bukhari 23:138, Samura bin Jundab's narration of the Prophet's dream)

**4. 🟡 MED · Munkar & Nakir — name and describe the questioning angels**
   - Where: 1-2 points in 'The Questioning' topic, 'What Happens' rail
   - Why: The two angels are famous by name to almost every Muslim, yet the topic leaves them anonymous; the same Tirmidhi hadith the page already cites for 'sleep like a bride' names them and describes them as black-blue.
   - Size: points (1-2 bullets) · Kind: deepen-existing
   - Sourcing: local-verified (Tirmidhi 10:107 'two angels, black and blue, one called Munkar and the other Nakir')

**5. 🟡 MED · Common Questions — cremation/unburied bodies, body or soul, how time passes, do the dead hear us, Quran recitation at graves, how the Barzakh ends**
   - Where: New topic 'Common Questions' in the 'What Happens' rail (or a 6th top tab 'Questions')
   - Why: New Muslims routinely ask what happens to those never buried (the intro asserts it in one clause without explanation), whether punishment touches body or soul, and whether the dead know about us — a sourced FAQ prevents them leaving for random websites.
   - Size: topic · Kind: practical-guide
   - Sourcing: scholarly-summary-generic (anchor points locally verifiable: Bukhari 23:93 deceased hears the footsteps; Quran 40:46 ongoing exposure; the body-or-soul and cremation answers are standard scholarly positions to summarize without invented citations)

**6. 🟡 MED · Children who die young — with Ibrahim in the Barzakh**
   - Where: 1 point in 'The Believer's Experience' topic + cross-link card to /death-rites (Children Who Die Young tab)
   - Why: Grieving parents landing on a Barzakh page need one comforting, sourced line — the dream hadith already shows the children of the people around Ibrahim — with full treatment delegated to the existing /death-rites tab.
   - Size: points (1 bullet + cross-link) · Kind: deepen-existing
   - Sourcing: local-verified (Bukhari 23:138, the tall man in the garden surrounded by children is Ibrahim with the children of the people)

**7. 🟡 MED · Structural: add go-deeper cross-links (/death-rites for the Funeral & Burial topic, /day-of-judgement for how the Barzakh ends)**
   - Where: ContentCard link cards in the house 'go deeper' pattern (as on /story-of-creation): one under the 'Funeral & Burial' topic, one at the end of the intro tab
   - Why: The Funeral & Burial rail topic now overlaps the comprehensive /death-rites page and the page never says how the Barzakh ends (second trumpet → resurrection) — both are one-card links to pages that already exist, and the page currently has zero outbound links.
   - Size: points (2 link cards) · Kind: structural
   - Sourcing: scholarly-summary-generic (no new content claims; links to existing verified pages)

**8. ⚪ LOW · Talqin — the family's role at the deathbed ('exhort your dying to say La ilaha illallah')**
   - Where: 1 point in 'Signs of a Good Ending' topic, Protection rail, cross-linking /death-rites (At the Bedside)
   - Why: The topic covers dying with the shahadah on one's lips but not the sunnah instruction to the family to gently prompt it — the actionable half of the same teaching.
   - Size: points (1 bullet) · Kind: deepen-existing
   - Sourcing: local-verified (Muslim 11:1 and 11:3 'Exhort to recite There is no god but Allah to your dying')

---

### /tawhid — 7 proposals (2 high)

_Current coverage: Four tabs: 'What is Tawheed?' (definition, Shirk as the opposite, 3-category overview), 'Why It Matters' (5 points), 'Three Categories' (Rububiyyah / Uluhiyyah / Asma-wa-Sifat cards with verses, hadith, and 'what violates this category'), and '99 Names of Allah' (bookmarkable grid from packages/content/names-of-allah.ts — each name has meaning, explanation, and one verse)._

**1. 🔴 HIGH · Shirk and its types — major, minor, and hidden, with modern examples**
   - Where: New 5th top tab 'Shirk' (page has 4 of max 6 tabs); topics: major vs minor shirk, amulets/charms, fortune-tellers & horoscopes, swearing by other than Allah, riya (showing off)
   - Why: The page repeatedly calls shirk the one unforgivable sin yet never tells the reader what counts as shirk in practice today — the single most obvious gap for every reader persona, especially parents fielding questions about horoscopes, evil-eye charms, and lucky objects.
   - Size: tab · Kind: new-subtopic
   - Sourcing: local-verified (Nasai 37:114 'whoever ties a knot and blows on it has practiced magic... whoever hangs up an amulet will be entrusted to it'; Ibn Majah 31:95 Zainab/Ibn Mas'ud amulet narration; Muslim 39:173 'he who visits a diviner and asks him about anything, his prayer [not accepted] forty nights'; Tirmidhi 20:13 + Musnad Ahmad 112 on swearing by other than Allah). Note: the famous qudsi hadith on riya ('I am the most self-sufficient of partners') was NOT found in the local corpus — needs-external-source for that one narration only.

**2. 🔴 HIGH · Virtues of La ilaha illallah — the card (bitaqah) hadith and the 100x tahleel**
   - Where: New card on the intro tab after 'What is Tawheed?', or 2 additional entries in 'Why It Matters'
   - Why: Two of the most famous and beloved narrations about the kalimah — the man whose single card outweighs ninety-nine scrolls of sins, and the daily 100x formula worth freeing ten slaves — are absent from the page dedicated to it.
   - Size: topic · Kind: missing-narrations
   - Sourcing: local-verified (Tirmidhi 40:34 + Ibn Majah 37:201 bitaqah hadith; Tirmidhi 48:99 + Ibn Majah 33:142 'whoever says one hundred times each day: la ilaha illallahu wahdahu...')

**3. 🟡 MED · Worship of the heart — love, fear, hope, and tawakkul as acts owed to Allah alone**
   - Where: New sub-section within the Uluhiyyah category card (currently one bullet: 'Love, fear, and hope in worship must be directed to Allah alone')
   - Why: Uluhiyyah is presented mostly through outward acts (prayer, sacrifice, dua) while classical treatments center the inner acts — this is also where reliance/tawakkul, a daily-life concept, belongs.
   - Size: topic · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (standard treatment in Kitab at-Tawhid and Ibn Uthaymeen's commentaries; anchor verses like Quran 65:3 and 2:165 should be verified against packages/content/quran/verses before authoring)

**4. 🟡 MED · Living by the Names — practical 'how to call on Allah by this name' layer for the 99 grid**
   - Where: Extend each entry in packages/content/names-of-allah.ts with an optional 'inLife'/'dua' field rendered in the existing inline detail card; plus one scholarly-note card atop the names tab (the enumerated 99-name list is a later compilation; the agreed-upon text is only the count, Bukhari 97:21)
   - Why: The grid explains what each name means but not what 'enumerating them' (the very hadith quoted at the top) looks like in worship and character — the practical half of the tab's promise.
   - Size: topic · Kind: deepen-existing
   - Sourcing: scholarly-summary-generic (Bukhari 97:21 already cited on the page; per-name guidance follows Ibn al-Qayyim/Ibn Uthaymeen treatments; any dua texts must be copied programmatically from packages/content)

**5. 🟡 MED · Tawassul and intercession — what is permissible and what crosses into shirk**
   - Where: New topic under the Uluhiyyah card (pairs with its existing 'using intermediaries in worship' violation), or a rail entry in the proposed Shirk tab
   - Why: The page condemns intermediaries but never teaches the permissible forms (by Allah's names, by one's own deeds, asking a living person to make dua) — practicing Muslims from varied backgrounds will look for exactly this distinction.
   - Size: topic · Kind: new-subtopic
   - Sourcing: needs-external-source (permissible-tawassul framework is standard in Majmu al-Fatawa; the three-men-in-the-cave hadith was not spot-checked in the local corpus and must be located/verified; Quran 7:180 is already on the page)

**6. 🟡 MED · Teaching Tawhid to a child — the Prophet's full advice to Ibn Abbas**
   - Where: Card at the end of the intro tab (or shared with the qadr addition on /articles-of-faith, cross-linked)
   - Why: Parents and teachers get the tradition's canonical child-facing tawhid text ('O boy, be mindful of Allah... if the whole nation gathered') in one place — it is arguably the most quoted aqidah hadith and appears nowhere on the page.
   - Size: points · Kind: missing-narrations
   - Sourcing: local-verified (Tirmidhi 37:102 — full narration present in packages/content/hadith/tirmidhi/37.json)

**7. ⚪ LOW · Cross-link the shahada's seven conditions from /pillars**
   - Where: One line + link in the intro tab's La-ilaha-illallah paragraph pointing to /pillars?tab=pillars&sub=shahada
   - Why: The seven conditions of the kalimah live on the pillars page; a reader studying tawhid never learns they exist.
   - Size: points · Kind: structural
   - Sourcing: scholarly-summary-generic (navigation only)

---

## Cross-page overlaps the critic flagged (build once, cross-link)

- Miracles of the Prophet (moon-splitting, water from fingers, food multiplication, weeping trunk) — proposed as [high] on prophet-muhammad, miracles, AND why-islam. Owner: /miracles (it is the page's entire missing category). prophet-muhammad and why-islam should each keep a 2-3 sentence framing card that cross-links.
- Prophecies duplication — the miracles auditor already flags ~10 entries repeated from /prophet-muhammad?tab=prophecies, and both pages propose adding more (Uhud martyrdoms, 'earth folded for me'). Owner: /miracles for the evidentiary prophecy catalog; prophet-muhammad keeps only biographically-framed highlights + link.
- Missed prayers / qada — proposed [high] on both salah and prayer-times. Owner: /salah; prayer-times gets a cross-link card from its times context.
- Prayer of the traveler (qasr/jam') — proposed [high] on both salah and prayer-times. Owner: /salah; prayer-times keeps only the 'how it changes your displayed times' angle + link.
- Forbidden prayer times — prayer-times [high] and salah [medium]. Owner: /prayer-times (it directly explains the existing Sunrise 'Not a prayer' card); salah cross-links.
- Responding to the adhan — salah [high], duas [medium], prayer-times [low]. Owner: /salah for the etiquette topic; /duas hosts the dua texts (adhan dua, between-adhan-and-iqamah) as entries; prayer-times only a link card.
- Post-salah adhkar — salah [high] (teaching) and dhikr [medium] ('After every prayer' preset) and duas (in-prayer essentials). Complementary, not duplicate: salah owns the explainer, dhikr owns the auto-advancing counter preset, duas owns individual texts — cross-link all three, write the content once.
- Sneezing etiquette — muslim-daily [high], duas [high], kids [medium], learn-arabic [medium]. Owner: /muslim-daily for the full etiquette; duas keeps the exchange as a dua entry; kids/learn-arabic keep age/language-scoped variants only.
- Bathroom/toilet etiquette — muslim-daily [high] and prophet-muhammad Daily Sunnah [medium]. Owner: /muslim-daily; prophet-muhammad drops it or links.
- New-clothes/dressing dua — duas [high], prophet-muhammad [medium], muslim-daily [low]. Owner: /duas for the text; muslim-daily's Dress & Appearance topic links to it.
- Deeds that reach the dead — proposed [high] on death-rites, barzakh, AND family ('After They Pass'). Owner: /death-rites ('What Reaches the Dead'); barzakh and family keep short sections that cross-link.
- Children who die young / miscarriage — family 'Losing a Child' [high], jannah [high], barzakh [medium]. Owner: /family (the pastoral home); jannah and barzakh keep one narration each + link.
- Widow's iddah and ihdad — marriage [medium] and death-rites [medium]. Owner: /marriage (family-law context); death-rites cross-links from the mourning topic.
- Milk-kinship (rada'ah) — marriage 'Who You Can Marry' [high] and family [medium]. Owner: /marriage; family cross-links from breastfeeding.
- Waswas / dealing with doubts — protection new tab [high], why-islam [high], articles-of-faith [high]. Owner: /protection ('Waswas & the Shaytan' tab holds the prophetic protocol); why-islam and articles-of-faith keep their doubt-framing angles but link to protection for the treatment.
- Qunut al-Witr text — salah Witr entry [medium] and duas [medium]. Owner: /salah inside the Witr topic; duas lists it as an entry linking back.
- Janazah dua text — salah [medium], duas [medium], and death-rites is the natural home. Owner: /death-rites; salah's janazah entry and duas cross-link.
- Moon sighting / when the month begins — islamic-calendar [high] and ramadan [high]. Owner: /islamic-calendar (applies to every month); ramadan keeps a short 'why communities differ' note + link.
- Taking the Shahada — why-islam 'Becoming Muslim' tab [high] and pillars [high]. Owner: /why-islam; pillars' Shahada card cross-links ('ready to take it?').
- Six days of Shawwal + missed fasts — ramadan [medium] and pillars [medium]. Owner: /ramadan 'After Ramadan'; pillars links.
- Tahlil 100x and its virtues — tawhid [high] and dhikr [high]. Owner: /dhikr (counter + 'why this dhikr' virtue text); tawhid cross-links from Virtues of La ilaha illallah.
- The Prophet's advice to Ibn Abbas — tawhid [medium] and prophet-muhammad 'how he taught' [low]. Owner: /tawhid (it is a tawhid text); prophet-muhammad references it.
- The Great Intercession — prophets [medium], day-of-judgement [medium], prophet-muhammad station [medium]. Owner: /day-of-judgement (Intercession topic); prophets and prophet-muhammad summarize + link.
- Protection dua over children ('U'idhukuma bi-kalimatillahi...') — family [high] and protection [medium]. Owner: /protection ('Protecting your children' routine); family cross-links from parenting.
- Eid walkthrough — ramadan 'Your first Eid' [medium] and salah 'Deepen Eid' [medium]. Owner: /salah for prayer mechanics; /ramadan owns the day-experience guide and links for the prayer itself.
