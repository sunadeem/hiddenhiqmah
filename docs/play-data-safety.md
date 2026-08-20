# Google Play — Data safety answers

Derived from the code on 2026-08-18, not from memory. Every line below has a
reason you can check. Play cross-references these answers against the privacy
policy, so both must agree.

**Two rules that decide almost every answer:**

1. **Collected = transmitted off the device.** Anything that only ever lives in
   `localStorage`, Capacitor Preferences, or React state is *not* collected, no
   matter how personal it is.
2. **Shared = transferred to a separate company.** Our own Supabase and Vercel
   are processors acting on our instruction, *not* third-party sharing. Nominatim,
   aladhan.com and Anthropic are.

Over-declaring is a real error, not a safe hedge — it tells users we do things we
don't. Each "no" below is as deliberate as each "yes".

---

## Declare these

### Location → Precise location
| | |
|---|---|
| Collected | **Yes** |
| Shared | **Yes** — `nominatim.openstreetmap.org` and `api.aladhan.com` |
| Processing | **Ephemeral** — never stored on our servers |
| Required? | **Optional** — the app works without it (falls back to a default city) |
| Purpose | App functionality |

The app asks for coarse location (`enableHighAccuracy: false`,
`LearnLadder`-independent, see `packages/ui/lib/location.ts`), but the
coordinates it receives are sent verbatim to two third parties: OpenStreetMap's
Nominatim for reverse geocoding (`location.ts:68`) and aladhan.com for
city/coordinate prayer lookups (`src/app/prayer-times/page.tsx:442`). Because
raw lat/lng leaves the device, **declare Precise, not Approximate** — Play keys
this on what is transmitted, not on what you asked the OS for.

We store the device's IANA **timezone name** (`device_tokens.timezone`), which is
what lets the weekly duʿā arrive at 10am local. We do **not** store coordinates.

### Personal info → Email address
Collected · not shared · **stored** · **optional** · Account management.
Supabase magic-link auth; the email lands in `auth.users`.

**Optional, confirmed by the founder 2026-08-18: signup is not required.** The
app is fully browsable without an account, so every account-bound answer below is
optional too. This matters beyond accuracy — Play surfaces "you can use this app
without giving data" to users, and it is true here.

### Personal info → Name
Collected · not shared · stored · optional · App functionality.
`profiles.display_name`. For magic-link signups this defaults to the email local
part, which is why the UI cleans it before display.

### Personal info → User IDs
Collected · not shared · stored · **optional** · App functionality + Account
management. The Supabase `user_id` UUID on every row — exists only once a user
signs in, which is optional.

### Messages → Other in-app messages
Collected · not shared · stored · **optional** · App functionality.
`circle_messages` — group chat, only if the user joins a Circle.

### App activity → In-app search history
| | |
|---|---|
| Collected | **Yes** |
| Shared | **Yes** — Anthropic |
| Processing | **Stored** ⚠️ *(was Ephemeral — changed by migration 032)* |
| Required? | Optional |
| Purpose | App functionality · **Fraud prevention, security, and compliance** |

Ask Hiqmah questions go to Anthropic to generate the answer. On the normal path
nothing is retained: `chat_usage` still records only `user_id` / `anon_id` /
`ip_hash` / token counts (`src/app/api/search/route.ts:982`), and an unreported
turn touches no storage anywhere.

**But this can no longer be answered "Ephemeral."** Google Play's AI-Generated
Content policy requires an in-app way to report offensive AI output, and a report
is useless to a moderator without the text being reported. So when — and only
when — a user taps Report on an answer and confirms, `ask_reports` (migration
032) stores that **one answer plus the one question that produced it**, with the
user's reason and optional note, for up to 90 days. Re-reporting the same answer
does not create a second row — the new reason/note are folded into the existing
one, so the stored volume per user per answer is bounded.

Play's test for Ephemeral is that data is *"only stored in memory and retained for
no longer than necessary to service the specific request in real-time."* The form
takes one processing answer **per data type, not per code path**, so a single
retained copy makes "Ephemeral" false for the whole type. Answer **Stored**.

Two things this does *not* change:

- **No new sharing disclosure.** Supabase is a processor acting on our
  instruction, not a third party, and Anthropic already receives the question on
  the normal path. Reported content is never sent to Anthropic for analysis.
- **The user-initiated exemption never applied.** Play's "data the user
  deliberately submits" carve-out sits under *sharing*, not collection.

