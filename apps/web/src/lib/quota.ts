/**
 * Shape returned by the Supabase RPC get_quota_for_today and the 429 body
 * from /api/search.
 */
export type QuotaState = {
  used: number;
  limit: number;
  resetAt: string | null; // ISO timestamp (when oldest counted req rolls off)
  hasBonus: boolean;
};

export type QuotaErrorBody = {
  error: "quota_exceeded";
  quota: QuotaState;
};

/**
 * Human-readable "Xh Ym" time until the quota window rolls over.
 */
export function formatTimeUntilReset(resetAt: string | null): string {
  if (!resetAt) return "soon";
  const diff = new Date(resetAt).getTime() - Date.now();
  if (diff <= 0) return "soon";
  const totalMinutes = Math.ceil(diff / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
