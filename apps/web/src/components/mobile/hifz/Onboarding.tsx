"use client";

// Onboarding — the "Your Hifz Path" first-run flow (replaces HifzPlanSetup).
// Multi-step, reverent, NO salām: intention → starting point → what you already
// carry → daily rhythm → the 99 Names. On finish it builds the starting portion's
// station cards, seeds already-memorized portions (staggered), optionally adds the
// 99 Names as "asma" cards, saves the singleton plan, then nav("today"). It never
// imports a sibling screen — it hands off through nav().

import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import namesOfAllah from "@hidden-hiqmah/content/names-of-allah";
import type {
  HifzPlan,
  HifzStartPoint,
  Intention,
  Pace,
  NewCardInput,
  SeedCardInput,
  SeedStrength,
} from "@hidden-hiqmah/ui/lib/hifz/types";
import { paceNewPerDay, paceStationAyahs } from "@hidden-hiqmah/ui/lib/hifz/srs";
import {
  buildStationCards,
  surahName,
  verseCount,
  chapter,
  pageRec,
  allPages,
  TOTAL_SURAHS,
  TOTAL_PAGES,
  TOTAL_JUZ,
  type HifzScope,
  type Journey,
} from "@/lib/hifz/quran";
import { hapticLight, hapticSelection, hapticSuccess } from "@/lib/mobile/haptics";
import type { HifzPath } from "@/lib/hifz/useHifzPath";
import type { HifzNav } from "@/lib/hifz/hifzViews";

// ── copy / meta ──────────────────────────────────────────────────────────────

const STEP_COUNT = 5;

const QUIET: Record<QuietKey, string | null> = {
  fajr: "06:00",
  evening: "20:00",
  varies: null,
};
type QuietKey = "fajr" | "evening" | "varies";

const PACE_META: {
  key: Pace;
  title: string;
  desc: string;
  tag?: string;
}[] = [
  { key: "gentle", title: "Gentle · 5 minutes", desc: "1 new āyah + a short review" },
  { key: "steady", title: "Steady · 10 minutes", desc: "2–3 new āyāt — the steady path", tag: "Recommended" },
  { key: "devoted", title: "Devoted · 20 minutes", desc: "4–6 new āyāt a day" },
];

// Named starting sūrahs.
const AN_NAS = 114;
const AN_NABA = 78;
const AL_MULK = 67;

type StartKind = "short" | "juz-amma" | "mulk" | "custom";
type CustomTab = "surah" | "juz" | "page";

interface StartInfo {
  scope: HifzScope;
  startPoint: HifzStartPoint;
  journey: Journey;
}

interface CarryItem {
  id: string;
  label: string;
  ar: string;
  scope: HifzScope;
}

// Curated "already carry" options (a sūrah / a juzʼ / a famous passage).
const CARRY_BASE: CarryItem[] = [
  { id: "s1", label: "Al-Fātiḥah", ar: chapter(1)?.nameAr ?? "", scope: { kind: "surah", surah: 1 } },
  { id: "s114", label: "An-Nās", ar: chapter(114)?.nameAr ?? "", scope: { kind: "surah", surah: 114 } },
  { id: "s113", label: "Al-Falaq", ar: chapter(113)?.nameAr ?? "", scope: { kind: "surah", surah: 113 } },
  { id: "s112", label: "Al-Ikhlāṣ", ar: chapter(112)?.nameAr ?? "", scope: { kind: "surah", surah: 112 } },
  {
    id: "kursi",
    label: "Āyat al-Kursī",
    ar: "آية الكرسي",
    scope: { kind: "range", startSurah: 2, startAyah: 255, endSurah: 2, endAyah: 255 },
  },
  {
    id: "last10",
    label: "Last 10 sūrahs",
    ar: "",
    scope: { kind: "range", startSurah: 105, startAyah: 1, endSurah: 114, endAyah: verseCount(114) },
  },
  { id: "s67", label: "Al-Mulk", ar: chapter(67)?.nameAr ?? "", scope: { kind: "surah", surah: 67 } },
  { id: "juz30", label: "Juz ʿAmma", ar: "", scope: { kind: "juz", juz: 30 } },
  { id: "s36", label: "Yā-Sīn", ar: chapter(36)?.nameAr ?? "", scope: { kind: "surah", surah: 36 } },
  { id: "s18", label: "Al-Kahf", ar: chapter(18)?.nameAr ?? "", scope: { kind: "surah", surah: 18 } },
];

