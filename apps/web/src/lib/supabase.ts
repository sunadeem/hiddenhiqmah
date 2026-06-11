"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://fiyffkjeatxgmwgmdmkt.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWZma2plYXR4Z213Z21kbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTc0MTYsImV4cCI6MjA5NjY5MzQxNn0.R9QJ0GIMi1h0wfoL8E7vCt4bq6EVrJl3MbFSJ_1Atzk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Implicit flow (default) — simpler, well-supported for email OTP.
    // PKCE only matters for OAuth providers; for OTP it causes the
    // verifyOtp call to either fail or skip session establishment.
  },
});

export const SUPABASE_PROJECT_REF = "fiyffkjeatxgmwgmdmkt";
