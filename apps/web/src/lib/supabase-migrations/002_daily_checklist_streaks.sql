-- ============================================================================
-- Hidden Hiqmah — Daily Checklist + Streaks + Reflections Migration
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor → New query. Idempotent.
-- Implements daily-v1-spec.md (hardened). Provisions:
--   * checklist_default_items  — reference seed list (public read)
--   * checklist_user_items     — per-user editable list (self CRUD)
--   * checklist_day_items      — per-day FROZEN snapshot (source of truth)
--   * checklist_day            — per-day rollup cache (status/streak input)
--   * dhikr_daily / dhikr_lifetime — shared dhikr counters (Worship + checklist)
--   * user_streaks             — derived cache (authority = checklist_day)
--   * reminders / reminder_saves — Reflections content + bookmarks
--   * RPCs (SECURITY DEFINER) that enforce the invariants:
--       seed_user_checklist, materialize_checklist_day, set_checklist_item_done,
--       set_checklist_count, increment_dhikr, recompute_streaks,
--       reconcile_dhikr_lifetime
--
-- Invariants enforced here (not trusted to the client):
--   * total_items is FROZEN at day materialization (never a live count).
--   * Keyed dhikr counts live ONLY in dhikr_daily (never duplicated on day_items).
--   * Streaks are recomputed by a real backward walk; today never breaks them.
--   * All counter/rollup/streak writes go through definer RPCs; clients cannot
--     forge them. Day key (local_date) is always supplied by the client (device
--     local midnight) — the DB never derives it.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. checklist_default_items  (reference — public read)
-- ============================================================================
create table if not exists public.checklist_default_items (
    id          uuid primary key default gen_random_uuid(),
    key         text not null unique,
    label       text not null,
    kind        text not null check (kind in ('prayer','dhikr','task')),
    goal_count  int,
    dhikr_key   text,
    sort_order  int  not null
);

comment on table public.checklist_default_items is 'Seed checklist everyone starts with. Copied into checklist_user_items on first use.';

-- ============================================================================
-- 2. checklist_user_items  (per-user, editable — self CRUD)
-- ============================================================================
create table if not exists public.checklist_user_items (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users (id) on delete cascade,
    source_key  text,                         -- default it came from; null = user-created
    label       text not null,
    kind        text not null check (kind in ('prayer','dhikr','task')),
    goal_count  int,
    dhikr_key   text,
    sort_order  int  not null default 0,
    is_active   boolean not null default true -- soft-delete (removals apply next day)
);

create index if not exists checklist_user_items_user_idx
    on public.checklist_user_items (user_id, sort_order)
    where is_active;

comment on table public.checklist_user_items is 'Per-user editable checklist. Edits apply going forward; never rewrites materialized days.';

-- ============================================================================
-- 3. checklist_day_items  (per-day FROZEN snapshot — source of truth)
-- ============================================================================
create table if not exists public.checklist_day_items (
    user_id             uuid not null references auth.users (id) on delete cascade,
    local_date          date not null,
    user_item_id        uuid,                 -- nullable: item may be deleted later
    label_snapshot      text not null,
    kind                text not null,
    goal_count          int,
    dhikr_key           text,                 -- frozen; keyed dhikr derive count from dhikr_daily
    sort_order_snapshot int  not null,
    count_done          int  not null default 0,  -- ONLY for count items WITHOUT a dhikr_key
    done                boolean not null default false,
    is_prayer           boolean not null default false,
    primary key (user_id, local_date, user_item_id)
);

create index if not exists checklist_day_items_user_date_idx
    on public.checklist_day_items (user_id, local_date);

comment on table public.checklist_day_items is 'Frozen per-day snapshot of the list as it was that day. Calendar detail + denominator come from here.';

