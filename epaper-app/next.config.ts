import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['canvas'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // Vercel ke naye Turbopack build system ko shant karne ke liye
  turbopack: {},
};

export default nextConfig;