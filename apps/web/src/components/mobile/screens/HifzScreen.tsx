"use client";

// HifzScreen — the Hifz feature router. It owns the active-view state + the nav()
// dispatcher and renders exactly one screen at a time; the seven screens never
// import each other, they hand off through nav(view, params). All data comes from
// the single shared useHifzPath() hook, passed down as `path`. Onboarding is gated
// on !hasPlan so a first-time user always lands there; everyone else starts on
// Today. (Phase Wire — replaces the old dashboard/session/setup state machine.)

import { useCallback, useState } from "react";
import { useHifzPath } from "@/lib/hifz/useHifzPath";
import type { HifzView } from "@/lib/hifz/hifzViews";
import Onboarding from "../hifz/Onboarding";
import TodayView from "../hifz/TodayView";
import PathView from "../hifz/PathView";
import ReviewLoop from "../hifz/ReviewLoop";
import LearnLadder from "../hifz/LearnLadder";
import Practice from "../hifz/Practice";
import Milestone from "../hifz/Milestone";

export default function HifzScreen() {
  const path = useHifzPath();
  const [view, setView] = useState<HifzView>("today");
  const [params, setParams] = useState<unknown>(undefined);

  // The single dispatcher every screen uses. Storing params alongside the view
  // lets screens hand structured context forward (e.g. the completed sūrah for
  // the milestone) without any screen knowing about another.
  const nav = useCallback((next: HifzView, nextParams?: unknown) => {
    setParams(nextParams);
    setView(next);
  }, []);

  // Gate onboarding until the plan exists. While the plan is still loading we
  // render nothing chrome-heavy — the screens show their own calm loading state.
  const active: HifzView = !path.loading && !path.hasPlan ? "onboarding" : view;

  const screen = (() => {
    switch (active) {
      case "onboarding":
        return <Onboarding path={path} nav={nav} />;
      case "review":
        return <ReviewLoop path={path} nav={nav} />;
      case "learn":
        return <LearnLadder path={path} nav={nav} />;
      case "practice":
        return <Practice path={path} nav={nav} />;
      case "path":
        return <PathView path={path} nav={nav} />;
      case "milestone":
        return <Milestone path={path} nav={nav} params={params as never} />;
      case "today":
      default:
        return <TodayView path={path} nav={nav} />;
    }
  })();

  // Full-height flex column, edge-to-edge: the shell wraps children in a padded,
  // scrollable <main>; we cancel its horizontal padding (screens own their px-6)
  // and provide the flex context the flow screens' `flex-1` layouts rely on.
  return <div className="-mx-3 flex min-h-full flex-col">{screen}</div>;
}