// ── helpers ────────────────────────────────────────────────────────────────

/** First sūrah of a scope (for the Arabic "your path begins at" flourish). */
function startSurahOf(scope: HifzScope): number {
  if (scope.kind === "surah") return scope.surah;
  if (scope.kind === "page") return pageRec(scope.page)?.s ?? 1;
  if (scope.kind === "juz") return allPages().find((p) => p.j === scope.juz)?.s ?? 1;
  return scope.startSurah;
}

function scopeLabel(scope: HifzScope): string {
  if (scope.kind === "surah") return surahName(scope.surah);
  if (scope.kind === "juz") return `Juz ${scope.juz}`;
  if (scope.kind === "page") return `Page ${scope.page}`;
  return `${surahName(scope.startSurah)} ${scope.startAyah}`;
}

/** Build the 99 Names as pace-sized station cards (contentKind "asma"). */
function buildAsmaCards(pace: Pace): NewCardInput[] {
  const size = Math.max(1, paceStationAyahs(pace));
  const out: NewCardInput[] = [];
  for (let i = 1; i <= namesOfAllah.length; i += size) {
    const lo = i;
    const hi = Math.min(namesOfAllah.length, i + size - 1);
    const stationKey = `0:${lo}-0:${hi}`;
    for (let n = lo; n <= hi; n++) {
      out.push({
        unit: "ayah",
        label: namesOfAllah[n - 1].name,
        page: null,
        startSurah: 0,
        startAyah: n,
        endSurah: 0,
        endAyah: n,
        stationKey,
        contentKind: "asma",
      });
    }
  }
  return out;
}

// ── screen ─────────────────────────────────────────────────────────────────

