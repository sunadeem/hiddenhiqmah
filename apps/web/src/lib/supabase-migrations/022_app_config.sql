-- ============================================================================
-- 022 — app_config: remote key/value config the app reads with the anon key.
--
-- Powers the maintenance/status banner: the app (web AND the static iOS build)
-- reads the 'banner' row on launch/foreground with the anon key and shows a
-- banner when enabled. This is the only channel to reach app users WITHOUT
-- shipping an App Store update. Writes are locked to the service role (the
-- admin actions endpoint) — never to the anon/authenticated client.
--
-- Re-run safe.
-- ============================================================================

create table if not exists public.app_config (
  key        text primary key,
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

-- Public READ (signed-out users must see the banner too). No write policy →
-- only the service role can mutate it.
drop policy if exists app_config_read on public.app_config;
create policy app_config_read on public.app_config
  for select to anon, authenticated using (true);

-- Seed the banner row (disabled by default).
insert into public.app_config (key, value)
values (
  'banner',
  jsonb_build_object('enabled', false, 'level', 'info', 'message', '')
)
on conflict (key) do nothing;
