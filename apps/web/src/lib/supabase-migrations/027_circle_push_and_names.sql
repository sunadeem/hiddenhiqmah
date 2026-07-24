-- ============================================================================
-- Hidden Hiqmah — Circle-chat push + real-name fix (027)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor → New query. Idempotent.
-- ⚠️  Apply to a NON-PRODUCTION target first, verify, THEN promote to prod.
-- Requires 006 (profiles + handle_new_user), 007/013 (circles + circle_messages),
--   025 (device_tokens), 026 (pg_cron/pg_net).
--
-- Three things:
--   1. REAL-NAME fix — the signup name (full_name / first_name) now wins over the
--      email-derived default, both for new signups (handle_new_user) and as a
--      one-time backfill for existing users still on the email default. Names a
--      user set themselves are never overwritten.
--   2. CIRCLE-PUSH opt-in — profiles.circle_push (default false) + a self-scoped
--      RPC set_my_circle_push so the client can flip it.
--   3. MESSAGE TRIGGER — an after-insert trigger on circle_messages fire-and-forget
--      POSTs the new message to /api/push/circle-message, which fans a push out to
--      the circle's OTHER opted-in members.
--
-- ⚠️ BEFORE RUNNING: replace  __CRON_SECRET__  (in §3) with the CRON_SECRET you set
--    in Vercel's env vars — exactly as in migration 026. It's stored inside the
--    trigger function body (service-role only), never exposed to clients.
-- ============================================================================

create extension if not exists pg_net;

-- ============================================================================
-- 1. REAL-NAME fix — signup name wins over the email-derived default.
-- ============================================================================
-- 1a. New signups: prefer full_name / first_name, then the old name /
--     display_name keys, then finally the email local part.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'first_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'display_name', ''),
      split_part(coalesce(new.email, 'Friend'), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- (trigger on_auth_user_created already exists from 006 and points at this fn)

-- 1b. Backfill: for existing profiles whose display_name is STILL the email-derived
--     default (split_part(email,'@',1)) AND who have a real name in auth metadata,
--     replace it with that name. The display_name = email-local guard guarantees we
--     never clobber a name a user chose themselves.
update public.profiles p
set display_name = coalesce(
      nullif(u.raw_user_meta_data->>'full_name', ''),
      nullif(u.raw_user_meta_data->>'first_name', '')
    ),
    updated_at = now()
from auth.users u
where u.id = p.id
  and u.email is not null
  and coalesce(
        nullif(u.raw_user_meta_data->>'full_name', ''),
        nullif(u.raw_user_meta_data->>'first_name', '')
      ) is not null
  and p.display_name = split_part(u.email, '@', 1);

-- ============================================================================
-- 2. CIRCLE-PUSH opt-in — default OFF (opt-in), self-scoped RPC to flip it.
-- ============================================================================
alter table public.profiles
  add column if not exists circle_push boolean not null default false;

comment on column public.profiles.circle_push is
  'Opt-in (default false): receive an APNs push when someone posts in one of my circles.';

create or replace function public.set_my_circle_push(p_enabled boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update public.profiles
     set circle_push = coalesce(p_enabled, false),
         updated_at  = now()
   where id = auth.uid();
end $$;

revoke all on function public.set_my_circle_push(boolean) from public, anon;
grant execute on function public.set_my_circle_push(boolean) to authenticated;

-- ============================================================================
-- 3. MESSAGE TRIGGER — fire-and-forget push fan-out on a new circle message.
-- ⚠️ SUPERSEDED BY MIGRATION 029: the hard-coded prod URL here made a non-prod DB's
--    message inserts POST to PRODUCTION. Migration 029 re-points this trigger at
--    push_post() (per-DB push_settings). Apply 029 after this file.
-- ============================================================================
-- Vercel Cron/routes are POST-only here (a GET handler can't live in the mobile
-- output:export build), so — like migration 026 — we drive the route from Postgres
-- via pg_net. The trigger stays lightweight: it queues ONE async net.http_post and
-- returns; the route does the recipient lookup + APNs send. net.http_post is fully
-- qualified so it resolves regardless of search_path; SECURITY DEFINER runs it as
-- the (service-role) owner so it works no matter who inserted the row.
create or replace function public.notify_circle_message_push()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  begin
    perform net.http_post(
      url     := 'https://www.hiddenhiqmah.com/api/push/circle-message',
      headers := jsonb_build_object('x-cron-secret', '__CRON_SECRET__', 'Content-Type', 'application/json'),
      body    := jsonb_build_object(
                   'message_id', new.id,
                   'circle_id',  new.circle_id,
                   'sender_id',  new.user_id,
                   'body',       new.body
                 )
    );
  exception when others then
    -- A push failure must never block the message insert — swallow and move on.
    null;
  end;
  return new;
end $$;

drop trigger if exists on_circle_message_created on public.circle_messages;
create trigger on_circle_message_created
  after insert on public.circle_messages
  for each row execute function public.notify_circle_message_push();

-- ============================================================================
-- Verify (run after applying):
--   -- names: no profile should still be on the email default when a real name exists
--   select count(*) from public.profiles p join auth.users u on u.id = p.id
--    where u.email is not null
--      and coalesce(nullif(u.raw_user_meta_data->>'full_name',''),
--                   nullif(u.raw_user_meta_data->>'first_name','')) is not null
--      and p.display_name = split_part(u.email,'@',1);            -- expect 0
--   -- opt-in column + RPC:
--   select column_name from information_schema.columns
--    where table_schema='public' and table_name='profiles' and column_name='circle_push';
--   -- as a signed-in user:  select public.set_my_circle_push(true);
--   -- trigger present:
--   select tgname from pg_trigger where tgname = 'on_circle_message_created';
--   -- fire it (as a member of a circle) and watch the queued request:
--   -- select public.send_circle_message('<circle_id>', 'test push');
--   -- select id, status_code, error_msg from net._http_response order by created desc limit 5;
-- ============================================================================
