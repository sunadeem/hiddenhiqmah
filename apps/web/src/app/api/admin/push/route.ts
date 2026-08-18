import { NextRequest } from "next/server";
import { requireAdmin, adminJson, corsPreflight } from "@/lib/admin-auth";
import {
  sendPush,
  isPushConfigured,
  probeTransports,
  type PushTarget,
} from "@/lib/push/send";

export const runtime = "nodejs";

export async function OPTIONS() {
  return corsPreflight();
}

type TokenRow = { token: string; platform: string; environment: string };

// Admin-authored broadcast: sends an 'announcement' push to every registered
// device, iOS and Android alike — sendPush routes each token to APNs or FCM by
// its platform column.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;
  const supa = auth.supa;
  const body = auth.body;

  // ── Dry run: are the push credentials actually working? ──────────────────
  //
  // Returns BEFORE reading a single token or sending anything, so it cannot
  // touch the broadcast path below. This is the only way to check the
  // credentials that matter: they live in Vercel, marked Sensitive, which makes
  // them write-only — `vercel env pull` returns a placeholder, so a laptop can
  // verify the key it *thinks* was pasted but never the value actually in use.
  //
  //   curl -sX POST https://<host>/api/admin/push \
  //     -H 'content-type: application/json' \
  //     -d '{"email":"…","password1":"…","password2":"…","dryRun":true}'
  if (body.dryRun === true) {
    const transports = await probeTransports();
    return adminJson({
      ok: transports.apns.ok || transports.fcm.ok,
      dryRun: true,
      delivered: "nothing — probe tokens belong to no device",
      transports,
    });
  }

  const title = String(body.title ?? "").trim();
  const bodyText = String(body.body ?? "").trim();
  const url = String(body.url ?? "").trim() || undefined;
  if (!title || !bodyText) {
    return adminJson({ error: "title and body are required" }, 400);
  }
  if (!isPushConfigured()) {
    return adminJson({ error: "Push is not configured on the server." }, 500);
  }

  try {
    const { data, error } = await supa
      .from("device_tokens")
      .select("token, platform, environment");
    if (error) throw error;

    const targets: PushTarget[] = (data ?? []) as TokenRow[];

    const result = await sendPush(targets, {
      title,
      body: bodyText,
      url,
      data: { audience: "announcement" },
      // Unique per send: dedupes THIS announcement across a device's tokens, while
      // two separate announcements (different timestamps) still each show.
      collapseId: `announce-${Date.now().toString(36)}`,
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
