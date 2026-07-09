"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  getMyCirclesWithDetail,
  getCircleActivity,
  timeAgo,
  type CircleDetail,
  type CircleActivity,
} from "@/lib/circles";
import { hapticLight } from "@/lib/mobile/haptics";

/** One human line for a circle's most recent activity event. */
function activityLine(a: CircleActivity): string {
  const who = a.actor_name || "Someone";
  switch (a.kind) {
    case "progress":
      return `${who} logged progress`;
    case "joined":
      return `${who} joined`;
    case "left":
    case "removed":
      return `${who} left`;
    case "goal_reached":
      return "Goal reached — mā shāʼ Allāh";
    case "dua":
      return `${who} sent a duʿā`;
    case "message":
      return `${who} sent a message`;
    case "renamed":
      return "Circle renamed";
    case "goal_updated":
      return "Goal updated";
    default:
      return "New activity";
  }
}

/** Compact gold progress ring with the percent in its centre. */
function Ring({ pct }: { pct: number }) {
  const r = 17;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <div className="relative shrink-0" style={{ width: 42, height: 42 }}>
      <svg width={42} height={42} viewBox="0 0 42 42" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={21}
          cy={21}
          r={r}
          fill="none"
          stroke="var(--overlay-soft, rgba(255,255,255,0.08))"
          strokeWidth={3.5}
        />
        <circle
          cx={21}
          cy={21}
          r={r}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9.5px] font-bold text-gold tabular-nums">
        {pct}%
      </span>
    </div>
  );
}

/**
 * Members-only Home nudge: your most-recent circle's progress ring + latest
 * activity, deep-linking into Circles. Renders NOTHING when you're not in a circle
 * (the launch-day default) — non-members never see dead UI, and members get
 * one-tap access from the screen they already open. Circles gave up its tab-bar
 * slot to Hifz; this card + the More-tab badge are how it stays reachable. Sits
 * BELOW the day's worship content on Home so it never competes with prayer/Quran.
 */
export default function CirclesHomeCard() {
  const router = useRouter();
  const [primary, setPrimary] = useState<CircleDetail | null>(null);
  const [extra, setExtra] = useState(0);
  const [latest, setLatest] = useState<CircleActivity | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      let circles: CircleDetail[];
      try {
        circles = await getMyCirclesWithDetail();
      } catch {
        if (alive) setPrimary(null);
        return;
      }
      if (!alive) return;
      if (!circles.length) {
        setPrimary(null);
        return;
      }
      // Feature the most recently created circle (getMyCircles returns oldest-first)
      // so a member who just joined an active circle sees it, not a dormant old one.
      const p = [...circles].sort((a, b) =>
        a.circle.created_at < b.circle.created_at ? 1 : -1
      )[0];
      setPrimary(p);
      setExtra(circles.length - 1);
      // A failed activity fetch must NOT tear the card down — the ring + total line
      // is still valid from data we already have; just leave `latest` null.
      try {
        const acts = await getCircleActivity(p.circle.id, 1);
        if (alive) setLatest(acts[0] ?? null);
      } catch {
        if (alive) setLatest(null);
      }
    };
    load();
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    const onChanged = () => load();
    window.addEventListener("hiqmah:circles-changed", onChanged);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("hiqmah:circles-changed", onChanged);
    };
  }, []);

  if (!primary) return null;

  const { circle, total } = primary;
  const pct = Math.min(100, Math.round((total / Math.max(1, circle.goal_target)) * 100));
  const line = latest ? activityLine(latest) : `${total} / ${circle.goal_target} ${circle.goal_unit}`;
  const when = latest ? ` · ${timeAgo(latest.created_at)}` : "";

  return (
    <button
      type="button"
      onClick={() => {
        hapticLight();
        router.push("/circles");
      }}
      className="w-full flex items-center gap-3 rounded-2xl card-bg border sidebar-border px-4 py-3.5 text-left touch-manipulation active:opacity-90"
    >
      <Ring pct={pct} />
      <span className="min-w-0 flex-1">
        <span className="block text-[9px] tracking-[0.16em] uppercase text-gold mb-0.5">
          Your circle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="block truncate text-themed text-[14px] font-semibold">
            {circle.name}
          </span>
          {extra > 0 && (
            <span className="shrink-0 text-[11px] text-themed-muted">+{extra}</span>
          )}
        </span>
        <span className="block truncate text-themed-muted text-[12px] mt-0.5">
          {line}
          {when}
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-themed-muted" />
    </button>
  );
}
