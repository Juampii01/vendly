import { MetadataRoute } from 'next'
import { getStoreConfig } from '@/lib/store'

// robots.txt depende del store config del subdomain — multi-tenant. No prerenderear.
export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Resolver base_url dinámicamente para soporte multi-tenant.
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  try {
    const store = await getStoreConfig()
    if (store.base_url) baseUrl = store.base_url
  } catch {
    // Si no se puede resolver el store, usamos la env var como fallback.
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/'],
      },
    ],
    sitemap: baseUrl ? `${baseUrl}/sitemap.xml` : undefined,
  }
}
