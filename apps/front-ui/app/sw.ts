/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

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
    // Cache worker dashboard and login routes for offline access
    {
      urlPattern: /^\/(login|worker)(\/.*)?$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offline-worker-routes",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 86400 * 30, // 30 days
        },
        networkTimeoutSeconds: 5,
      },
    },
    // Cache Next.js page data for worker/login routes
    {
      urlPattern: /\/_next\/data\/.*\/(login|worker)\.json/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offline-worker-data",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 86400 * 7, // 7 days
        },
        networkTimeoutSeconds: 5,
      },
    },
    // Cache product images from Vercel Blob
    {
      urlPattern: /\.public\.blob\.vercel-storage\.com/,
      handler: "CacheFirst",
      options: {
        cacheName: "product-images",
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 86400 * 7, // 7 days
        },
      },
    },
    // Cache static assets
    {
      urlPattern: /\.(png|jpg|jpeg|svg|webp|ico)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 * 30, // 30 days
        },
      },
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

// Listen for sync trigger messages from the app
self.addEventListener("message", (event) => {
  if (event.data?.type === "TRIGGER_SYNC") {
    // Forward to all clients to trigger their sync engines
    self.clients.matchAll().then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: "TRIGGER_SYNC" });
      }
    });
  }
});

// Background Sync API (where supported)
self.addEventListener("sync", (event: any) => {
  if (event.tag === "sync-offline-sales") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: "TRIGGER_SYNC" });
        }
      }),
    );
  }
});

serwist.addEventListeners();
