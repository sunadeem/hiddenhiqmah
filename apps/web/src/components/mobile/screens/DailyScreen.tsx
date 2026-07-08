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
  const [tab, setTab] = useState<TabKey>(
    TABS.some((t) => t.key === paramTab) ? (paramTab as TabKey) : "checklist"
  );

  // Re-sync when a deep-link changes ?tab while Daily is already mounted
  // (e.g. tapping the Today's Reminder notification with the app open on Daily).
  useEffect(() => {
    if (paramTab && TABS.some((t) => t.key === paramTab)) setTab(paramTab as TabKey);
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

function ChecklistTab() {
  const router = useRouter();
  const { adapter, signedIn, authLoading } = useDailyAdapter();
  const today = useMemo(() => todayLocalDate(), []);
  const list = useChecklist(adapter, today);
  const [calOpen, setCalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [week, setWeek] = useState<DayRollup[]>([]);

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

      <Checklist
        rows={list.rows}
        onCheck={list.check}
        onBump={list.bump}
        onHaptic={hapticSelection}
      />

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
          className="fixed inset-0 z-[70] bg-themed overflow-y-auto"
          style={{
            paddingTop: "max(env(safe-area-inset-top), 60px)",
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

function RemindersTab() {
  const today = useMemo(() => todayLocalDate(), []);
  const { saved, toggle } = useReminderSaves();
  const router = useRouter();
  const openReminder = (r: Reminder) => {
    if (r.sourceKind === "quran") {
      const [s, v] = r.sourceRef.split(":");
      if (s && v) router.push(`/quran/${s}?v=${v}`);
    }
  };
  return (
    <ReflectionsFeed
      reminders={ALL_REMINDERS}
      today={today}
      savedIds={saved}
      onToggleSave={toggle}
      onShare={shareReminder}
      onOpen={openReminder}
      onHaptic={hapticSelection}
    />
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

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="card-bg rounded-2xl border sidebar-border p-8 text-center">
      <div className="text-[10px] uppercase tracking-[0.2em] text-themed-muted mb-2">
        {label}
      </div>
      <p className="text-themed font-semibold">Coming in this update</p>
      <p className="text-themed-muted text-sm mt-1">Being rebuilt in the new design.</p>
    </div>
  );
}
