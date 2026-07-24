import { Suspense } from "react";
import AppearanceScreen from "@/components/mobile/screens/AppearanceScreen";

export const metadata = {
  title: "Appearance — Hidden Hiqmah",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-themed-muted">Loading…</div>}>
      <AppearanceScreen />
    </Suspense>
  );
}
