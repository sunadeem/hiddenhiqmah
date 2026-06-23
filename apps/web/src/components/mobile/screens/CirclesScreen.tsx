"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Plus,
  Heart,
  Check,
  Users,
  Copy,
  LogOut,
  Minus,
  Loader2,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getMyCirclesWithDetail,
  createCircle,
  joinCircle,
  generateInvite,
  setMyProgress,
  sendDua,
  leaveCircle,
  type CircleDetail,
} from "@/lib/circles";

const RING_R = 28;
const RING_C = 2 * Math.PI * RING_R;

function Ring({ total, target, unit }: { total: number; target: number; unit: string }) {
  const pct = target > 0 ? Math.min(total / target, 1) : 0;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle cx="36" cy="36" r={RING_R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
      <circle
        cx="36"
        cy="36"
        r={RING_R}
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${pct * RING_C} ${RING_C}`}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="34" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="800">{total}</text>
      <text x="36" y="48" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontWeight="600">/ {target} {unit}</text>
    </svg>
  );
}

function Avatar({ name, avatar, accent }: { name: string; avatar: string | null; accent?: boolean }) {
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
        accent ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]" : "bg-[var(--color-gold)]/16 text-gold"
      }`}
    >
      {avatar || (name?.[0]?.toUpperCase() ?? "?")}
    </div>
  );
}

