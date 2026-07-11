"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { computePrayerTimes } from "@/lib/prayer-times";
import { getPrayerSettings, setPrayerSettings, type PrayerCalcMethod } from "@hidden-hiqmah/ui/lib/storage";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";
import ContentCard from "@hidden-hiqmah/ui/components/ContentCard";
import {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Search,
  MapPin,
  LocateFixed,
  Settings2,
} from "lucide-react";
import { useAdhanAudio } from "@hidden-hiqmah/ui/context/AdhanAudioContext";
import { formatLocation, reverseGeocode } from "@hidden-hiqmah/ui/lib/location";
import {
  getFreshCachedLocation,
  setCachedLocation,
  getLocationState,
  setLocationState,
} from "@hidden-hiqmah/ui/lib/location-cache";

/* ───────────────────────── prayer times data ───────────────────────── */

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface HijriDate {
  day: string;
  month: { en: string; ar: string };
  year: string;
  designation: { abbreviated: string };
}

// Local Hijri date (Umm al-Qura) for the on-device path — no network.
function localHijriDate(date: Date): HijriDate {
  const get = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  try {
    const en = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(date);
    const ar = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      month: "long",
    }).formatToParts(date);
    return {
      day: get(en, "day"),
      month: { en: get(en, "month"), ar: get(ar, "month") },
      year: get(en, "year"),
      designation: { abbreviated: "AH" },
    };
  } catch {
    return { day: "", month: { en: "", ar: "" }, year: "", designation: { abbreviated: "AH" } };
  }
}

interface AladhanResponse {
  data: {
    timings: PrayerTimings;
    date: {
      hijri: HijriDate;
    };
    meta?: {
      timezone?: string;
    };
  };
}

const PRAYER_TIME_LIST = [
  { key: "Fajr", english: "Fajr", arabic: "الفجر", icon: Sunrise, isPrayer: true },
  { key: "Sunrise", english: "Sunrise", arabic: "الشروق", icon: Sun, isPrayer: false },
  { key: "Dhuhr", english: "Dhuhr", arabic: "الظهر", icon: CloudSun, isPrayer: true },
  { key: "Asr", english: "Asr", arabic: "العصر", icon: CloudSun, isPrayer: true },
  { key: "Maghrib", english: "Maghrib", arabic: "المغرب", icon: Sunset, isPrayer: true },
  { key: "Isha", english: "Isha", arabic: "العشاء", icon: Moon, isPrayer: true },
] as const;

// Values MUST match the shared PrayerCalcMethod codes (packages/ui storage) and
// the Settings screen's CALC_METHODS, so this page, the Home card, and scheduled
// adhan all resolve to the SAME method. (Gulf/Dubai is code 8 — code 16 has no
// mapping in prayer-times.ts and would silently fall back to Muslim World League.)
const CALCULATION_METHODS = [
  { value: 2, label: "ISNA" },
  { value: 3, label: "Muslim World League" },
  { value: 4, label: "Umm Al-Qura, Makkah" },
  { value: 5, label: "Egyptian General Authority" },
  { value: 1, label: "Karachi" },
  { value: 7, label: "Tehran" },
  { value: 8, label: "Gulf Region" },
  { value: 9, label: "Kuwait" },
  { value: 10, label: "Qatar" },
  { value: 11, label: "Singapore" },
  { value: 13, label: "Diyanet (Turkey)" },
  { value: 15, label: "Moonsighting Committee" },
];

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Get the current time (hours/minutes/seconds + total seconds since midnight) in a specific timezone.
// If timezone is undefined, uses the browser's local timezone.
function getNowParts(timezone?: string): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  const date = new Date();
  if (!timezone) {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    return { hours: h, minutes: m, seconds: s, totalSeconds: h * 3600 + m * 60 + s };
  }
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const parts = fmt.formatToParts(date);
    let h = 0;
    let m = 0;
    let s = 0;
    for (const p of parts) {
      if (p.type === "hour") h = parseInt(p.value, 10) % 24;
      else if (p.type === "minute") m = parseInt(p.value, 10);
      else if (p.type === "second") s = parseInt(p.value, 10);
    }
    return { hours: h, minutes: m, seconds: s, totalSeconds: h * 3600 + m * 60 + s };
  } catch {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    return { hours: h, minutes: m, seconds: s, totalSeconds: h * 3600 + m * 60 + s };
  }
}

