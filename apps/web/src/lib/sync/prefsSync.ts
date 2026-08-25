// Account sync for device-local preferences and progress.
//
// WHY THIS EXISTS. Everything in packages/ui/lib/storage.ts lived only in
// localStorage, and nothing anywhere pulled it back on sign-in — onAuthStateChange
// did exactly one thing, setSession. So installing on a new phone and signing
// into an existing account restored the user's identity and gave them DEFAULTS
// for everything else. Bookmarks, a child's badges and flashcard schedule, and
// cumulative Qur'an reading progress had no server copy at all, so deleting the
// app destroyed them permanently. And prayerSettings reset to ISNA/Shafiʿi,
// which moves Asr by up to 90 minutes with nothing on screen to say so — in a
// prayer app, silently wrong times are the worst outcome available.
//
// WHAT THIS IS NOT FOR. The checklist, streaks, dhikr, hifz, journal and circles
// already read straight from their own tables when signed in (see the *Adapter
// files). They need no hydration and must NOT be mirrored here — two sources of
// truth for a streak is worse than one imperfect one.
//
// MERGE POLICY LIVES HERE, not in SQL, so each section gets the rule it actually
// needs, and changing a rule stays a client-only change. The bias is deliberate:
// for anything a person authored, merging UNIONS rather than picking a winner,
// because resurrecting a deleted bookmark is trivial and eating a year of them
// is not. Only cursors and true preferences take newest-wins.

import { supabase } from "@/lib/supabase";
import {
  getBookmarks,
  replaceBookmarks,
  getProgress,
  replaceProgress,
  getKidsProgress,
  updateKidsProgress,
  getPrayerSettings,
  setPrayerSettings,
  getNotificationPrefs,
  setNotificationPrefs,
  STORAGE_CHANGED_EVENT,
  type Bookmark,
  type ReadingProgress,
  type KidsProgress,
  type PrayerSettings,
  type NotificationPrefs,
} from "@hidden-hiqmah/ui/lib/storage";

/**
 * What a merge knows besides the two values.
 *
 * `localWritten` is the important one. Getters in storage.ts return
 * `{...defaults, ...stored}`, so a section ALWAYS reads as a complete object
 * even when the user has never touched it — a fresh install is
 * indistinguishable from a deliberate choice by value alone. Without this flag a
 * newest-wins merge picks the defaults on a new phone and then pushes them,
 * destroying the account's real settings. That is the exact failure this whole
 * module exists to prevent, so the distinction is load-bearing.
 */
type MergeCtx = {
  /** Has this device ever written this section? (raw key present in storage) */
  localWritten: boolean;
  /** ms epoch of the last local edit, 0 if never/unknown. */
  localTouchedAt: number;
  /** ms epoch of the remote copy, 0 if absent. */
  remoteUpdatedAt: number;
};

/** One synced unit. `merge` must be pure and must never throw. */
type Section<T> = {
  name: string;
  /** Storage keys whose write means this section is dirty. */
  keys: string[];
  read: () => T;
  write: (merged: T) => void;
  /** Combine local and remote. `remote` is undefined on the first ever sync. */
  merge: (local: T, remote: T | undefined, ctx: MergeCtx) => T;
};

/** Erase the element type so differently-typed sections share one array. */
function section<T>(s: Section<T>): Section<unknown> {
  return s as unknown as Section<unknown>;
}

/**
 * Union bookmarks by type+id, keeping the EARLIEST timestamp so "saved on" does
 * not drift later every time two devices sync.
 */
function mergeBookmarks(local: Bookmark[], remote: Bookmark[] | undefined): Bookmark[] {
  if (!remote?.length) return local;
  const byKey = new Map<string, Bookmark>();
  for (const b of [...remote, ...local]) {
    if (!b || typeof b.id !== "string" || typeof b.type !== "string") continue;
    const k = `${b.type}:${b.id}`;
    const seen = byKey.get(k);
    if (!seen || (b.timestamp ?? 0) < (seen.timestamp ?? 0)) byKey.set(k, b);
  }
  // Newest-saved first, matching addBookmark's unshift ordering.
  return [...byKey.values()].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
}

