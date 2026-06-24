"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Sparkles,
  Bell,
  Palette,
  Volume2,
  Sun,
  HandHeart,
  Database,
  Info,
  ChevronRight,
  ChevronDown,
  Type,
  Mic,
  Clock,
  MapPin,
  Calculator,
  Sunrise,
  Download,
  Trash2,
  Shield,
  BookOpen,
  ScrollText,
  Moon,
  Sparkle,
  Repeat,
  Flame,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import HomeStylePicker from "../home/HomeStylePicker";
import TunedForPicker from "../home/TunedForPicker";
import { useTheme } from "@hidden-hiqmah/ui/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { rescheduleNotificationsDebounced } from "@/lib/mobile/notifications";
import { hapticLight } from "@/lib/mobile/haptics";
import {
  getFontSize,
  setFontSize,
  getAutoPlayNextSurah,
  setAutoPlayNextSurah,
  getNotificationPrefs,
  setNotificationPrefs,
  getPrayerSettings,
  setPrayerSettings,
  getHomePrefs,
  setHomePrefs,
  clearAllLocalData,
  exportBookmarksJSON,
  isRamadanActive,
  isLaylatulQadrSeason,
  type NotificationPrefs,
  type PrayerSettings,
  type AsrMethod,
  type HomePrefs,
} from "@hidden-hiqmah/ui/lib/storage";

