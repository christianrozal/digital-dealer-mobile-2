import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['s3.ap-southeast-2.amazonaws.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'digital-dealer-mobile-2-website.vercel.app']
    },
  },
};

export default nextConfig;
