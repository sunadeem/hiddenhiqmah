-- 033_user_prefs_sync.sql
--
-- Make device-local state follow the ACCOUNT instead of the install.
--
-- WHY THIS EXISTS. Everything in packages/ui/lib/storage.ts lived in
-- localStorage with no server copy, and there was no sync-on-login anywhere in
-- the app (onAuthStateChange did exactly one thing: setSession). So signing in
-- on a new phone restored a user's identity and gave them DEFAULTS for
-- everything else. Two consequences, of very different severity:
--
--   1. DATA LOSS. Bookmarks (every ayah, hadith and duʿā someone deliberately
--      saved), a child's stars/badges/flashcard schedule, the household's child
--      profiles, and cumulative Qur'an reading progress had no server copy at
--      all. Delete the app and they were gone with no path back.
--
--   2. SILENTLY WRONG PRAYER TIMES. prayerSettings reset to calcMethod 2 (ISNA)
--      and asrMethod "standard" (Shafiʿi). Hanafi -> standard moves Asr by
--      45-90 minutes, and because notifications AND the widgets read the same
--      value, everything moves together — consistently wrong rather than
--      visibly contradicting itself, so there is nothing on screen to notice.
--      In a prayer app that is the worst failure mode available.
--
-- DESIGN. One row per user, one jsonb blob of named SECTIONS:
--
--   sections = { "<name>": { "data": <any>, "updatedAt": "<iso8601>" }, ... }
--
-- A single jsonb column rather than a column per feature, deliberately: adding a
-- new synced section later is then a client-only change with no migration, and
-- these payloads are small (a few KB) and always read/written whole.
--
-- MERGE POLICY LIVES ON THE CLIENT, not here. The client pulls, merges each
-- section with its own rule, and pushes the result. That is what lets bookmarks
-- UNION (so two devices can never delete each other's saves) while prayer
-- settings take newest-wins. Encoding per-section semantics in SQL would mean a
-- migration every time a rule changed.
--
-- What this table is NOT for: anything already synced through an adapter
-- (checklist, streaks, dhikr, hifz, journal, circles). Those read straight from
-- their own tables when signed in and need no hydration. Do not duplicate them
-- here — two sources of truth for a streak is worse than one imperfect one.

create table if not exists public.user_prefs (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  sections   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.user_prefs is
  'Per-account mirror of device-local preferences and progress. One jsonb blob of named sections; merge policy is client-side. See 033_user_prefs_sync.sql.';

alter table public.user_prefs enable row level security;

-- A user may only ever see or touch their own row. No shared or admin read
-- path: nothing in here is needed server-side, so nothing else should read it.
drop policy if exists "own prefs select" on public.user_prefs;
create policy "own prefs select" on public.user_prefs
  for select using (auth.uid() = user_id);

drop policy if exists "own prefs insert" on public.user_prefs;
create policy "own prefs insert" on public.user_prefs
  for insert with check (auth.uid() = user_id);

drop policy if exists "own prefs update" on public.user_prefs;
create policy "own prefs update" on public.user_prefs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own prefs delete" on public.user_prefs;
create policy "own prefs delete" on public.user_prefs
  for delete using (auth.uid() = user_id);

-- ── Write ONE section without touching the others ─────────────────────────
--
-- Two devices writing different sections must not clobber each other, which a
-- plain upsert of the whole `sections` object would do: device A reads, device B
-- writes bookmarks, device A writes prayer settings from its stale copy and
-- B's bookmarks vanish. Merging with `||` server-side keeps each write scoped to
-- its own key.
--
-- The updatedAt guard makes a write a no-op when the stored section is already
-- NEWER. Clocks come from devices and can be wrong, so this is not a
-- correctness guarantee — it is enough to stop an idle phone that wakes up with
-- a stale copy from overwriting a fresh edit made elsewhere. Sections whose
-- merge is a union (bookmarks, reading progress) are additionally safe by
-- construction, because the client unions before pushing.
create or replace function public.set_pref_section(
  p_section    text,
  p_data       jsonb,
  p_updated_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_section is null or p_section = '' then
    raise exception 'p_section is required';
  end if;
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.user_prefs as up (user_id, sections, updated_at)
  values (
    auth.uid(),
    jsonb_build_object(
      p_section,
      jsonb_build_object('data', p_data, 'updatedAt', to_jsonb(p_updated_at))
    ),
    now()
  )
  on conflict (user_id) do update
    set sections = up.sections || jsonb_build_object(
          p_section,
          jsonb_build_object('data', p_data, 'updatedAt', to_jsonb(p_updated_at))
        ),
        updated_at = now()
    -- Only when the incoming copy is at least as new as what is stored.
    where coalesce(
            (up.sections -> p_section ->> 'updatedAt')::timestamptz,
            '-infinity'::timestamptz
          ) <= p_updated_at;
end;
$$;

revoke all on function public.set_pref_section(text, jsonb, timestamptz) from public;
grant execute on function public.set_pref_section(text, jsonb, timestamptz) to authenticated;

comment on function public.set_pref_section is
  'Upsert a single named section of user_prefs.sections for the calling user, skipped if the stored section is newer. Scoped per-key so concurrent devices writing different sections cannot clobber each other.';