const FEEDBACK_EMAIL = "subhan.s.nadeem@gmail.com";

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
  const [hydrated, setHydrated] = useState(false);
  const [fontSize, setFontSizeState] = useState(2);
  const [autoPlay, setAutoPlayState] = useState(false);
  const [notif, setNotif] = useState<NotificationPrefs | null>(null);
  const [prayer, setPrayer] = useState<PrayerSettings | null>(null);
  const [home, setHomeState] = useState<HomePrefs | null>(null);
  const [adhanExpanded, setAdhanExpanded] = useState(false);

  useEffect(() => {
    setFontSizeState(getFontSize());
    setAutoPlayState(getAutoPlayNextSurah());
    setNotif(getNotificationPrefs());
    setPrayer(getPrayerSettings());
    setHomeState(getHomePrefs());
    setHydrated(true);
  }, []);

  const updateHome = (patch: Partial<HomePrefs>) => {
    setHomePrefs(patch);
    setHomeState((h) => (h ? { ...h, ...patch } : h));
  };

  const updateNotif = (patch: Partial<NotificationPrefs>) => {
    setNotificationPrefs(patch);
    setNotif((n) => (n ? { ...n, ...patch } : n));
    // Re-schedule local notifications. Prompts for OS permission the first
    // time (undetermined) since the user is actively enabling notifications.
    rescheduleNotificationsDebounced(true);
  };

  const updatePrayer = (patch: Partial<PrayerSettings>) => {
    setPrayerSettings(patch);
    setPrayer((p) => (p ? { ...p, ...patch } : p));
  };

  if (!hydrated || !notif || !prayer || !home) {
    return (
      <div className="space-y-3 pb-4">
        <p className="text-center text-themed-muted text-sm py-12">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header (this screen doesn't get MobileTopBar title) */}
      <div className="text-center pt-1">
        <h1 className="text-2xl font-bold text-themed">Settings</h1>
      </div>

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
            subtitle="+5 bonus questions today · sync coming soon"
            rightChevron
            href="/signin"
          />
        )}
      </SettingsSection>

      {/* PLAN */}
      <SettingsSection heading="Plan">
        <SettingsRow
          icon={Sparkles}
          title="Hiqmah Plus"
          subtitle="Unlimited AI Chat · all reciters · offline mode"
          rightChevron
          disabled
          comingSoon
        />
      </SettingsSection>

      {/* NOTIFICATIONS */}
      <SettingsSection heading="Notifications · Prayer">
        <SettingsExpandableRow
          icon={HandHeart}
          title="Adhan at prayer time"
          expanded={adhanExpanded}
          onToggleExpand={() => setAdhanExpanded((v) => !v)}
          toggle={notif.adhanEnabled}
          onToggle={(v) =>
            updateNotif({
              adhanEnabled: v,
              // Propagate master toggle to all per-prayer toggles
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
          <div className="bg-white/5 border-t sidebar-border">
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

      <SettingsSection heading="Notifications · Daily">
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

      <SettingsSection heading="Notifications · Weekly & Special">
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

      <SettingsSection heading="Notifications · App">
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

      {/* HOME */}
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

      <SettingsSection heading="Ramadan">
        <SettingsRow
          icon={Moon}
          title="Ramadan home"
          subtitle={
            isRamadanActive()
              ? "Active now — Ramadan home is showing"
              : "Auto-activates during Ramadan (Hijri month 9)"
          }
          toggle={home.ramadanAuto}
          onToggle={(v) => updateHome({ ramadanAuto: v })}
        />
      </SettingsSection>

      <div>
        <p className="text-[11px] font-semibold text-themed-muted/80 uppercase tracking-wider px-2 mb-2">
          Tuned for
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

      {/* CUSTOMIZE */}
      <SettingsSection heading="Customize">
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
      </SettingsSection>

      {/* AUDIO */}
      <SettingsSection heading="Audio">
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

      {/* PRAYER */}
      <SettingsSection heading="Prayer">
        <SettingsRow
          icon={MapPin}
          title="Location"
          rightValue={prayer.locationMode === "auto" ? "Auto-detect" : "Manual"}
          rightChevron
          disabled
          comingSoon
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

      {/* DATA */}
      <SettingsSection heading="Data">
        <SettingsRow
          icon={Download}
          title="Export bookmarks"
          subtitle="Download as JSON"
          onClick={() => {
            const blob = new Blob([exportBookmarksJSON()], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `hidden-hiqmah-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
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
      </SettingsSection>

      {/* ABOUT */}
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

/* ──────────────────────────────────────────────────────────────── */
/* Building blocks                                                  */
/* ──────────────────────────────────────────────────────────────── */

function SettingsSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-themed-muted/80 uppercase tracking-wider px-2 mb-2">
        {heading}
      </p>
      <SectionShell>{children}</SectionShell>
    </div>
  );
}

function SectionShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="card-bg rounded-2xl border sidebar-border overflow-hidden divide-y divide-white/5">
      {children}
    </div>
  );
}

type RowProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle?: string;
  rightValue?: string;
  rightChevron?: boolean;
  toggle?: boolean;
  onToggle?: (v: boolean) => void;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  danger?: boolean;
  indent?: boolean;
  badge?: string;
  badgeTone?: "gold" | "muted";
};

function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  rightValue,
  rightChevron,
  toggle,
  onToggle,
  href,
  onClick,
  disabled,
  comingSoon,
  danger,
  indent,
  badge,
  badgeTone = "gold",
}: RowProps) {
  const content = (
    <div
      className={`flex items-center gap-3 px-3 py-3 ${indent ? "pl-12" : ""} ${
        disabled && !comingSoon ? "opacity-60" : ""
      } ${danger ? "text-red-400" : ""}`}
    >
      <div
        className={`w-9 h-9 rounded-lg ${
          danger
            ? "bg-red-500/15"
            : "bg-[var(--color-gold)]/15"
        } flex items-center justify-center shrink-0`}
      >
        <Icon size={17} className={danger ? "text-red-400" : "text-gold"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-semibold ${
              danger ? "text-red-400" : "text-themed"
            } leading-tight`}
          >
            {title}
          </p>
          {comingSoon && (
            <span className="text-[9px] uppercase tracking-wider text-themed-muted bg-white/5 px-1.5 py-0.5 rounded">
              Soon
            </span>
          )}
          {badge && (
            <span
              className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                badgeTone === "gold"
                  ? "text-gold bg-[var(--color-gold)]/15"
                  : "text-themed-muted bg-white/5"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-themed-muted leading-snug mt-0.5">{subtitle}</p>
        )}
      </div>
      {rightValue && (
        <span className="text-xs text-themed-muted shrink-0 max-w-[40%] text-right truncate">
          {rightValue}
        </span>
      )}
      {toggle !== undefined && onToggle && (
        <Toggle value={toggle} onChange={onToggle} disabled={disabled} />
      )}
      {rightChevron && (
        <ChevronRight size={16} className="text-themed-muted shrink-0" />
      )}
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="touch-manipulation active:bg-white/5 block">
        {content}
      </Link>
    );
  }
  if (onClick && !disabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="touch-manipulation active:bg-white/5 block w-full text-left"
      >
        {content}
      </button>
    );
  }
  return content;
}

function SettingsExpandableRow({
  icon: Icon,
  title,
  expanded,
  onToggleExpand,
  toggle,
  onToggle,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  expanded: boolean;
  onToggleExpand: () => void;
  toggle: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 touch-manipulation">
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-9 h-9 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0"
      >
        <Icon size={17} className="text-gold" />
      </button>
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex-1 min-w-0 text-left"
      >
        <p className="text-sm font-semibold text-themed leading-tight">{title}</p>
      </button>
      <button
        type="button"
        onClick={onToggleExpand}
        className="p-1 text-themed-muted"
        aria-label={expanded ? "Collapse" : "Expand"}
      >
        <ChevronDown
          size={16}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <Toggle value={toggle} onChange={onToggle} />
    </div>
  );
}

function SettingsRowSelect({
  icon: Icon,
  title,
  value,
  options,
  onChange,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <div className="w-9 h-9 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
        <Icon size={17} className="text-gold" />
      </div>
      <p className="text-sm font-semibold text-themed flex-1 min-w-0 leading-tight">
        {title}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs text-themed bg-transparent border sidebar-border rounded-lg px-2 py-1.5 max-w-[55%] focus:outline-none focus:border-[var(--color-gold)]/40"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        hapticLight();
        onChange(!value);
      }}
      disabled={disabled}
      role="switch"
      aria-checked={value}
      className={`relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors touch-manipulation ${
        value ? "bg-[var(--color-gold)]" : "bg-white/15"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          value ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
