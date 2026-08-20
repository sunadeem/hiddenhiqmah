-- ============================================================================
-- Hidden Hiqmah — Ask answer reports (032)
--
-- Google Play's AI-Generated Content policy requires an in-app way to report
-- offensive AI output. A report is useless to a moderator without the text it
-- reports, so this is the FIRST and ONLY place the app persists Ask content.
-- Everything else about Ask stays as declared: chat_usage still records only
-- identity keys + token counts, and an unreported turn still touches no
-- storage anywhere. docs/play-data-safety.md and the privacy policy must be
-- amended in the same release.
--
-- Write path is the API route holding the service role, NOT a definer RPC:
-- Ask works signed out, ip_hash cannot be derived inside Postgres (the pooler
-- makes inet_client_addr() infrastructure addresses), and the anon key ships
-- in a public repo. Mirrors chat_usage (001), not report_circle_message (020).
--
-- Additive + re-run safe.
-- ============================================================================

create table if not exists public.ask_reports (
    id              uuid        primary key default gen_random_uuid(),

    -- Identity: one or the other, never both. Same shape as chat_usage.
    user_id         uuid        references auth.users (id) on delete cascade,
    anon_id         text,
    ip_hash         text,

    -- The reported turn. answer_text is the thing being reported;
    -- question_text is the ONE immediately-preceding user turn, without which
    -- a moderator cannot tell a baited prompt from a spontaneous model failure.
    -- The rest of the conversation is deliberately NOT stored.
    answer_text     text        not null,
    question_text   text,
    -- sha256(answer_text), computed by the route. Exists only so the same
    -- identity reporting the same answer twice collapses to one row.
    turn_hash       text        not null,
    -- True when reported mid-stream: answer_text is truncated and will not
    -- match what the user finally saw.
    partial         boolean     not null default false,

    reason          text,
    note            text,

    -- Triage context, not user data.
    surface         text,
    platform        text,
    app_version     text,
    model_id        text,

    -- Mirrors 023's triage state so this queue can be worked, not just pile up.
    status          text        not null default 'open',
    resolved_at     timestamptz,
    resolution_note text,

    created_at      timestamptz not null default now(),

    constraint ask_reports_identity_present
        check (user_id is not null or anon_id is not null),
    constraint ask_reports_status_valid
        check (status in ('open', 'resolved', 'dismissed')),
    -- Defence in depth. The route caps these too, but the route is not the
    -- only holder of the service role.
    constraint ask_reports_answer_len   check (char_length(answer_text)   <= 8000),
    constraint ask_reports_question_len check (question_text is null or char_length(question_text) <= 2000),
    constraint ask_reports_note_len     check (note is null or char_length(note) <= 500),
    constraint ask_reports_reason_len   check (reason is null or char_length(reason) <= 40),
    constraint ask_reports_anon_len     check (anon_id is null or char_length(anon_id) <= 64)
);

comment on column public.ask_reports.anon_id is
    'Client-generated device UUID for signed-out reporters; null when user_id is set. Untrusted, length-capped by the route.';
comment on column public.ask_reports.ip_hash is
    'sha256(IP) — rate limiting and abuse signal only. Never returned to clients. Same derivation as chat_usage.';
comment on column public.ask_reports.answer_text is
    'ATTACKER-CONTROLLED. The client supplies this string; nothing proves the model produced it. Render as plain text in admin, never as HTML or markdown, and never treat a report as evidence of model output.';
comment on column public.ask_reports.question_text is
    'Exactly one user turn — the one that produced the reported answer. Never the conversation.';

-- Triage queue: newest first, and a partial index for the open-only view.
create index if not exists ask_reports_created_idx
    on public.ask_reports (created_at desc);
create index if not exists ask_reports_open_idx
    on public.ask_reports (created_at desc) where status = 'open';
-- Backing indexes for the 24h rate-limit counts in the trigger below.
create index if not exists ask_reports_ip_recent_idx
    on public.ask_reports (ip_hash, created_at desc);
create index if not exists ask_reports_user_recent_idx
    on public.ask_reports (user_id, created_at desc) where user_id is not null;
create index if not exists ask_reports_anon_recent_idx
    on public.ask_reports (anon_id, created_at desc) where anon_id is not null;

-- One ROW per identity per distinct answer. NULLs are distinct in a unique
-- index, so this needs two partial indexes rather than one composite; a
-- signed-in row and a signed-out row are separate identities.
--
-- The route does NOT treat the resulting 23505 as "drop the second report" —
-- it folds the new reason/note into the existing row and reopens it. There is
-- deliberately no `status` predicate here: a user re-reporting an answer a
-- moderator already dismissed is escalating, and a second row would just split
-- the history of one complaint across two entries.
create unique index if not exists ask_reports_dedupe_user_idx
    on public.ask_reports (user_id, turn_hash) where user_id is not null;
