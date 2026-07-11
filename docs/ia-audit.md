# Information-Architecture & Design Audit

_Full-site audit of page nesting, tabs, content organization, and layout — with the placement
plan for upcoming content (Jumuʿah, ghusl, sexual relations, sihr, and the rest of the backlog)._

_Audited from the actual code (every page.tsx read), 2026-07-11._

---

## 1. The headline diagnosis

**The site does not have a scroll problem — it has a breadth problem.** The sub-tab doctrine
(memory: reference_page_template) successfully killed long vertical scrolls; the overload moved
*sideways*. The failure mode today:

> Any page with **more than 6 top tabs** collapses to a **text dropdown on mobile**
> (TabBar `mobileThreshold = 6`) — and at that moment the page's breadth becomes invisible.
> A phone user sees one leaf at a time with no map of what the page contains.

This is exactly why `/salah` (8 tabs) needed a PageTip coach-mark to *apologize* for hidden
content, why `/why-islam`'s comparative-religion breadth goes undiscovered, and why `/kids`
(7 tabs) hides its lessons behind the least kid-friendly control on the site.

**The fix direction is never "more tabs." It is:** fewer, better-labeled top tabs (≤6 always) +
promoting page-sized subtopics to real routes + a master-detail rail inside tabs + an accordion
for point-dense leaves.

### The five structural problems, ranked

| # | Problem | Evidence |
|---|---------|----------|
| 1 | **>6 tabs → mobile dropdown hides content** | /salah 8, /why-islam 8, /prophet-muhammad 8, /kids 7, /story-of-creation 12 |
| 2 | **Orphan pages** — finished content reachable from NO nav | /barzakh (766 ln), /day-of-judgement (1018 ln), /jannah — absent from Sidebar, More menu, home grid; /dhikr-stats reachable only via one icon |
| 3 | **Duplication instead of cross-linking** | Eschatology written 3× (story-of-creation stages ↔ orphan pages ↔ articles-of-faith "Last Day"); janazah in /salah ↔ /family with no link (family has no deep-links); hadith-science in /why-islam ↔ /sects; salah-pillar restates /salah intro |
| 4 | **Tools glued to content** | /salah = 2 live tools (times widget, qiblah compass) + a textbook in one 3,389-line file; /muslim-daily = habit tracker + reference library **with two divergent implementations** (web vs native — incompatible checklists, mismatched tab keys) |
| 5 | **"Family" naming collision** | /family (content: parents/death/inheritance) vs /household (tool, titled "Family" on-screen, "Family Profiles" in More); routes.ts maps BOTH to "Family" |

### Component/code hygiene (enables everything above)

- **SubTabLayout is not shared** — copy-pasted in /family + /marriage; the same left-rail
  pattern re-implemented **~8×** under different names (TopicSection, WorshipContent, wudu rail,
  prayer rail, timeline rail…). → Promote ONE `SubTabLayout` to `packages/ui`.
- **9 pages hand-roll pill rows** instead of the shared TabBar (pillars, tawhid,
  articles-of-faith, sects, jannah, barzakh, day-of-judgement, ramadan, islamic-calendar) —
  visually identical, behaviorally divergent.
- **TopicInfoCard copy-pasted 4×** (day-of-judgement, barzakh, story-of-creation, why-islam) —
  the de-facto "aqidah topic" template, never extracted.
- **Deep-linking inconsistent**: `?tab=` works on ~10 pages; **/family, /marriage, /kids have
  none** (28/15/7 leaves unlinkable/unsharable/unsearchable); param names vary
  (`?sub=` vs `?section=` vs `?name=`).
- **Content data lives in page files**: salah 3,389 ln, family 2,623, prophet-muhammad 2,010,
  kids 1,818, why-islam 1,812 — 70–85% is inline data that belongs in `packages/content`.
- **Only ONE accordion exists in the whole app** (islamic-calendar months, hand-rolled). No
  shared Accordion component — needed for the "thorough without overwhelming" pattern.
- Dead code: `packages/ui/components/EmptyState.tsx` (0 imports), sects `renderPillNav`,
  DailyScreen `ComingSoon`.
