"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

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
      // Reflections save locally when signed out (no gate); signing in switches
      // to the synced Supabase store. Never blocks the save.
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
