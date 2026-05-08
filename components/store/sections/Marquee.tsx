import type { MarqueeSectionContent } from '@/types'
import type { SectionContext } from './types'

interface Props { content: MarqueeSectionContent; ctx: SectionContext }

export function MarqueeSection({ content, ctx }: Props) {
  const { store } = ctx
  const items = content.items?.length
    ? content.items
    : (store.home_marquee_items?.length
        ? store.home_marquee_items
        : ['Nueva colección', store.name.toUpperCase(), 'Envío a todo el país'])

  const bgColor =
    content.background === 'primary'   ? store.color_primary
    : content.background === 'secondary' ? store.color_secondary
    : content.background === 'text'    ? store.color_text
    : store.color_accent
  const textColor = content.background === 'primary' ? store.color_background : '#fff'

  const speedSec = content.speed === 'slow' ? 38 : content.speed === 'fast' ? 16 : 24

  return (
    <div className="overflow-hidden py-3" style={{ backgroundColor: bgColor }}>
      <style>{`
        @keyframes vendly-mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .vendly-mq-track{display:flex;width:max-content;animation:vendly-mq ${speedSec}s linear infinite;}
      `}</style>
      <div className="vendly-mq-track">
        {[0, 1].map(i => (
          <span key={i} className="flex shrink-0 items-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em]"
            style={{ color: textColor }}>
            {items.map(t => (
              <span key={t} className="mx-8 flex items-center gap-8">
                {t}
                <span className="w-1 h-1 rounded-full opacity-40" style={{ backgroundColor: textColor }} />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}
