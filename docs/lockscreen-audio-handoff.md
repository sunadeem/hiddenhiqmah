# Handoff: iOS lock-screen "Now Playing" bugs for Qur'an audio

**Status:** unsolved after 3 attempts. Audio code has been **reverted to the known-good baseline** (surah autoplay works; lock-screen still buggy). Goal: make the iOS lock-screen / Control Center / Dynamic Island "Now Playing" panel behave correctly for Qur'an recitation, **without** regressing in-app playback, verse/surah autoplay, or word-by-word highlighting.

> **Critical constraint:** the assistant cannot test on the device. The **user is the only tester** — every change requires them to `pnpm build:mobile` → `cap sync` → Xcode run → **delete app + clean reinstall** → observe. So: do not ship a stream of untested guesses. Produce a *well-reasoned* fix (or a small number of ranked candidates) with a clear on-device test protocol. Depth of iOS-specific reasoning matters more than breadth.

---

## The app

Hidden Hiqmah — Islamic content app. **Next.js 16 static export → iOS via Capacitor 8.** Monorepo: `apps/web` + `packages/ui` + `packages/content`. React 19, TS, Node 22 (nvm), pnpm/Turborepo.

- Web + native share ONE static export. Build for mobile: `pnpm build:mobile` (= `BUILD_TARGET=mobile`, emits `apps/web/out/`), then `cd apps/web && npx cap sync ios`.
- The device runs the **bundled** assets from `apps/web/ios/App/App/public/` (content-hashed chunks; no live-reload server configured, so cache-staleness is unlikely once a fresh build is installed). Confirmed the user's build IS fresh (splash-size change showed up on their clean reinstall).
- Audio files: streamed MP3 from `https://cdn.islamic.network/quran/audio/128/ar.alafasy/{globalVerseId}.mp3` (external CDN, per-āyah files, cacheable).

---

## Exact symptoms (verbatim from the user, on a real iPhone)

1. Play an āyah, then **lock the phone → NO Now-Playing player appears**, though audio IS playing.
2. It **sometimes appears** — e.g. after you pause, play again, then lock. And it appears **when the next āyah starts** (autoplay transition).
3. When it does appear, it shows as **"Paused" while audio is actually playing**, and the **elapsed time IS advancing**.
4. Tapping **"next" on the lock screen → two different āyāt play** (overlap): the current one keeps playing AND another starts, or one restarts.
5. Tapping the **lock-screen play button then unlocking → the āyah restarts while the original was still playing** (double playback / overlap).

---

## Where the code lives

**Primary:** `packages/ui/context/QuranAudioContext.tsx` (~552 lines) — the entire audio engine + Web MediaSession wiring. Key symbols (baseline line numbers):

