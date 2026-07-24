// App-wide theme system. Each theme is a curated palette; the picker in
// Settings → Appearance sets the active one (persisted per device via
// ThemeContext), which writes these CSS variables onto <html>. Every component
// styles through the variables, so the whole app + Ask re-theme at once.

export type ThemeMode = "dark" | "light";

export interface ThemeDef {
  id: string;
  name: string;
  mode: ThemeMode;
  bg: string;
  surface: string; // cards / raised surfaces  → --color-card
  border: string; //  hairlines               → --color-border
  text: string; //    primary text            → --color-text
  muted: string; //   secondary text          → --color-text-muted
  accent: string; //  primary accent          → --color-accent + --color-gold
  accent2: string; // secondary accent        → --color-accent2
}

export const THEMES: ThemeDef[] = [
  // ── Dark ──
  { id: "onyx", name: "Onyx & Gold", mode: "dark", bg: "#0a0a0c", surface: "#17171b", border: "#28282e", text: "#f1ece0", muted: "#8d887c", accent: "#d4a843", accent2: "#c98f2e" },
  { id: "tilework", name: "Tilework", mode: "dark", bg: "#0d2529", surface: "#153a40", border: "#1d3d41", text: "#f1e8d5", muted: "#8fa6a3", accent: "#d9b44a", accent2: "#4fb0a5" },
  { id: "emerald", name: "Emerald", mode: "dark", bg: "#0b1f16", surface: "#143528", border: "#1e4033", text: "#eaf0e4", muted: "#84a091", accent: "#d4b465", accent2: "#5bbf8a" },
  { id: "nord", name: "Nord", mode: "dark", bg: "#2e3440", surface: "#3a414f", border: "#434c5e", text: "#eceff4", muted: "#98a3ba", accent: "#88c0d0", accent2: "#a3be8c" },
  { id: "plum", name: "Plum", mode: "dark", bg: "#191724", surface: "#232136", border: "#33304d", text: "#e0def4", muted: "#a09cc0", accent: "#ebbcba", accent2: "#9ccfd8" },
  { id: "ocean", name: "Ocean", mode: "dark", bg: "#0b1a2b", surface: "#123049", border: "#1c3b56", text: "#dbe7f2", muted: "#7d93aa", accent: "#4aa3df", accent2: "#e0a458" },
  // ── Light ──
  { id: "parchment", name: "Parchment", mode: "light", bg: "#f1e8d3", surface: "#faf3e3", border: "#e2d5b6", text: "#352a1a", muted: "#897857", accent: "#1f6e52", accent2: "#b8860b" },
  { id: "daylight", name: "Daylight", mode: "light", bg: "#f4f6f9", surface: "#ffffff", border: "#cdd5e1", text: "#1e2733", muted: "#69748a", accent: "#2f7d99", accent2: "#d99a4e" },
];

export const DEFAULT_THEME_ID = "onyx";

export function getThemeById(id: string | null | undefined): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

// ── color helpers (mix / shade a hex toward white or black) ──
function toRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = toRgb(a);
  const [r2, g2, b2] = toRgb(b);
  return toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}
/** Positive amt lightens toward white, negative darkens toward black. */
function shade(hex: string, amt: number): string {
  return amt >= 0 ? mix(hex, "#ffffff", amt) : mix(hex, "#000000", -amt);
}

/** CSS variables for a theme by id. Derives sidebar / accent-hover / overlays. */
export function getThemeVariablesById(id: string): Record<string, string> {
  const t = getThemeById(id);
  const dark = t.mode === "dark";
  return {
    "--color-bg": t.bg,
    "--color-sidebar": mix(t.bg, t.surface, 0.55),
    "--color-card": t.surface,
    "--color-border": t.border,
    "--color-text": t.text,
    "--color-text-muted": t.muted,
    "--color-accent": t.accent,
    "--color-accent-hover": shade(t.accent, dark ? 0.14 : -0.12),
    // The app historically used one gold accent everywhere; keep a single
    // accent per theme so brand/interactive elements stay cohesive.
    "--color-gold": t.accent,
    "--color-accent2": t.accent2,
    "--overlay-subtle": dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.045)",
    "--overlay-medium": dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.075)",
    "--overlay-strong": dark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.15)",
  };
}

// Back-compat shim for any caller still on the old boolean signature.
export function getThemeCSSVariables(isDark: boolean): Record<string, string> {
  return getThemeVariablesById(isDark ? DEFAULT_THEME_ID : "daylight");
}
