# Islamic Events & Occasions — Notification Matrix

Spec for the "Islamic events" notification feature (testing item #12).

## System
- **On-device local notifications** (like prayer times). Dates are deterministic from the Hijri calendar, so they're computed + scheduled on-device — **no server, no cron, works offline, zero maintenance.**
- Hijri dates via `Intl.DateTimeFormat('en-u-ca-islamic-umalqura')` (already used in `packages/ui/lib/storage.ts` → `getCurrentHijriMonthDay`).
- One toggle in **Settings → Notifications → "Islamic events & occasions"** (default ON). Respects the global notification permission.
- Fire time: **9:00 AM local** for advance/day-of notices (a calm morning nudge), configurable via a constant.
- Scheduling window: schedule the **next ~60 days** of events on each app open (same rolling refill as prayer/reminder notifications), so the 64-pending cap is never a problem (events are sparse).

## Timing rules
| Category | Rule |
|---|---|
| **Single-day occasion** | 3 days before + day-of |
| **Prep-heavy month (Ramadan)** | 1 week before + day-of (start) |
| **Multi-day observance** (first 10 of Dhul-Ḥijjah, last 10 of Ramadan) | 1 the day before + 1 EACH day, naming the day + what to do |
| **Recurring monthly** (White Days) | eve of the 13th, each month |

## The matrix

### Muharram
| When | Notification | Title | Body |
|---|---|---|---|
| 3 days before 1 Muḥarram | advance | Islamic New Year approaches | The new Hijri year begins in 3 days, on 1 Muḥarram. |
| 1 Muḥarram | day-of | Happy New Hijri Year | Today begins a new Islamic year. A moment to renew your intentions. |
| 3 days before 10 Muḥarram | advance | ʿĀshūrāʾ is in 3 days | Fasting the 10th of Muḥarram expiates the sins of the past year. Consider fasting the 9th & 10th. |
| 10 Muḥarram (and 9th) | day-of | Fast of ʿĀshūrāʾ | Today is ʿĀshūrāʾ — a blessed day to fast. |

### Rajab — *(debated: include? — see bottom)*
| When | Notification | Title | Body |
|---|---|---|---|
| — | *Isrāʾ & Miʿrāj (27 Rajab)* | *pending your decision* | |

### Shaʿbān — *(debated: include?)*
| When | Notification | Title | Body |
|---|---|---|---|
| — | *Mid-Shaʿbān (15 Shaʿbān)* | *pending your decision* | |

### Ramadan
| When | Notification | Title | Body |
|---|---|---|---|
| 1 week before 1 Ramadan | prep | Ramadan is a week away | Ramadan begins in about a week. Make up any missed fasts and plan your worship. |
| 1 Ramadan | day-of | Ramadan Mubarak | The blessed month begins today. May Allah accept your fasting and prayer. |
| Eve of 21 Ramadan | multi-day start | The last 10 nights begin | Seek Laylat al-Qadr — a night better than a thousand months. Increase in prayer and duʿāʾ. |
| Nights 21, 23, 25, 27, 29 | each odd night | An odd night of the last 10 | Tonight could be Laylat al-Qadr. Say: *Allāhumma innaka ʿafuwwun tuḥibbu-l-ʿafwa faʿfu ʿannī.* |

### Shawwāl
| When | Notification | Title | Body |
|---|---|---|---|
| 3 days before 1 Shawwāl | advance | Eid al-Fiṭr is in 3 days | Eid al-Fiṭr is near. Remember your Zakāt al-Fiṭr before the Eid prayer. |
| 1 Shawwāl | day-of | Eid Mubarak | Eid al-Fiṭr is today. Takbīr, the Eid prayer, and joy with family. |

### Dhul-Ḥijjah (multi-day)
| When | Notification | Title | Body |
|---|---|---|---|
| Eve of 1 Dhul-Ḥijjah | multi-day start | The best 10 days begin tomorrow | The first 10 days of Dhul-Ḥijjah — the most beloved days for good deeds — begin tomorrow. |
| 1–8 Dhul-Ḥijjah | each day | Day N of Dhul-Ḥijjah | These are the best days of the year — increase in dhikr, fasting, and charity. |
| 9 Dhul-Ḥijjah | Arafah (day-of) | Day of ʿArafah | The best day to fast — it expiates two years of sins. Make much duʿāʾ today. |
| 10 Dhul-Ḥijjah | Eid (day-of) | Eid al-Aḍḥā Mubarak | Eid al-Aḍḥā is today — the Eid prayer, takbīr, and the udḥiyah (sacrifice). |

### White Days (recurring, monthly)
| When | Notification | Title | Body |
|---|---|---|---|
| Eve of the 13th, each month | recurring | White Days fasting | The White Days (13th–15th) begin tomorrow — the Prophet ﷺ encouraged fasting these three days each month. |

## Debated occasions — INCLUDED (informational)
Founder decision: include all three as **informational only** — neutral copy that helps users learn the date, with no claim of special worship. They ride the main "Events & occasions" toggle.
- **Mawlid** — 12 Rabīʿ al-Awwal
- **Isrāʾ & Miʿrāj** — 27 Rajab
- **Mid-Shaʿbān** — 15 Shaʿbān

## Decisions (resolved)
1. Debated occasions: **included, informational.**
2. White Days: **kept** monthly, with the virtue conveyed in the copy + its own toggle.
3. Fire times: **10:00 AM** local for day/advance notices; **8:30 PM** for the Laylat al-Qadr night nudges (spaced from the 8 AM verse + 1:30 PM hadith so nothing stacks).
4. Every notification deep-links to a relevant page; feature gated by two toggles (Events & occasions, White Days), both default ON.
