"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getThemeCSSVariables } from "@/lib/themes";

interface ThemeContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  const applyTheme = useCallback((dark: boolean) => {
    const vars = getThemeCSSVariables(dark);
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, []);

  // Load saved theme preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hiqmah-theme");
      if (saved !== null) {
        const dark = saved === "dark";
        setIsDark(dark);
        applyTheme(dark);
      }
    } catch {
      // localStorage unavailable
    }
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark, applyTheme]);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      try { localStorage.setItem("hiqmah-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