The added **Fraud prevention, security, and compliance** purpose is the honest
one for a safety-reporting queue; App functionality stays because the report is
also how we fix bad answers.

### App activity → Other user-generated content
Collected · not shared · stored · optional · App functionality.
`journal_entries.body` (free text), `custom_dhikr`, `reminders`,
`reminder_saves` (bookmarks).

### App activity → App interactions
Collected · not shared · stored · optional · App functionality +
Personalisation. `checklist_day`, `dhikr_daily`, `dhikr_lifetime`,
`user_streaks`, `hifz_cards` / `hifz_plan` / `hifz_reviews`, `sign_in_bonuses`,
`circle_member_progress`.

### Device or other IDs
Collected · not shared · stored · optional · App functionality.
`device_tokens.token` — the APNs/FCM push token, only once notifications are
granted. Also `chat_usage.ip_hash`, a hashed IP used solely for rate limiting.
Apple and Google are push *processors* here, not recipients of shared data.

`ask_reports.ip_hash` (migration 032) is the **same already-declared hashed IP,
derived the same way**, used for the same purpose — rate limiting. It adds no new
data type and no new answer. `ask_reports.anon_id` is likewise the `chat_usage`
anon id already covered here.

The cap is two ceilings, not one, and the split matters for a *reporting*
channel: **20/day per reporter** (the real limit) and **200/day per IP** (a
backstop, because the anon id is regenerable client-side). A single low per-IP
cap would have let twenty strangers behind one carrier-grade-NAT or café
gateway exhaust the Play-mandated reporting channel for everyone else sharing
that address. Both are enforced in a before-insert trigger under an advisory
lock, so they cannot be raced.

---

## The one real judgment call: religious beliefs

**Play category: Personal info → Political or religious beliefs.**

Being an Islamic app is not by itself collection. But what we store per user is a
record of religious *observance*: which of the five prayers were completed each
day (`checklist_day`, `checklist_day_items`), dhikr counts, Qur'an memorisation
progress, and streaks — all keyed to a `user_id` on our server.

**DECISION (founder, 2026-08-18): DECLARE IT.** Collected · not shared · stored ·
**optional** · App functionality + Personalisation.

⚠️ Recorded honestly, because the founder asked whether Play *requires* this:
**it does not.** There is no Play rule that religious apps must tick this box. The
rule is "declare what you collect that falls in the category", and whether a
prayer-completion log falls in it is interpretation. We are declaring by choice,
on the reasoning below — not to satisfy a stated requirement.

Reasoning, so you can overrule me knowingly:

- Play has **no exemption for data that is obvious from the app's category**. The
  test is whether it is collected, not whether users could have guessed.
- A per-user daily log of prayer completion is close to the plainest possible
  example of data revealing religious belief.
- The asymmetry decides it. Declaring costs you one extra line on the listing
  saying we store your prayer and dhikr records — which is simply true. *Not*
  declaring, if Google reads it the other way, is an inaccurate Data safety
  declaration, which is an enforcement matter that can pull a live app.

The counter-argument is real — this data exists only to render the user's own
checklist back to them, and the app never infers or targets on it. If you'd
rather not declare, that is a defensible reading, but it is a bet on Google's
interpretation with the app as the stake.

---

## Do NOT declare these — and why

