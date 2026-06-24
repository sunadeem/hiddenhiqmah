"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { createLocalHifzAdapter } from "@hidden-hiqmah/ui/lib/hifz/localAdapter";
import type { HifzAdapter } from "@hidden-hiqmah/ui/lib/hifz/types";

/**
 * Picks the Hifz adapter. Local (device-only) for now; Phase 5 switches signed-in
 * users to the Supabase (synced) adapter. Mirrors useDailyAdapter.
 */
export function useHifzAdapter(): {
  adapter: HifzAdapter;
  signedIn: boolean;
  authLoading: boolean;
} {
  const { user, loading } = useAuth();
  const adapter = useMemo<HifzAdapter>(() => {
    // Phase 5: if (user) return createSupabaseHifzAdapter(supabase, user.id);
    return createLocalHifzAdapter();
  }, [user]);
  return { adapter, signedIn: !!user, authLoading: loading };
}
