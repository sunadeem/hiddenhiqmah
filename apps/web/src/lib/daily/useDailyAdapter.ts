"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { createLocalDailyAdapter } from "@hidden-hiqmah/ui/lib/daily/localAdapter";
import { toLocalDateString, type DailyAdapter } from "@hidden-hiqmah/ui/lib/daily/types";
import { createSupabaseDailyAdapter } from "@/lib/daily/supabaseDailyAdapter";
import {
  PRIMARY_ID,
  PROFILE_CHANGED_EVENT,
  dailyStoreKeyForProfile,
  getActiveProfileId,
} from "@/lib/household";

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
    if (childKey) return createLocalDailyAdapter(childKey);
    if (!user) return createLocalDailyAdapter();
    const start = user.created_at ? toLocalDateString(new Date(user.created_at)) : null;
    return createSupabaseDailyAdapter(supabase, user.id, start);
  }, [user, activeId]);

  return { adapter, signedIn: !!user, authLoading: loading };
}
