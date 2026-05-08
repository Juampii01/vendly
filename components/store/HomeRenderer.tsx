import type { HomeSection, StoreConfig, Category, Product } from '@/types'
import {
  HeroSection,
  MarqueeSection,
  CategoryGridSection,
  EditorialSplitSection,
  FeaturedProductsSection,
  ProductScrollSection,
  InstagramGallerySection,
  NewsletterSection,
  TrustBarSection,
  type SectionContext,
} from './sections'

interface Props {
  store: StoreConfig
  categories: Category[]
  featured: Product[]
  all: Product[]
  layout: HomeSection[]
}

/**
 * Renderea una home a partir de un array ordenado de HomeSection.
 *
 * El dispatcher es exhaustivo: si agregás un nuevo HomeSectionType en
 * types/index.ts, TypeScript te obliga a manejarlo acá. (Si llega un type
 * desconocido en runtime — porque la DB tiene datos viejos —, se ignora.)
 */
export function HomeRenderer({ store, categories, featured, all, layout }: Props) {
  const ctx: SectionContext = { store, categories, featured, all }
  const active = layout.filter(s => s.active)

  return (
    <div style={{ backgroundColor: store.color_background, color: store.color_text }}>
      {active.map(section => {
        switch (section.type) {
          case 'hero':
            return <HeroSection key={section.id} content={section.content} ctx={ctx} />
          case 'marquee':
            return <MarqueeSection key={section.id} content={section.content} ctx={ctx} />
          case 'categoryGrid':
            return <CategoryGridSection key={section.id} content={section.content} ctx={ctx} />
          case 'editorialSplit':
            return <EditorialSplitSection key={section.id} content={section.content} ctx={ctx} />
          case 'featuredProducts':
            return <FeaturedProductsSection key={section.id} content={section.content} ctx={ctx} />
          case 'productScroll':
            return <ProductScrollSection key={section.id} content={section.content} ctx={ctx} />
          case 'instagramGallery':
            return <InstagramGallerySection key={section.id} content={section.content} ctx={ctx} />
          case 'newsletter':
            return <NewsletterSection key={section.id} content={section.content} ctx={ctx} />
          case 'trustBar':
            return <TrustBarSection key={section.id} content={section.content} ctx={ctx} />
          default: {
            // Exhaustiveness check — si TS rompe acá es que falta un case
            const _exhaustive: never = section
            return null
          }
        }
      })}
    </div>
  )
}
