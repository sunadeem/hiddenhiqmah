import { NextRequest } from "next/server";
import { requireAdmin, adminJson, corsPreflight } from "@/lib/admin-auth";
import {
  overviewSection,
  usersSection,
  askSection,
  engagementSection,
  circlesSection,
  systemSection,
} from "@/lib/admin-sections";

export async function OPTIONS() {
  return corsPreflight();
}

const SECTIONS = {
  overview: overviewSection,
  users: usersSection,
  ask: askSection,
  engagement: engagementSection,
  circles: circlesSection,
  system: systemSection,
} as const;

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const section = String(auth.body.section ?? "overview") as keyof typeof SECTIONS;
  const handler = SECTIONS[section];
  if (!handler) return adminJson({ error: "Unknown section" }, 400);

  try {
    const data = await handler(auth.supa);
    return adminJson(data);
  } catch (e) {
    console.error(`[Admin stats:${section}] error:`, e);
    return adminJson({ error: e instanceof Error ? e.message : "Failed to load stats" }, 500);
  }
}
