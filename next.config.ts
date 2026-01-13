import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/sheet-viewer',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
