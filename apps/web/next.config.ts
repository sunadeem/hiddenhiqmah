import type { NextConfig } from "next";
import path from "path";

const isMobileBuild = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  transpilePackages: ["@hidden-hiqmah/content", "@hidden-hiqmah/ui"],
  // Tell Next's serverless file tracer to look at the monorepo root so it
  // bundles workspace siblings (packages/content/**/*.json in particular).
  // Without this, the deployed /api/search function can't find hadith data.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Explicitly include the content JSON files in the search function bundle.
  // Belt and suspenders — outputFileTracingRoot should cover this, but
  // dynamic fs.readFileSync paths don't always get traced reliably.
  outputFileTracingIncludes: {
    "/api/search/route": [
      "../../packages/content/hadith/**/*.json",
      "../../packages/content/quran/**/*.json",
    ],
  },
  ...(isMobileBuild && {
    output: "export",
    images: { unoptimized: true },
  }),
};

export default nextConfig;
