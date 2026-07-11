"use client";

import { useState } from "react";
import { LayoutDashboard, ShieldAlert, Users, MessageCircleQuestion, Activity, Users2, Settings, LogOut } from "lucide-react";
import { useAdminModeration, type Creds } from "./useAdminSection";
import OverviewTab from "./tabs/OverviewTab";
import UsersTab from "./tabs/UsersTab";
import AskTab from "./tabs/AskTab";
import EngagementTab from "./tabs/EngagementTab";
import CirclesTab from "./tabs/CirclesTab";
import ModerationTab from "./tabs/ModerationTab";
import SystemTab from "./tabs/SystemTab";

type TabKey = "overview" | "moderation" | "users" | "ask" | "engagement" | "circles" | "system";
const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "moderation", label: "Moderation", icon: ShieldAlert },
  { key: "users", label: "Users", icon: Users },
  { key: "ask", label: "Ask & Cost", icon: MessageCircleQuestion },
  { key: "engagement", label: "Engagement", icon: Activity },
  { key: "circles", label: "Circles", icon: Users2 },
  { key: "system", label: "System", icon: Settings },
];

export default function AdminShell({ creds, onLogout }: { creds: Creds; onLogout: () => void }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const mod = useAdminModeration(creds);
  const badge = (mod.data?.kpis.openReports ?? 0) + (mod.data?.kpis.suspended ?? 0);

  return (
    <div className="min-h-screen bg-themed">
      {/* Tab bar */}
      <div className="sticky top-0 z-20 sidebar-bg border-b sidebar-border safe-area-top">
        <div className="max-w-6xl mx-auto flex items-center gap-1 px-2 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  active ? "border-[var(--color-gold)] text-gold" : "border-transparent text-themed-muted hover:text-themed"
                }`}
              >
                <Icon size={15} />
                {t.label}
                {t.key === "moderation" && badge > 0 && (
                  <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </button>
            );
          })}
          <button onClick={onLogout} className="ml-auto flex items-center gap-1.5 px-3 py-3 text-sm text-themed-muted hover:text-red-400 whitespace-nowrap" title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {tab === "overview" && <OverviewTab creds={creds} onGoModeration={() => setTab("moderation")} />}
        {tab === "moderation" && <ModerationTab creds={creds} queue={mod} />}
        {tab === "users" && <UsersTab creds={creds} />}
        {tab === "ask" && <AskTab creds={creds} />}
        {tab === "engagement" && <EngagementTab creds={creds} />}
        {tab === "circles" && <CirclesTab creds={creds} />}
        {tab === "system" && <SystemTab creds={creds} />}
      </div>
    </div>
  );
}
