-- ============================================================================
-- Hidden Hiqmah — Remote-push opt-outs + weekly duʿā schedule (030)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run in Supabase Dashboard → SQL Editor → New query. Idempotent.
-- ⚠️  Apply to a NON-PRODUCTION target first, verify, THEN promote to prod.
-- Requires 006 (profiles), 025 (device_tokens), 026 (pg_cron/pg_net),
--   027 (circle_push + set_my_circle_push pattern), 029 (push_post/push_settings).
--
-- WHY: with default settings the app was sending 14 notifications a day. The
-- on-device scheduler ALREADY delivers Today's Verse (8am), Today's Hadith
-- (1:30pm) and Today's Reminder (8pm) every single day, so the remote cron's
-- ayah → hadith → duʿā rotation duplicated local content two days out of three;
-- only the duʿā was ever additive. Worse, both remote pushes read EVERY row of
-- device_tokens and consulted no preference at all, so a user who switched
-- everything off in Settings still got them.
--
-- Founder decision, implemented here:
--   1. The content push becomes DUA-ONLY and WEEKLY (Wednesday) — §3 re-schedules
--      the cron; the route (/api/push/daily) now sends only the duʿā.
--   2. Both remote pushes become user-controllable — §1 adds two opt-OUT columns
--      (default TRUE: these are existing, expected features, unlike circle_push
--      which is opt-IN) and §2 adds the self-scoped RPCs the client toggles call.
--
-- ⚠️ ROUTE PATH IS UNCHANGED: the weekly job still POSTs '/api/push/daily'. The
--    path (and the route folder) stay put so nothing else has to move; read
--    "daily" there as "the scheduled content push", which is now weekly.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ============================================================================
-- 1. Opt-OUT preferences on profiles (default TRUE = keep receiving)
-- ============================================================================
-- Default true (not false like circle_push): these pushes already ship and users
-- expect them, so the column exists to let someone turn them OFF. `add column`
-- with a default backfills every existing profile, so nobody silently loses them.
alter table public.profiles
  add column if not exists dua_push          boolean not null default true;
alter table public.profiles
  add column if not exists reengagement_push boolean not null default true;

comment on column public.profiles.dua_push is
  'Opt-out (default true): receive the weekly duʿā push (cron push-weekly-dua → /api/push/daily).';
comment on column public.profiles.reengagement_push is
  'Opt-out (default true): receive the re-engagement nudge when this device has been inactive 3+ days (cron push-reengagement).';

-- ============================================================================
-- 2. Self-scoped RPCs to flip them — mirrors set_my_circle_push (027 §2)
-- ============================================================================
-- One RPC per flag, matching the house pattern: each call updates exactly one
-- column, so a client toggling one preference can never clobber the other.
-- coalesce(..., true) mirrors the column default — a null argument means "leave
-- the user opted in", the safe reading for an opt-out flag.
create or replace function public.set_my_dua_push(p_enabled boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update public.profiles
     set dua_push   = coalesce(p_enabled, true),
         updated_at = now()
   where id = auth.uid();
end $$;

revoke all on function public.set_my_dua_push(boolean) from public, anon;
grant execute on function public.set_my_dua_push(boolean) to authenticated;

create or replace function public.set_my_reengagement_push(p_enabled boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update public.profiles
     set reengagement_push = coalesce(p_enabled, true),
         updated_at        = now()
   where id = auth.uid();
end $$;

revoke all on function public.set_my_reengagement_push(boolean) from public, anon;
grant execute on function public.set_my_reengagement_push(boolean) to authenticated;

-- ============================================================================
-- 3. Re-schedule the content push: DAILY → WEDNESDAYS
-- ============================================================================
-- The job is renamed 'push-daily' → 'push-weekly-dua' so cron.job stops lying
-- about what it does. BOTH names are unscheduled first, so re-running this file
-- is safe and no orphaned daily job can survive the rename.
--
-- ⚠️ Do NOT re-run 026 or 029 §3 after this migration: both re-create
--    'push-daily' on '0 14 * * *' and you would be back to a daily send (on top
--    of this weekly one). If you ever do, just re-run this file afterwards.
--
-- Schedule is UTC (Supabase DB tz): '0 14 * * 3' = 14:00 UTC every Wednesday
-- (pg_cron day-of-week 3 = Wednesday, 0 = Sunday) — same hour the daily job used.
-- ⚠️ 14:00 UTC is "Wednesday morning" in the Americas (9am ET / 6am PT) but mid
--    afternoon in Europe and evening in South/Southeast Asia. The Settings
--    subtitle says "Wednesday morning"; change BOTH together if you re-time it.
-- Still dispatched through push_post() (029) — never a hard-coded URL/secret, so
-- an unseeded dev DB stays inert.
select cron.unschedule('push-daily')      where exists (select 1 from cron.job where jobname = 'push-daily');
select cron.unschedule('push-weekly-dua') where exists (select 1 from cron.job where jobname = 'push-weekly-dua');

select cron.schedule('push-weekly-dua', '0 14 * * 3', $$ select public.push_post('/api/push/daily', '{}'::jsonb); $$);

-- 'push-reengagement' ('0 15 * * 1', Mondays) is deliberately left ALONE — only
-- its recipient filter changed, and that lives in the route, not the schedule.

-- ============================================================================
-- Verify (run after applying):
--   -- columns present and defaulted true for every existing profile:
--   select count(*) filter (where dua_push)          as dua_on,
--          count(*) filter (where reengagement_push) as reengage_on,
--          count(*)                                  as profiles
--     from public.profiles;                     -- expect all three equal
--   -- RPCs exist and are authenticated-only:
--   select proname from pg_proc
--    where proname in ('set_my_dua_push','set_my_reengagement_push');
--   -- as a signed-in user:  select public.set_my_dua_push(false);
--   -- cron: 'push-daily' GONE, 'push-weekly-dua' on Wednesdays, reengagement Mondays
--   select jobname, schedule, active from cron.job order by jobname;
--   -- manual smoke test (prod): sends this week's duʿā immediately
--   select public.push_post('/api/push/daily', '{}'::jsonb);
--   select id, status_code, error_msg, created from net._http_response order by created desc limit 3;
-- ============================================================================
