"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import chapters from "@hidden-hiqmah/content/quran/chapters.json";
import { getAutoPlayNextSurah, setAutoPlayNextSurah } from "../lib/storage";
import {
  registerAudioChannel,
  claimAudioFocus,
  noteAudioAudible,
  noteAudioSilent,
  notePlaybackState,
  releaseAudioFocus,
} from "../lib/audioCoordinator";

export interface Verse {
  id: number;
  number: number;
  key: string;
  textAr: string;
  textTranslit?: string;
  textEn: string;
  juz: number;
  page: number;
  hizb: number;
}

type Chapter = (typeof chapters)[number];

function getAudioUrl(globalVerseId: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalVerseId}.mp3`;
}

// iOS WebKit elects ONE media element as the app's lock-screen Now-Playing
// session (re-evaluated only at play/pause transitions) and routes remote
// commands to that element. The election is unreliable for detached
// `new Audio()` elements, and a binding left on an element we later abandon is
// what made the panel miss, lie ("Paused" while playing), and double-play.
// Every element we create is therefore appended hidden to <body> and lives for
// the whole session — exactly two ever exist: active + preload buffer.
function createAttachedAudio(): HTMLAudioElement {
  const el = document.createElement("audio");
  el.setAttribute("playsinline", "");
  el.preload = "auto";
  el.style.display = "none";
  document.body.appendChild(el);
  return el;
}

interface QuranAudioState {
  playingVerse: number | null;
  audioProgress: number;
  audioDuration: number;
  audioPaused: boolean;
  audioError: string | null;
  clearAudioError: () => void;
  autoNextSurah: boolean;
  surahId: number | null;
  chapter: Chapter | null;
  verses: Verse[] | null;
  playVerse: (verse: Verse) => void;
  playSurah: () => void;
  togglePause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seekTo: (fraction: number) => void;
  skipNextSurah: () => void;
  skipPreviousSurah: () => void;
  stopPlayback: () => void;
  toggleAutoNextSurah: () => void;
  setAutoPlay: (enabled: boolean) => void;
  registerSurah: (surahId: number, verses: Verse[]) => void;
  autoPlayRef: React.MutableRefObject<boolean>;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

const QuranAudioContext = createContext<QuranAudioState | null>(null);

export function useQuranAudio() {
  const ctx = useContext(QuranAudioContext);
  if (!ctx) throw new Error("useQuranAudio must be inside QuranAudioProvider");
  return ctx;
}

export function QuranAudioProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const preloadedVerseId = useRef<number | null>(null);
  // Which next-surah verse JSON we've already warmed, so the boundary handoff in
  // onended resolves the dynamic import from cache instead of a fresh chunk fetch.
  const prefetchedSurahId = useRef<number | null>(null);
  const autoPlayRef = useRef(false);
  const autoNextSurahRef = useRef(false);
  const playTokenRef = useRef(0);

  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPaused, setAudioPaused] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const clearAudioError = useCallback(() => setAudioError(null), []);
  const [autoNextSurah, setAutoNextSurahState] = useState(false);

  const [surahId, setSurahId] = useState<number | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[] | null>(null);

  // Refs to avoid stale closures in audio event handlers
  const versesRef = useRef<Verse[] | null>(null);
  const chapterRef = useRef<Chapter | null>(null);
  const surahIdRef = useRef<number | null>(null);

  // State-driven: when a verse ends, store the next verse to play here
  const [pendingVerse, setPendingVerse] = useState<Verse | null>(null);
  // Whether to scroll to the pending verse
  const [pendingScroll, setPendingScroll] = useState(false);

  // Load auto-play-next preference
  useEffect(() => {
    const val = getAutoPlayNextSurah();
    setAutoNextSurahState(val);
    autoNextSurahRef.current = val;
  }, []);

  const registerSurah = useCallback((id: number, newVerses: Verse[]) => {
    setSurahId(id);
    surahIdRef.current = id;
    const ch = chapters.find((c) => c.id === id) || null;
    setChapter(ch);
    chapterRef.current = ch;
    setVerses(newVerses);
    versesRef.current = newVerses;
  }, []);

  // Preload the next verse's audio so transitions are seamless
  const preloadNext = useCallback((currentVerseId: number) => {
    const vrs = versesRef.current;
    if (!vrs) return;
    const idx = vrs.findIndex((v) => v.id === currentVerseId);
    const nextVerse = vrs[idx + 1];
    // Also preload first verse of next surah if at end
    let preloadId: number | null = null;
    if (nextVerse) {
      preloadId = nextVerse.id;
    } else if (autoNextSurahRef.current && surahIdRef.current && surahIdRef.current < 114) {
      // Preload first verse of next surah (global verse ID = sum of previous surah verses + 1)
      // We can compute this from the current verse: last verse id + 1
      preloadId = currentVerseId + 1;
      // Warm the next surah's verse-JSON chunk NOW, while the final āyah is still
      // playing, so the onended handoff below resolves from cache (no chunk-load
      // stall at the boundary — the āyah-1 audio is already preloaded above).
      const nextSurahId = surahIdRef.current + 1;
      if (prefetchedSurahId.current !== nextSurahId) {
        prefetchedSurahId.current = nextSurahId;
        import(`@hidden-hiqmah/content/quran/verses/${nextSurahId}.json`).catch(() => {
          prefetchedSurahId.current = null;
        });
      }
    }
    if (!preloadId || preloadId === preloadedVerseId.current) return;
    // Create or reuse preload element
    if (!preloadRef.current) {
      preloadRef.current = createAttachedAudio();
    }
    preloadRef.current.src = getAudioUrl(preloadId);
    preloadRef.current.preload = "auto";
    // Keep the idle buffer MUTED: iOS WebKit only elects a "not muted" element as
    // the lock-screen Now-Playing session, so a muted buffer can never be picked
    // over the audible element. Without this, WebKit sometimes bound Now-Playing
    // to this paused buffer → the panel showed "Paused" while the real element
    // played (elapsed still advanced via setPositionState). Un-muted on promotion.
    preloadRef.current.muted = true;
    preloadRef.current.load();
    preloadedVerseId.current = preloadId;
  }, []);

  // Core function to start playing an audio file for a verse
  // Reuses a single Audio element so the browser's autoplay activation carries over
  const startAudio = useCallback((verse: Verse) => {
    claimAudioFocus("quran"); // stop the adhan (or any other channel) first
    const token = ++playTokenRef.current;
    let audio = audioRef.current;
    // Check if we have this verse preloaded — swap elements for instant playback
    const usePreloaded = preloadRef.current && preloadedVerseId.current === verse.id;

    if (usePreloaded) {
      // Swap: old audio becomes preload, preloaded becomes active
      if (audio) {
        audio.pause();
        audio.onended = null;
        audio.ontimeupdate = null;
        audio.onloadedmetadata = null;
        audio.onerror = null;
        audio.onplay = null;
        audio.onpause = null;
      }
      // Recycle the outgoing element (paused + handlers detached above) as the
      // next preload buffer — a closed 2-element pool. Never orphan an element:
      // iOS routes lock-screen commands to the element it is bound to, and an
      // orphan we can no longer reach is what produced overlapping playback.
      const outgoing = audio;
      audio = preloadRef.current!;
      audioRef.current = audio;
      preloadRef.current = outgoing;
      preloadedVerseId.current = null;
    } else if (audio) {
      // Reuse existing element — just stop current playback
      audio.pause();
      audio.onended = null;
      audio.ontimeupdate = null;
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.onplay = null;
      audio.onpause = null;
    } else {
      // First time — create the element ATTACHED to the DOM so iOS WebKit can
      // bind its lock-screen Now-Playing session to it.
      audio = createAttachedAudio();
      audioRef.current = audio;
    }

    // The active element must be audible AND now-playing-eligible. The preload
    // buffer is kept muted (ineligible) so iOS never binds the lock screen to it;
    // a just-promoted buffer therefore has to be un-muted here.
    audio.muted = false;

    // Change source and play (preloaded already has correct src)
    if (!usePreloaded) {
      audio.src = getAudioUrl(verse.id);
    }
    setPlayingVerse(verse.number);
    setAudioProgress(0);
    setAudioDuration(0);
    setAudioPaused(false);
    setAudioError(null);

    // Lock screen / notification media info — set BEFORE play() so metadata and
    // action handlers already exist when WebKit registers the Now-Playing
    // session on this element's first "playing" transition.
    const ch = chapterRef.current;

    // ANDROID native MediaSession — deliberately OUTSIDE the
    // navigator.mediaSession block below, and not gated on `ch`.
    //
    // That block is iOS's path: WKWebView forwards it to the system, the
    // Android WebView does not, which is why the session has to be published
    // natively at all. Nesting this call inside it made the Android card show
    // the generic channel title, because the whole block is skipped whenever
    // its conditions don't hold — and the bridge log proved that is exactly
    // what happened: only {"title":"Quran recitation"} ever reached native.
    // The lesson: the native surface must not depend on a browser API's
    // availability.
    noteAudioAudible("quran", {
      title: ch ? `${ch.name} — Verse ${verse.number}` : `Verse ${verse.number}`,
      subtitle: "Mishari Rashid al-Afasy",
      ...(ch ? { album: `Surah ${ch.name} (${ch.nameAr})` } : {}),
      ...(audio && audio.duration && isFinite(audio.duration)
        ? { durationMs: Math.round(audio.duration * 1000) }
        : {}),
      ...(audio ? { positionMs: Math.max(0, Math.round(audio.currentTime * 1000)) } : {}),
    });

    if ("mediaSession" in navigator && ch) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${ch.name} — Verse ${verse.number}`,
        artist: "Mishari Rashid al-Afasy",
        album: `Surah ${ch.name} (${ch.nameAr})`,
        artwork: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      });
      // Assert "playing" synchronously on every āyah so the lock-screen / Dynamic
      // Island Now-Playing stays live across the short per-verse clips.
      navigator.mediaSession.playbackState = "playing";

      navigator.mediaSession.setActionHandler("play", () => {
        audioRef.current?.play();
        setAudioPaused(false);
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
        setAudioPaused(true);
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        const vrs = versesRef.current;
        if (vrs) {
          const idx = vrs.findIndex((v) => v.id === verse.id);
          const next = vrs[idx + 1];
          if (next) {
            // Silence the outgoing āyah NOW: while locked, the React effect
            // that starts the next element can be deferred, and iOS must never
            // hear two elements at once. Plain pause() only — no seek, no src
            // reset (a seek before a src change stalled autoplay in 5ba8870).
            audioRef.current?.pause();
            setPendingVerse(next);
            setPendingScroll(true);
          }
        }
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        const vrs = versesRef.current;
        if (vrs) {
          const idx = vrs.findIndex((v) => v.id === verse.id);
          const prev = vrs[idx - 1];
          if (prev) {
            audioRef.current?.pause();
            setPendingVerse(prev);
            setPendingScroll(true);
          }
        }
      });
    }

    audio.play().catch((err: unknown) => {
      // Only reset if this play call wasn't superseded by a newer startAudio()
      if (playTokenRef.current === token) {
        const name = err instanceof DOMException ? err.name : "Error";
        setPlayingVerse(null);
        setAudioError(`Couldn't play the recitation (${name}) — check your connection.`);
      }
    });

    // Preload next verse immediately for seamless transition
    preloadNext(verse.id);

    // Keep iOS's lock-screen / Dynamic Island scrubber live. iOS infers BOTH the
    // play/pause indicator and the elapsed/duration from setPositionState — if the
    // position never advances it flips to "paused" even while audio plays. So push
    // an advancing position on every timeupdate (throttled to ~1/sec); rate 0 when
    // genuinely paused. `lastPosSec` is per-āyah (this closure), so it resets each verse.
    let lastPosSec = -1;
    // Last values actually handed to the native session, so repeat pushes can be
    // skipped (see inside updatePos).
    let lastNativePlaying = false;
    let lastNativePosMs = -100000;
    const updatePos = (rate: number) => {
      // ANDROID first, and deliberately OUTSIDE the navigator.mediaSession guard
      // below. That guard is iOS's path; on Android it does not hold, so the
      // native position was never pushed from here — which is what made the
      // media card sit exactly ONE PAUSE BEHIND: pausing sent playing:false with
      // no position, native kept the last position it knew (from the previous
      // play), and the card rendered that. Same lesson as the metadata: never
      // gate the native surface on a browser API.
      if (audio.duration && isFinite(audio.duration)) {
        const posMs = Math.round(
          Math.min(Math.max(audio.currentTime, 0), audio.duration) * 1000
        );
        // Only push on a state CHANGE or a jump, never on every tick. This runs
        // from timeupdate ~1/sec, and each push restarts the foreground service
        // and re-posts its notification — a second-by-second churn for nothing,
        // because Android already extrapolates the elapsed time from
        // position + speed + updateTime. A 2s tolerance catches a real seek
        // while ignoring ordinary drift.
        const drifted = Math.abs(posMs - lastNativePosMs) > 2000;
        if (rate > 0 !== lastNativePlaying || drifted) {
          lastNativePlaying = rate > 0;
          lastNativePosMs = posMs;
          notePlaybackState("quran", rate > 0, posMs, Math.round(audio.duration * 1000));
        } else {
          // Keep the reference point moving so "drift" stays meaningful.
          lastNativePosMs = posMs;
        }
      }
      if (
        "mediaSession" in navigator &&
        "setPositionState" in navigator.mediaSession &&
        audio.duration &&
        isFinite(audio.duration)
      ) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: rate,
            position: Math.min(Math.max(audio.currentTime, 0), audio.duration),
          });
        } catch {
          /* ignore */
        }
      }
    };

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
      updatePos(1);
    };
    audio.ontimeupdate = () => {
      setAudioProgress(audio.currentTime);
      const sec = Math.floor(audio.currentTime);
      if (sec !== lastPosSec) {
        lastPosSec = sec;
        updatePos(audio.paused ? 0 : 1);
      }
    };
    audio.onerror = () => {
      setPlayingVerse(null);
      if (audioRef.current === audio) {
        setAudioError("Couldn't load the recitation — check your connection.");
      }
    };

    // Reflect element-level play/pause that did NOT go through our toggle — a
    // phone call, Control-Center pause, or headphone unplug pauses the audio,
    // and without this the UI stays stuck on "playing". Guarded so a superseded
    // / swapped-out element (which also fires "pause") can't flip live state.
    audio.onplay = () => {
      if (audioRef.current === audio && playTokenRef.current === token) {
        setAudioPaused(false);
        // Sound is coming out again — re-raise Android's playback service. This
        // path matters because a lock-screen or headphone resume never goes
        // through our toggle, so without it the service stays down and audio
        // would be muted the moment the app is backgrounded.
        //
        // Deliberately notePlaybackState, NOT noteAudioAudible: the latter
        // re-sends metadata, and with none to hand it would overwrite
        // "Al-Baqarah — Verse 1" with the generic channel title. onplay fires
        // AFTER the metadata is published, so it would win — which is exactly
        // the bug that made the media card read "Quran recitation".
        notePlaybackState(
          "quran",
          true,
          Math.max(0, Math.round(audio.currentTime * 1000)),
          audio.duration && isFinite(audio.duration)
            ? Math.round(audio.duration * 1000)
            : undefined
        );
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
        updatePos(1);
      }
    };
    audio.onpause = () => {
      // End-of-āyah fires "pause" too — don't flip to paused during an autoplay
      // transition, or the lock-screen Now-Playing flickers between verses.
      if (audio.ended) return;
      if (audioRef.current === audio && playTokenRef.current === token) {
        setAudioPaused(true);
        // Report PAUSED rather than tearing the service down. Native keeps the
        // MediaSession (so the lock-screen / shade player stays put and can
        // resume) but detaches from the foreground, so we're not an idle
        // foreground service pinning an undismissable notification.
        //
        // The POSITION matters here: native leaves its position untouched when
        // none is supplied, so omitting it froze the card at the previous
        // pause point while audio resumed from the real one.
        notePlaybackState(
          "quran",
          false,
          Math.max(0, Math.round(audio.currentTime * 1000)),
          audio.duration && isFinite(audio.duration)
            ? Math.round(audio.duration * 1000)
            : undefined
        );
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
        updatePos(0);
      }
    };

    // If metadata already loaded (e.g. preloaded audio), set duration immediately
    if (audio.duration && !isNaN(audio.duration)) {
      setAudioDuration(audio.duration);
    }

    // When verse ends, use state to trigger next verse (avoids stale ref issues)
    audio.onended = () => {
      const vrs = versesRef.current;
      if (autoPlayRef.current && vrs) {
        const currentIdx = vrs.findIndex((v) => v.id === verse.id);
        const nextVerse = vrs[currentIdx + 1];
        if (nextVerse) {
          setPendingVerse(nextVerse);
          setPendingScroll(true);
        } else if (autoNextSurahRef.current && surahIdRef.current && surahIdRef.current < 114) {
          const nextSurahId = surahIdRef.current + 1;
          const isOnPlayingSurah = pathnameRef.current === `/quran/${surahIdRef.current}`;
          // Load next surah's verses into context so playback continues
          import(`@hidden-hiqmah/content/quran/verses/${nextSurahId}.json`).then((mod) => {
            const nextVerses = mod.default as Verse[];
            // Register the new surah
            surahIdRef.current = nextSurahId;
            setSurahId(nextSurahId);
            const nextCh = chapters.find((c) => c.id === nextSurahId) || null;
            chapterRef.current = nextCh;
            setChapter(nextCh);
            versesRef.current = nextVerses;
            setVerses(nextVerses);
            // Start playing first verse of new surah
            if (nextVerses.length > 0) {
              setPendingVerse(nextVerses[0]);
              setPendingScroll(false);
            }
            // Only navigate if user is currently viewing the surah that just finished
            if (isOnPlayingSurah) {
              router.push(`/quran/${nextSurahId}?autoplay=1`);
            }
          });
        } else {
          setPlayingVerse(null);
          autoPlayRef.current = false;
          // Reached the end with nothing queued — stop the service. Without
          // this, finishing a surah left it running indefinitely.
          noteAudioSilent("quran");
        }
      } else {
        setPlayingVerse(null);
        noteAudioSilent("quran");
      }
    };
  }, [router]);

  // Effect: when pendingVerse is set, play it
  useEffect(() => {
    if (pendingVerse) {
      startAudio(pendingVerse);
      if (pendingScroll) {
        document.getElementById(`verse-${pendingVerse.number}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setPendingVerse(null);
      setPendingScroll(false);
    }
  }, [pendingVerse, pendingScroll, startAudio]);

  // Public playVerse: sets autoPlay and triggers playback
  const playVerse = useCallback((verse: Verse) => {
    autoPlayRef.current = true;
    startAudio(verse);
  }, [startAudio]);

  const playSurah = useCallback(() => {
    const vrs = versesRef.current;
    if (!vrs || vrs.length === 0) return;
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlayingVerse(null);
      autoPlayRef.current = false;
      return;
    }
    autoPlayRef.current = true;
    startAudio(vrs[0]);
  }, [startAudio]);

  const togglePause = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setAudioPaused(false);
    } else {
      audioRef.current.pause();
      setAudioPaused(true);
    }
  }, []);

  const skipNext = useCallback(() => {
    const vrs = versesRef.current;
    if (!vrs || playingVerse === null) return;
    const idx = vrs.findIndex((v) => v.number === playingVerse);
    const next = vrs[idx + 1];
    if (next) startAudio(next);
  }, [playingVerse, startAudio]);

  const skipPrevious = useCallback(() => {
    const vrs = versesRef.current;
    if (!vrs || playingVerse === null) return;
    const idx = vrs.findIndex((v) => v.number === playingVerse);
    const prev = vrs[idx - 1];
    if (prev) {
      startAudio(prev);
    } else if (audioRef.current) {
      // First āyah of the surah (idx 0): there is no prior āyah, so instead of a
      // no-op, restart the current āyah from 0:00 — the expected "previous"
      // behaviour of a media player. Resume playback if it was paused so this
      // mirrors the play-immediately behaviour of the idx ≥ 1 branch above.
      audioRef.current.currentTime = 0;
      setAudioProgress(0);
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
        setAudioPaused(false);
      }
    }
  }, [playingVerse, startAudio]);

  const seekTo = useCallback((fraction: number) => {
    if (!audioRef.current || !audioDuration) return;
    audioRef.current.currentTime = fraction * audioDuration;
  }, [audioDuration]);

  // Jump to first verse of next/previous surah
  const skipNextSurah = useCallback(() => {
    const sid = surahIdRef.current;
    if (!sid || sid >= 114) return;
    const nextId = sid + 1;
    import(`@hidden-hiqmah/content/quran/verses/${nextId}.json`).then((mod) => {
      const nextVerses = mod.default as Verse[];
      surahIdRef.current = nextId;
      setSurahId(nextId);
      const nextCh = chapters.find((c) => c.id === nextId) || null;
      chapterRef.current = nextCh;
      setChapter(nextCh);
      versesRef.current = nextVerses;
      setVerses(nextVerses);
      if (nextVerses.length > 0) {
        setPendingVerse(nextVerses[0]);
        setPendingScroll(false);
      }
      // Navigate if user is on the current surah page
      if (pathnameRef.current === `/quran/${sid}`) {
        router.push(`/quran/${nextId}?autoplay=1`);
      }
    });
  }, [router]);

  const skipPreviousSurah = useCallback(() => {
    const sid = surahIdRef.current;
    if (!sid || sid <= 1) return;
    const prevId = sid - 1;
    import(`@hidden-hiqmah/content/quran/verses/${prevId}.json`).then((mod) => {
      const prevVerses = mod.default as Verse[];
      surahIdRef.current = prevId;
      setSurahId(prevId);
      const prevCh = chapters.find((c) => c.id === prevId) || null;
      chapterRef.current = prevCh;
      setChapter(prevCh);
      versesRef.current = prevVerses;
      setVerses(prevVerses);
      if (prevVerses.length > 0) {
        setPendingVerse(prevVerses[0]);
        setPendingScroll(false);
      }
      if (pathnameRef.current === `/quran/${sid}`) {
        router.push(`/quran/${prevId}?autoplay=1`);
      }
    });
  }, [router]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onplay = null;
      audioRef.current.onpause = null;
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
    }
    if (preloadRef.current) {
      // Keep the node pooled (attached + reusable) — discarding it would grow
      // the element population again on the next play. Just drop its load.
      preloadRef.current.removeAttribute("src");
      preloadRef.current.load();
      preloadedVerseId.current = null;
    }
    // Tear down the lock-screen / MediaSession controls so they don't linger
    // (e.g. when the adhan claims audio focus and stops recitation).
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      (["play", "pause", "nexttrack", "previoustrack"] as const).forEach((a) =>
        navigator.mediaSession.setActionHandler(a, null)
      );
    }
    setPlayingVerse(null);
    autoPlayRef.current = false;
      releaseAudioFocus("quran");
  }, []);

  // Register with the audio coordinator so starting the adhan stops recitation,
  // AND expose remote controls so the lock-screen player, the shade media card
  // and Bluetooth buttons can drive it. Without the second argument those
  // surfaces would render but do nothing when pressed.
  useEffect(
    () =>
      registerAudioChannel("quran", stopPlayback, {
        play: () => {
          const a = audioRef.current;
          if (a && a.paused) void a.play().catch(() => {});
        },
        pause: () => {
          const a = audioRef.current;
          if (a && !a.paused) a.pause();
        },
        seek: (positionMs: number) => {
          const a = audioRef.current;
          if (a && a.duration) a.currentTime = Math.min(a.duration, positionMs / 1000);
        },
        // Reuse the very callbacks the iOS lock screen already drives, rather
        // than writing second versions — one definition of "next āyah" for
        // every platform and every surface.
        next: skipNext,
        previous: skipPrevious,
      }),
    // skipNext/skipPrevious close over playingVerse, so they change per āyah;
    // re-registering is cheap and registerAudioChannel replaces cleanly.
    [stopPlayback, skipNext, skipPrevious]
  );

  const toggleAutoNextSurah = useCallback(() => {
    const next = !autoNextSurahRef.current;
    setAutoNextSurahState(next);
    autoNextSurahRef.current = next;
    setAutoPlayNextSurah(next);
  }, []);

  const setAutoPlay = useCallback((enabled: boolean) => {
    autoPlayRef.current = enabled;
  }, []);

  return (
    <QuranAudioContext.Provider
      value={{
        playingVerse,
        audioProgress,
        audioDuration,
        audioPaused,
        audioError,
        clearAudioError,
        autoNextSurah,
        surahId,
        chapter,
        verses,
        playVerse,
        playSurah,
        togglePause,
        skipNext,
        skipPrevious,
        seekTo,
        skipNextSurah,
        skipPreviousSurah,
        stopPlayback,
        toggleAutoNextSurah,
        setAutoPlay,
        registerSurah,
        autoPlayRef,
        audioRef,
      }}
    >
      {children}
    </QuranAudioContext.Provider>
  );
}
