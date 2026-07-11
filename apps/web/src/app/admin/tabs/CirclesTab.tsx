"use client";

import { useAdminSection, type Creds } from "../useAdminSection";
import { StatTile, Section, Card, BarChart, RankList, DataTable, Loading, ErrLine, RefreshBtn, fmt, fmtWhen, ago, type SeriesPoint, type Column } from "../ui";

type CircleTableRow = { id: string; name: string; owner: string; members: number; messages30: number; lastMsgAt: string | null; createdAt: string; goal: string };
type CirclesData = {
  generatedAt: string;
  kpis: { circles: number; members: number; active7: number; active30: number; dead: number; avgMembers: number; medianSize: number; messages30: number };
  msgSeries: SeriesPoint[]; topCircles: { label: string; count: number }[]; sizeBuckets: { label: string; count: number }[];
  table: CircleTableRow[];
};

export default function CirclesTab({ creds }: { creds: Creds }) {
  const { data, loading, error, refresh } = useAdminSection<CirclesData>(creds, "circles");
  if (loading && !data) return <Loading />;
  if (error) return <ErrLine msg={error} onRetry={refresh} />;
  if (!data) return null;
  const k = data.kpis;

  const columns: Column<CircleTableRow>[] = [
    { key: "name", label: "Circle", render: (c) => <span className="text-themed truncate max-w-[180px] inline-block">{c.name}</span>, sortValue: (c) => c.name.toLowerCase() },
    { key: "owner", label: "Owner", render: (c) => <span className="text-themed-muted truncate max-w-[160px] inline-block">{c.owner}</span> },
    { key: "members", label: "Members", align: "right", render: (c) => fmt(c.members), sortValue: (c) => c.members },
    { key: "msgs", label: "Msgs 30d", align: "right", render: (c) => fmt(c.messages30), sortValue: (c) => c.messages30 },
    { key: "last", label: "Last msg", render: (c) => <span className={`whitespace-nowrap ${c.lastMsgAt && Date.parse(c.lastMsgAt) > Date.now() - 30 * 86400000 ? "text-themed-muted" : "text-red-400/70"}`}>{ago(c.lastMsgAt)}</span>, sortValue: (c) => (c.lastMsgAt ? Date.parse(c.lastMsgAt) : 0) },
    { key: "goal", label: "Goal", render: (c) => <span className="text-themed-muted">{c.goal}</span> },
    { key: "created", label: "Created", render: (c) => <span className="text-themed-muted whitespace-nowrap">{fmtWhen(c.createdAt)}</span>, sortValue: (c) => Date.parse(c.createdAt) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs text-themed-muted/70">Updated {fmtWhen(data.generatedAt)}</p>
        <RefreshBtn onClick={refresh} loading={loading} />
      </div>

      <Section title="Circles">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Total circles" value={fmt(k.circles)} />
          <StatTile label="Members" value={fmt(k.members)} hint={`avg ${k.avgMembers} · median ${k.medianSize}`} />
          <StatTile label="Active 7d" value={fmt(k.active7)} hint={`${fmt(k.active30)} in 30d`} />
          <StatTile label="Dead circles" value={fmt(k.dead)} tone={k.dead ? "amber" : undefined} hint="no msg 30d" />
          <StatTile label="Messages 30d" value={fmt(k.messages30)} />
        </div>
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="Messages/day · 30d"><BarChart series={data.msgSeries} /></Section>
        <Section title="Top circles by messages"><Card><RankList rows={data.topCircles} /></Card></Section>
      </div>

      <Section title="Circle size distribution">
        <Card><div className="space-y-2.5">{data.sizeBuckets.map((b) => (
          <div key={b.label} className="flex items-center gap-2.5">
            <div className="w-14 text-[12.5px] text-themed-muted">{b.label}</div>
            <div className="flex-1 h-2 bg-white/6 rounded-full overflow-hidden"><div className="h-full rounded-full bg-[var(--color-gold)]" style={{ width: `${Math.round((b.count / Math.max(1, ...data.sizeBuckets.map((x) => x.count))) * 100)}%` }} /></div>
            <div className="w-10 text-right text-[12.5px] text-themed-muted tabular-nums">{fmt(b.count)}</div>
          </div>
        ))}</div></Card>
      </Section>

      <Section title={`All circles · ${fmt(k.circles)}`}>
        <DataTable columns={columns} rows={data.table} filterText={(c) => `${c.name} ${c.owner}`} minWidth={760} />
      </Section>
      <p className="text-xs text-themed-muted/60">Circles are private to their members; this console sees names + volumes for health &amp; moderation. Message bodies appear only in the Moderation tab.</p>
    </div>
  );
}