| Category | Why not |
|---|---|
| **Audio → Voice or sound recordings** | The Hifz recording never leaves the device. `VoiceRecorder.stopRecording()` returns base64 that becomes an in-memory `data:` URL for immediate playback and is discarded on unmount (`LearnLadder.tsx:311`). No upload, not even written to disk. |
| **App info and performance → Crash logs / Diagnostics** | There is no analytics or crash SDK at all. Verified in `package.json` (no Sentry/Crashlytics/Amplitude/PostHog/Segment) and in both Gradle files (no `firebase-analytics`, no Crashlytics). |
| Photos and videos · Files and docs · Calendar · Contacts | Never accessed; no permissions declared. |
| Financial info | Launching free; no payment SDK. |
| Health and fitness | None. |
| Web browsing history | None. |
| Installed apps | None. |
| Address · Phone number · Race and ethnicity · Sexual orientation | Never collected. |
| Emails / SMS *(reading the user's)* | Never accessed. Our "Email address" answer is the account email, a different thing. |
| **Approximate location** | Superseded by Precise — declaring both would misdescribe one request as two. |

---

## The form's global questions

- **Is all collected data encrypted in transit?** → **Yes.** Every endpoint is
  HTTPS: Supabase, our Vercel API routes, Nominatim, aladhan.com, FCM, APNs.
- **Do you provide a way for users to request data deletion?** → **Yes**, both
  in-app and by policy. `delete_my_account` RPC
  (`src/context/AuthContext.tsx:162`), surfaced at **Settings → Account → Delete
  account**, and documented in the privacy policy's "Data deletion" section.
  **Ask reports:** a signed-in user's reports carry `user_id` with
  `on delete cascade`, so they are purged by the same deletion. A signed-out
  report has no `auth.users` row to cascade from — for those, the **90-day
  `ask-reports-purge` pg_cron sweep is the only deletion path**, which is exactly
  what the in-app disclosure and the policy promise. ⚠️ If pg_cron is not
  installed on the project, migration 032 only raises a notice and the sweep
  never runs — a stated retention period you don't enforce is worse than none, so
  verify with
  `select jobname, active from cron.job where jobname = 'ask-reports-purge';`
  ⚠️ Equally, **until 032 is applied there is no `ask_reports` table at all**, and
  the route deliberately fails forward: it logs the full report payload at error
  level so the report is not simply lost. That means reported content can sit in
  Vercel runtime logs instead of the table. It is bounded by Vercel's own log
  retention rather than by the 90-day sweep, which is why the in-app disclosure
  says "up to 90 days" rather than naming an exact period. **Apply 032 before
  the build ships and this branch never executes.**
- **Data collected in-app vs from other sources** → in-app only.

## Privacy-policy cross-check

The shipped policy (`src/app/privacy/page.tsx`) discloses Supabase, Anthropic,
aladhan.com **and** OpenStreetMap, so it matches the third parties above. No
third-party mismatch.

🚨 **BLOCKER — three shipped sentences became false with migration 032, and Play
cross-references Data safety against the policy, so a mismatch is an enforcement
risk, not a cosmetic one. The policy edit MUST ride in the same build as the
report button.**

| # | Line | Where |
|---|---|---|
| 1 | *"We do not persistently log your queries or answers."* | `privacy/page.tsx:149` |
| 2 | *"We never store the content of your questions on our servers."* | `privacy/page.tsx:169` |
| 3 | *"If you never sign in, nothing you do in the app is stored on our servers at all."* | broken specifically because reporting works signed out |

Recommended edits (drafted, **not applied** — see the note below):

- Bump the effective date (currently June 18, 2026).
- Append to (1): **"The one exception is if you tap Report on an answer — see 'Reporting an AI answer' below."**
- Append to (2): **"unless you choose to report an answer, which is the only case where a question and answer are saved"**
- Append to (3): **"with one exception: if you choose to report an AI answer, that report is stored so we can review it"**
- Add **"and any AI answers you reported"** to the Data-deletion enumeration.
- Insert a new **"Reporting an AI answer"** section immediately after "Sent to
  third parties", stating: the three things sent (the answer, the one question
  that produced it, your reason and note); why the question is needed (a
  moderator cannot tell a baited prompt from a spontaneous model failure without
  it); that nothing is sent until you confirm and the screen shows what it will
  send; the signed-in vs signed-out storage difference; and that reports are used
  only to review Ask — never for advertising or profiling, never shared outside
  Hidden Hiqmah, and deleted within 90 days.

⚠️ **The policy ships inside the iOS bundle**, so any wording change there needs a
re-archive — worth remembering before editing it to satisfy a Play question.

## Apple

⚠️ There is no Apple App Privacy answer sheet in this repo — only this file.
Since build 18 is the first App Store submission, the Apple answers are being
composed in App Store Connect with nothing to check them against. **Recommend
creating `docs/apple-app-privacy.md` before submitting.**

The honest Apple answer for reports is legitimately *narrower* than Play's:
declare **User Content → Customer Support**, linked to identity, purpose App
Functionality, not used for tracking — rather than implying we log all search
history. Do **not** rely on Apple's optional-disclosure carve-out: its fourth
criterion (the account name displayed in the submission form) is unsatisfiable
for signed-out reporters, who have no account name to show.

## Resolved

**Is an account required on Android?** → **No** (founder, 2026-08-18). The app is
usable without signing up, so Email address, User IDs, and every account-bound
category above are marked **optional**. The earlier project note claiming mobile
required a mandatory account was out of date.

**Religious beliefs** → declared, by choice rather than requirement. See above.
