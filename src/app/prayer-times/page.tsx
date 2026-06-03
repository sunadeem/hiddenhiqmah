"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrayerTimesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/salah?tab=times");
  }, [router]);
  return null;
}
