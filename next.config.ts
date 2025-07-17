import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/user/:path*',
        destination: 'http://localhost:8081/api/user/:path*',
      },
      {
        source: '/script/:path*',
        destination: 'http://localhost:8081/script/:path*',
      },
    ];
  },
};

export default nextConfig;
