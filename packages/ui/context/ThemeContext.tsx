"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  THEMES,
  DEFAULT_THEME_ID,
  getThemeById,
  getThemeVariablesById,
  type ThemeDef,
} from "../lib/themes";

interface ThemeContextType {
  /** Active theme id (one of THEMES). */
  themeId: string;
  /** Active theme definition (colours, mode, name). */
  theme: ThemeDef;
  /** All selectable themes, for the Appearance picker. */
  themes: ThemeDef[];
  /** Select a theme by id (persists + applies). */
  setTheme: (id: string) => void;
  /** Convenience: is the active theme dark? (derived from theme.mode) */
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "hiqmah-theme";

// Old builds stored "dark" | "light"; map those onto named themes so existing
// users keep a sensible palette on upgrade.
function normalizeSaved(saved: string | null): string {
  if (!saved) return DEFAULT_THEME_ID;
  if (saved === "dark") return DEFAULT_THEME_ID;
  if (saved === "light") return "daylight";
  return THEMES.some((t) => t.id === saved) ? saved : DEFAULT_THEME_ID;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);

  const applyTheme = useCallback((id: string) => {
    const vars = getThemeVariablesById(id);
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
  }, []);

  // Load saved preference on mount.
  useEffect(() => {
    try {
      const id = normalizeSaved(localStorage.getItem(STORAGE_KEY));
      setThemeId(id);
      applyTheme(id);
    } catch {
      applyTheme(DEFAULT_THEME_ID);
    }
  }, [applyTheme]);

  const setTheme = useCallback(
    (id: string) => {
      const next = getThemeById(id).id; // validate
      setThemeId(next);
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
    },
    [applyTheme]
  );

  const theme = getThemeById(themeId);

  return (
    <ThemeContext.Provider
      value={{ themeId, theme, themes: THEMES, setTheme, isDark: theme.mode === "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
