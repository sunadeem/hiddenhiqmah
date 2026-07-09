-- ============================================================================
-- 018 — Hifz: a settable daily new-learning target (portions per day).
--
-- Additive + re-run safe. Nullable: NULL means "derive from pace" (gentle 1 /
-- steady 2 / devoted 3 new portions a day). The plan editor writes an explicit
-- value here when the user overrides it. Depends on 016 (hifz_plan).
-- ============================================================================
alter table public.hifz_plan
  add column if not exists daily_portions int;
