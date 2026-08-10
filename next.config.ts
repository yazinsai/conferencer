import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module; it must not be bundled.
  serverExternalPackages: ["better-sqlite3"],
  // Enables forbidden()/unauthorized() so role violations return real 403s.
  experimental: {
    authInterrupts: true,
  },
  // `docker build` / `npm run deploy` ships the standalone server.
  output: "standalone",
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
