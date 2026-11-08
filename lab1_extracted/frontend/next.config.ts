import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/leduytai/baitap1',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
