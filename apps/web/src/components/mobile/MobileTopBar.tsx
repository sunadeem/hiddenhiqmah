"use client";

import { usePathname } from "next/navigation";
import { getSectionTitle } from "./routes";

export default function MobileTopBar() {
  const pathname = usePathname();
  const title = getSectionTitle(pathname);

  return (
    <header
      className="shrink-0 sidebar-bg border-b sidebar-border"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="h-11 flex items-center justify-center px-3">
        <h1 className="text-base font-semibold text-themed truncate max-w-[70%]">
          {title}
        </h1>
      </div>
    </header>
  );
}
