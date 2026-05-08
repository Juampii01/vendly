import { formatPrice } from '@/lib/format'
import type { TrustBarContent, TrustBarItem } from '@/types'
import type { SectionContext } from './types'
import { TrustIcon } from './icons'

interface Props { content: TrustBarContent; ctx: SectionContext }

export function TrustBarSection({ content, ctx }: Props) {
  const { store } = ctx
  const items = content.items?.length ? content.items : defaultItems(store)
  const layout = content.layout ?? 'border'

  if (layout === 'cards') {
    return (
      <section className="px-4 py-12 mx-auto" style={{ maxWidth: 'var(--container-max, 1440px)' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map(item => (
            <div key={item.title} className="flex flex-col items-center text-center gap-3 py-8 px-6 rounded-lg"
              style={{ backgroundColor: `${store.color_text}06`, color: store.color_text }}>
              <div className="opacity-30"><TrustIcon name={item.icon} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">{item.title}</p>
                <p className="text-[10px] mt-0.5 opacity-50">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="border-t border-b" style={{ borderColor: `${store.color_text}08` }}>
      <div className="mx-auto grid grid-cols-2 md:grid-cols-4 divide-x"
        style={{ maxWidth: 'var(--container-max, 1440px)' }}>
        {items.map(item => (
          <div key={item.title} className="flex flex-col items-center justify-center text-center gap-3 py-10 px-6"
            style={{ borderColor: `${store.color_text}08` }}>
            <div className="opacity-25" style={{ color: store.color_text }}><TrustIcon name={item.icon} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">{item.title}</p>
              <p className="text-[10px] mt-0.5 opacity-40">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function defaultItems(store: SectionContext['store']): TrustBarItem[] {
  return [
    { icon: 'truck',  title: 'Envío express',  desc: '24hs CABA y GBA' },
    { icon: 'return', title: 'Cambios gratis', desc: 'Hasta 30 días' },
    { icon: 'lock',   title: 'Pago seguro',    desc: 'MercadoPago' },
    {
      icon: 'ship',
      title: 'Envío gratis',
      desc: store.free_shipping_threshold
        ? `+${formatPrice(store.free_shipping_threshold, store.currency, store.locale)}`
        : 'Consultá condiciones',
    },
  ]
}
