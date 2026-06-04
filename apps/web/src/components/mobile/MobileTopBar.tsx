"use client";

/**
 * MobileTopBar — just safe-area padding under the iOS status bar.
 * No title text: every page has its own h1, so a redundant
 * top-bar title would just waste space.
 */
export default function MobileTopBar() {
  return (
    <header
      className="shrink-0 bg-themed"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 51px)" }}
    />
  );
}
