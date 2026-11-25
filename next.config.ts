import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    minimumCacheTTL: 60,
  },
  // Alias dari spesifikasi desain; route kanonik tetap /jobs (sudah terindeks).
  async redirects() {
    return [{ source: "/web3-jobs", destination: "/jobs", permanent: true }];
  },
};

export default nextConfig;
