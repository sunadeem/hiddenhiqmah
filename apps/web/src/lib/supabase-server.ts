import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client authenticated with the service role key.
 * The service role bypasses RLS — use ONLY in server contexts (API routes).
 * Returns null if env vars aren't configured (allows graceful local dev
 * before deploy keys are set).
 */
export function tryGetSupabaseServer(): SupabaseClient | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://fiyffkjeatxgmwgmdmkt.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
