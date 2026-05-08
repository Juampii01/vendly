import Link from 'next/link'
import { ProductCard } from '@/components/store/ProductCard'
import type { FeaturedProductsContent } from '@/types'
import type { SectionContext } from './types'

interface Props { content: FeaturedProductsContent; ctx: SectionContext }

export function FeaturedProductsSection({ content, ctx }: Props) {
  const { store, featured, all } = ctx
  const source = (content.source ?? 'featured') === 'featured' ? featured : all
  const max    = content.maxItems ?? 8
  const items  = source.slice(0, max)
  if (!items.length) return null

  const cols = content.columns ?? 4
  const gridCols =
    cols === 2 ? 'grid-cols-2'
    : cols === 3 ? 'grid-cols-2 md:grid-cols-3'
    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

  return (
    <section className="mx-auto px-4 md:px-8 py-20" style={{ maxWidth: 'var(--container-max, 1440px)' }}>
      <div className="flex items-end justify-between mb-10">
        <div>
          {content.eyebrow && (
            <p className="text-[8px] font-bold uppercase tracking-[0.4em] mb-2 opacity-30">{content.eyebrow}</p>
          )}
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.04em]">
            {content.title ?? 'Destacados'}
          </h2>
        </div>
        <Link href={content.ctaUrl ?? '/productos'}
          className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-40 hover:opacity-100 transition-opacity"
          style={{ color: store.color_text }}>
          {content.ctaLabel ?? 'Ver todos'} →
        </Link>
      </div>
      <div className={`grid gap-x-4 gap-y-12 ${gridCols}`}>
        {items.map(p => <ProductCard key={p.id} product={p} store={store} />)}
      </div>
    </section>
  )
}
