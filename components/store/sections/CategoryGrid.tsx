import Image from 'next/image'
import Link from 'next/link'
import type { CategoryGridContent, Category, StoreConfig } from '@/types'
import type { SectionContext } from './types'

interface Props { content: CategoryGridContent; ctx: SectionContext }

export function CategoryGridSection({ content, ctx }: Props) {
  const { store, categories } = ctx
  if (!categories.length) return null

  const max     = content.maxItems ?? 6
  const items   = categories.slice(0, max)
  const layout  = content.layout ?? 'bento'
  const title   = content.title ?? 'Categorías'
  const ctaUrl  = content.ctaUrl ?? '/productos'
  const ctaLbl  = content.ctaLabel ?? 'Ver todo'

  return (
    <section className="mx-auto px-4 md:px-8 pt-16 pb-4" style={{ maxWidth: 'var(--container-max, 1440px)' }}>
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.04em]" style={{ color: store.color_text }}>
          {title}
        </h2>
        <Link href={ctaUrl}
          className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-40 hover:opacity-100 transition-opacity"
          style={{ color: store.color_text }}>
          {ctaLbl} →
        </Link>
      </div>

      {layout === 'uniform' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(c => <CategoryCard key={c.id} cat={c} store={store} ratio="3/4" titleSize="text-lg md:text-2xl" sizes="(max-width:768px) 50vw, 25vw" />)}
        </div>
      ) : (
        // bento: 1 grande / 2 / 3+ smart layout (extraído de AthleticHomePage)
        <>
          {items.length === 1 && (
            <CategoryCard cat={items[0]} store={store} ratio="21/9" titleSize="text-4xl md:text-6xl" sizes="100vw" />
          )}
          {items.length === 2 && (
            <div className="grid grid-cols-2 gap-3">
              {items.map(c => <CategoryCard key={c.id} cat={c} store={store} ratio="3/4" titleSize="text-2xl md:text-4xl" sizes="50vw" />)}
            </div>
          )}
          {items.length >= 3 && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <CategoryCard cat={items[0]} store={store} ratio="4/3" titleSize="text-3xl md:text-5xl" sizes="66vw" />
                </div>
                <div className="col-span-1">
                  <CategoryCard cat={items[1]} store={store} ratio="4/3" titleSize="text-xl md:text-3xl" sizes="33vw" />
                </div>
              </div>
              {items.length > 2 && (
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(items.length - 2, 4)}, 1fr)` }}>
                  {items.slice(2, 6).map(c => (
                    <CategoryCard key={c.id} cat={c} store={store} ratio="4/3" titleSize="text-lg md:text-2xl" sizes="25vw" />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

function CategoryCard({ cat, store, ratio, titleSize, sizes }: {
  cat: Category; store: StoreConfig; ratio: string; titleSize: string; sizes: string
}) {
  const hasImage = !!cat.image_url
  return (
    <Link href={`/productos?categoria=${cat.slug}`}
      className="group relative block overflow-hidden w-full"
      style={{ aspectRatio: ratio }}>
      <div className="absolute inset-0">
        {hasImage ? (
          <Image src={cat.image_url!} alt={cat.name} fill sizes={sizes}
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: store.color_primary }}>
            <p className={`${titleSize} font-black uppercase text-center leading-none px-4`}
              style={{ color: `${store.color_background}12`, letterSpacing: '-0.02em' }}>
              {cat.name}
            </p>
          </div>
        )}
      </div>
      <div className="absolute inset-0 transition-opacity duration-400"
        style={{ background: hasImage ? 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 55%)' : 'rgba(0,0,0,0)' }} />
      <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: store.color_accent ?? store.color_background }} />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
        <p className={`${titleSize} font-black uppercase text-white leading-none`}>{cat.name}</p>
        <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/0 group-hover:text-white/50 transition-colors duration-300">
          Ver colección →
        </p>
      </div>
    </Link>
  )
}
