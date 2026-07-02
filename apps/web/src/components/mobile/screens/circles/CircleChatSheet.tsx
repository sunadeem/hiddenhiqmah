"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  MessageSquare,
  Activity as ActivityIcon,
  Trash2,
  Heart,
  UserPlus,
  UserMinus,
  LogOut,
  PartyPopper,
  Pencil,
  Target,
  BookOpen,
} from "lucide-react";
import {
  getCircleMessages,
  sendCircleMessage,
  deleteCircleMessage,
  subscribeCircleMessages,
  getCircleActivity,
  timeAgo,
  type CircleMessage,
  type CircleActivity,
} from "@/lib/circles";
import { hapticLight, hapticMedium } from "@/lib/mobile/haptics";
import { useLongPress } from "@/components/mobile/LongPressActions";

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return "Something went wrong.";
}

function initial(name: string): string {
  return name?.trim()?.[0]?.toUpperCase() ?? "?";
}

type Tab = "chat" | "activity";

export type ChatTarget = {
  circleId: string;
  circleName: string;
  goalUnit: string;
  isOwner: boolean;
  initialTab: Tab;
};

export default function CircleChatSheet({
  open,
  onClose,
  target,
}: {
  open: boolean;
  onClose: () => void;
  target: ChatTarget | null;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Keep the last target while animating out (open flips false before unmount).
  const cache = useRef<ChatTarget | null>(target);
  if (target) cache.current = target;
  const t = target ?? cache.current;
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && t && (
        <Sheet
          key={t.circleId}
          onClose={onClose}
          circleId={t.circleId}
          circleName={t.circleName}
          goalUnit={t.goalUnit}
          isOwner={t.isOwner}
          initialTab={t.initialTab}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}

function Sheet({
  onClose,
  circleId,
  circleName,
  goalUnit,
  isOwner,
  initialTab,
}: {
  onClose: () => void;
  circleId: string;
  circleName: string;
  goalUnit: string;
  isOwner: boolean;
  initialTab: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [messages, setMessages] = useState<CircleMessage[] | null>(null);
  const [activity, setActivity] = useState<CircleActivity[] | null>(null);
  const [err, setErr] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CircleMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const rows = await getCircleMessages(circleId);
      setMessages(rows);
      setErr("");
    } catch (e) {
      setErr(errMsg(e));
      setMessages([]);
    }
  }, [circleId]);

  const loadActivity = useCallback(async () => {
    try {
      setActivity(await getCircleActivity(circleId));
      setErr("");
    } catch (e) {
      setErr(errMsg(e));
      setActivity([]);
    }
  }, [circleId]);

  // Initial load per tab.
  useEffect(() => {
    if (tab === "chat" && messages === null) loadMessages();
    if (tab === "activity" && activity === null) loadActivity();
  }, [tab, messages, activity, loadMessages, loadActivity]);

  // Live chat: subscribe while open, refetch on any change.
  useEffect(() => {
    const unsub = subscribeCircleMessages(circleId, () => {
      loadMessages();
    });
    return unsub;
  }, [circleId, loadMessages]);

  // Auto-scroll to newest whenever the chat list grows.
  useEffect(() => {
    if (tab === "chat" && messages) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages, tab]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setErr("");
    try {
      await sendCircleMessage(circleId, body);
      setText("");
      await loadMessages();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setSending(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    hapticMedium();
    try {
      await deleteCircleMessage(pendingDelete.id);
      setPendingDelete(null);
      await loadMessages();
    } catch (e) {
      setErr(errMsg(e));
      setPendingDelete(null);
    }
  };

  return (
    <motion.div
      key="circle-chat-sheet"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 320 }}
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Header */}
      <div
        className="shrink-0 border-b sidebar-border"
        style={{ paddingTop: "max(calc(env(safe-area-inset-top) + 0.5rem), 3.25rem)" }}
      >
        <div className="flex items-center gap-2 px-4 pb-2">
          <div className="flex-1 min-w-0">
            <p className="text-themed font-bold text-base leading-tight truncate">{circleName}</p>
            <p className="text-themed-muted text-[11px]">Members only · private</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 p-2.5 rounded-full bg-white/10 text-themed touch-manipulation active:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex px-3 gap-1">
          {(["chat", "activity"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                hapticLight();
                setTab(t);
              }}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px touch-manipulation ${
                tab === t
                  ? "border-[var(--color-gold)] text-gold"
                  : "border-transparent text-themed-muted"
              }`}
            >
              {t === "chat" ? <MessageSquare size={15} /> : <ActivityIcon size={15} />}
              {t === "chat" ? "Chat" : "Activity"}
            </button>
          ))}
        </div>
      </div>

      {err && (
        <div className="shrink-0 px-4 py-2 text-xs text-red-300 bg-red-400/10 border-b border-red-400/20">
          {err}
        </div>
      )}

      {/* Body */}
      {tab === "chat" ? (
        <>
          <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-3 py-3 space-y-1.5">
            {messages === null ? (
              <div className="flex items-center justify-center py-16 text-themed-muted">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 px-6">
                <MessageSquare size={30} className="text-gold/25 mx-auto mb-3" />
                <p className="text-themed-muted text-sm">No messages yet.</p>
                <p className="text-themed-muted/60 text-xs mt-1">
                  Say salām and encourage each other.
                </p>
              </div>
            ) : (
              messages.map((m, i) => {
                const prev = messages[i - 1];
                const grouped = prev && prev.user_id === m.user_id && !prev.deleted_at && !m.deleted_at;
                return (
                  <MessageRow
                    key={m.id}
                    msg={m}
                    grouped={!!grouped}
                    canDelete={m.isMine || isOwner}
                    onRequestDelete={() => setPendingDelete(m)}
                  />
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Composer — flex child (not sticky); sits above the iOS safe-area/keyboard. */}
          <div
            className="shrink-0 border-t sidebar-border px-3 pt-2.5"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
          >
            <div className="flex items-end gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Message…"
                className="flex-1 resize-none max-h-28 bg-white/5 border sidebar-border rounded-2xl px-4 py-2.5 text-base text-themed placeholder:text-themed-muted/60 focus:outline-none focus:border-[var(--color-gold)]/40"
              />
              <button
                type="button"
                onClick={send}
                disabled={!text.trim() || sending}
                aria-label="Send"
                className="shrink-0 w-11 h-11 rounded-full bg-gold text-[#0a1628] flex items-center justify-center disabled:opacity-40 touch-manipulation active:scale-95"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div
          className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-4 py-3"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
        >
          {activity === null ? (
            <div className="flex items-center justify-center py-16 text-themed-muted">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : activity.length === 0 ? (
            <div className="text-center py-16 px-6">
              <ActivityIcon size={30} className="text-gold/25 mx-auto mb-3" />
              <p className="text-themed-muted text-sm">Nothing here yet.</p>
              <p className="text-themed-muted/60 text-xs mt-1">
                Progress, joins and du&apos;ās will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {activity.map((a) => (
                <ActivityRow key={a.id} a={a} unit={goalUnit} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete confirm */}
      <DeleteConfirm
        msg={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
}

function MessageRow({
  msg,
  grouped,
  canDelete,
  onRequestDelete,
}: {
  msg: CircleMessage;
  grouped: boolean;
  canDelete: boolean;
  onRequestDelete: () => void;
}) {
  const longPress = useLongPress(() => {
    if (canDelete && !msg.deleted_at) {
      hapticMedium();
      onRequestDelete();
    }
  });

  if (msg.deleted_at) {
    return (
      <div className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
        <div className="max-w-[80%] rounded-2xl px-3.5 py-2 text-xs italic text-themed-muted/70 border border-dashed sidebar-border">
          message deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${msg.isMine ? "justify-end" : "justify-start"} ${grouped ? "" : "mt-2"}`}>
      <div className={`flex gap-2 max-w-[82%] ${msg.isMine ? "flex-row-reverse" : ""}`}>
        {!msg.isMine && (
          <div className="w-7 shrink-0 flex justify-center">
            {!grouped && (
              <div className="w-7 h-7 rounded-full bg-[var(--color-gold)]/16 text-gold flex items-center justify-center text-xs font-bold">
                {msg.sender_avatar || initial(msg.sender_name)}
              </div>
            )}
          </div>
        )}
        <div
          {...longPress}
          style={{ WebkitTouchCallout: "none" }}
          className={`rounded-2xl px-3.5 py-2 touch-manipulation ${
            msg.isMine
              ? "bg-[var(--color-gold)]/18 border border-[var(--color-gold)]/25 rounded-br-md"
              : "card-bg border sidebar-border rounded-bl-md"
          }`}
        >
          {!msg.isMine && !grouped && (
            <p className="text-[11px] font-semibold text-gold/80 mb-0.5">{msg.sender_name}</p>
          )}
          <p className="text-sm text-themed whitespace-pre-wrap break-words">{msg.body}</p>
          <p className="text-[10px] text-themed-muted/60 mt-0.5 text-right">{timeAgo(msg.created_at)}</p>
        </div>
      </div>
    </div>
  );
}

