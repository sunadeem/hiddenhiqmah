-- ============================================================================
-- Hidden Hiqmah — reminder_saves: switch to a text reminder id
-- ============================================================================
-- Run in Supabase Dashboard → SQL Editor. Idempotent.
-- Reminders are shipped as static local content (packages/content/reminders.json),
-- not DB rows, so saves reference the reminder's string id (no FK to a table).
-- The reminders content table from 002 is now unused but left in place (harmless).
-- ============================================================================

drop table if exists public.reminder_saves;

create table public.reminder_saves (
    user_id     uuid not null references auth.users (id) on delete cascade,
    reminder_id text not null,
    saved_at    timestamptz not null default now(),
    primary key (user_id, reminder_id)
);

alter table public.reminder_saves enable row level security;

drop policy if exists rs_select_own on public.reminder_saves;
drop policy if exists rs_insert_own on public.reminder_saves;
drop policy if exists rs_delete_own on public.reminder_saves;

create policy rs_select_own on public.reminder_saves
    for select to authenticated using (user_id = auth.uid());
create policy rs_insert_own on public.reminder_saves
    for insert to authenticated with check (user_id = auth.uid());
create policy rs_delete_own on public.reminder_saves
    for delete to authenticated using (user_id = auth.uid());
