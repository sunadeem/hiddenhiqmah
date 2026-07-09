"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Check, Trash2, Flame, UserPlus, X, BookOpen, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { requireAccount } from "@/lib/requireAccount";
import { createCircle, generateInvite } from "@/lib/circles";
import { createLocalDailyAdapter } from "@hidden-hiqmah/ui/lib/daily/localAdapter";
import { createSupabaseDailyAdapter } from "@/lib/daily/supabaseDailyAdapter";
import { todayLocalDate, toLocalDateString, type DailyAdapter } from "@hidden-hiqmah/ui/lib/daily/types";
import type { User } from "@supabase/supabase-js";
import {
  getProfiles,
  getActiveProfileId,
  setActiveProfileId,
  addProfile,
  removeProfile,
  dailyStoreKeyForProfile,
  PRIMARY_ID,
  PROFILE_CHANGED_EVENT,
  type Profile,
  type ProfileKind,
} from "@/lib/household";
import { ProfileAvatarContent, PROFILE_ICONS, initialsOf } from "../ProfileAvatar";

type Stat = { done: number; total: number; streak: number };

function adapterForProfile(p: Profile, user: User | null): DailyAdapter {
  const childKey = dailyStoreKeyForProfile(p.id);
  if (childKey) return createLocalDailyAdapter(childKey);
  if (!user) return createLocalDailyAdapter();
  const start = user.created_at ? toLocalDateString(new Date(user.created_at)) : null;
  return createSupabaseDailyAdapter(supabase, user.id, start);
}

async function statsFor(adapter: DailyAdapter): Promise<Stat> {
  const today = todayLocalDate();
  let done = 0,
    total = 0,
    streak = 0;
  try {
    await adapter.ensureSeeded();
    const rollups = await adapter.getDayRollups(today, today);
    if (rollups.length > 0) {
      done = rollups[0].doneItems;
      total = rollups[0].totalItems;
    } else {
      const items = await adapter.getUserItems();
      total = items.filter((i) => i.isActive).length;
    }
    streak = (await adapter.getStreaks()).overallCurrent;
  } catch {
    /* leave zeros */
  }
  return { done, total, streak };
}

