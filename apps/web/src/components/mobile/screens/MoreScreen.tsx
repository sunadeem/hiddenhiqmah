"use client";

import Link from "next/link";
import { ChevronRight, CheckSquare } from "lucide-react";
import { navSections, type NavItem } from "@/data/home-content";

const MY_PATH_HEADING = "My Path in Islam";

// The Daily Checklist is only a sub-tab of Muslim Daily. Surface it as a durable,
// always-reachable entry in "My Path in Islam" so it's reachable from the More tab
// regardless of home style (the classic Home has no other route to it). NAV-2 / HOME-2.
const DAILY_CHECKLIST_ITEM: NavItem = {
  href: "/muslim-daily?tab=checklist",
  icon: CheckSquare,
  title: "Daily Checklist",
  titleAr: "قائمة اليوم",
  description: "Track today's prayers, adhkār & habits",
};

/**
 * `tools` = the app's own interactive features ("My Path in Islam"): Daily
 * Checklist, Circles, Hifz, Streaks, Family Profiles, Bookmarks, Settings.
 * These render as an elevated gold-tinted "tools tray" (gold surface, gold
 * hairline border, gold heading, solid gold-filled icon chips) so they read
 * instantly as app tools — distinct from the neutral reading-content cards
 * below, which keep subtle gold-outline icons on a plain surface.
 */
function SectionCard({
  heading,
  items,
  tools = false,
}: {
  heading: string;
  items: NavItem[];
  tools?: boolean;
}) {
  return (
    <div className="mb-5">
      <p
        className={`text-[11px] font-semibold uppercase tracking-wider px-2 mb-2 ${
          tools ? "text-gold" : "text-themed-muted/80"
        }`}
      >
        {heading}
      </p>
      <div
        className={`rounded-2xl border overflow-hidden ${
          tools
            ? "bg-[var(--color-gold)]/8 border-[var(--color-gold)]/30"
            : "card-bg sidebar-border"
        }`}
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          const notLast = i < items.length - 1;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 touch-manipulation ${
                tools
                  ? "active:bg-[var(--color-gold)]/10"
                  : "active:bg-[var(--overlay-subtle)]"
              } ${
                notLast
                  ? tools
                    ? "border-b border-[var(--color-gold)]/15"
                    : "border-b sidebar-border"
                  : ""
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  tools ? "bg-gold" : "bg-[var(--color-gold)]/15"
                }`}
              >
                <Icon
                  size={17}
                  className={tools ? "text-[#0a1628]" : "text-gold"}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-themed leading-tight">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-themed-muted truncate mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
              <ChevronRight size={16} className="text-themed-muted shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function MoreScreen() {
  const myPath = navSections.find((s) => s.heading === MY_PATH_HEADING);
  const rest = navSections.filter((s) => s.heading !== MY_PATH_HEADING);

  // "My Path in Islam" first — Daily Checklist injected at the top, Settings stays
  // as its last item — then a hard separator, then the website / content sections
  // in their original order. NAV-1 / NAV-2.
  const myPathItems = myPath
    ? [DAILY_CHECKLIST_ITEM, ...myPath.items]
    : [DAILY_CHECKLIST_ITEM];

  return (
    <div className="pb-4">
      <SectionCard heading={MY_PATH_HEADING} items={myPathItems} tools />

      {/* Hard separator between the personal / Settings block and the site content */}
      <div className="mx-2 mb-6 border-t sidebar-border" />

      {rest.map((section) => (
        <SectionCard
          key={section.heading}
          heading={section.heading}
          items={section.items}
        />
      ))}
    </div>
  );
}
