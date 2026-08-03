"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { useDailyAdapter } from "@/lib/daily/useDailyAdapter";
import { useChecklist } from "@hidden-hiqmah/ui/lib/daily/useChecklist";
import {
  mondayOf,
  todayLocalDate,
  type DayRollup,
} from "@hidden-hiqmah/ui/lib/daily/types";
import { StreakBadges } from "@hidden-hiqmah/ui/components/daily/StreakBadges";
import { StreakWeekStrip } from "@hidden-hiqmah/ui/components/daily/StreakWeekStrip";
import { StreakCalendar } from "@hidden-hiqmah/ui/components/daily/StreakCalendar";
import { Checklist } from "@hidden-hiqmah/ui/components/daily/Checklist";
import { ChecklistEditor } from "@hidden-hiqmah/ui/components/daily/ChecklistEditor";
import WorshipDhikrSection from "./WorshipDhikrSection";
import PageTip from "@/components/mobile/PageTip";
import { ReflectionsFeed } from "@hidden-hiqmah/ui/components/daily/ReflectionsFeed";
import JournalSection, { type JournalDraft } from "@/components/mobile/screens/JournalSection";
import { reminderShareText, type Reminder } from "@hidden-hiqmah/ui/lib/reminders";
import remindersData from "@hidden-hiqmah/content/reminders.json";
import { Skeleton } from "@hidden-hiqmah/ui/components/Skeleton";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { useReminderSaves } from "@/lib/daily/useReminderSaves";
import { rescheduleNotificationsDebounced } from "@/lib/mobile/notifications";
import { hapticSelection, hapticLight } from "@/lib/mobile/haptics";
import {
  MorningTab,
  AfternoonTab,
  EveningTab,
  SleepTab,
  MidnightTab,
  SunnahContent,
  sunnahSubs,
  resolveMainTab,
  type SunnahSub,
} from "@/app/muslim-daily/page";

type TabKey = "checklist" | "worship" | "sunnah" | "reminders";

const TABS: { key: TabKey; label: string }[] = [
  { key: "checklist", label: "Checklist" },
  { key: "worship", label: "Worship" },
  { key: "sunnah", label: "Sunnah" },
  { key: "reminders", label: "Reminders" },
];