-- ============================================================================
-- 4. checklist_day  (per-day rollup cache)
-- ============================================================================
create table if not exists public.checklist_day (
    user_id       uuid not null references auth.users (id) on delete cascade,
    local_date    date not null,
    total_items   int  not null default 0,   -- FROZEN at materialization
    done_items    int  not null default 0,
    prayers_total int  not null default 0,
    prayers_done  int  not null default 0,
    status        text not null default 'none' check (status in ('none','partial','full')),
    primary key (user_id, local_date),
    constraint checklist_day_done_le_total check (done_items <= total_items)
);

comment on table public.checklist_day is 'Per-day rollup. status grading + streak walk read from here. total_items frozen.';

-- ============================================================================
-- 5. dhikr_daily / dhikr_lifetime  (shared by Worship + checklist)
-- ============================================================================
create table if not exists public.dhikr_daily (
    user_id    uuid not null references auth.users (id) on delete cascade,
    dhikr_key  text not null,
    local_date date not null,
    count      int  not null default 0,
    primary key (user_id, dhikr_key, local_date)
);

create table if not exists public.dhikr_lifetime (
    user_id    uuid not null references auth.users (id) on delete cascade,
    dhikr_key  text not null,
    count      int  not null default 0,       -- authority = sum(dhikr_daily); maintained + reconcilable
    primary key (user_id, dhikr_key)
);

comment on table public.dhikr_lifetime is 'Lifetime dhikr tally. Authority = sum(dhikr_daily); kept in sync by increment_dhikr + reconcile_dhikr_lifetime.';

-- ============================================================================
-- 6. user_streaks  (derived cache; authority = checklist_day)
-- ============================================================================
create table if not exists public.user_streaks (
    user_id           uuid primary key references auth.users (id) on delete cascade,
    overall_current   int  not null default 0,
    overall_best      int  not null default 0,
    prayer_current    int  not null default 0,
    prayer_best       int  not null default 0,
    last_overall_date date,
    last_prayer_date  date
);

comment on table public.user_streaks is 'Fast-read streak cache. Recomputed from checklist_day by recompute_streaks(); never authoritative.';

-- ============================================================================
-- 7. reminders / reminder_saves  (Reflections)
-- ============================================================================
create table if not exists public.reminders (
    id          uuid primary key default gen_random_uuid(),
    theme       text not null,
    tone        text not null check (tone in ('hope','accountability')),
    text_en     text not null,
    arabic      text,
    translit    text,
    source_kind text not null check (source_kind in ('quran','hadith')),
    source_ref  text not null,
    verified    boolean not null default false
);

create index if not exists reminders_theme_idx on public.reminders (theme);

create table if not exists public.reminder_saves (
    user_id     uuid not null references auth.users (id) on delete cascade,
    reminder_id uuid not null references public.reminders (id) on delete cascade,
    saved_at    timestamptz not null default now(),
    primary key (user_id, reminder_id)
);

-- ============================================================================
-- 8. RLS
-- ============================================================================
-- Content / reference: public read, no client writes.
alter table public.checklist_default_items enable row level security;
alter table public.reminders               enable row level security;

drop policy if exists cdi_public_read on public.checklist_default_items;
create policy cdi_public_read on public.checklist_default_items
    for select to anon, authenticated using (true);

drop policy if exists reminders_public_read on public.reminders;
create policy reminders_public_read on public.reminders
    for select to anon, authenticated using (true);

-- User-owned editable: checklist_user_items (full self CRUD), reminder_saves.
alter table public.checklist_user_items enable row level security;

drop policy if exists cui_select_own on public.checklist_user_items;
drop policy if exists cui_insert_own on public.checklist_user_items;
drop policy if exists cui_update_own on public.checklist_user_items;
drop policy if exists cui_delete_own on public.checklist_user_items;
create policy cui_select_own on public.checklist_user_items
    for select to authenticated using (user_id = auth.uid());
create policy cui_insert_own on public.checklist_user_items
    for insert to authenticated with check (user_id = auth.uid());
create policy cui_update_own on public.checklist_user_items
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cui_delete_own on public.checklist_user_items
    for delete to authenticated using (user_id = auth.uid());

