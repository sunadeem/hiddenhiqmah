-- ============================================================================
-- Hidden Hiqmah — Per-device timezone + local-time weekly duʿā (031)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run in Supabase Dashboard → SQL Editor → New query. Idempotent.
-- ⚠️  Apply to a NON-PRODUCTION target first, verify, THEN promote to prod.
-- Requires 025 (device_tokens + upsert_device_token), 026 (pg_cron/pg_net),
--   029 (push_post/push_settings), 030 (dua_push + 'push-weekly-dua' job).
--
-- WHY: 030 scheduled the duʿā at '0 14 * * 3' — 14:00 UTC every Wednesday. That
-- is ~10am Eastern, but ~3pm in London, ~7:30pm in Karachi and ~10pm in Jakarta,
-- and it slides an hour twice a year because the cron is UTC-pinned while the
-- intent ("Wednesday morning") is local. EVERY on-device notification fires at a
-- fixed LOCAL time; this was the only one that didn't.
--
-- HOW: the schedule stops deciding WHO gets the push and only decides WHEN to
-- look. The cron becomes HOURLY; /api/push/daily converts "now" into each
-- device's own IANA zone and sends only to devices where it is currently
-- Wednesday, hour 10, local. Because the zone is stored as an IANA NAME (not a
-- fixed UTC offset) the conversion re-derives the offset on every run, so DST is
-- handled for free.
--
-- ⚠️ DEPLOY ORDER — deploy the ROUTE FIRST, then apply this file:
--      1. Ship apps/web (the new /api/push/daily) to production.
--      2. Then run this migration.
--      3. Apply this migration BEFORE archiving or uploading any iOS build that
--         contains the new lib/mobile/push.ts.
--    The new route degrades gracefully if §1's columns don't exist yet (it falls
--    back to the legacy 14:00-UTC behaviour), so step 1 alone is harmless. Doing
--    it the other way round is NOT: §3 makes the cron hourly, and the OLD route
--    ignores the clock entirely — it would send the duʿā to everyone 24× a day
--    until the deploy landed.
--    Step 3 matters just as much and is easier to forget: the new client always
--    sends a 4th argument (p_timezone) to upsert_device_token. Against a pre-031
--    database no function accepts that argument set, PostgREST answers 404
--    PGRST202, and the device registers NO push token at all. Builds shipped
--    BEFORE that client change (e.g. TestFlight build 7) send only 3 arguments
--    and keep working either way — that is why §2 defaults the parameter rather
--    than adding an overload.
--
-- ⚠️ ROUTE PATH IS STILL UNCHANGED: '/api/push/daily'. Read "daily" as "the
--    scheduled content push" — daily → weekly (030) → hourly tick, local weekly
--    delivery (here).
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ============================================================================
-- 1. device_tokens: the device's IANA zone + when it last got the duʿā
-- ============================================================================
-- timezone is an IANA NAME ('America/Toronto'), never an offset. An offset
-- ('-04:00') is only true for half the year and would silently drift at every
-- DST transition — the whole bug this migration exists to fix. NULLABLE on
-- purpose: every token registered before this ships has no zone, and the route
-- keeps those on the legacy 14:00-UTC send rather than dropping them.
--
-- Validation is deliberately loose here (length only). The zone is resolved by
-- the ROUTE, with JS `Intl` — validating against pg_timezone_names could reject
-- a name ICU knows but this Postgres build doesn't, and a wrongly-rejected zone
-- is a device pushed back to UTC forever.
alter table public.device_tokens
  add column if not exists timezone text;
-- Stamped by the route ONLY after APNs accepts the send, and read by it to skip
-- any device already served this week. Required because the job now fires 168×
-- a week: a DST transition can repeat a local hour, and a device could otherwise
-- match the Wednesday-10:00 window twice.
alter table public.device_tokens
  add column if not exists last_dua_push_at timestamptz;

comment on column public.device_tokens.timezone is
  'IANA zone name for this device (e.g. America/Toronto), set by upsert_device_token from Intl.DateTimeFormat().resolvedOptions().timeZone. NULL = registered before migration 031; such devices fall back to the legacy 14:00-UTC weekly duʿā. Never store a UTC offset here — it breaks at DST.';
