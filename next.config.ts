import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module; it must not be bundled.
  serverExternalPackages: ["better-sqlite3"],
  // Enables forbidden()/unauthorized() so role violations return real 403s.
  // staleTimes.dynamic: client router keeps dynamic admin segments briefly so
  // back/forward nav is instant; server actions already revalidatePath heavily.
  experimental: {
    authInterrupts: true,
    staleTimes: { dynamic: 30 },
  },
  // `docker build` / `npm run deploy` ships the standalone server.
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
