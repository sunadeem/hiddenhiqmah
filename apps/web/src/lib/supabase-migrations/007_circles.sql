-- ============================================================================
-- Hidden Hiqmah — Circles Migration (007)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor → New query. Idempotent.
-- ⚠️  Apply to a NON-PRODUCTION target first, verify, THEN promote to prod.
-- Requires 006 (profiles).
--
-- Private accountability circles. Provisions:
--   * circles                 — a circle + its shared goal (e.g. 30-juz khatmah)
--   * circle_members          — membership (owner|member)
--   * circle_invites          — short join codes (the ONLY way to join)
--   * circle_member_progress  — each member's contribution to the goal
--   * circle_reactions        — du'a encouragements (NO public like-counts)
--   * is_circle_member / shares_circle — SECURITY DEFINER helpers (avoid RLS recursion)
--   * RPCs: create_circle, leave_circle, delete_circle, generate_circle_invite,
--           join_circle_by_code, set_my_circle_progress, send_circle_dua
--
-- Privacy invariants (enforced in the DB, not trusted to the client):
--   * A circle + all its rows are visible ONLY to its members. No public read.
--   * Joining is ONLY via a valid invite code (definer RPC); you can't SELECT a
--     circle you're not in, so you can't discover or self-add to one.
--   * All membership/progress/reaction writes go through definer RPCs.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. Tables
-- ============================================================================
create table if not exists public.circles (
    id          uuid primary key default gen_random_uuid(),
    name        text not null default 'My Circle',
    owner_id    uuid not null references auth.users (id) on delete cascade,
    goal_type   text not null default 'khatmah' check (goal_type in ('khatmah','hifz','custom')),
    goal_unit   text not null default 'juz',     -- juz | surah | pages …
    goal_target int  not null default 30 check (goal_target >= 1),
    created_at  timestamptz not null default now()
);

create table if not exists public.circle_members (
    circle_id  uuid not null references public.circles (id) on delete cascade,
    user_id    uuid not null references auth.users (id) on delete cascade,
    role       text not null default 'member' check (role in ('owner','member')),
    joined_at  timestamptz not null default now(),
    primary key (circle_id, user_id)
);
create index if not exists circle_members_user_idx on public.circle_members (user_id);

create table if not exists public.circle_invites (
    id          uuid primary key default gen_random_uuid(),
    circle_id   uuid not null references public.circles (id) on delete cascade,
    code        text not null unique,
    created_by  uuid not null references auth.users (id) on delete cascade,
    created_at  timestamptz not null default now(),
    expires_at  timestamptz
);

create table if not exists public.circle_member_progress (
    circle_id   uuid not null references public.circles (id) on delete cascade,
    user_id     uuid not null references auth.users (id) on delete cascade,
    value       int  not null default 0 check (value >= 0),  -- e.g. juz completed
    updated_at  timestamptz not null default now(),
    primary key (circle_id, user_id)
);

create table if not exists public.circle_reactions (
    id          uuid primary key default gen_random_uuid(),
    circle_id   uuid not null references public.circles (id) on delete cascade,
    from_user   uuid not null references auth.users (id) on delete cascade,
    to_user     uuid not null references auth.users (id) on delete cascade,
    kind        text not null default 'dua' check (kind in ('dua')),
    created_at  timestamptz not null default now()
);
create index if not exists circle_reactions_to_idx on public.circle_reactions (to_user, created_at);

-- ============================================================================
-- 2. Membership helpers (SECURITY DEFINER → bypass RLS, so policies that need
--    to read circle_members don't recurse on circle_members' own policy).
-- ============================================================================
create or replace function public.is_circle_member(p_circle uuid, p_uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.circle_members
    where circle_id = p_circle and user_id = p_uid
  );
$$;

create or replace function public.shares_circle(p_other uuid, p_uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from public.circle_members a
    join public.circle_members b on a.circle_id = b.circle_id
    where a.user_id = p_uid and b.user_id = p_other
  );
$$;

-- ============================================================================
-- 3. RLS — members can SELECT their circle's rows; ALL writes go via RPCs
--    (RLS enabled + no write policy = direct client writes denied; the
--    SECURITY DEFINER RPCs below bypass RLS).
-- ============================================================================
alter table public.circles                enable row level security;
alter table public.circle_members         enable row level security;
alter table public.circle_invites         enable row level security;
alter table public.circle_member_progress enable row level security;
alter table public.circle_reactions       enable row level security;

drop policy if exists circles_select_member on public.circles;
create policy circles_select_member on public.circles
    for select to authenticated using (public.is_circle_member(id, auth.uid()));

drop policy if exists cm_select_member on public.circle_members;
create policy cm_select_member on public.circle_members
    for select to authenticated using (public.is_circle_member(circle_id, auth.uid()));

drop policy if exists ci_select_member on public.circle_invites;
create policy ci_select_member on public.circle_invites
    for select to authenticated using (public.is_circle_member(circle_id, auth.uid()));

drop policy if exists cmp_select_member on public.circle_member_progress;
create policy cmp_select_member on public.circle_member_progress
    for select to authenticated using (public.is_circle_member(circle_id, auth.uid()));

drop policy if exists cr_select_member on public.circle_reactions;
create policy cr_select_member on public.circle_reactions
    for select to authenticated using (public.is_circle_member(circle_id, auth.uid()));

