# App Store screenshots — v2

For the **6.9" iPhone** slot (1320×2868). Upload in filename order; the number
is the display order, and order carries real weight here.

| # | File | Why it is where it is |
|---|------|------------------------|
| 01 | ask-cited-answer | **The lead, deliberately.** After the app name, screenshot 1 is the strongest 4.3(a) signal there is. This frame shows an Ask answer with the citation card fully visible (Al-Buruj 85:11, Arabic + translation) — the app's central claim, proven rather than asserted. |
| 02 | hifz-path | Spaced-repetition path with due/locked states. Nothing template-derived has this. |
| 03 | hifz-review | The review mechanic itself — recall, then reveal. |
| 04 | home | What the app looks like when you open it. Placed 4th, not 1st: it opens on a cited verse rather than the commodity bundle, but the quick tiles are still Adhan/Qiblah/Hadith/Bookmarks, and leading with those is part of what produced the rejection. |
| 05 | reflections | Arabic, transliteration, translation and a citation in one frame. |
| 06 | circles | Private group accountability. |
| 07 | widgets | Six widget faces with live data — native work a wrapper cannot fake. |
| 08 | day-of-judgement | Depth of the written content. |
| 09 | quran-reader | The reader with continue-reading state. |
| 10 | more-topics | Breadth, in one glance. |
| 11 | daily-checklist | **Reserve — App Store accepts only 10 per size.** Kept in the set as a substitute if any of 01–10 is replaced. |

## Why prayer times and qibla are not in the first five

They are the commodity bundle for this category, and leading with them is part
of what produced the Guideline 4.3(a) "Design: Spam" rejection of build 20. The
widgets frame (06) covers both without framing the app as the category.

## Rules for any reshoot

- **Launch from the Home Screen icon, not from TestFlight.** A "◀ TestFlight"
  breadcrumb in the status bar marks it as a beta build; two of the first
  attempts had it.
- **Let Ask finish answering.** The citation cards render BELOW the message
  body, so a mid-stream capture shows an answer with no visible citation —
  which is the opposite of the argument the listing is making. The first
  attempt had exactly that.
- Keep the whole citation card inside the frame, bottom border included.

## Still owed

- `11-daily-checklist` reads "0 of 15 today" with nothing ticked, which looks
  like an app nobody uses. It is the reserve for that reason.
- `06-circles` shows a single member. A second member would demonstrate the
  feature rather than describe it.
- `04-home` shows "STREAK 1 days". The pluralisation is FIXED in the code
  (commit 6538697) but this capture predates it — build 22 was already archived.
  Retake if another build is cut; otherwise it is a minor blemish.
- Burn a caption into each. For 01: "Every answer cites a source you can open".

Superseded originals are in the session scratchpad, not committed.
