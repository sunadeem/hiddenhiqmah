"use client";

import { X } from "lucide-react";
import { fmt, fmtUsd, fmtWhen, ago } from "./ui";
import type { UserRow } from "./tabs/UsersTab";

export default function UserDrawer({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const rows: [string, string][] = [
    ["Email", user.email ?? "—"],
    ["Joined", fmtWhen(user.joinedAt)],
    ["Last active", ago(user.lastActiveAt)],
    ["Ask messages", `${fmt(user.ask)} (${fmtUsd(user.askCost)})`],
    ["Hifz cards", fmt(user.hifz)],
    ["Dhikr recited", fmt(user.dhikr)],
    ["Circles", fmt(user.circles)],
    ["Current streak", fmt(user.streak)],
    ["Strikes", user.strikes > 0 ? `${user.strikes}${user.suspended ? " · suspended" : ""}` : "none"],
  ];
  return (
    <div className="fixed inset-0 z-[80] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-sm h-full bg-themed border-l sidebar-border overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b sidebar-border">
          <h3 className="text-base font-semibold text-themed truncate">{user.name || user.email || user.id.slice(0, 8) + "…"}</h3>
          <button onClick={onClose} aria-label="Close" className="p-1 text-themed-muted hover:text-themed"><X size={18} /></button>
        </div>
        <div className="p-4">
          <dl className="space-y-2.5">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-themed-muted">{label}</dt>
                <dd className="text-themed text-right">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-themed-muted/60 mt-4">Manage strikes / suspension from the Moderation tab.</p>
        </div>
      </div>
    </div>
  );
}
