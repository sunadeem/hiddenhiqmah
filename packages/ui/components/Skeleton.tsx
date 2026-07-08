"use client";

/**
 * Shimmer placeholder block. Compose several to mimic the shape of the content
 * that's loading (a list row, a card, a line of text).
 *
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton className="h-24 w-full rounded-2xl" />
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-[var(--overlay-medium)] ${className}`} />
  );
}

/** A stack of skeleton lines — handy for text blocks. */
export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/** A skeleton card placeholder (rounded box). */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`card-bg rounded-2xl border sidebar-border p-4 ${className}`}
    >
      <Skeleton className="h-4 w-24 mb-3" />
      <SkeletonText lines={2} />
    </div>
  );
}
