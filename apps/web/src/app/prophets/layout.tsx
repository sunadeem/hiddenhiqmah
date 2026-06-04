"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { prophets } from "@/data/prophets";

export default function ProphetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDetailView = pathname !== "/prophets" && pathname !== "/prophets/family-tree";
  const activeSlug = pathname.split("/").pop();

  if (!isDetailView) {
    return <>{children}</>;
  }

  return (
    <div className="flex gap-0 lg:gap-6 -mx-4 md:-mx-6 lg:-mx-8 min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
      {/* Collapsed prophet sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r sidebar-border overflow-y-auto sticky top-0 h-screen">
        <div className="p-4">
          <Link
            href="/prophets"
            className="flex items-center gap-2 text-sm text-themed-muted hover:text-gold transition-colors mb-4"
          >
            <ChevronLeft size={16} />
            All Prophets
          </Link>

          <nav className="space-y-0.5">
            {prophets.map((prophet) => {
              const isActive = activeSlug === prophet.slug;
              return (
                <Link
                  key={prophet.slug}
                  href={`/prophets/${prophet.slug}`}
                  className="relative block"
                >
                  <motion.div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "text-gold"
                        : "text-themed-muted hover:text-themed"
                    }`}
                    whileHover={{ x: 2 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="prophet-active"
                        className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gold"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                      />
                    )}
                    <span className="font-medium truncate">
                      {prophet.name}
                    </span>
                    <span className="text-xs font-arabic opacity-60 ml-auto shrink-0">
                      {prophet.nameAr}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile back button + main content */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden px-4 pt-2 pb-2">
          <Link
            href="/prophets"
            className="inline-flex items-center gap-1 text-sm text-themed-muted hover:text-gold transition-colors"
          >
            <ChevronLeft size={16} />
            All Prophets
          </Link>
        </div>
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
