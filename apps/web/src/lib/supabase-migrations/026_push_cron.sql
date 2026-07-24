-- ============================================================================
-- Hidden Hiqmah — Push scheduling via pg_cron (026)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Schedules the daily-content and weekly re-engagement push. Vercel Cron only
-- issues GET, but our push routes are POST-only (a GET route handler can't exist
-- in the mobile output:export build), so we drive them from Postgres instead:
-- pg_cron fires on a schedule and pg_net POSTs to the Vercel route.
--
-- ⚠️ BEFORE RUNNING: replace  __CRON_SECRET__  (both places) with the CRON_SECRET
--    you set in Vercel's env vars. It's stored in cron.job.command (service-role
--    only), never exposed to clients.
-- ⚠️ Apply to a NON-PROD target first if you have one, then prod.
--
-- Times are UTC (Supabase DB tz). Adjust the cron expressions to taste:
--   daily        = '0 14 * * *'   (14:00 UTC every day)
--   reengagement = '0 15 * * 1'   (15:00 UTC every Monday)
-- Re-running this file is safe: it unschedules the jobs by name first.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent: drop existing jobs of these names before recreating.
select cron.unschedule('push-daily')        where exists (select 1 from cron.job where jobname = 'push-daily');
select cron.unschedule('push-reengagement') where exists (select 1 from cron.job where jobname = 'push-reengagement');

-- Daily content push (rotates ayah -> hadith -> dua by day)
select cron.schedule(
  'push-daily',
  '0 14 * * *',
  $$
  select net.http_post(
    url     := 'https://www.hiddenhiqmah.com/api/push/daily',
    headers := jsonb_build_object('x-cron-secret', '__CRON_SECRET__', 'Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);

-- Weekly re-engagement nudge (users inactive 3+ days)
select cron.schedule(
  'push-reengagement',
  '0 15 * * 1',
  $$
  select net.http_post(
    url     := 'https://www.hiddenhiqmah.com/api/push/reengagement',
    headers := jsonb_build_object('x-cron-secret', '__CRON_SECRET__', 'Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);

-- ============================================================================
-- Verify (run after applying):
--   select jobname, schedule, active from cron.job order by jobname;
--   -- recent runs (after the first fire):
--   select jobid, status, return_message, start_time
--     from cron.job_run_details order by start_time desc limit 10;
--   -- to remove:  select cron.unschedule('push-daily');
-- ============================================================================
