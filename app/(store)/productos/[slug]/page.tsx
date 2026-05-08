import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStoreConfig, getProductBySlug, getRelatedProducts } from '@/lib/store'
import { ProductGallery } from '@/components/store/ProductGallery'
import { AddToCartSection } from '@/components/store/AddToCartSection'
import { ProductCard } from '@/components/store/ProductCard'
import { RealEstatePropertyDetail } from '@/components/store/real-estate/RealEstatePropertyDetail'
import { DealershipVehicleDetail } from '@/components/store/dealership/DealershipVehicleDetail'
import { FadeUp, SlideLeft, SlideRight, StaggerGrid, StaggerItem } from '@/components/store/motion'
import { getSiteFeatures } from '@/lib/site-features'
import { formatPrice } from '@/lib/format'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [store, product] = await Promise.all([getStoreConfig(), getProductBySlug(slug)])
  if (!product) return { title: store.site_type === 'real-estate' ? 'Inmueble no encontrado' : 'Producto no encontrado' }
  return {
    title: product.meta_title ?? `${product.name} — ${store.name}`,
    description: product.meta_description ?? product.description ?? undefined,
    openGraph: { images: product.images[0] ? [{ url: product.images[0] }] : [] },
  }
}

export default async function ProductoPage({ params }: PageProps) {
  const { slug } = await params
  const [[store, product], related] = await Promise.all([
    Promise.all([getStoreConfig(), getProductBySlug(slug)]),
    getProductBySlug(slug).then((p) =>
      p ? getRelatedProducts(p.id, p.category_id) : []
    ),
  ])
  if (!product) notFound()

  // Real-estate uses its own full-page detail with header/footer
  if (store.site_type === 'real-estate') {
    return <RealEstatePropertyDetail product={product} store={store} related={related} />
  }

  // Dealership uses its own premium vehicle detail
  if (store.site_type === 'dealership') {
    return <DealershipVehicleDetail product={product} store={store} related={related} />
  }

  const features = getSiteFeatures(store.site_type)
  const isOnSale = product.compare_at_price !== null && product.compare_at_price > product.price
  const discount = isOnSale
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0
  const qualifiesFreeShipping =
    store.free_shipping_threshold !== null && product.price >= store.free_shipping_threshold

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!
  const hasStock = (product.variants?.length ?? 0) > 0
    ? product.variants!.some((v) => v.is_active && v.stock > 0)
    : true

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.images,
    url: `${baseUrl}/productos/${product.slug}`,
    brand: { '@type': 'Brand', name: store.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: store.currency,
      price: product.price,
      availability: hasStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/productos/${product.slug}`,
      seller: { '@type': 'Organization', name: store.name },
    },
  }

  return (
    <div style={{ backgroundColor: store.color_background, color: store.color_text }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="px-4 pt-6 pb-2 md:px-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-widest opacity-40">
          <Link href="/" className="hover:opacity-100 transition-opacity">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:opacity-100 transition-opacity">Productos</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/productos?categoria=${product.category.slug}`}
                className="hover:opacity-100 transition-opacity">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="opacity-100 font-bold">{product.name}</span>
        </nav>
      </div>

      {/* Grid principal */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-0 px-4 pb-16 md:grid-cols-2 md:gap-12 md:px-8 md:pt-6">

        {/* Galería */}
        <SlideLeft>
          <ProductGallery images={product.images} productName={product.name} store={store} />
        </SlideLeft>

        {/* Info */}
        <SlideRight className="flex flex-col gap-6 pt-8 md:pt-0 md:sticky md:top-20 md:self-start">

          {/* Categoría */}
          {product.category && (
            <Link href={`/productos?categoria=${product.category.slug}`}
              className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-40 transition-opacity hover:opacity-80">
              {product.category.name}
            </Link>
          )}

          {/* Nombre */}
          <h1 className="text-3xl font-black uppercase leading-tight tracking-tight md:text-4xl">
            {product.name}
          </h1>

          {/* Precio */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black">{formatPrice(product.price, store.currency, store.locale)}</span>
            {isOnSale && (
              <>
                <span className="text-base line-through opacity-30">
                  {formatPrice(product.compare_at_price!, store.currency, store.locale)}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold text-white"
                  style={{ backgroundColor: store.color_accent }}>
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Descripción */}
          {product.description && (
            <p className="text-sm leading-relaxed opacity-60 border-t border-b py-5"
              style={{ borderColor: `${store.color_text}12` }}>
              {product.description}
            </p>
          )}

          {/* Variantes + carrito */}
          <AddToCartSection product={product} store={store} features={features} />

          {/* Envío gratis */}
          {qualifiesFreeShipping && (
            <div className="flex items-center gap-3 border px-4 py-3"
              style={{ borderColor: `${store.color_accent}40` }}>
              <span className="text-lg">🚚</span>
              <p className="text-xs font-semibold" style={{ color: store.color_accent }}>
                Este producto califica para envío gratis
              </p>
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {['Pago seguro', 'Cambios hasta 30 días', 'Envío a todo el país'].map((b) => (
              <span key={b} className="border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-40"
                style={{ borderColor: `${store.color_text}20` }}>
                {b}
              </span>
            ))}
          </div>
        </SlideRight>
      </div>

      {/* Productos relacionados */}
      {related.length > 0 && (
        <section className="border-t px-4 py-16 md:px-8"
          style={{ borderColor: `${store.color_text}10` }}>
          <FadeUp>
            <h2 className="mb-8 text-xl font-black uppercase tracking-tight md:text-2xl">
              También te puede gustar
            </h2>
          </FadeUp>
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} store={store} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}

    </div>
  )
}

