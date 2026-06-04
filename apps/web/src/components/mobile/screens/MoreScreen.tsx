"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { navSections } from "@/data/home-content";

export default function MoreScreen() {
  return (
    <div className="pb-4">
      {navSections.map((section) => (
        <div key={section.heading} className="mb-5">
          <p className="text-[11px] font-semibold text-themed-muted/80 uppercase tracking-wider px-2 mb-2">
            {section.heading}
          </p>
          <div className="card-bg rounded-2xl border sidebar-border overflow-hidden">
            {section.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 touch-manipulation active:bg-white/5 ${
                    i < section.items.length - 1
                      ? "border-b sidebar-border"
                      : ""
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
                  <ChevronRight
                    size={16}
                    className="text-themed-muted shrink-0"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
