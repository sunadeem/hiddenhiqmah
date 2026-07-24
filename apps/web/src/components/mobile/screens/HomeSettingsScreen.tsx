"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Moon } from "lucide-react";
import HomeStylePicker from "../home/HomeStylePicker";
import TunedForPicker from "../home/TunedForPicker";
import { SettingsSection, SettingsRow } from "./SettingsUI";
import {
  getHomePrefs,
  setHomePrefs,
  type HomePrefs,
} from "@hidden-hiqmah/ui/lib/storage";

// Mobile-home personalization, moved out of the main Settings screen into its
// own nested page (/settings/home). The web home is a fixed grid, so these
// controls only surface on native (the nav row into here is native-gated).
export default function HomeSettingsScreen() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");
  const [hydrated, setHydrated] = useState(false);
  const [home, setHomeState] = useState<HomePrefs | null>(null);

  useEffect(() => {
    setHomeState(getHomePrefs());
    setHydrated(true);
  }, []);

  // Deep-link from the Home "Tuned for" chip (?section=tuned-for): scroll to the
  // Tuned-for block once it exists (gated on hydration). (HOME-3)
  useEffect(() => {
    if (section !== "tuned-for" || !hydrated) return;
    document
      .getElementById("tuned-for")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [section, hydrated]);

  const updateHome = (patch: Partial<HomePrefs>) => {
    setHomePrefs(patch);
    setHomeState((h) => (h ? { ...h, ...patch } : h));
  };

  if (!hydrated || !home) {
    return (
      <div className="space-y-3 pb-4">
        <p className="text-center text-themed-muted text-sm py-12">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6 max-w-xl mx-auto w-full">
      <div className="text-center pt-1">
        <h1 className="text-2xl font-bold text-themed">Home</h1>
      </div>

      <SettingsSection heading="Home">
        <SettingsRow
          icon={Moon}
          title="Ramadan home"
          subtitle={
            home.ramadanAuto
              ? "On — showing the festive Ramadan home"
              : "Turn on to use the festive Ramadan home"
          }
          toggle={home.ramadanAuto}
          onToggle={(v) => updateHome({ ramadanAuto: v })}
        />
      </SettingsSection>

      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-themed-muted/80 uppercase tracking-wider px-2">
          Home Style
        </p>

        <div>
          <p className="text-xs font-medium text-themed-muted px-2 mb-2">Layout</p>
          <HomeStylePicker
            value={home.homeStyle}
            tunedFor={home.tunedFor}
            ramadanAuto={home.ramadanAuto}
            onChange={(v) => updateHome({ homeStyle: v })}
            onToggleRamadan={(on) => updateHome({ ramadanAuto: on })}
          />
        </div>

        <div id="tuned-for" className="scroll-mt-4">
          <p className="text-xs font-medium text-themed-muted px-2 mb-2">Tuned for</p>
          <TunedForPicker
            value={home.tunedFor}
            onChange={(v) => updateHome({ tunedFor: v })}
          />
          <p className="text-xs text-themed-muted mt-2 px-2 leading-relaxed">
            Shapes your Daily Path order (and the Focus home&apos;s suggested act) around
            what matters most to you right now.
          </p>
        </div>
      </div>
    </div>
  );
}
