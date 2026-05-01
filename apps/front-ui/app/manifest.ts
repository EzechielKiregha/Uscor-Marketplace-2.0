import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Uscor Marketplace',
    short_name: 'Uscor',
    description: 'A marketplace for local businesses to sell their products online.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0070f3',
    icons: [
      {
        src: '/icons/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}