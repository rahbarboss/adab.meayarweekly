import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server ke liye
  serverExternalPackages: ['canvas'],
  
  // Purane Webpack ke liye
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  
  // Naye Turbopack ke liye (FIXED)
  turbopack: {
    resolveAlias: {
      canvas: './empty.js',
    },
  },
};

export default nextConfig;