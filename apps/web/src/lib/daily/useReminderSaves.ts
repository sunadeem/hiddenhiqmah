"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { requireAccount } from "@/lib/requireAccount";

const LS_KEY = "hiqmah-reminder-saves";

/** Saved reflections — Supabase (reminder_saves) when signed in, localStorage when not. */
export function useReminderSaves(): { saved: Set<string>; toggle: (id: string) => void } {
  const { user } = useAuth();
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    (async () => {
      if (user) {
        const { data } = await supabase.from("reminder_saves").select("reminder_id");
        if (alive) setSaved(new Set((data ?? []).map((r) => r.reminder_id as string)));
      } else {
        try {
          const raw = localStorage.getItem(LS_KEY);
          if (alive) setSaved(new Set<string>(raw ? JSON.parse(raw) : []));
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const toggle = useCallback(
    (id: string) => {
      const had = saved.has(id);
      // Saving a reflection is a stateful action → require an account on web.
      if (
        !had &&
        !requireAccount({
          title: "Save this reflection",
          message:
            "Create a free account to save reflections and sync them across your devices.",
        })
      ) {
        return; // signed out → gate shown, abort the save
      }
      const next = new Set(saved);
      if (had) next.delete(id);
      else next.add(id);
      setSaved(next);
      if (user) {
        if (had) void supabase.from("reminder_saves").delete().eq("reminder_id", id);
        else void supabase.from("reminder_saves").insert({ user_id: user.id, reminder_id: id });
      } else {
        try {
          localStorage.setItem(LS_KEY, JSON.stringify([...next]));
        } catch {
          /* ignore */
        }
      }
    },
    [user, saved]
  );

  return { saved, toggle };
}
