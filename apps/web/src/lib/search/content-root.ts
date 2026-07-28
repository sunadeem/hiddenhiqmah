import * as fs from "fs";
import * as path from "path";

// Find the @hidden-hiqmah/content workspace package at runtime. Layouts:
//   - dev (pnpm dev from apps/web)    → cwd = apps/web → ../../packages/content
//   - Vercel (Root Directory=apps/web,
//     outputFileTracingRoot=monorepo) → cwd = /var/task → packages/content
//
// Probe both; use whichever has the hadith/ subdirectory we need.
export const CONTENT_ROOT: string = (() => {
  const candidates = [
    path.join(process.cwd(), "packages/content"),       // Vercel
    path.join(process.cwd(), "../../packages/content"), // dev
    path.join(process.cwd(), "../packages/content"),    // safety net
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(path.join(candidate, "hadith"))) {
        return candidate;
      }
    } catch {
      // ignore
    }
  }
  // Fallback — let the per-file fs.readFileSync calls surface the real error
  console.error("[Ask Hiqmah] Could not locate @hidden-hiqmah/content. Tried:", candidates);
  return candidates[0];
})();
