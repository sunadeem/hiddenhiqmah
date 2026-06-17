"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { Skeleton } from "@hidden-hiqmah/ui/components/Skeleton";
import { hapticSelection, hapticLight } from "@/lib/mobile/haptics";

type TabKey = "checklist" | "worship" | "sunnah" | "reminders";

const TABS: { key: TabKey; label: string }[] = [
  { key: "checklist", label: "Checklist" },
  { key: "worship", label: "Worship" },
  { key: "sunnah", label: "Sunnah" },
  { key: "reminders", label: "Reminders" },
];

export default function DailyScreen() {
  const [tab, setTab] = useState<TabKey>("checklist");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-themed tracking-tight px-1">Daily</h1>

      <div className="flex bg-white/[0.06] rounded-2xl p-1 gap-1">
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
      {tab === "worship" && <ComingSoon label="Worship" />}
      {tab === "sunnah" && <ComingSoon label="Sunnah" />}
      {tab === "reminders" && <ComingSoon label="Reminders" />}
    </div>
  );
}

function ChecklistTab() {
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

  if (authLoading || list.loading) return <ChecklistSkeleton />;

  return (
    <div className="space-y-4">
      {!signedIn && (
        <Link
          href="/signin"
          className="block card-bg rounded-2xl border sidebar-border px-4 py-3 text-sm text-themed-muted touch-manipulation"
        >
          <span className="text-gold font-semibold">Sign in</span> to sync your checklist
          and keep your streak across devices.
        </Link>
      )}

      <StreakBadges
        streaks={list.streaks}
        onOpen={() => {
          hapticLight();
          setCalOpen(true);
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