- **Nav truth is triplicated**: home-content.ts navSections, Sidebar.tsx's own hardcoded copy,
  routes.ts SECTION_TITLES. Adding a page = touching 3 lists.
- Stale data: nav says "25 prophets" (data has 29); /credits still attributes timestamps to
  cpfair (they're Quran.com-API-sourced); **names-of-allah.ts has 88 entries, not 99**.

---

## 2. The house pattern v2 — "thorough without overwhelming"

Codify a **three-level depth rule** (this replaces "add another tab"):

```
Level 1 — Page tabs:      ≤ 6 top tabs, always visible as pills on mobile.
                          More than 6? Split the page or merge tabs — never a 7th.
Level 2 — Topic rail:     inside a tab, the shared SubTabLayout master-detail rail
                          (vertical pills desktop / horizontal chips mobile → one card).
Level 3 — Deep leaf:      if a tab is a mini-book (7+ substantial leaves), promote it to
                          its OWN ROUTE with a card-grid index (the /prophets → [slug]
                          pattern) — real URLs, real back button, searchable.
Inside a card —           shared Accordion for point-dense lists (the pillar/article
                          mega-cards become scannable section headers you expand).
```

Supporting rules:
- Every tab/sub change **writes `?tab=`/`?sub=` to the URL** (one vocabulary, everywhere).
- **Cross-link, never restate**: when two pages touch the same topic, one owns it deeply and
  the other links to it ("Go deeper →").
- Tools get their own routes; content pages embed *links* to tools, not the tools themselves.

---

## 3. Per-area recommendations

### 3.1 /salah — restructure to 6 tabs (and where Jumuʿah + ghusl land)

Today: `Times | Qiblah | Salah | Why It Matters | Wudu | Adhan | Five Prayers | Voluntary` (8 → dropdown).

**Recommended:**
1. **Promote Prayer Times to its own route.** `/prayer-times` already exists as a redirect stub
   *into* salah — reverse it: make it the real page (the ~400-line times widget), have
   `/salah?tab=times` redirect out. Home's NextPrayerCard already deep-links there.
2. **Promote Qiblah out** — its component (`QiblahSection`) is *already* exported for the native
   QiblahSheet; give it `/qiblah` (or keep sheet-only on native + small page on web).
3. **Rename "Wudu" → "Purification (Ṭahārah)"** with rail pills:
   `What is Ṭahārah · Wudu steps · Wudu duas · Sunnah acts · Nullifiers · **Ghusl** · (later: Tayammum)`
   → **GHUSL LIVES HERE**: when obligatory (janabah, menstruation/nifas ending, other cases),
   the obligatory acts, the sunnah step-by-step, common mistakes, cross-link from Nullifiers
   ("what requires ghusl vs wudu") and from Marriage → Married Life.
4. **Add Jumuʿah to "The Prayers" rail**: pills become
   `Types · Fajr · Dhuhr · Asr · Maghrib · Isha · **Jumuʿah**`
   → **JUMUʿAH LIVES HERE**: virtues + who is obligated; **in congregation** (the khutbah,
   2 rakʿāt, etiquette: ghusl ✳ cross-link, early arrival, Surah al-Kahf, duʿā hour); **when
   praying alone / missed it** (pray Dhuhr 4 rakʿāt — the "alone" case); women/traveler/ill
   rulings. Also fold the buried "Types" pill content into the Salah intro tab.
5. Resulting page: `Salah · Why It Matters · Purification · Adhan · The Prayers · Voluntary`
   = **6 tabs — every section visible as pills on a phone, dropdown gone, PageTip apology no
   longer needed.**
6. Extract the content arrays to `packages/content/salah/` while touching this (biggest file in
   the repo, 70%+ is data).

### 3.2 Marriage ↔ Family — **do NOT merge into one page** (and where sexual relations lands)

The scouts confirmed the two pages are **topically disjoint (zero overlap)**: /marriage = spouse
lifecycle (6 tabs / 15 leaves), /family = parents·children·elders·death·inheritance (5 tabs /
28 leaves — already at the ceiling of the 2-level pattern). A literal merge = an 11-tab monster.

**Instead:**
1. **Keep both pages; cross-link them** (today: zero links between them) and present them as a
   pair under the "Life" nav heading.
2. **Add a "Married Life" tab to /marriage** → **SEXUAL RELATIONS LIVES HERE.** Rail pills:
   `Intimacy in Islam (adab & mutual rights) · What is permitted & prohibited · Privacy of the
   bedroom · Duʿās (before intimacy) · Purity afterwards (ghusl ✳ cross-link) · During menses ·
   Family planning (contraception rulings)`.
   This **consolidates today's split-brain**: the lone "Not Refusing Intimacy" card under
   Husband's Rights + the duʿā-before-intimacy content oddly living in /family → Children →
   Conceiving both move here (Conceiving keeps the child-seeking duʿās and links over).
   /marriage goes to 7 tabs — so at the same time merge its two thinnest tabs ("Finding a
   Spouse" + "Getting Married" → one "Before Marriage" tab): net **6 tabs**. ✅
3. **Fix the naming collision now** (cheap, high-confusion): /household screen title
   "Family" → **"Family Profiles"** everywhere (screen header + routes.ts); /family stays
   "Family".
4. **Family Ties (ṣilat al-raḥim) backlog → new "Kinship" tab in /family** (rights of
   relatives, virtue of maintaining ties, severity of cutting them, practical upkeep, in-laws).
   That takes /family to 6 tabs — the ceiling.
5. **Medium-term**: /family's Death (7 leaves) + Inheritance (7 leaves) are each a page-sized
   mini-book invisible behind a pill — prime Level-3 candidates to promote to their own routes
   (Death joins the Hereafter group below; Inheritance stands alone). That would take /family
   back down to 4 tabs with room to grow.

### 3.3 The Hereafter group — fix the orphans + triplication in one move

1. Add nav section **"The Hereafter"** (or expand "The Big Picture"):
   `Story of Creation · Barzakh · Day of Judgement · Jannah & Jahannam` — this **de-orphans
   three finished pages** in navSections + Sidebar (+ routes already titled).
2. In /story-of-creation stages 9–12, add **"Go deeper →"** links to the three deep pages
   (the file currently contains zero hrefs).
3. /articles-of-faith "Last Day" card: trim to summary + link to the group.
4. When Death promotes out of /family, it slots naturally beside Barzakh here (practical rites
   next to the unseen).

### 3.4 New page: Protection & Ruqyah (the Sihr backlog item)

No protection/ruqyah content exists anywhere (nearest: the "Protection" duʿā category in /duas
and barzakh's grave-protection deeds). **Build a new page on the TopicInfoCard template** —
after finally extracting that component (it's copy-pasted 4×):

- **Route**: `/protection` — title "Protection & Ruqyah" (Ar: الرقية والتحصين)
- **Tabs (≤6)**: `Overview · Sihr (magic) · The Evil Eye (ʿayn & ḥasad) · The Jinn ·
  Ruqyah (how-to) · Daily Protection` (last tab cross-links /duas?tab=protection +
  morning/evening adhkār in /muslim-daily).
- **Nav**: under "Life" heading, both surfaces — and unlike the orphans, actually add it to
  navSections on day one.

### 3.5 Remaining backlog placements

| Backlog item | Placement | Notes |
|---|---|---|
| **Jumuʿah (alone + group)** | /salah → The Prayers rail, new pill | §3.1.4 |
| **Ghusl** | /salah → Purification tab, new pill | §3.1.3; cross-link Marriage → Married Life |
| **Sexual relations** | /marriage → new "Married Life" tab | §3.2.2; consolidates 2 existing fragments |
| **Sihr / ruqyah / evil eye** | NEW /protection page | §3.4 |
| **Family Ties (ṣilat al-raḥim)** | /family → new "Kinship" tab | §3.2.4 |
| **Marriage→Family migration** | **Recommend: don't merge** — group + cross-link | §3.2 |
| **Prophet's wives numbering** | /prophet-muhammad → Family & Companions → Wives | Add ordinal chips (1st…); only Khadijah/Sawdah carry ordinals today; **Māriyah al-Qibṭiyyah is missing** (add with careful sourced framing of her status); single-source bios with /prophets/family-tree (2nd hand-maintained copy exists there) |
| **Prophet timeline videos** | /prophet-muhammad → Timeline tab | Embed per-event; while there: group the 28-event rail into Makkah/Madinah eras (fixes the 28-pill mobile scroll) |
| **Quran view toggles (EN/AR/translit)** | Web reader controls row | Native already shipped them (reader SettingsSheet); this is a web-only gap — add beside the font stepper |
| **Read-page-aloud TTS** | Quran reader (both) | Later; slots into the same controls row / sheet |
| **Animated prayer figures** | /salah PrayerGuide | Waiting on Rive assets; wizard already has the PrayerFigure slot + gender toggle |

### 3.6 Other high-value page fixes (from the audit, no backlog dependency)

- **/why-islam**: fold the 6 religion tabs into ONE "Other Worldviews" tab with the religion as
  the rail → 4 top tabs (`Evidence · Other Worldviews · Common Questions · +intro/Why`), escapes
  the dropdown; 2-topic Sikhism stops getting equal billing with 8-topic Evidence. Add the
  missing overview/why tab. Gap worth filling later: a practical **new-Muslim onboarding**
  (shahada, first day, first prayer) — the page argues the case but doesn't onboard a convert.
- **/kids**: replace the 7-tab dropdown with a **big tappable card-grid landing** (each lesson a
  colorful card → Level-3 sub-view) — fits the audience, kills the dropdown. Move out of the
  "Practice" nav heading (odd fit next to Quizzes) or retitle the section.
- **/tawhid 99 Names**: give Names its own index affordance (alphabet/number jump rail) and open
  the detail as a sheet/inline instead of ABOVE the grid (current: browse deep → scroll far back
  up). Fix the dataset (88/99). Consider promoting to `/names` with tawhid linking in.
- **/duas**: don't render all 62 cards under "All" — land on category cards; switch bookmark IDs
  from array index to stable string IDs (index-based bookmarks break on reorder).
- **/pillars, /articles-of-faith**: break the giant single card per pillar/article with the new
  Accordion (Understanding-in-depth / verses / hadith / misconceptions as expandable sections);
  migrate both (plus the other 7 Pattern-C pages) to the shared TabBar.
- **/circles**: with 2+ circles the page inlines every circle's full card — add a compact
  circle list → per-circle detail (route or sheet).
- **/muslim-daily**: unify web onto the native adapter checklist (two incompatible checklist
  systems on one route today) and align tab keys (`remember` vs `reminders`).
- **/prophet-muhammad**: id-based rail state (search filtering silently remaps numeric-index
  selection today).
- **Settings**: move/dev-gate the "Notification tests" QA section (currently 2nd from top).
- Fix stale metadata: 25→29 prophets, credits cpfair line, 88/99 names.

---

## 4. Sequenced plan

**Phase 0 — primitives (unlocks everything)**
Promote `SubTabLayout` + extract `TopicInfoCard` + build `Accordion` in packages/ui; migrate the
9 hand-rolled pill pages to shared TabBar; add `?tab=/?sub=` deep-links to family/marriage/kids;
single-source navSections (Sidebar imports home-content.ts).

**Phase 1 — the content drops (backlog)**
Salah restructure to 6 tabs (+ Purification/Ghusl + Jumuʿah, Times/Qiblah promoted out) ·
Marriage "Married Life" tab (sexual relations) + fragment consolidation + naming-collision fix ·
/protection page · Family "Kinship" tab · wives numbering + Māriyah + ordinal chips.

**Phase 2 — de-orphan & de-duplicate**
Hereafter nav group + story-of-creation outbound links + articles-of-faith trim · why-islam
4-tab fold · duas category landing + stable IDs · stale-metadata fixes.

**Phase 3 — depth promotions & polish**
Death + Inheritance to own routes · kids card-grid landing · 99-names index/sheet · circles
per-circle view · muslim-daily unification · timeline era grouping (+ videos when ready) ·
content-data extraction to packages/content (biggest files first).
