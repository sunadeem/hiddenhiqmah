# Manual additions to the hadith corpus

The corpus is fetched from the fawazahmed0/hadith-api dataset via
`scripts/fetch-collection.mjs`. The entries below were added BY HAND because the
upstream dataset is missing them. Each records its provenance so the corpus's
role as verification ground truth stays auditable. **Re-running the fetch
script overwrites the book files — re-apply these afterwards.**

| Local ref | Entry id | What | Source of text | Added |
|---|---|---|---|---|
| Muslim 45:198 | 6701 | The daʿāmīs hadith (Abu Hassān ← Abu Huraira): small children of Paradise take hold of the parent's garment and do not let go until Allah admits parent and child to Paradise (= Sahih Muslim 2635, both chains merged). Upstream gap: eng-muslim skips ids 6701–6702. | AhmedBaset/hadith-json (sunnah.com-sourced mirror), `db/by_book/the_9_books/muslim.json` entry id 13815 / idInBook 6538 — Arabic + English copied verbatim (whitespace-normalized only). Neighbor alignment verified against local 45:196/45:197/45:199. | 2026-07-12 |
