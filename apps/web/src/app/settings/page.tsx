import { Suspense } from "react";
import SettingsScreen from "@/components/mobile/screens/SettingsScreen";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-themed-muted">Loading…</div>}>
      <SettingsScreen />
    </Suspense>
  );
}