create unique index if not exists ask_reports_dedupe_anon_idx
    on public.ask_reports (anon_id, turn_hash) where user_id is null and anon_id is not null;

-- ── Rate limiting, enforced HERE and not in the API route ──────────────────
--
-- The route cannot do this safely. `select count()` then `insert` is two
-- round-trips with no lock, so N concurrent posts all read the same pre-insert
-- count and all commit — measured at 200 rows against a cap of 20 — and any
-- transient failure of the count query silently disabled the cap altogether.
-- Inside a before-insert trigger the count runs in the insert's own
-- transaction behind an advisory lock, so it cannot be raced, and it binds
-- every holder of the service role rather than one code path.
--
-- TWO ceilings, because they defend different things:
--   * per identity (20/day) — the real "one person is spamming" limit.
--   * per IP (200/day) — a backstop, because anon_id is regenerable in one
--     line of JS. Deliberately NOT 20: carrier-grade NAT, campus, office and
--     café Wi-Fi put thousands of unrelated people behind a single egress
--     address, and a low per-IP cap would silently disable a Play-mandated
--     reporting channel for all of them for a day.
--
-- HQ429 is a custom SQLSTATE the route matches on, so a cap can never be
-- mistaken for a genuine insert failure. The route logs the full payload when
-- it sees one, so a capped report is still recoverable.
create or replace function public.ask_reports_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
    n integer;
begin
    -- Serialises concurrent inserts sharing this identity for the remainder of
    -- the transaction. Without it the counts below are advice, not limits.
    perform pg_advisory_xact_lock(
        hashtext('ask_report:' || coalesce(new.user_id::text, new.anon_id, '')));

    select count(*) into n
      from public.ask_reports
     where created_at > now() - interval '24 hours'
       and ((new.user_id is not null and user_id = new.user_id)
         or (new.user_id is null and new.anon_id is not null and anon_id = new.anon_id));
    if n >= 20 then
        raise exception 'ask_reports: identity cap reached' using errcode = 'HQ429';
    end if;

    if new.ip_hash is not null then
        perform pg_advisory_xact_lock(hashtext('ask_report_ip:' || new.ip_hash));
        select count(*) into n
          from public.ask_reports
         where ip_hash = new.ip_hash
           and created_at > now() - interval '24 hours';
        if n >= 200 then
            raise exception 'ask_reports: ip cap reached' using errcode = 'HQ429';
        end if;
    end if;

    return new;
end $$;

revoke all on function public.ask_reports_rate_limit() from public, anon, authenticated;

drop trigger if exists ask_reports_rate_limit_trg on public.ask_reports;
create trigger ask_reports_rate_limit_trg
    before insert on public.ask_reports
    for each row execute function public.ask_reports_rate_limit();

-- ── RLS: deny-all for clients. The service role bypasses RLS and is the only
--    writer; there is no member-facing select policy, same as 020's reports. ──
alter table public.ask_reports enable row level security;

drop policy if exists ask_reports_no_anon_insert   on public.ask_reports;
drop policy if exists ask_reports_no_authed_insert on public.ask_reports;

create policy ask_reports_no_anon_insert
    on public.ask_reports for insert to anon with check (false);
create policy ask_reports_no_authed_insert
    on public.ask_reports for insert to authenticated with check (false);

-- The repo is public and the anon key ships in the bundle. RLS already denies
-- this, but revoking the grants costs nothing.
revoke all on table public.ask_reports from anon, authenticated;

-- ── 90-day retention. The privacy policy states this figure, so it has to be
--    enforced, not aspirational. pg_cron is already installed by 026.
--    Signed-in reports also cascade away with delete_my_account(); signed-out
--    ones have no auth.users row to cascade from, so this sweep is their only
--    deletion path — which is exactly what the policy wording promises. ──
create or replace function public.purge_old_ask_reports()
returns void language sql security definer set search_path = public as $$
    delete from public.ask_reports where created_at < now() - interval '90 days';
$$;
revoke all on function public.purge_old_ask_reports() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('ask-reports-purge')
      where exists (select 1 from cron.job where jobname = 'ask-reports-purge');
    perform cron.schedule('ask-reports-purge', '17 4 * * *',
                          $j$select public.purge_old_ask_reports();$j$);
  else
    raise notice 'pg_cron not installed — run purge_old_ask_reports() manually or the 90-day retention promise in the privacy policy is not being kept.';
  end if;
end $$;

-- Verify:
--   select count(*) from public.ask_reports;
--   select jobname, schedule, active from cron.job where jobname = 'ask-reports-purge';
