/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['canvas'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  }
};

export default nextConfig;