export default function Onboarding({ path, nav }: { path: HifzPath; nav: HifzNav }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  // 1 · intention
  const [intention, setIntention] = useState<Intention>("both");

  // 2 · starting point
  const [startKind, setStartKind] = useState<StartKind>("short");
  const [customTab, setCustomTab] = useState<CustomTab>("surah");
  const [cSurah, setCSurah] = useState(1);
  const [cJuz, setCJuz] = useState(30);
  const [cPage, setCPage] = useState(1);

  // 3 · already carry — id → strength (absent = not selected)
  const [carry, setCarry] = useState<Record<string, SeedStrength | undefined>>({});
  const [extraSurahs, setExtraSurahs] = useState<number[]>([]);

  // 4 · pace + quiet time
  const [pace, setPace] = useState<Pace>("steady");
  const [quiet, setQuiet] = useState<QuietKey>("fajr");

  // 5 · 99 Names
  const [includeNames, setIncludeNames] = useState(false);

  const start = useMemo<StartInfo>(() => {
    if (startKind === "short")
      return { scope: { kind: "surah", surah: AN_NAS }, startPoint: { kind: "surah", surah: AN_NAS }, journey: "shortest" };
    if (startKind === "juz-amma")
      return { scope: { kind: "surah", surah: AN_NABA }, startPoint: { kind: "surah", surah: AN_NABA }, journey: "juz-amma" };
    if (startKind === "mulk")
      return { scope: { kind: "surah", surah: AL_MULK }, startPoint: { kind: "surah", surah: AL_MULK }, journey: "front-to-back" };
    if (customTab === "juz")
      return { scope: { kind: "juz", juz: cJuz }, startPoint: { kind: "juz", juz: cJuz }, journey: cJuz === 30 ? "juz-amma" : "front-to-back" };
    if (customTab === "page")
      return { scope: { kind: "page", page: cPage }, startPoint: { kind: "page", page: cPage }, journey: "front-to-back" };
    return { scope: { kind: "surah", surah: cSurah }, startPoint: { kind: "surah", surah: cSurah }, journey: "front-to-back" };
  }, [startKind, customTab, cSurah, cJuz, cPage]);

  const startCards = useMemo(() => buildStationCards(start.scope, pace), [start, pace]);
  const startAr = chapter(startSurahOf(start.scope))?.nameAr ?? "";
  const startEn = scopeLabel(start.scope);

  const carryItems = useMemo<CarryItem[]>(() => {
    const base = new Set(CARRY_BASE.filter((c) => c.scope.kind === "surah").map((c) => (c.scope as { surah: number }).surah));
    const extra: CarryItem[] = extraSurahs
      .filter((s) => !base.has(s))
      .map((s) => ({ id: `s${s}`, label: surahName(s), ar: chapter(s)?.nameAr ?? "", scope: { kind: "surah", surah: s } }));
    return [...CARRY_BASE, ...extra];
  }, [extraSurahs]);

  const goBack = () => {
    hapticLight();
    setStep((s) => Math.max(0, s - 1));
  };
  const goNext = () => {
    hapticSelection();
    setStep((s) => Math.min(STEP_COUNT - 1, s + 1));
  };

  const cycleCarry = (id: string) => {
    hapticSelection();
    setCarry((m) => {
      const cur = m[id];
      const next: SeedStrength | undefined = cur === undefined ? "strong" : cur === "strong" ? "refreshing" : undefined;
      return { ...m, [id]: next };
    });
  };

  const buildSeeds = (p: Pace): SeedCardInput[] => {
    const out: SeedCardInput[] = [];
    for (const it of carryItems) {
      const strength = carry[it.id];
      if (!strength) continue;
      for (const c of buildStationCards(it.scope, p)) out.push({ ...c, strength });
    }
    return out;
  };

  const commit = async (opts: {
    plan: HifzPlan;
    starting: NewCardInput[];
    seeds: SeedCardInput[];
    names: NewCardInput[];
  }) => {
    if (busy) return;
    setBusy(true);
    try {
      if (opts.starting.length) await path.actions.addToPath(opts.starting);
      if (opts.seeds.length) await path.actions.seedAlready(opts.seeds);
      if (opts.names.length) await path.actions.addToPath(opts.names);
      await path.actions.savePlan(opts.plan);
      hapticSuccess();
      nav("today");
    } catch {
      setBusy(false);
    }
  };

  const finish = () => {
    const now = new Date().toISOString();
    const plan: HifzPlan = {
      intention,
      pace,
      startPoint: start.startPoint,
      journey: start.journey,
      quietTime: QUIET[quiet],
      createdAt: now,
      updatedAt: now,
    };
    void commit({
      plan,
      starting: buildStationCards(start.scope, pace),
      seeds: buildSeeds(pace),
      names: includeNames ? buildAsmaCards(pace) : [],
    });
  };

  const skipSetup = () => {
    const now = new Date().toISOString();
    const scope: HifzScope = { kind: "surah", surah: AN_NAS };
    const plan: HifzPlan = {
      intention: "both",
      pace: "gentle",
      startPoint: { kind: "surah", surah: AN_NAS },
      journey: "shortest",
      quietTime: null,
      createdAt: now,
      updatedAt: now,
    };
    void commit({ plan, starting: buildStationCards(scope, "gentle"), seeds: [], names: [] });
  };

  return (
    <div
      className="flex h-full flex-col text-themed"
      style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
    >
      {/* header — back + step dots (NO salām, straight to content) */}
      <div className="flex items-center px-5 pt-2 pb-1">
        <button
          type="button"
          onClick={goBack}
          className={`h-9 w-9 -ml-1.5 flex items-center justify-center rounded-full touch-manipulation active:opacity-70 ${
            step === 0 ? "invisible" : ""
          }`}
          aria-label="Back"
        >
          <ChevronLeft size={22} className="text-themed-muted" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-1.5">
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-colors"
              style={{
                background: i <= step ? "var(--color-gold)" : "var(--overlay-strong, rgba(255,255,255,0.2))",
                boxShadow: i === step ? "0 0 8px rgba(201,168,76,0.6)" : undefined,
              }}
            />
          ))}
        </div>
        <span className="h-9 w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {step === 0 && (
          <Intent value={intention} onPick={(v) => { hapticLight(); setIntention(v); }} />
        )}
        {step === 1 && (
          <StartStep
            startKind={startKind}
            setStartKind={(k) => { hapticLight(); setStartKind(k); }}
            customTab={customTab}
            setCustomTab={setCustomTab}
            cSurah={cSurah}
            setCSurah={setCSurah}
            cJuz={cJuz}
            setCJuz={setCJuz}
            cPage={cPage}
            setCPage={setCPage}
            startAr={startAr}
            startEn={startEn}
          />
        )}
        {step === 2 && (
          <CarryStep
            items={carryItems}
            carry={carry}
            onCycle={cycleCarry}
            onAddSurah={(s) => setExtraSurahs((prev) => (prev.includes(s) ? prev : [...prev, s]))}
          />
        )}
        {step === 3 && (
          <PaceStep
            pace={pace}
            setPace={(p) => { hapticLight(); setPace(p); }}
            quiet={quiet}
            setQuiet={(q) => { hapticSelection(); setQuiet(q); }}
            newPerDay={paceNewPerDay(pace)}
            ayahCount={startCards.length}
            startEn={startEn}
          />
        )}
        {step === 4 && (
          <NamesStep value={includeNames} onPick={(v) => { hapticLight(); setIncludeNames(v); }} />
        )}
      </div>

      {/* footer */}
      <div className="px-6 pt-3 space-y-2.5" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}>
        {step < STEP_COUNT - 1 ? (
          <>
            <PrimaryButton onClick={goNext}>Continue</PrimaryButton>
            {step === 0 && (
              <button
                type="button"
                onClick={skipSetup}
                disabled={busy}
                className="w-full py-2 text-[13.5px] text-themed-muted active:opacity-70 touch-manipulation disabled:opacity-40"
              >
                Set up later — use gentle defaults
              </button>
            )}
          </>
        ) : (
          <PrimaryButton onClick={finish} disabled={busy}>
            {busy ? "Creating your path…" : "Create my path"}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-gold mb-2.5">{children}</p>
  );
}
function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="text-[26px] leading-tight font-serif text-themed text-balance">{children}</h1>;
}
function Coach({ children }: { children: React.ReactNode }) {
  return <p className="text-[13.5px] leading-relaxed text-themed-muted mt-2.5">{children}</p>;
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-gold text-[#181305] font-bold text-[15.5px] py-4 flex items-center justify-center touch-manipulation active:scale-[0.98] transition-transform disabled:opacity-40"
      style={{ boxShadow: "0 6px 22px rgba(201,168,76,0.22)" }}
    >
      {children}
    </button>
  );
}

