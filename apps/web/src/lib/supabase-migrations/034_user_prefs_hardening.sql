-- ============================================================================
-- Hidden Hiqmah — user_prefs hardening (034)
-- Project: fiyffkjeatxgmwgmdmkt
-- ============================================================================
-- Run in Supabase Dashboard → SQL Editor → New query. Idempotent.
-- ⚠️  Apply to a NON-PRODUCTION target first, verify, THEN promote to prod.
-- Requires 033 (user_prefs + set_pref_section), which is ALREADY APPLIED to dev
-- and prod and is therefore immutable — everything here is additive or a
-- replace-in-place of 033's objects. Nothing in 033 is edited.
--
-- 033 shipped in build 5 and works, but an adversarial review found four ways
-- the sync can lose or freeze a user's data. All four are fixed here.
--
--   1. ⭐ THE CLIENT CLOCK WAS TRUSTED WITHOUT A CEILING. set_pref_section
--      stored `p_updated_at` exactly as the device sent it, and the staleness
--      guard then compares every future write against that stored value. One
--      device with a fast clock — a wrong year, a manually-set date, a
--      deliberate value — writes a stamp far in the future, and from that
--      moment EVERY honest write to that section is declined, on every device
--      the account owns, for as long as the account exists. Because 033 returns
--      void the client never learns, so the section simply stops syncing and
--      nobody finds out. For prayerSettings that means a Hanafi user's Asr
--      choice can never propagate again. §3 clamps the stamp to server time
--      (turning "frozen forever" into "declined for at most five minutes");
--      §4 repairs rows that were already poisoned before this migration ran.
--
--   2. THE SKIP WAS SILENT. `returns void` gives the client no way to tell
--      "stored" from "declined as stale", so a device that loses a race
--      believes it won. §3 returns boolean.
--
--   3. THE RPC WAS OPTIONAL. `authenticated` still held direct INSERT/UPDATE/
--      DELETE on user_prefs through 033's policies, so any client could PATCH
--      the whole `sections` object and bypass the per-key merge entirely —
--      re-opening the exact clobber (device A's stale copy erasing device B's
--      bookmarks) that set_pref_section exists to prevent. §2 follows the
--      house RPC-only pattern from 025's device_tokens: keep SELECT, deny
--      direct writes, let the definer function be the only writer.
--
--   4. THE FUNCTION GRANT WAS INCOMPLETE. `revoke all ... from public` does not
--      remove the grants Supabase's default privileges hand to `anon` and
--      `authenticated` directly — revoking from PUBLIC only removes the
--      implicit route. §3 revokes from all three by name, then grants to
--      `authenticated` alone.
--
-- Plus one hole neither the review nor 033 mentions, found while writing §2:
-- RLS DOES NOT APPLY TO TRUNCATE. Supabase's default privileges grant ALL on
-- public tables to anon/authenticated, and ALL includes TRUNCATE, so a signed-in
-- user holding the (public, shipped-in-the-bundle) anon key could have emptied
-- user_prefs for EVERY account — no policy would have stopped it, because
-- policies are only consulted for SELECT/INSERT/UPDATE/DELETE. §2 revokes it.
--
-- ORDER MATTERS AND IS DELIBERATE: lock down the write paths (§2) and harden
-- the function (§3) BEFORE repairing existing rows (§4). Repairing first would
-- leave a window in which a device with a bad clock re-poisons a row we just
-- healed.
--
-- CLIENT COMPATIBILITY: the argument set is unchanged (p_section, p_data,
-- p_updated_at), so PostgREST still resolves the call from builds already in
-- users' hands, and a client that ignores the return value keeps working —
-- supabase-js simply receives `true`/`false` where it used to receive `null`.
-- The only behaviour old builds lose is the ability to write user_prefs
-- directly, which no shipped code has ever done (prefsSync.ts only SELECTs
-- `sections` and calls the RPC).
-- ============================================================================


