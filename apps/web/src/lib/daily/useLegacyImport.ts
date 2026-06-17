"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { todayLocalDate } from "@hidden-hiqmah/ui/lib/daily/types";

const LOCAL_KEY = "hiqmah-daily-v2"; // the signed-out local adapter store
const FLAG = "hiqmah-daily-imported:"; // + userId (per-device run-once guard)

/**
 * On sign-in, transplant the signed-out local Daily data (local adapter store)
 * into Supabase once. The server RPC is the real run-once guard (it aborts if
 * the user already has a checklist); the localStorage flag is belt-and-suspenders.
 * Runs early (from MobileShell) so it beats the first Daily seed.
 */
export function useLegacyImport() {
  const { user } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (!user || ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const flagKey = FLAG + user.id;
        if (localStorage.getItem(flagKey)) return;

        const raw = localStorage.getItem(LOCAL_KEY);
        if (!raw) {
          localStorage.setItem(flagKey, "1");
          return;
        }

        const payload = JSON.parse(raw);
        const hasData =
          (payload.userItems?.length ?? 0) > 0 ||
          Object.keys(payload.dayRollup ?? {}).length > 0 ||
          Object.keys(payload.dhikrLifetime ?? {}).length > 0;
        if (!hasData) {
          localStorage.setItem(flagKey, "1");
          return;
        }

        const { error } = await supabase.rpc("import_local_daily", {
          p_payload: payload,
          p_today: todayLocalDate(),
        });

        if (!error) {
          // Imported (or the user already had server data) — stop using local.
          localStorage.setItem(flagKey, "1");
          localStorage.removeItem(LOCAL_KEY);
        } else {
          ran.current = false; // allow a retry on next mount
        }
      } catch {
        ran.current = false;
      }
    })();
  }, [user]);
}
