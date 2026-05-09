'use client'

import { useRef } from 'react'

/**
 * Click-to-set picker para `object-position` de imágenes hero/split.
 *
 * Antes: las fotos cargadas se renderizaban con object-position center, así
 * que para retratos verticales o productos altos quedaba "cortado en la
 * cintura". El cliente reportó: "me quedan la mayoria enfocando las
 * cinturas para abajo".
 *
 * Ahora: el admin clickea sobre el preview → el sistema guarda la posición
 * como string CSS ("X% Y%") → en el storefront se aplica como
 * `object-position`. La imagen se re-encuadra para mantener ese punto
 * visible cuando el contenedor es más chico que el aspect ratio nativo.
 *
 * El value es un string CSS válido:
 *   - "center" (default — y comportamiento legacy)
 *   - "top" / "bottom" / "left" / "right"
 *   - "X% Y%" (ej: "50% 30%" = enfoca un poquito arriba del centro)
 *
 * Uso:
 *   <FocalPointPicker imageUrl={form.hero_image_url} value={form.hero_image_position}
 *     onChange={(v) => set('hero_image_position', v)} aspect="16/9" />
 */
interface Props {
  imageUrl: string
  value: string
  onChange: (v: string) => void
  /** CSS aspect-ratio del preview. Default "16/9" */
  aspect?: string
  /** Hint debajo del componente */
  hint?: string
}

// Convierte el value a coords (0-100). "center" → {x:50, y:50}, "top" → {x:50, y:0}, etc.
function valueToCoords(v: string): { x: number; y: number } {
  const trimmed = (v || 'center').trim().toLowerCase()
  // Match "X% Y%"
  const pctMatch = trimmed.match(/^(\d{1,3})%\s+(\d{1,3})%$/)
  if (pctMatch) {
    return { x: Math.min(100, Number(pctMatch[1])), y: Math.min(100, Number(pctMatch[2])) }
  }
  // Keywords
  switch (trimmed) {
    case 'top':         return { x: 50, y: 0 }
    case 'bottom':      return { x: 50, y: 100 }
    case 'left':        return { x: 0, y: 50 }
    case 'right':       return { x: 100, y: 50 }
    case 'top left':    return { x: 0, y: 0 }
    case 'top right':   return { x: 100, y: 0 }
    case 'bottom left': return { x: 0, y: 100 }
    case 'bottom right':return { x: 100, y: 100 }
    default:            return { x: 50, y: 50 }   // center
  }
}

export function FocalPointPicker({ imageUrl, value, onChange, aspect = '16/9', hint }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const coords = valueToCoords(value)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    onChange(`${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`)
  }

  function reset() {
    onChange('center')
  }

  // Presets visuales (atajos comunes)
  const presets: Array<{ label: string; pos: string; coords: { x: number; y: number } }> = [
    { label: 'Cara',   pos: '50% 25%',  coords: { x: 50, y: 25 } },
    { label: 'Centro', pos: 'center',   coords: { x: 50, y: 50 } },
    { label: 'Arriba', pos: 'top',      coords: { x: 50, y: 0  } },
    { label: 'Abajo',  pos: 'bottom',   coords: { x: 50, y: 100 } },
  ]

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        Punto focal de la imagen
      </p>

      {/* Click-to-set preview */}
      <div
        ref={ref}
        onClick={handleClick}
        className="relative rounded-xl overflow-hidden border border-slate-200 cursor-crosshair group"
        style={{ aspectRatio: aspect, backgroundColor: '#f1f5f9' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Preview"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: value || 'center' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />

        {/* Cross-hair indicator del punto actual */}
        <div className="absolute pointer-events-none transition-all duration-150"
          style={{
            left: `${coords.x}%`,
            top: `${coords.y}%`,
            transform: 'translate(-50%, -50%)',
          }}>
          {/* Outer ring */}
          <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 0 12px rgba(0,0,0,0.4)' }}>
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>

        {/* Hover overlay con tip */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-3 pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Click para enfocar
          </span>
        </div>
      </div>

      {/* Presets + reset + valor actual */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {presets.map(p => {
          const isActive = Math.abs(coords.x - p.coords.x) < 2 && Math.abs(coords.y - p.coords.y) < 2
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(p.pos)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white border border-slate-900'
                  : 'border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
              }`}>
              {p.label}
            </button>
          )
        })}
        <button
          type="button"
          onClick={reset}
          className="ml-auto text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors">
          ↺ reset
        </button>
        <code className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
          {value || 'center'}
        </code>
      </div>

      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
