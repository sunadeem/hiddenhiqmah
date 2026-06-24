"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Moon,
  Sunrise,
  Utensils,
  BookOpen,
  Star,
  Plus,
  Minus,
  ChevronRight,
  MapPin,
} from "lucide-react";
import {
  getPrayerSettings,
  getCurrentHijriMonthDay,
} from "@hidden-hiqmah/ui/lib/storage";

// Festive, cohesive blue palette for Ramadan. Overrides the theme variables
// within this page only — so the accent, the CARD backgrounds, and the borders
// all shift into one blue family (instead of a blue accent on gray cards), plus
// a soft blue glow at the top. (.card-bg/.sidebar-border/.text-gold all resolve
// through these vars, so everything re-palettes automatically.)
const RAMADAN_STYLE = {
  background:
    "radial-gradient(130% 55% at 50% 0%, rgba(91,189,240,0.10), transparent 70%)",
  ["--color-gold" as string]: "#5bbdf0", // accent (icons, rings, gradients)
  ["--color-card" as string]: "#102a47", // blue-tinted card (was gray-navy)
  ["--color-border" as string]: "#244a73", // blue border
} as React.CSSProperties;
import { getFreshCachedLocation } from "@hidden-hiqmah/ui/lib/location-cache";
import { computePrayerTimes } from "@/lib/prayer-times";

const JUZ_KEY = "hiqmah-ramadan-juz";

