-- ============================================================================
-- Hidden Hiqmah — User Profiles Migration (006)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor → New query. Idempotent.
-- ⚠️  Apply to a NON-PRODUCTION target first (a Supabase branch or a dev
--     project), verify, THEN promote to production.
--
-- Foundation for Circles (007) + Family. Provisions:
--   * profiles            — one row per auth user (display name + avatar)
--   * handle_new_user      — trigger: auto-create a profile on signup
--   * set_my_profile RPC   — client updates its own display name / avatar
--   * backfill for existing users
--
-- RLS here is intentionally TIGHT: a user can read/update only their OWN
-- profile. Cross-member visibility (so circle members can see each other's
-- names) is added by the Circles migration (007) as a membership-scoped policy.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. profiles
-- ============================================================================
create table if not exists public.profiles (
    id            uuid primary key references auth.users (id) on delete cascade,
    display_name  text not null default 'Friend',
    avatar        text,                     -- emoji / short initials now; image URLs later
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'Per-user public-facing profile (display name + avatar). Readable by self here; circle members gain read via migration 007.';

-- ============================================================================
-- 2. RLS — self read/insert/update only (no deletes; cascades with auth.users)
-- ============================================================================
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles
    for select to authenticated using (id = auth.uid());
create policy profiles_insert_own on public.profiles
    for insert to authenticated with check (id = auth.uid());
create policy profiles_update_own on public.profiles
    for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ============================================================================
-- 3. Auto-create a profile on signup (definer trigger on auth.users)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'display_name', ''),
      split_part(coalesce(new.email, 'Friend'), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 4. Client updates its own profile via this RPC (definer; validates ownership)
-- ============================================================================
create or replace function public.set_my_profile(p_display_name text, p_avatar text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.profiles (id, display_name, avatar, updated_at)
  values (auth.uid(), coalesce(nullif(trim(p_display_name), ''), 'Friend'), p_avatar, now())
  on conflict (id) do update
    set display_name = coalesce(nullif(trim(excluded.display_name), ''), public.profiles.display_name),
        avatar       = coalesce(excluded.avatar, public.profiles.avatar),
        updated_at   = now();
end $$;

revoke all on function public.set_my_profile(text, text) from public, anon;
grant execute on function public.set_my_profile(text, text) to authenticated;

-- ============================================================================
-- 5. Backfill profiles for existing users (idempotent)
-- ============================================================================
insert into public.profiles (id, display_name)
select u.id,
       coalesce(
         nullif(u.raw_user_meta_data->>'name', ''),
         nullif(u.raw_user_meta_data->>'display_name', ''),
         split_part(coalesce(u.email, 'Friend'), '@', 1)
       )
from auth.users u
on conflict (id) do nothing;

-- ============================================================================
-- Verify (run after applying):
--   select (select count(*) from public.profiles) as profiles,
--          (select count(*) from auth.users)      as users;   -- expect equal
--   select tgname from pg_trigger where tgname = 'on_auth_user_created';
--   -- as a signed-in user, this should update your row:
--   -- select public.set_my_profile('Test Name', '🌙');
-- ============================================================================
