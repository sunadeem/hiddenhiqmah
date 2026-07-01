"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  getActiveProfile,
  PRIMARY_ID,
  PROFILE_CHANGED_EVENT,
  type Profile,
} from "@/lib/household";

/**
 * Shown on Home only when a non-primary (child) profile is active, so the user
 * always knows whose day they're looking at + can switch back. Renders nothing
 * for the primary profile (the default), so it's invisible unless Family
 * profiles are in use.
 */
export default function ActiveProfileBanner() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const sync = () => setProfile(getActiveProfile());
    sync();
    window.addEventListener(PROFILE_CHANGED_EVENT, sync);
    return () => window.removeEventListener(PROFILE_CHANGED_EVENT, sync);
  }, []);

  if (!profile || profile.id === PRIMARY_ID) return null;

  return (
    <Link
      href="/household"
      className="flex items-center gap-2.5 rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-4 py-2.5 touch-manipulation active:scale-[0.99] transition-transform"
    >
      <span className="w-7 h-7 rounded-full bg-[var(--color-gold)]/20 text-gold flex items-center justify-center text-sm font-bold shrink-0">
        {profile.avatar || profile.name[0]?.toUpperCase()}
      </span>
      <span className="flex-1 min-w-0 text-sm text-themed">
        Viewing <span className="font-semibold text-gold">{profile.name}</span>&apos;s day
      </span>
      <span className="text-xs text-themed-muted shrink-0">Switch</span>
      <ChevronRight size={16} className="text-themed-muted shrink-0" />
    </Link>
  );
}
