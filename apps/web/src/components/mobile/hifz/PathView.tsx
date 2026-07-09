"use client";

// PathView — the persistent "My Progress" screen. One quiet page that answers
// "where am I on this journey, and what's ahead?" It shows: a three-stat header
// (memorized / learning / streak), a Path⇄Mushaf toggle whose Path view is the
// full winding StationMap and whose Mushaf view is the juz/surah/page aggregation
// map, the 7-day review forecast strip, a prominent "+ Add to my path" picker
// (any sūrah · juzʼ · mushaf page · custom range · the 99 Names of Allah), and an
// "Also memorized" shelf for what the user already carries outside the active
// learning line (seeded portions + the 99 Names). Tapping a station opens a small
// sheet that names its status in plain words and offers Practice / Start-early.
//
// Screens never import each other — every jump goes through nav(...). All data
// comes from the shared useHifzPath() hook via the `path` prop; the add-picker
// persists through path.actions.addToPath, which broadcasts so this screen (and
// Today, and any open sheet) re-read in lock-step.

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import type { HifzPath } from "@/lib/hifz/useHifzPath";
import type {
  HifzCard,
  HifzStation,
  CardStatus,
  NewCardInput,
} from "@hidden-hiqmah/ui/lib/hifz/types";
import { paceStationAyahs } from "@hidden-hiqmah/ui/lib/hifz/srs";
import {
  buildStationCards,
  surahName,
  verseCount,
  allPages,
  pagesForCard,
  pageOfAyah,
  TOTAL_SURAHS,
  TOTAL_JUZ,
  TOTAL_PAGES,
  type HifzScope,
} from "@/lib/hifz/quran";
import namesOfAllah from "@hidden-hiqmah/content/names-of-allah";
import StationMap from "./StationMap";
import { hapticLight, hapticSelection, hapticSuccess } from "@/lib/mobile/haptics";

// Kept local so PathView never imports a sibling screen for its nav type.
type HifzView =
  | "onboarding"
  | "today"
  | "review"
  | "learn"
  | "practice"
  | "path"
  | "milestone";

interface PathViewProps {
  path: HifzPath;
  nav: (view: HifzView, params?: unknown) => void;
}

const GOLD = "var(--color-gold)";
const NAME_COUNT = namesOfAllah.length;

/** A station is the 99-Names when its cards carry surah 0 (asma index-range). */
const isAsmaStation = (s: HifzStation) => s.startSurah === 0 && s.endSurah === 0;

/** Plain-language status line for the station sheet. */
function statusWords(s: HifzStation): string {
  switch (s.status) {
    case "memorized":
      return "Steady — quietly maintained. Its next review is on your forecast below.";
    case "due":
      return "Due for review — held close, its review comes sooner.";
    case "learning":
      return "You are here — today's step on the path.";
    default:
      return "Ahead on your path — it opens as today's portion proves steady.";
  }
}

const STATUS_LABEL: Record<HifzStation["status"], string> = {
  memorized: "Steady",
  due: "Due today",
  learning: "You are here",
  locked: "Ahead",
};

// ── 99-Names → station-grouped asma cards (surah fields 0, Name index in ayah) ──
function buildNamesCards(from: number, to: number, pace: string): NewCardInput[] {
  const size = Math.max(1, paceStationAyahs(pace as never));
  const lo = Math.max(1, Math.min(NAME_COUNT, Math.min(from, to)));
  const hi = Math.max(1, Math.min(NAME_COUNT, Math.max(from, to)));
  const out: NewCardInput[] = [];
  for (let i = lo; i <= hi; i += size) {
    const last = Math.min(hi, i + size - 1);
    const stationKey = `asma:${i}-${last}`;
    for (let idx = i; idx <= last; idx++) {
      out.push({
        unit: "ayah",
        label: namesOfAllah[idx - 1]?.name ?? `Name ${idx}`,
        page: null,
        startSurah: 0,
        startAyah: idx,
        endSurah: 0,
        endAyah: idx,
        stationKey,
        contentKind: "asma",
      });
    }
  }
  return out;
}

