-- ============================================================================
-- Hidden Hiqmah — Circles Enhancements Migration (013)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor → New query. Idempotent.
-- ⚠️  Apply to a NON-PRODUCTION target first, verify, THEN promote to prod.
-- Requires 006 (profiles) + 007 (circles: circles, circle_members,
--   circle_member_progress, is_circle_member helper).
--
-- Adds group chat, an activity feed, and per-user notifications to Circles,
-- keeping 007's model intact: a circle has ONE shared goal; each member logs
-- their own contribution (circle_member_progress.value); reads are RLS-scoped
-- to a member's own circles; ALL writes go through SECURITY DEFINER RPCs.
--
--   * circle_messages      — group chat (soft-deleted, never hard-deleted)
--   * circle_activity      — a readable, timestamped feed of circle events
--   * circle_notifications — per-user bell/unread inbox (fan-out on events)
--   * RPCs: send_circle_message, delete_circle_message, rename_circle,
--           update_circle_goal, remove_circle_member,
--           mark_circle_notifications_read
--   * create-or-replace: set_my_circle_progress, join_circle_by_code,
--           send_circle_dua, leave_circle — same behavior + event logging
--   * circle_messages is added to the `supabase_realtime` publication so the
--     chat updates live (guarded — safe to re-run).
--
-- Privacy invariants (unchanged from 007, enforced in the DB):
--   * All new rows are visible ONLY to circle members (activity/messages) or
--     to the owning user (notifications). No public read.
--   * All writes go through the definer RPCs below.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. Tables
-- ============================================================================
create table if not exists public.circle_messages (
    id          uuid primary key default gen_random_uuid(),
    circle_id   uuid not null references public.circles (id) on delete cascade,
    user_id     uuid not null references auth.users (id) on delete cascade,
    body        text not null,
    created_at  timestamptz not null default now(),
    deleted_at  timestamptz            -- soft delete; row kept so we can show "message deleted"
);
create index if not exists circle_messages_circle_idx
    on public.circle_messages (circle_id, created_at);

create table if not exists public.circle_activity (
    id          uuid primary key default gen_random_uuid(),
    circle_id   uuid not null references public.circles (id) on delete cascade,
    actor_id    uuid references auth.users (id) on delete set null,
    kind        text not null check (kind in (
                  'joined','left','progress','goal_reached','message',
                  'dua','renamed','goal_updated','removed')),
    meta        jsonb not null default '{}',
    created_at  timestamptz not null default now()
);
create index if not exists circle_activity_circle_idx
    on public.circle_activity (circle_id, created_at desc);

create table if not exists public.circle_notifications (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users (id) on delete cascade,
    circle_id   uuid references public.circles (id) on delete cascade,
    actor_id    uuid references auth.users (id) on delete set null,
    kind        text not null,
    body        text not null,        -- pre-rendered (includes actor name) so the
                                       -- recipient never needs cross-member reads
    created_at  timestamptz not null default now(),
    read_at     timestamptz
);
create index if not exists circle_notifications_user_idx
    on public.circle_notifications (user_id, created_at desc);
create index if not exists circle_notifications_unread_idx
    on public.circle_notifications (user_id) where read_at is null;

-- Deliver full row data on UPDATE (soft delete) / DELETE realtime events.
alter table public.circle_messages replica identity full;

-- ============================================================================
-- 2. RLS — members SELECT circle rows; notifications are self-scoped;
--    ALL writes go via the definer RPCs in §4 (no write policies here).
-- ============================================================================
alter table public.circle_messages      enable row level security;
alter table public.circle_activity       enable row level security;
alter table public.circle_notifications  enable row level security;

drop policy if exists cmsg_select_member on public.circle_messages;
create policy cmsg_select_member on public.circle_messages
    for select to authenticated using (public.is_circle_member(circle_id, auth.uid()));

drop policy if exists cact_select_member on public.circle_activity;
create policy cact_select_member on public.circle_activity
    for select to authenticated using (public.is_circle_member(circle_id, auth.uid()));

-- A user reads / updates (mark-read) only their OWN notifications.
drop policy if exists cnotif_select_own on public.circle_notifications;
create policy cnotif_select_own on public.circle_notifications
    for select to authenticated using (user_id = auth.uid());