comment on column public.device_tokens.last_dua_push_at is
  'When APNs last ACCEPTED the weekly duʿā for this device. Dedupe key for the hourly cron (skip if sent within ~5 days — see DEDUPE_MS in /api/push/daily); only stamped on success, so a failed send retries next hour.';

-- 030 described this column in terms of the job it has just outlived; keep the
-- database self-describing so `\d+ profiles` doesn't point at a cron that no
-- longer exists. (Idempotent — comments are always replaced, never appended.)
comment on column public.profiles.dua_push is
  'Opt-out (default true): receive the weekly duʿā push, sent at ~10:00 Wednesday in each device''s own timezone (cron push-dua-hourly → /api/push/daily; migration 031).';

-- Length sanity only (guards a junk client value); added via DO so re-running is
-- safe on a database that already has the constraint.
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.device_tokens'::regclass
       and conname  = 'device_tokens_timezone_len'
  ) then
    alter table public.device_tokens
      add constraint device_tokens_timezone_len
      check (timezone is null or char_length(timezone) between 1 and 64);
  end if;
end $$;

-- Serves the hourly job's own filter: it selects only tokens never sent
-- (last_dua_push_at is null) or sent outside the dedupe window, so the tick
-- reads the few devices that could be due instead of the whole table 168× a
-- week. Kept in step with the .or(...) in /api/push/daily — an index is useless
-- against a full scan, so if that filter is ever removed, drop this with it.
create index if not exists device_tokens_last_dua_idx
  on public.device_tokens (last_dua_push_at);

