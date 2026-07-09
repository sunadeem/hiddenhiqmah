// The Hifz "Your Path" view graph. HifzScreen (Phase Wire) owns the active-view
// state + the nav() dispatcher; every screen imports this type so no screen ever
// imports another. Screens call nav("today"), nav("learn", { stationKey }), etc.

export type HifzView =
  | "onboarding"
  | "today"
  | "review"
  | "learn"
  | "practice"
  | "path"
  | "milestone";

/** The single dispatcher HifzScreen passes to every screen. */
export type HifzNav = (view: HifzView, params?: Record<string, unknown>) => void;