export default function DailyScreen() {
  const searchParams = useSearchParams();
  const paramTab = searchParams.get("tab");
  // resolveMainTab is shared with the web page, so ?tab= deep links (including
  // the legacy "remember" alias) resolve identically on both platforms.
  const [tab, setTab] = useState<TabKey>(resolveMainTab(paramTab) ?? "checklist");

  // Re-sync when a deep-link changes ?tab while Daily is already mounted
  // (e.g. tapping the Today's Reminder notification with the app open on Daily).
  useEffect(() => {
    const resolved = resolveMainTab(paramTab);
    if (resolved) setTab(resolved);
  }, [paramTab]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-themed tracking-tight px-1">Daily</h1>

      <div className="flex bg-[var(--overlay-medium)] rounded-2xl p-1 gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              hapticSelection();
              setTab(t.key);
            }}
            className={`flex-1 text-center text-[13px] font-semibold py-2 rounded-xl transition-colors touch-manipulation ${
              tab === t.key ? "bg-[var(--color-gold)]/18 text-gold" : "text-themed-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "checklist" && <ChecklistTab />}
      {tab === "worship" && <WorshipTab />}
      {tab === "sunnah" && <SunnahTab />}
      {tab === "reminders" && <RemindersTab />}
    </div>
  );
}

// Checklist category filter. Derived purely from item identity (isPrayer =
// kind === "prayer"), so no schema change is needed:
//   • Fard   — the five obligatory prayers (Fajr…Isha). The DEFAULT view: the
//              obligations are what a user checks most, so they open to them
//              rather than scrolling a combined list.
//   • Sunnah — everything else: dhikr + sunnah/task items (Ḍuḥā, Witr, Quran,
//              sadaqah…) plus every user-added custom item (added as kind "task").
//   • All    — the full list.
// The filter KEYS stay "prayer"/"extra" — they're only internal state, and
// renaming them would churn every reference for a label change.
type ChecklistFilter = "prayer" | "extra" | "all";

const CHECKLIST_FILTERS: { key: ChecklistFilter; label: string }[] = [
  { key: "prayer", label: "Fard" },
  { key: "extra", label: "Sunnah" },
  { key: "all", label: "All" },
];

function ChecklistTab() {
  const router = useRouter();
  const { adapter, signedIn, authLoading } = useDailyAdapter();
  const today = useMemo(() => todayLocalDate(), []);
  const list = useChecklist(adapter, today);
  const [calOpen, setCalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [filter, setFilter] = useState<ChecklistFilter>("prayer");
  const [week, setWeek] = useState<DayRollup[]>([]);

  const filteredRows = useMemo(() => {
    if (filter === "prayer") return list.rows.filter((r) => r.isPrayer);
    if (filter === "extra") return list.rows.filter((r) => !r.isPrayer);
    return list.rows;
  }, [list.rows, filter]);

  useEffect(() => {
    adapter.getDayRollups(mondayOf(today), today).then(setWeek).catch(() => setWeek([]));
  }, [adapter, today, list.rollup]);

  const weekMerged = useMemo(() => {
    const map = new Map(week.map((r) => [r.localDate, r]));
    if (list.rollup) map.set(today, list.rollup);
    return [...map.values()];
  }, [week, list.rollup, today]);

  // Once today has any completion, mark activity (for the streak nudge) and
  // reschedule so today's "keep your streak" notification is cancelled.
  const doneToday = list.rollup?.doneItems ?? 0;
  useEffect(() => {
    if (doneToday >= 1) {
      try {
        localStorage.setItem("hiqmah-daily-last-active", today);
      } catch {
        /* ignore */
      }
      rescheduleNotificationsDebounced(false);
    }
  }, [doneToday, today]);

  if (authLoading || list.loading) return <ChecklistSkeleton />;

  return (
    <div className="space-y-4">
      <PageTip
        tips={[
          {
            key: "daily-checklist-v2",
            title: "Your daily checklist",
            body: "Check off prayers, adhkār and reading as you go. Streaks build day by day — and forgive the occasional off day.",
          },
        ]}
      />
      {!signedIn && (
        <Link
          href="/signin"
          className="block card-bg rounded-2xl border sidebar-border px-4 py-3 text-sm text-themed-muted touch-manipulation"
        >
          <span className="text-gold font-semibold">Sign in</span> to sync your checklist
          and keep your streak across devices.
        </Link>
      )}

      {/* Streak + prayer badges → the Humane Streaks page (pauses, mercy, qaḍāʾ). */}
      <StreakBadges
        streaks={list.streaks}
        onOpen={() => {
          hapticLight();
          router.push("/streaks");
        }}
      />

      <StreakWeekStrip
        rollups={weekMerged}
        today={today}
        onOpen={() => {
          hapticLight();
          setCalOpen(true);
        }}
      />

      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-themed-muted">
          {list.rollup && list.rollup.totalItems > 0
            ? `${list.rollup.doneItems} of ${list.rollup.totalItems} today`
            : "Today"}
        </span>
        <button
          type="button"
          onClick={() => {
            hapticLight();
            setEditOpen(true);
          }}
          className="inline-flex items-center gap-1.5 text-sm text-themed-muted touch-manipulation"
        >
          <Pencil size={14} /> Edit
        </button>
      </div>

      {/* Category filter (Fard / Sunnah / All) — reuses the app's segmented
          tab pattern. Categories are inferred from item identity; check/uncheck,
          streaks, edit and sync all operate on the same rows unchanged. */}
      {list.rows.length > 0 && (
        <div className="flex bg-[var(--overlay-medium)] rounded-2xl p-1 gap-1">
          {CHECKLIST_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                hapticSelection();
                setFilter(f.key);
              }}
              className={`flex-1 text-center text-[13px] font-semibold py-2 rounded-xl transition-colors touch-manipulation ${
                filter === f.key ? "bg-[var(--color-gold)]/18 text-gold" : "text-themed-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {list.rows.length > 0 && filteredRows.length === 0 ? (
        // A filter is active and hides every row (e.g. all prayers deleted).
        // The full-list empty case still falls through to <Checklist/> below,
        // preserving the original empty-list rendering.
        <p className="card-bg rounded-2xl border sidebar-border px-4 py-6 text-center text-sm text-themed-muted">
          {filter === "prayer"
            ? "No fard prayers on your list."
            : "No sunnah items on your list."}
        </p>
      ) : (
        <Checklist
          rows={filteredRows}
          onCheck={list.check}
          onBump={list.bump}
          onHaptic={hapticSelection}
        />
      )}

      {calOpen && (
        <StreakCalendar
          adapter={adapter}
          today={today}
          onClose={() => {
            setCalOpen(false);
            void list.reload(); // reflect any retro-completed past days in the header/strip
          }}
        />
      )}

      {editOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[70] bg-themed overflow-y-auto ipad-overlay"
          style={{
            paddingTop: "var(--hiqmah-safe-top)",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
            overscrollBehavior: "contain",
          }}
        >
          <div className="px-4">
            <ChecklistEditor
              adapter={adapter}
              onClose={() => {
                setEditOpen(false);
                void list.reload();
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

type PeriodKey = "morning" | "afternoon" | "evening" | "sleep" | "midnight";

const PERIODS: { key: PeriodKey; label: string; Comp: ComponentType }[] = [
  { key: "morning", label: "Morning", Comp: MorningTab },
  { key: "afternoon", label: "Midday", Comp: AfternoonTab },
  { key: "evening", label: "Evening", Comp: EveningTab },
  { key: "sleep", label: "Night", Comp: SleepTab },
  { key: "midnight", label: "Late night", Comp: MidnightTab },
];

function currentPeriod(): PeriodKey {
  const h = new Date().getHours();
  if (h < 4) return "midnight";
  if (h < 11) return "morning";
  if (h < 16) return "afternoon";
  if (h < 19) return "evening";
  return "sleep";
}

function WorshipTab() {
  const { adapter, authLoading } = useDailyAdapter();
  const today = useMemo(() => todayLocalDate(), []);
  const [period, setPeriod] = useState<PeriodKey>(() => currentPeriod());
  const Comp = PERIODS.find((p) => p.key === period)?.Comp ?? MorningTab;

  return (
    <div className="space-y-4">
      {/* Time-of-day chips (auto-selected to now) */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => {
              hapticSelection();
              setPeriod(p.key);
            }}
            className={`shrink-0 whitespace-nowrap text-[13px] font-semibold px-4 py-2 rounded-full touch-manipulation transition-colors ${
              period === p.key
                ? "bg-[var(--color-gold)] text-[var(--color-bg)]"
                : "card-bg border sidebar-border text-themed-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Synced dhikr counters (write through dhikr_key → also tick the checklist).
          Cards are user-manageable: add from a catalog, edit reps, delete custom. */}
      {!authLoading && <WorshipDhikrSection adapter={adapter} today={today} />}

      {/* The verified adhkar guide for the selected period (reused) */}
      <div className="pt-1">
        <Comp />
      </div>
    </div>
  );
}

function SunnahTab() {
  const [sub, setSub] = useState<SunnahSub>("eating");
  return (
    <div className="space-y-4">
      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sunnahSubs.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => {
              hapticSelection();
              setSub(s.key);
            }}
            className={`shrink-0 whitespace-nowrap text-[13px] font-semibold px-4 py-2 rounded-full touch-manipulation transition-colors ${
              sub === s.key
                ? "bg-[var(--color-gold)] text-[var(--color-bg)]"
                : "card-bg border sidebar-border text-themed-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <SunnahContent activeSub={sub} setActiveSub={setSub} hideRail />
    </div>
  );
}

const ALL_REMINDERS = remindersData as unknown as Reminder[];

async function shareReminder(r: Reminder) {
  const text = reminderShareText(r);
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ text });
    } else if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ text });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  } catch {
    /* user cancelled or unsupported */
  }
}

