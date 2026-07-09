-- ============================================================================
-- 019 — Hifz: explicit path ordering for inserted portions.
--
-- Additive + re-run safe. NULL ⇒ the card sorts by muṣḥaf position (the default).
-- A float value slots a portion between existing positions when the user inserts
-- a sūrah out of reading order ("start this next" / "after my current sūrah").
-- Depends on 016 (hifz_cards).
-- ============================================================================
alter table public.hifz_cards
  add column if not exists card_order double precision;
