'use client'

import { useState } from 'react'
import Image from 'next/image'

import type { StoreConfig } from '@/types'

interface ProductGalleryProps {
  images: string[]
  productName: string
  store: StoreConfig
}

export function ProductGallery({ images, productName, store }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full flex items-center justify-center opacity-20"
        style={{ backgroundColor: `${store.color_secondary}30` }}>
        <PlaceholderIcon />
      </div>
    )
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row-reverse">
      {/* Thumbnails — vertical en desktop, horizontal en mobile */}
      {images.length > 1 && (
        <div className="order-2 flex gap-2 overflow-x-auto md:order-none md:flex-col md:overflow-x-visible md:overflow-y-auto">
          {images.map((src, idx) => (
            <button key={idx} onClick={() => setActive(idx)}
              className={`relative shrink-0 overflow-hidden transition-opacity ${
                active === idx ? 'opacity-100 ring-1 ring-current' : 'opacity-40 hover:opacity-70'
              }`}
              style={{ width: 64, height: 80 }}
              aria-label={`Imagen ${idx + 1}`}>
              <Image src={src} alt={`${productName} ${idx + 1}`} fill sizes="64px"
                className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Imagen principal */}
      <div className="relative flex-1 overflow-hidden cursor-zoom-in select-none"
        style={{ backgroundColor: `${store.color_secondary}30`, aspectRatio: '3/4' }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}>
        <Image src={images[active]} alt={productName} fill priority={active === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          draggable={false}
          className={`object-cover transition-transform duration-200 ${zoomed ? 'scale-150' : 'scale-100'}`}
          style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}} />

        {/* Navegación en mobile */}
        {images.length > 1 && (
          <>
            <button onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center backdrop-blur-sm md:hidden text-sm font-bold"
              style={{ backgroundColor: `${store.color_background}CC`, color: store.color_text }}
              aria-label="Anterior">
              ‹
            </button>
            <button onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center backdrop-blur-sm md:hidden text-sm font-bold"
              style={{ backgroundColor: `${store.color_background}CC`, color: store.color_text }}
              aria-label="Siguiente">
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
              {images.map((_, idx) => (
                <button key={idx} onClick={() => setActive(idx)}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: active === idx ? 16 : 6,
                    backgroundColor: active === idx ? store.color_accent : `${store.color_accent}60`,
                  }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PlaceholderIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}
