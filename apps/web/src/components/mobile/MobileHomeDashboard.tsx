"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  BookOpen,
  Bookmark,
  ScrollText,
  Compass,
  Repeat,
  ArrowRight,
} from "lucide-react";
import { Geolocation } from "@capacitor/geolocation";
import chapters from "@hidden-hiqmah/content/quran/chapters.json";
import { getProgress } from "@hidden-hiqmah/ui/lib/storage";
import { reverseGeocode, formatLocation } from "@hidden-hiqmah/ui/lib/location";

type PrayerTimings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

type NextPrayer = {
  key: string;
  label: string;
  time: string;
  icon: typeof Sunrise;
};

const PRAYER_ICONS: Record<string, typeof Sunrise> = {
  Fajr: Sunrise,
  Dhuhr: CloudSun,
  Asr: CloudSun,
  Maghrib: Sunset,
  Isha: Moon,
};

function cleanTime(raw: string): string {
  return raw.replace(/\s*\(.*\)/, "");
}

function parsePrayerTime(raw: string): Date {
  const [h, m] = cleanTime(raw).split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatClockTime(raw: string): string {
  const [h, m] = cleanTime(raw).split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getNextPrayer(timings: PrayerTimings): NextPrayer | null {
  const now = new Date();
  const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
  for (const key of order) {
    const time = parsePrayerTime(timings[key]);
    if (time > now) {
      return { key, label: key, time: timings[key], icon: PRAYER_ICONS[key] };
    }
  }
  return { key: "Fajr", label: "Fajr (tomorrow)", time: timings.Fajr, icon: PRAYER_ICONS.Fajr };
}

function formatCountdown(toIso: string): string {
  const now = new Date();
  const target = parsePrayerTime(toIso);
  if (target < now) target.setDate(target.getDate() + 1);
  const diffMs = target.getTime() - now.getTime();
  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function MobileHomeDashboard() {
  return (
    <div className="mb-6 space-y-3">
      <NextPrayerCard />
      <ContinueReadingCard />
      <QuickActions />
    </div>
  );
}

export function NextPrayerCard() {
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [location, setLocation] = useState("");
  const [nextPrayer, setNextPrayerState] = useState<NextPrayer | null>(null);
  const [countdown, setCountdown] = useState("");
  const fetched = useRef(false);

  const fetchTimes = useCallback(async (city: string, country: string, display?: string) => {
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`
      );
      if (!res.ok) return;
      const data = await res.json();
      setTimings(data.data.timings);
      setLocation(display || `${city}, ${country}`);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    (async () => {
      try {
        const perm = await Geolocation.requestPermissions({ permissions: ["location"] });
        if (perm.location !== "granted") {
          fetchTimes("Makkah", "Saudi Arabia");
          return;
        }
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60_000,
        });
        const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (geo) {
          fetchTimes(geo.city || "Makkah", geo.countryName || "Saudi Arabia", formatLocation(geo));
        } else {
          fetchTimes("Makkah", "Saudi Arabia");
        }
      } catch {
        fetchTimes("Makkah", "Saudi Arabia");
      }
    })();
  }, [fetchTimes]);

  useEffect(() => {
    if (!timings) return;
    const tick = () => {
      const np = getNextPrayer(timings);
      setNextPrayerState(np);
      if (np) setCountdown(formatCountdown(np.time));
    };
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [timings]);

  if (!timings || !nextPrayer) {
    return (
      <Link
        href="/salah?tab=times"
        className="block card-bg rounded-2xl border sidebar-border p-4 touch-manipulation"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
            <Sunrise size={18} className="text-gold/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-themed-muted">Prayer Times</p>
            <p className="text-sm text-themed-muted">Loading…</p>
          </div>
          <ArrowRight size={16} className="text-themed-muted" />
        </div>
      </Link>
    );
  }

  const Icon = nextPrayer.icon;
  const hijri = formatHijriDate();
  const gregorian = formatGregorianDate();
  const allPrayers: { key: keyof PrayerTimings; label: string }[] = [
    { key: "Fajr", label: "Fajr" },
    { key: "Sunrise", label: "Sunrise" },
    { key: "Dhuhr", label: "Dhuhr" },
    { key: "Asr", label: "Asr" },
    { key: "Maghrib", label: "Maghrib" },
    { key: "Isha", label: "Isha" },
  ];

  return (
    <Link
      href="/salah?tab=times"
      className="block card-bg rounded-2xl border sidebar-border p-5 touch-manipulation relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/8 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted truncate">
            {hijri}
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted">
            {gregorian}
          </p>
        </div>
        <p className="text-xs text-themed-muted mb-4 truncate">
          {location || "Next prayer"}
        </p>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
            <Icon size={26} className="text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-3xl font-bold text-themed leading-none">
              {nextPrayer.label.split(" ")[0]}
            </p>
            <p className="text-sm text-gold mt-1">
              in {countdown} · at {formatClockTime(nextPrayer.time)}
            </p>
          </div>
        </div>

        <div className="h-px bg-white/10 my-4" />

        <div className="space-y-1.5">
          {allPrayers.map(({ key, label }) => {
            const isNext = nextPrayer.key === key;
            return (
              <div
                key={key}
                className={`flex items-center justify-between text-sm ${
                  isNext ? "text-gold font-semibold" : "text-themed-muted"
                }`}
              >
                <span>{label}</span>
                <span className="font-mono tabular-nums">
                  {formatClockTime(timings[key])}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

function formatHijriDate(): string {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(new Date());
    const day = parts.find((p) => p.type === "day")?.value ?? "";
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const year = parts.find((p) => p.type === "year")?.value ?? "";
    return `${day} ${month} ${year} AH`;
  } catch {
    return "";
  }
}

function formatGregorianDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date());
}

export function ContinueReadingCard() {
  const [progress, setProgress] = useState<ReturnType<typeof getProgress> | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!progress || !progress.lastSurah) return null;

  const chapter = chapters.find((c) => c.id === progress.lastSurah);
  if (!chapter) return null;

  const href = progress.lastVerse
    ? `/quran/${chapter.id}?v=${progress.lastVerse}`
    : `/quran/${chapter.id}`;
  const subtitle = progress.lastVerse
    ? `Verse ${progress.lastVerse} · ${chapter.verses} total`
    : `${chapter.verses} verses`;

  return (
    <Link
      href={href}
      className="block card-bg rounded-2xl border sidebar-border p-4 touch-manipulation"
    >
      <div className="flex items-center gap-2 text-themed-muted text-xs uppercase tracking-wider mb-1">
        <BookOpen size={14} className="text-gold" />
        <span>Continue</span>
      </div>
      <p className="text-lg font-bold text-themed leading-tight truncate">
        {chapter.name}
      </p>
      <p className="text-xs text-themed-muted mt-1 truncate">{subtitle}</p>
    </Link>
  );
}

const QUICK_LINKS = [
  { href: "/salah?tab=qiblah", icon: Compass, label: "Qiblah" },
  { href: "/hadith", icon: ScrollText, label: "Hadith" },
  { href: "/dhikr", icon: Repeat, label: "Dhikr" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {QUICK_LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="card-bg rounded-2xl border sidebar-border py-3 flex flex-col items-center gap-1 touch-manipulation"
          >
            <Icon size={20} className="text-gold" />
            <span className="text-[11px] font-medium text-themed">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
