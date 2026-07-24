import { NextRequest } from "next/server";
import { requireAdmin, adminJson, corsPreflight } from "@/lib/admin-auth";
import {
  sendToMany,
  isApnsConfigured,
  type ApnsTarget,
  type PushEnvironment,
} from "@/lib/push/apns";

export const runtime = "nodejs";

export async function OPTIONS() {
  return corsPreflight();
}

type TokenRow = { token: string; platform: string; environment: string };

// Admin-authored broadcast: sends an 'announcement' push to every iOS device.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;
  const supa = auth.supa;
  const body = auth.body;

  const title = String(body.title ?? "").trim();
  const bodyText = String(body.body ?? "").trim();
  const url = String(body.url ?? "").trim() || undefined;
  if (!title || !bodyText) {
    return adminJson({ error: "title and body are required" }, 400);
  }
  if (!isApnsConfigured()) {
    return adminJson({ error: "Push is not configured on the server." }, 500);
  }

  try {
    const { data, error } = await supa
      .from("device_tokens")
      .select("token, platform, environment");
    if (error) throw error;

    const targets: ApnsTarget[] = ((data ?? []) as TokenRow[])
      .filter((r) => r.platform === "ios")
      .map((r) => ({ token: r.token, environment: r.environment as PushEnvironment }));

    const result = await sendToMany(targets, {
      title,
      body: bodyText,
      url,
      data: { audience: "announcement" },
    });

    await Promise.all(
      result.corrected.map((c) =>
        supa.from("device_tokens").update({ environment: c.environment }).eq("token", c.token)
      )
    );
    if (result.staleTokens.length) {
      await supa.from("device_tokens").delete().in("token", result.staleTokens);
    }

    return adminJson({
      ok: true,
      sent: result.sent,
      failed: result.failed,
      corrected: result.corrected.length,
      removed: result.staleTokens.length,
    });
  } catch (e) {
    console.error("[Admin push] error:", e);
    return adminJson({ error: e instanceof Error ? e.message : "Push failed" }, 500);
  }
}
