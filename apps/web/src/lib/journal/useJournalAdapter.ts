"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { createLocalJournalAdapter } from "@/lib/journal/localJournalAdapter";
import { createSupabaseJournalAdapter } from "@/lib/journal/supabaseJournalAdapter";
import type { JournalAdapter } from "@/lib/journal/types";
import {
  PRIMARY_ID,
  PROFILE_CHANGED_EVENT,
  getActiveProfileId,
  journalStoreKeyForProfile,
} from "@/lib/household";

/**
 * Picks the Journal adapter based on auth state + the active household profile
 * (mirrors useHifzAdapter / useDailyAdapter):
 *   - A non-primary (child) profile → a device-only LOCAL adapter namespaced to
 *     that profile, regardless of sign-in (kids on a shared device).
 *   - The primary profile → Supabase (synced) when signed in, else local.
 * A reflection journal works entirely on-device when signed out (no account gate),
 * and syncs across devices once the primary user signs in. With no extra profiles
 * the active id is always primary. Requires migration 028_journal_entries.sql for
 * the synced path.
 */
export function useJournalAdapter(): {
  adapter: JournalAdapter;
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

  const adapter = useMemo<JournalAdapter>(() => {
    const childKey = journalStoreKeyForProfile(activeId);
    if (childKey) return createLocalJournalAdapter(childKey);
    if (!user) return createLocalJournalAdapter();
    return createSupabaseJournalAdapter(supabase, user.id);
  }, [user, activeId]);

  return { adapter, signedIn: !!user, authLoading: loading };
}
