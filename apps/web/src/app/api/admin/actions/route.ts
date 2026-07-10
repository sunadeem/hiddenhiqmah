import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { tryGetSupabaseServer } from "@/lib/supabase-server";

// Admin write actions (service role): clear a user's suspension, set the
// maintenance banner. Same shared-secret auth as /api/admin/stats.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function verifyCreds(email: string, password1: string, password2: string): boolean {
  const eEmail = process.env.ADMIN_EMAIL;
  const eP1 = process.env.ADMIN_PASSWORD_1;
  const eP2 = process.env.ADMIN_PASSWORD_2;
  if (!eEmail || !eP1 || !eP2) return false;
  const ok1 = safeEqual(email.trim().toLowerCase(), eEmail.trim().toLowerCase());
  const ok2 = safeEqual(password1, eP1);
  const ok3 = safeEqual(password2, eP2);
  return ok1 && ok2 && ok3;
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const email = String(body.email ?? "");
  const password1 = String(body.password1 ?? "");
  const password2 = String(body.password2 ?? "");
  if (!verifyCreds(email, password1, password2)) {
    return json({ error: "Invalid credentials" }, 401);
  }

  const supa = tryGetSupabaseServer();
  if (!supa) {
    return json({ error: "Database is not configured on the server." }, 500);
  }

  const action = String(body.action ?? "");
  try {
    if (action === "clearSuspension") {
      const userId = String(body.userId ?? "");
      if (!userId) return json({ error: "userId required" }, 400);
      const { error } = await supa
        .from("user_moderation")
        .update({ suspended: false, strike_count: 0, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "setBanner") {
      const enabled = Boolean(body.enabled);
      const level = ["info", "warning", "maintenance"].includes(String(body.level))
        ? String(body.level)
        : "info";
      const message = String(body.message ?? "").slice(0, 500);
      const { error } = await supa
        .from("app_config")
        .upsert(
          { key: "banner", value: { enabled, level, message }, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      if (error) throw error;
      return json({ ok: true, banner: { enabled, level, message } });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("[Admin actions] error:", e);
    return json({ error: e instanceof Error ? e.message : "Action failed" }, 500);
  }
}
