"use client";

import { Clock, Repeat, GraduationCap, Users, Compass, Check } from "lucide-react";
import type { TunedFor } from "@hidden-hiqmah/ui/lib/storage";

/**
 * Picker for the "Tuned for" preference. Unlike a dropdown, each option shows
 * what it actually does — the descriptions mirror how DailyPathHome.buildSteps
 * orders the day (and which single act FocusHome surfaces).
 */

const OPTIONS: {
  value: TunedFor;
  icon: typeof Clock;
  label: string;
  desc: string;
}[] = [
  { value: "prayer", icon: Clock, label: "Prayer", desc: "Leads with adhkār, du'ās & prayer prep." },
  { value: "hifz", icon: Repeat, label: "Hifz", desc: "Puts Qur'ān memorisation & review first." },
  { value: "new-muslim", icon: GraduationCap, label: "New Muslim", desc: "Starts with the essentials — pillars & how to pray." },
  { value: "family", icon: Users, label: "Family", desc: "Family time & kids' learning up top." },
  { value: "exploring", icon: Compass, label: "Exploring", desc: "A balanced mix — reading, reflection & discovery." },
];

export default function TunedForPicker({
  value,
  onChange,
}: {
  value: TunedFor;
  onChange: (v: TunedFor) => void;
}) {
  return (
    <div className="card-bg rounded-2xl border sidebar-border overflow-hidden divide-y divide-[var(--overlay-subtle)]">
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const isSel = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="w-full flex items-center gap-3 px-3 py-3 text-left touch-manipulation active:bg-[var(--overlay-subtle)]"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isSel ? "bg-[var(--color-gold)]/20 text-gold" : "bg-[var(--overlay-subtle)] text-themed-muted"
              }`}
            >
              <Icon size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold leading-tight ${isSel ? "text-gold" : "text-themed"}`}>
                {o.label}
              </p>
              <p className="text-xs text-themed-muted mt-0.5 leading-snug">{o.desc}</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isSel ? "border-[var(--color-gold)] bg-gold" : "sidebar-border"
              }`}
            >
              {isSel && <Check size={12} strokeWidth={3} className="text-[#0a1628]" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
