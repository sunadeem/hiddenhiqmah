export type ThemeName = "celestial" | "desert" | "modern";

export interface ThemeColors {
  // Background
  bg: string;
  bgDark: string;
  sidebar: string;
  sidebarDark: string;
  card: string;
  cardDark: string;
  border: string;
  borderDark: string;
  // Text
  text: string;
  textDark: string;
  textMuted: string;
  textMutedDark: string;
  // Accent
  accent: string;
  accentDark: string;
  accentHover: string;
  accentHoverDark: string;
  // Gold (secondary accent)
  gold: string;
  goldDark: string;
}

export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  colors: ThemeColors;
}

export const themes: Record<ThemeName, Theme> = {
  celestial: {
    name: "celestial",
    label: "Celestial",
    description: "Night Sky",
    colors: {
      bg: "#f0ebe3",
      bgDark: "#0a0a0a",
      sidebar: "#e8e0d4",
      sidebarDark: "#111111",
      card: "#ffffff",
      cardDark: "#1a1a1a",
      border: "#d4c9b8",
      borderDark: "#2a2a2a",
      text: "#1a1a2e",
      textDark: "#f5f5f5",
      textMuted: "#6b6880",
      textMutedDark: "#999999",
      accent: "#2a4a7f",
      accentDark: "#d4a843",
      accentHover: "#1e3a6f",
      accentHoverDark: "#e0b84e",
      gold: "#b8942e",
      goldDark: "#d4a843",
    },
  },
  desert: {
    name: "desert",
    label: "Desert",
    description: "Oasis",
    colors: {
      bg: "#f5f0e8",
      bgDark: "#1a1a14",
      sidebar: "#faf7f0",
      sidebarDark: "#24241c",
      card: "#ffffff",
      cardDark: "#2e2e24",
      border: "#e0d5c1",
      borderDark: "#3d3d2e",
      text: "#3d2b1f",
      textDark: "#e8e0d0",
      textMuted: "#8b7355",
      textMutedDark: "#a89880",
      accent: "#1a7a4c",
      accentDark: "#2ea66a",
      accentHover: "#14654a",
      accentHoverDark: "#38c07a",
      gold: "#c9942e",
      goldDark: "#d4a843",
    },
  },
  modern: {
    name: "modern",
    label: "Modern",
    description: "Minimalist",
    colors: {
      bg: "#fafafa",
      bgDark: "#111827",
      sidebar: "#ffffff",
      sidebarDark: "#1f2937",
      card: "#ffffff",
      cardDark: "#1f2937",
      border: "#e5e7eb",
      borderDark: "#374151",
      text: "#1f2937",
      textDark: "#f3f4f6",
      textMuted: "#6b7280",
      textMutedDark: "#9ca3af",
      accent: "#0d9488",
      accentDark: "#14b8a6",
      accentHover: "#0f766e",
      accentHoverDark: "#2dd4bf",
      gold: "#d4a843",
      goldDark: "#d4a843",
    },
  },
};

export function getThemeCSSVariables(theme: Theme, isDark: boolean): Record<string, string> {
  const c = theme.colors;
  return {
    "--color-bg": isDark ? c.bgDark : c.bg,
    "--color-sidebar": isDark ? c.sidebarDark : c.sidebar,
    "--color-card": isDark ? c.cardDark : c.card,
    "--color-border": isDark ? c.borderDark : c.border,
    "--color-text": isDark ? c.textDark : c.text,
    "--color-text-muted": isDark ? c.textMutedDark : c.textMuted,
    "--color-accent": isDark ? c.accentDark : c.accent,
    "--color-accent-hover": isDark ? c.accentHoverDark : c.accentHover,
    "--color-gold": isDark ? c.goldDark : c.gold,
  };
}
