import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server ke liye ignore
  serverExternalPackages: ['canvas'],
  
  // Purane Webpack system ke liye ignore
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  
  // Naye Vercel Turbopack system ke liye ignore (Yehi error de raha tha!)
  turbopack: {
    resolveAlias: {
      canvas: false,
    },
  },
};

export default nextConfig;