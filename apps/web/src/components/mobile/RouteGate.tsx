"use client";

import { useIsNative } from "@/lib/mobile/platform";

/**
 * RouteGate — switches between mobile-tuned and web rendering per route.
 *
 * Each route's page.tsx becomes a thin gate that passes both implementations:
 *   export default function Page() {
 *     return <RouteGate mobile={<MobileX />} web={<WebX />} />
 *   }
 *
 * Mobile screens live in apps/web/src/components/mobile/screens/.
 * Web pages stay in apps/web/src/app/ (or apps/web/src/components/web/).
 */
export default function RouteGate({
  mobile,
  web,
}: {
  mobile: React.ReactNode;
  web: React.ReactNode;
}) {
  const isNative = useIsNative();
  return <>{isNative ? mobile : web}</>;
}
