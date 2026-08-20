"use client";

import { useState } from "react";
import { useAdminSection, postAdmin, type Creds } from "../useAdminSection";
import { StatTile, Section, Card, LineChart, StackedBar, StackedRow, RankList, Loading, ErrLine, RefreshBtn, fmt, fmtUsd, fmtWhen, type SeriesPoint } from "../ui";

type Tok = { input: number; output: number; cacheRead: number; cacheWrite: number };
type AskData = {
  generatedAt: string;
  kpis: { total: number; today: number; last7d: number; last30d: number; anonShare30: number; avgCost30: number; cacheRatio: number; quotaSigned: number; quotaAnon: number; signedQuota: number; anonQuota: number };
  tokenMix30: Tok; cost30: number; rates: Tok;
  messagesStacked: { label: string; date: string; a: number; b: number }[];
  costSeries: SeriesPoint[]; uniqSeries: SeriesPoint[];
  topByCost: { label: string; count: number }[]; topByMsgs: { label: string; count: number }[];
  reports: {
    open: number; shown: number; last7d: number; total: number; migrationMissing: boolean;
    rows: {
      id: string; who: string; signedIn: boolean; answer: string; question: string | null;
      partial: boolean; reason: string | null; note: string | null; surface: string | null;
      platform: string | null; appVersion: string | null; at: string;
    }[];
  };
};

const REASON_LABEL: Record<string, string> = {
  offensive: "Offensive or inappropriate",
  incorrect: "Incorrect or misleading",
  source: "Wrong or missing source",
  other: "Something else",
};

/** Reported AI answers (migration 032).
 *
 *  ⚠️ Both text blocks below render as plain React children. The CLIENT supplies
 *  these strings — anyone can POST arbitrary content claiming it is an AI
 *  answer — so they must never go through dangerouslySetInnerHTML or
 *  renderMarkdown, and a report is never evidence that the model said this. */
function ReportedAnswers({ reports, creds, onDone }: { reports: AskData["reports"]; creds: Creds; onDone: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const act = async (id: string, action: "resolveAskReport" | "dismissAskReport") => {
    setBusy(id);
    setErr(null);
    try {
      await postAdmin("/api/admin/actions", creds, { action, reportId: id });
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  };

  if (reports.migrationMissing) {
    return (
      <Section title="Reported answers">
        <Card><p className="text-sm text-themed-muted">Apply migration 032 to enable AI answer reports.</p></Card>
      </Section>
    );
  }

  return (
    <Section title="Reported answers">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <StatTile label="Open" value={fmt(reports.open)} tone={reports.open ? "red" : undefined} />
        <StatTile label="7 days" value={fmt(reports.last7d)} />
        <StatTile label="Total" value={fmt(reports.total)} />
      </div>
      {err && <p className="text-sm text-red-300 mb-2">{err}</p>}
      {reports.rows.length === 0 ? (
        <Card><p className="text-sm text-themed-muted/70">No open reports.</p></Card>
      ) : (
        <>
          <button onClick={() => setExpanded((v) => !v)} className="text-xs text-themed-muted hover:text-gold mb-2">
            {expanded ? "▾" : "▸"} Open reports ({reports.shown}
            {/* Say so when the query is paging. Silently showing 100 of N is
                how a burst of junk buries genuine reports nobody knows exist. */}
            {reports.open > reports.shown ? ` of ${fmt(reports.open)} — newest first` : ""})
          </button>
          {expanded && (
            <div className="space-y-3">
              {reports.rows.map((r) => (
                <Card key={r.id}>
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                    <span className="text-themed-muted/70">{fmtWhen(r.at)}</span>
                    <span className="text-themed font-medium">{r.reason ? REASON_LABEL[r.reason] ?? r.reason : "No reason given"}</span>
                    <span className="text-themed-muted/70">· {r.who}</span>
                    <span className="text-themed-muted/50">· {[r.surface, r.platform, r.appVersion].filter(Boolean).join(" · ") || "—"}</span>
                    {r.partial && <span className="px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">partial</span>}
                  </div>
                  {r.note && <p className="text-sm text-themed mb-2 whitespace-pre-wrap break-words">{r.note}</p>}
                  {r.question && (
                    <div className="mb-2">
                      <div className="text-[11px] uppercase tracking-wide text-themed-muted/60 mb-1">Question</div>
                      <div className="text-sm text-themed-muted whitespace-pre-wrap break-words rounded-lg bg-[var(--overlay-subtle)] p-2">{r.question}</div>
                    </div>
                  )}
                  <div className="text-[11px] uppercase tracking-wide text-themed-muted/60 mb-1">Reported answer</div>
                  <div className="text-sm text-themed whitespace-pre-wrap break-words rounded-lg bg-[var(--overlay-subtle)] p-2 max-h-64 overflow-y-auto">{r.answer}</div>
                  <div className="flex gap-2 mt-3">
                    <button disabled={busy === r.id} onClick={() => act(r.id, "resolveAskReport")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/25 transition-colors disabled:opacity-40">Resolve</button>
                    <button disabled={busy === r.id} onClick={() => act(r.id, "dismissAskReport")}
                      className="px-3 py-1.5 rounded-lg text-xs text-themed-muted border sidebar-border hover:text-themed transition-colors disabled:opacity-40">Dismiss</button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </Section>
  );
}

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

      {data.reports && <ReportedAnswers reports={data.reports} creds={creds} onDone={refresh} />}

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
