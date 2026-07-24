"use client";

// A tiny, self-contained preference: "show Latin-script transliteration under the
// Arabic while memorizing". OFF by default; persisted to its own localStorage key
// so it never collides with the shared storage layer or any parallel Hifz work.
// Hydrated after mount (static export is SSR'd) to avoid a hydration mismatch.

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hiqmah-hifz-show-translit";

export function useTranslitPref(): readonly [boolean, () => void] {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      setOn(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore — storage unavailable (private mode / SSR) */
    }
  }, []);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return [on, toggle] as const;
}