/**
 * surahsRead is cumulative and has no other restore path — rebuilding it means
 * physically reopening every surah — so it unions. lastSurah/lastVerse is a
 * cursor, not a record; it self-heals on the next tap, so local wins when set
 * and remote only fills a gap.
 */
function mergeProgress(
  local: ReadingProgress,
  remote: ReadingProgress | undefined
): ReadingProgress {
  const surahs = new Set<number>([
    ...(Array.isArray(remote?.surahsRead) ? remote.surahsRead : []),
    ...(Array.isArray(local.surahsRead) ? local.surahsRead : []),
  ]);
  const hasLocalCursor = typeof local.lastSurah === "number";
  return {
    surahsRead: [...surahs].sort((a, b) => a - b),
    lastSurah: hasLocalCursor ? local.lastSurah : remote?.lastSurah,
    lastVerse: hasLocalCursor ? local.lastVerse : remote?.lastVerse,
  };
}

function mergeSoonest(
  a: Record<string, string> | undefined,
  b: Record<string, string> | undefined
): Record<string, string> {
  const out: Record<string, string> = { ...(b ?? {}) };
  for (const [k, v] of Object.entries(a ?? {})) {
    out[k] = out[k] && out[k] < v ? out[k] : v;
  }
  return out;
}

/**
 * A child's progress must only ever go UP. Counters take the max, collections
 * union, and the spaced-repetition state keeps the FURTHEST-ALONG bucket per
 * card — a merge that reset a card to "new" would silently restart a child's
 * memorisation, which is precisely the loss this sync exists to prevent.
 */
function mergeKids(local: KidsProgress, remote: KidsProgress | undefined): KidsProgress {
  if (!remote) return local;
  const maxNum = (a?: number, b?: number) => Math.max(a ?? 0, b ?? 0);
  const union = <T,>(a?: T[], b?: T[]) => [...new Set([...(a ?? []), ...(b ?? [])])];

  const buckets: Record<string, number> = { ...(remote.flashcardBuckets ?? {}) };
  for (const [card, bucket] of Object.entries(local.flashcardBuckets ?? {})) {
    buckets[card] = Math.max(buckets[card] ?? 0, bucket);
  }
  const scores: Record<string, number> = { ...(remote.quizScores ?? {}) };
  for (const [quiz, score] of Object.entries(local.quizScores ?? {})) {
    scores[quiz] = Math.max(scores[quiz] ?? 0, score);
  }
  // A completed day stays completed: `true` wins from either side.
  const checklist: Record<string, boolean> = { ...(remote.dailyChecklist ?? {}) };
  for (const [k, v] of Object.entries(local.dailyChecklist ?? {})) {
    if (v) checklist[k] = true;
  }
  const localNewer = (local.lastActiveDate ?? "") >= (remote.lastActiveDate ?? "");
  return {
    // Age group is a choice, not a score — most recently active side wins.
    ageGroup: localNewer ? local.ageGroup : remote.ageGroup,
    stars: maxNum(local.stars, remote.stars),
    streak: maxNum(local.streak, remote.streak),
    lastActiveDate: localNewer ? local.lastActiveDate : remote.lastActiveDate,
    completedLessons: union(local.completedLessons, remote.completedLessons),
    memorizedSurahs: union(local.memorizedSurahs, remote.memorizedSurahs),
    flashcardBuckets: buckets,
    // Review dates follow their bucket; keep whichever is scheduled sooner so a
    // card cannot be pushed out of rotation by a stale copy.
    flashcardNextReview: mergeSoonest(local.flashcardNextReview, remote.flashcardNextReview),
    dailyChecklist: checklist,
    badges: union(local.badges, remote.badges),
    quizScores: scores,
  };
}

