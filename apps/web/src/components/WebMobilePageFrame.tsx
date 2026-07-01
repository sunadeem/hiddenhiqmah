"use client";

import type { ReactNode } from "react";
import { useIsNative } from "@/lib/mobile/platform";
import PageHeader from "@hidden-hiqmah/ui/components/PageHeader";

/**
 * Wraps a mobile screen that's also reachable on the website. On native the
 * mobile shell owns the chrome, so we render the screen bare. On web we give it
 * the site's page pattern: a centered, narrower column (so it doesn't span the
 * whole page) and the standard PageHeader when a title is provided. Screens that
 * already render their own header (e.g. Hifz's back + view title) pass no title
 * and just get the centering.
 */
export default function WebMobilePageFrame({
  title,
  titleAr,
  subtitle,
  children,
}: {
  title?: string;
  titleAr?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const isNative = useIsNative();
  if (isNative) return <>{children}</>;
  return (
    <div className="max-w-2xl mx-auto">
      {title && (
        <PageHeader title={title} titleAr={titleAr ?? ""} subtitle={subtitle ?? ""} />
      )}
      {children}
    </div>
  );
}
