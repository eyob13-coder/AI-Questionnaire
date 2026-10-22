import type { NextConfig } from "next";

const rawBackendUrl =
  process.env.BACKEND_INTERNAL_URL || "http://localhost:4000";
const BACKEND_URL = rawBackendUrl.replace(/\/+$/, "").replace(/\/v1$/, "");

const nextConfig: NextConfig = {
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
