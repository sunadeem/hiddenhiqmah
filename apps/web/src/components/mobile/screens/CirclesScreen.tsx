"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  RefreshCw,
  Bell,
  MessageSquare,
  Activity as ActivityIcon,
  Settings2,
  Crown,
  X,
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
  removeCircleMember,
  getUnreadCount,
  type CircleDetail,
  type CircleMember,
} from "@/lib/circles";
import CircleChatSheet from "./circles/CircleChatSheet";
import CircleManageSheet from "./circles/CircleManageSheet";
import CircleNotificationsSheet from "./circles/CircleNotificationsSheet";
import { hapticSelection } from "@/lib/mobile/haptics";
import PageTip from "@/components/mobile/PageTip";

// Supabase/PostgREST errors aren't Error instances — pull their .message so the
// real reason surfaces instead of a generic "Something went wrong".
function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return "Something went wrong.";
}

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
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [chat, setChat] = useState<{ id: string; tab: "chat" | "activity" } | null>(null);
  const [manageId, setManageId] = useState<string | null>(null);

  const copyCode = (id: string, code: string) => {
    try {
      navigator.clipboard?.writeText(code);
    } catch {
      /* clipboard may be unavailable in the WebView — the code is still shown */
    }
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  const loadUnread = useCallback(async () => {
    try {
      setUnread(await getUnreadCount());
    } catch {
      /* 013 not applied yet, or offline — leave the badge hidden */
    }
  }, []);

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      setCircles(await getMyCirclesWithDetail());
      setErr("");
    } catch (e) {
      setErr(errMsg(e));
      setCircles([]);
    }
    loadUnread();
  }, [user, loadUnread]);

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
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  // Progress stepper: update the UI optimistically and persist on a debounce,
  // so tapping +/- feels instant instead of waiting on an RPC + full refetch
  // (and without disabling the buttons between presses).
  const progressTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingProgress = useRef<Record<string, number>>({});

  const flushProgress = useCallback((circleId: string) => {
    clearTimeout(progressTimers.current[circleId]);
    const v = pendingProgress.current[circleId];
    if (v == null) return;
    delete pendingProgress.current[circleId];
    setMyProgress(circleId, v).catch((e) => {
      setErr(errMsg(e));
      reload();
    });
  }, [reload]);

  const bumpProgress = (circleId: string, delta: number) => {
    hapticSelection();
    setCircles((cs) =>
      cs
        ? cs.map((d) => {
            if (d.circle.id !== circleId) return d;
            const next = Math.max(0, d.myValue + delta);
            const applied = next - d.myValue;
            if (applied === 0) return d;
            pendingProgress.current[circleId] = next;
            return {
              ...d,
              myValue: next,
              total: Math.max(0, d.total + applied),
              members: d.members.map((m) => (m.isMe ? { ...m, value: next } : m)),
            };
          })
        : cs
    );
    clearTimeout(progressTimers.current[circleId]);
    progressTimers.current[circleId] = setTimeout(() => flushProgress(circleId), 600);
  };

  // Flush any pending progress writes on unmount so nothing is lost.
  useEffect(() => {
    const timers = progressTimers.current;
    const pend = pendingProgress.current;
    return () => {
      Object.entries(timers).forEach(([id, t]) => {
        clearTimeout(t);
        const v = pend[id];
        if (v != null) setMyProgress(id, v).catch(() => {});
      });
    };
  }, []);

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
              khatmah goals, a hifz buddy, group chat, gentle encouragement. Sign
              in to create or join one.
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

  const activeChat = chat ? circles.find((c) => c.circle.id === chat.id) ?? null : null;
  const manageCircle = manageId ? circles.find((c) => c.circle.id === manageId) ?? null : null;

  return (
    <div className="space-y-4 pb-4">
      <PageTip
        tipKey="circles-nudge"
        anchor="top-center"
        title="Keep each other going"
        body="Circles are private accountability groups — see your members' streaks and send a nudge or duʿā to cheer them on."
      />
      {/* Header with bell */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-themed-muted min-w-0">
          <Shield size={13} className="text-gold shrink-0" />
          <span className="truncate">Private circles · encouragement only</span>
        </div>
        <button
          type="button"
          onClick={() => setShowNotifs(true)}
          aria-label="Notifications"
          className="relative shrink-0 w-10 h-10 rounded-full border sidebar-border card-bg flex items-center justify-center text-themed touch-manipulation active:bg-white/5"
        >
          <Bell size={17} className="text-gold" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
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
            type="text"
            autoFocus
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
            type="text"
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
      {circles.map((d) => {
        const meIsOwner = d.myId != null && d.circle.owner_id === d.myId;
        // Leaderboard: rank by contribution (desc); owner then "you" break ties.
        const ranked = [...d.members].sort(
          (a, b) =>
            b.value - a.value ||
            (a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0) ||
            (a.isMe ? -1 : b.isMe ? 1 : 0)
        );
        const topValue = ranked.length ? ranked[0].value : 0;

        return (
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
              {meIsOwner && (
                <button
                  type="button"
                  onClick={() => setManageId(d.circle.id)}
                  aria-label="Manage circle"
                  title="Manage circle"
                  className="relative shrink-0 p-2 rounded-full text-themed-muted active:bg-white/5 touch-manipulation"
                >
                  <Settings2 size={17} />
                </button>
              )}
            </div>

            {/* My progress stepper */}
            <div className="relative mt-4 flex items-center gap-3 rounded-xl bg-white/[0.04] border sidebar-border px-3 py-2.5">
              <span className="text-xs text-themed-muted flex-1">Your contribution</span>
              <button
                disabled={d.myValue <= 0}
                onClick={() => bumpProgress(d.circle.id, -1)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-themed disabled:opacity-40 touch-manipulation active:scale-95 transition-transform"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-bold text-gold w-12 text-center">{d.myValue} {d.circle.goal_unit}</span>
              <button
                onClick={() => bumpProgress(d.circle.id, 1)}
                className="w-7 h-7 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center text-gold touch-manipulation active:scale-95 transition-transform"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="relative h-px bg-white/10 my-4" />

            {/* Leaderboard */}
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted mb-1.5">Leaderboard</p>
              <div className="space-y-1">
                {ranked.map((m, i) => (
                  <LeaderRow
                    key={m.user_id}
                    m={m}
                    rank={i + 1}
                    isTop={m.value > 0 && m.value === topValue}
                    target={d.circle.goal_target}
                    unit={d.circle.goal_unit}
                    canRemove={meIsOwner && !m.isMe && m.role !== "owner"}
                    duaSent={duaSent.has(d.circle.id + m.user_id)}
                    busy={busy}
                    onDua={() =>
                      run(async () => {
                        await sendDua(d.circle.id, m.user_id);
                        setDuaSent((s) => new Set(s).add(d.circle.id + m.user_id));
                      })
                    }
                    onRemove={() => {
                      if (confirm(`Remove ${m.display_name} from this circle?`)) {
                        run(() => removeCircleMember(d.circle.id, m.user_id));
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative h-px bg-white/10 my-3" />

            {/* Chat + Activity */}
            <div className="relative grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => setChat({ id: d.circle.id, tab: "chat" })}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-themed rounded-xl border sidebar-border py-2.5 active:bg-white/5 touch-manipulation"
              >
                <MessageSquare size={15} className="text-gold" /> Chat
              </button>
              <button
                onClick={() => setChat({ id: d.circle.id, tab: "activity" })}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-themed rounded-xl border sidebar-border py-2.5 active:bg-white/5 touch-manipulation"
              >
                <ActivityIcon size={15} className="text-gold" /> Activity
              </button>
            </div>

            {/* Footer actions */}
            <div className="relative flex items-center gap-2">
              {invites[d.circle.id] ? (
                <>
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
                  <button
                    disabled={busy}
                    title="New invite code"
                    aria-label="New invite code"
                    onClick={() => run(async () => {
                      const code = await generateInvite(d.circle.id);
                      setInvites((m) => ({ ...m, [d.circle.id]: code }));
                    })}
                    className="shrink-0 inline-flex items-center justify-center rounded-xl border sidebar-border px-3 py-2.5 text-gold active:bg-white/5"
                  >
                    <RefreshCw size={14} />
                  </button>
                </>
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
        );
      })}

      {/* Sheets */}
      <CircleChatSheet
        open={!!chat}
        onClose={() => {
          setChat(null);
          loadUnread();
        }}
        target={
          activeChat
            ? {
                circleId: activeChat.circle.id,
                circleName: activeChat.circle.name,
                goalUnit: activeChat.circle.goal_unit,
                isOwner: activeChat.myId != null && activeChat.circle.owner_id === activeChat.myId,
                initialTab: chat?.tab ?? "chat",
              }
            : null
        }
      />

      {manageCircle && (
        <CircleManageSheet
          open={!!manageId}
          onClose={() => setManageId(null)}
          circle={manageCircle.circle}
          onSaved={reload}
        />
      )}

      <CircleNotificationsSheet
        open={showNotifs}
        onClose={() => setShowNotifs(false)}
        onOpenCircle={(circleId, tab) => setChat({ id: circleId, tab })}
        onChanged={loadUnread}
      />
    </div>
  );
}

function LeaderRow({
  m,
  rank,
  isTop,
  target,
  unit,
  canRemove,
  duaSent,
  busy,
  onDua,
  onRemove,
}: {
  m: CircleMember;
  rank: number;
  isTop: boolean;
  target: number;
  unit: string;
  canRemove: boolean;
  duaSent: boolean;
  busy: boolean;
  onDua: () => void;
  onRemove: () => void;
}) {
  const pct = target > 0 ? Math.min(m.value / target, 1) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span
        className={`w-5 shrink-0 text-center text-xs font-bold tabular-nums ${
          isTop ? "text-gold" : "text-themed-muted/70"
        }`}
      >
        {rank}
      </span>
      <Avatar name={m.display_name} avatar={m.avatar} accent={m.isMe} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-themed font-semibold text-sm leading-tight truncate flex items-center gap-1">
            {m.isMe ? "You" : m.display_name}
            {isTop && <Crown size={12} className="text-gold shrink-0" />}
            {m.role === "owner" && <span className="text-gold/70 text-[11px] font-normal">· owner</span>}
          </p>
          <span className="text-xs text-themed-muted shrink-0 tabular-nums">
            {m.value} {unit}
          </span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: isTop ? "var(--color-gold)" : "rgba(212,168,67,0.5)",
            }}
          />
        </div>
      </div>
      {!m.isMe &&
        (duaSent ? (
          <span className="shrink-0 text-gold" title="Du'ā sent">
            <Check size={15} />
          </span>
        ) : (
          <button
            onClick={onDua}
            disabled={busy}
            aria-label={`Send du'ā to ${m.display_name}`}
            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-gold)]/30 text-gold touch-manipulation active:bg-[var(--color-gold)]/10 disabled:opacity-40"
          >
            <Heart size={13} />
          </button>
        ))}
      {canRemove && (
        <button
          onClick={onRemove}
          disabled={busy}
          aria-label={`Remove ${m.display_name}`}
          title="Remove member"
          className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border sidebar-border text-themed-muted/70 hover:text-red-400 touch-manipulation active:bg-white/5 disabled:opacity-40"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
