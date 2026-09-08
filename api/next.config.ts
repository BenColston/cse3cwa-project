import type { NextConfig } from "next";

const corsHeaders = [
  {
    key: "Access-Control-Allow-Origin",
    value: "*",
  },
  {
    key: "Access-Control-Allow-Methods",
    value: "GET, POST, PUT, DELETE, OPTIONS",
  },
  {
    key: "Access-Control-Allow-Headers",
    value: "Content-Type, Authorization",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: corsHeaders,
      },
    ];
  },
};

export default nextConfig;
