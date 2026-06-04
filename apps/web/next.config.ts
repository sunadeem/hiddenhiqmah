import type { NextConfig } from "next";

const isMobileBuild = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  transpilePackages: ["@hidden-hiqmah/content", "@hidden-hiqmah/ui"],
  ...(isMobileBuild && {
    output: "export",
    images: { unoptimized: true },
  }),
};

export default nextConfig;