/**
 * Newest-wins, for genuine preferences where a union is meaningless — you cannot
 * "merge" two madhhabs.
 *
 * ⚠️ The guard here is the whole point. A naive `{...remote, ...local}` looks
 * right and is catastrophic: on a first sign-in on a new phone, `local` is a
 * complete object of DEFAULTS (ISNA + Shafiʿi Asr), so it would overwrite the
 * account's real Hanafi choice and then push that over the server copy — losing
 * the setting AND its backup, silently, while moving Asr by up to 90 minutes.
 *
 * So: if this device has never written the section, the remote copy wins
 * outright. Only once both sides are real user edits does the newer timestamp
 * decide.
 */
function preferNewest<T extends object>(
  local: T,
  remote: T | undefined,
  ctx: MergeCtx
): T {
  if (!remote) return local;
  // Never let untouched defaults beat a real stored choice.
  if (!ctx.localWritten) return remote;
  // Both sides are real. Prefer whichever was edited later; when local has no
  // recorded edit time, prefer local (it is at least a deliberate write, and the
  // user is holding this device).
  if (ctx.localTouchedAt && ctx.remoteUpdatedAt > ctx.localTouchedAt) {
    return { ...local, ...remote };
  }
  return { ...remote, ...local };
}

/**
 * Has this device ever written this storage key?
 *
 * Reads localStorage RAW rather than going through storage.ts, deliberately: the
 * getters merge defaults over whatever is stored, which is exactly the
 * information we need to not have here. Absent key = the user has never chosen.
 */
function rawPresent(key: string): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

/**
 * Local edit times per section, so newest-wins has a local clock to compare.
 *
 * Recorded when a section's storage key is written by the app (see
 * startPrefsSync), NOT when sync itself writes it — a sync-write is not a user
 * edit, and treating it as one would let a device keep winning forever.
 */
const TOUCH_KEY = "hiqmah-sync-touched";

/**
 * True while sync is writing merged data into local storage.
 *
 * Without this, applying a merge feeds itself: write() -> storage set() ->
 * STORAGE_CHANGED_EVENT -> the listener stamps a touch and queues a push. That
 * would (a) record a sync-write as a USER edit, so this device would keep
 * winning newest-wins forever against a genuinely newer edit elsewhere, and
 * (b) fire a redundant second push of every section on every sign-in. The event
 * is dispatched synchronously from set(), so a plain flag is sufficient — no
 * async window to leak through.
 */
let applyingRemote = false;

