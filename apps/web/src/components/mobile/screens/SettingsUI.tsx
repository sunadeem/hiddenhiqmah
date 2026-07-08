"use client";

import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { hapticLight } from "@/lib/mobile/haptics";

/* Shared Settings building blocks — used by SettingsScreen + NotificationsScreen. */

export function SettingsSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-themed-muted/80 uppercase tracking-wider px-2 mb-2">
        {heading}
      </p>
      <SectionShell>{children}</SectionShell>
    </div>
  );
}

function SectionShell({ children }: { children?: ReactNode }) {
  return (
    <div className="card-bg rounded-2xl border sidebar-border overflow-hidden divide-y divide-[var(--overlay-subtle)]">
      {children}
    </div>
  );
}

type RowProps = {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle?: string;
  rightValue?: string;
  rightChevron?: boolean;
  toggle?: boolean;
  onToggle?: (v: boolean) => void;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  danger?: boolean;
  indent?: boolean;
  badge?: string;
  badgeTone?: "gold" | "muted";
};

export function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  rightValue,
  rightChevron,
  toggle,
  onToggle,
  href,
  onClick,
  disabled,
  comingSoon,
  danger,
  indent,
  badge,
  badgeTone = "gold",
}: RowProps) {
  const content = (
    <div
      className={`flex items-center gap-3 px-3 py-3 ${indent ? "pl-12" : ""} ${
        disabled && !comingSoon ? "opacity-60" : ""
      } ${danger ? "text-red-400" : ""}`}
    >
      <div
        className={`w-9 h-9 rounded-lg ${
          danger ? "bg-red-500/15" : "bg-[var(--color-gold)]/15"
        } flex items-center justify-center shrink-0`}
      >
        <Icon size={17} className={danger ? "text-red-400" : "text-gold"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-semibold ${
              danger ? "text-red-400" : "text-themed"
            } leading-tight`}
          >
            {title}
          </p>
          {comingSoon && (
            <span className="text-[9px] uppercase tracking-wider text-themed-muted bg-[var(--overlay-subtle)] px-1.5 py-0.5 rounded">
              Soon
            </span>
          )}
          {badge && (
            <span
              className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                badgeTone === "gold"
                  ? "text-gold bg-[var(--color-gold)]/15"
                  : "text-themed-muted bg-[var(--overlay-subtle)]"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-themed-muted leading-snug mt-0.5">{subtitle}</p>
        )}
      </div>
      {rightValue && (
        <span className="text-xs text-themed-muted shrink-0 max-w-[40%] text-right truncate">
          {rightValue}
        </span>
      )}
      {toggle !== undefined && onToggle && (
        <Toggle value={toggle} onChange={onToggle} disabled={disabled} />
      )}
      {rightChevron && (
        <ChevronRight size={16} className="text-themed-muted shrink-0" />
      )}
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="touch-manipulation active:bg-[var(--overlay-subtle)] block">
        {content}
      </Link>
    );
  }
  if (onClick && !disabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="touch-manipulation active:bg-[var(--overlay-subtle)] block w-full text-left"
      >
        {content}
      </button>
    );
  }
  return content;
}

export function SettingsExpandableRow({
  icon: Icon,
  title,
  expanded,
  onToggleExpand,
  toggle,
  onToggle,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  expanded: boolean;
  onToggleExpand: () => void;
  toggle: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 touch-manipulation">
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-9 h-9 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0"
      >
        <Icon size={17} className="text-gold" />
      </button>
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex-1 min-w-0 text-left"
      >
        <p className="text-sm font-semibold text-themed leading-tight">{title}</p>
      </button>
      <button
        type="button"
        onClick={onToggleExpand}
        className="p-1 text-themed-muted"
        aria-label={expanded ? "Collapse" : "Expand"}
      >
        <ChevronDown
          size={16}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <Toggle value={toggle} onChange={onToggle} />
    </div>
  );
}

export function SettingsRowSelect({
  icon: Icon,
  title,
  value,
  options,
  onChange,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <div className="w-9 h-9 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
        <Icon size={17} className="text-gold" />
      </div>
      <p className="text-sm font-semibold text-themed flex-1 min-w-0 leading-tight">
        {title}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs text-themed bg-transparent border sidebar-border rounded-lg px-2 py-1.5 max-w-[55%] focus:outline-none focus:border-[var(--color-gold)]/40"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        hapticLight();
        onChange(!value);
      }}
      disabled={disabled}
      role="switch"
      aria-checked={value}
      className={`relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors touch-manipulation ${
        value ? "bg-[var(--color-gold)]" : "bg-[var(--overlay-strong)]"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          value ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
