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
//
// EVERY server round-trip in this file goes through runExclusive(). Sign-in and
// the debounced pushes both do read-modify-write against one jsonb row, so two
// of them overlapping would interleave a stale read with a fresh write — the
// exact clobber the per-section RPC exists to prevent, reintroduced client-side.

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
  STORAGE_KEYS,
  SYNC_OWNER_KEY,
  SYNC_TOUCH_KEY,
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

/**
 * One synced unit.
 *
 * `merge` must be pure and must never throw — it is handed a value that came
 * off the network, so it takes `unknown` rather than `T` and coerces. A section
 * whose merge throws gets caught and retired for the rest of the run, so one
 * malformed remote blob would otherwise stop that section syncing entirely
 * until someone reinstalled.
 */
type Section<T> = {
  name: string;
  /** Storage keys whose write means this section is dirty. */
  keys: string[];
  read: () => T;
  write: (merged: T) => void;
  /** Combine local and untrusted remote. `remote` is undefined on the first sync. */
  merge: (local: T, remote: unknown, ctx: MergeCtx) => T;
  /**
   * True when the merge is a UNION, i.e. the local value alone is not a legal
   * thing to send. See pushLocalChange: these can never be pushed raw.
   */
  union: boolean;
  /**
   * Re-apply removals the user made on THIS device since the last reconcile,
   * which a union would otherwise resurrect straight out of the account copy.
   * Only sections with a delete affordance need it (bookmarks).
   */
  reapplyRemovals?: (merged: T, local: T, baseline: unknown) => T;
};

/** Erase the element type so differently-typed sections share one array. */
function section<T>(s: Section<T>): Section<unknown> {
  return s as unknown as Section<unknown>;
}

// ── Coercion at the network boundary ────────────────────────────────────────
//
// The remote blob is jsonb that some older/newer/half-written client produced.
// The merges below index into it and spread it, so a string where an array was
// expected is a TypeError — and a throw retires that section. Coercing here
// makes a malformed remote value degrade to "ignore remote", which is always
// safe: the local copy is then pushed and repairs the row.

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/** A plain object, or {} — never an array, which spreads into numeric keys. */
function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

/** Only the entries whose value is a number — quiz scores, flashcard buckets. */
function asNumberMap(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(asRecord(v))) {
    if (typeof val === "number" && Number.isFinite(val)) out[k] = val;
  }
  return out;
}

function asStringMap(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(asRecord(v))) {
    if (typeof val === "string") out[k] = val;
  }
  return out;
}

/**
 * Primitives only, one type at a time — these feed `new Set([...a, ...b])`,
 * which de-duplicates nothing for objects and would happily produce a
 * memorizedSurahs list containing the string "3" alongside the number 3.
 */
function asStrings(v: unknown): string[] {
  return asArray<unknown>(v).filter((x): x is string => typeof x === "string");
}

function asNumbers(v: unknown): number[] {
  return asArray<unknown>(v).filter(
    (x): x is number => typeof x === "number" && Number.isFinite(x)
  );
}

/**
 * Structural equality, used to decide whether a push is worth making.
 *
 * Keys whose value is `undefined` are ignored on both sides: JSON.stringify
 * drops them, so a local `{lastVerse: undefined}` and a server blob with no
 * `lastVerse` are the same value. Without that, readingProgress would look
 * different from itself on every comparison and push forever.
 */
/**
 * May this device publish this section at all?
 *
 * ⭐ A device that has never written the key is holding DEFAULTS, not a choice.
 *
 * The equality-skip below cannot catch that case: when the account has no copy
 * yet, `deepEqual(merged, undefined)` is false, so the push fires — and
 * preferNewest returns `local` when there is no remote. So a fresh install
 * publishes ISNA + Shafiʿi as the ACCOUNT's prayer settings, with a brand-new
 * timestamp. The phone that actually holds the user's Hanafi choice then signs
 * in, sees a remote copy stamped later than its own edit, and newest-wins hands
 * it the defaults.
 *
 * That is the original bug this whole module exists to prevent, arriving through
 * the "remote absent" door instead of the merge. So: stay silent until this
 * device has an opinion of its own. Once the account HAS a copy, publishing is
 * fine — the merge has already decided what the value should be.
 */
