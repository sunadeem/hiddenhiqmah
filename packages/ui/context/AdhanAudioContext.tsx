"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { registerAudioChannel, claimAudioFocus } from "../lib/audioCoordinator";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

export const ADHAN_AUDIO_URL = "/audio/adhan.mp3";

interface AdhanAudioState {
  // playback state
  playing: boolean;
  paused: boolean;
  progress: number; // seconds
  duration: number; // seconds
  // controls
  startManual: () => void;
  togglePause: () => void;
  stop: () => void;
  seekTo: (fraction: number) => void;
}

const AdhanAudioContext = createContext<AdhanAudioState | null>(null);

export function useAdhanAudio() {
  const ctx = useContext(AdhanAudioContext);
  if (!ctx) throw new Error("useAdhanAudio must be inside AdhanAudioProvider");
  return ctx;
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function clearAdhanMediaSession() {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = null;
  navigator.mediaSession.playbackState = "none";
  (["play", "pause", "nexttrack", "previoustrack"] as const).forEach((a) =>
    navigator.mediaSession.setActionHandler(a, null)
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROVIDER — manual adhan playback only (scheduled auto-play removed;
   on native, prayer-time alerts come from local notifications instead).
   ═══════════════════════════════════════════════════════════════════ */

export function AdhanAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Core play implementation
  const startPlayback = useCallback(() => {
    claimAudioFocus("adhan"); // stop Quran recitation (or any other channel) first
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(ADHAN_AUDIO_URL);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);
    });
    audio.addEventListener("timeupdate", () => {
      setProgress(audio.currentTime);
    });
    audio.addEventListener("ended", () => {
      audioRef.current = null;
      setPlaying(false);
      setPaused(false);
      setProgress(0);
      clearAdhanMediaSession();
    });
    audio.addEventListener("error", () => {
      audioRef.current = null;
      setPlaying(false);
      setPaused(false);
      clearAdhanMediaSession();
    });
    audio.addEventListener("play", () => {
      setPaused(false);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
    });
    audio.addEventListener("pause", () => {
      // Only mark paused if not fully stopped
      if (audioRef.current === audio) {
        setPaused(true);
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
      }
    });

    audio.play().catch(() => {
      // autoplay may be blocked without user interaction — fail silently
      audioRef.current = null;
      setPlaying(false);
    });

    setPlaying(true);
    setPaused(false);
    setProgress(0);
    if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);

    // Own the lock screen while the adhan plays (the Quran channel cleared its
    // own MediaSession when we claimed focus above).
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "Adhan — Call to Prayer",
        artist: "Omar Hisham Al Arabi",
        album: "Hidden Hiqmah",
        artwork: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      });
      navigator.mediaSession.playbackState = "playing";
      navigator.mediaSession.setActionHandler("play", () => {
        audioRef.current?.play().catch(() => {});
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
    }
  }, []);

  const startManual = useCallback(() => {
    startPlayback();
  }, [startPlayback]);

  const togglePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlaying(false);
    setPaused(false);
    setProgress(0);
    clearAdhanMediaSession();
  }, []);

  const seekTo = useCallback((fraction: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.duration * fraction));
    setProgress(audio.currentTime);
  }, []);

  // Register with the audio coordinator so starting recitation stops the adhan.
  useEffect(() => registerAudioChannel("adhan", stop), [stop]);

  return (
    <AdhanAudioContext.Provider
      value={{
        playing,
        paused,
        progress,
        duration,
        startManual,
        togglePause,
        stop,
        seekTo,
      }}
    >
      {children}
    </AdhanAudioContext.Provider>
  );
}
