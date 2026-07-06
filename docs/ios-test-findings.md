# iOS device-test findings (2026-07-02)

Triaged from the first real-device pass. Tags: `[Bug]` `[Enh]` `[Q]`.
⚠️ = likely tied to code we just shipped (regression or incomplete fix).

## 🏠 Home / "Your Path Today"
- [x] **HOME-1** `[Enh]` Daily-streak + prayer-streak cards need a visible affordance (arrow) that they're tappable.
- [x] **HOME-2** `[Bug]` Classic home style loses the Daily Checklist entirely — no way to reach it. (see NAV-2)
- [x] **HOME-3** `[Enh]` Tapping "Tuned for" on Home should open Settings **and** scroll to the Tuned-for section.
- [x] **HOME-4** `[Bug]` "Today's reflection" on Your Path Today should open the reminder (in Daily Checklist), not the checklist itself.
- [x] **HOME-5** `[Bug]` The Adhkār card on Your Path Today should open the Worship tab, not the checklist.
- [x] **HOME-6** `[Q]` Does "Your Path Today" ever advance, or does it stay on the first item forever?

## ✅ Daily Checklist
- [x] **CHECKLIST-1** `[Bug]` Everything is duplicated (each item shows twice).

## 📿 Dhikr
- [x] **DHIKR-1** `[Enh]` Haptic (vibration) feedback on tap.
- [x] **DHIKR-2** `[Bug]` Resetting a dhikr also wipes the lifetime total — need separate "reset today" vs "reset lifetime."
- [x] **DHIKR-3** `[Bug]` Dhikr-stats period labels are off by one: the **Week** tab shows "RECITATIONS THIS MONTH" and the **Month** tab shows "RECITATIONS THIS YEAR" (the count label doesn't match the selected range; chart granularity vs label are mismatched). (confirmed in screenshots)
- [x] **DHIKR-4** `[Enh]` Add-dhikr picker: drop the search (few options now), show a total count / scroll hint, and make it multi-select.

## ⏰ Reminders
- [x] **REMIND-1** `[Bug]` Large empty space below cards — height should be per-card, not fixed to the tallest card.

## 🤖 Ask Hiqmah
- [x] **ASK-1** `[Bug]` ⚠️ Tapping the input pops the keyboard **and** a menu (bottom chrome). (related GLOBAL-2)
- [x] **ASK-2** `[Bug]` No initial greeting shown.
- [x] **ASK-3** `[Bug]` ⚠️ An active audio player overlaps the composer / text box.
- [x] **QURAN-4** `[Bug]` "Ask the tutor about this word" opens Ask Hiqmah but doesn't pre-fill or submit the question. (also listed under Quran)

## 📖 Quran reader / audio
- [x] **QURAN-1** `[Bug]` Small stutter on the surah→surah autoplay transition.
- [x] **QURAN-2** `[Bug]` Tapping "next ayah" stops the word-by-word Arabic highlighting.
- [x] **QURAN-3** `[Bug]` At some point the next-ayah view stopped appearing — it just kept reciting the next one.
- [x] **QURAN-4** `[Bug]` "Ask the tutor about this word" → Ask Hiqmah without pre-typing/submitting.
- [x] **AUDIO-1** `[Bug]` ⚠️ Lock-screen player shows an empty artwork square (no app logo). Likely from the `icon.svg` we deleted — MediaSession artwork still points at it. (confirmed in lock-screen screenshot)
- [x] **AUDIO-2** `[Bug]` ⚠️ Now-Playing goes stale: lock screen / Dynamic Island / Control Center show the track for a second, then flip to paused/blank while audio keeps playing. Likely verse-transition (each āyah is short) or a spurious `pause` event flipping `playbackState`, or the session not kept current across rapid verse changes. Related to the AUD-2 listeners.

## 🧠 Hifz
- [x] **HIFZ-1** `[Enh]` Show elapsed time while recording.
- [x] **HIFZ-2** `[Q]` Recording size limit? Where are recordings stored, and can users access them later?
- [x] **HIFZ-3** `[Enh]` Don't hard-block extra reviews — allow more with a gentle "are you sure? little-by-little is better" nudge.

## 👨‍👩‍👧 Family
- [x] **FAMILY-1** `[Bug]` Switching profiles still shows the previous user's streaks / dhikr / worship — each profile should be fully isolated.
- [~] **FAMILY-2** `[Q/Enh]` Parental control — DROPPED (switch-only PIN not worth it; iOS Screen Time covers whole-app locking).
- [x] **FAMILY-3** `[Enh]` Replace the profile icons with something more aesthetic (or just words).

## ⚙️ Settings / Profile
- [x] **SETTINGS-1** `[Bug]` ⚠️ "Edit profile" zooms in on tap — should never zoom (native input-zoom).
- [x] **SETTINGS-2** `[Enh]` "Continue reading" reminder should be ON by default.
- [x] **SETTINGS-3** `[Enh]` Make Home Style its own Settings section, with Style + "Tuned for" nested under it.
- [x] **SETTINGS-4** `[Enh]` Improve the Light theme.

## 🧭 Navigation / More menu
- [x] **NAV-1** `[Enh]` More-menu order: **My Path in Islam** (top) → **Settings** → then the website/content list, with a hard separator between them.
- [x] **NAV-2** `[Enh]` Add the Daily Checklist into the "My Path in Islam" section (ties to HOME-2).

## 📜 Hadith
- [x] **HADITH-1** `[Bug]` Two back buttons on a hadith page (global back + "Back to Sahih al-Bukhari").

## 🔔 Notifications
- [x] **NOTIF-1** `[Bug/Q]` Permission was only requested after enabling a notification — should ask right after location. Would none have sent otherwise? (confirm the gating)
- [x] **NOTIF-2** `[Q]` How do I actually trigger notifications to fire (for testing)?

## 📳 Global
- [x] **GLOBAL-1** `[Enh]` Haptic feedback on most counter buttons.
- [x] **GLOBAL-2** `[Bug]` ⚠️ On every screen, opening the keyboard pushes the bottom menu/tab bar up over it (should stay put/hidden). Related to ASK-1 / ASK-3 — the SA2 fix only covered /ask.

## 🔔 Batch 7 — notifications overhaul + first-time page tips (2026-07-06, commit 0f68e25)
Post-findings enhancements requested after batches 1–6.
- [x] **B7-1** `[Bug]` Adhan never fired at prayer times (other notifs did): prayer block was gated on a cached location only written on reverse-geocode success (Nominatim fails often on-device). Now caches GPS coords unconditionally.
- [x] **B7-2** `[Enh]` Adhan notifications default **OFF** (`adhanEnabled: false`) so they never play unexpectedly.
- [x] **B7-3** `[Bug]` "Today's Hadith" push had an empty body — `dailyInspirations` is Qur'an-only. Now draws the daily hadith from the hadith-sourced reminders; verse + hadith schedule independently.
- [x] **B7-4** `[Enh]` Prayer title = prayer · city · **time** (e.g. "Maghrib · Toronto · 7:12 PM").
- [x] **B7-5** `[Enh]` Per-prayer authentic reminders as the adhan body, verified against the local hadith corpus — Fajr (Muslim 657), Asr (Bukhari 552), Isha (Muslim 656) prayer-specific; Dhuhr (Tirmidhi 478) + Maghrib (Bukhari 528) general-virtue (⚠️ no fard-specific hadith for those two — revisit copy if desired).
- [x] **B7-6** `[Q]` "Enabled confirmation" fires once, when a user flips a Notifications-screen toggle while OS permission is still undetermined and then grants it (usually pre-resolved by onboarding, so rarely fires). Copy made generic; no longer previews the 25s adhan.
- [x] **B7-7** `[Enh]` First-time per-page tips (`PageTip`, one-shot localStorage flag, native-only, post-onboarding). Live on Quran (Focus mode), Dhikr, Hifz, Circles, Daily. Ask skipped (already has a greeting).
