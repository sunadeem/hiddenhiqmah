# Notification Schedule

Every notification Hiqmah delivers, when it fires, and whether the user can turn it off.
Generated from `lib/mobile/notifications.ts`, `lib/mobile/islamic-events.ts`, the
`/api/push/*` routes, and the pg_cron schedule in migrations 026 / 029 / 030.

Two systems are in play:

- **Local (on-device)** — scheduled by `scheduleAllNotifications()` from the cached
  location + user prefs. Works offline, fires at a fixed **local** time, and is
  capped by iOS at 64 pending (see the tier budget in `notifications.ts`).
- **Remote push (APNs)** — sent from the server, driven by pg_cron via
  `public.push_post()`. Fires at a fixed **UTC** time and reads its audience from
  `profiles` columns, not from this device's localStorage.

**Volume, on default settings:** 14 on a typical day; 15 on Wednesday (+ duʿā) or
Friday (+ Jumu'ah).

---

## A single day

Prayer times are illustrative (Toronto, late July) — they follow the user's
location and date. Everything else is at a fixed time.

| Time | Notification | Source | Setting |
|---|---|---|---|
| 5:27 am | Fajr — 15 min before | Local | `prePrayer` |
| 5:42 am | Fajr | Local | `prayerNotif` |
| 8:00 am | Today's Verse | Local | `todaysVerse` |
| 9:30 am | Jumu'ah *(Fridays)* | Local | `jumuah` |
| 10:00 am | **Weekly duʿā** *(Wednesdays)* | Remote | `duaPush` |
| 10:00 am | Islamic event *(event days)* | Local | `islamicEvents` |
| 10:00 am | White Days *(monthly)* | Local | `whiteDays` |
| 11:00 am | **Check-in nudge** *(Mon, inactive 3+ days)* | Remote | `reengagementPush` |
| 1:03 pm | Dhuhr — 15 min before | Local | `prePrayer` |
| 1:18 pm | Dhuhr | Local | `prayerNotif` |
| 1:30 pm | Today's Hadith | Local | `todaysHadith` |
| 4:57 pm | Asr — 15 min before | Local | `prePrayer` |
| 5:12 pm | Asr | Local | `prayerNotif` |
| 8:00 pm | Today's Reminder | Local | `todaysReminder` |
| 8:26 pm | Maghrib — 15 min before | Local | `prePrayer` |
| 8:30 pm | Laylat al-Qadr *(Ramadan odd nights)* | Local | `islamicEvents` |
| 8:41 pm | Maghrib | Local | `prayerNotif` |
| 9:15 pm | Streak nudge *(only if checklist unfinished)* | Local | `streak` |
| 9:50 pm | Isha — 15 min before | Local | `prePrayer` |
| 10:05 pm | Isha | Local | `prayerNotif` |

---

## Full inventory

| Notification | When | Source | Setting | Default |
|---|---|---|---|---|
| Prayer time × 5 | At each prayer | Local | `prayerNotif` | On |
| Adhan sound | Upgrades the above | Local | `adhanEnabled` + per-prayer | **Off** |
| Pre-prayer × 5 | 15 min before each | Local | `prePrayer` | On |
| Today's Verse | 8:00 am daily | Local | `todaysVerse` | On |
| Today's Hadith | 1:30 pm daily | Local | `todaysHadith` | On |
| Today's Reminder | 8:00 pm daily | Local | `todaysReminder` | On |
| Streak nudge | 9:15 pm, if incomplete | Local | `streak` | On |
| Jumu'ah | Fri 9:30 am | Local | `jumuah` | On |
| Islamic events | 10:00 am, event days | Local | `islamicEvents` | On |
| Laylat al-Qadr | 8:30 pm, odd nights | Local | `islamicEvents` | On |
| White Days | 10:00 am, monthly | Local | `whiteDays` | On |
| **Weekly duʿā** | Wed 14:00 UTC | Remote | `duaPush` → `profiles.dua_push` | On |
| **Check-in nudge** | Mon 15:00 UTC | Remote | `reengagementPush` → `profiles.reengagement_push` | On |
| Circle chat | On each message | Remote | `circleChat` → `profiles.circle_push` | **Off** (opt-in) |
| Announcement | Ad hoc (manual) | Remote | — | Always |

Local fire times are constants in `notifications.ts` (`VERSE_HOUR`, `HADITH_HOUR`,
`REMINDER_HOUR`, `STREAK_HOUR`, `JUMUAH_HOUR`) and `islamic-events.ts`
(`DAY_HOUR`, `NIGHT_HOUR`). They are deliberately **staggered** so no two kinds
land in the same minute — iOS stacks same-minute banners and they get dismissed
as one. Keep them distinct when adding a new kind.

---

## Design notes

### The remote push sends only what local can't

On-device notifications already deliver a verse, a hadith and a reflection every
day. The remote push used to rotate ayah → hadith → duʿā daily, so two days in
three it was a *second* verse or hadith hours after the first. It now sends
**only the duʿā, weekly on Wednesday** (migration 030) — the one piece of content
the local scheduler never covers. Six fewer pushes a week, nothing lost.

### Remote preferences live on the server

The send routes read `profiles` columns, not localStorage, because the server
decides the audience. So each toggle writes locally *and* mirrors to the server
via a `SECURITY DEFINER` RPC (`set_my_dua_push`, `set_my_reengagement_push`,
`set_my_circle_push`).

Two things this has to get right, both of which have bitten us:

- **`supabase.rpc()` does not throw.** postgrest-js resolves failures as
  `{ error }`, so a `try/catch` never fires. A failed write must be detected by
  checking `error`, or a user who opted out keeps receiving the push. Failed
  writes set a dirty flag that `push.ts` re-asserts on the next foreground /
  after sign-in.
- **Preferences are per-account, localStorage is per-device.** The Notifications
  screen hydrates the authoritative values from `profiles` on mount, so a
  reinstall or a second device doesn't render a switch that contradicts what the
  server actually has.

Recipient filtering uses a **negative, paged** query (`fetchOptedOut` in
`lib/push/optedOut.ts`): we fetch the opt-*outs* and subtract. A positive
`.in(user_id, optedIn)` filter would silently drop tokens whose owner has no
`profiles` row, and PostgREST's 1000-row cap would silently re-subscribe everyone
past the first page — both fail in the wrong direction.

### Local notification budget

iOS caps pending local notifications at 64. `notifications.ts` keeps
`MAX_NOTIFICATIONS = 63` and fills by tier so lower-priority nudges can never
crowd out the adhan:

| Tier | What | Cap |
|---|---|---|
| 1 | Adhan / prayer time | 35 |
| 2 | Pre-prayer | 14 |
| 3 | Engagement (verse, hadith, reminder, streak, Jumu'ah) | 6 |
| 4 | Islamic events + White Days | 8 |

The window is refilled on every app open, so the caps are a rolling budget rather
than a hard ceiling on how many a user ever receives.

---

## Known gap: the push is scheduled in UTC, not local time

Every local notification fires at a fixed **local** time. The remote push is a
pg_cron job at a fixed **UTC** hour (`'0 14 * * 3'`), so it arrives:

- 10am Eastern in summer, **9am once the clocks change**
- ~3pm in London, ~7:30pm in Karachi, ~10pm in Jakarta

Acceptable for friends-and-family testing in North America. Before a wide launch,
either move the cron to an hour that suits the main audience, or send per-user in
their own timezone. Until then the Settings copy deliberately says "every
Wednesday" with **no time of day** — don't reintroduce a "morning" claim without
also changing the schedule.

## Operational gotcha

Migration 030 renamed the content cron `push-daily` → `push-weekly-dua`.
**Re-running migration 026, or 029 §3, resurrects a daily `push-daily` job**
alongside the weekly one, and users would get both. 030 unschedules both names,
so re-running *030* is always the fix.
