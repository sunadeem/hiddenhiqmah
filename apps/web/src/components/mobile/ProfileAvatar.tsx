"use client";

import {
  Moon,
  Star,
  Sun,
  BookOpen,
  Sparkles,
  Heart,
  Rocket,
  Flower2,
  type LucideIcon,
} from "lucide-react";
import type { Profile } from "@/lib/household";

// Curated icon set a profile can OPTIONALLY pick. The default (no avatar) is the
// person's initials — cleaner + more personal than the old emoji faces (FAMILY-3).
export const PROFILE_ICONS: { key: string; Icon: LucideIcon }[] = [
  { key: "moon", Icon: Moon },
  { key: "star", Icon: Star },
  { key: "sun", Icon: Sun },
  { key: "book", Icon: BookOpen },
  { key: "sparkles", Icon: Sparkles },
  { key: "heart", Icon: Heart },
  { key: "rocket", Icon: Rocket },
  { key: "flower", Icon: Flower2 },
];

const PROFILE_ICON_BY_KEY: Record<string, LucideIcon> = Object.fromEntries(
  PROFILE_ICONS.map((i) => [i.key, i.Icon])
);

/** First initial of a name (fallback avatar). */
export function initialsOf(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

/**
 * Renders a profile's avatar CONTENT — a curated icon, a legacy emoji, or the
 * initials — to sit inside your own sized/coloured circle.
 */
export function ProfileAvatarContent({
  profile,
  iconSize = 20,
}: {
  profile: Pick<Profile, "avatar" | "name">;
  iconSize?: number;
}) {
  const av = profile.avatar;
  if (av && PROFILE_ICON_BY_KEY[av]) {
    const Icon = PROFILE_ICON_BY_KEY[av];
    return <Icon size={iconSize} />;
  }
  if (av) return <>{av}</>; // legacy emoji from before FAMILY-3
  return <>{initialsOf(profile.name)}</>;
}
