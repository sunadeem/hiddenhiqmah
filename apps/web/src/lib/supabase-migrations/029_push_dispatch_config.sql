-- ============================================================================
-- Hidden Hiqmah — Parameterized push dispatch (029)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run in Supabase Dashboard → SQL Editor. Idempotent. Apply to EVERY database
-- that has the push crons/trigger (prod AND any dev/staging project or branch).
--
-- WHY: migrations 026 (crons) and 027 (circle-message trigger) HARD-CODED the prod
-- URL (https://www.hiddenhiqmah.com/...). Any non-prod DB that ran them therefore
-- fired its own daily/reengagement cron — and circle-message trigger — straight at
-- PRODUCTION, double-sending pushes to real users. This migration removes the
-- hard-coded URL/secret: every push now goes through public.push_post(), which
-- reads the target from a per-database `push_settings` row. A DB with no row (or a
-- blank base_url) sends NOTHING — so a dev database can never touch prod again.
--
-- ⚠️ AFTER Part 1, you MUST do Part 2 (§seed) PER ENVIRONMENT:
--      • PROD  → seed push_settings with the prod URL + your CRON_SECRET.
--      • DEV   → do NOT seed (leave it empty) so every push no-ops, OR seed it with
--                your dev deployment URL if you actually want to test push on dev.
--    If you apply Part 1 to prod but skip the prod seed, the daily push goes silent.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ============================================================================
-- Part 1 — identical on every database
-- ============================================================================

-- 1. Single-row config table. Holds the base URL every push is sent to, plus the
--    shared cron secret. RLS on + NO policies ⇒ clients can never read it; only
--    the SECURITY DEFINER helper (and service_role) can. The boolean PK with
--    check(id) pins the table to exactly one row (id = true).
create table if not exists public.push_settings (
    id          boolean primary key default true check (id),
    base_url    text,          -- e.g. 'https://www.hiddenhiqmah.com'; NULL/'' ⇒ disabled
    cron_secret text,          -- must equal the route's CRON_SECRET (Vercel env)
    updated_at  timestamptz not null default now()
);

comment on table public.push_settings is
  'Single-row push dispatch config (base_url + cron_secret) read by push_post(). Locked: RLS on, no policies — only definer/service_role can read. A blank base_url disables all outbound pushes from this DB (keeps non-prod DBs from POSTing to prod).';

alter table public.push_settings enable row level security;
-- (No policies on purpose: authenticated/anon get zero rows; the helper below is
--  SECURITY DEFINER so it reads regardless, and service_role bypasses RLS.)

-- 2. The one place any push leaves the database. Reads base_url + secret from
--    push_settings; if base_url is unset, it does NOTHING (the guard that makes a
--    dev DB inert). Fire-and-forget: a push failure can never break its caller.
create or replace function public.push_post(p_path text, p_body jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_base   text;
  v_secret text;
begin
  select base_url, cron_secret into v_base, v_secret
    from public.push_settings where id = true;
  if v_base is null or v_base = '' then
    return;  -- no target configured (e.g. an unseeded dev DB) → send nothing
  end if;
  begin
    perform net.http_post(
      url     := v_base || p_path,
      headers := jsonb_build_object('x-cron-secret', coalesce(v_secret, ''), 'Content-Type', 'application/json'),
      body    := coalesce(p_body, '{}'::jsonb)
    );
  exception when others then
    null;  -- never let a push error propagate into a trigger/cron
  end;
end $$;

revoke all on function public.push_post(text, jsonb) from public, anon, authenticated;

-- 3. Re-point the daily + reengagement crons at the helper (no more inline URL/secret).
select cron.unschedule('push-daily')        where exists (select 1 from cron.job where jobname = 'push-daily');
select cron.unschedule('push-reengagement') where exists (select 1 from cron.job where jobname = 'push-reengagement');

select cron.schedule('push-daily', '0 14 * * *', $$ select public.push_post('/api/push/daily', '{}'::jsonb); $$);
select cron.schedule('push-reengagement', '0 15 * * 1', $$ select public.push_post('/api/push/reengagement', '{}'::jsonb); $$);

-- 4. Re-point the circle-message trigger at the helper (supersedes 027 §3).
create or replace function public.notify_circle_message_push()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.push_post(
    '/api/push/circle-message',
    jsonb_build_object(
      'message_id', new.id,
      'circle_id',  new.circle_id,
      'sender_id',  new.user_id,
      'body',       new.body
    )
  );
  return new;
end $$;

drop trigger if exists on_circle_message_created on public.circle_messages;
create trigger on_circle_message_created
  after insert on public.circle_messages
  for each row execute function public.notify_circle_message_push();

-- ============================================================================
-- Part 2 — §SEED — RUN PER ENVIRONMENT (this is the one part that differs!)
-- ============================================================================
--
-- ▶ PROD ONLY — replace both placeholders with your real values, then run:
--
--   insert into public.push_settings (id, base_url, cron_secret)
--   values (true, 'https://www.hiddenhiqmah.com', '__CRON_SECRET__')
--   on conflict (id) do update
--     set base_url = excluded.base_url, cron_secret = excluded.cron_secret, updated_at = now();
--
-- ▶ DEV / STAGING — do NOTHING here. With no push_settings row, push_post() no-ops,
--   so this DB physically cannot send a push (crons + trigger stay inert). Only seed
--   it if you deliberately want to test push against a dev deployment, in which case
--   use that dev URL — NEVER the prod URL.
--
-- ============================================================================
-- Verify (after seeding):
--   select base_url, (cron_secret is not null and cron_secret <> '') as has_secret
--     from public.push_settings;                       -- prod: your URL + true; dev: no rows
--   select jobname, schedule, active from cron.job order by jobname;   -- both jobs present
--   -- manual smoke test (prod): fires today's daily push immediately
--   select public.push_post('/api/push/daily', '{}'::jsonb);
--   select id, status_code, error_msg, created from net._http_response order by created desc limit 3;
-- ============================================================================
