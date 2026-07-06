# Hidden Hiqmah — Master iOS Device-Test Plan (First Real-Device Pass)

This plan is ordered fix-then-verify. Do the **Pre-flight**, then run the **Keyboard bug debug playbook** first, then work down the priority-ordered test sections (Prayer-time accuracy is #1). Every test has tap-by-tap steps, an expected result, and a `file:line` code reference. Check the box only when the actual result matches expected.

> Legend: 🔴 known blocker to fix first · 🟠 high · 🟡 medium · 🔵 low · 📱 = **only** verifiable on a real device.

---

## 0. Pre-flight

### 0.1 Build, sign, install on a real iPhone
1. In Terminal: `npx cap open ios` (opens `apps/web/ios/App/App.xcworkspace` in Xcode).
2. Xcode → select the **App** target → **Signing & Capabilities** → enable **Automatically manage signing** → pick your Apple ID / development **Team**.
   - 🔴 If you see "Signing for 'App' requires a development team", that is the expected NC-1 state — the repo has **no `DEVELOPMENT_TEAM`** (`project.pbxproj:302`). Set the team here; you cannot install to a device without it.
3. Connect the iPhone via cable, unlock it, tap **Trust This Computer**.
4. In Xcode's run-destination dropdown, select your physical iPhone (not a simulator).
5. **Product → Run** (or the ▶ button).
6. On the iPhone, expect the black Hidden Hiqmah splash (1500ms) then the app.

### 0.2 Enable Developer Mode on the iPhone
- iOS 16+: after the first install attempt, go to **Settings → Privacy & Security → Developer Mode → On**, then reboot and confirm. Re-run from Xcode.
- First launch of a personally-signed app: **Settings → General → VPN & Device Management → [your Apple ID] → Trust**.

### 0.3 Enable Safari Web Inspector (needed for the keyboard playbook and pending-notification checks)
- On the iPhone: **Settings → Safari → Advanced → Web Inspector → On**.
- On the Mac: **Safari → Settings → Advanced → Show features for web developers**.

### 0.4 OS permission prompts to expect (verify the copy is correct)
The usage strings live in `apps/web/ios/App/App/Info.plist`. When each prompt appears, confirm the exact copy:
- **Location** (`Info.plist:50-51`, requested at `salah/page.tsx:1526` and from the Home dashboard): *"Hidden Hiqmah uses your location to show accurate prayer times and the Qiblah direction…"*
- **Motion / compass** (`Info.plist:52-53`, `salah/page.tsx:1558-1608`): *"Hidden Hiqmah uses the compass to point you toward the Qiblah."*
- **Microphone** (`Info.plist:54-55`, `HifzSession.tsx:194`): *"Hidden Hiqmah uses the microphone so you can record your Qur'an recitation…"*
- **Notifications** (requested when you toggle any notification switch, `NotificationsScreen.tsx:45`): standard iOS allow-notifications prompt.
- None of these should crash on first prompt (all usage strings are present). A missing string = instant crash, so a crash here is a red flag.

### 0.5 Fix-first before you start (see the blocker list)
At minimum, land the 🔴 **offline cold-start sign-out** fix (`AuthContext.tsx:74`) and the 🟠 **audio session** fix (`Info.plist` + `AppDelegate.swift`) before this pass, or expect Test 2 (offline) and Test 4 (audio) to fail hard.

---

## 1. Keyboard bug debug playbook 📱 (RUN FIRST — #1 known blocker)

**Symptom reported:** text inputs on device reportedly don't accept typed characters. This must be root-caused before other input-dependent tests (sign-in OTP, Ask composer, Hifz, city search) are meaningful.

### 1.1 Real-device repro
1. Cold-launch the freshly installed build.
2. You should land on the **sign-in screen** (mandatory account). Tap the **Email** field.
3. Type slowly on the on-screen keyboard.
4. Repeat on the OTP flow: tap **"Email me a sign-in code instead"** → the 6-digit code field **auto-focuses** (`SignInScreen.tsx:249`).
5. Also try the **Ask** composer and a **city search** field once signed in.
- [ ] Characters appear as typed in every field.
- [ ] The focused field stays visible above the keyboard (WebView shrinks via `KeyboardResize.Native`, `capacitor.config.ts`).
- [ ] No unexpected auto-zoom on focus (guarded by `maximum-scale=1` in `setup.ts`).

### 1.2 Attach Safari Web Inspector to the WKWebView
1. Keep the app foregrounded on the failing screen.
2. Mac **Safari → Develop → [your iPhone name] → Hidden Hiqmah (capacitor://localhost)** → click it to open the inspector on the live WKWebView.
3. In the console, run:
   - `document.activeElement` right after tapping the field — confirm it is the expected `<input>`/`<textarea>`, not `body` or an overlay.
   - Attach a probe: `document.activeElement.addEventListener('input', e => console.log('input', e.target.value))` then type. Watch for `input` events.
   - Check for an intercepting overlay: in **Elements**, hover the field and confirm nothing with a higher `z-index` sits on top capturing touches.
   - Check that `readOnly`/`disabled` are false and no `onKeyDown`/`onBeforeInput` handler calls `preventDefault()`.

### 1.3 Evidence that confirms **code bug** vs **Simulator/quirk**
- **Code bug (fixable):** `document.activeElement` is `body`/wrong element after tap (focus not landing); OR `input` events fire in the inspector but React state doesn't update (controlled-input handler dropping the value / `preventDefault`); OR an overlay element intercepts the tap; OR the field is `readOnly`. These reproduce identically on the Simulator.
- **Simulator quirk (not a real bug):** on the **Simulator only**, if "I/O → Keyboard → Connect Hardware Keyboard" is ON, the software keyboard never shows and taps do nothing — this does NOT reproduce on a real device. Rule this out by testing on the physical iPhone with the software keyboard.
- **Focus/scroll confound:** if the field accepts input but is hidden behind the keyboard so it *looks* dead, that is the SA2 layout issue, not a keyboard bug — see Test 6.

### 1.4 If it fails
Report `document.activeElement`, whether `input` events fire, and whether it reproduces on Simulator. That triages controlled-input vs focus vs overlay vs layout. Do not proceed to input-dependent tests until typing works.

---

## 2. Prayer-time accuracy 📱 (PRIORITY #1)

Prayer-time correctness is the app's top concern and currently the **three surfaces disagree** (Home card vs Salah tab vs scheduled adhan). Fix PT-1/PT-2/PT-3 first, then verify.

### 2.1 Home vs Salah vs adhan method consistency 🟠
1. Sign in. Settings → **Calculation method → Muslim World League**.
2. Note Fajr/Isha on the Home NextPrayer card.
3. Tap the card → **Salah → Prayer Times**. Compare each prayer time to Home.
4. Settings → Notification settings, enable adhan, note the next-prayer time.
- [ ] Home card, Salah tab, and the fired adhan all show the **same** times.
- 🟠 **Expected bug (PT-1):** the Salah tab shows ISNA regardless of the saved method. Ref: `salah/page.tsx:2109` vs `MobileHomeDashboard.tsx:139-144` & `notifications.ts:219-220`.

### 2.2 Hanafi Asr on denied + city-search paths 🟠
1. Settings → **Asr time → Hanafi (later)**. Note Home Asr.
2. iOS Settings → deny Location for the app. Reopen → **Salah → Prayer Times** (Makkah fallback). Compare Asr to Home.
3. Tap **Change Location**, search a city, select it, compare Asr.
- [ ] Asr is Hanafi (later) everywhere.
- 🟠 **Expected bug (PT-2):** fallback/city-search use aladhan without `&school`, giving earlier Shafi Asr (~30-60 min off). Ref: `salah/page.tsx:2131-2132, 2176-2177` vs `2163`.

### 2.3 Offline prayer times + offline method change 🟠 📱
1. Open the app with a GPS fix so location caches. Enable **Airplane Mode**. Force-quit and relaunch.
2. Verify the Home card shows your city's times; open Salah → Prayer Times, verify.
3. Tap the method picker (Settings2 icon) and switch method.
- [ ] Home and Salah show correct offline times; a method change recomputes locally.
- 🟠 **Expected bug (PT-3):** offline method change hits the network and shows "Could not load prayer times" (over stale old-method cards). Ref: `salah/page.tsx:2292-2297`.

### 2.4 Adhan reschedules after a settings change 🟡 📱
1. Enable adhan notifications; note the next adhan time.
2. Change calc method/Asr to one with a clearly different next prayer. **Do NOT force-quit** — background the app.
3. Wait for / inspect the next adhan (see Test 5.2 for `getPending()`).
- [ ] The pending adhan reschedules to the new time.
- 🟡 **Expected bug (PT-4):** no reschedule until a cold relaunch; it fires at the old time. Ref: `SettingsScreen.tsx:103-106`, `setup.ts:38`.

### 2.5 New-day offline Home card location 🟡 📱
1. Open with a GPS fix, then leave the app closed >24h. Enable Airplane Mode. After the date rolls over, open the app.
- [ ] Home card shows your actual city from cached coords.
- 🟡 **Expected bug (PT-6):** with >24h-stale location + no network it shows Makkah. Ref: `MobileHomeDashboard.tsx:121,170-172,207`.

### 2.6 First-run offline localization 🟡 📱
1. Reinstall (clears cache). Clear cached location. Enable Airplane Mode. Cold-launch and **grant** Location when prompted.
2. Read the prayer-card location label + times.
- [ ] Card computes today's times for your **actual GPS coordinates** offline (label may be coarse/blank).
- 🟡 **Expected bug (OFF-3):** stays "Makkah" because `computeTimes` is gated behind the network `reverseGeocode`. Ref: `MobileHomeDashboard.tsx:207-221`.

### 2.7 Dubai/Gulf method + High-latitude/DST sanity 🟡 📱
1. Select Dubai/Gulf method on Salah; compare Home vs Salah Isha (PT-5 divergence). Ref: `prayer-times.ts:34`.
2. Set the device to a high-latitude region, grant location; verify Fajr/Isha are **finite** (not blank) on Home and Salah.
3. Change the device date to just after a DST transition; reopen and compare Home vs Salah vs wall clock.
- [ ] Fajr/Isha finite; wall-clock times match device-local time across DST.

---

## 3. Auth & offline resilience 📱 (PRIORITY #2 — contains the top blocker)

### 3.1 🔴 Returning user cold-launch offline is NOT logged out (BLOCKER)
1. Sign in fully while online; confirm the Home dashboard loads.
2. **Force-quit** (swipe up from the app switcher).
3. Enable **Airplane Mode** (Wi-Fi + cellular off).
4. **Cold-launch** the app.
- [ ] App opens straight to the **signed-in Home dashboard** with the offline banner; Quran/hadith are readable.
- 🔴 **Blocker (OFF-1/AUTH-1):** if it bounces to the sign-in wall, `getUser()` failed offline → `signOut()` → mandatory gate locks the user out. Ref: `AuthContext.tsx:74-78`, `MobileShell.tsx:59`. **Fix before shipping.**

### 3.2 Mandatory sign-in gate (no guest path)
1. Fresh install → let splash clear → observe the first screen; try to swipe/tap past it.
- [ ] Opens directly to SignInScreen; **no** "continue as guest"/"skip"; no way to reach content. Ref: `MobileShell.tsx:59`.

### 3.3 Email OTP CODE sign-in end-to-end (the intended device path)
1. SignInScreen → "Email me a sign-in code instead" → enter a real email → "Email me a code".
2. Open Mail; confirm the email contains a **6-digit code** (not only a link).
3. Return, type the code, "Verify & sign in".
- [ ] Email contains a 6-digit code; entering it lands on Home.
- ⚠️ If the email contains **only a link and no code**, in-app sign-in is impossible — the Supabase magic-link template must include `{{ .Token }}` (dashboard config, AICHAT-3-adjacent AUTH-3). Verify in the Supabase dashboard before the pass.

### 3.4 Emailed LINK does NOT return to the app 🟡 📱
1. Repeat to receiving the email; this time tap the **link** instead of the code.
- [ ] Link opens Safari (site or a can't-open `capacitor://localhost` error); the app stays on the sign-in gate.
- 🟡 **Expected (AUTH-2/NC-5):** no deep-link return. Ref: `AuthContext.tsx:100-109`, `Info.plist` (no CFBundleURLTypes).

### 3.5 Forgot-password dead end 🟡 📱
1. Sign-in form → "Forgot?" → enter email → send. Open the email and tap the reset link.
- [ ] (After fix) an in-app 6-digit recovery-code step lets you set a new password.
- 🟡 **Expected bug (AUTH-4):** the link opens Safari and cannot return; no in-app reset. Ref: `AuthContext.tsx:187-192`, `MobileShell.tsx:23`.

### 3.6 Password sign-up / confirmation behavior 🔵 📱
1. "Create an account" → enter name/email/password → submit.
- [ ] Either signed in immediately (confirmations OFF) or told to confirm; if confirmed via link, you can then sign in with password. Ref: `AuthContext.tsx:145-183`.

### 3.7 Session survives force-quit + relaunch; sign-in has offline copy 🔵 📱
1. Sign in → force-quit → relaunch. Then lock, wait ~30s, cold-launch from lock screen.
- [ ] Both relaunches land signed-in with no gate (localStorage persistence). Ref: `supabase.ts:13-19`.
2. In airplane mode on the sign-in screen, attempt sign-in.
- [ ] (After fix) shows an offline banner + friendly message, not raw "Load failed". 🔵 OFF-5. Ref: `MobileShell.tsx:59`.

---

## 4. Audio (adhan + Quran recitation) 📱 (PRIORITY #3 — contains a high fix)

### 4.1 🟠 Silent switch mutes audio + lock stops it + no Now-Playing (root audio-session bug)
1. Flip the hardware **ring/silent switch to SILENT** (orange). Home → tap the **Adhan** quick tile.
- [ ] (Desired) adhan is audible even on silent (call to prayer must override mute).
- 🟠 **Expected bug (AUD-1/NC-3):** tile shows "Stop" and progress advances but **no sound**; flipping to ring makes it play. Ref: `MobileHomeDashboard.tsx:510`, `Info.plist` (no UIBackgroundModes/audio session).
2. Ring ON → play adhan → **lock the phone**.
- [ ] (Desired) audio continues while locked and the lock screen shows "Adhan — Call to Prayer" with working play/pause.
- 🟠 **Expected bug:** audio cuts out on lock and no lock-screen controls appear. Repeat with a Quran surah — same failure.

### 4.2 Mutual exclusion + no stale metadata on adhan⇄Quran switch 🔵
1. Ring ON. Open /quran/2, play verse 1 (mini-player shows surah/verse). Go Home, tap **Adhan**.
2. Tap Adhan again to Stop. Reopen a surah, play a verse. Expand the full "Now Playing" sheet after each switch.
- [ ] Quran stops instantly when adhan starts (no overlap); the full-sheet title always matches what's audible. Ref: `audioCoordinator.ts:20`.

### 4.3 Phone-call interruption desyncs the Quran UI 🟡 📱
1. Ring ON. Play a verse. From a second phone, call this device (or trigger Siri / play a video in another app).
2. End the call, return WITHOUT tapping the player. Look at the play/pause icon, then tap it once.
- [ ] (Desired) the mini-player shows Play (paused).
- 🟡 **Expected bug (AUD-2):** it still shows Pause (thinks it's playing); the adhan re-syncs correctly under the same test but Quran does not. Ref: `QuranAudioContext.tsx:226-236`.

### 4.4 Hifz playback overlaps the main Quran player 🟡 📱
1. Ring ON. Play a verse (persistent mini-bar active). Navigate to a Hifz session and tap Play.
- [ ] (Desired) only one recitation audible.
- 🟡 **Expected bug (AUD-3):** both play at once; adhan also fails to stop Hifz. Ref: `HifzSession.tsx:123-149`.

### 4.5 Offline Quran audio fails silently; adhan still plays 🟡 📱
1. Airplane Mode. Open a cached surah, tap play on a verse; wait ~5s. Then Home → tap the Adhan tile.
- [ ] Verse tap = no audio and (after fix) a brief "couldn't load — check connection" message, not a silent no-op; the adhan (local file) still plays. Ref: `QuranAudioContext.tsx:24,228` vs `AdhanAudioContext.tsx:24`. 🟡 AUD-5.

---

## 5. Notifications 📱 (PRIORITY #4)

### 5.1 Fresh-install adhan WITHOUT location first, sound + deep-link
1. Delete + fresh install → sign in → go straight to Settings → Notifications **without** opening Home/Salah. Toggle "Adhan at prayer time" ON, accept the prompt.
2. Expect the ~4s "Notifications enabled" preview to play the adhan. Force-quit, reopen, let the next prayer pass while backgrounded.
- 📱 **Check (NOTIF-1 currentState):** no adhan fires because `getCachedLocation()` was null. Open Home to grant location, wait (still nothing without force-quit); only a force-quit + relaunch starts adhan. Ref: `notifications.ts:218,377-386`, `MobileHomeDashboard.tsx:214`.
2b. Set the clock ~1 min before a prayer, lock the phone.
- [ ] The scheduled adhan fires while locked and plays the **custom 25s adhan.caf** (not the tri-tone). Tapping it opens **/salah**. Ref: `notifications.ts:236-245,410-424`, `ios/App/App/adhan.caf`.

### 5.2 64-cap tier protection + dead toggles (Web Inspector)
1. Enable everything implemented (Adhan x5, Pre-prayer, Today's verse/hadith/reminder, Streak, Jumu'ah).
2. Attach Web Inspector → console → `await Capacitor.Plugins.LocalNotifications.getPending()`.
- [ ] Total pending ≤ 61; adhan present ~8 days; engagement items capped at 6 combined and never reduce adhan; no duplicate ids. Ref: `notifications.ts:57,64,362-386`.
3. Enable Iqamah, Morning/Evening adhkar, Dhikr; re-run `getPending()`.
- 📱 **Check (NOTIF-3):** these produce **no** pending entries — 8 toggles are non-functional and should be hidden/marked "coming soon". Ref: `NotificationsScreen.tsx:107-216`.

### 5.3 Deep-link routing per type + cold-start tap
1. Tap Reminder → **/muslim-daily?tab=reminders**; Jumu'ah → **/quran/18**; Verse → **/**. Ref: `notifications.ts:307,325-328,286`.
2. Force-quit the app, wait for a notification, tap it from the tray to launch cold.
- [ ] Cold-start tap still deep-links (event retained via `retainUntilConsumed`). Ref: `LocalNotificationsHandler.swift:91`, `MobileShell.tsx:49-51`. (NC-4 refuted — this should work.)

---

## 6. Safe-area & keyboard layout 📱 (PRIORITY #5)

### 6.1 🟡 Sign-in screen top under the Dynamic Island (SA1)
1. On an Island iPhone (15/16 Pro), sign out, force-quit, cold-launch to "/".
2. Observe the top of the sign-in screen; navigate to the OTP/verify sub-screens and check top-left buttons.
- [ ] (After fix) top content sits fully below the Island (60px floor).
- 🟡 **Expected (SA1):** ~56px top pad sits marginally under the Island. Ref: `MobileShell.tsx:62`.

### 6.2 🟡 Ask composer vs keyboard + floating tab bar (SA2)
1. Ask tab → tap the input to open the keyboard → type → send → scroll the answer.
- [ ] Input sits just above the keyboard and is usable.
- 🟡 **Expected bug (SA2):** the Home/Circles/Ask/Quran/More pill bar floats directly above the keyboard over the composer while typing. Ref: `ask/page.tsx:290`, `MobileShell.tsx:145-151`.

### 6.3 🟡 Onboarding WelcomeSheet top clearance (SA3)
1. Trigger first-run onboarding; check the Back/Skip row clears the status bar/Island.
- [ ] (After fix) ≥60px clearance. Ref: `WelcomeSheet.tsx:126`.

### 6.4 Sticky headers stay pinned through page transitions (regression guard) 📱
1. Quran tab → scroll surah list → confirm the sticky search/filter header stays pinned. 2. Open a surah → scroll → reader top bar stays pinned. 3. Open /muslim-daily → scroll → period header pins.
- [ ] Each sticky header stays glued during/after the fade transition (opacity-only wrapper must not introduce a transform ancestor). Ref: `MobileShell.tsx:124-137`, `QuranReaderNative.tsx:279`.

### 6.5 Now-Playing sheet + Circle chat composer respect both insets 📱
1. Expand the full Now-Playing sheet: top controls clear the Island, bottom transport clears the home indicator.
2. Circles → open a circle → chat → tap the message field: composer rises above the keyboard, Send never hidden. Ref: `MobilePlayer.tsx:201,277`, `CircleChatSheet.tsx:202,284`.

### 6.6 Home + status bar baseline 📱
1. Cold-launch to Home; first card fully visible below the Island on first frame; status-bar text light/legible over black; rotate to landscape briefly. Ref: `MobileTopBar.tsx:41`, `capacitor.config.ts:15-19`.

---

## 7. Quran reader 📱 (PRIORITY #6)

### 7.1 Auto-scroll follows the playing verse + performance under playback 🟡
1. Quran → Surah 2, View=Mushaf. Play verse 1, let it auto-advance; while playing, try to scroll/read ahead.
- [ ] Each verse smooth-scrolls to center with gold tint; scrolling stays smooth.
- 🟡 **Watch (QR-1):** stutter, laggy touch, skipped highlight frames on long surahs. Ref: `QuranReaderNative.tsx:220-224, 341-353`.

### 7.2 ?v= deep-scroll lands on the right verse 🟡 📱
1. Open **/quran/2?v=255** (via a bookmark, "Open Surah", or Continue Reading). Don't scroll; observe where it settles after the Arabic font renders.
- [ ] Ends centered on verse 255.
- 🟡 **Expected bug (QR-2):** settles near the top / several verses off after the font + word-span reflow (worst on a cold open). Ref: `QuranReaderNative.tsx:120-130`.

### 7.3 Focus mode: swipe nav, immersive chrome, pause→navigate→play 🟡
1. Set View=Focus → confirm the tab bar is gone → swipe to move ayah → tap center Play → swipe while playing (recites the moved-to ayah).
2. Play verse 5, pause via the **pill**, swipe to verse 8, tap the **pill** play; then repeat and tap the **center** button instead.
- [ ] Center button plays verse 8 correctly.
- 🔵 **Expected bug (QR-4):** the pill resumes verse 5 while the screen shows verse 8 with no highlight. Ref: `QuranReaderNative.tsx:544, 212-217`.

### 7.4 Focus↔Mushaf place retention + edge-swipe conflict 🟡 📱
1. Mushaf → scroll to ~verse 100 (no audio) → switch to Focus (shows ~100) → switch back to Mushaf.
- 🟡 **Expected bug (QR-3):** Mushaf jumps to verse 1. Ref: `QuranReaderNative.tsx:182-192`.
2. In Focus, swipe left-to-right from the **extreme left edge** intending previous ayah.
- 🟡 **Expected bug (QR-5):** the edge-origin swipe navigates back to /quran instead of moving one ayah. A mid-screen right-swipe should correctly go to the previous ayah. Ref: `MobileShell.tsx:77-94`, `QuranReaderNative.tsx:568-574`.

### 7.5 Word-by-word highlight sync (incl. mismatch verses) 🔵
1. Turn on Transliteration. Play Surah 1:7 (both Arabic + translit track). Then play **11:21** and **37:130**.
- [ ] 1:7 highlights advance in both.
- 🔵 **Expected bug (QR-7):** 11:21 stalls after the 2nd word; 37:130 highlights nothing at the end (27 verses have a timestamp/word count mismatch). Ref: `QuranReaderNative.tsx:52-74`.

### 7.6 Continue Reading resume (playing vs stopped) 🔵 📱
1. Mushaf: play from v1, auto-advance to ~v50. While playing, go Home → "Now playing" points to the current verse. Return, tap **X** to stop, go Home again.
- 🔵 **Expected bug (QR-6):** after stopping, Continue Reading reverts near v1 rather than v50. Ref: `quran/page.tsx:361-372`, `QuranReaderNative.tsx:143`.

### 7.7 Bottom content clears the floating player + single back button 📱
1. Focus + Mushaf with audio playing: verify no content is clipped behind the pill/last verse. 2. Confirm exactly ONE back control in the reader (no double chevron). Ref: `routes.ts` OWN_HEADER_PATTERNS, `QuranReaderNative.tsx:333,561-563`.

---

## 8. Ask Hiqmah (AI chat) 📱 (PRIORITY #7)

### 8.1 Happy path buffered answer + citations
1. Sign in → Ask tab → "What are the five pillars of Islam?" → send.
- [ ] Status pill cycles Thinking → Searching → Preparing; a **complete** answer appears at once (buffered, not token-by-token); no `[[cite:N]]`/`[[link:…]]` markers; citation cards + link chips render; not cut off. Ref: `AskHiqmah.tsx:274-297`, `route.ts:805`.

### 8.2 🟡 Offline + quota show clean messages (currently expected to FAIL)
1. Airplane Mode → Ask → send any question.
- [ ] (After fix) "You're offline. Ask Hiqmah needs an internet connection…"
- 🟡 **Expected bug (OFF-2/AICHAT-1):** generic "I apologize, I was unable to process your question." Ref: `ask/page.tsx:140-146` vs `AskHiqmah.tsx:208-211,512-515`.
2. Ask 15 questions in 24h (5 if signed out), send the 16th.
- [ ] (After fix) "You've used your 15 free questions… next slot opens in Xh" + upgrade note.
- 🟡 **Expected bug:** same generic message (server returns 429; client drops it). Ref: `route.ts:581-586`.

### 8.3 🟡 Long/broad answer not truncated by platform timeout 📱
1. On cellular/throttled network: "Explain in detail the major and minor signs of the Day of Judgement with sources." Wait through the full status sequence.
- [ ] A full answer with citations arrives.
- 🟡 **Watch (AICHAT-2):** ~10-15s spinner then a generic error with no content = serverless function killed mid-stream (native buffered path saw no answer event). Note elapsed time. Fix: add `maxDuration` to `route.ts:530`.

### 8.4 Citation navigation, keyboard, persistence
1. Tap a Quran citation card → lands on /quran/{surah} at the cited verse; edge-swipe-back returns to Ask (AICHAT-4 refuted — one swipe should suffice). Ref: `ask/page.tsx:240-243`.
2. Keyboard does not cover the input; no auto-zoom. Ref: `ask/page.tsx:287-291`.
3. Ask a question, background ~30s, reopen → prior Q/A + cards restored; trash icon clears. Ref: `AskHiqmah.tsx:37-46`.

---

## 9. Native / Capacitor smoke 📱 (PRIORITY #8)

- [ ] **Location prompt** (allow + deny): allow populates prayer times/compass, deny shows graceful message; no crash. Ref: `salah/page.tsx:1526`.
- [ ] **Compass/motion**: hold flat, rotate 360°; needle tracks heading; no crash. Ref: `salah/page.tsx:1558-1608`.
- [ ] **Microphone (Hifz Record)**: prompt shows correct copy; record → stop → playback works; deny shows message; no crash. Ref: `HifzSession.tsx:194-205`.
- [ ] **Edge-swipe-back** from a detail page navigates back with a light haptic; doesn't hijack horizontal-scroll rows. Ref: `MobileShell.tsx:76-94`.
- [ ] **Background audio** (NC-3): recitation stops on lock unless the AUD-1 fix is applied — re-verify after fixing.
- [ ] **App-resume reschedule** (NC-2): after fix, backgrounding + reopening (no force-quit) after a method/location change reschedules adhan; before fix it does not. Ref: `MobileShell.tsx:44-46`.
- [ ] **Splash** (NC-7, refuted): black splash → black webview → content, no white flash. Cosmetic only.

---

## 10. "If something fails" triage

- **Keyboard (can't type):** Use §1.2 — if `document.activeElement` is wrong or an overlay intercepts → focus/z-index code bug; if `input` events fire but React doesn't update → controlled-input handler; if it only fails on Simulator with a hardware keyboard connected → Simulator quirk, not a bug.
- **Prayer times disagree across screens:** almost certainly PT-1 (Salah `ptMethod` hardcoded) and/or PT-2/PT-3 (aladhan fallback drops `school`/coords). Fix the Salah picker to read/write `getPrayerSettings()` and thread `&school`. Recompute always uses the offline `computePrayerTimes` engine.
- **Locked out offline / bounced to sign-in on cold launch:** OFF-1/AUTH-1 — the `getUser()` force-signout. This is the blocker; guard on retryable/network errors before shipping.
- **No adhan sound / audio stops on lock / no lock-screen controls:** AUD-1/NC-3 — missing `UIBackgroundModes:audio` + `.playback` AVAudioSession. One-time native fix in `Info.plist` + `AppDelegate.swift`.
- **Adhan fires at the wrong/old time:** PT-4 (Settings change doesn't reschedule) and/or NC-2 (no resume listener; 10-day window drains). Wire `rescheduleNotificationsDebounced` into `updatePrayer` and add an `appStateChange` listener.
- **Email links don't open the app (magic/reset/confirm):** AUTH-2/NC-5/AUTH-4 — `capacitor://localhost` redirects with no URL scheme. Use OTP-based flows on native (sign-in already works; add recovery-OTP for reset) or register a deep-link scheme + `appUrlOpen` handler.
- **Ask shows generic error offline/at quota:** OFF-2/AICHAT-1 — `/ask` `onError` ignores the reason. Share the message-building helper between the web float and AskPage.
- **Ask spinner then empty error on long answers:** AICHAT-2 — add `maxDuration` to the route and confirm the Vercel plan/Fluid-compute default.
- **Content/font missing offline:** should not happen — fonts (Amiri) and Quran/hadith are bundled; if Arabic falls back to a system face or content spins forever, check that the `_next/static/media` woff2 and content chunks synced into `ios/App/App/public`.
- **Layout clipped under the Island / pills over the keyboard:** SA1/SA2/SA3 — apply the `max(env(...),60px)` floor and hide bottom chrome on keyboard open.
- **Quran reader jank / wrong scroll / lost place / swipe kicks you out:** QR-1/QR-2/QR-3/QR-5 respectively — memoize VerseBlock, gate deep-scroll on font+word-data, restore place on Focus→Mushaf, and `stopPropagation` the Focus swipe.