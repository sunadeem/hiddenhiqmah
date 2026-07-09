"use client";

// AudioAssistedPlayer — sequential per-āyah recitation for the Hifz Learn/Practice
// screens. Plays each āyah's mp3 (cdn.islamic.network) back to back with an
// optional loop, and — when the surah's word timestamps are bundled — highlights
// each word in gold as it's recited (word-sync). Registers the shared 'hifz' audio
// channel so starting recitation here stops the main Qur'an player / adhan (and
// vice-versa). Audio mechanics salvaged from HifzSession.

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Repeat } from "lucide-react";
import type { ResolvedAyah } from "@/lib/hifz/hifzContent";
import {
  registerAudioChannel,
  claimAudioFocus,
} from "@hidden-hiqmah/ui/lib/audioCoordinator";
import { hapticLight } from "@/lib/mobile/haptics";

const audioUrl = (verseId: number) =>
  `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${verseId}.mp3`;

/** Active word index for the playing āyah, from real timestamps + progress. */
function activeWordIndex(
  ts: number[][] | undefined,
  progressSec: number,
  durationSec: number,
  wordCount: number
): number {
  const ms = progressSec * 1000;
  // Only trust per-word timestamps when they line up with the word count exactly
  // (a few āyāt mismatch); otherwise estimate by even distribution.
  if (ts && ts.length === wordCount && wordCount > 0) {
    for (let i = 0; i < ts.length; i++) {
      if (ms >= ts[i][0] && ms < ts[i][1]) return i;
    }
    if (ms >= ts[ts.length - 1][0]) return ts.length - 1;
    return -1;
  }
  if (durationSec > 0 && wordCount > 0) {
    return Math.min(Math.floor((progressSec / durationSec) * wordCount), wordCount - 1);
  }
  return -1;
}

export interface AudioAssistedPlayerProps {
  ayahs: ResolvedAyah[];
  /** Highlight each word as it's recited (needs bundled timestamps). Default true. */
  wordSync?: boolean;
  /** Show the English translation under each āyah. Default true. */
  showTranslation?: boolean;
  /** Start with loop enabled. Default false. */
  defaultLoop?: boolean;
  className?: string;
}

export default function AudioAssistedPlayer({
  ayahs,
  wordSync = true,
  showTranslation = true,
  defaultLoop = false,
  className,
}: AudioAssistedPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seqRef = useRef<{ ids: number[]; i: number }>({ ids: [], i: 0 });
  const loopRef = useRef(defaultLoop);

  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(defaultLoop);
  const [activeAyah, setActiveAyah] = useState(-1); // index into `ayahs`
  const [progress, setProgress] = useState(0); // seconds into the current āyah
  const [duration, setDuration] = useState(0);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setActiveAyah(-1);
  }, []);

  // Register with the coordinator so any other channel starting stops us.
  useEffect(() => registerAudioChannel("hifz", stop), [stop]);

  // Rebuild playback when the āyāt change; stop any in-flight audio.
  useEffect(() => {
    stop();
    setProgress(0);
    setDuration(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayahs]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const play = useCallback(() => {
    const ids = ayahs.map((a) => a.id).filter((n) => Number.isFinite(n));
    if (ids.length === 0) return;
    claimAudioFocus("hifz"); // stop the main Qur'an player / adhan first
    if (!audioRef.current) {
      const a = new Audio();
      a.onended = () => {
        const st = seqRef.current;
        st.i += 1;
        if (st.i < st.ids.length) {
          setActiveAyah(st.i);
          setProgress(0);
          a.src = audioUrl(st.ids[st.i]);
          a.play().catch(() => setPlaying(false));
        } else if (loopRef.current) {
          st.i = 0;
          setActiveAyah(0);
          setProgress(0);
          a.src = audioUrl(st.ids[0]);
          a.play().catch(() => setPlaying(false));
        } else {
          setPlaying(false);
          setActiveAyah(-1);
        }
      };
      a.ontimeupdate = () => setProgress(a.currentTime);
      a.onloadedmetadata = () => setDuration(a.duration || 0);
      audioRef.current = a;
    }
    const a = audioRef.current;
    seqRef.current = { ids, i: 0 };
    setActiveAyah(0);
    setProgress(0);
    a.src = audioUrl(ids[0]);
    a.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [ayahs]);

  const toggleLoop = useCallback(() => {
    setLoop((v) => {
      loopRef.current = !v;
      return !v;
    });
    hapticLight();
  }, []);

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      <div className="space-y-4">
        {ayahs.map((ay, i) => {
          const isPlaying = playing && i === activeAyah;
          const active =
            wordSync && isPlaying
              ? activeWordIndex(ay.timestamps, progress, duration, ay.words?.length ?? 0)
              : -1;
          return (
            <div key={`${ay.surah}:${ay.ayah}`}>
              <span className="w-6 h-6 mb-1.5 rounded-full bg-[var(--color-gold)]/15 text-gold text-[11px] font-bold flex items-center justify-center">
                {ay.ayah}
              </span>
              <p
                dir="rtl"
                className="font-arabic text-themed text-right leading-[2.2] text-2xl transition-colors"
              >
                {wordSync && ay.words && ay.words.length ? (
                  ay.words.map((w, wi) => (
                    <span
                      key={wi}
                      style={active === wi ? { color: "var(--color-gold)" } : undefined}
                    >
                      {w.t}{" "}
                    </span>
                  ))
                ) : (
                  <span>{ay.arabic}</span>
                )}
              </p>
              {showTranslation && (
                <p className="text-themed-muted text-sm mt-2">{ay.translation}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            hapticLight();
            playing ? stop() : play();
          }}
          disabled={ayahs.length === 0}
          className="flex-1 rounded-xl bg-[var(--color-gold)]/15 text-gold font-semibold py-3 flex items-center justify-center gap-2 touch-manipulation active:opacity-90 disabled:opacity-40"
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
          {playing ? "Pause" : "Listen"}
        </button>
        <button
          type="button"
          onClick={toggleLoop}
          aria-label="Loop"
          aria-pressed={loop}
          className={`w-12 rounded-xl border py-3 flex items-center justify-center touch-manipulation ${
            loop
              ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-gold"
              : "sidebar-border text-themed-muted"
          }`}
        >
          <Repeat size={17} />
        </button>
      </div>
    </div>
  );
}
