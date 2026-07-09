"use client";

import { useState } from "react";
import { X, Loader2, Settings2 } from "lucide-react";
import {
  renameCircle,
  updateCircleGoal,
  setCircleRanking,
  transferOwnership,
  type Circle,
  type CircleMember,
} from "@/lib/circles";
import { GoalStepper } from "@/components/dhikr/DhikrEditing";

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return "Something went wrong.";
}

const GOAL_TYPES: { key: string; label: string; unit: string }[] = [
  { key: "khatmah", label: "Khatmah", unit: "juz" },
  { key: "hifz", label: "Hifz", unit: "surah" },
  { key: "custom", label: "Custom", unit: "days" },
];

/** Owner-only modal: rename the circle + edit its shared goal. */
export default function CircleManageSheet({
  open,
  onClose,
  circle,
  members,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  circle: Circle;
  members: CircleMember[];
  onSaved: () => void;
}) {
  const [name, setName] = useState(circle.name);
  const [goalType, setGoalType] = useState(circle.goal_type);
  const [goalUnit, setGoalUnit] = useState(circle.goal_unit);
  const [goalTarget, setGoalTarget] = useState(circle.goal_target);
  const [ranking, setRanking] = useState(circle.ranking_enabled === true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!open) return null;

  const transferable = members.filter((m) => m.role !== "owner");
  const transferTo = async (m: CircleMember) => {
    if (!confirm(`Make ${m.display_name} the owner? You'll become a regular member.`)) return;
    setBusy(true);
    setErr("");
    try {
      await transferOwnership(circle.id, m.user_id);
      onSaved();
      onClose();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setErr("");
    try {
      const trimmed = name.trim() || "My Circle";
      if (trimmed !== circle.name) await renameCircle(circle.id, trimmed);
      if (
        goalType !== circle.goal_type ||
        goalUnit.trim() !== circle.goal_unit ||
        goalTarget !== circle.goal_target
      ) {
        await updateCircleGoal(circle.id, goalType, goalUnit.trim() || "juz", goalTarget);
      }
      if (ranking !== (circle.ranking_enabled === true)) {
        await setCircleRanking(circle.id, ranking);
      }
      onSaved();
      onClose();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full sm:max-w-md bg-themed border-t sm:border sidebar-border sm:rounded-2xl rounded-t-2xl max-h-[88vh] flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sidebar-border">
          <h3 className="text-base font-semibold text-themed flex items-center gap-2">
            <Settings2 size={16} className="text-gold" /> Manage circle
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-themed-muted hover:text-themed touch-manipulation"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {err && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">
              {err}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider text-themed-muted">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Circle name"
              className="w-full bg-[var(--overlay-subtle)] border sidebar-border rounded-xl px-3 py-2.5 text-base text-themed placeholder:text-themed-muted/60 focus:outline-none focus:border-[var(--color-gold)]/40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider text-themed-muted">Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_TYPES.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => {
                    setGoalType(g.key);
                    // Suggest a sensible unit when switching type (owner can override).
                    if (goalUnit === circle.goal_unit) setGoalUnit(g.unit);
                  }}
                  className={`rounded-xl py-2.5 text-sm font-semibold border touch-manipulation ${
                    goalType === g.key
                      ? "bg-[var(--color-gold)]/18 text-gold border-[var(--color-gold)]/40"
                      : "text-themed-muted border-[var(--color-border)] active:bg-[var(--overlay-subtle)]"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-themed-muted">Unit</label>
            <input
              type="text"
              value={goalUnit}
              onChange={(e) => setGoalUnit(e.target.value)}
              placeholder="juz"
              className="w-32 bg-[var(--overlay-subtle)] border sidebar-border rounded-xl px-3 py-2 text-sm text-themed text-center focus:outline-none focus:border-[var(--color-gold)]/40"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-themed-muted">Target</label>
            <GoalStepper value={goalTarget} onChange={setGoalTarget} />
          </div>

          <p className="text-[11px] text-themed-muted/70 leading-relaxed">
            The target is the shared goal — everyone&apos;s contributions add toward it.
          </p>

          {/* Competitive ranking — off by default (gentle "Members" view). */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="min-w-0">
              <p className="text-sm text-themed">Show ranking</p>
              <p className="text-[11px] text-themed-muted/80 leading-snug mt-0.5">
                Off shows members without a leaderboard, crown, or rank numbers.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={ranking}
              onClick={() => setRanking((v) => !v)}
              className={`shrink-0 w-11 h-6 rounded-full relative transition-colors touch-manipulation ${
                ranking ? "bg-[var(--color-gold)]" : "bg-[var(--overlay-medium)]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                  ranking ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Transfer ownership to another member. */}
          {transferable.length > 0 && (
            <div className="space-y-2 pt-1">
              <label className="text-[11px] uppercase tracking-wider text-themed-muted">
                Transfer ownership
              </label>
              <p className="text-[11px] text-themed-muted/80 leading-snug">
                Hand the circle to another member. You&apos;ll become a regular member.
              </p>
              <div className="space-y-1.5">
                {transferable.map((m) => (
                  <button
                    key={m.user_id}
                    type="button"
                    disabled={busy}
                    onClick={() => transferTo(m)}
                    className="w-full flex items-center justify-between gap-2 rounded-xl border sidebar-border px-3 py-2.5 text-left touch-manipulation active:bg-[var(--overlay-subtle)] disabled:opacity-60"
                  >
                    <span className="text-sm text-themed truncate">{m.display_name}</span>
                    <span className="text-[12px] text-gold font-semibold shrink-0">Make owner</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t sidebar-border">
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="w-full rounded-xl bg-gold text-[#0a1628] font-bold py-3 disabled:opacity-60 flex items-center justify-center gap-2 touch-manipulation"
          >
            {busy && <Loader2 size={16} className="animate-spin" />} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
