-- ============================================================================
-- Hidden Hiqmah — migration 014: fix the Daily Checklist duplicate-seed race
-- ============================================================================
-- Run in Supabase Dashboard → SQL Editor. Safe to re-run (CREATE OR REPLACE +
-- an idempotent one-time de-dup).
--
-- BUG (CHECKLIST-1): every checklist item showed TWICE for signed-in users.
-- seed_user_checklist() and import_local_daily() were check-then-insert with NO
-- lock. On first sign-in the mobile home calls ensureSeeded() from two
-- components on the same commit, so two concurrent seed calls both passed the
-- "already seeded?" guard against the still-empty table and each inserted the 15
-- default items → 30 rows. (The sibling materialize_checklist_day already guards
-- the identical race with pg_advisory_xact_lock.)
--
-- FIX: take a per-user advisory transaction lock before the run-once guard in
-- BOTH functions. seed + import share the SAME lock key so they also serialize
-- against each other. The second caller then sees the seeded rows and returns.
-- ============================================================================

-- 1) seed_user_checklist — lock in front of the run-once guard.
create or replace function public.seed_user_checklist()
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
    if v_uid is null then raise exception 'auth required'; end if;
    perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));
    if exists (select 1 from public.checklist_user_items where user_id = v_uid) then
        return;  -- already seeded / migrated
    end if;
    insert into public.checklist_user_items
        (user_id, source_key, label, kind, goal_count, dhikr_key, sort_order, is_active)
    select v_uid, key, label, kind, goal_count, dhikr_key, sort_order, true
      from public.checklist_default_items
     order by sort_order;
end $$;

-- 2) import_local_daily — same per-user lock; body otherwise unchanged from 005.
create or replace function public.import_local_daily(p_payload jsonb, p_today date)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_days int;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  -- Run-once guard: only import for a user who hasn't started a server checklist.
  if exists (select 1 from public.checklist_user_items where user_id = v_uid) then
    return json_build_object('imported', false, 'reason', 'already_exists');
  end if;

  -- 1. User list
  insert into public.checklist_user_items
    (id, user_id, source_key, label, kind, goal_count, dhikr_key, sort_order, is_active)
  select (e->>'id')::uuid, v_uid, e->>'sourceKey', e->>'label', e->>'kind',
         (e->>'goalCount')::int, e->>'dhikrKey',
         coalesce((e->>'sortOrder')::int, 0), coalesce((e->>'isActive')::boolean, true)
    from jsonb_array_elements(coalesce(p_payload->'userItems', '[]'::jsonb)) e;

  -- 2. Per-day rollups
  insert into public.checklist_day
    (user_id, local_date, total_items, done_items, prayers_total, prayers_done, status)
  select v_uid, (kv.key)::date,
         coalesce((kv.value->>'totalItems')::int, 0),
         least(coalesce((kv.value->>'doneItems')::int, 0), coalesce((kv.value->>'totalItems')::int, 0)),
         coalesce((kv.value->>'prayersTotal')::int, 0),
         least(coalesce((kv.value->>'prayersDone')::int, 0), coalesce((kv.value->>'prayersTotal')::int, 0)),
         coalesce(kv.value->>'status', 'none')
    from jsonb_each(coalesce(p_payload->'dayRollup', '{}'::jsonb)) kv;

  -- 3. Frozen per-day snapshot items
  insert into public.checklist_day_items
    (user_id, local_date, user_item_id, label_snapshot, kind, goal_count, dhikr_key,
     sort_order_snapshot, count_done, done, is_prayer)
  select v_uid, (d.key)::date, (it->>'userItemId')::uuid, it->>'label', it->>'kind',
         (it->>'goalCount')::int, it->>'dhikrKey',
         coalesce((it->>'sortOrder')::int, 0), coalesce((it->>'countDone')::int, 0),
         coalesce((it->>'done')::boolean, false), coalesce((it->>'isPrayer')::boolean, false)
    from jsonb_each(coalesce(p_payload->'dayItems', '{}'::jsonb)) d,
         jsonb_array_elements(d.value) it
   where (it->>'userItemId') is not null;

  -- 4. Dhikr daily + lifetime
  insert into public.dhikr_daily (user_id, dhikr_key, local_date, count)
  select v_uid, k.key, (dt.key)::date, (dt.value::text)::int
    from jsonb_each(coalesce(p_payload->'dhikrDaily', '{}'::jsonb)) k,
         jsonb_each(k.value) dt;

  insert into public.dhikr_lifetime (user_id, dhikr_key, count)
  select v_uid, kv.key, (kv.value::text)::int
    from jsonb_each(coalesce(p_payload->'dhikrLifetime', '{}'::jsonb)) kv
  on conflict (user_id, dhikr_key) do update set count = excluded.count;

  -- 5. Streaks from the imported history
  perform public.recompute_streaks(p_today);

  select count(*) into v_days from public.checklist_day where user_id = v_uid;
  return json_build_object('imported', true, 'days', v_days);
end $$;

revoke all on function public.import_local_daily(jsonb, date) from public;
grant execute on function public.import_local_daily(jsonb, date) to authenticated, service_role;

-- 3) One-time de-dup of rows already created by the race: keep the first active
--    default row per (user, source_key), deactivate the rest.
--    NOTE: this does NOT unfreeze a DAY that was already materialized with the
--    duplicated snapshot (checklist_day_items). An account that already opened a
--    doubled day may still show 2× for THAT day — reset it (see
--    _reset-test-account.sql) or delete that day's checklist_day +
--    checklist_day_items rows so it re-materializes from the de-duped list.
with ranked as (
  select id,
         row_number() over (partition by user_id, source_key
                            order by sort_order, id) as rn
    from public.checklist_user_items
   where is_active and source_key is not null
)
update public.checklist_user_items u
   set is_active = false
  from ranked r
 where u.id = r.id and r.rn > 1;
