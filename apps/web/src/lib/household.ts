// Local "household" profiles — a family sharing one device. The PRIMARY profile
// ("you") uses the normal daily data (synced when signed in); additional CHILD
// profiles are device-only, each with their own namespaced local daily store.
// This is additive + backward-compatible: with no extra profiles, nothing
// changes (the primary profile === the existing behaviour).

const KEY = "hiqmah-household";
export const PRIMARY_ID = "me";
export const PROFILE_CHANGED_EVENT = "hiqmah:profile-changed";

export type ProfileKind = "adult" | "child";
export type Profile = {
  id: string;
  name: string;
  kind: ProfileKind;
  avatar?: string; // emoji or short initials
  age?: number;
};

type HouseholdStore = { profiles: Profile[]; activeId: string };

const PRIMARY: Profile = { id: PRIMARY_ID, name: "You", kind: "adult" };

function read(): HouseholdStore {
  if (typeof window === "undefined") return { profiles: [], activeId: PRIMARY_ID };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { profiles: [], activeId: PRIMARY_ID };
    const s = JSON.parse(raw) as Partial<HouseholdStore>;
    return { profiles: s.profiles ?? [], activeId: s.activeId ?? PRIMARY_ID };
  } catch {
    return { profiles: [], activeId: PRIMARY_ID };
  }
}

function write(s: HouseholdStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

function emit() {
  try {
    window.dispatchEvent(new CustomEvent(PROFILE_CHANGED_EVENT));
  } catch {
    // non-browser
  }
}

/** All profiles, primary first. */
export function getProfiles(): Profile[] {
  return [PRIMARY, ...read().profiles];
}

export function getActiveProfileId(): string {
  const s = read();
  if (s.activeId !== PRIMARY_ID && !s.profiles.some((p) => p.id === s.activeId)) {
    return PRIMARY_ID; // active profile was removed → fall back to primary
  }
  return s.activeId;
}

export function getActiveProfile(): Profile {
  const id = getActiveProfileId();
  return getProfiles().find((p) => p.id === id) ?? PRIMARY;
}

export function setActiveProfileId(id: string) {
  const s = read();
  s.activeId = id;
  write(s);
  emit();
}

export function addProfile(input: { name: string; kind: ProfileKind; avatar?: string; age?: number }): Profile {
  const s = read();
  const p: Profile = {
    id: `p-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`,
    name: input.name.trim() || "Child",
    kind: input.kind,
    avatar: input.avatar,
    age: input.age,
  };
  s.profiles.push(p);
  write(s);
  emit();
  return p;
}

export function updateProfile(id: string, patch: Partial<Omit<Profile, "id">>) {
  if (id === PRIMARY_ID) return;
  const s = read();
  const i = s.profiles.findIndex((p) => p.id === id);
  if (i < 0) return;
  s.profiles[i] = { ...s.profiles[i], ...patch };
  write(s);
  emit();
}

export function removeProfile(id: string) {
  if (id === PRIMARY_ID) return;
  const s = read();
  s.profiles = s.profiles.filter((p) => p.id !== id);
  if (s.activeId === id) s.activeId = PRIMARY_ID;
  write(s);
  emit();
  // The profile's daily store key is left in localStorage (orphaned) on purpose
  // — we never auto-delete a person's worship data.
}

/**
 * The local daily-store key for a profile. `undefined` = the primary profile,
 * which uses the normal adapter (default local key, or Supabase when signed in).
 */
export function dailyStoreKeyForProfile(id: string): string | undefined {
  return id === PRIMARY_ID ? undefined : `hiqmah-daily-v2:p:${id}`;
}

/**
 * The local Hifz-store key for a profile. `undefined` = the primary profile,
 * which uses the normal adapter (default local key, or Supabase when signed in).
 * Mirrors dailyStoreKeyForProfile so child profiles keep their own device-only
 * memorization progress.
 */
export function hifzStoreKeyForProfile(id: string): string | undefined {
  return id === PRIMARY_ID ? undefined : `hiqmah-hifz-v1:p:${id}`;
}