type ReminderSub = "reflections" | "journal";

const REMINDER_SUBS: { key: ReminderSub; label: string }[] = [
  { key: "reflections", label: "Reflections" },
  { key: "journal", label: "Journal" },
];

function RemindersTab() {
  const today = useMemo(() => todayLocalDate(), []);
  const { saved, toggle } = useReminderSaves();
  const router = useRouter();
  // Sub-section within Reminders: the reflections deck vs the personal journal.
  const [sub, setSub] = useState<ReminderSub>("reflections");
  // A pending "Write a reflection" handoff from a reminder card → opens the
  // journal composer pre-linked to that reminder.
  const [draft, setDraft] = useState<JournalDraft | null>(null);

  const openReminder = (r: Reminder) => {
    if (r.sourceKind === "quran") {
      const [s, v] = r.sourceRef.split(":");
      if (s && v) router.push(`/quran/${s}?v=${v}`);
    }
  };

  const reflectOn = (r: Reminder) => {
    const label = r.sourceKind === "quran" ? `Qur'an ${r.sourceRef}` : r.sourceRef;
    setDraft({ ref: r.id, label, nonce: Date.now() });
    setSub("journal");
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-[var(--overlay-medium)] rounded-2xl p-1 gap-1">
        {REMINDER_SUBS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              hapticSelection();
              setSub(t.key);
            }}
            className={`flex-1 text-center text-[13px] font-semibold py-2 rounded-xl transition-colors touch-manipulation ${
              sub === t.key ? "bg-[var(--color-gold)]/18 text-gold" : "text-themed-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "reflections" ? (
        <ReflectionsFeed
          reminders={ALL_REMINDERS}
          today={today}
          savedIds={saved}
          onToggleSave={toggle}
          onShare={shareReminder}
          onOpen={openReminder}
          onReflect={reflectOn}
          onHaptic={hapticSelection}
        />
      ) : (
        <JournalSection draft={draft} onDraftConsumed={() => setDraft(null)} />
      )}
    </div>
  );
}

function ChecklistSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-24 flex-1 rounded-2xl" />
        <Skeleton className="h-24 w-[42%] rounded-2xl" />
      </div>
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
