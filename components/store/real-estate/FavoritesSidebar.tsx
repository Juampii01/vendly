'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useFavoritesStore } from '@/lib/favorites'
import { formatPrice } from '@/lib/format'
import type { StoreConfig } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  store: StoreConfig
}

export function FavoritesSidebar({ open, onClose, store }: Props) {
  const items = useFavoritesStore((s) => s.items)
  const removeItem = useFavoritesStore((s) => s.removeItem)
  const overlayRef = useRef<HTMLDivElement>(null)
  const ACCENT = store.color_accent

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const whatsappBase = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`
    : null

  function buildWhatsappMsg(names: string[]) {
    const list = names.map((n, i) => `${i + 1}. ${n}`).join('\n')
    return encodeURIComponent(`Hola! Me interesan las siguientes propiedades:\n\n${list}\n\n¿Podría darme más información?`)
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Propiedades guardadas"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <HeartIcon color={ACCENT} />
            <h2 className="font-bold text-gray-900">Mis favoritos</h2>
            {items.length > 0 && (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
                style={{ backgroundColor: ACCENT }}
              >
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="rounded-full bg-gray-50 p-5">
                <HeartIcon color="#d1d5db" size={32} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Sin favoritos todavía</p>
                <p className="text-sm text-gray-400">
                  Guardá las propiedades que te interesan para consultarlas fácilmente.
                </p>
              </div>
              <Link
                href="/productos"
                onClick={onClose}
                className="rounded-full px-6 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ backgroundColor: ACCENT }}
              >
                Ver propiedades
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((property) => {
                const img = property.images?.[0]
                const operacion = property.tags?.find(t => /venta|alquiler/i.test(t))
                const superficie = property.tags?.find(t => /\d+\s*m[²2]/i.test(t))
                const ambientes = property.tags?.find(t => /\d+\s*(amb|ambiente)/i.test(t))

                return (
                  <li
                    key={property.id}
                    className="flex gap-3 rounded-xl border border-gray-100 p-3 hover:border-gray-200 transition-colors"
                  >
                    {/* Imagen */}
                    <Link
                      href={`/productos/${property.slug}`}
                      onClick={onClose}
                      className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                    >
                      {img ? (
                        <Image
                          src={img}
                          alt={property.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">🏠</div>
                      )}
                      {operacion && (
                        <span
                          className="absolute bottom-1 left-1 rounded-sm px-1.5 py-0.5 text-[9px] font-black uppercase text-white"
                          style={{ backgroundColor: ACCENT }}
                        >
                          {operacion}
                        </span>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <Link
                        href={`/productos/${property.slug}`}
                        onClick={onClose}
                        className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 hover:text-gray-700"
                      >
                        {property.name}
                      </Link>

                      <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
                        {ambientes && <span>{ambientes.replace(/^(\d+).*/i, '$1 amb.')}</span>}
                        {superficie && <span>· {superficie}</span>}
                      </div>

                      <p className="text-sm font-black mt-auto" style={{ color: ACCENT }}>
                        {property.price > 0 ? formatPrice(property.price) : 'Consultar'}
                      </p>
                    </div>

                    {/* Eliminar */}
                    <button
                      onClick={() => removeItem(property.id)}
                      className="self-start rounded-full p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                      aria-label="Quitar de favoritos"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer con CTA WhatsApp */}
        {items.length > 0 && whatsappBase && (
          <div className="border-t border-gray-100 p-4 space-y-3">
            <p className="text-xs text-gray-400 text-center">
              Consultá por todas tus propiedades favoritas en un mensaje
            </p>
            <a
              href={`${whatsappBase}?text=${buildWhatsappMsg(items.map(p => p.name))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-black uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: ACCENT }}
            >
              <WhatsAppIcon />
              Consultar por WhatsApp ({items.length})
            </a>
          </div>
        )}
      </aside>
    </>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function HeartIcon({ color = '#CC1F1F', size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}

function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