function OptionCard({
  selected,
  title,
  desc,
  tag,
  onClick,
}: {
  selected: boolean;
  title: string;
  desc: string;
  tag?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-4 mt-3 relative touch-manipulation transition-colors ${
        selected ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10" : "sidebar-border card-bg"
      }`}
    >
      {tag && (
        <span className="absolute top-3.5 right-4 text-[9.5px] uppercase tracking-[0.14em] text-gold">{tag}</span>
      )}
      <p className={`text-[15.5px] font-semibold ${selected ? "text-gold" : "text-themed"}`}>{title}</p>
      <p className="text-[12.5px] text-themed-muted mt-1 leading-snug pr-16">{desc}</p>
    </button>
  );
}

function Projection({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-4 rounded-xl border border-dashed px-4 py-3 text-[13px] leading-relaxed"
      style={{ borderColor: "rgba(201,168,76,0.28)", background: "rgba(201,168,76,0.05)", color: "#d8ceb4" }}
    >
      {children}
    </div>
  );
}

function ArabicFlourish({ ar }: { ar: string }) {
  return (
    <span dir="rtl" className="font-serif" style={{ color: "var(--color-gold)" }}>
      ﴾ {ar} ﴿
    </span>
  );
}

// ── step 1 · intention ───────────────────────────────────────────────────────

function Intent({ value, onPick }: { value: Intention; onPick: (v: Intention) => void }) {
  return (
    <>
      <Eyebrow>Your intention</Eyebrow>
      <Title>What brings you to the Qurʼān today?</Title>
      <Coach>Everything can change later — this simply shapes your path.</Coach>
      <OptionCard
        selected={value === "start"}
        title="Start memorizing"
        desc="Begin something new, at your pace"
        onClick={() => onPick("start")}
      />
      <OptionCard
        selected={value === "maintain"}
        title="Keep what I know strong"
        desc="Protect what you have already memorized"
        onClick={() => onPick("maintain")}
      />
      <OptionCard
        selected={value === "both"}
        title="Both"
        desc="Maintain the old while carrying new āyāt"
        tag="Most choose this"
        onClick={() => onPick("both")}
      />
    </>
  );
}

// ── step 2 · starting point ─────────────────────────────────────────────────

function StartStep(props: {
  startKind: StartKind;
  setStartKind: (k: StartKind) => void;
  customTab: CustomTab;
  setCustomTab: (t: CustomTab) => void;
  cSurah: number;
  setCSurah: (n: number) => void;
  cJuz: number;
  setCJuz: (n: number) => void;
  cPage: number;
  setCPage: (n: number) => void;
  startAr: string;
  startEn: string;
}) {
  const { startKind, setStartKind, customTab, setCustomTab, cSurah, setCSurah, cJuz, setCJuz, cPage, setCPage, startAr, startEn } = props;
  return (
    <>
      <Eyebrow>Your starting point</Eyebrow>
      <Title>Where shall your path begin?</Title>
      <Coach>Start anywhere — a sūrah, a juzʼ, a page. The path is yours.</Coach>
      <OptionCard
        selected={startKind === "short"}
        title="Short sūrahs first"
        desc="An-Nās backward through Juz ʿAmma — quick early wins"
        tag="Recommended"
        onClick={() => setStartKind("short")}
      />
      <OptionCard
        selected={startKind === "juz-amma"}
        title="Juz ʿAmma in order"
        desc="From An-Naba forward, the classic route"
        onClick={() => setStartKind("juz-amma")}
      />
      <OptionCard
        selected={startKind === "mulk"}
        title="Al-Mulk"
        desc="The Prophet ﷺ encouraged holding it close"
        onClick={() => setStartKind("mulk")}
      />
      <OptionCard
        selected={startKind === "custom"}
        title="Choose anywhere…"
        desc="Any sūrah, juzʼ, or mushaf page"
        onClick={() => setStartKind("custom")}
      />

      {startKind === "custom" && (
        <div className="mt-3 rounded-2xl border sidebar-border card-bg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(["surah", "juz", "page"] as CustomTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { hapticSelection(); setCustomTab(t); }}
                className={`rounded-xl border py-2 text-[13px] font-semibold capitalize touch-manipulation transition-colors ${
                  customTab === t ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-gold" : "sidebar-border text-themed"
                }`}
              >
                {t === "juz" ? "Juzʼ" : t}
              </button>
            ))}
          </div>
          {customTab === "surah" && <SurahSelect value={cSurah} onChange={setCSurah} />}
          {customTab === "juz" && <NumberSelect value={cJuz} count={TOTAL_JUZ} label="Juz" onChange={setCJuz} />}
          {customTab === "page" && (
            <NumberInput value={cPage} min={1} max={TOTAL_PAGES} onChange={setCPage} placeholder="Page (1–604)" />
          )}
        </div>
      )}

      <Projection>
        Your path begins at <ArabicFlourish ar={startAr} /> — {startEn}.
      </Projection>
    </>
  );
}

// ── step 3 · already carry ──────────────────────────────────────────────────

const STRONG = "#5ea77b";
const AMBER = "#d99a3d";

function CarryChip({
  item,
  strength,
  onClick,
}: {
  item: CarryItem;
  strength: SeedStrength | undefined;
  onClick: () => void;
}) {
  const color = strength === "strong" ? STRONG : strength === "refreshing" ? AMBER : undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3.5 py-2.5 text-[13.5px] touch-manipulation transition-colors ${
        color ? "" : "sidebar-border card-bg text-themed"
      }`}
      style={
        color
          ? { borderColor: `${color}88`, background: `${color}22`, color }
          : undefined
      }
    >
      {item.label}
      {strength === "strong" && <span className="opacity-80 text-[10.5px] ml-1.5">· strong</span>}
      {strength === "refreshing" && <span className="opacity-80 text-[10.5px] ml-1.5">· refresh</span>}
    </button>
  );
}

