-- ============================================================================
-- Hidden Hiqmah — 011 · Ask Hiqmah quota update + per-message cost logging
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run in Supabase Dashboard → SQL Editor → New query.
--
-- Changes:
--   1. chat_usage gains token columns so we can compute real $/message.
--   2. get_quota_for_today: signed-in free limit 5 → 15/day; anon stays 5/day.
--      (Retires the old "+5 on first sign-in day" bonus — signed-in is now a
--      flat 15. The sign_in_bonuses table is left in place but unused.)
-- Safe to run before or after the matching app deploy: the route logs tokens
-- only if the columns exist (insert is wrapped in try/catch), and the new
-- limits take effect the moment this function is replaced.
-- ============================================================================

-- 1. Token columns for cost tracking ----------------------------------------
alter table public.chat_usage
    add column if not exists input_tokens          int,
    add column if not exists output_tokens         int,
    add column if not exists cache_read_tokens     int,
    add column if not exists cache_creation_tokens int;

comment on column public.chat_usage.input_tokens          is 'Sum of Anthropic input_tokens across the request''s model calls (excludes cache reads/writes).';
comment on column public.chat_usage.output_tokens         is 'Sum of Anthropic output_tokens across the request''s model calls.';
comment on column public.chat_usage.cache_read_tokens     is 'Sum of cache_read_input_tokens (billed ~0.1x input).';
comment on column public.chat_usage.cache_creation_tokens is 'Sum of cache_creation_input_tokens (billed ~1.25x input).';

-- 2. Quota: anon 5/day, signed-in 15/day ------------------------------------
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
    v_anon_limit   constant int         := 5;
    v_user_limit   constant int         := 15;

    v_signed_in   boolean := p_user_id is not null;
    v_used        int := 0;
    v_oldest_used timestamptz;
    v_limit       int;
    v_reset_at    timestamptz;
begin
    if p_user_id is null and p_anon_id is null then
        return json_build_object(
            'used',     0,
            'limit',    v_anon_limit,
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

    v_limit := case when v_signed_in then v_user_limit else v_anon_limit end;

    v_reset_at := case
        when v_oldest_used is null then null
        else v_oldest_used + interval '24 hours'
    end;

    -- hasBonus now means "signed in → elevated limit" (kept for response shape).
    return json_build_object(
        'used',     v_used,
        'limit',    v_limit,
        'resetAt',  v_reset_at,
        'hasBonus', v_signed_in
    );
end;
$$;

revoke all on function public.get_quota_for_today(uuid, text) from public;
grant execute on function public.get_quota_for_today(uuid, text) to anon, authenticated, service_role;
