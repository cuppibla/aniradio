/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output produces a minimal Node runtime under .next/standalone/
  // that the Cloud Run Dockerfile copies into the final image. ~10× smaller
  // than shipping the full node_modules + .next.
  output: "standalone",
};

module.exports = nextConfig;