alter table public.reminder_saves enable row level security;
drop policy if exists rs_select_own on public.reminder_saves;
drop policy if exists rs_insert_own on public.reminder_saves;
drop policy if exists rs_delete_own on public.reminder_saves;
create policy rs_select_own on public.reminder_saves
    for select to authenticated using (user_id = auth.uid());
create policy rs_insert_own on public.reminder_saves
    for insert to authenticated with check (user_id = auth.uid());
create policy rs_delete_own on public.reminder_saves
    for delete to authenticated using (user_id = auth.uid());

-- Server-mutated caches/aggregates: SELECT own only; writes via SECURITY DEFINER RPCs.
do $$
declare t text;
begin
  foreach t in array array['checklist_day_items','checklist_day','dhikr_daily','dhikr_lifetime','user_streaks']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t||'_select_own', t);
    execute format('drop policy if exists %I on public.%I;', t||'_no_write_authed', t);
    execute format($f$create policy %I on public.%I for select to authenticated using (user_id = auth.uid());$f$, t||'_select_own', t);
    execute format($f$create policy %I on public.%I for insert to authenticated with check (false);$f$, t||'_no_write_authed', t);
  end loop;
end $$;

-- ============================================================================
-- 9. Helper functions (internal — not granted to clients)
-- ============================================================================

-- Consecutive run of qualifying dates ending at today (today never breaks it).
create or replace function public._consec_run(p_dates date[], p_today date)
returns int language plpgsql immutable as $$
declare v_d date; v_expected date := p_today; v_run int := 0;
begin
    if p_dates is null then return 0; end if;
    foreach v_d in array p_dates loop
        if v_d = v_expected then
            v_run := v_run + 1; v_expected := v_d - 1;
        elsif v_d = v_expected - 1 and v_expected = p_today then
            -- today not yet qualifying; streak continues from yesterday
            v_run := v_run + 1; v_expected := v_d - 1;
        else
            exit;  -- calendar gap → streak breaks
        end if;
    end loop;
    return v_run;
end $$;

-- Recompute a day's rollup (done_items / prayers_done / status) from its frozen items.
-- total_items / prayers_total are NOT touched here (frozen at materialization).
create or replace function public._refresh_checklist_day(p_uid uuid, p_local_date date)
returns void language plpgsql security definer set search_path = public as $$
begin
    update public.checklist_day cd
       set done_items   = sub.done_items,
           prayers_done = sub.prayers_done,
           status = case
                        when cd.total_items = 0 or sub.done_items = 0 then 'none'
                        when sub.done_items >= cd.total_items          then 'full'
                        else 'partial'
                    end
      from (
            select count(*) filter (where done)                as done_items,
                   count(*) filter (where done and is_prayer)  as prayers_done
              from public.checklist_day_items
             where user_id = p_uid and local_date = p_local_date
           ) sub
     where cd.user_id = p_uid and cd.local_date = p_local_date;
end $$;

-- ============================================================================
-- 10. Public RPCs (SECURITY DEFINER). All derive the user from auth.uid();
--     the client always passes its device-local date.
-- ============================================================================

-- Seed the per-user list from defaults. Idempotent (the run-once guard).
create or replace function public.seed_user_checklist()
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
    if v_uid is null then raise exception 'auth required'; end if;
    if exists (select 1 from public.checklist_user_items where user_id = v_uid) then
        return;  -- already seeded / migrated
    end if;
    insert into public.checklist_user_items
        (user_id, source_key, label, kind, goal_count, dhikr_key, sort_order, is_active)
    select v_uid, key, label, kind, goal_count, dhikr_key, sort_order, true
      from public.checklist_default_items
     order by sort_order;
end $$;

