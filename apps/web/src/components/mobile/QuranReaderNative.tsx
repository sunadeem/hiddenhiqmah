"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { useAdhanAudio } from "@hidden-hiqmah/ui/context/AdhanAudioContext";
import {
  getQuranView,
  setQuranView,
  getQuranDisplay,
  setQuranDisplay,
  getFontSize,
  setFontSize,
  setLastPosition,
  type QuranView,
  type QuranDisplay,
} from "@hidden-hiqmah/ui/lib/storage";
import { ActionSheet } from "@/components/mobile/LongPressActions";
import UnderstandingSheet from "@/components/mobile/UnderstandingSheet";
import { hapticSelection, hapticLight, hapticMedium } from "@/lib/mobile/haptics";
import PageTip from "@/components/mobile/PageTip";

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
  // Only trust per-word timestamps when they match the word count exactly — a
  // handful of verses have a mismatch that otherwise leaves trailing words
  // un-highlighted (or highlights a phantom segment). Fall through to the
  // even-distribution estimate below when they don't line up.
  if (ts && ts.length === wordCount && wordCount > 0) {
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
  const adhan = useAdhanAudio();
  const playerVisible = audio.playingVerse != null || adhan.playing;
  const [view, setView] = useState<QuranView>("mushaf");
  const [display, setDisplay] = useState<QuranDisplay>({ arabic: true, translation: true, translit: false });
  const [fontSize, setFontSizeState] = useState(2);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sheetVerse, setSheetVerse] = useState<Verse | null>(null);
  const [wordSheet, setWordSheet] = useState<{ verseNumber: number; wordIdx: number; word: Word } | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);

  // Tap a word → open the Understanding sheet (root / meaning / occurrences / tutor).
  const onWord = useCallback((verseNumber: number, wordIdx: number, word: Word) => {
    hapticSelection();
    setWordSheet({ verseNumber, wordIdx, word });
  }, []);

  const searchParams = useSearchParams();
  const initialVerse = Number(searchParams.get("v")) || 0;
  const didInitVerse = useRef(false);
  const lastSavedVerse = useRef(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest playing verse, read inside the IO callback without re-creating it.
  const playingVerseRef = useRef<number | null>(null);
  playingVerseRef.current = audio.playingVerse;
  // Stable handle to the latest audio API so memoized children get callbacks
  // whose identity never changes (keeps VerseBlock from re-rendering every tick).
  const audioApiRef = useRef(audio);
  audioApiRef.current = audio;

  useEffect(() => {
    setView(getQuranView());
    setDisplay(getQuranDisplay());
    setFontSizeState(getFontSize());
  }, []);

  // Resume to ?v= on open: position Focus on it and scroll Mushaf to it (once).
  useEffect(() => {
    if (!verses || initialVerse <= 0 || didInitVerse.current) return;
    didInitVerse.current = true;
    lastSavedVerse.current = initialVerse;
    const i = verses.findIndex((v) => v.number === initialVerse);
    if (i >= 0) setFocusIdx(i);
    // Wait for fonts + word spans to lay out before scrolling, else the target
    // shifts under us and we land off-position. Double-rAF after fonts.ready,
    // with a timeout backstop for surahs without word data.
    let done = false;
    const scrollToVerse = () => {
      if (done) return;
      const el = document.querySelector(`[data-vnum="${initialVerse}"]`);
      if (el) {
        done = true;
        el.scrollIntoView({ block: "center" });
      }
    };
    const run = () => requestAnimationFrame(() => requestAnimationFrame(scrollToVerse));
    if (document.fonts?.ready) document.fonts.ready.then(run);
    else run();
    const t = setTimeout(scrollToVerse, 600);
    return () => clearTimeout(t);
  }, [verses, initialVerse]);

  // Remember the reading position so "Continue reading" resumes here.
  // Mushaf: track the verse nearest the top of the viewport as the user scrolls.
  // The position ref updates immediately; the localStorage write is debounced.
  useEffect(() => {
    if (view !== "mushaf" || !verses) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-vnum]"));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        // Playback owns the scroll and the Continue card prefers the playing
        // verse, so don't persist scroll positions during playback.
        if (playingVerseRef.current != null) return;
        // Pick the topmost intersecting verse (entry order isn't guaranteed).
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!top) return;
        const n = Number((top.target as HTMLElement).dataset.vnum);
        if (!n || n === lastSavedVerse.current) return;
        lastSavedVerse.current = n;
        if (flushTimer.current) clearTimeout(flushTimer.current);
        flushTimer.current = setTimeout(() => {
          flushTimer.current = null;
          setLastPosition(chapter.id, lastSavedVerse.current);
        }, 350);
      },
      { rootMargin: "-90px 0px -85% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      // Flush any pending position so leaving mid-scroll still persists it.
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
        flushTimer.current = null;
        setLastPosition(chapter.id, lastSavedVerse.current);
      }
    };
  }, [view, verses, chapter.id]);

  // Focus: the on-screen verse is the position.
  useEffect(() => {
    if (view !== "focus" || !verses) return;
    const v = verses[focusIdx];
    if (v && v.number !== lastSavedVerse.current) {
      lastSavedVerse.current = v.number;
      setLastPosition(chapter.id, v.number);
    }
  }, [view, focusIdx, verses, chapter.id]);

  const updateView = (v: QuranView) => {
    hapticSelection();
    // Entering Focus: align it with the last-read position (set by Mushaf scroll)
    // so the switch shows where you were instead of jumping back to verse 1.
    if (v === "focus" && verses && lastSavedVerse.current > 0) {
      const i = verses.findIndex((x) => x.number === lastSavedVerse.current);
      if (i >= 0) setFocusIdx(i);
    }
    setView(v);
    setQuranView(v);
    // Entering Mushaf while not playing: restore the scroll to the last-read
    // āyah (Focus set it) instead of snapping to the top. Double-rAF so the
    // Mushaf list has mounted before we scroll.
    if (v === "mushaf" && verses && audio.playingVerse == null && lastSavedVerse.current > 0) {
      const target = lastSavedVerse.current;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const el = document.querySelector(`[data-vnum="${target}"]`);
          if (el) el.scrollIntoView({ block: "center" });
        })
      );
    }
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

  // In Mushaf mode, keep the playing verse scrolled into view as playback advances.
  useEffect(() => {
    if (view !== "mushaf" || audio.playingVerse == null) return;
    const el = document.querySelector(`[data-vnum="${audio.playingVerse}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Keep the saved position in step with playback (the scroll IO is paused
    // while playing) so Continue Reading resumes at the last-played āyah.
    lastSavedVerse.current = audio.playingVerse;
    setLastPosition(chapter.id, audio.playingVerse);
  }, [audio.playingVerse, view, chapter.id]);

  // Focus mode is immersive: hide the bottom tab bar (the floating player becomes
  // the only bottom chrome). Toggled via a body class so MobileShell stays untouched.
  useEffect(() => {
    if (view !== "focus") return;
    document.body.classList.add("reader-immersive");
    return () => document.body.classList.remove("reader-immersive");
  }, [view]);

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

  const playPause = useCallback((v: Verse) => {
    hapticLight();
    const a = audioApiRef.current;
    if (a.playingVerse === v.number) a.togglePause();
    else a.playVerse(v);
  }, []);

  return (
    <div className="-mx-3">
      <PageTip
        delayMs={900}
        tips={[
          {
            key: "reader-focus-v2",
            title: "Make the reader yours",
            body: "Tap the settings icon to switch between Mushaf and Focus mode, show or hide the translation and transliteration, size the text, and play the recitation.",
          },
          {
            key: "reader-word-v2",
            title: "Tap any word to understand it",
            body: "Tap an Arabic word — in Mushaf or Focus mode — to see its meaning and root, where else it appears in the Qur'an, and to ask the tutor about it.",
          },
        ]}
      />
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

      {audio.audioError && (
        <div className="mx-3 mb-1 flex items-center justify-between gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
          <span>{audio.audioError}</span>
          <button
            type="button"
            onClick={audio.clearAudioError}
            className="shrink-0 opacity-70 px-1"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

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
          onWord={onWord}
        />
      ) : (
        <div
          className="px-3 pt-3"
          onTouchStart={lpStartTouch}
          onTouchMove={lpMoveTouch}
          onTouchEnd={lpEnd}
          onTouchCancel={lpEnd}
          style={{
            WebkitTouchCallout: "none",
            // Clear the floating player so the last verses aren't hidden behind it.
            paddingBottom: playerVisible ? "calc(env(safe-area-inset-bottom) + 88px)" : undefined,
          }}
        >
          {chapter.id !== 1 && chapter.id !== 9 && (
            <p className="font-arabic text-gold text-2xl text-center leading-loose mb-5">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          )}
          {verses.map((v) => {
            const vWords = wordsData?.[String(v.number)];
            return (
              <VerseBlock
                key={v.id}
                verse={v}
                display={display}
                fontSize={fontSize}
                words={vWords}
                active={activeWordIndex(
                  v.number,
                  audio.playingVerse,
                  audio.audioPaused,
                  timestampData?.[String(v.number)],
                  audio.audioProgress,
                  audio.audioDuration,
                  vWords?.length ?? 0
                )}
                playing={audio.playingVerse === v.number}
                paused={audio.audioPaused}
                onPlayPause={playPause}
                onWord={onWord}
              />
            );
          })}
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

      {/* Understanding sheet (tap a word) */}
      <UnderstandingSheet
        open={!!wordSheet}
        onClose={() => setWordSheet(null)}
        surah={chapter.id}
        verseNumber={wordSheet?.verseNumber ?? 0}
        wordIdx={wordSheet?.wordIdx ?? 0}
        word={wordSheet?.word ?? null}
      />

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
const VerseBlock = memo(function VerseBlock({
  verse,
  display,
  fontSize,
  words,
  active,
  playing,
  paused,
  onPlayPause,
  onWord,
}: {
  verse: Verse;
  display: QuranDisplay;
  fontSize: number;
  words: Word[] | undefined;
  active: number;
  playing: boolean;
  paused: boolean;
  onPlayPause: (v: Verse) => void;
  onWord: (verseNumber: number, wordIdx: number, word: Word) => void;
}) {
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
          onClick={() => onPlayPause(verse)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gold bg-[var(--color-gold)]/10 touch-manipulation"
          aria-label={playing && !paused ? "Pause" : "Play verse"}
        >
          {playing && !paused ? <Pause size={14} /> : <Play size={14} />}
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
                  onClick={() => onWord(verse.number, wi, w)}
                  className={`cursor-pointer rounded touch-manipulation transition-colors active:bg-[var(--color-gold)]/15 ${
                    wi === active
                      ? "text-gold"
                      : playing && active >= 0 && wi < active
                      ? "text-gold/60"
                      : ""
                  }`}
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
});

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
  onWord,
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
  onWord: (verseNumber: number, wordIdx: number, word: Word) => void;
}) {
  const swipe = useRef<{ x: number; y: number } | null>(null);
  // Ref to the currently-highlighted Arabic word so Focus mode can keep it on
  // screen during playback (see auto-scroll effect below).
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const adhan = useAdhanAudio();
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
  // The mini-player is mounted whenever a Quran verse is loaded (paused included)
  // OR the adhan is playing — that's what we must clear with the controls' offset.
  const playerMounted = audio.playingVerse != null || adhan.playing;
  // Show the in-view center play button unless a verse is actively playing — so it's
  // never redundant with the player, yet always available to start the on-screen verse
  // (incl. after pausing then navigating to a different āyah).
  const showCenterPlay = audio.playingVerse == null || audio.audioPaused;

  // Focus mode only: when the highlighted word advances (long āyahs wrap below
  // the fold), nudge it back into the visible band. Keyed on `active` so it
  // fires only as the active word changes — not on every scroll — and the
  // out-of-view guard means it won't fight the user's manual scrolling.
  // `active` is -1 unless the on-screen verse is actively playing, so this is
  // inert while paused/idle.
  useEffect(() => {
    if (active < 0) return;
    const el = activeWordRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const topBound = 72; // clear the status bar / header
    // clear the fixed controls (+ mini-player when a verse/adhan is loaded)
    const bottomBound = window.innerHeight - (playerMounted ? 220 : 140);
    if (rect.top < topBound || rect.bottom > bottomBound) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [active, playerMounted]);

  const go = (d: number) => {
    const next = clamp(idx + d);
    if (next === idx) return; // at the first/last verse — don't restart the current āyah
    hapticSelection();
    setIdx(next);
    if (audio.playingVerse != null && !audio.audioPaused) {
      // Playing → follow to the new āyah.
      audio.playVerse(verses[next]);
    } else if (audio.playingVerse != null && audio.audioPaused) {
      // Paused on a now off-screen āyah → clear the stale mini-player so its play
      // button can't resume the wrong verse; the center button starts the
      // on-screen one.
      audio.stopPlayback();
    }
  };

  return (
    <>
      <div
        className="px-5 flex flex-col"
        style={{
          minHeight: "calc(100dvh - 150px)",
          paddingBottom: playerMounted
            ? "calc(env(safe-area-inset-bottom) + 160px)"
            : "calc(env(safe-area-inset-bottom) + 96px)",
        }}
        onTouchStart={(e) => {
          swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          if (!swipe.current) return;
          const dx = e.changedTouches[0].clientX - swipe.current.x;
          const dy = Math.abs(e.changedTouches[0].clientY - swipe.current.y);
          swipe.current = null;
          if (Math.abs(dx) > 60 && dy < 50) {
            // This is our āyah swipe — stop it bubbling to MobileShell's
            // edge-swipe-back, so a right-swipe from the left edge goes to the
            // previous āyah instead of navigating back.
            e.stopPropagation();
            go(dx < 0 ? 1 : -1);
          }
        }}
      >
        <div className="text-center text-[10px] uppercase tracking-[0.2em] text-themed-muted py-3">
          Verse {verse.number} · {idx + 1} / {verses.length}
        </div>
        {/* Keyed motion.div (no AnimatePresence) so it remounts instantly on the
            new āyah — a blocking exit ("mode=wait") froze the outgoing āyah and
            desynced the highlight/view from the playing verse (QURAN-2 / QURAN-3). */}
        <motion.div
          key={verse.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col justify-center gap-6"
        >
            {display.arabic && (
              <p dir="rtl" className={`font-arabic text-themed text-center leading-[2.3] ${AR_SIZES[Math.min(fontSize + 1, 3)]} flex flex-wrap justify-center gap-x-2`}>
                {words
                  ? words.map((w, wi) => (
                      <span
                        key={wi}
                        ref={wi === active ? activeWordRef : null}
                        onClick={() => onWord(verse.number, wi, w)}
                        className={`cursor-pointer rounded touch-manipulation transition-colors active:bg-[var(--color-gold)]/15 ${wi === active ? "text-gold" : playing && active >= 0 && wi < active ? "text-gold/60" : ""}`}
                      >
                        {w.t}
                      </span>
                    ))
                  : verse.textAr}
              </p>
            )}
            {display.translit && (
              <p className="text-gold/80 text-center text-sm italic leading-relaxed flex flex-wrap justify-center gap-x-1.5">
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
              <p className="text-themed-muted text-center text-[15px] leading-relaxed max-w-prose mx-auto">
                {verse.textEn}
              </p>
            )}
        </motion.div>
      </div>

      {/* Fixed controls — sit above the floating player; play/pause is omitted
          while the player is up (it owns play/pause) to avoid a redundant control. */}
      <div
        className="fixed left-0 right-0 z-20 flex items-center justify-center gap-12 px-8"
        style={{
          bottom: playerMounted
            ? "calc(env(safe-area-inset-bottom) + 88px)"
            : "calc(env(safe-area-inset-bottom) + 18px)",
        }}
      >
        <button type="button" onClick={() => go(-1)} disabled={idx <= 0} className={`p-3 rounded-full bg-themed/70 backdrop-blur-md border sidebar-border touch-manipulation ${idx <= 0 ? "text-themed-muted opacity-30" : "text-themed"}`} aria-label="Previous verse">
          <ChevronLeft size={22} />
        </button>
        {showCenterPlay && (
          <button
            type="button"
            onClick={() => onPlayPause(verse)}
            className="w-14 h-14 rounded-full bg-[var(--color-gold)] text-[var(--color-bg)] flex items-center justify-center touch-manipulation active:scale-95 transition-transform shadow-lg shadow-black/30"
            aria-label="Play"
          >
            <Play size={24} className="ml-0.5" />
          </button>
        )}
        <button type="button" onClick={() => go(1)} disabled={idx >= verses.length - 1} className={`p-3 rounded-full bg-themed/70 backdrop-blur-md border sidebar-border touch-manipulation ${idx >= verses.length - 1 ? "text-themed-muted opacity-30" : "text-themed"}`} aria-label="Next verse">
          <ChevronRight size={22} />
        </button>
      </div>
    </>
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
                  autoNext ? "bg-[var(--color-gold)]" : "bg-[var(--overlay-strong)]"
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
