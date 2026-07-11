"use client";

import { useAdminSection, type Creds } from "../useAdminSection";
import { StatTile, Section, Card, LineChart, StackedBar, StackedRow, RankList, Loading, ErrLine, RefreshBtn, fmt, fmtUsd, fmtWhen, type SeriesPoint } from "../ui";

type Tok = { input: number; output: number; cacheRead: number; cacheWrite: number };
type AskData = {
  generatedAt: string;
  kpis: { total: number; today: number; last7d: number; last30d: number; anonShare30: number; avgCost30: number; cacheRatio: number; quotaSigned: number; quotaAnon: number; signedQuota: number; anonQuota: number };
  tokenMix30: Tok; cost30: number; rates: Tok;
  messagesStacked: { label: string; date: string; a: number; b: number }[];
  costSeries: SeriesPoint[]; uniqSeries: SeriesPoint[];
  topByCost: { label: string; count: number }[]; topByMsgs: { label: string; count: number }[];
};

export default function AskTab({ creds }: { creds: Creds }) {
  const { data, loading, error, refresh } = useAdminSection<AskData>(creds, "ask");
  if (loading && !data) return <Loading />;
  if (error) return <ErrLine msg={error} onRetry={refresh} />;
  if (!data) return null;
  const k = data.kpis;
  const t = data.tokenMix30;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs text-themed-muted/70">Updated {fmtWhen(data.generatedAt)}</p>
        <RefreshBtn onClick={refresh} loading={loading} />
      </div>

      <Section title="Ask Hiqmah">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Total messages" value={fmt(k.total)} />
          <StatTile label="Today" value={fmt(k.today)} />
          <StatTile label="7 days" value={fmt(k.last7d)} />
          <StatTile label="30 days" value={fmt(k.last30d)} />
          <StatTile label="Guest share" value={`${k.anonShare30}%`} hint="30d" />
          <StatTile label="Avg cost/msg" value={fmtUsd(k.avgCost30)} hint="30d" />
          <StatTile label="Cache hit" value={`${k.cacheRatio}%`} hint="prompt-cache read share" />
          <StatTile label="At quota 24h" value={`${fmt(k.quotaSigned)} / ${fmt(k.quotaAnon)}`} hint={`signed-in ≥${k.signedQuota} · guest ≥${k.anonQuota}`} />
        </div>
      </Section>

      <Section title="Messages · 30d (signed-in vs guest)"><StackedBar series={data.messagesStacked} aLabel="Signed-in" bLabel="Guest" /></Section>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="Est. cost · 30d"><LineChart series={data.costSeries} unit="USD" caption={`${fmtUsd(data.cost30)} total`} /></Section>
        <Section title="Unique identities/day"><LineChart series={data.uniqSeries} /></Section>
      </div>

      <Section title="Token mix · 30d">
        <Card><StackedRow parts={[{ label: "Input", value: t.input }, { label: "Output", value: t.output }, { label: "Cache read", value: t.cacheRead }, { label: "Cache write", value: t.cacheWrite }]} /></Card>
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="Top by est. cost"><Card><RankList rows={data.topByCost} suffix={(c) => fmtUsd(c)} /></Card></Section>
        <Section title="Top by messages"><Card><RankList rows={data.topByMsgs} /></Card></Section>
      </div>

      <p className="text-xs text-themed-muted/60 leading-relaxed">
        Cost is an estimate: tokens are summed across both models per message (Haiku for search, Opus for the answer) with no per-model split stored, priced at Opus 4.8 tiers (input {fmtUsd(data.rates.input)}, output {fmtUsd(data.rates.output)}, cache-read {fmtUsd(data.rates.cacheRead)}, cache-write {fmtUsd(data.rates.cacheWrite)} per 1M) — an upper bound.
      </p>
    </div>
  );
}
