import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module and must not be bundled by webpack/turbopack.
  serverExternalPackages: ["better-sqlite3"],

  // The e2e suite builds into its own directory so it can run while a dev
  // server is up. Sharing .next means the test build and the dev server's
  // incremental output overwrite each other's manifests, which surfaces as
  // "Unexpected end of JSON input" from the server on unrelated requests.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
