-- ============================================================================
-- 020 — Account deletion + Circles UGC moderation (App Store 5.1.1(v) + 1.2)
--
-- Additive + re-run safe. Depends on 006 (profiles), 007/013 (circles).
-- ============================================================================

-- 1. Self-serve account deletion (guideline 5.1.1(v)). Every app table FKs
-- auth.users(id) ON DELETE CASCADE, so deleting the auth row purges all of the
-- caller's data. Definer so the anon-key client can trigger it — but ONLY for its
-- own auth.uid(), never a caller-supplied id.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 2. Report a message (guideline 1.2). Reports are write-only for members; triage
-- happens with the service role (no member-facing select policy).
create table if not exists public.circle_message_reports (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.circle_messages (id) on delete cascade,
  circle_id  uuid not null references public.circles (id) on delete cascade,
  reporter   uuid not null references auth.users (id) on delete cascade,
  reason     text,
  created_at timestamptz not null default now()
);
create index if not exists circle_message_reports_created_idx
  on public.circle_message_reports (created_at desc);
alter table public.circle_message_reports enable row level security;

create or replace function public.report_circle_message(p_message uuid, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_circle uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select circle_id into v_circle from public.circle_messages where id = p_message;
  if v_circle is null then raise exception 'message not found'; end if;
  if not public.is_circle_member(v_circle, auth.uid()) then
    raise exception 'not a member';
  end if;
  insert into public.circle_message_reports (message_id, circle_id, reporter, reason)
  values (p_message, v_circle, auth.uid(), nullif(trim(coalesce(p_reason, '')), ''));
end $$;

-- 3. Block a user (global across shared circles). The blocker reads its own list
-- (self-scoped RLS) and filters the blocked user's messages client-side.
create table if not exists public.circle_user_blocks (
  blocker    uuid not null references auth.users (id) on delete cascade,
  blocked    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);
alter table public.circle_user_blocks enable row level security;
drop policy if exists cub_select_own on public.circle_user_blocks;
create policy cub_select_own on public.circle_user_blocks
  for select to authenticated using (blocker = auth.uid());

create or replace function public.block_circle_user(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_user = auth.uid() then return; end if;
  insert into public.circle_user_blocks (blocker, blocked)
  values (auth.uid(), p_user)
  on conflict (blocker, blocked) do nothing;
end $$;

create or replace function public.unblock_circle_user(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from public.circle_user_blocks where blocker = auth.uid() and blocked = p_user;
end $$;

-- 4. Grants — signed-in users only.
revoke all on function public.report_circle_message(uuid, text) from public, anon;
revoke all on function public.block_circle_user(uuid)           from public, anon;
revoke all on function public.unblock_circle_user(uuid)         from public, anon;
grant execute on function public.report_circle_message(uuid, text) to authenticated;
grant execute on function public.block_circle_user(uuid)           to authenticated;
grant execute on function public.unblock_circle_user(uuid)         to authenticated;
