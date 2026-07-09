"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { rangeKey } from "@hidden-hiqmah/ui/lib/hifz/srs";
import type { HifzCard, HifzPlan, HifzReview } from "@hidden-hiqmah/ui/lib/hifz/types";

const LOCAL_KEY = "hiqmah-hifz-v1"; // the signed-out primary local Hifz store
const FLAG = "hiqmah-hifz-imported:"; // + userId (per-device run-once guard)

interface LocalHifzStore {
  cards?: HifzCard[];
  reviews?: HifzReview[];
  plan?: HifzPlan | null;
}

/** camel → snake row for public.hifz_cards, PRESERVING SRS state (no reset). */
function cardToRow(c: HifzCard, userId: string) {
  return {
    id: c.id, // keep local id so any local reviews' card_id stays valid
    user_id: userId,
    range_key: rangeKey(c),
    unit: c.unit,
    label: c.label,
    page: c.page,
    start_surah: c.startSurah,
    start_ayah: c.startAyah,
    end_surah: c.endSurah,
    end_ayah: c.endAyah,
    status: c.status,
    ease: c.ease,
    interval_days: c.interval,
    reps: c.reps,
    lapses: c.lapses,
    step: c.step,
    introduced_date: c.introducedDate,
    due: c.due,
    last_reviewed: c.lastReviewed,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
    station_key: c.stationKey ?? rangeKey(c),
    peek_count: c.peekCount ?? 0,
    source: c.source ?? "learned",
    content_kind: c.contentKind ?? "quran",
  };
}

function planToRow(p: HifzPlan, userId: string) {
  return {
    user_id: userId,
    intention: p.intention,
    pace: p.pace,
    start_kind: p.startPoint.kind,
    start_surah: p.startPoint.surah ?? null,
    start_juz: p.startPoint.juz ?? null,
    start_page: p.startPoint.page ?? null,
    journey: p.journey,
    quiet_time: p.quietTime,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

/**
 * One-time local → Supabase merge of the signed-out Hifz data on first sign-in,
 * mirroring daily/useLegacyImport. ZERO PROGRESS LOSS is the invariant:
 *   - Cards are matched by (user_id, range_key). We upsert with
 *     ignoreDuplicates so an existing cloud card is NEVER overwritten or reset —
 *     only ranges the cloud lacks are inserted, carrying their local SRS state.
 *   - The plan is imported only when the cloud has none (the cloud plan wins).
 *   - The local review log is copied up (append-only; drives the streak).
 * Guarded by a per-user localStorage flag; on success the local store is cleared
 * so the app stops using it (child-profile stores use other keys and are untouched).
 * Runs early (from MobileShell) so it beats the first Hifz read.
 */
export function useHifzImport() {
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

        const store = JSON.parse(raw) as LocalHifzStore;
        const cards = store.cards ?? [];
        const reviews = store.reviews ?? [];
        const plan = store.plan ?? null;

        if (!cards.length && !reviews.length && !plan) {
          localStorage.setItem(flagKey, "1");
          localStorage.removeItem(LOCAL_KEY);
          return;
        }

        // Cards: insert only ranges the cloud lacks; ignoreDuplicates protects
        // any existing cloud card's SRS state (never reset, never duplicated).
        if (cards.length) {
          const { error } = await supabase
            .from("hifz_cards")
            .upsert(
              cards.map((c) => cardToRow(c, user.id)),
              { onConflict: "user_id,range_key", ignoreDuplicates: true }
            );
          if (error) throw error;
        }

        // Reviews (append-only log; only local_date matters for the streak).
        if (reviews.length) {
          const { error } = await supabase.from("hifz_reviews").insert(
            reviews.map((r) => ({
              user_id: user.id,
              card_id: r.cardId,
              grade: r.grade,
              local_date: r.localDate,
              at: r.at,
            }))
          );
          if (error) throw error;
        }

        // Plan: import only if the cloud has none (the cloud plan wins).
        if (plan) {
          const { data: existing, error: selErr } = await supabase
            .from("hifz_plan")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();
          if (selErr) throw selErr;
          if (!existing) {
            const { error } = await supabase
              .from("hifz_plan")
              .insert(planToRow(plan, user.id));
            if (error) throw error;
          }
        }

        // Success — stop using the local store.
        localStorage.setItem(flagKey, "1");
        localStorage.removeItem(LOCAL_KEY);
      } catch {
        ran.current = false; // allow a retry on next mount
      }
    })();
  }, [user]);
}
