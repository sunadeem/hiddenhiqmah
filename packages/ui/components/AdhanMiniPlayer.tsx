"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Volume2 } from "lucide-react";
import { useAdhanAudio } from "../context/AdhanAudioContext";

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export default function AdhanMiniPlayer() {
  const { playing, paused, progress, duration, source, togglePause, stop, seekTo } = useAdhanAudio();
  const constraintsRef = useRef<HTMLDivElement>(null);

  if (!playing) return null;

  return (
    <AnimatePresence>
      <div ref={constraintsRef} className="fixed inset-0 z-50 pointer-events-none">
        <motion.div
          key="adhan-mini-player"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          drag
          dragConstraints={constraintsRef}
          dragMomentum={false}
          dragElastic={0.1}
          whileDrag={{ scale: 1.02, cursor: "grabbing" }}
          className="fixed mini-player-pos z-50 lg:rounded-xl overflow-hidden shadow-2xl cursor-grab pointer-events-auto"
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
                style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
              />
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2">
              {/* Title */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Volume2 size={16} className="text-gold shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-themed font-medium truncate">
                    Adhan {source === "scheduled" && <span className="text-themed-muted font-normal">— prayer time</span>}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] text-themed-muted">Omar Hisham Al Arabi</p>
                    {duration > 0 && (
                      <span className="text-[11px] text-themed-muted">
                        {formatTime(progress)} / {formatTime(duration)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={togglePause}
                  className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold"
                  title={paused ? "Resume" : "Pause"}
                >
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                </button>
                <button
                  onClick={stop}
                  className="w-6 h-7 rounded-full flex items-center justify-center text-themed-muted hover:text-themed transition-colors ml-1"
                  title="Stop"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
