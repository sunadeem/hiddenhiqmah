"use client";

import { useEffect, useMemo, useState } from "react";
import { useDailyAdapter } from "@/lib/daily/useDailyAdapter";
import type { DhikrDayCount } from "@hidden-hiqmah/ui/lib/daily/types";

type Period = "day" | "week" | "month";

// Labels for the built-in dhikr keys (Worship tab). The breakdown is dynamic —
// any dhikr key that appears in the data is shown; unknown keys fall back to the
// key itself, so new/added dhikr surface automatically.
const LABEL_OF: Record<string, { label: string; ar: string }> = {
  istighfar: { label: "Astaghfirullah", ar: "أستغفر الله" },
  takbir: { label: "Allahu Akbar", ar: "الله أكبر" },
  subhanallah: { label: "SubhanAllah", ar: "سبحان الله" },
  alhamdulillah: { label: "Alhamdulillah", ar: "الحمد لله" },
  salawat: { label: "Salawat", ar: "اللهم صل على محمد" },
  tahlil: { label: "La ilaha illallah", ar: "لا إله إلا الله" },
  hawqala: { label: "La hawla wa la quwwata", ar: "لا حول ولا قوة" },
  hasbunallah: { label: "Hasbunallah", ar: "حسبنا الله" },
  subhanallah_hamd: { label: "SubhanAllah wa bihamdihi", ar: "سبحان الله وبحمده" },
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sumInRange(rows: DhikrDayCount[], from: string, to: string) {
  return rows.reduce(
    (a, r) => (r.localDate >= from && r.localDate <= to ? a + r.count : a),
    0
  );
}
function prettify(key: string) {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/[-_]/g, " ");
}

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const MON = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export default function DhikrStatsScreen() {
  const { adapter } = useDailyAdapter();
  const [rows, setRows] = useState<DhikrDayCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("day");

  useEffect(() => {
    let alive = true;
    const now = new Date();
    // Fetch from Jan 1 of last year so the Month tab (this year) + its
    // "vs last year" delta both have data.
    adapter
      .getDhikrRange(ymd(new Date(now.getFullYear() - 1, 0, 1)), ymd(now))
      .then((r) => {
        if (alive) {
          setRows(r);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [adapter]);

  const stats = useMemo(() => {
    const now = new Date();
    let from: string;
    let to: string;
    let prevFrom: string;
    let prevTo: string;
    let unit: string;
    let deltaLabel: string;
    let trend: { label: string; count: number }[];

    if (period === "day") {
      // This week, Sunday → Saturday; one bar per day.
      const sun = addDays(now, -now.getDay());
      from = ymd(sun);
      to = ymd(addDays(sun, 6));
      prevFrom = ymd(addDays(sun, -7));
      prevTo = ymd(addDays(sun, -1));
      unit = "recitations this week";
      deltaLabel = "vs last week";
      trend = Array.from({ length: 7 }, (_, i) => {
        const s = ymd(addDays(sun, i));
        return { label: DOW[i], count: sumInRange(rows, s, s) };
      });
    } else if (period === "week") {
      // This month, one bar per week (7-day chunks from the 1st).
      const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      from = ymd(mStart);
      to = ymd(mEnd);
      prevFrom = ymd(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      prevTo = ymd(new Date(now.getFullYear(), now.getMonth(), 0));
      unit = "recitations this month";
      deltaLabel = "vs last month";
      trend = [];
      let wk = mStart;
      let idx = 1;
      while (ymd(wk) <= to) {
        const ce = ymd(addDays(wk, 6));
        trend.push({ label: `W${idx}`, count: sumInRange(rows, ymd(wk), ce > to ? to : ce) });
        wk = addDays(wk, 7);
        idx++;
      }
    } else {
      // This year, one bar per month (Jan → current month).
      from = ymd(new Date(now.getFullYear(), 0, 1));
      to = ymd(new Date(now.getFullYear(), 11, 31));
      prevFrom = ymd(new Date(now.getFullYear() - 1, 0, 1));
      prevTo = ymd(new Date(now.getFullYear() - 1, 11, 31));
      unit = "recitations this year";
      deltaLabel = "vs last year";
      trend = [];
      for (let m = 0; m <= now.getMonth(); m++) {
        const ms = ymd(new Date(now.getFullYear(), m, 1));
        const me = ymd(new Date(now.getFullYear(), m + 1, 0));
        trend.push({ label: MON[m], count: sumInRange(rows, ms, me) });
      }
    }

    const total = sumInRange(rows, from, to);
    const prevTotal = sumInRange(rows, prevFrom, prevTo);
    const deltaPct = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;

    const byKey: Record<string, number> = {};
    for (const r of rows) {
      if (r.localDate >= from && r.localDate <= to)
        byKey[r.dhikrKey] = (byKey[r.dhikrKey] || 0) + r.count;
    }
    const breakdown = Object.entries(byKey)
      .map(([key, count]) => {
        const meta = LABEL_OF[key];
        return { key, count, label: meta?.label ?? prettify(key), ar: meta?.ar ?? "" };
      })
      .filter((b) => b.count > 0)
      .sort((a, b) => b.count - a.count);

    return { total, unit, deltaPct, deltaLabel, trend, breakdown };
  }, [rows, period]);

  const trendMax = Math.max(1, ...stats.trend.map((t) => t.count));
  const rowMax = Math.max(1, ...stats.breakdown.map((b) => b.count));

  return (
    <div className="max-w-md mx-auto space-y-5 pb-8">
      <div className="text-center pt-1">
        <h1 className="text-2xl font-bold text-themed">Dhikr Stats</h1>
      </div>

      <div className="card-bg rounded-2xl border sidebar-border p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/[0.07] to-transparent pointer-events-none" />

        <div className="relative flex items-center justify-between mb-4">
          <span className="text-[11px] uppercase tracking-[0.18em] text-gold/75 font-semibold">
            Your dhikr
          </span>
          <span className="font-arabic text-gold/55 text-lg">ٱلذِّكْر</span>
        </div>

        <div className="relative flex bg-white/5 border sidebar-border rounded-full p-0.5 mb-5">
          {(["day", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 rounded-full text-[13px] font-semibold capitalize transition-colors ${
                period === p ? "bg-[var(--color-gold)] text-[var(--color-bg)]" : "text-themed-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-themed-muted text-sm py-8">Loading…</p>
        ) : stats.total === 0 ? (
          <p className="text-center text-themed-muted text-sm py-8 leading-relaxed">
            No dhikr counted yet for this period.
            <br />
            Start counting from the Worship tab.
          </p>
        ) : (
          <>
            <div className="relative text-center">
              <div className="font-display text-[44px] font-bold text-gold leading-none">
                {stats.total.toLocaleString()}
              </div>
              <div className="text-[11px] text-themed-muted uppercase tracking-wide mt-1">
                {stats.unit}
              </div>
              {stats.deltaPct !== null && (
                <div
                  className={`text-xs mt-2 ${
                    stats.deltaPct >= 0 ? "text-green-500" : "text-themed-muted"
                  }`}
                >
                  {stats.deltaPct >= 0 ? "▲" : "▼"} {Math.abs(stats.deltaPct)}% {stats.deltaLabel}
                </div>
              )}
            </div>

            <div className="relative flex items-end justify-between gap-1.5 h-16 mt-5 mb-1 px-1">
              {stats.trend.map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                  <div
                    className={`w-full max-w-[26px] rounded-t-md ${
                      t.count === trendMax && t.count > 0
                        ? "bg-[var(--color-gold)]"
                        : "bg-[var(--color-gold)]/25"
                    }`}
                    style={{ height: `${Math.round((t.count / trendMax) * 100)}%` }}
                  />
                  <span className="text-[9px] text-themed-muted">{t.label}</span>
                </div>
              ))}
            </div>

            <div className="relative border-t sidebar-border mt-4 pt-3 space-y-2.5">
              {stats.breakdown.map((b) => (
                <div key={b.key} className="flex items-center gap-2.5">
                  <div className="w-28 shrink-0 text-[12.5px] text-themed truncate">
                    {b.label}
                    {b.ar && <span className="font-arabic text-gold/60 text-xs ml-1">{b.ar}</span>}
                  </div>
                  <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold)]/70 to-[var(--color-gold)]"
                      style={{ width: `${Math.round((b.count / rowMax) * 100)}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-[12.5px] text-themed-muted tabular-nums">
                    {b.count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <p className="text-center text-xs text-themed-muted/60 px-6 leading-relaxed">
        Reflects every dhikr you count in the app.{" "}
        {adapter.synced ? "Synced to your account." : "Sign in to sync across devices."}
      </p>
    </div>
  );
}
