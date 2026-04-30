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
import { RestaurantHeader } from '@/components/store/restaurant/RestaurantHeader'
import { RestaurantFooter } from '@/components/store/restaurant/RestaurantFooter'
import { GymHeader } from '@/components/store/gym/GymHeader'
import { GymFooter } from '@/components/store/gym/GymFooter'
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
  const [h, store, categories] = await Promise.all([
    headers(),
    getStoreConfig(),
    getCategories(),
  ])
  const userLoggedIn = Boolean(h.get('x-user-id'))
  const isModo = store.site_type === 'modo'
  // gym uses athletic site_type + home_editorial_label === 'gym' as marker (until DB migration runs)
  const isGym = store.site_type === 'athletic' && store.home_editorial_label === 'gym'
  const isAthletic = store.site_type === 'athletic' && !isGym
  const isDealership = store.site_type === 'dealership'
  const isLibreria = store.site_type === 'libreria'
  const isRestaurant = store.site_type === 'restaurant'
  const isVendlyMarketing = store.site_type === 'vendly-marketing'
  // real-estate maneja su propio header, footer y sidebar de favoritos internamente
  const isRealEstate = store.site_type === 'real-estate'
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

  // Templates que manejan su propio layout completo
  if (isVendlyMarketing || isRealEstate) {
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
        : isRestaurant
        ? <RestaurantHeader store={store} categories={categories} features={features} />
        : isGym
        ? <GymHeader store={store} categories={categories} userLoggedIn={userLoggedIn} features={features} />
        : <Header store={store} categories={categories} userLoggedIn={userLoggedIn} features={features} />
      }
      <main className="flex-1">
        <PageEnter>{children}</PageEnter>
      </main>
      {isModo
        ? <ModoFooter store={store} categories={categories} features={features} />
        : isAthletic
        ? <AthleticFooter store={store} categories={categories} />
        : isDealership
        ? <DealershipFooter store={store} categories={categories} />
        : isLibreria
        ? <LibreriaFooter store={store} categories={categories} />
        : isRestaurant
        ? <RestaurantFooter store={store} categories={categories} />
        : isGym
        ? <GymFooter store={store} categories={categories} />
        : <Footer store={store} categories={categories} features={features} />
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
