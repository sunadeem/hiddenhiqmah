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

function SectionCard({ heading, items }: { heading: string; items: NavItem[] }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold text-themed-muted/80 uppercase tracking-wider px-2 mb-2">
        {heading}
      </p>
      <div className="card-bg rounded-2xl border sidebar-border overflow-hidden">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 touch-manipulation active:bg-[var(--overlay-subtle)] ${
                i < items.length - 1 ? "border-b sidebar-border" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
                <Icon size={17} className="text-gold" />
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
      <SectionCard heading={MY_PATH_HEADING} items={myPathItems} />

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