- `getAudioUrl(globalVerseId)` — CDN URL.
- Refs: `audioRef` (active `HTMLAudioElement`), `preloadRef` (a SECOND element), `preloadedVerseId`, `playTokenRef`, `versesRef`, `chapterRef`, `surahIdRef`, `autoPlayRef`, `autoNextSurahRef`.
- `preloadNext(currentVerseId)` (~L118) — creates/loads a **second `Audio()`** (`preloadRef`) for the next āyah (and prefetches next surah's verse JSON) so transitions are seamless.
- `startAudio(verse)` (~L155) — the core. **Two-element architecture:** if the next verse is already in `preloadRef` (`usePreloaded`), it **swaps** `preloadRef`→`audioRef` and plays that element; otherwise it reuses `audioRef` (sets `.src`) or creates a `new Audio()`. Then sets `navigator.mediaSession.metadata` (~L216), `playbackState="playing"` (~L227), the 4 action handlers (`play`/`pause`/`nexttrack`/`previoustrack`, ~L229-245), an `updatePos()` that calls `setPositionState` gated on finite duration (~L256), and element handlers `ontimeupdate` (~L284, advances positionState ~1/sec), `onplay` (~L303, sets playbackState "playing"), `onpause` (~L310, guarded `if (audio.ended) return`, else sets "paused"), `onended` (~L327, autoplay: next āyah via `setPendingVerse`, or surah→surah handoff via dynamic `import()` of next surah + `router.push('?autoplay=1')`).
- `useEffect` on `pendingVerse` (~L370) → calls `startAudio` (this is how autoplay + remote next/prev advance).
- Public API: `playVerse` (sets `autoPlayRef=true`), `playSurah`, `togglePause`, `skipNext`, `skipPrevious` (in-app buttons).
- Cleanup (~L488) nulls `preloadRef`.

**Element creation:** `new Audio()` — a **detached** element, **never appended to the DOM**, no `playsinline`, no `crossOrigin`. Only `preloadRef` gets `preload="auto"`.

**Driven by:** `apps/web/src/app/quran/[id]/PageClient.tsx` (calls `useQuranAudio()`, renders the reader, in-app next/prev buttons) and `apps/web/src/components/mobile/QuranReaderNative.tsx` (reader UI; word-by-word highlighting via `activeWordIndex` derived from `audioProgress`/`audioPaused`/`audioDuration` — NOT from `mediaSession.playbackState`).

**A second audio channel:** `packages/ui/context/AdhanAudioContext.tsx` (adhan playback) has its own element and explicitly NULLS `nexttrack`/`previoustrack`; the two channels arbitrate via `claimAudioFocus`/`audioCoordinator`. The Qur'an overlap is NOT adhan-vs-Qur'an — both overlapping āyāt come from the Qur'an channel's own elements.

---

## Native / platform setup (the under-explored side)

- `apps/web/ios/App/App/AppDelegate.swift`: `import AVFoundation`; on launch does **`AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)`** — **but never `setActive(true)`.** WebKit is left to lazily activate.
- `apps/web/ios/App/App/Info.plist`: **`UIBackgroundModes = ["audio"]`** ✓.
- `apps/web/capacitor.config.ts`: `ios: { contentInset: 'never', backgroundColor: '#000000' }`. **No** WKWebView media flags set (no `allowsInlineMediaPlayback`, no `mediaTypesRequiringUserActionForPlayback`, no `allowsAirPlayForMediaPlayback` overrides — using Capacitor defaults).
- Capacitor 8, `@capacitor/splash-screen@8.0.1`, WKWebView.

---

## What was tried and FAILED (do not repeat)

All three rounds fixated on the **JS Web MediaSession API** and did **not** fix any symptom:

1. **Prior session — "AUDIO-2" (commit `ab99c2c`, in the current baseline):** advance `setPositionState` on each `timeupdate` (~1/sec) + `if (audio.ended) return` guard in `onpause`. → Elapsed time now advances on the lock screen, but everything else stayed broken.
2. **This session — MediaSession lifecycle tweaks (commit `ff4110e`, REVERTED):** re-assert `playbackState="playing"` in `ontimeupdate` when `!audio.paused`; add an `onplaying` handler re-asserting the session; push an initial `setPositionState` synchronously; a `hardStop()` helper (detach handlers + pause + `currentTime=0`); a synchronous `advance()` for next/prev + a 600ms debounce (`advanceLockRef`) for duplicate iOS remote deliveries; guard the `play` command against a spurious play bundled with an advance. → **No change to any symptom.**
3. **This session — single persistent audio element (commit `5ba8870`, REVERTED):** removed the element **swap** entirely; always reuse `audioRef`, only change `.src`; preload kept as HTTP-cache-warm only. Hypothesis was that iOS binds Now-Playing to one element and the swap left it bound to a paused element. → **Did NOT fix the lock screen, AND regressed surah autoplay** (autoplay stopped advancing — cause not root-caused before revert; suspect a `play()`-after-`src`-change interruption or the `onended` chain breaking with the single element).

**Conclusion / what we learned:**
- The lock-screen state is **not** driven by `navigator.mediaSession.playbackState` on iOS (re-asserting it did nothing).
- The problem is **not solely** the element swap (single-element didn't fix it either).
- The real cause is very likely **native / platform-level**, un-touched so far: the **detached `new Audio()` element not in the DOM**, and/or **`AVAudioSession` never being `setActive(true)`**, and/or WKWebView media config — i.e., WebKit isn't establishing a proper Now-Playing session for this audio element at all, so what little shows up is inconsistent.

---

## Strong hypotheses to investigate first (previously ignored)

1. **Detached media element.** `new Audio()` is never appended to `document.body`. iOS WebKit is known to only reliably surface lock-screen Now-Playing for media elements **connected to the document** (and sometimes needs `playsinline`). Try: append the element to the DOM (hidden), set `playsInline`, and see if the panel appears reliably on first play.
2. **`AVAudioSession.setActive(true)`.** WebKit may not activate the session robustly. Consider activating it natively (AppDelegate or a tiny plugin) — carefully (activating an empty session or fighting WebKit can backfire; research the right timing/options, e.g. on first web audio play via a JS→native bridge).
3. **Single vs. multiple elements + who iOS binds to.** Even if single-element alone didn't fix it, the *combination* (single element + attached-to-DOM + active session) may. Also: `preloadRef` is a second element that `.load()`s audio — verify it isn't confusing WebKit's "main content" selection.
4. **Native Now-Playing bridge (heaviest, most robust).** `MPNowPlayingInfoCenter` + `MPRemoteCommandCenter` + `AVAudioSession` in a small Capacitor plugin, with remote commands `postMessage`'d to JS to drive the web `<audio>` (which must remain the sound source for word-by-word highlighting via `currentTime`). Big lift; assess whether 1–3 suffice first.
5. **The autoplay regression** from the single-element attempt must be understood so any re-attempt at single-element doesn't reintroduce it (likely `audio.play()` rejecting with an AbortError after an immediate `.src` change, whose `.catch` sets `playingVerse=null` + error and halts the chain — verify).

---

## Build / test / git

- Build: `cd <repo> && pnpm build:mobile` then `cd apps/web && npx cap sync ios`. Typecheck: `cd apps/web && npx tsc --noEmit -p tsconfig.json` (run from `apps/web`, NOT repo root — root `npx tsc` resolves the wrong binary).
- On-device: Xcode run on a physical iPhone; **delete app + Product ▸ Clean Build Folder** before reinstall to avoid stale launch/media caches.
- Repo: `sunadeem/hiddenhiqmah`, branch `dev`. Relevant commits to diff: `ab99c2c` (AUDIO-2, in baseline), `ff4110e` + `5ba8870` (the two REVERTED attempts — read them to see exactly what was tried), `1c63789` (the revert). `git show <sha>:packages/ui/context/QuranAudioContext.tsx` to inspect.
- Conventions: commit messages have **no `Co-Authored-By` trailer** (user is sole author). Supabase migrations are applied by the user only. Never fabricate Islamic content. Gate native-only behavior via `useIsNative()` / `.native`.

## Definition of done

On a clean reinstall: play an āyah → lock immediately → Now-Playing panel appears promptly, shows **Playing** with a live scrubber + correct surah/āyah metadata + app artwork. Lock-screen **play/pause** toggles the *same* audio (no restart/overlap). Lock-screen **next/prev** advances exactly **one** āyah (no overlap, no double). In-app playback, verse→verse autoplay, surah→surah autoplay (`?autoplay=1` handoff), and word-by-word Arabic highlighting all still work.
