import { getStoreConfig, getCategories } from '@/lib/store'
import { headers } from 'next/headers'
import { CartProvider } from '@/components/store/CartProvider'
import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { ModoHeader } from '@/components/store/modo/ModoHeader'
import { ModoFooter } from '@/components/store/modo/ModoFooter'
import { AthleticHeader } from '@/components/store/athletic/AthleticHeader'
import { AthleticFooter } from '@/components/store/athletic/AthleticFooter'
import { DealershipHeader } from '@/components/store/dealership/DealershipHeader'
import { DealershipFooter } from '@/components/store/dealership/DealershipFooter'
import { LibreriaHeader } from '@/components/store/libreria/LibreriaHeader'
import { LibreriaFooter } from '@/components/store/libreria/LibreriaFooter'
import { RealEstateHeader } from '@/components/store/real-estate/RealEstateHeader'
import { RealEstateFooter } from '@/components/store/real-estate/RealEstateFooter'
import { PageEnter } from '@/components/store/motion'
import { getSiteFeatures } from '@/lib/site-features'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreConfig()
  return {
    title: { default: store.meta_title ?? store.name, template: `%s — ${store.name}` },
    description: store.meta_description ?? undefined,
    icons: store.favicon_url ? { icon: store.favicon_url } : undefined,
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  // El middleware inyecta x-user-id cuando hay sesión activa.
  // Leer de headers elimina el roundtrip a Supabase Auth en cada page load de la tienda.
  const [h, store, categories] = await Promise.all([
    headers(),
    getStoreConfig(),
    getCategories(),
  ])
  const userLoggedIn = Boolean(h.get('x-user-id'))
  const isModo = store.site_type === 'modo'
  const isAthletic = store.site_type === 'athletic'
  const isDealership = store.site_type === 'dealership'
  const isLibreria = store.site_type === 'libreria'
  const isRealEstate = store.site_type === 'real-estate'
  const isVendlyMarketing = store.site_type === 'vendly-marketing'
  const features = getSiteFeatures(store.site_type)

  const cssVars = `
    :root {
      --color-primary:   ${store.color_primary};
      --color-secondary: ${store.color_secondary};
      --color-accent:    ${store.color_accent};
      --color-bg:        ${store.color_background};
      --color-text:      ${store.color_text};
    }
  `

  // La marketing page de Vendly tiene su propio navbar/footer embebido
  if (isVendlyMarketing) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
        {children}
      </>
    )
  }

  const pageContent = (
    <div className="flex min-h-screen flex-col"
      style={{ backgroundColor: store.color_background, color: store.color_text }}>
      {isModo
        ? <ModoHeader store={store} categories={categories} userLoggedIn={userLoggedIn} features={features} />
        : isAthletic
        ? <AthleticHeader store={store} categories={categories} userLoggedIn={userLoggedIn} features={features} />
        : isDealership
        ? <DealershipHeader store={store} categories={categories} userLoggedIn={userLoggedIn} features={features} />
        : isLibreria
        ? <LibreriaHeader store={store} categories={categories} userLoggedIn={userLoggedIn} features={features} />
        : isRealEstate
        ? <RealEstateHeader store={store} categories={categories} userLoggedIn={userLoggedIn} features={features} />
        : <Header store={store} categories={categories} userLoggedIn={userLoggedIn} features={features} />
      }
      <main className="flex-1">
        <PageEnter>{children}</PageEnter>
      </main>
      {isModo
        ? <ModoFooter store={store} categories={categories} />
        : isAthletic
        ? <AthleticFooter store={store} categories={categories} />
        : isDealership
        ? <DealershipFooter store={store} categories={categories} />
        : isLibreria
        ? <LibreriaFooter store={store} categories={categories} />
        : isRealEstate
        ? <RealEstateFooter store={store} categories={categories} />
        : <Footer store={store} categories={categories} />
      }
    </div>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      {features.hasCart ? <CartProvider>{pageContent}</CartProvider> : pageContent}
    </>
  )
}
