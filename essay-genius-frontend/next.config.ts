import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST || "localhost",
      },
      {
        protocol: "https",
        hostname:
          process.env.NEXT_PUBLIC_IMAGE_HOST || "api.essay-genius.local",
      },
    ],
  },
};

export default nextConfig;
