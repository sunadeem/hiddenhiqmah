import type { NextConfig } from "next";

const isMobileBuild = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  ...(isMobileBuild && {
    output: "export",
    images: { unoptimized: true },
  }),
};

export default nextConfig;