-- ============================================================================
-- 1. Reading a section's stored timestamp without ever throwing
-- ============================================================================
-- `(entry ->> 'updatedAt')::timestamptz` is used in the staleness guard, and a
-- cast that throws inside that guard would make the section permanently
-- unwritable — the same "frozen forever" failure as a future stamp, arriving
-- through a different door. Nothing the app writes is malformed, but §2 is
-- closing a direct-write path that WAS open, so a row may already contain
-- something that is not a timestamp, and §4 has to walk every row without
-- being able to inspect them first.
--
-- Returns null for: a missing key, a non-object entry, or an unparseable
-- string. Callers treat null as '-infinity' (i.e. "no stored stamp, accept the
-- write"), which is the safe direction: a junk value must not be able to block
-- a real one.
--
-- STABLE, not IMMUTABLE: text → timestamptz depends on the DateStyle/TimeZone
-- settings. Marking it immutable would be a lie the planner is entitled to act
-- on.
create or replace function public.pref_section_updated_at(p_entry jsonb)
returns timestamptz
language plpgsql
stable
as $$
begin
  return (p_entry ->> 'updatedAt')::timestamptz;
exception when others then
  return null;
end;
$$;

comment on function public.pref_section_updated_at(jsonb) is
  'Parse the updatedAt of one user_prefs section entry, or null if absent/malformed. Never throws — a bad stored value must not be able to freeze a section. See 034.';

-- Internal helper: only set_pref_section (security definer, runs as owner) and
-- this migration call it. No client needs it.
revoke all on function public.pref_section_updated_at(jsonb) from public, anon, authenticated;


-- ============================================================================
-- 2. RLS: self-read only, ALL writes through the RPC (pattern from 025)
-- ============================================================================
alter table public.user_prefs enable row level security;

-- 033's select policy is correct and stays; recreated here so this file is a
-- complete statement of the table's access rules rather than a diff someone
-- has to reconstruct.
drop policy if exists "own prefs select" on public.user_prefs;
create policy "own prefs select" on public.user_prefs
  for select to authenticated using (auth.uid() = user_id);

-- 033's write policies are replaced by explicit denials. Dropping them alone
-- would already deny (RLS denies any command with no matching policy), but an
-- explicit `false` policy shows up in pg_policies and in the Supabase dashboard,
-- so the next person to read this table's rules sees "writes are blocked on
-- purpose" instead of "someone forgot to add a policy".
drop policy if exists "own prefs insert" on public.user_prefs;
drop policy if exists "own prefs update" on public.user_prefs;
drop policy if exists "own prefs delete" on public.user_prefs;
drop policy if exists "prefs no direct insert" on public.user_prefs;
drop policy if exists "prefs no direct update" on public.user_prefs;
drop policy if exists "prefs no direct delete" on public.user_prefs;

create policy "prefs no direct insert" on public.user_prefs
  for insert to authenticated with check (false);
create policy "prefs no direct update" on public.user_prefs
  for update to authenticated using (false) with check (false);
-- Deleting the row is not a feature the app has, and it is a whole-account wipe
-- of everything 033 exists to preserve. Account deletion still works: every
-- table FKs auth.users ON DELETE CASCADE and delete_my_account() (020) is a
-- definer function, so neither is affected by this policy.
create policy "prefs no direct delete" on public.user_prefs
  for delete to authenticated using (false);

-- ⚠️ RLS never consults a policy for TRUNCATE — it is gated by the TRUNCATE
-- privilege alone. Supabase's default privileges grant ALL (which includes
-- TRUNCATE, and REFERENCES/TRIGGER) on public tables to anon and authenticated,
-- and the anon key ships inside a public repo and a public app bundle. So:
-- revoke everything from both roles, then hand back exactly the one privilege
-- the client legitimately uses — SELECT, for prefsSync's fetchRemote(). Writes
-- arrive via the definer RPC, which runs as the table owner and is unaffected.
-- service_role is deliberately untouched; the push sender and admin paths need it.
revoke all    on table public.user_prefs from anon;
revoke all    on table public.user_prefs from authenticated;
grant  select on table public.user_prefs to   authenticated;