export default function CirclesScreen() {
  const { user, loading: authLoading } = useAuth();
  const [circles, setCircles] = useState<CircleDetail[] | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [invites, setInvites] = useState<Record<string, string>>({});
  const [duaSent, setDuaSent] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (id: string, code: string) => {
    try {
      navigator.clipboard?.writeText(code);
    } catch {
      /* clipboard may be unavailable in the WebView — the code is still shown */
    }
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      setCircles(await getMyCirclesWithDetail());
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load circles.");
      setCircles([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) reload();
  }, [user, reload]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr("");
    try {
      await fn();
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  // ── Not signed in ──────────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <div className="pb-4">
        <div className="card-bg rounded-2xl border sidebar-border p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/8 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/15 text-gold flex items-center justify-center mx-auto mb-3">
              <Users size={22} />
            </div>
            <h2 className="text-themed font-bold text-lg">Circles</h2>
            <p className="text-themed-muted text-sm mt-2 leading-relaxed max-w-xs mx-auto">
              Private accountability circles with family &amp; friends — shared
              khatmah goals, a hifz buddy, gentle encouragement. Sign in to
              create or join one.
            </p>
            <Link
              href="/signin"
              className="inline-block mt-4 bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 rounded-xl px-5 py-3 font-semibold touch-manipulation active:bg-[var(--color-gold)]/30"
            >
              Sign in
            </Link>
            <p className="text-[11px] text-themed-muted/70 mt-4 flex items-center justify-center gap-1.5">
              <Shield size={12} className="text-gold" /> Private · no public leaderboards
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (authLoading || circles === null) {
    return (
      <div className="pb-4 flex items-center justify-center py-16 text-themed-muted">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-2 text-[11px] text-themed-muted">
        <Shield size={13} className="text-gold shrink-0" />
        Private circles · no public leaderboards · encouragement only
      </div>

      {err && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-300">
          {err}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => { setShowCreate((v) => !v); setShowJoin(false); }}
          className="flex items-center justify-center gap-2 rounded-xl border sidebar-border card-bg py-3 text-sm font-semibold text-themed touch-manipulation active:bg-white/5"
        >
          <Plus size={16} className="text-gold" /> New circle
        </button>
        <button
          onClick={() => { setShowJoin((v) => !v); setShowCreate(false); }}
          className="flex items-center justify-center gap-2 rounded-xl border sidebar-border card-bg py-3 text-sm font-semibold text-themed touch-manipulation active:bg-white/5"
        >
          <UserPlus size={16} className="text-gold" /> Join with code
        </button>
      </div>

      {showCreate && (
        <div className="card-bg rounded-2xl border sidebar-border p-4 space-y-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Circle name (e.g. Family Khatmah)"
            className="w-full bg-white/5 border sidebar-border rounded-xl px-3 py-2.5 text-base text-themed placeholder:text-themed-muted/60 focus:outline-none focus:border-[var(--color-gold)]/40"
          />
          <p className="text-[11px] text-themed-muted">Goal: complete a 30-juz khatmah together.</p>
          <button
            disabled={busy}
            onClick={() => run(async () => { await createCircle(newName || "My Circle", 30); setNewName(""); setShowCreate(false); })}
            className="w-full rounded-xl bg-gold text-[#0a1628] font-bold py-3 disabled:opacity-60"
          >
            Create circle
          </button>
        </div>
      )}

      {showJoin && (
        <div className="card-bg rounded-2xl border sidebar-border p-4 space-y-3">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Invite code"
            autoCapitalize="characters"
            className="w-full bg-white/5 border sidebar-border rounded-xl px-3 py-2.5 text-base text-themed tracking-widest placeholder:tracking-normal placeholder:text-themed-muted/60 focus:outline-none focus:border-[var(--color-gold)]/40"
          />
          <button
            disabled={busy || !joinCode.trim()}
            onClick={() => run(async () => { await joinCircle(joinCode.trim()); setJoinCode(""); setShowJoin(false); })}
            className="w-full rounded-xl bg-gold text-[#0a1628] font-bold py-3 disabled:opacity-60"
          >
            Join circle
          </button>
        </div>
      )}

      {/* Empty */}
      {circles.length === 0 && !showCreate && !showJoin && (
        <div className="text-center py-10 text-themed-muted text-sm">
          No circles yet. Create one for your family, or join with a code.
        </div>
      )}

      {/* Circles */}
      {circles.map((d) => (
        <div key={d.circle.id} className="card-bg rounded-2xl border sidebar-border p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/8 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <Ring total={d.total} target={d.circle.goal_target} unit={d.circle.goal_unit} />
            <div className="flex-1 min-w-0">
              <p className="text-themed font-bold text-lg leading-tight truncate">{d.circle.name}</p>
              <p className="text-themed-muted text-sm mt-0.5">
                {Math.max(d.circle.goal_target - d.total, 0)} {d.circle.goal_unit} to go · {d.members.length} member{d.members.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* My progress stepper */}
          <div className="relative mt-4 flex items-center gap-3 rounded-xl bg-white/[0.04] border sidebar-border px-3 py-2.5">
            <span className="text-xs text-themed-muted flex-1">Your contribution</span>
            <button
              disabled={busy || d.myValue <= 0}
              onClick={() => run(() => setMyProgress(d.circle.id, d.myValue - 1))}
              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-themed disabled:opacity-40"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-bold text-gold w-12 text-center">{d.myValue} {d.circle.goal_unit}</span>
            <button
              disabled={busy}
              onClick={() => run(() => setMyProgress(d.circle.id, d.myValue + 1))}
              className="w-7 h-7 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center text-gold disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="relative h-px bg-white/10 my-4" />

          {/* Members */}
          <div className="relative space-y-1">
            {d.members.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3 py-2">
                <Avatar name={m.display_name} avatar={m.avatar} accent={m.isMe} />
                <div className="flex-1 min-w-0">
                  <p className="text-themed font-semibold text-sm leading-tight truncate">
                    {m.isMe ? "You" : m.display_name}
                    {m.role === "owner" && <span className="text-gold/70 text-[11px] font-normal"> · owner</span>}
                  </p>
                  <p className="text-themed-muted text-xs mt-0.5">{m.value} {d.circle.goal_unit}</p>
                </div>
                {!m.isMe && (
                  duaSent.has(d.circle.id + m.user_id) ? (
                    <span className="text-[11px] text-gold flex items-center gap-1"><Check size={12} /> Du&apos;ā sent</span>
                  ) : (
                    <button
                      onClick={() => run(async () => {
                        await sendDua(d.circle.id, m.user_id);
                        setDuaSent((s) => new Set(s).add(d.circle.id + m.user_id));
                      })}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold rounded-full border border-[var(--color-gold)]/30 px-2.5 py-1.5 touch-manipulation active:bg-[var(--color-gold)]/10"
                    >
                      <Heart size={12} /> Du&apos;ā
                    </button>
                  )
                )}
              </div>
            ))}
          </div>

          <div className="relative h-px bg-white/10 my-3" />

          {/* Footer actions */}
          <div className="relative flex items-center gap-2">
            {invites[d.circle.id] ? (
              <button
                onClick={() => copyCode(d.circle.id, invites[d.circle.id])}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold text-gold rounded-xl border border-[var(--color-gold)]/30 py-2.5 tracking-widest"
              >
                {copied === d.circle.id ? (
                  <><Check size={14} /> Copied!</>
                ) : (
                  <><Copy size={14} /> {invites[d.circle.id]}</>
                )}
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={() => run(async () => {
                  const code = await generateInvite(d.circle.id);
                  setInvites((m) => ({ ...m, [d.circle.id]: code }));
                })}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold text-themed rounded-xl border sidebar-border py-2.5 active:bg-white/5"
              >
                <UserPlus size={14} className="text-gold" /> Invite
              </button>
            )}
            <button
              disabled={busy}
              onClick={() => {
                if (confirm("Leave this circle? If you're the owner, it will be disbanded for everyone.")) {
                  run(() => leaveCircle(d.circle.id));
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 text-sm text-themed-muted rounded-xl border sidebar-border px-3 py-2.5 active:bg-white/5"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      ))}

      <p className="text-[11px] text-themed-muted/70 text-center pt-2">
        Preview — syncing is live, but this feature is still being polished.
      </p>
    </div>
  );
}
