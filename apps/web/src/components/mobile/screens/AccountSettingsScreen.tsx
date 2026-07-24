"use client";

import { useEffect, useState } from "react";
import {
  User,
  Database,
  Trash2,
  Shield,
  ScrollText,
  BookOpen,
  Pencil,
  Sparkles,
  UserX,
  X,
} from "lucide-react";
import { SettingsSection, SettingsRow } from "./SettingsUI";
import { useAuth } from "@/context/AuthContext";
import { useIsNative } from "@/lib/mobile/platform";
import { clearAllLocalData } from "@hidden-hiqmah/ui/lib/storage";
import { getMyBlockedUsers, unblockCircleUser } from "@/lib/circles";
import { hapticMedium } from "@/lib/mobile/haptics";
import { resetPageTips } from "@/components/mobile/PageTip";

// Account + Data & Privacy, moved out of the main Settings screen into their own
// nested page (/settings/account). Every row keeps its exact handlers and keys.
export default function AccountSettingsScreen() {
  const { user, loading: authLoading, signOut } = useAuth();
  const isNative = useIsNative();
  const [editingProfile, setEditingProfile] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [managingBlocks, setManagingBlocks] = useState(false);
  const [tipsMsg, setTipsMsg] = useState<string | null>(null);

  const resetTips = () => {
    hapticMedium();
    resetPageTips();
    setTipsMsg("Page tips reset — open a feature page to see them.");
    window.setTimeout(() => setTipsMsg(null), 4000);
  };

  const meta = (user?.user_metadata ?? {}) as {
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  const displayName =
    meta.full_name ||
    [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
    "";

  return (
    <div className="space-y-5 pb-6 max-w-xl mx-auto w-full">
      {/* Header (this screen doesn't get MobileTopBar title) */}
      <div className="text-center pt-1">
        <h1 className="text-2xl font-bold text-themed">Account</h1>
      </div>

      {/* ACCOUNT */}
      <SettingsSection heading="Account">
        {authLoading ? (
          <SettingsRow icon={User} title="Loading..." disabled />
        ) : user ? (
          <>
            <SettingsRow
              icon={User}
              title={displayName || user.email || "Signed in"}
              subtitle={displayName ? user.email : undefined}
              rightValue="Signed in"
            />
            <SettingsRow
              icon={Pencil}
              title="Edit profile"
              subtitle="Update your name"
              rightChevron
              onClick={() => setEditingProfile(true)}
            />
            <SettingsRow
              icon={UserX}
              title="Blocked accounts"
              subtitle="People you've blocked in Circles"
              rightChevron
              onClick={() => setManagingBlocks(true)}
            />
            <SettingsRow
              icon={Database}
              title="Sign out"
              onClick={async () => {
                await signOut();
              }}
              danger
            />
            <SettingsRow
              icon={Trash2}
              title="Delete account"
              subtitle="Permanently erase your account & data"
              onClick={() => setDeleting(true)}
              danger
            />
          </>
        ) : (
          <SettingsRow
            icon={User}
            title="Sign in"
            subtitle="More Ask Hiqmah questions · sync across devices"
            rightChevron
            href="/signin"
          />
        )}
      </SettingsSection>

      {/* DATA & PRIVACY */}
      <SettingsSection heading="Data & Privacy">
        <SettingsRow
          icon={Shield}
          title="Privacy"
          rightChevron
          href="/privacy"
        />
        <SettingsRow
          icon={ScrollText}
          title="Terms of Use"
          rightChevron
          href="/terms"
        />
        <SettingsRow
          icon={BookOpen}
          title="Credits & Sources"
          rightChevron
          href="/credits"
        />
        {isNative && (
          <SettingsRow
            icon={Sparkles}
            title="Reset page tips"
            subtitle="Show the first-time tips again"
            rightValue="Reset"
            onClick={resetTips}
          />
        )}
        {tipsMsg && (
          <div className="px-3 py-2 text-xs text-gold text-center">{tipsMsg}</div>
        )}
        <SettingsRow
          icon={Trash2}
          title="Clear local data"
          subtitle="Bookmarks, streaks, settings — all reset"
          danger
          onClick={() => {
            if (
              confirm(
                "Clear all local data? Bookmarks, streaks, reading progress, and settings will be erased. This cannot be undone."
              )
            ) {
              clearAllLocalData();
              window.location.reload();
            }
          }}
        />
      </SettingsSection>

      {editingProfile && (
        <EditProfileDialog
          initialFirst={meta.first_name ?? ""}
          initialLast={meta.last_name ?? ""}
          onClose={() => setEditingProfile(false)}
        />
      )}

      {deleting && <DeleteAccountDialog onClose={() => setDeleting(false)} />}

      {managingBlocks && (
        <BlockedAccountsDialog onClose={() => setManagingBlocks(false)} />
      )}
    </div>
  );
}

function BlockedAccountsDialog({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState<{ id: string; name: string }[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getMyBlockedUsers()
      .then((rows) => alive && setBlocked(rows))
      .catch(() => alive && setBlocked([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const unblock = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    try {
      await unblockCircleUser(id);
      setBlocked((rows) => rows.filter((r) => r.id !== id));
    } catch {
      // leave the row in place; the user can retry
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full sm:max-w-md bg-themed border-t sm:border sidebar-border sm:rounded-2xl rounded-t-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sidebar-border">
          <h3 className="text-base font-semibold text-themed">Blocked accounts</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-themed-muted hover:text-themed touch-manipulation"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-center text-themed-muted text-sm py-6">Loading…</p>
          ) : blocked.length === 0 ? (
            <p className="text-center text-themed-muted text-sm py-6 leading-relaxed">
              You haven&apos;t blocked anyone. Blocking hides a person&apos;s
              messages and activity across your circles.
            </p>
          ) : (
            <ul className="space-y-2">
              {blocked.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center gap-3 card-bg rounded-xl border sidebar-border px-3 py-2.5"
                >
                  <span className="w-8 h-8 rounded-full bg-[var(--overlay-strong)] text-themed-muted flex items-center justify-center shrink-0">
                    <UserX size={16} />
                  </span>
                  <span className="flex-1 min-w-0 text-sm text-themed truncate">
                    {b.name}
                  </span>
                  <button
                    type="button"
                    disabled={busyId === b.id}
                    onClick={() => unblock(b.id)}
                    className="text-xs font-medium text-gold border border-[var(--color-gold)]/30 rounded-lg px-3 py-1.5 active:bg-[var(--color-gold)]/10 disabled:opacity-50 touch-manipulation"
                  >
                    {busyId === b.id ? "…" : "Unblock"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const { deleteAccount } = useAuth();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ok = confirm.trim().toUpperCase() === "DELETE";

  const run = async () => {
    if (!ok || busy) return;
    setBusy(true);
    setErr("");
    try {
      await deleteAccount();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't delete the account. Try again.");
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
      onClick={() => !busy && onClose()}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full sm:max-w-md bg-themed border-t sm:border sidebar-border sm:rounded-2xl rounded-t-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
              <Trash2 size={18} />
            </span>
            <h3 className="text-base font-semibold text-themed">Delete account</h3>
          </div>
          <p className="text-themed-muted text-[13px] leading-relaxed">
            This permanently deletes your account and all your data — Hifz progress, daily
            checklist &amp; streaks, circles you own, and saved reflections. It can&rsquo;t be
            undone.
          </p>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-themed-muted">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              autoCapitalize="characters"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              className="mt-1.5 w-full bg-[var(--overlay-subtle)] border sidebar-border rounded-xl px-3 py-2.5 text-base text-themed tracking-widest focus:outline-none focus:border-red-400/50"
            />
          </div>
          {err && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">
              {err}
            </div>
          )}
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => !busy && onClose()}
              className="flex-1 rounded-xl border sidebar-border py-3 text-sm text-themed-muted disabled:opacity-50 touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!ok || busy}
              onClick={run}
              className="flex-1 rounded-xl bg-red-500 text-white font-bold py-3 disabled:opacity-40 touch-manipulation"
            >
              {busy ? "Deleting…" : "Delete forever"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditProfileDialog({
  initialFirst,
  initialLast,
  onClose,
}: {
  initialFirst: string;
  initialLast: string;
  onClose: () => void;
}) {
  const { updateProfile } = useAuth();
  const [first, setFirst] = useState(initialFirst);
  const [last, setLast] = useState(initialLast);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!first.trim() || !last.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await updateProfile({ firstName: first, lastName: last });
    setBusy(false);
    if (res.error) setError(res.error);
    else onClose();
  };

  const inputCls =
    "mt-1 w-full card-bg border sidebar-border rounded-lg px-3 py-2 text-base text-themed outline-none focus:border-[var(--color-gold)]/50";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full sm:max-w-sm bg-themed border-t sm:border sidebar-border sm:rounded-2xl rounded-t-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sidebar-border">
          <h3 className="text-base font-semibold text-themed">Edit profile</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-themed-muted hover:text-themed touch-manipulation"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-themed-muted">First name</span>
              <input
                autoFocus
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="text-xs text-themed-muted">Last name</span>
              <input
                value={last}
                onChange={(e) => setLast(e.target.value)}
                className={inputCls}
              />
            </label>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="w-full rounded-xl py-3 font-semibold bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 active:bg-[var(--color-gold)]/30 disabled:opacity-50 touch-manipulation"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
