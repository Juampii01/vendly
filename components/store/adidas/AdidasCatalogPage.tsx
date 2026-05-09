import Image from 'next/image'
import Link from 'next/link'
import type { StoreConfig, Category, Product } from '@/types'
import { ADIDAS_DEMO_PRODUCTS, ADIDAS_CATEGORIES, shouldUseAdidasDemo } from './demo-products'
import type { ShowcaseProduct } from './demo-products'

/**
 * ADIDAS — Flagship catalog page (/productos).
 *
 * Versión catálogo del showcase: si la DB de Adidas no tiene productos con
 * imágenes, cae al mismo set de demo que usa AdidasHomePage para que la
 * experiencia sea coherente entre home y catálogo (un prospect que clickea
 * "Ver todo" desde el home no debería terminar en una vista vacía).
 *
 * Soporta filtro por categoría vía ?categoria=running etc., usando los
 * categorías hardcoded del demo (mismas que aparecen en home).
 */

interface Props {
  store: StoreConfig
  products: Product[]
  categories: Category[]
  params: { categoria?: string; busqueda?: string; tag?: string; featured?: string; pagina?: string }
}

const RED = '#FF3A20'

export function AdidasCatalogPage({ store, products, params }: Props) {
  const useDemoProducts = shouldUseAdidasDemo(products)

  const allItems: ShowcaseProduct[] = useDemoProducts
    ? ADIDAS_DEMO_PRODUCTS
    : products.map(p => ({
        name: p.name.toUpperCase(),
        category: p.category?.name ?? 'Producto',
        price: `$${p.price.toLocaleString('es-AR')}`,
        image: p.images[0],
        badge: p.is_featured ? 'NUEVO' : undefined,
      }))

  const activeCategorySlug = params.categoria ?? null
  const activeCategoryName = activeCategorySlug
    ? ADIDAS_CATEGORIES.find(c => c.slug === activeCategorySlug)?.name ?? null
    : null

  const filteredItems = activeCategoryName
    ? allItems.filter(p => p.category.toLowerCase() === activeCategoryName.toLowerCase())
    : allItems

  const search = params.busqueda?.trim().toLowerCase() ?? ''
  const finalItems = search
    ? filteredItems.filter(p => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search))
    : filteredItems

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#000' }}>
      {/* ════════ HEADER STRIP ═════════════════════════════════════════════ */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 md:py-14">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-black/50">
            Catálogo
          </p>
          <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-5xl lg:text-6xl">
            {activeCategoryName ?? 'TODOS LOS PRODUCTOS'}
          </h1>
          <p className="mt-3 text-sm text-black/60">
            {finalItems.length} {finalItems.length === 1 ? 'producto' : 'productos'}
            {useDemoProducts && (
              <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black/50">
                Showcase
              </span>
            )}
          </p>
        </div>
      </section>

      {/* ════════ CATEGORY PILLS ═══════════════════════════════════════════ */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-[1440px] overflow-x-auto px-6 py-4 md:px-12">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <CategoryPill
              href="/productos"
              label="Todos"
              active={!activeCategorySlug}
            />
            {ADIDAS_CATEGORIES.map(cat => (
              <CategoryPill
                key={cat.slug}
                href={`/productos?categoria=${cat.slug}`}
                label={cat.name}
                active={activeCategorySlug === cat.slug}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════ GRID ═════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 md:py-14">
        {finalItems.length === 0 ? (
          <div className="border border-dashed border-black/15 py-24 text-center">
            <p className="text-base font-semibold">No encontramos productos</p>
            <p className="mt-2 text-sm text-black/50">
              Probá con otra categoría
            </p>
            <Link
              href="/productos"
              className="mt-6 inline-block border border-black px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors hover:bg-black hover:text-white"
            >
              Ver todos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {finalItems.map((p, i) => (
              <CatalogCard key={`${p.name}-${i}`} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ════════ NEWSLETTER CTA STRIP ═════════════════════════════════════ */}
      <section className="border-t border-black/10 bg-black px-6 py-16 text-white md:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: RED }}>
              Nuevos drops
            </p>
            <h2 className="text-3xl font-black uppercase leading-tight tracking-tight md:text-4xl">
              ¿NO ENCONTRASTE LO TUYO?
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Te avisamos primero cuando lleguen los próximos.
            </p>
          </div>
          <Link
            href="/contacto"
            className="inline-block px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-black transition-opacity hover:opacity-80"
            style={{ backgroundColor: RED, color: '#fff' }}
          >
            Avisame
          </Link>
        </div>
      </section>
    </div>
  )
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function CategoryPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`shrink-0 border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${
        active
          ? 'border-black bg-black text-white'
          : 'border-black/15 text-black/70 hover:border-black hover:text-black'
      }`}
    >
      {label}
    </Link>
  )
}

function CatalogCard({ product }: { product: ShowcaseProduct }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-black/5">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span
            className="absolute left-3 top-3 px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-white"
            style={{ backgroundColor: RED }}
          >
            {product.badge}
          </span>
        )}
      </div>
      <div className="mt-3 px-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">
          {product.category}
        </p>
        <p className="mt-0.5 text-sm font-bold uppercase tracking-tight text-black">
          {product.name}
        </p>
        <p className="mt-1 text-sm font-semibold text-black">{product.price}</p>
      </div>
    </div>
  )
}