function CarryStep({
  items,
  carry,
  onCycle,
  onAddSurah,
}: {
  items: CarryItem[];
  carry: Record<string, SeedStrength | undefined>;
  onCycle: (id: string) => void;
  onAddSurah: (s: number) => void;
}) {
  return (
    <>
      <Eyebrow>What you already carry</Eyebrow>
      <Title>Have you memorized any Qurʼān already?</Title>
      <Coach>
        Tap once for <b className="text-themed">strong</b>, twice if it{" "}
        <b className="text-themed">needs refreshing</b>. Roughly is fine — we protect it with gentle reviews,
        staggered over weeks. Never a wall on day one.
      </Coach>
      <div className="flex flex-wrap gap-2.5 mt-4">
        {items.map((it) => (
          <CarryChip key={it.id} item={it} strength={carry[it.id]} onClick={() => onCycle(it.id)} />
        ))}
      </div>

      <div className="mt-4">
        <label className="block text-themed-muted text-xs mb-1.5">Add another sūrah…</label>
        <SurahSelect
          value={0}
          onChange={(s) => { hapticSelection(); onAddSurah(s); }}
          placeholder="Choose a sūrah to add"
        />
      </div>

      <div className="flex gap-4 mt-4">
        <span className="flex items-center gap-1.5 text-[11px] text-themed-muted">
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: STRONG }} /> Strong — reviews only
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-themed-muted">
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: AMBER }} /> Refreshing — restored first
        </span>
      </div>
      <Projection>
        Strong sūrahs enter your path already green — checked over the next 3 weeks. Refreshing ones are restored
        this week, marked amber until steady.
      </Projection>
    </>
  );
}

