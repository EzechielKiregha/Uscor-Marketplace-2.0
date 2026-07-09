import withSerwist from "@serwist/next";
import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "msgv9mjjuhaiuo1b.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {},
};

// 👇 FIRST configure Serwist
const withSerwistConfig = withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

// 👇 THEN wrap Next config
export default withSerwistConfig(nextConfig);