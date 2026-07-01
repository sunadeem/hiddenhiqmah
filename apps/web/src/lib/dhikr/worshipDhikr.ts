"use client";

// Device-local store for a user's dhikr-card *layout*: which extra cards they
// added (beyond the built-in five) and any per-card rep-goal overrides. The
// dhikr *counts* themselves live in the DailyAdapter (dhikr_daily) and already
// sync across devices + feed Dhikr Stats — this only persists the card list.
//
// Kept out of the checklist's UserItems on purpose so custom dhikr cards don't
// leak into the daily checklist. (Cross-device sync of the card list is a small
// follow-up: a `custom_dhikr` table + adapter methods.)

const KEY = "hiqmah-worship-dhikr";
const EVENT = "hiqmah:worship-dhikr";

export interface WorshipDhikrStore {
  /** Catalog keys the user added, in display order (after the built-ins). */
  added: string[];
  /** Per-card rep-goal overrides, keyed by dhikrKey (covers built-ins too). */
  goals: Record<string, number>;
}

const EMPTY: WorshipDhikrStore = { added: [], goals: {} };

function read(): WorshipDhikrStore {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<WorshipDhikrStore>;
    return {
      added: Array.isArray(parsed.added) ? parsed.added.filter((k) => typeof k === "string") : [],
      goals: parsed.goals && typeof parsed.goals === "object" ? parsed.goals : {},
    };
  } catch {
    return { ...EMPTY };
  }
}

function write(store: WorshipDhikrStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // ignore quota / private-mode errors
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore
  }
}

export function getWorshipDhikr(): WorshipDhikrStore {
  return read();
}

/** Add a catalog dhikr as a card with a rep goal. No-op if already present. */
export function addWorshipDhikr(key: string, goal: number) {
  const s = read();
  if (!s.added.includes(key)) s.added = [...s.added, key];
  s.goals = { ...s.goals, [key]: Math.max(1, Math.round(goal)) };
  write(s);
}

/** Remove a user-added card (built-ins are never in `added`, so safe). */
export function removeWorshipDhikr(key: string) {
  const s = read();
  s.added = s.added.filter((k) => k !== key);
  const goals = { ...s.goals };
  delete goals[key];
  s.goals = goals;
  write(s);
}

/** Set the rep goal for any card (built-in or added). */
export function setWorshipGoal(key: string, goal: number) {
  const s = read();
  s.goals = { ...s.goals, [key]: Math.max(1, Math.round(goal)) };
  write(s);
}

/** Subscribe to layout changes (in-tab custom event + cross-tab storage). */
export function subscribeWorshipDhikr(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onEvt = () => cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, onEvt);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onEvt);
    window.removeEventListener("storage", onStorage);
  };
}
