"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshCw, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  SYNC_NUDGE_EVENT,
  recordSyncPromptShown,
  retireSyncPrompt,
} from "@hidden-hiqmah/ui/lib/storage";

// A once-per-device, dismissible invitation to sign in and sync progress across
// devices. Fired by maybeNudgeSync() after a few meaningful local actions
// (checklist completions, Hifz grades). It NEVER blocks the action that
// triggered it — everything is already saved on-device — so it stays compliant
// with App Store 5.1.1(v) (on-device features must not require an account).
export default function SyncNudge() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onNudge = () => {
      // Auth not resolved yet (cold start): don't guess — neither show nor
      // retire. maybeNudgeSync() re-fires on the next action once it's known.
      if (loading) return;
      // Signed-in users never need it → retire for good.
      if (user) {
        retireSyncPrompt();
        return;
      }
      // Don't interrupt the sign-in / auth flow; leave state untouched so it can
      // re-fire on the next action once they're back on a normal screen.
      if (pathname.startsWith("/signin") || pathname.startsWith("/auth")) return;
      // Show once now; record advances the milestone + starts the cooldown.
      recordSyncPromptShown();
      setOpen(true);
    };
    window.addEventListener(SYNC_NUDGE_EVENT, onNudge);
    return () => window.removeEventListener(SYNC_NUDGE_EVENT, onNudge);
  }, [user, loading, pathname]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full sm:max-w-sm bg-themed border-t sm:border sidebar-border sm:rounded-2xl rounded-t-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 space-y-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-3 right-3 p-1.5 rounded-lg text-themed-muted hover:text-themed touch-manipulation"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-[var(--color-gold)]/15 text-gold flex items-center justify-center shrink-0">
              <RefreshCw size={18} />
            </span>
            <h3 className="text-base font-semibold text-themed">
              Keep your progress safe
            </h3>
          </div>
          <p className="text-themed-muted text-[13px] leading-relaxed">
            Your progress is saved on this device. Sign in — it&rsquo;s free — to keep
            your checklist, streaks, and memorization across your devices, so you
            never lose them.
          </p>
          <Link
            href={`/signin?next=${encodeURIComponent(pathname)}`}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 rounded-xl py-3 font-semibold active:bg-[var(--color-gold)]/30 touch-manipulation"
          >
            Create account or sign in
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full text-xs text-themed-muted active:text-themed py-1 touch-manipulation"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
