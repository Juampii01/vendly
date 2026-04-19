import { MetadataRoute } from 'next'
import { getStoreConfig } from '@/lib/store'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const store = await getStoreConfig()

  return {
    name: store.name,
    short_name: store.name,
    description: store.meta_description ?? `Tienda online de ${store.name}`,
    start_url: '/',
    display: 'standalone',
    background_color: store.color_background,
    theme_color: store.color_primary,
    orientation: 'portrait',
    icons: store.favicon_url
      ? [
          { src: store.favicon_url, sizes: '192x192', type: 'image/png' },
          { src: store.favicon_url, sizes: '512x512', type: 'image/png' },
        ]
      : [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
    categories: ['shopping'],
  }
}
