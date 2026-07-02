"use client";

// Store for a user's dhikr-card *layout*: which extra adhkār they added (beyond
// the built-ins) and any per-card rep-goal overrides. The dhikr *counts*
// themselves live in the DailyAdapter (dhikr_daily) and already sync across
// devices + feed Dhikr Stats — this only persists the card list + goals.
//
// Storage:
//   * Signed OUT → localStorage (device-local fallback).
//   * Signed IN  → the `custom_dhikr` table (migration 012), so the card list +
//     goals follow the user across devices.
// A React hook (useWorshipDhikrSync) wires auth + active household profile →
// configureWorshipStore, which swaps the backing store (a child profile is
// device-local + namespaced). Reads stay synchronous: they return an in-memory
// cache that is hydrated from localStorage immediately and refreshed from
// Supabase asynchronously (subscribers are notified via the change event).
//
// Kept out of the checklist's UserItems on purpose so custom dhikr cards never
// leak into the daily checklist. Built-in cards are never in `added`, so they
// are never deletable through this store.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  getActiveProfileId,
  PROFILE_CHANGED_EVENT,
  dailyStoreKeyForProfile,
} from "@/lib/household";
import { DHIKR_CATALOG_BY_KEY } from "./catalog";

const KEY = "hiqmah-worship-dhikr";
const EVENT = "hiqmah:worship-dhikr";
const TABLE = "custom_dhikr";

export interface WorshipDhikrStore {
  /** Catalog keys the user added, in display order (after the built-ins). */
  added: string[];
  /** Per-card rep-goal overrides, keyed by dhikrKey (covers built-ins too). */
  goals: Record<string, number>;
}

const EMPTY: WorshipDhikrStore = { added: [], goals: {} };

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------
// The synchronous source of truth for reads. `null` until first hydrated.
let cache: WorshipDhikrStore | null = null;
// Current signed-in user id (null = guest → localStorage).
let userId: string | null = null;
// Active localStorage key — namespaced per non-primary household profile so a
// child's dhikr-card layout never reads/writes the parent's (or a sibling's).
let localKey = KEY;
// Bumped on every local mutation + identity change; guards a slow cloud load
// from clobbering newer optimistic writes.
let version = 0;

function clampGoal(g: number): number {
  return Math.max(1, Math.round(g));
}

function readLocal(): WorshipDhikrStore {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(localKey);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<WorshipDhikrStore>;
    return {
      added: Array.isArray(parsed.added)
        ? parsed.added.filter((k) => typeof k === "string")
        : [],
      goals: parsed.goals && typeof parsed.goals === "object" ? parsed.goals : {},
    };
  } catch {
    return { ...EMPTY };
  }
}

function writeLocal(store: WorshipDhikrStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(localKey, JSON.stringify(store));
  } catch {
    // ignore quota / private-mode errors
  }
}

function emit() {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore
  }
}

function ensureCache(): WorshipDhikrStore {
  if (!cache) cache = readLocal();
  return cache;
}

export function getWorshipDhikr(): WorshipDhikrStore {
  return ensureCache();
}

// ---------------------------------------------------------------------------
// Cloud helpers (signed-in)
// ---------------------------------------------------------------------------
type CloudRow = { dhikr_key: string; goal: number; sort_order: number };

/** Build the in-memory store from cloud rows (assumes rows are pre-ordered). */
function applyRows(rows: CloudRow[]): WorshipDhikrStore {
  const added = rows.filter((r) => r.sort_order >= 0).map((r) => r.dhikr_key);
  const goals: Record<string, number> = {};
  for (const r of rows) goals[r.dhikr_key] = r.goal;
  return { added, goals };
}

/** A DB row for a card key. sortOrder < 0 marks a goal-override-only row. */
function rowFor(key: string, goal: number, sortOrder: number) {
  const e = DHIKR_CATALOG_BY_KEY[key];
  return {
    user_id: userId,
    dhikr_key: key,
    label: e?.label ?? key,
    arabic: e?.arabic ?? "",
    translit: e?.translit ?? "",
    goal: clampGoal(goal),
    sort_order: sortOrder,
  };
}

async function upsertRow(key: string, goal: number, sortOrder: number) {
  try {
    await supabase
      .from(TABLE)
      .upsert(rowFor(key, goal, sortOrder), { onConflict: "user_id,dhikr_key" });
  } catch {
    // best-effort; reconciles on next load
  }
}

async function deleteRow(uid: string, key: string) {
  try {
    await supabase.from(TABLE).delete().eq("user_id", uid).eq("dhikr_key", key);
  } catch {
    // best-effort
  }
}

