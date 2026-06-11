"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { isTabRoot } from "./routes";
import { navSections } from "@/data/home-content";
import { hapticLight } from "@/lib/mobile/haptics";

function resolveBackTarget(pathname: string): string {
  // Settings sub-pages
  if (pathname === "/privacy") return "/settings";

  // Items reachable from /more → back to More
  const allMoreHrefs = navSections.flatMap((s) => s.items.map((i) => i.href));
  const match = allMoreHrefs.find(
    (href) => pathname === href || pathname.startsWith(href + "/")
  );
  return match ? "/more" : "/";
}

export default function MobileTopBar() {
  const pathname = usePathname();
  const showBack = !isTabRoot(pathname);
  const target = resolveBackTarget(pathname);

  // Tab roots (Home/Daily/Quran/More) have no back button — render a slim
  // header. Use max(env, 60px): env(safe-area-inset-top) is unreliable in this
  // Capacitor WebView (often ~0), so the 60px floor GUARANTEES content clears
  // the status bar / Dynamic Island. Content must never sit under it.
  if (!showBack) {
    return (
      <header
        className="shrink-0 bg-themed"
        style={{ paddingTop: "max(env(safe-area-inset-top), 60px)" }}
      />
    );
  }

  return (
    <header
      className="shrink-0 bg-themed"
      style={{
        // Larger safe-area buffer pushes the back button well clear of the iOS
        // status bar / Dynamic Island scroll-to-top zone
        paddingTop: "calc(env(safe-area-inset-top) + 30px)",
      }}
    >
      <div className="h-12 flex items-center px-2">
        <Link
          href={target}
          onClick={() => hapticLight()}
          aria-label="Back"
          className="flex items-center justify-center w-12 h-12 rounded-full text-themed bg-white/5 active:bg-white/15 touch-manipulation"
          style={{ touchAction: "manipulation" }}
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </Link>
      </div>
    </header>
  );
}
