-- ============================================================================
-- DEV UTILITY (not a migration) — reset a test account's data.
-- Supabase Dashboard → SQL Editor → paste → set the email → Run.
--
-- Default below WIPES all app data for the user but KEEPS the account, so you
-- can stay signed in with the same email/password. To fully delete the account
-- instead (to re-test the whole sign-up flow), use the one-liner at the bottom.
--
-- ⚠️ This does NOT re-show the welcome walkthrough on its own — that is gated by
--    the device-local `hiqmah-onboarded` localStorage flag, not the database.
--    After running this, clear that flag on the simulator (see the chat notes).
-- ============================================================================
do $$
declare
  v_email text := 'subhan.s.nadeem@gmail.com';   -- <<< set your test email
  v_uid   uuid;
begin
  select id into v_uid from auth.users where lower(email) = lower(v_email);
  if v_uid is null then
    raise notice 'No user found for %', v_email;
    return;
  end if;

  -- AI chat usage / quota
  delete from public.chat_usage            where user_id = v_uid;
  delete from public.sign_in_bonuses       where user_id = v_uid;

  -- Daily checklist + dhikr + streaks
  delete from public.checklist_user_items  where user_id = v_uid;
  delete from public.checklist_day_items   where user_id = v_uid;
  delete from public.checklist_day         where user_id = v_uid;
  delete from public.dhikr_daily           where user_id = v_uid;
  delete from public.dhikr_lifetime        where user_id = v_uid;
  delete from public.user_streaks          where user_id = v_uid;
  delete from public.streak_pauses         where user_id = v_uid;

  -- Reminders
  delete from public.reminder_saves        where user_id = v_uid;

  -- Hifz
  delete from public.hifz_reviews          where user_id = v_uid;
  delete from public.hifz_cards            where user_id = v_uid;

  -- Circles (remove this user's rows in others' circles, then any owned circles
  -- — owned-circle deletes cascade to that circle's members/progress/etc.)
  delete from public.circle_reactions       where from_user = v_uid or to_user = v_uid;
  delete from public.circle_member_progress where user_id = v_uid;
  delete from public.circle_members         where user_id = v_uid;
  delete from public.circle_invites         where created_by = v_uid;
  delete from public.circles                where owner_id = v_uid;

  -- Profile (name/metadata row)
  delete from public.profiles              where id = v_uid;

  raise notice 'Wiped app data for % (uid %). Account kept.', v_email, v_uid;
end $$;

-- ── Alternative: fully delete the account (re-sign-up from scratch) ──────────
-- Every app table references auth.users(id) ON DELETE CASCADE, so this one line
-- removes the account AND all of the above in a single shot:
--
--   delete from auth.users where lower(email) = lower('subhan.s.nadeem@gmail.com');
