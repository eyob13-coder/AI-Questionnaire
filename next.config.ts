import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || "http://localhost:3001";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: `${BACKEND_URL}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
