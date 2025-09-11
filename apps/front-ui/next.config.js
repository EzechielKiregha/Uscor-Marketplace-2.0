/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
