# Hidden Hiqmah — Product Strategy & Roadmap

> Origin: the "build an Islamic app from scratch" design session (June 2026), rebuilt to fold in the red-team pass. This is the canonical roadmap. **Section A is essentially complete** (it was the focus of the June 2026 build sessions); **Sections B/C/D are the unstarted bets.**
>
> Status legend: ✅ done · 🟦 partial · ⏳ not started · ⏸ backlog (deliberate)
> Size: 🟢 days · 🟡 1–3 wks · 🔴 1–2+ mo · ⚫ X-large / ML-risk
> Tags: [FIX] existing contradiction/bug · [POLISH] mostly built · [NEW] · [PREREQ] enabler · [NON-CODE]

---

## List 1 — Advantages over competitors (defensible)

**Trust (the core — framed honestly)**
- **Honest, source-grounded AI** — every citation is real and checked; the AI *refuses* when it has no verified source and never issues fatwas. Defensible claim is "verified sources + honest boundaries," not "can't hallucinate."
- **Tap-to-Source on everything** — provenance + grade on every verse, hadith, reflection, kids fact, quiz answer.
- **Truly on-device & private** — prayer times computed on the device, location never leaves the phone, no ads on sacred content, nothing sold. The real anti-Muslim-Pro position, *actually true*.
- **Named scholarly oversight + explicit positioning** ("mainstream Sunni; sources X, Y, Z") — defends against the "who authorized you?" attack.

**Quran & learning**
- **Understanding layer** — tap any word → meaning → root → "every occurrence" + inline tafsir + AI tutor. The lead Quran feature.
- **Integrated hifz companion** — follow-along + spaced-repetition + humane scheduling; competes on breadth + trust + price.
- **Beautiful, fully-offline reading + shareable ayah** — Ayah-class typography + a built-in da'wah share loop.
- **Depth + breadth in one trustworthy app** — Quran + 7 hadith collections + seerah/aqeedah + marriage/family + kids + daily.

**Daily, community & family (the real defensibility)**
- **Circles** — private accountability circles + shared khatmah/hifz goals + hifz buddy. The only feature with network effects + a growth loop. *(headline edge)*
- **One calm guided Daily Path** — the whole practicing-Muslim day in one adaptive rhythm.
- **Humane, riya-safe streaks** — mercy days, menstruation/travel/illness pauses, qada; private/non-ranked by default.
- **Family + teacher dashboards (multi-profile)** — switching-cost moat + teacher/madrasah distribution wedge.

**Reach & growth**
- **Localization-ready (Indonesian/Urdu beachheads)** — verified AI in your language, aimed at the largest least-contested markets.
- **First-class Ramadan/seasonal mode** — owns the biggest engagement window of the year.
- **Ethical, sustainable monetization** — web-first billing + gift/waqf, fair pricing, no ads.
- **Cross-platform from one codebase** (web + iOS + Android).

---

## List 2 — Next tasks (sized + status)

### A. Make "trust" actually true — ✅ essentially complete (June 2026)
- ✅ 🟡 [FIX] **On-device prayer times** (`batoulapps/Adhan`) — Home + notification scheduler + Salah GPS path compute locally; no device-location → aladhan; offline; high-latitude. *(commits 376f118, f153bd7)*
- ✅ 🟡 [FIX] **Ground the AI + invert the system prompt** — refuse if no verified source, no fabricated refs, full-context interpretation, sourced fiqh + gray-area disclaimers, persistent "not a mufti", mainstream-Sunni positioning. *(5b9b006)*
- ✅ 🟢 [FIX] **Honest AI/offline messaging** — clear offline message; privacy page reconciled.
- ✅ 🟢 [FIX] **Notification priority tiers** — adhan protected under the iOS 64-pending cap; engagement nudges capped + short window.
- 🟦 🟡 [FIX] **Harden the public AI endpoint** — *partial:* auth (JWT/anon-id) + per-user daily **quota** (429) already exist via the Supabase backend. **Remaining:** burst/abuse rate-limiting + a fallback LLM provider. (Rate-limiting deferred to the pricing discussion.)
- ✅ 🟢 [POLISH] **Privacy panel + no-ads pact** — privacy page states on-device prayer times + honest disclosures; "no ads / no data sold / no tracking" pact present.
- 🟦 🟡 [NON-CODE] **Licensing audit** — *audit done* (see `memory/reference_content_licensing.md`) + Credits page shipped (Tanzil, cpfair CC-BY, OFL, corpus GPL attributions). **Remaining (blocks paywall):** swap Saheeh Int'l translation (user deciding), re-source tafsir + hadith English + reciter audio, move word-by-word off GPL *if* paywalling.
- ⏸ 🟡 [NON-CODE] **Recruit + name ≥1 reviewing scholar** — deliberately backlogged (no scholar yet); Sunni positioning is stated in-app.

