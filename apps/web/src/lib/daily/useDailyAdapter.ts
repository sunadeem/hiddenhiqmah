"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { createLocalDailyAdapter } from "@hidden-hiqmah/ui/lib/daily/localAdapter";
import { toLocalDateString, type DailyAdapter } from "@hidden-hiqmah/ui/lib/daily/types";
import { createSupabaseDailyAdapter } from "@/lib/daily/supabaseDailyAdapter";
import { requireAccount } from "@/lib/requireAccount";
import {
  PRIMARY_ID,
  PROFILE_CHANGED_EVENT,
  dailyStoreKeyForProfile,
  getActiveProfileId,
} from "@/lib/household";

// Wraps a device-local DailyAdapter so user-initiated WRITES require an account
// on web (the soft-gate). Reads + internal ops (ensureSeeded, recomputeStreaks,
// getDay materialization) are untouched, so nothing prompts on page load. For
// signed-in users requireAccount() returns true → a no-op (also used for the
// child-profile local adapter, where the parent is signed in).
function gateLocalAdapter(base: DailyAdapter): DailyAdapter {
  const SAVE = {
    title: "Save your progress",
    message:
      "Create a free account to save your daily progress and streaks across your devices.",
  };
  const ok = () => requireAccount(SAVE);
  return {
    ...base,
    addItem: async (input) => {
      if (ok()) await base.addItem(input);
    },
    editItem: async (id, patch) => {
      if (ok()) await base.editItem(id, patch);
    },
    removeItem: async (id) => {
      if (ok()) await base.removeItem(id);
    },
    reorderItems: async (ids) => {
      if (ok()) await base.reorderItems(ids);
    },
    setDone: async (d, u, done) => {
      if (ok()) await base.setDone(d, u, done);
    },
    setCount: async (d, u, c) => {
      if (ok()) await base.setCount(d, u, c);
    },
    incrementDhikr: async (k, d, delta) =>
      ok() ? base.incrementDhikr(k, d, delta) : base.getDhikr(k, d),
    setDhikrCount: async (k, d, c) =>
      ok() ? base.setDhikrCount(k, d, c) : base.getDhikr(k, d),
    startPause: async (r, t) => {
      if (ok()) await base.startPause(r, t);
    },
    endPause: async (t) => {
      if (ok()) await base.endPause(t);
    },
  };
}

/**
 * Picks the DailyAdapter based on auth state + the active household profile:
 *   - A non-primary (child) profile → a device-only LOCAL adapter namespaced to
 *     that profile, regardless of sign-in (kids on a shared device).
 *   - The primary profile → Supabase (synced) when signed in, else local.
 * With no extra profiles the active id is always primary, so this is identical
 * to the original behaviour.
 */
export function useDailyAdapter(): {
  adapter: DailyAdapter;
  signedIn: boolean;
  authLoading: boolean;
} {
  const { user, loading } = useAuth();
  const [activeId, setActiveId] = useState<string>(PRIMARY_ID);

  useEffect(() => {
    setActiveId(getActiveProfileId());
    const onChange = () => setActiveId(getActiveProfileId());
    window.addEventListener(PROFILE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(PROFILE_CHANGED_EVENT, onChange);
  }, []);

  const adapter = useMemo<DailyAdapter>(() => {
    const childKey = dailyStoreKeyForProfile(activeId);
    if (childKey) return gateLocalAdapter(createLocalDailyAdapter(childKey));
    if (!user) return gateLocalAdapter(createLocalDailyAdapter());
    const start = user.created_at ? toLocalDateString(new Date(user.created_at)) : null;
    return createSupabaseDailyAdapter(supabase, user.id, start);
  }, [user, activeId]);

  return { adapter, signedIn: !!user, authLoading: loading };
}
