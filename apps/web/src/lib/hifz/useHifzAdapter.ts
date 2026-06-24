"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { createLocalHifzAdapter } from "@hidden-hiqmah/ui/lib/hifz/localAdapter";
import { createSupabaseHifzAdapter } from "@/lib/hifz/supabaseHifzAdapter";
import type { HifzAdapter } from "@hidden-hiqmah/ui/lib/hifz/types";

/**
 * Picks the Hifz adapter: Supabase (synced) when signed in, else device-only
 * local. Hifz progress is precious long-term data, so signed-in users always
 * sync. Mirrors useDailyAdapter. Requires migration 010_hifz.sql for the synced path.
 */
export function useHifzAdapter(): {
  adapter: HifzAdapter;
  signedIn: boolean;
  authLoading: boolean;
} {
  const { user, loading } = useAuth();
  const adapter = useMemo<HifzAdapter>(() => {
    if (user) return createSupabaseHifzAdapter(supabase, user.id);
    return createLocalHifzAdapter();
  }, [user]);
  return { adapter, signedIn: !!user, authLoading: loading };
}
