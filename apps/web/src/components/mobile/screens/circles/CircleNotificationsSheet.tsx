"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
  Loader2,
  Bell,
  BellOff,
  MessageSquare,
  Heart,
  UserPlus,
  UserMinus,
  PartyPopper,
  CheckCheck,
} from "lucide-react";
import {
  getMyNotifications,
  markNotificationsRead,
  timeAgo,
  type CircleNotification,
  CIRCLES_CHAT_ENABLED,
} from "@/lib/circles";
import { hapticLight } from "@/lib/mobile/haptics";

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return "Something went wrong.";
}

function iconFor(kind: string): React.ReactNode {
  switch (kind) {
    case "message":
      return <MessageSquare size={16} className="text-gold" />;
    case "dua":
      return <Heart size={16} className="text-gold" />;
    case "joined":
      return <UserPlus size={16} className="text-gold" />;
    case "goal_reached":
      return <PartyPopper size={16} className="text-gold" />;
    case "removed":
      return <UserMinus size={16} className="text-themed-muted" />;
    default:
      return <Bell size={16} className="text-gold" />;
  }
}

/** Bell inbox: per-user notifications, most recent first; tap to read + open. */
export default function CircleNotificationsSheet({
  open,
  onClose,
  onOpenCircle,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  onOpenCircle: (circleId: string, tab: "chat" | "activity") => void;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<CircleNotification[] | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(await getMyNotifications());
      setErr("");
    } catch (e) {
      setErr(errMsg(e));
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setItems(null);
      load();
    }
  }, [open, load]);

  if (!open) return null;

  const hasUnread = (items ?? []).some((n) => !n.read_at);

  const markAll = async () => {
    hapticLight();
    try {
      await markNotificationsRead();
      await load();
      onChanged();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const tap = async (n: CircleNotification) => {
    hapticLight();
    try {
      if (!n.read_at) {
        await markNotificationsRead([n.id]);
        onChanged();
      }
    } catch {
      /* non-fatal — still try to open */
    }
    if (n.circle_id && n.kind !== "removed") {
      const tab = CIRCLES_CHAT_ENABLED && (n.kind === "message" || n.kind === "dua") ? "chat" : "activity";
      onClose();
      onOpenCircle(n.circle_id, tab);
    } else {
      load();
    }
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full sm:max-w-md bg-themed border-t sm:border sidebar-border sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sidebar-border">
          <h3 className="text-base font-semibold text-themed flex items-center gap-2">
            <Bell size={16} className="text-gold" /> Notifications
          </h3>
          <div className="flex items-center gap-1">
            {hasUnread && (
              <button
                type="button"
                onClick={markAll}
                className="text-[11px] font-semibold text-gold flex items-center gap-1 px-2 py-1 rounded-lg active:bg-[var(--overlay-subtle)] touch-manipulation"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-themed-muted hover:text-themed touch-manipulation"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {err && (
            <div className="m-3 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">
              {err}
            </div>
          )}
          {items === null ? (
            <div className="flex items-center justify-center py-16 text-themed-muted">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 px-6">
              <BellOff size={30} className="text-gold/25 mx-auto mb-3" />
              <p className="text-themed-muted text-sm">No notifications yet.</p>
              <p className="text-themed-muted/60 text-xs mt-1">
                You&apos;ll hear when your circles are active.
              </p>
            </div>
          ) : (
            <div>
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => tap(n)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[var(--overlay-subtle)] last:border-0 touch-manipulation active:bg-[var(--overlay-subtle)] ${
                    n.read_at ? "" : "bg-[var(--color-gold)]/[0.06]"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--overlay-subtle)] flex items-center justify-center shrink-0">
                    {iconFor(n.kind)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.read_at ? "text-themed-muted" : "text-themed font-medium"}`}>
                      {n.body}
                    </p>
                    <p className="text-[11px] text-themed-muted/60 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read_at && <span className="w-2 h-2 rounded-full bg-gold shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