function parseToToday(hhmm: string): Date | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || "");
  if (!m) return null;
  const d = new Date();
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return d;
}
function fmtRemaining(ms: number): string {
  if (ms <= 0) return "now";
  const total = Math.floor(ms / 60000);
  const h = Math.floor(total / 60);
  const mm = total % 60;
  return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
}
function fmtTime(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/**
 * Ramadan home — seasonal Home that auto-activates during Ramadan (Hijri month 9).
 * Iftar (Maghrib) / Suhoor (Fajr) countdown from on-device prayer times, a
 * juz-a-day khatmah tracker, Taraweeh, and a last-10-nights / Laylatul Qadr card.
 * `preview` softens the day/timing copy when shown off-season from Settings.
 */
export default function RamadanHome({
  preview = false,
  onUseUsualHome,
}: {
  preview?: boolean;
  onUseUsualHome?: () => void;
}) {
  const { month, day, year } = getCurrentHijriMonthDay();
  const ramadanDay = month === 9 ? day : null;

  const [maghrib, setMaghrib] = useState<string | null>(null);
  const [fajr, setFajr] = useState<string | null>(null);
  const [hasLoc, setHasLoc] = useState(true);
  const [now, setNow] = useState(0);
  const [juz, setJuz] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const loc = getFreshCachedLocation();
      if (!loc) {
        setHasLoc(false);
        return;
      }
      const ps = getPrayerSettings();
      const t = computePrayerTimes(loc.lat, loc.lng, {
        method: ps.calcMethod,
        asrHanafi: ps.asrMethod === "hanafi",
      });
      setMaghrib(t.Maghrib);
      setFajr(t.Fajr);
    } catch {
      setHasLoc(false);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(JUZ_KEY);
      const s = raw ? (JSON.parse(raw) as { year: number; juz: number }) : null;
      setJuz(s && s.year === year ? s.juz ?? 0 : 0);
    } catch {
      /* ignore */
    }
  }, [year]);

  const setJuzP = (n: number) => {
    const v = Math.max(0, Math.min(30, n));
    setJuz(v);
    try {
      localStorage.setItem(JUZ_KEY, JSON.stringify({ year, juz: v }));
    } catch {
      /* ignore */
    }
  };

  // Iftar / Suhoor hero
  let heroIcon = Utensils;
  let heroLabel = "Iftar";
  let heroTime = "";
  let heroRemaining = "";
  if (maghrib && fajr && now) {
    const mg = parseToToday(maghrib);
    const fj = parseToToday(fajr);
    if (mg && now < mg.getTime()) {
      heroIcon = Utensils;
      heroLabel = "Iftar";
      heroTime = fmtTime(mg);
      heroRemaining = fmtRemaining(mg.getTime() - now);
    } else if (fj) {
      const fjNext = new Date(fj);
      if (now >= fj.getTime()) fjNext.setDate(fjNext.getDate() + 1);
      heroIcon = Sunrise;
      heroLabel = "Suhoor ends";
      heroTime = fmtTime(fj);
      heroRemaining = fmtRemaining(fjNext.getTime() - now);
    }
  }
  const HeroIcon = heroIcon;

  return (
    <div className="space-y-3 rounded-2xl" style={RAMADAN_STYLE}>
      {/* Header */}
      <div className="px-1 flex items-center gap-2">
        <Moon size={20} className="text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-themed leading-tight">Ramadan</h1>
          <p className="text-themed-muted text-sm">
            {ramadanDay ? `Day ${ramadanDay}` : preview ? "Preview" : "Mubarak"}
          </p>
        </div>
      </div>

      {/* Iftar / Suhoor hero */}
      <div className="card-bg rounded-2xl border border-[var(--color-gold)]/30 p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/14 to-transparent pointer-events-none" />
        {maghrib && fajr ? (
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/20 text-gold flex items-center justify-center shrink-0">
              <HeroIcon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-themed-muted text-xs uppercase tracking-wider">{heroLabel}</p>
              <p className="text-3xl font-bold text-themed leading-none mt-0.5">
                in {heroRemaining}
              </p>
              <p className="text-themed-muted text-sm mt-1">
                {heroLabel === "Iftar" ? "Maghrib" : "Fajr"} {heroTime}
              </p>
            </div>
          </div>
        ) : hasLoc ? (
          <div className="relative text-themed-muted text-sm">Loading today&apos;s times…</div>
        ) : (
          <Link href="/salah?tab=times" className="relative flex items-center gap-2 text-gold text-sm font-semibold">
            <MapPin size={16} /> Set your location for iftar &amp; suhoor times
            <ChevronRight size={15} />
          </Link>
        )}
      </div>

      {/* Juz-a-day khatmah */}
      <div className="card-bg rounded-2xl border sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-themed-muted font-semibold">
              Juz-a-day khatmah
            </p>
            <p className="text-themed font-bold text-lg mt-0.5">{juz} / 30 juz</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setJuzP(juz - 1)}
              disabled={juz <= 0}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-themed disabled:opacity-40"
            >
              <Minus size={15} />
            </button>
            <button
              onClick={() => setJuzP(juz + 1)}
              disabled={juz >= 30}
              className="w-8 h-8 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center text-gold disabled:opacity-40"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/8 overflow-hidden mt-3">
          <div className="h-full bg-gold rounded-full" style={{ width: `${(juz / 30) * 100}%` }} />
        </div>
        {ramadanDay && (
          <p className="text-xs text-themed-muted mt-2">
            {juz >= ramadanDay
              ? "On pace to finish by Eid — masha'Allah"
              : `Day ${ramadanDay} · aim for juz ${ramadanDay} to finish on time`}
          </p>
        )}
        <Link
          href="/quran"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold mt-2"
        >
          <BookOpen size={13} /> Continue reading <ChevronRight size={13} />
        </Link>
      </div>

      {/* Taraweeh → Salah › Voluntary & Special › Tarawih sub-tab */}
      <Link
        href="/salah?tab=voluntary&sub=tarawih"
        className="card-bg rounded-2xl border sidebar-border p-4 flex items-center gap-3 touch-manipulation active:scale-[0.99] transition-transform"
      >
        <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/15 text-gold flex items-center justify-center shrink-0">
          <Moon size={19} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-themed font-semibold text-sm leading-tight">Taraweeh tonight</p>
          <p className="text-themed-muted text-xs mt-0.5">Stand in prayer after Isha</p>
        </div>
        <ChevronRight size={18} className="text-themed-muted shrink-0" />
      </Link>

      {/* Last 10 nights / Laylatul Qadr.
          TESTING: always shown so it's reviewable off-season. For real seasonal
          behaviour, wrap this card in {isLaylatulQadrSeason() && ( ... )}. */}
      <div className="card-bg rounded-2xl border border-[var(--color-gold)]/30 p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/14 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">
            <Star size={12} /> Last 10 nights
          </p>
          <p className="text-themed font-bold text-base mt-1 leading-snug">
            Seek Laylatul Qadr — better than a thousand months
          </p>
          <p className="font-arabic text-gold text-right text-lg leading-loose mt-3" dir="rtl">
            اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
          </p>
          <p className="text-themed-muted text-xs italic mt-1">
            &ldquo;O Allah, You are Most Forgiving and love forgiveness, so forgive me.&rdquo;
          </p>
          <Link
            href="/quran/97"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold mt-3"
          >
            Read Surah Al-Qadr <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {onUseUsualHome && (
        <button
          onClick={onUseUsualHome}
          className="w-full text-themed-muted text-xs py-2 active:text-themed touch-manipulation"
        >
          Use my usual home instead
        </button>
      )}
    </div>
  );
}
