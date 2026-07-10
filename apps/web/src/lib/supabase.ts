"use client";

import { createClient } from "@supabase/supabase-js";

// No hardcoded fallback on purpose: a build with no Supabase env baked in must
// FAIL LOUDLY rather than silently connect to some default project. The env is
// inlined at build time — .env.local for dev/device builds, prod values for the
// App Store release build (see build:mobile:prod).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — set them " +
      "in .env.local (dev) or .env.prod (release build). Refusing to guess a project."
  );
}

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

// Derived from the active URL so it always matches whichever project is wired.
export const SUPABASE_PROJECT_REF =
  supabaseUrl.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "";
