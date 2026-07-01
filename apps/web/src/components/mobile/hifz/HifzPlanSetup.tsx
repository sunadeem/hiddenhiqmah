"use client";

import { useMemo, useState } from "react";
import { Plus, Check } from "lucide-react";
import type { HifzAdapter, NewCardInput } from "@hidden-hiqmah/ui/lib/hifz/types";
import { NEW_PER_DAY } from "@hidden-hiqmah/ui/lib/hifz/srs";
import { requireAccount } from "@/lib/requireAccount";
import {
  buildPageCards,
  buildAyahCards,
  buildSurahCards,
  buildRangeCard,
  buildGuidedCards,
  unitsForJourney,
  surahName,
  verseCount,
  TOTAL_PAGES,
  TOTAL_SURAHS,
  type Journey,
  type GuidedUnit,
} from "@/lib/hifz/quran";

const JOURNEYS: { key: Journey; label: string; desc: string }[] = [
  { key: "shortest", label: "Shortest surahs first", desc: "The whole Qur'an, smallest surahs first — a gentle ramp." },
  { key: "juz-amma", label: "Juz ʿAmma", desc: "The 30th juz (An-Naba → An-Nas) — short, familiar surahs." },
  { key: "back-to-front", label: "Full · back to front", desc: "Juz 30 first, then 29… the classic order." },
  { key: "front-to-back", label: "Full · front to back", desc: "Al-Baqarah onward — the traditional order." },
];

const UNIT_LABEL: Record<GuidedUnit, string> = { page: "Pages", surah: "Surahs", ayah: "Ayahs" };

type CustomGran = "page" | "ayah" | "surah" | "range";
const CUSTOM_GRANS: { key: CustomGran; label: string }[] = [
  { key: "page", label: "Page" },
  { key: "ayah", label: "Ayah" },
  { key: "surah", label: "Surah" },
  { key: "range", label: "Range" },
];

function clampN(v: number, lo: number, hi: number): number {
  if (Number.isNaN(v)) return lo;
  return Math.max(lo, Math.min(hi, v));
}

function planSummary(cards: NewCardInput[]): string {
  if (!cards.length) return "Nothing selected";
  const cap = NEW_PER_DAY[cards[0].unit] ?? 2;
  const days = Math.ceil(cards.length / cap);
  const dur = days <= 1 ? "about a day" : days <= 60 ? `~${days} days` : `~${Math.round(days / 30)} months`;
  return `${cards.length} card${cards.length === 1 ? "" : "s"} · ${cap}/day · ${dur}`;
}

