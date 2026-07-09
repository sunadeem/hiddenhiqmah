"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { createLocalHifzAdapter } from "@hidden-hiqmah/ui/lib/hifz/localAdapter";
import { createSupabaseHifzAdapter } from "@/lib/hifz/supabaseHifzAdapter";
import type { HifzAdapter } from "@hidden-hiqmah/ui/lib/hifz/types";
import {
  PRIMARY_ID,
  PROFILE_CHANGED_EVENT,
  getActiveProfileId,
  hifzStoreKeyForProfile,
} from "@/lib/household";

/**
 * Picks the Hifz adapter based on auth state + the active household profile
 * (mirrors useDailyAdapter):
 *   - A non-primary (child) profile → a device-only LOCAL adapter namespaced to
 *     that profile, regardless of sign-in (kids on a shared device).
 *   - The primary profile → Supabase (synced) when signed in, else local.
 * Hifz progress is precious long-term data, so signed-in primary users always
 * sync. With no extra profiles the active id is always primary, so this is
 * identical to the original behaviour. Requires migrations 010/016 for the
 * synced path.
 */
export function useHifzAdapter(): {
  adapter: HifzAdapter;
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

  const adapter = useMemo<HifzAdapter>(() => {
    const childKey = hifzStoreKeyForProfile(activeId);
    if (childKey) return createLocalHifzAdapter(childKey);
    if (!user) return createLocalHifzAdapter();
    return createSupabaseHifzAdapter(supabase, user.id);
  }, [user, activeId]);

  return { adapter, signedIn: !!user, authLoading: loading };
}
