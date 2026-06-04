export interface ThemeColors {
  bg: string;
  bgDark: string;
  sidebar: string;
  sidebarDark: string;
  card: string;
  cardDark: string;
  border: string;
  borderDark: string;
  text: string;
  textDark: string;
  textMuted: string;
  textMutedDark: string;
  accent: string;
  accentDark: string;
  accentHover: string;
  accentHoverDark: string;
  gold: string;
  goldDark: string;
}

export interface Theme {
  colors: ThemeColors;
}

export const theme: Theme = {
  colors: {
    bg: "#f0ebe3",
    bgDark: "#0a0a0a",
    sidebar: "#e8e0d4",
    sidebarDark: "#111111",
    card: "#ffffff",
    cardDark: "#1a1a1a",
    border: "#d4c9b8",
    borderDark: "#2a2a2a",
    text: "#111111",
    textDark: "#f5f5f5",
    textMuted: "#3d3d3d",
    textMutedDark: "#999999",
    accent: "#2a4a7f",
    accentDark: "#d4a843",
    accentHover: "#1e3a6f",
    accentHoverDark: "#e0b84e",
    gold: "#9a7b1e",
    goldDark: "#d4a843",
  },
};

export function getThemeCSSVariables(isDark: boolean): Record<string, string> {
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
