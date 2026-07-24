// localStorage-backed JournalAdapter for signed-out users (and child profiles on
// a shared device). Mirrors createLocalHifzAdapter: plain CRUD over a namespaced
// key, newest-first. On sign-in the primary profile switches to the Supabase
// adapter; this device-only data is left untouched (never auto-deleted).

import type {
  JournalAdapter,
  JournalEntry,
  JournalEntryPatch,
  NewJournalEntry,
} from "./types";

const STORE_KEY = "hiqmah-journal-v1";

function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  }
}

export function createLocalJournalAdapter(storeKey: string = STORE_KEY): JournalAdapter {
  function load(): JournalEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(storeKey);
      if (!raw) return [];
      const arr = JSON.parse(raw) as JournalEntry[];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function save(entries: JournalEntry[]) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storeKey, JSON.stringify(entries));
    } catch {
      // quota / private mode — ignore
    }
  }

  function sorted(entries: JournalEntry[]): JournalEntry[] {
    // Newest-first by createdAt (stable). Mirrors the Supabase order-by.
    return [...entries].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  }

  return {
    synced: false,

    async list(): Promise<JournalEntry[]> {
      return sorted(load());
    },

    async add(input: NewJournalEntry): Promise<JournalEntry> {
      const now = new Date().toISOString();
      const entry: JournalEntry = {
        id: uid(),
        body: input.body,
        linkedRef: input.linkedRef ?? null,
        linkedLabel: input.linkedLabel ?? null,
        createdAt: now,
        updatedAt: now,
      };
      const entries = load();
      entries.push(entry);
      save(entries);
      return entry;
    },

    async update(id: string, patch: JournalEntryPatch): Promise<void> {
      const entries = load();
      const it = entries.find((e) => e.id === id);
      if (!it) return;
      if (patch.body !== undefined) it.body = patch.body;
      if (patch.linkedRef !== undefined) it.linkedRef = patch.linkedRef;
      if (patch.linkedLabel !== undefined) it.linkedLabel = patch.linkedLabel;
      it.updatedAt = new Date().toISOString();
      save(entries);
    },

    async remove(id: string): Promise<void> {
      save(load().filter((e) => e.id !== id));
    },
  };
}
