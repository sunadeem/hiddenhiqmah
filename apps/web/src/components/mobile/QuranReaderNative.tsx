"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  SlidersHorizontal,
  Play,
  Pause,
  X,
  Check,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Repeat,
} from "lucide-react";
import { useQuranAudio, type Verse } from "@hidden-hiqmah/ui/context/QuranAudioContext";
import {
  getQuranView,
  setQuranView,
  getQuranDisplay,
  setQuranDisplay,
  getFontSize,
  setFontSize,
  type QuranView,
  type QuranDisplay,
} from "@hidden-hiqmah/ui/lib/storage";
import { ActionSheet } from "@/components/mobile/LongPressActions";
import { hapticSelection, hapticLight, hapticMedium } from "@/lib/mobile/haptics";

type Word = { t: string; tr: string; m: string };
type WordsMap = Record<string, Word[]>;
type TimestampMap = Record<string, number[][]>;
type Chapter = {
  id: number;
  name: string;
  nameAr: string;
  meaning: string;
  verses: number;
  revelationPlace: string;
};

const AR_SIZES = ["text-2xl", "text-3xl", "text-4xl", "text-5xl"];

/** Current word index for a verse, from real timestamps + audio progress. */
function activeWordIndex(
  verseNumber: number,
  playingVerse: number | null,
  paused: boolean,
  ts: number[][] | undefined,
  progress: number,
  duration: number,
  wordCount: number
): number {
  if (playingVerse !== verseNumber || paused) return -1;
  const ms = progress * 1000;
  if (ts && ts.length) {
    for (let i = 0; i < ts.length; i++) {
      if (ms >= ts[i][0] && ms < ts[i][1]) return i;
    }
    if (ms >= ts[ts.length - 1][0]) return ts.length - 1;
    return -1;
  }
  if (duration > 0 && wordCount > 0) {
    return Math.min(Math.floor((progress / duration) * wordCount), wordCount - 1);
  }
  return -1;
}

