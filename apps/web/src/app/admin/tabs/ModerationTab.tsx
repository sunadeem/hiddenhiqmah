"use client";

import { useState } from "react";
import { Loader2, Trash2, RotateCcw, Ban, ShieldCheck, Check, X } from "lucide-react";
import { postAdmin, type Creds, type ModerationQueue, type CaseFile, type QueueRow } from "../useAdminSection";
import { StatTile, Card, StateBadge, Loading, ErrLine, RefreshBtn, fmt, fmtWhen, ago } from "../ui";

type QueueHook = { data: ModerationQueue | null; loading: boolean; error: string | null; refresh: () => void };
const FILTERS = ["all", "suspended", "reported", "struck"] as const;
type Filter = (typeof FILTERS)[number];

const EVENT_LABEL: Record<string, string> = {
  strike: "Strike recorded", auto_suspend: "Auto-suspended (3rd strike)", manual_suspend: "Manually suspended",
  unsuspend: "Suspension lifted", strikes_reset: "Strikes reset", report_resolved: "Report resolved",
  report_dismissed: "Report dismissed", message_deleted: "Message deleted", message_restored: "Message restored", note_updated: "Note updated",
};

export default function ModerationTab({ creds, queue }: { creds: Creds; queue: QueueHook }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [showFeed, setShowFeed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [caseFile, setCaseFile] = useState<CaseFile | null>(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [actErr, setActErr] = useState<string | null>(null);

  const loadCase = async (userId: string) => {
    setSelected(userId); setCaseLoading(true); setCaseFile(null); setConfirm(null);
    try {
      const cf = await postAdmin<CaseFile>("/api/admin/moderation", creds, { view: "user", userId });
      setCaseFile(cf); setNote(cf.moderation.note ?? "");
    } catch { setCaseFile(null); }
    finally { setCaseLoading(false); }
  };

  const act = async (payload: Record<string, unknown>) => {
    setBusy(true); setConfirm(null); setActErr(null);
    try {
      await postAdmin("/api/admin/actions", creds, payload);
      queue.refresh();
      if (selected) await loadCase(selected);
    } catch (e) {
      setActErr(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  if (queue.loading && !queue.data) return <Loading />;
  if (queue.error) return <ErrLine msg={queue.error} onRetry={queue.refresh} />;
  if (!queue.data) return null;
  const k = queue.data.kpis;
  const rows = queue.data.queue.filter((r) => filter === "all" || r.state === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-themed-muted/70">Updated {fmtWhen(queue.data.generatedAt)}</p>
        <RefreshBtn onClick={queue.refresh} loading={queue.loading} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatTile label="Open reports" value={fmt(k.openReports)} tone={k.openReports ? "red" : undefined} />
        <StatTile label="Suspended" value={fmt(k.suspended)} tone={k.suspended ? "red" : undefined} />
        <StatTile label="Struck" value={fmt(k.struck)} tone={k.struck ? "amber" : undefined} />
        <StatTile label="Reports 7d" value={fmt(k.reports7d)} />
        <StatTile label="Strikes 7d" value={fmt(k.strikes7d)} />
      </div>

      {actErr && <ErrLine msg={actErr} />}

      <div className="lg:grid lg:grid-cols-[360px_1fr] gap-4 space-y-4 lg:space-y-0">
        {/* Queue */}
        <div className="space-y-3">
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`text-xs px-2.5 py-1 rounded-full border capitalize ${filter === f ? "border-[var(--color-gold)]/50 text-gold bg-[var(--color-gold)]/10" : "border-white/10 text-themed-muted"}`}>{f}</button>
            ))}
          </div>
          <div className="card-bg rounded-2xl border sidebar-border divide-y divide-[var(--overlay-subtle)] max-h-[70vh] overflow-y-auto">
            {rows.length === 0 ? (
              <p className="p-6 text-center text-sm text-themed-muted/70">Nothing to review. 🎉</p>
            ) : rows.map((r) => (
              <button key={r.userId} onClick={() => loadCase(r.userId)} className={`w-full text-left flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 ${selected === r.userId ? "bg-white/5" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-themed truncate">{r.label}</div>
                  <div className="text-[11px] text-themed-muted/70">{r.openReports > 0 ? `${r.openReports} report${r.openReports > 1 ? "s" : ""} · ` : ""}{r.strikes > 0 ? `${r.strikes} strike${r.strikes > 1 ? "s" : ""}` : ""}{r.latestReportAt ? ` · ${ago(r.latestReportAt)}` : ""}</div>
                </div>
                <StateBadge state={r.state} />
              </button>
            ))}
          </div>

          <button onClick={() => setShowFeed((v) => !v)} className="text-xs text-themed-muted hover:text-gold">{showFeed ? "▾" : "▸"} Raw open-reports feed ({queue.data.feed.length})</button>
          {showFeed && (
            <div className="space-y-2">
              {queue.data.feed.map((r) => (
                <Card key={r.id} className="!p-3">
                  <div className="text-[11px] text-themed-muted flex justify-between"><span>{r.circle} · by {r.reporter}</span><span>{ago(r.createdAt)}</span></div>
                  <p className={`text-sm mt-1 ${r.deleted ? "line-through text-themed-muted/60" : "text-themed"}`}>{r.body}</p>
                  <div className="text-[11px] text-themed-muted/70 mt-1">author: {r.author}{r.reason ? ` · "${r.reason}"` : ""}</div>
                  <div className="flex gap-2 mt-2">
                    {r.authorId && <button onClick={() => loadCase(r.authorId!)} className="text-[11px] text-gold">Open case</button>}
                    <button onClick={() => act({ action: "deleteMessage", messageId: r.messageId })} disabled={busy || r.deleted} className="text-[11px] text-red-400 disabled:opacity-40">Delete msg</button>
                    <button onClick={() => act({ action: "resolveReport", reportId: r.id })} disabled={busy} className="text-[11px] text-themed-muted">Resolve</button>
                    <button onClick={() => act({ action: "dismissReport", reportId: r.id })} disabled={busy} className="text-[11px] text-themed-muted">Dismiss</button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Case file */}
        <div>
          {!selected ? (
            <div className="card-bg rounded-2xl border sidebar-border p-10 text-center text-themed-muted/60 text-sm">Select an account to review.</div>
          ) : caseLoading ? (
            <Loading />
          ) : !caseFile ? (
            <div className="card-bg rounded-2xl border sidebar-border p-6 text-center text-themed-muted/70 text-sm">Couldn&apos;t load this case.</div>
          ) : (
            <div className="space-y-4">
              {/* Header + actions */}
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-themed truncate">{caseFile.user.label}</div>
                    <div className="text-xs text-themed-muted mt-0.5">Joined {fmtWhen(caseFile.user.joinedAt)} · {caseFile.moderation.strikes} strike{caseFile.moderation.strikes === 1 ? "" : "s"}{caseFile.moderation.suspended ? " · suspended" : ""}{caseFile.blockedBy > 0 ? ` · blocked by ${caseFile.blockedBy}` : ""}</div>
                  </div>
                  <StateBadge state={caseFile.moderation.suspended ? "suspended" : caseFile.moderation.strikes > 0 ? "struck" : "clean"} />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {caseFile.moderation.suspended ? (
                    <button onClick={() => act({ action: "unsuspend", userId: caseFile.user.id })} disabled={busy} className="inline-flex items-center gap-1.5 text-xs rounded-lg bg-green-500/15 text-green-300 border border-green-400/30 px-3 py-1.5 disabled:opacity-50"><ShieldCheck size={13} /> Unsuspend</button>
                  ) : (
                    confirm === "suspend" ? (
                      <span className="inline-flex items-center gap-1 text-xs"><button onClick={() => act({ action: "suspendUser", userId: caseFile.user.id, reason: "admin review" })} disabled={busy} className="rounded-lg bg-red-500 text-white px-2.5 py-1.5">Confirm suspend</button><button onClick={() => setConfirm(null)} className="text-themed-muted px-1">cancel</button></span>
                    ) : (
                      <button onClick={() => setConfirm("suspend")} disabled={busy} className="inline-flex items-center gap-1.5 text-xs rounded-lg bg-red-500/15 text-red-300 border border-red-400/30 px-3 py-1.5 disabled:opacity-50"><Ban size={13} /> Suspend</button>
                    )
                  )}
                  {caseFile.moderation.strikes > 0 && <button onClick={() => act({ action: "resetStrikes", userId: caseFile.user.id })} disabled={busy} className="inline-flex items-center gap-1.5 text-xs rounded-lg border sidebar-border text-themed-muted px-3 py-1.5 disabled:opacity-50"><RotateCcw size={13} /> Reset strikes</button>}
                  {busy && <Loader2 size={15} className="animate-spin text-themed-muted" />}
                </div>
                <div className="mt-3">
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => note !== caseFile.moderation.note && act({ action: "setUserNote", userId: caseFile.user.id, note })} rows={2} placeholder="Admin note (saved on blur)…" className="w-full bg-white/5 border sidebar-border rounded-xl px-3 py-2 text-sm text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/40 resize-none" />
                </div>
              </Card>

              {/* Reports */}
              {caseFile.reports.length > 0 && (
                <Card title={`Reports (${caseFile.reports.length})`}>
                  <div className="space-y-3">
                    {caseFile.reports.map((r) => (
                      <div key={r.id} className="border-b border-[var(--overlay-subtle)] last:border-0 pb-3 last:pb-0">
                        <div className="text-[11px] text-themed-muted flex justify-between"><span>{r.circle} · by {r.reporter} · {r.status}</span><span>{ago(r.createdAt)}</span></div>
                        <p className={`text-sm mt-1 ${r.deleted ? "line-through text-themed-muted/60" : "text-themed"}`}>{r.body}</p>
                        {r.reason && <div className="text-[11px] text-themed-muted/70 mt-0.5">reason: {r.reason}</div>}
                        {r.status === "open" && (
                          <div className="flex gap-2 mt-1.5">
                            <button onClick={() => act({ action: "deleteMessage", messageId: r.messageId })} disabled={busy || r.deleted} className="inline-flex items-center gap-1 text-[11px] text-red-400 disabled:opacity-40"><Trash2 size={11} /> Delete msg</button>
                            <button onClick={() => act({ action: "resolveReport", reportId: r.id })} disabled={busy} className="inline-flex items-center gap-1 text-[11px] text-green-400"><Check size={11} /> Resolve</button>
                            <button onClick={() => act({ action: "dismissReport", reportId: r.id })} disabled={busy} className="inline-flex items-center gap-1 text-[11px] text-themed-muted"><X size={11} /> Dismiss</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recent messages */}
              <Card title={`Recent messages (${caseFile.recentMessages.length})`}>
                {caseFile.recentMessages.length === 0 ? <p className="text-sm text-themed-muted/60">No messages.</p> : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {caseFile.recentMessages.map((m) => (
                      <div key={m.id} className="flex items-start gap-2 text-sm">
                        <div className="flex-1 min-w-0">
                          <p className={m.deleted ? "line-through text-themed-muted/60" : "text-themed"}>{m.body}</p>
                          <div className="text-[10px] text-themed-muted/60">{m.circle} · {ago(m.at)}{m.deleted ? " · deleted" : ""}</div>
                        </div>
                        {m.deleted ? (
                          <button onClick={() => act({ action: "restoreMessage", messageId: m.id })} disabled={busy} className="text-[11px] text-themed-muted shrink-0">Restore</button>
                        ) : (
                          <button onClick={() => act({ action: "deleteMessage", messageId: m.id })} disabled={busy} className="text-[11px] text-red-400 shrink-0">Delete</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* History */}
              <Card title="History">
                {caseFile.history.length === 0 ? <p className="text-sm text-themed-muted/60">No recorded events (apply migration 023 to enable the audit trail).</p> : (
                  <ul className="space-y-1.5">
                    {caseFile.history.map((e, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 text-[12.5px]"><span className="text-themed">{EVENT_LABEL[e.kind] ?? e.kind}</span><span className="text-themed-muted/70 text-[11px]">{fmtWhen(e.at)}</span></li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
