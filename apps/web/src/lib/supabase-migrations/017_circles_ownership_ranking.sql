-- ============================================================================
-- 017 — Circles: ownership transfer + soften the leaderboard
--
-- Two changes, both additive + re-run safe:
--   1. Owner-leave no longer DISBANDS the circle. leave_circle now hands the
--      circle to the earliest-joined remaining member (so a family's shared
--      khatmah + its history survives an owner leaving); it only deletes the
--      circle when the owner is truly the last member. A dedicated
--      transfer_circle_ownership RPC lets an owner hand off explicitly.
--   2. A per-circle `ranking_enabled` flag (default FALSE = gentle "Members"
--      view, no crown/rank) with an owner-only set_circle_ranking RPC. This
--      aligns Circles with the app's "Private · no public leaderboards" stance;
--      an owner can turn competitive ranking back on.
--
-- Depends on 007 + 013 (circles, circle_members, the _log_circle_activity /
-- _notify_user helpers, and the owner_id + role model). Apply after those.
-- ============================================================================

-- 1. Soften-able leaderboard: off by default. ---------------------------------
alter table public.circles
  add column if not exists ranking_enabled boolean not null default false;

-- Owner toggles competitive ranking on/off for their circle.
create or replace function public.set_circle_ranking(p_circle uuid, p_enabled boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.circles where id = p_circle and owner_id = auth.uid()) then
    raise exception 'not the owner';
  end if;
  update public.circles set ranking_enabled = coalesce(p_enabled, false)
   where id = p_circle;
end $$;

-- 2. Explicit ownership transfer (owner → an existing member). ----------------
create or replace function public.transfer_circle_ownership(p_circle uuid, p_new_owner uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.circles where id = p_circle and owner_id = auth.uid()) then
    raise exception 'not the owner';
  end if;
  if p_new_owner = auth.uid() then return; end if;               -- already owner
  if not exists (select 1 from public.circle_members
                  where circle_id = p_circle and user_id = p_new_owner) then
    raise exception 'new owner is not a member';
  end if;
  update public.circles set owner_id = p_new_owner where id = p_circle;
  update public.circle_members set role = 'owner'
    where circle_id = p_circle and user_id = p_new_owner;
  update public.circle_members set role = 'member'
    where circle_id = p_circle and user_id = auth.uid();
  perform public._notify_user(p_new_owner, p_circle, auth.uid(), 'owner',
          'You are now the owner of this circle');
end $$;

-- 3. leave_circle: hand off instead of disband while others remain. -----------
create or replace function public.leave_circle(p_circle uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text; v_heir uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select role into v_role from public.circle_members
   where circle_id = p_circle and user_id = auth.uid();
  if v_role is null then return; end if;            -- not a member; no-op

  if v_role = 'owner' then
    -- Earliest-joined remaining member inherits the circle.
    select user_id into v_heir
      from public.circle_members
     where circle_id = p_circle and user_id <> auth.uid()
     order by joined_at asc
     limit 1;

    if v_heir is null then
      -- Owner is the last member → disband (cascades members/progress/etc.).
      delete from public.circle_members where circle_id = p_circle and user_id = auth.uid();
      delete from public.circles where id = p_circle and owner_id = auth.uid();
      return;
    end if;

    -- Transfer, log the departure, then remove the leaving owner's rows.
    perform public._log_circle_activity(p_circle, auth.uid(), 'left', '{}'::jsonb);
    update public.circles set owner_id = v_heir where id = p_circle;
    update public.circle_members set role = 'owner'
      where circle_id = p_circle and user_id = v_heir;
    delete from public.circle_member_progress where circle_id = p_circle and user_id = auth.uid();
    delete from public.circle_members         where circle_id = p_circle and user_id = auth.uid();
    perform public._notify_user(v_heir, p_circle, auth.uid(), 'owner',
            'You are now the owner of this circle');
  else
    perform public._log_circle_activity(p_circle, auth.uid(), 'left', '{}'::jsonb);
    delete from public.circle_member_progress where circle_id = p_circle and user_id = auth.uid();
    delete from public.circle_members         where circle_id = p_circle and user_id = auth.uid();
  end if;
end $$;

-- 4. Grants — signed-in users only (create-or-replace preserves leave_circle's).
revoke all on function public.set_circle_ranking(uuid, boolean)       from public, anon;
revoke all on function public.transfer_circle_ownership(uuid, uuid)   from public, anon;
grant execute on function public.set_circle_ranking(uuid, boolean)     to authenticated;
grant execute on function public.transfer_circle_ownership(uuid, uuid) to authenticated;
