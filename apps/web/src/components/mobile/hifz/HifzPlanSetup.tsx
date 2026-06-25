"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { HifzAdapter, NewCardInput } from "@hidden-hiqmah/ui/lib/hifz/types";
import { NEW_PER_DAY } from "@hidden-hiqmah/ui/lib/hifz/srs";
import {
  buildPageCards,
  buildAyahCards,
  buildSurahCards,
  buildRangeCard,
  surahName,
  verseCount,
  TOTAL_PAGES,
  TOTAL_SURAHS,
} from "@/lib/hifz/quran";

type Gran = "page" | "ayah" | "surah" | "range";
const GRANS: { key: Gran; label: string }[] = [
  { key: "page", label: "Page" },
  { key: "ayah", label: "Ayah" },
  { key: "surah", label: "Surah" },
  { key: "range", label: "Range" },
];

function clampN(v: number, lo: number, hi: number): number {
  if (Number.isNaN(v)) return lo;
  return Math.max(lo, Math.min(hi, v));
}

export default function HifzPlanSetup({
  adapter,
  onDone,
}: {
  adapter: HifzAdapter;
  onDone: () => void;
}) {
  const [gran, setGran] = useState<Gran>("page");
  const [busy, setBusy] = useState(false);

  // page
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  // ayah
  const [aSurah, setASurah] = useState(1);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(7);
  // surah
  const [fromSurah, setFromSurah] = useState(1);
  const [toSurah, setToSurah] = useState(1);
  // range
  const [rS, setRS] = useState(1);
  const [rA, setRA] = useState(1);
  const [rES, setRES] = useState(1);
  const [rEA, setREA] = useState(7);

  const preview = useMemo<NewCardInput[]>(() => {
    if (gran === "page") return buildPageCards(fromPage, toPage);
    if (gran === "ayah") return buildAyahCards(aSurah, fromAyah, toAyah);
    if (gran === "surah") return buildSurahCards(fromSurah, toSurah);
    return [buildRangeCard(rS, rA, rES, rEA)];
  }, [gran, fromPage, toPage, aSurah, fromAyah, toAyah, fromSurah, toSurah, rS, rA, rES, rEA]);

  const add = async () => {
    if (busy || preview.length === 0) return;
    setBusy(true);
    try {
      await adapter.addCards(preview);
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Granularity */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-themed-muted/80 px-1 mb-2">
          Memorize by
        </p>
        <div className="grid grid-cols-4 gap-2">
          {GRANS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGran(g.key)}
              className={`rounded-xl border py-2.5 text-sm font-semibold touch-manipulation transition-colors ${
                gran === g.key
                  ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-gold"
                  : "sidebar-border card-bg text-themed"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selection */}
      <div className="card-bg rounded-2xl border sidebar-border p-4 space-y-3">
        {gran === "page" && (
          <Pair
            label="Pages"
            children1={<Num value={fromPage} min={1} max={TOTAL_PAGES} onChange={(v) => setFromPage(clampN(v, 1, TOTAL_PAGES))} />}
            children2={<Num value={toPage} min={1} max={TOTAL_PAGES} onChange={(v) => setToPage(clampN(v, 1, TOTAL_PAGES))} />}
          />
        )}

        {gran === "ayah" && (
          <>
            <Field label="Surah">
              <SurahSelect value={aSurah} onChange={(s) => { setASurah(s); setToAyah(Math.min(toAyah, verseCount(s))); }} />
            </Field>
            <Pair
              label={`Ayahs (1–${verseCount(aSurah)})`}
              children1={<Num value={fromAyah} min={1} max={verseCount(aSurah)} onChange={(v) => setFromAyah(clampN(v, 1, verseCount(aSurah)))} />}
              children2={<Num value={toAyah} min={1} max={verseCount(aSurah)} onChange={(v) => setToAyah(clampN(v, 1, verseCount(aSurah)))} />}
            />
          </>
        )}

        {gran === "surah" && (
          <Pair
            label="Surahs"
            children1={<SurahSelect value={fromSurah} onChange={setFromSurah} />}
            children2={<SurahSelect value={toSurah} onChange={setToSurah} />}
          />
        )}

        {gran === "range" && (
          <>
            <Field label="From">
              <div className="flex gap-2">
                <SurahSelect value={rS} onChange={(s) => setRS(s)} />
                <Num value={rA} min={1} max={verseCount(rS)} onChange={(v) => setRA(clampN(v, 1, verseCount(rS)))} />
              </div>
            </Field>
            <Field label="To">
              <div className="flex gap-2">
                <SurahSelect value={rES} onChange={(s) => setRES(s)} />
                <Num value={rEA} min={1} max={verseCount(rES)} onChange={(v) => setREA(clampN(v, 1, verseCount(rES)))} />
              </div>
            </Field>
          </>
        )}
      </div>

      {/* Preview + add */}
      <div className="px-1">
        <p className="text-themed-muted text-sm">
          {preview.length === 0
            ? "Nothing selected"
            : `Adds ${preview.length} card${preview.length === 1 ? "" : "s"} · introduces up to ${NEW_PER_DAY[preview[0].unit]}/day`}
        </p>
        {preview.length > 0 && preview.length <= 3 && (
          <p className="text-themed-muted/70 text-xs mt-1 truncate">
            {preview.map((c) => c.label).join(" · ")}
          </p>
        )}
      </div>

      <button
        onClick={add}
        disabled={busy || preview.length === 0}
        className="w-full rounded-xl bg-gold text-[#0a1628] font-bold py-3.5 flex items-center justify-center gap-2 active:opacity-90 disabled:opacity-40 touch-manipulation"
      >
        <Plus size={18} /> {busy ? "Adding…" : `Add ${preview.length || ""} to plan`.trim()}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-themed-muted text-xs mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Pair({
  label,
  children1,
  children2,
}: {
  label: string;
  children1: React.ReactNode;
  children2: React.ReactNode;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        {children1}
        <span className="text-themed-muted text-sm">to</span>
        {children2}
      </div>
    </Field>
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
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="flex-1 min-w-0 bg-[var(--color-bg)] rounded-lg px-3 py-2.5 text-themed text-base outline-none border sidebar-border focus:border-[var(--color-gold)]/40"
    />
  );
}

function SurahSelect({ value, onChange }: { value: number; onChange: (s: number) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="flex-1 min-w-0 bg-[var(--color-bg)] rounded-lg px-3 py-2.5 text-themed text-base outline-none border sidebar-border focus:border-[var(--color-gold)]/40"
    >
      {Array.from({ length: TOTAL_SURAHS }, (_, i) => i + 1).map((s) => (
        <option key={s} value={s}>
          {s}. {surahName(s)}
        </option>
      ))}
    </select>
  );
}
