"use client";

import { useState, useCallback, type ReactNode } from "react";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import PasswordInput from "@/components/PasswordInput";
import {
  RefreshCw,
  Users,
  MessageCircleQuestion,
  DollarSign,
  Activity,
  Clock,
  Loader2,
  Lock,
} from "lucide-react";

// ── Response shape (mirrors /api/admin/stats) ───────────────────────────────
type Tokens = { input: number; output: number; cacheRead: number; cacheWrite: number };
type SeriesPoint = { label: string; date: string; count: number };

interface Stats {
  generatedAt: string;
  users: { total: number; today: number; last7d: number; last30d: number; series: SeriesPoint[] };
  ask: {
    total: number;
    today: number;
    last7d: number;
    last30d: number;
    uniqueUsers: number;
    quotaExceeded24h: number;
    dailyQuota: number;
    series: SeriesPoint[];
    topUsers: { label: string; count: number }[];
  };
  cost: {
    estimate: boolean;
    rates: { inputPerM: number; outputPerM: number; cacheReadPerM: number; cacheWritePerM: number };
    tokens: { today: Tokens; last7d: Tokens; last30d: Tokens; allTime: Tokens };
    usd: { today: number; last7d: number; last30d: number; allTime: number };
  };
  engagement: {
    dhikrTotal: number;
    dhikrUsersAll: number;
    dhikrUsers30d: number;
    hifzCards: number;
    hifzMemorized: number;
    hifzUsers: number;
    circles: number;
    circleMembers: number;
    activeStreaks: number;
  };
  recent: {
    signups: { label: string; email: string | null; at: string }[];
    messages: { label: string; at: string }[];
  };
}

