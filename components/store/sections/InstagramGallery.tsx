import Image from 'next/image'
import Link from 'next/link'
import type { InstagramGalleryContent } from '@/types'
import type { SectionContext } from './types'

interface Props { content: InstagramGalleryContent; ctx: SectionContext }

export function InstagramGallerySection({ content, ctx }: Props) {
  const { store, all } = ctx
  const max   = content.maxItems ?? 6
  const items = all.filter(p => p.images?.length > 0).slice(0, max)
  if (items.length < 3) return null   // No mostrar galería pobre

  const igHandle = store.instagram_url
    ? store.instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\/?/, '').replace(/\/$/, '')
    : null
  const fallbackTitle = igHandle ? `@${igHandle}` : 'Nuestras prendas'
  const title = content.title ?? fallbackTitle

  return (
    <section className="px-4 py-16 md:px-8 mx-auto" style={{ maxWidth: 'var(--container-max, 1440px)' }}>
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] opacity-40">
          {content.eyebrow ?? 'Galería'}
        </p>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          {store.instagram_url ? (
            <a href={store.instagram_url} target="_blank" rel="noopener noreferrer"
              className="transition-opacity hover:opacity-60">
              {title}
            </a>
          ) : title}
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-1.5 md:gap-3 lg:grid-cols-6">
        {items.map(product => (
          <Link key={product.id} href={`/productos/${product.slug}`}
            className="group relative aspect-square overflow-hidden block"
            style={{ backgroundColor: store.color_secondary }}>
            <Image src={product.images[0]} alt={product.name} fill sizes="(max-width:768px) 33vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 flex items-end justify-start p-3 bg-black/0 transition-colors duration-300 group-hover:bg-black/50">
              <p className="translate-y-1 text-[11px] font-bold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
