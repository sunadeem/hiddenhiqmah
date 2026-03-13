"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  /** Number of tabs before switching to dropdown on mobile. Default 6. */
  mobileThreshold?: number;
  className?: string;
}

export default function TabBar({
  tabs,
  activeTab,
  onTabChange,
  mobileThreshold = 6,
  className = "",
}: TabBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const useDropdown = tabs.length > mobileThreshold;

  const activeLabel = tabs.find((t) => t.key === activeTab)?.label || "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  return (
    <div className={className}>
      {/* Mobile dropdown (only when many tabs) */}
      {useDropdown && (
        <div ref={dropdownRef} className="relative md:hidden mb-4">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl card-bg border sidebar-border text-themed font-medium text-sm"
          >
            <span>{activeLabel}</span>
            <ChevronDown
              size={18}
              className={`text-gold transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {dropdownOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-xl card-bg border sidebar-border shadow-xl max-h-72 overflow-y-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      onTabChange(tab.key);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-colors ${
                      isActive
                        ? "bg-gold/15 text-gold font-medium"
                        : "text-themed-muted hover:text-themed hover:bg-white/5"
                    }`}
                  >
                    {tab.icon}
                    <span className="flex-1">{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-xs ${isActive ? "text-gold/70" : "opacity-50"}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Desktop pills (always shown) / Mobile pills (only when few tabs) */}
      <div
        className={`flex gap-2 flex-wrap ${
          useDropdown ? "hidden md:flex" : "flex"
        }`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "card-bg border sidebar-border text-themed-muted hover:text-themed"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-xs ${isActive ? "opacity-70" : "opacity-50"}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
