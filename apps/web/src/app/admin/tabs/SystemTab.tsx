"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdminSection, postAdmin, type Creds } from "../useAdminSection";
import { StatTile, Section, Card, Loading, ErrLine, RefreshBtn, fmt, fmtWhen } from "../ui";

type SysData = {
  generatedAt: string;
  banner: { enabled: boolean; level: string; message: string };
  tableSizes: Record<string, number>;
  migrations: Record<string, boolean>;
  quotas: { anon: number; signedIn: number };
};

export default function SystemTab({ creds }: { creds: Creds }) {
  const { data, loading, error, refresh } = useAdminSection<SysData>(creds, "system");
  const [banner, setBanner] = useState({ enabled: false, level: "info", message: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current && data?.banner) { setBanner(data.banner); seeded.current = true; }
  }, [data]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrLine msg={error} onRetry={refresh} />;
  if (!data) return null;

  const save = async () => {
    setBusy(true); setMsg("");
    try { await postAdmin("/api/admin/actions", creds, { action: "setBanner", ...banner }); setMsg("Saved."); }
    catch (e) { setMsg(e instanceof Error ? e.message : "Failed."); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs text-themed-muted/70">Updated {fmtWhen(data.generatedAt)}</p>
        <RefreshBtn onClick={refresh} loading={loading} />
      </div>

      <Section title="Maintenance / status banner">
        <Card>
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-sm text-themed">
              <input type="checkbox" checked={banner.enabled} onChange={(e) => setBanner((b) => ({ ...b, enabled: e.target.checked }))} className="w-4 h-4 accent-[var(--color-gold)]" />
              Show a banner to all users (web + app)
            </label>
            <select value={banner.level} onChange={(e) => setBanner((b) => ({ ...b, level: e.target.value }))} className="bg-white/5 border sidebar-border rounded-xl px-3 py-2 text-sm text-themed focus:outline-none focus:border-[var(--color-gold)]/40">
              <option value="info">Info (gold)</option>
              <option value="warning">Warning (amber)</option>
              <option value="maintenance">Maintenance (red)</option>
            </select>
            <textarea value={banner.message} onChange={(e) => setBanner((b) => ({ ...b, message: e.target.value }))} rows={2} maxLength={500} placeholder="Message shown in the banner…" className="w-full bg-white/5 border sidebar-border rounded-xl px-3 py-2 text-sm text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/40 resize-none" />
            <div className="flex items-center gap-3">
              <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-2 bg-[var(--color-gold)] text-[var(--color-bg)] font-semibold rounded-xl px-4 py-2 text-sm disabled:opacity-50">
                {busy ? <Loader2 size={15} className="animate-spin" /> : "Save banner"}
              </button>
              {msg && <span className="text-xs text-themed-muted">{msg}</span>}
            </div>
            <p className="text-xs text-themed-muted/70 leading-relaxed">Checked on launch + when the app returns to the foreground — your channel to reach app users without an App Store update.</p>
          </div>
        </Card>
      </Section>

      <Section title="Data & config">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Anon quota" value={`${data.quotas.anon}/day`} />
          <StatTile label="Signed-in quota" value={`${data.quotas.signedIn}/day`} />
        </div>
      </Section>

      <Section title="Table sizes">
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            {Object.entries(data.tableSizes).map(([t, n]) => (
              <div key={t} className="flex items-center justify-between gap-3"><span className="text-themed-muted font-mono text-xs">{t}</span><span className="text-themed tabular-nums">{fmt(n)}</span></div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Migrations detected">
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            {Object.entries(data.migrations).map(([t, ok]) => (
              <div key={t} className="flex items-center gap-2"><span className={ok ? "text-green-400" : "text-red-400"}>{ok ? "✓" : "✗"}</span><span className="text-themed-muted font-mono text-xs">{t}</span></div>
            ))}
          </div>
        </Card>
      </Section>
    </div>
  );
}