/** Seed the cloud from an existing local layout (first cloud use only). */
async function pushAllToCloud(uid: string, store: WorshipDhikrStore) {
  const addedSet = new Set(store.added);
  const rows = [
    ...store.added.map((k, i) =>
      rowFor(k, store.goals[k] ?? DHIKR_CATALOG_BY_KEY[k]?.defaultGoal ?? 33, i)
    ),
    ...Object.entries(store.goals)
      .filter(([k]) => !addedSet.has(k))
      .map(([k, g]) => rowFor(k, g, -1)),
  ];
  if (!rows.length || userId !== uid) return;
  try {
    await supabase.from(TABLE).upsert(rows, { onConflict: "user_id,dhikr_key" });
  } catch {
    // best-effort
  }
}

async function loadFromCloud(uid: string) {
  const v = version;
  const { data, error } = await supabase
    .from(TABLE)
    .select("dhikr_key, goal, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (userId !== uid) return; // user switched mid-flight
  if (error) return; // keep whatever cache we have (offline etc.)

  const rows = (data ?? []) as CloudRow[];

  if (rows.length === 0) {
    // First cloud use: don't drop a layout the user built while signed out.
    const local = readLocal();
    if (local.added.length || Object.keys(local.goals).length) {
      // A local write during the load already persisted itself — don't clobber.
      if (version !== v) return;
      cache = local;
      emit();
      await pushAllToCloud(uid, local);
      return;
    }
  }

  if (version !== v) return; // a local write happened during load — don't clobber
  cache = applyRows(rows);
  emit();
}

// ---------------------------------------------------------------------------
// Public write API (synchronous, optimistic; persistence is fire-and-forget)
// ---------------------------------------------------------------------------

/** Add a catalog dhikr as a card with a rep goal. No-op if already present. */
export function addWorshipDhikr(key: string, goal: number) {
  const s = ensureCache();
  const added = s.added.includes(key) ? s.added : [...s.added, key];
  cache = { added, goals: { ...s.goals, [key]: clampGoal(goal) } };
  version++;
  emit();
  if (userId) void upsertRow(key, goal, added.indexOf(key));
  else writeLocal(cache);
}

/** Remove a user-added card (built-ins are never in `added`, so safe). */
export function removeWorshipDhikr(key: string) {
  const s = ensureCache();
  const goals = { ...s.goals };
  delete goals[key];
  cache = { added: s.added.filter((k) => k !== key), goals };
  version++;
  emit();
  if (userId) void deleteRow(userId, key);
  else writeLocal(cache);
}

/** Set the rep goal for any card (built-in, base, or added). */
export function setWorshipGoal(key: string, goal: number) {
  const s = ensureCache();
  cache = { added: s.added, goals: { ...s.goals, [key]: clampGoal(goal) } };
  version++;
  emit();
  // sort_order = position if this is an added card, else -1 (override-only).
  if (userId) void upsertRow(key, goal, s.added.indexOf(key));
  else writeLocal(cache);
}

/** Subscribe to layout changes (in-tab custom event + cross-tab storage). */
export function subscribeWorshipDhikr(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onEvt = () => cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key !== localKey) return;
    // Another tab wrote localStorage (guest mode) — refresh our cache from it.
    if (!userId) cache = readLocal();
    cb();
  };
  window.addEventListener(EVENT, onEvt);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onEvt);
    window.removeEventListener("storage", onStorage);
  };
}

// ---------------------------------------------------------------------------
// Auth wiring — swap the backing store when the signed-in user changes.
// ---------------------------------------------------------------------------

/**
 * Point the store at the active identity. The primary profile uses the signed-in
 * user's cloud rows (or localStorage as a guest); any child household profile is
 * always device-local + namespaced by profile id (mirrors useDailyAdapter), so a
 * kid's dhikr layout on a shared phone never leaks the parent's (FAMILY-1).
 */
export function configureWorshipStore(uid: string | null, profileId: string) {
  const child = dailyStoreKeyForProfile(profileId) !== undefined;
  const nextUser = child ? null : uid;
  const nextKey = child ? `${KEY}:p:${profileId}` : KEY;
  if (nextUser === userId && nextKey === localKey) return;
  userId = nextUser;
  localKey = nextKey;
  version++; // invalidate any in-flight load tied to the previous identity
  if (userId) {
    void loadFromCloud(userId);
  } else {
    cache = readLocal();
    emit();
  }
}

/**
 * Keeps the store in sync with auth + the active household profile. Call from any
 * surface that reads the store; idempotent, so multiple mounted consumers are fine.
 */
export function useWorshipDhikrSync() {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [profileId, setProfileId] = useState(getActiveProfileId);
  useEffect(() => {
    const onChange = () => setProfileId(getActiveProfileId());
    window.addEventListener(PROFILE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(PROFILE_CHANGED_EVENT, onChange);
  }, []);
  useEffect(() => {
    configureWorshipStore(uid, profileId);
  }, [uid, profileId]);
}
