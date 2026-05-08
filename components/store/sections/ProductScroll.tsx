import Link from 'next/link'
import { ProductCard } from '@/components/store/ProductCard'
import type { ProductScrollContent } from '@/types'
import type { SectionContext } from './types'

interface Props { content: ProductScrollContent; ctx: SectionContext }

export function ProductScrollSection({ content, ctx }: Props) {
  const { store, featured, all } = ctx
  const source = (content.source ?? 'all') === 'featured' ? featured : all
  const max    = content.maxItems ?? 8
  const items  = source.slice(0, max)
  if (!items.length) return null

  const desktopCols   = content.desktopColumns ?? 4
  const desktopGrid   = desktopCols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'
  const desktopSlice  = desktopCols === 3 ? 6 : 8
  const bg            = content.background === 'transparent' ? 'transparent' : `${store.color_text}06`

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: bg }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--container-max, 1440px)' }}>
        <div className="mb-6 flex items-end justify-between px-4 md:px-8">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.04em]">
            {content.title ?? 'Más vendidos'}
          </h2>
          <Link href={content.ctaUrl ?? '/productos'}
            className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-40 hover:opacity-100 transition-opacity"
            style={{ color: store.color_text }}>
            {content.ctaLabel ?? 'Ver todos'} →
          </Link>
        </div>

        {/* Mobile: scroll horizontal */}
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 md:hidden"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {items.map(p => (
            <div key={p.id} className="w-[58vw] shrink-0" style={{ scrollSnapAlign: 'start' }}>
              <ProductCard product={p} store={store} />
            </div>
          ))}
        </div>

        {/* Desktop: grid */}
        <div className={`hidden md:grid grid-cols-3 gap-4 px-8 ${desktopGrid}`}>
          {items.slice(0, desktopSlice).map(p => <ProductCard key={p.id} product={p} store={store} />)}
        </div>
      </div>
    </section>
  )
}
