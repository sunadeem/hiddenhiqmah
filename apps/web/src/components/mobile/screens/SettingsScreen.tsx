"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  Bell,
  Palette,
  Volume2,
  Type,
  Mic,
  MapPin,
  Calculator,
  Sunrise,
  BookOpen,
  Home,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import { SettingsSection, SettingsRow, SettingsRowSelect } from "./SettingsUI";
import { useTheme } from "@hidden-hiqmah/ui/context/ThemeContext";
import { useIsNative } from "@/lib/mobile/platform";
import {
  getFontSize,
  setFontSize,
  getAutoPlayNextSurah,
  setAutoPlayNextSurah,
  getPrayerSettings,
  setPrayerSettings,
  type PrayerSettings,
  type AsrMethod,
} from "@hidden-hiqmah/ui/lib/storage";
import { getCachedLocation, getLocationState } from "@hidden-hiqmah/ui/lib/location-cache";
import { rescheduleNotificationsDebounced } from "@/lib/mobile/notifications";

const FEEDBACK_EMAIL = "support@hiddenhiqmah.com";

const CALC_METHODS: { value: number; label: string }[] = [
  { value: 2, label: "Islamic Society of North America (ISNA)" },
  { value: 3, label: "Muslim World League" },
  { value: 4, label: "Umm Al-Qura, Makkah" },
  { value: 5, label: "Egyptian General Authority" },
  { value: 1, label: "University of Islamic Sciences, Karachi" },
  { value: 7, label: "Institute of Geophysics, Tehran" },
  { value: 8, label: "Gulf Region" },
  { value: 9, label: "Kuwait" },
  { value: 10, label: "Qatar" },
  { value: 11, label: "Singapore" },
  { value: 13, label: "Diyanet (Turkey)" },
  { value: 15, label: "Moonsighting Committee Worldwide" },
];

// Indexes match the Quran readers' size scales (AR_SIZES / fontSizeClasses) —
// add a step here only alongside one there, or the extra option renders nothing.
const FONT_SIZE_LABELS = ["Small", "Medium", "Large", "Extra Large", "Huge"];