// ── Formatting helpers ───────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString();
}
function fmtUsd(n: number): string {
  if (n === 0) return "$0.00";
  return n < 1 ? `$${n.toFixed(4)}` : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
function fmtWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ── UI primitives ────────────────────────────────────────────────────────────
function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card-bg rounded-2xl border sidebar-border p-4">
      <div className="text-[11px] uppercase tracking-[0.14em] text-themed-muted font-semibold">
        {label}
      </div>
      <div className="font-display text-3xl font-bold text-gold leading-tight mt-1.5">{value}</div>
      {hint && <div className="text-xs text-themed-muted/70 mt-1">{hint}</div>}
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-gold">{icon}</span>
        <h2 className="text-lg font-semibold text-themed font-display">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function BarChart({ series, caption }: { series: SeriesPoint[]; caption?: string }) {
  const max = Math.max(1, ...series.map((s) => s.count));
  const total = series.reduce((a, s) => a + s.count, 0);
  return (
    <div className="card-bg rounded-2xl border sidebar-border p-4">
      <div className="flex items-end justify-between gap-[3px] h-24">
        {series.map((s, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col justify-end h-full group relative"
            title={`${s.date}: ${s.count}`}
          >
            <div
              className={`w-full rounded-t-sm ${
                s.count === max && s.count > 0 ? "bg-[var(--color-gold)]" : "bg-[var(--color-gold)]/25"
              }`}
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
    </div>
  );
}

function RankRow({ label, count, max }: { label: string; count: number; max: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-40 shrink-0 text-[12.5px] text-themed truncate" title={label}>
        {label}
      </div>
      <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold)]/70 to-[var(--color-gold)]"
          style={{ width: `${Math.round((count / Math.max(1, max)) * 100)}%` }}
        />
      </div>
      <div className="w-12 text-right text-[12.5px] text-themed-muted tabular-nums">{fmt(count)}</div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [creds, setCreds] = useState<{ email: string; password1: string; password2: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(
    async (c: { email: string; password1: string; password2: string }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(c),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 401) {
            setError("Invalid credentials.");
            setCreds(null);
            setStats(null);
          } else {
            setError(data.error || `Request failed (${res.status}).`);
          }
          return;
        }
        const data = (await res.json()) as Stats;
        setStats(data);
        setCreds(c);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    fetchStats({ email, password1, password2 });
  };

  // ── Login gate ────────────────────────────────────────────────────────
  if (!stats || !creds) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--color-gold)]/10 border sidebar-border mb-3">
              <Lock size={20} className="text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-themed font-display">Admin</h1>
            <p className="text-themed-muted text-sm mt-1">Restricted access</p>
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="username"
            autoFocus
            required
            className="w-full bg-white/5 border sidebar-border rounded-xl px-4 py-3 text-themed text-base focus:outline-none focus:border-[var(--color-gold)]/40"
          />
          <PasswordInput
            value={password1}
            onChange={setPassword1}
            placeholder="Password"
            autoComplete="off"
            required
          />
          <PasswordInput
            value={password2}
            onChange={setPassword2}
            placeholder="Second password"
            autoComplete="off"
            required
          />

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password1 || !password2}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-gold)] text-[var(--color-bg)] font-semibold rounded-xl px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────
  const { users, ask, cost, engagement, recent } = stats;
  const topMax = Math.max(1, ...ask.topUsers.map((u) => u.count));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <PageHeader
        title="Admin"
        titleAr="لوحة"
        subtitle={`Usage overview · updated ${fmtWhen(stats.generatedAt)}`}
        action={
          <button
            onClick={() => creds && fetchStats(creds)}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm bg-white/5 border sidebar-border rounded-xl px-3.5 py-2 text-themed hover:text-gold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <div className="space-y-10">
        {/* 1. Users */}
        <Section icon={<Users size={18} />} title="Users">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Total accounts" value={fmt(users.total)} />
            <StatTile label="New today" value={fmt(users.today)} />
            <StatTile label="New · 7d" value={fmt(users.last7d)} />
            <StatTile label="New · 30d" value={fmt(users.last30d)} />
          </div>
          <BarChart series={users.series} caption={`${fmt(users.last30d)} signups · 30d`} />
        </Section>

        {/* 2. Ask Hiqmah */}
        <Section icon={<MessageCircleQuestion size={18} />} title="Ask Hiqmah">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Total messages" value={fmt(ask.total)} />
            <StatTile label="Today" value={fmt(ask.today)} />
            <StatTile label="7 days" value={fmt(ask.last7d)} />
            <StatTile label="30 days" value={fmt(ask.last30d)} />
            <StatTile label="Unique users" value={fmt(ask.uniqueUsers)} hint="signed-in, all-time" />
            <StatTile
              label={`At quota (${ask.dailyQuota}/day)`}
              value={fmt(ask.quotaExceeded24h)}
              hint="identities in last 24h"
            />
          </div>
          <BarChart series={ask.series} caption={`${fmt(ask.last30d)} messages · 30d`} />
          {ask.topUsers.length > 0 && (
            <div className="card-bg rounded-2xl border sidebar-border p-4 space-y-2.5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-themed-muted font-semibold mb-1">
                Top users by messages
              </div>
              {ask.topUsers.map((u, i) => (
                <RankRow key={i} label={u.label} count={u.count} max={topMax} />
              ))}
            </div>
          )}
        </Section>

        {/* 3. AI cost */}
        <Section icon={<DollarSign size={18} />} title="AI cost (estimated)">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Today" value={fmtUsd(cost.usd.today)} />
            <StatTile label="7 days" value={fmtUsd(cost.usd.last7d)} />
            <StatTile label="30 days" value={fmtUsd(cost.usd.last30d)} />
            <StatTile label="All-time" value={fmtUsd(cost.usd.allTime)} />
          </div>
          <div className="card-bg rounded-2xl border sidebar-border p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-themed-muted font-semibold mb-3">
              All-time tokens
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-themed-muted text-xs">Input</div>
                <div className="text-themed font-semibold tabular-nums">{fmtTokens(cost.tokens.allTime.input)}</div>
              </div>
              <div>
                <div className="text-themed-muted text-xs">Output</div>
                <div className="text-themed font-semibold tabular-nums">{fmtTokens(cost.tokens.allTime.output)}</div>
              </div>
              <div>
                <div className="text-themed-muted text-xs">Cache read</div>
                <div className="text-themed font-semibold tabular-nums">{fmtTokens(cost.tokens.allTime.cacheRead)}</div>
              </div>
              <div>
                <div className="text-themed-muted text-xs">Cache write</div>
                <div className="text-themed font-semibold tabular-nums">{fmtTokens(cost.tokens.allTime.cacheWrite)}</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-themed-muted/70 leading-relaxed">
            Estimate only. Tokens are summed across both models per message (Haiku for search,
            Opus for the answer); no exact per-model split is stored. Priced at Opus 4.8 tiers —
            input {fmtUsd(cost.rates.inputPerM)}, output {fmtUsd(cost.rates.outputPerM)}, cache-read{" "}
            {fmtUsd(cost.rates.cacheReadPerM)}, cache-write {fmtUsd(cost.rates.cacheWritePerM)} per 1M
            tokens — so this over-states the Haiku share and is an upper bound.
          </p>
        </Section>

        {/* 4. Engagement */}
        <Section icon={<Activity size={18} />} title="Engagement">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Dhikr recited" value={fmt(engagement.dhikrTotal)} hint={`${fmt(engagement.dhikrUsersAll)} users all-time`} />
            <StatTile label="Dhikr users · 30d" value={fmt(engagement.dhikrUsers30d)} />
            <StatTile label="Hifz cards" value={fmt(engagement.hifzCards)} hint={`${fmt(engagement.hifzMemorized)} memorized`} />
            <StatTile label="Hifz users" value={fmt(engagement.hifzUsers)} />
            <StatTile label="Circles" value={fmt(engagement.circles)} />
            <StatTile label="Circle members" value={fmt(engagement.circleMembers)} />
            <StatTile label="Active streaks" value={fmt(engagement.activeStreaks)} hint="current > 0" />
          </div>
        </Section>

        {/* 5. Recent activity */}
        <Section icon={<Clock size={18} />} title="Recent activity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="card-bg rounded-2xl border sidebar-border p-4">
              <div className="text-[11px] uppercase tracking-[0.14em] text-themed-muted font-semibold mb-3">
                Latest signups
              </div>
              {recent.signups.length === 0 ? (
                <p className="text-sm text-themed-muted/70">No signups yet.</p>
              ) : (
                <ul className="space-y-2">
                  {recent.signups.map((s, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-themed truncate" title={s.email ?? s.label}>{s.label}</span>
                      <span className="text-themed-muted/70 text-xs shrink-0">{fmtWhen(s.at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card-bg rounded-2xl border sidebar-border p-4">
              <div className="text-[11px] uppercase tracking-[0.14em] text-themed-muted font-semibold mb-3">
                Latest messages
              </div>
              {recent.messages.length === 0 ? (
                <p className="text-sm text-themed-muted/70">No messages yet.</p>
              ) : (
                <ul className="space-y-2">
                  {recent.messages.map((m, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-themed truncate">{m.label}</span>
                      <span className="text-themed-muted/70 text-xs shrink-0">{fmtWhen(m.at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
