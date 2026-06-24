-- 010_hifz.sql — Hifz (Qur'an memorization) cards + review log.
--
-- Unlike the daily checklist (which freezes per-day snapshots via SECURITY DEFINER
-- RPCs), hifz cards are plain user-owned mutable rows: the SRS scheduling runs
-- client-side (shared pure functions in packages/ui/lib/hifz/srs.ts), so this is
-- just direct CRUD behind RLS, with last-write-wins by updated_at.
--
-- Apply to a NON-PROD Supabase project first, then prod. Idempotent.

-- ── Cards ──
create table if not exists public.hifz_cards (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references auth.users (id) on delete cascade,
    range_key     text not null,                 -- "s:a-es:ea" — dedupe within a user
    unit          text not null check (unit in ('page','ayah','surah','range')),
    label         text not null,
    page          int,
    start_surah   int  not null,
    start_ayah    int  not null,
    end_surah     int  not null,
    end_ayah      int  not null,
    status        text not null default 'new'
                    check (status in ('new','learning','review','memorized')),
    ease          real not null default 2.5,
    interval_days int  not null default 0,
    reps          int  not null default 0,
    lapses        int  not null default 0,
    step          int  not null default 0,
    due           date not null,
    last_reviewed date,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    unique (user_id, range_key)
);
create index if not exists hifz_cards_user_due_idx on public.hifz_cards (user_id, due);

-- ── Review log (drives the streak) ──
create table if not exists public.hifz_reviews (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references auth.users (id) on delete cascade,
    card_id    uuid not null,
    grade      text not null check (grade in ('again','hard','good','easy')),
    local_date date not null,
    at         timestamptz not null default now()
);
create index if not exists hifz_reviews_user_date_idx on public.hifz_reviews (user_id, local_date);

-- ── RLS ──
alter table public.hifz_cards   enable row level security;
alter table public.hifz_reviews enable row level security;

-- Cards: full self CRUD (the row IS the user's data; conflicts resolve last-write-wins).
drop policy if exists hc_select_own on public.hifz_cards;
drop policy if exists hc_insert_own on public.hifz_cards;
drop policy if exists hc_update_own on public.hifz_cards;
drop policy if exists hc_delete_own on public.hifz_cards;
create policy hc_select_own on public.hifz_cards
    for select to authenticated using (user_id = auth.uid());
create policy hc_insert_own on public.hifz_cards
    for insert to authenticated with check (user_id = auth.uid());
create policy hc_update_own on public.hifz_cards
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy hc_delete_own on public.hifz_cards
    for delete to authenticated using (user_id = auth.uid());

-- Reviews: self select + insert (an append-only log).
drop policy if exists hr_select_own on public.hifz_reviews;
drop policy if exists hr_insert_own on public.hifz_reviews;
create policy hr_select_own on public.hifz_reviews
    for select to authenticated using (user_id = auth.uid());
create policy hr_insert_own on public.hifz_reviews
    for insert to authenticated with check (user_id = auth.uid());
