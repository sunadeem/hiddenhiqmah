import { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin, adminJson, corsPreflight } from "@/lib/admin-auth";

export async function OPTIONS() {
  return corsPreflight();
}

// Append to the moderation audit trail (tolerant if migration 023 isn't applied).
async function logEvent(supa: SupabaseClient, userId: string | null, kind: string, meta: Record<string, unknown> = {}) {
  if (!userId) return;
  try {
    await supa.from("moderation_events").insert({ user_id: userId, kind, meta });
  } catch {
    /* table may not exist yet */
  }
}

// The author of a message (for attributing message/report actions to a user).
async function messageAuthor(supa: SupabaseClient, messageId: string): Promise<{ userId: string | null; circleId: string | null }> {
  const { data } = await supa.from("circle_messages").select("user_id, circle_id").eq("id", messageId).maybeSingle();
  const row = data as { user_id?: string; circle_id?: string } | null;
  return { userId: row?.user_id ?? null, circleId: row?.circle_id ?? null };
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;
  const supa = auth.supa;
  const body = auth.body;
  const action = String(body.action ?? "");
  const nowIso = new Date().toISOString();

  try {
    switch (action) {
      case "clearSuspension": {
        // Back-compat: lift suspension AND reset strikes.
        const userId = String(body.userId ?? "");
        if (!userId) return adminJson({ error: "userId required" }, 400);
        const { error } = await supa.from("user_moderation").update({ suspended: false, strike_count: 0, updated_at: nowIso }).eq("user_id", userId);
        if (error) throw error;
        await logEvent(supa, userId, "unsuspend", { alsoReset: true });
        return adminJson({ ok: true });
      }
      case "unsuspend": {
        const userId = String(body.userId ?? "");
        if (!userId) return adminJson({ error: "userId required" }, 400);
        const { error } = await supa.from("user_moderation").update({ suspended: false, updated_at: nowIso }).eq("user_id", userId);
        if (error) throw error;
        await logEvent(supa, userId, "unsuspend", {});
        return adminJson({ ok: true });
      }
      case "resetStrikes": {
        const userId = String(body.userId ?? "");
        if (!userId) return adminJson({ error: "userId required" }, 400);
        const { error } = await supa.from("user_moderation").update({ strike_count: 0, updated_at: nowIso }).eq("user_id", userId);
        if (error) throw error;
        await logEvent(supa, userId, "strikes_reset", {});
        return adminJson({ ok: true });
      }
      case "suspendUser": {
        const userId = String(body.userId ?? "");
        if (!userId) return adminJson({ error: "userId required" }, 400);
        const reason = String(body.reason ?? "").slice(0, 200);
        const { error } = await supa.from("user_moderation").upsert(
          { user_id: userId, suspended: true, last_reason: `manual: ${reason || "admin"}`, updated_at: nowIso },
          { onConflict: "user_id" }
        );
        if (error) throw error;
        await logEvent(supa, userId, "manual_suspend", { reason });
        return adminJson({ ok: true });
      }
      case "deleteMessage": {
        const messageId = String(body.messageId ?? "");
        if (!messageId) return adminJson({ error: "messageId required" }, 400);
        const { userId, circleId } = await messageAuthor(supa, messageId);
        const { error } = await supa.from("circle_messages").update({ deleted_at: nowIso }).eq("id", messageId);
        if (error) throw error;
        await logEvent(supa, userId, "message_deleted", { messageId, circleId });
        return adminJson({ ok: true });
      }
      case "restoreMessage": {
        const messageId = String(body.messageId ?? "");
        if (!messageId) return adminJson({ error: "messageId required" }, 400);
        const { userId } = await messageAuthor(supa, messageId);
        const { error } = await supa.from("circle_messages").update({ deleted_at: null }).eq("id", messageId);
        if (error) throw error;
        await logEvent(supa, userId, "message_restored", { messageId });
        return adminJson({ ok: true });
      }
      case "resolveReport":
      case "dismissReport": {
        const reportId = String(body.reportId ?? "");
        if (!reportId) return adminJson({ error: "reportId required" }, 400);
        const status = action === "resolveReport" ? "resolved" : "dismissed";
        const note = String(body.note ?? "").slice(0, 300) || null;
        const { data: rep } = await supa.from("circle_message_reports").select("message_id").eq("id", reportId).maybeSingle();
        const messageId = (rep as { message_id?: string } | null)?.message_id ?? "";
        const author = messageId ? (await messageAuthor(supa, messageId)).userId : null;
        const { error } = await supa.from("circle_message_reports").update({ status, resolved_at: nowIso, resolution_note: note }).eq("id", reportId);
        if (error) throw error;
        await logEvent(supa, author, action === "resolveReport" ? "report_resolved" : "report_dismissed", { reportId });
        return adminJson({ ok: true });
      }
      case "setUserNote": {
        const userId = String(body.userId ?? "");
        if (!userId) return adminJson({ error: "userId required" }, 400);
        const note = String(body.note ?? "").slice(0, 2000);
        const { error } = await supa.from("user_moderation").upsert({ user_id: userId, admin_note: note, updated_at: nowIso }, { onConflict: "user_id" });
        if (error) throw error;
        await logEvent(supa, userId, "note_updated", {});
        return adminJson({ ok: true });
      }
      case "setBanner": {
        const enabled = Boolean(body.enabled);
        const level = ["info", "warning", "maintenance"].includes(String(body.level)) ? String(body.level) : "info";
        const message = String(body.message ?? "").slice(0, 500);
        const { error } = await supa.from("app_config").upsert({ key: "banner", value: { enabled, level, message }, updated_at: nowIso }, { onConflict: "key" });
        if (error) throw error;
        return adminJson({ ok: true, banner: { enabled, level, message } });
      }
      default:
        return adminJson({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("[Admin actions] error:", e);
    return adminJson({ error: e instanceof Error ? e.message : "Action failed" }, 500);
  }
}
