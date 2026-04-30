'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import Link from 'next/link'
import { DealershipProductCard } from './DealershipProductCard'
import type { StoreConfig, Category, Product } from '@/types'

interface Props {
  store: StoreConfig
  categories: Category[]
  products: Product[]
  total: number
  page: number
  totalPages: number
  params: { categoria?: string; busqueda?: string; pagina?: string; tag?: string }
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc'
type Condition = 'all' | '0km' | 'usado'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default',    label: 'Relevancia'            },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'year-desc',  label: 'Año: más nuevo'         },
  { value: 'year-asc',   label: 'Año: más antiguo'       },
]

function getYear(p: Product): number {
  return Number(p.tags?.find(t => /^\d{4}$/.test(t)) ?? 0)
}
function getFuel(p: Product): string | undefined {
  return p.tags?.find(t => /^(nafta|diesel|híbrido|eléctrico|gnc)$/i.test(t))?.toLowerCase()
}
function getTrans(p: Product): string | undefined {
  return p.tags?.find(t => /^(manual|automático|automática|cvt)$/i.test(t))?.toLowerCase()
}

export function DealershipCatalogPage({ store, categories, products, total, page, totalPages, params }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const ACCENT = store.color_accent

  // ── Client-side filter state ──────────────────────────────────────────────
  const [sort, setSort]           = useState<SortKey>('default')
  const [condition, setCondition] = useState<Condition>('all')
  const [fuels, setFuels]         = useState<string[]>([])
  const [transmissions, setTrans] = useState<string[]>([])
  const [sidebarOpen, setSidebar] = useState(false)

  // ── Derived filter options from loaded products ──────────────────────────
  const availableFuels = useMemo(() => {
    const s = new Set<string>()
    products.forEach(p => { const f = getFuel(p); if (f) s.add(f) })
    return Array.from(s).sort()
  }, [products])

  const availableTrans = useMemo(() => {
    const s = new Set<string>()
    products.forEach(p => { const t = getTrans(p); if (t) s.add(t) })
    return Array.from(s).sort()
  }, [products])

  // ── Client-side filter + sort ─────────────────────────────────────────────
  const displayed = useMemo(() => {
    let arr = [...products]
    if (condition === '0km')   arr = arr.filter(p => p.tags?.some(t => /^(0\s*km|nuevo)$/i.test(t)))
    if (condition === 'usado') arr = arr.filter(p => p.tags?.some(t => /^usado$/i.test(t)))
    if (fuels.length)          arr = arr.filter(p => { const f = getFuel(p); return f && fuels.includes(f) })
    if (transmissions.length)  arr = arr.filter(p => { const t = getTrans(p); return t && transmissions.includes(t) })
    if (sort === 'price-asc')  arr.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') arr.sort((a, b) => b.price - a.price)
    if (sort === 'year-desc')  arr.sort((a, b) => getYear(b) - getYear(a))
    if (sort === 'year-asc')   arr.sort((a, b) => getYear(a) - getYear(b))
    return arr
  }, [products, condition, fuels, transmissions, sort])

  const activeFilters = (condition !== 'all' ? 1 : 0) + fuels.length + transmissions.length

  // ── URL navigation ────────────────────────────────────────────────────────
  const handleSearch = useDebouncedCallback((val: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (val) p.set('busqueda', val); else p.delete('busqueda')
    p.delete('pagina')
    startTransition(() => router.push(`${pathname}?${p.toString()}`))
  }, 300)

  function buildCatHref(slug?: string) {
    const p = new URLSearchParams()
    if (slug) p.set('categoria', slug)
    if (params.busqueda) p.set('busqueda', params.busqueda)
    return `/productos?${p.toString()}`
  }

  function buildPageHref(n: number) {
    const p = new URLSearchParams()
    if (params.categoria) p.set('categoria', params.categoria)
    if (params.busqueda)  p.set('busqueda',  params.busqueda)
    p.set('pagina', String(n))
    return `/productos?${p.toString()}`
  }

  const activeCategory = params.categoria
    ? categories.find(c => c.slug === params.categoria) ?? null
    : null

  function toggleFuel(f: string) {
    setFuels(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }
  function toggleTrans(t: string) {
    setTrans(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }
  function clearAll() {
    setCondition('all'); setFuels([]); setTrans([])
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#050508' }}>
        <div className="mx-auto max-w-7xl px-6 md:px-10 pt-14 pb-0">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8 text-[10px] uppercase tracking-[0.25em]"
            style={{ color: 'rgba(255,255,255,0.28)' }}>
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span style={{ color: ACCENT }}>Vehículos</span>
            {activeCategory && (
              <><span>/</span><span className="text-white">{activeCategory.name}</span></>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-10">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-3" style={{ color: ACCENT }}>
                {activeCategory ? 'Segmento' : 'Catálogo completo'}
              </p>
              <h1 className="font-black uppercase leading-none text-white"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', letterSpacing: '-0.04em' }}>
                {activeCategory?.name ?? 'Todos los modelos'}
              </h1>
              <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {displayed.length !== total
                  ? `${displayed.length} de ${total} vehículos`
                  : `${total} ${total === 1 ? 'vehículo disponible' : 'vehículos disponibles'}`}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80 shrink-0">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.3)" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="search" defaultValue={params.busqueda}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Buscar modelo, año, motor..."
                className="w-full py-3.5 pl-11 pr-4 text-sm outline-none text-white placeholder:text-white/25"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-end overflow-x-auto scrollbar-none border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <CatTab href={buildCatHref()} label="Todos" active={!params.categoria} accent={ACCENT} />
            {categories.map(cat => (
              <CatTab key={cat.id} href={buildCatHref(cat.slug)}
                label={cat.name} active={params.categoria === cat.slug} accent={ACCENT} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ FILTER TOOLBAR ═══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 bg-white shadow-sm" style={{ borderBottom: '1px solid #e8ecf0' }}>
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-3 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebar(o => !o)}
              className="md:hidden flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] border transition-colors"
              style={sidebarOpen
                ? { backgroundColor: ACCENT, color: '#fff', borderColor: ACCENT }
                : { borderColor: '#e2e8f0', color: '#475569' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
              </svg>
              Filtros{activeFilters > 0 && ` (${activeFilters})`}
            </button>

            {/* Condition pills */}
            <div className="hidden md:flex items-center gap-1.5">
              {(['all', '0km', 'usado'] as Condition[]).map(c => (
                <button key={c} onClick={() => setCondition(c)}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] transition-all"
                  style={condition === c
                    ? { backgroundColor: ACCENT, color: '#fff' }
                    : { backgroundColor: '#f1f5f9', color: '#64748b' }}>
                  {c === 'all' ? 'Todos' : c === '0km' ? '0 km' : 'Usados'}
                </button>
              ))}
            </div>

            {/* Active filter chips */}
            {activeFilters > 0 && (
              <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                {fuels.map(f => (
                  <span key={f} className="flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white"
                    style={{ backgroundColor: ACCENT }}>
                    {f}
                    <button onClick={() => toggleFuel(f)} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
                  </span>
                ))}
                {transmissions.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white"
                    style={{ backgroundColor: ACCENT }}>
                    {t}
                    <button onClick={() => toggleTrans(t)} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
                  </span>
                ))}
                <button onClick={clearAll}
                  className="text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors">
                  Limpiar
                </button>
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:block text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              Ordenar:
            </span>
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
              className="text-[10px] font-semibold text-slate-700 outline-none py-1.5 px-3 cursor-pointer"
              style={{ backgroundColor: '#f1f5f9', border: 'none' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ══ MAIN LAYOUT ══════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-10 flex gap-8">

        {/* ── SIDEBAR — desktop ──────────────────────────────────────────────── */}
        <aside className="hidden md:block w-60 shrink-0 self-start sticky top-[57px]">
          <div className="space-y-6">

            {/* Condición */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-3" style={{ color: ACCENT }}>
                Condición
              </p>
              <div className="space-y-2">
                {([['all', 'Todos'], ['0km', '0 km'], ['usado', 'Usados']] as [Condition, string][]).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="w-4 h-4 shrink-0 flex items-center justify-center transition-colors"
                      style={{
                        border: `2px solid ${condition === val ? ACCENT : '#cbd5e1'}`,
                        backgroundColor: condition === val ? ACCENT : 'transparent',
                      }}
                      onClick={() => setCondition(val)}>
                      {condition === val && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors"
                      onClick={() => setCondition(val)}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Combustible */}
            {availableFuels.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-3" style={{ color: ACCENT }}>
                  Combustible
                </p>
                <div className="space-y-2">
                  {availableFuels.map(f => (
                    <label key={f} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => toggleFuel(f)}>
                      <div className="w-4 h-4 shrink-0 flex items-center justify-center transition-colors"
                        style={{
                          border: `2px solid ${fuels.includes(f) ? ACCENT : '#cbd5e1'}`,
                          backgroundColor: fuels.includes(f) ? ACCENT : 'transparent',
                        }}>
                        {fuels.includes(f) && (
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors capitalize">
                        {f}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Transmisión */}
            {availableTrans.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-3" style={{ color: ACCENT }}>
                  Transmisión
                </p>
                <div className="space-y-2">
                  {availableTrans.map(t => (
                    <label key={t} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => toggleTrans(t)}>
                      <div className="w-4 h-4 shrink-0 flex items-center justify-center transition-colors"
                        style={{
                          border: `2px solid ${transmissions.includes(t) ? ACCENT : '#cbd5e1'}`,
                          backgroundColor: transmissions.includes(t) ? ACCENT : 'transparent',
                        }}>
                        {transmissions.includes(t) && (
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors capitalize">
                        {t}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeFilters > 0 && (
              <button onClick={clearAll}
                className="w-full py-2 text-[9px] font-black uppercase tracking-[0.2em] border transition-colors text-slate-500 hover:text-slate-900 hover:border-slate-400"
                style={{ borderColor: '#e2e8f0' }}>
                Limpiar filtros ({activeFilters})
              </button>
            )}
          </div>
        </aside>

        {/* ── Mobile sidebar drawer ─────────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebar(false)} />
            <div className="relative ml-auto w-72 h-full bg-white overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-black uppercase tracking-wide">Filtros</p>
                <button onClick={() => setSidebar(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Same filters as desktop */}
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-3" style={{ color: ACCENT }}>Condición</p>
                  <div className="space-y-2">
                    {([['all', 'Todos'], ['0km', '0 km'], ['usado', 'Usados']] as [Condition, string][]).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCondition(val)}>
                        <div className="w-4 h-4 shrink-0 flex items-center justify-center"
                          style={{ border: `2px solid ${condition === val ? ACCENT : '#cbd5e1'}`, backgroundColor: condition === val ? ACCENT : 'transparent' }}>
                          {condition === val && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {availableFuels.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-3" style={{ color: ACCENT }}>Combustible</p>
                    <div className="space-y-2">
                      {availableFuels.map(f => (
                        <label key={f} className="flex items-center gap-2.5 cursor-pointer" onClick={() => toggleFuel(f)}>
                          <div className="w-4 h-4 shrink-0 flex items-center justify-center"
                            style={{ border: `2px solid ${fuels.includes(f) ? ACCENT : '#cbd5e1'}`, backgroundColor: fuels.includes(f) ? ACCENT : 'transparent' }}>
                            {fuels.includes(f) && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 capitalize">{f}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {availableTrans.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-3" style={{ color: ACCENT }}>Transmisión</p>
                    <div className="space-y-2">
                      {availableTrans.map(t => (
                        <label key={t} className="flex items-center gap-2.5 cursor-pointer" onClick={() => toggleTrans(t)}>
                          <div className="w-4 h-4 shrink-0 flex items-center justify-center"
                            style={{ border: `2px solid ${transmissions.includes(t) ? ACCENT : '#cbd5e1'}`, backgroundColor: transmissions.includes(t) ? ACCENT : 'transparent' }}>
                            {transmissions.includes(t) && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 capitalize">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => { clearAll(); setSidebar(false) }}
                className="mt-8 w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                style={{ backgroundColor: ACCENT }}>
                Ver resultados ({displayed.length})
              </button>
            </div>
          </div>
        )}

        {/* ── PRODUCT GRID ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {displayed.length === 0 ? (
            <div className="py-32 flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center mb-6"
                style={{ border: '2px solid #e2e8f0' }}>
                <svg width="28" height="28" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                </svg>
              </div>
              <p className="text-2xl font-black uppercase tracking-tight text-slate-800 mb-2">Sin resultados</p>
              <p className="text-sm text-slate-400 mb-8">Probá con otros filtros</p>
              <button onClick={clearAll}
                className="px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                style={{ backgroundColor: ACCENT }}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {displayed.map((p, i) => (
                  <DealershipProductCard key={p.id} product={p} store={store} priority={i < 3} />
                ))}
              </div>

              {/* Server pagination (only when no client filters active) */}
              {activeFilters === 0 && totalPages > 1 && (
                <div className="mt-14 flex items-center justify-center gap-6">
                  {page > 1 && (
                    <Link href={buildPageHref(page - 1)}
                      className="px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-colors hover:border-slate-800 text-slate-500"
                      style={{ borderColor: '#cbd5e1' }}>
                      ← Anterior
                    </Link>
                  )}
                  <span className="text-sm font-bold text-slate-400">{page} / {totalPages}</span>
                  {page < totalPages && (
                    <Link href={buildPageHref(page + 1)}
                      className="px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
                      style={{ backgroundColor: ACCENT }}>
                      Siguiente →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CatTab({ href, label, active, accent }: { href: string; label: string; active: boolean; accent: string }) {
  return (
    <Link href={href}
      className="shrink-0 px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap"
      style={active
        ? { borderColor: accent, color: '#ffffff' }
        : { borderColor: 'transparent', color: 'rgba(255,255,255,0.3)' }
      }>
      {label}
    </Link>
  )
}
