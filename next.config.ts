import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["www.notion.so", "notion.so"],
  },
};

export default nextConfig;
