# Quran Reader + List — Redesign Build Spec

Status: **locked, ready to build (reader first)** · Direction: native mushaf reader
Scope decision: **native-only** (website keeps current Quran pages); branch presentation inside the shared components, reuse all audio/tafsir/data logic.

---

## 1. Gating
- New experience renders only on native (`useIsNative()` / `isNativeApp` already in the reader). Web `/quran` + `/quran/[id]` unchanged.
- Do NOT fork the reader — branch the *presentation* inside `apps/web/src/app/quran/[id]/PageClient.tsx` (and `/quran/page.tsx` for the list). All data loading, audio, tafsir, words/timestamps, search stay shared.

## 2. Reader view modes (user-toggleable)
- **Mushaf (default):** continuous reading surface, minimal chrome — verse number as a small gold marker, prominent Arabic, hairline between verses; tap a verse → reveal its actions (play / tafsir / bookmark / share). Slim top bar (back · surah name+sub · settings) + the existing floating player.
- **Focus:** immersive one-āyah-at-a-time, large Arabic, swipe to advance, tap to reveal controls.
- A control in the top bar / settings sheet switches Mushaf ↔ Focus. Persisted.

## 3. Display options (independent toggles, any combination, persisted)
- **Arabic**, **Translation**, **Transliteration** — each on/off independently (not single-select). Default: Arabic + Translation on, Transliteration off.
- Persist in localStorage (new pref, e.g. `quranDisplay {arabic,translation,translit}` + `quranView 'mushaf'|'focus'`). Add to `packages/ui/lib/storage.ts` alongside `getFontSize`/`getAutoPlayNextSurah`.
- Focus mode: Arabic always shown; translation/translit optional.

## 4. Highlighting (during playback)
Data: `words/{surah}.json` = per verse `[{t:arabic, tr:translit, m:gloss}]`; `timestamps/{surah}.json` = per verse `[[start,end],…]` aligned to the words array.
- **Current āyah** highlighted in every shown block (Arabic / translation / transliteration).
- **Current word** highlighted in **Arabic** (existing) and **Transliteration** — render transliteration from the per-word `tr` array (not the flowing `textTranslit`) so the active word can be highlighted in sync.
- **Flowing translation** (Saheeh Int'l, `textEn`) = **āyah-level only** (no per-word alignment). The per-word `m` gloss is reserved for a possible future "word-by-word" study mode.

## 5. Autoplay / player / lock screen — REUSE existing
- `QuranAudioContext` already: sets `autoPlayRef`, auto-advances āyah→āyah while playing, advances to next surah gated on `getAutoPlayNextSurah()` (the player's "auto-play surah" toggle), exposes `skipNextSurah`, `setAutoPlay`.
- Persistent `MobilePlayer` (mini + full sheet) lives in `MobileShell` → playback continues across navigation + when browsing away. Media Session API drives lock-screen controls. (Verify the new reader uses the same `playVerse`/`playSurah` from the context — it already does.)
- New reader just renders against `playingVerse` / word timing from the context; no audio-engine changes needed.

## 6. Surah list (`/quran`, native-gated)
- **Remove the Meccan/Medinan filter chips.**
- Keep search (already search-only-sticky on native).
- Add a **Continue-reading hero** (last position from `getProgress()` → surah + verse, deep-links into the reader).
- Native **list rows** (number badge, name, meaning · verses · revelation, Arabic name, a "reading" marker for the in-progress surah) instead of the bordered card grid.

## 7. Build order
1. **Reader — state + chrome:** add `quranView` + `quranDisplay` prefs (storage) + a settings control (top bar / sheet); native-gated top bar replacing the PageHeader hero + pill chips + controls row.
2. **Reader — Mushaf rendering:** continuous verses, display toggles, āyah highlight, tap-to-reveal actions; reuse audio.
3. **Reader — word highlight:** Arabic (existing) + transliteration (from per-word `tr` + timestamps).
4. **Reader — Focus mode:** single-āyah immersive view + swipe + tap-to-reveal.
5. **List:** drop filters, add continue-reading hero + native rows.
6. Build + device test (audio sync is the device-only part).

## Open notes
- Flowing-translation highlight is āyah-level by design (word-level needs the gloss/word-by-word mode — future).
- Prototype reference: `quran-redesign-preview.html`.
