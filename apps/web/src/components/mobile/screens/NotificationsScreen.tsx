"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  HandHeart,
  Sunrise,
  Clock,
  BookOpen,
  ScrollText,
  Sparkles,
  Flame,
  Sparkle,
} from "lucide-react";
import {
  getNotificationPrefs,
  setNotificationPrefs,
  type NotificationPrefs,
} from "@hidden-hiqmah/ui/lib/storage";
import { rescheduleNotificationsDebounced } from "@/lib/mobile/notifications";
import {
  SettingsSection,
  SettingsRow,
  SettingsExpandableRow,
} from "./SettingsUI";

// Only notifications the on-device scheduler (scheduleAllNotifications) actually
// emits are exposed here — a toggle that does nothing is an App Store 2.3.1 risk
// and confusing UX. Retired toggles (iqamah, morning/evening adhkar, dhikr,
// ramadan, laylatul-qadr, AI-chat, continue-reading) can return once scheduled.
export default function NotificationsScreen() {
  const [notif, setNotif] = useState<NotificationPrefs | null>(null);
  const [adhanExpanded, setAdhanExpanded] = useState(false);

  useEffect(() => {
    setNotif(getNotificationPrefs());
  }, []);

  const updateNotif = (patch: Partial<NotificationPrefs>) => {
    setNotificationPrefs(patch);
    setNotif((n) => (n ? { ...n, ...patch } : n));
    // Re-schedule local notifications; prompts for OS permission the first time.
    rescheduleNotificationsDebounced(true);
  };

  if (!notif) {
    return (
      <div className="space-y-3 pb-4">
        <p className="text-center text-themed-muted text-sm py-12">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="text-center pt-1">
        <h1 className="text-2xl font-bold text-themed">Notifications</h1>
      </div>

      <SettingsSection heading="Prayer">
        <SettingsRow
          icon={Bell}
          title="Prayer notifications"
          subtitle="A reminder at each prayer time"
          toggle={notif.prayerNotif !== false}
          onToggle={(v) => updateNotif({ prayerNotif: v })}
        />
        <SettingsExpandableRow
          icon={HandHeart}
          title="Adhan at prayer time"
          expanded={adhanExpanded}
          onToggleExpand={() => setAdhanExpanded((v) => !v)}
          toggle={notif.adhanEnabled}
          onToggle={(v) =>
            updateNotif({
              adhanEnabled: v,
              adhanPerPrayer: {
                fajr: v,
                dhuhr: v,
                asr: v,
                maghrib: v,
                isha: v,
              },
            })
          }
        />
        {adhanExpanded && (
          <div className="bg-[var(--overlay-subtle)] border-t sidebar-border">
            {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((key) => (
              <SettingsRow
                key={key}
                icon={Sunrise}
                title={key[0].toUpperCase() + key.slice(1)}
                indent
                toggle={notif.adhanPerPrayer[key]}
                onToggle={(v) =>
                  updateNotif({
                    adhanPerPrayer: { ...notif.adhanPerPrayer, [key]: v },
                  })
                }
              />
            ))}
          </div>
        )}
        <SettingsRow
          icon={Clock}
          title="Pre-prayer reminder"
          subtitle="A few minutes before each prayer"
          toggle={notif.prePrayer}
          onToggle={(v) => updateNotif({ prePrayer: v })}
        />
      </SettingsSection>

      {/* Subtitles mirror the staggered times in lib/mobile/notifications.ts
          (VERSE/HADITH/REMINDER/STREAK/JUMUAH constants) — keep them in sync. */}
      <SettingsSection heading="Daily">
        <SettingsRow
          icon={BookOpen}
          title="Today's verse"
          subtitle="A morning verse, 8 AM"
          toggle={notif.todaysVerse}
          onToggle={(v) => updateNotif({ todaysVerse: v })}
        />
        <SettingsRow
          icon={ScrollText}
          title="Today's hadith"
          subtitle="A midday hadith, 1:30 PM"
          toggle={notif.todaysHadith}
          onToggle={(v) => updateNotif({ todaysHadith: v })}
        />
        <SettingsRow
          icon={Sparkles}
          title="Today's reminder"
          subtitle="A daily reflection, 8 PM"
          toggle={notif.todaysReminder}
          onToggle={(v) => updateNotif({ todaysReminder: v })}
        />
        <SettingsRow
          icon={Flame}
          title="Streak reminder"
          subtitle="If your day's checklist is unfinished, 9:15 PM"
          toggle={notif.streak}
          onToggle={(v) => updateNotif({ streak: v })}
        />
      </SettingsSection>

      <SettingsSection heading="Weekly">
        <SettingsRow
          icon={Sparkle}
          title="Jumu'ah reminder"
          subtitle="Friday morning, 9:30 AM"
          toggle={notif.jumuah}
          onToggle={(v) => updateNotif({ jumuah: v })}
        />
      </SettingsSection>
    </div>
  );
}
