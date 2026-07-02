# Daily Tab + Streak System — v1 Build Spec (hardened)

Status: **for sign-off (no code yet)** · Direction: **Native restyle** · Backend: **Supabase**
Hardened against adversarial review (run wjcvhtoas). Date context: 2026-06-16.

---

## 1. Scope

Native rebuild of the Daily tab + supporting streak/calendar/reflection systems, in-app Home cards, a streak notification, and (decision pending, §8) OS home-screen widgets. Streak/calendar/checklist/reflection components built reusable for the website.

**Daily tab = 4 segments** (segmented control), default **Checklist**:
1. **Checklist** (default) — flat, chronological, customizable; streak + history calendar
2. **Worship** — time-of-day chips (auto-select now) → dhikr cards with daily+lifetime counters
3. **Sunnah** — category chips → du'ā / practice cards
4. **Reminders** — immersive swipeable Reflections feed (≥200 verified)

Design language from the existing **Home** screen: `rounded-2xl` cards, gradient washes, uppercase eyebrow labels, big numbers, icon tiles, hairline dividers. No web hero, no pill-tab rows.

---

## 2. Streak model (locked + hardened)

- **Day key = device-local `YYYY-MM-DD` from date components** (`getFullYear/Month/Date`). **Never `toISOString` (UTC) and never `now − 86400000` arithmetic** — the current code's `getToday()` (page.tsx:721) is UTC and must not be ported; use `storage.ts:todayKey` (local) and `dayBefore` for "yesterday". DST-safe because we key off Y-M-D, not elapsed ms. *(B4)*
- **Overall daily streak:** any day with **≥1 item done** continues it; a **fully empty past day breaks** it. Partial days count.
- **Prayer streak (separate):** a day where **all 5 obligatory prayers** are done. Shown beside the daily streak; **daily is primary**.
- **Streak break rule (critical):** *a day breaks the streak iff its date is **strictly before today** and its status is `none`/no-row. **Today never breaks** the streak — it can only extend it.* (Prevents zeroing at 12:01am while today is merely in progress.) *(B2)*
- Day key is **immutable once a `checklist_day` row exists**; past days are never re-graded. TZ-travel / backward-clock that skips a date counts as an honest break — we do **not** "repair" gaps. *(B4)*
- **No freeze/grace.** History **starts at launch** (no backfill). Edits apply **going forward only**.
- **Calendar grading:** ✓ full (100% of that day's *frozen* items) · slash partial (≥1, <100%) · sad none/started-not-done · **before-launch = distinct "before you started" state, not sad** · **future = darkened, disabled, unclickable**. *(S6)*

---

## 3. Data model (Supabase)

New migration `apps/web/src/lib/supabase-migrations/002_daily_checklist_streaks.sql` (same conventions + `SECURITY DEFINER` RPC pattern as `001_chat_usage.sql`).

### 3.1 `checklist_default_items` (reference, public read)
id uuid pk · key text unique (`fajr`, `morning_adhkar`, `istighfar_100`…) · label · kind (`prayer`|`dhikr`|`task`) · goal_count int null · dhikr_key text null · sort_order int. Seed = §7.

### 3.2 `checklist_user_items` (per-user, editable)
On first load, **seeded from defaults**. id · user_id → auth.users · source_key text null · label · kind · goal_count int null · dhikr_key text null · sort_order int (drag-reorder) · is_active bool default true (**soft-delete only**).

### 3.3 `checklist_day_items` (per-day history — source of truth, **fully materialized**)
On the **first interaction of a `local_date`**, snapshot **every currently-active** user item into this table (`done=false, count_done=0`) so the day is self-describing (shows skipped items + fixes the denominator). *(S2/B1)*
- user_id · local_date date · user_item_id uuid null · **label_snapshot** · kind · goal_count int null · **sort_order_snapshot int** *(S1)* · count_done int default 0 · done bool · is_prayer bool · pk (user_id, local_date, user_item_id).
- **`count_done` is used ONLY for count items WITHOUT a `dhikr_key`** (e.g. "Read Qur'ān — 1 page"). For `kind='dhikr'` keyed items, the count is **derived from `dhikr_daily`** at read time — never stored here (avoids a second source of truth). *(B3)*
- Mid-day **add** → applies **next day** (do not mutate today's denominator). Mid-day **remove** → `is_active=false` on the user item only; the snapshot row + denominator stay. *(B1)*

### 3.4 `checklist_day` (per-day rollup — cache for calendar/streak/widgets)
pk (user_id, local_date) · **total_items int (frozen at materialization, never a live count)** · done_items int · prayers_done int (0–5) · status text. *(B1)*
- DB check constraint `done_items <= total_items`.
- Status: `none if total_items=0 OR done_items=0; full if done_items>=total_items; else partial` (0/0-guarded). *(B1)*

### 3.5 `dhikr_daily` + `dhikr_lifetime` (shared by Worship & checklist)
- `dhikr_daily`: pk (user_id, dhikr_key, local_date) → count. Daily, resets by date.
- `dhikr_lifetime`: pk (user_id, dhikr_key) → count. **Authority = Σ daily.** *(B3)*
- Increment = **one atomic `SECURITY DEFINER` RPC keyed by (user, dhikr_key, local_date)** that bumps daily + lifetime in a single transaction; **both Worship and Checklist call the same RPC and re-read the same row** — no surface owns a private counter (prevents +2/tap). Trigger on `dhikr_daily` maintains lifetime in-transaction; reconcile-on-open `lifetime = sum(dhikr_daily)`. *(B3)*

### 3.6 `user_streaks` (**derived cache, not authority** — `checklist_day` is authority)
pk user_id · overall_current/best · prayer_current/best · last_overall_date/last_prayer_date.
- **Recompute = real backward walk** over consecutive `local_date`s ending at today: overall continues while `status != 'none'`; prayer continues while `prayers_done = 5`. Today in-progress doesn't break (see §2). Recompute on open + on completion. Calendar **always recomputes from `checklist_day`**, never trusts the cache. Written only via `SECURITY DEFINER` RPC. *(B2)*

### 3.7 `reminders` (content, public read) + `reminder_saves` (per-user)
- `reminders`: id · theme · tone (`hope`|`accountability`) · text_en · arabic null · translit null · source_kind (`quran`|`hadith`) · source_ref · verified bool. (≥200, §10.)
- `reminder_saves`: (user_id, reminder_id).

### 3.8 RLS (enumerated — follow 001 conventions) *(B5)*
- **User-owned editable** — real self-scoped CRUD `using/with check (user_id = auth.uid())`: `checklist_user_items`, `checklist_day_items`, `reminder_saves`.
- **Server-mutated caches/aggregates** — select-own; `with check (false)` for clients; all writes via `SECURITY DEFINER` RPCs that re-derive values (clients cannot forge streaks/counts): `checklist_day`, `dhikr_daily`, `dhikr_lifetime`, `user_streaks`.
- **Content** — public read, no client writes: `checklist_default_items`, `reminders`.

---

## 4. Shared components (`packages/ui` — web-reusable)

### 4.1 `DailyAdapter` port *(B7)*
One async port in `packages/ui/lib/daily/types.ts` with **no Capacitor/Supabase imports**:
`getUserItems / addItem / editItem / removeItem / reorderItems` · `getDay / setDone / setCount` · `incrementDhikr / getDhikr` · `getDayRollups / getStreaks` · `ensureSeeded`.
- **`localDate` is computed by the host and passed into every call** — the adapter never derives the date (B4).
- `getDayRollups` returns **frozen `checklist_day.status`**, never recomputed from current items.
- Two adapters: `createSupabaseDailyAdapter(client, userId)` in `apps/web` (client injected — never `import {supabase}` inside `packages/ui`); `createLocalDailyAdapter()` in `packages/ui` for signed-out / website.
- Native concerns (`onHaptic?`, `onShareImage?`, `onScheduleNudge?`) are **optional callbacks**, not part of the adapter.

### 4.2 Components
- `useChecklist(adapter)`, `<Checklist>` — rows; **drag-reorder via framer-motion `Reorder.Group axis="y"`** (already on v12.40.0; no dnd-kit) with `dragListener={false}` + a **visible drag handle** (`useDragControls`, `touch-action:none` on handle), persist on `onDragEnd` only. **Drop "hard/long-press"** (triggers iOS text callout); handle shows in Edit mode. *(S3)*
- Count rows: tap counter → +1, auto-check at goal, manual check allowed, uncheck resets count.
- `<StreakBadges>` (daily primary + prayer), `<StreakWeekStrip>` (Mon–Sun, tap → calendar).
- `<StreakCalendar>` — month grid (✓/slash/sad/before-launch/future-disabled), prev/next (next capped at current month), today default-selected, day → detail (frozen items, ordered by `sort_order_snapshot`) in lower half. Data via hook.
- `<DhikrCounter>` — tap +1; **daily primary + lifetime smaller**.
- `<ReflectionsFeed>` / `<ReflectionCard>` — vertical deck via **CSS `scroll-snap-type:y mandatory` + `overscroll-contain`** (more robust in WKWebView than a JS pager), full-bleed outside `<main>` padding; theme filter; reflection-of-the-day; save + share-as-image.

### 4.3 WebView gotchas (must honor) *(S4/S5)*
- The streak header must be a **sibling outside any `Reorder.Group`/modal transform** — `position:sticky` un-pins under an ancestor transform in WKWebView (the reason `MobileShell` is opacity-only). Prefer non-sticky or `.native`-gated.
- Calendar modal: set underlying `<main>` `overflow:hidden` while open; modal gets its own `overscroll-contain` scroller (touch bleed-through otherwise).

### 4.4 Required states (calendar + reflections) *(S6)*
loading (existing `Skeleton`) · empty/first-day · **before-launch** (distinct from sad) · **not-signed-in** (calendar → local adapter or "Sign in to keep history" `EmptyState`; reflections read-only, gate only the save button) · **offline** (last-known/local rollups; bundle a small fallback reminder set for cold offline) · end-of-deck.

---

## 5. Screens

- **Checklist (default):** streak header (daily primary + prayer; outside any transform) → Mon–Sun strip (tap → calendar modal) → list (drag-reorder, count items) → Edit mode (add/remove/edit/reorder). Calendar modal: month grid + nav + per-day detail; today default-selected.
- **Worship:** time chips auto-select current period → dhikr cards with `<DhikrCounter>` (shared state with matching checklist dhikr via `dhikr_key`).
- **Sunnah:** category chips → du'ā cards (Arabic+translit+meaning+source) + practice cards (icon + line + source).
- **Reminders:** `<ReflectionsFeed>` + theme filter + reflection-of-the-day + save/share.

---

## 6. Home integration (in-app cards — the v1 "widgets")
- **Streak card** → navigates to **Daily → Checklist** (default tab).
- **Mood reflection card** — uplifting, **separate content pool/tone** from the Reminders tab.
- Optional checklist-progress + next-prayer cards. Pure React, reused on web.

---

## 7. Default checklist (seed)
🕌 prayer (Prayer streak) · 📿 dhikr (Worship + lifetime) · #️⃣ goal count
1. **Fajr** 🕌 2. **Morning adhkār** 📿 3. **Read Qur'ān — 1 page** #️⃣ 4. **Ḍuḥā** (sunnah) 5. **Dhuhr** 🕌 6. **ʿAsr** 🕌 7. **Ṣalawāt ﷺ ×10** 📿#️⃣ 8. **Istighfār ×100** 📿#️⃣ 9. **Give ṣadaqah** 10. **Maghrib** 🕌 11. **Evening adhkār** 📿 12. **ʿIshā** 🕌 13. **Du'ā for parents** 14. **Witr** 🕌 15. **Surah al-Mulk before sleep** 📿

---

## 8. OS home-screen widgets — **FAST-FOLLOW (confirmed), not v1** *(scope flag)*
Reality from the review:
- **iOS: Effort L (~5–8 eng-days).** SPM `CapApp-SPM/Package.swift` is "DO NOT MODIFY", so a WidgetKit extension is a hand-wired Xcode target `cap sync` won't manage, + App Group entitlements on two App IDs/profiles, a small custom Swift bridge plugin (`WidgetBridge.setSnapshot` → `UserDefaults(suiteName:)` + `WidgetCenter.reloadTimelines`), and 3 SwiftUI layouts.
- **Android: blocked — no `android/` dir exists.** Requires `npx cap add android` + a working Play build (icons/splash/keyboard parity) first. Gates the §9 nudge on Android too.
- **Background freshness constraint (hard):** a static web app **cannot run backgrounded**. The app writes today+next-few-days of reflections and **2–3 days of prayer timestamps** (from `aladhan.com`, fetched in the existing notification prefetch — the widget can't compute prayer times) into the App Group on each open; iOS `TimelineProvider` self-advances the countdown. >2–3 days unopened → "open app to refresh."
- Widgets (Next Prayer / Streak / Reflection) are independent of everything else, so deferring them blocks nothing.
- **In-app Home cards (§6) carry the "widget" value in v1.**

**DECISION (confirmed 2026-06-16):** OS widgets are **fast-follow** — iOS first after the functional app ships, Android after `cap add android`. v1's "widget" value is delivered by the in-app Home cards (§6).

---

## 9. Notifications — streak nudge (**v1**, Effort S) *(S7)*
`scheduleAllNotifications()` cancels **all** pending then rebuilds (notifications.ts:151) — so the nudge must be **integrated into that function** (re-evaluate today's completion each open), not scheduled separately (else it's wiped). Reserve a slot: schedule prayers up to `MAX_NOTIFICATIONS − 1` (cap 60), reserved id range (mirror existing id 999). Schedule **one** nudge for today, cancel on first completion; if opened after the nudge hour with today incomplete, schedule **tomorrow** (don't fire immediately). No server / no background JS needed.

---

## 10. Reminders content — ≥200, verified
Draft→verify pass at build time (workflow): each reminder sourced to **Qur'ān (surah:āyah)** or **authentic hadith** with exact ref, **cross-checked against the app's local Qur'an + hadith data** (verified, sunnah.com-aligned numbering); unmatched → dropped/flagged, no uncited "hadith". Tagged tone (hope/accountability), balanced, spread across themes. Delivered for your spot-check; stored `verified=true`.

---

## 11. Migration & seeding — **one idempotent server transaction** *(B6)*
`onAuthStateChange` fires on every sign-in/refresh/cold-start (AuthContext.tsx:59) → must be guarded. Order:
1. **If `checklist_user_items` already exist → abort** (server-side existence check is the real run-once guard; a localStorage flag is per-device belt-and-suspenders only).
2. Seed `checklist_user_items` from defaults.
3. Import legacy **day→checked-ids map** into `checklist_day_items`/`checklist_day`, mapping legacy ids onto seeded items; **snapshot unmatched legacy ids as orphaned done-rows** (don't drop — preserves historical done-count). Pass legacy `YYYY-MM-DD` keys through as **opaque strings** (never `new Date(key).toISOString()` — shifts the date).
4. Import legacy dhikr **into `dhikr_lifetime` only** (`DhikrCounts` has no date dimension; fabricating a `dhikr_daily[today]` row would auto-complete today's goals). Map legacy ids → `dhikr_key`s.
5. **Recompute `user_streaks` from `checklist_day`** under the ≥1-item rule. **Never import the legacy streak integer** (old semantics = 5-item threshold; would mismatch and visibly reset on next calendar recompute).

---

## 12. Build order
1. Migration `002` (tables + RLS + `SECURITY DEFINER` RPCs: increment-dhikr, recompute-streaks, materialize-day) + seed defaults.
2. `packages/ui/lib/daily` — `DailyAdapter` types + `createLocalDailyAdapter`; `apps/web` `createSupabaseDailyAdapter`.
3. Shared components (`useChecklist`, `<Checklist>` w/ Reorder, `<StreakBadges>`, `<StreakWeekStrip>`, `<StreakCalendar>`, `<DhikrCounter>`).
4. Checklist screen + streak header + week strip + **calendar modal** + Edit mode + migration-on-first-auth.
5. Worship dhikr counters (shared `dhikr_key` RPC).
6. Sunnah restyle.
7. Reminders content (≥200 verified) + `<ReflectionsFeed>`.
8. Home cards (streak → Checklist deep link; mood reflection).
9. Streak nudge (integrated into `scheduleAllNotifications`).
10. *(fast-follow, if approved)* OS home-screen widgets — iOS first; Android after `cap add android`.

---

## Open confirmations
1. ~~OS widgets: v1 or fast-follow?~~ → **Fast-follow** (confirmed 2026-06-16). ✅
2. Default checklist (§7) + reminder count/themes (§10) — confirmed. ✅

**Spec locked — ready to build (order in §12), starting with migration 002.**
