"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sunrise, Sun, CloudSun, Sunset, Moon, MapPin, Search, LocateFixed } from "lucide-react";

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const PRAYERS = [
  { key: "Fajr", label: "Fajr", icon: Sunrise, isPrayer: true },
  { key: "Sunrise", label: "Sunrise", icon: Sun, isPrayer: false },
  { key: "Dhuhr", label: "Dhuhr", icon: CloudSun, isPrayer: true },
  { key: "Asr", label: "Asr", icon: CloudSun, isPrayer: true },
  { key: "Maghrib", label: "Maghrib", icon: Sunset, isPrayer: true },
  { key: "Isha", label: "Isha", icon: Moon, isPrayer: true },
] as const;

function formatTime(raw: string): string {
  const clean = raw.replace(/\s*\(.*\)/, "");
  const [h, m] = clean.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getNextPrayerKey(timings: PrayerTimings): string | null {
  const now = new Date();
  const keys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
  for (const key of keys) {
    const raw = timings[key];
    if (!raw) continue;
    const clean = raw.replace(/\s*\(.*\)/, "");
    const [h, m] = clean.split(":").map(Number);
    const t = new Date();
    t.setHours(h, m, 0, 0);
    if (t > now) return key;
  }
  return "Fajr";
}

export default function PrayerTimesWidget() {
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [locating, setLocating] = useState(false);
  const fetched = useRef(false);

  const fetchTimes = useCallback(async (city: string, country: string) => {
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`
      );
      if (!res.ok) return;
      const data = await res.json();
      setTimings(data.data.timings);
      setLocation(`${city}, ${country}`);
    } catch {
      // silently fail
    }
  }, []);

  const autoLocate = useCallback(async () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}`
          );
          const geo = await geoRes.json();
          const city = geo.city || geo.locality || "Makkah";
          const country = geo.countryName || "Saudi Arabia";
          fetchTimes(city, country);
        } catch {
          fetchTimes("Makkah", "Saudi Arabia");
        }
        setLocating(false);
      },
      () => {
        fetchTimes("Makkah", "Saudi Arabia");
        setLocating(false);
      },
      { timeout: 5000 }
    );
  }, [fetchTimes]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    if (!navigator.geolocation) {
      fetchTimes("Makkah", "Saudi Arabia");
      return;
    }

    autoLocate();
  }, [fetchTimes, autoLocate]);

  // Update next prayer every minute
  useEffect(() => {
    if (!timings) return;
    const update = () => setNextPrayer(getNextPrayerKey(timings));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [timings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCity.trim()) return;
    fetchTimes(searchCity.trim(), searchCountry.trim() || "auto");
    setShowSearch(false);
    setSearchCity("");
    setSearchCountry("");
  };

  if (!timings) {
    return (
      <div className="card-bg rounded-xl border sidebar-border p-4 w-full sm:w-[320px] animate-pulse">
        <div className="h-4 w-24 bg-[var(--color-gold)]/10 rounded mb-3" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-[var(--color-gold)]/5 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-bg rounded-xl border sidebar-border p-4 w-full sm:w-[320px]">
      {/* Location header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={13} className="text-gold shrink-0" />
          <p className="text-xs text-themed-muted truncate">{location}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              autoLocate();
              setShowSearch(false);
            }}
            disabled={locating}
            className="p-1 rounded hover:bg-[var(--color-gold)]/10 text-themed-muted hover:text-gold transition-colors disabled:opacity-50"
            title="Auto-detect location"
          >
            <LocateFixed size={14} className={locating ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowSearch((v) => !v)}
            className="p-1 rounded hover:bg-[var(--color-gold)]/10 text-themed-muted hover:text-gold transition-colors"
            title="Change location"
          >
            <Search size={14} />
          </button>
        </div>
      </div>

      {/* Search form */}
      {showSearch && (
        <form onSubmit={handleSearch} className="mb-3 flex gap-1.5">
          <input
            type="text"
            placeholder="City"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs card-bg border sidebar-border text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/50"
            autoFocus
          />
          <input
            type="text"
            placeholder="Country"
            value={searchCountry}
            onChange={(e) => setSearchCountry(e.target.value)}
            className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs card-bg border sidebar-border text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/50"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/30 transition-colors"
          >
            Go
          </button>
        </form>
      )}

      {/* Prayer times grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {PRAYERS.map((p) => {
          const raw = timings[p.key as keyof PrayerTimings];
          if (!raw) return null;
          const isNext = p.isPrayer && p.key === nextPrayer;
          const Icon = p.icon;
          return (
            <div
              key={p.key}
              className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md ${
                isNext
                  ? "bg-[var(--color-gold)]/10 text-gold"
                  : p.isPrayer
                  ? "text-themed"
                  : "text-themed-muted/50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon size={13} className="shrink-0" />
                <span className={`text-xs ${isNext ? "font-semibold" : ""}`}>
                  {p.label}
                </span>
              </div>
              <span className={`text-xs font-mono ${isNext ? "font-semibold" : ""}`}>
                {formatTime(raw)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
