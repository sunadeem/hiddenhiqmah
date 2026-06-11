"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { isTabRoot } from "./routes";
import { navSections } from "@/data/home-content";

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

  return (
    <header
      className="shrink-0 bg-themed"
      style={{
        // Larger safe-area buffer pushes the row well clear of the iOS
        // status bar / Dynamic Island scroll-to-top zone
        paddingTop: "calc(env(safe-area-inset-top) + 30px)",
      }}
    >
      <div className="h-12 flex items-center px-2">
        {showBack && (
          <Link
            href={target}
            aria-label="Back"
            className="flex items-center justify-center w-12 h-12 rounded-full text-themed bg-white/5 active:bg-white/15 touch-manipulation"
            style={{ touchAction: "manipulation" }}
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </header>
  );
}