export default function QuranReaderNative({
  chapter,
  verses,
  wordsData,
  timestampData,
}: {
  chapter: Chapter;
  verses: Verse[] | null;
  wordsData: WordsMap | null;
  timestampData: TimestampMap | null;
}) {
  const audio = useQuranAudio();
  const [view, setView] = useState<QuranView>("mushaf");
  const [display, setDisplay] = useState<QuranDisplay>({ arabic: true, translation: true, translit: false });
  const [fontSize, setFontSizeState] = useState(2);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sheetVerse, setSheetVerse] = useState<Verse | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);

  useEffect(() => {
    setView(getQuranView());
    setDisplay(getQuranDisplay());
    setFontSizeState(getFontSize());
  }, []);

  const updateView = (v: QuranView) => {
    hapticSelection();
    setView(v);
    setQuranView(v);
  };
  const updateDisplay = (patch: Partial<QuranDisplay>) => {
    hapticLight();
    setDisplay((prev) => {
      // Never allow all three off — keep Arabic as the floor.
      const next = { ...prev, ...patch };
      if (!next.arabic && !next.translation && !next.translit) next.arabic = true;
      setQuranDisplay(next);
      return next;
    });
  };
  const updateFont = (delta: number) => {
    setFontSizeState((n) => {
      const c = Math.max(0, Math.min(3, n + delta));
      setFontSize(c);
      return c;
    });
  };

  // In Focus mode, follow the verse that's playing.
  useEffect(() => {
    if (view === "focus" && audio.playingVerse != null && verses) {
      const i = verses.findIndex((v) => v.number === audio.playingVerse);
      if (i >= 0) setFocusIdx(i);
    }
  }, [audio.playingVerse, view, verses]);

  // ── Long-press (Mushaf) → action sheet, delegated over the verse list ──
  const lpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lpStart = useRef<{ x: number; y: number } | null>(null);
  const lpStartTouch = (e: React.TouchEvent) => {
    const t = e.touches[0];
    lpStart.current = { x: t.clientX, y: t.clientY };
    if (lpTimer.current) clearTimeout(lpTimer.current);
    lpTimer.current = setTimeout(() => {
      if (!lpStart.current || !verses) return;
      const el = document.elementFromPoint(lpStart.current.x, lpStart.current.y) as HTMLElement | null;
      const node = el?.closest("[data-vnum]");
      const n = node?.getAttribute("data-vnum");
      const v = verses.find((x) => String(x.number) === n);
      if (v) {
        hapticMedium();
        setSheetVerse(v);
      }
    }, 480);
  };
  const lpMoveTouch = (e: React.TouchEvent) => {
    if (!lpStart.current) return;
    const t = e.touches[0];
    if (Math.abs(t.clientX - lpStart.current.x) > 10 || Math.abs(t.clientY - lpStart.current.y) > 10) {
      if (lpTimer.current) clearTimeout(lpTimer.current);
      lpStart.current = null;
    }
  };
  const lpEnd = () => {
    if (lpTimer.current) clearTimeout(lpTimer.current);
  };

  const sub = `${chapter.meaning} · ${chapter.verses} verses · ${
    chapter.revelationPlace === "makkah" ? "Meccan" : "Medinan"
  }`;

  const playPause = (v: Verse) => {
    hapticLight();
    if (audio.playingVerse === v.number) audio.togglePause();
    else audio.playVerse(v);
  };

  return (
    <div className="-mx-3">
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 bg-[var(--color-bg)]/90 backdrop-blur-xl px-3"
        style={{ paddingTop: 4, paddingBottom: 8 }}
      >
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/quran"
            className="w-9 h-9 rounded-full flex items-center justify-center text-themed bg-white/[0.05] touch-manipulation"
            aria-label="All surahs"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col items-center min-w-0">
            <span className="text-themed font-bold text-[15px] truncate">{chapter.name}</span>
            <span className="text-themed-muted text-[11px] truncate">{sub}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setSettingsOpen(true);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-themed bg-white/[0.05] touch-manipulation"
            aria-label="Reading settings"
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>
      </div>

      {!verses ? (
        <div className="px-3 py-16 text-center text-themed-muted text-sm">Loading…</div>
      ) : view === "focus" ? (
        <FocusView
          verses={verses}
          idx={focusIdx}
          setIdx={setFocusIdx}
          display={display}
          fontSize={fontSize}
          wordsData={wordsData}
          timestampData={timestampData}
          audio={audio}
          onPlayPause={playPause}
        />
      ) : (
        <div
          className="px-3 pt-3"
          onTouchStart={lpStartTouch}
          onTouchMove={lpMoveTouch}
          onTouchEnd={lpEnd}
          onTouchCancel={lpEnd}
          style={{ WebkitTouchCallout: "none" }}
        >
          {chapter.id !== 1 && chapter.id !== 9 && (
            <p className="font-arabic text-gold text-2xl text-center leading-loose mb-5">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          )}
          {verses.map((v) => (
            <VerseBlock
              key={v.id}
              verse={v}
              display={display}
              fontSize={fontSize}
              words={wordsData?.[String(v.number)]}
              ts={timestampData?.[String(v.number)]}
              audio={audio}
              onPlayPause={() => playPause(v)}
            />
          ))}
        </div>
      )}

      {/* Action sheet (long-press) */}
      {sheetVerse && (
        <ActionSheet
          item={{
            bookmarkType: "verse",
            bookmarkId: sheetVerse.key,
            title: `Quran ${sheetVerse.key}`,
            arabic: sheetVerse.textAr,
            english: sheetVerse.textEn,
            reference: `Quran ${sheetVerse.key}`,
            onPlay: () => audio.playVerse(sheetVerse),
          }}
          open
          onClose={() => setSheetVerse(null)}
        />
      )}

      {/* Settings sheet */}
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        view={view}
        onView={updateView}
        display={display}
        onDisplay={updateDisplay}
        fontSize={fontSize}
        onFont={updateFont}
        autoNext={audio.autoNextSurah}
        onToggleAutoNext={audio.toggleAutoNextSurah}
      />
    </div>
  );
}

