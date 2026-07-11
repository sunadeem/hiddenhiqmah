"use client";

import { useMemo, useState, type ReactNode } from "react";

// ── Formatters ────────────────────────────────────────────────────────────────
export function fmt(n: number): string {
  return (n ?? 0).toLocaleString();
}
export function fmtUsd(n: number): string {
  if (!n) return "$0.00";
  return n < 1
    ? `$${n.toFixed(4)}`
    : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n ?? 0);
}
export function fmtPct(n: number): string {
  return `${Math.round(n ?? 0)}%`;
}
export function fmtWhen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
export function ago(iso: string | null): string {
  if (!iso) return "never";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const s = (Date.now() - t) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ── Layout primitives ─────────────────────────────────────────────────────────
export function StatTile({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "gold" | "red" | "amber" }) {
  const color = tone === "red" ? "text-red-400" : tone === "amber" ? "text-amber-400" : "text-gold";
  return (
    <div className="card-bg rounded-2xl border sidebar-border p-4">
      <div className="text-[11px] uppercase tracking-[0.14em] text-themed-muted font-semibold">{label}</div>
      <div className={`font-display text-3xl font-bold ${color} leading-tight mt-1.5 tabular-nums`}>{value}</div>
      {hint && <div className="text-xs text-themed-muted/70 mt-1">{hint}</div>}
    </div>
  );
}

export function Section({ icon, title, action, children }: { icon?: ReactNode; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-gold">{icon}</span>}
        <h2 className="text-lg font-semibold text-themed font-display">{title}</h2>
        {action && <span className="ml-auto">{action}</span>}
      </div>
      {children}
    </section>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`card-bg rounded-2xl border sidebar-border p-4 ${className}`}>
      {title && <div className="text-[11px] uppercase tracking-[0.14em] text-themed-muted font-semibold mb-3">{title}</div>}
      {children}
    </div>
  );
}

// ── Charts (hand-rolled, theme-token based) ─────────────────────────────────────
export type SeriesPoint = { label: string; date: string; count: number };

