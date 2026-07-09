"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  HandHeart,
  Sunrise,
  Clock,
  Mic,
  BookOpen,
  ScrollText,
  Sparkles,
  Sun,
  Moon,
  Flame,
  Repeat,
  Sparkle,
  MessageCircle,
} from "lucide-react";
import {
  getNotificationPrefs,
  setNotificationPrefs,
  isRamadanActive,
  isLaylatulQadrSeason,
  type NotificationPrefs,
} from "@hidden-hiqmah/ui/lib/storage";
import { rescheduleNotificationsDebounced } from "@/lib/mobile/notifications";
import {
  SettingsSection,
  SettingsRow,
  SettingsExpandableRow,
} from "./SettingsUI";

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
        <SettingsRow
          icon={Mic}
          title="Iqamah call"
          subtitle="After Adhan"
          toggle={notif.iqamah}
          onToggle={(v) => updateNotif({ iqamah: v })}
        />
      </SettingsSection>

      <SettingsSection heading="Daily">
        <SettingsRow
          icon={BookOpen}
          title="Today's verse"
          toggle={notif.todaysVerse}
          onToggle={(v) => updateNotif({ todaysVerse: v })}
        />
        <SettingsRow
          icon={ScrollText}
          title="Today's hadith"
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
          icon={Sun}
          title="Morning adhkar"
          subtitle="After Fajr"
          toggle={notif.morningAdhkar}
          onToggle={(v) => updateNotif({ morningAdhkar: v })}
        />
        <SettingsRow
          icon={Moon}
          title="Evening adhkar"
          subtitle="After Asr"
          toggle={notif.eveningAdhkar}
          onToggle={(v) => updateNotif({ eveningAdhkar: v })}
        />
        <SettingsRow
          icon={Flame}
          title="Streak reminder"
          subtitle="If you miss a day"
          toggle={notif.streak}
          onToggle={(v) => updateNotif({ streak: v })}
        />
        <SettingsRow
          icon={Repeat}
          title="Dhikr reminders"
          subtitle={`Every ${notif.dhikrIntervalHours} hours`}
          toggle={notif.dhikrReminders}
          onToggle={(v) => updateNotif({ dhikrReminders: v })}
        />
      </SettingsSection>

      <SettingsSection heading="Weekly & Special">
        <SettingsRow
          icon={Sparkle}
          title="Jumu'ah reminder"
          subtitle="Friday morning"
          toggle={notif.jumuah}
          onToggle={(v) => updateNotif({ jumuah: v })}
        />
        <SettingsRow
          icon={Moon}
          title="Ramadan"
          badge={isRamadanActive() ? "Active" : "Off-season"}
          badgeTone={isRamadanActive() ? "gold" : "muted"}
          subtitle={
            isRamadanActive()
              ? "Suhoor, iftar, Tarawih"
              : "Auto-enables when Ramadan starts"
          }
          toggle={notif.ramadan}
          onToggle={(v) => updateNotif({ ramadan: v })}
        />
        <SettingsRow
          icon={Sparkle}
          title="Laylatul Qadr"
          badge={isLaylatulQadrSeason() ? "Active" : "Off-season"}
          badgeTone={isLaylatulQadrSeason() ? "gold" : "muted"}
          subtitle={
            isLaylatulQadrSeason()
              ? "Last 10 nights of Ramadan"
              : "Auto-enables in the last 10 nights of Ramadan"
          }
          toggle={notif.laylatulQadr}
          onToggle={(v) => updateNotif({ laylatulQadr: v })}
        />
      </SettingsSection>

      <SettingsSection heading="App">
        <SettingsRow
          icon={MessageCircle}
          title="AI Chat responses"
          subtitle="When long answers complete"
          toggle={notif.aiChatResponses}
          onToggle={(v) => updateNotif({ aiChatResponses: v })}
        />
        <SettingsRow
          icon={BookOpen}
          title="Continue reading reminder"
          subtitle="After 3+ days without reading"
          toggle={notif.continueReading}
          onToggle={(v) => updateNotif({ continueReading: v })}
        />
      </SettingsSection>
    </div>
  );
}
