-- ============================================================================
-- Hidden Hiqmah — import a signed-out user's local Daily data on sign-in
-- ============================================================================
-- Run in Supabase Dashboard → SQL Editor. Idempotent (per user: aborts if the
-- user already has a checklist).
--
-- The local adapter store (localStorage "hiqmah-daily-v2") mirrors this schema
-- exactly and uses real UUID item ids, so we transplant it 1:1 — no id remap.
-- Payload shape = the local store JSON:
--   { userItems:[{id,sourceKey,label,kind,goalCount,dhikrKey,sortOrder,isActive}],
--     dayItems:{ "YYYY-MM-DD":[{userItemId,label,kind,goalCount,dhikrKey,
--                               sortOrder,countDone,done,isPrayer}] },
--     dayRollup:{ "YYYY-MM-DD":{totalItems,doneItems,prayersTotal,prayersDone,status} },
--     dhikrDaily:{ key:{ "YYYY-MM-DD":count } },
--     dhikrLifetime:{ key:count } }
-- ============================================================================

create or replace function public.import_local_daily(p_payload jsonb, p_today date)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_days int;
begin
  if v_uid is null then raise exception 'auth required'; end if;

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
