"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ThemeName, themes, getThemeCSSVariables } from "@/lib/themes";

interface ThemeContextType {
  themeName: ThemeName;
  isDark: boolean;
  setThemeName: (name: ThemeName) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("celestial");
  const [isDark, setIsDark] = useState(true);

  const applyTheme = useCallback((name: ThemeName, dark: boolean) => {
    const theme = themes[name];
    const vars = getThemeCSSVariables(theme, dark);
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, []);

  useEffect(() => {
    applyTheme(themeName, isDark);
  }, [themeName, isDark, applyTheme]);

  const toggleDarkMode = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ themeName, isDark, setThemeName, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