export default function SettingsScreen() {
  const { theme } = useTheme();
  const isNative = useIsNative();
  const searchParams = useSearchParams();
  const router = useRouter();
  const section = searchParams.get("section");
  const [hydrated, setHydrated] = useState(false);
  const [fontSize, setFontSizeState] = useState(2);
  const [autoPlay, setAutoPlayState] = useState(false);
  const [prayer, setPrayer] = useState<PrayerSettings | null>(null);
  const [loc, setLoc] = useState<{ label: string; sub: string }>({
    label: "Auto-detect",
    sub: "Auto-detected from your device",
  });

  useEffect(() => {
    setFontSizeState(getFontSize());
    setAutoPlayState(getAutoPlayNextSurah());
    setPrayer(getPrayerSettings());
    // Location is auto-detected app-wide (NextPrayerCard / Salah / Prayer Times
    // all read the same cache). Surface that here read-only — there's no manual
    // location entry, so we don't imply one.
    if (getLocationState() === "denied") {
      setLoc({ label: "Off", sub: "Turn on location in your device settings" });
    } else {
      const c = getCachedLocation();
      if (c?.display) setLoc({ label: c.display, sub: "Auto-detected from your device" });
    }
    setHydrated(true);
  }, []);

  // Legacy deep-link from the Home "Tuned for" chip (/settings?section=tuned-for):
  // the Home personalization controls now live on their own nested page, so
  // forward to it (replace so Back returns to Home, not this intermediate). (HOME-3)
  useEffect(() => {
    if (section === "tuned-for") {
      router.replace("/settings/home?section=tuned-for");
    }
  }, [section, router]);

  const updatePrayer = (patch: Partial<PrayerSettings>) => {
    setPrayerSettings(patch);
    setPrayer((p) => (p ? { ...p, ...patch } : p));
    // A calc-method / Asr change moves the prayer times, so re-schedule the
    // rolling adhan notifications now (no-op on web / without permission) —
    // otherwise old-method adhans keep firing until the next cold start.
    rescheduleNotificationsDebounced(false);
  };

  if (!hydrated || !prayer) {
    return (
      <div className="space-y-3 pb-4">
        <p className="text-center text-themed-muted text-sm py-12">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6 max-w-xl mx-auto w-full">
      {/* Header (this screen doesn't get MobileTopBar title) */}
      <div className="text-center pt-1">
        <h1 className="text-2xl font-bold text-themed">Settings</h1>
      </div>

      {/* PRAYER & NOTIFICATIONS (notifications are native-only) */}
      <SettingsSection heading={isNative ? "Prayer & Notifications" : "Prayer"}>
        {isNative && (
          <SettingsRow
            icon={Bell}
            title="Notification settings"
            subtitle="Prayer alerts, daily reminders, special occasions"
            rightChevron
            href="/settings/notifications"
          />
        )}
        <SettingsRow
          icon={MapPin}
          title="Location"
          subtitle={loc.sub}
          rightValue={loc.label}
        />
        <SettingsRowSelect
          icon={Calculator}
          title="Calculation method"
          value={prayer.calcMethod}
          options={CALC_METHODS.map((m) => ({ value: m.value, label: m.label }))}
          onChange={(v) =>
            updatePrayer({ calcMethod: Number(v) as PrayerSettings["calcMethod"] })
          }
        />
        <SettingsRowSelect
          icon={Sunrise}
          title="Asr time"
          value={prayer.asrMethod}
          options={[
            { value: "standard", label: "Standard (Shafi'i)" },
            { value: "hanafi", label: "Hanafi (later)" },
          ]}
          onChange={(v) => updatePrayer({ asrMethod: v as AsrMethod })}
        />
      </SettingsSection>

      {/* HOME — mobile-home personalization lives on its own nested page (the web
          home is a fixed grid, so this only surfaces on native). */}
      {isNative && (
        <SettingsSection heading="Home">
          <SettingsRow
            icon={Home}
            title="Home screen"
            subtitle="Ramadan home, layout, and what it's tuned for"
            rightChevron
            href="/settings/home"
          />
        </SettingsSection>
      )}

      {/* READING & AUDIO */}
      <SettingsSection heading="Reading & Audio">
        <SettingsRow
          icon={Palette}
          title="Theme"
          rightValue={theme.name}
          rightChevron
          href="/settings/appearance"
        />
        <SettingsRowSelect
          icon={Type}
          title="Quran font size"
          value={fontSize}
          options={FONT_SIZE_LABELS.map((label, i) => ({
            value: i,
            label,
          }))}
          onChange={(v) => {
            const n = Number(v);
            setFontSize(n);
            setFontSizeState(n);
          }}
        />
        <SettingsRow
          icon={Mic}
          title="Reciter"
          rightValue="Mishari al-Afasy"
          disabled
          comingSoon
        />
        <SettingsRow
          icon={BookOpen}
          title="Auto-play next surah"
          toggle={autoPlay}
          onToggle={(v) => {
            setAutoPlayNextSurah(v);
            setAutoPlayState(v);
          }}
        />
        <SettingsRow
          icon={Volume2}
          title="Adhan & Iqamah"
          subtitle="Read the call to prayer"
          href="/salah?tab=adhan"
          rightChevron
        />
      </SettingsSection>

      {/* ACCOUNT — account, data & privacy live on their own nested page. */}
      <SettingsSection heading="Account">
        <SettingsRow
          icon={User}
          title="Account"
          subtitle="Profile, sign in, data & privacy"
          rightChevron
          href="/settings/account"
        />
      </SettingsSection>

      {/* ABOUT — mobile only; web keeps just the feedback card below */}
      {isNative && (
      <SettingsSection heading="About">
        <div className="block card-bg p-5 text-center">
          <p className="text-gold/70 font-arabic text-lg mb-2">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <h2 className="text-2xl font-bold text-themed font-display tracking-wide mb-1">
            Hidden Hiqmah
          </h2>
          <p className="text-sm text-themed-muted font-cursive">Hidden Wisdom</p>
          <div className="mt-3 mx-auto h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
          <p className="text-themed-muted mt-3 text-xs leading-relaxed">
            Explore Islam through authentic sources — the Quran, Sunnah, and
            scholarly tradition.
          </p>
        </div>
        <SettingsRow icon={Bookmark} title="Version 0.1.0" disabled />
      </SettingsSection>
      )}

      {/* FEEDBACK — final card, end of the app */}
      <a
        href={`mailto:${FEEDBACK_EMAIL}?subject=Hidden%20Hiqmah%20feedback`}
        className="block card-bg rounded-2xl border sidebar-border p-5 touch-manipulation active:bg-[var(--overlay-subtle)]"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
            <MessageCircle size={18} className="text-gold" />
          </div>
          <div>
            <p className="text-sm font-semibold text-themed leading-tight">
              Got feedback?
            </p>
            <p className="text-xs text-themed-muted mt-0.5">
              Suggestions, bugs, requests — anything
            </p>
          </div>
        </div>
        <p className="text-xs text-gold/80 break-all">{FEEDBACK_EMAIL}</p>
      </a>
    </div>
  );
}
