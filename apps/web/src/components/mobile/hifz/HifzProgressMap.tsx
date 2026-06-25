"use client";

import { useMemo, useState } from "react";
import type { HifzCard, CardStatus } from "@hidden-hiqmah/ui/lib/hifz/types";
import {
  allPages,
  pagesForCard,
  pageOfAyah,
  verseCount,
  surahName,
  TOTAL_JUZ,
  TOTAL_SURAHS,
} from "@/lib/hifz/quran";

const RANK: Record<CardStatus, number> = { new: 1, learning: 2, review: 3, memorized: 4 };
type Mode = "juz" | "surah" | "page";

// Distinct state colours: faint (untouched) · gray (learning/new) · brown (review)
// · hiqmah gold (memorized).
const C = {
  faint: "bg-white/[0.06]",
  gray: "bg-slate-500/70",
  brown: "bg-[#8f5d34]",
  gold: "bg-gold",
};

/** Colour for one atomic unit (a page) by its own state. */
function pageColor(rank: number): string {
  if (rank >= 4) return C.gold;
  if (rank === 3) return C.brown;
  if (rank >= 1) return C.gray;
  return C.faint;
}
/** Colour for an aggregate (juz/surah): gold only when fully memorized. */
function aggColor(total: number, memorized: number, maxRank: number): string {
  if (total === 0 || maxRank === 0) return C.faint;
  if (memorized === total) return C.gold;
  if (maxRank >= 3) return C.brown;
  return C.gray;
}

export default function HifzProgressMap({ cards }: { cards: HifzCard[] }) {
  const [mode, setMode] = useState<Mode>("juz");
  const pages = allPages();

  // page number → best status rank covering it
  const pageRank = useMemo(() => {
    const m = new Map<number, number>();
    for (const c of cards) {
      const r = RANK[c.status];
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
            <span className="text-themed-muted text-sm font-semibold"> / 604</span>
          </p>
          <p className="text-themed-muted text-xs mt-1">
            pages memorized · {Math.round((totalMemorizedPages / 604) * 100)}%
          </p>
        </div>
        <div className="flex rounded-full border sidebar-border overflow-hidden text-xs font-semibold shrink-0">
          {(["juz", "surah", "page"] as const).map((m) => (
            <button
              key={m}
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
            const cls = aggColor(a.total, a.memorized, a.maxRank);
            const dark = cls === C.gold;
            return (
              <div
                key={i}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center ${cls} ${
                  cls === C.faint ? "border sidebar-border" : ""
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
        <div className="grid grid-cols-6 gap-1.5">
          {surahAgg.map((a, i) => {
            const cls = aggColor(a.total, a.memorized, a.maxRank);
            const dark = cls === C.gold;
            return (
              <div
                key={i}
                title={surahName(i + 1)}
                className={`aspect-square rounded-lg flex items-center justify-center ${cls} ${
                  cls === C.faint ? "border sidebar-border" : ""
                }`}
              >
                <span className={`text-[11px] font-semibold ${dark ? "text-[#0a1628]" : "text-themed"}`}>
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
              className={`w-2.5 h-2.5 rounded-[2px] ${pageColor(pageRank.get(p.p) ?? 0)}`}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        <Legend cls={C.gold} label="Memorized" />
        <Legend cls={C.brown} label="In review" />
        <Legend cls={C.gray} label="Learning / new" />
        <Legend cls={C.faint} label="Not started" />
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

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-[3px] ${cls}`} />
      <span className="text-themed-muted text-xs">{label}</span>
    </div>
  );
}
