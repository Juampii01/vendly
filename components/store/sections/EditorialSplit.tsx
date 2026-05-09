import Image from 'next/image'
import Link from 'next/link'
import type { EditorialSplitContent } from '@/types'
import type { SectionContext } from './types'

const SPLIT_FALLBACK = 'https://images.unsplash.com/photo-1520975916090-cfc2acebb9b8?w=1200&q=85'

interface Props { content: EditorialSplitContent; ctx: SectionContext }

export function EditorialSplitSection({ content, ctx }: Props) {
  const { store } = ctx
  const src     = content.imageUrl ?? store.home_split_image_url ?? SPLIT_FALLBACK
  const eyebrow = content.eyebrow ?? store.home_editorial_label
  const title   = content.title   ?? store.home_editorial_title
  const body    = content.body    ?? store.home_editorial_body
  const ctaUrl  = content.ctaUrl  ?? '/productos'
  const ctaLbl  = content.ctaLabel ?? 'Explorar colección'

  if (!title && !body && !eyebrow) return null

  const imageRight = content.imagePosition === 'right'

  const objectPosition = store.home_split_image_position || 'center'
  const imagePanel = (
    <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
      <Image src={src} alt="Editorial" fill sizes="50vw" className="object-cover"
        style={{ objectPosition }} />
    </div>
  )
  const textPanel = (
    <div className="flex flex-col justify-center px-10 py-16 md:px-14 lg:px-20"
      style={{ backgroundColor: store.color_primary }}>
      {eyebrow && (
        <p className="text-[8px] font-bold uppercase tracking-[0.5em] mb-6"
          style={{ color: store.color_accent ?? `${store.color_background}50` }}>
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="font-black uppercase leading-[0.9] mb-7"
          style={{ color: store.color_background, fontSize: 'clamp(2.2rem, 5vw, 4rem)', letterSpacing: '-0.02em' }}>
          {title}
        </h2>
      )}
      {body && (
        <p className="text-sm leading-relaxed mb-10 max-w-sm" style={{ color: `${store.color_background}55` }}>
          {body}
        </p>
      )}
      <Link href={ctaUrl}
        className="inline-block self-start px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-85"
        style={{ backgroundColor: store.color_background, color: store.color_primary }}>
        {ctaLbl}
      </Link>
    </div>
  )

  return (
    <section className="grid md:grid-cols-2" style={{ minHeight: '560px' }}>
      {imageRight ? <>{textPanel}{imagePanel}</> : <>{imagePanel}{textPanel}</>}
    </section>
  )
}
