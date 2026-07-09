/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import {
    CacheFirst,
    ExpirationPlugin,
    NetworkFirst,
    PrecacheEntry,
    Serwist,
    SerwistGlobalConfig,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: /^\/(login|worker)(\/.*)?$/,
      handler: new NetworkFirst({
        cacheName: "offline-worker-routes",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 86400 * 30,
          }),
        ],
      }),
    },
    {
      matcher: /\/_next\/data\/.*\/(login|worker)\.json/,
      handler: new NetworkFirst({
        cacheName: "offline-worker-data",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 86400 * 7,
          }),
        ],
      }),
    },
    {
      matcher: /\.public\.blob\.vercel-storage\.com/,
      handler: new CacheFirst({
        cacheName: "product-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 500,
            maxAgeSeconds: 86400 * 7,
          }),
        ],
      }),
    },
    {
      matcher: /\.(png|jpg|jpeg|svg|webp|ico)$/,
      handler: new CacheFirst({
        cacheName: "static-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 86400 * 30,
          }),
        ],
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});