function getNextPrayerInfo(timings: PrayerTimings, timezone?: string): { key: string; timeUntil: number } | null {
  const nowSec = getNowParts(timezone).totalSeconds;
  const prayerKeys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
  for (const key of prayerKeys) {
    const raw = timings[key];
    if (!raw) continue;
    const clean = raw.replace(/\s*\(.*\)/, "");
    const [h, m] = clean.split(":").map(Number);
    const prayerSec = h * 3600 + m * 60;
    if (prayerSec > nowSec) {
      return { key, timeUntil: (prayerSec - nowSec) * 1000 };
    }
  }
  // Wrap to next day's Fajr
  const fajrRaw = timings.Fajr;
  if (!fajrRaw) return null;
  const clean = fajrRaw.replace(/\s*\(.*\)/, "");
  const [h, m] = clean.split(":").map(Number);
  const fajrSec = h * 3600 + m * 60;
  return { key: "Fajr", timeUntil: ((24 * 3600 - nowSec) + fajrSec) * 1000 };
}

function formatDisplayTime(raw: string) {
  const clean = raw.replace(/\s*\(.*\)/, "");
  const [h, m] = clean.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Minutes since midnight for a "HH:MM" or "HH:MM (TZ)" string
function timeStringToMinutes(raw: string): number {
  const clean = raw.replace(/\s*\(.*\)/, "");
  const [h, m] = clean.split(":").map(Number);
  return h * 60 + m;
}

interface WindowProgress {
  prevKey: string;
  prevTime: string;
  nextKey: string;
  nextTime: string;
  progress: number; // 0..1, current position within the [prev, next] window
}

// Determine the current "window" — the prayer just past and the prayer coming up —
// and what fraction of that window has elapsed. Timezone-aware.
function getWindowProgress(timings: PrayerTimings, nextKey: string, timezone?: string): WindowProgress | null {
  const order: (keyof PrayerTimings)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const idx = order.indexOf(nextKey as keyof PrayerTimings);
  if (idx === -1) return null;

  const nowParts = getNowParts(timezone);
  const nowMin = nowParts.hours * 60 + nowParts.minutes + nowParts.seconds / 60;

  let prevKey: string;
  let prevMin: number;

  if (idx === 0) {
    // Before Fajr — previous "window start" is yesterday's Isha (approximated as Isha - 24h)
    const ishaRaw = timings.Isha;
    if (!ishaRaw) return null;
    prevKey = "Isha";
    prevMin = timeStringToMinutes(ishaRaw) - 24 * 60;
  } else {
    const prevKeyTyped = order[idx - 1];
    const prevRaw = timings[prevKeyTyped];
    if (!prevRaw) return null;
    prevKey = prevKeyTyped;
    prevMin = timeStringToMinutes(prevRaw);
  }

  const nextRaw = timings[nextKey as keyof PrayerTimings];
  if (!nextRaw) return null;
  let nextMin = timeStringToMinutes(nextRaw);

  // If next prayer time has already passed today (only happens for Fajr-next-day),
  // shift it forward by 24h
  if (nextMin < nowMin && idx === 0) nextMin += 24 * 60;

  const total = nextMin - prevMin;
  const elapsed = nowMin - prevMin;
  const progress = total > 0 ? Math.max(0, Math.min(1, elapsed / total)) : 0;

  return {
    prevKey,
    prevTime: formatDisplayTime(timings[prevKey as keyof PrayerTimings] || ""),
    nextKey,
    nextTime: formatDisplayTime(nextRaw),
    progress,
  };
}

/* ───────────────────────── page ───────────────────────── */

export default function PrayerTimesPage() {
  /* ── Adhan audio context ── */
  const adhan = useAdhanAudio();

  /* ── Prayer Times state ── */
  const [ptTimings, setPtTimings] = useState<PrayerTimings | null>(null);
  const [ptTimezone, setPtTimezone] = useState<string | undefined>(undefined);
  const [ptHijri, setPtHijri] = useState<HijriDate | null>(null);
  const [ptCity, setPtCity] = useState("");
  const [ptCountry, setPtCountry] = useState("");
  const [ptDisplayLocation, setPtDisplayLocation] = useState("");
  const [ptMethod, setPtMethod] = useState<number>(() => getPrayerSettings().calcMethod);
  // The coordinates currently driving the displayed times (device GPS or a
  // picked city). `onDevice` = compute locally (offline-capable). Used so a
  // calc-method change re-computes from the same location instead of falling
  // back to a network city lookup that drops the Asr madhab and exact coords.
  const [ptCoords, setPtCoords] = useState<{ lat: number; lng: number; onDevice: boolean } | null>(null);
  const [ptLoading, setPtLoading] = useState(true);
  const [ptError, setPtError] = useState("");
  const [ptCountdown, setPtCountdown] = useState("");
  const [ptNextPrayerKey, setPtNextPrayerKey] = useState("");
  const [ptSearchQuery, setPtSearchQuery] = useState("");
  const [ptSuggestions, setPtSuggestions] = useState<Array<{ display: string; lat: number; lon: number }>>([]);
  const [ptShowSuggestions, setPtShowSuggestions] = useState(false);
  const [ptSearching, setPtSearching] = useState(false);
  const [ptShowManualInput, setPtShowManualInput] = useState(false);
  const [ptShowMethodMenu, setPtShowMethodMenu] = useState(false);
  const [ptLocating, setPtLocating] = useState(false);
  const ptIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ptFetched = useRef(false);
  const ptDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ptInputRef = useRef<HTMLInputElement>(null);

  const ptFetchTimesByCity = useCallback(
    async (c: string, co: string, m: number) => {
      setPtLoading(true);
      setPtError("");
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(c)}&country=${encodeURIComponent(co)}&method=${m}&school=${getPrayerSettings().asrMethod === "hanafi" ? 1 : 0}`
        );
        if (!res.ok) throw new Error("Failed to fetch prayer times");
        const data: AladhanResponse = await res.json();
        setPtTimings(data.data.timings);
        setPtHijri(data.data.date.hijri);
        setPtTimezone(data.data.meta?.timezone);
        setPtCity(c);
        setPtCountry(co);
        setPtDisplayLocation(`${c}, ${co}`);
      } catch {
        setPtError("Could not load prayer times. Please try a different city.");
      } finally {
        setPtLoading(false);
      }
    },
    []
  );

  const ptFetchTimesByCoords = useCallback(
    // `onDevice` = these are the user's OWN device coordinates → compute locally
    // (device tz === location tz) so the GPS location never leaves the phone and
    // it works offline. Remote city-suggestion coords keep using aladhan (it
    // returns that city's timezone, which on-device computation can't know).
    async (lat: number, lng: number, m: number, onDevice = false) => {
      setPtLoading(true);
      setPtError("");
      setPtCoords({ lat, lng, onDevice });
      if (onDevice) {
        try {
          const timings = computePrayerTimes(lat, lng, {
            method: m,
            asrHanafi: getPrayerSettings().asrMethod === "hanafi",
          });
          setPtTimings(timings);
          setPtHijri(localHijriDate(new Date()));
          setPtTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        } catch {
          setPtError("Could not compute prayer times.");
        } finally {
          setPtLoading(false);
        }
        return;
      }
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${m}&school=${getPrayerSettings().asrMethod === "hanafi" ? 1 : 0}`
        );
        if (!res.ok) throw new Error("Failed to fetch prayer times");
        const data: AladhanResponse = await res.json();
        setPtTimings(data.data.timings);
        setPtHijri(data.data.date.hijri);
        setPtTimezone(data.data.meta?.timezone);
      } catch {
        setPtError("Could not load prayer times.");
      } finally {
        setPtLoading(false);
      }
    },
    []
  );

  const ptAutoLocate = useCallback(async () => {
    // Prefer cached location — no prompt, instant
    const fresh = getFreshCachedLocation();
    if (fresh) {
      setPtCity(fresh.city);
      setPtCountry(fresh.country);
      setPtDisplayLocation(fresh.display);
      ptFetchTimesByCoords(fresh.lat, fresh.lng, ptMethod, true); // device location → on-device
      return;
    }

    // Honor prior denial — fall back to Makkah without prompting
    if (getLocationState() === "denied") {
      setPtCity("Makkah");
      setPtCountry("Saudi Arabia");
      setPtDisplayLocation("Makkah, Saudi Arabia");
      setPtShowManualInput(true);
      ptFetchTimesByCity("Makkah", "Saudi Arabia", ptMethod);
      return;
    }

    if (!navigator.geolocation) return;
    setPtLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Device GPS → compute on-device (location never leaves the phone).
        ptFetchTimesByCoords(latitude, longitude, ptMethod, true);
        setLocationState("granted");
        // Resolve display name in parallel
        const geo = await reverseGeocode(latitude, longitude);
        if (geo) {
          const city = geo.city || geo.principalSubdivision || "";
          const country = geo.countryName || "";
          const display = formatLocation(geo);
          if (display) {
            setPtCity(city);
            setPtCountry(country);
            setPtDisplayLocation(display);
            setCachedLocation({ lat: latitude, lng: longitude, city, country, display });
          } else {
            setPtDisplayLocation(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
          }
        } else {
          setPtDisplayLocation(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
        }
        setPtLocating(false);
      },
      () => {
        setPtCity("Makkah");
        setPtCountry("Saudi Arabia");
        setPtDisplayLocation("Makkah, Saudi Arabia");
        setPtShowManualInput(true);
        ptFetchTimesByCity("Makkah", "Saudi Arabia", ptMethod);
        setPtLocating(false);
        setLocationState("denied");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ptFetchTimesByCoords, ptFetchTimesByCity]);

  useEffect(() => {
    if (ptFetched.current) return;
    ptFetched.current = true;
    if (!navigator.geolocation) {
      setPtCity("Makkah");
      setPtCountry("Saudi Arabia");
      setPtDisplayLocation("Makkah, Saudi Arabia");
      setPtShowManualInput(true);
      ptFetchTimesByCity("Makkah", "Saudi Arabia", ptMethod);
      return;
    }
    ptAutoLocate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ptTimings) return;
    function tick() {
      if (!ptTimings) return;
      const next = getNextPrayerInfo(ptTimings, ptTimezone);
      if (next) {
        setPtNextPrayerKey(next.key);
        setPtCountdown(formatCountdown(next.timeUntil));
      }
    }
    tick();
    ptIntervalRef.current = setInterval(tick, 1000);
    return () => {
      if (ptIntervalRef.current) clearInterval(ptIntervalRef.current);
    };
  }, [ptTimings, ptTimezone]);

  // Push prayer timings into the adhan audio context (which handles scheduling globally)
  useEffect(() => {
    if (ptTimings) adhan.setTimings(ptTimings);
  }, [ptTimings, adhan]);

  const ptHandleMethodChange = (newMethod: number) => {
    setPtMethod(newMethod);
    // Persist so the Home card + scheduled adhan use the same method.
    setPrayerSettings({ calcMethod: newMethod as PrayerCalcMethod });
    // Re-fetch from the active coordinates when we have them: preserves the
    // Hanafi Asr madhab + exact location and keeps working offline (on-device
    // path). Only the manual-city fallback (no coords) uses the network API.
    if (ptCoords) {
      ptFetchTimesByCoords(ptCoords.lat, ptCoords.lng, newMethod, ptCoords.onDevice);
    } else if (ptCity && ptCountry) {
      ptFetchTimesByCity(ptCity, ptCountry, newMethod);
    }
  };

  const ptSearchLocation = useCallback(async (query: string) => {
    if (query.length < 2) { setPtSuggestions([]); return; }
    setPtSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setPtSuggestions(
        data.map((r: { display_name: string; lat: string; lon: string; address?: { city?: string; town?: string; village?: string; state?: string; country?: string } }) => {
          const addr = r.address || {};
          const city = addr.city || addr.town || addr.village || "";
          const parts = [city, addr.state, addr.country].filter(Boolean);
          return {
            display: parts.length > 0 ? parts.join(", ") : r.display_name.split(",").slice(0, 3).join(","),
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
          };
        })
      );
      setPtShowSuggestions(true);
    } catch {
      setPtSuggestions([]);
    } finally {
      setPtSearching(false);
    }
  }, []);

  const ptHandleQueryChange = (value: string) => {
    setPtSearchQuery(value);
    if (ptDebounceRef.current) clearTimeout(ptDebounceRef.current);
    ptDebounceRef.current = setTimeout(() => ptSearchLocation(value), 300);
  };

  const ptSelectSuggestion = (s: { display: string; lat: number; lon: number }) => {
    setPtSearchQuery(s.display);
    setPtShowSuggestions(false);
    setPtSuggestions([]);
    setPtDisplayLocation(s.display);
    const parts = s.display.split(", ");
    setPtCity(parts[0] || "");
    setPtCountry(parts[parts.length - 1] || "");
    ptFetchTimesByCoords(s.lat, s.lon, ptMethod);
    setPtShowManualInput(false);
  };

  const ptHandleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptSearchQuery.trim()) return;
    // If there are suggestions, pick the first one
    if (ptSuggestions.length > 0) {
      ptSelectSuggestion(ptSuggestions[0]);
    } else {
      // Fallback: try city-based fetch
      const q = ptSearchQuery.trim();
      ptFetchTimesByCity(q, "auto", ptMethod);
      setPtShowManualInput(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Prayer Times"
        titleAr="مواقيت الصلاة"
        subtitle="Today's prayer times for your location, with a live countdown to the next prayer"
      />

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Location & Hijri Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4"
        >
          <div>
            {ptDisplayLocation && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-gold" />
                <p className="text-themed text-sm font-medium">{ptDisplayLocation}</p>
              </div>
            )}
            {ptHijri && (
              <p className="text-themed-muted text-xs mt-1">
                {ptHijri.day} {ptHijri.month.en} {ptHijri.year} {ptHijri.designation.abbreviated}
                <span className="font-arabic ml-2 text-gold/60">
                  {ptHijri.month.ar}
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                ptAutoLocate();
                setPtShowManualInput(false);
              }}
              disabled={ptLocating}
              className="flex items-center gap-1.5 text-xs text-themed-muted hover:text-gold transition-colors disabled:opacity-50"
              title="Auto-detect location"
            >
              <LocateFixed size={14} className={ptLocating ? "animate-spin" : ""} />
              Auto-locate
            </button>
            <button
              onClick={() => setPtShowManualInput((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-themed-muted hover:text-gold transition-colors"
            >
              <Search size={14} />
              Change Location
            </button>
            <div className="relative">
              <button
                onClick={() => setPtShowMethodMenu((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-themed-muted hover:text-gold transition-colors"
                title="Calculation method"
              >
                <Settings2 size={14} />
                <span className="hidden sm:inline">{CALCULATION_METHODS.find((m) => m.value === ptMethod)?.label}</span>
              </button>
              {ptShowMethodMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPtShowMethodMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 rounded-lg border sidebar-border card-bg shadow-lg overflow-hidden min-w-[200px]">
                    <p className="text-[10px] text-themed-muted uppercase tracking-wider px-3 pt-2.5 pb-1">Calculation method</p>
                    {CALCULATION_METHODS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => {
                          ptHandleMethodChange(m.value);
                          setPtShowMethodMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                          ptMethod === m.value
                            ? "text-gold bg-gold/10"
                            : "text-themed hover:bg-gold/5"
                        }`}
                      >
                        <span>{m.label}</span>
                        {ptMethod === m.value && <span className="text-gold text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Location Search */}
        {ptShowManualInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={ptHandleSearch} className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <input
                    ref={ptInputRef}
                    type="text"
                    placeholder="Search city, state, or country..."
                    value={ptSearchQuery}
                    onChange={(e) => ptHandleQueryChange(e.target.value)}
                    onFocus={() => ptSuggestions.length > 0 && setPtShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setPtShowSuggestions(false), 200)}
                    autoComplete="off"
                    className="w-full px-3 py-2 rounded-lg text-sm card-bg border sidebar-border text-themed placeholder:text-themed-muted/50 focus:outline-none focus:border-[var(--color-gold)]/50"
                  />
                  {ptSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-[var(--color-gold)]/30 border-t-[var(--color-gold)] rounded-full animate-spin" />
                    </div>
                  )}
                  {ptShowSuggestions && ptSuggestions.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border sidebar-border card-bg shadow-lg overflow-hidden">
                      {ptSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => ptSelectSuggestion(s)}
                          className="w-full text-left px-3 py-2.5 text-sm text-themed hover:bg-[var(--color-gold)]/10 transition-colors flex items-center gap-2 border-b sidebar-border last:border-b-0"
                        >
                          <MapPin size={12} className="text-gold/60 shrink-0" />
                          <span className="truncate">{s.display}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-gold)]/20 text-gold border border-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/30 transition-colors shrink-0"
                >
                  Search
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Next Prayer — Hero Countdown */}
        {ptTimings && ptNextPrayerKey && !ptLoading && (() => {
          const win = getWindowProgress(ptTimings, ptNextPrayerKey, ptTimezone);
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="card-bg rounded-2xl border sidebar-border p-6 sm:p-8 relative overflow-hidden">
                {/* Atmospheric gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.08] via-gold/[0.02] to-transparent pointer-events-none" />
                <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gold/[0.04] blur-3xl pointer-events-none" />

                <div className="relative">
                  <div className="text-center">
                    <p className="text-[11px] text-themed-muted uppercase tracking-[0.2em] mb-3">Up Next</p>
                    <div className="flex items-baseline justify-center gap-3 mb-1">
                      <p className="text-gold text-3xl sm:text-4xl font-semibold">{ptNextPrayerKey}</p>
                      <p className="text-themed-muted text-sm">at {win ? win.nextTime : ""}</p>
                    </div>
                    <p className="font-mono text-4xl sm:text-5xl md:text-6xl text-themed tracking-wider mt-4 mb-6 sm:mb-8 tabular-nums">
                      {ptCountdown}
                    </p>
                  </div>

                  {win && (
                    <div>
                      <div className="h-1.5 rounded-full bg-gold/10 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gold/50 to-gold rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${win.progress * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-themed-muted mt-2 uppercase tracking-wider">
                        <span>{win.prevKey} <span className="font-mono normal-case tracking-normal text-themed-muted/70">{win.prevTime}</span></span>
                        <span>{win.nextKey} <span className="font-mono normal-case tracking-normal text-themed-muted/70">{win.nextTime}</span></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Day Timeline Strip */}
        {ptTimings && !ptLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="card-bg rounded-xl border sidebar-border p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-themed-muted uppercase tracking-[0.2em]">Today</p>
              </div>
              {(() => {
                const nowParts = getNowParts(ptTimezone);
                const nowMin = nowParts.hours * 60 + nowParts.minutes + nowParts.seconds / 60;
                const nowPos = nowMin / (24 * 60);
                // Only the 5 daily prayers on the timeline (Sunrise stays in the detail grid below)
                const stops = PRAYER_TIME_LIST.filter((p) => p.isPrayer)
                  .map((p) => {
                    const raw = ptTimings[p.key as keyof PrayerTimings];
                    if (!raw) return null;
                    const min = timeStringToMinutes(raw);
                    return { ...p, pos: min / (24 * 60), time: formatDisplayTime(raw) };
                  })
                  .filter((v): v is NonNullable<typeof v> => v !== null);
                const nowTimeStr = ptTimezone
                  ? new Intl.DateTimeFormat("en-US", {
                      timeZone: ptTimezone,
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    }).format(new Date())
                  : new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });

                // Vertical layout reference (px from container top):
                //   0–18  : time pill at the current position
                //   22–44 : prayer name labels
                //   54    : horizontal day line
                //   48–60 : tick marks at each prayer's position (cross the line)
                //   66+   : 12 AM end labels
                return (
                  <div className="relative h-24 mx-2">
                    {/* Prayer name labels */}
                    {stops.map((s) => {
                      const isNext = s.key === ptNextPrayerKey;
                      return (
                        <div
                          key={s.key}
                          className="absolute -translate-x-1/2 top-[26px] text-center whitespace-nowrap"
                          style={{ left: `${s.pos * 100}%` }}
                        >
                          <p
                            className={`text-[10px] uppercase tracking-wider ${
                              isNext ? "text-gold font-semibold" : "text-themed-muted"
                            }`}
                          >
                            {s.english}
                          </p>
                        </div>
                      );
                    })}

                    {/* Horizontal day line (below names) */}
                    <div
                      className="absolute left-0 right-0 top-[54px] rounded-full"
                      style={{ height: "2px", background: "rgba(212, 168, 67, 0.55)" }}
                    />
                    {/* End caps */}
                    <div
                      className="absolute left-0 top-[48px] rounded-full"
                      style={{ width: "2px", height: "14px", background: "rgba(212, 168, 67, 0.7)" }}
                    />
                    <div
                      className="absolute right-0 top-[48px] rounded-full"
                      style={{ width: "2px", height: "14px", background: "rgba(212, 168, 67, 0.7)" }}
                    />
                    {/* Tick marks at each prayer's position */}
                    {stops.map((s) => (
                      <div
                        key={`tick-${s.key}`}
                        className="absolute top-[49px]"
                        style={{
                          left: `${s.pos * 100}%`,
                          transform: "translateX(-50%)",
                          width: "2px",
                          height: "12px",
                          background: "rgba(212, 168, 67, 0.7)",
                        }}
                      />
                    ))}
                    {/* 12 AM end labels */}
                    <p className="absolute left-0 top-[66px] text-[9px] font-mono text-themed-muted/40">12 AM</p>
                    <p className="absolute right-0 top-[66px] text-[9px] font-mono text-themed-muted/40 text-right">12 AM</p>

                    {/* Now marker — time pill at top, vertical line, dot sitting on the day line */}
                    <div
                      className="absolute top-0 bottom-0 pointer-events-none"
                      style={{ left: `${nowPos * 100}%` }}
                    >
                      <div className="absolute -translate-x-1/2 top-0 px-2 py-0.5 rounded-md bg-gold/15 border border-gold/30 whitespace-nowrap">
                        <p className="text-[10px] font-mono text-gold tabular-nums">{nowTimeStr}</p>
                      </div>
                      <div className="absolute top-[20px] w-px bg-gold" style={{ height: "35px" }} />
                      <div className="absolute top-[55px] -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(212,168,67,0.7)]" />
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* Loading / Error */}
        {ptLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-[var(--color-gold)]/30 border-t-[var(--color-gold)] rounded-full animate-spin" />
            <p className="text-themed-muted text-sm mt-3">Loading prayer times...</p>
          </div>
        )}
        {ptError && (
          <div className="text-center py-8">
            <p className="text-red-400 text-sm">{ptError}</p>
          </div>
        )}

        {/* Prayer Time Cards */}
        {ptTimings && !ptLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRAYER_TIME_LIST.map((prayer, i) => {
              const raw = ptTimings[prayer.key as keyof PrayerTimings];
              if (!raw) return null;
              const isNext = prayer.isPrayer && prayer.key === ptNextPrayerKey;
              const Icon = prayer.icon;
              return (
                <ContentCard
                  key={prayer.key}
                  delay={0.25 + i * 0.06}
                  className={
                    isNext
                      ? "!border-[var(--color-gold)]/60 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                      : !prayer.isPrayer
                      ? "opacity-60"
                      : ""
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        isNext
                          ? "bg-[var(--color-gold)]/20"
                          : "bg-[var(--color-gold)]/10"
                      }`}
                    >
                      <Icon
                        size={22}
                        className={isNext ? "text-gold" : "text-gold/70"}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3
                          className={`font-semibold text-sm ${
                            isNext ? "text-gold" : "text-themed"
                          }`}
                        >
                          {prayer.english}
                        </h3>
                        <span className="text-xs font-arabic text-gold/50">
                          {prayer.arabic}
                        </span>
                      </div>
                      {!prayer.isPrayer && (
                        <span className="text-[10px] text-themed-muted uppercase tracking-wide">
                          Not a prayer
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-lg font-mono font-semibold shrink-0 ${
                        isNext ? "text-gold" : "text-themed"
                      }`}
                    >
                      {formatDisplayTime(raw)}
                    </p>
                  </div>
                  {isNext && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="mt-3 h-[2px] rounded-full bg-gradient-to-r from-[var(--color-gold)] to-transparent origin-left"
                    />
                  )}
                </ContentCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