export default function PathView({ path, nav }: PathViewProps) {
  const { stations, currentStation, stats, forecast, plan } = path;
  const pace = plan?.pace ?? "steady";

  const [tab, setTab] = useState<"path" | "mushaf">("path");
  const [sheetStation, setSheetStation] = useState<HifzStation | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Split the derived path: the active learning line (Qurʼān you're progressing)
  // vs. everything you "also" carry — seeded portions + the 99 Names — which live
  // on their own shelf rather than the mushaf journey.
  const { pathStations, alsoMemorized } = useMemo(() => {
    const on: HifzStation[] = [];
    const also: HifzStation[] = [];
    for (const s of stations) {
      if (s.source === "seeded" || isAsmaStation(s)) also.push(s);
      else on.push(s);
    }
    return { pathStations: on, alsoMemorized: also };
  }, [stations]);

  const openStation = (s: HifzStation) => {
    hapticLight();
    setSheetStation(s);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-28">
        {/* Header */}
        <p
          className="text-[10.5px] font-semibold uppercase mb-2"
          style={{ letterSpacing: "0.26em", color: GOLD }}
        >
          Your path
        </p>
        <h1 className="font-serif text-[23px] leading-tight text-themed text-balance">
          The road so far, and ahead
        </h1>

        {/* Stats */}
        <div className="flex gap-2 mt-4">
          <Stat value={stats?.memorized ?? 0} label="Memorized" />
          <Stat value={stats?.learning ?? 0} label="Learning" />
          <Stat value={stats?.streakCurrent ?? 0} label="Day streak" />
        </div>

        {/* Path ⇄ Mushaf toggle */}
        <div className="flex mt-4 rounded-xl border sidebar-border overflow-hidden">
          {(["path", "mushaf"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                hapticSelection();
                setTab(t);
              }}
              className="flex-1 py-2 text-[11px] font-semibold uppercase touch-manipulation"
              style={{
                letterSpacing: "0.1em",
                background: tab === t ? "var(--color-gold-dim, rgba(201,168,76,0.16))" : "transparent",
                color: tab === t ? "var(--color-gold-hi, #e2c476)" : "var(--color-text-muted)",
              }}
            >
              {t === "path" ? "Path" : "Mushaf"}
            </button>
          ))}
        </div>

        {tab === "path" ? (
          <div className="mt-4">
            {pathStations.length > 0 ? (
              <StationMap
                stations={pathStations}
                currentKey={currentStation?.key ?? null}
                onTap={openStation}
                variant="full"
              />
            ) : (
              <p className="text-themed-muted text-[13px] leading-relaxed py-6 text-center">
                Your learning line is empty. Add a sūrah, a juzʼ, or the 99 Names
                below to begin your path.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <MushafMap cards={path.cards} />
          </div>
        )}

        {/* 7-day forecast */}
        <p
          className="text-[10.5px] font-semibold uppercase mt-7 mb-1"
          style={{ letterSpacing: "0.26em", color: GOLD }}
        >
          Coming up
        </p>
        <Forecast forecast={forecast} />
        <p className="text-themed-muted/70 text-[11px] mt-1.5 leading-relaxed">
          Heavier days are planned around — so you can plan around them too.
        </p>

        {/* Add to my path */}
        <button
          type="button"
          onClick={() => {
            hapticLight();
            setAddOpen(true);
          }}
          className="w-full mt-7 rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-[15px] touch-manipulation active:opacity-90"
          style={{
            border: `1px solid var(--color-gold-line, rgba(201,168,76,0.28))`,
            background: "var(--color-gold-dim, rgba(201,168,76,0.10))",
            color: "var(--color-gold-hi, #e2c476)",
          }}
        >
          <Plus size={18} strokeWidth={2.4} />
          Add to my path
        </button>

        {/* Also memorized */}
        {alsoMemorized.length > 0 && (
          <div className="mt-7">
            <p className="text-themed font-semibold text-[13px] mb-1">Also memorized</p>
            <p className="text-themed-muted text-[11.5px] mb-3 leading-relaxed">
              What you already carry, kept strong alongside your path.
            </p>
            <div className="flex flex-col gap-2">
              {alsoMemorized.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => openStation(s)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border sidebar-border card-bg px-4 py-3 text-left touch-manipulation active:opacity-80"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-themed text-[13.5px] font-medium">
                      {s.label}
                    </span>
                    <span className="block text-themed-muted text-[11px] mt-0.5">
                      {isAsmaStation(s) ? "99 Names" : "Already carried"} ·{" "}
                      {STATUS_LABEL[s.status]}
                    </span>
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      background:
                        s.status === "memorized"
                          ? "#5ea77b"
                          : s.status === "due"
                          ? "#d99a3d"
                          : GOLD,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Station sheet */}
      <Sheet open={sheetStation !== null} onClose={() => setSheetStation(null)}>
        {sheetStation && (
          <>
            <p
              className="text-[10.5px] font-semibold uppercase mb-1"
              style={{ letterSpacing: "0.2em", color: GOLD }}
            >
              {STATUS_LABEL[sheetStation.status]}
            </p>
            <p className="font-serif text-[21px] text-themed">{sheetStation.label}</p>
            <p className="text-themed-muted text-[13px] leading-relaxed mt-1.5">
              {statusWords(sheetStation)}
            </p>
            <div className="flex gap-2.5 mt-5">
              {sheetStation.status === "locked" ? (
                <SheetBtn
                  primary
                  label="Start early"
                  onClick={() => {
                    hapticSelection();
                    const key = sheetStation.key;
                    setSheetStation(null);
                    nav("learn", { stationKey: key });
                  }}
                />
              ) : sheetStation.status === "learning" ? (
                <SheetBtn
                  primary
                  label="Continue today"
                  onClick={() => {
                    hapticSelection();
                    const key = sheetStation.key;
                    setSheetStation(null);
                    nav("learn", { stationKey: key });
                  }}
                />
              ) : sheetStation.status === "due" ? (
                <SheetBtn
                  primary
                  label="Review now"
                  onClick={() => {
                    hapticSelection();
                    setSheetStation(null);
                    nav("review");
                  }}
                />
              ) : null}
              <SheetBtn
                label="Practice"
                onClick={() => {
                  hapticLight();
                  const key = sheetStation.key;
                  setSheetStation(null);
                  nav("practice", { stationKey: key });
                }}
              />
            </div>
          </>
        )}
      </Sheet>

      {/* Add-to-path picker */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)}>
        <AddPicker
          pace={pace}
          onCancel={() => setAddOpen(false)}
          onAdd={async (inputs) => {
            await path.actions.addToPath(inputs);
            hapticSuccess();
            setAddOpen(false);
          }}
        />
      </Sheet>
    </div>
  );
}

// ─────────────────────────── stat tile ───────────────────────────
function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 rounded-2xl border sidebar-border card-bg px-2.5 py-3 text-center">
      <div className="text-[19px] font-bold text-themed tabular-nums leading-none">{value}</div>
      <div
        className="text-[9.5px] uppercase text-themed-muted mt-2"
        style={{ letterSpacing: "0.14em" }}
      >
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────── forecast strip ───────────────────────────
function Forecast({ forecast }: { forecast: number[] }) {
  const max = Math.max(0, ...forecast);
  const dayName = (i: number) =>
    i === 0
      ? "Today"
      : new Date(Date.now() + i * 86400000).toLocaleDateString(undefined, {
          weekday: "short",
        });
  return (
    <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
      {forecast.map((n, i) => {
        const heavy = n > 0 && n === max && max >= 3;
        return (
          <div
            key={i}
            className="shrink-0 rounded-xl card-bg px-3 py-2.5 min-w-[86px]"
            style={{
              border: heavy
                ? "1px solid rgba(217,154,61,0.45)"
                : "1px solid var(--color-sidebar-border, rgba(255,255,255,0.08))",
            }}
          >
            <div
              className="text-[10px] uppercase"
              style={{
                letterSpacing: "0.12em",
                color: i === 0 ? GOLD : heavy ? "#d99a3d" : "var(--color-text-muted)",
              }}
            >
              {dayName(i)}
            </div>
            <div className="text-[11.5px] text-themed mt-1 leading-snug">
              {n === 0 ? "rest or practice" : `${n} to keep strong`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────── bottom sheet ───────────────────────────
function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className="absolute inset-0 z-40 transition-opacity duration-200"
        style={{
          background: "var(--overlay-strong, rgba(4,6,11,0.66))",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />
      <div
        className="absolute left-2.5 right-2.5 bottom-2.5 z-50 rounded-3xl card-bg border sidebar-border px-5 pt-3 pb-6 transition-transform duration-300"
        style={{ transform: open ? "translateY(0)" : "translateY(115%)" }}
      >
        <div
          className="w-9 h-1 rounded-full mx-auto mb-3.5"
          style={{ background: "var(--overlay-medium, rgba(255,255,255,0.14))" }}
        />
        {children}
      </div>
    </>
  );
}

function SheetBtn({
  label,
  onClick,
  primary,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-xl py-3 text-[14px] font-semibold touch-manipulation active:opacity-90"
      style={
        primary
          ? {
              background: `linear-gradient(170deg, var(--color-gold-hi, #e2c476), ${GOLD})`,
              color: "#181305",
            }
          : {
              border: "1px solid var(--color-sidebar-border, rgba(255,255,255,0.12))",
              color: "var(--color-text)",
            }
      }
    >
      {label}
    </button>
  );
}

// ─────────────────────────── add-to-path picker ───────────────────────────
type AddMode = "surah" | "juz" | "page" | "range" | "names";

const MODE_LABEL: Record<AddMode, string> = {
  surah: "Sūrah",
  juz: "Juzʼ",
  page: "Page",
  range: "Range",
  names: "99 Names",
};

function AddPicker({
  pace,
  onAdd,
  onCancel,
}: {
  pace: string;
  onAdd: (inputs: NewCardInput[]) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<AddMode>("surah");
  const [surah, setSurah] = useState(78); // An-Naba — a common starting sūrah
  const [juz, setJuz] = useState(30);
  const [page, setPage] = useState(1);
  const [rStartS, setRStartS] = useState(1);
  const [rStartA, setRStartA] = useState(1);
  const [rEndS, setREndS] = useState(1);
  const [rEndA, setREndA] = useState(7);
  const [nameFrom, setNameFrom] = useState(1);
  const [nameTo, setNameTo] = useState(NAME_COUNT);
  const [busy, setBusy] = useState(false);

  const inputs = useMemo<NewCardInput[]>(() => {
    if (mode === "names") return buildNamesCards(nameFrom, nameTo, pace);
    let scope: HifzScope;
    if (mode === "surah") scope = { kind: "surah", surah };
    else if (mode === "juz") scope = { kind: "juz", juz };
    else if (mode === "page") scope = { kind: "page", page };
    else
      scope = {
        kind: "range",
        startSurah: rStartS,
        startAyah: rStartA,
        endSurah: rEndS,
        endAyah: rEndA,
      };
    return buildStationCards(scope, pace as never);
  }, [mode, surah, juz, page, rStartS, rStartA, rEndS, rEndA, nameFrom, nameTo, pace]);

  const stationCount = useMemo(
    () => new Set(inputs.map((i) => i.stationKey ?? `${i.startSurah}:${i.startAyah}`)).size,
    [inputs]
  );
  const unitWord = mode === "names" ? "Names" : "āyāt";

  const submit = async () => {
    if (!inputs.length || busy) return;
    setBusy(true);
    try {
      await onAdd(inputs);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="font-serif text-[19px] text-themed">Add to my path</p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="text-themed-muted p-1 touch-manipulation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Mode chips */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(MODE_LABEL) as AddMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              hapticSelection();
              setMode(m);
            }}
            className="rounded-xl px-3.5 py-2 text-[12.5px] touch-manipulation"
            style={
              mode === m
                ? {
                    border: `1px solid ${GOLD}`,
                    background: "var(--color-gold-dim, rgba(201,168,76,0.16))",
                    color: "var(--color-gold-hi, #e2c476)",
                  }
                : {
                    border: "1px solid var(--color-sidebar-border, rgba(255,255,255,0.12))",
                    color: "var(--color-text-muted)",
                  }
            }
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      {/* Mode-specific inputs */}
      <div className="mt-4 space-y-3">
        {mode === "surah" && (
          <Field label="Sūrah">
            <Select
              value={surah}
              onChange={setSurah}
              options={Array.from({ length: TOTAL_SURAHS }, (_, i) => ({
                value: i + 1,
                label: `${i + 1}. ${surahName(i + 1)}`,
              }))}
            />
          </Field>
        )}
        {mode === "juz" && (
          <Field label="Juzʼ">
            <Select
              value={juz}
              onChange={setJuz}
              options={Array.from({ length: TOTAL_JUZ }, (_, i) => ({
                value: i + 1,
                label: `Juzʼ ${i + 1}`,
              }))}
            />
          </Field>
        )}
        {mode === "page" && (
          <Field label={`Mushaf page (1–${TOTAL_PAGES})`}>
            <Num value={page} min={1} max={TOTAL_PAGES} onChange={setPage} />
          </Field>
        )}
        {mode === "range" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="From sūrah">
              <Num value={rStartS} min={1} max={TOTAL_SURAHS} onChange={setRStartS} />
            </Field>
            <Field label="From āyah">
              <Num value={rStartA} min={1} max={verseCount(rStartS) || 1} onChange={setRStartA} />
            </Field>
            <Field label="To sūrah">
              <Num value={rEndS} min={1} max={TOTAL_SURAHS} onChange={setREndS} />
            </Field>
            <Field label="To āyah">
              <Num value={rEndA} min={1} max={verseCount(rEndS) || 1} onChange={setREndA} />
            </Field>
          </div>
        )}
        {mode === "names" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="From">
              <Num value={nameFrom} min={1} max={NAME_COUNT} onChange={setNameFrom} />
            </Field>
            <Field label="To">
              <Num value={nameTo} min={1} max={NAME_COUNT} onChange={setNameTo} />
            </Field>
          </div>
        )}
      </div>

      {/* Preview + confirm */}
      <p className="text-themed-muted text-[12px] mt-4 text-center">
        {inputs.length > 0
          ? `Adds ${stationCount} station${stationCount === 1 ? "" : "s"} · ${inputs.length} ${unitWord}`
          : "Nothing to add for this selection."}
      </p>
      <button
        type="button"
        onClick={submit}
        disabled={!inputs.length || busy}
        className="w-full mt-3 rounded-xl py-3.5 font-semibold text-[15px] touch-manipulation active:opacity-90 disabled:opacity-40"
        style={{
          background: `linear-gradient(170deg, var(--color-gold-hi, #e2c476), ${GOLD})`,
          color: "#181305",
        }}
      >
        {busy ? "Adding…" : "Add to path"}
      </button>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-themed-muted text-[11px] uppercase mb-1.5" style={{ letterSpacing: "0.1em" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: number;
  onChange: (v: number) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-xl border sidebar-border card-bg text-themed text-[14px] px-3 py-2.5 appearance-none touch-manipulation"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Num({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, n)));
      }}
      className="w-full rounded-xl border sidebar-border card-bg text-themed text-[14px] px-3 py-2.5 tabular-nums touch-manipulation"
    />
  );
}

// ─────────────────────────── mushaf coverage map ───────────────────────────
// Salvaged from the old standalone HifzProgressMap (Phase Wire): the "Mushaf"
// tab's whole-Qurʼān heatmap, embedded here so PathView owns its own view and no
// deleted component is imported. Juz / Surahs / Pages toggle over card status.
const MUSHAF_RANK: Record<CardStatus, number> = {
  new: 1,
  learning: 2,
  review: 3,
  memorized: 4,
};
type MushafMode = "juz" | "surah" | "page";

// Distinct state colours: faint (untouched) · gray (learning/new) · brown
// (in review) · hiqmah gold (memorized).
const MUSHAF_C = {
  faint: "bg-[var(--overlay-medium)]",
  gray: "bg-slate-500/70",
  brown: "bg-[#8f5d34]",
  gold: "bg-gold",
};

function mushafPageColor(rank: number): string {
  if (rank >= 4) return MUSHAF_C.gold;
  if (rank === 3) return MUSHAF_C.brown;
  if (rank >= 1) return MUSHAF_C.gray;
  return MUSHAF_C.faint;
}
function mushafAggColor(total: number, memorized: number, maxRank: number): string {
  if (total === 0 || maxRank === 0) return MUSHAF_C.faint;
  if (memorized === total) return MUSHAF_C.gold;
  if (maxRank >= 3) return MUSHAF_C.brown;
  return MUSHAF_C.gray;
}

function MushafMap({ cards }: { cards: HifzCard[] }) {
  const [mode, setMode] = useState<MushafMode>("juz");
  const pages = useMemo(() => allPages(), []);

  // page number → best status rank covering it
  const pageRank = useMemo(() => {
    const m = new Map<number, number>();
    for (const c of cards) {
      const r = MUSHAF_RANK[c.status];
      for (const p of pagesForCard(c)) m.set(p, Math.max(m.get(p) ?? 0, r));
    }
    return m;
  }, [cards]);

  const juzAgg = useMemo(() => {
    const agg = Array.from({ length: TOTAL_JUZ }, () => ({ total: 0, memorized: 0, maxRank: 0 }));
    for (const p of pages) {
      const j = p.j;
      if (j < 1 || j > TOTAL_JUZ) continue;
      const a = agg[j - 1];
      a.total += 1;
      const r = pageRank.get(p.p) ?? 0;
      if (r >= 4) a.memorized += 1;
      if (r > a.maxRank) a.maxRank = r;
    }
    return agg;
  }, [pages, pageRank]);

  const surahAgg = useMemo(() => {
    const agg = Array.from({ length: TOTAL_SURAHS }, () => ({ total: 0, memorized: 0, maxRank: 0 }));
    for (let s = 1; s <= TOTAL_SURAHS; s++) {
      const vc = verseCount(s);
      if (!vc) continue;
      const fromP = pageOfAyah(s, 1);
      const toP = pageOfAyah(s, vc);
      const a = agg[s - 1];
      for (let p = Math.min(fromP, toP); p <= Math.max(fromP, toP); p++) {
        a.total += 1;
        const r = pageRank.get(p) ?? 0;
        if (r >= 4) a.memorized += 1;
        if (r > a.maxRank) a.maxRank = r;
      }
    }
    return agg;
  }, [pageRank]);

  const totalMemorizedPages = juzAgg.reduce((n, a) => n + a.memorized, 0);

  return (
    <div className="space-y-4">
      {/* Summary + toggle */}
      <div className="card-bg rounded-2xl border sidebar-border p-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-themed font-bold text-lg leading-none">
            {totalMemorizedPages}
            <span className="text-themed-muted text-sm font-semibold"> / {TOTAL_PAGES}</span>
          </p>
          <p className="text-themed-muted text-xs mt-1">
            pages memorized · {Math.round((totalMemorizedPages / TOTAL_PAGES) * 100)}%
          </p>
        </div>
        <div className="flex rounded-full border sidebar-border overflow-hidden text-xs font-semibold shrink-0">
          {(["juz", "surah", "page"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 touch-manipulation ${
                mode === m ? "bg-gold text-[#0a1628]" : "text-themed-muted"
              }`}
            >
              {m === "juz" ? "Juz" : m === "surah" ? "Surahs" : "Pages"}
            </button>
          ))}
        </div>
      </div>

      {mode === "juz" && (
        <div className="grid grid-cols-5 gap-2">
          {juzAgg.map((a, i) => {
            const cls = mushafAggColor(a.total, a.memorized, a.maxRank);
            const dark = cls === MUSHAF_C.gold;
            return (
              <div
                key={i}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center ${cls} ${
                  cls === MUSHAF_C.faint ? "border sidebar-border" : ""
                }`}
              >
                <span className={`font-bold ${dark ? "text-[#0a1628]" : "text-themed"}`}>{i + 1}</span>
                {a.maxRank > 0 && (
                  <span className={`text-[9px] ${dark ? "text-[#0a1628]/70" : "text-themed-muted"}`}>
                    {a.memorized}/{a.total}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {mode === "surah" && (
        <div className="grid grid-cols-10 gap-1">
          {surahAgg.map((a, i) => {
            const cls = mushafAggColor(a.total, a.memorized, a.maxRank);
            const dark = cls === MUSHAF_C.gold;
            return (
              <div
                key={i}
                title={surahName(i + 1)}
                className={`aspect-square rounded flex items-center justify-center ${cls} ${
                  cls === MUSHAF_C.faint ? "border sidebar-border" : ""
                }`}
              >
                <span className={`text-[9px] font-semibold ${dark ? "text-[#0a1628]" : "text-themed"}`}>
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {mode === "page" && (
        <div className="flex flex-wrap gap-[3px]">
          {pages.map((p) => (
            <div
              key={p.p}
              title={`Page ${p.p}`}
              className={`w-2.5 h-2.5 rounded-[2px] ${mushafPageColor(pageRank.get(p.p) ?? 0)}`}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        <MushafLegend cls={MUSHAF_C.gold} label="Memorized" />
        <MushafLegend cls={MUSHAF_C.brown} label="In review" />
        <MushafLegend cls={MUSHAF_C.gray} label="Learning / new" />
        <MushafLegend cls={MUSHAF_C.faint} label="Not started" />
      </div>
      {mode !== "page" && (
        <p className="text-themed-muted/70 text-xs px-1 leading-relaxed">
          A {mode === "juz" ? "juz" : "surah"} turns gold only once every page in it is memorized; brown =
          some in review, gray = started.
        </p>
      )}
    </div>
  );
}

function MushafLegend({ cls, label }: { cls: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-[3px] ${cls}`} />
      <span className="text-themed-muted text-xs">{label}</span>
    </div>
  );
}
