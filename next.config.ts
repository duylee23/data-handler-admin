import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/user/:path*',
        destination: 'http://localhost:8081/api/user/:path*',
      },
      {
        source: '/api/project/:path*',
        destination: 'http://localhost:8081/api/project/:path*',
      },
      {
        source: '/api/script/:path*',
        destination: 'http://localhost:8081/api/script/:path*',
      },
      {
        source: '/api/group/:path*',
        destination: 'http://localhost:8081/api/group/:path*',
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
