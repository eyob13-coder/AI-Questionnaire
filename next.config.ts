import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.replit.app",
    "*.janeway.replit.dev",
    "*.picard.replit.dev",
    "*.kirk.replit.dev",
    "*.spock.replit.dev",
    "*.riker.replit.dev",
  ],
};

export default nextConfig;
