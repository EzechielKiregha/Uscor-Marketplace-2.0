import { NextConfig  } from "next";
import withSerwist  from "@serwist/next";

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
        hostname:
          "msgv9mjjuhaiuo1b.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
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