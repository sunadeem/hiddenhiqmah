"use client";

import { useEffect, useState } from "react";
import {
  getHomePrefs,
  setHomePrefs,
  recordVisit,
  type HomeStyle,
  type TunedFor,
} from "@hidden-hiqmah/ui/lib/storage";
import TodayStrip from "./TodayStrip";
import DailyPathHome from "./DailyPathHome";
import FocusHome from "./FocusHome";
import RamadanHome from "./RamadanHome";
import ActiveProfileBanner from "./ActiveProfileBanner";
import ClassicHome from "../screens/HomeScreen";

/**
 * The Home host. Home is a swappable *style*, not a fixed layout:
 *   - "daily-path" (default) — the adaptive day ribbon, tuned by onboarding
 *   - "classic"             — the original dashboard (HomeScreen), kept as-is
 *   - "focus"               — minimal: next prayer + one act
 * During Ramadan (Hijri month 9), if ramadanAuto is on, the Ramadan home takes
 * over (overriding the base style) — with a one-tap opt-out.
 *
 * Core rule: the style only changes what's *previewed* on Home, never what's
 * *reachable*. The invariant TodayStrip (the shallow entry into the full daily
 * checklist) sits above Daily Path & Focus; Classic keeps its own StreakCard.
 */
export default function MobileHome() {
  const [style, setStyle] = useState<HomeStyle | null>(null);
  const [tunedFor, setTunedFor] = useState<TunedFor>("exploring");
  const [ramadan, setRamadan] = useState(false);

  useEffect(() => {
    recordVisit();
    const p = getHomePrefs();
    setStyle(p.homeStyle);
    setTunedFor(p.tunedFor);
    // TESTING: manual — show whenever the toggle is on, regardless of season.
    // Restore `isRamadanActive() && p.ramadanAuto` (and re-import isRamadanActive)
    // for real auto-seasonal behaviour.
    setRamadan(p.ramadanAuto);
  }, []);

  const useUsualHome = () => {
    setHomePrefs({ ramadanAuto: false });
    setRamadan(false);
  };

  // First client tick before prefs resolve — hold a stable container.
  if (style === null) return <div className="space-y-3 pb-4" />;

  if (ramadan)
    return (
      <div className="space-y-3 pb-4">
        <ActiveProfileBanner />
        <TodayStrip />
        <RamadanHome onUseUsualHome={useUsualHome} />
      </div>
    );

  if (style === "classic")
    return (
      <div className="space-y-3">
        <ActiveProfileBanner />
        <ClassicHome />
      </div>
    );

  return (
    <div className="space-y-3 pb-4">
      <ActiveProfileBanner />
      <TodayStrip />
      {style === "focus" ? (
        <FocusHome tunedFor={tunedFor} />
      ) : (
        <DailyPathHome tunedFor={tunedFor} />
      )}
    </div>
  );
}
