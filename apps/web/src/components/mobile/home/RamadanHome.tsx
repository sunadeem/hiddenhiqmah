"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Moon,
  Clock,
  Sunset,
  Sunrise,
  BookOpen,
  Star,
  Plus,
  Minus,
  ChevronRight,
  ArrowRight,
  Check,
  MapPin,
} from "lucide-react";
import {
  getPrayerSettings,
  getCurrentHijriMonthDay,
} from "@hidden-hiqmah/ui/lib/storage";
import { getFreshCachedLocation } from "@hidden-hiqmah/ui/lib/location-cache";
import { computePrayerTimes } from "@/lib/prayer-times";
import TodayStrip from "./TodayStrip";
import { QuickActions } from "../MobileHomeDashboard";

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

// Dark text used on the solid-accent pills/buttons (reads on any light accent).
const ON_ACCENT = "#0a1628";

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
const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
/** Next of the five daily prayers (rolls to tomorrow's Fajr after Isha). */
function nextPrayer(
  times: Record<string, string>,
  now: number
): { name: string; date: Date } | null {
  for (const name of PRAYER_ORDER) {
    const d = parseToToday(times[name]);
    if (d && now < d.getTime()) return { name, date: d };
  }
  const f = parseToToday(times.Fajr);
  if (f) {
    const fn = new Date(f);
    fn.setDate(fn.getDate() + 1);
    return { name: "Fajr", date: fn };
  }
  return null;
}
/** "Tuesday · 12 Ramadan 1447" — real Hijri (umalqura) date, year-round. */
function hijriDateLine(): string {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const yr = get("year").replace(/\D/g, "");
    return `${get("weekday")} · ${get("day")} ${get("month")} ${yr}`;
  } catch {
    return "";
  }
}

/**
 * Ramadan home — seasonal Home that auto-activates during Ramadan (Hijri month 9).
 * Centered iftar/suhoor hero (on-device prayer times), a juz-a-day khatmah
 * tracker, a Taraweeh card, a last-10-nights / Laylatul Qadr card, and the
 * shared daily streak strip kept at the bottom.
 */
