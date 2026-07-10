-- ============================================================================
-- 021 — Circles profanity filter + per-user strikes / suspension
--
-- Adds server-authoritative content moderation to Circles chat:
--   • user_moderation: per-user strike count + suspended flag (NOT on profiles,
--     which is self-updatable — a user could otherwise clear their own strikes).
--   • send_circle_message now: blocks suspended users, screens each message for
--     profanity, records a strike on a hit, and auto-suspends at the 3rd strike
--     ("blocked for review"). Enforcement lives in the ONE definer RPC every
--     message write funnels through, so a hacked client can't bypass it.
--
-- Depends on 006 (profiles), 013 (circle_messages + send_circle_message).
-- Re-run safe.
-- ============================================================================

-- 1. Moderation state. RLS: the owner can READ their own row (so the client can
--    show "you're suspended"), but there is NO write policy — only SECURITY
--    DEFINER RPCs and the service role (admin) mutate it.
create table if not exists public.user_moderation (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  strike_count  int not null default 0,
  suspended     boolean not null default false,
  last_reason   text,
  last_strike_at timestamptz,
  updated_at    timestamptz not null default now()
);
alter table public.user_moderation enable row level security;
drop policy if exists umod_select_own on public.user_moderation;
create policy umod_select_own on public.user_moderation
  for select to authenticated using (user_id = auth.uid());

-- 2. Profanity detector. Whole-word (\y) case-insensitive match of a curated
--    stem list, with a few common leet substitutions. Word boundaries avoid the
--    "Scunthorpe problem" (no mid-word matches). Tune the list as needed — this
--    is one layer; report/block + admin review are the backstops.
create or replace function public._contains_profanity(p_text text)
returns boolean language sql immutable set search_path = public as $$
  select p_text ~* ('\y(' ||
    'f+u+c+k|motherf\w*k|f[a@]gg?[o0]t|' ||
    'sh[i1!]t|bullsh[i1!]t|' ||
    'b[i1!]tch|b[a@]st[a@]rd|' ||
    'c[u\*]nt|assh[o0]le|a\$\$h[o0]le|dumb[a@]ss|jack[a@]ss|' ||
    'wh[o0]re|sl[u\*]t|' ||
    'n[i1!]gg[e3]r|n[i1!]gg[a@](?!rd)|' ||   -- (?!rd) spares "niggard/niggardly"
    'goddamn|godd[a@]mn' ||
  ')\w*\y');
$$;

-- 3. Rewrite send_circle_message. Return type changes (row -> jsonb status), so
--    DROP first (create-or-replace can't change return type), then re-grant.
drop function if exists public.send_circle_message(uuid, text);

create function public.send_circle_message(p_circle uuid, p_body text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_row     public.circle_messages;
  v_body    text;
  v_mod     public.user_moderation;
  v_strikes int;
  v_limit   int := 3;   -- strike 1 & 2 warn; 3rd blocks for review
begin
  if not public.is_circle_member(p_circle, auth.uid()) then
    raise exception 'not a member';
  end if;

  -- Suspension gate (blocked for review → cannot post until an admin clears it).
  select * into v_mod from public.user_moderation where user_id = auth.uid();
  if coalesce(v_mod.suspended, false) then
    return jsonb_build_object('status', 'suspended');
  end if;

  v_body := trim(coalesce(p_body, ''));
  if v_body = '' then raise exception 'message is empty'; end if;
  if length(v_body) > 2000 then v_body := left(v_body, 2000); end if;

  -- Profanity → record a strike, do NOT post, and (at the limit) auto-suspend.
  if public._contains_profanity(v_body) then
    insert into public.user_moderation (user_id, strike_count, last_reason, last_strike_at, updated_at)
    values (auth.uid(), 1, 'profanity', now(), now())
    on conflict (user_id) do update
      set strike_count   = public.user_moderation.strike_count + 1,
          last_reason    = 'profanity',
          last_strike_at = now(),
          updated_at     = now()
    returning strike_count into v_strikes;

    if v_strikes >= v_limit then
      update public.user_moderation set suspended = true, updated_at = now()
        where user_id = auth.uid();
      return jsonb_build_object('status', 'suspended', 'strikes', v_strikes);
    end if;
    return jsonb_build_object('status', 'profanity', 'strikes', v_strikes, 'limit', v_limit);
  end if;

  -- Clean → post as normal.
  insert into public.circle_messages (circle_id, user_id, body)
  values (p_circle, auth.uid(), v_body)
  returning * into v_row;
  perform public._log_circle_activity(p_circle, auth.uid(), 'message',
          jsonb_build_object('message_id', v_row.id));
  perform public._notify_circle_members(p_circle, auth.uid(), 'message',
          public._circle_display_name(auth.uid()) || ': ' || left(v_body, 80));
  return jsonb_build_object('status', 'ok', 'message_id', v_row.id);
end $$;

revoke all on function public.send_circle_message(uuid, text) from public, anon;
grant execute on function public.send_circle_message(uuid, text) to authenticated;
