"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Repeat,
  Eye,
  Mic,
  Square,
  Loader2,
  CheckCircle2,
  Volume2,
} from "lucide-react";
import { VoiceRecorder } from "@independo/capacitor-voice-recorder";
import type { AyahRef, Grade, HifzAdapter, HifzCard } from "@hidden-hiqmah/ui/lib/hifz/types";
import { ayahsInCard } from "@/lib/hifz/quran";
import { useIsNative } from "@/lib/mobile/platform";
import { registerAudioChannel, claimAudioFocus } from "@hidden-hiqmah/ui/lib/audioCoordinator";

type Verse = {
  id: number;
  number: number;
  key: string;
  textAr: string;
  textEn: string;
  textTranslit: string;
};
type Word = { t: string; tr: string; m: string };
type Loaded = { ref: AyahRef; verse: Verse | null; words: Word[] | null };

type Mode = "listen" | "hide" | "hint" | "record";
const MODES: { key: Mode; label: string; icon: typeof Eye }[] = [
  { key: "listen", label: "Listen", icon: Volume2 },
  { key: "hide", label: "Hide", icon: Eye },
  { key: "hint", label: "Hint", icon: Eye },
  { key: "record", label: "Record", icon: Mic },
];

const GRADES: { key: Grade; label: string; cls: string }[] = [
  { key: "again", label: "Forgot", cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  { key: "hard", label: "Hard", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { key: "good", label: "Good", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { key: "easy", label: "Easy", cls: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
];

const audioUrl = (verseId: number) =>
  `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${verseId}.mp3`;

// WKWebView/Safari's MediaRecorder supports audio/mp4 (NOT audio/webm). Pick a
// container the recorder actually produces AND the <audio> tag can play back, so
// the recording isn't reinterpreted as noise.
function pickAudioMime(): string {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
  for (const t of ["audio/mp4", "audio/aac", "audio/webm;codecs=opus", "audio/webm"]) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {
      /* ignore */
    }
  }
  return "";
}

async function loadCardData(refs: AyahRef[]): Promise<Loaded[]> {
  const surahs = [...new Set(refs.map((r) => r.surah))];
  const vmap: Record<number, Verse[]> = {};
  const wmap: Record<number, Record<string, Word[]>> = {};
  await Promise.all(
    surahs.map(async (s) => {
      const vmod = await import(`@hidden-hiqmah/content/quran/verses/${s}.json`);
      vmap[s] = vmod.default as Verse[];
      try {
        const wmod = await import(`@hidden-hiqmah/content/quran/words/${s}.json`);
        wmap[s] = wmod.default as Record<string, Word[]>;
      } catch {
        /* words optional */
      }
    })
  );
  return refs.map((r) => ({
    ref: r,
    verse: vmap[r.surah]?.find((v) => v.number === r.ayah) ?? null,
    words: wmap[r.surah]?.[String(r.ayah)] ?? null,
  }));
}

export default function HifzSession({
  adapter,
  queue,
  today,
  onDone,
}: {
  adapter: HifzAdapter;
  queue: HifzCard[];
  today: string;
  onDone: () => void;
}) {
  const native = useIsNative();
  const [remaining, setRemaining] = useState<HifzCard[]>(() => queue);
  const [mode, setMode] = useState<Mode>("listen");
  const [data, setData] = useState<Loaded[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);

  const current = remaining[0] ?? null;
  const total = queue.length;
  // Distinct cards finished (an "again" re-queues without completing, so it never
  // inflates this — it's derived from what's left, not from grade taps).
  const completed = total - remaining.length;

  // ── Audio (sequential per-ayah playback) ──
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seqRef = useRef<{ ids: number[]; i: number }>({ ids: [], i: 0 });
  const loopRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);

  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  // Register with the global audio coordinator so starting Qur'an recitation or
  // the adhan elsewhere stops Hifz playback (and vice-versa) — no two channels
  // play at once.
  useEffect(() => registerAudioChannel("hifz", stopAudio), [stopAudio]);

  const playSeq = useCallback((ids: number[]) => {
    if (ids.length === 0) return;
    claimAudioFocus("hifz"); // stop the main Qur'an player / adhan first
    if (!audioRef.current) {
      const a = new Audio();
      a.onended = () => {
        const st = seqRef.current;
        st.i += 1;
        if (st.i < st.ids.length) {
          a.src = audioUrl(st.ids[st.i]);
          a.play().catch(() => setPlaying(false));
        } else if (loopRef.current) {
          st.i = 0;
          a.src = audioUrl(st.ids[0]);
          a.play().catch(() => setPlaying(false));
        } else {
          setPlaying(false);
        }
      };
      audioRef.current = a;
    }
    const a = audioRef.current;
    seqRef.current = { ids, i: 0 };
    a.src = audioUrl(ids[0]);
    a.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);

  // ── Recording ──
  const [recState, setRecState] = useState<"idle" | "recording" | "recorded">("idle");
  const [recUrl, setRecUrl] = useState<string | null>(null);
  const [recErr, setRecErr] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recUrlRef = useRef<string | null>(null); // for unmount revoke (closure-safe)
  const recReqRef = useRef(0); // request token — invalidates superseded getUserMedia

  const setRecUrlSafe = useCallback((url: string | null) => {
    setRecUrl((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev); // data: URLs need no revoke
      return url;
    });
    recUrlRef.current = url;
  }, []);

  const resetRec = useCallback(() => {
    recReqRef.current++; // invalidate any in-flight start
    if (native) {
      VoiceRecorder.stopRecording().catch(() => {}); // discard if mid-recording
    } else {
      try {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      } catch {
        /* ignore */
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
    setRecState("idle");
    setRecErr(null);
    setRecUrlSafe(null);
  }, [native, setRecUrlSafe]);

  const startRec = useCallback(async () => {
    setRecErr(null);
    claimAudioFocus("hifz"); // stop any other playback before recording
    const myToken = ++recReqRef.current;

    if (native) {
      // Native AVAudioRecorder via the plugin — reliable on real iOS + triggers
      // the OS mic-permission prompt (NSMicrophoneUsageDescription).
      try {
        const perm = await VoiceRecorder.requestAudioRecordingPermission();
        if (myToken !== recReqRef.current) return;
        if (!perm.value) {
          setRecErr("Allow microphone access to record (Settings › Hidden Hiqmah).");
          return;
        }
        await VoiceRecorder.startRecording();
        if (myToken !== recReqRef.current) {
          VoiceRecorder.stopRecording().catch(() => {});
          return;
        }
        setRecState("recording");
      } catch {
        setRecErr("Couldn't start recording.");
        setRecState("idle");
      }
      return;
    }

    // Web: browser MediaRecorder.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (myToken !== recReqRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const mime = pickAudioMime();
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || mime || "audio/mp4" });
        setRecUrlSafe(URL.createObjectURL(blob));
        setRecState("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };
      recorderRef.current = mr;
      mr.start();
      setRecState("recording");
    } catch {
      setRecErr("Microphone unavailable — allow mic access to record.");
      setRecState("idle");
    }
  }, [native, setRecUrlSafe]);

  const stopRec = useCallback(async () => {
    if (native) {
      try {
        const { value } = await VoiceRecorder.stopRecording();
        setRecUrlSafe(`data:${value.mimeType || "audio/aac"};base64,${value.recordDataBase64}`);
        setRecState("recorded");
      } catch {
        setRecErr("Couldn't save the recording.");
        setRecState("idle");
      }
      return;
    }
    try {
      recorderRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, [native, setRecUrlSafe]);

  // Load ayahs whenever the current card changes; reset per-card UI state.
  useEffect(() => {
    if (!current) return;
    let alive = true;
    setData(null);
    setRevealed(false);
    stopAudio();
    resetRec();
    loadCardData(ayahsInCard(current)).then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (recUrlRef.current && recUrlRef.current.startsWith("blob:"))
        URL.revokeObjectURL(recUrlRef.current);
    };
  }, []);

  const verseIds = (data ?? []).map((d) => d.verse?.id).filter((x): x is number => !!x);

  const grade = useCallback(
    async (g: Grade) => {
      if (!current || busy) return;
      setBusy(true);
      try {
        await adapter.grade(current.id, g, today);
        stopAudio();
        resetRec();
        setRevealed(false);
        setRemaining((r) => (g === "again" ? [...r.slice(1), current] : r.slice(1)));
      } finally {
        setBusy(false);
      }
    },
    [current, busy, adapter, today, stopAudio, resetRec]
  );

  // ── Session complete ──
  if (!current) {
    return (
      <div className="flex flex-col items-center text-center pt-16 px-6">
        <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/15 text-gold flex items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-themed text-xl font-bold">Session complete</h2>
        <p className="text-themed-muted text-sm mt-1">
          {total} card{total === 1 ? "" : "s"} reviewed — masha&apos;Allah.
        </p>
        <button
          onClick={onDone}
          className="mt-6 rounded-xl bg-gold text-[#0a1628] font-bold px-8 py-3 active:opacity-90 touch-manipulation"
        >
          Done
        </button>
      </div>
    );
  }

  const showReveal = (mode === "hide" || mode === "hint") && !revealed;

  return (
    <div className="space-y-3">
      {/* Progress + label */}
      <div className="flex items-center justify-between px-1">
        <p className="text-themed-muted text-xs">
          {Math.min(completed + 1, total)} of {total}
        </p>
        <p className="text-gold text-sm font-bold">{current.label}</p>
      </div>
      <div className="h-1 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>

      {/* Mode tabs */}
      <div className="grid grid-cols-4 gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              if (mode === "record" && m.key !== "record") resetRec();
              setMode(m.key);
              setRevealed(false);
            }}
            className={`rounded-xl border py-2 text-xs font-semibold touch-manipulation transition-colors ${
              mode === m.key
                ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-gold"
                : "sidebar-border card-bg text-themed-muted"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Card body */}
      <div className="card-bg rounded-2xl border sidebar-border p-4 min-h-[200px]">
        {!data ? (
          <div className="flex items-center justify-center py-12 text-themed-muted">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((d, i) => (
              <AyahView key={i} loaded={d} mode={mode} revealed={revealed} />
            ))}
          </div>
        )}
      </div>

      {/* Reveal */}
      {showReveal && (
        <button
          onClick={() => setRevealed(true)}
          className="w-full rounded-xl border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-gold font-semibold py-3 flex items-center justify-center gap-2 touch-manipulation active:opacity-90"
        >
          <Eye size={17} /> Reveal
        </button>
      )}

      {/* Audio controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => (playing ? stopAudio() : playSeq(verseIds))}
          disabled={verseIds.length === 0}
          className="flex-1 rounded-xl bg-[var(--color-gold)]/15 text-gold font-semibold py-3 flex items-center justify-center gap-2 touch-manipulation active:opacity-90 disabled:opacity-40"
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
          {playing ? "Pause" : "Listen"}
        </button>
        <button
          onClick={() => {
            const v = !loop;
            setLoop(v);
            loopRef.current = v;
          }}
          aria-label="Loop"
          className={`w-12 rounded-xl border py-3 flex items-center justify-center touch-manipulation ${
            loop ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-gold" : "sidebar-border text-themed-muted"
          }`}
        >
          <Repeat size={17} />
        </button>
      </div>

      {/* Record controls */}
      {mode === "record" && (
        <div className="card-bg rounded-2xl border sidebar-border p-4 space-y-3">
          {recErr && <p className="text-rose-300 text-xs">{recErr}</p>}
          <div className="flex items-center gap-2">
            {recState === "recording" ? (
              <button
                onClick={stopRec}
                className="flex-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold py-3 flex items-center justify-center gap-2 touch-manipulation"
              >
                <Square size={15} className="fill-current" /> Stop recording
              </button>
            ) : (
              <button
                onClick={startRec}
                className="flex-1 rounded-xl bg-[var(--color-gold)]/15 text-gold font-semibold py-3 flex items-center justify-center gap-2 touch-manipulation active:opacity-90"
              >
                <Mic size={16} /> {recState === "recorded" ? "Record again" : "Record yourself"}
              </button>
            )}
          </div>
          {recUrl && (
            <div>
              <p className="text-themed-muted text-xs mb-1.5">Your recitation — compare with the reciter above:</p>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio src={recUrl} controls className="w-full h-9" />
            </div>
          )}
        </div>
      )}

      {/* Grade */}
      <div>
        <p className="text-themed-muted text-[11px] text-center mb-2">How well did you recall it?</p>
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button
              key={g.key}
              onClick={() => grade(g.key)}
              disabled={busy}
              className={`rounded-xl border py-3 flex items-center justify-center text-sm font-bold touch-manipulation active:opacity-80 disabled:opacity-50 ${g.cls}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AyahView({
  loaded,
  mode,
  revealed,
}: {
  loaded: Loaded;
  mode: Mode;
  revealed: boolean;
}) {
  const { verse, words, ref } = loaded;
  if (!verse) return null;
  const blurred = (mode === "hide" || mode === "hint") && !revealed;
  const showCue = mode === "hide" || mode === "hint";

  let arabic: React.ReactNode;
  if (mode === "hint" && !revealed && words && words.length) {
    // Progressive hint: first word clear, the rest blurred.
    arabic = words.map((w, i) => (
      <span key={i} className={i === 0 ? "" : "blur-[6px] select-none"}>
        {w.t}{" "}
      </span>
    ));
  } else {
    arabic = (
      <span className={blurred ? "blur-[7px] select-none" : ""}>{verse.textAr}</span>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-[var(--color-gold)]/15 text-gold text-[11px] font-bold flex items-center justify-center shrink-0">
          {ref.ayah}
        </span>
      </div>
      <p dir="rtl" className="font-arabic text-themed text-right leading-[2.2] text-2xl">
        {arabic}
      </p>
      {showCue && (
        <p className="text-themed-muted text-xs mt-2 italic">{verse.textEn}</p>
      )}
      {mode === "listen" && (
        <p className="text-themed-muted text-sm mt-2">{verse.textEn}</p>
      )}
    </div>
  );
}