export default function RamadanHome({
  onUseUsualHome,
}: {
  onUseUsualHome?: () => void;
}) {
  const { month, day, year } = getCurrentHijriMonthDay();
  const ramadanDay = month === 9 ? day : null;

  const [times, setTimes] = useState<Record<string, string> | null>(null);
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
      setTimes({
        Fajr: t.Fajr,
        Dhuhr: t.Dhuhr,
        Asr: t.Asr,
        Maghrib: t.Maghrib,
        Isha: t.Isha,
      });
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

  // ── Iftar / Suhoor hero (centered) ──
  // Main countdown flips between Iftar (→ Maghrib) and Suhoor (→ next Fajr),
  // with the pill showing whichever time is next. The line under the divider is
  // a live "next prayer" readout across all five daily prayers.
  let heroLabel = "Iftar in";
  let heroBig = "—";
  let PillIcon = Sunset;
  let pillText = "Maghrib —";
  let nextPrayerText = "";
  const timesReady = !!(times && now);
  if (timesReady) {
    const mg = parseToToday(times!.Maghrib);
    const fj = parseToToday(times!.Fajr);
    if (mg && now < mg.getTime()) {
      heroLabel = "Iftar in";
      heroBig = fmtRemaining(mg.getTime() - now);
      PillIcon = Sunset;
      pillText = `Maghrib ${fmtTime(mg)}`;
    } else if (fj) {
      const fjNext = new Date(fj);
      if (now >= fj.getTime()) fjNext.setDate(fjNext.getDate() + 1);
      heroLabel = "Suhoor in";
      heroBig = fmtRemaining(fjNext.getTime() - now);
      PillIcon = Sunrise;
      pillText = `Fajr ${fmtTime(fj)}`;
    }
    const np = nextPrayer(times!, now);
    if (np) nextPrayerText = `${np.name} ${fmtTime(np.date)}`;
  }
  const isha = times?.Isha ?? null;

  // Khatmah pace: on Ramadan day N you should be at ~N juz to finish 30 by Eid.
  const complete = juz >= 30;
  const diff = ramadanDay != null ? juz - ramadanDay : 0;
  const onTrack = complete || (ramadanDay != null && diff >= 0);
  const juzStatus = complete
    ? "Khatmah complete — masha'Allah"
    : ramadanDay != null
      ? diff > 0
        ? `${diff} juz ahead of pace`
        : diff === 0
          ? "On track to finish by Eid"
          : `${-diff} juz behind · aim for ${ramadanDay}`
      : "A juz a day completes the Qur'an by Eid";

  return (
    <div className="space-y-3" style={RAMADAN_STYLE}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold text-themed leading-tight">
            Ramadan Karīm
          </h1>
          <p className="text-themed-muted text-sm mt-0.5">{hijriDateLine()}</p>
        </div>
        <Moon size={38} className="text-gold shrink-0" strokeWidth={1.5} />
      </div>

      {/* ── Iftar / Suhoor hero ── */}
      <div className="card-bg rounded-2xl border border-[var(--color-gold)]/30 p-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-gold)]/12 to-transparent pointer-events-none" />
        {timesReady ? (
          <div className="relative">
            <p className="inline-flex items-center gap-1.5 text-gold text-xs font-bold uppercase tracking-[0.16em]">
              <Clock size={13} /> {heroLabel}
            </p>
            <p className="text-5xl font-extrabold text-themed leading-none tracking-tight mt-1.5">
              {heroBig}
            </p>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mt-3 font-bold text-sm bg-gold"
              style={{ color: ON_ACCENT }}
            >
              <PillIcon size={15} /> {pillText}
            </div>
            <div className="h-px bg-[var(--color-border)] mt-3.5" />
            <p className="inline-flex items-center gap-1.5 text-themed-muted text-sm mt-3">
              <Clock size={14} /> Next prayer · {nextPrayerText}
            </p>
          </div>
        ) : hasLoc ? (
          <div className="relative text-themed-muted text-sm py-4">
            Loading today&apos;s times…
          </div>
        ) : (
          <Link
            href="/salah?tab=times"
            className="relative inline-flex items-center gap-2 text-gold text-sm font-semibold py-3"
          >
            <MapPin size={16} /> Set your location for iftar &amp; suhoor times
            <ChevronRight size={15} />
          </Link>
        )}
      </div>

      {/* ── Section label ── */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-themed-muted px-1 pt-1">
        Your Ramadan
      </p>

      {/* ── Juz-a-day khatmah ── */}
      <div className="card-bg rounded-2xl border sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/18 text-gold flex items-center justify-center shrink-0">
            <BookOpen size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-themed font-bold leading-tight">Juz-a-day Khatmah</p>
            <p className="text-themed-muted text-sm mt-0.5">Finish the Qur&apos;an this Ramadan</p>
          </div>
          <p className="text-right shrink-0">
            <span className="text-3xl font-extrabold text-themed">{juz}</span>
            <span className="text-themed-muted text-base font-semibold"> / 30</span>
          </p>
        </div>
        <div className="h-2 rounded-full bg-white/8 overflow-hidden mt-3">
          <div className="h-full bg-gold rounded-full" style={{ width: `${(juz / 30) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <p className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold min-w-0">
            {onTrack && <Check size={13} className="shrink-0" />}
            <span className="truncate">{juzStatus}</span>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setJuzP(juz - 1)}
              disabled={juz <= 0}
              aria-label="Log one fewer juz"
              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-themed disabled:opacity-40"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={() => setJuzP(juz + 1)}
              disabled={juz >= 30}
              aria-label="Log one juz read"
              className="w-7 h-7 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center text-gold disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Taraweeh → Salah › Voluntary & Special › Tarawih ── */}
      <Link
        href="/salah?tab=voluntary&sub=tarawih"
        className="card-bg rounded-2xl border sidebar-border p-4 flex items-center gap-3 touch-manipulation active:scale-[0.99] transition-transform"
      >
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/18 text-gold flex items-center justify-center shrink-0">
          <Moon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-themed font-bold leading-tight">Taraweeh tonight</p>
          <p className="text-themed-muted text-sm mt-0.5">
            {isha ? `After Isha · ${isha}` : "After Isha"} · read a juz
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-full bg-gold flex items-center justify-center shrink-0"
          style={{ color: ON_ACCENT }}
        >
          <ArrowRight size={18} />
        </div>
      </Link>

      {/* ── Last 10 nights / Laylatul Qadr.
          TESTING: always shown so it's reviewable off-season. For real seasonal
          behaviour, wrap this card in {isLaylatulQadrSeason() && ( ... )}. ── */}
      <div className="card-bg rounded-2xl border border-[var(--color-gold)]/30 p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/12 to-transparent pointer-events-none" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 bg-[var(--color-gold)]/15 text-gold text-[10px] font-bold uppercase tracking-[0.16em] rounded-full px-2.5 py-1">
            <Star size={11} /> Last 10 Nights
          </span>
          <p className="text-themed font-bold text-base mt-2.5 leading-snug">
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

      {/* Everyday shortcuts — adhan · qiblah · hadith · bookmarks */}
      <QuickActions />

      {/* Daily streak / checklist — the shared invariant, kept at the bottom */}
      <TodayStrip />

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
