import { Suspense } from 'react'
import { getStoreConfig, getCategories, getProducts } from '@/lib/store'
import { ProductCard } from '@/components/store/ProductCard'
import { ModoProductCard } from '@/components/store/modo/ModoProductCard'
import { AthleticProductCard } from '@/components/store/athletic/AthleticProductCard'
import { DealershipProductCard } from '@/components/store/dealership/DealershipProductCard'
import { DealershipCatalogPage } from '@/components/store/dealership/DealershipCatalogPage'
import { LibreriaProductCard } from '@/components/store/libreria/LibreriaProductCard'
import { RealEstateProductsPage } from '@/components/store/real-estate/RealEstateProductsPage'
import { ModoProductsPage } from '@/components/store/modo/ModoProductsPage'
import { RestaurantMenuPage } from '@/components/store/restaurant/RestaurantMenuPage'
import { GymCatalogPage } from '@/components/store/gym/GymCatalogPage'
import { AdidasCatalogPage } from '@/components/store/adidas/AdidasCatalogPage'
import { FilterSidebar } from '@/components/store/FilterSidebar'
import { SearchInput } from '@/components/store/SearchInput'
import { FadeUp, StaggerGrid, StaggerItem } from '@/components/store/motion'
import { getSiteFeatures } from '@/lib/site-features'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  searchParams: Promise<{ categoria?: string; busqueda?: string; pagina?: string; tag?: string; featured?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreConfig()
  const label = store.site_type === 'real-estate' ? 'Inmuebles' : 'Productos'
  return { title: `${label} — ${store.name}` }
}

const PER_PAGE = 24

export default async function ProductosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.pagina ?? 1)

  const [store, categories, { products, total }] = await Promise.all([
    getStoreConfig(),
    getCategories(),
    getProducts({
      category_slug: params.categoria,
      search: params.busqueda,
      tag: params.tag,
      featured: params.featured === 'true' ? true : undefined,
      page,
      per_page: PER_PAGE,
    }),
  ])

  const features = getSiteFeatures(store.site_type)
  const totalPages = Math.ceil(total / PER_PAGE)

  // ── Override por slug (flagship custom builds) ────────────────────────────
  // Mismo patrón que app/(store)/page.tsx — Adidas tiene un catálogo dedicado
  // que cae a demo products si la DB está vacía, para mantener coherencia
  // entre home y catálogo en el showcase de portfolio.
  if (store.slug === 'adidas') {
    return (
      <AdidasCatalogPage
        store={store}
        products={products}
        categories={categories}
        params={params}
      />
    )
  }

  // Templates with their own full-page layout (header + footer included)
  if (store.site_type === 'real-estate') {
    return (
      <RealEstateProductsPage
        store={store}
        categories={categories}
        products={products}
        total={total}
        page={page}
        totalPages={totalPages}
        params={params}
      />
    )
  }

  if (store.site_type === 'restaurant') {
    return (
      <RestaurantMenuPage
        store={store}
        categories={categories}
        products={products}
        total={total}
        page={page}
        totalPages={totalPages}
        params={params}
      />
    )
  }

  if (store.site_type === 'dealership') {
    return (
      <DealershipCatalogPage
        store={store}
        categories={categories}
        products={products}
        total={total}
        page={page}
        totalPages={totalPages}
        params={params}
      />
    )
  }

  if (store.site_type === 'athletic' && store.home_editorial_label === 'gym') {
    return (
      <GymCatalogPage
        store={store}
        categories={categories}
        products={products}
        total={total}
        page={page}
        totalPages={totalPages}
        params={params}
      />
    )
  }

  if (store.site_type === 'modo') {
    return (
      <ModoProductsPage
        store={store}
        categories={categories}
        products={products}
        total={total}
        page={page}
        totalPages={totalPages}
        params={params}
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <FadeUp>
        <h1 className="mb-6 text-2xl font-bold">
          {params.categoria
            ? (categories.find((c) => c.slug === params.categoria)?.name ?? 'Productos')
            : 'Todos los productos'}
        </h1>
      </FadeUp>

      {/* Search bar */}
      <div className="mb-6">
        <Suspense>
          <SearchInput defaultValue={params.busqueda} />
        </Suspense>
      </div>

      <div className="flex gap-6">
        {/* Filtros */}
        <Suspense>
          <FilterSidebar
            categories={categories}
            store={store}
            activeCategory={params.categoria}
          />
        </Suspense>

        {/* Grilla */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="py-20 text-center opacity-50">
              <p className="text-lg font-medium">No encontramos productos</p>
              <p className="mt-1 text-sm">Probá con otros filtros o términos de búsqueda</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm opacity-50">
                {total} producto{total !== 1 ? 's' : ''}
              </p>
              <StaggerGrid className={store.site_type === 'libreria'
                ? 'grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'}>
                {products.map((product) => (
                  <StaggerItem key={product.id}>
                    {store.site_type === 'modo'
                      ? <ModoProductCard product={product} store={store} />
                      : store.site_type === 'athletic'
                      ? <AthleticProductCard product={product} store={store} />
                      : store.site_type === 'dealership'
                      ? <DealershipProductCard product={product} store={store} />
                      : store.site_type === 'libreria'
                      ? <LibreriaProductCard product={product} store={store} />
                      : <ProductCard product={product} store={store} />
                    }
                  </StaggerItem>
                ))}
              </StaggerGrid>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <PaginationLink
                      href={buildPageHref(params, page - 1)}
                      store={store}
                      label="← Anterior"
                    />
                  )}
                  <span className="px-3 py-1.5 text-sm opacity-60">
                    {page} / {totalPages}
                  </span>
                  {page < totalPages && (
                    <PaginationLink
                      href={buildPageHref(params, page + 1)}
                      store={store}
                      label="Siguiente →"
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function buildPageHref(
  params: Record<string, string | undefined>,
  targetPage: number,
): string {
  const p = new URLSearchParams()
  if (params.categoria) p.set('categoria', params.categoria)
  if (params.busqueda) p.set('busqueda', params.busqueda)
  p.set('pagina', String(targetPage))
  return `/productos?${p.toString()}`
}

function PaginationLink({
  href,
  label,
  store,
}: {
  href: string
  label: string
  store: Awaited<ReturnType<typeof getStoreConfig>>
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80"
      style={{ backgroundColor: store.color_primary, color: store.color_background }}
    >
      {label}
    </Link>
  )
}
