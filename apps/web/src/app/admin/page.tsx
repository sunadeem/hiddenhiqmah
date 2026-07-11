"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
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
  Megaphone,
  UserCog,
  ShieldAlert,
} from "lucide-react";

// ── Response shape (mirrors /api/admin/stats) ───────────────────────────────
type Tokens = { input: number; output: number; cacheRead: number; cacheWrite: number };
type SeriesPoint = { label: string; date: string; count: number };

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  joinedAt: string;
  lastActiveAt: string | null;
  ask: number;
  hifz: number;
  dhikr: number;
  circles: number;
  streak: number;
  strikes: number;
  suspended: boolean;
};
type BannerConfig = { enabled: boolean; level: string; message: string };

interface Stats {
  generatedAt: string;
  users: {
    total: number;
    signedUp: number;
    guests: number;
    today: number;
    last7d: number;
    last30d: number;
    series: SeriesPoint[];
  };
  userTable: UserRow[];
  config: { banner: BannerConfig };
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
  const [banner, setBanner] = useState<BannerConfig>({ enabled: false, level: "info", message: "" });
  const [bannerBusy, setBannerBusy] = useState(false);
  const [bannerMsg, setBannerMsg] = useState("");
  const [busyUser, setBusyUser] = useState<string | null>(null);
  const bannerSeeded = useRef(false);

  // Seed the banner form from the server ONCE, on first load — later refetches
  // (Refresh, clear-suspension) must not clobber the admin's in-progress edits.
  useEffect(() => {
    if (!bannerSeeded.current && stats?.config?.banner) {
      setBanner(stats.config.banner);
      bannerSeeded.current = true;
    }
  }, [stats]);

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

