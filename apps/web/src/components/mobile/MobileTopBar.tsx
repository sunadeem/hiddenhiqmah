"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { isTabRoot } from "./routes";
import { hapticLight } from "@/lib/mobile/haptics";

// How many in-app navigations have happened since app load. >1 means there's
// real history to go back through (router.back() will land where you came from).
let navCount = 0;

/** Fallback parent when there's no in-app history (cold launch / deep link). */
function parentPath(pathname: string): string {
  if (pathname === "/privacy") return "/settings";
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 1) return "/" + parts.slice(0, -1).join("/");
  return "/";
}

export default function MobileTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  // The Quran surah reader renders its own top bar (back + title + settings),
  // so the global bar drops to a slim status-bar spacer to avoid a double back.
  const isSurahReader = /^\/quran\/[^/]+/.test(pathname);
  const showBack = !isTabRoot(pathname) && !isSurahReader;

  useEffect(() => {
    navCount += 1;
  }, [pathname]);

  // Tab roots (Home/Daily/Quran/More/Ask area) have no back button — render a
  // slim header. max(env, 60px) guarantees content clears the status bar /
  // Dynamic Island (env(safe-area-inset-top) is unreliable in this WebView).
  if (!showBack) {
    return (
      <header
        className="shrink-0 bg-themed"
        style={{ paddingTop: "max(env(safe-area-inset-top), 60px)" }}
      />
    );
  }

  const handleBack = () => {
    hapticLight();
    // Prefer real history so back always returns where you came from.
    if (navCount > 1) {
      router.back();
    } else {
      router.push(parentPath(pathname));
    }
  };

  return (
    <header
      className="shrink-0 bg-themed"
      style={{ paddingTop: "max(env(safe-area-inset-top), 60px)" }}
    >
      <div className="h-12 flex items-center px-2">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-12 h-12 rounded-full text-themed bg-white/5 active:bg-white/15 touch-manipulation"
          style={{ touchAction: "manipulation" }}
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}
