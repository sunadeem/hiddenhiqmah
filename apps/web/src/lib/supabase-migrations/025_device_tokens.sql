-- ============================================================================
-- Hidden Hiqmah — Device Tokens Migration (025)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor → New query. Idempotent.
-- ⚠️  Apply to a NON-PRODUCTION target first (a Supabase branch or a dev
--     project), verify, THEN promote to production.
--
-- Foundation for push notifications (APNs). Provisions:
--   * device_tokens              — one row per APNs device token (self-readable)
--   * upsert_device_token RPC    — client registers / refreshes its own token
--
-- RLS is intentionally TIGHT: a user can READ only their OWN tokens, and can
-- NEVER insert/update directly (with check (false)). All writes go through the
-- SECURITY DEFINER RPC below, which stamps user_id = auth.uid(). The push
-- SENDER runs as service_role (bypasses RLS) to read all tokens and to delete
-- ones APNs reports as 410 / BadDeviceToken / Unregistered.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. device_tokens
-- ============================================================================
create table if not exists public.device_tokens (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references auth.users (id) on delete cascade,
    token         text not null unique,
    platform      text not null default 'ios'        check (platform in ('ios', 'android')),
    environment   text not null default 'production' check (environment in ('production', 'sandbox')),
    last_seen_at  timestamptz not null default now(),
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

comment on table public.device_tokens is 'One row per APNs/FCM device token. Self-readable only; writes go through upsert_device_token (definer). Sender reads/deletes via service_role.';

create index if not exists device_tokens_user_idx      on public.device_tokens (user_id);
create index if not exists device_tokens_last_seen_idx on public.device_tokens (last_seen_at);

-- ============================================================================
-- 2. RLS — self read only; NO direct client insert/update (with check (false))
-- ============================================================================
alter table public.device_tokens enable row level security;

drop policy if exists device_tokens_select_own    on public.device_tokens;
drop policy if exists device_tokens_no_insert      on public.device_tokens;
drop policy if exists device_tokens_no_update      on public.device_tokens;
create policy device_tokens_select_own on public.device_tokens
    for select to authenticated using (user_id = auth.uid());
-- Block all direct client writes; registration must go through the RPC.
create policy device_tokens_no_insert on public.device_tokens
    for insert to authenticated with check (false);
create policy device_tokens_no_update on public.device_tokens
    for update to authenticated using (false) with check (false);

-- ============================================================================
-- 3. Client registers / refreshes its own token via this RPC
--    (definer; validates ownership; stamps user_id = auth.uid())
-- ============================================================================
create or replace function public.upsert_device_token(
    p_token       text,
    p_platform    text default 'ios',
    p_environment text default 'production'
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.device_tokens (user_id, token, platform, environment)
  values (auth.uid(), p_token, p_platform, p_environment)
  on conflict (token) do update
    set user_id      = auth.uid(),
        platform     = excluded.platform,
        environment  = excluded.environment,
        last_seen_at = now(),
        updated_at   = now();
end $$;

revoke all on function public.upsert_device_token(text, text, text) from public, anon;
grant execute on function public.upsert_device_token(text, text, text) to authenticated;

-- ============================================================================
-- Verify (run after applying):
--   select column_name, data_type from information_schema.columns
--    where table_schema = 'public' and table_name = 'device_tokens'
--    order by ordinal_position;
--   select polname from pg_policies where tablename = 'device_tokens';
--   -- as a signed-in user, this should register your token:
--   -- select public.upsert_device_token('test-token-abc', 'ios', 'sandbox');
--   -- select token, platform, environment from public.device_tokens;
-- ============================================================================
