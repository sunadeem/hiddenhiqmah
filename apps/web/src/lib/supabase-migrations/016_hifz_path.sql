-- 016_hifz_path.sql — "Your Hifz Path" redesign: station grouping, peek/source
-- on cards, and the singleton per-user plan. Additive + idempotent; safe on data
-- from 010_hifz.sql (new columns are nullable / defaulted, so old rows stay valid
-- and keep working — a card with no station_key derives its own station client-side).
--
-- Apply to a NON-PROD Supabase project first, then prod.

-- ── Card additions ──
alter table public.hifz_cards
  add column if not exists station_key text,                         -- stable station grouping tag
  add column if not exists peek_count  int  not null default 0,      -- Learn-ladder "Fade" peeks
  add column if not exists source      text not null default 'learned'
                                        check (source in ('learned','seeded')),
  add column if not exists content_kind text not null default 'quran'
                                        check (content_kind in ('quran','asma'));  -- Qur'an āyāt vs 99 Names

-- Backfill legacy cards: each becomes its own station (matches stationKeyOf()'s
-- range fallback). Client keeps working without this, but it makes the grouping
-- explicit + indexable.
update public.hifz_cards
  set station_key = start_surah || ':' || start_ayah || '-' || end_surah || ':' || end_ayah
  where station_key is null;

create index if not exists hifz_cards_user_station_idx
  on public.hifz_cards (user_id, station_key);

-- ── Plan (singleton per user) ──
create table if not exists public.hifz_plan (
    user_id     uuid primary key references auth.users (id) on delete cascade,
    intention   text not null check (intention in ('start','maintain','both')),
    pace        text not null check (pace in ('gentle','steady','devoted')),
    start_kind  text not null check (start_kind in ('surah','juz','page')),
    start_surah int,
    start_juz   int,
    start_page  int,
    journey     text,
    quiet_time  text,                              -- "HH:MM" local, or null
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

alter table public.hifz_plan enable row level security;
drop policy if exists hp_select_own on public.hifz_plan;
drop policy if exists hp_insert_own on public.hifz_plan;
drop policy if exists hp_update_own on public.hifz_plan;
drop policy if exists hp_delete_own on public.hifz_plan;
create policy hp_select_own on public.hifz_plan
    for select to authenticated using (user_id = auth.uid());
create policy hp_insert_own on public.hifz_plan
    for insert to authenticated with check (user_id = auth.uid());
create policy hp_update_own on public.hifz_plan
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy hp_delete_own on public.hifz_plan
    for delete to authenticated using (user_id = auth.uid());
