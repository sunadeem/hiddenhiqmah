"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { addBookmark, removeBookmark, isBookmarked, type BookmarkType } from "../lib/storage";

interface BookmarkButtonProps {
  type: BookmarkType;
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  size?: number;
  className?: string;
}

export default function BookmarkButton({
  type,
  id,
  title,
  subtitle,
  href,
  size = 14,
  className = "",
}: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(type, id));
  }, [type, id]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      // Removing a bookmark is always allowed.
      removeBookmark(type, id);
      setSaved(false);
      return;
    }
    // Saving is a stateful action → require an account (web soft-gate; on mobile
    // the user is always signed in). The global is set by AuthGateProvider.
    const requireAuth = (window as unknown as Record<string, unknown>)
      .__requireAuth as
      | ((opts?: { title?: string; message?: string }) => boolean)
      | undefined;
    if (
      requireAuth &&
      !requireAuth({
        title: "Save this bookmark",
        message:
          "Create a free account to save bookmarks and keep them across your devices.",
      })
    ) {
      return; // signed out → gate modal shown, abort the save
    }
    addBookmark({ type, id, title, subtitle, href });
    setSaved(true);
  };

  return (
    <button
      onClick={toggle}
      className={`p-1.5 rounded-lg transition-colors shrink-0 ${
        saved
          ? "text-gold hover:bg-gold/10"
          : "text-themed-muted/40 hover:text-gold/60 hover:bg-gold/5"
      } ${className}`}
      title={saved ? "Remove bookmark" : "Bookmark"}
    >
      <Bookmark size={size} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
