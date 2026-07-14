-- ============================================================================
-- Hidden Hiqmah — 024 · Ask Hiqmah quota: signed-in 15 → 100/day (temporary)
--
-- Usage is essentially founder-only right now, so the signed-in cap is raised
-- to keep testing friction-free. Anon stays 5/day (the abuse guard).
-- TEMPORARY — revisit before real user growth.
--
-- Verbatim copy of the 011 function with only v_user_limit changed.
-- This function is the single enforcement point (the API route just calls it),
-- so the new limit takes effect the moment it is replaced. Re-run safe.
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
    v_anon_limit   constant int         := 5;
    v_user_limit   constant int         := 100;  -- was 15 (011); temporary bump

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

    -- hasBonus means "signed in → elevated limit" (kept for response shape).
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
