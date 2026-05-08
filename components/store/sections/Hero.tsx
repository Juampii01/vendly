import Image from 'next/image'
import Link from 'next/link'
import type { HeroSectionContent } from '@/types'
import type { SectionContext } from './types'

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=85'

interface Props { content: HeroSectionContent; ctx: SectionContext }

export function HeroSection({ content, ctx }: Props) {
  const { store } = ctx
  const src      = content.imageUrl ?? store.hero_image_url ?? HERO_FALLBACK
  const eyebrow  = content.eyebrow ?? store.hero_subtitle ?? null
  const title    = content.title ?? store.hero_title
  const primary  = content.primaryCta ?? { label: store.hero_cta_label, url: store.hero_cta_url }
  const align    = content.align ?? 'left'

  const heightClass =
    content.height === 'medium' ? 'h-[60vh] min-h-[450px]'
    : content.height === 'tall' ? 'h-[80vh] min-h-[550px]'
    : 'h-screen min-h-[600px]'

  const overlay = content.overlay ?? 'gradient-bottom'

  return (
    <section className={`relative w-full overflow-hidden ${heightClass}`}>
      <Image src={src} alt={title} fill priority sizes="100vw" className="object-cover object-center" />

      {overlay === 'gradient-bottom' && (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
      )}
      {overlay === 'gradient-left' && (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)' }} />
      )}
      {overlay === 'dark' && <div className="absolute inset-0 bg-black/45" />}

      <div className={`absolute inset-0 flex flex-col justify-end pb-12 md:pb-16 px-6 md:px-12 lg:px-20 ${align === 'center' ? 'items-center text-center' : ''}`}>
        <div className={align === 'center' ? 'max-w-3xl' : 'max-w-2xl'}>
          {eyebrow && (
            <p className="mb-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.35em] text-white/60">
              {eyebrow}
            </p>
          )}
          <h1 className="mb-8 font-black uppercase leading-[0.88] text-white"
            style={{ fontSize: 'clamp(3rem, 9vw, 8rem)', letterSpacing: 'var(--heading-tracking, -0.03em)' }}>
            {title}
          </h1>
          <div className={`flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
            <Link href={primary.url}
              className="inline-block px-9 py-3.5 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-85"
              style={{ backgroundColor: store.color_background, color: store.color_primary }}>
              {primary.label}
            </Link>
            {content.secondaryCta && (
              <Link href={content.secondaryCta.url}
                className="inline-block px-9 py-3.5 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border border-white/30 text-white transition-colors hover:bg-white/10">
                {content.secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
