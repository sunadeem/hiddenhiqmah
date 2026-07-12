# Content Review Queue — generically-attributed claims

_From the IA-redesign content build (2026-07-11). **Every citation that shipped is
locally verified** — all 66 new hadith references resolve in `packages/content/hadith`
and the adversarial review sample-confirmed the texts support their claims; all ~17 new
Quran quotes are byte-identical to `packages/content/quran/verses`. The items below are
the points that could NOT be verified against local data, so they were stated with
generic attribution ("scholars state…") and NO citation — per the house rule that a
citation is never invented. Review each; options are: leave as-is, add an external
citation you trust, or remove._

## /salah (Ghusl + Jumuʿah)
1. Surah al-Kahf on Friday — the Friday-specific hadith (al-Hakim/al-Bayhaqi) isn't in local collections; worded as "widely practiced sunnah… graded authentic by many scholars." (The ten-verses-protect-from-Dajjal hadith IS cited — Abu Dawud, verified.)
2. Traveler exemption from Jumuʿah — the verified Abu Dawud hadith lists four exceptions; traveler added as the standard fiqh position, attributed to scholars.
3. "Missed Jumuʿah → pray Dhuhr 4 rakʿāt" — stated as mainstream consensus, no citation.
4. Latecomer rule (joined after rukūʿ of the 2nd rakʿah → complete as Dhuhr) — majority-fiqh inference, attributed generically.
5. "Last hour before Maghrib most likely for the Friday duʿā hour" — the specific narration not local; base hour-of-duʿā hadith IS cited (Bukhari, verified).
6. Hanafi vs Shafiʿi/Maliki on rinsing mouth/nose being fard vs sunnah in ghusl — standard madhhab positions, generic.
7. Friday ghusl "majority: emphasized sunnah; some held obligatory" — characterization generic; underlying hadith verified.
8. Washing the deceased is farḍ kifāyah — consensus attributed to mainstream scholarship; method hadith verified.

## /marriage (Married Life) + /family (Kinship)
9. Kindness/tenderness/foreplay guidance — classical + contemporary scholars, generic.
10. "Anal intercourse prohibition agreed upon by the four madhhabs" — the prohibition hadith IS verified (Abu Dawud); the consensus framing is generic.
11. Wudu recommended before sleeping/eating while junub — mainstream fiqh; the between-acts hadith IS verified (Muslim).
12. Modern contraception by analogy with ʿazl; no permanent sterilization without need — contemporary scholars, generic. (ʿAzl hadith of Jabir verified.)
13. "Life extended" in the kinship hadith read as barakah or literal — interpretive note, generic.
14. "The maternal aunt holds a station near the mother" — hadith not found locally; phrased without citation.
15. Cutting kinship ties "counted among the major sins" + boundaries-when-harmed guidance — generic.
16. PRE-EXISTING (not added by this build): "Marriage is half the faith" cited to Bayhaqi Shuʿab al-Iman 5100 — Bayhaqi isn't in local collections. Consider re-sourcing or generic attribution.

## /protection
17. The amulet-shirk hadith (Ahmad) wasn't local — REPLACED with a verified Nasai narration; no action needed, noted for completeness.
18. Saying māshāʾAllāh/bārakAllāh when admiring (Sahl ibn Hunayf incident) — not local; generic. (Evil-eye-is-real + precedes-qadar ARE verified — Bukhari/Muslim.)
19. Evil-eye washing procedure details — the command to bathe IS verified (Muslim); procedural description generic.
20. The three classical conditions of permissible ruqyah — attributed to scholars (classically Ibn Hajar's consensus report).
21. Ayat al-Kursi after each obligatory prayer — narration (Nasai al-Kubra/Tabarani, graded sahih by al-Albani) not in local data; framed as "graded authentic by scholars." (Before-sleep Abu Hurayrah story IS verified — Bukhari.)
22. Red flags for sorcerers posing as rāqīs — contemporary scholarly guidance, no citation.

## /prophet-muhammad (Māriyah al-Qibṭiyyah)
23. Gift from al-Muqawqis; accepted Islam; bore Ibrāhīm in 8 AH — seerah literature (Ibn Saʿd), generic.
24. Umm-walad vs freed-and-married scholarly difference — presented neutrally, generic.
25. Egypt-kinship hadith interpretation (Hājar + Māriyah) — the hadith itself IS verified (Muslim); the interpretive link generic.
26. Died during ʿUmar's caliphate, who led her janāzah — seerah literature, generic.
27. Wife ordinals 3rd–10th follow the file's pre-existing chronological order (standard seerah chronology).

## 99 Names dataset (notes, no action urgent)
28. The file's variant counts "Allah" as name 1 and omits al-Aḥad — one of the standard published renderings of the Tirmidhi list; others differ. Noted in case you ever want a variant note in the UI.
29. The 99-name enumeration appended to the Tirmidhi hadith is generally regarded as a narrator's compilation (al-Walīd ibn Muslim) — the base "Allah has ninety-nine names" hadith is verified (Bukhari/Muslim).
30. الماجد transliterated "Al-Maajid" (entry 66) to distinguish from المجيد "Al-Majid" (49) — spelling convention varies across publications.

## Round-2 additions (Jumuʿah timing, 2026-07-11)
31. Majority (Hanafi/Maliki/Shafiʿi) position that Jumuʿah's window = Dhuhr's window (zawāl → ʿAsr) — generic attribution. (Anas "immediately after midday" Bukhari 11:28 + Jabir Muslim 7:39 ARE cited, verified.)
32. Hanbali permission to hold Jumuʿah before zawāl — generic attribution. (Supporting narrations Bukhari 11:29 + Bukhari 11:63 / Muslim 7:41 ARE cited, verified.)
33. Definition of zawāl (sun passing zenith = start of Dhuhr's time) — standard fiqh definition, no single citation.

## Timeline reference completions (2026-07-12)
34. Grandfather's passing + Hilf al-Fudul now attributed to "Seerah — Ibn Hisham; Ibn Sa'd" (plain-text source rows, no hadith-collection citation exists). The other formerly ref-less events got verified local refs: Abyssinia (Bukhari 39:8; 62:46), Ka'bah rebuilding (Bukhari 63:54), Boycott (Bukhari 25:76; 63:107).

## Types of Death tab (/death-rites, 2026-07-12)
35. Madhhab difference on the janazah prayer for the battlefield martyr — generic attribution (Bukhari 23:98 locally supports "neither washed nor prayed over"; the per-school positions aren't citable from local data).
36. Reward-category martyrs (plague/drowning/childbirth…) "washed and prayed over normally" — standard fiqh inference stated as the practical distinction, no single quotable text.
37. Husn al-khatimah intro framing — summary consistent with existing content, no single citation.

## Children Who Die Young sub-view (2026-07-12)
38. ~~RESOLVED (2026-07-12)~~ — the daʿāmīs/garment hadith (Sahih Muslim 2635) was missing from the upstream dataset; the verbatim text (Arabic + English) was added by hand to the corpus as Muslim 45:198 from a sunnah.com-sourced mirror, with provenance documented in packages/content/hadith/MANUAL_ADDITIONS.md. The card now quotes it verbatim with a live citation.
39. "In today's terms" note on the martyrs list (plague → epidemics/pandemics generally; mabtun → fatal digestive-system illness) — contemporary scholarly extension, generic attribution.