export default function HouseholdScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [khBusy, setKhBusy] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState(PRIMARY_ID);
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ProfileKind>("child");
  const [avatar, setAvatar] = useState(""); // "" = initials (default); else an icon key

  const refresh = useCallback(() => {
    setProfiles(getProfiles());
    setActiveId(getActiveProfileId());
  }, []);

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener(PROFILE_CHANGED_EVENT, h);
    return () => window.removeEventListener(PROFILE_CHANGED_EVENT, h);
  }, [refresh]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const entries = await Promise.all(
        profiles.map(async (p) => [p.id, await statsFor(adapterForProfile(p, user))] as const)
      );
      if (alive) setStats(Object.fromEntries(entries));
    })();
    return () => {
      alive = false;
    };
  }, [profiles, user]);

  const submitAdd = () => {
    if (
      !requireAccount({
        title: "Add a family profile",
        message:
          "Create a free account to add family profiles and track everyone's progress.",
      })
    ) {
      return;
    }
    addProfile({ name: name.trim() || "Child", kind, avatar: avatar || undefined });
    setName("");
    setKind("child");
    setAvatar("");
    setAdding(false);
  };

  // Bridge Household → Circles: spin up a shared family khatmah, then hand off to
  // the Circles screen to share the code. (Local child profiles can't be members —
  // circle membership needs a real account — so this recruits by invite code.)
  const startFamilyKhatmah = async () => {
    if (
      !requireAccount({
        title: "Start a Family Khatmah",
        message: "Create a free account to start a shared circle your family can join.",
      })
    ) {
      return;
    }
    setKhBusy(true);
    try {
      const id = await createCircle("Family Khatmah", 30, "khatmah", "juz");
      try {
        await generateInvite(id);
      } catch {
        /* the code can also be generated on the Circles screen */
      }
      router.push("/circles");
    } catch {
      setKhBusy(false);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-themed">Family</h1>
        <p className="text-themed-muted text-sm mt-1 leading-relaxed">
          Add a profile for each child on this device. Each keeps its own daily
          checklist &amp; streak — switch to track theirs.
        </p>
      </div>

      {/* Start a Family Khatmah — bridge into Circles. */}
      <button
        type="button"
        disabled={khBusy}
        onClick={startFamilyKhatmah}
        className="w-full card-bg rounded-2xl border sidebar-border p-4 flex items-center gap-3 text-left relative overflow-hidden touch-manipulation active:opacity-90 disabled:opacity-60"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/8 to-transparent pointer-events-none" />
        <div className="relative w-10 h-10 rounded-full bg-[var(--color-gold)]/15 text-gold flex items-center justify-center shrink-0">
          <BookOpen size={18} />
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="text-themed font-semibold text-sm">Start a Family Khatmah</p>
          <p className="text-themed-muted text-[11.5px] leading-snug mt-0.5">
            Finish the Qur&apos;an together — create a circle and share the code with
            family (each needs their own account).
          </p>
        </div>
        <ChevronRight size={18} className="relative text-themed-muted shrink-0" />
      </button>

      {/* Switcher */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {profiles.map((p) => {
          const active = p.id === activeId;
          return (
            <button
              key={p.id}
              onClick={() => setActiveProfileId(p.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 w-16 touch-manipulation"
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-2 transition-colors ${
                  active
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]/15 text-gold"
                    : "border-transparent bg-[var(--overlay-subtle)] text-themed-muted"
                }`}
              >
                <ProfileAvatarContent profile={p} iconSize={22} />
              </div>
              <span className={`text-[11px] font-medium truncate max-w-full ${active ? "text-gold" : "text-themed-muted"}`}>
                {p.id === PRIMARY_ID ? "You" : p.name}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex flex-col items-center gap-1.5 shrink-0 w-16 touch-manipulation"
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-dashed sidebar-border text-themed-muted">
            <Plus size={22} />
          </div>
          <span className="text-[11px] font-medium text-themed-muted">Add</span>
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card-bg rounded-2xl border sidebar-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-themed">New profile</p>
            <button onClick={() => setAdding(false)} className="text-themed-muted">
              <X size={18} />
            </button>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full bg-[var(--overlay-subtle)] border sidebar-border rounded-xl px-3 py-2.5 text-base text-themed placeholder:text-themed-muted/60 focus:outline-none focus:border-[var(--color-gold)]/40"
          />
          <div className="flex gap-2">
            {(["child", "adult"] as ProfileKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize ${
                  kind === k ? "bg-[var(--color-gold)]/18 text-gold" : "bg-[var(--overlay-subtle)] text-themed-muted"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setAvatar("")}
              aria-label="Use initials"
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                avatar === ""
                  ? "bg-[var(--color-gold)]/20 ring-2 ring-[var(--color-gold)] text-gold"
                  : "bg-[var(--overlay-subtle)] text-themed-muted"
              }`}
            >
              {initialsOf(name || "Child")}
            </button>
            {PROFILE_ICONS.map(({ key, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setAvatar(key)}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  avatar === key
                    ? "bg-[var(--color-gold)]/20 ring-2 ring-[var(--color-gold)] text-gold"
                    : "bg-[var(--overlay-subtle)] text-themed-muted"
                }`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
          <button
            onClick={submitAdd}
            className="w-full rounded-xl bg-gold text-[#0a1628] font-bold py-3"
          >
            Add profile
          </button>
        </div>
      )}

      {/* Dashboard */}
      <div className="space-y-2.5">
        {profiles.map((p) => {
          const st = stats[p.id];
          const active = p.id === activeId;
          return (
            <div
              key={p.id}
              className={`card-bg rounded-2xl border p-4 flex items-center gap-3 ${
                active ? "border-[var(--color-gold)]/40" : "sidebar-border"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-[var(--color-gold)]/15 text-gold flex items-center justify-center text-lg font-bold shrink-0">
                <ProfileAvatarContent profile={p} iconSize={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-themed font-semibold text-sm leading-tight truncate">
                  {p.id === PRIMARY_ID ? "You" : p.name}
                  {active && <span className="text-gold/70 text-[11px] font-normal"> · viewing</span>}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-themed-muted">
                  <span>{st ? `Today ${st.done}/${st.total}` : "…"}</span>
                  {st && st.streak > 0 && (
                    <span className="inline-flex items-center gap-1 text-gold">
                      <Flame size={12} /> {st.streak}
                    </span>
                  )}
                </div>
              </div>
              {active ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold shrink-0">
                  <Check size={14} /> Active
                </span>
              ) : (
                <button
                  onClick={() => setActiveProfileId(p.id)}
                  className="text-xs font-semibold text-gold rounded-full border border-[var(--color-gold)]/30 px-3 py-1.5 shrink-0"
                >
                  Switch
                </button>
              )}
              {p.id !== PRIMARY_ID && (
                <button
                  onClick={() => {
                    if (confirm(`Remove ${p.name}'s profile? Their data stays on the device but is hidden.`)) {
                      removeProfile(p.id);
                    }
                  }}
                  className="text-themed-muted/60 shrink-0 ml-1"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="card-bg rounded-2xl border sidebar-border p-4">
        <p className="text-xs text-themed-muted leading-relaxed">
          <span className="font-semibold text-gold">Local to this device.</span> Child
          profiles live on this phone — great for a shared family device. Your own
          profile syncs to your account when signed in. (A class/teacher dashboard
          for students with their own accounts is coming separately.)
        </p>
      </div>

      <p className="text-[11px] text-themed-muted/70 text-center flex items-center justify-center gap-1.5">
        <UserPlus size={12} /> More family features in progress
      </p>
    </div>
  );
}
