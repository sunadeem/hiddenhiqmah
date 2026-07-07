"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import chapters from "@hidden-hiqmah/content/quran/chapters.json";
import { getAutoPlayNextSurah, setAutoPlayNextSurah } from "../lib/storage";
import { registerAudioChannel, claimAudioFocus } from "../lib/audioCoordinator";

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

// Fully stop an audio element: detach ALL handlers first (so the teardown itself
// can't fire play/pause/ended events that mutate live state), then pause and rewind.
// Used before swapping/abandoning an element so a stale reference can't resume it.
function hardStop(el: HTMLAudioElement | null) {
  if (!el) return;
  el.onended = null;
  el.ontimeupdate = null;
  el.onloadedmetadata = null;
  el.onerror = null;
  el.onplay = null;
  el.onplaying = null;
  el.onpause = null;
  try {
    el.pause();
  } catch {
    /* ignore */
  }
  try {
    el.currentTime = 0;
  } catch {
    /* ignore */
  }
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
  // The Verse currently owning playback — authoritative for the lock-screen
  // next/previous remote commands (the closed-over `verse` goes stale after an
  // autoplay surah handoff mutates versesRef).
  const currentVerseRef = useRef<Verse | null>(null);
  // Debounce duplicate remote next/prev deliveries (iOS can fire a command twice,
  // and may pair a next-tap with a spurious play command).
  const advanceLockRef = useRef(0);

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
      preloadRef.current = new Audio();
    }
    preloadRef.current.src = getAudioUrl(preloadId);
    preloadRef.current.preload = "auto";
    preloadRef.current.load();
    preloadedVerseId.current = preloadId;
  }, []);

  // Core function to start playing an audio file for a verse
  // Reuses a single Audio element so the browser's autoplay activation carries over
  const startAudio = useCallback((verse: Verse) => {
    claimAudioFocus("quran"); // stop the adhan (or any other channel) first
    const token = ++playTokenRef.current;
    currentVerseRef.current = verse;
    let audio = audioRef.current;
    // Check if we have this verse preloaded — swap elements for instant playback
    const usePreloaded = preloadRef.current && preloadedVerseId.current === verse.id;

    if (usePreloaded) {
      // Swap: old audio becomes preload, preloaded becomes active. Hard-stop (not
      // just pause) the outgoing element so an orphaned reference can never resume
      // it mid-clip under the newly promoted one.
      if (audio) hardStop(audio);
      audio = preloadRef.current!;
      audioRef.current = audio;
      preloadRef.current = null;
      preloadedVerseId.current = null;
    } else if (audio) {
      // Reuse existing element — fully stop + reset it before swapping in the new
      // src so an abandoned/stale reference can't resume mid-clip (overlap).
      hardStop(audio);
    } else {
      // First time — create the element
      audio = new Audio();
      audioRef.current = audio;
    }

    // Change source and play (preloaded already has correct src)
    if (!usePreloaded) {
      audio.src = getAudioUrl(verse.id);
    }
    setPlayingVerse(verse.number);
    setAudioProgress(0);
    setAudioDuration(0);
    setAudioPaused(false);
    setAudioError(null);

    audio.play().catch(() => {
      // Only reset if this play call wasn't superseded by a newer startAudio()
      if (playTokenRef.current === token) {
        setPlayingVerse(null);
        setAudioError("Couldn't play the recitation — check your connection.");
      }
    });

    // Preload next verse immediately for seamless transition
    preloadNext(verse.id);

    // Advance/rewind exactly ONE āyah for the lock-screen remote commands. Stops
    // the current element SYNCHRONOUSLY (hardStop) before queuing the next, so the
    // outgoing recitation can't overlap the incoming one while backgrounded/locked
    // (where the deferred React effect is throttled). hardStop also nulls the
    // outgoing element's onended, so the same tap can't also fire the autoplay
    // path. Target is computed from currentVerseRef (never the stale closed-over
    // `verse`), and we advance currentVerseRef immediately so a debounced-through
    // duplicate stays consistent.
    const advance = (dir: 1 | -1) => {
      const vrs = versesRef.current;
      const cur = currentVerseRef.current;
      if (!vrs || !cur) return;
      const idx = vrs.findIndex((v) => v.id === cur.id);
      const target = vrs[idx + dir];
      if (!target) return;
      currentVerseRef.current = target;
      hardStop(audioRef.current);
      setPendingVerse(target);
      setPendingScroll(true);
    };

    // Lock screen / notification media info
    const ch = chapterRef.current;
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
      // Push an initial position state synchronously so iOS surfaces the
      // Now-Playing panel on the FIRST play — before onloadedmetadata fires. With
      // metadata + playbackState but no positionState, WebKit shows nothing on a
      // cold lock (which is why it only appeared after a pause→play cycle). Do NOT
      // gate this first push on a finite duration; onloadedmetadata refreshes it.
      if ("setPositionState" in navigator.mediaSession) {
        try {
          const dur = audio.duration && isFinite(audio.duration) ? audio.duration : 0;
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: 1,
            position: dur ? Math.min(Math.max(audio.currentTime, 0), dur) : 0,
          });
        } catch {
          /* ignore */
        }
      }

      navigator.mediaSession.setActionHandler("play", () => {
        // iOS can bundle a spurious "play" with a next/prev remote command; if we
        // just advanced, ignore it so it can't resume the hard-stopped old element.
        if (Date.now() - advanceLockRef.current < 600) return;
        audioRef.current?.play();
        setAudioPaused(false);
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
        setAudioPaused(true);
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        const now = Date.now();
        if (now - advanceLockRef.current < 600) return; // ignore duplicate delivery
        advanceLockRef.current = now;
        advance(1);
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        const now = Date.now();
        if (now - advanceLockRef.current < 600) return; // ignore duplicate delivery
        advanceLockRef.current = now;
        advance(-1);
      });
    }

    // Keep iOS's lock-screen / Dynamic Island scrubber live. iOS infers BOTH the
    // play/pause indicator and the elapsed/duration from setPositionState — if the
    // position never advances it flips to "paused" even while audio plays. So push
    // an advancing position on every timeupdate (throttled to ~1/sec); rate 0 when
    // genuinely paused. `lastPosSec` is per-āyah (this closure), so it resets each verse.
    let lastPosSec = -1;
    const updatePos = (rate: number) => {
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
        // Keep the lock-screen play/pause indicator in lockstep with real audio:
        // iOS fires a spurious 'pause' when the app backgrounds/locks and the
        // matching 'play' on resume is often dropped, leaving playbackState stuck
        // at "paused" while the elapsed time keeps advancing (symptom 3). Re-assert
        // "playing" whenever the element is actually producing audio. Gated on
        // !audio.paused so a genuine user / Control-Center pause is left alone.
        // Word highlighting is driven by audioProgress + audioPaused, not
        // playbackState, so this does not touch it.
        if (
          !audio.paused &&
          "mediaSession" in navigator &&
          navigator.mediaSession.playbackState !== "playing"
        ) {
          navigator.mediaSession.playbackState = "playing";
        }
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
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
        updatePos(1);
      }
    };
    // WebKit registers the iOS Now-Playing session only when the element actually
    // begins producing sound (the "playing" event), NOT at play() call time — which
    // is why the panel didn't appear on a cold first play until a pause→play cycle.
    // Re-assert playback state + position the moment real audio starts, so the lock
    // screen populates on the FIRST lock. Guarded against superseded elements.
    audio.onplaying = () => {
      if (audioRef.current === audio && playTokenRef.current === token) {
        setAudioPaused(false);
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
        }
      } else {
        setPlayingVerse(null);
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
    if (prev) startAudio(prev);
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
      preloadRef.current.src = "";
      preloadRef.current = null;
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
  }, []);

  // Register with the audio coordinator so starting the adhan stops recitation.
  useEffect(() => registerAudioChannel("quran", stopPlayback), [stopPlayback]);

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
