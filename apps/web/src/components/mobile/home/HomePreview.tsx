"use client";

import TodayStrip from "./TodayStrip";
import DailyPathHome from "./DailyPathHome";
import FocusHome from "./FocusHome";
import RamadanHome from "./RamadanHome";
import ClassicHome from "../screens/HomeScreen";
import type { HomeStyle, TunedFor } from "@hidden-hiqmah/ui/lib/storage";

// Style union usable in the preview — base styles + the seasonal Ramadan home.
export type PreviewStyle = HomeStyle | "ramadan";

/**
 * Renders the live Home body for a given style — the same composition MobileHome
 * uses, minus the visit-recording side effect. Used by the full-size preview so
 * "preview" shows the real thing (real prayer times, streak, etc.), never a
 * mock that could drift from the actual home.
 */
export default function HomePreview({
  style,
  tunedFor,
}: {
  style: PreviewStyle;
  tunedFor: TunedFor;
}) {
  if (style === "classic") return <ClassicHome />;
  // Ramadan home carries its own streak strip at the bottom (and its own blue
  // palette wrapper), so it's rendered standalone — no top TodayStrip.
  if (style === "ramadan") return <RamadanHome />;
  return (
    <div className="space-y-3">
      <TodayStrip />
      {style === "focus" ? (
        <FocusHome tunedFor={tunedFor} />
      ) : (
        <DailyPathHome tunedFor={tunedFor} />
      )}
    </div>
  );
}
