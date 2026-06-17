"use client";

import { useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { createLocalDailyAdapter } from "@hidden-hiqmah/ui/lib/daily/localAdapter";
import { toLocalDateString, type DailyAdapter } from "@hidden-hiqmah/ui/lib/daily/types";
import { createSupabaseDailyAdapter } from "@/lib/daily/supabaseDailyAdapter";

/**
 * Picks the DailyAdapter based on auth state: Supabase (synced) when signed in,
 * localStorage (device-only) when signed out. The website / signed-out app use
 * the local adapter; on sign-in, local data is migrated up (handled separately).
 */
export function useDailyAdapter(): {
  adapter: DailyAdapter;
  signedIn: boolean;
  authLoading: boolean;
} {
  const { user, loading } = useAuth();
  const adapter = useMemo<DailyAdapter>(() => {
    if (!user) return createLocalDailyAdapter();
    const start = user.created_at ? toLocalDateString(new Date(user.created_at)) : null;
    return createSupabaseDailyAdapter(supabase, user.id, start);
  }, [user]);
  return { adapter, signedIn: !!user, authLoading: loading };
}
