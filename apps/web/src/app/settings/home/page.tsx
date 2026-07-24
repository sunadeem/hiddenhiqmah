import { Suspense } from "react";
import HomeSettingsScreen from "@/components/mobile/screens/HomeSettingsScreen";

export const metadata = {
  title: "Home — Hidden Hiqmah",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-themed-muted">Loading…</div>}>
      <HomeSettingsScreen />
    </Suspense>
  );
}
