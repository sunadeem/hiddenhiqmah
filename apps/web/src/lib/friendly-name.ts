/**
 * A short, friendly first name for feeds, nudges, and push notifications.
 *
 * Magic-link signups have no name metadata, so migration 006 defaults
 * `display_name` to the email local part (e.g. "subhan.s.nadeem") — which reads
 * as a username, not a name. This derives the friendly first name ("Subhan")
 * from whatever `display_name` holds: it strips an email domain if one slipped
 * in, takes the first token (split on space / dot / underscore), and capitalises
 * it. Real display names ("Subhan Nadeem") are unaffected beyond rendering just
 * the first name; empty or missing values fall back to `fallback`.
 *
 * Kept PURE and dependency-free (no imports) so it's safe to use from server
 * routes — e.g. the /api/push/circle-message route builds a push title with it —
 * as well as from browser code (lib/circles.ts re-exports it for the activity
 * feed). Do NOT import the browser Supabase client here.
 */
export function friendlyName(raw: string | null | undefined, fallback = "Someone"): string {
  const base = (raw ?? "").trim();
  if (!base) return fallback;
  const local = base.includes("@") ? base.slice(0, base.indexOf("@")) : base;
  const first = local.split(/[\s._]+/).filter(Boolean)[0] ?? "";
  if (!first) return fallback;
  return first.charAt(0).toUpperCase() + first.slice(1);
}