function mayPublish(ctx: MergeCtx, remoteHasSection: boolean): boolean {
  return ctx.localWritten || remoteHasSection;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  // Absent is absent: an untouched section reads as undefined here, null there.
  if (a == null || b == null) return a == null && b == null;
  if (typeof a !== "object" || typeof b !== "object") return false;
  const aArr = Array.isArray(a);
  if (aArr !== Array.isArray(b)) return false;
  if (aArr) {
    const x = a as unknown[];
    const y = b as unknown[];
    return x.length === y.length && x.every((v, i) => deepEqual(v, y[i]));
  }
  const x = a as Record<string, unknown>;
  const y = b as Record<string, unknown>;
  for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
    if (!deepEqual(x[k], y[k])) return false;
  }
  return true;
}

/**
 * Union bookmarks by type+id, keeping the EARLIEST timestamp so "saved on" does
 * not drift later every time two devices sync.
 */
function mergeBookmarks(local: Bookmark[], remote: unknown): Bookmark[] {
  const mine = asArray<Bookmark>(local);
  const theirs = asArray<Bookmark>(remote);
  if (!theirs.length) return mine;
  const byKey = new Map<string, Bookmark>();
  for (const b of [...theirs, ...mine]) {
    if (!b || typeof b.id !== "string" || typeof b.type !== "string") continue;
    const k = `${b.type}:${b.id}`;
    const seen = byKey.get(k);
    if (!seen || (b.timestamp ?? 0) < (seen.timestamp ?? 0)) byKey.set(k, b);
  }
  // Newest-saved first, matching addBookmark's unshift ordering.
  return [...byKey.values()].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
}

function bookmarkKey(b: Bookmark): string {
  return `${b?.type}:${b?.id}`;
}

/**
 * A union can add but never subtract, so on its own it makes DELETION
 * impossible: tap remove, and the next push pulls the account copy, unions the
 * bookmark straight back in, and writes it to this device.
 *
 * `baseline` is the last value this device and the server agreed on. Anything
 * in it that the local list no longer has was removed here, deliberately, since
 * that agreement — so it is dropped from the merged result instead of being
 * resurrected. Absent baseline (first run of the process) means we have no
 * evidence of a removal and fall back to the pure union, which is the safe
 * direction: the worst case is a bookmark that has to be deleted twice.
 */
function reapplyBookmarkRemovals(
  merged: Bookmark[],
  local: Bookmark[],
  baseline: unknown
): Bookmark[] {
  const before = asArray<Bookmark>(baseline);
  if (!before.length) return merged;
  const stillHere = new Set(asArray<Bookmark>(local).map(bookmarkKey));
  const removed = new Set<string>();
  for (const b of before) {
    const k = bookmarkKey(b);
    if (!stillHere.has(k)) removed.add(k);
  }
  if (!removed.size) return merged;
  return merged.filter((b) => !removed.has(bookmarkKey(b)));
}

/**
 * surahsRead is cumulative and has no other restore path — rebuilding it means
 * physically reopening every surah — so it unions. lastSurah/lastVerse is a
 * cursor, not a record; it self-heals on the next tap, so local wins when set
 * and remote only fills a gap.
 */
function mergeProgress(local: ReadingProgress, remote: unknown): ReadingProgress {
  const r = asRecord(remote);
  const surahs = new Set<number>([
    ...asNumbers(r.surahsRead),
    ...asNumbers(local?.surahsRead),
  ]);
  const hasLocalCursor = typeof local?.lastSurah === "number";
  return {
    surahsRead: [...surahs].sort((a, b) => a - b),
    lastSurah: hasLocalCursor
      ? local.lastSurah
      : typeof r.lastSurah === "number"
        ? r.lastSurah
        : undefined,
    lastVerse: hasLocalCursor
      ? local.lastVerse
      : typeof r.lastVerse === "number"
        ? r.lastVerse
        : undefined,
  };
}

