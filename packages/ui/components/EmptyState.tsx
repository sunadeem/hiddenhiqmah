"use client";

import type { LucideIcon } from "lucide-react";

/**
 * Polished empty state — a centered icon, title, optional subtitle, and an
 * optional action (e.g. a button/link). Use instead of blank space or bare
 * "nothing here" text.
 */
export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gold/70" />
      </div>
      <p className="text-themed font-semibold">{title}</p>
      {subtitle && (
        <p className="text-themed-muted text-sm mt-1.5 max-w-xs leading-relaxed">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
