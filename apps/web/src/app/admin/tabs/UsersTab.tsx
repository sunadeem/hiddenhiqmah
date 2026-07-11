"use client";

import { useState } from "react";
import { useAdminSection, type Creds } from "../useAdminSection";
import { StatTile, Section, Card, BarChart, LineChart, CohortGrid, DataTable, Loading, ErrLine, RefreshBtn, fmt, fmtUsd, fmtWhen, ago, type SeriesPoint, type Column } from "../ui";
import UserDrawer from "../UserDrawer";

export type UserRow = {
  id: string; name: string | null; email: string | null; joinedAt: string; lastActiveAt: string | null;
  ask: number; askCost: number; hifz: number; dhikr: number; circles: number; streak: number; strikes: number; suspended: boolean;
};
type UsersData = {
  generatedAt: string;
  kpis: { signedUp: number; guests: number; today: number; last7d: number; last30d: number; dormant: number };
  signupSeries: SeriesPoint[];
  cumulativeSeries: SeriesPoint[];
  cohort: { week: string; size: number; retention: (number | null)[] }[];
  funnel: { guestsAllTime: number; guestMessages: number; signups30d: number };
  userTable: UserRow[];
};

export default function UsersTab({ creds }: { creds: Creds }) {
  const { data, loading, error, refresh } = useAdminSection<UsersData>(creds, "users");
  const [selected, setSelected] = useState<UserRow | null>(null);
  if (loading && !data) return <Loading />;
  if (error) return <ErrLine msg={error} onRetry={refresh} />;
  if (!data) return null;
  const k = data.kpis;

  const columns: Column<UserRow>[] = [
    { key: "user", label: "User", render: (u) => (<div><div className="text-themed truncate max-w-[200px]">{u.name || u.email || u.id.slice(0, 8) + "…"}</div>{u.name && u.email && <div className="text-themed-muted/60 text-xs truncate max-w-[200px]">{u.email}</div>}</div>), sortValue: (u) => (u.name || u.email || "").toLowerCase() },
    { key: "joined", label: "Joined", render: (u) => <span className="text-themed-muted whitespace-nowrap">{fmtWhen(u.joinedAt)}</span>, sortValue: (u) => Date.parse(u.joinedAt) },
    { key: "active", label: "Last active", render: (u) => <span className="text-themed-muted whitespace-nowrap">{ago(u.lastActiveAt)}</span>, sortValue: (u) => (u.lastActiveAt ? Date.parse(u.lastActiveAt) : 0) },
    { key: "ask", label: "Ask", align: "right", render: (u) => fmt(u.ask), sortValue: (u) => u.ask },
    { key: "cost", label: "Cost", align: "right", render: (u) => fmtUsd(u.askCost), sortValue: (u) => u.askCost },
    { key: "hifz", label: "Hifz", align: "right", render: (u) => fmt(u.hifz), sortValue: (u) => u.hifz },
    { key: "dhikr", label: "Dhikr", align: "right", render: (u) => fmt(u.dhikr), sortValue: (u) => u.dhikr },
    { key: "circles", label: "Circles", align: "right", render: (u) => fmt(u.circles), sortValue: (u) => u.circles },
    { key: "streak", label: "Streak", align: "right", render: (u) => fmt(u.streak), sortValue: (u) => u.streak },
    { key: "status", label: "Status", render: (u) => (u.suspended ? <span className="text-xs text-red-300">Suspended</span> : u.strikes > 0 ? <span className="text-xs text-amber-400">{u.strikes} strike{u.strikes > 1 ? "s" : ""}</span> : <span className="text-xs text-themed-muted/40">—</span>) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs text-themed-muted/70">Updated {fmtWhen(data.generatedAt)}</p>
        <RefreshBtn onClick={refresh} loading={loading} />
      </div>

      <Section title="Users">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Signed-up" value={fmt(k.signedUp)} />
          <StatTile label="Guests" value={fmt(k.guests)} hint="anon devices (Ask)" />
          <StatTile label="New today" value={fmt(k.today)} hint={`${fmt(k.last30d)} in 30d`} />
          <StatTile label="Dormant" value={fmt(k.dormant)} hint="no activity 30d" />
        </div>
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="Signups · 30d"><BarChart series={data.signupSeries} /></Section>
        <Section title="Cumulative users"><LineChart series={data.cumulativeSeries} caption="total accounts" /></Section>
      </div>

      <Section title="Signup cohort retention (% active by week)">
        <Card><CohortGrid cohorts={data.cohort} /></Card>
      </Section>

      <Section title="Guest → signup (volumes)">
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Guest devices" value={fmt(data.funnel.guestsAllTime)} hint="90d, distinct" />
          <StatTile label="Guest Ask msgs" value={fmt(data.funnel.guestMessages)} hint="90d" />
          <StatTile label="Signups" value={fmt(data.funnel.signups30d)} hint="30d" />
        </div>
        <p className="text-xs text-themed-muted/60 leading-relaxed">Direct guest→account conversion isn&apos;t tracked — the anon device id is cleared at sign-in — so these are volumes, not a funnel rate.</p>
      </Section>

      <Section title={`All users · ${fmt(k.signedUp)}`}>
        <DataTable columns={columns} rows={data.userTable} filterText={(u) => `${u.name ?? ""} ${u.email ?? ""}`} minWidth={860} onRowClick={setSelected} />
      </Section>

      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
