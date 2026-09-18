import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['canvas'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // Naye Vercel Turbopack system ke liye
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: false,
      }
    }
  }
};

export default nextConfig;