-- Materialize a day: freeze the active list into checklist_day_items + rollup row.
-- Idempotent — only fires on the first interaction of a local_date.
create or replace function public.materialize_checklist_day(p_local_date date)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
    if v_uid is null then raise exception 'auth required'; end if;
    -- Serialize concurrent first-materialization of the same (user, day) so a
    -- race (e.g. a Worship increment + opening the checklist together) can't both
    -- pass the guard below and collide on the primary key.
    perform pg_advisory_xact_lock(hashtextextended(v_uid::text || p_local_date::text, 0));
    if exists (select 1 from public.checklist_day where user_id = v_uid and local_date = p_local_date) then
        return;
    end if;

    insert into public.checklist_day_items
        (user_id, local_date, user_item_id, label_snapshot, kind, goal_count,
         dhikr_key, sort_order_snapshot, count_done, done, is_prayer)
    select v_uid, p_local_date, ui.id, ui.label, ui.kind, ui.goal_count,
           ui.dhikr_key, ui.sort_order, 0, false, (ui.kind = 'prayer')
      from public.checklist_user_items ui
     where ui.user_id = v_uid and ui.is_active = true;

    insert into public.checklist_day
        (user_id, local_date, total_items, done_items, prayers_total, prayers_done, status)
    select v_uid, p_local_date,
           count(*),
           0,
           count(*) filter (where is_prayer),
           0,
           'none'
      from public.checklist_day_items
     where user_id = v_uid and local_date = p_local_date;

    -- Reconcile any keyed dhikr already completed earlier today (e.g. counted in
    -- Worship before the checklist was opened) so those items show as done.
    update public.checklist_day_items i
       set done = true
     where i.user_id = v_uid and i.local_date = p_local_date
       and i.dhikr_key is not null and i.goal_count is not null and not i.done
       and coalesce((select d.count from public.dhikr_daily d
                      where d.user_id = v_uid and d.dhikr_key = i.dhikr_key
                        and d.local_date = p_local_date), 0) >= i.goal_count;
    perform public._refresh_checklist_day(v_uid, p_local_date);
end $$;

-- Recompute both streak caches by a real backward walk over checklist_day.
create or replace function public.recompute_streaks(p_today date)
returns json language plpgsql security definer set search_path = public as $$
declare
    v_uid uuid := auth.uid();
    v_overall int;
    v_prayer  int;
begin
    if v_uid is null then raise exception 'auth required'; end if;

    select public._consec_run(array_agg(local_date order by local_date desc), p_today)
      into v_overall
      from public.checklist_day
     where user_id = v_uid and local_date <= p_today and status <> 'none';

    select public._consec_run(array_agg(local_date order by local_date desc), p_today)
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

    return json_build_object(
        'overallCurrent', v_overall,
        'prayerCurrent',  v_prayer
    );
end $$;

-- Toggle a checklist item's done state (manual check). p_local_date = today.
create or replace function public.set_checklist_item_done(
    p_local_date   date,
    p_user_item_id uuid,
    p_done         boolean
)
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
    if v_uid is null then raise exception 'auth required'; end if;
    perform public.materialize_checklist_day(p_local_date);
    update public.checklist_day_items
       set done = p_done
     where user_id = v_uid and local_date = p_local_date and user_item_id = p_user_item_id;
    perform public._refresh_checklist_day(v_uid, p_local_date);
    return public.recompute_streaks(p_local_date);
end $$;

-- Set the count for a NON-dhikr count item (e.g. "Read Qur'ān — 1 page").
-- Auto-checks at goal. Keyed dhikr items use increment_dhikr instead.
create or replace function public.set_checklist_count(
    p_local_date   date,
    p_user_item_id uuid,
    p_count        int
)
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
    if v_uid is null then raise exception 'auth required'; end if;
    perform public.materialize_checklist_day(p_local_date);
    update public.checklist_day_items i
       set count_done = greatest(p_count, 0),
           done = (i.goal_count is not null and greatest(p_count, 0) >= i.goal_count)
     where i.user_id = v_uid and i.local_date = p_local_date
       and i.user_item_id = p_user_item_id and i.dhikr_key is null
       and i.goal_count is not null;   -- never clobber a goal-less (boolean) task
    perform public._refresh_checklist_day(v_uid, p_local_date);
    return public.recompute_streaks(p_local_date);
