-- ============================================================================
-- Hidden Hiqmah — Checklist label cleanup (remove transliteration diacritics)
-- ============================================================================
-- Run in Supabase Dashboard → SQL Editor. Idempotent.
-- Normalizes default labels to plain spelling (consistent with the rest of the
-- app), and updates existing per-user items + day snapshots that still carry the
-- old default label (renamed/custom items are left untouched).
-- ============================================================================

with renames(key, oldlabel, newlabel) as (
    values
        ('morning_adhkar', 'Morning adhkār',           'Morning adhkar'),
        ('quran_page',     'Read Qur''ān — 1 page',     'Read Quran — 1 page'),
        ('duha',           'Ḍuḥā prayer',              'Duha prayer'),
        ('asr',            'ʿAsr prayer',              'Asr prayer'),
        ('salawat',        'Ṣalawāt on the Prophet ﷺ', 'Salawat on the Prophet ﷺ'),
        ('istighfar',      'Istighfār',                'Istighfar'),
        ('sadaqah',        'Give ṣadaqah',             'Give sadaqah'),
        ('evening_adhkar', 'Evening adhkār',           'Evening adhkar'),
        ('isha',           'ʿIshā prayer',             'Isha prayer'),
        ('dua_parents',    'Du''ā for parents',         'Du''a for parents')
)
-- 1. Reference defaults (future seeds).
, upd_default as (
    update public.checklist_default_items d
       set label = r.newlabel
      from renames r
     where d.key = r.key
    returning 1
)
-- 2. Per-user items still on the old default label (preserve renames).
, upd_user as (
    update public.checklist_user_items u
       set label = r.newlabel
      from renames r
     where u.source_key = r.key and u.label = r.oldlabel
    returning 1
)
-- 3. Frozen day snapshots that match an old default label (cosmetic).
, upd_snap as (
    update public.checklist_day_items i
       set label_snapshot = r.newlabel
      from renames r
     where i.label_snapshot = r.oldlabel
    returning 1
)
select
    (select count(*) from upd_default) as defaults_updated,
    (select count(*) from upd_user)    as user_items_updated,
    (select count(*) from upd_snap)    as snapshots_updated;
