import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/shang-an",
  assetPrefix: "/shang-an/",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