const ACT_ICON: Record<CircleActivity["kind"], React.ReactNode> = {
  joined: <UserPlus size={15} className="text-gold" />,
  left: <LogOut size={15} className="text-themed-muted" />,
  progress: <BookOpen size={15} className="text-gold" />,
  goal_reached: <PartyPopper size={15} className="text-gold" />,
  message: <MessageSquare size={15} className="text-themed-muted" />,
  dua: <Heart size={15} className="text-gold" />,
  renamed: <Pencil size={15} className="text-themed-muted" />,
  goal_updated: <Target size={15} className="text-gold" />,
  removed: <UserMinus size={15} className="text-themed-muted" />,
};

function activityText(a: CircleActivity, unit: string): string {
  const name = a.actor_name;
  const meta = a.meta || {};
  switch (a.kind) {
    case "joined":
      return `${name} joined the circle`;
    case "left":
      return `${name} left the circle`;
    case "progress":
      return `${name} logged ${meta.value ?? 0} ${meta.unit ?? unit}`;
    case "goal_reached":
      return `${name} reached their goal 🎉`;
    case "message":
      return `${name} sent a message`;
    case "dua":
      return `${name} sent a du'ā`;
    case "renamed":
      return `${name} renamed the circle to “${meta.name ?? ""}”`;
    case "goal_updated":
      return `${name} updated the goal to ${meta.goal_target ?? ""} ${meta.goal_unit ?? unit}`;
    case "removed":
      return `${name} removed a member`;
    default:
      return name;
  }
}

