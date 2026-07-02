# Hifz Coach — spec & roadmap

Memorization (hifz) coach with spaced-repetition retention. Scoped in the
2026-06-24 design discussion. This is the last big "moat" feature (Section C) and
the one that finally requires Supabase sync.

## The core idea: "range cards"

Granularity only affects **how cards are created**, never how the engine works.
A page, an ayah, or a surah all collapse to the same primitive: a **card pointing
at an ayah range** (`surah:ayah start → end`). The SRS scheduler treats them
identically, so the schedule stays tractable for any choice:

- **By page** (default) → card = that page's ayah span (≤ 604 cards ever)
- **By ayah** → card = one ayah (start == end)
- **By surah / custom range** → card = the whole span

Cards exist **only for what the user is actively memorizing** (their plan), never
the whole mushaf — so even "by ayah" is bounded. Review sessions batch contiguous
due cards into one flow.

User decision (2026-06-24): **full SRS engine in v1**; **granularity is
user-selectable, default "By Page"**; schedule must stay tractable for any choice.

## v1 scope

### SRS engine (SM-2 / Anki-style)
Pure functions (same shape as the humane-streak engine), per card:
- `ease` (default 2.5), `interval` (days), `reps`, `dueAt`, `status`
  (`new → learning → review → memorized`).
- Grades **Again / Hard / Good / Easy** drive the interval (1d → 3d → 7d → 21d …);
  "Again" resets interval + lowers ease; "Easy" raises ease.
- New cards pass through short learning steps before graduating to review.

### Practice modes (reuse existing per-ayah audio + reader)
1. **Listen & repeat** — loop / slow playback of an ayah.
2. **Hide & reveal** — blur the Arabic, recall, tap to check (the core test).
3. **Progressive hint** — reveal first word of each ayah.
4. **Record & playback** — record your recitation (mic), play it back, optionally
   A/B against the reciter; **self-graded** (no analysis). Needs
   `NSMicrophoneUsageDescription` + `getUserMedia`/MediaRecorder (works in
   WKWebView). Pairs naturally with hide-and-reveal: recall → recite → record →
   compare → grade.

All modes end in a self-grade that feeds the SRS scheduler.

### Screens
1. **Hifz dashboard** — today's queue ("learn 17:1–5 · review 3 pages"), progress,
   hifz streak (reuses the humane-streak engine), Start Session.
2. **Plan setup** — granularity selector (Page default / Ayah / Surah-range) + what
   to memorize → creates cards.
3. **Review session** — card → practice mode → self-grade → next.
4. **Progress map** — 30 juz / 604 pages colored memorized / in-review / new; % done.

### Data dependency
- **Mushaf page boundaries** — the 604 Madani page→ayah mapping (needed for "by
  page"). Source from QUL / Tanzil mushaf-layout data and **bundle locally**
  (additive `pages.json`), same approach as the morphology data.

### Sync — migration 010 (this is the feature that needs it)
- Tables: `hifz_cards` (user_id, range fields, srs state, status, created/updated_at)
  + `hifz_reviews` (card_id, grade, reviewed_at) — optional review log.
- RLS self-access. **Last-write-wins by `updated_at`** (single-user progress →
  conflicts rare; no heavy CRDT needed).
- **Local-first**: local adapter (works offline) + Supabase adapter, same pattern
  as the daily checklist (`DailyAdapter`). Hifz progress is irreplaceable, so this
  is non-negotiable for v1.
- Process: SQL written here; **user applies migrations** to dev → prod (never
  auto-deployed).

### Staged build
1. Page-boundary data (`pages.json`) + SRS engine (pure fns) + local adapter — the spine
2. Plan setup + dashboard / today's queue
3. Review session (4 practice modes incl. record & playback + grading)
4. Progress map + hifz streak
5. Supabase schema (010) + sync adapter

## v2 / deferred (logged for reference)

- **AI recitation checking** — auto-detect mistakes: transcribe the user's
  recitation, highlight wrong/missed words, flag tajwīd. Requires a Qur'an-specific
  Arabic speech model (this is essentially Tarteel's whole product) or a
  third-party recitation API. **Big lift — explicitly out of v1.** (v1 ships the
  cheap *record + playback* tier instead; this is the expensive *analysis* tier.)

### Other future possibilities (noted, not yet scoped/discussed)
- **Mutashābihāt trainer** — drill similar/easily-confused verses.
- **Teacher / circle review** — share a recitation recording with a teacher or
  Circle for feedback (ties into Circles + the deferred teacher/class dashboard).
- **Tajwīd reference overlays** during review.
