"use client";

import { useCallback, useEffect, useState } from "react";

export type Creds = { email: string; password1: string; password2: string };

/** POST to an admin endpoint with creds + payload; throws on non-OK. */
export async function postAdmin<T = unknown>(path: string, creds: Creds, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...creds, ...payload }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error || `Failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/** Fetch one dashboard section; re-fetches when creds/section change. */
export function useAdminSection<T>(creds: Creds, section: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await postAdmin<T>("/api/admin/stats", creds, { section });
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [creds, section]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

/** The moderation queue (owned by the shell so the tab badge + tab share one fetch). */
export function useAdminModeration(creds: Creds) {
  const [data, setData] = useState<ModerationQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await postAdmin<ModerationQueue>("/api/admin/moderation", creds, { view: "queue" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [creds]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

// ── Shared response types ───────────────────────────────────────────────────
export type QueueRow = {
  userId: string;
  label: string;
  email: string | null;
  state: string;
  strikes: number;
  suspended: boolean;
  lastReason: string | null;
  lastStrikeAt: string | null;
  openReports: number;
  latestReportAt: string | null;
};
export type ReportFeedItem = {
  id: string;
  reason: string | null;
  createdAt: string;
  circle: string;
  reporter: string;
  author: string;
  authorId: string | null;
  body: string;
  deleted: boolean;
  messageId: string;
};
export type ModerationQueue = {
  generatedAt: string;
  kpis: { openReports: number; suspended: number; struck: number; reports7d: number; strikes7d: number };
  queue: QueueRow[];
  feed: ReportFeedItem[];
};

export type CaseFile = {
  user: { id: string; label: string; email: string | null; joinedAt: string | null; lastSignInAt: string | null };
  moderation: { strikes: number; suspended: boolean; lastReason: string | null; lastStrikeAt: string | null; note: string };
  blockedBy: number;
  circles: { name: string; role: string }[];
  reports: { id: string; reason: string | null; status: string; createdAt: string; resolvedAt: string | null; reporter: string; messageId: string; body: string; deleted: boolean; circle: string }[];
  recentMessages: { id: string; body: string; at: string; deleted: boolean; circle: string }[];
  history: { kind: string; meta: Record<string, unknown>; at: string }[];
};
