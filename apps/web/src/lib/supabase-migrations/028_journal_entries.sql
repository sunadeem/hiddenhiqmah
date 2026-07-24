-- 028_journal_entries.sql — Reminders Journal: free-form reflection entries.
--
-- Like hifz_cards (010), journal entries are plain user-owned mutable rows: there
-- is no per-day snapshot or server-computed invariant to protect, so this is just
-- direct CRUD behind RLS (self-scoped select/insert/update/delete), last-write-wins
-- by updated_at. An entry may optionally be tagged to a reminder / verse it was
-- written from (linked_ref = the reminder id or a citation like "Ash-Sharh 94:5",
-- linked_label = the human string shown on the card). Standalone entries leave both
-- null.
--
-- Apply to a NON-PROD Supabase project first, then prod. Idempotent.

-- ── Entries ──
create table if not exists public.journal_entries (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid not null references auth.users (id) on delete cascade,
    body         text not null,
    linked_ref   text,                              -- reminder id or citation the entry was written from
    linked_label text,                              -- display label for the linked reminder / verse
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

-- Newest-first listing, scoped per user.
create index if not exists journal_entries_user_created_idx
    on public.journal_entries (user_id, created_at desc);

-- ── RLS ──
alter table public.journal_entries enable row level security;

-- Full self CRUD (the row IS the user's data; conflicts resolve last-write-wins).
drop policy if exists je_select_own on public.journal_entries;
drop policy if exists je_insert_own on public.journal_entries;
drop policy if exists je_update_own on public.journal_entries;
drop policy if exists je_delete_own on public.journal_entries;
create policy je_select_own on public.journal_entries
    for select to authenticated using (user_id = auth.uid());
create policy je_insert_own on public.journal_entries
    for insert to authenticated with check (user_id = auth.uid());
create policy je_update_own on public.journal_entries
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy je_delete_own on public.journal_entries
    for delete to authenticated using (user_id = auth.uid());