function readTouches(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(TOUCH_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function recordTouch(section: string) {
  try {
    const all = readTouches();
    all[section] = Date.now();
    window.localStorage.setItem(TOUCH_KEY, JSON.stringify(all));
  } catch {
    // best-effort: a missing touch time degrades to "prefer local", not to loss
  }
}

const SECTIONS: Section<unknown>[] = [
  section<PrayerSettings>({
    name: "prayerSettings",
    keys: ["hiqmah-prayer-settings"],
    read: getPrayerSettings,
    write: (m) => setPrayerSettings(m),
    merge: preferNewest,
  }),
  section<NotificationPrefs>({
    name: "notificationPrefs",
    keys: ["hiqmah-notifications"],
    read: getNotificationPrefs,
    write: (m) => setNotificationPrefs(m),
    merge: preferNewest,
  }),
  section<Bookmark[]>({
    name: "bookmarks",
    keys: ["hiqmah-bookmarks"],
    read: getBookmarks,
    write: (m) => replaceBookmarks(m),
    merge: mergeBookmarks,
  }),
  section<ReadingProgress>({
    name: "readingProgress",
    keys: ["hiqmah-reading-progress"],
    read: getProgress,
    write: (m) => replaceProgress(m),
    merge: mergeProgress,
  }),
  section<KidsProgress>({
    name: "kidsProgress",
    keys: ["hiqmah-kids-progress"],
    read: getKidsProgress,
    write: (m) => updateKidsProgress(m),
    merge: mergeKids,
  }),
];

type RemoteSection = { data?: unknown; updatedAt?: string };

async function fetchRemote(): Promise<Record<string, RemoteSection>> {
  // maybeSingle: no row is the normal first-sync case, not an error.
  const { data, error } = await supabase.from("user_prefs").select("sections").maybeSingle();
  if (error) throw error;
  return (data?.sections ?? {}) as Record<string, RemoteSection>;
}

async function pushSection(name: string, data: unknown): Promise<void> {
  const { error } = await supabase.rpc("set_pref_section", {
    p_section: name,
    p_data: data,
    p_updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/**
 * Pull the account's copy, merge it into local, push the result back.
 *
 * Call once per sign-in. Merging BOTH ways in a single pass is what makes the
 * first sign-in on a new phone safe: whatever the device already had survives
 * (someone who bookmarked things before signing in keeps them), and whatever the
 * account held appears. The push afterwards is what puts a previously
 * local-only install onto the server for the first time.
 *
 * Sections are independent — one failure must not stop the rest — so each is
 * caught on its own. Failures log and retry on the next sign-in rather than
 * surfacing: a preference that syncs late does not deserve a modal.
 */
export async function syncPrefsOnSignIn(): Promise<void> {
  let remote: Record<string, RemoteSection>;
  try {
    remote = await fetchRemote();
  } catch (e) {
    console.error("[prefsSync] could not read account prefs", e);
    return;
  }
  const touches = readTouches();
  for (const s of SECTIONS) {
    try {
      const remoteAt = Date.parse(remote[s.name]?.updatedAt ?? "");
      const ctx: MergeCtx = {
        // Any of the section's keys being present means this device has written it.
        localWritten: s.keys.some(rawPresent),
        localTouchedAt: touches[s.name] ?? 0,
        remoteUpdatedAt: Number.isNaN(remoteAt) ? 0 : remoteAt,
      };
      const merged = s.merge(s.read(), remote[s.name]?.data, ctx);
      applyingRemote = true;
      try {
        s.write(merged);
      } finally {
        // Reset in a finally: a throw from write() must not leave the flag stuck
        // on, which would silently disable touch-recording for the whole session.
        applyingRemote = false;
      }
      await pushSection(s.name, merged);
    } catch (e) {
      console.error(`[prefsSync] section "${s.name}" failed`, e);
    }
  }
}

/**
 * Push local changes up as they happen, debounced. Returns a cleanup fn.
 *
 * Subscribes to the event storage.ts emits from its single set(), so this cannot
 * miss a setter — including one added later.
 *
 * Debounced because a settings screen writes on every tap; without it, dragging
 * the dhikr-interval control would fire a request per frame. 1.5s coalesces a
 * burst of toggles while still landing a change made just before the app closes.
 */
export function startPrefsSync(): () => void {
  if (typeof window === "undefined") return () => {};

  const byKey = new Map<string, Section<unknown>>();
  for (const s of SECTIONS) for (const k of s.keys) byKey.set(k, s);

  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const onChange = (ev: Event) => {
    // Our own merge-write, not a user edit — see applyingRemote.
    if (applyingRemote) return;
    const key = (ev as CustomEvent<{ key?: string }>).detail?.key;
    if (!key) return;
    const s = byKey.get(key);
    if (!s) return; // not a synced key
    // Stamp the edit BEFORE debouncing, so a change made and then immediately
    // backgrounded still leaves a local clock for the next merge to compare.
    recordTouch(s.name);
    const pending = timers.get(s.name);
    if (pending) clearTimeout(pending);
    timers.set(
      s.name,
      setTimeout(() => {
        timers.delete(s.name);
        void pushSection(s.name, s.read()).catch((e) =>
          console.error(`[prefsSync] push "${s.name}" failed`, e)
        );
      }, 1500)
    );
  };

  window.addEventListener(STORAGE_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener(STORAGE_CHANGED_EVENT, onChange);
    for (const t of timers.values()) clearTimeout(t);
    timers.clear();
  };
}
