import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "https://mystay-hg1b.onrender.com";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/docs", destination: `${BACKEND_URL}/docs` },
      { source: "/redoc", destination: `${BACKEND_URL}/redoc` },
      { source: "/openapi.json", destination: `${BACKEND_URL}/openapi.json` },
    ];
  },
};

export default nextConfig;
