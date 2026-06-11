import { Suspense } from "react";
import SignInScreen from "@/components/mobile/screens/SignInScreen";

export const metadata = {
  title: "Sign in — Hidden Hiqmah",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-themed-muted">Loading...</div>}>
      <SignInScreen />
    </Suspense>
  );
}