end $$;

-- Atomic dhikr increment shared by Worship + checklist. Bumps daily + lifetime,
-- auto-completes any matching keyed checklist item at goal, refreshes streaks.
create or replace function public.increment_dhikr(
    p_dhikr_key  text,
    p_local_date date,
    p_delta      int default 1
)
returns json language plpgsql security definer set search_path = public as $$
declare
    v_uid   uuid := auth.uid();
    v_delta int  := greatest(coalesce(p_delta, 1), 0);
    v_daily int;
    v_life  int;
begin
    if v_uid is null then raise exception 'auth required'; end if;

    insert into public.dhikr_daily (user_id, dhikr_key, local_date, count)
    values (v_uid, p_dhikr_key, p_local_date, v_delta)
    on conflict (user_id, dhikr_key, local_date)
        do update set count = public.dhikr_daily.count + v_delta
    returning count into v_daily;

    insert into public.dhikr_lifetime (user_id, dhikr_key, count)
    values (v_uid, p_dhikr_key, v_delta)
    on conflict (user_id, dhikr_key)
        do update set count = public.dhikr_lifetime.count + v_delta
    returning count into v_life;

    -- Auto-complete any keyed checklist item for today that has reached its goal.
    if exists (select 1 from public.checklist_day where user_id = v_uid and local_date = p_local_date) then
        update public.checklist_day_items i
           set done = true
         where i.user_id = v_uid and i.local_date = p_local_date
           and i.dhikr_key = p_dhikr_key and i.goal_count is not null
           and not i.done and v_daily >= i.goal_count;
        perform public._refresh_checklist_day(v_uid, p_local_date);
        perform public.recompute_streaks(p_local_date);
    end if;

    return json_build_object('daily', v_daily, 'lifetime', v_life);
end $$;

-- Reconcile lifetime = sum(daily) per key (call on app open to heal drift).
create or replace function public.reconcile_dhikr_lifetime()
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
    if v_uid is null then raise exception 'auth required'; end if;
    update public.dhikr_lifetime l
       set count = sub.total
      from (
            select dhikr_key, sum(count) as total
              from public.dhikr_daily
             where user_id = v_uid
             group by dhikr_key
           ) sub
     where l.user_id = v_uid and l.dhikr_key = sub.dhikr_key
       and l.count <> sub.total;
end $$;

-- Set a keyed dhikr's count for a day to an ABSOLUTE value (manual edit, reset
-- to 0, or uncheck). Adjusts lifetime by the delta (floored at 0) and recomputes
-- the matching keyed checklist item's done state up OR down.
create or replace function public.set_dhikr_count(
    p_dhikr_key  text,
    p_local_date date,
    p_count      int
)
returns json language plpgsql security definer set search_path = public as $$
declare
    v_uid  uuid := auth.uid();
    v_new  int  := greatest(coalesce(p_count, 0), 0);
    v_old  int;
    v_life int;
begin
    if v_uid is null then raise exception 'auth required'; end if;

    select count into v_old from public.dhikr_daily
     where user_id = v_uid and dhikr_key = p_dhikr_key and local_date = p_local_date;
    v_old := coalesce(v_old, 0);

    insert into public.dhikr_daily (user_id, dhikr_key, local_date, count)
    values (v_uid, p_dhikr_key, p_local_date, v_new)
    on conflict (user_id, dhikr_key, local_date) do update set count = v_new;

    insert into public.dhikr_lifetime (user_id, dhikr_key, count)
    values (v_uid, p_dhikr_key, v_new)
    on conflict (user_id, dhikr_key)
        do update set count = greatest(public.dhikr_lifetime.count + (v_new - v_old), 0)
    returning count into v_life;

    if exists (select 1 from public.checklist_day where user_id = v_uid and local_date = p_local_date) then
        update public.checklist_day_items i
           set done = (v_new >= i.goal_count)
         where i.user_id = v_uid and i.local_date = p_local_date
           and i.dhikr_key = p_dhikr_key and i.goal_count is not null;
        perform public._refresh_checklist_day(v_uid, p_local_date);
        perform public.recompute_streaks(p_local_date);
    end if;

    return json_build_object('daily', v_new, 'lifetime', v_life);
