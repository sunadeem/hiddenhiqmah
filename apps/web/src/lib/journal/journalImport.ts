"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { JournalEntry } from "@/lib/journal/types";

const LOCAL_KEY = "hiqmah-journal-v1"; // the signed-out primary local Journal store
const FLAG = "hiqmah-journal-imported:"; // + userId (per-device run-once guard)

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Non-secure context / old WebView: RFC-4122-shaped v4 from Math.random.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

/**
 * journal_entries.id is a uuid column. The local adapter normally writes
 * crypto.randomUUID() ids, but its fallback path mints `id-<ts>-<rand>` — which
 * postgres would reject. Keep a real uuid (so a retry after a partial insert
 * conflicts instead of duplicating) and mint one otherwise.
 */
function rowId(id: unknown): string {
  return typeof id === "string" && UUID_RE.test(id) ? id : uuid();
}

function isEntry(e: unknown): e is JournalEntry {
  return !!e && typeof e === "object" && typeof (e as JournalEntry).body === "string";
}

/**
 * One-time local → Supabase copy of the signed-out Journal entries on first
 * sign-in, mirroring daily/useLegacyImport and hifz/useHifzImport. Entries
 * written before signing in would otherwise just vanish when useJournalAdapter
 * swaps to the Supabase adapter — nothing deletes them, but nothing shows them
 * either. NO ENTRY IS EVER LOST is the invariant:
 *   - Rows are inserted with their local id + createdAt/updatedAt, so the cloud
 *     copy keeps the date the reflection was actually written.
 *   - upsert with ignoreDuplicates on the primary key makes the write itself
 *     idempotent: a retry after a partially-applied insert re-sends every row
 *     but re-inserts none, and existing cloud entries are never overwritten.
 *   - The local store is cleared ONLY after the write succeeds; on any failure
 *     it is left intact and the flag unset, so the next mount retries.
 * Guarded by a per-user localStorage flag. Child-profile journals live under
 * other keys (hiqmah-journal-v1:p:<id>) and are deliberately untouched —
 * those stay device-only. Runs early (from MobileShell) so it beats the first
 * Journal read.
 */
export function useJournalImport() {
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

        const parsed = JSON.parse(raw) as unknown;
        const entries = (Array.isArray(parsed) ? parsed : []).filter(isEntry);

        if (!entries.length) {
          // Nothing worth keeping (empty or corrupt) — don't hold on to it.
          localStorage.setItem(flagKey, "1");
          localStorage.removeItem(LOCAL_KEY);
          return;
        }

        const now = new Date().toISOString();
        const { error } = await supabase.from("journal_entries").upsert(
          entries.map((e) => ({
            id: rowId(e.id),
            user_id: user.id,
            body: e.body,
            linked_ref: e.linkedRef ?? null,
            linked_label: e.linkedLabel ?? null,
            created_at: e.createdAt ?? now,
            updated_at: e.updatedAt ?? e.createdAt ?? now,
          })),
          { onConflict: "id", ignoreDuplicates: true }
        );
        if (error) throw error;

        // Success — the entries are on the server; stop using the local store.
        localStorage.setItem(flagKey, "1");
        localStorage.removeItem(LOCAL_KEY);
      } catch {
        ran.current = false; // allow a retry on next mount (local copy kept)
      }
    })();
  }, [user]);
}
