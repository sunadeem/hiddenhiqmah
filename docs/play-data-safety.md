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
| Processing | **Ephemeral** |
| Required? | Optional |
| Purpose | App functionality |

Ask Hiqmah questions go to Anthropic to generate the answer. **We never store the
question text** — verified: `chat_usage` records only `user_id` / `anon_id` /
`ip_hash` / token counts (`src/app/api/search/route.ts:982`). So it is genuinely
collected-and-shared but *ephemeral*, which is a different answer from "stored"
and worth getting right.

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
- **Data collected in-app vs from other sources** → in-app only.

## Privacy-policy cross-check

The shipped policy (`src/app/privacy/page.tsx`) discloses Supabase, Anthropic,
aladhan.com **and** OpenStreetMap, so it matches the third parties above. No
mismatch found.

⚠️ **The policy ships inside the iOS bundle**, so any wording change there needs a
re-archive — worth remembering before editing it to satisfy a Play question.

## Resolved

**Is an account required on Android?** → **No** (founder, 2026-08-18). The app is
usable without signing up, so Email address, User IDs, and every account-bound
category above are marked **optional**. The earlier project note claiming mobile
required a mandatory account was out of date.

**Religious beliefs** → declared, by choice rather than requirement. See above.