-- Co-member visibility for profiles (deferred from 006): you may read a profile
-- if you share a circle with that user.
drop policy if exists profiles_select_circle_members on public.profiles;
create policy profiles_select_circle_members on public.profiles
    for select to authenticated using (public.shares_circle(id, auth.uid()));

-- ============================================================================
-- 4. Write RPCs (SECURITY DEFINER — the only way to mutate circle data)
-- ============================================================================
create or replace function public.create_circle(
    p_name text,
    p_goal_type text default 'khatmah',
    p_goal_unit text default 'juz',
    p_goal_target int default 30
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.circles (name, owner_id, goal_type, goal_unit, goal_target)
  values (coalesce(nullif(trim(p_name), ''), 'My Circle'), auth.uid(),
          coalesce(p_goal_type, 'khatmah'), coalesce(p_goal_unit, 'juz'),
          greatest(coalesce(p_goal_target, 30), 1))
  returning id into v_id;
  insert into public.circle_members (circle_id, user_id, role)
  values (v_id, auth.uid(), 'owner');
  return v_id;
end $$;

create or replace function public.leave_circle(p_circle uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select role into v_role from public.circle_members
   where circle_id = p_circle and user_id = auth.uid();
  if v_role is null then return; end if;            -- not a member; no-op
  delete from public.circle_members where circle_id = p_circle and user_id = auth.uid();
  -- Owner leaving disbands the circle (cascades members/progress/etc).
  if v_role = 'owner' then
    delete from public.circles where id = p_circle and owner_id = auth.uid();
  end if;
end $$;

create or replace function public.delete_circle(p_circle uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.circles where id = p_circle and owner_id = auth.uid();
  if not found then raise exception 'not the owner'; end if;
end $$;

create or replace function public.generate_circle_invite(p_circle uuid, p_ttl_hours int default 168)
returns text language plpgsql security definer set search_path = public as $$
declare v_code text;
begin
  if not public.is_circle_member(p_circle, auth.uid()) then raise exception 'not a member'; end if;
  loop
    -- Built-in gen_random_uuid() (pg_catalog) — avoids pgcrypto's gen_random_bytes,
    -- which lives in the `extensions` schema and isn't on this function's search_path.
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));  -- 6-char code
    begin
      insert into public.circle_invites (circle_id, code, created_by, expires_at)
      values (p_circle, v_code, auth.uid(),
              case when p_ttl_hours is null then null else now() + make_interval(hours => p_ttl_hours) end);
      exit;
    exception when unique_violation then
      null; -- code collided; loop and try another (empty handler body is a syntax error)
    end;
  end loop;
  return v_code;
end $$;

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
  return v_circle;
end $$;

create or replace function public.set_my_circle_progress(p_circle uuid, p_value int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_circle_member(p_circle, auth.uid()) then raise exception 'not a member'; end if;
  insert into public.circle_member_progress (circle_id, user_id, value, updated_at)
  values (p_circle, auth.uid(), greatest(coalesce(p_value, 0), 0), now())
  on conflict (circle_id, user_id) do update
    set value = greatest(coalesce(excluded.value, 0), 0), updated_at = now();
end $$;

create or replace function public.send_circle_dua(p_circle uuid, p_to_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_circle_member(p_circle, auth.uid()) then raise exception 'not a member'; end if;
  if not public.is_circle_member(p_circle, p_to_user) then raise exception 'recipient not a member'; end if;
  insert into public.circle_reactions (circle_id, from_user, to_user, kind)
  values (p_circle, auth.uid(), p_to_user, 'dua');
end $$;

-- ============================================================================
-- 5. Grants — execute to signed-in users only; helpers stay internal
-- ============================================================================
revoke all on function public.is_circle_member(uuid, uuid) from public, anon;
revoke all on function public.shares_circle(uuid, uuid) from public, anon;
revoke all on function public.create_circle(text, text, text, int) from public, anon;
revoke all on function public.leave_circle(uuid) from public, anon;
revoke all on function public.delete_circle(uuid) from public, anon;
revoke all on function public.generate_circle_invite(uuid, int) from public, anon;
revoke all on function public.join_circle_by_code(text) from public, anon;
revoke all on function public.set_my_circle_progress(uuid, int) from public, anon;
revoke all on function public.send_circle_dua(uuid, uuid) from public, anon;

grant execute on function public.create_circle(text, text, text, int) to authenticated;
grant execute on function public.leave_circle(uuid) to authenticated;
grant execute on function public.delete_circle(uuid) to authenticated;
grant execute on function public.generate_circle_invite(uuid, int) to authenticated;
grant execute on function public.join_circle_by_code(text) to authenticated;
grant execute on function public.set_my_circle_progress(uuid, int) to authenticated;
grant execute on function public.send_circle_dua(uuid, uuid) to authenticated;

-- ============================================================================
-- Verify (run after applying, as a signed-in user via the SQL editor's role,
-- or from the app):
--   select public.create_circle('Family Khatmah','khatmah','juz',30) as circle_id;
--   -- copy that id:
--   select public.generate_circle_invite('<circle_id>') as code;
--   select public.set_my_circle_progress('<circle_id>', 9);
--   select * from public.circles;                    -- should show your circle
--   select * from public.circle_members;             -- you as owner
--   select sum(value) from public.circle_member_progress where circle_id = '<circle_id>';
--   -- privacy check: a DIFFERENT user must get 0 rows from `select * from circles`
--   --   until they join_circle_by_code('<code>').
-- ============================================================================
