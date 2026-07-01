-- ============================================================================
-- Hidden Hiqmah — Humane Streaks Migration (008)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor → New query. Idempotent.
-- ⚠️  Apply to a NON-PRODUCTION target first, verify, THEN promote to prod.
-- Requires 002 (daily checklist + streaks).
--
-- Makes streaks forgiving:
--   * streak_pauses          — travel/illness/menstruation breaks (date ranges)
--   * _consec_run_humane     — streak walk that SKIPS paused days + forgives a
--                              limited number of missed days (mercy), mirroring
--                              packages/ui/lib/daily/types.ts humaneRun()
--   * recompute_streaks      — REPLACED to feed paused dates + mercy + start
--   * start_streak_pause / end_streak_pause RPCs
--
-- NOTE: this recomputes EVERY user's streaks more leniently (a single missed day
-- no longer resets to 0, and paused days bridge the gap). That's the feature.
-- HUMANE_MERCY below must stay in sync with types.ts (currently 1).
-- ============================================================================

-- ============================================================================
-- 1. streak_pauses
-- ============================================================================
create table if not exists public.streak_pauses (
    id          uuid primary key default gen_random_uuid(),  -- built-in (pg_catalog)
    user_id     uuid not null references auth.users (id) on delete cascade,
    start_date  date not null,
    end_date    date,                                        -- null = ongoing (active)
    reason      text not null check (reason in ('travel','unwell','menses')),
    created_at  timestamptz not null default now()
);
create index if not exists streak_pauses_user_idx on public.streak_pauses (user_id, start_date desc);

alter table public.streak_pauses enable row level security;
drop policy if exists sp_select_own on public.streak_pauses;
create policy sp_select_own on public.streak_pauses
    for select to authenticated using (user_id = auth.uid());
-- Writes go through the definer RPCs below (no insert/update/delete policy).

-- ============================================================================
-- 2. Humane streak walk — mirrors types.ts humaneRun(). Pure/immutable.
--    Walks back from today: paused days transparent, qualifying days count,
--    missed days forgiven while mercy remains, today never breaks, stop at start.
-- ============================================================================
create or replace function public._consec_run_humane(
    p_dates  date[],   -- qualifying dates (membership-tested)
    p_paused date[],   -- paused dates
    p_today  date,
    p_mercy  int,
    p_start  date
) returns int language plpgsql immutable as $$
declare
    v_cursor date;
    v_run    int := 0;
    v_mercy  int := coalesce(p_mercy, 0);
    v_guard  int := 0;
begin
    if p_dates is null then return 0; end if;
    -- today never breaks: if today isn't qualifying, begin the walk at yesterday
    if p_today = any(p_dates) then v_cursor := p_today; else v_cursor := p_today - 1; end if;
    while v_guard < 3660 loop
        v_guard := v_guard + 1;
        if p_start is not null and v_cursor < p_start then exit; end if;
        if p_paused is not null and v_cursor = any(p_paused) then
            v_cursor := v_cursor - 1; continue;
        end if;
        if v_cursor = any(p_dates) then
            v_run := v_run + 1; v_cursor := v_cursor - 1; continue;
        end if;
        -- missed day
        if v_mercy > 0 then
            v_mercy := v_mercy - 1; v_cursor := v_cursor - 1; continue;
        end if;
        exit;
    end loop;
    return v_run;
end $$;

-- ============================================================================
-- 3. recompute_streaks — REPLACED to be pause + mercy aware.
--    (create or replace preserves the existing grant from 002.)
-- ============================================================================
create or replace function public.recompute_streaks(p_today date)
returns json language plpgsql security definer set search_path = public as $$
declare
    v_uid     uuid := auth.uid();
    v_overall int;
    v_prayer  int;
    v_paused  date[];
    v_start   date;
    v_mercy   int := 1;   -- HUMANE_MERCY — keep in sync with types.ts
begin
    if v_uid is null then raise exception 'auth required'; end if;

    -- Expand all pause ranges into a flat array of paused dates (ongoing → today).
    select coalesce(array_agg(d), '{}'::date[]) into v_paused
      from (
        select generate_series(
                 sp.start_date,
                 least(coalesce(sp.end_date, p_today), p_today),
                 interval '1 day'
               )::date as d
          from public.streak_pauses sp
         where sp.user_id = v_uid
      ) x;

    -- Calendar start boundary: don't treat days before the user began as misses.
    select min(local_date) into v_start
      from public.checklist_day where user_id = v_uid;

    select public._consec_run_humane(
             array_agg(local_date order by local_date desc), v_paused, p_today, v_mercy, v_start)
      into v_overall
      from public.checklist_day
     where user_id = v_uid and local_date <= p_today and status <> 'none';

    select public._consec_run_humane(
             array_agg(local_date order by local_date desc), v_paused, p_today, v_mercy, v_start)
      into v_prayer
      from public.checklist_day
     where user_id = v_uid and local_date <= p_today
       and prayers_total > 0 and prayers_done = prayers_total;

    v_overall := coalesce(v_overall, 0);
    v_prayer  := coalesce(v_prayer, 0);

    insert into public.user_streaks
        (user_id, overall_current, overall_best, prayer_current, prayer_best,
         last_overall_date, last_prayer_date)
    values (v_uid, v_overall, v_overall, v_prayer, v_prayer, p_today, p_today)
    on conflict (user_id) do update set
        overall_current   = excluded.overall_current,
        overall_best      = greatest(public.user_streaks.overall_best, excluded.overall_current),
        prayer_current    = excluded.prayer_current,
        prayer_best       = greatest(public.user_streaks.prayer_best, excluded.prayer_current),
        last_overall_date = excluded.last_overall_date,
        last_prayer_date  = excluded.last_prayer_date;

    return json_build_object('overallCurrent', v_overall, 'prayerCurrent', v_prayer);
end $$;

-- ============================================================================
-- 4. Pause RPCs (definer; each recomputes streaks immediately)
-- ============================================================================
create or replace function public.start_streak_pause(p_reason text, p_today date)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
    if v_uid is null then raise exception 'auth required'; end if;
    if p_reason not in ('travel','unwell','menses') then raise exception 'bad reason'; end if;
    if exists (select 1 from public.streak_pauses where user_id = v_uid and end_date is null) then
        return;  -- already paused
    end if;
    insert into public.streak_pauses (user_id, start_date, end_date, reason)
    values (v_uid, p_today, null, p_reason);
    perform public.recompute_streaks(p_today);
end $$;

create or replace function public.end_streak_pause(p_today date)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
    if v_uid is null then raise exception 'auth required'; end if;
    update public.streak_pauses set end_date = p_today
     where user_id = v_uid and end_date is null;
    perform public.recompute_streaks(p_today);
end $$;

-- ============================================================================
-- 5. Grants
-- ============================================================================
revoke all on function public.start_streak_pause(text, date) from public, anon;
revoke all on function public.end_streak_pause(date) from public, anon;
grant execute on function public.start_streak_pause(text, date) to authenticated;
grant execute on function public.end_streak_pause(date) to authenticated;

-- ============================================================================
-- Verify (as a signed-in user):
--   select public.start_streak_pause('travel', current_date);
--   select * from public.streak_pauses;            -- one row, end_date null
--   select public.recompute_streaks(current_date); -- paused days won't break it
--   select public.end_streak_pause(current_date);  -- end_date set to today
-- ============================================================================
