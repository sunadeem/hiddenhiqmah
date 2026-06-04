"use client";

import { useIsNative } from "@/lib/mobile/platform";
import AppShell from "./AppShell";
import MobileShell from "./mobile/MobileShell";

export default function AppShellGate({ children }: { children: React.ReactNode }) {
  const native = useIsNative();
  if (native) return <MobileShell>{children}</MobileShell>;
  return <AppShell>{children}</AppShell>;
}
