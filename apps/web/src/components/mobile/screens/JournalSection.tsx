"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, BookOpen, Sparkles } from "lucide-react";
import { useJournalAdapter } from "@/lib/journal/useJournalAdapter";
import type { JournalEntry } from "@/lib/journal/types";
import { hapticLight, hapticSelection, hapticSuccess } from "@/lib/mobile/haptics";
import { Skeleton } from "@hidden-hiqmah/ui/components/Skeleton";

/**
 * A draft handed to the journal from a reminder card ("Write a reflection"). Bump
 * `nonce` to (re)open the composer pre-linked to that reminder.
 */
export interface JournalDraft {
  ref: string | null; // reminder id (linked_ref)
  label: string | null; // human label, e.g. "Qur'an 94:5"
  nonce: number;
}

interface ComposerState {
  mode: "new" | "edit";
  id?: string;
  body: string;
  linkedRef: string | null;
  linkedLabel: string | null;
}

/** Friendly, dated header for an entry (newest-first list). */
function formatEntryDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOf(now) - startOf(d)) / 86400000);
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  let day: string;
  if (dayDiff === 0) day = "Today";
  else if (dayDiff === 1) day = "Yesterday";
  else
    day = d.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      ...(d.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
    });
  return `${day} · ${time}`;
}

/**
 * The reflection journal that lives inside the Reminders screen. Free-form, dated,
 * newest-first entries with edit + delete. Entries can be standalone (the "+") or
 * written from a reminder / verse (pre-linked via `draft`). Persists through the
 * JournalAdapter — Supabase when signed in, localStorage when not.
 */
export default function JournalSection({
  draft,
  onDraftConsumed,
}: {
  draft?: JournalDraft | null;
  onDraftConsumed?: () => void;
}) {
  const { adapter, signedIn, authLoading } = useJournalAdapter();
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);
  const [composer, setComposer] = useState<ComposerState | null>(null);
  const [busy, setBusy] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const reload = useCallback(async () => {
    try {
      setEntries(await adapter.list());
    } catch {
      setEntries([]);
    }
  }, [adapter]);

  useEffect(() => {
    setEntries(null);
    void reload();
  }, [reload]);

  // A reminder's "Write a reflection" hands us a draft → open the composer prefilled.
  const draftNonce = draft?.nonce;
  useEffect(() => {
    if (!draft) return;
    setComposer({
      mode: "new",
      body: "",
      linkedRef: draft.ref,
      linkedLabel: draft.label,
    });
    onDraftConsumed?.();
    // Only react to a new draft (nonce), not to identity churn of the handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftNonce]);

  // Focus the textarea when the composer opens.
  useEffect(() => {
    if (composer) {
      const t = setTimeout(() => textareaRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [composer]);

  const openNew = () => {
    hapticLight();
    setComposer({ mode: "new", body: "", linkedRef: null, linkedLabel: null });
  };

  const openEdit = (e: JournalEntry) => {
    hapticLight();
    setComposer({
      mode: "edit",
      id: e.id,
      body: e.body,
      linkedRef: e.linkedRef,
      linkedLabel: e.linkedLabel,
    });
  };

  const closeComposer = () => setComposer(null);

  const save = async () => {
    if (!composer) return;
    const body = composer.body.trim();
    if (!body || busy) return;
    setBusy(true);
    try {
      if (composer.mode === "edit" && composer.id) {
        await adapter.update(composer.id, { body });
      } else {
        await adapter.add({
          body,
          linkedRef: composer.linkedRef,
          linkedLabel: composer.linkedLabel,
        });
      }
      hapticSuccess();
      setComposer(null);
      await reload();
    } catch {
      // Keep the composer open so the writing isn't lost on a transient failure.
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!composer?.id || busy) return;
    setBusy(true);
    try {
      await adapter.remove(composer.id);
      hapticSelection();
      setComposer(null);
      await reload();
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  const canSave = composer ? composer.body.trim().length > 0 && !busy : false;

  return (
    <div className="space-y-4">
      {!signedIn && (
        <p className="card-bg rounded-2xl border sidebar-border px-4 py-3 text-sm text-themed-muted">
          Your journal is saved on this device.{" "}
          <Link href="/signin" className="text-gold font-semibold">
            Sign in
          </Link>{" "}
          to sync your reflections across devices.
        </p>
      )}

      {/* Header + new-entry affordance */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-themed-muted">
          {entries && entries.length > 0
            ? `${entries.length} ${entries.length === 1 ? "reflection" : "reflections"}`
            : "Your reflections"}
        </span>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold touch-manipulation"
        >
          <Plus size={16} /> New
        </button>
      </div>

      {authLoading || entries === null ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : entries.length === 0 ? (
        <div className="card-bg rounded-2xl border sidebar-border p-8 text-center">
          <BookOpen size={22} className="text-gold mx-auto mb-2" />
          <p className="text-themed font-semibold">Start your reflection journal</p>
          <p className="text-themed-muted text-sm mt-1">
            Tap <span className="text-gold font-medium">New</span> to write freely, or use{" "}
            <span className="text-gold font-medium">Write a reflection</span> on any reminder to
            capture what it stirred.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => openEdit(e)}
                className="w-full text-left card-bg rounded-2xl border sidebar-border p-4 touch-manipulation"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-themed-muted">
                    {formatEntryDate(e.createdAt)}
                  </span>
                  <Pencil size={13} className="shrink-0 text-themed-muted" />
                </div>
                {e.linkedLabel && (
                  <span className="inline-flex items-center gap-1 mb-2 px-2 py-0.5 rounded-full bg-[var(--color-gold)]/12 text-gold text-[11px] font-medium">
                    <Sparkles size={10} /> {e.linkedLabel}
                  </span>
                )}
                <p className="text-themed text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
                  {e.body}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Full-screen composer (matches ChecklistEditor's overlay pattern) */}
      <AnimatePresence>
        {composer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-themed overflow-y-auto"
            style={{
              paddingTop: "max(env(safe-area-inset-top), 60px)",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
              overscrollBehavior: "contain",
            }}
          >
            <div className="px-4 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={closeComposer}
                  className="inline-flex items-center gap-1.5 text-sm text-themed-muted touch-manipulation"
                  aria-label="Cancel"
                >
                  <X size={18} /> Cancel
                </button>
                <h2 className="text-base font-bold text-themed">
                  {composer.mode === "edit" ? "Edit reflection" : "New reflection"}
                </h2>
                <button
                  type="button"
                  onClick={save}
                  disabled={!canSave}
                  className={`text-sm font-semibold touch-manipulation ${
                    canSave ? "text-gold" : "text-themed-muted opacity-40"
                  }`}
                >
                  Save
                </button>
              </div>

              {composer.linkedLabel && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20">
                  <Sparkles size={14} className="text-gold shrink-0" />
                  <span className="text-sm text-themed">
                    Reflecting on{" "}
                    <span className="text-gold font-medium">{composer.linkedLabel}</span>
                  </span>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={composer.body}
                onChange={(ev) =>
                  setComposer((c) => (c ? { ...c, body: ev.target.value } : c))
                }
                placeholder="Write freely — what is on your heart, what you noticed, what you want to change…"
                className="w-full min-h-[45vh] resize-none rounded-2xl card-bg border sidebar-border p-4 text-themed text-[15px] leading-relaxed outline-none focus:border-[var(--color-gold)]/40"
              />

              {composer.mode === "edit" && (
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-500/30 text-red-400 text-sm font-semibold touch-manipulation disabled:opacity-40"
                >
                  <Trash2 size={16} /> Delete reflection
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
