"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Share2,
  ArrowUpRight,
  Play,
} from "lucide-react";
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
  type BookmarkType,
} from "@hidden-hiqmah/ui/lib/storage";
import { hapticMedium, hapticLight, hapticSuccess } from "@/lib/mobile/haptics";

export type LongPressItem = {
  bookmarkType: BookmarkType;
  bookmarkId: string;
  title: string;
  arabic?: string;
  english: string;
  reference: string;
  href?: string;
  onPlay?: () => void;
};

/** Detects a long-press (without movement) on its children. */
export function useLongPress(onLongPress: () => void, ms = 480) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return {
    onTouchStart: (e: React.TouchEvent) => {
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      clear();
      timer.current = setTimeout(onLongPress, ms);
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (!start.current) return;
      const dx = Math.abs(e.touches[0].clientX - start.current.x);
      const dy = Math.abs(e.touches[0].clientY - start.current.y);
      if (dx > 10 || dy > 10) clear(); // moved → it's a scroll/swipe
    },
    onTouchEnd: clear,
    onTouchCancel: clear,
  };
}

export default function LongPressActions({
  item,
  children,
}: {
  item: LongPressItem;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const longPress = useLongPress(() => {
    hapticMedium();
    setOpen(true);
  });

  return (
    <div {...longPress} style={{ WebkitTouchCallout: "none" }}>
      {children}
      <ActionSheet item={item} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export function ActionSheet({
  item,
  open,
  onClose,
}: {
  item: LongPressItem;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) {
      setBookmarked(isBookmarked(item.bookmarkType, item.bookmarkId));
      setCopied(false);
    }
  }, [open, item.bookmarkType, item.bookmarkId]);

  if (!mounted) return null;

  const shareText = `${item.arabic ? item.arabic + "\n\n" : ""}${item.english}\n— ${item.reference}`;

  const toggleBookmark = () => {
    hapticLight();
    if (bookmarked) {
      removeBookmark(item.bookmarkType, item.bookmarkId);
      setBookmarked(false);
    } else {
      addBookmark({
        type: item.bookmarkType,
        id: item.bookmarkId,
        title: item.title,
        subtitle: item.reference,
        href: item.href,
      });
      setBookmarked(true);
      hapticSuccess();
    }
  };

  const copy = async () => {
    hapticLight();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(onClose, 600);
    } catch {
      setCopied(false);
    }
  };

  const share = async () => {
    hapticLight();
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({
        title: item.title,
        text: shareText,
        dialogTitle: "Share",
      });
    } catch {
      // user cancelled or unavailable
    }
    onClose();
  };

  const openSource = () => {
    if (!item.href) return;
    hapticLight();
    onClose();
    router.push(item.href);
  };

  const play = () => {
    if (!item.onPlay) return;
    hapticLight();
    onClose();
    item.onPlay();
  };

  const rows: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    show: boolean;
  }[] = [
    {
      icon: bookmarked ? (
        <BookmarkCheck size={20} className="text-gold" />
      ) : (
        <Bookmark size={20} className="text-themed" />
      ),
      label: bookmarked ? "Remove bookmark" : "Bookmark",
      onClick: toggleBookmark,
      show: true,
    },
    {
      icon: copied ? (
        <Check size={20} className="text-green-400" />
      ) : (
        <Copy size={20} className="text-themed" />
      ),
      label: copied ? "Copied" : "Copy",
      onClick: copy,
      show: true,
    },
    {
      icon: <Share2 size={20} className="text-themed" />,
      label: "Share",
      onClick: share,
      show: true,
    },
    {
      icon: <ArrowUpRight size={20} className="text-themed" />,
      label: "Open",
      onClick: openSource,
      show: !!item.href,
    },
    {
      icon: <Play size={20} className="text-themed" />,
      label: "Play recitation",
      onClick: play,
      show: !!item.onPlay,
    },
  ];

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[71] bg-themed border-t sidebar-border rounded-t-2xl overflow-hidden"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-[var(--overlay-strong)]" />
            </div>
            <p className="px-5 py-2 text-xs text-themed-muted truncate">
              {item.reference}
            </p>
            <div className="divide-y divide-[var(--overlay-subtle)]">
              {rows
                .filter((r) => r.show)
                .map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={r.onClick}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left active:bg-[var(--overlay-subtle)] touch-manipulation"
                  >
                    {r.icon}
                    <span className="text-themed text-sm font-medium">
                      {r.label}
                    </span>
                  </button>
                ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