-- ============================================================================
-- 2. upsert_device_token gains p_timezone — ONE function, not an overload
-- ============================================================================
-- ⚠️ POSTGREST FUNCTION RESOLUTION — read before "improving" this.
--    PostgREST picks an RPC by the SET OF ARGUMENT NAMES in the JSON body. If we
--    kept 025's 3-arg upsert_device_token AND added a 4-arg one with a default,
--    a body of {p_token, p_platform, p_environment} would match BOTH candidates
--    and PostgREST answers PGRST203 ("could not choose the best candidate
--    function") — a hard 300, i.e. every not-yet-updated build stops registering
--    its token. So we DROP the old signature and keep exactly one function whose
--    4th parameter has a DEFAULT. Old clients that omit p_timezone still resolve
--    (PostgREST fills defaulted args); the new client passes it explicitly.
--    `create or replace` cannot do this — a different argument COUNT creates an
--    overload rather than replacing — hence the explicit drop.
--
--    What the client must pass: p_token, p_platform, p_environment as before,
--    plus OPTIONAL p_timezone. Passing p_timezone: null is fine and means "leave
--    whatever zone is already on file" (see the coalesce below) — that is what a
--    device whose Intl lookup threw will send.
drop function if exists public.upsert_device_token(text, text, text);
drop function if exists public.upsert_device_token(text, text, text, text);

create function public.upsert_device_token(
    p_token       text,
    p_platform    text default 'ios',
    p_environment text default 'production',
    p_timezone    text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_tz text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  -- Blank/oversized → treat as "unknown" rather than failing registration on a
  -- check-constraint violation. Registration must never break over a timezone.
  v_tz := nullif(btrim(coalesce(p_timezone, '')), '');
  if v_tz is not null and char_length(v_tz) > 64 then
    v_tz := null;
  end if;

  insert into public.device_tokens (user_id, token, platform, environment, timezone)
  values (auth.uid(), p_token, p_platform, p_environment, v_tz)
  on conflict (token) do update
    set user_id      = auth.uid(),
        platform     = excluded.platform,
        environment  = excluded.environment,
        -- coalesce, not excluded.timezone: an OLD app build re-registering this
        -- token sends no zone, and must not wipe the good one a newer build
        -- already stored. A device that actually moved sends its NEW zone, which
        -- is non-null and therefore wins — travel still self-corrects.
        timezone     = coalesce(excluded.timezone, device_tokens.timezone),
        last_seen_at = now(),
        updated_at   = now();
  -- last_dua_push_at is deliberately absent from both lists: re-registering a
  -- token (every foreground) must not look like "never been sent the duʿā".
end $$;

revoke all on function public.upsert_device_token(text, text, text, text) from public, anon;
grant execute on function public.upsert_device_token(text, text, text, text) to authenticated;

-- Supabase reloads the PostgREST schema cache on DDL, but do it explicitly:
-- a stale cache after dropping/recreating an RPC is exactly the PGRST202
-- ("function not found in schema cache") this project has hit before.
notify pgrst, 'reload schema';

-- ============================================================================
-- 3. Re-schedule the duʿā cron: WEEKLY (UTC) → HOURLY (route decides locally)
-- ============================================================================
-- '0 * * * *' = the top of every hour. Every zone therefore gets its turn once a
-- day, and /api/push/daily sends only to devices where it is now Wednesday 10:00
-- local (plus, at 14:00 UTC on Wednesday, the NULL-timezone legacy devices).
-- The route's last_dua_push_at dedupe — plus the APNs collapse-id — is what
-- keeps 168 ticks a week from becoming 168 pushes.
--
-- The job is renamed 'push-weekly-dua' → 'push-dua-hourly' so cron.job stops
-- lying about its cadence (what stayed weekly is the DELIVERY, not the job).
-- ALL historical names are unscheduled first, so re-running this file is safe
-- and no orphan can survive a rename.
--
-- ⚠️ Do NOT re-run 026, 029 §3 or 030 §3 after this migration: they re-create
--    'push-daily' ('0 14 * * *') / 'push-weekly-dua' ('0 14 * * 3') and you would
--    get a second, UTC-pinned duʿā on top of this one. If you ever do, just
--    re-run THIS file afterwards.
--
-- Still dispatched through push_post() (029) — never a hard-coded URL/secret, so
-- an unseeded dev DB stays inert.
select cron.unschedule('push-daily')      where exists (select 1 from cron.job where jobname = 'push-daily');
select cron.unschedule('push-weekly-dua') where exists (select 1 from cron.job where jobname = 'push-weekly-dua');
select cron.unschedule('push-dua-hourly') where exists (select 1 from cron.job where jobname = 'push-dua-hourly');

select cron.schedule('push-dua-hourly', '0 * * * *', $$ select public.push_post('/api/push/daily', '{}'::jsonb); $$);

-- 'push-reengagement' ('0 15 * * 1', Mondays) is deliberately left ALONE: it is
-- a "you've been away 3+ days" nudge, not a time-of-day ritual, so a fixed UTC
-- hour is fine for it.

-- ============================================================================
-- Verify (run after applying):
--   -- columns present:
--   select column_name, data_type, is_nullable from information_schema.columns
--    where table_schema = 'public' and table_name = 'device_tokens'
--      and column_name in ('timezone', 'last_dua_push_at');
--   -- exactly ONE upsert_device_token, with 4 args (no overload left behind):
--   select p.oid::regprocedure as signature
--     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public' and p.proname = 'upsert_device_token';
--   -- as a signed-in user (new client shape):
--   --   select public.upsert_device_token('test-token-abc','ios','sandbox','America/Toronto');
--   -- and the OLD client shape must still work (defaulted arg omitted):
--   --   select public.upsert_device_token('test-token-abc','ios','sandbox');
--   --   select token, timezone, last_dua_push_at from public.device_tokens;  -- zone kept
--   -- cron: 'push-daily' + 'push-weekly-dua' GONE, 'push-dua-hourly' on '0 * * * *':
--   select jobname, schedule, active from cron.job order by jobname;
--   -- how the fleet is split between local + legacy delivery:
--   select coalesce(timezone, '(legacy 14:00 UTC)') as zone, count(*)
--     from public.device_tokens group by 1 order by 2 desc;
--   -- manual smoke test (prod): sends ONLY to devices at Wed 10:00 local right
--   -- now, so outside that window "sent: 0" is the CORRECT answer, not a failure.
--   select public.push_post('/api/push/daily', '{}'::jsonb);
--   select id, status_code, error_msg, created from net._http_response order by created desc limit 3;
--   -- to force yourself a test push, clear your own dedupe stamp first:
--   --   update public.device_tokens set last_dua_push_at = null where token = '<your token>';
-- ============================================================================
