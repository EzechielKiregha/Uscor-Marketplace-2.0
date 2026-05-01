import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

  withSerwist({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
    cacheOnNavigation: true,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "images.unsplash.com",
          port: "",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "msgv9mjjuhaiuo1b.public.blob.vercel-storage.com",
          port: "",
          pathname: "/**",
        },
      ],
    },
};

export default withSerwist(nextConfig);
