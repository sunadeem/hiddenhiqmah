-- ============================================================================
-- Hidden Hiqmah — Custom Dhikr Migration (012)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor → New query. Idempotent.
-- ⚠️  Apply to a NON-PRODUCTION target first, verify, THEN promote to prod.
--
-- Cross-device sync of a user's custom dhikr *cards* — the extra adhkār they add
-- to the Worship tab / Dhikr page beyond the built-ins, plus per-card rep-goal
-- overrides. The dhikr COUNTS already sync via dhikr_daily / dhikr_lifetime (002);
-- this table only persists the card LIST + goals. Signed-out users keep this in
-- localStorage (client-side fallback); signed-in users read/write here.
--
-- Row semantics (single table, keyed by dhikr_key):
--   * sort_order >= 0  → an ADDED custom card. Value is its display position;
--                        ties are broken by created_at (append order).
--   * sort_order  = -1 → a goal-OVERRIDE-only row: a built-in / base card whose
--                        rep goal the user changed but did NOT add as a new card.
--   * goal             → that card's rep goal (>= 1).
--   label / arabic / translit are denormalized from the client dhikr catalog so
--   the list renders without a catalog round-trip.
--
-- Privacy: RLS restricts every row to its owner (full self CRUD). No public read.
-- These are intentionally NOT checklist UserItems, so custom dhikr never leak
-- into the daily checklist.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. Table
-- ============================================================================
create table if not exists public.custom_dhikr (
    user_id     uuid not null references auth.users (id) on delete cascade,
    dhikr_key   text not null,
    label       text not null default '',
    arabic      text not null default '',
    translit    text not null default '',
    goal        int  not null default 33 check (goal >= 1),
    sort_order  int  not null default 0,
    created_at  timestamptz not null default now(),
    primary key (user_id, dhikr_key)
);

create index if not exists custom_dhikr_user_order_idx
    on public.custom_dhikr (user_id, sort_order, created_at);

comment on table public.custom_dhikr is
  'Per-user custom dhikr cards + rep-goal overrides. sort_order=-1 marks a goal-override-only row (not an added card). Counts live in dhikr_daily.';

-- ============================================================================
-- 2. RLS — a user may only CRUD their own rows.
-- ============================================================================
alter table public.custom_dhikr enable row level security;

drop policy if exists custom_dhikr_select_own on public.custom_dhikr;
drop policy if exists custom_dhikr_insert_own on public.custom_dhikr;
drop policy if exists custom_dhikr_update_own on public.custom_dhikr;
drop policy if exists custom_dhikr_delete_own on public.custom_dhikr;

create policy custom_dhikr_select_own on public.custom_dhikr
    for select to authenticated using (user_id = auth.uid());
create policy custom_dhikr_insert_own on public.custom_dhikr
    for insert to authenticated with check (user_id = auth.uid());
create policy custom_dhikr_update_own on public.custom_dhikr
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy custom_dhikr_delete_own on public.custom_dhikr
    for delete to authenticated using (user_id = auth.uid());

-- ============================================================================
-- Done. Verify (as a signed-in user, from the app or SQL editor):
--   insert into public.custom_dhikr (user_id, dhikr_key, label, goal, sort_order)
--     values (auth.uid(), 'hawqala', 'La hawla wa la quwwata illa billah', 100, 0);
--   select * from public.custom_dhikr;   -- your row(s) only
--   -- privacy check: a DIFFERENT user must get 0 rows from `select * from custom_dhikr`.
-- ============================================================================
