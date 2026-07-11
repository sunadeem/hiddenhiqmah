"use client";

import { AlertTriangle } from "lucide-react";
import { useAdminSection, type Creds } from "../useAdminSection";
import { StatTile, Section, Card, BarChart, LineChart, Loading, ErrLine, RefreshBtn, fmt, fmtUsd, fmtWhen, type SeriesPoint } from "../ui";

type Overview = {
  generatedAt: string;
  kpis: { dau: number; wau: number; mau: number; stickiness: number; signupsToday: number; signups7d: number; askToday: number; askTotal: number; costToday: number; cost30: number; openReports: number; suspended: number };
  activeSeries: SeriesPoint[];
  signupSeries: SeriesPoint[];
  costSeries: SeriesPoint[];
  attention: { openReports: number; suspended: number; costSpike: boolean; costToday: number; cost7Avg: number };
  recent: { signups: { label: string; email: string | null; at: string }[]; messages: { label: string; at: string }[] };
};

export default function OverviewTab({ creds, onGoModeration }: { creds: Creds; onGoModeration: () => void }) {
  const { data, loading, error, refresh } = useAdminSection<Overview>(creds, "overview");
  if (loading && !data) return <Loading />;
  if (error) return <ErrLine msg={error} onRetry={refresh} />;
  if (!data) return null;
  const k = data.kpis;
  const a = data.attention;

  const alerts: string[] = [];
  if (a.openReports > 0) alerts.push(`${a.openReports} open report${a.openReports > 1 ? "s" : ""} to review`);
  if (a.suspended > 0) alerts.push(`${a.suspended} suspended account${a.suspended > 1 ? "s" : ""}`);
  if (a.costSpike) alerts.push(`Cost today (${fmtUsd(a.costToday)}) is over 2× the 7-day average`);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs text-themed-muted/70">Updated {fmtWhen(data.generatedAt)}</p>
        <RefreshBtn onClick={refresh} loading={loading} />
      </div>

      {alerts.length > 0 && (
        <button onClick={onGoModeration} className="w-full text-left rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 hover:bg-amber-400/15 transition-colors">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm mb-1"><AlertTriangle size={16} /> Needs attention</div>
          <ul className="text-sm text-themed-muted list-disc pl-6 space-y-0.5">{alerts.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </button>
      )}

      <Section title="Right now">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="DAU" value={fmt(k.dau)} hint="active today" />
          <StatTile label="WAU" value={fmt(k.wau)} hint="active 7d" />
          <StatTile label="MAU" value={fmt(k.mau)} hint="active 30d" />
          <StatTile label="Stickiness" value={`${k.stickiness}%`} hint="DAU ÷ MAU" />
          <StatTile label="New today" value={fmt(k.signupsToday)} />
          <StatTile label="Ask today" value={fmt(k.askToday)} hint={`${fmt(k.askTotal)} all-time`} />
          <StatTile label="Cost today" value={fmtUsd(k.costToday)} hint={`${fmtUsd(k.cost30)} / 30d`} />
          <StatTile label="Open reports" value={fmt(k.openReports)} tone={k.openReports ? "red" : undefined} hint={`${fmt(k.suspended)} suspended`} />
        </div>
      </Section>

      <Section title="Active users · 30d"><LineChart series={data.activeSeries} caption="distinct active users/day" /></Section>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="Signups · 30d"><BarChart series={data.signupSeries} /></Section>
        <Section title="Est. cost · 30d"><LineChart series={data.costSeries} unit="USD" caption={`${fmtUsd(k.cost30)} total`} /></Section>
      </div>

      <Section title="Recent activity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card title="Latest signups">
            {data.recent.signups.length === 0 ? <p className="text-sm text-themed-muted/70">No signups yet.</p> : (
              <ul className="space-y-2">{data.recent.signups.map((s, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm"><span className="text-themed truncate" title={s.email ?? s.label}>{s.label}</span><span className="text-themed-muted/70 text-xs shrink-0">{fmtWhen(s.at)}</span></li>
              ))}</ul>
            )}
          </Card>
          <Card title="Latest Ask messages">
            {data.recent.messages.length === 0 ? <p className="text-sm text-themed-muted/70">No messages yet.</p> : (
              <ul className="space-y-2">{data.recent.messages.map((m, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm"><span className="text-themed truncate">{m.label}</span><span className="text-themed-muted/70 text-xs shrink-0">{fmtWhen(m.at)}</span></li>
              ))}</ul>
            )}
          </Card>
        </div>
      </Section>
    </div>
  );
}
