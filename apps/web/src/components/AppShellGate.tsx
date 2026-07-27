"use client";

import dynamic from "next/dynamic";
import { useIsNative } from "@/lib/mobile/platform";
import AppShell from "./AppShell";

// Loaded lazily so the native shell's graph — the notification scheduler with
// its bundled reminders.json (~256KB) + daily inspirations, the geolocation and
// local-notification plugins — stays OUT of the shared root-layout chunk that
// every WEBSITE page downloads. None of it can run on the web.
// ssr:false costs nothing here: useIsNative() starts false and only flips in an
// effect, so this never rendered during SSR anyway — and in the app the chunk
// resolves from the local bundle, behind the splash screen.
const MobileShell = dynamic(() => import("./mobile/MobileShell"), { ssr: false });

export default function AppShellGate({ children }: { children: React.ReactNode }) {
  const native = useIsNative();
  if (native) return <MobileShell>{children}</MobileShell>;
  return <AppShell>{children}</AppShell>;
}
