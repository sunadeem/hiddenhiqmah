"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  Play,
  Pause,
  X,
  SkipForward,
  SkipBack,
  ChevronFirst,
  ChevronLast,
  ChevronDown,
  BookOpen,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useQuranAudio } from "@hidden-hiqmah/ui/context/QuranAudioContext";
import { useAdhanAudio } from "@hidden-hiqmah/ui/context/AdhanAudioContext";

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MobilePlayer() {
  const quran = useQuranAudio();
  const adhan = useAdhanAudio();
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const quranActive = quran.playingVerse !== null;
  const adhanActive = adhan.playing;

  if (!quranActive && !adhanActive) return null;

  const isQuran = quranActive;

  return (
    <>
      <MiniBar
        isQuran={isQuran}
        quran={quran}
        adhan={adhan}
        onExpand={() => setExpanded(true)}
      />
      {mounted &&
        createPortal(
          <AnimatePresence>
            {expanded && (
              <FullSheet
                isQuran={isQuran}
                quran={quran}
                adhan={adhan}
                onClose={() => setExpanded(false)}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

type QuranAudio = ReturnType<typeof useQuranAudio>;
type AdhanAudio = ReturnType<typeof useAdhanAudio>;

function MiniBar({
  isQuran,
  quran,
  adhan,
  onExpand,
}: {
  isQuran: boolean;
  quran: QuranAudio;
  adhan: AdhanAudio;
  onExpand: () => void;
}) {
  const title = isQuran ? quran.chapter?.name || "Surah" : "Adhan";
  const subtitle = isQuran
    ? `Verse ${quran.playingVerse} of ${quran.chapter?.verses ?? "?"}`
    : "Call to Prayer";
  const paused = isQuran ? quran.audioPaused : adhan.paused;
  const progress = isQuran
    ? quran.audioDuration > 0
      ? (quran.audioProgress / quran.audioDuration) * 100
      : 0
    : adhan.duration > 0
    ? (adhan.progress / adhan.duration) * 100
    : 0;

  const handlePauseToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isQuran) quran.togglePause();
    else adhan.togglePause();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isQuran) quran.stopPlayback();
    else adhan.stop();
  };

  return (
    <div
      className="shrink-0 sidebar-bg border-t sidebar-border touch-manipulation"
      onClick={onExpand}
      role="button"
      tabIndex={0}
    >
      <div className="px-3 py-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
          {isQuran ? (
            <BookOpen size={18} className="text-gold" />
          ) : (
            <Volume2 size={18} className="text-gold" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-themed truncate">{title}</p>
          <p className="text-xs text-themed-muted truncate">{subtitle}</p>
        </div>
        <button
          onClick={handlePauseToggle}
          aria-label={paused ? "Play" : "Pause"}
          className="p-2 -mr-1 rounded-lg hover:bg-white/10 text-themed touch-manipulation"
        >
          {paused ? <Play size={22} /> : <Pause size={22} />}
        </button>
        <button
          onClick={handleClose}
          aria-label="Stop"
          className="p-2 -mr-2 rounded-lg hover:bg-white/10 text-themed-muted touch-manipulation"
        >
          <X size={20} />
        </button>
      </div>
      <div className="h-0.5 bg-white/5">
        <div
          className="h-full bg-[var(--color-gold)] transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function FullSheet({
  isQuran,
  quran,
  adhan,
  onClose,
}: {
  isQuran: boolean;
  quran: QuranAudio;
  adhan: AdhanAudio;
  onClose: () => void;
}) {
  const paused = isQuran ? quran.audioPaused : adhan.paused;
  const progress = isQuran ? quran.audioProgress : adhan.progress;
  const duration = isQuran ? quran.audioDuration : adhan.duration;
  const dragControls = useDragControls();

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    if (isQuran) quran.seekTo(fraction);
    else adhan.seekTo(fraction);
  };

  return (
    <motion.div
      key="full-sheet"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 320 }}
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0 }}
      dragElastic={{ top: 0, bottom: 0.4 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 140 || info.velocity.y > 500) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div
        className="shrink-0 relative"
        style={{ paddingTop: "max(calc(env(safe-area-inset-top) + 0.75rem), 4rem)" }}
      >
        <div
          onPointerDown={(e) => dragControls.start(e)}
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Drag down or tap to close"
          className="absolute inset-x-0 top-0 flex justify-center pt-2 pb-2 touch-manipulation cursor-grab active:cursor-grabbing"
          style={{
            paddingTop: "max(calc(env(safe-area-inset-top) + 0.5rem), 3.5rem)",
            touchAction: "none",
          }}
        >
          <div className="w-12 h-1.5 rounded-full bg-white/40" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close player"
          className="absolute right-3 p-3 rounded-full bg-white/10 text-themed touch-manipulation"
          style={{ top: "max(calc(env(safe-area-inset-top) + 0.5rem), 3.5rem)" }}
        >
          <ChevronDown size={22} />
        </button>
        <div className="text-center pb-3 pt-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-themed-muted">
            Now Playing
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 min-h-0 overflow-hidden">
        <div
          className="w-56 h-56 max-w-[65vw] max-h-[35vh] rounded-3xl flex items-center justify-center shrink-0 border border-[var(--color-gold)]/20"
          style={{ backgroundColor: "rgba(201,168,76,0.06)" }}
        >
          {isQuran ? (
            <span className="text-6xl font-arabic text-gold leading-none text-center">
              {quran.chapter?.nameAr || ""}
            </span>
          ) : (
            <Volume2 size={80} className="text-gold" />
          )}
        </div>

        <div className="text-center max-w-full">
          {isQuran ? (
            <>
              <h2 className="text-2xl font-bold text-themed mb-1 truncate max-w-[80vw]">
                {quran.chapter?.name || "Surah"}
              </h2>
              <p className="text-sm text-themed-muted">
                Verse {quran.playingVerse} of {quran.chapter?.verses ?? "?"}
              </p>
              {quran.surahId && (
                <Link
                  href={`/quran/${quran.surahId}?v=${quran.playingVerse}`}
                  onClick={onClose}
                  className="inline-block mt-3 text-xs text-gold underline-offset-2 hover:underline touch-manipulation"
                >
                  Open Surah →
                </Link>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-themed mb-1">Adhan</h2>
              <p className="text-sm text-themed-muted">Call to Prayer</p>
            </>
          )}
        </div>
      </div>

      <div
        className="shrink-0 px-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
      >
        <div
          className="h-1.5 bg-white/10 rounded-full cursor-pointer mb-2 touch-manipulation"
          onClick={handleSeek}
          role="slider"
          aria-label="Seek"
          aria-valuenow={duration > 0 ? (progress / duration) * 100 : 0}
        >
          <div
            className="h-full bg-[var(--color-gold)] rounded-full transition-[width] duration-100"
            style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-themed-muted mb-6">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between max-w-md mx-auto">
          {isQuran ? (
            <button
              onClick={() => quran.skipPreviousSurah()}
              aria-label="Previous surah"
              className="p-3 text-themed-muted touch-manipulation"
            >
              <ChevronFirst size={28} />
            </button>
          ) : (
            <div className="w-12" />
          )}
          {isQuran ? (
            <button
              onClick={() => quran.skipPrevious()}
              aria-label="Previous verse"
              className="p-3 text-themed touch-manipulation"
            >
              <SkipBack size={32} />
            </button>
          ) : (
            <div className="w-12" />
          )}
          <button
            onClick={() => {
              if (isQuran) quran.togglePause();
              else adhan.togglePause();
            }}
            aria-label={paused ? "Play" : "Pause"}
            className="bg-[var(--color-gold)] rounded-full w-16 h-16 flex items-center justify-center text-black touch-manipulation shrink-0"
          >
            {paused ? (
              <Play size={28} fill="currentColor" className="ml-1" />
            ) : (
              <Pause size={28} fill="currentColor" />
            )}
          </button>
          {isQuran ? (
            <button
              onClick={() => quran.skipNext()}
              aria-label="Next verse"
              className="p-3 text-themed touch-manipulation"
            >
              <SkipForward size={32} />
            </button>
          ) : (
            <div className="w-12" />
          )}
          {isQuran ? (
            <button
              onClick={() => quran.skipNextSurah()}
              aria-label="Next surah"
              className="p-3 text-themed-muted touch-manipulation"
            >
              <ChevronLast size={28} />
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