*Bonus done beyond A:* AI prompt-caching + web token-streaming + initial greeting (5b9b006, dd6407a); Sects-page honest framing card (2e3e940).

### B. The corrected moat (community + understanding + reach) — ⏳ not started
- ⏳ 🔴 [NEW] **Circles** — private accountability circles + shared goals + hifz buddy (network-effect moat + growth loop).
- ⏳ 🟡 [NEW] **Understanding layer** — word→root→every-occurrence + inline tafsir + "explain like I'm new/student" toggle.
- ⏳ 🔴 [PREREQ] **i18n re-architecture** — separate translation editions from verse data + a string layer + language-native AI retrieval. **Do before adding more English content.**
- ⏳ 🟡 [NEW] **Ramadan/seasonal mode** — taraweeh, juz-a-day khatmah, last-10-nights, suhoor/iftar countdown; auto-activates by Hijri date.

### C. Daily / family / hifz (retention + heavy builds) — ⏳ not started
- ⏳ 🟡 [POLISH→NEW] **Daily Path adaptive home** — assemble existing pieces into one reflowing ribbon.
- ⏳ 🟢 [POLISH] **Humane, riya-safe streaks** — mercy days, pauses, qada; comparison off by default. *(streaks exist; the humane layer doesn't)*
- ⏳ ⚫ [NEW] **Hifz coach (reframed)** — reciter-tolerant alignment; follow-along + SRS free, mistake-detection gated. Highest risk — build *after* the wedge.
- ⏳ 🔴 [NEW] **Multi-profile household + parent/teacher dashboard** — switching-cost moat + teacher distribution.
- ⏳ 🔴 [PREREQ] **Supabase sync with conflict-resolution** (event-log/CRDT for hifz/SRS — last-write-wins corrupts irreplaceable data). Gates family + cross-device.
- ⏳ 🟡 [NEW] **Per-surah offline audio download** (C-3e) — after licensing cleared.

### D. Business & launch — ⏳ not started
- ⏳ 🔴 [NEW] **Web-first billing (Stripe)** for subscriptions + gift/waqf; IAP as convenience. *(Note: pricing is being revisited — core stays free + donations; a paywall for extras is possible. Keep the "Hiqmah Plus" scaffolding.)*
- ⏳ 🟡 [NEW] **Onboarding that ROUTES** — "what brings you here?" (prayer / hifz / new Muslim / family / exploring) seeds a different Daily Path + home.
- ⏳ 🟡 [NEW] **Teacher/madrasah wedge** — assignable app + class dashboard + sponsor-a-student.
- ⏳ 🟢 [POLISH] **Shareable-ayah loop** — typography + share image as a core growth feature.

---

## The shape of it
Section **A was almost all 🟢/🟡 fixes to things already built** — the highest-leverage work because it makes the trust brand *real* before marketing it, and it's now essentially done. The genuinely heavy bets remaining are a handful: **Circles, i18n, multi-profile + sync, the hifz coach, and web-first billing.** Everything else rides the content moat already built.

**Suggested order:** finish A's two open items at launch-prep (licensing remediation + endpoint abuse-limiting; scholar when found) → B's Understanding layer + Ramadan mode (high value, medium size) → i18n PREREQ before more content → then the heavy C/D bets (Circles, sync, multi-profile, billing) once a wedge is proven.
