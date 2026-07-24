// Reminders Journal — free-form, dated reflection entries.
//
// Mirrors the daily/hifz adapter pattern: one JournalAdapter interface with two
// implementations (localStorage for signed-out / child profiles, Supabase for
// signed-in primary profiles). The UI only ever talks to the interface, so the
// two paths can't drift.

export interface JournalEntry {
  id: string;
  body: string;
  /** Reminder id or citation the entry was written from (null = standalone). */
  linkedRef: string | null;
  /** Human display label for the linked reminder / verse (e.g. "Qur'an 94:5"). */
  linkedLabel: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface NewJournalEntry {
  body: string;
  linkedRef?: string | null;
  linkedLabel?: string | null;
}

export interface JournalEntryPatch {
  body?: string;
  linkedRef?: string | null;
  linkedLabel?: string | null;
}

export interface JournalAdapter {
  /** true when backed by Supabase (synced across devices). */
  synced: boolean;
  /** All entries, newest-first (by createdAt). */
  list(): Promise<JournalEntry[]>;
  /** Create an entry and return the persisted row. */
  add(input: NewJournalEntry): Promise<JournalEntry>;
  /** Patch body / link fields on an existing entry. */
  update(id: string, patch: JournalEntryPatch): Promise<void>;
  /** Delete an entry. */
  remove(id: string): Promise<void>;
}
