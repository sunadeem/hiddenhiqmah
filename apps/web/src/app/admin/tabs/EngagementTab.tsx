"use client";

import { useAdminSection, type Creds } from "../useAdminSection";
import { StatTile, Section, Card, BarChart, StackedRow, RankList, Loading, ErrLine, RefreshBtn, fmt, fmtWhen, type SeriesPoint } from "../ui";

type EngData = {
  generatedAt: string;
  kpis: { adoptHifz: number; adoptDhikr: number; adoptCircles: number; checklistUsers30: number; dhikrTotal: number; activeStreaks: number; medianStreak: number; hifzMemorized: number };
  dhikrSeries: SeriesPoint[]; topAdhkar: { label: string; count: number }[];
  statusMix: Record<string, number>; reviewSeries: SeriesPoint[]; gradeMix: Record<string, number>;
  streakBuckets: { label: string; count: number }[];
  leaderboards: { topDhikr: { label: string; count: number }[]; topStreak: { label: string; count: number }[]; topHifz: { label: string; count: number }[] };
};

const HIFZ_ORDER = ["new", "learning", "review", "memorized"];

export default function EngagementTab({ creds }: { creds: Creds }) {
  const { data, loading, error, refresh } = useAdminSection<EngData>(creds, "engagement");
  if (loading && !data) return <Loading />;
  if (error) return <ErrLine msg={error} onRetry={refresh} />;
  if (!data) return null;
  const k = data.kpis;

  const statusParts = HIFZ_ORDER.filter((s) => data.statusMix[s]).map((s) => ({ label: s, value: data.statusMix[s] }));
  for (const [s, v] of Object.entries(data.statusMix)) if (!HIFZ_ORDER.includes(s)) statusParts.push({ label: s, value: v });
  const gradeParts = Object.entries(data.gradeMix).map(([label, value]) => ({ label, value }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs text-themed-muted/70">Updated {fmtWhen(data.generatedAt)}</p>
        <RefreshBtn onClick={refresh} loading={loading} />
      </div>

      <Section title="Feature adoption">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Use Hifz" value={`${k.adoptHifz}%`} hint="of signed-up" />
          <StatTile label="Use Dhikr" value={`${k.adoptDhikr}%`} />
          <StatTile label="Use Circles" value={`${k.adoptCircles}%`} />
          <StatTile label="Checklist 30d" value={fmt(k.checklistUsers30)} hint="active users" />
          <StatTile label="Dhikr recited" value={fmt(k.dhikrTotal)} hint="all-time" />
          <StatTile label="Active streaks" value={fmt(k.activeStreaks)} hint={`median ${k.medianStreak}`} />
          <StatTile label="Cards memorized" value={fmt(k.hifzMemorized)} />
        </div>
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="Dhikr recited/day · 30d"><BarChart series={data.dhikrSeries} /></Section>
        <Section title="Top adhkār"><Card><RankList rows={data.topAdhkar} /></Card></Section>
      </div>

      <Section title="Hifz">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card title="Cards by status">{statusParts.length ? <StackedRow parts={statusParts} /> : <p className="text-sm text-themed-muted/60">No cards yet.</p>}</Card>
          <Card title="Review grades · 30d">{gradeParts.length ? <StackedRow parts={gradeParts} /> : <p className="text-sm text-themed-muted/60">No reviews yet.</p>}</Card>
        </div>
        <BarChart series={data.reviewSeries} caption="reviews/day · 30d" />
      </Section>

      <Section title="Streak distribution">
        <Card><div className="space-y-2.5">{data.streakBuckets.map((b) => (
          <div key={b.label} className="flex items-center gap-2.5">
            <div className="w-16 text-[12.5px] text-themed-muted">{b.label} days</div>
            <div className="flex-1 h-2 bg-white/6 rounded-full overflow-hidden"><div className="h-full rounded-full bg-[var(--color-gold)]" style={{ width: `${Math.round((b.count / Math.max(1, ...data.streakBuckets.map((x) => x.count))) * 100)}%` }} /></div>
            <div className="w-10 text-right text-[12.5px] text-themed-muted tabular-nums">{fmt(b.count)}</div>
          </div>
        ))}</div></Card>
      </Section>

      <Section title="Leaderboards (founder-only)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card title="Top dhikr"><RankList rows={data.leaderboards.topDhikr} /></Card>
          <Card title="Top streaks"><RankList rows={data.leaderboards.topStreak} /></Card>
          <Card title="Top memorized"><RankList rows={data.leaderboards.topHifz} /></Card>
        </div>
      </Section>
    </div>
  );
}