function ActivityRow({ a, unit }: { a: CircleActivity; unit: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center shrink-0">
        {ACT_ICON[a.kind] ?? <ActivityIcon size={15} className="text-themed-muted" />}
      </div>
      <p className="flex-1 min-w-0 text-sm text-themed leading-snug">{activityText(a, unit)}</p>
      <span className="shrink-0 text-[11px] text-themed-muted/70">{timeAgo(a.created_at)}</span>
    </div>
  );
}

function DeleteConfirm({
  msg,
  onCancel,
  onConfirm,
}: {
  msg: CircleMessage | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {msg && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-[80] bg-black/50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[81] bg-themed border-t sidebar-border rounded-t-2xl"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-white/25" />
            </div>
            <p className="px-5 pt-2 pb-1 text-sm text-themed font-semibold">Delete this message?</p>
            <p className="px-5 pb-3 text-xs text-themed-muted truncate">{msg.body}</p>
            <div className="px-4 pb-2 space-y-2">
              <button
                type="button"
                onClick={onConfirm}
                className="w-full rounded-xl bg-red-500/15 text-red-300 border border-red-400/30 py-3 font-semibold flex items-center justify-center gap-2 touch-manipulation active:bg-red-500/25"
              >
                <Trash2 size={16} /> Delete
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-xl border sidebar-border py-3 text-themed font-semibold touch-manipulation active:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