-- ============================================================================
-- 3. set_pref_section: clamp the clock, report the outcome, bound the payload
-- ============================================================================
-- ⚠️ THE DROP IS REQUIRED. `create or replace function` cannot change a return
-- type ("cannot change return type of existing function"), and this function
-- goes from void to boolean. The argument list is unchanged, so this is a
-- replacement and not an overload — after the drop there is exactly one
-- set_pref_section, and PostgREST resolution for {p_section, p_data,
-- p_updated_at} is unambiguous, as it was before.
--
-- Between the drop and the create, a call fails. The SQL editor runs this file
-- as one transaction, so the window is invisible to clients; if you split the
-- file, keep these two statements together. A push that did fail is not lost —
-- prefsSync logs and retries on the next storage write or the next sign-in.
drop function if exists public.set_pref_section(text, jsonb, timestamptz);

create function public.set_pref_section(
  p_section    text,
  p_data       jsonb,
  p_updated_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Read auth.uid() once: it is a stable per-transaction value, and binding it
  -- makes the "who is writing" decision visible in one place.
  v_uid      uuid := auth.uid();
  v_at       timestamptz;
  v_existing jsonb;
  v_entry    jsonb;
  v_bytes    bigint;
  v_rows     integer;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_section is null or p_section = '' then
    raise exception 'p_section is required';
  end if;
  -- Section names are compile-time literals in prefsSync.ts; the longest is
  -- 'notificationPrefs' at 17 characters. Anything past 64 is not a section
  -- name, and each distinct name is a permanent key in a row we always read
  -- and write whole.
  if char_length(p_section) > 64 then
    raise exception 'set_pref_section: p_section is not a section name';
  end if;
  -- A null payload can only be a client bug: every section's read() returns an
  -- object or an array, never null. Storing it would stamp the account copy
  -- fresh while making it useless, so fail loudly instead — the local copy is
  -- still the source of truth and the next push retries.
  if p_data is null then
    raise exception 'set_pref_section: p_data is required';
  end if;

  -- SIZE CEILING, set generously on purpose. The largest legitimate payload is
  -- bookmarks, and the merge UNIONS (a delete on one device is resurrected by
  -- another) so that list only ever grows. The absolute ceiling is every ayah
  -- saved — 6,236 entries of {type,id,title,subtitle,href,timestamp} with an
  -- Arabic title — which measures 1,318,711 bytes. 4 MiB is ~3.2× above a
  -- payload no real user will reach, while still refusing the unbounded blob
  -- that would make every sync of this row expensive for the account that owns
  -- it. octet_length, not char_length: those Arabic titles are multi-byte, and
  -- a character count would under-measure the real payload by ~40%.
  v_bytes := octet_length(p_data::text);
  if v_bytes > 4194304 then
    raise exception 'set_pref_section: p_data too large (% bytes) for section %', v_bytes, p_section;
  end if;

  -- ⭐ CLAMP THE DEVICE CLOCK. Without a ceiling, one bad stamp disables the
  -- section permanently and invisibly for the whole account (see the header).
  --
  -- Five minutes of tolerance rather than a hard now(): stamps inside the
  -- allowance pass through UNCHANGED, so a device whose clock is normally
  -- skewed still records its own edit times, and only a stamp that could not
  -- be honest gets rewritten. The price, stated plainly because it is real: a
  -- future-stamped write still parks the section for as long as the allowance —
  -- an honest write arriving within those five minutes is declined. That is a
  -- BOUNDED, self-healing window instead of a permanent freeze, and prefsSync
  -- retries on the next storage write or the next sign-in. Shrink the interval
  -- to shrink the window; do not remove it, or a device one second fast starts
  -- having its stamps rewritten on every push.
  --
  -- coalesce INSIDE least, and not around it, because least() IGNORES nulls
  -- rather than propagating them: least(null, now() + '5 min') returns the
  -- ceiling, so a null p_updated_at would have been stored as a future stamp —
  -- creating the precise poisoning this line exists to prevent.
  v_at := least(coalesce(p_updated_at, now()), now() + interval '5 minutes');

  -- jsonb_typeof guard: `sections` is `jsonb not null`, not `jsonb object not
  -- null`, and §2 is closing a direct-write path that could have left an array
  -- or a scalar in it. `||` on a non-object does not merge, it concatenates
  -- into an ARRAY, which would quietly destroy every section in the row. §4
  -- repairs existing damage; this makes the function total regardless.
  select case when jsonb_typeof(up.sections) = 'object' then up.sections else '{}'::jsonb end
    into v_existing
    from public.user_prefs up
   where up.user_id = v_uid;

  -- Bound the NUMBER of sections, not just the size of one. The app has five
  -- fixed names, so a 33rd distinct key can only be a client inventing them,
  -- and every key is permanent — nothing in the design ever removes one. This
  -- cannot false-positive on real data (adding a synced section is a deliberate
  -- edit to the SECTIONS array), and it only ever blocks a NEW name: updating a
  -- section that already exists is never refused.
  -- jsonb_exists() rather than the `?` operator, which some drivers and SQL
  -- tools treat as a bind placeholder when this file is pasted through them.
  if v_existing is not null
     and not jsonb_exists(v_existing, p_section)
     and (select count(*) from jsonb_object_keys(v_existing)) >= 32
  then
    raise exception 'set_pref_section: too many sections for this user';
  end if;

  v_entry := jsonb_build_object(
               p_section,
               jsonb_build_object('data', p_data, 'updatedAt', to_jsonb(v_at))
             );

  insert into public.user_prefs as up (user_id, sections, updated_at)
  values (v_uid, v_entry, now())
  on conflict (user_id) do update
    set sections = (case when jsonb_typeof(up.sections) = 'object'
                         then up.sections
                         else '{}'::jsonb end) || v_entry,
        updated_at = now()
    -- Unchanged in spirit from 033: write only when the incoming copy is at
    -- least as new as what is stored, so an idle phone waking with a stale copy
    -- cannot overwrite a fresh edit made elsewhere. Two changes: it compares
    -- the CLAMPED stamp, and a stored value that will not parse reads as
    -- '-infinity' (accept) instead of raising.
    where coalesce(
            public.pref_section_updated_at(up.sections -> p_section),
            '-infinity'::timestamptz
          ) <= v_at;

  -- The insert path affects one row; the conflict path affects zero when the
  -- WHERE above declines. That is the entire difference between "stored" and
  -- "declined as stale", and 033 threw it away.
  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

-- ⚠️ Order: the drop above discarded every grant the old function had, and a
-- freshly created function carries Postgres's default EXECUTE-to-PUBLIC. So
-- revoke first, then grant — and revoke from anon and authenticated BY NAME,
-- because Supabase's default privileges may grant them EXECUTE directly and a
-- revoke from PUBLIC does not touch a direct grant (defect 4).
revoke all on function public.set_pref_section(text, jsonb, timestamptz) from public;
revoke all on function public.set_pref_section(text, jsonb, timestamptz) from anon;
revoke all on function public.set_pref_section(text, jsonb, timestamptz) from authenticated;
grant execute on function public.set_pref_section(text, jsonb, timestamptz) to authenticated;

comment on function public.set_pref_section(text, jsonb, timestamptz) is
  'Upsert one named section of user_prefs.sections for the calling user. Returns true if stored, false if declined because the stored copy is newer. The supplied timestamp is clamped to now()+5min so a wrong device clock cannot freeze the section forever. Sole write path: clients hold SELECT only, and RLS denies direct writes as well. See 034.';


-- ============================================================================
-- 4. Repair rows 033 already poisoned
-- ============================================================================
-- The clamp in §3 only protects writes made from now on. 033 has been live on
-- dev and prod since build 5, so a row may ALREADY hold a far-future stamp — and
-- such a row stays frozen forever even with a perfect function, because the
-- guard keeps comparing against the bad stored value. Sweeping once here is the
-- only thing that unfreezes it; there is no client-side path back.
--
-- Safe to re-run: after this block no stamp is more than five minutes ahead, so
-- a second run matches nothing.
do $$
declare
  v_rows integer;
begin
  -- FIRST, because the clamp below calls jsonb_each, which errors on anything
  -- that is not an object. Resetting to '{}' loses nothing recoverable: the
  -- client reads sections['<name>'].data, which is already undefined for an
  -- array or a scalar, and an empty object is what a first-time sync sees — the
  -- next push from any device repopulates it from local storage.
  update public.user_prefs
     set sections = '{}'::jsonb,
         updated_at = now()
   where jsonb_typeof(sections) <> 'object';
  get diagnostics v_rows = row_count;
  if v_rows > 0 then
    raise notice '034: reset % user_prefs row(s) whose sections was not a JSON object', v_rows;
  end if;

  -- Pull every future stamp back to now(). now(), not '-infinity' and not the
  -- row's own updated_at: the stored blob genuinely is the account's current
  -- copy, so it should read as "current as of the repair" — any honest write
  -- after this migration is later than that and will be accepted, while a
  -- device whose clock runs backwards is still correctly held off, which is what
  -- the guard is for.
  --
  -- pref_section_updated_at() returns null for a malformed or missing stamp, and
  -- `null > x` is null, so those entries fall through the CASE untouched and
  -- jsonb_set only ever runs on a real object with a real timestamp.
  update public.user_prefs as up
     set sections = (
           select jsonb_object_agg(
                    e.key,
                    case
                      when public.pref_section_updated_at(e.value) > now() + interval '5 minutes'
                        then jsonb_set(e.value, '{updatedAt}', to_jsonb(now()))
                      else e.value
                    end
                  )
             from jsonb_each(up.sections) as e
         ),
         updated_at = now()
   where exists (
           select 1
             from jsonb_each(up.sections) as e
            where public.pref_section_updated_at(e.value) > now() + interval '5 minutes'
         );
  get diagnostics v_rows = row_count;
  raise notice '034: clamped future updatedAt stamps on % user_prefs row(s)', v_rows;
end;
$$;


-- ============================================================================
-- 5. PostgREST schema cache
-- ============================================================================
-- Supabase reloads it on DDL via an event trigger, but say so explicitly: a
-- stale cache after dropping and recreating an RPC is exactly the PGRST202
-- ("function not found in schema cache") this project has hit before, and here
-- it would mean every device silently stops syncing preferences.
notify pgrst, 'reload schema';


-- ============================================================================
-- This file was executed against a throwaway PostgreSQL 17 cluster carrying
-- 033 plus deliberately poisoned rows (a 2036 stamp, a malformed stamp, a
-- `sections` that was an array) before being committed: applied clean, applied
-- clean a second and third time, applied clean as a single transaction, and
-- applied clean to an empty 033 database. The queries below re-check the same
-- properties on the real target.
--
-- Verify (run after applying):
--
--   -- one function, returning boolean:
--   select p.proname, pg_get_function_identity_arguments(p.oid) as args,
--          pg_get_function_result(p.oid) as returns
--     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public' and p.proname = 'set_pref_section';
--
--   -- execute granted to authenticated only (no anon, no PUBLIC):
--   select proacl from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public' and p.proname = 'set_pref_section';
--
--   -- select only; no insert/update/delete/truncate for anon or authenticated:
--   select grantee, privilege_type from information_schema.role_table_grants
--    where table_schema = 'public' and table_name = 'user_prefs'
--      and grantee in ('anon', 'authenticated') order by grantee, privilege_type;
--
--   -- writes are denied, reads are not:
--   select polname, polcmd, pg_get_expr(polqual, polrelid) as using_expr
--     from pg_policy where polrelid = 'public.user_prefs'::regclass;
--
--   -- no future stamps survive anywhere:
--   select count(*) from public.user_prefs up, jsonb_each(up.sections) e
--    where public.pref_section_updated_at(e.value) > now() + interval '5 minutes';
--   -- expect 0
--
--   -- as a SIGNED-IN user (not the SQL editor's postgres role, which has no
--   -- auth.uid() and will raise 'not authenticated'):
--   --   select public.set_pref_section('prayerSettings', '{"calcMethod":1}'::jsonb, now());
--   --   → true
--   --   select public.set_pref_section('prayerSettings', '{"calcMethod":2}'::jsonb, now() - interval '1 day');
--   --   → false   (declined as stale, and now the client can see that)
--   --   select public.set_pref_section('prayerSettings', '{"calcMethod":3}'::jsonb, now() + interval '10 years');
--   --   → true, and the stored updatedAt is ~now(), NOT 2036
-- ============================================================================
