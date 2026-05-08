import { NewsletterForm } from '@/components/store/NewsletterForm'
import type { NewsletterSectionContent } from '@/types'
import type { SectionContext } from './types'

interface Props { content: NewsletterSectionContent; ctx: SectionContext }

export function NewsletterSection({ content, ctx }: Props) {
  const { store } = ctx
  const bg =
    content.background === 'accent' ? store.color_accent
    : content.background === 'subtle' ? store.color_secondary
    : store.color_primary
  const isDark = content.background !== 'subtle'   // texto claro sobre primary/accent

  const eyebrow = content.eyebrow ?? `Comunidad ${store.name}`
  const title   = content.title   ?? 'Primero te enterás vos'
  const body    = content.body    ?? 'Lanzamientos, preventas y descuentos exclusivos. Sin spam.'

  return (
    <section className="px-4 py-24 md:px-8" style={{ backgroundColor: bg }}>
      <div className="max-w-lg mx-auto text-center">
        <p className="text-[8px] font-bold uppercase tracking-[0.5em] mb-5"
          style={{ color: isDark ? (store.color_accent ?? `${store.color_background}45`) : `${store.color_text}55` }}>
          {eyebrow}
        </p>
        <h2 className="font-black uppercase leading-[0.88] mb-4"
          style={{
            color: isDark ? store.color_background : store.color_text,
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            letterSpacing: '-0.02em',
          }}>
          {title}
        </h2>
        <p className="text-sm mb-10 leading-relaxed"
          style={{ color: isDark ? `${store.color_background}55` : `${store.color_text}65` }}>
          {body}
        </p>
        <NewsletterForm store={store} dark={isDark} />
      </div>
    </section>
  )
}
