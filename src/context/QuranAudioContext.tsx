"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import chapters from "@/data/quran/chapters.json";
import { getAutoPlayNextSurah, setAutoPlayNextSurah } from "@/lib/storage";

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

interface QuranAudioState {
  playingVerse: number | null;
  audioProgress: number;
  audioDuration: number;
  audioPaused: boolean;
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
  const autoPlayRef = useRef(false);
  const autoNextSurahRef = useRef(false);

  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPaused, setAudioPaused] = useState(false);
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

  // Core function to start playing an audio file for a verse
  // Reuses a single Audio element so the browser's autoplay activation carries over
  const startAudio = useCallback((verse: Verse) => {
    let audio = audioRef.current;

    if (audio) {
      // Reuse existing element — just stop current playback
      audio.pause();
      audio.onended = null;
      audio.ontimeupdate = null;
      audio.onloadedmetadata = null;
      audio.onerror = null;
    } else {
      // First time — create the element
      audio = new Audio();
      audioRef.current = audio;
    }

    // Change source and play
    audio.src = getAudioUrl(verse.id);
    setPlayingVerse(verse.number);
    setAudioProgress(0);
    setAudioDuration(0);
    setAudioPaused(false);

    audio.play().catch(() => {
      setPlayingVerse(null);
    });

    // Lock screen / notification media info
    const ch = chapterRef.current;
    if ("mediaSession" in navigator && ch) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${ch.name} — Verse ${verse.number}`,
        artist: "Mishari Rashid al-Afasy",
        album: `Surah ${ch.name} (${ch.nameAr})`,
        artwork: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
      });

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
          if (next) { setPendingVerse(next); setPendingScroll(true); }
        }
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        const vrs = versesRef.current;
        if (vrs) {
          const idx = vrs.findIndex((v) => v.id === verse.id);
          const prev = vrs[idx - 1];
          if (prev) { setPendingVerse(prev); setPendingScroll(true); }
        }
      });
    }

    audio.onloadedmetadata = () => setAudioDuration(audio.duration);
    audio.ontimeupdate = () => setAudioProgress(audio.currentTime);
    audio.onerror = () => setPlayingVerse(null);

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
          import(`@/data/quran/verses/${nextSurahId}.json`).then((mod) => {
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
    import(`@/data/quran/verses/${nextId}.json`).then((mod) => {
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
    import(`@/data/quran/verses/${prevId}.json`).then((mod) => {
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
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
    }
    setPlayingVerse(null);
    autoPlayRef.current = false;
  }, []);

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
