-- ============================================================================
-- Hidden Hiqmah — AI Chat Quota System Migration
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor → New query.
-- Provisions:
--   * chat_usage         — one row per AI Chat request (auth or anon)
--   * sign_in_bonuses    — one-time +5 lifetime quota bump per user
--   * get_quota_for_today(p_user_id, p_anon_id) — RPC returning quota state
--
-- Quota model:
--   Base limit: 5 requests / rolling 24h (everyone)
--   Bonus: +5 (=> 10) if user has a sign_in_bonuses row granted today (UTC)
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. chat_usage
-- ============================================================================
create table if not exists public.chat_usage (
    id        uuid        primary key default gen_random_uuid(),
    user_id   uuid        references auth.users (id) on delete cascade,
    anon_id   text,
    ip_hash   text,
    used_at   timestamptz not null default now(),
    constraint chat_usage_identity_present
        check (user_id is not null or anon_id is not null)
);

comment on table  public.chat_usage           is 'One row per AI Chat request. Drives the rolling 24h quota.';
comment on column public.chat_usage.user_id   is 'auth.users(id) for signed-in requests; null for anon.';
comment on column public.chat_usage.anon_id   is 'Client-generated device UUID for anonymous requests; null when user_id is set.';
comment on column public.chat_usage.ip_hash   is 'sha256(IP) — light dedup / abuse signal only. Never returned to clients.';
comment on column public.chat_usage.used_at   is 'Timestamp the request was counted against quota.';

-- Primary quota lookup index
create index if not exists chat_usage_identity_used_at_idx
    on public.chat_usage (
        (coalesce(user_id::text, anon_id)),
        used_at desc
    );

-- IP-based abuse detection (partial)
create index if not exists chat_usage_ip_hash_used_at_idx
    on public.chat_usage (ip_hash, used_at desc)
    where ip_hash is not null;

-- RLS — only service role writes; authenticated users read their own rows
alter table public.chat_usage enable row level security;

drop policy if exists chat_usage_select_own        on public.chat_usage;
drop policy if exists chat_usage_no_authed_insert  on public.chat_usage;
drop policy if exists chat_usage_no_anon_insert    on public.chat_usage;

create policy chat_usage_select_own
    on public.chat_usage
    for select
    to authenticated
    using (user_id = auth.uid());

create policy chat_usage_no_authed_insert
    on public.chat_usage
    for insert
    to authenticated
    with check (false);

create policy chat_usage_no_anon_insert
    on public.chat_usage
    for insert
    to anon
    with check (false);

-- ============================================================================
-- 2. sign_in_bonuses
-- ============================================================================
create table if not exists public.sign_in_bonuses (
    user_id    uuid        primary key references auth.users (id) on delete cascade,
    granted_at timestamptz not null default now()
);

comment on table  public.sign_in_bonuses            is 'One row per user who has received their lifetime +5 sign-in bonus.';
comment on column public.sign_in_bonuses.granted_at is 'When the bonus was granted; quota function only honors bonuses granted today (UTC).';

alter table public.sign_in_bonuses enable row level security;

drop policy if exists sign_in_bonuses_select_own       on public.sign_in_bonuses;
drop policy if exists sign_in_bonuses_no_authed_write  on public.sign_in_bonuses;
drop policy if exists sign_in_bonuses_no_anon_write    on public.sign_in_bonuses;

create policy sign_in_bonuses_select_own
    on public.sign_in_bonuses
    for select
    to authenticated
    using (user_id = auth.uid());

create policy sign_in_bonuses_no_authed_write
    on public.sign_in_bonuses
    for insert
    to authenticated
    with check (false);

create policy sign_in_bonuses_no_anon_write
    on public.sign_in_bonuses
    for insert
    to anon
    with check (false);

-- ============================================================================
-- 3. get_quota_for_today(p_user_id uuid, p_anon_id text) -> json
-- ============================================================================
create or replace function public.get_quota_for_today(
    p_user_id uuid,
    p_anon_id text
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    v_window_start constant timestamptz := now() - interval '24 hours';
    v_base_limit   constant int         := 5;
    v_bonus_amount constant int         := 5;

    v_used        int := 0;
    v_oldest_used timestamptz;
    v_has_bonus   boolean := false;
    v_limit       int;
    v_reset_at    timestamptz;
begin
    if p_user_id is null and p_anon_id is null then
        return json_build_object(
            'used',     0,
            'limit',    v_base_limit,
            'resetAt',  null,
            'hasBonus', false
        );
    end if;

    if p_user_id is not null then
        select count(*), min(used_at)
          into v_used, v_oldest_used
          from public.chat_usage
         where user_id = p_user_id
           and used_at >= v_window_start;
    else
        select count(*), min(used_at)
          into v_used, v_oldest_used
          from public.chat_usage
         where anon_id = p_anon_id
           and used_at >= v_window_start;
    end if;

    if p_user_id is not null then
        select exists (
            select 1
              from public.sign_in_bonuses
             where user_id = p_user_id
               and granted_at >= date_trunc('day', now() at time zone 'utc')
        )
        into v_has_bonus;
    end if;

    v_limit := v_base_limit + case when v_has_bonus then v_bonus_amount else 0 end;

    v_reset_at := case
        when v_oldest_used is null then null
        else v_oldest_used + interval '24 hours'
    end;

    return json_build_object(
        'used',     v_used,
        'limit',    v_limit,
        'resetAt',  v_reset_at,
        'hasBonus', v_has_bonus
    );
end;
$$;

comment on function public.get_quota_for_today(uuid, text)
    is 'Returns json { used, limit, resetAt, hasBonus } for the given user_id or anon_id over a rolling 24h window.';

revoke all on function public.get_quota_for_today(uuid, text) from public;
grant execute on function public.get_quota_for_today(uuid, text) to anon, authenticated, service_role;
