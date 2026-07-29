import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Seeded catalog advocates
      { protocol: "https", hostname: "randomuser.me", pathname: "/api/**" },
      // Clerk profile images for real accounts — without these every
      // signed-up user's avatar 400s through /_next/image.
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
};

export default nextConfig;