  // ── Admin write actions (clear suspension, set banner) ────────────────
  const runAction = useCallback(
    async (payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> => {
      if (!creds) return { ok: false, error: "Not authenticated" };
      try {
        const res = await fetch("/api/admin/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...creds, ...payload }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          return { ok: false, error: d.error || `Failed (${res.status})` };
        }
        return { ok: true };
      } catch {
        return { ok: false, error: "Network error" };
      }
    },
    [creds]
  );

  const clearSuspension = async (userId: string) => {
    setBusyUser(userId);
    const r = await runAction({ action: "clearSuspension", userId });
    setBusyUser(null);
    if (r.ok && creds) fetchStats(creds);
  };

  const saveBanner = async () => {
    setBannerBusy(true);
    setBannerMsg("");
    const r = await runAction({ action: "setBanner", ...banner });
    setBannerBusy(false);
    setBannerMsg(r.ok ? "Saved." : r.error || "Failed.");
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
  const { users, ask, cost, engagement, recent, userTable } = stats;
  const topMax = Math.max(1, ...ask.topUsers.map((u) => u.count));
  const suspendedCount = userTable.filter((u) => u.suspended).length;
  const flaggedUsers = userTable
    .filter((u) => u.suspended || u.strikes > 0)
    .sort((a, b) => Number(b.suspended) - Number(a.suspended) || b.strikes - a.strikes);

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
            <StatTile label="Signed-up" value={fmt(users.signedUp)} />
            <StatTile label="Guests" value={fmt(users.guests)} hint="anon devices (Ask)" />
            <StatTile label="New today" value={fmt(users.today)} />
            <StatTile label="New · 30d" value={fmt(users.last30d)} />
          </div>
          <BarChart series={users.series} caption={`${fmt(users.last30d)} signups · 30d`} />
        </Section>

        {/* 1a. Moderation review — flagged & suspended accounts */}
        <Section
          icon={<ShieldAlert size={18} />}
          title={`Flagged & suspended · ${fmt(flaggedUsers.length)}`}
        >
          <div className="card-bg rounded-2xl border sidebar-border p-4">
            {flaggedUsers.length === 0 ? (
              <p className="text-sm text-themed-muted/70">
                No flagged or suspended accounts.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--overlay-subtle)]">
                {flaggedUsers.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-themed text-sm truncate">
                        {u.name || u.email || u.id.slice(0, 8) + "…"}
                      </div>
                      {u.name && u.email && (
                        <div className="text-themed-muted/60 text-xs truncate">{u.email}</div>
                      )}
                    </div>
                    <span
                      className={`text-xs shrink-0 ${
                        u.suspended ? "text-red-300" : "text-amber-400"
                      }`}
                    >
                      {u.suspended
                        ? "Suspended"
                        : `${u.strikes} strike${u.strikes > 1 ? "s" : ""}`}
                    </span>
                    {u.suspended && (
                      <button
                        type="button"
                        onClick={() => clearSuspension(u.id)}
                        disabled={busyUser === u.id}
                        className="shrink-0 text-xs rounded-lg bg-red-500/15 text-red-300 border border-red-400/30 px-2.5 py-1.5 disabled:opacity-50 hover:bg-red-500/25 transition-colors"
                      >
                        {busyUser === u.id ? "…" : "Clear"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>

        {/* 1b. All users table */}
        <Section
          icon={<UserCog size={18} />}
          title={`All users · ${fmt(users.signedUp)} signed-up${
            suspendedCount > 0 ? ` · ${fmt(suspendedCount)} suspended` : ""
          }`}
        >
          <div className="card-bg rounded-2xl border sidebar-border overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="text-themed-muted text-[11px] uppercase tracking-wider border-b sidebar-border">
                  <th className="text-left font-semibold px-3 py-2.5">User</th>
                  <th className="text-left font-semibold px-3 py-2.5 whitespace-nowrap">Joined</th>
                  <th className="text-right font-semibold px-3 py-2.5">Ask</th>
                  <th className="text-right font-semibold px-3 py-2.5">Hifz</th>
                  <th className="text-right font-semibold px-3 py-2.5">Dhikr</th>
                  <th className="text-right font-semibold px-3 py-2.5">Circles</th>
                  <th className="text-right font-semibold px-3 py-2.5">Streak</th>
                  <th className="text-left font-semibold px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {userTable.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-themed-muted/70">
                      No signed-up users yet.
                    </td>
                  </tr>
                ) : (
                  userTable.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--overlay-subtle)] last:border-0">
                      <td className="px-3 py-2.5">
                        <div className="text-themed truncate max-w-[200px]">
                          {u.name || u.email || u.id.slice(0, 8) + "…"}
                        </div>
                        {u.name && u.email && (
                          <div className="text-themed-muted/60 text-xs truncate max-w-[200px]">{u.email}</div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-themed-muted whitespace-nowrap">{fmtWhen(u.joinedAt)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-themed">{fmt(u.ask)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-themed">{fmt(u.hifz)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-themed">{fmt(u.dhikr)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-themed">{fmt(u.circles)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-themed">{fmt(u.streak)}</td>
                      <td className="px-3 py-2.5">
                        {u.suspended ? (
                          <button
                            type="button"
                            onClick={() => clearSuspension(u.id)}
                            disabled={busyUser === u.id}
                            className="inline-flex items-center gap-1 text-xs rounded-lg bg-red-500/15 text-red-300 border border-red-400/30 px-2 py-1 disabled:opacity-50 hover:bg-red-500/25 transition-colors"
                          >
                            {busyUser === u.id ? "…" : "Suspended · clear"}
                          </button>
                        ) : u.strikes > 0 ? (
                          <span className="text-xs text-amber-400">
                            {u.strikes} strike{u.strikes > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-themed-muted/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

        {/* 6. Maintenance / status banner */}
        <Section icon={<Megaphone size={18} />} title="Maintenance / status banner">
          <div className="card-bg rounded-2xl border sidebar-border p-4 space-y-3">
            <label className="flex items-center gap-2.5 text-sm text-themed">
              <input
                type="checkbox"
                checked={banner.enabled}
                onChange={(e) => setBanner((b) => ({ ...b, enabled: e.target.checked }))}
                className="w-4 h-4 accent-[var(--color-gold)]"
              />
              Show a banner to all users (web + app)
            </label>
            <select
              value={banner.level}
              onChange={(e) => setBanner((b) => ({ ...b, level: e.target.value }))}
              className="bg-white/5 border sidebar-border rounded-xl px-3 py-2 text-sm text-themed focus:outline-none focus:border-[var(--color-gold)]/40"
            >
              <option value="info">Info (gold)</option>
              <option value="warning">Warning (amber)</option>
              <option value="maintenance">Maintenance (red)</option>
            </select>
            <textarea
              value={banner.message}
              onChange={(e) => setBanner((b) => ({ ...b, message: e.target.value }))}
              rows={2}
              maxLength={500}
              placeholder="Message shown in the banner…"
              className="w-full bg-white/5 border sidebar-border rounded-xl px-3 py-2 text-sm text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/40 resize-none"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={saveBanner}
                disabled={bannerBusy}
                className="inline-flex items-center gap-2 bg-[var(--color-gold)] text-[var(--color-bg)] font-semibold rounded-xl px-4 py-2 text-sm disabled:opacity-50"
              >
                {bannerBusy ? <Loader2 size={15} className="animate-spin" /> : "Save banner"}
              </button>
              {bannerMsg && <span className="text-xs text-themed-muted">{bannerMsg}</span>}
            </div>
            <p className="text-xs text-themed-muted/70 leading-relaxed">
              The app checks this on launch and when it returns to the foreground. Use it to announce
              downtime or an issue without shipping an App Store update.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
