"use client";

// LearnLadder — the 5-rung "Learn today's station" flow of the Hifz Path.
// Meet → Absorb → Fade → Recite → Seal. The whole ladder is UI-only; the single
// graded moment is Seal, which resolves the user's self-rating (informed by Fade
// peeks) through srs.sealGrade and grades every member card of the station once.
//
// It learns the current gold station (path.todayLearn / currentStation) and works
// for both Qur'an āyāt and the 99 Names of Allah via resolveCardContent. On a
// clean Seal it returns to Today, or celebrates a completed sūrah at Milestone.
// On-brand: deep navy ground, gold accent, large RTL Arabic, calm + reverent.
// No greeting/eyebrow salām — straight to the work.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Mic,
  Square,
  Eye,
  ChevronRight,
  Play,
  RotateCcw,
} from "lucide-react";
import { VoiceRecorder } from "@independo/capacitor-voice-recorder";
import AudioAssistedPlayer from "@/components/mobile/hifz/AudioAssistedPlayer";
import {
  resolveCardContent,
  type ResolvedAyah,
} from "@/lib/hifz/hifzContent";
import { surahName, verseCount } from "@/lib/hifz/quran";
import { useIsNative } from "@/lib/mobile/platform";
import { claimAudioFocus } from "@hidden-hiqmah/ui/lib/audioCoordinator";
import {
  sealGrade,
  applyGrade,
  paceStationAyahs,
} from "@hidden-hiqmah/ui/lib/hifz/srs";
import { todayLocalDate } from "@hidden-hiqmah/ui/lib/daily/types";
import type { Grade, HifzCard, HifzStation } from "@hidden-hiqmah/ui/lib/hifz/types";
import type { NameOfAllah } from "@hidden-hiqmah/content/names-of-allah";
import type { HifzPath } from "@/lib/hifz/useHifzPath";
import {
  hapticLight,
  hapticMedium,
  hapticSelection,
  hapticSuccess,
} from "@/lib/mobile/haptics";

// Shared view union (owned by HifzScreen in Phase Wire; declared here so this
// screen is self-contained — screens never import one another, only call nav).
export type HifzView =
  | "onboarding"
  | "today"
  | "review"
  | "learn"
  | "practice"
  | "path"
  | "milestone";

export interface LearnLadderProps {
  path: HifzPath;
  nav: (view: HifzView, params?: unknown) => void;
}

// ── helpers ──
const AR_NUM = "٠١٢٣٤٥٦٧٨٩";
const arNum = (n: number) =>
  String(n)
    .split("")
    .map((d) => AR_NUM[+d] ?? d)
    .join("");

const STEPS = ["Meet", "Absorb", "Fade", "Recite", "Seal"] as const;
type Step = 0 | 1 | 2 | 3 | 4;

// Fade stages — progressively less help.
const FADE_STAGES = ["Full", "Letters", "Anchor", "Hidden"] as const;
type FadeStage = 0 | 1 | 2 | 3;

// A resolved ladder item, tagged with the member card it belongs to so a Fade
// peek can be attributed to the right card (its peekCount informs the Seal grade).
type QItem = ResolvedAyah & { cardId: string };
type AItem = { name: NameOfAllah; nameIndex: number; cardId: string };
type Content =
  | { kind: "quran"; items: QItem[] }
  | { kind: "asma"; items: AItem[] }
  | null;

// mm:ss elapsed readout for an active recording.
const fmtSecs = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// WKWebView/Safari's MediaRecorder produces audio/mp4 (not webm); pick a container
// the recorder makes AND <audio> can replay. Salvaged from HifzSession.
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

/** Human "returns in ~N days" for a Seal grade preview (via applyGrade). */
function returnsLabel(card: HifzCard, grade: Grade, today: string): string {
  if (grade === "again") return "we walk it again today";
  const next = applyGrade(card, grade, today, new Date().toISOString());
  const d = next.interval;
  if (d <= 1) return "returns tomorrow";
  return `returns in ~${d} days`;
}