export default function HifzPlanSetup({
  adapter,
  onDone,
}: {
  adapter: HifzAdapter;
  onDone: () => void;
}) {
  const [tab, setTab] = useState<"guided" | "custom">("guided");
  const [busy, setBusy] = useState(false);

  // Guided
  const [journey, setJourney] = useState<Journey>("shortest");
  const [gUnit, setGUnit] = useState<GuidedUnit>("surah");

  // Custom
  const [gran, setGran] = useState<CustomGran>("page");
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [aSurah, setASurah] = useState(1);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(7);
  const [fromSurah, setFromSurah] = useState(1);
  const [toSurah, setToSurah] = useState(1);
  const [rS, setRS] = useState(1);
  const [rA, setRA] = useState(1);
  const [rES, setRES] = useState(1);
  const [rEA, setREA] = useState(7);

  const guidedPreview = useMemo(() => buildGuidedCards(journey, gUnit), [journey, gUnit]);
  const customPreview = useMemo<NewCardInput[]>(() => {
    if (gran === "page") return buildPageCards(fromPage, toPage);
    if (gran === "ayah") return buildAyahCards(aSurah, fromAyah, toAyah);
    if (gran === "surah") return buildSurahCards(fromSurah, toSurah);
    return [buildRangeCard(rS, rA, rES, rEA)];
  }, [gran, fromPage, toPage, aSurah, fromAyah, toAyah, fromSurah, toSurah, rS, rA, rES, rEA]);

  const preview = tab === "guided" ? guidedPreview : customPreview;
  const units = unitsForJourney(journey);

  const pickJourney = (j: Journey) => {
    setJourney(j);
    const u = unitsForJourney(j);
    if (!u.includes(gUnit)) setGUnit(u[0]);
  };

  const add = async () => {
    if (busy || preview.length === 0) return;
    // Creating a memorization plan saves progress → require an account on web.
    if (
      !requireAccount({
        title: "Save your Hifz plan",
        message:
          "Create a free account to save your memorization plan and track it across your devices.",
      })
    ) {
      return;
    }
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
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(["guided", "custom"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setTab(m)}
            className={`rounded-xl border py-2.5 text-sm font-semibold touch-manipulation transition-colors ${
              tab === m
                ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-gold"
                : "sidebar-border card-bg text-themed-muted"
            }`}
          >
            {m === "guided" ? "Guided plan" : "Custom"}
          </button>
        ))}
      </div>

      {tab === "guided" ? (
        <>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-themed-muted/80 px-1 mb-2">
              Journey
            </p>
            <div className="space-y-2">
              {JOURNEYS.map((j) => {
                const sel = journey === j.key;
                return (
                  <button
                    key={j.key}
                    onClick={() => pickJourney(j.key)}
                    className={`w-full text-left rounded-xl border p-3 flex items-start gap-3 touch-manipulation transition-colors ${
                      sel ? "border-[var(--color-gold)] bg-[var(--color-gold)]/8" : "sidebar-border card-bg"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        sel ? "border-[var(--color-gold)] bg-gold" : "sidebar-border"
                      }`}
                    >
                      {sel && <Check size={13} strokeWidth={3} className="text-[#0a1628]" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm ${sel ? "text-gold" : "text-themed"}`}>{j.label}</p>
                      <p className="text-themed-muted text-xs mt-0.5 leading-snug">{j.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-themed-muted/80 px-1 mb-2">
              Learn by
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["surah", "page", "ayah"] as GuidedUnit[]).map((u) => {
                const enabled = units.includes(u);
                return (
                  <button
                    key={u}
                    disabled={!enabled}
                    onClick={() => setGUnit(u)}
                    className={`rounded-xl border py-2.5 text-sm font-semibold touch-manipulation transition-colors disabled:opacity-30 ${
                      gUnit === u && enabled
                        ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-gold"
                        : "sidebar-border card-bg text-themed"
                    }`}
                  >
                    {UNIT_LABEL[u]}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-themed-muted/80 px-1 mb-2">
              Memorize by
            </p>
            <div className="grid grid-cols-4 gap-2">
              {CUSTOM_GRANS.map((g) => (
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
                    <SurahSelect value={rS} onChange={setRS} />
                    <Num value={rA} min={1} max={verseCount(rS)} onChange={(v) => setRA(clampN(v, 1, verseCount(rS)))} />
                  </div>
                </Field>
                <Field label="To">
                  <div className="flex gap-2">
                    <SurahSelect value={rES} onChange={setRES} />
                    <Num value={rEA} min={1} max={verseCount(rES)} onChange={(v) => setREA(clampN(v, 1, verseCount(rES)))} />
                  </div>
                </Field>
              </>
            )}
          </div>
        </>
      )}

      {/* Preview + add */}
      <div className="px-1">
        <p className="text-themed-muted text-sm">{planSummary(preview)}</p>
      </div>

      <button
        onClick={add}
        disabled={busy || preview.length === 0}
        className="w-full rounded-xl bg-gold text-[#0a1628] font-bold py-3.5 flex items-center justify-center gap-2 active:opacity-90 disabled:opacity-40 touch-manipulation"
      >
        <Plus size={18} /> {busy ? "Adding…" : "Add to plan"}
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
