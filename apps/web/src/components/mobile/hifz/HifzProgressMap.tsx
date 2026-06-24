"use client";

import { useMemo, useState } from "react";
import type { HifzCard, CardStatus } from "@hidden-hiqmah/ui/lib/hifz/types";
import { allPages, pagesForCard, TOTAL_JUZ } from "@/lib/hifz/quran";

const RANK: Record<CardStatus, number> = { new: 1, learning: 2, review: 3, memorized: 4 };

export default function HifzProgressMap({ cards }: { cards: HifzCard[] }) {
  const [mode, setMode] = useState<"juz" | "page">("juz");

  // page number → best status rank covering it
  const pageRank = useMemo(() => {
    const m = new Map<number, number>();
    for (const c of cards) {
      const r = RANK[c.status];
      for (const p of pagesForCard(c)) m.set(p, Math.max(m.get(p) ?? 0, r));
    }
    return m;
  }, [cards]);

  const pages = allPages();

  // juz → { total, memorized, started }
  const juzAgg = useMemo(() => {
    const agg = Array.from({ length: TOTAL_JUZ }, () => ({ total: 0, memorized: 0, started: 0 }));
    for (const p of pages) {
      const j = p.j;
      if (j < 1 || j > TOTAL_JUZ) continue;
      const a = agg[j - 1];
      a.total += 1;
      const r = pageRank.get(p.p) ?? 0;
      if (r >= 4) a.memorized += 1;
      if (r >= 1) a.started += 1;
    }
    return agg;
  }, [pages, pageRank]);

  const totalMemorizedPages = juzAgg.reduce((n, a) => n + a.memorized, 0);

  return (
    <div className="space-y-4">
      {/* Summary + toggle */}
      <div className="card-bg rounded-2xl border sidebar-border p-4 flex items-center justify-between">
        <div>
          <p className="text-themed font-bold text-lg leading-none">
            {totalMemorizedPages}
            <span className="text-themed-muted text-sm font-semibold"> / 604 pages</span>
          </p>
          <p className="text-themed-muted text-xs mt-1">
            {Math.round((totalMemorizedPages / 604) * 100)}% memorized
          </p>
        </div>
        <div className="flex rounded-full border sidebar-border overflow-hidden text-xs font-semibold">
          {(["juz", "page"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 touch-manipulation ${
                mode === m ? "bg-gold text-[#0a1628]" : "text-themed-muted"
              }`}
            >
              {m === "juz" ? "Juz" : "Pages"}
            </button>
          ))}
        </div>
      </div>

      {mode === "juz" ? (
        <div className="grid grid-cols-5 gap-2">
          {juzAgg.map((a, i) => {
            const frac = a.total ? a.memorized / a.total : 0;
            const fillPct = a.total === 0 ? 0 : Math.round((0.12 + 0.88 * frac) * 100);
            return (
              <div
                key={i}
                className="aspect-square rounded-xl border sidebar-border flex flex-col items-center justify-center"
                style={{
                  backgroundColor: a.started
                    ? `color-mix(in srgb, var(--color-gold) ${fillPct}%, transparent)`
                    : undefined,
                }}
              >
                <span className={`font-bold ${frac > 0.5 ? "text-[#0a1628]" : "text-themed"}`}>
                  {i + 1}
                </span>
                {a.started > 0 && (
                  <span className={`text-[9px] ${frac > 0.5 ? "text-[#0a1628]/70" : "text-themed-muted"}`}>
                    {a.memorized}/{a.total}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-[3px]">
          {pages.map((p) => {
            const r = pageRank.get(p.p) ?? 0;
            const cls =
              r >= 4
                ? "bg-gold"
                : r === 3
                  ? "bg-[var(--color-gold)]/55"
                  : r >= 1
                    ? "bg-[var(--color-gold)]/25"
                    : "bg-white/5";
            return <div key={p.p} title={`Page ${p.p}`} className={`w-2.5 h-2.5 rounded-[2px] ${cls}`} />;
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        <Legend cls="bg-gold" label="Memorized" />
        <Legend cls="bg-[var(--color-gold)]/55" label="In review" />
        <Legend cls="bg-[var(--color-gold)]/25" label="Learning / new" />
        <Legend cls="bg-white/5" label="Not started" />
      </div>
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