export default function LearnLadder({ path, nav }: LearnLadderProps) {
  const native = useIsNative();
  const today = useMemo(() => todayLocalDate(), []);
  const station: HifzStation | null = path.todayLearn ?? path.currentStation;

  // Member cards of this station, in mushaf order (station.cardIds is ordered).
  const memberCards = useMemo<HifzCard[]>(() => {
    if (!station) return [];
    return station.cardIds
      .map((id) => path.cards.find((c) => c.id === id))
      .filter((c): c is HifzCard => Boolean(c));
  }, [station, path.cards]);

  const [content, setContent] = useState<Content>(null);
  const [step, setStep] = useState<Step>(0);
  const [ai, setAi] = useState(0); // current item index (Absorb / Fade)
  const [fadeStage, setFadeStage] = useState<FadeStage>(0);
  const [echoes, setEchoes] = useState<Record<number, number>>({}); // per-item echo dots
  const [peeking, setPeeking] = useState(false);
  const [peeks, setPeeks] = useState(0);
  const [busy, setBusy] = useState(false);

  const stationKey = station?.key ?? null;

  // Resolve the station's content (āyāt or Names), tagged with each item's card.
  useEffect(() => {
    if (memberCards.length === 0) {
      setContent(null);
      return;
    }
    let alive = true;
    (async () => {
      const resolved = await Promise.all(memberCards.map((c) => resolveCardContent(c)));
      if (!alive) return;
      const kind = resolved[0]?.kind ?? "quran";
      if (kind === "asma") {
        const items: AItem[] = [];
        resolved.forEach((r, ci) => {
          if (r.kind !== "asma") return;
          const startIdx = memberCards[ci].startAyah;
          r.names.forEach((name, ni) =>
            items.push({ name, nameIndex: startIdx + ni, cardId: memberCards[ci].id })
          );
        });
        setContent({ kind: "asma", items });
      } else {
        const items: QItem[] = [];
        resolved.forEach((r, ci) => {
          if (r.kind !== "quran") return;
          r.ayahs.forEach((ay) => items.push({ ...ay, cardId: memberCards[ci].id }));
        });
        setContent({ kind: "quran", items });
      }
    })().catch(() => {
      if (alive) setContent(null);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationKey, memberCards.length]);

  // Reset the ladder whenever the station changes.
  useEffect(() => {
    setStep(0);
    setAi(0);
    setFadeStage(0);
    setEchoes({});
    setPeeks(0);
  }, [stationKey]);

  const items = content?.items ?? [];
  const itemCount = items.length;
  const stationAyahs = itemCount || paceStationAyahs(path.plan?.pace ?? "steady");

  // ── recording (salvaged from HifzSession) ──
  const [recState, setRecState] = useState<"idle" | "recording" | "recorded">("idle");
  const [recUrl, setRecUrl] = useState<string | null>(null);
  const [recErr, setRecErr] = useState<string | null>(null);
  const [recSecs, setRecSecs] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recUrlRef = useRef<string | null>(null);
  const recReqRef = useRef(0);

  const setRecUrlSafe = useCallback((url: string | null) => {
    setRecUrl((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
    recUrlRef.current = url;
  }, []);

  const resetRec = useCallback(() => {
    recReqRef.current++;
    if (native) {
      VoiceRecorder.stopRecording().catch(() => {});
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
    hapticMedium();
    claimAudioFocus("hifz");
    const myToken = ++recReqRef.current;
    if (native) {
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
    hapticLight();
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

  // Elapsed timer while recording.
  useEffect(() => {
    if (recState !== "recording") return;
    setRecSecs(0);
    const id = setInterval(() => setRecSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recState]);

  // Reset recording when leaving the Recite rung + on unmount.
  useEffect(() => {
    if (step !== 3) resetRec();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  useEffect(
    () => () => {
      if (recUrlRef.current?.startsWith("blob:")) URL.revokeObjectURL(recUrlRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    []
  );

  // ── peek (Fade) — hold to reveal; each press counts + bumps the card ──
  const startPeek = useCallback(() => {
    setPeeking(true);
    setPeeks((p) => p + 1);
    hapticLight();
    const item = items[ai];
    if (item) path.actions.bumpPeek(item.cardId);
  }, [ai, items, path.actions]);
  const endPeek = useCallback(() => setPeeking(false), []);

  // ── Seal — the one graded moment ──
  const doSeal = useCallback(
    async (base: Grade) => {
      if (busy) return;
      setBusy(true);
      // Grade every member card once. Each card's own peekCount (persisted via
      // bumpPeek during Fade) shapes its Seal grade — heavy peeking can't count
      // as a clean recall.
      for (const c of memberCards) {
        const fresh = path.cards.find((x) => x.id === c.id) ?? c;
        const g = sealGrade(base, fresh.peekCount ?? 0, stationAyahs);
        await path.actions.grade(c.id, g);
      }
      if (base === "again") {
        // No harm — walk it again today. Back to Fade for another pass.
        hapticSelection();
        setStep(2);
        setAi(0);
        setFadeStage(0);
        setPeeks(0);
        setBusy(false);
        return;
      }
      hapticSuccess();
      // A completed sūrah earns a Milestone (station ends on the sūrah's last āyah).
      const finishedSurah =
        station &&
        content?.kind === "quran" &&
        station.endAyah === verseCount(station.endSurah);
      if (finishedSurah && station) {
        nav("milestone", { surah: station.endSurah });
      } else {
        nav("today");
      }
    },
    [busy, memberCards, path.cards, path.actions, stationAyahs, station, content, nav]
  );

  // ── nothing to learn ──
  if (!station || (content && itemCount === 0 && !path.loading)) {
    return (
      <div className="flex flex-col min-h-full">
        <FlowHeader label="Learning" step={0} onClose={() => nav("today")} />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <p className="text-themed text-lg" style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}>
            Nothing new to carry today.
          </p>
          <p className="text-themed-muted text-sm leading-relaxed">
            Your path is settling — reviews keep what you hold strong. New āyāt
            return once today&apos;s portion has rooted.
          </p>
          <button
            type="button"
            onClick={() => nav("today")}
            className="mt-2 rounded-xl bg-[var(--color-gold)] text-black font-semibold px-6 py-3 touch-manipulation active:opacity-90"
          >
            Back to Today
          </button>
        </div>
      </div>
    );
  }

  if (path.loading || !content) {
    return (
      <div className="flex flex-col min-h-full">
        <FlowHeader label="Learning" step={step} onClose={() => nav("today")} />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-themed-muted text-sm">Preparing your āyāt…</span>
        </div>
      </div>
    );
  }

  const stationLabel = station.label || `${surahName(station.startSurah)}`;

  return (
    <div className="flex flex-col min-h-full">
      <FlowHeader label={stationLabel} step={step} onClose={() => nav("today")} />

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {step === 0 && <Meet content={content} />}
        {step === 1 && (
          <Absorb
            content={content}
            ai={ai}
            echoes={echoes}
            onEcho={(i) =>
              setEchoes((e) => ({ ...e, [i]: Math.min(3, (e[i] ?? 0) + 1) }))
            }
          />
        )}
        {step === 2 && (
          <Fade
            content={content}
            ai={ai}
            fadeStage={fadeStage}
            peeking={peeking}
            peeks={peeks}
            onStage={(s) => {
              hapticSelection();
              setFadeStage(s);
            }}
            startPeek={startPeek}
            endPeek={endPeek}
          />
        )}
        {step === 3 && (
          <Recite
            content={content}
            native={native}
            recState={recState}
            recUrl={recUrl}
            recErr={recErr}
            recSecs={recSecs}
            startRec={startRec}
            stopRec={stopRec}
            resetRec={resetRec}
          />
        )}
        {step === 4 && (
          <Seal
            content={content}
            stationLabel={stationLabel}
            peeks={peeks}
            firstCard={memberCards[0]}
            today={today}
            stationAyahs={stationAyahs}
            busy={busy}
            onSeal={doSeal}
          />
        )}
      </div>

      {/* footer — advance controls (Seal has its own inline grades) */}
      {step < 4 && (
        <div className="px-6 pb-8 pt-3 flex flex-col gap-2.5">
          <LadderFooter
            step={step}
            ai={ai}
            fadeStage={fadeStage}
            itemCount={itemCount}
            contentKind={content.kind}
            onBack={() => {
              hapticLight();
              if (step === 0) {
                nav("today");
                return;
              }
              setStep((s) => Math.max(0, s - 1) as Step);
              setAi(0);
              setFadeStage(0);
            }}
            onNext={() => {
              hapticLight();
              // Meet → Absorb
              if (step === 0) {
                setStep(1);
                setAi(0);
                return;
              }
              // Absorb: next item, else → Fade
              if (step === 1) {
                if (ai < itemCount - 1) setAi(ai + 1);
                else {
                  setStep(2);
                  setAi(0);
                  setFadeStage(0);
                }
                return;
              }
              // Fade: deepen the fade, then next item, then → Recite
              if (step === 2) {
                if (fadeStage < 3) {
                  setFadeStage((fadeStage + 1) as FadeStage);
                  return;
                }
                if (ai < itemCount - 1) {
                  setAi(ai + 1);
                  setFadeStage(0);
                } else {
                  setStep(3);
                }
                return;
              }
              // Recite → Seal
              if (step === 3) setStep(4);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════ flow chrome ═══════════════

function FlowHeader({
  label,
  step,
  onClose,
}: {
  label: string;
  step: number;
  onClose: () => void;
}) {
  return (
    <div className="px-6 pt-2 pb-3">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-themed-muted p-1.5 -ml-1.5 rounded-lg touch-manipulation active:opacity-70"
        >
          <X size={20} />
        </button>
        <div className="text-[11px] tracking-[0.16em] uppercase text-themed-muted">
          Learning · <span className="text-gold font-semibold normal-case tracking-normal">{label}</span>
        </div>
        <span className="w-8" />
      </div>
      {/* progress line */}
      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "var(--overlay-soft, rgba(255,255,255,0.06))" }}>
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${(step / (STEPS.length - 1)) * 100}%`, background: "var(--color-gold)" }}
        />
      </div>
      {/* stepper */}
      <div className="flex gap-1 mt-3">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className="flex-1 text-center text-[9.5px] tracking-[0.12em] uppercase pt-2 border-t-2 transition-colors"
            style={{
              color: i < step ? "#5ea77b" : i === step ? "var(--color-gold)" : "var(--overlay-strong, rgba(255,255,255,0.28))",
              borderColor:
                i < step ? "#5ea77b" : i === step ? "var(--color-gold)" : "var(--overlay-soft, rgba(255,255,255,0.10))",
            }}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function LadderFooter({
  step,
  ai,
  fadeStage,
  itemCount,
  contentKind,
  onBack,
  onNext,
}: {
  step: Step;
  ai: number;
  fadeStage: FadeStage;
  itemCount: number;
  contentKind: "quran" | "asma";
  onBack: () => void;
  onNext: () => void;
}) {
  const noun = contentKind === "asma" ? "Name" : "āyah";
  let label = "Continue";
  if (step === 0) label = "I've met them — Absorb";
  else if (step === 1) label = ai < itemCount - 1 ? `Next ${noun}` : "To Fade";
  else if (step === 2) {
    if (fadeStage < 3) label = "Hide more";
    else label = ai < itemCount - 1 ? `Next ${noun}` : "Recite it";
  } else if (step === 3) label = "To the Seal";

  return (
    <div className="flex gap-2.5">
      <button
        type="button"
        onClick={onBack}
        className="rounded-xl border sidebar-border text-themed-muted font-medium px-5 py-3.5 touch-manipulation active:opacity-80"
      >
        {step === 0 ? "Today" : "Back"}
      </button>
      <button
        type="button"
        onClick={onNext}
        className="flex-1 rounded-xl bg-[var(--color-gold)] text-black font-semibold py-3.5 flex items-center justify-center gap-1.5 touch-manipulation active:opacity-90"
      >
        {label}
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ═══════════════ Rung 0 · MEET ═══════════════

function Meet({ content }: { content: NonNullable<Content> }) {
  return (
    <div className="pt-1">
      <p className="text-themed-muted text-sm leading-relaxed mb-4">
        <span className="text-themed font-semibold">Meet the {content.kind === "asma" ? "Names" : "āyāt"}.</span>{" "}
        Understand {content.kind === "asma" ? "them" : "them"} before you carry them.
      </p>

      {content.kind === "quran" ? (
        <div className="rounded-2xl card-bg border sidebar-border p-4">
          <AudioAssistedPlayer ayahs={content.items} wordSync showTranslation defaultLoop={false} />
        </div>
      ) : (
        <div className="space-y-3">
          {content.items.map((it) => (
            <div key={it.nameIndex} className="rounded-2xl card-bg border sidebar-border p-4 text-center">
              <p dir="rtl" className="font-arabic text-themed text-3xl leading-[1.8]">
                {it.name.nameAr}
              </p>
              <p className="text-gold text-sm font-semibold mt-1">{it.name.name}</p>
              <p className="text-themed-muted text-xs mt-0.5">{it.name.meaning}</p>
              <p className="text-themed-muted text-[13px] leading-relaxed mt-2.5">
                {it.name.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════ Rung 1 · ABSORB ═══════════════

function Absorb({
  content,
  ai,
  echoes,
  onEcho,
}: {
  content: NonNullable<Content>;
  ai: number;
  echoes: Record<number, number>;
  onEcho: (i: number) => void;
}) {
  const count = content.items.length;
  const done = echoes[ai] ?? 0;
  return (
    <div className="pt-1">
      <p className="text-themed-muted text-sm leading-relaxed mb-4">
        <span className="text-themed font-semibold">
          Absorb — {content.kind === "asma" ? "Name" : "āyah"} {ai + 1} of {count}.
        </span>{" "}
        Listen, then echo it aloud. Three times is a good habit; more if you like.
      </p>

      <div
        className="rounded-2xl card-bg p-4"
        style={{ border: "1px solid var(--color-gold-line, rgba(201,168,76,0.28))" }}
      >
        {content.kind === "quran" ? (
          <AudioAssistedPlayer
            key={`absorb-${ai}`}
            ayahs={[content.items[ai]]}
            wordSync
            showTranslation
            defaultLoop
          />
        ) : (
          <div className="text-center py-2">
            <p dir="rtl" className="font-arabic text-4xl leading-[1.8]" style={{ color: "var(--color-gold)" }}>
              {content.items[ai].name.nameAr}
            </p>
            <p className="text-gold text-base font-semibold mt-2">{content.items[ai].name.name}</p>
            <p className="text-themed-muted text-sm mt-1">{content.items[ai].name.meaning}</p>
          </div>
        )}

        {/* echo prompt + 3-dot counter */}
        <div className="mt-4 flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              hapticLight();
              onEcho(ai);
            }}
            className="text-[13px] tracking-wide text-gold px-3 py-1.5 rounded-lg touch-manipulation active:opacity-70"
            style={{ animation: done < 3 ? "hifzPulse 1.6s ease-in-out infinite" : undefined }}
          >
            ۔ Your turn — echo it aloud ۔
          </button>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{ background: i < done ? "var(--color-gold)" : "var(--overlay-strong, rgba(255,255,255,0.18))" }}
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes hifzPulse{0%,100%{opacity:.55}50%{opacity:1}}`}</style>
    </div>
  );
}

// ═══════════════ Rung 2 · FADE ═══════════════

/** Render one Arabic string under a fade stage (Full/Letters/Anchor/Hidden). */
function FadedArabic({ text, stage, ayahNum }: { text: string; stage: FadeStage; ayahNum?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  if (stage === 3) {
    return (
      <span dir="rtl" className="font-arabic" style={{ color: "var(--overlay-strong, rgba(255,255,255,0.28))", letterSpacing: "0.2em" }}>
        {ayahNum != null ? `﴿ ${arNum(ayahNum)} ﴾ ` : ""}
        ································
      </span>
    );
  }
  return (
    <span dir="rtl" className="font-arabic">
      {words.map((w, i) => {
        // Anchor: first word full, rest hidden. Letters: 2 chars + dots.
        if (stage === 0 || (stage === 2 && i === 0)) {
          return <span key={i}>{w} </span>;
        }
        if (stage === 1) {
          return (
            <span key={i}>
              {w.slice(0, 2)}
              <span style={{ color: "var(--overlay-strong, rgba(255,255,255,0.28))", fontSize: "0.7em" }}>···</span>{" "}
            </span>
          );
        }
        // stage 2, non-first word → hidden
        return (
          <span key={i} style={{ color: "var(--overlay-strong, rgba(255,255,255,0.28))", fontSize: "0.7em" }}>
            ····{" "}
          </span>
        );
      })}
    </span>
  );
}

function Fade({
  content,
  ai,
  fadeStage,
  peeking,
  peeks,
  onStage,
  startPeek,
  endPeek,
}: {
  content: NonNullable<Content>;
  ai: number;
  fadeStage: FadeStage;
  peeking: boolean;
  peeks: number;
  onStage: (s: FadeStage) => void;
  startPeek: () => void;
  endPeek: () => void;
}) {
  const isQuran = content.kind === "quran";
  const item = content.items[ai];
  const fullText = isQuran ? (item as QItem).arabic : (item as AItem).name.nameAr;
  const ayahNum = isQuran ? (item as QItem).ayah : undefined;

  return (
    <div className="pt-1">
      <p className="text-themed-muted text-sm leading-relaxed mb-4">
        <span className="text-themed font-semibold">
          Fade — {isQuran ? "āyah" : "Name"} {ai + 1}.
        </span>{" "}
        Recite with less and less help. Hold to peek — peeking is learning, not cheating.
      </p>

      <div
        className="rounded-2xl card-bg p-4"
        style={{ border: "1px solid var(--color-gold-line, rgba(201,168,76,0.28))" }}
      >
        {/* stage segmented control */}
        <div className="flex rounded-xl overflow-hidden border sidebar-border">
          {FADE_STAGES.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => onStage(i as FadeStage)}
              className="flex-1 py-2.5 text-[10.5px] tracking-[0.08em] uppercase touch-manipulation"
              style={
                i === fadeStage
                  ? { background: "var(--color-gold-dim, rgba(201,168,76,0.16))", color: "var(--color-gold)" }
                  : { color: "var(--color-themed-muted, #808aa0)" }
              }
            >
              {s}
            </button>
          ))}
        </div>

        {/* fade area — hold to peek reveals the full text */}
        <div className="relative mt-4 py-3 text-center min-h-[80px] flex items-center justify-center">
          <div
            className="text-3xl leading-[2] transition-opacity"
            style={{ opacity: peeking ? 0.14 : 1 }}
          >
            <FadedArabic text={fullText} stage={fadeStage} ayahNum={ayahNum} />
          </div>
          {peeking && (
            <div
              className="absolute inset-0 flex items-center justify-center text-3xl leading-[2] pointer-events-none"
              dir="rtl"
              style={{ color: "var(--color-gold)", opacity: 0.5 }}
            >
              <span className="font-arabic">{fullText}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            startPeek();
          }}
          onPointerUp={endPeek}
          onPointerLeave={endPeek}
          onPointerCancel={endPeek}
          className="mx-auto mt-3 block rounded-full px-5 py-2 text-[11.5px] tracking-[0.1em] uppercase select-none touch-none"
          style={{ border: "1px dashed var(--color-gold-line, rgba(201,168,76,0.28))", color: "var(--color-gold)" }}
        >
          Hold to peek
        </button>
      </div>

      {peeks > 0 && (
        <p className="text-center text-[11px] text-themed-muted mt-3">
          peeks so far: {peeks} — quietly shapes the suggested seal
        </p>
      )}
    </div>
  );
}

// ═══════════════ Rung 3 · RECITE ═══════════════

function Recite({
  content,
  native,
  recState,
  recUrl,
  recErr,
  recSecs,
  startRec,
  stopRec,
  resetRec,
}: {
  content: NonNullable<Content>;
  native: boolean;
  recState: "idle" | "recording" | "recorded";
  recUrl: string | null;
  recErr: string | null;
  recSecs: number;
  startRec: () => void;
  stopRec: () => void;
  resetRec: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const isQuran = content.kind === "quran";
  const first = content.items[0];
  const cue = isQuran
    ? (first as QItem).arabic.split(/\s+/)[0]
    : (first as AItem).name.nameAr;

  return (
    <div className="pt-1">
      <p className="text-themed-muted text-sm leading-relaxed mb-4">
        <span className="text-themed font-semibold">Recite the whole portion</span> — from memory,
        {isQuran ? " āyah by āyah" : " each Name"} together.
      </p>

      <div className="rounded-2xl card-bg border sidebar-border p-5 text-center">
        <p className="text-[11px] tracking-[0.2em] uppercase text-themed-muted">Begin from</p>
        <p dir="rtl" className="font-arabic text-4xl mt-4" style={{ color: "var(--color-gold)" }}>
          …{cue}
        </p>
        <p className="text-themed-muted text-2xl tracking-[0.3em] mt-1">· · ·</p>

        {/* blind cue → reveal & check */}
        {revealed && (
          <div dir="rtl" className="font-arabic text-themed text-2xl leading-[2] mt-5">
            {isQuran
              ? (content.items as QItem[]).map((a) => (
                  <span key={`${a.surah}:${a.ayah}`}>
                    {a.arabic} <span className="text-gold text-[0.62em]">﴿{arNum(a.ayah)}﴾</span>{" "}
                  </span>
                ))
              : (content.items as AItem[]).map((a) => (
                  <span key={a.nameIndex}>{a.name.nameAr} · </span>
                ))}
          </div>
        )}

        {/* record + compare */}
        <div className="flex flex-col gap-2.5 mt-6">
          {recState === "recording" ? (
            <button
              type="button"
              onClick={stopRec}
              className="rounded-xl border py-3 flex items-center justify-center gap-2 touch-manipulation"
              style={{ borderColor: "#c96a5c", color: "#e8b3aa" }}
            >
              <Square size={15} fill="currentColor" />
              Recording · {fmtSecs(recSecs)} — tap to stop
            </button>
          ) : recState === "recorded" ? (
            <>
              {recUrl && (
                <audio src={recUrl} controls className="w-full h-10" preload="metadata" />
              )}
              <button
                type="button"
                onClick={() => {
                  resetRec();
                  startRec();
                }}
                className="rounded-xl border sidebar-border text-themed-muted py-3 flex items-center justify-center gap-2 touch-manipulation active:opacity-80"
              >
                <RotateCcw size={15} /> Re-record
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startRec}
              className="rounded-xl border sidebar-border text-themed py-3 flex items-center justify-center gap-2 touch-manipulation active:opacity-80"
            >
              <Mic size={16} /> Record yourself
            </button>
          )}
          {recErr && <p className="text-[12px]" style={{ color: "#e8b3aa" }}>{recErr}</p>}

          {isQuran && (
            <p className="text-themed-muted text-[11px]">Loop the reciter above to compare your recall.</p>
          )}
        </div>
      </div>

      {!revealed && (
        <button
          type="button"
          onClick={() => {
            hapticLight();
            setRevealed(true);
          }}
          className="mx-auto mt-4 flex items-center gap-2 text-themed-muted text-sm px-4 py-2 rounded-lg touch-manipulation active:opacity-70"
        >
          <Eye size={16} /> Reveal &amp; check
        </button>
      )}
    </div>
  );
}

// ═══════════════ Rung 4 · SEAL ═══════════════

function Seal({
  content,
  stationLabel,
  peeks,
  firstCard,
  today,
  stationAyahs,
  busy,
  onSeal,
}: {
  content: NonNullable<Content>;
  stationLabel: string;
  peeks: number;
  firstCard: HifzCard | undefined;
  today: string;
  stationAyahs: number;
  busy: boolean;
  onSeal: (base: Grade) => void;
}) {
  const low = peeks <= 2;
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFired = useRef(false);

  // Preview each grade's next interval on the first member card (post-seal grade).
  const preview = (base: Grade): string => {
    if (!firstCard) return "";
    const g = sealGrade(base, firstCard.peekCount ?? 0, stationAyahs);
    return returnsLabel(firstCard, g, today);
  };

  const Grade = ({
    base,
    title,
    note,
    danger,
    suggest,
    hold,
  }: {
    base: Grade;
    title: string;
    note: string;
    danger?: boolean;
    suggest?: boolean;
    hold?: boolean;
  }) => (
    <button
      type="button"
      disabled={busy}
      onClick={() => !hold && onSeal(base)}
      onPointerDown={
        hold
          ? () => {
              holdFired.current = false;
              holdRef.current = setTimeout(() => {
                holdFired.current = true;
                hapticSuccess();
                onSeal("easy");
              }, 650);
            }
          : undefined
      }
      onPointerUp={
        hold
          ? () => {
              if (holdRef.current) clearTimeout(holdRef.current);
              if (!holdFired.current) onSeal(base);
            }
          : undefined
      }
      onPointerLeave={hold ? () => holdRef.current && clearTimeout(holdRef.current) : undefined}
      className="w-full text-left rounded-2xl border p-4 flex justify-between items-center gap-3 touch-manipulation active:opacity-90 disabled:opacity-50"
      style={
        suggest
          ? {
              borderColor: "var(--color-gold-line, rgba(201,168,76,0.28))",
              background: "var(--color-gold-dim, rgba(201,168,76,0.08))",
            }
          : { borderColor: "var(--overlay-soft, rgba(255,255,255,0.10))", background: "var(--overlay-soft, rgba(255,255,255,0.03))" }
      }
    >
      <span
        className={`text-[15px] font-semibold ${!danger && !suggest ? "text-themed" : ""}`}
        style={{ color: danger ? "#d99a90" : suggest ? "var(--color-gold)" : undefined }}
      >
        {title}
      </span>
      <span className="text-[11px] text-themed-muted text-right leading-snug">{note}</span>
    </button>
  );

  return (
    <div className="pt-1">
      <p className="text-themed-muted text-sm leading-relaxed mb-4">
        <span className="text-themed font-semibold">The Seal.</span> One honest grade — the only
        moment that touches your schedule.
      </p>

      <div className="rounded-2xl card-bg border sidebar-border p-5 text-center">
        <p className="text-[11px] tracking-[0.2em] uppercase text-gold mb-1.5">{stationLabel}</p>
        <p className="text-themed text-lg" style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}>
          How did it come?
        </p>

        <div className="flex flex-col gap-2.5 mt-4">
          <Grade base="again" title="Needs more time" note="no harm — we walk it again today" danger />
          <Grade base="hard" title="Getting there" note={preview("hard")} />
          <Grade base="good" title="It's with me" note={preview("good")} suggest={low} hold />
        </div>

        <p
          className="text-[11px] mt-3"
          style={{ color: low ? "var(--color-gold)" : "var(--color-themed-muted,#808aa0)" }}
        >
          {low
            ? peeks === 0
              ? "Suggested — you recalled it without a single peek"
              : `Suggested — you needed only ${peeks} peek${peeks === 1 ? "" : "s"}`
            : `You peeked ${peeks} times — “Getting there” may be the honest grade`}
        </p>
        <p className="text-[11px] text-themed-muted mt-2">
          Press and hold “It&apos;s with me” for <span className="italic">rock solid</span> — a longer first gap.
        </p>
      </div>
    </div>
  );
}
