"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { registerAudioChannel, claimAudioFocus } from "../lib/audioCoordinator";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

export type PrayerKey = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export interface AdhanSettings {
  adhanEnabled: boolean;
}

export interface AdhanTimings {
  Fajr?: string;
  Dhuhr?: string;
  Asr?: string;
  Maghrib?: string;
  Isha?: string;
}

export const ADHAN_AUDIO_URL = "/audio/adhan.mp3";
const SETTINGS_KEY = "adhan-settings-v1";
const TIMINGS_KEY = "adhan-timings-v1";

const PRAYER_KEYS: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const DEFAULT_SETTINGS: AdhanSettings = {
  adhanEnabled: false,
};

interface AdhanAudioState {
  // settings
  settings: AdhanSettings;
  updateSettings: (next: Partial<AdhanSettings>) => void;
  // playback state
  playing: boolean;
  paused: boolean;
  progress: number; // seconds
  duration: number; // seconds
  source: "manual" | "scheduled" | null;
  // controls
  startManual: () => void;
  togglePause: () => void;
  stop: () => void;
  seekTo: (fraction: number) => void;
  // scheduling
  setTimings: (t: AdhanTimings | null) => void;
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

function parseTimeToToday(raw: string): Date | null {
  if (!raw) return null;
  const clean = raw.replace(/\s*\(.*\)/, "");
  const parts = clean.split(":").map((v) => parseInt(v, 10));
  if (parts.length < 2 || parts.some(isNaN)) return null;
  const [h, m] = parts;
  const t = new Date();
  t.setHours(h, m, 0, 0);
  return t;
}

/* ═══════════════════════════════════════════════════════════════════
   PROVIDER
   ═══════════════════════════════════════════════════════════════════ */

export function AdhanAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const [settings, setSettings] = useState<AdhanSettings>(DEFAULT_SETTINGS);
  const [timings, setTimingsState] = useState<AdhanTimings | null>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [source, setSource] = useState<"manual" | "scheduled" | null>(null);

  // Load settings + timings from localStorage on mount
  useEffect(() => {
    try {
      const rawSettings = localStorage.getItem(SETTINGS_KEY);
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings) as Partial<AdhanSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // ignore
    }
    try {
      const rawTimings = localStorage.getItem(TIMINGS_KEY);
      if (rawTimings) {
        const parsed = JSON.parse(rawTimings) as { timings: AdhanTimings; savedAt: string };
        // Only use if from today
        const today = new Date().toDateString();
        const saved = new Date(parsed.savedAt).toDateString();
        if (today === saved) {
          setTimingsState(parsed.timings);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist settings
  const updateSettings = useCallback((next: Partial<AdhanSettings>) => {
    setSettings((prev) => {
      const merged: AdhanSettings = { ...prev, ...next };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  }, []);

  // Persist timings (so scheduling continues across navigation)
  const setTimings = useCallback((t: AdhanTimings | null) => {
    setTimingsState(t);
    try {
      if (t) {
        localStorage.setItem(TIMINGS_KEY, JSON.stringify({ timings: t, savedAt: new Date().toISOString() }));
      } else {
        localStorage.removeItem(TIMINGS_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  // Core play implementation
  const startPlayback = useCallback((src: "manual" | "scheduled") => {
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
      setSource(null);
      setProgress(0);
      clearAdhanMediaSession();
    });
    audio.addEventListener("error", () => {
      audioRef.current = null;
      setPlaying(false);
      setPaused(false);
      setSource(null);
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
      setSource(null);
    });

    setPlaying(true);
    setPaused(false);
    setSource(src);
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
    startPlayback("manual");
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
    setSource(null);
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

  // Scheduling effect
  useEffect(() => {
    // Always clear existing timeouts on re-schedule
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];

    if (!timings) return;
    if (!settings.adhanEnabled) return;

    const now = Date.now();
    for (const key of PRAYER_KEYS) {
      const raw = timings[key];
      if (!raw) continue;
      const time = parseTimeToToday(raw);
      if (!time) continue;
      const ms = time.getTime() - now;
      if (ms > 0) {
        const id = window.setTimeout(() => {
          startPlayback("scheduled");
        }, ms);
        timeoutsRef.current.push(id);
      }
    }

    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, [timings, settings, startPlayback]);

  return (
    <AdhanAudioContext.Provider
      value={{
        settings,
        updateSettings,
        playing,
        paused,
        progress,
        duration,
        source,
        startManual,
        togglePause,
        stop,
        seekTo,
        setTimings,
      }}
    >
      {children}
    </AdhanAudioContext.Provider>
  );
}
