import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { tryGetSupabaseServer } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";

// Shared admin-route auth (email + two passwords, constant-time). Creds are
// POSTed with every request and never persisted client-side.
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function corsPreflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function adminJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

function safeEqual(a: string, b: string): boolean {
  // Hash both sides first: constant-time AND length-hiding.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function verifyCreds(email: string, p1: string, p2: string): boolean {
  const eEmail = process.env.ADMIN_EMAIL;
  const eP1 = process.env.ADMIN_PASSWORD_1;
  const eP2 = process.env.ADMIN_PASSWORD_2;
  if (!eEmail || !eP1 || !eP2) return false;
  // Evaluate all three (no short-circuit) so timing doesn't reveal which failed.
  const ok1 = safeEqual(email.trim().toLowerCase(), eEmail.trim().toLowerCase());
  const ok2 = safeEqual(p1, eP1);
  const ok3 = safeEqual(p2, eP2);
  return ok1 && ok2 && ok3;
}

type AdminOk = { ok: true; body: Record<string, unknown>; supa: SupabaseClient };
type AdminErr = { ok: false; res: NextResponse };

/** Parse + authenticate an admin POST. Returns the body + a service-role client,
 *  or a ready-to-return error response. */
export async function requireAdmin(req: NextRequest): Promise<AdminOk | AdminErr> {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, res: adminJson({ error: "Invalid request" }, 400) };
  }
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_1 || !process.env.ADMIN_PASSWORD_2) {
    return { ok: false, res: adminJson({ error: "Admin is not configured on the server." }, 500) };
  }
  if (!verifyCreds(String(body.email ?? ""), String(body.password1 ?? ""), String(body.password2 ?? ""))) {
    return { ok: false, res: adminJson({ error: "Invalid credentials" }, 401) };
  }
  const supa = tryGetSupabaseServer();
  if (!supa) {
    return {
      ok: false,
      res: adminJson({ error: "Database is not configured (missing SUPABASE_SERVICE_ROLE_KEY)." }, 500),
    };
  }
  return { ok: true, body, supa };
}
