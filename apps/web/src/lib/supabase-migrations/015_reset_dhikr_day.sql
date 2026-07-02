-- ============================================================================
-- Hidden Hiqmah — migration 015: separate "reset today" from lifetime (DHIKR-2)
-- ============================================================================
-- Run in Supabase Dashboard → SQL Editor. Safe to re-run (CREATE OR REPLACE).
--
-- BUG (DHIKR-2): resetting a dhikr also wiped its LIFETIME total. set_dhikr_count
-- applies the delta (new - old) to dhikr_lifetime — for a reset that delta is
-- (0 - today) = negative, so lifetime lost today's count. We can't just make
-- set_dhikr_count monotonic because it's ALSO the checklist check/uncheck
-- primitive (its delta math keeps toggle re-checks net-zero).
--
-- FIX: a dedicated reset_dhikr_day() that zeros TODAY only and leaves lifetime
-- alone. Wired to the explicit "reset" affordances in the app. After this,
-- lifetime may exceed sum(dhikr_daily) — that is intended; do NOT run
-- reconcile_dhikr_lifetime() (it would re-collapse lifetime back to the sum).
-- ============================================================================

create or replace function public.reset_dhikr_day(
    p_dhikr_key  text,
    p_local_date date
)
returns json language plpgsql security definer set search_path = public as $$
declare
    v_uid  uuid := auth.uid();
    v_life int;
begin
    if v_uid is null then raise exception 'auth required'; end if;

    -- Zero TODAY's count. Lifetime is intentionally NOT reduced (unlike
    -- set_dhikr_count), so "reset today" preserves the lifetime tally.
    insert into public.dhikr_daily (user_id, dhikr_key, local_date, count)
    values (v_uid, p_dhikr_key, p_local_date, 0)
    on conflict (user_id, dhikr_key, local_date) do update set count = 0;

    select count into v_life from public.dhikr_lifetime
     where user_id = v_uid and dhikr_key = p_dhikr_key;
    v_life := coalesce(v_life, 0);

    -- If this dhikr is a keyed checklist item for the day, un-complete it and
    -- refresh the day rollup + streaks (mirrors set_dhikr_count going to 0).
    if exists (select 1 from public.checklist_day where user_id = v_uid and local_date = p_local_date) then
        update public.checklist_day_items i
           set done = false
         where i.user_id = v_uid and i.local_date = p_local_date
           and i.dhikr_key = p_dhikr_key and i.goal_count is not null;
        perform public._refresh_checklist_day(v_uid, p_local_date);
        perform public.recompute_streaks(p_local_date);
    end if;

    return json_build_object('daily', 0, 'lifetime', v_life);
end $$;

revoke all on function public.reset_dhikr_day(text, date) from public;
grant execute on function public.reset_dhikr_day(text, date) to authenticated, service_role;
