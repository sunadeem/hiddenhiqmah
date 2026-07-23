"use client";

// TEMPORARY on-device diagnostic for APNs push registration. Remove once push
// delivery is verified. Surfaced at the top of the Notifications screen.

import { useEffect, useState } from "react";
import { getPushDiag, forceRegisterPush, type PushDiag } from "@/lib/mobile/push";

function Row({ k, v }: { k: string; v: string }) {
  const bad =
    v.startsWith("rpc error") ||
    v.startsWith("exception") ||
    v.startsWith("register threw") ||
    v.startsWith("force threw") ||
    v === "denied" ||
    (k === "registration error" && v !== "—");
  return (
    <div className="flex justify-between gap-3 text-[11px] py-1 border-b border-[var(--color-border)] last:border-0">
      <span className="text-themed-muted whitespace-nowrap">{k}</span>
      <span
        className={`font-mono text-right break-all ${bad ? "text-red-400" : "text-themed"}`}
      >
        {v}
      </span>
    </div>
  );
}

export default function DebugPushCard() {
  const [diag, setDiag] = useState<PushDiag | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => setDiag(getPushDiag());

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 1000);
    return () => clearInterval(t);
  }, []);

  const run = async () => {
    setBusy(true);
    await forceRegisterPush();
    setTimeout(() => {
      refresh();
      setBusy(false);
    }, 1800);
  };

  if (!diag) return null;

  return (
    <div className="rounded-xl border border-[var(--color-gold)]/40 bg-[var(--color-card)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gold">Push debug (temp)</span>
        <button
          onClick={run}
          disabled={busy}
          className="text-xs bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 rounded-lg px-3 py-1.5 disabled:opacity-50"
        >
          {busy ? "Registering…" : "Register now"}
        </button>
      </div>
      <Row k="native" v={String(diag.native)} />
      <Row k="apns env" v={diag.apnsEnv} />
      <Row k="permission" v={diag.permission} />
      <Row k="register() called" v={String(diag.registerCalled)} />
      <Row k="token" v={diag.token ?? "—"} />
      <Row k="registration error" v={diag.registrationError ?? "—"} />
      <Row
        k="signed in"
        v={diag.sessionPresent === null ? "—" : String(diag.sessionPresent)}
      />
      <Row k="persist result" v={diag.lastPersist ?? "—"} />
    </div>
  );
}
