"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, ChevronFirst, ChevronLast, X } from "lucide-react";
import { useQuranAudio } from "@/context/QuranAudioContext";

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export default function MiniPlayer() {
  const pathname = usePathname();
  const {
    playingVerse,
    audioProgress,
    audioDuration,
    audioPaused,
    chapter,
    surahId,
    togglePause,
    skipNext,
    skipPrevious,
    skipNextSurah,
    skipPreviousSurah,
    seekTo,
    stopPlayback,
  } = useQuranAudio();

  // Don't show mini player if on the surah page that's currently playing
  const isOnPlayingSurah = surahId !== null && pathname === `/quran/${surahId}`;

  // Don't render if nothing is playing or we're on the surah page
  if (playingVerse === null || isOnPlayingSurah) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="mini-player"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-0 right-0 lg:right-4 lg:top-4 z-50 lg:rounded-xl overflow-hidden shadow-2xl"
        style={{ width: "min(100vw, 400px)" }}
      >
        <div className="card-bg border sidebar-border lg:rounded-xl">
          {/* Progress bar */}
          <div
            className="h-1 bg-[var(--color-gold)]/10 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seekTo(pct);
            }}
          >
            <div
              className="h-full bg-[var(--color-gold)] transition-[width] duration-200"
              style={{ width: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : "0%" }}
            />
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2">
            {/* Surah info — links back to surah page */}
            <Link
              href={`/quran/${surahId}?v=${playingVerse}`}
              className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              <p className="text-sm text-themed font-medium truncate">
                {chapter?.name} — Verse {playingVerse}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-themed-muted">al-Afasy</p>
                {audioDuration > 0 && (
                  <span className="text-[11px] text-themed-muted">
                    {formatTime(audioProgress)} / {formatTime(audioDuration)}
                  </span>
                )}
              </div>
            </Link>

            {/* Controls */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={skipPreviousSurah}
                className="w-6 h-7 rounded-full flex items-center justify-center text-themed-muted hover:text-themed transition-colors"
                title="Previous Surah"
              >
                <ChevronFirst size={14} />
              </button>
              <button
                onClick={skipPrevious}
                className="w-6 h-7 rounded-full flex items-center justify-center text-themed-muted hover:text-themed transition-colors"
                title="Previous Verse"
              >
                <SkipBack size={12} />
              </button>
              <button
                onClick={togglePause}
                className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold"
              >
                {audioPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button
                onClick={skipNext}
                className="w-6 h-7 rounded-full flex items-center justify-center text-themed-muted hover:text-themed transition-colors"
                title="Next Verse"
              >
                <SkipForward size={12} />
              </button>
              <button
                onClick={skipNextSurah}
                className="w-6 h-7 rounded-full flex items-center justify-center text-themed-muted hover:text-themed transition-colors"
                title="Next Surah"
              >
                <ChevronLast size={14} />
              </button>
              <button
                onClick={stopPlayback}
                className="w-6 h-7 rounded-full flex items-center justify-center text-themed-muted hover:text-themed transition-colors ml-1"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
