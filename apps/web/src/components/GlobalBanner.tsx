"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { App as CapApp } from "@capacitor/app";
import { supabase } from "@/lib/supabase";

type Banner = { enabled: boolean; level: string; message: string };

// A remote-config status banner (migration 022 app_config, key 'banner'). Read
// with the anon key on launch + foreground + a slow poll, so an admin can warn
// users about downtime/issues WITHOUT shipping an App Store update. In-flow
// (like the offline banner) so it never overlaps the safe area or top bar.
export default function GlobalBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "banner")
        .maybeSingle();
      const v = (data?.value ?? null) as Banner | null;
      setBanner(v && v.enabled && v.message ? v : null);
    } catch {
      setBanner(null);
    }
  }, []);

  useEffect(() => {
    load();
    let handle: { remove: () => void } | undefined;
    // Re-check on foreground (native) — no-op/visibility on web.
    CapApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) load();
    })
      .then((h) => {
        handle = h;
      })
      .catch(() => {});
    const iv = setInterval(load, 5 * 60 * 1000);
    return () => {
      handle?.remove();
      clearInterval(iv);
    };
  }, [load]);

  if (!banner) return null;

  const tone =
    banner.level === "maintenance"
      ? "bg-red-500/15 border-red-400/30 text-red-200"
      : banner.level === "warning"
      ? "bg-amber-500/15 border-amber-400/30 text-amber-200"
      : "bg-[var(--color-gold)]/15 border-[var(--color-gold)]/30 text-gold";

  return (
    <div
      role="status"
      className={`shrink-0 flex items-start gap-2 px-4 py-2 border-b text-[12.5px] leading-snug ${tone}`}
    >
      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
      <span className="min-w-0">{banner.message}</span>
    </div>
  );
}