export function BarChart({ series, caption, height = 96 }: { series: SeriesPoint[]; caption?: string; height?: number }) {
  const max = Math.max(1, ...series.map((s) => s.count));
  const total = series.reduce((a, s) => a + s.count, 0);
  return (
    <Card>
      <div className="flex items-end justify-between gap-[3px]" style={{ height }}>
        {series.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-full" title={`${s.date}: ${fmt(s.count)}`}>
            <div
              className={`w-full rounded-t-sm ${s.count === max && s.count > 0 ? "bg-[var(--color-gold)]" : "bg-[var(--color-gold)]/25"}`}
              style={{ height: `${Math.max(s.count > 0 ? 4 : 0, Math.round((s.count / max) * 100))}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-themed-muted/70 mt-2">
        <span>{series[0]?.date}</span>
        <span>{caption ?? `${fmt(total)} total · peak ${fmt(max)}`}</span>
        <span>{series[series.length - 1]?.date}</span>
      </div>
    </Card>
  );
}

export function LineChart({ series, caption, height = 110, unit }: { series: SeriesPoint[]; caption?: string; height?: number; unit?: string }) {
  // Scale to the data's own peak (guarding empty/all-zero) so fractional-dollar
  // cost series aren't flattened against an integer floor of 1.
  const vals = series.map((s) => s.count);
  const dataMax = vals.length ? Math.max(...vals) : 0;
  const max = dataMax > 0 ? dataMax : 1;
  const n = series.length;
  const W = 300, H = height;
  const pts = series.map((s, i) => [(i / Math.max(1, n - 1)) * W, H - (s.count / max) * (H - 8) - 4]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const total = series.reduce((a, s) => a + s.count, 0);
  return (
    <Card>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <path d={area} fill="var(--color-gold)" opacity="0.10" />
        <path d={line} fill="none" stroke="var(--color-gold)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {pts.length > 0 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill="var(--color-gold)" />}
      </svg>
      <div className="flex items-center justify-between text-[10px] text-themed-muted/70 mt-2">
        <span>{series[0]?.date}</span>
        <span>{caption ?? `peak ${fmt(max)}${unit ? " " + unit : ""} · ${fmt(total)} total`}</span>
        <span>{series[series.length - 1]?.date}</span>
      </div>
    </Card>
  );
}

export function StackedBar({ series, caption, aLabel, bLabel, height = 96 }: { series: { label: string; date: string; a: number; b: number }[]; caption?: string; aLabel: string; bLabel: string; height?: number }) {
  const max = Math.max(1, ...series.map((s) => s.a + s.b));
  return (
    <Card>
      <div className="flex items-end justify-between gap-[3px]" style={{ height }}>
        {series.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-full" title={`${s.date}: ${aLabel} ${s.a}, ${bLabel} ${s.b}`}>
            <div className="w-full bg-[var(--color-gold)]/35 rounded-t-sm" style={{ height: `${Math.round((s.b / max) * 100)}%` }} />
            <div className="w-full bg-[var(--color-gold)]" style={{ height: `${Math.round((s.a / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-themed-muted/70 mt-2">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[var(--color-gold)]" />{aLabel}</span>
        <span>{caption}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[var(--color-gold)]/35" />{bLabel}</span>
      </div>
    </Card>
  );
}

// Single horizontal 100%-stacked bar (token mix, hifz status).
export function StackedRow({ parts }: { parts: { label: string; value: number }[] }) {
  const total = Math.max(1, parts.reduce((a, p) => a + p.value, 0));
  const shades = ["bg-[var(--color-gold)]", "bg-[var(--color-gold)]/70", "bg-[var(--color-gold)]/45", "bg-[var(--color-gold)]/25", "bg-[var(--color-gold)]/15"];
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden">
        {parts.map((p, i) => (
          <div key={i} className={shades[i % shades.length]} style={{ width: `${(p.value / total) * 100}%` }} title={`${p.label}: ${fmt(p.value)}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-themed-muted">
        {parts.map((p, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-sm ${shades[i % shades.length]}`} />
            {p.label} {fmt(p.value)} ({Math.round((p.value / total) * 100)}%)
          </span>
        ))}
      </div>
    </div>
  );
}

export function RankRow({ label, count, max, suffix }: { label: string; count: number; max: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-40 shrink-0 text-[12.5px] text-themed truncate" title={label}>{label}</div>
      <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold)]/70 to-[var(--color-gold)]" style={{ width: `${Math.round((count / Math.max(1, max)) * 100)}%` }} />
      </div>
      <div className="w-16 text-right text-[12.5px] text-themed-muted tabular-nums">{suffix ?? fmt(count)}</div>
    </div>
  );
}

export function RankList({ rows, suffix }: { rows: { label: string; count: number }[]; suffix?: (c: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (!rows.length) return <p className="text-sm text-themed-muted/60">No data yet.</p>;
  return <div className="space-y-2.5">{rows.map((r, i) => <RankRow key={i} label={r.label} count={r.count} max={max} suffix={suffix?.(r.count)} />)}</div>;
}

// Cohort retention grid: rows = signup week, cols = weeks-since-signup.
export function CohortGrid({ cohorts }: { cohorts: { week: string; size: number; retention: (number | null)[] }[] }) {
  const maxCols = Math.max(1, ...cohorts.map((c) => c.retention.length));
  if (!cohorts.some((c) => c.size > 0)) return <p className="text-sm text-themed-muted/60">Not enough signup history yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="text-[11px] border-separate" style={{ borderSpacing: 3 }}>
        <thead>
          <tr className="text-themed-muted/70">
            <th className="text-left font-semibold pr-2">Cohort</th>
            <th className="text-right font-semibold pr-2">n</th>
            {Array.from({ length: maxCols }).map((_, i) => <th key={i} className="font-semibold w-9">W{i}</th>)}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <tr key={c.week}>
              <td className="text-themed-muted whitespace-nowrap pr-2">{c.week.slice(5)}</td>
              <td className="text-right text-themed-muted pr-2 tabular-nums">{c.size}</td>
              {c.retention.map((v, i) => (
                <td key={i} className="w-9 h-8 text-center rounded" style={{ backgroundColor: v == null ? "transparent" : `color-mix(in srgb, var(--color-gold) ${Math.max(6, v)}%, transparent)`, color: v != null && v > 55 ? "var(--color-bg)" : "var(--color-text)" }}>
                  {v == null ? "" : `${v}`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Generic sortable / filterable data table ────────────────────────────────────
export type Column<T> = {
  key: string;
  label: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => number | string;
};

export function DataTable<T extends { id: string }>({ columns, rows, filterText, minWidth = 720, onRowClick }: { columns: Column<T>[]; rows: T[]; filterText?: (row: T) => string; minWidth?: number; onRowClick?: (row: T) => void }) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [dir, setDir] = useState<1 | -1>(-1);
  const [q, setQ] = useState("");

  const sorted = useMemo(() => {
    let out = rows;
    if (q && filterText) {
      const needle = q.toLowerCase();
      out = out.filter((r) => filterText(r).toLowerCase().includes(needle));
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortValue) {
        out = [...out].sort((a, b) => {
          const va = col.sortValue!(a), vb = col.sortValue!(b);
          if (va < vb) return -dir;
          if (va > vb) return dir;
          return 0;
        });
      }
    }
    return out;
  }, [rows, q, filterText, sortKey, dir, columns]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setDir(-1); }
  };

  return (
    <div className="space-y-2">
      {filterText && (
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="w-full sm:max-w-xs bg-white/5 border sidebar-border rounded-xl px-3 py-2 text-sm text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/40" />
      )}
      <div className="card-bg rounded-2xl border sidebar-border overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead>
            <tr className="text-themed-muted text-[11px] uppercase tracking-wider border-b sidebar-border">
              {columns.map((c) => (
                <th key={c.key} className={`font-semibold px-3 py-2.5 ${c.align === "right" ? "text-right" : "text-left"} ${c.sortValue ? "cursor-pointer select-none hover:text-gold" : ""}`} onClick={() => c.sortValue && toggleSort(c.key)}>
                  {c.label}{sortKey === c.key ? (dir === 1 ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-3 py-6 text-center text-themed-muted/70">No rows.</td></tr>
            ) : (
              sorted.map((row) => (
                <tr key={row.id} onClick={() => onRowClick?.(row)} className={`border-b border-[var(--overlay-subtle)] last:border-0 ${onRowClick ? "cursor-pointer hover:bg-white/5" : ""}`}>
                  {columns.map((c) => (
                    <td key={c.key} className={`px-3 py-2.5 ${c.align === "right" ? "text-right tabular-nums" : "text-left"}`}>{c.render(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Loading() {
  return <div className="flex items-center justify-center py-24 text-themed-muted"><span className="animate-pulse text-sm">Loading…</span></div>;
}

export function ErrLine({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between gap-3">
      <span>{msg}</span>
      {onRetry && <button onClick={onRetry} className="text-xs underline shrink-0">Retry</button>}
    </div>
  );
}

export function RefreshBtn({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading} className="inline-flex items-center gap-1.5 text-xs bg-white/5 border sidebar-border rounded-xl px-3 py-1.5 text-themed hover:text-gold transition-colors disabled:opacity-50">
      <span className={loading ? "animate-spin" : ""}>↻</span> Refresh
    </button>
  );
}

export function StateBadge({ state }: { state: string }) {
  const map: Record<string, string> = {
    suspended: "bg-red-500/15 text-red-300 border-red-400/30",
    struck: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    reported: "bg-amber-500/10 text-amber-200 border-amber-400/20",
    clean: "bg-white/5 text-themed-muted border-white/10",
  };
  return <span className={`text-[11px] px-2 py-0.5 rounded-full border ${map[state] ?? map.clean}`}>{state}</span>;
}
