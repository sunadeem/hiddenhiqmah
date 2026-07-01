"use client";

import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Palette,
  Volume2,
  Database,
  Type,
  Mic,
  MapPin,
  Calculator,
  Sunrise,
  Trash2,
  Shield,
  BookOpen,
  ScrollText,
  Moon,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import HomeStylePicker from "../home/HomeStylePicker";
import TunedForPicker from "../home/TunedForPicker";
import { SettingsSection, SettingsRow, SettingsRowSelect } from "./SettingsUI";
import { useTheme } from "@hidden-hiqmah/ui/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useIsNative } from "@/lib/mobile/platform";
import {
  getFontSize,
  setFontSize,
  getAutoPlayNextSurah,
  setAutoPlayNextSurah,
  getPrayerSettings,
  setPrayerSettings,
  getHomePrefs,
  setHomePrefs,
  clearAllLocalData,
  type PrayerSettings,
  type AsrMethod,
  type HomePrefs,
} from "@hidden-hiqmah/ui/lib/storage";
import { getCachedLocation, getLocationState } from "@hidden-hiqmah/ui/lib/location-cache";

const FEEDBACK_EMAIL = "Subhan.Nadeem@HiddenHiqmah.com";

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

const FONT_SIZE_LABELS = ["Small", "Medium", "Large", "Extra Large"];

export default function SettingsScreen() {
  const { isDark, toggleDarkMode } = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const isNative = useIsNative();
  const [hydrated, setHydrated] = useState(false);
  const [fontSize, setFontSizeState] = useState(2);
  const [autoPlay, setAutoPlayState] = useState(false);
  const [prayer, setPrayer] = useState<PrayerSettings | null>(null);
  const [home, setHomeState] = useState<HomePrefs | null>(null);
  const [loc, setLoc] = useState<{ label: string; sub: string }>({
    label: "Auto-detect",
    sub: "Auto-detected from your device",
  });

  useEffect(() => {
    setFontSizeState(getFontSize());
    setAutoPlayState(getAutoPlayNextSurah());
    setPrayer(getPrayerSettings());
    setHomeState(getHomePrefs());
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

  const updateHome = (patch: Partial<HomePrefs>) => {
    setHomePrefs(patch);
    setHomeState((h) => (h ? { ...h, ...patch } : h));
  };

  const updatePrayer = (patch: Partial<PrayerSettings>) => {
    setPrayerSettings(patch);
    setPrayer((p) => (p ? { ...p, ...patch } : p));
  };

  if (!hydrated || !prayer || !home) {
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

      {/* HOME — mobile-home only (the web home is a fixed grid) */}
      {isNative && (
        <>
          <SettingsSection heading="Home">
            <SettingsRow
              icon={Moon}
              title="Ramadan home"
              subtitle={
                home.ramadanAuto
                  ? "On — showing the festive Ramadan home"
                  : "Turn on to use the festive Ramadan home"
              }
              toggle={home.ramadanAuto}
              onToggle={(v) => updateHome({ ramadanAuto: v })}
            />
          </SettingsSection>

          <div>
            <p className="text-[11px] font-semibold text-themed-muted/80 uppercase tracking-wider px-2 mb-2">
              Home style
            </p>
            <HomeStylePicker
              value={home.homeStyle}
              tunedFor={home.tunedFor}
              ramadanAuto={home.ramadanAuto}
              onChange={(v) => updateHome({ homeStyle: v })}
              onToggleRamadan={(on) => updateHome({ ramadanAuto: on })}
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold text-themed-muted/80 uppercase tracking-wider px-2 mb-2">
              Home Page tuned for
            </p>
            <TunedForPicker
              value={home.tunedFor}
              onChange={(v) => updateHome({ tunedFor: v })}
            />
            <p className="text-xs text-themed-muted mt-2 px-2 leading-relaxed">
              Shapes your Daily Path order (and the Focus home&apos;s suggested act) around
              what matters most to you right now.
            </p>
          </div>
        </>
      )}

      {/* READING & AUDIO */}
      <SettingsSection heading="Reading & Audio">
        <SettingsRow
          icon={Palette}
          title="Theme"
          toggle={isDark}
          onToggle={toggleDarkMode}
          rightValue={isDark ? "Dark" : "Light"}
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

      {/* DATA & PRIVACY */}
      <SettingsSection heading="Data & Privacy">
        <SettingsRow
          icon={Shield}
          title="Privacy"
          rightChevron
          href="/privacy"
        />
        <SettingsRow
          icon={ScrollText}
          title="Credits & Sources"
          rightChevron
          href="/credits"
        />
        <SettingsRow
          icon={Trash2}
          title="Clear local data"
          subtitle="Bookmarks, streaks, settings — all reset"
          danger
          onClick={() => {
            if (
              confirm(
                "Clear all local data? Bookmarks, streaks, reading progress, and settings will be erased. This cannot be undone."
              )
            ) {
              clearAllLocalData();
              window.location.reload();
            }
          }}
        />
      </SettingsSection>

      {/* ACCOUNT */}
      <SettingsSection heading="Account">
        {authLoading ? (
          <SettingsRow icon={User} title="Loading..." disabled />
        ) : user ? (
          <>
            <SettingsRow
              icon={User}
              title={user.email || "Signed in"}
              subtitle="Signed in"
              rightValue="Active"
            />
            <SettingsRow
              icon={Database}
              title="Sign out"
              onClick={async () => {
                await signOut();
              }}
              danger
            />
          </>
        ) : (
          <SettingsRow
            icon={User}
            title="Sign in"
            subtitle="More Ask Hiqmah questions · sync across devices"
            rightChevron
            href="/signin"
          />
        )}
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
        className="block card-bg rounded-2xl border sidebar-border p-5 touch-manipulation active:bg-white/5"
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

