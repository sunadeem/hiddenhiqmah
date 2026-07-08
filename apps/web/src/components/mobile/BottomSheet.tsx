"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Reusable full-screen bottom sheet:
 *  - Slides up from bottom, drag handle + tap to close, swipe down to dismiss
 *  - Portaled to document.body so it stacks above everything else
 *  - Same animation + drag UX as MobilePlayer's expanded sheet
 *
 * Usage:
 *   <BottomSheet open={open} onClose={...} title="Ask Hiqmah">
 *     <YourContent />
 *   </BottomSheet>
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && <Sheet title={title} onClose={onClose}>{children}</Sheet>}
    </AnimatePresence>,
    document.body
  );
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dragControls = useDragControls();

  return (
    <motion.div
      key="bottom-sheet"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 320 }}
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0 }}
      dragElastic={{ top: 0, bottom: 0.4 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 140 || info.velocity.y > 500) onClose();
      }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div
        className="shrink-0 relative"
        style={{
          paddingTop: "max(calc(env(safe-area-inset-top) + 0.75rem), 4rem)",
        }}
      >
        <div
          onPointerDown={(e) => dragControls.start(e)}
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Drag down or tap to close"
          className="absolute inset-x-0 top-0 flex justify-center pt-2 pb-2 touch-manipulation cursor-grab active:cursor-grabbing"
          style={{
            paddingTop:
              "max(calc(env(safe-area-inset-top) + 0.5rem), 3.5rem)",
            touchAction: "none",
          }}
        >
          <div className="w-12 h-1.5 rounded-full bg-[var(--overlay-strong)]" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 p-3 rounded-full bg-[var(--overlay-medium)] text-themed touch-manipulation"
          style={{
            top: "max(calc(env(safe-area-inset-top) + 0.5rem), 3.5rem)",
          }}
        >
          <ChevronDown size={22} />
        </button>
        {title && (
          <div className="text-center pb-3 pt-1">
            <span className="text-base font-semibold text-themed">{title}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
        {children}
      </div>
    </motion.div>
  );
}