end $$;

-- ============================================================================
-- 11. Grants — RPCs are authenticated-only (signed-out uses the local adapter).
-- ============================================================================
revoke all on function public.seed_user_checklist()                        from public;
revoke all on function public.materialize_checklist_day(date)              from public;
revoke all on function public.recompute_streaks(date)                      from public;
revoke all on function public.set_checklist_item_done(date, uuid, boolean) from public;
revoke all on function public.set_checklist_count(date, uuid, int)         from public;
revoke all on function public.increment_dhikr(text, date, int)             from public;
revoke all on function public.reconcile_dhikr_lifetime()                   from public;
revoke all on function public.set_dhikr_count(text, date, int)             from public;
-- Internal helpers must NEVER be client-callable: create grants EXECUTE to
-- PUBLIC by default, and _refresh_checklist_day takes a caller-supplied uid.
revoke all on function public._refresh_checklist_day(uuid, date)           from public;
revoke all on function public._consec_run(date[], date)                    from public;

grant execute on function public.seed_user_checklist()                        to authenticated, service_role;
grant execute on function public.materialize_checklist_day(date)              to authenticated, service_role;
grant execute on function public.recompute_streaks(date)                      to authenticated, service_role;
grant execute on function public.set_checklist_item_done(date, uuid, boolean) to authenticated, service_role;
grant execute on function public.set_checklist_count(date, uuid, int)         to authenticated, service_role;
grant execute on function public.increment_dhikr(text, date, int)             to authenticated, service_role;
grant execute on function public.reconcile_dhikr_lifetime()                   to authenticated, service_role;
grant execute on function public.set_dhikr_count(text, date, int)             to authenticated, service_role;

-- ============================================================================
-- 12. Seed the default checklist (idempotent on key)
-- ============================================================================
insert into public.checklist_default_items (key, label, kind, goal_count, dhikr_key, sort_order) values
    ('fajr',            'Fajr prayer',                 'prayer', null, null,            1),
    ('morning_adhkar',  'Morning adhkār',              'dhikr',  null, 'morning_adhkar', 2),
    ('quran_page',      'Read Qur''ān — 1 page',       'task',   1,    null,            3),
    ('duha',            'Ḍuḥā prayer',                 'task',   null, null,            4),
    ('dhuhr',           'Dhuhr prayer',                'prayer', null, null,            5),
    ('asr',             'ʿAsr prayer',                 'prayer', null, null,            6),
    ('salawat',         'Ṣalawāt on the Prophet ﷺ',    'dhikr',  10,   'salawat',       7),
    ('istighfar',       'Istighfār',                   'dhikr',  100,  'istighfar',     8),
    ('sadaqah',         'Give ṣadaqah',                'task',   null, null,            9),
    ('maghrib',         'Maghrib prayer',              'prayer', null, null,            10),
    ('evening_adhkar',  'Evening adhkār',              'dhikr',  null, 'evening_adhkar', 11),
    ('isha',            'ʿIshā prayer',                'prayer', null, null,            12),
    ('dua_parents',     'Du''ā for parents',           'task',   null, null,            13),
    ('witr',            'Witr prayer',                 'task',   null, null,            14),
    ('surah_mulk',      'Surah al-Mulk before sleep',  'dhikr',  null, 'surah_mulk',    15)
on conflict (key) do nothing;

-- ============================================================================
-- Done. Verify: select count(*) from public.checklist_default_items;  -- 15
-- ============================================================================