function mergeSoonest(
  a: Record<string, string>,
  b: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = { ...b };
  for (const [k, v] of Object.entries(a)) {
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
function mergeKids(local: KidsProgress, remote: unknown): KidsProgress {
  if (!remote || typeof remote !== "object" || Array.isArray(remote)) return local;
  const r = remote as Partial<KidsProgress>;
  const maxNum = (a?: number, b?: number) =>
    Math.max(typeof a === "number" ? a : 0, typeof b === "number" ? b : 0);
  const unionStrings = (a: unknown, b: unknown) => [
    ...new Set([...asStrings(a), ...asStrings(b)]),
  ];
  const unionNumbers = (a: unknown, b: unknown) => [
    ...new Set([...asNumbers(a), ...asNumbers(b)]),
  ];

  const buckets = asNumberMap(r.flashcardBuckets);
  for (const [card, bucket] of Object.entries(asNumberMap(local?.flashcardBuckets))) {
    buckets[card] = Math.max(buckets[card] ?? 0, bucket);
  }
  const scores = asNumberMap(r.quizScores);
  for (const [quiz, score] of Object.entries(asNumberMap(local?.quizScores))) {
    scores[quiz] = Math.max(scores[quiz] ?? 0, score);
  }
  // A completed day stays completed: `true` wins from either side.
  const checklist: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(asRecord(r.dailyChecklist))) {
    if (v) checklist[k] = true;
  }
  for (const [k, v] of Object.entries(asRecord(local?.dailyChecklist))) {
    if (v) checklist[k] = true;
  }
  const localDate = typeof local?.lastActiveDate === "string" ? local.lastActiveDate : "";
  const remoteDate = typeof r.lastActiveDate === "string" ? r.lastActiveDate : "";
  const localNewer = localDate >= remoteDate;
  // ⚠️ streak and lastActiveDate are ONE fact and must come from ONE side.
  // Taking the max streak and the later date independently invents a pair that
  // never existed on either device — "a 40-day streak as of today" built from a
  // 40 that was true last week and a date from a device that only has 2. That
  // pair is not merely cosmetic: updateKidsStreak() reads it back and decides
  // "continue" vs "reset" from lastActiveDate, so the fabricated streak then
  // keeps incrementing. Same-day is the one safe exception — the dates already
  // agree, so the higher count is consistent with both.
  const sameDay = localDate === remoteDate;
  const streak = sameDay
    ? maxNum(local?.streak, r.streak)
    : localNewer
      ? local?.streak
      : r.streak;
  // A junk value here is not cosmetic: the kids screens switch on it, so an
  // unrecognised group renders no lesson set at all. Fall back to this device's.
  const remoteAge =
    r.ageGroup === "little" || r.ageGroup === "explorer" || r.ageGroup === "scholar"
      ? r.ageGroup
      : undefined;
  return {
    // Age group is a choice, not a score — most recently active side wins.
    ageGroup: localNewer ? local?.ageGroup : (remoteAge ?? local?.ageGroup),
    stars: maxNum(local?.stars, r.stars),
    streak: typeof streak === "number" ? streak : 0,
    lastActiveDate: localNewer ? localDate : remoteDate,
    completedLessons: unionStrings(local?.completedLessons, r.completedLessons),
    memorizedSurahs: unionNumbers(local?.memorizedSurahs, r.memorizedSurahs),
    flashcardBuckets: buckets,
    // Review dates follow their bucket; keep whichever is scheduled sooner so a
    // card cannot be pushed out of rotation by a stale copy.
    flashcardNextReview: mergeSoonest(
      asStringMap(local?.flashcardNextReview),
      asStringMap(r.flashcardNextReview)
    ),
    dailyChecklist: checklist,
    badges: unionStrings(local?.badges, r.badges),
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
function preferNewest<T extends object>(local: T, remote: unknown, ctx: MergeCtx): T {
  // A non-object remote cannot be spread into a settings blob without producing
  // nonsense (a string spreads into numeric keys), so treat it as absent.
  if (!remote || typeof remote !== "object" || Array.isArray(remote)) return local;
  const r = remote as T;
  // Never let untouched defaults beat a real stored choice.
  if (!ctx.localWritten) return r;
  // The key exists, but no user edit was ever recorded against it — so it was
  // created by something applying SERVER data locally (the notifications screen
  // hydrating push flags, or a previous merge). That is not this device's
  // opinion, so the account's copy wins.
  //
  // Safe only because touches are recorded regardless of session: a signed-out
  // user's genuine choice DOES leave a timestamp, so it is not caught here.
  if (!ctx.localTouchedAt) return r;
  // Both sides are real user edits: the later one wins.
  if (ctx.remoteUpdatedAt > ctx.localTouchedAt) {
    return { ...local, ...r };
  }
  return { ...r, ...local };
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

/**
 * Apply a value that came from the SERVER, without it counting as a user edit.
 *
 * Needed because prefsSync is not the only thing that writes server data into
 * local storage: the notifications screen hydrates the push flags from
 * `profiles` on mount and calls setNotificationPrefs with them. That write is
 * indistinguishable from a user tapping a toggle — it creates the storage key
 * and fires the change event — so without this wrapper it would stamp a touch
 * and push this device's DEFAULTS for every other field over the account copy.
 * Exactly the class of bug preferNewest exists to prevent, arriving through a
 * different door.
 */
export function applyRemoteValue(fn: () => void): void {
  applyingRemote = true;
  try {
    fn();
  } finally {
    applyingRemote = false;
  }
}

/**
 * Whether a session exists. Touches are recorded ALWAYS; pushes happen only
 * while signed in.
 *
 * Recording only while signed in was wrong in a way that matters: a signed-out
 * user's deliberate choice would leave no local clock, so the merge could not
 * tell it apart from a value that had merely arrived from sync — and had to
 * guess. Recording always means "no touch" is unambiguous: this device has
 * never had a user edit for that section, so the account's copy should win.
 */
let signedIn = false;
export function setPrefsSyncSignedIn(v: boolean) {
  signedIn = v;
}

/**
 * Local edit times per section, so newest-wins has a local clock to compare.
 *
 * Recorded when a section's storage key is written by the app (see
 * startPrefsSync), NOT when sync itself writes it — a sync-write is not a user
 * edit, and treating it as one would let a device keep winning forever.
 *
 * The key lives in storage.ts's KEYS (as does the owner key below) so that
 * "Clear local data" wipes it with everything else. It used to be a string
 * literal here, which survived the wipe: the next sync then compared a fresh,
 * empty section against edit timestamps from data that no longer existed and
 * happily declared this device the winner.
 */
function readTouches(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(SYNC_TOUCH_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function recordTouch(section: string) {
  try {
    const all = readTouches();
    all[section] = Date.now();
    window.localStorage.setItem(SYNC_TOUCH_KEY, JSON.stringify(all));
  } catch {
    // best-effort: a missing touch time degrades to "prefer local", not to loss
  }
}

const SECTIONS: Section<unknown>[] = [
  section<PrayerSettings>({
    name: "prayerSettings",
    keys: [STORAGE_KEYS.prayerSettings],
    read: getPrayerSettings,
    write: (m) => setPrayerSettings(m),
    merge: preferNewest,
    union: false,
  }),
  section<NotificationPrefs>({
    name: "notificationPrefs",
    keys: [STORAGE_KEYS.notifications],
    read: getNotificationPrefs,
    write: (m) => setNotificationPrefs(m),
    merge: preferNewest,
    union: false,
  }),
  section<Bookmark[]>({
    name: "bookmarks",
    keys: [STORAGE_KEYS.bookmarks],
    read: getBookmarks,
    write: (m) => replaceBookmarks(m),
    merge: mergeBookmarks,
    union: true,
    reapplyRemovals: reapplyBookmarkRemovals,
  }),
  section<ReadingProgress>({
    name: "readingProgress",
    keys: [STORAGE_KEYS.progress],
    read: getProgress,
    write: (m) => replaceProgress(m),
    merge: mergeProgress,
    union: true,
  }),
  section<KidsProgress>({
    name: "kidsProgress",
    keys: [STORAGE_KEYS.kidsProgress],
    read: getKidsProgress,
    write: (m) => updateKidsProgress(m),
    merge: mergeKids,
    union: true,
  }),
];

const BY_NAME = new Map(SECTIONS.map((s) => [s.name, s]));

/**
 * The last value this device and the server are known to have agreed on, per
 * section. Feeds reapplyRemovals — see reapplyBookmarkRemovals for why a union
 * needs it. In memory only: it is evidence about THIS run, and a stale one
 * across restarts would delete things rather than merely fail to.
 */
const reconciled = new Map<string, unknown>();

type RemoteSection = { data?: unknown; updatedAt?: string };
type RemoteSections = Record<string, RemoteSection>;

async function fetchRemote(): Promise<RemoteSections> {
  // maybeSingle: no row is the normal first-sync case, not an error.
  const { data, error } = await supabase.from("user_prefs").select("sections").maybeSingle();
  if (error) throw error;
  const sections = (data?.sections ?? {}) as unknown;
  // The column is `not null default '{}'`, but a hand-edited row (or a future
  // shape change) must not take the whole sync down with a spread of a scalar.
  return asRecord(sections) as RemoteSections;
}

async function pushSection(name: string, data: unknown): Promise<void> {
  const { error } = await supabase.rpc("set_pref_section", {
    p_section: name,
    p_data: data,
    p_updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

function buildCtx(
  s: Section<unknown>,
  remote: RemoteSection | undefined,
  touches: Record<string, number>
): MergeCtx {
  const remoteAt = Date.parse(remote?.updatedAt ?? "");
  return {
    // Any of the section's keys being present means this device has written it.
    localWritten: s.keys.some(rawPresent),
    localTouchedAt: touches[s.name] ?? 0,
    remoteUpdatedAt: Number.isNaN(remoteAt) ? 0 : remoteAt,
  };
}

/** Write merged data locally without it counting as a user edit. */
function applyLocally(s: Section<unknown>, merged: unknown): void {
  applyingRemote = true;
  try {
    s.write(merged);
  } finally {
    // Reset in a finally: a throw from write() must not leave the flag stuck
    // on, which would silently disable touch-recording for the whole session.
    applyingRemote = false;
  }
}

// ── Serialisation ───────────────────────────────────────────────────────────

/**
 * One server conversation at a time.
 *
 * supabase-js re-emits SIGNED_IN on session recovery and on refocus, so the
 * sign-in sync fires on essentially every app foreground; the debounced pushes
 * fire independently. Both are read-modify-write over one row, so overlapping
 * runs can interleave a stale read with a fresh write — sending, for example, a
 * bookmark union computed before another run's addition landed. Queuing them is
 * enough: these are five small RPCs, never a hot path.
 */
let queue: Promise<unknown> = Promise.resolve();
function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

/**
 * How long a full sign-in sync stays "already done" for the same user.
 *
 * Without it, every foreground pays a fetch plus five RPCs. The cost is not
 * only network: a push re-stamps the section's updatedAt, so the server clock
 * would drift from "when the user last edited this" towards "when this phone
 * was last opened" — and newest-wins then hands the argument to whichever
 * device was opened most recently rather than whichever was edited last.
 * (Skipping equal pushes fixes most of that; this stops the rest.)
 */
const MIN_SYNC_INTERVAL_MS = 60_000;
let lastSyncUser: string | null = null;
let lastSyncAt = 0;

// ── Account ownership ───────────────────────────────────────────────────────

function readOwner(): string | null {
  try {
    return window.localStorage.getItem(SYNC_OWNER_KEY);
  } catch {
    return null;
  }
}

function writeOwner(userId: string): void {
  try {
    window.localStorage.setItem(SYNC_OWNER_KEY, userId);
  } catch {
    // best effort — worst case is a redundant clear on the next account switch
  }
}

/**
 * Forget the previous account's synced state before merging a different one.
 *
 * Sign-out leaves everything in localStorage. Sign in as somebody else on the
 * same device — a shared family phone, a support session, a tester — and the
 * merge treats the FIRST account's bookmarks, kids progress and prayer settings
 * as this device's own opinion: it unions them into the second account and
 * pushes them there, permanently. Nothing about that is recoverable from the
 * second account's side, so the keys go before a single merge runs.
 *
 * Only the synced keys and the sync bookkeeping — the rest of storage (theme,
 * font size, home layout) is genuinely per-device and nobody's private data.
 */
function clearPreviousAccountState(): void {
  try {
    for (const s of SECTIONS) for (const k of s.keys) window.localStorage.removeItem(k);
    // The touch map is per-account too: keeping it would let the previous
    // owner's edit times decide newest-wins for the new owner's data.
    window.localStorage.removeItem(SYNC_TOUCH_KEY);
    window.localStorage.removeItem(SYNC_OWNER_KEY);
  } catch {
    // ignore — an unavailable localStorage means there is nothing to leak
  }
  reconciled.clear();
}

// ── Dependents of a merged preference ───────────────────────────────────────

/**
 * The three notification preferences that are ALSO columns on `profiles`,
 * because the send routes read the columns, not this device's localStorage.
 */
const MIRRORED_PUSH_PREFS: { key: keyof NotificationPrefs; rpc: string }[] = [
  { key: "circleChat", rpc: "set_my_circle_push" },
  { key: "duaPush", rpc: "set_my_dua_push" },
  { key: "reengagementPush", rpc: "set_my_reengagement_push" },
];

/**
 * Re-mirror any of the three remote-push flags the merge changed.
 *
 * These are the only synced settings with a second server-side copy. The merge
 * can flip one — pulling down "weekly duʿā off" chosen on another device — but
 * the SENDER never looks at user_prefs, so without this the server keeps
 * sending a push the user has already switched off everywhere they can see it.
 * Only changed flags are sent, so the normal foreground sync issues no RPCs.
 *
 * supabase.rpc() resolves errors instead of throwing, so a failure has to be
 * read off `error` or it is lost silently; on failure we hand off to push.ts's
 * dirty flag, which re-asserts the local truth on the next foreground.
 */
async function mirrorPushPrefs(
  before: NotificationPrefs,
  after: NotificationPrefs
): Promise<void> {
  const changed = MIRRORED_PUSH_PREFS.filter((m) => before[m.key] !== after[m.key]);
  if (!changed.length) return;
  let failed = false;
  for (const m of changed) {
    try {
      const { error } = await supabase.rpc(m.rpc, { p_enabled: after[m.key] === true });
      if (error) failed = true;
    } catch {
      failed = true; // network threw before postgrest could answer
    }
  }
  if (failed) {
    try {
      const { markPushPrefsDirty } = await import("@/lib/mobile/push");
      markPushPrefsDirty();
    } catch {
      // push.ts is native-only surface; on web there is nothing to re-assert
    }
  }
}

/**
 * Re-arm everything that was computed from the OLD preference values.
 *
 * Merging the account's real settings into storage is only half the job: the
 * local notification schedule was built at app start from the previous values,
 * and the widgets render from a blob published into the App Group. Neither
 * re-reads storage on its own. So pulling down a user's actual Hanafi madhhab
 * fixed the Asr time shown in the app while the ADHAN kept firing at the old
 * Shafiʿi time, and the Lock Screen kept showing it, until the next cold start
 * — which is the headline failure this whole feature exists to prevent, still
 * present after the fix. Settings screens already do exactly this on a user
 * edit (SettingsScreen.updatePrayer, NotificationsScreen.updateNotif).
 *
 * Dynamically imported so this module stays free of the native plugins on web:
 * a static import would pull @capacitor/local-notifications into every bundle
 * that touches auth. Both functions no-op off-native, so no platform check is
 * needed here.
 *
 * promptIfNeeded stays FALSE: this runs on sign-in, in the background, and a
 * permission dialog with no user action behind it is both baffling and a wasted
 * one-shot prompt.
 */
async function rearmPreferenceDependents(
  prayerChanged: boolean,
  notifChanged: boolean
): Promise<void> {
  if (prayerChanged || notifChanged) {
    try {
      const { scheduleAllNotifications } = await import("@/lib/mobile/notifications");
      await scheduleAllNotifications(false);
    } catch (e) {
      console.error("[prefsSync] could not re-arm notifications after merge", e);
    }
  }
  // Widgets render prayer times and the streak; notification toggles are not an
  // input to that payload, so only a prayer-settings change forces a republish.
  if (prayerChanged) {
    try {
      const { syncWidgetData } = await import("@/lib/mobile/widgets");
      await syncWidgetData({ force: true });
    } catch (e) {
      console.error("[prefsSync] could not refresh widget data after merge", e);
    }
  }
}

// ── Sign-in sync ────────────────────────────────────────────────────────────

/**
 * Pull the account's copy, merge it into local, push the result back.
 *
 * Call on sign-in with the id of the user who just signed in. Merging BOTH ways
 * in a single pass is what makes the first sign-in on a new phone safe:
 * whatever the device already had survives (someone who bookmarked things
 * before signing in keeps them), and whatever the account held appears. The
 * push afterwards is what puts a previously local-only install onto the server
 * for the first time.
 *
 * Sections are independent — one failure must not stop the rest — so each is
 * caught on its own. Failures log and retry on the next sign-in rather than
 * surfacing: a preference that syncs late does not deserve a modal.
 */
export async function syncPrefsOnSignIn(userId: string): Promise<void> {
  if (typeof window === "undefined" || !userId) return;
  // Callers fire-and-forget, so anything that escapes the per-section catches
  // (a rejection from the shared queue, say) would surface as an unhandled
  // rejection — noise in a crash reporter for something the next foreground
  // retries anyway.
  return runExclusive(() => runSignInSync(userId)).catch((e) => {
    console.error("[prefsSync] sign-in sync failed", e);
  });
}

async function runSignInSync(userId: string): Promise<void> {
  // supabase-js re-emits SIGNED_IN on token refresh and on session recovery, so
  // this is called on essentially every foreground. Nothing local changes in
  // between that the debounced push has not already sent.
  if (lastSyncUser === userId && Date.now() - lastSyncAt < MIN_SYNC_INTERVAL_MS) return;

  const previousOwner = readOwner();
  if (previousOwner && previousOwner !== userId) clearPreviousAccountState();
  // Claimed BEFORE the merge, not after: a crash or a killed app mid-merge must
  // not leave the previous owner recorded, or the next sign-in would wipe the
  // state we just merged for this user.
  writeOwner(userId);

  let remote: RemoteSections;
  try {
    remote = await fetchRemote();
  } catch (e) {
    // Leave lastSyncAt alone so the next foreground retries instead of waiting
    // out the interval on a sync that never happened.
    console.error("[prefsSync] could not read account prefs", e);
    return;
  }

  const touches = readTouches();
  const prayerBefore = getPrayerSettings();
  const notifBefore = getNotificationPrefs();

  for (const s of SECTIONS) {
    try {
      const local = s.read();
      const ctx = buildCtx(s, remote[s.name], touches);
      let merged = s.merge(local, remote[s.name]?.data, ctx);
      if (s.reapplyRemovals) {
        merged = s.reapplyRemovals(merged, local, reconciled.get(s.name));
      }
      if (!deepEqual(merged, local)) applyLocally(s, merged);
      // Skip a push that would change nothing. Beyond the wasted round-trip, a
      // no-op push re-stamps updatedAt, turning the server's "when this was last
      // edited" into "when this phone was last opened" — which is the value
      // newest-wins compares against.
      if (
        mayPublish(ctx, remote[s.name] !== undefined) &&
        !deepEqual(merged, remote[s.name]?.data)
      ) {
        await pushSection(s.name, merged);
      }
      reconciled.set(s.name, merged);
    } catch (e) {
      console.error(`[prefsSync] section "${s.name}" failed`, e);
    }
  }

  const prayerAfter = getPrayerSettings();
  const notifAfter = getNotificationPrefs();
  await mirrorPushPrefs(notifBefore, notifAfter);
  await rearmPreferenceDependents(
    !deepEqual(prayerBefore, prayerAfter),
    !deepEqual(notifBefore, notifAfter)
  );

  lastSyncUser = userId;
  lastSyncAt = Date.now();
}

// ── Live pushes ─────────────────────────────────────────────────────────────

/**
 * Send one section's local change to the account.
 *
 * ⭐ A union section can NEVER be pushed raw. set_pref_section replaces the
 * whole section, so pushing this device's bookmark list overwrites the
 * account's — deleting every bookmark that only exists on another phone, which
 * is precisely the loss mergeBookmarks was written to prevent. Saving one
 * bookmark on a new phone would have wiped the other phone's entire library.
 * So union sections take the same pull-merge-write-push path as sign-in; the
 * extra read is the price of the guarantee.
 *
 * preferNewest sections have no such hazard: the whole point is that one side
 * wins outright, and this device's value IS the newest — the user just typed
 * it. The RPC's own updatedAt guard drops it if the server somehow has newer.
 */
async function pushLocalChange(s: Section<unknown>): Promise<void> {
  if (!s.union) {
    const local = s.read();
    await pushSection(s.name, local);
    reconciled.set(s.name, local);
    return;
  }
  const remote = await fetchRemote();
  const touches = readTouches();
  const local = s.read();
  const ctx = buildCtx(s, remote[s.name], touches);
  let merged = s.merge(local, remote[s.name]?.data, ctx);
  if (s.reapplyRemovals) {
    merged = s.reapplyRemovals(merged, local, reconciled.get(s.name));
  }
  if (!deepEqual(merged, local)) applyLocally(s, merged);
  // Same guard as the sign-in path — though a debounced push almost always
  // follows a real edit (which sets localWritten), so this is belt and braces.
  if (
    mayPublish(ctx, remote[s.name] !== undefined) &&
    !deepEqual(merged, remote[s.name]?.data)
  ) {
    await pushSection(s.name, merged);
  }
  reconciled.set(s.name, merged);
}

function schedulePush(s: Section<unknown>): void {
  void runExclusive(() => pushLocalChange(s)).catch((e) =>
    console.error(`[prefsSync] push "${s.name}" failed`, e)
  );
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
    // Recorded even while signed out — see setPrefsSyncSignedIn.
    recordTouch(s.name);
    // ...but only a signed-in device has anywhere to push it.
    if (!signedIn) return;
    const pending = timers.get(s.name);
    if (pending) clearTimeout(pending);
    timers.set(
      s.name,
      setTimeout(() => {
        timers.delete(s.name);
        schedulePush(s);
      }, 1500)
    );
  };

  window.addEventListener(STORAGE_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener(STORAGE_CHANGED_EVENT, onChange);
    // FLUSH, never discard. A pending timer holds an edit the user has already
    // made — a bookmark they deleted, a madhhab they changed — and clearing it
    // drops that edit permanently while the UI shows it as saved. The next sync
    // then merges the SERVER's older copy back in and the change appears to
    // undo itself. Teardown here is a React effect re-running, not the process
    // ending, so the push has ample time to land.
    for (const [name, t] of timers) {
      clearTimeout(t);
      const s = BY_NAME.get(name);
      if (s && signedIn) schedulePush(s);
    }
    timers.clear();
  };
}