// ── step 4 · pace ───────────────────────────────────────────────────────────

function PaceStep({
  pace,
  setPace,
  quiet,
  setQuiet,
  newPerDay,
  ayahCount,
  startEn,
}: {
  pace: Pace;
  setPace: (p: Pace) => void;
  quiet: QuietKey;
  setQuiet: (q: QuietKey) => void;
  newPerDay: number;
  ayahCount: number;
  startEn: string;
}) {
  const days = ayahCount > 0 ? Math.max(1, Math.ceil(ayahCount / Math.max(1, newPerDay))) : 0;
  return (
    <>
      <Eyebrow>Your daily rhythm</Eyebrow>
      <Title>How much time, most days?</Title>
      <Coach>Consistency beats quantity — the most beloved deeds are the most constant, even if small.</Coach>
      {PACE_META.map((p) => (
        <OptionCard
          key={p.key}
          selected={pace === p.key}
          title={p.title}
          desc={p.desc}
          tag={p.tag}
          onClick={() => setPace(p.key)}
        />
      ))}
      <Projection>
        ≈ {newPerDay} new āyah{newPerDay === 1 ? "" : "t"} a day
        {days > 0 && (
          <>
            {" "}— you would complete <span className="text-themed">{startEn}</span> in about {days} day
            {days === 1 ? "" : "s"}, in shāʼ Allāh.
          </>
        )}
      </Projection>

      <p className="text-[13.5px] text-themed-muted mt-5">
        <b className="text-themed">When is your quiet time?</b> We will keep your āyāt ready then.
      </p>
      <div className="flex gap-2 mt-3">
        {([
          { k: "fajr", label: "After Fajr" },
          { k: "evening", label: "Evening" },
          { k: "varies", label: "It varies" },
        ] as { k: QuietKey; label: string }[]).map((q) => (
          <button
            key={q.k}
            type="button"
            onClick={() => setQuiet(q.k)}
            className={`flex-1 rounded-xl border py-2.5 text-[13px] text-center touch-manipulation transition-colors ${
              quiet === q.k ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-gold" : "sidebar-border card-bg text-themed"
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>
    </>
  );
}

// ── step 5 · 99 Names ───────────────────────────────────────────────────────

function NamesStep({ value, onPick }: { value: boolean; onPick: (v: boolean) => void }) {
  return (
    <>
      <Eyebrow>One more gift</Eyebrow>
      <Title>Include the 99 Names of Allah?</Title>
      <Coach>
        Al-Asmāʾ al-Ḥusnā — memorized alongside your āyāt, paced the same gentle way. “To Allah belong the most
        beautiful names, so call upon Him by them.”
      </Coach>
      <OptionCard
        selected={value === true}
        title="Yes, include the 99 Names"
        desc="Woven into your path as their own gentle stations"
        onClick={() => onPick(true)}
      />
      <OptionCard
        selected={value === false}
        title="Not now"
        desc="You can add them from your Path anytime"
        onClick={() => onPick(false)}
      />
    </>
  );
}

// ── inputs ──────────────────────────────────────────────────────────────────

function SurahSelect({
  value,
  onChange,
  placeholder,
}: {
  value: number;
  onChange: (s: number) => void;
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full min-w-0 bg-[var(--color-bg)] rounded-lg px-3 py-2.5 text-themed text-base outline-none border sidebar-border focus:border-[var(--color-gold)]/40"
    >
      {placeholder && (
        <option value={0} disabled>
          {placeholder}
        </option>
      )}
      {Array.from({ length: TOTAL_SURAHS }, (_, i) => i + 1).map((s) => (
        <option key={s} value={s}>
          {s}. {surahName(s)}
        </option>
      ))}
    </select>
  );
}

function NumberSelect({
  value,
  count,
  label,
  onChange,
}: {
  value: number;
  count: number;
  label: string;
  onChange: (n: number) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full min-w-0 bg-[var(--color-bg)] rounded-lg px-3 py-2.5 text-themed text-base outline-none border sidebar-border focus:border-[var(--color-gold)]/40"
    >
      {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
        <option key={n} value={n}>
          {label} {n}
        </option>
      ))}
    </select>
  );
}

function NumberInput({
  value,
  min,
  max,
  onChange,
  placeholder,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value}
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={(e) => {
        const n = parseInt(e.target.value, 10);
        if (Number.isNaN(n)) return;
        onChange(Math.max(min, Math.min(max, n)));
      }}
      className="w-full min-w-0 bg-[var(--color-bg)] rounded-lg px-3 py-2.5 text-themed text-base outline-none border sidebar-border focus:border-[var(--color-gold)]/40"
    />
  );
}