drop policy if exists cnotif_update_own on public.circle_notifications;
create policy cnotif_update_own on public.circle_notifications
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- 3. Internal helpers (SECURITY DEFINER; called only from the RPCs below, so
--    they run as the owner and bypass RLS — not granted to authenticated).
-- ============================================================================
create or replace function public._circle_display_name(p_uid uuid)
returns text language sql security definer stable set search_path = public as $$
  select coalesce(
    (select nullif(trim(display_name), '') from public.profiles where id = p_uid),
    'A member');
$$;

create or replace function public._log_circle_activity(
    p_circle uuid, p_actor uuid, p_kind text, p_meta jsonb default '{}'
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.circle_activity (circle_id, actor_id, kind, meta)
  values (p_circle, p_actor, p_kind, coalesce(p_meta, '{}'::jsonb));
end $$;

-- Fan-out a notification to every member of a circle except the actor.
create or replace function public._notify_circle_members(
    p_circle uuid, p_actor uuid, p_kind text, p_body text
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.circle_notifications (user_id, circle_id, actor_id, kind, body)
  select m.user_id, p_circle, p_actor, p_kind, p_body
  from public.circle_members m
  where m.circle_id = p_circle and m.user_id <> p_actor;
end $$;

-- Notify a single user (directed events: du'ā received, removed).
create or replace function public._notify_user(
    p_user uuid, p_circle uuid, p_actor uuid, p_kind text, p_body text
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.circle_notifications (user_id, circle_id, actor_id, kind, body)
  values (p_user, p_circle, p_actor, p_kind, p_body);
end $$;

-- ============================================================================
-- 4. New write RPCs (SECURITY DEFINER — the only way to mutate these tables)
-- ============================================================================
create or replace function public.send_circle_message(p_circle uuid, p_body text)
returns public.circle_messages language plpgsql security definer set search_path = public as $$
declare v_row public.circle_messages; v_body text;
begin
  if not public.is_circle_member(p_circle, auth.uid()) then raise exception 'not a member'; end if;
  v_body := trim(coalesce(p_body, ''));
  if v_body = '' then raise exception 'message is empty'; end if;
  if length(v_body) > 2000 then v_body := left(v_body, 2000); end if;
  insert into public.circle_messages (circle_id, user_id, body)
  values (p_circle, auth.uid(), v_body)
  returning * into v_row;
  perform public._log_circle_activity(p_circle, auth.uid(), 'message',
          jsonb_build_object('message_id', v_row.id));
  perform public._notify_circle_members(p_circle, auth.uid(), 'message',
          public._circle_display_name(auth.uid()) || ': ' || left(v_body, 80));
  return v_row;
end $$;

-- Soft-delete: allowed for the author OR the circle owner.
create or replace function public.delete_circle_message(p_message uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_circle uuid; v_author uuid; v_owner uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select circle_id, user_id into v_circle, v_author
    from public.circle_messages where id = p_message;
  if v_circle is null then raise exception 'message not found'; end if;
  select owner_id into v_owner from public.circles where id = v_circle;
  if auth.uid() <> v_author and auth.uid() <> v_owner then raise exception 'not allowed'; end if;
  update public.circle_messages set deleted_at = now()
   where id = p_message and deleted_at is null;
end $$;

create or replace function public.rename_circle(p_circle uuid, p_name text)
returns void language plpgsql security definer set search_path = public as $$
declare v_name text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.circles where id = p_circle and owner_id = auth.uid()) then
    raise exception 'not the owner';
  end if;
  v_name := coalesce(nullif(trim(p_name), ''), 'My Circle');
  update public.circles set name = v_name where id = p_circle;
  perform public._log_circle_activity(p_circle, auth.uid(), 'renamed',
          jsonb_build_object('name', v_name));
end $$;

create or replace function public.update_circle_goal(
    p_circle uuid, p_goal_type text, p_goal_unit text, p_goal_target int
) returns void language plpgsql security definer set search_path = public as $$
declare v_type text; v_unit text; v_target int;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.circles where id = p_circle and owner_id = auth.uid()) then
    raise exception 'not the owner';
  end if;
  v_type := coalesce(nullif(trim(p_goal_type), ''), 'custom');
  if v_type not in ('khatmah','hifz','custom') then v_type := 'custom'; end if;
  v_unit := coalesce(nullif(trim(p_goal_unit), ''), 'juz');
  v_target := greatest(coalesce(p_goal_target, 1), 1);
  update public.circles
     set goal_type = v_type, goal_unit = v_unit, goal_target = v_target
   where id = p_circle;
  perform public._log_circle_activity(p_circle, auth.uid(), 'goal_updated',
          jsonb_build_object('goal_type', v_type, 'goal_unit', v_unit, 'goal_target', v_target));
end $$;

-- Owner removes a member (never self/owner). Drops membership + their progress.
create or replace function public.remove_circle_member(p_circle uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_role text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select owner_id into v_owner from public.circles where id = p_circle;
  if v_owner is null then raise exception 'circle not found'; end if;
  if auth.uid() <> v_owner then raise exception 'not the owner'; end if;
  if p_user = v_owner then raise exception 'cannot remove the owner'; end if;
  select role into v_role from public.circle_members
   where circle_id = p_circle and user_id = p_user;
  if v_role is null then return; end if;   -- not a member; no-op
  delete from public.circle_member_progress where circle_id = p_circle and user_id = p_user;
  delete from public.circle_members         where circle_id = p_circle and user_id = p_user;
  perform public._log_circle_activity(p_circle, auth.uid(), 'removed',
          jsonb_build_object('removed_user', p_user));
  perform public._notify_user(p_user, p_circle, auth.uid(), 'removed',
          'You were removed from a circle');
end $$;

-- Mark the caller's notifications read. Pass null to mark ALL of them read.
create or replace function public.mark_circle_notifications_read(p_ids uuid[] default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update public.circle_notifications
     set read_at = now()
   where user_id = auth.uid() and read_at is null
     and (p_ids is null or id = any (p_ids));
end $$;

-- ============================================================================
-- 5. Create-or-replace existing RPCs: SAME behavior + event logging.
--    (Signatures unchanged — only the body adds activity/notification calls.)
-- ============================================================================

-- set_my_circle_progress: unchanged upsert; logs 'progress' on a real change
-- and 'goal_reached' (+ notifies the circle) when the member first hits target.
create or replace function public.set_my_circle_progress(p_circle uuid, p_value int)
returns void language plpgsql security definer set search_path = public as $$
declare v_old int; v_new int; v_target int; v_unit text;
begin
  if not public.is_circle_member(p_circle, auth.uid()) then raise exception 'not a member'; end if;
  v_new := greatest(coalesce(p_value, 0), 0);
  select value into v_old from public.circle_member_progress
   where circle_id = p_circle and user_id = auth.uid();
  v_old := coalesce(v_old, 0);
  select goal_target, goal_unit into v_target, v_unit from public.circles where id = p_circle;

  insert into public.circle_member_progress (circle_id, user_id, value, updated_at)
  values (p_circle, auth.uid(), v_new, now())
  on conflict (circle_id, user_id) do update
    set value = v_new, updated_at = now();

  if v_new <> v_old then
    perform public._log_circle_activity(p_circle, auth.uid(), 'progress',
            jsonb_build_object('value', v_new, 'unit', v_unit));
  end if;
  if v_target is not null and v_old < v_target and v_new >= v_target then
    perform public._log_circle_activity(p_circle, auth.uid(), 'goal_reached',
            jsonb_build_object('value', v_new, 'target', v_target, 'unit', v_unit));
    perform public._notify_circle_members(p_circle, auth.uid(), 'goal_reached',
            public._circle_display_name(auth.uid()) || ' reached their goal 🎉');
  end if;
end $$;

-- join_circle_by_code: unchanged join logic; on a FRESH join, logs 'joined'
-- and notifies the existing members.
create or replace function public.join_circle_by_code(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_circle uuid; v_count int;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select circle_id into v_circle from public.circle_invites
   where code = upper(trim(p_code)) and (expires_at is null or expires_at > now())
   order by created_at desc limit 1;
  if v_circle is null then raise exception 'invalid or expired code'; end if;
  select count(*) into v_count from public.circle_members where circle_id = v_circle;
  if v_count >= 30 then raise exception 'circle is full'; end if;
  insert into public.circle_members (circle_id, user_id, role)
  values (v_circle, auth.uid(), 'member')
  on conflict (circle_id, user_id) do nothing;
  if found then
    perform public._log_circle_activity(v_circle, auth.uid(), 'joined', '{}'::jsonb);
    perform public._notify_circle_members(v_circle, auth.uid(), 'joined',
            public._circle_display_name(auth.uid()) || ' joined the circle');
  end if;
  return v_circle;
end $$;

-- send_circle_dua: unchanged reaction insert; logs 'dua' + notifies recipient.
create or replace function public.send_circle_dua(p_circle uuid, p_to_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_circle_member(p_circle, auth.uid()) then raise exception 'not a member'; end if;
  if not public.is_circle_member(p_circle, p_to_user) then raise exception 'recipient not a member'; end if;
  insert into public.circle_reactions (circle_id, from_user, to_user, kind)
  values (p_circle, auth.uid(), p_to_user, 'dua');
  perform public._log_circle_activity(p_circle, auth.uid(), 'dua',
          jsonb_build_object('to_user', p_to_user));
  perform public._notify_user(p_to_user, p_circle, auth.uid(), 'dua',
          public._circle_display_name(auth.uid()) || ' sent you a du''ā 🤲');
end $$;

-- leave_circle: unchanged behavior (owner leaving disbands); a member leaving
-- now logs 'left' for the feed.
create or replace function public.leave_circle(p_circle uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select role into v_role from public.circle_members
   where circle_id = p_circle and user_id = auth.uid();
  if v_role is null then return; end if;            -- not a member; no-op
  if v_role = 'owner' then
    -- Disband: cascades members/progress/messages/activity/invites/etc.
    delete from public.circle_members where circle_id = p_circle and user_id = auth.uid();
    delete from public.circles where id = p_circle and owner_id = auth.uid();
  else
    perform public._log_circle_activity(p_circle, auth.uid(), 'left', '{}'::jsonb);
    delete from public.circle_members where circle_id = p_circle and user_id = auth.uid();
  end if;
end $$;

-- ============================================================================
-- 6. Realtime — publish circle_messages for live chat (guarded, re-run safe).
-- ============================================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'circle_messages')
  then
    alter publication supabase_realtime add table public.circle_messages;
  end if;
end $$;

-- ============================================================================
-- 7. Grants — execute to signed-in users only; helpers stay internal.
--    The internal helpers are ONLY called from within the definer RPCs above
--    (which run as the function owner), so we also revoke `authenticated`:
--    that closes the PostgREST surface (a member must NOT be able to call
--    _notify_user / _log_circle_activity directly to forge events) while the
--    internal owner-context calls keep working. (Contrast is_circle_member in
--    007, which must stay executable by `authenticated` — it's used in RLS.)
-- ============================================================================
revoke all on function public._circle_display_name(uuid)                     from public, anon, authenticated;
revoke all on function public._log_circle_activity(uuid, uuid, text, jsonb)  from public, anon, authenticated;
revoke all on function public._notify_circle_members(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public._notify_user(uuid, uuid, uuid, text, text)     from public, anon, authenticated;

revoke all on function public.send_circle_message(uuid, text)          from public, anon;
revoke all on function public.delete_circle_message(uuid)              from public, anon;
revoke all on function public.rename_circle(uuid, text)                from public, anon;
revoke all on function public.update_circle_goal(uuid, text, text, int) from public, anon;
revoke all on function public.remove_circle_member(uuid, uuid)         from public, anon;
revoke all on function public.mark_circle_notifications_read(uuid[])   from public, anon;

grant execute on function public.send_circle_message(uuid, text)          to authenticated;
grant execute on function public.delete_circle_message(uuid)              to authenticated;
grant execute on function public.rename_circle(uuid, text)                to authenticated;
grant execute on function public.update_circle_goal(uuid, text, text, int) to authenticated;
grant execute on function public.remove_circle_member(uuid, uuid)         to authenticated;
grant execute on function public.mark_circle_notifications_read(uuid[])   to authenticated;

-- ============================================================================
-- Verify (run after applying, as a signed-in user; reuse a circle from 007):
--   select public.create_circle('Test Circle','custom','juz',10) as cid;  -- copy id
--   select public.send_circle_message('<cid>', 'Assalamu alaikum!');       -- returns the row
--   select * from public.circle_messages where circle_id = '<cid>';        -- 1 row
--   select * from public.circle_activity  where circle_id = '<cid>';       -- 'message'
--   select public.set_my_circle_progress('<cid>', 10);                     -- logs goal_reached
--   select kind, meta from public.circle_activity where circle_id = '<cid>' order by created_at;
--   -- a SECOND member (after join_circle_by_code) should receive rows in
--   -- circle_notifications for your message + join; you should NOT see theirs.
--   select count(*) from public.circle_notifications where read_at is null; -- unread
--   select public.mark_circle_notifications_read(null);                    -- mark all read
--   -- realtime: confirm the publication carries the table:
--   select tablename from pg_publication_tables
--    where pubname='supabase_realtime' and tablename='circle_messages';    -- 1 row
-- ============================================================================
