-- ============================================================================
-- 023 — Moderation review workflow (report triage + audit history)
--
-- Turns the write-only report/strike data into a reviewable case file:
--   • circle_message_reports gets a status (open/resolved/dismissed) so reports
--     can be triaged instead of piling up unread.
--   • user_moderation gets a free-text admin_note.
--   • moderation_events: an append-only audit trail (strikes, suspensions,
--     admin actions) so clearing a suspension no longer erases the incident.
--
-- Additive + re-run safe. Depends on 020 (reports/blocks), 021 (user_moderation).
-- ============================================================================

-- 1. Report triage status.
alter table public.circle_message_reports
  add column if not exists status          text not null default 'open',
  add column if not exists resolved_at      timestamptz,
  add column if not exists resolution_note  text;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'circle_message_reports_status_chk'
  ) then
    alter table public.circle_message_reports
      add constraint circle_message_reports_status_chk
      check (status in ('open', 'resolved', 'dismissed'));
  end if;
end $$;

create index if not exists circle_message_reports_open_idx
  on public.circle_message_reports (created_at desc) where status = 'open';

-- 2. Per-user admin note.
alter table public.user_moderation
  add column if not exists admin_note text;

-- 3. Append-only moderation audit trail (service-role only; no RLS policies).
create table if not exists public.moderation_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in (
               'strike', 'auto_suspend', 'manual_suspend', 'unsuspend',
               'strikes_reset', 'report_resolved', 'report_dismissed',
               'message_deleted', 'message_restored', 'note_updated')),
  meta       jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists moderation_events_user_idx
  on public.moderation_events (user_id, created_at desc);
alter table public.moderation_events enable row level security;
-- No policies → only the service role (admin routes) reads/writes it.

-- 4. Auto-log strike / auto-suspend from user_moderation changes, so the 021
--    send_circle_message RPC doesn't need re-touching. Admin-initiated events
--    (unsuspend, manual suspend, resets, notes) are logged by the actions route.
create or replace function public._log_user_moderation_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.strike_count > coalesce(old.strike_count, 0)) then
    insert into public.moderation_events (user_id, kind, meta)
    values (new.user_id, 'strike',
            jsonb_build_object('strike_count', new.strike_count, 'reason', new.last_reason));
  end if;
  -- Only the genuine profanity 3rd-strike path is "auto". Distinguish by
  -- last_reason (the 021 RPC leaves it 'profanity'; a manual admin suspend sets
  -- 'manual: …'), so an admin suspending a user who already has ≥3 strikes isn't
  -- mislabeled/double-logged — the actions route logs manual_suspend itself.
  if (new.suspended and not coalesce(old.suspended, false)
      and new.strike_count >= 3 and coalesce(new.last_reason, '') = 'profanity') then
    insert into public.moderation_events (user_id, kind, meta)
    values (new.user_id, 'auto_suspend',
            jsonb_build_object('strike_count', new.strike_count));
  end if;
  return new;
end $$;

-- INSERT too: a first-time offender's first strike creates the row via the
-- on-conflict INSERT path, which would otherwise skip an UPDATE-only trigger.
drop trigger if exists trg_user_moderation_audit on public.user_moderation;
create trigger trg_user_moderation_audit
  after insert or update on public.user_moderation
  for each row execute function public._log_user_moderation_change();
