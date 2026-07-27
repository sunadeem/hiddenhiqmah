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
  MoonStar,
  Moon,
  MessageSquare,
  Heart,
  BellRing,
} from "lucide-react";
import {
  getNotificationPrefs,
  setNotificationPrefs,
  type NotificationPrefs,
} from "@hidden-hiqmah/ui/lib/storage";
import { rescheduleNotificationsDebounced } from "@/lib/mobile/notifications";
import { markPushPrefsDirty } from "@/lib/mobile/push";
import { supabase } from "@/lib/supabase";
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
    // The three remote-push prefs are per-USER (profiles columns) while
    // localStorage is per-DEVICE, so on a reinstall or a second device the local
    // blob is empty and the switches would render defaults that contradict what
    // the server actually has — showing "on" for a push the user silenced (or
    // "off" while circle pushes keep arriving). Hydrate the authoritative values
    // once; stay on the local ones if signed out or offline.
    void (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const { data, error } = await supabase
          .from("profiles")
          .select("dua_push, reengagement_push, circle_push")
          .eq("id", session.user.id)
          .maybeSingle();
        if (error || !data) return;
        const row = data as {
          dua_push: boolean | null;
          reengagement_push: boolean | null;
          circle_push: boolean | null;
        };
        const patch: Partial<NotificationPrefs> = {};
        if (typeof row.dua_push === "boolean") patch.duaPush = row.dua_push;
        if (typeof row.reengagement_push === "boolean")
          patch.reengagementPush = row.reengagement_push;
        if (typeof row.circle_push === "boolean") patch.circleChat = row.circle_push;
        if (Object.keys(patch).length) {
          setNotificationPrefs(patch);
          setNotif((n) => (n ? { ...n, ...patch } : n));
        }
      } catch {
        /* offline — the local prefs already rendered */
      }
    })();
  }, []);

  const updateNotif = (patch: Partial<NotificationPrefs>) => {
    setNotificationPrefs(patch);
    setNotif((n) => (n ? { ...n, ...patch } : n));
    // Re-schedule local notifications; prompts for OS permission the first time.
    rescheduleNotificationsDebounced(true);
  };

  // The three REMOTE (APNs) preferences live on the server — profiles.circle_push
  // / dua_push / reengagement_push — because the send routes read those columns,
  // not this device's localStorage. So each toggle writes locally AND mirrors to
  // the server.
  //
  // supabase.rpc() does NOT throw: postgrest-js resolves errors as `{ error }`,
  // so a try/catch here would never fire and a failed write would be silently
  // lost. That matters most for the opt-OUT flags: a signed-out user (this screen
  // is not auth-gated, and mobile is a soft gate) toggling "Weekly duʿā" off hits
  // the RPC's `not authenticated` exception, and would otherwise keep receiving a
  // push they explicitly declined. So we check `error` and, on failure, mark the
  // prefs dirty — push.ts re-asserts them on the next foreground / after sign-in.
  const syncRemotePref = (fn: string, enabled: boolean) => {
    void (async () => {
      try {
        const { error } = await supabase.rpc(fn, { p_enabled: enabled });
        if (error) markPushPrefsDirty();
      } catch {
        markPushPrefsDirty(); // network threw before postgrest could answer
      }
    })();
  };

  const updateCircleChat = (v: boolean) => {
    updateNotif({ circleChat: v });
    syncRemotePref("set_my_circle_push", v);
  };

  // The two server-sent pushes from migration 030: the weekly duʿā and the
  // re-engagement nudge. Both are opt-OUT (default on). The on-device scheduler
  // doesn't know these keys, so the reschedule updateNotif triggers is a harmless
  // no-op — the server column is what actually silences the push.
  const updateDuaPush = (v: boolean) => {
    updateNotif({ duaPush: v });
    syncRemotePref("set_my_dua_push", v);
  };

  const updateReengagementPush = (v: boolean) => {
    updateNotif({ reengagementPush: v });
    syncRemotePref("set_my_reengagement_push", v);
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

      <SettingsSection heading="Circles">
        <SettingsRow
          icon={MessageSquare}
          title="Chat messages"
          subtitle="Get notified when someone posts in your circles."
          toggle={notif.circleChat === true}
          onToggle={(v) => updateCircleChat(v)}
        />
      </SettingsSection>

      {/* Server-sent (APNs) pushes — these come from Hiqmah's backend, not the
          on-device scheduler, so their real switch is the profiles column each
          toggle syncs. Times are the cron's (14:00/15:00 UTC), not local. */}
      <SettingsSection heading="From Hiqmah">
        <SettingsRow
          icon={Heart}
          title="Weekly duʿā"
          // No time-of-day claim: the send is a fixed 14:00 UTC (migration 030),
          // which is morning in the Americas but afternoon/evening elsewhere.
          // If that cron ever moves to a local hour, say so here too.
          subtitle="A duʿā every Wednesday"
          toggle={notif.duaPush !== false}
          onToggle={(v) => updateDuaPush(v)}
        />
        <SettingsRow
          icon={BellRing}
          title="Check-in nudges"
          subtitle="Only if you've been away from the app for a few days"
          toggle={notif.reengagementPush !== false}
          onToggle={(v) => updateReengagementPush(v)}
        />
      </SettingsSection>

      {/* Calendar-based occasions, computed on-device from the Hijri calendar
          (lib/mobile/islamic-events.ts) — no location or network needed. */}
      <SettingsSection heading="Islamic events">
        <SettingsRow
          icon={MoonStar}
          title="Events & occasions"
          subtitle="Ramadan, ʿĀshūrāʾ, the last 10 nights, Dhul-Ḥijjah, Arafah & the two Eids"
          toggle={notif.islamicEvents !== false}
          onToggle={(v) => updateNotif({ islamicEvents: v })}
        />
        <SettingsRow
          icon={Moon}
          title="White Days fasting"
          subtitle="A monthly nudge — the Prophet ﷺ encouraged fasting the 13th–15th of each month"
          toggle={notif.whiteDays !== false}
          onToggle={(v) => updateNotif({ whiteDays: v })}
        />
      </SettingsSection>
    </div>
  );
}