// ── A single verse in Mushaf mode ──
function VerseBlock({
  verse,
  display,
  fontSize,
  words,
  ts,
  audio,
  onPlayPause,
}: {
  verse: Verse;
  display: QuranDisplay;
  fontSize: number;
  words: Word[] | undefined;
  ts: number[][] | undefined;
  audio: ReturnType<typeof useQuranAudio>;
  onPlayPause: () => void;
}) {
  const playing = audio.playingVerse === verse.number;
  const active = activeWordIndex(
    verse.number,
    audio.playingVerse,
    audio.audioPaused,
    ts,
    audio.audioProgress,
    audio.audioDuration,
    words?.length ?? 0
  );

  return (
    <div
      data-vnum={verse.number}
      className={`py-4 border-b sidebar-border ${playing ? "bg-[var(--color-gold)]/[0.06] -mx-3 px-3 rounded-xl" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="w-7 h-7 rounded-full bg-[var(--color-gold)]/15 text-gold text-xs font-bold flex items-center justify-center">
          {verse.number}
        </span>
        <button
          type="button"
          onClick={onPlayPause}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gold bg-[var(--color-gold)]/10 touch-manipulation"
          aria-label={playing && !audio.audioPaused ? "Pause" : "Play verse"}
        >
          {playing && !audio.audioPaused ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>

      {display.arabic && (
        <p
          dir="rtl"
          className={`font-arabic text-themed text-right leading-[2.2] ${AR_SIZES[fontSize]} flex flex-wrap justify-start gap-x-2`}
        >
          {words
            ? words.map((w, wi) => (
                <span
                  key={wi}
                  className={
                    wi === active
                      ? "text-gold"
                      : playing && active >= 0 && wi < active
                      ? "text-gold/60"
                      : ""
                  }
                >
                  {w.t}
                </span>
              ))
            : verse.textAr}
        </p>
      )}

      {display.translit && (
        <p className="text-gold/80 text-sm italic leading-relaxed mt-2 flex flex-wrap gap-x-1.5">
          {words
            ? words.map((w, wi) => (
                <span key={wi} className={wi === active ? "text-gold not-italic font-medium" : ""}>
                  {w.tr}
                </span>
              ))
            : verse.textTranslit}
        </p>
      )}

      {display.translation && (
        <p className={`text-sm leading-relaxed mt-2 ${playing ? "text-themed" : "text-themed-muted"}`}>
          {verse.textEn}
        </p>
      )}
    </div>
  );
}

// ── Focus mode: one āyah at a time ──
function FocusView({
  verses,
  idx,
  setIdx,
  display,
  fontSize,
  wordsData,
  timestampData,
  audio,
  onPlayPause,
}: {
  verses: Verse[];
  idx: number;
  setIdx: (n: number) => void;
  display: QuranDisplay;
  fontSize: number;
  wordsData: WordsMap | null;
  timestampData: TimestampMap | null;
  audio: ReturnType<typeof useQuranAudio>;
  onPlayPause: (v: Verse) => void;
}) {
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const clamp = (n: number) => Math.max(0, Math.min(verses.length - 1, n));
  const verse = verses[clamp(idx)];
  if (!verse) return null;
  const words = wordsData?.[String(verse.number)];
  const ts = timestampData?.[String(verse.number)];
  const active = activeWordIndex(
    verse.number,
    audio.playingVerse,
    audio.audioPaused,
    ts,
    audio.audioProgress,
    audio.audioDuration,
    words?.length ?? 0
  );
  const playing = audio.playingVerse === verse.number;

  const go = (d: number) => {
    hapticSelection();
    setIdx(clamp(idx + d));
  };

  return (
    <div
      className="px-5 flex flex-col"
      style={{ minHeight: "70vh" }}
      onTouchStart={(e) => {
        swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        if (!swipe.current) return;
        const dx = e.changedTouches[0].clientX - swipe.current.x;
        const dy = Math.abs(e.changedTouches[0].clientY - swipe.current.y);
        swipe.current = null;
        if (Math.abs(dx) > 60 && dy < 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="text-center text-[10px] uppercase tracking-[0.2em] text-themed-muted py-3">
        Verse {verse.number} · {idx + 1} / {verses.length}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={verse.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col justify-center gap-6"
        >
          {display.arabic && (
            <p dir="rtl" className={`font-arabic text-themed text-center leading-[2.3] ${AR_SIZES[Math.min(fontSize + 1, 3)]} flex flex-wrap justify-center gap-x-2`}>
              {words
                ? words.map((w, wi) => (
                    <span key={wi} className={wi === active ? "text-gold" : playing && active >= 0 && wi < active ? "text-gold/60" : ""}>
                      {w.t}
                    </span>
                  ))
                : verse.textAr}
            </p>
          )}
          {display.translit && (
            <p className="text-gold/80 text-center text-sm italic leading-relaxed">
              {verse.textTranslit}
            </p>
          )}
          {display.translation && (
            <p className="text-themed-muted text-center text-[15px] leading-relaxed max-w-prose mx-auto">
              {verse.textEn}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between py-4">
        <button type="button" onClick={() => go(-1)} disabled={idx <= 0} className={`p-3 rounded-full touch-manipulation ${idx <= 0 ? "text-themed-muted opacity-30" : "text-themed"}`} aria-label="Previous verse">
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={() => onPlayPause(verse)}
          className="w-14 h-14 rounded-full bg-[var(--color-gold)] text-[var(--color-bg)] flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
          aria-label={playing && !audio.audioPaused ? "Pause" : "Play"}
        >
          {playing && !audio.audioPaused ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </button>
        <button type="button" onClick={() => go(1)} disabled={idx >= verses.length - 1} className={`p-3 rounded-full touch-manipulation ${idx >= verses.length - 1 ? "text-themed-muted opacity-30" : "text-themed"}`} aria-label="Next verse">
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}

// ── Reading settings bottom sheet ──
function SettingsSheet({
  open,
  onClose,
  view,
  onView,
  display,
  onDisplay,
  fontSize,
  onFont,
  autoNext,
  onToggleAutoNext,
}: {
  open: boolean;
  onClose: () => void;
  view: QuranView;
  onView: (v: QuranView) => void;
  display: QuranDisplay;
  onDisplay: (p: Partial<QuranDisplay>) => void;
  fontSize: number;
  onFont: (d: number) => void;
  autoNext: boolean;
  onToggleAutoNext: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[71] bg-themed border-t sidebar-border rounded-t-2xl px-5"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)", paddingTop: 8 }}
          >
            <div className="flex justify-center pb-3">
              <div className="w-10 h-1.5 rounded-full bg-white/25" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-themed font-bold text-lg">Reading</h2>
              <button type="button" onClick={onClose} className="p-2 -mr-2 text-themed-muted touch-manipulation" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {/* View mode */}
            <div className="text-[10px] uppercase tracking-[0.2em] text-themed-muted mb-2">View</div>
            <div className="flex bg-white/[0.06] rounded-xl p-1 gap-1 mb-5">
              {(["mushaf", "focus"] as QuranView[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onView(v)}
                  className={`flex-1 text-center text-sm font-semibold py-2 rounded-lg capitalize touch-manipulation ${
                    view === v ? "bg-[var(--color-gold)]/18 text-gold" : "text-themed-muted"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Display toggles */}
            <div className="text-[10px] uppercase tracking-[0.2em] text-themed-muted mb-2">Show</div>
            <div className="space-y-1 mb-5">
              {([
                ["arabic", "Arabic"],
                ["translation", "Translation"],
                ["translit", "Transliteration"],
              ] as [keyof QuranDisplay, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onDisplay({ [key]: !display[key] })}
                  className="w-full flex items-center justify-between py-2.5 text-left touch-manipulation"
                >
                  <span className="text-themed text-[15px]">{label}</span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      display[key] ? "bg-[var(--color-gold)] text-[var(--color-bg)]" : "border-2 sidebar-border"
                    }`}
                  >
                    {display[key] && <Check size={14} strokeWidth={3} />}
                  </span>
                </button>
              ))}
            </div>

            {/* Text size */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-themed text-[15px]">Text size</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onFont(-1)} className="w-9 h-9 rounded-full bg-white/[0.06] text-themed flex items-center justify-center touch-manipulation" aria-label="Smaller">
                  <Minus size={16} />
                </button>
                <span className="text-themed-muted text-xs w-8 text-center tabular-nums">{fontSize + 1}/4</span>
                <button type="button" onClick={() => onFont(1)} className="w-9 h-9 rounded-full bg-white/[0.06] text-themed flex items-center justify-center touch-manipulation" aria-label="Larger">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Auto-play next surah */}
            <button
              type="button"
              onClick={() => {
                hapticLight();
                onToggleAutoNext();
              }}
              className="w-full flex items-center justify-between py-2.5 mb-2 text-left touch-manipulation"
            >
              <span className="inline-flex items-center gap-2 text-themed text-[15px]">
                <Repeat size={16} className="text-themed-muted" /> Auto-play next surah
              </span>
              <span
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  autoNext ? "bg-[var(--color-gold)]" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                    autoNext ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
