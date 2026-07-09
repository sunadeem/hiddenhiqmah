"use client";

// StationMap — the visual "Your Path" journey. Renders the derived stations as a
// winding vertical trail (full) or a compact strip around where you are (peek).
// Colour tells status at a glance: green = memorized, amber = due, gold = the
// "you are here" learning station, grey = locked/upcoming. Tapping a station calls
// onTap so the screen can open its sheet or nav into Learn/Review.

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Lock, MapPin } from "lucide-react";
import type { HifzStation, StationStatus } from "@hidden-hiqmah/ui/lib/hifz/types";
import { hapticLight } from "@/lib/mobile/haptics";

const COLOR: Record<StationStatus, string> = {
  memorized: "#5ea77b",
  due: "#d99a3d",
  learning: "var(--color-gold)",
  locked: "#4c556c",
};
const TINT: Record<StationStatus, string> = {
  memorized: "rgba(94,167,123,0.16)",
  due: "rgba(217,154,61,0.16)",
  learning: "var(--color-gold-dim, rgba(201,168,76,0.16))",
  locked: "var(--overlay-soft, rgba(255,255,255,0.05))",
};

export interface StationMapProps {
  stations: HifzStation[];
  /** The gold "you are here" station key (from deriveStations). */
  currentKey?: string | null;
  onTap?: (station: HifzStation) => void;
  /** "full" = winding vertical trail; "peek" = compact strip around current. */
  variant?: "full" | "peek";
  /** peek only — how many stations to show around the current one. */
  peekWindow?: number;
  /** full only — fold a long trailing run of locked (not-yet-reached) stations. */
  collapseLocked?: boolean;
  className?: string;
}

function StationNode({ station, active }: { station: HifzStation; active: boolean }) {
  const color = COLOR[station.status];
  const tint = TINT[station.status];
  return (
    <span
      className="relative flex items-center justify-center rounded-full shrink-0"
      style={{
        width: active ? 44 : 34,
        height: active ? 44 : 34,
        background: tint,
        border: `1.5px solid ${color}`,
        boxShadow: active ? `0 0 0 4px var(--color-gold-dim, rgba(201,168,76,0.16))` : undefined,
        color,
      }}
    >
      {station.status === "memorized" ? (
        <Check size={active ? 20 : 16} strokeWidth={2.5} />
      ) : active || station.status === "learning" ? (
        // The gold "you are here" is always a pin — never a lock, even while resting.
        <MapPin size={active ? 20 : 16} strokeWidth={2.4} />
      ) : station.status === "locked" ? (
        <Lock size={14} />
      ) : (
        <span className="text-[12px] font-bold tabular-nums">{station.index + 1}</span>
      )}
    </span>
  );
}

/** Compact horizontal strip — for the Today hero. */
function PeekStrip({ stations, currentKey, onTap, peekWindow = 5, className }: StationMapProps) {
  if (stations.length === 0) return null;
  const curIdx = Math.max(
    0,
    stations.findIndex((s) => s.key === currentKey)
  );
  const half = Math.floor(peekWindow / 2);
  let start = Math.max(0, curIdx - half);
  const end = Math.min(stations.length, start + peekWindow);
  start = Math.max(0, end - peekWindow);
  const window = stations.slice(start, end);

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {window.map((s, i) => {
        const active = s.key === currentKey;
        return (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && (
              <span
                className="h-px w-4 shrink-0"
                style={{ background: "var(--color-gold)", opacity: 0.28 }}
              />
            )}
            <button
              type="button"
              onClick={() => {
                hapticLight();
                onTap?.(s);
              }}
              aria-label={s.label}
              className="touch-manipulation active:opacity-80"
            >
              <StationNode station={s} active={active} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** Full winding vertical trail — for the Path / My-Progress screen. When
 *  `collapseLocked` is set it folds BOTH the run of completed stations ABOVE "you
 *  are here" (into an "X memorized" summary) and the not-yet-reached tail below it
 *  ("N more ahead") — so your current step sits near the top, with only upcoming
 *  work beneath it and the page's forecast + "Add to my path" in reach. */
function Trail({ stations, currentKey, onTap, className, collapseLocked }: StationMapProps) {
  const [expandTop, setExpandTop] = useState(false);
  const [expandBottom, setExpandBottom] = useState(false);
  if (stations.length === 0) return null;

  const collapse = Boolean(collapseLocked);
  // Stations arrive status-grouped: [memorized…][due…][you-are-here][locked…].
  // Only fold fully-memorized ones — due-for-review (amber) stations stay visible.
  let done = 0;
  while (done < stations.length && stations[done].status === "memorized") done++;
  let lockedStart = stations.length;
  while (lockedStart > 0 && stations[lockedStart - 1].status === "locked") lockedStart--;
  const lockedCount = stations.length - lockedStart;

  // Collapse whichever run is LARGER; the smaller side + "you are here" stay visible.
  const topFold = collapse && done > 1 && done < stations.length && done >= lockedCount;
  const bottomFold = collapse && lockedCount > 1 && lockedCount > done;

  const start = topFold && !expandTop ? done : 0;
  const end = bottomFold && !expandBottom ? lockedStart : stations.length;
  const shown = stations.slice(start, end);
  const topHidden = done;
  const bottomHidden = lockedCount;

  const Pill = ({ up, label, onClick }: { up: boolean; label: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={() => {
        hapticLight();
        onClick();
      }}
      className="relative mx-auto flex items-center gap-1.5 rounded-full border border-dashed sidebar-border card-bg px-3.5 py-1.5 text-themed-muted touch-manipulation active:opacity-70"
    >
      {up ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* the trail spine */}
      <div
        className="absolute top-5 bottom-5 left-1/2 -translate-x-1/2 w-px"
        style={{ background: "var(--color-gold)", opacity: 0.24 }}
      />
      <div className="relative flex flex-col gap-2.5">
        {topFold && (
          <Pill
            up={expandTop}
            label={expandTop ? "Show less" : `${topHidden} memorized`}
            onClick={() => setExpandTop((e) => !e)}
          />
        )}

        {shown.map((s, i) => {
          const left = (start + i) % 2 === 0;
          const active = s.key === currentKey;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                hapticLight();
                onTap?.(s);
              }}
              className="relative w-full flex touch-manipulation active:opacity-80"
              style={{ justifyContent: left ? "flex-start" : "flex-end" }}
            >
              <span
                className="flex items-center gap-2.5"
                style={{ flexDirection: left ? "row" : "row-reverse", width: "50%" }}
              >
                <StationNode station={s} active={active} />
                <span
                  className="min-w-0 flex flex-col"
                  style={{ textAlign: left ? "left" : "right" }}
                >
                  <span
                    className={`truncate text-[13px] font-semibold ${
                      active ? "text-gold" : "text-themed"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="text-themed-muted text-[11px] capitalize">
                    {s.status === "learning" ? "You are here" : s.status}
                  </span>
                </span>
              </span>
            </button>
          );
        })}

        {bottomFold && (
          <Pill
            up={expandBottom}
            label={expandBottom ? "Show less" : `${bottomHidden} more ahead`}
            onClick={() => setExpandBottom((e) => !e)}
          />
        )}
      </div>
    </div>
  );
}

export default function StationMap(props: StationMapProps) {
  return props.variant === "peek" ? <PeekStrip {...props} /> : <Trail {...props} />;
}
